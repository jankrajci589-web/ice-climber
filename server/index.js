import express from 'express';
import { randomBytes, createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { evaluateLedge } from './math/danger.js';
import { getMultiplier } from './math/multiplier.js';
import { CONFIG } from './math/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const __root = join(__dirname, '..');

const app = express();
app.use(express.json());
app.use(express.static(__root));

const rounds = new Map();

function secureRoll() {
  const buf = randomBytes(4);
  return buf.readUInt32BE(0) / (0xFFFFFFFF + 1);
}

function getDangerIncrement(difficulty) {
  return CONFIG.DIFFICULTIES[difficulty]?.increment ?? CONFIG.DIFFICULTIES.normal.increment;
}

app.post('/round/start', (req, res) => {
  const { betAmount, difficulty = 'normal' } = req.body;
  if (!betAmount || betAmount <= 0) return res.status(400).json({ error: 'Invalid bet amount' });
  const serverSeed = randomBytes(32).toString('hex');
  const serverSeedHash = createHash('sha256').update(serverSeed).digest('hex');
  const roundId = randomBytes(16).toString('hex');
  const dangerIncrement = getDangerIncrement(difficulty);
  rounds.set(roundId, { serverSeed, serverSeedHash, betAmount, difficulty, dangerIncrement, level: 0, active: true, cashedOut: false, rolls: [], createdAt: Date.now() });
  res.json({ roundId, serverSeedHash });
});

app.post('/round/step', (req, res) => {
  const { roundId } = req.body;
  const round = rounds.get(roundId);
  if (!round) return res.status(404).json({ error: 'Round not found' });
  if (!round.active) return res.status(400).json({ error: 'Round already ended' });
  round.level++;
  const roll = secureRoll();
  const { result, danger } = evaluateLedge(round.level, round.dangerIncrement, roll);
  const multiplier = getMultiplier(round.level, round.dangerIncrement);
  round.rolls.push({ level: round.level, roll: +roll.toFixed(6), result });
  if (result === 'crack') round.active = false;
  res.json({ result, level: round.level, multiplier, danger: +danger.toFixed(4) });
});

app.post('/round/cashout', (req, res) => {
  const { roundId } = req.body;
  const round = rounds.get(roundId);
  if (!round) return res.status(404).json({ error: 'Round not found' });
  if (!round.active) return res.status(400).json({ error: 'Round already ended' });
  if (round.level < 1) return res.status(400).json({ error: 'No ledges climbed yet' });
  round.active = false;
  round.cashedOut = true;
  const multiplier = getMultiplier(round.level, round.dangerIncrement);
  const payout = +(round.betAmount * multiplier).toFixed(2);
  res.json({ payout, multiplier, level: round.level, serverSeed: round.serverSeed, rollHistory: round.rolls });
});

app.get('*', (req, res) => {
  res.sendFile(join(__root, 'index.html'));
});

setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, round] of rounds) {
    if (round.createdAt < cutoff) rounds.delete(id);
  }
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Ice Climber server running on port ${PORT}`));

import CONFIG from '../config.js';
import { roll } from './RNG.js';
import GameState from '../state/GameState.js';

export function crackProbability(level) {
  const inc = GameState.dangerIncrement;
  return Math.min(
    CONFIG.STARTING_DANGER + (level - 1) * inc,
    0.95
  );
}

// Returns 'crack' | 'near-miss' | 'safe'
export function evaluateLedge(level) {
  const r = roll();
  const danger = crackProbability(level);
  const nearMissZone = Math.min(danger + 0.07, 0.95);

  if (r < danger) return { result: 'crack', roll: r, danger };
  if (r < nearMissZone) return { result: 'near-miss', roll: r, danger };
  return { result: 'safe', roll: r, danger };
}

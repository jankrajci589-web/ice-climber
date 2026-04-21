import { CONFIG } from './config.js';

const MAX_MULTIPLIER = 999999;
const _cache = new Map();

function _buildTable(inc) {
  const t = [];
  const lossZone = CONFIG.LOSS_ZONE_MULTIPLIERS;
  const breakEvenLevel = lossZone.length + 1;

  let survival = 1.0;
  for (let i = 1; i < breakEvenLevel; i++) {
    const danger = Math.min(CONFIG.STARTING_DANGER + (i - 1) * inc, 0.95);
    survival *= (1 - danger);
  }
  const survivalAtBreakEven = survival;

  survival = 1.0;
  for (let i = 1; i <= CONFIG.MAX_LEDGES; i++) {
    const danger = Math.min(CONFIG.STARTING_DANGER + (i - 1) * inc, 0.95);
    survival *= (1 - danger);
    if (i < breakEvenLevel) {
      t.push(lossZone[i - 1]);
    } else if (survival < 1e-10) {
      t.push(MAX_MULTIPLIER);
    } else {
      const raw = survivalAtBreakEven / survival;
      t.push(+(Math.min(raw, MAX_MULTIPLIER)).toFixed(2));
    }
  }
  return Object.freeze(t);
}

export function getMultiplier(level, dangerIncrement) {
  if (level < 1 || level > CONFIG.MAX_LEDGES) return 1.0;
  if (!_cache.has(dangerIncrement)) _cache.set(dangerIncrement, _buildTable(dangerIncrement));
  return _cache.get(dangerIncrement)[level - 1];
}

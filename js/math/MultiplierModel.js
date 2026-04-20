import CONFIG from '../config.js';
import GameState from '../state/GameState.js';

// Cache tables per increment value
const _cache = new Map();

const MAX_MULTIPLIER = 999999;

function _buildTable(inc) {
  const t = [];
  const lossZone = CONFIG.LOSS_ZONE_MULTIPLIERS;
  const breakEvenLevel = lossZone.length + 1; // level 3

  // Calculate cumulative survival up to the break-even level
  let survival = 1.0;
  for (let i = 1; i < breakEvenLevel; i++) {
    const danger = Math.min(CONFIG.STARTING_DANGER + (i - 1) * inc, 0.95);
    survival *= (1 - danger);
  }
  const survivalAtBreakEven = survival;

  // Reset and build full table
  survival = 1.0;
  for (let i = 1; i <= CONFIG.MAX_LEDGES; i++) {
    const danger = Math.min(CONFIG.STARTING_DANGER + (i - 1) * inc, 0.95);
    survival *= (1 - danger);

    if (i < breakEvenLevel) {
      // Loss zone — fixed multipliers below 1x
      t.push(lossZone[i - 1]);
    } else if (survival < 1e-10) {
      t.push(MAX_MULTIPLIER);
    } else {
      // From break-even level onward: grows from 1.0x based on survival ratio
      const raw = survivalAtBreakEven / survival;
      t.push(+(Math.min(raw, MAX_MULTIPLIER)).toFixed(2));
    }
  }
  return Object.freeze(t);
}

function _getTable() {
  const inc = GameState.dangerIncrement;
  if (!_cache.has(inc)) _cache.set(inc, _buildTable(inc));
  return _cache.get(inc);
}

export function getMultiplier(level) {
  if (level < 1 || level > CONFIG.MAX_LEDGES) return 1.0;
  return _getTable()[level - 1];
}

export function getFullTable() {
  return _getTable();
}

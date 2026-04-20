import { CONFIG } from './config.js';

export function crackProbability(level, dangerIncrement) {
  return Math.min(
    CONFIG.STARTING_DANGER + (level - 1) * dangerIncrement,
    0.95
  );
}

export function evaluateLedge(level, dangerIncrement, roll) {
  const danger = crackProbability(level, dangerIncrement);
  const nearMissZone = Math.min(danger + 0.07, 0.95);

  if (roll < danger)        return { result: 'crack',     danger };
  if (roll < nearMissZone)  return { result: 'near-miss', danger };
  return                           { result: 'safe',      danger };
}

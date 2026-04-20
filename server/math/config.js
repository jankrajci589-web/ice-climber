export const CONFIG = Object.freeze({
  STARTING_DANGER: 0.10,
  MAX_LEDGES: 30,
  HOUSE_EDGE: 0.04,
  LOSS_ZONE_MULTIPLIERS: Object.freeze([0.20, 0.25, 0.50, 0.75]),

  DIFFICULTIES: Object.freeze({
    easy:    { increment: 0.04 },
    normal:  { increment: 0.09 },
    hard:    { increment: 0.30 },
    extreme: { increment: 0.45 },
  }),
});

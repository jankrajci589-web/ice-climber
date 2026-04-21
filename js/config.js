export const CONFIG = Object.freeze({
  STARTING_DANGER: 0.10,
  MAX_LEDGES: 30,
  HOUSE_EDGE: 0.04,
  LOSS_ZONE_MULTIPLIERS: Object.freeze([0.20, 0.25, 0.50, 0.75]),
  LEDGE_WIDTH: 80,
  LEDGE_HEIGHT: 16,
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 720,

  DIFFICULTIES: Object.freeze({
    easy:    { increment: 0.04 },
    normal:  { increment: 0.09 },
    hard:    { increment: 0.30 },
    extreme: { increment: 0.45 },
  }),
});

export default CONFIG;

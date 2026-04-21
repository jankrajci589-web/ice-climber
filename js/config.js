export const CONFIG = Object.freeze({
  STARTING_DANGER: 0.10,
  MAX_LEDGES: 30,
  HOUSE_EDGE: 0.04,
  LOSS_ZONE_MULTIPLIERS: Object.freeze([0.20, 0.25, 0.50, 0.75]),
  LEDGE_WIDTH: 80,
  LEDGE_HEIGHT: 16,
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 720,

  SKINS: Object.freeze({
    default: { key: 'default', bgFar: 'bg-night-far', bgMid: 'bg-night-mid', bgNear: 'bg-night-near' },
    night:   { key: 'night',   bgFar: 'bg-night-far', bgMid: 'bg-night-mid', bgNear: 'bg-night-near' },
    storm:   { key: 'storm',   bgFar: 'bg-storm-far', bgMid: 'bg-storm-mid', bgNear: 'bg-storm-near' },
    sunset:  { key: 'sunset',  bgFar: 'bg-sunset-far', bgMid: 'bg-sunset-mid', bgNear: 'bg-sunset-near' },
  }),

  DIFFICULTIES: Object.freeze({
    easy:    { increment: 0.04 },
    normal:  { increment: 0.09 },
    hard:    { increment: 0.30 },
    extreme: { increment: 0.45 },
  }),
});

export default CONFIG;

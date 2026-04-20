import CONFIG from '../config.js';

export default class Particles {
  constructor(scene) {
    this.scene = scene;
    this._emitter = scene.add.particles(0, 0, 'snowflake', {
      x: { min: 30, max: CONFIG.CANVAS_WIDTH - 30 },
      y: -5,
      speedY: { min: 35, max: 80 },
      speedX: { min: -20, max: 20 },
      lifespan: 5000,
      quantity: 1,
      frequency: 220,
      alpha: { start: 0.75, end: 0 },
      scale: { min: 0.7, max: 1.6 },
      depth: 30,
    });
  }

  setIntensity(level) {
    // Increase snow/wind as player climbs higher
    if (level >= 10) {
      this._emitter.setQuantity(3);
      this._emitter.setFrequency(80);
      this._emitter.ops.speedX.onChange({ min: -50, max: 50 });
    } else if (level >= 5) {
      this._emitter.setQuantity(2);
      this._emitter.setFrequency(140);
      this._emitter.ops.speedX.onChange({ min: -35, max: 35 });
    }
  }

  burst(x, y) {
    this.scene.add.particles(x, y, 'snowflake', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      lifespan: 800,
      quantity: 12,
      alpha: { start: 1, end: 0 },
      scale: { start: 1.5, end: 0.3 },
      depth: 30,
    });
  }

  starBurst(x, y) {
    this.scene.add.particles(x, y, 'star', {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      lifespan: 1000,
      quantity: 15,
      alpha: { start: 1, end: 0 },
      scale: { start: 1.2, end: 0.2 },
      gravityY: 200,
      depth: 30,
    });
  }

  destroy() {
    if (this._emitter) this._emitter.destroy();
  }
}

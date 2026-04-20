import CONFIG from '../config.js';

export default class Avalanche {
  constructor(scene) {
    this.scene = scene;
    this.boulders = [];
  }

  play(onComplete) {
    const W = CONFIG.CANVAS_WIDTH;
    const count = 10 + Math.floor(Math.random() * 6);

    let completed = 0;
    const onBoulderDone = () => {
      completed++;
      if (completed >= count && onComplete) onComplete();
    };

    for (let i = 0; i < count; i++) {
      const x = 30 + Math.random() * (W - 60);
      const delay = i * 80 + Math.random() * 100;
      const scale = 0.8 + Math.random() * 1.4;
      const duration = 800 + Math.random() * 600;

      const boulder = this.scene.add.image(x, -20, 'boulder')
        .setScale(scale)
        .setAlpha(0.9)
        .setDepth(20);

      this.boulders.push(boulder);

      this.scene.tweens.add({
        targets: boulder,
        y: CONFIG.CANVAS_HEIGHT + 40,
        x: x + (Math.random() - 0.5) * 120,
        angle: (Math.random() - 0.5) * 360,
        duration,
        delay,
        ease: 'Quad.easeIn',
        onComplete: () => {
          boulder.destroy();
          onBoulderDone();
        },
      });
    }

    // Screen shake
    this.scene.cameras.main.shake(600, 0.012);
  }

  destroy() {
    this.boulders.forEach(b => { if (b.active) b.destroy(); });
    this.boulders = [];
  }
}

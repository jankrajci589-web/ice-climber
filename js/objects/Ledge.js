import CONFIG from '../config.js';

export default class Ledge {
  constructor(scene, x, y, isStartLedge = false) {
    this.scene = scene;
    this.state = 'solid'; // solid | cracked | breaking | broken

    // Main ledge image
    this.image = scene.add.image(x, y, 'ledge-solid').setOrigin(0.5, 0);

    // Breaking halves (hidden until needed)
    this.halfLeft = scene.add.image(x - CONFIG.LEDGE_WIDTH / 4, y, 'ledge-half-left')
      .setOrigin(0.5, 0).setVisible(false);
    this.halfRight = scene.add.image(x + CONFIG.LEDGE_WIDTH / 4, y, 'ledge-half-right')
      .setOrigin(0.5, 0).setVisible(false);

    this.glow = { clear() {}, destroy() {} }; // no-op placeholder

    this.x = x;
    this.y = y;
    this.isStartLedge = isStartLedge;
  }

  get centerX() { return this.x; }
  get topY() { return this.y; }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.image.setPosition(x, y);
    this.halfLeft.setPosition(x - CONFIG.LEDGE_WIDTH / 4, y);
    this.halfRight.setPosition(x + CONFIG.LEDGE_WIDTH / 4, y);
    this._updateGlow(false);
  }

  reset() {
    this.state = 'solid';
    this.image.setTexture('ledge-solid').setVisible(true).setAlpha(1);
    this.halfLeft.setVisible(false).setAlpha(1);
    this.halfRight.setVisible(false).setAlpha(1);
    this._updateGlow(false);
  }

  setHighlighted(on) {
    this._updateGlow(on);
  }

  _updateGlow(_on) {}

  crack(onComplete) {
    if (this.state !== 'solid') return;
    this.state = 'cracked';
    this.image.setTexture('ledge-cracked');
    this._updateGlow(false);

    // Shake the ledge
    this.scene.tweens.add({
      targets: this.image,
      x: this.x + 3,
      duration: 60,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this._break(onComplete);
      },
    });
  }

  _break(onComplete) {
    this.state = 'breaking';
    this.image.setVisible(false);
    this.halfLeft.setVisible(true).setPosition(this.x - CONFIG.LEDGE_WIDTH / 4, this.y);
    this.halfRight.setVisible(true).setPosition(this.x + CONFIG.LEDGE_WIDTH / 4, this.y);

    // Split the two halves apart
    this.scene.tweens.add({
      targets: this.halfLeft,
      x: this.x - CONFIG.LEDGE_WIDTH,
      y: this.y + 40,
      alpha: 0,
      angle: -25,
      duration: CONFIG.CRACK_DURATION * 1.5,
      ease: 'Quad.easeIn',
    });
    this.scene.tweens.add({
      targets: this.halfRight,
      x: this.x + CONFIG.LEDGE_WIDTH,
      y: this.y + 40,
      alpha: 0,
      angle: 25,
      duration: CONFIG.CRACK_DURATION * 1.5,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.state = 'broken';
        if (onComplete) onComplete();
      },
    });
  }

  scrollBy(dy) {
    this.y += dy;
    this.image.y += dy;
    this.halfLeft.y += dy;
    this.halfRight.y += dy;
    this.glow.y += dy;
    this._updateGlow(false);
  }

  destroy() {
    this.image.destroy();
    this.halfLeft.destroy();
    this.halfRight.destroy();
    this.glow.destroy();
  }
}

import CONFIG from '../config.js';

export default class Climber {
  constructor(scene, x, y) {
    this.scene = scene;
    this.image = scene.add.image(x, y, 'climber-idle').setOrigin(0.5, 1);
    this.x = x;
    this.y = y;
    this._idleTween = null;
    this._startIdle();
  }

  _startIdle() {
    this._stopIdle();
    this._idleTween = this.scene.tweens.add({
      targets: this.image,
      y: this.image.y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _stopIdle() {
    if (this._idleTween) {
      this._idleTween.stop();
      this._idleTween = null;
    }
  }

  // Called by GameScene before scroll tween — stops the bob so it doesn't fight
  pauseIdle() { this._stopIdle(); }

  // Called by GameScene after scroll tween completes
  resumeIdle() { this._startIdle(); }

  playClimb(targetY, onComplete) {
    this._stopIdle();
    this.image.setTexture('climber-climb');

    this.scene.tweens.add({
      targets: this.image,
      y: targetY,
      duration: CONFIG.CLIMB_DURATION,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.y = targetY;
        this.image.setTexture('climber-idle');
        // NOTE: idle is NOT restarted here — GameScene._scrollWorld will
        // call resumeIdle() once the scroll completes so they don't conflict
        if (onComplete) onComplete();
      },
    });
  }

  playFall(onComplete) {
    this._stopIdle();
    this.image.setTexture('climber-fall');

    this.scene.tweens.add({
      targets: this.image,
      y: this.image.y + CONFIG.CANVAS_HEIGHT,
      angle: 180,
      alpha: 0,
      duration: CONFIG.FALL_DURATION,
      ease: 'Quad.easeIn',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  playWin(onComplete) {
    this._stopIdle();
    this.image.setTexture('climber-idle');

    // Bounce celebration
    this.scene.tweens.add({
      targets: this.image,
      y: this.image.y - 20,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 3,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  scrollBy(dy) {
    this.y += dy;
    this.image.y += dy;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.image.setPosition(x, y);
  }

  destroy() {
    this._stopIdle();
    this.image.destroy();
  }
}

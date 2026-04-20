import CONFIG from '../config.js';

export default class Mountain {
  constructor(scene, skinKey) {
    this.scene = scene;
    this.skin = skinKey || 'default';
    this._t = 0;
    this._lightningAlpha = 0;
    this._lightningX = 0;
    this._nextLightning = null;

    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const theme = this._themeName();

    // Single background using existing mountain-tile textures (safe fallback)
    const skinCfg = CONFIG.SKINS[this.skin] || CONFIG.SKINS.default;
    this._skyBg = scene.add.graphics().setDepth(0); this._skyBg.fillStyle(0x050d1a); this._skyBg.fillRect(0,0,W,H); this._bg = scene.add.tileSprite(0, H-160, W, 160, skinCfg.key).setOrigin(0).setDepth(1);
    

    // Atmosphere overlay drawn each tick
    this._atmos = scene.add.graphics().setDepth(2);

    // Snow particles
    this._buildParticles(W, H, theme);

    this._tickEvent = scene.time.addEvent({
      delay: 16, loop: true,
      callback: () => this._tick(),
    });
  }

  scroll(amount) {
    this._bg.tilePositionY -= amount * 0.5;
  }

  setDepth(d) {
    this._bg.setDepth(d);
    this._atmos.setDepth(d + 1);
  }

  destroy() {
    if (this._tickEvent) this._tickEvent.destroy();
    this._skyBg.destroy(); this._bg.destroy();
    this._atmos.destroy();
    [this._particlesFar, this._particlesNear].forEach(p => p && p.destroy());
  }

  _themeName() {
    const map = { default: 'night', storm: 'storm', sunset: 'sunset' };
    return map[this.skin] || 'night';
  }

  _tick() {
    this._t += 0.016;
    const theme = this._themeName();
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    this._bg.tilePositionY -= 0.3;
    this._atmos.clear();

    if (theme === 'night')  this._drawAurora(W, H);
    if (theme === 'storm')  this._drawStormAtmos(W, H);
    if (theme === 'sunset') this._drawSunsetAtmos(W, H);
  }

  _drawAurora(W, H) {
    const t = this._t;
    const ribbons = [
      { color: 0x00cc88, alpha: 0.13, yBase: H * 0.18, amp: 18, freq: 0.012, speed: 0.40, thick: 14 },
      { color: 0x0088ff, alpha: 0.10, yBase: H * 0.26, amp: 12, freq: 0.018, speed: 0.28, thick: 10 },
      { color: 0x44ffcc, alpha: 0.08, yBase: H * 0.12, amp: 22, freq: 0.009, speed: 0.55, thick: 18 },
    ];
    ribbons.forEach(r => {
      this._atmos.fillStyle(r.color, r.alpha);
      for (let x = 0; x < W; x += 3) {
        const y = r.yBase + Math.sin(x * r.freq + t * r.speed) * r.amp + Math.sin(x * r.freq * 0.5 + t * r.speed * 0.7) * (r.amp * 0.5);
        this._atmos.fillRect(x, y, 3, r.thick + Math.sin(x * 0.03 + t) * 4);
      }
    });
    const stars = [[55,12,0.8],[210,18,0.6],[380,10,0.9],[145,30,0.5],[320,22,0.7],[460,15,0.65]];
    stars.forEach(([x, y, phase]) => {
      const alpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3 + phase * 6.28));
      this._atmos.fillStyle(0xffffff, alpha);
      this._atmos.fillRect(x, y, 2, 2);
    });
  }

  _drawStormAtmos(W, H) {
    const t = this._t;
    this._atmos.fillStyle(0x3a0860, 0.12 + 0.06 * Math.sin(t * 0.7));
    this._atmos.fillRect(0, 0, W, H * 0.35);
    if (!this._nextLightning) this._nextLightning = t + 3 + Math.random() * 4;
    if (t >= this._nextLightning) {
      this._lightningAlpha = 0.45;
      this._lightningX = 80 + Math.random() * (W - 160);
      this._nextLightning = t + 3 + Math.random() * 5;
    }
    if (this._lightningAlpha > 0) {
      this._atmos.fillStyle(0xccaaff, this._lightningAlpha);
      this._atmos.fillRect(0, 0, W, H * 0.5);
      this._atmos.fillStyle(0xffffff, this._lightningAlpha * 0.8);
      const bx = this._lightningX;
      this._atmos.fillRect(bx, 0, 2, H * 0.30);
      this._atmos.fillRect(bx + 4, H * 0.28, 2, H * 0.18);
      this._lightningAlpha = Math.max(0, this._lightningAlpha - 0.04);
    }
  }

  _drawSunsetAtmos(W, H) {
    const t = this._t;
    const bands = [
      { y: H * 0.42, h: 24, color: 0xff6020, baseA: 0.14, pulseA: 0.06, speed: 0.50 },
      { y: H * 0.38, h: 16, color: 0xff9040, baseA: 0.09, pulseA: 0.04, speed: 0.35 },
      { y: H * 0.34, h: 12, color: 0xffcc60, baseA: 0.06, pulseA: 0.03, speed: 0.60 },
    ];
    bands.forEach(b => {
      this._atmos.fillStyle(b.color, b.baseA + b.pulseA * Math.sin(t * b.speed));
      this._atmos.fillRect(0, b.y, W, b.h);
    });
    const sx = W * 0.5, sy = H * 0.44;
    const pulse = 0.22 + 0.04 * Math.sin(t * 0.3);
    this._atmos.fillStyle(0xffee88, pulse * 0.45); this._atmos.fillCircle(sx, sy, 48);
    this._atmos.fillStyle(0xffcc44, pulse);         this._atmos.fillCircle(sx, sy, 24);
    this._atmos.fillStyle(0xffffff, pulse * 0.7);   this._atmos.fillCircle(sx, sy, 10);
  }

  _buildParticles(W, H, theme) {
    if (theme === 'sunset') {
      this._particlesFar = this.scene.add.particles(0, 0, 'ember', {
        x: { min: 0, max: W }, y: { min: H * 0.6, max: H },
        speedY: { min: -60, max: -20 }, speedX: { min: -12, max: 12 },
        lifespan: { min: 2000, max: 4000 }, quantity: 1, frequency: 200,
        alpha: { start: 0.7, end: 0 }, scale: { min: 0.8, max: 1.6 },
      }).setDepth(3);
    } else if (theme === 'storm') {
      this._particlesFar = this.scene.add.particles(0, 0, 'snowflake', {
        x: { min: -20, max: 0 }, y: { min: 0, max: H },
        speedX: { min: 70, max: 150 }, speedY: { min: 15, max: 40 },
        lifespan: { min: 1000, max: 2000 }, quantity: 2, frequency: 70,
        alpha: { start: 0.35, end: 0 }, scale: { min: 0.5, max: 1.0 },
      }).setDepth(3);
    } else {
      this._particlesFar = this.scene.add.particles(0, 0, 'snowflake', {
        x: { min: 0, max: W }, y: -4,
        speedY: { min: 25, max: 55 }, speedX: { min: -8, max: 8 },
        lifespan: { min: 5000, max: 8000 }, quantity: 1, frequency: 220,
        alpha: { start: 0.28, end: 0 }, scale: { min: 0.5, max: 0.9 },
      }).setDepth(3);
      this._particlesNear = this.scene.add.particles(0, 0, 'snowflake', {
        x: { min: 0, max: W }, y: -6,
        speedY: { min: 40, max: 85 }, speedX: { min: -15, max: 15 },
        lifespan: { min: 3000, max: 5500 }, quantity: 1, frequency: 280,
        alpha: { start: 0.45, end: 0 }, scale: { min: 1.2, max: 2.2 },
      }).setDepth(4);
    }
  }
}

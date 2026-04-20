import CONFIG from '../config.js';
import GameState from '../state/GameState.js';
import Leaderboard from '../ui/Leaderboard.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const d = this.resultData;
    const isWin = d.outcome === 'win';
    const skin = CONFIG.SKINS[GameState.skin] || CONFIG.SKINS.default;

    // Background
    this.bg = this.add.tileSprite(0, 0, W, H, skin.key).setOrigin(0, 0);
    this.bg.tileScaleY = H / 160;
    const overlay = this.add.graphics();
    overlay.fillStyle(isWin ? 0x021a08 : 0x1a0202, 0.82);
    overlay.fillRect(0, 0, W, H);

    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: W }, y: -5,
      speedY: { min: 30, max: 70 }, speedX: { min: -15, max: 15 },
      lifespan: 6000, quantity: 1, frequency: 250, alpha: { start: 0.6, end: 0 },
    });

    // Update leaderboard on real-money win only
    if (isWin && d.payout > 0 && !GameState.demoMode) {
      Leaderboard.submit({
        name: 'PLAYER',
        payout: d.payout,
        level: d.level,
        multiplier: d.multiplier,
        difficulty: GameState.difficulty,
        date: new Date().toLocaleDateString(),
      });
    }

    // Demo badge on result screen
    if (GameState.demoMode) {
      const dg = this.add.graphics();
      dg.fillStyle(0x0a1e0a, 0.9);
      dg.fillRoundedRect(W / 2 - 70, 6, 140, 22, 5);
      dg.lineStyle(1, 0x2a6a2a);
      dg.strokeRoundedRect(W / 2 - 70, 6, 140, 22, 5);
      this.add.text(W / 2, 17, '🎮 DEMO MODE', {
        fontSize: '10px', fontFamily: 'Courier New', color: '#66cc66', letterSpacing: 2,
      }).setOrigin(0.5);
    }

    // ── Result panel ──────────────────────────────────
    const panelW = 340;
    const panelH = isWin ? 310 : 290;
    const px = W / 2 - panelW / 2;
    const py = 70;

    const panel = this.add.graphics();
    panel.fillStyle(0x08131e, 0.97);
    panel.fillRoundedRect(px, py, panelW, panelH, 12);
    panel.lineStyle(2, isWin ? 0x44ee88 : 0xee4444);
    panel.strokeRoundedRect(px, py, panelW, panelH, 12);

    // Outcome header
    const headerColor = isWin ? '#44ee88' : '#ee4444';
    const headerText = isWin ? 'YOU MADE IT!' : 'YOU FELL!';
    const header = this.add.text(W / 2, py + 36, headerText, {
      fontSize: '26px', fontFamily: 'Courier New', color: headerColor, fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5);
    this.tweens.add({ targets: header, scaleX: 1.05, scaleY: 1.05, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Divider
    this.add.graphics().lineStyle(1, isWin ? 0x1a5a2a : 0x5a1a1a).strokeRect(px + 20, py + 62, panelW - 40, 0);

    // Stats
    const sc = '#7ec8e3'; const vc = '#ffffff';
    const sx = px + 30; let sy = py + 76; const lh = 36;
    this._stat(sx, sy, 'LEDGE REACHED', `${d.level}`, sc, vc); sy += lh;
    this._stat(sx, sy, 'MULTIPLIER', `${d.multiplier.toFixed(2)}×`, sc, isWin ? '#44ddaa' : '#888'); sy += lh;
    this._stat(sx, sy, 'BET', `${d.bet}`, sc, vc); sy += lh;
    if (isWin) {
      this._stat(sx, sy, 'PAYOUT', `+${d.payout.toFixed(2)}`, sc, '#44ee88'); sy += lh;
    } else {
      this._stat(sx, sy, 'LOST', `-${d.bet}`, sc, '#ee4444'); sy += lh;
    }

    // Streak badge
    if (d.streak >= 3) {
      const badge = this.add.text(W / 2, sy, `🔥 ${d.streak}-LEDGE STREAK!`, {
        fontSize: '12px', fontFamily: 'Courier New', color: '#ffdd44', fontStyle: 'bold',
      }).setOrigin(0.5);
      sy += 30;
    }

    // Balance footer
    this.add.graphics().lineStyle(1, isWin ? 0x1a5a2a : 0x5a1a1a).strokeRect(px + 20, sy, panelW - 40, 0);
    sy += 10;
    this.add.text(sx, sy, 'BALANCE', { fontSize: '11px', fontFamily: 'Courier New', color: sc, letterSpacing: 2 });
    this.add.text(px + panelW - 30, sy, `${d.balance}`, { fontSize: '18px', fontFamily: 'Courier New', color: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0);

    // ── Buttons ───────────────────────────────────────
    const btnY = py + panelH + 28;

    if (GameState.demoMode) {
      // Auto-refill demo balance if empty
      if (GameState.demoBalance <= 0) GameState.refillDemo();

      this._btn(W / 2 - 88, btnY, 'PLAY AGAIN', 0x0f3a0f, 0x2a6a2a, '#66cc66', () => {
        GameState.resetRun();
        this.cameras.main.fadeOut(300, 0, 8, 20);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BettingScene'));
      });
      this._btn(W / 2 + 88, btnY, 'MENU', 0x1a1a2a, 0x3a3a5a, '#7ec8e3', () => {
        GameState.resetRun();
        this.cameras.main.fadeOut(300, 0, 8, 20);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });

      // Switch to real money CTA
      const ctaY = btnY + 52;
      const ctaBg = this.add.graphics();
      ctaBg.fillStyle(0x0a1e3c, 0.9);
      ctaBg.fillRoundedRect(W / 2 - 150, ctaY - 20, 300, 40, 6);
      ctaBg.lineStyle(1, 0x4aa3df, 0.6);
      ctaBg.strokeRoundedRect(W / 2 - 150, ctaY - 20, 300, 40, 6);

      const ctaText = this.add.text(W / 2, ctaY, '💰 Play with real money →', {
        fontSize: '12px', fontFamily: 'Courier New', color: '#4aa3df', letterSpacing: 1,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      ctaText.on('pointerover', () => ctaText.setColor('#a8d8f0'));
      ctaText.on('pointerout', () => ctaText.setColor('#4aa3df'));
      ctaText.on('pointerdown', () => {
        GameState.demoMode = false;
        GameState.resetRun();
        this.cameras.main.fadeOut(300, 0, 8, 20);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BettingScene'));
      });

    } else {
      this._btn(W / 2 - 88, btnY, 'PLAY AGAIN', 0x0f4a78, 0x2a7aaa, '#ffffff', () => {
        GameState.resetRun();
        this.cameras.main.fadeOut(300, 0, 8, 20);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BettingScene'));
      });
      this._btn(W / 2 + 88, btnY, 'MENU', 0x1a1a2a, 0x3a3a5a, '#7ec8e3', () => {
        GameState.resetRun();
        this.cameras.main.fadeOut(300, 0, 8, 20);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });
    }

    // ── Bet history ───────────────────────────────────
    this._buildHistory(W, btnY + 52);

    // ── Provably fair ─────────────────────────────────
    this._buildFairness(W, H, d);

    if (isWin) {
      this.add.particles(W / 2, H / 2, 'star', {
        speed: { min: 150, max: 320 }, angle: { min: 0, max: 360 },
        lifespan: 1200, quantity: 20, alpha: { start: 1, end: 0 },
        scale: { start: 1.4, end: 0.2 }, gravityY: 300,
      });
    }

    this.cameras.main.fadeIn(400, 0, 8, 20);
  }

  update() { if (this.bg) this.bg.tilePositionY -= 0.2; }

  _stat(x, y, label, value, lc, vc) {
    this.add.text(x, y, label, { fontSize: '10px', fontFamily: 'Courier New', color: lc, letterSpacing: 2 });
    this.add.text(x + 280, y, value, { fontSize: '15px', fontFamily: 'Courier New', color: vc, fontStyle: 'bold' }).setOrigin(1, 0);
  }

  _btn(cx, cy, label, bg, border, tc, cb) {
    const bw = 160; const bh = 44;
    const g = this.add.graphics();
    g.fillStyle(bg); g.fillRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 6);
    g.lineStyle(2, border); g.strokeRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 6);
    this.add.text(cx, cy, label, { fontSize: '13px', fontFamily: 'Courier New', color: tc, fontStyle: 'bold', letterSpacing: 2 }).setOrigin(0.5);
    this.add.rectangle(cx, cy, bw, bh).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }

  _buildHistory(W, startY) {
    const history = GameState.betHistory;
    if (history.length === 0) return;

    this.add.text(W / 2, startY, 'LAST ROUNDS', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#334455', letterSpacing: 3,
    }).setOrigin(0.5);

    const itemH = 22;
    history.slice(0, 5).forEach((h, i) => {
      const y = startY + 14 + i * itemH;
      const isW = h.outcome === 'win';
      const rowBg = this.add.graphics();
      rowBg.fillStyle(i % 2 === 0 ? 0x060e1a : 0x040a14);
      rowBg.fillRect(30, y, W - 60, itemH - 1);

      this.add.text(38, y + 4, `#${i + 1}`, { fontSize: '9px', fontFamily: 'Courier New', color: '#334455' });
      this.add.text(58, y + 4, `Bet ${h.bet}`, { fontSize: '9px', fontFamily: 'Courier New', color: '#6a8a9a' });
      this.add.text(140, y + 4, `Ledge ${h.level}`, { fontSize: '9px', fontFamily: 'Courier New', color: '#6a8a9a' });
      this.add.text(220, y + 4, `${h.multiplier}×`, { fontSize: '9px', fontFamily: 'Courier New', color: '#7a9aaa' });
      const profitColor = isW ? '#44ee88' : '#ee4444';
      const profitStr = isW ? `+${h.payout.toFixed(0)}` : `-${h.bet}`;
      this.add.text(W - 38, y + 4, profitStr, { fontSize: '9px', fontFamily: 'Courier New', color: profitColor, fontStyle: 'bold' }).setOrigin(1, 0);
    });
  }

  _buildFairness(W, H, d) {
    if (!d.roundSeed) return;

    const fy = H - 58;
    this.add.text(W / 2, fy, '🔒 PROVABLY FAIR', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#2a4a6a', letterSpacing: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._showFairnessModal(W, H, d));
  }

  _showFairnessModal(W, H, d) {
    const panel = this.add.graphics().setDepth(80);
    panel.fillStyle(0x030c18, 0.98);
    panel.fillRoundedRect(20, 60, W - 40, H - 120, 10);
    panel.lineStyle(2, 0x2a5a8a);
    panel.strokeRoundedRect(20, 60, W - 40, H - 120, 10);

    const objs = [panel];

    const lines = [
      { text: '🔒 PROVABLY FAIR VERIFICATION', color: '#4aa3df', size: '13px', y: 90 },
      { text: `Round Hash (SHA-256):`, color: '#4a7a9a', size: '10px', y: 122 },
      { text: d.roundHash?.slice(0, 40) + '...', color: '#7ec8e3', size: '9px', y: 138 },
      { text: `Server Seed (revealed):`, color: '#4a7a9a', size: '10px', y: 168 },
      { text: d.roundSeed?.slice(0, 40) + '...', color: '#7ec8e3', size: '9px', y: 184 },
      { text: `Roll Value:`, color: '#4a7a9a', size: '10px', y: 214 },
      { text: `${d.rollValue}`, color: '#ffffff', size: '16px', y: 230 },
      { text: `Crack Threshold (Ledge ${d.level}):`, color: '#4a7a9a', size: '10px', y: 264 },
      { text: `${(0.05 + (d.level - 1) * GameState.dangerIncrement).toFixed(4)}`, color: '#ff8844', size: '16px', y: 280 },
      { text: 'Roll < Threshold = CRACK', color: '#885522', size: '10px', y: 316 },
      { text: 'Roll ≥ Threshold = SAFE', color: '#226644', size: '10px', y: 332 },
    ];

    lines.forEach(({ text, color, size, y }) => {
      const t = this.add.text(W / 2, y, text, {
        fontSize: size, fontFamily: 'Courier New', color, align: 'center',
        wordWrap: { width: W - 80 },
      }).setOrigin(0.5).setDepth(81);
      objs.push(t);
    });

    const close = this.add.text(W / 2, H - 86, 'CLOSE', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#4aa3df', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(82).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => objs.forEach(o => o.destroy()));
    objs.push(close);
  }
}

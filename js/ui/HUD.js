import CONFIG from '../config.js';
import GameState from '../state/GameState.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;
    this._climbCb = null;
    this._descendCb = null;
    this._autoClimbCb = null;
    this._autoClimbOn = false;
    this._build();
  }

  _build() {
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    // ── Top bar ───────────────────────────────────────
    const topBar = this.scene.add.graphics().setDepth(50);
    topBar.fillStyle(0x020d1e, 0.92);
    topBar.fillRect(0, 0, W, 56);
    topBar.lineStyle(1, 0x1a3a5a);
    topBar.strokeRect(0, 56, W, 0);

    // Balance (with DEMO label if in demo mode)
    const balLabel = GameState.demoMode ? 'DEMO' : 'BALANCE';
    const balColor = GameState.demoMode ? '#66cc66' : '#4a7a9a';
    this.scene.add.text(16, 10, balLabel, { fontSize: '10px', fontFamily: 'Courier New', color: balColor, letterSpacing: 2 }).setDepth(51);
    this.balanceText = this.scene.add.text(16, 24, `${GameState.activeBalance}`, { fontSize: '18px', fontFamily: 'Courier New', color: GameState.demoMode ? '#88ee88' : '#a8d8f0', fontStyle: 'bold' }).setDepth(51);

    // DEMO watermark badge
    if (GameState.demoMode) {
      const demoBadge = this.scene.add.graphics().setDepth(51);
      demoBadge.fillStyle(0x0a1e0a, 0.85);
      demoBadge.fillRoundedRect(W / 2 - 38, 3, 76, 18, 4);
      demoBadge.lineStyle(1, 0x2a5a2a);
      demoBadge.strokeRoundedRect(W / 2 - 38, 3, 76, 18, 4);
      this.scene.add.text(W / 2, 12, '🎮 DEMO', {
        fontSize: '9px', fontFamily: 'Courier New', color: '#66cc66', letterSpacing: 2,
      }).setDepth(52).setOrigin(0.5);
    }

    // Bet
    this.scene.add.text(W / 2 - 30, 10, 'BET', { fontSize: '10px', fontFamily: 'Courier New', color: '#4a7a9a', letterSpacing: 2 }).setDepth(51);
    this.betText = this.scene.add.text(W / 2 - 30, 24, `${GameState.currentBet}`, { fontSize: '18px', fontFamily: 'Courier New', color: '#ffffff', fontStyle: 'bold' }).setDepth(51);

    // Multiplier
    this.scene.add.text(W - 16, 10, 'MULTIPLIER', { fontSize: '10px', fontFamily: 'Courier New', color: '#4a7a9a', letterSpacing: 2 }).setDepth(51).setOrigin(1, 0);
    this.multText = this.scene.add.text(W - 16, 24, '1.00×', { fontSize: '18px', fontFamily: 'Courier New', color: '#44ddaa', fontStyle: 'bold' }).setDepth(51).setOrigin(1, 0);

    // Fullscreen button (top-left of bar)
    this._fsBtn = this.scene.add.text(W - 46, 10, '⛶', { fontSize: '16px', fontFamily: 'Courier New', color: '#334455' })
      .setDepth(52).setInteractive({ useHandCursor: true });
    this._fsBtn.on('pointerover', () => this._fsBtn.setColor('#7ec8e3'));
    this._fsBtn.on('pointerout', () => this._fsBtn.setColor('#334455'));
    this._fsBtn.on('pointerdown', () => {
      if (!document.fullscreenElement) {
        document.getElementById('game-container')?.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    // ── Middle strip ──────────────────────────────────
    const midStrip = this.scene.add.graphics().setDepth(50);
    midStrip.fillStyle(0x020d1e, 0.55);
    midStrip.fillRect(0, 56, W, 36);

    // Danger bar (hidden — players don't see crack probability)
    this._dangerBg = this.scene.add.graphics().setDepth(51).setVisible(false);
    this._dangerFill = this.scene.add.graphics().setDepth(52).setVisible(false);
    this._dangerLabel = this.scene.add.text(W / 2, 74, '', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#885522', letterSpacing: 1,
    }).setDepth(52).setOrigin(0.5).setVisible(false);

    // Level
    this.levelText = this.scene.add.text(24, 68, 'LEDGE 0', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#334455', letterSpacing: 2,
    }).setDepth(51);

    // Streak
    this.streakText = this.scene.add.text(W - 24, 68, '', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#ffdd44', letterSpacing: 1,
    }).setDepth(51).setOrigin(1, 0);

    // Session info (bottom left of mid strip)
    this.sessionText = this.scene.add.text(24, 80, '', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#223344',
    }).setDepth(51);

    // ── Bottom action bar ─────────────────────────────
    const barH = 80;
    const botBar = this.scene.add.graphics().setDepth(50);
    botBar.fillStyle(0x020d1e, 0.92);
    botBar.fillRect(0, H - barH, W, barH);
    botBar.lineStyle(1, 0x1a3a5a);
    botBar.strokeRect(0, H - barH, W, 0);

    // Bottom bar is split into 3 equal columns: CLIMB | DESCEND | AUTO
    const col1 = W * 0.22;   // CLIMB center
    const col2 = W * 0.55;   // DESCEND center
    const col3 = W * 0.84;   // AUTO center
    const btnW1 = 148;
    const btnW2 = 138;
    const btnW3 = 100;

    // CLIMB button
    this._climbEnabled = true;
    this._climbBtnBg = this.scene.add.graphics().setDepth(51);
    this._climbBtnText = this.scene.add.text(col1, H - barH / 2 - 4, 'CLIMB', {
      fontSize: '17px', fontFamily: 'Courier New', color: '#ffffff', fontStyle: 'bold', letterSpacing: 4,
    }).setDepth(52).setOrigin(0.5);
    this._climbHint = this.scene.add.text(col1, H - barH / 2 + 14, '[SPACE]', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#4a7a9a',
    }).setDepth(52).setOrigin(0.5);
    this._climbHit = this.scene.add.rectangle(col1, H - barH / 2, btnW1, 54, 0x000000, 0).setDepth(53).setInteractive({ useHandCursor: true });
    this._drawClimbBtn(false, false);
    this._climbHit.on('pointerover', () => { if (this._climbEnabled) this._drawClimbBtn(true, false); });
    this._climbHit.on('pointerout', () => this._drawClimbBtn(false, !this._climbEnabled));
    this._climbHit.on('pointerdown', () => { if (this._climbEnabled && this._climbCb) this._climbCb(); });

    // Separator
    const sep1 = this.scene.add.graphics().setDepth(51);
    sep1.lineStyle(1, 0x0a1a2a);
    sep1.strokeRect((col1 + col2) / 2, H - barH + 8, 0, barH - 16);

    // DESCEND button
    this._descendEnabled = false;
    this._descendBtnBg = this.scene.add.graphics().setDepth(51);
    this._descendBtnText = this.scene.add.text(col2, H - barH / 2 - 4, 'DESCEND', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#aaaaaa', fontStyle: 'bold', letterSpacing: 2,
    }).setDepth(52).setOrigin(0.5);
    this._descendHint = this.scene.add.text(col2, H - barH / 2 + 14, '[D] cash out', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#4a7a9a',
    }).setDepth(52).setOrigin(0.5);
    this._descendHit = this.scene.add.rectangle(col2, H - barH / 2, btnW2, 54, 0x000000, 0).setDepth(53).setInteractive({ useHandCursor: true });
    this._drawDescendBtn(false, true);
    this._descendHit.on('pointerover', () => { if (this._descendEnabled) this._drawDescendBtn(true, false); });
    this._descendHit.on('pointerout', () => this._drawDescendBtn(false, !this._descendEnabled));
    this._descendHit.on('pointerdown', () => { if (this._descendEnabled && this._descendCb) this._descendCb(); });

    // Separator
    const sep2 = this.scene.add.graphics().setDepth(51);
    sep2.lineStyle(1, 0x0a1a2a);
    sep2.strokeRect((col2 + col3) / 2, H - barH + 8, 0, barH - 16);

    // AUTO button
    this._autoBtnBg = this.scene.add.graphics().setDepth(51);
    this._autoBtnLabel = this.scene.add.text(col3, H - barH / 2 - 6, 'AUTO', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#7ec8e3', fontStyle: 'bold', letterSpacing: 3,
    }).setDepth(52).setOrigin(0.5);
    this._autoBtnHint = this.scene.add.text(col3, H - barH / 2 + 10, '[A] on/off', {
      fontSize: '9px', fontFamily: 'Courier New', color: '#4a7a9a',
    }).setDepth(52).setOrigin(0.5);
    this._autoBtnText = this.scene.add.text(col3, H - barH / 2 + 22, '● OFF', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#334455', letterSpacing: 1,
    }).setDepth(52).setOrigin(0.5);
    this._drawAutoBtn(false);
    const autoHit = this.scene.add.rectangle(col3, H - barH / 2, btnW3, 54, 0x000000, 0).setDepth(53).setInteractive({ useHandCursor: true });
    autoHit.on('pointerover', () => { if (!this._autoClimbOn) this._autoBtnLabel.setColor('#a8d8f0'); });
    autoHit.on('pointerout', () => { if (!this._autoClimbOn) this._autoBtnLabel.setColor('#7ec8e3'); });
    autoHit.on('pointerdown', () => {
      this._autoClimbOn = !this._autoClimbOn;
      this._drawAutoBtn(this._autoClimbOn);
      if (this._autoClimbCb) this._autoClimbCb(this._autoClimbOn);
    });

    // Store col references for _drawAutoBtn
    this._autoCol = col3;
    this._btnW3 = btnW3;
  }

  _drawClimbBtn(hover, disabled) {
    const H = CONFIG.CANVAS_HEIGHT; const barH = 80;
    const bx = CONFIG.CANVAS_WIDTH * 0.22; const by = H - barH / 2;
    this._climbBtnBg.clear();
    if (disabled) {
      this._climbBtnBg.fillStyle(0x0a1a2a);
      this._climbBtnBg.fillRoundedRect(bx - 74, by - 27, 148, 54, 6);
      this._climbBtnText.setColor('#334455');
    } else {
      this._climbBtnBg.fillStyle(hover ? 0x1a6fa8 : 0x0f4a78);
      this._climbBtnBg.fillRoundedRect(bx - 74, by - 27, 148, 54, 6);
      this._climbBtnBg.lineStyle(2, hover ? 0x6ad4ff : 0x2a7aaa);
      this._climbBtnBg.strokeRoundedRect(bx - 74, by - 27, 148, 54, 6);
      this._climbBtnText.setColor('#ffffff');
    }
  }

  _drawDescendBtn(hover, disabled) {
    const H = CONFIG.CANVAS_HEIGHT; const barH = 80;
    const bx = CONFIG.CANVAS_WIDTH * 0.55; const by = H - barH / 2;
    this._descendBtnBg.clear();
    if (disabled) {
      this._descendBtnBg.fillStyle(0x0a1a2a);
      this._descendBtnBg.fillRoundedRect(bx - 69, by - 27, 138, 54, 6);
      this._descendBtnText.setColor('#222233');
    } else {
      this._descendBtnBg.fillStyle(hover ? 0x1a7a38 : 0x0f4a24);
      this._descendBtnBg.fillRoundedRect(bx - 69, by - 27, 138, 54, 6);
      this._descendBtnBg.lineStyle(2, hover ? 0x44ee88 : 0x1a6a34);
      this._descendBtnBg.strokeRoundedRect(bx - 69, by - 27, 138, 54, 6);
      this._descendBtnText.setColor('#44ee88');
    }
  }

  _drawAutoBtn(active) {
    const H = CONFIG.CANVAS_HEIGHT; const barH = 80;
    const bx = this._autoCol || CONFIG.CANVAS_WIDTH * 0.84;
    const bw = this._btnW3 || 100;
    const by = H - barH / 2;
    this._autoBtnBg.clear();
    this._autoBtnBg.fillStyle(active ? 0x0f3a20 : 0x0a1520);
    this._autoBtnBg.fillRoundedRect(bx - bw / 2, by - 27, bw, 54, 6);
    this._autoBtnBg.lineStyle(2, active ? 0x44ee88 : 0x1a4a5a);
    this._autoBtnBg.strokeRoundedRect(bx - bw / 2, by - 27, bw, 54, 6);
    this._autoBtnLabel.setColor(active ? '#44ee88' : '#7ec8e3');
    this._autoBtnText.setText(active ? '● ON' : '● OFF');
    this._autoBtnText.setColor(active ? '#44ee88' : '#334455');
  }

  _drawDangerBar(pct) {
    const W = CONFIG.CANVAS_WIDTH;
    const barW = 120;
    const bx = W / 2 - barW / 2;
    const by = 62;
    this._dangerBg.clear();
    this._dangerBg.fillStyle(0x0a1628);
    this._dangerBg.fillRect(bx, by, barW, 5);
    this._dangerFill.clear();
    const color = pct < 0.3 ? 0x44aa44 : pct < 0.6 ? 0xddaa22 : 0xdd3322;
    this._dangerFill.fillStyle(color);
    this._dangerFill.fillRect(bx, by, Math.floor(barW * Math.min(pct, 1)), 5);
  }

  onClimb(cb) { this._climbCb = cb; }
  onDescend(cb) { this._descendCb = cb; }
  onAutoClimbToggle(cb) { this._autoClimbCb = cb; }

  setAutoClimbActive(on) {
    this._autoClimbOn = on;
    if (this._autoCol) this._drawAutoBtn(on);
  }

  setClimbEnabled(enabled) {
    this._climbEnabled = enabled;
    this._drawClimbBtn(false, !enabled);
  }

  setDescendEnabled(enabled) {
    this._descendEnabled = enabled;
    this._drawDescendBtn(false, !enabled);
  }

  update(level, multiplier, danger, streak) {
    this.balanceText.setText(`${GameState.activeBalance}`);
    this.betText.setText(`${GameState.currentBet}`);
    const multDisplay = multiplier >= 1000
      ? `${(multiplier / 1000).toFixed(1)}K×`
      : `${multiplier.toFixed(2)}×`;
    this.multText.setText(multDisplay);

    this.scene.tweens.add({
      targets: this.multText, scaleX: 1.35, scaleY: 1.35,
      duration: 120, yoyo: true, ease: 'Quad.easeOut',
    });

    const multColor = multiplier >= 5 ? '#ff6644' : multiplier >= 2 ? '#ffdd44' : '#44ddaa';
    this.multText.setColor(multColor);

    this.levelText.setText(`LEDGE ${level}`);
    this._dangerLabel.setText(`DANGER: ${Math.round(danger * 100)}%`);
    this._drawDangerBar(danger);

    if (streak >= 3) {
      this.streakText.setText(`🔥 ${streak} STREAK`);
    } else {
      this.streakText.setText('');
    }

    const sessionLoss = GameState.getSessionLoss();
    const mins = GameState.getSessionMinutes();
    this.sessionText.setText(sessionLoss > 0 ? `Session: -${sessionLoss}  ${mins}m` : `Session: ${mins}m`);
  }
}

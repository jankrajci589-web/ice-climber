import GameState from '../state/GameState.js';
import CONFIG from '../config.js';
import Leaderboard from '../ui/Leaderboard.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const skin = CONFIG.SKINS[GameState.skin] || CONFIG.SKINS.default;

    this.bg1 = this.add.tileSprite(0, 0, W, H, skin.key).setOrigin(0, 0);
    this.bg1.tileScaleY = H / 160;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x020810, 0.7);
    overlay.fillRect(0, 0, W, H);

    this._createSnow();
    this._drawTitle(W, H);
    this._drawIdleClimber(W, H);

    this.balanceText = this.add.text(W / 2, H - 100, `BALANCE: ${GameState.balance}`, {
      fontSize: '16px', fontFamily: 'Courier New', color: '#7ec8e3', letterSpacing: 2,
    }).setOrigin(0.5);

    this._createPlayButtons(W, H);
    this._createBottomButtons(W, H);

    this.add.text(W - 8, H - 8, 'Peak Studios  v1.0', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#334455',
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(300, 0, 8, 20);
  }

  update() {
    if (this.bg1) this.bg1.tilePositionY -= 0.3;
    if (this.balanceText) this.balanceText.setText(`BALANCE: ${GameState.balance}`);
  }

  _createSnow() {
    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: CONFIG.CANVAS_WIDTH },
      y: -5,
      speedY: { min: 30, max: 70 },
      speedX: { min: -15, max: 15 },
      lifespan: 7000,
      quantity: 1,
      frequency: 200,
      alpha: { start: 0.7, end: 0 },
      scale: { min: 0.8, max: 1.5 },
    });
  }

  _drawTitle(W, H) {
    const glowRect = this.add.graphics();
    glowRect.fillStyle(0x0a2244, 0.8);
    glowRect.fillRoundedRect(W / 2 - 170, H / 2 - 180, 340, 120, 8);
    glowRect.lineStyle(2, 0x4aa3df, 0.8);
    glowRect.strokeRoundedRect(W / 2 - 170, H / 2 - 180, 340, 120, 8);

    this.add.text(W / 2 + 3, H / 2 - 128, 'ICE', {
      fontSize: '56px', fontFamily: 'Courier New', color: '#042255', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(W / 2 + 3, H / 2 - 78, 'CLIMBER', {
      fontSize: '40px', fontFamily: 'Courier New', color: '#042255', fontStyle: 'bold',
    }).setOrigin(0.5);

    const iceText = this.add.text(W / 2, H / 2 - 130, 'ICE', {
      fontSize: '56px', fontFamily: 'Courier New', color: '#a8e8ff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const climberText = this.add.text(W / 2, H / 2 - 80, 'CLIMBER', {
      fontSize: '40px', fontFamily: 'Courier New', color: '#7ec8e3', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [iceText, climberText],
      alpha: { from: 1, to: 0.75 },
      duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.add.text(W / 2, H / 2 - 40, 'HOW HIGH DARE YOU CLIMB?', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#4a7a9a', letterSpacing: 2,
    }).setOrigin(0.5);
  }

  _drawIdleClimber(W, H) {
    const ledgeY = H / 2 + 20;
    const ledgeX = W / 2 - 50;
    this.add.image(ledgeX, ledgeY, 'ledge-solid').setOrigin(0, 0);
    const climber = this.add.image(W / 2, ledgeY - 28, 'climber-idle').setOrigin(0.5, 0);
    this.tweens.add({
      targets: climber, y: ledgeY - 31,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  _createPlayButtons(W, H) {
    const realBtnY = H / 2 + 68;
    const demoBtnY = H / 2 + 128;

    // ── PLAY (real money) ─────────────────────────────
    const realBg = this.add.graphics();
    const drawReal = (hover) => {
      realBg.clear();
      realBg.fillStyle(hover ? 0x2a8fc8 : 0x1a6fa8);
      realBg.fillRoundedRect(W / 2 - 110, realBtnY - 27, 220, 54, 8);
      realBg.lineStyle(2, hover ? 0x6ad4ff : 0x4aa3df);
      realBg.strokeRoundedRect(W / 2 - 110, realBtnY - 27, 220, 54, 8);
    };
    drawReal(false);

    const realText = this.add.text(W / 2, realBtnY, 'PLAY', {
      fontSize: '28px', fontFamily: 'Courier New', color: '#ffffff', fontStyle: 'bold', letterSpacing: 6,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: realText, scaleX: 1.04, scaleY: 1.04,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    const realHit = this.add.rectangle(W / 2, realBtnY, 220, 54).setInteractive({ useHandCursor: true });
    realHit.on('pointerover', () => { drawReal(true); realText.setColor('#e0f8ff'); });
    realHit.on('pointerout', () => { drawReal(false); realText.setColor('#ffffff'); });
    realHit.on('pointerdown', () => {
      GameState.demoMode = false;
      this.cameras.main.fadeOut(300, 0, 8, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BettingScene'));
    });

    // ── PLAY FOR FUN (demo) ───────────────────────────
    const demoBg = this.add.graphics();
    const drawDemo = (hover) => {
      demoBg.clear();
      demoBg.fillStyle(hover ? 0x2a4a2a : 0x1a3a1a);
      demoBg.fillRoundedRect(W / 2 - 110, demoBtnY - 22, 220, 44, 8);
      demoBg.lineStyle(2, hover ? 0x66cc66 : 0x3a6a3a);
      demoBg.strokeRoundedRect(W / 2 - 110, demoBtnY - 22, 220, 44, 8);
    };
    drawDemo(false);

    const demoText = this.add.text(W / 2, demoBtnY - 2, 'PLAY FOR FUN', {
      fontSize: '15px', fontFamily: 'Courier New', color: '#66cc66', fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5);
    this.add.text(W / 2, demoBtnY + 14, 'Demo · No real money', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#3a6a3a',
    }).setOrigin(0.5);

    const demoHit = this.add.rectangle(W / 2, demoBtnY, 220, 44).setInteractive({ useHandCursor: true });
    demoHit.on('pointerover', () => { drawDemo(true); demoText.setColor('#aaffaa'); });
    demoHit.on('pointerout', () => { drawDemo(false); demoText.setColor('#66cc66'); });
    demoHit.on('pointerdown', () => {
      GameState.demoMode = true;
      if (GameState.demoBalance <= 0) GameState.refillDemo();
      this.cameras.main.fadeOut(300, 0, 8, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BettingScene'));
    });
  }

  _createBottomButtons(W, H) {
    // Leaderboard button
    this._smallBtn(W / 2 - 80, H - 50, '🏆 SCORES', () => {
      this._showLeaderboard(W, H);
    });

    // Info / How to play
    this._smallBtn(W / 2 + 80, H - 50, 'ℹ INFO', () => {
      this.cameras.main.fadeOut(250, 0, 8, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('InfoScene', { returnScene: 'MenuScene' });
      });
    });
  }

  _smallBtn(x, y, label, cb) {
    const btn = this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'Courier New', color: '#4a7a9a', letterSpacing: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#a8d8f0'));
    btn.on('pointerout', () => btn.setColor('#4a7a9a'));
    btn.on('pointerdown', cb);
    return btn;
  }

  _showLeaderboard(W, H) {
    const entries = Leaderboard.getTop();

    const panel = this.add.graphics().setDepth(80);
    panel.fillStyle(0x020d1e, 0.97);
    panel.fillRoundedRect(W / 2 - 180, H / 2 - 200, 360, 400, 10);
    panel.lineStyle(2, 0x4aa3df);
    panel.strokeRoundedRect(W / 2 - 180, H / 2 - 200, 360, 400, 10);

    const objs = [panel];

    const title = this.add.text(W / 2, H / 2 - 178, '🏆 TOP SCORES', {
      fontSize: '16px', fontFamily: 'Courier New', color: '#a8d8f0',
      fontStyle: 'bold', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(81);
    objs.push(title);

    if (entries.length === 0) {
      const empty = this.add.text(W / 2, H / 2, 'No scores yet — play to get on the board!', {
        fontSize: '12px', fontFamily: 'Courier New', color: '#4a7a9a',
        wordWrap: { width: 300 }, align: 'center',
      }).setOrigin(0.5).setDepth(81);
      objs.push(empty);
    } else {
      const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
      entries.forEach((e, i) => {
        const y = H / 2 - 140 + i * 54;
        const row = this.add.graphics().setDepth(81);
        row.fillStyle(i % 2 === 0 ? 0x0a1828 : 0x060e1e);
        row.fillRect(W / 2 - 165, y - 4, 330, 48);
        objs.push(row);

        const medal = this.add.text(W / 2 - 155, y + 4, medals[i], {
          fontSize: '18px',
        }).setDepth(82);
        const name = this.add.text(W / 2 - 128, y + 6, e.name || 'PLAYER', {
          fontSize: '12px', fontFamily: 'Courier New', color: '#a8d8f0',
        }).setDepth(82);
        const payout = this.add.text(W / 2 + 160, y + 2, `+${e.payout}`, {
          fontSize: '16px', fontFamily: 'Courier New', color: '#44ee88', fontStyle: 'bold',
        }).setOrigin(1, 0).setDepth(82);
        const info = this.add.text(W / 2 - 128, y + 24, `Ledge ${e.level} · ${e.multiplier}× · ${e.difficulty || 'normal'}`, {
          fontSize: '10px', fontFamily: 'Courier New', color: '#4a7a9a',
        }).setDepth(82);
        objs.push(medal, name, payout, info);
      });
    }

    const closeBtn = this.add.text(W / 2, H / 2 + 175, 'CLOSE', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#4aa3df',
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(82).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => objs.forEach(o => o.destroy()));
    objs.push(closeBtn);
  }
}

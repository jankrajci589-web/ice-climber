import CONFIG from '../config.js';
import GameState from '../state/GameState.js';
import { crackProbability } from '../math/DangerModel.js';
import GameAPI from '../api/GameAPI.js';
import Mountain from '../objects/Mountain.js';
import Ledge from '../objects/Ledge.js';
import Climber from '../objects/Climber.js';
import Avalanche from '../objects/Avalanche.js';
import HUD from '../ui/HUD.js';
import Particles from '../ui/Particles.js';
import SoundManager from '../ui/SoundManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.gameState = 'idle';
    this.autoClimb = false;
    this._autoClimbTimer = null;

    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    SoundManager.unlock();

    // ── Background ────────────────────────────────────
    this.mountain = new Mountain(this, GameState.skin);
    this.mountain.setDepth(0);

    // ── Ledges ────────────────────────────────────────
    this.ledges = [];
    const startX = W / 2;
    this.ledges.push(new Ledge(this, startX, H - 140, true));
    for (let i = 1; i < CONFIG.LEDGE_COUNT; i++) {
      this.ledges.push(new Ledge(this, this._randomLedgeX(), H - 140 - i * CONFIG.LEDGE_SPACING_Y));
    }
    if (this.ledges.length > 1) this.ledges[1].setHighlighted(true);

    // ── Game objects ──────────────────────────────────
    this.climber = new Climber(this, startX, H - 140);
    this.particles = new Particles(this);
    this.avalanche = new Avalanche(this);

    // ── HUD ───────────────────────────────────────────
    this.hud = new HUD(this);
    this.hud.setClimbEnabled(true);
    this.hud.setDescendEnabled(false);
    this.hud.onClimb(() => this._climb());
    this.hud.onDescend(() => this._descend());
    this.hud.onAutoClimbToggle((enabled) => this._setAutoClimb(enabled));
    this.hud.update(0, CONFIG.LOSS_ZONE_MULTIPLIERS[0], CONFIG.STARTING_DANGER, 0);

    // ── Keyboard shortcuts ────────────────────────────
    this.input.keyboard.on('keydown-SPACE', () => this._climb());
    this.input.keyboard.on('keydown-D', () => this._descend());
    this.input.keyboard.on('keydown-A', () => this._setAutoClimb(!this.autoClimb));

    // ── Touch controls (swipe-down only — buttons handle taps) ───
    this._swipeStartY = null;
    this.input.on('pointerdown', (ptr) => { this._swipeStartY = ptr.y; });
    this.input.on('pointerup', (ptr) => {
      if (this._swipeStartY !== null && (ptr.y - this._swipeStartY) > 80) this._descend();
      this._swipeStartY = null;
    });

    // ── Ambient wind ──────────────────────────────────
    this._windTimer = this.time.addEvent({ delay: 4000, loop: true, callback: () => SoundManager.wind() });

    // ── RG session timer display ──────────────────────
    this._rgTimer = this.time.addEvent({ delay: 30000, loop: true, callback: () => this._checkRGLimits() });

    // ── Flash overlay ─────────────────────────────────
    this._flash = this.add.graphics().setDepth(100).setAlpha(0);

    this.cameras.main.fadeIn(400, 0, 8, 20);
  }

  _randomLedgeX() {
    const margin = 80;
    return margin + Math.random() * (CONFIG.CANVAS_WIDTH - margin * 2);
  }

  _flashScreen(color, alpha = 0.45, duration = 180) {
    this._flash.clear();
    this._flash.fillStyle(color, 1);
    this._flash.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    this._flash.setAlpha(alpha);
    this.tweens.add({ targets: this._flash, alpha: 0, duration, ease: 'Quad.easeOut' });
  }

  _setAutoClimb(enabled) {
    this.autoClimb = enabled;
    this.hud.setAutoClimbActive(enabled);
    if (!enabled && this._autoClimbTimer) {
      this._autoClimbTimer.destroy();
      this._autoClimbTimer = null;
    }
    if (enabled && this.gameState === 'idle') {
      this._scheduleAutoClimb();
    }
  }

  _scheduleAutoClimb() {
    if (!this.autoClimb) return;
    this._autoClimbTimer = this.time.delayedCall(1400, () => {
      if (this.autoClimb && this.gameState === 'idle') this._climb();
    });
  }

  _climb() {
    if (this.gameState !== 'idle') return;
    this.gameState = 'animating';
    if (this._autoClimbTimer) { this._autoClimbTimer.destroy(); this._autoClimbTimer = null; }

    SoundManager.climb();
    this.hud.setClimbEnabled(false);
    this.hud.setDescendEnabled(false);

    const targetLedge = this.ledges[1];
    const targetY = targetLedge.topY;
    const targetX = targetLedge.centerX;

    // Lean/flip in direction of travel
    const leanDir = targetX >= this.climber.image.x ? 1 : -1;
    this.tweens.add({ targets: this.climber.image, scaleX: leanDir, duration: 60 });

    this.tweens.add({
      targets: this.climber.image, x: targetX,
      duration: CONFIG.CLIMB_DURATION, ease: 'Power2.easeOut',
    });

    this.climber.playClimb(targetY, () => {
      SoundManager.land();
      this._evaluateLedge(targetLedge);
    });
  }

  async _evaluateLedge(ledge) {
    const nextLevel = GameState.currentLevel + 1;
    const { result, multiplier } = await GameAPI.step(GameState.serverRoundId);

    if (result === 'crack') {
      // ── CRACK ──────────────────────────────────────
      this.gameState = 'cracking';
      SoundManager.crack();
      this._flashScreen(0xff2200, 0.35, 250);
      this.particles.burst(ledge.centerX, ledge.topY);
      ledge.setHighlighted(false);

      this.tweens.add({
        targets: this.climber.image, x: this.climber.image.x + 8,
        duration: 60, yoyo: true, repeat: 2,
        onComplete: () => ledge.crack(() => this._fall()),
      });

    } else if (result === 'near-miss') {
      // ── NEAR MISS ──────────────────────────────────
      this._nearMiss(ledge, nextLevel, multiplier);

    } else {
      // ── SAFE ───────────────────────────────────────
      this._onSafe(ledge, nextLevel, multiplier);
    }
  }

  _nearMiss(ledge, nextLevel, multiplier) {
    // Ledge wobbles but holds — tension!
    SoundManager.crack();
    this._flashScreen(0xffaa00, 0.2, 300);

    // Shake the ledge image
    this.tweens.add({
      targets: ledge.image, x: ledge.x + 5,
      duration: 50, yoyo: true, repeat: 5,
      onComplete: () => {
        // Swap to cracked texture but don't break
        ledge.image.setTexture('ledge-cracked');

        // Show "NEAR MISS!" label
        const label = this.add.text(ledge.centerX, ledge.topY - 20, 'NEAR MISS!', {
          fontSize: '14px', fontFamily: 'Courier New', color: '#ffaa00',
          fontStyle: 'bold', letterSpacing: 2,
        }).setOrigin(0.5).setDepth(60);
        this.tweens.add({
          targets: label, y: label.y - 30, alpha: 0, duration: 900,
          onComplete: () => label.destroy(),
        });

        // Then resolve as safe
        this._onSafe(ledge, nextLevel, multiplier);
      },
    });
  }

  _onSafe(ledge, nextLevel, multiplier) {
    GameState.recordClimb(nextLevel, multiplier);
    ledge.setHighlighted(false);
    this._flashScreen(0x00ff88, 0.12, 200);

    this._scrollWorld(() => {
      if (this.ledges.length > 1) this.ledges[1].setHighlighted(true);

      this.hud.update(nextLevel, multiplier, crackProbability(nextLevel + 1), GameState.streak);
      this.particles.setIntensity(nextLevel);

      this.gameState = 'idle';
      this.hud.setClimbEnabled(true);
      this.hud.setDescendEnabled(true);

      if (nextLevel % 5 === 0) {
        SoundManager.milestone();
        this.particles.starBurst(this.climber.image.x, this.climber.image.y - 20);
      }

      if (this.autoClimb) this._scheduleAutoClimb();
    });
  }

  _scrollWorld(onComplete) {
    const scrollAmount = CONFIG.LEDGE_SPACING_Y;
    const duration = 350;

    // Stop the idle bob tween BEFORE scroll — they fight over climber.image.y
    this.climber.pauseIdle();

    // Ledge targets only
    const ledgeTargets = [];
    this.ledges.forEach(l => ledgeTargets.push(l.image, l.halfLeft, l.halfRight, l.glow));

    this.tweens.add({
      targets: ledgeTargets,
      y: `+=${scrollAmount}`,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.ledges.forEach(l => { l.y = l.image.y; });
      },
      onComplete: () => {
        this.mountain.scroll(1.5);
        const oldest = this.ledges.shift();
        oldest.setPosition(this._randomLedgeX(), this.ledges[this.ledges.length - 1].topY - scrollAmount);
        oldest.reset();
        this.ledges.push(oldest);
      },
    });

    // Climber scroll — separate tween, restarts idle only when fully done
    this.tweens.add({
      targets: this.climber.image,
      y: `+=${scrollAmount}`,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.climber.y = this.climber.image.y;
      },
      onComplete: () => {
        this.climber.resumeIdle();
        if (onComplete) onComplete();
      },
    });
  }

  _fall() {
    this.gameState = 'falling';
    GameState.settleCrash();
    SoundManager.fall();
    this._flashScreen(0xff0000, 0.5, 400);

    this.climber.playFall(() => {
      SoundManager.avalanche();
      this.avalanche.play(() => this._goToResult());
    });
  }

  async _descend() {
    if (this.gameState !== 'idle') return;
    if (GameState.currentLevel === 0) return;
    this.gameState = 'cashed_out';
    if (this._autoClimbTimer) { this._autoClimbTimer.destroy(); this._autoClimbTimer = null; }
    this.autoClimb = false;
    this.hud.setAutoClimbActive(false);

    this.hud.setClimbEnabled(false);
    this.hud.setDescendEnabled(false);

    SoundManager.cashOut();
    this._flashScreen(0x00ffcc, 0.3, 300);

    const { payout, serverSeed } = await GameAPI.cashout(GameState.serverRoundId);
    GameState.lastRoundSeed = serverSeed;
    await GameState.settleCashOut(payout);

    this.particles.starBurst(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
    this.climber.playWin(() => this._goToResult());
  }

  _checkRGLimits() {
    if (GameState.isLossLimitReached() || GameState.isTimeLimitReached()) {
      // Force descend or show warning
      if (this.gameState === 'idle' && GameState.currentLevel > 0) {
        this._descend();
      }
    }
  }

  _goToResult() {
    this.cameras.main.fadeOut(500, 0, 8, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ResultScene', {
        outcome: GameState.runResult,
        level: GameState.currentLevel,
        multiplier: GameState.currentMultiplier,
        bet: GameState.currentBet,
        payout: GameState.lastPayout,
        balance: GameState.balance,
        streak: GameState.streak,
        roundSeed: GameState.lastRoundSeed,
        roundHash: GameState.lastRoundHash,
        rollValue: GameState.lastRoundRoll,
      });
    });
  }

  shutdown() {
    this.tweens.killAll();
    if (this._windTimer) this._windTimer.destroy();
    if (this._rgTimer) this._rgTimer.destroy();
    if (this._autoClimbTimer) this._autoClimbTimer.destroy();
    if (this.climber) this.climber.destroy();
    if (this.avalanche) this.avalanche.destroy();
    if (this.particles) this.particles.destroy();
    this.ledges.forEach(l => l.destroy());
    this.ledges = [];
  }
}

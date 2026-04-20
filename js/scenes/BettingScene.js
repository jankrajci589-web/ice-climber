import GameState from '../state/GameState.js';
import CONFIG from '../config.js';
import GameAPI from '../api/GameAPI.js';
import WalletAPI from '../wallet/WalletAPI.js';

export default class BettingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BettingScene' });
  }

  create() {
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const skin = CONFIG.SKINS[GameState.skin] || CONFIG.SKINS.default;

    this.bg = this.add.tileSprite(0, 0, W, H, skin.key).setOrigin(0, 0);
    this.bg.tileScaleY = H / 160;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x020810, 0.75);
    overlay.fillRect(0, 0, W, H);

    this.add.particles(0, 0, 'snowflake', {
      x: { min: 0, max: W }, y: -5,
      speedY: { min: 30, max: 70 }, speedX: { min: -10, max: 10 },
      lifespan: 6000, quantity: 1, frequency: 250, alpha: { start: 0.6, end: 0 },
    });

    this._setupDOM();
    this.cameras.main.fadeIn(300, 0, 8, 20);
  }

  _setupDOM() {
    const overlay_el = document.getElementById('ui-overlay');
    const balanceEl = document.getElementById('balance-value');
    const betInput = document.getElementById('bet-input');
    const betError = document.getElementById('bet-error');

    overlay_el.style.display = 'block';
    balanceEl.textContent = GameState.activeBalance;

    if (WalletAPI.enabled && !GameState.demoMode) {
      balanceEl.textContent = '...';
      WalletAPI.getBalance().then(bal => {
        GameState.balance = bal;
        balanceEl.textContent = bal;
      }).catch(() => {
        balanceEl.textContent = 'ERR';
      });
    }

    // Demo badge
    const existingBadge = document.getElementById('demo-badge');
    if (existingBadge) existingBadge.remove();
    if (GameState.demoMode) {
      const badge = document.createElement('div');
      badge.id = 'demo-badge';
      badge.textContent = '🎮 DEMO MODE — No real money';
      badge.style.cssText = 'background:#0f2a0f;border:1px solid #3a6a3a;color:#66cc66;font-family:Courier New;font-size:11px;letter-spacing:1px;padding:6px 12px;border-radius:4px;margin-bottom:12px;text-align:center;';
      document.getElementById('bet-panel').insertBefore(badge, document.getElementById('bet-panel').firstChild);
    }

    // ── Bet controls ──────────────────────────────────
    document.getElementById('btn-half').onclick = () => {
      betInput.value = Math.max(CONFIG.MIN_BET, Math.floor((parseFloat(betInput.value) || 0) / 2));
      betError.textContent = '';
    };
    document.getElementById('btn-double').onclick = () => {
      const doubled = Math.floor((parseFloat(betInput.value) || 0) * 2);
      betInput.value = Math.min(doubled, GameState.activeBalance);
      betError.textContent = '';
    };
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => { betInput.value = btn.dataset.amount; betError.textContent = ''; };
    });
    document.getElementById('btn-max').onclick = () => {
      betInput.value = GameState.activeBalance;
      betError.textContent = '';
    };

    // ── Difficulty selector ───────────────────────────
    this._syncToggle('difficulty-group', GameState.difficulty);
    document.getElementById('difficulty-group').querySelectorAll('.toggle-btn').forEach(btn => {
      btn.onclick = () => {
        GameState.setDifficulty(btn.dataset.value);
        this._syncToggle('difficulty-group', btn.dataset.value);
      };
    });

    // ── Skin selector ─────────────────────────────────
    this._syncToggle('skin-group', GameState.skin);
    document.getElementById('skin-group').querySelectorAll('.toggle-btn').forEach(btn => {
      btn.onclick = () => {
        GameState.setSkin(btn.dataset.value);
        this._syncToggle('skin-group', btn.dataset.value);
        // Live-update background
        const skin = CONFIG.SKINS[btn.dataset.value] || CONFIG.SKINS.default;
        if (this.bg) this.bg.setTexture(skin.key);
      };
    });

    // ── Responsible Gambling ──────────────────────────
    const rgLossEnabled = document.getElementById('rg-loss-enabled');
    const rgLossValue = document.getElementById('rg-loss-value');
    const rgTimeEnabled = document.getElementById('rg-time-enabled');
    const rgTimeValue = document.getElementById('rg-time-value');

    rgLossEnabled.checked = GameState.lossLimitEnabled;
    rgLossValue.value = GameState.lossLimit;
    rgTimeEnabled.checked = GameState.timeLimitEnabled;
    rgTimeValue.value = GameState.timeLimitMinutes;

    rgLossEnabled.onchange = () => { GameState.lossLimitEnabled = rgLossEnabled.checked; };
    rgLossValue.onchange = () => { GameState.lossLimit = +rgLossValue.value; };
    rgTimeEnabled.onchange = () => { GameState.timeLimitEnabled = rgTimeEnabled.checked; };
    rgTimeValue.onchange = () => { GameState.timeLimitMinutes = +rgTimeValue.value; };

    // ── Info link ─────────────────────────────────────
    document.getElementById('open-info').onclick = () => {
      overlay_el.style.display = 'none';
      this.cameras.main.fadeOut(250, 0, 8, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('InfoScene', { returnScene: 'BettingScene' });
      });
    };

    // ── Check RG limits before allowing play ──────────
    if (GameState.isLossLimitReached() || GameState.isTimeLimitReached()) {
      this._showRGWarning();
      return;
    }

    // ── Start button ──────────────────────────────────
    document.getElementById('btn-start').onclick = async () => {
      const amount = parseFloat(betInput.value);
      if (!amount || amount < CONFIG.MIN_BET) { betError.textContent = `MIN BET IS ${CONFIG.MIN_BET}`; return; }
      if (amount > GameState.activeBalance) { betError.textContent = 'INSUFFICIENT BALANCE'; return; }

      betError.textContent = '';
      overlay_el.style.display = 'none';

      const { roundId, serverSeedHash } = await GameAPI.startRound(amount, GameState.difficulty);
      GameState.serverRoundId = roundId;
      GameState.lastRoundHash = serverSeedHash;
      GameState.lastRoundSeed = '';  // revealed by server after round ends

      GameState.placeBet(amount);
      this.cameras.main.fadeOut(300, 0, 8, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
    };
  }

  _syncToggle(groupId, activeValue) {
    document.getElementById(groupId).querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === activeValue);
    });
  }

  _showRGWarning() {
    let box = document.getElementById('rg-warning');
    if (!box) {
      box = document.createElement('div');
      box.id = 'rg-warning';
      box.innerHTML = `
        <div id="rg-warning-box">
          <h3>⚠ LIMIT REACHED</h3>
          <p>${GameState.isLossLimitReached()
            ? `You have reached your loss limit of ${GameState.lossLimit}.`
            : `You have reached your session time limit of ${GameState.timeLimitMinutes} minutes.`}
          <br/><br/>Please take a break and play responsibly.</p>
          <button id="rg-ok-btn">OK</button>
        </div>`;
      document.body.appendChild(box);
      document.getElementById('rg-ok-btn').onclick = () => box.classList.remove('visible');
    }
    box.classList.add('visible');
  }

  update() {
    if (this.bg) this.bg.tilePositionY -= 0.3;
  }

  shutdown() {
    const overlay_el = document.getElementById('ui-overlay');
    if (overlay_el) overlay_el.style.display = 'none';
  }
}

import CONFIG from '../config.js';
import WalletAPI from '../wallet/WalletAPI.js';

const GameState = {
  // ── Mode ──────────────────────────────────────────────
  demoMode: false,
  demoBalance: 1000,
  DEMO_START_BALANCE: 1000,

  // ── Balance & Run ─────────────────────────────────────
  balance: CONFIG.STARTING_BALANCE,
  currentBet: 0,
  currentLevel: 0,
  currentMultiplier: 1.0,
  runResult: null,       // 'win' | 'loss' | null
  lastPayout: 0,
  streak: 0,             // consecutive successful climbs in current run

  // ── Settings ──────────────────────────────────────────
  difficulty: 'normal',
  dangerIncrement: CONFIG.DIFFICULTIES.normal.increment,
  skin: 'default',

  // ── Bet History (last 10 rounds) ──────────────────────
  betHistory: [],        // [{ bet, outcome, level, multiplier, payout, date }]

  // ── Session ───────────────────────────────────────────
  sessionStartBalance: CONFIG.STARTING_BALANCE,
  sessionStartTime: Date.now(),

  // ── Responsible Gambling ─────────────────────────────
  lossLimitEnabled: false,
  lossLimit: 200,
  timeLimitEnabled: false,
  timeLimitMinutes: 60,

  // ── Provably Fair ─────────────────────────────────────
  lastRoundSeed: '',
  lastRoundHash: '',
  lastRoundRoll: 0,
  currentRoundId: '',
  serverRoundId: '',

  // ── Methods ───────────────────────────────────────────
  setDifficulty(key) {
    this.difficulty = key;
    this.dangerIncrement = CONFIG.DIFFICULTIES[key].increment;
  },

  setSkin(key) {
    this.skin = key;
  },

  // Active balance — reads demo or real depending on mode
  get activeBalance() {
    return this.demoMode ? this.demoBalance : this.balance;
  },

  _deductBalance(amount) {
    if (this.demoMode) this.demoBalance = +(this.demoBalance - amount).toFixed(2);
    else this.balance = +(this.balance - amount).toFixed(2);
  },

  _addBalance(amount) {
    if (this.demoMode) this.demoBalance = +(this.demoBalance + amount).toFixed(2);
    else this.balance = +(this.balance + amount).toFixed(2);
  },

  refillDemo() {
    this.demoBalance = this.DEMO_START_BALANCE;
  },

  async placeBet(amount) {
    this.currentBet = amount;
    this.currentLevel = 0;
    this.currentMultiplier = 1.0;
    this.runResult = null;
    this.lastPayout = 0;
    this.streak = 0;
    this.currentRoundId = `round_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (WalletAPI.enabled && !this.demoMode) {
      const newBalance = await WalletAPI.debit(amount, this.currentRoundId);
      this.balance = newBalance;
    } else {
      this._deductBalance(amount);
    }
  },

  recordClimb(level, multiplier) {
    this.currentLevel = level;
    this.currentMultiplier = multiplier;
    this.streak++;
  },

  async settleCashOut(payout) {
    payout = payout ?? +(this.currentBet * this.currentMultiplier).toFixed(2);
    this.lastPayout = payout;
    this.runResult = 'win';
    this._pushHistory('win', payout);

    if (WalletAPI.enabled && !this.demoMode) {
      const newBalance = await WalletAPI.credit(payout, this.currentRoundId);
      this.balance = newBalance;
    } else {
      this._addBalance(payout);
    }
    return payout;
  },

  settleCrash() {
    this.lastPayout = 0;
    this.runResult = 'loss';
    this._pushHistory('loss', 0);
  },

  _pushHistory(outcome, payout) {
    this.betHistory.unshift({
      bet: this.currentBet,
      outcome,
      level: this.currentLevel,
      multiplier: this.currentMultiplier,
      payout,
      profit: outcome === 'win' ? +(payout - this.currentBet).toFixed(2) : -this.currentBet,
      date: new Date().toLocaleTimeString(),
    });
    if (this.betHistory.length > 10) this.betHistory.pop();
  },

  resetRun() {
    this.currentBet = 0;
    this.currentLevel = 0;
    this.currentMultiplier = 1.0;
    this.runResult = null;
    this.lastPayout = 0;
    this.streak = 0;
  },

  getSessionLoss() {
    if (this.demoMode) return 0;
    return +(this.sessionStartBalance - this.balance).toFixed(2);
  },

  getSessionMinutes() {
    return Math.floor((Date.now() - this.sessionStartTime) / 60000);
  },

  isLossLimitReached() {
    return this.lossLimitEnabled && this.getSessionLoss() >= this.lossLimit;
  },

  isTimeLimitReached() {
    return this.timeLimitEnabled && this.getSessionMinutes() >= this.timeLimitMinutes;
  },
};

export default GameState;

import CONFIG from '../config.js';
import GameState from '../state/GameState.js';
import { getFullTable } from '../math/MultiplierModel.js';

export default class InfoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InfoScene' });
  }

  init(data) {
    this.returnScene = data?.returnScene || 'MenuScene';
  }

  create() {
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x020810);
    bg.fillRect(0, 0, W, H);

    // Header
    const hdr = this.add.graphics();
    hdr.fillStyle(0x0a1e3c);
    hdr.fillRect(0, 0, W, 54);
    hdr.lineStyle(1, 0x1a3a6a);
    hdr.strokeRect(0, 54, W, 0);

    this.add.text(W / 2, 27, 'HOW TO PLAY', {
      fontSize: '16px', fontFamily: 'Courier New',
      color: '#a8d8f0', fontStyle: 'bold', letterSpacing: 4,
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(20, 27, '← BACK', {
      fontSize: '12px', fontFamily: 'Courier New',
      color: '#4a7a9a', letterSpacing: 2,
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#a8d8f0'));
    backBtn.on('pointerout', () => backBtn.setColor('#4a7a9a'));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 0, 8, 20);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(this.returnScene);
      });
    });

    // Tabs
    this._tab = 'rules';
    this._tabBtns = {};
    this._panels = {};
    this._buildTabs(W, H);
    this._showTab('rules');

    this.cameras.main.fadeIn(250, 0, 8, 20);
  }

  _buildTabs(W, H) {
    const tabs = ['rules', 'paytable', 'fairness'];
    const labels = ['RULES', 'PAYTABLE', 'FAIRNESS'];
    const tabW = W / tabs.length;

    const tabBg = this.add.graphics();
    tabBg.fillStyle(0x050f1e);
    tabBg.fillRect(0, 54, W, 32);

    tabs.forEach((key, i) => {
      const x = i * tabW;
      const btn = this.add.text(x + tabW / 2, 70, labels[i], {
        fontSize: '11px', fontFamily: 'Courier New',
        color: '#4a7a9a', letterSpacing: 2,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      const underline = this.add.graphics();
      this._tabBtns[key] = { btn, underline, x, tabW };

      btn.on('pointerdown', () => this._showTab(key));
    });

    // Build panels
    this._panels.rules = this._buildRulesPanel(W, H);
    this._panels.paytable = this._buildPaytablePanel(W, H);
    this._panels.fairness = this._buildFairnessPanel(W, H);
  }

  _showTab(key) {
    this._tab = key;

    // Update tab styles
    Object.entries(this._tabBtns).forEach(([k, { btn, underline, x, tabW }]) => {
      const active = k === key;
      btn.setColor(active ? '#a8d8f0' : '#4a7a9a');
      underline.clear();
      if (active) {
        underline.lineStyle(2, 0x4aa3df);
        underline.strokeRect(x + 10, 83, tabW - 20, 0);
      }
    });

    // Show/hide panels
    Object.entries(this._panels).forEach(([k, objs]) => {
      objs.forEach(o => o.setVisible(k === key));
    });
  }

  _buildRulesPanel(W, H) {
    const objs = [];
    const rules = [
      ['OBJECTIVE', 'Climb as high as possible & cash out\nbefore the ice ledge cracks.'],
      ['CLIMB', 'Press CLIMB (or SPACE) to attempt the\nnext ledge. Each climb risks your bet.'],
      ['DESCEND', 'Press DESCEND (or D) at any time to\ncash out your current multiplier.'],
      ['DANGER', 'Crack probability starts at 5% and\nincreases +4% per ledge (Normal).'],
      ['MULTIPLIER', 'Each safe climb increases your\nmultiplier. Higher = riskier!'],
      ['NEAR MISS', 'If the ledge wobbles but holds, you\nare in the near-miss zone — be careful.'],
    ];

    let y = 100;
    rules.forEach(([title, desc]) => {
      const t1 = this.add.text(24, y, title, {
        fontSize: '12px', fontFamily: 'Courier New',
        color: '#4aa3df', fontStyle: 'bold', letterSpacing: 2,
      });
      const t2 = this.add.text(24, y + 16, desc, {
        fontSize: '11px', fontFamily: 'Courier New',
        color: '#7a9ab0', lineSpacing: 4,
      });
      const sep = this.add.graphics();
      sep.lineStyle(1, 0x0a2040);
      sep.strokeRect(20, y + 52, W - 40, 0);
      objs.push(t1, t2, sep);
      y += 60;
    });

    return objs;
  }

  _buildPaytablePanel(W, H) {
    const objs = [];
    const table = getFullTable();

    const header = this.add.text(W / 2, 100, 'LEDGE → MULTIPLIER (current difficulty)', {
      fontSize: '10px', fontFamily: 'Courier New',
      color: '#4a7a9a', letterSpacing: 1,
    }).setOrigin(0.5);
    objs.push(header);

    // RTP
    const diff = CONFIG.DIFFICULTIES[GameState.difficulty];
    const rtpText = this.add.text(W / 2, 116, `Difficulty: ${diff.label}  |  ${diff.desc}`, {
      fontSize: '11px', fontFamily: 'Courier New', color: diff.color,
    }).setOrigin(0.5);
    objs.push(rtpText);

    // Two-column table
    const cols = 2;
    const colW = (W - 40) / cols;
    const rowH = 22;
    const startY = 136;

    table.forEach((mult, i) => {
      const level = i + 1;
      const col = Math.floor(i / 10);
      const row = i % 10;
      const x = 20 + col * colW;
      const y = startY + row * rowH;

      const bg2 = this.add.graphics();
      bg2.fillStyle(row % 2 === 0 ? 0x060f1e : 0x030810);
      bg2.fillRect(x, y, colW - 4, rowH - 1);
      objs.push(bg2);

      const color = mult >= 5 ? '#ff6644' : mult >= 2 ? '#ffdd44' : '#44ddaa';
      const t = this.add.text(x + 8, y + 4, `Ledge ${String(level).padStart(2, ' ')}`, {
        fontSize: '11px', fontFamily: 'Courier New', color: '#6a8a9a',
      });
      const m = this.add.text(x + colW - 12, y + 4, `${mult}×`, {
        fontSize: '11px', fontFamily: 'Courier New', color, fontStyle: 'bold',
      }).setOrigin(1, 0);
      objs.push(t, m);
    });

    return objs;
  }

  _buildFairnessPanel(W, H) {
    const objs = [];
    const lines = [
      ['PROVABLY FAIR', '#a8d8f0'],
      ['', ''],
      ['Each round uses crypto.getRandomValues()', '#7a9ab0'],
      ['for true randomness — not Math.random().', '#7a9ab0'],
      ['', ''],
      ['ROUND SEED', '#4aa3df'],
      ['A unique seed is generated before each', '#7a9ab0'],
      ['round. Its SHA-256 hash is displayed', '#7a9ab0'],
      ['so you can verify the outcome after.', '#7a9ab0'],
      ['', ''],
      ['VERIFICATION', '#4aa3df'],
      ['After each round, the full seed + roll', '#7a9ab0'],
      ['value is shown in the result screen.', '#7a9ab0'],
      ['', ''],
      ['RTP (Return to Player)', '#4aa3df'],
      ['Easy:   ~97%', '#44ee88'],
      ['Normal: ~96%', '#ffdd44'],
      ['Hard:   ~95%', '#ff6644'],
    ];

    let y = 100;
    lines.forEach(([text, color]) => {
      if (!text) { y += 8; return; }
      const t = this.add.text(24, y, text, {
        fontSize: '12px', fontFamily: 'Courier New', color,
      });
      objs.push(t);
      y += 18;
    });

    return objs;
  }
}

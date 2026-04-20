import CONFIG from './config.js';
import WalletAPI from './wallet/WalletAPI.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import BettingScene from './scenes/BettingScene.js';
import GameScene from './scenes/GameScene.js';
import ResultScene from './scenes/ResultScene.js';
import InfoScene from './scenes/InfoScene.js';

const config = {
  type: Phaser.AUTO,
  width: CONFIG.CANVAS_WIDTH,
  height: CONFIG.CANVAS_HEIGHT,
  backgroundColor: '#050d1a',
  pixelArt: true,
  roundPixels: true,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, BettingScene, GameScene, ResultScene, InfoScene],
};

WalletAPI.init();
new Phaser.Game(config);

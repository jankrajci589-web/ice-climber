import CONFIG from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }
  create() { this._generateTextures(); this.scene.start('MenuScene'); }
  _generateTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const W = CONFIG.CANVAS_WIDTH;
    g.clear();g.fillStyle(0x222233);g.fillRect(1,24,5,4);g.fillRect(10,24,5,4);g.fillStyle(0x2255aa);g.fillRect(2,18,4,7);g.fillRect(10,18,4,7);g.fillStyle(0x1a4fa0);g.fillRect(1,10,14,10);g.fillRect(-2,11,4,3);g.fillRect(14,11,4,3);g.fillStyle(0xcc3300);g.fillRect(-3,13,3,3);g.fillRect(16,13,3,3);g.fillStyle(0xf0c090);g.fillRect(6,7,4,4);g.fillRect(4,0,8,8);g.fillStyle(0x111111);g.fillRect(5,2,2,2);g.fillRect(9,2,2,2);g.fillStyle(0xdd2200);g.fillRect(3,0,10,3);
    g.generateTexture('climber-idle',16,28);
    g.clear();g.fillStyle(0x222233);g.fillRect(1,24,5,4);g.fillRect(10,24,5,4);g.fillStyle(0x2255aa);g.fillRect(1,17,4,8);g.fillRect(11,17,4,8);g.fillStyle(0x1a4fa0);g.fillRect(1,9,14,10);g.fillRect(-3,4,4,7);g.fillRect(15,4,4,7);g.fillStyle(0xcc3300);g.fillRect(-4,2,3,3);g.fillRect(17,2,3,3);g.fillStyle(0xf0c090);g.fillRect(6,6,4,4);g.fillRect(4,0,8,7);g.fillStyle(0x111111);g.fillRect(5,1,2,2);g.fillRect(9,1,2,2);g.fillStyle(0xdd2200);g.fillRect(3,0,10,3);
    g.generateTexture('climber-climb',16,28);
    g.clear();g.fillStyle(0x1a4fa0);g.fillRect(2,8,12,10);g.fillRect(-5,7,7,3);g.fillRect(14,7,7,3);g.fillStyle(0xcc3300);g.fillRect(-7,6,3,3);g.fillRect(20,6,3,3);g.fillStyle(0x2255aa);g.fillRect(0,17,4,7);g.fillRect(12,17,4,7);g.fillStyle(0x222233);g.fillRect(-1,22,5,4);g.fillRect(12,22,5,4);g.fillStyle(0xf0c090);g.fillRect(4,0,8,8);g.fillStyle(0x111111);g.fillRect(5,3,2,2);g.fillRect(9,3,2,2);g.fillStyle(0x882200);g.fillRect(6,6,4,2);g.fillStyle(0xdd2200);g.fillRect(3,0,10,3);
    g.generateTexture('climber-fall',24,28);
    this._drawLedge(g,false);g.generateTexture('ledge-solid',CONFIG.LEDGE_WIDTH,CONFIG.LEDGE_HEIGHT);
    this._drawLedge(g,true);g.generateTexture('ledge-cracked',CONFIG.LEDGE_WIDTH,CONFIG.LEDGE_HEIGHT);
    this._drawLedgeHalf(g,'left');g.generateTexture('ledge-half-left',CONFIG.LEDGE_WIDTH/2,CONFIG.LEDGE_HEIGHT);
    this._drawLedgeHalf(g,'right');g.generateTexture('ledge-half-right',CONFIG.LEDGE_WIDTH/2,CONFIG.LEDGE_HEIGHT);
    g.clear();g.fillStyle(0xffffff);g.fillRect(1,0,1,3);g.fillRect(0,1,3,1);g.generateTexture('snowflake',3,3);
    g.clear();g.fillStyle(0xddeeff);g.fillRect(2,0,2,6);g.fillRect(0,2,6,2);g.fillRect(1,1,1,1);g.fillRect(4,1,1,1);g.fillRect(1,4,1,1);g.fillRect(4,4,1,1);g.generateTexture('snowflake-large',6,6);
    g.clear();g.fillStyle(0xff8833);g.fillRect(0,0,2,2);g.fillStyle(0xffcc44);g.fillRect(1,0,1,1);g.generateTexture('ember',2,2);
    g.clear();g.fillStyle(0xffdd44);g.fillRect(1,0,2,4);g.fillRect(0,1,4,2);g.generateTexture('star',4,4);
    g.clear();g.fillStyle(0x7a8090);g.fillRect(2,0,10,3);g.fillRect(0,2,14,8);g.fillRect(2,9,10,3);g.fillStyle(0x9aaab0);g.fillRect(3,1,4,3);g.fillRect(1,4,3,3);g.generateTexture('boulder',14,12);
    const TH=720;
    this._drawBgLayer(g,'night','far',W,TH);g.generateTexture('bg-night-far',W,TH);
    this._drawBgLayer(g,'night','mid',W,TH);g.generateTexture('bg-night-mid',W,TH);
    this._drawBgLayer(g,'night','near',W,TH);g.generateTexture('bg-night-near',W,TH);
    this._drawBgLayer(g,'storm','far',W,TH);g.generateTexture('bg-storm-far',W,TH);
    this._drawBgLayer(g,'storm','mid',W,TH);g.generateTexture('bg-storm-mid',W,TH);
    this._drawBgLayer(g,'storm','near',W,TH);g.generateTexture('bg-storm-near',W,TH);
    this._drawBgLayer(g,'sunset','far',W,TH);g.generateTexture('bg-sunset-far',W,TH);
    this._drawBgLayer(g,'sunset','mid',W,TH);g.generateTexture('bg-sunset-mid',W,TH);
    this._drawBgLayer(g,'sunset','near',W,TH);g.generateTexture('bg-sunset-near',W,TH);
    g.clear();g.fillStyle(0x0d2244);g.fillRect(0,0,W,TH);for(let i=0;i<8;i++){g.fillStyle(0x1a3a6a,0.5);g.fillRect(i*60+10,0,2,TH);}g.generateTexture("wall-tile",W,TH); this._drawBgLayer(g,"night","near",W,160);g.generateTexture("mountain-tile",W,160); this._drawBgLayer(g,"storm","near",W,160);g.generateTexture("mountain-tile-storm",W,160); this._drawBgLayer(g,"sunset","near",W,160);g.generateTexture("mountain-tile-sunset",W,160);
    g.destroy();
  }
  _drawLedge(g,cracked){const W=CONFIG.LEDGE_WIDTH,H=CONFIG.LEDGE_HEIGHT;g.clear();g.fillStyle(0x082244);g.fillRect(2,H-2,W-2,2);g.fillStyle(0x4a9fcc);g.fillRect(0,0,W,H-2);g.fillStyle(0x8ad4f0);g.fillRect(0,0,W,3);g.fillStyle(0x6abce0);g.fillRect(2,4,W-4,4);g.fillStyle(0x2a6fa0);g.fillRect(0,H-4,W,2);g.fillStyle(0x3a8fc0);g.fillRect(0,0,2,H-2);g.fillRect(W-2,0,2,H-2);g.fillStyle(0x6ad0f0);g.fillRect(8,H-2,2,3);g.fillRect(8,H+1,1,2);g.fillRect(25,H-2,2,5);g.fillRect(25,H+3,1,2);g.fillRect(55,H-2,2,4);g.fillRect(75,H-2,2,3);if(cracked){g.fillStyle(0x082244);g.fillRect(30,0,1,H-2);g.fillRect(28,3,1,4);g.fillRect(32,5,1,4);g.fillRect(50,2,1,H-4);g.fillRect(48,4,1,3);}}
  _drawLedgeHalf(g,side){const W=CONFIG.LEDGE_WIDTH/2,H=CONFIG.LEDGE_HEIGHT;g.clear();g.fillStyle(0x4a9fcc);g.fillRect(0,0,W,H-2);g.fillStyle(0x8ad4f0);g.fillRect(0,0,W,3);g.fillStyle(0x6abce0);g.fillRect(2,4,W-4,4);g.fillStyle(0x2a6fa0);g.fillRect(0,H-4,W,2);g.fillStyle(0x082244);g.fillRect(0,H-2,W,2);g.fillStyle(0x082244);if(side==='left'){g.fillRect(W-1,0,1,H);g.fillRect(W-3,2,1,3);g.fillRect(W-2,6,1,4);}else{g.fillRect(0,0,1,H);g.fillRect(2,3,1,3);g.fillRect(1,7,1,3);}}
  _drawBgLayer(g,theme,layer,W,H){
    g.clear();
    const T={night:{sky:[0x040c1e,0x071428,0x0a1c38],peak:[0x0c1e40,0x0f2550,0x122e60],snow:[0x8ab8d0,0xa8cce0,0xc0ddef],fog:0x0e2244,accent:0x1a3a6a,stars:true},storm:{sky:[0x090612,0x110a20,0x1a0e30],peak:[0x1c0a38,0x240e48,0x2c1258],snow:[0xb090d0,0xc8a8e8,0xddc0f8],fog:0x1e0a40,accent:0x3a1a6a,lightning:true},sunset:{sky:[0x1e0804,0x3a1208,0x58200c],peak:[0x4a1808,0x5e2010,0x742c18],snow:[0xffd090,0xffe0b0,0xfff0d0],fog:0x5c2010,accent:0x8a3a18,glow:true}}[theme];
    if(layer==='far'){
      g.fillStyle(T.sky[0]);g.fillRect(0,0,W,H*.4);g.fillStyle(T.sky[1]);g.fillRect(0,H*.3,W,H*.4);g.fillStyle(T.sky[2]);g.fillRect(0,H*.6,W,H*.5);
      if(T.stars){const sp=[[12,8],[45,14],[88,6],[130,20],[185,10],[240,16],[295,8],[350,18],[410,11],[455,7],[30,30],[75,22],[145,35],[210,28],[270,24],[340,32],[395,26],[470,30]];g.fillStyle(0xffffff);sp.forEach(([x,y])=>g.fillRect(x,y,1,1));}
      if(T.glow){g.fillStyle(0xff6020,0.18);g.fillRect(0,H*.45,W,18);g.fillStyle(0xff9040,0.12);g.fillRect(0,H*.42,W,30);g.fillStyle(0xffcc60,0.08);g.fillRect(0,H*.40,W,50);}
      if(T.lightning){g.fillStyle(0x2a0a50,0.5);g.fillRect(0,0,W,H*.3);}
      const fc=theme==='night'?0x0a1c38:theme==='storm'?0x160830:0x3a1208;
      g.fillStyle(fc);g.fillTriangle(-20,H,80,H*.62,180,H);g.fillTriangle(90,H,210,H*.55,330,H);g.fillTriangle(200,H,330,H*.48,460,H);g.fillTriangle(330,H,440,H*.58,W+20,H);
    }else if(layer==='mid'){
      g.fillStyle(T.peak[1]);g.fillTriangle(-30,H,60,H*.42,160,H);g.fillTriangle(80,H,200,H*.32,320,H);g.fillTriangle(210,H,320,H*.50,420,H);g.fillTriangle(320,H,430,H*.36,W+20,H);
      g.fillStyle(T.snow[0]);g.fillTriangle(30,H*.55,60,H*.42,90,H*.55);g.fillTriangle(150,H*.48,200,H*.32,250,H*.48);g.fillTriangle(270,H*.65,320,H*.50,370,H*.65);g.fillTriangle(370,H*.52,430,H*.36,480,H*.52);
      g.fillStyle(T.peak[2]);g.fillRect(0,H*.72,W,3);g.fillRect(0,H*.78,W,2);
      g.fillStyle(T.fog,0.22);g.fillRect(0,H*.68,W,20);g.fillStyle(T.fog,0.14);g.fillRect(0,H*.64,W,16);
    }else{
      g.fillStyle(T.peak[0]);g.fillRect(0,H*.78,W,H*.22);
      g.fillStyle(T.snow[1]);g.fillTriangle(-10,H,30,H*.80,90,H);g.fillTriangle(60,H,130,H*.76,210,H);g.fillTriangle(180,H,260,H*.82,340,H);g.fillTriangle(300,H,380,H*.78,460,H);g.fillTriangle(400,H,W,H*.80,W+40,H);
      g.fillStyle(T.snow[2],0.6);g.fillRect(0,H*.78,W,3);
      g.fillStyle(T.accent,0.35);for(let i=0;i<6;i++){const x=i*82+14;g.fillRect(x,H*.82,1,H*.18);g.fillRect(x+3,H*.86,1,H*.14);}
      g.fillStyle(T.fog,0.18);g.fillRect(0,H*.74,W,14);
    }
  }
}

const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
let now=0;
const noop=()=>{};
const grad={addColorStop:noop};
const ctx=new Proxy({
  createLinearGradient:()=>({...grad}),createRadialGradient:()=>({...grad}),
  measureText:t=>({width:String(t).length*7}),
  setTransform:noop,clearRect:noop,fillRect:noop,strokeRect:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,arc:noop,ellipse:noop,fill:noop,stroke:noop,save:noop,restore:noop,translate:noop,rotate:noop,scale:noop,setLineDash:noop,drawImage:noop,roundRect:noop,fillText:noop
},{get:(o,k)=>k in o?o[k]:0,set:(o,k,v)=>(o[k]=v,true)});
const canvas={width:0,height:0,style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:noop,setPointerCapture:noop,releasePointerCapture:noop};
const sandbox={
  console, Math, Date,
  performance:{now:()=>now},
  requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,
  innerWidth:390,innerHeight:844,devicePixelRatio:2,
  window:null,document:{hidden:false,addEventListener:noop},
};
sandbox.window=sandbox; sandbox.window.SF={}; sandbox.addEventListener=noop;
vm.createContext(sandbox);
for(const f of ['config.js']) vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),sandbox,{filename:f});
const SF=sandbox.window.SF;
const nopProxy=new Proxy({}, {get:()=>noop});
SF.ui={...nopProxy,showHud:noop,hideScreens:noop,renderGameOver:noop,flashMsg:noop,renderPause:noop,renderHud:noop};
SF.storage={saveGame:noop,loadRanking:()=>[],saveRanking:noop,loadGame:()=>null,clearGame:noop};
SF.audio=nopProxy;
SF.assets={getBackground:()=>null,getShip:()=>null,getEnemy:()=>null,getObstacle:()=>null};
vm.runInContext(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),sandbox,{filename:'game.js'});
SF.game.init(canvas);
SF.game.startNew('TEST','vanguard');
for(let i=0;i<900;i++){ now+=16; SF.game.loop(now); }
const G=SF.game.state;
if(!G.running) throw new Error('game stopped unexpectedly');
if(!G.layout?.portrait) throw new Error('mobile portrait layout not active');
if(G.formation.y>G.layout.maxFormationY+0.01) throw new Error('formation escaped vertical band');
if(G.enemies.length<1) throw new Error('all enemies vanished during runtime smoke');
if(G.playerBullets.length>70) throw new Error('player bullet cap failed');
if(G.enemyBullets.length>G.layout.enemyBulletCap) throw new Error('enemy bullet cap failed');
console.log('RUNTIME SMOKE OK',{enemies:G.enemies.length,formationY:+G.formation.y.toFixed(1),maxY:+G.layout.maxFormationY.toFixed(1),pBul:G.playerBullets.length,eBul:G.enemyBullets.length,combo:G.combo});

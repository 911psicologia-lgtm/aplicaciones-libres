const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
function noop(){}
function makeCtx(){
  const target={measureText:t=>({width:String(t??'').length*7}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),createPattern:()=>({}),getImageData:()=>({data:new Uint8ClampedArray(4)}),canvas:null};
  return new Proxy(target,{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
}
const ctx2d=makeCtx();
function makeEl(id){
  const e={id,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},addEventListener:noop,removeEventListener:noop,appendChild:noop,remove:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,blur:noop,click:noop,play:()=>Promise.resolve(),pause:noop,load:noop,currentTime:0,duration:180,volume:1,muted:false,paused:true,loop:false,src:'',textContent:'',innerHTML:'',value:'',checked:false,disabled:false,clientWidth:1280,clientHeight:720,offsetWidth:1280,offsetHeight:720,getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720,right:1280,bottom:720})};
  if(id==='game'){e.getContext=()=>ctx2d;e.width=1280;e.height=720;ctx2d.canvas=e;e.toDataURL=()=>'';}
  return e;
}
const els=new Map();
const getEl=id=>{if(!els.has(id))els.set(id,makeEl(id));return els.get(id)};
const document={
  getElementById:getEl,querySelector:()=>makeEl('q'),querySelectorAll:()=>[],createElement:t=>makeEl(t),
  documentElement:{style:{},requestFullscreen:()=>Promise.resolve(),clientWidth:1280,clientHeight:720},body:makeEl('body'),
  fullscreenElement:null,addEventListener:noop,removeEventListener:noop,fonts:{ready:Promise.resolve()},visibilityState:'visible'
};
class ImageMock{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=1024;this.width=1024;this.height=1024;this.onload=null;this.onerror=null;this._src='';}set src(v){this._src=v;if(this.onload)setTimeout(()=>this.onload(),0)}get src(){return this._src}addEventListener(){} }
class AudioMock{constructor(src=''){this.src=src;this.currentTime=0;this.duration=180;this.volume=1;this.paused=true;this.loop=false;}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}addEventListener(){}removeEventListener(){}load(){}}
const visualViewport={width:1280,height:720,addEventListener:noop};
const navigator={serviceWorker:{register:()=>Promise.resolve({})},userAgent:'node-smoke',maxTouchPoints:0};
const location={protocol:'file:',href:'file:///game/index.html'};
const screen={orientation:{lock:()=>Promise.resolve()}};
const performance={now:()=>1000};
const windowObj={document,visualViewport,devicePixelRatio:1,innerWidth:1280,innerHeight:720,navigator,location,screen,performance,addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop}),setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:noop,cancelAnimationFrame:noop,localStorage,Audio:AudioMock,Image:ImageMock};
windowObj.window=windowObj;windowObj.self=windowObj;windowObj.top=windowObj;windowObj.parent=windowObj;
const sandbox={...windowObj,window:windowObj,self:windowObj,globalThis:windowObj,document,navigator,location,screen,performance,visualViewport,localStorage,Audio:AudioMock,Image:ImageMock,console,Math,Date,JSON,Promise,Map,Set,WeakMap,Uint8ClampedArray,Intl};
sandbox.matchMedia=windowObj.matchMedia;sandbox.addEventListener=noop;sandbox.removeEventListener=noop;
vm.createContext(sandbox);
let src=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
src=src.replace(/\}\)\(\);\s*$/,`window.__V2150_TEST={META,G,spawnMicroSwarm,killEnemy,riftAllyPool,summonRiftAlly,updateRiftAlly,hitPlayer,rescueLastChance,sectorBalance,sectorTempo,waveGoal,difficulty,SECTORS,BOSS_ANIMATIONS,CH2_FAMILY_DEFS,bossSignatureConfig};})();`);
try{vm.runInContext(src,sandbox,{filename:'game.js',timeout:7000});}
catch(e){console.error('RUNTIME_EVAL_FAIL',e.stack);process.exit(2)}
const t=windowObj.__V2150_TEST;if(!t){console.error('TEST_HOOK_MISSING');process.exit(3)}
// Micro-swarm: world 1, 4-10 easy enemies, no main-wave kill accounting.
t.G.screen='GAME';t.G.mode='campaign';t.G.sector=1;t.G.wave=1;t.G.kills=2;t.G.goal=20;t.G.enemies=[];t.G.boss=null;t.G.sectorClear=false;
const spawned=t.spawnMicroSwarm(),minions=t.G.enemies.filter(e=>e.microSwarm),beforeKills=t.G.kills,beforeMicro=t.G.microKills||0;
if(minions[0])t.killEnemy(minions[0]);
const microOK=spawned>=4&&spawned<=10&&minions.length===spawned&&minions.every(e=>e.maxHp<=23)&&t.G.kills===beforeKills&&(t.G.microKills||0)===beforeMicro+1;
// Rift Ally: world 11, random pool from defeated bosses, 10 s lifetime.
t.G.sector=11;t.G.enemies=[];t.G.boss=null;t.G.riftAlly=null;t.G.riftAllyUsed=false;t.G.lastChanceT=0;t.G.preBossT=0;t.G.bossPending=false;
t.META.defeated={};for(let i=1;i<=10;i++)t.META.defeated[i]=true;
const pool=t.riftAllyPool(),summoned=t.summonRiftAlly(),ally=t.G.riftAlly?{sector:t.G.riftAlly.sector,time:t.G.riftAlly.t,name:t.G.riftAlly.name}:null;
const riftOK=pool.length===10&&summoned===true&&ally&&ally.sector>=1&&ally.sector<=10&&Math.abs(ally.time-10)<1e-9&&t.G.riftAllyUsed===true;
// Last Chance: fatal damage creates 5 second window; rescue consumes existing Life Extra only on explicit action.
t.G.riftAlly=null;t.G.sector=5;t.G.player.hp=5;t.G.player.shield=0;t.G.player.inv=0;t.G.lastChanceT=0;t.G.screen='GAME';t.META.supplies=t.META.supplies||{};t.META.supplies.life=1;
t.hitPlayer(1000);const warningOK=t.G.lastChanceT===5&&t.G.player.hp===1;const stockBefore=t.META.supplies.life,rescued=t.rescueLastChance(),rescueOK=rescued===true&&t.G.lastChanceT===0&&t.G.player.hp>1&&t.META.supplies.life===stockBefore-1;
// Difficulty: 20 explicit profiles, low raw HP increase but pressure grows.
const b1=t.sectorBalance(1),b10=t.sectorBalance(10),b20=t.sectorBalance(20),tempo20=t.sectorTempo(20);
const curveOK=b1.enemyHp<1&&b10.enemyHp<=1.05&&b20.enemyHp<=1.10&&b20.pressure>b10.pressure&&tempo20.speed>1;
const sigOK=t.bossSignatureConfig({pattern:'titan'}).name==='ORBE IMPERATOR' ? false : true; // context is sector 5 here; helper must remain valid
const checks={microSwarm:microOK,riftAlly:riftOK,lastChanceWarning:warningOK,lastChanceManualRescue:rescueOK,difficultyCurve:curveOK,worlds:t.SECTORS.length===20,bossAnimations:Object.keys(t.BOSS_ANIMATIONS).length===20,ch2Families:Object.keys(t.CH2_FAMILY_DEFS).length===10};
const ok=Object.values(checks).every(Boolean);
console.log(JSON.stringify({ok,checks,micro:{spawned,hp:minions.slice(0,3).map(e=>e.maxHp),waveKills:t.G.kills,microKills:t.G.microKills},rift:{pool,ally},lastChance:{warningOK,rescueOK,hp:t.G.player.hp,lifeStock:t.META.supplies.life},curve:{w1:b1,w10:b10,w20:b20,tempo20}},null,2));
process.exit(ok?0:4);

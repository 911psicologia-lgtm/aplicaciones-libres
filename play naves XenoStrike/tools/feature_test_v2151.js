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
src=src.replace(/\}\)\(\);\s*$/,`window.__V2151_TEST={META,G,spawnMicroSwarm,updateMicroSwarmDirector,killEnemy,riftAllyPool,summonRiftAlly,updateRiftAlly,riftAllyCH2Strike,hitPlayer,rescueLastChance,sectorBalance,sectorTempo,adaptivePressure,waveGoal,difficulty,SECTORS,BOSS_ANIMATIONS,CH2_FAMILY_DEFS,RIFT_ALLY_SIGNATURES,bossSignatureConfig};})();`);
try{vm.runInContext(src,sandbox,{filename:'game.js',timeout:7000});}
catch(e){console.error('RUNTIME_EVAL_FAIL',e.stack);process.exit(2)}
const t=windowObj.__V2151_TEST;if(!t){console.error('TEST_HOOK_MISSING');process.exit(3)}
// Micro-Swarm 2.0: world 1, 4-10 ambient enemies, eight formation vocabulary, no wave kill accounting.
t.G.screen='GAME';t.G.mode='campaign';t.G.sector=1;t.G.wave=1;t.G.kills=2;t.G.goal=20;t.G.enemies=[];t.G.frontThreats=[];t.G.boss=null;t.G.bossPending=false;t.G.sectorClear=false;t.G.microKills=0;t.G.microSwarmBursts=0;t.G.actionGapT=2;
const spawned=t.spawnMicroSwarm(true),minions=t.G.enemies.filter(e=>e.microSwarm),beforeKills=t.G.kills,beforeMicro=t.G.microKills||0;
if(minions[0])t.killEnemy(minions[0]);
const microOK=spawned>=4&&spawned<=10&&minions.length===spawned&&minions.every(e=>e.maxHp<=19)&&t.G.kills===beforeKills&&(t.G.microKills||0)===beforeMicro+1&&(t.G.microSwarmBursts||0)===1;
// Forced continuity: an empty meaningful field with expired timer must spawn ambient action.
t.G.enemies=[];t.G.microSwarmTimer=99;t.G.actionGapT=1.7;t.updateMicroSwarmDirector(.05);const continuityOK=t.G.enemies.some(e=>e.microSwarm);
// RIFT ALLY remains random and 10 s, with Chapter II signature library.
t.G.sector=20;t.G.enemies=[];t.G.boss=null;t.G.riftAlly=null;t.G.riftAllyUsed=false;t.G.lastChanceT=0;t.G.preBossT=0;t.G.bossPending=false;t.META.defeated={};for(let i=1;i<=19;i++)t.META.defeated[i]=true;
const pool=t.riftAllyPool(),summoned=t.summonRiftAlly(),ally=t.G.riftAlly?{sector:t.G.riftAlly.sector,time:t.G.riftAlly.t,name:t.G.riftAlly.name,signature:t.G.riftAlly.signature}:null;
const riftOK=pool.length===19&&summoned===true&&ally&&ally.sector>=1&&ally.sector<=19&&Math.abs(ally.time-10)<1e-9&&t.G.riftAllyUsed===true&&Object.keys(t.RIFT_ALLY_SIGNATURES).length===10;
// All ten CH2 ally signatures must execute without throwing and perform a combat/support action.
let sigOK=true;for(let sec=11;sec<=20;sec++){t.G.eBullets=[];t.G.player.hp=t.G.player.maxHp;t.G.player.shield=0;const dummy={x:800,y:360,r:18,hp:100,maxHp:100,dead:false,slow:0};t.G.enemies=[dummy];try{const ran=t.riftAllyCH2Strike({sector:sec,x:300,y:300},null,[dummy],40,'#62dfff');if(ran!==true||(dummy.hp>=100&&t.G.player.shield<=0))sigOK=false;}catch(_){sigOK=false;}}
// Last Chance: 5 sec, manual rescue, then tactical relief window.
t.G.riftAlly=null;t.G.sector=5;t.G.player.hp=5;t.G.player.shield=0;t.G.player.inv=0;t.G.lastChanceT=0;t.G.screen='GAME';t.META.supplies=t.META.supplies||{};t.META.supplies.life=1;
t.hitPlayer(1000);const warningOK=t.G.lastChanceT===5&&t.G.player.hp===1;const stockBefore=t.META.supplies.life,rescued=t.rescueLastChance(),rescueOK=rescued===true&&t.G.lastChanceT===0&&t.G.player.hp>1&&t.META.supplies.life===stockBefore-1&&t.G.recoveryGraceT===5.5;
// Adaptive difficulty must alter cadence/alive only, while raw HP curve remains bounded.
const b1=t.sectorBalance(1),b10=t.sectorBalance(10),b20=t.sectorBalance(20),tempo20=t.sectorTempo(20);t.G.player.hp=t.G.player.maxHp;t.G.player.shield=t.G.player.maxShield;t.G.goal=20;t.G.kills=10;t.G.waveHits=0;t.G.combo=10;t.G.recoveryGraceT=0;const adaptHigh=t.adaptivePressure();t.G.player.hp=t.G.player.maxHp*.2;const adaptLow=t.adaptivePressure();
const curveOK=b1.enemyHp<1&&b10.enemyHp<=1.05&&b20.enemyHp<=1.10&&b20.pressure>b10.pressure&&tempo20.speed>1&&adaptHigh.cadence<1&&adaptLow.cadence>1;
const checks={microSwarm:microOK,forcedContinuity:continuityOK,riftAlly:riftOK,ch2Signature:sigOK,lastChanceWarning:warningOK,lastChanceManualRescue:rescueOK,difficultyCurve:curveOK,worlds:t.SECTORS.length===20,bossAnimations:Object.keys(t.BOSS_ANIMATIONS).length===20,ch2Families:Object.keys(t.CH2_FAMILY_DEFS).length===10};
const ok=Object.values(checks).every(Boolean);
console.log(JSON.stringify({ok,checks,micro:{spawned,formation:minions[0]?.microFormation,waveKills:t.G.kills,microKills:t.G.microKills,bursts:t.G.microSwarmBursts},rift:{pool:pool.length,ally},lastChance:{warningOK,rescueOK,hp:t.G.player.hp,lifeStock:t.META.supplies.life,grace:t.G.recoveryGraceT},curve:{w1:b1,w10:b10,w20:b20,tempo20,adaptHigh,adaptLow}},null,2));
process.exit(ok?0:4);

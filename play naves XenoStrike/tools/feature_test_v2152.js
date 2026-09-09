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
src=src.replace(/\}\)\(\);\s*$/,`window.__V2152_TEST={VERSION,META,G,spawnMicroSwarm,updateMicroSwarmDirector,killEnemy,riftAllyPool,summonRiftAlly,hitPlayer,rescueLastChance,sectorBalance,sectorTempo,adaptivePressure,SECTORS,BOSS_ANIMATIONS,CH2_FAMILY_DEFS,FAMILY_COMBAT_GRAMMAR,familyCombatGrammar,spawnEnemy,spawnFamilyMicroEscort,familyMajorCall,applyFamilyTacticalMovement,updateBossFamilyResponse,damageEntity,hasSave,loadRun,getG:()=>G};})();`);
try{vm.runInContext(src,sandbox,{filename:'game.js',timeout:7000});}
catch(e){console.error('RUNTIME_EVAL_FAIL',e.stack);process.exit(2)}
const t=windowObj.__V2152_TEST;if(!t){console.error('TEST_HOOK_MISSING');process.exit(3)}

// Baseline preservation: Micro-Swarm remains world 1+, 4-10, and does not count toward wave kills.
t.G.screen='GAME';t.G.mode='campaign';t.G.sector=1;t.G.wave=1;t.G.kills=2;t.G.goal=20;t.G.enemies=[];t.G.frontThreats=[];t.G.boss=null;t.G.bossPending=false;t.G.sectorClear=false;t.G.microKills=0;t.G.microSwarmBursts=0;t.G.actionGapT=2;
const spawned=t.spawnMicroSwarm(true),mins=t.G.enemies.filter(e=>e.microSwarm),waveBefore=t.G.kills,microBefore=t.G.microKills;
if(mins[0])t.killEnemy(mins[0]);
const microOK=spawned>=4&&spawned<=10&&mins.every(e=>e.maxHp<=19)&&t.G.kills===waveBefore&&t.G.microKills===microBefore+1;

// Ten unique family doctrines for Worlds 11-20.
const grammarKeys=Object.keys(t.FAMILY_COMBAT_GRAMMAR).map(Number),grammarIds=grammarKeys.map(k=>t.FAMILY_COMBAT_GRAMMAR[k].id);
const grammarOK=grammarKeys.length===10&&new Set(grammarIds).size===10&&grammarKeys.every(k=>k>=11&&k<=20);

// Major coordination: W13 major creates non-wave escorts and applies a defensive brace to its family.
t.G.sector=13;t.G.mode='campaign';t.G.wave=2;t.G.enemies=[];t.G.eBullets=[];t.G.obstacles=[];t.G.familyCalls=0;t.G.kills=7;t.G.boss=null;
const major=t.spawnEnemy('ch2_13_major',920,360),minor=t.spawnEnemy('ch2_13_minor',840,330),g13=t.familyCombatGrammar(13);
const kBefore=t.G.kills;t.familyMajorCall(major,g13);
const escorts=t.G.enemies.filter(e=>e.microSwarm&&e.familySummoned);
const majorOK=escorts.length>=3&&t.G.familyCalls===1&&major.familyGuardT>0&&minor.familyGuardT>0&&t.G.kills===kBefore;

// Family guard genuinely reduces incoming normal damage without changing max HP.
const target={x:700,y:300,r:18,hp:1000,maxHp:1000,dead:false,kind:'insect',family:t.SECTORS[12].family,form:'ch2_13_minor',familyGuardT:0,flash:0,slow:0};
t.G.enemies=[target];t.G.weaponBoostT=0;t.G.boss=null;
t.damageEntity(target,100,'normal');const unguarded=1000-target.hp;target.hp=1000;target.dead=false;target.familyGuardT=1;
t.damageEntity(target,100,'normal');const guarded=1000-target.hp;
const guardOK=guarded<unguarded&&guarded/unguarded>0.74&&guarded/unguarded<0.82&&target.maxHp===1000;

// Medium units open a lane/corridor rather than only drifting left.
t.G.sector=12;t.G.enemies=[];const med=t.spawnEnemy('ch2_12_medium',880,220);med.familyTacticCd=-.1;med.entryT=0;const move=t.applyFamilyTacticalMovement(med,t.G.player,-med.spd,0,.016);
const corridorOK=med.corridorT>0&&med.surgeT>0&&Number.isFinite(move.vx)&&Number.isFinite(move.vy);

// Boss-reactive swarm only in Chapter II campaign, not Boss Rush/Training.
t.G.sector=11;t.G.mode='campaign';t.G.enemies=[];t.G.familyBossResponses=0;t.G.bossFamilySwarmTimer=0;t.G.boss={x:930,y:360,r:80,hp:1000,maxHp:1000,dead:false,dying:false,phase:2,animAttackT:0};
t.updateBossFamilyResponse(.1);const reactive=t.G.enemies.filter(e=>e.microSwarm&&e.bossReactive).length;
const bossCampaignOK=reactive>=3&&t.G.familyBossResponses===1;
t.G.mode='bossRush';t.G.enemies=[];t.G.bossFamilySwarmTimer=0;t.updateBossFamilyResponse(9);const bossRushOK=t.G.enemies.length===0;

// RIFT ALLY and Last Chance are preserved.
t.G.mode='campaign';t.G.sector=20;t.G.enemies=[];t.G.boss=null;t.G.riftAlly=null;t.G.riftAllyUsed=false;t.G.lastChanceT=0;t.G.preBossT=0;t.G.bossPending=false;t.META.defeated={};for(let i=1;i<=19;i++)t.META.defeated[i]=true;
const pool=t.riftAllyPool(),summoned=t.summonRiftAlly();const riftOK=pool.length===19&&summoned===true&&Math.abs(t.G.riftAlly.t-10)<1e-9;
t.G.riftAlly=null;t.G.sector=5;t.G.player.hp=5;t.G.player.shield=0;t.G.player.inv=0;t.G.lastChanceT=0;t.G.screen='GAME';t.META.supplies=t.META.supplies||{};t.META.supplies.life=1;t.hitPlayer(1000);const warning=t.G.lastChanceT===5&&t.G.player.hp===1;const stock=t.META.supplies.life;t.rescueLastChance();const lastChanceOK=warning&&t.G.lastChanceT===0&&t.META.supplies.life===stock-1;

const b1=t.sectorBalance(1),b10=t.sectorBalance(10),b20=t.sectorBalance(20);const curveOK=b1.enemyHp<1&&b10.enemyHp<=1.05&&b20.enemyHp<=1.10&&b20.pressure>b10.pressure;
// v2.15.1 run migration must remain loadable after bumping save keys to v2.15.2.
localStorage.setItem('swarm_rift_run_v2151',JSON.stringify({version:'2.15.1',mode:'campaign',runDifficulty:'normal',sector:11,wave:1,score:123,credits:44,hp:50,shield:12,powers:{},queue:[],powerRanks:{}}));
const migrationSeen=t.hasSave(),migrationLoaded=t.loadRun(),migrationOK=migrationSeen&&migrationLoaded&&t.getG().sector===11;
const checks={version:t.VERSION==='2.15.2',worlds:t.SECTORS.length===20,bosses:Object.keys(t.BOSS_ANIMATIONS).length===20,ch2Families:Object.keys(t.CH2_FAMILY_DEFS).length===10,microSwarm:microOK,familyGrammars:grammarOK,majorCoordination:majorOK,guardReduction:guardOK,mediumCorridor:corridorOK,bossReactiveCampaign:bossCampaignOK,bossReactiveDisabledBossRush:bossRushOK,riftAlly:riftOK,lastChance:lastChanceOK,difficultyCurve:curveOK,saveMigration2151:migrationOK};
const ok=Object.values(checks).every(Boolean);
console.log(JSON.stringify({ok,checks,grammarIds,major:{escorts:escorts.length,familyCalls:t.G.familyCalls,guardRatio:+(guarded/unguarded).toFixed(3)},medium:{corridorT:med.corridorT,surgeT:med.surgeT},bossReactive:{campaign:reactive,bossRush:t.G.enemies.length},riftPool:pool.length,migration:{migrationSeen,migrationLoaded,sector:t.getG().sector}},null,2));
process.exit(ok?0:4);

(()=>{
'use strict';

const VERSION='1.8.0';
const KEY_META='swarm_rift_meta_v18';
const KEY_RUN='swarm_rift_run_v18';
const TAU=Math.PI*2;
const cv=document.getElementById('game');
const cx=cv.getContext('2d',{alpha:false});
const shell=document.getElementById('shell');
const shopBtn=document.getElementById('shopBtn');
const pauseBtn=document.getElementById('pauseBtn');
const audioBtn=document.getElementById('audioBtn');
const fullBtn=document.getElementById('fullBtn');
const touchHud=document.getElementById('touchHud');
const stickZone=document.getElementById('stickZone');
const stickBase=document.getElementById('stickBase');
const stickKnob=document.getElementById('stickKnob');
const dashBtn=document.getElementById('dashBtn');

let W=1280,H=720,DPR=1,lastT=performance.now();
let stars=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndI=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[(Math.random()*a.length)|0];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hexA=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;};

function resize(){
  const vv=window.visualViewport;
  const w=Math.max(320,Math.floor(vv?vv.width:innerWidth));
  const h=Math.max(220,Math.floor(vv?vv.height:innerHeight));
  DPR=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.floor(w*DPR); cv.height=Math.floor(h*DPR);
  cv.style.width=w+'px'; cv.style.height=h+'px';
  cx.setTransform(DPR,0,0,DPR,0,0); W=w; H=h;
  seedStars();
}
function seedStars(){stars=Array.from({length:Math.round(clamp(W*H/8500,45,125))},()=>({x:rnd(0,W),y:rnd(0,H),z:rnd(.2,1.2),r:rnd(.5,2.1)}));}
resize();
addEventListener('resize',resize,{passive:true});
addEventListener('orientationchange',()=>setTimeout(resize,180),{passive:true});
if(window.visualViewport) visualViewport.addEventListener('resize',resize,{passive:true});

function tryFullscreen(){
  const el=document.documentElement;
  try{
    if(!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
    if(screen.orientation?.lock) screen.orientation.lock('landscape').catch(()=>{});
  }catch(_){ }
}

const IMG={
  ship:new Image(),
  atlas:new Image(),
  bg:{rust:new Image(),toxic:new Image(),rift:new Image()},
  obstacles:{rock:new Image(),mine:new Image(),wreck:new Image(),pod:new Image(),gate:new Image(),nest:new Image(),seed:new Image()},
  pickups:{credit:new Image(),heal:new Image(),shield:new Image(),power:new Image()},
  enemyShips:{scout:new Image(),frigate:new Image(),bomber:new Image()},
  tiers:new Image(),
  generatedObstacles:{rust:[],toxic:[],rift:[]},
  generatedShips:[],
  generatedPowers:{}
};
IMG.ship.src='assets/player_ship.png';
IMG.atlas.src='assets/enemy_atlas.png';
IMG.bg.rust.src='assets/bg_rust_canyon.png';
IMG.bg.toxic.src='assets/bg_toxic_ravine.png';
IMG.bg.rift.src='assets/bg_rift_tunnel.png';
IMG.obstacles.rock.src='assets/obs_rock.svg';
IMG.obstacles.mine.src='assets/obs_mine.svg';
IMG.obstacles.wreck.src='assets/obs_drone_wreck.svg';
IMG.obstacles.pod.src='assets/obs_pod_toxic.svg';
IMG.obstacles.gate.src='assets/obs_gate.svg';
IMG.obstacles.nest.src='assets/obs_nest.svg';
IMG.obstacles.seed.src='assets/obs_seed.svg';
IMG.pickups.credit.src='assets/pickup_credit.svg';
IMG.pickups.heal.src='assets/pickup_heal.svg';
IMG.pickups.shield.src='assets/pickup_shield.svg';
IMG.pickups.power.src='assets/pickup_power.svg';
IMG.enemyShips.scout.src='assets/ship_scout.svg';
IMG.enemyShips.frigate.src='assets/ship_frigate.svg';
IMG.enemyShips.bomber.src='assets/ship_bomber.svg';
IMG.tiers.src='assets/generated/enemy_tiers_atlas.png';
for(const pack of ['rust','toxic','rift'])for(let i=1;i<=12;i++){const im=new Image();im.src=`assets/generated/${pack}_${String(i).padStart(2,'0')}.png`;IMG.generatedObstacles[pack].push(im);}
for(let i=1;i<=12;i++){const im=new Image();im.src=`assets/generated/ship_${String(i).padStart(2,'0')}.png`;IMG.generatedShips.push(im);}
const POWER_ASSET_ORDER=['twin','tesla','missile','rail','cryo','acid','shield','magnet','drone','overdrive','gravity','heal','credit'];
POWER_ASSET_ORDER.forEach((key,i)=>{const im=new Image();im.src=`assets/generated/power_${String(i+1).padStart(2,'0')}.png`;IMG.generatedPowers[key]=im;});
IMG.generatedPowers.bomb=IMG.generatedObstacles.rust[5];
const imgReady=img=>!!(img&&img.complete&&img.naturalWidth>0);
const FAMILY_COL={AVISPAS:0,ESCARABAJOS:1,MANTIS:2,POLILLAS:3,HORMIGAS:4,LANGOSTAS:5};

// ─────────────────────────────────────────────────────────────
// AUDIO — sintetizado, offline, con firma distinta por jefe
// ─────────────────────────────────────────────────────────────
const AudioX={
  ac:null,muted:false,bossNodes:[],lastShot:0,
  unlock(){
    if(!this.ac){try{this.ac=new (window.AudioContext||window.webkitAudioContext)();}catch(_){return;}}
    if(this.ac.state==='suspended') this.ac.resume().catch(()=>{});
  },
  tone(f=440,d=.08,v=.04,type='sine',delay=0,slide=0){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;
    const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
    g.gain.setValueAtTime(Math.max(.0001,v),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);
  },
  noise(d=.08,v=.03,filter=1500,delay=0){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;
    const len=Math.max(1,(a.sampleRate*d)|0),buf=a.createBuffer(1,len,a.sampleRate),data=buf.getChannelData(0);
    for(let i=0;i<len;i++)data[i]=Math.random()*2-1;
    const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+delay;
    s.buffer=buf;f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    s.connect(f);f.connect(g);g.connect(a.destination);s.start(t);
  },
  shot(){const n=performance.now();if(n-this.lastShot<42)return;this.lastShot=n;const lv=G?.level||1;this.tone(720+Math.min(220,lv*18),.052,.028,'square',0,-220-lv*6);if(lv>=5&&Math.random()<.22)this.tone(1120,.035,.014,'triangle',.015,-260);},
  hit(){this.noise(.045,.025,900);},
  pickup(){[560,760,980].forEach((f,i)=>this.tone(f,.09,.045,'sine',i*.045,80));},
  queue(){this.tone(640,.07,.04,'triangle');this.tone(880,.07,.032,'triangle',.05,80);},
  power(key){
    const map={
      twin:[420,.09,.05,'triangle',120],tesla:[680,.12,.05,'sawtooth',-120],missile:[190,.15,.05,'square',280],rail:[860,.12,.04,'square',-380],
      cryo:[520,.15,.05,'sine',-140],acid:[250,.16,.05,'sawtooth',70],shield:[360,.18,.05,'sine',120],magnet:[430,.14,.04,'triangle',-80],
      drone:[600,.1,.04,'square',0],overdrive:[780,.1,.04,'sawtooth',220],gravity:[180,.18,.055,'sine',-20],bomb:[120,.22,.08,'sawtooth',-35],burst:[705,.12,.05,'triangle',160]
    }[key];
    if(!map){this.pickup();return;}
    this.tone(map[0],map[1],map[2],map[3],0,map[4]);
    if(key==='bomb')this.noise(.28,.06,420,.03);
    else if(key==='tesla')this.noise(.08,.035,1600,.02);
    else if(key==='gravity')this.noise(.14,.03,300,.04);
    else if(key==='burst')this.noise(.06,.02,1800,.01);
  },
  droneShot(powered=false){
    this.tone(powered?880:640,.04,powered?.03:.022,powered?'sawtooth':'triangle',0,powered?180:60);
    if(powered)this.noise(.03,.012,2200,.01);
  },
  sparkLaser(){
    this.tone(1180,.05,.028,'square',0,-320);this.noise(.04,.018,2600,.005);
  },
  incoming(){this.tone(310,.13,.035,'triangle',0,420);this.tone(620,.09,.026,'square',.08,-180);},
  hurt(){this.tone(110,.16,.08,'sawtooth',0,-35);this.noise(.1,.04,500);},
  dash(){this.noise(.14,.045,2400);this.tone(260,.15,.05,'sawtooth',0,620);},
  buy(){[320,470,690].forEach((f,i)=>this.tone(f,.12,.05,'triangle',i*.05,80));},
  deny(){this.tone(130,.16,.06,'square');},
  pause(){this.tone(420,.06,.035,'sine');this.tone(300,.09,.03,'sine',.05);},
  bossIntro(index){
    this.stopBoss();const base=[52,58,46,42,64,38,55,72,49,34][index]||48;
    for(let i=0;i<5;i++)this.tone(base*(1+i*.5),.5,.045,'sawtooth',i*.12,-base*.1);
    this.noise(.8,.045,260,.15);this.startBoss(base,index);
  },
  startBoss(base,index){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;
    const o=a.createOscillator(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
    o.type=index%3===0?'sawtooth':index%3===1?'triangle':'square';o.frequency.value=base;
    g.gain.value=.012;lfo.frequency.value=.35+(index*.045);lg.gain.value=base*.08;
    lfo.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(a.destination);o.start();lfo.start();this.bossNodes=[o,g,lfo,lg];
  },
  stopBoss(){for(const n of this.bossNodes){try{if(n.stop)n.stop();}catch(_){}}this.bossNodes=[];},
  bossDie(){this.stopBoss();for(let i=0;i<7;i++){this.noise(.22,.055,340+i*110,i*.07);this.tone(150-i*12,.25,.05,'sine',i*.08,-30);}},
  bossWarn(index=0){const f=[240,160,520,420,200,300][index]||240;this.tone(f,.24,.055,'sawtooth',0,f*.45);this.tone(f*1.5,.18,.035,'triangle',.12,-f*.2);},
  bossPhase(index=0){const f=180+index*35;for(let i=0;i<3;i++)this.tone(f+i*90,.16,.045,'square',i*.06,80);this.noise(.18,.035,700,.04);},
  toggle(){this.muted=!this.muted;if(this.muted)this.stopBoss();audioBtn.textContent=this.muted?'🔇':'🔊';saveMeta();}
};

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// DATA — 6 mundos jugables con arte propio y linajes insectoides
// ─────────────────────────────────────────────────────────────
const SECTORS=[
 {code:'RC-01',name:'Rust Canyon Corridor',family:'AVISPAS',boss:'IMPERATRIX VESPA',pattern:'storm',base:'#d6a21b',accent:'#fff07b',dark:'#1a1205',bg:'rust',forms:['hornet','lancer','shocker'],hazards:['pasos angostos','minas solares','torres de chatarra'],obstacles:['spire','mine','drone'],stats:{armor:2,speed:4,range:3,threat:3},blurb:'cañón industrial de roca oxidada y puentes de forja.'},
 {code:'TR-02',name:'Toxic Ravine',family:'ESCARABAJOS',boss:'ATLAS VERDE',pattern:'titan',base:'#6e9f2e',accent:'#d7ff74',dark:'#081106',bg:'toxic',forms:['scarab','tank','ram'],hazards:['ácido vivo','pilares tóxicos','vainas corrosivas'],obstacles:['acidpod','spore','pillar'],stats:{armor:5,speed:2,range:2,threat:4},blurb:'garganta química con corrientes ácidas y costras blindadas.'},
 {code:'RT-03',name:'Rift Tunnel / Debris Field',family:'MANTIS',boss:'CORTEX RAZOR',pattern:'blade',base:'#dd7b28',accent:'#ffbe74',dark:'#07121d',bg:'rift',forms:['stalker','blade','jumper'],hazards:['fragmentos cinéticos','drones rotos','cortes frontales'],obstacles:['shard','gate','drone'],stats:{armor:3,speed:5,range:3,threat:4},blurb:'túnel orbital fracturado, veloz y saturado de residuos letales.'},
 {code:'NP-04',name:'Nocturne Pollen Vault',family:'POLILLAS',boss:'VELA NOCTIS',pattern:'moth',base:'#9f68d7',accent:'#f4c8ff',dark:'#11091b',bg:'rift',forms:['flutter','dust','seer'],hazards:['niebla de polen','descargas de alas','mirada seer'],obstacles:['cocoon','dustpod','spike'],stats:{armor:2,speed:3,range:5,threat:4},blurb:'cripta lumínica donde el polen altera trayectoria y visibilidad.'},
 {code:'IN-05',name:'Iron Nest Corridor',family:'HORMIGAS',boss:'REGINA FERRUM',pattern:'queen',base:'#ac3633',accent:'#ff7f75',dark:'#170708',bg:'rust',forms:['worker','soldier','acid'],hazards:['enjambres obreros','ácido lineal','nidos fortificados'],obstacles:['nest','bulwark','mine'],stats:{armor:4,speed:3,range:2,threat:5},blurb:'corredor de colonia roja donde cada barrera parece otro nido vivo.'},
 {code:'EL-06',name:'Emerald Leap Delta',family:'LANGOSTAS',boss:'COLOSSUS HOP',pattern:'leap',base:'#89bb2d',accent:'#ebff77',dark:'#0b1406',bg:'toxic',forms:['hopper','crusher','slinger'],hazards:['saltos parabólicos','esporas de impulso','bloques semilla'],obstacles:['seed','hopperrock','spore'],stats:{armor:3,speed:5,range:4,threat:5},blurb:'delta radioactivo de saltos violentos y vectores impredecibles.'}
];


const FORM_STATS={
 worker:{hp:.75,spd:1.15,size:.8,score:80,move:'sine',fire:0},soldier:{hp:1.25,spd:.95,size:1.05,score:130,move:'rush',fire:0},acid:{hp:.9,spd:.85,size:.9,score:150,move:'hover',fire:1.25},
 flutter:{hp:.72,spd:1.3,size:.9,score:95,move:'flutter',fire:1.7},dust:{hp:1.0,spd:.9,size:1,score:140,move:'wave',fire:1.4},seer:{hp:.82,spd:.78,size:.85,score:180,move:'sniper',fire:.9},
 stalker:{hp:.82,spd:1.35,size:.92,score:110,move:'zig',fire:0},blade:{hp:1.15,spd:1.2,size:1.03,score:155,move:'dash',fire:1.7},jumper:{hp:.95,spd:1.1,size:.9,score:170,move:'leap',fire:0},
 scarab:{hp:1.35,spd:.72,size:1.08,score:145,move:'direct',fire:1.9},tank:{hp:2.2,spd:.5,size:1.35,score:245,move:'direct',fire:1.35},ram:{hp:1.45,spd:1.15,size:1.12,score:210,move:'rush',fire:0},
 dart:{hp:.72,spd:1.55,size:.76,score:125,move:'dart',fire:1.55},drain:{hp:1.05,spd:1.2,size:.9,score:175,move:'orbit',fire:1.4},needle:{hp:.82,spd:1.05,size:.82,score:190,move:'sniper',fire:.72},
 builder:{hp:1.1,spd:.75,size:1,score:155,move:'hover',fire:1.55},biter:{hp:1.2,spd:1.15,size:1.0,score:165,move:'rush',fire:0},bomber:{hp:1.0,spd:.72,size:1.12,score:220,move:'wave',fire:1.15},
 hornet:{hp:.72,spd:1.65,size:.78,score:145,move:'dart',fire:1.3},lancer:{hp:1.0,spd:1.35,size:.92,score:190,move:'dash',fire:1.0},shocker:{hp:.9,spd:1.05,size:.88,score:215,move:'orbit',fire:.82},
 glow:{hp:.8,spd:1.25,size:.86,score:155,move:'wave',fire:1.3},orbiter:{hp:1.0,spd:1.0,size:.95,score:200,move:'orbit',fire:1.0},flare:{hp:.9,spd:.86,size:.92,score:230,move:'hover',fire:.75},
 hopper:{hp:.9,spd:1.25,size:.95,score:175,move:'leap',fire:0},crusher:{hp:1.8,spd:.75,size:1.28,score:260,move:'rush',fire:1.8},slinger:{hp:.95,spd:.9,size:.9,score:235,move:'sniper',fire:.78},
 singer:{hp:1.0,spd:1.0,size:1.0,score:190,move:'wave',fire:1.0},sonic:{hp:1.1,spd:.88,size:1.05,score:245,move:'hover',fire:.72},choir:{hp:.82,spd:1.2,size:.88,score:270,move:'orbit',fire:.62},
 ship_scout:{hp:.9,spd:1.28,size:.9,score:165,move:'zig',fire:1.1},ship_frigate:{hp:1.35,spd:.92,size:1.08,score:230,move:'direct',fire:.95},ship_bomber:{hp:1.6,spd:.76,size:1.14,score:285,move:'wave',fire:1.35}
};

const POWERS={
 twin:{name:'TRI-AGUJA',icon:'⋔',color:'#ffe06a',duration:22,desc:'abre el disparo en tres vectores'},
 tesla:{name:'TESLA',icon:'ϟ',color:'#8edbff',duration:20,desc:'arcos automáticos entre blancos'},
 missile:{name:'MICROMISILES',icon:'➤',color:'#ff8a53',duration:24,desc:'misiles inteligentes de apoyo'},
 rail:{name:'RAÍL',icon:'━',color:'#73ffd1',duration:18,desc:'perforación automática de línea'},
 cryo:{name:'CRIO',icon:'❄',color:'#b7efff',duration:24,desc:'ralentiza al enjambre'},
 acid:{name:'CORROSIÓN',icon:'☣',color:'#aaff5f',duration:22,desc:'impactos con daño de área'},
 shield:{name:'ESCUDO',icon:'⬡',color:'#73b7ff',duration:25,desc:'escudo regenerativo temporal'},
 magnet:{name:'IMÁN',icon:'∪',color:'#ffb5ff',duration:30,desc:'atrae recursos y poderes'},
 drone:{name:'DRONES',icon:'◆',color:'#e7f4ff',duration:28,desc:'escoltas que disparan solas'},
 overdrive:{name:'OVERDRIVE',icon:'»',color:'#ff667c',duration:18,desc:'más velocidad y cadencia'},
 gravity:{name:'PULSO G',icon:'◎',color:'#b58cff',duration:20,desc:'ondas gravitacionales periódicas'},
 burst:{name:'RÁFAGA',icon:'✶',color:'#ffb38a',duration:18,desc:'cadencia superior y salvas abiertas'},
  bomb:{name:'BOMBA DE RIFT',icon:'✹',color:'#ffb67a',duration:0,desc:'aniquila esbirros y debilita unidades pesadas'}
};
const POWER_KEYS=Object.keys(POWERS);
const INSTANT_POWERS=new Set(['bomb']);
const POWER_SLOT_LIMIT=2;
const POWER_QUEUE_LIMIT=4;
const HERITAGE_BY_SECTOR={1:'twin',2:'shield',3:'rail',4:'cryo',5:'drone',6:'gravity'};
const COMBOS={
  'cryo+tesla':{name:'TORMENTA ÁRTICA',color:'#bfeeff'},
  'gravity+missile':{name:'POZO DE MISILES',color:'#ffb67f'},
  'acid+gravity':{name:'SINGULARIDAD ÁCIDA',color:'#b8ff77'},
  'rail+twin':{name:'TRIDENTE PERFORADOR',color:'#7dffd8'},
  'overdrive+twin':{name:'FRENESÍ BALÍSTICO',color:'#ff8aa3'},
  'burst+drone':{name:'ESCUADRÓN LANCERO',color:'#c8f4ff'},
  'burst+twin':{name:'RÁFAGA QUÍNTUPLE',color:'#ffd77f'}
};

const BOSS_SKILLS={
  storm:{name:'AGUIJÓN IMPERIAL',warn:'CARGA DE AGUIJÓN',color:'#ffe66f'},
  titan:{name:'CAPARAZÓN ATLAS',warn:'BLINDAJE ATLAS',color:'#c9ff77'},
  blade:{name:'CRUZ RAZOR',warn:'CORTE RAZOR',color:'#ff9a55'},
  moth:{name:'VELO NOCTURNO',warn:'POLEN NOCTURNO',color:'#e9b7ff'},
  queen:{name:'LLAMADO DE COLONIA',warn:'ENJAMBRE DE REINA',color:'#ff746b'},
  leap:{name:'SALTO CINÉTICO',warn:'IMPACTO CINÉTICO',color:'#dfff6b'}
};
const HERITAGE_NAMES={1:'AGUIJÓN IMPERIAL',2:'CAPARAZÓN ATLAS',3:'CUCHILLA RAZOR',4:'POLVO NOCTURNO',5:'ENJAMBRE OBRERO',6:'SALTO CINÉTICO'};

const UPGRADES=[
 {id:'hull',name:'Casco compuesto',icon:'♥',base:150,max:8,desc:'+12 vida máxima por nivel'},
 {id:'shield',name:'Malla de escudo',icon:'⬡',base:160,max:8,desc:'+10 escudo máximo por nivel'},
 {id:'damage',name:'Núcleo ofensivo',icon:'✦',base:190,max:8,desc:'+10% daño por nivel'},
 {id:'rate',name:'Cámara rápida',icon:'≋',base:180,max:7,desc:'+7% cadencia por nivel'},
 {id:'engine',name:'Vector de motor',icon:'»',base:145,max:7,desc:'+5% velocidad por nivel'},
 {id:'magnet',name:'Campo recolector',icon:'∪',base:135,max:6,desc:'+18 radio de recolección'},
 {id:'drone',name:'Hangar de drones',icon:'◆',base:230,max:4,desc:'+1 dron permanente cada 2 niveles'},
 {id:'salvage',name:'Reciclaje táctico',icon:'¤',base:170,max:6,desc:'+8% créditos obtenidos'},
 {id:'dash',name:'Impulso evasivo',icon:'ϟ',base:175,max:5,desc:'reduce enfriamiento del dash'}
];

const defaultMeta=()=>({credits:0,hiScore:0,unlocked:1,upgrades:{},muted:false,runs:0,bosses:0,bossUnlocks:{},defeated:{}});
let META=loadJSON(KEY_META,null)||loadJSON('swarm_rift_meta_v17',defaultMeta());META.upgrades=META.upgrades||{};META.bossUnlocks=META.bossUnlocks||{};META.defeated=META.defeated||{};
AudioX.muted=!!META.muted;audioBtn.textContent=AudioX.muted?'🔇':'🔊';

function loadJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch(_){return fallback;}}
function saveMeta(){META.credits=G?.credits??META.credits;META.hiScore=Math.max(META.hiScore,G?.hiScore||0);META.muted=AudioX.muted;try{localStorage.setItem(KEY_META,JSON.stringify(META));}catch(_){}}
function up(id){return META.upgrades[id]||0;}
function sectorDefeated(n){return !!META.defeated?.[n]||!!META.bossUnlocks?.[n];}

let G=null;
let shopReturn='MENU';
let notices=[];
let shake=0,flash=0;
const UI={buttons:[]};

function makePlayer(){
  const hp=100+up('hull')*12,sh=45+up('shield')*10;
  return {x:W*.2,y:H*.5,vx:0,vy:0,r:17,hp,maxHp:hp,shield:sh,maxShield:sh,inv:0,fire:0,dashCd:0,dashT:0,dashVX:0,dashVY:0};
}
function newRun(startSector=1,mode='campaign'){
  META.runs=(META.runs||0)+1;
  G={screen:'GAME',mode,sector:clamp(startSector,1,META.unlocked),wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],boss:null,
    kills:0,goal:waveGoal(startSector,1),spawn:0,obstacleTimer:2.4,frontTimer:mode==='training'?5.5:7.5,powerMeter:0,powers:{},powerQueue:[],sectorClear:false,bossPending:false,
    waveBanner:2.2,sectorBanner:3.2,combo:0,comboT:0,lastPowerDrop:0,elapsed:0,xp:0,level:1,xpNext:120,maxActivePowers:POWER_SLOT_LIMIT,maxQueuePowers:POWER_QUEUE_LIMIT,
    heritageNext:null,activeCombos:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,bossWarningT:0,bossWarningText:'',
    bossCheckpoint:false,trainingBoss:false,postBossT:0,postBossMax:0,frontKills:0};
  enterSector(startSector,true);setScreen('GAME');tryFullscreen();AudioX.unlock();notify(mode==='training'?'ENTRENAMIENTO · DAÑO ENEMIGO REDUCIDO':'AUTO-DISPARO ACTIVO · ESQUIVA Y ROMPE EL ENJAMBRE',mode==='training'?'#8edbff':'#9dffbf',2.8);saveMeta();
}
function startTraining(){
  newRun(1,'training');G.goal=10;G.wave=1;G.player.maxHp=Math.round(G.player.maxHp*1.25);G.player.hp=G.player.maxHp;G.player.maxShield=Math.round(G.player.maxShield*1.2);G.player.shield=G.player.maxShield;G.frontTimer=4.8;notify('MODO ENTRENAMIENTO · 10 OBJETIVOS + JEFE DE PRÁCTICA','#9fe6ff',3);
}
function startBossCheckpoint(sector){
  if(!sectorDefeated(sector)){notify('DERROTA PRIMERO AL JEFE','#ff7f92',1.8);return;}
  newRun(sector,'replayBoss');G.bossCheckpoint=true;G.wave=3;G.kills=G.goal;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.bossPending=false;spawnBoss();notify('CHECKPOINT DE ARENA · JEFE AL 50%','#ffd76a',2.4);
}
function enterSector(n,keepPlayer=false){
  G.sector=clamp(n,1,SECTORS.length);G.wave=1;G.kills=0;G.goal=waveGoal(G.sector,1);G.spawn=.72;G.obstacleTimer=G.sector===1?2.8:2.2;G.frontTimer=G.mode==='training'?5.5:rnd(6.5,10.5);G.boss=null;G.bossPending=false;G.sectorClear=false;G.postBossT=0;G.bossCheckpoint=false;
  G.enemies.length=0;G.bullets.length=0;G.eBullets.length=0;G.pickups.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.particles.length=0;G.activeCombos={};
  if(!keepPlayer)G.player=makePlayer();else{G.player.x=W*.2;G.player.y=H*.5;G.player.hp=G.player.maxHp;G.player.shield=G.player.maxShield;G.player.inv=.8;}
  G.sectorBanner=3;G.waveBanner=2;G.frenzyT=0;G.frenzyWave=0;G.frenzyMult=1;G.bossWarningT=0;G.bossWarningText='';
  if(G.heritageNext){const hk=G.heritageNext;G.heritageNext=null;activatePower(hk,'heritage',12);notify(`HERENCIA DE JEFE · ${HERITAGE_NAMES[G.sector-1]||POWERS[hk].name}`,'#ffd76a',2.5);}
}
function waveGoal(sector,wave){const base=11;return Math.round(base+sector*2.2+wave*4.0);}
function difficulty(){const s=G.sector,w=G.wave;const base=1+(s-1)*.15+(w-1)*.12+Math.min(.35,G.elapsed/180*.22);return G.mode==='training'?base*.72:base;}

function setScreen(s){
  if(!G){G={screen:s,credits:META.credits,hiScore:META.hiScore};}else G.screen=s;
  const gameplay=s==='GAME';
  touchHud.style.display=gameplay && matchMedia('(pointer:coarse)').matches?'block':'none';
  shopBtn.style.display=gameplay?'block':'none';pauseBtn.style.display=gameplay?'block':'none';
  if(!gameplay){resetStick();}
}

function notify(text,color='#fff',seconds=2){const item={text,color,t:seconds,max:seconds};notices.unshift(item);if(notices.length>3)notices.length=3;}
function xpForEnemy(e){return Math.round((FORM_STATS[e.form]?.score||100)*.20 + G.sector*5 + G.wave*3);}
function gainXp(amount){if(!G||amount<=0)return;G.xp+=amount;while(G.xp>=G.xpNext){G.xp-=G.xpNext;G.level++;G.xpNext=Math.round(G.xpNext*1.22);G.player.maxHp+=4;G.player.hp=Math.min(G.player.maxHp,G.player.hp+10);G.player.shield=Math.min(G.player.maxShield,G.player.shield+8);notify(`NIVEL ${G.level} · ARMA BASE +8%`,'#a6ff5f',1.8);burst(G.player.x,G.player.y,'#a6ff5f',24,160);}}
function comboId(a,b){return [a,b].sort().join('+');}
function comboOn(a,b){return powerOn(a)&&powerOn(b);}
function enemyTier(form){for(const sec of SECTORS){const idx=sec.forms.indexOf(form);if(idx>=0)return idx;}return 0;}
function countActivePowers(){return Object.keys(G.powers).length;}
function supportCount(){if(!G)return 0;const lvl=Math.min(2,Math.floor((G.level-1)/4)),hangar=Math.ceil(up('drone')/2),temp=powerOn('drone')?2:0;return clamp(lvl+hangar+temp,0,5);}
function supportRate(){let r=.52-(supportCount()*0.03);if(powerOn('overdrive'))r*=.82;if(powerOn('burst'))r*=.76;if(G.activeCombos[comboId('burst','drone')])r*=.78;return Math.max(.22,r);}
function supportOrbit(i,count,lead=0){const a=G.elapsed*(1.85+(count*.02))+i/count*TAU+lead,rx=35+count*3+(i%2?7:0),ry=26+count*2+((i+1)%2?4:0);return {a,x:G.player.x+Math.cos(a)*rx,y:G.player.y+Math.sin(a)*ry};}
function powerDropPool(){const pool=['twin','shield','magnet','cryo','acid','missile','tesla','overdrive','gravity'];if(G.level>=2||G.sector>=2)pool.push('drone');if(G.level>=3||G.wave>=2)pool.push('burst');if(G.sector>=3)pool.push('rail');return pool;}
function maybeSupportInfusion(){const keys=['cryo','acid','rail','missile','tesla'].filter(k=>powerOn(k));if(!keys.length)return null;return Math.random()<.38?pick(keys):null;}
const SHIP_FORMS=['ship_scout','ship_frigate','ship_bomber'];
const SHIP_LABELS={ship_scout:'SCOUT',ship_frigate:'FRIGATE',ship_bomber:'BOMBER'};
function obstacleSpriteKey(type){
  if(['spire','pillar','bulwark','hopperrock','shard','spike'].includes(type))return 'rock';
  if(type==='mine')return 'mine';
  if(type==='drone')return 'wreck';
  if(type==='gate')return 'gate';
  if(['acidpod','spore','dustpod','cocoon'].includes(type))return 'pod';
  if(type==='nest')return 'nest';
  if(type==='seed')return 'seed';
  return 'rock';
}
function pickupSpriteKey(q){return q.type==='power'?'power':q.type;}
function chooseTieredForm(sec){const r=Math.random();if(G.wave<=1)return r<.80?sec.forms[0]:sec.forms[1];if(G.wave===2)return r<.47?sec.forms[0]:r<.90?sec.forms[1]:sec.forms[2];return r<.34?sec.forms[0]:r<.73?sec.forms[1]:sec.forms[2];}
function obstacleAssetIndex(sec,type){
  const pools={
    rust:{mine:[5],drone:[4,8,9],gate:[4,8,10],nest:[6,7],cocoon:[6,7],default:[0,1,2,3,8,9,10,11]},
    toxic:{mine:[8],drone:[4,7,10],gate:[4,7],nest:[3,8,10,11],cocoon:[3,8,10,11],acidpod:[0,1,2,5,6,9],spore:[0,2,5,6,9],seed:[1,6,9],default:[0,1,2,3,5,6,8,9,10,11]},
    rift:{mine:[6],drone:[3,6,7,10],gate:[2,6],nest:[7,11],cocoon:[7,11],default:[0,1,2,3,4,5,6,7,8,9,10,11]}
  };
  const pack=pools[sec.bg]||pools.rift,list=pack[type]||pack.default;return pick(list);
}
function powerAsset(key){return IMG.generatedPowers[key]||IMG.pickups.power;}
function frontAsset(f){
  if(f.kind==='ship')return IMG.generatedShips[f.asset%IMG.generatedShips.length];
  const sec=SECTORS[G.sector-1],pack=IMG.generatedObstacles[sec.bg]||IMG.generatedObstacles.rift;return pack[f.asset%pack.length];
}
function spawnFrontThreat(forceKind=null){
  if(G.boss||G.bossPending||G.postBossT>0)return;const sec=SECTORS[G.sector-1],kind=forceKind||(Math.random()<(G.sector>=2?.34:.18)?'ship':'meteor'),p=G.player;
  const startX=rnd(W*.44,W*.78),startY=rnd(H*.25,H*.72),aim=Math.random()<.65;
  const targetX=aim?clamp(p.x+rnd(-85,95),80,W*.56):rnd(W*.1,W*.72),targetY=aim?clamp(p.y+rnd(-70,70),70,H-60):rnd(80,H-70);
  const baseHp=(kind==='ship'?75:95)+G.sector*34+G.wave*18,asset=kind==='ship'?rndI(0,11):obstacleAssetIndex(sec,'default');
  G.frontThreats.push({kind,asset,startX,startY,targetX,targetY,x:startX,y:startY,t:0,duration:rnd(2.15,3.05),r:12,hp:baseHp,maxHp:baseHp,dead:false,aim,reward:kind==='ship'?85:60,rot:rnd(0,TAU),spin:rnd(-1.1,1.1)});AudioX.incoming();notify(kind==='ship'?'CONTACTO FRONTAL · NAVE EN APROXIMACIÓN':'METEORO FRONTAL · INTERCEPTA O ESQUIVA','#ffb77a',1.35);
}
function killFrontThreat(f){if(f.dead)return;f.dead=true;G.frontKills=(G.frontKills||0)+1;G.score+=f.reward*(G.sector+1);G.credits+=Math.round(12+G.sector*3);gainXp(18+G.sector*4);burst(f.x,f.y,'#ffbd78',18,170);if(Math.random()<.42)spawnPickup(f.x,f.y,'credit');if(Math.random()<.12)spawnPickup(f.x,f.y,'power',pick(powerDropPool()));}
function updateFrontThreats(dt){
  const p=G.player;for(const f of G.frontThreats){if(f.dead)continue;f.t+=dt;f.rot+=f.spin*dt;const u=clamp(f.t/f.duration,0,1),ease=Math.pow(u,1.6);f.x=lerp(f.startX,f.targetX,ease);f.y=lerp(f.startY,f.targetY,ease);f.r=lerp(8,f.kind==='ship'?72:84,Math.pow(u,1.8));if(u>=1){if(Math.hypot(f.x-p.x,f.y-p.y)<f.r+p.r+16)hitPlayer((f.kind==='ship'?22:28)+G.sector*2);f.dead=true;shake=Math.max(shake,7);}}
  G.frontThreats=G.frontThreats.filter(f=>!f.dead);
}
function drawFrontThreat(f){const img=frontAsset(f);cx.save();cx.translate(f.x,f.y);cx.rotate(f.rot);const u=clamp(f.t/f.duration,0,1),d=f.r*2.2;cx.globalAlpha=.55+.45*u;cx.shadowColor=f.kind==='ship'?'#8adfff':'#ffb477';cx.shadowBlur=6+u*18;if(imgReady(img))cx.drawImage(img,-d/2,-d/2,d,d);else{cx.fillStyle='#999';cx.beginPath();cx.arc(0,0,f.r,0,TAU);cx.fill();}cx.restore();if(u>.3){cx.fillStyle='rgba(0,0,0,.48)';cx.fillRect(f.x-f.r*.7,f.y+f.r*.72,f.r*1.4,4);cx.fillStyle='#ffbd73';cx.fillRect(f.x-f.r*.7,f.y+f.r*.72,f.r*1.4*clamp(f.hp/f.maxHp,0,1),4);}}
function triggerBomb(){
  burst(G.player.x,G.player.y,'#ffb67a',34,220);G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:14,vr:780,life:.6,max:.6,col:'#ffb67a'});shake=Math.max(shake,13);flash=Math.max(flash,.9);
  for(const e of G.enemies){if(e.dead)continue;const tier=enemyTier(e.form);const pct=tier===0?1:tier===1?.5:.3;damageEntity(e,Math.max(1,e.hp*pct),'bomb');}
  for(const o of G.obstacles){if(o.dead)continue;o.hp-=o.maxHp*.55;if(o.hp<=0)o.dead=true;}
  if(G.boss&&!G.boss.dead)damageEntity(G.boss,G.boss.maxHp*.08,'bomb');
  AudioX.power('bomb');notify('✹ BOMBA DE RIFT · DETONACIÓN','#ffb67a',1.6);
}
function updateComboState(){if(!G)return;const now={};for(const id of Object.keys(COMBOS)){const [a,b]=id.split('+');if(comboOn(a,b)){now[id]=true;if(!G.activeCombos[id])notify(`${COMBOS[id].name} · COMBO`,COMBOS[id].color,1.6);}}G.activeCombos=now;}
function pumpPowerQueue(){while(G.powerQueue.length&&countActivePowers()<G.maxActivePowers){const next=G.powerQueue.shift();activatePower(next,'queue');}}

function activateFrenzy(){
  if(G.frenzyWave===G.wave||G.boss||G.bossPending)return;
  if(G.sector===1&&G.wave<3)return;
  G.frenzyWave=G.wave;G.frenzyT=7+Math.min(5,G.sector*.65+G.wave*.55);G.frenzyMult=1.45+Math.min(.35,G.sector*.04);
  AudioX.tone(720,.15,.05,'sawtooth',0,260);AudioX.noise(.16,.035,1400,.04);notify(`FRENESÍ · ${Math.ceil(G.frenzyT)}s · XP/CRÉDITOS x${G.frenzyMult.toFixed(1)}`,'#ffcb63',2.2);shake=5;
}
function startBossWarning(b,skill,duration=1.05){
  if(b.telegraphT>0||b.specialT>0)return false;
  b.telegraph=skill;b.telegraphT=duration;G.bossWarningT=duration;G.bossWarningText=BOSS_SKILLS[b.pattern]?.warn||skill;AudioX.bossWarn(G.sector-1);return true;
}
function executeBossSpecial(b,p,sec){
  const skill=b.telegraph;b.telegraph='';b.telegraphT=0;b.specialT=.7;
  if(skill==='sting'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.chargeVX=Math.cos(a)*520;b.chargeVY=Math.sin(a)*520;b.chargeT=.48;for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,a+k*.11,310,8,5,'#ffe66f');
  }else if(skill==='armor'){
    b.guardT=2.3;ringBullets(b.x,b.y,10+b.phase*2,170,8,sec.accent,b.t);spawnEnemy('scarab',b.x-30,b.y-65);if(b.phase>1)spawnEnemy('tank',b.x-30,b.y+65);
  }else if(skill==='cross'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=-3;k<=3;k++){spawnEnemyBullet(b.x,b.y,a+k*.12,315,9,4,'#ff9857');spawnEnemyBullet(b.x,b.y,a+Math.PI/2+k*.09,240,8,4,'#ffd0a8');}b.chargeVX=Math.cos(a)*430;b.chargeVY=Math.sin(a)*430;b.chargeT=.34;
  }else if(skill==='pollen'){
    for(let ring=0;ring<2+(b.phase>1?1:0);ring++)ringBullets(b.x,b.y,10+ring*4,130+ring*55,7,'#e9b7ff',b.t+ring*.22);for(let i=0;i<2;i++)spawnEnemy(pick(['flutter','dust']),b.x-25,b.y+rnd(-100,100));
  }else if(skill==='brood'){
    const n=2+b.phase;for(let i=0;i<n;i++)spawnEnemy(pick(b.phase>1?['worker','soldier','acid']:['worker','soldier']),b.x-35,b.y+rnd(-120,120));for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,Math.PI+k*.16,230,9,6,'#ff746b');
  }else if(skill==='slam'){
    const targetY=p.y;b.y=lerp(b.y,targetY,.72);b.x=W*.62;ringBullets(b.x,b.y,10+b.phase*3,220+b.phase*25,9,sec.accent,b.t);G.particles.push({kind:'ring',x:b.x,y:b.y,r:12,vr:560,life:.55,max:.55,col:sec.accent});shake=11;
  }
}

// ─────────────────────────────────────────────────────────────
// INPUT — joystick relativo robusto con Pointer Events
// ─────────────────────────────────────────────────────────────
const input={keys:new Set(),joyX:0,joyY:0,stickId:null,baseX:0,baseY:0,mouseSteer:false,mouseX:0,mouseY:0};
addEventListener('keydown',e=>{input.keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key==='Escape'&&G?.screen==='GAME')pauseGame();if(e.key===' '&&G?.screen==='GAME')dash();});
addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));

function resetStick(){input.joyX=input.joyY=0;input.stickId=null;stickBase.style.display='none';stickKnob.style.transform='translate(0px,0px)';}
function moveStick(clientX,clientY){
  let dx=clientX-input.baseX,dy=clientY-input.baseY;const max=46,len=Math.hypot(dx,dy)||1;if(len>max){dx=dx/len*max;dy=dy/len*max;}
  input.joyX=clamp(dx/max,-1,1);input.joyY=clamp(dy/max,-1,1);stickKnob.style.transform=`translate(${dx}px,${dy}px)`;
}
stickZone.addEventListener('pointerdown',e=>{
  if(G?.screen!=='GAME')return;e.preventDefault();AudioX.unlock();input.stickId=e.pointerId;try{stickZone.setPointerCapture?.(e.pointerId);}catch(_){}
  const r=stickZone.getBoundingClientRect();input.baseX=e.clientX;input.baseY=e.clientY;
  stickBase.style.left=clamp(e.clientX-r.left-58,8,r.width-124)+'px';stickBase.style.top=clamp(e.clientY-r.top-58,8,r.height-124)+'px';stickBase.style.display='block';moveStick(e.clientX,e.clientY);
},{passive:false});
stickZone.addEventListener('pointermove',e=>{if(e.pointerId===input.stickId){e.preventDefault();moveStick(e.clientX,e.clientY);}},{passive:false});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stickZone.addEventListener(ev,e=>{if(e.pointerId===input.stickId)resetStick();},{passive:false}));
dashBtn.addEventListener('pointerdown',e=>{e.preventDefault();if(G?.screen==='GAME')dash();},{passive:false});

cv.addEventListener('pointerdown',e=>{
  AudioX.unlock();
  if(e.pointerType==='mouse'&&G?.screen==='GAME'){
    input.mouseSteer=true;
    input.mouseX=e.clientX;
    input.mouseY=e.clientY;
    e.preventDefault();
    return;
  }
  handleTap(e.clientX,e.clientY);
},{passive:false});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'){
    input.mouseX=e.clientX;
    input.mouseY=e.clientY;
    input.mouseSteer=G?.screen==='GAME';
  }
},{passive:true});
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')input.mouseSteer=false;},{passive:true});

shopBtn.addEventListener('click',()=>openStore('GAME'));
pauseBtn.addEventListener('click',pauseGame);
audioBtn.addEventListener('click',()=>AudioX.toggle());
fullBtn.addEventListener('click',tryFullscreen);

function axes(){
  let x=input.joyX,y=input.joyY;
  if(input.keys.has('a')||input.keys.has('arrowleft'))x-=1;if(input.keys.has('d')||input.keys.has('arrowright'))x+=1;
  if(input.keys.has('w')||input.keys.has('arrowup'))y-=1;if(input.keys.has('s')||input.keys.has('arrowdown'))y+=1;
  if(input.mouseSteer&&G?.player){const dx=input.mouseX-G.player.x,dy=input.mouseY-G.player.y;const d=Math.hypot(dx,dy);if(d>18){x+=dx/Math.max(70,d);y+=dy/Math.max(70,d);}}
  const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}return{x,y};
}
function dash(){
  const p=G?.player;if(!p||G.screen!=='GAME'||p.dashCd>0)return;
  const a=axes();let dx=a.x,dy=a.y;if(Math.hypot(dx,dy)<.2){dx=1;dy=0;}
  const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;p.dashVX=dx*900;p.dashVY=dy*900;p.dashT=.28;p.inv=.5;
  p.dashCd=Math.max(1.25,2.8-up('dash')*.24);AudioX.dash();shake=Math.max(shake,5);burst(p.x,p.y,'#b6ff75',18,190);
}
function pauseGame(){if(G?.screen!=='GAME')return;G.screen='PAUSE';setScreen('PAUSE');AudioX.pause();saveRun();}
function resumeGame(){if(G){setScreen('GAME');lastT=performance.now();AudioX.unlock();}}
function openStore(from){if(!G)return;shopReturn=from||G.screen;if(G.screen==='GAME')saveRun();setScreen('STORE');AudioX.pause();}
function closeStore(){if(shopReturn==='GAME')resumeGame();else setScreen(shopReturn||'MENU');}

// ─────────────────────────────────────────────────────────────
// SAVE / LOAD — checkpoint consistente, no serializa basura efímera
// ─────────────────────────────────────────────────────────────
function saveRun(){
  if(!G?.player||['MENU','DEAD'].includes(G.screen))return false;
  const p=G.player;const payload={version:VERSION,mode:G.mode||'campaign',sector:G.sector,wave:G.wave,score:G.score,credits:G.credits,hp:p.hp,shield:p.shield,powers:G.powers,queue:G.powerQueue||[],xp:G.xp||0,level:G.level||1,xpNext:G.xpNext||120,heritageNext:G.heritageNext||null,bossCheckpoint:!!G.bossCheckpoint,ts:Date.now()};
  try{localStorage.setItem(KEY_RUN,JSON.stringify(payload));}catch(_){return false;}saveMeta();notify('CHECKPOINT GUARDADO','#79c9ff',1.8);return true;
}
function hasSave(){try{return !!localStorage.getItem(KEY_RUN)||!!localStorage.getItem('swarm_rift_run_v17');}catch(_){return false;}}
function loadRun(){
  const s=loadJSON(KEY_RUN,null)||loadJSON('swarm_rift_run_v17',null);if(!s||!s.sector)return false;
  G={screen:'GAME',mode:s.mode||'campaign',sector:clamp(s.sector,1,SECTORS.length),wave:clamp(s.wave||1,1,3),score:s.score||0,hiScore:META.hiScore||0,credits:Math.max(META.credits||0,s.credits||0),
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],boss:null,kills:0,goal:waveGoal(s.sector,s.wave||1),spawn:.5,obstacleTimer:2,
    powerMeter:0,powers:s.powers||{},powerQueue:s.queue||[],sectorClear:false,bossPending:false,waveBanner:2.4,sectorBanner:2.8,combo:0,comboT:0,lastPowerDrop:0,elapsed:0,xp:s.xp||0,level:s.level||1,xpNext:s.xpNext||120,maxActivePowers:POWER_SLOT_LIMIT,maxQueuePowers:POWER_QUEUE_LIMIT,heritageNext:s.heritageNext||null,activeCombos:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,bossWarningT:0,bossWarningText:'',bossCheckpoint:!!s.bossCheckpoint,trainingBoss:false,postBossT:0,postBossMax:0,frontTimer:7,frontKills:0};
  G.player.hp=clamp(s.hp||G.player.maxHp*.75,1,G.player.maxHp);G.player.shield=clamp(s.shield||0,0,G.player.maxShield);
  setScreen('GAME');tryFullscreen();AudioX.unlock();notify('CHECKPOINT CARGADO · OLEADA REINICIADA','#8edbff',2.5);return true;
}

// ─────────────────────────────────────────────────────────────
// SPAWN / COMBAT ENTITIES
// ─────────────────────────────────────────────────────────────
function spawnEnemy(forceForm=null,x=null,y=null){
  let sec=SECTORS[G.sector-1],origin=sec,shipSpawn=false;
  if(!forceForm&&G.sector>1&&Math.random()<(G.sector===2?.08:.12)){origin=SECTORS[G.sector-2];}
  if(!forceForm&&G.sector>=3&&Math.random()<(0.08+Math.max(0,G.sector-3)*0.025)){shipSpawn=true;}
  const form=forceForm||(shipSpawn?pick(SHIP_FORMS.slice(0,Math.min(3,1+Math.floor(G.wave/1.5)))):chooseTieredForm(origin)),fs=FORM_STATS[form]||FORM_STATS.worker,d=difficulty();
  const side=Math.random();let ex=x,ey=y;
  if(ex==null){ex=side<.78?W+rnd(35,140):rnd(W*.48,W*.96);ey=side<.78?rnd(70,H-55):(side<.89?-35:H+35);}
  const baseHp=(G.sector===1?28:34)+G.sector*12+G.wave*7;
  const e={x:ex,y:ey,ox:ey,r:15*fs.size+G.sector*.45,hp:baseHp*fs.hp*d,maxHp:baseHp*fs.hp*d,spd:(76+G.sector*4)*fs.spd*(1+(d-1)*.13),score:fs.score+G.sector*18,
    form,family:shipSpawn?'RECUPERADORES':origin.family,kind:shipSpawn?'ship':'insect',shipClass:shipSpawn?form:null,shipVariant:shipSpawn?(form==='ship_scout'?rndI(0,3):form==='ship_frigate'?rndI(4,7):rndI(8,11)):null,name:shipSpawn?(SHIP_LABELS[form]||'SHIP'):null,move:fs.move,fireCd:fs.fire?rnd(.55,fs.fire*1.1):999,fireRate:fs.fire||999,specialCd:shipSpawn?rnd(1.6,3.2):999,dashT:0,t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,slow:0,flash:0,contact:(G.sector===1?11:14)+G.sector*2.0};
  G.enemies.push(e);return e;
}
function spawnBoss(){
  if(G.boss)return;const sec=SECTORS[G.sector-1],d=difficulty();
  const maxHp=((920+G.sector*520)*d)*(1.06+G.sector*.045);
  G.boss={x:W+120,y:H*.5,r:58+G.sector*2.6,hp:maxHp,maxHp,pattern:sec.pattern,name:sec.boss,family:sec.family,t:0,fire:.7,phase:1,dead:false,entry:2.2,vx:-90,
    telegraph:'',telegraphT:0,specialT:0,specialCd:3.9,guardT:0,chargeT:0,chargeVX:0,chargeVY:0,animPulse:0};
  if(G.bossCheckpoint)G.boss.hp=maxHp*.5;if(G.mode==='training'){G.trainingBoss=true;G.boss.hp=maxHp*.32;G.boss.maxHp=G.boss.hp;G.boss.r*=.88;}
  G.enemies.length=0;G.eBullets.length=0;G.frontThreats.length=0;G.bossPending=false;G.frenzyT=0;AudioX.bossIntro(G.sector-1);notify(`${G.mode==='training'?'SIMULACIÓN DE JEFE':'ALERTA BIOLÓGICA'} · ${sec.boss}`,'#ffcf73',3);shake=8;
}

function spawnObstacle(){
  const sec=SECTORS[G.sector-1];
  const type=pick(sec.obstacles||['spire']);
  const baseSize={spire:[38,62],mine:[18,26],drone:[24,34],acidpod:[26,42],spore:[22,34],pillar:[32,54],shard:[20,34],gate:[42,68],cocoon:[28,42],dustpod:[24,36],spike:[18,28],nest:[34,54],bulwark:[42,68],seed:[24,38],hopperrock:[30,50]}[type]||[26,40];
  const size=rnd(baseSize[0],baseSize[1]);
  const y=rnd(72,H-72);
  const hpScale={mine:.65,spore:.7,dustpod:.8,shard:.75,drone:.9,gate:1.4,pillar:1.8,bulwark:1.9,nest:1.5,hopperrock:1.3,spire:1.4,acidpod:1.1,seed:.9,cocoon:1.0,spike:.75}[type]||1;
  const speedScale={mine:1.18,shard:1.28,drone:1.1,spore:1.05,gate:.82,pillar:.7,bulwark:.68,nest:.74,hopperrock:.9,seed:1.05}[type]||1;
  const hp=(92+G.sector*34)*hpScale;
  G.obstacles.push({x:W+size+20,y,r:size,type,hp,maxHp:hp,vx:-(82+G.sector*4)*speedScale,rot:rnd(0,TAU),t:0,col:sec.base,contact:10+G.sector*2.3,assetIndex:obstacleAssetIndex(sec,type)});
}
function spawnPickup(x,y,type='credit',key=null){
  G.pickups.push({x,y,vx:rnd(-20,35),vy:rnd(-55,55),r:type==='power'?15:10,type,key,t:0,life:16});
}
function maybeDrop(e){
  const r=Math.random(),ship=e&&e.kind==='ship';if(r<(ship?.32:.22))spawnPickup(e.x,e.y,'credit');else if(r<(ship?.36:.255))spawnPickup(e.x,e.y,'heal');else if(r<(ship?.40:.29))spawnPickup(e.x,e.y,'shield');
  G.powerMeter+=1;if(G.powerMeter>=Math.max(6,11-G.wave)){G.powerMeter=0;const pool=[...powerDropPool(),'bomb'];spawnPickup(e.x,e.y,'power',pick(pool));}
}
function activatePower(key,source='pickup',heritageSeconds=null){
  const p=POWERS[key];if(!p)return;
  if(INSTANT_POWERS.has(key)){triggerBomb();return;}
  const duration=heritageSeconds!=null?heritageSeconds:p.duration;
  if(G.powers[key]){G.powers[key]=Math.min(Math.max(p.duration*2.4,duration*2.2),(G.powers[key]||0)+duration);AudioX.power(key);notify(`${p.icon} ${p.name} · ${Math.ceil(G.powers[key])}s`,p.color,1.8);burst(G.player.x,G.player.y,p.color,18,140);updateComboState();return;}
  if(countActivePowers()>=G.maxActivePowers){if((G.powerQueue||[]).length>=G.maxQueuePowers){notify('RESERVA DE PODERES LLENA','#ff7f92',1.4);AudioX.deny();return;}G.powerQueue.push(key);AudioX.queue();notify(`EN COLA · ${p.icon} ${p.name}`,p.color,1.8);return;}
  G.powers[key]=duration;if(key==='shield')G.player.shield=Math.min(G.player.maxShield,G.player.shield+35);AudioX.power(key);notify(`${source==='heritage'?'HERENCIA · ':''}${p.icon} ${p.name} · ${Math.ceil(G.powers[key])}s`,p.color,2.1);burst(G.player.x,G.player.y,p.color,20,140);updateComboState();
}
function powerOn(key){return (G.powers[key]||0)>0;}

function firePlayer(){
  const p=G.player,target=findTarget();if(!target)return;const dx=target.x-p.x,dy=target.y-p.y,ang=Math.atan2(dy,dx),comboBurst=G.activeCombos[comboId('overdrive','twin')]?1.18:1,baseDmg=24*(1+up('damage')*.10)*(1+(G.level-1)*.08)*(1+(G.sector-1)*.05)*comboBurst;
  const speed=720;
  let shots=[0];
  if(G.activeCombos[comboId('rail','twin')]||G.activeCombos[comboId('burst','twin')])shots=[-.24,-.12,0,.12,.24];
  else if(powerOn('twin'))shots=[-.13,0,.13];
  else if(powerOn('burst'))shots=[-.09,0,.09];
  for(const off of shots){const a=ang+off,lv=G.level||1;G.bullets.push({x:p.x+Math.cos(a)*22,y:p.y+Math.sin(a)*22,vx:Math.cos(a)*(speed+Math.min(180,lv*14)),vy:Math.sin(a)*(speed+Math.min(180,lv*14)),r:4+Math.min(2.2,lv*.14),dmg:baseDmg*(shots.length>1?(shots.length>=5?.52:.76):1),life:1.6,col:powerOn('burst')?'#ffbf8d':lv>=7?'#b9fbff':'#78f4ff',type:'needle',pierce:(G.activeCombos[comboId('rail','twin')]?1:0)+(lv>=10&&Math.random()<.18?1:0),slow:powerOn('cryo')?.34:0,splash:powerOn('acid')?42:0,trail:12+Math.min(24,lv*2)});}if((G.level||1)>=4&&Math.random()<.18)G.particles.push({kind:'ring',x:p.x+24,y:p.y,r:3,vr:90,life:.12,max:.12,col:'#9feaff'});
  AudioX.shot();
}
function findTarget(){
  let best=null,bd=1e9;const p=G.player;
  if(G.boss&&!G.boss.dead){best=G.boss;bd=dist(p,G.boss);}
  for(const f of G.frontThreats||[]){const urgency=1-clamp(f.t/f.duration,0,1),d=dist(p,f)*(.55+urgency*.35);if(d<bd){bd=d;best=f;}}
  for(const e of G.enemies){const d=dist(p,e);if(d<bd){bd=d;best=e;}}
  for(const o of G.obstacles){const d=dist(p,o);if(d<bd*.82){bd=d;best=o;}}
  return best;
}
function fireMissile(){
  const t=findTarget();if(!t)return;const p=G.player;const shots=G.activeCombos[comboId('gravity','missile')]?2:1;
  for(let i=0;i<shots;i++)G.bullets.push({x:p.x+14,y:p.y+(shots>1?(i?8:-8):0),vx:350,vy:rnd(-40,40)+(shots>1?(i?26:-26):0),r:7,dmg:62*(1+up('damage')*.08)*(1+(G.level-1)*.05),life:3,col:'#ff8a53',type:'missile',homing:true,target:t,pierce:0,splash:G.activeCombos[comboId('gravity','missile')]?70:55});
}
function fireRail(){
  const t=findTarget();if(!t)return;const p=G.player,a=Math.atan2(t.y-p.y,t.x-p.x);G.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*1100,vy:Math.sin(a)*1100,r:5,dmg:110*(1+up('damage')*.1),life:1.05,col:'#73ffd1',type:'rail',pierce:4,splash:0});shake=Math.max(shake,2.5);AudioX.sparkLaser();
}
function teslaPulse(){
  const count=G.activeCombos[comboId('cryo','tesla')]?6:4;const candidates=[...(G.boss?[G.boss]:[]),...G.enemies].filter(Boolean).sort((a,b)=>dist(G.player,a)-dist(G.player,b)).slice(0,count);if(!candidates.length)return;
  let prev=G.player;for(const e of candidates){const dmg=(G.activeCombos[comboId('cryo','tesla')]?38:32)*(1+up('damage')*.08);damageEntity(e,dmg,'tesla');if(G.activeCombos[comboId('cryo','tesla')]&&e!==G.boss)e.slow=Math.max(e.slow,1.8);G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:e.x,y2:e.y,life:.12,max:.12,col:'#8edbff'});prev=e;}
}
function gravityPulse(){
  const p=G.player,acidCombo=G.activeCombos[comboId('acid','gravity')],radius=acidCombo?270:220;G.particles.push({kind:'ring',x:p.x,y:p.y,r:10,vr:520,life:.45,max:.45,col:acidCombo?'#b8ff77':'#b58cff'});
  for(const e of G.enemies){if(dist(p,e)<radius){e.x=lerp(e.x,p.x,.16);e.y=lerp(e.y,p.y,.16);damageEntity(e,(acidCombo?30:24)*(1+up('damage')*.08),acidCombo?'acid':'gravity');}}
  if(G.boss&&dist(p,G.boss)<radius+40)damageEntity(G.boss,(acidCombo?44:35)*(1+up('damage')*.08),acidCombo?'acid':'gravity');
}
function fireSupportVolley(){
  const p=G.player,count=supportCount(),target=findTarget();if(!count||!target)return;
  const boosted=powerOn('burst')||powerOn('overdrive')||G.activeCombos[comboId('burst','drone')];
  for(let i=0;i<count;i++){
    const orb=supportOrbit(i,count),t=findTarget()||target,ang=Math.atan2(t.y-orb.y,t.x-orb.x),inf=maybeSupportInfusion();
    let shots=[0];if(powerOn('twin')||G.level>=5)shots=[-.08,0,.08];if(G.activeCombos[comboId('burst','drone')]||((powerOn('burst')||G.level>=9)&&i%2===0))shots=[-.16,-.08,0,.08,.16];
    if(inf==='rail'&&Math.random()<.34){G.bullets.push({x:orb.x,y:orb.y,vx:Math.cos(ang)*980,vy:Math.sin(ang)*980,r:4,dmg:44*(1+up('damage')*.08),life:.95,col:'#8affdb',type:'rail',pierce:2,splash:0});AudioX.sparkLaser();continue;}
    if(inf==='missile'&&Math.random()<.22){G.bullets.push({x:orb.x,y:orb.y,vx:Math.cos(ang)*300,vy:Math.sin(ang)*300,r:5,dmg:32*(1+up('damage')*.07),life:2.2,col:'#ff965e',type:'missile',homing:true,target:t,pierce:0,splash:36});continue;}
    if(inf==='tesla'&&Math.random()<.24){damageEntity(t,22*(1+up('damage')*.05),'tesla');G.particles.push({kind:'arc',x:orb.x,y:orb.y,x2:t.x,y2:t.y,life:.12,max:.12,col:'#8edbff'});continue;}
    for(const off of shots){const a=ang+off;G.bullets.push({x:orb.x+Math.cos(a)*10,y:orb.y+Math.sin(a)*10,vx:Math.cos(a)*(boosted?690:620),vy:Math.sin(a)*(boosted?690:620),r:3.2,dmg:13*(1+up('damage')*.06)*(shots.length>=5?.54:shots.length>=3?.72:1),life:1.5,col:inf==='acid'?'#b6ff75':inf==='cryo'?'#c8f7ff':'#e8fbff',type:'wing',pierce:0,slow:inf==='cryo'?.65:0,splash:inf==='acid'?26:0});}
  }
  AudioX.droneShot(boosted);
}

function enemyShoot(e,style='aim'){const p=G.player,a=Math.atan2(p.y-e.y,p.x-e.x);if(style==='spread'){for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.19,235+G.sector*4,8);}else spawnEnemyBullet(e.x,e.y,a,260+G.sector*5,9);}
function spawnEnemyBullet(x,y,a,speed=260,dmg=10,r=5,col='#ff6b78'){G.eBullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,dmg,life:5,col});}
function ringBullets(x,y,count,speed,dmg,col='#ff768e',offset=0){for(let i=0;i<count;i++){const a=offset+i/count*TAU;spawnEnemyBullet(x,y,a,speed,dmg,5,col);}}

function damageEntity(e,dmg,kind='normal'){
  if(!e||e.dead)return;if(e===G.boss&&e.guardT>0)dmg*=.35;e.hp-=dmg;e.flash=.08;AudioX.hit();
  if(e===G.boss)G.bossHitT=.32;
  if(e!==G.boss&&kind==='cryo')e.slow=Math.max(e.slow,1.4);
  if(e.hp<=0){if(e===G.boss)killBoss();else killEnemy(e);}
}
function killEnemy(e){if(e.dead)return;e.dead=true;const fm=G.frenzyT>0?G.frenzyMult:1;G.score+=Math.round(e.score*(1+Math.min(1.5,G.combo*.03))*fm);G.kills++;G.combo++;G.comboT=2.2;gainXp(Math.round(xpForEnemy(e)*fm));if(G.frenzyT>0&&Math.random()<.18)spawnPickup(e.x,e.y,'credit');maybeDrop(e);burst(e.x,e.y,SECTORS[G.sector-1].accent,10,130);}
function killBoss(){
  const b=G.boss;if(!b||b.dead)return;b.dead=true;AudioX.bossDie();burst(b.x,b.y,SECTORS[G.sector-1].accent,72,300);shake=15;flash=1;
  const training=G.mode==='training',replay=G.bossCheckpoint,baseReward=training?0:Math.round((520+G.sector*145)*(replay?.55:1));G.score+=training?2200:6000+G.sector*2600;G.credits+=baseReward;META.credits=G.credits;if(!training)gainXp(170+G.sector*65);
  if(!training){META.bosses=(META.bosses||0)+1;META.defeated=META.defeated||{};META.defeated[G.sector]=true;META.unlocked=Math.max(META.unlocked,Math.min(SECTORS.length,G.sector+1));META.hiScore=Math.max(META.hiScore,G.score);G.hiScore=META.hiScore;const heritage=HERITAGE_BY_SECTOR[G.sector];if(heritage){G.heritageNext=heritage;META.bossUnlocks[G.sector]=heritage;G.lastBossDrop=heritage;G.heritageNext=heritage;spawnPickup(b.x,b.y,'power',heritage);notify(`PODER DE JEFE · ${HERITAGE_NAMES[G.sector]||POWERS[heritage].name}`,'#ffd76a',2.6);}}
  const drops=training?2:replay?5:8;for(let i=0;i<drops;i++)spawnPickup(b.x+rnd(-70,70),b.y+rnd(-70,70),'credit');if(!training){spawnPickup(b.x+rnd(-45,45),b.y+rnd(-45,45),'heal');spawnPickup(b.x+rnd(-45,45),b.y+rnd(-45,45),'shield');for(let i=0;i<(replay?1:2);i++)spawnPickup(b.x+rnd(-55,55),b.y+rnd(-55,55),'power',pick(powerDropPool()));}
  saveMeta();try{localStorage.removeItem(KEY_RUN);}catch(_){}G.sectorClear=true;G.postBossT=training?4.2:6.5;G.postBossMax=G.postBossT;G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;notify(training?'PRÁCTICA COMPLETADA · RECOGE LOS RESTOS':'ZONA SEGURA · RECOGE LOS PREMIOS','#a6ff5f',2.4);
}

function hitPlayer(dmg){const p=G.player;if(p.inv>0||p.dashT>0)return;if(G.mode==='training')dmg*=.52;if(p.shield>0){const take=Math.min(p.shield,dmg);p.shield-=take;dmg-=take;}if(dmg>0)p.hp-=dmg;p.inv=.55;G.heartHitT=.55;AudioX.hurt();shake=Math.max(shake,7);flash=Math.max(flash,.45);burst(p.x,p.y,'#ff5b73',14,160);if(p.hp/p.maxHp<=.10&&!G.critWarned){G.critWarned=true;notify('PELIGRO · INTEGRIDAD CRÍTICA','#ff5b73',2.2);}if(p.hp>p.maxHp*.10)G.critWarned=false;if(p.hp<=0)gameOver();}
function gameOver(){AudioX.stopBoss();G.hiScore=Math.max(G.hiScore,G.score);META.hiScore=Math.max(META.hiScore,G.hiScore);META.credits=G.credits;saveMeta();setScreen('DEAD');}
function burst(x,y,col,count=10,speed=100){for(let i=0;i<count;i++){const a=rnd(0,TAU),s=rnd(speed*.3,speed);G.particles.push({kind:'dot',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rnd(1.5,4.5),life:rnd(.25,.7),max:.7,col});}}

// ─────────────────────────────────────────────────────────────
// UPDATE LOOP
// ─────────────────────────────────────────────────────────────
let timers={missile:0,rail:0,tesla:0,gravity:0,drone:0};
function update(dt){
  if(!G||G.screen!=='GAME'||W<H)return;
  G.elapsed+=dt;for(const n of notices)n.t-=dt;notices=notices.filter(n=>n.t>0);if(G.waveBanner>0)G.waveBanner-=dt;if(G.sectorBanner>0)G.sectorBanner-=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}
  G.bossHitT=Math.max(0,(G.bossHitT||0)-dt);G.heartHitT=Math.max(0,(G.heartHitT||0)-dt);G.bossWarningT=Math.max(0,(G.bossWarningT||0)-dt);if(G.frenzyT>0){G.frenzyT=Math.max(0,G.frenzyT-dt);if(G.frenzyT<=0){G.frenzyMult=1;notify('FRENESÍ FINALIZADO','#9fb4c5',1.3);}}
  if(G.postBossT>0){G.postBossT=Math.max(0,G.postBossT-dt);G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;updatePowers(dt);updatePlayer(dt);updatePickups(dt);updateParticles(dt);if(G.postBossT<=0||(G.postBossT<G.postBossMax-1.6&&G.pickups.length===0))setScreen('VICTORY');return;}
  updatePowers(dt);updatePlayer(dt);updateSpawns(dt);updateEnemies(dt);updateBoss(dt);updateObstacles(dt);updateFrontThreats(dt);updateBullets(dt);updateEnemyBullets(dt);updatePickups(dt);updateParticles(dt);
  if(!G.boss&&!G.bossPending&&!G.sectorClear&&G.kills>=Math.ceil(G.goal*.58)&&G.frenzyWave!==G.wave)activateFrenzy();
  if(shake>0)shake=Math.max(0,shake-dt*18);if(flash>0)flash=Math.max(0,flash-dt*1.8);
  if(!G.sectorClear&&G.kills>=G.goal&&!G.boss&&G.enemies.filter(e=>!e.dead).length===0){
    if(G.mode==='training'){if(!G.bossPending){G.bossPending=true;G.trainingBoss=true;setTimeout(()=>{if(G?.screen==='GAME'&&G.bossPending&&!G.boss)spawnBoss();},650);}}
    else if(G.wave<3){G.wave++;G.kills=0;G.goal=waveGoal(G.sector,G.wave);G.spawn=.9;G.waveBanner=2.2;G.player.shield=Math.min(G.player.maxShield,G.player.shield+15);G.credits+=35+G.sector*10+G.wave*6;gainXp(45+G.sector*12);saveRun();notify(`ORDA ${G.wave}/3 · PRESIÓN AUMENTADA`,'#ffd76a',2.0);}
    else if(!G.bossPending){G.bossPending=true;setTimeout(()=>{if(G?.screen==='GAME'&&G.bossPending&&!G.boss)spawnBoss();},750);}
  }
}
function updatePowers(dt){
  for(const k of Object.keys(G.powers)){G.powers[k]-=dt;if(G.powers[k]<=0)delete G.powers[k];}
  pumpPowerQueue();updateComboState();
  timers.missile-=dt;timers.rail-=dt;timers.tesla-=dt;timers.gravity-=dt;timers.drone-=dt;
  if(powerOn('missile')&&timers.missile<=0){timers.missile=G.activeCombos[comboId('gravity','missile')]?.52:.72;fireMissile();}
  if(powerOn('rail')&&timers.rail<=0){timers.rail=G.activeCombos[comboId('rail','twin')]?1.12:1.45;fireRail();}
  if(powerOn('tesla')&&timers.tesla<=0){timers.tesla=G.activeCombos[comboId('cryo','tesla')]?.62:.88;teslaPulse();}
  if(powerOn('gravity')&&timers.gravity<=0){timers.gravity=1.75;gravityPulse();}
  if(powerOn('shield')&&G.player.shield<G.player.maxShield)G.player.shield=Math.min(G.player.maxShield,G.player.shield+dt*3.5);
}
function updatePlayer(dt){
  const p=G.player,a=axes(),lv=G.level||1;p.inv=Math.max(0,p.inv-dt);p.dashCd=Math.max(0,p.dashCd-dt);dashBtn.classList.toggle('cooldown',p.dashCd>0);
  if(p.dashT>0){p.dashT-=dt;p.x+=p.dashVX*dt;p.y+=p.dashVY*dt;}else{
    const lvlSpeed=1+Math.min(.28,(lv-1)*.026),speed=285*(1+up('engine')*.05)*lvlSpeed*(powerOn('overdrive')?1.26:1),responseBase=Math.max(.00008,.001*Math.pow(.82,lv-1)),response=1-Math.pow(responseBase,dt);
    p.vx=lerp(p.vx,a.x*speed,response);p.vy=lerp(p.vy,a.y*speed,response);if(Math.abs(a.x)<.05)p.vx*=Math.pow(.72,dt*60*(1+lv*.025));if(Math.abs(a.y)<.05)p.vy*=Math.pow(.72,dt*60*(1+lv*.025));p.x+=p.vx*dt;p.y+=p.vy*dt;
  }
  p.x=clamp(p.x,28,W-28);p.y=clamp(p.y,44,H-30);
  const rate=Math.max(.058,.19*(1-up('rate')*.055)*(powerOn('overdrive')?.72:1)*(powerOn('burst')?.76:1)*(1-Math.min(.16,(lv-1)*.008)));p.fire-=dt;if(p.fire<=0){p.fire=rate;firePlayer();}
  const count=supportCount();if(count>0&&timers.drone<=0){timers.drone=supportRate();fireSupportVolley();}
}
function updateSpawns(dt){
  if(G.boss||G.bossPending||G.sectorClear)return;G.spawn-=dt;G.obstacleTimer-=dt;G.frontTimer-=dt;
  const alive=G.enemies.filter(e=>!e.dead).length,maxAlive=Math.round((6.4+G.sector*.82+G.wave*1.9)*(G.frenzyT>0?1.34:1)*(G.mode==='training'?.62:1));
  if(G.spawn<=0&&G.kills<G.goal&&alive<maxAlive){
    const chance=G.wave===3?.34:G.wave===2?.18:.06,burstCount=Math.random()<chance?2:1;for(let i=0;i<burstCount;i++)spawnEnemy();
    G.spawn=Math.max(.16,.96-difficulty()*.11-G.wave*.065)*rnd(.70,1.08)*(G.frenzyT>0?.64:1)*(G.mode==='training'?1.15:1);
  }
  if(G.obstacleTimer<=0&&G.obstacles.length<(G.mode==='training'?1:(G.sector===1?3:5))){spawnObstacle();G.obstacleTimer=rnd(G.sector===1?2.8:2.2,G.sector===1?4.5:4.0)/Math.min(1.55,difficulty());}
  if(G.frontTimer<=0&&G.frontThreats.length<(G.mode==='training'?1:2)){spawnFrontThreat();G.frontTimer=rnd(G.mode==='training'?8:5.8,G.mode==='training'?11:9.8)-Math.min(1.8,G.sector*.18);}
}
function updateEnemyShip(e,dt,p){
  e.specialCd-=dt;e.fireCd-=dt;e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);const sm=e.slow>0?.58:1;
  if(e.shipClass==='ship_scout'){
    if(e.dashT>0){e.dashT-=dt;e.x+=e.dashVX*dt*sm;e.y+=e.dashVY*dt*sm;}
    else{e.x+=((e.x>W*.78?-e.spd*.8:e.x<W*.64?e.spd*.35:-e.spd*.12))*dt*sm;e.y+=Math.sin(e.t*5+e.phase)*105*dt*sm;if(e.specialCd<=0){const a=Math.atan2(p.y-e.y,p.x-e.x);e.dashVX=Math.cos(a)*e.spd*2.6;e.dashVY=Math.sin(a)*e.spd*2.6;e.dashT=.52;e.specialCd=rnd(2.0,3.0);AudioX.tone(520,.08,.025,'triangle');}}
    if(e.fireCd<=0){e.fireCd=e.fireRate*rnd(.82,1.05);const a=Math.atan2(p.y-e.y,p.x-e.x);spawnEnemyBullet(e.x,e.y,a,330+G.sector*7,7,4,'#78dfff');}
  }else if(e.shipClass==='ship_frigate'){
    e.x+=((e.x>W*.80?-e.spd*.55:e.x<W*.68?e.spd*.25:0))*dt*sm;e.y+=clamp((p.y-e.y)*.55,-80,80)*dt*sm;
    if(e.fireCd<=0){e.fireCd=e.fireRate*rnd(.9,1.15);const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.13,270+G.sector*5,8,5,'#ffbd82');}
    if(e.specialCd<=0){e.specialCd=rnd(3.4,4.5);ringBullets(e.x,e.y,6,165+G.sector*5,6,'#ffc98e',e.t);}
  }else{
    e.x+=((e.x>W*.84?-e.spd*.48:e.x<W*.72?e.spd*.18:0))*dt*sm;e.y+=Math.sin(e.t*1.8+e.phase)*48*dt*sm;
    if(e.fireCd<=0){e.fireCd=e.fireRate*rnd(.95,1.2);const a=Math.atan2(p.y-e.y,p.x-e.x);spawnEnemyBullet(e.x,e.y,a,215+G.sector*4,13,8,'#ff795f');}
    if(e.specialCd<=0){e.specialCd=rnd(3.8,5.0);const sec=SECTORS[G.sector-1],size=20,hp=55+G.sector*16;G.obstacles.push({x:e.x-18,y:e.y+rnd(-36,36),r:size,type:'mine',hp,maxHp:hp,vx:-95,rot:rnd(0,TAU),t:0,col:'#ff795f',contact:14+G.sector*1.5,assetIndex:obstacleAssetIndex(sec,'mine')});AudioX.tone(165,.12,.03,'square');}
  }
  e.y=clamp(e.y,35,H-35);if(dist(e,p)<e.r+p.r){hitPlayer(e.contact);e.x+=45;}if(e.x<-80){e.dead=true;hitPlayer(7+G.sector*.8);}
}
function updateEnemies(dt){
  const p=G.player;
  for(const e of G.enemies){
    if(e.dead)continue;e.t+=dt;if(e.kind==='ship'){updateEnemyShip(e,dt,p);continue;}e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);const sm=e.slow>0?.54:1;let vx=-e.spd,vy=0;
    switch(e.move){
      case 'sine':vy=Math.sin(e.t*3+e.phase)*85;break;
      case 'rush':{const a=Math.atan2(p.y-e.y,p.x-e.x);vx=Math.cos(a)*e.spd*1.1;vy=Math.sin(a)*e.spd*1.1;break;}
      case 'hover':vx=-e.spd*.55;vy=Math.sin(e.t*2.1+e.phase)*55;break;
      case 'wave':vx=-e.spd*.82;vy=Math.sin(e.t*4+e.phase)*110;break;
      case 'flutter':vx=-e.spd*(.72+.28*Math.sin(e.t*5));vy=Math.sin(e.t*7+e.phase)*105;break;
      case 'sniper':vx=e.x>W*.72?-e.spd*.65:e.x<W*.58?e.spd*.4:0;vy=Math.sin(e.t*1.6)*35;break;
      case 'zig':vx=-e.spd;vy=(Math.sin(e.t*5+e.phase)>0?1:-1)*75;break;
      case 'dash':{const pulse=(Math.sin(e.t*3.5+e.phase)>.55)?1.8:.7;const a=Math.atan2(p.y-e.y,p.x-e.x);vx=Math.cos(a)*e.spd*pulse;vy=Math.sin(a)*e.spd*pulse;break;}
      case 'leap':{const pulse=Math.max(.35,(Math.sin(e.t*3.2+e.phase)+1)*.7);vx=-e.spd*pulse;vy=Math.sin(e.t*3.2+e.phase)*130;break;}
      case 'dart':vx=-e.spd*(1.1+.7*Math.max(0,Math.sin(e.t*4)));vy=Math.sin(e.t*6+e.phase)*80;break;
      case 'orbit':{const a=Math.atan2(p.y-e.y,p.x-e.x);vx=Math.cos(a)*e.spd*.75-Math.sin(a)*85;vy=Math.sin(a)*e.spd*.75+Math.cos(a)*85;break;}
      default:break;
    }
    e.x+=vx*dt*sm;e.y+=vy*dt*sm;e.y=clamp(e.y,35,H-35);
    e.fireCd-=dt;if(e.fireCd<=0&&e.fireRate<10){e.fireCd=e.fireRate*rnd(.85,1.2);enemyShoot(e,(e.form==='bomber'||e.form==='shocker'||e.form==='sonic')?'spread':'aim');}
    if(dist(e,p)<e.r+p.r){hitPlayer(e.contact);e.x+=45;}
    if(e.x<-80){e.dead=true;hitPlayer(7+G.sector*.8);}
  }
  G.enemies=G.enemies.filter(e=>!e.dead&&e.x>-120);
}
function updateBoss(dt){
  const b=G.boss;if(!b||b.dead)return;b.t+=dt;b.fire-=dt;b.specialCd-=dt;b.specialT=Math.max(0,b.specialT-dt);b.guardT=Math.max(0,b.guardT-dt);b.flash=Math.max(0,(b.flash||0)-dt);b.animPulse=Math.max(0,(b.animPulse||0)-dt);
  const ratio=b.hp/b.maxHp,newPhase=ratio>.68?1:ratio>.34?2:3;if(newPhase!==b.phase){b.phase=newPhase;b.specialCd=.9;b.animPulse=1.15;notify(`FASE ${newPhase} · ${b.name}`,'#ffbd6a',2);AudioX.bossPhase(G.sector-1);shake=9;ringBullets(b.x,b.y,7+newPhase*3,175+newPhase*25,8+newPhase,SECTORS[G.sector-1].accent,b.t);if(G.mode!=='training')for(let i=0;i<newPhase;i++)spawnEnemy(SECTORS[G.sector-1].forms[Math.min(1,newPhase-1)],b.x-35,b.y+rnd(-95,95));}
  if(b.entry>0){b.entry-=dt;b.x=lerp(b.x,W*.76,1-Math.pow(.01,dt));b.y=H*.5+Math.sin(b.t*3)*18;return;}
  const p=G.player,sec=SECTORS[G.sector-1],phaseSpeed=1+(b.phase-1)*.18;
  if(b.telegraphT>0){b.telegraphT-=dt;b.animPulse=Math.max(b.animPulse,.38);b.x+=Math.sin(b.t*18)*8*dt;if(b.telegraphT<=0)executeBossSpecial(b,p,sec);return;}
  if(b.chargeT>0){b.chargeT-=dt;b.x+=b.chargeVX*dt;b.y+=b.chargeVY*dt;if(dist(b,p)<b.r+p.r+10)hitPlayer(22+G.sector*2.4);if(b.chargeT<=0){b.x=clamp(b.x,W*.52,W*.9);b.specialCd=2.8-Math.min(.7,b.phase*.18);}return;}
  if(b.specialCd<=0){const key={storm:'sting',titan:'armor',blade:'cross',moth:'pollen',queen:'brood',leap:'slam'}[b.pattern];if(key){startBossWarning(b,key,b.pattern==='titan'?1.05:.85);b.specialCd=Math.max(2.2,4.9-b.phase*.58-G.sector*.07);return;}}
  switch(b.pattern){
    case 'queen':b.x=W*.76+Math.sin(b.t*.75)*W*.09;b.y=H*.5+Math.sin(b.t*1.55)*H*.27;if(b.fire<=0){b.fire=Math.max(.42,.92/(phaseSpeed));ringBullets(b.x,b.y,6+b.phase*3,190+b.phase*22,8+b.phase,sec.accent,b.t*.65);if(Math.random()<.58)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-30,b.y+rnd(-85,85));}break;
    case 'moth':b.y=H*.5+Math.sin(b.t*2.9)*H*.31;b.x=W*.73+Math.sin(b.t*1.15)*W*.11;if(b.fire<=0){b.fire=Math.max(.44,.76-.08*b.phase);enemyShoot(b,'spread');for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,Math.PI+k*.145,180+22*b.phase,7+b.phase*.5,5,'#e9d5ff');if(b.phase===3&&Math.random()<.35)spawnEnemy(pick(sec.forms),b.x-30,b.y+rnd(-90,90));}break;
    case 'blade':{const a=Math.atan2(p.y-b.y,p.x-b.x);b.x=W*.75+Math.sin(b.t*1.5)*W*.09;b.y=H*.5+Math.sin(b.t*2.7)*H*.24;if(b.fire<=0){b.fire=Math.max(.38,.68-.07*b.phase);for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,a+k*.12,275+25*b.phase,8+b.phase*.6,4.5,'#ff9a55');}break;}
    case 'titan':b.x=W*.75+Math.sin(b.t*.7)*W*.08;b.y=H*.5+Math.sin(b.t*1.15)*H*.23;if(b.fire<=0){b.fire=Math.max(.44,.72-.06*b.phase);enemyShoot(b,b.phase>1?'spread':'aim');if(b.phase>=2&&Math.random()<.6)ringBullets(b.x,b.y,7+b.phase*2,155+18*b.phase,8,sec.accent,b.t);if(b.phase===3&&Math.random()<.32)spawnEnemy(sec.forms[1],b.x-35,b.y+rnd(-95,95));}break;
    case 'storm':b.y=H*.5+Math.sin(b.t*2.55)*H*.33;b.x=W*.74+Math.sin(b.t*1.65)*W*.12;if(b.fire<=0){b.fire=Math.max(.36,.60-.055*b.phase);enemyShoot(b,'spread');if(b.phase>1)ringBullets(b.x,b.y,6+b.phase*3,210+15*b.phase,8.5,'#ffe66f',b.t*2.4);if(b.phase===3&&Math.random()<.42)spawnEnemy(sec.forms[0],b.x-30,b.y+rnd(-95,95));}break;
    case 'leap':{const leap=(Math.sin(b.t*2.6)+1)*.5;b.x=W*.78-leap*W*.18;b.y=H*.5+Math.sin(b.t*2.6)*H*.34;if(b.fire<=0){b.fire=Math.max(.43,.76-.065*b.phase);ringBullets(b.x,b.y,6+b.phase*3,205+18*b.phase,9,sec.accent,b.t);if(b.phase>1&&Math.random()<.28)spawnEnemy(pick(sec.forms),b.x-25,b.y+rnd(-80,80));}break;}
  }
  b.x=clamp(b.x,W*.48,W*.91);b.y=clamp(b.y,68,H-68);if(dist(b,p)<b.r+p.r)hitPlayer(24+G.sector*2.3);
}
function updateObstacles(dt){
  const p=G.player;
  for(const o of G.obstacles){
    o.t+=dt;o.x+=o.vx*dt;o.rot+=dt*.4;
    if(o.type==='mine'){o.y+=Math.sin(o.t*4+o.r)*18*dt; if(dist(o,p)<o.r+42){o.hp=0;hitPlayer(16+G.sector);ringBullets(o.x,o.y,6,190,7,'#ffe16b',o.rot);}}
    if(o.type==='acidpod'&&dist(o,p)<o.r+46){o.hp=0;hitPlayer(18+G.sector);ringBullets(o.x,o.y,10,175,8,'#c9ff77',o.rot);}
    if(o.type==='spore'&&dist(o,p)<o.r+48){o.hp=0;hitPlayer(17+G.sector);ringBullets(o.x,o.y,8,180,7,'#c9ff77',o.rot);}
    if(o.type==='dustpod'&&dist(o,p)<o.r+52){o.hp=0;hitPlayer(15+G.sector);for(let k=-2;k<=2;k++)spawnEnemyBullet(o.x,o.y,Math.PI+k*.18,170,7,5,'#e9d5ff');}
    if(o.type==='drone'&&o.t>1.2&&Math.sin(o.t*2.1)>.985){spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x),255,8,5,'#9ee8ff');}
    if(o.type==='seed'&&o.t>1.4&&Math.sin(o.t*3.1)>.992){spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x),220,8,5,'#ebff77');}
    if(dist(o,p)<o.r+p.r){hitPlayer(o.contact||12);p.x-=18;}
    if(o.hp<=0){o.dead=true;burst(o.x,o.y,o.col,14,150);
      if(['cocoon','nest'].includes(o.type)&&Math.random()<.55)spawnPickup(o.x,o.y,'power',pick(POWER_KEYS));
      else if(['mine','dustpod','seed'].includes(o.type)&&Math.random()<.38)spawnPickup(o.x,o.y,'shield');
      else if(Math.random()<.42)spawnPickup(o.x,o.y,'credit');
    }
  }
  G.obstacles=G.obstacles.filter(o=>!o.dead&&o.x>-120);
}
function updateBullets(dt){
  for(const b of G.bullets){
    if(b.homing&&b.target&&!b.target.dead){const a=Math.atan2(b.target.y-b.y,b.target.x-b.x),spd=Math.hypot(b.vx,b.vy);b.vx=lerp(b.vx,Math.cos(a)*spd,dt*4.5);b.vy=lerp(b.vy,Math.sin(a)*spd,dt*4.5);}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)continue;
    let hit=null;if(G.boss&&!G.boss.dead&&dist(b,G.boss)<b.r+G.boss.r)hit=G.boss;
    if(!hit){for(const f of G.frontThreats){if(!f.dead&&dist(b,f)<b.r+f.r){hit=f;break;}}}
    if(!hit){for(const e of G.enemies){if(!e.dead&&dist(b,e)<b.r+e.r){hit=e;break;}}}
    if(!hit){for(const o of G.obstacles){if(!o.dead&&dist(b,o)<b.r+o.r){hit=o;break;}}}
    if(hit){
      if('hp'in hit){if(hit===G.boss)damageEntity(hit,b.dmg,b.slow?'cryo':'normal');else{hit.hp-=b.dmg;hit.flash=.07;if(G.frontThreats.includes(hit)&&hit.hp<=0)killFrontThreat(hit);else if(G.enemies.includes(hit)&&hit.hp<=0)killEnemy(hit);else if(G.obstacles.includes(hit)&&hit.hp<=0)hit.dead=true;}}
      if(b.slow&&G.enemies.includes(hit))hit.slow=Math.max(hit.slow,1.3);
      if(b.splash){for(const e of G.enemies){if(!e.dead&&e!==hit&&Math.hypot(e.x-b.x,e.y-b.y)<b.splash)damageEntity(e,b.dmg*.34,b.slow?'cryo':'acid');}if(G.boss&&hit!==G.boss&&Math.hypot(G.boss.x-b.x,G.boss.y-b.y)<b.splash)damageEntity(G.boss,b.dmg*.22,'acid');burst(b.x,b.y,b.col,7,100);}
      AudioX.hit();if(b.pierce>0){b.pierce--;b.x+=b.vx*dt*2;}else b.life=0;
    }
  }
  G.bullets=G.bullets.filter(b=>b.life>0&&b.x>-80&&b.x<W+120&&b.y>-100&&b.y<H+100);
}
function updateEnemyBullets(dt){
  const p=G.player;for(const b of G.eBullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life>0&&dist(b,p)<b.r+p.r){b.life=0;hitPlayer(b.dmg);}}
  G.eBullets=G.eBullets.filter(b=>b.life>0&&b.x>-80&&b.x<W+80&&b.y>-80&&b.y<H+80);
}
function updatePickups(dt){
  const p=G.player,mag=70+up('magnet')*18+(powerOn('magnet')?160:0)+(G.postBossT>0?1200:0);
  for(const q of G.pickups){q.t+=dt;if(G.postBossT<=0)q.life-=dt;else q.life=Math.max(q.life,4);q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.94,dt*60);q.vy*=Math.pow(.94,dt*60);const d=dist(q,p);if(d<mag){const k=clamp(dt*(d<42?12:4.8),0,1);q.x=lerp(q.x,p.x,k);q.y=lerp(q.y,p.y,k);}if(d<p.r+q.r+5){collect(q);q.life=0;}}
  G.pickups=G.pickups.filter(q=>q.life>0);
}
function collect(q){
  if(q.type==='credit'){const gain=Math.round((20+G.sector*5)*(1+up('salvage')*.08));G.credits+=gain;META.credits=G.credits;G.score+=gain*3;gainXp(Math.round(gain*.7));AudioX.pickup();}
  else if(q.type==='heal'){G.player.hp=Math.min(G.player.maxHp,G.player.hp+24);AudioX.pickup();notify('+24 CASCO','#ff7791',1.2);}
  else if(q.type==='shield'){G.player.shield=Math.min(G.player.maxShield,G.player.shield+28);AudioX.pickup();notify('+28 ESCUDO','#7fb7ff',1.2);}
  else if(q.type==='power')activatePower(q.key,'pickup');
}
function updateParticles(dt){for(const p of G.particles){p.life-=dt;if(p.kind==='dot'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.98;p.vy*=.98;}else if(p.kind==='ring')p.r+=p.vr*dt;}G.particles=G.particles.filter(p=>p.life>0);}

// ─────────────────────────────────────────────────────────────
// DRAW — fondos planetarios, barreras y arte insectoide procedural
// ─────────────────────────────────────────────────────────────
function rr(x,y,w,h,r=12){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):(cx.rect(x,y,w,h));}
function drawBackground(){
  const sec=SECTORS[(G?.sector||1)-1]||SECTORS[0],t=G?.elapsed||performance.now()/1000;
  const img=IMG.bg[sec.bg]||IMG.bg.rust;
  cx.fillStyle=sec.dark||'#050814';
  cx.fillRect(0,0,W,H);
  if(imgReady(img)){
    const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const iw=img.naturalWidth*scale, ih=img.naturalHeight*scale;
    const dx=(W-iw)/2 + Math.sin(t*0.07+(G?.sector||1))*8;
    const dy=(H-ih)/2 + Math.cos(t*0.05+(G?.sector||1))*5;
    cx.drawImage(img,dx,dy,iw,ih);
  }
  const vg=cx.createLinearGradient(0,0,0,H);
  vg.addColorStop(0,'rgba(3,6,14,0.18)');
  vg.addColorStop(1,'rgba(2,3,7,0.48)');
  cx.fillStyle=vg;cx.fillRect(0,0,W,H);
  const vignette=cx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.15,W*.5,H*.5,Math.max(W,H)*.7);
  vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,0.42)');
  cx.fillStyle=vignette;cx.fillRect(0,0,W,H);
  for(const s of stars){
    const drift=(sec.bg==='rift'?38:sec.bg==='toxic'?14:20)*s.z;
    let x=(s.x-t*drift)%(W+24); if(x<0)x+=W+24;
    cx.globalAlpha=sec.bg==='rift'?(0.10+.42*s.z):(0.04+.16*s.z);
    cx.fillStyle=sec.bg==='toxic'?hexA(sec.accent,.8):sec.bg==='rust'?'#ffd6a2':'#bde6ff';
    cx.beginPath();cx.arc(x,s.y,s.r*s.z,0,TAU);cx.fill();
  }
  cx.globalAlpha=1;
}

function drawShip(){
  const p=G.player,t=G.elapsed,a=axes();cx.save();cx.translate(p.x,p.y);
  const roll=clamp(a.x*.22,-.24,.24),pitch=clamp(a.y*.12,-.14,.14);cx.rotate(roll);
  if(p.inv>0&&Math.floor(p.inv*18)%2===0)cx.globalAlpha=.45;
  if(imgReady(IMG.ship)){
    const size=132 + (p.dashT>0?20:0);
    cx.drawImage(IMG.ship,-size/2,-size/2+pitch*40,size,size);
  }else{
    cx.fillStyle='#d8f8ff';cx.beginPath();cx.moveTo(0,-24);cx.lineTo(30,18);cx.lineTo(0,8);cx.lineTo(-30,18);cx.closePath();cx.fill();
  }
  cx.restore();
  if(p.shield>0||powerOn('shield')){cx.save();const pulse=.2+.1*Math.sin(t*6),crit=p.shield/p.maxShield<.2;cx.globalAlpha=pulse+.08;cx.strokeStyle=crit?'#ff8fa3':'#78bfff';cx.lineWidth=2;cx.beginPath();cx.arc(p.x,p.y,p.r+21,0,TAU);cx.stroke();cx.globalAlpha=.4;cx.strokeStyle=crit?'#ff627b':'#aee6ff';cx.lineWidth=3;for(let i=0;i<3;i++){cx.beginPath();cx.arc(p.x,p.y,p.r+26+i*4,t*1.4+i*.8,t*1.4+i*.8+Math.PI*.62);cx.stroke();}cx.restore();}
  const vmag=Math.hypot(p.vx,p.vy),speedFx=clamp(vmag/360,0,1),lv=G.level||1;if(speedFx>.12){cx.save();cx.strokeStyle=lv>=7?'rgba(170,246,255,.48)':'rgba(110,210,255,.38)';cx.lineWidth=1.2+speedFx;for(let i=0;i<4;i++){const yy=p.y-17+i*11,len=16+speedFx*28+Math.min(20,lv*1.4);cx.beginPath();cx.moveTo(p.x-28,yy);cx.lineTo(p.x-28-len,yy+rnd(-2,2));cx.stroke();}cx.restore();}
  const dc=supportCount();for(let i=0;i<dc;i++)drawDrone(p,i,dc,t);
}

function drawDrone(p,i,count,t){const orb=supportOrbit(i,count),a=orb.a;cx.save();cx.translate(orb.x,orb.y);cx.rotate(a+Math.PI/2);cx.shadowColor='#76efff';cx.shadowBlur=12;
  if(imgReady(IMG.ship)){const sz=30+(count>=4?2:0);cx.drawImage(IMG.ship,-sz/2,-sz/2,sz,sz);}else{cx.fillStyle='#dfffff';cx.strokeStyle='#75f5ff';cx.lineWidth=1;cx.beginPath();cx.moveTo(8,0);cx.lineTo(-5,-5);cx.lineTo(-2,0);cx.lineTo(-5,5);cx.closePath();cx.fill();cx.stroke();}
  cx.restore();
  cx.save();cx.strokeStyle='rgba(135,232,255,.16)';cx.lineWidth=1;cx.beginPath();cx.arc(p.x,p.y,Math.hypot(orb.x-p.x,orb.y-p.y),a-.18,a+.18);cx.stroke();cx.restore();}

function enemySpriteCell(e,isBoss=false){
  const sec=SECTORS[Math.max(0,(G?.sector||1)-1)]||SECTORS[0];
  const col=FAMILY_COL[e.family||sec.family]??0;
  let row=0;
  if(isBoss) row=2;
  else if(sec.forms[1]===e.form || sec.forms[2]===e.form) row=1;
  return {col,row};
}
function drawInsect(e,isBoss=false){
  const sec=SECTORS[G.sector-1],r=e.r;
  const bob=Math.sin((e.t||0)*(isBoss?3.4:6) + e.x*.01)*(isBoss?8:3);
  cx.save();cx.translate(e.x,e.y+bob);if(isBoss){const flap=Math.sin(G.elapsed*(5.5+e.phase*.8)),pulse=1+(e.animPulse||0)*.12+(e.telegraphT>0?Math.sin(G.elapsed*22)*.065:0);cx.scale(pulse*(1+flap*.035*e.phase),pulse*(1-flap*.018));cx.rotate(e.chargeT>0?Math.atan2(e.chargeVY,e.chargeVX)*.12:Math.sin(G.elapsed*(1.5+e.phase*.12))*(.035+e.phase*.008));if(e.guardT>0){cx.shadowColor=sec.accent;cx.shadowBlur=28;}}
  if(e.flash>0){cx.shadowColor='#fff';cx.shadowBlur=18;}
  cx.fillStyle='rgba(0,0,0,.24)';cx.beginPath();cx.ellipse(0,r*.7,r*.9,r*.26,0,0,TAU);cx.fill();
  if(e.kind==='ship'){
    const img=IMG.generatedShips[e.shipVariant]||IMG.enemyShips.scout,dw=r*3.15,dh=r*2.4;
    if(imgReady(img)) cx.drawImage(img,-dw/2,-dh/2,dw,dh);
    else {cx.fillStyle='#8fd9ff';cx.fillRect(-r,-r*.4,r*2,r*.8);}
  }else if(isBoss&&imgReady(IMG.atlas)){
    const atlas=IMG.atlas,cols=6,rows=3,sw=atlas.naturalWidth/cols,sh=atlas.naturalHeight/rows;
    const {col}=enemySpriteCell(e,true),row=2,dw=r*3.2,dh=r*3.2;
    cx.drawImage(atlas,col*sw,row*sh,sw,sh,-dw/2,-dh/2,dw,dh);
  }else if(imgReady(IMG.tiers)){
    const atlas=IMG.tiers,cols=6,rows=3,sw=atlas.naturalWidth/cols,sh=atlas.naturalHeight/rows;
    const col=FAMILY_COL[e.family]??0,row=clamp(enemyTier(e.form),0,2),tier=row;
    const scale=[2.35,2.62,2.92][tier],dw=r*scale,dh=r*scale;
    cx.drawImage(atlas,col*sw,row*sh,sw,sh,-dw/2,-dh/2,dw,dh);
  }else{
    cx.fillStyle=sec.base;cx.beginPath();cx.arc(0,0,r,0,TAU);cx.fill();
  }
  if(isBoss&&e.telegraphT>0){cx.strokeStyle=BOSS_SKILLS[e.pattern]?.color||sec.accent;cx.lineWidth=4;cx.globalAlpha=.55+.35*Math.sin(G.elapsed*18);cx.beginPath();cx.arc(0,0,r*1.55,0,TAU);cx.stroke();cx.globalAlpha=1;}cx.restore();
  if(!isBoss&&e.kind!=='ship'&&enemyTier(e.form)===2){const w=r*2.0;cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(e.x-w/2,e.y+r*1.45,w,4);cx.fillStyle=sec.accent;cx.fillRect(e.x-w/2,e.y+r*1.45,w*clamp(e.hp/e.maxHp,0,1),4);}
  if(isBoss){const w=Math.min(W*.48,520),hit=G.bossHitT||0,jx=Math.sin(G.elapsed*95)*8*hit,x=W/2-w/2+jx,y=52;cx.fillStyle='rgba(0,0,0,.58)';rr(x,y,w,14,7);cx.fill();cx.fillStyle=hit>0?`rgba(255,88,104,${.55+hit*.8})`:(e.guardT>0?'#aaff72':sec.accent);rr(x+2,y+2,(w-4)*clamp(e.hp/e.maxHp,0,1),10,5);cx.fill();cx.textAlign='center';cx.font='700 12px system-ui';cx.fillStyle=hit>0?'#ffb5bf':'#fff';cx.fillText(`${sec.family} // ${e.name} // FASE ${e.phase} // ${Math.max(0,e.hp/e.maxHp*100).toFixed(1)}%`,W/2+jx,y-7);cx.textAlign='left';}
}

function drawObstacle(o){const sec=SECTORS[G.sector-1];cx.save();cx.translate(o.x,o.y);cx.rotate(o.rot);const pack=IMG.generatedObstacles[sec.bg]||IMG.generatedObstacles.rift,img=pack[o.assetIndex??0]||IMG.obstacles[obstacleSpriteKey(o.type)];
  cx.globalAlpha=.97;cx.fillStyle='rgba(0,0,0,.26)';cx.beginPath();cx.ellipse(0,o.r*.68,o.r*.95,o.r*.26,0,0,TAU);cx.fill();
  if(imgReady(img)){const d=o.r*(o.type==='gate'?2.7:2.45);cx.drawImage(img,-d/2,-d/2,d,d);}else{cx.fillStyle=hexA(sec.base,.7);cx.beginPath();cx.arc(0,0,o.r,0,TAU);cx.fill();}
  if(o.type==='mine'){cx.globalAlpha=.35+.28*Math.sin(o.t*8);cx.strokeStyle='#ffe177';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,o.r*1.1,0,TAU);cx.stroke();cx.globalAlpha=1;}
  const hp=clamp(o.hp/o.maxHp,0,1);if(hp<.98){cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(-o.r*.75,o.r*1.08,o.r*1.5,4);cx.fillStyle=sec.accent;cx.fillRect(-o.r*.75,o.r*1.08,o.r*1.5*hp,4);}cx.restore();
}
function drawPickup(q){cx.save();cx.translate(q.x,q.y);const pulse=1+Math.sin(q.t*8)*.14;cx.scale(pulse,pulse);let key=q.type;if(q.type==='power')key=q.key;const img=powerAsset(key);
  if(imgReady(img)){const d=(q.type==='power'?48:40);cx.drawImage(img,-d/2,-d/2,d,d);}else{cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,q.r,0,TAU);cx.fill();}
  let col='#ffd76a',icon='¤';if(q.type==='heal'){col='#ff6d89';icon='✚';}if(q.type==='shield'){col='#78bfff';icon='⬡';}if(q.type==='power'){const pd=POWERS[q.key];col=pd?.color||'#fff';icon=pd?.icon||'✦';}
  cx.strokeStyle=col;cx.globalAlpha=.3+.18*Math.sin(q.t*7);cx.lineWidth=2;cx.beginPath();cx.arc(0,0,q.r+8,0,TAU);cx.stroke();cx.globalAlpha=1;
  if(q.type==='power'){cx.fillStyle=col;cx.font='900 11px system-ui';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(icon,0,0);}cx.restore();cx.textAlign='left';cx.textBaseline='alphabetic';}


function drawProjectile(b,enemy=false){cx.save();cx.strokeStyle=b.col||'#fff';cx.fillStyle=b.col||'#fff';cx.shadowColor=b.col||'#fff';cx.shadowBlur=enemy?4:8;if(!enemy&&b.trail){const sp=Math.hypot(b.vx,b.vy)||1;cx.globalAlpha=.42;cx.lineWidth=Math.max(1,b.r*.75);cx.beginPath();cx.moveTo(b.x-b.vx/sp*b.trail,b.y-b.vy/sp*b.trail);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=1;}if(b.type==='rail'){cx.lineWidth=3;cx.beginPath();cx.moveTo(b.x-b.vx*.03,b.y-b.vy*.03);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=.7;cx.beginPath();cx.arc(b.x,b.y,2.4,0,TAU);cx.fill();}else if(b.type==='missile'){cx.translate(b.x,b.y);cx.rotate(Math.atan2(b.vy,b.vx));cx.fillRect(-8,-3,13,6);cx.fillStyle='#fff';cx.fillRect(3,-1,5,2);}else{cx.beginPath();cx.arc(b.x,b.y,b.r,0,TAU);cx.fill();}cx.restore();}
function drawParticles(){for(const p of G.particles){const a=clamp(p.life/(p.max||.7),0,1);cx.save();cx.globalAlpha=a;if(p.kind==='dot'){cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*a,0,TAU);cx.fill();}else if(p.kind==='ring'){cx.strokeStyle=p.col;cx.lineWidth=3*a;cx.beginPath();cx.arc(p.x,p.y,p.r,0,TAU);cx.stroke();}else if(p.kind==='arc'){cx.strokeStyle=p.col;cx.lineWidth=2;cx.beginPath();cx.moveTo(p.x,p.y);const mx=(p.x+p.x2)/2+rnd(-15,15),my=(p.y+p.y2)/2+rnd(-15,15);cx.lineTo(mx,my);cx.lineTo(p.x2,p.y2);cx.stroke();}cx.restore();}}

function drawGame(){
  UI.buttons.length=0;drawBackground();cx.save();if(shake>0)cx.translate(rnd(-shake,shake),rnd(-shake*.65,shake*.65));
  for(const o of G.obstacles)drawObstacle(o);for(const f of G.frontThreats)drawFrontThreat(f);for(const q of G.pickups)drawPickup(q);for(const b of G.bullets)drawProjectile(b,false);for(const b of G.eBullets)drawProjectile(b,true);
  for(const e of G.enemies)drawInsect(e,false);if(G.boss&&!G.boss.dead)drawInsect(G.boss,true);drawShip();drawParticles();cx.restore();drawHUD();drawBanners();if(flash>0){cx.fillStyle=`rgba(255,80,100,${flash*.11})`;cx.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=G.player,sec=SECTORS[G.sector-1],m=12;cx.save();cx.textBaseline='middle';
  const leftW=Math.min(356,W*.33),rightW=Math.min(250,W*.23),heartPulse=1+(G.heartHitT||0)*.18+((p.hp/p.maxHp<=.1)?Math.sin(G.elapsed*12)*.08:0),actionPad=(shopBtn.style.display==='block'?40:0),rightY=m+actionPad;
  cx.fillStyle='rgba(2,7,17,.68)';cx.strokeStyle=hexA(sec.accent,.28);rr(m,m,leftW,88,14);cx.fill();cx.stroke();
  cx.fillStyle='#e8fbff';cx.font='800 12px system-ui';cx.fillText(`${sec.code} · SECTOR ${G.sector} · ORDA ${G.wave}/3`,m+12,m+15);cx.fillStyle=sec.accent;cx.font='700 9px system-ui';cx.fillText(`${sec.family} · ${sec.name}`,m+12,m+70);
  bar(m+96,m+26,130,8,p.hp/p.maxHp,'#ff647e');bar(m+96,m+42,130,7,p.shield/p.maxShield,'#74b9ff');bar(m+96,m+58,130,6,G.xp/G.xpNext,'#a6ff5f');cx.fillStyle='#fff';cx.font='700 9px system-ui';cx.fillText('HP',m+72,m+30);cx.fillText('SH',m+72,m+46);cx.fillText('XP',m+72,m+61);
  cx.save();cx.translate(m+34,m+43);cx.scale(heartPulse,heartPulse);cx.fillStyle=p.hp/p.maxHp<=.1?'#ff5b73':'#ff86a0';cx.font='900 21px system-ui';cx.fillText('❤',0,0);cx.restore();cx.fillStyle='#ffdbe2';cx.font='800 11px system-ui';cx.fillText(`${Math.max(0,p.hp/p.maxHp*100).toFixed(0)}%`,m+26,m+66);

  cx.textAlign='center';cx.fillStyle='rgba(2,7,17,.62)';rr(W*.35,10,W*.30,58,12);cx.fill();cx.strokeStyle=hexA(sec.accent,.18);cx.stroke();cx.fillStyle='#f6fdff';cx.font='900 16px ui-monospace,monospace';cx.fillText(G.score.toLocaleString(),W*.5,24);cx.fillStyle='#ffd76a';cx.font='700 10px system-ui';cx.fillText(`¤ ${G.credits.toLocaleString()} · XP ${G.xp}/${G.xpNext} · NIV ${G.level}`,W*.5,41);cx.fillStyle='#9fe6ff';cx.font='700 9px system-ui';cx.fillText(`BAJAS ${G.kills}/${G.goal}`,W*.5,55);

  const rx=W-rightW-12;cx.textAlign='left';cx.fillStyle='rgba(2,7,17,.62)';cx.strokeStyle=hexA(sec.accent,.24);rr(rx,rightY,rightW,84,14);cx.fill();cx.stroke();
  cx.fillStyle=sec.accent;cx.font='800 11px system-ui';cx.fillText('PERFIL DEL SECTOR',rx+12,rightY+14);cx.fillStyle='#eefaff';cx.font='700 9px system-ui';cx.fillText(sec.boss,rx+12,rightY+30);
  const labels=[['ARM',sec.stats.armor],['SPD',sec.stats.speed],['RNG',sec.stats.range],['THR',sec.stats.threat]];let bx=rx+12;for(const [lab,val] of labels){cx.fillStyle='#87a0b0';cx.font='700 8px system-ui';cx.fillText(lab,bx,rightY+49);bar(bx+22,rightY+45,26,6,val/5,sec.accent);bx+=53;}
  if(G.lastBossDrop){cx.fillStyle='#ffd76a';cx.font='700 8px system-ui';cx.fillText(`HERENCIA: ${POWERS[G.lastBossDrop]?.name||''}`,rx+12,rightY+64);}

  const active=Object.entries(G.powers).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,6);const gap=8,ww=86,tot=active.length*ww+Math.max(0,active.length-1)*gap;let x=W/2-tot/2;for(const [k,v] of active){const pd=POWERS[k];cx.fillStyle='rgba(2,7,17,.74)';cx.strokeStyle=hexA(pd.color,.55);rr(x,H-44,ww,30,9);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText(`${pd.icon} ${Math.ceil(v)}s`,x+ww/2,H-28);x+=ww+gap;}
  const q=(G.powerQueue||[]).slice(0,4);let qx=12;for(const k of q){const pd=POWERS[k];cx.fillStyle='rgba(2,7,17,.66)';cx.strokeStyle=hexA(pd.color,.4);rr(qx,H-82,74,24,8);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText(`⏳ ${pd.icon} ${pd.name.slice(0,7)}`,qx+37,H-69);qx+=80;}
  const combos=Object.keys(G.activeCombos||{});if(combos.length){const cd=COMBOS[combos[0]];cx.fillStyle='rgba(2,7,17,.72)';cx.strokeStyle=hexA(cd.color,.42);rr(W/2-110,H-78,220,24,9);cx.fill();cx.stroke();cx.fillStyle=cd.color;cx.font='800 10px system-ui';cx.textAlign='center';cx.fillText(cd.name,W/2,H-65);} 
  if(G.frenzyT>0){cx.fillStyle='rgba(72,31,0,.78)';cx.strokeStyle='#ffcb63';rr(W/2-105,78,210,26,10);cx.fill();cx.stroke();cx.fillStyle='#ffdc82';cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(`FRENESÍ ${Math.ceil(G.frenzyT)}s · x${G.frenzyMult.toFixed(1)}`,W/2,92);}
  if(G.mode==='training'){cx.fillStyle='rgba(5,42,64,.70)';cx.strokeStyle='#8edbff';rr(14,108,150,24,9);cx.fill();cx.stroke();cx.fillStyle='#bdefff';cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText('ENTRENAMIENTO',89,121);}
  if(G.postBossT>0){cx.fillStyle='rgba(10,48,25,.78)';cx.strokeStyle='#a6ff5f';rr(W/2-125,110,250,28,10);cx.fill();cx.stroke();cx.fillStyle='#caff9d';cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(`RECOGE PREMIOS · ${Math.ceil(G.postBossT)}s`,W/2,125);}
  if(G.bossWarningT>0&&G.boss){const skill=BOSS_SKILLS[G.boss.pattern];cx.fillStyle='rgba(40,4,6,.78)';cx.strokeStyle=skill?.color||'#ff6b78';rr(W/2-160,H*.16,320,38,12);cx.fill();cx.stroke();cx.fillStyle=skill?.color||'#ff8a93';cx.font='900 14px system-ui';cx.textAlign='center';cx.fillText(`⚠ ${G.bossWarningText}`,W/2,H*.16+20);}
  if(G.combo>=3){cx.textAlign='right';cx.fillStyle=G.combo>=10?'#ff8be2':'#ffd76a';cx.font=`900 ${Math.min(22,12+G.combo*.35)}px system-ui`;const mobileLow=W<920&&H<520;cx.fillText(`x${G.combo} ENJAMBRE`,mobileLow?W-112:W-18,mobileLow?H-116:H-25);} 
  cx.restore();
}
function bar(x,y,w,h,v,col){cx.fillStyle='rgba(255,255,255,.08)';rr(x,y,w,h,h/2);cx.fill();cx.fillStyle=col;rr(x+1,y+1,(w-2)*clamp(v,0,1),h-2,(h-2)/2);cx.fill();}
function drawBanners(){
  const sec=SECTORS[G.sector-1];if(G.sectorBanner>0){const a=clamp(Math.min(G.sectorBanner,3-G.sectorBanner)*1.4,0,1);cx.save();cx.globalAlpha=a;cx.textAlign='center';cx.fillStyle='#fff';cx.font=`900 ${Math.min(38,W*.05)}px system-ui`;cx.fillText(`SECTOR ${G.sector} · ${sec.name}`,W/2,H*.35);cx.fillStyle=sec.accent;cx.font=`800 ${Math.min(17,W*.022)}px system-ui`;cx.fillText(`LINAJE ${sec.family} // OBJETIVO: SOBREVIVIR, ESQUIVAR, DESTRUIR`,W/2,H*.41);cx.restore();}
  if(G.waveBanner>0&&G.sectorBanner<=0){cx.save();cx.globalAlpha=clamp(G.waveBanner,0,1);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 28px system-ui';cx.fillText(`ORDA ${G.wave}/3`,W/2,H*.32);cx.restore();}
  if(notices.length){const items=notices.slice(0,3);for(let i=0;i<items.length;i++){const n=items[i],a=clamp(n.t/Math.max(.4,n.max),0,1),w=Math.min(W*.32,420),y=H-120-i*28;cx.save();cx.globalAlpha=.25+.75*a;cx.fillStyle='rgba(0,0,0,.52)';rr(W/2-w/2,y,w,22,9);cx.fill();cx.strokeStyle=hexA(n.color,.24+.2*a);cx.stroke();cx.textAlign='center';cx.fillStyle=n.color;cx.font='800 10.5px system-ui';cx.fillText(n.text,W/2,y+12);cx.restore();}}
}

// ─────────────────────────────────────────────────────────────
// SCREENS / UI
// ─────────────────────────────────────────────────────────────
let menuSector=1;
function uiButton(id,label,x,y,w,h,col='#66f5ff',sub=''){
  const hover=false;cx.save();cx.fillStyle='rgba(4,10,24,.78)';cx.strokeStyle=hexA(col,.62);cx.lineWidth=1.5;rr(x,y,w,h,12);cx.fill();cx.stroke();
  cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=col;cx.font=`900 ${Math.min(15,h*.32)}px system-ui`;cx.fillText(label,x+w/2,y+h*(sub?.42:.5));if(sub){cx.fillStyle='#9db1c1';cx.font=`600 ${Math.min(10,h*.18)}px system-ui`;cx.fillText(sub,x+w/2,y+h*.72);}cx.restore();UI.buttons.push({id,x,y,w,h});
}
function drawTitle(y=70){cx.textAlign='center';cx.fillStyle='#e9ffff';cx.font=`950 ${Math.min(54,W*.07)}px system-ui`;cx.fillText('SWARM//RIFT',W/2,y);cx.fillStyle='#a6ff5f';cx.font=`800 ${Math.min(13,W*.018)}px system-ui`;cx.fillText('I N S E C T A   S I E G E',W/2,y+25);cx.textAlign='left';}
function drawHazardPill(text,x,y,col){
  const w=Math.max(72,cx.measureText(text).width+18);cx.fillStyle='rgba(6,12,24,.76)';cx.strokeStyle=hexA(col,.34);rr(x,y,w,20,10);cx.fill();cx.stroke();cx.fillStyle=col;cx.font='700 9px system-ui';cx.fillText(text,x+9,y+10);return w;
}
function drawMenu(){
  UI.buttons.length=0;drawBackground();drawTitle(Math.max(54,H*.12));const sec=SECTORS[menuSector-1];
  const panelW=Math.min(560,W*.52),x=36,y=Math.max(110,H*.22),rightX=W-panelW*.72-36;
  cx.fillStyle='rgba(3,8,18,.68)';cx.strokeStyle='rgba(99,246,255,.16)';rr(x,y,panelW,H-y-36,20);cx.fill();cx.stroke();
  cx.fillStyle='#dffaff';cx.font=`800 ${Math.min(18,W*.025)}px system-ui`;cx.fillText('AUTO-SHOOTER DE ESQUIVA Y DESTRUCCIÓN',x+22,y+32);cx.fillStyle='#93a9ba';cx.font='600 12px system-ui';cx.fillText('Mueve · esquiva · rompe barreras · captura poderes · elimina hordas.',x+22,y+55);
  const compact=H<560,bw=Math.min(265,panelW*.47),bh=compact?42:54,row1=y+(compact?62:82),row2=y+(compact?110:148),row3=y+(compact?158:212),labelY=y+(compact?214:290),sy=y+(compact?228:304);
  uiButton('menu_new','NUEVA CAMPAÑA',x+22,row1,bw,bh,'#a6ff5f','desde Sector 1');uiButton('menu_load','CARGAR PARTIDA',x+32+bw,row1,bw,bh,hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint disponible':'sin checkpoint');
  uiButton('menu_guide','CÓMO JUGAR',x+22,row2,bw,bh,'#ffd76a','controles, poderes y tienda');uiButton('menu_store','HANGAR / TIENDA',x+32+bw,row2,bw,bh,'#ffb7e8',`¤ ${META.credits.toLocaleString()}`);
  uiButton('menu_training','ENTRENAMIENTO',x+22,row3,bw,bh,'#8edbff','práctica sin castigo · mini jefe');uiButton('sector_boss','CHECKPOINT JEFE 50%',x+32+bw,row3,bw,bh,sectorDefeated(menuSector)?'#ffbd6a':'#526575',sectorDefeated(menuSector)?'arena desbloqueada':'derrota antes al jefe');
  cx.fillStyle='#dbe7ef';cx.font='800 12px system-ui';cx.fillText('REPETIR SECTOR DESBLOQUEADO',x+22,labelY);uiButton('sector_prev','‹',x+22,sy,46,44,'#7dc8ff');uiButton('sector_start',`SECTOR ${menuSector} · ${sec.family}`,x+78,sy,panelW-156,44,sec.accent,sec.name);uiButton('sector_next','›',x+panelW-68,sy,46,44,'#7dc8ff');

  const cardX=Math.max(x+panelW+28,W*.62),cardW=W-cardX-36,cardY=y,cardH=H-cardY-36;cx.fillStyle='rgba(3,8,18,.60)';cx.strokeStyle=hexA(sec.accent,.28);rr(cardX,cardY,cardW,cardH,20);cx.fill();cx.stroke();
  const topH=Math.min(190,cardH*.34),img=IMG.bg[sec.bg]||IMG.bg.rust;
  cx.save();rr(cardX+10,cardY+10,cardW-20,topH,16);cx.clip();
  if(imgReady(img)){const scale=Math.max((cardW-20)/img.naturalWidth,topH/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;cx.drawImage(img,cardX+10+(cardW-20-iw)/2,cardY+10+(topH-ih)/2,iw,ih);}else{cx.fillStyle=sec.dark;cx.fillRect(cardX+10,cardY+10,cardW-20,topH);}
  const g=cx.createLinearGradient(0,cardY+10,0,cardY+10+topH);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.74)');cx.fillStyle=g;cx.fillRect(cardX+10,cardY+10,cardW-20,topH);cx.restore();
  cx.textAlign='left';cx.fillStyle=sec.accent;cx.font='900 12px system-ui';cx.fillText(sec.code,cardX+22,cardY+topH-28);cx.fillStyle='#f2fbff';cx.font=`900 ${Math.min(18,cardW*.05)}px system-ui`;cx.fillText(sec.name,cardX+22,cardY+topH-10);
  cx.fillStyle='#dfefff';cx.font='800 12px system-ui';cx.fillText(`${sec.family} // JEFE ${sec.boss}`,cardX+22,cardY+topH+28);
  cx.fillStyle='#96abbc';cx.font='600 10.5px system-ui';cx.fillText(sec.blurb,cardX+22,cardY+topH+48);

  let pillX=cardX+22,pillY=cardY+topH+66;for(const hz of sec.hazards){pillX+=drawHazardPill(hz,pillX,pillY,sec.accent)+8; if(pillX>cardX+cardW-130){pillX=cardX+22;pillY+=26;}}

  const hadGame=!!G,oldSector=G?.sector,oldPlayer=G?.player;if(!G)G={sector:menuSector,player:{x:0,y:0}};else{G.sector=menuSector;G.player=G.player||{x:0,y:0};}
  const baseY=cardY+Math.min(cardH-116,pillY+78),space=Math.min(112,(cardW-52)/3),startX=cardX+cardW/2-space;const forms=[sec.forms[0],sec.forms[1],sec.forms[2]];
  const labels=['GRUNT','ELITE','BOSS'];
  for(let i=0;i<3;i++){const fake={x:startX+i*space,y:baseY,r:i===2?42:28,family:sec.family,form:forms[Math.min(i,2)],t:performance.now()/1000+i,flash:0};drawInsect(fake,i===2);cx.textAlign='center';cx.fillStyle=i===2?sec.accent:'#b2c6d4';cx.font='800 10px system-ui';cx.fillText(labels[i],fake.x,fake.y+58);} 
  if(hadGame){G.sector=oldSector;G.player=oldPlayer;} else G=null;

  const statsY=cardH-68+cardY;cx.textAlign='left';cx.fillStyle='#8ba3b6';cx.font='700 9px system-ui';cx.fillText('ARM',cardX+22,statsY);bar(cardX+48,statsY-4,54,6,sec.stats.armor/5,sec.accent);cx.fillText('SPD',cardX+112,statsY);bar(cardX+138,statsY-4,54,6,sec.stats.speed/5,sec.accent);cx.fillText('RNG',cardX+202,statsY);bar(cardX+228,statsY-4,54,6,sec.stats.range/5,sec.accent);cx.fillText('THR',cardX+292,statsY);bar(cardX+318,statsY-4,54,6,sec.stats.threat/5,sec.accent);
  cx.fillStyle='#6f8799';cx.font='600 10px system-ui';cx.textAlign='center';cx.fillText(`v${VERSION} · campaña reestructurada por sector · horizontal obligatorio · guardado local · PWA offline`,W/2,H-12);cx.textAlign='left';
}
function wrap(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;cx.textAlign='center';for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);cx.textAlign='left';return yy;}

function drawPause(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(0,0,W,H);drawTitle(H*.18);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 30px system-ui';cx.fillText('PAUSA TÁCTICA',W/2,H*.31);cx.fillStyle='#9db1c1';cx.font='600 12px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · ¤ ${G.credits.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.36);const w=Math.min(310,W*.34),h=48,x=W/2-w/2;uiButton('pause_resume','▶ CONTINUAR',x,H*.42,w,h,'#a6ff5f');uiButton('pause_save','▣ GUARDAR CHECKPOINT',x,H*.53,w,h,'#78caff');uiButton('pause_store','🛒 TIENDA',x,H*.64,w,h,'#ffb9ef','la compra mantiene el combate congelado');uiButton('pause_menu','MENÚ PRINCIPAL',x,H*.75,w,h,'#ff8b79');cx.textAlign='left';}

function upgradeCost(u){const lvl=up(u.id);return Math.round(u.base*Math.pow(1.42,lvl));}
function buyUpgrade(id){const u=UPGRADES.find(v=>v.id===id);if(!u)return;const lvl=up(id);if(lvl>=u.max){AudioX.deny();return;}const cost=upgradeCost(u);if(G.credits<cost){AudioX.deny();notify('CRÉDITOS INSUFICIENTES','#ff768c',1.5);return;}G.credits-=cost;META.credits=G.credits;META.upgrades[id]=lvl+1;
  if(G.player){if(id==='hull'){G.player.maxHp+=12;G.player.hp=Math.min(G.player.maxHp,G.player.hp+12);}if(id==='shield'){G.player.maxShield+=10;G.player.shield=Math.min(G.player.maxShield,G.player.shield+10);}}
  AudioX.buy();saveMeta();if(shopReturn==='GAME')saveRun();notify(`${u.name} · NIVEL ${lvl+1}`,'#a6ff5f',1.5);
}
function drawStore(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.82)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#ffb7e8';cx.font=`900 ${Math.min(29,W*.035)}px system-ui`;cx.fillText('HANGAR // MEJORAS PERMANENTES',W/2,36);cx.fillStyle='#ffd76a';cx.font='800 12px system-ui';cx.fillText(`CRÉDITOS ¤ ${G.credits.toLocaleString()} · LA TIENDA SIEMPRE PAUSA LA SIMULACIÓN`,W/2,58);
  const cols=3,rows=3,gap=10,margin=Math.max(16,W*.055),top=78,bottom=58,cw=(W-margin*2-gap*(cols-1))/cols,ch=(H-top-bottom-gap*(rows-1))/rows;
  UPGRADES.forEach((u,i)=>{const col=i%cols,row=(i/cols)|0,x=margin+col*(cw+gap),y=top+row*(ch+gap),lvl=up(u.id),maxed=lvl>=u.max,cost=maxed?0:upgradeCost(u),can=G.credits>=cost&&!maxed;cx.fillStyle=maxed?'rgba(18,58,44,.45)':'rgba(4,12,25,.72)';cx.strokeStyle=maxed?'rgba(166,255,95,.38)':can?'rgba(99,246,255,.34)':'rgba(255,100,125,.20)';rr(x,y,cw,ch,15);cx.fill();cx.stroke();cx.textAlign='left';cx.fillStyle=maxed?'#b8ff7d':'#e9fbff';cx.font=`900 ${Math.min(15,cw*.048)}px system-ui`;cx.fillText(`${u.icon} ${u.name}`,x+13,y+22);cx.fillStyle='#91a8ba';cx.font=`600 ${Math.min(10,cw*.033)}px system-ui`;cx.fillText(u.desc,x+13,y+42);cx.fillStyle='#6fe7ff';cx.font='800 10px system-ui';cx.fillText(`NIVEL ${lvl}/${u.max}`,x+13,y+ch-15);cx.textAlign='right';cx.fillStyle=maxed?'#a6ff5f':can?'#ffd76a':'#ff758b';cx.font='900 11px system-ui';cx.fillText(maxed?'MÁXIMO':`COMPRAR ¤ ${cost}`,x+cw-13,y+ch-15);UI.buttons.push({id:'buy_'+u.id,x,y,w:cw,h:ch});});
  uiButton('store_close','← VOLVER',18,H-47,150,34,'#8edbff');cx.textAlign='left';
}
function drawVictory(){
  UI.buttons.length=0;drawBackground();const sec=SECTORS[G.sector-1],training=G.mode==='training';cx.fillStyle='rgba(0,0,0,.54)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle=training?'#8edbff':sec.accent;cx.font=`900 ${Math.min(40,W*.052)}px system-ui`;cx.fillText(training?'ENTRENAMIENTO COMPLETADO':'SECTOR SUPERADO',W/2,H*.21);cx.fillStyle='#fff';cx.font='900 22px system-ui';cx.fillText(training?'CONTROL, ESQUIVA Y COMBATE VERIFICADOS':sec.boss,W/2,H*.29);cx.fillStyle='#b2c4d1';cx.font='700 12px system-ui';cx.fillText(training?`OBJETIVOS ${G.kills} · AMENAZAS FRONTALES ${G.frontKills||0}`:`PUNTOS ${G.score.toLocaleString()} · CRÉDITOS ¤ ${G.credits.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()}`,W/2,H*.35);if(!training&&G.lastBossDrop){cx.fillStyle='#ffd76a';cx.font='800 11px system-ui';cx.fillText(`HERENCIA DESBLOQUEADA · ${HERITAGE_NAMES[G.sector]||POWERS[G.lastBossDrop]?.name||''}`,W/2,H*.39);}const w=Math.min(310,W*.34),h=50,x=W/2-w/2;
  if(training){uiButton('victory_new','▶ INICIAR CAMPAÑA',x,H*.48,w,h,'#a6ff5f');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.62,w,h,'#8edbff');}
  else{if(G.sector<SECTORS.length)uiButton('victory_next',`▶ ENTRAR AL SECTOR ${G.sector+1}`,x,H*.48,w,h,'#a6ff5f',SECTORS[G.sector].name);else uiButton('victory_new','↻ NUEVA CAMPAÑA',x,H*.48,w,h,'#a6ff5f','has vencido los seis linajes');uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.61,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.74,w,h,'#8edbff');}cx.textAlign='left';
}
function drawDead(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.63)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#ff667d';cx.font=`900 ${Math.min(43,W*.055)}px system-ui`;cx.fillText('NAVE PERDIDA',W/2,H*.23);cx.fillStyle='#fff';cx.font='800 15px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.31);const w=Math.min(300,W*.34),x=W/2-w/2,h=48;uiButton('dead_retry','↻ REINTENTAR SECTOR',x,H*.42,w,h,'#a6ff5f');if(hasSave())uiButton('dead_load','▣ CARGAR CHECKPOINT',x,H*.54,w,h,'#7dc8ff');uiButton('dead_menu','MENÚ PRINCIPAL',x,H*.68,w,h,'#ffb7e8');cx.textAlign='left';}
function drawGuide(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.83)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#a6ff5f';cx.font=`900 ${Math.min(30,W*.04)}px system-ui`;cx.fillText('MANUAL DE SUPERVIVENCIA',W/2,42);const items=[
    ['1 · MOVER','En celular, toca y arrastra en la mitad izquierda. En PC la nave sigue el movimiento del mouse o touchpad sin clic; también puedes usar WASD/flechas.'],
    ['2 · DISPARAR','No existe botón de fuego. La nave dispara sola mientras tú esquivas, atraviesas corredores y rompes el enjambre.'],
    ['3 · DASH','Botón ⚡ a la derecha. Da invulnerabilidad breve y atraviesa zonas peligrosas; tiene enfriamiento.'],
    ['4 · PODERES','Puedes mantener hasta dos poderes activos a la vez. Los siguientes pasan a la cola. Algunas parejas generan combos especiales. La bomba de Rift es instantánea.'],
    ['5 · FRENTE','Meteoros y naves pueden venir directamente hacia cámara: crecen en tamaño al aproximarse. Si los destruyes antes de que crucen, dan XP y premios extra.'],
    ['6 · REPLAY','Entrenamiento permite practicar sin castigo. Los sectores superados pueden repetirse completos o desde la arena del jefe con 50% de vida. El carrito pausa siempre. Las compras son permanentes y se conservan entre partidas. Pausa también permite guardar. Los jefes conceden herencias temporales al inicio del siguiente sector. Desde el Sector 3 aparecen naves recuperadoras hostiles: scouts de embestida, fragatas de fuego cruzado y bombarderos que siembran minas.']
  ];const left=Math.max(35,W*.11),cw=(W-left*2-18)/2,ch=Math.min(104,(H-120)/3-8);items.forEach((it,i)=>{const col=i%2,row=(i/2)|0,x=left+col*(cw+18),y=72+row*(ch+9);cx.fillStyle='rgba(4,12,25,.68)';cx.strokeStyle='rgba(99,246,255,.18)';rr(x,y,cw,ch,14);cx.fill();cx.stroke();cx.textAlign='left';cx.fillStyle='#7ef4ff';cx.font='900 12px system-ui';cx.fillText(it[0],x+14,y+23);cx.fillStyle='#c8d7e2';cx.font='600 10.5px system-ui';drawTextLines(it[1],x+14,y+43,cw-28,15);});uiButton('guide_back','← VOLVER',20,H-44,140,32,'#8edbff');cx.textAlign='left';
}
function drawTextLines(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);}

function handleTap(x,y){
  if(!G)return;const hit=[...UI.buttons].reverse().find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(!hit)return;AudioX.unlock();const id=hit.id;
  if(id==='menu_new'){newRun(1);return;}if(id==='menu_training'){startTraining();return;}if(id==='menu_load'){if(!loadRun())notify('NO HAY CHECKPOINT','#ff7188',1.6);return;}if(id==='menu_guide'){setScreen('GUIDE');return;}if(id==='menu_store'){G.credits=META.credits;openStore('MENU');return;}
  if(id==='sector_prev'){menuSector=Math.max(1,menuSector-1);return;}if(id==='sector_next'){menuSector=Math.min(META.unlocked,menuSector+1);return;}if(id==='sector_start'){newRun(menuSector);return;}if(id==='sector_boss'){startBossCheckpoint(menuSector);return;}
  if(id==='pause_resume'){resumeGame();return;}if(id==='pause_save'){saveRun();return;}if(id==='pause_store'){openStore('PAUSE');return;}if(id==='pause_menu'){AudioX.stopBoss();META.credits=G.credits;saveMeta();setScreen('MENU');return;}
  if(id.startsWith('buy_')){buyUpgrade(id.slice(4));return;}if(id==='store_close'){closeStore();return;}
  if(id==='victory_next'){const next=G.sector+1;enterSector(next,true);setScreen('GAME');saveRun();return;}if(id==='victory_new'){newRun(1);return;}if(id==='victory_store'){shopReturn='VICTORY';setScreen('STORE');return;}if(id==='victory_menu'){setScreen('MENU');return;}
  if(id==='dead_retry'){if(G.mode==='training')startTraining();else if(G.bossCheckpoint)startBossCheckpoint(G.sector);else newRun(G.sector);return;}if(id==='dead_load'){loadRun();return;}if(id==='dead_menu'){setScreen('MENU');return;}if(id==='guide_back'){setScreen('MENU');return;}
}

// ─────────────────────────────────────────────────────────────
// MAIN RENDER LOOP
// ─────────────────────────────────────────────────────────────
function render(){
  if(!G)return;switch(G.screen){case'GAME':drawGame();break;case'PAUSE':drawPause();break;case'STORE':drawStore();break;case'VICTORY':drawVictory();break;case'DEAD':drawDead();break;case'GUIDE':drawGuide();break;default:drawMenu();}
}
function loop(now){const dt=Math.min(.033,Math.max(.001,(now-lastT)/1000));lastT=now;update(dt);render();requestAnimationFrame(loop);}

// Initialize menu state after data and helpers exist.
G={screen:'MENU',mode:'campaign',sector:1,wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],boss:null,powers:{},powerQueue:[],elapsed:0,kills:0,goal:1,combo:0,comboT:0,waveBanner:0,sectorBanner:0,xp:0,level:1,xpNext:120,maxActivePowers:POWER_SLOT_LIMIT,maxQueuePowers:POWER_QUEUE_LIMIT,heritageNext:null,activeCombos:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,bossWarningT:0,bossWarningText:'',bossCheckpoint:false,trainingBoss:false,postBossT:0,postBossMax:0,frontTimer:7,frontKills:0};
menuSector=clamp(META.unlocked||1,1,SECTORS.length);setScreen('MENU');
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
requestAnimationFrame(loop);

})();

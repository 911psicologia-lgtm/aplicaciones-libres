(()=>{
'use strict';

const VERSION='1.0.0';
const KEY_META='swarm_rift_meta_v1';
const KEY_RUN='swarm_rift_run_v1';
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
  shot(){const n=performance.now();if(n-this.lastShot<48)return;this.lastShot=n;this.tone(760,.045,.025,'square',0,-240);},
  hit(){this.noise(.045,.025,900);},
  pickup(){[560,760,980].forEach((f,i)=>this.tone(f,.09,.045,'sine',i*.045,80));},
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
  toggle(){this.muted=!this.muted;if(this.muted)this.stopBoss();audioBtn.textContent=this.muted?'🔇':'🔊';saveMeta();}
};

// ─────────────────────────────────────────────────────────────
// DATA — 10 linajes; cada sector y jefe comparten identidad
// ─────────────────────────────────────────────────────────────
const SECTORS=[
 {name:'Dunas de Formicaria',family:'HORMIGAS',boss:'REGINA FERRUM',pattern:'queen',base:'#d9933b',accent:'#ffe16b',dark:'#27140c',motif:'dunes',forms:['worker','soldier','acid']},
 {name:'Mar de Polen',family:'POLILLAS',boss:'VELA NOCTIS',pattern:'moth',base:'#9b75d9',accent:'#e7d8ff',dark:'#171025',motif:'pollen',forms:['flutter','dust','seer']},
 {name:'Bosque Navaja',family:'MANTIS',boss:'CORTEX VERDE',pattern:'blade',base:'#49a65e',accent:'#aaff72',dark:'#0a1f16',motif:'forest',forms:['stalker','blade','jumper']},
 {name:'Cripta de Quitina',family:'ESCARABAJOS',boss:'ATLAS NEGRO',pattern:'titan',base:'#477a92',accent:'#86e6ff',dark:'#07171e',motif:'cavern',forms:['scarab','tank','ram']},
 {name:'Delta Hemático',family:'MOSQUITOS',boss:'HEMO REY',pattern:'needle',base:'#ad4560',accent:'#ff8b9d',dark:'#240810',motif:'delta',forms:['dart','drain','needle']},
 {name:'Ciudad Termitaria',family:'TERMITAS',boss:'ARQUITECTO CERO',pattern:'fortress',base:'#b48655',accent:'#ffe0a8',dark:'#24190b',motif:'city',forms:['builder','biter','bomber']},
 {name:'Tormenta de Avispas',family:'AVISPAS',boss:'IMPERATRIX VESPA',pattern:'storm',base:'#d6a21b',accent:'#fff07b',dark:'#211801',motif:'storm',forms:['hornet','lancer','shocker']},
 {name:'Jardín Lux',family:'LUCIÉRNAGAS',boss:'LUX MATRIARCA',pattern:'prism',base:'#3abf9a',accent:'#baffc9',dark:'#061d1a',motif:'garden',forms:['glow','orbiter','flare']},
 {name:'Cañón Saltador',family:'SALTAMONTES',boss:'COLOSSUS HOP',pattern:'leap',base:'#7ca73f',accent:'#d9ff7b',dark:'#15200a',motif:'canyon',forms:['hopper','crusher','slinger']},
 {name:'Catedral Resonante',family:'CIGARRAS',boss:'RESONADOR OMEGA',pattern:'resonance',base:'#4d87b8',accent:'#a7e7ff',dark:'#081724',motif:'cathedral',forms:['singer','sonic','choir']}
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
 singer:{hp:1.0,spd:1.0,size:1.0,score:190,move:'wave',fire:1.0},sonic:{hp:1.1,spd:.88,size:1.05,score:245,move:'hover',fire:.72},choir:{hp:.82,spd:1.2,size:.88,score:270,move:'orbit',fire:.62}
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
 gravity:{name:'PULSO G',icon:'◎',color:'#b58cff',duration:20,desc:'ondas gravitacionales periódicas'}
};
const POWER_KEYS=Object.keys(POWERS);

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

const defaultMeta=()=>({credits:0,hiScore:0,unlocked:1,upgrades:{},muted:false,runs:0,bosses:0});
let META=loadJSON(KEY_META,defaultMeta());
AudioX.muted=!!META.muted;audioBtn.textContent=AudioX.muted?'🔇':'🔊';

function loadJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch(_){return fallback;}}
function saveMeta(){META.credits=G?.credits??META.credits;META.hiScore=Math.max(META.hiScore,G?.hiScore||0);META.muted=AudioX.muted;try{localStorage.setItem(KEY_META,JSON.stringify(META));}catch(_){}}
function up(id){return META.upgrades[id]||0;}

let G=null;
let shopReturn='MENU';
let notice={text:'',color:'#fff',t:0};
let shake=0,flash=0;
const UI={buttons:[]};

function makePlayer(){
  const hp=100+up('hull')*12,sh=45+up('shield')*10;
  return {x:W*.2,y:H*.5,vx:0,vy:0,r:17,hp,maxHp:hp,shield:sh,maxShield:sh,inv:0,fire:0,dashCd:0,dashT:0,dashVX:0,dashVY:0};
}
function newRun(startSector=1){
  META.runs=(META.runs||0)+1;
  G={screen:'GAME',sector:clamp(startSector,1,META.unlocked),wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],boss:null,
    kills:0,goal:waveGoal(startSector,1),spawn:0,obstacleTimer:2.4,powerMeter:0,powers:{},sectorClear:false,bossPending:false,
    waveBanner:2.2,sectorBanner:3.2,combo:0,comboT:0,lastPowerDrop:0,elapsed:0};
  enterSector(startSector,true); setScreen('GAME'); tryFullscreen();AudioX.unlock();notify('AUTO-DISPARO ACTIVO · ESQUIVA Y ROMPE EL ENJAMBRE','#9dffbf',2.8);saveMeta();
}
function enterSector(n,keepPlayer=false){
  G.sector=clamp(n,1,SECTORS.length);G.wave=1;G.kills=0;G.goal=waveGoal(G.sector,1);G.spawn=.7;G.obstacleTimer=2.5;G.boss=null;G.bossPending=false;G.sectorClear=false;
  G.enemies.length=0;G.bullets.length=0;G.eBullets.length=0;G.pickups.length=0;G.obstacles.length=0;G.particles.length=0;
  if(!keepPlayer)G.player=makePlayer();else{G.player.x=W*.2;G.player.y=H*.5;G.player.hp=G.player.maxHp;G.player.shield=G.player.maxShield;}
  G.sectorBanner=3;G.waveBanner=2;
}
function waveGoal(sector,wave){return Math.round(10+sector*2.2+wave*4.2);}
function difficulty(){const s=G.sector,w=G.wave;return 1+(s-1)*.16+(w-1)*.12+Math.min(1.15,G.elapsed/180*.25);}

function setScreen(s){
  if(!G){G={screen:s,credits:META.credits,hiScore:META.hiScore};}else G.screen=s;
  const gameplay=s==='GAME';
  touchHud.style.display=gameplay && matchMedia('(pointer:coarse)').matches?'block':'none';
  shopBtn.style.display=gameplay?'block':'none';pauseBtn.style.display=gameplay?'block':'none';
  if(!gameplay){resetStick();}
}
function notify(text,color='#fff',seconds=2){notice={text,color,t:seconds};}

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
    input.mouseSteer=true;input.mouseX=e.clientX;input.mouseY=e.clientY;try{cv.setPointerCapture?.(e.pointerId);}catch(_){}return;
  }
  handleTap(e.clientX,e.clientY);
});
cv.addEventListener('pointermove',e=>{if(input.mouseSteer&&e.pointerType==='mouse'){input.mouseX=e.clientX;input.mouseY=e.clientY;}});
cv.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&input.mouseSteer){input.mouseSteer=false;handleTap(e.clientX,e.clientY);}});

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
  const p=G.player;const payload={version:VERSION,sector:G.sector,wave:G.wave,score:G.score,credits:G.credits,hp:p.hp,shield:p.shield,powers:G.powers,ts:Date.now()};
  try{localStorage.setItem(KEY_RUN,JSON.stringify(payload));}catch(_){return false;}saveMeta();notify('CHECKPOINT GUARDADO','#79c9ff',1.8);return true;
}
function hasSave(){try{return !!localStorage.getItem(KEY_RUN);}catch(_){return false;}}
function loadRun(){
  const s=loadJSON(KEY_RUN,null);if(!s||!s.sector)return false;
  G={screen:'GAME',sector:clamp(s.sector,1,SECTORS.length),wave:clamp(s.wave||1,1,3),score:s.score||0,hiScore:META.hiScore||0,credits:Math.max(META.credits||0,s.credits||0),
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],boss:null,kills:0,goal:waveGoal(s.sector,s.wave||1),spawn:.5,obstacleTimer:2,
    powerMeter:0,powers:s.powers||{},sectorClear:false,bossPending:false,waveBanner:2.4,sectorBanner:2.8,combo:0,comboT:0,lastPowerDrop:0,elapsed:0};
  G.player.hp=clamp(s.hp||G.player.maxHp*.75,1,G.player.maxHp);G.player.shield=clamp(s.shield||0,0,G.player.maxShield);
  setScreen('GAME');tryFullscreen();AudioX.unlock();notify('CHECKPOINT CARGADO · OLEADA REINICIADA','#8edbff',2.5);return true;
}

// ─────────────────────────────────────────────────────────────
// SPAWN / COMBAT ENTITIES
// ─────────────────────────────────────────────────────────────
function spawnEnemy(forceForm=null,x=null,y=null){
  const sec=SECTORS[G.sector-1],form=forceForm||pick(sec.forms.slice(0,Math.min(3,1+G.wave))),fs=FORM_STATS[form]||FORM_STATS.worker,d=difficulty();
  const side=Math.random();let ex=x,ey=y;
  if(ex==null){ex=side<.78?W+rnd(35,140):rnd(W*.48,W*.96);ey=side<.78?rnd(70,H-55):(side<.89?-35:H+35);}
  const baseHp=34+G.sector*13+G.wave*8;
  const e={x:ex,y:ey,ox:ey,r:15*fs.size+G.sector*.45,hp:baseHp*fs.hp*d,maxHp:baseHp*fs.hp*d,spd:(78+G.sector*4)*fs.spd*(1+(d-1)*.13),score:fs.score+G.sector*18,
    form,family:sec.family,move:fs.move,fireCd:fs.fire?rnd(.45,fs.fire):999,fireRate:fs.fire||999,t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,slow:0,flash:0,contact:14+G.sector*2.2};
  G.enemies.push(e);return e;
}
function spawnBoss(){
  if(G.boss)return;const sec=SECTORS[G.sector-1],d=difficulty();
  const maxHp=(700+G.sector*360)*d;
  G.boss={x:W+110,y:H*.5,r:55+G.sector*2.2,hp:maxHp,maxHp,pattern:sec.pattern,name:sec.boss,family:sec.family,t:0,fire:.7,phase:1,dead:false,entry:2.0,vx:-90};
  G.enemies.length=0;G.eBullets.length=0;G.bossPending=false;AudioX.bossIntro(G.sector-1);notify(`JEFE · ${sec.boss}`,'#ffcf73',3);shake=8;
}
function spawnObstacle(){
  const sec=SECTORS[G.sector-1];const types=G.sector<3?['cocoon','chitin']:G.sector<6?['cocoon','chitin','spore']:['chitin','spore','resin'];const type=pick(types);
  const y=rnd(70,H-70),size=type==='chitin'?rnd(45,76):type==='cocoon'?rnd(28,42):rnd(22,34);
  const hp=(type==='chitin'?180:type==='cocoon'?100:70)*(1+G.sector*.11);
  G.obstacles.push({x:W+size+20,y,r:size,type,hp,maxHp:hp,vx:-(70+G.sector*3),rot:rnd(0,TAU),t:0,col:sec.base});
}
function spawnPickup(x,y,type='credit',key=null){
  G.pickups.push({x,y,vx:rnd(-20,35),vy:rnd(-55,55),r:type==='power'?15:10,type,key,t:0,life:16});
}
function maybeDrop(e){
  const r=Math.random();if(r<.17)spawnPickup(e.x,e.y,'credit');else if(r<.195)spawnPickup(e.x,e.y,'heal');else if(r<.218)spawnPickup(e.x,e.y,'shield');
  G.powerMeter+=1;if(G.powerMeter>=Math.max(7,12-G.wave)){G.powerMeter=0;spawnPickup(e.x,e.y,'power',pick(POWER_KEYS));}
}
function activatePower(key){
  const p=POWERS[key];if(!p)return;const current=G.powers[key]||0;G.powers[key]=Math.min(p.duration*2.2,current+p.duration);if(key==='shield')G.player.shield=Math.min(G.player.maxShield,G.player.shield+35);
  AudioX.pickup();notify(`${p.icon} ${p.name} · ${Math.ceil(G.powers[key])}s`,p.color,2.1);burst(G.player.x,G.player.y,p.color,20,140);
}
function powerOn(key){return (G.powers[key]||0)>0;}

function firePlayer(){
  const p=G.player,target=findTarget();if(!target)return;const dx=target.x-p.x,dy=target.y-p.y,ang=Math.atan2(dy,dx),baseDmg=24*(1+up('damage')*.10);
  const speed=720;
  const shots=powerOn('twin')?[-.13,0,.13]:[0];
  for(const off of shots){const a=ang+off;G.bullets.push({x:p.x+Math.cos(a)*22,y:p.y+Math.sin(a)*22,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:4,dmg:baseDmg*(shots.length>1?.78:1),life:1.6,col:'#78f4ff',type:'needle',pierce:0,slow:powerOn('cryo')?.34:0,splash:powerOn('acid')?36:0});}
  AudioX.shot();
}
function findTarget(){
  let best=null,bd=1e9;const p=G.player;
  if(G.boss&&!G.boss.dead){best=G.boss;bd=dist(p,G.boss);}
  for(const e of G.enemies){const d=dist(p,e);if(d<bd){bd=d;best=e;}}
  for(const o of G.obstacles){const d=dist(p,o);if(d<bd*.82){bd=d;best=o;}}
  return best;
}
function fireMissile(){
  const t=findTarget();if(!t)return;const p=G.player;G.bullets.push({x:p.x+14,y:p.y,vx:350,vy:rnd(-40,40),r:7,dmg:62*(1+up('damage')*.08),life:3,col:'#ff8a53',type:'missile',homing:true,target:t,pierce:0,splash:55});
}
function fireRail(){
  const t=findTarget();if(!t)return;const p=G.player,a=Math.atan2(t.y-p.y,t.x-p.x);G.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*1100,vy:Math.sin(a)*1100,r:5,dmg:110*(1+up('damage')*.1),life:1.05,col:'#73ffd1',type:'rail',pierce:4,splash:0});shake=Math.max(shake,2.5);
}
function teslaPulse(){
  const candidates=[...(G.boss?[G.boss]:[]),...G.enemies].filter(Boolean).sort((a,b)=>dist(G.player,a)-dist(G.player,b)).slice(0,4);if(!candidates.length)return;
  let prev=G.player;for(const e of candidates){const dmg=32*(1+up('damage')*.08);damageEntity(e,dmg,'tesla');G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:e.x,y2:e.y,life:.12,max:.12,col:'#8edbff'});prev=e;}
}
function gravityPulse(){
  const p=G.player;G.particles.push({kind:'ring',x:p.x,y:p.y,r:10,vr:520,life:.45,max:.45,col:'#b58cff'});
  for(const e of G.enemies){if(dist(p,e)<220){e.x=lerp(e.x,p.x,.16);e.y=lerp(e.y,p.y,.16);damageEntity(e,24*(1+up('damage')*.08),'gravity');}}
  if(G.boss&&dist(p,G.boss)<260)damageEntity(G.boss,35*(1+up('damage')*.08),'gravity');
}

function enemyShoot(e,style='aim'){const p=G.player,a=Math.atan2(p.y-e.y,p.x-e.x);if(style==='spread'){for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.19,235+G.sector*4,8);}else spawnEnemyBullet(e.x,e.y,a,260+G.sector*5,9);}
function spawnEnemyBullet(x,y,a,speed=260,dmg=10,r=5,col='#ff6b78'){G.eBullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,dmg,life:5,col});}
function ringBullets(x,y,count,speed,dmg,col='#ff768e',offset=0){for(let i=0;i<count;i++){const a=offset+i/count*TAU;spawnEnemyBullet(x,y,a,speed,dmg,5,col);}}

function damageEntity(e,dmg,kind='normal'){
  if(!e||e.dead)return; e.hp-=dmg;e.flash=.08;AudioX.hit();
  if(e!==G.boss&&kind==='cryo')e.slow=Math.max(e.slow,1.4);
  if(e.hp<=0){if(e===G.boss)killBoss();else killEnemy(e);}
}
function killEnemy(e){if(e.dead)return;e.dead=true;G.score+=Math.round(e.score*(1+Math.min(1.5,G.combo*.03)));G.kills++;G.combo++;G.comboT=2.2;maybeDrop(e);burst(e.x,e.y,SECTORS[G.sector-1].accent,10,130);}
function killBoss(){const b=G.boss;if(!b||b.dead)return;b.dead=true;AudioX.bossDie();burst(b.x,b.y,SECTORS[G.sector-1].accent,65,280);shake=14;flash=1;G.score+=5000+G.sector*2400;const reward=250+G.sector*85;G.credits+=reward;META.credits=G.credits;META.bosses=(META.bosses||0)+1;META.unlocked=Math.max(META.unlocked,Math.min(10,G.sector+1));META.hiScore=Math.max(META.hiScore,G.score);G.hiScore=META.hiScore;saveMeta();try{localStorage.removeItem(KEY_RUN);}catch(_){}G.sectorClear=true;setTimeout(()=>{if(G?.sectorClear)setScreen('VICTORY');},900);}

function hitPlayer(dmg){const p=G.player;if(p.inv>0||p.dashT>0)return;if(p.shield>0){const take=Math.min(p.shield,dmg);p.shield-=take;dmg-=take;}if(dmg>0)p.hp-=dmg;p.inv=.55;AudioX.hurt();shake=Math.max(shake,7);flash=Math.max(flash,.45);burst(p.x,p.y,'#ff5b73',14,160);if(p.hp<=0)gameOver();}
function gameOver(){AudioX.stopBoss();G.hiScore=Math.max(G.hiScore,G.score);META.hiScore=Math.max(META.hiScore,G.hiScore);META.credits=G.credits;saveMeta();setScreen('DEAD');}
function burst(x,y,col,count=10,speed=100){for(let i=0;i<count;i++){const a=rnd(0,TAU),s=rnd(speed*.3,speed);G.particles.push({kind:'dot',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rnd(1.5,4.5),life:rnd(.25,.7),max:.7,col});}}

// ─────────────────────────────────────────────────────────────
// UPDATE LOOP
// ─────────────────────────────────────────────────────────────
let timers={missile:0,rail:0,tesla:0,gravity:0,drone:0};
function update(dt){
  if(!G||G.screen!=='GAME'||W<H)return;
  G.elapsed+=dt;if(notice.t>0)notice.t-=dt;if(G.waveBanner>0)G.waveBanner-=dt;if(G.sectorBanner>0)G.sectorBanner-=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}
  updatePowers(dt);updatePlayer(dt);updateSpawns(dt);updateEnemies(dt);updateBoss(dt);updateObstacles(dt);updateBullets(dt);updateEnemyBullets(dt);updatePickups(dt);updateParticles(dt);
  if(shake>0)shake=Math.max(0,shake-dt*18);if(flash>0)flash=Math.max(0,flash-dt*1.8);
  if(G.kills>=G.goal&&!G.boss&&G.enemies.filter(e=>!e.dead).length===0){
    if(G.wave<3){G.wave++;G.kills=0;G.goal=waveGoal(G.sector,G.wave);G.spawn=1.4;G.waveBanner=2.5;G.player.shield=Math.min(G.player.maxShield,G.player.shield+15);saveRun();notify(`ORDA ${G.wave}/3 · MÁS DENSIDAD`,'#ffd76a',2.2);}
    else if(!G.bossPending){G.bossPending=true;setTimeout(()=>{if(G?.screen==='GAME'&&G.bossPending&&!G.boss)spawnBoss();},900);}
  }
}
function updatePowers(dt){
  for(const k of Object.keys(G.powers)){G.powers[k]-=dt;if(G.powers[k]<=0)delete G.powers[k];}
  timers.missile-=dt;timers.rail-=dt;timers.tesla-=dt;timers.gravity-=dt;timers.drone-=dt;
  if(powerOn('missile')&&timers.missile<=0){timers.missile=.72;fireMissile();}
  if(powerOn('rail')&&timers.rail<=0){timers.rail=1.45;fireRail();}
  if(powerOn('tesla')&&timers.tesla<=0){timers.tesla=.88;teslaPulse();}
  if(powerOn('gravity')&&timers.gravity<=0){timers.gravity=1.75;gravityPulse();}
  if(powerOn('shield')&&G.player.shield<G.player.maxShield)G.player.shield=Math.min(G.player.maxShield,G.player.shield+dt*3.5);
}
function updatePlayer(dt){
  const p=G.player,a=axes();p.inv=Math.max(0,p.inv-dt);p.dashCd=Math.max(0,p.dashCd-dt);dashBtn.classList.toggle('cooldown',p.dashCd>0);
  if(p.dashT>0){p.dashT-=dt;p.x+=p.dashVX*dt;p.y+=p.dashVY*dt;}else{
    const speed=285*(1+up('engine')*.05)*(powerOn('overdrive')?1.26:1);p.vx=lerp(p.vx,a.x*speed,1-Math.pow(.001,dt));p.vy=lerp(p.vy,a.y*speed,1-Math.pow(.001,dt));p.x+=p.vx*dt;p.y+=p.vy*dt;
  }
  p.x=clamp(p.x,28,W-28);p.y=clamp(p.y,44,H-30);
  const rate=Math.max(.075,.19*(1-up('rate')*.055)*(powerOn('overdrive')?.72:1));p.fire-=dt;if(p.fire<=0){p.fire=rate;firePlayer();}
  // Permanent and temporary drones
  const count=Math.floor(up('drone')/2)+(powerOn('drone')?2:0);
  if(count>0&&timers.drone<=0){timers.drone=.48;for(let i=0;i<count;i++){const t=findTarget();if(!t)break;const a2=Math.atan2(t.y-p.y,t.x-p.x),orb=(i/count)*TAU+G.elapsed*2.1;G.bullets.push({x:p.x+Math.cos(orb)*34,y:p.y+Math.sin(orb)*34,vx:Math.cos(a2)*620,vy:Math.sin(a2)*620,r:3,dmg:17*(1+up('damage')*.08),life:1.7,col:'#e9fbff',type:'drone',pierce:0,splash:0});}}
}
function updateSpawns(dt){
  if(G.boss||G.bossPending)return;G.spawn-=dt;G.obstacleTimer-=dt;
  const alive=G.enemies.filter(e=>!e.dead).length,maxAlive=Math.round(6+G.sector*.65+G.wave*1.7);
  if(G.spawn<=0&&G.kills<G.goal&&alive<maxAlive){
    const burstCount=G.wave===3&&Math.random()<.18?2:1;for(let i=0;i<burstCount;i++)spawnEnemy();
    G.spawn=Math.max(.22,1.05-difficulty()*.12-G.wave*.08)*rnd(.75,1.16);
  }
  if(G.obstacleTimer<=0&&G.obstacles.length<4){spawnObstacle();G.obstacleTimer=rnd(2.7,4.7)/Math.min(1.5,difficulty());}
}
function updateEnemies(dt){
  const p=G.player;
  for(const e of G.enemies){
    if(e.dead)continue;e.t+=dt;e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);const sm=e.slow>0?.54:1;let vx=-e.spd,vy=0;
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
  const b=G.boss;if(!b||b.dead)return;b.t+=dt;b.fire-=dt;b.flash=Math.max(0,(b.flash||0)-dt);
  const ratio=b.hp/b.maxHp,newPhase=ratio>.66?1:ratio>.32?2:3;if(newPhase!==b.phase){b.phase=newPhase;notify(`FASE ${newPhase} · ${b.name}`,'#ffbd6a',2);shake=7;ringBullets(b.x,b.y,8+newPhase*2,180+newPhase*25,8+newPhase*2,SECTORS[G.sector-1].accent,b.t);}
  if(b.entry>0){b.entry-=dt;b.x=lerp(b.x,W*.78,1-Math.pow(.015,dt));return;}
  const p=G.player;const sec=SECTORS[G.sector-1];
  switch(b.pattern){
    case 'queen':b.y=H*.5+Math.sin(b.t*1.3)*H*.22;if(b.fire<=0){b.fire=1.0/b.phase;ringBullets(b.x,b.y,6+b.phase*2,190+b.phase*20,9+b.phase,sec.accent,b.t*.4);if(Math.random()<.5)spawnEnemy('worker',b.x-25,b.y+rnd(-70,70));}break;
    case 'moth':b.y=H*.5+Math.sin(b.t*2.5)*H*.26;b.x=W*.75+Math.sin(b.t*.8)*50;if(b.fire<=0){b.fire=.85;enemyShoot(b,'spread');for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,-Math.PI+k*.16,180,8,6,'#e9d5ff');}break;
    case 'blade':{const a=Math.atan2(p.y-b.y,p.x-b.x);if(Math.sin(b.t*1.7)>.78){b.x+=Math.cos(a)*260*dt*b.phase;b.y+=Math.sin(a)*260*dt*b.phase;}else{b.x=lerp(b.x,W*.76,dt*.7);b.y+=Math.sin(b.t*2)*80*dt;}if(b.fire<=0){b.fire=.72;enemyShoot(b,'spread');}break;}
    case 'titan':b.y=H*.5+Math.sin(b.t*.8)*H*.18;if(b.fire<=0){b.fire=.62;enemyShoot(b,b.phase>1?'spread':'aim');if(b.phase===3)ringBullets(b.x,b.y,12,150,10,sec.accent,b.t);}break;
    case 'needle':b.y=H*.5+Math.sin(b.t*3)*H*.28;b.x=W*.76+Math.cos(b.t*1.1)*60;if(b.fire<=0){b.fire=.48;const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=0;k<b.phase;k++)spawnEnemyBullet(b.x,b.y,a+rnd(-.045,.045),360+k*30,8,4,'#ff8aa3');}break;
    case 'fortress':b.y=H*.5+Math.sin(b.t*.7)*70;if(b.fire<=0){b.fire=.9;ringBullets(b.x,b.y,8+b.phase*4,170,10,sec.accent,b.t);if(Math.random()<.65)spawnEnemy(pick(['builder','biter']),b.x-30,b.y+rnd(-90,90));}break;
    case 'storm':b.y=H*.5+Math.sin(b.t*2.1)*H*.29;b.x=W*.77+Math.sin(b.t*1.3)*70;if(b.fire<=0){b.fire=.54;enemyShoot(b,'spread');if(b.phase>1)ringBullets(b.x,b.y,7+b.phase*2,220,9,'#ffe66f',b.t*2);}break;
    case 'prism':b.y=H*.5+Math.sin(b.t*1.4)*H*.23;if(b.fire<=0){b.fire=.72;for(let q=0;q<3+b.phase;q++)spawnEnemyBullet(b.x,b.y,Math.atan2(p.y-b.y,p.x-b.x)+(q-(2+b.phase)/2)*.16,210+q*24,9,6,['#7dffd0','#fff','#6bc6ff'][q%3]);}break;
    case 'leap':{const leap=Math.max(.25,(Math.sin(b.t*2.2)+1));b.x=lerp(b.x,W*.72-leap*65,dt*1.3);b.y=H*.5+Math.sin(b.t*2.2)*H*.30;if(b.fire<=0){b.fire=.8;ringBullets(b.x,b.y,6+b.phase*3,205,11,sec.accent,b.t);}break;}
    case 'resonance':b.y=H*.5+Math.sin(b.t*1.0)*H*.2;b.x=W*.76+Math.cos(b.t*.65)*55;if(b.fire<=0){b.fire=.58;const count=7+b.phase*3;for(let i=0;i<count;i++){const a=Math.PI+(i-(count-1)/2)*.095+Math.sin(b.t)*.08;spawnEnemyBullet(b.x,b.y,a,230+i*4,9,5,i%2?'#a7e7ff':'#6d9fff');}if(b.phase===3&&Math.random()<.4)ringBullets(b.x,b.y,16,165,9,'#d8f5ff',b.t);}break;
  }
  b.x=clamp(b.x,W*.52,W*.9);b.y=clamp(b.y,70,H-70);if(dist(b,p)<b.r+p.r)hitPlayer(24+G.sector*2);
}
function updateObstacles(dt){
  const p=G.player;
  for(const o of G.obstacles){o.t+=dt;o.x+=o.vx*dt;o.rot+=dt*.4;
    if(o.type==='spore'&&dist(o,p)<o.r+48){o.hp=0;hitPlayer(17+G.sector);ringBullets(o.x,o.y,8,180,7,'#c9ff77',o.rot);}
    if(dist(o,p)<o.r+p.r){hitPlayer(o.type==='chitin'?18:12);p.x-=18;}
    if(o.hp<=0){o.dead=true;burst(o.x,o.y,o.col,14,150);if(o.type==='cocoon'&&Math.random()<.55)spawnPickup(o.x,o.y,'power',pick(POWER_KEYS));else if(Math.random()<.4)spawnPickup(o.x,o.y,'credit');}
  }
  G.obstacles=G.obstacles.filter(o=>!o.dead&&o.x>-100);
}
function updateBullets(dt){
  for(const b of G.bullets){
    if(b.homing&&b.target&&!b.target.dead){const a=Math.atan2(b.target.y-b.y,b.target.x-b.x),spd=Math.hypot(b.vx,b.vy);b.vx=lerp(b.vx,Math.cos(a)*spd,dt*4.5);b.vy=lerp(b.vy,Math.sin(a)*spd,dt*4.5);}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)continue;
    let hit=null;if(G.boss&&!G.boss.dead&&dist(b,G.boss)<b.r+G.boss.r)hit=G.boss;
    if(!hit){for(const e of G.enemies){if(!e.dead&&dist(b,e)<b.r+e.r){hit=e;break;}}}
    if(!hit){for(const o of G.obstacles){if(!o.dead&&dist(b,o)<b.r+o.r){hit=o;break;}}}
    if(hit){
      if('hp'in hit){hit.hp-=b.dmg;hit.flash=.07;if(hit===G.boss&&hit.hp<=0)killBoss();else if(hit!==G.boss&&G.enemies.includes(hit)&&hit.hp<=0)killEnemy(hit);else if(G.obstacles.includes(hit)&&hit.hp<=0)hit.dead=true;}
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
  const p=G.player,mag=70+up('magnet')*18+(powerOn('magnet')?160:0);
  for(const q of G.pickups){q.t+=dt;q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.94,dt*60);q.vy*=Math.pow(.94,dt*60);const d=dist(q,p);if(d<mag){const k=clamp(dt*(d<42?12:4.8),0,1);q.x=lerp(q.x,p.x,k);q.y=lerp(q.y,p.y,k);}if(d<p.r+q.r+5){collect(q);q.life=0;}}
  G.pickups=G.pickups.filter(q=>q.life>0);
}
function collect(q){
  if(q.type==='credit'){const gain=Math.round((18+G.sector*4)*(1+up('salvage')*.08));G.credits+=gain;META.credits=G.credits;G.score+=gain*3;AudioX.pickup();}
  else if(q.type==='heal'){G.player.hp=Math.min(G.player.maxHp,G.player.hp+24);AudioX.pickup();notify('+24 CASCO','#ff7791',1.2);}
  else if(q.type==='shield'){G.player.shield=Math.min(G.player.maxShield,G.player.shield+28);AudioX.pickup();notify('+28 ESCUDO','#7fb7ff',1.2);}
  else if(q.type==='power')activatePower(q.key);
}
function updateParticles(dt){for(const p of G.particles){p.life-=dt;if(p.kind==='dot'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.98;p.vy*=.98;}else if(p.kind==='ring')p.r+=p.vr*dt;}G.particles=G.particles.filter(p=>p.life>0);}

// ─────────────────────────────────────────────────────────────
// DRAW — fondos planetarios, barreras y arte insectoide procedural
// ─────────────────────────────────────────────────────────────
function rr(x,y,w,h,r=12){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):(cx.rect(x,y,w,h));}
function drawBackground(){
  const sec=SECTORS[(G?.sector||1)-1]||SECTORS[0],t=G?.elapsed||performance.now()/1000;
  const gr=cx.createLinearGradient(0,0,W,H);gr.addColorStop(0,sec.dark);gr.addColorStop(.52,'#050914');gr.addColorStop(1,'#020309');cx.fillStyle=gr;cx.fillRect(0,0,W,H);
  // deep parallax stars
  for(const s of stars){let x=(s.x-t*(15+35*s.z))%(W+20);if(x<0)x+=W+20;cx.globalAlpha=.18+.52*s.z;cx.fillStyle=s.z>.8?sec.accent:'#b9d5e6';cx.beginPath();cx.arc(x,s.y,s.r*s.z,0,TAU);cx.fill();}
  cx.globalAlpha=1;
  drawMotif(sec,t);
  const haze=cx.createRadialGradient(W*.62,H*.45,20,W*.62,H*.45,H*.8);haze.addColorStop(0,hexA(sec.base,.075));haze.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=haze;cx.fillRect(0,0,W,H);
}
function drawMotif(sec,t){
  cx.save();
  if(sec.motif==='dunes'){
    for(let k=0;k<3;k++){cx.fillStyle=hexA(sec.base,.045+k*.018);cx.beginPath();cx.moveTo(0,H);for(let x=0;x<=W+50;x+=80){const y=H*(.62+k*.1)+Math.sin(x*.008+t*.12+k)*30;cx.lineTo(x,y);}cx.lineTo(W,H);cx.closePath();cx.fill();}
    for(let x=120;x<W;x+=260){const xx=(x-t*20)% (W+280);cx.fillStyle='rgba(255,220,120,.035)';cx.fillRect(xx,H*.2,3,H*.46);}
  } else if(sec.motif==='pollen'){
    for(let i=0;i<28;i++){const x=(i*137-t*(22+i%4*7))%(W+80);const y=(i*79+Math.sin(t+i)*50)%H;cx.fillStyle=hexA(sec.accent,.05+(i%4)*.012);cx.beginPath();cx.arc(x<0?x+W+80:x,y,2+i%3,0,TAU);cx.fill();}
    cx.strokeStyle=hexA(sec.base,.06);cx.lineWidth=12;for(let y=H*.22;y<H;y+=H*.31){cx.beginPath();cx.moveTo(0,y);cx.bezierCurveTo(W*.3,y-80,W*.7,y+80,W,y-20);cx.stroke();}
  } else if(sec.motif==='forest'){
    for(let i=0;i<9;i++){const x=(i*190-t*18)%(W+220);cx.strokeStyle=hexA(sec.base,.07);cx.lineWidth=8;cx.beginPath();cx.moveTo(x,H);cx.lineTo(x+90,H*.22);cx.lineTo(x+130,H);cx.stroke();}
  } else if(sec.motif==='cavern'){
    cx.fillStyle=hexA(sec.base,.075);for(let i=0;i<13;i++){const x=(i*111-t*11)%(W+140);cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+35,60+(i%4)*30);cx.lineTo(x+74,0);cx.fill();cx.beginPath();cx.moveTo(x,H);cx.lineTo(x+28,H-55-(i%3)*26);cx.lineTo(x+62,H);cx.fill();}
  } else if(sec.motif==='delta'){
    cx.strokeStyle=hexA(sec.accent,.07);cx.lineWidth=5;for(let i=0;i<7;i++){const y=70+i*83+Math.sin(t+i)*22;cx.beginPath();cx.moveTo(0,y);cx.bezierCurveTo(W*.28,y+70,W*.57,y-90,W,y+20);cx.stroke();}
  } else if(sec.motif==='city'){
    cx.fillStyle=hexA(sec.base,.06);for(let i=0;i<16;i++){const x=(i*94-t*13)%(W+110),h=80+(i%5)*45;cx.fillRect(x,H-h,56,h);for(let yy=H-h+16;yy<H-10;yy+=22){cx.fillStyle=hexA(sec.accent,.045);cx.fillRect(x+12,yy,7,7);cx.fillRect(x+34,yy,7,7);}cx.fillStyle=hexA(sec.base,.06);}
  } else if(sec.motif==='storm'){
    cx.strokeStyle=hexA(sec.accent,.075);cx.lineWidth=2;for(let i=0;i<14;i++){const x=(i*130-t*110)%(W+170);cx.beginPath();cx.moveTo(x,0);cx.lineTo(x-160,H);cx.stroke();}
    if(Math.sin(t*3.4)>.93){cx.fillStyle='rgba(255,242,130,.04)';cx.fillRect(0,0,W,H);}
  } else if(sec.motif==='garden'){
    for(let i=0;i<17;i++){const x=(i*101-t*16)%(W+120),y=80+(i*71)%Math.max(120,H-150),r=24+(i%5)*11;const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,hexA(sec.accent,.12));g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(x-r,y-r,r*2,r*2);}
  } else if(sec.motif==='canyon'){
    cx.fillStyle=hexA(sec.base,.065);for(let i=0;i<8;i++){const x=(i*210-t*24)%(W+260);cx.beginPath();cx.moveTo(x,H);cx.lineTo(x+65,H*.48);cx.lineTo(x+120,H*.58);cx.lineTo(x+180,H);cx.fill();}
  } else if(sec.motif==='cathedral'){
    cx.strokeStyle=hexA(sec.accent,.075);cx.lineWidth=4;for(let i=0;i<8;i++){const x=(i*190-t*9)%(W+220);cx.beginPath();cx.arc(x,H*.48,84,Math.PI,0);cx.lineTo(x+84,H);cx.moveTo(x-84,H*.48);cx.lineTo(x-84,H);cx.stroke();}for(let r=80;r<H*.75;r+=70){cx.strokeStyle=hexA(sec.base,.035);cx.beginPath();cx.arc(W*.72,H*.5,r,0,TAU);cx.stroke();}
  }
  cx.restore();
}

function drawShip(){
  const p=G.player,t=G.elapsed,a=axes();cx.save();cx.translate(p.x,p.y);const bank=clamp(a.y*.28,-.32,.32);cx.rotate(bank);
  if(p.inv>0&&Math.floor(p.inv*18)%2===0)cx.globalAlpha=.45;
  // engine plume
  const pl=18+Math.sin(t*25)*5+(p.dashT>0?30:0);const eg=cx.createLinearGradient(-42,0,-10,0);eg.addColorStop(0,'rgba(100,245,255,0)');eg.addColorStop(1,'rgba(100,245,255,.75)');cx.fillStyle=eg;cx.beginPath();cx.moveTo(-18,-8);cx.lineTo(-18-pl,0);cx.lineTo(-18,8);cx.fill();
  // hull
  const hg=cx.createLinearGradient(-18,-18,25,18);hg.addColorStop(0,'#eafcff');hg.addColorStop(.36,'#466e86');hg.addColorStop(.7,'#13273a');hg.addColorStop(1,'#70f7ff');cx.fillStyle=hg;cx.strokeStyle='#aaffd2';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(26,0);cx.lineTo(5,-9);cx.lineTo(-9,-22);cx.lineTo(-5,-8);cx.lineTo(-22,-5);cx.lineTo(-16,0);cx.lineTo(-22,5);cx.lineTo(-5,8);cx.lineTo(-9,22);cx.lineTo(5,9);cx.closePath();cx.fill();cx.stroke();
  cx.fillStyle='#d7fbff';cx.beginPath();cx.ellipse(5,0,10,5,0,0,TAU);cx.fill();
  cx.fillStyle='#ff6b86';cx.beginPath();cx.arc(12,0,2.4,0,TAU);cx.fill();cx.restore();
  if(p.shield>0||powerOn('shield')){cx.save();cx.globalAlpha=.18+.12*Math.sin(t*6);cx.strokeStyle='#78bfff';cx.lineWidth=2;cx.beginPath();cx.arc(p.x,p.y,p.r+8,0,TAU);cx.stroke();cx.restore();}
  const dc=Math.floor(up('drone')/2)+(powerOn('drone')?2:0);for(let i=0;i<dc;i++)drawDrone(p,i,dc,t);
}
function drawDrone(p,i,count,t){const a=t*2.1+i/count*TAU,x=p.x+Math.cos(a)*35,y=p.y+Math.sin(a)*27;cx.save();cx.translate(x,y);cx.rotate(a+Math.PI/2);cx.fillStyle='#dfffff';cx.strokeStyle='#75f5ff';cx.lineWidth=1;cx.beginPath();cx.moveTo(7,0);cx.lineTo(-5,-5);cx.lineTo(-2,0);cx.lineTo(-5,5);cx.closePath();cx.fill();cx.stroke();cx.restore();}

function drawInsect(e,isBoss=false){
  const sec=SECTORS[G.sector-1],fam=e.family||sec.family,r=e.r,ang=Math.atan2(G.player.y-e.y,G.player.x-e.x);cx.save();cx.translate(e.x,e.y);cx.rotate(ang);if(e.flash>0){cx.shadowColor='#fff';cx.shadowBlur=18;}
  const pulse=1+Math.sin((e.t||0)*5)*.04;cx.scale(pulse,pulse);
  const base=isBoss?sec.accent:sec.base,edge=isBoss?'#f5ffff':sec.accent;
  // wings behind
  if(['POLILLAS','MOSQUITOS','AVISPAS','LUCIÉRNAGAS','CIGARRAS'].includes(fam)){
    cx.fillStyle=hexA(edge,isBoss?.20:.13);cx.strokeStyle=hexA(edge,.38);cx.lineWidth=Math.max(1,r*.035);
    const wing=(Math.sin((e.t||0)*20)*.2);for(const s of [-1,1]){cx.save();cx.scale(1,s);cx.rotate(wing*s);cx.beginPath();cx.ellipse(-r*.14,r*.54,r*.72,r*.28,-.28,0,TAU);cx.fill();cx.stroke();cx.restore();}
  }
  // legs, family-tuned
  cx.strokeStyle=hexA(edge,.72);cx.lineWidth=Math.max(1.4,r*.07);cx.lineCap='round';
  for(const s of [-1,1])for(let k=0;k<3;k++){const xx=-r*.25+k*r*.34,yy=s*r*.2;let reach=r*(fam==='MANTIS'&&k===2?.95:.68);cx.beginPath();cx.moveTo(xx,yy);cx.lineTo(xx-r*.08, s*r*.48);cx.lineTo(xx+(k-1)*r*.24,s*reach);cx.stroke();}
  // abdomen
  const bg=cx.createLinearGradient(-r,0,r,0);bg.addColorStop(0,hexA(base,.62));bg.addColorStop(.5,hexA(base,.95));bg.addColorStop(1,hexA(edge,.72));cx.fillStyle=bg;cx.strokeStyle=edge;cx.lineWidth=isBoss?3:1.4;
  cx.beginPath();cx.ellipse(-r*.26,0,r*.55,r*.38,0,0,TAU);cx.fill();cx.stroke();
  // thorax
  cx.fillStyle=hexA(base,.95);cx.beginPath();cx.ellipse(r*.22,0,r*.34,r*.31,0,0,TAU);cx.fill();cx.stroke();
  // head differs
  cx.fillStyle=hexA(edge,.68);cx.beginPath();cx.ellipse(r*.57,0,r*.27,r*.25,0,0,TAU);cx.fill();cx.stroke();
  // mandibles
  cx.strokeStyle=edge;cx.lineWidth=Math.max(1.6,r*.06);cx.beginPath();cx.moveTo(r*.72,-r*.1);cx.quadraticCurveTo(r*.96,-r*.28,r*1.02,-r*.03);cx.moveTo(r*.72,r*.1);cx.quadraticCurveTo(r*.96,r*.28,r*1.02,r*.03);cx.stroke();
  if(fam==='MANTIS'){cx.strokeStyle='#cfff83';cx.lineWidth=Math.max(2,r*.08);for(const s of [-1,1]){cx.beginPath();cx.moveTo(r*.18,s*r*.24);cx.lineTo(r*.75,s*r*.7);cx.lineTo(r*1.0,s*r*.5);cx.stroke();}}
  if(fam==='ESCARABAJOS'){cx.strokeStyle=hexA('#d5f7ff',.45);cx.beginPath();cx.moveTo(-r*.8,0);cx.lineTo(r*.2,0);cx.stroke();}
  if(fam==='SALTAMONTES'){cx.strokeStyle=edge;cx.lineWidth=Math.max(2,r*.09);for(const s of [-1,1]){cx.beginPath();cx.moveTo(-r*.3,s*r*.25);cx.lineTo(-r*.65,s*r*.85);cx.lineTo(r*.05,s*r*.7);cx.stroke();}}
  if(fam==='TERMITAS'){cx.fillStyle=hexA('#ffe7bd',.18);cx.beginPath();cx.ellipse(-r*.4,0,r*.35,r*.31,0,0,TAU);cx.fill();}
  if(fam==='LUCIÉRNAGAS'){const g=cx.createRadialGradient(-r*.55,0,0,-r*.55,0,r*.8);g.addColorStop(0,hexA('#baffc9',.75));g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(-r*1.35,-r*.8,r*1.6,r*1.6);}
  // eyes
  cx.fillStyle='#ff5b78';for(const s of [-1,1]){cx.beginPath();cx.arc(r*.65,s*r*.09,Math.max(1.8,r*.045),0,TAU);cx.fill();}
  cx.restore();
  // hp for elites/bosses
  if(isBoss){const w=Math.min(W*.48,520),x=W/2-w/2,y=52;cx.fillStyle='rgba(0,0,0,.58)';rr(x,y,w,14,7);cx.fill();cx.fillStyle=sec.accent;rr(x+2,y+2,(w-4)*clamp(e.hp/e.maxHp,0,1),10,5);cx.fill();cx.textAlign='center';cx.font='700 12px system-ui';cx.fillStyle='#fff';cx.fillText(`${sec.family} // ${e.name} // FASE ${e.phase}`,W/2,y-7);cx.textAlign='left';}
}

function drawObstacle(o){const sec=SECTORS[G.sector-1];cx.save();cx.translate(o.x,o.y);cx.rotate(o.rot);
  if(o.type==='chitin'){cx.fillStyle=hexA('#273b4c',.88);cx.strokeStyle=sec.accent;cx.lineWidth=2;cx.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,r=o.r*(.72+.28*Math.sin(i*2.7+o.rot));const x=Math.cos(a)*r,y=Math.sin(a)*r;i?cx.lineTo(x,y):cx.moveTo(x,y);}cx.closePath();cx.fill();cx.stroke();for(let i=-2;i<=2;i++){cx.strokeStyle=hexA(sec.accent,.24);cx.beginPath();cx.moveTo(-o.r*.55,i*o.r*.18);cx.lineTo(o.r*.55,i*o.r*.08);cx.stroke();}}
  else if(o.type==='cocoon'){cx.fillStyle=hexA(sec.base,.42);cx.strokeStyle=hexA(sec.accent,.7);cx.lineWidth=2;cx.beginPath();cx.ellipse(0,0,o.r*.7,o.r,0,0,TAU);cx.fill();cx.stroke();cx.strokeStyle=hexA('#fff',.18);for(let y=-o.r*.7;y<o.r*.8;y+=9){cx.beginPath();cx.moveTo(-o.r*.5,y);cx.lineTo(o.r*.5,y+7);cx.stroke();}}
  else if(o.type==='spore'){cx.fillStyle='#334015';cx.strokeStyle='#c9ff77';cx.lineWidth=2;for(let i=0;i<8;i++){cx.rotate(TAU/8);cx.beginPath();cx.moveTo(o.r*.3,0);cx.lineTo(o.r*1.1,0);cx.stroke();}cx.beginPath();cx.arc(0,0,o.r*.55,0,TAU);cx.fill();cx.stroke();}
  else{cx.fillStyle=hexA(sec.base,.5);cx.strokeStyle=sec.accent;cx.lineWidth=2;cx.beginPath();cx.moveTo(o.r,0);for(let i=1;i<6;i++){const a=i/6*TAU;cx.lineTo(Math.cos(a)*o.r*(i%2?.55:1),Math.sin(a)*o.r*(i%2?.55:1));}cx.closePath();cx.fill();cx.stroke();}
  cx.restore();
}
function drawPickup(q){cx.save();cx.translate(q.x,q.y);const pulse=1+Math.sin(q.t*8)*.14;cx.scale(pulse,pulse);let col='#ffd76a',icon='¤';if(q.type==='heal'){col='#ff6d89';icon='+';}if(q.type==='shield'){col='#78bfff';icon='⬡';}if(q.type==='power'){const p=POWERS[q.key];col=p?.color||'#fff';icon=p?.icon||'✦';}
  cx.shadowColor=col;cx.shadowBlur=15;cx.fillStyle='rgba(5,8,18,.82)';cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();cx.arc(0,0,q.r+5,0,TAU);cx.fill();cx.stroke();cx.shadowBlur=0;cx.fillStyle=col;cx.font=`900 ${q.type==='power'?15:13}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(icon,0,1);cx.restore();cx.textAlign='left';cx.textBaseline='alphabetic';}
function drawProjectile(b,enemy=false){cx.save();cx.strokeStyle=b.col||'#fff';cx.fillStyle=b.col||'#fff';cx.shadowColor=b.col||'#fff';cx.shadowBlur=enemy?4:8;if(b.type==='rail'){cx.lineWidth=3;cx.beginPath();cx.moveTo(b.x-b.vx*.025,b.y-b.vy*.025);cx.lineTo(b.x,b.y);cx.stroke();}else if(b.type==='missile'){cx.translate(b.x,b.y);cx.rotate(Math.atan2(b.vy,b.vx));cx.fillRect(-8,-3,13,6);cx.fillStyle='#fff';cx.fillRect(3,-1,5,2);}else{cx.beginPath();cx.arc(b.x,b.y,b.r,0,TAU);cx.fill();}cx.restore();}
function drawParticles(){for(const p of G.particles){const a=clamp(p.life/(p.max||.7),0,1);cx.save();cx.globalAlpha=a;if(p.kind==='dot'){cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*a,0,TAU);cx.fill();}else if(p.kind==='ring'){cx.strokeStyle=p.col;cx.lineWidth=3*a;cx.beginPath();cx.arc(p.x,p.y,p.r,0,TAU);cx.stroke();}else if(p.kind==='arc'){cx.strokeStyle=p.col;cx.lineWidth=2;cx.beginPath();cx.moveTo(p.x,p.y);const mx=(p.x+p.x2)/2+rnd(-15,15),my=(p.y+p.y2)/2+rnd(-15,15);cx.lineTo(mx,my);cx.lineTo(p.x2,p.y2);cx.stroke();}cx.restore();}}

function drawGame(){
  UI.buttons.length=0;drawBackground();cx.save();if(shake>0)cx.translate(rnd(-shake,shake),rnd(-shake*.65,shake*.65));
  for(const o of G.obstacles)drawObstacle(o);for(const q of G.pickups)drawPickup(q);for(const b of G.bullets)drawProjectile(b,false);for(const b of G.eBullets)drawProjectile(b,true);
  for(const e of G.enemies)drawInsect(e,false);if(G.boss&&!G.boss.dead)drawInsect(G.boss,true);drawShip();drawParticles();cx.restore();drawHUD();drawBanners();if(flash>0){cx.fillStyle=`rgba(255,80,100,${flash*.11})`;cx.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=G.player,sec=SECTORS[G.sector-1],m=12;cx.save();cx.textBaseline='middle';
  // left status glass
  cx.fillStyle='rgba(2,7,17,.62)';cx.strokeStyle='rgba(120,240,255,.18)';rr(m,m,Math.min(330,W*.32),64,13);cx.fill();cx.stroke();
  cx.fillStyle='#e8fbff';cx.font='800 12px system-ui';cx.fillText(`SECTOR ${G.sector} · ORDA ${G.wave}/3`,m+12,m+15);cx.fillStyle=sec.accent;cx.font='700 9px system-ui';cx.fillText(sec.family,m+12,m+50);
  bar(m+92,m+26,125,8,p.hp/p.maxHp,'#ff647e');bar(m+92,m+42,125,7,p.shield/p.maxShield,'#74b9ff');cx.fillStyle='#fff';cx.font='700 9px system-ui';cx.fillText('HP',m+68,m+30);cx.fillText('SH',m+68,m+46);
  // score/currency
  cx.textAlign='center';cx.fillStyle='rgba(2,7,17,.58)';rr(W*.39,10,W*.22,48,12);cx.fill();cx.fillStyle='#f6fdff';cx.font='900 16px ui-monospace,monospace';cx.fillText(G.score.toLocaleString(),W*.5,26);cx.fillStyle='#ffd76a';cx.font='700 10px system-ui';cx.fillText(`¤ ${G.credits.toLocaleString()} · BAJAS ${G.kills}/${G.goal}`,W*.5,45);
  // active powers bottom center
  const active=Object.entries(G.powers).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,6);const gap=8,ww=76,tot=active.length*ww+Math.max(0,active.length-1)*gap;let x=W/2-tot/2;for(const [k,v] of active){const pd=POWERS[k];cx.fillStyle='rgba(2,7,17,.7)';cx.strokeStyle=hexA(pd.color,.55);rr(x,H-38,ww,28,9);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText(`${pd.icon} ${Math.ceil(v)}s`,x+ww/2,H-24);x+=ww+gap;}
  if(G.combo>=3){cx.textAlign='right';cx.fillStyle=G.combo>=10?'#ff8be2':'#ffd76a';cx.font=`900 ${Math.min(22,12+G.combo*.35)}px system-ui`;const mobileLow=W<920&&H<520;cx.fillText(`x${G.combo} ENJAMBRE`,mobileLow?W-112:W-18,mobileLow?H-104:H-25);}
  cx.restore();
}
function bar(x,y,w,h,v,col){cx.fillStyle='rgba(255,255,255,.08)';rr(x,y,w,h,h/2);cx.fill();cx.fillStyle=col;rr(x+1,y+1,(w-2)*clamp(v,0,1),h-2,(h-2)/2);cx.fill();}
function drawBanners(){
  const sec=SECTORS[G.sector-1];if(G.sectorBanner>0){const a=clamp(Math.min(G.sectorBanner,3-G.sectorBanner)*1.4,0,1);cx.save();cx.globalAlpha=a;cx.textAlign='center';cx.fillStyle='#fff';cx.font=`900 ${Math.min(38,W*.05)}px system-ui`;cx.fillText(`SECTOR ${G.sector} · ${sec.name}`,W/2,H*.35);cx.fillStyle=sec.accent;cx.font=`800 ${Math.min(17,W*.022)}px system-ui`;cx.fillText(`LINAJE ${sec.family} // OBJETIVO: SOBREVIVIR, ESQUIVAR, DESTRUIR`,W/2,H*.41);cx.restore();}
  if(G.waveBanner>0&&G.sectorBanner<=0){cx.save();cx.globalAlpha=clamp(G.waveBanner,0,1);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 28px system-ui';cx.fillText(`ORDA ${G.wave}/3`,W/2,H*.32);cx.restore();}
  if(notice.t>0){cx.save();cx.globalAlpha=clamp(notice.t,0,1);cx.fillStyle='rgba(0,0,0,.62)';const w=Math.min(W*.72,680);rr(W/2-w/2,H*.13,w,38,12);cx.fill();cx.textAlign='center';cx.fillStyle=notice.color;cx.font=`800 ${Math.min(14,W*.018)}px system-ui`;cx.fillText(notice.text,W/2,H*.13+20);cx.restore();}
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
function drawMenu(){
  UI.buttons.length=0;drawBackground();drawTitle(Math.max(54,H*.12));const sec=SECTORS[menuSector-1];
  const panelW=Math.min(560,W*.52),x=36,y=Math.max(110,H*.22),rightX=W-panelW*.72-36;
  cx.fillStyle='rgba(3,8,18,.68)';cx.strokeStyle='rgba(99,246,255,.16)';rr(x,y,panelW,H-y-36,20);cx.fill();cx.stroke();
  cx.fillStyle='#dffaff';cx.font=`800 ${Math.min(18,W*.025)}px system-ui`;cx.fillText('AUTO-SHOOTER DE ESQUIVA Y DESTRUCCIÓN',x+22,y+32);cx.fillStyle='#93a9ba';cx.font='600 12px system-ui';cx.fillText('Mueve · esquiva · rompe barreras · captura poderes · elimina hordas.',x+22,y+55);
  const bw=Math.min(265,panelW*.47),bh=54;uiButton('menu_new','NUEVA CAMPAÑA',x+22,y+82,bw,bh,'#a6ff5f','desde Sector 1');uiButton('menu_load','CARGAR PARTIDA',x+32+bw,y+82,bw,bh,hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint disponible':'sin checkpoint');
  uiButton('menu_guide','CÓMO JUGAR',x+22,y+148,bw,bh,'#ffd76a','controles, poderes y tienda');uiButton('menu_store','HANGAR / TIENDA',x+32+bw,y+148,bw,bh,'#ffb7e8',`¤ ${META.credits.toLocaleString()}`);
  // unlocked sector replay
  cx.fillStyle='#dbe7ef';cx.font='800 12px system-ui';cx.fillText('REPETIR SECTOR DESBLOQUEADO',x+22,y+232);const sy=y+246;uiButton('sector_prev','‹',x+22,sy,46,44,'#7dc8ff');uiButton('sector_start',`SECTOR ${menuSector} · ${sec.family}`,x+78,sy,panelW-156,44,sec.accent,sec.name);uiButton('sector_next','›',x+panelW-68,sy,46,44,'#7dc8ff');
  // family showcase on right
  const cardX=Math.max(x+panelW+28,W*.62),cardW=W-cardX-36,cardY=y;cx.fillStyle='rgba(3,8,18,.58)';cx.strokeStyle=hexA(sec.accent,.28);rr(cardX,cardY,cardW,H-cardY-36,20);cx.fill();cx.stroke();
  const fake={x:cardX+cardW*.5,y:cardY+Math.min(140,(H-cardY)*.28),r:Math.min(72,cardW*.18),family:sec.family,t:performance.now()/1000,flash:0};const oldSector=G?.sector;if(G)G.sector=menuSector;const oldPlayer=G?.player;if(G)G.player=G.player||{x:0,y:0};if(G)drawInsect(fake,false);if(G){G.sector=oldSector;G.player=oldPlayer;}
  cx.textAlign='center';cx.fillStyle=sec.accent;cx.font=`900 ${Math.min(19,cardW*.07)}px system-ui`;cx.fillText(sec.family,cardX+cardW/2,cardY+210);cx.fillStyle='#eaffff';cx.font=`800 ${Math.min(15,cardW*.055)}px system-ui`;cx.fillText(sec.boss,cardX+cardW/2,cardY+236);cx.fillStyle='#9eb4c2';cx.font='600 11px system-ui';wrap(`Cada linaje comparte silueta, movimiento y lógica de ataque con su jefe. El sector escala en tres hordas antes de la confrontación.`,cardX+cardW/2,cardY+268,cardW-34,16);
  cx.fillStyle='#6f8799';cx.font='600 10px system-ui';cx.fillText(`v${VERSION} · horizontal obligatorio · guardado local · PWA offline`,W/2,H-12);cx.textAlign='left';
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
  UI.buttons.length=0;drawBackground();const sec=SECTORS[G.sector-1];cx.fillStyle='rgba(0,0,0,.54)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle=sec.accent;cx.font=`900 ${Math.min(40,W*.052)}px system-ui`;cx.fillText('LINAJE QUEBRADO',W/2,H*.21);cx.fillStyle='#fff';cx.font='900 22px system-ui';cx.fillText(sec.boss,W/2,H*.29);cx.fillStyle='#b2c4d1';cx.font='700 12px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · CRÉDITOS ¤ ${G.credits.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()}`,W/2,H*.35);const w=Math.min(310,W*.34),h=50,x=W/2-w/2;
  if(G.sector<10)uiButton('victory_next',`▶ ENTRAR AL SECTOR ${G.sector+1}`,x,H*.45,w,h,'#a6ff5f',SECTORS[G.sector].name);else uiButton('victory_new','↻ NUEVA CAMPAÑA',x,H*.45,w,h,'#a6ff5f','has vencido los diez linajes');
  uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.58,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.71,w,h,'#8edbff');cx.textAlign='left';
}
function drawDead(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.63)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#ff667d';cx.font=`900 ${Math.min(43,W*.055)}px system-ui`;cx.fillText('NAVE PERDIDA',W/2,H*.23);cx.fillStyle='#fff';cx.font='800 15px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.31);const w=Math.min(300,W*.34),x=W/2-w/2,h=48;uiButton('dead_retry','↻ REINTENTAR SECTOR',x,H*.42,w,h,'#a6ff5f');if(hasSave())uiButton('dead_load','▣ CARGAR CHECKPOINT',x,H*.54,w,h,'#7dc8ff');uiButton('dead_menu','MENÚ PRINCIPAL',x,H*.68,w,h,'#ffb7e8');cx.textAlign='left';}
function drawGuide(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.83)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#a6ff5f';cx.font=`900 ${Math.min(30,W*.04)}px system-ui`;cx.fillText('MANUAL DE SUPERVIVENCIA',W/2,42);const items=[
    ['1 · MOVER','En celular, toca y arrastra en la mitad izquierda. El joystick nace bajo tu dedo. En PC usa WASD/flechas o arrastra el mouse.'],
    ['2 · DISPARAR','No existe botón de fuego: la nave dispara y apunta sola al blanco prioritario. Tu trabajo es moverte y sobrevivir.'],
    ['3 · DASH','Botón ⚡ a la derecha. Da invulnerabilidad breve y atraviesa zonas peligrosas; tiene enfriamiento.'],
    ['4 · PODERES','Tri-aguja, Tesla, misiles, raíl, crio, corrosión, escudo, imán, drones, overdrive y gravedad pueden coexistir. Repetir un poder extiende su duración.'],
    ['5 · DESTRUIR','Capullos, muros de quitina, esporas y resina forman barreras. Varias sueltan créditos o poderes cuando se rompen.'],
    ['6 · TIENDA','El carrito pausa siempre. Las compras son permanentes y se conservan entre partidas. Pausa también permite guardar.']
  ];const left=Math.max(35,W*.11),cw=(W-left*2-18)/2,ch=Math.min(104,(H-120)/3-8);items.forEach((it,i)=>{const col=i%2,row=(i/2)|0,x=left+col*(cw+18),y=72+row*(ch+9);cx.fillStyle='rgba(4,12,25,.68)';cx.strokeStyle='rgba(99,246,255,.18)';rr(x,y,cw,ch,14);cx.fill();cx.stroke();cx.textAlign='left';cx.fillStyle='#7ef4ff';cx.font='900 12px system-ui';cx.fillText(it[0],x+14,y+23);cx.fillStyle='#c8d7e2';cx.font='600 10.5px system-ui';drawTextLines(it[1],x+14,y+43,cw-28,15);});uiButton('guide_back','← VOLVER',20,H-44,140,32,'#8edbff');cx.textAlign='left';
}
function drawTextLines(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);}

function handleTap(x,y){
  if(!G)return;const hit=[...UI.buttons].reverse().find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(!hit)return;AudioX.unlock();const id=hit.id;
  if(id==='menu_new'){newRun(1);return;}if(id==='menu_load'){if(!loadRun())notify('NO HAY CHECKPOINT','#ff7188',1.6);return;}if(id==='menu_guide'){setScreen('GUIDE');return;}if(id==='menu_store'){G.credits=META.credits;openStore('MENU');return;}
  if(id==='sector_prev'){menuSector=Math.max(1,menuSector-1);return;}if(id==='sector_next'){menuSector=Math.min(META.unlocked,menuSector+1);return;}if(id==='sector_start'){newRun(menuSector);return;}
  if(id==='pause_resume'){resumeGame();return;}if(id==='pause_save'){saveRun();return;}if(id==='pause_store'){openStore('PAUSE');return;}if(id==='pause_menu'){AudioX.stopBoss();META.credits=G.credits;saveMeta();setScreen('MENU');return;}
  if(id.startsWith('buy_')){buyUpgrade(id.slice(4));return;}if(id==='store_close'){closeStore();return;}
  if(id==='victory_next'){const next=G.sector+1;enterSector(next,true);setScreen('GAME');saveRun();return;}if(id==='victory_new'){newRun(1);return;}if(id==='victory_store'){shopReturn='VICTORY';setScreen('STORE');return;}if(id==='victory_menu'){setScreen('MENU');return;}
  if(id==='dead_retry'){newRun(G.sector);return;}if(id==='dead_load'){loadRun();return;}if(id==='dead_menu'){setScreen('MENU');return;}if(id==='guide_back'){setScreen('MENU');return;}
}

// ─────────────────────────────────────────────────────────────
// MAIN RENDER LOOP
// ─────────────────────────────────────────────────────────────
function render(){
  if(!G)return;switch(G.screen){case'GAME':drawGame();break;case'PAUSE':drawPause();break;case'STORE':drawStore();break;case'VICTORY':drawVictory();break;case'DEAD':drawDead();break;case'GUIDE':drawGuide();break;default:drawMenu();}
}
function loop(now){const dt=Math.min(.033,Math.max(.001,(now-lastT)/1000));lastT=now;update(dt);render();requestAnimationFrame(loop);}

// Initialize menu state after data and helpers exist.
G={screen:'MENU',sector:1,wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],boss:null,powers:{},elapsed:0,kills:0,goal:1,combo:0,comboT:0,waveBanner:0,sectorBanner:0};
menuSector=clamp(META.unlocked||1,1,10);setScreen('MENU');
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
requestAnimationFrame(loop);

})();

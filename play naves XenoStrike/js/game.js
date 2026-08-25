(()=>{
'use strict';

const VERSION='2.5.0';
const KEY_META='swarm_rift_meta_v250';
const KEY_RUN='swarm_rift_run_v250';
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

let W=1280,H=720,DPR=1,lastT=performance.now();
let stars=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndI=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[(Math.random()*a.length)|0];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hexA=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;};

const isCoarse=()=>matchMedia('(pointer:coarse)').matches;
const compactUI=()=>isCoarse() || W<980 || H<560;
function drawMiniChip(x,y,w,h,col,text,fill='rgba(2,7,17,.72)',align='left'){
  cx.fillStyle=fill;cx.strokeStyle=hexA(col,.38);rr(x,y,w,h,10);cx.fill();cx.stroke();
  cx.fillStyle=col;cx.font='800 10px system-ui';cx.textAlign=align;
  if(align==='center')cx.fillText(text,x+w/2,y+h/2+1); else if(align==='right')cx.fillText(text,x+w-8,y+h/2+1); else cx.fillText(text,x+8,y+h/2+1);
}

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

async function tryFullscreen(){
  const el=document.documentElement;
  try{
    if(!document.fullscreenElement && el.requestFullscreen){try{await el.requestFullscreen({navigationUI:'hide'});}catch(_){}}
    if(screen.orientation?.lock){try{await screen.orientation.lock('landscape');}catch(_){}}
    setTimeout(resize,120);
  }catch(_){ }
}

const IMG={
  ship:new Image(),
  atlas:new Image(),
  bg:{rust:new Image(),toxic:new Image(),rift:new Image(),nocturne:new Image(),nocturneBoss:new Image(),iron:new Image(),ironBoss:new Image(),emerald:new Image(),emeraldBoss:new Image(),bloodmist:new Image(),bloodmistBoss:new Image(),resin:new Image(),resinBoss:new Image(),odonata:new Image(),odonataBoss:new Image(),resonance:new Image(),resonanceBoss:new Image()},
  obstacles:{rock:new Image(),mine:new Image(),wreck:new Image(),pod:new Image(),gate:new Image(),nest:new Image(),seed:new Image()},
  pickups:{credit:new Image(),heal:new Image(),shield:new Image(),power:new Image()},
  enemyShips:{scout:new Image(),frigate:new Image(),bomber:new Image()},
  tiers:new Image(),
  generatedObstacles:{rust:[],toxic:[],rift:[]},
  generatedShips:[],
  generatedPowers:{},
  support:{scout:new Image(),lancer:new Image(),orbiter:new Image()},
  front:{meteor:new Image(),rammer:new Image(),wreck:new Image(),pod:new Image()},
  worldObstacles:{np:[],iron:[],emerald:[],blood:[],resin:[],odonata:[],resonance:[]},
  worldEnemies:{MOSQUITOS:[],TERMITAS:[],LIBÉLULAS:[],CIGARRAS:[]},
  enemyCells:Array.from({length:3},()=>Array(6))
};
IMG.ship.src='assets/player_ship.webp';
IMG.atlas.src='assets/enemy_atlas.png';
IMG.bg.rust.src='assets/bg_rust_canyon.webp';
IMG.bg.toxic.src='assets/bg_toxic_ravine.webp';
IMG.bg.rift.src='assets/bg_rift_tunnel.webp';
IMG.bg.nocturne.src='assets/worlds/bg_nocturne.webp';
IMG.bg.nocturneBoss.src='assets/worlds/bg_nocturne_boss.webp';
IMG.bg.iron.src='assets/worlds/bg_iron.webp';
IMG.bg.ironBoss.src='assets/worlds/bg_iron_boss.webp';
IMG.bg.emerald.src='assets/worlds/bg_emerald.webp';
IMG.bg.emeraldBoss.src='assets/worlds/bg_emerald_boss.webp';
IMG.bg.bloodmist.src='assets/worlds7_10/bg_bloodmist.webp';
IMG.bg.bloodmistBoss.src='assets/worlds7_10/bg_bloodmist_boss.webp';
IMG.bg.resin.src='assets/worlds7_10/bg_resin_hive.webp';
IMG.bg.resinBoss.src='assets/worlds7_10/bg_resin_hive_boss.webp';
IMG.bg.odonata.src='assets/worlds7_10/bg_odonata.webp';
IMG.bg.odonataBoss.src='assets/worlds7_10/bg_odonata_boss.webp';
IMG.bg.resonance.src='assets/worlds7_10/bg_resonance.webp';
IMG.bg.resonanceBoss.src='assets/worlds7_10/bg_resonance_boss.webp';
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
IMG.support.scout.src='assets/support/support_scout.svg';
IMG.support.lancer.src='assets/support/support_lancer.svg';
IMG.support.orbiter.src='assets/support/support_orbiter.svg';
IMG.front.meteor.src='assets/front/front_meteor.svg';
IMG.front.rammer.src='assets/front/front_rammer.svg';
IMG.front.wreck.src='assets/front/front_wreck.svg';
IMG.front.pod.src='assets/front/front_pod.svg';
for(const bgImg of Object.values(IMG.bg)){try{bgImg.decode?.().catch(()=>{});}catch(_){}}
for(const f of ['np_cocoon.svg','np_pollenpod.svg','np_spire.svg']){const im=new Image();im.src=`assets/worlds/${f}`;IMG.worldObstacles.np.push(im);}
for(const f of ['in_nest.svg','in_bulwark.svg','in_mine.svg']){const im=new Image();im.src=`assets/worlds/${f}`;IMG.worldObstacles.iron.push(im);}
for(const f of ['el_seed.svg','el_rock.svg','el_spore.svg']){const im=new Image();im.src=`assets/worlds/${f}`;IMG.worldObstacles.emerald.push(im);}
const WORLD_OBSTACLE_FILES={
  blood:['blood_capsule.png','blood_sac.png','blood_membrane.png','blood_wreck.png'],
  resin:['resin_column.png','resin_panel.png','resin_wall.png','resin_node.png'],
  odonata:['prism_crystal.png','ion_tower.png','suspended_debris.png','electric_node.png'],
  resonance:['sonic_ring.png','sonic_bell.png','sonic_resonator.png','acoustic_fragment.png']
};
for(const [theme,files] of Object.entries(WORLD_OBSTACLE_FILES))for(const f of files){const im=new Image();im.src=`assets/worlds7_10/obstacles/${f}`;IMG.worldObstacles[theme].push(im);}
const WORLD_ENEMY_FILES={
  MOSQUITOS:['mosquito_needler.png','mosquito_hemodrone.png','mosquito_bloodreaper.png','boss_sanguina_prime.png'],
  TERMITAS:['termite_worker.png','termite_mandible_guard.png','termite_siegebuilder.png','boss_architect_zero.png'],
  'LIBÉLULAS':['dragonfly_flashwing.png','dragonfly_prism_hunter.png','dragonfly_lance_predator.png','boss_auralis.png'],
  CIGARRAS:['cicada_nymph_echo.png','cicada_sonic_cantor.png','cicada_resonance_breaker.png','boss_resonator_omega.png']
};
for(const [family,files] of Object.entries(WORLD_ENEMY_FILES))for(const f of files){const im=new Image();im.src=`assets/worlds7_10/enemies/${f}`;IMG.worldEnemies[family].push(im);}
IMG.tiers.src='assets/generated/enemy_tiers_atlas.png';
for(let row=0;row<3;row++)for(let col=0;col<6;col++){const im=new Image();im.src=`assets/enemies/enemy_r${row}_c${col}.png`;IMG.enemyCells[row][col]=im;}
for(const pack of ['rust','toxic','rift'])for(let i=1;i<=12;i++){const im=new Image();im.src=`assets/generated/${pack}_${String(i).padStart(2,'0')}.png`;IMG.generatedObstacles[pack].push(im);}
for(let i=1;i<=12;i++){const im=new Image();im.src=`assets/generated/ship_${String(i).padStart(2,'0')}.png`;IMG.generatedShips.push(im);}
const POWER_ASSET_ORDER=['twin','tesla','missile','rail','cryo','acid','shield','magnet','drone','overdrive','gravity','heal','credit'];
POWER_ASSET_ORDER.forEach((key,i)=>{const im=new Image();im.src=`assets/generated/power_${String(i+1).padStart(2,'0')}.png`;IMG.generatedPowers[key]=im;});
const burstAsset=new Image();burstAsset.src='assets/powers2/power_burst.svg';IMG.generatedPowers.burst=burstAsset;const bombAsset=new Image();bombAsset.src='assets/powers2/power_bomb.svg';IMG.generatedPowers.bomb=bombAsset;
for(const [key,file] of Object.entries({hemadrain:'hemadrain.png',resinwall:'resinwall.png',prismburst:'prismburst.png',resonance:'resonance.png'})){const im=new Image();im.src=`assets/worlds7_10/powers/${file}`;IMG.generatedPowers[key]=im;}
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
  shot(){const n=performance.now();if(n-this.lastShot<38)return;this.lastShot=n;const lv=G?.level||1,burst=G&&powerOn('burst');this.tone(700+Math.min(310,lv*24),.05,burst?.033:.028,lv>=8?'sawtooth':'square',0,-210-lv*8);if(lv>=4)this.tone(1080+lv*18,.032,.011,'triangle',.008,-260);if(lv>=8&&Math.random()<.42)this.noise(.025,.009,2900,.002);},
  hit(){this.noise(.045,.025,900);},
  impact(level=1,boss=false){if(this.muted)return;const n=performance.now();if(!boss&&n-(this.lastImpact||0)<34)return;this.lastImpact=n;this.noise(boss?.06:.035,boss?.032:.016,boss?1150:1500);if(level>=6)this.tone(980+Math.min(300,level*18),.025,.008,'triangle',0,-250);},
  bossAttack(index=0,heavy=false){const f=[330,175,650,470,235,390,285,132,760,205][index]||330;this.tone(f,heavy?.22:.12,heavy?.06:.04,heavy?'sawtooth':'triangle',0,heavy?f*.7:f*.35);if(heavy)this.noise(.16,.045,620,.02);},
  pickup(){[560,760,980].forEach((f,i)=>this.tone(f,.09,.045,'sine',i*.045,80));},
  queue(){this.tone(640,.07,.04,'triangle');this.tone(880,.07,.032,'triangle',.05,80);},
  power(key){
    const map={
      twin:[420,.09,.05,'triangle',120],tesla:[680,.12,.05,'sawtooth',-120],missile:[190,.15,.05,'square',280],rail:[860,.12,.04,'square',-380],
      cryo:[520,.15,.05,'sine',-140],acid:[250,.16,.05,'sawtooth',70],shield:[360,.18,.05,'sine',120],magnet:[430,.14,.04,'triangle',-80],
      drone:[600,.1,.04,'square',0],overdrive:[780,.1,.04,'sawtooth',220],gravity:[180,.18,.055,'sine',-20],bomb:[120,.22,.08,'sawtooth',-35],burst:[705,.12,.05,'triangle',160],hemadrain:[155,.18,.055,'sine',120],resinwall:[310,.2,.05,'triangle',-80],prismburst:[980,.1,.045,'sawtooth',260],resonance:[220,.22,.06,'sine',40]
    }[key];
    if(!map){this.pickup();return;}
    this.tone(map[0],map[1],map[2],map[3],0,map[4]);
    if(key==='bomb')this.noise(.28,.06,420,.03);
    else if(key==='tesla')this.noise(.08,.035,1600,.02);
    else if(key==='gravity')this.noise(.14,.03,300,.04);
    else if(key==='burst')this.noise(.06,.02,1800,.01);
    else if(key==='hemadrain')this.tone(220,.18,.025,'sine',.04,-60);
    else if(key==='resinwall')this.noise(.12,.025,520,.02);
    else if(key==='prismburst')this.tone(1420,.06,.018,'triangle',.03,-380);
    else if(key==='resonance')this.noise(.16,.025,420,.02);
  },
  droneShot(powered=false){
    this.tone(powered?880:640,.04,powered?.03:.022,powered?'sawtooth':'triangle',0,powered?180:60);
    if(powered)this.noise(.03,.012,2200,.01);
  },
  sparkLaser(){
    this.tone(1180,.05,.028,'square',0,-320);this.noise(.04,.018,2600,.005);
  },
  incoming(kind='meteor'){
    const cfg={meteor:[250,610,'triangle'],rammer:[390,820,'sawtooth'],wreck:[175,430,'square'],pod:[520,980,'triangle']}[kind]||[310,620,'triangle'];
    this.tone(cfg[0],.15,.038,cfg[2],0,420);this.tone(cfg[1],.1,.027,'square',.08,-180);if(kind==='wreck')this.noise(.12,.022,520,.02);if(kind==='rammer')this.noise(.06,.018,1800,.04);
  },
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
  bossWarn(index=0){const f=[240,160,520,420,200,300,260,118,690,188][index]||240;this.tone(f,.24,.055,'sawtooth',0,f*.45);this.tone(f*1.5,.18,.035,'triangle',.12,-f*.2);},
  bossPhase(index=0){const f=180+index*35;for(let i=0;i<3;i++)this.tone(f+i*90,.16,.045,'square',i*.06,80);this.noise(.18,.035,700,.04);},
  toggle(){this.muted=!this.muted;if(this.muted)this.stopBoss();audioBtn.textContent=this.muted?'🔇':'🔊';saveMeta();}
};

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// DATA — 10 mundos jugables con arte propio y linajes insectoides
// ─────────────────────────────────────────────────────────────
const SECTORS=[
 {code:'RC-01',name:'Rust Canyon Corridor',family:'AVISPAS',boss:'IMPERATRIX VESPA',pattern:'storm',base:'#d6a21b',accent:'#fff07b',dark:'#1a1205',bg:'rust',forms:['hornet','lancer','shocker'],hazards:['pasos angostos','minas solares','torres de chatarra'],obstacles:['spire','mine','drone'],stats:{armor:2,speed:4,range:3,threat:3},blurb:'cañón industrial de roca oxidada y puentes de forja.'},
 {code:'TR-02',name:'Toxic Ravine',family:'ESCARABAJOS',boss:'ATLAS VERDE',pattern:'titan',base:'#6e9f2e',accent:'#d7ff74',dark:'#081106',bg:'toxic',forms:['scarab','tank','ram'],hazards:['ácido vivo','pilares tóxicos','vainas corrosivas'],obstacles:['acidpod','spore','pillar'],stats:{armor:5,speed:2,range:2,threat:4},blurb:'garganta química con corrientes ácidas y costras blindadas.'},
 {code:'RT-03',name:'Rift Tunnel / Debris Field',family:'MANTIS',boss:'CORTEX RAZOR',pattern:'blade',base:'#dd7b28',accent:'#ffbe74',dark:'#07121d',bg:'rift',forms:['stalker','blade','jumper'],hazards:['fragmentos cinéticos','drones rotos','cortes frontales'],obstacles:['shard','gate','drone'],stats:{armor:3,speed:5,range:3,threat:4},blurb:'túnel orbital fracturado, veloz y saturado de residuos letales.'},
 {code:'NP-04',name:'Nocturne Pollen Vault',family:'POLILLAS',boss:'VELA NOCTIS',pattern:'moth',base:'#9f68d7',accent:'#f4c8ff',dark:'#11091b',bg:'rift',worldBg:'nocturne',bossBg:'nocturneBoss',obstacleTheme:'np',forms:['flutter','dust','seer'],hazards:['niebla de polen','descargas de alas','mirada seer'],obstacles:['cocoon','dustpod','spike'],stats:{armor:2,speed:3,range:5,threat:4},blurb:'cripta lumínica donde el polen altera trayectoria y visibilidad.'},
 {code:'IN-05',name:'Iron Nest Corridor',family:'HORMIGAS',boss:'REGINA FERRUM',pattern:'queen',base:'#ac3633',accent:'#ff7f75',dark:'#170708',bg:'rust',worldBg:'iron',bossBg:'ironBoss',obstacleTheme:'iron',forms:['worker','soldier','acid'],hazards:['enjambres obreros','ácido lineal','nidos fortificados'],obstacles:['nest','bulwark','mine'],stats:{armor:4,speed:3,range:2,threat:5},blurb:'corredor de colonia roja donde cada barrera parece otro nido vivo.'},
 {code:'EL-06',name:'Emerald Leap Delta',family:'LANGOSTAS',boss:'COLOSSUS HOP',pattern:'leap',base:'#89bb2d',accent:'#ebff77',dark:'#0b1406',bg:'toxic',worldBg:'emerald',bossBg:'emeraldBoss',obstacleTheme:'emerald',forms:['hopper','crusher','slinger'],hazards:['saltos parabólicos','esporas de impulso','bloques semilla'],obstacles:['seed','hopperrock','spore'],stats:{armor:3,speed:5,range:4,threat:5},blurb:'delta radioactivo de saltos violentos y vectores impredecibles.'},
 {code:'BM-07',name:'Bloodmist Expanse',family:'MOSQUITOS',boss:'SANGUINA PRIME',pattern:'blood',base:'#8f1728',accent:'#ff6175',dark:'#100308',bg:'rust',worldBg:'bloodmist',bossBg:'bloodmistBoss',obstacleTheme:'blood',forms:['needler','hemodrone','bloodreaper'],hazards:['drenaje hemático','persecución vectorial','niebla biológica'],obstacles:['bloodcapsule','bloodsac','bloodmembrane','bloodwreck'],stats:{armor:2,speed:5,range:4,threat:5},blurb:'expansión hemática de membranas vivas, persecución y drenaje de energía.'},
 {code:'RH-08',name:'Resin Hive Citadel',family:'TERMITAS',boss:'ARCHITECT ZERO',pattern:'architect',base:'#9b641a',accent:'#ffd56a',dark:'#120a02',bg:'rust',worldBg:'resin',bossBg:'resinBoss',obstacleTheme:'resin',forms:['termite_worker','mandible_guard','siegebuilder'],hazards:['muros de resina','nodos constructores','fortificación viva'],obstacles:['resincolumn','resinpanel','resinwall','resinnode'],stats:{armor:5,speed:2,range:3,threat:5},blurb:'ciudad-colmena de resina donde el enjambre construye y protege el terreno.'},
 {code:'OS-09',name:'Odonata Stormline',family:'LIBÉLULAS',boss:'AURALIS',pattern:'odonata',base:'#0d5679',accent:'#78ecff',dark:'#020d17',bg:'rift',worldBg:'odonata',bossBg:'odonataBoss',obstacleTheme:'odonata',forms:['flashwing','prism_hunter','lance_predator'],hazards:['embestidas diagonales','rayos prismáticos','interceptación aérea'],obstacles:['prismcrystal','iontower','stormdebris','electricnode'],stats:{armor:2,speed:5,range:5,threat:5},blurb:'corredor celeste de velocidad extrema, rayos de precisión y pasadas letales.'},
 {code:'RC-10',name:'Resonance Cathedral',family:'CIGARRAS',boss:'RESONATOR OMEGA',pattern:'resonance',base:'#4e2876',accent:'#e1b5ff',dark:'#080511',bg:'rift',worldBg:'resonance',bossBg:'resonanceBoss',obstacleTheme:'resonance',forms:['nymph_echo','sonic_cantor','resonance_breaker'],hazards:['ondas sónicas','anillos resonantes','ecos de linajes previos'],obstacles:['sonicring','sonicbell','resonator','acousticfragment'],stats:{armor:4,speed:4,range:5,threat:5},blurb:'catedral final de pulsos concéntricos, ecos antiguos y resonancia del enjambre.'}
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
 needler:{hp:.72,spd:1.62,size:.78,score:210,move:'dart',fire:1.35},hemodrone:{hp:1.08,spd:1.18,size:.94,score:265,move:'orbit',fire:1.0},bloodreaper:{hp:1.5,spd:1.28,size:1.16,score:340,move:'rush',fire:.82},
 termite_worker:{hp:.9,spd:1.0,size:.82,score:220,move:'sine',fire:0},mandible_guard:{hp:1.55,spd:.78,size:1.08,score:310,move:'rush',fire:1.35},siegebuilder:{hp:2.0,spd:.58,size:1.28,score:390,move:'hover',fire:1.08},
 flashwing:{hp:.7,spd:1.85,size:.78,score:245,move:'dart',fire:1.15},prism_hunter:{hp:1.0,spd:1.42,size:.9,score:320,move:'zig',fire:.78},lance_predator:{hp:1.32,spd:1.62,size:1.08,score:405,move:'dash',fire:.88},
 nymph_echo:{hp:.86,spd:1.15,size:.82,score:255,move:'wave',fire:1.1},sonic_cantor:{hp:1.22,spd:.92,size:1.05,score:345,move:'hover',fire:.72},resonance_breaker:{hp:1.68,spd:.82,size:1.2,score:440,move:'orbit',fire:.62},
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
 hemadrain:{name:'DRENAJE HEMÁTICO',icon:'♦',color:'#ff6175',duration:11,desc:'devuelve una fracción del daño como HP/SH'},
 resinwall:{name:'MURALLA DE RESINA',icon:'⬢',color:'#ffd56a',duration:13,desc:'placas orbitales absorben impactos y detonan'},
 prismburst:{name:'RÁFAGA PRISMÁTICA',icon:'✧',color:'#78ecff',duration:11,desc:'haces perforantes de alta velocidad'},
 resonance:{name:'PULSO RESONANTE Ω',icon:'◎',color:'#d9a7ff',duration:9,desc:'ondas que dañan, empujan y limpian proyectiles'},
  bomb:{name:'BOMBA DE RIFT',icon:'✹',color:'#ffb67a',duration:0,desc:'aniquila esbirros y debilita unidades pesadas'}
};
const POWER_KEYS=Object.keys(POWERS);
const INSTANT_POWERS=new Set(['bomb']);
const POWER_SLOT_LIMIT=2;
const POWER_QUEUE_LIMIT=4;
const HERITAGE_BY_SECTOR={1:'twin',2:'shield',3:'rail',4:'cryo',5:'drone',6:'gravity',7:'hemadrain',8:'resinwall',9:'prismburst',10:'resonance'};
const COMBOS={
  'cryo+tesla':{name:'TORMENTA ÁRTICA',color:'#bfeeff'},
  'gravity+missile':{name:'POZO DE MISILES',color:'#ffb67f'},
  'acid+gravity':{name:'SINGULARIDAD ÁCIDA',color:'#b8ff77'},
  'rail+twin':{name:'TRIDENTE PERFORADOR',color:'#7dffd8'},
  'overdrive+twin':{name:'FRENESÍ BALÍSTICO',color:'#ff8aa3'},
  'burst+drone':{name:'ESCUADRÓN LANCERO',color:'#c8f4ff'},
  'burst+twin':{name:'RÁFAGA QUÍNTUPLE',color:'#ffd77f'}
};

const POWER_WORLD_FOCUS={
  1:['twin','shield','magnet','burst'],
  2:['cryo','acid','drone','shield'],
  3:['missile','tesla','rail','twin'],
  4:['cryo','tesla','overdrive','magnet'],
  5:['drone','burst','acid','missile'],
  6:['gravity','rail','overdrive','tesla'],
  7:['hemadrain','missile','overdrive','shield'],
  8:['resinwall','drone','shield','bomb'],
  9:['prismburst','rail','tesla','burst'],
  10:['resonance','gravity','prismburst','hemadrain']
};
function powerRankCap(sector=G?.sector||1){return sector>=5?3:sector>=3?2:1;}
function powerRank(key){return clamp(G?.powerRanks?.[key]||1,1,3);}
function rankRoman(rank){return ['I','II','III'][clamp(rank,1,3)-1];}
function powerFocusLabel(sector=G?.sector||1){return (POWER_WORLD_FOCUS[sector]||[]).map(k=>POWERS[k]?.name||k).join(' · ');}

const BOSS_SKILLS={
  storm:{name:'AGUIJÓN IMPERIAL',warn:'CARGA DE AGUIJÓN',alt:'TEMPESTAD DE AGUIJONES',color:'#ffe66f'},
  titan:{name:'CAPARAZÓN ATLAS',warn:'BLINDAJE ATLAS',alt:'EMBESTIDA ATLAS',color:'#c9ff77'},
  blade:{name:'CRUZ RAZOR',warn:'CORTE RAZOR',alt:'TIJERA RAZOR',color:'#ff9a55'},
  moth:{name:'VELO NOCTURNO',warn:'POLEN NOCTURNO',alt:'ECLIPSE DE POLEN',color:'#e9b7ff'},
  queen:{name:'LLAMADO DE COLONIA',warn:'ENJAMBRE DE REINA',alt:'MAREA FÉRRICA',color:'#ff746b'},
  leap:{name:'SALTO CINÉTICO',warn:'IMPACTO CINÉTICO',alt:'REBOTE COLOSSUS',color:'#dfff6b'},
  blood:{name:'DRENAJE REAL',warn:'PICADURA HEMÁTICA',alt:'NUBE DE SANGRE',color:'#ff6175'},
  architect:{name:'NODO CONSTRUCTOR',warn:'FORTIFICACIÓN DE RESINA',alt:'COLAPSO DE COLMENA',color:'#ffd56a'},
  odonata:{name:'LANZA PRISMÁTICA',warn:'INTERCEPCIÓN ODONATA',alt:'CRUZ DE TORMENTA',color:'#78ecff'},
  resonance:{name:'PULSO OMEGA',warn:'RESONANCIA CRECIENTE',alt:'CATEDRAL SÓNICA',color:'#d9a7ff'}
};
const BOSS_PHASE_NAMES={
  blood:['ACECHO','HEMORRAGIA','HAMBRE ROJA'],
  architect:['TRAZADO','FORTALEZA','COLMENA TOTAL'],
  odonata:['CAZA','INTERCEPCIÓN','SUPREMACÍA AÉREA'],
  resonance:['ECO','CORO','RESONANCIA OMEGA']
};
const HERITAGE_NAMES={1:'AGUIJÓN IMPERIAL',2:'CAPARAZÓN ATLAS',3:'CUCHILLA RAZOR',4:'POLVO NOCTURNO',5:'ENJAMBRE OBRERO',6:'SALTO CINÉTICO',7:'DRENAJE HEMÁTICO',8:'MURALLA DE RESINA',9:'RÁFAGA PRISMÁTICA',10:'PULSO RESONANTE Ω'};

const RELICS={
  7:{icon:'♦',name:'NÚCLEO HEMÁTICO',color:'#ff6078',desc:'+8 HP máximo'},
  8:{icon:'⬢',name:'MATRIZ DE RESINA',color:'#ffd56a',desc:'+10 escudo máximo'},
  9:{icon:'✧',name:'LENTE ODONATA',color:'#7eeeff',desc:'+4% velocidad de maniobra'},
  10:{icon:'Ω',name:'RESONADOR OMEGA',color:'#d9a7ff',desc:'+5% daño contra jefes'}
};
const RUSH_GRADE_VALUE={S:4,A:3,B:2,C:1};
function relicUnlocked(sector){return !!META?.relics?.[sector];}
function relicCount(){return [7,8,9,10].filter(relicUnlocked).length;}
function bossRushGrade(time,hits,sector){
  const target=38+sector*2.4;
  if(hits===0&&time<=target)return 'S';
  if(hits<=1&&time<=target*1.45)return 'A';
  if(hits<=3&&time<=target*2.05)return 'B';
  return 'C';
}
function bossRushRank(results=[]){
  if(!results.length)return 'C';const avg=results.reduce((a,r)=>a+(RUSH_GRADE_VALUE[r.grade]||1),0)/results.length;
  if(avg>=3.85)return 'Ω';if(avg>=3.35)return 'S';if(avg>=2.6)return 'A';if(avg>=1.8)return 'B';return 'C';
}
function rushRankValue(rank){return ({Ω:5,S:4,A:3,B:2,C:1})[rank]||1;}
function drawRelicStrip(y,scale=1){
  const sectors=[7,8,9,10],gap=8,w=Math.min(150*scale,(W-56-gap*3)/4),total=w*4+gap*3,x0=W/2-total/2;cx.textAlign='center';
  sectors.forEach((sec,i)=>{const r=RELICS[sec],on=relicUnlocked(sec),x=x0+i*(w+gap);cx.fillStyle=on?'rgba(6,16,27,.82)':'rgba(5,9,16,.55)';cx.strokeStyle=on?hexA(r.color,.6):'rgba(110,130,145,.20)';rr(x,y,w,32*scale,10);cx.fill();cx.stroke();cx.fillStyle=on?r.color:'#60717d';cx.font=`900 ${Math.max(9,11*scale)}px system-ui`;cx.fillText(`${r.icon} ${on?r.name:'BLOQUEADA'}`,x+w/2,y+11*scale);cx.fillStyle=on?'#aebfca':'#52616b';cx.font=`700 ${Math.max(7,8.5*scale)}px system-ui`;cx.fillText(on?r.desc:`SECTOR ${sec}`,x+w/2,y+24*scale);});
  cx.textAlign='left';
}

const UPGRADES=[
 {id:'hull',name:'Casco compuesto',icon:'♥',base:150,max:8,desc:'+12 vida máxima por nivel'},
 {id:'shield',name:'Malla de escudo',icon:'⬡',base:160,max:8,desc:'+10 escudo máximo por nivel'},
 {id:'damage',name:'Núcleo ofensivo',icon:'✦',base:190,max:8,desc:'+10% daño por nivel'},
 {id:'rate',name:'Cámara rápida',icon:'≋',base:180,max:7,desc:'+7% cadencia por nivel'},
 {id:'engine',name:'Vector de motor',icon:'»',base:145,max:7,desc:'+5% velocidad por nivel'},
 {id:'magnet',name:'Campo recolector',icon:'∪',base:135,max:6,desc:'+18 radio de recolección'},
 {id:'drone',name:'Hangar de drones',icon:'◆',base:230,max:4,desc:'+1 dron permanente cada 2 niveles'},
 {id:'salvage',name:'Reciclaje táctico',icon:'¤',base:170,max:6,desc:'+8% créditos obtenidos'},
 {id:'dash',name:'Estabilizador vectorial',icon:'⌁',base:175,max:5,desc:'+3% respuesta de maniobra por nivel'}
];

const defaultMeta=()=>({credits:0,hiScore:0,unlocked:1,upgrades:{},muted:false,runs:0,bosses:0,bossUnlocks:{},defeated:{},bossMastery:{},bestWaveGrade:{},bestBossRush:0,bossRushWins:0,bestBossRushRank:'',bestBossRushTime:0,campaignWins:0,bestCampaignScore:0,relics:{}});
let META=loadJSON(KEY_META,null);
if(!META){for(const k of ['swarm_rift_meta_v240','swarm_rift_meta_v230','swarm_rift_meta_v220','swarm_rift_meta_v210','swarm_rift_meta_v200','swarm_rift_meta_v199','swarm_rift_meta_v198','swarm_rift_meta_v197','swarm_rift_meta_v196','swarm_rift_meta_v195','swarm_rift_meta_v194','swarm_rift_meta_v18','swarm_rift_meta_v17']){META=loadJSON(k,null);if(META)break;}}
if(!META)META=defaultMeta();META.upgrades=META.upgrades||{};META.bossUnlocks=META.bossUnlocks||{};META.defeated=META.defeated||{};META.bossMastery=META.bossMastery||{};META.bestWaveGrade=META.bestWaveGrade||{};META.bestBossRush=META.bestBossRush||0;META.bossRushWins=META.bossRushWins||0;META.campaignWins=META.campaignWins||0;META.bestCampaignScore=META.bestCampaignScore||0;META.relics=META.relics||{};for(const rs of [7,8,9,10])if(META.defeated?.[rs]||META.bossUnlocks?.[rs])META.relics[rs]=true;META.bestBossRushRank=META.bestBossRushRank||'';META.bestBossRushTime=META.bestBossRushTime||0;
AudioX.muted=!!META.muted;audioBtn.textContent=AudioX.muted?'🔇':'🔊';

function loadJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch(_){return fallback;}}
function saveMeta(){META.credits=G?.credits??META.credits;META.hiScore=Math.max(META.hiScore,G?.hiScore||0);META.muted=AudioX.muted;try{localStorage.setItem(KEY_META,JSON.stringify(META));}catch(_){}}
function up(id){return META.upgrades[id]||0;}
function sectorDefeated(n){return !!META.defeated?.[n]||!!META.bossUnlocks?.[n];}
function allBossesDefeated(){for(let i=1;i<=SECTORS.length;i++)if(!sectorDefeated(i))return false;return true;}

let G=null;
let shopReturn='MENU';
let notices=[];
let shake=0,flash=0;
const UI={buttons:[]};

function makePlayer(){
  const hp=100+up('hull')*12+(relicUnlocked(7)?8:0),sh=45+up('shield')*10+(relicUnlocked(8)?10:0);
  return {x:W*.2,y:H*.5,vx:0,vy:0,r:17,hp,maxHp:hp,shield:sh,maxShield:sh,inv:0,fire:0};
}
function newRun(startSector=1,mode='campaign'){
  META.runs=(META.runs||0)+1;
  G={screen:'GAME',mode,sector:clamp(startSector,1,META.unlocked),wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],boss:null,
    kills:0,goal:waveGoal(startSector,1),spawn:0,obstacleTimer:2.4,frontTimer:mode==='training'?5.5:7.5,powerMeter:0,powers:{},powerQueue:[],sectorClear:false,bossPending:false,
    waveBanner:2.2,sectorBanner:3.2,combo:0,comboT:0,lastPowerDrop:0,elapsed:0,xp:0,level:1,xpNext:120,maxActivePowers:POWER_SLOT_LIMIT,maxQueuePowers:POWER_QUEUE_LIMIT,
    heritageNext:null,activeCombos:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,frenzyKills:0,frenzyTarget:0,frenzyDone:false,bossWarningT:0,bossWarningText:'',
    bossCheckpoint:false,trainingBoss:false,postBossT:0,postBossMax:0,frontKills:0,waveFrontKills:0,waveHits:0,waveStartT:0,waveMedals:[],powerRanks:{},bossHits:0,bossMasteryAchieved:false,bonusCredits:0,resinCharges:0,campaignComplete:false,finalReward:0,lastRelic:0,bossRushResults:[],bossRushReward:0,bossRushRank:'',bossRushTime:0,bossStartElapsed:0};
  enterSector(startSector,true);setScreen('GAME');tryFullscreen();AudioX.unlock();notify(mode==='training'?'ENTRENAMIENTO · DAÑO ENEMIGO REDUCIDO':'AUTO-DISPARO ACTIVO · ESQUIVA Y ROMPE EL ENJAMBRE',mode==='training'?'#8edbff':'#9dffbf',2.8);saveMeta();
}
function startTraining(){
  newRun(1,'training');G.goal=10;G.wave=1;G.player.maxHp=Math.round(G.player.maxHp*1.25);G.player.hp=G.player.maxHp;G.player.maxShield=Math.round(G.player.maxShield*1.2);G.player.shield=G.player.maxShield;G.frontTimer=4.8;notify('MODO ENTRENAMIENTO · 10 OBJETIVOS + JEFE DE PRÁCTICA','#9fe6ff',3);
}
function startBossCheckpoint(sector){
  if(!sectorDefeated(sector)){notify('DERROTA PRIMERO AL JEFE','#ff7f92',1.8);return;}
  newRun(sector,'replayBoss');G.bossCheckpoint=true;G.wave=3;G.kills=G.goal;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.bossPending=false;spawnBoss();notify('CHECKPOINT DE ARENA · JEFE AL 50%','#ffd76a',2.4);
}
function startBossRush(){
  if(!allBossesDefeated()){notify('BOSS RUSH · DERROTA LOS 10 JEFES PRIMERO','#ff7f92',2);return;}
  newRun(1,'bossRush');G.bossRushIndex=1;G.bossRushScore=0;G.bossRushResults=[];G.bossRushReward=0;G.bossRushRank='';G.bossRushStart=performance.now();G.wave=3;G.kills=G.goal;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.bossPending=false;G.bossCheckpoint=false;G.player.hp=G.player.maxHp;G.player.shield=G.player.maxShield;spawnBoss();notify('BOSS RUSH · 10 JEFES · SIN HORDAS','#fff09a',3);
}
function advanceBossRush(){
  if(G.mode!=='bossRush')return false;
  const next=(G.bossRushIndex||G.sector)+1;if(next>SECTORS.length){
    G.bossRushTime=(G.bossRushResults||[]).reduce((a,r)=>a+(r.time||0),0);G.bossRushRank=bossRushRank(G.bossRushResults||[]);const rv=rushRankValue(G.bossRushRank),reward=Math.round(800+rv*360+(G.bossRushResults||[]).filter(r=>r.grade==='S').length*90);G.bossRushReward=reward;G.credits+=reward;META.credits=G.credits;META.bossRushWins=(META.bossRushWins||0)+1;META.bestBossRush=Math.max(META.bestBossRush||0,G.score||0);if(!META.bestBossRushTime||G.bossRushTime<META.bestBossRushTime)META.bestBossRushTime=G.bossRushTime;if(!META.bestBossRushRank||rv>rushRankValue(META.bestBossRushRank))META.bestBossRushRank=G.bossRushRank;saveMeta();G.bossRushComplete=true;setScreen('VICTORY');return true;}

  G.bossRushIndex=next;G.sector=next;G.wave=3;G.kills=G.goal=waveGoal(next,3);G.sectorClear=false;G.boss=null;G.bossPending=false;G.postBossT=0;G.postBossMax=0;G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.pickups.length=0;G.player.hp=Math.min(G.player.maxHp,G.player.hp+G.player.maxHp*.24);G.player.shield=Math.min(G.player.maxShield,G.player.shield+G.player.maxShield*.42);G.player.inv=1.2;G.bossHits=0;G.bossMasteryAchieved=false;G.sectorBanner=1.4;spawnBoss();notify(`BOSS RUSH ${next}/10 · ${SECTORS[next-1].boss}`,SECTORS[next-1].accent,2.4);return true;
}
function enterSector(n,keepPlayer=false){
  G.sector=clamp(n,1,SECTORS.length);G.wave=1;G.kills=0;G.goal=waveGoal(G.sector,1);G.spawn=.72;G.obstacleTimer=G.sector===1?2.8:2.2;G.frontTimer=G.mode==='training'?5.5:rnd(6.5,10.5);G.boss=null;G.bossPending=false;G.sectorClear=false;G.postBossT=0;G.bossCheckpoint=false;
  G.enemies.length=0;G.bullets.length=0;G.eBullets.length=0;G.pickups.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.particles.length=0;G.activeCombos={};
  if(!keepPlayer)G.player=makePlayer();else{G.player.x=W*.2;G.player.y=H*.5;G.player.hp=G.player.maxHp;G.player.shield=G.player.maxShield;G.player.inv=.8;}
  G.sectorBanner=3;G.waveBanner=2;G.frenzyT=0;G.frenzyWave=0;G.frenzyMult=1;G.frenzyKills=0;G.frenzyTarget=0;G.frenzyDone=false;G.waveHits=0;G.waveFrontKills=0;G.waveStartT=G.elapsed;G.bossHits=0;G.bossMasteryAchieved=false;G.bossWarningT=0;G.bossWarningText='';if(G.sector>=4)notify(`${SECTORS[G.sector-1].code} · AMBIENTE ESPECÍFICO ACTIVADO`,SECTORS[G.sector-1].accent,1.8);if(G.sector===10&&G.mode==='campaign')notify('SECTOR FINAL · LA CATEDRAL ESTÁ DESPIERTA','#e1b5ff',2.7);
  if(G.heritageNext){const hk=G.heritageNext;G.heritageNext=null;activatePower(hk,'heritage',12);notify(`HERENCIA DE JEFE · ${HERITAGE_NAMES[G.sector-1]||POWERS[hk].name}`,'#ffd76a',2.5);}
}
const ENEMY_COUNT_MULT=1.30;
const POWER_DURATION_MULT=1.20;
const BOSS_TOUGHNESS_MULT=1.30;
const BALANCE_CURVE=[null,
  {enemyHp:.94,enemyDmg:.92,bossHp:1.08,pressure:1.06,maxAlive:1.00,reward:.96},
  {enemyHp:.97,enemyDmg:.96,bossHp:1.07,pressure:1.08,maxAlive:1.02,reward:.98},
  {enemyHp:1.00,enemyDmg:1.00,bossHp:1.06,pressure:1.10,maxAlive:1.04,reward:1.00},
  {enemyHp:1.02,enemyDmg:1.03,bossHp:1.06,pressure:1.11,maxAlive:1.05,reward:1.03},
  {enemyHp:1.04,enemyDmg:1.06,bossHp:1.07,pressure:1.12,maxAlive:1.06,reward:1.06},
  {enemyHp:1.06,enemyDmg:1.09,bossHp:1.08,pressure:1.13,maxAlive:1.07,reward:1.09},
  {enemyHp:1.08,enemyDmg:1.12,bossHp:1.10,pressure:1.14,maxAlive:1.08,reward:1.12},
  {enemyHp:1.10,enemyDmg:1.15,bossHp:1.12,pressure:1.15,maxAlive:1.09,reward:1.15},
  {enemyHp:1.12,enemyDmg:1.18,bossHp:1.14,pressure:1.16,maxAlive:1.10,reward:1.18},
  {enemyHp:1.14,enemyDmg:1.21,bossHp:1.17,pressure:1.18,maxAlive:1.12,reward:1.22}
];
function sectorBalance(s=G?.sector||1){return BALANCE_CURVE[clamp(s,1,10)]||BALANCE_CURVE[1];}
function waveGoal(sector,wave){const base=11,late=sector>=7?(sector-6)*1.15:0;return Math.round((base+sector*2.18+wave*4.15+late)*ENEMY_COUNT_MULT);}
function difficulty(){const s=G.sector,w=G.wave,late=s>=7?(s-6)*.028:0;const base=1+(s-1)*.145+(w-1)*.115+late+Math.min(.31,G.elapsed/180*.20);return G.mode==='training'?base*.72:base;}
function economyMult(sector=G?.sector||1){return sectorBalance(sector).reward*(1+up('salvage')*.08);}
function creditPickupBase(sector=G?.sector||1){return Math.round((18+sector*4.4)*sectorBalance(sector).reward);}
function waveTransitionReward(sector,wave){return Math.round((30+sector*9+wave*7)*sectorBalance(sector).reward);}


function setScreen(s){
  if(!G){G={screen:s,credits:META.credits,hiScore:META.hiScore};}else G.screen=s;
  const gameplay=s==='GAME';
  document.body.classList.toggle('require-landscape',gameplay&&isCoarse());
  touchHud.style.display=gameplay && isCoarse()?'block':'none';
  shopBtn.style.display=gameplay?'block':'none';pauseBtn.style.display=gameplay?'block':'none';
  if(gameplay&&isCoarse())setTimeout(tryFullscreen,40);
  if(!gameplay){resetStick();}
}

function notify(text,color='#fff',seconds=2){const item={text,color,t:seconds,max:seconds};notices.unshift(item);if(notices.length>3)notices.length=3;}
function xpForEnemy(e){return Math.round((FORM_STATS[e.form]?.score||100)*.20 + G.sector*5 + G.wave*3);}
function gainXp(amount){if(!G||amount<=0)return;G.xp+=amount;while(G.xp>=G.xpNext){G.xp-=G.xpNext;G.level++;G.xpNext=Math.round(G.xpNext*1.22);G.player.maxHp+=4;G.player.hp=Math.min(G.player.maxHp,G.player.hp+10);G.player.shield=Math.min(G.player.maxShield,G.player.shield+8);notify(`NIVEL ${G.level} · ARMA BASE +8%`,'#a6ff5f',1.8);burst(G.player.x,G.player.y,'#a6ff5f',24,160);}}
function comboId(a,b){return [a,b].sort().join('+');}
function comboOn(a,b){return powerOn(a)&&powerOn(b);}
function enemyTier(form){for(const sec of SECTORS){const idx=sec.forms.indexOf(form);if(idx>=0)return idx;}return 0;}
function countActivePowers(){return Object.keys(G.powers).length;}
function supportCount(){if(!G)return 0;const lv=G.level||1,base=lv>=14?5:lv>=10?4:lv>=7?3:lv>=4?2:lv>=2?1:0,hangar=Math.min(2,Math.ceil(up('drone')/2)),temp=powerOn('drone')?powerRank('drone'):0;return clamp(base+hangar+temp,0,5);}
function supportRole(i,count){const pattern=['scout','scout','lancer','orbiter','lancer'];return pattern[Math.min(i,pattern.length-1)]||'scout';}
function supportRate(){let r=.56-(supportCount()*0.028);if(powerOn('overdrive'))r*=.84;if(powerOn('burst'))r*=.78;if(G.activeCombos[comboId('burst','drone')])r*=.8;return Math.max(.24,r);}
function supportOrbit(i,count,lead=0){const role=supportRole(i,count),a=G.elapsed*(role==='orbiter'?1.45:1.85+(count*.02))+i/count*TAU+lead,base=role==='orbiter'?54:38,rx=base+count*3+(i%2?7:0),ry=(role==='orbiter'?39:28)+count*2+((i+1)%2?4:0);return {a,x:G.player.x+Math.cos(a)*rx,y:G.player.y+Math.sin(a)*ry,role};}
function powerDropPool(){
  const sector=G?.sector||1,focus=POWER_WORLD_FOCUS[sector]||POWER_WORLD_FOCUS[1],pool=['twin','shield','magnet'];
  for(const k of focus)for(let i=0;i<3;i++)pool.push(k);
  if(sector>=2)pool.push('cryo','acid','drone');
  if(sector>=3)pool.push('missile','tesla','rail','burst');
  if(sector>=4)pool.push('overdrive');
  if(sector>=5)pool.push('gravity','drone','burst');
  for(const k of Object.values(META.bossUnlocks||{})){if(k&&POWERS[k])pool.push(k);}
  return pool.filter(k=>POWERS[k]&&!INSTANT_POWERS.has(k));
}
function pickPowerDrop(){if((G?.sector||1)>=3&&Math.random()<.075)return 'bomb';return pick(powerDropPool());}

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
function chooseTieredForm(sec){const r=Math.random(),idx=SECTORS.indexOf(sec)+1;if(idx>=7){if(G.wave<=1)return r<(idx>=9?.68:.74)?sec.forms[0]:sec.forms[1];if(G.wave===2)return r<.36?sec.forms[0]:r<(idx>=9?.78:.84)?sec.forms[1]:sec.forms[2];const grunt=idx===10?.18:.24,mid=idx===10?.52:(idx===8?.58:.60);return r<grunt?sec.forms[0]:r<mid?sec.forms[1]:sec.forms[2];}if(G.wave<=1)return r<.80?sec.forms[0]:sec.forms[1];if(G.wave===2)return r<.47?sec.forms[0]:r<.90?sec.forms[1]:sec.forms[2];return r<.34?sec.forms[0]:r<.73?sec.forms[1]:sec.forms[2];}
function chooseSpawnEntry(){
  const r=Math.random(),flank=(G.wave>=2||G.sector>=2);
  if(r<.48)return 'right';
  if(r<.66)return 'top';
  if(r<.84)return 'bottom';
  if(flank&&r<.91)return Math.random()<.5?'leftTop':'leftBottom';
  return Math.random()<.5?'diagTop':'diagBottom';
}
function entryPlacement(mode,r){
  const p=G.player||{x:W*.2,y:H*.5};
  if(mode==='top')return {x:rnd(W*.28,W*.92),y:-r-28,tx:rnd(W*.42,W*.82),ty:rnd(H*.14,H*.28),t:rnd(.72,1.08)};
  if(mode==='bottom')return {x:rnd(W*.28,W*.92),y:H+r+28,tx:rnd(W*.42,W*.82),ty:rnd(H*.72,H*.86),t:rnd(.72,1.08)};
  if(mode==='leftTop')return {x:-r-34,y:rnd(58,H*.28),tx:rnd(W*.30,W*.48),ty:rnd(65,H*.34),t:rnd(.82,1.16)};
  if(mode==='leftBottom')return {x:-r-34,y:rnd(H*.72,H-58),tx:rnd(W*.30,W*.48),ty:rnd(H*.66,H-65),t:rnd(.82,1.16)};
  if(mode==='diagTop')return {x:W+r+40,y:rnd(42,H*.25),tx:rnd(W*.62,W*.82),ty:rnd(H*.30,H*.52),t:rnd(.65,.98)};
  if(mode==='diagBottom')return {x:W+r+40,y:rnd(H*.75,H-42),tx:rnd(W*.62,W*.82),ty:rnd(H*.48,H*.70),t:rnd(.65,.98)};
  return {x:W+r+rnd(36,130),y:rnd(62,H-62),tx:rnd(W*.76,W*.88),ty:rnd(68,H-68),t:rnd(.48,.78)};
}
function updateEnemyEntry(e,dt){
  if(!(e.entryT>0))return false;
  e.entryT-=dt;const dx=e.entryTX-e.x,dy=e.entryTY-e.y,d=Math.hypot(dx,dy)||1,spd=Math.max(250,e.spd*2.45);
  e.x+=dx/d*spd*dt;e.y+=dy/d*spd*dt;e.y=clamp(e.y,-90,H+90);
  if(d<18||e.entryT<=0)e.entryT=0;
  return true;
}
function spawnFormation(){
  if(G.boss||G.bossPending||G.mode==='training')return 0;
  const remaining=G.goal-G.kills;if(remaining<3)return 0;
  const type=G.wave>=3?pick(['pincer','wedge','cross']):pick(['pincer','wedge']);let n=0;
  if(type==='pincer'){spawnEnemy(null,null,null,'top');spawnEnemy(null,null,null,'bottom');spawnEnemy(null,null,null,'right');n=3;}
  else if(type==='cross'){spawnEnemy(null,null,null,'leftTop');spawnEnemy(null,null,null,'right');spawnEnemy(null,null,null,'leftBottom');n=3;}
  else{for(const mode of ['diagTop','right','diagBottom']){spawnEnemy(null,null,null,mode);n++;}}
  if(n)notify(type==='pincer'?'PINZA DEL ENJAMBRE':type==='cross'?'ATAQUE CRUZADO':'FORMACIÓN DE ASALTO','#ffc66f',1.1);
  return n;
}
function obstacleAssetIndex(sec,type){
  const pools={
    rust:{mine:[5],drone:[4,8,9],gate:[4,8,10],nest:[6,7],cocoon:[6,7],default:[0,1,2,3,8,9,10,11]},
    toxic:{mine:[8],drone:[4,7,10],gate:[4,7],nest:[3,8,10,11],cocoon:[3,8,10,11],acidpod:[0,1,2,5,6,9],spore:[0,2,5,6,9],seed:[1,6,9],default:[0,1,2,3,5,6,8,9,10,11]},
    rift:{mine:[6],drone:[3,6,7,10],gate:[2,6],nest:[7,11],cocoon:[7,11],default:[0,1,2,3,4,5,6,7,8,9,10,11]}
  };
  const pack=pools[sec.bg]||pools.rift,list=pack[type]||pack.default;return pick(list);
}
function worldObstacleAsset(sec,type){
  if(!sec.obstacleTheme||!['blood','resin','odonata','resonance'].includes(sec.obstacleTheme))return null;
  const pack=IMG.worldObstacles[sec.obstacleTheme]||[],idx=Math.max(0,(sec.obstacles||[]).indexOf(type));return pack[idx%Math.max(1,pack.length)]||null;
}
function ambientWorldFx(sec,t){
  const key=sec.worldBg;if(!key)return;
  cx.save();
  if(key==='nocturne'){
    for(let i=0;i<42;i++){const st=stars[(i*7+13)%stars.length],x=(st.x+t*(10+st.z*9)+i*31)%(W+30)-15,y=(st.y+t*(4+st.z*3)+Math.sin(t*.7+i)*18)%H,r=1.2+st.z*2.5;cx.globalAlpha=.08+.25*st.z;cx.fillStyle=i%3===0?'#fff0a6':'#e6b6ff';cx.beginPath();cx.arc(x,y,r,0,TAU);cx.fill();}
    const haze=cx.createLinearGradient(0,0,W,H);haze.addColorStop(0,'rgba(110,54,160,.08)');haze.addColorStop(.6,'rgba(215,164,255,.03)');haze.addColorStop(1,'rgba(70,28,112,.12)');cx.fillStyle=haze;cx.fillRect(0,0,W,H);
  }else if(key==='iron'){
    for(let i=0;i<34;i++){const st=stars[(i*11+5)%stars.length],x=(st.x-t*(18+st.z*20)+W+40)%(W+40),y=(st.y+t*(8+st.z*4)+i*13)%H;cx.globalAlpha=.08+.28*st.z;cx.fillStyle=i%4===0?'#ffd0a5':'#ff6b49';cx.fillRect(x,y,1.4+st.z*2.2,1.4+st.z*2.2);}
    cx.globalAlpha=.12+.035*Math.sin(t*3.2);cx.fillStyle='#8c1e16';cx.fillRect(0,H*.72,W,H*.28);
  }else if(key==='emerald'){
    for(let i=0;i<44;i++){const st=stars[(i*5+19)%stars.length],x=(st.x-t*(5+st.z*8)+W+20)%(W+20),y=(st.y-t*(12+st.z*10)+H+30)%(H+30),r=1+st.z*2.8;cx.globalAlpha=.07+.24*st.z;cx.fillStyle=i%4===0?'#e8ff8b':'#8dffb0';cx.beginPath();cx.arc(x,y,r,0,TAU);cx.fill();}
    cx.globalAlpha=.08;cx.strokeStyle='#a7ff88';cx.lineWidth=2;for(let i=0;i<4;i++){const y=H*(.25+i*.16)+Math.sin(t*.6+i)*12;cx.beginPath();cx.moveTo(0,y);cx.bezierCurveTo(W*.3,y-20,W*.65,y+24,W,y-8);cx.stroke();}
  }else if(key==='bloodmist'){
    for(let i=0;i<36;i++){const st=stars[(i*9+7)%stars.length],x=(st.x-t*(8+st.z*9)+W+20)%(W+20),y=(st.y+Math.sin(t*1.7+i)*22+H)%H;cx.globalAlpha=.08+.2*st.z;cx.fillStyle=i%3===0?'#7ee8ff':'#ff405c';cx.beginPath();cx.arc(x,y,1+st.z*2.2,0,TAU);cx.fill();}
    cx.globalAlpha=.08+.025*Math.sin(t*2.2);cx.fillStyle='#8b0b21';cx.fillRect(0,H*.66,W,H*.34);
  }else if(key==='resin'){
    cx.globalAlpha=.08;cx.strokeStyle='#ffd56a';cx.lineWidth=2;for(let i=0;i<5;i++){const y=H*(.18+i*.16)+Math.sin(t*.65+i)*10;cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y+Math.sin(i)*18);cx.stroke();}
    for(let i=0;i<26;i++){const st=stars[(i*13+3)%stars.length];cx.globalAlpha=.08+.2*st.z;cx.fillStyle='#ffb323';cx.fillRect((st.x-t*12)%W,st.y,1.5+st.z*2,1.5+st.z*2);}
  }else if(key==='odonata'){
    for(let i=0;i<32;i++){const st=stars[(i*3+11)%stars.length],x=(st.x-t*(42+st.z*58)+W+40)%(W+40),y=(st.y+Math.sin(i+t*2)*12+H)%H;cx.globalAlpha=.1+.32*st.z;cx.strokeStyle=i%4===0?'#fff':'#79ecff';cx.lineWidth=1+st.z;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-18-st.z*24,y);cx.stroke();}
  }else if(key==='resonance'){
    cx.globalAlpha=.09+.025*Math.sin(t*3);cx.strokeStyle='#d9a7ff';cx.lineWidth=2;for(let i=0;i<4;i++){cx.beginPath();cx.ellipse(W*.5,H*.5,W*(.12+i*.1)+Math.sin(t*1.2+i)*10,H*(.08+i*.075),0,0,TAU);cx.stroke();}
  }
  cx.restore();cx.globalAlpha=1;
}
function powerAsset(key){return IMG.generatedPowers[key]||IMG.pickups.power;}
function frontAsset(f){return IMG.front[f.kind]||IMG.front.meteor;}
function frontProfile(kind){return {
  meteor:{hp:1.0,dur:[2.35,3.05],end:86,reward:66,damage:29,col:'#ffb477',label:'METEORO FRONTAL'},
  rammer:{hp:.78,dur:[1.85,2.45],end:76,reward:104,damage:24,col:'#83e8ff',label:'ARIETE HOSTIL'},
  wreck:{hp:1.28,dur:[2.7,3.45],end:94,reward:92,damage:31,col:'#c7d7e1',label:'RESTO DE BATALLA'},
  pod:{hp:.92,dur:[2.15,2.85],end:80,reward:82,damage:26,col:'#ffae5d',label:'CÁPSULA DE REENTRADA'}
}[kind]||{hp:1,dur:[2.3,3],end:84,reward:65,damage:28,col:'#ffb477',label:'AMENAZA FRONTAL'};}
function frontPackForSector(sector){return sector<=1?'rust':sector<=2?'toxic':sector<=5?'rift':sector===6?'toxic':sector===8?'rust':'rift';}
function randomFrom(arr){return arr && arr.length?arr[(Math.random()*arr.length)|0]:null;}
function frontGeneratedAsset(kind,sector){
  const pack=frontPackForSector(sector),obs=IMG.generatedObstacles[pack]||[],ships=IMG.generatedShips||[];
  if(kind==='meteor')return randomFrom([obs[0],obs[1],obs[2],obs[6],obs[7],obs[8],obs[9]].filter(Boolean))||IMG.front.meteor;
  if(kind==='wreck')return randomFrom([obs[2],obs[3],obs[4],obs[10],obs[11],IMG.generatedObstacles.rift?.[2],IMG.generatedObstacles.rift?.[3],IMG.generatedObstacles.rift?.[10]].filter(Boolean))||IMG.front.wreck;
  if(kind==='pod')return randomFrom([ships[8],ships[9],ships[10],ships[11],obs[4],obs[5],obs[10],obs[11]].filter(Boolean))||IMG.front.pod;
  if(kind==='rammer')return randomFrom([ships[1],ships[2],ships[4],ships[6],ships[7],ships[11]].filter(Boolean))||IMG.front.rammer;
  return IMG.front[kind]||IMG.front.meteor;
}

function bossSecondarySkill(pattern){return {storm:'needleStorm',titan:'atlasRam',blade:'scissor',moth:'eclipse',queen:'ironTide',leap:'ricochet',blood:'bloodMist',architect:'hiveCollapse',odonata:'stormCross',resonance:'sonicCathedral'}[pattern]||null;}
function bossPrimarySkill(pattern){return {storm:'sting',titan:'armor',blade:'cross',moth:'pollen',queen:'brood',leap:'slam',blood:'bloodSting',architect:'resinFortify',odonata:'prismLance',resonance:'omegaPulse'}[pattern]||null;}
function bossVfx(b,col,count=7){for(let i=0;i<count;i++){const a=rnd(0,TAU),rr=rnd(b.r*.35,b.r*1.05);G.particles.push({kind:'spark',x:b.x+Math.cos(a)*rr,y:b.y+Math.sin(a)*rr,vx:Math.cos(a)*rnd(20,90),vy:Math.sin(a)*rnd(20,90),r:rnd(1.2,3.2),life:rnd(.16,.34),max:.34,col});}}
function bossPhaseBurst(b,sec){G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.55,vr:520,life:.72,max:.72,col:sec.accent});for(let i=0;i<18;i++){const a=i/18*TAU;G.particles.push({kind:'spark',x:b.x+Math.cos(a)*b.r*.55,y:b.y+Math.sin(a)*b.r*.55,vx:Math.cos(a)*rnd(120,260),vy:Math.sin(a)*rnd(120,260),r:rnd(1.5,4),life:rnd(.28,.55),max:.55,col:sec.accent});}}
function spawnFrontThreat(forceKind=null){
  if(G.boss||G.bossPending||G.postBossT>0)return;
  const sec=SECTORS[G.sector-1],weights=G.sector<2?['meteor','meteor','pod']:G.sector<4?['meteor','rammer','pod','wreck']:['rammer','meteor','wreck','pod','rammer'],kind=forceKind||pick(weights),pf=frontProfile(kind),p=G.player;
  const startX=rnd(W*.43,W*.80),startY=rnd(H*.2,H*.78),aim=Math.random()<(kind==='rammer'?.82:.62);
  const targetX=aim?clamp(p.x+rnd(-78,88),70,W*.68):rnd(W*.08,W*.76),targetY=aim?clamp(p.y+rnd(-62,62),68,H-58):rnd(72,H-68);
  const baseHp=(92+G.sector*34+G.wave*18)*pf.hp,dur=rnd(...pf.dur);
  const img=frontGeneratedAsset(kind,G.sector),angleOffset=(kind==='rammer'||kind==='pod')?-Math.PI/2:0;
  G.frontThreats.push({kind,startX,startY,targetX,targetY,x:startX,y:startY,t:0,duration:dur,r:8,hp:baseHp,maxHp:baseHp,dead:false,aim,reward:pf.reward,damage:pf.damage,rot:rnd(0,TAU),spin:kind==='rammer'?rnd(-.25,.25):rnd(-1.15,1.15),warnT:.72,col:pf.col,endR:pf.end,label:pf.label,img,angleOffset});
  AudioX.incoming(kind);notify(`${pf.label} · INTERCEPTA O ESQUIVA`,pf.col,1.25);
}
function killFrontThreat(f){if(f.dead)return;f.dead=true;G.frontKills=(G.frontKills||0)+1;G.waveFrontKills=(G.waveFrontKills||0)+1;const urgency=clamp(f.t/f.duration,0,1),bonus=1+Math.max(0,.65-urgency)*.8;G.score+=Math.round(f.reward*(G.sector+1)*bonus);G.credits+=Math.round((12+G.sector*3)*bonus*economyMult());gainXp(Math.round((18+G.sector*4)*bonus));burst(f.x,f.y,f.col||'#ffbd78',20,180);G.particles.push({kind:'shock',x:f.x,y:f.y,r:12,vr:360,life:.42,max:.42,col:f.col||'#fff'});if(Math.random()<.5)spawnPickup(f.x,f.y,'credit');if(Math.random()<.14)spawnPickup(f.x,f.y,'power',pickPowerDrop());}
function updateFrontThreats(dt){
  const p=G.player;for(const f of G.frontThreats){if(f.dead)continue;f.t+=dt;f.rot+=f.spin*dt;f.warnT=Math.max(0,(f.warnT||0)-dt);const u=clamp(f.t/f.duration,0,1),ease=Math.pow(u,1.62);f.x=lerp(f.startX,f.targetX,ease);f.y=lerp(f.startY,f.targetY,ease);f.r=lerp(8,f.endR||84,Math.pow(u,1.84));if(u>=1){if(Math.hypot(f.x-p.x,f.y-p.y)<f.r+p.r+14)hitPlayer((f.damage||28)+G.sector*1.8);f.dead=true;shake=Math.max(shake,8);}}
  G.frontThreats=G.frontThreats.filter(f=>!f.dead);
}
function drawFrontThreat(f){const img=f.img||frontAsset(f),u=clamp(f.t/f.duration,0,1),d=f.r*2.35,col=f.col||'#ffb477';cx.save();cx.translate(f.x,f.y);cx.rotate((f.kind==='rammer'?Math.atan2(f.targetY-f.startY,f.targetX-f.startX):f.rot)+(f.angleOffset||0));cx.globalAlpha=.5+.5*u;cx.shadowColor=col;cx.shadowBlur=6+u*20;if(imgReady(img)){const scale=Math.max(d/img.naturalWidth,d/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;cx.drawImage(img,-iw/2,-ih/2,iw,ih);}else{cx.fillStyle='#999';cx.beginPath();cx.arc(0,0,f.r,0,TAU);cx.fill();}cx.restore();
  if(u<.62){cx.save();cx.globalAlpha=.24+.34*Math.sin(G.elapsed*12);cx.strokeStyle=col;cx.lineWidth=2;const rr=18+u*32;cx.beginPath();cx.arc(f.targetX,f.targetY,rr,0,TAU);cx.stroke();cx.beginPath();cx.moveTo(f.targetX-rr-8,f.targetY);cx.lineTo(f.targetX-rr+5,f.targetY);cx.moveTo(f.targetX+rr-5,f.targetY);cx.lineTo(f.targetX+rr+8,f.targetY);cx.stroke();cx.restore();}
  if(u>.22){cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(f.x-f.r*.72,f.y+f.r*.72,f.r*1.44,5);cx.fillStyle=col;cx.fillRect(f.x-f.r*.72,f.y+f.r*.72,f.r*1.44*clamp(f.hp/f.maxHp,0,1),5);}if(u>.7){cx.save();cx.globalAlpha=(u-.7)*2.5;cx.fillStyle=col;cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText('IMPACTO',f.x,f.y-f.r-12);cx.restore();}
}
function triggerBomb(rank=1){
  burst(G.player.x,G.player.y,'#ffb67a',34,220);G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:14,vr:780,life:.6,max:.6,col:'#ffb67a'});shake=Math.max(shake,13);flash=Math.max(flash,.9);
  for(const e of G.enemies){if(e.dead)continue;const tier=enemyTier(e.form);const pct=tier===0?1:tier===1?.5+(rank-1)*.1:.3+(rank-1)*.08;damageEntity(e,Math.max(1,e.hp*pct),'bomb');}
  for(const o of G.obstacles){if(o.dead)continue;o.hp-=o.maxHp*.55;if(o.hp<=0)o.dead=true;}
  if(G.boss&&!G.boss.dead)damageEntity(G.boss,G.boss.maxHp*(.08+(rank-1)*.02),'bomb');
  AudioX.power('bomb');notify('✹ BOMBA DE RIFT · DETONACIÓN','#ffb67a',1.6);
}
function updateComboState(){if(!G)return;const now={};for(const id of Object.keys(COMBOS)){const [a,b]=id.split('+');if(comboOn(a,b)){now[id]=true;if(!G.activeCombos[id])notify(`${COMBOS[id].name} · COMBO`,COMBOS[id].color,1.6);}}G.activeCombos=now;}
function pumpPowerQueue(){while(G.powerQueue.length&&countActivePowers()<G.maxActivePowers){const next=G.powerQueue.shift();activatePower(next,'queue');}}

function completeFrenzy(){
  if(!G||G.frenzyDone)return;G.frenzyDone=true;
  const reward=Math.round((32+G.sector*13+G.wave*9)*economyMult()),xp=34+G.sector*11+G.wave*8;G.credits+=reward;G.bonusCredits+=reward;gainXp(xp);G.score+=reward*8;
  for(let i=0;i<2;i++)spawnPickup(G.player.x+rnd(55,105),G.player.y+rnd(-48,48),'credit');if(Math.random()<.38)spawnPickup(G.player.x+100,G.player.y,'power',pickPowerDrop());
  AudioX.tone(920,.12,.05,'triangle',0,260);notify(`FRENESÍ DOMINADO · +¤${reward} · +${xp} XP`,'#ffe08b',2.1);
}
function awardWaveClear(){
  if(!G||G.mode==='training')return;const hits=G.waveHits||0,elapsed=Math.max(1,G.elapsed-(G.waveStartT||0));let grade='C',mult=1;
  if(hits===0&&G.frenzyDone){grade='S';mult=1.65;}else if(hits<=1){grade='A';mult=1.35;}else if(hits<=3){grade='B';mult=1.15;}
  const base=28+G.sector*10+G.wave*8,reward=Math.round(base*mult*economyMult()),xp=Math.round((34+G.sector*10+G.wave*7)*mult);
  G.credits+=reward;G.bonusCredits+=reward;gainXp(xp);G.score+=reward*6;G.waveMedals.push({sector:G.sector,wave:G.wave,grade,hits,time:elapsed});
  const key=`${G.sector}-${G.wave}`,order={C:1,B:2,A:3,S:4};if(order[grade]>(order[META.bestWaveGrade[key]]||0))META.bestWaveGrade[key]=grade;
  if(grade==='S'){spawnPickup(G.player.x+90,G.player.y,'power',pickPowerDrop());spawnPickup(G.player.x+65,G.player.y-30,'shield');}
  else if(grade==='A')spawnPickup(G.player.x+70,G.player.y,'credit');
  notify(`ORDA ${G.wave} · RANGO ${grade} · +¤${reward}` ,grade==='S'?'#fff09a':grade==='A'?'#a6ff5f':'#9fe6ff',2.1);saveMeta();
}
function activateFrenzy(){
  if(G.frenzyWave===G.wave||G.boss||G.bossPending)return;
  if(G.sector===1&&G.wave<3)return;
  G.frenzyWave=G.wave;G.frenzyT=7+Math.min(5,G.sector*.65+G.wave*.55);G.frenzyMult=1.45+Math.min(.35,G.sector*.04);G.frenzyKills=0;G.frenzyTarget=5+G.wave+Math.ceil(G.sector*.75);G.frenzyDone=false;
  AudioX.tone(720,.15,.05,'sawtooth',0,260);AudioX.noise(.16,.035,1400,.04);notify(`FRENESÍ · ${G.frenzyTarget} BAJAS · x${G.frenzyMult.toFixed(1)}`,'#ffcb63',2.2);shake=5;
}
function startBossWarning(b,skill,duration=1.05){
  if(b.telegraphT>0||b.specialT>0)return false;
  b.telegraph=skill;b.telegraphT=duration;G.bossWarningT=duration;const def=BOSS_SKILLS[b.pattern];G.bossWarningText=skill===bossSecondarySkill(b.pattern)?(def?.alt||skill):(def?.warn||skill);AudioX.bossWarn(G.sector-1);bossVfx(b,def?.color||'#fff',10);return true;
}
function executeBossSpecial(b,p,sec){
  const skill=b.telegraph;b.telegraph='';b.telegraphT=0;b.specialT=.78;AudioX.bossAttack(G.sector-1,true);bossVfx(b,BOSS_SKILLS[b.pattern]?.color||sec.accent,14);
  if(skill==='sting'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.chargeVX=Math.cos(a)*560;b.chargeVY=Math.sin(a)*560;b.chargeT=.52;for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,a+k*.11,325,9,5,'#ffe66f');G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*2.1,life:.24,max:.24,col:'#fff08a'});
  }else if(skill==='needleStorm'){
    const base=Math.atan2(p.y-b.y,p.x-b.x);for(let fan=0;fan<3;fan++)for(let k=-4;k<=4;k++)spawnEnemyBullet(b.x,b.y,base+k*.075+fan*.12,300+fan*32,8,4.5,'#ffe66f');for(let i=0;i<2+b.phase;i++)spawnEnemy('hornet',b.x-25,b.y+rnd(-105,105));
  }else if(skill==='armor'){
    b.guardT=2.5;ringBullets(b.x,b.y,10+b.phase*2,175,8,sec.accent,b.t);spawnEnemy('scarab',b.x-30,b.y-65);if(b.phase>1)spawnEnemy('tank',b.x-30,b.y+65);G.particles.push({kind:'shieldwave',x:b.x,y:b.y,r:b.r*.9,vr:120,life:2.4,max:2.4,col:sec.accent});
  }else if(skill==='atlasRam'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.guardT=1.0;b.chargeVX=Math.cos(a)*480;b.chargeVY=Math.sin(a)*480;b.chargeT=.75;ringBullets(b.x,b.y,12,140,8,sec.accent,b.t);G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.6,vr:420,life:.55,max:.55,col:sec.accent});
  }else if(skill==='cross'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=-3;k<=3;k++){spawnEnemyBullet(b.x,b.y,a+k*.12,325,9,4,'#ff9857');spawnEnemyBullet(b.x,b.y,a+Math.PI/2+k*.09,250,8,4,'#ffd0a8');}b.chargeVX=Math.cos(a)*450;b.chargeVY=Math.sin(a)*450;b.chargeT=.38;G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*2.6,life:.28,max:.28,col:'#ffae65'});G.particles.push({kind:'slash',x:b.x,y:b.y,a:a+Math.PI/2,len:b.r*2.3,life:.28,max:.28,col:'#ffd6b4'});
  }else if(skill==='scissor'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=-1;k<=1;k++){const off=.32-k*.32;G.particles.push({kind:'slash',x:b.x,y:b.y,a:a+off,len:b.r*3.0,life:.38,max:.38,col:'#ff9a55'});for(let n=1;n<=5;n++)spawnEnemyBullet(b.x,b.y,a+off+(n-3)*.045,350,10,4,'#ff9a55');}b.chargeVX=Math.cos(a)*390;b.chargeVY=Math.sin(a)*390;b.chargeT=.46;
  }else if(skill==='pollen'){
    for(let ring=0;ring<2+(b.phase>1?1:0);ring++)ringBullets(b.x,b.y,10+ring*4,135+ring*58,7,'#e9b7ff',b.t+ring*.22);for(let i=0;i<2;i++)spawnEnemy(pick(['flutter','dust']),b.x-25,b.y+rnd(-100,100));G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.75,vr:180,life:1.2,max:1.2,col:'#e9b7ff'});
  }else if(skill==='eclipse'){
    for(let ring=0;ring<4;ring++)ringBullets(b.x,b.y,12+ring*2,115+ring*46,7+ring*.5,'#d98cff',b.t+ring*.17);for(let i=0;i<3+b.phase;i++){const a=i/(3+b.phase)*TAU;G.particles.push({kind:'orb',x:b.x+Math.cos(a)*b.r*1.25,y:b.y+Math.sin(a)*b.r*1.25,r:8,life:1.8,max:1.8,col:'#e9b7ff'});} 
  }else if(skill==='brood'){
    const n=2+b.phase;for(let i=0;i<n;i++)spawnEnemy(pick(b.phase>1?['worker','soldier','acid']:['worker','soldier']),b.x-35,b.y+rnd(-120,120));for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,Math.PI+k*.16,235,9,6,'#ff746b');
  }else if(skill==='ironTide'){
    for(let row=-2;row<=2;row++){for(let k=0;k<3;k++)spawnEnemyBullet(b.x-k*18,b.y+row*30,Math.PI+rnd(-.025,.025),255+row*5,9,5,'#ff746b');}for(let i=0;i<2+b.phase;i++)spawnEnemy(pick(['worker','soldier','acid']),b.x-35,b.y+rnd(-120,120));G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.8,vr:350,life:.75,max:.75,col:'#ff746b'});
  }else if(skill==='slam'){
    const targetY=p.y;b.y=lerp(b.y,targetY,.72);b.x=W*.62;ringBullets(b.x,b.y,10+b.phase*3,230+b.phase*25,10,sec.accent,b.t);G.particles.push({kind:'shock',x:b.x,y:b.y,r:12,vr:620,life:.62,max:.62,col:sec.accent});shake=12;
  }else if(skill==='ricochet'){
    for(let hop=0;hop<3;hop++){const yy=hop%2?H*.25:H*.75;const a=Math.atan2(yy-b.y,W*.55-b.x);for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,a+k*.11,300+hop*35,9,5,sec.accent);}b.chargeVX=-430;b.chargeVY=(p.y>b.y?1:-1)*300;b.chargeT=.58;G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.7,vr:500,life:.58,max:.58,col:sec.accent});
  }else if(skill==='bloodSting'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.chargeVX=Math.cos(a)*610;b.chargeVY=Math.sin(a)*610;b.chargeT=.48;for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,a+k*.08,340,10,5,'#ff6175');G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*2.4,life:.26,max:.26,col:'#ff6175'});
  }else if(skill==='bloodMist'){
    for(let ring=0;ring<3;ring++)ringBullets(b.x,b.y,12+ring*4,120+ring*60,8+ring,'#ff4965',b.t+ring*.18);for(let i=0;i<2+b.phase;i++)spawnEnemy(pick(['needler','hemodrone']),b.x-28,b.y+rnd(-120,120));G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.6,vr:260,life:1.1,max:1.1,col:'#ff6175'});
  }else if(skill==='resinFortify'){
    b.guardT=2.1;for(let i=0;i<2+b.phase;i++)spawnObstacle();for(let i=0;i<2;i++)spawnEnemy('termite_worker',b.x-35,b.y+rnd(-90,90));G.particles.push({kind:'shieldwave',x:b.x,y:b.y,r:b.r*.85,vr:105,life:2.1,max:2.1,col:'#ffd56a'});
  }else if(skill==='hiveCollapse'){
    ringBullets(b.x,b.y,14+b.phase*3,175+b.phase*24,10,'#ffbf49',b.t);for(let i=0;i<3+b.phase;i++)spawnEnemy(pick(['termite_worker','mandible_guard']),b.x-30,b.y+rnd(-130,130));G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.7,vr:430,life:.72,max:.72,col:'#ffd56a'});
  }else if(skill==='prismLance'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=-3;k<=3;k++)spawnEnemyBullet(b.x,b.y,a+k*.07,390,10,4.2,'#78ecff');b.chargeVX=Math.cos(a)*560;b.chargeVY=Math.sin(a)*560;b.chargeT=.42;G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*3.0,life:.3,max:.3,col:'#78ecff'});
  }else if(skill==='stormCross'){
    const base=Math.atan2(p.y-b.y,p.x-b.x);for(const off of [0,Math.PI/2])for(let k=-4;k<=4;k++)spawnEnemyBullet(b.x,b.y,base+off+k*.07,360,9,4,'#9af7ff');for(let i=0;i<2+b.phase;i++)spawnEnemy('flashwing',b.x-20,b.y+rnd(-115,115));G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.65,vr:500,life:.5,max:.5,col:'#78ecff'});
  }else if(skill==='omegaPulse'){
    for(let ring=0;ring<3;ring++)ringBullets(b.x,b.y,14+ring*4,145+ring*55,9+ring,'#d9a7ff',b.t+ring*.2);G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.6,vr:560,life:.65,max:.65,col:'#d9a7ff'});
  }else if(skill==='sonicCathedral'){
    for(let ring=0;ring<5;ring++)ringBullets(b.x,b.y,12+ring*3,100+ring*52,8+ring*.7,ring%2?'#f4d37a':'#c18cff',b.t+ring*.15);for(let i=0;i<2+b.phase;i++)spawnEnemy(pick(['nymph_echo','sonic_cantor']),b.x-25,b.y+rnd(-120,120));G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.75,vr:300,life:1.3,max:1.3,col:'#d9a7ff'});
  }
}

// ─────────────────────────────────────────────────────────────
// INPUT — control directo por Pointer Events, sin joystick ni DASH
// ─────────────────────────────────────────────────────────────
const input={keys:new Set(),joyX:0,joyY:0,stickId:null,baseX:0,baseY:0,mouseSteer:false,mouseX:0,mouseY:0,touchId:null,touchSteer:false};
addEventListener('keydown',e=>{input.keys.add(e.key.toLowerCase());if(['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key==='Escape'&&G?.screen==='GAME')pauseGame();});
addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));

function resetStick(){input.joyX=input.joyY=0;input.stickId=null;input.touchId=null;input.touchSteer=false;stickBase.style.display='none';stickKnob.style.transform='translate(0px,0px)';}
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

cv.addEventListener('pointerdown',e=>{
  AudioX.unlock();
  if(G?.screen==='GAME'){
    if(e.pointerType==='mouse'){
      input.mouseSteer=true;input.mouseX=e.clientX;input.mouseY=e.clientY;e.preventDefault();return;
    }
    input.touchId=e.pointerId;input.touchSteer=true;input.mouseSteer=true;input.mouseX=e.clientX;input.mouseY=e.clientY;
    try{cv.setPointerCapture?.(e.pointerId);}catch(_){}
    e.preventDefault();
    return;
  }
  handleTap(e.clientX,e.clientY);
},{passive:false});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'){
    input.mouseX=e.clientX;input.mouseY=e.clientY;input.mouseSteer=G?.screen==='GAME';
  }else if(e.pointerId===input.touchId && G?.screen==='GAME'){
    input.mouseX=e.clientX;input.mouseY=e.clientY;input.mouseSteer=true;input.touchSteer=true;e.preventDefault();
  }
},{passive:false});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>cv.addEventListener(ev,e=>{
  if(e.pointerType==='mouse'){input.mouseSteer=false;return;}
  if(e.pointerId===input.touchId){input.touchId=null;input.touchSteer=false;input.mouseSteer=false;}
},{passive:true}));
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
function pauseGame(){if(G?.screen!=='GAME')return;G.screen='PAUSE';setScreen('PAUSE');AudioX.pause();saveRun();}
function resumeGame(){if(G){setScreen('GAME');lastT=performance.now();AudioX.unlock();}}
function openStore(from){if(!G)return;shopReturn=from||G.screen;if(G.screen==='GAME')saveRun();setScreen('STORE');AudioX.pause();}
function closeStore(){if(shopReturn==='GAME')resumeGame();else setScreen(shopReturn||'MENU');}

// ─────────────────────────────────────────────────────────────
// SAVE / LOAD — checkpoint consistente, no serializa basura efímera
// ─────────────────────────────────────────────────────────────
function saveRun(){
  if(!G?.player||['MENU','DEAD'].includes(G.screen)||G.mode==='bossRush')return false;
  const p=G.player;const payload={version:VERSION,mode:G.mode||'campaign',sector:G.sector,wave:G.wave,score:G.score,credits:G.credits,hp:p.hp,shield:p.shield,powers:G.powers,queue:G.powerQueue||[],xp:G.xp||0,level:G.level||1,xpNext:G.xpNext||120,heritageNext:G.heritageNext||null,bossCheckpoint:!!G.bossCheckpoint,powerRanks:G.powerRanks||{},waveHits:G.waveHits||0,waveFrontKills:G.waveFrontKills||0,waveStartT:G.waveStartT||0,waveMedals:G.waveMedals||[],bonusCredits:G.bonusCredits||0,resinCharges:G.resinCharges||0,bossRushIndex:G.bossRushIndex||0,bossRushScore:G.bossRushScore||0,ts:Date.now()};
  try{localStorage.setItem(KEY_RUN,JSON.stringify(payload));}catch(_){return false;}saveMeta();notify('CHECKPOINT GUARDADO','#79c9ff',1.8);return true;
}
function hasSave(){try{return !!localStorage.getItem(KEY_RUN)||!!localStorage.getItem('swarm_rift_run_v240')||!!localStorage.getItem('swarm_rift_run_v230')||!!localStorage.getItem('swarm_rift_run_v220')||!!localStorage.getItem('swarm_rift_run_v210')||!!localStorage.getItem('swarm_rift_run_v200')||!!localStorage.getItem('swarm_rift_run_v199')||!!localStorage.getItem('swarm_rift_run_v198')||!!localStorage.getItem('swarm_rift_run_v197')||!!localStorage.getItem('swarm_rift_run_v196')||!!localStorage.getItem('swarm_rift_run_v195')||!!localStorage.getItem('swarm_rift_run_v194')||!!localStorage.getItem('swarm_rift_run_v17');}catch(_){return false;}}
function loadRun(){
  const s=loadJSON(KEY_RUN,null)||loadJSON('swarm_rift_run_v240',null)||loadJSON('swarm_rift_run_v230',null)||loadJSON('swarm_rift_run_v220',null)||loadJSON('swarm_rift_run_v210',null)||loadJSON('swarm_rift_run_v200',null)||loadJSON('swarm_rift_run_v199',null)||loadJSON('swarm_rift_run_v198',null)||loadJSON('swarm_rift_run_v197',null)||loadJSON('swarm_rift_run_v196',null)||loadJSON('swarm_rift_run_v195',null)||loadJSON('swarm_rift_run_v194',null)||loadJSON('swarm_rift_run_v17',null);if(!s||!s.sector)return false;
  G={screen:'GAME',mode:s.mode||'campaign',sector:clamp(s.sector,1,SECTORS.length),wave:clamp(s.wave||1,1,3),score:s.score||0,hiScore:META.hiScore||0,credits:Math.max(META.credits||0,s.credits||0),
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],boss:null,kills:0,goal:waveGoal(s.sector,s.wave||1),spawn:.5,obstacleTimer:2,
    powerMeter:0,powers:s.powers||{},powerQueue:s.queue||[],sectorClear:false,bossPending:false,waveBanner:2.4,sectorBanner:2.8,combo:0,comboT:0,lastPowerDrop:0,elapsed:0,xp:s.xp||0,level:s.level||1,xpNext:s.xpNext||120,maxActivePowers:POWER_SLOT_LIMIT,maxQueuePowers:POWER_QUEUE_LIMIT,heritageNext:s.heritageNext||null,activeCombos:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,bossWarningT:0,bossWarningText:'',bossCheckpoint:!!s.bossCheckpoint,trainingBoss:false,postBossT:0,postBossMax:0,frontTimer:7,frontKills:0,waveFrontKills:s.waveFrontKills||0,waveHits:s.waveHits||0,waveStartT:s.waveStartT||0,waveMedals:s.waveMedals||[],powerRanks:s.powerRanks||{},frenzyKills:0,frenzyTarget:0,frenzyDone:false,bossHits:0,bossMasteryAchieved:false,bonusCredits:s.bonusCredits||0,resinCharges:s.resinCharges||0,bossRushIndex:s.bossRushIndex||0,bossRushScore:s.bossRushScore||0,bossRushComplete:false,campaignComplete:false,finalReward:0,lastRelic:0,bossRushResults:[],bossRushReward:0,bossRushRank:'',bossRushTime:0,bossStartElapsed:0};
  G.player.hp=clamp(s.hp||G.player.maxHp*.75,1,G.player.maxHp);G.player.shield=clamp(s.shield||0,0,G.player.maxShield);
  setScreen('GAME');tryFullscreen();AudioX.unlock();notify('CHECKPOINT CARGADO · OLEADA REINICIADA','#8edbff',2.5);return true;
}

// ─────────────────────────────────────────────────────────────
// SPAWN / COMBAT ENTITIES
// ─────────────────────────────────────────────────────────────
function enemySpecialDelay(form){
  return ({needler:rnd(2.0,3.1),hemodrone:rnd(2.2,3.2),bloodreaper:rnd(2.5,3.8),mandible_guard:rnd(3.0,4.2),siegebuilder:rnd(2.6,4.0),prism_hunter:rnd(1.7,2.7),lance_predator:rnd(1.9,3.0),nymph_echo:rnd(2.2,3.3),sonic_cantor:rnd(1.8,3.0),resonance_breaker:rnd(1.8,3.0)})[form]??999;
}
function spawnEnemy(forceForm=null,x=null,y=null,entryMode=null){
  let sec=SECTORS[G.sector-1],origin=sec,shipSpawn=false;
  if(!forceForm&&G.sector===10&&Math.random()<.18){origin=SECTORS[rndI(0,8)];}
  else if(!forceForm&&G.sector>1&&Math.random()<(G.sector===2?.08:.12)){origin=SECTORS[G.sector-2];}
  if(!forceForm&&G.sector>=3){const shipChance=G.sector===10?.08:(0.08+Math.max(0,G.sector-3)*0.025);if(Math.random()<shipChance)shipSpawn=true;}
  const form=forceForm||(shipSpawn?pick(SHIP_FORMS.slice(0,Math.min(3,1+Math.floor(G.wave/1.5)))):chooseTieredForm(origin)),fs=FORM_STATS[form]||FORM_STATS.worker,d=difficulty();
  const baseR=15*fs.size+G.sector*.45,manual=x!=null&&y!=null,mode=manual?'summon':(entryMode||chooseSpawnEntry()),pos=manual?{x,y,tx:x,ty:y,t:0}:entryPlacement(mode,baseR);
  const baseHp=(G.sector===1?28:34)+G.sector*12+G.wave*7,bal=sectorBalance();
  const enemyHp=baseHp*fs.hp*d*bal.enemyHp;
  const e={x:pos.x,y:pos.y,ox:pos.y,r:baseR,hp:enemyHp,maxHp:enemyHp,spd:(76+G.sector*4)*fs.spd*(1+(d-1)*.13)*(1+(G.sector-1)*.004),score:fs.score+G.sector*18,
    form,family:shipSpawn?'RECUPERADORES':origin.family,kind:shipSpawn?'ship':'insect',shipClass:shipSpawn?form:null,shipVariant:shipSpawn?(form==='ship_scout'?rndI(0,3):form==='ship_frigate'?rndI(4,7):rndI(8,11)):null,name:shipSpawn?(SHIP_LABELS[form]||'SHIP'):null,move:fs.move,fireCd:fs.fire?rnd(.55,fs.fire*1.1):999,fireRate:fs.fire||999,specialCd:shipSpawn?rnd(1.6,3.2):enemySpecialDelay(form),dashT:0,surgeT:0,surgeVX:0,surgeVY:0,passes:0,t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,slow:0,flash:0,contact:((G.sector===1?11:14)+G.sector*2.0)*bal.enemyDmg,
    entryMode:mode,entryT:pos.t||0,entryTX:pos.tx,entryTY:pos.ty};
  G.enemies.push(e);return e;
}
function spawnBoss(){
  if(G.boss)return;const sec=SECTORS[G.sector-1],d=difficulty();G.bossStartElapsed=G.elapsed||0;
  const maxHp=((1040+G.sector*610)*d)*(1.12+G.sector*.055)*sectorBalance().bossHp*BOSS_TOUGHNESS_MULT;
  G.boss={x:W+120,y:H*.5,r:58+G.sector*2.6,hp:maxHp,maxHp,pattern:sec.pattern,name:sec.boss,family:sec.family,t:0,fire:.7,phase:1,dead:false,entry:2.2,vx:-90,
    telegraph:'',telegraphT:0,specialT:0,specialCd:3.6,guardT:0,chargeT:0,chargeVX:0,chargeVY:0,animPulse:0,wingT:0,phaseFlash:0,altNext:false,arenaCd:4.8,signatureCd:rnd(2.8,4.4),signatureT:0,signatureSide:Math.random()<.5?-1:1,anchorX:W*.68,anchorY:H*.5,afterimageT:0};
  if(G.mode==='bossRush'){const mult=.72+(G.sector-1)*.055;G.boss.maxHp=maxHp*mult;G.boss.hp=G.boss.maxHp;G.boss.specialCd=Math.max(1.45,2.8-G.sector*.09);G.boss.arenaCd=Math.max(2.4,4.4-G.sector*.15);}
  if(G.bossCheckpoint){G.boss.hp=maxHp*.5;G.boss.phase=2;G.boss.specialCd=1.35;G.boss.altNext=true;}if(G.mode==='training'){G.trainingBoss=true;G.boss.hp=maxHp*.32;G.boss.maxHp=G.boss.hp;G.boss.r*=.88;}
  G.enemies.length=0;G.eBullets.length=0;G.frontThreats.length=0;G.bossPending=false;G.frenzyT=0;AudioX.bossIntro(G.sector-1);notify(`${G.mode==='training'?'SIMULACIÓN DE JEFE':'ALERTA BIOLÓGICA'} · ${sec.boss}`,'#ffcf73',3);shake=8;
}

function spawnObstacle(){
  const sec=SECTORS[G.sector-1],type=pick(sec.obstacles||['spire']);
  const baseSize={spire:[38,62],mine:[18,26],drone:[24,34],acidpod:[26,42],spore:[22,34],pillar:[32,54],shard:[20,34],gate:[42,68],cocoon:[28,42],dustpod:[24,36],spike:[18,28],nest:[34,54],bulwark:[42,68],seed:[24,38],hopperrock:[30,50],bloodcapsule:[28,42],bloodsac:[26,40],bloodmembrane:[34,52],bloodwreck:[30,48],resincolumn:[36,58],resinpanel:[32,50],resinwall:[42,66],resinnode:[28,44],prismcrystal:[30,46],iontower:[34,54],stormdebris:[28,46],electricnode:[24,40],sonicring:[28,44],sonicbell:[32,50],resonator:[30,48],acousticfragment:[34,54]}[type]||[26,40],size=rnd(baseSize[0],baseSize[1]);
  const hpScale={mine:.65,spore:.7,dustpod:.8,shard:.75,drone:.9,gate:1.4,pillar:1.8,bulwark:1.9,nest:1.5,hopperrock:1.3,spire:1.4,acidpod:1.1,seed:.9,cocoon:1.0,spike:.75,bloodcapsule:1.0,bloodsac:.9,bloodmembrane:1.2,bloodwreck:1.1,resincolumn:1.6,resinpanel:1.25,resinwall:1.9,resinnode:1.35,prismcrystal:1.1,iontower:1.4,stormdebris:.9,electricnode:1.0,sonicring:1.0,sonicbell:1.4,resonator:1.5,acousticfragment:1.2}[type]||1;
  const speedScale={mine:1.18,shard:1.28,drone:1.1,spore:1.05,gate:.82,pillar:.7,bulwark:.68,nest:.74,hopperrock:.9,seed:1.05,bloodcapsule:1.02,bloodsac:1.08,bloodmembrane:.8,bloodwreck:.95,resincolumn:.68,resinpanel:.78,resinwall:.62,resinnode:.82,prismcrystal:1.15,iontower:.78,stormdebris:1.22,electricnode:1.05,sonicring:1.0,sonicbell:.8,resonator:.76,acousticfragment:.96}[type]||1,hp=(92+G.sector*34)*hpScale;
  const edge=Math.random(),speed=(82+G.sector*4)*speedScale;let x,y,vx,vy,entry='right';
  if(edge<.66){x=W+size+20;y=rnd(72,H-72);vx=-speed;vy=rnd(-10,10);}
  else if(edge<.83){entry='top';x=rnd(W*.28,W*.94);y=-size-18;vx=-speed*.36;vy=speed*.82;}
  else{entry='bottom';x=rnd(W*.28,W*.94);y=H+size+18;vx=-speed*.36;vy=-speed*.82;}
  G.obstacles.push({x,y,r:size,type,hp,maxHp:hp,vx,vy,entry,rot:rnd(0,TAU),t:0,col:sec.base,contact:10+G.sector*2.3,assetIndex:obstacleAssetIndex(sec,type)});
}
function spawnPickup(x,y,type='credit',key=null){
  if(type==='credit'&&G.pickups){
    const near=G.pickups.find(q=>q.type==='credit'&&q.life>0&&dist(q,{x,y})<58&&(q.value||1)<6);
    if(near){near.value=(near.value||1)+1;near.life=Math.max(near.life,12);near.vx+=rnd(-6,6);near.vy+=rnd(-8,8);return near;}
  }
  const q={x,y,vx:rnd(-20,35),vy:rnd(-55,55),r:type==='power'?15:10,type,key,t:0,life:16,value:1};G.pickups.push(q);return q;
}
function maybeDrop(e){
  const r=Math.random(),ship=e&&e.kind==='ship';if(r<(ship?.32:.22))spawnPickup(e.x,e.y,'credit');else if(r<(ship?.36:.255))spawnPickup(e.x,e.y,'heal');else if(r<(ship?.40:.29))spawnPickup(e.x,e.y,'shield');
  G.powerMeter+=1;if(G.powerMeter>=Math.max(6,11-G.wave)){G.powerMeter=0;spawnPickup(e.x,e.y,'power',pickPowerDrop());}
}
function activatePower(key,source='pickup',heritageSeconds=null){
  const p=POWERS[key];if(!p)return;G.powerRanks=G.powerRanks||{};const cap=powerRankCap();let rank=G.powerRanks[key]||0;
  if(source==='heritage')rank=Math.max(rank,Math.min(cap,2));
  else if(source==='pickup'){rank=rank?Math.min(cap,rank+1):1;}
  else if(!rank)rank=1;
  G.powerRanks[key]=rank;
  if(INSTANT_POWERS.has(key)){triggerBomb(rank);notify(`${p.icon} ${p.name} ${rankRoman(rank)} · DETONACIÓN`,p.color,1.5);return;}
  const durationBase=heritageSeconds!=null?heritageSeconds:p.duration,duration=durationBase*POWER_DURATION_MULT*(1+(rank-1)*.12);
  if(G.powers[key]){G.powers[key]=Math.min(p.duration*POWER_DURATION_MULT*2.8,(G.powers[key]||0)+duration);if(key==='resinwall')G.resinCharges=Math.min(6,(G.resinCharges||0)+1);AudioX.power(key);notify(`${p.icon} ${p.name} ${rankRoman(rank)} · ${Math.ceil(G.powers[key])}s`,p.color,1.8);burst(G.player.x,G.player.y,p.color,18+rank*2,140);powerActivationVfx(key);updateComboState();return;}
  if((G.powerQueue||[]).includes(key)){AudioX.queue();notify(`COLA MEJORADA · ${p.icon} ${p.name} ${rankRoman(rank)}`,p.color,1.6);return;}
  if(countActivePowers()>=G.maxActivePowers){if((G.powerQueue||[]).length>=G.maxQueuePowers){notify('RESERVA DE PODERES LLENA','#ff7f92',1.4);AudioX.deny();return;}G.powerQueue.push(key);AudioX.queue();notify(`EN COLA · ${p.icon} ${p.name} ${rankRoman(rank)}`,p.color,1.8);return;}
  G.powers[key]=duration;if(key==='shield')G.player.shield=Math.min(G.player.maxShield,G.player.shield+30+rank*8);if(key==='resinwall')G.resinCharges=1+rank;AudioX.power(key);notify(`${source==='heritage'?'HERENCIA · ':''}${p.icon} ${p.name} ${rankRoman(rank)} · ${Math.ceil(G.powers[key])}s`,p.color,2.1);burst(G.player.x,G.player.y,p.color,20+rank*2,140);powerActivationVfx(key);updateComboState();
}
function powerOn(key){return (G.powers[key]||0)>0;}

function firePlayer(){
  const p=G.player,target=findTarget();if(!target)return;const dx=target.x-p.x,dy=target.y-p.y,ang=Math.atan2(dy,dx),lv=G.level||1,tr=powerOn('twin')?powerRank('twin'):0,br=powerOn('burst')?powerRank('burst'):0,comboBurst=G.activeCombos[comboId('overdrive','twin')]?1.18:1,baseDmg=24*(1+up('damage')*.10)*(1+(lv-1)*.08)*(1+(G.sector-1)*.05)*comboBurst*(1+(tr+br)*.035);
  const speed=720+Math.min(220,lv*16);let shots=[0];
  if(powerOn('prismburst'))shots=powerRank('prismburst')>=3?[-.28,-.14,0,.14,.28]:powerRank('prismburst')>=2?[-.18,-.09,0,.09,.18]:[-.12,0,.12];else if(G.activeCombos[comboId('rail','twin')]||G.activeCombos[comboId('burst','twin')]||tr>=3||br>=3)shots=[-.24,-.12,0,.12,.24];else if(powerOn('twin'))shots=[-.13,0,.13];else if(powerOn('burst'))shots=br>=2?[-.13,0,.13]:[-.09,0,.09];
  const tier=lv>=10?3:lv>=6?2:lv>=3?1:0,baseCol=powerOn('prismburst')?'#78ecff':powerOn('burst')?'#ffbf8d':tier>=3?'#e8fdff':tier===2?'#a8f7ff':'#78f4ff';
  for(const off of shots){const a=ang+off,rr=4+tier*.7;G.bullets.push({x:p.x+Math.cos(a)*25,y:p.y+Math.sin(a)*25,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:rr,dmg:baseDmg*(shots.length>1?(shots.length>=5?.52:.76):1),life:1.7,col:baseCol,type:tier>=3?'spark':tier>=2?'pulse':'needle',pierce:(G.activeCombos[comboId('rail','twin')]?1:0)+(tr>=3?1:0)+(powerOn('prismburst')?powerRank('prismburst'):0)+(lv>=10&&Math.random()<.2?1:0),slow:powerOn('cryo')?.34:0,splash:powerOn('acid')?42+powerRank('acid')*8:0,trail:16+tier*10,core:tier});}
  const muzzleX=p.x+Math.cos(ang)*28,muzzleY=p.y+Math.sin(ang)*28;G.particles.push({kind:'muzzle',x:muzzleX,y:muzzleY,a:ang,r:5+tier*2,life:.09,max:.09,col:baseCol});if(tier>=2&&Math.random()<.45)G.particles.push({kind:'spark',x:muzzleX,y:muzzleY,vx:rnd(-40,70),vy:rnd(-60,60),r:1.5,life:.14,max:.14,col:'#d8fbff'});AudioX.shot();
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
  const t=findTarget();if(!t)return;const p=G.player,rank=powerRank('missile'),shots=Math.max(rank,G.activeCombos[comboId('gravity','missile')]?2:1);
  for(let i=0;i<shots;i++){const off=(i-(shots-1)/2)*14;G.bullets.push({x:p.x+14,y:p.y+off,vx:350+rank*22,vy:rnd(-35,35)+off*2,r:6.5+rank*.5,dmg:58*(1+rank*.18)*(1+up('damage')*.08)*(1+(G.level-1)*.05),life:3,col:'#ff8a53',type:'missile',homing:true,target:t,pierce:0,splash:(G.activeCombos[comboId('gravity','missile')]?70:50)+rank*8});}
}
function fireRail(){
  const t=findTarget();if(!t)return;const p=G.player,a=Math.atan2(t.y-p.y,t.x-p.x),rank=powerRank('rail');G.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*(1080+rank*60),vy:Math.sin(a)*(1080+rank*60),r:4.5+rank*.6,dmg:92*(1+rank*.26)*(1+up('damage')*.1),life:1.05,col:'#73ffd1',type:'rail',pierce:3+rank,splash:0});shake=Math.max(shake,2.5+rank*.6);AudioX.sparkLaser();
}
function teslaPulse(){
  const rank=powerRank('tesla'),count=(G.activeCombos[comboId('cryo','tesla')]?5:3)+rank;const candidates=[...(G.boss?[G.boss]:[]),...G.enemies].filter(Boolean).sort((a,b)=>dist(G.player,a)-dist(G.player,b)).slice(0,count);if(!candidates.length)return;
  let prev=G.player;for(const e of candidates){const dmg=(28+rank*8)*(1+up('damage')*.08);damageEntity(e,dmg,'tesla');if((G.activeCombos[comboId('cryo','tesla')]||rank>=3)&&e!==G.boss)e.slow=Math.max(e.slow,1.3+rank*.3);G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:e.x,y2:e.y,life:.12,max:.12,col:'#8edbff'});prev=e;}
}
function gravityPulse(){
  const p=G.player,rank=powerRank('gravity'),acidCombo=G.activeCombos[comboId('acid','gravity')],radius=(acidCombo?245:205)+rank*35;G.particles.push({kind:'ring',x:p.x,y:p.y,r:10,vr:520+rank*45,life:.45,max:.45,col:acidCombo?'#b8ff77':'#b58cff'});
  for(const e of G.enemies){if(dist(p,e)<radius){e.x=lerp(e.x,p.x,.14+rank*.02);e.y=lerp(e.y,p.y,.14+rank*.02);damageEntity(e,(18+rank*8)*(1+up('damage')*.08),acidCombo?'acid':'gravity');}}
  if(G.boss&&dist(p,G.boss)<radius+40)damageEntity(G.boss,(28+rank*10)*(1+up('damage')*.08),acidCombo?'acid':'gravity');
}
function resonancePulse(){const p=G.player,rank=powerRank('resonance'),radius=150+rank*35;G.particles.push({kind:'shock',x:p.x,y:p.y,r:8,vr:460+rank*45,life:.55,max:.55,col:'#d9a7ff'});for(const e of G.enemies){if(!e.dead&&dist(p,e)<radius){damageEntity(e,22+rank*11,'resonance');e.x+=Math.sign(e.x-p.x||1)*(14+rank*5);}}if(G.boss&&dist(p,G.boss)<radius+60)damageEntity(G.boss,20+rank*9,'resonance');for(const b of G.eBullets){if(Math.hypot(b.x-p.x,b.y-p.y)<radius){b.life=0;}}AudioX.tone(190+rank*35,.12,.025,'sine',0,120);}
function fireSupportVolley(){
  const p=G.player,count=supportCount(),target=findTarget();if(!count||!target)return;
  const boosted=powerOn('burst')||powerOn('overdrive')||G.activeCombos[comboId('burst','drone')];
  for(let i=0;i<count;i++){
    const orb=supportOrbit(i,count),role=orb.role,t=findTarget()||target,ang=Math.atan2(t.y-orb.y,t.x-orb.x),inf=maybeSupportInfusion();
    if(role==='orbiter'){
      if(Math.random()<.32){const near=[...(G.boss?[G.boss]:[]),...G.enemies].filter(Boolean).sort((a,b)=>dist(orb,a)-dist(orb,b))[0];if(near){damageEntity(near,16*(1+up('damage')*.04),inf==='tesla'?'tesla':'normal');G.particles.push({kind:'arc',x:orb.x,y:orb.y,x2:near.x,y2:near.y,life:.1,max:.1,col:'#9eeeff'});}else G.player.shield=Math.min(G.player.maxShield,G.player.shield+1.5);}continue;
    }
    if(role==='lancer'){
      if((inf==='missile'||powerOn('missile'))&&Math.random()<.3){G.bullets.push({x:orb.x,y:orb.y,vx:Math.cos(ang)*320,vy:Math.sin(ang)*320,r:5,dmg:34*(1+up('damage')*.07),life:2.3,col:'#ff985e',type:'missile',homing:true,target:t,pierce:0,splash:38});continue;}
      G.bullets.push({x:orb.x,y:orb.y,vx:Math.cos(ang)*(boosted?1040:920),vy:Math.sin(ang)*(boosted?1040:920),r:3.8,dmg:28*(1+up('damage')*.07),life:1.0,col:inf==='cryo'?'#c8f7ff':'#8affdb',type:'rail',pierce:1+(powerOn('rail')?1:0),splash:inf==='acid'?24:0,slow:inf==='cryo'?.5:0});AudioX.sparkLaser();continue;
    }
    let shots=powerOn('twin')||G.level>=6?[-.08,0,.08]:[0];if(G.activeCombos[comboId('burst','drone')]||((powerOn('burst')||G.level>=11)&&i%2===0))shots=[-.15,-.075,0,.075,.15];
    if(inf==='tesla'&&Math.random()<.2){damageEntity(t,20*(1+up('damage')*.05),'tesla');G.particles.push({kind:'arc',x:orb.x,y:orb.y,x2:t.x,y2:t.y,life:.12,max:.12,col:'#8edbff'});continue;}
    for(const off of shots){const a=ang+off;G.bullets.push({x:orb.x+Math.cos(a)*9,y:orb.y+Math.sin(a)*9,vx:Math.cos(a)*(boosted?710:640),vy:Math.sin(a)*(boosted?710:640),r:3.1,dmg:13*(1+up('damage')*.06)*(shots.length>=5?.53:shots.length>=3?.72:1),life:1.5,col:inf==='acid'?'#b6ff75':inf==='cryo'?'#c8f7ff':'#e8fbff',type:'wing',pierce:0,slow:inf==='cryo'?.6:0,splash:inf==='acid'?25:0});}
  }
  AudioX.droneShot(boosted);
}

function enemyShoot(e,style='aim'){const p=G.player,a=Math.atan2(p.y-e.y,p.x-e.x);if(style==='spread'){for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.19,235+G.sector*4,8,5,e.family==='MOSQUITOS'?'#ff6175':e.family==='LIBÉLULAS'?'#78ecff':e.family==='CIGARRAS'?'#d9a7ff':'#ff6b78',e);}else spawnEnemyBullet(e.x,e.y,a,260+G.sector*5,9,5,e.family==='MOSQUITOS'?'#ff6175':e.family==='LIBÉLULAS'?'#78ecff':e.family==='CIGARRAS'?'#d9a7ff':'#ff6b78',e);}
function spawnEnemyBullet(x,y,a,speed=260,dmg=10,r=5,col='#ff6b78',source=null){const bd=G?.mode==='training'?.72:sectorBalance().enemyDmg;G.eBullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,dmg:dmg*bd,life:5,col,source});}
function ringBullets(x,y,count,speed,dmg,col='#ff768e',offset=0){for(let i=0;i<count;i++){const a=offset+i/count*TAU;spawnEnemyBullet(x,y,a,speed,dmg,5,col);}}

function damageEntity(e,dmg,kind='normal'){
  if(!e||e.dead)return;if(e===G.boss&&relicUnlocked(10))dmg*=1.05;if(e===G.boss&&e.guardT>0)dmg*=.35;e.hp-=dmg;e.flash=.08;AudioX.hit();AudioX.impact(G?.level||1,e===G.boss);
  const col=e===G.boss?(BOSS_SKILLS[e.pattern]?.color||SECTORS[G.sector-1].accent):(kind==='cryo'?'#c6f6ff':kind==='acid'?'#b5ff76':'#eefcff');for(let i=0;i<(e===G.boss?5:2);i++)G.particles.push({kind:'spark',x:e.x+rnd(-e.r*.25,e.r*.25),y:e.y+rnd(-e.r*.25,e.r*.25),vx:rnd(-90,90),vy:rnd(-90,90),r:rnd(1,3.5),life:rnd(.12,.28),max:.28,col});
  if(powerOn('hemadrain')&&kind!=='bomb'){const rank=powerRank('hemadrain'),heal=Math.min(1.8+rank*.8,dmg*(.018+rank*.008));const pp=G.player;if(pp.hp<pp.maxHp)pp.hp=Math.min(pp.maxHp,pp.hp+heal);else pp.shield=Math.min(pp.maxShield,pp.shield+heal*.7);}
  if(e===G.boss)G.bossHitT=.32;
  if(e!==G.boss&&kind==='cryo')e.slow=Math.max(e.slow,1.4);
  if(e.hp<=0){if(e===G.boss)killBoss();else killEnemy(e);}
}
function killEnemy(e){if(e.dead)return;e.dead=true;const fm=G.frenzyT>0?G.frenzyMult:1;G.score+=Math.round(e.score*(1+Math.min(1.5,G.combo*.03))*fm);G.kills++;G.combo++;G.comboT=2.2;gainXp(Math.round(xpForEnemy(e)*fm));if(G.frenzyT>0){G.frenzyKills=(G.frenzyKills||0)+1;if(!G.frenzyDone&&G.frenzyKills>=G.frenzyTarget)completeFrenzy();if(Math.random()<.18)spawnPickup(e.x,e.y,'credit');}maybeDrop(e);burst(e.x,e.y,SECTORS[G.sector-1].accent,10,130);}
function killBoss(){
  const b=G.boss;if(!b||b.dead)return;b.dead=true;AudioX.bossDie();burst(b.x,b.y,SECTORS[G.sector-1].accent,72,300);shake=15;flash=1;
  const training=G.mode==='training',replay=G.bossCheckpoint,mastery=!training&&(G.bossHits||0)===0,baseReward=training?0:Math.round((540+G.sector*150)*sectorBalance().reward*(replay?.58:1)),masteryBonus=mastery?Math.round(baseReward*(replay?.55:.32)):0;G.score+=training?2200:6000+G.sector*2600+masteryBonus*5;G.credits+=baseReward+masteryBonus;G.bonusCredits+=(masteryBonus||0);META.credits=G.credits;G.bossMasteryAchieved=mastery;if(mastery){META.bossMastery[G.sector]=true;notify(`MAESTRÍA DE JEFE · SIN IMPACTOS · +¤${masteryBonus}`,'#fff09a',2.5);}if(!training)gainXp(170+G.sector*65+(mastery?60:0));
if(!training&&G.mode!=='bossRush'&&RELICS[G.sector]&&!relicUnlocked(G.sector)){const r=RELICS[G.sector],bonus=180+G.sector*35;META.relics[G.sector]=true;G.lastRelic=G.sector;G.credits+=bonus;G.bonusCredits+=bonus;META.credits=G.credits;if(G.sector===7){G.player.maxHp+=8;G.player.hp=Math.min(G.player.maxHp,G.player.hp+8);}if(G.sector===8){G.player.maxShield+=10;G.player.shield=Math.min(G.player.maxShield,G.player.shield+10);}notify(`${r.icon} RELIQUIA · ${r.name} · +¤${bonus}`,r.color,3.0);}
  if(G.mode==='bossRush'){const time=Math.max(.1,(G.elapsed||0)-(G.bossStartElapsed||0)),hits=G.bossHits||0,grade=bossRushGrade(time,hits,G.sector),bonus=Math.round((55+G.sector*14)*(RUSH_GRADE_VALUE[grade]||1));G.bossRushResults=G.bossRushResults||[];G.bossRushResults.push({sector:G.sector,grade,time,hits});G.credits+=bonus;G.bonusCredits+=bonus;META.credits=G.credits;notify(`RANGO ${grade} · ${time.toFixed(1)}s · ${hits} IMPACTOS · +¤${bonus}`,grade==='S'?'#fff09a':grade==='A'?'#a6ff5f':grade==='B'?'#8edbff':'#c0a3ff',2.4);}
  if(!training&&G.mode!=='bossRush'){META.bosses=(META.bosses||0)+1;META.defeated=META.defeated||{};META.defeated[G.sector]=true;META.unlocked=Math.max(META.unlocked,Math.min(SECTORS.length,G.sector+1));META.hiScore=Math.max(META.hiScore,G.score);G.hiScore=META.hiScore;const heritage=HERITAGE_BY_SECTOR[G.sector];if(heritage){G.heritageNext=heritage;META.bossUnlocks[G.sector]=heritage;G.lastBossDrop=heritage;G.heritageNext=heritage;spawnPickup(b.x,b.y,'power',heritage);notify(`PODER DE JEFE · ${HERITAGE_NAMES[G.sector]||POWERS[heritage].name}`,'#ffd76a',2.6);}}
  if(G.mode==='bossRush'){G.bossRushScore=(G.bossRushScore||0)+1;META.hiScore=Math.max(META.hiScore,G.score);G.hiScore=META.hiScore;}
  if(!training&&G.mode==='campaign'&&G.sector===SECTORS.length){
    G.campaignComplete=true;G.finalReward=Math.round(1400*sectorBalance().reward);G.credits+=G.finalReward;G.score+=24000;G.bonusCredits+=G.finalReward;META.credits=G.credits;META.campaignWins=(META.campaignWins||0)+1;META.bestCampaignScore=Math.max(META.bestCampaignScore||0,G.score);notify(`NÚCLEO OMEGA ASEGURADO · +¤${G.finalReward}`,'#fff09a',3.2);notify('BOSS RUSH DESBLOQUEADO','#d9a7ff',3.2);
  }
  const drops=training?2:replay?5:8;for(let i=0;i<drops;i++)spawnPickup(b.x+rnd(-70,70),b.y+rnd(-70,70),'credit');if(!training){spawnPickup(b.x+rnd(-45,45),b.y+rnd(-45,45),'heal');spawnPickup(b.x+rnd(-45,45),b.y+rnd(-45,45),'shield');for(let i=0;i<(replay?1:2);i++)spawnPickup(b.x+rnd(-55,55),b.y+rnd(-55,55),'power',pickPowerDrop());}
  saveMeta();if(G.mode!=='bossRush')try{localStorage.removeItem(KEY_RUN);}catch(_){}G.sectorClear=true;G.postBossT=G.mode==='bossRush'?3.2:(training?4.2:(G.campaignComplete?8.0:6.5));G.postBossMax=G.postBossT;G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;notify(G.mode==='bossRush'?`BOSS ${G.sector}/10 DERROTADO · RECOGE Y AVANZA`:training?'PRÁCTICA COMPLETADA · RECOGE LOS RESTOS':'ZONA SEGURA · RECOGE LOS PREMIOS','#a6ff5f',2.4);
}

function hitPlayer(dmg){const p=G.player;if(p.inv>0)return;if(powerOn('resinwall')&&(G.resinCharges||0)>0){G.resinCharges--;burst(p.x,p.y,'#ffd56a',18,160);G.particles.push({kind:'shock',x:p.x,y:p.y,r:12,vr:320,life:.45,max:.45,col:'#ffd56a'});if(G.resinCharges<=0)delete G.powers.resinwall;AudioX.tone(280,.12,.035,'triangle',0,-70);return;}G.waveHits=(G.waveHits||0)+1;if(G.boss)G.bossHits=(G.bossHits||0)+1;if(G.mode==='training')dmg*=.52;if(p.shield>0){const take=Math.min(p.shield,dmg);p.shield-=take;dmg-=take;}if(dmg>0)p.hp-=dmg;p.inv=.55;G.heartHitT=.55;AudioX.hurt();shake=Math.max(shake,7);flash=Math.max(flash,.45);burst(p.x,p.y,'#ff5b73',14,160);if(p.hp/p.maxHp<=.10&&!G.critWarned){G.critWarned=true;notify('PELIGRO · INTEGRIDAD CRÍTICA','#ff5b73',2.2);}if(p.hp>p.maxHp*.10)G.critWarned=false;if(p.hp<=0)gameOver();}
function gameOver(){AudioX.stopBoss();G.hiScore=Math.max(G.hiScore,G.score);META.hiScore=Math.max(META.hiScore,G.hiScore);META.credits=G.credits;saveMeta();setScreen('DEAD');}
function burst(x,y,col,count=10,speed=100){for(let i=0;i<count;i++){const a=rnd(0,TAU),s=rnd(speed*.3,speed);G.particles.push({kind:'dot',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rnd(1.5,4.5),life:rnd(.25,.7),max:.7,col});}}

// ─────────────────────────────────────────────────────────────
// UPDATE LOOP
// ─────────────────────────────────────────────────────────────
let timers={missile:0,rail:0,tesla:0,gravity:0,drone:0,resonance:0};
function update(dt){
  if(!G||G.screen!=='GAME'||W<H)return;
  G.elapsed+=dt;for(const n of notices)n.t-=dt;notices=notices.filter(n=>n.t>0);if(G.waveBanner>0)G.waveBanner-=dt;if(G.sectorBanner>0)G.sectorBanner-=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}
  G.bossHitT=Math.max(0,(G.bossHitT||0)-dt);G.heartHitT=Math.max(0,(G.heartHitT||0)-dt);G.bossWarningT=Math.max(0,(G.bossWarningT||0)-dt);if(G.frenzyT>0){G.frenzyT=Math.max(0,G.frenzyT-dt);if(G.frenzyT<=0){G.frenzyMult=1;notify(G.frenzyDone?'FRENESÍ COMPLETADO':'FRENESÍ ESCAPÓ','#9fb4c5',1.3);}}
  if(G.postBossT>0){G.postBossT=Math.max(0,G.postBossT-dt);G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;updatePowers(dt);updatePlayer(dt);updatePickups(dt);updateParticles(dt);if(G.postBossT<=0||(G.postBossT<G.postBossMax-1.6&&G.pickups.length===0)){if(G.mode==='bossRush')advanceBossRush();else setScreen('VICTORY');}return;}
  updatePowers(dt);updatePlayer(dt);updateSpawns(dt);updateEnemies(dt);updateBoss(dt);updateObstacles(dt);updateFrontThreats(dt);updateBullets(dt);updateEnemyBullets(dt);updatePickups(dt);updateParticles(dt);
  if(!G.boss&&!G.bossPending&&!G.sectorClear&&G.kills>=Math.ceil(G.goal*.58)&&G.frenzyWave!==G.wave)activateFrenzy();
  if(shake>0)shake=Math.max(0,shake-dt*18);if(flash>0)flash=Math.max(0,flash-dt*1.8);
  if(!G.sectorClear&&G.kills>=G.goal&&!G.boss&&G.enemies.filter(e=>!e.dead).length===0){
    if(G.mode==='training'){if(!G.bossPending){G.bossPending=true;G.trainingBoss=true;setTimeout(()=>{if(G?.screen==='GAME'&&G.bossPending&&!G.boss)spawnBoss();},650);}}
    else if(G.wave<3){awardWaveClear();G.wave++;G.kills=0;G.goal=waveGoal(G.sector,G.wave);G.spawn=.9;G.waveBanner=2.2;G.player.shield=Math.min(G.player.maxShield,G.player.shield+15);G.credits+=waveTransitionReward(G.sector,G.wave);gainXp(45+G.sector*12);G.waveHits=0;G.waveFrontKills=0;G.waveStartT=G.elapsed;G.frenzyKills=0;G.frenzyTarget=0;G.frenzyDone=false;saveRun();notify(`ORDA ${G.wave}/3 · PRESIÓN AUMENTADA`,'#ffd76a',2.0);}
    else if(!G.bossPending){awardWaveClear();G.bossPending=true;setTimeout(()=>{if(G?.screen==='GAME'&&G.bossPending&&!G.boss)spawnBoss();},750);}
  }
}
function updatePowers(dt){
  for(const k of Object.keys(G.powers)){G.powers[k]-=dt;if(G.powers[k]<=0)delete G.powers[k];}
  pumpPowerQueue();updateComboState();
  timers.missile-=dt;timers.rail-=dt;timers.tesla-=dt;timers.gravity-=dt;timers.drone-=dt;timers.resonance-=dt;
  if(powerOn('missile')&&timers.missile<=0){timers.missile=(G.activeCombos[comboId('gravity','missile')]?.56:.82)/(1+(powerRank('missile')-1)*.16);fireMissile();}
  if(powerOn('rail')&&timers.rail<=0){timers.rail=(G.activeCombos[comboId('rail','twin')]?1.12:1.52)/(1+(powerRank('rail')-1)*.13);fireRail();}
  if(powerOn('tesla')&&timers.tesla<=0){timers.tesla=(G.activeCombos[comboId('cryo','tesla')]?.68:.94)/(1+(powerRank('tesla')-1)*.16);teslaPulse();}
  if(powerOn('gravity')&&timers.gravity<=0){timers.gravity=1.9-(powerRank('gravity')-1)*.22;gravityPulse();}
  if(powerOn('shield')&&G.player.shield<G.player.maxShield)G.player.shield=Math.min(G.player.maxShield,G.player.shield+dt*(2.8+powerRank('shield')*1.4));
  if(powerOn('resonance')&&timers.resonance<=0){timers.resonance=Math.max(.72,1.45-(powerRank('resonance')-1)*.22);resonancePulse();}
}
function updatePlayer(dt){
  const p=G.player,a=axes(),lv=G.level||1;p.inv=Math.max(0,p.inv-dt);
  const lvlSpeed=1+Math.min(.28,(lv-1)*.026),speed=285*(1+up('engine')*.05)*(relicUnlocked(9)?1.04:1)*lvlSpeed*(powerOn('overdrive')?(1.18+powerRank('overdrive')*.08):1),responseBase=Math.max(.00008,.001*Math.pow(.82,lv-1)),responseBoost=1+up('dash')*.03,response=1-Math.pow(responseBase,dt*responseBoost);
  p.vx=lerp(p.vx,a.x*speed,response);p.vy=lerp(p.vy,a.y*speed,response);if(Math.abs(a.x)<.05)p.vx*=Math.pow(.72,dt*60*(1+lv*.025)*responseBoost);if(Math.abs(a.y)<.05)p.vy*=Math.pow(.72,dt*60*(1+lv*.025)*responseBoost);p.x+=p.vx*dt;p.y+=p.vy*dt;
  p.x=clamp(p.x,28,W-28);p.y=clamp(p.y,44,H-30);
  const rate=Math.max(.052,.19*(1-up('rate')*.055)*(powerOn('overdrive')?(0.82-powerRank('overdrive')*.05):1)*(powerOn('burst')?(0.86-powerRank('burst')*.05):1)*(1-Math.min(.16,(lv-1)*.008)));p.fire-=dt;if(p.fire<=0){p.fire=rate;firePlayer();}
  const count=supportCount();if(count>0&&timers.drone<=0){timers.drone=supportRate();fireSupportVolley();}
}
function updateSpawns(dt){
  if(G.boss||G.bossPending||G.sectorClear)return;G.spawn-=dt;G.obstacleTimer-=dt;G.frontTimer-=dt;G.formationTimer=(G.formationTimer??rnd(5.5,8.5))-dt;
  const bal=sectorBalance(),alive=G.enemies.filter(e=>!e.dead).length,maxAlive=Math.round((7.2+G.sector*.92+G.wave*2.05)*bal.maxAlive*1.10*(G.frenzyT>0?1.30:1)*(G.mode==='training'?.62:1));
  if(G.wave>=2&&G.formationTimer<=0&&G.kills<G.goal-3&&alive<maxAlive-2){spawnFormation();G.formationTimer=rnd(G.wave===3?5.2:6.8,G.wave===3?7.5:9.4);}
  if(G.spawn<=0&&G.kills<G.goal&&alive<maxAlive){
    const chance=G.wave===3?.42:G.wave===2?.24:.08;let burstCount=1;if(Math.random()<chance)burstCount=(G.wave===3&&Math.random()<.34)?3:2;
    for(let i=0;i<burstCount&&G.enemies.filter(e=>!e.dead).length<maxAlive;i++)spawnEnemy();
    G.spawn=Math.max(.13,.91-difficulty()*.101-G.wave*.064)*rnd(.66,1.02)*(G.frenzyT>0?.66:1)*(G.mode==='training'?1.15:1)/bal.pressure;
  }
  if(G.obstacleTimer<=0&&G.obstacles.length<(G.mode==='training'?1:(G.sector===1?3:5))){spawnObstacle();G.obstacleTimer=rnd(G.sector===1?2.7:2.1,G.sector===1?4.4:3.8)/Math.min(1.58,difficulty());}
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
    if(e.dead)continue;e.t+=dt;if(updateEnemyEntry(e,dt))continue;if(e.kind==='ship'){updateEnemyShip(e,dt,p);continue;}e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);e.surgeT=Math.max(0,(e.surgeT||0)-dt);const sm=e.slow>0?.54:1;let vx=-e.spd,vy=0;
    if(e.surgeT>0){vx=e.surgeVX;vy=e.surgeVY;}else switch(e.move){
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
    e.fireCd-=dt;if(e.fireCd<=0&&e.fireRate<10){e.fireCd=e.fireRate*rnd(.85,1.2);enemyShoot(e,(e.form==='bomber'||e.form==='shocker'||e.form==='sonic'||e.form==='sonic_cantor'||e.form==='resonance_breaker'||e.form==='hemodrone')?'spread':'aim');}
    if(e.specialCd<900){e.specialCd-=dt;if(e.specialCd<=0){
      if(e.form==='needler'){const a=Math.atan2(p.y-e.y,p.x-e.x);e.surgeVX=Math.cos(a)*e.spd*2.65;e.surgeVY=Math.sin(a)*e.spd*2.65;e.surgeT=.34;e.specialCd=rnd(2.0,3.0);AudioX.tone(690,.06,.018,'triangle');}
      else if(e.form==='hemodrone'){ringBullets(e.x,e.y,6,155,6,'#ff6175',e.t);e.specialCd=rnd(2.3,3.3);}
      else if(e.form==='bloodreaper'){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.12,305,9,5,'#ff4965',e);if(G.obstacles.length<8){const hp=105+G.sector*18;G.obstacles.push({x:e.x-15,y:e.y+rnd(-30,30),r:25,type:'bloodcapsule',hp,maxHp:hp,vx:-70,vy:rnd(-15,15),entry:'drop',rot:rnd(0,TAU),t:0,col:'#8f1728',contact:16+G.sector,assetIndex:0});}e.specialCd=rnd(2.8,4.0);}
      else if(e.form==='mandible_guard'){if(G.obstacles.length<8){const hp=140+G.sector*25;G.obstacles.push({x:e.x-18,y:e.y,r:31,type:'resinpanel',hp,maxHp:hp,vx:-35,vy:0,entry:'guard',rot:0,t:0,col:'#9b641a',contact:17+G.sector,assetIndex:1});}e.specialCd=rnd(3.2,4.5);}
      else if(e.form==='siegebuilder'&&G.obstacles.length<8){spawnObstacle();e.specialCd=rnd(3.0,4.4);}
      else if(e.form==='prism_hunter'){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-2;k<=2;k++)spawnEnemyBullet(e.x,e.y,a+k*.085,330,8,4,'#78ecff',e);e.specialCd=rnd(1.7,2.6);}
      else if(e.form==='lance_predator'){const a=Math.atan2(p.y-e.y,p.x-e.x);e.surgeVX=Math.cos(a)*e.spd*2.9;e.surgeVY=Math.sin(a)*e.spd*2.9;e.surgeT=.42;for(let i=0;i<4;i++)G.particles.push({kind:'slash',x:e.x-i*18,y:e.y,a:0,len:30+i*8,life:.18,max:.18,col:'#78ecff'});e.specialCd=rnd(2.0,3.1);AudioX.sparkLaser();}
      else if(e.form==='nymph_echo'){ringBullets(e.x,e.y,5,140,6,'#c18cff',e.t);setTimeout(()=>{if(G?.screen==='GAME'&&!e.dead)ringBullets(e.x,e.y,5,165,6,'#f2d277',e.t+.3);},180);e.specialCd=rnd(2.4,3.5);}
      else if(e.form==='sonic_cantor'||e.form==='resonance_breaker'){ringBullets(e.x,e.y,e.form==='resonance_breaker'?10:7,145+(e.form==='resonance_breaker'?28:0),7+(e.form==='resonance_breaker'?2:0),'#d9a7ff',e.t);e.specialCd=rnd(2.2,3.4);}
    }}
    if(dist(e,p)<e.r+p.r){hitPlayer(e.contact);e.x+=45;}
    if(e.x<-80){if(e.form==='flashwing'&&(e.passes||0)<1){e.passes=(e.passes||0)+1;e.x=W+55;e.y=clamp(H-e.y+rnd(-45,45),45,H-45);e.entryT=.18;e.specialCd=Math.min(e.specialCd||2,1.1);}else{e.dead=true;hitPlayer(7+G.sector*.8);}}
  }
  G.enemies=G.enemies.filter(e=>!e.dead&&e.x>-120);
}
function bossArenaHazard(b,p,sec){
  if(G.mode==='training'||G.postBossT>0)return;
  if(b.pattern==='blood'){
    const ys=[H*.24,H*.5,H*.76];for(const y of ys){for(let k=-1;k<=1;k++)spawnEnemyBullet(W+10,y,Math.PI+k*.035,230+b.phase*22,8+b.phase,'#ff4965');}
    if(b.phase>=2&&G.obstacles.length<5){const old=G.sector;spawnObstacle();G.sector=old;}
    G.particles.push({kind:'halo',x:W*.58,y:H*.5,r:18,vr:220,life:.8,max:.8,col:'#ff6175'});notify('ARENA · MAREA HEMÁTICA','#ff6175',1.2);
  }else if(b.pattern==='architect'){
    for(let i=0;i<Math.min(3,b.phase+1);i++){const hp=150+G.sector*28;G.obstacles.push({x:W*.55+i*W*.12,y:i%2?H*.68:H*.32,r:34,type:i===2?'resinnode':'resinwall',hp,maxHp:hp,vx:-28,vy:0,entry:'arena',rot:0,t:0,col:sec.base,contact:18+G.sector,assetIndex:0});}
    b.guardT=Math.max(b.guardT,.8+b.phase*.25);notify('ARENA · FORTIFICACIÓN VIVA','#ffd56a',1.2);
  }else if(b.pattern==='odonata'){
    const lanes=[H*.22,H*.42,H*.62,H*.82],safe=rndI(0,lanes.length-1);for(let i=0;i<lanes.length;i++){if(i===safe)continue;const y=lanes[i];G.particles.push({kind:'slash',x:W*.52,y,a:0,len:W*.92,life:.48,max:.48,col:'#78ecff'});for(let k=0;k<7;k++)spawnEnemyBullet(W-k*95,y+rnd(-5,5),Math.PI,380+b.phase*28,8+b.phase*.6,4,'#9af7ff');}
    notify('ARENA · CORREDOR DE TORMENTA','#78ecff',1.15);
  }else if(b.pattern==='resonance'){
    const centers=[[W*.32,H*.28],[W*.48,H*.72],[W*.66,H*.32]];for(const [x,y] of centers){G.particles.push({kind:'shock',x,y,r:10,vr:360,life:.7,max:.7,col:'#d9a7ff'});ringBullets(x,y,8+b.phase*2,125+b.phase*18,7+b.phase*.7,'#d9a7ff',b.t);}
    if(b.phase===3&&G.enemies.length<5){const oldSec=G.sector;const legacy=SECTORS[rndI(0,8)];spawnEnemy(legacy.forms[1],b.x-50,rnd(H*.2,H*.8),'summon');G.enemies[G.enemies.length-1].family=legacy.family;}
    notify('ARENA · ECO CATEDRAL','#d9a7ff',1.15);
  }
}
function bossSignatureMovement(b,p,sec,dt){
  b.signatureCd=(b.signatureCd??3.5)-dt;b.signatureT=Math.max(0,(b.signatureT||0)-dt);b.afterimageT=Math.max(0,(b.afterimageT||0)-dt);
  if(b.pattern==='blood'){
    if(b.signatureT>0){const tx=clamp(p.x+W*.23,W*.46,W*.78),ty=clamp(p.y+b.signatureSide*H*.22,90,H-90);b.x=lerp(b.x,tx,clamp(dt*3.8,0,1));b.y=lerp(b.y,ty,clamp(dt*4.2,0,1));if(Math.random()<dt*18)G.particles.push({kind:'spark',x:b.x+rnd(-26,26),y:b.y+rnd(-34,34),vx:rnd(-120,20),vy:rnd(-70,70),r:rnd(1,3),life:.25,max:.25,col:'#ff6175'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.9+.16*b.phase;b.signatureSide*=-1;b.signatureCd=Math.max(2.4,5.0-b.phase*.55);AudioX.tone(185,.14,.035,'sine',0,110);return false;}
  }else if(b.pattern==='architect'){
    if(b.phase>=2&&b.signatureCd<=0){const types=b.phase===3?['resinwall','resinnode','resinwall']:['resinwall','resinnode'];for(let i=0;i<types.length;i++){const hp=170+G.sector*30;G.obstacles.push({x:W*(.52+i*.12),y:(i%2?H*.68:H*.30),r:types[i]==='resinnode'?28:38,type:types[i],hp,maxHp:hp,vx:-16,vy:0,entry:'fortress',rot:0,t:0,col:sec.base,contact:19+G.sector,assetIndex:i});}b.guardT=Math.max(b.guardT,1.15+b.phase*.22);b.signatureCd=Math.max(3.8,7.4-b.phase*.7);bossVfx(b,'#ffd56a',12);return false;}
  }else if(b.pattern==='odonata'){
    if(b.signatureT>0){const q=1-b.signatureT/(.58+.08*b.phase),ease=clamp(q,0,1);b.x=lerp(b.sigX0,b.sigX1,ease);b.y=lerp(b.sigY0,b.sigY1,ease);if(Math.random()<dt*35)G.particles.push({kind:'slash',x:b.x-rnd(15,55),y:b.y,a:0,len:rnd(45,110),life:.16,max:.16,col:'#78ecff'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.58+.08*b.phase;b.sigX0=W*.82;b.sigY0=b.signatureSide>0?H*.18:H*.82;b.sigX1=W*.38;b.sigY1=b.signatureSide>0?H*.82:H*.18;b.signatureSide*=-1;b.signatureCd=Math.max(1.8,4.2-b.phase*.55);AudioX.sparkLaser();return true;}
  }else if(b.pattern==='resonance'){
    if(b.signatureT>0){b.x=lerp(b.x,b.anchorX,clamp(dt*3.2,0,1));b.y=lerp(b.y,b.anchorY,clamp(dt*3.2,0,1));if(Math.random()<dt*9)G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.35,vr:180,life:.4,max:.4,col:'#d9a7ff'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){const anchors=[[W*.48,H*.25],[W*.72,H*.28],[W*.52,H*.72],[W*.76,H*.68]];const a=pick(anchors);b.anchorX=a[0];b.anchorY=a[1];b.signatureT=.7;b.signatureCd=Math.max(2.5,5.4-b.phase*.65);ringBullets(b.x,b.y,6+b.phase*2,130+b.phase*18,7,'#c18cff',b.t);return false;}
  }
  return false;
}
function updateBoss(dt){
  const b=G.boss;if(!b||b.dead)return;b.t+=dt;b.wingT+=dt;b.fire-=dt;b.specialCd-=dt;b.arenaCd=(b.arenaCd??5)-dt;b.specialT=Math.max(0,b.specialT-dt);b.guardT=Math.max(0,b.guardT-dt);b.flash=Math.max(0,(b.flash||0)-dt);b.animPulse=Math.max(0,(b.animPulse||0)-dt);b.phaseFlash=Math.max(0,(b.phaseFlash||0)-dt);
  const ratio=b.hp/b.maxHp,newPhase=ratio>.68?1:ratio>.34?2:3;if(newPhase!==b.phase){b.phase=newPhase;b.specialCd=.72;b.signatureCd=.25;b.animPulse=1.25;b.phaseFlash=.9;b.altNext=newPhase>=2;const phaseName=BOSS_PHASE_NAMES[b.pattern]?.[newPhase-1];notify(`FASE ${newPhase}${phaseName?' · '+phaseName:''} · ${b.name}`,'#ffbd6a',2);AudioX.bossPhase(G.sector-1);AudioX.bossAttack(G.sector-1,true);shake=10;const sec=SECTORS[G.sector-1];bossPhaseBurst(b,sec);ringBullets(b.x,b.y,8+newPhase*3,185+newPhase*28,8+newPhase,sec.accent,b.t);if(G.mode!=='training')for(let i=0;i<newPhase;i++)spawnEnemy(sec.forms[Math.min(1,newPhase-1)],b.x-35,b.y+rnd(-95,95));}
  if(b.entry>0){b.entry-=dt;b.x=lerp(b.x,W*.68,1-Math.pow(.01,dt));b.y=H*.5+Math.sin(b.t*3)*18;bossVfx(b,BOSS_SKILLS[b.pattern]?.color||'#fff',Math.random()<.18?2:0);return;}
  const p=G.player,sec=SECTORS[G.sector-1],phaseSpeed=(1+(b.phase-1)*.2)*(G.bossCheckpoint?1.12:1);
  if(Math.random()<dt*(1.6+b.phase*.45))bossVfx(b,BOSS_SKILLS[b.pattern]?.color||sec.accent,1);
  if(b.arenaCd<=0&&G.sector>=7){bossArenaHazard(b,p,sec);b.arenaCd=Math.max(2.6,6.2-b.phase*.72-G.sector*.12-(G.mode==='bossRush'?.45:0));}
  if(b.telegraphT>0){b.telegraphT-=dt;b.animPulse=Math.max(b.animPulse,.42);b.x+=Math.sin(b.t*18)*10*dt;if(b.telegraphT<=0)executeBossSpecial(b,p,sec);return;}
  if(b.chargeT>0){b.chargeT-=dt;b.x+=b.chargeVX*dt;b.y+=b.chargeVY*dt;if(dist(b,p)<b.r+p.r+10)hitPlayer(24+G.sector*2.6);if(b.chargeT<=0){b.x=clamp(b.x,W*.38,W*.86);b.specialCd=Math.max(1.9,2.7-b.phase*.16);}return;}
  if(bossSignatureMovement(b,p,sec,dt))return;
  if(b.specialCd<=0){let key=bossPrimarySkill(b.pattern);if(b.phase>=2&&(b.altNext||Math.random()<.5)){key=bossSecondarySkill(b.pattern);b.altNext=false;}else if(b.phase>=2)b.altNext=true;if(key){startBossWarning(b,key,b.phase===3?.72:(b.pattern==='titan'?1.0:.82));b.specialCd=Math.max(G.bossCheckpoint?1.45:1.85,4.55-b.phase*.62-G.sector*.08-(G.bossCheckpoint?.28:0));return;}}
  switch(b.pattern){
    case 'queen':b.x=W*.65+Math.sin(b.t*.82)*W*.17;b.y=H*.5+Math.sin(b.t*1.7)*H*.29;if(b.fire<=0){b.fire=Math.max(.34,.80/phaseSpeed);ringBullets(b.x,b.y,7+b.phase*3,200+b.phase*24,8+b.phase,sec.accent,b.t*.72);if(Math.random()<.66)spawnEnemy(pick(sec.forms.slice(0,b.phase>=3?3:2)),b.x-30,b.y+rnd(-92,92));}break;
    case 'moth':b.y=H*.5+Math.sin(b.t*3.15)*H*.33;b.x=W*.64+Math.sin(b.t*1.28)*W*.18;if(b.fire<=0){b.fire=Math.max(.36,.68-.08*b.phase);enemyShoot(b,'spread');for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,Math.PI+k*.14,190+25*b.phase,7+b.phase*.6,5,'#e9d5ff');if(b.phase===3&&Math.random()<.42)spawnEnemy(pick(sec.forms),b.x-30,b.y+rnd(-95,95));}break;
    case 'blade':{const a=Math.atan2(p.y-b.y,p.x-b.x);b.x=W*.65+Math.sin(b.t*1.7)*W*.17;b.y=H*.5+Math.sin(b.t*2.95)*H*.27;if(b.fire<=0){b.fire=Math.max(.31,.58-.065*b.phase);for(let k=-2;k<=2;k++)spawnEnemyBullet(b.x,b.y,a+k*.11,295+28*b.phase,8+b.phase*.7,4.5,'#ff9a55');if(b.phase>=2)G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*1.65,life:.16,max:.16,col:'#ff9a55'});}break;}
    case 'titan':b.x=W*.66+Math.sin(b.t*.82)*W*.15;b.y=H*.5+Math.sin(b.t*1.3)*H*.25;if(b.fire<=0){b.fire=Math.max(.35,.62-.055*b.phase);enemyShoot(b,b.phase>1?'spread':'aim');if(b.phase>=2&&Math.random()<.72)ringBullets(b.x,b.y,8+b.phase*2,165+20*b.phase,8,sec.accent,b.t);if(b.phase===3&&Math.random()<.38)spawnEnemy(sec.forms[1],b.x-35,b.y+rnd(-100,100));}break;
    case 'storm':b.y=H*.5+Math.sin(b.t*2.8)*H*.35;b.x=W*.64+Math.sin(b.t*1.85)*W*.18;if(b.fire<=0){b.fire=Math.max(.29,.52-.05*b.phase);enemyShoot(b,'spread');if(b.phase>1)ringBullets(b.x,b.y,7+b.phase*3,220+18*b.phase,9,'#ffe66f',b.t*2.6);if(b.phase===3&&Math.random()<.5)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-30,b.y+rnd(-100,100));}break;
    case 'leap':{const leap=(Math.sin(b.t*2.9)+1)*.5;b.x=W*.76-leap*W*.32;b.y=H*.5+Math.sin(b.t*2.9)*H*.36;if(b.fire<=0){b.fire=Math.max(.34,.66-.06*b.phase);ringBullets(b.x,b.y,7+b.phase*3,215+20*b.phase,9.5,sec.accent,b.t);if(b.phase>1&&Math.random()<.34)spawnEnemy(pick(sec.forms),b.x-25,b.y+rnd(-88,88));}break;}
    case 'blood':{b.x=W*.62+Math.sin(b.t*1.55)*W*.22;b.y=H*.5+Math.sin(b.t*2.6)*H*.34;if(b.fire<=0){b.fire=Math.max(.25,.49-.05*b.phase);enemyShoot(b,b.phase>=2?'spread':'aim');if(b.phase>=2&&Math.random()<.55)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-25,b.y+rnd(-110,110));}break;}
    case 'architect':{b.x=W*.67+Math.sin(b.t*.58)*W*.13;b.y=H*.5+Math.sin(b.t*1.05)*H*.22;if(b.fire<=0){b.fire=Math.max(.36,.67-.055*b.phase);ringBullets(b.x,b.y,8+b.phase*2,150+18*b.phase,9,'#ffd56a',b.t);if(b.phase>=2&&Math.random()<.34)spawnEnemy('termite_worker',b.x-25,b.y+rnd(-90,90));}break;}
    case 'odonata':{const sweep=(Math.sin(b.t*3.3)+1)*.5;b.x=W*.78-sweep*W*.42;b.y=H*.5+Math.sin(b.t*4.2)*H*.37;if(b.fire<=0){b.fire=Math.max(.22,.46-.045*b.phase);const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=-1;k<=1;k++)spawnEnemyBullet(b.x,b.y,a+k*.08,350+30*b.phase,9,4,'#78ecff');}break;}
    case 'resonance':{b.x=W*.62+Math.sin(b.t*.72)*W*.20;b.y=H*.5+Math.sin(b.t*1.22)*H*.30;if(b.fire<=0){b.fire=Math.max(.3,.58-.05*b.phase);ringBullets(b.x,b.y,10+b.phase*3,165+22*b.phase,9,'#d9a7ff',b.t*.75);if(b.phase===3&&Math.random()<.42)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-25,b.y+rnd(-105,105));}break;}
  }
  b.x=clamp(b.x,W*.36,W*.86);b.y=clamp(b.y,70,H-70);if(dist(b,p)<b.r+p.r)hitPlayer(25+G.sector*2.5);
}
function updateObstacles(dt){
  const p=G.player;
  for(const o of G.obstacles){
    o.t+=dt;o.x+=o.vx*dt;o.y+=(o.vy||0)*dt;o.rot+=dt*.4;
    if(o.type==='mine'){o.y+=Math.sin(o.t*4+o.r)*18*dt; if(dist(o,p)<o.r+42){o.hp=0;hitPlayer(16+G.sector);ringBullets(o.x,o.y,6,190,7,'#ffe16b',o.rot);}}
    if(o.type==='acidpod'&&dist(o,p)<o.r+46){o.hp=0;hitPlayer(18+G.sector);ringBullets(o.x,o.y,10,175,8,'#c9ff77',o.rot);}
    if(o.type==='spore'&&dist(o,p)<o.r+48){o.hp=0;hitPlayer(17+G.sector);ringBullets(o.x,o.y,8,180,7,'#c9ff77',o.rot);}
    if(o.type==='dustpod'&&dist(o,p)<o.r+52){o.hp=0;hitPlayer(15+G.sector);for(let k=-2;k<=2;k++)spawnEnemyBullet(o.x,o.y,Math.PI+k*.18,170,7,5,'#e9d5ff');}
    if(o.type==='drone'&&o.t>1.2&&Math.sin(o.t*2.1)>.985){spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x),255,8,5,'#9ee8ff');}
    if(o.type==='seed'&&o.t>1.4&&Math.sin(o.t*3.1)>.992){spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x),220,8,5,'#ebff77');}
    if(o.type==='bloodcapsule'&&o.t>1.1&&Math.sin(o.t*3.6)>.994){ringBullets(o.x,o.y,6,165,7,'#ff6175',o.rot);}
    if(o.type==='bloodsac'&&dist(o,p)<o.r+46){hitPlayer(14+G.sector);o.hp-=22;}
    if(o.type==='resinnode'&&o.t>1.6&&Math.sin(o.t*2.2)>.995&&G.enemies.length<18){spawnEnemy('termite_worker',o.x-20,o.y+rnd(-38,38));}
    if(o.type==='electricnode'&&o.t>1.0&&Math.sin(o.t*3.8)>.993){for(let k=-1;k<=1;k++)spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x)+k*.12,285,9,4,'#78ecff');}
    if(o.type==='sonicring'&&o.t>1.3&&Math.sin(o.t*2.9)>.994){ringBullets(o.x,o.y,8,170,8,'#d9a7ff',o.rot);}
    if(o.type==='resonator'&&o.t>1.5&&Math.sin(o.t*2.4)>.994){ringBullets(o.x,o.y,10,145,8,'#f2d277',o.rot);}
    if(dist(o,p)<o.r+p.r){hitPlayer(o.contact||12);p.x-=18;}
    if(o.hp<=0){o.dead=true;burst(o.x,o.y,o.col,14,150);
      if(['cocoon','nest'].includes(o.type)&&Math.random()<.55)spawnPickup(o.x,o.y,'power',pickPowerDrop());
      else if(['mine','dustpod','seed'].includes(o.type)&&Math.random()<.38)spawnPickup(o.x,o.y,'shield');
      else if(Math.random()<.42)spawnPickup(o.x,o.y,'credit');
    }
  }
  G.obstacles=G.obstacles.filter(o=>!o.dead&&o.x>-160&&o.x<W+180&&o.y>-180&&o.y<H+180);
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
  const p=G.player;for(const b of G.eBullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life>0&&dist(b,p)<b.r+p.r){b.life=0;const src=b.source,wasHp=p.hp,wasSh=p.shield;hitPlayer(b.dmg);if(src&&!src.dead&&src.family==='MOSQUITOS'){const drained=Math.max(0,(wasHp+wasSh)-(p.hp+p.shield));src.hp=Math.min(src.maxHp,src.hp+drained*.42);G.particles.push({kind:'arc',x:p.x,y:p.y,x2:src.x,y2:src.y,life:.16,max:.16,col:'#ff6175'});}}}
  G.eBullets=G.eBullets.filter(b=>b.life>0&&b.x>-80&&b.x<W+80&&b.y>-80&&b.y<H+80);
}
function updatePickups(dt){
  const p=G.player,mag=70+up('magnet')*18+(powerOn('magnet')?100+powerRank('magnet')*65:0)+(G.postBossT>0?1200:0);
  for(const q of G.pickups){q.t+=dt;if(G.postBossT<=0)q.life-=dt;else q.life=Math.max(q.life,4);q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.94,dt*60);q.vy*=Math.pow(.94,dt*60);const d=dist(q,p);if(d<mag){const k=clamp(dt*(d<42?12:4.8),0,1);q.x=lerp(q.x,p.x,k);q.y=lerp(q.y,p.y,k);}if(d<p.r+q.r+5){collect(q);q.life=0;}}
  G.pickups=G.pickups.filter(q=>q.life>0);
}
function collect(q){
  if(q.type==='credit'){const frenzy=G.frenzyT>0?G.frenzyMult:1,stacks=Math.max(1,q.value||1),gain=Math.round(creditPickupBase()*economyMult()/sectorBalance().reward*frenzy*stacks);G.credits+=gain;META.credits=G.credits;G.score+=gain*3;gainXp(Math.round(gain*.62));AudioX.pickup();}
  else if(q.type==='heal'){G.player.hp=Math.min(G.player.maxHp,G.player.hp+24);AudioX.pickup();notify('+24 CASCO','#ff7791',1.2);}
  else if(q.type==='shield'){G.player.shield=Math.min(G.player.maxShield,G.player.shield+28);AudioX.pickup();notify('+28 ESCUDO','#7fb7ff',1.2);}
  else if(q.type==='power')activatePower(q.key,'pickup');
}
function updateParticles(dt){for(const p of G.particles){p.life-=dt;if(p.kind==='dot'||p.kind==='spark'){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;(p.vx)&&(p.vx*=Math.pow(.92,dt*60));(p.vy)&&(p.vy*=Math.pow(.92,dt*60));}else if(['ring','shock','halo','shieldwave'].includes(p.kind))p.r+=(p.vr||0)*dt;}G.particles=G.particles.filter(p=>p.life>0);}

// ─────────────────────────────────────────────────────────────
// DRAW — fondos planetarios, barreras y arte insectoide procedural
// ─────────────────────────────────────────────────────────────
function rr(x,y,w,h,r=12){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):(cx.rect(x,y,w,h));}
function drawBackground(){
  const sec=SECTORS[(G?.sector||1)-1]||SECTORS[0],t=G?.elapsed||performance.now()/1000,bossArena=!!(G?.boss||G?.bossPending||G?.bossCheckpoint),visualKey=bossArena&&sec.bossBg?sec.bossBg:(sec.worldBg||sec.bg);
  const img=IMG.bg[visualKey]||IMG.bg[sec.bg]||IMG.bg.rust;
  cx.fillStyle=sec.dark||'#050814';cx.fillRect(0,0,W,H);
  if(!imgReady(img)){const fg=cx.createRadialGradient(W*.58,H*.45,10,W*.5,H*.5,Math.max(W,H)*.75);fg.addColorStop(0,hexA(sec.base||sec.accent||'#27445c',.28));fg.addColorStop(.55,hexA(sec.dark||'#06101a',.88));fg.addColorStop(1,'#010307');cx.fillStyle=fg;cx.fillRect(0,0,W,H);}
  if(imgReady(img)){const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale,par=sec.worldBg?4:8,dx=(W-iw)/2+Math.sin(t*.07+(G?.sector||1))*par,dy=(H-ih)/2+Math.cos(t*.05+(G?.sector||1))*par*.6;cx.drawImage(img,dx,dy,iw,ih);}
  if(sec.worldBg)ambientWorldFx(sec,t);
  const vg=cx.createLinearGradient(0,0,0,H);vg.addColorStop(0,bossArena?'rgba(3,6,14,.12)':'rgba(3,6,14,.18)');vg.addColorStop(1,bossArena?'rgba(2,3,7,.34)':'rgba(2,3,7,.48)');cx.fillStyle=vg;cx.fillRect(0,0,W,H);
  const vignette=cx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.15,W*.5,H*.5,Math.max(W,H)*.7);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,bossArena?'rgba(0,0,0,.32)':'rgba(0,0,0,.42)');cx.fillStyle=vignette;cx.fillRect(0,0,W,H);
  if(!sec.worldBg){for(const st of stars){const drift=(sec.bg==='rift'?38:sec.bg==='toxic'?14:20)*st.z;let x=(st.x-t*drift)%(W+24);if(x<0)x+=W+24;cx.globalAlpha=sec.bg==='rift'?.10+.42*st.z:.04+.16*st.z;cx.fillStyle=sec.bg==='toxic'?hexA(sec.accent,.8):sec.bg==='rust'?'#ffd6a2':'#bde6ff';cx.beginPath();cx.arc(x,st.y,st.r*st.z,0,TAU);cx.fill();}}
  if(bossArena&&sec.worldBg){cx.globalAlpha=.10+.04*Math.sin(t*4);cx.strokeStyle=sec.accent;cx.lineWidth=2;cx.beginPath();cx.ellipse(W*.72,H*.5,W*.18,H*.30,0,0,TAU);cx.stroke();}
  cx.globalAlpha=1;
}

function drawShip(){
  const p=G.player,t=G.elapsed,a=axes();cx.save();cx.translate(p.x,p.y);
  const roll=clamp(a.x*.22,-.24,.24),pitch=clamp(a.y*.12,-.14,.14);cx.rotate(roll);
  if(p.inv>0&&Math.floor(p.inv*18)%2===0)cx.globalAlpha=.45;
  if(imgReady(IMG.ship)){
    const size=132;
    cx.drawImage(IMG.ship,-size/2,-size/2+pitch*40,size,size);
  }else{
    cx.fillStyle='#d8f8ff';cx.beginPath();cx.moveTo(0,-24);cx.lineTo(30,18);cx.lineTo(0,8);cx.lineTo(-30,18);cx.closePath();cx.fill();
  }
  cx.restore();
  if(p.shield>0||powerOn('shield')){cx.save();const pulse=.2+.1*Math.sin(t*6),crit=p.shield/p.maxShield<.2;cx.globalAlpha=pulse+.08;cx.strokeStyle=crit?'#ff8fa3':'#78bfff';cx.lineWidth=2;cx.beginPath();cx.arc(p.x,p.y,p.r+21,0,TAU);cx.stroke();cx.globalAlpha=.4;cx.strokeStyle=crit?'#ff627b':'#aee6ff';cx.lineWidth=3;for(let i=0;i<3;i++){cx.beginPath();cx.arc(p.x,p.y,p.r+26+i*4,t*1.4+i*.8,t*1.4+i*.8+Math.PI*.62);cx.stroke();}cx.restore();}
  if(powerOn('hemadrain')){cx.save();cx.globalAlpha=.18+.08*Math.sin(t*5);cx.fillStyle='#ff465f';cx.beginPath();cx.arc(p.x,p.y,p.r+18,0,TAU);cx.fill();cx.restore();}
  if(powerOn('resinwall')){cx.save();cx.strokeStyle='#ffd56a';cx.lineWidth=3;const n=Math.max(1,G.resinCharges||1);for(let i=0;i<n;i++){const a=t*.9+i/n*TAU,x=p.x+Math.cos(a)*(p.r+31),y=p.y+Math.sin(a)*(p.r+31);cx.save();cx.translate(x,y);cx.rotate(a);cx.strokeRect(-5,-9,10,18);cx.restore();}cx.restore();}
  if(powerOn('resonance')){cx.save();cx.globalAlpha=.22;cx.strokeStyle='#d9a7ff';for(let i=0;i<2;i++){cx.beginPath();cx.arc(p.x,p.y,p.r+28+i*11+Math.sin(t*4+i)*4,0,TAU);cx.stroke();}cx.restore();}
  const vmag=Math.hypot(p.vx,p.vy),speedFx=clamp(vmag/360,0,1),lv=G.level||1;if(speedFx>.12){cx.save();cx.strokeStyle=lv>=7?'rgba(170,246,255,.48)':'rgba(110,210,255,.38)';cx.lineWidth=1.2+speedFx;for(let i=0;i<4;i++){const yy=p.y-17+i*11,len=16+speedFx*28+Math.min(20,lv*1.4);cx.beginPath();cx.moveTo(p.x-28,yy);cx.lineTo(p.x-28-len,yy+rnd(-2,2));cx.stroke();}cx.restore();}
  const dc=supportCount();for(let i=0;i<dc;i++)drawDrone(p,i,dc,t);
}

function drawDrone(p,i,count,t){const orb=supportOrbit(i,count),a=orb.a,role=orb.role,img=IMG.support[role]||IMG.support.scout;cx.save();cx.translate(orb.x,orb.y);const aim=findTarget(),ang=aim?Math.atan2(aim.y-orb.y,aim.x-orb.x):a;cx.rotate(ang);cx.shadowColor=role==='lancer'?'#ffb06f':'#76efff';cx.shadowBlur=role==='orbiter'?16:10;const size=role==='orbiter'?27:role==='lancer'?35:31;if(imgReady(img))cx.drawImage(img,-size*.55,-size*.5,size*1.1,size);else{cx.fillStyle='#dfffff';cx.fillRect(-8,-4,16,8);}if(powerOn('drone')||powerOn('overdrive')){cx.globalAlpha=.55+.25*Math.sin(t*8+i);cx.strokeStyle=role==='lancer'?'#ffb06f':'#9af4ff';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,size*.62,0,TAU);cx.stroke();}cx.restore();
  cx.save();cx.strokeStyle=role==='orbiter'?'rgba(140,230,255,.26)':'rgba(135,232,255,.12)';cx.lineWidth=1;cx.beginPath();cx.arc(p.x,p.y,Math.hypot(orb.x-p.x,orb.y-p.y),a-.17,a+.17);cx.stroke();cx.restore();}

function enemySpriteCell(e,isBoss=false){
  const sec=SECTORS[Math.max(0,(G?.sector||1)-1)]||SECTORS[0];
  const col=FAMILY_COL[e.family||sec.family]??0;
  let row=0;
  if(isBoss) row=2;
  else if(sec.forms[1]===e.form || sec.forms[2]===e.form) row=1;
  return {col,row};
}
function drawBossAnatomy(e,sec){
  const r=e.r,t=G.elapsed,flap=Math.sin(t*(5+e.phase*.9)),col=BOSS_SKILLS[e.pattern]?.color||sec.accent;cx.save();cx.globalAlpha=.52;cx.strokeStyle=col;cx.fillStyle=hexA(col,.16);cx.lineWidth=2.5;
  if(e.pattern==='storm'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.16);cx.beginPath();cx.moveTo(8,-10);cx.lineTo(r*1.25,-r*.72);cx.lineTo(r*.62,2);cx.closePath();cx.fill();cx.stroke();cx.restore();}cx.beginPath();cx.moveTo(-r*.1,r*.48);cx.lineTo(0,r*1.28+flap*8);cx.lineTo(r*.1,r*.48);cx.stroke();}
  else if(e.pattern==='titan'){for(let i=0;i<4;i++){const a=t*.45+i*TAU/4;cx.beginPath();cx.arc(Math.cos(a)*r*.48,Math.sin(a)*r*.34,r*.34,0,TAU);cx.fill();cx.stroke();}if(e.guardT>0){cx.globalAlpha=.6+.2*Math.sin(t*12);cx.beginPath();cx.arc(0,0,r*1.35,0,TAU);cx.stroke();}}
  else if(e.pattern==='blade'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(-.35+flap*.18);cx.beginPath();cx.moveTo(r*.2,-r*.1);cx.lineTo(r*1.45,-r*.78);cx.lineTo(r*.72,r*.05);cx.closePath();cx.fill();cx.stroke();cx.restore();}}
  else if(e.pattern==='moth'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.12);cx.beginPath();cx.ellipse(r*.62,-r*.1,r*.72,r*.48,-.35,0,TAU);cx.fill();cx.stroke();cx.beginPath();cx.arc(r*.78,-r*.12,r*.11,0,TAU);cx.stroke();cx.restore();}}
  else if(e.pattern==='queen'){for(let i=0;i<3;i++){const a=-.55+i*.55+flap*.05;cx.beginPath();cx.moveTo(-r*.1,r*.15);cx.lineTo(Math.cos(a)*r*1.25,Math.sin(a)*r*1.0);cx.stroke();cx.beginPath();cx.moveTo(r*.1,r*.15);cx.lineTo(-Math.cos(a)*r*1.25,Math.sin(a)*r*1.0);cx.stroke();}cx.beginPath();cx.ellipse(0,r*.62,r*.52,r*.72,0,0,TAU);cx.fill();cx.stroke();}
  else if(e.pattern==='leap'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.beginPath();cx.moveTo(r*.15,r*.25);cx.lineTo(r*.95,r*.72+flap*9);cx.lineTo(r*1.28,r*.35);cx.stroke();cx.restore();}}
  else if(e.pattern==='blood'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.18);cx.beginPath();cx.moveTo(r*.15,-r*.1);cx.lineTo(r*1.28,-r*.78);cx.lineTo(r*.86,r*.08);cx.closePath();cx.fill();cx.stroke();cx.restore();}cx.beginPath();cx.ellipse(0,r*.58,r*.34,r*.72,0,0,TAU);cx.stroke();cx.globalAlpha=.7+.25*Math.sin(t*8);cx.beginPath();cx.moveTo(0,-r*.2);cx.lineTo(-r*.95,r*.98);cx.stroke();}
  else if(e.pattern==='architect'){for(let i=0;i<4;i++){const a=t*.52+i*TAU/4,rr=r*(.62+(i%2)*.2);cx.beginPath();cx.arc(Math.cos(a)*rr,Math.sin(a)*r*.56,r*.16,0,TAU);cx.stroke();cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(a)*rr,Math.sin(a)*r*.56);cx.stroke();}if(e.guardT>0){cx.globalAlpha=.7+.2*Math.sin(t*10);cx.beginPath();cx.arc(0,0,r*1.46,0,TAU);cx.stroke();}}
  else if(e.pattern==='odonata'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.24);cx.beginPath();cx.ellipse(r*.64,-r*.2,r*.96,r*.18,-.18,0,TAU);cx.fill();cx.stroke();cx.beginPath();cx.ellipse(r*.52,r*.18,r*.78,r*.14,.18,0,TAU);cx.stroke();cx.restore();}cx.globalAlpha=.45;for(let i=1;i<=3;i++){cx.beginPath();cx.moveTo(-r*(.5+i*.28),-r*.12);cx.lineTo(-r*(.1+i*.18),-r*.12);cx.stroke();}}
  else if(e.pattern==='resonance'){for(let i=0;i<4;i++){cx.globalAlpha=.35+i*.12;cx.beginPath();cx.arc(0,0,r*(.66+i*.20)+Math.sin(t*(2.6+i*.25)+i)*5,t*.45+i,t*.45+i+Math.PI*1.45);cx.stroke();}cx.globalAlpha=.7+.25*Math.sin(t*6);cx.beginPath();cx.arc(0,0,r*.34,0,TAU);cx.stroke();}
  cx.restore();
}
function drawContainedSprite(img,maxW,maxH){
  if(!imgReady(img))return false;const ar=img.naturalWidth/img.naturalHeight;let dw=maxW,dh=dw/ar;if(dh>maxH){dh=maxH;dw=dh*ar;}cx.drawImage(img,-dw/2,-dh/2,dw,dh);return true;
}
function drawInsect(e,isBoss=false,preview=false,scaleMul=1){
  const sec=SECTORS[G.sector-1],r=e.r;
  const bob=Math.sin((e.t||0)*(isBoss?3.4:6) + e.x*.01)*(isBoss?8:3);
  cx.save();cx.translate(e.x,e.y+bob);if(isBoss){const flap=Math.sin(G.elapsed*(5.5+e.phase*.8)),pulse=1+(e.animPulse||0)*.12+(e.telegraphT>0?Math.sin(G.elapsed*22)*.065:0);cx.scale(pulse*(1+flap*.035*e.phase),pulse*(1-flap*.018));cx.rotate(e.chargeT>0?Math.atan2(e.chargeVY,e.chargeVX)*.12:Math.sin(G.elapsed*(1.5+e.phase*.12))*(.035+e.phase*.008));if(e.guardT>0){cx.shadowColor=sec.accent;cx.shadowBlur=28;}}
  if(e.flash>0){cx.shadowColor='#fff';cx.shadowBlur=18;}
  cx.fillStyle='rgba(0,0,0,.24)';cx.beginPath();cx.ellipse(0,r*.7,r*.9,r*.26,0,0,TAU);cx.fill();
  if(e.kind==='ship'){
    const img=IMG.generatedShips[e.shipVariant]||IMG.enemyShips.scout,dw=r*3.15*scaleMul,dh=r*2.4*scaleMul;
    if(imgReady(img)) cx.drawImage(img,-dw/2,-dh/2,dw,dh);
    else {cx.fillStyle='#8fd9ff';cx.fillRect(-r,-r*.4,r*2,r*.8);}
  }else if(isBoss){
    const familyPack=IMG.worldEnemies[e.family],img=familyPack?.[3],col=FAMILY_COL[e.family]??0,fallback=IMG.enemyCells[2]?.[col],box=r*3.2*scaleMul;
    if(!drawContainedSprite(img,box,box)&&!drawContainedSprite(fallback,box,box))drawContainedSprite(IMG.atlas,box,box);
  }else{
    const row=clamp(enemyTier(e.form),0,2),tier=row,familyPack=IMG.worldEnemies[e.family],col=FAMILY_COL[e.family]??0,img=familyPack?.[row]||IMG.enemyCells[row]?.[col],box=r*[2.55,2.78,3.0][tier]*scaleMul;
    if(!drawContainedSprite(img,box,box)){cx.fillStyle=sec.base;cx.beginPath();cx.arc(0,0,r,0,TAU);cx.fill();}
  }/* isolated silhouettes prevent atlas-cell clipping */
  if(isBoss)drawBossAnatomy(e,sec);
  if(isBoss&&e.phaseFlash>0){cx.globalAlpha=e.phaseFlash*.45;cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,r*1.1,0,TAU);cx.fill();cx.globalAlpha=1;}
  if(isBoss&&e.telegraphT>0){cx.strokeStyle=BOSS_SKILLS[e.pattern]?.color||sec.accent;cx.lineWidth=4;cx.globalAlpha=.55+.35*Math.sin(G.elapsed*18);cx.beginPath();cx.arc(0,0,r*1.55,0,TAU);cx.stroke();cx.globalAlpha=1;}cx.restore();
  if(!isBoss&&e.kind!=='ship'&&enemyTier(e.form)===2){const w=r*2.0;cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(e.x-w/2,e.y+r*1.45,w,4);cx.fillStyle=sec.accent;cx.fillRect(e.x-w/2,e.y+r*1.45,w*clamp(e.hp/e.maxHp,0,1),4);}
  if(isBoss&&!preview){const w=Math.min(W*.46,500),hit=G.bossHitT||0,jx=Math.sin(G.elapsed*95)*8*hit,x=W/2-w/2+jx,y=112;cx.fillStyle='rgba(0,0,0,.58)';rr(x,y,w,14,7);cx.fill();cx.fillStyle=hit>0?`rgba(255,88,104,${.55+hit*.8})`:(e.guardT>0?'#aaff72':sec.accent);rr(x+2,y+2,(w-4)*clamp(e.hp/e.maxHp,0,1),10,5);cx.fill();cx.textAlign='center';cx.font='700 12px system-ui';cx.fillStyle=hit>0?'#ffb5bf':'#fff';cx.fillText(`${sec.family} // ${e.name} // FASE ${e.phase} // ${Math.max(0,e.hp/e.maxHp*100).toFixed(1)}%`,W/2+jx,y-7);cx.textAlign='left';}
}

function drawObstacle(o){const sec=SECTORS[G.sector-1];cx.save();cx.translate(o.x,o.y);cx.rotate(o.rot);const themed=worldObstacleAsset(sec,o.type),pack=IMG.generatedObstacles[sec.bg]||IMG.generatedObstacles.rift,img=themed||pack[o.assetIndex??0]||IMG.obstacles[obstacleSpriteKey(o.type)];
  cx.globalAlpha=.97;cx.fillStyle='rgba(0,0,0,.26)';cx.beginPath();cx.ellipse(0,o.r*.68,o.r*.95,o.r*.26,0,0,TAU);cx.fill();
  if(imgReady(img)){const scaleMul=(o.type==='gate'||o.type==='bulwark')?2.85:(o.type==='mine'||o.type==='spike'||o.type==='seed')?2.05:2.45;const d=o.r*scaleMul;cx.drawImage(img,-d/2,-d/2,d,d);}else{cx.fillStyle=hexA(sec.base,.7);cx.beginPath();cx.arc(0,0,o.r,0,TAU);cx.fill();}
  if(o.type==='mine'){cx.globalAlpha=.35+.28*Math.sin(o.t*8);cx.strokeStyle='#ffe177';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,o.r*1.1,0,TAU);cx.stroke();cx.globalAlpha=1;}
  const hp=clamp(o.hp/o.maxHp,0,1);if(hp<.98){cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(-o.r*.75,o.r*1.08,o.r*1.5,4);cx.fillStyle=sec.accent;cx.fillRect(-o.r*.75,o.r*1.08,o.r*1.5*hp,4);}cx.restore();
}
function drawPowerAura(key,col,t,r){cx.save();cx.strokeStyle=col;cx.fillStyle=col;cx.globalAlpha=.32+.18*Math.sin(t*7);cx.lineWidth=2;
  if(key==='twin'||key==='burst'){const n=key==='burst'?5:3;for(let i=0;i<n;i++){const a=-.55+i*(1.1/(n-1||1));cx.save();cx.rotate(a);cx.beginPath();cx.moveTo(r*.7,0);cx.lineTo(r*1.35,0);cx.stroke();cx.restore();}}
  else if(key==='tesla'){for(let i=0;i<3;i++){const a=t*2+i*TAU/3;cx.beginPath();cx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);cx.lineTo(Math.cos(a+.35)*r*1.3,Math.sin(a+.35)*r*1.3);cx.stroke();}}
  else if(key==='rail'){cx.lineWidth=3;cx.beginPath();cx.moveTo(-r*1.3,0);cx.lineTo(r*1.3,0);cx.stroke();}
  else if(key==='cryo'){for(let i=0;i<6;i++){const a=i*TAU/6;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(a)*r*1.2,Math.sin(a)*r*1.2);cx.stroke();}}
  else if(key==='gravity'){for(let i=0;i<3;i++){cx.beginPath();cx.arc(0,0,r*(.8+i*.18),t*.7+i,t*.7+i+Math.PI*.9);cx.stroke();}}
  else if(key==='bomb'){for(let i=0;i<8;i++){const a=i*TAU/8;cx.beginPath();cx.moveTo(Math.cos(a)*r*.8,Math.sin(a)*r*.8);cx.lineTo(Math.cos(a)*r*1.45,Math.sin(a)*r*1.45);cx.stroke();}}
  else if(key==='hemadrain'){cx.beginPath();cx.moveTo(0,-r*1.25);cx.bezierCurveTo(r*.9,-r*.2,r*.65,r*.8,0,r*1.1);cx.bezierCurveTo(-r*.65,r*.8,-r*.9,-r*.2,0,-r*1.25);cx.stroke();}
  else if(key==='resinwall'){for(let i=0;i<4;i++){const a=t+i*TAU/4;cx.strokeRect(Math.cos(a)*r*.95-4,Math.sin(a)*r*.95-7,8,14);}}
  else if(key==='prismburst'){for(let i=-2;i<=2;i++){cx.beginPath();cx.moveTo(-r*.8,i*3);cx.lineTo(r*1.35,i*7);cx.stroke();}}
  else if(key==='resonance'){for(let i=0;i<3;i++){cx.beginPath();cx.arc(0,0,r*(.7+i*.25),t*.4+i,t*.4+i+Math.PI*1.5);cx.stroke();}}
  else {cx.beginPath();cx.arc(0,0,r*1.18,0,TAU);cx.stroke();}
  cx.restore();}
function powerActivationVfx(key){const pd=POWERS[key];if(!pd||!G)return;const p=G.player;G.particles.push({kind:key==='gravity'?'shock':'halo',x:p.x,y:p.y,r:12,vr:key==='gravity'?520:330,life:.55,max:.55,col:pd.color});if(['tesla','rail','burst','twin','bomb','hemadrain','resinwall','prismburst','resonance'].includes(key))for(let i=0;i<10;i++){const a=i/10*TAU;G.particles.push({kind:'spark',x:p.x,y:p.y,vx:Math.cos(a)*rnd(70,180),vy:Math.sin(a)*rnd(70,180),r:rnd(1.2,2.8),life:rnd(.18,.38),max:.38,col:pd.color});}}
function drawPickup(q){cx.save();cx.translate(q.x,q.y);const compact=compactUI(),pulse=1+Math.sin(q.t*8)*(compact?.08:.14);cx.scale(pulse,pulse);let key=q.type;if(q.type==='power')key=q.key;const img=powerAsset(key);
  if(imgReady(img)){const d=q.type==='power'?(compact?38:48):(compact?28:40);cx.drawImage(img,-d/2,-d/2,d,d);}else{cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,q.r,0,TAU);cx.fill();}
  let col='#ffd76a',icon='¤';if(q.type==='heal'){col='#ff6d89';icon='✚';}if(q.type==='shield'){col='#78bfff';icon='⬡';}if(q.type==='power'){const pd=POWERS[q.key];col=pd?.color||'#fff';icon=pd?.icon||'✦';drawPowerAura(q.key,col,q.t,compact?q.r*.75:q.r);}
  if(!compact||q.type==='power'){cx.strokeStyle=col;cx.globalAlpha=.26+.15*Math.sin(q.t*7);cx.lineWidth=compact?1.3:2;cx.beginPath();cx.arc(0,0,q.r+(compact?5:8),0,TAU);cx.stroke();cx.globalAlpha=1;}
  if(q.type==='credit'&&(q.value||1)>1){cx.fillStyle='#fff3a5';cx.font='900 8px system-ui';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(`×${q.value}`,0,compact?13:17);}
  if(q.type==='power'){const current=G.powerRanks?.[q.key]||0,next=INSTANT_POWERS.has(q.key)?Math.max(1,current):Math.min(powerRankCap(),current?current+1:1);cx.fillStyle=col;cx.font=`900 ${compact?9:11}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(icon,0,-3);cx.font=`900 ${compact?6:7}px system-ui`;cx.fillStyle='#fff';cx.fillText(rankRoman(next),0,compact?6:8);}cx.restore();cx.textAlign='left';cx.textBaseline='alphabetic';}


function drawProjectile(b,enemy=false){cx.save();cx.strokeStyle=b.col||'#fff';cx.fillStyle=b.col||'#fff';cx.shadowColor=b.col||'#fff';cx.shadowBlur=enemy?5:10;if(!enemy&&b.trail){const sp=Math.hypot(b.vx,b.vy)||1;cx.globalAlpha=.38;cx.lineWidth=Math.max(1,b.r*.9);cx.beginPath();cx.moveTo(b.x-b.vx/sp*b.trail,b.y-b.vy/sp*b.trail);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=1;}
  if(b.type==='rail'){cx.lineWidth=4;cx.beginPath();cx.moveTo(b.x-b.vx*.035,b.y-b.vy*.035);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=.7;cx.beginPath();cx.arc(b.x,b.y,2.7,0,TAU);cx.fill();}
  else if(b.type==='missile'){cx.translate(b.x,b.y);cx.rotate(Math.atan2(b.vy,b.vx));cx.fillRect(-8,-3,13,6);cx.fillStyle='#fff';cx.fillRect(3,-1,5,2);}
  else if(!enemy&&b.type==='pulse'){cx.beginPath();cx.ellipse(b.x,b.y,b.r*1.75,b.r*.72,Math.atan2(b.vy,b.vx),0,TAU);cx.fill();cx.globalAlpha=.7;cx.fillStyle='#fff';cx.beginPath();cx.arc(b.x,b.y,b.r*.42,0,TAU);cx.fill();}
  else if(!enemy&&b.type==='spark'){const a=Math.atan2(b.vy,b.vx);cx.translate(b.x,b.y);cx.rotate(a);cx.lineWidth=2.2;cx.beginPath();cx.moveTo(-b.r*2.4,0);cx.lineTo(b.r*1.4,0);cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(b.r*.65,0,b.r*.5,0,TAU);cx.fill();}
  else{cx.beginPath();cx.arc(b.x,b.y,b.r,0,TAU);cx.fill();}cx.restore();}
function drawParticles(){let pi=0;const compact=compactUI(),dense=compact&&G.particles.length>90;for(const p of G.particles){pi++;if(dense&&p.kind==='dot'&&pi%2===0)continue;const a=clamp(p.life/(p.max||.7),0,1);cx.save();cx.globalAlpha=a;if(p.kind==='dot'){cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*a,0,TAU);cx.fill();}
  else if(p.kind==='spark'){cx.strokeStyle=p.col;cx.lineWidth=Math.max(.8,p.r*a);cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-(p.vx||0)*.035,p.y-(p.vy||0)*.035);cx.stroke();}
  else if(p.kind==='ring'||p.kind==='shock'||p.kind==='halo'||p.kind==='shieldwave'){cx.strokeStyle=p.col;cx.lineWidth=(p.kind==='shock'?5:p.kind==='shieldwave'?4:3)*a;cx.beginPath();cx.arc(p.x,p.y,p.r,0,TAU);cx.stroke();if(p.kind==='shock'){cx.globalAlpha=a*.25;cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*.76,0,TAU);cx.fill();}}
  else if(p.kind==='arc'){cx.strokeStyle=p.col;cx.lineWidth=2;cx.beginPath();cx.moveTo(p.x,p.y);const mx=(p.x+p.x2)/2+rnd(-15,15),my=(p.y+p.y2)/2+rnd(-15,15);cx.lineTo(mx,my);cx.lineTo(p.x2,p.y2);cx.stroke();}
  else if(p.kind==='slash'){cx.translate(p.x,p.y);cx.rotate(p.a||0);cx.strokeStyle=p.col;cx.lineWidth=6*a;cx.beginPath();cx.moveTo(-p.len*.25,0);cx.lineTo(p.len*.75,0);cx.stroke();cx.globalAlpha=a*.35;cx.lineWidth=16*a;cx.stroke();}
  else if(p.kind==='orb'){cx.fillStyle=p.col;cx.shadowColor=p.col;cx.shadowBlur=16;cx.beginPath();cx.arc(p.x,p.y,p.r*(.7+.3*Math.sin(G.elapsed*12)),0,TAU);cx.fill();}
  else if(p.kind==='muzzle'){cx.translate(p.x,p.y);cx.rotate(p.a||0);cx.fillStyle=p.col;cx.beginPath();cx.moveTo(0,0);cx.lineTo(-p.r*2,-p.r*.65);cx.lineTo(-p.r*1.3,0);cx.lineTo(-p.r*2,p.r*.65);cx.closePath();cx.fill();}
  cx.restore();}}

function drawGame(){
  UI.buttons.length=0;drawBackground();cx.save();if(shake>0)cx.translate(rnd(-shake,shake),rnd(-shake*.65,shake*.65));
  for(const o of G.obstacles)drawObstacle(o);for(const f of G.frontThreats)drawFrontThreat(f);for(const q of G.pickups)drawPickup(q);for(const b of G.bullets)drawProjectile(b,false);for(const b of G.eBullets)drawProjectile(b,true);
  for(const e of G.enemies)drawInsect(e,false);if(G.boss&&!G.boss.dead)drawInsect(G.boss,true);drawShip();drawParticles();cx.restore();drawHUD();drawBanners();if(flash>0){cx.fillStyle=`rgba(255,80,100,${flash*.11})`;cx.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=G.player,sec=SECTORS[G.sector-1],m=12,compact=compactUI();cx.save();cx.textBaseline='middle';
  if(compact){
    const topY=5,topH=30,left=5,right=W-5,barW=right-left;
    cx.fillStyle='rgba(2,7,17,.70)';cx.strokeStyle=hexA(sec.accent,.24);rr(left,topY,barW,topH,10);cx.fill();cx.stroke();
    const hp=Math.max(0,p.hp/p.maxHp*100).toFixed(0),sh=Math.max(0,p.shield/p.maxShield*100).toFixed(0),xp=Math.max(0,G.xp/G.xpNext*100).toFixed(0);
    cx.textAlign='left';cx.font='800 9px system-ui';let x=11,y=topY+topH/2+1;
    const core=[['❤',hp,'#ff86a0'],['⬡',sh,'#74b9ff'],['✦',xp,'#a6ff5f'],['¤',Math.round(G.credits/10)*10,'#ffd76a'],[G.mode==='bossRush'?'☠':'⚑',G.mode==='bossRush'?`${G.sector}/10`:`${G.sector}.${G.wave}`,'#e8fbff']];
    for(const [ic,val,col] of core){const txt=`${ic}${val}`;cx.fillStyle=col;cx.fillText(txt,x,y);x+=Math.min(64,cx.measureText(txt).width+9);}
    const status=G.bossWarningT>0&&G.boss?`⚠${G.boss.phase}`:G.frenzyT>0?`🔥${G.frenzyKills}/${G.frenzyTarget}·${Math.ceil(G.frenzyT)}`:notices.length?notices[0].text.replace(/SECTOR|ORDA|CHECKPOINT|AMBIENTE|ACTIVADO|PRESIÓN|AUMENTADA/gi,'').replace(/\s+/g,' ').trim().slice(0,20):`✕${G.kills}/${G.goal}`;
    const statusCol=G.bossWarningT>0?'#ff8a93':G.frenzyT>0?'#ffdc82':notices.length?notices[0].color:'#9fe6ff';
    cx.textAlign='center';cx.fillStyle=statusCol;cx.font='900 9px system-ui';cx.fillText(status,W*.57,y);
    const active=Object.entries(G.powers).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3);let rx=W-86;cx.textAlign='right';
    for(const [k,v] of active.reverse()){const pd=POWERS[k];const txt=`${pd.icon}${rankRoman(powerRank(k))} ${Math.ceil(v)}`;cx.fillStyle=pd.color;cx.fillText(txt,rx,y);rx-=Math.min(60,cx.measureText(txt).width+9);}
    if(G.combo>=3){cx.fillStyle=G.combo>=10?'#ff8be2':'#ffd76a';cx.font='900 9px system-ui';cx.fillText(`×${G.combo}`,W-8,y);}
    if(G.mode==='training'){cx.textAlign='left';cx.fillStyle='#bdefff';cx.fillText('T',7,H-12);}
    cx.restore();return;
  }
  const leftW=Math.min(356,W*.33),rightW=Math.min(250,W*.23),heartPulse=1+(G.heartHitT||0)*.18+((p.hp/p.maxHp<=.1)?Math.sin(G.elapsed*12)*.08:0),actionPad=(shopBtn.style.display==='block'?40:0),rightY=m+actionPad;
  cx.fillStyle='rgba(2,7,17,.68)';cx.strokeStyle=hexA(sec.accent,.28);rr(m,m,leftW,88,14);cx.fill();cx.stroke();
  cx.fillStyle='#e8fbff';cx.font='800 12px system-ui';cx.fillText(`${sec.code} · SECTOR ${G.sector} · ORDA ${G.wave}/3`,m+12,m+15);cx.fillStyle=sec.accent;cx.font='700 9px system-ui';cx.fillText(`${sec.family} · ${sec.name}`,m+12,m+70);
  bar(m+96,m+26,130,8,p.hp/p.maxHp,'#ff647e');bar(m+96,m+42,130,7,p.shield/p.maxShield,'#74b9ff');bar(m+96,m+58,130,6,G.xp/G.xpNext,'#a6ff5f');cx.fillStyle='#fff';cx.font='700 9px system-ui';cx.fillText('HP',m+72,m+30);cx.fillText('SH',m+72,m+46);cx.fillText('XP',m+72,m+61);
  cx.save();cx.translate(m+34,m+43);cx.scale(heartPulse,heartPulse);cx.fillStyle=p.hp/p.maxHp<=.1?'#ff5b73':'#ff86a0';cx.font='900 21px system-ui';cx.fillText('❤',0,0);cx.restore();cx.fillStyle='#ffdbe2';cx.font='800 11px system-ui';cx.fillText(`${Math.max(0,p.hp/p.maxHp*100).toFixed(0)}%`,m+26,m+66);

  cx.textAlign='center';cx.fillStyle='rgba(2,7,17,.62)';rr(W*.35,10,W*.30,58,12);cx.fill();cx.strokeStyle=hexA(sec.accent,.18);cx.stroke();cx.fillStyle='#f6fdff';cx.font='900 16px ui-monospace,monospace';cx.fillText(G.score.toLocaleString(),W*.5,24);cx.fillStyle='#ffd76a';cx.font='700 10px system-ui';cx.fillText(`¤ ${G.credits.toLocaleString()} · XP ${G.xp}/${G.xpNext} · NIV ${G.level}`,W*.5,41);cx.fillStyle='#9fe6ff';cx.font='700 9px system-ui';cx.fillText(G.mode==='bossRush'?`BOSS RUSH ${G.sector}/10`:`BAJAS ${G.kills}/${G.goal}`,W*.5,55);

  const rx=W-rightW-12;cx.textAlign='left';cx.fillStyle='rgba(2,7,17,.62)';cx.strokeStyle=hexA(sec.accent,.24);rr(rx,rightY,rightW,84,14);cx.fill();cx.stroke();
  cx.fillStyle=sec.accent;cx.font='800 11px system-ui';cx.fillText('PERFIL DEL SECTOR',rx+12,rightY+14);cx.fillStyle='#eefaff';cx.font='700 9px system-ui';cx.fillText(sec.boss,rx+12,rightY+30);
  const labels=[['ARM',sec.stats.armor],['SPD',sec.stats.speed],['RNG',sec.stats.range],['THR',sec.stats.threat]];let bx=rx+12;for(const [lab,val] of labels){cx.fillStyle='#87a0b0';cx.font='700 8px system-ui';cx.fillText(lab,bx,rightY+49);bar(bx+22,rightY+45,26,6,val/5,sec.accent);bx+=53;}
  if(G.lastBossDrop){cx.fillStyle='#ffd76a';cx.font='700 8px system-ui';cx.fillText(`HERENCIA: ${POWERS[G.lastBossDrop]?.name||''}`,rx+12,rightY+64);}cx.textAlign='right';cx.fillStyle='#9fe6ff';cx.font='700 8px system-ui';cx.fillText(`ESCOLTAS ${supportCount()}/5`,rx+rightW-12,rightY+64);cx.textAlign='left';

  const active=Object.entries(G.powers).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,6);const gap=8,ww=86,tot=active.length*ww+Math.max(0,active.length-1)*gap;let x=W/2-tot/2;for(const [k,v] of active){const pd=POWERS[k];cx.fillStyle='rgba(2,7,17,.74)';cx.strokeStyle=hexA(pd.color,.55);rr(x,H-44,ww,30,9);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText(`${pd.icon} ${rankRoman(powerRank(k))} · ${Math.ceil(v)}s`,x+ww/2,H-28);x+=ww+gap;}
  const q=(G.powerQueue||[]).slice(0,4);let qx=12;for(const k of q){const pd=POWERS[k];cx.fillStyle='rgba(2,7,17,.66)';cx.strokeStyle=hexA(pd.color,.4);rr(qx,H-82,74,24,8);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText(`⏳ ${pd.icon}${rankRoman(powerRank(k))} ${pd.name.slice(0,6)}`,qx+37,H-69);qx+=80;}
  const combos=Object.keys(G.activeCombos||{});if(combos.length){const cd=COMBOS[combos[0]];cx.fillStyle='rgba(2,7,17,.72)';cx.strokeStyle=hexA(cd.color,.42);rr(W/2-110,H-78,220,24,9);cx.fill();cx.stroke();cx.fillStyle=cd.color;cx.font='800 10px system-ui';cx.textAlign='center';cx.fillText(cd.name,W/2,H-65);} 
  if(G.frenzyT>0){cx.fillStyle='rgba(72,31,0,.78)';cx.strokeStyle='#ffcb63';rr(W/2-105,78,210,26,10);cx.fill();cx.stroke();cx.fillStyle='#ffdc82';cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(`FRENESÍ ${G.frenzyKills}/${G.frenzyTarget} · ${Math.ceil(G.frenzyT)}s · x${G.frenzyMult.toFixed(1)}`,W/2,92);}
  if(G.mode==='training'){cx.fillStyle='rgba(5,42,64,.70)';cx.strokeStyle='#8edbff';rr(14,108,150,24,9);cx.fill();cx.stroke();cx.fillStyle='#bdefff';cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText('ENTRENAMIENTO',89,121);}
  if(G.postBossT>0){cx.fillStyle='rgba(10,48,25,.78)';cx.strokeStyle='#a6ff5f';rr(W/2-125,110,250,28,10);cx.fill();cx.stroke();cx.fillStyle='#caff9d';cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(`RECOGE PREMIOS · ${Math.ceil(G.postBossT)}s`,W/2,125);}
  if(G.bossWarningT>0&&G.boss){const skill=BOSS_SKILLS[G.boss.pattern];cx.fillStyle='rgba(40,4,6,.78)';cx.strokeStyle=skill?.color||'#ff6b78';rr(W/2-160,H*.16,320,38,12);cx.fill();cx.stroke();cx.fillStyle=skill?.color||'#ff8a93';cx.font='900 14px system-ui';cx.textAlign='center';cx.fillText(`⚠ ${G.bossWarningText}`,W/2,H*.16+20);}
  if(G.combo>=3){cx.textAlign='right';cx.fillStyle=G.combo>=10?'#ff8be2':'#ffd76a';cx.font=`900 ${Math.min(22,12+G.combo*.35)}px system-ui`;const mobileLow=W<920&&H<520;cx.fillText(`x${G.combo} ENJAMBRE`,mobileLow?W-112:W-18,mobileLow?H-116:H-25);} 
  cx.restore();
}
function bar(x,y,w,h,v,col){cx.fillStyle='rgba(255,255,255,.08)';rr(x,y,w,h,h/2);cx.fill();cx.fillStyle=col;rr(x+1,y+1,(w-2)*clamp(v,0,1),h-2,(h-2)/2);cx.fill();}
function drawBanners(){
  const sec=SECTORS[G.sector-1],compact=compactUI();
  if(compact){return;}
  if(G.sectorBanner>0){const a=clamp(Math.min(G.sectorBanner,3-G.sectorBanner)*1.4,0,1);cx.save();cx.globalAlpha=a;cx.textAlign='center';cx.fillStyle='#fff';cx.font=`900 ${Math.min(38,W*.05)}px system-ui`;cx.fillText(`SECTOR ${G.sector} · ${sec.name}`,W/2,H*.35);cx.fillStyle=sec.accent;cx.font=`800 ${Math.min(17,W*.022)}px system-ui`;cx.fillText(`LINAJE ${sec.family} // PODERES FOCO: ${powerFocusLabel(G.sector)}`,W/2,H*.41);cx.restore();}
  if(G.waveBanner>0&&G.sectorBanner<=0){cx.save();cx.globalAlpha=clamp(G.waveBanner,0,1);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 28px system-ui';cx.fillText(`ORDA ${G.wave}/3`,W/2,H*.32);cx.restore();}
  if(notices.length){const items=notices.slice(0,3);for(let i=0;i<items.length;i++){const n=items[i],a=clamp(n.t/Math.max(.4,n.max),0,1),w=Math.min(W*.32,420),y=H-120-i*28;cx.save();cx.globalAlpha=.25+.75*a;cx.fillStyle='rgba(0,0,0,.52)';rr(W/2-w/2,y,w,22,9);cx.fill();cx.strokeStyle=hexA(n.color,.24+.2*a);cx.stroke();cx.textAlign='center';cx.fillStyle=n.color;cx.font='800 10.5px system-ui';cx.fillText(n.text,W/2,y+12);cx.restore();}}
}

// ─────────────────────────────────────────────────────────────
// SCREENS / UI
// ─────────────────────────────────────────────────────────────
let menuSector=1,guidePage=0;
function uiButton(id,label,x,y,w,h,col='#66f5ff',sub=''){
  const hover=false;cx.save();cx.fillStyle='rgba(4,10,24,.78)';cx.strokeStyle=hexA(col,.62);cx.lineWidth=1.5;rr(x,y,w,h,12);cx.fill();cx.stroke();
  cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=col;cx.font=`900 ${Math.min(15,h*.32)}px system-ui`;cx.fillText(label,x+w/2,y+h*(sub?.42:.5));if(sub){cx.fillStyle='#9db1c1';cx.font=`600 ${Math.min(10,h*.18)}px system-ui`;cx.fillText(sub,x+w/2,y+h*.72);}cx.restore();UI.buttons.push({id,x,y,w,h});
}
function drawTitle(y=70){cx.textAlign='center';cx.fillStyle='#e9ffff';cx.font=`950 ${Math.min(54,W*.07)}px system-ui`;cx.fillText('SWARM//RIFT',W/2,y);cx.fillStyle='#a6ff5f';cx.font=`800 ${Math.min(13,W*.018)}px system-ui`;cx.fillText('I N S E C T A   S I E G E',W/2,y+25);cx.textAlign='left';}
function drawHazardPill(text,x,y,col){
  const w=Math.max(72,cx.measureText(text).width+18);cx.fillStyle='rgba(6,12,24,.76)';cx.strokeStyle=hexA(col,.34);rr(x,y,w,20,10);cx.fill();cx.stroke();cx.fillStyle=col;cx.font='700 9px system-ui';cx.fillText(text,x+9,y+10);return w;
}

function upgradeEffect(id,lvl){
  switch(id){
    case 'hull': return `+${lvl*12} HP máx`;
    case 'shield': return `+${lvl*10} escudo máx`;
    case 'damage': return `+${lvl*10}% daño base`;
    case 'rate': return `+${lvl*7}% cadencia`;
    case 'engine': return `+${lvl*5}% velocidad`;
    case 'magnet': return `+${lvl*18} radio de recolección`;
    case 'drone': return `+${Math.ceil(lvl/2)} dron${Math.ceil(lvl/2)===1?'':'es'} permanente${Math.ceil(lvl/2)===1?'':'s'}`;
    case 'salvage': return `+${lvl*8}% créditos`;
    case 'dash': return `+${lvl*3}% respuesta de maniobra`;
    default:return 'sin datos';
  }
}
function nextUpgradeLabel(u,lvl){
  if(lvl>=u.max)return 'sin mejora disponible';
  return upgradeEffect(u.id,lvl+1);
}
function drawGuideThumb(kind,x,y,w,h){
  cx.save();
  rr(x,y,w,h,12);cx.clip();
  const bg = kind==='front'||kind==='progress' || kind==='boss' ? IMG.bg.rift : (kind==='powers'||kind==='hangar' ? IMG.bg.toxic : IMG.bg.rust);
  if(imgReady(bg)){
    const scale=Math.max(w/bg.naturalWidth,h/bg.naturalHeight);const iw=bg.naturalWidth*scale,ih=bg.naturalHeight*scale;
    cx.drawImage(bg,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
  }else{cx.fillStyle='rgba(10,18,32,.9)';cx.fillRect(x,y,w,h);}
  const g=cx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(0,0,0,.12)');g.addColorStop(1,'rgba(0,0,0,.58)');cx.fillStyle=g;cx.fillRect(x,y,w,h);
  const sx=x+w*.24, sy=y+h*.58;
  if(['move','shoot','powers','front','boss','progress'].includes(kind)){
    if(imgReady(IMG.ship))cx.drawImage(IMG.ship,sx-34,sy-20,68,68);
    else{cx.fillStyle='#dff';cx.fillRect(sx-16,sy-8,32,16);} }
  if(kind==='move'){
    cx.strokeStyle='rgba(135,240,255,.9)';cx.lineWidth=3;for(const [dx,dy,ex,ey] of [[-44,0,-12,0],[44,0,12,0],[0,-34,0,-10],[0,34,0,10]]){cx.beginPath();cx.moveTo(sx+dx,sy+dy);cx.lineTo(sx+ex,sy+ey);cx.stroke();}
  }else if(kind==='shoot'){
    cx.strokeStyle='#9ee9ff';cx.lineWidth=5;for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(sx+34,sy-10+i*10);cx.lineTo(x+w-18,sy-18+i*14);cx.stroke();}
  }else if(kind==='powers'){
    const keys=['twin','tesla','shield'];keys.forEach((k,i)=>{const pd=POWERS[k];cx.fillStyle=hexA(pd.color,.18);cx.strokeStyle=pd.color;rr(x+14+i*54,y+h-44,42,30,10);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 16px system-ui';cx.fillText(pd.icon,x+35+i*54,y+h-23);});
  }else if(kind==='front'){
    cx.fillStyle='rgba(255,170,95,.88)';cx.beginPath();cx.moveTo(x+w*.76,y+h*.2);cx.lineTo(x+w*.92,y+h*.56);cx.lineTo(x+w*.68,y+h*.64);cx.closePath();cx.fill();cx.fillStyle='#fff4c9';cx.beginPath();cx.arc(x+w*.76,y+h*.46,6,0,TAU);cx.fill();
  }else if(kind==='boss'){
    const fake={x:x+w*.73,y:y+h*.57,r:24,family:SECTORS[0].family,form:'shocker',pattern:'storm',name:'BOSS',t:G.elapsed||0,phase:2,flash:0,guardT:0,telegraphT:0,animPulse:0,phaseFlash:0};
    drawInsect(fake,true,true,.78);const e1={x:x+w*.48,y:y+h*.38,r:10,family:SECTORS[0].family,form:SECTORS[0].forms[0],t:G.elapsed||0,flash:0,maxHp:1,hp:1},e2={...e1,x:x+w*.52,y:y+h*.72,form:SECTORS[0].forms[1]};drawInsect(e1,false,true,.72);drawInsect(e2,false,true,.72);
  }else if(kind==='replay'){
    cx.fillStyle='rgba(255,215,106,.15)';cx.strokeStyle='#ffd76a';rr(x+14,y+h-44,w-28,28,10);cx.fill();cx.stroke();cx.fillStyle='#ffd76a';cx.font='800 13px system-ui';cx.fillText('CHECKPOINT 50%',x+28,y+h-26);
  }else if(kind==='hangar'){
    cx.fillStyle='rgba(255,183,232,.12)';cx.strokeStyle='#ffb7e8';rr(x+12,y+12,w-24,h-24,12);cx.fill();cx.stroke();
    ['♥','⬡','✦','◆'].forEach((ic,i)=>{cx.fillStyle=['#ff8fa3','#8edbff','#ffe27a','#d6f9ff'][i];cx.font='900 18px system-ui';cx.fillText(ic,x+24+i*34,y+30);});
  }else if(kind==='progress'){
    cx.fillStyle='rgba(255,215,106,.12)';cx.strokeStyle='#ffd76a';rr(x+14,y+h-44,w-28,30,10);cx.fill();cx.stroke();cx.fillStyle='#ffd76a';cx.font='800 13px system-ui';cx.fillText('XP · CRÉDITOS · HERENCIAS',x+22,y+h-24);
  }
  cx.restore();
}

function drawMenuPortrait(){
  UI.buttons.length=0;drawBackground();const sec=SECTORS[menuSector-1],m=Math.max(14,W*.045),cw=W-m*2;
  drawTitle(62);
  cx.textAlign='center';cx.fillStyle='#8ea7b8';cx.font=`700 ${Math.max(9,W*.027)}px system-ui`;cx.fillText('MENÚ DE MISIÓN · EL COMBATE CAMBIA A HORIZONTAL AL INICIAR',W/2,102);cx.textAlign='left';
  let y=126,bh=48,gap=7;
  const btn=(id,label,col,sub='')=>{uiButton(id,label,m,y,cw,bh,col,sub);y+=bh+gap;};
  btn('menu_new','NUEVA CAMPAÑA','#a6ff5f','desde Sector 1');
  btn('menu_load','CARGAR PARTIDA',hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint disponible':'sin checkpoint');
  btn('menu_guide','CÓMO JUGAR','#ffd76a','controles y poderes');
  btn('menu_store','HANGAR / TIENDA','#ffb7e8',`¤ ${META.credits.toLocaleString()}`);
  btn('menu_training','ENTRENAMIENTO','#8edbff','práctica sin castigo');
  btn('sector_boss','CHECKPOINT JEFE 50%',sectorDefeated(menuSector)?'#ffbd6a':'#526575',sectorDefeated(menuSector)?'arena desbloqueada':'derrota antes al jefe');
  if(allBossesDefeated())btn('menu_bossrush','☠ BOSS RUSH · 10 JEFES','#fff09a',`rango ${META.bestBossRushRank||'-'} · victorias ${META.bossRushWins||0}`);
  const labelY=y+8;cx.fillStyle='#dceaf2';cx.font=`900 ${Math.max(10,W*.03)}px system-ui`;cx.fillText('SECTOR / MUNDO',m,labelY);y+=24;
  const side=48,mid=cw-side*2-12;uiButton('sector_prev','‹',m,y,side,46,'#7dc8ff');uiButton('sector_start',`${menuSector} · ${sec.family}`,m+side+6,y,mid,46,sec.accent,sec.name);uiButton('sector_next','›',W-m-side,y,side,46,'#7dc8ff');y+=58;
  const cardH=Math.max(116,Math.min(190,H-y-24));cx.fillStyle='rgba(3,8,18,.76)';cx.strokeStyle=hexA(sec.accent,.32);rr(m,y,cw,cardH,18);cx.fill();cx.stroke();
  cx.fillStyle=sec.accent;cx.font=`900 ${Math.max(12,W*.035)}px system-ui`;cx.fillText(`${sec.code} · ${sec.name}`,m+16,y+22);
  cx.fillStyle='#e9f7ff';cx.font=`800 ${Math.max(10,W*.029)}px system-ui`;cx.fillText(`${sec.family} · JEFE ${sec.boss}`,m+16,y+44);
  cx.fillStyle='#9bb0bf';cx.font=`600 ${Math.max(9,W*.024)}px system-ui`;drawTextLines(sec.blurb,m+16,y+66,cw-32,14);
  cx.fillStyle='#ffd76a';cx.font=`800 ${Math.max(9,W*.024)}px system-ui`;cx.fillText(`PODERES HASTA RANGO ${rankRoman(powerRankCap(menuSector))} · MUNDO ${menuSector}/10`,m+16,y+cardH-18);
  cx.textAlign='center';cx.fillStyle='#60788a';cx.font=`600 ${Math.max(8,W*.021)}px system-ui`;cx.fillText(`v${VERSION} · menú vertical · combate horizontal automático`,W/2,H-8);cx.textAlign='left';
}

function drawMenu(){
  if(W<H || W<620)return drawMenuPortrait();
  UI.buttons.length=0;drawBackground();drawTitle(Math.max(54,H*.12));const sec=SECTORS[menuSector-1];
  const panelW=Math.min(560,W*.52),x=36,y=Math.max(110,H*.22),rightX=W-panelW*.72-36;
  cx.fillStyle='rgba(3,8,18,.68)';cx.strokeStyle='rgba(99,246,255,.16)';rr(x,y,panelW,H-y-36,20);cx.fill();cx.stroke();
  cx.fillStyle='#dffaff';cx.font=`800 ${Math.min(18,W*.025)}px system-ui`;cx.fillText('AUTO-SHOOTER DE ESQUIVA Y DESTRUCCIÓN',x+22,y+32);cx.fillStyle='#93a9ba';cx.font='600 12px system-ui';cx.fillText('Mueve · esquiva · rompe barreras · captura poderes · elimina hordas.',x+22,y+55);
  const compact=H<560,bw=Math.min(265,panelW*.47),bh=compact?42:54,row1=y+(compact?62:82),row2=y+(compact?110:148),row3=y+(compact?158:212),labelY=y+(compact?214:290),sy=y+(compact?228:304);
  uiButton('menu_new','NUEVA CAMPAÑA',x+22,row1,bw,bh,'#a6ff5f','desde Sector 1');uiButton('menu_load','CARGAR PARTIDA',x+32+bw,row1,bw,bh,hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint disponible':'sin checkpoint');
  uiButton('menu_guide','CÓMO JUGAR',x+22,row2,bw,bh,'#ffd76a','controles, poderes y tienda');uiButton('menu_store','HANGAR / TIENDA',x+32+bw,row2,bw,bh,'#ffb7e8',`¤ ${META.credits.toLocaleString()}`);
  uiButton('menu_training',allBossesDefeated()&&compact?'☠ BOSS RUSH':'ENTRENAMIENTO',x+22,row3,bw,bh,allBossesDefeated()&&compact?'#fff09a':'#8edbff',allBossesDefeated()&&compact?'10 jefes consecutivos':'práctica sin castigo · mini jefe');uiButton('sector_boss','CHECKPOINT JEFE 50%',x+32+bw,row3,bw,bh,sectorDefeated(menuSector)?'#ffbd6a':'#526575',sectorDefeated(menuSector)?(META.bossMastery?.[menuSector]?'arena desbloqueada · ★ maestría':'arena desbloqueada · reto de maestría'):'derrota antes al jefe');
  cx.fillStyle='#dbe7ef';cx.font='800 12px system-ui';cx.fillText('REPETIR SECTOR DESBLOQUEADO',x+22,labelY);uiButton('sector_prev','‹',x+22,sy,46,44,'#7dc8ff');uiButton('sector_start',`SECTOR ${menuSector} · ${sec.family}`,x+78,sy,panelW-156,44,sec.accent,sec.name);uiButton('sector_next','›',x+panelW-68,sy,46,44,'#7dc8ff');
  if(allBossesDefeated()&&H>=620)uiButton('menu_bossrush','☠ BOSS RUSH · 10 JEFES',x+22,sy+52,panelW-44,38,'#fff09a',META.bossRushWins?`victorias ${META.bossRushWins} · rango ${META.bestBossRushRank||'-'} · reliquias ${relicCount()}/4`:`endgame desbloqueado · reliquias ${relicCount()}/4`);

  const cardX=Math.max(x+panelW+28,W*.62),cardW=W-cardX-36,cardY=y,cardH=H-cardY-36;cx.fillStyle='rgba(3,8,18,.60)';cx.strokeStyle=hexA(sec.accent,.28);rr(cardX,cardY,cardW,cardH,20);cx.fill();cx.stroke();
  const topH=Math.min(190,cardH*.34),img=IMG.bg[sec.worldBg]||IMG.bg[sec.bg]||IMG.bg.rust;
  cx.save();rr(cardX+10,cardY+10,cardW-20,topH,16);cx.clip();
  if(imgReady(img)){const scale=Math.max((cardW-20)/img.naturalWidth,topH/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;cx.drawImage(img,cardX+10+(cardW-20-iw)/2,cardY+10+(topH-ih)/2,iw,ih);}else{cx.fillStyle=sec.dark;cx.fillRect(cardX+10,cardY+10,cardW-20,topH);}
  const g=cx.createLinearGradient(0,cardY+10,0,cardY+10+topH);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.74)');cx.fillStyle=g;cx.fillRect(cardX+10,cardY+10,cardW-20,topH);cx.restore();
  cx.textAlign='left';cx.fillStyle=sec.accent;cx.font='900 12px system-ui';cx.fillText(sec.code,cardX+22,cardY+topH-28);cx.fillStyle='#f2fbff';cx.font=`900 ${Math.min(18,cardW*.05)}px system-ui`;cx.fillText(sec.name,cardX+22,cardY+topH-10);
  cx.fillStyle='#dfefff';cx.font='800 12px system-ui';cx.fillText(`${sec.family} // JEFE ${sec.boss}`,cardX+22,cardY+topH+28);
  cx.fillStyle='#96abbc';cx.font='600 10.5px system-ui';cx.fillText(sec.blurb,cardX+22,cardY+topH+48);cx.fillStyle='#ffd76a';cx.font='800 9px system-ui';cx.fillText(`PODERES · HASTA RANGO ${rankRoman(powerRankCap(menuSector))}`,cardX+22,cardY+topH+66);

  let pillX=cardX+22,pillY=cardY+topH+66;for(const hz of sec.hazards){pillX+=drawHazardPill(hz,pillX,pillY,sec.accent)+8; if(pillX>cardX+cardW-130){pillX=cardX+22;pillY+=26;}}

  const hadGame=!!G,oldSector=G?.sector,oldPlayer=G?.player;if(!G)G={sector:menuSector,player:{x:0,y:0},elapsed:0};else{G.sector=menuSector;G.player=G.player||{x:0,y:0};}
  const previewY=Math.min(cardY+cardH-170,pillY+84),gap=14,boxW=(cardW-44-gap*2)/3,boxH=118;const forms=[sec.forms[0],sec.forms[1],sec.forms[2]];const labels=['GRUNT','ELITE','BOSS'];
  for(let i=0;i<3;i++){
    const px=cardX+14+i*(boxW+gap),py=previewY;cx.fillStyle='rgba(6,12,24,.72)';cx.strokeStyle=hexA(i===2?sec.accent:'#85b9d8',.24);rr(px,py,boxW,boxH,14);cx.fill();cx.stroke();
    const fake={x:px+boxW/2,y:py+boxH*.54,r:i===2?32:24,family:sec.family,form:forms[Math.min(i,2)],pattern:sec.pattern,name:sec.boss,t:performance.now()/1000+i,phase:1,flash:0,guardT:0,telegraphT:0,animPulse:0,phaseFlash:0};
    drawInsect(fake,i===2,true,i===2?.84:.9);cx.textAlign='center';cx.fillStyle=i===2?sec.accent:'#b2c6d4';cx.font='800 10px system-ui';cx.fillText(labels[i],px+boxW/2,py+boxH-12);
  }
  if(hadGame){G.sector=oldSector;G.player=oldPlayer;} else G=null;

  const statsY=cardY+cardH-28;cx.textAlign='left';cx.fillStyle='#8ba3b6';cx.font='700 9px system-ui';cx.fillText('ARM',cardX+22,statsY);bar(cardX+48,statsY-4,54,6,sec.stats.armor/5,sec.accent);cx.fillText('SPD',cardX+112,statsY);bar(cardX+138,statsY-4,54,6,sec.stats.speed/5,sec.accent);cx.fillText('RNG',cardX+202,statsY);bar(cardX+228,statsY-4,54,6,sec.stats.range/5,sec.accent);cx.fillText('THR',cardX+292,statsY);bar(cardX+318,statsY-4,54,6,sec.stats.threat/5,sec.accent);
  cx.fillStyle='#6f8799';cx.font='600 10px system-ui';cx.textAlign='center';cx.fillText(`v${VERSION} · campaña reestructurada por sector · responsive móvil · combate horizontal automático · guardado local · PWA offline`,W/2,H-12);cx.textAlign='left';
}
function wrap(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;cx.textAlign='center';for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);cx.textAlign='left';return yy;}

function drawPause(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(0,0,W,H);drawTitle(H*.18);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 30px system-ui';cx.fillText('PAUSA TÁCTICA',W/2,H*.31);cx.fillStyle='#9db1c1';cx.font='600 12px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · ¤ ${G.credits.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.36);const w=Math.min(310,W*.34),h=48,x=W/2-w/2;uiButton('pause_resume','▶ CONTINUAR',x,H*.42,w,h,'#a6ff5f');uiButton('pause_save','▣ GUARDAR CHECKPOINT',x,H*.53,w,h,'#78caff');uiButton('pause_store','🛒 TIENDA',x,H*.64,w,h,'#ffb9ef','la compra mantiene el combate congelado');uiButton('pause_menu','MENÚ PRINCIPAL',x,H*.75,w,h,'#ff8b79');cx.textAlign='left';}

function upgradeCost(u){const lvl=up(u.id);return Math.round(u.base*Math.pow(1.39,lvl));}
function buyUpgrade(id){const u=UPGRADES.find(v=>v.id===id);if(!u)return;const lvl=up(id);if(lvl>=u.max){AudioX.deny();return;}const cost=upgradeCost(u);if(G.credits<cost){AudioX.deny();notify('CRÉDITOS INSUFICIENTES','#ff768c',1.5);return;}G.credits-=cost;META.credits=G.credits;META.upgrades[id]=lvl+1;
  if(G.player){if(id==='hull'){G.player.maxHp+=12;G.player.hp=Math.min(G.player.maxHp,G.player.hp+12);}if(id==='shield'){G.player.maxShield+=10;G.player.shield=Math.min(G.player.maxShield,G.player.shield+10);}}
  AudioX.buy();saveMeta();if(shopReturn==='GAME')saveRun();notify(`${u.name} · NIVEL ${lvl+1}`,'#a6ff5f',1.5);
}
function drawStore(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.84)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#ffb7e8';cx.font=`900 ${Math.min(29,W*.035)}px system-ui`;cx.fillText('HANGAR // MEJORAS PERMANENTES',W/2,36);cx.fillStyle='#ffd76a';cx.font='800 12px system-ui';cx.fillText(`CRÉDITOS ¤ ${G.credits.toLocaleString()} · PRECIOS RECALIBRADOS · LA TIENDA PAUSA LA SIMULACIÓN`,W/2,58);
  const unlockedHeritages=Object.values(META.bossUnlocks||{}).filter(Boolean),drp=Math.ceil(up('drone')/2);
  cx.fillStyle='rgba(4,12,25,.58)';cx.strokeStyle='rgba(99,246,255,.18)';rr(22,72,W-44,48,14);cx.fill();cx.stroke();
  cx.textAlign='left';cx.fillStyle='#d8ebf7';cx.font='700 11px system-ui';cx.fillText(`RESUMEN · HP ${upgradeEffect('hull',up('hull'))} · SH ${upgradeEffect('shield',up('shield'))} · DMG ${upgradeEffect('damage',up('damage'))} · SPD ${upgradeEffect('engine',up('engine'))} · DRONES ${drp}`,34,92);
  cx.fillStyle='#94aec0';cx.font='600 10px system-ui';cx.fillText(`HERENCIAS DESBLOQUEADAS · ${unlockedHeritages.length?unlockedHeritages.map(k=>POWERS[k]?.name||k).join(' · '):'aún no has incorporado poderes de jefe al hangar'} · RELIQUIAS ${relicCount()}/4`,34,109);
  const deck=['twin','tesla','missile','rail','cryo','acid','shield','magnet','drone','overdrive','gravity','burst'];cx.fillStyle='#d5e6f1';cx.font='800 9px system-ui';cx.fillText('PODERES DE COMBATE',34,135);let dx=150;
  for(const k of deck){const pd=POWERS[k];cx.fillStyle=hexA(pd.color,.10);cx.strokeStyle=hexA(pd.color,.42);rr(dx,122,36,27,9);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 13px system-ui';cx.textAlign='center';cx.fillText(pd.icon,dx+18,136);dx+=42;}cx.textAlign='left';
  const cols=3,rows=3,gap=10,margin=Math.max(16,W*.04),top=160,bottom=58,cw=(W-margin*2-gap*(cols-1))/cols,ch=(H-top-bottom-gap*(rows-1))/rows;
  UPGRADES.forEach((u,i)=>{
    const col=i%cols,row=(i/cols)|0,x=margin+col*(cw+gap),y=top+row*(ch+gap),lvl=up(u.id),maxed=lvl>=u.max,cost=maxed?0:upgradeCost(u),can=G.credits>=cost&&!maxed;
    cx.fillStyle=maxed?'rgba(18,58,44,.45)':'rgba(4,12,25,.72)';cx.strokeStyle=maxed?'rgba(166,255,95,.38)':can?'rgba(99,246,255,.34)':'rgba(255,100,125,.20)';rr(x,y,cw,ch,15);cx.fill();cx.stroke();
    cx.textAlign='left';cx.fillStyle=maxed?'#b8ff7d':'#e9fbff';cx.font=`900 ${Math.min(15,cw*.048)}px system-ui`;cx.fillText(`${u.icon} ${u.name}`,x+13,y+20);
    cx.fillStyle='#91a8ba';cx.font=`600 ${Math.min(10,cw*.033)}px system-ui`;drawTextLines(u.desc,x+13,y+36,cw-28,13);
    cx.fillStyle='#8edbff';cx.font='800 10px system-ui';cx.fillText(`ACTUAL · ${upgradeEffect(u.id,lvl)}`,x+13,y+ch-48);
    cx.fillStyle=maxed?'#9dd5a4':'#ffd76a';cx.font='700 10px system-ui';cx.fillText(maxed?'SIGUIENTE · MÁXIMO':`SIGUIENTE · ${nextUpgradeLabel(u,lvl)}`,x+13,y+ch-33);
    cx.fillStyle='#6fe7ff';cx.font='800 10px system-ui';cx.fillText(`NIVEL ${lvl}/${u.max}`,x+13,y+ch-15);
    cx.textAlign='right';cx.fillStyle=maxed?'#a6ff5f':can?'#ffd76a':'#ff758b';cx.font='900 11px system-ui';cx.fillText(maxed?'MÁXIMO':`COMPRAR ¤ ${cost}`,x+cw-13,y+ch-15);
    UI.buttons.push({id:'buy_'+u.id,x,y,w:cw,h:ch});
  });
  uiButton('store_close','← VOLVER',18,H-47,150,34,'#8edbff');cx.textAlign='left';
}
function drawVictory(){
  UI.buttons.length=0;drawBackground();const sec=SECTORS[G.sector-1],training=G.mode==='training',rush=G.mode==='bossRush'&&G.bossRushComplete,finale=!!G.campaignComplete&&!rush;cx.fillStyle='rgba(0,0,0,.62)';cx.fillRect(0,0,W,H);
  if(rush||finale){cx.save();cx.globalAlpha=.18;cx.strokeStyle=rush?'#fff09a':'#d9a7ff';cx.lineWidth=2;for(let i=0;i<5;i++){cx.beginPath();cx.arc(W/2,H*.30,80+i*34+Math.sin((G.elapsed||0)*1.3+i)*8,0,TAU);cx.stroke();}cx.restore();}
  cx.textAlign='center';cx.fillStyle=rush||finale?'#fff09a':training?'#8edbff':sec.accent;cx.font=`900 ${Math.min(40,W*.052)}px system-ui`;cx.fillText(rush?'BOSS RUSH COMPLETADO':finale?'CAMPAÑA COMPLETADA':training?'ENTRENAMIENTO COMPLETADO':'SECTOR SUPERADO',W/2,H*.15);
  cx.fillStyle='#fff';cx.font='900 22px system-ui';cx.fillText(rush?`RANGO ${G.bossRushRank||bossRushRank(G.bossRushResults)}`:finale?'RESONATOR OMEGA HA CAÍDO':training?'CONTROL, ESQUIVA Y COMBATE VERIFICADOS':sec.boss,W/2,H*.215);
  cx.fillStyle='#b2c4d1';cx.font='700 12px system-ui';
  if(rush){cx.fillText(`PUNTOS ${G.score.toLocaleString()} · ${G.bossRushTime.toFixed(1)}s · PREMIO ¤ ${G.bossRushReward||0}`,W/2,H*.265);const grades=(G.bossRushResults||[]).map(r=>r.grade);cx.fillStyle='#9fe6ff';cx.font='900 11px system-ui';cx.fillText(`JEFES · ${grades.join('  ')}`,W/2,H*.31);cx.fillStyle='#899fac';cx.font='700 9.5px system-ui';cx.fillText(`MEJOR RANGO ${META.bestBossRushRank||'-'} · MEJOR TIEMPO ${META.bestBossRushTime?META.bestBossRushTime.toFixed(1)+'s':'-'} · VICTORIAS ${META.bossRushWins}`,W/2,H*.345);drawRelicStrip(H*.38,compactUI()?.78:.9);
  }else if(finale){cx.fillText(`PUNTOS ${G.score.toLocaleString()} · BONUS FINAL ¤ ${G.finalReward||0} · CAMPAÑAS ${META.campaignWins}`,W/2,H*.27);cx.fillStyle='#d9a7ff';cx.font='900 12px system-ui';cx.fillText('☠ BOSS RUSH DESBLOQUEADO · NÚCLEO OMEGA ASEGURADO',W/2,H*.315);drawRelicStrip(H*.35,compactUI()?.78:.9);cx.fillStyle='#9fe6ff';cx.font='700 10px system-ui';cx.fillText(`MEJOR CAMPAÑA ${META.bestCampaignScore.toLocaleString()} · RELIQUIAS ${relicCount()}/4 · 10 LINAJES DISPONIBLES PARA REPLAY`,W/2,H*.435);
  }else if(training){cx.fillText(`OBJETIVOS ${G.kills} · AMENAZAS FRONTALES ${G.frontKills||0}`,W/2,H*.30);
  }else{cx.fillText(`PUNTOS ${G.score.toLocaleString()} · CRÉDITOS ¤ ${G.credits.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()}`,W/2,H*.30);if(G.lastBossDrop){cx.fillStyle='#ffd76a';cx.font='800 11px system-ui';cx.fillText(`HERENCIA DESBLOQUEADA · ${HERITAGE_NAMES[G.sector]||POWERS[G.lastBossDrop]?.name||''}`,W/2,H*.355);}if(G.lastRelic&&RELICS[G.lastRelic]){const r=RELICS[G.lastRelic];cx.fillStyle=r.color;cx.font='900 11px system-ui';cx.fillText(`${r.icon} RELIQUIA ASEGURADA · ${r.name} · ${r.desc}`,W/2,H*.395);}if(G.bossMasteryAchieved){cx.fillStyle='#fff09a';cx.font='900 11px system-ui';cx.fillText('★ MAESTRÍA DE JEFE · SIN IMPACTOS',W/2,H*.435);}if(G.waveMedals?.length){cx.fillStyle='#9fe6ff';cx.font='800 10px system-ui';cx.fillText(`ORDAS · ${G.waveMedals.slice(-3).map(m=>m.grade).join(' · ')} · BONUS ¤ ${G.bonusCredits||0}`,W/2,H*.47);}}
  const w=Math.min(310,W*.34),h=50,x=W/2-w/2;if(rush){uiButton('victory_bossrush','↻ REPETIR BOSS RUSH',x,H*.55,w,h,'#fff09a');uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.68,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.81,w,h,'#8edbff');}else if(finale){uiButton('victory_bossrush','☠ INICIAR BOSS RUSH',x,H*.52,w,h,'#fff09a','10 soberanos consecutivos');uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.65,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.78,w,h,'#8edbff');}else if(training){uiButton('victory_new','▶ INICIAR CAMPAÑA',x,H*.48,w,h,'#a6ff5f');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.62,w,h,'#8edbff');}else{if(G.sector<SECTORS.length)uiButton('victory_next',`▶ ENTRAR AL SECTOR ${G.sector+1}`,x,H*.54,w,h,'#a6ff5f',SECTORS[G.sector].name);else uiButton('victory_new','↻ NUEVA CAMPAÑA',x,H*.54,w,h,'#a6ff5f','has vencido los diez linajes');uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.67,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.80,w,h,'#8edbff');}cx.textAlign='left';
}
function drawDead(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.63)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#ff667d';cx.font=`900 ${Math.min(43,W*.055)}px system-ui`;cx.fillText('NAVE PERDIDA',W/2,H*.23);cx.fillStyle='#fff';cx.font='800 15px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.31);const w=Math.min(300,W*.34),x=W/2-w/2,h=48;uiButton('dead_retry','↻ REINTENTAR SECTOR',x,H*.42,w,h,'#a6ff5f');if(hasSave())uiButton('dead_load','▣ CARGAR CHECKPOINT',x,H*.54,w,h,'#7dc8ff');uiButton('dead_menu','MENÚ PRINCIPAL',x,H*.68,w,h,'#ffb7e8');cx.textAlign='left';}
function drawGuide(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.84)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#a6ff5f';cx.font=`900 ${Math.min(30,W*.04)}px system-ui`;cx.fillText('MANUAL DE SUPERVIVENCIA',W/2,40);
  const pages=[
    {title:'CONTROLES',cards:[['MOVER','Sin clic. En PC la nave sigue el mouse o touchpad; en móvil desliza el dedo en cualquier zona libre de la pantalla.','move'],['DISPARO AUTOMÁTICO','No hay botón de fuego. Tu tarea es posicionarte, limpiar corredores y sostener la cadencia.','shoot'],['CONTROL DIRECTO','No hay joystick ni DASH. La nave responde al dedo, mouse o touchpad; el estabilizador del Hangar mejora la precisión de maniobra.','move']]},
    {title:'COMBATE',cards:[['PODERES, COMBOS Y ESCOLTAS','Hasta dos poderes activos; la formación auxiliar crece hasta cinco naves y puede heredar efectos de tu arma sin saturar la pantalla.','powers'],['AMENAZAS FRONTALES','Meteoros, arietes, cápsulas y restos de batalla llegan hacia cámara con trayectoria anunciada. Interceptarlos pronto aumenta la recompensa.','front'],['JEFES Y FASES','Cada jefe escala por fases, anuncia ataques y cambia la arena con habilidades exclusivas.','boss']]},
    {title:'PROGRESIÓN',cards:[['REPETIR Y CHECKPOINTS','Entrena sin castigo, repite sectores y salta a la arena del jefe con 50% de vida.','replay'],['HANGAR PERMANENTE','Todo lo comprado permanece entre partidas: casco, escudo, daño, motor, drones y más.','hangar'],['XP, RANGOS Y HERENCIAS','Los poderes suben de rango I a III según el mundo. Completar Frenesí y oleadas limpias aumenta XP, créditos y recompensas.','progress']]}
  ];
  guidePage=clamp(guidePage,0,pages.length-1);const page=pages[guidePage];cx.fillStyle='#d9ecf8';cx.font='800 13px system-ui';cx.fillText(`${guidePage+1}/${pages.length} · ${page.title}`,W/2,62);
  const margin=Math.max(32,W*.08),top=84,gap=18,cw=(W-margin*2-gap*2)/3,ch=Math.min(250,H-top-84);
  page.cards.forEach((it,i)=>{const x=margin+i*(cw+gap),y=top;cx.fillStyle='rgba(4,12,25,.72)';cx.strokeStyle='rgba(99,246,255,.18)';rr(x,y,cw,ch,16);cx.fill();cx.stroke();drawGuideThumb(it[2],x+10,y+10,cw-20,88);cx.textAlign='left';cx.fillStyle='#7ef4ff';cx.font='900 13px system-ui';cx.fillText(it[0],x+14,y+116);cx.fillStyle='#d3e0ea';cx.font='600 10.8px system-ui';drawTextLines(it[1],x+14,y+138,cw-28,15);});
  uiButton('guide_prev','‹ ANTERIOR',24,H-46,140,32,guidePage>0?'#8edbff':'#526575');uiButton('guide_next','SIGUIENTE ›',W-164,H-46,140,32,guidePage<pages.length-1?'#8edbff':'#526575');uiButton('guide_back','← VOLVER',W/2-70,H-46,140,32,'#a6ff5f');cx.textAlign='left';
}
function drawTextLines(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);}

function handleTap(x,y){
  if(!G)return;const hit=[...UI.buttons].reverse().find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(!hit)return;AudioX.unlock();const id=hit.id;
  if(id==='menu_new'){newRun(1);return;}if(id==='menu_bossrush'){startBossRush();return;}if(id==='menu_training'){if(allBossesDefeated()&&compactUI())startBossRush();else startTraining();return;}if(id==='menu_load'){if(!loadRun())notify('NO HAY CHECKPOINT','#ff7188',1.6);return;}if(id==='menu_guide'){guidePage=0;setScreen('GUIDE');return;}if(id==='menu_store'){G.credits=META.credits;openStore('MENU');return;}
  if(id==='sector_prev'){menuSector=Math.max(1,menuSector-1);return;}if(id==='sector_next'){menuSector=Math.min(META.unlocked,menuSector+1);return;}if(id==='sector_start'){newRun(menuSector);return;}if(id==='sector_boss'){startBossCheckpoint(menuSector);return;}
  if(id==='pause_resume'){resumeGame();return;}if(id==='pause_save'){if(G.mode==='bossRush')notify('BOSS RUSH · SIN CHECKPOINTS','#fff09a',1.7);else saveRun();return;}if(id==='pause_store'){openStore('PAUSE');return;}if(id==='pause_menu'){AudioX.stopBoss();META.credits=G.credits;saveMeta();setScreen('MENU');return;}
  if(id.startsWith('buy_')){buyUpgrade(id.slice(4));return;}if(id==='store_close'){closeStore();return;}
  if(id==='victory_bossrush'){startBossRush();return;}if(id==='victory_next'){const next=G.sector+1;enterSector(next,true);setScreen('GAME');saveRun();return;}if(id==='victory_new'){newRun(1);return;}if(id==='victory_store'){shopReturn='VICTORY';setScreen('STORE');return;}if(id==='victory_menu'){setScreen('MENU');return;}
  if(id==='dead_retry'){if(G.mode==='training')startTraining();else if(G.bossCheckpoint)startBossCheckpoint(G.sector);else newRun(G.sector);return;}if(id==='dead_load'){loadRun();return;}if(id==='dead_menu'){setScreen('MENU');return;}if(id==='guide_prev'){guidePage=Math.max(0,guidePage-1);return;}if(id==='guide_next'){guidePage=Math.min(2,guidePage+1);return;}if(id==='guide_back'){setScreen('MENU');return;}
}

// ─────────────────────────────────────────────────────────────
// MAIN RENDER LOOP
// ─────────────────────────────────────────────────────────────
function render(){
  if(!G)return;switch(G.screen){case'GAME':drawGame();break;case'PAUSE':drawPause();break;case'STORE':drawStore();break;case'VICTORY':drawVictory();break;case'DEAD':drawDead();break;case'GUIDE':drawGuide();break;default:drawMenu();}
}
function loop(now){const dt=Math.min(.033,Math.max(.001,(now-lastT)/1000));lastT=now;update(dt);render();requestAnimationFrame(loop);}

// Initialize menu state after data and helpers exist.
G={screen:'MENU',mode:'campaign',sector:1,wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],boss:null,powers:{},powerQueue:[],elapsed:0,kills:0,goal:1,combo:0,comboT:0,waveBanner:0,sectorBanner:0,xp:0,level:1,xpNext:120,maxActivePowers:POWER_SLOT_LIMIT,maxQueuePowers:POWER_QUEUE_LIMIT,heritageNext:null,activeCombos:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,frenzyKills:0,frenzyTarget:0,frenzyDone:false,bossWarningT:0,bossWarningText:'',bossCheckpoint:false,trainingBoss:false,postBossT:0,postBossMax:0,frontTimer:7,frontKills:0,waveFrontKills:0,waveHits:0,waveStartT:0,waveMedals:[],powerRanks:{},bossHits:0,bossMasteryAchieved:false,bonusCredits:0,bossRushIndex:0,bossRushScore:0,bossRushComplete:false,bossRushResults:[],bossRushReward:0,bossRushRank:'',bossRushTime:0,bossStartElapsed:0,lastRelic:0,campaignComplete:false,finalReward:0};
menuSector=clamp(META.unlocked||1,1,SECTORS.length);setScreen('MENU');
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
requestAnimationFrame(loop);

})();

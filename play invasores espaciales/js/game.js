(()=>{
'use strict';

const DATA = window.STARFALL_DATA;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const menuScreen = document.getElementById('menuScreen');
const hangarScreen = document.getElementById('hangarScreen');
const rankingScreen = document.getElementById('rankingScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const toastLayer = document.getElementById('toastLayer');
const inputName = document.getElementById('playerName');
const shipCards = document.getElementById('shipCards');
const rankingList = document.getElementById('rankingList');
const pauseBtn = document.getElementById('pauseBtn');
const btnResume = document.getElementById('btnResume');
const btnPauseSave = document.getElementById('btnPauseSave');
const btnRetryCheckpoint = document.getElementById('btnRetryCheckpoint');
const btnBackMenu = document.getElementById('btnBackMenu');

const STORAGE_KEYS = {
  save: 'starfall_frontier_save_v042',
  ranking: 'starfall_frontier_ranking_v042',
  selectedShip: 'starfall_frontier_ship_v042',
  playerName: 'starfall_frontier_name_v042'
};

const SHIPS = {
  vanguard: { name: 'Vanguard', speed: 6.4, maxHealth: 120, maxShield: 56, fireRate: 0.17, damage: 15, spread: 1, scale: .60 },
  warden: { name: 'Warden', speed: 5.5, maxHealth: 155, maxShield: 72, fireRate: 0.20, damage: 16, spread: 1, scale: .66 },
  specter: { name: 'Specter', speed: 7.6, maxHealth: 102, maxShield: 44, fireRate: 0.14, damage: 13, spread: 2, scale: .58 }
};
const POWERUP_ORDER = ['rafaga','laser','misiles','escudo','dron_aliado','emp','iman','vida','reparacion','sobrescudo','multiplicador'];
const ENEMY_BASE = {
  swarmer:{hp:24,speed:1.2,score:60,shoot:1.6,size:54,color:'#ff738d'},
  stinger:{hp:32,speed:1.05,score:75,shoot:1.2,size:58,color:'#ffc36b'},
  hunter:{hp:40,speed:1.1,score:90,shoot:1.5,size:60,color:'#8ad7ff'},
  sentinel:{hp:62,speed:.8,score:110,shoot:1.9,size:68,color:'#8eff9f'},
  spitter:{hp:46,speed:.96,score:95,shoot:1.4,size:60,color:'#f08cff'},
  phantom:{hp:54,speed:.92,score:105,shoot:1.7,size:62,color:'#c9b8ff'}
};

const state = {
  mode: 'menu',
  running: false,
  loading: false,
  now: 0,
  lastTime: 0,
  worldIndex: 0,
  wave: 1,
  waveActive: false,
  worldTransition: false,
  bossDefeated: false,
  scroll: 0,
  effects: [],
  toasts: [],
  rankingDirty: true,
  keyboard: {},
  pointer: {active:false, x:0, y:0},
  player: null,
  playerName: localStorage.getItem(STORAGE_KEYS.playerName) || 'Piloto',
  shipKey: localStorage.getItem(STORAGE_KEYS.selectedShip) || 'vanguard',
  score: 0,
  scoreMul: 1,
  relics: 0,
  sectorClearCount: 0,
  lives: 3,
  kills: 0,
  chain: 0,
  maxChain: 0,
  waveTimer: 0,
  fireTimer: 0,
  savedCheckpoint: null,
  enemyBullets: [],
  playerBullets: [],
  enemies: [],
  drops: [],
  obstacles: [],
  allies: [],
  particles: [],
  stars: [],
  currentAssets: null,
  assetPromises: {},
  loadedImages: new Map(),
  screenFlash: 0,
  lastDamageToast: 0
};

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function rand(a,b){ return a + Math.random()*(b-a); }
function irand(a,b){ return Math.floor(rand(a,b+1)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function lerp(a,b,t){ return a + (b-a)*t; }
function dist(a,b,c,d){ const dx=a-c, dy=b-d; return Math.hypot(dx,dy); }

function formatLives(n){ return Array.from({length:n}, ()=> '❤').join(' '); }
function saveJSON(key,obj){ localStorage.setItem(key, JSON.stringify(obj)); }
function loadJSON(key, fallback=null){ try{ const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e){ return fallback; } }

function screen(name, show=true){
  const map = {menu:menuScreen, hangar:hangarScreen, ranking:rankingScreen, pause:pauseScreen, gameover:gameOverScreen};
  if(map[name]) map[name].classList.toggle('hidden', !show), map[name].classList.toggle('visible', show);
}
function hideAllScreens(){ [menuScreen,hangarScreen,rankingScreen,pauseScreen,gameOverScreen].forEach(el=>{el.classList.add('hidden'); el.classList.remove('visible');}); }

function toast(text, kind='good', yPct=.68){
  const div=document.createElement('div');
  div.className=`toast ${kind}`;
  div.style.top=(window.innerHeight*yPct)+'px';
  div.textContent=text;
  toastLayer.appendChild(div);
  setTimeout(()=> div.remove(), 1150);
}

function initStars(){
  state.stars = [];
  for(let i=0;i<140;i++) state.stars.push({x:Math.random(), y:Math.random(), s:rand(.5,2.4), a:rand(.3,.95)});
}

function resize(){
  const dpr=Math.min(window.devicePixelRatio||1, 2);
  canvas.width=Math.floor(window.innerWidth*dpr);
  canvas.height=Math.floor(window.innerHeight*dpr);
  canvas.style.width=window.innerWidth+'px';
  canvas.style.height=window.innerHeight+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize', resize);

const audio = window.SFAudio;

function assetPath(ref){
  if(!ref) return null;
  if(typeof ref === 'string') return ref;
  return ref.path || ref.base || ref.sheet || null;
}
function image(src){
  src = assetPath(src);
  if(!src) return new Image();
  if(state.loadedImages.has(src)) return state.loadedImages.get(src);
  const img = new Image();
  img.src = src;
  img.decoding = 'async';
  state.loadedImages.set(src, img);
  return img;
}
function makeAnim(path, frames=1, fps=8){
  const src = assetPath(path);
  if(!src) return null;
  return { img:image(src), frames:Math.max(1,frames||1), fps };
}
function preload(srcs=[]){ return Promise.all(srcs.filter(Boolean).map(src => new Promise(resolve => {
  const img=image(src);
  if(img.complete) resolve();
  else { img.onload=()=>resolve(); img.onerror=()=>resolve(); }
}))); }

function getWorld(i){ return DATA.worlds[i]; }
function normalizeShipKey(k){ return SHIPS[k] ? k : 'vanguard'; }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function buildWorldBundle(index){
  const world = getWorld(index);
  const prev = index>0 ? getWorld(index-1) : null;
  const srcs=[];
  srcs.push(...Object.values(DATA.global.ships).map(a=>a.path));
  srcs.push(...Object.values(DATA.global.powerups).map(a=>a.path));
  srcs.push(...Object.values(DATA.global.fx).map(a=>a.path));
  srcs.push(world.backgrounds.base, world.backgrounds.intense, world.backgrounds.boss, world.backgrounds.far, world.backgrounds.near);
  srcs.push(...Object.values(world.minions).flatMap(m=> [m.base,m.variant,m.sheet]));
  srcs.push(...world.subbosses.flatMap(s=>[s.base,s.sheet]));
  srcs.push(...world.boss.phases, world.boss.coreOpen, world.boss.relic, world.boss.reborn, world.boss.animSheet, world.boss.deathSheet, world.boss.relicFloat, world.boss.relicAttach);
  srcs.push(...world.projectiles.flatMap(p=>[p.base,p.sheet]), ...world.obstacles.map(o=>o.path));
  if(prev){
    srcs.push(...Object.values(prev.minions).flatMap(m=> [m.base,m.variant,m.sheet]));
    srcs.push(...prev.obstacles.map(o=>o.path));
  }
  return {world, prev, srcs:[...new Set(srcs.filter(Boolean))]};
}
async function loadWorld(index){
  const bundle = buildWorldBundle(index);
  state.loading = true;
  toast(`Cargando ${bundle.world.label}...`, 'warn', .55);
  await preload(bundle.srcs);
  state.currentAssets = bundle;
  state.loading = false;
  if(audio){ audio.warmWorld(index); if(state.mode==='playing' && state.running) audio.playAmbience(index); }
}

function getSelectedShip(){ return SHIPS[normalizeShipKey(state.shipKey)]; }
function setSelectedShip(key){ state.shipKey = normalizeShipKey(key); localStorage.setItem(STORAGE_KEYS.selectedShip, state.shipKey); renderHangar(); }

function playerFactory(fromSave=false){
  const spec = getSelectedShip();
  const img = image(DATA.global.ships[state.shipKey].path);
  return {
    x: window.innerWidth*0.5,
    y: window.innerHeight*0.83,
    w: 108*spec.scale*1.65,
    h: 136*spec.scale*1.65,
    img,
    speed: spec.speed,
    maxHealth: spec.maxHealth + state.relics*4,
    health: spec.maxHealth + state.relics*4,
    maxShield: spec.maxShield + Math.floor(state.relics*1.5),
    shield: spec.maxShield + Math.floor(state.relics*1.5),
    fireRate: spec.fireRate,
    damage: spec.damage + state.relics*1.25,
    spread: spec.spread,
    rapidUntil: 0,
    laserUntil: 0,
    missilesUntil: 0,
    magnetUntil: 0,
    multiplierUntil: 0,
    invuln: fromSave ? 0 : 1.2,
    drone: false,
    droneAngle: 0,
    relicAuras: []
  };
}

function initGameState(){
  state.score = 0; state.relics = 0; state.lives = 3; state.kills=0; state.chain=0; state.maxChain=0; state.scoreMul=1;
  state.worldIndex = 0; state.wave = 1; state.sectorClearCount=0; state.worldTransition=false; state.bossDefeated=false;
  state.enemyBullets=[]; state.playerBullets=[]; state.enemies=[]; state.drops=[]; state.obstacles=[]; state.allies=[]; state.particles=[];
  state.player = playerFactory();
  state.fireTimer = 0; state.waveTimer = 0; state.running = true; state.mode='playing';
}

function updateHUD(){
  if(!state.player) return;
  document.getElementById('playerNameHud').textContent = state.playerName || 'Piloto';
  document.getElementById('shipHud').textContent = getSelectedShip().name;
  document.getElementById('worldHud').textContent = `${getWorld(state.worldIndex).label} · ${getWorld(state.worldIndex).sector}`;
  document.getElementById('waveHud').textContent = state.wave===4 ? 'JEFE' : `Oleada ${state.wave}`;
  document.getElementById('scoreHud').textContent = Math.floor(state.score).toString();
  document.getElementById('livesHud').textContent = formatLives(state.lives);
  document.getElementById('relicHud').textContent = state.relics;
  document.getElementById('healthBar').style.width = clamp(state.player.health/state.player.maxHealth,0,1)*100 + '%';
  document.getElementById('shieldBar').style.width = clamp(state.player.shield/state.player.maxShield,0,1)*100 + '%';
  const boss = state.enemies.find(e=>e.kind==='boss');
  document.getElementById('bossBar').style.width = boss ? clamp(boss.hp/boss.maxHp,0,1)*100 + '%' : '0%';
}

function saveCheckpoint(){
  if(state.mode==='playing' && audio?.unlocked) audio.ui('ui_checkpoint',.45);
  state.savedCheckpoint = {
    name: state.playerName,
    shipKey: state.shipKey,
    worldIndex: state.worldIndex,
    score: state.score,
    relics: state.relics,
    lives: state.lives,
    sectorClearCount: state.sectorClearCount
  };
  saveJSON(STORAGE_KEYS.save, state.savedCheckpoint);
}
function loadSave(){ return loadJSON(STORAGE_KEYS.save); }
function clearSave(){ localStorage.removeItem(STORAGE_KEYS.save); }

function ranking(){ return loadJSON(STORAGE_KEYS.ranking, []); }
function addRankingEntry(name, score, worldIndex){
  const list = ranking();
  list.push({name, score:Math.floor(score), sector: worldIndex+1, when:new Date().toISOString()});
  list.sort((a,b)=>b.score-a.score);
  saveJSON(STORAGE_KEYS.ranking, list.slice(0,10));
}
function renderRanking(){
  const list = ranking();
  rankingList.innerHTML='';
  if(!list.length){ rankingList.innerHTML='<li>Sin registros todavía.</li>'; return; }
  list.forEach(row=>{
    const li=document.createElement('li');
    li.textContent=`${row.name} — ${row.score} pts · Sector ${row.sector}`;
    rankingList.appendChild(li);
  });
}

function renderHangar(){
  shipCards.innerHTML='';
  Object.entries(SHIPS).forEach(([key, spec])=>{
    const card=document.createElement('div'); card.className='ship-card'+(key===state.shipKey?' selected':'');
    const img=document.createElement('img'); img.src=DATA.global.ships[key].path;
    const h3=document.createElement('h3'); h3.textContent=spec.name;
    const p=document.createElement('div'); p.className='ship-stats';
    const stats=[['Poder', spec.damage*5], ['Velocidad', spec.speed*12], ['Escudo', spec.maxShield]];
    stats.forEach(([label,val])=>{
      const row=document.createElement('div'); row.className='ship-stat'; row.innerHTML=`<span>${label}</span><div class="stat-meter"><div style="width:${clamp(val,0,100)}%"></div></div>`;
      p.appendChild(row);
    });
    card.append(img,h3,p);
    card.addEventListener('click', ()=>{ audio.unlock(); audio.ui('ui_click_confirm',.55); setSelectedShip(key); });
    shipCards.appendChild(card);
  });
}

function enemyRoleStats(role, tier=1){
  const base = ENEMY_BASE[role] || ENEMY_BASE.swarmer;
  const worldFactor = 1 + state.worldIndex*0.12;
  return {
    hp: Math.round(base.hp*worldFactor*tier),
    speed: base.speed + state.worldIndex*0.04,
    shoot: Math.max(.5, base.shoot - state.worldIndex*0.02),
    score: Math.round(base.score*worldFactor*tier),
    size: base.size + state.worldIndex*1.1,
    color: base.color
  };
}

function spawnWave(){
  if(state.loading || state.worldTransition) return;
  state.enemies=[]; state.enemyBullets=[]; state.drops=[]; state.obstacles=[]; state.waveActive=true; state.waveTimer=0; state.bossDefeated=false;
  const world = getWorld(state.worldIndex); const prev = state.worldIndex>0 ? getWorld(state.worldIndex-1) : null;
  if(state.wave < 4){
    const rowsBase = Math.min(6, 3 + Math.floor(state.worldIndex/4) + state.wave-1);
    const colsBase = Math.min(9, Math.max(5, Math.floor(window.innerWidth/118) + (state.wave>=2?1:0)));
    const rolesCurr = world.minionRoles;
    const rolesPrev = prev ? prev.minionRoles : [];
    const topGap = Math.max(58, window.innerHeight*0.06);
    const rowGap = clamp(window.innerHeight*0.058, 52, 86);
    const colGap = clamp(window.innerWidth*0.092, 72, 118);
    const startX = window.innerWidth/2 - ((colsBase-1)*colGap)/2;
    const startY = topGap + 26;
    for(let r=0;r<rowsBase;r++){
      for(let c=0;c<colsBase;c++){
        let role;
        if(state.wave===1) role = rolesCurr[(r+c)%rolesCurr.length];
        else if(state.wave===2 && rolesPrev.length && Math.random()<0.28) role = rolesPrev[(r+c)%rolesPrev.length];
        else if(state.wave===3 && rolesPrev.length && Math.random()<0.20) role = rolesPrev[(r*2+c)%rolesPrev.length];
        else role = rolesCurr[(r*2+c)%rolesCurr.length];
        const fromPrev = rolesPrev.includes(role) && !(role in world.minions);
        const rolePack = fromPrev ? prev.minions[role] : (world.minions[role] || prev?.minions[role]);
        if(!rolePack) continue;
        const tier = state.wave===3 && (r===0 || c===Math.floor(colsBase/2)) ? 1.6 : 1;
        const stats = enemyRoleStats(role, tier);
        const sprite = Math.random()<0.4 ? rolePack.variant : rolePack.base;
        state.enemies.push({
          kind:'minion', role, x:startX + c*colGap, y:startY + r*rowGap, homeX:startX + c*colGap, homeY:startY + r*rowGap,
          w:stats.size, h:stats.size*1.05, img:image(sprite), anim:makeAnim(rolePack.sheet, rolePack.frames, role==='sentinel'?6:8), hp:stats.hp, maxHp:stats.hp, speed:stats.speed, shootCd:rand(.3,stats.shoot), score:stats.score,
          tier, t:rand(0,6.28), formation:true, dive:false, color:world.palette.neon_a || stats.color
        });
      }
    }
    if(state.wave>=2){
      spawnObstacleRow(state.wave===3 ? 3 : 2);
    }
    if(state.wave>=2){
      const sb = world.subbosses[state.wave===2?0:1] || world.subbosses[0];
      const hpBase = state.wave===2 ? 190 : 275;
      state.enemies.push({
        kind:'subboss', role:'subboss', x:window.innerWidth*0.5, y:startY + rowsBase*rowGap + 18, homeX:window.innerWidth*0.5, homeY:startY + rowsBase*rowGap + 18,
        w:(state.wave===2?122:142) + state.worldIndex*2, h:(state.wave===2?122:142) + state.worldIndex*2, img:image(sb.base), anim:makeAnim(sb.sheet, sb.frames, 7), hp:hpBase + state.worldIndex*(state.wave===2?58:76), maxHp:hpBase + state.worldIndex*(state.wave===2?58:76),
        speed:1.1 + state.worldIndex*0.03, shootCd:state.wave===2?1.45:1.15, score:(state.wave===2?340:520) + state.worldIndex*60, pattern:sb.id, subbossAsset:sb, attackIndex:0, t:0, formation:true
      });
      toast(`SUBJEFE ${sb.id.toUpperCase()} DETECTADO`, 'warn', .30); audio.subboss(state.worldIndex, sb.id, 'intro', 1); audio.stinger('stinger_boss_alert', .72);
    } else {
      toast(`OLEADA ${state.wave}`, 'good', .26);
    }
  } else {
    const bossSprite = world.boss.phases[0];
    state.enemies.push({
      kind:'boss', role:'boss', x:window.innerWidth*0.5, y:Math.max(110, window.innerHeight*0.16),
      w:Math.min(window.innerWidth*0.42, 360 + state.worldIndex*4), h:Math.min(window.innerWidth*0.42, 360 + state.worldIndex*4),
      img:image(bossSprite), anim:makeAnim(world.boss.animSheet, world.boss.animFrames, 10), deathAnim:makeAnim(world.boss.deathSheet, world.boss.deathFrames, 8), hp:820 + state.worldIndex*190, maxHp:820 + state.worldIndex*190,
      phase:0, patternSeed: state.worldIndex, attackIndex:0, shootCd:1.2, vx:2.1 + state.worldIndex*0.05, vy:.6, t:0, shield:160 + state.worldIndex*18, lastPhaseToast:-1,
      revived:false, score:3600 + state.worldIndex*500
    });
    spawnObstacleRow(3);
    toast(`${world.bossName.toUpperCase()} · ENTRANDO`, 'warn', .24); audio.stinger('stinger_boss_alert', 1); audio.boss(state.worldIndex, 'intro', 1); audio.playAmbience(state.worldIndex);
  }
}

function spawnObstacleRow(count=2){
  const world = getWorld(state.worldIndex); const prev = state.worldIndex>0 ? getWorld(state.worldIndex-1) : null;
  const obsPool = [...world.obstacles, ...(prev ? prev.obstacles.slice(0,2):[])].filter(Boolean);
  for(let i=0;i<count;i++){
    const fromLeft = i%2===0;
    const y = rand(window.innerHeight*0.30, window.innerHeight*0.68);
    const size = rand(84, 138);
    const obs = pick(obsPool);
    state.obstacles.push({
      x: fromLeft ? -size : window.innerWidth+size, y, w:size, h:size, img:image(obs.path||obs), hp:160 + state.worldIndex*45, maxHp:160 + state.worldIndex*45,
      vx:(fromLeft?1:-1)*rand(1.2,2.8)*(1+state.worldIndex*0.03), vy: rand(-.18,.18), rot:0, vr:rand(-.03,.03), kind:'obstacle',
      score:160, ttl:50, drift: Math.random()<0.26
    });
    const obsName=((obs&&obs.name)||'').toLowerCase();
    audio.obstacle(obsName.includes('meteor')?'obstacle_meteor_passby':'obstacle_debris_passby',.38);
  }
}

function firePlayerShot(){
  const p = state.player; if(!p) return;
  const spreadCount = p.spread + (state.relics>=4?1:0);
  const extra = state.now < p.missilesUntil ? 2 : 0;
  const dmg = p.damage * (state.now < p.laserUntil ? 1.7 : 1);
  for(let i=0;i<spreadCount;i++){
    const offset = spreadCount===1 ? 0 : (i - (spreadCount-1)/2) * 16;
    state.playerBullets.push({x:p.x+offset,y:p.y-p.h*0.4,vx:offset*0.03,vy:-10.2,w:7,h:18,damage:dmg,life:1.3,color:'#b2f6ff',type:'bullet'});
  }
  for(let i=0;i<extra;i++){
    const offset = i===0 ? -24 : 24;
    state.playerBullets.push({x:p.x+offset,y:p.y-p.h*0.32,vx:offset*0.03,vy:-8.8,w:10,h:22,damage:dmg*1.15,life:1.5,color:'#ffc86c',type:'missile', wobble: i===0?-1:1, t:0});
  }
  if(state.now < p.laserUntil){
    state.playerBullets.push({x:p.x,y:p.y-p.h*0.65,vx:0,vy:-14,w:16,h:42,damage:dmg*1.4,life:.25,color:'#63d7ff',type:'laser'});
  }
  if(p.drone){
    const a = p.droneAngle;
    state.playerBullets.push({x:p.x+Math.cos(a)*46, y:p.y+Math.sin(a)*18-12, vx:0, vy:-8.7, w:5,h:12,damage:p.damage*.75,life:1.2,color:'#8cffbd',type:'drone'});
  }
  if(state.now < p.laserUntil) audio.playerWeapon('player_shot_laser', .78, .09);
  else if(state.now < p.missilesUntil) audio.playerWeapon('player_shot_missile', .78, .10);
  else if(state.now < p.rapidUntil) audio.playerWeapon('player_shot_rapid', .70, .055);
  else audio.playerWeapon('player_shot_basic', .62, .07);
  if(p.drone) audio.playerWeapon('player_shot_drone', .34, .18);
}

function projectileType(asset){
  if(!asset) return 'orb';
  const f=(asset.funcion||'').toLowerCase();
  const name=(asset.name||'').toLowerCase();
  for(const t of ['beamseg','seeker','lance','ring','wave','bolt','shard','egg','petal','drone','feather','orb']){
    if(f.includes(`tipo ${t}`) || name.includes(t)) return t;
  }
  if(name.includes('haz') || name.includes('rayo')) return 'beamseg';
  if(name.includes('busc')) return 'seeker';
  if(name.includes('onda') || name.includes('marejada') || name.includes('llamarada')) return 'wave';
  if(name.includes('pulso') || name.includes('anillo') || name.includes('corona') || name.includes('portal')) return 'ring';
  if(name.includes('lanza')) return 'lance';
  if(name.includes('dardo') || name.includes('aguijon') || name.includes('remache') || name.includes('brasa')) return 'bolt';
  if(name.includes('fragmento') || name.includes('astilla')) return 'shard';
  return 'orb';
}
function prettyAttackName(asset){
  if(!asset) return 'ATAQUE ESPECIAL';
  return (asset.name||'ataque especial').replace(/^subboss_[ab]_/, '').replaceAll('_',' ').toUpperCase();
}
function projectileAnim(asset){ return asset && asset.sheet ? makeAnim(asset.sheet, asset.frames, 10) : null; }
function generalProjectiles(world){ return world.projectiles.filter(p=>!p.name.startsWith('subboss_')); }
function subbossProjectile(world,id){ return world.projectiles.find(p=>p.name.startsWith(`subboss_${id}_`)) || generalProjectiles(world)[id==='a'?0:1] || world.projectiles[0]; }

function spawnEnemyProjectile(origin, asset, opts={}){
  const type=opts.type || projectileType(asset);
  const img=asset ? image(asset.base) : null;
  const anim=projectileAnim(asset);
  const aimed=angleTo(origin.x,origin.y,state.player.x,state.player.y);
  const ang=opts.angle ?? aimed;
  const speed=opts.speed ?? (type==='beamseg'?5.4:type==='lance'?5.2:type==='bolt'?4.8:type==='shard'?5.0:type==='wave'?2.8:type==='ring'?2.5:3.4);
  const size=opts.size ?? (type==='beamseg'?22:type==='ring'?26:type==='wave'?30:type==='orb'?18:16);
  const b={x:opts.x??origin.x,y:opts.y??(origin.y+(origin.h||0)*0.28),vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,w:size,h:type==='beamseg'?46:size*1.35,damage:opts.damage??(12+state.worldIndex*1.15),img,anim,type,color:getWorld(state.worldIndex).palette.core,life:opts.life??5};
  if(type==='seeker'||type==='egg'||type==='drone'){ b.type='seeker'; b.turn=opts.turn??0.028; }
  if(type==='ring'){ b.type='ring'; b.expand=opts.expand??10; }
  if(type==='wave'){ b.type='wave'; b.waveAmp=opts.waveAmp??32; b.t=rand(0,6.28); }
  if(type==='petal'||type==='feather'){ b.type=type; b.curve=opts.curve??rand(-.025,.025); }
  if(type==='beamseg'){ b.type='beamseg'; b.accel=opts.accel??0.05; }
  if(type==='shard'){ b.type='shard'; b.spin=opts.spin??rand(-.08,.08); }
  if(type==='well'){ b.type='well'; b.pull=opts.pull??120; b.life=opts.life??5; b.w=opts.size??34; b.h=b.w; }
  state.enemyBullets.push(b);
  return b;
}

function enemyShoot(enemy){
  const world=getWorld(state.worldIndex);
  if(enemy.kind==='minion'){
    const pool=generalProjectiles(world);
    const asset=pool.length ? pool[(enemy.role.length+enemy.homeY+state.worldIndex|0)%pool.length] : world.projectiles[0];
    if(enemy.role==='hunter' && Math.random()<0.22){ enemy.dive=true; enemy.vx=rand(-1.9,1.9); enemy.vy=rand(2.7,4.4); }
    let type='orb';
    if(enemy.role==='stinger') type='bolt';
    else if(enemy.role==='hunter') type='seeker';
    else if(enemy.role==='sentinel') type='ring';
    else if(enemy.role==='spitter') type='wave';
    else if(enemy.role==='phantom') type='shard';
    spawnEnemyProjectile(enemy,asset,{type,damage:9+state.worldIndex*.8,speed:3.0+state.worldIndex*.055,size:12});
    audio.minion(state.worldIndex, enemy.role, enemy.role==='swarmer'?.46:.66);
    return;
  }
  if(enemy.kind==='subboss'){
    subbossPattern(enemy,world);
    return;
  }
  if(enemy.kind==='boss') bossPattern(enemy,world);
}

function angleTo(x1,y1,x2,y2){ return Math.atan2(y2-y1, x2-x1); }

function subbossPattern(enemy, world){
  const id=enemy.pattern||'a';
  audio.subboss(state.worldIndex,id,'attack',.92);
  const asset=subbossProjectile(world,id);
  const type=projectileType(asset);
  const aimed=angleTo(enemy.x,enemy.y,state.player.x,state.player.y);
  enemy.attackIndex=(enemy.attackIndex||0)+1;
  if(id==='a'){
    const count=state.worldIndex>=10?7:5;
    for(let i=0;i<count;i++){
      const off=(i-(count-1)/2)*0.16;
      spawnEnemyProjectile(enemy,asset,{type,angle:aimed+off,speed:4.0+state.worldIndex*.06,damage:12+state.worldIndex*1.05,size:17});
    }
    if(enemy.attackIndex%3===0){
      for(let i=0;i<8;i++) spawnEnemyProjectile(enemy,asset,{type:'ring',angle:(Math.PI*2/8)*i,speed:2.15+state.worldIndex*.025,damage:10+state.worldIndex,size:15});
    }
    toast(`SUBJEFE A · ${prettyAttackName(asset)}`,'warn',.23);
  } else {
    const count=state.worldIndex>=12?5:3;
    for(let i=0;i<count;i++) spawnEnemyProjectile(enemy,asset,{type:type==='beamseg'?'beamseg':(i===1?'seeker':type),angle:aimed+(i-(count-1)/2)*0.24,speed:3.3+state.worldIndex*.05,damage:13+state.worldIndex*1.1,size:18,turn:.034});
    if(enemy.attackIndex%2===0) spawnObstacleRow(1);
    toast(`SUBJEFE B · ${prettyAttackName(asset)}`,'warn',.23);
  }
}

const BOSS_SIGNATURES=[
  'ACECHO ESCARLATA','CACERÍA PRIME','CORO BIOLUMINISCENTE','TELARAÑA MATRIARCA','MAREA OMEGA',
  'PROTOCOLO DE ASEDIO','RITO NECRO','REFRACCIÓN IMPERIAL','ERUPCIÓN TIRANA','COLAPSO CUÁNTICO',
  'HORIZONTE GRAVÍTICO','CENIZA MENTAL','FLORACIÓN TÓXICA','DECRETO ANCESTRAL','FORJA SOBERANA',
  'TEMPESTAD ARCONTE','MAREJADA ABISAL','RENACER SOLAR','CONVERGENCIA MULTIFORME','STARFALL ABSOLUTO'
];

function bossPattern(boss, world){
  const pool=generalProjectiles(world);
  if(!pool.length) return;
  boss.attackIndex=(boss.attackIndex||0)+1;
  const phase=Math.max(0,boss.phase||0);
  const unlocked=Math.min(pool.length, 2+phase);
  const asset=pool[(boss.attackIndex-1)%unlocked];
  const type=projectileType(asset);
  const aimed=angleTo(boss.x,boss.y,state.player.x,state.player.y);
  const frenzy=1+phase*.12+state.worldIndex*.012;
  const dmg=15+state.worldIndex*1.25+phase*2;
  const name=prettyAttackName(asset);

  if(type==='ring'){
    const count=10+phase*2;
    for(let i=0;i<count;i++) spawnEnemyProjectile(boss,asset,{type:'ring',angle:(Math.PI*2/count)*i,speed:2.05*frenzy,damage:dmg,size:18});
  } else if(type==='lance' || type==='beamseg'){
    const count=3+phase*2;
    for(let i=0;i<count;i++) spawnEnemyProjectile(boss,asset,{type,angle:aimed+(i-(count-1)/2)*0.13,speed:(type==='beamseg'?5.8:5.2)*frenzy,damage:dmg+2,size:20});
  } else if(type==='seeker' || type==='egg' || type==='drone'){
    const count=4+phase*2;
    for(let i=0;i<count;i++) spawnEnemyProjectile(boss,asset,{type:'seeker',angle:Math.PI/2+(i-(count-1)/2)*0.28,speed:2.15*frenzy,damage:dmg,size:18,turn:.025+phase*.006});
  } else if(type==='wave'){
    const count=3+phase;
    for(let i=0;i<count;i++) spawnEnemyProjectile(boss,asset,{type:'wave',angle:Math.PI/2+(i-(count-1)/2)*0.2,speed:2.8*frenzy,damage:dmg,size:30,waveAmp:34+phase*10});
  } else if(type==='shard' || type==='bolt' || type==='petal' || type==='feather'){
    const count=7+phase*2;
    for(let i=0;i<count;i++) spawnEnemyProjectile(boss,asset,{type,angle:aimed+(i-(count-1)/2)*0.12,speed:4.1*frenzy,damage:dmg,size:16,curve:(i-(count-1)/2)*.008});
  } else {
    const count=5+phase*2;
    for(let i=0;i<count;i++) spawnEnemyProjectile(boss,asset,{type:'orb',angle:aimed+(i-(count-1)/2)*0.17,speed:3.45*frenzy,damage:dmg,size:19});
  }
  applyBossTactic(boss,world,asset,phase);
  toast(`${BOSS_SIGNATURES[state.worldIndex]} · ${name}`,'warn',.18);
  const audioKind = ['seeker','egg','ring','wave','drone'].includes(type) ? 'control' : ['shard','bolt','petal','feather'].includes(type) ? 'secondary' : 'primary';
  audio.bossAttack(state.worldIndex, audioKind);
}

function spawnFamilyMinionNearBoss(boss, role=null, count=2){
  const world=getWorld(state.worldIndex); const roles=world.minionRoles; role=role||pick(roles); const pack=world.minions[role]; if(!pack) return;
  for(let i=0;i<count;i++){
    const stats=enemyRoleStats(role,1.25);
    state.enemies.push({kind:'minion',role,x:boss.x+(i-(count-1)/2)*74,y:boss.y+boss.h*.34,homeX:boss.x+(i-(count-1)/2)*74,homeY:boss.y+boss.h*.34+40,w:stats.size,h:stats.size*1.05,img:image(pack.base),anim:makeAnim(pack.sheet,pack.frames,8),hp:stats.hp,maxHp:stats.hp,speed:stats.speed,shootCd:.7+Math.random(),score:stats.score,t:rand(0,6.28),formation:true,dive:false,color:world.palette.neon_a});
  }
}

function applyBossTactic(boss,world,asset,phase){
  const idx=state.worldIndex;
  const aimed=angleTo(boss.x,boss.y,state.player.x,state.player.y);
  switch(idx){
    case 0: if(boss.attackIndex%3===0){ boss.x=clamp(state.player.x+rand(-170,170),boss.w*.35,window.innerWidth-boss.w*.35); spawnFamilyMinionNearBoss(boss,'hunter',2); } break;
    case 1: if(boss.attackIndex%2===0) for(let i=-1;i<=1;i++) spawnEnemyProjectile(boss,asset,{type:'lance',angle:aimed+i*.08,speed:6.2,damage:19+idx}); break;
    case 2: if(boss.attackIndex%2===0) for(let i=0;i<10;i++) spawnEnemyProjectile(boss,asset,{type:'ring',angle:i*Math.PI/5,speed:1.7+phase*.2,damage:13+idx}); break;
    case 3: if(boss.attackIndex%2===0) spawnFamilyMinionNearBoss(boss,'hunter',2+phase); break;
    case 4: if(boss.attackIndex%2===0){ state.player.y=clamp(state.player.y+18,window.innerHeight*.52,window.innerHeight-state.player.h*.48); for(let i=-2;i<=2;i++) spawnEnemyProjectile(boss,asset,{type:'wave',angle:Math.PI/2+i*.16,speed:2.6,damage:15+idx,size:32}); } break;
    case 5: if(boss.attackIndex%2===0){ boss.vx*=.55; for(let i=-2;i<=2;i++) spawnEnemyProjectile(boss,asset,{type:'beamseg',angle:Math.PI/2+i*.1,speed:6.2,damage:20+idx,size:22}); setTimeout(()=>{ if(boss) boss.vx/=.55; },450); } break;
    case 6: if(boss.attackIndex%2===0) spawnFamilyMinionNearBoss(boss,'phantom',2+phase); break;
    case 7: if(boss.attackIndex%2===0) for(let i=-2;i<=2;i++) spawnEnemyProjectile(boss,asset,{type:'shard',angle:aimed+i*.22,speed:5.4,damage:16+idx,size:15}); break;
    case 8: if(boss.attackIndex%2===0) for(let i=0;i<3;i++) spawnEnemyProjectile(boss,asset,{type:'well',angle:Math.PI/2+(i-1)*.25,speed:2.2,damage:17+idx,size:28,pull:0,life:4}); break;
    case 9: if(boss.attackIndex%3===0){ boss.x=rand(boss.w*.4,window.innerWidth-boss.w*.4); boss.img=image(world.boss.coreOpen); state.screenFlash=.2; } break;
    case 10: if(boss.attackIndex%2===0){ const a=angleTo(state.player.x,state.player.y,boss.x,boss.y); state.player.x+=Math.cos(a)*22; state.player.y+=Math.sin(a)*15; for(let i=0;i<3;i++) spawnEnemyProjectile(boss,asset,{type:'well',angle:Math.PI/2+(i-1)*.2,speed:1.8,damage:18+idx,size:30}); } break;
    case 11: if(boss.attackIndex%2===0) for(let i=0;i<8;i++) spawnEnemyProjectile(boss,asset,{type:'orb',angle:Math.PI/2+rand(-1.1,1.1),speed:rand(2.2,4.0),damage:14+idx,size:17}); break;
    case 12: if(boss.attackIndex%2===0) spawnFamilyMinionNearBoss(boss,'spitter',2+phase); break;
    case 13: if(boss.attackIndex%2===0){ boss.shield=Math.min((boss.shield||0)+120,360); for(let i=0;i<8;i++) spawnEnemyProjectile(boss,asset,{type:'ring',angle:i*Math.PI/4,speed:1.9,damage:15+idx}); } break;
    case 14: if(boss.attackIndex%2===0) spawnFamilyMinionNearBoss(boss,'sentinel',2+phase); break;
    case 15: if(boss.attackIndex%2===0) for(let i=-3;i<=3;i++) spawnEnemyProjectile(boss,asset,{type:'bolt',angle:aimed+i*.12,speed:5.5+Math.abs(i)*.15,damage:16+idx,size:15}); break;
    case 16: if(boss.attackIndex%2===0){ state.player.y=clamp(state.player.y+14,window.innerHeight*.52,window.innerHeight-state.player.h*.48); spawnFamilyMinionNearBoss(boss,'hunter',2); } break;
    case 17: if(boss.attackIndex%2===0) for(let i=0;i<14;i++) spawnEnemyProjectile(boss,asset,{type:'feather',angle:Math.PI/2+(i-6.5)*.12,speed:4.1,damage:16+idx,size:17,curve:(i-6.5)*.006}); break;
    case 18: if(boss.attackIndex%2===0){ const ox=boss.x; boss.x=window.innerWidth-ox; for(let i=0;i<6;i++) spawnEnemyProjectile(boss,asset,{type:i%2?'seeker':'shard',angle:Math.PI/2+(i-2.5)*.18,speed:3.6,damage:17+idx,size:17}); } break;
    case 19: if(boss.attackIndex%2===0){ spawnFamilyMinionNearBoss(boss,pick(world.minionRoles),3); spawnObstacleRow(1); for(let i=0;i<12;i++) spawnEnemyProjectile(boss,asset,{type:i%3===0?'ring':i%3===1?'lance':'seeker',angle:Math.PI/2+(i-5.5)*.13,speed:3.5+phase*.25,damage:19+idx,size:18}); } break;
  }
}

function updatePlayer(dt){
  const p = state.player; if(!p) return;
  p.invuln = Math.max(0, p.invuln-dt);
  const speed = p.speed * 60 * dt;
  let dx=0, dy=0;
  if(state.keyboard.ArrowLeft || state.keyboard.a) dx -= 1;
  if(state.keyboard.ArrowRight || state.keyboard.d) dx += 1;
  if(state.keyboard.ArrowUp || state.keyboard.w) dy -= 1;
  if(state.keyboard.ArrowDown || state.keyboard.s) dy += 1;
  if(state.pointer.active){
    p.x = lerp(p.x, state.pointer.x, 0.24);
    p.y = lerp(p.y, state.pointer.y, 0.24);
  } else {
    p.x += dx*speed; p.y += dy*speed;
  }
  p.x = clamp(p.x, p.w*0.55, window.innerWidth-p.w*0.55);
  p.y = clamp(p.y, window.innerHeight*0.52, window.innerHeight-p.h*0.48);
  p.droneAngle += dt*4.5;
  state.fireTimer -= dt;
  const rapid = state.now < p.rapidUntil ? 0.68 : 1;
  const cadence = p.fireRate * rapid;
  if(state.fireTimer<=0){ firePlayerShot(); state.fireTimer = cadence; }
}

function updateBullets(arr, dt, enemy=false){
  for(let i=arr.length-1;i>=0;i--){
    const b=arr[i]; b.x += (b.vx||0)*60*dt; b.y += (b.vy||0)*60*dt; b.life = (b.life??8)-dt;
    if(b.type==='missile'){ b.t=(b.t||0)+dt*10; b.x += Math.sin(b.t)*(b.wobble||1)*1.8; }
    if(b.type==='spiral'){ const ang = Math.atan2(b.vy,b.vx)+(b.spin||0); const sp=Math.hypot(b.vx,b.vy); b.vx=Math.cos(ang)*sp; b.vy=Math.sin(ang)*sp; }
    if(b.type==='seeker' && state.player){ const ang0=Math.atan2(b.vy,b.vx); const ang1=angleTo(b.x,b.y,state.player.x,state.player.y); let diff=((ang1-ang0+Math.PI*3)%(Math.PI*2))-Math.PI; diff=clamp(diff,-(b.turn||.02),(b.turn||.02)); const sp=Math.hypot(b.vx,b.vy); const ang=ang0+diff; b.vx=Math.cos(ang)*sp; b.vy=Math.sin(ang)*sp; }
    if(b.type==='ring'){ b.w += (b.expand||10)*dt*8; b.h=b.w; }
    if(b.type==='wave'){ b.t=(b.t||0)+dt*6; b.x += Math.sin(b.t)*(b.waveAmp||30)*dt; }
    if(b.type==='petal' || b.type==='feather'){ const a=Math.atan2(b.vy,b.vx)+(b.curve||0); const sp=Math.hypot(b.vx,b.vy); b.vx=Math.cos(a)*sp; b.vy=Math.sin(a)*sp; }
    if(b.type==='beamseg'){ const sp=Math.hypot(b.vx,b.vy)+(b.accel||.05); const a=Math.atan2(b.vy,b.vx); b.vx=Math.cos(a)*sp; b.vy=Math.sin(a)*sp; }
    if(b.type==='shard'){ const a=Math.atan2(b.vy,b.vx)+(b.spin||0)*dt; const sp=Math.hypot(b.vx,b.vy); b.vx=Math.cos(a)*sp; b.vy=Math.sin(a)*sp; }
    if(b.type==='well' && state.player){ const d=dist(b.x,b.y,state.player.x,state.player.y); if(d < (b.pull||120)){ const a=angleTo(state.player.x,state.player.y,b.x,b.y); state.player.x += Math.cos(a)*30*dt*(1-d/(b.pull||120)); state.player.y += Math.sin(a)*30*dt*(1-d/(b.pull||120)); } }
    if(b.life<=0 || b.y < -80 || b.y > window.innerHeight+80 || b.x < -100 || b.x > window.innerWidth+100) arr.splice(i,1);
  }
}

function updateEnemies(dt){
  const t = state.waveTimer;
  for(let i=state.enemies.length-1;i>=0;i--){
    const e=state.enemies[i]; e.t=(e.t||0)+dt;
    if(e.kind==='minion' || e.kind==='subboss'){
      if(e.formation){
        const groupOffsetX = Math.sin(t*1.3)*Math.min(window.innerWidth*0.12, 120);
        const groupOffsetY = Math.sin(t*0.7)*16;
        e.x = e.homeX + groupOffsetX + Math.sin(e.t*1.5 + e.homeY*.01)*8;
        e.y = e.homeY + groupOffsetY;
      }
      if(e.dive){ e.x += (e.vx||0)*60*dt; e.y += (e.vy||3.3)*60*dt; if(e.y>window.innerHeight+100){ e.dive=false; e.y=e.homeY; e.x=e.homeX; } }
      e.shootCd -= dt;
      if(e.shootCd<=0){ enemyShoot(e); const base = e.kind==='subboss'?2.3: Math.max(.4, enemyRoleStats(e.role).shoot); e.shootCd = base * rand(.75,1.15); }
    } else if(e.kind==='boss'){
      e.t += dt; updateBossMotion(e,dt);
      e.shootCd -= dt; if(e.shootCd<=0){ enemyShoot(e); e.shootCd = Math.max(.65, 1.75 - state.worldIndex*0.025 - (1-e.hp/e.maxHp)*0.58); }
      const phaseCount = getWorld(state.worldIndex).boss.phases.length;
      const newPhase = Math.min(phaseCount-1, Math.floor((1 - e.hp/e.maxHp) * phaseCount));
      if(newPhase !== e.phase){ e.phase = newPhase; e.img = image(getWorld(state.worldIndex).boss.phases[newPhase] || getWorld(state.worldIndex).boss.coreOpen); toast(`${getWorld(state.worldIndex).bossName.toUpperCase()} · FASE ${newPhase+1}`,'warn',.16); audio.phaseShift(state.worldIndex); state.enemyBullets.splice(0,Math.floor(state.enemyBullets.length*.22)); }
      if(e.hp/e.maxHp < 0.18) e.img = image(getWorld(state.worldIndex).boss.coreOpen);
    }
    if(e.hp<=0) killEnemy(i);
  }
}

function updateBossMotion(e,dt){
  const idx=state.worldIndex; const margin=e.w*.34;
  let speedMul=1, bob=1;
  if(idx===4||idx===16) bob=1.5;
  if(idx===5||idx===13) speedMul=.66;
  if(idx===9||idx===18) speedMul=1.35;
  if(idx===10) bob=.55;
  e.x += e.vx*speedMul*60*dt;
  e.y += Math.sin(e.t*(idx===17?2.2:1.5))*15*bob*dt*60;
  if(e.x<margin || e.x>window.innerWidth-margin) e.vx*=-1;
  e.y=clamp(e.y,82,window.innerHeight*.35);
}

function updateObstacles(dt){
  for(let i=state.obstacles.length-1;i>=0;i--){
    const o=state.obstacles[i]; o.x += o.vx*60*dt; o.y += o.vy*60*dt; o.rot += o.vr*60*dt; o.ttl-=dt;
    if(o.drift && Math.random()<0.02){ o.vy += rand(-.04,.04); }
    if(o.x < -o.w*2 || o.x > window.innerWidth + o.w*2 || o.y < -o.h*2 || o.y > window.innerHeight + o.h*2 || o.ttl<=0) state.obstacles.splice(i,1);
  }
}

function updateDrops(dt){
  const p = state.player;
  for(let i=state.drops.length-1;i>=0;i--){
    const d=state.drops[i]; d.t=(d.t||0)+dt;
    if(d.mode==='relicAuto'){
      const ang=angleTo(d.x,d.y,p.x,p.y); d.vx=Math.cos(ang)*3.8; d.vy=Math.sin(ang)*3.8;
    }
    if(state.now < p.magnetUntil){ const ang=angleTo(d.x,d.y,p.x,p.y); d.vx += Math.cos(ang)*0.18; d.vy += Math.sin(ang)*0.18; }
    d.x += (d.vx||0)*60*dt; d.y += ((d.vy||1.2)+Math.sin(d.t*6)*0.15)*60*dt;
    d.life -= dt;
    if(collide(d,p,26)){ collectDrop(d); state.drops.splice(i,1); continue; }
    if(d.life<=0 || d.y > window.innerHeight+70) state.drops.splice(i,1);
  }
}

function updateParticles(dt){
  for(let i=state.effects.length-1;i>=0;i--){ const fx=state.effects[i]; fx.t += dt; fx.life -= dt; if(fx.life<=0 && !fx.loop) state.effects.splice(i,1); }
  for(let i=state.particles.length-1;i>=0;i--){
    const p=state.particles[i]; p.x += p.vx*60*dt; p.y += p.vy*60*dt; p.life -= dt; p.vx*=0.99; p.vy*=0.99;
    if(p.life<=0) state.particles.splice(i,1);
  }
  state.screenFlash = Math.max(0, state.screenFlash-dt*1.6);
}

function spawnEffect(anim, x, y, w, h, fps=12, loop=false, life=0.8){
  if(!anim) return;
  state.effects.push({anim, x, y, w, h, fps, loop, life, t:0});
}

function maybeDrop(x,y,chance=0.15){
  if(Math.random()>chance) return;
  const type = POWERUP_ORDER[irand(0, POWERUP_ORDER.length-1)];
  state.drops.push({x,y,w:34,h:34,vx:rand(-.4,.4),vy:1.1,life:10,type,img:image(DATA.global.powerups[type].path),mode:'power'});
}
function spawnRelics(world, x, y){
  for(let i=0;i<3;i++) state.drops.push({x:x+(i-1)*18,y:y+i*8,w:38,h:38,vx:rand(-1,1),vy:-1.1-rand(0,.6),life:8,type:'relic',img:image(world.boss.relic),anim:makeAnim(world.boss.relicFloat, world.boss.relicFloatFrames, 8),mode:'relicAuto'});
}

function collectDrop(d){
  const p=state.player;
  if(d.type==='relic'){
    state.relics += 1;
    p.maxHealth += 6; p.health = Math.min(p.maxHealth, p.health+12); p.maxShield += 3; p.shield = Math.min(p.maxShield, p.shield+8); p.damage += 1.1;
    toast('RELIQUIA ADHERIDA', 'good', .58); audio.relic(state.worldIndex,'attach',1); audio.stinger('stinger_powerup',.82);
    return;
  }
  if(d.type==='vida'){ state.lives = Math.min(9, state.lives+1); toast('+1 VIDA', 'good', .58); audio.playerPower('player_extra_life',1); }
  else if(d.type==='reparacion'){ p.health = Math.min(p.maxHealth, p.health+32); toast('REPARACIÓN', 'good', .58); audio.playerPower('player_repair_pickup',1); }
  else if(d.type==='escudo'){ p.shield = Math.min(p.maxShield, p.shield+30); toast('ESCUDO', 'good', .58); audio.playerDefense('player_shield_on',.95); }
  else if(d.type==='sobrescudo'){ p.shield = Math.min(p.maxShield+26, p.shield+48); toast('SOBRESCUDO', 'good', .58); audio.playerDefense('player_shield_on',1); }
  else if(d.type==='rafaga'){ p.rapidUntil = state.now + 10; toast('RÁFAGA', 'good', .58); audio.playerPower('player_powerup_pickup',.82); }
  else if(d.type==='laser'){ p.laserUntil = state.now + 8; toast('LÁSER', 'good', .58); audio.playerPower('player_powerup_pickup',.82); }
  else if(d.type==='misiles'){ p.missilesUntil = state.now + 10; toast('MISILES', 'good', .58); audio.playerPower('player_powerup_pickup',.82); }
  else if(d.type==='dron_aliado'){ p.drone = true; toast('DRON ALIADO', 'good', .58); audio.playerPower('player_powerup_pickup',.85); }
  else if(d.type==='emp'){ state.enemyBullets=[]; toast('EMP', 'good', .58); audio.playerWeapon('player_emp_burst',1,.25); }
  else if(d.type==='iman'){ p.magnetUntil = state.now + 12; toast('IMÁN', 'good', .58); audio.playerPower('player_magnet_on',.92); }
  else if(d.type==='multiplicador'){ state.scoreMul = 2; p.multiplierUntil = state.now + 12; toast('X2 BONUS', 'good', .58); audio.playerPower('player_multiplier_on',.95); }
  audio.stinger('stinger_powerup',.68);
}

function collide(a,b,pad=0){ return Math.abs(a.x-b.x) < (a.w+b.w)/2-pad && Math.abs(a.y-b.y) < (a.h+b.h)/2-pad; }

function handleCollisions(){
  const p = state.player;
  // player bullets vs enemies
  for(let i=state.playerBullets.length-1;i>=0;i--){
    const b=state.playerBullets[i]; let hit=false;
    for(let j=state.enemies.length-1;j>=0;j--){
      const e=state.enemies[j]; if(collide(b,e,4)){ if(e.kind==='boss' && (e.shield||0)>0){ const ab=Math.min(e.shield,b.damage); e.shield-=ab; const rest=b.damage-ab; if(rest>0)e.hp-=rest; } else { e.hp -= b.damage; } hit=true; state.particles.push({x:b.x,y:b.y,vx:rand(-1.2,1.2),vy:rand(-1.3,1.3),life:.35,color:'#fff'}); break; }
    }
    if(!hit) for(let j=state.obstacles.length-1;j>=0;j--){ const o=state.obstacles[j]; if(collide(b,o,6)){ o.hp -= b.damage; hit=true; break; }}
    if(hit) state.playerBullets.splice(i,1);
  }
  // enemy bullets vs player
  for(let i=state.enemyBullets.length-1;i>=0;i--){
    const b=state.enemyBullets[i]; if(collide(b,p,8)){ damagePlayer(b.damage||10); state.enemyBullets.splice(i,1); }
  }
  // enemies/obstacles vs player
  for(let i=state.enemies.length-1;i>=0;i--){ const e=state.enemies[i]; if(collide(e,p,18)){ damagePlayer(18 + state.worldIndex*2); e.hp=0; }}
  for(let i=state.obstacles.length-1;i>=0;i--){ const o=state.obstacles[i]; if(collide(o,p,18)){ damagePlayer(20 + state.worldIndex*2); o.hp=0; }}
  // obstacle hp kill
  for(let i=state.obstacles.length-1;i>=0;i--){ const o=state.obstacles[i]; if(o.hp<=0){ state.score += o.score * state.scoreMul; state.particles.push({x:o.x,y:o.y,vx:0,vy:0,life:.9,color:'#ffcc9a'}); maybeDrop(o.x,o.y,0.18); state.obstacles.splice(i,1); const nm=(o.img?.src||'').toLowerCase(); audio.obstacle(nm.includes('meteor')?'obstacle_meteor_break':'obstacle_debris_break', .82); audio.fx('fx_explosion_medium', .55); }}
}

function damagePlayer(amount){
  const p=state.player; if(p.invuln>0) return;
  let dmg=amount;
  const shieldBefore=p.shield;
  if(p.shield>0){ const absorbed=Math.min(p.shield,dmg); p.shield -= absorbed; dmg -= absorbed; }
  if(shieldBefore>0){ audio.playerDefense(p.shield<=0?'player_shield_break':'player_shield_hit', p.shield<=0?1:.72); }
  if(dmg>0){ p.health -= dmg; audio.fx('fx_hit_armored',.48); }
  p.invuln = .85; state.screenFlash = .7;
  if(state.now - state.lastDamageToast > 1.4 && (p.health/p.maxHealth)<0.35){ toast('VAS A MORIR', 'bad', .44); state.lastDamageToast=state.now; audio.ui('ui_warning_low_health',1); }
  if(p.health<=0){ loseLife(); }
}

function loseLife(){
  state.lives -= 1;
  if(state.lives <= 0){
    addRankingEntry(state.playerName, state.score, state.worldIndex);
    document.getElementById('gameOverTitle').textContent = 'Game Over';
    document.getElementById('gameOverText').textContent = `Caíste en ${getWorld(state.worldIndex).label}. Puedes volver al último checkpoint.`;
    audio.ui('ui_game_over',1); audio.stopAmbience(); audio.stopEngine(); hideAllScreens(); screen('gameover', true); hud.classList.add('hidden'); state.mode='gameover'; state.running=false;
    return;
  }
  toast(`VIDA PERDIDA · ${state.lives} RESTANTES`, 'bad', .48);
  state.player = playerFactory(true);
  state.player.x = window.innerWidth*0.5; state.player.y = window.innerHeight*0.84;
  state.enemyBullets=[];
}

function killEnemy(index){
  const e=state.enemies[index]; const world=getWorld(state.worldIndex);
  state.score += e.score * state.scoreMul; state.kills += 1; state.chain += 1; state.maxChain = Math.max(state.maxChain, state.chain);
  if(state.chain>0 && state.chain%12===0){ toast(`X${state.chain} RACHA`, 'good', .62); audio.stinger('stinger_bonus', .72); }
  if(state.chain>0 && state.chain%20===0){ toast('AMAZING!', 'good', .56); audio.stinger('stinger_amazing', 1); }
  spawnEffect(makeAnim(DATA.global.fx.explosion_sheet.path, DATA.global.fx.explosion_sheet.frames, 14), e.x, e.y, Math.max(e.w,54), Math.max(e.h,54), 14, false, 0.72);
  if(e.kind==='minion'){ audio.fx('fx_enemy_destroyed',.38); audio.fx('fx_explosion_small',.28); }
  maybeDrop(e.x,e.y, e.kind==='boss' ? 0 : (e.kind==='subboss' ? 0.9 : 0.16));
  if(e.kind==='subboss'){
    toast('SUBJEFE DESTRUIDO', 'good', .34); audio.subboss(state.worldIndex, e.pattern||'a', 'death', 1); audio.fx('fx_subboss_destroyed', .75);
    const dropType = pick(['laser','misiles','escudo','reparacion']);
    state.drops.push({x:e.x,y:e.y,w:34,h:34,vx:0,vy:1.1,life:10,type:dropType,img:image(DATA.global.powerups[dropType].path),mode:'power'});
  }
  if(e.kind==='boss'){
    if(world.renace && !e.revived){
      e.revived = true; e.hp = Math.round(e.maxHp*0.34); e.maxHp = e.hp; e.img = world.boss.reborn ? image(world.boss.reborn) : image(world.boss.coreOpen); e.shootCd=.8; e.vx *= 1.35; e.attackIndex=0; e.shield=100+state.worldIndex*12; e.score += 800;
      state.enemies[index] = e; toast('EL JEFE RESUCITA', 'warn', .30); audio.bossRevive(state.worldIndex); audio.stinger('stinger_boss_alert', .85); return;
    }
    state.bossDefeated = true; state.worldTransition = true; state.sectorClearCount += 1;
    spawnEffect(e.deathAnim || makeAnim(DATA.global.fx.explosion_sheet.path, DATA.global.fx.explosion_sheet.frames, 10), e.x, e.y, e.w*1.08, e.h*1.08, 10, false, 1.2);
    audio.boss(state.worldIndex, 'death', 1); audio.fx('fx_explosion_boss', .75); audio.relic(state.worldIndex, 'release', 1);
    spawnRelics(world, e.x, e.y); toast(`SECTOR ${state.worldIndex+1} LIMPIO`, 'good', .30); audio.stinger('stinger_sector_clear', 1);
    saveCheckpoint();
    setTimeout(async ()=>{
      state.enemies=[]; state.enemyBullets=[]; state.obstacles=[]; state.waveActive=false; state.wave=1; state.worldIndex += 1; state.worldTransition=false;
      if(state.worldIndex >= DATA.worlds.length){
        addRankingEntry(state.playerName, state.score, DATA.worlds.length);
        document.getElementById('gameOverTitle').textContent='Victoria';
        document.getElementById('gameOverText').textContent=`Has conquistado la Frontera Final con ${Math.floor(state.score)} puntos.`;
        audio.ui('ui_victory',1); audio.stopAmbience(); audio.stopEngine(); hideAllScreens(); screen('gameover', true); hud.classList.add('hidden'); state.running=false; state.mode='gameover'; clearSave(); return;
      }
      await loadWorld(state.worldIndex);
      saveCheckpoint();
      spawnWave();
    }, 1700);
  }
  state.particles.push({x:e.x,y:e.y,vx:0,vy:0,life:.9,color:e.color||'#fff'});
  state.enemies.splice(index,1);
}

function gameLoop(ts){
  const now = ts/1000; const dt = Math.min(.033, now-(state.lastTime||now)); state.lastTime=now; state.now = now;
  if(state.mode==='playing' && state.running){
    state.waveTimer += dt; state.scroll += dt*(62 + state.worldIndex*2.2);
    if(state.player && state.player.multiplierUntil && state.now > state.player.multiplierUntil) state.scoreMul = 1;
    updatePlayer(dt); updateBullets(state.playerBullets,dt); updateBullets(state.enemyBullets,dt,true); updateEnemies(dt); updateObstacles(dt); updateDrops(dt); updateParticles(dt); handleCollisions();
    if(!state.worldTransition && state.enemies.length===0 && state.waveActive){
      state.waveActive=false;
      if(state.wave < 4){ state.wave += 1; setTimeout(()=> spawnWave(), 650); }
    }
  }
  draw(); updateHUD();
  requestAnimationFrame(gameLoop);
}

function drawBackground(world){
  ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  const bg=image((state.wave===4 ? world.backgrounds.boss : state.wave>=2 ? world.backgrounds.intense : world.backgrounds.base));
  drawCover(bg, 0,0,window.innerWidth,window.innerHeight,.58);
  drawStars();
  if(world.backgrounds.far) drawScrollingLayer(image(world.backgrounds.far), 22, .38);
  if(world.backgrounds.near) drawScrollingLayer(image(world.backgrounds.near), 42, .55);
}
function drawCover(img,x,y,w,h,alpha=1){
  if(!img || !img.complete || !img.naturalWidth) return;
  const iw=img.naturalWidth, ih=img.naturalHeight; const scale=Math.max(w/iw, h/ih); const dw=iw*scale, dh=ih*scale; const dx=x+(w-dw)/2, dy=y+(h-dh)/2;
  ctx.save(); ctx.globalAlpha=alpha; ctx.drawImage(img,dx,dy,dw,dh); ctx.restore();
}
function drawScrollingLayer(img,speed=20,alpha=.4){
  if(!img || !img.complete || !img.naturalWidth) return;
  const scale = window.innerWidth / img.naturalWidth; const h = img.naturalHeight*scale; const offset = (state.scroll*speed) % h;
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.drawImage(img,0,-h+offset,window.innerWidth,h);
  ctx.drawImage(img,0,offset,window.innerWidth,h);
  ctx.restore();
}
function drawStars(){
  ctx.save();
  state.stars.forEach(s=>{ ctx.globalAlpha=s.a; ctx.fillStyle='#ffffff'; const x=s.x*window.innerWidth, y=(s.y*window.innerHeight + state.scroll*s.s*0.22) % window.innerHeight; ctx.fillRect(x,y,s.s,s.s); });
  ctx.restore();
}

function draw(){
  const world = getWorld(state.worldIndex) || DATA.worlds[0];
  drawBackground(world);
  drawObstacles(); drawEffects(); drawEnemies(); drawDrops(); drawBullets(state.enemyBullets,true); drawPlayer(); drawBullets(state.playerBullets,false); drawParticles(); drawStatusTexts();
  if(state.screenFlash>0){ ctx.fillStyle=`rgba(255,70,70,${Math.min(.28,state.screenFlash*.26)})`; ctx.fillRect(0,0,window.innerWidth,window.innerHeight); }
}
function drawImageCentered(img,x,y,w,h,rot=0,alpha=1){
  if(!img || !img.complete || !img.naturalWidth) return;
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha=alpha; ctx.drawImage(img,-w/2,-h/2,w,h); ctx.restore();
}
function drawAnimated(anim,x,y,w,h,t,rot=0,alpha=1,loop=true){
  if(!anim || !anim.img || !anim.img.complete || !anim.img.naturalWidth) return false;
  const frames=Math.max(1, anim.frames||1); const frameW=anim.img.naturalWidth/frames; const frameH=anim.img.naturalHeight;
  let idx = loop ? Math.floor(t*(anim.fps||8)) % frames : Math.min(frames-1, Math.floor(t*(anim.fps||8)));
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha=alpha;
  ctx.drawImage(anim.img, frameW*idx, 0, frameW, frameH, -w/2, -h/2, w, h);
  ctx.restore();
  return true;
}
function drawEffects(){ state.effects.forEach(fx=> drawAnimated(fx.anim, fx.x, fx.y, fx.w, fx.h, fx.t, 0, 1, fx.loop)); }
function drawObstacles(){ state.obstacles.forEach(o=>{ drawImageCentered(o.img,o.x,o.y,o.w,o.h,o.rot,0.92); drawMiniBar(o.x,o.y+o.h*.62,o.w*.52,4,o.hp/o.maxHp,'#ffb874'); }); }
function drawEnemies(){
  state.enemies.forEach(e=>{
    const pulse = 1 + Math.sin(e.t*4)*0.03;
    drawGlow(e.x,e.y,Math.max(e.w,e.h)*0.58,e.kind==='boss' ? worldColor().core : worldColor().neon_b);
    const rot = e.kind==='boss'?Math.sin(e.t)*0.05:0;
    if(e.kind==='boss'){
      if(e.anim && e.anim.frames>1 && e.phase===0) drawAnimated(e.anim,e.x,e.y,e.w*pulse,e.h*pulse,e.t,rot,1,true);
      else drawImageCentered(e.img,e.x,e.y,e.w*pulse,e.h*pulse,rot,1);
    }
    else if(e.anim && e.anim.frames>1) drawAnimated(e.anim,e.x,e.y,e.w*pulse,e.h*pulse,e.t,rot,e.hp<=0?0.5:1,true);
    else drawImageCentered(e.img,e.x,e.y,e.w*pulse,e.h*pulse,rot,e.hp<=0?0.5:1);
    drawMiniBar(e.x,e.y+e.h*.6,e.w*.65,e.kind==='boss'?8:5,e.hp/e.maxHp,e.kind==='boss'?'#ff875c':'#7efec8');
  });
}
function drawDrops(){ state.drops.forEach(d=>{ const p=1+Math.sin((d.t||0)*7)*0.06; drawGlow(d.x,d.y,24,d.type==='relic'?'#f5e16a':'#64d3ff'); if(d.anim && d.anim.frames>1) drawAnimated(d.anim,d.x,d.y,d.w*p,d.h*p,d.t||0,0,1,true); else drawImageCentered(d.img,d.x,d.y,d.w*p,d.h*p,0,1); }); }
function drawBullets(arr, enemy){ arr.forEach(b=>{ if(b.anim && b.anim.frames>1){ drawAnimated(b.anim,b.x,b.y,b.w*(enemy?1.2:1),b.h*(enemy?1.2:1),state.now,Math.atan2(b.vy||-1,b.vx||0)+Math.PI/2,.98); } else if(b.img && b.img.complete && b.img.naturalWidth){ drawImageCentered(b.img,b.x,b.y,b.w*(enemy?1.2:1),b.h*(enemy?1.2:1),Math.atan2(b.vy||-1,b.vx||0)+Math.PI/2, .98); } else { ctx.save(); ctx.fillStyle=b.color|| (enemy?'#ffb17f':'#bffaff'); ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h); ctx.restore(); } }); }
function drawPlayer(){
  const p=state.player; if(!p) return;
  const blink = p.invuln>0 ? (Math.floor(state.now*18)%2===0 ? 0.55 : 1) : 1;
  drawGlow(p.x,p.y,58,'#71d5ff');
  if(p.drone){ const dx=Math.cos(p.droneAngle)*42, dy=Math.sin(p.droneAngle)*22; ctx.save(); ctx.strokeStyle='rgba(120,255,180,.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(p.x+dx,p.y+dy,8,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
  drawImageCentered(p.img,p.x,p.y,p.w,p.h,0,blink);
}
function hexToRgba(color, alpha){
  if(!color) return `rgba(255,255,255,${alpha})`;
  if(color.startsWith('rgba(')) return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
  if(color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
  let c=color.replace('#','');
  if(c.length===3) c=c.split('').map(ch=>ch+ch).join('');
  const n=parseInt(c,16);
  const r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  return `rgba(${r},${g},${b},${alpha})`;
}
function drawGlow(x,y,r,color){ const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0, hexToRgba(color,0.35)); g.addColorStop(.6, hexToRgba(color,0.08)); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.save(); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.restore(); }
function drawMiniBar(x,y,w,h,pct,color){ ctx.save(); ctx.globalAlpha=.88; ctx.fillStyle='rgba(255,255,255,.09)'; ctx.fillRect(x-w/2,y,w,h); ctx.fillStyle=color; ctx.fillRect(x-w/2,y,w*clamp(pct,0,1),h); ctx.restore(); }
function worldColor(){ return getWorld(state.worldIndex).palette || {core:'#fff', neon_b:'#8ef'}; }
function drawParticles(){ state.particles.forEach(p=>{ ctx.save(); ctx.globalAlpha=clamp(p.life*2,0,1); ctx.fillStyle=p.color||'#fff'; ctx.beginPath(); ctx.arc(p.x,p.y,2.2,0,Math.PI*2); ctx.fill(); ctx.restore(); }); }
function drawStatusTexts(){
  if(state.loading){ drawCenterText('CARGANDO ASSETS...', .5, 'rgba(255,255,255,.86)', 28); }
  if(state.mode==='playing' && state.wave===4 && !state.worldTransition){ drawCenterText(getWorld(state.worldIndex).bossName, .10, 'rgba(255,220,180,.92)', 20); }
}
function drawCenterText(text, yPct=.5, color='#fff', size=26){ ctx.save(); ctx.fillStyle=color; ctx.font=`700 ${size}px Arial`; ctx.textAlign='center'; ctx.fillText(text, window.innerWidth/2, window.innerHeight*yPct); ctx.restore(); }

function startNewGame(){
  audio.unlock();
  state.playerName = (inputName.value || state.playerName || 'Piloto').trim().slice(0,18) || 'Piloto';
  localStorage.setItem(STORAGE_KEYS.playerName, state.playerName);
  initGameState(); hideAllScreens(); hud.classList.remove('hidden');
  loadWorld(0).then(()=>{ state.player = playerFactory(); saveCheckpoint(); spawnWave(); updateHUD(); audio.playAmbience(0); audio.playEngine(state.shipKey==='warden'?'heavy':'light'); audio.ui('ui_click_confirm',.8); });
}
async function continueFromSave(){
  const save = loadSave();
  if(!save){ toast('No hay partida guardada', 'warn', .58); return; }
  audio.unlock();
  state.playerName = save.name || state.playerName; state.shipKey = normalizeShipKey(save.shipKey || state.shipKey); inputName.value = state.playerName;
  state.score = save.score||0; state.relics=save.relics||0; state.lives=Math.max(1,save.lives||3); state.worldIndex=clamp(save.worldIndex||0,0,DATA.worlds.length-1); state.wave=1; state.sectorClearCount=save.sectorClearCount||state.worldIndex;
  state.enemyBullets=[]; state.playerBullets=[]; state.enemies=[]; state.drops=[]; state.obstacles=[]; state.allies=[]; state.particles=[]; state.running=true; state.mode='playing';
  await loadWorld(state.worldIndex);
  state.player = playerFactory(true); hideAllScreens(); hud.classList.remove('hidden'); saveCheckpoint(); spawnWave(); audio.playAmbience(state.worldIndex); audio.playEngine(state.shipKey==='warden'?'heavy':'light'); audio.ui('ui_click_confirm',.8);
}
function retryCheckpoint(){ const save = loadSave(); if(save){ continueFromSave(); } else { startNewGame(); } }
function saveAndExit(){ if(state.mode==='playing'){ saveCheckpoint(); } audio.stopAmbience(); audio.stopEngine(); state.running=false; state.mode='menu'; hud.classList.add('hidden'); hideAllScreens(); screen('menu', true); audio.ui('ui_menu_open',.8); }
function pauseGame(){ if(state.mode!=='playing') return; state.running=false; audio.ui('ui_pause',1); audio.pauseAmbience(); audio.pauseEngine(); hideAllScreens(); screen('pause', true); }
function resumeGame(){ if(state.mode!=='playing') state.mode='playing'; state.running=true; audio.ui('ui_resume',1); audio.resumeAmbience(); audio.resumeEngine(); hideAllScreens(); hud.classList.remove('hidden'); }

// Events
window.addEventListener('keydown', e=>{ state.keyboard[e.key]=true; if(e.key==='Escape'){ if(state.mode==='playing' && state.running) pauseGame(); else if(state.mode==='playing' && !state.running) resumeGame(); } });
window.addEventListener('keyup', e=> state.keyboard[e.key]=false);
canvas.addEventListener('pointerdown', e=>{ if(state.mode!=='playing') return; state.pointer.active=true; state.pointer.x=e.clientX; state.pointer.y=e.clientY; audio.unlock(); });
canvas.addEventListener('pointermove', e=>{ if(!state.pointer.active) return; state.pointer.x=e.clientX; state.pointer.y=e.clientY; });
window.addEventListener('pointerup', ()=> state.pointer.active=false);

pauseBtn.addEventListener('click', pauseGame);
btnResume.addEventListener('click', resumeGame);
btnPauseSave.addEventListener('click', saveAndExit);
btnRetryCheckpoint.addEventListener('click', retryCheckpoint);
btnBackMenu.addEventListener('click', ()=>{ clearSave(); saveAndExit(); });

document.getElementById('btnNewGame').addEventListener('click', ()=>{ audio.unlock(); audio.ui('ui_click_confirm',.75); startNewGame(); });
document.getElementById('btnLoadGame').addEventListener('click', ()=>{ audio.unlock(); audio.ui('ui_click_confirm',.75); continueFromSave(); });
document.getElementById('btnRanking').addEventListener('click', ()=>{ audio.unlock(); audio.ui('ui_menu_open',.8); renderRanking(); hideAllScreens(); screen('ranking', true); });
document.getElementById('btnHangar').addEventListener('click', ()=>{ audio.unlock(); audio.ui('ui_menu_open',.8); renderHangar(); hideAllScreens(); screen('hangar', true); });
document.getElementById('btnRankingBack').addEventListener('click', ()=>{ audio.ui('ui_back',.8); hideAllScreens(); screen('menu', true); });
document.getElementById('btnHangarBack').addEventListener('click', ()=>{ audio.ui('ui_back',.8); hideAllScreens(); screen('menu', true); });

// Boot
(function boot(){
  resize(); initStars(); renderHangar(); renderRanking(); hideAllScreens(); screen('menu', true); hud.classList.add('hidden'); inputName.value = state.playerName;
  requestAnimationFrame(gameLoop);
})();

})();

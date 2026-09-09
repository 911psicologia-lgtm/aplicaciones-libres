window.SF = window.SF || {};
(function(NS){
  'use strict';

  const BASE = 'audio/STARFALL_FRONTIER_AUDIO_PACK_v1';
  const IS_MOBILE = Math.min(window.innerWidth||9999, window.innerHeight||9999) < 700;
  const MAX_VOICES = IS_MOBILE ? 16 : 24;
  const pools = new Map();
  const cooldowns = new Map();
  let currentSector = 1;
  let unlocked = false;
  let ambience = null;
  let ambienceSector = 0;
  let paused = false;

  const volume = {
    master: .78,
    ambience: .22,
    ui: .48,
    player: .52,
    power: .55,
    enemy: .30,
    subboss: .46,
    boss: .56,
    fx: .52,
    obstacle: .34,
    stinger: .50
  };

  const activeVoices = new Set();

  function pad(n){ return String(((n-1)%20)+1).padStart(2,'0'); }
  function worldRoot(){ return `${BASE}/world_${pad(currentSector)}`; }
  function global(path){ return `${BASE}/global/${path}`; }
  function world(path){ return `${worldRoot()}/${path}`; }

  // Fallback mínimo para que un fallo puntual de archivo nunca silencie una acción crítica.
  let ac=null;
  function fallbackTone(freq=400,dur=.045,type='triangle',gain=.012){
    try{
      if(!ac){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; ac=new AC(); }
      if(ac.state==='suspended') ac.resume().catch(()=>{});
      const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
      o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.01);
    }catch(_){ }
  }

  function ensure(){
    unlocked=true;
    try{ if(ac?.state==='suspended') ac.resume().catch(()=>{}); }catch(_){ }
    if(ambience && ambience.paused && !paused) ambience.play().catch(()=>{});
    return true;
  }

  function voiceFor(path, loop=false){
    if(!pools.has(path)) pools.set(path, []);
    const pool=pools.get(path);
    let a=pool.find(v=>v.paused || v.ended);
    if(!a && activeVoices.size < MAX_VOICES && pool.length < 4){
      a=new Audio(path); a.preload='auto'; a.loop=loop; pool.push(a);
      a.addEventListener('ended',()=>activeVoices.delete(a));
      a.addEventListener('pause',()=>{ if(!a.loop) activeVoices.delete(a); });
    }
    return a || null;
  }

  function play(path, cat='fx', opts={}){
    if(!unlocked || (paused && !opts.allowPaused) || !path) return false;
    const key=opts.cooldownKey || path;
    const now=performance.now();
    const cd=opts.cooldownMs||0;
    if(cd && now-(cooldowns.get(key)||0)<cd) return false;
    cooldowns.set(key,now);
    const a=voiceFor(path,!!opts.loop);
    if(!a){ return false; }
    try{
      a.pause();
      a.currentTime=0;
      a.loop=!!opts.loop;
      a.volume=Math.max(0,Math.min(1,(volume[cat]??.5)*volume.master*(opts.volumeMul??1)));
      a.playbackRate=Math.max(.72,Math.min(1.35,opts.rate||1));
      activeVoices.add(a);
      const p=a.play(); if(p?.catch) p.catch(()=>{ activeVoices.delete(a); if(opts.fallback!==false) fallbackTone(opts.fallbackFreq||380); });
      return true;
    }catch(_){ if(opts.fallback!==false) fallbackTone(opts.fallbackFreq||380); return false; }
  }

  function startAmbience(sector=currentSector){
    sector=((sector-1)%20)+1;
    if(ambienceSector===sector && ambience){ if(unlocked&&!paused&&ambience.paused) ambience.play().catch(()=>{}); return; }
    if(ambience){ try{ ambience.pause(); ambience.currentTime=0; }catch(_){ } }
    ambienceSector=sector;
    ambience=new Audio(`${BASE}/world_${pad(sector)}/ambience/world_${pad(sector)}_ambience_loop.ogg`);
    ambience.preload='auto'; ambience.loop=true; ambience.volume=volume.ambience*volume.master;
    if(unlocked&&!paused) ambience.play().catch(()=>{});
  }

  function setSector(sector){ currentSector=Math.max(1,Number(sector)||1); startAmbience(currentSector); }
  function pauseAmbience(flag=true){
    if(!ambience) return;
    if(flag){ try{ ambience.pause(); }catch(_){ } }
    else if(unlocked&&!paused){ try{ ambience.play().catch(()=>{}); }catch(_){ } }
  }
  function pauseAll(flag=true){
    paused=!!flag;
    if(paused){ try{ ambience?.pause(); }catch(_){ } for(const a of activeVoices){ try{a.pause();}catch(_){ } } activeVoices.clear(); }
    else if(unlocked){ try{ ambience?.play().catch(()=>{}); }catch(_){ } }
  }
  function stopAll(){ pauseAll(true); if(ambience){try{ambience.currentTime=0;}catch(_){}} ambienceSector=0; ambience=null; paused=false; }

  function minionName(kind='raider'){
    const map={raider:'swarmer',striker:'stinger',gunner:'spitter',diver:'hunter',sentinel:'sentinel',reanimator:'phantom',breeder:'spitter',drone:'swarmer',guardian:'sentinel',breedDrone:'swarmer',hordeDiver:'hunter'};
    return map[kind]||'swarmer';
  }
  function subSlot(style=0){ return Number(style)===0 ? 'a' : 'b'; }

  const api={
    ensure,setSector,startAmbience,pauseAmbience,pauseAll,stopAll,
    setMaster(v){ volume.master=Math.max(0,Math.min(1,Number(v)||0)); if(ambience) ambience.volume=volume.ambience*volume.master; },

    ui(kind='confirm'){
      const files={menu:'ui_menu_open',hover:'ui_hover',confirm:'ui_click_confirm',back:'ui_back',pause:'ui_pause',resume:'ui_resume',checkpoint:'ui_checkpoint',critical:'ui_warning_low_health',gameover:'ui_game_over',victory:'ui_victory'};
      play(global(`ui/${files[kind]||files.confirm}.ogg`),'ui',{cooldownKey:`ui:${kind}`,cooldownMs:80,fallbackFreq:620,allowPaused:true});
    },
    shot(mode='basic'){
      const f=mode==='rapid'?'player_shot_rapid':'player_shot_basic';
      play(global(`player/weapons/${f}.ogg`),'player',{cooldownKey:`player:${mode}`,cooldownMs:mode==='rapid'?52:78,fallbackFreq:780});
    },
    missileShot(){ play(global('player/weapons/player_shot_missile.ogg'),'player',{cooldownKey:'player:missile',cooldownMs:120,fallbackFreq:330}); },
    droneShot(){ play(global('player/weapons/player_shot_drone.ogg'),'player',{cooldownKey:'player:drone',cooldownMs:180,fallbackFreq:520}); },
    emp(){ play(global('player/weapons/player_emp_burst.ogg'),'player',{cooldownKey:'player:emp',cooldownMs:650,fallbackFreq:180}); },

    enemyShot(kind='raider'){
      const m=minionName(kind);
      play(world(`minions/world_${pad(currentSector)}_minion_${m}_attack.ogg`),'enemy',{cooldownKey:`enemy:${m}`,cooldownMs:IS_MOBILE?190:135,fallbackFreq:190});
    },
    enemyDive(){ play(world(`minions/world_${pad(currentSector)}_minion_hunter_attack.ogg`),'enemy',{cooldownKey:'enemy:dive',cooldownMs:280,fallbackFreq:250}); },
    sentinelShield(){ play(world(`minions/world_${pad(currentSector)}_minion_sentinel_attack.ogg`),'enemy',{cooldownKey:'enemy:sentinel',cooldownMs:360,fallbackFreq:360}); },
    reanimator(){ play(world(`minions/world_${pad(currentSector)}_minion_phantom_attack.ogg`),'enemy',{cooldownKey:'enemy:phantom',cooldownMs:450,fallbackFreq:170}); },
    breeder(){ play(world(`minions/world_${pad(currentSector)}_minion_spitter_attack.ogg`),'enemy',{cooldownKey:'enemy:breeder',cooldownMs:420,fallbackFreq:140}); },

    hit(){ play(global('fx/fx_hit_small.ogg'),'fx',{cooldownKey:'hit:player',cooldownMs:110,fallbackFreq:240}); },
    shieldHit(){ play(global('player/defense/player_shield_hit.ogg'),'player',{cooldownKey:'shield:hit',cooldownMs:120,fallbackFreq:480}); },
    boom(){ play(global('fx/fx_explosion_medium.ogg'),'fx',{cooldownKey:'boom:player',cooldownMs:250,fallbackFreq:95}); },
    enemyDestroyed(kind='raider'){ const armored=['sentinel','reanimator','breeder','guardian'].includes(kind); play(global(`fx/${armored?'fx_hit_armored':'fx_enemy_destroyed'}.ogg`),'fx',{cooldownKey:`destroy:${armored?'armored':'enemy'}`,cooldownMs:70,fallbackFreq:130}); },
    obstacleBreak(){ play(global('obstacles/obstacle_meteor_break.ogg'),'obstacle',{cooldownKey:'obstacle:break',cooldownMs:180,fallbackFreq:110}); },

    power(kind){
      if(kind==='shield') return play(global('player/defense/player_shield_on.ogg'),'power',{cooldownKey:'power:shield',cooldownMs:250,fallbackFreq:520});
      if(kind==='heal') return play(global('player/powers/player_repair_pickup.ogg'),'power',{cooldownKey:'power:heal',cooldownMs:220,fallbackFreq:640});
      if(kind==='life') return play(global('player/powers/player_extra_life.ogg'),'power',{cooldownKey:'power:life',cooldownMs:280,fallbackFreq:880});
      if(kind==='emp') return api.emp();
      return play(global('player/powers/player_powerup_pickup.ogg'),'power',{cooldownKey:`power:${kind}`,cooldownMs:180,fallbackFreq:720});
    },
    checkpoint(){ api.ui('checkpoint'); },
    wave(){ startAmbience(currentSector); play(global('stingers/stinger_bonus.ogg'),'stinger',{cooldownKey:'wave',cooldownMs:700,fallbackFreq:620}); },
    waveClear(perfect=false){ play(global(`stingers/${perfect?'stinger_amazing':'stinger_bonus'}.ogg`),'stinger',{cooldownKey:'waveclear',cooldownMs:650,fallbackFreq:perfect?840:680}); },
    objective(){ play(global('stingers/stinger_bonus.ogg'),'stinger',{cooldownKey:'objective',cooldownMs:500,fallbackFreq:760}); },
    fusion(){ play(global('stingers/stinger_powerup.ogg'),'stinger',{cooldownKey:'fusion',cooldownMs:650,fallbackFreq:720}); },
    combo(n=5){ play(global(`stingers/${n>=10?'stinger_amazing':'stinger_bonus'}.ogg`),'stinger',{cooldownKey:`combo:${n}`,cooldownMs:600,fallbackFreq:n>=10?940:760}); },
    critical(){ api.ui('critical'); },
    extraLife(){ play(global('player/powers/player_extra_life.ogg'),'power',{cooldownKey:'life:extra',cooldownMs:450,fallbackFreq:920}); },

    miniboss(style=0){ const s=subSlot(style); play(world(`subboss_${s}/world_${pad(currentSector)}_subboss_${s}_intro.ogg`),'subboss',{cooldownKey:`sub:${s}:intro`,cooldownMs:900,fallbackFreq:180}); },
    minibossShot(style=0){ const s=subSlot(style); play(world(`subboss_${s}/world_${pad(currentSector)}_subboss_${s}_attack.ogg`),'subboss',{cooldownKey:`sub:${s}:attack`,cooldownMs:420,fallbackFreq:250}); },
    minibossDeath(style=0){ const s=subSlot(style); play(world(`subboss_${s}/world_${pad(currentSector)}_subboss_${s}_death.ogg`),'subboss',{cooldownKey:`sub:${s}:death`,cooldownMs:700,fallbackFreq:105}); },

    boss(){ play(global('stingers/stinger_boss_alert.ogg'),'stinger',{cooldownKey:'boss:alert',cooldownMs:700,fallbackFreq:160}); setTimeout(()=>play(world(`boss/world_${pad(currentSector)}_boss_intro.ogg`),'boss',{cooldownKey:'boss:intro',cooldownMs:1200,fallbackFreq:140}),130); },
    bossShot(pattern='nova',ph=0){
      const cat = ph>=2 || pattern==='gravity' || pattern==='brood' ? 'control' : ph===1 || pattern==='phoenix' ? 'secondary' : 'primary';
      play(world(`boss/world_${pad(currentSector)}_boss_attack_${cat}.ogg`),'boss',{cooldownKey:`boss:${cat}`,cooldownMs:300,fallbackFreq:170});
    },
    bossPhase(){ play(world(`boss/world_${pad(currentSector)}_boss_phase_shift.ogg`),'boss',{cooldownKey:'boss:phase',cooldownMs:850,fallbackFreq:220}); },
    bossResurrect(){ const w=((currentSector-1)%20)+1; const hasRevive=[6,10,15,18,20].includes(w); const file=hasRevive?`boss/world_${pad(currentSector)}_boss_revive.ogg`:`boss/world_${pad(currentSector)}_boss_phase_shift.ogg`; play(world(file),'boss',{cooldownKey:'boss:revive',cooldownMs:1500,fallbackFreq:130}); },
    bossDeath(){ play(world(`boss/world_${pad(currentSector)}_boss_death.ogg`),'boss',{cooldownKey:'boss:death',cooldownMs:1600,fallbackFreq:85}); },
    bossReward(){ play(world(`relic/world_${pad(currentSector)}_relic_release.ogg`),'power',{cooldownKey:'boss:relic',cooldownMs:900,fallbackFreq:540}); },
    relicAttach(){ play(global('player/powers/player_relic_attach.ogg'),'power',{cooldownKey:'relic:attach',cooldownMs:250,fallbackFreq:760}); },
    weaponEvolve(){ play(global('stingers/stinger_powerup.ogg'),'stinger',{cooldownKey:'weapon:evolve',cooldownMs:700,fallbackFreq:940}); },
    coreExpose(){ play(world(`boss/world_${pad(currentSector)}_boss_attack_control.ogg`),'boss',{cooldownKey:'boss:core',cooldownMs:720,fallbackFreq:680}); },
    sniperCharge(){ play(world(`minions/world_${pad(currentSector)}_minion_stinger_attack.ogg`),'enemy',{cooldownKey:'enemy:charge',cooldownMs:360,fallbackFreq:510}); },
    eliteShot(cls='ace'){ const name=cls==='hunter'?'hunter':cls==='bulwark'?'sentinel':'stinger'; play(world(`minions/world_${pad(currentSector)}_minion_${name}_attack.ogg`),'enemy',{cooldownKey:`elite:${cls}`,cooldownMs:250,fallbackFreq:420}); }
  };

  NS.audio=api;
})(window.SF);

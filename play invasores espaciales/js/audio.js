window.SF = window.SF || {};
(function(NS){
  'use strict';

  // v0.4.9: mezcla deliberadamente minimalista.
  // Se conserva ÚNICAMENTE la identidad de los disparos del jugador.
  const BASE='audio/STARFALL_FRONTIER_AUDIO_PACK_v1/global/player/weapons';
  const pools=new Map();
  const cooldowns=new Map();
  const active=new Set();
  let unlocked=false, paused=false;
  let master=.34;
  const MAX_VOICES=4;

  function ensure(){ unlocked=true; return true; }
  function voice(path){
    if(!pools.has(path)) pools.set(path,[]);
    const pool=pools.get(path);
    let a=pool.find(v=>v.paused||v.ended);
    if(!a && active.size<MAX_VOICES && pool.length<2){
      a=new Audio(path); a.preload='auto'; pool.push(a);
      a.addEventListener('ended',()=>active.delete(a));
      a.addEventListener('pause',()=>active.delete(a));
    }
    return a||null;
  }
  function play(file,key,cd=100,vol=1,rate=1){
    if(!unlocked||paused) return false;
    const now=performance.now(); if(now-(cooldowns.get(key)||0)<cd) return false; cooldowns.set(key,now);
    const a=voice(`${BASE}/${file}`); if(!a) return false;
    try{
      a.pause(); a.currentTime=0; a.volume=Math.max(0,Math.min(1,master*vol)); a.playbackRate=Math.max(.9,Math.min(1.12,rate));
      active.add(a); const p=a.play(); if(p?.catch) p.catch(()=>active.delete(a)); return true;
    }catch(_){ return false; }
  }
  function silence(){ return false; }
  function pauseAll(flag=true){ paused=!!flag; if(paused){ for(const a of active){ try{a.pause();}catch(_){}} active.clear(); } }
  function stopAll(){ pauseAll(true); paused=false; }

  NS.audio={
    ensure,
    setMaster(v){ master=Math.max(0,Math.min(.55,Number(v)||0)); },
    pauseAll, stopAll,
    setSector:silence, startAmbience:silence, pauseAmbience:silence,

    // Únicos sonidos activos del juego.
    shot(mode='basic'){
      if(mode==='rapid') return play('player_shot_rapid.ogg','player:rapid',82,.76,1.02);
      return play('player_shot_basic.ogg','player:basic',118,.68,.99);
    },
    missileShot(){ return play('player_shot_missile.ogg','player:missile',230,.82,.98); },
    droneShot(){ return play('player_shot_drone.ogg','player:drone',310,.55,1.04); },
    emp(){ return play('player_emp_burst.ogg','player:emp',850,.88,.95); },
    laserShot(){ return play('player_shot_laser.ogg','player:laser',170,.72,1.00); },

    // Resto del paisaje sonoro desactivado para evitar saturación.
    ui:silence, enemyShot:silence, enemyDive:silence, sentinelShield:silence, reanimator:silence, breeder:silence,
    hit:silence, shieldHit:silence, boom:silence, enemyDestroyed:silence, obstacleBreak:silence, power(kind){ return kind==='emp' ? this.emp() : false; },
    checkpoint:silence, wave:silence, waveClear:silence, objective:silence, fusion:silence, combo:silence, critical:silence,
    extraLife:silence, miniboss:silence, minibossShot:silence, minibossDeath:silence, boss:silence, bossShot:silence,
    bossPhase:silence, bossResurrect:silence, bossDeath:silence, bossReward:silence, relicAttach:silence,
    weaponEvolve:silence, coreExpose:silence, sniperCharge:silence, eliteShot:silence
  };
})(window.SF);

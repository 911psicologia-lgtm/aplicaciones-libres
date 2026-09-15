window.SF = window.SF || {};
(function(NS){
  const C = NS.config;
  const safe = {
    get(key, fallback){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
    del(key){ try { localStorage.removeItem(key); } catch {} }
  };
  const obj=v=>!!v && typeof v==='object' && !Array.isArray(v);
  const num=(v,d=0,min=-Infinity,max=Infinity)=>{ const n=Number(v); return Number.isFinite(n)?Math.max(min,Math.min(max,n)):d; };
  const text=(v,d='')=>String(v??d).replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,40);
  function normalizeGame(raw){
    if(!obj(raw)) return null;
    const shipIds=new Set((C.ships||[]).map(s=>s.id));
    const out={...raw};
    out.player=text(raw.player,'PILOTO').slice(0,18)||'PILOTO';
    out.shipId=shipIds.has(raw.shipId)?raw.shipId:(C.ships?.[0]?.id||'vanguard');
    out.sector=Math.round(num(raw.sector,1,1,99)); out.wave=Math.round(num(raw.wave,1,1,99));
    out.score=Math.round(num(raw.score,0,0,1e12)); out.lives=Math.round(num(raw.lives,3,0,99));
    out.hp=num(raw.hp,1,0,1e6); out.maxHp=Math.max(1,num(raw.maxHp,out.hp||1,1,1e6));
    out.nextLifeAt=Math.round(num(raw.nextLifeAt,C.progression?.extraLifeEvery||9000,0,1e12));
    out.checkpointWave=Math.round(num(raw.checkpointWave,out.wave,1,99));
    out.bossAugments=obj(raw.bossAugments)?raw.bossAugments:{}; out.relicLevels=obj(raw.relicLevels)?raw.relicLevels:{};
    return out;
  }
  function normalizeRanking(raw){
    if(!Array.isArray(raw)) return [];
    return raw.filter(obj).map(r=>({name:text(r.name,'PILOTO').slice(0,18)||'PILOTO',score:Math.round(num(r.score,0,0,1e12)),sector:Math.round(num(r.sector,1,1,99)),wave:Math.round(num(r.wave,1,1,99)),at:text(r.at,'')})).sort((a,b)=>b.score-a.score).slice(0,20);
  }

  NS.storage = {
    saveGame(data){ safe.set(C.SAVE_KEY, normalizeGame(data)); },
    loadGame(){ return normalizeGame(safe.get(C.SAVE_KEY, null)); },
    clearGame(){ safe.del(C.SAVE_KEY); },
    loadRanking(){ return normalizeRanking(safe.get(C.RANK_KEY, [])); },
    saveRanking(name, score, sector, wave){
      const list = normalizeRanking(safe.get(C.RANK_KEY, []));
      list.push({ name:text(name,'PILOTO').slice(0,18)||'PILOTO', score:Math.round(num(score,0,0,1e12)), sector:Math.round(num(sector,1,1,99)), wave:Math.round(num(wave,1,1,99)), at:new Date().toISOString() });
      list.sort((a,b)=>b.score-a.score); safe.set(C.RANK_KEY, list.slice(0,20));
    },
    clearRanking(){ safe.del(C.RANK_KEY); },
    loadShip(){ const id=text(safe.get(C.SHIP_KEY, C.ships[0].id),C.ships[0].id); return C.ships.some(s=>s.id===id)?id:C.ships[0].id; },
    saveShip(id){ if(C.ships.some(s=>s.id===id)) safe.set(C.SHIP_KEY, id); },
    loadProfile(){ const v=safe.get(C.PROFILE_KEY, null); return obj(v)?v:null; },
    saveProfile(profile){ if(obj(profile)) safe.set(C.PROFILE_KEY, profile); },
    loadMatrixTelemetry(){ const v=safe.get(C.MATRIX_TELEMETRY_KEY, []); return Array.isArray(v)?v:[]; },
    appendMatrixTelemetry(entry,maxEntries=60){ const list=this.loadMatrixTelemetry(); if(obj(entry)) list.push(entry); safe.set(C.MATRIX_TELEMETRY_KEY,list.slice(-Math.max(10,maxEntries||60))); return list.length; },
    clearMatrixTelemetry(){ safe.del(C.MATRIX_TELEMETRY_KEY); },
    _normalizeGame:normalizeGame,_normalizeRanking:normalizeRanking
  };
})(window.SF);

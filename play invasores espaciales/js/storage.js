window.SF = window.SF || {};
(function(NS){
  const C = NS.config;
  const safe = {
    get(key, fallback){ try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
    del(key){ try { localStorage.removeItem(key); } catch {} }
  };

  NS.storage = {
    saveGame(data){ safe.set(C.SAVE_KEY, data); },
    loadGame(){ return safe.get(C.SAVE_KEY, null); },
    clearGame(){ safe.del(C.SAVE_KEY); },
    loadRanking(){ return safe.get(C.RANK_KEY, []); },
    saveRanking(name, score, sector, wave){
      const list = safe.get(C.RANK_KEY, []);
      list.push({ name, score, sector, wave, at: new Date().toISOString() });
      list.sort((a,b)=>b.score-a.score);
      safe.set(C.RANK_KEY, list.slice(0, 20));
    },
    clearRanking(){ safe.del(C.RANK_KEY); },
    loadShip(){ return safe.get(C.SHIP_KEY, C.ships[0].id); },
    saveShip(id){ safe.set(C.SHIP_KEY, id); },
    loadProfile(){ return safe.get(C.PROFILE_KEY, null); },
    saveProfile(profile){ safe.set(C.PROFILE_KEY, profile); },
    loadMatrixTelemetry(){ return safe.get(C.MATRIX_TELEMETRY_KEY, []); },
    appendMatrixTelemetry(entry,maxEntries=60){
      const list=safe.get(C.MATRIX_TELEMETRY_KEY, []); list.push(entry); safe.set(C.MATRIX_TELEMETRY_KEY,list.slice(-Math.max(10,maxEntries||60))); return list.length;
    },
    clearMatrixTelemetry(){ safe.del(C.MATRIX_TELEMETRY_KEY); }
  };
})(window.SF);

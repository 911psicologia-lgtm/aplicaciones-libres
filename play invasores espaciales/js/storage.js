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
    saveShip(id){ safe.set(C.SHIP_KEY, id); }
  };
})(window.SF);

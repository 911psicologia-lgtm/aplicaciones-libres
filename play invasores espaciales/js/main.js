window.SF = window.SF || {};
(function(NS){
  const UI = NS.ui, S = NS.storage, G = NS.game, C = NS.config, E = NS.economy;
  let shopPausedGame=false;

  const main = {
    init(){
      UI.init();
      G.init(document.getElementById('game'));
      bindUi();
      main.refreshPanels();
      main.refreshEconomy();
      UI.setStatus('v0.6.1 · Reactive Matrix SHADOW · economía intacta');
      NS.assets.loadAll().then(()=>UI.setStatus('v0.6.1 · W01–05 realistas · Matrix SHADOW activa'));
      registerPWA();
      updateFullscreenState();
      requestAnimationFrame(G.loop);
    },
    refreshPanels(goHome=true){
      const save=S.loadGame();
      const ranking=S.loadRanking();
      const selected=S.loadShip();
      const ship=C.ships.find(s=>s.id===selected)||C.ships[0];
      UI.renderSavePreview(save);
      UI.renderMenuSummary(save, ship);
      UI.renderRanking(ranking);
      UI.renderLoadInfo(save);
      UI.renderHangar(C.ships, selected, (ranking[0]||{}).score||0);
      if(goHome) UI.showScreen('splash');
      document.querySelectorAll('[data-ship]').forEach(btn=>btn.addEventListener('click', ()=>{
        S.saveShip(btn.dataset.ship);
        main.refreshPanels();
        UI.showScreen('hangar');
      }));
    },
    refreshEconomy(){
      const profile=E.state();
      UI.renderEconomy(profile);
      if(document.getElementById('shopOverlay')?.style.display==='flex') UI.renderShop(profile,E.catalog(),!!G.state.running&&!G.state.gameOver);
    }
  };

  function registerPWA(){
    if(!('serviceWorker' in navigator)) return;
    if(!/^https?:$/.test(location.protocol)) return;
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }

  async function requestFullscreenSafe(){
    try{
      if(document.fullscreenElement||document.webkitFullscreenElement) return true;
      const el=document.documentElement;
      if(el.requestFullscreen){ await el.requestFullscreen({navigationUI:'hide'}); return true; }
      if(el.webkitRequestFullscreen){ el.webkitRequestFullscreen(); return true; }
    }catch(_e){}
    return false;
  }
  async function toggleFullscreen(){
    try{
      if(document.fullscreenElement||document.webkitFullscreenElement){ if(document.exitFullscreen) await document.exitFullscreen(); else document.webkitExitFullscreen?.(); }
      else await requestFullscreenSafe();
    }catch(_e){}
    updateFullscreenState();
  }
  function updateFullscreenState(){ UI.setFullscreenState(!!(document.fullscreenElement||document.webkitFullscreenElement),!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen)); }

  function launchNew(){
    requestFullscreenSafe();
    const input=document.getElementById('splashPilot');
    const name=((input?.value)||'PILOTO').trim().slice(0,18)||'PILOTO';
    NS.audio?.ensure?.(); NS.audio?.ui?.('confirm');
    G.startNew(name,S.loadShip());
    UI.showHud(true); main.refreshEconomy();
  }

  function openShop(){
    const overlay=document.getElementById('shopOverlay'); if(!overlay) return;
    shopPausedGame=!!(G.state.running&&!G.state.paused&&!G.state.gameOver&&!G.state.lifeLost);
    if(shopPausedGame){ G.togglePause(); document.getElementById('pauseOverlay').style.display='none'; }
    UI.renderShop(E.state(),E.catalog(),!!G.state.running&&!G.state.gameOver);
    overlay.style.display='flex'; overlay.setAttribute('aria-hidden','false');
  }
  function closeShop(){
    const overlay=document.getElementById('shopOverlay'); if(!overlay) return;
    overlay.style.display='none'; overlay.setAttribute('aria-hidden','true');
    if(shopPausedGame&&G.state.paused&&!G.state.gameOver){ G.togglePause(); }
    else UI.renderPause(G.state);
    shopPausedGame=false;
  }

  function bindUi(){
    document.getElementById('newGameBtn')?.addEventListener('click',launchNew);
    document.getElementById('splashPilot')?.addEventListener('keydown',e=>{ if(e.key==='Enter') launchNew(); });
    document.getElementById('continueBtn')?.addEventListener('click',()=>{
      const save=S.loadGame(); if(!save) return;
      requestFullscreenSafe(); NS.audio?.ensure?.(); NS.audio?.ui?.('confirm'); G.continueFromSave(save); UI.showHud(true); main.refreshEconomy();
    });
    document.getElementById('hangarBtn')?.addEventListener('click',()=>{ NS.audio?.ensure?.(); NS.audio?.ui?.('menu'); main.refreshPanels(); UI.showScreen('hangar'); });
    document.getElementById('rankingBtn')?.addEventListener('click',()=>{ NS.audio?.ensure?.(); NS.audio?.ui?.('menu'); UI.renderRanking(S.loadRanking()); UI.showScreen('ranking'); });
    document.getElementById('resumeSaveBtn')?.addEventListener('click',()=>{
      const save=S.loadGame(); if(!save) return; requestFullscreenSafe(); NS.audio?.ensure?.(); NS.audio?.ui?.('confirm'); G.continueFromSave(save); UI.showHud(true); main.refreshEconomy();
    });
    document.getElementById('deleteSaveBtn')?.addEventListener('click',()=>{ S.clearGame(); main.refreshPanels(); });
    document.getElementById('clearRankingBtn')?.addEventListener('click',()=>{ S.clearRanking(); main.refreshPanels(); UI.showScreen('ranking'); });
    document.getElementById('pauseBtn')?.addEventListener('click',()=>{ G.togglePause(); UI.renderPause(G.state); });
    document.getElementById('resumeBtn')?.addEventListener('click',()=>{ G.togglePause(); UI.renderPause(G.state); });
    document.getElementById('exitBtn')?.addEventListener('click',()=>G.exitToMenu());
    document.getElementById('restartCheckpointBtn')?.addEventListener('click',()=>G.restartCheckpoint());
    document.getElementById('gameOverExitBtn')?.addEventListener('click',()=>G.exitToMenu());
    document.getElementById('shopBtn')?.addEventListener('click',openShop);
    document.getElementById('shopCloseBtn')?.addEventListener('click',closeShop);
    document.getElementById('shopOverlay')?.addEventListener('click',e=>{ if(e.target.id==='shopOverlay') closeShop(); });
    document.getElementById('shopGrid')?.addEventListener('click',e=>{
      const buy=e.target.closest('[data-buy]');
      const use=e.target.closest('[data-use]');
      if(buy){
        const r=E.buy(buy.dataset.buy);
        if(r.ok){ G.applyStoreUpgrade?.(r.item); UI.flashMsg(`${r.item.label} · COMPRADO`,700); }
        else UI.flashMsg(r.reason||'NO DISPONIBLE',700);
        UI.renderShop(E.state(),E.catalog(),!!G.state.running&&!G.state.gameOver); main.refreshEconomy();
      } else if(use){
        const ok=G.useInventoryPower?.(use.dataset.use);
        UI.flashMsg(ok?`${C.powers[use.dataset.use]?.label||use.dataset.use} · ACTIVADO`:'SIN CARGAS',700);
        UI.renderShop(E.state(),E.catalog(),!!G.state.running&&!G.state.gameOver); main.refreshEconomy();
      }
    });
    document.getElementById('fullscreenBtn')?.addEventListener('click',toggleFullscreen);
    document.addEventListener('fullscreenchange',updateFullscreenState); document.addEventListener('webkitfullscreenchange',updateFullscreenState);
    window.addEventListener('keydown',e=>{ const tag=document.activeElement?.tagName; if(tag==='INPUT'||tag==='TEXTAREA') return; if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey){ e.preventDefault(); toggleFullscreen(); } });
  }
  NS.main=main;
  window.addEventListener('DOMContentLoaded',main.init);
})(window.SF);

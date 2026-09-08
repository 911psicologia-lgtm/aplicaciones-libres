window.SF = window.SF || {};
(function(NS){
  const UI = NS.ui, S = NS.storage, G = NS.game, C = NS.config;
  const main = {
    init(){
      UI.init();
      G.init(document.getElementById('game'));
      bindUi();
      main.refreshPanels();
      UI.setStatus('v0.3.9.1 · preparando combate');
      NS.assets.loadAll().then(()=>UI.setStatus('v0.3.9.1 · listo'));
      requestAnimationFrame(G.loop);
    },
    refreshPanels(){
      const save=S.loadGame();
      const ranking=S.loadRanking();
      const selected=S.loadShip();
      const ship=C.ships.find(s=>s.id===selected)||C.ships[0];
      UI.renderSavePreview(save);
      UI.renderMenuSummary(save, ship);
      UI.renderRanking(ranking);
      UI.renderLoadInfo(save);
      UI.renderHangar(C.ships, selected, (ranking[0]||{}).score||0);
      UI.showScreen('splash');
      document.querySelectorAll('[data-ship]').forEach(btn=>btn.addEventListener('click', ()=>{
        S.saveShip(btn.dataset.ship);
        main.refreshPanels();
        UI.showScreen('hangar');
      }));
    }
  };

  function launchNew(){
    const input=document.getElementById('splashPilot');
    const name=((input?.value)||'PILOTO').trim().slice(0,18)||'PILOTO';
    G.startNew(name,S.loadShip());
    UI.showHud(true);
  }

  function bindUi(){
    document.getElementById('newGameBtn')?.addEventListener('click',launchNew);
    document.getElementById('splashPilot')?.addEventListener('keydown',e=>{ if(e.key==='Enter') launchNew(); });
    document.getElementById('continueBtn')?.addEventListener('click',()=>{
      const save=S.loadGame(); if(!save) return;
      G.continueFromSave(save); UI.showHud(true);
    });
    document.getElementById('hangarBtn')?.addEventListener('click',()=>{ main.refreshPanels(); UI.showScreen('hangar'); });
    document.getElementById('rankingBtn')?.addEventListener('click',()=>{ UI.renderRanking(S.loadRanking()); UI.showScreen('ranking'); });
    document.getElementById('resumeSaveBtn')?.addEventListener('click',()=>{
      const save=S.loadGame(); if(!save) return; G.continueFromSave(save); UI.showHud(true);
    });
    document.getElementById('deleteSaveBtn')?.addEventListener('click',()=>{ S.clearGame(); main.refreshPanels(); });
    document.getElementById('clearRankingBtn')?.addEventListener('click',()=>{ S.clearRanking(); main.refreshPanels(); UI.showScreen('ranking'); });
    document.getElementById('pauseBtn')?.addEventListener('click',()=>{ G.togglePause(); UI.renderPause(G.state); });
    document.getElementById('resumeBtn')?.addEventListener('click',()=>{ G.togglePause(); UI.renderPause(G.state); });
    document.getElementById('exitBtn')?.addEventListener('click',()=>G.exitToMenu());
    document.getElementById('restartCheckpointBtn')?.addEventListener('click',()=>G.restartCheckpoint());
    document.getElementById('gameOverExitBtn')?.addEventListener('click',()=>G.exitToMenu());
  }
  NS.main=main;
  window.addEventListener('DOMContentLoaded',main.init);
})(window.SF);

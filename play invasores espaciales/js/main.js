window.SF = window.SF || {};
(function(NS){
  const UI = NS.ui, S = NS.storage, G = NS.game, C = NS.config;
  const main = {
    init(){
      UI.init();
      G.init(document.getElementById('game'));
      bindUi();
      main.refreshPanels();
      UI.setStatus('Cargando assets visuales v0.3.1...');
      NS.assets.loadAll().then(()=>UI.setStatus('Sistemas listos. Assets reales, patrones de ataque dirigidos y balance v0.3.1 activos.'));
      requestAnimationFrame(G.loop);
    },
    refreshPanels(){
      UI.renderSavePreview(S.loadGame());
      UI.renderRanking(S.loadRanking());
      UI.renderLoadInfo(S.loadGame());
      const selected = S.loadShip();
      UI.renderHangar(C.ships, selected, (S.loadRanking()[0]||{}).score||0);
      UI.showScreen('splash');
      document.querySelectorAll('[data-ship]').forEach(btn=>btn.addEventListener('click', ()=>{
        S.saveShip(btn.dataset.ship); main.refreshPanels();
      }));
    }
  };
  function bindUi(){
    document.getElementById('newGameBtn').addEventListener('click', ()=>UI.showScreen('login'));
    document.getElementById('continueBtn').addEventListener('click', ()=>{ UI.renderLoadInfo(S.loadGame()); UI.showScreen('load'); });
    document.getElementById('hangarBtn').addEventListener('click', ()=>{ main.refreshPanels(); UI.showScreen('hangar'); });
    document.getElementById('rankingBtn').addEventListener('click', ()=>{ UI.renderRanking(S.loadRanking()); UI.showScreen('ranking'); });
    document.getElementById('launchBtn').addEventListener('click', ()=>{
      const name = (document.getElementById('pilotName').value || 'PILOTO').trim().slice(0,18);
      G.startNew(name, S.loadShip()); UI.showHud(true);
    });
    document.getElementById('resumeSaveBtn').addEventListener('click', ()=>{
      const save=S.loadGame(); if(!save) return; G.continueFromSave(save); UI.showHud(true);
    });
    document.getElementById('deleteSaveBtn').addEventListener('click', ()=>{ S.clearGame(); main.refreshPanels(); });
    document.getElementById('clearRankingBtn').addEventListener('click', ()=>{ S.clearRanking(); main.refreshPanels(); UI.showScreen('ranking'); });
    document.getElementById('pauseBtn').addEventListener('click', ()=>{ G.togglePause(); UI.renderPause(G.state); });
    document.getElementById('resumeBtn').addEventListener('click', ()=>{ G.togglePause(); UI.renderPause(G.state); });
    document.getElementById('exitBtn').addEventListener('click', ()=>{ G.exitToMenu(); });
  }
  NS.main = main;
  window.addEventListener('DOMContentLoaded', main.init);
})(window.SF);

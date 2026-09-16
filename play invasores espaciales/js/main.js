window.SF = window.SF || {};
(function(NS){
  const UI = NS.ui, S = NS.storage, G = NS.game, C = NS.config, E = NS.economy;
  let shopPausedGame=false, helpPausedGame=false, lastDialogFocus=null;

  const main = {
    init(){
      UI.init();
      G.init(document.getElementById('game'));
      bindUi();
      main.refreshPanels();
      main.refreshEconomy();
      UI.setStatus('v0.6.9 · cargando recursos esenciales…');
      NS.assets.loadAll().then(async()=>{ let h=NS.assets.health?.(); if(h?.failed?.length){ UI.setStatus(`v0.6.9 · reintentando ${h.failed.length} recurso(s)…`); h=await NS.assets.retryFailed?.(); } UI.setStatus(h?.failed?.length ? `v0.6.9 · ASSETS ${h.loaded}/${h.expected} · fallos ${h.failed.length} · juego con fallback` : 'v0.6.9 · ASSETS OK · W01–05 realistas · carga adaptativa'); });
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
      UI.renderHangar(C.ships, selected, (ranking[0]||{}).score||0, E.state(), E.catalog());
      if(goHome) UI.showScreen('splash');
      document.querySelectorAll('[data-ship]').forEach(btn=>btn.addEventListener('click', ()=>{
        S.saveShip(btn.dataset.ship);
        main.refreshPanels();
        UI.showScreen('hangar');
      }));
      document.querySelectorAll('[data-hangar-buy]').forEach(btn=>btn.addEventListener('click',()=>{
        const r=E.buy(btn.dataset.hangarBuy); if(r.ok){ UI.flashMsg(`${r.item.label} · MEJORADO`,650); } else UI.flashMsg(r.reason||'NO DISPONIBLE',650);
        main.refreshPanels(false); UI.showScreen('hangar'); main.refreshEconomy();
      }));
    },
    refreshEconomy(){
      const profile=E.state();
      UI.renderEconomy(profile);
      if(document.getElementById('shopOverlay')?.style.display==='flex') UI.renderShop(profile,E.catalog(),!!G.state.running&&!G.state.gameOver);
    }
  };

  async function registerPWA(){
    if(!('serviceWorker' in navigator)) return;
    if(!/^https?:$/.test(location.protocol)) return;
    try{
      const wantedScope=new URL('./',location.href).href;
      const regs=await navigator.serviceWorker.getRegistrations();
      // Hotfix: retirar únicamente workers antiguos que controlen ESTA carpeta del juego.
      for(const reg of regs){
        if(reg.scope===wantedScope && reg.active && !reg.active.scriptURL.includes('build=0750')){
          await reg.unregister();
        }
      }
      const reg=await navigator.serviceWorker.register('./sw.js?build=0750',{scope:'./',updateViaCache:'none'});
      await reg.update().catch(()=>{});
    }catch(err){ console.warn('STARFALL PWA hotfix',err); }
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
    lastDialogFocus=document.activeElement; overlay.style.display='flex'; overlay.setAttribute('aria-hidden','false'); setTimeout(()=>document.getElementById('shopCloseBtn')?.focus(),0);
  }
  function closeShop(){
    const overlay=document.getElementById('shopOverlay'); if(!overlay) return;
    overlay.style.display='none'; overlay.setAttribute('aria-hidden','true');
    if(shopPausedGame&&G.state.paused&&!G.state.gameOver){ G.togglePause(); }
    else UI.renderPause(G.state);
    shopPausedGame=false; if(lastDialogFocus?.focus) lastDialogFocus.focus(); lastDialogFocus=null;
  }

  function openHelp(){ const overlay=document.getElementById('helpOverlay'); if(!overlay) return; lastDialogFocus=document.activeElement; helpPausedGame=!!(G.state.running&&!G.state.paused&&!G.state.gameOver&&!G.state.lifeLost); if(helpPausedGame){ G.togglePause(); document.getElementById('pauseOverlay').style.display='none'; } overlay.style.display='flex'; overlay.setAttribute('aria-hidden','false'); setTimeout(()=>document.getElementById('helpCloseBtn')?.focus(),0); }
  function closeHelp(){ const overlay=document.getElementById('helpOverlay'); if(!overlay) return; overlay.style.display='none'; overlay.setAttribute('aria-hidden','true'); if(helpPausedGame&&G.state.paused&&!G.state.gameOver) G.togglePause(); else UI.renderPause(G.state); helpPausedGame=false; if(lastDialogFocus?.focus) lastDialogFocus.focus(); lastDialogFocus=null; }

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
    document.getElementById('hangarShopBtn')?.addEventListener('click',openShop);
    document.getElementById('bossAllyBtn')?.addEventListener('click',()=>{ const ok=G.activateBossAlly?.(); UI.flashMsg(ok?'JEFE ALIADO · ACTIVO':'JEFE ALIADO · RECARGANDO',650); });
    document.getElementById('tacticalBelt')?.addEventListener('click',e=>{ const btn=e.target.closest?.('[data-quick-power]'); if(!btn||btn.disabled) return; const ok=G.useInventoryPower?.(btn.dataset.quickPower); if(ok){ main.refreshEconomy(); UI.flashMsg(`${C.powers[btn.dataset.quickPower]?.label||btn.dataset.quickPower} · ACTIVADO`,520); } });
    document.getElementById('shopCloseBtn')?.addEventListener('click',closeShop);
    document.getElementById('helpBtn')?.addEventListener('click',openHelp);
    document.getElementById('menuHelpBtn')?.addEventListener('click',openHelp);
    document.getElementById('helpCloseBtn')?.addEventListener('click',closeHelp);
    document.getElementById('shopOverlay')?.addEventListener('click',e=>{ if(e.target.id==='shopOverlay') closeShop(); });
    document.getElementById('helpOverlay')?.addEventListener('click',e=>{ if(e.target.id==='helpOverlay') closeHelp(); });
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
    document.addEventListener('keydown',e=>{ if(e.key!=='Tab') return; const active=[document.getElementById('shopOverlay'),document.getElementById('helpOverlay')].find(x=>x?.getAttribute('aria-hidden')==='false'); if(!active) return; const focusable=[...active.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null); if(!focusable.length) return; const first=focusable[0],last=focusable[focusable.length-1]; if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } });
    document.getElementById('fullscreenBtn')?.addEventListener('click',toggleFullscreen);
    document.addEventListener('fullscreenchange',updateFullscreenState); document.addEventListener('webkitfullscreenchange',updateFullscreenState);
    window.addEventListener('keydown',e=>{ const tag=document.activeElement?.tagName; if(tag==='INPUT'||tag==='TEXTAREA') return; const quick={1:'heal',2:'shield',3:'missile',4:'drone',5:'magnet',6:'life'}; if(quick[e.key]&&G.state.running&&!G.state.paused&&!G.state.gameOver&&!G.state.lifeLost){ e.preventDefault(); if(G.useInventoryPower?.(quick[e.key])){ main.refreshEconomy(); UI.flashMsg(`${C.powers[quick[e.key]]?.label||quick[e.key]} · ACTIVADO`,520); } return; } if(e.key==='Escape'){ const shop=document.getElementById('shopOverlay'); const help=document.getElementById('helpOverlay'); if(shop?.getAttribute('aria-hidden')==='false'){ e.preventDefault(); closeShop(); return; } if(help?.getAttribute('aria-hidden')==='false'){ e.preventDefault(); closeHelp(); return; } if(G.state.running&&!G.state.gameOver&&!G.state.lifeLost){ e.preventDefault(); G.togglePause(); UI.renderPause(G.state); return; } } if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey){ e.preventDefault(); toggleFullscreen(); } });
    document.addEventListener('visibilitychange',()=>{ if(document.hidden&&G.state.running&&!G.state.paused&&!G.state.gameOver&&!G.state.lifeLost&&document.getElementById('shopOverlay')?.getAttribute('aria-hidden')!=='false'){ G.state.autoPaused=true; G.togglePause(); UI.renderPause(G.state); } });
  }
  NS.main=main;
  window.addEventListener('DOMContentLoaded',main.init);
})(window.SF);

/* ============================================================
   PWA — instalación, modo standalone y aviso discreto de actualización
   ============================================================ */
(function(){
  let deferredInstallPrompt = null;
  let waitingWorker = null;
  let refreshing = false;

  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function ensurePwaTray(){
    let tray = document.getElementById('pwa-tray');
    if(!tray){
      tray = document.createElement('div');
      tray.id = 'pwa-tray';
      tray.className = 'pwa-tray';
      tray.setAttribute('aria-live','polite');
      document.body.appendChild(tray);
    }
    return tray;
  }

  function showPwaButton(id, text, className, onClick){
    const tray = ensurePwaTray();
    let btn = document.getElementById(id);
    if(!btn){
      btn = document.createElement('button');
      btn.id = id;
      btn.type = 'button';
      btn.className = `pwa-float-btn ${className || ''}`.trim();
      tray.appendChild(btn);
    }
    btn.textContent = text;
    btn.onclick = onClick;
    btn.hidden = false;
    tray.classList.add('visible');
    return btn;
  }

  function hidePwaButton(id){
    const btn = document.getElementById(id);
    if(btn) btn.hidden = true;
    const tray = document.getElementById('pwa-tray');
    if(tray && !Array.from(tray.children).some(el => !el.hidden)) tray.classList.remove('visible');
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if(isStandalone()) return;
    showPwaButton('pwa-install-btn', 'Instalar app', 'install', async ()=>{
      if(!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try{ await deferredInstallPrompt.userChoice; }catch(e){}
      deferredInstallPrompt = null;
      hidePwaButton('pwa-install-btn');
    });
  });

  window.addEventListener('appinstalled', ()=>{
    deferredInstallPrompt = null;
    hidePwaButton('pwa-install-btn');
  });

  function showUpdateAvailable(registration){
    waitingWorker = registration && registration.waiting ? registration.waiting : waitingWorker;
    showPwaButton('pwa-update-btn', 'Actualización disponible · tocar', 'update blink', ()=>{
      if(waitingWorker){
        waitingWorker.postMessage({type:'SKIP_WAITING'});
      }else{
        window.location.reload();
      }
    });
  }

  if('serviceWorker' in navigator){
    const startPwa = async ()=>{
      try{
        const registration = await navigator.serviceWorker.register('./sw.js');

        registration.update().catch(()=>{});
        setTimeout(()=> registration.update().catch(()=>{}), 1800);

        if(registration.waiting && navigator.serviceWorker.controller){
          showUpdateAvailable(registration);
        }

        registration.addEventListener('updatefound', ()=>{
          const newWorker = registration.installing;
          if(!newWorker) return;
          newWorker.addEventListener('statechange', ()=>{
            if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
              waitingWorker = newWorker;
              showUpdateAvailable(registration);
            }
          });
        });

        // Revisión temprana e intervalos posteriores mientras la app está abierta.
        setTimeout(()=> registration.update().catch(()=>{}), 6000);
        setInterval(()=> registration.update().catch(()=>{}), 15 * 60 * 1000);
      }catch(err){
        console.warn('PWA no pudo registrarse:', err);
      }
    };

    if(document.readyState === 'complete' || document.readyState === 'interactive') startPwa();
    else document.addEventListener('DOMContentLoaded', startPwa, { once:true });

    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      if(refreshing) return;
      refreshing = true;
      if(typeof persistSessionDraftNow === 'function') persistSessionDraftNow();
      window.location.reload();
    });
  }
})();

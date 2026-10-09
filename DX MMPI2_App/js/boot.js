window.__DATA_LOADED__ = false;
async function loadData() {
  const fJ = (u) => fetch(u).then(r => r.json());
  const [items, bES, bUS, bMX, cr, vt] = await Promise.all([
    fJ('data/items.json'), fJ('data/baremos.json'), fJ('data/baremo_us.json'),
    fJ('data/baremo_mx.json').catch(() => ({})), fJ('data/criterios.json'),
    fJ('data/vrin_trin_pairs.json').catch(() => ({})),
  ]);
  window.__ITEMS__ = items; window.__BAREMOS_ES__ = bES; window.__BAREMOS_US__ = bUS;
  window.__BAREMOS_MX__ = bMX; window.__CRITERIOS__ = cr; window.__VRIN_TRIN_PAIRS__ = vt;
  if (window.MMPI2) window.MMPI2.VRIN_TRIN_PAIRS = vt;
  window.__DATA_LOADED__ = true;
  document.dispatchEvent(new CustomEvent('data:ready'));
}
loadData().catch(err => {
  console.error('Error cargando datos:', err);
  const a = document.getElementById('app');
  if (a) a.innerHTML = '<div class="error-screen"><h2>Error al cargar datos</h2><p>Verifica la carpeta /data/.</p></div>';
});

/* ---- PWA: instalación y funcionamiento sin conexión ---- */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      // Aviso cuando hay una versión nueva lista
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller && window.toastAction) {
            window.toastAction('Hay una versión nueva de la aplicación.', 'Actualizar', () => {
              nw.postMessage('SKIP_WAITING');
            }, 15000);
          }
        });
      });
    }).catch((e) => console.warn('Service worker no registrado:', e));
    let reloaded = false;
    const hadController = !!navigator.serviceWorker.controller; // primera instalación: no recargar
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded || !hadController) return; reloaded = true;
      try { if (window.Storage && Storage.flush) Storage.flush(); } catch (e) {}
      location.reload();
    });
  });
})();

/* Pedir almacenamiento persistente (reduce el riesgo de que el navegador borre los casos) */
(function () {
  try {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persisted().then((p) => { if (!p) navigator.storage.persist(); });
    }
  } catch (e) {}
})();

/* Botón "Instalar aplicación" (Chrome/Edge/Android) */
window.__installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__installPrompt = e;
  document.dispatchEvent(new CustomEvent('pwa:installable'));
});
window.addEventListener('appinstalled', () => {
  window.__installPrompt = null;
  if (window.toast) window.toast('Aplicación instalada. Ya puede abrirla desde su escritorio o pantalla de inicio, incluso sin conexión.', 'success', 6000);
});

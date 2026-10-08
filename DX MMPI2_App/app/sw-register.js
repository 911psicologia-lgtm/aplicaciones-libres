// B9: PWA — registro del service worker para uso offline
// Cargado como archivo externo para cumplir con CSP script-src 'self'
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
      console.log('[PWA] Service Worker registrado:', reg.scope);
    }).catch(function(err) {
      console.warn('[PWA] No se pudo registrar el Service Worker:', err);
    });
  });
}

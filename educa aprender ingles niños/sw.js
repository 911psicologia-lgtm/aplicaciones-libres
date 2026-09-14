/* ═══════════════════════════════════════════════════════════
   PequeWorld — Service Worker (v8)
   Sin conexión también funciona: cache-first para todo lo local.
   Solo se registra en http/https (localhost o servidor); el uso
   con doble clic (file://) sigue funcionando como siempre.
   ═══════════════════════════════════════════════════════════ */
const CACHE = 'pequeworld-v8';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/style.css', 'css/game.css', 'css/games.css', 'css/games2.css', 'css/games3.css',
  'js/utils.js', 'js/data_worlds.js', 'js/data_worlds2.js', 'js/data_worlds3.js', 'js/data_worlds4.js',
  'js/data_meta.js', 'js/audio.js', 'js/effects.js', 'js/ui.js', 'js/game.js', 'js/games.js', 'js/games2.js', 'js/games3.js', 'js/main.js',
  'assets/img/ui/icon-192.png', 'assets/img/ui/icon-512.png',
  'assets/img/ui/mascot.jpg', 'assets/img/ui/mascot_cheer.jpg',
  'assets/img/words/ui_star.jpg', 'assets/img/words/ui_coin.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache-first con actualización en segundo plano (stale-while-revalidate) */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // solo recursos propios
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

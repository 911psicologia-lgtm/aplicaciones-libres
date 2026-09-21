/* ═══════════════════════════════════════════════════════════
   PequeWorld — Service Worker (v14)
   Sin conexión también funciona: cache-first para todo lo local.
   Solo se registra en http/https (localhost o servidor); el uso
   con doble clic (file://) sigue funcionando como siempre.
   v14: bump de caché (pequeworld-v14) — Mesa de Juegos Nuevos:
   Unir Puntos (números y A–J), Trazo Mágico, Rompecabezas 4/9/12,
   Adivina la palabra y Retos del finde (sáb/dom).
   ⚠️ Importante: subir CACHE en CADA versión — así el navegador
   detecta el sw.js nuevo y dispara el aviso de actualización.
   ═══════════════════════════════════════════════════════════ */
const CACHE = 'pequeworld-v14';
const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/style.css', 'css/game.css', 'css/games.css', 'css/games2.css', 'css/games3.css', 'css/games4.css',
  'js/utils.js', 'js/data_worlds.js', 'js/data_worlds2.js', 'js/data_worlds3.js', 'js/data_worlds4.js',
  'js/data_meta.js', 'js/audio.js', 'js/effects.js', 'js/ui.js', 'js/game.js', 'js/games.js', 'js/games2.js', 'js/games3.js', 'js/games4.js', 'js/main.js',
  /* v9 [C-3]: tipografía de identidad — sin esto, el primer uso offline
     mostraba el sistema y la app "cambiaba de cara" */
  'assets/fonts/Baloo2-latin-1.woff2', 'assets/fonts/Baloo2-latin-ext-0.woff2',
  'assets/fonts/Nunito-latin-3.woff2', 'assets/fonts/Nunito-latin-ext-2.woff2',
  'assets/img/ui/icon-192.png', 'assets/img/ui/icon-512.png',
  'assets/img/ui/mascot.jpg', 'assets/img/ui/mascot_cheer.jpg',
  /* avatares (identidad del perfil) */
  'assets/img/avatars/avatar_1.jpg', 'assets/img/avatars/avatar_2.jpg', 'assets/img/avatars/avatar_3.jpg',
  'assets/img/avatars/avatar_4.jpg', 'assets/img/avatars/avatar_5.jpg', 'assets/img/avatars/avatar_6.jpg',
  'assets/img/avatars/av_lion.jpg', 'assets/img/avatars/av_panda.jpg', 'assets/img/avatars/av_frog.jpg',
  'assets/img/avatars/av_bunny.jpg', 'assets/img/avatars/av_fox.jpg', 'assets/img/avatars/av_penguin.jpg',
  'assets/img/avatars/av_koala.jpg', 'assets/img/avatars/av_dino.jpg', 'assets/img/avatars/av_owl.jpg',
  'assets/img/avatars/av_robot.jpg', 'assets/img/avatars/av_unicorn.jpg', 'assets/img/avatars/av_dragon.jpg',
  /* premios e iconos de flujo principal (resultado, cofre, medallas) */
  'assets/img/words/ui_star.jpg', 'assets/img/words/ui_coin.jpg',
  'assets/img/words/ui_trophy.jpg', 'assets/img/words/ui_medal_gold.jpg',
  'assets/img/words/ui_medal_silver.jpg', 'assets/img/words/ui_medal_bronze.jpg',
  'assets/img/words/ui_chest_closed.jpg', 'assets/img/words/ui_chest_open.jpg'
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

/* Mensajes de la página: el botón de actualización puede pedir activar ya la nueva versión */
self.addEventListener('message', e => {
  if (e.data && e.data.action === 'SKIP_WAITING') self.skipWaiting();
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

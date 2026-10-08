/* ============================================
   Service Worker — MMPI-2 App
   B9: PWA instalable y offline
   ============================================ */

const CACHE_NAME = 'mmpi2-v15-final-v1';

// Recursos estáticos a cachear para uso offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './assets/favicon.svg',
  './vendor/xlsx.full.min.js',
  './vendor/chart.umd.min.js',
  './vendor/docx.umd.min.js',
  './vendor/jspdf.umd.min.js',
  './vendor/html2canvas.min.js',
  './js/lib/utils.js',
  './js/lib/storage.js',
  './js/lib/mmpi2.js',
  './js/lib/export.js',
  './js/lib/signature.js',
  './js/lib/ai-prompt.js',
  './js/lib/selftest.js',
  './js/screens/splash.js',
  './js/screens/setup.js',
  './js/screens/dashboard.js',
  './js/screens/case.js',
  './js/screens/capture.js',
  './js/screens/report.js',
  './js/app.js',
  './js/boot.js',
  './sw-register.js',
  './data/items.json',
  './data/scale_items.json',
  './data/baremo_us.json',
  './data/baremo_mx.json',
  './data/baremos.json',
  './data/vrin_trin_pairs.json',
  './data/criterios.json',
];

/* ---- Install: precachear recursos estáticos ---- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precacheando recursos estáticos…');
      // Usar addAll con tolerancia a fallos individuales
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => {
          console.warn(`[SW] No se pudo cachear ${url}:`, err.message);
        }))
      );
    }).then(() => {
      console.log('[SW] Precache completo. Activando…');
      return self.skipWaiting();
    })
  );
});

/* ---- Activate: limpiar caches antiguos ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activado. Reclamando clientes…');
      return self.clients.claim();
    })
  );
});

/* ---- Fetch: estrategia cache-first con fallback a red ----
   - Para recursos estáticos: cache-first (offline-first)
   - Para otros (no existen en cache): intentar red, y si falla, devolver index.html */
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET
  if (event.request.method !== 'GET') return;

  // Ignorar peticiones a otros orígenes (CDN, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devolver del cache
        return cachedResponse;
      }
      // No está en cache, intentar red
      return fetch(event.request).then((networkResponse) => {
        // Si la respuesta es válida, cachearla (solo archivos mismos del dominio)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si la red falla y es navegación, devolver index.html (offline fallback)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // Para otros tipos, devolver respuesta vacía
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});

/* ---- Message: permitir al frontend forzar la actualización ---- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

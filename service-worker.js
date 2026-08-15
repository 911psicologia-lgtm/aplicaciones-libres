// Service worker de "Aplicaciones Libres".
// Objetivo deliberadamente modesto: solo cachea el catálogo principal
// (index.html, manifest, iconos) para que abra rápido y funcione la
// instalación como PWA. NO cachea las 85+ apps internas: cada una tiene
// su propio peso y contenido, y cachearlas todas de una vez sería frágil
// y pesado. Si en el futuro quieres que alguna app puntual funcione sin
// conexión, se agrega su carpeta a CORE_ASSETS de forma explícita.

const CACHE_NAME = 'aplicaciones-libres-shell-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: red primero para el shell (para no quedarte con una versión
// vieja del catálogo), con respaldo en caché si no hay conexión.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo intervenimos en navegaciones (abrir el sitio) y en los assets
  // del propio shell. Todo lo demás (las apps individuales dentro de
  // cada carpeta) se deja pasar directo a la red, sin interferir.
  const url = new URL(request.url);
  const isCoreAsset =
    request.mode === 'navigate' ||
    CORE_ASSETS.some((asset) => url.pathname === asset);

  if (!isCoreAsset) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
  );
});

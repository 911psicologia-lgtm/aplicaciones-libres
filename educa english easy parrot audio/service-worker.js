// Sube este número en cada despliegue: obliga al navegador a detectar
// la nueva versión y evita que el service worker viejo siga sirviendo caché.
const CACHE_NAME = "easy-parrot-final-v7-secuencia-ingles-audio-sync-1-navicon";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/storage.js",
  "./js/datetime-context.js",
  "./js/audio-engine.js",
  "./js/app.js",
  "./data/topics-data.js",
  "./data/vocab-data.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // No interceptar POST, extensiones, otros orígenes ni solicitudes cuyo modo
  // de redirección no sea follow. Esto evita respuestas redireccionadas inválidas.
  if (req.method !== "GET" || !req.url.startsWith("http")) return;
  if (req.redirect && req.redirect !== "follow") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (req.mode === "navigate") {
      try {
        const response = await fetch(req);
        if (response && response.ok && response.type === "basic" && !response.redirected) {
          cache.put("./", response.clone()).catch(() => {});
        }
        return response;
      } catch (e) {
        return (await cache.match("./")) ||
               (await cache.match("./index.html")) ||
               new Response("Easy Parrot no pudo cargar sin conexión.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }

    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const response = await fetch(req);
      if (response && response.ok && response.type === "basic" && !response.redirected) {
        cache.put(req, response.clone()).catch(() => {});
      }
      return response;
    } catch (e) {
      return new Response("", { status: 504 });
    }
  })());
});

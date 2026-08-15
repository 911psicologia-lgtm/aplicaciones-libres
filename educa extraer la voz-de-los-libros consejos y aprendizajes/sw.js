/* ═══════════════════════════════════════════
   sw.js — Service Worker de Voz de los Libros
   ▸ Cambia VERSION en cada publicación:
     la app mostrará el aviso de nueva versión.
   ═══════════════════════════════════════════ */

const VERSION = "v0.10.28";
const CACHE = "vozlibros-" + VERSION;

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/estilos.css",
  "./js/app.js",
  "./js/prompt.js",
  "./js/audio.js",
  "./js/biblioteca.js",
  "./js/pwa.js",
  "./data/ejemplo-respuesta.json",
  "./data/demos-biblioteca.json",
  "./iconos/icono-192.png",
  "./iconos/icono-512.png",
  "./iconos/icono-maskable-512.png",
  "./iconos/apple-touch-icon.png",
  "./iconos/splash-voz-libros.png"
];

/* Instalación: guarda el cascarón de la app */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
});

/* Activación: borra cachés de versiones anteriores */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(claves =>
      Promise.all(
        claves
          .filter(k => k.startsWith("vozlibros-") && k !== CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* La app pide activar la nueva versión (botón "Actualizar") */
self.addEventListener("message", e => {
  if (e.data && e.data.tipo === "ACTIVAR_NUEVA_VERSION") self.skipWaiting();
});

/* Estrategia:
   - Navegación e index: red primero, caché de respaldo (para detectar versiones).
   - Resto de archivos propios: caché primero, red de respaldo (rápido y offline).
   - Recursos externos (Google Fonts): red con respaldo en caché dinámica. */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Navegación / documento principal
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copia));
          return r;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Mismos orígenes: caché primero
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(enCache =>
        enCache ||
        fetch(e.request).then(r => {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
          return r;
        })
      )
    );
    return;
  }

  // Externos (fuentes): solo cachear http/https.
  // Algunas extensiones del navegador inyectan chrome-extension://; Cache.put no soporta ese esquema.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE + "-ext").then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

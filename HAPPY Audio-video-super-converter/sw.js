// Service Worker de Audio y Video Super Converter (mejora DSEBI C1):
// instala la app y la deja disponible sin conexión después de la primera visita.
// Estrategia: cache-first para recursos same-origin (app + motor en 4 fragmentos),
// network-first para la navegación (con fallback al index.html guardado).
// Sin telemetría, sin servidores externos: solo guarda lo que la propia app usa.

const CACHE = 'sc-cache-v7'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          './',
          './index.html',
          './manifest.webmanifest',
          './favicon.svg',
        ])
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // nunca toca recursos de terceros

  // Navegación: red primero, caché de respaldo (permite usar la app offline)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  // Resto de recursos: caché primero; si no está, red + se guarda para offline
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit
      return fetch(req)
        .then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => hit)
    })
  )
})

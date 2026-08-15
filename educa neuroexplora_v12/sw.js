/**
 * NeuroExplora — Service Worker v2.0
 * Incluye cacheo de imágenes reales.
 */
const CACHE_NAME = 'neuroexplora-v2';

const PRECACHE = [
  '/index.html','/evolucion.html','/neurona.html',
  '/corteza.html','/juego.html','/referencias.html',
  '/css/styles.css','/css/evolution.css','/css/neuron.css',
  '/css/cortex.css','/css/game.css',
  '/js/data.js','/js/brain.js','/js/main.js','/js/brain-live.js',
  '/js/evolution-data.js','/js/evo-images.js','/js/evolution.js',
  '/js/neuron-data.js','/js/neuron.js','/js/synapse.js',
  '/js/cortex-data.js','/js/cortex.js',
  '/js/game-data.js','/js/game.js',
  '/assets/favicon.svg','/assets/icon-192.svg','/assets/icon-512.svg',
  '/assets/brain-evo-1.svg','/assets/brain-evo-2.svg',
  '/assets/brain-evo-3.svg','/assets/brain-evo-4.svg',
  '/assets/brain-lateral-real.webp','/assets/brain-mri-axial.jpg',
  '/assets/brain-hero.jpg','/assets/neurons-network.jpg',
  '/assets/evo/evo-cambrian.webp','/assets/evo/evo-tiktaalik.webp',
  '/assets/evo/evo-lamprey-brain.webp','/assets/evo/evo-crocodile-brain.webp',
  '/assets/evo/evo-mammal-brain.webp','/assets/evo/evo-primate-brain.webp',
  '/assets/evo/evo-homo-sapiens.webp',
  '/assets/neuron/neuron-real.webp','/assets/neuron/synapse-electron.webp',
  '/assets/neuron/purkinje-cell.webp','/assets/neuron/myelin-cross-section.webp',
  '/assets/neuron/neuron-types-diagram.jpg',
  '/assets/cortex/fmri-reading.webp','/assets/cortex/fmri-emotion.webp',
  '/assets/cortex/cortex-layers.webp','/assets/cortex/default-mode-network.webp',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      c.addAll(PRECACHE.map(u => new Request(u, { cache:'reload' })))
       .catch(err => console.warn('[SW] Precache parcial:', err))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone()));
        return r;
      });
    })
  );
});

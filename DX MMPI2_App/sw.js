/* Service worker · MMPI-2 App (generado) — versión 8c9e99e033
   Precarga todos los archivos para que la app funcione sin conexión.
   Estrategia: caché primero; en segundo plano se actualiza la copia. */
const CACHE = 'mmpi2-8c9e99e033';
const ASSETS = [
  "./",
  "./assets/MMPI2_Plantilla_Paciente.xlsx",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./css/styles.css",
  "./data/baremo_mx.json",
  "./data/baremo_us.json",
  "./data/baremos.json",
  "./data/criterios.json",
  "./data/items.json",
  "./data/scale_items.json",
  "./data/vrin_trin_pairs.json",
  "./index.html",
  "./js/app.js",
  "./js/boot.js",
  "./js/lib/ai-prompt.js",
  "./js/lib/export.js",
  "./js/lib/interpret.js",
  "./js/lib/mmpi2.js",
  "./js/lib/mmpi2_orig.js",
  "./js/lib/report-charts.js",
  "./js/lib/report-model.js",
  "./js/lib/report-render.js",
  "./js/lib/selftest.js",
  "./js/lib/signature.js",
  "./js/lib/storage.js",
  "./js/lib/utils.js",
  "./js/screens/capture.js",
  "./js/screens/case.js",
  "./js/screens/cases.js",
  "./js/screens/dashboard.js",
  "./js/screens/report.js",
  "./js/screens/setup.js",
  "./js/screens/splash.js",
  "./manifest.webmanifest",
  "./vendor/chart.umd.min.js",
  "./vendor/docx.umd.min.js",
  "./vendor/jspdf.plugin.autotable.min.js",
  "./vendor/jspdf.umd.min.js",
  "./vendor/xlsx.full.min.js"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('mmpi2-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Navegación: servir index.html desde caché si no hay red
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => {
      const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req).then((r) => {
        if (r && r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

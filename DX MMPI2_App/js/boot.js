window.__DATA_LOADED__ = false;
async function loadData() {
  const fJ = (u) => fetch(u).then(r => r.json());
  const [items, bES, bUS, bMX, cr, vt] = await Promise.all([
    fJ('data/items.json'), fJ('data/baremos.json'), fJ('data/baremo_us.json'),
    fJ('data/baremo_mx.json').catch(() => ({})), fJ('data/criterios.json'),
    fJ('data/vrin_trin_pairs.json').catch(() => ({})),
  ]);
  window.__ITEMS__ = items; window.__BAREMOS_ES__ = bES; window.__BAREMOS_US__ = bUS;
  window.__BAREMOS_MX__ = bMX; window.__CRITERIOS__ = cr; window.__VRIN_TRIN_PAIRS__ = vt;
  if (window.MMPI2) window.MMPI2.VRIN_TRIN_PAIRS = vt;
  window.__DATA_LOADED__ = true;
  document.dispatchEvent(new CustomEvent('data:ready'));
}
loadData().catch(err => {
  console.error('Error cargando datos:', err);
  const a = document.getElementById('app');
  if (a) a.innerHTML = '<div class="error-screen"><h2>Error al cargar datos</h2><p>Verifica la carpeta /data/.</p></div>';
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.__DATA_LOADED__ = false;

async function loadData() {
  const fetchJson = (url) => fetch(url).then(r => r.json());
  const [items, baremosES, baremosUS, baremosMX, criterios, vrinTrin] = await Promise.all([
    fetchJson('data/items.json'),
    fetchJson('data/baremos.json'),
    fetchJson('data/baremo_us.json'),
    fetchJson('data/baremo_mx.json').catch(() => ({})),
    fetchJson('data/criterios.json'),
    fetchJson('data/vrin_trin_pairs.json').catch(() => ({})),
  ]);
  window.__ITEMS__ = items;
  window.__BAREMOS_ES__ = baremosES;
  window.__BAREMOS_US__ = baremosUS;
  window.__BAREMOS_MX__ = baremosMX;
  window.__CRITERIOS__ = criterios;
  if (window.MMPI2) window.MMPI2.VRIN_TRIN_PAIRS = vrinTrin;
  window.__DATA_LOADED__ = true;
  document.dispatchEvent(new CustomEvent('data:ready'));
}

loadData().catch(err => {
  console.error('Error cargando datos:', err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<div class="error-screen"><h2>Error al cargar datos</h2><p>No se pudieron cargar los archivos de baremos/ítems. Verifica que la carpeta /data/ esté completa.</p></div>';
  }
});

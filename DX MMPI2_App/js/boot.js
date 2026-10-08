/* ============================================
   boot.js — Carga inicial de datos (V3 · FAIL-CLOSED)
   Se ejecuta antes que los demás scripts para poblar
   window.__ITEMS__, window.__BAREMOS_ES__, window.__BAREMOS_US__,
   window.__CRITERIOS__. NO hay window.__BAREMOS__ global mutable.
   ============================================ */

window.__DATA_LOADED__ = false;

async function loadData() {
  const [items, baremosES, baremosUS, criterios] = await Promise.all([
    fetch('data/items.json').then(r => r.json()),
    fetch('data/baremos.json').then(r => r.json()),
    fetch('data/baremo_us.json').then(r => r.json()),
    fetch('data/criterios.json').then(r => r.json()),
  ]);
  window.__ITEMS__ = items;
  // V3 · FAIL-CLOSED: NO hay global __BAREMOS__ mutable.
  // lookupT toma country como parámetro y selecciona entre ES y US.
  window.__BAREMOS_ES__ = baremosES;
  window.__BAREMOS_US__ = baremosUS;
  window.__CRITERIOS__ = criterios;
  window.__DATA_LOADED__ = true;
  // Notificar que los datos están listos
  document.dispatchEvent(new CustomEvent('data:ready'));
}

loadData().catch(err => {
  console.error('Error cargando datos:', err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<div class="error-screen"><h2>Error al cargar datos</h2><p>No se pudieron cargar los archivos de baremos/ítems. Verifica que la carpeta /data/ esté completa.</p></div>';
  }
});

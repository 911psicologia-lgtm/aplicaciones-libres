/* Data bootstrap kept in an external file so the application can use a restrictive CSP. */
window.__DATA_LOADED__ = false;
async function loadData() {
  const [items, baremosES, baremosUS, criterios] = await Promise.all([
    fetch('data/items.json').then(r => { if (!r.ok) throw new Error('items.json'); return r.json(); }),
    fetch('data/baremos.json').then(r => { if (!r.ok) throw new Error('baremos.json'); return r.json(); }),
    fetch('data/baremo_us.json').then(r => { if (!r.ok) throw new Error('baremo_us.json'); return r.json(); }),
    fetch('data/criterios.json').then(r => { if (!r.ok) throw new Error('criterios.json'); return r.json(); }),
  ]);
  window.__ITEMS__ = items;
  window.__BAREMOS_ES__ = baremosES;
  window.__BAREMOS_US__ = baremosUS;
  window.__CRITERIOS__ = criterios;
  window.__BAREMOS__ = baremosUS; // compatibilidad; el motor seguro usa country explícito
  window.__DATA_LOADED__ = true;
  document.dispatchEvent(new CustomEvent('data:ready'));
}
loadData().catch(err => {
  console.error('Error cargando datos:', err);
  const app = document.getElementById('app');
  if (app) {
    const box = document.createElement('div');
    box.className = 'error-screen';
    const h = document.createElement('h2'); h.textContent = 'Error al cargar datos';
    const p = document.createElement('p'); p.textContent = 'No se pudieron cargar los archivos de datos. Verifica que la carpeta /data/ esté completa.';
    box.append(h,p); app.replaceChildren(box);
  }
});

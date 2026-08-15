/* ============================================================
   MAIN — punto de entrada de la aplicación
   Se ejecuta al final, cuando todas las rutas ya están registradas
   por los archivos screens-*.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', ()=>{
  if(typeof cargarPreferenciasNarracion === 'function') cargarPreferenciasNarracion();
  go('splash', {}, { resetHistory:true, replace:true });
});

/* ============================================
   Splash screen — bienvenida + carga
   ============================================ */

const Splash = {
  render() {
    return `
      <div class="screen">
        <div class="splash">
          <div class="splash-logo">M2</div>
          <div class="splash-title">MMPI-2</div>
          <div class="splash-subtitle">
            Aplicación clínica para la administración, corrección e interpretación
            del Inventario Multifásico de Personalidad de Minnesota-2 con baremos españoles.
          </div>
          <div class="splash-loader" aria-label="Cargando"></div>
          <div style="margin-top:16px;font-size:13px;opacity:0.8" id="splash-status">Inicializando…</div>
        </div>
      </div>
    `;
  },

  mount() {
    const statusEl = document.getElementById('splash-status');
    const start = Date.now();

    const waitForData = () => {
      if (window.__DATA_LOADED__) {
        if (statusEl) statusEl.textContent = 'Datos cargados ✓';
        const elapsed = Date.now() - start;
        const wait = Math.max(0, 2000 - elapsed);
        setTimeout(() => {
          if (window.Storage && Storage.isSetupDone()) {
            App.navigate('dashboard');
          } else {
            App.navigate('setup');
          }
        }, wait);
      } else {
        if (statusEl) statusEl.textContent = 'Cargando baremos e ítems…';
        setTimeout(waitForData, 200);
      }
    };
    waitForData();
  },
};

window.Splash = Splash;

/* ============================================
   App.js — Router, estado global, menú, toast, modal
   ============================================ */

const App = {
  current: null,
  _scrollY: 0,

  /* ---- Router ---- */
  navigate(screenName, params = {}) {
    const screens = {
      splash: window.Splash,
      setup: window.Setup,
      dashboard: window.Dashboard,
      case: window.Case,
      capture: window.Capture,
      report: window.Report,
    };
    const screen = screens[screenName];
    if (!screen) {
      console.error('Pantalla desconocida:', screenName);
      return;
    }

    // Si hay una pantalla montada con método unmount(), llamarlo antes de cambiar
    if (this.current && screens[this.current] && typeof screens[this.current].unmount === 'function') {
      try { screens[this.current].unmount(); } catch (e) { console.warn('Error en unmount:', e); }
    }
    // También flush de Storage por si quedan escrituras pendientes
    if (window.Storage && typeof Storage.flush === 'function') {
      try { Storage.flush(); } catch (e) {}
    }

    // If navigating to the same screen with new state, force re-render by clearing current first
    if (this.current === screenName && screen._forceRefresh) {
      screen._forceRefresh();
    }
    window.scrollTo(0, 0);
    this.current = screenName;
    const app = document.getElementById('app');
    app.innerHTML = screen.render(params);
    if (typeof screen.mount === 'function') {
      try { screen.mount(params); } catch (e) { console.error('Error en mount(' + screenName + '):', e); }
    }
    // Close any open menu when navigating
    this.hideModal();
  },

  /* ---- Hamburger menu (slide-in from right) ---- */
  openMenu() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    content.innerHTML = this._renderMenu();
    overlay.classList.remove('hidden');
    // Bind events after insert
    this._bindMenu();
  },

  closeModal() {
    this.hideModal();
  },

  hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  _renderMenu() {
    const ev = Storage.getEvaluator() || {};
    const cases = Storage.getAllCases().slice().reverse();
    const currentCase = Storage.getCurrentCase();

    const casesHTML = cases.length === 0
      ? '<div class="menu-item"><span class="label text-muted">Sin casos guardados</span></div>'
      : cases.map(c => {
          const p = c.patient || {};
          const status = c.results ? '✓' : '○';
          const active = currentCase && currentCase.id === c.id ? 'color:var(--color-primary);font-weight:600' : '';
          return `<div class="menu-item" data-case="${this._esc(c.id)}" style="${active}">
            <span class="icon">${status}</span>
            <span class="label">
              ${this._esc(p.name || 'Sin nombre')}
              <div class="meta">${p.sex === 'M' ? 'Mujer' : 'Hombre'}${p.age != null ? ' · ' + p.age + 'a' : ''}</div>
            </span>
          </div>`;
        }).join('');

    return `
      <div class="modal-header">
        <h3>Menú</h3>
        <button class="btn btn-ghost btn-sm" id="menu-close">✕</button>
      </div>
      <div class="modal-body">

        <div class="menu-section">
          <div class="menu-section-title">Evaluador</div>
          <div class="menu-item">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--color-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${this._esc((ev.name || '?').charAt(0).toUpperCase())}</div>
            <div class="label">
              <div style="font-weight:600">${this._esc(ev.name || 'Sin configurar')}</div>
              <div class="meta">${this._esc(ev.license || ev.email || '')}</div>
            </div>
          </div>
          <div class="menu-item" data-action="setup">
            <span class="icon">⚙</span><span class="label">Configuración evaluador</span>
          </div>
        </div>

        <div class="menu-section">
          <div class="menu-section-title">Mis casos (${cases.length})</div>
          ${casesHTML}
        </div>

        <div class="menu-section">
          <div class="menu-section-title">Datos</div>
          <div class="menu-item ${currentCase ? '' : 'disabled'}" data-action="export-current" style="${currentCase ? '' : 'opacity:0.5;cursor:not-allowed'}">
            <span class="icon">📄</span><span class="label">Exportar caso actual (JSON)</span>
          </div>
          <div class="menu-item" data-action="export-all">
            <span class="icon">📦</span><span class="label">Exportar todo (JSON)</span>
          </div>
          <div class="menu-item" data-action="import">
            <span class="icon">📥</span><span class="label">Importar JSON</span>
            <input type="file" id="import-file" accept=".json" style="display:none">
          </div>
        </div>

        <div class="menu-section">
          <div class="menu-item" data-action="about">
            <span class="icon">ℹ</span><span class="label">Acerca de</span>
          </div>
          ${currentCase ? `<div class="menu-item" data-action="back-dashboard"><span class="icon">⌂</span><span class="label">Volver al panel</span></div>` : ''}
        </div>

      </div>
    `;
  },

  _bindMenu() {
    document.getElementById('menu-close').addEventListener('click', () => this.hideModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.hideModal();
    });

    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.getAttribute('data-action');
        this._menuAction(action);
      });
    });
    document.querySelectorAll('[data-case]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-case');
        const c = Storage.getCase(id);
        if (!c) { window.toast('Caso no encontrado', 'error'); return; }
        Storage.setCurrentCase(c);
        this.hideModal();
        App.navigate(c.results ? 'report' : 'capture');
      });
    });

    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.addEventListener('change', (e) => this._importJSON(e.target.files[0]));
      document.querySelector('[data-action="import"]').addEventListener('click', (e) => {
        e.stopPropagation();
        importFile.click();
      });
    }
  },

  _menuAction(action) {
    switch (action) {
      case 'setup':
        this.hideModal();
        this.navigate('setup');
        break;
      case 'export-current': {
        const cur = Storage.getCurrentCase();
        if (!cur) { window.toast('No hay caso actual', 'warning'); return; }
        const data = Storage.exportCase(cur.id);
        window.Export.exportJSON(data, `MMPI2_caso_${(cur.patient?.name || 'caso').replace(/\s+/g, '_')}.json`);
        window.toast('Caso actual exportado', 'success');
        break;
      }
      case 'export-all': {
        const data = Storage.exportAll();
        window.Export.exportJSON(data, `MMPI2_export_${Date.now()}.json`);
        window.toast('Exportación completa descargada', 'success');
        break;
      }
      case 'about':
        this._showAbout();
        break;
      case 'back-dashboard':
        this.hideModal();
        this.navigate('dashboard');
        break;
    }
  },

  _importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // Usar validateImport (fail-closed) en lugar de suponer estructura
        const v = Storage.validateImport(data);
        if (!v.ok) throw new Error(v.error);
        const valid = v.data;
        if (valid.type === 'single_case' && valid.case) {
          // Import single case
          const existing = Storage.getCase(valid.case.id);
          if (existing && !confirm('Ya existe un caso con ese ID. ¿Sobrescribir?')) return;
          Storage.saveCase(valid.case);
          Storage.flush();
          if (valid.evaluator) Storage.setEvaluator(valid.evaluator);
          window.toast('Caso importado correctamente', 'success');
        } else {
          // Full import
          if (!confirm(`Se reemplazarán todos los datos locales con ${valid.cases?.length || 0} caso(s). ¿Continuar?`)) return;
          Storage.importAll(valid);
          window.toast('Datos importados correctamente', 'success');
        }
        this.hideModal();
        App.navigate(Storage.isSetupDone() ? 'dashboard' : 'setup');
      } catch (err) {
        console.error(err);
        window.toast('Error al importar: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  },

  _showAbout() {
    const html = `
      <div style="padding:24px;text-align:center;max-width:420px">
        <div style="width:64px;height:64px;background:linear-gradient(135deg,#1F3864,#4472C4);color:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin:0 auto 16px">M2</div>
        <h3 style="color:var(--color-primary-dark);font-size:20px">MMPI-2 · Aplicación clínica</h3>
        <p style="color:var(--color-text-muted);font-size:13px;margin-top:8px">
          Versión 3.0 (Auditoría) — Aplicación clínica para la administración, corrección
          e interpretación del Inventario Multifásico de Personalidad de Minnesota-2,
          con baremos español (TEA) y estadounidense (Minnesota N=2.600).
        </p>
        <div style="background:var(--color-bg);border-radius:8px;padding:12px;margin-top:16px;font-size:12px;color:var(--color-text-muted);text-align:left">
          <strong>Notas:</strong><br>
          • Motor de cálculo fail-closed: las escalas sin clave devuelven null (no 0).<br>
          • Conversión PD→T exacta (sin aproximación); PD fuera de tabla → PD_FUERA_DE_TABLA.<br>
          • Baremo (ES/US) se pasa explícitamente; sin estado global mutable.<br>
          • Validación estricta de importación JSON (sex, country, responses).<br>
          • Las escalas marcadas <em>ES-ONLINE</em> (Fp, S, Ho) requieren TEAcorrige.<br>
          • Los datos se almacenan localmente en el navegador (localStorage).<br>
          • Exporte periódicamente para no perder información.
        </div>
        <button class="btn btn-secondary mt-24 w-full" id="about-selftest">⚙ Ejecutar self-test (14 pruebas)</button>
        <button class="btn btn-primary mt-24 w-full" id="about-close">Cerrar</button>
      </div>
    `;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header"><h3 id="modal-title">Acerca de</h3><button class="btn btn-ghost btn-sm" id="about-x">✕</button></div>
      <div class="modal-body">${html}</div>
    `;
    document.getElementById('about-x').addEventListener('click', () => this.hideModal());
    document.getElementById('about-close').addEventListener('click', () => this.hideModal());
    const stBtn = document.getElementById('about-selftest');
    if (stBtn) {
      stBtn.addEventListener('click', async () => {
        if (typeof window.runSelfTest !== 'function') {
          window.toast('Self-test no disponible', 'error');
          return;
        }
        window.toast('Ejecutando self-test… (ver consola F12)', 'info');
        try {
          const results = await window.runSelfTest();
          const pass = results.filter(r => r.status === 'PASS').length;
          const fail = results.filter(r => r.status === 'FAIL').length;
          window.toast(`Self-test: ${pass} OK, ${fail} fallos`, fail > 0 ? 'warning' : 'success', 6000);
        } catch (e) {
          window.toast('Error en self-test: ' + e.message, 'error');
        }
      });
    }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  /* ---- Boot ---- */
  init() {
    // Wait for data + DOM ready
    const start = () => {
      this.navigate('splash');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }

    // ESC closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideModal();
    });
  },
};

/* ---- Toast notifications ---- */
window.toast = function (message, type = 'info', timeout = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) { console.log('[toast]', message); return; }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }, timeout);
};

window.showModal = function (html) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = html;
  overlay.classList.remove('hidden');
};

window.hideModal = function () { App.hideModal(); };

/* ---- Boot ---- */
App.init();

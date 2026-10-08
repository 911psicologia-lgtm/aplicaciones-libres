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
      cases: window.Cases,
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
    if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('centered'); }
    const content = document.getElementById('modal-content');
    if (content) content.classList.remove('dialog');
  },

  _renderMenu() {
    const ev = Storage.getEvaluator() || {};
    const cases = Storage.getAllCases().slice().sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
    const currentCase = Storage.getCurrentCase();
    const nTrash = Storage.getTrash().length;

    const casesHTML = cases.length === 0
      ? '<div class="menu-item"><span class="label text-muted">Sin casos guardados</span></div>'
      : cases.slice(0, 6).map(c => {
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
          <div class="menu-section-title">Casos recientes (${cases.length})</div>
          ${casesHTML}
          <div class="menu-item" data-action="cases">
            <span class="icon">🗂</span><span class="label"><strong>Gestionar casos</strong><div class="meta">Buscar, filtrar, editar, duplicar, eliminar</div></span>
          </div>
          <div class="menu-item" data-action="trash">
            <span class="icon">🗑</span><span class="label">Papelera (${nTrash})</span>
          </div>
        </div>

        <div class="menu-section">
          <div class="menu-section-title">Copias de seguridad</div>
          <div class="menu-item" data-action="export-all">
            <span class="icon">📦</span><span class="label">Descargar copia de seguridad completa<div class="meta">${this._lastBackupLabel()}</div></span>
          </div>
          <div class="menu-item" data-action="import">
            <span class="icon">📥</span><span class="label">Restaurar / importar copia</span>
            <input type="file" id="import-file" accept=".json,application/json" style="display:none">
          </div>
          <div class="menu-item ${currentCase ? '' : 'disabled'}" data-action="export-current" style="${currentCase ? '' : 'opacity:0.5;cursor:not-allowed'}">
            <span class="icon">📄</span><span class="label">Exportar solo el caso actual</span>
          </div>
        </div>

        <div class="menu-section">
          ${window.__installPrompt ? `<div class="menu-item" data-action="install"><span class="icon">⬇</span><span class="label"><strong>Instalar aplicación</strong><div class="meta">Abrir desde el escritorio y usar sin conexión</div></span></div>` : ''}
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
      case 'cases':
        this.hideModal();
        this.navigate('cases', { view: 'active' });
        break;
      case 'trash':
        this.hideModal();
        this.navigate('cases', { view: 'trash' });
        break;
      case 'export-current': {
        const cur = Storage.getCurrentCase();
        if (!cur) { window.toast('No hay caso actual', 'warning'); return; }
        const data = Storage.exportCase(cur.id);
        window.Export.exportJSON(data, `MMPI2_caso_${(cur.patient?.name || 'caso').replace(/\s+/g, '_')}.json`);
        window.toast('Caso actual exportado', 'success');
        break;
      }
      case 'export-all':
        this.downloadBackup();
        this.hideModal();
        break;
      case 'about':
        this._showAbout();
        break;
      case 'install':
        if (window.__installPrompt) {
          window.__installPrompt.prompt();
          window.__installPrompt.userChoice.finally(() => { window.__installPrompt = null; });
        }
        this.hideModal();
        break;
      case 'back-dashboard':
        this.hideModal();
        this.navigate('dashboard');
        break;
    }
  },

  /* ---- Copia de seguridad completa ---- */
  downloadBackup() {
    try {
      const data = Storage.exportAll();
      const d = new Date();
      const stamp = d.toISOString().slice(0, 10) + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
      window.Export.exportJSON(data, `MMPI2_copia_seguridad_${stamp}.json`);
      Storage.markBackup();
      window.toast(`Copia de seguridad descargada (${data.cases.length} caso(s)). Guárdela en un lugar seguro: su nube o un disco externo.`, 'success', 6000);
    } catch (e) {
      window.toast(window.friendlyError(e, 'generar la copia de seguridad'), 'error', 7000);
    }
  },

  _lastBackupLabel() {
    const lb = Storage.getLastBackup();
    if (!lb) return 'Nunca se ha descargado una copia';
    const days = Math.floor((Date.now() - new Date(lb).getTime()) / 86400000);
    return days === 0 ? 'Última copia: hoy' : `Última copia: hace ${days} día(s)`;
  },

  openImportPicker() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => this._importJSON(inp.files[0]);
    inp.click();
  },

  _importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => window.toast('No se pudo leer el archivo seleccionado.', 'error');
    reader.onload = async (ev) => {
      try {
        let data;
        try { data = JSON.parse(ev.target.result); }
        catch (e) { throw new SyntaxError('JSON inválido'); }
        // Usar validateImport (fail-closed) en lugar de suponer estructura
        const v = Storage.validateImport(data);
        if (!v.ok) throw new Error(v.error);
        const valid = v.data;
        this.hideModal();
        if (valid.type === 'single_case' && valid.case) {
          const existing = Storage.getCase(valid.case.id);
          if (existing) {
            const ok = await window.confirmDialog({ title: 'El caso ya existe', message: `Ya hay un caso «${existing.patient?.name || ''}» con el mismo identificador. ¿Reemplazarlo con la versión del archivo?`, okText: 'Reemplazar' });
            if (!ok) return;
          }
          Storage.saveCase(valid.case);
          Storage.flush();
          if (valid.evaluator && !Storage.getEvaluator()) Storage.setEvaluator(valid.evaluator);
          window.toast('Caso importado correctamente', 'success');
        } else {
          const n = valid.cases?.length || 0;
          const current = Storage.getAllCases().length;
          let mode = 'merge';
          if (current > 0) {
            const merge = await window.confirmDialog({
              title: 'Restaurar copia de seguridad',
              message: `El archivo contiene ${n} caso(s). Ahora tiene ${current} caso(s) en este navegador.\n\n«Combinar» añade los casos del archivo sin borrar los actuales (si un caso está en ambos, se conserva la versión más reciente).\n«Reemplazar todo» borra los casos actuales y deja solo los del archivo.`,
              okText: 'Combinar (recomendado)', cancelText: 'Más opciones…',
            });
            if (!merge) {
              const replace = await window.confirmDialog({ title: 'Reemplazar todo', message: `Se borrarán los ${current} caso(s) actuales y se cargarán los ${n} del archivo. ¿Continuar?`, okText: 'Reemplazar todo', danger: true });
              if (!replace) return;
              mode = 'replace';
            }
          }
          if (mode === 'replace' || current === 0) {
            Storage.importAll(valid);
            window.toast(`Copia restaurada: ${n} caso(s)`, 'success');
          } else {
            const r = Storage.mergeAll(valid);
            window.toast(`Copia combinada: ${r.added} nuevo(s), ${r.updated} actualizado(s), ${r.kept} sin cambios`, 'success', 6000);
          }
        }
        if (valid.evaluator && !Storage.isSetupDone()) { Storage.setEvaluator(valid.evaluator); Storage.markSetupDone(); }
        App.navigate(Storage.isSetupDone() ? 'dashboard' : 'setup');
      } catch (err) {
        console.error(err);
        window.toast(window.friendlyError(err, 'importar el archivo'), 'error', 8000);
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
          Versión 4.0 — Aplicación clínica para la administración, corrección
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
          • Descargue copias de seguridad periódicas (menú › Copias de seguridad).<br>
          • Instalable como aplicación y utilizable sin conexión.
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

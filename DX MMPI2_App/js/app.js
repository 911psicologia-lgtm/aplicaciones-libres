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
    this._previousFocus = document.activeElement;
    content.innerHTML = this._renderMenu();
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    // Bind events after insert
    this._bindMenu();
  },

  closeModal() {
    this.hideModal();
  },

  hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) { overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden', 'true'); }
    if (this._previousFocus && typeof this._previousFocus.focus === 'function') { try { this._previousFocus.focus(); } catch (_) {} }
    this._previousFocus = null;
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
          return `<div class="menu-item" role="button" tabindex="0" data-case="${this._esc(c.id)}" style="${active}">
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
        <button class="btn btn-ghost btn-sm" id="menu-close" aria-label="Cerrar menú">✕</button>
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
          <div class="menu-item" role="button" tabindex="0" data-action="setup">
            <span class="icon">⚙</span><span class="label">Configuración evaluador</span>
          </div>
        </div>

        <div class="menu-section">
          <div class="menu-section-title">Mis casos (${cases.length})</div>
          ${casesHTML}
        </div>

        <div class="menu-section">
          <div class="menu-section-title">Datos</div>
          <div class="menu-item ${currentCase ? '' : 'disabled'}" role="button" tabindex="${currentCase ? '0' : '-1'}" aria-disabled="${currentCase ? 'false' : 'true'}" data-action="export-current" style="${currentCase ? '' : 'opacity:0.5;cursor:not-allowed'}">
            <span class="icon">📄</span><span class="label">Exportar caso actual (JSON)</span>
          </div>
          <div class="menu-item" role="button" tabindex="0" data-action="export-all">
            <span class="icon">📦</span><span class="label">Exportar todo (JSON)</span>
          </div>
          <div class="menu-item" role="button" tabindex="0" data-action="import">
            <span class="icon">📥</span><span class="label">Importar JSON</span>
            <input type="file" id="import-file" accept=".json" style="display:none">
          </div>
        </div>

        <div class="menu-section">
          <div class="menu-item" role="button" tabindex="0" data-action="about">
            <span class="icon">ℹ</span><span class="label">Acerca de</span>
          </div>
          ${currentCase ? `<div class="menu-item" role="button" tabindex="0" data-action="back-dashboard"><span class="icon">⌂</span><span class="label">Volver al panel</span></div>` : ''}
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

    document.querySelectorAll('[data-action],[data-case]').forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
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
    if (file.size > 5 * 1024 * 1024) { window.toast('El JSON excede el máximo permitido de 5 MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.version) throw new Error('Formato no reconocido');
        if (data.type === 'single_case' && data.case) {
          // Import single case
          const existing = Storage.getCase(data.case.id);
          if (existing && !confirm('Ya existe un caso con ese ID. ¿Sobrescribir?')) return;
          Storage.saveCase(data.case);
          if (data.evaluator) Storage.setEvaluator(data.evaluator);
          window.toast('Caso importado correctamente', 'success');
        } else {
          // Full import
          if (!confirm(`Se reemplazarán todos los datos locales con ${data.cases?.length || 0} caso(s). ¿Continuar?`)) return;
          Storage.importAll(data);
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
          Versión auditada 1.1-safe — Aplicación de apoyo para captura, integración,
          visualización e informe MMPI-2. Las puntuaciones oficiales pueden importarse
          desde sistemas de corrección autorizados.
        </p>
        <div style="background:var(--color-bg);border-radius:8px;padding:12px;margin-top:16px;font-size:12px;color:var(--color-text-muted);text-align:left">
          <strong>Notas de seguridad y validez:</strong><br>
          • Una clave ausente o incompleta queda bloqueada; nunca se transforma en PD=0.<br>
          • El dataset español heredado no se usa para generar T locales hasta nueva validación.<br>
          • Para uso clínico/pericial, priorice T importadas desde Pearson/TEA u otra corrección autorizada.<br>
          • Los datos se almacenan localmente en el navegador (localStorage) y no están cifrados en reposo; utilice un perfil/dispositivo protegido y exporte copias seguras.<br>
          • El análisis con IA externa puede transmitir los datos que usted copie al proveedor elegido; use preferentemente el prompt desidentificado.
        </div>
        <button class="btn btn-primary mt-24" id="about-close">Cerrar</button>
      </div>
    `;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header"><h3>Acerca de</h3><button class="btn btn-ghost btn-sm" id="about-x" aria-label="Cerrar ventana">✕</button></div>
      <div class="modal-body">${html}</div>
    `;
    document.getElementById('about-x').addEventListener('click', () => this.hideModal());
    document.getElementById('about-close').addEventListener('click', () => this.hideModal());
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
  App._previousFocus = document.activeElement;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  const focusable = content.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if (focusable) setTimeout(() => focusable.focus(), 0);
};

window.hideModal = function () { App.hideModal(); };

/* ---- Boot ---- */
App.init();

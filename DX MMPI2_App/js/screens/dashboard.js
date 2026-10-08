/* ============================================
   Dashboard — panel principal con lista de casos
   ============================================ */

const Dashboard = {
  render() {
    const ev = Storage.getEvaluator() || {};
    const cases = Storage.getAllCases().slice().reverse();
    const recent = cases.slice(0, 5);

    const recentHTML = recent.length === 0
      ? `<div class="empty-state" style="min-height:auto;padding:40px 20px;text-align:center">
          <div class="empty-state-icon" style="font-size:48px">📋</div>
          <h2 style="font-size:20px;margin-bottom:8px">Bienvenido al MMPI-2 Clínica</h2>
          <p style="max-width:400px;margin:0 auto 16px;color:var(--color-text-muted)">Esta aplicación le permite aplicar, corregir e interpretar el MMPI-2 con baremos de México, Estados Unidos y España — todo en su navegador, sin enviar datos a servidores externos.</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">
            <button class="btn btn-primary" id="dash-new-empty">+ Crear primer caso</button>
            <button class="btn btn-secondary" id="dash-import-backup">Importar respaldo</button>
          </div>
          <div style="font-size:12px;color:var(--color-text-muted);margin-top:12px">Pasos: 1) Crear caso → 2) Capturar respuestas → 3) Generar informe</div>
        </div>`
      : recent.map(c => this._caseRow(c)).join('');

    return `
      <div class="screen">
        <div class="topbar">
          <div class="topbar-title">MMPI-2 · Panel principal</div>
          <div class="topbar-actions">
            <button class="btn btn-primary btn-sm" id="dash-new">+ Nuevo caso</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Abrir menú de navegación"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="screen-content">

          <div class="card">
            <div class="card-body flex items-center gap-16">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--color-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px">
                ${(ev.name || '?').charAt(0).toUpperCase()}
              </div>
              <div style="flex:1">
                <div style="font-size:13px;color:var(--color-text-muted)">Bienvenido/a</div>
                <div style="font-size:18px;font-weight:600;color:var(--color-primary-dark)">${this._esc(ev.name || 'Evaluador')}</div>
                <div style="font-size:13px;color:var(--color-text-muted)">
                  ${this._esc([ev.license, ev.email].filter(Boolean).join(' · '))}
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" id="dash-edit-evaluator">Editar perfil</button>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Casos recientes</h3>
              ${cases.length > 0 ? `<div style="display:flex;gap:8px;align-items:center">
                <input type="text" id="dash-search" placeholder="Buscar paciente..." class="form-input" style="width:200px;font-size:13px;padding:4px 8px">
                <button class="btn btn-ghost btn-sm" id="dash-all-cases">Ver todos (${cases.length})</button>
              </div>` : ''}
            </div>
            <div class="card-body" style="padding:0" id="dash-cases-list">
              ${recentHTML}
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3>Acciones rápidas</h3></div>
            <div class="card-body flex gap-8" style="flex-wrap:wrap">
              <button class="btn btn-primary" id="dash-new2">+ Nuevo caso</button>
              <button class="btn btn-secondary" id="dash-all-cases2">Ver todos los casos</button>
              <button class="btn btn-secondary" id="dash-export-json">Exportar respaldo (JSON)</button>
              <button class="btn btn-secondary" id="dash-import-json">Importar respaldo</button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  _caseRow(c) {
    const p = c.patient || {};
    const date = c.updatedAt || c.createdAt || '';
    const dateStr = date ? new Date(date).toLocaleDateString('es-ES') : '—';
    const status = c.results ? '<span class="text-success">● Completado</span>' : '<span class="text-muted">○ En curso</span>';
    return `
      <div class="menu-item" data-case-id="${this._esc(c.id)}" style="border-bottom:1px solid var(--color-border)">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--color-bg);display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--color-primary)">${this._esc((p.name || '?').charAt(0).toUpperCase())}</div>
        <div class="label">
          <div style="font-weight:600">${this._esc(p.name || 'Sin nombre')}</div>
          <div class="meta">${dateStr} · ${p.sex === 'M' ? 'Mujer' : 'Hombre'} · ${this._esc(p.context || '—')}</div>
        </div>
        <div style="text-align:right">${status}</div>
      </div>
    `;
  },

  mount() {
    const hamBtn = document.getElementById('ham-btn');
    if (hamBtn) hamBtn.addEventListener('click', () => App.openMenu());
    
    const dashNew = document.getElementById('dash-new');
    if (dashNew) dashNew.addEventListener('click', () => this._newCase());
    
    const e1 = document.getElementById('dash-new-empty');
    if (e1) e1.addEventListener('click', () => this._newCase());
    
    const dashNew2 = document.getElementById('dash-new2');
    if (dashNew2) dashNew2.addEventListener('click', () => this._newCase());
    
    const editEvaluator = document.getElementById('dash-edit-evaluator');
    if (editEvaluator) editEvaluator.addEventListener('click', () => App.navigate('setup'));
    
    // These buttons only exist when there are cases
    const dashAllCases = document.getElementById('dash-all-cases');
    if (dashAllCases) dashAllCases.addEventListener('click', () => App.openMenu());
    
    const dashAllCases2 = document.getElementById('dash-all-cases2');
    if (dashAllCases2) dashAllCases2.addEventListener('click', () => App.openMenu());
    
    const exportJson = document.getElementById('dash-export-json');
    if (exportJson) exportJson.addEventListener('click', () => {
      const data = Storage.exportAll();
      window.Export.exportJSON(data, `MMPI2_backup_${new Date().toISOString().slice(0,10)}.json`);
      window.toast('Respaldo descargado ✓', 'success');
    });

    const importJson = document.getElementById('dash-import-json');
    if (importJson) importJson.addEventListener('click', () => this._importBackup());
    const importBackup = document.getElementById('dash-import-backup');
    if (importBackup) importBackup.addEventListener('click', () => this._importBackup());

    const search = document.getElementById('dash-search');
    if (search) search.addEventListener('input', (e) => this._search(e.target.value));

    document.querySelectorAll('[data-case-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-case-id');
        const c = Storage.getCase(id);
        if (!c) { window.toast('Caso no encontrado', 'error'); return; }
        Storage.setCurrentCase(c);
        App.navigate(c.results ? 'report' : 'capture');
      });
    });
  },

  _newCase() {
    Storage.setCurrentCase(null);
    App.navigate('case');
  },

  _search(query) {
    if (!query || query.trim() === '') {
      const cases = Storage.getAllCases().slice().reverse();
      const recent = cases.slice(0, 5);
      document.getElementById('dash-cases-list').innerHTML = recent.map(c => this._caseRow(c)).join('');
      this._rebindCases();
      return;
    }
    const q = query.toLowerCase();
    const all = Storage.getAllCases().slice().reverse();
    const filtered = all.filter(c => {
      const p = c.patient || {};
      return (p.name || '').toLowerCase().includes(q) || 
             (p.context || '').toLowerCase().includes(q) ||
             (p.document || '').toLowerCase().includes(q);
    });
    const list = document.getElementById('dash-cases-list');
    if (filtered.length === 0) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-text-muted)">Sin resultados</div>';
    } else {
      list.innerHTML = filtered.map(c => this._caseRow(c)).join('');
    }
    this._rebindCases();
  },

  _rebindCases() {
    document.querySelectorAll('[data-case-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-case-id');
        const c = Storage.getCase(id);
        if (!c) { window.toast('Caso no encontrado', 'error'); return; }
        Storage.setCurrentCase(c);
        App.navigate(c.results ? 'report' : 'capture');
      });
    });
  },

  _importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.cases || !Array.isArray(data.cases)) {
            window.toast('Archivo no válido: no contiene casos', 'error');
            return;
          }
          let imported = 0;
          data.cases.forEach(c => {
            if (c && c.id) {
              Storage.saveCase(c);
              imported++;
            }
          });
          Storage.flush();
          window.toast(`${imported} caso(s) importado(s) ✓`, 'success');
          setTimeout(() => App.navigate('dashboard'), 500);
        } catch (err) {
          window.toast('Error al leer el archivo: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Dashboard = Dashboard;

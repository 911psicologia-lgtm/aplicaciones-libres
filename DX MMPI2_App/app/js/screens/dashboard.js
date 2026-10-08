/* ============================================
   Dashboard — panel principal con lista de casos
   A5: Estado vacío guiado paso a paso
   B8: Búsqueda y filtros en historial
   ============================================ */

const Dashboard = {
  _view: 'recent',      // 'recent' | 'all'
  _search: '',          // texto de búsqueda
  _filterStatus: 'all', // 'all' | 'completed' | 'in-progress'
  _filterCountry: 'all', // 'all' | 'ES' | 'US' | 'MX'
  _sortBy: 'date-desc', // 'date-desc' | 'date-asc' | 'name-asc'

  render() {
    const ev = Storage.getEvaluator() || {};
    const cases = Storage.getAllCases().slice().reverse();

    const recentHTML = cases.length === 0
      ? this._renderEmptyState()
      : cases.slice(0, 5).map(c => this._caseRow(c)).join('');

    const allCasesHTML = cases.length === 0
      ? ''
      : this._renderAllCasesView(cases);

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

          <!-- A5: Estado vacío guiado cuando no hay casos -->
          ${cases.length === 0 ? '' : `
            <div class="card">
              <div class="card-header">
                <h3>Casos recientes</h3>
                ${cases.length > 0 ? `<button class="btn btn-ghost btn-sm" id="dash-all-cases">Ver todos (${cases.length})</button>` : ''}
              </div>
              <div class="card-body" style="padding:0">
                ${recentHTML}
              </div>
            </div>
          `}

          ${cases.length === 0 ? this._renderEmptyState() : ''}

          <!-- B8: Vista de todos los casos con búsqueda y filtros -->
          ${allCasesHTML}

          <div class="card">
            <div class="card-header"><h3>Acciones rápidas</h3></div>
            <div class="card-body flex gap-8" style="flex-wrap:wrap">
              <button class="btn btn-primary" id="dash-new2">+ Nuevo caso</button>
              <button class="btn btn-secondary" id="dash-all-cases2">Ver todos los casos</button>
              <button class="btn btn-secondary" id="dash-export-json">Exportar JSON (backup completo)</button>
              <button class="btn btn-secondary" id="dash-import-json">Importar JSON (restaurar)</button>
              <input type="file" id="dash-import-file" accept=".json" style="display:none">
            </div>
          </div>

        </div>
      </div>
    `;
  },

  /* ---------- A5: Estado vacío guiado paso a paso ---------- */
  _renderEmptyState() {
    return `
      <div class="card">
        <div class="card-body" style="padding:32px 24px;text-align:center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,var(--color-primary),var(--color-primary-dark));color:#fff;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px">📋</div>
          <h2 style="font-size:22px;color:var(--color-primary-dark);margin-bottom:8px">Bienvenido/a a MMPI-2</h2>
          <p style="color:var(--color-text-muted);font-size:14px;margin-bottom:24px;max-width:480px;margin-left:auto;margin-right:auto">
            Aún no tiene casos registrados. Siga estos 4 pasos para aplicar, corregir e interpretar su primer MMPI-2.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;max-width:720px;margin:0 auto;text-align:left">
            <div style="background:var(--color-bg);border-radius:8px;padding:16px;border-left:3px solid var(--color-primary)">
              <div style="font-weight:700;color:var(--color-primary-dark);font-size:13px;margin-bottom:4px">1. Configure su perfil</div>
              <div style="font-size:12px;color:var(--color-text-muted)">Nombre, matrícula y firma del evaluador.</div>
              <button class="btn btn-secondary btn-sm mt-8" id="empty-step1" style="width:100%">Configurar</button>
            </div>
            <div style="background:var(--color-bg);border-radius:8px;padding:16px;border-left:3px solid var(--color-primary)">
              <div style="font-weight:700;color:var(--color-primary-dark);font-size:13px;margin-bottom:4px">2. Cree un caso</div>
              <div style="font-size:12px;color:var(--color-text-muted)">Datos del paciente y selección de baremo (ES/US/MX).</div>
              <button class="btn btn-secondary btn-sm mt-8" id="empty-step2" style="width:100%">Nuevo caso</button>
            </div>
            <div style="background:var(--color-bg);border-radius:8px;padding:16px;border-left:3px solid var(--color-primary)">
              <div style="font-weight:700;color:var(--color-primary-dark);font-size:13px;margin-bottom:4px">3. Aplique el test</div>
              <div style="font-size:12px;color:var(--color-text-muted)">567 ítems o cargue Excel de respuestas.</div>
              <button class="btn btn-secondary btn-sm mt-8" id="empty-step3" style="width:100%" disabled>Ir a captura</button>
            </div>
            <div style="background:var(--color-bg);border-radius:8px;padding:16px;border-left:3px solid var(--color-primary)">
              <div style="font-weight:700;color:var(--color-primary-dark);font-size:13px;margin-bottom:4px">4. Genere el informe</div>
              <div style="font-size:12px;color:var(--color-text-muted)">Tablas, gráficos, interpretación y exportación.</div>
              <button class="btn btn-secondary btn-sm mt-8" id="empty-step4" style="width:100%" disabled>Ver informe</button>
            </div>
          </div>
          <div style="margin-top:24px;padding:12px;background:rgba(31,56,100,0.05);border-radius:6px;font-size:12px;color:var(--color-text-muted);max-width:480px;margin-left:auto;margin-right:auto">
            💡 <strong>Tip:</strong> Esta aplicación funciona 100% en su navegador. Los datos se guardan localmente. Exporte regularmente un backup JSON para no perderlos.
          </div>
        </div>
      </div>
    `;
  },

  /* ---------- B8: Vista completa con búsqueda y filtros ---------- */
  _renderAllCasesView(cases) {
    const total = cases.length;
    return `
      <div class="card" id="dash-all-view">
        <div class="card-header">
          <h3>Todos los casos (${total})</h3>
        </div>
        <div class="card-body" style="padding:12px 16px;border-bottom:1px solid var(--color-border)">
          <div class="flex gap-8" style="flex-wrap:wrap;align-items:center">
            <input type="search" id="dash-search" placeholder="🔍 Buscar por nombre, documento, contexto…" value="${this._esc(this._search)}" style="flex:1;min-width:240px;padding:8px 12px;border:1px solid var(--color-border);border-radius:6px;font-size:13px">
            <select id="dash-filter-status" class="form-select" style="width:auto;min-width:140px">
              <option value="all" ${this._filterStatus === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="completed" ${this._filterStatus === 'completed' ? 'selected' : ''}>Completados</option>
              <option value="in-progress" ${this._filterStatus === 'in-progress' ? 'selected' : ''}>En curso</option>
            </select>
            <select id="dash-filter-country" class="form-select" style="width:auto;min-width:140px">
              <option value="all" ${this._filterCountry === 'all' ? 'selected' : ''}>Todos los baremos</option>
              <option value="ES" ${this._filterCountry === 'ES' ? 'selected' : ''}>España (TEA)</option>
              <option value="US" ${this._filterCountry === 'US' ? 'selected' : ''}>EE.UU. (Minnesota)</option>
              <option value="MX" ${this._filterCountry === 'MX' ? 'selected' : ''}>México (Lucio)</option>
            </select>
            <select id="dash-sort" class="form-select" style="width:auto;min-width:140px">
              <option value="date-desc" ${this._sortBy === 'date-desc' ? 'selected' : ''}>Más recientes primero</option>
              <option value="date-asc" ${this._sortBy === 'date-asc' ? 'selected' : ''}>Más antiguos primero</option>
              <option value="name-asc" ${this._sortBy === 'name-asc' ? 'selected' : ''}>Nombre (A-Z)</option>
            </select>
          </div>
        </div>
        <div class="card-body" style="padding:0" id="dash-filtered-list">
          ${this._renderFilteredList(cases)}
        </div>
      </div>
    `;
  },

  _renderFilteredList(cases) {
    // Aplicar filtros
    let filtered = cases.slice();
    if (this._search.trim()) {
      const q = this._search.toLowerCase().trim();
      filtered = filtered.filter(c => {
        const p = c.patient || {};
        return (p.name || '').toLowerCase().includes(q)
            || (p.document || '').toLowerCase().includes(q)
            || (p.context || '').toLowerCase().includes(q);
      });
    }
    if (this._filterStatus !== 'all') {
      filtered = filtered.filter(c => this._filterStatus === 'completed' ? !!c.results : !c.results);
    }
    if (this._filterCountry !== 'all') {
      filtered = filtered.filter(c => (c.patient?.country || 'ES') === this._filterCountry);
    }
    // Sort
    if (this._sortBy === 'date-desc') {
      filtered.sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    } else if (this._sortBy === 'date-asc') {
      filtered.sort((a,b) => new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0));
    } else if (this._sortBy === 'name-asc') {
      filtered.sort((a,b) => (a.patient?.name || '').localeCompare(b.patient?.name || ''));
    }
    if (filtered.length === 0) {
      return `<div style="padding:24px;text-align:center;color:var(--color-text-muted);font-size:13px">
        No se encontraron casos con los filtros actuales.
        <button class="btn btn-ghost btn-sm" id="dash-clear-filters" style="margin-left:8px">Limpiar filtros</button>
      </div>`;
    }
    return filtered.map(c => this._caseRow(c)).join('');
  },

  _caseRow(c) {
    const p = c.patient || {};
    const date = c.updatedAt || c.createdAt || '';
    const dateStr = date ? new Date(date).toLocaleDateString('es-ES') : '—';
    const status = c.results
      ? '<span class="text-success">● Completado</span>'
      : '<span class="text-muted">○ En curso</span>';
    const countryFlag = p.country === 'US' ? '🇺🇸' : (p.country === 'MX' ? '🇲🇽' : '🇪🇸');
    const countryName = p.country === 'US' ? 'EE.UU.' : (p.country === 'MX' ? 'México' : 'España');
    return `
      <div class="menu-item" data-case-id="${this._esc(c.id)}" style="border-bottom:1px solid var(--color-border)">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--color-bg);display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--color-primary)">${this._esc((p.name || '?').charAt(0).toUpperCase())}</div>
        <div class="label">
          <div style="font-weight:600">${this._esc(p.name || 'Sin nombre')}</div>
          <div class="meta">${dateStr} · ${p.sex === 'M' ? 'Mujer' : 'Hombre'} · ${countryFlag} ${countryName} · ${this._esc(p.context || '—')}</div>
        </div>
        <div style="text-align:right">
          ${status}
          <div style="margin-top:4px">
            <button class="btn btn-ghost btn-sm" data-case-delete="${this._esc(c.id)}" style="font-size:11px;padding:2px 8px">🗑 Eliminar</button>
          </div>
        </div>
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

    // Empty state step buttons
    const step1 = document.getElementById('empty-step1');
    if (step1) step1.addEventListener('click', () => App.navigate('setup'));
    const step2 = document.getElementById('empty-step2');
    if (step2) step2.addEventListener('click', () => this._newCase());

    const editEvaluator = document.getElementById('dash-edit-evaluator');
    if (editEvaluator) editEvaluator.addEventListener('click', () => App.navigate('setup'));

    const dashAllCases = document.getElementById('dash-all-cases');
    if (dashAllCases) dashAllCases.addEventListener('click', () => {
      document.getElementById('dash-all-view')?.scrollIntoView({ behavior: 'smooth' });
    });

    const dashAllCases2 = document.getElementById('dash-all-cases2');
    if (dashAllCases2) dashAllCases2.addEventListener('click', () => {
      const v = document.getElementById('dash-all-view');
      if (v) v.scrollIntoView({ behavior: 'smooth' });
      else window.toast('Aún no hay casos para mostrar', 'info');
    });

    const exportJson = document.getElementById('dash-export-json');
    if (exportJson) exportJson.addEventListener('click', () => {
      const data = Storage.exportAll();
      const d = new Date();
      const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
      window.Export.exportJSON(data, `MMPI2_backup_${stamp}.json`);
      window.toast('Backup completo descargado', 'success');
    });

    const importJson = document.getElementById('dash-import-json');
    const importFile = document.getElementById('dash-import-file');
    if (importJson && importFile) {
      importJson.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => {
        if (e.target.files[0]) App._importJSON(e.target.files[0]);
      });
    }

    // B8: Search & filters
    const search = document.getElementById('dash-search');
    if (search) search.addEventListener('input', (e) => {
      this._search = e.target.value;
      this._refreshList();
    });

    const filterStatus = document.getElementById('dash-filter-status');
    if (filterStatus) filterStatus.addEventListener('change', (e) => {
      this._filterStatus = e.target.value;
      this._refreshList();
    });

    const filterCountry = document.getElementById('dash-filter-country');
    if (filterCountry) filterCountry.addEventListener('change', (e) => {
      this._filterCountry = e.target.value;
      this._refreshList();
    });

    const sort = document.getElementById('dash-sort');
    if (sort) sort.addEventListener('change', (e) => {
      this._sortBy = e.target.value;
      this._refreshList();
    });

    // Click on case row
    document.querySelectorAll('[data-case-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-case-delete]')) return;
        const id = el.getAttribute('data-case-id');
        const c = Storage.getCase(id);
        if (!c) { window.toast('Caso no encontrado', 'error'); return; }
        Storage.setCurrentCase(c);
        App.navigate(c.results ? 'report' : 'capture');
      });
    });

    // Delete case
    document.querySelectorAll('[data-case-delete]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-case-delete');
        const c = Storage.getCase(id);
        if (!c) return;
        if (!confirm(`¿Eliminar el caso de "${c.patient?.name || 'sin nombre'}"? Esta acción no se puede deshacer.`)) return;
        Storage.deleteCase(id);
        window.toast('Caso eliminado', 'success');
        App.navigate('dashboard');
      });
    });
  },

  _refreshList() {
    const container = document.getElementById('dash-filtered-list');
    if (!container) return;
    const cases = Storage.getAllCases().slice().reverse();
    container.innerHTML = this._renderFilteredList(cases);
    // Re-bind click handlers
    container.querySelectorAll('[data-case-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-case-delete]')) return;
        const id = el.getAttribute('data-case-id');
        const c = Storage.getCase(id);
        if (!c) { window.toast('Caso no encontrado', 'error'); return; }
        Storage.setCurrentCase(c);
        App.navigate(c.results ? 'report' : 'capture');
      });
    });
    container.querySelectorAll('[data-case-delete]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-case-delete');
        const c = Storage.getCase(id);
        if (!c) return;
        if (!confirm(`¿Eliminar el caso de "${c.patient?.name || 'sin nombre'}"? Esta acción no se puede deshacer.`)) return;
        Storage.deleteCase(id);
        window.toast('Caso eliminado', 'success');
        App.navigate('dashboard');
      });
    });
    const clearFilters = document.getElementById('dash-clear-filters');
    if (clearFilters) clearFilters.addEventListener('click', () => {
      this._search = '';
      this._filterStatus = 'all';
      this._filterCountry = 'all';
      this._sortBy = 'date-desc';
      App.navigate('dashboard');
    });
  },

  _newCase() {
    Storage.setCurrentCase(null);
    App.navigate('case');
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Dashboard = Dashboard;

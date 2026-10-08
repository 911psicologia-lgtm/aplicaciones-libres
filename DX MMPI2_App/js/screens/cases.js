/* ============================================
   Cases — gestión completa de casos
   - Búsqueda (nombre, documento, motivo, contexto)
   - Filtros (estado, contexto, baremo, rango de fechas) y orden
   - Acciones por caso: abrir, editar datos, editar respuestas,
     duplicar, exportar, eliminar (a papelera)
   - Selección múltiple: eliminar / exportar en bloque
   - Papelera: restaurar o eliminar definitivamente
   - Detección de posibles duplicados (mismo nombre o documento)
   ============================================ */

const Cases = {
  _state: null,
  _selected: new Set(),

  _defaultState() {
    return { q: '', status: 'all', context: 'all', country: 'all', from: '', to: '', sort: 'updated', view: 'active' };
  },

  _loadState() {
    if (this._state) return this._state;
    try {
      const s = JSON.parse(sessionStorage.getItem('mmpi2_cases_filters') || 'null');
      this._state = Object.assign(this._defaultState(), s || {});
    } catch (e) { this._state = this._defaultState(); }
    return this._state;
  },

  _saveState() {
    try { sessionStorage.setItem('mmpi2_cases_filters', JSON.stringify(this._state)); } catch (e) {}
  },

  render(params = {}) {
    const st = this._loadState();
    if (params && params.view) st.view = params.view;
    this._selected = new Set();
    const nActive = Storage.getAllCases().length;
    const nTrash = Storage.getTrash().length;
    return `
      <div class="screen">
        <div class="topbar">
          <div class="topbar-title">MMPI-2 · Casos</div>
          <div class="topbar-actions">
            <button class="btn btn-ghost btn-sm" id="cs-back">‹ Panel</button>
            <button class="btn btn-primary btn-sm" id="cs-new">+ Nuevo caso</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Abrir menú de navegación"><span></span><span></span><span></span></button>
          </div>
        </div>
        <div class="screen-content">
          <div class="tabs" role="tablist">
            <button class="tab ${st.view === 'active' ? 'active' : ''}" data-view="active" role="tab">Casos activos <span class="tab-count">${nActive}</span></button>
            <button class="tab ${st.view === 'trash' ? 'active' : ''}" data-view="trash" role="tab">Papelera <span class="tab-count">${nTrash}</span></button>
          </div>

          ${st.view === 'active' ? this._filtersHTML(st) : this._trashBarHTML(nTrash)}

          <div class="card">
            <div class="card-header cases-header">
              <label class="check-all"><input type="checkbox" id="cs-check-all"> <span id="cs-count">—</span></label>
              <div class="flex gap-8" style="flex-wrap:wrap">
                ${st.view === 'active'
                  ? `<button class="btn btn-secondary btn-sm" id="cs-bulk-export" disabled>⤓ Exportar selección</button>
                     <button class="btn btn-danger btn-sm" id="cs-bulk-delete" disabled>🗑 Eliminar selección</button>`
                  : `<button class="btn btn-secondary btn-sm" id="cs-bulk-restore" disabled>↺ Restaurar selección</button>
                     <button class="btn btn-danger btn-sm" id="cs-bulk-purge" disabled>Eliminar definitivamente</button>`}
              </div>
            </div>
            <div class="card-body" style="padding:0" id="cs-list"></div>
          </div>
        </div>
      </div>`;
  },

  _filtersHTML(st) {
    const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`;
    return `
      <div class="card filters-card">
        <div class="card-body">
          <div class="search-row">
            <input type="search" id="cs-q" class="form-input" placeholder="Buscar por nombre, documento, motivo…" value="${escHTML(st.q)}" aria-label="Buscar casos">
          </div>
          <div class="filters-grid">
            <label>Estado
              <select id="cs-status" class="form-select">
                ${opt('all', 'Todos', st.status)}${opt('done', 'Completados', st.status)}${opt('progress', 'En curso', st.status)}${opt('dups', 'Posibles duplicados', st.status)}
              </select></label>
            <label>Contexto
              <select id="cs-context" class="form-select">
                ${opt('all', 'Todos', st.context)}${opt('Clínico', 'Clínico', st.context)}${opt('Laboral', 'Laboral', st.context)}${opt('Forense', 'Forense', st.context)}${opt('Otro', 'Otro', st.context)}
              </select></label>
            <label>Baremo
              <select id="cs-country" class="form-select">
                ${opt('all', 'Todos', st.country)}${opt('US', 'EE. UU.', st.country)}${opt('MX', 'México', st.country)}${opt('ES', 'España', st.country)}
              </select></label>
            <label>Aplicado desde
              <input type="date" id="cs-from" class="form-input" value="${escHTML(st.from)}"></label>
            <label>hasta
              <input type="date" id="cs-to" class="form-input" value="${escHTML(st.to)}"></label>
            <label>Ordenar por
              <select id="cs-sort" class="form-select">
                ${opt('updated', 'Última modificación', st.sort)}${opt('applied', 'Fecha de aplicación', st.sort)}${opt('name', 'Nombre (A–Z)', st.sort)}${opt('created', 'Fecha de creación', st.sort)}
              </select></label>
          </div>
          <div class="filters-foot"><button class="btn btn-ghost btn-sm" id="cs-clear">Limpiar filtros</button></div>
        </div>
      </div>`;
  },

  _trashBarHTML(n) {
    return `
      <div class="card"><div class="card-body flex items-center justify-between gap-16" style="flex-wrap:wrap">
        <div style="font-size:13px;color:var(--color-text-muted);max-width:640px">
          Los casos eliminados quedan aquí hasta que los borre definitivamente. Puede restaurarlos en cualquier momento.
          Las copias de seguridad completas también incluyen la papelera.
        </div>
        <button class="btn btn-danger btn-sm" id="cs-empty-trash" ${n ? '' : 'disabled'}>Vaciar papelera</button>
      </div></div>`;
  },

  mount() {
    bindEvent('ham-btn', 'click', () => App.openMenu());
    bindEvent('cs-back', 'click', () => App.navigate('dashboard'));
    bindEvent('cs-new', 'click', () => { Storage.setCurrentCase(null); App.navigate('case'); });
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
      this._state.view = b.getAttribute('data-view'); this._saveState(); App.navigate('cases');
    }));

    const st = this._state;
    const onChange = (id, key, ev = 'change') => bindEvent(id, ev, (e) => { st[key] = e.target.value; this._saveState(); this._renderList(); });
    onChange('cs-q', 'q', 'input');
    onChange('cs-status', 'status');
    onChange('cs-context', 'context');
    onChange('cs-country', 'country');
    onChange('cs-from', 'from');
    onChange('cs-to', 'to');
    onChange('cs-sort', 'sort');
    bindEvent('cs-clear', 'click', () => { this._state = Object.assign(this._defaultState(), { view: 'active' }); this._saveState(); App.navigate('cases'); });

    bindEvent('cs-check-all', 'change', (e) => {
      const ids = this._visibleIds;
      this._selected = e.target.checked ? new Set(ids) : new Set();
      this._renderList();
    });
    bindEvent('cs-bulk-delete', 'click', () => this._bulkDelete());
    bindEvent('cs-bulk-export', 'click', () => this._bulkExport());
    bindEvent('cs-bulk-restore', 'click', () => this._bulkRestore());
    bindEvent('cs-bulk-purge', 'click', () => this._bulkPurge());
    bindEvent('cs-empty-trash', 'click', async () => {
      const n = Storage.getTrash().length;
      const ok = await confirmDialog({ title: 'Vaciar papelera', message: `Se eliminarán definitivamente ${n} caso(s). Esta acción no se puede deshacer.`, okText: 'Vaciar', danger: true });
      if (!ok) return;
      Storage.emptyTrash();
      toast('Papelera vaciada', 'success');
      App.navigate('cases');
    });

    this._renderList();
    const q = document.getElementById('cs-q');
    if (q && st.q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  },

  /* ---------- Filtro y orden ---------- */
  _norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  },

  _dupKey(c) {
    const p = c.patient || {};
    const doc = String(p.document || '').replace(/[^0-9a-z]/gi, '');
    return doc ? 'd:' + doc : 'n:' + this._norm(p.name).replace(/\(copia\)/g, '').trim();
  },

  _filtered() {
    const st = this._state;
    let list = st.view === 'trash' ? Storage.getTrash() : Storage.getAllCases();
    const dupCount = {};
    for (const c of list) { const k = this._dupKey(c); dupCount[k] = (dupCount[k] || 0) + 1; }
    this._dupCount = dupCount;
    if (st.view === 'active') {
      const q = this._norm(st.q);
      list = list.filter(c => {
        const p = c.patient || {};
        if (q) {
          const hay = this._norm([p.name, p.document, p.reason, p.context, p.history].join(' '));
          if (!q.split(' ').every(w => hay.includes(w))) return false;
        }
        if (st.status === 'done' && !c.results) return false;
        if (st.status === 'progress' && c.results) return false;
        if (st.status === 'dups' && dupCount[this._dupKey(c)] < 2) return false;
        if (st.context !== 'all' && p.context !== st.context) return false;
        if (st.country !== 'all' && (p.country || 'US') !== st.country) return false;
        const ad = p.applicationDate || (c.createdAt || '').slice(0, 10);
        if (st.from && ad < st.from) return false;
        if (st.to && ad > st.to) return false;
        return true;
      });
    }
    const by = {
      updated: (a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''),
      created: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      applied: (a, b) => ((b.patient || {}).applicationDate || '').localeCompare((a.patient || {}).applicationDate || ''),
      name: (a, b) => this._norm((a.patient || {}).name).localeCompare(this._norm((b.patient || {}).name)),
    };
    const sortKey = st.view === 'trash' ? null : st.sort;
    list = list.slice().sort(sortKey ? by[sortKey] : (a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''));
    if (st.status === 'dups' && st.view === 'active') list.sort((a, b) => this._dupKey(a).localeCompare(this._dupKey(b)) || by.updated(a, b));
    return list;
  },

  _renderList() {
    const cont = document.getElementById('cs-list');
    if (!cont) return;
    const list = this._filtered();
    this._visibleIds = list.map(c => c.id);
    // Mantener solo seleccionados visibles
    this._selected = new Set([...this._selected].filter(id => this._visibleIds.includes(id)));
    const trash = this._state.view === 'trash';
    const total = trash ? Storage.getTrash().length : Storage.getAllCases().length;
    const cnt = document.getElementById('cs-count');
    if (cnt) cnt.textContent = this._selected.size
      ? `${this._selected.size} seleccionado(s)`
      : `${list.length} de ${total} caso(s)`;
    const all = document.getElementById('cs-check-all');
    if (all) { all.checked = list.length > 0 && this._selected.size === list.length; all.indeterminate = this._selected.size > 0 && this._selected.size < list.length; }
    ['cs-bulk-delete', 'cs-bulk-export', 'cs-bulk-restore', 'cs-bulk-purge'].forEach(id => {
      const b = document.getElementById(id); if (b) b.disabled = this._selected.size === 0;
    });

    if (!list.length) {
      cont.innerHTML = trash
        ? `<div class="empty-inline">La papelera está vacía.</div>`
        : (total === 0
          ? `<div class="empty-inline">Aún no hay casos. <button class="btn btn-primary btn-sm" id="cs-empty-new">Crear el primero</button></div>`
          : `<div class="empty-inline">Ningún caso coincide con la búsqueda o los filtros. <button class="btn btn-ghost btn-sm" id="cs-empty-clear">Limpiar filtros</button></div>`);
      bindEvent('cs-empty-new', 'click', () => { Storage.setCurrentCase(null); App.navigate('case'); });
      bindEvent('cs-empty-clear', 'click', () => document.getElementById('cs-clear').click());
      return;
    }
    cont.innerHTML = list.map(c => this._rowHTML(c, trash)).join('');
    this._bindRows();
  },

  _rowHTML(c, trash) {
    const p = c.patient || {};
    const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('es-ES') : '—';
    const appDate = p.applicationDate ? fmt(p.applicationDate + 'T12:00:00') : '—';
    const countryLbl = { US: 'EE. UU.', MX: 'México', ES: 'España' }[p.country || 'US'] || '—';
    const answered = Array.isArray(c.responses) ? c.responses.filter(r => r === 1 || r === 2).length : 0;
    let statusHTML;
    if (c.results) {
      const vals = Object.values(c.results).filter(r => r && r.code);
      const doc = vals.filter(r => typeof r.t === 'number').length;
      statusHTML = `<span class="chip chip-ok">● Completado</span><span class="chip-sub">${doc}/${vals.length} escalas con T</span>`;
    } else {
      statusHTML = `<span class="chip chip-progress">○ En curso</span><span class="chip-sub">${answered}/567 ítems</span>`;
    }
    const dups = (this._dupCount || {})[this._dupKey(c)] || 0;
    const dupBadge = (!trash && dups > 1) ? `<span class="chip chip-warn" title="Hay ${dups} casos con el mismo nombre o documento">${dups} versiones</span>` : '';
    const sel = this._selected.has(c.id) ? 'checked' : '';
    const actions = trash
      ? `<button class="btn btn-secondary btn-sm" data-act="restore">↺ Restaurar</button>
         <button class="btn btn-ghost btn-sm text-danger" data-act="purge">Eliminar definitivamente</button>`
      : `<button class="btn btn-primary btn-sm" data-act="open">${c.results ? 'Ver informe' : 'Continuar captura'}</button>
         <div class="row-menu">
           <button class="btn btn-secondary btn-sm" data-act="menu" aria-haspopup="true" aria-label="Más acciones">⋯</button>
           <div class="row-menu-pop hidden" role="menu">
             <button data-act="edit" role="menuitem">✎ Editar datos del caso</button>
             <button data-act="answers" role="menuitem">☑ Editar respuestas</button>
             <button data-act="dup" role="menuitem">⧉ Duplicar</button>
             <button data-act="export" role="menuitem">⤓ Exportar caso (JSON)</button>
             <button data-act="delete" role="menuitem" class="text-danger">🗑 Eliminar</button>
           </div>
         </div>`;
    return `
      <div class="case-row" data-id="${escHTML(c.id)}">
        <input type="checkbox" class="case-check" data-check="${escHTML(c.id)}" ${sel} aria-label="Seleccionar ${escHTML(p.name || 'caso')}">
        <div class="case-avatar">${escHTML((p.name || '?').charAt(0).toUpperCase())}</div>
        <div class="case-main">
          <div class="case-name">${escHTML(p.name || 'Sin nombre')} ${dupBadge}</div>
          <div class="case-meta">
            ${p.document ? 'Doc. ' + escHTML(p.document) + ' · ' : ''}${p.sex === 'M' ? 'Mujer' : p.sex === 'H' ? 'Hombre' : '—'}${p.age != null ? ' · ' + p.age + ' años' : ''} · ${escHTML(p.context || '—')} · Baremo ${countryLbl}
          </div>
          <div class="case-meta">Aplicado ${appDate} · ${trash ? 'Eliminado ' + fmt(c.deletedAt) : 'Modificado ' + fmt(c.updatedAt || c.createdAt)}</div>
        </div>
        <div class="case-status">${statusHTML}</div>
        <div class="case-actions">${actions}</div>
      </div>`;
  },

  _bindRows() {
    document.querySelectorAll('[data-check]').forEach(cb => cb.addEventListener('change', () => {
      const id = cb.getAttribute('data-check');
      if (cb.checked) this._selected.add(id); else this._selected.delete(id);
      this._renderList();
    }));
    document.querySelectorAll('.case-row').forEach(row => {
      const id = row.getAttribute('data-id');
      row.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._action(btn.getAttribute('data-act'), id, row);
      }));
    });
    if (!this._docListener) {
      this._docListener = () => document.querySelectorAll('.row-menu-pop').forEach(m => m.classList.add('hidden'));
      document.addEventListener('click', this._docListener);
    }
  },

  async _action(act, id, row) {
    if (act === 'menu') {
      const pop = row.querySelector('.row-menu-pop');
      const wasHidden = pop.classList.contains('hidden');
      document.querySelectorAll('.row-menu-pop').forEach(m => m.classList.add('hidden'));
      if (wasHidden) pop.classList.remove('hidden');
      return;
    }
    if (act === 'restore') {
      Storage.restoreCase(id); toast('Caso restaurado', 'success'); this._refreshTabs(); this._renderList(); return;
    }
    if (act === 'purge') {
      const c = Storage.getTrash().find(x => x.id === id);
      const ok = await confirmDialog({ title: 'Eliminar definitivamente', message: `«${(c && c.patient && c.patient.name) || 'Caso'}» se borrará para siempre. Esta acción no se puede deshacer.`, okText: 'Eliminar', danger: true });
      if (!ok) return;
      Storage.purgeCase(id); toast('Caso eliminado definitivamente', 'success'); this._refreshTabs(); this._renderList(); return;
    }
    const c = Storage.getCase(id);
    if (!c) { toast('No se encontró el caso. Es posible que se haya eliminado en otra pestaña.', 'error'); this._renderList(); return; }
    Cases.openCase(c, act);
    if (act === 'dup' || act === 'delete' || act === 'export') { this._refreshTabs(); this._renderList(); }
  },

  /* Acciones reutilizables (también desde panel y menú) */
  async openCase(c, act = 'open') {
    switch (act) {
      case 'open':
        Storage.setCurrentCase(c);
        App.navigate(c.results ? 'report' : 'capture');
        break;
      case 'edit':
        Storage.setCurrentCase(c);
        App.navigate('case');
        break;
      case 'answers':
        Storage.setCurrentCase(c);
        App.navigate('capture', { editing: true });
        break;
      case 'dup': {
        const copy = Storage.duplicateCase(c.id);
        if (copy) toast(`Caso duplicado como «${copy.patient.name}»`, 'success');
        break;
      }
      case 'export': {
        const data = Storage.exportCase(c.id);
        Export.exportJSON(data, `MMPI2_caso_${Export._safeName(c.patient && c.patient.name)}.json`);
        toast('Caso exportado', 'success');
        break;
      }
      case 'delete': {
        const name = (c.patient && c.patient.name) || 'Caso';
        Storage.deleteCase(c.id);
        toastAction(`«${name}» se movió a la papelera`, 'Deshacer', () => {
          Storage.restoreCase(c.id);
          toast('Caso restaurado', 'success');
          if (App.current === 'cases') App.navigate('cases');
          else if (App.current === 'dashboard') App.navigate('dashboard');
        });
        break;
      }
    }
  },

  async _bulkDelete() {
    const ids = [...this._selected];
    if (!ids.length) return;
    const ok = await confirmDialog({ title: 'Eliminar casos', message: `Se moverán ${ids.length} caso(s) a la papelera. Podrá restaurarlos desde allí.`, okText: 'Mover a la papelera', danger: true });
    if (!ok) return;
    const n = Storage.deleteCases(ids);
    this._selected = new Set();
    toastAction(`${n} caso(s) movidos a la papelera`, 'Deshacer', () => {
      ids.forEach(id => Storage.restoreCase(id));
      toast('Casos restaurados', 'success');
      App.navigate('cases');
    });
    this._refreshTabs();
    this._renderList();
  },

  _bulkExport() {
    const ids = new Set(this._selected);
    const all = Storage.exportAll();
    all.type = 'partial_backup';
    all.cases = all.cases.filter(c => ids.has(c.id));
    all.trash = [];
    all.counts = { cases: all.cases.length, trash: 0 };
    Export.exportJSON(all, `MMPI2_seleccion_${all.cases.length}_casos_${new Date().toISOString().slice(0, 10)}.json`);
    toast(`${all.cases.length} caso(s) exportados`, 'success');
  },

  _bulkRestore() {
    const ids = [...this._selected];
    ids.forEach(id => Storage.restoreCase(id));
    this._selected = new Set();
    toast(`${ids.length} caso(s) restaurados`, 'success');
    this._refreshTabs();
    this._renderList();
  },

  async _bulkPurge() {
    const ids = [...this._selected];
    const ok = await confirmDialog({ title: 'Eliminar definitivamente', message: `Se borrarán para siempre ${ids.length} caso(s). Esta acción no se puede deshacer.`, okText: 'Eliminar', danger: true });
    if (!ok) return;
    ids.forEach(id => Storage.purgeCase(id));
    this._selected = new Set();
    toast('Casos eliminados definitivamente', 'success');
    this._refreshTabs();
    this._renderList();
  },

  _refreshTabs() {
    const counts = { active: Storage.getAllCases().length, trash: Storage.getTrash().length };
    document.querySelectorAll('[data-view]').forEach(b => {
      const el = b.querySelector('.tab-count'); if (el) el.textContent = counts[b.getAttribute('data-view')];
    });
    const et = document.getElementById('cs-empty-trash'); if (et) et.disabled = counts.trash === 0;
  },

  unmount() {
    if (this._docListener) { document.removeEventListener('click', this._docListener); this._docListener = null; }
  },
};

window.Cases = Cases;

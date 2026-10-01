/* ============================================
   Dashboard — panel principal con lista de casos
   ============================================ */

const Dashboard = {
  render() {
    const ev = Storage.getEvaluator() || {};
    const cases = Storage.getAllCases().slice().reverse();
    const recent = cases.slice(0, 5);

    const recentHTML = recent.length === 0
      ? `<div class="empty-state" style="min-height:auto;padding:32px 20px">
          <div class="empty-state-icon">📋</div>
          <h2 style="font-size:18px">Aún no hay casos</h2>
          <p>Cree su primer caso para empezar a aplicar el MMPI-2.</p>
          <button class="btn btn-primary" id="dash-new-empty">Nuevo caso</button>
        </div>`
      : recent.map(c => this._caseRow(c)).join('');

    return `
      <div class="screen">
        <div class="topbar">
          <div class="topbar-title">MMPI-2 · Panel principal</div>
          <div class="topbar-actions">
            <button class="btn btn-primary btn-sm" id="dash-new">+ Nuevo caso</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Menú"><span></span><span></span><span></span></button>
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
              ${cases.length > 0 ? `<button class="btn btn-ghost btn-sm" id="dash-all-cases">Ver todos (${cases.length})</button>` : ''}
            </div>
            <div class="card-body" style="padding:0">
              ${recentHTML}
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3>Acciones rápidas</h3></div>
            <div class="card-body flex gap-8" style="flex-wrap:wrap">
              <button class="btn btn-primary" id="dash-new2">+ Nuevo caso</button>
              <button class="btn btn-secondary" id="dash-all-cases2">Ver todos los casos</button>
              <button class="btn btn-secondary" id="dash-export-json">Exportar JSON (todo)</button>
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
    document.getElementById('ham-btn').addEventListener('click', () => App.openMenu());
    document.getElementById('dash-new').addEventListener('click', () => this._newCase());
    const e1 = document.getElementById('dash-new-empty'); if (e1) e1.addEventListener('click', () => this._newCase());
    document.getElementById('dash-new2').addEventListener('click', () => this._newCase());
    document.getElementById('dash-edit-evaluator').addEventListener('click', () => App.navigate('setup'));
    document.getElementById('dash-all-cases').addEventListener('click', () => App.openMenu());
    document.getElementById('dash-all-cases2').addEventListener('click', () => App.openMenu());
    document.getElementById('dash-export-json').addEventListener('click', () => {
      const data = Storage.exportAll();
      window.Export.exportJSON(data, `MMPI2_export_${Date.now()}.json`);
      window.toast('Exportación JSON descargada', 'success');
    });

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

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Dashboard = Dashboard;

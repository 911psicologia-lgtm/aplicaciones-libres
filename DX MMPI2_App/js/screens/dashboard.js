/* ============================================
   Dashboard — panel principal
   - Estado vacío guiado (primeros pasos)
   - Resumen (casos, completados, en curso)
   - Recordatorio de copia de seguridad
   - Casos recientes con acciones rápidas
   ============================================ */

const Dashboard = {
  render() {
    const ev = Storage.getEvaluator() || {};
    const cases = Storage.getAllCases().slice()
      .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''));
    const recent = cases.slice(0, 6);
    const done = cases.filter(c => c.results).length;
    const inProgress = cases.length - done;
    const nTrash = Storage.getTrash().length;

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
            <div class="card-body flex items-center gap-16" style="flex-wrap:wrap">
              <div class="avatar-lg">${escHTML((ev.name || '?').charAt(0).toUpperCase())}</div>
              <div style="flex:1;min-width:200px">
                <div style="font-size:13px;color:var(--color-text-muted)">Bienvenido/a</div>
                <div style="font-size:18px;font-weight:600;color:var(--color-primary-dark)">${escHTML(ev.name || 'Evaluador')}</div>
                <div style="font-size:13px;color:var(--color-text-muted)">${escHTML([ev.license, ev.email].filter(Boolean).join(' · '))}</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="dash-edit-evaluator">Editar perfil</button>
            </div>
          </div>

          ${cases.length === 0 ? this._onboardingHTML() : this._statsHTML(cases.length, done, inProgress, nTrash)}

          ${this._backupReminderHTML(cases.length)}

          ${cases.length ? `
          <div class="card">
            <div class="card-header">
              <h3>Casos recientes</h3>
              <button class="btn btn-ghost btn-sm" id="dash-all-cases">Ver y gestionar todos (${cases.length}) ›</button>
            </div>
            <div class="card-body" style="padding:0">
              <div class="search-row" style="padding:12px 16px;border-bottom:1px solid var(--color-border)">
                <input type="search" id="dash-search" class="form-input" placeholder="Buscar paciente por nombre o documento…" aria-label="Buscar paciente">
              </div>
              ${recent.map(c => this._caseRow(c)).join('')}
            </div>
          </div>` : ''}

        </div>
      </div>
    `;
  },

  _onboardingHTML() {
    return `
      <div class="card onboarding">
        <div class="card-body">
          <h2 class="onb-title">Primeros pasos</h2>
          <p class="onb-sub">En tres pasos tendrá su primer informe. Los datos se guardan solo en este navegador.</p>
          <ol class="onb-steps">
            <li>
              <div class="onb-num">1</div>
              <div><strong>Cree el caso</strong><span>Registre los datos del evaluado, el baremo (país) y el motivo de evaluación.</span></div>
            </li>
            <li>
              <div class="onb-num">2</div>
              <div><strong>Capture las 567 respuestas</strong><span>Aplique el test en pantalla (con atajos de teclado V/F) o cargue el Excel que respondió el paciente.</span></div>
            </li>
            <li>
              <div class="onb-num">3</div>
              <div><strong>Revise y exporte el informe</strong><span>Tablas, interpretación y gráficas por escala; exporte a Word, PDF o HTML con su firma.</span></div>
            </li>
          </ol>
          <div class="flex gap-8" style="flex-wrap:wrap;margin-top:18px">
            <button class="btn btn-primary btn-lg" id="dash-new-empty">Crear mi primer caso</button>
            <a class="btn btn-secondary" href="assets/MMPI2_Plantilla_Paciente.xlsx" download>⤓ Plantilla Excel para el paciente</a>
            <button class="btn btn-ghost" id="dash-restore">¿Ya tiene casos? Restaurar copia de seguridad</button>
          </div>
        </div>
      </div>`;
  },

  _statsHTML(total, done, inProgress, nTrash) {
    return `
      <div class="stats-row">
        <button class="stat" data-goto="all"><span class="stat-n">${total}</span><span class="stat-l">Casos</span></button>
        <button class="stat" data-goto="done"><span class="stat-n">${done}</span><span class="stat-l">Completados</span></button>
        <button class="stat" data-goto="progress"><span class="stat-n">${inProgress}</span><span class="stat-l">En curso</span></button>
        <button class="stat" data-goto="trash"><span class="stat-n">${nTrash}</span><span class="stat-l">En papelera</span></button>
      </div>`;
  },

  _backupReminderHTML(nCases) {
    if (!nCases) return '';
    const lb = Storage.getLastBackup();
    const days = lb ? Math.floor((Date.now() - new Date(lb).getTime()) / 86400000) : null;
    if (days !== null && days < 7) {
      return `<div class="backup-ok">✓ Última copia de seguridad: ${days === 0 ? 'hoy' : 'hace ' + days + ' día(s)'} · <button class="link-btn" id="dash-backup">Descargar otra</button></div>`;
    }
    const msg = days === null
      ? 'Aún no ha descargado ninguna copia de seguridad.'
      : `Su última copia de seguridad tiene ${days} días.`;
    return `
      <div class="card backup-warn">
        <div class="card-body flex items-center gap-16" style="flex-wrap:wrap">
          <div style="font-size:26px">🛡</div>
          <div style="flex:1;min-width:220px">
            <strong>${msg}</strong>
            <div style="font-size:13px;color:var(--color-text-muted)">Los casos viven en este navegador: si se borran los datos de navegación o cambia de equipo, se pierden. Una copia de seguridad los protege y permite restaurarlos en cualquier equipo.</div>
          </div>
          <button class="btn btn-primary" id="dash-backup">Descargar copia ahora</button>
        </div>
      </div>`;
  },

  _caseRow(c) {
    const p = c.patient || {};
    const date = c.updatedAt || c.createdAt || '';
    const dateStr = date ? new Date(date).toLocaleDateString('es-ES') : '—';
    const answered = Array.isArray(c.responses) ? c.responses.filter(r => r === 1 || r === 2).length : 0;
    const status = c.results
      ? '<span class="chip chip-ok">● Completado</span>'
      : `<span class="chip chip-progress">○ ${answered}/567</span>`;
    return `
      <div class="case-row compact" data-case-id="${escHTML(c.id)}" data-search="${escHTML(((p.name || '') + ' ' + (p.document || '')).toLowerCase())}" tabindex="0">
        <div class="case-avatar">${escHTML((p.name || '?').charAt(0).toUpperCase())}</div>
        <div class="case-main">
          <div class="case-name">${escHTML(p.name || 'Sin nombre')}</div>
          <div class="case-meta">${dateStr} · ${p.sex === 'M' ? 'Mujer' : p.sex === 'H' ? 'Hombre' : '—'} · ${escHTML(p.context || '—')}</div>
        </div>
        <div class="case-status">${status}</div>
        <div class="case-actions">
          <button class="btn btn-ghost btn-sm" data-act="edit" title="Editar datos del caso" aria-label="Editar">✎</button>
          <button class="btn btn-ghost btn-sm text-danger" data-act="delete" title="Mover a la papelera" aria-label="Eliminar">🗑</button>
        </div>
      </div>
    `;
  },

  mount() {
    bindEvent('ham-btn', 'click', () => App.openMenu());
    bindEvent('dash-new', 'click', () => this._newCase());
    bindEvent('dash-new-empty', 'click', () => this._newCase());
    bindEvent('dash-edit-evaluator', 'click', () => App.navigate('setup'));
    bindEvent('dash-all-cases', 'click', () => App.navigate('cases', { view: 'active' }));
    bindEvent('dash-restore', 'click', () => App.openImportPicker());
    bindEvent('dash-backup', 'click', () => { App.downloadBackup(); setTimeout(() => App.navigate('dashboard'), 400); });

    document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => {
      const g = b.getAttribute('data-goto');
      if (g === 'trash') { App.navigate('cases', { view: 'trash' }); return; }
      Cases._loadState();
      Cases._state.status = g === 'all' ? 'all' : g;
      Cases._state.view = 'active';
      Cases._saveState();
      App.navigate('cases');
    }));

    bindEvent('dash-search', 'input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length >= 3) {
        // Búsqueda completa en la pantalla de casos
        Cases._loadState();
        Cases._state.q = e.target.value; Cases._state.view = 'active'; Cases._state.status = 'all';
        Cases._saveState();
        App.navigate('cases');
        return;
      }
      document.querySelectorAll('[data-case-id]').forEach(r => {
        r.style.display = !q || r.getAttribute('data-search').includes(q) ? '' : 'none';
      });
    });

    document.querySelectorAll('[data-case-id]').forEach(el => {
      const id = el.getAttribute('data-case-id');
      const open = () => {
        const c = Storage.getCase(id);
        if (!c) { window.toast('No se encontró el caso', 'error'); return; }
        Cases.openCase(c, 'open');
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
      el.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = Storage.getCase(id);
        if (!c) return;
        const act = btn.getAttribute('data-act');
        Cases.openCase(c, act);
        if (act === 'delete') App.navigate('dashboard');
      }));
    });
  },

  _newCase() {
    Storage.setCurrentCase(null);
    App.navigate('case');
  },
};

window.Dashboard = Dashboard;

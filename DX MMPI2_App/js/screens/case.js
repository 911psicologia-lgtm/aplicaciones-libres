/* ============================================
   Case screen — datos del paciente
   ============================================ */

const Case = {
  render() {
    const cur = Storage.getCurrentCase() || {};
    const p = cur.patient || {};

    const today = new Date().toISOString().slice(0, 10);

    return `
      <div class="screen">
        <div class="topbar">
          <div class="topbar-title">MMPI-2 · ${cur.id ? 'Editar caso' : 'Nuevo caso'}</div>
          <div class="topbar-actions">
            <button class="btn btn-ghost btn-sm" id="case-back">‹ Volver</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Menú"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="screen-content" style="max-width:880px">

          <div class="card">
            <div class="card-header"><h3>Datos del paciente</h3></div>
            <div class="card-body">

              <div class="form-section">
                <div class="form-grid">
                  <div class="form-field full">
                    <label class="form-label">Nombre completo <span class="required">*</span></label>
                    <input type="text" id="p-name" class="form-input" value="${this._esc(p.name || '')}" placeholder="Nombre y apellidos">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Documento de identidad</label>
                    <input type="text" id="p-doc" class="form-input" value="${this._esc(p.document || '')}" placeholder="DNI / Pasaporte / CC">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Fecha de nacimiento</label>
                    <input type="date" id="p-dob" class="form-input" value="${this._esc(p.dob || '')}">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Edad (auto)</label>
                    <input type="text" id="p-age" class="form-input" value="${p.age != null ? p.age : ''}" readonly style="background:var(--color-bg)">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Sexo <span class="required">*</span></label>
                    <select id="p-sex" class="form-select" required>
                      <option value="">— seleccionar —</option>
                      <option value="M" ${p.sex === 'M' ? 'selected' : ''}>Mujer</option>
                      <option value="H" ${p.sex === 'H' ? 'selected' : ''}>Hombre</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Contexto de evaluación</label>
                    <select id="p-context" class="form-select">
                      <option value="Clínico" ${p.context === 'Clínico' ? 'selected' : ''}>Clínico</option>
                      <option value="Laboral" ${p.context === 'Laboral' ? 'selected' : ''}>Laboral</option>
                      <option value="Forense" ${p.context === 'Forense' ? 'selected' : ''}>Forense</option>
                      <option value="Otro" ${p.context === 'Otro' ? 'selected' : ''}>Otro</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Fecha de aplicación</label>
                    <input type="date" id="p-appdate" class="form-input" value="${this._esc(p.applicationDate || today)}">
                  </div>
                </div>
              </div>

              <div class="form-section">
                <div class="form-field full">
                  <label class="form-label">Antecedentes</label>
                  <textarea id="p-history" class="form-textarea" rows="4" placeholder="Historia clínica relevante, antecedentes familiares, médicos, psiquiátricos, tratamientos previos…">${this._esc(p.history || '')}</textarea>
                </div>
                <div class="form-field full">
                  <label class="form-label">Motivo de evaluación</label>
                  <textarea id="p-reason" class="form-textarea" rows="3" placeholder="Razón de la derivación, problema actual, objetivos de la evaluación…">${this._esc(p.reason || '')}</textarea>
                </div>
              </div>

            </div>
            <div class="card-footer flex justify-between items-center">
              <button class="btn btn-ghost" id="case-cancel">Cancelar</button>
              <button class="btn btn-primary" id="case-continue">Continuar a captura ›</button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  mount() {
    document.getElementById('ham-btn').addEventListener('click', () => App.openMenu());
    document.getElementById('case-back').addEventListener('click', () => App.navigate('dashboard'));
    document.getElementById('case-cancel').addEventListener('click', () => App.navigate('dashboard'));
    document.getElementById('case-continue').addEventListener('click', () => this._save());

    const dobEl = document.getElementById('p-dob');
    dobEl.addEventListener('change', () => this._recomputeAge());
    dobEl.addEventListener('input', () => this._recomputeAge());
  },

  _recomputeAge() {
    const dob = document.getElementById('p-dob').value;
    if (!dob) { document.getElementById('p-age').value = ''; return; }
    const d = new Date(dob);
    if (isNaN(d.getTime())) return;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    document.getElementById('p-age').value = age >= 0 ? age : '';
  },

  _save() {
    const name = document.getElementById('p-name').value.trim();
    const sex = document.getElementById('p-sex').value;
    if (!name) { window.toast('El nombre del paciente es obligatorio', 'error'); return; }
    if (!sex) { window.toast('Debe seleccionar el sexo del paciente (define el baremo)', 'error'); return; }

    let cur = Storage.getCurrentCase() || {};
    if (!cur.id) {
      cur.id = Storage.generateId();
      cur.createdAt = new Date().toISOString();
    }
    cur.updatedAt = new Date().toISOString();
    cur.patient = {
      name,
      document: document.getElementById('p-doc').value.trim(),
      dob: document.getElementById('p-dob').value,
      age: this._computeAge(document.getElementById('p-dob').value),
      sex,
      context: document.getElementById('p-context').value,
      applicationDate: document.getElementById('p-appdate').value,
      history: document.getElementById('p-history').value,
      reason: document.getElementById('p-reason').value,
    };

    Storage.saveCase(cur);
    Storage.setCurrentCase(cur);
    window.toast('Datos del paciente guardados', 'success');
    setTimeout(() => App.navigate('capture'), 300);
  },

  _computeAge(dob) {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age >= 0 ? age : null;
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Case = Case;

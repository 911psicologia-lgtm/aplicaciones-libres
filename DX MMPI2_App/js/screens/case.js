/* ============================================
   Case screen — datos del paciente
   ============================================ */

const Case = {
  render() {
    let cur = Storage.getCurrentCase() || {};
    // Caso nuevo: recuperar borrador autoguardado si existe
    this._restoredDraft = false;
    if (!cur.id) {
      const d = Storage.getDraft();
      if (d && d.patient && (d.patient.name || d.patient.history || d.patient.reason)) {
        cur = { patient: d.patient };
        this._restoredDraft = true;
      }
    }
    this._editing = !!cur.id;
    this._hasResults = !!cur.results;
    const p = cur.patient || {};

    const today = new Date().toISOString().slice(0, 10);

    return `
      <div class="screen">
        <div class="topbar">
          <div class="topbar-title">MMPI-2 · ${cur.id ? 'Editar caso' : 'Nuevo caso'}</div>
          <div class="topbar-actions">
            <button class="btn btn-ghost btn-sm" id="case-back">‹ Volver</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Abrir menú de navegación"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="screen-content" style="max-width:880px">
          ${this._restoredDraft ? `<div class="info-banner">Se recuperó un borrador sin terminar de este formulario. <button class="link-btn" id="case-discard-draft">Descartar borrador</button></div>` : ''}
          ${this._editing && this._hasResults ? `<div class="info-banner">Está editando un caso con informe. Al guardar, los resultados se recalculan automáticamente si cambia el sexo o el baremo; el resto de cambios se reflejan en el informe.</div>` : ''}

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
                    <label class="form-label">Baremo (país) <span class="required">*</span></label>
                    <select id="p-country" class="form-select">
                      <option value="MX" ${p.country === 'MX' ? 'selected' : ''}>México (Lucio, Reyes-Lagunes & Scott)</option>
                      <option value="US" ${p.country === 'US' || (p.country !== 'ES' && p.country !== 'MX') ? 'selected' : ''}>Estados Unidos (Minnesota N=2.600)</option>
                      <option value="ES" ${p.country === 'ES' ? 'selected' : ''}>España (TEA Ediciones, N=500)</option>
                    </select>
                    <span class="form-hint">El baremo EE.UU. es el utilizado en Argentina y México según Silin & Sanz</span>
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

              <div class="form-section">
                <div class="form-section-title">Contexto narrativo del caso</div>
                <div class="form-field full">
                  <label class="form-label">Historia del caso</label>
                  <textarea id="p-case-history" class="form-textarea" rows="5" placeholder="Narrativa detallada del caso: antecedentes biográficos, situación actual, eventos relevantes, demandas del entorno, observaciones del evaluador en entrevista…">${this._esc(p.caseHistory || '')}</textarea>
                  <span class="form-hint">Texto en párrafos. Se incorpora al prompt para IA externa para contextualizar el informe.</span>
                </div>
                <div class="form-field full">
                  <label class="form-label">Contexto pericial (opcional)</label>
                  <textarea id="p-legal-context" class="form-textarea" rows="3" placeholder="Si procede del ámbito forense: input del abogado, objeto del peritaje, preguntas periciales a responder…">${this._esc(p.legalContext || '')}</textarea>
                </div>
                <div class="form-field full">
                  <label class="form-label">MMPI-2 anterior (opcional)</label>
                  <textarea id="p-previous-mmpi" class="form-textarea" rows="3" placeholder="Pegue las puntuaciones T de una aplicación previa en formato «Escala=T», separadas por comas, p. ej.: Hs=78, D=55, Hy=68, Pd=66, Pa=65, Pt=52, Sc=50, Ma=42, Si=45">${this._esc(p.previousMMPI || '')}</textarea>
                  <span class="form-hint">Si existen resultados previos del MMPI-2, el informe generará un gráfico comparativo y una tabla de cambios (Δ). Para Mf respete el rótulo del informe anterior: <b>Mfv</b> (baremo de varones) o <b>Mfm</b> (baremo de mujeres). Si no corresponde al sexo del evaluado, la app lo convierte a un valor equivalente aproximado.</span>
                </div>
              </div>

            </div>
            <div class="card-footer flex justify-between items-center" style="flex-wrap:wrap;gap:8px">
              <div class="flex gap-8" style="flex-wrap:wrap">
                <button class="btn btn-ghost" id="case-cancel">Cancelar</button>
                <button class="btn btn-secondary btn-sm" id="case-download-template">⤓ Descargar Excel para respuestas</button>
                ${this._editing ? '<button class="btn btn-ghost btn-sm text-danger" id="case-delete">🗑 Eliminar caso</button>' : ''}
              </div>
              <div class="flex gap-8 items-center" style="flex-wrap:wrap">
                <span class="save-indicator" id="case-save-ind"></span>
                <button class="btn btn-primary" id="case-continue">${this._editing && this._hasResults ? 'Guardar cambios y ver informe ›' : (this._editing ? 'Guardar y continuar a captura ›' : 'Continuar a captura ›')}</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  mount() {
    bindEvent('ham-btn', 'click', () => App.openMenu());
    const back = () => App.navigate(this._editing && this._hasResults ? 'report' : 'dashboard');
    bindEvent('case-back', 'click', back);
    bindEvent('case-cancel', 'click', () => { if (!this._editing) Storage.clearDraft(); back(); });
    bindEvent('case-discard-draft', 'click', () => { Storage.clearDraft(); App.navigate('case'); });
    bindEvent('case-delete', 'click', async () => {
      const cur = Storage.getCurrentCase();
      if (!cur) return;
      const ok = await confirmDialog({ title: 'Eliminar caso', message: `«${cur.patient?.name || 'Caso'}» se moverá a la papelera. Podrá restaurarlo desde Casos › Papelera.`, okText: 'Mover a la papelera', danger: true });
      if (!ok) return;
      Cases.openCase(cur, 'delete');
      App.navigate('dashboard');
    });
    // Autoguardado del formulario: borrador (caso nuevo) o guardado del caso (edición)
    const fields = ['p-name','p-doc','p-dob','p-sex','p-country','p-context','p-appdate','p-history','p-reason','p-case-history','p-legal-context','p-previous-mmpi'];
    let t = null;
    const autosave = () => {
      clearTimeout(t);
      t = setTimeout(() => this._autosave(), 600);
    };
    fields.forEach(id => { const el = document.getElementById(id); if (el) { el.addEventListener('input', autosave); el.addEventListener('change', autosave); } });
    bindEvent('case-continue', 'click', () => this._save());
    bindEvent('case-download-template', 'click', () => this._downloadTemplate());

    const dobEl = document.getElementById('p-dob');
    if (dobEl) {
      dobEl.addEventListener('change', () => this._recomputeAge());
      dobEl.addEventListener('input', () => this._recomputeAge());
    }
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

  _collectPatient() {
    const v = (id) => (document.getElementById(id) || {}).value || '';
    return {
      name: v('p-name').trim(),
      document: v('p-doc').trim(),
      dob: v('p-dob'),
      age: this._computeAge(v('p-dob')),
      sex: v('p-sex'),
      country: v('p-country') || 'US',
      context: v('p-context'),
      applicationDate: v('p-appdate'),
      history: v('p-history'),
      reason: v('p-reason'),
      caseHistory: v('p-case-history'),
      legalContext: v('p-legal-context'),
      previousMMPI: v('p-previous-mmpi'),
    };
  },

  _autosave() {
    const ind = document.getElementById('case-save-ind');
    const patient = this._collectPatient();
    if (!this._editing) {
      Storage.saveDraft({ patient, at: new Date().toISOString() });
      if (ind) ind.textContent = 'Borrador guardado ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return;
    }
    // Edición: solo autoguardar campos de texto (no cambiar sexo/baremo sin recalcular)
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.id) return;
    if (!patient.name) return;
    const prev = cur.patient || {};
    if (patient.sex !== prev.sex || patient.country !== prev.country) {
      if (ind) ind.textContent = 'Pulse «Guardar» para recalcular con el nuevo sexo/baremo';
      return;
    }
    cur.patient = Object.assign({}, prev, patient);
    cur.updatedAt = new Date().toISOString();
    Storage.saveCase(cur);
    Storage.setCurrentCase(cur);
    if (ind) ind.textContent = '✓ Cambios guardados ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  },

  async _save() {
    const name = document.getElementById('p-name').value.trim();
    const sex = document.getElementById('p-sex').value;
    if (!name) { window.toast('El nombre del paciente es obligatorio', 'error'); return; }
    if (!sex) { window.toast('Debe seleccionar el sexo del paciente (define el baremo)', 'error'); return; }

    let cur = Storage.getCurrentCase() || {};
    const isNew = !cur.id;
    if (!cur.id) {
      cur.id = Storage.generateId();
      cur.createdAt = new Date().toISOString();
    }
    cur.updatedAt = new Date().toISOString();
    const prev = cur.patient || {};
    const patient = this._collectPatient();
    patient.name = name; patient.sex = sex;
    cur.patient = Object.assign({}, prev, patient);

    // Si el caso ya tiene resultados y cambió sexo o baremo → recalcular
    if (cur.results && Array.isArray(cur.responses) && (prev.sex !== patient.sex || prev.country !== patient.country)) {
      try {
        const results = await MMPI2.computeAll(cur.responses, patient.sex, patient.country);
        results._meta = Object.assign(results._meta || {}, { omissions: cur.responses.filter(r => r !== 1 && r !== 2).length });
        cur.results = results;
        window.toast('Resultados recalculados con el nuevo sexo/baremo', 'info');
      } catch (e) {
        window.toast(window.friendlyError(e, 'recalcular los resultados'), 'error', 7000);
        return;
      }
    }
    if (cur.results) {
      cur.narrative = MMPI2.buildNarrative(cur.results, patient.name, patient.age, patient.sex, patient.country);
    }

    Storage.saveCase(cur);
    Storage.setCurrentCase(cur);
    Storage.flush();
    if (isNew) Storage.clearDraft();
    window.toast(isNew ? 'Caso creado' : 'Cambios guardados', 'success');
    setTimeout(() => App.navigate(cur.results ? 'report' : 'capture'), 250);
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

  /* ---- Descargar plantilla Excel para captura de respuestas ---- */
  _downloadTemplate() {
    if (!window.XLSX) { window.toast('SheetJS no está cargado', 'error'); return; }
    try {
      // Recoger datos actuales del formulario (sin guardar el caso todavía)
      const name = (document.getElementById('p-name') || {}).value?.trim() || '';
      const doc = (document.getElementById('p-doc') || {}).value?.trim() || '';
      const dob = (document.getElementById('p-dob') || {}).value || '';
      const sexSel = (document.getElementById('p-sex') || {}).value || '';
      const appDate = (document.getElementById('p-appdate') || {}).value || (new Date().toISOString().slice(0, 10));
      const ev = Storage.getEvaluator() || {};

      const items = window.__ITEMS__ || [];
      const sexLabel = sexSel === 'M' ? 'Mujer' : (sexSel === 'H' ? 'Hombre' : '');

      // Construir filas: cabecera con datos del paciente + evaluador, luego tabla de ítems
      const aoa = [];
      aoa.push(['MMPI-2 · HOJA DE RESPUESTAS']);
      aoa.push(['Plantilla generada el', new Date().toLocaleString('es-ES')]);
      aoa.push([]);
      aoa.push(['DATOS DEL EVALUADO']);
      aoa.push(['Nombre', name || '']);
      aoa.push(['Documento', doc]);
      aoa.push(['Fecha de nacimiento', dob]);
      aoa.push(['Sexo', sexLabel]);
      aoa.push(['Fecha de aplicación', appDate]);
      aoa.push([]);
      aoa.push(['EVALUADOR']);
      aoa.push(['Nombre', ev.name || '']);
      aoa.push(['Tarjeta profesional', ev.license || '']);
      aoa.push(['Registro profesional', ev.registry || '']);
      aoa.push(['Correo', ev.email || '']);
      aoa.push([]);
      aoa.push(['INSTRUCCIONES: Marcar 1 = Verdadero (V), 2 = Falso (F). No dejar ítems en blanco.']);
      aoa.push(['Ítem', 'Enunciado', 'Respuesta (1=V, 2=F)']);
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        aoa.push([it.num || (i + 1), it.text || '', '']);
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = [{ wch: 8 }, { wch: 70 }, { wch: 22 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const safe = (name || 'paciente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]/g, '').trim().replace(/\s+/g, '_');
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `MMPI2_Plantilla_${safe}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      window.toast('Plantilla Excel descargada', 'success');
    } catch (e) {
      console.error('Error generando plantilla Excel:', e);
      window.toast('Error al generar la plantilla: ' + e.message, 'error');
    }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Case = Case;

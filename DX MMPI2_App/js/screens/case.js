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
                    <label class="form-label">Baremo (país) <span class="required">*</span></label>
                    <select id="p-country" class="form-select">
                      <option value="US" ${p.country !== 'ES' ? 'selected' : ''}>Estados Unidos (Minnesota N=2.600) — Recomendado para Latinoamérica</option>
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
                  <span class="form-hint">Si existen resultados previos del MMPI-2, el informe generará un gráfico comparativo y una tabla de cambios (Δ).</span>
                </div>
              </div>

            </div>
            <div class="card-footer flex justify-between items-center" style="flex-wrap:wrap;gap:8px">
              <div class="flex gap-8" style="flex-wrap:wrap">
                <button class="btn btn-ghost" id="case-cancel">Cancelar</button>
                <button class="btn btn-secondary btn-sm" id="case-download-template">⤓ Descargar Excel para respuestas</button>
              </div>
              <button class="btn btn-primary" id="case-continue">Continuar a captura ›</button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  mount() {
    bindEvent('ham-btn', 'click', () => App.openMenu());
    bindEvent('case-back', 'click', () => App.navigate('dashboard'));
    bindEvent('case-cancel', 'click', () => App.navigate('dashboard'));
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
      country: (document.getElementById('p-country') || {}).value || 'US',
      context: document.getElementById('p-context').value,
      applicationDate: document.getElementById('p-appdate').value,
      history: document.getElementById('p-history').value,
      reason: document.getElementById('p-reason').value,
      caseHistory: document.getElementById('p-case-history').value,
      legalContext: document.getElementById('p-legal-context').value,
      previousMMPI: document.getElementById('p-previous-mmpi').value,
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

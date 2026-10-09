/* ============================================
   Report screen — informe MMPI-2 (V4)
   Estructura (ReportModel):
     Identificación (cuadro único) → Información del caso (seleccionable)
     → Perfil de escalas (por grupo: tabla · interpretación · gráfica)
     → Análisis de resultados (misma dinámica)
     → Síntesis integradora (sin valores ni siglas)
     → Recomendaciones → Evaluador y firma
   Exportación: PDF nativo, Word, HTML, impresión, Excel, JSON
   + Análisis con IA externa (gráficas reparadas)
   ============================================ */

const Report = {
  _charts: [],      // Chart.js del informe principal
  _aiCharts: [],    // Chart.js del informe IA
  _aiChartSpecs: [],
  _aiChartSeq: 0,
  _mounted: false,
  _model: null,

  /* Códigos por grupo (usados por la hoja de perfil) */
  _BASIC_CODES:    ['L','F','K','Hs','D','Hy','Pd','Mf','Pa','Pt','Sc','Ma','Si'],
  _CONTENT_CODES:  ['ANX','FRS','OBS','DEP','HEA','BIZ','ANG','CYN','ASP','TPA','LSE','SOD','FAM','WRK','TRT'],
  _SUPP_CODES:     ['A','R','Es','MAC-R','AAS','APS','MDS','Ho','O-H','Do','Re','Mt','GM','GF','PK'],
  _SUB_CODES:      ['D1','D2','D3','D4','D5','Hy1','Hy2','Hy3','Hy4','Hy5','Pd1','Pd2','Pd3','Pd4','Pd5',
                    'Pa1','Pa2','Pa3','Sc1','Sc2','Sc3','Sc4','Sc5','Sc6','Ma1','Ma2','Ma3','Ma4','Si1','Si2','Si3'],

  render() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) {
      return `<div class="screen"><div class="screen-content"><div class="empty-state">
        <div class="empty-state-icon">⚠</div>
        <h2>Sin resultados</h2>
        <p>Este caso todavía no tiene resultados. Complete la captura de respuestas y pulse «Finalizar y procesar».</p>
        <button class="btn btn-primary" id="rpt-go-capture">Ir a la captura</button>
        <button class="btn btn-ghost" id="rpt-go-dash">Ir al panel</button>
      </div></div></div>`;
    }
    const p = cur.patient || {};
    const country = (p.country === 'ES' || p.country === 'US' || p.country === 'MX') ? p.country : 'US';
    const validity = Interpret.verdict(cur.results);
    const cov = Interpret.coverage(cur.results);
    this._needsUpgrade = !!(Array.isArray(cur.responses) && cur.responses.some(r => r === 1 || r === 2) && (!cur.results._meta || (cur.results._meta.engine || 1) < MMPI2.ENGINE_VERSION));

    return `
      <div class="screen">
        <div class="topbar no-print">
          <div class="topbar-title">MMPI-2 · Informe — ${this._esc(p.name || 'paciente')}</div>
          <div class="topbar-actions flex gap-8">
            <button class="btn btn-secondary btn-sm" id="rpt-edit" title="Editar datos del caso">✎ Datos</button>
            <button class="btn btn-secondary btn-sm" id="rpt-answers" title="Revisar o corregir respuestas">☑ Respuestas</button>
            <button class="btn btn-ghost btn-sm" id="rpt-back">‹ Panel</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Abrir menú de navegación"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="screen-content wide report-layout">

          ${this._renderValidityBanner(validity)}

          <div class="report-tools no-print">
            <div class="card">
              <div class="card-body tools-body">
                <div class="tools-row">
                  <span class="tools-label">Exportar informe</span>
                  <button class="btn btn-primary btn-sm" id="exp-pdf">⤓ PDF</button>
                  <button class="btn btn-secondary btn-sm" id="exp-word">⤓ Word</button>
                  <button class="btn btn-secondary btn-sm" id="exp-html">⤓ HTML</button>
                  <button class="btn btn-secondary btn-sm" id="exp-print">🖶 Imprimir</button>
                  <details class="more-exp">
                    <summary class="btn btn-ghost btn-sm">Más ▾</summary>
                    <div class="more-pop">
                      <button class="btn btn-ghost btn-sm" id="exp-excel">Datos en Excel</button>
                      <button class="btn btn-ghost btn-sm" id="exp-json">Caso en JSON</button>
                      <button class="btn btn-ghost btn-sm" id="exp-answer-sheet">Hoja de respuestas</button>
                      <button class="btn btn-ghost btn-sm" id="exp-profile-sheet">Hoja de perfil</button>
                    </div>
                  </details>
                </div>
                <div class="tools-row">
                  <label for="baremo-select" class="tools-label">Baremo</label>
                  <select id="baremo-select" class="form-select" style="width:auto;min-width:240px">
                    <option value="US" ${country === 'US' ? 'selected' : ''}>EE. UU. (Minnesota N = 2.600)</option>
                    <option value="MX" ${country === 'MX' ? 'selected' : ''}>México (Lucio et al.)</option>
                    <option value="ES" ${country === 'ES' ? 'selected' : ''}>España (TEA Ediciones)</option>
                  </select>
                  <span class="form-hint">Al cambiarlo se recalculan todas las puntuaciones T.</span>
                </div>
                <div class="coverage ${cov.missing.length ? 'warn' : 'ok'}" id="coverage">
                  <div class="coverage-bar"><div style="width:${Math.round(cov.documented / Math.max(1, cov.total) * 100)}%"></div></div>
                  <div>
                    <strong>Escalas con puntuación T documentada: ${cov.documented} de ${cov.total}</strong>
                    ${cov.missing.length
                      ? `<details><summary>Ver las ${cov.missing.length} escala(s) sin T y el motivo</summary><ul>${cov.missing.map(m => `<li><b>${this._esc(m.code)}</b>: ${this._esc(m.reason)}</li>`).join('')}</ul></details>`
                      : (cov.verify.length ? '' : '<span class="text-success"> · resultado completo ✓</span>')}
                    ${cov.verify.length
                      ? `<div class="verify-note">⚠ <b>${cov.verify.length} puntuación(es) T a verificar</b> (marcadas con * en el informe): ${cov.verify.map(v => `${this._esc(v.code)} (PD ${v.pd} → T ${v.t})`).join(', ')}. Caen en un tramo de la tabla del baremo con inconsistencias; confírmelas en el manual o en el sistema oficial de corrección.</div>`
                      : ''}
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><h3>Contenido del informe</h3><span class="form-hint">Marque lo que debe aparecer. Se guarda con el caso.</span></div>
              <div class="card-body" id="report-options">${this._optionsHTML(cur)}</div>
            </div>
          </div>

          <div id="report-doc-wrap">${this._docHTML(cur)}</div>

          ${this._aiAnalysisSection()}
        </div>
      </div>
    `;
  },

  _optionsHTML(cur) {
    const o = ReportModel.options(cur);
    const cat = ReportModel.optionCatalog(cur);
    return `<div class="opt-grid">${cat.map(g => `
      <fieldset class="opt-group"><legend>${this._esc(g.group)}</legend>
        ${g.items.map(it => `<label class="opt ${it.available ? '' : 'disabled'}" title="${it.available ? '' : 'Sin datos registrados en el caso'}">
          <input type="checkbox" data-opt="${it.key}" ${o[it.key] && it.available ? 'checked' : ''} ${it.available ? '' : 'disabled'}>
          <span>${this._esc(it.label)}${it.available ? '' : ' <em>(sin datos)</em>'}</span></label>`).join('')}
      </fieldset>`).join('')}
      <fieldset class="opt-group"><legend>Firma</legend>
        <label class="opt-text">Lugar de emisión
          <input type="text" class="form-input" id="opt-place" value="${this._esc(o.place || (Storage.getEvaluator() || {}).city || '')}" placeholder="Ciudad">
        </label>
      </fieldset>
    </div>`;
  },

  _docHTML(cur) {
    const ev = Storage.getEvaluator() || {};
    this._model = ReportModel.build(cur, ev);
    return ReportRender.toHTML(this._model);
  },

  _refreshDoc() {
    const cur = Storage.getCurrentCase();
    const wrap = document.getElementById('report-doc-wrap');
    if (!cur || !wrap) return;
    this._destroyCharts();
    wrap.innerHTML = this._docHTML(cur);
    this._charts = ReportRender.mountCharts(this._model, wrap);
  },

  mount() {
    if (!document.getElementById('report-doc-wrap')) {
      bindEvent('rpt-go-capture', 'click', () => App.navigate('capture'));
      bindEvent('rpt-go-dash', 'click', () => App.navigate('dashboard'));
      return;
    }
    this._mounted = true;
    if (this._needsUpgrade) { this._upgradeResults(); return; }
    bindEvent('ham-btn', 'click', () => App.openMenu());
    bindEvent('rpt-back', 'click', () => App.navigate('dashboard'));
    bindEvent('rpt-edit', 'click', () => App.navigate('case'));
    bindEvent('rpt-answers', 'click', () => App.navigate('capture', { editing: true }));

    bindEvent('exp-pdf', 'click', () => this._exportPDF());
    bindEvent('exp-word', 'click', () => this._exportWord());
    bindEvent('exp-html', 'click', () => this._exportHTML());
    bindEvent('exp-print', 'click', () => this._printOnly('main'));
    bindEvent('exp-excel', 'click', () => this._exportExcel());
    bindEvent('exp-json', 'click', () => this._exportJSON());
    bindEvent('exp-answer-sheet', 'click', () => this._downloadAnswerSheet());
    bindEvent('exp-profile-sheet', 'click', () => this._downloadProfileSheet());
    bindEvent('baremo-select', 'change', (e) => this._recalcCountry(e.target.value));

    // Opciones de contenido
    document.querySelectorAll('[data-opt]').forEach(cb => cb.addEventListener('change', () => {
      this._setOption(cb.getAttribute('data-opt'), cb.checked);
    }));
    let tPlace = null;
    bindEvent('opt-place', 'input', (e) => { clearTimeout(tPlace); tPlace = setTimeout(() => this._setOption('place', e.target.value), 500); });

    bindEvent('ai-copy-prompt', 'click', () => this._copyAIPrompt());
    bindEvent('ai-generate', 'click', () => this._generateAIReport());
    bindEvent('ai-clear', 'click', () => this._clearAIReport());

    // Restaurar informe IA si existe
    const cur2 = Storage.getCurrentCase();
    if (cur2 && cur2.aiReport) {
      const out = document.getElementById('ai-report-output');
      if (out) {
        try {
          out.innerHTML = this._renderAIReport(cur2.aiReport);
          this._renderAICharts();
        } catch (e) { console.warn('No se pudo restaurar el informe IA:', e); }
        this._bindAIExportButtons();
      }
    }

    this._charts = ReportRender.mountCharts(this._model, document.getElementById('report-doc-wrap'));
  },

  /* Recalcular casos guardados con una versión anterior del motor
     (V4.1: clave femenina de Mf y detección de tramos dañados del baremo) */
  async _upgradeResults() {
    const cur = Storage.getCurrentCase();
    if (!cur) return;
    try {
      const country = (cur.patient.country === 'ES' || cur.patient.country === 'MX') ? cur.patient.country : 'US';
      const oldMf = cur.results && cur.results.Mf ? cur.results.Mf.t : null;
      const results = await MMPI2.computeAll(cur.responses, cur.patient.sex, country);
      results._meta = Object.assign(results._meta || {}, { omissions: cur.responses.filter(r => r !== 1 && r !== 2).length });
      cur.results = results;
      cur.narrative = MMPI2.buildNarrative(results, cur.patient.name, cur.patient.age, cur.patient.sex, country);
      cur.updatedAt = new Date().toISOString();
      Storage.saveCase(cur); Storage.setCurrentCase(cur); Storage.flush();
      const newMf = results.Mf ? results.Mf.t : null;
      let msg = 'Resultados actualizados con la versión corregida del motor de puntuación.';
      if (oldMf !== newMf) msg += ` Mf: ${oldMf ?? '—'} → ${newMf ?? '—'}.`;
      if (cur.aiReport) msg += ' El informe con IA de este caso se generó con los valores anteriores: conviene regenerarlo.';
      window.toast(msg, 'info', 9000);
    } catch (e) {
      window.toast(window.friendlyError(e, 'actualizar los resultados del caso'), 'error', 8000);
      return;
    }
    App.navigate('report');
  },

  _setOption(key, value) {
    const cur = Storage.getCurrentCase();
    if (!cur) return;
    cur.reportOptions = Object.assign(ReportModel.options(cur), { [key]: value });
    cur.updatedAt = new Date().toISOString();
    Storage.saveCase(cur);
    Storage.setCurrentCase(cur);
    this._refreshDoc();
  },

  unmount() {
    this._destroyCharts();
    this._destroyAICharts();
    this._mounted = false;
    if (window.Storage && typeof Storage.flush === 'function') Storage.flush();
  },

  _destroyCharts() {
    for (const c of this._charts) { try { c.destroy(); } catch (e) {} }
    this._charts = [];
  },

  /* ---------- Impresión (solo informe principal o solo informe IA) ---------- */
  _printOnly(which) {
    document.body.classList.add(which === 'ai' ? 'print-ai' : 'print-main');
    const cleanup = () => { document.body.classList.remove('print-ai', 'print-main'); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => { window.print(); setTimeout(cleanup, 1500); }, 50);
  },

  /* ---------- Validity banner ---------- */
  _renderValidityBanner(validity) {
    if (!validity || validity.status === 'INTERPRETABLE') return '';
    const isNo = (validity.status === 'NO_INTERPRETABLE');
    const color = isNo ? 'var(--color-danger)' : 'var(--color-warning)';
    const bg = isNo ? 'rgba(192, 0, 0, 0.08)' : 'rgba(191, 143, 0, 0.08)';
    const title = isNo ? 'Protocolo NO interpretable' : 'Protocolo interpretable con cautela';
    const reasons = (validity.reasons || []).map(r => `<li>${this._esc(r)}</li>`).join('');
    return `<div class="card no-print" style="border:2px solid ${color};background:${bg}">
      <div class="card-body">
        <div style="font-weight:700;color:${color};font-size:14px;margin-bottom:6px">⚠ ${this._esc(title)}</div>
        <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.6;color:var(--color-text)">${reasons}</ul>
      </div>
    </div>`;
  },

  /* ---------- Exportaciones del informe principal ---------- */
  _busy(on) {
    ['exp-pdf', 'exp-word', 'exp-html'].forEach(id => { const b = document.getElementById(id); if (b) b.disabled = !!on; });
  },

  _buildForExport() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) throw new Error('No hay resultados para exportar');
    Storage.flush();
    const model = ReportModel.build(cur, Storage.getEvaluator() || {});
    const images = ReportModel.chartImages(model);
    return { cur, model, images, base: `Informe_MMPI2_${this._safeName(cur.patient && cur.patient.name)}` };
  },

  async _exportPDF() {
    this._busy(true);
    window.toast('Generando PDF…', 'info', 2000);
    try {
      await new Promise(r => setTimeout(r, 30));
      const { model, images, base } = this._buildForExport();
      const blob = await ReportRender.toPDF(model, images);
      window.Export._download(blob, base + '.pdf');
      window.toast('Informe PDF descargado', 'success');
    } catch (e) { console.error(e); window.toast(window.friendlyError(e, 'generar el PDF'), 'error', 8000); }
    finally { this._busy(false); }
  },

  async _exportWord() {
    this._busy(true);
    window.toast('Generando Word…', 'info', 2000);
    try {
      await new Promise(r => setTimeout(r, 30));
      const { model, images, base } = this._buildForExport();
      const blob = await ReportRender.toDocx(model, images);
      window.Export._download(blob, base + '.docx');
      window.toast('Informe Word descargado', 'success');
    } catch (e) { console.error(e); window.toast(window.friendlyError(e, 'generar el documento Word'), 'error', 8000); }
    finally { this._busy(false); }
  },

  _exportHTML() {
    try {
      const { model, images, base } = this._buildForExport();
      const html = ReportRender.toStandaloneHTML(model, images);
      window.Export._download(new Blob([html], { type: 'text/html;charset=utf-8' }), base + '.html');
      window.toast('Informe HTML descargado', 'success');
    } catch (e) { console.error(e); window.toast(window.friendlyError(e, 'generar el HTML'), 'error', 8000); }
  },

  _exportExcel() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) { window.toast('No hay resultados para exportar', 'error'); return; }
    try { window.Export.exportExcel(cur, Storage.getEvaluator() || {}); window.toast('Datos en Excel descargados', 'success'); }
    catch (e) { window.toast(window.friendlyError(e, 'generar el Excel'), 'error', 8000); }
  },

  _exportJSON() {
    const cur = Storage.getCurrentCase();
    if (!cur) return;
    try {
      const data = Storage.exportCase(cur.id);
      window.Export.exportJSON(data, `MMPI2_caso_${this._safeName(cur.patient && cur.patient.name)}.json`);
      window.toast('Caso JSON descargado', 'success');
    } catch (e) { window.toast(window.friendlyError(e, 'exportar el caso'), 'error'); }
  },

  /* ---------- Baremo: recalcular T al cambiar país ---------- */
  async _recalcCountry(newCountry) {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.responses || !cur.patient) { window.toast('No hay caso activo para recalcular', 'error'); return; }
    const country = (newCountry === 'ES' || newCountry === 'MX') ? newCountry : 'US';
    const label = { US: 'EE. UU. (Minnesota)', MX: 'México', ES: 'España (TEA)' }[country];
    try {
      const results = await MMPI2.computeAll(cur.responses, cur.patient.sex, country);
      results._meta = Object.assign(results._meta || {}, { omissions: cur.responses.filter(r => r !== 1 && r !== 2).length });
      cur.results = results;
      cur.narrative = MMPI2.buildNarrative(results, cur.patient.name, cur.patient.age, cur.patient.sex, country);
      cur.patient.country = country;
      cur.updatedAt = new Date().toISOString();
      Storage.saveCase(cur);
      Storage.setCurrentCase(cur);
      Storage.flush();
      window.toast(`Baremo cambiado a ${label}. Resultados recalculados.`, 'success');
      App.navigate('report');
    } catch (e) {
      console.error('Error al recalcular baremo:', e);
      window.toast(window.friendlyError(e, 'recalcular con el nuevo baremo'), 'error', 8000);
    }
  },

  _AI_QUICK_LINKS: [
    { label: 'Z.AI',            url: 'https://chat.z.ai',                icon: '◆' },
    { label: 'ChatGPT',         url: 'https://chat.openai.com',          icon: '✦' },
    { label: 'Google Gemini',   url: 'https://gemini.google.com',        icon: '✧' },
    { label: 'Claude',          url: 'https://claude.ai',                icon: '◉' },
    { label: 'Microsoft Copilot', url: 'https://copilot.microsoft.com',  icon: '✺' },
    { label: 'DeepSeek',        url: 'https://chat.deepseek.com',        icon: '◈' },
    { label: 'Perplexity',      url: 'https://www.perplexity.ai',        icon: '⌖' },
  ],

  _aiAnalysisSection() {
    const quickBtns = this._AI_QUICK_LINKS.map(ai =>
      `<a href="${this._esc(ai.url)}" target="_blank" rel="noopener noreferrer"
            class="btn btn-secondary btn-sm" style="justify-content:flex-start;min-width:140px;text-decoration:none">
          <span style="font-size:14px;margin-right:4px">${ai.icon}</span>
          <span>${this._esc(ai.label)}</span>
       </a>`
    ).join('');

    return `
      <div class="card no-print ai-section" style="border:2px solid var(--color-success)">
        <div class="card-header" style="background:var(--color-success);color:#fff">
          <h3 style="color:#fff">✦ Análisis con IA externa</h3>
        </div>
        <div class="card-body">
          <p style="font-size:13px;line-height:1.55;color:var(--color-text);margin-bottom:16px">
            Genere un <strong>informe contextualizado profesional</strong> (estilo informe pericial de ~11 páginas)
            usando una IA externa. Copie el prompt completo (incluye todos los datos del caso, las 79 escalas del
            MMPI-2 y la síntesis interpretativa), péguelo en una IA, recupere el JSON resultante y péguelo abajo.
          </p>

          <button class="btn btn-success btn-lg w-full" id="ai-copy-prompt"
                  style="font-size:15px;padding:14px 20px;margin-bottom:6px">
            ⧉ Copiar Prompt
          </button>
          <div style="font-size:12px;color:var(--color-text-muted);text-align:center;margin-bottom:18px">
            El prompt no se muestra; se copia al portapapeles.
          </div>

          <div style="margin-bottom:18px">
            <div style="font-size:12px;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">
              Acceso rápido a IAs
            </div>
            <div class="flex" style="flex-wrap:wrap;gap:8px">
              ${quickBtns}
            </div>
          </div>

          <div style="margin-bottom:12px">
            <label class="form-label" for="ai-json-input" style="display:block;margin-bottom:6px">
              Pegue aquí el JSON devuelto por la IA
            </label>
            <textarea id="ai-json-input" class="form-textarea" rows="10"
              style="font-family:'Courier New',monospace;font-size:12px;line-height:1.45"
              placeholder='{"titulo":"INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2","metadatos":{...},"secciones":[{"numero":1,"titulo":"Encabezado institucional","bloques":[{"tipo":"parrafo","contenido":"..."}]}], "referencias":["..."], "firma":{...}}'></textarea>
          </div>

          <div class="flex" style="gap:8px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-primary" id="ai-generate">✓ Generar informe contextualizado</button>
            <button class="btn btn-ghost btn-sm" id="ai-clear">Limpiar</button>
            <span style="font-size:12px;color:var(--color-text-muted);margin-left:auto">
              La IA no almacena ni transmite datos desde esta app; el prompt se procesa localmente.
            </span>
          </div>
        </div>
      </div>

      <!-- Rendered AI report (printable) -->
      <div id="ai-report-output" class="ai-report-container"></div>
    `;
  },

  _copyAIPrompt() {
    const cur = Storage.getCurrentCase();
    if (!cur) { window.toast('No hay caso activo', 'error'); return; }
    if (!cur.results) { window.toast('El caso no tiene resultados procesados', 'error'); return; }
    if (!window.AIPrompt || typeof AIPrompt.build !== 'function') {
      window.toast('Módulo de prompt IA no disponible', 'error');
      return;
    }
    const ev = Storage.getEvaluator() || {};
    // El prompt se desidentifica por defecto. Si se quiere incluir datos
    // personales, hay que confirmar explícitamente (política de privacidad).
    const proceed = (desidentify) => {
      let prompt;
      try {
        prompt = AIPrompt.build(cur, ev, { desidentify });
      } catch (e) {
        console.error('AIPrompt.build error:', e);
        window.toast('Error al construir el prompt: ' + e.message, 'error');
        return;
      }
      const done = () => {
        const mode = desidentify ? ' (desidentificado)' : ' (CON DATOS PERSONALES)';
        window.toast('Prompt copiado' + mode + '. Pégalo en una IA externa, recupera el JSON y pégalo aquí.', 'success', 7000);
      };
      const fail = () => { window.toast('No se pudo copiar al portapapeles. Intenta de nuevo.', 'error'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prompt).then(done).catch(() => this._fallbackCopy(prompt, done, fail));
      } else {
        this._fallbackCopy(prompt, done, fail);
      }
    };
    // Diálogo de confirmación si el usuario quiere incluir datos personales
    const askIncludePII = () => {
      const html = `
        <div style="padding:20px;max-width:420px">
          <h3 style="color:var(--color-primary-dark);font-size:16px;margin-bottom:10px">Opciones del prompt IA</h3>
          <p style="font-size:13px;line-height:1.5;margin-bottom:14px">
            El prompt puede contener información clínica y datos personales. Al pegarlo en un servicio externo,
            esos datos serán transmitidos al proveedor seleccionado. Revise consentimiento, autorización y
            políticas aplicables antes de continuar.
          </p>
          <div style="background:var(--color-bg);padding:10px 12px;border-radius:6px;font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
            <strong>Recomendado:</strong> Desidentificar (sustituye nombre, documento, fecha de nacimiento,
            correo, teléfono y dirección por marcadores [N/D]). El contexto clínico se conserva.
          </div>
          <div class="flex gap-8" style="justify-content:flex-end">
            <button class="btn btn-primary btn-sm" id="pii-desidentify">Desidentificar (recomendado)</button>
            <button class="btn btn-danger btn-sm" id="pii-include">Incluir datos personales</button>
          </div>
        </div>`;
      const content = document.getElementById('modal-content');
      content.innerHTML = `<div class="modal-header"><h3>Prompt IA · Privacidad</h3><button class="btn btn-ghost btn-sm" id="pii-x">✕</button></div><div class="modal-body">${html}</div>`;
      document.getElementById('modal-overlay').classList.remove('hidden');
      bindEvent('pii-x', 'click', () => App.hideModal());
      bindEvent('pii-desidentify', 'click', () => { App.hideModal(); proceed(true); });
      bindEvent('pii-include', 'click', () => {
        if (confirm('Está a punto de incluir DATOS PERSONALES del evaluado (nombre, documento, contacto) en el prompt. ¿Confirma que cuenta con consentimiento y autorización explícitos?')) {
          App.hideModal();
          proceed(false);
        }
      });
    };
    askIncludePII();
  },

  _fallbackCopy(text, onDone, onFail) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) onDone(); else onFail();
    } catch (e) {
      onFail();
    }
  },

  _generateAIReport() {
    const ta = document.getElementById('ai-json-input');
    if (!ta) { window.toast('No se encuentra el campo de entrada JSON', 'error'); return; }
    const raw = (ta.value || '').trim();
    if (!raw) {
      window.toast('Pegue primero el JSON devuelto por la IA', 'warning');
      return;
    }

    // Extraer el primer objeto JSON de la respuesta (por si la IA envolvió en ```json ... ```)
    const res = window.JSONRepair ? JSONRepair.parse(raw) : (() => { try { return { ok: true, data: JSON.parse(this._extractJSON(raw)), fixes: [] }; } catch (e) { return { ok: false, fixes: [], error: { message: e.message } }; } })();
    this._showJSONStatus(res);
    if (!res.ok) return;
    const parsed = res.data;
    if (res.fixes.length) {
      // Dejar en el cuadro la versión corregida para que quede guardada así
      try { ta.value = JSON.stringify(parsed, null, 2); } catch (e) {}
    }

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.secciones)) {
      window.toast('El JSON no tiene la estructura esperada (falta el arreglo "secciones" con "bloques")', 'error');
      return;
    }
    if (parsed.secciones.length === 0) {
      window.toast('El JSON no contiene secciones', 'error');
      return;
    }
    // Detectar si al menos una sección trae `bloques` (nuevo formato AI-PROMPT-V2)
    // o si todas vienen con `contenido` (formato legacy).
    const hasBloques = parsed.secciones.some(s => Array.isArray(s.bloques) && s.bloques.length);
    if (!hasBloques && !parsed.secciones.some(s => typeof s.contenido === 'string')) {
      window.toast('El JSON no contiene "bloques" ni "contenido" en sus secciones', 'error');
      return;
    }

    const out = document.getElementById('ai-report-output');
    if (!out) { window.toast('No se encuentra el contenedor del informe', 'error'); return; }
    out.innerHTML = this._renderAIReport(parsed);
    // Render Chart.js charts after DOM insertion (AI-PROMPT-V2 — bloques tipo `grafico`)
    this._renderAICharts();
    // Bind AI export buttons (created dynamically after render)
    this._bindAIExportButtons();

    // Persist on the case so it survives navigation
    const cur = Storage.getCurrentCase();
    if (cur) {
      cur.aiReport = parsed;
      cur.updatedAt = new Date().toISOString();
      Storage.saveCase(cur);
      Storage.setCurrentCase(cur);
    }

    window.toast('Informe contextualizado generado', 'success');
    // Scroll suave al informe generado
    setTimeout(() => out.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  },

  _showJSONStatus(res) {
    let box = document.getElementById('ai-json-status');
    const ta = document.getElementById('ai-json-input');
    if (!box && ta) { box = document.createElement('div'); box.id = 'ai-json-status'; ta.parentNode.appendChild(box); }
    if (!box) return;
    if (res.ok && !res.fixes.length) { box.className = 'json-status ok'; box.textContent = '✓ JSON válido.'; return; }
    if (res.ok) {
      box.className = 'json-status fixed';
      box.textContent = '✓ JSON leído tras corregir automáticamente: ' + res.fixes.join('; ') + '.';
      window.toast('El JSON tenía errores menores y se corrigió automáticamente.', 'info', 6000);
      return;
    }
    const e = res.error || {};
    box.className = 'json-status bad';
    box.innerHTML = `<b>✗ No se pudo leer el JSON${e.line ? ` (línea ${e.line}, columna ${e.col})` : ''}.</b>
      ${e.hint ? `<div>${this._esc(e.hint)}</div>` : ''}
      ${res.fixes.length ? `<div class="form-hint">Se intentó corregir: ${this._esc(res.fixes.join('; '))}.</div>` : ''}
      ${e.snippet ? `<pre>${this._esc(e.snippet)}</pre>` : ''}
      <div class="form-hint">Detalle técnico: ${this._esc(e.message || '')}</div>`;
    window.toast('El JSON de la IA no es válido. Revise el detalle bajo el cuadro.', 'error', 7000);
  },

  _clearAIReport() {
    const ta = document.getElementById('ai-json-input');
    if (ta) ta.value = '';
    // Destruir gráficos IA antes de limpiar el contenedor (AI-PROMPT-V2)
    this._destroyAICharts();
    const out = document.getElementById('ai-report-output');
    if (out) out.innerHTML = '';
    const cur = Storage.getCurrentCase();
    if (cur && cur.aiReport) {
      delete cur.aiReport;
      cur.updatedAt = new Date().toISOString();
      Storage.saveCase(cur);
      Storage.setCurrentCase(cur);
    }
    window.toast('Informe IA limpio', 'info');
  },

  /* ---------- Bind AI export buttons (after _renderAIReport) ---------- */
  _bindAIExportButtons() {
    bindEvent('ai-exp-html', 'click', () => this._exportAIReport('html'));
    bindEvent('ai-exp-word', 'click', () => this._exportAIReport('word'));
    bindEvent('ai-exp-excel', 'click', () => this._exportAIReport('excel'));
    bindEvent('ai-exp-json', 'click', () => this._exportAIReport('json'));
    bindEvent('ai-exp-pdf', 'click', () => this._exportAIReport('pdf'));
    bindEvent('ai-print', 'click', () => this._printOnly('ai'));
  },

  async _exportAIReport(format) {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.aiReport) { window.toast('No hay informe IA generado para exportar', 'warning'); return; }
    const ev = Storage.getEvaluator() || {};
    try {
      // Imágenes generadas fuera de pantalla (no dependen de lo visible)
      const chartImages = this._captureAIChartImgs(cur.aiReport);
      if (format === 'html') { window.Export.exportAIReportHTML(cur.aiReport, cur, ev, chartImages); window.toast('Informe IA · HTML descargado', 'success'); }
      else if (format === 'word') {
        window.toast('Generando Word…', 'info', 2000);
        await window.Export.exportAIReportWord(cur.aiReport, cur, ev, chartImages);
        window.toast('Informe IA · Word descargado', 'success');
      } else if (format === 'pdf') {
        window.toast('Generando PDF…', 'info', 2000);
        await window.Export.exportAIReportPDF(cur.aiReport, cur, ev, chartImages);
        window.toast('Informe IA · PDF descargado', 'success');
      } else if (format === 'excel') { window.Export.exportAIReportExcel(cur.aiReport, cur, ev); window.toast('Informe IA · Excel descargado', 'success'); }
      else if (format === 'json') { window.Export.exportAIReportJSON(cur.aiReport, cur); window.toast('Informe IA · JSON descargado', 'success'); }
    } catch (e) {
      console.error('Error exportando informe IA:', e);
      window.toast(window.friendlyError(e, 'exportar el informe IA'), 'error', 8000);
    }
  },

  /* ---------- Imágenes de los gráficos IA (offscreen) ----------
     Devuelve [{key, figura, titulo, dataURL, width, height}] */
  _captureAIChartImgs(parsed) {
    const out = [];
    const blocks = [];
    for (const sec of (parsed.secciones || [])) for (const b of (sec.bloques || [])) if (b && (b.tipo || '').toLowerCase() === 'grafico') blocks.push(b);
    blocks.forEach((b, i) => {
      try {
        const spec = this._aiBlockToSpec(b);
        if (!spec) return;
        const img = window.ReportCharts.toImage(spec, 900);
        out.push({ key: 'ai-graf-' + (i + 1), figura: b.figura != null ? b.figura : (i + 1), titulo: b.titulo || '', dataURL: img.dataURL, width: img.width, height: img.height });
      } catch (e) { console.warn('No se pudo generar imagen del gráfico IA', e); }
    });
    return out;
  },

  /* Convierte un bloque `grafico` de la IA en un spec de ReportCharts.
     Si la IA no aportó datos utilizables, se construye con los resultados reales del caso. */
  _aiBlockToSpec(block) {
    const tipo = (block.grafico_tipo || 'linea').toLowerCase();
    const series = Array.isArray(block.series) ? block.series : [];
    const labels = [];
    const getX = (pt) => pt && (pt.x != null ? pt.x : (pt.escala != null ? pt.escala : (pt.label != null ? pt.label : pt.nombre)));
    const getY = (pt) => { const v = pt && (pt.y != null ? pt.y : (pt.t != null ? pt.t : (pt.T != null ? pt.T : pt.valor))); const n = typeof v === 'number' ? v : parseFloat(v); return isFinite(n) ? n : null; };
    for (const s of series) for (const pt of (s.puntos || s.datos || [])) { const x = getX(pt); if (x != null && labels.indexOf(String(x)) === -1) labels.push(String(x)); }
    let data = series.map(s => ({ name: s.nombre || 'T', data: labels.map(l => { const pt = (s.puntos || s.datos || []).find(p => String(getX(p)) === l); return pt ? getY(pt) : null; }) }));
    const usable = labels.length > 0 && data.some(d => d.data.some(v => v != null));
    const cur = Storage.getCurrentCase() || {};
    const R = cur.results || {};
    const I = window.Interpret;
    if (!usable) {
      // Fallback con datos reales según número de figura
      const f = Number(block.figura);
      let codes;
      if (f === 1) codes = ['L', 'F', 'K', 'Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'];
      else if (f === 2) codes = ['Fb', 'Fp', 'S', 'A', 'R', 'Es', 'MAC-R', 'AAS', 'APS', 'MDS', 'Ho', 'O-H', 'Do', 'Re', 'Mt', 'GM', 'GF', 'PK'];
      else if (f === 3) codes = I.GROUP_ORDER.Subescalas.filter(c => (I.T(R, c) || 0) >= 56).sort((a, b) => I.T(R, b) - I.T(R, a));
      else if (f === 4 && cur.patient && cur.patient.previousMMPI) {
        const rows = I.comparisonRows(R, cur.patient.previousMMPI, cur.patient);
        return { kind: 'compare', labels: rows.map(r => r.code), series: [{ name: 'T actual', data: rows.map(r => r.cur) }, { name: 'T anterior', data: rows.map(r => r.prev) }], refs: [65], yMin: 30 };
      } else codes = ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'];
      codes = codes.filter(c => I.T(R, c) != null);
      if (!codes.length) return null;
      return { kind: tipo === 'barras_h' ? 'barh' : 'profile', labels: codes, series: [{ name: 'T', data: codes.map(c => I.T(R, c)) }], refs: [50, 65], yMin: 30 };
    }
    const refs = (Array.isArray(block.lineas_referencia) ? block.lineas_referencia : [50, 65]).map(Number).filter(isFinite);
    if (tipo === 'barras_h') return { kind: 'barh', labels, series: [data[0]], refs };
    if (tipo === 'barras_agrupadas' || data.length > 1) return { kind: 'compare', labels, series: data.slice(0, 2), refs, yMin: 30 };
    return { kind: 'profile', labels, series: [data[0]], refs, yMin: 30 };
  },

  _extractJSON(text) {
    let s = text.trim();
    // Quitar fences markdown ```json ... ``` o ``` ... ```
    if (s.startsWith('```')) {
      s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    // Si hay texto antes del primer { o después del último }, recortar
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start >= 0 && end > start) {
      s = s.substring(start, end + 1);
    }
    return s;
  },

  _renderAIReport(parsed) {
    // Reiniciar specs de gráficos IA pendientes (se renderizan tras insertar HTML)
    this._aiChartSeq = 0;
    this._aiChartSpecs = [];

    const titulo = parsed.titulo || 'INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2';
    const meta = parsed.metadatos || {};
    const cur = Storage.getCurrentCase() || {};
    const p = cur.patient || {};
    const ev = Storage.getEvaluator() || {};
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    // Metadatos: prioriza parsed.metadatos, con fallback a datos del paciente del caso
    const metaNombre      = meta.evaluado        || p.name || '—';
    const metaDocumento   = meta.documento       || p.document || '—';
    const metaEdad        = meta.edad            || (p.age != null ? p.age + ' años' : '—');
    const metaSexo        = meta.sexo            || (p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Varón' : '—'));
    const metaFechaApp    = meta.fecha_aplicacion|| this._fmtDate(p.applicationDate) || '—';
    const metaFechaInf    = meta.fecha_informe   || today;
    const metaContexto    = meta.contexto        || p.context || '—';
    const metaEvaluador   = meta.evaluador       || ev.name || '—';

    // Render de cada sección: si trae `bloques` (AI-PROMPT-V2) los itera; si trae
    // `contenido` (formato legacy) lo degrada a un bloque parrafo.
    const sectionsHTML = (parsed.secciones || []).map((sec, idx) => {
      const secNumero = (sec.numero != null) ? sec.numero : (idx + 1);
      const secTitulo = sec.titulo || ('Sección ' + secNumero);
      let bodyHTML = '';
      if (Array.isArray(sec.bloques) && sec.bloques.length) {
        bodyHTML = sec.bloques.map(b => this._renderAIBlock(b, secNumero)).join('');
      } else if (typeof sec.contenido === 'string' && sec.contenido.trim()) {
        bodyHTML = this._renderAIBlock({ tipo: 'parrafo', contenido: sec.contenido }, secNumero);
      } else {
        bodyHTML = '<p style="color:#9CA3AF;font-style:italic">[Sección sin contenido]</p>';
      }
      return `
        <section class="ai-report-section">
          <h2 class="ai-report-section-title">
            <span class="ai-sec-num">${this._esc(String(secNumero))}.</span> ${this._esc(secTitulo)}
          </h2>
          <div class="ai-report-section-body">${bodyHTML}</div>
        </section>
      `;
    }).join('');

    // Referencias (clave raíz opcional: array de strings)
    const refsHTML = (parsed.referencias && Array.isArray(parsed.referencias) && parsed.referencias.length)
      ? `<section class="ai-report-section">
          <h2 class="ai-report-section-title"><span class="ai-sec-num">·</span> Referencias</h2>
          <div class="ai-report-section-body">
            <ol class="ai-referencias">
              ${parsed.referencias.map(r => `<li>${this._esc(typeof r === 'string' ? r : JSON.stringify(r))}</li>`).join('')}
            </ol>
          </div>
        </section>`
      : '';

    // Firma (clave raíz opcional: objeto con datos del evaluador)
    const firma = parsed.firma;
    const firmaHTML = (firma && typeof firma === 'object')
      ? this._renderAIFirma(firma)
      : `<div class="ai-report-firma">
          ${ev.signature ? `<img src="${ev.signature}" alt="firma" class="signature-img">` : ''}
          <div class="signature-line">
            ${this._esc(ev.name || 'Evaluador/a')}
            <div style="font-size:10px;color:#6B7280;margin-top:2px">
              ${this._esc(ev.license || '')}${ev.license && ev.registry ? ' · ' : ''}${this._esc(ev.registry || '')}
            </div>
          </div>
        </div>`;

    return `
      <style>
        .ai-report-container { margin-top: 24px; }
        .ai-report-doc {
          background: #FFFFFF;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 48px 56px;
          font-family: Georgia, 'Times New Roman', serif;
          color: #1F2937;
          font-size: 14px;
          line-height: 1.65;
          box-shadow: var(--shadow-md);
        }
        .ai-report-header {
          text-align: center;
          border-bottom: 3px double var(--color-primary-dark);
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .ai-report-header h1 {
          font-size: 22px;
          font-weight: 700;
          color: var(--color-primary-dark);
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-family: Georgia, serif;
        }
        .ai-report-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 24px;
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #4B5563;
          margin-top: 10px;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .ai-report-meta div span { color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; font-size: 9px; display: block; }
        .ai-report-section { margin-bottom: 22px; page-break-inside: avoid; }
        .ai-report-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-primary-dark);
          border-left: 4px solid var(--color-primary);
          padding-left: 10px;
          margin-bottom: 10px;
          font-family: Georgia, serif;
        }
        .ai-report-section-title .ai-sec-num { color: var(--color-primary); margin-right: 4px; }
        .ai-report-section-body { padding-left: 14px; font-family: Georgia, serif; }
        .ai-report-section-body p { text-align: justify; margin: 0 0 10px; line-height: 1.6; }
        .ai-report-section-body p:last-child { margin-bottom: 0; }
        .ai-tabla-wrap { margin: 8px 0 14px; page-break-inside: avoid; }
        .ai-tabla-titulo { font-size: 12px; font-weight: 700; color: var(--color-primary-dark); margin-bottom: 4px; font-family: Arial, sans-serif; }
        .ai-tabla { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
        .ai-tabla thead th { background: var(--color-primary-dark, #1F3864); color: #fff; padding: 6px 8px; text-align: left; border: 1px solid #1F3864; }
        .ai-tabla tbody td { padding: 5px 8px; border: 1px solid #D1D5DB; vertical-align: top; }
        .ai-tabla tbody tr:nth-child(even) td { background: #F9FAFB; }
        .ai-grafico-wrap { margin: 10px 0 16px; page-break-inside: avoid; }
        .ai-grafico-figura { font-size: 11px; font-weight: 700; color: var(--color-primary-dark); font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }
        .ai-grafico-titulo { font-size: 12px; font-weight: 600; color: #1F2937; margin-bottom: 6px; font-family: Arial, sans-serif; }
        .ai-grafico-canvas-wrap { width: 100%; height: 380px; }
        .ai-lista-wrap { margin: 6px 0 12px; }
        .ai-lista-titulo { font-size: 12px; font-weight: 700; color: var(--color-primary-dark); margin-bottom: 4px; font-family: Arial, sans-serif; }
        .ai-lista { margin: 0; padding-left: 22px; }
        .ai-lista li { margin-bottom: 4px; line-height: 1.55; }
        .ai-referencias { margin: 0; padding-left: 22px; font-size: 12px; font-family: Arial, sans-serif; }
        .ai-referencias li { margin-bottom: 4px; line-height: 1.5; }
        .ai-report-firma {
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px solid var(--color-border);
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #6B7280;
          text-align: center;
        }
        .ai-report-firma .signature-line {
          margin-top: 32px;
          padding-top: 4px;
          border-top: 1px solid #1F2937;
          width: 260px;
          margin-left: auto;
          margin-right: auto;
          font-size: 12px;
          color: #1F2937;
        }
        .ai-report-firma .signature-img {
          max-height: 70px;
          margin: 12px auto 0;
          display: block;
        }
        .ai-firma-sub { font-size: 10px; color: #6B7280; margin-top: 2px; }
        @media print {
          .ai-report-doc { box-shadow: none; border: none; padding: 24px; }
          .ai-export-bar { display: none !important; }
          .ai-grafico-canvas-wrap { height: 320px; }
        }
      </style>
      <div class="card">
        <div class="card-header no-print" style="display:flex;justify-content:space-between;align-items:center;background:var(--color-bg);flex-wrap:wrap;gap:8px">
          <h3 style="color:var(--color-primary-dark)">Informe contextualizado</h3>
          <div class="flex gap-8" style="flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" id="ai-exp-html">⤓ HTML</button>
            <button class="btn btn-secondary btn-sm" id="ai-exp-word">⤓ Word</button>
            <button class="btn btn-secondary btn-sm" id="ai-exp-excel">⤓ Excel</button>
            <button class="btn btn-secondary btn-sm" id="ai-exp-json">⤓ JSON</button>
            <button class="btn btn-primary btn-sm" id="ai-exp-pdf">⤓ PDF</button>
            <button class="btn btn-secondary btn-sm" id="ai-print">Imprimir</button>
          </div>
        </div>
        <div class="card-body" style="padding:16px">
          <div class="ai-report-doc">
            <header class="ai-report-header">
              <h1>${this._esc(titulo)}</h1>
              <div class="ai-report-meta">
                <div><span>Evaluado</span>${this._esc(metaNombre)}</div>
                <div><span>Edad</span>${this._esc(metaEdad)}</div>
                <div><span>Sexo</span>${this._esc(metaSexo)}</div>
                <div><span>Documento</span>${this._esc(metaDocumento)}</div>
                <div><span>Fecha de aplicación</span>${this._esc(metaFechaApp)}</div>
                <div><span>Contexto</span>${this._esc(metaContexto)}</div>
                <div><span>Evaluador</span>${this._esc(metaEvaluador)}</div>
                <div><span>Fecha del informe</span>${this._esc(metaFechaInf)}</div>
              </div>
            </header>
            ${sectionsHTML}
            ${refsHTML}
            <footer class="ai-report-footer">
              <div>Fecha de emisión: ${this._esc(metaFechaInf)}</div>
              ${firmaHTML}
            </footer>
          </div>
        </div>
      </div>
    `;
  },

  /* ---------- AI block rendering helpers (AI-PROMPT-V2) ---------- */

  _renderAIBlock(block, secNumero) {
    if (!block || typeof block !== 'object') return '';
    const tipo = (block.tipo || '').toLowerCase();
    try {
      switch (tipo) {
        case 'parrafo':     return this._renderAIParrafo(block);
        case 'tabla':       return this._renderAITabla(block);
        case 'grafico':     return this._renderAIGrafico(block);
        case 'lista':       return this._renderAILista(block);
        case 'referencias': return this._renderAIReferencias(block);
        case 'firma':       return this._renderAIFirma(block);
        default:
          // Tipo desconocido: si tiene contenido, lo degradamos a párrafo
          if (block.contenido != null) return this._renderAIParrafo(block);
          return '';
      }
    } catch (e) {
      console.warn('Error renderizando bloque IA (' + tipo + '):', e, block);
      return `<p style="color:#C00000;font-size:11px;font-family:Arial,sans-serif">[Error renderizando bloque de tipo "${this._esc(tipo || 'desconocido')}"]</p>`;
    }
  },

  _renderAIParrafo(block) {
    const contenido = (block.contenido || '').trim();
    if (!contenido) return '';
    const paragraphs = contenido.split(/\n{2,}|\r\n{2,}/).map(s => s.trim()).filter(Boolean);
    if (paragraphs.length > 1) {
      return paragraphs.map(par =>
        `<p style="margin:0 0 10px;line-height:1.6;text-align:justify">${this._esc(par).replace(/\n/g, '<br>')}</p>`
      ).join('');
    }
    return `<p style="margin:0 0 10px;line-height:1.6;text-align:justify">${this._esc(contenido).replace(/\n/g, '<br>')}</p>`;
  },

  _renderAITabla(block) {
    const titulo = block.titulo || '';
    const columnas = Array.isArray(block.columnas) ? block.columnas : [];
    const filas = Array.isArray(block.filas) ? block.filas : [];
    if (!columnas.length && !filas.length) return '';

    const head = columnas.length
      ? `<thead><tr>${columnas.map(c => `<th>${this._esc(c)}</th>`).join('')}</tr></thead>`
      : '';
    const body = filas.map(row => {
      const cells = Array.isArray(row) ? row : [row];
      return `<tr>${cells.map(c => `<td>${this._esc(c == null ? '' : String(c))}</td>`).join('')}</tr>`;
    }).join('');

    return `<div class="ai-tabla-wrap">
      ${titulo ? `<div class="ai-tabla-titulo">${this._esc(titulo)}</div>` : ''}
      <table class="ai-tabla">
        ${head}
        <tbody>${body}</tbody>
      </table>
    </div>`;
  },

  _renderAIGrafico(block) {
    const figura = (block.figura != null) ? ('Figura ' + block.figura) : '';
    const titulo = block.titulo || '';
    const canvasId = 'ai-graf-' + (++this._aiChartSeq);
    // Guardamos el spec para renderizarlo tras la inserción en el DOM
    this._aiChartSpecs.push({ id: canvasId, block });
    return `<div class="ai-grafico-wrap">
      ${figura ? `<div class="ai-grafico-figura">${this._esc(figura)}</div>` : ''}
      ${titulo ? `<div class="ai-grafico-titulo">${this._esc(titulo)}</div>` : ''}
      <div class="ai-grafico-canvas-wrap" style="position:relative;height:380px">
        <canvas id="${canvasId}" class="ai-grafico-canvas"></canvas>
      </div>
    </div>`;
  },

  _renderAILista(block) {
    const titulo = block.titulo || '';
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';
    const itemsHTML = items.map(it =>
      `<li>${this._esc(typeof it === 'string' ? it : JSON.stringify(it))}</li>`
    ).join('');
    return `<div class="ai-lista-wrap">
      ${titulo ? `<div class="ai-lista-titulo">${this._esc(titulo)}</div>` : ''}
      <ul class="ai-lista">${itemsHTML}</ul>
    </div>`;
  },

  _renderAIReferencias(block) {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';
    const itemsHTML = items.map(it =>
      `<li>${this._esc(typeof it === 'string' ? it : JSON.stringify(it))}</li>`
    ).join('');
    return `<div class="ai-referencias-wrap"><ol class="ai-referencias">${itemsHTML}</ol></div>`;
  },

  _renderAIFirma(block) {
    const ev = Storage.getEvaluator() || {};
    const nombre = block.nombre || ev.name || 'Evaluador/a';
    const profesion = block.profesion || 'Psicólogo/a';
    const registro = block.registro || ev.registry || '';
    const institucion = block.institucion || ev.institution || '';
    const direccion = block.direccion || ev.address || '';
    const correo = block.correo || ev.email || '';
    const telefono = block.telefono || ev.phone || '';
    const extras = [direccion, correo, telefono].filter(Boolean);
    return `<div class="ai-report-firma">
      ${ev.signature ? `<img src="${ev.signature}" alt="firma" class="signature-img">` : ''}
      <div class="signature-line">
        ${this._esc(nombre)}
        <div class="ai-firma-sub">${this._esc(profesion)}${registro ? ' · ' + this._esc(registro) : ''}</div>
        ${institucion ? `<div class="ai-firma-sub">${this._esc(institucion)}</div>` : ''}
        ${extras.length ? `<div class="ai-firma-sub">${extras.map(s => this._esc(s)).join(' · ')}</div>` : ''}
      </div>
    </div>`;
  },

  /* ---------- Chart.js rendering for AI report grafico blocks ---------- */

  _renderAICharts() {
    if (!window.Chart) { console.warn('Chart.js no disponible — no se renderizan gráficos IA'); return; }
    // Copiar los specs ANTES de destruir: _destroyAICharts() vacía la lista
    // (este era el motivo de que las gráficas IA salieran en blanco).
    const specs = (this._aiChartSpecs || []).slice();
    this._destroyAICharts();
    this._aiChartSpecs = specs;
    for (const spec of specs) {
      try {
        const canvas = document.getElementById(spec.id);
        if (!canvas) { console.warn('Canvas IA no encontrado:', spec.id); continue; }
        const cs = this._aiBlockToSpec(spec.block);
        if (!cs) continue;
        const wrap = canvas.parentElement;
        if (wrap) wrap.style.height = window.ReportCharts.height(cs) + 'px';
        const chart = window.ReportCharts.mount(canvas, cs);
        if (chart) this._aiCharts.push(chart);
      } catch (e) {
        console.warn('Error renderizando gráfico IA:', spec.id, e);
      }
    }
  },

  _destroyAICharts() {
    for (const c of this._aiCharts) { try { c.destroy(); } catch (e) {} }
    this._aiCharts = [];
    this._aiChartSpecs = [];
  },

  /* ---------- Descargar Hoja de Respuestas (PDF vía print) ---------- */
  _downloadAnswerSheet() {
    const cur = Storage.getCurrentCase();
    if (!cur) { window.toast('No hay caso activo', 'error'); return; }
    const p = cur.patient || {};
    const ev = Storage.getEvaluator() || {};
    const responses = cur.responses || [];
    const items = window.__ITEMS__ || [];
    if (!items.length) { window.toast('No se pudieron cargar los ítems', 'error'); return; }

    const today = (p.applicationDate || new Date().toISOString().slice(0, 10));
    const todayFmt = this._fmtDate(today);

    // Construir filas de la tabla (567 ítems) con marca V/F
    const rowsHTML = items.map((it, i) => {
      const resp = responses[i];
      const isV = resp === 1;
      const isF = resp === 2;
      const vMark = isV ? '<span class="mark">X</span>' : '<span class="mark-empty">·</span>';
      const fMark = isF ? '<span class="mark">X</span>' : '<span class="mark-empty">·</span>';
      const num = it.num || (i + 1);
      return `<tr><td class="num">${num}</td><td class="text">${this._esc(it.text || '')}</td><td class="resp">${vMark}</td><td class="resp">${fMark}</td></tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Hoja de Respuestas MMPI-2 — ${this._esc(p.name || 'Paciente')}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1F2937; font-size: 10px; line-height: 1.4; }
  h1 { color: #1F3864; font-size: 16px; text-align: center; margin: 0 0 4px; letter-spacing: 1px; }
  .subtitle { text-align: center; font-size: 11px; color: #6B7280; margin-bottom: 10px; }
  .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; border: 1.5px solid #1F3864; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10px; }
  .header-grid .label { color: #6B7280; text-transform: uppercase; font-size: 8px; letter-spacing: 0.5px; font-weight: 700; }
  .header-grid .value { font-size: 11px; font-weight: 600; color: #1F2937; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #1F3864; color: #fff; padding: 4px 6px; font-size: 10px; text-align: left; border: 1px solid #1F3864; }
  thead th.resp { width: 28px; text-align: center; }
  tbody td { border: 1px solid #D1D5DB; padding: 2px 6px; vertical-align: top; }
  tbody td.num { width: 32px; text-align: right; font-weight: 700; color: #1F3864; }
  tbody td.text { font-size: 9px; }
  tbody td.resp { text-align: center; width: 28px; }
  .mark { color: #1F3864; font-weight: 900; font-size: 13px; font-family: 'Courier New', monospace; }
  .mark-empty { color: #D1D5DB; }
  .footer { margin-top: 10px; border-top: 1px solid #1F3864; padding-top: 6px; font-size: 9px; color: #6B7280; text-align: center; }
  @media print {
    tbody tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
  }
</style>
</head>
<body>
  <h1>HOJA DE RESPUESTAS · MMPI-2</h1>
  <div class="subtitle">Inventario Multifásico de Personalidad de Minnesota-2 — 567 ítems (V/F)</div>
  <div class="header-grid">
    <div><div class="label">Evaluado</div><div class="value">${this._esc(p.name || '—')}</div></div>
    <div><div class="label">Documento</div><div class="value">${this._esc(p.document || '—')}</div></div>
    <div><div class="label">Fecha nacimiento</div><div class="value">${this._fmtDate(p.dob)}</div></div>
    <div><div class="label">Edad</div><div class="value">${p.age != null ? p.age + ' años' : '—'}</div></div>
    <div><div class="label">Sexo</div><div class="value">${p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : '—')}</div></div>
    <div><div class="label">Fecha de aplicación</div><div class="value">${todayFmt}</div></div>
    <div><div class="label">Evaluador</div><div class="value">${this._esc(ev.name || '—')}</div></div>
    <div><div class="label">Registro profesional</div><div class="value">${this._esc(ev.registry || ev.license || '—')}</div></div>
    <div style="grid-column: 1 / span 2"><div class="label">Contacto</div><div class="value">${this._esc([ev.email, ev.phone, ev.address].filter(Boolean).join(' · '))}</div></div>
  </div>
  <table>
    <thead><tr>
      <th>Nº</th><th>Enunciado del ítem</th><th class="resp">V</th><th class="resp">F</th>
    </tr></thead>
    <tbody>${rowsHTML}</tbody>
  </table>
  <div class="footer">
    Documento generado el ${new Date().toLocaleString('es-ES')}. Marca «X» indica la respuesta registrada por el evaluado.
  </div>
  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 250); };
  </script>
</body>
</html>`;

    this._openPrintWindow(html);
  },

  /* ---------- Descargar Perfil de Escalas (PDF vía canvas + print) ---------- */
  _downloadProfileSheet() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) { window.toast('No hay resultados para dibujar el perfil', 'error'); return; }
    const p = cur.patient || {};
    const ev = Storage.getEvaluator() || {};
    const R = cur.results;
    const country = (p.country === 'ES' || p.country === 'US' || p.country === 'MX') ? p.country : 'ES';
    const countryLabel = country === 'US' ? 'EE. UU. (Minnesota N=2.600)' : 'España (TEA Ediciones, 4.ª ed. 2019)';

    // Dibujar el perfil en un canvas off-screen (alto nivel de detalle para impresión)
    const canvas = document.createElement('canvas');
    const W = 1400, H = 900;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) { window.toast('No se pudo obtener el contexto Canvas', 'error'); return; }

    try {
      this._drawProfileCanvas(ctx, W, H, R);
    } catch (e) {
      console.error('Error dibujando perfil:', e);
      window.toast('Error al dibujar el perfil: ' + e.message, 'error');
      return;
    }

    const dataURL = canvas.toDataURL('image/png');
    const todayFmt = this._fmtDate(p.applicationDate || new Date().toISOString().slice(0, 10));

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Perfil de Escalas MMPI-2 — ${this._esc(p.name || 'Paciente')}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1F2937; font-size: 11px; }
  h1 { color: #1F3864; font-size: 18px; text-align: center; margin: 0 0 4px; letter-spacing: 1px; }
  .subtitle { text-align: center; font-size: 11px; color: #6B7280; margin-bottom: 8px; }
  .header-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 16px; border: 1.5px solid #1F3864; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10px; }
  .header-grid .label { color: #6B7280; text-transform: uppercase; font-size: 8px; letter-spacing: 0.5px; font-weight: 700; }
  .header-grid .value { font-size: 11px; font-weight: 600; color: #1F2937; }
  .profile-img { width: 100%; max-width: 1100px; display: block; margin: 8px auto; border: 1px solid #1F3864; }
  .footer { margin-top: 10px; border-top: 1px solid #1F3864; padding-top: 6px; font-size: 9px; color: #6B7280; text-align: center; }
</style>
</head>
<body>
  <h1>PERFIL DE ESCALAS · MMPI-2</h1>
  <div class="subtitle">Puntuaciones T (media 50, DT 10) — Baremo: ${this._esc(countryLabel)}</div>
  <div class="header-grid">
    <div><div class="label">Evaluado</div><div class="value">${this._esc(p.name || '—')}</div></div>
    <div><div class="label">Documento</div><div class="value">${this._esc(p.document || '—')}</div></div>
    <div><div class="label">Edad / Sexo</div><div class="value">${p.age != null ? p.age + ' años' : '—'} / ${p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : '—')}</div></div>
    <div><div class="label">Fecha de aplicación</div><div class="value">${todayFmt}</div></div>
    <div><div class="label">Evaluador</div><div class="value">${this._esc(ev.name || '—')}</div></div>
    <div><div class="label">Registro</div><div class="value">${this._esc(ev.registry || ev.license || '—')}</div></div>
  </div>
  <img class="profile-img" src="${dataURL}" alt="Perfil MMPI-2">
  <div class="footer">
    Líneas de referencia: T=50 (media) y T=65 (corte clínico). Puntos rojos = T≥70 · naranjas = 60–69 · amarillos = 56–59 · grises = 40–55 · azules ≤39.
  </div>
  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 400); };
  </script>
</body>
</html>`;

    this._openPrintWindow(html);
  },

  /* ---------- Abrir ventana nueva con HTML y disparar impresión ---------- */
  _openPrintWindow(html) {
    try {
      const w = window.open('', '_blank', 'width=900,height=700');
      if (!w) {
        // Bloqueado por el navegador: usar iframe oculto como fallback
        this._printViaIframe(html);
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error('Error abriendo ventana de impresión:', e);
      this._printViaIframe(html);
    }
  },

  _printViaIframe(html) {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
        catch (e) { console.error('Impresión iframe fallida:', e); }
        setTimeout(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 1500);
      }, 600);
    } catch (e) {
      console.error('Impresión iframe fallida:', e);
      window.toast('No se pudo abrir la ventana de impresión. Permita popups y reintente.', 'error');
    }
  },

  /* ---------- Dibujar perfil MMPI-2 en canvas (estilo lápiz/marcador) ---------- */
  _drawProfileCanvas(ctx, W, H, results) {
    // Definir grupos y colores de trazo (estilo lápiz)
    const groups = [
      { title: 'VALIDEZ + CLÍNICAS BÁSICAS', codes: this._BASIC_CODES, color: '#1F3864' },
      { title: 'ESCALAS DE CONTENIDO',       codes: this._CONTENT_CODES, color: '#2F5496' },
      { title: 'ESCALAS SUPLEMENTARIAS',    codes: this._SUPP_CODES,  color: '#4F6D9C' },
      { title: 'SUBESCALAS HARRIS-LINGOES', codes: this._SUB_CODES,   color: '#5F7FB0' },
    ];

    // Layout: márgenes
    const marginLeft = 80, marginRight = 40, marginTop = 30, marginBottom = 220;
    const plotW = W - marginLeft - marginRight;
    const plotH = H - marginTop - marginBottom;
    const tMin = 30, tMax = 90;

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Título superior
    ctx.fillStyle = '#1F3864';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('PERFIL DE ESCALAS · MMPI-2', marginLeft, marginTop - 8);

    // ---- Rejilla + ejes ----
    // Líneas horizontales cada 5 T (de 30 a 90)
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.font = '11px Arial';
    ctx.fillStyle = '#6B7280';
    for (let t = tMin; t <= tMax; t += 5) {
      const y = marginTop + plotH * (1 - (t - tMin) / (tMax - tMin));
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(W - marginRight, y);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText('T=' + t, marginLeft - 6, y + 4);
    }
    // Líneas verticales en cada columna (de cada escala)
    const totalCols = groups.reduce((a, g) => a + g.codes.length, 0);
    const colW = plotW / totalCols;
    ctx.strokeStyle = '#F3F4F6';
    for (let i = 0; i <= totalCols; i++) {
      const x = marginLeft + i * colW;
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + plotH);
      ctx.stroke();
    }
    // Línea T=50 (media) y T=65 (corte clínico) más visibles
    const y50 = marginTop + plotH * (1 - (50 - tMin) / (tMax - tMin));
    const y65 = marginTop + plotH * (1 - (65 - tMin) / (tMax - tMin));
    ctx.strokeStyle = '#9CA3AF';
    ctx.setLineDash([8, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(marginLeft, y50); ctx.lineTo(W - marginRight, y50); ctx.stroke();
    ctx.strokeStyle = '#C00000';
    ctx.beginPath(); ctx.moveTo(marginLeft, y65); ctx.lineTo(W - marginRight, y65); ctx.stroke();
    ctx.setLineDash([]);
    // Etiquetas de líneas de referencia
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'left';
    ctx.fillText('T=50 (media)', W - marginRight + 4, y50 + 4);
    ctx.fillStyle = '#C00000';
    ctx.fillText('T=65 (corte)', W - marginRight + 4, y65 + 4);

    // ---- Trazar perfiles por grupo ----
    let colIdx = 0;
    // Listar primero las posiciones X de cada escala (para etiquetas y puntos)
    const scalePositions = {};
    for (const g of groups) {
      for (const code of g.codes) {
        scalePositions[code] = marginLeft + (colIdx + 0.5) * colW;
        colIdx++;
      }
    }

    // Etiquetas X (códigos) en la parte inferior
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    for (const g of groups) {
      for (const code of g.codes) {
        const x = scalePositions[code];
        ctx.save();
        ctx.translate(x, marginTop + plotH + 12);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(code, 0, 0);
        ctx.restore();
      }
    }

    // Trazar línea de cada grupo + puntos
    for (const g of groups) {
      const pts = [];
      for (const code of g.codes) {
        const r = results[code];
        const t = (r && typeof r.t === 'number') ? r.t : null;
        if (t == null) continue;
        const x = scalePositions[code];
        const y = marginTop + plotH * (1 - (t - tMin) / (tMax - tMin));
        pts.push({ x, y, t, code });
      }
      if (pts.length === 0) continue;

      // Línea conectando los puntos
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.stroke();

      // Puntos
      for (const p of pts) {
        let color = '#6B7280'; // modal 40-55
        if (p.t >= 70) color = '#C00000';     // rojo
        else if (p.t >= 60) color = '#ED7D31'; // naranja
        else if (p.t >= 56) color = '#FFC000'; // amarillo
        else if (p.t <= 39) color = '#2F5496'; // azul
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Etiqueta del T sobre el punto
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String(p.t), p.x, p.y - 8);
      }
    }

    // ---- Leyenda de grupos + bandas (en la parte inferior) ----
    let legendY = marginTop + plotH + 110;
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'left';
    ctx.fillText('Leyenda de bandas T:', marginLeft, legendY);
    const bands = [
      { label: 'Muy alto (≥70)', color: '#C00000' },
      { label: 'Alto (60-69)',    color: '#ED7D31' },
      { label: 'Prom. sup. (56-59)', color: '#FFC000' },
      { label: 'Modal (40-55)',   color: '#6B7280' },
      { label: 'Bajo (≤39)',      color: '#2F5496' },
    ];
    let lx = marginLeft + 130;
    for (const b of bands) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(lx, legendY - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px Arial';
      ctx.fillText(b.label, lx + 10, legendY);
      lx += 10 + ctx.measureText(b.label).width + 22;
    }

    // Línea separadora + leyenda de grupos (colores de trazos)
    legendY += 26;
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = '#1F2937';
    ctx.fillText('Grupos trazados:', marginLeft, legendY);
    let gx = marginLeft + 130;
    for (const g of groups) {
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx, legendY - 4);
      ctx.lineTo(gx + 18, legendY - 4);
      ctx.stroke();
      ctx.fillStyle = '#1F2937';
      ctx.font = '10px Arial';
      ctx.fillText(g.title, gx + 24, legendY);
      gx += 24 + ctx.measureText(g.title).width + 16;
    }

    // Pie con datos del paciente
    legendY += 30;
    ctx.strokeStyle = '#1F3864';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft, legendY);
    ctx.lineTo(W - marginRight, legendY);
    ctx.stroke();
    legendY += 16;
    const p = (Storage.getCurrentCase() || {}).patient || {};
    const country = (p.country === 'ES' || p.country === 'US' || p.country === 'MX') ? p.country : 'ES';
    const countryLabel = country === 'US' ? 'EE. UU. (Minnesota)' : 'España (TEA)';
    ctx.font = '10px Arial';
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'left';
    const line1 = `Evaluado: ${p.name || '—'}   ·   Documento: ${p.document || '—'}   ·   Edad: ${p.age != null ? p.age : '—'}   ·   Sexo: ${p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : '—')}`;
    ctx.fillText(line1, marginLeft, legendY);
    const line2 = `Baremo: ${countryLabel}   ·   Fecha de aplicación: ${this._fmtDate(p.applicationDate)}   ·   Generado: ${new Date().toLocaleString('es-ES')}`;
    ctx.fillText(line2, marginLeft, legendY + 14);
  },

  /* ---------- Parser del texto libre de T previas (mismo formato que ai-prompt.js) ---------- */
  _parsePreviousMMPI(text) {
    const out = {};
    if (!text) return out;
    const re = /([A-Za-z][A-Za-z0-9-]{0,5})\s*[:=]\s*(\d{1,3})/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const code = m[1].charAt(0).toUpperCase() + m[1].slice(1);
      const t = parseInt(m[2], 10);
      if (t >= 20 && t <= 120) out[code] = t;
    }
    return out;
  },

  /* ---------- Utils ---------- */
  _fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) { return iso; }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _safeName(name) {
    return (name || 'caso').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]/g, '').trim().replace(/\s+/g, '_');
  },
};

window.Report = Report;

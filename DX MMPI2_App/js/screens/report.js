/* ============================================
   Report screen — informe completo (REPORT-V2)
   - Datos paciente (con antecedentes, motivo, país/baremo)
   - Datos evaluador (con firma)
   - Narrativa automática
   - Tablas por grupo + "Síntesis del grupo"
   - Configuraciones clínicas detectadas
   - Índice F-K
   - Recomendaciones clínicas
   - 4 gráficos Chart.js LINE con líneas T=50 y T=65
   - Exportar HTML / Word / Excel / JSON / Print
   ============================================ */

const Report = {
  _charts: [],    // Chart.js instances
  _chartImgs: [], // {title, dataURL} capturadas para export
  _aiCharts: [],    // Chart.js instances for AI report (AI-PROMPT-V2)
  _aiChartSpecs: [],// [{id, block}] pendientes de renderizar
  _aiChartSeq: 0,   // contador para IDs únicos de canvas IA

  /* Códigos por grupo para los gráficos (orden canónico MMPI-2) */
  _BASIC_CODES:    ['L','F','K','Hs','D','Hy','Pd','Mf','Pa','Pt','Sc','Ma','Si'],
  _CONTENT_CODES:  ['ANX','FRS','OBS','DEP','HEA','BIZ','ANG','CYN','ASP','TPA','LSE','SOD','FAM','WRK','TRT'],
  _SUPP_CODES:     ['A','R','Es','MAC-R','AAS','APS','MDS','Ho','O-H','Do','Re','Mt','GM','GF','PK'],
  _SUB_CODES:      ['D1','D2','D3','D4','D5','Hy1','Hy2','Hy3','Hy4','Hy5','Pd1','Pd2','Pd3','Pd4','Pd5',
                    'Pa1','Pa2','Pa3','Sc1','Sc2','Sc3','Sc4','Sc5','Sc6','Ma1','Ma2','Ma3','Ma4','Si1','Si2','Si3'],

  /* Títulos de los 4 gráficos (también usados al exportar) */
  _CHART_TITLES: [
    'Perfil Básico (Validez + Clínicas)',
    'Perfil de Contenido',
    'Perfil Suplementario',
    'Subescalas Harris-Lingoes',
  ],
  _CHART_IDS: ['chart-basic', 'chart-content', 'chart-supp', 'chart-sub'],

  /* Códigos básicos para el gráfico de comparación con MMPI-2 anterior */
  _COMPARE_CODES: ['Hs','D','Hy','Pd','Pa','Pt','Sc','Ma','Si'],

  render() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) {
      return `<div class="screen"><div class="screen-content"><div class="empty-state">
        <div class="empty-state-icon">⚠</div>
        <h2>Sin resultados</h2>
        <p>El caso actual no tiene resultados procesados. Capture las respuestas primero.</p>
        <button class="btn btn-primary" onclick="App.navigate('dashboard')">Ir al panel</button>
      </div></div></div>`;
    }
    const p = cur.patient || {};
    const ev = Storage.getEvaluator() || {};
    const country = p.country || (window.MMPI2 ? MMPI2.getCountry() : 'ES');
    const countryLabel = country === 'US'
      ? 'EE. UU. (Minnesota N=2.600) — recomendado para Latinoamérica'
      : 'España (TEA Ediciones, N=500, 4.ª ed. 2019)';

    const narrative = cur.narrative
      || (window.MMPI2 ? MMPI2.buildNarrative(cur.results, p.name, p.age, p.sex, country) : '');

    const groups = this._groupScales(cur.results);
    const configs = this._detectConfigs(cur.results);

    return `
      <div class="screen">
        <div class="topbar no-print">
          <div class="topbar-title">MMPI-2 · Informe — ${this._esc(p.name || 'paciente')}</div>
          <div class="topbar-actions flex gap-8">
            <button class="btn btn-secondary btn-sm" id="rpt-edit">Editar caso</button>
            <button class="btn btn-secondary btn-sm" id="rpt-recapture">Recapturar</button>
            <button class="btn btn-ghost btn-sm" id="rpt-back">‹ Panel</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Menú"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="screen-content wide">

          <!-- Export bar + Baremo switcher -->
          <div class="card no-print">
            <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
              <div class="flex gap-8" style="flex-wrap:wrap;align-items:center">
                <label for="baremo-select" style="font-weight:600;color:var(--color-primary-dark);margin-right:4px">Baremo:</label>
                <select id="baremo-select" class="form-select" style="width:auto;min-width:280px">
                  <option value="US" ${country === 'US' ? 'selected' : ''}>EE.UU. (Minnesota N=2.600)</option>
                  <option value="ES" ${country === 'ES' ? 'selected' : ''}>España (TEA Ediciones)</option>
                </select>
                <span class="form-hint" style="margin-left:8px">Recalcula todas las T al cambiar.</span>
              </div>
              <div class="flex gap-8" style="flex-wrap:wrap;align-items:center">
                <span style="font-weight:600;color:var(--color-primary-dark);margin-right:8px">Exportar:</span>
                <button class="btn btn-secondary btn-sm" id="exp-html">HTML</button>
                <button class="btn btn-secondary btn-sm" id="exp-word">Word</button>
                <button class="btn btn-secondary btn-sm" id="exp-excel">Excel</button>
                <button class="btn btn-secondary btn-sm" id="exp-json">JSON</button>
                <button class="btn btn-secondary btn-sm" id="exp-answer-sheet">⤓ Hoja de Respuestas (PDF)</button>
                <button class="btn btn-secondary btn-sm" id="exp-profile-sheet">⤓ Perfil de Escalas (PDF)</button>
                <button class="btn btn-primary btn-sm" id="exp-print" style="margin-left:auto">Imprimir / PDF</button>
              </div>
            </div>
          </div>

          <!-- Paciente -->
          <div class="card">
            <div class="card-header"><h3>Datos del paciente</h3></div>
            <div class="card-body">
              <div class="report-info-grid">
                <div class="report-info-item"><div class="report-info-label">Nombre</div><div class="report-info-value">${this._esc(p.name || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Documento</div><div class="report-info-value">${this._esc(p.document || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Fecha de nacimiento</div><div class="report-info-value">${this._fmtDate(p.dob)}</div></div>
                <div class="report-info-item"><div class="report-info-label">Edad</div><div class="report-info-value">${p.age != null ? p.age + ' años' : '—'}</div></div>
                <div class="report-info-item"><div class="report-info-label">Sexo</div><div class="report-info-value">${p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Baremo (país)</div><div class="report-info-value">${this._esc(countryLabel)}</div></div>
                <div class="report-info-item"><div class="report-info-label">Contexto</div><div class="report-info-value">${this._esc(p.context || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Fecha de aplicación</div><div class="report-info-value">${this._fmtDate(p.applicationDate)}</div></div>
                <div class="report-info-item"><div class="report-info-label">Modalidad</div><div class="report-info-value">${this._esc(cur.captureMode || '—')}</div></div>
              </div>
              ${p.history ? `<div class="report-info-item" style="margin-top:12px"><div class="report-info-label">Antecedentes</div><div class="report-info-value" style="white-space:pre-wrap">${this._esc(p.history)}</div></div>` : ''}
              ${p.reason ? `<div class="report-info-item" style="margin-top:12px"><div class="report-info-label">Motivo de evaluación</div><div class="report-info-value" style="white-space:pre-wrap">${this._esc(p.reason)}</div></div>` : ''}
            </div>
          </div>

          <!-- Evaluador -->
          <div class="card">
            <div class="card-header"><h3>Evalúa</h3></div>
            <div class="card-body">
              <div class="report-info-grid">
                <div class="report-info-item"><div class="report-info-label">Nombre</div><div class="report-info-value">${this._esc(ev.name || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Tarjeta profesional</div><div class="report-info-value">${this._esc(ev.license || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Registro profesional</div><div class="report-info-value">${this._esc(ev.registry || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Correo</div><div class="report-info-value">${this._esc(ev.email || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Teléfono</div><div class="report-info-value">${this._esc(ev.phone || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Dirección</div><div class="report-info-value">${this._esc(ev.address || '—')}</div></div>
              </div>
              <div style="margin-top:16px">
                <div class="report-info-label">Firma</div>
                ${ev.signature
                  ? `<img src="${ev.signature}" alt="firma" style="max-height:70px;margin-top:6px;border-bottom:1px solid var(--color-primary-dark);padding-bottom:4px">`
                  : '<div style="margin-top:6px;color:var(--color-text-muted);font-style:italic">Sin firma registrada</div>'}
              </div>
            </div>
          </div>

          <!-- Narrativa -->
          <div class="card">
            <div class="card-header"><h3>Síntesis interpretativa</h3></div>
            <div class="card-body">
              <div class="report-narrative">${this._esc(narrative)}</div>
            </div>
          </div>

          <!-- Tablas por grupo + síntesis -->
          ${this._renderTableWithSynthesis(groups['Validez'], 'Escalas de Validez', 'Validez')}
          ${this._renderTableWithSynthesis(groups['Clínicas'], 'Escalas Clínicas Básicas', 'Clínicas')}
          ${this._renderTableWithSynthesis(groups['Contenido'], 'Escalas de Contenido', 'Contenido')}
          ${this._renderTableWithSynthesis(groups['Suplementarias'], 'Escalas Suplementarias', 'Suplementarias')}
          ${this._renderTableWithSynthesis(groups['Subescalas'], 'Subescalas Harris-Lingoes', 'Subescalas')}

          <!-- Configuraciones clínicas detectadas -->
          <div class="card">
            <div class="card-header"><h3>Configuraciones clínicas detectadas</h3></div>
            <div class="card-body">
              ${this._renderConfigs(configs)}
            </div>
          </div>

          <!-- Índice F-K -->
          <div class="card">
            <div class="card-header"><h3>Índice F−K</h3></div>
            <div class="card-body">
              ${this._renderFKIndex(cur.results)}
            </div>
          </div>

          <!-- Recomendaciones clínicas -->
          <div class="card">
            <div class="card-header"><h3>Recomendaciones clínicas</h3></div>
            <div class="card-body">
              <ul style="margin:0;padding-left:20px;line-height:1.7">
                ${this._renderRecommendations(cur.results, configs)}
              </ul>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="card">
            <div class="card-header"><h3>Gráficos del perfil</h3></div>
            <div class="card-body">
              ${this._chartContainerHTML('chart-basic',    this._CHART_TITLES[0])}
              ${this._chartContainerHTML('chart-content', this._CHART_TITLES[1])}
              ${this._chartContainerHTML('chart-supp',    this._CHART_TITLES[2])}
              ${this._chartContainerHTML('chart-sub',      this._CHART_TITLES[3])}
              ${p.previousMMPI ? this._chartContainerHTML('chart-compare', 'Comparación con MMPI-2 anterior') : ''}
            </div>
          </div>

          ${p.previousMMPI ? this._renderComparisonSection(cur.results, p.previousMMPI) : ''}

          <!-- Análisis de Resultados (tabla exhaustiva) -->
          ${this._renderAnalysisTable(cur.results, p.previousMMPI)}

          <div class="card">
            <div class="card-body" style="font-size:12px;color:var(--color-text-muted)">
              Informe generado el ${new Date().toLocaleString('es-ES')}.
              Baremo utilizado: <strong>${this._esc(countryLabel)}</strong>.
              Las escalas marcadas ES-ONLINE requieren TEAcorrige para la conversión PD→T.
              Las líneas de referencia en los gráficos marcan T=50 (media) y T=65 (corte clínico).
            </div>
          </div>

          <!-- Análisis con IA externa -->
          ${this._aiAnalysisSection()}

        </div>
      </div>
    `;
  },

  mount() {
    bindEvent('ham-btn', 'click', () => App.openMenu());
    bindEvent('rpt-back', 'click', () => App.navigate('dashboard'));
    bindEvent('rpt-edit', 'click', () => App.navigate('case'));
    bindEvent('rpt-recapture', 'click', () => {
      if (confirm('¿Recapturar respuestas? Se conservarán los datos del paciente. Los resultados actuales se reemplazarán.')) {
        const cur = Storage.getCurrentCase();
        if (cur) {
          cur.responses = new Array(567).fill(null);
          cur.results = null;
          cur.narrative = null;
          Storage.saveCase(cur);
          Storage.setCurrentCase(cur);
        }
        App.navigate('capture');
      }
    });

    bindEvent('exp-html', 'click', () => this._exportHTML());
    bindEvent('exp-word', 'click', () => this._exportWord());
    bindEvent('exp-excel', 'click', () => this._exportExcel());
    bindEvent('exp-json', 'click', () => this._exportJSON());
    bindEvent('exp-print', 'click', () => window.print());
    bindEvent('exp-answer-sheet', 'click', () => this._downloadAnswerSheet());
    bindEvent('exp-profile-sheet', 'click', () => this._downloadProfileSheet());
    bindEvent('baremo-select', 'change', (e) => this._recalcCountry(e.target.value));

    bindEvent('ai-copy-prompt', 'click', () => this._copyAIPrompt());
    bindEvent('ai-generate', 'click', () => this._generateAIReport());
    bindEvent('ai-clear', 'click', () => this._clearAIReport());

    // Restore previously-generated AI report if it exists
    const cur2 = Storage.getCurrentCase();
    if (cur2 && cur2.aiReport) {
      const out = document.getElementById('ai-report-output');
      if (out) {
        try {
          out.innerHTML = this._renderAIReport(cur2.aiReport);
          // Render Chart.js charts after DOM insertion (AI-PROMPT-V2)
          this._renderAICharts();
        } catch (e) { console.warn('No se pudo restaurar el informe IA:', e); }
        // Bind AI export buttons (created dynamically)
        this._bindAIExportButtons();
      }
    }

    this._renderCharts();
  },

  /* ---------- AI Analysis section ---------- */
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
      <div class="card no-print" style="border:2px solid var(--color-success)">
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
    let prompt;
    try {
      prompt = AIPrompt.build(cur, ev);
    } catch (e) {
      console.error('AIPrompt.build error:', e);
      window.toast('Error al construir el prompt: ' + e.message, 'error');
      return;
    }

    const done = () => {
      window.toast('Prompt copiado. Abre una IA externa, pega el prompt, genera el JSON y pégalo aquí abajo.', 'success', 6500);
    };
    const fail = () => { window.toast('No se pudo copiar al portapapeles. Intenta de nuevo.', 'error'); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt).then(done).catch(() => this._fallbackCopy(prompt, done, fail));
    } else {
      this._fallbackCopy(prompt, done, fail);
    }
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
    const cleaned = this._extractJSON(raw);
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON parse error:', e);
      window.toast('JSON inválido. Verifique el formato y vuelva a intentarlo. Detalle: ' + e.message, 'error', 6500);
      return;
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
  },

  _exportAIReport(format) {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.aiReport) { window.toast('No hay informe IA generado para exportar', 'warning'); return; }
    const ev = Storage.getEvaluator() || {};
    try {
      if (format === 'html') { window.Export.exportAIReportHTML(cur.aiReport, cur, ev); window.toast('Informe IA · HTML descargado', 'success'); }
      else if (format === 'word') {
        window.Export.exportAIReportWord(cur.aiReport, cur, ev)
          .then(() => window.toast('Informe IA · Word descargado', 'success'))
          .catch(e => window.toast('Error: ' + e.message, 'error'));
      } else if (format === 'excel') { window.Export.exportAIReportExcel(cur.aiReport, cur, ev); window.toast('Informe IA · Excel descargado', 'success'); }
      else if (format === 'json') { window.Export.exportAIReportJSON(cur.aiReport, cur); window.toast('Informe IA · JSON descargado', 'success'); }
    } catch (e) {
      console.error('Error exportando informe IA:', e);
      window.toast('Error: ' + e.message, 'error');
    }
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
            <button class="btn btn-primary btn-sm" onclick="window.print()">Imprimir / PDF</button>
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
    this._destroyAICharts();
    if (!this._aiChartSpecs || !this._aiChartSpecs.length) return;
    for (const spec of this._aiChartSpecs) {
      try {
        const canvas = document.getElementById(spec.id);
        if (!canvas) { console.warn('Canvas IA no encontrado:', spec.id); continue; }
        const chart = this._buildAIChart(canvas, spec.block);
        if (chart) this._aiCharts.push(chart);
      } catch (e) {
        console.warn('Error renderizando gráfico IA:', spec.id, e);
      }
    }
  },

  _buildAIChart(canvas, block) {
    const tipo = (block.grafico_tipo || 'linea').toLowerCase();
    const ejeY = block.eje_y || { min: 30, max: 100, variable: 'Puntuación T' };
    const refs = Array.isArray(block.lineas_referencia) ? block.lineas_referencia : [];
    const series = Array.isArray(block.series) ? block.series : [];

    // Construir etiquetas x (unión de todas las x presentes en las series, en orden de aparición)
    const labels = [];
    for (const s of series) {
      for (const pt of (s.puntos || [])) {
        if (pt && labels.indexOf(pt.x) === -1) labels.push(pt.x);
      }
    }
    if (!labels.length) return null;

    const palette = ['#1F3864', '#C00000', '#2E7D32', '#ED7D31', '#7030A0', '#0097A7'];
    const isLinea = (tipo === 'linea');
    const isBarH = (tipo === 'barras_h');
    const chartType = isLinea ? 'line' : 'bar';
    const indexAxis = isBarH ? 'y' : 'x';

    const datasets = series.map((s, i) => {
      const color = palette[i % palette.length];
      const data = labels.map(lbl => {
        const pt = (s.puntos || []).find(p => p.x === lbl);
        return pt ? (typeof pt.y === 'number' ? pt.y : parseFloat(pt.y)) : null;
      });
      if (isLinea) {
        return {
          label: s.nombre || ('Serie ' + (i + 1)),
          data,
          borderColor: color,
          backgroundColor: color + '20',
          pointBackgroundColor: color,
          pointBorderColor: color,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2,
          fill: false,
          tension: 0,
          spanGaps: false,
        };
      }
      // barras_h o barras_agrupadas
      return {
        label: s.nombre || ('Serie ' + (i + 1)),
        data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      };
    });

    // Líneas de referencia (solo para gráficos de línea)
    const refDatasets = [];
    if (isLinea) {
      for (const r of refs) {
        const rv = Number(r);
        if (!isFinite(rv)) continue;
        const isCrit = (rv >= 65);
        refDatasets.push({
          label: 'T=' + rv,
          data: labels.map(() => rv),
          borderColor: isCrit ? '#C00000' : '#9CA3AF',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0,
        });
      }
    }

    const yMin = (typeof ejeY.min === 'number') ? ejeY.min : 30;
    const yMax = (typeof ejeY.max === 'number') ? ejeY.max : 100;

    const config = {
      type: chartType,
      data: { labels, datasets: [...datasets, ...refDatasets] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { font: { size: 10 }, boxWidth: 12, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: (ctx2) => {
                const v = (indexAxis === 'y') ? ctx2.parsed.x : ctx2.parsed.y;
                return `${ctx2.dataset.label}: ${v}`;
              },
            },
          },
          title: {
            display: !!block.titulo,
            text: block.titulo || '',
            font: { size: 12 },
            color: '#1F2937',
          },
        },
        scales: {
          y: {
            min: yMin, max: yMax,
            ticks: { font: { size: 10 }, color: '#6B7280' },
            grid: { color: '#E5E7EB' },
            title: {
              display: !!ejeY.variable,
              text: ejeY.variable || '',
              font: { size: 11 },
              color: '#1F2937',
            },
          },
          x: {
            ticks: { font: { size: 9 }, color: '#1F2937', maxRotation: isBarH ? 0 : 45, minRotation: 0, autoSkip: false },
            grid: { display: false },
          },
        },
      },
    };

    try {
      return new Chart(canvas.getContext('2d'), config);
    } catch (e) {
      console.warn('No se pudo crear el Chart IA:', e);
      return null;
    }
  },

  _destroyAICharts() {
    for (const c of this._aiCharts) { try { c.destroy(); } catch (e) {} }
    this._aiCharts = [];
    this._aiChartSpecs = [];
  },

  /* ---------- Grouping ---------- */
  _groupScales(results) {
    const groups = { Validez: [], Clínicas: [], Contenido: [], Suplementarias: [], Subescalas: [] };
    for (const r of Object.values(results)) {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    }
    return groups;
  },

  /* ---------- Table + synthesis ---------- */
  _renderTableWithSynthesis(scales, title, groupName) {
    if (!scales || !scales.length) return '';
    const rows = scales.map(s => {
      const tNum = typeof s.t === 'number';
      const tDisplay = tNum ? s.t : (s.t == null ? '—' : 'N/D');
      const pdDisplay = (s.pd != null) ? s.pd : '—';
      const pdKDisplay = s.pdk ? (s.pdK != null ? s.pdK : '—') : '—';
      const band = s.band ? s.band.label : '—';
      const bandClass = s.band ? s.band.color : '';
      return `<tr>
        <td style="font-weight:600">${this._esc(s.code)}</td>
        <td>${this._esc(s.name)}</td>
        <td class="center">${pdDisplay}</td>
        <td class="center">${pdKDisplay}</td>
        <td class="center ${bandClass}">${tDisplay}</td>
        <td class="center ${bandClass}">${this._esc(band)}</td>
        <td style="font-size:12px">${this._esc(s.interpretation || '')}</td>
      </tr>`;
    }).join('');
    const synth = this._groupSynthesis(groupName, scales);
    return `
      <div class="card">
        <div class="card-header"><h3>${this._esc(title)}</h3></div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table class="data-table">
              <thead><tr>
                <th>Código</th><th>Escala</th><th class="center">PD</th><th class="center">PD+K</th>
                <th class="center">T</th><th class="center">Banda</th><th>Interpretación</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="padding:12px 20px;border-top:1px solid var(--color-border);background:var(--color-bg);font-size:13px;line-height:1.55">
            <strong style="color:var(--color-primary-dark)">Síntesis del grupo:</strong>
            <span>${this._esc(synth)}</span>
          </div>
        </div>
      </div>
    `;
  },

  /* ---------- Group synthesis paragraph ---------- */
  _groupSynthesis(groupName, scales) {
    const elevated = scales.filter(s => typeof s.t === 'number' && s.t >= 70);
    const high = scales.filter(s => typeof s.t === 'number' && s.t >= 60 && s.t < 70);
    const low = scales.filter(s => typeof s.t === 'number' && s.t <= 39);
    const online = scales.filter(s => s.status === 'ES-ONLINE');
    const fmtList = arr => arr.map(s => `${s.code} (T=${s.t})`).join(', ');

    let parts = [];

    if (groupName === 'Validez') {
      const byCode = code => scales.find(s => s.code === code);
      const L = byCode('L'), F = byCode('F'), K = byCode('K');
      const vFacts = [];
      if (L && typeof L.t === 'number') vFacts.push(`L=T${L.t}`);
      if (F && typeof F.t === 'number') vFacts.push(`F=T${F.t}`);
      if (K && typeof K.t === 'number') vFacts.push(`K=T${K.t}`);
      if (vFacts.length) parts.push('Validez: ' + vFacts.join(', ') + '.');
      if (F && typeof F.t === 'number' && F.t >= 65) {
        parts.push('F elevada sugiere posible simulación o pedido de ayuda; conviene contrastar con la entrevista.');
      } else if (F && typeof F.t === 'number' && F.t < 45) {
        parts.push('F baja puede indicar postura defensiva o minimización de síntomas.');
      }
      if (L && typeof L.t === 'number' && L.t >= 65) {
        parts.push('L elevada indica tendencia a presentarse de manera demasiado favorable ("fake good").');
      }
      if (K && typeof K.t === 'number' && K.t >= 65) {
        parts.push('K elevada refuerza la hipótesis de una postura defensiva cerrada.');
      } else if (K && typeof K.t === 'number' && K.t < 40) {
        parts.push('K baja indica autocrítica elevada o exageración de problemas.');
      }
      if (!vFacts.length) parts.push('No se dispone de T documentada para las escalas de validez básicas.');
    } else if (groupName === 'Clínicas') {
      const peak = elevated.concat(high).sort((a, b) => b.t - a.t)[0];
      if (peak) {
        parts.push(`Pico clínico más alto: ${peak.code} (T=${peak.t}).`);
      }
    }

    if (elevated.length > 0) {
      parts.push(`Escalas muy elevadas (T≥70): ${fmtList(elevated)}.`);
    }
    if (high.length > 0) {
      parts.push(`Escalas en rango alto (T 60–69): ${fmtList(high)}.`);
    }
    if (low.length > 0) {
      parts.push(`Escalas bajas (T≤39): ${fmtList(low)} — pueden indicar rasgos opuestos a los medidos por la escala.`);
    }
    if (elevated.length === 0 && high.length === 0 && low.length === 0 && groupName !== 'Validez') {
      parts.push('Ninguna escala del grupo presenta desviaciones clínicamente significativas (todas en rango modal 40–59).');
    }
    if (online.length > 0) {
      parts.push(`Escalas marcadas ES-ONLINE (requieren TEAcorrige): ${online.map(s => s.code).join(', ')}.`);
    }
    return parts.join(' ');
  },

  /* ---------- Clinical configurations ---------- */
  _detectConfigs(results) {
    const t = code => {
      const r = results[code];
      return (r && typeof r.t === 'number') ? r.t : null;
    };
    const configs = [];
    const Hs = t('Hs'), D = t('D'), Hy = t('Hy'), Pd = t('Pd'), Pa = t('Pa'),
          Sc = t('Sc'), Ma = t('Ma'), L = t('L'), F = t('F'), K = t('K');

    if (Hs != null && Hy != null && D != null && Hs >= 65 && Hy >= 65 && D < 60) {
      configs.push({ name: 'V de conversión',
        desc: 'Hs≥65, Hy≥65, D<60. Configuración típica de trastorno de conversión somática: el paciente somatiza sin depresión subyacente evidente.' });
    }
    if (F != null && L != null && K != null && F > 70 && L < 50 && K < 50) {
      configs.push({ name: 'Grito de ayuda',
        desc: 'F>70, L<50, K<50. Perfil compatible con pedido de ayuda o posible exageración de síntomas; conviene contrastar con entrevista clínica.' });
    }
    if (Pd != null && Ma != null && Pd >= 65 && Ma >= 65) {
      configs.push({ name: 'Configuración 4-9 (trastorno del carácter)',
        desc: 'Pd≥65, Ma≥65. Configuración característica de acting-out, impulsividad e inestabilidad afectiva.' });
    }
    if (Pa != null && Sc != null && Pa >= 65 && Sc >= 65) {
      configs.push({ name: 'V psicótica / Valle paranoide',
        desc: 'Pa≥65, Sc≥65. Configuración psicótica paranoide; valorar ideación paranoide y desorganización del pensamiento.' });
    }
    if (L != null && K != null && F != null && L > 60 && K > 60 && F < 50) {
      configs.push({ name: 'Defensivo cerrado',
        desc: 'L>60, K>60, F<50. Perfil defensivo: el evaluado minimiza problemas; las elevaciones clínicas pueden estar enmascaradas.' });
    }
    return configs;
  },

  _renderConfigs(configs) {
    if (!configs || !configs.length) {
      return '<p style="color:var(--color-text-muted);font-style:italic">No se detectan configuraciones clásicas del MMPI-2 en este perfil.</p>';
    }
    return configs.map(c => `
      <div style="padding:10px 14px;margin-bottom:8px;background:var(--color-bg);border-left:4px solid var(--color-primary);border-radius:var(--radius-sm)">
        <div style="font-weight:600;color:var(--color-primary-dark);margin-bottom:4px">${this._esc(c.name)}</div>
        <div style="font-size:13px;line-height:1.5">${this._esc(c.desc)}</div>
      </div>
    `).join('');
  },

  /* ---------- F-K index ---------- */
  _renderFKIndex(results) {
    const f = results.F, k = results.K;
    if (!f || !k || typeof f.t !== 'number' || typeof k.t !== 'number') {
      return '<p style="color:var(--color-text-muted);font-style:italic">No se puede calcular el índice F−K: faltan datos T de F o K (posiblemente marcadas como ES-ONLINE).</p>';
    }
    const diff = f.t - k.t;
    let interp;
    if (diff <= -11) {
      interp = 'F−K ≤ −11: postura defensiva ("fake good"). Las puntuaciones clínicas pueden estar artificialmente bajas; revise la impresión de validez del protocolo.';
    } else if (diff >= 11) {
      interp = 'F−K ≥ +11: grito de ayuda o posible exageración de síntomas ("fake bad"). Conviene contrastar con otras fuentes de información.';
    } else {
      interp = 'F−K entre −10 y +10: en rango normal. La persona ni exagera ni minimiza significativamente la sintomatología.';
    }
    const sign = diff > 0 ? '+' : '';
    return `
      <div style="font-size:14px;line-height:1.6">
        <div style="margin-bottom:10px">
          <strong>F(T)</strong> = ${f.t} &nbsp; | &nbsp;
          <strong>K(T)</strong> = ${k.t} &nbsp; | &nbsp;
          <strong>F − K</strong> = <span style="font-size:16px;color:var(--color-primary-dark)">${sign}${diff}</span>
        </div>
        <div style="padding:10px 14px;background:var(--color-bg);border-left:4px solid var(--color-primary);border-radius:var(--radius-sm);font-size:13px">
          ${this._esc(interp)}
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--color-text-muted)">
          El índice F−K se calcula sobre puntuaciones T (no sobre PD brutas). Los puntos de corte clásicos (±11) son orientativos.
        </div>
      </div>
    `;
  },

  /* ---------- Recommendations ---------- */
  _renderRecommendations(results, configs) {
    const t = code => {
      const r = results[code];
      return (r && typeof r.t === 'number') ? r.t : null;
    };
    const recs = [];
    const L = t('L'), F = t('F'), K = t('K');

    // Validez
    if ((L != null && L > 65) || (K != null && K > 65) || (F != null && F > 80)) {
      recs.push('Revisar la validez del protocolo antes de interpretar las puntuaciones clínicas. Considerar reevaluación si L o K están muy elevados, o si F está muy elevado sin corroboración clínica.');
    }

    // Clínicas básicas
    const clinCodes = ['Hs','D','Hy','Pd','Pa','Pt','Sc','Ma','Si'];
    const elevatedClin = clinCodes.filter(c => t(c) != null && t(c) >= 70);
    if (elevatedClin.length >= 2) {
      recs.push(`Realizar entrevista clínica estructurada para esclarecer las elevaciones en las escalas clínicas ${elevatedClin.join(', ')}. Valorar criterios diagnósticos DSM-5 / CIE-11.`);
    } else if (elevatedClin.length === 1) {
      recs.push(`Explorar en entrevista el área correspondiente a la escala elevada (${elevatedClin[0]}) con instrumentos específicos.`);
    }

    // Configuraciones detectadas
    if (configs.some(c => c.name === 'V de conversión')) {
      recs.push('Descartar primero causa orgánica en presencia de la configuración V de conversión; valorar derivación a salud mental con foco en somatización.');
    }
    if (configs.some(c => c.name === 'V psicótica / Valle paranoide')) {
      recs.push('Valoración urgente por psiquiatría para descartar trastorno psicótico; considerar entrevista con familiares y evaluación de riesgo.');
    }
    if (configs.some(c => c.name === 'Configuración 4-9 (trastorno del carácter)')) {
      recs.push('Abordaje terapéutico cognitivo-conductual o dialéctico-conductual; valorar riesgo de impulsividad y consumo de sustancias.');
    }
    if (configs.some(c => c.name === 'Grito de ayuda')) {
      recs.push('Indagar el contexto vital actual; valorar riesgo autolesivo y nivel de apoyo social y familiar.');
    }
    if (configs.some(c => c.name === 'Defensivo cerrado')) {
      recs.push('Interpretar las puntuaciones con cautela: el perfil defensivo puede estar minimizando la psicopatología. Considerar reevaluación o aplicar escalas de validez adicionales.');
    }

    // Contenido
    if (t('DEP') != null && t('DEP') >= 65 || (t('D') != null && t('D') >= 70)) {
      recs.push('Valorar síntomas depresivos y riesgo suicida con escalas específicas (p. ej. BDI-II, BPRS) y exploración clínica dirigida.');
    }
    if (t('ANX') != null && t('ANX') >= 65) {
      recs.push('Valorar síntomas ansiosos con escalas específicas (p. ej. BAI, STAI) y descartar trastorno de ansiedad generalizada.');
    }
    if (t('BIZ') != null && t('BIZ') >= 70) {
      recs.push('BIZ elevada: explorar pensamiento psicótico o disociativo en entrevista; valorar alcance y frecuencia de las experiencias extrañas.');
    }
    if (t('ASP') != null && t('ASP') >= 65) {
      recs.push('ASP elevada: valorar conducta antisocial y posible trastorno disocial o antisocial de la personalidad.');
    }
    if (t('TRT') != null && t('TRT') >= 65) {
      recs.push('TRT elevada: el paciente muestra indicadores negativos de tratamiento. Trabajar la alianza terapéutica y las expectativas antes de iniciar intervenciones.');
    }

    // Adicciones
    const macR = t('MAC-R'), aas = t('AAS'), aps = t('APS');
    if ((macR != null && macR >= 65) || (aas != null && aas >= 60) || (aps != null && aps >= 65)) {
      recs.push('Valorar consumo de sustancias con AUDIT/CAGE-AID y entrevista motivacional; considerar derivación a adicciones.');
    }

    // Defecto
    if (recs.length === 0) {
      recs.push('Perfil dentro de límites no patológicos. Complementar con entrevista clínica y antecedentes para emitir juicio profesional definitivo.');
    }

    recs.push('Este informe es una herramienta de apoyo y no sustituye el juicio clínico del profesional evaluador.');

    return recs.map(r => `<li style="margin-bottom:6px">${this._esc(r)}</li>`).join('');
  },

  /* ---------- Charts ---------- */
  _chartContainerHTML(canvasId, title) {
    return `
      <div class="chart-container">
        <h4 style="margin-bottom:8px;color:var(--color-primary-dark)">${this._esc(title)}</h4>
        <div style="position:relative;height:300px;width:100%">
          <canvas id="${canvasId}"></canvas>
        </div>
      </div>
    `;
  },

  _renderCharts() {
    if (!window.Chart) { console.warn('Chart.js no disponible'); return; }
    this._destroyCharts();

    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) return;
    const R = cur.results;

    const cfgs = [
      { id: 'chart-basic',    codes: this._BASIC_CODES   },
      { id: 'chart-content',  codes: this._CONTENT_CODES },
      { id: 'chart-supp',     codes: this._SUPP_CODES    },
      { id: 'chart-sub',      codes: this._SUB_CODES     },
    ];

    this._charts = cfgs.map(c => this._makeLineChart(c.id, c.codes, R)).filter(Boolean);

    // Comparison chart (si hay MMPI-2 anterior)
    const p = cur.patient || {};
    if (p.previousMMPI) {
      const cmp = this._makeComparisonChart('chart-compare', this._COMPARE_CODES, R, p.previousMMPI);
      if (cmp) this._charts.push(cmp);
    }
  },

  _makeComparisonChart(canvasId, codes, results, prevText) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const prevMap = this._parsePreviousMMPI(prevText);
    if (Object.keys(prevMap).length === 0) return null;

    const curT = codes.map(code => {
      const s = results[code];
      return (s && typeof s.t === 'number') ? s.t : null;
    });
    const prevT = codes.map(code => (prevMap[code] != null) ? prevMap[code] : null);

    const ref = val => codes.map(() => val);

    const config = {
      type: 'line',
      data: {
        labels: codes.slice(),
        datasets: [
          {
            label: 'T actual',
            data: curT,
            borderColor: '#1F3864',
            backgroundColor: 'rgba(31, 56, 100, 0.1)',
            pointBackgroundColor: '#1F3864',
            pointRadius: 5,
            borderWidth: 2,
            fill: false,
            tension: 0,
            spanGaps: false,
          },
          {
            label: 'T anterior',
            data: prevT,
            borderColor: '#9CA3AF',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            pointBackgroundColor: '#9CA3AF',
            pointStyle: 'rectRot',
            pointRadius: 5,
            borderWidth: 2,
            borderDash: [6, 4],
            fill: false,
            tension: 0,
            spanGaps: false,
          },
          {
            label: 'T=65 (corte clínico)',
            data: ref(65),
            borderColor: '#C00000',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { font: { size: 11 }, boxWidth: 12, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: (ctx2) => `${ctx2.dataset.label}: ${ctx2.parsed.y}`,
            },
          },
        },
        scales: {
          y: {
            min: 30, max: 90,
            ticks: { stepSize: 10, font: { size: 10 }, color: '#6B7280' },
            grid: { color: '#E5E7EB' },
            title: { display: true, text: 'Puntuación T', font: { size: 11 }, color: '#1F2937' },
          },
          x: {
            ticks: { font: { size: 11 }, color: '#1F2937' },
            grid: { display: false },
          },
        },
      },
    };

    try { return new Chart(ctx.getContext('2d'), config); }
    catch (e) { console.warn('No se pudo crear el gráfico de comparación', e); return null; }
  },

  _makeLineChart(canvasId, codes, results) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // T values; null for scales without numeric T (skip in line)
    const tValues = codes.map(code => {
      const s = results[code];
      if (!s) return null;
      return (typeof s.t === 'number') ? s.t : null;
    });
    const labels = codes.slice();

    const ref = val => codes.map(() => val);

    const config = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'T',
            data: tValues,
            borderColor: '#1F3864',
            backgroundColor: 'rgba(31, 56, 100, 0.1)',
            pointBackgroundColor: '#1F3864',
            pointBorderColor: '#1F3864',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2,
            fill: false,
            tension: 0,
            spanGaps: false,
          },
          {
            label: 'T=50 (Media)',
            data: ref(50),
            borderColor: '#999999',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0,
          },
          {
            label: 'T=65 (Corte clínico)',
            data: ref(65),
            borderColor: '#C00000',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { font: { size: 10 }, boxWidth: 12, padding: 8 },
          },
          tooltip: {
            callbacks: {
              label: (ctx2) => `${ctx2.dataset.label}: ${ctx2.parsed.y}`,
            },
          },
        },
        scales: {
          y: {
            min: 30,
            max: 90,
            ticks: { stepSize: 10, font: { size: 10 }, color: '#6B7280' },
            grid: { color: '#E5E7EB' },
            title: { display: true, text: 'Puntuación T', font: { size: 11 }, color: '#1F2937' },
          },
          x: {
            ticks: { font: { size: 9 }, color: '#1F2937', maxRotation: 45, minRotation: 45 },
            grid: { display: false },
          },
        },
      },
    };

    try {
      return new Chart(ctx.getContext('2d'), config);
    } catch (e) {
      console.warn('No se pudo crear el gráfico', canvasId, e);
      return null;
    }
  },

  _destroyCharts() {
    for (const c of this._charts) { try { c.destroy(); } catch (e) {} }
    this._charts = [];
  },

  _captureChartImgs() {
    const imgs = [];
    for (let i = 0; i < this._CHART_IDS.length; i++) {
      const cv = document.getElementById(this._CHART_IDS[i]);
      if (!cv) continue;
      try { imgs.push({ title: this._CHART_TITLES[i], dataURL: cv.toDataURL('image/png') }); } catch (e) {}
    }
    return imgs;
  },

  /* ---------- Exports ---------- */
  _withCaseContext(fn) {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.results) { window.toast('No hay resultados para exportar', 'error'); return; }
    const ev = Storage.getEvaluator() || {};
    const caseWithCharts = Object.assign({}, cur, { charts: this._captureChartImgs() });
    fn(caseWithCharts, ev);
  },

  _exportHTML() {
    this._withCaseContext((c, ev) => {
      try {
        window.Export.exportHTML(c, ev);
        window.toast('Informe HTML descargado', 'success');
      } catch (e) { window.toast('Error: ' + e.message, 'error'); }
    });
  },

  _exportWord() {
    this._withCaseContext(async (c, ev) => {
      try {
        await window.Export.exportWord(c, ev);
        window.toast('Informe Word descargado', 'success');
      } catch (e) { window.toast('Error: ' + e.message, 'error'); }
    });
  },

  _exportExcel() {
    this._withCaseContext((c, ev) => {
      try {
        window.Export.exportExcel(c, ev);
        window.toast('Informe Excel descargado', 'success');
      } catch (e) { window.toast('Error: ' + e.message, 'error'); }
    });
  },

  _exportJSON() {
    this._withCaseContext((c, ev) => {
      try {
        const data = Storage.exportCase(c.id);
        window.Export.exportJSON(data, `MMPI2_caso_${this._safeName(c.patient?.name)}.json`);
        window.toast('Caso JSON descargado', 'success');
      } catch (e) { window.toast('Error: ' + e.message, 'error'); }
    });
  },

  /* ---------- Baremo switcher: recalcular T al cambiar país ---------- */
  async _recalcCountry(newCountry) {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.responses || !cur.patient) {
      window.toast('No hay caso activo para recalcular', 'error');
      return;
    }
    if (!window.MMPI2) { window.toast('Motor MMPI-2 no disponible', 'error'); return; }
    const country = newCountry === 'ES' ? 'ES' : 'US';
    const countryLabel = country === 'US' ? 'EE. UU. (Minnesota)' : 'España (TEA Ediciones)';
    try {
      window.toast('Recalculando resultados…', 'info');
      const results = await MMPI2.computeAll(cur.responses, cur.patient.sex, country);
      const narrative = MMPI2.buildNarrative(results, cur.patient.name, cur.patient.age, cur.patient.sex, country);
      cur.results = results;
      cur.narrative = narrative;
      cur.patient.country = country;
      cur.updatedAt = new Date().toISOString();
      Storage.saveCase(cur);
      Storage.setCurrentCase(cur);
      window.toast(`Baremo cambiado a ${countryLabel}. Resultados recalculados.`, 'success');
      // Re-render entire report
      setTimeout(() => App.navigate('report'), 200);
    } catch (e) {
      console.error('Error al recalcular baremo:', e);
      window.toast('Error al recalcular: ' + e.message, 'error');
    }
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
    const country = p.country || (window.MMPI2 ? MMPI2.getCountry() : 'ES');
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
    const country = p.country || (window.MMPI2 ? MMPI2.getCountry() : 'ES');
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

  /* ---------- Sección de comparación con MMPI-2 anterior ---------- */
  _renderComparisonSection(results, prevText) {
    const prevMap = this._parsePreviousMMPI(prevText);
    const codes = Object.keys(prevMap);
    if (!codes.length) return '';

    const rows = codes.map(code => {
      const prevT = prevMap[code];
      const cur = results[code];
      const curT = (cur && typeof cur.t === 'number') ? cur.t : null;
      const delta = (curT != null) ? (curT - prevT) : null;
      let deltaClass = 'delta-stable';
      let deltaStr = '—';
      if (delta != null) {
        const abs = Math.abs(delta);
        if (abs >= 10) deltaClass = delta > 0 ? 'delta-worse' : 'delta-better';
        else if (abs >= 5) deltaClass = delta > 0 ? 'delta-slight-worse' : 'delta-slight-better';
        deltaStr = (delta > 0 ? '+' : '') + delta;
      }
      const curStr = (curT == null) ? '—' : String(curT);
      return `<tr>
        <td style="font-weight:600">${this._esc(code)}</td>
        <td class="center">${this._esc(cur ? (cur.name || '—') : '—')}</td>
        <td class="center">${prevT}</td>
        <td class="center">${curStr}</td>
        <td class="center ${deltaClass}">${deltaStr}</td>
      </tr>`;
    }).join('');

    // Calcular estadísticas de cambio
    const changes = codes.map(c => {
      const cur = results[c];
      const curT = (cur && typeof cur.t === 'number') ? cur.t : null;
      return (curT != null) ? (curT - prevMap[c]) : null;
    }).filter(v => v != null);
    const improved = changes.filter(d => d <= -10).length;
    const worsened = changes.filter(d => d >= 10).length;
    const stable = changes.length - improved - worsened;

    return `
      <div class="card">
        <div class="card-header"><h3>Comparación con MMPI-2 anterior</h3></div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--color-text-muted);margin:0 0 12px">
            Evolución del perfil entre la aplicación previa aportada por el evaluador y la actual.
            Cambio (Δ) = T actual − T anterior. Δ ≥ +10 empeoramiento · Δ ≤ −10 mejora · |Δ| &lt; 10 estable.
          </p>
          <div class="table-container">
            <table class="data-table">
              <thead><tr>
                <th>Código</th><th>Escala</th>
                <th class="center">T anterior</th>
                <th class="center">T actual</th>
                <th class="center">Cambio (Δ)</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="padding:12px 20px;border-top:1px solid var(--color-border);background:var(--color-bg);font-size:13px;line-height:1.55">
            <strong style="color:var(--color-primary-dark)">Resumen de cambios:</strong>
            <span>${improved} escala(s) mejorada(s) (Δ ≤ −10) · ${stable} estable(s) · ${worsened} empeorada(s) (Δ ≥ +10).</span>
          </div>
        </div>
      </div>
      <style>
        .delta-better { color: #15803D; font-weight: 700; }
        .delta-worse { color: #C00000; font-weight: 700; }
        .delta-slight-better { color: #16A34A; }
        .delta-slight-worse { color: #D97706; }
        .delta-stable { color: #6B7280; }
      </style>
    `;
  },

  /* ---------- Tabla exhaustiva de Análisis de Resultados ---------- */
  _renderAnalysisTable(results, prevText) {
    const prevMap = prevText ? this._parsePreviousMMPI(prevText) : {};
    const hasPrev = Object.keys(prevMap).length > 0;
    const totalCols = hasPrev ? 9 : 8;
    const groupOrder = ['Validez', 'Clínicas', 'Contenido', 'Suplementarias', 'Subescalas'];
    const groupTitles = {
      Validez: 'Escalas de Validez',
      Clínicas: 'Escalas Clínicas Básicas',
      Contenido: 'Escalas de Contenido',
      Suplementarias: 'Escalas Suplementarias',
      Subescalas: 'Subescalas Harris-Lingoes',
    };

    const groups = this._groupScales(results);

    const groupSections = groupOrder.map(gName => {
      const scales = groups[gName] || [];
      if (!scales.length) return '';
      // Ordenar por código dentro del grupo (copia local para no mutar el original)
      const sorted = scales.slice().sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      const rows = sorted.map(s => {
        const tNum = typeof s.t === 'number';
        const tDisplay = tNum ? s.t : (s.t == null ? '—' : 'N/D');
        const pdDisplay = (s.pd != null) ? s.pd : '—';
        const pdKDisplay = s.pdk ? (s.pdK != null ? s.pdK : '—') : '—';
        const band = s.band ? s.band.label : '—';
        const level = s.band ? s.band.level : null;
        // Color de celda T
        let tCellClass = '';
        if (level === 5) tCellClass = 't-very-high-bg';
        else if (level === 4) tCellClass = 't-high-bg';
        else if (level === 3) tCellClass = 't-mod-high-bg';
        else if (level === 2) tCellClass = 't-modal-bg';
        else if (level === 1) tCellClass = 't-low-bg';

        // Cambio vs previo (solo si hay prevMap)
        let deltaCell = '';
        if (hasPrev) {
          if (prevMap[s.code] != null && tNum) {
            const delta = s.t - prevMap[s.code];
            let cls = 'delta-stable';
            const abs = Math.abs(delta);
            if (abs >= 10) cls = delta > 0 ? 'delta-worse' : 'delta-better';
            else if (abs >= 5) cls = delta > 0 ? 'delta-slight-worse' : 'delta-slight-better';
            const sign = delta > 0 ? '+' : '';
            deltaCell = `<td class="center ${cls}">${sign}${delta}</td>`;
          } else {
            deltaCell = '<td class="center" style="color:var(--color-text-muted)">—</td>';
          }
        }

        return `<tr>
          <td style="font-weight:600">${this._esc(s.code)}</td>
          <td>${this._esc(s.name)}</td>
          <td class="center">${pdDisplay}</td>
          <td class="center">${pdKDisplay}</td>
          <td class="center ${tCellClass}" style="font-weight:700">${tDisplay}</td>
          <td class="center">${this._esc(band)}</td>
          <td class="center">${level != null ? this._levelLabel(level) : '—'}</td>
          <td style="font-size:12px">${this._esc(s.interpretation || '')}</td>
          ${deltaCell}
        </tr>`;
      }).join('');

      // Resumen por grupo
      const veryHigh = sorted.filter(s => s.band && s.band.level === 5).length;
      const high     = sorted.filter(s => s.band && s.band.level === 4).length;
      const modHigh  = sorted.filter(s => s.band && s.band.level === 3).length;
      const modal    = sorted.filter(s => s.band && s.band.level === 2).length;
      const low      = sorted.filter(s => s.band && s.band.level === 1).length;
      const online   = sorted.filter(s => s.status === 'ES-ONLINE').length;
      const sinDatos  = sorted.filter(s => !s.band).length;
      const lastColSpan = hasPrev ? 2 : 3;

      const summary = `<tr style="background:var(--color-bg);font-weight:700">
        <td colspan="4" style="text-align:right">Resumen del grupo «${gName}» (${sorted.length} escalas):</td>
        <td class="center">↑${veryHigh}</td>
        <td class="center">↑${high}</td>
        <td class="center">→${modal}</td>
        <td colspan="${lastColSpan}" style="font-size:12px">
          ↓${low} · PS+${modHigh} · N/D ${sinDatos}${online ? ' · TEAcorrige: ' + online : ''}
        </td>
      </tr>`;

      return `
        <tr class="group-header"><td colspan="${totalCols}">${this._esc(groupTitles[gName])}</td></tr>
        ${rows}
        ${summary}
      `;
    }).join('');

    return `
      <style>
        .analysis-table th, .analysis-table td { font-size: 12px; padding: 4px 8px; }
        .analysis-table .group-header td { background: var(--color-primary-dark); color: #fff; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 11px; padding: 6px 8px; }
        .analysis-table .t-very-high-bg { background: #FEE2E2; color: #991B1B; }
        .analysis-table .t-high-bg { background: #FED7AA; color: #9A3412; }
        .analysis-table .t-mod-high-bg { background: #FEF3C7; color: #92400E; }
        .analysis-table .t-modal-bg { background: #DCFCE7; color: #166534; }
        .analysis-table .t-low-bg { background: #DBEAFE; color: #1E40AF; }
        .analysis-table .delta-better { color: #15803D; font-weight: 700; }
        .analysis-table .delta-worse { color: #C00000; font-weight: 700; }
        .analysis-table .delta-slight-better { color: #16A34A; }
        .analysis-table .delta-slight-worse { color: #D97706; }
        .analysis-table .delta-stable { color: #6B7280; }
      </style>
      <div class="card">
        <div class="card-header"><h3>Análisis de Resultados</h3></div>
        <div class="card-body" style="padding:0">
          <div class="table-container">
            <table class="data-table analysis-table">
              <thead><tr>
                <th>Código</th><th>Escala</th>
                <th class="center">PD</th><th class="center">PD+K</th>
                <th class="center">T</th><th class="center">Banda</th>
                <th class="center">Nivel</th><th>Interpretación</th>
                ${hasPrev ? '<th class="center">Δ vs previo</th>' : ''}
              </tr></thead>
              <tbody>${groupSections}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  _levelLabel(level) {
    switch (level) {
      case 5: return 'Muy alto';
      case 4: return 'Alto';
      case 3: return 'PS';
      case 2: return 'Modal';
      case 1: return 'Bajo';
      default: return '—';
    }
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

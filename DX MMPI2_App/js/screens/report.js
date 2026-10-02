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

          <!-- Export bar -->
          <div class="card no-print">
            <div class="card-body flex gap-8" style="flex-wrap:wrap;align-items:center">
              <span style="font-weight:600;color:var(--color-primary-dark);margin-right:8px">Exportar:</span>
              <button class="btn btn-secondary btn-sm" id="exp-html">HTML</button>
              <button class="btn btn-secondary btn-sm" id="exp-word">Word</button>
              <button class="btn btn-secondary btn-sm" id="exp-excel">Excel</button>
              <button class="btn btn-secondary btn-sm" id="exp-json">JSON</button>
              <button class="btn btn-primary btn-sm" id="exp-print" style="margin-left:auto">Imprimir / PDF</button>
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
            </div>
          </div>

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

    bindEvent('ai-copy-prompt', 'click', () => this._copyAIPrompt());
    bindEvent('ai-generate', 'click', () => this._generateAIReport());
    bindEvent('ai-clear', 'click', () => this._clearAIReport());

    // Restore previously-generated AI report if it exists
    const cur2 = Storage.getCurrentCase();
    if (cur2 && cur2.aiReport) {
      const out = document.getElementById('ai-report-output');
      if (out) {
        try { out.innerHTML = this._renderAIReport(cur2.aiReport); }
        catch (e) { console.warn('No se pudo restaurar el informe IA:', e); }
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
              placeholder='{"titulo":"INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2","secciones":[{"titulo":"1. Motivo y objetivo de la evaluación","contenido":"..."}, ...]}'></textarea>
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
      window.toast('El JSON no tiene la estructura esperada (falta el arreglo "secciones")', 'error');
      return;
    }
    if (parsed.secciones.length === 0) {
      window.toast('El JSON no contiene secciones', 'error');
      return;
    }

    const out = document.getElementById('ai-report-output');
    if (!out) { window.toast('No se encuentra el contenedor del informe', 'error'); return; }
    out.innerHTML = this._renderAIReport(parsed);

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
    const out = document.getElementById('ai-report-output');
    if (out) out.innerHTML = '';
    window.toast('Informe IA limpio', 'info');
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
    const titulo = parsed.titulo || 'INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2';
    const cur = Storage.getCurrentCase() || {};
    const p = cur.patient || {};
    const ev = Storage.getEvaluator() || {};
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const sectionsHTML = (parsed.secciones || []).map((sec, idx) => {
      const secTitle = this._esc(sec.titulo || ('Sección ' + (idx + 1)));
      const secBody = this._esc(sec.contenido || '');
      // Detectar párrafos por doble salto de línea o nueva línea
      const paragraphs = secBody
        .split(/\n{2,}|\r\n{2,}/)
        .map(par => par.trim())
        .filter(Boolean);
      const bodyHTML = paragraphs.length > 1
        ? paragraphs.map(par => `<p style="margin:0 0 10px;line-height:1.6;text-align:justify">${par.replace(/\n/g, '<br>')}</p>`).join('')
        : `<p style="margin:0;line-height:1.6;text-align:justify">${secBody.replace(/\n/g, '<br>')}</p>`;
      return `
        <section class="ai-report-section">
          <h2 class="ai-report-section-title">${secTitle}</h2>
          <div class="ai-report-section-body">${bodyHTML}</div>
        </section>
      `;
    }).join('');

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
          max-width: 540px;
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
        .ai-report-section-body { padding-left: 14px; font-family: Georgia, serif; }
        .ai-report-section-body p { text-align: justify; }
        .ai-report-footer {
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px solid var(--color-border);
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #6B7280;
          text-align: center;
        }
        .ai-report-footer .signature-line {
          margin-top: 32px;
          padding-top: 4px;
          border-top: 1px solid #1F2937;
          width: 220px;
          margin-left: auto;
          margin-right: auto;
          font-size: 11px;
          color: #1F2937;
        }
        @media print {
          .ai-report-doc { box-shadow: none; border: none; padding: 24px; }
        }
      </style>
      <div class="card">
        <div class="card-header no-print" style="display:flex;justify-content:space-between;align-items:center;background:var(--color-bg)">
          <h3 style="color:var(--color-primary-dark)">Informe contextualizado generado por IA</h3>
          <button class="btn btn-primary btn-sm no-print" onclick="window.print()">Imprimir / PDF</button>
        </div>
        <div class="card-body" style="padding:16px">
          <div class="ai-report-doc">
            <header class="ai-report-header">
              <h1>${this._esc(titulo)}</h1>
              <div class="ai-report-meta">
                <div><span>Evaluado</span>${this._esc(p.name || '—')}</div>
                <div><span>Edad</span>${p.age != null ? p.age + ' años' : '—'}</div>
                <div><span>Sexo</span>${p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Varón' : '—')}</div>
                <div><span>Documento</span>${this._esc(p.document || '—')}</div>
                <div><span>Fecha de aplicación</span>${this._fmtDate(p.applicationDate)}</div>
                <div><span>Contexto</span>${this._esc(p.context || '—')}</div>
              </div>
            </header>
            ${sectionsHTML}
            <footer class="ai-report-footer">
              <div>Documento generado con apoyo de IA externa a partir de los resultados del MMPI-2.</div>
              <div>Fecha de emisión: ${today}</div>
              <div class="signature-line">
                ${this._esc(ev.name || 'Evaluador/a')}
                <div style="font-size:10px;color:#6B7280;margin-top:2px">
                  ${this._esc(ev.license || '')}${ev.license && ev.registry ? ' · ' : ''}${this._esc(ev.registry || '')}
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    `;
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

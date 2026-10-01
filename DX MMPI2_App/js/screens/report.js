/* ============================================
   Report screen — informe completo
   - Datos paciente y evaluador (con firma)
   - Narrativa automática
   - Tablas por grupo (Validez, Clínicas, Contenido, Suplementarias, Subescalas)
   - 4 gráficos Chart.js con líneas T=50 y T=65
   - Exportar HTML / Word / Excel / JSON
   ============================================ */

const Report = {
  _charts: [],   // Chart.js instances
  _chartImgs: [], // {title, dataURL} capturadas para export

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
    const narrative = cur.narrative || (window.MMPI2 ? MMPI2.buildNarrative(cur.results, p.name, p.age, p.sex) : '');

    const groups = this._groupScales(cur.results);

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
                <div class="report-info-item"><div class="report-info-label">Contexto</div><div class="report-info-value">${this._esc(p.context || '—')}</div></div>
                <div class="report-info-item"><div class="report-info-label">Fecha de aplicación</div><div class="report-info-value">${this._fmtDate(p.applicationDate)}</div></div>
                <div class="report-info-item"><div class="report-info-label">Modalidad</div><div class="report-info-value">${this._esc(cur.captureMode || '—')}</div></div>
              </div>
              ${p.history ? `<div class="report-info-item" style="margin-top:8px"><div class="report-info-label">Antecedentes</div><div class="report-info-value" style="white-space:pre-wrap">${this._esc(p.history)}</div></div>` : ''}
              ${p.reason ? `<div class="report-info-item" style="margin-top:8px"><div class="report-info-label">Motivo de evaluación</div><div class="report-info-value" style="white-space:pre-wrap">${this._esc(p.reason)}</div></div>` : ''}
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

          <!-- Tablas por grupo -->
          ${this._renderTable(groups['Validez'], 'Escalas de Validez')}
          ${this._renderTable(groups['Clínicas'], 'Escalas Clínicas Básicas')}
          ${this._renderTable(groups['Contenido'], 'Escalas de Contenido')}
          ${this._renderTable(groups['Suplementarias'], 'Escalas Suplementarias')}
          ${this._renderTable(groups['Subescalas'], 'Subescalas Harris-Lingoes')}

          <!-- Gráficos -->
          <div class="card">
            <div class="card-header"><h3>Gráficos del perfil</h3></div>
            <div class="card-body">
              <div class="chart-container">
                <h4 style="margin-bottom:8px;color:var(--color-primary-dark)">Perfil básico (Validez + Clínicas)</h4>
                <canvas id="chart-basic" height="220"></canvas>
              </div>
              <div class="chart-container">
                <h4 style="margin-bottom:8px;color:var(--color-primary-dark)">Perfil de Contenido</h4>
                <canvas id="chart-content" height="220"></canvas>
              </div>
              <div class="chart-container">
                <h4 style="margin-bottom:8px;color:var(--color-primary-dark)">Perfil Suplementario</h4>
                <canvas id="chart-supp" height="220"></canvas>
              </div>
              <div class="chart-container">
                <h4 style="margin-bottom:8px;color:var(--color-primary-dark)">Harris-Lingoes (subescalas)</h4>
                <canvas id="chart-sub" height="260"></canvas>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body" style="font-size:12px;color:var(--color-text-muted)">
              Informe generado el ${new Date().toLocaleString('es-ES')}. Baremos españoles (4.ª ed. 2019).
              Las escalas marcadas ES-ONLINE requieren TEAcorrige para la conversión PD→T.
            </div>
          </div>

        </div>
      </div>
    `;
  },

  mount() {
    document.getElementById('ham-btn').addEventListener('click', () => App.openMenu());
    document.getElementById('rpt-back').addEventListener('click', () => App.navigate('dashboard'));
    document.getElementById('rpt-edit').addEventListener('click', () => App.navigate('case'));
    document.getElementById('rpt-recapture').addEventListener('click', () => {
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

    document.getElementById('exp-html').addEventListener('click', () => this._exportHTML());
    document.getElementById('exp-word').addEventListener('click', () => this._exportWord());
    document.getElementById('exp-excel').addEventListener('click', () => this._exportExcel());
    document.getElementById('exp-json').addEventListener('click', () => this._exportJSON());
    document.getElementById('exp-print').addEventListener('click', () => window.print());

    this._renderCharts();
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

  /* ---------- Table ---------- */
  _renderTable(scales, title) {
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
        </div>
      </div>
    `;
  },

  /* ---------- Charts ---------- */
  _renderCharts() {
    if (!window.Chart) { console.warn('Chart.js no disponible'); return; }
    this._destroyCharts();

    const cur = Storage.getCurrentCase();
    const groups = this._groupScales(cur.results);

    const baseOpts = (yMax = 90) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v == null || typeof v !== 'number') return 'N/D';
              return `T = ${v}`;
            },
          },
        },
      },
      scales: {
        y: {
          min: 30, max: yMax,
          ticks: { stepSize: 10, color: '#6B7280' },
          grid: { color: '#E5E7EB' },
        },
        x: { ticks: { color: '#1F2937', font: { size: 10 } }, grid: { display: false } },
      },
      elements: { line: { tension: 0.25 }, point: { radius: 3, hoverRadius: 5 } },
    });

    const linePlugin = {
      id: 'tLines',
      afterDraw: (chart) => {
        const { ctx, chartArea: ca, scales: { y } } = chart;
        if (!ca) return;
        const drawLine = (tval, color) => {
          const yp = y.getPixelForValue(tval);
          ctx.save();
          ctx.strokeStyle = color;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ca.left, yp); ctx.lineTo(ca.right, yp); ctx.stroke();
          ctx.fillStyle = color;
          ctx.font = '10px sans-serif';
          ctx.fillText('T=' + tval, ca.left + 4, yp - 3);
          ctx.restore();
        };
        drawLine(50, '#9CA3AF');
        drawLine(65, '#ED7D31');
      },
    };

    const makeChart = (canvasId, scales, color, yMax) => {
      const labels = scales.map(s => s.code);
      const data = scales.map(s => (typeof s.t === 'number' ? s.t : null));
      const bgColors = scales.map(s => s.band ? this._bandHex(s.band.level) : color);
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;
      return new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'T',
            data,
            backgroundColor: bgColors,
            borderColor: bgColors,
            borderWidth: 1,
            borderRadius: 3,
          }],
        },
        options: baseOpts(yMax),
        plugins: [linePlugin],
      });
    };

    const basic = [].concat(groups['Validez'] || [], groups['Clínicas'] || []);
    const content = groups['Contenido'] || [];
    const supp = groups['Suplementarias'] || [];
    const sub = groups['Subescalas'] || [];

    this._charts = [
      makeChart('chart-basic', basic, '#2F5496', 100),
      makeChart('chart-content', content, '#548235', 100),
      makeChart('chart-supp', supp, '#4472C4', 100),
      makeChart('chart-sub', sub, '#7E57C2', 110),
    ].filter(Boolean);
  },

  _destroyCharts() {
    for (const c of this._charts) { try { c.destroy(); } catch (e) {} }
    this._charts = [];
  },

  _captureChartImgs() {
    const titles = [
      'Perfil básico (Validez + Clínicas)',
      'Perfil de Contenido',
      'Perfil Suplementario',
      'Harris-Lingoes (subescalas)',
    ];
    const ids = ['chart-basic', 'chart-content', 'chart-supp', 'chart-sub'];
    const imgs = [];
    for (let i = 0; i < ids.length; i++) {
      const cv = document.getElementById(ids[i]);
      if (!cv) continue;
      try { imgs.push({ title: titles[i], dataURL: cv.toDataURL('image/png') }); } catch (e) {}
    }
    return imgs;
  },

  _bandHex(level) {
    switch (level) {
      case 5: return '#C00000';
      case 4: return '#ED7D31';
      case 3: return '#FFC000';
      case 1: return '#2F5496';
      default: return '#4472C4';
    }
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

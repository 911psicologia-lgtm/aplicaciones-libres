/* ============================================
   Export module — Exportar informe MMPI-2
   - HTML standalone (con CSS + imágenes base64)
   - Word (.docx) usando docx.js
   - Excel (.xlsx) usando SheetJS
   - JSON (caso o completo)
   ============================================ */

const Export = {

  /* ---------- Utils ---------- */
  _download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  _safeName(name) {
    return (name || 'caso').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]/g, '').trim().replace(/\s+/g, '_');
  },

  _fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) { return iso; }
  },

  /* ---------- Group scales ---------- */
  _groupScales(results) {
    const groups = { Validez: [], Clínicas: [], Contenido: [], Suplementarias: [], Subescalas: [] };
    for (const r of Object.values(results)) {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    }
    return groups;
  },

  /* ---------- Export JSON ---------- */
  exportJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    this._download(blob, filename || 'export.json');
  },

  /* ---------- Export HTML ---------- */
  exportHTML(caseData, evaluator) {
    const patient = caseData.patient || {};
    const results = caseData.results || {};
    const narrative = caseData.narrative || (window.MMPI2 ? window.MMPI2.buildNarrative(results, patient.name, patient.age, patient.sex) : '');
    const groups = this._groupScales(results);
    const sigData = evaluator?.signature || '';

    const tableFor = (scales, groupName) => {
      if (!scales || !scales.length) return '';
      const rows = scales.map(s => {
        const tDisplay = (typeof s.t === 'number') ? s.t : (s.t ?? '—');
        const pdDisplay = (s.pd ?? '—');
        const pdKDisplay = s.pdk && (s.pdK !== null && s.pdK !== undefined && s.pdK !== s.pd) ? s.pdK : (s.pdk ? s.pdK : '—');
        const band = s.band ? s.band.label : '—';
        const bandColor = s.band ? this._bandHex(s.band.level) : '#666';
        return `<tr>
          <td style="font-weight:600">${this._esc(s.code)}</td>
          <td>${this._esc(s.name)}</td>
          <td style="text-align:center">${pdDisplay}</td>
          <td style="text-align:center">${pdKDisplay}</td>
          <td style="text-align:center;font-weight:700;color:${bandColor}">${tDisplay}</td>
          <td style="text-align:center;color:${bandColor}">${this._esc(band)}</td>
          <td style="font-size:11px">${this._esc(s.interpretation || '')}</td>
        </tr>`;
      }).join('');
      return `<h3 style="color:#1F3864;border-bottom:2px solid #2F5496;padding-bottom:6px;margin:18px 0 8px">${this._esc(groupName)}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:12px">
        <thead><tr style="background:#2F5496;color:#fff">
          <th style="padding:6px;text-align:left">Código</th>
          <th style="padding:6px;text-align:left">Escala</th>
          <th style="padding:6px">PD</th>
          <th style="padding:6px">PD+K</th>
          <th style="padding:6px">T</th>
          <th style="padding:6px">Banda</th>
          <th style="padding:6px;text-align:left">Interpretación</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        </table>`;
    };

    const chartsHTML = (caseData.charts || []).map((c, i) => {
      return `<div style="margin:16px 0">
        <h4 style="color:#1F3864;margin-bottom:6px">${this._esc(c.title)}</h4>
        <img src="${c.dataURL}" alt="${this._esc(c.title)}" style="max-width:100%;border:1px solid #ccc;border-radius:8px"/>
      </div>`;
    }).join('');

    const sigHTML = sigData
      ? `<img src="${sigData}" alt="firma" style="max-height:80px"/>`
      : '<em>Sin firma registrada</em>';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe MMPI-2 — ${this._esc(patient.name || 'Paciente')}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color:#1F2937; max-width:1000px; margin:0 auto; padding:32px; line-height:1.5; }
  h1 { color:#1F3864; font-size:24px; border-bottom:3px solid #2F5496; padding-bottom:8px; }
  h2 { color:#1F3864; font-size:18px; margin-top:24px; }
  .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:12px 0; }
  .meta-item { background:#F5F7FA; padding:10px 14px; border-radius:6px; }
  .meta-label { font-size:11px; color:#6B7280; text-transform:uppercase; font-weight:600; }
  .meta-value { font-size:14px; margin-top:2px; }
  .narrative { background:#F5F7FA; border-left:4px solid #2F5496; padding:14px 18px; border-radius:6px; margin:16px 0; font-size:14px; }
  .footer { margin-top:40px; padding-top:16px; border-top:1px solid #ccc; font-size:12px; color:#6B7280; }
  table { page-break-inside: avoid; }
</style>
</head>
<body>
  <h1>Informe MMPI-2</h1>

  <h2>Datos del paciente</h2>
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">Nombre</div><div class="meta-value">${this._esc(patient.name || '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Documento</div><div class="meta-value">${this._esc(patient.document || '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Fecha nacimiento</div><div class="meta-value">${this._fmtDate(patient.dob)}</div></div>
    <div class="meta-item"><div class="meta-label">Edad</div><div class="meta-value">${patient.age || '—'}</div></div>
    <div class="meta-item"><div class="meta-label">Sexo</div><div class="meta-value">${patient.sex === 'M' ? 'Mujer' : (patient.sex === 'H' ? 'Hombre' : '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Contexto</div><div class="meta-value">${this._esc(patient.context || '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Fecha de aplicación</div><div class="meta-value">${this._fmtDate(patient.applicationDate)}</div></div>
    <div class="meta-item"><div class="meta-label">Modalidad</div><div class="meta-value">${this._esc(caseData.captureMode || '—')}</div></div>
  </div>
  ${patient.history ? `<div class="meta-item" style="margin:8px 0"><div class="meta-label">Antecedentes</div><div class="meta-value" style="white-space:pre-wrap">${this._esc(patient.history)}</div></div>` : ''}
  ${patient.reason ? `<div class="meta-item" style="margin:8px 0"><div class="meta-label">Motivo de evaluación</div><div class="meta-value" style="white-space:pre-wrap">${this._esc(patient.reason)}</div></div>` : ''}

  <h2>Evalúa</h2>
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">Nombre</div><div class="meta-value">${this._esc(evaluator?.name || '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Tarjeta profesional</div><div class="meta-value">${this._esc(evaluator?.license || '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Registro</div><div class="meta-value">${this._esc(evaluator?.registry || '—')}</div></div>
    <div class="meta-item"><div class="meta-label">Correo</div><div class="meta-value">${this._esc(evaluator?.email || '—')}</div></div>
  </div>
  <div style="margin-top:24px">
    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;font-weight:600">Firma</div>
    <div style="margin-top:4px">${sigHTML}</div>
    <div style="border-top:1px solid #1F3864;width:280px;margin-top:4px"></div>
  </div>

  <h2>Síntesis interpretativa</h2>
  <div class="narrative">${this._esc(narrative)}</div>

  ${tableFor(groups['Validez'], 'Escalas de Validez')}
  ${tableFor(groups['Clínicas'], 'Escalas Clínicas Básicas')}
  ${tableFor(groups['Contenido'], 'Escalas de Contenido')}
  ${tableFor(groups['Suplementarias'], 'Escalas Suplementarias')}
  ${tableFor(groups['Subescalas'], 'Subescalas Harris-Lingoes')}

  <h2>Gráficos del perfil</h2>
  ${chartsHTML}

  <div class="footer">
    Informe generado por MMPI-2 App el ${new Date().toLocaleString('es-ES')}<br>
    Baremos españoles (4.ª ed. 2019). Los valores marcados ES-ONLINE requieren TEAcorrige.
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    this._download(blob, `Informe_MMPI2_${this._safeName(patient.name)}.html`);
  },

  _bandHex(level) {
    switch (level) {
      case 5: return '#C00000';
      case 4: return '#ED7D31';
      case 3: return '#FFC000';
      case 1: return '#2F5496';
      default: return '#1F2937';
    }
  },

  _esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /* ---------- Export Word (.docx) ---------- */
  async exportWord(caseData, evaluator) {
    if (!window.docx) throw new Error('docx.js no disponible');
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      Table, TableRow, TableCell, WidthType, AlignmentType,
      ImageRun, BorderStyle,
    } = window.docx;

    const patient = caseData.patient || {};
    const results = caseData.results || {};
    const narrative = caseData.narrative || (window.MMPI2 ? window.MMPI2.buildNarrative(results, patient.name, patient.age, patient.sex) : '');
    const groups = this._groupScales(results);

    const children = [];

    // Header
    children.push(new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: 'Informe MMPI-2', bold: true, color: '1F3864' })],
    }));

    // Patient section
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Datos del paciente', color: '1F3864' })],
    }));
    const metaTableRows = [
      ['Nombre', patient.name || '—'],
      ['Documento', patient.document || '—'],
      ['Fecha de nacimiento', this._fmtDate(patient.dob)],
      ['Edad', String(patient.age || '—')],
      ['Sexo', patient.sex === 'M' ? 'Mujer' : (patient.sex === 'H' ? 'Hombre' : '—')],
      ['Contexto', patient.context || '—'],
      ['Fecha de aplicación', this._fmtDate(patient.applicationDate)],
      ['Modalidad', caseData.captureMode || '—'],
    ];
    children.push(this._buildMetaTable(metaTableRows, { Table, TableRow, TableCell, WidthType, BorderStyle }));

    if (patient.history) {
      children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Antecedentes:', bold: true })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: patient.history })] }));
    }
    if (patient.reason) {
      children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Motivo de evaluación:', bold: true })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: patient.reason })] }));
    }

    // Evaluator section
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240 },
      children: [new TextRun({ text: 'Evalúa', color: '1F3864' })],
    }));
    const evalRows = [
      ['Nombre', evaluator?.name || '—'],
      ['Tarjeta profesional', evaluator?.license || '—'],
      ['Registro profesional', evaluator?.registry || '—'],
      ['Correo', evaluator?.email || '—'],
      ['Teléfono', evaluator?.phone || '—'],
      ['Dirección', evaluator?.address || '—'],
    ];
    children.push(this._buildMetaTable(evalRows, { Table, TableRow, TableCell, WidthType, BorderStyle }));

    // Signature image
    if (evaluator?.signature) {
      try {
        const sigBuffer = await this._dataURLToUint8Array(evaluator.signature);
        children.push(new Paragraph({
          spacing: { before: 120 },
          children: [new ImageRun({
            data: sigBuffer,
            transformation: { width: 200, height: 70 },
          })],
        }));
        children.push(new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F3864' } },
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: ' ' })],
        }));
      } catch (e) {
        console.warn('No se pudo incrustar la firma:', e);
      }
    }

    // Narrative
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240 },
      children: [new TextRun({ text: 'Síntesis interpretativa', color: '1F3864' })],
    }));
    children.push(new Paragraph({ children: [new TextRun({ text: narrative })] }));

    // Scale tables
    const groupOrder = ['Validez', 'Clínicas', 'Contenido', 'Suplementarias', 'Subescalas'];
    for (const g of groupOrder) {
      const scales = groups[g] || [];
      if (!scales.length) continue;
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240 },
        children: [new TextRun({ text: `Escalas — ${g}`, color: '1F3864' })],
      }));
      const headerCells = ['Código', 'Escala', 'PD', 'PD+K', 'T', 'Banda', 'Interpretación'].map(t =>
        new TableCell({
          shading: { fill: '2F5496' },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF' })] })],
        })
      );
      const rows = [new TableRow({ children: headerCells })];
      for (const s of scales) {
        const tDisplay = (typeof s.t === 'number') ? String(s.t) : (s.t == null ? '—' : String(s.t));
        const pdDisplay = String(s.pd ?? '—');
        const pdKDisplay = s.pdk ? (s.pdK != null ? String(s.pdK) : '—') : '—';
        const bandLabel = s.band ? s.band.label : '—';
        const cells = [
          s.code, s.name, pdDisplay, pdKDisplay, tDisplay, bandLabel, s.interpretation || '',
        ].map(t => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(t), size: 18 })] })],
        }));
        rows.push(new TableRow({ children: cells }));
      }
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows,
      }));
    }

    // Charts (as images)
    if (caseData.charts && caseData.charts.length) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240 },
        children: [new TextRun({ text: 'Gráficos del perfil', color: '1F3864' })],
      }));
      for (const c of caseData.charts) {
        try {
          const buf = await this._dataURLToUint8Array(c.dataURL);
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 120 },
            children: [new TextRun({ text: c.title })],
          }));
          children.push(new Paragraph({
            children: [new ImageRun({
              data: buf,
              transformation: { width: 580, height: 280 },
            })],
          }));
        } catch (e) {
          console.warn('No se pudo incrustar el gráfico:', e);
        }
      }
    }

    // Footer
    children.push(new Paragraph({
      spacing: { before: 240 },
      children: [new TextRun({
        text: `Informe generado por MMPI-2 App el ${new Date().toLocaleString('es-ES')}`,
        italics: true, size: 18, color: '6B7280',
      })],
    }));

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    this._download(blob, `Informe_MMPI2_${this._safeName(patient.name)}.docx`);
  },

  _buildMetaTable(rows, { Table, TableRow, TableCell, WidthType, BorderStyle }) {
    const { Paragraph, TextRun } = window.docx; // corrección: antes no se recibían y el Word fallaba
    const trows = rows.map(([k, v]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: { fill: 'F5F7FA' },
          children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })],
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: v })] })],
        }),
      ],
    }));
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: trows,
    });
  },

  async _dataURLToUint8Array(dataURL) {
    const base64 = dataURL.split(',')[1];
    const bin = atob(base64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  },

  /* ---------- Export Excel ---------- */
  exportExcel(caseData, evaluator) {
    if (!window.XLSX) throw new Error('SheetJS no disponible');
    const patient = caseData.patient || {};
    const results = caseData.results || {};
    const narrative = caseData.narrative || (window.MMPI2 ? window.MMPI2.buildNarrative(results, patient.name, patient.age, patient.sex) : '');
    const groups = this._groupScales(results);
    const wb = XLSX.utils.book_new();

    // Sheet 1: Datos
    const datos = [
      ['INFORME MMPI-2'],
      ['Generado:', new Date().toLocaleString('es-ES')],
      [],
      ['DATOS DEL PACIENTE'],
      ['Nombre', patient.name || ''],
      ['Documento', patient.document || ''],
      ['Fecha de nacimiento', this._fmtDate(patient.dob)],
      ['Edad', patient.age || ''],
      ['Sexo', patient.sex === 'M' ? 'Mujer' : (patient.sex === 'H' ? 'Hombre' : '')],
      ['Contexto', patient.context || ''],
      ['Fecha de aplicación', this._fmtDate(patient.applicationDate)],
      ['Modalidad', caseData.captureMode || ''],
      [],
      ['ANTECEDENTES'],
      [patient.history || ''],
      [],
      ['MOTIVO DE EVALUACIÓN'],
      [patient.reason || ''],
      [],
      ['EVALUADOR'],
      ['Nombre', evaluator?.name || ''],
      ['Tarjeta profesional', evaluator?.license || ''],
      ['Registro profesional', evaluator?.registry || ''],
      ['Correo', evaluator?.email || ''],
      ['Teléfono', evaluator?.phone || ''],
      ['Dirección', evaluator?.address || ''],
      [],
      ['SÍNTESIS INTERPRETATIVA'],
      [narrative],
    ];
    const wsDatos = XLSX.utils.aoa_to_sheet(datos);
    wsDatos['!cols'] = [{ wch: 32 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsDatos, 'Informe');

    // Sheet 2: Puntuaciones
    const head = ['Grupo', 'Código', 'Escala', 'PD', 'PD+K', 'T', 'Banda', 'Interpretación'];
    const body = [head];
    const groupOrder = ['Validez', 'Clínicas', 'Contenido', 'Suplementarias', 'Subescalas'];
    for (const g of groupOrder) {
      for (const s of (groups[g] || [])) {
        const tDisplay = (typeof s.t === 'number') ? s.t : (s.t == null ? '' : s.t);
        const pdKDisplay = s.pdk ? (s.pdK != null ? s.pdK : '') : '';
        body.push([
          s.group, s.code, s.name, s.pd ?? '', pdKDisplay, tDisplay,
          s.band ? s.band.label : '', s.interpretation || '',
        ]);
      }
    }
    const wsScores = XLSX.utils.aoa_to_sheet(body);
    wsScores['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 36 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 28 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsScores, 'Puntuaciones');

    // Sheet 3: Respuestas (si existen)
    if (caseData.responses && caseData.responses.length) {
      const respHead = [['Ítem', 'Respuesta (1=V, 2=F)']];
      const respBody = respHead.concat(
        caseData.responses.map((r, i) => [i + 1, r == null ? '' : r])
      );
      const wsResp = XLSX.utils.aoa_to_sheet(respBody);
      wsResp['!cols'] = [{ wch: 8 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsResp, 'Respuestas');
    }

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this._download(blob, `Informe_MMPI2_${this._safeName(patient.name)}.xlsx`);
  },

  /* ---------- Capture chart images from Chart.js canvases ---------- */
  captureCharts(containerEl) {
    const charts = [];
    if (!containerEl) return charts;
    const canvases = containerEl.querySelectorAll('canvas');
    canvases.forEach((cv, i) => {
      try {
        const dataURL = cv.toDataURL('image/png');
        const titleEl = cv.closest('.chart-container')?.querySelector('h3, h4, .chart-title');
        charts.push({
          title: titleEl ? titleEl.textContent.trim() : `Gráfico ${i + 1}`,
          dataURL,
        });
      } catch (e) {
        console.warn('No se pudo capturar canvas:', e);
      }
    });
    return charts;
  },

  /* ============================================
     EXPORTS del informe IA (JSON devuelto por IA externa)
     - HTML standalone con estilo pericial
     - Word (.docx) con docx.js
     - Excel (.xlsx) con SheetJS
     - JSON del propio objeto IA
     ============================================ */

  /* ---------- Export AI Report: HTML (AI-PROMPT-V2 con bloques) ----------
     chartImages (opcional): [{ key, figura, titulo, dataURL }]
       si se pasa, los bloques `grafico` se renderizan como <img> en vez de tabla. */
  /* Mapa {figura -> imagen} a partir de la lista de imágenes del informe IA */
  _aiImgMap(chartImages) {
    const m = {};
    (chartImages || []).forEach(ci => { if (ci && ci.figura != null) m[ci.figura] = ci; });
    return m;
  },

  /* V4: el informe IA se exporta con el mismo motor que el informe principal */
  exportAIReportHTML(parsed, caseData, evaluator, chartImages) {
    const model = window.ReportModel.fromAI(parsed, caseData, evaluator);
    const html = window.ReportRender.toStandaloneHTML(model, this._aiImgMap(chartImages));
    this._download(new Blob([html], { type: 'text/html;charset=utf-8' }), `Informe_IA_MMPI2_${this._safeName(caseData.patient && caseData.patient.name)}.html`);
  },

  async exportAIReportWord(parsed, caseData, evaluator, chartImages) {
    const model = window.ReportModel.fromAI(parsed, caseData, evaluator);
    const blob = await window.ReportRender.toDocx(model, this._aiImgMap(chartImages));
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(caseData.patient && caseData.patient.name)}.docx`);
  },

  async exportAIReportPDF(parsed, caseData, evaluator, chartImages) {
    const model = window.ReportModel.fromAI(parsed, caseData, evaluator);
    const blob = await window.ReportRender.toPDF(model, this._aiImgMap(chartImages));
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(caseData.patient && caseData.patient.name)}.pdf`);
  },

  /* (versión anterior conservada como respaldo) */
  exportAIReportHTML_legacy(parsed, caseData, evaluator, chartImages) {
    const imgsByFig = {};
    if (Array.isArray(chartImages)) {
      for (const ci of chartImages) {
        if (ci && ci.figura != null) imgsByFig[ci.figura] = ci;
      }
    }
    const titulo = parsed.titulo || 'INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2';
    const meta = parsed.metadatos || {};
    const p = caseData.patient || {};
    const ev = evaluator || {};
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const metaNombre    = meta.evaluado        || p.name || '—';
    const metaEdad      = meta.edad            || (p.age != null ? p.age + ' años' : '—');
    const metaSexo      = meta.sexo            || (p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Varón' : '—'));
    const metaDocumento = meta.documento       || p.document || '—';
    const metaFechaApp  = meta.fecha_aplicacion|| this._fmtDate(p.applicationDate) || '—';
    const metaContexto  = meta.contexto        || p.context || '—';
    const metaEvaluador = meta.evaluador       || ev.name || '—';
    const metaFechaInf  = meta.fecha_informe   || today;

    const sectionsHTML = (parsed.secciones || []).map((sec, idx) => {
      const secNumero = (sec.numero != null) ? sec.numero : (idx + 1);
      const secTitulo = sec.titulo || ('Sección ' + secNumero);
      let bodyHTML = '';
      const bloques = Array.isArray(sec.bloques) ? sec.bloques : [];
      if (bloques.length === 0 && typeof sec.contenido === 'string' && sec.contenido.trim()) {
        bloques.push({ tipo: 'parrafo', contenido: sec.contenido });
      }
      bodyHTML = bloques.map(b => this._aiBlockToHTML(b, imgsByFig)).join('');
      return `<section style="margin-bottom:22px;page-break-inside:avoid">
        <h2 style="font-size:16px;font-weight:700;color:#1F3864;border-left:4px solid #2F5496;padding-left:10px;margin-bottom:10px">${secNumero}. ${this._esc(secTitulo)}</h2>
        <div style="padding-left:14px">${bodyHTML}</div>
      </section>`;
    }).join('');

    const refsHTML = (parsed.referencias && Array.isArray(parsed.referencias) && parsed.referencias.length)
      ? `<section style="margin-top:24px;border-top:1px solid #ccc;padding-top:12px">
          <h2 style="font-size:14px;color:#1F3864;margin-bottom:8px">Referencias</h2>
          <ol style="margin:0;padding-left:22px;font-size:12px;line-height:1.6">
            ${parsed.referencias.map(r => `<li style="margin-bottom:4px">${this._esc(typeof r === 'string' ? r : JSON.stringify(r))}</li>`).join('')}
          </ol>
        </section>`
      : '';

    const firma = parsed.firma || {};
    const sigHTML = ev.signature
      ? `<img src="${ev.signature}" alt="firma" style="max-height:80px"/>`
      : '';
    const firmaNombre    = firma.nombre    || ev.name || 'Evaluador/a';
    const firmaProfesion = firma.profesion || 'Psicólogo/a';
    const firmaRegistro  = firma.registro  || ev.registry || '';
    const firmaInstitucion = firma.institucion || ev.institution || '';
    const firmaExtras = [firma.direccion || ev.address, firma.correo || ev.email, firma.telefono || ev.phone].filter(Boolean);

    const firmaHTML = `<div style="text-align:center;margin-top:24px">
      ${sigHTML}
      <div style="margin:16px auto 0;padding-top:4px;border-top:1px solid #1F2937;width:260px;font-size:12px;color:#1F2937">
        <strong>${this._esc(firmaNombre)}</strong>
        <div style="font-size:10px;color:#6B7280;margin-top:2px">${this._esc(firmaProfesion)}${firmaRegistro ? ' · ' + this._esc(firmaRegistro) : ''}</div>
        ${firmaInstitucion ? `<div style="font-size:10px;color:#6B7280">${this._esc(firmaInstitucion)}</div>` : ''}
        ${firmaExtras.length ? `<div style="font-size:10px;color:#6B7280">${firmaExtras.map(s => this._esc(s)).join(' · ')}</div>` : ''}
      </div>
    </div>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${this._esc(titulo)} — ${this._esc(p.name || 'Evaluado')}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color:#1F2937; max-width:980px; margin:0 auto; padding:48px 56px; line-height:1.65; background:#fff; }
  h1 { color:#1F3864; font-size:22px; font-weight:700; letter-spacing:1px; text-align:center; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; font-family:Arial,sans-serif; font-size:11px; color:#4B5563; max-width:600px; margin:10px auto 0; text-align:left; }
  .meta div span { display:block; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; font-size:9px; }
  header.head { text-align:center; border-bottom:3px double #1F3864; padding-bottom:18px; margin-bottom:24px; }
  footer { margin-top:28px; padding-top:14px; border-top:1px solid #ccc; font-family:Arial,sans-serif; font-size:11px; color:#6B7280; text-align:center; }
  .ai-tabla { width:100%; border-collapse:collapse; font-family:Arial,sans-serif; font-size:11px; margin:6px 0 12px; }
  .ai-tabla thead th { background:#1F3864; color:#fff; padding:6px 8px; text-align:left; border:1px solid #1F3864; }
  .ai-tabla tbody td { padding:5px 8px; border:1px solid #D1D5DB; vertical-align:top; }
  .ai-tabla tbody tr:nth-child(even) td { background:#F9FAFB; }
  .ai-tabla-titulo { font-size:12px; font-weight:700; color:#1F3864; margin-bottom:4px; font-family:Arial,sans-serif; }
  .ai-grafico-wrap { margin:10px 0 16px; page-break-inside:avoid; }
  .ai-grafico-figura { font-size:11px; font-weight:700; color:#1F3864; text-transform:uppercase; letter-spacing:0.5px; font-family:Arial,sans-serif; }
  .ai-grafico-titulo { font-size:12px; font-weight:600; color:#1F2937; margin-bottom:4px; font-family:Arial,sans-serif; }
  .ai-grafico-note { font-size:10px; color:#6B7280; font-style:italic; margin-bottom:4px; }
  .ai-lista-wrap { margin:6px 0 12px; }
  .ai-lista-titulo { font-size:12px; font-weight:700; color:#1F3864; margin-bottom:4px; font-family:Arial,sans-serif; }
  ul.ai-lista, ol.ai-lista { margin:0; padding-left:22px; }
  ul.ai-lista li, ol.ai-lista li { margin-bottom:4px; line-height:1.55; }
  @media print { body { padding:24px; } }
</style>
</head>
<body>
  <header class="head">
    <h1>${this._esc(titulo)}</h1>
    <div class="meta">
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
  <footer>
    <div>Fecha de emisión: ${this._esc(metaFechaInf)}</div>
    ${firmaHTML}
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.html`);
  },

  /* ---------- Helpers de render de bloques IA a HTML ----------
     _imgsByFig: mapa { figura_num -> {dataURL, titulo} } opcional. */
  _aiBlockToHTML(block, _imgsByFig) {
    if (!block || typeof block !== 'object') return '';
    const tipo = (block.tipo || '').toLowerCase();
    try {
      switch (tipo) {
        case 'parrafo':     return this._aiParrafoHTML(block);
        case 'tabla':       return this._aiTablaHTML(block);
        case 'grafico':     return this._aiGraficoHTML(block, _imgsByFig);
        case 'lista':       return this._aiListaHTML(block);
        case 'referencias': return this._aiReferenciasHTML(block);
        case 'firma':       return '';
        default:
          if (block.contenido != null) return this._aiParrafoHTML(block);
          return '';
      }
    } catch (e) {
      console.warn('Error renderizando bloque IA (HTML):', e, block);
      return '';
    }
  },

  _aiParrafoHTML(block) {
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

  _aiTablaHTML(block) {
    const titulo = block.titulo || '';
    const columnas = Array.isArray(block.columnas) ? block.columnas : [];
    const filas = Array.isArray(block.filas) ? block.filas : [];
    if (!columnas.length && !filas.length) return '';
    const head = columnas.length
      ? `<thead><tr>${columnas.map(c => `<th style="background:#1F3864;color:#fff;padding:6px 8px;text-align:left;border:1px solid #1F3864">${this._esc(c)}</th>`).join('')}</tr></thead>`
      : '';
    const body = filas.map(row => {
      const cells = Array.isArray(row) ? row : [row];
      return `<tr>${cells.map(c => `<td style="padding:5px 8px;border:1px solid #D1D5DB;vertical-align:top">${this._esc(c == null ? '' : String(c))}</td>`).join('')}</tr>`;
    }).join('');
    return `<div style="margin:8px 0 14px;page-break-inside:avoid">
      ${titulo ? `<div class="ai-tabla-titulo">${this._esc(titulo)}</div>` : ''}
      <table class="ai-tabla">${head}<tbody>${body}</tbody></table>
    </div>`;
  },

  _aiGraficoHTML(block, imgsByFig) {
    const figura = (block.figura != null) ? ('Figura ' + block.figura) : '';
    const figuraNum = (block.figura != null) ? block.figura : null;
    const titulo = block.titulo || '';
    const series = Array.isArray(block.series) ? block.series : [];
    const ejeY = block.eje_y || {};

    // ---- Imagen embebida si está disponible ----
    const img = (imgsByFig && figuraNum != null) ? imgsByFig[figuraNum] : null;
    let imgHTML = '';
    if (img && img.dataURL) {
      imgHTML = `<figure style="margin:8px 0 4px;page-break-inside:avoid">
        <img src="${this._esc(img.dataURL)}" alt="${this._esc(titulo || figura)}" style="max-width:100%;height:auto;border:1px solid #D1D5DB;border-radius:6px">
        ${figura ? `<figcaption style="font-size:11px;color:#6B7280;margin-top:4px;text-align:center"><strong>${this._esc(figura)}.</strong> ${this._esc(titulo)}</figcaption>` : ''}
      </figure>`;
    } else if (figuraNum != null) {
      imgHTML = `<p style="color:#9CA3AF;font-style:italic;font-size:11px">[No fue posible generar la imagen de esta figura]</p>`;
    }

    // ---- Tabla de datos (fallback de accesibilidad) ----
    let tableHTML = '';
    if (series.length) {
      const labels = [];
      for (const s of series) {
        for (const pt of (s.puntos || [])) {
          if (pt && labels.indexOf(pt.x) === -1) labels.push(pt.x);
        }
      }
      const columnas = ['Escala'].concat(series.map(s => s.nombre || 'T'));
      const filas = labels.map(lbl => {
        const row = [lbl];
        for (const s of series) {
          const pt = (s.puntos || []).find(p => p.x === lbl);
          row.push(pt ? String(pt.y) : '—');
        }
        return row;
      });
      tableHTML = this._aiTablaHTML({ titulo: '', columnas, filas });
    }

    const ejeNote = (ejeY.variable && (ejeY.min != null || ejeY.max != null))
      ? `Eje Y: ${ejeY.variable} (${ejeY.min != null ? ejeY.min : 'auto'}–${ejeY.max != null ? ejeY.max : 'auto'}). Líneas de referencia: ${(block.lineas_referencia || []).join(', ') || '—'}.`
      : '';

    return `<div class="ai-grafico-wrap">
      ${figura && !img ? `<div class="ai-grafico-figura">${this._esc(figura)}</div>` : ''}
      ${titulo && !img ? `<div class="ai-grafico-titulo">${this._esc(titulo)}</div>` : ''}
      ${ejeNote ? `<div class="ai-grafico-note">${this._esc(ejeNote)}</div>` : ''}
      ${imgHTML}
      ${tableHTML ? `<div class="ai-grafico-note" style="margin-top:4px">Datos subyacentes del gráfico:</div>${tableHTML}` : ''}
    </div>`;
  },

  _aiListaHTML(block) {
    const titulo = block.titulo || '';
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';
    return `<div class="ai-lista-wrap">
      ${titulo ? `<div class="ai-lista-titulo">${this._esc(titulo)}</div>` : ''}
      <ul class="ai-lista">${items.map(it => `<li>${this._esc(typeof it === 'string' ? it : JSON.stringify(it))}</li>`).join('')}</ul>
    </div>`;
  },

  _aiReferenciasHTML(block) {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';
    return `<ol class="ai-lista">${items.map(it => `<li>${this._esc(typeof it === 'string' ? it : JSON.stringify(it))}</li>`).join('')}</ol>`;
  },

  /* ---------- Export AI Report: Word (.docx) (AI-PROMPT-V2 con bloques) ----------
     chartImages (opcional): [{ figura, titulo, dataURL }] */
  async exportAIReportWord_legacy(parsed, caseData, evaluator, chartImages) {
    if (!window.docx) throw new Error('docx.js no disponible');
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      Table, TableRow, TableCell, WidthType, AlignmentType,
      ImageRun, BorderStyle,
    } = window.docx;
    const docx = { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ImageRun };

    // Mapa figura -> dataURL
    const imgsByFig = {};
    if (Array.isArray(chartImages)) {
      for (const ci of chartImages) {
        if (ci && ci.figura != null) imgsByFig[ci.figura] = ci;
      }
    }

    const p = caseData.patient || {};
    const ev = evaluator || {};
    const meta = parsed.metadatos || {};
    const titulo = parsed.titulo || 'INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2';
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const children = [];

    children.push(new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: titulo, bold: true, color: '1F3864' })],
    }));

    const metaLines = [
      ['Evaluado',   meta.evaluado        || p.name || '—'],
      ['Edad',       meta.edad            || (p.age != null ? p.age + ' años' : '—')],
      ['Sexo',       meta.sexo            || (p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Varón' : '—'))],
      ['Documento',  meta.documento       || p.document || '—'],
      ['Fecha de aplicación', meta.fecha_aplicacion || this._fmtDate(p.applicationDate) || '—'],
      ['Contexto',   meta.contexto        || p.context || '—'],
      ['Evaluador',  meta.evaluador       || ev.name || '—'],
      ['Fecha del informe', meta.fecha_informe || today],
    ];
    for (const [k, v] of metaLines) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: k + ': ', bold: true, size: 18, color: '6B7280' }),
          new TextRun({ text: String(v), size: 18 }),
        ],
      }));
    }
    children.push(new Paragraph({
      border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: '1F3864' } },
      spacing: { after: 240 },
      children: [new TextRun({ text: ' ' })],
    }));

    // Render de cada sección con sus bloques
    for (const sec of (parsed.secciones || [])) {
      const secNumero = (sec.numero != null) ? sec.numero : '';
      const secTitulo = sec.titulo || '';
      if (secTitulo) {
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: (secNumero ? secNumero + '. ' : '') + secTitulo, color: '1F3864' })],
        }));
      }
      const bloques = Array.isArray(sec.bloques) ? sec.bloques : [];
      if (bloques.length === 0 && typeof sec.contenido === 'string' && sec.contenido.trim()) {
        bloques.push({ tipo: 'parrafo', contenido: sec.contenido });
      }
      for (const block of bloques) {
        await this._aiBlockToDocx(children, block, docx, imgsByFig);
      }
    }

    // Referencias (clave raíz)
    if (parsed.referencias && Array.isArray(parsed.referencias) && parsed.referencias.length) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: 'Referencias', color: '1F3864' })],
      }));
      for (let i = 0; i < parsed.referencias.length; i++) {
        const r = parsed.referencias[i];
        children.push(new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: (i + 1) + '. ' + (typeof r === 'string' ? r : JSON.stringify(r)), size: 18 })],
        }));
      }
    }

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 60 },
      children: [new TextRun({ text: 'Fecha de emisión: ' + today, size: 18, color: '6B7280' })],
    }));

    // Firma
    const firma = parsed.firma || {};
    if (ev.signature) {
      try {
        const sigBuffer = await this._dataURLToUint8Array(ev.signature);
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120 },
          children: [new ImageRun({
            data: sigBuffer,
            transformation: { width: 200, height: 70 },
          })],
        }));
      } catch (e) {
        console.warn('No se pudo incrustar la firma en Word IA:', e);
      }
    }
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F3864' } },
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: ' ' })],
    }));
    const firmaNombre    = firma.nombre    || ev.name || 'Evaluador/a';
    const firmaProfesion = firma.profesion || 'Psicólogo/a';
    const firmaRegistro  = firma.registro  || ev.registry || '';
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: firmaNombre, bold: true, size: 18 })],
    }));
    if (firmaProfesion || firmaRegistro) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: firmaProfesion + (firmaRegistro ? ' · ' + firmaRegistro : ''), size: 16, color: '6B7280' })],
      }));
    }
    if (firma.institucion) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: firma.institucion, size: 16, color: '6B7280' })],
      }));
    }
    const firmaExtras = [firma.direccion || ev.address, firma.correo || ev.email, firma.telefono || ev.phone].filter(Boolean);
    if (firmaExtras.length) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: firmaExtras.join(' · '), size: 16, color: '6B7280' })],
      }));
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });
    const blob = await Packer.toBlob(doc);
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.docx`);
  },

  /* ---------- Helper: render de un bloque IA a elementos docx ----------
     _imgsByFig: mapa { figura_num -> {dataURL, titulo} } opcional para gráficos. */
  async _aiBlockToDocx(children, block, docx, imgsByFig) {
    if (!block || typeof block !== 'object') return;
    const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } = docx;
    const tipo = (block.tipo || '').toLowerCase();
    try {
      if (tipo === 'parrafo' || (!tipo && block.contenido != null)) {
        const contenido = (block.contenido || '').trim();
        if (!contenido) return;
        const paragraphs = contenido.split(/\n{2,}|\r\n{2,}/).map(s => s.trim()).filter(Boolean);
        if (paragraphs.length === 0) {
          children.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [new TextRun({ text: contenido })],
          }));
        } else {
          for (const par of paragraphs) {
            children.push(new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 120 },
              children: [new TextRun({ text: par })],
            }));
          }
        }
      } else if (tipo === 'tabla') {
        const columnas = Array.isArray(block.columnas) ? block.columnas : [];
        const filas = Array.isArray(block.filas) ? block.filas : [];
        if (!columnas.length && !filas.length) return;
        if (block.titulo) {
          children.push(new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [new TextRun({ text: block.titulo, bold: true, size: 20, color: '1F3864' })],
          }));
        }
        const numCols = Math.max(columnas.length, 1);
        const colWidth = Math.floor(9000 / numCols);
        const mkCell = (text, isHeader) => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: String(text == null ? '' : text),
              bold: !!isHeader,
              size: 18,
              color: isHeader ? 'FFFFFF' : '1F2937',
            })],
          })],
          shading: isHeader ? { fill: '1F3864' } : undefined,
          width: { size: colWidth, type: WidthType.DXA },
          margins: { top: 40, bottom: 40, left: 80, right: 80 },
        });
        const rows = [];
        if (columnas.length) {
          rows.push(new TableRow({ children: columnas.map(c => mkCell(c, true)) }));
        }
        for (const row of filas) {
          const cells = Array.isArray(row) ? row.slice() : [row];
          while (cells.length < numCols) cells.push('');
          rows.push(new TableRow({ children: cells.map(c => mkCell(c, false)) }));
        }
        if (rows.length) {
          children.push(new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows,
          }));
          children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: ' ' })] }));
        }
      } else if (tipo === 'grafico') {
        const figura = (block.figura != null) ? ('Figura ' + block.figura) : '';
        const figuraNum = (block.figura != null) ? block.figura : null;
        const tituloG = block.titulo || '';
        if (figura || tituloG) {
          children.push(new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              ...(figura ? [new TextRun({ text: figura + ': ', bold: true, size: 18, color: '1F3864' })] : []),
              new TextRun({ text: tituloG, italics: true, size: 18, color: '6B7280' }),
            ],
          }));
        }
        // Si hay imagen capturada, embeberla
        let imgInserted = false;
        if (imgsByFig && figuraNum != null && imgsByFig[figuraNum] && imgsByFig[figuraNum].dataURL) {
          try {
            const buf = await this._dataURLToUint8Array(imgsByFig[figuraNum].dataURL);
            if (ImageRun) {
              children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [new ImageRun({
                  data: buf,
                  transformation: { width: 560, height: 320 },
                })],
              }));
              imgInserted = true;
            }
          } catch (e) {
            console.warn('No se pudo incrustar imagen del gráfico en Word:', e);
          }
        }
        if (!imgInserted) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: '[No fue posible generar la imagen de esta figura]', italics: true, color: '9CA3AF', size: 16 })],
          }));
        }
        // Tabla de datos subyacente (accesibilidad / fallback)
        const series = Array.isArray(block.series) ? block.series : [];
        if (series.length) {
          const labels = [];
          for (const s of series) {
            for (const pt of (s.puntos || [])) {
              if (pt && labels.indexOf(pt.x) === -1) labels.push(pt.x);
            }
          }
          const columnas = ['Escala'].concat(series.map(s => s.nombre || 'T'));
          const filas = labels.map(lbl => {
            const row = [lbl];
            for (const s of series) {
              const pt = (s.puntos || []).find(p => p.x === lbl);
              row.push(pt ? String(pt.y) : '—');
            }
            return row;
          });
          await this._aiBlockToDocx(children, { tipo: 'tabla', titulo: '', columnas, filas }, docx, imgsByFig);
        }
      } else if (tipo === 'lista') {
        if (block.titulo) {
          children.push(new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [new TextRun({ text: block.titulo, bold: true, size: 20, color: '1F3864' })],
          }));
        }
        const items = Array.isArray(block.items) ? block.items : [];
        for (const it of items) {
          children.push(new Paragraph({
            spacing: { after: 60 },
            bullet: { level: 0 },
            children: [new TextRun({ text: typeof it === 'string' ? it : JSON.stringify(it), size: 20 })],
          }));
        }
      } else if (tipo === 'referencias') {
        const items = Array.isArray(block.items) ? block.items : [];
        for (let i = 0; i < items.length; i++) {
          children.push(new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: (i + 1) + '. ' + (typeof items[i] === 'string' ? items[i] : JSON.stringify(items[i])), size: 18 })],
          }));
        }
      } else if (tipo === 'firma') {
        if (block.nombre) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: block.nombre, bold: true, size: 18 })],
          }));
        }
        if (block.profesion || block.registro) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: (block.profesion || '') + (block.registro ? ' · ' + block.registro : ''), size: 16, color: '6B7280' })],
          }));
        }
        if (block.institucion) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: block.institucion, size: 16, color: '6B7280' })],
          }));
        }
        const extras = [block.direccion, block.correo, block.telefono].filter(Boolean);
        if (extras.length) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: extras.join(' · '), size: 16, color: '6B7280' })],
          }));
        }
      }
    } catch (e) {
      console.warn('Error renderizando bloque IA (Word):', e, block);
    }
  },

  /* ---------- Export AI Report: Excel (AI-PROMPT-V2 con bloques) ---------- */
  exportAIReportExcel(parsed, caseData, evaluator) {
    if (!window.XLSX) throw new Error('SheetJS no disponible');
    const p = caseData.patient || {};
    const ev = evaluator || {};
    const meta = parsed.metadatos || {};
    const firma = parsed.firma || {};
    const wb = XLSX.utils.book_new();

    // Sheet 1: Datos del informe
    const datos = [
      ['INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2'],
      ['Generado:', new Date().toLocaleString('es-ES')],
      [],
      ['EVALUADO'],
      ['Nombre', meta.evaluado || p.name || ''],
      ['Edad', meta.edad || (p.age != null ? p.age : '')],
      ['Sexo', meta.sexo || (p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : ''))],
      ['Documento', meta.documento || p.document || ''],
      ['Fecha de aplicación', meta.fecha_aplicacion || this._fmtDate(p.applicationDate)],
      ['Contexto', meta.contexto || p.context || ''],
      ['Fecha del informe', meta.fecha_informe || ''],
      [],
      ['EVALUADOR'],
      ['Nombre', firma.nombre || ev.name || ''],
      ['Profesión', firma.profesion || ''],
      ['Registro', firma.registro || ev.registry || ''],
      ['Institución', firma.institucion || ev.institution || ''],
      ['Correo', firma.correo || ev.email || ''],
      ['Teléfono', firma.telefono || ev.phone || ''],
      [],
      ['TÍTULO DEL INFORME'],
      [parsed.titulo || ''],
      [],
      ['SECCIONES DEL INFORME'],
    ];
    for (const sec of (parsed.secciones || [])) {
      datos.push([]);
      const secNumero = (sec.numero != null) ? sec.numero : '';
      datos.push([(secNumero ? secNumero + '. ' : '') + (sec.titulo || '')]);
      const bloques = Array.isArray(sec.bloques) ? sec.bloques : [];
      if (bloques.length === 0 && typeof sec.contenido === 'string' && sec.contenido.trim()) {
        bloques.push({ tipo: 'parrafo', contenido: sec.contenido });
      }
      for (const block of bloques) {
        this._aiBlockToExcelAOA(datos, block);
      }
    }
    if (parsed.referencias && parsed.referencias.length) {
      datos.push([]);
      datos.push(['REFERENCIAS']);
      for (let i = 0; i < parsed.referencias.length; i++) {
        datos.push([(i + 1) + '.', typeof parsed.referencias[i] === 'string' ? parsed.referencias[i] : JSON.stringify(parsed.referencias[i])]);
      }
    }
    const wsDatos = XLSX.utils.aoa_to_sheet(datos);
    wsDatos['!cols'] = [{ wch: 32 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsDatos, 'Informe IA');

    // Sheet 2: Secciones (tabla indexada con tipo de bloque y resumen)
    const seccionesAOA = [['#', 'Título de sección', 'Tipo de bloque', 'Resumen']];
    (parsed.secciones || []).forEach((sec, i) => {
      const secNumero = sec.numero != null ? sec.numero : (i + 1);
      const bloques = Array.isArray(sec.bloques) ? sec.bloques : [];
      if (bloques.length === 0) {
        const resumen = (sec.contenido || '').substring(0, 200);
        seccionesAOA.push([secNumero, sec.titulo || '', 'parrafo (legacy)', resumen]);
      } else {
        bloques.forEach((b, bi) => {
          const tipo = (b.tipo || 'parrafo').toLowerCase();
          let resumen = '';
          if (tipo === 'parrafo') resumen = (b.contenido || '').substring(0, 200);
          else if (tipo === 'tabla') resumen = 'Tabla: ' + (b.titulo || '') + ' (' + (b.columnas || []).length + ' col, ' + (b.filas || []).length + ' filas)';
          else if (tipo === 'grafico') resumen = 'Figura ' + (b.figura != null ? b.figura : '?') + ': ' + (b.titulo || '') + ' [' + (b.grafico_tipo || 'linea') + ']';
          else if (tipo === 'lista') resumen = 'Lista: ' + (b.titulo || '') + ' (' + (b.items || []).length + ' items)';
          else if (tipo === 'firma') resumen = 'Firma: ' + (b.nombre || '');
          else if (tipo === 'referencias') resumen = 'Referencias (' + (b.items || []).length + ')';
          else resumen = JSON.stringify(b).substring(0, 200);
          seccionesAOA.push([bi === 0 ? secNumero : '', bi === 0 ? (sec.titulo || '') : '', tipo, resumen]);
        });
      }
    });
    const wsSec = XLSX.utils.aoa_to_sheet(seccionesAOA);
    wsSec['!cols'] = [{ wch: 5 }, { wch: 36 }, { wch: 16 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsSec, 'Secciones');

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.xlsx`);
  },

  /* ---------- Helper: render de un bloque IA a filas AOA de Excel ---------- */
  _aiBlockToExcelAOA(datos, block) {
    if (!block || typeof block !== 'object') return;
    const tipo = (block.tipo || '').toLowerCase();
    try {
      if (tipo === 'parrafo' || (!tipo && block.contenido != null)) {
        const contenido = (block.contenido || '').trim();
        if (!contenido) return;
        const paragraphs = contenido.split(/\n{2,}|\r\n{2,}/).map(s => s.trim()).filter(Boolean);
        if (paragraphs.length === 0) {
          datos.push([contenido]);
        } else {
          for (const par of paragraphs) datos.push([par]);
        }
      } else if (tipo === 'tabla') {
        const columnas = Array.isArray(block.columnas) ? block.columnas : [];
        const filas = Array.isArray(block.filas) ? block.filas : [];
        if (block.titulo) datos.push(['[Tabla]', block.titulo]);
        if (columnas.length) datos.push(columnas);
        for (const row of filas) {
          const cells = Array.isArray(row) ? row.slice() : [row];
          while (columnas.length && cells.length < columnas.length) cells.push('');
          datos.push(cells.map(c => c == null ? '' : String(c)));
        }
        datos.push([]); // separador
      } else if (tipo === 'grafico') {
        const figura = (block.figura != null) ? ('Figura ' + block.figura) : '';
        datos.push(['[Gráfico]', figura + (block.titulo ? ' — ' + block.titulo : '') + ' (' + (block.grafico_tipo || 'linea') + ')']);
        const series = Array.isArray(block.series) ? block.series : [];
        const labels = [];
        for (const s of series) {
          for (const pt of (s.puntos || [])) {
            if (pt && labels.indexOf(pt.x) === -1) labels.push(pt.x);
          }
        }
        if (labels.length) {
          datos.push(['Escala'].concat(series.map(s => s.nombre || 'T')));
          for (const lbl of labels) {
            const row = [lbl];
            for (const s of series) {
              const pt = (s.puntos || []).find(p => p.x === lbl);
              row.push(pt ? pt.y : '');
            }
            datos.push(row);
          }
        }
        datos.push([]); // separador
      } else if (tipo === 'lista') {
        if (block.titulo) datos.push(['[Lista]', block.titulo]);
        const items = Array.isArray(block.items) ? block.items : [];
        for (const it of items) {
          datos.push(['•', typeof it === 'string' ? it : JSON.stringify(it)]);
        }
        datos.push([]); // separador
      } else if (tipo === 'referencias') {
        const items = Array.isArray(block.items) ? block.items : [];
        for (let i = 0; i < items.length; i++) {
          datos.push([(i + 1) + '.', typeof items[i] === 'string' ? items[i] : JSON.stringify(items[i])]);
        }
        datos.push([]);
      } else if (tipo === 'firma') {
        datos.push(['[Firma]', '']);
        datos.push(['Nombre', block.nombre || '']);
        datos.push(['Profesión', block.profesion || '']);
        datos.push(['Registro', block.registro || '']);
        datos.push(['Institución', block.institucion || '']);
        datos.push(['Dirección', block.direccion || '']);
        datos.push(['Correo', block.correo || '']);
        datos.push(['Teléfono', block.telefono || '']);
        datos.push([]);
      }
    } catch (e) {
      console.warn('Error renderizando bloque IA (Excel):', e, block);
    }
  },

  /* ---------- Export AI Report: JSON ---------- */
  exportAIReportJSON(parsed, caseData) {
    const p = caseData.patient || {};
    const data = {
      type: 'mmpi2_ai_report',
      generatedAt: new Date().toISOString(),
      patient: { name: p.name || '', document: p.document || '' },
      report: parsed,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.json`);
  },
};

window.Export = Export;

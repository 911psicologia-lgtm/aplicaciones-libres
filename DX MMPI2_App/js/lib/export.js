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

  /* ---------- Export AI Report: HTML ---------- */
  exportAIReportHTML(parsed, caseData, evaluator) {
    const titulo = parsed.titulo || 'INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2';
    const p = caseData.patient || {};
    const ev = evaluator || {};
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const sections = (parsed.secciones || []).map((sec, idx) => {
      const secTitle = this._esc(sec.titulo || ('Sección ' + (idx + 1)));
      const body = this._esc(sec.contenido || '');
      const paragraphs = body.split(/\n{2,}|\r\n{2,}/).map(s => s.trim()).filter(Boolean);
      const bodyHTML = paragraphs.length > 1
        ? paragraphs.map(par => `<p style="margin:0 0 10px;line-height:1.6;text-align:justify">${par.replace(/\n/g, '<br>')}</p>`).join('')
        : `<p style="margin:0;line-height:1.6;text-align:justify">${body.replace(/\n/g, '<br>')}</p>`;
      return `<section style="margin-bottom:22px;page-break-inside:avoid">
        <h2 style="font-size:16px;font-weight:700;color:#1F3864;border-left:4px solid #2F5496;padding-left:10px;margin-bottom:10px">${secTitle}</h2>
        <div style="padding-left:14px">${bodyHTML}</div>
      </section>`;
    }).join('');

    const sigHTML = ev.signature
      ? `<img src="${ev.signature}" alt="firma" style="max-height:80px"/>`
      : '<em>Sin firma registrada</em>';

    const refsHTML = (parsed.referencias && Array.isArray(parsed.referencias) && parsed.referencias.length)
      ? `<section style="margin-top:24px;border-top:1px solid #ccc;padding-top:12px">
          <h2 style="font-size:14px;color:#1F3864;margin-bottom:8px">Referencias</h2>
          <ul style="margin:0;padding-left:20px;font-size:12px;line-height:1.6">
            ${parsed.referencias.map(r => `<li>${this._esc(typeof r === 'string' ? r : JSON.stringify(r))}</li>`).join('')}
          </ul>
        </section>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${this._esc(titulo)} — ${this._esc(p.name || 'Evaluado')}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color:#1F2937; max-width:980px; margin:0 auto; padding:48px 56px; line-height:1.65; background:#fff; }
  h1 { color:#1F3864; font-size:22px; font-weight:700; letter-spacing:1px; text-align:center; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; font-family:Arial,sans-serif; font-size:11px; color:#4B5563; max-width:540px; margin:10px auto 0; text-align:left; }
  .meta div span { display:block; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; font-size:9px; }
  header.head { text-align:center; border-bottom:3px double #1F3864; padding-bottom:18px; margin-bottom:24px; }
  footer { margin-top:28px; padding-top:14px; border-top:1px solid #ccc; font-family:Arial,sans-serif; font-size:11px; color:#6B7280; text-align:center; }
  footer .sig-line { margin:32px auto 0; padding-top:4px; border-top:1px solid #1F2937; width:220px; font-size:11px; color:#1F2937; }
  @media print { body { padding:24px; } }
</style>
</head>
<body>
  <header class="head">
    <h1>${this._esc(titulo)}</h1>
    <div class="meta">
      <div><span>Evaluado</span>${this._esc(p.name || '—')}</div>
      <div><span>Edad</span>${p.age != null ? p.age + ' años' : '—'}</div>
      <div><span>Sexo</span>${p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Varón' : '—')}</div>
      <div><span>Documento</span>${this._esc(p.document || '—')}</div>
      <div><span>Fecha de aplicación</span>${this._fmtDate(p.applicationDate)}</div>
      <div><span>Contexto</span>${this._esc(p.context || '—')}</div>
    </div>
  </header>
  ${sections}
  ${refsHTML}
  <footer>
    <div>Fecha de emisión: ${today}</div>
    <div class="sig-line">
      ${this._esc(ev.name || 'Evaluador/a')}
      <div style="font-size:10px;color:#6B7280;margin-top:2px">
        ${this._esc(ev.license || '')}${ev.license && ev.registry ? ' · ' : ''}${this._esc(ev.registry || '')}
      </div>
    </div>
    <div style="margin-top:8px">${sigHTML}</div>
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.html`);
  },

  /* ---------- Export AI Report: Word (.docx) ---------- */
  async exportAIReportWord(parsed, caseData, evaluator) {
    if (!window.docx) throw new Error('docx.js no disponible');
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, ImageRun, BorderStyle,
    } = window.docx;
    const p = caseData.patient || {};
    const ev = evaluator || {};
    const titulo = parsed.titulo || 'INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2';
    const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const children = [];

    children.push(new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: titulo, bold: true, color: '1F3864' })],
    }));

    const metaLines = [
      ['Evaluado', p.name || '—'],
      ['Edad', p.age != null ? p.age + ' años' : '—'],
      ['Sexo', p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Varón' : '—')],
      ['Documento', p.document || '—'],
      ['Fecha de aplicación', this._fmtDate(p.applicationDate)],
      ['Contexto', p.context || '—'],
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

    for (const sec of (parsed.secciones || [])) {
      const secTitle = sec.titulo || '';
      const body = sec.contenido || '';
      if (secTitle) {
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: secTitle, color: '1F3864' })],
        }));
      }
      const paragraphs = body.split(/\n{2,}|\r\n{2,}/).map(s => s.trim()).filter(Boolean);
      if (paragraphs.length === 0) {
        children.push(new Paragraph({ children: [new TextRun({ text: body })] }));
      } else {
        for (const par of paragraphs) {
          children.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [new TextRun({ text: par })],
          }));
        }
      }
    }

    if (parsed.referencias && Array.isArray(parsed.referencias) && parsed.referencias.length) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: 'Referencias', color: '1F3864' })],
      }));
      for (const r of parsed.referencias) {
        children.push(new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: typeof r === 'string' ? r : JSON.stringify(r), size: 18 })],
        }));
      }
    }

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 60 },
      children: [new TextRun({ text: 'Fecha de emisión: ' + today, size: 18, color: '6B7280' })],
    }));

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
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F3864' } },
          spacing: { after: 120 },
          children: [new TextRun({ text: ' ' })],
        }));
        children.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: ev.name || 'Evaluador/a', bold: true, size: 18 })],
        }));
        const lic = [ev.license, ev.registry].filter(Boolean).join(' · ');
        if (lic) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: lic, size: 16, color: '6B7280' })],
          }));
        }
      } catch (e) {
        console.warn('No se pudo incrustar la firma en Word IA:', e);
      }
    } else if (ev.name) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1F3864' } },
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: ' ' })],
      }));
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: ev.name, bold: true, size: 18 })],
      }));
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });
    const blob = await Packer.toBlob(doc);
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.docx`);
  },

  /* ---------- Export AI Report: Excel ---------- */
  exportAIReportExcel(parsed, caseData, evaluator) {
    if (!window.XLSX) throw new Error('SheetJS no disponible');
    const p = caseData.patient || {};
    const ev = evaluator || {};
    const wb = XLSX.utils.book_new();

    // Sheet 1: Datos del informe
    const datos = [
      ['INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2'],
      ['Generado:', new Date().toLocaleString('es-ES')],
      [],
      ['EVALUADO'],
      ['Nombre', p.name || ''],
      ['Edad', p.age != null ? p.age : ''],
      ['Sexo', p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : '')],
      ['Documento', p.document || ''],
      ['Fecha de aplicación', this._fmtDate(p.applicationDate)],
      ['Contexto', p.context || ''],
      [],
      ['EVALUADOR'],
      ['Nombre', ev.name || ''],
      ['Tarjeta profesional', ev.license || ''],
      ['Registro profesional', ev.registry || ''],
      ['Correo', ev.email || ''],
      [],
      ['TÍTULO DEL INFORME'],
      [parsed.titulo || ''],
      [],
      ['SECCIONES DEL INFORME'],
    ];
    for (const sec of (parsed.secciones || [])) {
      datos.push([]);
      datos.push([sec.titulo || '']);
      datos.push([sec.contenido || '']);
    }
    if (parsed.referencias && parsed.referencias.length) {
      datos.push([]);
      datos.push(['REFERENCIAS']);
      for (const r of parsed.referencias) {
        datos.push([typeof r === 'string' ? r : JSON.stringify(r)]);
      }
    }
    const wsDatos = XLSX.utils.aoa_to_sheet(datos);
    wsDatos['!cols'] = [{ wch: 32 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, wsDatos, 'Informe IA');

    // Sheet 2: Secciones (tabla indexada)
    const seccionesAOA = [['#', 'Título de sección', 'Contenido']];
    (parsed.secciones || []).forEach((sec, i) => {
      seccionesAOA.push([i + 1, sec.titulo || '', sec.contenido || '']);
    });
    const wsSec = XLSX.utils.aoa_to_sheet(seccionesAOA);
    wsSec['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, wsSec, 'Secciones');

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this._download(blob, `Informe_IA_MMPI2_${this._safeName(p.name)}.xlsx`);
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

/* ============================================
   ReportRender — dibuja el modelo del informe en
     · HTML (pantalla, impresión y archivo .html)
     · Word (.docx, docx.js)
     · PDF nativo (jsPDF + AutoTable)
   ============================================ */

const ReportRender = {

  CSS: `
.rdoc { background:#fff; color:#1F2937; font-family: Calibri, "Segoe UI", Arial, sans-serif; font-size:14px; line-height:1.6; max-width: 900px; margin: 0 auto; padding: 48px 56px; border:1px solid #E5E7EB; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,.06); }
.rdoc * { box-sizing: border-box; }
.rdoc .r-title { text-align:center; border-bottom:3px double #1F3864; padding-bottom:14px; margin-bottom:22px; }
.rdoc .r-title h1 { font-size:22px; letter-spacing:.5px; color:#1F3864; margin:0 0 4px; text-transform:uppercase; }
.rdoc .r-title .sub { font-size:13px; color:#4B5563; }
.rdoc h2.r-h1 { font-size:17px; color:#1F3864; border-bottom:2px solid #2F5496; padding-bottom:4px; margin:30px 0 12px; }
.rdoc h3.r-h2 { font-size:15px; color:#1F3864; margin:24px 0 10px; }
.rdoc .r-idbox { width:100%; border-collapse:collapse; border:1.5px solid #1F3864; font-size:13px; }
.rdoc .r-idbox td { border:1px solid #C7D2E3; padding:7px 10px; vertical-align:top; }
.rdoc .r-idbox td.k { background:#EEF2F8; color:#1F3864; font-weight:700; width:19%; font-size:12px; }
.rdoc .r-idbox td.v { width:31%; }
.rdoc .r-field { margin: 0 0 14px; }
.rdoc .r-field .lbl { font-weight:700; color:#1F3864; margin-bottom:2px; }
.rdoc .r-field p, .rdoc p.r-p { text-align:justify; margin:0 0 8px; white-space:pre-line; }
.rdoc p.r-note { font-size:12px; color:#4B5563; font-style:italic; }
.rdoc .r-caption { font-size:12px; color:#1F3864; font-weight:700; margin:12px 0 4px; }
.rdoc .r-caption span { font-weight:400; color:#374151; font-style:italic; }
.rdoc table.r-table { width:100%; border-collapse:collapse; font-size:12.5px; margin-bottom:4px; }
.rdoc table.r-table th { background:#1F3864; color:#fff; text-align:left; padding:6px 8px; font-weight:600; border:1px solid #1F3864; }
.rdoc table.r-table td { padding:5px 8px; border:1px solid #D1D5DB; vertical-align:top; }
.rdoc table.r-table tr:nth-child(even) td { background:#F9FAFB; }
.rdoc table.r-table td.num { text-align:center; white-space:nowrap; }
.rdoc table.r-table td.lv-vh { background:#FEE2E2 !important; color:#991B1B; font-weight:700; }
.rdoc table.r-table td.lv-h  { background:#FFEDD5 !important; color:#9A3412; font-weight:700; }
.rdoc table.r-table td.lv-ps { background:#FEF9C3 !important; color:#854D0E; }
.rdoc table.r-table td.lv-m  { background:#ECFDF5 !important; color:#166534; }
.rdoc table.r-table td.lv-lo { background:#DBEAFE !important; color:#1E40AF; font-weight:700; }
.rdoc .r-tfoot { font-size:11px; color:#6B7280; margin-bottom:8px; }
.rdoc .r-interp { background:#F5F7FA; border-left:4px solid #2F5496; padding:10px 14px; margin:10px 0 12px; border-radius:4px; }
.rdoc .r-interp .lbl { font-weight:700; color:#1F3864; font-size:12px; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
.rdoc .r-interp p { margin:0; text-align:justify; }
.rdoc figure.r-fig { margin:8px 0 20px; page-break-inside:avoid; break-inside:avoid; }
.rdoc figure.r-fig .canvas-wrap { position:relative; width:100%; }
.rdoc figure.r-fig img { width:100%; height:auto; display:block; border:1px solid #E5E7EB; border-radius:6px; }
.rdoc figure.r-fig figcaption { font-size:12px; color:#374151; margin-top:4px; text-align:center; }
.rdoc figure.r-fig figcaption b { color:#1F3864; }
.rdoc .r-banner { border:2px solid #B91C1C; background:#FEF2F2; color:#7F1D1D; padding:10px 14px; border-radius:6px; margin:10px 0; font-size:13px; }
.rdoc .r-consolidated { font-size:14.5px; text-align:justify; line-height:1.7; margin:0; }
.rdoc ul.r-list { margin:0 0 8px 20px; padding:0; }
.rdoc ul.r-list li { margin-bottom:6px; text-align:justify; }
.rdoc .r-sign { margin-top:40px; page-break-inside:avoid; break-inside:avoid; }
.rdoc .r-sign .place { margin-bottom:28px; }
.rdoc .r-sign img { max-height:80px; max-width:260px; display:block; margin-bottom:2px; }
.rdoc .r-sign .line { border-top:1.5px solid #1F2937; width:300px; padding-top:6px; }
.rdoc .r-sign .nm { font-weight:700; font-size:14.5px; }
.rdoc .r-sign .sub { font-size:12.5px; color:#374151; }
.rdoc .r-footnote { margin-top:30px; padding-top:10px; border-top:1px solid #E5E7EB; font-size:11px; color:#6B7280; text-align:justify; }
.rdoc table, .rdoc .r-interp { page-break-inside:auto; }
.rdoc tr { page-break-inside:avoid; break-inside:avoid; }
@media (max-width: 700px) { .rdoc { padding:22px 16px; } .rdoc .r-idbox td.k { width:auto; } }
@media print { .rdoc { border:none; box-shadow:none; padding:0; max-width:100%; } .rdoc h2.r-h1, .rdoc h3.r-h2 { page-break-after:avoid; break-after:avoid; } }
`,

  _e(s) { return window.escHTML ? window.escHTML(s) : String(s == null ? '' : s); },

  /* ---------- HTML ---------- */
  toHTML(model, { images = null, chartIdPrefix = 'rchart-' } = {}) {
    const e = (s) => this._e(s);
    const out = [];
    for (const b of model.blocks) {
      switch (b.t) {
        case 'title':
          out.push(`<div class="r-title"><h1>${e(b.text)}</h1><div class="sub">${e(b.subtitle)}</div></div>`); break;
        case 'h1': out.push(`<h2 class="r-h1">${e(b.text)}</h2>`); break;
        case 'h2': out.push(`<h3 class="r-h2">${e(b.text)}</h3>`); break;
        case 'idbox': {
          const rows = [];
          for (let i = 0; i < b.rows.length; i += 2) {
            const a = b.rows[i], c = b.rows[i + 1];
            rows.push(`<tr><td class="k">${e(a[0])}</td><td class="v">${e(a[1])}</td>${c ? `<td class="k">${e(c[0])}</td><td class="v">${e(c[1])}</td>` : '<td class="k"></td><td class="v"></td>'}</tr>`);
          }
          out.push(`<table class="r-idbox"><tbody>${rows.join('')}</tbody></table>`);
          break;
        }
        case 'field': out.push(`<div class="r-field"><div class="lbl">${e(b.label)}</div><p>${e(b.text)}</p></div>`); break;
        case 'p': out.push(`<p class="r-p ${b.cls === 'note' ? 'r-note' : ''}">${e(b.text)}</p>`); break;
        case 'banner': out.push(`<div class="r-banner">${e(b.text)}</div>`); break;
        case 'table': {
          const head = b.columns.map(c => `<th>${e(c)}</th>`).join('');
          const body = b.rows.map(r => '<tr>' + r.cells.map((c, i) => {
            const isNum = typeof c === 'number' || /^[+−-]?\d+\*?$/.test(String(c)) || String(c) === 'N/D' || String(c) === '—' || /^\d+ \/ /.test(String(c));
            const lv = (r.level && (i === b.tCol || i === b.levelCol)) ? ` lv-${r.level}` : '';
            return `<td class="${isNum ? 'num' : ''}${lv}">${e(c)}</td>`;
          }).join('') + '</tr>').join('');
          out.push(`<div class="r-caption">Tabla ${b.num}. <span>${e(b.caption)}</span></div><table class="r-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>${b.footnote ? `<div class="r-tfoot">${e(b.footnote)}</div>` : ''}`);
          break;
        }
        case 'interp': out.push(`<div class="r-interp"><div class="lbl">${e(b.title || 'Interpretación')}</div><p>${e(b.text)}</p></div>`); break;
        case 'chart': {
          const h = window.ReportCharts ? ReportCharts.height(b.spec) : 320;
          const img = images && images[b.num];
          const body = img
            ? `<img src="${img.dataURL}" alt="Figura ${b.num}. ${e(b.caption)}">`
            : `<div class="canvas-wrap" style="height:${h}px"><canvas id="${chartIdPrefix}${b.num}" data-fig="${b.num}"></canvas></div>`;
          out.push(`<figure class="r-fig">${body}<figcaption><b>Figura ${b.num}.</b> ${e(b.caption)}</figcaption></figure>`);
          break;
        }
        case 'consolidated': out.push(`<p class="r-consolidated">${e(b.text)}</p>`); break;
        case 'list': out.push(`<ul class="r-list">${b.items.map(i => `<li>${e(i)}</li>`).join('')}</ul>`); break;
        case 'signature': {
          const ev = b.evaluator;
          const sub1 = [ev.profession, ev.license ? 'T.P. ' + ev.license : '', ev.registry ? 'Registro ' + ev.registry : ''].filter(Boolean).join(' · ');
          const sub2 = [ev.email, ev.phone, ev.address].filter(Boolean).join(' · ');
          out.push(`<div class="r-sign">
            <div class="place">${e([b.place, b.date].filter(Boolean).join(', '))}</div>
            ${ev.signature ? `<img src="${ev.signature}" alt="Firma">` : '<div style="height:60px"></div>'}
            <div class="line"><div class="nm">${e(ev.name || 'Evaluador/a')}</div>${sub1 ? `<div class="sub">${e(sub1)}</div>` : ''}${sub2 ? `<div class="sub">${e(sub2)}</div>` : ''}</div>
          </div>`);
          break;
        }
        case 'footnote': out.push(`<div class="r-footnote">${e(b.text)}</div>`); break;
      }
    }
    return `<article class="rdoc">${out.join('\n')}</article>`;
  },

  /* Montar gráficas Chart.js en pantalla; devuelve instancias */
  mountCharts(model, root, prefix = 'rchart-') {
    const charts = [];
    for (const b of model.blocks) {
      if (b.t !== 'chart') continue;
      const cv = (root || document).querySelector('#' + prefix + b.num);
      if (!cv) continue;
      try { const c = ReportCharts.mount(cv, b.spec); if (c) charts.push(c); } catch (err) { console.warn('Gráfico', b.num, err); }
    }
    return charts;
  },

  /* Documento HTML completo y autónomo */
  toStandaloneHTML(model, images) {
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${this._e(model.title)}</title>
<style>body{margin:0;background:#F3F4F6;padding:24px 12px;} ${this.CSS} @media print{body{background:#fff;padding:0}} @page{size:letter;margin:18mm 16mm;}</style>
</head><body>${this.toHTML(model, { images })}</body></html>`;
  },

  /* ---------- WORD (.docx) ---------- */
  async toDocx(model, images) {
    const D = window.docx;
    if (!D) throw new Error('docx.js no disponible');
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, BorderStyle, Footer, PageNumber, ShadingType } = D;
    const FULL = 9360; // ancho útil carta con márgenes de 1" (twips)
    const blue = '1F3864';
    const levelFill = { vh: 'FEE2E2', h: 'FFEDD5', ps: 'FEF9C3', m: 'ECFDF5', lo: 'DBEAFE' };
    const levelColor = { vh: '991B1B', h: '9A3412', ps: '854D0E', m: '166534', lo: '1E40AF' };
    const children = [];
    const b64 = (dataURL) => {
      const bin = atob(dataURL.split(',')[1]);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    };
    const cellBorders = (color = 'C7D2E3') => ({
      top: { style: BorderStyle.SINGLE, size: 4, color }, bottom: { style: BorderStyle.SINGLE, size: 4, color },
      left: { style: BorderStyle.SINGLE, size: 4, color }, right: { style: BorderStyle.SINGLE, size: 4, color },
    });
    const para = (text, opts = {}) => new Paragraph({
      alignment: opts.align || AlignmentType.JUSTIFIED,
      spacing: { after: opts.after != null ? opts.after : 120, before: opts.before || 0, line: opts.line || 300 },
      children: [new TextRun({ text: String(text), size: opts.size || 22, bold: !!opts.bold, italics: !!opts.italics, color: opts.color })],
    });
    const cell = (text, w, o = {}) => new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: cellBorders(o.border),
      shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
      margins: { top: 50, bottom: 50, left: 90, right: 90 },
      children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(text == null ? '' : text), size: o.size || 19, bold: !!o.bold, color: o.color })] })],
    });

    for (const b of model.blocks) {
      switch (b.t) {
        case 'title':
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: b.text.toUpperCase(), bold: true, size: 32, color: blue })] }));
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: blue, space: 6 } }, children: [new TextRun({ text: b.subtitle, size: 22, color: '4B5563' })] }));
          break;
        case 'h1':
          children.push(new Paragraph({ spacing: { before: 320, after: 140 }, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '2F5496', space: 2 } }, children: [new TextRun({ text: b.text, bold: true, size: 28, color: blue })] }));
          break;
        case 'h2':
          children.push(new Paragraph({ spacing: { before: 240, after: 100 }, keepNext: true, children: [new TextRun({ text: b.text, bold: true, size: 24, color: blue })] }));
          break;
        case 'idbox': {
          const w = [1780, 2900, 1780, 2900];
          const rows = [];
          for (let i = 0; i < b.rows.length; i += 2) {
            const a = b.rows[i], c = b.rows[i + 1] || ['', ''];
            rows.push(new TableRow({ children: [
              cell(a[0], w[0], { fill: 'EEF2F8', bold: true, color: blue, size: 18 }), cell(a[1], w[1]),
              cell(c[0], w[2], { fill: 'EEF2F8', bold: true, color: blue, size: 18 }), cell(c[1], w[3]),
            ] }));
          }
          children.push(new Table({ width: { size: FULL, type: WidthType.DXA }, columnWidths: w, rows }));
          children.push(para('', { after: 60 }));
          break;
        }
        case 'field':
          children.push(new Paragraph({ spacing: { before: 80, after: 40 }, keepNext: true, children: [new TextRun({ text: b.label, bold: true, size: 22, color: blue })] }));
          String(b.text).split(/\n{2,}/).forEach(par => children.push(para(par.trim())));
          break;
        case 'p': children.push(para(b.text, b.cls === 'note' ? { italics: true, size: 19, color: '4B5563' } : {})); break;
        case 'banner': children.push(para(b.text, { bold: true, color: '991B1B' })); break;
        case 'table': {
          children.push(new Paragraph({ spacing: { before: 120, after: 60 }, keepNext: true, children: [new TextRun({ text: `Tabla ${b.num}. `, bold: true, size: 19, color: blue }), new TextRun({ text: b.caption, italics: true, size: 19 })] }));
          const n = b.columns.length;
          // Anchos: columna "Nombre"/"Lectura" más ancha
          const weights = b.columns.map(c => /Nombre|Lectura|Indicador|Criterio|Grupo|Resultado|Cambio/.test(c) ? 3 : (/^Nivel/.test(c) ? 2 : 1.1));
          const sum = weights.reduce((a, x) => a + x, 0);
          const w = weights.map(x => Math.floor(FULL * x / sum));
          const head = new TableRow({ tableHeader: true, children: b.columns.map((c, i) => cell(c, w[i], { fill: blue, color: 'FFFFFF', bold: true, border: blue })) });
          const rows = b.rows.map(r => new TableRow({ children: r.cells.map((c, i) => {
            const lv = (r.level && (i === b.tCol || i === b.levelCol)) ? r.level : null;
            const isNum = typeof c === 'number' || /^[+−-]?\d+\*?$/.test(String(c)) || ['N/D', '—'].includes(String(c));
            return cell(c, w[i], { fill: lv ? levelFill[lv] : undefined, color: lv ? levelColor[lv] : undefined, bold: lv === 'vh' || lv === 'h' || lv === 'lo', center: isNum });
          }) }));
          children.push(new Table({ width: { size: FULL, type: WidthType.DXA }, columnWidths: w, rows: [head, ...rows] }));
          if (b.footnote) children.push(para(b.footnote, { size: 17, italics: true, color: '6B7280', after: 60 }));
          else children.push(para('', { after: 40 }));
          break;
        }
        case 'interp':
          children.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED, spacing: { before: 60, after: 160, line: 300 },
            shading: { fill: 'F5F7FA', type: ShadingType.CLEAR, color: 'auto' },
            border: { left: { style: BorderStyle.SINGLE, size: 24, color: '2F5496', space: 8 } },
            indent: { left: 160 },
            children: [new TextRun({ text: 'Interpretación. ', bold: true, size: 21, color: blue }), new TextRun({ text: b.text, size: 21 })],
          }));
          break;
        case 'chart': {
          const img = images && images[b.num];
          if (img) {
            const wpx = 600, hpx = Math.round(wpx * img.height / img.width);
            children.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 60, after: 40 }, children: [new ImageRun({ data: b64(img.dataURL), transformation: { width: wpx, height: hpx } })] }));
          } else {
            children.push(para('[No fue posible generar la imagen de esta figura]', { italics: true, color: '9CA3AF' }));
          }
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: `Figura ${b.num}. `, bold: true, size: 19, color: blue }), new TextRun({ text: b.caption, italics: true, size: 19 })] }));
          break;
        }
        case 'consolidated': children.push(para(b.text, { size: 23, line: 330 })); break;
        case 'list':
          b.items.forEach(it => children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 80 }, indent: { left: 360, hanging: 240 }, children: [new TextRun({ text: '•  ' + it, size: 22 })] })));
          break;
        case 'signature': {
          const ev = b.evaluator;
          children.push(para([b.place, b.date].filter(Boolean).join(', '), { before: 480, after: 360, align: AlignmentType.LEFT }));
          if (ev.signature) {
            try {
              const dims = await this._imgDims(ev.signature);
              const h = 70, w = Math.min(260, Math.round(h * dims.w / dims.h));
              children.push(new Paragraph({ keepNext: true, spacing: { after: 0 }, children: [new ImageRun({ data: b64(ev.signature), transformation: { width: w, height: Math.round(w * dims.h / dims.w) } })] }));
            } catch (err) { console.warn('Firma no incrustada', err); }
          } else {
            children.push(para(' ', { after: 600 }));
          }
          children.push(new Paragraph({ keepNext: true, spacing: { after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: '1F2937', space: 4 } }, indent: { right: 5200 }, children: [new TextRun({ text: ev.name || 'Evaluador/a', bold: true, size: 23 })] }));
          const sub1 = [ev.profession, ev.license ? 'T.P. ' + ev.license : '', ev.registry ? 'Registro ' + ev.registry : ''].filter(Boolean).join(' · ');
          const sub2 = [ev.email, ev.phone, ev.address].filter(Boolean).join(' · ');
          if (sub1) children.push(para(sub1, { size: 20, color: '374151', after: 0, align: AlignmentType.LEFT }));
          if (sub2) children.push(para(sub2, { size: 20, color: '374151', after: 0, align: AlignmentType.LEFT }));
          break;
        }
        case 'footnote': children.push(para(b.text, { size: 16, color: '6B7280', before: 400 })); break;
      }
    }

    const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: `Informe MMPI-2 · ${model.patientName} · Confidencial · Página `, size: 16, color: '6B7280' }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B7280' }),
      new TextRun({ text: ' de ', size: 16, color: '6B7280' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '6B7280' }),
    ] })] });

    const doc = new Document({
      creator: 'MMPI-2 App', title: model.title,
      styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
      sections: [{
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, bottom: 1300, left: 1440, right: 1440 } } },
        footers: { default: footer },
        children,
      }],
    });
    return Packer.toBlob(doc);
  },

  _imgDims(dataURL) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res({ w: im.naturalWidth || 300, h: im.naturalHeight || 100 });
      im.onerror = rej;
      im.src = dataURL;
    });
  },

  /* ---------- PDF nativo (jsPDF) ---------- */
  _pdfText(s) {
    return String(s == null ? '' : s)
      .replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/−/g, '-').replace(/Δ/g, 'Dif.').replace(/≈/g, '~')
      .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/ /g, ' ');
  },

  async toPDF(model, images) {
    const JS = window.jspdf;
    if (!JS || !JS.jsPDF) throw new Error('jsPDF no disponible');
    const doc = new JS.jsPDF({ unit: 'pt', format: 'letter', compress: true });
    if (typeof doc.autoTable !== 'function') throw new Error('jsPDF AutoTable no disponible');
    const T = (s) => this._pdfText(s);
    const PW = doc.internal.pageSize.getWidth(), PH = doc.internal.pageSize.getHeight();
    const M = { l: 62, r: 62, t: 60, b: 64 };
    const W = PW - M.l - M.r;
    let y = M.t;
    const blue = [31, 56, 100];
    const lvFill = { vh: [254, 226, 226], h: [255, 237, 213], ps: [254, 249, 195], m: [236, 253, 245], lo: [219, 234, 254] };
    const lvText = { vh: [153, 27, 27], h: [154, 52, 18], ps: [133, 77, 14], m: [22, 101, 52], lo: [30, 64, 175] };
    const ensure = (h) => { if (y + h > PH - M.b) { doc.addPage(); y = M.t; } };
    const text = (s, { size = 10.5, style = 'normal', color = [31, 41, 55], align = 'justify', lh = 1.45, indent = 0, after = 6 } = {}) => {
      doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(T(s), W - indent);
      const lineH = size * lh;
      let i = 0;
      while (i < lines.length) {
        ensure(lineH);
        const fit = Math.max(1, Math.floor((PH - M.b - y) / lineH));
        const chunk = lines.slice(i, i + fit);
        const isLastChunk = i + fit >= lines.length;
        if (align === 'justify' && chunk.length > 1) {
          // Justificar todas menos la última línea del párrafo
          const body = isLastChunk ? chunk.slice(0, -1) : chunk;
          if (body.length) doc.text(body, M.l + indent, y + size, { align: 'justify', maxWidth: W - indent, lineHeightFactor: lh });
          if (isLastChunk) doc.text(chunk[chunk.length - 1], M.l + indent, y + size + body.length * lineH, { lineHeightFactor: lh });
        } else {
          doc.text(chunk, align === 'center' ? PW / 2 : M.l + indent, y + size, { align: align === 'justify' ? 'left' : align, lineHeightFactor: lh });
        }
        y += chunk.length * lineH;
        i += fit;
        if (i < lines.length) { doc.addPage(); y = M.t; }
      }
      y += after;
    };

    for (const b of model.blocks) {
      switch (b.t) {
        case 'title':
          text(b.text.toUpperCase(), { size: 16, style: 'bold', color: blue, align: 'center', after: 2 });
          text(b.subtitle, { size: 10.5, color: [75, 85, 99], align: 'center', after: 6 });
          doc.setDrawColor(...blue); doc.setLineWidth(1.2); doc.line(M.l, y, PW - M.r, y); doc.line(M.l, y + 2.5, PW - M.r, y + 2.5);
          y += 16; break;
        case 'h1':
          ensure(150);
          y += 10;
          text(b.text, { size: 13, style: 'bold', color: blue, align: 'left', after: 2 });
          doc.setDrawColor(47, 84, 150); doc.setLineWidth(1); doc.line(M.l, y, PW - M.r, y); y += 10; break;
        case 'h2':
          ensure(170);
          y += 4;
          text(b.text, { size: 11.5, style: 'bold', color: blue, align: 'left', after: 4 }); break;
        case 'idbox': {
          const body = [];
          for (let i = 0; i < b.rows.length; i += 2) {
            const a = b.rows[i], c = b.rows[i + 1] || ['', ''];
            body.push([T(a[0]), T(a[1]), T(c[0]), T(c[1])]);
          }
          doc.autoTable({
            startY: y, margin: { left: M.l, right: M.r }, body, theme: 'grid',
            styles: { fontSize: 9.5, cellPadding: 5, lineColor: [199, 210, 227], lineWidth: 0.6, textColor: [31, 41, 55] },
            columnStyles: { 0: { fillColor: [238, 242, 248], textColor: blue, fontStyle: 'bold', cellWidth: W * 0.19 }, 1: { cellWidth: W * 0.31 }, 2: { fillColor: [238, 242, 248], textColor: blue, fontStyle: 'bold', cellWidth: W * 0.19 }, 3: { cellWidth: W * 0.31 } },
            tableLineColor: blue, tableLineWidth: 1,
          });
          y = doc.lastAutoTable.finalY + 10; break;
        }
        case 'field':
          ensure(40);
          text(b.label, { size: 10.5, style: 'bold', color: blue, align: 'left', after: 1 });
          String(b.text).split(/\n{2,}/).forEach(par => text(par.replace(/\n/g, ' '), { after: 5 }));
          y += 2; break;
        case 'p': text(b.text, b.cls === 'note' ? { size: 9, style: 'italic', color: [75, 85, 99] } : {}); break;
        case 'banner': text(b.text, { style: 'bold', color: [153, 27, 27] }); break;
        case 'table': {
          ensure(70);
          text(`Tabla ${b.num}. ${b.caption}`, { size: 9, style: 'bold', color: blue, align: 'left', after: 2 });
          const wide = b.columns.map(c => /Nombre|Lectura|Indicador|Criterio|Grupo|Resultado|Cambio/.test(c));
          doc.autoTable({
            startY: y, margin: { left: M.l, right: M.r }, theme: 'grid',
            head: [b.columns.map(T)], body: b.rows.map(r => r.cells.map(T)),
            styles: { fontSize: 8.6, cellPadding: 3.5, lineColor: [209, 213, 219], lineWidth: 0.5, textColor: [31, 41, 55], valign: 'top' },
            headStyles: { fillColor: blue, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: Object.fromEntries(b.columns.map((c, i) => [i, wide[i] ? {} : { halign: 'center' }])),
            didParseCell: (d) => {
              if (d.section !== 'body') return;
              const r = b.rows[d.row.index];
              if (r && r.level && (d.column.index === b.tCol || d.column.index === b.levelCol)) {
                d.cell.styles.fillColor = lvFill[r.level]; d.cell.styles.textColor = lvText[r.level];
                if (['vh', 'h', 'lo'].includes(r.level)) d.cell.styles.fontStyle = 'bold';
              }
            },
          });
          y = doc.lastAutoTable.finalY + 4;
          if (b.footnote) text(b.footnote, { size: 8, style: 'italic', color: [107, 114, 128], align: 'left' });
          y += 2; break;
        }
        case 'interp': {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
          const lines = doc.splitTextToSize(T('INTERPRETACIÓN. ' + b.text), W - 20);
          const h = lines.length * 10 * 1.45 + 14;
          if (h < PH - M.t - M.b) ensure(h);
          const y0 = y;
          const pageBefore = doc.internal.getNumberOfPages();
          y += 7;
          text('INTERPRETACIÓN. ' + b.text, { size: 10, indent: 12, after: 0 });
          y += 7;
          if (doc.internal.getNumberOfPages() === pageBefore) {
            doc.setFillColor(47, 84, 150); doc.rect(M.l, y0, 3, y - y0, 'F');
          }
          y += 8; break;
        }
        case 'chart': {
          const img = images && images[b.num];
          if (!img) { text('[No fue posible generar la imagen de esta figura]', { style: 'italic', color: [156, 163, 175] }); break; }
          const w = W, h = w * img.height / img.width;
          ensure(h + 24);
          doc.addImage(img.dataURL, 'PNG', M.l, y, w, h, undefined, 'FAST');
          y += h + 4;
          text(`Figura ${b.num}. ${b.caption}`, { size: 9, style: 'italic', color: [55, 65, 81], align: 'center', after: 12 });
          break;
        }
        case 'consolidated': text(b.text, { size: 10.8, lh: 1.55, after: 8 }); break;
        case 'list':
          b.items.forEach(it => {
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(31, 41, 55);
            ensure(14);
            doc.text('•', M.l + 4, y + 10.5);
            text(it, { indent: 16, after: 4 });
          });
          break;
        case 'signature': {
          const ev = b.evaluator;
          ensure(170);
          y += 20;
          text([b.place, b.date].filter(Boolean).join(', '), { align: 'left', after: 24 });
          if (ev.signature) {
            try {
              const d = await this._imgDims(ev.signature);
              const h = 58, w = Math.min(220, h * d.w / d.h);
              const fmt = /^data:image\/jpe?g/.test(ev.signature) ? 'JPEG' : 'PNG';
              doc.addImage(ev.signature, fmt, M.l, y, w, w * d.h / d.w);
              y += w * d.h / d.w + 2;
            } catch (err) { y += 50; }
          } else { y += 50; }
          doc.setDrawColor(31, 41, 55); doc.setLineWidth(0.9); doc.line(M.l, y, M.l + 230, y); y += 4;
          text(ev.name || 'Evaluador/a', { style: 'bold', size: 11, align: 'left', after: 1 });
          const sub1 = [ev.profession, ev.license ? 'T.P. ' + ev.license : '', ev.registry ? 'Registro ' + ev.registry : ''].filter(Boolean).join(' · ');
          const sub2 = [ev.email, ev.phone, ev.address].filter(Boolean).join(' · ');
          if (sub1) text(sub1, { size: 9.5, color: [55, 65, 81], align: 'left', after: 1 });
          if (sub2) text(sub2, { size: 9.5, color: [55, 65, 81], align: 'left', after: 1 });
          break;
        }
        case 'footnote':
          y += 14;
          text(b.text, { size: 8, color: [107, 114, 128] }); break;
      }
    }
    // Pie de página en todas las páginas
    const n = doc.internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 114, 128);
      doc.text(T(`Informe MMPI-2 · ${model.patientName} · Confidencial · Página ${i} de ${n}`), PW / 2, PH - 30, { align: 'center' });
    }
    doc.setProperties({ title: T(model.title), creator: 'MMPI-2 App' });
    return doc.output('blob');
  },
};

window.ReportRender = ReportRender;

/* Inyectar los estilos del documento una sola vez en la app */
(function () {
  const inject = () => {
    if (document.getElementById('rdoc-css')) return;
    const st = document.createElement('style');
    st.id = 'rdoc-css';
    st.textContent = ReportRender.CSS;
    document.head.appendChild(st);
  };
  if (document.head) inject(); else document.addEventListener('DOMContentLoaded', inject);
})();

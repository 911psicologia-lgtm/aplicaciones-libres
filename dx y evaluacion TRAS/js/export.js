/* ============================================================
   TRAS · export.js
   Informe clínico estándar, vista previa y exportaciones.
   v0.16.3: el análisis por áreas nunca se elimina del informe TRAS.
   ============================================================ */

const REPORT_CSS = `
:root{--navy:#173653;--navy2:#244f7c;--gold:#c9a84c;--ink:#173047;--muted:#607489;--line:#d9e4ee;--paper:#ffffff;--bg:#edf3f8;--soft:#f6f9fc;--warm:#fff8e8;--green:#eaf7f1;--rose:#fff0ee}
*{box-sizing:border-box}
body{margin:0;background:linear-gradient(180deg,#e8f0f7 0,#f7f9fb 360px);color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.55}
.report-shell{max-width:1040px;margin:0 auto;padding:28px}
.report-cover{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-radius:24px;padding:30px 32px;box-shadow:0 18px 50px rgba(23,54,83,.18)}
.report-cover:after{content:"";position:absolute;width:230px;height:230px;border:42px solid rgba(255,255,255,.06);border-radius:50%;right:-92px;top:-105px}
.report-cover h1{font-family:Georgia,serif;font-size:32px;line-height:1.12;margin:0 0 9px}
.report-subtitle{color:#dce8f4;font-size:15px;max-width:760px}
.report-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.report-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);font-size:12px;color:#f5f8fb}
.report-chip.gold{background:var(--gold);border-color:var(--gold);color:#173047;font-weight:700}
.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0 22px}
.metric{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:0 8px 22px rgba(23,54,83,.07)}
.metric strong{display:block;color:var(--navy);font-size:22px;line-height:1.05}
.metric span{display:block;color:var(--muted);font-size:12px;margin-top:5px}
.report-section{background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:22px 24px;margin:0 0 16px;box-shadow:0 8px 26px rgba(23,54,83,.07)}
.section-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:14px}
.section-number{flex:0 0 32px;width:32px;height:32px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
.section-head h2{font-family:Georgia,serif;color:var(--navy);font-size:23px;line-height:1.2;margin:2px 0 0}
.section-intro{color:var(--muted);font-size:13px;margin:-4px 0 16px 44px}
.data-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px}
.data-item{background:var(--soft);border:1px solid #e5edf4;border-radius:13px;padding:10px 12px}
.data-item b{display:block;color:var(--navy);font-size:12px;text-transform:uppercase;letter-spacing:.035em;margin-bottom:3px}
.callout{border-radius:14px;padding:12px 14px;margin:12px 0;border:1px solid var(--line);background:var(--soft)}
.callout.warm{background:var(--warm);border-color:#ead8a5}
.callout.green{background:var(--green);border-color:#c7e5d6}
.callout.rose{background:var(--rose);border-color:#efccc7}
.module-chips{display:flex;flex-wrap:wrap;gap:8px}
.module-chip{padding:7px 10px;border-radius:999px;background:#eaf1f8;border:1px solid #cbdbea;color:var(--navy);font-size:12px;font-weight:700}
.area-list{display:grid;gap:10px}
.area-panel{border:1px solid var(--line);border-radius:16px;background:#fbfdff;overflow:hidden;page-break-inside:avoid}
.area-panel summary,.area-static-head{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;background:linear-gradient(90deg,#f1f6fa,#fbfdff);color:var(--navy);font-weight:700}
.area-panel summary::-webkit-details-marker{display:none}
.area-panel[open] summary{border-bottom:1px solid var(--line)}
.area-name{display:flex;align-items:center;gap:9px}
.area-dot{width:9px;height:9px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.18)}
.area-status{flex:0 0 auto;border-radius:999px;padding:4px 8px;font-size:11px;background:#e8f0f7;color:#38546c}
.area-status.ok{background:#e4f4ec;color:#176046}
.area-status.warn{background:#fff2d6;color:#815800}
.area-status.empty{background:#edf0f3;color:#687887}
.area-body{padding:14px 16px}
.area-reading{font-size:14px}
.area-guidance{margin-top:10px;padding:10px 12px;border-left:4px solid var(--gold);background:var(--warm);border-radius:0 10px 10px 0}
.no-data{color:#66798b;font-style:italic;background:#f4f6f8;border:1px dashed #cfd9e1;border-radius:10px;padding:10px 12px}
.integration-hero{background:linear-gradient(135deg,#173653,#285b87);color:#fff;border-radius:18px;padding:18px 20px;margin-bottom:14px}
.integration-hero h3{font-family:Georgia,serif;margin:0 0 8px;font-size:21px}
.integration-hero p,.integration-hero span{color:#f2f6fa}
.quad-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.insight-card{border:1px solid var(--line);border-radius:15px;padding:13px 15px;background:var(--soft)}
.insight-card h3{margin:0 0 8px;color:var(--navy);font-size:15px}
.insight-card ul{margin:0;padding-left:19px}
.insight-card li{margin:5px 0}
.insight-card.resources{background:#edf8f3;border-color:#cce7da}
.insight-card.vulnerabilities{background:#fff5ed;border-color:#f0d7c2}
.insight-card.limits{background:#f5f2f8;border-color:#ded4e6}
.gold-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12px 0}
.gold-stat{border-radius:13px;padding:11px;text-align:center;border:1px solid var(--line);background:var(--soft)}
.gold-stat strong{display:block;font-size:20px;color:var(--navy)}
.report-table{border-collapse:collapse;width:100%;margin:12px 0;font-size:13px}
.report-table th,.report-table td{padding:8px 9px;border:1px solid var(--line);vertical-align:top}
.report-table th{background:#edf3f8;color:var(--navy)}
.profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.profile-card{border:1px solid var(--line);border-radius:14px;background:#fbfdff;padding:12px 14px}
.profile-card strong{display:block;color:var(--navy);margin-bottom:5px}
.report-list{margin:7px 0;padding-left:22px}
.report-list li{margin:6px 0}
.signature{margin-top:34px;page-break-inside:avoid}
.signature-line{border-top:1px solid var(--navy);width:320px;padding-top:7px}
.report-footer{margin:24px auto 0;color:#6b7d8e;text-align:center;font-size:11px;max-width:760px}
@media(max-width:760px){.report-shell{padding:12px}.report-cover{padding:22px 20px;border-radius:18px}.report-cover h1{font-size:27px}.metrics,.quad-grid,.profile-grid,.data-grid{grid-template-columns:1fr}.metric strong{font-size:19px}.report-section{padding:18px 16px}.section-intro{margin-left:0}.gold-summary{grid-template-columns:1fr}}
@media print{body{background:#fff}.report-shell{max-width:none;padding:0}.report-cover,.report-section,.metric{box-shadow:none}.report-cover{border-radius:0}.metrics{page-break-inside:avoid}.area-panel{break-inside:avoid}.area-panel>summary{cursor:default}.report-section{break-inside:auto}.no-print{display:none!important}}

/* v0.16.5 · Goldstein sin repetición */
.gold-classification-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;background:linear-gradient(135deg,#173653,#285b87);color:#fff;border-radius:18px;padding:18px 20px;margin:14px 0}
.gold-classification-hero .eyebrow{display:block;color:#e6ca82;font-size:10px;font-weight:800;letter-spacing:.12em}.gold-classification-hero h3{font-family:Georgia,serif;font-size:23px;margin:4px 0 7px;color:#fff}.gold-classification-hero p{margin:0;color:#edf4f9;font-size:13px;max-width:740px}
.gold-response-count{flex:0 0 92px;width:92px;height:92px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);display:grid;place-content:center;text-align:center;font-size:22px;font-weight:800}.gold-response-count small{display:block;font-size:9px;line-height:1.2;font-weight:600;color:#d9e7f1;max-width:66px}
.competence-ladder{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}.competence-step{position:relative;border:1px solid var(--line);border-radius:14px;background:#f6f9fc;padding:11px 10px 11px 43px;min-height:78px}.competence-step>span{position:absolute;left:9px;top:12px;width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:#dfe8ef;color:#466176;font-weight:800}.competence-step strong{display:block;font-size:12px;color:var(--navy);line-height:1.25}.competence-step small{display:block;font-size:10px;color:var(--muted);line-height:1.3;margin-top:4px}.competence-step.current{background:#fff8e8;border-color:#d9bd69;box-shadow:inset 0 0 0 1px #ead699}.competence-step.current>span{background:var(--gold);color:#173047}
.method-note,.section-note{font-size:11px;color:var(--muted);background:#f7fafc;border-left:3px solid #b7c8d7;padding:8px 10px;border-radius:0 9px 9px 0;margin:8px 0 15px}.gold-executive{border:1px solid #cbdce8;background:linear-gradient(180deg,#f7fbfe,#fff);border-radius:16px;padding:16px 18px;margin:14px 0}.gold-executive h3,.report-subhead{font-family:Georgia,serif;color:var(--navy);font-size:19px;margin:0 0 9px}.report-subhead{margin-top:20px}.gold-executive span{display:block}.gold-context-extra{margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.gold-context-extra strong{display:block;color:var(--navy);margin-bottom:5px}
.report-table-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:15px;margin:10px 0 16px}.gold-report-table{margin:0!important;min-width:900px;border-collapse:separate!important;border-spacing:0}.gold-report-table th,.gold-report-table td{border:0!important;border-bottom:1px solid var(--line)!important;border-right:1px solid var(--line)!important;padding:10px!important}.gold-report-table th:last-child,.gold-report-table td:last-child{border-right:0!important}.gold-report-table tbody tr:last-child td{border-bottom:0!important}.gold-report-table td:first-child{min-width:310px}.gold-report-table td:first-child small{display:block;color:var(--muted);line-height:1.35;margin-top:5px;font-size:10px;font-weight:400}.gold-percent-cell{min-width:92px}.gold-percent-cell strong{display:block;text-align:center;font-size:12px;color:var(--navy)}.gold-mini-track{display:block;height:6px;background:#e8eef3;border-radius:999px;overflow:hidden;margin-top:5px}.gold-mini-track i{display:block;height:100%;border-radius:999px}.gold-mini-track i.danger{background:#d8786f}.gold-mini-track i.warn{background:#d8b35f}.gold-mini-track i.ok{background:#55a887}.dominant-pill{display:inline-flex;padding:4px 7px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap}.dominant-pill.danger{background:#fff0ee;color:#9e342b}.dominant-pill.warn{background:#fff5db;color:#855b00}.dominant-pill.ok{background:#eaf7f1;color:#176046}
.relation-map{display:grid;gap:9px;margin:11px 0 18px}.relation-row{display:grid;grid-template-columns:minmax(150px,.8fr) 94px minmax(150px,.8fr) minmax(240px,1.4fr);align-items:center;gap:9px;padding:9px;border:1px solid var(--line);border-radius:14px;background:#fbfdff}.relation-node{padding:9px 10px;border-radius:10px;font-size:11px;font-weight:800;text-align:center}.relation-node.from{background:#eaf1f8;color:#173653}.relation-node.to{background:#fff5dc;color:#6b5011}.relation-link{text-align:center;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.04em}.relation-link b{display:block;color:var(--gold);font-size:19px;line-height:1}.relation-row p{margin:0;color:var(--muted);font-size:11px;line-height:1.35}
.gold-insight-bands{display:grid;gap:10px;margin:12px 0 17px}.gold-band{border-radius:14px;padding:13px 15px;border:1px solid var(--line)}.gold-band h3{font-size:14px;color:var(--navy);margin:0 0 7px}.gold-band ul{margin:0;padding-left:19px}.gold-band li{margin:4px 0}.gold-band.resources{background:#edf8f3;border-color:#cce7da}.gold-band.conditions{background:#fff6ee;border-color:#efd9c5}.callout.limits{background:#f5f2f8;border-color:#ded4e6}.gold-stat.danger{background:#fff4f2}.gold-stat.warn{background:#fff9e9}.gold-stat.ok{background:#eef9f4}
@media(max-width:760px){.gold-classification-hero{padding:15px;display:block}.gold-response-count{width:auto;height:auto;border-radius:12px;display:flex;gap:6px;align-items:center;justify-content:center;margin-top:12px;padding:8px}.gold-response-count small{max-width:none}.competence-ladder{grid-template-columns:1fr}.relation-row{grid-template-columns:1fr 48px 1fr;padding:7px;gap:6px}.relation-row p{grid-column:1/-1}.gold-summary{grid-template-columns:repeat(3,1fr)}}
@media print{.competence-ladder{grid-template-columns:repeat(4,minmax(0,1fr))}.report-table-wrap{overflow:visible;border:0}.gold-report-table{min-width:0;font-size:9px}.relation-row{break-inside:avoid}}

`;

/* Microsoft Word no soporta variables CSS (var(--x)), degradados,
   flexbox ni grid: al exportar el mismo REPORT_CSS a .doc, cualquier
   texto en var(--muted) puede caer en un azul muy claro o en un color
   por defecto ilegible, y los layouts de flex/grid se aplanan sin
   estructura visual. Esta funcion:
   1) Reemplaza cada var(--x) por su valor literal (Word no entiende
      :root ni var()).
   2) Oscurece el tono "muted" especificamente para Word, porque el
      original (#607489) es apto para pantalla pero de bajo contraste
      para lectura en un documento.
   3) Quita el bloque :root{} sobrante. */
function wordSafeCss(css) {
  const rootMatch = css.match(/:root\{([^}]*)\}/);
  const vars = {};
  if (rootMatch) {
    rootMatch[1].split(';').forEach(pair => {
      const idx = pair.indexOf(':');
      if (idx === -1) return;
      const name = pair.slice(0, idx).trim();
      let value = pair.slice(idx + 1).trim();
      if (name) vars[name] = value;
    });
  }
  // Contraste reforzado solo para el documento Word (mas oscuro que en pantalla).
  if (vars['--muted']) vars['--muted'] = '#3f5064';
  let out = css.replace(/:root\{[^}]*\}/, '');
  out = out.replace(/var\((--[a-z0-9-]+)\)/gi, (m, name) => vars[name] || m);
  return out;
}

/* Limpieza editorial defensiva para informes nuevos y casos antiguos.
   No cambia los datos guardados: solo evita fórmulas mecánicas y rótulos
   teóricos que el destinatario no necesita ver. */
function naturalizeReportText(str) {
  let out = String(str ?? '');
  out = out
    .replace(/(^|[.!?]\s+)(?:El material|El perfil) sugier(?:e|en)\b[,:]?\s*/gi, '$1La información disponible permite considerar ')
    .replace(/(^|[.!?]\s+)Desde (?:una|la) perspectiva [^,.;:]+[,;:]?\s*/gi, '$1')
    .replace(/(^|[.!?]\s+)Desde (?:un|el) enfoque [^,.;:]+[,;:]?\s*/gi, '$1')
    .replace(/(^|[.!?]\s+)Psicológicamente[,;:]?\s*/gi, '$1');
  return out.trim();
}

/* Convierte texto plano con saltos de linea en HTML seguro. */
function textToHtml(str) {
  const t = naturalizeReportText(str);
  if (!t) return '';
  return t.split(/\n{2,}/).map(p =>
    escapeHtml(p).replace(/\n/g, '<br>')
  ).map(p => `<span>${p}</span>`).join('<br><br>');
}

function reportLines(value) {
  if (Array.isArray(value)) return value.map(x => String(x || '').trim()).filter(Boolean);
  return String(value || '').split(/\n+/)
    .map(x => x.replace(/^\s*(?:[-•]|(?:\d+)[.)-]?)\s*/, '').trim()).filter(Boolean);
}

function reportList(items, emptyText) {
  const arr = reportLines(items);
  return arr.length
    ? `<ul class="report-list">${arr.map(x => `<li>${escapeHtml(naturalizeReportText(x))}</li>`).join('')}</ul>`
    : `<div class="no-data">${escapeHtml(emptyText || 'No se dispone de información suficiente.')}</div>`;
}

/* ---------- Integracion final del informe ---------- */
function informeState(c) {
  c = c || getCurrentCase();
  c.informe = Object.assign({
    consolidado_integral:'',
    hallazgos_convergentes:[],
    recursos_protectores:[],
    vulnerabilidades_contextuales:[],
    aproximacion_diagnostica:'',
    sintesis_padres:'',
    recomendaciones_prioritarias:[],
    cierre:'',
    fuente:'manual'
  }, c.informe || {});
  ['hallazgos_convergentes','recursos_protectores','vulnerabilidades_contextuales','recomendaciones_prioritarias'].forEach(k => {
    c.informe[k] = reportLines(c.informe[k]);
  });
  return c.informe;
}

function syncInformeInputs() {
  const c = getCurrentCase();
  const inf = informeState(c);
  const textMap = {
    informeConsolidado:'consolidado_integral',
    informeAproxDx:'aproximacion_diagnostica',
    informeSintesis:'sintesis_padres',
    informeCierre:'cierre'
  };
  Object.entries(textMap).forEach(([id,key]) => {
    const el = document.getElementById(id);
    if (el) inf[key] = el.value.trim();
  });
  const listMap = {
    informeHallazgos:'hallazgos_convergentes',
    informeRecursos:'recursos_protectores',
    informeVulnerabilidades:'vulnerabilidades_contextuales',
    informeRecomendaciones:'recomendaciones_prioritarias'
  };
  Object.entries(listMap).forEach(([id,key]) => {
    const el = document.getElementById(id);
    if (el) inf[key] = reportLines(el.value);
  });
}

function renderInformeEditorial() {
  const c = getCurrentCase();
  const inf = informeState(c);
  const textMap = {
    informeConsolidado:'consolidado_integral',
    informeAproxDx:'aproximacion_diagnostica',
    informeSintesis:'sintesis_padres',
    informeCierre:'cierre'
  };
  Object.entries(textMap).forEach(([id,key]) => {
    const el = document.getElementById(id);
    if (el) el.value = inf[key] || '';
  });
  const listMap = {
    informeHallazgos:'hallazgos_convergentes',
    informeRecursos:'recursos_protectores',
    informeVulnerabilidades:'vulnerabilidades_contextuales',
    informeRecomendaciones:'recomendaciones_prioritarias'
  };
  Object.entries(listMap).forEach(([id,key]) => {
    const el = document.getElementById(id);
    if (el) el.value = (inf[key] || []).map((x,i)=>`${i+1}. ${x}`).join('\n');
  });
  const badge = document.getElementById('informeFuenteBadge');
  if (badge) {
    badge.textContent = inf.fuente === 'ia-manual' ? 'origen: IA · revisar' : 'revision profesional';
    badge.className = 'badge ' + (inf.fuente === 'ia-manual' ? 'warn' : 'info');
  }
}

function saveInformeEditorial() {
  const c = getCurrentCase();
  syncInformeInputs();
  informeState(c).fuente = 'manual';
  persist('Informe clinico consolidado actualizado');
  renderInformeEditorial();
  renderReport();
  toast('Informe consolidado guardado.', 'ok');
}

function clearInformeEditorial() {
  const c = getCurrentCase();
  const inf = informeState(c);
  const hasData = Object.entries(inf).some(([k,v]) => k !== 'fuente' && (Array.isArray(v) ? v.length : String(v || '').trim()));
  if (hasData && !confirm('Vaciar el informe consolidado, sus cuadros, la sintesis, orientaciones y conclusion?')) return;
  c.informe = {
    consolidado_integral:'',
    hallazgos_convergentes:[],
    recursos_protectores:[],
    vulnerabilidades_contextuales:[],
    aproximacion_diagnostica:'',
    sintesis_padres:'',
    recomendaciones_prioritarias:[],
    cierre:'',
    fuente:'manual'
  };
  persist('Informe clinico consolidado vaciado');
  renderInformeEditorial();
  renderReport();
  toast('Informe consolidado vaciado.', 'info');
}

function areaReportData(c, area) {
  const action = c.modules.sensibles[area.id] || 'aplicar';
  const it = (typeof areaInterp === 'function') ? areaInterp(area.id) : (c.interpretations[area.id] || {});
  const respuestas = (area.items || []).map(i => {
    const st = c.responses[i.id] || {};
    const respuesta = String(st.respuesta || '').trim();
    return respuesta ? { id:i.id, respuesta } : null;
  }).filter(Boolean);
  const qd = String(it.que_dice || '').trim();
  const qs = String(it.que_sucede || '').trim();
  const qg = String(it.que_se_sugiere || '').trim();
  const pi = String(it.parrafo_integrado || it.texto || '').trim();
  const hasInterp = !!(pi || qd || qs || qg);
  return { action, respuestas, qd, qs, qg, pi, hasInterp, total:(area.items || []).length };
}

function buildAreaReport(c, area, interactive) {
  const d = areaReportData(c, area);
  let statusClass = 'empty';
  let statusText = 'Sin datos';
  let body = '';

  if ((area.id === 'area_17' || area.id === 'area_18') && d.action === 'omitir') {
    statusText = 'Omitida por decision profesional';
    statusClass = 'warn';
    body = '<div class="no-data">Esta area fue omitida por decision profesional. No se formulan inferencias ni conclusiones sobre su contenido.</div>';
  } else if ((area.id === 'area_17' || area.id === 'area_18') && d.action === 'posponer' && !d.respuestas.length && !d.hasInterp) {
    statusText = 'Pospuesta';
    statusClass = 'warn';
    body = '<div class="no-data">Esta area fue pospuesta. No se dispone de informacion suficiente para elaborar una interpretacion especifica.</div>';
  } else if (!d.respuestas.length && !d.hasInterp) {
    body = '<div class="no-data">No se dispone de respuestas ni de informacion clinica suficiente en esta area. Debe completarse en entrevista o quedar consignada como no explorada.</div>';
  } else if (d.respuestas.length && !d.hasInterp) {
    statusText = `${d.respuestas.length}/${d.total} respuestas · sin integracion`;
    statusClass = 'warn';
    body = `<div class="no-data">Se registraron ${d.respuestas.length} de ${d.total} respuestas, pero aun no se dispone de una integracion clinica suficiente para esta area.</div>`;
  } else {
    statusText = d.respuestas.length ? `${d.respuestas.length}/${d.total} respuestas · analizada` : 'Analizada con datos clinicos';
    statusClass = 'ok';
    const lectura = d.pi || [d.qd, d.qs, d.qg].filter(Boolean).join(' ');
    body = `${lectura ? `<div class="area-reading">${textToHtml(lectura)}</div>` : ''}
      ${!lectura ? '<div class="no-data">La informacion registrada no permite una formulacion especifica para esta area.</div>' : ''}`;
  }

  const head = `<div class="area-name"><span class="area-dot"></span><strong>${escapeHtml(area.nombre)}</strong></div>
    <span class="area-status ${statusClass}">${escapeHtml(statusText)}</span>`;
  if (interactive) {
    return `<details class="area-panel" open><summary>${head}</summary><div class="area-body">${body}</div></details>`;
  }
  return `<section class="area-panel"><div class="area-static-head">${head}</div><div class="area-body">${body}</div></section>`;
}

function reportSection(number, title, body, intro, extraClass) {
  return `<section class="report-section ${extraClass || ''}">
    <div class="section-head"><span class="section-number">${number}</span><h2>${escapeHtml(title)}</h2></div>
    ${intro ? `<div class="section-intro">${escapeHtml(intro)}</div>` : ''}
    ${body}
  </section>`;
}

function buildReportHtml(target, audience) {
  const wordMode = target === 'word';
  const interactive = !wordMode;
  audience = audience || 'familias';
  const showTables = audience !== 'familias';
  const showAreaDetail = audience !== 'docentes';
  const showDx = audience !== 'familias';
  syncInputsToState();
  syncInformeInputs();

  const c = getCurrentCase();
  const inf = informeState(c);
  const scope = c.scope || 'ambos';
  const showTras = scope !== 'habilidades';
  const goldApplied = !!(c.goldstein && c.goldstein.aplicado);
  const showGold = scope !== 'tras' && goldApplied;
  const activeAreas = showTras ? allAreas() : [];
  const areaData = activeAreas.map(a => areaReportData(c, a));
  const areaCountWithData = areaData.filter(d => d.respuestas.length || d.hasInterp).length;
  const areaCountNoData = activeAreas.length - areaCountWithData;
  const areasHtml = activeAreas.map(a => buildAreaReport(c, a, interactive)).join('');

  let goldStats = null;
  if (showGold && typeof computeGoldstein === 'function') goldStats = computeGoldstein(c.goldstein.respuestas || {});
  const persCount = c.personalidad && Array.isArray(c.personalidad.dimensiones) ? c.personalidad.dimensiones.length : 0;

  const modulosActivos = showTras
    ? [c.trasMode === 'resumido' ? 'Nucleo TRAS · modo resumido (38 items)' : 'Nucleo TRAS · modo extenso ajustado (59 items)'].concat(DATASET.areas_complementarias.filter(a => c.modules.complementarios[a.id]).map(a => a.nombre))
    : [];
  if (showGold) modulosActivos.push('Lista de chequeo de habilidades sociales de Goldstein');
  if (persCount) modulosActivos.push('Perfil descriptivo de personalidad en formacion');
  if (c.matrizCA && c.matrizCA.aplicado) modulosActivos.push('Matriz Cognitivo-Atencional');
  (c.anexos || []).filter(a => a.incluir && String(a.contenido || '').trim()).forEach(a => modulosActivos.push(a.titulo));

  const resumen = String(c.hc.resumen || '').trim();
  const hcFallback = [c.hc.motivo, c.hc.evento, c.hc.familia, c.hc.escolar, c.hc.sintomas, c.hc.recursos]
    .map(x => String(x || '').trim()).filter(Boolean).join(' ');
  const resumenCaso = resumen || hcFallback || 'No se dispone de un resumen clinico del caso.';
  const alertas = (c.hc.alertas || []).filter(Boolean);

  let n = 0;
  const sections = [];

  sections.push(reportSection(++n, 'Datos de identificacion', `
    <div class="data-grid">
      <div class="data-item"><b>Persona evaluada</b>${escapeHtml(c.meta.nombre || 'No informado')}</div>
      <div class="data-item"><b>Numero de caso</b>${escapeHtml(c.meta.numero || 'No informado')}</div>
      <div class="data-item"><b>Edad y sexo/genero</b>${escapeHtml(c.meta.edad || 'No informado')} · ${escapeHtml(c.meta.sexo || 'No informado')}</div>
      <div class="data-item"><b>Fecha</b>${escapeHtml(c.meta.fecha || 'No informada')}</div>
      <div class="data-item" style="grid-column:1/-1"><b>Consentimiento u observacion</b>${escapeHtml(c.meta.consentimiento || 'No informado')}</div>
    </div>`));

  sections.push(reportSection(++n, 'Evaluador', `
    <div class="data-grid">
      <div class="data-item"><b>Profesional</b>${escapeHtml(state.evaluator.nombre || 'No informado')}</div>
      <div class="data-item"><b>Registro</b>${escapeHtml(state.evaluator.registro || 'No informado')}</div>
      <div class="data-item"><b>Profesion e institucion</b>${escapeHtml(state.evaluator.profesion || 'No informada')} · ${escapeHtml(state.evaluator.institucion || 'No informada')}</div>
      <div class="data-item"><b>Contacto</b>${escapeHtml(state.evaluator.telefono || 'No informado')}${state.evaluator.email ? ' · ' + escapeHtml(state.evaluator.email) : ''}</div>
      ${state.evaluator.direccion ? `<div class="data-item" style="grid-column:1/-1"><b>Direccion</b>${escapeHtml(state.evaluator.direccion)}</div>` : ''}
    </div>`));

  sections.push(reportSection(++n, 'Resumen clinico del caso', `
    <div class="callout">${textToHtml(resumenCaso)}</div>
    <div class="callout ${alertas.length ? 'rose' : 'green'}"><strong>Alertas registradas:</strong> ${alertas.length ? escapeHtml(alertas.join(', ')) : 'Ninguna registrada.'}</div>`));

  sections.push(reportSection(++n, 'Alcance e instrumentos aplicados',
    `<div class="module-chips">${modulosActivos.length ? modulosActivos.map(x => `<span class="module-chip">${escapeHtml(x)}</span>`).join('') : '<span class="module-chip">No se registran instrumentos aplicados</span>'}</div>`));

  const trasPatrones = String(c.patterns || '').trim();
  const trasConsolidadoPropio = String(c.consolidated || '').trim();
  const trasSintesisGlobal = (trasPatrones || trasConsolidadoPropio) ? `
    <div class="gold-executive"><h3>Comprensión global del TRAS</h3>
      ${trasConsolidadoPropio ? `<div>${textToHtml(trasConsolidadoPropio)}</div>` : ''}
      ${trasPatrones ? `<div class="gold-context-extra"><strong>Patrones transversales</strong>${textToHtml(trasPatrones)}</div>` : ''}
    </div>` : '<div class="no-data">No se ha elaborado todavía una lectura transversal que integre las areas del TRAS entre si.</div>';

  if (showTras && showAreaDetail) {
    sections.push(reportSection(++n, 'Interpretacion integrada por areas', `
      ${trasSintesisGlobal}
      <h3 class="report-subhead">Desglose por area</h3>
      <div class="area-list">${areasHtml}</div>`,
      'La sintesis global se construye a partir del desglose por areas, que permanece completo debajo. Cuando un area no cuenta con datos suficientes, el informe lo consigna expresamente y no completa el vacio con inferencias.'));
  } else if (showTras) {
    sections.push(reportSection(++n, 'Interpretacion integrada por areas', `
      ${trasSintesisGlobal}
      <div class="method-note">El desglose narrativo completo por las 19 areas del TRAS (incluye contenido de dinamica familiar intima) se reserva a la version del informe dirigida a profesionales, por proporcionalidad de privacidad.</div>`));
  }

  if (showGold) {
    sections.push(reportSection(++n, 'Habilidades sociales', goldsteinReportSection(0, showTables, wordMode),
      'Lectura descriptiva de frecuencias por grupos; no corresponde a una medicion diagnostica ni normativa.'));
  } else if (scope !== 'tras') {
    sections.push(reportSection(++n, 'Habilidades sociales',
      '<div class="no-data">La bateria de habilidades sociales fue seleccionada en el alcance, pero no se dispone de respuestas aplicadas para este caso.</div>'));
  }

  if (c.personalidad && c.personalidad.aplicado) {
    sections.push(reportSection(++n, 'Perfil descriptivo de personalidad en formacion', personalidadReportSection(0),
      'Aproximacion clinica derivada de la informacion disponible. No equivale a un MMPI-A ni a una prueba estandarizada de personalidad.'));
  } else {
    sections.push(reportSection(++n, 'Perfil descriptivo de personalidad en formacion',
      '<div class="no-data">No se dispone de un perfil descriptivo integrado para este caso.</div>',
      'No equivale a un MMPI-A ni a una prueba estandarizada de personalidad.'));
  }

  if (c.matrizCA && c.matrizCA.aplicado) {
    sections.push(reportSection(++n, 'Matriz Cognitivo-Atencional', matrizCaReportSection(showTables),
      'Instrumento de exploracion y organizacion de hallazgos. Los indicadores de atencion/impulsividad son autoinformados y no equivalen a un diagnostico de TDAH.'));
  }

  const aproxDx = String(inf.aproximacion_diagnostica || '').trim();
  if (showDx) {
    sections.push(reportSection(++n, 'Aproximacion diagnostica provisional',
      aproxDx
        ? `<div class="integration-hero">${textToHtml(aproxDx)}</div>`
        : '<div class="no-data">No se ha elaborado una aproximacion diagnostica provisional para este caso.</div>',
      'Hipotesis clinica en formacion, no un diagnostico confirmado. No proviene de instrumentos estandarizados con baremos poblacionales, pero se sustenta en un instrumento de construccion clinica seria y contrastada con evidencia. Requiere los criterios formales pendientes (duracion, multi-contexto, edad de inicio, descarte diferencial) antes de considerarse definitiva.'));
  }

  const fallbackConsolidado = String(c.consolidated || '').trim();
  const consolidado = String(inf.consolidado_integral || '').trim() || fallbackConsolidado;
  const cuadros = `
    <div class="quad-grid">
      <div class="insight-card"><h3>Hallazgos convergentes</h3>${reportList(inf.hallazgos_convergentes, 'No se ha elaborado una lectura de convergencias entre las fuentes aplicadas.')}</div>
      <div class="insight-card resources"><h3>Recursos protectores</h3>${reportList(inf.recursos_protectores, 'No se han consolidado los recursos protectores en este apartado.')}</div>
      <div class="insight-card vulnerabilities"><h3>Vulnerabilidades contextuales</h3>${reportList(inf.vulnerabilidades_contextuales, 'No se han consolidado vulnerabilidades contextuales en este apartado.')}</div>
    </div>`;
  sections.push(reportSection(++n, 'Informe clinico consolidado de toda la evaluacion', `
    <div class="integration-hero">
      <h3>Comprension integrada del caso</h3>
      ${consolidado ? `<div>${textToHtml(consolidado)}</div>` : '<div>No se dispone aun de una formulacion integrada de toda la evaluacion. Puede elaborarse con el hub de IA y revisarse profesionalmente antes de exportar.</div>'}
    </div>
    ${cuadros}`,
    'Esta seccion articula historia clinica, TRAS, habilidades sociales, perfil de personalidad y anexos incluidos, sin repetir el contenido de cada apartado ni sustituir el analisis por areas. Los patrones transversales especificos del TRAS se presentan en su propio apartado, antes de habilidades sociales.'));

  const recs = inf.recomendaciones_prioritarias.length ? inf.recomendaciones_prioritarias : reportLines(c.recommendations);
  sections.push(reportSection(++n, 'Sintesis para cuidadores y orientaciones prioritarias', `
    <div class="callout warm"><strong>Sintesis comprensible:</strong><br>${textToHtml(inf.sintesis_padres) || '<span class="no-data">No se dispone de una sintesis especifica para cuidadores.</span>'}</div>
    <h3 style="color:#173653;margin:18px 0 8px">Orientaciones prioritarias</h3>
    ${reportList(recs, 'No se han registrado orientaciones prioritarias.')}
    <div class="callout green"><strong>Conclusion integrada:</strong><br>${textToHtml(inf.cierre) || '<span>No se dispone de una conclusion integrada.</span>'}</div>`));

  const anexosBlock = (typeof anexosReportSection === 'function') ? anexosReportSection(1) : '';
  if (anexosBlock) sections.push(reportSection(++n, 'Anexos complementarios', anexosBlock));

  const scopeLabel = scope === 'tras' ? 'TRAS' : scope === 'habilidades' ? 'Habilidades sociales' : 'TRAS + Habilidades';
  const metrics = `
    <div class="metrics">
      <div class="metric"><strong>${showTras ? activeAreas.length : 0}</strong><span>areas TRAS visibles</span></div>
      <div class="metric"><strong>${showTras ? areaCountWithData : 0}</strong><span>areas con datos o analisis</span></div>
      <div class="metric"><strong>${goldStats ? `${goldStats.global.respondidos}/${goldStats.global.total}` : '—'}</strong><span>habilidades respondidas</span></div>
      <div class="metric"><strong>${persCount}</strong><span>dimensiones de personalidad</span></div>
    </div>`;

  const wordExtraCss = wordMode ? `
    /* Reglas especificas para Word: reemplazan flexbox/grid (no soportados)
       por bloques simples apilados, que Word si respeta. */
    .metrics,.quad-grid,.report-meta,.relation-row,.competence-ladder,.gold-summary,.gold-insight-bands{display:block!important}
    .metric,.insight-card,.report-chip{display:block!important;margin-bottom:10px!important}
    .relation-row{border:1px solid #d9e4ee;border-radius:10px;padding:10px;margin-bottom:8px}
    .relation-node{font-weight:bold;display:inline}
    .competence-step{border:1px solid #d9e4ee;border-radius:10px;padding:10px;margin-bottom:8px}
  ` : '';
  const finalCss = wordMode ? wordSafeCss(REPORT_CSS) + wordExtraCss : REPORT_CSS;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Informe TRAS · ${escapeHtml(c.meta.numero || 'caso')}</title><style>${finalCss}</style></head>
  <body><main class="report-shell">
    <header class="report-cover">
      <h1>TRAS · Informe de evaluacion psicologica</h1>
      <div class="report-subtitle">Lectura narrativa, afectiva y social integrada con los instrumentos y fuentes registradas en el caso.</div>
      <div class="report-meta">
        <span class="report-chip gold">${escapeHtml(scopeLabel)}</span>
        <span class="report-chip">${escapeHtml(audienceLabelV0164(audience))}</span>
        <span class="report-chip">Caso ${escapeHtml(c.meta.numero || 'No informado')}</span>
        <span class="report-chip">${escapeHtml(c.meta.fecha || 'Fecha no informada')}</span>
        <span class="report-chip">App ${escapeHtml(APP_VERSION)}</span>
      </div>
    </header>
    ${metrics}
    ${sections.join('\n')}
    <div class="signature">
      ${state.evaluator.firmaDataUrl ? `<img src="${state.evaluator.firmaDataUrl}" alt="Firma del evaluador" style="max-height:90px;max-width:260px;display:block;margin-bottom:5px">` : '<div style="height:62px"></div>'}
      <div class="signature-line">
        <strong>${escapeHtml(state.evaluator.nombre || 'No informado')}</strong><br>
        <span>${escapeHtml(state.evaluator.profesion || '')}${state.evaluator.registro ? ' · Reg.: ' + escapeHtml(state.evaluator.registro) : ''}</span><br>
        ${state.evaluator.institucion ? `<span style="color:#607489;font-size:13px">${escapeHtml(state.evaluator.institucion)}</span><br>` : ''}
        ${state.evaluator.direccion ? `<span style="color:#607489;font-size:13px">${escapeHtml(state.evaluator.direccion)}</span><br>` : ''}
        <span style="color:#607489;font-size:13px">${escapeHtml(state.evaluator.telefono || '')}${state.evaluator.email ? ' · ' + escapeHtml(state.evaluator.email) : ''}</span>
      </div>
    </div>
    <footer class="report-footer">
      <p><strong>TRAS</strong> — Test de Representaciones de la Vida Afectiva y Social de Ninos, Ninas y Adolescentes.</p>
      <p>Los resultados son orientativos y deben integrarse con entrevista, observacion, historia clinica y juicio profesional. La lista de Goldstein es un tamizaje descriptivo de frecuencias; el perfil de personalidad es una formulacion clinica en desarrollo y no una administracion del MMPI-A.</p>
      <p>Emitido el ${escapeHtml(new Date().toLocaleString('es-CO'))} · Instrumento y app: Jose Alonso Andrade Salazar.</p>
    </footer>
  </main></body></html>`;
}

/* Checklist de cierre: informa que se genero y que falta antes de exportar.
   Es informativo, no bloqueante -- nunca impide exportar un documento parcial,
   solo evita que el profesional olvide un producto por descuido. */
function reportChecklistItems(c) {
  const rep = c.reportes || {};
  const dev = c.devolucionAdolescente && c.devolucionAdolescente.contenido;
  return [
    { label: 'Historia clínica', done: !!(rep.hc && rep.hc.texto && rep.hc.texto.trim()) },
    { label: 'Resultado TRAS', done: !!(rep.tras && rep.tras.texto && rep.tras.texto.trim()) },
    { label: 'Habilidades sociales (Goldstein)', done: !!(rep.goldstein && rep.goldstein.texto && rep.goldstein.texto.trim()) },
    { label: 'Informe integrativo', done: !!(c.informe && c.informe.cierre && String(c.informe.cierre).trim()) },
    { label: 'Matriz Cognitivo-Atencional', done: !!(c.matrizCA && c.matrizCA.aplicado), optional: true },
    { label: 'Devolución terapéutica adolescente', done: !!(dev && Array.isArray(dev.secciones) && dev.secciones.length), optional: true }
  ];
}

function renderReportChecklist() {
  const host = document.getElementById('reportChecklist');
  if (!host) return;
  const c = getCurrentCase();
  const items = reportChecklistItems(c);
  const required = items.filter(i => !i.optional);
  const doneCount = required.filter(i => i.done).length;
  host.innerHTML = `
    <div class="checklist-head">
      <strong>Checklist de cierre</strong>
      <span class="badge ${doneCount === required.length ? 'ok' : 'info'}">${doneCount} de ${required.length} listos</span>
    </div>
    <div class="checklist-items">
      ${items.map(i => `<span class="checklist-item ${i.done ? 'done' : ''}">${i.done ? '✓' : '○'} ${escapeHtml(i.label)}${i.optional ? ' <em>(opcional)</em>' : ''}</span>`).join('')}
    </div>`;
}

function renderReport() {
  renderInformeEditorial();
  renderReportChecklist();
  const host = document.getElementById('reportPreview');
  if (!host) return;
  host.innerHTML = buildReportHtml('preview', typeof selectedAudience === 'function' ? selectedAudience() : 'familias')
    .replace(/<!DOCTYPE html>|<html[^>]*>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<\/html>/g,'');
}

/* Nombre de archivo estable por caso: usa el primer nombre del evaluado
   (sin tildes, sin espacios, sin caracteres invalidos en nombres de archivo).
   Si no hay nombre registrado, cae al numero de caso y luego a "caso", para
   nunca dejar un archivo sin identificar. */
function caseFileSlug(c) {
  const primerNombre = String((c.meta && c.meta.nombre) || '').trim().split(/\s+/)[0] || '';
  const base = primerNombre || (c.meta && c.meta.numero) || 'caso';
  return base
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'caso';
}

function downloadFile(name, content, type='text/html;charset=utf-8') {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function reportHasContent() {
  syncInputsToState();
  const c = getCurrentCase();
  const scope = c.scope || 'ambos';
  const trasConInterp = Object.values(c.interpretations || {}).some(i =>
    ['texto','que_dice','que_sucede','que_se_sugiere'].some(k => String(i && i[k] || '').trim()));
  const trasConRespuestas = Object.values(c.responses || {}).some(r => String(r && r.respuesta || '').trim());
  const trasHallazgos = trasConInterp || trasConRespuestas || String(c.patterns || '').trim() || String(c.consolidated || '').trim();
  const goldHallazgos = c.goldstein && c.goldstein.aplicado && Object.keys(c.goldstein.respuestas || {}).length > 0;
  if (scope === 'tras') return !!trasHallazgos;
  if (scope === 'habilidades') return !!goldHallazgos;
  return !!(trasHallazgos || goldHallazgos);
}

function confirmExportIfEmpty() {
  if (reportHasContent()) return true;
  return confirm('El informe no contiene aun datos evaluativos suficientes. Todas las areas apareceran consignadas, pero varias quedaran como no exploradas. Continuar con la exportacion?');
}

function exportReportHtml() {
  if (!confirmExportIfEmpty()) { toast('Exportacion cancelada.', 'info'); return; }
  downloadFile(caseFileSlug(getCurrentCase()) + '_TRAS.html', buildReportHtml('html', typeof selectedAudience === 'function' ? selectedAudience() : 'familias'));
  toast('Informe HTML descargado.', 'ok');
}
function exportWord() {
  if (!confirmExportIfEmpty()) { toast('Exportacion cancelada.', 'info'); return; }
  downloadFile(caseFileSlug(getCurrentCase()) + '_TRAS.doc', buildReportHtml('word', typeof selectedAudience === 'function' ? selectedAudience() : 'familias'), 'application/msword');
  toast('Documento Word descargado.', 'ok');
}

/* Exportacion a PDF sin dependencias externas: usa el dialogo de impresion
   nativo del navegador sobre un iframe oculto con el documento ya formateado
   para impresion (REPORT_CSS ya trae @media print). El usuario elige
   "Guardar como PDF" como destino. Funciona sin conexion. */
function printHtmlAsPdf(html) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  frame.srcdoc = html;
  frame.onload = () => {
    try { frame.contentWindow.focus(); frame.contentWindow.print(); }
    catch (e) { toast('No se pudo abrir el dialogo de impresion. Usa el formato HTML y luego Imprimir > Guardar como PDF desde tu navegador.', 'warn', 6000); }
    setTimeout(() => frame.remove(), 1000);
  };
  toast('Se abrira el dialogo de impresion: elige "Guardar como PDF" como destino.', 'info', 5200);
}
function exportCasePdf() {
  if (!confirmExportIfEmpty()) { toast('Exportacion cancelada.', 'info'); return; }
  printHtmlAsPdf(buildReportHtml('html', typeof selectedAudience === 'function' ? selectedAudience() : 'familias'));
}

/* Compatibilidad con botones antiguos: ya no omiten el analisis por areas. */
function exportReportAbreviadoHtml() { exportReportHtml(); }
function exportReportAbreviadoWord() { exportWord(); }
function avisarSiNoHayResumen() {
  const c = getCurrentCase();
  if (!String(c.hc.resumen || '').trim()) toast('No hay resumen breve: el informe utilizara la informacion disponible de la HC.', 'warn', 5000);
}

/* ---------- Historia clinica como documento independiente ---------- */
function buildHcHtml() {
  syncInputsToState();
  const c = getCurrentCase();
  const resumen = String(c.hc.resumen || '').trim();
  const campo = (label, txt) => `<h3 style="margin:16px 0 4px;color:#1a3a5c;font-size:15px">${label}</h3><div>${textToHtml(txt) || '<span style="color:#6b7280">No informado.</span>'}</div>`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Historia clinica</title></head>
  <body style="font-family:Arial,sans-serif;color:#163047;padding:28px;line-height:1.45;max-width:820px">
    <h1 style="margin:0;color:#1a3a5c">Historia clinica</h1>
    <div style="margin-top:6px;color:#5e7186">Caso ${escapeHtml(c.meta.numero)} · Fecha ${escapeHtml(c.meta.fecha)}</div>
    <div style="margin-top:2px;color:#8295a8;font-size:12px">Emitido el ${escapeHtml(new Date().toLocaleString('es-CO'))} · TRAS App ${escapeHtml(APP_VERSION)}</div>
    <hr style="margin:16px 0;border:none;border-top:1px solid #d8e0ea">

    <h2 style="color:#1a3a5c">Datos de identificacion</h2>
    <p><strong>Evaluado:</strong> ${escapeHtml(c.meta.nombre || 'No informado')}<br>
    <strong>Edad:</strong> ${escapeHtml(c.meta.edad || '—')} · <strong>Sexo/genero:</strong> ${escapeHtml(c.meta.sexo || '—')}<br>
    <strong>Consentimiento/observacion:</strong> ${escapeHtml(c.meta.consentimiento || '—')}</p>

    ${resumen ? `<h2 style="color:#1a3a5c">Resumen del caso</h2><div style="padding:12px 14px;background:#f7fafc;border:1px solid #dbe5ef;border-radius:12px">${textToHtml(resumen)}</div>` : ''}

    <h2 style="color:#1a3a5c">Desarrollo</h2>
    ${campo('Motivo de consulta', c.hc.motivo)}
    ${campo('Evento detonante', c.hc.evento)}
    ${campo('Contexto familiar', c.hc.familia)}
    ${campo('Contexto escolar', c.hc.escolar)}
    ${campo('Sintomas / manifestaciones', c.hc.sintomas)}
    ${campo('Recursos y apoyos', c.hc.recursos)}
    ${campo('Objetivo terapeutico inicial', c.hc.objetivo)}

    <h3 style="margin:16px 0 4px;color:#1a3a5c;font-size:15px">Alertas clinicas</h3>
    <p>${c.hc.alertas && c.hc.alertas.length ? escapeHtml(c.hc.alertas.join(', ')) : 'Ninguna registrada'}</p>

    <div style="margin-top:44px;page-break-inside:avoid">
      ${state.evaluator.firmaDataUrl ? `<img src="${state.evaluator.firmaDataUrl}" alt="Firma del evaluador" style="max-height:90px;max-width:260px;display:block;margin-bottom:4px">` : '<div style="height:60px"></div>'}
      <div style="border-top:1px solid #1a3a5c;width:300px;padding-top:6px">
        <strong>${escapeHtml(state.evaluator.nombre || '—')}</strong><br>
        <span style="color:#3a536b">${escapeHtml(state.evaluator.profesion || '')}${state.evaluator.registro ? ' · Reg.: ' + escapeHtml(state.evaluator.registro) : ''}</span><br>
        <span style="color:#5e7186;font-size:13px">${escapeHtml(state.evaluator.institucion || '')}</span>
      </div>
    </div>
    <hr style="margin:22px 0;border:none;border-top:1px solid #d8e0ea">
    <p style="font-size:12px;color:#6b7280;text-align:center">Documento clinico confidencial. Contiene datos sensibles de un menor de edad; su custodia y circulacion son responsabilidad del profesional que lo firma.</p>
  </body></html>`;
}
function exportHcHtml() { downloadFile(caseFileSlug(getCurrentCase()) + '_HC.html', buildHcHtml()); toast('Historia clinica (HTML) descargada.', 'ok'); }
function exportHcWord() { downloadFile(caseFileSlug(getCurrentCase()) + '_HC.doc', buildHcHtml(), 'application/msword'); toast('Historia clinica (.doc) descargada.', 'ok'); }
function exportCaseJson() {
  syncInputsToState();
  const c = getCurrentCase();
  const payload = Object.assign({ _exportApp: APP_VERSION, _exportSchema: (typeof CASE_SCHEMA !== 'undefined' ? CASE_SCHEMA : 1), _exportedAt: new Date().toISOString() }, JSON.parse(JSON.stringify(c)));
  downloadFile(caseFileSlug(c) + '_TRAS.json', JSON.stringify(payload, null, 2), 'application/json');
  toast('Caso exportado en JSON.', 'ok');
}

/* Importa un caso completo previamente exportado en JSON. */
function importCaseJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || ''));
      const importedSchema = data._exportSchema;
      const incoming = normalizeCase(data);

      // Si ya existe un caso con la misma identidad (numero + nombre), se
      // ofrece ACTUALIZARLO en vez de crear otra tarjeta. La fusion nunca es
      // automatica: siempre se confirma, porque sobreescribe el contenido.
      const existente = findDuplicateCase(incoming, null);
      let c;
      if (existente) {
        const stamp = new Date(existente.updatedAt).toLocaleString('es-CO');
        const actualizar = confirm(
          `Ya existe un caso con el mismo numero y nombre:\n\n` +
          `  ${existente.meta.numero} — ${existente.meta.nombre}\n  Ultima actualizacion: ${stamp}\n\n` +
          `Aceptar = ACTUALIZAR ese caso con el archivo importado (se conserva su historial).\n` +
          `Cancelar = crear un caso NUEVO e independiente.`
        );
        if (actualizar) {
          c = mergeIntoCase(existente, incoming, 'Actualizado desde archivo JSON importado');
          state.currentCaseId = c.id;
          persist();
          sortCasesByRecent();
          hydrateInputs();
          renderCaseList();
          goStep(2);
          toast('Caso actualizado. No se creo una copia; revisa el historial del caso.', 'ok', 5000);
          event.target.value = '';
          return;
        }
      }

      c = incoming;
      const now = new Date().toISOString();
      c.id = 'case_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
      c.updatedAt = now;
      c.historial = (Array.isArray(c.historial) ? c.historial : []).concat([{ ts: now, nota: 'Importado desde archivo JSON' }]);
      state.cases.unshift(c);
      state.currentCaseId = c.id;
      persist();
      sortCasesByRecent();
      hydrateInputs();
      renderCaseList();
      goStep(2);
      if (typeof importedSchema === 'number' && typeof CASE_SCHEMA === 'number' && importedSchema !== CASE_SCHEMA) {
        toast('Caso importado. Fue creado con otra version del esquema (v' + importedSchema + ' vs v' + CASE_SCHEMA + '); se adapto automaticamente, revisa los datos.', 'warn', 6000);
      } else {
        toast('Caso importado correctamente.', 'ok');
      }
    } catch (e) {
      toast('No se pudo leer el caso: archivo JSON invalido.', 'danger');
    }
    event.target.value = '';
  };
  reader.readAsText(file, 'utf-8');
}

/* ---------- Firma ---------- */
function renderSignaturePreview() {
  const box = document.getElementById('firmaPreviewBox');
  if (!box) return;
  const dataUrl = state.evaluator.firmaDataUrl || '';
  if (!dataUrl) { box.textContent = 'Sin firma cargada.'; return; }
  box.innerHTML = `<img src="${dataUrl}" alt="Firma del evaluador" style="max-width:100%;max-height:90px;display:block">`;
}
function loadSignatureFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) { toast('Selecciona una imagen valida para la firma.', 'warn'); event.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = () => { state.evaluator.firmaDataUrl = String(reader.result || ''); renderSignaturePreview(); persist(); toast('Firma cargada.', 'ok'); };
  reader.readAsDataURL(file);
}
function clearSignature() {
  state.evaluator.firmaDataUrl = '';
  const input = document.getElementById('ev_firma_file');
  if (input) input.value = '';
  renderSignaturePreview();
  persist();
}
function useSampleSignature() {
  if (typeof SAMPLE_SIGNATURE_DATAURL === 'undefined' || !SAMPLE_SIGNATURE_DATAURL) {
    toast('No hay firma de muestra disponible.', 'warn'); return;
  }
  state.evaluator.firmaDataUrl = SAMPLE_SIGNATURE_DATAURL;
  renderSignaturePreview();
  persist();
  toast('Firma de muestra cargada. Puedes quitarla cuando quieras.', 'ok');
}

/* ---------- Soporte XLSX (OOXML minimo, sin librerias) ---------- */
function xmlEscape(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function colLetter(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - m - 1) / 26); }
  return s;
}
function rowsToSheetXml(rows) {
  const cols = Math.max(...rows.map(r => r.length), 1);
  const ref = `A1:${colLetter(cols)}${rows.length || 1}`;
  const rowXml = rows.map((row, rIdx) => {
    const cells = row.map((value, cIdx) => {
      const refCell = `${colLetter(cIdx + 1)}${rIdx + 1}`;
      if (value === null || value === undefined || value === '') return `<c r="${refCell}" t="inlineStr"><is><t></t></is></c>`;
      const num = typeof value === 'number' && Number.isFinite(value);
      return num
        ? `<c r="${refCell}"><v>${value}</v></c>`
        : `<c r="${refCell}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
    }).join('');
    return `<row r="${rIdx + 1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${ref}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${Array.from({length: cols}, (_, i) => `<col min="${i+1}" max="${i+1}" width="22" customWidth="1"/>`).join('')}</cols>
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); table[n] = c >>> 0; }
  return table;
}
const CRC_TABLE = makeCrcTable();
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function u16(n){ return [n & 255, (n >>> 8) & 255]; }
function u32(n){ return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }

function zipStore(files) {
  const te = new TextEncoder();
  let offset = 0;
  const localParts = [];
  const centralParts = [];
  files.forEach(f => {
    const nameBytes = te.encode(f.name);
    const dataBytes = te.encode(f.content);
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(dataBytes.length), ...u32(dataBytes.length), ...u16(nameBytes.length), ...u16(0)
    ]);
    localParts.push(localHeader, nameBytes, dataBytes);
    const centralHeader = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(dataBytes.length), ...u32(dataBytes.length), ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
    ]);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  });
  const centralSize = centralParts.reduce((n, p) => n + p.length, 0);
  const endRecord = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(offset), ...u16(0)
  ]);
  const parts = [...localParts, ...centralParts, endRecord];
  return new Blob(parts, {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

function exportCaseXlsx() {
  syncInputsToState();
  const c = getCurrentCase();
  const summaryRows = [
    ['Campo','Valor'],
    ['Caso', c.meta.numero || ''],
    ['Fecha', c.meta.fecha || ''],
    ['Evaluado', c.meta.nombre || ''],
    ['Edad', c.meta.edad || ''],
    ['Sexo / genero', c.meta.sexo || ''],
    ['Consentimiento / observacion', c.meta.consentimiento || ''],
    ['Evaluador', state.evaluator.nombre || ''],
    ['Profesion', state.evaluator.profesion || ''],
    ['Registro profesional', state.evaluator.registro || ''],
    ['Institucion', state.evaluator.institucion || ''],
    ['Direccion', state.evaluator.direccion || ''],
    ['Telefono', state.evaluator.telefono || ''],
    ['Email', state.evaluator.email || ''],
    ['Motivo de consulta', c.hc.motivo || ''],
    ['Evento detonante', c.hc.evento || ''],
    ['Contexto familiar', c.hc.familia || ''],
    ['Contexto escolar', c.hc.escolar || ''],
    ['Sintomas / manifestaciones', c.hc.sintomas || ''],
    ['Recursos y apoyos', c.hc.recursos || ''],
    ['Objetivo terapeutico inicial', c.hc.objetivo || ''],
    ['Alertas clinicas', (c.hc.alertas || []).join(', ')]
  ];
  const responseRows = [[
    'Caso','Fecha','Evaluado','Area','Item','Ciclo','Enunciado','Respuesta','Nota evaluador','Profundizar','Pregunta de profundizacion','Area sensible','Accion sensible','Alerta clinica'
  ]];
  allAreas().forEach(area => {
    const action = c.modules.sensibles[area.id] || 'aplicar';
    area.items.forEach(i => {
      const st = itemState(i.id);
      responseRows.push([
        c.meta.numero || '', c.meta.fecha || '', c.meta.nombre || '',
        area.nombre || '', i.num_test || '', i.ciclo || '', i.texto || '',
        st.respuesta || '', st.notas || '',
        st.profundizar ? 'Si' : 'No',
        st.profundizar ? (i.profundizacion || '') : '',
        area.sensible ? 'Si' : 'No', action,
        i.alerta_clinica ? 'Si' : 'No'
      ]);
    });
  });
  const now = new Date().toISOString();
  // Hoja anexa Goldstein (solo si se aplico)
  const gold = c.goldstein;
  const goldApplied = gold && gold.aplicado;
  let goldRows = null;
  if (goldApplied && typeof computeGoldstein === 'function') {
    const gr = computeGoldstein(gold.respuestas);
    goldRows = [['Bateria de habilidades sociales (Goldstein) · tamizaje de frecuencias']];
    goldRows.push([]);
    goldRows.push(['Num','Grupo','Habilidad','Respuesta','Etiqueta']);
    GOLDSTEIN_ITEMS.forEach(it => {
      const v = gold.respuestas[String(it.num)];
      const grp = GOLDSTEIN_GRUPOS.find(x => x.id === it.grupo);
      goldRows.push([
        it.num, grp ? grp.romano + '. ' + grp.nombre : '', it.texto,
        v ? GOLDSTEIN_NIVELES[v].titulo : '', v ? GOLDSTEIN_NIVELES[v].etiqueta : ''
      ]);
    });
    goldRows.push([]);
    goldRows.push(['Resumen por grupo','% Escasas','% Buenas','% Muy buenas','Respondidos']);
    gr.porGrupo.forEach(grp => goldRows.push([grp.romano+'. '+grp.nombre, grp.pct.nunca, grp.pct.aveces, grp.pct.siempre, grp.respondidos+'/'+grp.total]));
    goldRows.push([]);
    goldRows.push(['Global', gr.global.pct.nunca, gr.global.pct.aveces, gr.global.pct.siempre, gr.global.respondidos+'/'+gr.global.total]);
    goldRows.push(['Clasificacion', gr.clasificacion.etiqueta]);
    const gi = (typeof goldsteinInterp === 'function') ? goldsteinInterp(gold) : (gold.interp || {});
    const sug = String(gi.sugerencias || '').split(/\n+/).map(s=>s.replace(/^\s*\d+[\).\-]\s*/,'').trim()).filter(Boolean);
    if (gi.que_sale || gi.analisis_causal || sug.length || gi.conclusion) {
      goldRows.push([]);
      goldRows.push(['Interpretacion estructurada','']);
      if (gi.que_sale) goldRows.push(['a) Habilidades que salen', gi.que_sale]);
      if (gi.analisis_causal) goldRows.push(['b) Lectura contextual del perfil', gi.analisis_causal]);
      if (sug.length) { goldRows.push(['c) Indicaciones de mejora', sug[0]]); for (let i=1;i<sug.length;i++) goldRows.push(['', sug[i]]); }
      const concl = (gi.conclusion && gi.conclusion.trim()) ? gi.conclusion.trim() : gr.clasificacion.descripcion;
      goldRows.push(['d) Conclusion (nivel)', gr.clasificacion.etiqueta + '. ' + concl]);
    }
  }
  const files = [
    {name:'[Content_Types].xml', content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>${goldRows ? '\n  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' : ''}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`},
    {name:'_rels/.rels', content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`},
    {name:'docProps/core.xml', content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>TRAS Soporte XLSX</dc:title>
  <dc:creator>TRAS App</dc:creator>
  <cp:lastModifiedBy>TRAS App</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`},
    {name:'docProps/app.xml', content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>TRAS App ${APP_VERSION}</Application>
</Properties>`},
    {name:'xl/workbook.xml', content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Resumen" sheetId="1" r:id="rId1"/>
    <sheet name="Respuestas" sheetId="2" r:id="rId2"/>${goldRows ? '\n    <sheet name="Goldstein" sheetId="3" r:id="rId3"/>' : ''}
  </sheets>
</workbook>`},
    {name:'xl/_rels/workbook.xml.rels', content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>${goldRows ? '\n  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>' : ''}
</Relationships>`},
    {name:'xl/worksheets/sheet1.xml', content: rowsToSheetXml(summaryRows)},
    {name:'xl/worksheets/sheet2.xml', content: rowsToSheetXml(responseRows)}
  ];
  if (goldRows) files.push({name:'xl/worksheets/sheet3.xml', content: rowsToSheetXml(goldRows)});
  const blob = zipStore(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = caseFileSlug(c) + '_TRAS_soporte.xlsx';
  a.click();
  URL.revokeObjectURL(url);
  toast('Soporte XLSX descargado.', 'ok');
}

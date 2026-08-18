(function () {
  'use strict';
  const STAI = window.STAI = window.STAI || {};

  function esc(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function nl2br(value) { return esc(value).replace(/\n/g, '<br>'); }
  function yes(value) { return value ? 'Sí' : 'No'; }
  function fmtDate(value) {
    if (!value) return 'No registrada';
    const p = String(value).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : esc(value);
  }

  function item(label, value) {
    if (value === '' || value === null || value === undefined) return '';
    return '<div class="kv"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>';
  }

  function list(values, emptyText) {
    if (!Array.isArray(values) || !values.length) return '<p class="muted">' + esc(emptyText || 'Sin información estructurada.') + '</p>';
    return '<ul>' + values.map(function (v) {
      const text = typeof v === 'string' ? v : (v && (v.texto || v.nombre || v.factor || JSON.stringify(v)));
      return '<li>' + esc(text || '') + '</li>';
    }).join('') + '</ul>';
  }

  function factorsTable(ai) {
    const rows = ai && Array.isArray(ai.factores_contextuales) ? ai.factores_contextuales : [];
    if (!rows.length) return '<p class="muted">No se recibieron factores contextuales estructurados.</p>';
    return '<div class="table-wrap"><table><thead><tr><th>Factor</th><th>Tipo</th><th>Evidencia</th><th>Relación propuesta</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><b>' + esc(r.factor) + '</b></td><td>' + esc(r.tipo) + '</td><td>' + esc(r.evidencia) + '</td><td>' + esc(r.relacion) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function hypotheses(ai) {
    const rows = ai && Array.isArray(ai.hipotesis_clinicas) ? ai.hipotesis_clinicas : [];
    if (!rows.length) return '<p class="muted">No se recibieron hipótesis clínicas estructuradas.</p>';
    return '<div class="cards">' + rows.map(function (h, i) {
      return '<article class="card"><div class="pill">Hipótesis ' + (i + 1) + '</div><h3>' + esc(h.hipotesis) + '</h3>' +
        '<h4>Evidencia a favor</h4>' + list(h.evidencia_a_favor, 'No registrada.') +
        '<h4>Evidencia que limita o contradice</h4>' + list(h.evidencia_en_contra, 'No registrada.') +
        '<h4>Cómo contrastarla</h4><p>' + esc(h.como_contrastar || 'No indicado.') + '</p></article>';
    }).join('') + '</div>';
  }

  function radarSvg(dimensions) {
    if (!Array.isArray(dimensions) || dimensions.length < 3) return '<div class="empty-visual">La IA no devolvió suficientes dimensiones para construir el radar.</div>';
    const dims = dimensions.slice(0, 9).map(function (d) {
      return { nombre: String(d.nombre || 'Dimensión'), valor: Math.max(0, Math.min(10, Number(d.valor) || 0)) };
    });
    const size = 520, cx = 260, cy = 250, radius = 150, n = dims.length;
    function point(i, rr) {
      const a = -Math.PI / 2 + (Math.PI * 2 * i / n);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    }
    let grid = '';
    [2,4,6,8,10].forEach(function (level) {
      const pts = dims.map(function (_, i) { const p = point(i, radius * level / 10); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      grid += '<polygon points="' + pts + '" fill="none" stroke="#dfe7ef" stroke-width="1"/>';
    });
    let axes = '', labels = '';
    dims.forEach(function (d, i) {
      const p = point(i, radius);
      const lp = point(i, radius + 42);
      const anchor = lp[0] < cx - 20 ? 'end' : (lp[0] > cx + 20 ? 'start' : 'middle');
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#d6e0ea"/>';
      labels += '<text x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="12" fill="#43556c">' + esc(d.nombre).slice(0, 22) + '</text>';
    });
    const valuePts = dims.map(function (d, i) { const p = point(i, radius * d.valor / 10); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Radar de dimensiones contextuales">' + grid + axes + '<polygon points="' + valuePts + '" fill="rgba(61,90,128,.18)" stroke="#3d5a80" stroke-width="3"/>' + labels + '</svg>';
  }

  function networkSvg(ai) {
    const factors = ai && Array.isArray(ai.factores_contextuales) ? ai.factores_contextuales.slice(0, 10) : [];
    const rels = ai && Array.isArray(ai.relaciones) ? ai.relaciones.slice(0, 16) : [];
    if (factors.length < 2) return '<div class="empty-visual">La IA no devolvió suficientes factores para construir la red relacional.</div>';
    const nodes = factors.map(function (f) { return { name: String(f.factor || 'Factor'), type: String(f.tipo || 'contexto') }; });
    const width = 720, height = 420, cx = width / 2, cy = height / 2, r = 150;
    const coords = {};
    nodes.forEach(function (node, i) {
      const a = -Math.PI/2 + Math.PI*2*i/nodes.length;
      coords[node.name] = { x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r };
    });
    let edges = '';
    rels.forEach(function (rel) {
      const a = coords[String(rel.origen || '')], b = coords[String(rel.destino || '')];
      if (!a || !b) return;
      edges += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="#aab9c9" stroke-width="1.6" marker-end="url(#arrow)"/>';
    });
    if (!rels.length) {
      nodes.forEach(function (node, i) {
        const next = nodes[(i + 1) % nodes.length];
        const a = coords[node.name], b = coords[next.name];
        edges += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="#d1dae4" stroke-width="1"/>';
      });
    }
    let circles = '';
    nodes.forEach(function (node) {
      const p = coords[node.name];
      circles += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="40" fill="#f4f7fb" stroke="#5d7896" stroke-width="2"/>' +
        '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - 5).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#263950">' + esc(node.name).slice(0,18) + '</text>' +
        '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + 12).toFixed(1) + '" text-anchor="middle" font-size="9" fill="#718096">' + esc(node.type).slice(0,18) + '</text>';
    });
    return '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Red relacional de factores"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#aab9c9"/></marker></defs>' + edges + circles + '</svg>';
  }

  function evaluatorSection(evaluator) {
    evaluator = evaluator || {};
    const hasData = Object.keys(evaluator).some(function (k) { return evaluator[k]; });
    if (!hasData) return '';
    const signature = evaluator.signatureDataUrl ? '<img class="signature" src="' + esc(evaluator.signatureDataUrl) + '" alt="Firma del evaluador">' : '<div class="signature-placeholder">Firma no registrada</div>';
    return '<section class="section page-break-avoid"><h2>Profesional evaluador</h2><div class="professional-card">' +
      '<div class="signature-first"><div class="mini-label">Firma</div>' + signature + '</div>' +
      '<div class="professional-data">' +
      item('Nombre', evaluator.name) + item('Profesión', evaluator.profession) + item('Tarjeta profesional', evaluator.license) +
      item('Celular', evaluator.phone) + item('Correo electrónico', evaluator.email) + item('Consultorio / institución', evaluator.workplace) +
      item('Dirección', evaluator.address) + item('Ciudad / país', evaluator.cityCountry) +
      '</div></div></section>';
  }

  function consentSection(consent) {
    consent = consent || {};
    return '<section class="section page-break-avoid"><h2>Registro de consentimiento informado</h2><div class="consent-card"><div class="consent-mark">✓</div><div><b>Aceptación registrada por la persona evaluada</b><p>' + esc(consent.text || '') + '</p><div class="consent-meta">Aceptación: ' + yes(consent.accepted) + ' · Fecha y hora: ' + esc(consent.acceptedAt || 'No registrada') + ' · Modalidad: registro electrónico dentro de la aplicación.</div></div></div></section>';
  }

  function aiSections(ai) {
    if (!ai) return '<section class="section"><div class="callout"><b>Informe sin contextualización mediante IA.</b> Se presentan los resultados STAI y la información básica registrada en la aplicación.</div></section>';
    return '<section class="section"><h2>Contextualización clínica asistida por IA</h2><div class="callout caution"><b>Lectura auxiliar.</b> Este contenido organiza relaciones e hipótesis a partir de los datos suministrados; debe contrastarse con el juicio profesional y no reemplaza la evaluación clínica.</div>' +
      '<div class="grid"><div class="card span12"><h3>Síntesis integrada</h3><p>' + esc(ai.resumen_integrado || 'No registrada.') + '</p></div><div class="card span6"><h3>Ansiedad-Estado</h3><p>' + esc(ai.lectura_estado || 'No registrada.') + '</p></div><div class="card span6"><h3>Ansiedad-Rasgo</h3><p>' + esc(ai.lectura_rasgo || 'No registrada.') + '</p></div><div class="card span12"><h3>Relación Estado-Rasgo</h3><p>' + esc(ai.relacion_estado_rasgo || 'No registrada.') + '</p></div></div></section>' +
      '<section class="section"><h2>Mapa de dimensiones contextuales</h2><div class="grid"><div class="card span7 visual">' + radarSvg(ai.dimensiones_contextuales) + '</div><div class="card span5"><h3>Clave de lectura</h3><p>El radar representa dimensiones contextuales propuestas por la IA en una escala auxiliar 0–10. <b>No son subescalas oficiales del STAI</b> ni resultados psicométricos.</p>' + list((ai.dimensiones_contextuales || []).map(function(d){return (d.nombre || 'Dimensión') + ': ' + (d.valor === undefined ? '—' : d.valor) + '/10';}), 'Sin dimensiones.') + '</div></div></section>' +
      '<section class="section"><h2>Red relacional hipotética</h2><div class="grid"><div class="card span8 visual">' + networkSvg(ai) + '</div><div class="card span4"><h3>Recursos y factores protectores</h3>' + list(ai.recursos_protectores, 'Sin recursos protectores estructurados.') + '<p class="muted">Las conexiones representan relaciones propuestas para exploración; no demuestran causalidad.</p></div></div></section>' +
      '<section class="section"><h2>Factores contextuales</h2>' + factorsTable(ai) + '</section>' +
      '<section class="section"><h2>Hipótesis de trabajo</h2>' + hypotheses(ai) + '</section>' +
      '<section class="section"><div class="grid"><div class="card span6"><h2>Alertas para explorar</h2>' + list(ai.alertas, 'Sin alertas estructuradas.') + '</div><div class="card span6"><h2>Preguntas clínicas sugeridas</h2>' + list(ai.preguntas_clinicas_sugeridas, 'Sin preguntas sugeridas.') + '</div><div class="card span12"><h2>Próximos focos de evaluación</h2>' + list(ai.recomendaciones_evaluacion, 'Sin focos estructurados.') + '</div><div class="card span12"><h2>Límites interpretativos</h2><p>' + esc(ai.limites_interpretativos || 'La lectura debe contrastarse con entrevista, observación, antecedentes y otras fuentes de evaluación.') + '</p></div></div></section>';
  }


  function briefContent(payload) {
    const p = payload.patient || {};
    const r = payload.results || {};
    const ai = payload.aiJson || null;
    const ib = ai && ai.informe_sencillo && typeof ai.informe_sencillo === 'object' ? ai.informe_sencillo : {};

    let interpretation = String(ib.interpretacion_instrumento || '').trim();
    if (!interpretation && ai) {
      const parts = [];
      if (ai.lectura_estado) parts.push('Ansiedad-Estado: ' + ai.lectura_estado);
      if (ai.lectura_rasgo) parts.push('Ansiedad-Rasgo: ' + ai.lectura_rasgo);
      if (ai.relacion_estado_rasgo) parts.push('Lectura conjunta: ' + ai.relacion_estado_rasgo);
      interpretation = parts.join(' ');
    }
    if (!interpretation) {
      interpretation = 'La puntuación de Ansiedad-Estado fue ' + r.stateScore + '/60 (' + (r.stateDecatypeBand || r.statePosition || 'posición descriptiva no disponible') + ') y describe el nivel de activación ansiosa presente al momento de responder. La puntuación de Ansiedad-Rasgo fue ' + r.traitScore + '/60 (' + (r.traitDecatypeBand || r.traitPosition || 'posición descriptiva no disponible') + ') y aporta información sobre la tendencia relativamente estable a experimentar ansiedad. La lectura conjunta disponible es: ' + (r.integrated || 'no registrada') + '.';
    }

    let relations = Array.isArray(ib.relaciones_estado_actual) ? ib.relaciones_estado_actual.filter(Boolean).map(String) : [];
    if (!relations.length && ai && Array.isArray(ai.factores_contextuales)) {
      relations = ai.factores_contextuales.slice(0, 6).map(function (f) {
        const factor = f && f.factor ? String(f.factor) : 'Factor contextual';
        const relacion = f && f.relacion ? String(f.relacion) : '';
        const evidencia = f && f.evidencia ? String(f.evidencia) : '';
        return factor + (relacion ? ': ' + relacion : '') + (evidencia ? ' Sustento registrado: ' + evidencia + '.' : '');
      });
    }
    if (!relations.length) {
      relations = [
        'La puntuación de Ansiedad-Estado describe la activación ansiosa existente en el momento específico de la aplicación; por sí sola no identifica la causa de esa activación.',
        'La puntuación de Ansiedad-Rasgo aporta una referencia sobre la disposición habitual a responder con ansiedad y permite contextualizar si la activación actual parece más situacional o congruente con una tendencia estable.',
        'Sin información clínica o contextual adicional validada, no es posible establecer relaciones causales específicas respecto del estado actual únicamente a partir del STAI.'
      ];
    }

    let conclusion = String(ib.conclusion_final || '').trim();
    if (!conclusion && ai && ai.resumen_integrado) conclusion = String(ai.resumen_integrado);
    if (!conclusion) {
      conclusion = 'Los resultados del STAI deben leerse como una descripción de la ansiedad actual y de la tendencia ansiosa informada por la persona evaluada. La puntuación obtenida no constituye por sí sola un diagnóstico ni permite atribuir causalidad a hechos específicos. Su alcance debe integrarse con la finalidad de la evaluación y con las demás fuentes clínicas o documentales disponibles.';
    }

    return {
      interpretation: interpretation,
      relations: relations,
      conclusion: conclusion,
      source: ai ? 'Contextualización asistida por IA y revisable por el profesional.' : 'Lectura instrumental generada sin contextualización mediante IA.'
    };
  }

  function buildBriefReportHtml(payload, options) {
    options = options || {};
    const p = payload.patient || {};
    const r = payload.results || {};
    const e = payload.evaluator || {};
    const b = briefContent(payload);
    const generatedAt = payload.generatedAt || new Date().toLocaleString('es-CO');
    const demoBadge = payload.demoMode ? '<div class="demo-banner">MODO DEMOSTRACIÓN · DATOS COMPLETAMENTE FICTICIOS</div>' : '';
    const autoPrint = options.autoPrint ? 'window.addEventListener("load",function(){setTimeout(function(){window.print();},350);});' : '';

    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe breve STAI</title><style>' +
      ':root{--ink:#17263a;--muted:#657388;--line:#dce5ee;--soft:#f6f8fb;--accent:#3d5a80}*{box-sizing:border-box}body{margin:0;background:#edf2f7;color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.55}.toolbar{position:sticky;top:0;z-index:20;display:flex;gap:8px;justify-content:center;padding:10px;background:#17253a}.toolbar button{border:0;border-radius:8px;padding:9px 13px;font-weight:700;cursor:pointer}.paper{max-width:900px;margin:24px auto;background:#fff;box-shadow:0 18px 60px rgba(20,35,55,.14);padding:44px}.hero{border-bottom:3px solid var(--accent);padding-bottom:18px}.hero h1{font-size:30px;margin:0 0 5px}.hero p{margin:0;color:var(--muted)}.pill{display:inline-block;padding:4px 8px;border-radius:999px;background:#edf3f8;color:#3d5a80;font-size:11px;font-weight:800}.section{padding:22px 0;border-bottom:1px solid var(--line)}h2{font-size:20px;margin:0 0 12px}h3{font-size:15px;margin:0 0 8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card,.professional-card{border:1px solid var(--line);border-radius:12px;padding:16px;background:#fff}.score{font-size:36px;font-weight:900}.score small{font-size:14px;color:var(--muted)}.kv{display:grid;grid-template-columns:165px 1fr;gap:10px;padding:7px 0;border-bottom:1px solid #edf1f5}.kv span{font-size:12px;color:var(--muted)}ul{margin:6px 0;padding-left:22px}li{margin:7px 0}.note{padding:12px 14px;border-left:4px solid var(--accent);background:var(--soft);border-radius:8px;color:#33465e}.muted{color:var(--muted)}.signature-first{padding-bottom:15px;border-bottom:1px solid var(--line);margin-bottom:10px}.mini-label{text-transform:uppercase;font-size:10px;letter-spacing:.12em;color:var(--muted);font-weight:800;margin-bottom:8px}.signature{display:block;max-width:260px;max-height:110px;object-fit:contain;object-position:left center}.signature-placeholder{height:55px;display:flex;align-items:end;color:#8792a1;font-style:italic}.demo-banner{background:#fff4d9;border:1px solid #ead18b;padding:10px 14px;border-radius:10px;font-weight:800;margin-bottom:18px}.foot{padding-top:22px;color:var(--muted);font-size:11px}@media(max-width:700px){.paper{margin:0;padding:22px}.grid{grid-template-columns:1fr}.kv{grid-template-columns:1fr}.toolbar{position:static}}@media print{body{background:#fff}.toolbar{display:none}.paper{max-width:none;margin:0;box-shadow:none;padding:0 7mm}.section,.card,.professional-card{break-inside:avoid}@page{size:A4;margin:12mm}}' +
      '</style></head><body><div class="toolbar"><button onclick="window.print()">Imprimir / Guardar PDF</button></div><main class="paper">' + demoBadge +
      '<header class="hero"><div class="pill">Informe breve · STAI</div><h1>Inventario de Ansiedad Estado-Rasgo</h1><p>Versión sintética para remisión, soporte documental o contexto jurídico</p></header>' +
      '<section class="section"><h2>1. Identificación y aplicación</h2><div class="grid"><div class="card">' + item('Nombre', p.name || 'No registrado') + item('Código / historia', p.code) + item('Edad', p.age !== '' ? p.age + ' años' : '') + item('Sexo para baremación', p.sex) + item('Ocupación', p.occupation) + '</div><div class="card">' + item('Fecha de aplicación', fmtDate(p.applicationDate)) + item('Hora', p.applicationTime) + item('Modalidad', p.modality) + item('País / región', p.country) + item('Motivo / contexto', p.context) + '</div></div></section>' +
      '<section class="section"><h2>2. Resultados</h2><div class="grid"><div class="card"><div class="score">' + esc(r.stateScore) + '<small>/60</small></div><h3>Ansiedad-Estado</h3><p>' + esc(r.stateDecatypeBand || r.statePosition || '') + (r.stateDecatype ? ' · Decatipo ' + esc(r.stateDecatype) : '') + '</p></div><div class="card"><div class="score">' + esc(r.traitScore) + '<small>/60</small></div><h3>Ansiedad-Rasgo</h3><p>' + esc(r.traitDecatypeBand || r.traitPosition || '') + (r.traitDecatype ? ' · Decatipo ' + esc(r.traitDecatype) : '') + '</p></div></div></section>' +
      '<section class="section"><h2>3. Interpretación a la luz del instrumento</h2><p>' + esc(b.interpretation) + '</p></section>' +
      '<section class="section"><h2>4. Relaciones relevantes con el estado actual</h2>' + list(b.relations, 'No se identificaron relaciones contextuales suficientes.') + '<div class="note"><b>Alcance:</b> estas viñetas describen relaciones causales, contribuyentes o asociativas solo cuando la información aportada las sustenta. La coincidencia temporal o correlacional no se presenta como causalidad demostrada.</div></section>' +
      '<section class="section"><h2>5. Conclusión final</h2><p>' + esc(b.conclusion) + '</p><p class="muted">' + esc(b.source) + '</p></section>' +
      evaluatorSection(e) +
      '<div class="foot">Generado el ' + esc(generatedAt) + '. Este informe breve omite deliberadamente hipótesis clínicas y visualizaciones. El STAI no constituye por sí solo un diagnóstico.</div></main><script>' + autoPrint + '<\/script></body></html>';
  }

  function buildBriefTextReport(payload) {
    const p = payload.patient || {}, r = payload.results || {}, e = payload.evaluator || {}, b = briefContent(payload);
    const lines = [];
    lines.push('INFORME BREVE STAI — REMISIÓN / SOPORTE DOCUMENTAL / CONTEXTO JURÍDICO');
    if (payload.demoMode) lines.push('MODO DEMOSTRACIÓN — DATOS COMPLETAMENTE FICTICIOS');
    lines.push('');
    lines.push('1. IDENTIFICACIÓN Y APLICACIÓN');
    lines.push('Nombre: ' + (p.name || 'No registrado'));
    if (p.code) lines.push('Código / historia: ' + p.code);
    if (p.age !== '' && p.age !== undefined) lines.push('Edad: ' + p.age + ' años');
    if (p.sex) lines.push('Sexo para baremación: ' + p.sex);
    if (p.occupation) lines.push('Ocupación: ' + p.occupation);
    if (p.applicationDate) lines.push('Fecha de aplicación: ' + p.applicationDate + (p.applicationTime ? ' ' + p.applicationTime : ''));
    if (p.modality) lines.push('Modalidad: ' + p.modality);
    if (p.context) lines.push('Motivo / contexto: ' + p.context);
    lines.push('');
    lines.push('2. RESULTADOS');
    lines.push('Ansiedad-Estado: ' + r.stateScore + '/60. ' + (r.stateDecatypeBand || r.statePosition || '') + (r.stateDecatype ? ' · Decatipo ' + r.stateDecatype : ''));
    lines.push('Ansiedad-Rasgo: ' + r.traitScore + '/60. ' + (r.traitDecatypeBand || r.traitPosition || '') + (r.traitDecatype ? ' · Decatipo ' + r.traitDecatype : ''));
    lines.push('');
    lines.push('3. INTERPRETACIÓN A LA LUZ DEL INSTRUMENTO');
    lines.push(b.interpretation);
    lines.push('');
    lines.push('4. RELACIONES RELEVANTES CON EL ESTADO ACTUAL');
    b.relations.forEach(function (v) { lines.push('- ' + v); });
    lines.push('Alcance: las relaciones causales, contribuyentes o asociativas se expresan únicamente cuando la información disponible las sustenta; no se equipara correlación con causalidad demostrada.');
    lines.push('');
    lines.push('5. CONCLUSIÓN FINAL');
    lines.push(b.conclusion);
    lines.push('Fuente de contextualización: ' + b.source);
    const hasEvaluator = Object.keys(e).some(function(k){ return e[k]; });
    if (hasEvaluator) {
      lines.push(''); lines.push('PROFESIONAL EVALUADOR');
      lines.push('[Firma incorporada primero en las versiones visuales, si fue registrada]');
      if (e.name) lines.push('Nombre: ' + e.name);
      if (e.profession) lines.push('Profesión: ' + e.profession);
      if (e.license) lines.push('Tarjeta profesional: ' + e.license);
      if (e.phone) lines.push('Celular: ' + e.phone);
      if (e.email) lines.push('Correo: ' + e.email);
      if (e.workplace) lines.push('Consultorio / institución: ' + e.workplace);
      if (e.address) lines.push('Dirección: ' + e.address);
      if (e.cityCountry) lines.push('Ciudad / país: ' + e.cityCountry);
    }
    lines.push(''); lines.push('El STAI no constituye por sí solo un diagnóstico. Este formato breve omite deliberadamente hipótesis clínicas.');
    return lines.join('\n');
  }

  function buildReportHtml(payload, options) {
    options = options || {};
    const p = payload.patient || {};
    const r = payload.results || {};
    const c = payload.consent || {};
    const e = payload.evaluator || {};
    const ai = payload.aiJson || null;
    const generatedAt = payload.generatedAt || new Date().toLocaleString('es-CO');
    const demoBadge = payload.demoMode ? '<div class="demo-banner">MODO DEMOSTRACIÓN · DATOS COMPLETAMENTE FICTICIOS</div>' : '';
    const safeData = JSON.stringify(payload).replace(/</g, '\\u003c');
    const autoPrint = options.autoPrint ? 'window.addEventListener("load",function(){setTimeout(function(){window.print();},350);});' : '';

    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe STAI</title><style>' +
      ':root{--ink:#18283e;--muted:#657388;--line:#dce5ee;--soft:#f5f8fb;--accent:#3d5a80;--green:#2f7f65}*{box-sizing:border-box}body{margin:0;background:#edf2f7;color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.5}.toolbar{position:sticky;top:0;z-index:20;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:10px;background:#17253a}.toolbar button{border:0;border-radius:8px;padding:9px 12px;font-weight:700;cursor:pointer}.paper{max-width:1020px;margin:24px auto;background:#fff;box-shadow:0 18px 60px rgba(20,35,55,.15);padding:42px}.hero{border-bottom:3px solid var(--accent);padding-bottom:22px}.hero h1{font-size:34px;margin:0 0 6px}.hero p{margin:0;color:var(--muted)}.demo-banner{background:#fff4d9;border:1px solid #ead18b;padding:10px 14px;border-radius:10px;font-weight:800;margin-bottom:18px}.section{padding:26px 0;border-bottom:1px solid var(--line)}h2{font-size:22px;margin:0 0 14px}h3{font-size:16px;margin:0 0 8px}h4{font-size:13px;margin:15px 0 6px}.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}.span12{grid-column:1/-1}.span8{grid-column:span 8}.span7{grid-column:span 7}.span6{grid-column:span 6}.span5{grid-column:span 5}.span4{grid-column:span 4}.card,.professional-card,.consent-card{border:1px solid var(--line);border-radius:14px;background:#fff;padding:17px}.score{font-size:42px;font-weight:900}.score small{font-size:15px;color:var(--muted)}.muted{color:var(--muted)}.kv{display:grid;grid-template-columns:180px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid #edf1f5}.kv span{color:var(--muted);font-size:13px}.callout{padding:14px 16px;background:#f2f6fa;border-left:4px solid var(--accent);border-radius:9px;margin-bottom:14px}.callout.caution{background:#fff8e8;border-color:#b47b18}.pill{display:inline-block;padding:4px 8px;border-radius:999px;background:#edf3f8;color:#3d5a80;font-size:11px;font-weight:800}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid var(--line);padding:9px;vertical-align:top;text-align:left}th{background:#f4f7fa}.visual svg{display:block;width:100%;height:auto;max-height:500px}.empty-visual{min-height:220px;display:grid;place-items:center;text-align:center;color:var(--muted);background:var(--soft);border-radius:10px;padding:20px}.consent-card{display:flex;gap:14px;background:#f7fbf9}.consent-mark{flex:0 0 40px;height:40px;border-radius:50%;background:#e6f4ee;color:var(--green);display:grid;place-items:center;font-size:23px;font-weight:900}.consent-card p{margin:8px 0}.consent-meta{font-size:12px;color:var(--muted)}.professional-card{background:#fafcfe}.signature-first{padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:10px}.mini-label{text-transform:uppercase;font-size:10px;letter-spacing:.12em;color:var(--muted);font-weight:800;margin-bottom:8px}.signature{display:block;max-width:260px;max-height:115px;object-fit:contain;object-position:left center}.signature-placeholder{height:60px;display:flex;align-items:end;color:#8792a1;font-style:italic}.foot{padding:24px 0 0;color:var(--muted);font-size:12px}.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}ul{padding-left:20px}.page-break-avoid{break-inside:avoid}@media(max-width:760px){.paper{margin:0;padding:22px}.span8,.span7,.span6,.span5,.span4{grid-column:1/-1}.cards{grid-template-columns:1fr}.kv{grid-template-columns:1fr}.toolbar{position:static}}@media print{body{background:#fff}.toolbar{display:none}.paper{max-width:none;margin:0;box-shadow:none;padding:0 8mm}.section{break-inside:auto}.card,.professional-card,.consent-card{break-inside:avoid}.demo-banner{break-inside:avoid}@page{size:A4;margin:12mm}}' +
      '</style></head><body><div class="toolbar"><button onclick="window.print()">Imprimir / Guardar PDF</button><button onclick="downloadJson()">Descargar JSON</button><button onclick="downloadTxt()">Descargar TXT</button></div><main class="paper">' + demoBadge +
      '<header class="hero"><div class="pill">Informe psicológico · STAI</div><h1>Inventario de Ansiedad Estado-Rasgo</h1><p>Resultados psicométricos y contextualización clínica opcional</p></header>' +
      '<section class="section"><h2>Identificación y aplicación</h2><div class="grid"><div class="card span6">' + item('Nombre', p.name || 'No registrado') + item('Código / historia', p.code) + item('Edad', p.age !== '' ? p.age + ' años' : '') + item('Fecha de nacimiento', fmtDate(p.birthDate)) + item('Sexo para baremación', p.sex) + item('Identidad de género', p.gender) + '</div><div class="card span6">' + item('Grupo normativo', p.normGroup) + item('Escolaridad', p.education) + item('Ocupación', p.occupation) + item('País / región', p.country) + item('Fecha de aplicación', fmtDate(p.applicationDate)) + item('Hora', p.applicationTime) + item('Modalidad', p.modality) + '</div><div class="card span12">' + item('Motivo / contexto', p.context) + (p.observations ? '<div class="kv"><span>Observaciones</span><b>' + nl2br(p.observations) + '</b></div>' : '') + '</div></div></section>' +
      consentSection(c) +
      '<section class="section"><h2>Resultados psicométricos</h2><div class="grid"><div class="card span6"><div class="score">' + esc(r.stateScore) + '<small>/60</small></div><h3>Ansiedad-Estado</h3><p>' + esc(r.statePosition || '') + '</p>' + (r.stateDecatype ? '<p><b>Decatipo ingresado:</b> ' + esc(r.stateDecatype) + ' · ' + esc(r.stateDecatypeBand || '') + '</p>' : '') + '</div><div class="card span6"><div class="score">' + esc(r.traitScore) + '<small>/60</small></div><h3>Ansiedad-Rasgo</h3><p>' + esc(r.traitPosition || '') + '</p>' + (r.traitDecatype ? '<p><b>Decatipo ingresado:</b> ' + esc(r.traitDecatype) + ' · ' + esc(r.traitDecatypeBand || '') + '</p>' : '') + '</div><div class="card span12"><h3>Lectura integrada de base</h3><p>' + esc(r.integrated || '') + '</p><p class="muted">Las posiciones por tercios describen únicamente el rango teórico de puntuaciones directas. Para una interpretación normativa deben emplearse baremos autorizados pertinentes a edad, sexo y grupo de referencia.</p></div></div></section>' +
      aiSections(ai) +
      '<section class="section"><h2>Nota técnica y alcance</h2><div class="grid"><div class="card span6"><h3>Corrección</h3><p>Los ítems se puntúan de 0 a 3. Los ítems invertidos se recodifican como 3 menos la respuesta original. Cada escala produce una puntuación directa de 0 a 60.</p></div><div class="card span6"><h3>Interpretación</h3><p>Ansiedad-Estado describe la activación ansiosa en el momento de responder; Ansiedad-Rasgo estima una predisposición relativamente estable. El STAI no constituye por sí solo un diagnóstico.</p></div></div></section>' +
      evaluatorSection(e) +
      '<div class="foot">Generado el ' + esc(generatedAt) + '. Aplicación STAI Clínico. Los datos profesionales son opcionales y solo aparecen cuando fueron registrados.</div></main>' +
      '<script>const reportData=' + safeData + ';function dl(c,n,t){const b=new Blob([c],{type:t});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}function downloadJson(){dl(JSON.stringify(reportData,null,2),"STAI_datos_"+Date.now()+".json","application/json;charset=utf-8")}function downloadTxt(){dl(reportData.textReport||"","STAI_informe_"+Date.now()+".txt","text/plain;charset=utf-8")}' + autoPrint + '<\/script></body></html>';
  }

  function buildTextReport(payload) {
    const p = payload.patient || {}, r = payload.results || {}, c = payload.consent || {}, e = payload.evaluator || {}, ai = payload.aiJson;
    const lines = [];
    lines.push('INFORME STAI — INVENTARIO DE ANSIEDAD ESTADO-RASGO');
    if (payload.demoMode) lines.push('MODO DEMOSTRACIÓN — DATOS COMPLETAMENTE FICTICIOS');
    lines.push('');
    lines.push('IDENTIFICACIÓN');
    lines.push('Nombre: ' + (p.name || 'No registrado'));
    if (p.code) lines.push('Código / historia: ' + p.code);
    if (p.age !== '' && p.age !== undefined) lines.push('Edad: ' + p.age + ' años');
    if (p.birthDate) lines.push('Fecha de nacimiento: ' + p.birthDate);
    if (p.sex) lines.push('Sexo para baremación: ' + p.sex);
    if (p.normGroup) lines.push('Grupo normativo: ' + p.normGroup);
    if (p.occupation) lines.push('Ocupación: ' + p.occupation);
    if (p.applicationDate) lines.push('Fecha de aplicación: ' + p.applicationDate + (p.applicationTime ? ' ' + p.applicationTime : ''));
    lines.push('');
    lines.push('CONSENTIMIENTO INFORMADO');
    lines.push('Aceptación registrada por la persona evaluada: ' + yes(c.accepted));
    lines.push('Fecha y hora: ' + (c.acceptedAt || 'No registrada'));
    lines.push(c.text || '');
    lines.push('');
    lines.push('RESULTADOS');
    lines.push('Ansiedad-Estado: ' + r.stateScore + '/60. ' + (r.statePosition || ''));
    lines.push('Ansiedad-Rasgo: ' + r.traitScore + '/60. ' + (r.traitPosition || ''));
    lines.push('Lectura integrada: ' + (r.integrated || ''));
    if (ai) {
      lines.push(''); lines.push('CONTEXTUALIZACIÓN CLÍNICA ASISTIDA POR IA');
      lines.push(ai.resumen_integrado || '');
      lines.push('Ansiedad-Estado: ' + (ai.lectura_estado || ''));
      lines.push('Ansiedad-Rasgo: ' + (ai.lectura_rasgo || ''));
      lines.push('Relación Estado-Rasgo: ' + (ai.relacion_estado_rasgo || ''));
      if (Array.isArray(ai.recursos_protectores) && ai.recursos_protectores.length) {
        lines.push('Recursos / protectores:'); ai.recursos_protectores.forEach(function(v){ lines.push('- ' + v); });
      }
      if (Array.isArray(ai.alertas) && ai.alertas.length) { lines.push('Alertas para explorar:'); ai.alertas.forEach(function(v){ lines.push('- ' + v); }); }
      lines.push('Límites: ' + (ai.limites_interpretativos || ''));
    }
    const hasEvaluator = Object.keys(e).some(function(k){return e[k];});
    if (hasEvaluator) {
      lines.push(''); lines.push('PROFESIONAL EVALUADOR');
      lines.push('[Firma incorporada en las versiones visuales, si fue registrada]');
      if (e.name) lines.push('Nombre: ' + e.name);
      if (e.profession) lines.push('Profesión: ' + e.profession);
      if (e.license) lines.push('Tarjeta profesional: ' + e.license);
      if (e.phone) lines.push('Celular: ' + e.phone);
      if (e.email) lines.push('Correo: ' + e.email);
      if (e.workplace) lines.push('Consultorio / institución: ' + e.workplace);
      if (e.address) lines.push('Dirección: ' + e.address);
      if (e.cityCountry) lines.push('Ciudad / país: ' + e.cityCountry);
    }
    lines.push(''); lines.push('El STAI no constituye por sí solo un diagnóstico. La contextualización con IA es auxiliar y requiere contraste profesional.');
    return lines.join('\n');
  }

  STAI.report = {
    buildReportHtml: buildReportHtml,
    buildTextReport: buildTextReport,
    buildBriefReportHtml: buildBriefReportHtml,
    buildBriefTextReport: buildBriefTextReport
  };
}());

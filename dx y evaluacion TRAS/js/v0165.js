/* ============================================================
   TRAS · v0.16.5
   Ajuste UX/responsive, PWA, JSON robusto y rediseño Goldstein.
   ============================================================ */

const V0165_JSON_CONTRACT = `

# CONTRATO ESTRICTO DE SALIDA JSON
Antes de responder, verifica internamente que el resultado pueda procesarse con JSON.parse().
1. Devuelve UNICAMENTE un objeto JSON valido: sin Markdown, sin backticks, sin encabezados, sin comentarios y sin texto antes o despues.
2. Usa comillas dobles ASCII solamente para delimitar claves y cadenas. Si necesitas citar palabras dentro de una cadena, usa comillas angulares « » o escapa las comillas como \\".
3. No escribas saltos de linea literales dentro de una cadena: representalos como \\n o redacta la cadena en una sola linea.
4. Escapa barras invertidas y caracteres de control. No uses comas finales antes de } o ].
5. Respeta exactamente los tipos solicitados: texto como string, listados como arrays y objetos con todas sus llaves.
6. Cuando falte informacion, usa "" o [] segun corresponda; no inventes datos y no omitas las claves obligatorias.
7. Haz una comprobacion final de llaves, corchetes, comillas y comas antes de entregar la respuesta.`;

function v0165AppendJsonContract(prompt) {
  const text = String(prompt || '');
  return text.includes('# CONTRATO ESTRICTO DE SALIDA JSON') ? text : text + V0165_JSON_CONTRACT;
}

/* ---------- JSON tolerante, sin alterar contenido clínico ---------- */
function v0165ExtractJson(raw) {
  let text = String(raw == null ? '' : raw)
    .replace(/^\uFEFF/, '')
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const startObj = text.indexOf('{');
  const startArr = text.indexOf('[');
  let start = -1;
  if (startObj >= 0 && startArr >= 0) start = Math.min(startObj, startArr);
  else start = Math.max(startObj, startArr);
  if (start < 0) return text;

  let depth = 0, inString = false, escaped = false;
  const opening = text[start];
  const closing = opening === '{' ? '}' : ']';
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === opening) depth++;
    else if (ch === closing) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  const end = text.lastIndexOf(closing);
  return end > start ? text.slice(start, end + 1) : text.slice(start);
}

function v0165RepairJson(candidate) {
  let text = v0165ExtractJson(candidate)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\u00A0/g, ' ');

  // Convierte literales frecuentes de Python solo cuando estan fuera de cadenas.
  let out = '', inString = false, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!inString && ch === '"') { inString = true; out += ch; continue; }
    if (inString) {
      if (escaped) { out += ch; escaped = false; continue; }
      if (ch === '\\') {
        const next = text[i + 1];
        if (next && !/["\\/bfnrtu]/.test(next)) out += '\\\\';
        else out += ch;
        escaped = true;
        continue;
      }
      if (ch === '\n' || ch === '\r') { out += '\\n'; continue; }
      if (ch === '"') {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        const next = text[j] || '';
        // Una comilla de cierre valida va seguida por :, coma, cierre o fin.
        // Si sigue texto normal, casi siempre es una cita clínica no escapada.
        if (next && !/[:,}\]]/.test(next)) { out += "'"; continue; }
        inString = false; out += ch; continue;
      }
      out += ch;
      continue;
    }
    out += ch;
  }
  text = out
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null');
  return text.trim();
}

aiSanitize = function aiSanitizeV0165(raw) {
  const base = v0165ExtractJson(raw);
  try { JSON.parse(base); return base; } catch (_) {}
  return v0165RepairJson(base);
};

parseAiJson = function parseAiJsonV0165() {
  const el = document.getElementById('aiFlowJson');
  const cleaned = aiSanitize(el ? el.value : '');
  if (el) el.value = cleaned;
  let parsed = JSON.parse(cleaned);
  if (typeof parsed === 'string' && /^[\[{]/.test(parsed.trim())) parsed = JSON.parse(parsed);
  return parsed;
};

/* Agrega el contrato robusto a TODOS los impulsos de IA. */
openAiFlow = function openAiFlowV0165(id) {
  const flow = AI_FLOWS[id];
  if (!flow) { toast('Flujo de IA no disponible.', 'danger'); return; }
  syncInputsToState();
  _activeAiFlow = id;
  let prompt;
  try { prompt = v0165AppendJsonContract(flow.buildPrompt()); }
  catch (e) { toast('No se pudo preparar el impulso con IA: ' + e.message, 'danger', 5600); return; }
  const title = document.getElementById('aiFlowTitle');
  const hint = document.getElementById('aiFlowHint');
  const notice = document.getElementById('aiFlowNotice');
  const promptEl = document.getElementById('aiFlowPrompt');
  const jsonEl = document.getElementById('aiFlowJson');
  if (title) title.textContent = flow.titulo || 'Tu prompt está listo';
  if (hint) hint.textContent = flow.hint || 'Copia el prompt, abre tu IA y vuelve con la respuesta.';
  if (notice) notice.innerHTML = flow.aviso || '<strong>Respuesta esperada:</strong> un único objeto JSON válido, sin explicaciones ni archivos.';
  if (promptEl) promptEl.value = prompt;
  if (jsonEl) jsonEl.value = '';
  const file = document.getElementById('aiFlowJsonFile'); if (file) file.value = '';
  const status = document.getElementById('aiFlowStatus'); if (status) status.textContent = 'Aún no has pegado la respuesta.';
  renderAiHubs('aiFlowHubs');
  showAiPromptStage();
  toggleModal('aiFlowModal', true);
};

/* ---------- Nuevo caso y navegación compacta ---------- */
let V0165_SCOPE_MODE = 'new';
function v0165IsPristineCase(c) {
  if (!c) return false;
  const metaEmpty = !String(c.meta?.nombre || '').trim() && !String(c.meta?.edad || '').trim() && !String(c.meta?.sexo || '').trim();
  const hcEmpty = !['motivo','evento','familia','escolar','sintomas','recursos','objetivo','resumen','materialBruto'].some(k => String(c.hc?.[k] || '').trim());
  const noResponses = !Object.keys(c.responses || {}).length && !Object.keys(c.goldstein?.respuestas || {}).length;
  return metaEmpty && hcEmpty && noResponses && !c.isDemo;
}

newCase = function newCaseV0165() {
  syncInputsToState();
  persist('Caso actual guardado antes de iniciar otro');
  V0165_SCOPE_MODE = 'new';
  toggleMenuDrawer(false);
  toggleModal('newCaseModal', true);
};

const V0165_CREATE_SCOPE_BASE = createCaseWithScope;
createCaseWithScope = function createCaseWithScopeV0165(scope) {
  if (!['tras','habilidades','ambos','hc'].includes(scope)) scope = 'ambos';
  const wantsMatrizCA = !!document.getElementById('scopeWizardMatrizCA')?.checked;
  const trasMode = document.querySelector('input[name="trasModeWizard"]:checked')?.value === 'resumido' ? 'resumido' : 'extenso';
  const current = getCurrentCase();
  if (V0165_SCOPE_MODE === 'configure' && v0165IsPristineCase(current)) {
    const c = ensureCaseV0164(current);
    c.scope = scope;
    c.trasMode = trasMode;
    c.modules = c.modules || {};
    c.modules.matrizCA = wantsMatrizCA;
    c.workflow.scopeSelected = true;
    c.workflow.lastStep = 2;
    touchCase(c, 'Alcance inicial definido: ' + scope + (wantsMatrizCA ? ' + Matriz Cognitivo-Atencional' : '') + ' · TRAS ' + trasMode);
    persist();
    renderScopeSelector(); renderTopNav(); renderCaseList();
    toggleModal('newCaseModal', false);
    goStep(2);
    toast('Expediente en blanco preparado. Complete la identificación.', 'ok');
    return;
  }
  V0165_SCOPE_MODE = 'new';
  V0165_CREATE_SCOPE_BASE(scope);
};

renderTopNav = function renderTopNavV0165() {
  const bar = document.getElementById('topNav');
  if (!bar) return;
  const newBtn = `<button class="topnav-btn topnav-new-case" onclick="newCase()" title="Comenzar un nuevo caso en blanco" aria-label="Comenzar nuevo caso"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Nuevo caso</span></button>`;
  const order = clinicalStepOrder();
  const items = order.map(id => {
    const s = steps.find(x => x.id === id);
    const completed = ensureCaseV0164(getCurrentCase()).workflow.completed.includes(id);
    return `<button class="topnav-btn ${id===currentStep?'active':''} ${completed?'completed':''}" data-step="${id}" onclick="goStep(${id})" title="${escapeHtml(s.title+' — '+s.desc)}" aria-label="${escapeHtml(s.title+': '+s.desc)}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${STEP_ICONS[id] || ''}</svg><span>${escapeHtml(id===2?'Caso actual':s.title)}</span></button>`;
  }).join('');
  bar.innerHTML = newBtn + items;
};

/* ---------- Goldstein: estructura sin repetición ---------- */
function v0165Array(value) {
  if (Array.isArray(value)) return value.map(x => String(x || '').trim()).filter(Boolean);
  return String(value || '').split(/\n+/).map(x => x.replace(/^\s*(?:[-•]|\d+[.)-]?)\s*/, '').trim()).filter(Boolean);
}
function v0165Tokens(text) {
  return new Set(String(text || '').toLowerCase().replace(/[^a-záéíóúüñ0-9\s]/gi,' ').split(/\s+/).filter(x=>x.length>4));
}
function v0165Similarity(a,b) {
  const A=v0165Tokens(a), B=v0165Tokens(b); if(!A.size||!B.size) return 0;
  let both=0; A.forEach(x=>{if(B.has(x)) both++;}); return both/Math.min(A.size,B.size);
}
function v0165DominantGroup(grp) {
  const vals=[['Escasas',grp.pct.nunca,'danger'],['Buenas',grp.pct.aveces,'warn'],['Muy buenas',grp.pct.siempre,'ok']].sort((a,b)=>b[1]-a[1]);
  return {label:vals[0][0],pct:vals[0][1],kind:vals[0][2]};
}
function v0165GroupProfileFallback(r) {
  return r.porGrupo.map(grp => {
    const d=v0165DominantGroup(grp);
    return {grupo:`${grp.romano}. ${grp.nombre}`,nivel_predominante:d.label,lectura:`Predomina el nivel ${d.label.toLowerCase()} (${d.pct}%) dentro de este grupo. La lectura debe contrastarse con las habilidades individuales y con las situaciones concretas en las que se aplican.`};
  });
}
function v0165GoldInterp() {
  const gi=goldsteinInterp(goldsteinState());
  gi.resumen_ejecutivo=gi.resumen_ejecutivo||'';
  gi.perfil_grupos=Array.isArray(gi.perfil_grupos)?gi.perfil_grupos:[];
  gi.fortalezas_clave=v0165Array(gi.fortalezas_clave);
  gi.condiciones_de_disminucion=v0165Array(gi.condiciones_de_disminucion);
  gi.mapa_relaciones=Array.isArray(gi.mapa_relaciones)?gi.mapa_relaciones:[];
  gi.orientaciones=v0165Array(gi.orientaciones||gi.sugerencias);
  gi.limites=gi.limites||'';
  gi.clasificacion=gi.clasificacion&&typeof gi.clasificacion==='object'?gi.clasificacion:{};
  return gi;
}

function buildGoldsteinPromptV0165() {
  const c=ensureCaseV0164(getCurrentCase());
  const g=goldsteinState(); const r=computeGoldstein(g.respuestas||{});
  if(!r.global.respondidos) throw new Error('Aún no hay respuestas de habilidades sociales.');
  const groups=Object.fromEntries(GOLDSTEIN_GRUPOS.map(x=>[x.id,`${x.romano}. ${x.nombre}`]));
  const detail=GOLDSTEIN_ITEMS.map(item=>{
    const value=g.respuestas[String(item.num)]; if(!value) return null;
    return {grupo:groups[item.grupo],habilidad:item.texto,respuesta:GOLDSTEIN_NIVELES[value]?.titulo||value};
  }).filter(Boolean);
  const material=aiScrubDeep({
    contexto:aiCaseContext(),
    interpretaciones_tras:c.interpretations,
    patrones_tras:c.patterns,
    resultados_globales:r.global,
    resultados_por_grupo:r.porGrupo,
    clasificacion_calculada:r.clasificacion,
    respuestas_por_habilidad:detail
  },c.meta.nombre);
  return `# ROL
Organiza e interpreta el resultado de la Lista de Chequeo de Habilidades Sociales de Goldstein para un informe dirigido principalmente a padres y cuidadores, también comprensible para docentes y profesionales.

# BASE DEL INSTRUMENTO
La lista contiene 50 habilidades distribuidas en seis grupos: habilidades básicas, avanzadas, relacionadas con los sentimientos, alternativas a la agresión, afrontamiento del estrés y planificación. La lectura es descriptiva y contextual; no es un diagnóstico ni autoriza percentiles o baremos no aportados.

# CLASIFICACION COMPLEMENTARIA DE DISPONIBILIDAD
Conserva EXACTAMENTE la etiqueta calculada por la aplicación: «${r.clasificacion.etiqueta}».
Interprétala sin cambiarla y sin presentarla como baremo normativo del test:
- Inconscientemente inhábil: la persona no identifica o no utiliza suficientemente la habilidad.
- Conscientemente inhábil: reconoce la habilidad o la necesidad de usarla, pero todavía no logra aplicarla de manera estable.
- Conscientemente hábil: puede identificar y aplicar la habilidad de manera deliberada; aún puede requerir atención y práctica.
- Inconscientemente hábil: uso automatizado. No atribuyas esta condición solamente por autoinforme; requiere contraste con observación y desempeño repetido.

# CRITERIOS DE INTERPRETACION
1. Revisa porcentajes, seis grupos y cada respuesta individual. No reduzcas el perfil al resultado global.
2. Diferencia habilidades disponibles de habilidades que disminuyen bajo estrés, vergüenza, rechazo, presión, conflicto o relación con la autoridad.
3. Integra HC y TRAS solo cuando aclaren el contexto. No atribuyas causas únicas ni conviertas coincidencias en causalidad.
4. Evita repetición: cada hallazgo debe aparecer una sola vez en el campo donde mejor corresponde. No repitas porcentajes que ya estarán en la tabla.
5. Usa lenguaje natural y accesible. No nombres escuelas psicológicas, no uses «El material sugiere», «se evidencia» ni fórmulas mecánicas.
6. Conserva contradicciones, recursos y límites. No inventes habilidades no respondidas.

# PRODUCTOS
- resumen_ejecutivo: 120 a 180 palabras que explique el patrón central sin repetir la tabla.
- perfil_grupos: exactamente seis objetos, uno por grupo, con lectura específica de 35 a 65 palabras.
- fortalezas_clave: 3 a 6 hallazgos concretos.
- condiciones_de_disminucion: 3 a 6 condiciones o situaciones en que la ejecución baja.
- mapa_relaciones: 3 a 6 relaciones entre contexto, condición emocional/social, habilidad y recurso; cada relación debe ser breve y no repetir el resumen.
- orientaciones: 4 a 6 acciones concretas y contextualizadas.
- clasificacion: etiqueta exacta y explicación de 90 a 140 palabras.
- limites: límites de interpretación y datos por contrastar.

# SALIDA
Devuelve SOLO JSON válido con esta estructura:
{"version_schema":"4.0","resumen_ejecutivo":"","perfil_grupos":[{"grupo":"I. Habilidades sociales básicas","nivel_predominante":"","lectura":""}],"fortalezas_clave":[],"condiciones_de_disminucion":[],"mapa_relaciones":[{"desde":"","relacion":"favorece|dificulta|modula","hacia":"","explicacion":""}],"orientaciones":[],"clasificacion":{"etiqueta":"${r.clasificacion.etiqueta}","explicacion":""},"limites":""}

# INFORMACION DEL CASO Y RESULTADOS
${JSON.stringify(material,null,2)}`;
}

function applyGoldsteinJsonV0165(data) {
  const g=goldsteinState(); const gi=v0165GoldInterp(); const r=computeGoldstein(g.respuestas||{});
  gi.resumen_ejecutivo=String(data.resumen_ejecutivo||data.que_sale||'').trim();
  gi.perfil_grupos=Array.isArray(data.perfil_grupos)?data.perfil_grupos.slice(0,6).map(x=>({grupo:String(x.grupo||''),nivel_predominante:String(x.nivel_predominante||''),lectura:String(x.lectura||'')})):[];
  gi.fortalezas_clave=v0165Array(data.fortalezas_clave||data.fortalezas);
  gi.condiciones_de_disminucion=v0165Array(data.condiciones_de_disminucion||data.areas_a_fortalecer);
  gi.mapa_relaciones=Array.isArray(data.mapa_relaciones)?data.mapa_relaciones.slice(0,8).map(x=>({desde:String(x.desde||''),relacion:String(x.relacion||'modula'),hacia:String(x.hacia||''),explicacion:String(x.explicacion||'')})):[];
  gi.orientaciones=v0165Array(data.orientaciones||data.sugerencias||data.recomendaciones);
  gi.limites=String(data.limites||'').trim();
  const cls=data.clasificacion&&typeof data.clasificacion==='object'?data.clasificacion:{};
  gi.clasificacion={etiqueta:r.clasificacion.etiqueta,explicacion:String(cls.explicacion||data.conclusion||r.clasificacion.descripcion).trim()};
  // Compatibilidad con vistas/casos previos.
  gi.que_sale=gi.resumen_ejecutivo;
  gi.analisis_causal=String(data.lectura_contextual||'').trim();
  gi.sugerencias=gi.orientaciones.map((x,i)=>`${i+1}. ${x}`).join('\n');
  gi.conclusion=gi.clasificacion.explicacion;
  if(!gi.resumen_ejecutivo && !gi.perfil_grupos.length) throw new Error('El JSON no contiene una interpretación suficiente de habilidades sociales.');
  g.aplicado=true; g.fuente='ia-manual';
  const c=ensureCaseV0164(getCurrentCase());
  c.reportes.goldstein={texto:gi.resumen_ejecutivo,fuente:'ia-manual',actualizado:new Date().toISOString()};
  return 'Resultado de habilidades sociales organizado sin duplicación y vinculado al expediente.';
}

registerAiFlow('goldstein',{
  titulo:'Resultado de habilidades sociales',
  hint:'La IA organizará el perfil por grupos, relaciones, recursos y condiciones de ejecución sin repetir el contenido.',
  aviso:'<strong>Clasificación preservada:</strong> la IA debe mantener la condición calculada por la app y devolver un único JSON válido.',
  requiredKeys:['resumen_ejecutivo','perfil_grupos','fortalezas_clave','condiciones_de_disminucion','mapa_relaciones','orientaciones','clasificacion'],
  buildPrompt:buildGoldsteinPromptV0165,
  apply:applyGoldsteinJsonV0165
});

function v0165PercentCell(value,kind,label) {
  return `<div class="gold-percent-cell"><strong>${value}%</strong><span class="gold-mini-track" aria-label="${escapeHtml(label)} ${value}%"><i class="${kind}" style="width:${value}%"></i></span></div>`;
}
function v0165RelationshipMap(gi,r,c,wordMode) {
  let relations=gi.mapa_relaciones||[];
  if(!relations.length) {
    const ordered=[...r.porGrupo].sort((a,b)=>b.pct.siempre-a.pct.siempre);
    const strong=ordered[0], weak=[...r.porGrupo].sort((a,b)=>b.pct.nunca-a.pct.nunca)[0];
    relations=[
      {desde:'Contexto cotidiano',relacion:'modula',hacia:`${weak.romano}. ${weak.nombre}`,explicacion:'La disponibilidad de estas habilidades puede disminuir cuando aumenta la carga emocional o interpersonal.'},
      {desde:`${strong.romano}. ${strong.nombre}`,relacion:'favorece',hacia:'Recursos de adaptación',explicacion:'Este grupo aporta conductas disponibles que pueden utilizarse como punto de apoyo para el entrenamiento.'},
      {desde:'Práctica acompañada',relacion:'favorece',hacia:r.clasificacion.etiqueta,explicacion:'La práctica en situaciones reales ayuda a transformar conocimiento en ejecución estable.'}
    ];
  }
  if (wordMode) {
    const rows = relations.map(x => `<tr><td><strong>${escapeHtml(x.desde||'Contexto')}</strong></td><td>${escapeHtml(x.relacion||'modula')} →</td><td><strong>${escapeHtml(x.hacia||'Habilidad')}</strong></td><td>${escapeHtml(x.explicacion||'')}</td></tr>`).join('');
    return `<table class="report-table"><thead><tr><th>Desde</th><th>Relación</th><th>Hacia</th><th>Explicación</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  return `<div class="relation-map">${relations.map(x=>`<div class="relation-row"><div class="relation-node from">${escapeHtml(x.desde||'Contexto')}</div><div class="relation-link"><span>${escapeHtml(x.relacion||'modula')}</span><b>→</b></div><div class="relation-node to">${escapeHtml(x.hacia||'Habilidad')}</div>${x.explicacion?`<p>${escapeHtml(x.explicacion)}</p>`:''}</div>`).join('')}</div>`;
}
function v0165CompetenceLadder(cls,wordMode) {
  const key=cls.clave==='consc_habil_consolidacion'?'consc_habil':cls.clave;
  const stages=[
    ['inconsc_inhabil','1','Inconscientemente inhábil','No identifica o no utiliza suficientemente la habilidad.'],
    ['consc_inhabil','2','Conscientemente inhábil','Reconoce la necesidad, pero todavía no la aplica de forma estable.'],
    ['consc_habil','3','Conscientemente hábil','La aplica deliberadamente y puede requerir atención o práctica.'],
    ['inconsc_habil','4','Inconscientemente hábil','La ejecución se automatiza; requiere contraste observacional.']
  ];
  if (wordMode) {
    const rows = stages.map(s => `<tr${s[0]===key?' style="background:#fff8e8"':''}><td><strong>${s[1]}</strong></td><td><strong>${escapeHtml(s[2])}</strong>${s[0]===key?' (etapa actual)':''}</td><td>${escapeHtml(s[3])}</td></tr>`).join('');
    return `<table class="report-table"><thead><tr><th>Etapa</th><th>Nombre</th><th>Descripción</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  return `<div class="competence-ladder">${stages.map(s=>`<div class="competence-step ${s[0]===key?'current':''}"><span>${s[1]}</span><strong>${escapeHtml(s[2])}</strong><small>${escapeHtml(s[3])}</small></div>`).join('')}</div>`;
}

goldsteinReportSection = function goldsteinReportSectionV0165(numero, showTables, wordMode) {
  showTables = showTables !== false;
  const c=ensureCaseV0164(getCurrentCase()); const g=c.goldstein;
  if(!g||!g.aplicado) return '<div class="no-data">No se dispone de respuestas de la batería de habilidades sociales.</div>';
  const gi=v0165GoldInterp(); const r=computeGoldstein(g.respuestas||{});
  const summary=gi.resumen_ejecutivo||gi.que_sale||'';
  const contextual=gi.analisis_causal||'';
  const showContext=contextual && v0165Similarity(summary,contextual)<0.62;
  const profiles=gi.perfil_grupos.length?gi.perfil_grupos:v0165GroupProfileFallback(r);
  const strengths=gi.fortalezas_clave.length?gi.fortalezas_clave:[];
  const conditions=gi.condiciones_de_disminucion.length?gi.condiciones_de_disminucion:[];
  const orientations=gi.orientaciones.length?gi.orientaciones:v0165Array(gi.sugerencias);
  const clsExplanation=gi.clasificacion.explicacion||gi.conclusion||r.clasificacion.descripcion;
  const rows=r.porGrupo.map((grp,i)=>{
    const d=v0165DominantGroup(grp);
    const p=profiles.find(x=>String(x.grupo||'').startsWith(grp.romano))||profiles[i]||{};
    return `<tr><td><strong>${grp.romano}. ${escapeHtml(grp.nombre)}</strong>${p.lectura?`<small>${escapeHtml(p.lectura)}</small>`:''}</td><td>${grp.respondidos}/${grp.total}</td><td>${v0165PercentCell(grp.pct.nunca,'danger','Escasas')}</td><td>${v0165PercentCell(grp.pct.aveces,'warn','Buenas')}</td><td>${v0165PercentCell(grp.pct.siempre,'ok','Muy buenas')}</td><td><span class="dominant-pill ${d.kind}">${d.label}</span></td></tr>`;
  }).join('');
  const tablasNumericas = `
    <div class="gold-summary">
      <div class="gold-stat danger"><strong>${r.global.pct.nunca}%</strong><span>Escasas</span></div>
      <div class="gold-stat warn"><strong>${r.global.pct.aveces}%</strong><span>Buenas</span></div>
      <div class="gold-stat ok"><strong>${r.global.pct.siempre}%</strong><span>Muy buenas</span></div>
    </div>
    <div class="report-table-wrap"><table class="report-table gold-report-table"><thead><tr><th>Grupo y lectura específica</th><th>Resp.</th><th>Escasas</th><th>Buenas</th><th>Muy buenas</th><th>Predominio</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  return `
    <div class="gold-classification-hero"><div><span class="eyebrow">ETAPA DE DISPONIBILIDAD E IMPLEMENTACIÓN</span><h3>${escapeHtml(r.clasificacion.etiqueta)}</h3><p>${escapeHtml(clsExplanation)}</p></div><span class="gold-response-count">${r.global.respondidos}/${r.global.total}<small>habilidades respondidas</small></span></div>
    ${v0165CompetenceLadder(r.clasificacion,wordMode)}
    <p class="method-note">La clasificación de disponibilidad es una lectura complementaria para orientar el acompañamiento. No sustituye un baremo normativo; la automatización de una habilidad no puede establecerse únicamente mediante autoinforme.</p>
    <div class="gold-executive"><h3>Comprensión global del perfil</h3>${summary?textToHtml(summary):'<div class="no-data">No se ha elaborado todavía una comprensión global del resultado.</div>'}${showContext?`<div class="gold-context-extra"><strong>Condiciones de ejecución</strong>${textToHtml(contextual)}</div>`:''}</div>
    ${showTables ? `<h3 class="report-subhead">Resultados por grupo</h3>${tablasNumericas}` : '<div class="method-note">Los porcentajes y la tabla por grupo se incluyen en la versión del informe dirigida a docentes/profesionales.</div>'}
    <h3 class="report-subhead">Mapa de relaciones</h3>
    <p class="section-note">Muestra cómo el contexto y las condiciones de ejecución se relacionan con los recursos y las habilidades que requieren apoyo; no representa causalidad lineal.</p>
    ${v0165RelationshipMap(gi,r,c,wordMode)}
    ${(strengths.length||conditions.length)?`<div class="gold-insight-bands">${strengths.length?`<section class="gold-band resources"><h3>Recursos disponibles</h3><ul>${strengths.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`:''}${conditions.length?`<section class="gold-band conditions"><h3>Condiciones que reducen la ejecución</h3><ul>${conditions.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`:''}</div>`:''}
    <h3 class="report-subhead">Orientaciones prioritarias</h3>
    ${orientations.length?`<ol class="report-list gold-actions">${orientations.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol>`:'<div class="no-data">No se han registrado orientaciones específicas.</div>'}
    ${gi.limites?`<div class="callout limits"><strong>Límites y aspectos por contrastar:</strong><br>${textToHtml(gi.limites)}</div>`:''}`;
};

buildGoldsteinReportV0164 = function buildGoldsteinReportV0165(audience,wordMode) {
  syncInputsToState(); let n=0; const sec=[];
  sec.push(...commonIdentitySectionsV0164().map(x=>x.replace(/<span class="section-number">\d+<\/span>/,()=>`<span class="section-number">${++n}</span>`)));
  sec.push(reportSection(++n,'Evaluación de habilidades sociales',goldsteinReportSection(0, audience!=='familias', wordMode),'Resultados organizados por grupos, condiciones de ejecución, relaciones y etapa de disponibilidad.'));
  return reportDocumentShellV0164('Resultado de habilidades sociales',sec.join(''),'Perfil de recursos sociales, condiciones de ejecución y orientaciones de acompañamiento.','Goldstein',audience,wordMode);
};

/* ---------- PWA: instalar y avisar nueva version (topbar + splash) ---------- */
function v0165ShowUpdateButton(label,mode) {
  const btn=document.getElementById('appUpdateButton');
  const btnSplash=document.getElementById('appUpdateButtonSplash');
  if(!btn && !btnSplash) return;
  [btn,btnSplash].forEach(b=>{
    if(!b) return;
    b.title=label; b.setAttribute('aria-label',label);
    b.classList.add('show');
    b.dataset.mode=mode||'info';
  });
  // El aviso de "version instalada" (mode info) se puede descartar con un
  // clic; el de "version esperando, requiere accion" (mode update) no se
  // auto-oculta ni se descarta solo, para no perderlo si el profesional
  // no lo nota de inmediato. Un clic en cualquiera de los dos botones
  // (splash o barra fija) actualiza el estado del otro tambien.
  const dismissBoth=()=>{ if(btn) btn.classList.remove('show'); if(btnSplash) btnSplash.classList.remove('show'); };
  if((mode||'info')==='info') { if(btn) btn.onclick=dismissBoth; if(btnSplash) btnSplash.onclick=dismissBoth; }
}
function v0165BindUpdateAction(fn) {
  const btn=document.getElementById('appUpdateButton');
  const btnSplash=document.getElementById('appUpdateButtonSplash');
  if(btn) btn.onclick=fn;
  if(btnSplash) btnSplash.onclick=fn;
}
function v0165RegisterUpdater() {
  const seenKey='tras_seen_app_version';
  const last=localStorage.getItem(seenKey);
  if(last && last!==APP_VERSION) {
    v0165ShowUpdateButton(`Nueva versión instalada · ${APP_VERSION}`,'info');
  }
  localStorage.setItem(seenKey,APP_VERSION);
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    const bind=()=>{
      if(reg.waiting) {
        v0165ShowUpdateButton('Nueva versión disponible · clic para actualizar','update');
        v0165BindUpdateAction(()=>reg.waiting?.postMessage({type:'SKIP_WAITING'}));
      }
    };
    bind();
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing; if(!worker) return;
      worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller) bind();});
    });
    // Fuerza una verificacion inmediata contra el servidor en vez de esperar
    // al ciclo pasivo del navegador, para que "nueva version" no demore en
    // aparecer si el archivo sw.js ya cambio.
    reg.update().catch(()=>{});
  }).catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());
}

/* Boton de instalar la PWA. El navegador solo dispara 'beforeinstallprompt'
   si la app aun no esta instalada y cumple los criterios de PWA (Chrome/
   Edge/Android principalmente; Firefox/Safari no lo ofrecen). Por eso el
   icono permanece oculto hasta que el navegador avisa que se puede instalar. */
let v0165DeferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault();
  v0165DeferredInstallPrompt=e;
  document.getElementById('appInstallButton')?.classList.add('show');
});
window.addEventListener('appinstalled',()=>{
  v0165DeferredInstallPrompt=null;
  document.getElementById('appInstallButton')?.classList.remove('show');
  toast('TRAS quedó instalada en este dispositivo.','ok',4500);
});
function triggerAppInstall() {
  if(!v0165DeferredInstallPrompt) return;
  v0165DeferredInstallPrompt.prompt();
  v0165DeferredInstallPrompt.userChoice.finally(()=>{
    v0165DeferredInstallPrompt=null;
    document.getElementById('appInstallButton')?.classList.remove('show');
  });
}

/* Enganches posteriores al inicio. */
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    renderTopNav();
    const c=ensureCaseV0164(getCurrentCase());
    if(v0165IsPristineCase(c)&&!c.workflow.scopeSelected) {
      V0165_SCOPE_MODE='configure';
      toggleModal('newCaseModal',true);
    }
    v0165RegisterUpdater();
  },450);
});

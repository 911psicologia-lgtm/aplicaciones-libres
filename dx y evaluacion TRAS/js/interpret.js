/* ============================================================
   TRAS · interpret.js
   Paso 7: senales lexicas orientativas, interpretacion por area,
   indicadores (KPIs) y flujo de IA manual (prompt + importar JSON).
   ============================================================ */

/* Normaliza texto para deteccion: minusculas y sin tildes. */
function normalizeText(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* Marcadores lexicos. NO constituyen puntuacion ni diagnostico: solo
   resaltan terminos que conviene leer en contexto. Se evita usar
   cuantificadores neutros ("siempre", "nunca") que generaban falsos
   positivos en la version previa. La deteccion usa limites de palabra. */
const MALESTAR_MARKERS = ['odio','odiar','miedo','temor','panico','agredir','agresion','golpe','golpear','pegar','morir','muerte','matar','suicid','culpa','triste','tristeza','solo','sola','soledad','abuso','abusar','rabia','vengar','venganza','asco','llorar','llanto','daño','herir'];
const RECURSO_MARKERS = ['apoyo','apoyar','cariño','carino','confianza','confiar','ayuda','ayudar','amor','amar','seguro','segura','proteger','protege','tranquil','feliz','felicidad','acompañ','acompan','escuchar','querer','abrazo'];

function countMarkers(text, markers) {
  const t = normalizeText(text);
  const hits = [];
  for (const m of markers) {
    const mm = normalizeText(m);
    // limite de palabra aproximado para raices y palabras completas
    const re = new RegExp('(^|[^a-z0-9])' + mm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (re.test(t)) hits.push(m);
  }
  return hits;
}

function analyzeArea(area) {
  const text = area.items.map(i => (itemState(i.id).respuesta || '') + ' ' + (itemState(i.id).notas || '')).join(' ');
  const malestar = countMarkers(text, MALESTAR_MARKERS);
  const recursos = countMarkers(text, RECURSO_MARKERS);
  return {
    intensidad: malestar.length >= 3 ? 'alta' : malestar.length >= 1 ? 'media' : 'baja',
    recursos,
    alertas: malestar,
    respondidos: area.items.filter(i => (itemState(i.id).respuesta || '').trim()).length
  };
}

/* ---------- Interpretacion estructurada por area ----------
   Cada area se interpreta en tres planos, igual que Goldstein:
     - que_dice:       lo que aparece en las respuestas de los ciclos.
     - que_sucede:     lectura interpretativa (convergencias/contrastes/funcion).
     - que_se_sugiere: orientacion para entrevista y acompanamiento.
   Se conserva ".texto" como ESPEJO legible (lo combinan buildCaseSummary,
   los KPIs y reportHasContent), derivado siempre de los tres planos. */

/* Texto visible del área. Se privilegia el párrafo integrado; los tres
   componentes se conservan como trazabilidad clínica y apoyo para edición. */
function areaInterpFlatText(it) {
  const integrado = String(it.parrafo_integrado || '').trim();
  if (integrado) return integrado;
  return [it.que_dice, it.que_sucede, it.que_se_sugiere]
    .map(s => String(s || '').trim()).filter(Boolean).join(' ');
}

/* Devuelve la interpretacion estructurada de un area, migrando casos
   antiguos que guardaban un unico parrafo plano en .texto: ese parrafo
   se vuelca en "que_sucede" (el plano descriptivo-interpretativo). */
function areaInterp(areaId) {
  const c = getCurrentCase();
  let it = c.interpretations[areaId];
  if (!it || typeof it !== 'object') it = c.interpretations[areaId] = { fuente: 'manual' };
  const hasPlanes = ('parrafo_integrado' in it) || ('que_dice' in it) || ('que_sucede' in it) || ('que_se_sugiere' in it);
  if (!hasPlanes && it.texto) {
    it.que_sucede = String(it.texto); // migracion del esquema plano antiguo
  }
  it.que_dice = it.que_dice || '';
  it.que_sucede = it.que_sucede || '';
  it.que_se_sugiere = it.que_se_sugiere || '';
  it.parrafo_integrado = it.parrafo_integrado || '';
  if (!String(it.parrafo_integrado).trim() && (String(it.que_dice).trim() || String(it.que_sucede).trim() || String(it.que_se_sugiere).trim())) {
    // Migración no destructiva: conserva íntegros los tres componentes antiguos
    // en un solo párrafo visible. Puede editarse o regenerarse después.
    it.parrafo_integrado = [it.que_dice, it.que_sucede, it.que_se_sugiere]
      .map(x => String(x || '').trim()).filter(Boolean).join(' ');
  }
  it.fuente = it.fuente || 'manual';
  it.texto = areaInterpFlatText(it); // espejo derivado, siempre coherente
  return it;
}

/* True si el area tiene cualquier plano (o el texto legado) con contenido. */
function areaHasInterp(areaId) {
  const it = getCurrentCase().interpretations[areaId];
  if (!it || typeof it !== 'object') return false;
  return !!(String(it.parrafo_integrado || '').trim() || String(it.que_dice || '').trim() ||
            String(it.que_sucede || '').trim() || String(it.que_se_sugiere || '').trim() ||
            String(it.texto || '').trim());
}

function renderInterpretation() {
  const c = getCurrentCase();
  const wrap = document.getElementById('interpretationContainer');
  wrap.innerHTML = `<div class="help" style="margin-bottom:12px"><strong>Lectura responsable.</strong> Las "senales lexicas" de abajo son orientativas: marcan palabras que conviene leer en contexto, no son una puntuacion ni un diagnostico. El sentido de cada respuesta se decide con el area completa, los patrones transversales y la historia clinica.</div>` +
  allAreas().map(area => {
    const it = areaInterp(area.id);
    const an = analyzeArea(area);
    const fuenteBadge = it.fuente === 'ia-manual' ? '<span class="badge info">origen: IA (revisar)</span>' : '';
    return `<details class="area-block" ${areaHasInterp(area.id) ? '' : 'open'}>
      <summary>${escapeHtml(area.nombre)}</summary>
      <div class="inline" style="margin-top:10px">
        <span class="badge ${an.intensidad==='alta'?'danger':an.intensidad==='media'?'warn':'ok'}">Senal lexica: ${an.intensidad}</span>
        <span class="badge info">Respondidos: ${an.respondidos}/${area.items.length}</span>
        ${an.alertas.length ? `<span class="badge danger">Terminos: ${an.alertas.join(', ')}</span>` : ''}
        ${an.recursos.length ? `<span class="badge ok">Recursos: ${an.recursos.join(', ')}</span>` : ''}
        ${fuenteBadge}
      </div>
      <div style="margin-top:10px" class="small">${escapeHtml(area.objetivo_area || '')}</div>
      ${area.items.map(item => `<div class="review-item"><strong>${item.ciclo}</strong> ${escapeHtml(item.texto)}<br><span class="small">${escapeHtml(itemState(item.id).respuesta || '—')}</span></div>`).join('')}
      <label style="margin-top:10px">Párrafo integrado para el informe <span class="small">(reúne lo expresado, su comprensión contextual y la orientación)</span></label>
      <textarea data-interpret-area="${area.id}" data-plane="parrafo_integrado" oninput="markInterpManual('${area.id}');autosave()" style="min-height:120px" placeholder="Un párrafo natural y comprensible que conserve los tres componentes sin nombrarlos como apartados ni recortar información importante.">${escapeHtml(it.parrafo_integrado)}</textarea>
      <details class="sub-card" style="margin-top:10px">
        <summary><strong>Ver componentes de análisis y trazabilidad</strong></summary>
        <label style="margin-top:10px">1. Lo expresado <span class="small">(temas, convergencias, contrastes y silencios)</span></label>
        <textarea data-interpret-area="${area.id}" data-plane="que_dice" oninput="markInterpManual('${area.id}');autosave()" style="min-height:80px" placeholder="Descripción fiel de lo que aparece en los ciclos, sin interpretar todavía.">${escapeHtml(it.que_dice)}</textarea>
        <label style="margin-top:10px">2. Comprensión contextual <span class="small">(sentido posible en relación con la HC y el área)</span></label>
        <textarea data-interpret-area="${area.id}" data-plane="que_sucede" oninput="markInterpManual('${area.id}');autosave()" style="min-height:110px" placeholder="Hipótesis comprensiva situada, prudente y no diagnóstica.">${escapeHtml(it.que_sucede)}</textarea>
        <label style="margin-top:10px">3. Orientación <span class="small">(qué profundizar y cómo acompañar)</span></label>
        <textarea data-interpret-area="${area.id}" data-plane="que_se_sugiere" oninput="markInterpManual('${area.id}');autosave()" style="min-height:90px" placeholder="Preguntas de seguimiento, focos de acompañamiento y recursos a sostener, aplicados al caso.">${escapeHtml(it.que_se_sugiere)}</textarea>
      </details>
    </details>`;
  }).join('');
  setVal('patrones_globales', c.patterns);
  setVal('analisis_consolidado', c.consolidated);
  setVal('recomendaciones', c.recommendations);
  renderKpis();
}

function markInterpManual(areaId) {
  const it = areaInterp(areaId);
  it.fuente = 'manual';
}

function renderKpis() {
  const areas = allAreas();
  const responses = areas.flatMap(a=>a.items).filter(i=>(itemState(i.id).respuesta||'').trim()).length;
  const interpreted = areas.filter(a => areaHasInterp(a.id)).length;
  const lexAlerts = areas.reduce((acc,a)=>acc+analyzeArea(a).alertas.length,0);
  const hcAlerts = getCurrentCase().hc.alertas.length;
  const e1 = document.getElementById('kpiRespuestas'); if (e1) e1.textContent = responses;
  const e2 = document.getElementById('kpiInterpretadas'); if (e2) e2.textContent = interpreted;
  const e3 = document.getElementById('kpiAlertas'); if (e3) e3.textContent = lexAlerts + hcAlerts;
}

/* ---------- IA manual ---------- */
function buildPromptPayload() {
  syncInputsToState();
  const c = getCurrentCase();
  const nombre = c.meta.nombre || '';
  const raw = {
    version_schema:'1.0',
    instrumento: { nombre: DATASET.instrumento.nombre, autor: DATASET.instrumento.autor, anio: DATASET.instrumento.anio },
    caso: {
      iniciales: (typeof initialsOf === 'function') ? initialsOf(nombre) : 'N. N.',
      edad: c.meta.edad || 'no informada',
      sexo: c.meta.sexo || 'no informado'
    },
    hc: c.hc,
    areas: allAreas().map(area => {
      const an = analyzeArea(area);
      return {
        area_id: area.id,
        area_nombre: area.nombre,
        objetivo_area: area.objetivo_area,
        senales_lexicas: an,
        items: area.items.map(i => ({
          ciclo: i.ciclo,
          texto_item: i.texto,
          respuesta: itemState(i.id).respuesta,
          nota_evaluador: itemState(i.id).notas,
          pistas: i.pistas,
          alerta_clinica: i.alerta_clinica
        }))
      };
    })
  };
  return (typeof aiScrubDeep === 'function') ? aiScrubDeep(raw, nombre) : raw;
}

function openManualAI() {
  const payload = buildPromptPayload();
  const prompt = `# ROL
Actúas como psicólogo clínico infanto-juvenil que apoya al profesional tratante en la lectura contextual del TRAS. Tu trabajo es interpretativo, prudente y orientativo. No diagnosticas ni decides por el profesional.

# EL INSTRUMENTO
"${payload.instrumento.nombre} — ${DATASET.instrumento.nombre_completo}" (${payload.instrumento.autor}, ${payload.instrumento.anio}) es una técnica de completamiento de frases que explora representaciones de la vida afectiva y social. No es una prueba psicométrica: no hay puntajes, baremos ni percentiles. Cada área reúne cuatro ciclos que rodean un mismo tema desde ángulos diferentes; por ello, la lectura se hace por convergencia, contraste, ambivalencia, silencios y relación con la historia clínica, nunca frase por frase aislada.

# MARCO DE COMPRENSIÓN INTERNO
Trabaja internamente con una orientación humanista-existencial, psicodinámica integrativa y abierta al diálogo de saberes. Atiende al sentido de la experiencia, los vínculos, la ambivalencia, los recursos, las condiciones del contexto y la posible función protectora o reguladora de algunas respuestas. Este marco es SOLO para razonar:
- NO nombres escuelas, corrientes ni enfoques en la salida.
- NO escribas "desde una perspectiva humanista", "desde lo psicodinámico", "desde una perspectiva psicológica" ni fórmulas equivalentes.
- La integración debe reconocerse en la profundidad y naturalidad de la explicación, no en etiquetas teóricas.

# MÉTODO DE LECTURA POR ÁREA
1. Usa el "objetivo_area" para precisar qué dimensión relacional o subjetiva se explora.
2. Lee juntos los cuatro ciclos. Identifica lo que se repite, lo que cambia, lo que se contradice, lo que queda sin responder y las palabras emocionalmente significativas.
3. Articula las respuestas con la historia clínica: motivo, secuencia temporal, acontecimientos, familia, escuela, manifestaciones, recursos y cambios recientes.
4. Distingue entre lo expresado por el evaluado y la interpretación. No conviertas una frase aislada en rasgo, causa o diagnóstico.
5. Considera que una conducta o respuesta puede cumplir una función de protección, regulación, pertenencia, evitación, búsqueda de control o reparación, pero formula esto solo como hipótesis a contrastar.
6. Reconoce recursos, vínculos protectores, capacidad de reflexión y posibilidades de cambio con el mismo cuidado que las dificultades.
7. Conserva información clínicamente importante. No resumas una situación compleja en una etiqueta general ni elimines tensiones, contradicciones, hechos de violencia, riesgo, pérdida, culpa, deterioro escolar o cambios en el funcionamiento.

# TRES COMPONENTES INTERNOS Y UN SOLO PÁRRAFO VISIBLE
Para cada área construye primero tres componentes:
- "que_dice": síntesis descriptiva fiel de temas, convergencias, contrastes, silencios y recursos presentes en las respuestas.
- "que_sucede": comprensión contextual prudente de lo anterior a la luz del objetivo del área y de la historia clínica. Puede incluir una posible función relacional o defensiva, sin afirmarla como certeza.
- "que_se_sugiere": qué conviene profundizar, preguntar, acompañar o sostener en este caso.

Después redacta "parrafo_integrado", que será el texto visible en el informe:
- Debe reunir los tres componentes en UN SOLO PÁRRAFO natural, sin subtítulos internos ni frases como "lo que dice", "lo que sucede" o "se sugiere".
- Normalmente tendrá entre 45 y 75 palabras; puede llegar a 100 cuando el área sea compleja. La prioridad es no perder información importante.
- Debe sonar como un terapeuta que explica a padres, docentes y profesionales qué muestran las respuestas, cómo pueden comprenderse en este contexto y qué conviene hacer.
- Evita jerga y fórmulas mecánicas. NO uses "El material sugiere", "se evidencia", "desde una perspectiva..." ni repitas "se observa una tendencia".
- No conviertas la cautela en vaguedad. Explica con claridad y usa "podría", "conviene explorar" o "la información no permite afirmar" solo cuando corresponda.
- Si no existen respuestas ni notas suficientes, escribe exactamente: "No se dispone de respuestas ni de información clínica suficiente en esta área. Debe completarse en entrevista o quedar consignada como no explorada." Deja los tres componentes internos vacíos y marca "estado_datos":"sin_informacion".
- Si hay datos parciales, indícalo sin inventar y marca "estado_datos":"parcial".
- Si hay información suficiente, marca "estado_datos":"suficiente".

# SALVAGUARDAS
- Lenguaje no moralizante, no alarmista, no determinista y respetuoso de la etapa evolutiva.
- En riesgo, violencia, abuso o vulneración, registra una bandera prudente y pide verificación directa; no dramatices ni minimices.
- En sexualidad, identidad y diversidad, evita juicio de valor y diferencia discurso aprendido, vivencia propia y datos ausentes.
- No inventes hechos, intenciones, causas, diagnósticos ni relaciones que no estén sustentadas.
- Cada área debe permanecer en el JSON, incluso cuando no tenga información.

# SALIDA
Devuelve SOLO JSON válido, sin backticks ni texto adicional, con este esquema exacto:
{"version_schema":"3.0","areas":[{"area_id":"area_01","area_nombre":"...","estado_datos":"suficiente|parcial|sin_informacion","que_dice":"componente descriptivo interno","que_sucede":"componente comprensivo interno","que_se_sugiere":"componente orientador interno","parrafo_integrado":"único párrafo visible en el informe","hallazgos_clave":["..."],"banderas":["..."],"recursos":["..."]}],"patrones_globales":"hilos transversales sin etiquetas teóricas explícitas","analisis_consolidado":"síntesis comprensiva del TRAS y la historia clínica, accesible y sin nombrar escuelas psicológicas","recomendaciones":["acciones contextualizadas","..."]}

Reglas del JSON:
- Incluye una entrada por cada área presente abajo y respeta su "area_id".
- No omitas ninguna clave.
- "banderas" y "recursos" deben ser [] cuando no correspondan.
- El "analisis_consolidado" integra el razonamiento, pero nunca debe comenzar con "Desde una perspectiva..." ni mencionar humanismo, existencialismo, psicodinámica u otra escuela.
- No inventes información para llenar vacíos.

# DATOS DEL CASO
${JSON.stringify(payload, null, 2)}`;
  document.getElementById('manualPrompt').value = prompt;
  document.getElementById('manualJson').value = '';
  const fileEl = document.getElementById('manualJsonFile'); if (fileEl) fileEl.value = '';
  document.getElementById('jsonStatus').innerHTML = 'Aun no has pegado respuesta.';
  if (typeof hideAiGuide === 'function') hideAiGuide('manualAiGuide');
  if (typeof renderAiHubs === 'function') renderAiHubs('manualAiHubs');
  toggleModal('promptModal', true);
}

async function copyPrompt() {
  const t = document.getElementById('manualPrompt');
  try {
    await navigator.clipboard.writeText(t.value);
    toast('Prompt copiado. Elige una IA y sigue la ruta indicada.', 'ok');
  } catch (e) {
    t.focus(); t.select();
    try { document.execCommand('copy'); toast('Prompt copiado. Elige una IA y sigue la ruta indicada.', 'ok'); }
    catch (_) { toast('Copia manual: selecciona el texto y usa Ctrl+C.', 'warn'); }
  }
  if (typeof revealAiGuide === 'function') revealAiGuide('manualAiGuide', 'manualAiHubs');
}

function sanitizeJsonText(raw) {
  let text = String(raw || '').replace(/^\uFEFF/, '').trim();
  text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  text = text.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
  // Repara solo comas finales antes de } o ], un error frecuente de salida.
  // No intenta adivinar comas o comillas faltantes.
  text = text.replace(/,\s*([}\]])/g, '$1');
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) text = text.slice(first, last + 1);
  return text;
}

async function pasteManualJson() {
  const el = document.getElementById('manualJson');
  try {
    el.value = await navigator.clipboard.readText();
    document.getElementById('jsonStatus').textContent = 'Contenido pegado. Ahora valida el JSON.';
  } catch (e) {
    toast('El navegador no permitio leer el portapapeles. Pega manualmente con Ctrl+V.', 'warn', 4500);
  }
  el.focus();
}

function clearManualJson() {
  const el = document.getElementById('manualJson');
  if (el) { el.value = ''; el.focus(); }
  const file = document.getElementById('manualJsonFile'); if (file) file.value = '';
  const status = document.getElementById('jsonStatus');
  if (status) status.textContent = 'Respuesta vaciada. Puedes pegar o cargar un nuevo JSON.';
}

function parseManualJson() {
  const el = document.getElementById('manualJson');
  const cleaned = sanitizeJsonText(el.value);
  el.value = cleaned;
  return JSON.parse(cleaned);
}

function validateJson() {
  try {
    const data = parseManualJson();
    const missing = [];
    ['version_schema','areas','patrones_globales','analisis_consolidado','recomendaciones'].forEach(k=>{ if (!(k in data)) missing.push(k); });
    if (missing.length) {
      document.getElementById('jsonStatus').innerHTML = '<span class="badge warn">JSON incompleto</span> Faltan: ' + missing.join(', ');
      return false;
    }
    document.getElementById('jsonStatus').innerHTML = '<span class="badge ok">JSON valido</span> Estructura minima verificada.';
    return true;
  } catch(e) {
    const raw = document.getElementById('manualJson').value;
    document.getElementById('jsonStatus').innerHTML = (typeof jsonErrorMessage === 'function')
      ? jsonErrorMessage(e, raw)
      : '<span class="badge danger">JSON invalido</span> ' + escapeHtml(e.message);
    return false;
  }
}

function importJson() {
  if (!validateJson()) return;
  const data = parseManualJson();
  const c = getCurrentCase();
  (data.areas || []).forEach(a => {
    const it = c.interpretations[a.area_id] = (c.interpretations[a.area_id] && typeof c.interpretations[a.area_id] === 'object')
      ? c.interpretations[a.area_id] : {};
    const hasPlanes = ('parrafo_integrado' in a) || ('que_dice' in a) || ('que_sucede' in a) || ('que_se_sugiere' in a);
    if (hasPlanes) {
      it.que_dice = String(a.que_dice || '').trim();
      it.que_sucede = String(a.que_sucede || '').trim();
      it.que_se_sugiere = String(a.que_se_sugiere || '').trim();
      it.parrafo_integrado = String(a.parrafo_integrado || '').trim();
      it.estado_datos = String(a.estado_datos || '').trim();
    } else {
      // Compatibilidad con el esquema antiguo (parrafo unico -> "que sucede")
      it.que_dice = '';
      it.que_sucede = String(a.interpretacion || '').trim();
      it.que_se_sugiere = '';
      it.parrafo_integrado = String(a.parrafo_integrado || a.interpretacion || '').trim();
      it.estado_datos = '';
    }
    it.fuente = 'ia-manual';
    it.texto = areaInterpFlatText(it); // espejo legado
  });
  c.patterns = data.patrones_globales || '';
  c.consolidated = data.analisis_consolidado || '';
  c.recommendations = Array.isArray(data.recomendaciones) ? data.recomendaciones.join('\n') : (data.recomendaciones || '');
  persist();
  renderInterpretation();
  renderReport();
  document.getElementById('jsonStatus').innerHTML = '<span class="badge ok">JSON insertado</span> Revisa y ajusta cada interpretacion antes de exportar.';
  toggleModal('promptModal', false);
  toast('Interpretaciones insertadas. Recuerda revisarlas.', 'ok');
}

function loadJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('manualJson').value = sanitizeJsonText(String(reader.result || ''));
    document.getElementById('jsonStatus').textContent = 'Archivo JSON cargado. Ahora puedes validar o insertar.';
  };
  reader.readAsText(file, 'utf-8');
}

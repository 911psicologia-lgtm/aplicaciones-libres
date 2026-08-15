/* ============================================================
   TRAS · aiflow.js
   Primitivo unico para los flujos de "IA manual":
       construir prompt -> copiar -> pegar JSON -> validar -> importar
   Antes vivia duplicado en interpret.js y goldstein.js; aqui se
   centraliza para que cada nuevo flujo (HC, entrevista, personalidad)
   solo declare como construye el prompt y como aplica el resultado.

   RESGUARDO DE PRIVACIDAD: los prompts salen del navegador hacia una IA
   externa. Por eso todo texto que se envia pasa por `aiScrub`, que
   sustituye el nombre completo del evaluado por sus iniciales y elimina
   datos de contacto del evaluador. La responsabilidad final sobre el
   dato sigue siendo del profesional.
   ============================================================ */

/* Accesos rapidos a asistentes de IA (se abren en pestana nueva). */
const AI_HUBS = [
  { nombre: 'ChatGPT', url: 'https://chatgpt.com/' },
  { nombre: 'Claude',  url: 'https://claude.ai/new' },
  { nombre: 'Gemini',  url: 'https://gemini.google.com/app' },
  { nombre: 'Z.ai',    url: 'https://chat.z.ai/' }
];

/* Construye el hub comun y permite que aparezca justo despues de copiar el
   prompt. Se usa tanto en el modal generico como en TRAS y Goldstein. */
function renderAiHubs(containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = AI_HUBS
    .map(h => `<a class="btn secondary" href="${h.url}" target="_blank" rel="noopener noreferrer">Abrir ${escapeHtml(h.nombre)}</a>`)
    .join('');
}

function revealAiGuide(guideId, hubsId) {
  renderAiHubs(hubsId);
  const guide = document.getElementById(guideId);
  if (!guide) return;
  guide.classList.remove('hidden');
  guide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAiGuide(guideId) {
  const guide = document.getElementById(guideId);
  if (guide) guide.classList.add('hidden');
}

/* Mensaje mas util cuando JSON.parse informa una posicion. No intenta reparar
   silenciosamente el contenido: muestra el lugar aproximado y conserva la
   decision del profesional de vaciar o corregir la respuesta. */
function jsonErrorMessage(error, raw) {
  const msg = String(error && error.message ? error.message : error || 'Error de sintaxis');
  const match = msg.match(/position\s+(\d+)/i);
  let detail = '';
  if (match) {
    const pos = Number(match[1]);
    const text = String(raw || '');
    const from = Math.max(0, pos - 45);
    const to = Math.min(text.length, pos + 45);
    const excerpt = text.slice(from, to).replace(/\s+/g, ' ');
    if (excerpt) detail = `<div class="json-error-context">Cerca del error: <code>${escapeHtml(excerpt)}</code></div>`;
  }
  return `<span class="badge danger">JSON invalido</span> ${escapeHtml(msg)}${detail}<div class="json-error-tip">Vacia el cajon o vuelve a la IA y pide: <strong>“Corrige la sintaxis y devuelve solamente un objeto JSON valido, sin explicaciones ni backticks”.</strong></div>`;
}

/* ---------- Privacidad ---------- */

/* Iniciales a partir de un nombre completo: "Santiago Paez Garcia" -> "S. P. G." */
function initialsOf(nombre) {
  const parts = String(nombre || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'N. N.';
  return parts.map(p => p[0].toUpperCase() + '.').join(' ');
}

/* Sustituye en `text` cualquier aparicion del nombre del evaluado (completo o
   por partes de 3+ letras) por sus iniciales. Es best-effort: no garantiza
   anonimato absoluto, pero evita el descuido mas comun. */
function aiScrub(text, nombre) {
  let out = String(text ?? '');
  const full = String(nombre || '').trim();
  if (!full) return out;
  const ini = initialsOf(full);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Primero el nombre completo, luego cada componente largo.
  out = out.replace(new RegExp(esc(full), 'gi'), ini);
  full.split(/\s+/).filter(p => p.length >= 3).forEach(p => {
    out = out.replace(new RegExp('\\b' + esc(p) + '\\b', 'gi'), ini.split(' ')[0]);
  });
  return out;
}

/* Aplica el scrub recursivamente a un objeto/array de payload. */
function aiScrubDeep(value, nombre) {
  if (typeof value === 'string') return aiScrub(value, nombre);
  if (Array.isArray(value)) return value.map(v => aiScrubDeep(v, nombre));
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach(k => { out[k] = aiScrubDeep(value[k], nombre); });
    return out;
  }
  return value;
}

/* Resumen del caso reutilizable por todos los prompts, ya despersonalizado. */
function aiCaseContext() {
  const c = getCurrentCase();
  const nombre = c.meta.nombre || '';
  const ctx = {
    identificacion: {
      iniciales: initialsOf(nombre),
      edad: c.meta.edad || 'no informada',
      sexo: c.meta.sexo || 'no informado'
    },
    historia_clinica: {
      resumen_contextual: c.hc.resumen || '',
      motivo: c.hc.motivo, evento: c.hc.evento, familia: c.hc.familia,
      escolar: c.hc.escolar, sintomas: c.hc.sintomas, recursos: c.hc.recursos,
      objetivo: c.hc.objetivo, alertas: c.hc.alertas || []
    }
  };
  return aiScrubDeep(ctx, nombre);
}

/* ---------- Registro de flujos ---------- */
/* Cada flujo declara:
     titulo, hint       -> cabecera del modal
     aviso              -> texto del banner de privacidad (opcional)
     buildPrompt()      -> string
     requiredKeys       -> claves minimas del JSON de respuesta
     apply(data)        -> aplica el resultado al caso; devuelve mensaje de exito */
const AI_FLOWS = {};

function registerAiFlow(id, flow) { AI_FLOWS[id] = flow; }

let _activeAiFlow = null;

function openAiFlow(id) {
  const flow = AI_FLOWS[id];
  if (!flow) { toast('Flujo de IA no disponible.', 'danger'); return; }
  syncInputsToState();
  _activeAiFlow = id;

  let prompt;
  try { prompt = flow.buildPrompt(); }
  catch (e) { toast('No se pudo construir el prompt: ' + e.message, 'danger'); return; }

  document.getElementById('aiFlowTitle').textContent = flow.titulo;
  document.getElementById('aiFlowHint').textContent = flow.hint || '';
  document.getElementById('aiFlowNotice').innerHTML = flow.aviso ||
    'Este prompt saldra de tu navegador hacia una IA externa. Los datos van despersonalizados (iniciales en vez de nombre), pero la responsabilidad sobre la informacion clinica sigue siendo tuya.';
  document.getElementById('aiFlowPrompt').value = prompt;
  document.getElementById('aiFlowJson').value = '';
  const f = document.getElementById('aiFlowJsonFile'); if (f) f.value = '';
  document.getElementById('aiFlowStatus').innerHTML = 'Aun no has pegado la respuesta.';
  hideAiGuide('aiFlowGuide');
  renderAiHubs('aiFlowHubs');
  toggleModal('aiFlowModal', true);
}

async function copyAiPrompt() {
  const t = document.getElementById('aiFlowPrompt');
  try {
    await navigator.clipboard.writeText(t.value);
    toast('Prompt copiado. Elige una IA y sigue la ruta indicada.', 'ok');
  } catch (e) {
    t.focus(); t.select();
    try { document.execCommand('copy'); toast('Prompt copiado. Elige una IA y sigue la ruta indicada.', 'ok'); }
    catch (_) { toast('Copia manual: selecciona el texto y usa Ctrl+C.', 'warn'); }
  }
  revealAiGuide('aiFlowGuide', 'aiFlowHubs');
}

/* Reutiliza el saneador ya probado de interpret.js si esta disponible. */
function aiSanitize(raw) {
  if (typeof sanitizeJsonText === 'function') return sanitizeJsonText(raw);
  let text = String(raw || '').trim();
  text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  text = text.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a !== -1 && b > a) text = text.slice(a, b + 1);
  return text;
}

async function pasteAiJson() {
  const el = document.getElementById('aiFlowJson');
  try {
    el.value = await navigator.clipboard.readText();
    el.focus();
    validateAiJson();
  } catch (e) {
    toast('El navegador no permitio leer el portapapeles. Pega manualmente con Ctrl+V.', 'warn', 4500);
    el.focus();
  }
}

function clearAiJson() {
  const el = document.getElementById('aiFlowJson');
  if (el) { el.value = ''; el.focus(); }
  const file = document.getElementById('aiFlowJsonFile'); if (file) file.value = '';
  const status = document.getElementById('aiFlowStatus');
  if (status) status.textContent = 'Respuesta vaciada. Puedes pegar o cargar un nuevo JSON.';
}

function parseAiJson() {
  const el = document.getElementById('aiFlowJson');
  const cleaned = aiSanitize(el.value);
  el.value = cleaned;
  return JSON.parse(cleaned);
}

function validateAiJson() {
  const flow = AI_FLOWS[_activeAiFlow];
  const status = document.getElementById('aiFlowStatus');
  if (!flow) return false;
  try {
    const data = parseAiJson();
    const missing = (flow.requiredKeys || []).filter(k => !(k in data));
    if (missing.length) {
      status.innerHTML = '<span class="badge warn">JSON incompleto</span> Faltan: ' + escapeHtml(missing.join(', '))
        + '<div class="json-error-tip">Vuelve a la IA y pide: <strong>"Completa las claves faltantes (' + escapeHtml(missing.join(', ')) + ') y devuelve de nuevo el objeto JSON completo".</strong></div>';
      return false;
    }
    status.innerHTML = '<span class="badge ok">JSON valido</span> Estructura minima verificada. Puedes insertarlo en el caso.';
    return true;
  } catch (e) {
    status.innerHTML = jsonErrorMessage(e, document.getElementById('aiFlowJson').value);
    return false;
  }
}

function importAiJson() {
  const flow = AI_FLOWS[_activeAiFlow];
  if (!flow || !validateAiJson()) return;
  let msg;
  try { msg = flow.apply(parseAiJson()); }
  catch (e) {
    document.getElementById('aiFlowStatus').innerHTML = '<span class="badge danger">No se pudo aplicar</span> ' + escapeHtml(e.message);
    return;
  }
  persist('Datos insertados desde IA: ' + flow.titulo);
  hydrateInputs();
  renderCaseList();
  toggleModal('aiFlowModal', false);
  toast(msg || 'Datos insertados. Revisalos antes de exportar.', 'ok', 4200);
}

function loadAiJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('aiFlowJson').value = aiSanitize(String(reader.result || ''));
    validateAiJson();
  };
  reader.readAsText(file, 'utf-8');
}


/* ============================================================
   FLUJO · Cierre editorial del informe
   Integra exclusivamente lo ya registrado. No sustituye ni reescribe las
   respuestas, interpretaciones por area o resultados de Goldstein.
   ============================================================ */
registerAiFlow('informe', {
  titulo: 'Informe clinico consolidado de toda la evaluacion',
  hint: 'Integra historia clinica, todas las areas del TRAS —incluidas las que no tienen datos—, Goldstein, la Matriz Cognitivo-Atencional (cuando esta aplicada), perfil de personalidad y anexos incluidos. No sustituye el desglose por areas: construye una comprension transversal del caso.',
  aviso: 'La IA recibe informacion clinica despersonalizada. Debe distinguir hechos registrados, interpretaciones profesionales, hipotesis y vacios de informacion. No puede inventar datos, diagnosticos, escalas ni resultados. Todo el texto queda editable y requiere revision profesional.',
  requiredKeys: [
    'informe_consolidado',
    'hallazgos_convergentes',
    'recursos_protectores',
    'vulnerabilidades_contextuales',
    'datos_faltantes_limites',
    'sintesis_para_cuidadores',
    'recomendaciones_prioritarias',
    'cierre_integrado'
  ],
  buildPrompt() {
    if (typeof syncInformeInputs === 'function') syncInformeInputs();
    const c = getCurrentCase();
    const ctx = aiCaseContext();

    const areas = allAreas().map(area => {
      const action = c.modules.sensibles[area.id] || 'aplicar';
      const it = (typeof areaInterp === 'function') ? areaInterp(area.id) : (c.interpretations[area.id] || {});
      const respuestas = (area.items || []).map(item => {
        const st = c.responses[item.id] || {};
        const respuesta = String(st.respuesta || '').trim();
        const notas = String(st.notas || '').trim();
        if (!respuesta && !notas) return null;
        return {
          item_id: item.id,
          enunciado: item.texto,
          respuesta,
          notas_clinicas: notas,
          marcado_para_profundizar: !!st.profundizar
        };
      }).filter(Boolean);
      const interpretacion = {
        parrafo_integrado: String(it.parrafo_integrado || it.texto || '').trim(),
        plano_descriptivo: String(it.que_dice || '').trim(),
        lectura_clinica: String(it.que_sucede || '').trim(),
        orientacion: String(it.que_se_sugiere || '').trim(),
        hallazgos_clave: Array.isArray(it.hallazgos_clave) ? it.hallazgos_clave : [],
        banderas: Array.isArray(it.banderas) ? it.banderas : [],
        recursos: Array.isArray(it.recursos) ? it.recursos : []
      };
      const hasInterp = Object.values(interpretacion).some(v => Array.isArray(v) ? v.length : String(v || '').trim());
      let estado = 'sin datos';
      if ((area.id === 'area_17' || area.id === 'area_18') && action === 'omitir') estado = 'omitida por decision profesional';
      else if ((area.id === 'area_17' || area.id === 'area_18') && action === 'posponer' && !respuestas.length && !hasInterp) estado = 'pospuesta';
      else if (respuestas.length && hasInterp) estado = 'con respuestas e interpretacion';
      else if (respuestas.length) estado = 'con respuestas, sin integracion clinica suficiente';
      else if (hasInterp) estado = 'con informacion clinica, sin respuestas literales registradas';
      return {
        area_id: area.id,
        area: area.nombre,
        objetivo: area.objetivo_area,
        estado,
        decision_area_sensible: area.sensible ? action : 'no aplica',
        respuestas,
        interpretacion
      };
    });

    let goldstein = null;
    if (c.goldstein && c.goldstein.aplicado) {
      const interp = c.goldstein.interp || {};
      const resultados = (typeof computeGoldstein === 'function') ? computeGoldstein(c.goldstein.respuestas || {}) : null;
      const gruposNombre = Object.fromEntries((typeof GOLDSTEIN_GRUPOS !== 'undefined' ? GOLDSTEIN_GRUPOS : []).map(g => [g.id, g.nombre]));
      const respuestasItems = (typeof GOLDSTEIN_ITEMS !== 'undefined' ? GOLDSTEIN_ITEMS : []).map(item => {
        const valor = c.goldstein.respuestas && c.goldstein.respuestas[item.id];
        if (!valor) return null;
        const nivel = (typeof GOLDSTEIN_NIVELES !== 'undefined' && GOLDSTEIN_NIVELES[valor]) ? GOLDSTEIN_NIVELES[valor].titulo : valor;
        return { grupo: gruposNombre[item.grupo] || item.grupo, habilidad: item.texto, respuesta: nivel };
      }).filter(Boolean);
      goldstein = {
        respondidos: respuestasItems.length,
        resultados_globales: resultados ? resultados.global : null,
        clasificacion: resultados && resultados.clasificacion ? resultados.clasificacion.etiqueta : '',
        resultados_por_grupo: resultados ? resultados.porGrupo.map(g => ({
          grupo: `${g.romano}. ${g.nombre}`,
          porcentajes: g.pct,
          respondidos: g.respondidos,
          total: g.total
        })) : [],
        respuestas_por_habilidad: respuestasItems,
        interpretacion_profesional: {
          habilidades_que_salen: interp.que_sale || '',
          lectura_psicologica: interp.analisis_causal || '',
          indicaciones: interp.sugerencias || '',
          conclusion: interp.conclusion || ''
        }
      };
    }

    const personalidad = c.personalidad && c.personalidad.aplicado ? {
      encuadre: 'Perfil descriptivo de personalidad en formacion; no es MMPI-A ni prueba estandarizada.',
      dimensiones: c.personalidad.dimensiones || [],
      sintesis: c.personalidad.sintesis || ''
    } : null;

    let matrizCognitivoAtencional = null;
    if (c.matrizCA && (c.matrizCA.aplicado || (c.modules && c.modules.matrizCA))) {
      matrizCognitivoAtencional = {
        encuadre: 'Instrumento de exploracion y organizacion de hallazgos; no es una prueba estandarizada. Los indicadores de atencion/impulsividad son autoinformados y no equivalen a un diagnostico de TDAH.',
        cognitivas: (typeof computeMcaCognitivas === 'function') ? computeMcaCognitivas(c.matrizCA) : null,
        atencion: (typeof computeMcaAtencion === 'function') ? computeMcaAtencion(c.matrizCA) : null,
        inteligencias: (typeof computeMcaInteligencias === 'function') ? computeMcaInteligencias(c.matrizCA) : null,
        interpretacion_profesional: c.matrizCA.interp || {}
      };
    }

    const anexos = (c.anexos || []).filter(a => a.incluir && String(a.contenido || '').trim()).map(a => ({
      titulo: a.titulo,
      contenido: a.contenido
    }));

    const material = aiScrubDeep({
      contexto: ctx,
      resumen_clinico: c.hc.resumen || '',
      alcance: c.scope || 'ambos',
      tras: {
        modo_aplicacion: c.trasMode === 'resumido' ? 'resumido (38 items: ciclos C y D)' : 'extenso ajustado (59 items; se retiraron items redundantes por area)',
        areas,
        patrones_globales: c.patterns || '',
        analisis_consolidado_previo: c.consolidated || '',
        recomendaciones_previas: String(c.recommendations || '').split(/\n+/).filter(Boolean)
      },
      habilidades_sociales_goldstein: goldstein,
      matriz_cognitivo_atencional: matrizCognitivoAtencional,
      personalidad_en_formacion: personalidad,
      anexos_incluidos: anexos
    }, c.meta.nombre);

    const hayMaterial = areas.some(a => a.respuestas.length || Object.values(a.interpretacion).some(v => Array.isArray(v) ? v.length : String(v || '').trim()))
      || goldstein || matrizCognitivoAtencional || personalidad || anexos.length || String(c.hc.resumen || c.hc.motivo || '').trim();
    if (!hayMaterial) throw new Error('No hay informacion suficiente para construir el informe consolidado.');

    return `# ROL
Eres un psicólogo clínico infanto-juvenil que integra información de distintas fuentes para redactar un informe comprensible, riguroso y humano. El texto será leído por padres, cuidadores, docentes y otros profesionales. Debe permitir entender qué ocurre en el caso, cómo se relacionan los hallazgos y qué necesita acompañamiento, sin convertir el informe en una exposición teórica.

# MARCO DE COMPRENSIÓN INTERNO
Trabaja internamente con una orientación humanista-existencial, psicodinámica integrativa y abierta al diálogo de saberes. Esto guía la lectura del sentido, los vínculos, la ambivalencia, los recursos, las condiciones contextuales y la posible función de algunas respuestas. NO nombres estas corrientes en la salida y no escribas fórmulas como "desde una perspectiva...", "desde el enfoque..." o "psicológicamente hablando". La integración debe reconocerse en la calidad del razonamiento, no en etiquetas teóricas.

# PRINCIPIO CENTRAL
El análisis por áreas del TRAS ya existe y permanece completo en el informe. NO debes sustituirlo, amputarlo, convertirlo en una lista ni repetirlo área por área. Tu tarea es construir una lectura transversal de toda la evaluación: historia clínica, áreas TRAS, patrones, habilidades sociales, Matriz Cognitivo-Atencional (cuando esté disponible), perfil descriptivo de personalidad y anexos incluidos.

# CÓMO INTEGRAR SIN PERDER INFORMACIÓN
- Reconstruye el hilo del caso: antecedentes, acontecimientos detonantes, evolución temporal, contexto familiar, escolar y social, experiencias relacionales y manifestaciones emocionales, cognitivas, conductuales y corporales.
- Si "tras.modo_aplicacion" indica modo resumido, es una decisión deliberada del profesional para tiempos cortos, no un vacío de información: extrae el máximo sentido clínico de los ítems disponibles y mantén el mismo nivel de profundidad interpretativa que en el modo extenso. No te disculpes por la brevedad de los datos ni infles conclusiones más allá de lo que el material permite.
- Si se incluye "matriz_cognitivo_atencional", intégrala como una fuente más: relaciona el desempeño cognitivo por área, los indicadores autoinformados de atención/impulsividad/regulación emocional y las fortalezas de inteligencias múltiples con lo hallado en el TRAS, Goldstein e historia clínica. No la presentes como una prueba estandarizada ni conviertas sus indicadores atencionales en un diagnóstico de TDAH.
- Conserva hechos clínicamente relevantes aunque no encajen en el eje principal. No sacrifiques violencia, pérdidas, cambios de cuidado, restricciones, conflicto entre adultos, alteraciones del sueño o apetito, evitación, deterioro académico, aislamiento, conductas de riesgo o recursos protectores.
- Identifica convergencias entre fuentes y explica qué proceso común permiten comprender.
- Registra tensiones y discrepancias sin forzarlas a coincidir. Una habilidad puede estar disponible en situaciones cotidianas y disminuir bajo vergüenza, rechazo, autoridad, presión o alta carga afectiva.
- Explica condiciones de variación: cuándo aumentan las dificultades, cuándo disminuyen, con quiénes aparecen y qué apoyos permiten reorganización.
- Diferencia hechos expresados, resultados descriptivos, interpretación profesional, hipótesis prudentes y vacíos de información.
- Integra responsabilidad por las conductas sin convertirla en descalificación personal.
- No atribuyas causalidad única ni lineal. Formula relaciones contextuales, recíprocas y temporales cuando los datos lo permitan.
- Los datos faltantes no se rellenan. Se nombran como límites o preguntas de seguimiento.
- No inventes hechos, síntomas, diagnósticos, puntajes, percentiles, escalas, instrumentos ni conclusiones sobre áreas no exploradas.
- El perfil de personalidad es descriptivo y en formación; no lo presentes como MMPI-A ni como estructura fija.

# ESTILO Y DESTINATARIOS
- Escribe como un terapeuta que explica el caso con claridad a adultos responsables, sin infantilizarlos y sin exigir conocimientos de psicología.
- Usa lenguaje clínico accesible, frases naturales y conexiones explícitas entre contexto y hallazgos.
- Evita jerga, exhibición teórica, tecnicismos innecesarios y tono de plantilla.
- NO uses "El material sugiere", "desde una perspectiva...", "se evidencia", "los resultados indican" ni repitas "se observa una tendencia".
- Evita párrafos que solo acumulen categorías. Cada párrafo debe desarrollar una idea central y mostrar por qué es importante en este caso.
- No hagas afirmaciones tajantes cuando la información solo permite una hipótesis. Expresa la cautela de forma natural: "podría relacionarse con", "conviene contrastar", "la información disponible no permite afirmar".
- No repitas lo ya dicho en el análisis por áreas; intégralo en un nivel superior de comprensión.

# PRODUCTOS
1. "informe_consolidado": 5 a 7 párrafos, normalmente entre 550 y 850 palabras. La extensión puede variar según la complejidad. Debe explicar el contexto, el funcionamiento actual, las relaciones entre hallazgos, las condiciones que intensifican o alivian las dificultades, los recursos y los límites. No uses subtítulos dentro del texto.
2. "hallazgos_convergentes": 4 a 7 enunciados integradores. Cada uno debe relacionar al menos dos fuentes cuando sea posible y evitar repetir el informe consolidado.
3. "recursos_protectores": 3 a 7 recursos concretos y la función que cumplen en el caso.
4. "vulnerabilidades_contextuales": 3 a 7 condiciones o procesos que aumentan el malestar o reducen el uso de recursos.
5. "datos_faltantes_limites": 2 a 8 vacíos, contradicciones, áreas no exploradas o aspectos que requieren contraste.
6. "sintesis_para_cuidadores": uno o dos párrafos, normalmente entre 180 y 280 palabras, en lenguaje claro. Debe explicar qué está pasando, qué no significa, qué recursos conserva el menor y qué necesitan hacer los adultos.
7. "recomendaciones_prioritarias": 5 a 8 acciones concretas, proporcionadas y directamente vinculadas con los hallazgos.
8. "cierre_integrado": un párrafo de 100 a 160 palabras que resuma funcionamiento actual, recursos, vulnerabilidades, límites y foco de seguimiento sin repetir fórmulas del informe.

# SALIDA
Devuelve SOLO un objeto JSON válido, sin backticks, comentarios ni texto adicional:
{"informe_consolidado":"5 a 7 párrafos","hallazgos_convergentes":["..."],"recursos_protectores":["..."],"vulnerabilidades_contextuales":["..."],"datos_faltantes_limites":["..."],"sintesis_para_cuidadores":"uno o dos párrafos","recomendaciones_prioritarias":["..."],"cierre_integrado":"párrafo"}

# INFORMACIÓN CONFIRMADA Y DESPERSONALIZADA
${JSON.stringify(material, null, 1)}`;
  },
  apply(data) {
    const c = getCurrentCase();
    const arr = v => Array.isArray(v)
      ? v.map(x => String(x || '').trim()).filter(Boolean)
      : String(v || '').split(/\n+/).map(x => x.replace(/^\s*(?:[-•]|\d+[.)-]?)\s*/, '').trim()).filter(Boolean);
    c.informe = {
      consolidado_integral: String(data.informe_consolidado || '').trim(),
      hallazgos_convergentes: arr(data.hallazgos_convergentes),
      recursos_protectores: arr(data.recursos_protectores),
      vulnerabilidades_contextuales: arr(data.vulnerabilidades_contextuales),
      datos_faltantes_limites: arr(data.datos_faltantes_limites),
      sintesis_padres: String(data.sintesis_para_cuidadores || '').trim(),
      recomendaciones_prioritarias: arr(data.recomendaciones_prioritarias),
      cierre: String(data.cierre_integrado || '').trim(),
      fuente: 'ia-manual'
    };
    if (typeof renderInformeEditorial === 'function') renderInformeEditorial();
    if (typeof renderReport === 'function') renderReport();
    return 'Informe consolidado insertado. Revisa la integracion, los cuadros y las orientaciones antes de exportar.';
  }
});

/* ============================================================
   FLUJO 1 · Historia clinica: ordenar un texto libre en los campos
   de la app y producir un resumen clínico contextual, suficiente y flexible.
   ============================================================ */
registerAiFlow('hc', {
  titulo: 'HC con apoyo de IA',
  hint: 'Pega el prompt junto con la historia clínica en bruto. La IA organizará los campos y redactará un resumen contextual suficientemente amplio para comprender el caso, sin sustituir ni recortar los hechos relevantes.',
  requiredKeys: ['hc'],
  buildPrompt() {
    const c = getCurrentCase();
    const ini = initialsOf(c.meta.nombre);
    return `# ROL
Eres un asistente clínico que organiza información de historia clínica infanto-juvenil para un informe dirigido a padres, docentes y profesionales. Tu tarea es conservar el contenido relevante, ordenarlo y redactarlo de manera comprensible. No diagnosticas, no completas vacíos y no conviertes una historia compleja en una síntesis superficial.

# TAREA
A continuación recibirás una historia clínica en bruto: notas, transcripción, texto libre o informe previo. Debes:

1. DISTRIBUIR la información en los campos de la aplicación sin perder datos significativos. Conserva cronología, relaciones familiares, hechos detonantes, contexto escolar, manifestaciones emocionales, cognitivas, conductuales o corporales, cambios observados, impacto cotidiano, recursos, apoyos y propósito de la evaluación.
2. REDACTAR un "resumen" clínico contextual que permita comprender globalmente qué ocurre en el caso sin tener que leer toda la historia clínica. No es un resumen telegráfico ni una lista de síntomas.
3. IDENTIFICAR alertas únicamente cuando estén expresamente sustentadas en el texto.

# CRITERIOS DEL RESUMEN CLÍNICO CONTEXTUAL
- Puede ocupar uno o dos párrafos. La extensión es flexible: suele requerir entre 160 y 280 palabras, pero la prioridad es la suficiencia contextual, no cumplir un número.
- Debe incluir, cuando exista información: quién es el evaluado y etapa evolutiva; motivo y razón de la evaluación; secuencia temporal de los hechos; contexto familiar, escolar y social relevante; evento o proceso detonante; manifestaciones actuales y su impacto; cambios recientes; respuestas de los adultos o del entorno; recursos protectores; situación actual y propósito del acompañamiento.
- Preserva hechos delicados o decisivos —violencia, pérdidas, conflictos, restricciones, cambios de cuidado, riesgo, deterioro escolar, aislamiento, alteraciones del sueño o apetito— cuando estén registrados. No los diluyas con fórmulas generales.
- Si existen versiones distintas entre informantes, dudas, contradicciones o datos por confirmar, consérvalos como tales. No elijas una versión ni cierres la incertidumbre.
- No repitas mecánicamente todos los campos. Construye una narración clínica coherente que muestre relaciones y secuencia.
- No uses títulos de escuelas psicológicas ni expresiones como "desde una perspectiva psicológica", "humanista", "existencial" o "psicodinámica". La comprensión integrativa debe notarse en la articulación, no nombrarse.
- Evita jerga innecesaria. Escribe con precisión profesional y lenguaje accesible para cuidadores y docentes.
- No uses "El material sugiere", "se evidencia" ni comienzos repetitivos de plantilla.

# REGLAS DE FIDELIDAD
- Ajusta redacción, no contenido. No agregues hechos, síntomas, causas, diagnósticos, intenciones ni interpretaciones ausentes.
- No reduzcas varios hechos distintos a una sola etiqueta. Por ejemplo, conserva por separado el evento, la respuesta familiar, el efecto emocional y el cambio escolar si todos aparecen.
- Si un campo carece de información, devuelve "".
- Refiérete al evaluado por sus iniciales (${ini}) o como "el evaluado"/"la evaluada". No incluyas nombres completos, direcciones ni datos de contacto.
- Las alertas válidas son exclusivamente: "Ideacion", "Agresion", "Negligencia", "Abuso reportado", "Conducta de riesgo". Si ninguna está sustentada, devuelve [].

# DATOS DE CONTEXTO
Evaluado: ${ini}, ${c.meta.edad || 'edad no informada'}, ${c.meta.sexo || 'sexo no informado'}.

# SALIDA
Devuelve SOLO JSON válido, sin backticks ni texto adicional, con este esquema exacto:
{"hc":{"motivo":"","evento":"","familia":"","escolar":"","sintomas":"","recursos":"","objetivo":"","resumen":"uno o dos párrafos suficientemente contextualizados","alertas":[]}}

# HISTORIA CLÍNICA EN BRUTO
<<< PEGA AQUÍ EL TEXTO DE LA HISTORIA CLÍNICA >>>`;
  },
  apply(data) {
    const c = getCurrentCase();
    const h = data.hc || {};
    const campos = ['motivo','evento','familia','escolar','sintomas','recursos','objetivo','resumen'];
    campos.forEach(k => { if (k in h) c.hc[k] = String(h[k] || '').trim(); });
    const validas = ['Ideacion','Agresion','Negligencia','Abuso reportado','Conducta de riesgo'];
    if (Array.isArray(h.alertas)) c.hc.alertas = h.alertas.filter(a => validas.includes(a));
    const n = countWords(c.hc.resumen);
    return `Historia clinica insertada. Resumen de ${n} palabras. Revisa cada campo antes de exportar.`;
  }
});

/* ============================================================
   FLUJO 2 · Entrevista guiada: transcribir y ordenar las 76+ respuestas.
   La instruccion clave es "ajustar redaccion, no contenido".
   ============================================================ */
registerAiFlow('entrevista', {
  titulo: 'Entrevista con apoyo de IA',
  hint: 'Usa este prompt para transcribir la entrevista (audio dictado, notas o respuestas sueltas) y devolverla como JSON. Se insertaran las respuestas que traiga; las que falten quedan en blanco y las completas a mano. Nada se pierde: lo ya guardado permanece.',
  requiredKeys: ['respuestas'],
  buildPrompt() {
    const c = getCurrentCase();
    const ini = initialsOf(c.meta.nombre);
    const items = flattenedItems().map(it => ({
      id: it.id,
      num: it.num_test,
      area: it.areaNombre,
      frase: it.texto || ''
    }));
    return `# ROL
Eres un asistente de transcripción clínica. Tu tarea es ordenar las respuestas de una entrevista de completamiento de frases TRAS en el formato que necesita la aplicación, preservando con máxima fidelidad lo que dijo el evaluado y lo que registró el profesional.

# REGLA CENTRAL
Ajustas la REDACCIÓN, nunca el CONTENIDO.
- Puedes corregir ortografía, puntuación y muletillas que no aportan sentido.
- No parafrasees, resumas, interpretes, completes, suavices ni intensifiques.
- Conserva negaciones, dudas, condicionales, contradicciones, cambios de idea, referencias temporales y palabras emocionalmente significativas.
- No conviertas varias ideas en una sola frase general. Si una respuesta contiene afecto, hecho, explicación y petición, conserva los cuatro elementos.
- Mantén expresiones textuales breves entre comillas cuando su formulación tenga valor clínico.
- Si una respuesta es ambigua, fragmentaria o difícil de entender, transcríbela fielmente y marca "profundizar":true; no la arregles inventando sentido.
- Si no hay respuesta para un ítem, omítelo del JSON.

# TAREA
Empareja la transcripción o las notas con los ítems usando exactamente su "id". Para cada ítem respondido devuelve:
- "respuesta": contenido fiel, con redacción mínima para legibilidad.
- "notas": observaciones del evaluador —tono, silencio, gesto, vacilación, cambio emocional, contexto— únicamente cuando estén registradas.
- "profundizar": true si el evaluador lo indicó o si la respuesta quedó incompleta, contradictoria o ambigua.

# ATRIBUCIÓN Y PRIVACIDAD
- Distingue con claridad lo dicho por el evaluado de las notas del profesional.
- Refiérete al evaluado como ${ini}.
- Sustituye nombres completos de terceros por relaciones comprensibles: "la madre", "el padre", "un compañero", "la profesora".
- No elimines la relación o el rol, porque puede ser relevante para comprender la respuesta.

# SALIDA
Devuelve SOLO JSON válido, sin backticks ni texto adicional:
{"respuestas":{"area_01_A":{"respuesta":"...","notas":"","profundizar":false},"area_01_B":{"respuesta":"...","notas":"","profundizar":true}}}

Incluye únicamente los ítems que tengan respuesta o nota registrada. Si la entrevista fue parcial, devuelve solo lo aplicado: la aplicación conservará lo demás.

# ÍTEMS DEL INSTRUMENTO
${JSON.stringify(items, null, 1)}

# TRANSCRIPCIÓN O NOTAS
<<< PEGA AQUÍ LA TRANSCRIPCIÓN >>>`;
  },
  apply(data) {
    const c = getCurrentCase();
    const r = data.respuestas || {};
    const validIds = new Set(flattenedItems().map(i => i.id));
    let n = 0, ignorados = 0;
    Object.keys(r).forEach(id => {
      if (!validIds.has(id)) { ignorados++; return; }
      const src = r[id] || {};
      const dst = c.responses[id] = c.responses[id] || { respuesta:'', notas:'', profundizar:false };
      if (typeof src.respuesta === 'string' && src.respuesta.trim()) { dst.respuesta = src.respuesta.trim(); n++; }
      if (typeof src.notas === 'string') dst.notas = src.notas.trim();
      if (typeof src.profundizar === 'boolean') dst.profundizar = src.profundizar;
    });
    if (!n) throw new Error('El JSON no trajo ninguna respuesta valida. Verifica que los "id" coincidan con los del instrumento.');
    return `${n} respuesta(s) insertada(s)${ignorados ? `, ${ignorados} id no reconocido(s) ignorado(s)` : ''}. Revisa la entrevista antes de interpretar.`;
  }
});

/* Cuenta palabras de un texto (usada por el contador del resumen). */
function countWords(str) {
  const t = String(str || '').trim();
  return t ? t.split(/\s+/).length : 0;
}

const APP_VERSION = "0.3.5";
const STORE = "rizoma_promptlab_premium_v0_3_5";
const OLD_STORE = "rizoma_promptlab_premium_v0_3_4";
const OLD_STORE_2 = "rizoma_promptlab_premium_v0_2_2";
const OLD_STORE_3 = "rizoma_promptlab_premium_v0_2_1";
const OLD_STORE_4 = "rizoma_promptlab_premium_v0_2";
const OLD_STORE_5 = "rizoma_promptlab_premium_v0_1";
const PALETTE_KEY = "rizoma_serena_palette_v1";
let state = {profile:{}, draft:{}, cases:[], currentPrompt:null, currentResponse:null, currentReportText:"", currentReportHTML:"", history:["home"]};
let recognition = null;
let isRecording = false;
let lastMicChunk = "";
let micFinalBuffer = new Set();
let activeMicField = "centralQuestion";
let activeMicButton = null;
let pendingAILink = "";

const palettes = {
  "Serena Azul":{bg:"#F0F7FF",card:"#FFFFFF",brand:"#1CA7EC",text:"#1A2A4A","brand-2":"#1F2F98",line:"#C5DFF8",muted:"#6E7C91",soft:"#DFF3FF","soft-2":"#EAF4FF"},
  "Bosque Calma":{bg:"#F2FAF5",card:"#FFFFFF",brand:"#2EAD72",text:"#14382A","brand-2":"#4D8B64",line:"#CBE8D6",muted:"#6D7F73",soft:"#E5F6EC","soft-2":"#F0FBF4"},
  "Arena Suave":{bg:"#FFF8EF",card:"#FFFFFF",brand:"#D98C45",text:"#3B2A1E","brand-2":"#B96E3C",line:"#F0D9BE",muted:"#806F61",soft:"#FFF0DD","soft-2":"#FFF7EC"},
  "Lavanda Minimal":{bg:"#F7F2FF",card:"#FFFFFF",brand:"#8B6BE8",text:"#2B2144","brand-2":"#6F5ACD",line:"#D8CCFA",muted:"#776C8F",soft:"#EEE7FF","soft-2":"#FAF7FF"},
  "Noche Serena":{bg:"#0F172A",card:"#162033",brand:"#38BDF8",text:"#EAF6FF","brand-2":"#818CF8",line:"#27364F",muted:"#A8B3C7",soft:"#1E2B44","soft-2":"#101B2E"}
};

const aiLinks = [
  ["ChatGPT","https://chatgpt.com/"],["Gemini","https://gemini.google.com/"],["Copilot","https://copilot.microsoft.com/"],
  ["Perplexity","https://www.perplexity.ai/"],["You.com","https://you.com/"],["Claude","https://claude.ai/"],
  ["Mistral","https://chat.mistral.ai/"],["Phind","https://www.phind.com/"],["Poe","https://www.poe.com/"],["Groq","https://groq.com/"]
];

function loadState(){
  try{
    const s0 = JSON.parse(localStorage.getItem(STORE)||"null");
    const s1 = JSON.parse(localStorage.getItem(OLD_STORE)||"null");
    const s2 = JSON.parse(localStorage.getItem(OLD_STORE_2)||"null");
    const s3 = JSON.parse(localStorage.getItem(OLD_STORE_3)||"null");
    const s4 = JSON.parse(localStorage.getItem(OLD_STORE_4)||"null");
    const s5 = JSON.parse(localStorage.getItem(OLD_STORE_5)||"null");
    state = {...state, ...(s0 || s1 || s2 || s3 || s4 || s5 || {})};
  }catch(e){}
  applyPalette(localStorage.getItem(PALETTE_KEY)||"Serena Azul");
  renderPalettes(); renderAIHub(); renderCases(); fillProfile(); toggleCustomProduct(); toggleCustomNature();
}
function saveState(){
  try{ localStorage.setItem(STORE, JSON.stringify(state)); }
  catch(e){ toast("Espacio de almacenamiento lleno. Exporta casos antes de continuar."); }
}
function $(id){ return document.getElementById(id); }
function val(id){ return ($(id)?.value||"").trim(); }
function setVal(id,v){ if($(id)) $(id).value = v||""; }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2800); }

// ─── NAVEGACIÓN ────────────────────────────────────────────────────
function go(name){
  // Detener micrófono al cambiar de pantalla (FIX A3)
  if(isRecording) stopMic();

  const target = document.querySelector(`[data-screen="${name}"]`);
  if(!target) return;
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  target.classList.add("active");
  $("screenLabel").textContent = ({home:"Inicio",profile:"Perfil",question:"Pregunta",docs:"Anexos",prompt:"Prompt",hub:"Hub IA",validate:"Validación",report:"Informe",cases:"Casos"})[name]||name;
  if(state.history[state.history.length-1]!==name) state.history.push(name);
  renderCases(); saveState(); window.scrollTo(0,0);
}
function back(){ if(state.history.length>1){ state.history.pop(); go(state.history.pop()||"home"); } else go("home"); }
function openDrawer(){ $("drawer").classList.toggle("open"); }
function closeDrawer(e){ if(e.target.id==="drawer") $("drawer").classList.remove("open"); }

// ─── PERFIL ────────────────────────────────────────────────────────
function saveProfile(){
  state.profile = {name:val("name"), profession:val("profession"), email:val("email"), phone:val("phone"), field:val("field"), aiUse:val("aiUse")};
  saveState(); toast("Perfil guardado");
}
function fillProfile(){
  const p=state.profile||{};
  ["name","profession","email","phone","field","aiUse"].forEach(k=>setVal(k,p[k]));
}

// ─── TOGGLES ───────────────────────────────────────────────────────
function toggleCustomNature(){
  const custom = val("reportNature") === "Otro / personalizado";
  $("customNatureBox")?.classList.toggle("hidden", !custom);
  $("customNatureStructureBox")?.classList.toggle("hidden", !custom);
  $("customNatureFieldsBox")?.classList.toggle("hidden", !custom);
  if(!custom){
    // Limpiar preview si se cambia a otra naturaleza
    const preview = $("customKeysPreview");
    if(preview){ preview.innerHTML=""; preview.style.display="none"; }
  }
}
function toggleCustomProduct(){
  const isCustom = val("productType") === "Otro personalizado";
  $("customProductBox")?.classList.toggle("hidden", !isCustom);
}

// ─── ETIQUETAS Y AGENTES ───────────────────────────────────────────
function generateLabels(){
  const text = [val("profession"),val("field"),val("centralQuestion"),val("productType"),val("customProduct"),val("manualLabels")].join(" ").toLowerCase();
  const base = [];
  [["clínic","clinica"],["salud","salud"],["educ","educacion"],["invest","investigacion"],["derecho","legal"],["abog","legal"],["app","app"],["web","web"],["diagn","diagnostico"],["informe","informe"],["curso","curso"],["matriz","matriz"],["oftal","oftalmologia"],["optom","optometria"],["psicol","psicologia"],["sentencia","juridico"],["tesis","tesis"],["epistemol","epistemologia"],["complej","complejidad"],["pedagog","pedagogia"]].forEach(([key,label])=>{if(text.includes(key)) base.push(label)});
  val("manualLabels").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean).forEach(x=>base.push(x));
  return [...new Set(base)].slice(0,12);
}

function chooseAgents(){
  const txt = [val("profession"), val("field"), val("productType"), val("customProduct"), val("centralQuestion")].join(" ").toLowerCase();
  const agents = [
    {rol:"Agente coordinador senior-premium", funcion:"Integra objetivo, contexto, naturaleza del informe, anexos y formato de salida."},
    {rol:"Auditor anti-alucinación", funcion:"Impide invención de datos, autores, evidencia, diagnósticos, leyes o normas."},
    {rol:"Revisor de evidencia y límites", funcion:"Distingue datos aportados, inferencias, supuestos y vacíos de información."},
    {rol:"Editor de informe profesional", funcion:"Convierte la respuesta en un informe claro, contextualizado y exportable según la naturaleza declarada."}
  ];
  if(txt.match(/salud|clínic|médic|oftal|optom|psicol|terap/)) agents.push({rol:"Par profesional clínico/sanitario", funcion:"Analiza desde el campo de salud sin reemplazar valoración directa."});
  if(txt.match(/educ|docent|curso|pedagog|aprend|enseñ/)) agents.push({rol:"Especialista pedagógico y curricular", funcion:"Ajusta la respuesta a procesos formativos, curriculares y didácticos."});
  if(txt.match(/invest|artículo|tesis|metod|epistemol|bibliograf/)) agents.push({rol:"Metodólogo de investigación académica", funcion:"Evalúa coherencia metodológica, fuentes, trazabilidad y rigor bibliográfico."});
  if(txt.match(/derecho|legal|sentencia|abog|norma|ley|decreto/)) agents.push({rol:"Analista jurídico orientativo", funcion:"Organiza argumentos jurídicos sin inventar normas ni jurisprudencia."});
  if(txt.match(/app|web|html|software|interfaz|ux|ui|producto digital/)) agents.push({rol:"Arquitecto de producto digital"   , funcion:"Traduce la necesidad a estructura técnica, requerimientos y UX."},{rol:"Desarrollador senior UX/UI", funcion:"Propone implementación verificable, pantallas y flujos usables."});
  return agents;
}

// ─── ANÁLISIS PREVIO DEL CASO (adaptado por naturaleza) ────────────
function generateCaseAnalysis(question, docTypes, productType, nature){
  const q = question || "la necesidad planteada";
  const docs = docTypes || "los insumos que el usuario aporte a la IA externa";
  const type = productType || "un producto profesional";
  const nat = nature || "";

  let contextualNote = "";
  if(nat.includes("Académico") || nat.includes("Investigaci")){
    contextualNote = " El análisis debe respetar los estándares del rigor académico: citar autores reales y verificables en formato APA, diferenciar entre conocimiento consolidado, debates abiertos y vacíos bibliográficos, y evitar cualquier referencia inventada.";
  } else if(nat.includes("Clínico")){
    contextualNote = " El análisis clínico debe distinguir con precisión los datos aportados por el profesional, las inferencias orientativas razonables y los límites que solo podrían resolverse con valoración presencial directa. Ninguna conclusión debe presentarse como diagnóstico definitivo.";
  } else if(nat.includes("Evaluativo")){
    contextualNote = " El análisis evaluativo debe contextualizar los resultados dentro de los parámetros del instrumento utilizado, señalar los límites de la interpretación de pruebas y evitar extrapolaciones más allá de lo que la evidencia aportada permite sustentar.";
  } else if(nat.includes("Jurídico")){
    contextualNote = " El análisis jurídico debe identificar las normas, leyes o artículos pertinentes al caso sin inventar jurisprudencia. Toda referencia normativa debe ser real; si hay incertidumbre, debe señalarse explícitamente como orientativa.";
  } else if(nat.includes("Técnico")){
    contextualNote = " El análisis técnico debe ser preciso en terminología, verificable en sus afirmaciones y contextualizado a los estándares aplicables al campo. Las conclusiones deben ser operativas y no especulativas.";
  } else if(nat.includes("Desarrollo app")){
    contextualNote = " El análisis de producto digital debe traducir la necesidad del usuario a requerimientos funcionales y no funcionales, proponer una arquitectura viable y detallar los flujos y pantallas clave sin salirse del alcance declarado.";
  } else if(nat.includes("Formativo")){
    contextualNote = " El análisis formativo debe articular objetivos de aprendizaje medibles, justificar las estrategias didácticas propuestas desde referentes pedagógicos reales y organizar los contenidos en una secuencia progresiva.";
  }

  return `El caso debe abordarse como una consulta profesional situada, no como una petición genérica. La pregunta central —${q}— exige que la respuesta relacione el objetivo declarado con los insumos disponibles, especialmente ${docs}. El análisis debe diferenciar con claridad lo que proviene de la información aportada, lo que corresponde a una inferencia razonable y aquello que permanece como límite por falta de evidencia suficiente. El producto esperado, definido como ${type}, debe organizar la respuesta en una estructura útil para la toma de decisiones, evitando conclusiones absolutas, autores inventados, diagnósticos no sustentados o recomendaciones desconectadas del contexto.${contextualNote}`;
}

// ─── PARSER DE CAMPOS DECLARADOS (v0.3.5) ─────────────────────────
// Campos reservados que no pueden ser sobreescritos ni duplicados
const RESERVED_FIELDS = new Set([
  "titulo","etiquetas_sugeridas","resumen_ejecutivo","analisis_del_caso",
  "informacion_aportada","inferencias_razonables","limites_y_advertencias",
  "recomendaciones","informe_final","marco_conceptual","referencias_bibliograficas",
  "problema_y_pregunta","enfoque_metodologico","tecnicas_e_instrumentos",
  "hallazgos_clinicos","correlaciones_orientativas","seguimiento_sugerido",
  "instrumentos_y_fuentes","interpretacion_resultados","limites_interpretativos",
  "normas_aplicables","analisis_juridico_orientativo","advertencia_legal",
  "especificaciones_tecnicas","conclusiones_tecnicas","requerimientos_funcionales",
  "requerimientos_no_funcionales","arquitectura_sugerida","pantallas_o_flujos_clave",
  "objetivos_de_aprendizaje","estructura_del_curso_o_guia","estrategias_didacticas",
  "evaluacion_propuesta"
]);

/**
 * Normaliza texto libre a claves JSON válidas en snake_case.
 * "Análisis Clínico, Plan de Transición" → ["analisis_clinico","plan_de_transicion"]
 * Reglas: minúsculas, sin tildes, espacios/guiones → _, no-alfanumérico eliminado,
 *         máx 40 chars/clave, máx 10 claves, deduplicado, sin colisión con reservados.
 * Retorna { keys: string[], collisions: string[], truncated: boolean }
 */
function parseCustomKeys(text){
  if(!text || !text.trim()) return { keys:[], collisions:[], truncated:false };

  const normalize = (s) => s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")   // quitar tildes
    .replace(/[\s\-–—\/\\]+/g,"_")                      // espacios y guiones → _
    .replace(/[^\w]/g,"")                               // eliminar no-alfanumérico
    .replace(/_+/g,"_")                                 // colapsar guiones dobles
    .replace(/^_|_$/g,"")                               // limpiar extremos
    .slice(0,40);                                       // máximo 40 chars

  const raw = text.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);
  const truncated = raw.length > 10;
  const collisions = [];
  const seen = new Set();
  const keys = [];

  raw.slice(0,10).forEach(item => {
    const k = normalize(item);
    if(!k) return;
    if(RESERVED_FIELDS.has(k)){
      collisions.push(`"${item}" → ${k} (reservado)`);
      return;
    }
    if(seen.has(k)) return;
    seen.add(k);
    keys.push(k);
  });

  return { keys, collisions, truncated };
}

/**
 * Genera una descripción orientativa automática para una clave declarada.
 * Usa heurística simple basada en palabras clave en el nombre del campo.
 */
function describeCustomKey(key){
  const k = key.toLowerCase();
  if(k.includes("seguimiento"))  return "Descripción del plan de seguimiento, responsables y periodicidad.";
  if(k.includes("plan"))         return "Descripción del plan de acción propuesto con pasos y responsables.";
  if(k.includes("acuerd"))       return "Acuerdos alcanzados o recomendados entre las partes involucradas.";
  if(k.includes("transicion"))   return "Estrategia y condiciones para la transición propuesta.";
  if(k.includes("diagn"))        return "Análisis diagnóstico orientativo basado en la información aportada.";
  if(k.includes("intervencion")) return "Descripción de la intervención propuesta con justificación.";
  if(k.includes("evaluacion") || k.includes("valoracion")) return "Evaluación o valoración de los aspectos indicados.";
  if(k.includes("objetiv"))      return "Objetivos específicos, medibles y contextualizados al caso.";
  if(k.includes("metodolog"))    return "Enfoque metodológico propuesto con justificación.";
  if(k.includes("referencia") || k.includes("bibliograf")) return "Referencias bibliográficas reales y verificables en formato APA.";
  if(k.includes("conclusion"))   return "Conclusiones derivadas del análisis de la información aportada.";
  if(k.includes("recomend"))     return "Recomendaciones operativas y contextualizadas al caso.";
  if(k.includes("riesgo"))       return "Identificación y análisis de riesgos relevantes.";
  if(k.includes("recurso"))      return "Recursos humanos, materiales o institucionales pertinentes.";
  if(k.includes("cronograma") || k.includes("tiempo")) return "Cronograma o estimación temporal de las acciones propuestas.";
  return `Contenido del campo "${key}": desarrolla este apartado con base en la información aportada y el contexto del caso.`;
}

// Actualiza el preview en tiempo real de las claves parseadas (C2)
function updateCustomKeysPreview(){
  const raw = val("customNatureFields");
  const preview = $("customKeysPreview");
  if(!preview) return;

  if(!raw){ preview.innerHTML = ""; preview.style.display="none"; return; }

  const { keys, collisions, truncated } = parseCustomKeys(raw);
  let html = "";

  if(keys.length){
    html += `<div class="keys-ok"><strong>Campos que irán al prompt (${keys.length}):</strong><div class="keys-chips">${
      keys.map(k=>`<span class="key-chip"><code>${k}</code></span>`).join("")
    }</div></div>`;
  }
  if(collisions.length){
    html += `<div class="keys-warn"><strong>Ignorados por colisión con campos base:</strong><ul>${
      collisions.map(c=>`<li>${c}</li>`).join("")
    }</ul></div>`;
  }
  if(truncated){
    html += `<div class="keys-warn">Solo se usarán los primeros 10 campos declarados.</div>`;
  }
  if(!keys.length && !collisions.length){
    html += `<div class="keys-warn">No se pudo normalizar ningún campo válido. Verifica que uses texto separado por comas.</div>`;
  }

  preview.innerHTML = html;
  preview.style.display = "block";
}

// ─── FORMATO DE RESPUESTA DINÁMICO POR NATURALEZA (FIX C1) ────────
function getFormatoByNature(nature){
  const base = {
    titulo: "título corto y reconocible del informe",
    etiquetas_sugeridas: ["etiqueta1","etiqueta2"],
    resumen_ejecutivo: "síntesis clara y contextualizada (2-4 oraciones)",
    analisis_del_caso: "párrafo sólido que relacione pregunta, evidencia aportada, anexos y límites",
    informacion_aportada: ["dato o insumo aportado explícitamente por el usuario"],
    inferencias_razonables: ["inferencia con base en los datos aportados, señalada como inferencia"],
    limites_y_advertencias: ["límite profesional, epistémico o de evidencia"],
    recomendaciones: ["recomendación operativa y contextualizada"],
    informe_final: "texto final listo para exportar, con subtítulos claros y lenguaje profesional"
  };

  if(nature.includes("Académico") || nature.includes("Investigaci")){
    base.marco_conceptual = "síntesis de los referentes teóricos o epistemológicos centrales, con autores y años en texto";
    base.referencias_bibliograficas = ["Apellido, I. (año). Título del trabajo. Editorial/Revista. doi o URL si aplica"];
    base.informe_final = "texto académico con citas en formato APA dentro del texto (Apellido, año), párrafos argumentativos consolidados y lista de referencias al final. Sin autores inventados.";
    if(nature.includes("Investigaci")){
      base.problema_y_pregunta = "formulación clara del problema y la pregunta de investigación";
      base.enfoque_metodologico = "paradigma, enfoque y tipo de investigación justificados desde la literatura";
      base.tecnicas_e_instrumentos = ["técnica o instrumento con justificación metodológica"];
    }
  }

  if(nature.includes("Clínico")){
    base.hallazgos_clinicos = ["hallazgo relevante con especificación de la fuente (examen, historia, reporte)"];
    base.correlaciones_orientativas = "posibles relaciones entre hallazgos, presentadas con cautela interpretativa explícita";
    base.seguimiento_sugerido = ["recomendación de seguimiento o derivación pertinente"];
    delete base.informe_final;
    base.informe_final = "concepto orientativo clínico estructurado en: datos aportados, análisis, inferencias, límites y recomendaciones. Aclarar que no reemplaza valoración presencial.";
  }

  if(nature.includes("Evaluativo")){
    base.instrumentos_y_fuentes = ["nombre del instrumento, versión y fuente bibliográfica si aplica"];
    base.interpretacion_resultados = "análisis interpretativo con referencia a baremos, normas o criterios del instrumento";
    base.limites_interpretativos = ["límite del instrumento, de la muestra o de los datos disponibles"];
    delete base.informe_final;
    base.informe_final = "informe evaluativo con secciones: hallazgos, interpretación, límites y recomendaciones. Ninguna conclusión definitiva sin sustento en los datos aportados.";
  }

  if(nature.includes("Jurídico")){
    base.normas_aplicables = ["ley, decreto, artículo o norma pertinente (real y verificable)"];
    base.analisis_juridico_orientativo = "lectura del caso desde la norma, señalando aplicabilidad y posibles interpretaciones sin inventar jurisprudencia";
    base.advertencia_legal = "este análisis es de carácter orientativo y no reemplaza concepto jurídico formal emitido por abogado habilitado";
    delete base.informe_final;
    base.informe_final = "concepto jurídico orientativo con normas reales identificadas, análisis contextualizado y advertencia explícita de carácter no vinculante.";
  }

  if(nature.includes("Técnico") && !nature.includes("Desarrollo")){
    base.especificaciones_tecnicas = ["especificación, norma técnica o estándar aplicable al caso"];
    base.conclusiones_tecnicas = "análisis desde la norma técnica o el estándar aplicable, con lenguaje preciso";
    delete base.informe_final;
    base.informe_final = "informe técnico con secciones claras, terminología precisa y conclusiones verificables.";
  }

  if(nature.includes("Desarrollo app")){
    base.requerimientos_funcionales = ["requerimiento funcional priorizado"];
    base.requerimientos_no_funcionales = ["requerimiento no funcional: rendimiento, accesibilidad, seguridad"];
    base.arquitectura_sugerida = "estructura general de la solución: stack, módulos principales, flujo de datos";
    base.pantallas_o_flujos_clave = ["descripción de pantalla o flujo con lógica de uso"];
    delete base.informe_final;
    base.informe_final = "documento de producto con requerimientos priorizados, flujos de pantalla, arquitectura propuesta e indicaciones de implementación.";
  }

  if(nature.includes("Formativo")){
    base.objetivos_de_aprendizaje = ["objetivo medible y contextualizado (verbo observable + contenido + contexto)"];
    base.estructura_del_curso_o_guia = ["módulo, unidad o sesión con descripción y duración estimada"];
    base.estrategias_didacticas = ["estrategia con justificación pedagógica desde la literatura"];
    base.evaluacion_propuesta = "tipo de evaluación, criterios e instrumentos pertinentes";
    delete base.informe_final;
    base.informe_final = "guía formativa o estructura de curso con objetivos, contenidos, estrategias y evaluación articulados.";
  }

  // ── Otro / personalizado — campos explícitamente declarados (v0.3.5) ──
  if(nature.includes("Otro") || nature.includes("personalizado")){
    const customKeysRaw = typeof window !== "undefined" ? val("customNatureFields") : "";
    const declared = customKeysRaw ? parseCustomKeys(customKeysRaw).keys : [];
    if(declared.length){
      declared.forEach(k => { base[k] = describeCustomKey(k); });
    } else {
      base.contenido_principal = "Desarrolla el contenido principal del informe según la naturaleza personalizada declarada.";
      base.conclusiones = "Conclusiones derivadas del análisis de la información aportada.";
    }
  }

  return base;
}

// ─── GENERACIÓN DE PROMPT ──────────────────────────────────────────
function generatePrompt(){
  saveProfile();
  const nature = val("reportNature");
  const custom = val("productType")==="Otro personalizado" ? val("customProduct") : "";
  const customNatureDesc = val("customNatureDesc");
  const customNatureStructure = val("customNatureStructure");
  const customNatureFieldsRaw = val("customNatureFields");
  const parsedCustomKeys = customNatureFieldsRaw ? parseCustomKeys(customNatureFieldsRaw) : { keys:[], collisions:[], truncated:false };

  state.draft = {
    title: val("caseTitle")||"Consulta profesional sin título",
    question: val("centralQuestion"),
    productType: val("productType"),
    customProduct: custom,
    willAttach: $("willAttach").checked,
    docTypes: val("docTypes"),
    responseStyle: val("responseStyle"),
    labels: generateLabels(),
    reportNature: nature,
    customNatureDesc,
    customNatureStructure,
    customNatureFields: customNatureFieldsRaw,       // raw para restaurar en formulario
    customNatureFieldsParsed: parsedCustomKeys.keys  // claves normalizadas para el validador
  };

  // Instrucciones explícitas de naturaleza personalizada (FIX A4)
  const customNatureInstructions = (nature === "Otro / personalizado" && (customNatureDesc || customNatureStructure))
    ? {
        descripcion_naturaleza_personalizada: customNatureDesc || "No especificada",
        estructura_esperada_personalizada: customNatureStructure || "No especificada",
        instruccion: "Adapta la estructura y el tono del informe a la naturaleza personalizada descrita arriba. Prioriza la lógica declarada por el usuario sobre los esquemas genéricos."
      }
    : null;

  // Instrucción explícita sobre campos declarados (C3 auditoría v0.3.5)
  const camposDeclaradosInstruction = parsedCustomKeys.keys.length > 0
    ? {
        campos_requeridos_declarados_por_usuario: parsedCustomKeys.keys,
        instruccion_campos_declarados: [
          `El usuario ha declarado explícitamente los siguientes campos como REQUERIDOS en la respuesta: ${parsedCustomKeys.keys.join(", ")}.`,
          "DEBES incluir todos estos campos en el JSON de respuesta, exactamente con las claves indicadas (en snake_case).",
          "No omitas ninguno de los campos declarados aunque no tengas información completa: en ese caso, describe el límite o la información faltante dentro del campo.",
          "No añadas campos adicionales fuera del contrato declarado, excepto los campos base obligatorios."
        ]
      }
    : null;

  const instruccionNaturaleza = `Naturaleza del informe: ${nature}. Adapta el tono, estructura, campos y nivel de rigor de toda la respuesta a este tipo de informe. No entregues la misma estructura genérica independiente del tipo.`;

  const prompt = {
    rizoma_promptlab_version: APP_VERSION,
    tipo: "PROMPT_PREMIUM_PROFESIONAL_JSON",
    modo: "EQUIPO_SENIOR_PREMIUM_CON_EVIDENCIA_Y_ANTI_ALUCINACION",
    instruccion_principal: `Actúa como un equipo senior-premium de agentes expertos. Responde EXCLUSIVAMENTE con el objeto JSON válido y cerrado. PROHIBIDO incluir texto, explicaciones, comentarios o referencias fuera del JSON. PROHIBIDO usar bloques de código Markdown (sin backticks). El JSON debe comenzar con { y terminar con } sin ningún carácter antes ni después. Todas las referencias bibliográficas deben ir DENTRO del campo "referencias_bibliograficas" como array de strings, no fuera del JSON. ${instruccionNaturaleza}`,
    perfil_profesional_usuario: state.profile,
    consulta: state.draft,
    naturaleza_del_informe: {
      tipo: nature,
      instruccion_especifica: instruccionNaturaleza,
      ...(customNatureInstructions || {}),
      ...(camposDeclaradosInstruction || {})
    },
    analisis_previo_del_caso: generateCaseAnalysis(state.draft.question, state.draft.docTypes, state.draft.productType+(custom?" / "+custom:""), nature),
    equipo_agentes_activado: chooseAgents(),
    reglas_no_negociables: [
      "No inventar autores, referencias, datos, diagnósticos, leyes, normas, citas, cifras ni hallazgos no suministrados.",
      "Contextualizar toda respuesta al caso, la pregunta, el perfil profesional, los anexos, la naturaleza del informe y el formato solicitado.",
      "Basar el análisis en evidencia aportada por el usuario; si se usan conocimientos generales, señalarlos como marco general y no como dato del caso.",
      "Distinguir explícitamente: información aportada, inferencias razonables, supuestos, límites y recomendaciones.",
      "No sustituir juicio profesional, valoración clínica presencial, dictamen legal, diagnóstico médico ni decisión técnica responsable.",
      "Si el usuario menciona documentos adjuntos, analizarlos y referenciarlos como insumo aportado; si no están disponibles, pedirlos o declarar la limitación.",
      "Si se mencionan autores o referentes, usar solo autores reales y verificables; si no hay certeza, no citarlos.",
      `Para informes de naturaleza '${nature}': respetar los campos específicos del formato de respuesta obligatorio que corresponden a este tipo.`,
      "FORMATO DE ENTREGA OBLIGATORIO: el JSON debe ser el único contenido de la respuesta. Comienza con { y termina con }. Sin texto previo, sin texto posterior, sin bloques ```json```, sin referencias Markdown externas tipo [N]: URL. Toda referencia bibliográfica va dentro del campo referencias_bibliograficas como array de strings.",
      ...(parsedCustomKeys.keys.length > 0
        ? [`OBLIGATORIO: Incluir en el JSON los campos declarados por el usuario: ${parsedCustomKeys.keys.join(", ")}. Usar exactamente esas claves snake_case.`]
        : [])
    ],
    protocolo_anti_alucinacion: {
      verificacion_1: "¿La respuesta usa únicamente datos aportados o conocimientos generales claramente marcados?",
      verificacion_2: "¿Evita inventar fuentes, autores, diagnósticos, leyes o conclusiones?",
      verificacion_3: "¿Reconoce límites, vacíos y condiciones de uso profesional?",
      verificacion_4: "¿Religa la respuesta con pregunta, anexos, naturaleza del informe y producto solicitado?",
      ...(parsedCustomKeys.keys.length > 0
        ? { verificacion_5: `¿Incluye todos los campos declarados por el usuario (${parsedCustomKeys.keys.join(", ")}) en el JSON de respuesta?` }
        : {})
    },
    formato_respuesta_obligatorio: getFormatoByNature(nature)
  };

  state.currentPrompt = prompt;
  $("promptOutput").textContent = JSON.stringify(prompt,null,2);
  saveState();
  toast("Prompt premium adaptado generado ✓");
}

async function copyPrompt(){
  if(!state.currentPrompt){ toast("Primero genera un prompt"); return; }
  try{ await navigator.clipboard.writeText(JSON.stringify(state.currentPrompt,null,2)); toast("Prompt copiado"); }
  catch(e){ toast("No se pudo copiar automáticamente"); }
}

// ─── HUB IA ────────────────────────────────────────────────────────
function renderAIHub(){
  const box = $("aiHub"); if(!box) return;
  box.innerHTML = "";
  aiLinks.forEach(([name,url])=>{
    const a = document.createElement("a");
    a.className = "ai-link";
    a.href = url;
    a.target = "_blank";
    a.textContent = name;
    a.onclick = (ev)=>handleAIClick(ev, url);
    box.appendChild(a);
  });
}
function handleAIClick(ev, url){
  if($("willAttach")?.checked){
    ev.preventDefault();
    pendingAILink = url;
    $("attachModal").classList.add("open");
  }
}
function closeAttachModal(){
  $("attachModal").classList.remove("open");
  if(pendingAILink){ window.open(pendingAILink, "_blank"); pendingAILink = ""; }
}

// ─── EXTRACCIÓN DE JSON CONTAMINADO ───────────────────────────────
/**
 * Intenta extraer un objeto JSON válido de una cadena que puede contener
 * texto residual antes o después (referencias Markdown, notas, citas, etc.)
 * Retorna: { parsed, cleaned, trailingRefs, wasContaminated }
 */
function extractCleanJSON(raw){
  // 1. Intento directo
  try{
    return { parsed: JSON.parse(raw), cleaned: raw, trailingRefs: [], wasContaminated: false };
  } catch(e1){}

  // 2. Extraer bloque JSON entre primer { y último }
  const firstBrace = raw.indexOf("{");
  const lastBrace  = raw.lastIndexOf("}");
  if(firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace){
    return null; // No hay ningún bloque JSON
  }

  const jsonCandidate = raw.slice(firstBrace, lastBrace + 1);
  const trailingText  = raw.slice(lastBrace + 1).trim();

  try{
    const parsed = JSON.parse(jsonCandidate);

    // 3. Extraer referencias Markdown sueltas del texto residual
    //    Patrón: [N]: URL "Título opcional"  ó  [N]: URL
    const refPattern = /\[\d+\]:\s*(https?:\/\/\S+)(?:\s+"([^"]+)")?/g;
    const trailingRefs = [];
    let m;
    while((m = refPattern.exec(trailingText)) !== null){
      const url   = m[1].trim();
      const title = m[2] ? m[2].trim() : url;
      trailingRefs.push(`${title} — ${url}`);
    }

    // También extraer citas inline tipo ([Texto][N]) del JSON para limpiarlas
    // (no las eliminamos del informe, solo las registramos)

    return { parsed, cleaned: jsonCandidate, trailingRefs, wasContaminated: trailingText.length > 0 };
  } catch(e2){
    return null;
  }
}

// ─── VALIDACIÓN SEMÁNTICA (expandida — FIX A1 + contaminación) ────
function validateResponse(){
  const raw = val("aiResponse");
  if(!raw){ toast("Pega una respuesta primero"); return; }
  const semantic = $("semanticValidation");
  semantic.innerHTML = "";
  semantic.className = "semantic-box";

  const extraction = extractCleanJSON(raw);

  if(extraction){
    const { parsed, trailingRefs, wasContaminated } = extraction;

    // Integrar referencias sueltas al campo referencias_bibliograficas si existían fuera del JSON
    if(trailingRefs.length > 0){
      if(!parsed.referencias_bibliograficas) parsed.referencias_bibliograficas = [];
      trailingRefs.forEach(ref => {
        if(!parsed.referencias_bibliograficas.includes(ref)){
          parsed.referencias_bibliograficas.push(ref);
        }
      });
    }

    state.currentResponse = parsed;
    $("aiResponse").classList.remove("status-bad");
    $("aiResponse").classList.add("status-ok");

    let statusMsg = "Respuesta JSON válida. Puedes generar el informe.";
    if(wasContaminated){
      statusMsg = `JSON recuperado correctamente. Se detectó texto residual externo (${trailingRefs.length > 0 ? trailingRefs.length + " referencia(s) recuperada(s) e integrada(s)" : "texto no estructurado ignorado"}). Recomendable pedir a la IA JSON puro la próxima vez.`;
    }
    $("validationMsg").textContent = statusMsg;

    const warnings = [];
    const nature = state.draft?.reportNature || "";
    const resp = state.currentResponse;
    const rawLow = raw.toLowerCase();

    // ── Campos base requeridos en CUALQUIER naturaleza ──
    if(!resp.resumen_ejecutivo)      warnings.push("Falta resumen_ejecutivo en el JSON.");
    if(!resp.limites_y_advertencias) warnings.push("Falta limites_y_advertencias en el JSON.");
    if(!resp.recomendaciones)        warnings.push("Falta recomendaciones en el JSON.");
    if(!resp.informe_final)          warnings.push("Falta informe_final en el JSON.");

    // ── Académico / Investigación ──
    if(nature.includes("Académico") || nature.includes("Investigaci")){
      if(!resp.referencias_bibliograficas)
        warnings.push("Informe académico/investigación requiere el campo referencias_bibliograficas.");
      const hasYear = rawLow.match(/\(\d{4}\)/) || rawLow.match(/,\s*\d{4}[,\.]/);
      if(!hasYear)
        warnings.push("No se detectaron referencias con año (formato APA). Verifica que las citas incluyan (Autor, año).");
      if(nature.includes("Investigaci") && !resp.enfoque_metodologico && !rawLow.includes("metodolog"))
        warnings.push("Informe de investigación requiere especificar enfoque metodológico.");
    }

    // ── Clínico ──
    if(nature.includes("Clínico")){
      if(!rawLow.includes("limit") && !rawLow.includes("adverten"))
        warnings.push("No se detectaron límites clínicos en la respuesta.");
      if(!rawLow.includes("reemplaza") && !rawLow.includes("presencial") && !rawLow.includes("valoración"))
        warnings.push("El informe clínico debe aclarar que no reemplaza valoración profesional presencial.");
    }

    // ── Evaluativo / interpretación de pruebas ──
    if(nature.includes("Evaluativo")){
      if(!resp.interpretacion_resultados && !resp.analisis_del_caso)
        warnings.push("Falta interpretacion_resultados o analisis_del_caso para informe evaluativo.");
      if(!rawLow.includes("limit") && !rawLow.includes("adverten"))
        warnings.push("No se detectaron límites o advertencias interpretativas.");
      if(!rawLow.includes("instrumento") && !rawLow.includes("prueba") && !rawLow.includes("escala"))
        warnings.push("No se identificaron referencias al instrumento o prueba utilizada.");
    }

    // ── Jurídico ──
    if(nature.includes("Jurídico")){
      const tieneNorma = resp.normas_aplicables || rawLow.match(/ley\s+\d+|decreto\s+\d+|artículo\s+\d+|resolución\s+\d+/);
      if(!tieneNorma)
        warnings.push("No se detectaron referencias a normas, leyes o artículos jurídicos.");
      if(!rawLow.includes("orientativ") && !rawLow.includes("no reemplaza"))
        warnings.push("El informe jurídico debe señalar explícitamente que es orientativo y no reemplaza concepto jurídico formal.");
    }

    // ── Técnico ──
    if(nature.includes("Técnico") && !nature.includes("Desarrollo")){
      if(!resp.conclusiones_tecnicas && !resp.especificaciones_tecnicas && !resp.analisis_del_caso)
        warnings.push("Falta estructura técnica: conclusiones_tecnicas o especificaciones_tecnicas.");
    }

    // ── Desarrollo app/web ──
    if(nature.includes("Desarrollo app")){
      if(!resp.requerimientos_funcionales && !resp.requerimientos && !resp.arquitectura_sugerida)
        warnings.push("Falta estructura de producto digital: requerimientos_funcionales o arquitectura_sugerida.");
      if(!resp.pantallas_o_flujos_clave && !resp.pantallas && !resp.flujos)
        warnings.push("No se detectaron pantallas o flujos clave. Incluye pantallas_o_flujos_clave en el JSON.");
    }

    // ── Formativo ──
    if(nature.includes("Formativo")){
      if(!resp.objetivos_de_aprendizaje && !rawLow.includes("objetivo"))
        warnings.push("No se detectaron objetivos de aprendizaje. Incluye objetivos_de_aprendizaje en el JSON.");
      if(!resp.estructura_del_curso_o_guia && !rawLow.includes("módulo") && !rawLow.includes("unidad"))
        warnings.push("No se detectó estructura de curso o guía (módulos, unidades).");
    }

    // ── Campos declarados por el usuario (v0.3.5) — advertencia diferenciada ──
    const declaredKeys = state.draft?.customNatureFieldsParsed || [];
    const missingDeclared = declaredKeys.filter(k => !(k in resp));
    const presentDeclared = declaredKeys.filter(k => (k in resp));

    // ── Aviso de contaminación recuperada ──
    if(wasContaminated){
      const refNote = trailingRefs.length > 0
        ? `<li>Se encontraron <strong>${trailingRefs.length} referencia(s)</strong> fuera del JSON y se integraron al campo <code>referencias_bibliograficas</code> automáticamente.</li>`
        : "<li>Se detectó texto residual externo al JSON (posiblemente Markdown) que fue descartado sin afectar el contenido.</li>";
      warnings.unshift(`__CONTAMINATION__${refNote}`);
    }

    if(warnings.length || missingDeclared.length || presentDeclared.length){
      const contamNote = warnings.filter(w=>w.startsWith("__CONTAMINATION__")).map(w=>w.replace("__CONTAMINATION__",""));
      const realWarnings = warnings.filter(w=>!w.startsWith("__CONTAMINATION__"));
      let html = "";

      // Bloque de recuperación de contaminación
      if(contamNote.length){
        html += `<div class="semantic-recovered"><strong>⚡ Respuesta recuperada:</strong><ul>${contamNote.join("")}</ul><p class="recovery-tip">Para evitar esto, añade al final de tu prompt: <em>"Devuelve ÚNICAMENTE el JSON cerrado, sin texto antes ni después, sin referencias Markdown externas."</em></p></div>`;
      }

      // Bloque de campos declarados (diferenciado visualmente — A1 auditoría)
      if(declaredKeys.length > 0){
        let declaredHtml = `<div class="declared-check">`;
        declaredHtml += `<strong>Campos declarados por ti (${declaredKeys.length}):</strong><ul>`;
        presentDeclared.forEach(k => {
          declaredHtml += `<li class="dc-ok"><span class="dc-badge dc-ok-b">✓</span> <code>${k}</code> — presente en la respuesta</li>`;
        });
        missingDeclared.forEach(k => {
          declaredHtml += `<li class="dc-miss"><span class="dc-badge dc-miss-b">!</span> <code>${k}</code> — ausente. La IA no incluyó este campo. Puedes regenerar el prompt o aceptar el informe sin él.</li>`;
        });
        declaredHtml += `</ul></div>`;
        html += declaredHtml;
        if(missingDeclared.length) semantic.classList.add("semantic-warn");
      }

      // Advertencias estándar
      if(realWarnings.length){
        html += `<strong>⚠ Validación semántica (${realWarnings.length} observaciones):</strong><ul>${realWarnings.map(x=>"<li>"+x+"</li>").join("")}</ul>`;
        semantic.classList.add("semantic-warn");
      } else if(!contamNote.length && !missingDeclared.length){
        semantic.classList.add("semantic-ok");
      }

      semantic.innerHTML = html;
    } else {
      semantic.classList.add("semantic-ok");
      semantic.innerHTML = "<strong>✓ Validación semántica satisfactoria para informe tipo: " + (nature||"general") + ".</strong>";
    }

    saveState();
    toast(wasContaminated ? "JSON recuperado y limpiado ✓" : "JSON validado ✓");

  } else {
    // No fue posible extraer ningún JSON
    state.currentResponse = {informe_final: raw, nota:"Respuesta no JSON guardada como texto bruto."};
    $("aiResponse").classList.remove("status-ok");
    $("aiResponse").classList.add("status-bad");
    $("validationMsg").textContent = "No se pudo extraer un JSON válido. Se guardará como texto bruto.";
    semantic.classList.add("semantic-warn");
    semantic.innerHTML = `<strong>⚠ Sin JSON recuperable.</strong> El contenido no contiene ningún bloque JSON válido. El informe se guardará como texto bruto.<br><br>
      <strong>Solución:</strong> Pide a la IA que devuelva <em>únicamente</em> el JSON sin texto adicional. Puedes añadir al final del prompt:<br>
      <code style="display:block;margin-top:6px;padding:8px;border-radius:8px;font-size:12px;background:rgba(0,0,0,.08)">"Responde SOLO con el JSON válido. Sin texto antes ni después. Sin referencias Markdown externas."</code>`;
    saveState();
    toast("Respuesta textual registrada");
  }
}

// ─── CONSTRUCCIÓN DE INFORME ───────────────────────────────────────

// Campos base que tienen sección fija en el informe — no se renderizan como "extra"
const BASE_REPORT_FIELDS = new Set([
  "titulo","etiquetas_sugeridas","resumen_ejecutivo","analisis_del_caso",
  "informacion_aportada","inferencias_razonables","limites_y_advertencias",
  "recomendaciones","informe_final","referencias_bibliograficas","nota"
]);

// Convierte snake_case a título legible: "problemas_nucleares_del_paciente" → "Problemas nucleares del paciente"
function humanizeKey(key){
  return String(key||"").replace(/_/g," ").replace(/^\w/, c=>c.toUpperCase());
}

// Renderiza un valor de campo a HTML limpio según su tipo
function renderFieldValue(value, depth){
  depth = depth||0;
  if(value === null || value === undefined) return "";

  if(typeof value === "string"){
    return `<p>${escapeHTML(value).replace(/\n/g,"<br>")}</p>`;
  }

  if(typeof value === "number" || typeof value === "boolean"){
    return `<p>${escapeHTML(String(value))}</p>`;
  }

  if(Array.isArray(value)){
    // Array de objetos → tarjetas individuales
    if(value.length > 0 && typeof value[0] === "object" && value[0] !== null){
      return value.map(item => {
        if(typeof item === "string") return `<li>${escapeHTML(item)}</li>`;
        const entries = Object.entries(item).map(([k,v]) =>
          `<div class="field-subentry"><strong class="field-sublabel">${escapeHTML(humanizeKey(k))}</strong>${renderFieldValue(v, depth+1)}</div>`
        ).join("");
        return `<div class="field-subcard">${entries}</div>`;
      }).join("");
    }
    // Array de strings → lista
    const items = value.filter(x => x !== null && x !== undefined && String(x).trim());
    if(!items.length) return "";
    return `<ul>${items.map(x=>`<li>${escapeHTML(String(x)).replace(/\n/g,"<br>")}</li>`).join("")}</ul>`;
  }

  if(typeof value === "object"){
    // Objeto especial: informe_final con subtitulo+texto
    if(value.subtitulo && value.texto){
      return `<h3 class="subsection-title">${escapeHTML(value.subtitulo)}</h3><p>${escapeHTML(value.texto).replace(/\n/g,"<br>")}</p>`;
    }
    // Objeto con valoracion+justificacion (grado de gravedad)
    if(value.valoracion && value.justificacion){
      return `<p><strong>${escapeHTML(value.valoracion)}</strong> — ${escapeHTML(value.justificacion)}</p>`;
    }
    // Objeto genérico → clave-valor
    const entries = Object.entries(value).map(([k,v]) =>
      `<div class="field-subentry"><strong class="field-sublabel">${escapeHTML(humanizeKey(k))}</strong>${renderFieldValue(v, depth+1)}</div>`
    ).join("");
    return `<div class="field-subcard">${entries}</div>`;
  }

  return "";
}

// Renderiza informe_final correctamente (string u objeto con subtitulo+texto)
function renderInformeFinal(value){
  if(!value) return "";
  if(typeof value === "string") return `<p>${escapeHTML(value).replace(/\n/g,"<br>")}</p>`;
  if(typeof value === "object"){
    if(value.subtitulo && value.texto){
      return `<h3 class="subsection-title">${escapeHTML(value.subtitulo)}</h3><p>${escapeHTML(value.texto).replace(/\n/g,"<br>")}</p>`;
    }
    // Objeto genérico: renderizar cada entrada
    return Object.entries(value).map(([k,v]) =>
      `<div class="field-subentry"><strong class="field-sublabel">${escapeHTML(humanizeKey(k))}</strong>${renderFieldValue(v)}</div>`
    ).join("");
  }
  return "";
}

// Extrae el texto plano de informe_final para el TXT
function extractFinalText(value){
  if(!value) return "";
  if(typeof value === "string") return value;
  if(typeof value === "object"){
    if(value.subtitulo && value.texto) return `${value.subtitulo}\n${value.texto}`;
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// Extrae texto plano de un valor para TXT
function extractPlainText(value){
  if(!value) return "";
  if(typeof value === "string") return value;
  if(Array.isArray(value)){
    return value.map(x => typeof x === "string" ? x : JSON.stringify(x)).join("\n");
  }
  if(typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function asList(value, fallback){
  if(Array.isArray(value)) return value.filter(Boolean);
  if(typeof value === "string" && value.trim()) return value.split(/\n|- /).map(x=>x.trim()).filter(Boolean);
  return fallback ? [fallback] : [];
}

function buildReport(){
  if(!state.currentResponse) validateResponse();
  const p = state.profile||{}, d=state.draft||{}, r=state.currentResponse||{};
  const title = r.titulo || d.title || "Informe profesional";
  const analysis = r.analisis_del_caso || generateCaseAnalysis(d.question, d.docTypes, d.productType, d.reportNature);
  const resumen = r.resumen_ejecutivo || "Informe generado a partir de la pregunta profesional, los insumos declarados y la respuesta devuelta por la IA externa.";
  const finalValue = r.informe_final || r.analisis || "";
  const limites = asList(r.limites_y_advertencias, "La respuesta es apoyo analítico y no reemplaza valoración profesional directa.");
  const recomendaciones = asList(r.recomendaciones, "Revisar coherencia, suficiencia de datos y pertinencia antes de tomar decisiones.");
  const referencias = asList(r.referencias_bibliograficas, "");

  // Campos extra del JSON que no son base (todo lo que la IA devolvió adicional)
  const extraFields = Object.entries(r).filter(([k]) => !BASE_REPORT_FIELDS.has(k));

  // Texto plano para exportación TXT
  let extraTxt = extraFields.map(([k,v]) => `${humanizeKey(k).toUpperCase()}\n${extractPlainText(v)}`).join("\n\n");

  state.currentReportText =
`INFORME PROFESIONAL
${title}

DATOS DEL PROFESIONAL
Nombre: ${p.name||"No registrado"}
Profesión: ${p.profession||"No registrada"}
Área: ${p.field||"No registrada"}
Correo: ${p.email||"No registrado"}
Teléfono: ${p.phone||"No registrado"}

CONSULTA
Título del caso: ${d.title||"Sin título"}
Naturaleza del informe: ${d.reportNature||"No definida"}
Tipo de producto: ${d.productType||"No definido"}${d.customProduct ? "\nFormato personalizado: "+d.customProduct : ""}
Pregunta central:
${d.question||"No registrada"}

INSUMOS O ANEXOS INDICADOS
${d.docTypes||"No se indicaron anexos."}

RESUMEN EJECUTIVO
${resumen}

ANÁLISIS DEL CASO
${analysis}

${extraTxt ? extraTxt+"\n\n" : ""}INFORME FINAL
${extractFinalText(finalValue)}

LÍMITES Y ADVERTENCIAS
- ${limites.join("\n- ")}

RECOMENDACIONES
- ${recomendaciones.join("\n- ")}${referencias.length ? "\n\nREFERENCIAS BIBLIOGRÁFICAS\n"+referencias.map(x=>"• "+x).join("\n") : ""}`;

  state.currentReportHTML = buildReportHTML({title,p,d,resumen,analysis,finalValue,limites,recomendaciones,referencias,extraFields});
  $("reportTitle").textContent = title;
  $("reportOutput").innerHTML = state.currentReportHTML;
  go("report"); saveState();
}

function buildReportHTML({title,p,d,resumen,analysis,finalValue,limites,recomendaciones,referencias,extraFields}){
  const natureBadge = d.reportNature ? `<span class="chip">${escapeHTML(d.reportNature)}</span>` : "";

  // customProduct largo → mostrar como nota, no como chip
  const productChip = `<span class="chip">${escapeHTML(d.productType||"Producto no definido")}</span>`;
  const customNote = d.customProduct
    ? `<p class="custom-format-note"><strong>Formato solicitado:</strong> ${escapeHTML(d.customProduct)}</p>`
    : "";

  // Secciones de campos extra (todo lo que la IA devolvió más allá de los campos base)
  const extraSections = (extraFields||[]).map(([k,v]) => {
    const rendered = renderFieldValue(v);
    if(!rendered) return "";
    return section(humanizeKey(k), rendered);
  }).join("");

  // Informe final renderizado correctamente
  const finalSection = renderInformeFinal(finalValue);

  return `<article class="report-doc">
    <header class="report-head">
      <h1>${escapeHTML(title)}</h1>
      <p>Informe profesional generado con PromptLab Premium · v${APP_VERSION}</p>
    </header>
    <section class="info-grid">
      ${bubble("Profesional", p.name||"No registrado")}
      ${bubble("Profesión", p.profession||"No registrada")}
      ${bubble("Área", p.field||"No registrada")}
      ${bubble("Contacto", `${p.email||"Sin correo"} · ${p.phone||"Sin teléfono"}`)}
    </section>
    ${section("Consulta central", `<p><strong>${escapeHTML(d.title||"Sin título")}</strong></p><p>${escapeHTML(d.question||"No registrada")}</p><div class="chips">${natureBadge}${productChip}</div>${customNote}`)}
    ${section("Insumos y anexos", `<p>${escapeHTML(d.docTypes||"No se indicaron anexos.")}</p>${d.willAttach?'<p><strong>Nota:</strong> el usuario confirmó que entregará anexos a la IA externa.</p>':''}`)}
    ${section("Resumen ejecutivo", `<p>${escapeHTML(resumen)}</p>`)}
    ${section("Análisis del caso", `<p>${escapeHTML(analysis)}</p>`)}
    ${extraSections}
    ${finalSection ? section("Informe final", finalSection) : ""}
    ${section("Límites y advertencias", `<ul>${limites.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>`)}
    ${section("Recomendaciones", `<ul>${recomendaciones.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul>`)}
    ${referencias.length ? `<section class="report-section"><h2>Referencias bibliográficas</h2><div class="reference-box"><ul>${referencias.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul></div></section>` : ""}
  </article>`;
}

function bubble(label,value){ return `<div class="info-bubble"><b>${escapeHTML(label)}</b>${escapeHTML(value)}</div>`; }
function section(title,content){ return `<section class="report-section"><h2>${escapeHTML(title)}</h2>${content}</section>`; }


// ─── COPIA Y EXPORTACIÓN ───────────────────────────────────────────
async function copyReport(){
  try{ await navigator.clipboard.writeText(state.currentReportText); toast("Informe copiado"); }
  catch(e){ toast("No se pudo copiar automáticamente"); }
}

function exportCurrent(kind){
  const title=(state.currentResponse?.titulo||state.draft?.title||"informe").replace(/[^\w\-]+/g,"_");
  const fullHTML = exportableHTML();
  if(kind==="txt") download(title+".txt", state.currentReportText, "text/plain;charset=utf-8");
  if(kind==="html") download(title+".html", fullHTML, "text/html;charset=utf-8");
  if(kind==="doc") download(title+".doc", fullHTML, "application/msword;charset=utf-8");
}

function exportableHTML(){
  // Usa variables de la paleta activa para exportar con el tema del usuario
  const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue("--"+name).trim();
  const bg    = getCSSVar("bg")    || "#F0F7FF";
  const card  = getCSSVar("card")  || "#FFFFFF";
  const text  = getCSSVar("text")  || "#1A2A4A";
  const line  = getCSSVar("line")  || "#C5DFF8";
  const brand = getCSSVar("brand") || "#1CA7EC";
  const brand2= getCSSVar("brand-2")|| "#1F2F98";
  const soft  = getCSSVar("soft")  || "#DFF3FF";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe PromptLab</title><style>
  body{font-family:Arial, sans-serif;background:${bg};color:${text};padding:24px}
  .report-doc{max-width:860px;margin:auto;background:${card};border:1px solid ${line};border-radius:20px;padding:18px}
  .report-head{background:linear-gradient(135deg,${brand},${brand2});color:#fff;padding:18px;border-radius:16px;margin-bottom:14px}.report-head h1{margin:0 0 8px}.report-head p{color:rgba(255,255,255,.86);margin:0}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}.info-bubble{background:${soft};border:1px solid ${line};border-radius:14px;padding:10px}.info-bubble b{display:block;color:${brand2};font-size:12px;margin-bottom:4px}
  .report-section{background:${card};border:1px solid ${line};border-radius:14px;padding:14px;margin:12px 0}.report-section h2{color:${brand2};margin:0 0 8px}.chip{display:inline-block;background:${soft};border:1px solid ${line};border-radius:999px;padding:6px 9px;margin:3px}
  .reference-box{background:${soft};border:1px solid ${line};border-radius:12px;padding:12px;margin-top:8px}
  p,li{line-height:1.5}ul{padding-left:18px}
  </style></head><body>${state.currentReportHTML||"<pre>"+escapeHTML(state.currentReportText)+"</pre>"}</body></html>`;
}

// Exportación de todos los casos con versión correcta (FIX A6)
function exportAllCases(){
  download(`rizoma_promptlab_casos_v${APP_VERSION.replace(/\./g,"_")}.json`, JSON.stringify(state.cases||[],null,2), "application/json;charset=utf-8");
}

function importCases(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const arr=JSON.parse(reader.result);
      if(Array.isArray(arr)){ state.cases=[...arr,...(state.cases||[])]; saveState(); renderCases(); toast("Casos importados"); }
      else toast("JSON sin lista de casos");
    }catch(err){ toast("JSON inválido"); }
  };
  reader.readAsText(file);
}

function download(name, content, type){
  const blob = new Blob([content], {type}); const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

// ─── GUARDAR / ABRIR / ELIMINAR CASOS ─────────────────────────────
function openSaveCaseModal(){
  if(!state.currentReportText){ toast("Primero genera el informe"); return; }
  const suggested = state.currentResponse?.titulo || state.draft?.title || "Caso sin título";
  $("saveCaseName").value = suggested;
  $("saveCaseExtraLabels").value = "";
  $("saveCaseModal").classList.add("open");
}
function closeSaveCaseModal(){ $("saveCaseModal").classList.remove("open"); }

function confirmSaveCurrentCase(){
  if(!state.currentReportText){ toast("Primero genera el informe"); return; }
  const now = new Date().toISOString();
  const id = "case_"+Date.now();
  const extra = val("saveCaseExtraLabels").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  const title = val("saveCaseName") || state.currentResponse?.titulo || state.draft?.title || "Caso sin título";
  const labels = [...new Set([...(state.draft?.labels||[]), ...extra])];
  const item = {id, createdAt:now, title, labels, profile:state.profile, draft:state.draft, prompt:state.currentPrompt, response:state.currentResponse, reportText:state.currentReportText, reportHTML:state.currentReportHTML};
  state.cases.unshift(item);
  saveState();
  renderCases();
  closeSaveCaseModal();
  toast("✅ Caso guardado correctamente");
  const head = document.querySelector(".report-head");
  if(head && !head.querySelector(".saved-badge")){
    const badge = document.createElement("div");
    badge.className = "saved-badge";
    badge.textContent = "✓ Caso guardado";
    head.appendChild(badge);
  }
}

function renderCases(){
  const box=$("caseList"); if(!box) return;
  box.innerHTML = "";
  if(!state.cases?.length){ box.innerHTML='<div class="card"><p>No hay casos guardados todavía.</p></div>'; return; }
  state.cases.forEach(c=>{
    const el=document.createElement("div"); el.className="case-item";
    el.innerHTML=`<h3>${escapeHTML(c.title)}</h3><div class="case-meta">${new Date(c.createdAt).toLocaleString()} · ${(c.labels||[]).join(", ")}</div><div class="chips">${(c.labels||[]).map(l=>`<span class="chip">${escapeHTML(l)}</span>`).join("")}</div><div class="actions"><button class="btn secondary" onclick="openCase('${c.id}')">Abrir</button><button class="btn ghost" onclick="deleteCase('${c.id}')">Eliminar</button></div>`;
    box.appendChild(el);
  });
}

// Restaura campos del formulario al abrir un caso (FIX C3)
function restoreDraftToForm(d){
  if(!d) return;
  setVal("caseTitle", d.title);
  setVal("centralQuestion", d.question);
  // Selects
  const selProd = $("productType");
  if(selProd && d.productType){
    const opt = [...selProd.options].find(o=>o.value===d.productType);
    if(opt) selProd.value = d.productType;
  }
  const selNat = $("reportNature");
  if(selNat && d.reportNature){
    const opt = [...selNat.options].find(o=>o.value===d.reportNature);
    if(opt) selNat.value = d.reportNature;
  }
  setVal("customProduct", d.customProduct);
  setVal("customNatureDesc", d.customNatureDesc);
  setVal("customNatureStructure", d.customNatureStructure);
  setVal("customNatureFields", d.customNatureFields);  // v0.3.5
  setVal("docTypes", d.docTypes);
  setVal("responseStyle", d.responseStyle);
  setVal("manualLabels", (d.labels||[]).join(", "));
  if($("willAttach")) $("willAttach").checked = d.willAttach||false;
  toggleCustomProduct();
  toggleCustomNature();
}

function openCase(id){
  const c=state.cases.find(x=>x.id===id); if(!c) return;
  state.profile=c.profile||{};
  state.draft=c.draft||{};
  state.currentPrompt=c.prompt;
  state.currentResponse=c.response;
  state.currentReportText=c.reportText||c.report||"";
  state.currentReportHTML=c.reportHTML||`<article class="report-doc"><pre>${escapeHTML(state.currentReportText)}</pre></article>`;
  fillProfile();
  restoreDraftToForm(state.draft);  // ← FIX C3
  $("reportTitle").textContent=c.title;
  $("reportOutput").innerHTML=state.currentReportHTML;
  go("report");
}

function deleteCase(id){
  if(confirm("¿Eliminar este caso guardado?")){
    state.cases=state.cases.filter(x=>x.id!==id);
    saveState(); renderCases(); toast("Caso eliminado");
  }
}

// ─── CONTROLES DE FLUJO ────────────────────────────────────────────
function resetFlow(){ state.history=["home"]; go("profile"); toast("Flujo desbloqueado"); }
function logout(){
  if(confirm("¿Limpiar datos de pantalla sin borrar casos guardados?")){
    state.profile={}; state.draft={}; state.currentPrompt=null; state.currentResponse=null;
    state.currentReportText=""; state.currentReportHTML="";
    saveState(); fillProfile(); go("home");
  }
}

// ─── PALETAS ───────────────────────────────────────────────────────
function applyPalette(name){
  const p=palettes[name]||palettes["Serena Azul"];
  Object.entries(p).forEach(([k,v])=>document.documentElement.style.setProperty("--"+k,v));
  localStorage.setItem(PALETTE_KEY,name);
}
function renderPalettes(){
  const grid=$("paletteGrid"); grid.innerHTML="";
  Object.keys(palettes).forEach(name=>{
    const b=document.createElement("button"); b.className="menu-item"; b.textContent="🎨 "+name;
    b.onclick=()=>{applyPalette(name);toast("Paleta aplicada: "+name)};
    grid.appendChild(b);
  });
}

// ─── MICRÓFONO MÚLTIPLE (FIX C2 + FIX A3) ────────────────────────
function toggleMicForField(fieldId, btn){
  // Si está grabando en OTRO campo: detener limpiamente y luego iniciar en el nuevo
  if(isRecording && activeMicField !== fieldId){
    stopMic();
    activeMicField = fieldId;
    activeMicButton = btn || null;
    // Pequeño retraso para que recognition se detenga completamente antes de reiniciar
    setTimeout(()=>startMic(), 180);
    return;
  }
  // Si está grabando en el MISMO campo: detener
  if(isRecording && activeMicField === fieldId){
    stopMic();
    return;
  }
  // Si no está grabando: iniciar en el campo dado
  activeMicField = fieldId;
  activeMicButton = btn || null;
  startMic();
}

function toggleMic(){
  // Llamado desde el botón principal del campo centralQuestion
  toggleMicForField("centralQuestion", $("micBtn"));
}

function setupRecognition(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ $("micHint").textContent = "Micrófono no disponible en este navegador. Prueba Chrome o Edge."; toast("Reconocimiento de voz no disponible"); return false; }
  if(!recognition){
    recognition = new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event)=>{
      const chunks = [];
      for(let i=event.resultIndex; i<event.results.length; i++){
        if(event.results[i].isFinal){
          const clean = normalizeMicText(event.results[i][0].transcript);
          if(clean && clean !== lastMicChunk && !micFinalBuffer.has(clean)){
            chunks.push(clean);
            micFinalBuffer.add(clean);
            lastMicChunk = clean;
          }
        }
      }
      if(chunks.length){
        const current = $(activeMicField)?.value.trim()||"";
        const incoming = chunks.join(" ");
        if($(activeMicField)) $(activeMicField).value = appendWithoutDuplication(current, incoming);
      }
    };
    recognition.onerror = ()=>{ toast("Error de micrófono"); stopMic(); };
    recognition.onend = ()=>{ if(isRecording){ try{ recognition.start(); }catch(e){} } };
  }
  return true;
}

function startMic(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ toast("Reconocimiento de voz no disponible en este navegador"); return; }
  if(!setupRecognition()) return;
  isRecording = true;
  lastMicChunk = "";
  micFinalBuffer.clear();
  // Actualizar botón principal
  if($("micBtn")) $("micBtn").classList.add("recording");
  // Actualizar botón activo del campo (puede ser distinto del principal)
  if(activeMicButton) activeMicButton.classList.add("recording");
  const hint = $("micHint");
  if(hint) hint.textContent = "Escuchando... toca de nuevo para detener.";
  try{ recognition.start(); }catch(e){}
}

function stopMic(){
  isRecording = false;
  // Limpiar botón principal
  if($("micBtn")) $("micBtn").classList.remove("recording");
  // Limpiar botón activo actual (sea cual sea)
  if(activeMicButton) activeMicButton.classList.remove("recording");
  // Limpiar TODOS los botones mini-mic por seguridad (evita estados visuales huérfanos)
  document.querySelectorAll(".mini-mic.recording").forEach(b=>b.classList.remove("recording"));
  const hint = $("micHint");
  if(hint) hint.textContent = "Micrófono detenido.";
  try{ recognition.stop(); }catch(e){}
}

function normalizeMicText(text){ return String(text||"").replace(/\s+/g," ").trim(); }
function appendWithoutDuplication(current, incoming){
  if(!current) return incoming;
  const c = current.toLowerCase();
  const i = incoming.toLowerCase();
  if(c.endsWith(i) || c.includes(i)) return current;
  const words = incoming.split(" ");
  for(let n=Math.min(words.length,10); n>=3; n--){
    const fragment = words.slice(0,n).join(" ").toLowerCase();
    if(c.endsWith(fragment)){ return current + " " + words.slice(n).join(" "); }
  }
  return current + " " + incoming;
}

function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
window.addEventListener("load", loadState);

// ─── DEMOS ─────────────────────────────────────────────────────────
function loadDemoCase(){
  state.profile = {
    name:"Dra. Laura Méndez",
    profession:"Oftalmóloga",
    email:"laura.mendez@visionintegral.com",
    phone:"+57 3000000000",
    field:"Oftalmología clínica y diagnóstica",
    aiUse:"Interpretación de pruebas visuales, consolidación de exámenes y elaboración de conceptos orientativos."
  };
  state.draft = {
    title:"Integración diagnóstica de exámenes visuales",
    question:"¿Cuáles son las posibles correlaciones entre los hallazgos de OCT macular, campimetría y presión intraocular en un paciente de 58 años con sospecha de glaucoma de ángulo abierto?",
    productType:"Informe profesional",
    customProduct:"",
    reportNature:"Evaluativo / interpretación de pruebas",
    customNatureDesc:"",
    customNatureStructure:"",
    willAttach:true,
    docTypes:"OCT macular, campimetría visual, tonometría, antecedentes familiares y fórmula oftalmológica.",
    responseStyle:"Tono técnico-profesional, diferenciar hallazgos aportados, inferencias razonables y límites diagnósticos.",
    labels:["oftalmologia","glaucoma","evaluativo","examenes","diagnostico"]
  };
  state.currentResponse = {
    titulo:"Análisis orientativo de correlación diagnóstica en sospecha de glaucoma",
    resumen_ejecutivo:"La integración de los hallazgos aportados sugiere una posible compatibilidad con cambios glaucomatosos iniciales, aunque la interpretación definitiva depende de valoración clínica presencial y seguimiento longitudinal.",
    analisis_del_caso:"Los datos aportados muestran una relación potencial entre elevación moderada de presión intraocular, alteraciones localizadas en la capa de fibras nerviosas observadas en OCT y defectos compatibles en campimetría. Estos hallazgos pueden ser coherentes con sospecha de glaucoma de ángulo abierto en etapa temprana, particularmente si existen antecedentes familiares y progresión documentada.",
    instrumentos_y_fuentes:["OCT macular (aportada por el usuario)","Campimetría visual (aportada por el usuario)","Tonometría (aportada por el usuario)"],
    interpretacion_resultados:"La alteración en fibras nerviosas observada en OCT es coherente con los defectos de campo visual descritos en campimetría. La presión intraocular elevada constituye factor de riesgo adicional.",
    limites_interpretativos:["Interpretación orientativa sin examen presencial","Requiere correlación con paquimetría y gonioscopía","Diagnóstico definitivo exige valoración oftalmológica integral"],
    recomendaciones:["Correlacionar hallazgos con paquimetría y gonioscopía.","Realizar seguimiento longitudinal de OCT y campimetría.","Evitar conclusiones diagnósticas definitivas sin valoración integral."],
    limites_y_advertencias:["La información corresponde a una interpretación orientativa.","No reemplaza valoración oftalmológica presencial."],
    informe_final:"La evidencia aportada permite observar una posible coherencia entre los cambios estructurales detectados mediante OCT y las alteraciones funcionales descritas en campimetría visual. La presión intraocular reportada podría constituir un factor de riesgo relevante; sin embargo, la interpretación debe mantenerse dentro de límites prudentes y contextualizados. Este concepto no reemplaza valoración presencial."
  };
  state.currentReportText = "";
  state.currentReportHTML = "";
  saveState();
  fillProfile();
  restoreDraftToForm(state.draft);  // ← Rellena formulario
  buildReport();
  toast("Demo oftalmología cargado");
}

function loadAcademicDemo(){
  state.profile = {
    name:"Dr. Andrés Molina",
    profession:"Investigador educativo",
    email:"andres.molina@universidad.edu",
    phone:"+57 3010000000",
    field:"Pensamiento complejo y epistemología",
    aiUse:"Revisiones bibliográficas, rastreos epistemológicos y construcción de artículos académicos."
  };
  state.draft = {
    title:"Rastreo epistemológico del pensamiento complejo",
    question:"¿Cuáles son las raíces epistemológicas del pensamiento complejo y cómo dialogan con la transdisciplinariedad?",
    productType:"Informe profesional",
    customProduct:"",
    reportNature:"Académico / bibliográfico",
    customNatureDesc:"",
    customNatureStructure:"",
    willAttach:false,
    docTypes:"Artículos científicos y libros de Morin, Nicolescu y Prigogine.",
    responseStyle:"Párrafos consolidados con autores y año dentro del texto. Referencias reales y verificables dentro del JSON.",
    labels:["academico","epistemologia","complejidad","bibliografia"]
  };
  state.currentResponse = {
    titulo:"Raíces epistemológicas del pensamiento complejo",
    resumen_ejecutivo:"El pensamiento complejo surge como crítica a la fragmentación del conocimiento y propone formas relacionales de comprensión del mundo.",
    marco_conceptual:"El pensamiento complejo se inscribe en la tradición de la crítica epistemológica al paradigma simplificador. Morin (1990) articula sus fundamentos desde la teoría de sistemas, la cibernética y la física del caos, proponiendo que el conocimiento genuino debe integrar la incertidumbre y la recursividad.",
    analisis_del_caso:"El rastreo epistemológico muestra influencias de la teoría de sistemas, la cibernética, la física del caos y la crítica al reduccionismo positivista. Prigogine e Stengers (1984) aportan el concepto de orden a partir del caos, que Morin integra en su propuesta sobre la organización compleja.",
    referencias_bibliograficas:[
      "Morin, E. (1990). Introducción al pensamiento complejo. Gedisa.",
      "Nicolescu, B. (1996). La transdisciplinariedad. Multiversidad Mundo Real.",
      "Prigogine, I., & Stengers, I. (1984). Order out of chaos. Bantam Books."
    ],
    recomendaciones:["Profundizar en la relación entre complejidad y epistemologías críticas latinoamericanas.","Diferenciar conceptualmente complejidad, holismo y transdisciplinariedad."],
    limites_y_advertencias:["La síntesis depende de los autores aportados y no reemplaza una revisión sistemática completa.","Se utilizan fuentes clásicas; actualizar con literatura reciente (2015-2025) para mayor pertinencia."],
    informe_final:"El pensamiento complejo se configura como una crítica epistemológica al paradigma simplificador moderno. Morin (1990) plantea que el conocimiento debe comprender relaciones, incertidumbres y procesos de organización recursiva. Nicolescu (1996) amplía esta perspectiva mediante la transdisciplinariedad, proponiendo niveles de realidad y la lógica del tercero incluido como herramientas para superar la fragmentación disciplinar."
  };
  state.currentReportText = "";
  state.currentReportHTML = "";
  saveState();
  fillProfile();
  restoreDraftToForm(state.draft);  // FIX A2: rellena los campos del formulario
  buildReport();
  toast("Demo académico cargado");
}

/* ============================================================
   TRAS · state.js
   Estado de la aplicacion, persistencia local y gestion de casos.
   ============================================================ */

let state = null;           // se inicializa en app.js (bootstrap)
let currentStep = 1;
let currentInterviewIndex = 0;

function defaultState() {
  return {
    schema: 1,
    evaluator: {
      nombre:'',
      profesion:'Psicologo clinico',
      registro:'',
      institucion:'',
      direccion:'',
      telefono:'',
      email:'',
      firmaDataUrl:''
    },
    currentCaseId: null,
    ui: { interviewMode: 'all', privacyNoticeDismissed: false },
    cases: []
  };
}

function createEmptyCase() {
  const id = 'case_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  const now = new Date().toISOString();
  return {
    id,
    scope: 'ambos',
    trasMode: 'extenso',
    createdAt: now,
    updatedAt: now,
    historial: [{ ts: now, nota: 'Caso creado' }],
    meta: {
      numero:'TRAS-' + new Date().toISOString().slice(0,10).replaceAll('-',''),
      fecha:new Date().toISOString().slice(0,10),
      nombre:'',
      edad:'',
      sexo:'',
      consentimiento:''
    },
    hc: { motivo:'', evento:'', familia:'', escolar:'', sintomas:'', recursos:'', objetivo:'', alertas:[], resumen:'' },
    modules: {
      complementarios: Object.fromEntries(DATASET.areas_complementarias.map(a => [a.id, false])),
      sensibles: { area_17: 'aplicar', area_18: 'aplicar' }
    },
    responses: {},
    interpretations: {},
    patterns: '',
    consolidated: '',
    recommendations: '',
    goldstein: { aplicado:false, modo:'all', respuestas:{}, interp:{}, fuente:'manual' },
    personalidad: { aplicado:false, dimensiones:[], sintesis:'', fuente:'manual' },
    informe: {
      consolidado_integral:'',
      hallazgos_convergentes:[],
      recursos_protectores:[],
      vulnerabilidades_contextuales:[],
      aproximacion_diagnostica:'',
      sintesis_padres:'',
      recomendaciones_prioritarias:[],
      cierre:'',
      fuente:'manual'
    },
    anexos: [],
    exports: []
  };
}

/* Marca el caso como actualizado y registra la nota en su historial interno.
   El historial es liviano (se conservan las 60 entradas mas recientes) y su
   proposito es dejar trazabilidad sin generar copias del caso. */
function touchCase(c, nota) {
  if (!c) return;
  const now = new Date().toISOString();
  c.updatedAt = now;
  if (nota) {
    c.historial = Array.isArray(c.historial) ? c.historial : [];
    const last = c.historial[c.historial.length - 1];
    // Evita repetir la misma nota si ocurre dentro del mismo minuto.
    if (!last || last.nota !== nota || (Date.parse(now) - Date.parse(last.ts)) > 60000) {
      c.historial.push({ ts: now, nota: String(nota).slice(0, 160) });
      if (c.historial.length > 60) c.historial = c.historial.slice(-60);
    }
  }
}

/* Garantiza que un caso cargado desde almacenamiento tenga toda la forma
   esperada, aun si proviene de una version previa del esquema. */
function normalizeCase(c) {
  const base = createEmptyCase();
  c = c || {};
  // Quitar campos transitorios de exportacion (no forman parte del caso).
  delete c._exportApp; delete c._exportSchema; delete c._exportedAt;
  c.id = c.id || base.id;
  c.scope = (c.scope === 'tras' || c.scope === 'habilidades' || c.scope === 'ambos') ? c.scope : 'ambos';
  c.meta = Object.assign({}, base.meta, c.meta || {});
  c.hc = Object.assign({}, base.hc, c.hc || {});
  c.hc.alertas = Array.isArray(c.hc.alertas) ? c.hc.alertas : [];
  c.modules = c.modules || {};
  c.modules.complementarios = Object.assign({}, base.modules.complementarios, c.modules.complementarios || {});
  c.modules.sensibles = Object.assign({}, base.modules.sensibles, c.modules.sensibles || {});
  c.responses = c.responses || {};
  c.interpretations = c.interpretations || {};
  c.patterns = c.patterns || '';
  c.consolidated = c.consolidated || '';
  c.recommendations = c.recommendations || '';
  c.goldstein = Object.assign({ aplicado:false, modo:'all', respuestas:{}, interp:{}, fuente:'manual' }, c.goldstein || {});
  c.goldstein.respuestas = c.goldstein.respuestas || {};
  if (!c.goldstein.interp || typeof c.goldstein.interp !== 'object') c.goldstein.interp = {};

  c.personalidad = Object.assign({ aplicado:false, dimensiones:[], sintesis:'', fuente:'manual' }, c.personalidad || {});
  c.personalidad.dimensiones = Array.isArray(c.personalidad.dimensiones) ? c.personalidad.dimensiones : [];
  c.personalidad.aplicado = !!(c.personalidad.dimensiones.length || String(c.personalidad.sintesis || '').trim());

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
    c.informe[k] = Array.isArray(c.informe[k])
      ? c.informe[k].map(x => String(x || '').trim()).filter(Boolean)
      : String(c.informe[k] || '').split(/\n+/).map(x => x.replace(/^\s*(?:[-•]|\d+[.)-]?)\s*/, '').trim()).filter(Boolean);
  });

  c.anexos = Array.isArray(c.anexos) ? c.anexos.filter(a => a && typeof a === 'object').map(a => ({
    id: a.id || 'anx_' + Math.random().toString(36).slice(2,8),
    titulo: String(a.titulo || 'Anexo'),
    contenido: String(a.contenido || ''),
    incluir: a.incluir !== false,
    ts: a.ts || new Date().toISOString()
  })) : [];

  c.exports = Array.isArray(c.exports) ? c.exports : [];

  // Marcas de tiempo e historial (casos previos al esquema no las traen).
  const fallback = c.meta.fecha ? new Date(c.meta.fecha + 'T00:00:00').toISOString() : new Date().toISOString();
  c.createdAt = c.createdAt || fallback;
  c.updatedAt = c.updatedAt || c.createdAt;
  c.historial = Array.isArray(c.historial) ? c.historial : [{ ts: c.createdAt, nota: 'Caso registrado' }];
  return c;
}

/* Clave de identidad de un caso: numero + nombre normalizados. Deliberadamente
   NO se deduplica solo por "numero", porque el numero por defecto
   (TRAS-AAAAMMDD) lo comparten todos los casos creados el mismo dia. */
function caseIdentityKey(c) {
  const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return norm(c.meta && c.meta.numero) + '||' + norm(c.meta && c.meta.nombre);
}

/* Devuelve el caso existente que comparte identidad con `candidate`, excluyendo
   el propio id. Solo cuenta si hay nombre: sin nombre no hay identidad fiable. */
function findDuplicateCase(candidate, excludeId) {
  const nombre = String(candidate.meta && candidate.meta.nombre || '').trim();
  if (!nombre) return null;
  const key = caseIdentityKey(candidate);
  return state.cases.find(x => x.id !== excludeId && caseIdentityKey(x) === key) || null;
}

/* Reemplaza el contenido de `target` con el de `source`, conservando id,
   createdAt e historial acumulado. */
function mergeIntoCase(target, source, nota) {
  const keepId = target.id;
  const keepCreated = target.createdAt;
  const keepHist = Array.isArray(target.historial) ? target.historial.slice() : [];
  const fresh = normalizeCase(JSON.parse(JSON.stringify(source)));
  Object.keys(target).forEach(k => { delete target[k]; });
  Object.assign(target, fresh);
  target.id = keepId;
  target.createdAt = keepCreated;
  target.historial = keepHist;
  touchCase(target, nota || 'Caso actualizado desde importacion');
  return target;
}

/* Ordena la lista por fecha de actualizacion (mas reciente primero). */
function sortCasesByRecent() {
  state.cases.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

/* Fusiona casos que comparten numero + nombre, conservando el mas reciente.
   Nunca actua a ciegas: informa cuantos se fusionaran y pide confirmacion. */
function dedupeCases() {
  const groups = new Map();
  state.cases.forEach(c => {
    if (!String(c.meta.nombre || '').trim()) return; // sin nombre no se toca
    const k = caseIdentityKey(c);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(c);
  });
  const dupGroups = [...groups.values()].filter(g => g.length > 1);
  if (!dupGroups.length) { toast('No se encontraron casos duplicados (mismo numero y nombre).', 'info'); return; }

  const sobran = dupGroups.reduce((n, g) => n + g.length - 1, 0);
  const detalle = dupGroups.map(g => `· ${g[0].meta.numero} — ${g[0].meta.nombre} (${g.length} copias)`).join('\n');
  const ok = confirm(
    `Se detectaron ${dupGroups.length} caso(s) con copias duplicadas:\n\n${detalle}\n\n` +
    `Se conservara la version MAS RECIENTE de cada uno y se eliminaran ${sobran} copia(s). ` +
    `Esta accion no se puede deshacer; exporta antes lo que quieras conservar.\n\nContinuar?`
  );
  if (!ok) return;

  const survivors = new Set();
  dupGroups.forEach(g => {
    g.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    const keep = g[0];
    touchCase(keep, `Se fusionaron ${g.length - 1} copia(s) duplicada(s)`);
    survivors.add(keep.id);
    g.slice(1).forEach(x => survivors.add('DROP:' + x.id));
  });
  const drop = new Set([...survivors].filter(x => x.startsWith('DROP:')).map(x => x.slice(5)));
  state.cases = state.cases.filter(c => !drop.has(c.id));
  if (!state.cases.find(c => c.id === state.currentCaseId)) state.currentCaseId = state.cases[0].id;
  sortCasesByRecent();
  persist();
  hydrateInputs();
  renderCaseList();
  toast(`${drop.size} caso(s) duplicado(s) eliminado(s). Se conservo la version mas reciente.`, 'ok', 5000);
}

function readRaw() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return raw;
  // Migracion desde claves historicas.
  for (const k of LEGACY_STORAGE_KEYS) {
    const legacy = localStorage.getItem(k);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
  }
  return null;
}

function dedupeCasesAutomatic(cases) {
  const byKey = new Map();
  (cases || []).forEach(c => {
    const n = normalizeCase(c);
    const isDemo = n.isDemo || String(n.meta.numero || '').toUpperCase() === 'TRAS-DEMO-001';
    const key = isDemo ? '__DEMO_UNICO__' : (String(n.meta.nombre || '').trim() ? caseIdentityKey(n) : '__ID__' + n.id);
    const prev = byKey.get(key);
    if (!prev || String(n.updatedAt || '').localeCompare(String(prev.updatedAt || '')) > 0) byKey.set(key, n);
  });
  return [...byKey.values()];
}

function loadState(rawOverride) {
  try {
    const raw = (typeof rawOverride === 'string') ? rawOverride : readRaw();
    if (!raw) {
      const s = defaultState();
      const c = createEmptyCase();
      s.cases.push(c);
      s.currentCaseId = c.id;
      return s;
    }
    const parsed = JSON.parse(raw);
    const s = Object.assign(defaultState(), parsed);
    s.evaluator = Object.assign(defaultState().evaluator, parsed.evaluator || {});
    if (typeof s.evaluator.firmaDataUrl !== 'string') s.evaluator.firmaDataUrl = '';
    s.ui = Object.assign(defaultState().ui, parsed.ui || {});
    s.cases = Array.isArray(parsed.cases) ? dedupeCasesAutomatic(parsed.cases) : [];
    if (!s.cases.length) {
      const c = createEmptyCase();
      s.cases.push(c);
      s.currentCaseId = c.id;
    }
    if (!s.cases.find(x => x.id === s.currentCaseId)) s.currentCaseId = s.cases[0].id;
    return s;
  } catch (e) {
    console.error('No se pudo leer el estado guardado:', e);
    const s = defaultState();
    const c = createEmptyCase();
    s.cases.push(c);
    s.currentCaseId = c.id;
    return s;
  }
}

function persist(nota) {
  try {
    const c = state.cases.find(x => x.id === state.currentCaseId);
    if (c) touchCase(c, nota);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof scheduleEncryptedRewrite === 'function') scheduleEncryptedRewrite();
  } catch (e) {
    console.error('No se pudo guardar:', e);
    const isQuota = e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''));
    if (isQuota) {
      toast('Almacenamiento del navegador lleno. Exporta y elimina casos antiguos (JSON) o quita la firma de muestra para liberar espacio.', 'danger', 6000);
    } else {
      toast('No se pudo guardar en este navegador (almacenamiento bloqueado).', 'danger');
    }
  }
}

function saveState(nota) {
  syncInputsToState();
  persist(nota || 'Guardado manual');
  sortCasesByRecent();
  renderCaseList();
  renderKpis();
}

/* Borra TODOS los datos de la app en este navegador (casos, perfil y firma). */
function wipeAllData() {
  const ok = confirm('Esto borrara TODOS los casos, el perfil del evaluador y la firma guardados en este navegador. Esta accion no se puede deshacer. Te recomendamos exportar antes lo que quieras conservar. Continuar?');
  if (!ok) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const k of (typeof LEGACY_STORAGE_KEYS !== 'undefined' ? LEGACY_STORAGE_KEYS : [])) localStorage.removeItem(k);
  } catch (e) { console.error(e); }
  if (typeof resetLocalEncryptionSession === 'function') resetLocalEncryptionSession();
  state = defaultState();
  const c = createEmptyCase();
  state.cases.push(c);
  state.currentCaseId = c.id;
  persist();
  hydrateInputs();
  renderCaseList();
  goStep(1);
  toast('Todos los datos fueron borrados de este navegador.', 'ok');
}

function autosave() {
  syncInputsToState();
  persist();
  renderKpis();
}

function getCurrentCase() {
  let c = state.cases.find(x => x.id === state.currentCaseId);
  if (!c) {
    c = createEmptyCase();
    state.cases.push(c);
    state.currentCaseId = c.id;
  }
  return c;
}

/* Devuelve las areas activas: nucleo siempre + complementarias activadas. */
function allAreas() {
  const c = getCurrentCase();
  const base = DATASET.areas_nucleo.map(a => JSON.parse(JSON.stringify(a)));
  const comps = DATASET.areas_complementarias
    .filter(a => c.modules.complementarios[a.id])
    .map(a => JSON.parse(JSON.stringify(a)));
  return [...base, ...comps];
}

/* Items aplanados y ordenados para la entrevista lineal.
   - Modo 'resumido': solo ciclos C y D (38 items nucleo).
   - Modo 'extenso' (por defecto): 59 items nucleo, excluye
     TRAS_EXTENSO_EXCLUIDOS (ver dataset.js para el criterio por area).
   Las subescalas complementarias no se filtran en ningun modo. */
function flattenedItems() {
  const c = getCurrentCase();
  const resumido = c.trasMode === 'resumido';
  const coreItems = DATASET.areas_nucleo
    .flatMap(area => area.items.map(item => ({...item, areaId:area.id, areaNombre:area.nombre, areaSensible:area.sensible})))
    .filter(item => resumido ? TRAS_RESUMIDO_CICLOS.includes(item.ciclo) : !TRAS_EXTENSO_EXCLUIDOS.includes(item.id))
    .sort((a,b)=>(a.num_test||999)-(b.num_test||999));
  const compItems = DATASET.areas_complementarias
    .filter(a => c.modules.complementarios[a.id])
    .flatMap(area => area.items.map(item => ({...item, num_test: null, areaId:area.id, areaNombre:area.nombre, areaSensible:false})));
  return [...coreItems, ...compItems];
}

function val(id) { return document.getElementById(id)?.value || ''; }
function setVal(id, value) { const el = document.getElementById(id); if (el) el.value = value || ''; }

function syncInputsToState() {
  const c = getCurrentCase();
  state.evaluator.nombre = val('ev_nombre');
  state.evaluator.profesion = val('ev_profesion');
  state.evaluator.registro = val('ev_registro');
  state.evaluator.institucion = val('ev_institucion');
  state.evaluator.direccion = val('ev_direccion');
  state.evaluator.telefono = val('ev_telefono');
  state.evaluator.email = val('ev_email');

  c.meta.numero = val('caso_numero');
  c.meta.fecha = val('caso_fecha');
  c.meta.nombre = val('caso_nombre');
  c.meta.edad = val('caso_edad');
  c.meta.sexo = val('caso_sexo');
  c.meta.consentimiento = val('caso_consentimiento');

  c.hc.motivo = val('hc_motivo');
  c.hc.evento = val('hc_evento');
  c.hc.familia = val('hc_familia');
  c.hc.escolar = val('hc_escolar');
  c.hc.sintomas = val('hc_sintomas');
  c.hc.recursos = val('hc_recursos');
  c.hc.objetivo = val('hc_objetivo');
  c.hc.resumen = val('hc_resumen');
  c.hc.alertas = [...document.querySelectorAll('.hc-alert:checked')].map(x=>x.value);

  DATASET.areas_complementarias.forEach(a => {
    const el = document.getElementById('mod_' + a.id);
    if (el) c.modules.complementarios[a.id] = el.checked;
  });
  ['area_17','area_18'].forEach(id => {
    const el = document.getElementById('sens_' + id);
    if (el) c.modules.sensibles[id] = el.value;
  });

  document.querySelectorAll('[data-response-key]').forEach(el => {
    const key = el.dataset.responseKey;
    c.responses[key] = c.responses[key] || {respuesta:'', notas:'', profundizar:false};
    c.responses[key][el.dataset.field] = el.type === 'checkbox' ? el.checked : el.value;
  });

  document.querySelectorAll('[data-interpret-area]').forEach(el => {
    const id = el.dataset.interpretArea;
    const it = c.interpretations[id] = (c.interpretations[id] && typeof c.interpretations[id] === 'object')
      ? c.interpretations[id] : {fuente:'manual'};
    const plane = el.dataset.plane;
    if (plane) it[plane] = el.value;
    else it.texto = el.value; // compat por si quedara algun textarea plano
  });
  // Recalcular el espejo ".texto" (combinacion de los tres planos) para cada
  // interpretacion que ya use el esquema estructurado; las interpretaciones
  // legadas sin planos conservan su .texto intacto.
  Object.keys(c.interpretations).forEach(id => {
    const it = c.interpretations[id];
    if (it && typeof it === 'object' && (('parrafo_integrado' in it) || ('que_dice' in it) || ('que_sucede' in it) || ('que_se_sugiere' in it))) {
      const integrado = String(it.parrafo_integrado || '').trim();
      it.texto = integrado || [it.que_dice, it.que_sucede, it.que_se_sugiere]
        .map(s => String(s || '').trim()).filter(Boolean).join(' ');
    }
  });
  c.patterns = val('patrones_globales');
  c.consolidated = val('analisis_consolidado');
  c.recommendations = val('recomendaciones');
}

function hydrateInputs() {
  const c = getCurrentCase();
  setVal('ev_nombre', state.evaluator.nombre);
  setVal('ev_profesion', state.evaluator.profesion);
  setVal('ev_registro', state.evaluator.registro);
  setVal('ev_institucion', state.evaluator.institucion);
  setVal('ev_direccion', state.evaluator.direccion);
  setVal('ev_telefono', state.evaluator.telefono);
  setVal('ev_email', state.evaluator.email);
  renderSignaturePreview();

  setVal('caso_numero', c.meta.numero);
  setVal('caso_fecha', c.meta.fecha);
  setVal('caso_nombre', c.meta.nombre);
  setVal('caso_edad', c.meta.edad);
  setVal('caso_sexo', c.meta.sexo);
  setVal('caso_consentimiento', c.meta.consentimiento);

  setVal('hc_motivo', c.hc.motivo);
  setVal('hc_evento', c.hc.evento);
  setVal('hc_familia', c.hc.familia);
  setVal('hc_escolar', c.hc.escolar);
  setVal('hc_sintomas', c.hc.sintomas);
  setVal('hc_recursos', c.hc.recursos);
  setVal('hc_objetivo', c.hc.objetivo);
  setVal('hc_resumen', c.hc.resumen);
  if (typeof updateResumenCounter === 'function') updateResumenCounter();
  document.querySelectorAll('.hc-alert').forEach(ch=>ch.checked = c.hc.alertas.includes(ch.value));

  renderModules();
  setTimeout(() => enhanceVoiceInputs(document), 0);
  renderInterview();
  renderReview();
  renderInterpretation();
  if (typeof renderGoldstein === 'function') renderGoldstein();
  if (typeof renderAnexos === 'function') renderAnexos();
  if (typeof renderPersonalidad === 'function') renderPersonalidad();
  if (typeof renderMatrizCA === 'function') renderMatrizCA();
  if (typeof renderScopeSelector === 'function') renderScopeSelector();
  if (typeof renderTopNav === 'function') renderTopNav();
  if (typeof renderNav === 'function') renderNav();
  renderReport();
}

function itemState(key) {
  const c = getCurrentCase();
  c.responses[key] = c.responses[key] || {respuesta:'', notas:'', profundizar:false};
  return c.responses[key];
}

/* ---------- Gestion de casos ---------- */
function newCase() {
  // Guardar el caso visible ANTES de cambiar el identificador actual.
  syncInputsToState();
  persist('Caso anterior guardado');
  const c = createEmptyCase();
  state.cases.unshift(c);
  state.currentCaseId = c.id;
  // Persistir sin volver a leer los campos que aun pertenecen al caso anterior.
  persist('Nuevo caso creado');
  hydrateInputs();
  renderCaseList();
  goStep(2);
  toast('Nuevo caso creado en blanco.', 'ok');
}

function switchCase(id) {
  syncInputsToState();
  persist();
  state.currentCaseId = id;
  hydrateInputs();
  renderCaseList();
  goStep(2);
}

function duplicateCase(id) {
  toast('La app conserva una sola version por caso. Usa Nuevo caso para una evaluacion independiente.', 'info', 4500);
}

function deleteCase(id) {
  const src = state.cases.find(x => x.id === id);
  const label = src ? (src.meta.numero || 'sin numero') : '';
  if (!confirm('Eliminar definitivamente el caso "' + label + '"? Esta accion no se puede deshacer.')) return;
  state.cases = state.cases.filter(x => x.id !== id);
  if (!state.cases.length) {
    const c = createEmptyCase();
    state.cases.push(c);
    state.currentCaseId = c.id;
  } else if (state.currentCaseId === id) {
    state.currentCaseId = state.cases[0].id;
  }
  persist();
  hydrateInputs();
  renderCaseList();
  toast('Caso eliminado.', 'warn');
}

/* Botones de guardado por paso */
function saveProfile() { saveState('Perfil del evaluador actualizado'); renderSignaturePreview(); toast('Perfil guardado.', 'ok'); }
function saveCaseMeta() { saveState('Datos de identificacion actualizados'); renderCaseList(); toast('Datos del caso guardados.', 'ok'); }
function saveHC() { saveState('Historia clinica actualizada'); toast('Historia clinica guardada.', 'ok'); }
function saveModules() { saveState('Modulos actualizados'); renderInterview(); toast('Configuracion de modulos guardada.', 'ok'); }
function saveInterpretations() { saveState('Interpretacion actualizada'); renderKpis(); toast('Interpretaciones guardadas.', 'ok'); }

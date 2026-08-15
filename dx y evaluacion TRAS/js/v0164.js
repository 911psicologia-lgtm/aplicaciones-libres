/* ============================================================
   TRAS · v0.16.4
   Navegación guiada, expediente único, ingreso documental de HC,
   puente universal de IA y centro de informes.
   ============================================================ */

/* ---------- Referencias a la versión anterior ---------- */
const V0164_BASE = {
  createEmptyCase,
  normalizeCase,
  dedupeCasesAutomatic,
  renderReport,
  openAiFlow,
  importAiJson,
  renderAiHubs,
  saveCaseMeta,
  importCaseJson,
  newCase,
  renderTopNav,
  renderNav,
  goStep,
  continueClinical,
  isStepVisible,
  renderScopeSelector,
  setScope
};

/* ---------- Esquema ampliado del expediente ---------- */
function v0164EmptyReports() {
  return {
    hc: { texto:'', fuente:'manual', actualizado:'' },
    tras: { texto:'', fuente:'manual', actualizado:'' },
    goldstein: { texto:'', fuente:'manual', actualizado:'' }
  };
}

function ensureCaseV0164(c) {
  if (!c) return c;
  c.scope = ['tras','habilidades','ambos','hc'].includes(c.scope) ? c.scope : 'ambos';
  c.workflow = Object.assign({ lastStep:2, completed:[], scopeSelected:true }, c.workflow || {});
  c.workflow.completed = Array.isArray(c.workflow.completed) ? c.workflow.completed : [];
  c.hc = Object.assign({
    motivo:'', evento:'', familia:'', escolar:'', sintomas:'', recursos:'', objetivo:'', alertas:[], resumen:'',
    materialBruto:'', fuentes:[]
  }, c.hc || {});
  c.hc.alertas = Array.isArray(c.hc.alertas) ? c.hc.alertas : [];
  c.hc.fuentes = Array.isArray(c.hc.fuentes) ? c.hc.fuentes : [];
  c.reportes = Object.assign(v0164EmptyReports(), c.reportes || {});
  ['hc','tras','goldstein'].forEach(k => {
    c.reportes[k] = Object.assign(v0164EmptyReports()[k], c.reportes[k] || {});
  });
  return c;
}

createEmptyCase = function createEmptyCaseV0164() {
  const c = V0164_BASE.createEmptyCase();
  c.scope = 'ambos';
  c.workflow = { lastStep:2, completed:[], scopeSelected:false };
  c.hc.materialBruto = '';
  c.hc.fuentes = [];
  c.reportes = v0164EmptyReports();
  return c;
};

normalizeCase = function normalizeCaseV0164(raw) {
  const rawScope = raw && raw.scope;
  const c = V0164_BASE.normalizeCase(raw);
  if (['tras','habilidades','ambos','hc'].includes(rawScope)) c.scope = rawScope;
  return ensureCaseV0164(c);
};

function hasMeaningfulValue(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === 'object') return Object.keys(v).length > 0;
  return String(v == null ? '' : v).trim().length > 0;
}

function mergeTextUnique(oldValue, newValue) {
  const a = String(oldValue || '').trim();
  const b = String(newValue || '').trim();
  if (!b) return a;
  if (!a) return b;
  if (a === b || a.includes(b)) return a;
  if (b.includes(a)) return b;
  return a + '\n\n' + b;
}

function mergeCaseRecords(target, source, note) {
  target = ensureCaseV0164(target);
  source = ensureCaseV0164(JSON.parse(JSON.stringify(source || {})));

  // Identificación: lo importado o lo recién editado prevalece cuando trae dato.
  Object.keys(target.meta || {}).forEach(k => {
    if (hasMeaningfulValue(source.meta && source.meta[k])) target.meta[k] = source.meta[k];
  });
  if (source.scope) target.scope = source.scope;

  // HC: conservar y ampliar; el resumen más completo prevalece.
  ['motivo','evento','familia','escolar','sintomas','recursos','objetivo'].forEach(k => {
    target.hc[k] = mergeTextUnique(target.hc[k], source.hc && source.hc[k]);
  });
  const oldSummary = String(target.hc.resumen || '').trim();
  const newSummary = String(source.hc && source.hc.resumen || '').trim();
  target.hc.resumen = newSummary.split(/\s+/).length >= oldSummary.split(/\s+/).length
    ? (newSummary || oldSummary)
    : (oldSummary || newSummary);
  target.hc.alertas = [...new Set([...(target.hc.alertas || []), ...((source.hc && source.hc.alertas) || [])])];
  target.hc.materialBruto = mergeTextUnique(target.hc.materialBruto, source.hc && source.hc.materialBruto);
  const sourceFiles = (source.hc && source.hc.fuentes) || [];
  const byName = new Map((target.hc.fuentes || []).map(x => [x.nombre || x.name, x]));
  sourceFiles.forEach(x => byName.set(x.nombre || x.name || ('fuente_'+byName.size), x));
  target.hc.fuentes = [...byName.values()];

  // Configuración y respuestas: combinar sin borrar campos útiles.
  target.modules.complementarios = Object.assign({}, target.modules.complementarios || {}, source.modules && source.modules.complementarios || {});
  target.modules.sensibles = Object.assign({}, target.modules.sensibles || {}, source.modules && source.modules.sensibles || {});
  Object.entries(source.responses || {}).forEach(([id, src]) => {
    const dst = target.responses[id] = Object.assign({respuesta:'',notas:'',profundizar:false}, target.responses[id] || {});
    if (String(src && src.respuesta || '').trim()) dst.respuesta = String(src.respuesta).trim();
    if (String(src && src.notas || '').trim()) dst.notas = mergeTextUnique(dst.notas, src.notas);
    if (src && typeof src.profundizar === 'boolean') dst.profundizar = src.profundizar || dst.profundizar;
  });
  Object.entries(source.interpretations || {}).forEach(([id, src]) => {
    const dst = target.interpretations[id] = Object.assign({}, target.interpretations[id] || {});
    Object.entries(src || {}).forEach(([k,v]) => {
      if (Array.isArray(v)) dst[k] = [...new Set([...(Array.isArray(dst[k]) ? dst[k] : []), ...v])];
      else if (hasMeaningfulValue(v)) dst[k] = v;
    });
  });
  ['patterns','consolidated','recommendations'].forEach(k => {
    if (hasMeaningfulValue(source[k])) target[k] = source[k];
  });

  // Goldstein, personalidad, informe y anexos.
  if (source.goldstein) {
    target.goldstein = Object.assign({}, target.goldstein || {}, source.goldstein);
    target.goldstein.respuestas = Object.assign({}, target.goldstein.respuestas || {}, source.goldstein.respuestas || {});
    target.goldstein.interp = Object.assign({}, target.goldstein.interp || {}, source.goldstein.interp || {});
    target.goldstein.aplicado = !!(target.goldstein.aplicado || source.goldstein.aplicado || Object.keys(target.goldstein.respuestas).length);
  }
  if (source.personalidad && (source.personalidad.aplicado || (source.personalidad.dimensiones || []).length)) {
    target.personalidad = JSON.parse(JSON.stringify(source.personalidad));
  }
  target.informe = Object.assign({}, target.informe || {}, source.informe || {});
  target.reportes = Object.assign(v0164EmptyReports(), target.reportes || {}, source.reportes || {});
  const anexos = new Map((target.anexos || []).map(a => [a.id || a.titulo, a]));
  (source.anexos || []).forEach(a => anexos.set(a.id || a.titulo, a));
  target.anexos = [...anexos.values()];

  target.workflow = Object.assign({}, target.workflow || {}, source.workflow || {});
  const histories = [...(target.historial || []), ...(source.historial || [])]
    .filter(x => x && x.ts).sort((a,b) => String(a.ts).localeCompare(String(b.ts)));
  target.historial = histories.slice(-60);
  touchCase(target, note || 'Expediente actualizado y fusionado');
  return target;
}

/* Agrupa por id estable y, cuando existe identidad suficiente, por número + nombre.
   A diferencia de versiones previas, fusiona información en lugar de desecharla. */
dedupeCasesAutomatic = function dedupeCasesAutomaticV0164(cases) {
  const result = [];
  const byId = new Map();
  const byIdentity = new Map();
  (cases || []).forEach(raw => {
    const c = normalizeCase(raw);
    const demo = c.isDemo || String(c.meta && c.meta.numero || '').toUpperCase() === 'TRAS-DEMO-001';
    const identity = demo ? '__DEMO_UNICO__' : (String(c.meta && c.meta.nombre || '').trim() ? caseIdentityKey(c) : '');
    let target = byId.get(c.id) || (identity && byIdentity.get(identity));
    if (!target) {
      target = c;
      result.push(target);
      byId.set(target.id, target);
      if (identity) byIdentity.set(identity, target);
    } else {
      mergeCaseRecords(target, c, 'Se fusionó una actualización del mismo caso');
    }
  });
  return result.sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
};

/* ---------- Recorrido clínico guiado ---------- */
function clinicalStepOrder(scope) {
  scope = scope || caseScope();
  const order = [2,3];
  if (scope === 'tras' || scope === 'ambos') order.push(4,5,6,7);
  if (scope === 'habilidades' || scope === 'ambos') order.push(9);
  const c = getCurrentCase();
  if (c && c.modules && c.modules.matrizCA) order.push(12);
  order.push(8);
  return order;
}

isStepVisible = function isStepVisibleV0164(id) {
  if (id === 1 || id === 11) return true; // accesibles desde el menú, no pertenecen al flujo.
  if (id === 10) return false;            // el perfil está integrado en Informes.
  return clinicalStepOrder().includes(id);
};

function workflowStepLabel(id) {
  const meta = steps.find(s => s.id === id);
  return meta ? meta.title : 'Sección';
}

nextClinicalStep = function nextClinicalStepV0164(fromId) {
  if (fromId === 1) return 2;
  const order = clinicalStepOrder();
  const i = order.indexOf(fromId);
  return i >= 0 && i < order.length - 1 ? order[i+1] : 8;
};

continueClinical = function continueClinicalV0164(fromId) {
  syncInputsToState();
  const c = ensureCaseV0164(getCurrentCase());
  if (!c.workflow.completed.includes(fromId)) c.workflow.completed.push(fromId);
  const next = nextClinicalStep(fromId);
  c.workflow.lastStep = next;
  persist(`Paso ${workflowStepLabel(fromId)} completado`);
  goStep(next);
  if (next === 4 && typeof renderModules === 'function') renderModules();
  if (next === 5 && typeof renderInterview === 'function') renderInterview();
  if (next === 6 && typeof renderReview === 'function') renderReview();
  if (next === 7 && typeof renderInterpretation === 'function') renderInterpretation();
  if (next === 9 && typeof renderGoldstein === 'function') renderGoldstein();
  if (next === 12 && typeof renderMatrizCA === 'function') renderMatrizCA();
  if (next === 8 && typeof renderReport === 'function') renderReport();
  const msg = next === 9 ? 'TRAS finalizado. Continúa ahora con habilidades sociales.'
    : next === 12 ? 'Habilidades sociales finalizadas. Continúa con la Matriz Cognitivo-Atencional.'
    : next === 8 ? 'Evaluaciones finalizadas. Revisa y genera los informes.' : '';
  if (msg) toast(msg, 'ok', 4800);
};

goStep = function goStepV0164(n) {
  syncInputsToState();
  const c = ensureCaseV0164(getCurrentCase());
  if (![1,11].includes(n) && !clinicalStepOrder().includes(n)) n = clinicalStepOrder()[0] || 2;
  currentStep = n;
  if (![1,11].includes(n)) c.workflow.lastStep = n;
  persist();

  document.querySelectorAll('.step-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('step-' + n);
  if (pane) pane.classList.add('active');
  document.querySelectorAll('.topnav-btn').forEach(b => {
    const on = Number(b.dataset.step) === n;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'step' : 'false');
  });

  const order = clinicalStepOrder();
  const pos = order.indexOf(n);
  const label = document.getElementById('progressLabel');
  const fill = document.getElementById('progressFill');
  if (pos >= 0) {
    if (label) label.textContent = `Paso ${pos+1} de ${order.length} · ${workflowStepLabel(n)}`;
    if (fill) fill.style.width = ((pos+1)/order.length*100) + '%';
  } else {
    if (label) label.textContent = n === 1 ? 'Perfil del evaluador' : 'Manual técnico';
    if (fill) fill.style.width = '0%';
  }

  const main = document.querySelector('.main');
  if (main) main.scrollTop = 0;
  if (pane) {
    pane.setAttribute('tabindex','-1');
    pane.setAttribute('role','region');
    if (window.__trasBooted) { try { pane.focus({preventScroll:true}); } catch (_) {} }
  }
  if (n === 8) renderReport();
  if (n === 3) hydrateHcSources();
  if (n === 9 && typeof renderGoldstein === 'function') renderGoldstein();
  if (n === 12 && typeof renderMatrizCA === 'function') renderMatrizCA();
};

renderTopNav = function renderTopNavV0164() {
  const bar = document.getElementById('topNav');
  if (!bar) return;
  const order = clinicalStepOrder();
  bar.innerHTML = order.map(id => {
    const s = steps.find(x => x.id === id);
    const completed = ensureCaseV0164(getCurrentCase()).workflow.completed.includes(id);
    return `<button class="topnav-btn ${id===currentStep?'active':''} ${completed?'completed':''}" data-step="${id}" onclick="goStep(${id})" title="${escapeHtml(s.title+' — '+s.desc)}" aria-label="${escapeHtml(s.title+': '+s.desc)}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${STEP_ICONS[id] || ''}</svg><span>${escapeHtml(s.title)}</span></button>`;
  }).join('');
};

renderNav = function renderNavV0164() {
  const nav = document.getElementById('stepNav');
  if (nav) nav.innerHTML = '';
};

setScope = function setScopeV0164(scope) {
  if (!['tras','habilidades','ambos','hc'].includes(scope)) scope = 'ambos';
  const c = ensureCaseV0164(getCurrentCase());
  c.scope = scope;
  c.workflow.scopeSelected = true;
  if (![1,11].includes(currentStep) && !clinicalStepOrder(scope).includes(currentStep)) currentStep = 2;
  touchCase(c, 'Alcance actualizado: ' + scope);
  persist();
  renderScopeSelector();
  renderTopNav();
  renderReportProductVisibility();
  goStep(currentStep);
};

renderScopeSelector = function renderScopeSelectorV0164() {
  const box = document.getElementById('scopeSelector');
  if (!box) return;
  const scope = caseScope();
  const c = ensureCaseV0164(getCurrentCase());
  const mcaOn = !!(c.modules && c.modules.matrizCA);
  const trasResumido = c.trasMode === 'resumido';
  const opt = (value,label,hint) => `<button class="scope-opt ${scope===value?'active':''}" onclick="setScope('${value}')" aria-pressed="${scope===value}"><strong>${label}</strong><span>${hint}</span></button>`;
  box.innerHTML = opt('tras','TRAS','HC + instrumento narrativo') + opt('habilidades','Habilidades','HC + Goldstein') + opt('ambos','Ambos','TRAS seguido de Goldstein') + opt('hc','Solo HC','Organización clínica e informe')
    + `<button class="scope-opt scope-opt-add ${mcaOn?'active':''}" onclick="toggleMatrizCaModule()" aria-pressed="${mcaOn}"><strong>${mcaOn?'✓ ':'+ '}Matriz Cognitivo-Atencional</strong><span>Se agrega como paso despues de habilidades sociales</span></button>`
    + `<button class="scope-opt scope-opt-add ${trasResumido?'active':''}" onclick="toggleTrasMode()" aria-pressed="${trasResumido}"><strong>${trasResumido?'✓ TRAS resumido':'TRAS extenso'}</strong><span>${trasResumido?'38 items (2/area, C+D) · clic para volver a extenso':'59 items (ajustado, ver informe) · clic para pasar a resumido (38)'}</span></button>`;
};

function toggleMatrizCaModule() {
  const c = ensureCaseV0164(getCurrentCase());
  c.modules = c.modules || {};
  c.modules.matrizCA = !c.modules.matrizCA;
  touchCase(c, c.modules.matrizCA ? 'Matriz Cognitivo-Atencional agregada al caso' : 'Matriz Cognitivo-Atencional retirada del caso');
  persist();
  renderScopeSelector();
  renderTopNav();
  if (!c.modules.matrizCA && currentStep === 12) goStep(2);
  toast(c.modules.matrizCA ? 'Matriz Cognitivo-Atencional agregada a la ruta del caso.' : 'Matriz Cognitivo-Atencional retirada de la ruta del caso.', c.modules.matrizCA ? 'ok' : 'info');
}

/* Alterna entre TRAS extenso (59 items, ver TRAS_EXTENSO_EXCLUIDOS en
   dataset.js) y resumido (38 items: ciclos C+D). Ningun modo es
   superconjunto exacto del otro area por area, asi que cambiar de modo
   puede dejar de mostrar en la entrevista lineal items que ya tenian
   respuesta (nunca se borran; siguen visibles en revision e informe).
   Se advierte antes si aplica. */
function toggleTrasMode() {
  const c = ensureCaseV0164(getCurrentCase());
  const next = c.trasMode === 'resumido' ? 'extenso' : 'resumido';
  const seOcultarian = DATASET.areas_nucleo
    .flatMap(area => area.items)
    .filter(it => {
      const visibleEnDestino = next === 'resumido' ? TRAS_RESUMIDO_CICLOS.includes(it.ciclo) : !TRAS_EXTENSO_EXCLUIDOS.includes(it.id);
      return !visibleEnDestino && (itemState(it.id).respuesta || '').trim();
    });
  if (seOcultarian.length && !confirm(`Al cambiar a modo ${next}, ${seOcultarian.length} respuesta(s) ya registradas dejarán de mostrarse en la entrevista lineal (no se borran; siguen visibles en Revisión e Informe). ¿Continuar?`)) return;
  c.trasMode = next;
  touchCase(c, 'Modo TRAS cambiado a ' + next);
  persist();
  renderScopeSelector();
  currentInterviewIndex = 0;
  if (typeof renderInterview === 'function') renderInterview();
  toast('TRAS en modo ' + next + '.', 'ok');
}

/* ---------- Menú hamburguesa ---------- */
function toggleMenuDrawer(force) {
  const drawer = document.getElementById('menuDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (!drawer) return;
  const open = typeof force === 'boolean' ? force : !drawer.classList.contains('open');
  drawer.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('show', open);
  document.body.classList.toggle('drawer-open', open);
  if (open) setTimeout(() => drawer.querySelector('button,summary')?.focus(), 0);
}

/* ---------- Creación de caso y expediente único ---------- */
newCase = function newCaseV0164() {
  syncInputsToState();
  persist('Caso actual guardado antes de iniciar otro');
  toggleModal('newCaseModal', true);
};

function createCaseWithScope(scope) {
  if (!['tras','habilidades','ambos','hc'].includes(scope)) scope = 'ambos';
  const wantsMatrizCA = !!document.getElementById('scopeWizardMatrizCA')?.checked;
  const trasMode = document.querySelector('input[name="trasModeWizard"]:checked')?.value === 'resumido' ? 'resumido' : 'extenso';
  const c = createEmptyCase();
  c.scope = scope;
  c.trasMode = trasMode;
  c.modules = c.modules || {};
  c.modules.matrizCA = wantsMatrizCA;
  c.workflow.scopeSelected = true;
  c.workflow.lastStep = 2;
  state.cases.unshift(c);
  state.currentCaseId = c.id;
  persist('Nuevo caso creado con alcance ' + scope + (wantsMatrizCA ? ' + Matriz Cognitivo-Atencional' : '') + ' · TRAS ' + trasMode);
  hydrateInputs();
  renderCaseList();
  renderScopeSelector();
  renderTopNav();
  toggleModal('newCaseModal', false);
  goStep(2);
  toast('Nuevo expediente creado. El recorrido quedó configurado.', 'ok');
}

saveCaseMeta = function saveCaseMetaV0164() {
  syncInputsToState();
  let current = ensureCaseV0164(getCurrentCase());
  const duplicate = findDuplicateCase(current, current.id);
  if (duplicate) {
    mergeCaseRecords(duplicate, current, 'Se integró una entrada del mismo caso');
    state.cases = state.cases.filter(x => x.id !== current.id);
    state.currentCaseId = duplicate.id;
    current = duplicate;
    toast('Se reconoció el mismo caso y se actualizó su expediente único.', 'ok', 4800);
  } else {
    touchCase(current, 'Datos de identificación actualizados');
    toast('Datos del caso guardados.', 'ok');
  }
  sortCasesByRecent();
  persist();
  hydrateInputs();
  renderCaseList();
};

/* ---------- Importar / exportar caso y aplicación completa ---------- */
function exportAppBackup() {
  syncInputsToState();
  persist('Copia total exportada');
  const payload = {
    _exportType:'TRAS_APP_BACKUP',
    _exportApp:APP_VERSION,
    _exportSchema:typeof CASE_SCHEMA !== 'undefined' ? CASE_SCHEMA : 1,
    _exportedAt:new Date().toISOString(),
    state: JSON.parse(JSON.stringify(state))
  };
  const date = new Date().toISOString().slice(0,10);
  downloadFile(`TRAS_respaldo_completo_${date}.json`, JSON.stringify(payload,null,2), 'application/json');
  toast(`Respaldo completo exportado: ${state.cases.length} caso(s).`, 'ok');
}

let V0164_APP_IMPORT_MODE = 'merge';
function prepareAppImport(mode) {
  V0164_APP_IMPORT_MODE = mode === 'replace' ? 'replace' : 'merge';
  const input = document.getElementById('appImportFile');
  if (input) { input.value = ''; input.click(); }
}

function importAppBackup(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result || ''));
      const incomingState = raw && raw.state ? raw.state : raw;
      if (!incomingState || !Array.isArray(incomingState.cases)) throw new Error('El archivo no contiene una copia completa de la aplicación.');
      if (V0164_APP_IMPORT_MODE === 'replace') {
        const ok = confirm(`Se reemplazarán todos los datos locales por ${incomingState.cases.length} caso(s) del respaldo. Esta acción no se puede deshacer. ¿Continuar?`);
        if (!ok) return;
        state = Object.assign(defaultState(), incomingState);
        state.evaluator = Object.assign(defaultState().evaluator, incomingState.evaluator || {});
        state.ui = Object.assign(defaultState().ui, incomingState.ui || {});
        state.cases = dedupeCasesAutomatic(incomingState.cases);
        state.currentCaseId = state.cases.find(x => x.id === incomingState.currentCaseId)?.id || state.cases[0]?.id || null;
      } else {
        const existingById = new Map(state.cases.map(c => [c.id,c]));
        incomingState.cases.forEach(rawCase => {
          const incoming = normalizeCase(rawCase);
          const target = existingById.get(incoming.id) || findDuplicateCase(incoming, null);
          if (target) mergeCaseRecords(target, incoming, 'Actualizado desde respaldo completo');
          else { state.cases.push(incoming); existingById.set(incoming.id,incoming); }
        });
        if (incomingState.evaluator && confirm('El respaldo también contiene un perfil de evaluador. ¿Actualizar el perfil local con esos datos?')) {
          state.evaluator = Object.assign({}, state.evaluator, incomingState.evaluator);
        }
        state.cases = dedupeCasesAutomatic(state.cases);
      }
      if (!state.cases.length) {
        const c=createEmptyCase(); state.cases=[c]; state.currentCaseId=c.id;
      }
      sortCasesByRecent();
      persist('Aplicación restaurada desde respaldo');
      hydrateInputs(); renderCaseList(); renderTopNav(); renderScopeSelector(); goStep(2);
      toast(V0164_APP_IMPORT_MODE === 'replace' ? 'Aplicación restaurada por completo.' : 'Respaldo combinado sin duplicar expedientes.', 'ok', 5200);
    } catch (e) {
      toast('No se pudo importar la aplicación: ' + e.message, 'danger', 6000);
    } finally { event.target.value=''; }
  };
  reader.readAsText(file,'utf-8');
}

importCaseJson = function importCaseJsonV0164(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result || ''));
      if (raw && raw.state && Array.isArray(raw.state.cases)) throw new Error('Este archivo es un respaldo de toda la app. Use “Importar app y combinar”.');
      const incoming = normalizeCase(raw);
      let target = state.cases.find(c => c.id === incoming.id) || findDuplicateCase(incoming, null);
      if (target) {
        mergeCaseRecords(target, incoming, 'Caso actualizado desde archivo JSON');
        state.currentCaseId = target.id;
        toast('Caso actualizado en su expediente existente. No se creó una copia.', 'ok', 5200);
      } else {
        // Mantener el id exportado cuando no colisiona: futuras importaciones reconocerán el mismo expediente.
        if (state.cases.some(c => c.id === incoming.id)) incoming.id = 'case_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
        touchCase(incoming, 'Caso importado');
        state.cases.unshift(incoming);
        state.currentCaseId = incoming.id;
        toast('Caso nuevo importado correctamente.', 'ok');
      }
      state.cases = dedupeCasesAutomatic(state.cases);
      sortCasesByRecent(); persist(); hydrateInputs(); renderCaseList(); renderTopNav(); goStep(2);
    } catch (e) {
      toast('No se pudo importar el caso: ' + e.message, 'danger', 5600);
    } finally { event.target.value=''; }
  };
  reader.readAsText(file,'utf-8');
};

/* ---------- Ingreso de materiales para historia clínica ---------- */
let V0164_HC_FILE_SOURCES = [];

function stripHtmlToText(html) {
  try {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    return (doc.body && doc.body.innerText || '').trim();
  } catch (_) { return String(html || '').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
}

/* Carga un script externo una sola vez, bajo demanda (no en cada apertura de
   la app) para no penalizar el arranque con librerías pesadas que casi nadie
   usa en cada sesión. */
const _loadedScripts = {};
function ensureScriptLoaded(url) {
  if (_loadedScripts[url]) return _loadedScripts[url];
  _loadedScripts[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url; s.onload = () => resolve(true); s.onerror = () => reject(new Error('No se pudo cargar ' + url));
    document.head.appendChild(s);
  });
  return _loadedScripts[url];
}

/* OCR de una imagen (HC escaneada o fotografiada) usando Tesseract.js,
   cargado solo cuando se necesita. Requiere conexión la primera vez que se
   usa en la sesión (descarga el motor y los datos de idioma); si no hay
   conexión, falla con un mensaje claro y el texto puede pegarse a mano. */
async function extractImageTextOcr(file, onProgress) {
  await ensureScriptLoaded('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js');
  if (!window.Tesseract) throw new Error('El motor de OCR no está disponible. Verifique la conexión o transcriba manualmente.');
  const { data } = await window.Tesseract.recognize(file, 'spa', {
    logger: m => { if (onProgress && m.status === 'recognizing text') onProgress(Math.round((m.progress||0)*100)); }
  });
  return String(data && data.text || '').trim();
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) throw new Error('El lector PDF no está disponible. Verifique la conexión o pegue el texto manualmente.');
  try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; } catch (_) {}
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await window.pdfjsLib.getDocument({data}).promise;
  const pages = [];
  for (let i=1;i<=pdf.numPages;i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(x => x.str).join(' '));
  }
  return pages.join('\n\n').trim();
}

async function extractDocxText(file) {
  if (!window.mammoth || typeof window.mammoth.extractRawText !== 'function') throw new Error('El lector DOCX no está disponible. Verifique la conexión o pegue el texto manualmente.');
  const result = await window.mammoth.extractRawText({arrayBuffer: await file.arrayBuffer()});
  return String(result.value || '').trim();
}

async function extractHcFile(file) {
  const name = file.name || 'documento';
  const ext = name.toLowerCase().split('.').pop();
  if (['txt','md','csv'].includes(ext) || /^text\//.test(file.type || '')) return await file.text();
  if (ext === 'json' || file.type === 'application/json') {
    const text = await file.text();
    try { return JSON.stringify(JSON.parse(text), null, 2); } catch (_) { return text; }
  }
  if (['html','htm'].includes(ext) || file.type === 'text/html') return stripHtmlToText(await file.text());
  if (ext === 'docx' || /officedocument\.wordprocessingml/.test(file.type || '')) return await extractDocxText(file);
  if (ext === 'pdf' || file.type === 'application/pdf') return await extractPdfText(file);
  if (['jpg','jpeg','png','webp'].includes(ext) || /^image\//.test(file.type || '')) return await extractImageTextOcr(file);
  throw new Error('Formato no compatible para extracción automática.');
}

async function handleHcSourceFiles(event) {
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  const status = document.getElementById('hcSourceStatus');
  if (status) status.textContent = `Procesando ${files.length} archivo(s)... las imágenes usan OCR y pueden tardar más.`;
  const results = [];
  for (const file of files) {
    try {
      const text = (await extractHcFile(file)).trim();
      if (!text) throw new Error('No se encontró texto legible.');
      results.push({ nombre:file.name, tipo:file.type || '', texto:text.slice(0,180000), caracteres:text.length });
    } catch (e) {
      results.push({ nombre:file.name, error:e.message });
    }
  }
  const existing = new Map(V0164_HC_FILE_SOURCES.map(x => [x.nombre,x]));
  results.filter(x => x.texto).forEach(x => existing.set(x.nombre,x));
  V0164_HC_FILE_SOURCES = [...existing.values()];
  const ok = results.filter(x => x.texto).length;
  const errors = results.filter(x => x.error);
  if (status) status.innerHTML = `<strong>${ok} archivo(s) listo(s).</strong>${V0164_HC_FILE_SOURCES.length ? '<br>'+V0164_HC_FILE_SOURCES.map(x=>`• ${escapeHtml(x.nombre)} · ${x.texto.length.toLocaleString('es-CO')} caracteres`).join('<br>') : ''}${errors.length ? '<br><span style="color:#9f1c13">No procesados: '+errors.map(x=>escapeHtml(x.nombre+' ('+x.error+')')).join('; ')+'</span>' : ''}`;
}

function hydrateHcSources() {
  const c = ensureCaseV0164(getCurrentCase());
  const ta = document.getElementById('hc_source_text');
  if (ta && !ta.value && c.hc.materialBruto) ta.value = c.hc.materialBruto;
  const status = document.getElementById('hcSourceStatus');
  if (status && (c.hc.fuentes || []).length && !V0164_HC_FILE_SOURCES.length) {
    status.innerHTML = `<strong>${c.hc.fuentes.length} fuente(s) registrada(s) previamente.</strong><br>${c.hc.fuentes.map(x=>`• ${escapeHtml(x.nombre || 'Fuente')}`).join('<br>')}`;
  }
}

function clearHcSources() {
  const ta = document.getElementById('hc_source_text'); if (ta) ta.value='';
  const input = document.getElementById('hc_source_files'); if (input) input.value='';
  const status = document.getElementById('hcSourceStatus'); if (status) status.textContent='Materiales vaciados. Puede pegar o cargar nueva información.';
  V0164_HC_FILE_SOURCES = [];
  const c = ensureCaseV0164(getCurrentCase());
  c.hc.materialBruto=''; c.hc.fuentes=[]; persist('Materiales de HC vaciados');
}

function openHcAiFromSources() {
  syncInputsToState();
  const c = ensureCaseV0164(getCurrentCase());
  const pasted = String(document.getElementById('hc_source_text')?.value || '').trim();
  const fileText = V0164_HC_FILE_SOURCES.map(x => `### FUENTE: ${x.nombre}\n${x.texto}`).join('\n\n');
  let combined = [pasted, fileText].filter(Boolean).join('\n\n');
  if (!combined) {
    combined = [c.hc.motivo,c.hc.evento,c.hc.familia,c.hc.escolar,c.hc.sintomas,c.hc.recursos,c.hc.objetivo,c.hc.resumen].filter(Boolean).join('\n\n');
  }
  if (!combined.trim()) { toast('Pegue información o cargue al menos un documento antes de impulsar la HC con IA.', 'warn', 4800); return; }
  c.hc.materialBruto = combined.slice(0,220000);
  c.hc.fuentes = V0164_HC_FILE_SOURCES.map(x => ({nombre:x.nombre,tipo:x.tipo,caracteres:x.caracteres || x.texto.length}));
  persist('Materiales de HC preparados para IA');
  openAiFlow('hc');
}

/* ---------- Puente universal de IA ---------- */
const V0164_AI_PROVIDERS = [
  {nombre:'ChatGPT', sigla:'C', url:'https://chatgpt.com/'},
  {nombre:'Claude', sigla:'C', url:'https://claude.ai/new'},
  {nombre:'Gemini', sigla:'G', url:'https://gemini.google.com/app'},
  {nombre:'Perplexity', sigla:'P', url:'https://www.perplexity.ai/'},
  {nombre:'Copilot', sigla:'C', url:'https://copilot.microsoft.com/'},
  {nombre:'DeepSeek', sigla:'D', url:'https://chat.deepseek.com/'},
  {nombre:'Mistral', sigla:'M', url:'https://chat.mistral.ai/chat'},
  {nombre:'Grok', sigla:'G', url:'https://grok.com/'},
  {nombre:'Z.ai', sigla:'Z', url:'https://chat.z.ai/'}
];

renderAiHubs = function renderAiHubsV0164(containerId) {
  const host = document.getElementById(containerId);
  if (!host) return;
  host.innerHTML = V0164_AI_PROVIDERS.map((p,i) => `<button class="ai-provider-btn" onclick="openAiProvider(${i})"><span class="ai-provider-logo">${escapeHtml(p.sigla)}</span><strong>${escapeHtml(p.nombre)}</strong></button>`).join('');
};

function showAiPromptStage() {
  document.getElementById('aiFlowStagePrompt')?.classList.remove('hidden');
  document.getElementById('aiFlowStageResponse')?.classList.add('hidden');
  document.querySelector('#aiFlowStagePrompt h2')?.focus?.();
}
function showAiResponseStage() {
  document.getElementById('aiFlowStagePrompt')?.classList.add('hidden');
  document.getElementById('aiFlowStageResponse')?.classList.remove('hidden');
  setTimeout(() => document.getElementById('aiFlowJson')?.focus(), 0);
}
function closeAiWizard() { toggleModal('aiFlowModal', false); }

openAiFlow = function openAiFlowV0164(id) {
  const flow = AI_FLOWS[id];
  if (!flow) { toast('Flujo de IA no disponible.', 'danger'); return; }
  syncInputsToState();
  _activeAiFlow = id;
  let prompt;
  try { prompt = flow.buildPrompt(); }
  catch (e) { toast('No se pudo preparar el impulso con IA: ' + e.message, 'danger', 5600); return; }
  const title = document.getElementById('aiFlowTitle');
  const hint = document.getElementById('aiFlowHint');
  const notice = document.getElementById('aiFlowNotice');
  const promptEl = document.getElementById('aiFlowPrompt');
  const jsonEl = document.getElementById('aiFlowJson');
  if (title) title.textContent = flow.titulo || 'Tu prompt está listo';
  if (hint) hint.textContent = flow.hint || 'Copia el prompt, abre tu IA y vuelve con la respuesta.';
  if (notice) notice.innerHTML = flow.aviso || '<strong>Regla clave:</strong> responde directamente en el chat y devuelve únicamente el JSON solicitado.';
  if (promptEl) promptEl.value = prompt;
  if (jsonEl) jsonEl.value='';
  const file = document.getElementById('aiFlowJsonFile'); if (file) file.value='';
  const status = document.getElementById('aiFlowStatus'); if (status) status.textContent='Aún no has pegado la respuesta.';
  renderAiHubs('aiFlowHubs');
  showAiPromptStage();
  toggleModal('aiFlowModal', true);
};

copyAiPrompt = async function copyAiPromptV0164() {
  const text = document.getElementById('aiFlowPrompt')?.value || '';
  if (!text) { toast('No hay prompt preparado.', 'warn'); return false; }
  try { await navigator.clipboard.writeText(text); toast('Prompt copiado. Ahora abra la IA elegida.', 'ok'); return true; }
  catch (_) {
    const helper = document.createElement('textarea'); helper.value=text; helper.style.position='fixed'; helper.style.opacity='0'; document.body.appendChild(helper); helper.select();
    try { document.execCommand('copy'); toast('Prompt copiado. Ahora abra la IA elegida.', 'ok'); return true; }
    catch (e) { toast('No fue posible copiar automáticamente. Revise los permisos del portapapeles.', 'warn', 5000); return false; }
    finally { helper.remove(); }
  }
};

async function openAiProvider(index) {
  const p = V0164_AI_PROVIDERS[index];
  if (!p) return;
  await copyAiPrompt();
  window.open(p.url, '_blank', 'noopener,noreferrer');
}

importAiJson = function importAiJsonV0164() {
  const flow = AI_FLOWS[_activeAiFlow];
  if (!flow || !validateAiJson()) return;
  let data, msg;
  try {
    data = parseAiJson();
    msg = flow.apply(data);
  } catch (e) {
    const status = document.getElementById('aiFlowStatus');
    if (status) status.innerHTML = '<span class="badge danger">No se pudo aplicar</span> ' + escapeHtml(e.message);
    return;
  }
  persist('Datos insertados desde IA: ' + (flow.titulo || _activeAiFlow));
  hydrateInputs();
  renderCaseList();
  renderTopNav();
  renderReport();
  closeAiWizard();
  toast(msg || 'Respuesta insertada. Revise clínicamente antes de exportar.', 'ok', 5200);
};

/* ---------- Flujos IA: TRAS y Goldstein dentro del puente universal ---------- */
function buildTrasPromptV0164() {
  const payload = buildPromptPayload();
  return `# ROL
Actúas como psicólogo clínico infanto-juvenil que apoya al profesional tratante en la lectura contextual del TRAS. No diagnosticas ni decides por el profesional.

# MARCO INTERNO
Integra el sentido de la experiencia, los vínculos, la ambivalencia, los recursos, las condiciones del contexto y la posible función protectora o reguladora de algunas respuestas. No nombres escuelas psicológicas ni uses expresiones como "desde una perspectiva", "El material sugiere", "se evidencia" o inicios repetitivos de plantilla.

# MÉTODO POR ÁREA
Lee juntos los cuatro ciclos; identifica convergencias, contrastes, silencios, recursos y palabras significativas. Articula cada área con la historia clínica, sin convertir una frase aislada en rasgo, causa o diagnóstico. Conserva hechos sensibles, tensiones, contradicciones, violencia, pérdidas, cambios funcionales y recursos.

Para cada área construye internamente:
- que_dice: síntesis descriptiva fiel.
- que_sucede: comprensión contextual prudente.
- que_se_sugiere: qué conviene profundizar o acompañar.
Luego redacta parrafo_integrado: UN SOLO PÁRRAFO natural que reúna los tres componentes. Suele ocupar 45-75 palabras y puede llegar a 100 cuando la complejidad lo requiera. No recortes información importante para cumplir una extensión.

Si no hay datos, escribe exactamente: "No se dispone de respuestas ni de información clínica suficiente en esta área. Debe completarse en entrevista o quedar consignada como no explorada." y marca estado_datos:"sin_informacion". Incluye todas las áreas, incluso las vacías.

# SALIDA
Devuelve SOLO JSON válido, sin backticks ni texto adicional:
{"version_schema":"3.0","areas":[{"area_id":"area_01","area_nombre":"...","estado_datos":"suficiente|parcial|sin_informacion","que_dice":"...","que_sucede":"...","que_se_sugiere":"...","parrafo_integrado":"...","hallazgos_clave":[],"banderas":[],"recursos":[]}],"patrones_globales":"...","analisis_consolidado":"...","recomendaciones":["..."]}

# DATOS DEL CASO
${JSON.stringify(payload,null,2)}`;
}

function applyTrasJsonV0164(data) {
  const c = ensureCaseV0164(getCurrentCase());
  const valid = new Set(allAreas().map(a => a.id));
  let n=0;
  (data.areas || []).forEach(a => {
    if (!a || !valid.has(a.area_id)) return;
    c.interpretations[a.area_id] = {
      estado_datos:String(a.estado_datos || '').trim(),
      que_dice:String(a.que_dice || '').trim(),
      que_sucede:String(a.que_sucede || '').trim(),
      que_se_sugiere:String(a.que_se_sugiere || '').trim(),
      parrafo_integrado:String(a.parrafo_integrado || '').trim(),
      texto:String(a.parrafo_integrado || [a.que_dice,a.que_sucede,a.que_se_sugiere].filter(Boolean).join(' ')).trim(),
      hallazgos_clave:Array.isArray(a.hallazgos_clave)?a.hallazgos_clave:[],
      banderas:Array.isArray(a.banderas)?a.banderas:[],
      recursos:Array.isArray(a.recursos)?a.recursos:[],
      fuente:'ia-manual'
    }; n++;
  });
  if (!n) throw new Error('El JSON no contiene áreas reconocidas del TRAS.');
  c.patterns = String(data.patrones_globales || c.patterns || '').trim();
  c.consolidated = String(data.analisis_consolidado || c.consolidated || '').trim();
  c.recommendations = Array.isArray(data.recomendaciones) ? data.recomendaciones.map((x,i)=>`${i+1}. ${x}`).join('\n') : String(data.recomendaciones || c.recommendations || '').trim();
  c.reportes.tras = { texto:c.consolidated, fuente:'ia-manual', actualizado:new Date().toISOString() };
  return `${n} áreas del TRAS actualizadas. El análisis por áreas permanece completo y editable.`;
}

registerAiFlow('tras', {
  titulo:'Interpretación completa del TRAS',
  hint:'La IA leerá la HC y todas las áreas activas. Cada área conservará sus tres planos internos y un único párrafo visible, sin amputar información relevante.',
  aviso:'<strong>Regla clave:</strong> devuelve solamente JSON válido. No nombres escuelas psicológicas ni reduzcas áreas complejas a etiquetas.',
  requiredKeys:['areas','patrones_globales','analisis_consolidado','recomendaciones'],
  buildPrompt:buildTrasPromptV0164,
  apply:applyTrasJsonV0164
});
openManualAI = function(){ openAiFlow('tras'); };

function buildGoldsteinPromptV0164() {
  const c = ensureCaseV0164(getCurrentCase());
  const g = goldsteinState();
  const r = computeGoldstein(g.respuestas || {});
  if (!r.global.respondidos) throw new Error('Aún no hay respuestas de habilidades sociales.');
  const gruposNombre = Object.fromEntries(GOLDSTEIN_GRUPOS.map(x=>[x.id,x.nombre]));
  const detail = GOLDSTEIN_ITEMS.map(item => {
    const value=g.respuestas[item.id];
    if (!value) return null;
    return {grupo:gruposNombre[item.grupo] || item.grupo, habilidad:item.texto, respuesta:GOLDSTEIN_NIVELES[value]?.titulo || value};
  }).filter(Boolean);
  const material = aiScrubDeep({contexto:aiCaseContext(),interpretaciones_tras:c.interpretations,patrones_tras:c.patterns,resultados:r,respuestas_por_habilidad:detail},c.meta.nombre);
  return `# ROL
Eres un psicólogo clínico infanto-juvenil que interpreta un tamizaje descriptivo de habilidades sociales de Goldstein y lo contextualiza con la historia clínica y, cuando existe, con el TRAS.

# CRITERIOS
No uses percentiles, baremos, diagnósticos ni rasgos fijos. No reduzcas el perfil a porcentajes globales: revisa grupos y habilidades individuales. Diferencia conocer una habilidad de poder ejecutarla bajo estrés, vergüenza, rechazo, presión, conflicto o autoridad. Conserva contrastes y no atribuyas causas únicas. No nombres escuelas psicológicas ni uses "El material sugiere", "se evidencia" o frases de plantilla.

# PRODUCTOS
- que_sale: perfil descriptivo suficiente, con fortalezas y fragilidades específicas.
- lectura_contextual: relación con el caso y condiciones en que las habilidades aumentan o disminuyen.
- sugerencias: 3 a 5 acciones concretas.
- conclusion: cierre que matice la clasificación "${r.clasificacion.etiqueta}" sin borrar la heterogeneidad.

# SALIDA
Devuelve SOLO JSON válido:
{"version_schema":"3.0","que_sale":"...","lectura_contextual":"...","sugerencias":["..."],"conclusion":"..."}

# INFORMACIÓN DEL CASO Y RESULTADOS
${JSON.stringify(material,null,2)}`;
}

function applyGoldsteinJsonV0164(data) {
  const g=goldsteinState(); const gi=goldsteinInterp(g);
  gi.que_sale=String(data.que_sale || '').trim();
  gi.analisis_causal=String(data.lectura_contextual || data.analisis_causal || '').trim();
  gi.sugerencias=Array.isArray(data.sugerencias)?data.sugerencias.map((x,i)=>`${i+1}. ${x}`).join('\n'):String(data.sugerencias || '').trim();
  gi.conclusion=String(data.conclusion || '').trim();
  if (!gi.que_sale && !gi.analisis_causal) throw new Error('El JSON no contiene una interpretación de habilidades sociales.');
  g.aplicado=true; g.fuente='ia-manual';
  const c=ensureCaseV0164(getCurrentCase());
  c.reportes.goldstein={texto:[gi.que_sale,gi.analisis_causal,gi.conclusion].filter(Boolean).join('\n\n'),fuente:'ia-manual',actualizado:new Date().toISOString()};
  return 'Resultado de habilidades sociales insertado y vinculado al expediente.';
}

registerAiFlow('goldstein', {
  titulo:'Resultado de habilidades sociales',
  hint:'Integra porcentajes, grupos, respuestas individuales, HC y TRAS sin convertirlos en un diagnóstico.',
  aviso:'<strong>Regla clave:</strong> devuelve únicamente JSON válido y conserva las diferencias específicas entre habilidades.',
  requiredKeys:['que_sale','lectura_contextual','sugerencias','conclusion'],
  buildPrompt:buildGoldsteinPromptV0164,
  apply:applyGoldsteinJsonV0164
});
openGoldsteinAI = function(){ openAiFlow('goldstein'); };

/* ---------- Flujo HC con material real y combinación controlada ---------- */
registerAiFlow('hc', {
  titulo:'Organizar o ampliar la historia clínica',
  hint:'La IA distribuirá los materiales pegados o cargados en los campos de HC y construirá un resumen contextual robusto. Nada se incorpora hasta devolver y validar el JSON.',
  aviso:'<strong>Regla clave:</strong> conserva cronología, relaciones, detonantes, manifestaciones, impacto, recursos y vacíos. No inventes ni simplifiques hechos decisivos.',
  requiredKeys:['hc'],
  buildPrompt() {
    const c=ensureCaseV0164(getCurrentCase());
    const material=String(c.hc.materialBruto || '').trim();
    if (!material) throw new Error('No hay materiales de HC preparados. Pegue texto o cargue documentos.');
    const current=aiScrubDeep({motivo:c.hc.motivo,evento:c.hc.evento,familia:c.hc.familia,escolar:c.hc.escolar,sintomas:c.hc.sintomas,recursos:c.hc.recursos,objetivo:c.hc.objetivo,resumen:c.hc.resumen,alertas:c.hc.alertas},c.meta.nombre);
    return `# ROL
Eres un asistente clínico que organiza información de historia clínica infanto-juvenil para padres, docentes y profesionales. Conservas el contenido relevante, lo ordenas y lo redactas de forma comprensible. No diagnosticas, no completas vacíos y no conviertes una historia compleja en una síntesis superficial.

# TAREA
1. Distribuye la información en los campos solicitados sin perder cronología, relaciones familiares, detonantes, contexto escolar y social, manifestaciones emocionales, cognitivas, conductuales o corporales, impacto cotidiano, cambios, respuestas adultas, recursos, apoyos y propósito de la evaluación.
2. Redacta un resumen clínico contextual de extensión flexible —normalmente 160 a 280 palabras, pero puede ser mayor si la complejidad lo exige— que permita comprender globalmente el caso sin consultar toda la HC.
3. Conserva versiones distintas, contradicciones, dudas y datos por confirmar. No elijas una versión.
4. Mantén hechos sensibles o decisivos cuando estén registrados. No los diluyas ni los reemplaces por etiquetas.
5. Identifica alertas únicamente cuando estén expresamente sustentadas.
6. Usa lenguaje profesional accesible. No nombres escuelas psicológicas ni uses "El material sugiere", "se evidencia" o fórmulas mecánicas.

# HC YA REGISTRADA
${JSON.stringify(current,null,2)}

# SALIDA
Devuelve SOLO JSON válido:
{"hc":{"motivo":"","evento":"","familia":"","escolar":"","sintomas":"","recursos":"","objetivo":"","resumen":"uno o dos párrafos suficientemente contextualizados","alertas":[]}}
Alertas permitidas: "Ideacion", "Agresion", "Negligencia", "Abuso reportado", "Conducta de riesgo".

# MATERIALES NUEVOS O DISPERSOS
${aiScrub(material,c.meta.nombre)}`;
  },
  apply(data) {
    const c=ensureCaseV0164(getCurrentCase());
    const h=data.hc || {};
    const mode=document.getElementById('hc_merge_mode')?.value || 'merge';
    const fields=['motivo','evento','familia','escolar','sintomas','recursos','objetivo','resumen'];
    const changed=fields.filter(k=>String(h[k] || '').trim());
    if (!changed.length) throw new Error('El JSON no contiene campos de historia clínica.');
    const ok=confirm(`Se actualizarán ${changed.length} campo(s) de la HC en modo ${mode==='replace'?'REEMPLAZAR':'COMBINAR'}:\n\n${changed.join(', ')}\n\n¿Aplicar al expediente?`);
    if (!ok) throw new Error('Inserción cancelada para revisar la respuesta.');
    fields.forEach(k=>{
      if (!(k in h) || !String(h[k] || '').trim()) return;
      c.hc[k]=mode==='replace'?String(h[k]).trim():mergeTextUnique(c.hc[k],String(h[k]).trim());
    });
    const valid=['Ideacion','Agresion','Negligencia','Abuso reportado','Conducta de riesgo'];
    const alerts=Array.isArray(h.alertas)?h.alertas.filter(x=>valid.includes(x)):[];
    c.hc.alertas=mode==='replace'?alerts:[...new Set([...(c.hc.alertas || []),...alerts])];
    c.reportes.hc={texto:c.hc.resumen,fuente:'ia-manual',actualizado:new Date().toISOString()};
    return `Historia clínica actualizada en ${changed.length} campo(s). Revise el resumen y los datos distribuidos.`;
  }
});

/* ---------- Informes parciales y paquete maestro ---------- */
function buildEvaluationMaterialV0164() {
  syncInputsToState();
  if (typeof syncInformeInputs === 'function') syncInformeInputs();
  const c=ensureCaseV0164(getCurrentCase());
  const areas=allAreas().map(area=>{
    const it=c.interpretations[area.id] || {};
    return {
      area_id:area.id, area:area.nombre, objetivo:area.objetivo_area,
      respuestas:(area.items || []).map(item=>{
        const r=c.responses[item.id] || {};
        return (String(r.respuesta||r.notas||'').trim())?{item:item.texto,respuesta:r.respuesta||'',nota:r.notas||'',profundizar:!!r.profundizar}:null;
      }).filter(Boolean),
      interpretacion:{parrafo_integrado:it.parrafo_integrado||it.texto||'',que_dice:it.que_dice||'',que_sucede:it.que_sucede||'',que_se_sugiere:it.que_se_sugiere||'',estado:it.estado_datos||''}
    };
  });
  let gold=null;
  if (c.goldstein && (c.goldstein.aplicado || Object.keys(c.goldstein.respuestas || {}).length)) {
    const r=computeGoldstein(c.goldstein.respuestas || {});
    gold={resultados:r,respuestas:GOLDSTEIN_ITEMS.map(x=>c.goldstein.respuestas[String(x.num)]?{habilidad:x.texto,grupo:x.grupo,nivel:GOLDSTEIN_NIVELES[c.goldstein.respuestas[String(x.num)]]?.titulo}:null).filter(Boolean),interpretacion:c.goldstein.interp || {}};
  }
  let matrizCA=null;
  if (c.matrizCA && (c.matrizCA.aplicado || (c.modules && c.modules.matrizCA))) {
    matrizCA={
      cognitivas:computeMcaCognitivas(c.matrizCA),
      atencion:computeMcaAtencion(c.matrizCA),
      inteligencias:computeMcaInteligencias(c.matrizCA),
      contexto_estudio_aprendizaje:c.matrizCA.contexto || {},
      interpretacion:c.matrizCA.interp || {}
    };
  }
  return aiScrubDeep({
    alcance:c.scope,
    contexto:aiCaseContext(),
    historia_clinica:c.hc,
    tras:{modo_aplicacion:c.trasMode==='resumido'?'resumido (38 items: ciclos C y D)':'extenso ajustado (59 items; se retiraron items redundantes por area)',areas,patrones:c.patterns,analisis_consolidado:c.consolidated,recomendaciones:c.recommendations},
    goldstein:gold,
    matriz_cognitivo_atencional:matrizCA,
    personalidad:c.personalidad,
    evaluaciones_complementarias:(c.anexos || []).filter(a=>a.incluir),
    informes_previos:{hc:c.reportes.hc,tras:c.reportes.tras,goldstein:c.reportes.goldstein,integrativo:c.informe}
  },c.meta.nombre);
}

registerAiFlow('informe_hc', {
  titulo:'Informe de historia clínica',
  hint:'Construye una lectura contextual comprensible de la HC sin reducirla a una lista de síntomas.',
  aviso:'<strong>Regla clave:</strong> conserva la cronología, el contexto, los cambios, los recursos y los datos por confirmar.',
  requiredKeys:['informe_hc'],
  buildPrompt(){
    const m=buildEvaluationMaterialV0164();
    return `Redacta un informe contextual de historia clínica infanto-juvenil para padres, docentes y profesionales. Integra motivo, cronología, detonantes, familia, escuela, manifestaciones, impacto, cambios, recursos, apoyos, alertas sustentadas y propósito. No diagnostiques, no inventes y no nombres enfoques psicológicos. No uses frases mecánicas. Devuelve SOLO JSON válido: {"informe_hc":"texto comprensible y suficiente, normalmente 250-450 palabras"}.\n\nDATOS:\n${JSON.stringify(m.contexto,null,2)}\n${JSON.stringify(m.historia_clinica,null,2)}`;
  },
  apply(data){
    const c=ensureCaseV0164(getCurrentCase());
    const text=String(data.informe_hc || '').trim(); if(!text) throw new Error('El informe HC está vacío.');
    c.reportes.hc={texto:text,fuente:'ia-manual',actualizado:new Date().toISOString()};
    return 'Informe de historia clínica insertado.';
  }
});

/* Conserva el flujo integrativo robusto de v0.16.3, pero lo presenta en el puente universal. */
AI_FLOWS.informe.titulo='Informe integrativo para entrega';
AI_FLOWS.informe.hint='Reúne HC, TRAS, Goldstein, personalidad y evaluaciones complementarias sin repetir mecánicamente los informes parciales.';

registerAiFlow('paquete_informes', {
  titulo:'Paquete completo de informes',
  hint:'Un solo impulso genera la HC, el TRAS, Goldstein, el perfil descriptivo y el informe integrativo (que incorpora la Matriz Cognitivo-Atencional cuando está aplicada). La aplicación distribuye automáticamente cada producto.',
  aviso:'<strong>Regla clave:</strong> devuelve un solo objeto JSON válido. No omitas áreas del TRAS, no inventes datos y no reduzcas el caso para acortar la respuesta.',
  requiredKeys:['hc','tras','integrativo'],
  buildPrompt(){
    const c=ensureCaseV0164(getCurrentCase());
    const m=buildEvaluationMaterialV0164();
    const goldClass=(c.goldstein && Object.keys(c.goldstein.respuestas || {}).length) ? computeGoldstein(c.goldstein.respuestas).clasificacion.etiqueta : '';
    const goldSchema=(c.scope==='tras'||c.scope==='hc') ? 'null' : JSON.stringify({
      resumen_ejecutivo:'',
      perfil_grupos:[{grupo:'I. Habilidades sociales básicas',nivel_predominante:'',lectura:''}],
      fortalezas_clave:[], condiciones_de_disminucion:[],
      mapa_relaciones:[{desde:'',relacion:'favorece|dificulta|modula',hacia:'',explicacion:''}],
      orientaciones:[], clasificacion:{etiqueta:goldClass,explicacion:''}, limites:''
    });
    const matrizActiva=!!(c.modules && c.modules.matrizCA);
    const matrizSchema=matrizActiva ? JSON.stringify({cognitivas:'',atencion:'',fortalezas:'',correlacion:'',integracion:''}) : 'null';
    return `# ROL
Eres un psicólogo clínico infanto-juvenil que elabora un paquete coordinado de informes a partir de toda la información disponible. Los textos serán revisados por el profesional y leídos por padres, docentes y otros profesionales.

# MARCO INTERNO
Trabaja de manera integrativa, atendiendo experiencia, vínculos, ambivalencias, contexto, funciones posibles, recursos y reorganización. No nombres escuelas, corrientes o enfoques en la salida. No uses "Desde una perspectiva...", "El material sugiere", "se evidencia" ni frases de plantilla.

# PRINCIPIOS DE FIDELIDAD
- No inventes hechos, diagnósticos, causas, puntuaciones o intenciones.
- No disminuyas información importante para acortar el resultado.
- Distingue datos, interpretación prudente, hipótesis y vacíos.
- Conserva contradicciones y diferencias entre fuentes.
- En TRAS incluye TODAS las áreas activas. Si no hay datos, usa la fórmula de no explorada.
- Los tres planos de cada área deben quedar integrados en un párrafo natural, pero también conservarse en sus claves internas.
- Goldstein es descriptivo, no normativo. Conserva exactamente la clasificación calculada por la app y no la omitas. Organiza su resultado sin repetir porcentajes ni reproducir la misma lectura en varias secciones.
- En Goldstein distingue: resumen ejecutivo, seis perfiles de grupo, fortalezas, condiciones que reducen la ejecución, mapa de relaciones, orientaciones, clasificación y límites. La condición «inconscientemente hábil» no puede inferirse solo del autoinforme.
- Si el material incluye "matriz_cognitivo_atencional", intégrala en el informe integrativo como una fuente más (desempeño cognitivo por área, indicadores autoinformados de atención/impulsividad/regulación y fortalezas de inteligencias múltiples), relacionándola con el TRAS, Goldstein e historia clínica. No es una prueba estandarizada ni un diagnóstico de TDAH. Si el esquema de salida "matriz_cognitivo_atencional" no es null, redacta también sus cinco bloques ("cognitivas", "atencion", "fortalezas", "correlacion", "integracion"), cada uno de 60 a 100 palabras (el de "correlacion" puede llegar a 150), a partir de los resultados por área/dominio ya calculados por la aplicación.
- El bloque "correlacion" (correlación académica y contextual) es el eslabón que explica POR QUÉ el desempeño académico es como es, no solo QUÉ perfil cognitivo/atencional tiene. Usa "matriz_cognitivo_atencional.contexto_estudio_aprendizaje" (área académica señalada, hábitos de estudio, cambios en el hogar, cambios en la vida social, apoyos ya en uso, episodios de desconexión/dispersión si se registraron) y crúzalo con los hallazgos cognitivos/atencionales y con la historia clínica y el TRAS. Si hay un área académica señalada, nombra explícitamente qué del perfil (ej. memoria de trabajo, atención sostenida, comprensión verbal) se relaciona con la dificultad en esa área específica, y qué factor contextual la modula (cambio en el hogar, situación social, ausencia de hábitos de estudio). Si hay episodios de desconexión registrados, trátalos como un dato a describir y contrastar (frecuencia, posibles desencadenantes), nunca como confirmación automática de un cuadro atencional: pueden tener otras explicaciones (fatiga, sueño, ansiedad) que ya se nombran en la aproximación diagnóstica si aplica. Cierra con 1-2 frases de argumento evaluativo concreto (ej. "esto sustenta considerar tiempo adicional en evaluaciones escritas" o "sustenta una revisión de formato de evaluación en lectura"), siempre en condicional, nunca como orden vinculante para el colegio. Si no hay contexto_estudio_aprendizaje registrado, deja "correlacion" como cadena vacía en vez de inventar.
- Si "tras.modo_aplicacion" indica modo resumido, es una decisión deliberada del profesional para tiempos cortos con varias baterías, no un vacío de información: mantén el mismo nivel de profundidad interpretativa que en el modo extenso, sin disculparte por la brevedad de los datos ni inflar conclusiones más allá de lo que el material permite.
- El perfil de personalidad es una formulación en formación, no MMPI-A.
- El integrativo no repite literalmente las partes; explica qué sucede como totalidad y contrasta los informes parciales con los datos originales.

# SALIDA ÚNICA
Devuelve SOLO JSON válido, sin backticks:
{
 "hc":{"informe_hc":"texto contextual suficiente","resumen_contextual":"resumen robusto para abrir el informe"},
 "tras":{"areas":[{"area_id":"area_01","estado_datos":"suficiente|parcial|sin_informacion","que_dice":"","que_sucede":"","que_se_sugiere":"","parrafo_integrado":"","hallazgos_clave":[],"banderas":[],"recursos":[]}],"patrones_globales":"","analisis_consolidado":"","recomendaciones":[],"informe_tras":"síntesis transversal que no sustituye las áreas"},
 "goldstein":${goldSchema},
 "matriz_cognitivo_atencional":${matrizSchema},
 "personalidad":{"dimensiones":[{"id":"UNO_DE_ESTOS_9_EXACTOS: conducta|enojo|familia|escolar|animo|social|autoconcepto|proyecto|cambio","nombre":"...","vineta":"..."}],"sintesis":""},
 "integrativo":{"informe_consolidado":"","hallazgos_convergentes":[],"recursos_protectores":[],"vulnerabilidades_contextuales":[],"aproximacion_diagnostica":"","sintesis_para_cuidadores":"","recomendaciones_prioritarias":[],"cierre_integrado":""}
}

# PERSONALIDAD: IDS VALIDOS Y TITULOS
El campo "id" de cada dimension de personalidad DEBE ser exactamente uno de estos 9 valores (en minuscula, sin tildes, tal cual): conducta, enojo, familia, escolar, animo, social, autoconcepto, proyecto, cambio. Cualquier otro valor sera descartado automaticamente por la aplicacion y esa dimension se perdera. Elige entre 3 y 6 de estos 9 segun lo que el material sustente; no inventes IDs nuevos ni traduzcas/renombres los existentes.
El campo "nombre" NO debe ser una etiqueta generica de catalogo (nunca copies literalmente algo como "Regulacion conductual y control de impulsos"): debe ser una frase breve (4 a 8 palabras) escrita para ESTE caso especifico, que resuma lo que el analisis revela en esa dimension particular -su tension central o su forma singular de manejarla-, no la categoria abstracta. Ejemplo de la diferencia: en vez de "Incomodidad social y ansiedad interpersonal", una frase como "Pertenecer sin perder la propia decision" si eso es lo que el material realmente muestra para este adolescente.

# APROXIMACION DIAGNOSTICA (campo "aproximacion_diagnostica" del integrativo)
Redacta un texto de 250 a 450 palabras con esta estructura (basada en el estandar clinico del autor del instrumento):
1. Aproximacion clinica general: hipotesis central, en lenguaje condicional ("permite hablar de", "no todavia de un diagnostico confirmado").
2. Un parrafo por cada dominio con datos suficientes (inatencion, hiperactividad/impulsividad, regulacion emocional, cognicion/funciones ejecutivas, aprendizaje/lenguaje si aplica). Si "matriz_cognitivo_atencional.contexto_estudio_aprendizaje.episodiosDesconexion" tiene contenido, dedica un parrafo aparte a los episodios de desconexion: no los incorpores automaticamente al dominio atencional. Nombra las explicaciones alternativas posibles (fatiga, sueno, ansiedad, saturacion) antes que la hipotesis atencional, y senala que registrar frecuencia/duracion/desencadenantes de forma sistematica es un paso previo a cualquier conclusion.
3. Formulacion diagnostica provisional: sin fijar un diagnostico cerrado, con frases como "hallazgos compatibles con la necesidad de estudiar X, sin criterios suficientes para confirmarlo". Puedes nombrar condiciones especificas (por ejemplo TDA, TDAH, dificultades de aprendizaje, ansiedad) como hipotesis a explorar, nunca como diagnostico ya establecido.
4. Que se necesitaria para confirmar: criterios diagnosticos formales pendientes (duracion, persistencia, multi-contexto, edad de inicio, descarte de explicaciones alternativas).
Si no hay material suficiente de la Matriz Cognitivo-Atencional, Goldstein o el TRAS para sostener ninguna hipotesis, deja el campo como cadena vacia en vez de inventar contenido.

# MATERIAL COMPLETO
${JSON.stringify(m,null,2)}`;
  },
  apply(data){
    const c=ensureCaseV0164(getCurrentCase());
    if (data.hc) {
      const ih=String(data.hc.informe_hc || '').trim();
      const rs=String(data.hc.resumen_contextual || '').trim();
      if (rs) c.hc.resumen=rs;
      if (ih) c.reportes.hc={texto:ih,fuente:'ia-paquete',actualizado:new Date().toISOString()};
    }
    if (data.tras) {
      applyTrasJsonV0164({areas:data.tras.areas || [],patrones_globales:data.tras.patrones_globales || '',analisis_consolidado:data.tras.analisis_consolidado || '',recomendaciones:data.tras.recomendaciones || []});
      c.reportes.tras={texto:String(data.tras.informe_tras || data.tras.analisis_consolidado || '').trim(),fuente:'ia-paquete',actualizado:new Date().toISOString()};
    }
    if (data.goldstein && typeof data.goldstein === 'object') {
      if (typeof applyGoldsteinJsonV0165 === 'function') applyGoldsteinJsonV0165(data.goldstein);
      else applyGoldsteinJsonV0164(data.goldstein);
      c.reportes.goldstein={texto:String(data.goldstein.resumen_ejecutivo || data.goldstein.informe_goldstein || data.goldstein.que_sale || '').trim(),fuente:'ia-paquete',actualizado:new Date().toISOString()};
    }
    if (data.matriz_cognitivo_atencional && typeof data.matriz_cognitivo_atencional === 'object' && (c.modules && c.modules.matrizCA)) {
      const mc=data.matriz_cognitivo_atencional;
      const m=(typeof matrizCaState==='function') ? matrizCaState() : (c.matrizCA=c.matrizCA||{});
      m.interp=m.interp||{};
      ['cognitivas','atencion','fortalezas','correlacion','integracion'].forEach(k=>{ if(String(mc[k]||'').trim()) m.interp[k]=String(mc[k]).trim(); });
      m.fuente='ia-paquete';
      m.aplicado=true;
    }
    if (data.personalidad && Array.isArray(data.personalidad.dimensiones) && data.personalidad.dimensiones.length) {
      const validIds=new Set(typeof PERS_DIMENSIONES!=='undefined'?PERS_DIMENSIONES.map(x=>x.id):data.personalidad.dimensiones.map(x=>x.id));
      c.personalidad={aplicado:true,fuente:'ia-paquete',dimensiones:data.personalidad.dimensiones.filter(x=>validIds.has(x.id)&&String(x.vineta||'').trim()).map(x=>({id:x.id,nombre:x.nombre||x.id,vineta:String(x.vineta).trim()})),sintesis:String(data.personalidad.sintesis || '').trim()};
    }
    if (data.integrativo) {
      const x=data.integrativo;
      c.informe=Object.assign({},c.informe || {},{
        consolidado_integral:String(x.informe_consolidado || '').trim(),
        hallazgos_convergentes:Array.isArray(x.hallazgos_convergentes)?x.hallazgos_convergentes:[],
        recursos_protectores:Array.isArray(x.recursos_protectores)?x.recursos_protectores:[],
        vulnerabilidades_contextuales:Array.isArray(x.vulnerabilidades_contextuales)?x.vulnerabilidades_contextuales:[],
        aproximacion_diagnostica:String(x.aproximacion_diagnostica || '').trim(),
        sintesis_padres:String(x.sintesis_para_cuidadores || '').trim(),
        recomendaciones_prioritarias:Array.isArray(x.recomendaciones_prioritarias)?x.recomendaciones_prioritarias:[],
        cierre:String(x.cierre_integrado || '').trim(), fuente:'ia-paquete'
      });
    }
    return 'Paquete completo insertado. Revise cada informe y el análisis por áreas antes de exportar.';
  }
});

/* ---------- Centro de informes ---------- */
function setReportField(id,value) { const el=document.getElementById(id); if(el && document.activeElement!==el) el.value=value || ''; }
function saveReportProducts() {
  syncInputsToState();
  const c=ensureCaseV0164(getCurrentCase());
  const now=new Date().toISOString();
  c.reportes.hc={texto:String(document.getElementById('reportHcTexto')?.value || c.reportes.hc.texto || '').trim(),fuente:'revision-profesional',actualizado:now};
  c.reportes.tras={texto:String(document.getElementById('reportTrasTexto')?.value || c.reportes.tras.texto || '').trim(),fuente:'revision-profesional',actualizado:now};
  c.reportes.goldstein={texto:String(document.getElementById('reportGoldTexto')?.value || c.reportes.goldstein.texto || '').trim(),fuente:'revision-profesional',actualizado:now};
  if (typeof syncInformeInputs==='function') syncInformeInputs();
  touchCase(c,'Productos de informe actualizados'); persist();
  renderSelectedReportPreview();
  toast('Informes guardados en el expediente.', 'ok');
}

function hydrateReportProducts() {
  const c=ensureCaseV0164(getCurrentCase());
  setReportField('reportHcTexto',c.reportes.hc.texto || c.hc.resumen || '');
  setReportField('reportTrasTexto',c.reportes.tras.texto || c.consolidated || '');
  const gi=c.goldstein && c.goldstein.interp || {};
  setReportField('reportGoldTexto',c.reportes.goldstein.texto || [gi.que_sale,gi.analisis_causal,gi.conclusion].filter(Boolean).join('\n\n'));
}

function renderReportProductVisibility() {
  const c=ensureCaseV0164(getCurrentCase());
  document.querySelectorAll('[data-product="tras"]').forEach(x=>x.classList.toggle('product-disabled',!['tras','ambos'].includes(c.scope)));
  document.querySelectorAll('[data-product="goldstein"]').forEach(x=>x.classList.toggle('product-disabled',!['habilidades','ambos'].includes(c.scope)));
  const badge=document.getElementById('reportScopeBadge');
  if (badge) badge.textContent={tras:'TRAS',habilidades:'Habilidades sociales',ambos:'TRAS + Habilidades',hc:'Solo historia clínica'}[c.scope] || c.scope;
  const select=document.getElementById('reportTypeSelect');
  if (select) {
    [...select.options].forEach(o=>{
      if(o.value==='tras') o.disabled=!['tras','ambos'].includes(c.scope);
      if(o.value==='goldstein') o.disabled=!['habilidades','ambos'].includes(c.scope);
      if(o.value==='matriz_ca') o.disabled=!(c.modules && c.modules.matrizCA);
      if(o.value==='integrativo') o.disabled=c.scope==='hc';
    });
    if (select.selectedOptions[0]?.disabled) select.value=c.scope==='hc'?'hc':(['tras','ambos'].includes(c.scope)?'tras':'goldstein');
  }
}

renderReport = function renderReportV0164() {
  if (typeof renderInformeEditorial==='function') renderInformeEditorial();
  hydrateReportProducts();
  renderReportProductVisibility();
  if (typeof renderAnexos==='function') renderAnexos();
  if (typeof renderPersonalidad==='function') renderPersonalidad();
  if (typeof renderMatrizCA==='function') renderMatrizCA();
  renderSelectedReportPreview();
};

function reportHeaderV0164(title,subtitle,typeLabel,audience) {
  const c=getCurrentCase();
  return `<header class="report-cover"><h1>${escapeHtml(title)}</h1><div class="report-subtitle">${escapeHtml(subtitle)}</div><div class="report-meta"><span class="report-chip gold">${escapeHtml(typeLabel)}</span><span class="report-chip">${escapeHtml(audienceLabelV0164(audience))}</span><span class="report-chip">Caso ${escapeHtml(c.meta.numero || 'No informado')}</span><span class="report-chip">${escapeHtml(c.meta.fecha || 'Fecha no informada')}</span><span class="report-chip">App ${escapeHtml(APP_VERSION)}</span></div></header>`;
}
function audienceLabelV0164(a){return a==='docentes'?'Dirigido al colegio (docentes y psicología escolar)':a==='profesionales'?'Dirigido a profesionales':'Dirigido a padres y cuidadores';}
function commonIdentitySectionsV0164() {
  const c=getCurrentCase(); let n=0;
  return [
    reportSection(++n,'Datos de identificación',`<div class="data-grid"><div class="data-item"><b>Persona evaluada</b>${escapeHtml(c.meta.nombre||'No informado')}</div><div class="data-item"><b>Número de caso</b>${escapeHtml(c.meta.numero||'No informado')}</div><div class="data-item"><b>Edad y sexo/género</b>${escapeHtml(c.meta.edad||'No informado')} · ${escapeHtml(c.meta.sexo||'No informado')}</div><div class="data-item"><b>Fecha</b>${escapeHtml(c.meta.fecha||'No informada')}</div><div class="data-item" style="grid-column:1/-1"><b>Consentimiento u observación</b>${escapeHtml(c.meta.consentimiento||'No informado')}</div></div>`),
    reportSection(++n,'Resumen clínico contextual',`<div class="callout">${textToHtml(c.hc.resumen || [c.hc.motivo,c.hc.evento,c.hc.familia,c.hc.escolar,c.hc.sintomas,c.hc.recursos].filter(Boolean).join(' ')) || '<span>No informado.</span>'}</div>`)
  ];
}
function reportDocumentShellV0164(title,body,subtitle,typeLabel,audience,wordMode) {
  const c=getCurrentCase();
  const css = wordMode ? wordSafeCss(REPORT_CSS) : REPORT_CSS;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · ${escapeHtml(c.meta.numero||'caso')}</title><style>${css}</style></head><body><main class="report-shell">${reportHeaderV0164(title,subtitle,typeLabel,audience)}${body}<div class="signature">${state.evaluator.firmaDataUrl?`<img src="${state.evaluator.firmaDataUrl}" alt="Firma" style="max-height:90px;max-width:260px;display:block;margin-bottom:5px">`:'<div style="height:62px"></div>'}<div class="signature-line"><strong>${escapeHtml(state.evaluator.nombre||'No informado')}</strong><br><span>${escapeHtml(state.evaluator.profesion||'')}${state.evaluator.registro?' · Reg.: '+escapeHtml(state.evaluator.registro):''}</span></div></div><footer class="report-footer">Documento clínico confidencial. Los resultados deben integrarse con entrevista, observación y juicio profesional.</footer></main></body></html>`;
}

function buildHcReportV0164(audience,wordMode) {
  syncInputsToState(); const c=ensureCaseV0164(getCurrentCase()); let n=0; const sec=[];
  sec.push(reportSection(++n,'Datos de identificación',`<div class="data-grid"><div class="data-item"><b>Persona evaluada</b>${escapeHtml(c.meta.nombre||'No informado')}</div><div class="data-item"><b>Edad</b>${escapeHtml(c.meta.edad||'—')}</div><div class="data-item"><b>Sexo/género</b>${escapeHtml(c.meta.sexo||'—')}</div><div class="data-item"><b>Fecha</b>${escapeHtml(c.meta.fecha||'—')}</div></div>`));
  sec.push(reportSection(++n,'Comprensión contextual',`<div class="integration-hero"><h3>Historia clínica integrada</h3><div>${textToHtml(c.reportes.hc.texto || c.hc.resumen) || 'No se ha elaborado el informe contextual.'}</div></div>`));
  const field=(t,v)=>`<div class="data-item"><b>${escapeHtml(t)}</b>${textToHtml(v)||'<span>No informado.</span>'}</div>`;
  sec.push(reportSection(++n,'Información organizada',`<div class="data-grid">${field('Motivo de consulta',c.hc.motivo)}${field('Evento o proceso detonante',c.hc.evento)}${field('Contexto familiar',c.hc.familia)}${field('Contexto escolar',c.hc.escolar)}${field('Manifestaciones e impacto',c.hc.sintomas)}${field('Recursos y apoyos',c.hc.recursos)}${field('Propósito inicial',c.hc.objetivo)}<div class="data-item"><b>Alertas sustentadas</b>${escapeHtml((c.hc.alertas||[]).join(', ')||'Ninguna registrada')}</div></div>`));
  return reportDocumentShellV0164('Informe de historia clínica',''+sec.join(''),'Contexto clínico organizado y comprensible.','Historia clínica',audience,wordMode);
}

function buildTrasReportV0164(audience,wordMode) {
  syncInputsToState(); const c=ensureCaseV0164(getCurrentCase()); let n=0; const sec=[];
  sec.push(...commonIdentitySectionsV0164().map(x=>x.replace(/<span class="section-number">\d+<\/span>/,()=>`<span class="section-number">${++n}</span>`)));
  const areas=allAreas();
  sec.push(reportSection(++n,'Interpretación integrada por áreas',`<div class="area-list">${areas.map(a=>buildAreaReport(c,a,!wordMode)).join('')}</div>`,'Todas las áreas activas permanecen visibles; los vacíos se consignan como no explorados.'));
  sec.push(reportSection(++n,'Resultado transversal del TRAS',`<div class="integration-hero"><h3>Comprensión del instrumento</h3><div>${textToHtml(c.reportes.tras.texto || c.consolidated) || 'No se ha elaborado una síntesis transversal.'}</div></div>${c.patterns?`<div class="callout"><strong>Patrones globales:</strong><br>${textToHtml(c.patterns)}</div>`:''}<h3>Orientaciones</h3>${reportList(c.recommendations,'No se han registrado orientaciones.')}`));
  return reportDocumentShellV0164('Resultado del TRAS',sec.join(''),'Interpretación narrativa y contextual con análisis completo por áreas.','TRAS',audience,wordMode);
}

function buildGoldsteinReportV0164(audience) {
  syncInputsToState(); const c=ensureCaseV0164(getCurrentCase()); let n=0; const sec=[];
  sec.push(...commonIdentitySectionsV0164().map(x=>x.replace(/<span class="section-number">\d+<\/span>/,()=>`<span class="section-number">${++n}</span>`)));
  sec.push(reportSection(++n,'Evaluación de habilidades sociales',goldsteinReportSection(0),'Tamizaje descriptivo de frecuencias; no diagnóstico y sin percentiles normativos.'));
  if(c.reportes.goldstein.texto) sec.push(reportSection(++n,'Síntesis del resultado',`<div class="integration-hero"><h3>Lectura contextual</h3><div>${textToHtml(c.reportes.goldstein.texto)}</div></div>`));
  return reportDocumentShellV0164('Resultado de habilidades sociales',sec.join(''),'Perfil de recursos sociales y condiciones de ejecución.','Goldstein',audience);
}

function buildMatrizCaReportV0164(audience,wordMode) {
  syncInputsToState(); const c=ensureCaseV0164(getCurrentCase()); let n=0; const sec=[];
  sec.push(...commonIdentitySectionsV0164().map(x=>x.replace(/<span class="section-number">\d+<\/span>/,()=>`<span class="section-number">${++n}</span>`)));
  sec.push(reportSection(++n,'Matriz Cognitivo-Atencional',matrizCaReportSection(audience!=='familias'),'Instrumento de exploración y organización de hallazgos; los indicadores de atención/impulsividad son autoinformados y no equivalen a un diagnóstico de TDAH.'));
  return reportDocumentShellV0164('Matriz Cognitivo-Atencional',sec.join(''),'Cognitivo, atención/impulsividad/regulación y fortalezas/inteligencias múltiples.','Matriz CA',audience,wordMode);
}

/* Informe de lectura rapida: deliberadamente NO es un resumen proporcional
   de todo (no recorta cada seccion un poco); se queda solo con lo que ya
   se identifico como mas util para una lectura de 2 minutos -sintesis
   integradora, hallazgos convergentes y recomendaciones prioritarias- y
   remite al informe integrativo completo para el desglose por areas,
   tablas y aproximacion diagnostica. */
function buildResumenReportV0164(audience,wordMode) {
  syncInputsToState(); syncInformeInputs(); const c=ensureCaseV0164(getCurrentCase()); const inf=informeState(c); let n=0; const sec=[];
  sec.push(...commonIdentitySectionsV0164().map(x=>x.replace(/<span class="section-number">\d+<\/span>/,()=>`<span class="section-number">${++n}</span>`)));
  const consolidado=String(inf.consolidado_integral||c.consolidated||'').trim();
  sec.push(reportSection(++n,'Comprensión del caso en dos minutos',
    consolidado ? `<div class="integration-hero">${textToHtml(consolidado)}</div>` : '<div class="no-data">No se ha elaborado todavía una síntesis integrada de este caso.</div>',
    'Versión de lectura rápida: reúne solo la síntesis, los hallazgos convergentes y las recomendaciones prioritarias. El desglose completo por áreas del TRAS, las tablas de Goldstein/Matriz y la aproximación diagnóstica están en el informe integrativo.'));
  sec.push(reportSection(++n,'Hallazgos convergentes', reportList(inf.hallazgos_convergentes,'No se ha elaborado una lectura de convergencias entre las fuentes aplicadas.')));
  sec.push(reportSection(++n,'Recomendaciones prioritarias', reportList(inf.recomendaciones_prioritarias,'No se han registrado recomendaciones prioritarias.')));
  sec.push(`<div class="method-note" style="margin:18px 0">Este es un resumen deliberadamente breve. Para el análisis completo (desglose por las 19 áreas del TRAS, resultados de habilidades sociales y de la Matriz Cognitivo-Atencional, y la aproximación diagnóstica cuando aplica) exporte el "Informe integrativo" desde el Centro de informes.</div>`);
  return reportDocumentShellV0164('Lectura rápida del caso',sec.join(''),'Síntesis, hallazgos convergentes y recomendaciones — sin desglose por áreas ni tablas.','Resumen',audience,wordMode);
}

function selectedReportType() { return document.getElementById('reportTypeSelect')?.value || 'integrativo'; }
function selectedAudience() { return document.getElementById('reportAudienceSelect')?.value || 'familias'; }
function getSelectedReportHtml(type,audience,wordMode) {
  type=type||selectedReportType(); audience=audience||selectedAudience();
  if(type==='hc') return buildHcReportV0164(audience,wordMode);
  if(type==='tras') return buildTrasReportV0164(audience,wordMode);
  if(type==='goldstein') return buildGoldsteinReportV0164(audience,wordMode);
  if(type==='matriz_ca') return buildMatrizCaReportV0164(audience,wordMode);
  if(type==='resumen') return buildResumenReportV0164(audience,wordMode);
  if(getCurrentCase().scope==='hc') return buildHcReportV0164(audience,wordMode);
  return buildReportHtml(wordMode?'word':'html', audience);
}
function renderSelectedReportPreview() {
  const host=document.getElementById('reportPreview'); if(!host) return;
  try { host.innerHTML=getSelectedReportHtml().replace(/<!DOCTYPE html>|<html[^>]*>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<\/html>/g,''); }
  catch(e){ host.innerHTML=`<div class="help">No se pudo construir la vista previa: ${escapeHtml(e.message)}</div>`; }
}
function exportSelectedReport() {
  saveReportProducts();
  const c=getCurrentCase(); const type=selectedReportType(); const format=document.getElementById('reportFormatSelect')?.value || 'html'; const base=caseFileSlug(c)+'_'+type;
  if(format==='xlsx'){ exportCaseXlsx(); return; }
  if(format==='json'){
    const payload={tipo:type,destinatario:selectedAudience(),caso:{id:c.id,meta:c.meta},hc:type==='hc'?c.hc:undefined,tras:type==='tras'?{responses:c.responses,interpretations:c.interpretations,patterns:c.patterns,consolidated:c.consolidated,recommendations:c.recommendations}:undefined,goldstein:type==='goldstein'?c.goldstein:undefined,matriz_cognitivo_atencional:type==='matriz_ca'?c.matrizCA:undefined,integrativo:type==='integrativo'?{informe:c.informe,personalidad:c.personalidad,matrizCA:c.matrizCA,anexos:c.anexos}:undefined,exportado:new Date().toISOString(),app:APP_VERSION};
    downloadFile(base+'.json',JSON.stringify(payload,null,2),'application/json'); toast('Informe exportado en JSON.','ok'); return;
  }
  const html=getSelectedReportHtml(type,selectedAudience(),format==='doc');
  if(format==='pdf'){ printHtmlAsPdf(html); return; }
  if(format==='doc') downloadFile(base+'.doc',html,'application/msword'); else downloadFile(base+'.html',html);
  toast('Informe exportado correctamente.','ok');
}

/* ---------- Ajustes finales de render e hidratación ---------- */
const V0164_BASE_HYDRATE = hydrateInputs;
hydrateInputs = function hydrateInputsV0164() {
  V0164_BASE_HYDRATE();
  ensureCaseV0164(getCurrentCase());
  hydrateHcSources();
  hydrateReportProducts();
  renderReportProductVisibility();
};

const V0164_BASE_SYNC = syncInputsToState;
syncInputsToState = function syncInputsToStateV0164() {
  V0164_BASE_SYNC();
  const c=ensureCaseV0164(getCurrentCase());
  const src=document.getElementById('hc_source_text');
  if(src && String(src.value||'').trim()) c.hc.materialBruto=String(src.value).trim().slice(0,220000);
  const rh=document.getElementById('reportHcTexto'); if(rh) c.reportes.hc.texto=rh.value;
  const rt=document.getElementById('reportTrasTexto'); if(rt) c.reportes.tras.texto=rt.value;
  const rg=document.getElementById('reportGoldTexto'); if(rg) c.reportes.goldstein.texto=rg.value;
};

/* Goldstein termina directamente en Informes. Personalidad se trabaja dentro del centro. */

/* El demo también recibe el esquema nuevo después de cargarse. */
const V0164_BASE_DEMO = loadDemoCase;
loadDemoCase = function loadDemoCaseV0164(){
  V0164_BASE_DEMO();
  const c=ensureCaseV0164(getCurrentCase());
  c.workflow={lastStep:2,completed:[2,3,4,5,6,7,9],scopeSelected:true};
  c.reportes.hc.texto=c.hc.resumen;
  c.reportes.tras.texto=c.consolidated;
  const gi=c.goldstein.interp||{}; c.reportes.goldstein.texto=[gi.que_sale,gi.analisis_causal,gi.conclusion].filter(Boolean).join('\n\n');
  persist(); renderTopNav(); renderReport();
};

/* Cerrar menú al elegir un caso. */
const V0164_BASE_SWITCH_CASE = switchCase;
switchCase = function switchCaseV0164(id){ V0164_BASE_SWITCH_CASE(id); toggleMenuDrawer(false); renderTopNav(); };

/* Esc cierra también el menú y el puente universal. */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    const drawer=document.getElementById('menuDrawer'); if(drawer?.classList.contains('open')) toggleMenuDrawer(false);
    const modal=document.getElementById('aiFlowModal'); if(modal?.classList.contains('show')) closeAiWizard();
  }
});

/* ============================================================
   TRAS · v0.16.28
   Persistencia explicita de modalidad TRAS, importacion segura de
   expedientes legados y selector de configuracion mas claro.
   ============================================================ */

const V01628_VALID_TRAS_MODES = ['extenso', 'resumido'];

function v01628ScopeUsesTras(scope) {
  return scope === 'tras' || scope === 'ambos';
}

function v01628ModeLabel(mode) {
  return mode === 'resumido' ? 'Resumida · 38 ítems' : 'Extensa · 59 ítems';
}

function v01628HasAnswer(value) {
  if (value == null) return false;
  if (typeof value === 'string') return !!value.trim();
  if (typeof value === 'object') return !!String(value.respuesta || '').trim();
  return !!String(value).trim();
}

/* Inferencia conservadora para JSON antiguos: si hay respuestas A/B, el caso
   no pudo haberse aplicado con el modo resumido actual (que solo usa C+D).
   En cualquier otra situacion ambigua se pregunta al profesional. */
function v01628InferLegacyTrasMode(raw) {
  if (!raw) return null;
  if (V01628_VALID_TRAS_MODES.includes(raw.trasMode) && raw.trasModeConfigured !== false) {
    return { mode: raw.trasMode, reason: 'explicit' };
  }
  const responses = raw.responses && typeof raw.responses === 'object' ? raw.responses : {};
  const answeredCore = Object.entries(responses)
    .filter(([id, value]) => /^area_\d{2}_[A-D]$/.test(id) && v01628HasAnswer(value));
  if (answeredCore.some(([id]) => /_[AB]$/.test(id))) {
    return { mode: 'extenso', reason: 'answered_ab' };
  }
  if (answeredCore.length > 38) {
    return { mode: 'extenso', reason: 'more_than_38' };
  }
  return null;
}

function v01628HiddenAnsweredItems(c, nextMode) {
  if (!c || !c.responses) return [];
  return DATASET.areas_nucleo.flatMap(area => area.items).filter(it => {
    const visible = nextMode === 'resumido'
      ? TRAS_RESUMIDO_CICLOS.includes(it.ciclo)
      : !TRAS_EXTENSO_EXCLUIDOS.includes(it.id);
    return !visible && v01628HasAnswer(c.responses[it.id]);
  });
}

/* Selector explicito: evita que la modalidad aparezca como si fuera un modulo
   adicional y deja visibles simultaneamente Extensa y Resumida. */
function setTrasModeV01628(mode) {
  if (!V01628_VALID_TRAS_MODES.includes(mode)) return;
  const c = ensureCaseV0164(getCurrentCase());
  if (!c) return;

  const wasConfigured = c.trasModeConfigured === true;
  const previous = c.trasMode;
  if (previous !== mode) {
    const hidden = v01628HiddenAnsweredItems(c, mode);
    if (hidden.length) {
      const ok = confirm(
        `Al cambiar a TRAS ${mode}, ${hidden.length} respuesta(s) ya registradas ` +
        `dejarán de mostrarse en la entrevista lineal. No se borrarán y seguirán ` +
        `disponibles en Revisión e Informe.\n\n¿Continuar?`
      );
      if (!ok) return;
    }
  }

  c.trasMode = mode;
  c.trasModeConfigured = true;
  currentInterviewIndex = 0;
  touchCase(c, wasConfigured
    ? `Modalidad TRAS cambiada a ${mode}`
    : `Modalidad TRAS confirmada: ${mode}`);
  persist();
  renderScopeSelector();
  renderTopNav();
  if (currentStep === 5 && typeof renderInterview === 'function') renderInterview();
  if (currentStep === 6 && typeof renderReview === 'function') renderReview();
  if (currentStep === 7 && typeof renderInterpretation === 'function') renderInterpretation();
  if (currentStep === 8 && typeof renderReport === 'function') renderReport();
  toast(`TRAS configurado en modalidad ${mode} (${mode === 'resumido' ? '38' : '59'} ítems).`, 'ok', 3600);
}

/* Compatibilidad con botones o llamadas de versiones anteriores. */
toggleTrasMode = function toggleTrasModeV01628() {
  const c = ensureCaseV0164(getCurrentCase());
  setTrasModeV01628(c && c.trasMode === 'resumido' ? 'extenso' : 'resumido');
};

renderScopeSelector = function renderScopeSelectorV01628() {
  const box = document.getElementById('scopeSelector');
  if (!box) return;
  box.classList.add('scope-selector-v01628');

  const c = ensureCaseV0164(getCurrentCase());
  const scope = caseScope();
  const mcaOn = !!(c.modules && c.modules.matrizCA);
  const usesTras = v01628ScopeUsesTras(scope);
  const configured = c.trasModeConfigured === true;
  const currentMode = c.trasMode === 'resumido' ? 'resumido' : 'extenso';

  const scopeOpt = (value, label, hint) => `
    <button class="scope-opt ${scope === value ? 'active' : ''}" onclick="setScope('${value}')" aria-pressed="${scope === value}">
      <strong>${label}</strong><span>${hint}</span>
    </button>`;

  const modeOpt = (mode, label, count, hint) => `
    <button class="scope-mode-opt ${configured && currentMode === mode ? 'active' : ''}"
      onclick="setTrasModeV01628('${mode}')" aria-pressed="${configured && currentMode === mode}">
      <strong>${configured && currentMode === mode ? '✓ ' : ''}${label}</strong>
      <span>${count} · ${hint}</span>
    </button>`;

  box.innerHTML = `
    <div class="scope-subsection">
      <div class="scope-subtitle">Instrumentos principales</div>
      <div class="scope-grid">
        ${scopeOpt('tras', 'TRAS', 'HC + instrumento narrativo')}
        ${scopeOpt('habilidades', 'Habilidades', 'HC + Goldstein')}
        ${scopeOpt('ambos', 'Ambos', 'TRAS seguido de Goldstein')}
        ${scopeOpt('hc', 'Solo HC', 'Organización clínica e informe')}
      </div>
    </div>

    <div class="scope-subsection">
      <div class="scope-subtitle">Módulo adicional</div>
      <button class="scope-opt scope-opt-wide scope-opt-add ${mcaOn ? 'active' : ''}"
        onclick="toggleMatrizCaModule()" aria-pressed="${mcaOn}">
        <strong>${mcaOn ? '✓ ' : '+ '}Matriz Cognitivo-Atencional</strong>
        <span>Se incorpora como paso adicional dentro del mismo expediente</span>
      </button>
    </div>

    <div class="scope-subsection scope-mode-section ${usesTras ? '' : 'is-disabled'}">
      <div class="scope-subtitle-row">
        <div class="scope-subtitle">Modalidad del TRAS</div>
        ${usesTras ? `<span class="scope-mode-badge">${configured ? v01628ModeLabel(currentMode) : 'Sin confirmar'}</span>` : ''}
      </div>
      ${usesTras ? `
        <div class="tras-mode-grid">
          ${modeOpt('extenso', 'Extensa', '59 ítems', 'mayor amplitud narrativa')}
          ${modeOpt('resumido', 'Resumida', '38 ítems', 'C + D por área')}
        </div>
        ${configured ? '' : `
          <div class="legacy-mode-warning" role="alert">
            <strong>Expediente legado:</strong> este caso no guardó la modalidad TRAS. Elija Extensa o Resumida antes de continuar la aplicación.
          </div>`}
      ` : `
        <div class="scope-mode-disabled">La modalidad se habilita cuando el alcance incluye TRAS.</div>
      `}
    </div>`;
};


/* Evita aplicar o interpretar un TRAS legado mientras su modalidad siga sin
   confirmar. Los datos continúan accesibles; solo se bloquea el recorrido que
   depende de saber qué conjunto de ítems corresponde. */
const V01628_GO_STEP_BASE = goStep;
goStep = function goStepV01628(n) {
  const c = typeof getCurrentCase === 'function' ? ensureCaseV0164(getCurrentCase()) : null;
  if (c && v01628ScopeUsesTras(c.scope) && c.trasModeConfigured !== true && [5,6,7].includes(Number(n))) {
    // Mantiene una pantalla clínica válida (Caso actual) en lugar de dejar el
    // contenido sin sección activa cuando un expediente legado arrancaba en
    // Entrevista/Revisión/Interpretación.
    V01628_GO_STEP_BASE(2);
    renderScopeSelector();
    if (typeof toggleMenuDrawer === 'function') toggleMenuDrawer(true);
    toast('Antes de continuar con TRAS, confirme si este expediente usa la modalidad Extensa (59) o Resumida (38).', 'warn', 5600);
    return;
  }
  return V01628_GO_STEP_BASE(n);
};

/* ---------- Importación segura de JSON legados ---------- */
let V01628_PENDING_CASE_IMPORT = null;

function v01628EnsureImportModeModal() {
  if (document.getElementById('legacyTrasModeModal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'legacyTrasModeModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Definir modalidad TRAS del expediente importado');
  modal.innerHTML = `
    <div class="modal-panel legacy-tras-modal-panel">
      <div class="ai-kicker">COMPATIBILIDAD DE EXPEDIENTE</div>
      <h2>Este JSON no indica qué modalidad del TRAS se aplicará</h2>
      <p id="legacyTrasModeMessage" class="legacy-tras-modal-copy"></p>
      <div class="legacy-tras-choice-grid">
        <button class="legacy-tras-choice" onclick="v01628ResolveLegacyImport('extenso')">
          <strong>TRAS Extensa</strong>
          <span>59 ítems · mayor amplitud narrativa</span>
        </button>
        <button class="legacy-tras-choice" onclick="v01628ResolveLegacyImport('resumido')">
          <strong>TRAS Resumida</strong>
          <span>38 ítems · ciclos C + D por área</span>
        </button>
      </div>
      <div class="legacy-tras-note">La elección quedará guardada dentro del expediente y en sus próximas exportaciones JSON. No modifica ni elimina respuestas ya existentes.</div>
      <div class="actions" style="margin-top:16px">
        <button class="btn secondary" onclick="v01628CancelLegacyImport()">Cancelar importación</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function v01628AskLegacyImportMode(raw, fileName, inputEl) {
  v01628EnsureImportModeModal();
  V01628_PENDING_CASE_IMPORT = { raw, fileName, inputEl };
  const msg = document.getElementById('legacyTrasModeMessage');
  if (msg) msg.innerHTML = `El archivo <strong>${escapeHtml(fileName || 'importado')}</strong> contiene un caso con TRAS, pero fue creado sin guardar si corresponde a la versión Extensa o Resumida. Seleccione la modalidad clínica que desea conservar para este expediente.`;
  toggleModal('legacyTrasModeModal', true);
}

function v01628ResolveLegacyImport(mode) {
  if (!V01628_PENDING_CASE_IMPORT || !V01628_VALID_TRAS_MODES.includes(mode)) return;
  const pending = V01628_PENDING_CASE_IMPORT;
  V01628_PENDING_CASE_IMPORT = null;
  toggleModal('legacyTrasModeModal', false);
  pending.raw.trasMode = mode;
  pending.raw.trasModeConfigured = true;
  v01628CommitCaseImport(pending.raw, pending.inputEl, `Modalidad TRAS definida durante importación: ${mode}`);
}

function v01628CancelLegacyImport() {
  const pending = V01628_PENDING_CASE_IMPORT;
  V01628_PENDING_CASE_IMPORT = null;
  toggleModal('legacyTrasModeModal', false);
  if (pending && pending.inputEl) pending.inputEl.value = '';
  toast('Importación cancelada. No se modificó ningún expediente.', 'info');
}

function v01628CommitCaseImport(raw, inputEl, migrationNote) {
  try {
    const incoming = normalizeCase(raw);
    if (migrationNote) touchCase(incoming, migrationNote);

    let target = state.cases.find(c => c.id === incoming.id) || findDuplicateCase(incoming, null);
    if (target) {
      target = ensureCaseV0164(target);
      const modeConflict = v01628ScopeUsesTras(incoming.scope) &&
        incoming.trasModeConfigured === true && target.trasModeConfigured === true &&
        incoming.trasMode !== target.trasMode;
      if (modeConflict) {
        const hasResponses = Object.values(target.responses || {}).some(v01628HasAnswer) || Object.values(incoming.responses || {}).some(v01628HasAnswer);
        const ok = confirm(
          `El expediente existente usa TRAS ${target.trasMode} y el archivo importado usa TRAS ${incoming.trasMode}.` +
          (hasResponses ? `\n\nHay respuestas registradas. Cambiar la modalidad puede ocultar algunos ítems en la entrevista lineal, pero no los borrará.` : '') +
          `\n\nAceptar = conservar la modalidad del archivo importado (${incoming.trasMode}).\nCancelar = conservar la modalidad actual (${target.trasMode}).`
        );
        if (!ok) {
          incoming.trasMode = target.trasMode;
          incoming.trasModeConfigured = true;
          touchCase(incoming, `Importación conservó modalidad TRAS existente: ${target.trasMode}`);
        }
      }
      mergeCaseRecords(target, incoming, 'Caso actualizado desde archivo JSON');
      state.currentCaseId = target.id;
      toast('Caso actualizado en su expediente existente. Modalidad TRAS preservada.', 'ok', 5200);
    } else {
      // Mantener el id exportado cuando no colisiona: futuras importaciones reconocerán el mismo expediente.
      if (state.cases.some(c => c.id === incoming.id)) incoming.id = 'case_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
      touchCase(incoming, 'Caso importado');
      state.cases.unshift(incoming);
      state.currentCaseId = incoming.id;
      toast('Caso nuevo importado correctamente.', 'ok');
    }

    state.cases = dedupeCasesAutomatic(state.cases);
    sortCasesByRecent();
    persist();
    hydrateInputs();
    renderCaseList();
    renderTopNav();
    renderScopeSelector();
    goStep(2);
  } catch (e) {
    toast('No se pudo importar el caso: ' + e.message, 'danger', 5600);
  } finally {
    if (inputEl) inputEl.value = '';
  }
}

importCaseJson = function importCaseJsonV01628(event) {
  const inputEl = event && event.target;
  const file = inputEl && inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result || ''));
      if (raw && raw.state && Array.isArray(raw.state.cases)) {
        throw new Error('Este archivo es un respaldo de toda la app. Use “Importar app y combinar”.');
      }

      const scope = ['tras','habilidades','ambos','hc'].includes(raw.scope) ? raw.scope : 'ambos';
      const explicit = V01628_VALID_TRAS_MODES.includes(raw.trasMode);
      const confirmed = explicit && raw.trasModeConfigured !== false;
      if (confirmed) raw.trasModeConfigured = true;

      if (v01628ScopeUsesTras(scope) && !confirmed) {
        const inferred = v01628InferLegacyTrasMode(raw);
        if (inferred && inferred.mode === 'extenso') {
          raw.trasMode = 'extenso';
          raw.trasModeConfigured = true;
          const reason = inferred.reason === 'answered_ab'
            ? 'se detectaron respuestas de ciclos A/B, incompatibles con la modalidad resumida actual'
            : 'se detectaron más de 38 respuestas núcleo';
          v01628CommitCaseImport(raw, inputEl, `Modalidad TRAS inferida como extensa: ${reason}`);
          toast('JSON legado: se reconoció TRAS Extensa por las respuestas existentes.', 'info', 5200);
          return;
        }
        v01628AskLegacyImportMode(raw, file.name, inputEl);
        return;
      }

      v01628CommitCaseImport(raw, inputEl, confirmed ? '' : 'Caso importado sin TRAS activo; modalidad pendiente si se activa posteriormente');
    } catch (e) {
      if (inputEl) inputEl.value = '';
      toast('No se pudo importar el caso: ' + e.message, 'danger', 5600);
    }
  };
  reader.onerror = () => {
    if (inputEl) inputEl.value = '';
    toast('No se pudo leer el archivo JSON.', 'danger');
  };
  reader.readAsText(file, 'utf-8');
};

/* La ventana de Nuevo caso ya tenía la modalidad, pero aparecía después de
   los botones que crean el expediente. Se mueve arriba para que la decisión
   sea visible antes de elegir TRAS/Ambos. */
function v01628EnhanceNewCaseWizard() {
  const panel = document.querySelector('#newCaseModal .scope-wizard-panel');
  const grid = panel && panel.querySelector('.scope-wizard-grid');
  if (!panel || !grid) return;
  const extras = [...panel.querySelectorAll('.scope-wizard-extra')];
  const modeBlock = extras.find(el => /Aplicación del TRAS/i.test(el.textContent || ''));
  if (modeBlock && grid.previousElementSibling !== modeBlock) {
    modeBlock.classList.add('tras-mode-wizard-block');
    panel.insertBefore(modeBlock, grid);
  }
}

/* Marca expedientes legados que entran desde localStorage o respaldos completos.
   No se asigna silenciosamente una modalidad; el selector lateral lo hará visible. */
function v01628AuditLegacyCases() {
  if (!state || !Array.isArray(state.cases)) return;
  const pending = state.cases.filter(c => v01628ScopeUsesTras(c.scope) && c.trasModeConfigured !== true);
  if (pending.length) {
    toast(`${pending.length} expediente(s) antiguo(s) requieren confirmar modalidad TRAS (Extensa/Resumida).`, 'warn', 6500);
  }
}

// initApp se define después de este archivo, por eso la auditoría se programa
// para ejecutarse una vez terminada la carga inicial.
window.addEventListener('DOMContentLoaded', () => {
  v01628EnhanceNewCaseWizard();
  setTimeout(() => {
    if (window.__trasBooted) {
      renderScopeSelector();
      v01628AuditLegacyCases();
    }
  }, 500);
});

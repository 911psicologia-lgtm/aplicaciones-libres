/* ============================================================
   TRAS · interview.js
   Paso 4 (modulos), paso 5 (entrevista guiada) y paso 6 (revision).
   ============================================================ */

function setInterviewMode(mode) {
  state.ui = state.ui || {};
  state.ui.interviewMode = mode === 'single' ? 'single' : 'all';
  persist();
  renderInterview();
}

function renderModules() {
  const c = getCurrentCase();
  const div = document.getElementById('moduleContainer');
  div.innerHTML = `
    <div class="help" style="margin-bottom:12px">Los items 20 y 49 estan marcados como atencion clinica. Las areas 17 y 18 se tratan como sensibles y pueden aplicarse, posponerse u omitirse del informe.</div>
    <div class="three-col">
      ${DATASET.areas_complementarias.map(a => `
        <div class="area-block">
          <div class="inline" style="justify-content:space-between">
            <strong>${escapeHtml(a.nombre)}</strong>
            <label style="margin:0"><input id="mod_${a.id}" type="checkbox" ${c.modules.complementarios[a.id]?'checked':''} onchange="autosave()"/> Aplicar</label>
          </div>
          <p class="small">${escapeHtml(a.objetivo_area || 'Subescala complementaria del TRAS.')}</p>
          <div>${a.items.map(i=>`<span class="pill">${i.ciclo}: ${escapeHtml(i.texto)}</span>`).join('')}</div>
        </div>`).join('')}
    </div>
    <div class="two-col" style="margin-top:12px">
      <div class="area-block">
        <strong>Area sensible 17 · Interes y desarrollo sexual</strong>
        <label for="sens_area_17" class="small" style="margin-top:8px">Tratamiento</label>
        <select id="sens_area_17" onchange="autosave()">
          <option value="aplicar" ${c.modules.sensibles.area_17==='aplicar'?'selected':''}>Aplicar completa</option>
          <option value="posponer" ${c.modules.sensibles.area_17==='posponer'?'selected':''}>Posponer</option>
          <option value="omitir" ${c.modules.sensibles.area_17==='omitir'?'selected':''}>Omitir del informe</option>
        </select>
      </div>
      <div class="area-block">
        <strong>Area sensible 18 · Identidad sexual / proyeccion familiar</strong>
        <label for="sens_area_18" class="small" style="margin-top:8px">Tratamiento</label>
        <select id="sens_area_18" onchange="autosave()">
          <option value="aplicar" ${c.modules.sensibles.area_18==='aplicar'?'selected':''}>Aplicar completa</option>
          <option value="posponer" ${c.modules.sensibles.area_18==='posponer'?'selected':''}>Posponer</option>
          <option value="omitir" ${c.modules.sensibles.area_18==='omitir'?'selected':''}>Omitir del informe</option>
        </select>
      </div>
    </div>`;
}

function renderInterviewCard(item, compact=false) {
  const c = getCurrentCase();
  const res = itemState(item.id);
  const areaSensitiveAction = item.areaId === 'area_17' ? c.modules.sensibles.area_17
                            : item.areaId === 'area_18' ? c.modules.sensibles.area_18 : 'aplicar';
  const warning = item.areaSensible ? `<div class="badge warn">Area sensible: ${areaSensitiveAction}</div>` : '';
  const alertMark = item.alerta_clinica ? `<div class="badge danger">Item de atencion clinica</div>` : '';
  const areaActionNote = item.areaSensible && areaSensitiveAction !== 'aplicar'
    ? `<div class="help" style="margin-top:10px"><strong>Nota:</strong> esta area quedo marcada como <strong>${escapeHtml(areaSensitiveAction)}</strong>. Puedes registrar, adaptar o dejar constancia clinica segun el caso.</div>` : '';
  return `
    <div class="item-box ${compact ? 'compact' : ''}">
      <div class="item-head">
        <div>
          <div class="item-meta">
            <span class="badge info">${item.num_test ? 'Item '+item.num_test : 'Subescala'}</span>
            <span class="badge info">${escapeHtml(item.areaNombre)}</span>
            <span class="badge info">Ciclo ${escapeHtml(item.ciclo)}</span>
            ${warning}
            ${alertMark}
          </div>
          <div class="item-text">${escapeHtml(item.texto)}</div>
        </div>
      </div>
      ${areaActionNote}
      <div class="help" style="margin-top:12px">
        <strong>Objetivo del item:</strong> ${escapeHtml(item.objetivo_item || 'No informado.')}<br>
        <strong>Pistas:</strong> ${escapeHtml(item.pistas || 'No informadas.')}
      </div>
      <label for="resp_${item.id}" style="margin-top:12px">Respuesta literal</label>
      <textarea id="resp_${item.id}" data-response-key="${item.id}" data-field="respuesta" oninput="autosave()" data-voice-enhanced="true">${escapeHtml(res.respuesta || '')}</textarea>
      <div class="voice-toolbar">
        <button type="button" class="voice-btn" data-target="resp_${item.id}" aria-pressed="false" aria-label="Dictar respuesta" onclick="startVoiceForField('resp_${item.id}')">&#127908; Dictar</button>
        <span class="voice-status" id="voice_status_resp_${item.id}">${voiceSupported() ? 'Listo para dictado.' : 'Dictado no disponible en este navegador.'}</span>
      </div>
      <div class="inline" style="margin-top:10px">
        <label style="margin:0"><input type="checkbox" data-response-key="${item.id}" data-field="profundizar" ${res.profundizar ? 'checked' : ''} onchange="toggleDeepQuestion('${item.id}')"/> Profundizar</label>
      </div>
      <div id="deep_${item.id}" class="help ${res.profundizar ? '' : 'hidden'}" style="margin-top:8px">
        <strong>Pregunta sugerida:</strong> ${escapeHtml(item.profundizacion || 'No registrada para este item.')}
      </div>
      <label for="note_${item.id}" style="margin-top:12px">Nota del evaluador</label>
      <textarea id="note_${item.id}" data-response-key="${item.id}" data-field="notas" oninput="autosave()" data-voice-enhanced="true" style="min-height:80px">${escapeHtml(res.notas || '')}</textarea>
      <div class="voice-toolbar">
        <button type="button" class="voice-btn" data-target="note_${item.id}" aria-pressed="false" aria-label="Dictar nota" onclick="startVoiceForField('note_${item.id}')">&#127908; Dictar nota</button>
        <span class="voice-status" id="voice_status_note_${item.id}">${voiceSupported() ? 'Listo para dictado.' : 'Dictado no disponible en este navegador.'}</span>
      </div>
    </div>`;
}

function toggleDeepQuestion(itemId) {
  const r = itemState(itemId);
  const cb = document.querySelector(`input[data-response-key="${itemId}"][data-field="profundizar"]`);
  if (cb) r.profundizar = cb.checked;
  const deep = document.getElementById('deep_' + itemId);
  if (deep) deep.classList.toggle('hidden', !r.profundizar);
  autosave();
}

function renderInterview() {
  const items = flattenedItems();
  if (currentInterviewIndex >= items.length) currentInterviewIndex = Math.max(0, items.length - 1);
  const wrap = document.getElementById('interviewContainer');
  const counter = document.getElementById('interviewCounter');
  const answered = items.filter(i => (itemState(i.id).respuesta || '').trim()).length;
  counter.textContent = `${items.length ? currentInterviewIndex + 1 : 0} / ${items.length} · respondidos ${answered}`;
  const mode = (state.ui && state.ui.interviewMode) || 'all';
  const singleBtn = document.getElementById('mode_single');
  const allBtn = document.getElementById('mode_all');
  if (singleBtn) singleBtn.classList.toggle('active', mode === 'single');
  if (allBtn) allBtn.classList.toggle('active', mode !== 'single');
  if (!items.length) { wrap.innerHTML = '<div class="help">No hay items para mostrar.</div>'; return; }
  if (mode === 'single') {
    wrap.innerHTML = renderInterviewCard(items[currentInterviewIndex], false);
  } else {
    wrap.innerHTML = `<div class="interview-stack">${items.map(item => renderInterviewCard(item, true)).join('')}</div>`;
  }
  enhanceVoiceInputs(wrap);
}

function prevItem() { if (currentInterviewIndex>0) currentInterviewIndex--; renderInterview(); }
function nextItem() {
  const total = flattenedItems().length;
  if (currentInterviewIndex < total - 1) { currentInterviewIndex++; renderInterview(); return; }
  goStep(6); renderReview();
}

function renderReview() {
  const c = getCurrentCase();
  const wrap = document.getElementById('reviewContainer');
  wrap.innerHTML = allAreas().map(area => {
    const sensitiveAction = c.modules.sensibles[area.id] || 'aplicar';
    return `<details class="area-block" open>
      <summary>${escapeHtml(area.nombre)} ${area.sensible ? '· sensible: '+escapeHtml(sensitiveAction) : ''}</summary>
      <p class="small">${escapeHtml(area.objetivo_area || '')}</p>
      ${area.items.map(item => {
        const r = itemState(item.id);
        return `<div class="review-item">
          <strong>${item.ciclo}${item.num_test ? ' · '+item.num_test : ''}</strong> — ${escapeHtml(item.texto)}
          ${item.alerta_clinica ? '<span class="badge danger" style="margin-left:8px">atencion clinica</span>' : ''}
          <div style="margin-top:6px"><strong>Respuesta:</strong> ${escapeHtml(r.respuesta || '—')}</div>
          ${r.notas ? `<div style="margin-top:4px"><strong>Nota:</strong> ${escapeHtml(r.notas)}</div>` : ''}
          ${item.pistas ? `<div class="small" style="margin-top:6px"><strong>Guia clinica:</strong> ${escapeHtml(item.pistas)}</div>` : ''}
        </div>`;
      }).join('')}
    </details>`;
  }).join('');
}

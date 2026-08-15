/* ============================================================
   TRAS · ui.js
   Navegacion entre pasos, lista de casos, notificaciones (toasts),
   modal, recorrido guiado y modo privado.
   ============================================================ */

/* ---------- Toasts (reemplazan alert()) ---------- */
function toast(message, kind='info', ms=3200) {
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + (['ok','warn','danger'].includes(kind) ? kind : 'info');
  t.textContent = message;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .25s ease, transform .25s ease';
    t.style.opacity = '0';
    t.style.transform = 'translateY(8px)';
    setTimeout(() => t.remove(), 250);
  }, ms);
}

/* ---------- Alcance de la evaluacion (TRAS / Habilidades / Ambos) ---------- */
/* Pasos especificos del TRAS que se ocultan cuando el alcance es solo habilidades. */
const TRAS_ONLY_STEPS = [4, 5, 6, 7];
/* Paso de la bateria de habilidades, oculto cuando el alcance es solo TRAS. */
const GOLDSTEIN_STEP = 9;

function caseScope() {
  const c = (typeof getCurrentCase === 'function') ? getCurrentCase() : null;
  return (c && c.scope) ? c.scope : 'ambos';
}

function isStepVisible(id) {
  const scope = caseScope();
  if (scope === 'tras' && id === GOLDSTEIN_STEP) return false;
  if (scope === 'habilidades' && TRAS_ONLY_STEPS.includes(id)) return false;
  return true;
}

function nextClinicalStep(fromId) {
  const visible = steps.map(s => s.id).filter(id => id !== 1 && id !== 11 && isStepVisible(id));
  const idx = visible.indexOf(fromId);
  return idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : 8;
}
function continueClinical(fromId) {
  const next = nextClinicalStep(fromId);
  goStep(next);
  if (next === 6 && typeof renderReview === 'function') renderReview();
  if (next === 7 && typeof renderInterpretation === 'function') renderInterpretation();
  if (next === 9 && typeof renderGoldstein === 'function') renderGoldstein();
  if (next === 10 && typeof renderPersonalidad === 'function') renderPersonalidad();
  if (next === 10 && typeof renderMatrizCA === 'function') renderMatrizCA();
  if (next === 8 && typeof renderReport === 'function') renderReport();
}

function setScope(scope) {
  const c = getCurrentCase();
  if (!c) return;
  c.scope = (scope === 'tras' || scope === 'habilidades') ? scope : 'ambos';
  // Si el paso actual queda oculto, mover a uno visible.
  if (!isStepVisible(currentStep)) {
    const firstVisible = steps.map(s => s.id).find(isStepVisible) || 1;
    currentStep = firstVisible;
  }
  persist();
  renderScopeSelector();
  renderNav();
  renderTopNav();
  goStep(currentStep);
  if (typeof renderReport === 'function') renderReport();
}

function renderScopeSelector() {
  const box = document.getElementById('scopeSelector');
  if (!box) return;
  const scope = caseScope();
  const opt = (val, label, hint) => `
    <button class="scope-opt ${scope===val?'active':''}" onclick="setScope('${val}')" aria-pressed="${scope===val}">
      <strong>${label}</strong><span>${hint}</span>
    </button>`;
  box.innerHTML =
    opt('tras', 'TRAS', 'Solo el test narrativo') +
    opt('habilidades', 'Habilidades', 'Solo bateria Goldstein') +
    opt('ambos', 'Ambos', 'Aplicar los dos');
}

/* ---------- Navegacion ---------- */
function goStep(n) {
  syncInputsToState();
  persist();
  if (!isStepVisible(n)) {
    const firstVisible = steps.map(s => s.id).find(isStepVisible) || 1;
    n = firstVisible;
  }
  currentStep = n;
  document.querySelectorAll('.step-pane').forEach(p=>p.classList.remove('active'));
  const pane = document.getElementById('step-'+n);
  if (pane) pane.classList.add('active');
  document.querySelectorAll('.step-btn').forEach(b=>{
    const on = Number(b.dataset.step)===n;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'step' : 'false');
  });
  document.querySelectorAll('.topnav-btn').forEach(b=>{
    const on = Number(b.dataset.step)===n;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'step' : 'false');
  });
  const visibleIds = steps.map(s=>s.id).filter(isStepVisible);
  const pos = visibleIds.indexOf(n) + 1;
  document.getElementById('progressLabel').textContent = `Paso ${pos} de ${visibleIds.length}`;
  document.getElementById('progressFill').style.width = (pos/visibleIds.length*100)+'%';
  const main = document.querySelector('.main');
  if (main) main.scrollTop = 0;
  // A11y: mover el foco al panel activo y anunciar el cambio a tecnologia asistiva.
  if (pane) {
    const meta = steps.find(s => s.id === n);
    pane.setAttribute('tabindex', '-1');
    pane.setAttribute('role', 'region');
    if (meta) pane.setAttribute('aria-label', `Paso ${pos} de ${visibleIds.length}: ${meta.title} — ${meta.desc}`);
    // Evitar robar el foco durante el arranque inicial.
    if (window.__trasBooted) { try { pane.focus({ preventScroll: true }); } catch (_) { pane.focus(); } }
  }
}

/* Iconos SVG por paso (sin texto, representativos del recorrido). */
const STEP_ICONS = {
  1: '<path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z"/>',
  2: '<path d="M4 4h16v4H4zM4 10h16v10H4zm3 3v4h10v-4z"/>',
  3: '<path d="M19 3h-4.2a3 3 0 00-5.6 0H5a2 2 0 00-2 2v15a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 0a1 1 0 110 2 1 1 0 010-2zM8 11h8v2H8zm0 4h8v2H8z"/>',
  4: '<path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>',
  5: '<path d="M4 4h16v12H7l-3 3z"/>',
  6: '<path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h12v2H3zM19 15l3 3-3 3z"/>',
  7: '<path d="M12 2a7 7 0 00-4 12.7V17a2 2 0 002 2h4a2 2 0 002-2v-2.3A7 7 0 0012 2zm-2 19h4v1a1 1 0 01-1 1h-2a1 1 0 01-1-1z"/>',
  8: '<path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm8 1.5V8h4.5zM8 12h8v2H8zm0 4h8v2H8z"/>',
  9: '<path d="M16 11a4 4 0 10-4-4 4 4 0 004 4zm-8 0a3 3 0 10-3-3 3 3 0 003 3zm0 2c-2.7 0-5 1.3-5 3.5V19h6v-2.5c0-1 .4-1.9 1-2.6A7 7 0 008 13zm8 0c-3 0-7 1.5-7 4v2h14v-2c0-2.5-4-4-7-4z"/>',
  10:'<path d="M4 3h12a2 2 0 012 2v16l-8-3-8 3V5a2 2 0 012-2zm2 4h8v2H6zm0 4h8v2H6z"/>',
  12:'<path d="M3 3h6v6H3zm8 0h6v6h-6zm-8 8h6v6H3zm8 0h6v6h-6z"/>'
};

function renderTopNav() {
  const bar = document.getElementById('topNav');
  if (!bar) return;
  bar.innerHTML = steps.filter(s => isStepVisible(s.id)).map(s =>
    `<button class="topnav-btn ${s.id===currentStep?'active':''}" data-step="${s.id}" onclick="goStep(${s.id})" title="${escapeHtml(s.title + ' — ' + s.desc)}" aria-label="${escapeHtml(s.title + ': ' + s.desc)}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${STEP_ICONS[s.id] || ''}</svg></button>`
  ).join('');
}

function renderNav() {
  const nav = document.getElementById('stepNav');
  nav.innerHTML = steps.filter(s => isStepVisible(s.id)).map(s =>
    `<button class="step-btn ${s.id===currentStep?'active':''}" data-step="${s.id}" onclick="goStep(${s.id})">${s.title}<span>${s.desc}</span></button>`
  ).join('');
}

/* Fecha de actualizacion en formato corto y legible. */
function shortStamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  return mismoDia
    ? 'hoy ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function renderCaseList() {
  const wrap = document.getElementById('caseList');
  if (!wrap) return;
  if (!state.cases.length) { wrap.innerHTML = '<div class="small" style="color:#d2ddea">No hay casos.</div>'; return; }
  wrap.innerHTML = state.cases.map(c => {
    const active = c.id === state.currentCaseId;
    const stamp = shortStamp(c.updatedAt);
    const demo = c.isDemo || String(c.meta.numero || '').toUpperCase() === 'TRAS-DEMO-001';
    return `<div class="case-row compact">
      <button class="case-chip" style="${active?'outline:2px solid #f2d688':''}" onclick="switchCase('${c.id}')">
        <strong>${escapeHtml(c.meta.numero || 'Sin numero')}</strong>${demo ? ' <span class="dup-tag">demo</span>' : ''}<br>
        <span class="small" style="color:#d2ddea">${escapeHtml(c.meta.nombre || 'Sin nombre')}</span>
        ${stamp ? `<br><span class="small" style="color:#9db2c8">act. ${escapeHtml(stamp)}</span>` : ''}
      </button>
      <button class="case-mini" title="Historial" onclick="openCaseHistory('${c.id}')">&#8635;</button>
      <button class="case-mini danger" title="Eliminar" onclick="deleteCase('${c.id}')">&times;</button>
    </div>`;
  }).join('');
}

/* Muestra el registro interno de actualizaciones del caso. */
function openCaseHistory(id) {
  const c = state.cases.find(x => x.id === id);
  if (!c) return;
  const hist = (Array.isArray(c.historial) ? c.historial : []).slice().reverse();
  const filas = hist.length
    ? hist.map(h => `<tr><td style="white-space:nowrap">${escapeHtml(new Date(h.ts).toLocaleString('es-CO'))}</td><td>${escapeHtml(h.nota)}</td></tr>`).join('')
    : '<tr><td colspan="2">Sin movimientos registrados.</td></tr>';
  document.getElementById('historyTitle').textContent = 'Historial · ' + (c.meta.numero || 'Caso');
  document.getElementById('historyBody').innerHTML = `
    <p class="small" style="color:#5e7186">
      Creado: ${escapeHtml(new Date(c.createdAt).toLocaleString('es-CO'))} ·
      Ultima actualizacion: ${escapeHtml(new Date(c.updatedAt).toLocaleString('es-CO'))}
    </p>
    <table class="hist-table"><thead><tr><th>Fecha</th><th>Cambio</th></tr></thead><tbody>${filas}</tbody></table>`;
  toggleModal('historyModal', true);
}

/* ---------- Modal e IA manual ---------- */
function toggleModal(id, show) {
  const m = document.getElementById(id);
  m.classList.toggle('show', show);
  if (show) {
    setTimeout(() => {
      enhanceVoiceInputs(m);
      const focusable = m.querySelector('button, textarea, input, select');
      if (focusable) focusable.focus();
    }, 0);
  } else {
    stopVoiceRecognition();
  }
}

/* ---------- Modo privado ---------- */
function togglePrivacy() {
  const on = document.getElementById('appRoot').classList.toggle('blur-mode');
  toast(on ? 'Modo privado activado (Ctrl+Shift+P).' : 'Modo privado desactivado.', 'info', 2000);
}

function dismissPrivacyNotice() {
  state.ui.privacyNoticeDismissed = true;
  persist();
  const b = document.getElementById('privacyBanner');
  if (b) b.classList.add('hidden');
}

function renderPrivacyNotice() {
  const b = document.getElementById('privacyBanner');
  if (!b) return;
  b.classList.toggle('hidden', !!state.ui.privacyNoticeDismissed);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

/* Contador orientativo del resumen clínico contextual.
   No impone un límite rígido: alerta sobre posible falta de contexto o exceso de redundancia. */
function updateResumenCounter() {
  const ta = document.getElementById('hc_resumen');
  const out = document.getElementById('resumenCounter');
  if (!ta || !out) return;
  const n = (typeof countWords === 'function')
    ? countWords(ta.value)
    : (String(ta.value || '').trim() ? ta.value.trim().split(/\s+/).length : 0);
  out.textContent = n + (n === 1 ? ' palabra' : ' palabras');
  out.className = 'word-counter ' + (n === 0 ? '' : (n < 120 ? 'low' : (n > 360 ? 'high' : 'ok')));
  if (n && n < 120) out.textContent += ' · revisa si falta contexto';
  else if (n > 360) out.textContent += ' · revisa redundancias, sin recortar datos clave';
  else if (n >= 160 && n <= 280) out.textContent += ' · extensión orientativa';
}

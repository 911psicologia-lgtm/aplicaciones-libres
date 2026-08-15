/* ============================================================
   TRAS · voice.js
   Dictado por voz (Web Speech API). Degrada con elegancia cuando
   el navegador no lo soporta.
   ============================================================ */

let activeRecognition = null;
let activeVoiceField = null;

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
function voiceSupported() { return !!getSpeechRecognitionCtor(); }

function stopVoiceRecognition() {
  if (activeRecognition) {
    try { activeRecognition.stop(); } catch(e) {}
  }
  activeRecognition = null;
  activeVoiceField = null;
  document.querySelectorAll('.voice-btn.recording').forEach(btn => btn.classList.remove('recording'));
  document.querySelectorAll('.voice-status').forEach(s => {
    if (s.dataset.persistent !== 'true') s.textContent = voiceSupported() ? 'Listo para dictado.' : 'Dictado no disponible en este navegador.';
  });
}

function insertTranscript(el, transcript) {
  const clean = String(transcript || '').trim();
  if (!clean) return;
  const current = el.value || '';
  const joiner = current && !current.endsWith(' ') ? ' ' : '';
  el.value = current + joiner + clean;
  el.dispatchEvent(new Event('input', {bubbles:true}));
  el.dispatchEvent(new Event('change', {bubbles:true}));
  if (typeof autosave === 'function') autosave();
}

function startVoiceForField(fieldId) {
  const el = document.getElementById(fieldId);
  const status = document.getElementById('voice_status_' + fieldId);
  const btn = document.querySelector('.voice-btn[data-target="' + fieldId + '"]');
  const Ctor = getSpeechRecognitionCtor();
  if (!el || !status || !btn) return;
  if (!Ctor) {
    status.textContent = 'Este navegador no soporta dictado web.';
    status.dataset.persistent = 'true';
    return;
  }
  if (activeVoiceField === fieldId) {
    stopVoiceRecognition();
    status.textContent = 'Dictado detenido.';
    status.dataset.persistent = 'true';
    return;
  }
  stopVoiceRecognition();
  const rec = new Ctor();
  activeRecognition = rec;
  activeVoiceField = fieldId;
  rec.lang = 'es-CO';
  rec.interimResults = true;
  rec.continuous = true;

  btn.classList.add('recording');
  btn.setAttribute('aria-pressed', 'true');
  status.textContent = 'Escuchando... habla con naturalidad.';
  status.dataset.persistent = 'true';

  let finalTranscript = '';
  rec.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript || '';
      if (event.results[i].isFinal) finalTranscript += ' ' + piece;
      else interim += ' ' + piece;
    }
    const shown = (finalTranscript + ' ' + interim).trim();
    status.textContent = shown ? ('Escuchando... ' + shown) : 'Escuchando...';
  };
  rec.onerror = (event) => {
    status.textContent = 'Error de dictado: ' + (event.error || 'desconocido');
    status.dataset.persistent = 'true';
    btn.classList.remove('recording');
    btn.setAttribute('aria-pressed', 'false');
    activeRecognition = null;
    activeVoiceField = null;
  };
  rec.onend = () => {
    btn.classList.remove('recording');
    btn.setAttribute('aria-pressed', 'false');
    if ((finalTranscript || '').trim()) {
      insertTranscript(el, finalTranscript);
      status.textContent = 'Texto insertado en el campo.';
    } else if (activeVoiceField === fieldId) {
      status.textContent = 'No se detecto voz o el navegador detuvo el dictado.';
    }
    status.dataset.persistent = 'true';
    activeRecognition = null;
    activeVoiceField = null;
  };
  try {
    rec.start();
  } catch(e) {
    status.textContent = 'No fue posible iniciar el dictado.';
    status.dataset.persistent = 'true';
    btn.classList.remove('recording');
    activeRecognition = null;
    activeVoiceField = null;
  }
}

function ensureFieldId(el) {
  if (!el.id) el.id = 'vf_' + Math.random().toString(36).slice(2,10);
  return el.id;
}

/* Inyecta el toolbar de voz despues de cada campo de texto del ambito dado. */
function enhanceVoiceInputs(scope=document) {
  const fields = scope.querySelectorAll('textarea, input[type="text"], input[type="tel"], input:not([type])');
  fields.forEach(el => {
    if (el.dataset.voiceEnhanced === 'true') return;
    if (el.type === 'email' || el.type === 'password' || el.type === 'date' || el.type === 'number') return;
    const fieldId = ensureFieldId(el);
    const wrap = document.createElement('div');
    wrap.className = 'voice-toolbar';
    wrap.innerHTML = `<button type="button" class="voice-btn" data-target="${fieldId}" aria-pressed="false" aria-label="Dictar por voz" onclick="startVoiceForField('${fieldId}')">&#127908; Dictar</button>
      <span class="voice-status" id="voice_status_${fieldId}">${voiceSupported() ? 'Listo para dictado.' : 'Dictado no disponible en este navegador.'}</span>`;
    el.insertAdjacentElement('afterend', wrap);
    el.dataset.voiceEnhanced = 'true';
  });
}

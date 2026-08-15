/* ============================================================
   MIC — componente de dictado por voz reutilizable
   Usa Web Speech API (SpeechRecognition). Disponible de forma
   confiable en Chrome/Edge (desktop y Android). En Safari/iOS y
   Firefox el soporte es inexistente o muy limitado: en ese caso
   se avisa y se deja el campo como texto libre normal.
   ============================================================ */

function speechSupported(){
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Adjunta un botón de micrófono a un textarea existente.
 * wrapperEl: contenedor del field (para insertar el botón dentro)
 * textareaEl: el <textarea> al que se le va a dictar
 */
function attachMic(wrapperEl, textareaEl){
  const micBtn = document.createElement('button');
  micBtn.type = 'button';
  micBtn.className = 'mic-btn';
  micBtn.setAttribute('aria-label', 'Dictar por voz');
  micBtn.setAttribute('aria-pressed', 'false');
  micBtn.innerHTML = micIconSVG();

  const micRow = document.createElement('div');
  micRow.className = 'mic-row';
  micRow.appendChild(micBtn);

  const micStatus = document.createElement('span');
  micStatus.className = 'mic-status';
  micStatus.id = (textareaEl.id || 'campo') + '-mic-status';
  micStatus.setAttribute('aria-live', 'polite');
  micBtn.setAttribute('aria-controls', micStatus.id);
  micRow.appendChild(micStatus);

  wrapperEl.appendChild(micRow);

  if(!speechSupported()){
    micBtn.disabled = true;
    micBtn.classList.add('mic-btn-disabled');
    micStatus.textContent = 'Dictado no disponible en este navegador';
    micStatus.classList.add('mic-status-warn');
    return;
  }

  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new RecognitionCtor();
  const navLang = String(navigator.language || '').trim();
  recognition.lang = navLang.toLowerCase().startsWith('es') ? navLang : 'es-CO';
  recognition.continuous = true;
  recognition.interimResults = true;

  let listening = false;
  let baseText = ''; // texto que ya había antes de empezar a grabar esta sesión
  let finalTranscript = '';

  recognition.onstart = ()=>{
    listening = true;
    micBtn.classList.add('mic-btn-active');
    micBtn.setAttribute('aria-pressed', 'true');
    micStatus.textContent = 'Escuchando… habla con calma, todo el tiempo que necesites';
    micStatus.classList.remove('mic-status-warn');
    baseText = textareaEl.value ? textareaEl.value + ' ' : '';
    finalTranscript = '';
  };

  recognition.onresult = (event)=>{
    let interim = '';
    for(let i = event.resultIndex; i < event.results.length; i++){
      const transcript = event.results[i][0].transcript;
      if(event.results[i].isFinal){
        finalTranscript += transcript + ' ';
      } else {
        interim += transcript;
      }
    }
    textareaEl.value = baseText + finalTranscript + interim;
    textareaEl.dispatchEvent(new Event('input'));
    autoGrow(textareaEl);
  };

  recognition.onerror = (event)=>{
    listening = false;
    micBtn.classList.remove('mic-btn-active');
    micBtn.setAttribute('aria-pressed', 'false');
    if(event.error === 'no-speech'){
      micStatus.textContent = 'No se detectó voz. Toca el micrófono para intentar de nuevo.';
    } else if(event.error === 'not-allowed' || event.error === 'permission-denied'){
      micStatus.textContent = 'Necesitas permitir el acceso al micrófono para dictar.';
    } else {
      micStatus.textContent = 'Hubo un problema con el dictado. Puedes seguir escribiendo directamente.';
    }
    micStatus.classList.add('mic-status-warn');
  };

  recognition.onend = ()=>{
    listening = false;
    micBtn.classList.remove('mic-btn-active');
    micBtn.setAttribute('aria-pressed', 'false');
    if(!micStatus.classList.contains('mic-status-warn')){
      micStatus.textContent = 'Puedes seguir dictando o editar el texto libremente';
    }
  };

  micBtn.onclick = ()=>{
    if(listening){
      recognition.stop();
    } else {
      try{
        recognition.start();
      }catch(e){
        // ya estaba iniciado, ignorar
      }
    }
  };
}

function micIconSVG(){
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"></rect>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="8" y1="22" x2="16" y2="22"></line>
  </svg>`;
}

function autoGrow(textareaEl){
  textareaEl.style.height = 'auto';
  textareaEl.style.height = (textareaEl.scrollHeight + 2) + 'px';
}

/**
 * Crea un field completo (label + hint + textarea auto-expandible + mic)
 * y lo retorna como nodo listo para insertar. Uso:
 *   const field = buildVoiceField({ id, label, hint, placeholder, value, required });
 *   container.appendChild(field.el);
 *   // luego: field.getValue()
 */
function buildVoiceField({ id, label, hint, placeholder, value, required }){
  const wrap = document.createElement('div');
  wrap.className = 'field field-voice';

  const labelRow = document.createElement('div');
  labelRow.className = 'field-label-row';

  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.innerHTML = label + (required ? '' : ' <span class="muted">(opcional)</span>');
  labelRow.appendChild(labelEl);

  let hintEl = null;
  if(hint){
    const helpBtn = document.createElement('button');
    helpBtn.type = 'button';
    helpBtn.className = 'help-btn';
    helpBtn.textContent = '?';
    helpBtn.setAttribute('aria-label', 'Qué se espera en este campo');
    helpBtn.setAttribute('aria-expanded', 'false');
    labelRow.appendChild(helpBtn);

    hintEl = document.createElement('div');
    hintEl.className = 'hint hint-collapsed';
    hintEl.id = id + '-hint';
    hintEl.textContent = hint;
    helpBtn.setAttribute('aria-controls', hintEl.id);

    helpBtn.onclick = ()=>{
      hintEl.classList.toggle('hint-collapsed');
      helpBtn.classList.toggle('help-btn-active');
      helpBtn.setAttribute('aria-expanded', String(!hintEl.classList.contains('hint-collapsed')));
    };
  }
  wrap.appendChild(labelRow);
  if(hintEl) wrap.appendChild(hintEl);

  const textarea = document.createElement('textarea');
  textarea.id = id;
  textarea.placeholder = placeholder || '';
  textarea.value = value || '';
  textarea.className = 'voice-textarea';
  if(hintEl) textarea.setAttribute('aria-describedby', hintEl.id);
  textarea.addEventListener('input', ()=> autoGrow(textarea));
  wrap.appendChild(textarea);

  attachMic(wrap, textarea);

  setTimeout(()=> autoGrow(textarea), 0);

  return {
    el: wrap,
    getValue: ()=> textarea.value.trim(),
    textareaEl: textarea,
  };
}

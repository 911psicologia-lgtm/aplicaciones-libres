/* ============================================================
   TRAS · app.js
   Arranque de la aplicacion. Se carga al final (defer) cuando el
   resto de modulos ya definio sus funciones en el ambito global.
   ============================================================ */

async function initApp() {
  // Sello de version en la barra lateral.
  const vEl = document.getElementById('appVersion');
  if (vEl) vEl.textContent = APP_VERSION + ' · expediente único, informes integrados y devolución terapéutica interactiva';

  let rawOverride;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && typeof isEncryptedEnvelope === 'function' && isEncryptedEnvelope(raw)) {
      const envelope = JSON.parse(raw);
      let plain = await unlockLocalEncryption(envelope);
      // Reintenta una vez si el usuario se equivoco al escribir la frase
      // (pero no insiste indefinidamente ni borra nada si sigue fallando).
      if (plain === null && confirm('¿Quieres intentarlo de nuevo con la frase clave?')) {
        plain = await unlockLocalEncryption(envelope);
      }
      if (plain === null) {
        // Los datos siguen cifrados e intactos en el navegador. La app
        // arranca con un expediente en blanco de esta sesion; nada se
        // sobrescribe hasta que el profesional guarde algo nuevo.
        toast('No se desbloquearon los casos cifrados. Recarga la pagina para reintentar; tus datos siguen a salvo.', 'warn', 7000);
      } else {
        rawOverride = plain;
        const btn = document.getElementById('encryptionToggleBtn');
        if (btn) btn.textContent = 'Desactivar cifrado local';
      }
    }
  } catch (e) { console.error('Verificacion de cifrado local fallida:', e); }

  state = loadState(rawOverride);

  renderNav();
  renderTopNav();
  renderScopeSelector();
  renderCaseList();
  renderPrivacyNotice();
  hydrateInputs();
  const current = typeof ensureCaseV0164 === 'function' ? ensureCaseV0164(getCurrentCase()) : getCurrentCase();
  const initialStep = state.evaluator && String(state.evaluator.nombre || '').trim()
    ? Number(current && current.workflow && current.workflow.lastStep || 2)
    : 1;
  goStep(initialStep);
  window.__trasBooted = true;
  setTimeout(() => enhanceVoiceInputs(document), 0);
}

/* ---------- Splash de entrada ---------- */
/* Pantalla breve con el logo y el nombre de la app. Se muestra siempre al
   abrir (no bloquea datos ni casos guardados: initApp() ya corrió detrás).
   "Entrar" o Escape la retiran y dejan ver la app normalmente. */
function dismissSplash() {
  const s = document.getElementById('splashScreen');
  if (!s || s.classList.contains('hidden')) return;
  s.classList.add('splash-out');
  setTimeout(() => s.classList.add('hidden'), 320);
}

/* Guardado manual. El caso ya se autoguarda cada ~2 minutos y en cada
   cambio relevante (persist() se llama por todo el codigo), pero este
   boton da control y confirmacion inmediata cuando el profesional
   quiere asegurarse antes de cerrar la pestaña o cambiar de caso. */
function manualSaveNow() {
  const btn = document.getElementById('appSaveButton');
  try {
    if (typeof syncInputsToState === 'function') syncInputsToState();
    persist('Guardado manual');
    if (btn) {
      btn.classList.remove('save-flash');
      void btn.offsetWidth; // reinicia la animacion si se pulsa varias veces seguidas
      btn.classList.add('save-flash');
    }
    toast('Caso guardado.', 'ok', 2200);
  } catch (e) {
    toast('No se pudo guardar: ' + e.message, 'danger', 4500);
  }
}

document.addEventListener('keydown', (e) => {
  // Modo privado
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); togglePrivacy(); return; }
  // Escape cierra el splash o el modal abierto
  if (e.key === 'Escape') {
    const splash = document.getElementById('splashScreen');
    if (splash && !splash.classList.contains('hidden')) { dismissSplash(); return; }
    const modal = document.getElementById('promptModal');
    if (modal && modal.classList.contains('show')) { toggleModal('promptModal', false); return; }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

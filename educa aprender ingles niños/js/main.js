/* ═══════════════════════════════════════════════════════════
   PequeWorld — BOOT
   ═══════════════════════════════════════════════════════════ */
function boot() {
  initStars();
  loadState();
  // v12: aplica el tamaño de texto guardado (Normal/Grande/Muy grande)
  if (typeof applyTextSize === 'function') applyTextSize();
  // v13: aplica el modo MAYÚSCULAS guardado (lectores tempranos)
  if (typeof applyCapsMode === 'function') applyCapsMode();
  // Perfil por defecto si está vacío
  if (!Object.keys(STATE.profiles).length) {
    const p = defaultProfile('Niño', 'avatar_1');
    STATE.profiles[p.id] = p;
    STATE.active = p.id;
    saveState();
  }
  renderLogin();
  showScreen('loginScreen');
  showUI(false);
}

// Eventos
$('btnEnter').addEventListener('click', doEnter);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

boot();

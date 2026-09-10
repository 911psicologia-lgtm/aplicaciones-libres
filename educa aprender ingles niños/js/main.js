/* ═══════════════════════════════════════════════════════════
   PequeWorld — BOOT
   ═══════════════════════════════════════════════════════════ */
function boot() {
  initStars();
  loadState();
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

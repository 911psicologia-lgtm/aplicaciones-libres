/* main.js v2.5.3 — Pantallas, orientación, nivel select, confetti, fullscreen y gaveta móvil */
'use strict';

window.GAME = null;
window._playerName = 'Jugador';
window._carryStars = 0;
window._carrySuns  = 0;

function _setAppHeight() {
  const h = Math.round((window.visualViewport && window.visualViewport.height) || window.innerHeight || document.documentElement.clientHeight || 0);
  if (h > 0) document.documentElement.style.setProperty('--app-h', h + 'px');
}

document.addEventListener('DOMContentLoaded', () => {
  _setAppHeight();
  if (window.visualViewport) window.visualViewport.addEventListener('resize', _setAppHeight);
  AUDIO.init();

  // Restaurar prefs de audio
  const prefs = STORAGE.getPrefs();
  if (prefs.sound === false)  AUDIO.toggle();
  if (prefs.music === false)  AUDIO.toggleMusic();
  _updateAudioIcons();

  // Verificar orientación
  _checkOrientation();
  window.addEventListener('resize', () => { _setAppHeight(); _checkOrientation(); _applyCompactGameUI(); _updateFullscreenButton(); window.GAME && window.GAME._computeScale && window.GAME._computeScale(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { _setAppHeight(); _checkOrientation(); _applyCompactGameUI(); _requestFullscreenPreferred(); _updateFullscreenButton(); window.GAME && window.GAME._computeScale && window.GAME._computeScale(); }, 220));

  _applyCompactGameUI();
  _initIntroScreen();
  _showScreen('intro');

  // Música intro con pequeño delay
  document.addEventListener('fullscreenchange', _updateFullscreenButton);
  _on('mobile-seed-toggle', () => { AUDIO.play('select'); _toggleSeedDrawer(); });
  _on('btn-bday-cake', () => {
    AUDIO.init();
    AUDIO.play('bday');
    _toast('🎂 ¡Cumpleaños para Martín José!');
  });
  setTimeout(() => AUDIO.music('eerie'), 400);
  // Jingle de cumpleaños al inicio
  setTimeout(() => AUDIO.play('bday'), 1200);
});


function _isCompactDevice() {
  const coarse = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  return window.innerWidth <= 1180 || (coarse && Math.max(window.innerWidth, window.innerHeight) <= 1600);
}

function _applyCompactGameUI() {
  const compact = _isCompactDevice();
  document.body.classList.toggle('compact-seed-ui', compact);
  if (!compact) document.body.classList.remove('seed-drawer-open');
}

function _requestFullscreenPreferred(force = false) {
  const handheld = _isCompactDevice();
  const landscape = window.innerWidth > window.innerHeight;
  if (!force && (!handheld || !landscape)) return;
  const docEl = document.documentElement;
  const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
  if (req && !document.fullscreenElement) {
    try {
      const out = req.call(docEl);
      if (out && out.catch) out.catch(() => {});
    } catch (_) {}
  }
}

function _toggleFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (document.fullscreenElement) {
    try { exit && exit.call(document); } catch (_) {}
    return;
  }
  _requestFullscreenPreferred(true);
}

function _updateFullscreenButton() {
  const btn = document.getElementById('btn-fullscreen');
  if (!btn) return;
  btn.textContent = document.fullscreenElement ? '🗗' : '⛶';
}

function _toggleSeedDrawer(force) {
  if (!document.body.classList.contains('compact-seed-ui')) return;
  const open = typeof force === 'boolean' ? force : !document.body.classList.contains('seed-drawer-open');
  document.body.classList.toggle('seed-drawer-open', open);
}
window._toggleSeedDrawer = _toggleSeedDrawer;

// ─────────────────────────────────────────────────────
// ORIENTACIÓN
// ─────────────────────────────────────────────────────
function _checkOrientation() {
  const overlay = document.getElementById('orientation-overlay');
  if (!overlay) return;
  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobileSize = window.innerWidth < 900;
  const onGameScreen = document.getElementById('screen-game')?.classList.contains('active');

  if (isPortrait && isMobileSize && onGameScreen) {
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

_on('btn-orient-ignore', () => {
  const overlay = document.getElementById('orientation-overlay');
  if (overlay) overlay.classList.remove('active');
});

// ─────────────────────────────────────────────────────
// INTRO
// ─────────────────────────────────────────────────────
function _initIntroScreen() {
  _spawnIntroZombies();
  _spawnIntroPlants();
  setInterval(_spawnIntroZombies, 7000);
  setInterval(_spawnIntroPlants,  4000);

  _on('btn-nueva-partida', () => { AUDIO.play('select'); window._carryStars = 0; window._carrySuns = 0; window._loadIntent = false; _showScreen('username'); });
  _on('btn-cargar-partida', () => {
    AUDIO.play('select');
    window._loadIntent = true;
    _showScreen('username');
  });
  _on('btn-ranking', () => { AUDIO.play('select'); _showRanking(); _showScreen('ranking'); });
  _on('btn-logros',  () => { AUDIO.play('select'); _showLogros(); _showScreen('logros'); });

  // Audio toggles
  _on('btn-toggle-sound', () => {
    const on = AUDIO.toggle();
    STORAGE.setPref('sound', on);
    _updateAudioIcons();
  });
  _on('btn-toggle-music', () => {
    const on = AUDIO.toggleMusic();
    STORAGE.setPref('music', on);
    _updateAudioIcons();
    if (on) AUDIO.music('eerie');
  });
}

function _updateAudioIcons() {
  const snd = document.getElementById('btn-toggle-sound');
  const mus = document.getElementById('btn-toggle-music');
  if (snd) snd.textContent = AUDIO.isEnabled()       ? '🔊' : '🔇';
  if (mus) mus.textContent = AUDIO.isMusicEnabled()  ? '🎵' : '🔇';
}

function _spawnIntroZombies() {
  const emojis = ['🧟','🪖','🪣','🤸','👹','💃','🎈','📛'];
  const bg = document.getElementById('intro-zombies');
  if (!bg) return;
  for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
    const z = document.createElement('div');
    z.className = 'intro-zombie';
    z.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    z.style.top   = (8 + Math.random() * 72) + '%';
    z.style.fontSize = (24 + Math.random() * 22) + 'px';
    z.style.animationDuration = (9 + Math.random() * 8) + 's';
    z.style.animationDelay   = (Math.random() * 2) + 's';
    z.style.opacity = 0.5 + Math.random() * 0.4;
    bg.appendChild(z);
    setTimeout(() => z.remove(), 20000);
  }
}

function _spawnIntroPlants() {
  const emojis = ['🌼','🌿','❄️','🌺','🌵','💣','🍄'];
  const bg = document.getElementById('intro-plants');
  if (!bg) return;
  const z = document.createElement('div');
  z.className = 'intro-plant-float';
  z.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  z.style.left   = (5 + Math.random() * 85) + '%';
  z.style.bottom = (5 + Math.random() * 50) + '%';
  z.style.fontSize = (20 + Math.random() * 16) + 'px';
  z.style.animationDuration = (3 + Math.random() * 3) + 's';
  z.style.opacity = 0.25;
  bg.appendChild(z);
  setTimeout(() => z.remove(), 7000);
}

// ─────────────────────────────────────────────────────
// NOMBRE / HOWTO
// ─────────────────────────────────────────────────────
_on('btn-back-user', () => { AUDIO.play('select'); _showScreen('intro'); });

_on('btn-empezar', () => {
  const nameEl = document.getElementById('input-name');
  const name   = nameEl ? nameEl.value.trim() : '';
  if (!name) { _toast('¡Escribe tu nombre!'); return; }
  AUDIO.play('select');
  window._playerName = name;
  STORAGE.setUser(name);          // C2: activar namespace del usuario

  if (window._loadIntent) {
    window._loadIntent = false;
    if (STORAGE.hasSave()) {
      _loadSavedGame();           // hay save para este usuario → cargar
    } else {
      _toast(`No hay partida guardada para ${name}. ¡Empieza una nueva!`);
      _showScreen('howto');       // no hay save → flujo normal
    }
  } else {
    _showScreen('howto');
  }
});

_on('btn-howto-go', () => {
  AUDIO.play('select');
  _goToLevelSelect();
});

function _goToLevelSelect() {
  _buildLevelSelect();
  _showScreen('levelselect');
}

// ─────────────────────────────────────────────────────
// LEVEL SELECT
// ─────────────────────────────────────────────────────
function _buildLevelSelect() {
  const grid = document.getElementById('level-select-grid');
  if (!grid) return;
  grid.innerHTML = '';

  LEVELS.forEach((lv, idx) => {
    const unlocked = idx === 0 || STORAGE.isCompleted(idx - 1) || STORAGE.getHighestUnlocked() >= idx;
    const stars = STORAGE.getStarsForLevel(idx);
    const best  = STORAGE.getBestScore(idx);
    const boss  = ZOMBIES[lv.boss] || null;

    const card = document.createElement('div');
    card.className = `level-select-card${unlocked ? '' : ' locked'}`;

    const starsHtml = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const bestHtml  = best > 0 ? `<div class="lsc-best">📊 Récord: ${best.toLocaleString('es-ES')}</div>` : '';
    const lockHtml  = !unlocked ? '<div class="lsc-lock">🔒</div>' : '';

    card.innerHTML = `
      <div class="lsc-emoji">${lv.emoji}</div>
      <div class="lsc-num">NIVEL ${idx + 1}</div>
      <div class="lsc-name">${lv.name}</div>
      <div class="lsc-boss">${boss ? 'Jefe: ' + boss.emoji + ' ' + boss.name : ''}</div>
      <div class="lsc-stars">${starsHtml}</div>
      ${bestHtml}
      ${lockHtml}
    `;

    if (unlocked) {
      card.addEventListener('click', () => {
        AUDIO.play('select');
        _startGame(idx, window._playerName || 'Jugador');
      });
    }
    grid.appendChild(card);
  });
}

_on('btn-back-levelselect', () => { AUDIO.play('select'); _showScreen('intro'); });

// ─────────────────────────────────────────────────────
// INICIO DE JUEGO
// ─────────────────────────────────────────────────────
function _startGame(levelIndex, playerName, savedState) {
  AUDIO.music('off');
  if (!savedState && levelIndex === 0) { window._carryStars = 0; window._carrySuns = 0; }

  window.GAME = new Game();
  window.GAME.playerName = playerName || 'Jugador';
  _showScreen('game');
  _applyCompactGameUI();
  _requestFullscreenPreferred(true);
  _updateFullscreenButton();
  setTimeout(() => {
    window.GAME.startLevel(levelIndex, savedState || null);
    _checkOrientation();
    // Mostrar tour en primera partida del usuario
    if (!savedState && typeof window._checkShowTourOnStart === 'function') {
      window._checkShowTourOnStart();
    }
  }, 50);
  _initGameButtons(levelIndex);
  if (_isCompactDevice()) {
    setTimeout(() => {
      if (!document.fullscreenElement) _toast('Pulsa ⛶ si quieres pantalla completa.');
    }, 1200);
  }
}

function _loadSavedGame() {
  const s = STORAGE.load();
  if (!s) return;
  window._playerName = s.playerName || 'Jugador';
  _startGame(s.level || 0, window._playerName, s);
}

// ─────────────────────────────────────────────────────
// BOTONES IN-GAME
// ─────────────────────────────────────────────────────
function _initGameButtons(levelIndex) {
  const ids=['btn-fullscreen','btn-pause','btn-resume','btn-save','btn-restart','btn-quit-game','btn-level-next','btn-level-menu','btn-vict-menu','btn-def-retry','btn-def-menu'];
  ids.forEach(id=>{ const old=document.getElementById(id); if(old){ const fresh=old.cloneNode(true); old.parentNode.replaceChild(fresh, old); } });
  _on('btn-fullscreen', () => { AUDIO.play('select'); _toggleFullscreen(); setTimeout(_updateFullscreenButton, 120); });
  // Pausa
  _on('btn-pause', () => {
    AUDIO.play('select');
    document.getElementById('screen-pause').classList.add('active');
    window.GAME && window.GAME.pause();
  });
  _on('btn-resume', () => {
    AUDIO.play('select');
    document.getElementById('screen-pause').classList.remove('active');
    window.GAME && window.GAME.resume();
  });
  _on('btn-save', () => { AUDIO.play('select'); window.GAME && window.GAME.saveGame(); });
  _on('btn-restart', () => {
    AUDIO.play('select');
    document.getElementById('screen-pause').classList.remove('active');
    _clearOverlays();
    _startGame(levelIndex, window._playerName);
  });
  _on('btn-quit-game', () => {
    AUDIO.play('select');
    window.GAME && (window.GAME.running = false);
    AUDIO.music('off');
    _clearOverlays();
    _showScreen('intro');
    setTimeout(() => AUDIO.music('eerie'), 600);
  });

  // Fin de nivel
  _on('btn-level-next', () => {
    AUDIO.play('select');
    _clearOverlays();
    const nextIdx = (window.GAME ? window.GAME.currentLevel + 1 : levelIndex + 1);
    if (nextIdx < LEVELS.length) {
      _startGame(nextIdx, window._playerName);
    } else {
      // Ya terminó todo → mostrar victoria total
      const victEl = document.getElementById('screen-victory');
      if (victEl) {
        document.getElementById('vict-score').textContent =
          (window.GAME ? window.GAME.score : 0).toLocaleString('es-ES');
        document.getElementById('vict-stars').innerHTML =
          '⭐'.repeat(STORAGE.getTotalStars());
        victEl.classList.add('active');
      }
      _launchConfetti();
    }
  });
  _on('btn-level-menu', () => {
    AUDIO.play('select');
    _clearOverlays();
    _showScreen('intro');
    setTimeout(() => AUDIO.music('eerie'), 600);
  });

  // Victoria total
  _on('btn-vict-menu', () => {
    AUDIO.play('select');
    _clearOverlays();
    _showScreen('intro');
    setTimeout(() => AUDIO.music('eerie'), 600);
  });

  // Derrota
  _on('btn-def-retry', () => {
    AUDIO.play('select');
    _clearOverlays();
    _startGame(levelIndex, window._playerName);
  });
  _on('btn-def-menu', () => {
    AUDIO.play('select');
    _clearOverlays();
    _showScreen('intro');
    setTimeout(() => AUDIO.music('eerie'), 600);
  });
}

function _clearOverlays() {
  document.querySelectorAll('.overlay-screen').forEach(s => s.classList.remove('active'));
  window.GAME && (window.GAME.running = false);
}

// ─────────────────────────────────────────────────────
// RANKING
// ─────────────────────────────────────────────────────
function _showRanking() {
  const list = STORAGE.getRanking();
  const el   = document.getElementById('ranking-list');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<p style="text-align:center;color:#666;padding:20px">Aún no hay puntuaciones.</p>';
    return;
  }
  el.innerHTML = list.map((e, i) => `
    <div class="rank-row">
      <span class="rank-pos">${i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'.'}  </span>
      <span class="rank-name">${e.name}</span>
      <span class="rank-score">${e.score.toLocaleString('es-ES')} pts</span>
      <span class="rank-level">Nv.${e.level}</span>
      <span class="rank-date">${e.date}</span>
    </div>
  `).join('');
}
_on('btn-back-ranking', () => { AUDIO.play('select'); _showScreen('intro'); });

// ─────────────────────────────────────────────────────
// LOGROS
// ─────────────────────────────────────────────────────
function _showLogros() {
  const el = document.getElementById('logros-list');
  if (!el) return;
  const defs   = STORAGE.getLogrosDef();
  const earned = STORAGE.getLogrosEarned();
  el.innerHTML = defs.map(l => {
    const isEarned = earned.includes(l.id);
    return `
      <div class="logro-row ${isEarned ? 'earned' : 'logro-locked'}">
        <div class="logro-icon">${isEarned ? l.emoji : '🔒'}</div>
        <div class="logro-info">
          <div class="logro-title">${isEarned ? l.title : '???'}</div>
          <div class="logro-desc">${isEarned ? l.desc : 'Sigue jugando para desbloquear'}</div>
        </div>
        ${isEarned ? '<span style="color:#ffd700">✓</span>' : ''}
      </div>
    `;
  }).join('');
}
_on('btn-back-logros', () => { AUDIO.play('select'); _showScreen('intro'); });

// ─────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────
window._launchConfetti = function() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#ff2244','#ffd700','#00e676','#00e5ff','#9c27b0','#ff6d00','#ffffff'];
  const emojis  = ['🎉','⭐','🌟','💫','🎊','✨'];

  for (let i = 0; i < 60; i++) {
    const isEmoji = Math.random() < 0.3;
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    if (isEmoji) {
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.background = 'transparent';
      el.style.fontSize = '20px';
      el.style.width = '24px'; el.style.height = '24px';
    } else {
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.width  = (6 + Math.random() * 10) + 'px';
      el.style.height = (10 + Math.random() * 14) + 'px';
    }
    el.style.left  = Math.random() * 100 + 'vw';
    el.style.setProperty('--dur',   (1.5 + Math.random() * 2) + 's');
    el.style.setProperty('--delay', (Math.random() * 1.2) + 's');
    el.style.setProperty('--tx',    (Math.random() * 120 - 60) + 'px');
    container.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
};

// ─────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────
function _showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${name}`);
  if (target) {
    target.classList.add('active');
    if (name !== 'game') document.body.classList.remove('seed-drawer-open');
    target.scrollTop = 0;
    target.querySelectorAll('.modal-card,.modal-tall,.modal-wide').forEach(el => { el.scrollTop = 0; });
  }
  if (name === 'game') _checkOrientation();
}

function _on(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

function _toast(msg, ms = 2500) {
  const el = document.getElementById('ui-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => el.classList.add('hidden'), ms);
}

// ESC para pausa
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const pauseScr = document.getElementById('screen-pause');
    if (!pauseScr) return;
    if (window.GAME && !window.GAME.paused && !window.GAME.gameOver) {
      document.getElementById('btn-pause')?.click();
    } else if (window.GAME && window.GAME.paused) {
      document.getElementById('btn-resume')?.click();
    }
  }
});

// ─────────────────────────────────────────────────────
// C1 — AUDIO SILENCIO AL SALIR DE PESTAÑA
// Cuando el usuario cambia de pestaña o minimiza el navegador
// sin cerrarla, el setInterval de audio.js seguía corriendo.
// ─────────────────────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pestaña oculta: silenciar y pausar juego si estaba activo
    AUDIO.stopMusic();
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen?.classList.contains('active') &&
        window.GAME && window.GAME.running &&
        !window.GAME.paused && !window.GAME.gameOver) {
      const pauseScr = document.getElementById('screen-pause');
      if (pauseScr) pauseScr.classList.add('active');
      window.GAME.pause();
    }
  } else {
    // Pestaña visible: el juego queda en pausa (usuario resume manualmente).
    // Si estamos en menú, restaurar música de intro.
    const gameActive = document.getElementById('screen-game')?.classList.contains('active');
    if (!gameActive) AUDIO.music('eerie');
  }
});

// Cierre de pestaña / navegación: asegura que no quede audio colgado
window.addEventListener('pagehide', () => { AUDIO.stopMusic(); });

console.log(
  '%c🌼 Martín y Emilia contra los Zombies de Sausalito v2.4.1\n%c🎂 ¡Feliz Cumpleaños Martín! De Papá José con todo el amor ❤️',
  'color:#ff2244;font-weight:bold;font-size:16px',
  'color:#ffd700;font-size:13px'
);

// ═══════════════════════════════════════════════════════════════════
// TOUR INTERACTIVO — 8 pasos que cubren las mecánicas clave
// ═══════════════════════════════════════════════════════════════════
const TOUR_STEPS = [
  { icon:'☀️', title:'Los Soles son tu moneda',
    body:'Caen del cielo automáticamente y también los produce la <b>🌼 Margarita</b>. ¡Tócalos rápido antes de que desaparezcan! Sin soles no puedes plantar nada.',
    combo:'' },
  { icon:'🌱', title:'Cómo plantar',
    body:'Toca una carta en la <b>bandeja inferior</b> para seleccionarla, luego toca cualquier casilla vacía del tablero para plantarla. Toca a la derecha para cancelar.',
    combo:'' },
  { icon:'🧟', title:'Los Zombies avanzan',
    body:'Entran por la <b>derecha</b> y avanzan hacia tus plantas. Si llegan al borde izquierdo sin ser detenidos, <b>activan la tostadora</b> de esa fila y tú pierdes esa defensa.',
    combo:'' },
  { icon:'🍞', title:'Las Tostadoras son tu última defensa',
    body:'Cada fila tiene una 🍞 tostadora al final. Cuando un zombie la alcanza, <b>explota y elimina toda la fila</b>, pero se consume para siempre. ¡Cuídalas!',
    combo:'' },
  { icon:'⭐', title:'Llama ayudantes con Estrellas',
    body:'Las <b>⭐ Estrellas</b> caen del tablero y se acumulan. Con ellas puedes invocar a <b>Emilia, Martín, Super Papá y el Alien</b> — cada uno activa un superpoder donde los ubiques.',
    combo:'💡 Las estrellas se conservan entre niveles (la mitad al pasar)' },
  { icon:'🔀', title:'Las Combinaciones son tu arma secreta',
    body:'Planta <b>dos plantas del mismo tipo en casillas adyacentes</b> y se fusionan automáticamente en algo más poderoso. La clave para ganar niveles difíciles es combinar estratégicamente.',
    combo:'🌼 + 🍄 = <b>Cosecha Solar</b> → soles el doble de rápido' },
  { icon:'💡', title:'Combos imprescindibles',
    body:'Algunas fusiones transforman por completo tu estrategia. Aprende las más poderosas y úsalas antes de que llegue la primera oleada.',
    combo:'🟢 + 🟢 = <b>Doble Disparo</b> · 🌵 + 🌵 = <b>Gran Muro</b> · 💣 + 💣 = <b>Bomba Doble</b>' },
  { icon:'🏆', title:'¡Ya estás listo para defender Sausalito!',
    body:'Usa el tiempo de preparación antes de cada oleada para colocar tus plantas. Empieza con margaritas, luego ataque, luego defensa. ¡Buena suerte, defensor!',
    combo:'💡 Puedes volver a ver este tour desde la pantalla "Cómo Jugar"' },
];

let _tourStep = 0;

function _buildTourDots() {
  const prog = document.getElementById('tour-progress');
  if (!prog) return;
  prog.innerHTML = '';
  TOUR_STEPS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'tour-dot' + (i < _tourStep ? ' done' : i === _tourStep ? ' active' : '');
    prog.appendChild(d);
  });
}

function _renderTourStep() {
  const step = TOUR_STEPS[_tourStep];
  if (!step) return;
  document.getElementById('tour-icon').textContent  = step.icon;
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-body').innerHTML    = step.body;
  const comboEl = document.getElementById('tour-combo');
  if (step.combo) {
    comboEl.innerHTML = step.combo;
    comboEl.classList.remove('hidden');
  } else {
    comboEl.classList.add('hidden');
  }
  const btn = document.getElementById('btn-tour-next');
  if (btn) btn.textContent = _tourStep < TOUR_STEPS.length - 1 ? 'Siguiente →' : '¡A jugar! 🎮';
  _buildTourDots();
}

function _showTour() {
  _tourStep = 0;
  _renderTourStep();
  const ov = document.getElementById('tour-overlay');
  if (ov) ov.classList.add('active');
}

function _closeTour() {
  const ov = document.getElementById('tour-overlay');
  if (ov) ov.classList.remove('active');
}

_on('btn-tour-next', () => {
  AUDIO.play('select');
  if (_tourStep < TOUR_STEPS.length - 1) {
    _tourStep++;
    _renderTourStep();
  } else {
    _closeTour();
  }
});
_on('btn-tour-skip', () => { AUDIO.play('select'); _closeTour(); });

// Mostrar tour en primera partida del usuario
function _checkShowTour() {
  const key = 'saus_tour_seen_' + (STORAGE.getCurrentUser() || 'guest');
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, '1');
    setTimeout(_showTour, 800);
  }
}

// Acceso desde pantalla "Cómo Jugar"
const howtoGoBtn = document.getElementById('btn-howto-go');
if (howtoGoBtn) {
  const orig = howtoGoBtn.onclick;
  // Añadir botón de tour junto al CTA del howto
  const tourBtn = document.createElement('button');
  tourBtn.className = 'btn btn-ghost btn-big';
  tourBtn.style.marginTop = '6px';
  tourBtn.textContent = '🎮 Ver tutorial interactivo';
  tourBtn.addEventListener('click', () => { AUDIO.play('select'); _showTour(); });
  howtoGoBtn.parentNode.insertBefore(tourBtn, howtoGoBtn.nextSibling);
}

// ═══════════════════════════════════════════════════════════════════
// TIP POST-NIVEL — consejo contextual según el nivel completado
// ═══════════════════════════════════════════════════════════════════
const LEVEL_TIPS_DATA = [
  /* 0  */ { icon:'🌼', title:'¡Primera victoria! Economía solar',
             body:'La <b>🌼 Margarita</b> es tu motor. Sin soles no hay defensa. Plántala siempre en las primeras casillas de cada nivel.',
             combo:'🌼 + 🍄 Hongito = <b>Cosecha Solar</b> — soles el doble de rápido, sin costo extra' },
  /* 1  */ { icon:'🎯', title:'Potencia tu ataque',
             body:'La <b>🟢 Alberja</b> dispara derecho a través de toda la fila. Cuantas más filas defiendas con ella, más zombies caen antes de llegar.',
             combo:'🟢 + 🟢 = <b>Doble Disparo</b> — misma casilla, el doble de balas' },
  /* 2  */ { icon:'🍄', title:'El Hongito no cuesta nada',
             body:'El <b>🍄 Hongito</b> cuesta 0 soles y activa fusiones clave. Úsalo para combinar con la Margarita o como comodín de posición.',
             combo:'🍄 + 🌼 = <b>Cosecha Solar</b> · 🍄 + 🍄 = <b>Hongito Nube</b> (teletransporte)' },
  /* 3  */ { icon:'🧊', title:'Congela y gana tiempo',
             body:'La <b>❄️ Flor Escarcha</b> ralentiza a todos los zombies de su fila. Úsala en la fila más amenazada para que tus atacantes tengan más tiempo de disparar.',
             combo:'❄️ + 🟢 = <b>Congeladora Disparadora</b> — ralentiza y dispara a la vez' },
  /* 4  */ { icon:'⛽', title:'Fuego a todo el carril',
             body:'La <b>⛽ Gasolina</b> crea una zona de fuego continua en su fila. Los zombies que cruzan se queman lentamente — ideal para oleadas densas.',
             combo:'⛽ + 💣 = <b>Explosión Incendiaria</b> — la bomba prende la gasolina' },
  /* 5  */ { icon:'🪨', title:'Construye murallas invencibles',
             body:'El <b>🪨 Gran Muro</b> es el defensor más resistente. Dos muros espina juntos se fusionan automáticamente en él. Colócalo frente a tus plantas atacantes.',
             combo:'🌵 + 🌵 = <b>Gran Muro 🪨</b> — HP doble, aguanta jefes zombie' },
  /* 6  */ { icon:'🌀', title:'Onda sísmica: destrucción masiva',
             body:'La <b>🌀 Onda Sísmica</b> golpea a TODOS los zombies de su fila simultáneamente. Úsala cuando se acumule una horda densa en un carril.',
             combo:'💣 + 💣 = <b>Bomba Doble</b> — explosión de área dos veces más grande' },
  /* 7  */ { icon:'🌸', title:'Control mental de zombies',
             body:'La <b>🌸 Narcótica</b> revierte el movimiento: los zombies afectados atacan a sus propios compañeros. Úsala cuando haya un jefe zombie avanzando.',
             combo:'🌸 + ❄️ = Zombies <b>confundidos Y congelados</b> — combinación devastadora' },
  /* 8  */ { icon:'🔥', title:'Fuego + Proyectiles = devastación',
             body:'La <b>🔥 Flor de Fuego</b> lanza proyectiles que queman en área. Combínala con la Berenjena para crear proyectiles de fuego de largo alcance.',
             combo:'🔥 + 🍆 = <b>Quema Doble</b> — proyectiles que queman al impactar' },
  /* 9  */ { icon:'🦸', title:'El poder de los ayudantes',
             body:'Con suficientes <b>⭐ Estrellas</b> puedes llamar a los ayudantes. <b>Super Papá</b> elimina una columna entera de zombies al instante. ¡Guarda estrellas para los momentos críticos!',
             combo:'Super Papá: daño masivo en área · Alien: congela y confunde a todos · Emilia: soles dobles' },
  /* 10 */ { icon:'👾', title:'Primer jefe zombie — ¡preparado!',
             body:'Los jefes necesitan múltiples impactos para caer. Prepara <b>doble línea de ataque</b> y ten una Onda Sísmica lista para cuando entre el jefe.',
             combo:'💣 + 🌀 = <b>Bomba Sísmica</b> — perfecto contra jefes resistentes' },
  /* 11 */ { icon:'🧲', title:'El Cuadro Imán recoge todo',
             body:'El <b>🧲 Cuadro Imán</b> recoge instantáneamente todos los soles y estrellas visibles. Úsalo cuando el tablero esté lleno de pickups sin recoger.',
             combo:'🧲 cuesta solo 20☀️ y recupera mucho más de lo que cuesta' },
  /* 12 */ { icon:'💎', title:'Combos de élite desbloqueados',
             body:'A partir de aquí los zombies vienen más rápidos y en oleadas más densas. La clave es tener <b>al menos dos capas de defensa</b>: atacantes + muro + tostadora.',
             combo:'🍆 + 🥦 = <b>Berencoli</b> — planta fusionada de largo alcance y área' },
  /* 13 */ { icon:'⚡', title:'Velocidad y estrategia',
             body:'Los zombies corredores llegan antes que los básicos. Prioriza la <b>❄️ Escarcha</b> para igualar velocidades y que tus plantas puedan apuntarlos a todos.',
             combo:'❄️ + 🔥 = <b>Fuego Frío</b> — ralentiza Y quema a la vez' },
  /* 14 */ { icon:'🌟', title:'Mitad del camino — eres un pro',
             body:'Has superado la mitad de Sausalito. Desde aquí los niveles requieren <b>economía sólida + defensa en capas + uso de ayudantes</b>. No guardes los poderes, úsalos.',
             combo:'Recuerda: las ⭐ estrellas se conservan entre niveles. ¡Acumúlalas para los jefes!' },
  /* 15+ */ { icon:'💀', title:'Oleadas de élite',
              body:'Los zombies oscuros y espectrales tienen habilidades únicas. Los oscuros son resistentes, los espectrales se mueven en zigzag. Cambia tu estrategia por fila.',
              combo:'🌸 + 🌀 = <b>Confusión Masiva</b> — revierte Y golpea a toda la fila' },
];

// Obtener tip para el nivel completado (0-indexed)
function _getLevelTipData(levelIdx) {
  const idx = Math.min(levelIdx, LEVEL_TIPS_DATA.length - 1);
  return LEVEL_TIPS_DATA[idx];
}

// Inyectar el tip en la pantalla de nivel completado
window._injectLevelTip = function(levelIdx, hasNext) {
  const tipEl = document.getElementById('level-end-tip');
  if (!tipEl) return;
  if (!hasNext) { tipEl.classList.add('hidden'); return; }

  const tip = _getLevelTipData(levelIdx);
  if (!tip) { tipEl.classList.add('hidden'); return; }

  const comboHtml = tip.combo
    ? `<div class="tip-combo">💡 <b>Combina:</b> ${tip.combo}</div>` : '';

  tipEl.innerHTML = `
    <div class="tip-title">${tip.icon} ${tip.title}</div>
    <div>${tip.body}</div>
    ${comboHtml}
  `;
  tipEl.classList.remove('hidden');
};

// Mostrar tour en primera partida — se llama desde _startGame
const _origStartGame = window._startGame;
// Hook: cuando el nombre queda confirmado con intento=false (nueva partida)
const _origBtnEmpezar = document.getElementById('btn-empezar');
// El hook de tour se activa desde _checkShowTour que se llama al iniciar nivel
window._checkShowTourOnStart = _checkShowTour;

// ─────────────────────────────────────────────────────
// TOUR TABS — navegación del howto
// ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tour-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tour-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tour-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tour-' + tab);
      if (panel) panel.classList.add('active');
      AUDIO.play('select');
    });
  });
  // Resetear a tab inicial cada vez que se muestra el howto
  const howtoScreen = document.getElementById('screen-howto');
  if (howtoScreen) {
    const observer = new MutationObserver(() => {
      if (howtoScreen.classList.contains('active')) {
        document.querySelectorAll('.tour-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tour-panel').forEach(p => p.classList.remove('active'));
        const firstTab = document.querySelector('.tour-tab[data-tab="basico"]');
        const firstPanel = document.getElementById('tour-basico');
        if (firstTab) firstTab.classList.add('active');
        if (firstPanel) firstPanel.classList.add('active');
      }
    });
    observer.observe(howtoScreen, { attributes: true, attributeFilter: ['class'] });
  }
});

// ─────────────────────────────────────────────────────
// TIPS POST-NIVEL — mensaje contextual al completar
// ─────────────────────────────────────────────────────
window._injectLevelTip = function(levelIndex, hasNext) {
  const el = document.getElementById('level-end-tip');
  if (!el) return;

  const tip = _getLevelTip(levelIndex, hasNext);
  if (!tip) { el.classList.add('hidden'); return; }

  el.innerHTML = `<h4>${tip.icon} ${tip.title}</h4>${tip.body}`;
  el.classList.remove('hidden');
};

function _getLevelTip(idx, hasNext) {
  // idx es 0-based (nivel 1 = idx 0)
  const lv = idx + 1;

  const tips = {
    1: {
      icon:'🌼', title:'¡Primera victoria! Ahora sabes lo básico.',
      body:`<p>La <span class="tip-unlock">🌼 Margarita</span> produce soles automáticamente. Ponla primero, siempre. Sin soles no puedes plantar nada más.<br>
      <span class="tip-hint">💡 Coloca 2 Margaritas al inicio de cada partida para tener flujo constante de soles.</span></p>`
    },
    2: {
      icon:'🍄', title:'¡El Hongito es tu mejor amigo!',
      body:`<p>El <span class="tip-unlock">🍄 Hongito no cuesta soles</span>. Úsalo como defensa gratuita en cualquier fila.<br>
      <span class="tip-hint">💡 Combo secreto: pon 🍄 Hongito <em>junto</em> a 🌼 Margarita → la Margarita produce el <strong>doble de soles</strong> automáticamente.</span></p>`
    },
    3: {
      icon:'🌀', title:'¡Descubriste la fusión!',
      body:`<p>Cuando dos plantas compatibles quedan <span class="tip-unlock">adyacentes en el tablero se fusionan</span> solas en algo más poderoso.<br>
      <span class="tip-hint">💡 Prueba: 🍄 + 🫛 Alberja = <strong>🌀 Alberhongo</strong> que dispara gratis. 🌼 + 🌼 = <strong>✨ Supermargarita</strong> que produce el doble de soles.</span></p>`
    },
    4: {
      icon:'❄️', title:'¡Acaban de llegar el frío y el fuego!',
      body:`<p><span class="tip-unlock">❄️ Flor Escarcha</span> congela a todos los zombies de su fila. <span class="tip-unlock">⛽ Gasolina</span> deja fuego al pasar.<br>
      <span class="tip-hint">💡 Estrategia ganadora: Gasolina + Ají Explosivo en la misma fila = barrera de fuego instantánea que limpia toda la oleada.</span></p>`
    },
    5: {
      icon:'👧', title:'¡Emilia entra al rescate!',
      body:`<p>Ya puedes usar ayudantes con las <span class="tip-unlock">⭐ estrellas</span> que acumulas matando zombies.<br>
      <span class="tip-hint">💡 Emilia (30⭐) congela y daña. Invócala cuando veas 3 o más zombies apilados en una fila. ¡Las estrellas se guardan entre niveles!</span></p>`
    },
    6: {
      icon:'🥦', title:'¡Aparecen zombies con casco!',
      body:`<p>Los <span class="tip-unlock">zombies con casco absorben más daño</span>. Necesitas más poder de ataque.<br>
      <span class="tip-hint">💡 Combo: <strong>🥦 Brócoli</strong> ralentiza zombies → da tiempo a tus atacantes de destruirlos. Fusión 🍆 Berenjena + 🥦 Brócoli = <strong>Berencoli</strong> que ralentiza y ataca.</span></p>`
    },
    7: {
      icon:'🧒', title:'¡Martín se une a la defensa!',
      body:`<p><span class="tip-unlock">🧒 Martín (50⭐)</span> dispara en todas las direcciones a la vez. Perfecto para defender cuando hay zombies en múltiples filas.<br>
      <span class="tip-hint">💡 Colócalo en el centro del tablero para que su poder alcance las 4 filas. Ahorra estrellas desde ahora.</span></p>`
    },
    8: {
      icon:'💀', title:'¡Los zombies ahora atacan en grupos!',
      body:`<p>Las oleadas se ponen serias. Necesitas <span class="tip-unlock">defensa en profundidad</span>: Muro adelante, atacante atrás.<br>
      <span class="tip-hint">💡 Fusión de emergencia: <strong>🍄 + 🍄 = 💀 Superhongo</strong>. Dos hongitos gratuitos que se fusionan en un defensor resistente sin gastar soles.</span></p>`
    },
    9: {
      icon:'🌀', title:'¡Onda Sísmica desbloqueada!',
      body:`<p><span class="tip-unlock">🌀 Onda Sísmica</span> empuja a TODOS los zombies de vuelta a la derecha.<br>
      <span class="tip-hint">💡 Úsala cuando una oleada esté casi al final del tablero. Les da a tus plantas varios segundos extra para atacar. Una Onda bien timed puede cambiar una derrota en victoria.</span></p>`
    },
    10: {
      icon:'🦸‍♂️', title:'¡Primer jefe zombie! Aquí llega Super Papá.',
      body:`<p>Los <span class="tip-unlock">jefes tienen escudo de energía</span>: son inmunes al daño hasta que sus minions mueren.<br>
      <span class="tip-hint">💡 Guarda estrellas para <strong>🦸‍♂️ Super Papá (70⭐)</strong>. Su golpe masivo destruye el escudo del jefe. Prioridad: elimina los minions rápido, luego invoca a Super Papá.</span></p>`
    },
    11: {
      icon:'🌸', title:'¡La Narcótica divide al enemigo!',
      body:`<p><span class="tip-unlock">🌸 Narcótica</span> confunde zombies: ¡se atacan entre ellos durante unos segundos!<br>
      <span class="tip-hint">💡 Colócala en la fila con más zombies justo cuando estén apilados. Mientras se atacan entre sí, tus plantas los rematan fácilmente. Es gratis caos para el enemigo.</span></p>`
    },
    12: {
      icon:'🚗', title:'¡El Autito es tu comodín!',
      body:`<p><span class="tip-unlock">🚗 Autito (30⭐/1000pts)</span> arrolla toda una fila de izquierda a derecha destruyendo todo a su paso.<br>
      <span class="tip-hint">💡 Úsalo en la fila más comprometida. Solo necesitas 30 estrellas y 1000 puntos. Es más barato que los otros ayudantes y muy efectivo en emergencias.</span></p>`
    },
    15: {
      icon:'⭐', title:'¡Mitad del camino! Ya eres un estratega.',
      body:`<p>Has llegado al nivel 15. Ya conoces las fusiones y los ayudantes. Ahora viene la <span class="tip-unlock">parte difícil: jefes más resistentes y oleadas de élite</span>.<br>
      <span class="tip-hint">💡 Estrategia maestra: Margarita + Hongito (sinergia solar) → Muro delante → Alberja/Berenjena detrás → Escarcha al final de cada fila. Esa base aguanta casi todo.</span></p>`
    },
    20: {
      icon:'👽', title:'¡Nivel 20! El Alien cambia las reglas.',
      body:`<p><span class="tip-unlock">👽 Alien (90⭐)</span> teletransporta zombies fuera del tablero. Es el más caro pero el más dramático.<br>
      <span class="tip-hint">💡 Guarda el Alien para el momento exacto en que el jefe final esté a punto de llegar al final. Una teletransportación en ese momento puede salvar la partida entera.</span></p>`
    },
    25: {
      icon:'🏆', title:'¡Nivel 25! Solo 5 niveles para salvar Sausalito.',
      body:`<p>El Dr. Zombra manda sus mejores tropas. Necesitas todo lo aprendido.<br>
      <span class="tip-hint">💡 Recuerda: usa el <strong>🌼+🌼 = ✨Supermargarita</strong> para máximos soles, <strong>Super Papá</strong> para el jefe, y <strong>Onda Sísmica</strong> para respiros en oleadas masivas. ¡Tú puedes!</span></p>`
    },
    30: {
      icon:'🎊', title:'¡¡LEYENDA!! Sausalito está a salvo.',
      body:`<p>Has completado los <span class="tip-unlock">30 niveles</span>. Martín y Emilia han derrotado al Dr. Zombra.<br>
      <span class="tip-hint">🧡 Este juego fue creado con todo el amor de Papá José para Martín José en sus 9 años. ¡Feliz cumpleaños, campeón!</span></p>`
    },
  };

  // Mensaje genérico para niveles sin tip específico
  const generic = [
    { icon:'🌱', title:'¡Buen trabajo!', body:`<span class="tip-hint">💡 Recuerda: el 🍄 Hongito es gratuito. Combínalo con cualquier planta adyacente para activar fusiones o sinergias sin gastar soles.</span>` },
    { icon:'⚗️', title:'¡Sigue combinando!', body:`<span class="tip-hint">💡 Las fusiones ocurren automáticamente cuando dos plantas compatibles quedan lado a lado. Experimenta con diferentes combinaciones.</span>` },
    { icon:'🎯', title:'¡Nivel superado!', body:`<span class="tip-hint">💡 Estrategia clave: siempre pon al menos 2 🌼 Margaritas al inicio para garantizar flujo de soles. Sin soles no hay defensa.</span>` },
    { icon:'🌊', title:'¡Excelente defensa!', body:`<span class="tip-hint">💡 La 🌀 Onda Sísmica empuja a todos los zombies hacia atrás. Úsala cuando la situación se ponga crítica para ganar tiempo.</span>` },
    { icon:'⭐', title:'¡Las estrellas se acumulan!', body:`<span class="tip-hint">💡 Conservas la mitad de tus estrellas al pasar de nivel. Ahorra estrellas en niveles fáciles para los jefes difíciles.</span>` },
  ];

  if (!hasNext) {
    return tips[30] || { icon:'🏆', title:'¡Victoria Total!', body:`<span class="tip-hint">¡Has salvado Sausalito! 🧡</span>` };
  }

  return tips[lv] || generic[lv % generic.length];
}

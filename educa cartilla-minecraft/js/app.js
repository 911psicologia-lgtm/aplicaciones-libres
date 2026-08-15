/**
 * ============================================================================
 * CARTILLA CRAFT — Main Application Controller (app.js)
 * ============================================================================
 * Ties together the gamification engine and questions database to create a
 * complete interactive Minecraft-themed evaluation experience for kids.
 *
 * Dependencies (load order matters):
 *   1. questions.js   — provides QUESTIONS_DB
 *   2. gamification.js — provides GameEngine class
 *   3. app.js          — this file (provides the App singleton)
 *
 * @module app
 */

/* eslint-disable no-unused-vars */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Maps HTML data-area values to QUESTIONS_DB / engine area keys.
 * The HTML uses "ciencias" for the biome card, but the DB and engine use
 * "naturales" as the canonical key.
 * @readonly
 */
const HTML_TO_DB_AREA = Object.freeze({
  ingles: 'ingles',
  lenguaje: 'lenguaje',
  matematicas: 'matematicas',
  ciencias: 'naturales',
  sociales: 'sociales',
});

/**
 * Reverse mapping: DB area key → HTML data-area value.
 * @readonly
 */
const DB_TO_HTML_AREA = Object.freeze({
  ingles: 'ingles',
  lenguaje: 'lenguaje',
  matematicas: 'matematicas',
  naturales: 'ciencias',
  sociales: 'sociales',
});

/**
 * Number of missions per area as defined in QUESTIONS_DB and the HTML.
 * NOTE: The engine constant MISSIONS_PER_AREA is 5 but the actual data has 4.
 */
const APP_MISSIONS_PER_AREA = 4;

/** Number of questions per mission. */
const APP_QUESTIONS_PER_MISSION = 5;

/**
 * Resource display configuration — used for the inventory UI.
 * @readonly
 */
const RESOURCE_CONFIG = Object.freeze({
  enderPearls:   { name: 'Perlas de Ender',     icon: '🔮', htmlId: 'ender-pearl' },
  emeralds:      { name: 'Esmeraldas',           icon: '💎', htmlId: 'emerald' },
  diamonds:      { name: 'Diamantes',            icon: '💠', htmlId: 'diamond' },
  goldenApples:  { name: 'Manzanas Doradas',     icon: '🍎', htmlId: 'golden-apple' },
  goldNuggets:   { name: 'Pepitas de Oro',       icon: '🪙', htmlId: 'gold-nugget' },
});

/**
 * Rank definitions for the results screen.
 * @readonly
 */
const RANKS = Object.freeze({
  'Madera':    { color: '#8B6914', icon: '🪵' },
  'Piedra':    { color: '#808080', icon: '🪨' },
  'Hierro':    { color: '#C0C0C0', icon: '⚒️' },
  'Oro':       { color: '#FFD700', icon: '🥇' },
  'Diamante':  { color: '#4AEDD9', icon: '💎' },
  'Netherite': { color: '#4A3B32', icon: '🔥' },
});

/** All area keys in QUESTIONS_DB order. */
const ALL_AREA_KEYS = ['ingles', 'lenguaje', 'matematicas', 'naturales', 'sociales'];

/** Character definitions matching the HTML data-character values. */
const CHARACTERS = Object.freeze({
  steve:    { id: 'steve',    name: 'Steve',    icon: '🧑', skin: 'steve' },
  alex:     { id: 'alex',     name: 'Alex',     icon: '👩', skin: 'alex' },
  zombie:   { id: 'zombie',   name: 'Zombie',   icon: '🧟', skin: 'zombie' },
  creeper:  { id: 'creeper',  name: 'Creeper',  icon: '💚', skin: 'creeper' },
  enderman: { id: 'enderman', name: 'Enderman', icon: '👾', skin: 'enderman' },
  pig:      { id: 'pig',      name: 'Pig',      icon: '🐷', skin: 'pig' },
});

/** Biome emoji icons for each area key. */
const BIOME_ICONS = Object.freeze({
  ingles: '🌌',
  lenguaje: '🏘️',
  matematicas: '⛏️',
  naturales: '🌳',
  sociales: '🔥',
});

/** Encouraging messages shown after wrong answers. */
const ENCOURAGEMENTS = [
  '¡Sigue intentando, aventurero! 💪',
  '¡Casi lo logras! La próxima será mejor 🌟',
  '¡No te rindas! Cada error te enseña algo nuevo 📚',
  '¡Estás aprendiendo mucho! Sigue así 🚀',
  '¡Muy bien por intentarlo! Eres valiente 🛡️',
  '¡Confía en ti! Ya sabes más que antes 🧠',
  '¡Los mejores exploradores también se equivocan! ⛏️',
  '¡Vas por buen camino! No te detengas 🏃',
  '¡Eso fue difícil! Pero tú puedes con todo 💎',
  '¡ Increíble esfuerzo! Sigue aventurando 🗺️',
];

/** Time in ms before auto-advancing from feedback screen. */
const FEEDBACK_AUTO_ADVANCE_MS = 3000;

// ============================================================================
// SOUND FX — Web Audio API (retro Minecraft feel)
// ============================================================================

const SoundFX = {
  /** @type {AudioContext|null} */
  _ctx: null,

  /** Lazily create the AudioContext (browsers require user gesture first). */
  _getCtx() {
    if (!this._ctx) {
      try {
        this._ctx = new (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : AudioContext)();
      } catch (e) {
        console.warn('[SoundFX] Web Audio not available:', e);
        return null;
      }
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  },

  /**
   * Play a tone using an oscillator.
   * @param {number} freq - Frequency in Hz.
   * @param {string} type - Oscillator type (square, sine, triangle, sawtooth).
   * @param {number} duration - Duration in seconds.
   * @param {number} [volume=0.15] - Gain 0-1.
   */
  _tone(freq, type, duration, volume = 0.15) {
    const ctx = this._getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  },

  /** Happy ascending beep (C5-E5-G5) */
  correct() {
    this._tone(523.25, 'square', 0.12, 0.12);
    setTimeout(() => this._tone(659.25, 'square', 0.12, 0.12), 100);
    setTimeout(() => this._tone(783.99, 'square', 0.18, 0.12), 200);
  },

  /** Low descending buzz */
  wrong() {
    this._tone(220, 'sawtooth', 0.25, 0.1);
    setTimeout(() => this._tone(180, 'sawtooth', 0.3, 0.08), 150);
  },

  /** Multi-note chime for achievements */
  achievement() {
    this._tone(523.25, 'square', 0.1, 0.1);
    setTimeout(() => this._tone(659.25, 'square', 0.1, 0.1), 80);
    setTimeout(() => this._tone(783.99, 'square', 0.1, 0.1), 160);
    setTimeout(() => this._tone(1046.5, 'square', 0.25, 0.12), 240);
  },

  /** Fanfare (C5-E5-G5-C6) for level-up */
  levelup() {
    this._tone(523.25, 'square', 0.15, 0.12);
    setTimeout(() => this._tone(659.25, 'square', 0.15, 0.12), 120);
    setTimeout(() => this._tone(783.99, 'square', 0.15, 0.12), 240);
    setTimeout(() => this._tone(1046.5, 'square', 0.4, 0.15), 360);
  },

  /** Simple click */
  click() {
    this._tone(800, 'square', 0.05, 0.08);
  },

  /** Chest opening sound */
  chest() {
    this._tone(300, 'triangle', 0.15, 0.12);
    setTimeout(() => this._tone(450, 'triangle', 0.15, 0.12), 100);
    setTimeout(() => this._tone(600, 'triangle', 0.2, 0.15), 200);
  },
};

// ============================================================================
// MAIN APP CONTROLLER
// ============================================================================

const App = {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  /** @type {GameEngine|null} */
  engine: null,

  /** @type {string|null} Current screen id (e.g. 'welcome', 'map'). */
  currentScreen: null,

  /** @type {string|null} Current area key in QUESTIONS_DB (e.g. 'ingles'). */
  currentArea: null,

  /** @type {number|null} Current mission index (0-based). */
  currentMission: null,

  /** @type {number} Current question index within the mission (0-based). */
  currentQuestionIdx: 0,

  /** @type {number|null} Interval id for question timer. */
  timerInterval: null,

  /** @type {number|null} Timeout id for feedback auto-advance. */
  feedbackTimeout: null,

  /** @type {number} Current consecutive correct-answer streak. */
  streak: 0,

  /** @type {number} Best streak across the whole session. */
  maxStreak: 0,

  /** @type {boolean} Whether the hint has been used for the current question. */
  hintUsed: false,

  /** @type {boolean} Whether the player has already selected an option (prevent double-clicks). */
  optionLocked: false,

  /** @type {number} Timestamp when the current mission started. */
  missionStartTime: 0,

  /** @type {number} Seconds elapsed for the current question. */
  questionElapsedSeconds: 0,

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  /**
   * Initialise the application: create the engine, load saved state, set up
   * event listeners, and navigate to the appropriate first screen.
   */
  init() {
    // Create the gamification engine (loads persisted state from localStorage)
    this.engine = new GameEngine();

    // Set up achievement toast listener
    this.engine.on('achievement-unlocked', (data) => this.showToast(data));
    this.engine.on('level-up', (data) => {
      SoundFX.levelup();
      this.showToast({
        id: 'level-up',
        name: `¡Nivel ${data.newLevel}!`,
        description: 'Has subido de nivel, aventurero.',
      });
    });

    // Set up delegated event listeners
    this.setupEventListeners();

    // Hide the loading screen after a brief delay (simulates asset loading)
    setTimeout(() => this.hideLoadingScreen(), 800);

    // Determine where to start: returning player → map, new player → welcome
    if (this.engine.state.playerName && this.engine.state.character) {
      this.goToMap();
    } else {
      this.navigate('welcome');
    }
  },

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  /**
   * Navigate to a screen. Hides all screens, then shows the target with a
   * CSS fade animation.
   * @param {string} screenId - The screen element id (without 'screen-' prefix).
   */
  navigate(screenId) {
    const allScreens = document.querySelectorAll('.screen');
    for (const screen of allScreens) {
      screen.classList.remove('active', 'screen--active');
    }

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      // Small delay to allow the hide transition to start
      requestAnimationFrame(() => {
        target.classList.add('active', 'screen--active');
        target.scrollTop = 0;
      });
    }

    this.currentScreen = screenId;

    // Stop question timer when leaving the question screen
    if (screenId !== 'question') {
      this.stopQuestionTimer();
    }

    // Clear any pending feedback auto-advance
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = null;
    }
  },

  /** Refresh map data and navigate to the map screen. */
  goToMap() {
    this.refreshMap();
    this.navigate('map');
  },

  /**
   * Load area data and navigate to the mission selection screen.
   * @param {string} htmlAreaId - The data-area value from the biome card.
   */
  goToArea(htmlAreaId) {
    const areaKey = HTML_TO_DB_AREA[htmlAreaId] || htmlAreaId;
    if (!QUESTIONS_DB[areaKey]) {
      console.warn(`[App] Unknown area: ${areaKey}`);
      return;
    }
    this.currentArea = areaKey;
    this.refreshMissions(areaKey);
    this.navigate('mission');
  },

  /**
   * Start a mission: navigate to the question screen and show the first question.
   * @param {string} areaKey - The QUESTIONS_DB area key.
   * @param {number} missionIdx - 0-based mission index.
   */
  goToMission(areaKey, missionIdx) {
    const area = QUESTIONS_DB[areaKey];
    if (!area || !area.missions[missionIdx]) return;

    // Don't allow replaying completed missions
    const engineMissionId = missionIdx + 1;
    if (this.engine.isMissionComplete(areaKey, engineMissionId)) {
      SoundFX.click();
      return;
    }

    // Don't allow locked missions (must complete previous first)
    if (missionIdx > 0 && !this.engine.isMissionComplete(areaKey, missionIdx)) {
      SoundFX.click();
      return;
    }

    this.currentArea = areaKey;
    this.currentMission = missionIdx;
    this.currentQuestionIdx = 0;
    this.streak = 0;
    this.hintUsed = false;
    this.optionLocked = false;
    this.missionStartTime = Date.now();

    // Reset question option states
    this.resetOptionButtons();

    this.navigate('question');
    this.showQuestion();
  },

  // -------------------------------------------------------------------------
  // Loading Screen
  // -------------------------------------------------------------------------

  /** Hide the loading screen with a fade-out. */
  hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.classList.add('is-hidden');
      loading.addEventListener('transitionend', () => {
        loading.style.display = 'none';
      }, { once: true });
    }
  },

  // -------------------------------------------------------------------------
  // Welcome Screen
  // -------------------------------------------------------------------------

  /** Handle the welcome screen: validate name input and proceed. */
  handleStartAdventure() {
    const input = document.getElementById('player-name-input');
    const name = (input ? input.value : '').trim();

    if (!name) {
      input && input.focus();
      return;
    }

    SoundFX.click();
    this.engine.setPlayerName(name);

    // Restore the saved character if returning
    if (this.engine.state.character) {
      this.goToMap();
    } else {
      this.navigate('character');
    }
  },

  // -------------------------------------------------------------------------
  // Character Selection
  // -------------------------------------------------------------------------

  /** Handle character card click: toggle selected state and enable button. */
  handleCharacterSelect(characterId) {
    const cards = document.querySelectorAll('.mc-character-card');
    for (const card of cards) {
      card.classList.remove('mc-character-card--selected');
      card.setAttribute('aria-checked', 'false');
    }

    const selected = document.querySelector(`.mc-character-card[data-character="${characterId}"]`);
    if (selected) {
      selected.classList.add('mc-character-card--selected');
      selected.setAttribute('aria-checked', 'true');
    }

    const btn = document.getElementById('btn-adventure');
    if (btn) btn.disabled = false;

    SoundFX.click();
  },

  /** Confirm character selection and proceed to the map. */
  handleAdventureStart() {
    const selected = document.querySelector('.mc-character-card--selected');
    if (!selected) return;

    const charId = selected.getAttribute('data-character');
    const charDef = CHARACTERS[charId];
    if (charDef) {
      this.engine.setCharacter(charDef);
    }

    // Start the global session timer
    this.engine.startTimer();

    SoundFX.chest();
    this.goToMap();
  },

  // -------------------------------------------------------------------------
  // Map Screen
  // -------------------------------------------------------------------------

  /** Refresh all dynamic data on the map screen. */
  refreshMap() {
    const state = this.engine.state;

    // --- Player info ---
    const charIcon = document.getElementById('hud-character-icon');
    if (charIcon && state.character) {
      charIcon.textContent = CHARACTERS[state.character.id]
        ? CHARACTERS[state.character.id].icon
        : '🧑';
    }

    const playerName = document.getElementById('hud-player-name');
    if (playerName) {
      playerName.textContent = state.playerName || 'Explorador';
    }

    // --- Level & XP ---
    const levelEl = document.getElementById('hud-level');
    if (levelEl) levelEl.textContent = `Nv. ${state.level}`;

    this.updateXPBar('hud-xp-fill');

    // --- Hearts ---
    this.updateHearts('hud-hearts');

    // --- Resource counters ---
    this.updateResourceCounters();

    // --- Biome cards ---
    for (const dbKey of ALL_AREA_KEYS) {
      const htmlArea = DB_TO_HTML_AREA[dbKey] || dbKey;
      const progress = this.engine.getAreaProgress(dbKey);
      const isComplete = this.engine.isAreaComplete(dbKey);
      const isAvailable = progress > 0 || dbKey === 'ingles' || this._isAnyAreaStarted();

      // Update progress text
      const progressText = document.getElementById(`biome-progress-${htmlArea}`);
      if (progressText) {
        progressText.textContent = `${progress}/${APP_MISSIONS_PER_AREA} misiones`;
      }

      // Update progress bar fill
      const progressFill = document.getElementById(`biome-progress-fill-${htmlArea}`);
      if (progressFill) {
        const pct = (progress / APP_MISSIONS_PER_AREA) * 100;
        progressFill.style.width = `${pct}%`;
      }

      // Update card state classes
      const card = document.querySelector(`.mc-biome-card[data-area="${htmlArea}"]`);
      if (card) {
        card.classList.remove('mc-biome-card--locked', 'mc-biome-card--complete', 'mc-biome-card--available');
        if (isComplete) {
          card.classList.add('mc-biome-card--complete');
        } else if (isAvailable) {
          card.classList.add('mc-biome-card--available');
        } else {
          card.classList.add('mc-biome-card--locked');
        }
      }
    }

    // --- Overall progress ---
    const totalAnswered = state.totalAnswered;
    const overallProgress = document.getElementById('overall-progress');
    if (overallProgress) {
      overallProgress.textContent = `${totalAnswered}/100`;
    }

    const overallFill = document.getElementById('overall-progress-fill');
    if (overallFill) {
      overallFill.style.width = `${totalAnswered}%`;
    }
  },

  /**
   * Navigate to the rewards/inventory screen.
   */
  goToRewards() {
    this.refreshRewards();
    this.navigate('rewards');
  },

  /**
   * Navigate to the results screen.
   */
  goToResults() {
    this.showResults();
    this.navigate('results');
  },

  // -------------------------------------------------------------------------
  // Mission Screen
  // -------------------------------------------------------------------------

  /**
   * Refresh the mission selection screen for a given area.
   * @param {string} areaKey - The QUESTIONS_DB area key.
   */
  refreshMissions(areaKey) {
    const area = QUESTIONS_DB[areaKey];
    if (!area) return;

    const htmlArea = DB_TO_HTML_AREA[areaKey] || areaKey;

    // Area header
    const iconEl = document.getElementById('mission-area-icon');
    if (iconEl) iconEl.textContent = area.icon || BIOME_ICONS[areaKey] || '🗺️';

    const nameEl = document.getElementById('mission-area-name');
    if (nameEl) nameEl.textContent = area.name;

    const biomeEl = document.getElementById('mission-area-biome');
    if (biomeEl) biomeEl.textContent = area.biome;

    // Update each mission chest
    for (let i = 0; i < APP_MISSIONS_PER_AREA; i++) {
      const mission = area.missions[i];
      if (!mission) continue;

      const engineMissionId = i + 1;
      const isComplete = this.engine.isMissionComplete(areaKey, engineMissionId);
      const isAvailable = i === 0 || this.engine.isMissionComplete(areaKey, i);

      // Mission name
      const nameEl = document.getElementById(`mission-name-${i}`);
      if (nameEl) nameEl.textContent = mission.name;

      // Set the data-area attribute on each chest
      const chestEl = document.querySelector(`.mc-chest[data-mission="${i}"]`);
      if (chestEl) {
        chestEl.setAttribute('data-area', areaKey);
      }

      // Status badge
      const statusEl = document.getElementById(`mission-status-${i}`);
      if (statusEl) {
        statusEl.className = 'mc-chest__status-badge';
        if (isComplete) {
          statusEl.textContent = 'Completada';
          statusEl.classList.add('mc-chest__status-badge--completed');
        } else if (isAvailable) {
          statusEl.textContent = 'Disponible';
          statusEl.classList.add('mc-chest__status-badge--available');
        } else {
          statusEl.textContent = 'Bloqueada';
          statusEl.classList.add('mc-chest__status-badge--locked');
        }
      }

      // Lock icon
      const lockEl = chestEl ? chestEl.querySelector('.mc-chest__lock') : null;
      if (lockEl) {
        lockEl.textContent = isAvailable ? '🔓' : '🔒';
      }

      // Stars
      this.updateMissionStars(chestEl, areaKey, engineMissionId);

      // Score
      const scoreEl = document.getElementById(`mission-score-${i}`);
      if (scoreEl) {
        scoreEl.textContent = isComplete ? this._getMissionScore(areaKey, engineMissionId) : '';
      }
    }
  },

  /**
   * Update the star display for a mission chest element.
   * @param {Element|null} chestEl - The .mc-chest element.
   * @param {string} areaKey - Area key.
   * @param {number} missionId - 1-based mission id.
   */
  updateMissionStars(chestEl, areaKey, missionId) {
    if (!chestEl) return;

    const stars = chestEl.querySelectorAll('.star');
    const correct = this._getMissionCorrectCount(areaKey, missionId);
    const total = APP_QUESTIONS_PER_MISSION;
    const accuracy = total > 0 ? correct / total : 0;

    let earnedStars = 0;
    if (accuracy >= 1) earnedStars = 3;
    else if (accuracy >= 0.8) earnedStars = 2;
    else if (accuracy >= 0.6) earnedStars = 1;

    stars.forEach((star, idx) => {
      star.classList.remove('star--filled');
      star.classList.add('star--empty');
      star.textContent = idx < earnedStars ? '★' : '☆';
      if (idx < earnedStars) {
        star.classList.add('star--filled');
        star.classList.remove('star--empty');
      }
    });
  },

  /**
   * Get the score string for a completed mission (e.g. "4/5").
   * @param {string} areaKey
   * @param {number} missionId - 1-based
   * @returns {string}
   */
  _getMissionScore(areaKey, missionId) {
    const correct = this._getMissionCorrectCount(areaKey, missionId);
    return `${correct}/${APP_QUESTIONS_PER_MISSION}`;
  },

  /**
   * Count how many questions were answered correctly in a specific mission.
   * @param {string} areaKey
   * @param {number} missionId - 1-based
   * @returns {number}
   */
  _getMissionCorrectCount(areaKey, missionId) {
    return this.engine.state.questionResults
      .filter(r => r.area === areaKey && r.mission === missionId && r.correct)
      .length;
  },

  // -------------------------------------------------------------------------
  // Question Screen
  // -------------------------------------------------------------------------

  /** Display the current question. */
  showQuestion() {
    const area = QUESTIONS_DB[this.currentArea];
    if (!area) return;

    const mission = area.missions[this.currentMission];
    if (!mission) return;

    const question = mission.questions[this.currentQuestionIdx];
    if (!question) {
      // All questions done — show mission complete
      this.showMissionComplete();
      return;
    }

    // Reset state for this question
    this.hintUsed = false;
    this.optionLocked = false;

    // --- HUD ---
    const areaNameEl = document.getElementById('question-area-name');
    if (areaNameEl) areaNameEl.textContent = area.name;

    const missionLabel = document.getElementById('question-mission-label');
    if (missionLabel) {
      missionLabel.textContent = `Misión ${this.currentMission + 1}/${APP_MISSIONS_PER_AREA}`;
    }

    const questionLabel = document.getElementById('question-number-label');
    if (questionLabel) {
      questionLabel.textContent = `Pregunta ${this.currentQuestionIdx + 1}/${APP_QUESTIONS_PER_MISSION}`;
    }

    // --- XP bar ---
    this.updateXPBar('question-xp-fill');

    // --- Hearts ---
    this.updateHearts('question-hearts');

    // --- Streak ---
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = this.streak;

    // Show streak indicator if streak >= 2
    const streakContainer = document.getElementById('question-streak');
    if (streakContainer) {
      streakContainer.style.display = this.streak >= 2 ? 'flex' : 'none';
    }

    // --- Instruction ---
    const instructionEl = document.getElementById('question-instruction');
    if (instructionEl) instructionEl.textContent = question.instruction || '';

    // --- Question text (support newlines) ---
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
      questionTextEl.innerHTML = this._escapeHtml(question.stem).replace(/\n/g, '<br>');
    }

    // --- Image placeholder ---
    const imageEl = document.getElementById('question-image');
    const imageDescEl = document.getElementById('question-image-desc');
    if (imageEl) {
      if (question.imageDesc) {
        this.showEl(imageEl);
        imageEl.setAttribute('aria-hidden', 'false');
        if (imageDescEl) imageDescEl.textContent = question.imageDesc;
      } else {
        this.hideEl(imageEl);
        imageEl.setAttribute('aria-hidden', 'true');
      }
    }

    // --- Options ---
    const optionLetters = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) {
      const btn = document.querySelector(`.mc-option[data-option="${optionLetters[i]}"]`);
      if (!btn) continue;

      const textEl = document.getElementById(`option-${optionLetters[i]}`);
      if (textEl && question.options[i]) {
        // Strip the "X. " prefix from the option text for cleaner display
        textEl.textContent = question.options[i].replace(/^[A-D]\.\s*/, '');
      }

      // Reset button state
      btn.classList.remove('mc-option--correct', 'mc-option--wrong', 'mc-option--selected', 'mc-option--disabled');
      btn.disabled = false;
    }

    // --- Hint button ---
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
      hintBtn.disabled = false;
      hintBtn.classList.remove('mc-btn--used');
    }

    // Remove any existing hint text
    this._removeHintText();

    // --- Start timer ---
    this.startQuestionTimer();
  },

  /**
   * Handle option selection by the player.
   * @param {string} optionLetter - The option letter ('A', 'B', 'C', 'D').
   */
  selectOption(optionLetter) {
    if (this.optionLocked) return;
    this.optionLocked = true;

    const area = QUESTIONS_DB[this.currentArea];
    if (!area) return;
    const mission = area.missions[this.currentMission];
    if (!mission) return;
    const question = mission.questions[this.currentQuestionIdx];
    if (!question) return;

    // Stop the timer
    const elapsed = this.stopQuestionTimer();

    const selectedIndex = ['A', 'B', 'C', 'D'].indexOf(optionLetter);
    const isCorrect = selectedIndex === question.correct;

    // Highlight selected option
    const selectedBtn = document.querySelector(`.mc-option[data-option="${optionLetter}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('mc-option--selected');
    }

    // Highlight correct answer
    const correctLetter = ['A', 'B', 'C', 'D'][question.correct];
    const correctBtn = document.querySelector(`.mc-option[data-option="${correctLetter}"]`);
    if (correctBtn) {
      correctBtn.classList.add('mc-option--correct');
    }

    // Highlight wrong if incorrect
    if (!isCorrect && selectedBtn) {
      selectedBtn.classList.add('mc-option--wrong');
    }

    // Disable all options
    this.disableAllOptions();

    // Record the answer in the engine
    const engineMissionId = this.currentMission + 1;
    const xpEarned = isCorrect ? (question.xp || 8) : 0;

    this.engine.answerQuestion(
      question.id,
      this.currentArea,
      engineMissionId,
      isCorrect,
      xpEarned,
      elapsed,
      this.hintUsed
    );

    // Update streak
    if (isCorrect) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
    } else {
      this.streak = 0;
      // Lose a life (but kids are generous — they can continue)
      this.engine.loseLife();
    }

    // Show feedback after a short delay (let the player see the highlights)
    setTimeout(() => {
      this.showFeedback(isCorrect, question, selectedIndex);
    }, 600);
  },

  /** Disable all option buttons. */
  disableAllOptions() {
    const options = document.querySelectorAll('.mc-option');
    for (const opt of options) {
      opt.disabled = true;
      opt.classList.add('mc-option--disabled');
    }
  },

  /** Reset all option buttons to default state. */
  resetOptionButtons() {
    const options = document.querySelectorAll('.mc-option');
    for (const opt of options) {
      opt.disabled = false;
      opt.classList.remove(
        'mc-option--correct', 'mc-option--wrong',
        'mc-option--selected', 'mc-option--disabled'
      );
    }
  },

  /** Show the hint for the current question. */
  showHint() {
    const area = QUESTIONS_DB[this.currentArea];
    if (!area) return;
    const mission = area.missions[this.currentMission];
    if (!mission) return;
    const question = mission.questions[this.currentQuestionIdx];
    if (!question || !question.hint) return;

    if (this.hintUsed) return; // Already used
    this.hintUsed = true;

    // Record hint usage in the engine
    this.engine.useHint();

    // Show hint text
    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
      hintBtn.disabled = true;
      hintBtn.classList.add('mc-btn--used');
    }

    // Create or update hint display
    let hintEl = document.getElementById('hint-display');
    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.id = 'hint-display';
      hintEl.className = 'hint-display';
      const questionCard = document.querySelector('.question-card');
      if (questionCard) {
        questionCard.appendChild(hintEl);
      }
    }

    hintEl.textContent = `💡 ${question.hint}`;
    hintEl.classList.remove('is-hidden');
    this.showEl(hintEl);

    SoundFX.click();
  },

  /** Remove the hint display element if it exists. */
  _removeHintText() {
    const hintEl = document.getElementById('hint-display');
    if (hintEl) {
      hintEl.classList.add('is-hidden');
    }
  },

  // -------------------------------------------------------------------------
  // Feedback Screen
  // -------------------------------------------------------------------------

  /**
   * Show appropriate feedback after an answer.
   * @param {boolean} isCorrect
   * @param {Object} question - The question object.
   * @param {number} selectedOption - Index of the selected option.
   */
  showFeedback(isCorrect, question, selectedOption) {
    // Clear previous feedback timeouts
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = null;
    }

    const correctLetter = ['A', 'B', 'C', 'D'][question.correct];
    const correctText = question.options[question.correct].replace(/^[A-D]\.\s*/, '');

    const feedbackCorrect = document.getElementById('feedback-correct');
    const feedbackWrong = document.getElementById('feedback-wrong');
    const feedbackNoLives = document.getElementById('feedback-no-lives');
    const feedbackCountdown = document.getElementById('feedback-countdown');

    // Hide all feedback panels
    if (feedbackCorrect) this.hideEl(feedbackCorrect);
    if (feedbackWrong) this.hideEl(feedbackWrong);
    if (feedbackNoLives) this.hideEl(feedbackNoLives);
    if (feedbackCountdown) this.hideEl(feedbackCountdown);

    const hasLives = this.engine.hasLives();

    if (isCorrect) {
      // --- CORRECT FEEDBACK ---
      SoundFX.correct();

      if (feedbackCorrect) this.showEl(feedbackCorrect);

      // XP value
      const xpValueEl = document.getElementById('feedback-xp-value');
      if (xpValueEl) xpValueEl.textContent = `+${question.xp || 8}`;

      // Resource earned
      const resourceType = AREA_RESOURCE_MAP[this.currentArea] || 'enderPearls';
      const resConfig = RESOURCE_CONFIG[resourceType];
      const resIconEl = document.getElementById('feedback-resource-icon');
      const resNameEl = document.getElementById('feedback-resource-name');
      if (resIconEl) resIconEl.textContent = resConfig ? resConfig.icon : '💎';
      if (resNameEl) resNameEl.textContent = resConfig ? resConfig.name : 'Recurso';

      // Auto-advance countdown
      this._startFeedbackCountdown(3);

    } else if (!hasLives) {
      // --- NO LIVES FEEDBACK ---
      SoundFX.wrong();

      if (feedbackNoLives) this.showEl(feedbackNoLives);

      const noLivesMsg = document.getElementById('feedback-no-lives-message');
      if (noLivesMsg) {
        noLivesMsg.textContent =
          '¡Te has quedado sin vidas! Pero no te preocupes, puedes seguir intentando. ¡Eres un gran aventurero! 💪';
      }

      // Don't auto-advance — let the player choose
      if (feedbackCountdown) this.hideEl(feedbackCountdown);

    } else {
      // --- WRONG FEEDBACK (still has lives) ---
      SoundFX.wrong();

      if (feedbackWrong) this.showEl(feedbackWrong);

      // Show the correct answer
      const correctAnswerEl = document.getElementById('feedback-correct-answer');
      if (correctAnswerEl) {
        correctAnswerEl.textContent = `La respuesta correcta era: ${correctLetter}. ${correctText}`;
      }

      // Show encouragement
      const encouragementEl = document.getElementById('feedback-encouragement');
      if (encouragementEl) {
        encouragementEl.textContent = this._getRandomEncouragement();
      }

      // Auto-advance countdown
      this._startFeedbackCountdown(3);
    }

    this.navigate('feedback');
  },

  /**
   * Advance from the feedback screen to the next question or mission complete.
   */
  advanceFromFeedback() {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = null;
    }

    // If no lives, restore them for kids (generous approach)
    if (!this.engine.hasLives()) {
      this.engine.state.lives = this.engine.state.maxLives;
      this.engine.save();
    }

    this.currentQuestionIdx++;

    // Check if there are more questions in this mission
    const area = QUESTIONS_DB[this.currentArea];
    if (area && area.missions[this.currentMission]) {
      const mission = area.missions[this.currentMission];
      if (this.currentQuestionIdx < mission.questions.length) {
        this.navigate('question');
        this.showQuestion();
        return;
      }
    }

    // All questions answered → mission complete
    this.showMissionComplete();
  },

  /**
   * Start the feedback countdown timer.
   * @param {number} seconds - Seconds to count down.
   */
  _startFeedbackCountdown(seconds) {
    const countdownEl = document.getElementById('feedback-countdown');
    const countdownNumber = document.getElementById('countdown-number');
    if (countdownEl) this.showEl(countdownEl);

    let remaining = seconds;
    if (countdownNumber) countdownNumber.textContent = remaining;

    this.feedbackTimeout = setTimeout(() => {
      remaining--;
      if (remaining > 0) {
        if (countdownNumber) countdownNumber.textContent = remaining;
        this.feedbackTimeout = setTimeout(() => this._startFeedbackCountdown(remaining), 1000);
      } else {
        this.advanceFromFeedback();
      }
    }, 1000);

    // Store timeout for cleanup (overwrite the current one)
    const prevTimeout = this.feedbackTimeout;
    this.feedbackTimeout = setTimeout(() => {
      remaining--;
      if (remaining > 0) {
        if (countdownNumber) countdownNumber.textContent = remaining;
        this.feedbackTimeout = setTimeout(() => this._startFeedbackCountdown(remaining), 1000);
      } else {
        this.advanceFromFeedback();
      }
    }, 1000);

    // Clear the first timeout (it was a logic error)
    clearTimeout(prevTimeout);
  },

  /**
   * Handle the "Seguir" button on the no-lives feedback screen.
   * Restores lives and continues to the next question.
   */
  handleFeedbackContinue() {
    // Restore lives for the kid (generous!)
    this.engine.state.lives = this.engine.state.maxLives;
    this.engine.save();
    this.advanceFromFeedback();
  },

  // -------------------------------------------------------------------------
  // Mission Complete Screen
  // -------------------------------------------------------------------------

  /** Show the mission complete screen with results. */
  showMissionComplete() {
    const areaKey = this.currentArea;
    const missionIdx = this.currentMission;
    const engineMissionId = missionIdx + 1;

    // Calculate results from engine state
    const missionResults = this.engine.state.questionResults.filter(
      r => r.area === areaKey && r.mission === engineMissionId
    );
    const correctCount = missionResults.filter(r => r.correct).length;
    const totalQuestions = APP_QUESTIONS_PER_MISSION;
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;

    // Calculate XP earned in this mission (questions XP + mission completion bonus)
    const questionXP = missionResults.reduce((sum, r) => sum + r.xp, 0);
    const missionBonusXP = 25; // engine gives 25 XP for mission completion
    const totalMissionXP = questionXP + missionBonusXP;

    // Stars based on accuracy
    let stars = 0;
    if (accuracy >= 1) stars = 3;
    else if (accuracy >= 0.8) stars = 2;
    else if (accuracy >= 0.6) stars = 1;

    // Update stars display
    for (let i = 1; i <= 3; i++) {
      const starEl = document.getElementById(`star-${i}`);
      if (starEl) {
        starEl.classList.remove('star-large--filled', 'star-large--empty');
        if (i <= stars) {
          starEl.classList.add('star-large--filled');
          starEl.textContent = '★';
        } else {
          starEl.classList.add('star-large--empty');
          starEl.textContent = '☆';
        }
      }
    }

    // Update stats
    const correctCountEl = document.getElementById('mc-correct-count');
    if (correctCountEl) correctCountEl.textContent = `${correctCount}/${totalQuestions}`;

    const xpEl = document.getElementById('mc-xp-earned');
    if (xpEl) xpEl.textContent = `+${totalMissionXP}`;

    // Resources collected in this mission
    const resourceType = AREA_RESOURCE_MAP[areaKey] || 'enderPearls';
    const resConfig = RESOURCE_CONFIG[resourceType];
    const resourceCount = correctCount; // 1 per correct answer (+ 3 bonus if perfect)

    for (let i = 1; i <= 3; i++) {
      const resEl = document.getElementById(`mc-resource-${i}`);
      if (resEl) {
        if (i <= Math.min(resourceCount, 5)) {
          this.showEl(resEl);
          const span = resEl.querySelector('span');
          if (span && resConfig) span.textContent = resConfig.icon;
        } else {
          this.hideEl(resEl);
        }
      }
    }

    // Perfect bonus
    const perfectBonus = document.getElementById('mc-perfect-bonus');
    if (perfectBonus) {
      if (stars === 3) {
        this.showEl(perfectBonus);
      } else {
        this.hideEl(perfectBonus);
      }
    }

    // Next mission button visibility
    const nextMissionBtn = document.getElementById('btn-next-mission');
    if (nextMissionBtn) {
      const hasNextMission = missionIdx + 1 < APP_MISSIONS_PER_AREA;
      if (hasNextMission) {
        this.showEl(nextMissionBtn);
        nextMissionBtn.textContent = 'Siguiente Misión →';
      } else {
        // Check if area is now complete
        const areaComplete = this.engine.isAreaComplete(areaKey);
        if (areaComplete) {
          nextMissionBtn.textContent = '🎉 ¡Área Completada!';
          this.showEl(nextMissionBtn);
        } else {
          this.hideEl(nextMissionBtn);
        }
      }
    }

    SoundFX.chest();
    this.navigate('mission-complete');
  },

  /**
   * Handle "Siguiente Misión" button on mission complete screen.
   */
  handleNextMission() {
    const nextIdx = this.currentMission + 1;
    if (nextIdx < APP_MISSIONS_PER_AREA && this.currentArea) {
      // Check if next mission is unlocked
      const engineMissionId = nextIdx + 1;
      if (this.engine.isMissionComplete(this.currentArea, nextIdx)) {
        // Next mission already complete, go to it or area complete
        if (this.engine.isAreaComplete(this.currentArea)) {
          this.goToMap();
        } else {
          // Find next incomplete mission
          for (let i = nextIdx; i < APP_MISSIONS_PER_AREA; i++) {
            if (!this.engine.isMissionComplete(this.currentArea, i + 1)) {
              this.goToMission(this.currentArea, i);
              return;
            }
          }
          this.goToMap();
        }
      } else {
        this.goToMission(this.currentArea, nextIdx);
      }
    } else {
      this.goToMap();
    }
  },

  // -------------------------------------------------------------------------
  // Rewards Screen
  // -------------------------------------------------------------------------

  /** Refresh the rewards/inventory screen with current data. */
  refreshRewards() {
    // --- Resource counts ---
    const resources = this.engine.getAllResources();
    for (const [resKey, resConf] of Object.entries(RESOURCE_CONFIG)) {
      const count = resources[resKey] || 0;
      // Map counter
      const counterEl = document.getElementById(`resource-${resConf.htmlId}`);
      if (counterEl) counterEl.textContent = count;
      // Inventory slot
      const invEl = document.getElementById(`inv-${resConf.htmlId}`);
      if (invEl) invEl.textContent = count;
    }

    // --- Achievements list ---
    const achievementsList = document.getElementById('achievements-list');
    if (achievementsList) {
      const allAchievements = this.engine.getAllAchievements();
      // Clear and rebuild
      achievementsList.innerHTML = '';

      for (const ach of allAchievements) {
        const item = document.createElement('div');
        item.className = ach.unlocked
          ? 'achievement-item achievement-item--unlocked'
          : 'achievement-item achievement-item--locked';
        item.setAttribute('data-achievement', ach.id);
        item.innerHTML = `
          <span class="achievement-item__icon" aria-hidden="true">${ach.unlocked ? '🏅' : '🔒'}</span>
          <div class="achievement-item__info">
            <h4 class="achievement-item__name">${this._escapeHtml(ach.name)}</h4>
            <p class="achievement-item__desc">${this._escapeHtml(ach.description)}</p>
          </div>
          <span class="achievement-item__status">${ach.unlocked ? '✅' : '🔒'}</span>
        `;
        achievementsList.appendChild(item);
      }
    }

    // --- Stats ---
    const stats = this.engine.getQuestionStats();

    const statQuestions = document.getElementById('stat-questions');
    if (statQuestions) statQuestions.textContent = stats.total;

    const statAccuracy = document.getElementById('stat-accuracy');
    if (statAccuracy) statAccuracy.textContent = `${Math.round(stats.accuracy * 100)}%`;

    const statTime = document.getElementById('stat-time');
    if (statTime) statTime.textContent = this.engine.getElapsedTime();

    const statMaxStreak = document.getElementById('stat-max-streak');
    if (statMaxStreak) statMaxStreak.textContent = stats.bestStreak;
  },

  // -------------------------------------------------------------------------
  // Results Screen
  // -------------------------------------------------------------------------

  /** Calculate and display final results. */
  showResults() {
    const results = this.engine.calculateFinalResults();
    const state = this.engine.state;

    // --- Rank ---
    const rankData = RANKS[results.rank] || RANKS['Madera'];
    const crownEl = document.getElementById('results-crown');
    if (crownEl) {
      crownEl.textContent = results.rank === 'Netherite' ? '👑' : '🪵';
      crownEl.style.display = results.overallPercentage >= 70 ? 'inline' : 'none';
    }

    const rankIconEl = document.getElementById('results-rank-icon');
    if (rankIconEl) rankIconEl.textContent = rankData.icon;

    const rankNameEl = document.getElementById('results-rank-name');
    if (rankNameEl) {
      rankNameEl.textContent = results.rank;
      rankNameEl.style.color = rankData.color;
    }

    // --- Score ---
    const scoreValue = document.getElementById('results-score-value');
    if (scoreValue) scoreValue.textContent = `${results.totalCorrect}/100`;

    const scorePercent = document.getElementById('results-score-percent');
    if (scorePercent) scorePercent.textContent = `${results.overallPercentage}%`;

    // --- XP & Level ---
    const xpTotal = document.getElementById('results-xp-total');
    if (xpTotal) xpTotal.textContent = results.xp;

    const levelEl = document.getElementById('results-level');
    if (levelEl) levelEl.textContent = results.level;

    // --- Area breakdown ---
    for (const dbKey of ALL_AREA_KEYS) {
      const htmlArea = DB_TO_HTML_AREA[dbKey] || dbKey;
      const breakdown = results.areaBreakdown[dbKey];

      const areaScoreEl = document.getElementById(`results-area-score-${htmlArea}`);
      if (areaScoreEl && breakdown) {
        areaScoreEl.textContent = `${breakdown.correct}/20`;
      }

      const areaPercentEl = document.getElementById(`results-area-percent-${htmlArea}`);
      if (areaPercentEl && breakdown) {
        areaPercentEl.textContent = `${Math.round(breakdown.accuracy * 100)}%`;
      }

      const areaRankEl = document.getElementById(`results-area-rank-${htmlArea}`);
      if (areaRankEl && breakdown) {
        const pct = Math.round(breakdown.accuracy * 100);
        areaRankEl.textContent = this.engine.getRank(pct);
      }
    }

    // --- Summary ---
    const totalResources = document.getElementById('results-total-resources');
    if (totalResources) {
      const res = results.resources;
      const total = Object.values(res).reduce((s, v) => s + v, 0);
      totalResources.textContent = total;
    }

    const totalAchievements = document.getElementById('results-total-achievements');
    if (totalAchievements) {
      const achSummary = this.engine.getAchievementSummary();
      totalAchievements.textContent = `${achSummary.unlocked}/${achSummary.total}`;
    }

    const timePlayed = document.getElementById('results-time-played');
    if (timePlayed) timePlayed.textContent = results.timePlayed;

    this.navigate('results');
  },

  // -------------------------------------------------------------------------
  // Certificate Screen
  // -------------------------------------------------------------------------

  /** Populate and show the certificate screen. */
  showCertificate() {
    const results = this.engine.calculateFinalResults();
    const state = this.engine.state;

    // Student name
    const nameEl = document.getElementById('certificate-student-name');
    if (nameEl) nameEl.textContent = state.playerName || 'Explorador';

    // Rank
    const rankData = RANKS[results.rank] || RANKS['Madera'];
    const rankIconEl = document.getElementById('certificate-rank-icon');
    if (rankIconEl) rankIconEl.textContent = rankData.icon;

    const rankNameEl = document.getElementById('certificate-rank-name');
    if (rankNameEl) rankNameEl.textContent = results.rank;

    // Date
    const dateEl = document.getElementById('certificate-date');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Area scores
    for (const dbKey of ALL_AREA_KEYS) {
      const htmlArea = DB_TO_HTML_AREA[dbKey] || dbKey;
      const breakdown = results.areaBreakdown[dbKey];
      const scoreEl = document.getElementById(`cert-score-${htmlArea}`);
      if (scoreEl && breakdown) {
        const pct = Math.round(breakdown.accuracy * 100);
        scoreEl.textContent = `${pct}%`;
      }
    }

    // Total score
    const totalScoreEl = document.getElementById('certificate-total-score');
    if (totalScoreEl) {
      totalScoreEl.textContent = `${results.totalCorrect}/100`;
    }

    this.navigate('certificate');
  },

  /** Print the certificate. */
  handlePrintCertificate() {
    window.print();
  },

  // -------------------------------------------------------------------------
  // Achievement Toasts
  // -------------------------------------------------------------------------

  /**
   * Show a slide-in toast notification for an unlocked achievement.
   * @param {{ id: string, name: string, description: string }} achievement
   */
  showToast(achievement) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    SoundFX.achievement();

    const toast = document.createElement('div');
    toast.className = 'toast toast--achievement';
    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true">🏅</div>
      <div class="toast__content">
        <h4 class="toast__title">¡Logro Desbloqueado!</h4>
        <p class="toast__name">${this._escapeHtml(achievement.name)}</p>
        <p class="toast__desc">${this._escapeHtml(achievement.description)}</p>
      </div>
      <button class="toast__close" type="button" aria-label="Cerrar">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger slide-in animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Close button
    const closeBtn = toast.querySelector('.toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this._dismissToast(toast));
    }

    // Auto-dismiss after 4 seconds
    setTimeout(() => this._dismissToast(toast), 4000);
  },

  /**
   * Dismiss a toast element with a slide-out animation.
   * @param {Element} toast
   */
  _dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, { once: true });
  },

  // -------------------------------------------------------------------------
  // Modal
  // -------------------------------------------------------------------------

  /**
   * Show a generic confirmation modal.
   * @param {string} title
   * @param {string} message
   * @param {Function} [onConfirm]
   * @param {Function} [onCancel]
   */
  showModal(title, message, onConfirm, onCancel) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = message;

    this.showEl(overlay);
    overlay.setAttribute('aria-hidden', 'false');

    // Store callbacks
    this._modalOnConfirm = onConfirm || null;
    this._modalOnCancel = onCancel || null;
  },

  /** Hide the modal overlay. */
  hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      this.hideEl(overlay);
      overlay.setAttribute('aria-hidden', 'true');
    }
    this._modalOnConfirm = null;
    this._modalOnCancel = null;
  },

  /** @type {Function|null} */
  _modalOnConfirm: null,

  /** @type {Function|null} */
  _modalOnCancel: null,

  /** Handle modal confirm button click. */
  handleModalConfirm() {
    if (typeof this._modalOnConfirm === 'function') {
      this._modalOnConfirm();
    }
    this.hideModal();
  },

  /** Handle modal cancel button click. */
  handleModalCancel() {
    if (typeof this._modalOnCancel === 'function') {
      this._modalOnCancel();
    }
    this.hideModal();
  },

  // -------------------------------------------------------------------------
  // Timer
  // -------------------------------------------------------------------------

  /** Start the per-question timer counting from 0. */
  startQuestionTimer() {
    this.stopQuestionTimer();
    this.questionElapsedSeconds = 0;
    this.updateTimerDisplay(0);

    this.timerInterval = setInterval(() => {
      this.questionElapsedSeconds++;
      this.updateTimerDisplay(this.questionElapsedSeconds);
    }, 1000);
  },

  /**
   * Stop the question timer and return the elapsed seconds.
   * @returns {number} Seconds elapsed since timer was started.
   */
  stopQuestionTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    return this.questionElapsedSeconds;
  },

  /**
   * Update the timer display element.
   * @param {number} seconds
   */
  updateTimerDisplay(seconds) {
    const timerEl = document.getElementById('question-timer');
    if (timerEl) {
      timerEl.textContent = `⏱️ ${this.formatTime(seconds)}`;
    }
  },

  // -------------------------------------------------------------------------
  // HUD Updates
  // -------------------------------------------------------------------------

  /**
   * Update the hearts display in a given container.
   * @param {string} containerId - The id of the container element.
   */
  updateHearts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const hearts = this.engine.getHeartsDisplay();
    container.innerHTML = '';
    for (const h of hearts) {
      const span = document.createElement('span');
      span.className = h.filled ? 'heart heart--full' : 'heart heart--empty';
      span.setAttribute('aria-label', h.filled ? 'vida' : 'vida perdida');
      span.textContent = h.filled ? '❤️' : '🖤';
      container.appendChild(span);
    }
  },

  /**
   * Update an XP bar fill element.
   * @param {string} fillId - The id of the fill element.
   */
  updateXPBar(fillId) {
    const fill = document.getElementById(fillId);
    if (!fill) return;

    const progress = this.engine.getLevelProgress();
    fill.style.width = `${Math.round(progress * 100)}%`;

    // Update aria value
    const bar = fill.parentElement;
    if (bar) {
      bar.setAttribute('aria-valuenow', Math.round(progress * 100));
    }
  },

  /**
   * Update all resource counter elements on the map screen.
   */
  updateResourceCounters() {
    const resources = this.engine.getAllResources();
    for (const [resKey, resConf] of Object.entries(RESOURCE_CONFIG)) {
      const count = resources[resKey] || 0;
      const counterEl = document.getElementById(`resource-${resConf.htmlId}`);
      if (counterEl) counterEl.textContent = count;
    }
  },

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  /**
   * Shorthand for document.getElementById.
   * @param {string} id
   * @returns {Element|null}
   */
  getEl(id) {
    return document.getElementById(id);
  },

  /**
   * Show an element by removing the 'is-hidden' class.
   * @param {Element} el
   */
  showEl(el) {
    if (el) el.classList.remove('is-hidden');
  },

  /**
   * Hide an element by adding the 'is-hidden' class.
   * @param {Element} el
   */
  hideEl(el) {
    if (el) el.classList.add('is-hidden');
  },

  /**
   * Format seconds as MM:SS.
   * @param {number} seconds
   * @returns {string}
   */
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  /**
   * Escape HTML special characters to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Get a random encouraging message.
   * @returns {string}
   */
  _getRandomEncouragement() {
    return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  },

  /**
   * Check if the player has started any mission in any area.
   * @returns {boolean}
   */
  _isAnyAreaStarted() {
    return this.engine.state.totalAnswered > 0;
  },

  /**
   * Check if any area has been completed (used to unlock all areas).
   * For simplicity, the first area (ingles) is always available, and
   * other areas unlock once the player has started playing.
   * @returns {boolean}
   */
  _shouldUnlockAllAreas() {
    // Unlock all areas once the player has completed at least one mission
    return Object.keys(this.engine.state.missionsCompleted).length > 0;
  },

  // -------------------------------------------------------------------------
  // Event Listeners (Delegated)
  // -------------------------------------------------------------------------

  /**
   * Set up all event listeners using event delegation on document.body
   * where possible.
   */
  setupEventListeners() {
    const body = document.body;

    // ---------------------------------------------------------------
    // WELCOME SCREEN
    // ---------------------------------------------------------------

    // Name input — enable/disable start button
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const btn = document.getElementById('btn-start');
        if (btn) btn.disabled = nameInput.value.trim().length === 0;
      });
      // Enter key to start
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && nameInput.value.trim().length > 0) {
          this.handleStartAdventure();
        }
      });
    }

    // Start button
    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-start');
      if (btn) {
        e.preventDefault();
        this.handleStartAdventure();
      }
    });

    // ---------------------------------------------------------------
    // CHARACTER SELECTION
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const card = e.target.closest('.mc-character-card');
      if (card) {
        e.preventDefault();
        const charId = card.getAttribute('data-character');
        if (charId) this.handleCharacterSelect(charId);
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-adventure');
      if (btn) {
        e.preventDefault();
        this.handleAdventureStart();
      }
    });

    // ---------------------------------------------------------------
    // MAP SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const biomeCard = e.target.closest('.mc-biome-card');
      if (biomeCard) {
        e.preventDefault();
        const areaId = biomeCard.getAttribute('data-area');
        if (areaId) this.goToArea(areaId);
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-rewards');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.goToRewards();
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-results');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.goToResults();
      }
    });

    // ---------------------------------------------------------------
    // MISSION SELECTION
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-mission-back');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.goToMap();
      }
    });

    body.addEventListener('click', (e) => {
      const chest = e.target.closest('.mc-chest');
      if (chest) {
        e.preventDefault();
        const missionIdx = parseInt(chest.getAttribute('data-mission'), 10);
        const areaKey = chest.getAttribute('data-area');
        if (!isNaN(missionIdx) && areaKey) {
          this.goToMission(areaKey, missionIdx);
        }
      }
    });

    // ---------------------------------------------------------------
    // QUESTION SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-question-back');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.stopQuestionTimer();
        this.showModal(
          '¿Salir de la misión?',
          'Si sales, perderás el progreso de esta pregunta. ¿Estás seguro?',
          () => this.goToArea(DB_TO_HTML_AREA[this.currentArea] || this.currentArea),
          () => this.navigate('question') // Stay on question — re-show it
        );
      }
    });

    // Option buttons
    body.addEventListener('click', (e) => {
      const optBtn = e.target.closest('.mc-option');
      if (optBtn && !optBtn.disabled) {
        e.preventDefault();
        const letter = optBtn.getAttribute('data-option');
        if (letter) this.selectOption(letter);
      }
    });

    // Hint button
    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-hint');
      if (btn && !btn.disabled) {
        e.preventDefault();
        this.showHint();
      }
    });

    // ---------------------------------------------------------------
    // FEEDBACK SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-feedback-next');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.advanceFromFeedback();
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-feedback-continue');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.handleFeedbackContinue();
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-feedback-to-map');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        // Restore lives before going to map
        this.engine.state.lives = this.engine.state.maxLives;
        this.engine.save();
        this.goToMap();
      }
    });

    // ---------------------------------------------------------------
    // MISSION COMPLETE SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-next-mission');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.handleNextMission();
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-mc-to-map');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.goToMap();
      }
    });

    // ---------------------------------------------------------------
    // REWARDS SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-rewards-back');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.goToMap();
      }
    });

    // ---------------------------------------------------------------
    // RESULTS SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-keep-playing');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.goToMap();
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-restart');
      if (btn) {
        e.preventDefault();
        this.showModal(
          '¿Reiniciar Aventura?',
          'Se borrará todo tu progreso, recursos y logros. Esta acción no se puede deshacer.',
          () => {
            this.engine.reset();
            this.streak = 0;
            this.maxStreak = 0;
            this.navigate('welcome');
          }
        );
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-certificate');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.showCertificate();
      }
    });

    // ---------------------------------------------------------------
    // CERTIFICATE SCREEN
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-certificate-back');
      if (btn) {
        e.preventDefault();
        SoundFX.click();
        this.navigate('results');
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-print');
      if (btn) {
        e.preventDefault();
        this.handlePrintCertificate();
      }
    });

    // ---------------------------------------------------------------
    // MODAL
    // ---------------------------------------------------------------

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#modal-confirm');
      if (btn) {
        e.preventDefault();
        this.handleModalConfirm();
      }
    });

    body.addEventListener('click', (e) => {
      const btn = e.target.closest('#modal-cancel');
      if (btn) {
        e.preventDefault();
        this.handleModalCancel();
      }
    });

    // Close modal on overlay click (outside the modal content)
    body.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        this.hideModal();
      }
    });

    // ---------------------------------------------------------------
    // KEYBOARD SHORTCUTS
    // ---------------------------------------------------------------

    document.addEventListener('keydown', (e) => {
      // Enter for faster navigation on feedback screen
      if (e.key === 'Enter') {
        if (this.currentScreen === 'feedback') {
          // Check if no-lives feedback (don't auto-advance)
          const noLives = document.getElementById('feedback-no-lives');
          if (noLives && noLives.classList.contains('is-hidden') === false &&
              !noLives.classList.contains('is-hidden')) {
            // No-lives is visible — Enter does "Seguir"
            const isVisible = !noLives.classList.contains('is-hidden');
            const correctFb = document.getElementById('feedback-correct');
            const correctVisible = correctFb && !correctFb.classList.contains('is-hidden');
            const wrongFb = document.getElementById('feedback-wrong');
            const wrongVisible = wrongFb && !wrongFb.classList.contains('is-hidden');

            if (isVisible && !correctVisible && !wrongVisible) {
              this.handleFeedbackContinue();
              return;
            }
          }

          // Check if countdown is visible (auto-advance)
          const countdown = document.getElementById('feedback-countdown');
          if (countdown && !countdown.classList.contains('is-hidden')) {
            this.advanceFromFeedback();
            return;
          }
        }
      }

      // Keys 1-4 for option selection on question screen
      if (this.currentScreen === 'question' && !this.optionLocked) {
        const optionKeys = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        const letter = optionKeys[e.key];
        if (letter) {
          const btn = document.querySelector(`.mc-option[data-option="${letter}"]`);
          if (btn && !btn.disabled) {
            this.selectOption(letter);
          }
        }
      }

      // Escape to go back or close modal
      if (e.key === 'Escape') {
        const overlay = document.getElementById('modal-overlay');
        if (overlay && !overlay.classList.contains('is-hidden')) {
          this.hideModal();
          return;
        }

        if (this.currentScreen === 'mission') {
          this.goToMap();
        } else if (this.currentScreen === 'rewards') {
          this.goToMap();
        } else if (this.currentScreen === 'results') {
          this.goToMap();
        } else if (this.currentScreen === 'certificate') {
          this.navigate('results');
        }
      }
    });

    // ---------------------------------------------------------------
    // PREVENT ACCIDENTAL NAVIGATION
    // ---------------------------------------------------------------

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (e) => {
        // Only warn if the player has made progress
        if (this.engine.state.totalAnswered > 0) {
          e.preventDefault();
          e.returnValue = '';
        }
      });
    }
  },
};

// ============================================================================
// BOOT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => App.init());

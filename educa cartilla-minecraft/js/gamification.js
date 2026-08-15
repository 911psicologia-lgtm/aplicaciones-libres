/**
 * gamification.js — Minecraft-themed evaluation cartilla game engine.
 *
 * This file defines the {@link GameEngine} class, which manages all gamification
 * state including XP, levels, lives, resources, achievements, missions, areas,
 * and final results. It persists state to `localStorage` and provides a custom
 * event emitter so the rest of the application can react to game events.
 *
 * Load this file **before** `app.js`.
 *
 * @module gamification
 */

/* eslint-disable no-unused-vars */

/**
 * Resource types that can be collected during gameplay.
 * Each area in the cartilla maps to one of these resources.
 * @readonly
 * @enum {string}
 */
const RESOURCE_TYPES = Object.freeze({
  MATEMATICAS: 'enderPearls',
  INGLES: 'emeralds',
  LENGUAJE: 'diamonds',
  NATURALES: 'goldenApples',
  SOCIALES: 'goldNuggets',
});

/**
 * Human-readable labels for each resource type (Spanish).
 * @readonly
 * @type {Object.<string, string>}
 */
const RESOURCE_LABELS = Object.freeze({
  enderPearls: 'Perlas de Ender',
  emeralds: 'Esmaraldas',
  diamonds: 'Diamantes',
  goldenApples: 'Manzanas Doradas',
  goldNuggets: 'Pepitas de Oro',
});

/**
 * Maps an area ID to its associated resource type.
 * @readonly
 * @type {Object.<string, string>}
 */
const AREA_RESOURCE_MAP = Object.freeze({
  matematicas: RESOURCE_TYPES.MATEMATICAS,
  ingles: RESOURCE_TYPES.INGLES,
  lenguaje: RESOURCE_TYPES.LENGUAJE,
  naturales: RESOURCE_TYPES.NATURALES,
  sociales: RESOURCE_TYPES.SOCIALES,
});

/**
 * Available ranks ordered from lowest to highest.
 * @readonly
 * @type {string[]}
 */
const RANK_ORDER = Object.freeze([
  'Madera',
  'Piedra',
  'Hierro',
  'Oro',
  'Diamante',
  'Netherite',
]);

/**
 * Number of missions per area.
 * @readonly
 * @type {number}
 */
const MISSIONS_PER_AREA = 5;

/**
 * Number of questions per mission.
 * @readonly
 * @type {number}
 */
const QUESTIONS_PER_MISSION = 5;

/**
 * Total number of areas in the cartilla.
 * @readonly
 * @type {number}
 */
const TOTAL_AREAS = 5;

/**
 * localStorage key used for persistence.
 * @readonly
 * @type {string}
 */
const SAVE_KEY = 'cartilla-craft-save';

/**
 * Achievements registry. Every achievement has a unique `id`, a display `name`,
 * a `description`, and a `check` function that receives the game state and
 * returns `true` when the achievement should be unlocked.
 *
 * @readonly
 * @type {Array<{id: string, name: string, description: string, check: function(Object): boolean}>}
 */
const ACHIEVEMENTS = Object.freeze([
  {
    id: 'primera_piedra',
    name: 'Primera Piedra',
    description: 'Responde correctamente tu primera pregunta.',
    check: (state) => state.totalCorrect >= 1,
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Completa tu primera misi\u00f3n.',
    check: (state) => Object.keys(state.missionsCompleted).length >= 1,
  },
  {
    id: 'maestro_minero',
    name: 'Maestro Minero',
    description: 'Completa todas las misiones de Matem\u00e1ticas.',
    check: (state) => _isAreaFullyComplete(state, 'matematicas'),
  },
  {
    id: 'viajero_end',
    name: 'Viajero del End',
    description: 'Completa todas las misiones de Ingl\u00e9s.',
    check: (state) => _isAreaFullyComplete(state, 'ingles'),
  },
  {
    id: 'sabio_aldea',
    name: 'Sabio de la Aldea',
    description: 'Completa todas las misiones de Lenguaje.',
    check: (state) => _isAreaFullyComplete(state, 'lenguaje'),
  },
  {
    id: 'guardian_bosque',
    name: 'Guardi\u00e1n del Bosque',
    description: 'Completa todas las misiones de C. Naturales.',
    check: (state) => _isAreaFullyComplete(state, 'naturales'),
  },
  {
    id: 'conquistador_nether',
    name: 'Conquistador del Nether',
    description: 'Completa todas las misiones de Sociales.',
    check: (state) => _isAreaFullyComplete(state, 'sociales'),
  },
  {
    id: 'coleccionista',
    name: 'Coleccionista',
    description: 'Colecciona 10 de cualquier recurso.',
    check: (state) =>
      Object.values(state.resources).some((count) => count >= 10),
  },
  {
    id: 'racha_oro',
    name: 'Racha de Oro',
    description: 'Responde 5 preguntas correctamente seguidas.',
    check: (state) => _hasStreak(state, 5),
  },
  {
    id: 'sin_ayuda',
    name: 'Sin Ayuda',
    description: 'Completa una misi\u00f3n sin usar pistas.',
    check: (state) => _hasPerfectMissionNoHints(state),
  },
  {
    id: 'velocista',
    name: 'Velocista',
    description: 'Responde una pregunta en menos de 10 segundos.',
    check: (state) =>
      state.questionResults.some(
        (r) => r.correct && typeof r.time === 'number' && r.time < 10
      ),
  },
  {
    id: 'cerebro_diamante',
    name: 'Cerebro de Diamante',
    description: 'Alcanza el nivel 10.',
    check: (state) => state.level >= 10,
  },
  {
    id: 'corazon_hierro',
    name: 'Coraz\u00f3n de Hierro',
    description: 'Completa las 5 \u00e1reas.',
    check: (state) => Object.keys(state.areasCompleted).length >= TOTAL_AREAS,
  },
  {
    id: 'leyenda',
    name: 'Leyenda',
    description: 'Obt\u00e9n el rango Netherite.',
    check: (state) => state.rank === 'Netherite',
  },
  {
    id: 'perfeccionista',
    name: 'Perfeccionista',
    description: 'Obt\u00e9n 100% en cualquier \u00e1rea.',
    check: (state) => _hasPerfectArea(state),
  },
  {
    id: 'superviviente',
    name: 'Superviviente',
    description: 'Juega durante 30 minutos o m\u00e1s.',
    check: (state) => {
      if (!state.startTime) return false;
      const elapsed =
        (state.endTime ? state.endTime : Date.now()) - state.startTime;
      return elapsed >= 30 * 60 * 1000;
    },
  },
  {
    id: 'curioso',
    name: 'Curioso',
    description: 'Usa 10 pistas en total.',
    check: (state) => state.hintsUsed >= 10,
  },
]);

// ---------------------------------------------------------------------------
// Internal helpers for achievement checks
// ---------------------------------------------------------------------------

/**
 * Returns `true` when every mission in the given area is marked completed.
 * @param {Object} state - The game state.
 * @param {string} areaId - The area identifier.
 * @returns {boolean}
 */
function _isAreaFullyComplete(state, areaId) {
  for (let m = 1; m <= MISSIONS_PER_AREA; m++) {
    if (!state.missionsCompleted[`${areaId}_m${m}`]) return false;
  }
  return true;
}

/**
 * Returns the longest correct-answer streak found in the question results.
 * @param {Object} state - The game state.
 * @param {number} target - The minimum streak length to report.
 * @returns {boolean}
 */
function _hasStreak(state, target) {
  let streak = 0;
  for (const r of state.questionResults) {
    if (r.correct) {
      streak++;
      if (streak >= target) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

/**
 * Returns `true` if at least one mission was completed with 5/5 correct
 * answers and zero hints used during that mission's questions.
 * @param {Object} state - The game state.
 * @returns {boolean}
 */
function _hasPerfectMissionNoHints(state) {
  const missionMap = {};

  for (const r of state.questionResults) {
    const key = `${r.area}_${r.mission}`;
    if (!missionMap[key]) {
      missionMap[key] = { correct: 0, total: 0, hints: 0 };
    }
    missionMap[key].total++;
    if (r.correct) missionMap[key].correct++;
    // A question with hintUsed === true disqualifies the mission
    if (r.hintUsed) missionMap[key].hints++;
  }

  return Object.values(missionMap).some(
    (m) => m.correct === QUESTIONS_PER_MISSION && m.hints === 0
  );
}

/**
 * Returns `true` if the player scored 100% accuracy in at least one area.
 * An area is 100% when every answered question in that area is correct.
 * @param {Object} state - The game state.
 * @returns {boolean}
 */
function _hasPerfectArea(state) {
  const areas = {};

  for (const r of state.questionResults) {
    if (!areas[r.area]) areas[r.area] = { correct: 0, total: 0 };
    areas[r.area].total++;
    if (r.correct) areas[r.area].correct++;
  }

  return Object.values(areas).some(
    (a) => a.total > 0 && a.correct === a.total
  );
}

// ===========================================================================
// GameEngine
// ===========================================================================

/**
 * Central gamification engine for the Minecraft-themed evaluation cartilla.
 *
 * Manages player state, XP/level progression, lives, resources, achievements,
 * missions, areas, and final results. Provides a lightweight event emitter so
 * UI code can subscribe to game events without tight coupling.
 *
 * @example
 * const engine = new GameEngine();
 * engine.on('level-up', (data) => console.log('Level up!', data));
 * engine.setPlayerName('Steve');
 * engine.addXP(60);
 * engine.save();
 */
class GameEngine {
  // =========================================================================
  // Constructor
  // =========================================================================

  /**
   * Creates a new GameEngine instance.
   *
   * Attempts to load previously saved state from `localStorage`. If no saved
   * state exists (or the saved data is corrupted), a fresh default state is
   * initialised.
   */
  constructor() {
    /** @private @type {Object.<string, Function[]>} */
    this.listeners = {};

    /** @private @type {Object} The live game state. */
    this.state = this._createDefaultState();

    // Try to load persisted state
    this.load();
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  /**
   * Creates a fresh default game state object.
   * @private
   * @returns {Object} The default state.
   */
  _createDefaultState() {
    return {
      playerName: '',
      character: null, // { id, name, skin }
      currentArea: null,
      currentMission: null,
      currentQuestion: 0,
      xp: 0,
      level: 1,
      lives: 5,
      maxLives: 5,
      resources: {
        enderPearls: 0,
        emeralds: 0,
        diamonds: 0,
        goldenApples: 0,
        goldNuggets: 0,
      },
      achievements: [],
      areasCompleted: {},   // { ingles: true, … }
      missionsCompleted: {}, // { ingles_m1: true, … }
      questionResults: [],   // { questionId, area, mission, correct, xp, time, hintUsed }
      totalCorrect: 0,
      totalAnswered: 0,
      hintsUsed: 0,
      startTime: null,
      endTime: null,
      rank: 'Madera',
    };
  }

  /**
   * Deep-merges a source object into a target object, only copying properties
   * that already exist on the target. This is used to safely apply saved data
   * over a fresh default state so new fields added in later versions get their
   * default values rather than `undefined`.
   * @private
   * @param {Object} target - The base object (default state).
   * @param {Object} source - The saved object to merge in.
   * @returns {Object} The merged object.
   */
  _deepMergeDefaults(target, source) {
    if (
      source === null ||
      typeof source !== 'object' ||
      Array.isArray(source)
    ) {
      return target;
    }

    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (key in result) {
        if (
          result[key] !== null &&
          typeof result[key] === 'object' &&
          !Array.isArray(result[key]) &&
          source[key] !== null &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          result[key] = this._deepMergeDefaults(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
      // Keys not present in target are ignored (new fields get defaults)
    }
    return result;
  }

  // =========================================================================
  // State persistence
  // =========================================================================

  /**
   * Persists the current game state to `localStorage`.
   *
   * Wrapped in a try/catch so that private browsing modes or storage quota
   * issues do not crash the application.
   */
  save() {
    try {
      const json = JSON.stringify(this.state);
      localStorage.setItem(SAVE_KEY, json);
    } catch (err) {
      console.warn('[GameEngine] Could not save state to localStorage:', err);
    }
  }

  /**
   * Loads the game state from `localStorage`.
   *
   * If the saved data is missing, corrupted, or cannot be parsed, the engine
   * falls back to a fresh default state without throwing.
   */
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw === null) return; // No save yet — keep defaults

      const parsed = JSON.parse(raw);

      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        console.warn('[GameEngine] Saved state is not an object — resetting.');
        return;
      }

      // Merge saved data over defaults so new fields survive
      this.state = this._deepMergeDefaults(
        this._createDefaultState(),
        parsed
      );
    } catch (err) {
      console.warn(
        '[GameEngine] Could not load state from localStorage:',
        err
      );
      this.state = this._createDefaultState();
    }
  }

  /**
   * Resets the engine to a brand-new game state and removes the saved data
   * from `localStorage`.
   */
  reset() {
    this.state = this._createDefaultState();
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      console.warn(
        '[GameEngine] Could not remove save from localStorage:',
        err
      );
    }
    this.emit('game-reset', {});
  }

  // =========================================================================
  // Event emitter
  // =========================================================================

  /**
   * Registers a callback for the given event type.
   *
   * Multiple listeners for the same event are supported and will be invoked
   * in registration order.
   *
   * @param {string} event - The event name (e.g. `'level-up'`).
   * @param {Function} callback - The handler function.
   * @returns {GameEngine} `this` for chaining.
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('[GameEngine] on() callback must be a function');
    }
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this;
  }

  /**
   * Emits an event, invoking all registered listeners with the provided data.
   *
   * Errors thrown by individual listeners are caught and logged so that one
   * faulty listener cannot prevent others from executing.
   *
   * @param {string} event - The event name.
   * @param {*} data - The data payload to pass to each listener.
   */
  emit(event, data) {
    const handlers = this.listeners[event];
    if (!handlers || handlers.length === 0) return;

    for (const handler of handlers) {
      try {
        handler(data);
      } catch (err) {
        console.error(
          `[GameEngine] Error in listener for "${event}":`,
          err
        );
      }
    }
  }

  /**
   * Removes all listeners for the given event type.
   *
   * @param {string} event - The event name.
   * @returns {GameEngine} `this` for chaining.
   */
  off(event) {
    delete this.listeners[event];
    return this;
  }

  // =========================================================================
  // Player
  // =========================================================================

  /**
   * Sets the player's display name and persists the change.
   * @param {string} name - The player name.
   */
  setPlayerName(name) {
    this.state.playerName = String(name || '').trim();
    this.save();
  }

  /**
   * Sets the player's chosen character.
   * @param {{ id: string, name: string, skin: string }} character - The character object.
   */
  setCharacter(character) {
    if (character && character.id && character.name && character.skin) {
      this.state.character = {
        id: character.id,
        name: character.name,
        skin: character.skin,
      };
    } else {
      this.state.character = null;
    }
    this.save();
  }

  // =========================================================================
  // XP & Level system
  // =========================================================================

  /**
   * Calculates the total XP required to **reach** a given level.
   *
   * This uses the progressive formula:
   * `XP(n) = 50 + (n-1) * 35 + floor((n-1)^2 * 5)`
   *
   * @param {number} level - The target level (1-based).
   * @returns {number} Cumulative XP required to reach that level.
   */
  getXPForLevel(level) {
    const n = Math.max(1, Math.floor(level));
    if (n === 1) return 0;
    // Sum the incremental XP required for each level from 2..n
    let total = 0;
    for (let i = 2; i <= n; i++) {
      const prev = i - 1;
      total += 50 + prev * 35 + Math.floor(prev * prev * 5);
    }
    return total;
  }

  /**
   * Adds XP to the player, automatically handles level-ups, and emits
   * appropriate events.
   *
   * @param {number} amount - The amount of XP to add (must be >= 0).
   * @returns {{ xpGained: number, newXP: number, leveledUp: boolean, oldLevel: number, newLevel: number }}
   */
  addXP(amount) {
    const xpGained = Math.max(0, Math.floor(amount));
    if (xpGained === 0) {
      return {
        xpGained: 0,
        newXP: this.state.xp,
        leveledUp: false,
        oldLevel: this.state.level,
        newLevel: this.state.level,
      };
    }

    const oldLevel = this.state.level;
    this.state.xp += xpGained;

    // Check for level-ups
    let leveledUp = false;
    while (true) {
      const xpForNext = this.getXPForLevel(this.state.level + 1);
      if (xpForNext > 0 && this.state.xp >= xpForNext) {
        this.state.level++;
        leveledUp = true;
      } else {
        break;
      }
    }

    const result = {
      xpGained,
      newXP: this.state.xp,
      leveledUp,
      oldLevel,
      newLevel: this.state.level,
    };

    this.emit('xp-gained', result);

    if (leveledUp) {
      this.emit('level-up', {
        oldLevel,
        newLevel: this.state.level,
        xp: this.state.xp,
      });
    }

    this.checkAchievements();
    this.save();
    return result;
  }

  /**
   * Returns the current level progress as a number between `0` and `1`.
   *
   * At level 1 this is `xp / xpForLevel(2)`. At the practical max level
   * (where no more XP thresholds exist) it returns `1`.
   *
   * @returns {number} Progress fraction from 0 to 1.
   */
  getLevelProgress() {
    const currentLevel = this.state.level;
    const xpThisLevel = this.getXPForLevel(currentLevel);
    const xpNextLevel = this.getXPForLevel(currentLevel + 1);

    if (xpNextLevel <= xpThisLevel) {
      // Max practical level reached
      return 1;
    }

    const progress = (this.state.xp - xpThisLevel) / (xpNextLevel - xpThisLevel);
    return Math.min(1, Math.max(0, progress));
  }

  // =========================================================================
  // Lives
  // =========================================================================

  /**
   * Removes one life from the player and emits `life-lost`.
   * @returns {{ livesLeft: number, hasLives: boolean, gameOver: boolean }}
   */
  loseLife() {
    if (this.state.lives > 0) {
      this.state.lives--;
    }

    const livesLeft = this.state.lives;
    const hasLives = livesLeft > 0;

    this.emit('life-lost', { livesLeft, hasLives });

    if (!hasLives) {
      this.state.endTime = Date.now();
      this.save();
    }

    this.save();
    return { livesLeft, hasLives, gameOver: !hasLives };
  }

  /**
   * Adds one life to the player, up to `maxLives`.
   * @returns {number} The new life count.
   */
  gainLife() {
    if (this.state.lives < this.state.maxLives) {
      this.state.lives++;
    }
    this.save();
    return this.state.lives;
  }

  /**
   * Returns whether the player still has at least one life.
   * @returns {boolean}
   */
  hasLives() {
    return this.state.lives > 0;
  }

  // =========================================================================
  // Resources
  // =========================================================================

  /**
   * Adds an amount of a resource to the player's inventory.
   *
   * @param {string} type - The resource key (e.g. `'enderPearls'`, `'diamonds'`).
   * @param {number} amount - The amount to add (must be >= 0).
   * @returns {{ type: string, amount: number, total: number }} The result of the operation.
   */
  addResource(type, amount) {
    const qty = Math.max(0, Math.floor(amount || 0));
    if (qty === 0) {
      return { type, amount: 0, total: this.state.resources[type] || 0 };
    }

    if (type in this.state.resources) {
      this.state.resources[type] += qty;
    } else {
      console.warn(`[GameEngine] Unknown resource type: "${type}"`);
      return { type, amount: 0, total: this.state.resources[type] || 0 };
    }

    const total = this.state.resources[type];
    const result = { type, amount: qty, total };
    this.emit('resource-gained', result);
    this.checkAchievements();
    this.save();
    return result;
  }

  /**
   * Returns the count of a specific resource.
   * @param {string} type - The resource key.
   * @returns {number} The current count (0 if unknown).
   */
  getResourceCount(type) {
    return this.state.resources[type] || 0;
  }

  /**
   * Returns a shallow copy of all resources.
   * @returns {Object.<string, number>}
   */
  getAllResources() {
    return { ...this.state.resources };
  }

  // =========================================================================
  // Questions
  // =========================================================================

  /**
   * Records the result of answering a question.
   *
   * Updates total counters, awards resources for correct answers, checks for
   * perfect mission bonuses, and fires relevant events.
   *
   * @param {string} questionId - Unique identifier for the question.
   * @param {string} areaId    - The area the question belongs to (e.g. `'matematicas'`).
   * @param {number} missionId - The 1-based mission number within the area.
   * @param {boolean} isCorrect - Whether the answer was correct.
   * @param {number} xpEarned  - XP awarded for this answer.
   * @param {number} timeSpent - Time taken in seconds.
   * @param {boolean} [hintUsed=false] - Whether a hint was used.
   * @returns {Object} A summary of the question result.
   */
  answerQuestion(questionId, areaId, missionId, isCorrect, xpEarned, timeSpent, hintUsed) {
    const result = {
      questionId,
      area: areaId,
      mission: missionId,
      correct: Boolean(isCorrect),
      xp: Math.max(0, Math.floor(xpEarned || 0)),
      time: typeof timeSpent === 'number' ? timeSpent : 0,
      hintUsed: Boolean(hintUsed),
    };

    this.state.questionResults.push(result);
    this.state.totalAnswered++;

    if (result.correct) {
      this.state.totalCorrect++;
    }

    // Add XP
    if (result.xp > 0) {
      this.addXP(result.xp);
    }

    // Award resource for correct answer
    if (result.correct) {
      const resourceType = AREA_RESOURCE_MAP[areaId] || null;
      if (resourceType) {
        this.addResource(resourceType, 1);
      }
    }

    // Check if the mission is now complete (all questions answered)
    const missionKey = `${areaId}_m${missionId}`;
    const missionQuestions = this.state.questionResults.filter(
      (r) => r.area === areaId && r.mission === missionId
    );

    if (missionQuestions.length === QUESTIONS_PER_MISSION) {
      // Auto-complete the mission
      if (!this.state.missionsCompleted[missionKey]) {
        const correctInMission = missionQuestions.filter((r) => r.correct).length;

        // Perfect mission bonus: +3 resources
        if (correctInMission === QUESTIONS_PER_MISSION) {
          const resourceType = AREA_RESOURCE_MAP[areaId] || null;
          if (resourceType) {
            this.addResource(resourceType, 3);
          }
        }

        this.completeMission(areaId, missionId);
      }
    }

    this.emit('question-answered', result);
    this.checkAchievements();
    this.save();
    return result;
  }

  /**
   * Increments the hint counter and emits `hint-used`.
   * @returns {number} The updated total hints used.
   */
  useHint() {
    this.state.hintsUsed++;
    this.emit('hint-used', { totalHints: this.state.hintsUsed });
    this.checkAchievements();
    this.save();
    return this.state.hintsUsed;
  }

  /**
   * Returns aggregated question statistics.
   * @returns {{ total: number, correct: number, accuracy: number, avgTime: number, bestStreak: number }}
   */
  getQuestionStats() {
    const total = this.state.totalAnswered;
    const correct = this.state.totalCorrect;
    const accuracy = total > 0 ? correct / total : 0;

    let totalTime = 0;
    let timedCount = 0;
    for (const r of this.state.questionResults) {
      if (typeof r.time === 'number' && r.time > 0) {
        totalTime += r.time;
        timedCount++;
      }
    }
    const avgTime = timedCount > 0 ? totalTime / timedCount : 0;

    // Best streak
    let bestStreak = 0;
    let currentStreak = 0;
    for (const r of this.state.questionResults) {
      if (r.correct) {
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    return {
      total,
      correct,
      accuracy: Math.round(accuracy * 100) / 100,
      avgTime: Math.round(avgTime * 100) / 100,
      bestStreak,
    };
  }

  // =========================================================================
  // Missions & Areas
  // =========================================================================

  /**
   * Marks a mission as completed, awards XP, and checks for area completion.
   *
   * @param {string} areaId    - The area identifier.
   * @param {number} missionId - The 1-based mission number.
   * @returns {{ areaId: string, missionId: number, areaComplete: boolean }}
   */
  completeMission(areaId, missionId) {
    const key = `${areaId}_m${missionId}`;
    const wasNew = !this.state.missionsCompleted[key];
    this.state.missionsCompleted[key] = true;

    // Award mission completion XP
    this.addXP(25);

    const result = { areaId, missionId, areaComplete: false };

    // Check area completion
    if (wasNew && this.isAreaComplete(areaId)) {
      this.state.areasCompleted[areaId] = true;

      // Area completion bonus: +10 resources
      const resourceType = AREA_RESOURCE_MAP[areaId] || null;
      if (resourceType) {
        this.addResource(resourceType, 10);
      }

      result.areaComplete = true;
      this.emit('area-complete', { areaId });
    }

    this.emit('mission-complete', result);
    this.checkAchievements();
    this.save();
    return result;
  }

  /**
   * Returns whether a specific mission has been completed.
   * @param {string} areaId
   * @param {number} missionId
   * @returns {boolean}
   */
  isMissionComplete(areaId, missionId) {
    return Boolean(this.state.missionsCompleted[`${areaId}_m${missionId}`]);
  }

  /**
   * Returns how many missions in an area are completed (0 to {@link MISSIONS_PER_AREA}).
   * @param {string} areaId
   * @returns {number}
   */
  getAreaProgress(areaId) {
    let count = 0;
    for (let m = 1; m <= MISSIONS_PER_AREA; m++) {
      if (this.isMissionComplete(areaId, m)) count++;
    }
    return count;
  }

  /**
   * Returns whether every mission in the given area is completed.
   * @param {string} areaId
   * @returns {boolean}
   */
  isAreaComplete(areaId) {
    for (let m = 1; m <= MISSIONS_PER_AREA; m++) {
      if (!this.isMissionComplete(areaId, m)) return false;
    }
    return true;
  }

  // =========================================================================
  // Achievements
  // =========================================================================

  /**
   * Unlocks a specific achievement by its ID.
   *
   * If the achievement was already unlocked this is a no-op.
   *
   * @param {string} achievementId - The achievement identifier.
   * @returns {{ unlocked: boolean, achievement: Object|null }}
   */
  unlockAchievement(achievementId) {
    if (this.state.achievements.includes(achievementId)) {
      return { unlocked: false, achievement: null };
    }

    const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!def) {
      console.warn(`[GameEngine] Unknown achievement: "${achievementId}"`);
      return { unlocked: false, achievement: null };
    }

    this.state.achievements.push(achievementId);
    const data = { id: def.id, name: def.name, description: def.description };
    this.emit('achievement-unlocked', data);
    this.save();
    return { unlocked: true, achievement: data };
  }

  /**
   * Iterates through all registered achievements and unlocks any whose
   * condition is now satisfied.
   *
   * @returns {Array<{ id: string, name: string, description: string }>} The
   *   newly unlocked achievements during this check.
   */
  checkAchievements() {
    const newlyUnlocked = [];

    for (const def of ACHIEVEMENTS) {
      if (!this.state.achievements.includes(def.id)) {
        try {
          if (def.check(this.state)) {
            const data = {
              id: def.id,
              name: def.name,
              description: def.description,
            };
            this.state.achievements.push(def.id);
            this.emit('achievement-unlocked', data);
            newlyUnlocked.push(data);
          }
        } catch (err) {
          console.error(
            `[GameEngine] Achievement check error for "${def.id}":`,
            err
          );
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      this.save();
    }

    return newlyUnlocked;
  }

  /**
   * Returns the list of all achievement definitions, enriched with an
   * `unlocked` boolean indicating whether the player has earned it.
   * @returns {Array<{ id: string, name: string, description: string, unlocked: boolean }>}
   */
  getAllAchievements() {
    return ACHIEVEMENTS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      unlocked: this.state.achievements.includes(def.id),
    }));
  }

  // =========================================================================
  // Results & Rank
  // =========================================================================

  /**
   * Determines the rank for a given percentage score.
   *
   * | Percentage Range | Rank     |
   * |------------------|----------|
   * | 0 – 39           | Madera   |
   * | 40 – 54          | Piedra   |
   * | 55 – 69          | Hierro   |
   * | 70 – 84          | Oro      |
   * | 85 – 94          | Diamante |
   * | 95 – 100         | Netherite|
   *
   * @param {number} percentage - Score from 0 to 100.
   * @returns {string} The rank name.
   */
  getRank(percentage) {
    const p = Math.max(0, Math.min(100, percentage));
    if (p >= 95) return 'Netherite';
    if (p >= 85) return 'Diamante';
    if (p >= 70) return 'Oro';
    if (p >= 55) return 'Hierro';
    if (p >= 40) return 'Piedra';
    return 'Madera';
  }

  /**
   * Calculates the final results of the game session.
   *
   * Computes per-area breakdowns, overall accuracy, time played, and rank.
   * Also sets `state.endTime` and `state.rank`, then emits `game-complete`.
   *
   * @returns {Object} The full results object.
   */
  calculateFinalResults() {
    // Set end time
    this.state.endTime = Date.now();

    // Per-area breakdown
    const areaIds = Object.keys(AREA_RESOURCE_MAP);
    const areaBreakdown = {};
    let totalCorrect = 0;
    let totalQuestions = 0;

    for (const areaId of areaIds) {
      const results = this.state.questionResults.filter(
        (r) => r.area === areaId
      );
      const correct = results.filter((r) => r.correct).length;
      const total = results.length;
      totalCorrect += correct;
      totalQuestions += total;

      areaBreakdown[areaId] = {
        area: areaId,
        total,
        correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) / 100 : 0,
        missionsCompleted: this.getAreaProgress(areaId),
        missionsTotal: MISSIONS_PER_AREA,
        areaComplete: this.isAreaComplete(areaId),
        resourceType: AREA_RESOURCE_MAP[areaId] || null,
      };
    }

    const overallAccuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100) / 100
        : 0;

    // Determine rank
    const overallPercentage = Math.round(overallAccuracy * 100);
    const rank = this.getRank(overallPercentage);
    this.state.rank = rank;

    const finalResults = {
      playerName: this.state.playerName,
      character: this.state.character,
      overallAccuracy,
      overallPercentage,
      rank,
      totalCorrect,
      totalQuestions,
      xp: this.state.xp,
      level: this.state.level,
      livesLeft: this.state.lives,
      resources: { ...this.state.resources },
      achievements: [...this.state.achievements],
      areasCompleted: Object.keys(this.state.areasCompleted).length,
      totalAreas: TOTAL_AREAS,
      missionsCompleted: Object.keys(this.state.missionsCompleted).length,
      totalMissions: TOTAL_AREAS * MISSIONS_PER_AREA,
      hintsUsed: this.state.hintsUsed,
      areaBreakdown,
      timePlayed: this.getElapsedTime(),
      timePlayedSeconds: this.getSessionTime(),
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      questionStats: this.getQuestionStats(),
    };

    this.emit('game-complete', finalResults);
    this.save();
    return finalResults;
  }

  // =========================================================================
  // Timer
  // =========================================================================

  /**
   * Starts the session timer by recording the current timestamp.
   * If the timer is already running this is a no-op.
   */
  startTimer() {
    if (!this.state.startTime) {
      this.state.startTime = Date.now();
      this.save();
    }
  }

  /**
   * Returns the elapsed session time as a human-readable string in the
   * format `HH:MM:SS` (or `MM:SS` if under one hour).
   * @returns {string}
   */
  getElapsedTime() {
    const seconds = this.getSessionTime();
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n) => String(n).padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }

  /**
   * Returns the number of seconds elapsed since the timer was started.
   * @returns {number}
   */
  getSessionTime() {
    if (!this.state.startTime) return 0;
    const end = this.state.endTime || Date.now();
    return Math.floor((end - this.state.startTime) / 1000);
  }

  // =========================================================================
  // UI helper methods
  // =========================================================================

  /**
   * Returns an array of heart display objects suitable for rendering the
   * player's lives in the UI (e.g. as heart icons).
   *
   * @returns {Array<{ filled: boolean }>} Array of length `maxLives`.
   */
  getHeartsDisplay() {
    const hearts = [];
    for (let i = 0; i < this.state.maxLives; i++) {
      hearts.push({ filled: i < this.state.lives });
    }
    return hearts;
  }

  /**
   * Returns a summary object of the player's current progress across all
   * areas, useful for rendering a progress screen or map.
   *
   * @returns {Array<{ areaId: string, missionsCompleted: number, missionsTotal: number, areaComplete: boolean, resourceType: string }>}
   */
  getWorldProgress() {
    return Object.keys(AREA_RESOURCE_MAP).map((areaId) => ({
      areaId,
      missionsCompleted: this.getAreaProgress(areaId),
      missionsTotal: MISSIONS_PER_AREA,
      areaComplete: this.isAreaComplete(areaId),
      resourceType: AREA_RESOURCE_MAP[areaId],
    }));
  }

  /**
   * Returns a formatted string representing the player's XP bar, e.g.
   * `"Level 5 — 210/330 XP (64%)"`.
   *
   * @returns {string}
   */
  getXPDisplayString() {
    const level = this.state.level;
    const xpThisLevel = this.getXPForLevel(level);
    const xpNextLevel = this.getXPForLevel(level + 1);

    if (xpNextLevel <= xpThisLevel) {
      return `Level ${level} — ${this.state.xp} XP (MAX)`;
    }

    const progress = Math.round(this.getLevelProgress() * 100);
    const xpInLevel = this.state.xp - xpThisLevel;
    const xpNeeded = xpNextLevel - xpThisLevel;
    return `Level ${level} — ${xpInLevel}/${xpNeeded} XP (${progress}%)`;
  }

  /**
   * Returns the total number of unlocked achievements and the total count.
   * @returns {{ unlocked: number, total: number, percentage: number }}
   */
  getAchievementSummary() {
    const unlocked = this.state.achievements.length;
    const total = ACHIEVEMENTS.length;
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    };
  }

  /**
   * Checks whether a saved game exists in `localStorage`.
   * @returns {boolean}
   */
  static hasSaveData() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Removes the saved game data from `localStorage`.
   * @returns {boolean} `true` if the key was found and removed.
   */
  static deleteSaveData() {
    try {
      if (localStorage.getItem(SAVE_KEY) !== null) {
        localStorage.removeItem(SAVE_KEY);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Make the class and constants available globally for downstream scripts
// that may not use ES modules.
if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
  window.GAME_CONSTANTS = {
  RESOURCE_TYPES,
  RESOURCE_LABELS,
  AREA_RESOURCE_MAP,
  RANK_ORDER,
  MISSIONS_PER_AREA,
  QUESTIONS_PER_MISSION,
  TOTAL_AREAS,
  SAVE_KEY,
  ACHIEVEMENTS,
};
}

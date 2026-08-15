/**
 * APP.JS — Easy Parrot
 */
(() => {
  "use strict";

  // ---------- referencias DOM ----------
  const screenSplash = document.getElementById("screen-splash");
  const screenOnboarding = document.getElementById("screen-onboarding");
  const screenResume = document.getElementById("screen-resume");
  const screenDashboard = document.getElementById("screen-dashboard");
  const screenControl = document.getElementById("screen-control");

  const inputNombre = document.getElementById("input-nombre");
  const inputProfesion = document.getElementById("input-profesion");
  const btnMarkAll = document.getElementById("btn-mark-all");
  const chipGrid = document.getElementById("chip-grid");
  const repGrid = document.getElementById("rep-grid");
  const topicRepGrid = document.getElementById("topic-rep-grid");
  const paceGrid = document.getElementById("pace-grid");
  const btnStart = document.getElementById("btn-start");
  const btnQuickStart = document.getElementById("btn-quick-start");
  const aboutTrigger = document.getElementById("about-trigger");

  const resumeGreeting = document.getElementById("resume-greeting");
  const resumeDetail = document.getElementById("resume-detail");
  const btnResume = document.getElementById("btn-resume");
  const btnRestart = document.getElementById("btn-restart");

  const dashboardGreeting = document.getElementById("dashboard-greeting");
  const dashboardDetail = document.getElementById("dashboard-detail");
  const statToday = document.getElementById("stat-today");
  const statTotal = document.getElementById("stat-total");
  const statDifficult = document.getElementById("stat-difficult");
  const statFavorites = document.getElementById("stat-favorites");
  const btnDashboardQuick = document.getElementById("btn-dashboard-quick");
  const btnDashboardResume = document.getElementById("btn-dashboard-resume");
  const btnDashboardSmart = document.getElementById("btn-dashboard-smart");
  const btnDashboardMix = document.getElementById("btn-dashboard-mix");
  const btnDashboardCustomize = document.getElementById("btn-dashboard-customize");
  const btnDashboardReset = document.getElementById("btn-dashboard-reset");

  const cajon = document.getElementById("cajon");
  const horaLabel = document.getElementById("hora-label");
  const greetingLabel = document.getElementById("greeting-label");
  const topicChip = document.getElementById("topic-chip");
  const esText = document.getElementById("es-text");
  const dashSep = document.getElementById("dash-sep");
  const enText = document.getElementById("en-text");
  const progressDots = document.getElementById("progress-dots");
  const repIndicator = document.getElementById("rep-indicator");
  const ring = document.getElementById("ring");
  const playBtn = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const btnBilingue = document.getElementById("btn-bilingue");
  const btnMono = document.getElementById("btn-mono");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const polyBtn = document.getElementById("poly-btn");
  const polyZone = document.getElementById("poly-zone");
  const polyChainRow = document.getElementById("poly-chain-row");
  const polyChain = document.getElementById("poly-chain");
  const langToggleEl = document.getElementById("lang-toggle");
  const modeToggleEl = document.querySelector(".mode-toggle");
  const POLY_ORDER = ["en", "es", "fr", "pt"];
  const POLY_TAG = { en: "EN", es: "ES", fr: "FR", pt: "PT" };
  const speedRange = document.getElementById("speed-range");
  const speedVal = document.getElementById("speed-val");
  const installBtn = document.getElementById("install-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const settingsPanel = document.getElementById("settings-panel");
  const settingsCloseBtn = document.getElementById("settings-close-btn");
  const settingsRep = document.getElementById("settings-rep");
  const settingsTopicRep = document.getElementById("settings-topic-rep");
  const settingsPace = document.getElementById("settings-pace");
  const settingsApplyBtn = document.getElementById("settings-apply-btn");
  const settingsDashboardBtn = document.getElementById("settings-dashboard-btn");
  const settingsAboutBtn = document.getElementById("settings-about-btn");
  const settingsResetProgressBtn = document.getElementById("settings-reset-progress-btn");
  const settingsResetAppBtn = document.getElementById("settings-reset-app-btn");
  const settingsNote = document.getElementById("settings-note");
  const voiceStatus = document.getElementById("voice-status");
  const sessionStatus = document.getElementById("session-status");
  const markFavoriteBtn = document.getElementById("mark-favorite-btn");
  const markDifficultBtn = document.getElementById("mark-difficult-btn");
  const markMasteredBtn = document.getElementById("mark-mastered-btn");
  const aboutPanel = document.getElementById("about-panel");
  const aboutCloseBtn = document.getElementById("about-close-btn");
  const aboutStartBtn = document.getElementById("about-start-btn");
  const summaryPanel = document.getElementById("summary-panel");
  const summaryCopy = document.getElementById("summary-copy");
  const summaryListened = document.getElementById("summary-listened");
  const summaryTopics = document.getElementById("summary-topics");
  const summaryMarks = document.getElementById("summary-marks");
  const summaryContinueBtn = document.getElementById("summary-continue-btn");
  const summaryDashboardBtn = document.getElementById("summary-dashboard-btn");
  const silentLoop = document.getElementById("silent-loop");
  let wakeLock = null; // CAMINO A: bloqueo de pantalla mientras reproduce
  const updateToast = document.getElementById("update-toast");
  const updateReloadBtn = document.getElementById("update-reload-btn");
  const appToast = document.getElementById("app-toast");
  let appToastTimer = null;

  const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  const RATES = [0.5, 0.7, 0.85, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2, 2.5, 3];
  function formatRateLabel(value) {
    const n = Number(value);
    if (Number.isInteger(n)) return `${n}x`;
    return `${String(n).replace(/0+$/, '').replace(/\.$/, '')}x`;
  }
  const ABOUT_SEEN_KEY = "easy_parrot_about_seen_v1";
  const SPLASH_MS = 3000;
  function showToast(message) {
    if (!appToast) return;
    appToast.textContent = message;
    appToast.classList.add("show");
    clearTimeout(appToastTimer);
    appToastTimer = setTimeout(() => appToast.classList.remove("show"), 2200);
  }

  const TOPIC_ICONS = {
    trabajo: "💼",
    negocios: "🤝",
    viajes: "✈️",
    familia: "👨‍👩‍👧",
    amigos: "👥",
    amor: "💜",
    mascotas: "🐾",
    salud: "🩺",
    dinero: "💰",
    tecnologia: "💻",
    comida: "🍽️",
    estudio: "📚",
    deportes: "⚽"
  };

  function getTopicIcon(topicId) {
    return TOPIC_ICONS[topicId] || "📌";
  }

  // ---------- banco plano para el modo "todo un poco" ----------
  // No resume, no limita, no filtra: son las 390 frases tal cual, solo en
  // otro orden. Se arma una sola vez al cargar la app.
  const FLAT_PHRASES = window.TOPICS.flatMap(t =>
    t.frases.map(f => ({ topicId: t.id, topicTitulo: t.titulo, es: f.es, en: f.en, fr: f.fr, pt: f.pt, tipo: f.tipo }))
  );
  function shuffledIndices(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Idiomas disponibles por frase. En este paquete la base completa está en EN+ES;
  // FR y PT existen solo para las frases que ya tienen traducción.
  // Esto evita el bug: texto inglés pronunciado con voz francesa o portuguesa.
  function entrySupportsLang(entry, lang) {
    if (!entry) return false;
    if (!lang || lang === "en") return !!entry.en;
    return !!entry[lang];
  }

  function getFlatEntriesForLang(lang) {
    if (!lang || lang === "en") return FLAT_PHRASES;
    const filtered = FLAT_PHRASES.filter(entry => entrySupportsLang(entry, lang));
    return filtered.length ? filtered : FLAT_PHRASES;
  }

  function getFlatIndicesForLang(lang) {
    if (!lang || lang === "en") return Array.from({ length: FLAT_PHRASES.length }, (_, i) => i);
    const indices = [];
    FLAT_PHRASES.forEach((entry, i) => { if (entrySupportsLang(entry, lang)) indices.push(i); });
    return indices.length ? indices : Array.from({ length: FLAT_PHRASES.length }, (_, i) => i);
  }

  function shuffledFlatIndicesForLang(lang) {
    const arr = getFlatIndicesForLang(lang).slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---------- heurística: profesión -> palabras clave sugeridas ----------
  function inferKeywordsFromProfession(text) {
    if (!text) return [];
    const t = text.toLowerCase();
    const map = [
      [["estudiante", "universidad", "colegio", "escuela"], "estudio"],
      [["enfermer", "doctor", "médic", "medic", "psicolog", "terapeut", "salud"], "salud"],
      [["venta", "comercial", "freelance", "independiente", "emprend"], "negocios"],
      [["ingenier", "programa", "desarroll", "tecnolog", "sistemas", "datos"], "tecnologia"],
      [["profesor", "maestr", "docente"], "estudio"],
      [["contad", "finanza", "banca"], "dinero"],
      [["entrenador", "deportista", "fitness", "gimnasio"], "deportes"]
    ];
    const found = [];
    map.forEach(([triggers, kw]) => {
      if (triggers.some(tr => t.includes(tr)) && !found.includes(kw)) found.push(kw);
    });
    return found;
  }

  // ---------- construcción de la cola de tópicos ----------
  // Orden: intereses marcados (en el orden en que se marcaron) + el resto.
  // Ya NO se filtra ni se reordena por hora del día — aparecen los 13 siempre.
  function buildQueue(profile) {
    const byId = id => window.TOPICS.find(t => t.id === id);
    const marked = (profile.keywords || []).map(byId).filter(Boolean);
    const rest = window.TOPICS.filter(t => !marked.includes(t));
    return [...marked, ...rest];
  }

  // ---------- estado de sesión (en memoria) ----------
  const S = {
    profile: null,
    queue: [],
    queueIndex: 0,
    phraseIndex: 0,
    repCount: 2,
    repCurrent: 0,
    topicRepeatCount: 1,
    topicPassCount: 0,
    mode: "bilingue",
    poly: false,
    polyChain: ["en", "es", "fr", "pt"],
    vocab: false,
    vocabLevels: ["A1"],
    vocabList: [],
    vocabPointer: 0,
    targetLang: "en",
    rate: 1,
    paceMinutes: 10,
    sessionStartTs: null,
    playing: false,
    playToken: 0,
    topicPointers: {},
    mixMode: false,
    mixOrder: [],
    mixPointer: 0,
    smartMode: false,
    smartQueue: [],
    smartPointer: 0,
    sessionStats: { listened: 0, topics: {}, marks: 0 },
    summaryShown: false
  };

  function currentTopic() { return S.queue[S.queueIndex]; }

  function requestedLang() { return S.targetLang || "en"; }

  function topicSupportsLang(topic, lang = requestedLang()) {
    if (!topic || !Array.isArray(topic.frases)) return false;
    return topic.frases.some(f => entrySupportsLang(f, lang));
  }

  function findTopicIndexWithLang(startIndex = 0, dir = 1, lang = requestedLang()) {
    if (!S.queue || !S.queue.length) return -1;
    const len = S.queue.length;
    for (let step = 0; step < len; step++) {
      const idx = (startIndex + (dir * step) + len * 10) % len;
      if (topicSupportsLang(S.queue[idx], lang)) return idx;
    }
    return -1;
  }

  function findPhraseIndexWithLang(topic, startIndex = 0, dir = 1, lang = requestedLang(), includeStart = true) {
    if (!topic || !Array.isArray(topic.frases) || !topic.frases.length) return -1;
    const len = topic.frases.length;
    const firstStep = includeStart ? 0 : 1;
    for (let step = firstStep; step < len + firstStep; step++) {
      const idx = (startIndex + (dir * step) + len * 10) % len;
      if (entrySupportsLang(topic.frases[idx], lang)) return idx;
    }
    return -1;
  }

  function alignToTargetLangAvailable() {
    const lang = requestedLang();
    if (lang === "en") return;

    if (S.smartMode) {
      S.smartQueue = buildSmartQueue();
      S.smartPointer = 0;
      return;
    }

    if (S.mixMode) {
      S.mixOrder = shuffledFlatIndicesForLang(lang);
      S.mixPointer = 0;
      return;
    }

    let topic = currentTopic();
    if (!topicSupportsLang(topic, lang)) {
      const idx = findTopicIndexWithLang(S.queueIndex, 1, lang);
      if (idx >= 0) {
        S.queueIndex = idx;
        topic = currentTopic();
        S.topicPassCount = 0;
      }
    }

    const phraseIdx = findPhraseIndexWithLang(topic, S.phraseIndex || 0, 1, lang, true);
    if (phraseIdx >= 0) {
      S.phraseIndex = phraseIdx;
      if (topic) S.topicPointers[topic.id] = phraseIdx;
    }
  }

  function hasActiveSession() {
    return !!(S.profile && S.queue && S.queue.length);
  }

  function getSafeProfileName() {
    return (S.profile && S.profile.nombre) ? S.profile.nombre : "";
  }

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function phraseKey(entry) {
    if (!entry) return "";
    return `${entry.topicId || entry.topicTitulo || "tema"}::${entry.en}`;
  }

  function countKeys(obj) { return obj ? Object.keys(obj).length : 0; }

  function makeMarkPayload(entry) {
    return {
      topicId: entry.topicId || "",
      topicTitulo: entry.topicTitulo || "",
      es: entry.es,
      en: entry.en,
      fr: entry.fr,
      pt: entry.pt,
      tipo: entry.tipo || "frase",
      markedAt: Date.now()
    };
  }

  function makeComparableEntry(entry) {
    if (!entry) return null;
    return {
      topicId: entry.topicId || "",
      topicTitulo: entry.topicTitulo || entry.topicId || "Tema",
      es: entry.es || "",
      en: entry.en || "",
      fr: entry.fr,
      pt: entry.pt,
      tipo: entry.tipo || "frase"
    };
  }

  function normalizeSmartEntry(entry) {
    const clean = makeComparableEntry(entry);
    return clean && clean.en ? clean : null;
  }

  function getFlatPhraseMap(entries = FLAT_PHRASES) {
    const map = {};
    entries.forEach(entry => { map[phraseKey(entry)] = entry; });
    return map;
  }

  function shuffleEntries(entries) {
    const arr = entries.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildSmartQueue() {
    const marks = window.Storage.getMarks();
    const stats = window.Storage.getStats();
    const practiced = stats.practiced || {};
    const sourceEntries = getFlatEntriesForLang(requestedLang());
    const flatMap = getFlatPhraseMap(sourceEntries);
    const used = new Set();
    const result = [];

    const addByKey = (key) => {
      if (!key || used.has(key) || (marks.mastered && marks.mastered[key])) return;
      const entry = normalizeSmartEntry(flatMap[key] || (marks.difficult && marks.difficult[key]) || (marks.favorites && marks.favorites[key]) || practiced[key]);
      if (!entry || !entrySupportsLang(entry, requestedLang())) return;
      used.add(key);
      result.push(entry);
    };

    // 1) Prioridad pedagógica: lo marcado como difícil y aún no dominado.
    Object.keys(marks.difficult || {}).forEach(addByKey);

    // 2) Luego, frases practicadas pocas veces y no dominadas.
    Object.keys(practiced)
      .filter(key => !(marks.mastered && marks.mastered[key]))
      .sort((a, b) => {
        const ca = practiced[a].count || 0;
        const cb = practiced[b].count || 0;
        if (ca !== cb) return ca - cb;
        return (practiced[a].lastAt || 0) - (practiced[b].lastAt || 0);
      })
      .forEach(addByKey);

    // 3) Después, frases todavía no vistas, en orden mezclado para evitar monotonía.
    shuffleEntries(sourceEntries).forEach(entry => {
      const key = phraseKey(entry);
      if (!practiced[key]) addByKey(key);
    });

    // 4) Fallback: cualquier frase no dominada.
    sourceEntries.forEach(entry => addByKey(phraseKey(entry)));

    return result.length ? result : sourceEntries.map(makeComparableEntry).filter(Boolean);
  }

  // Devuelve { es, en, tipo, topicTitulo } sin importar si estamos en
  // modo normal o en modo "todo un poco".
  function currentEntry() {
    if (S.vocab) return currentVocabEntry();
    const lang = requestedLang();
    if (S.smartMode) {
      if (!Array.isArray(S.smartQueue) || !S.smartQueue.length) {
        S.smartQueue = buildSmartQueue();
        S.smartPointer = 0;
      }
      let safePointer = Math.max(0, Math.min(S.smartPointer || 0, S.smartQueue.length - 1));
      if (!entrySupportsLang(S.smartQueue[safePointer], lang)) {
        S.smartQueue = buildSmartQueue();
        S.smartPointer = 0;
        safePointer = 0;
      }
      return S.smartQueue[safePointer] || S.smartQueue[0] || getFlatEntriesForLang(lang)[0] || FLAT_PHRASES[0];
    }
    if (S.mixMode) {
      if (!Array.isArray(S.mixOrder) || !S.mixOrder.length) {
        S.mixOrder = shuffledFlatIndicesForLang(lang);
        S.mixPointer = 0;
      }
      let safePointer = Math.max(0, Math.min(S.mixPointer || 0, S.mixOrder.length - 1));
      let flatIdx = S.mixOrder[safePointer];
      if (!entrySupportsLang(FLAT_PHRASES[flatIdx], lang)) {
        S.mixOrder = shuffledFlatIndicesForLang(lang);
        S.mixPointer = 0;
        safePointer = 0;
        flatIdx = S.mixOrder[0];
      }
      return FLAT_PHRASES[flatIdx] || getFlatEntriesForLang(lang)[0] || FLAT_PHRASES[0];
    }
    let topic = currentTopic() || window.TOPICS[0];
    if (!topicSupportsLang(topic, lang)) {
      alignToTargetLangAvailable();
      topic = currentTopic() || window.TOPICS[0];
    }
    let safePhraseIndex = Math.max(0, Math.min(S.phraseIndex || 0, topic.frases.length - 1));
    if (!entrySupportsLang(topic.frases[safePhraseIndex], lang)) {
      const idx = findPhraseIndexWithLang(topic, safePhraseIndex, 1, lang, true);
      if (idx >= 0) {
        S.phraseIndex = idx;
        safePhraseIndex = idx;
      }
    }
    const f = topic.frases[safePhraseIndex];
    return { topicId: topic.id, es: f.es, en: f.en, fr: f.fr, pt: f.pt, tipo: f.tipo, topicTitulo: topic.titulo };
  }

  // ---------- identidad / acerca de ----------
  function hasSeenAbout() {
    try { return localStorage.getItem(ABOUT_SEEN_KEY) === "1"; }
    catch (e) { return true; }
  }

  function markAboutSeen() {
    try { localStorage.setItem(ABOUT_SEEN_KEY, "1"); } catch (e) {}
    updateAboutPulse();
  }

  function updateAboutPulse() {
    if (!aboutTrigger) return;
    aboutTrigger.classList.toggle("is-pulsing", !hasSeenAbout());
  }

  function openAbout() {
    if (!aboutPanel) return;
    aboutPanel.classList.add("show");
    aboutPanel.setAttribute("aria-hidden", "false");
    markAboutSeen();
  }

  function closeAbout() {
    if (!aboutPanel) return;
    aboutPanel.classList.remove("show");
    aboutPanel.setAttribute("aria-hidden", "true");
  }

  [aboutTrigger, settingsAboutBtn].filter(Boolean).forEach(btn => btn.addEventListener("click", openAbout));
  if (aboutCloseBtn) aboutCloseBtn.addEventListener("click", closeAbout);
  if (aboutStartBtn) aboutStartBtn.addEventListener("click", closeAbout);
  if (aboutPanel) {
    aboutPanel.addEventListener("click", (e) => { if (e.target === aboutPanel) closeAbout(); });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAbout(); });

  // ---------- onboarding ----------
  let selectedKeywords = [];
  let selectedRep = null;
  let selectedTopicRep = null;
  let selectedPace = null;

  inputNombre.addEventListener("input", () => {
    const personalizeBtn = document.querySelector('[data-next="2"]');
    if (personalizeBtn) personalizeBtn.disabled = false;
  });

  document.querySelectorAll(".ob-next").forEach(btn => {
    btn.addEventListener("click", () => goToStep(btn.dataset.next));
  });
  document.querySelectorAll(".ob-back").forEach(btn => {
    btn.addEventListener("click", () => goToStep(btn.dataset.back));
  });
  function goToStep(n) {
    document.querySelectorAll(".onboard-step").forEach(s => s.classList.remove("active"));
    document.querySelector(`.onboard-step[data-step="${n}"]`).classList.add("active");
  }

  function resetOnboardingForm() {
    inputNombre.value = "";
    inputProfesion.value = "";
    selectedKeywords = [];
    selectedRep = null;
    selectedTopicRep = null;
    selectedPace = null;
    chipGrid.querySelectorAll(".chip").forEach(c => { c.classList.remove("active"); c.removeAttribute("data-order"); });
    document.querySelectorAll(".pace-btn").forEach(b => b.classList.remove("active"));
    btnStart.disabled = true;
    document.querySelector('[data-next="2"]').disabled = false;
    syncMarkAllButton();
    goToStep(1);
  }

  function goToLoginScreen(clearStoredData = true) {
    pause();
    if (clearStoredData) window.Storage.clearAll();
    clearTimeout(saveTimer);
    S.profile = null;
    S.queue = [];
    S.queueIndex = 0;
    S.phraseIndex = 0;
    S.repCurrent = 0;
    S.topicPassCount = 0;
    S.sessionStartTs = null;
    S.playing = false;
    S.mixMode = false;
    S.mixOrder = [];
    S.mixPointer = 0;
    S.smartMode = false;
    S.smartQueue = [];
    S.smartPointer = 0;
    sessionStatus.textContent = "";
    greetingLabel.textContent = "";
    horaLabel.textContent = "";
    closeSettings();
    resetOnboardingForm();
    setActiveScreen(screenOnboarding);
  }

  function renderChipOrder() {
    // Muestra el número de prioridad (1, 2, 3…) en cada chip activo,
    // según el orden en que se marcaron. Es la misma prioridad que ya usa
    // buildQueue para ordenar la sesión; aquí solo se hace visible.
    chipGrid.querySelectorAll(".chip").forEach(chip => {
      const pos = selectedKeywords.indexOf(chip.dataset.kw);
      if (pos >= 0) chip.dataset.order = String(pos + 1);
      else chip.removeAttribute("data-order");
    });
  }

  function toggleChip(chip) {
    const kw = chip.dataset.kw;
    const idx = selectedKeywords.indexOf(kw);
    if (idx >= 0) { selectedKeywords.splice(idx, 1); chip.classList.remove("active"); }
    else { selectedKeywords.push(kw); chip.classList.add("active"); }
    renderChipOrder();
    syncMarkAllButton();
  }
  chipGrid.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    toggleChip(chip);
  });

  function syncMarkAllButton() {
    const all = chipGrid.querySelectorAll(".chip").length;
    btnMarkAll.classList.toggle("all-marked", selectedKeywords.length === all);
    btnMarkAll.textContent = selectedKeywords.length === all ? "Desmarcar todos" : "Marcar todos";
  }
  btnMarkAll.addEventListener("click", () => {
    const chips = Array.from(chipGrid.querySelectorAll(".chip"));
    const allMarked = selectedKeywords.length === chips.length;
    if (allMarked) {
      selectedKeywords = [];
      chips.forEach(c => c.classList.remove("active"));
    } else {
      selectedKeywords = chips.map(c => c.dataset.kw);
      chips.forEach(c => c.classList.add("active"));
    }
    renderChipOrder();
    syncMarkAllButton();
  });

  repGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".pace-btn");
    if (!btn) return;
    repGrid.querySelectorAll(".pace-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedRep = parseInt(btn.dataset.rep, 10);
  });

  topicRepGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".pace-btn");
    if (!btn) return;
    topicRepGrid.querySelectorAll(".pace-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTopicRep = parseInt(btn.dataset.trep, 10);
  });

  paceGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".pace-btn");
    if (!btn) return;
    paceGrid.querySelectorAll(".pace-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPace = parseInt(btn.dataset.pace, 10);
    btnStart.disabled = false;
  });

  btnQuickStart.addEventListener("click", () => {
    const profile = {
      nombre: inputNombre.value.trim() || "amigo",
      profesion: "",
      keywords: [],
      repCount: 1,
      topicRepeatCount: 1,
      paceMinutes: 5
    };
    window.Storage.saveProfile(profile);
    window.Storage.clearProgress();
    startSession(profile, null, { quick: true });
  });

  btnStart.addEventListener("click", () => {
    const profile = {
      nombre: inputNombre.value.trim() || "amigo",
      profesion: inputProfesion.value.trim(),
      keywords: selectedKeywords.slice(),
      repCount: selectedRep || 2,
      topicRepeatCount: selectedTopicRep || 1,
      paceMinutes: selectedPace
    };
    window.Storage.saveProfile(profile);
    window.Storage.clearProgress();
    startSession(profile, null);
  });

  // ---------- dashboard / retomar / reiniciar ----------
  function showDashboardScreen(profile, progress) {
    const stats = window.Storage.getStats();
    const marks = window.Storage.getMarks();
    const today = stats.days[todayKey()] || { listens: 0 };
    dashboardGreeting.textContent = `Hola de nuevo, ${profile.nombre}`;
    dashboardDetail.textContent = progress ? "Tienes una práctica guardada. También puedes empezar una sesión breve." : "Escucha, repite y marca las frases que quieres reforzar.";
    statToday.textContent = today.listens || 0;
    statTotal.textContent = stats.totalListens || 0;
    statDifficult.textContent = countKeys(marks.difficult);
    statFavorites.textContent = countKeys(marks.favorites);
    btnDashboardResume.disabled = !progress;
    btnDashboardResume.style.opacity = progress ? "1" : ".45";
    btnDashboardResume.title = progress ? "Continuar desde el último punto" : "Aún no hay progreso guardado";
    setActiveScreen(screenDashboard);
  }

  function showResumeScreen(profile, progress) {
    showDashboardScreen(profile, progress);
  }
  btnResume.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    const progress = window.Storage.getProgress();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    startSession(profile, progress);
  });
  btnRestart.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    window.Storage.clearProgress();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    startSession(profile, null);
  });
  btnDashboardQuick.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    startSession(profile, null, { quick: true });
  });

  btnDashboardResume.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    const progress = window.Storage.getProgress();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    startSession(profile, progress || null);
  });

  btnDashboardSmart.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    startSession(profile, null, { smart: true, quick: true });
  });

  btnDashboardMix.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    startSession(profile, null, { mix: true, quick: true });
  });

  btnDashboardCustomize.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    resetOnboardingForm();
    if (profile) {
      inputNombre.value = profile.nombre || "";
      inputProfesion.value = profile.profesion || "";
      selectedKeywords = Array.isArray(profile.keywords) ? profile.keywords.slice() : [];
      chipGrid.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", selectedKeywords.includes(c.dataset.kw)));
      syncMarkAllButton();
    }
    goToStep(2);
    setActiveScreen(screenOnboarding);
  });

  btnDashboardReset.addEventListener("click", () => goToLoginScreen(true));


  // ---------- arranque de sesión ----------
  function startSession(profile, progress, options = {}) {
    if (!profile || !profile.nombre) {
      window.Storage.clearProgress();
      goToLoginScreen(false);
      return;
    }
    S.profile = profile;
    S.targetLang = profile.targetLang || "en";
    if (window.AudioEngine.setTargetLang) window.AudioEngine.setTargetLang(S.targetLang);
    S.queue = buildQueue(profile);

    if (progress) {
      S.smartMode = !!progress.smartMode;
      S.smartQueue = S.smartMode && Array.isArray(progress.smartQueue)
        ? progress.smartQueue.map(normalizeSmartEntry).filter(Boolean)
        : [];
      if (S.smartMode && !S.smartQueue.length) S.smartQueue = buildSmartQueue();
      S.smartPointer = progress.smartPointer || 0;

      S.mixMode = !S.smartMode && !!progress.mixMode;
      if (S.mixMode && Array.isArray(progress.mixOrder) && progress.mixOrder.length === FLAT_PHRASES.length) {
        S.mixOrder = progress.mixOrder;
        S.mixPointer = progress.mixPointer || 0;
      } else if (S.mixMode) {
        S.mixOrder = shuffledFlatIndicesForLang(requestedLang());
        S.mixPointer = 0;
      } else {
        S.mixOrder = [];
        S.mixPointer = 0;
      }
      const idx = S.queue.findIndex(t => t.id === progress.topicId);
      S.queueIndex = idx >= 0 ? idx : 0;
      S.phraseIndex = Math.min(progress.phraseIndex || 0, currentTopic().frases.length - 1);
      S.mode = progress.mode || "bilingue";
      S.poly = !!progress.poly;
      if (Array.isArray(progress.polyChain) && progress.polyChain.length) {
        S.polyChain = POLY_ORDER.filter(l => progress.polyChain.includes(l));
        if (!S.polyChain.length) S.polyChain = ["en", "es", "fr", "pt"];
      }
      S.vocab = !!progress.vocab;
      if (Array.isArray(progress.vocabLevels) && progress.vocabLevels.length) {
        S.vocabLevels = progress.vocabLevels.filter(l => ["A1","A2","B1","B2"].includes(l));
        if (!S.vocabLevels.length) S.vocabLevels = ["A1"];
      }
      S.rate = progress.rate || 1;
      S.repCount = progress.repCount || profile.repCount || 2;
      S.topicRepeatCount = progress.topicRepeatCount || profile.topicRepeatCount || 1;
      S.topicPassCount = progress.topicPassCount || 0;
      S.paceMinutes = (progress.paceMinutes !== undefined) ? progress.paceMinutes : (profile.paceMinutes || 10);
      S.topicPointers = progress.topicPointers || {};
    } else {
      S.queueIndex = 0;
      S.phraseIndex = 0;
      S.mode = "bilingue";
      S.rate = 1;
      S.repCount = profile.repCount || 2;
      S.topicRepeatCount = profile.topicRepeatCount || 1;
      S.topicPassCount = 0;
      S.paceMinutes = (profile.paceMinutes !== undefined) ? profile.paceMinutes : 10;
      S.topicPointers = {};
      S.mixMode = false;
      S.mixOrder = [];
      S.mixPointer = 0;
      S.smartMode = false;
      S.smartQueue = [];
      S.smartPointer = 0;
    }

    if (!progress) {
      window.Storage.clearProgress();
    }

    if (options.quick) {
      S.paceMinutes = 5;
      S.repCount = Math.max(1, S.repCount || 1);
    }
    if (options.smart) {
      S.smartMode = true;
      S.smartQueue = buildSmartQueue();
      S.smartPointer = 0;
      S.mixMode = false;
      S.mixOrder = [];
      S.mixPointer = 0;
    }
    if (options.mix) {
      S.smartMode = false;
      S.smartQueue = [];
      S.smartPointer = 0;
      S.mixMode = true;
      S.mixOrder = shuffledFlatIndicesForLang(requestedLang());
      S.mixPointer = 0;
    }

    S.repCurrent = 0;
    S.sessionStartTs = Date.now();
    S.sessionStats = { listened: 0, topics: {}, marks: 0 };
    S.summaryShown = false;
    S.playing = false;

    applyModeUI();
    applyLangUI();
    applyPolyUI();
    if (S.vocab) buildVocabList();
    applyVocabUI();
    applyRateUI();
    shuffleBtn.classList.toggle("active", S.mixMode);
    shuffleBtn.disabled = !!S.smartMode;
    shuffleBtn.title = S.smartMode ? "En repaso inteligente, el orden lo calcula la app" : "Todo un poco: aleatoriza las 13 familias";
    window.AudioEngine.setRate(S.rate);
    alignToTargetLangAvailable();
    renderPhrase();
    setActiveScreen(screenControl);
    tickClock();
  }

  function setActiveScreen(screenEl) {
    [screenSplash, screenOnboarding, screenDashboard, screenResume, screenControl]
      .filter(Boolean)
      .forEach(s => s.classList.remove("active"));
    if (screenEl) screenEl.classList.add("active");
  }

  // ---------- limpieza de estado visual entre modos ----------
  function clearPolyArtifacts() {
    setPolyActiveLine(null);
    if (polyZone) {
      polyZone.hidden = true;
      polyZone.innerHTML = "";
    }
    if (polyChainRow) polyChainRow.hidden = true;
  }

  function clearVocabArtifacts() {
    if (vocabEj) {
      vocabEj.hidden = true;
      vocabEj.textContent = "";
      vocabEj.removeAttribute("lang");
    }
    if (vocabLevelRow) vocabLevelRow.hidden = true;
  }

  function syncVisualModeState() {
    // Evita que una línea auxiliar de Vocabulario o Políglota quede pegada
    // cuando el usuario vuelve al flujo base EN/ES o cambia de modo.
    if (!S.poly) clearPolyArtifacts();
    if (!S.vocab) clearVocabArtifacts();

    if (S.poly) {
      clearVocabArtifacts();
      if (polyZone) polyZone.hidden = false;
      if (polyChainRow) polyChainRow.hidden = false;
      if (langToggleEl) langToggleEl.style.display = "none";
      if (modeToggleEl) modeToggleEl.style.display = "none";
      if (polyBtn) polyBtn.style.display = "";
      if (vocabBtn) vocabBtn.style.display = "";
      enText.style.display = "none";
      dashSep.style.display = "none";
      esText.style.display = "none";
      return;
    }

    if (S.vocab) {
      clearPolyArtifacts();
      if (vocabLevelRow) vocabLevelRow.hidden = false;
      if (langToggleEl) langToggleEl.style.display = "";
      if (modeToggleEl) modeToggleEl.style.display = "none";
      if (polyBtn) polyBtn.style.display = "none";
      if (vocabBtn) vocabBtn.style.display = "";
      enText.style.display = "";
      dashSep.style.display = "";
      esText.style.display = "";
      return;
    }

    if (langToggleEl) langToggleEl.style.display = "";
    if (modeToggleEl) modeToggleEl.style.display = "";
    if (polyBtn) polyBtn.style.display = "";
    if (vocabBtn) vocabBtn.style.display = "";
    enText.style.display = "";
    applyModeUI();
  }

  function leaveSpecialModesForBase() {
    S.poly = false;
    S.vocab = false;
    S.repCurrent = 0;
    syncVisualModeState();
    applyPolyUI();
    applyVocabUI();
    applyModeUI();
  }

  // ---------- render ----------
  function renderPhrase() {
    if (!hasActiveSession()) return;
    const entry = currentEntry();
    syncVisualModeState();
    const franja = window.DateTimeContext.getFranja();
    cajon.dataset.theme = franja; // el color ambiental sigue la hora real; ya no filtra contenido

    esText.textContent = entry.es;
    esText.lang = "es";
    enText.textContent = entry[S.targetLang] || entry.en;
    enText.lang = entry[S.targetLang] ? S.targetLang : "en";

    if (S.vocab) renderVocabCard(entry);
    else if (S.poly) renderPolyLines(entry);

    if (S.vocab) {
      topicChip.textContent = "🧭";
      topicChip.title = `Ruta A1–B2 · ${entry.topicTitulo}`;
      topicChip.setAttribute("aria-label", `Ruta A1 a B2: ${entry.topicTitulo}`);
      progressDots.innerHTML = "";
      progressDots.style.display = "none";
    } else if (S.smartMode) {
      topicChip.textContent = "🧠";
      topicChip.title = `Repaso inteligente · ${entry.topicTitulo}`;
      topicChip.setAttribute("aria-label", `Repaso inteligente: ${entry.topicTitulo}`);
      progressDots.innerHTML = "";
      progressDots.style.display = "none";
    } else if (S.mixMode) {
      topicChip.textContent = "🔀";
      topicChip.title = `Todo un poco · ${entry.topicTitulo}`;
      topicChip.setAttribute("aria-label", `Todo un poco: ${entry.topicTitulo}`);
      progressDots.innerHTML = "";
      const posLabel = document.createElement("span");
      progressDots.appendChild(posLabel); // placeholder vacío, se usa texto abajo
      progressDots.style.display = "none";
    } else {
      const topic = currentTopic();
      topicChip.textContent = getTopicIcon(topic.id);
      topicChip.title = `Siguiente tema · ${topic.titulo}`;
      topicChip.setAttribute("aria-label", `Siguiente tema: ${topic.titulo}`);
      progressDots.style.display = "flex";
      progressDots.innerHTML = "";
      topic.frases.forEach((_, i) => {
        const span = document.createElement("span");
        if (i === S.phraseIndex) span.classList.add("active");
        progressDots.appendChild(span);
      });
    }

    const repText = S.repCount > 1 ? `repetición ${S.repCurrent + 1}/${S.repCount}` : "";
    const posText = S.vocab
      ? `${Math.min((S.vocabPointer || 0) + 1, S.vocabList.length || 1)} de ${S.vocabList.length || 1} · ${entry.topicTitulo}`
      : (S.smartMode
        ? `repaso ${Math.min((S.smartPointer || 0) + 1, S.smartQueue.length || 1)} de ${S.smartQueue.length || 1}`
        : (S.mixMode ? `frase ${S.mixPointer + 1} de ${S.mixOrder.length || getFlatIndicesForLang(requestedLang()).length}` : ""));
    repIndicator.textContent = [repText, posText].filter(Boolean).join(" · ");
    updateMarkButtons();

    scheduleSaveProgress();
    updateMediaSession();
  }

  function tickClock() {
    const franja = window.DateTimeContext.getFranja();
    if (hasActiveSession()) {
      horaLabel.textContent = window.DateTimeContext.formatClock();
      greetingLabel.textContent = window.DateTimeContext.getGreeting(franja, getSafeProfileName());
      cajon.dataset.theme = franja;
      updateSessionStatus();
      return;
    }
    // Cuando el usuario vuelve al login o borra datos, el reloj no debe
    // intentar leer un perfil inexistente. Esto evita el error: "reading nombre".
    horaLabel.textContent = "";
    greetingLabel.textContent = "";
  }
  setInterval(tickClock, 30000);

  // ---------- avance al siguiente contenido NUEVO ----------
  function advanceToNextNewPhrase() {
    if (S.vocab) {
      if (S.vocabList.length) S.vocabPointer = (S.vocabPointer + 1) % S.vocabList.length;
      return;
    }
    if (S.smartMode) {
      S.smartPointer++;
      if (!S.smartQueue.length || S.smartPointer >= S.smartQueue.length) {
        S.smartQueue = buildSmartQueue();
        S.smartPointer = 0;
      }
      return;
    }
    if (S.mixMode) {
      S.mixPointer++;
      if (S.mixPointer >= S.mixOrder.length) {
        S.mixOrder = shuffledFlatIndicesForLang(requestedLang());
        S.mixPointer = 0;
      }
      return;
    }
    let topic = currentTopic();
    const lang = requestedLang();
    const next = findPhraseIndexWithLang(topic, S.phraseIndex || 0, 1, lang, false);
    if (next >= 0) {
      const wrapped = next <= (S.phraseIndex || 0);
      S.phraseIndex = next;
      S.topicPointers[topic.id] = next;

      if (wrapped) {
        // se completó una vuelta entera al tópico
        S.topicPassCount = (S.topicPassCount || 0) + 1;
        if (S.topicPassCount >= S.topicRepeatCount) {
          S.topicPassCount = 0;
          const idx = findTopicIndexWithLang(S.queueIndex + 1, 1, lang);
          if (idx >= 0) {
            S.queueIndex = idx;
            topic = currentTopic();
            S.phraseIndex = findPhraseIndexWithLang(topic, S.topicPointers[topic.id] || 0, 1, lang, true);
          }
        }
      }
    }
  }

  // ---------- marcas y progreso visible ----------
  function updateMarkButtons() {
    if (!hasActiveSession()) return;
    const marks = window.Storage.getMarks();
    const key = phraseKey(currentEntry());
    markFavoriteBtn.classList.toggle("active", !!marks.favorites[key]);
    markDifficultBtn.classList.toggle("active", !!marks.difficult[key]);
    markMasteredBtn.classList.toggle("active", !!marks.mastered[key]);
  }

  function toggleCurrentMark(kind) {
    if (!hasActiveSession()) return;
    const entry = currentEntry();
    const key = phraseKey(entry);
    const marks = window.Storage.getMarks();
    if (!marks[kind]) marks[kind] = {};
    const wasMarked = !!marks[kind][key];
    if (wasMarked) delete marks[kind][key];
    else marks[kind][key] = makeMarkPayload(entry);
    if (kind === "mastered" && marks.mastered[key]) {
      delete marks.difficult[key];
    }
    if (kind === "difficult" && marks.difficult[key]) {
      delete marks.mastered[key];
    }
    window.Storage.saveMarks(marks);
    S.sessionStats.marks++;
    updateMarkButtons();
    const labels = { favorites: "favoritos", difficult: "difíciles", mastered: "dominadas" };
    showToast(wasMarked ? "Marca quitada" : `Guardada en ${labels[kind] || "marcas"}`);
  }

  markFavoriteBtn.addEventListener("click", () => toggleCurrentMark("favorites"));
  markDifficultBtn.addEventListener("click", () => toggleCurrentMark("difficult"));
  markMasteredBtn.addEventListener("click", () => toggleCurrentMark("mastered"));

  function recordPhrasePractice(entry) {
    if (!entry) return;
    const stats = window.Storage.getStats();
    const day = todayKey();
    const key = phraseKey(entry);
    if (!stats.days[day]) stats.days[day] = { listens: 0, topics: {} };
    if (!stats.days[day].topics) stats.days[day].topics = {};
    stats.totalListens = (stats.totalListens || 0) + 1;
    stats.days[day].listens = (stats.days[day].listens || 0) + 1;
    stats.days[day].topics[entry.topicId || entry.topicTitulo] = (stats.days[day].topics[entry.topicId || entry.topicTitulo] || 0) + 1;
    if (!stats.practiced) stats.practiced = {};
    if (!stats.practiced[key]) stats.practiced[key] = { ...makeMarkPayload(entry), count: 0, firstAt: Date.now() };
    stats.practiced[key].count = (stats.practiced[key].count || 0) + 1;
    stats.practiced[key].lastAt = Date.now();
    stats.lastPracticedAt = Date.now();
    stats.lastTopic = entry.topicTitulo || entry.topicId || "";
    window.Storage.saveStats(stats);

    S.sessionStats.listened = (S.sessionStats.listened || 0) + 1;
    S.sessionStats.topics[entry.topicId || entry.topicTitulo || "tema"] = true;
  }

  // ---------- reproducción ----------
  async function playLoop(token) {
    while (S.playing && token === S.playToken) {
      if (S.vocab) {
        const it = currentEntry();
        renderVocabCard(it);
        await window.AudioEngine.speakRecall(it, S.targetLang, () => revealVocab(it));
      } else if (S.poly) {
        await window.AudioEngine.speakChain(currentEntry(), S.polyChain);
      } else {
        await window.AudioEngine.speakPhrase(currentEntry(), S.mode);
      }
      if (!S.playing || token !== S.playToken) return;

      S.repCurrent++;
      if (S.repCurrent < S.repCount) {
        renderPhrase();
        continue;
      }
      recordPhrasePractice(currentEntry());
      S.repCurrent = 0;
      advanceToNextNewPhrase();
      renderPhrase();
    }
  }

  function setPlayingUI(isPlaying) {
    ring.classList.toggle("playing", isPlaying);
    playBtn.classList.toggle("is-playing", isPlaying);
    const icon = document.getElementById("play-icon");
    if (icon) {
      icon.outerHTML = isPlaying
        ? `<svg id="play-icon" viewBox="0 0 24 24">${ICON_PAUSE}</svg>`
        : `<svg id="play-icon" viewBox="0 0 24 24">${ICON_PLAY}</svg>`;
    }
  }

  // ---------- CAMINO A: Wake Lock (mantener pantalla encendida) ----------
  // Evita que la pantalla se atenúe o se autobloquee mientras la app
  // reproduce, que es cuando el sistema suspende la voz sintética. No
  // sobrevive a un bloqueo manual ni al cambio a otra app: para eso hace
  // falta el Camino B (archivos de audio reales). Si el navegador no
  // soporta la API (versiones antiguas), simplemente no hace nada.
  async function requestWakeLock() {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      // Si el sistema lo libera por su cuenta, lo dejamos en null para
      // poder volver a pedirlo al regresar a primer plano.
      wakeLock.addEventListener("release", () => { wakeLock = null; });
    } catch (e) {
      // Puede fallar si la pestaña no está visible o por política del SO.
      wakeLock = null;
    }
  }

  async function releaseWakeLock() {
    if (!wakeLock) return;
    try { await wakeLock.release(); } catch (e) { /* noop */ }
    wakeLock = null;
  }

  function play() {
    if (!hasActiveSession()) return;
    if (S.playing) return;
    S.playing = true;
    S.playToken++;
    setPlayingUI(true);
    silentLoop.play().catch(() => {});
    requestWakeLock();
    playLoop(S.playToken);
  }

  function pause() {
    S.playing = false;
    S.playToken++;
    window.AudioEngine.stop();
    releaseWakeLock();
    setPlayingUI(false);
    if (S.poly) setPolyActiveLine(null);
    if (S.vocab) renderVocabCard(currentEntry());
  }

  // Cambio de modo/idioma/ruta: corta cualquier audio pendiente, invalida
  // callbacks viejos y permite reiniciar limpio en la frase que se ve ahora.
  function stopForModeChange() {
    const shouldResume = !!S.playing;
    S.playing = false;
    S.playToken++;
    window.AudioEngine.stop();
    releaseWakeLock();
    setPlayingUI(false);
    setPolyActiveLine(null);
    S.repCurrent = 0;
    return shouldResume;
  }

  function resumeAfterModeChange(shouldResume) {
    if (shouldResume) play();
  }

  playBtn.addEventListener("click", () => { S.playing ? pause() : play(); });

  function manualAdvance(dir) {
    if (!hasActiveSession()) return;
    const shouldResume = stopForModeChange();
    if (dir > 0) {
      recordPhrasePractice(currentEntry());
      advanceToNextNewPhrase();
    } else if (S.vocab) {
      const len = Math.max(1, S.vocabList.length || 1);
      S.vocabPointer = (S.vocabPointer - 1 + len) % len;
    } else if (S.smartMode) {
      const len = Math.max(1, S.smartQueue.length || 1);
      S.smartPointer = (S.smartPointer - 1 + len) % len;
    } else if (S.mixMode) {
      S.mixPointer = (S.mixPointer - 1 + S.mixOrder.length) % S.mixOrder.length;
    } else {
      const topic = currentTopic();
      const idx = findPhraseIndexWithLang(topic, S.phraseIndex || 0, -1, requestedLang(), false);
      if (idx >= 0) S.phraseIndex = idx;
      // El puntero del tópico debe coincidir SIEMPRE con la frase mostrada
      // (misma convención que advanceToNextNewPhrase). Dejarlo en phraseIndex+1
      // desincronizaba lo que se ve de lo que el sistema cree que toca, y al
      // pulsar "siguiente" o reanudar saltaba a otra frase.
      S.topicPointers[topic.id] = S.phraseIndex;
    }
    renderPhrase();
    resumeAfterModeChange(shouldResume);
  }
  prevBtn.addEventListener("click", () => manualAdvance(-1));
  nextBtn.addEventListener("click", () => manualAdvance(1));

  // En modo normal, el chip avanza manualmente al siguiente tema.
  // En modo aleatorio, el chip baraja de nuevo (es lo único que tiene sentido ahí).
  topicChip.addEventListener("click", () => {
    if (!hasActiveSession()) return;
    const shouldResume = stopForModeChange();
    if (S.vocab || S.poly) {
      S.vocab = false;
      S.poly = false;
      clearPolyArtifacts();
      clearVocabArtifacts();
      applyPolyUI();
      applyVocabUI();
      applyModeUI();
    }
    if (S.smartMode) {
      S.smartQueue = buildSmartQueue();
      S.smartPointer = 0;
    } else if (S.mixMode) {
      S.mixOrder = shuffledFlatIndicesForLang(requestedLang());
      S.mixPointer = 0;
    } else {
      S.topicPassCount = 0;
      const idx = findTopicIndexWithLang(S.queueIndex + 1, 1, requestedLang());
      S.queueIndex = idx >= 0 ? idx : ((S.queueIndex + 1) % S.queue.length);
      const topic = currentTopic();
      const savedIdx = S.topicPointers[topic.id] || 0;
      S.phraseIndex = findPhraseIndexWithLang(topic, savedIdx, 1, requestedLang(), true);
      if (S.phraseIndex < 0) S.phraseIndex = 0;
    }
    renderPhrase();
    resumeAfterModeChange(shouldResume);
  });

  // ---------- modo "todo un poco" (aleatorio) ----------
  shuffleBtn.addEventListener("click", () => {
    if (!hasActiveSession()) return;
    const shouldResume = stopForModeChange();
    S.smartMode = false;
    S.smartQueue = [];
    S.smartPointer = 0;
    S.poly = false;
    S.vocab = false;
    clearPolyArtifacts();
    clearVocabArtifacts();
    S.mixMode = !S.mixMode;
    shuffleBtn.classList.toggle("active", S.mixMode);
    shuffleBtn.disabled = !!S.smartMode;
    shuffleBtn.title = S.smartMode ? "En repaso inteligente, el orden lo calcula la app" : "Todo un poco: aleatoriza las 13 familias";
    if (S.mixMode) {
      S.mixOrder = shuffledFlatIndicesForLang(requestedLang());
      S.mixPointer = 0;
    }
    renderPhrase();
    resumeAfterModeChange(shouldResume);
  });

  // ---------- modo bilingüe / solo inglés ----------
  const LANG_LABEL = { en: "EN", fr: "FR", pt: "PT" };
  function applyModeUI() {
    btnBilingue.classList.toggle("active", S.mode === "bilingue");
    btnMono.classList.toggle("active", S.mode === "mono");
    btnBilingue.setAttribute("aria-pressed", S.mode === "bilingue" ? "true" : "false");
    btnMono.setAttribute("aria-pressed", S.mode === "mono" ? "true" : "false");
    const tl = LANG_LABEL[S.targetLang] || "EN";
    btnBilingue.textContent = tl + "+ES";
    btnMono.textContent = tl;
    const showEs = S.mode === "bilingue";
    esText.style.display = showEs ? "block" : "none";
    dashSep.style.display = showEs ? "block" : "none";
    if (!S.poly) {
      if (polyZone) polyZone.hidden = true;
      if (polyChainRow) polyChainRow.hidden = true;
      setPolyActiveLine(null);
    }
  }

  // ---------- selector de idioma a practicar ----------
  const langToggle = document.getElementById("lang-toggle");
  function applyLangUI() {
    if (!langToggle) return;
    langToggle.querySelectorAll("button").forEach(b =>
      b.setAttribute("aria-pressed", b.dataset.lang === S.targetLang ? "true" : "false"));
    langToggle.querySelectorAll("button").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === S.targetLang));
  }
  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !hasActiveSession()) return;
      const lang = btn.dataset.lang;
      if (!lang || lang === S.targetLang) return;
      const shouldResume = stopForModeChange();
      S.targetLang = lang;
      if (window.AudioEngine.setTargetLang) window.AudioEngine.setTargetLang(lang);
      if (S.profile) { S.profile.targetLang = lang; window.Storage.saveProfile(S.profile); }
      // En A1-B2 (ruta funcional) no filtramos por idioma de destino: siempre
      // se conserva la secuencia inglés → español → idioma elegido.
      if (!S.vocab) alignToTargetLangAvailable();
      applyLangUI();
      applyModeUI();
      renderPhrase();
      updateVoiceStatusMessage(false);
      const names = { en: "Inglés", fr: "Francés", pt: "Portugués" };
      showToast(`Idioma: ${names[lang] || lang}`);
      resumeAfterModeChange(shouldResume);
    });
  }
  btnBilingue.addEventListener("click", () => {
    if (!hasActiveSession()) return;
    const shouldResume = stopForModeChange();
    S.mode = "bilingue";
    leaveSpecialModesForBase();
    renderPhrase();
    updateVoiceStatusMessage(false);
    saveProgress();
    showToast("Modo bilingüe aplicado");
    resumeAfterModeChange(shouldResume);
  });
  btnMono.addEventListener("click", () => {
    if (!hasActiveSession()) return;
    const shouldResume = stopForModeChange();
    S.mode = "mono";
    leaveSpecialModesForBase();
    renderPhrase();
    updateVoiceStatusMessage(false);
    saveProgress();
    showToast("Modo solo idioma aplicado");
    resumeAfterModeChange(shouldResume);
  });

  // ---------- Modo Políglota ----------
  // Construye la tarjeta apilada con los idiomas encadenados (en su orden fijo
  // EN, ES, FR, PT), omitiendo los que no estén en la cadena o no tengan texto.
  function renderPolyLines(entry) {
    if (!polyZone) return;
    polyZone.innerHTML = "";
    POLY_ORDER.forEach(lang => {
      if (!S.polyChain.includes(lang)) return;
      const texto = (lang === "es") ? entry.es : entry[lang];
      if (!texto) return;
      const row = document.createElement("div");
      row.className = "poly-line";
      row.dataset.lang = lang;
      const tag = document.createElement("span");
      tag.className = "poly-tag";
      tag.textContent = POLY_TAG[lang];
      const txt = document.createElement("span");
      txt.className = "poly-text";
      txt.textContent = texto;
      txt.lang = lang;
      row.appendChild(tag);
      row.appendChild(txt);
      polyZone.appendChild(row);
    });
  }

  // Resalta la línea del idioma que suena (callback del motor).
  function setPolyActiveLine(lang) {
    if (!polyZone) return;
    polyZone.querySelectorAll(".poly-line").forEach(r =>
      r.classList.toggle("active", !!lang && r.dataset.lang === lang));
  }

  function applyPolyUI() {
    if (!polyBtn) return;
    polyBtn.classList.toggle("active", S.poly);
    polyBtn.setAttribute("aria-pressed", S.poly ? "true" : "false");
    if (S.poly) {
      clearVocabArtifacts();
      if (polyZone) polyZone.hidden = false;
      if (polyChainRow) polyChainRow.hidden = false;
    } else {
      clearPolyArtifacts();
    }
    // En políglota no aplican el selector de idioma ni el toggle bilingüe/mono.
    if (langToggleEl) langToggleEl.style.display = S.poly ? "none" : "";
    if (modeToggleEl) modeToggleEl.style.display = S.poly ? "none" : (S.vocab ? "none" : "");
    // Oculta las dos líneas normales cuando la tarjeta apilada está activa.
    if (S.poly) {
      enText.style.display = "none";
      dashSep.style.display = "none";
      esText.style.display = "none";
    } else if (!S.vocab) {
      enText.style.display = "";
      applyModeUI();
    }
    if (polyChain) {
      const eng = window.AudioEngine;
      polyChain.querySelectorAll("button").forEach(b => {
        const lang = b.dataset.poly;
        const on = S.polyChain.includes(lang);
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
        // Si el idioma no tiene voz instalada en el dispositivo, se avisa:
        // se podrá leer en pantalla, pero no se escuchará.
        const sinVoz = eng && eng.hasVoiceFor && !eng.hasVoiceFor(lang);
        b.classList.toggle("no-voice", !!sinVoz);
        b.title = sinVoz ? "Voz no instalada en este dispositivo: se mostrará el texto pero no se escuchará" : "";
      });
    }
  }

  if (polyBtn) {
    polyBtn.addEventListener("click", () => {
      if (!hasActiveSession()) return;
      const shouldResume = stopForModeChange();
      S.poly = !S.poly;
      if (S.poly) { S.vocab = false; clearVocabArtifacts(); }
      applyPolyUI();
      applyVocabUI();
      renderPhrase();
      saveProgress();
      showToast(S.poly ? "🌍 Modo Políglota activado" : "Modo Políglota desactivado");
      resumeAfterModeChange(shouldResume);
    });
  }

  if (polyChain) {
    polyChain.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !hasActiveSession()) return;
      const lang = btn.dataset.poly;
      const has = S.polyChain.includes(lang);
      // Reconstruye la cadena en el orden canónico; exige al menos un idioma.
      let next = POLY_ORDER.filter(l => (l === lang ? !has : S.polyChain.includes(l)));
      if (!next.length) { showToast("Deja al menos un idioma"); return; }
      S.polyChain = next;
      const shouldResume = stopForModeChange();
      applyPolyUI();
      renderPhrase();
      saveProgress();
      resumeAfterModeChange(shouldResume);
    });
  }

  if (window.AudioEngine && window.AudioEngine.setOnChainStep) {
    window.AudioEngine.setOnChainStep(setPolyActiveLine);
  }

  // ---------- Ruta A1–B2 / MCER ----------
  const vocabBtn = document.getElementById("vocab-btn");
  const vocabLevelRow = document.getElementById("vocab-level-row");
  const vocabLevels = document.getElementById("vocab-levels");
  const vocabEj = document.getElementById("vocab-ej");
  const VOCAB_ALL = Array.isArray(window.VOCAB) ? window.VOCAB : [];
  const levelHasContent = lvl => VOCAB_ALL.some(v => v.nivel === lvl);

  function buildVocabList() {
    let src = VOCAB_ALL.filter(v => S.vocabLevels.includes(v.nivel));
    if (!src.length) src = VOCAB_ALL.slice();
    // Ruta funcional: conservar el orden curado por nivel, función y secuencia.
    // Evita que A2/B1/B2 se sientan como frases sueltas sin progresión.
    const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4 };
    src = src.slice().sort((a, b) =>
      (levelOrder[a.nivel] || 99) - (levelOrder[b.nivel] || 99) ||
      String(a.funcion || "").localeCompare(String(b.funcion || ""), "es") ||
      (Number(a.orden || 0) - Number(b.orden || 0))
    );
    S.vocabList = src;
    S.vocabPointer = 0;
  }

  function vocabPhraseFields(it) {
    const source = (it && it.ej && it.ej.en && it.ej.es) ? it.ej : (it || {});
    return {
      en: source.en || it.en || "",
      es: source.es || it.es || "",
      fr: source.fr || it.fr || "",
      pt: source.pt || it.pt || ""
    };
  }

  function currentVocabEntry() {
    const it = S.vocabList[S.vocabPointer] || S.vocabList[0] || VOCAB_ALL[0];
    if (!it) return { topicId: "vocab", topicTitulo: "Ruta funcional", es: "", en: "", tipo: "funcion" };
    const funcion = it.funcion || "Ruta funcional";
    const frases = vocabPhraseFields(it);
    return {
      topicId: `vocab-${it.nivel}-${funcion}`,
      topicTitulo: `${it.nivel} · ${funcion}`,
      nivel: it.nivel,
      funcion,
      sentido: it.sentido || "",
      es: frases.es,
      en: frases.en,
      fr: frases.fr,
      pt: frases.pt,
      tipo: it.tipo || "funcion"
    };
  }

  function vocabTargetText(item) {
    const lang = S.targetLang;
    if (lang === "fr" || lang === "pt") return item[lang] || "";
    return "";
  }

  // Ruta funcional: solo frases completas.
  // Orden visual y de audio: inglés → español → idioma elegido, si aplica.
  function renderVocabCard(item) {
    enText.textContent = item.en || "";
    enText.lang = "en";
    esText.textContent = item.es || "";
    esText.lang = "es";
    const target = vocabTargetText(item);
    if (vocabEj) {
      vocabEj.textContent = target;
      vocabEj.hidden = !target;
      if (target) vocabEj.lang = S.targetLang;
      else vocabEj.removeAttribute("lang");
    }
  }

  // Ya no hay ventana de recuerdo con palabra suelta: se conservan las frases visibles.
  function concealVocab() {
    // Intencionalmente vacío.
  }

  function revealVocab(item) {
    renderVocabCard(item);
  }

  function applyVocabUI() {
    if (!vocabBtn) return;
    vocabBtn.classList.toggle("active", S.vocab);
    vocabBtn.setAttribute("aria-pressed", S.vocab ? "true" : "false");
    if (vocabLevelRow) vocabLevelRow.hidden = !S.vocab;
    // Ruta A1–B2 y Políglota son mutuamente excluyentes.
    if (polyBtn) polyBtn.style.display = S.vocab ? "none" : "";
    if (modeToggleEl) modeToggleEl.style.display = S.vocab ? "none" : (S.poly ? "none" : "");
    if (S.vocab) {
      clearPolyArtifacts();
      enText.style.display = "";
      dashSep.style.display = "";
      esText.style.display = "";
    } else {
      clearVocabArtifacts();
      if (!S.poly) clearPolyArtifacts();
      applyModeUI();
    }
    if (vocabLevels) {
      vocabLevels.querySelectorAll("button").forEach(b => {
        const lvl = b.dataset.level;
        const on = S.vocabLevels.includes(lvl);
        const vacio = !levelHasContent(lvl);
        b.classList.toggle("active", on && !vacio);
        b.classList.toggle("no-voice", vacio);
        b.setAttribute("aria-pressed", on && !vacio ? "true" : "false");
        b.title = vacio ? "Nivel aún sin contenido en esta versión" : "";
      });
    }
  }

  if (vocabBtn) {
    vocabBtn.addEventListener("click", () => {
      if (!hasActiveSession()) return;
      const shouldResume = stopForModeChange();
      S.vocab = !S.vocab;
      if (S.vocab) { S.poly = false; clearPolyArtifacts(); applyPolyUI(); buildVocabList(); }
      else { clearVocabArtifacts(); }
      applyVocabUI();
      renderPhrase();
      saveProgress();
      showToast(S.vocab ? "🧭 Ruta A1–B2 activada" : "Ruta A1–B2 desactivada");
      resumeAfterModeChange(shouldResume);
    });
  }

  if (vocabLevels) {
    vocabLevels.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !hasActiveSession()) return;
      const lvl = btn.dataset.level;
      if (!levelHasContent(lvl)) { showToast("Nivel aún sin contenido"); return; }
      const has = S.vocabLevels.includes(lvl);
      let next = ["A1", "A2", "B1", "B2"].filter(l => (l === lvl ? !has : S.vocabLevels.includes(l)));
      next = next.filter(levelHasContent);
      if (!next.length) { showToast("Deja al menos un nivel"); return; }
      S.vocabLevels = next;
      const shouldResume = stopForModeChange();
      buildVocabList();
      applyVocabUI();
      renderPhrase();
      saveProgress();
      resumeAfterModeChange(shouldResume);
    });
  }

  // ---------- velocidad ----------
  function nearestRateIndex(value) {
    let best = 0;
    let diff = Infinity;
    RATES.forEach((r, i) => {
      const d = Math.abs(Number(value) - r);
      if (d < diff) { diff = d; best = i; }
    });
    return best;
  }

  function applyRateUI() {
    speedRange.min = "0";
    speedRange.max = String(RATES.length - 1);
    speedRange.step = "1";
    const idx = nearestRateIndex(S.rate || 1);
    S.rate = RATES[idx];
    speedRange.value = String(idx);
    speedVal.textContent = formatRateLabel(S.rate);
    window.AudioEngine.setRate(S.rate);
  }
  speedRange.addEventListener("input", (e) => {
    if (!hasActiveSession()) return;
    const idx = Math.max(0, Math.min(RATES.length - 1, parseInt(e.target.value, 10) || 0));
    S.rate = RATES[idx];
    speedVal.textContent = formatRateLabel(S.rate);
    window.AudioEngine.setRate(S.rate);
    scheduleSaveProgress();
  });

  // ---------- temporizador de sesión ----------
  function updateSessionStatus() {
    if (!hasActiveSession()) { sessionStatus.textContent = ""; return; }
    if (!S.sessionStartTs) return;
    if (!S.paceMinutes) { sessionStatus.textContent = ""; return; }
    const elapsedMin = (Date.now() - S.sessionStartTs) / 60000;
    const remaining = S.paceMinutes - elapsedMin;
    if (remaining <= 0) {
      if (S.playing) pause();
      sessionStatus.textContent = `Sesión completa · ${S.sessionStats.listened || 0} frases`;
      if (!S.summaryShown) showSummaryPanel();
    } else {
      sessionStatus.textContent = `Quedan ${Math.ceil(remaining)} min`;
    }
  }

  // ---------- ajustes rápidos ----------
  function openSettings() {
    settingsRep.value = String(S.repCount || 2);
    settingsTopicRep.value = String(S.topicRepeatCount || 1);
    settingsPace.value = String(S.paceMinutes || 0);
    settingsNote.textContent = "Los cambios se guardan solo en este dispositivo.";
    updateVoiceStatusMessage(true);
    settingsPanel.classList.add("show");
    settingsPanel.setAttribute("aria-hidden", "false");
  }

  function closeSettings() {
    settingsPanel.classList.remove("show");
    settingsPanel.setAttribute("aria-hidden", "true");
  }

  function closeSummaryPanel() {
    summaryPanel.classList.remove("show");
    summaryPanel.setAttribute("aria-hidden", "true");
  }

  function showSummaryPanel() {
    S.summaryShown = true;
    const listened = S.sessionStats.listened || 0;
    const topics = countKeys(S.sessionStats.topics);
    const marks = S.sessionStats.marks || 0;
    summaryCopy.textContent = listened ? "Cerraste una práctica breve. Puedes seguir, revisar tu progreso o volver luego." : "Terminó el tiempo. Puedes seguir practicando cuando quieras.";
    summaryListened.textContent = `${listened} frase${listened === 1 ? "" : "s"}`;
    summaryTopics.textContent = `${topics} tema${topics === 1 ? "" : "s"}`;
    summaryMarks.textContent = `${marks} marca${marks === 1 ? "" : "s"}`;
    summaryPanel.classList.add("show");
    summaryPanel.setAttribute("aria-hidden", "false");
  }

  function persistCurrentProfileSettings() {
    if (!S.profile) return;
    S.profile.repCount = S.repCount;
    S.profile.topicRepeatCount = S.topicRepeatCount;
    S.profile.paceMinutes = S.paceMinutes;
    window.Storage.saveProfile(S.profile);
  }

  settingsBtn.addEventListener("click", openSettings);
  settingsCloseBtn.addEventListener("click", closeSettings);
  settingsPanel.addEventListener("click", (e) => {
    if (e.target === settingsPanel) closeSettings();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && settingsPanel.classList.contains("show")) closeSettings();
  });

  settingsApplyBtn.addEventListener("click", () => {
    S.repCount = parseInt(settingsRep.value, 10) || 2;
    S.topicRepeatCount = parseInt(settingsTopicRep.value, 10) || 1;
    S.paceMinutes = parseInt(settingsPace.value, 10) || 0;
    S.repCurrent = 0;
    S.sessionStartTs = Date.now();
    persistCurrentProfileSettings();
    renderPhrase();
    updateSessionStatus();
    settingsNote.textContent = "Cambios aplicados.";
    settingsApplyBtn.textContent = "✓ Aplicado";
    showToast("Cambios aplicados");
    setTimeout(() => { settingsApplyBtn.textContent = "Aplicar ajustes"; }, 1400);
  });

  settingsDashboardBtn.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    closeSettings();
    pause();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    showDashboardScreen(profile, window.Storage.getProgress());
  });

  function updateVoiceStatusMessage(showOk = false) {
    if (!voiceStatus) return;
    const status = window.AudioEngine && window.AudioEngine.getVoiceStatus ? window.AudioEngine.getVoiceStatus() : { supported: false };
    voiceStatus.classList.remove("ok", "warn", "error");
    if (!status.supported) {
      voiceStatus.textContent = "Voz no disponible: este navegador no admite síntesis de voz.";
      voiceStatus.classList.add("error");
      return;
    }
    if (!status.totalVoices) {
      voiceStatus.textContent = "Cargando voces del navegador. Si no suena, espera unos segundos o recarga.";
      voiceStatus.classList.add("warn");
      return;
    }
    const voiceKey = S.targetLang === "fr" ? "frenchVoices" : (S.targetLang === "pt" ? "portugueseVoices" : "englishVoices");
    const langLabel = S.targetLang === "fr" ? "FR" : (S.targetLang === "pt" ? "PT" : "EN");
    const voiceCount = status[voiceKey] || 0;
    if (!voiceCount) {
      voiceStatus.textContent = `No se detectaron voces de ${langLabel}. La app intentará usar la voz predeterminada del navegador.`;
      voiceStatus.classList.add("warn");
      return;
    }
    if (S.mode === "bilingue" && !status.spanishVoices) {
      voiceStatus.textContent = `No se detectaron voces de español. ${langLabel} funcionará; ES dependerá de la voz predeterminada.`;
      voiceStatus.classList.add("warn");
      return;
    }
    const availableCount = getFlatEntriesForLang(S.targetLang).length;
    if (S.targetLang !== "en" && availableCount < FLAT_PHRASES.length) {
      voiceStatus.textContent = `Modo ${langLabel}: ${availableCount} frases disponibles por ahora. Se evitará pronunciar inglés con voz ${langLabel}.`;
      voiceStatus.classList.add("warn");
      return;
    }
    voiceStatus.textContent = showOk ? `Voces listas: ${voiceCount} ${langLabel} · ${status.spanishVoices} ES.` : "";
    if (showOk) voiceStatus.classList.add("ok");
  }

  summaryContinueBtn.addEventListener("click", () => {
    closeSummaryPanel();
    S.summaryShown = false;
    S.sessionStartTs = Date.now();
    updateSessionStatus();
  });

  summaryDashboardBtn.addEventListener("click", () => {
    const profile = window.Storage.getProfile();
    closeSummaryPanel();
    pause();
    if (!profile || !profile.nombre) { goToLoginScreen(false); return; }
    showDashboardScreen(profile, window.Storage.getProgress());
  });

  settingsResetProgressBtn.addEventListener("click", () => {
    if (!S.profile) return;
    pause();
    persistCurrentProfileSettings();
    window.Storage.clearProgress();
    const profile = window.Storage.getProfile() || S.profile;
    closeSettings();
    startSession(profile, null);
    showToast("Progreso reiniciado");
  });

  settingsResetAppBtn.addEventListener("click", () => {
    closeSettings();
    goToLoginScreen(true);
  });

  // ---------- salir ----------
  // Vuelve a la pantalla inicial de identificación sin recargar ni sacar de la PWA.
  logoutBtn.addEventListener("click", () => {
    goToLoginScreen(true);
  });

  // ---------- progreso persistente ----------
  let saveTimer = null;

  function scheduleSaveProgress() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveProgress, 350);
  }

  function saveProgress() {
    if (!hasActiveSession()) return;
    const topic = currentTopic();
    const entry = currentEntry();
    if (!S.profile || (!topic && !entry)) return;
    window.Storage.saveProgress({
      topicId: S.smartMode ? (entry.topicId || "") : (topic ? topic.id : ""),
      phraseIndex: S.phraseIndex,
      mode: S.mode,
      poly: S.poly,
      polyChain: S.polyChain,
      vocab: S.vocab,
      vocabLevels: S.vocabLevels,
      rate: S.rate,
      repCount: S.repCount,
      topicRepeatCount: S.topicRepeatCount,
      topicPassCount: S.topicPassCount,
      paceMinutes: S.paceMinutes,
      topicPointers: S.topicPointers,
      mixMode: S.mixMode,
      mixOrder: S.mixMode ? S.mixOrder : undefined,
      mixPointer: S.mixPointer,
      smartMode: S.smartMode,
      smartQueue: S.smartMode ? S.smartQueue : undefined,
      smartPointer: S.smartPointer,
      savedAt: Date.now()
    });
  }

  window.addEventListener("pagehide", saveProgress);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveProgress();
    } else if (document.visibilityState === "visible" && S.playing) {
      // El SO libera el wake lock al ocultar la app; al volver, si
      // seguíamos en modo reproducción, lo recuperamos.
      requestWakeLock();
    }
  });

  // ---------- Media Session ----------
  function updateMediaSession() {
    if (!hasActiveSession()) return;
    if (!("mediaSession" in navigator)) return;
    try {
      const entry = currentEntry();
      navigator.mediaSession.metadata = new MediaMetadata({
        title: entry[S.targetLang] || entry.en,
        artist: entry.es,
        album: `Easy Parrot · ${entry.topicTitulo}`
      });
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("previoustrack", () => prevBtn.click());
      navigator.mediaSession.setActionHandler("nexttrack", () => nextBtn.click());
    } catch (e) { /* no soportado en este navegador */ }
  }

  // ---------- instalar PWA ----------
  // El aviso nativo del navegador no siempre aparece en la primera visita
  // por heurísticas internas de Chrome — este botón da una vía explícita.
  let deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installBtn.classList.add("show");
  });
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      installBtn.title = "Si ya aparece como instalada, desinstala el acceso anterior y vuelve a instalar";
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.classList.remove("show");
  });
  window.addEventListener("appinstalled", () => {
    installBtn.classList.remove("show");
  });

  if (window.AudioEngine && window.AudioEngine.setOnVoicesChanged) {
    window.AudioEngine.setOnVoicesChanged(() => updateVoiceStatusMessage(settingsPanel.classList.contains("show")));
  }

  // ---------- arranque de la app ----------
  function enterAppAfterSplash() {
    const profile = window.Storage.getProfile();
    if (!profile || !profile.nombre) {
      window.Storage.clearProgress();
      setActiveScreen(screenOnboarding);
      tickClock();
      updateVoiceStatusMessage(false);
      return;
    }
    const progress = window.Storage.getProgress();
    showDashboardScreen(profile, progress);
  }

  function init() {
    updateAboutPulse();
    setActiveScreen(screenSplash || screenOnboarding);
    window.setTimeout(enterAppAfterSplash, SPLASH_MS);
  }
  document.addEventListener("DOMContentLoaded", init);

  // ---------- service worker + aviso de actualización ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              updateToast.classList.add("show");
            }
          });
        });
      }).catch(() => {});

      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    });
  }
  updateReloadBtn.addEventListener("click", () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg && reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      else window.location.reload();
    });
  });
})();

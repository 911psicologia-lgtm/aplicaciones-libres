
/* storage.js v2.4 — Multi-usuario: cada jugador tiene su propio progreso */
'use strict';

const STORAGE = (() => {
  /* ── Usuario activo ─────────────────────────────────────────────────── */
  let _u = 'guest'; // prefijo sanitizado; se establece con setUser()

  /* ── Claves GLOBALES (compartidas entre todos los jugadores) ─────────── */
  const RANK_KEY = 'saus_rank_v23';   // ranking global: intencionalmente compartido
  const PREF_KEY = 'saus_prefs_v23';  // preferencias de audio: del dispositivo

  /* ── Claves DINÁMICAS (por jugador) ──────────────────────────────────── */
  const _k = {
    save:   () => `saus_save_v23_u_${_u}`,
    stars:  () => `saus_stars_v23_u_${_u}`,
    logros: () => `saus_logros_v23_u_${_u}`,
    stats:  () => `saus_stats_v23_u_${_u}`,
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function get(k, d) {
    try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; }
    catch(e) { return d; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch(e) { return false; }
  }

  /* ── Definición de logros (constante, no depende del usuario) ─────────── */
  const LOGROS_DEF = [
    { id:'primer_paso',    emoji:'🌱', title:'¡Primer Paso!',        desc:'Completa el Nivel 1' },
    { id:'maestro_jardin', emoji:'🏅', title:'Maestro de Sausalito', desc:'Completa los 30 niveles' },
    { id:'estrella',       emoji:'⭐', title:'¡Tres Estrellas!',     desc:'Obtén 3 estrellas en un nivel' },
    { id:'sin_tostadora',  emoji:'🛡️', title:'Sin Tostadora',       desc:'Completa un nivel sin perder defensores' },
    { id:'combo_5',        emoji:'💥', title:'¡Combo x5!',           desc:'Consigue un combo de 5 o más' },
    { id:'exterminador',   emoji:'💀', title:'Exterminador',         desc:'Mata 50 zombies en una partida' },
    { id:'coleccionista',  emoji:'☀️', title:'Coleccionista Solar',  desc:'Recoge 100 soles en una partida' },
    { id:'invocador',      emoji:'👧', title:'¡La llamé!',           desc:'Invoca a Emilia por primera vez' },
    { id:'superpoder',     emoji:'🦸', title:'Super Papá',           desc:'Usa el poder de Super Papá' },
    { id:'completista',    emoji:'🏆', title:'¡Imbatible!',          desc:'Consigue 3 estrellas en todos los niveles' },
  ];

  function normalizeSave(s) {
    if (!s || typeof s !== 'object') return null;
    return { version:'2.5', savedAt: Date.now(), ...s };
  }

  /* ── API pública ─────────────────────────────────────────────────────── */
  return {

    /* Establece el usuario activo. Llamar ANTES de cualquier lectura/escritura
       de progreso. El nombre se sanitiza para ser clave de localStorage segura. */
    setUser(name) {
      _u = (name || 'guest').trim().slice(0, 20).replace(/\s+/g, '_') || 'guest';
    },

    getCurrentUser() { return _u; },

    /* ── Partida guardada ───────────────────────────────────────────────── */
    save(data)    { return set(_k.save(), normalizeSave(data)); },
    load()        { return get(_k.save(), null); },
    hasSave()     { return !!get(_k.save(), null); },
    deleteSave()  { try { localStorage.removeItem(_k.save()); } catch(e) {} },

    /* ── Ranking global ─────────────────────────────────────────────────── */
    getRanking() { return get(RANK_KEY, []); },
    addScore(name, score, level) {
      const list = this.getRanking();
      list.push({ name, score, level, date: new Date().toLocaleDateString('es-ES') });
      list.sort((a, b) => b.score - a.score);
      set(RANK_KEY, list.slice(0, 20));
    },

    /* ── Preferencias de audio (globales del dispositivo) ───────────────── */
    getPrefs()      { return get(PREF_KEY, { sound:true, music:true }); },
    setPref(k, v)   { const p = this.getPrefs(); p[k] = v; set(PREF_KEY, p); },

    /* ── Estrellas por nivel (por jugador) ──────────────────────────────── */
    getStars()           { return get(_k.stars(), {}); },
    getStarsForLevel(idx){ return this.getStars()[idx] || 0; },
    setStarsForLevel(idx, stars) {
      const s = this.getStars();
      if ((s[idx] || 0) < stars) { s[idx] = stars; set(_k.stars(), s); }
    },
    isCompleted(idx)  { return this.getStarsForLevel(idx) > 0; },
    getHighestUnlocked() {
      const s = this.getStars();
      const completed = Object.keys(s).filter(k => s[k] > 0).map(Number);
      return completed.length ? Math.max(...completed) + 1 : 0;
    },
    getBestScore(idx) {
      const lvl = idx + 1;
      const matches = this.getRanking().filter(e => e.level === lvl);
      return matches.length ? Math.max(...matches.map(e => e.score || 0)) : 0;
    },
    computeStars(score, levelIdx) {
      const a = 180 + levelIdx * 60;
      const b = 420 + levelIdx * 140;
      const c = 760 + levelIdx * 230;
      if (score >= c) return 3;
      if (score >= b) return 2;
      if (score >= a) return 1;
      return 0;
    },
    getTotalStars() {
      const s = this.getStars();
      return Object.values(s).reduce((a, b) => a + b, 0);
    },

    /* ── Logros (por jugador) ───────────────────────────────────────────── */
    getLogrosDef()     { return LOGROS_DEF; },
    getLogrosEarned()  { return get(_k.logros(), []); },
    isLogroEarned(id)  { return this.getLogrosEarned().includes(id); },
    earnLogro(id) {
      if (this.isLogroEarned(id)) return false;
      const list = this.getLogrosEarned();
      list.push(id);
      set(_k.logros(), list);
      return true;
    },

    /* ── Estadísticas (por jugador) ─────────────────────────────────────── */
    getStats() {
      return get(_k.stats(), { zombiesKilled:0, sunsCollected:0, gamesPlayed:0, levelsCompleted:0 });
    },
    addStat(key, amount = 1) {
      const s = this.getStats();
      s[key] = (s[key] || 0) + amount;
      set(_k.stats(), s);
    },

    /* ── Reset del usuario actual (no borra ranking ni prefs) ───────────── */
    reset() {
      [_k.save(), _k.stars(), _k.logros(), _k.stats()].forEach(k => {
        try { localStorage.removeItem(k); } catch(e) {}
      });
    },
  };
})();

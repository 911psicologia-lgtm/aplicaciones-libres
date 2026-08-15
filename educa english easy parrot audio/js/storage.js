/**
 * STORAGE — todo vive en localStorage del dispositivo.
 * No hay servidor ni cuenta: el perfil, progreso, marcas y estadísticas
 * son locales a este navegador.
 */
window.Storage = (() => {
  const KEY_PROFILE = "eia_profile_v1";
  const KEY_PROGRESS = "eia_progress_v1";
  const KEY_MARKS = "eia_marks_v1";
  const KEY_STATS = "eia_stats_v1";

  function safeParse(raw, fallback = null) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }

  function getDefaultMarks() {
    return { favorites: {}, difficult: {}, mastered: {} };
  }

  function getDefaultStats() {
    return { totalListens: 0, days: {}, practiced: {}, lastPracticedAt: null, lastTopic: null };
  }

  return {
    saveProfile(profile) {
      localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
    },
    getProfile() {
      return safeParse(localStorage.getItem(KEY_PROFILE));
    },
    saveProgress(progress) {
      localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
    },
    getProgress() {
      return safeParse(localStorage.getItem(KEY_PROGRESS));
    },
    clearProgress() {
      localStorage.removeItem(KEY_PROGRESS);
    },
    saveMarks(marks) {
      localStorage.setItem(KEY_MARKS, JSON.stringify(marks || getDefaultMarks()));
    },
    getMarks() {
      const marks = safeParse(localStorage.getItem(KEY_MARKS), getDefaultMarks());
      return {
        favorites: marks && marks.favorites ? marks.favorites : {},
        difficult: marks && marks.difficult ? marks.difficult : {},
        mastered: marks && marks.mastered ? marks.mastered : {}
      };
    },
    saveStats(stats) {
      localStorage.setItem(KEY_STATS, JSON.stringify(stats || getDefaultStats()));
    },
    getStats() {
      const stats = safeParse(localStorage.getItem(KEY_STATS), getDefaultStats());
      return {
        totalListens: Number(stats && stats.totalListens) || 0,
        days: stats && stats.days ? stats.days : {},
        practiced: stats && stats.practiced ? stats.practiced : {},
        lastPracticedAt: stats ? stats.lastPracticedAt : null,
        lastTopic: stats ? stats.lastTopic : null
      };
    },
    clearLearningData() {
      localStorage.removeItem(KEY_PROGRESS);
      localStorage.removeItem(KEY_MARKS);
      localStorage.removeItem(KEY_STATS);
    },
    clearAll() {
      localStorage.removeItem(KEY_PROFILE);
      localStorage.removeItem(KEY_PROGRESS);
      localStorage.removeItem(KEY_MARKS);
      localStorage.removeItem(KEY_STATS);
    }
  };
})();

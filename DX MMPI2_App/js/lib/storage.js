/* ============================================
   Storage: gestión de datos persistentes
   - Evaluador (configuración primera vez)
   - Casos (lista de casos guardados)
   - Estado actual (caso en curso)
   ============================================ */

const Storage = {
  KEYS: {
    EVALUATOR: 'mmpi2_evaluator',
    CASES: 'mmpi2_cases',
    CURRENT_CASE: 'mmpi2_current_case',
    SETUP_DONE: 'mmpi2_setup_done',
  },

  /* ---- Evaluador ---- */
  getEvaluator() {
    try {
      const data = localStorage.getItem(this.KEYS.EVALUATOR);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  setEvaluator(data) {
    localStorage.setItem(this.KEYS.EVALUATOR, JSON.stringify(data));
  },
  isSetupDone() {
    return localStorage.getItem(this.KEYS.SETUP_DONE) === 'true';
  },
  markSetupDone() {
    localStorage.setItem(this.KEYS.SETUP_DONE, 'true');
  },

  /* ---- Casos ---- */
  getAllCases() {
    try {
      const data = localStorage.getItem(this.KEYS.CASES);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  getCase(id) {
    const cases = this.getAllCases();
    return cases.find(c => c.id === id) || null;
  },
  saveCase(caseData) {
    const cases = this.getAllCases();
    const idx = cases.findIndex(c => c.id === caseData.id);
    if (idx >= 0) {
      cases[idx] = caseData;
    } else {
      cases.push(caseData);
    }
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
    return caseData;
  },
  deleteCase(id) {
    const cases = this.getAllCases();
    const filtered = cases.filter(c => c.id !== id);
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(filtered));
  },

  /* ---- Caso actual (en curso) ---- */
  getCurrentCase() {
    try {
      const data = localStorage.getItem(this.KEYS.CURRENT_CASE);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  setCurrentCase(caseData) {
    if (caseData) {
      localStorage.setItem(this.KEYS.CURRENT_CASE, JSON.stringify(caseData));
    } else {
      localStorage.removeItem(this.KEYS.CURRENT_CASE);
    }
  },

  /* ---- Export/Import ---- */
  exportAll() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      evaluator: this.getEvaluator(),
      cases: this.getAllCases(),
    };
  },
  importAll(data) {
    if (!data || !data.version) throw new Error('Formato de importación inválido');
    if (data.evaluator) this.setEvaluator(data.evaluator);
    if (data.cases && Array.isArray(data.cases)) {
      localStorage.setItem(this.KEYS.CASES, JSON.stringify(data.cases));
    }
  },
  exportCase(id) {
    const caseData = this.getCase(id);
    if (!caseData) return null;
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      type: 'single_case',
      evaluator: this.getEvaluator(),
      case: caseData,
    };
  },

  /* ---- Utils ---- */
  generateId() {
    return 'case_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
};

// Exponer globalmente
window.Storage = Storage;

/* ============================================
   Storage seguro · MMPI-2 App
   - Persistencia local
   - Saneamiento básico de importaciones
   - Firmas raster permitidas
   - Guardado diferido para reducir bloqueo del main thread
   ============================================ */

const Storage = {
  KEYS: {
    EVALUATOR: 'mmpi2_evaluator',
    CASES: 'mmpi2_cases',
    CURRENT_CASE: 'mmpi2_current_case',
    SETUP_DONE: 'mmpi2_setup_done',
  },
  _saveTimer: null,

  _safeString(v, max = 20000) {
    if (v == null) return '';
    return String(v).slice(0, max);
  },

  sanitizeSignatureDataURL(v) {
    if (!v || typeof v !== 'string') return '';
    if (v.length > 3_000_000) return '';
    return /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=\s]+$/i.test(v) ? v : '';
  },

  sanitizeEvaluator(data) {
    if (!data || typeof data !== 'object') return null;
    return {
      name: this._safeString(data.name, 200),
      email: this._safeString(data.email, 320),
      license: this._safeString(data.license, 120),
      registry: this._safeString(data.registry, 120),
      phone: this._safeString(data.phone, 80),
      address: this._safeString(data.address, 500),
      institution: this._safeString(data.institution, 300),
      signature: this.sanitizeSignatureDataURL(data.signature),
    };
  },

  validateResponses(responses) {
    if (responses == null) return [];
    if (!Array.isArray(responses)) throw new Error('El campo responses debe ser un arreglo');
    if (responses.length > 567) throw new Error('El caso contiene más de 567 respuestas');
    return responses.map(v => (v === 1 || v === 2 || v === null) ? v : null);
  },

  sanitizeCase(c) {
    if (!c || typeof c !== 'object') throw new Error('Caso inválido');
    const p = c.patient && typeof c.patient === 'object' ? c.patient : {};
    const sex = ['M', 'H'].includes(p.sex) ? p.sex : '';
    const country = ['US', 'ES'].includes(p.country) ? p.country : 'US';
    const protocolValidity = ['NO_EVALUADA','INTERPRETABLE','INTERPRETABLE_CON_CAUTELA','NO_INTERPRETABLE'].includes(p.protocolValidity)
      ? p.protocolValidity : 'NO_EVALUADA';
    const clean = { ...c };
    clean.id = this._safeString(c.id || this.generateId(), 120);
    clean.patient = {
      ...p,
      name: this._safeString(p.name, 300),
      document: this._safeString(p.document, 120),
      dob: this._safeString(p.dob, 20),
      sex,
      country,
      context: this._safeString(p.context, 80),
      applicationDate: this._safeString(p.applicationDate, 20),
      history: this._safeString(p.history, 30000),
      reason: this._safeString(p.reason, 15000),
      caseHistory: this._safeString(p.caseHistory, 50000),
      legalContext: this._safeString(p.legalContext, 30000),
      previousMMPI: this._safeString(p.previousMMPI, 10000),
      officialTScores: this._safeString(p.officialTScores, 20000),
      officialScoreSource: this._safeString(p.officialScoreSource, 500),
      protocolValidity,
    };
    if (c.responses != null) clean.responses = this.validateResponses(c.responses);
    return clean;
  },

  /* ---- Evaluador ---- */
  getEvaluator() {
    try {
      const data = localStorage.getItem(this.KEYS.EVALUATOR);
      return data ? this.sanitizeEvaluator(JSON.parse(data)) : null;
    } catch (e) { return null; }
  },
  setEvaluator(data) {
    const safe = this.sanitizeEvaluator(data);
    if (!safe) throw new Error('Datos del evaluador inválidos');
    localStorage.setItem(this.KEYS.EVALUATOR, JSON.stringify(safe));
  },
  isSetupDone() { return localStorage.getItem(this.KEYS.SETUP_DONE) === 'true'; },
  markSetupDone() { localStorage.setItem(this.KEYS.SETUP_DONE, 'true'); },

  /* ---- Casos ---- */
  getAllCases() {
    try {
      const data = localStorage.getItem(this.KEYS.CASES);
      const arr = data ? JSON.parse(data) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  },
  getCase(id) { return this.getAllCases().find(c => c.id === id) || null; },
  saveCase(caseData) {
    const safe = this.sanitizeCase(caseData);
    const cases = this.getAllCases();
    const idx = cases.findIndex(c => c.id === safe.id);
    if (idx >= 0) cases[idx] = safe; else cases.push(safe);
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
    return safe;
  },
  scheduleSaveCase(caseData, delay = 700) {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        const safe = this.saveCase(caseData);
        this.setCurrentCase(safe);
      } catch (e) { console.warn('No se pudo guardar progreso:', e); }
    }, delay);
  },
  flushScheduledCase(caseData) {
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    const safe = this.saveCase(caseData);
    this.setCurrentCase(safe);
    return safe;
  },
  deleteCase(id) {
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(this.getAllCases().filter(c => c.id !== id)));
  },

  /* ---- Caso actual ---- */
  getCurrentCase() {
    try {
      const data = localStorage.getItem(this.KEYS.CURRENT_CASE);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  setCurrentCase(caseData) {
    if (caseData) localStorage.setItem(this.KEYS.CURRENT_CASE, JSON.stringify(this.sanitizeCase(caseData)));
    else localStorage.removeItem(this.KEYS.CURRENT_CASE);
  },

  /* ---- Export/Import ---- */
  exportAll() {
    return { version: '1.1-safe', exportDate: new Date().toISOString(), evaluator: this.getEvaluator(), cases: this.getAllCases() };
  },
  importAll(data) {
    if (!data || typeof data !== 'object' || !data.version) throw new Error('Formato de importación inválido');
    if (data.evaluator) this.setEvaluator(data.evaluator);
    if (data.cases != null) {
      if (!Array.isArray(data.cases)) throw new Error('cases debe ser un arreglo');
      if (data.cases.length > 500) throw new Error('La importación excede el máximo de 500 casos');
      const safeCases = data.cases.map(c => this.sanitizeCase(c));
      localStorage.setItem(this.KEYS.CASES, JSON.stringify(safeCases));
    }
  },
  exportCase(id) {
    const caseData = this.getCase(id);
    if (!caseData) return null;
    return { version: '1.1-safe', exportDate: new Date().toISOString(), type: 'single_case', evaluator: this.getEvaluator(), case: caseData };
  },

  generateId() {
    return 'case_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  },
};

window.Storage = Storage;

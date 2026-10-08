/* ============================================
   Storage: gestión de datos persistentes (V3 · SECURITY)
   - Validación estricta al importar JSON
   - Debounce en saveCase (300ms) + flush()
   - Reemplazo de SVG por imágenes no embebibles
   - Límite de 1000 casos
   ============================================ */

const Storage = {
  KEYS: {
    EVALUATOR: 'mmpi2_evaluator',
    CASES: 'mmpi2_cases',
    CURRENT_CASE: 'mmpi2_current_case',
    SETUP_DONE: 'mmpi2_setup_done',
  },

  MAX_CASES: 1000,
  DEBOUNCE_MS: 300,

  // ---- Estado interno de debounce ----
  _saveTimer: null,
  _savePending: null,

  /* ---- Evaluador ---- */
  getEvaluator() {
    try {
      const data = localStorage.getItem(this.KEYS.EVALUATOR);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  setEvaluator(data) {
    // Validar la firma del evaluador (rechazar SVG)
    if (data && typeof data.signature === 'string') {
      if (!this._isAllowedSignatureImage(data.signature)) {
        console.warn('Storage.setEvaluator: firma rechazada (SVG o tipo no permitido)');
        data = Object.assign({}, data, { signature: null });
      }
    }
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

  /* ---- saveCase con DEBOUNCE ----
     La escritura se posterga 300ms; si llegan más llamadas, se reemplaza
     el pendiente. Llamar a flush() para forzar la escritura inmediata
     (p. ej. al cambiar de pantalla). */
  saveCase(caseData) {
    if (!caseData || !caseData.id) {
      throw new Error('Storage.saveCase: caseData.id es obligatorio');
    }
    this._savePending = caseData;
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._flushSave();
    }, this.DEBOUNCE_MS);
    return caseData;
  },

  /* ---- flush: fuerza la escritura pendiente inmediatamente ---- */
  flush() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    if (this._savePending) {
      this._flushSave();
    }
  },

  _flushSave() {
    const caseData = this._savePending;
    if (!caseData) return;
    this._saveTimer = null;
    this._savePending = null;
    const cases = this.getAllCases();
    // Límite máximo de casos
    if (cases.length >= this.MAX_CASES) {
      // Eliminar el más antiguo (sin contar el actual si ya existe)
      const idx = cases.findIndex(c => c.id === caseData.id);
      if (idx < 0) {
        // Eliminar el más antiguo (primer caso)
        cases.shift();
      }
    }
    const idx = cases.findIndex(c => c.id === caseData.id);
    if (idx >= 0) {
      cases[idx] = caseData;
    } else {
      cases.push(caseData);
    }
    try {
      localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
    } catch (e) {
      console.error('Storage._flushSave: error escribiendo localStorage', e);
      throw e;
    }
  },

  deleteCase(id) {
    // Cancelar cualquier save pendiente del caso que se borra
    if (this._savePending && this._savePending.id === id) {
      this._savePending = null;
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    }
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
    // flush antes de exportar
    this.flush();
    return {
      version: '3.0',
      exportDate: new Date().toISOString(),
      evaluator: this.getEvaluator(),
      cases: this.getAllCases(),
    };
  },

  /* ---- Validación de importación (fail-closed) ----
     Verifica que el JSON importado cumple con la estructura esperada.
     Devuelve { ok: true, data } en caso válido, o { ok: false, error } si no.
     Los mensajes de error son comprensibles para el usuario final. */
  validateImport(data) {
    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'El archivo no contiene un JSON válido (debe ser un objeto, no texto ni arreglo).' };
    }
    if (!data.version || typeof data.version !== 'string') {
      return { ok: false, error: 'El archivo no tiene el campo "version". Probablemente no es un export de MMPI-2 (debe comenzar con {"version": "3.0", ...}).' };
    }
    // Validar evaluator si está presente
    if (data.evaluator != null) {
      if (typeof data.evaluator !== 'object') {
        return { ok: false, error: 'El campo "evaluator" debe ser un objeto, no ' + typeof data.evaluator + '.' };
      }
      // Validar firma del evaluador (rechazar SVG)
      if (data.evaluator.signature && !this._isAllowedSignatureImage(data.evaluator.signature)) {
        return { ok: false, error: 'La firma del evaluador usa un formato no permitido (solo se aceptan imágenes PNG o JPEG, no SVG).' };
      }
    }
    // Validar arreglo de casos
    if (data.cases != null) {
      if (!Array.isArray(data.cases)) {
        return { ok: false, error: 'El campo "cases" debe ser una lista (arreglo), no ' + typeof data.cases + '.' };
      }
      if (data.cases.length > this.MAX_CASES) {
        return { ok: false, error: `El archivo contiene ${data.cases.length} casos, pero el máximo permitido es ${this.MAX_CASES}.` };
      }
      for (let i = 0; i < data.cases.length; i++) {
        const err = this._validateCase(data.cases[i], i);
        if (err) return { ok: false, error: err };
      }
    }
    // Si es un caso único (single_case)
    if (data.type === 'single_case' && data.case) {
      const err = this._validateCase(data.case, 0);
      if (err) return { ok: false, error: err };
    }
    return { ok: true, data };
  },

  _validateCase(c, idx) {
    const prefix = `Caso #${idx + 1}: `;
    if (!c || typeof c !== 'object') return prefix + 'no es un objeto válido (debe ser tipo objeto, no arreglo ni texto).';
    if (!c.id || typeof c.id !== 'string') return prefix + 'falta el campo "id" o no es texto.';
    // Validar patient si existe
    if (c.patient != null) {
      if (typeof c.patient !== 'object') return prefix + '"patient" debe ser un objeto, no ' + typeof c.patient + '.';
      const p = c.patient;
      if (p.sex != null && p.sex !== 'M' && p.sex !== 'H') {
        return prefix + `"patient.sex" debe ser "M" (Mujer) o "H" (Hombre). Se recibió: ${JSON.stringify(p.sex)}.`;
      }
      if (p.country != null && p.country !== 'ES' && p.country !== 'US' && p.country !== 'MX') {
        return prefix + `"patient.country" debe ser "ES", "US" o "MX". Se recibió: ${JSON.stringify(p.country)}.`;
      }
    }
    // Validar responses
    if (c.responses != null) {
      if (!Array.isArray(c.responses)) return prefix + '"responses" debe ser un arreglo (lista), no ' + typeof c.responses + '.';
      if (c.responses.length > 567) {
        return prefix + `"responses" tiene más de 567 elementos (${c.responses.length}). El MMPI-2 tiene exactamente 567 ítems.`;
      }
      for (let i = 0; i < c.responses.length; i++) {
        const r = c.responses[i];
        if (r !== null && r !== 1 && r !== 2) {
          return prefix + `"responses[${i}]" debe ser 1 (Verdadero), 2 (Falso) o null (sin respuesta). Se recibió: ${JSON.stringify(r)}.`;
        }
      }
    }
    return null;
  },

  /* ---- Verifica que un dataURL de firma sea PNG o JPEG (NO SVG) ---- */
  _isAllowedSignatureImage(dataURL) {
    if (typeof dataURL !== 'string') return false;
    if (!dataURL.startsWith('data:image/')) return false;
    // Rechazar SVG
    if (dataURL.startsWith('data:image/svg')) return false;
    // Aceptar PNG, JPEG
    if (dataURL.startsWith('data:image/png')) return true;
    if (dataURL.startsWith('data:image/jpeg')) return true;
    if (dataURL.startsWith('data:image/jpg')) return true;
    return false;
  },

  importAll(data) {
    const v = this.validateImport(data);
    if (!v.ok) throw new Error(v.error);
    const d = v.data;
    if (d.evaluator) this.setEvaluator(d.evaluator);
    if (d.cases && Array.isArray(d.cases)) {
      localStorage.setItem(this.KEYS.CASES, JSON.stringify(d.cases));
    }
  },
  exportCase(id) {
    this.flush();
    const caseData = this.getCase(id);
    if (!caseData) return null;
    return {
      version: '3.0',
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

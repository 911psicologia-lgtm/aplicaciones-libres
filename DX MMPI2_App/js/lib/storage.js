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
    TRASH: 'mmpi2_trash',
    LAST_BACKUP: 'mmpi2_last_backup',
    CASE_DRAFT: 'mmpi2_case_draft',
  },

  /* Último momento en que se escribió con éxito (para el indicador "Guardado") */
  lastSavedAt: null,

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
      this.lastSavedAt = new Date();
      document.dispatchEvent(new CustomEvent('storage:saved', { detail: { id: caseData.id, at: this.lastSavedAt } }));
    } catch (e) {
      console.error('Storage._flushSave: error escribiendo localStorage', e);
      // Conservar el pendiente para reintentar y avisar con lenguaje claro
      this._savePending = caseData;
      document.dispatchEvent(new CustomEvent('storage:error', { detail: { error: e } }));
      if (window.toast && window.friendlyError) {
        window.toast(window.friendlyError(e, 'guardar'), 'error', 8000);
      }
    }
  },

  /* ---- Borrado: los casos van a la PAPELERA (recuperables) ---- */
  deleteCase(id) {
    // Cancelar cualquier save pendiente del caso que se borra
    if (this._savePending && this._savePending.id === id) {
      this._savePending = null;
      if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    }
    this.flush();
    const cases = this.getAllCases();
    const victim = cases.find(c => c.id === id);
    const filtered = cases.filter(c => c.id !== id);
    if (victim) {
      const trash = this.getTrash();
      victim.deletedAt = new Date().toISOString();
      trash.push(victim);
      localStorage.setItem(this.KEYS.TRASH, JSON.stringify(trash));
    }
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(filtered));
    const cur = this.getCurrentCase();
    if (cur && cur.id === id) this.setCurrentCase(null);
    return victim || null;
  },

  deleteCases(ids) {
    let n = 0;
    for (const id of ids) { if (this.deleteCase(id)) n++; }
    return n;
  },

  getTrash() {
    try {
      const data = localStorage.getItem(this.KEYS.TRASH);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  restoreCase(id) {
    const trash = this.getTrash();
    const c = trash.find(x => x.id === id);
    if (!c) return null;
    delete c.deletedAt;
    const cases = this.getAllCases().filter(x => x.id !== id);
    cases.push(c);
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
    localStorage.setItem(this.KEYS.TRASH, JSON.stringify(trash.filter(x => x.id !== id)));
    return c;
  },

  purgeCase(id) {
    const trash = this.getTrash().filter(x => x.id !== id);
    localStorage.setItem(this.KEYS.TRASH, JSON.stringify(trash));
  },

  emptyTrash() {
    localStorage.setItem(this.KEYS.TRASH, '[]');
  },

  /* ---- Duplicar un caso (útil para versiones de prueba) ---- */
  duplicateCase(id) {
    this.flush();
    const src = this.getCase(id);
    if (!src) return null;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = this.generateId();
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    copy.patient = Object.assign({}, copy.patient, { name: (copy.patient?.name || 'Sin nombre') + ' (copia)' });
    const cases = this.getAllCases();
    cases.push(copy);
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(cases));
    return copy;
  },

  /* ---- Uso de almacenamiento (aprox., en KB) ---- */
  usageKB() {
    let bytes = 0;
    try {
      for (const k of Object.values(this.KEYS)) {
        const v = localStorage.getItem(k);
        if (v) bytes += v.length * 2;
      }
    } catch (e) {}
    return Math.round(bytes / 1024);
  },

  /* ---- Registro de copias de seguridad ---- */
  markBackup() {
    try { localStorage.setItem(this.KEYS.LAST_BACKUP, new Date().toISOString()); } catch (e) {}
  },
  getLastBackup() {
    try { return localStorage.getItem(this.KEYS.LAST_BACKUP); } catch (e) { return null; }
  },

  /* ---- Borrador del formulario de caso (autoguardado) ---- */
  saveDraft(d) { try { localStorage.setItem(this.KEYS.CASE_DRAFT, JSON.stringify(d)); } catch (e) {} },
  getDraft() { try { const d = localStorage.getItem(this.KEYS.CASE_DRAFT); return d ? JSON.parse(d) : null; } catch (e) { return null; } },
  clearDraft() { try { localStorage.removeItem(this.KEYS.CASE_DRAFT); } catch (e) {} },

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
    const cases = this.getAllCases();
    return {
      version: '4.0',
      type: 'full_backup',
      app: 'MMPI-2 App',
      exportDate: new Date().toISOString(),
      counts: { cases: cases.length, trash: this.getTrash().length },
      evaluator: this.getEvaluator(),
      cases,
      trash: this.getTrash(),
    };
  },

  /* ---- Fusionar una copia de seguridad SIN borrar lo existente ----
     Si un caso existe con el mismo id, se conserva el más reciente (updatedAt). */
  mergeAll(data) {
    const v = this.validateImport(data);
    if (!v.ok) throw new Error(v.error);
    const d = v.data;
    const cases = this.getAllCases();
    const byId = new Map(cases.map(c => [c.id, c]));
    let added = 0, updated = 0, kept = 0;
    for (const c of (d.cases || [])) {
      const ex = byId.get(c.id);
      if (!ex) { byId.set(c.id, c); added++; }
      else if ((c.updatedAt || '') > (ex.updatedAt || '')) { byId.set(c.id, c); updated++; }
      else kept++;
    }
    localStorage.setItem(this.KEYS.CASES, JSON.stringify(Array.from(byId.values())));
    if (d.evaluator && !this.getEvaluator()) this.setEvaluator(d.evaluator);
    return { added, updated, kept };
  },

  /* ---- Validación de importación (fail-closed) ----
     Verifica que el JSON importado cumple con la estructura esperada.
     Devuelve { ok: true, data } en caso válido, o { ok: false, error } si no. */
  validateImport(data) {
    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'El JSON no es un objeto válido.' };
    }
    if (!data.version || typeof data.version !== 'string') {
      return { ok: false, error: 'Falta el campo "version".' };
    }
    // Validar evaluator si está presente
    if (data.evaluator != null) {
      if (typeof data.evaluator !== 'object') {
        return { ok: false, error: '"evaluator" debe ser un objeto.' };
      }
      // Validar firma del evaluador (rechazar SVG)
      if (data.evaluator.signature && !this._isAllowedSignatureImage(data.evaluator.signature)) {
        return { ok: false, error: 'La firma del evaluador usa un formato no permitido (SVG rechazado).' };
      }
    }
    // Validar arreglo de casos
    if (data.cases != null) {
      if (!Array.isArray(data.cases)) {
        return { ok: false, error: '"cases" debe ser un arreglo.' };
      }
      if (data.cases.length > this.MAX_CASES) {
        return { ok: false, error: `Demasiados casos (máximo ${this.MAX_CASES}).` };
      }
      for (let i = 0; i < data.cases.length; i++) {
        const err = this._validateCase(data.cases[i], i);
        if (err) return { ok: false, error: err };
      }
    }
    if (data.trash != null) {
      if (!Array.isArray(data.trash)) return { ok: false, error: '"trash" debe ser un arreglo.' };
      for (let i = 0; i < data.trash.length; i++) {
        const err = this._validateCase(data.trash[i], i);
        if (err) return { ok: false, error: 'Papelera · ' + err };
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
    if (!c || typeof c !== 'object') return prefix + 'no es un objeto válido.';
    if (!c.id || typeof c.id !== 'string') return prefix + 'falta "id".';
    // Validar patient si existe
    if (c.patient != null) {
      if (typeof c.patient !== 'object') return prefix + '"patient" debe ser un objeto.';
      const p = c.patient;
      if (p.sex != null && p.sex !== 'M' && p.sex !== 'H') {
        return prefix + '"patient.sex" debe ser "M" o "H".';
      }
      if (p.country != null && p.country !== 'ES' && p.country !== 'US' && p.country !== 'MX') {
        return prefix + '"patient.country" debe ser "ES", "US" o "MX".';
      }
    }
    // Validar responses
    if (c.responses != null) {
      if (!Array.isArray(c.responses)) return prefix + '"responses" debe ser un arreglo.';
      if (c.responses.length > 567) {
        return prefix + `"responses" tiene más de 567 elementos (${c.responses.length}).`;
      }
      for (let i = 0; i < c.responses.length; i++) {
        const r = c.responses[i];
        if (r !== null && r !== undefined && r !== 1 && r !== 2) {
          return prefix + `"responses[${i}]" debe ser 1, 2 o null (valor: ${JSON.stringify(r)}).`;
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
    if (Array.isArray(d.trash)) {
      localStorage.setItem(this.KEYS.TRASH, JSON.stringify(d.trash));
    }
  },
  exportCase(id) {
    this.flush();
    const caseData = this.getCase(id);
    if (!caseData) return null;
    return {
      version: '4.0',
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

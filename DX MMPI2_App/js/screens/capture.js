/* ============================================
   Capture screen — captura de respuestas
   - Modo 1: Cargar Excel
   - Modo 2: Aplicar test (567 ítems)
   ============================================ */

const Capture = {
  // State
  _mode: 'test',         // 'excel' | 'test'
  _responses: [],        // length 567, values 1 (V) | 2 (F) | null
  _currentIdx: 0,        // índice actual en modo test (0..566)
  _totalItems: 567,
  _chart: null,          // not used here

  render() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.patient) {
      return `<div class="screen"><div class="screen-content"><div class="empty-state">
        <div class="empty-state-icon">⚠</div>
        <h2>No hay caso activo</h2>
        <p>Debe crear o abrir un caso antes de capturar respuestas.</p>
        <button class="btn btn-primary" id="cap-go-dash">Ir al panel</button>
      </div></div></div>`;
    }
    const p = cur.patient;

    // Restore previous responses if any (resume)
    this._responses = (cur.responses && cur.responses.length === this._totalItems)
      ? cur.responses.slice()
      : new Array(this._totalItems).fill(null);
    this._currentIdx = this._responses.findIndex(r => r === null);
    if (this._currentIdx < 0) this._currentIdx = 0;

    return `
      <div class="screen">
        <div class="topbar">
          <div class="topbar-title">MMPI-2 · Captura — ${this._esc(p.name || 'paciente')} (${p.sex === 'M' ? 'Mujer' : 'Hombre'})</div>
          <div class="topbar-actions">
            <button class="btn btn-ghost btn-sm" id="cap-back">‹ Volver</button>
            <button class="hamburger-btn" id="ham-btn" aria-label="Abrir menú de navegación"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="capture-toolbar">
          <div class="capture-progress-wrap">
            <div class="capture-progress-top">
              <span id="cap-count" class="cap-count">0 / ${this._totalItems}</span>
              <span id="cap-pct" class="cap-pct">0 %</span>
              <span id="cap-remaining" class="cap-remaining"></span>
              <span id="cap-saved" class="save-indicator" aria-live="polite"></span>
            </div>
            <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${this._totalItems}" id="cap-progressbar"><div class="progress-bar-fill" id="cap-progress" style="width:0%"></div></div>
            <div class="progress-segments" id="cap-segments" aria-hidden="true"></div>
          </div>
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" id="mode-test">Aplicar test</button>
            <button class="btn btn-secondary btn-sm" id="mode-excel">Cargar Excel</button>
          </div>
        </div>

        <div class="screen-content">
          <div id="cap-content"></div>
        </div>
      </div>
    `;
  },

  mount() {
    if (!document.getElementById('cap-content')) {
      bindEvent('cap-go-dash', 'click', () => App.navigate('dashboard'));
      return;
    }
    this._sessionStart = Date.now();
    this._sessionAnswered = 0;
    this._answerTimes = [];
    this._lastAnswerAt = null;
    this._milestones = new Set();
    const doneNow = this._responses.filter(r => r !== null).length;
    [25, 50, 75, 100].forEach(m => { if (doneNow / this._totalItems * 100 >= m) this._milestones.add(m); });

    bindEvent('ham-btn', 'click', () => App.openMenu());
    bindEvent('cap-back', 'click', () => {
      this._persist();
      Storage.flush();
      App.navigate('case');
    });
    // Indicador de guardado
    this._onSaved = (e) => {
      const el = document.getElementById('cap-saved');
      if (el) el.textContent = '✓ Guardado ' + e.detail.at.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    this._onSaveError = () => {
      const el = document.getElementById('cap-saved');
      if (el) { el.textContent = '⚠ No se pudo guardar'; el.classList.add('text-danger'); }
    };
    document.addEventListener('storage:saved', this._onSaved);
    document.addEventListener('storage:error', this._onSaveError);
    // Atajos de teclado (modo test)
    this._onKey = (e) => {
      if (this._mode !== 'test') return;
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag) && e.target.type !== 'range') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'v' || k === '1') { e.preventDefault(); this._answer(1); }
      else if (k === 'f' || k === '2') { e.preventDefault(); this._answer(2); }
      else if (k === 'arrowright') { e.preventDefault(); this._goto(this._currentIdx + 1); }
      else if (k === 'arrowleft') { e.preventDefault(); this._goto(this._currentIdx - 1); }
      else if (k === 'backspace' || k === 'delete' || k === '0') { e.preventDefault(); this._answer(0); }
      else if (k === 'n') { e.preventDefault(); this._gotoNextUnanswered(); }
    };
    document.addEventListener('keydown', this._onKey);
    bindEvent('mode-test', 'click', () => this._setMode('test'));
    bindEvent('mode-excel', 'click', () => this._setMode('excel'));

    this._setMode(this._mode, true);
    this._updateProgress();
  },

  _setMode(mode, force) {
    if (mode === this._mode && !force) return;
    this._mode = mode;
    document.getElementById('mode-test').classList.toggle('btn-primary', mode === 'test');
    document.getElementById('mode-test').classList.toggle('btn-secondary', mode !== 'test');
    document.getElementById('mode-excel').classList.toggle('btn-primary', mode === 'excel');
    document.getElementById('mode-excel').classList.toggle('btn-secondary', mode !== 'excel');
    if (mode === 'test') this._renderTest();
    else this._renderExcel();
    this._updateProgress();
  },

  /* ---------- Modo Test ---------- */
  _renderTest() {
    const root = document.getElementById('cap-content');
    root.innerHTML = this._testHTML();
    this._bindTest();
    this._renderTestItem();
  },

  _testHTML() {
    return `
      <div class="card mb-16">
        <div class="card-body flex items-center gap-16">
          <button class="btn btn-secondary btn-sm" id="prev-item">‹ Anterior</button>
          <div style="flex:1;text-align:center">
            <div style="font-size:13px;color:var(--color-text-muted)">Ítem actual</div>
            <div id="cur-item-num" style="font-size:18px;font-weight:600;color:var(--color-primary-dark)">—</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="next-item">Siguiente ›</button>
        </div>
      </div>

      <div class="card mb-16">
        <div class="card-body">
          <div class="capture-item" style="padding:0">
            <div class="capture-item-num" id="cap-item-num">—</div>
            <div class="capture-item-text" id="cap-item-text">Cargando…</div>
          </div>
          <div class="capture-item-resp" style="margin-top:12px;justify-content:center">
            <button class="resp-btn v" data-resp="1">Verdadero (V)</button>
            <button class="resp-btn f" data-resp="2">Falso (F)</button>
            <button class="resp-btn" data-resp="0" title="Sin respuesta">— Limpiar</button>
          </div>
          <div class="kbd-hint">Teclado: <kbd>V</kbd> o <kbd>1</kbd> Verdadero · <kbd>F</kbd> o <kbd>2</kbd> Falso · <kbd>←</kbd> <kbd>→</kbd> navegar · <kbd>N</kbd> siguiente sin responder · <kbd>Supr</kbd> limpiar</div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div style="font-size:13px;color:var(--color-text-muted);margin-bottom:8px">Saltar a ítem</div>
          <input type="range" id="cap-slider" min="1" max="${this._totalItems}" value="${this._currentIdx + 1}" class="w-full">
          <div class="flex justify-between" style="margin-top:4px">
            <span class="text-muted" style="font-size:11px">1</span>
            <span class="text-muted" style="font-size:11px">${this._totalItems}</span>
          </div>
        </div>
        <div class="card-footer flex justify-between items-center" style="flex-wrap:wrap;gap:8px">
          <div class="flex gap-8" style="flex-wrap:wrap">
            <button class="btn btn-ghost" id="cap-reset">Reiniciar respuestas</button>
            <button class="btn btn-secondary btn-sm" id="next-unanswered">Ir al siguiente sin responder ›</button>
          </div>
          <button class="btn btn-success" id="cap-finish">Finalizar y procesar ✓</button>
        </div>
      </div>
    `;
  },

  unmount() {
    if (this._onKey) document.removeEventListener('keydown', this._onKey);
    if (this._onSaved) document.removeEventListener('storage:saved', this._onSaved);
    if (this._onSaveError) document.removeEventListener('storage:error', this._onSaveError);
    this._onKey = this._onSaved = this._onSaveError = null;
    this._persist();
    Storage.flush();
  },

  _answer(r) {
    const prev = this._responses[this._currentIdx];
    this._responses[this._currentIdx] = (r === 0) ? null : r;
    if (r !== 0 && prev == null) {
      const now = Date.now();
      if (this._lastAnswerAt) {
        const dt = now - this._lastAnswerAt;
        if (dt < 120000) { this._answerTimes.push(dt); if (this._answerTimes.length > 40) this._answerTimes.shift(); }
      }
      this._lastAnswerAt = now;
      this._sessionAnswered++;
      if (this._sessionAnswered > 0 && this._sessionAnswered % 150 === 0) {
        window.toast('Lleva 150 respuestas seguidas. Si el evaluado lo necesita, es buen momento para una pausa breve: el avance está guardado.', 'info', 7000);
      }
    }
    this._renderTestItem();
    this._updateProgress();
    this._persist();
    if (r !== 0) {
      setTimeout(() => {
        if (this._currentIdx < this._totalItems - 1) this._goto(this._currentIdx + 1);
      }, 120);
    }
  },

  _gotoNextUnanswered() {
    const n = this._totalItems;
    for (let k = 1; k <= n; k++) {
      const i = (this._currentIdx + k) % n;
      if (this._responses[i] === null) { this._goto(i); return; }
    }
    window.toast('Todos los ítems están respondidos', 'success');
  },

  _bindTest() {
    bindEvent('prev-item', 'click', () => this._goto(this._currentIdx - 1));
    bindEvent('next-item', 'click', () => this._goto(this._currentIdx + 1));
    bindEvent('next-unanswered', 'click', () => this._gotoNextUnanswered());
    document.querySelectorAll('[data-resp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = parseInt(btn.getAttribute('data-resp'), 10);
        this._answer(r);
      });
    });
    bindEvent('cap-slider', 'input', (e) => {
      const n = parseInt(e.target.value, 10);
      this._goto(n - 1);
    });
    bindEvent('cap-reset', 'click', async () => {
      const ok = await confirmDialog({ title: 'Reiniciar respuestas', message: '¿Borrar todas las respuestas capturadas de este caso? Esta acción no se puede deshacer.', okText: 'Borrar respuestas', danger: true });
      if (!ok) return;
      this._responses = new Array(this._totalItems).fill(null);
      this._currentIdx = 0;
      this._renderTestItem();
      this._updateProgress();
      this._persist();
    });
    bindEvent('cap-finish', 'click', () => this._finish());
  },

  _renderTestItem() {
    const items = window.__ITEMS__ || [];
    const idx = this._currentIdx;
    const item = items[idx];
    const elText = document.getElementById('cap-item-text');
    const elNum = document.getElementById('cap-item-num');
    const elCur = document.getElementById('cur-item-num');
    const elSlider = document.getElementById('cap-slider');
    if (!item) {
      if (elText) elText.textContent = '— fin del test —';
      return;
    }
    if (elNum) elNum.textContent = item.num;
    if (elText) elText.textContent = item.text;
    if (elCur) elCur.textContent = `Ítem ${item.num} de ${this._totalItems}${this._responses[idx] === null ? '' : ' · respondido'}`;
    if (elSlider) elSlider.value = idx + 1;

    const cur = this._responses[idx];
    document.querySelectorAll('[data-resp]').forEach(btn => {
      const v = parseInt(btn.getAttribute('data-resp'), 10);
      btn.classList.remove('active');
      if (cur === 1 && v === 1) btn.classList.add('active');
      else if (cur === 2 && v === 2) btn.classList.add('active');
    });
  },

  _goto(idx) {
    if (idx < 0) idx = 0;
    if (idx > this._totalItems - 1) idx = this._totalItems - 1;
    this._currentIdx = idx;
    this._renderTestItem();
  },

  /* ---------- Modo Excel ---------- */
  _renderExcel() {
    const root = document.getElementById('cap-content');
    root.innerHTML = `
      <div class="card mb-16">
        <div class="card-header"><h3>Cargar archivo Excel de respuestas</h3></div>
        <div class="card-body">
          <p class="text-muted mb-16">
            Suba un archivo <strong>.xlsx</strong> con dos columnas: <strong>A</strong> = número de ítem (1-567),
            <strong>B</strong> = respuesta (1 = Verdadero, 2 = Falso).
          </p>
          <input type="file" id="xlsx-input" accept=".xlsx,.xls" class="mb-16">
          <div id="xlsx-preview"></div>
        </div>
        <div class="card-footer flex justify-between items-center">
          <button class="btn btn-ghost" id="xlsx-clear">Limpiar</button>
          <button class="btn btn-success" id="xlsx-process" disabled>Procesar y generar informe ✓</button>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <details>
            <summary style="cursor:pointer;color:var(--color-primary);font-weight:600">Ver formato esperado del Excel</summary>
            <pre style="margin-top:12px;background:var(--color-bg);padding:12px;border-radius:6px;font-size:12px;overflow:auto">
Columna A  | Columna B
----------|-----------
1         | 2
2         | 1
3         | 1
4         | 2
...       | ...
567       | 1
            </pre>
            <p class="text-muted" style="margin-top:8px;font-size:12px">
              Las filas con número fuera del rango 1-567 se ignoran. La cabecera (si existe) se detecta y omite automáticamente.
            </p>
          </details>
        </div>
      </div>
    `;
    bindEvent('xlsx-input', 'change', (e) => this._onFile(e));
    bindEvent('xlsx-clear', 'click', () => {
      this._responses = new Array(this._totalItems).fill(null);
      this._renderExcel();
      this._updateProgress();
    });
    bindEvent('xlsx-process', 'click', () => this._finish());
  },

  _onFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.XLSX) { window.toast('SheetJS no está cargado', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: null });
        const parsed = new Array(this._totalItems).fill(null);
        let count = 0, skipped = 0;

        // Auto-detect column layout: find the column with item numbers and the column with responses
        // Strategy: scan ALL rows, find columns where:
        //  - item col has integers 1..567 (consistent sequence) and FEW values that are 1 or 2
        //  - resp col has ONLY values 1 or 2 (or empty)
        let itemCol = -1, respCol = -1;
        let bestItemScore = 0, bestRespScore = 0;
        
        // First pass: detect response column (highest count of 1s and 2s)
        for (let c = 0; c < 10; c++) {
          let respScore = 0;
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r || c >= r.length) continue;
            const v = r[c];
            if (v == null || v === '') continue;
            const respVal = typeof v === 'number' ? v : parseInt(v, 10);
            if ((respVal === 1 || respVal === 2) && (typeof v !== 'string' || /^[12]$/.test(v.trim()))) {
              respScore++;
            }
          }
          if (respScore > bestRespScore && respScore >= 100) {
            bestRespScore = respScore;
            respCol = c;
          }
        }

        // Second pass: detect item column (excluding respCol)
        for (let c = 0; c < 10; c++) {
          if (c === respCol) continue;  // Skip the response column
          let itemScore = 0;
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r || c >= r.length) continue;
            const v = r[c];
            if (v == null || v === '') continue;
            const numVal = typeof v === 'number' ? v : parseInt(v, 10);
            if (Number.isInteger(numVal) && numVal >= 1 && numVal <= 567 && (typeof v !== 'string' || /^\d+$/.test(v.trim()))) {
              itemScore++;
            }
          }
          if (itemScore > bestItemScore && itemScore >= 100) {
            bestItemScore = itemScore;
            itemCol = c;
          }
        }

        // Fallback: if no resp column found, use the next column after items
        if (respCol === -1) respCol = (itemCol + 1);
        if (itemCol === -1) itemCol = 0;

        console.log(`Excel parser: itemCol=${itemCol} (${bestItemScore} items), respCol=${respCol} (${bestRespScore} resp)`);

        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          if (!r) continue;
          const numRaw = r[itemCol];
          const respRaw = r[respCol];
          if (numRaw == null && respRaw == null) continue;
          
          const num = typeof numRaw === 'number' ? numRaw : parseInt(numRaw, 10);
          if (!Number.isInteger(num) || num < 1 || num > this._totalItems) {
            skipped++;
            continue;
          }
          
          let resp = respRaw;
          if (typeof resp === 'string') resp = parseInt(resp, 10);
          if (resp !== 1 && resp !== 2) {
            skipped++;
            continue;
          }
          parsed[num - 1] = resp;
          count++;
        }

        if (count === 0) {
          window.toast('No se encontraron respuestas en el archivo. Verifique que tenga una columna con el número de ítem (1–567) y otra con la respuesta (1 = V, 2 = F).', 'error', 9000);
          return;
        }
        this._responses = parsed;
        this._renderExcelPreview(count, skipped);
        this._updateProgress();
        this._persist();
      } catch (err) {
        console.error(err);
        window.toast(window.friendlyError(err, 'leer el archivo Excel'), 'error', 8000);
      }
    };
    reader.readAsArrayBuffer(file);
  },

  _renderExcelPreview(count, skipped) {
    const cont = document.getElementById('xlsx-preview');
    const sample = [];
    for (let i = 0; i < this._responses.length && sample.length < 10; i++) {
      if (this._responses[i] !== null) sample.push(`<tr><td>${i + 1}</td><td>${this._responses[i] === 1 ? 'V' : 'F'}</td></tr>`);
    }
    cont.innerHTML = `
      <div class="card" style="background:var(--color-bg)">
        <div class="card-body">
          <div style="font-weight:600;color:var(--color-success)">✓ ${count} respuestas cargadas</div>
          ${skipped > 0 ? `<div class="text-muted" style="font-size:12px;margin-top:4px">Se omitieron ${skipped} fila(s) que no eran respuestas válidas (cabeceras o celdas vacías).</div>` : ''}
          ${count < this._totalItems ? `<div style="font-size:12px;margin-top:6px;color:var(--color-warning)">Faltan ${this._totalItems - count} ítem(s): ${this._responses.map((r, i) => r === null ? i + 1 : null).filter(Boolean).slice(0, 30).join(', ')}${this._totalItems - count > 30 ? '…' : ''}. Puede completarlos en «Aplicar test».</div>` : ''}
          <table class="data-table" style="margin-top:12px;font-size:12px;max-width:240px">
            <thead><tr><th>Ítem</th><th>Resp.</th></tr></thead>
            <tbody>${sample.join('')}</tbody>
          </table>
        </div>
      </div>
    `;
    document.getElementById('xlsx-process').disabled = (count === 0);
  },

  /* ---------- Progress / persistence ---------- */
  _updateProgress() {
    const total = this._totalItems;
    const done = this._responses.filter(r => r !== null).length;
    const pct = Math.floor((done / total) * 100);
    const remaining = total - done;
    const elCount = document.getElementById('cap-count');
    const elBar = document.getElementById('cap-progress');
    const elPct = document.getElementById('cap-pct');
    const elRem = document.getElementById('cap-remaining');
    const elPB = document.getElementById('cap-progressbar');
    if (elCount) elCount.textContent = `${done} / ${total}`;
    if (elBar) elBar.style.width = `${(done / total) * 100}%`;
    if (elPct) elPct.textContent = `${pct} %`;
    if (elPB) elPB.setAttribute('aria-valuenow', String(done));
    if (elRem) {
      if (remaining === 0) elRem.textContent = '¡Completo! Puede procesar el informe';
      else {
        let eta = '';
        if (this._answerTimes && this._answerTimes.length >= 5) {
          const avg = this._answerTimes.reduce((a, b) => a + b, 0) / this._answerTimes.length;
          const mins = Math.max(1, Math.round(avg * remaining / 60000));
          eta = ` · ≈ ${mins} min restantes`;
        }
        elRem.textContent = `Faltan ${remaining}${eta}`;
      }
    }
    // Segmentos por bloques de 100 ítems (mapa de avance)
    const seg = document.getElementById('cap-segments');
    if (seg) {
      const blocks = [];
      for (let b = 0; b < total; b += 100) {
        const end = Math.min(total, b + 100);
        let n = 0;
        for (let i = b; i < end; i++) if (this._responses[i] !== null) n++;
        const p = Math.round(n / (end - b) * 100);
        blocks.push(`<div class="seg ${p === 100 ? 'full' : ''}" title="Ítems ${b + 1}–${end}: ${n}/${end - b}" data-seg="${b}"><div class="seg-fill" style="width:${p}%"></div><span>${b + 1}–${end}</span></div>`);
      }
      seg.innerHTML = blocks.join('');
      seg.querySelectorAll('[data-seg]').forEach(el => el.addEventListener('click', () => {
        if (this._mode !== 'test') return;
        const start = parseInt(el.getAttribute('data-seg'), 10);
        let target = start;
        for (let i = start; i < Math.min(total, start + 100); i++) { if (this._responses[i] === null) { target = i; break; } }
        this._goto(target);
      }));
    }
    // Hitos
    if (this._milestones) {
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !this._milestones.has(m)) {
          this._milestones.add(m);
          const msg = m === 100 ? '¡567 de 567! Ya puede finalizar y procesar el informe.' : `${m} % completado · ${remaining} ítems restantes. El avance se guarda automáticamente.`;
          window.toast(msg, 'success', 4000);
        }
      }
    }
  },

  _persist() {
    const cur = Storage.getCurrentCase();
    if (!cur) return;
    cur.responses = this._responses.slice();
    cur.captureMode = this._mode === 'excel' ? 'Excel' : 'Test interactivo';
    cur.updatedAt = new Date().toISOString();
    Storage.saveCase(cur);
    Storage.setCurrentCase(cur);
  },

  async _finish() {
    const cur = Storage.getCurrentCase();
    if (!cur || !cur.patient) { window.toast('No hay caso activo', 'error'); return; }
    const done = this._responses.filter(r => r !== null).length;
    if (done === 0) { window.toast('No hay respuestas para procesar', 'error'); return; }
    if (done < this._totalItems) {
      const missing = [];
      this._responses.forEach((r, i) => { if (r === null) missing.push(i + 1); });
      const list = missing.slice(0, 25).join(', ') + (missing.length > 25 ? '…' : '');
      const omit = this._totalItems - done;
      const warn = omit > 30 ? '\n\nAtención: con más de 30 omisiones el protocolo se considera NO interpretable.' : (omit > 10 ? '\n\nCon más de 10 omisiones el protocolo debe interpretarse con cautela.' : '');
      const ok = await confirmDialog({ title: 'Faltan respuestas', message: `Hay ${omit} ítem(s) sin responder: ${list}.${warn}\n\n¿Procesar de todos modos?`, okText: 'Procesar igualmente', cancelText: 'Volver y completar' });
      if (!ok) { if (this._mode === 'test') this._goto(missing[0] - 1); return; }
    }
    window.toast('Procesando resultados…', 'success');
    this._persist();
    try {
      // FAIL-CLOSED: country es obligatorio y viene del paciente
      const country = (cur.patient.country === 'ES' || cur.patient.country === 'US' || cur.patient.country === 'MX')
        ? cur.patient.country : 'ES';
      const results = await window.MMPI2.computeAll(this._responses, cur.patient.sex, country);
      // Anotar omisiones en results._meta para assessValidity()
      const omissions = this._responses.filter(r => r === null).length;
      results._meta = Object.assign(results._meta || {}, { omissions });
      cur.results = results;
      cur.narrative = window.MMPI2.buildNarrative(results, cur.patient.name, cur.patient.age, cur.patient.sex, country);
      cur.completedAt = new Date().toISOString();
      Storage.saveCase(cur);
      Storage.setCurrentCase(cur);
      Storage.flush();
      window.toast('Informe generado ✓', 'success');
      setTimeout(() => App.navigate('report'), 400);
    } catch (err) {
      console.error(err);
      window.toast(window.friendlyError(err, 'procesar los resultados'), 'error', 8000);
    }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Capture = Capture;

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
        <button class="btn btn-primary" onclick="App.navigate('dashboard')">Ir al panel</button>
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
            <button class="hamburger-btn" id="ham-btn" aria-label="Menú"><span></span><span></span><span></span></button>
          </div>
        </div>

        <div class="capture-toolbar">
          <div class="capture-progress">
            <span id="cap-count" style="font-size:13px;font-weight:600;color:var(--color-primary-dark);min-width:80px">0 / ${this._totalItems}</span>
            <div class="progress-bar"><div class="progress-bar-fill" id="cap-progress" style="width:0%"></div></div>
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
    document.getElementById('ham-btn').addEventListener('click', () => App.openMenu());
    document.getElementById('cap-back').addEventListener('click', () => {
      this._persist();
      App.navigate('case');
    });
    document.getElementById('mode-test').addEventListener('click', () => this._setMode('test'));
    document.getElementById('mode-excel').addEventListener('click', () => this._setMode('excel'));

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
        <div class="card-footer flex justify-between items-center">
          <button class="btn btn-ghost" id="cap-reset">Reiniciar respuestas</button>
          <button class="btn btn-success" id="cap-finish">Finalizar y procesar ✓</button>
        </div>
      </div>
    `;
  },

  _bindTest() {
    document.getElementById('prev-item').addEventListener('click', () => this._goto(this._currentIdx - 1));
    document.getElementById('next-item').addEventListener('click', () => this._goto(this._currentIdx + 1));
    document.querySelectorAll('[data-resp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = parseInt(btn.getAttribute('data-resp'), 10);
        this._responses[this._currentIdx] = (r === 0) ? null : r;
        this._renderTestItem();
        this._updateProgress();
        this._persist();
        if (r !== 0) {
          // Auto-advance
          setTimeout(() => {
            if (this._currentIdx < this._totalItems - 1) this._goto(this._currentIdx + 1);
          }, 120);
        }
      });
    });
    document.getElementById('cap-slider').addEventListener('input', (e) => {
      const n = parseInt(e.target.value, 10);
      this._goto(n - 1);
    });
    document.getElementById('cap-reset').addEventListener('click', () => {
      if (!confirm('¿Borrar todas las respuestas capturadas?')) return;
      this._responses = new Array(this._totalItems).fill(null);
      this._currentIdx = 0;
      this._renderTestItem();
      this._updateProgress();
      this._persist();
    });
    document.getElementById('cap-finish').addEventListener('click', () => this._finish());
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
    if (elCur) elCur.textContent = `Ítem ${item.num} de ${this._totalItems}`;
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
    document.getElementById('xlsx-input').addEventListener('change', (e) => this._onFile(e));
    document.getElementById('xlsx-clear').addEventListener('click', () => {
      this._responses = new Array(this._totalItems).fill(null);
      this._renderExcel();
      this._updateProgress();
    });
    document.getElementById('xlsx-process').addEventListener('click', () => this._finish());
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
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
        const parsed = new Array(this._totalItems).fill(null);
        let count = 0, skipped = 0, startRow = 0;

        // Detect header: if first row has non-numeric first cell, skip it
        if (rows.length > 0) {
          const first = rows[0];
          const firstCell = first && first[0];
          if (typeof firstCell === 'string' && isNaN(parseInt(firstCell, 10))) startRow = 1;
        }

        for (let i = startRow; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length < 2) continue;
          const num = parseInt(r[0], 10);
          let resp = r[1];
          if (typeof resp === 'string') resp = parseInt(resp, 10);
          if (!Number.isInteger(num) || num < 1 || num > this._totalItems) { skipped++; continue; }
          if (resp !== 1 && resp !== 2) { skipped++; continue; }
          parsed[num - 1] = resp;
          count++;
        }

        this._responses = parsed;
        this._renderExcelPreview(count, skipped);
        this._updateProgress();
        this._persist();
      } catch (err) {
        console.error(err);
        window.toast('No se pudo leer el archivo Excel: ' + err.message, 'error');
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
          ${skipped > 0 ? `<div class="text-muted" style="font-size:12px;margin-top:4px">Se omitieron ${skipped} fila(s) inválidas.</div>` : ''}
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
    const elCount = document.getElementById('cap-count');
    const elBar = document.getElementById('cap-progress');
    if (elCount) elCount.textContent = `${done} / ${total}`;
    if (elBar) elBar.style.width = `${(done / total) * 100}%`;
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
      if (!confirm(`Solo se han respondido ${done} de ${this._totalItems} ítems. ¿Procesar de todos modos?`)) return;
    }
    window.toast('Procesando resultados…', 'success');
    this._persist();
    try {
      const results = await window.MMPI2.computeAll(this._responses, cur.patient.sex);
      cur.results = results;
      cur.narrative = window.MMPI2.buildNarrative(results, cur.patient.name, cur.patient.age, cur.patient.sex);
      cur.completedAt = new Date().toISOString();
      Storage.saveCase(cur);
      Storage.setCurrentCase(cur);
      window.toast('Informe generado ✓', 'success');
      setTimeout(() => App.navigate('report'), 400);
    } catch (err) {
      console.error(err);
      window.toast('Error al procesar: ' + err.message, 'error');
    }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
};

window.Capture = Capture;

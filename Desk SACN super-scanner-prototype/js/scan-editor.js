const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function solveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row;
    }
    if (Math.abs(M[pivot][col]) < 1e-10) throw new Error('No se pudo calcular la perspectiva de esta selección.');
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const divisor = M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row][col];
      if (!factor) continue;
      for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j];
    }
  }
  return M.map(row => row[n]);
}

export function homographyFromRectToQuad(width, height, quad) {
  const dst = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: width - 1, y: height - 1 },
    { x: 0, y: height - 1 }
  ];
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const u = dst[i].x, v = dst[i].y;
    const x = quad[i].x, y = quad[i].y;
    A.push([u, v, 1, 0, 0, 0, -x * u, -x * v]); b.push(x);
    A.push([0, 0, 0, u, v, 1, -y * u, -y * v]); b.push(y);
  }
  return solveLinearSystem(A, b);
}

function otsuThreshold(data) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    const y = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    hist[y]++;
  }
  const total = data.length / 4;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0, wB = 0, maxVariance = 0, threshold = 160;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);
    if (variance > maxVariance) { maxVariance = variance; threshold = t; }
  }
  return threshold;
}

function applyFilter(canvas, mode) {
  if (mode === 'original') return;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const threshold = mode === 'bw' ? otsuThreshold(d) : 0;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    if (mode === 'gray' || mode === 'bw') {
      const y = r * 0.299 + g * 0.587 + b * 0.114;
      const v = mode === 'bw' ? (y >= threshold ? 255 : 0) : Math.max(0, Math.min(255, (y - 128) * 1.08 + 132));
      r = g = b = v;
    } else if (mode === 'document') {
      // Contraste moderado y fondo ligeramente más claro, conservando color.
      r = (r - 128) * 1.16 + 139;
      g = (g - 128) * 1.16 + 139;
      b = (b - 128) * 1.16 + 139;
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * 0.82;
      g = avg + (g - avg) * 0.82;
      b = avg + (b - avg) * 0.82;
    }
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(img, 0, 0);
}

function edgeEnergy(gray, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = row + x;
      const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      out[i] = Math.abs(gx) + Math.abs(gy);
    }
  }
  return out;
}

function smooth1D(values, radius = 3) {
  const out = new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(values.length - 1, i + radius); j++) { sum += values[j]; count++; }
    out[i] = sum / count;
  }
  return out;
}

function bestIndex(values, start, end) {
  let idx = start, best = -Infinity;
  for (let i = start; i <= end; i++) if (values[i] > best) { best = values[i]; idx = i; }
  return { idx, score: best };
}

export class ScanEditor {
  constructor({ canvas, magnifier, statusEl }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.magnifier = magnifier;
    this.magCtx = magnifier?.getContext('2d', { alpha: false });
    this.statusEl = statusEl;
    this.bitmap = null;
    this.file = null;
    this.points = [];
    this.filter = 'document';
    this.dragIndex = -1;
    this.imageRect = { x: 0, y: 0, w: 1, h: 1 };
    this.previewMax = 1050;
    this._bind();
  }

  _bind() {
    this.canvas.addEventListener('pointerdown', e => this._pointerDown(e));
    this.canvas.addEventListener('pointermove', e => this._pointerMove(e));
    this.canvas.addEventListener('pointerup', e => this._pointerUp(e));
    this.canvas.addEventListener('pointercancel', e => this._pointerUp(e));
  }

  async load(file) {
    this.file = file;
    this.bitmap?.close?.();
    this.bitmap = await createImageBitmap(file);
    await this.autoDetect();
    this.draw();
  }

  setStatus(text) { if (this.statusEl) this.statusEl.textContent = text; }

  setFilter(mode) { this.filter = mode; }

  async rotate90() {
    if (!this.bitmap) return;
    const c = document.createElement('canvas');
    c.width = this.bitmap.height;
    c.height = this.bitmap.width;
    const ctx = c.getContext('2d', { alpha: false });
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(this.bitmap, -this.bitmap.width / 2, -this.bitmap.height / 2);
    this.bitmap.close?.();
    this.bitmap = await createImageBitmap(c);
    await this.autoDetect();
    this.draw();
  }

  async autoDetect() {
    if (!this.bitmap) return;
    this.setStatus('Buscando bordes…');
    const maxSide = 420;
    const scale = Math.min(1, maxSide / Math.max(this.bitmap.width, this.bitmap.height));
    const w = Math.max(120, Math.round(this.bitmap.width * scale));
    const h = Math.max(120, Math.round(this.bitmap.height * scale));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { alpha: false, willReadFrequently: true });
    ctx.drawImage(this.bitmap, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const gray = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) gray[p] = Math.round(data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114);
    const edge = edgeEnergy(gray, w, h);
    const cols = new Float32Array(w), rows = new Float32Array(h);
    const xPad = Math.max(2, Math.round(w * .03)), yPad = Math.max(2, Math.round(h * .03));
    for (let y = yPad; y < h - yPad; y++) {
      for (let x = xPad; x < w - xPad; x++) {
        const e = edge[y * w + x];
        cols[x] += e; rows[y] += e;
      }
    }
    const sc = smooth1D(cols, Math.max(2, Math.round(w * .012)));
    const sr = smooth1D(rows, Math.max(2, Math.round(h * .012)));
    const left = bestIndex(sc, Math.round(w * .02), Math.round(w * .45));
    const right = bestIndex(sc, Math.round(w * .55), Math.round(w * .98));
    const top = bestIndex(sr, Math.round(h * .02), Math.round(h * .45));
    const bottom = bestIndex(sr, Math.round(h * .55), Math.round(h * .98));
    let x1 = left.idx / w, x2 = right.idx / w, y1 = top.idx / h, y2 = bottom.idx / h;
    const plausible = (x2 - x1) > .52 && (y2 - y1) > .52;
    if (plausible) { x1 -= .035; x2 += .035; y1 -= .035; y2 += .035; }
    else { x1 = .055; x2 = .945; y1 = .045; y2 = .955; }
    // Inset mínimo para que los tiradores siempre sean visibles.
    x1 = clamp(x1, .015, .42); x2 = clamp(x2, .58, .985); y1 = clamp(y1, .015, .42); y2 = clamp(y2, .58, .985);
    this.points = [
      { x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }
    ];
    const avg = (sc.reduce((a, v) => a + v, 0) / sc.length + sr.reduce((a, v) => a + v, 0) / sr.length) / 2 || 1;
    const strength = ((left.score + right.score + top.score + bottom.score) / 4) / avg;
    this.setStatus(plausible && strength > 1.25 ? 'Bordes sugeridos. Corrige las esquinas si hace falta.' : 'Ajuste aproximado. Mueve las cuatro esquinas sobre la hoja.');
    this.draw();
  }

  _resizeCanvas() {
    if (!this.bitmap) return;
    const maxW = Math.min(this.previewMax, Math.max(320, this.canvas.parentElement?.clientWidth || 900));
    const maxH = Math.min(720, Math.max(360, (window.innerHeight || 800) * .58));
    const ratio = Math.min(maxW / this.bitmap.width, maxH / this.bitmap.height);
    this.canvas.width = Math.max(1, Math.round(this.bitmap.width * ratio));
    this.canvas.height = Math.max(1, Math.round(this.bitmap.height * ratio));
    this.imageRect = { x: 0, y: 0, w: this.canvas.width, h: this.canvas.height };
  }

  draw() {
    if (!this.bitmap) return;
    this._resizeCanvas();
    const { width: cw, height: ch } = this.canvas;
    this.ctx.fillStyle = '#050608'; this.ctx.fillRect(0, 0, cw, ch);
    this.ctx.drawImage(this.bitmap, 0, 0, cw, ch);
    if (this.points.length !== 4) return;
    const pts = this.points.map(p => ({ x: p.x * cw, y: p.y * ch }));

    // Atenúa el exterior y vuelve a iluminar el polígono seleccionado.
    this.ctx.fillStyle = 'rgba(0,0,0,.46)'; this.ctx.fillRect(0, 0, cw, ch);
    this.ctx.save();
    this.ctx.beginPath(); this.ctx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => this.ctx.lineTo(p.x, p.y)); this.ctx.closePath(); this.ctx.clip();
    this.ctx.drawImage(this.bitmap, 0, 0, cw, ch); this.ctx.restore();

    this.ctx.lineWidth = Math.max(2, cw / 360);
    this.ctx.strokeStyle = '#fff'; this.ctx.beginPath(); this.ctx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => this.ctx.lineTo(p.x, p.y)); this.ctx.closePath(); this.ctx.stroke();
    pts.forEach((p, i) => {
      const r = Math.max(10, Math.min(16, cw / 34));
      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2); this.ctx.fillStyle = '#fff'; this.ctx.fill();
      this.ctx.lineWidth = 4; this.ctx.strokeStyle = i === this.dragIndex ? '#d72655' : 'rgba(20,23,31,.9)'; this.ctx.stroke();
    });
  }

  _eventPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * this.canvas.width / rect.width, y: (e.clientY - rect.top) * this.canvas.height / rect.height };
  }

  _pointerDown(e) {
    if (!this.bitmap || this.points.length !== 4) return;
    const p = this._eventPoint(e);
    const pts = this.points.map(q => ({ x: q.x * this.canvas.width, y: q.y * this.canvas.height }));
    let best = -1, bestD = Infinity;
    pts.forEach((q, i) => { const d = dist(p, q); if (d < bestD) { bestD = d; best = i; } });
    const hitRadius = Math.max(38, this.canvas.width * .055);
    if (bestD <= hitRadius) {
      this.dragIndex = best;
      this.canvas.setPointerCapture?.(e.pointerId);
      this._updateDraggedPoint(p);
      this._showMagnifier(true);
      e.preventDefault();
    }
  }

  _pointerMove(e) {
    if (this.dragIndex < 0) return;
    this._updateDraggedPoint(this._eventPoint(e));
    e.preventDefault();
  }

  _pointerUp(e) {
    if (this.dragIndex < 0) return;
    try { this.canvas.releasePointerCapture?.(e.pointerId); } catch {}
    this.dragIndex = -1;
    this._showMagnifier(false);
    this.draw();
  }

  _updateDraggedPoint(p) {
    let x = clamp(p.x / this.canvas.width, .005, .995);
    let y = clamp(p.y / this.canvas.height, .005, .995);
    // Mantiene cada esquina en su cuadrante para evitar un polígono cruzado.
    if (this.dragIndex === 0) { x = Math.min(x, .68); y = Math.min(y, .68); }
    if (this.dragIndex === 1) { x = Math.max(x, .32); y = Math.min(y, .68); }
    if (this.dragIndex === 2) { x = Math.max(x, .32); y = Math.max(y, .32); }
    if (this.dragIndex === 3) { x = Math.min(x, .68); y = Math.max(y, .32); }
    this.points[this.dragIndex] = { x, y };
    this.draw();
    this._drawMagnifier(x, y);
  }

  _showMagnifier(show) {
    if (!this.magnifier) return;
    this.magnifier.classList.toggle('hidden', !show);
  }

  _drawMagnifier(nx, ny) {
    if (!this.magnifier || !this.magCtx || !this.bitmap) return;
    const mw = this.magnifier.width, mh = this.magnifier.height;
    const srcSize = Math.max(38, Math.min(this.bitmap.width, this.bitmap.height) * .08);
    const sx = clamp(nx * this.bitmap.width - srcSize / 2, 0, Math.max(0, this.bitmap.width - srcSize));
    const sy = clamp(ny * this.bitmap.height - srcSize / 2, 0, Math.max(0, this.bitmap.height - srcSize));
    this.magCtx.fillStyle = '#fff'; this.magCtx.fillRect(0, 0, mw, mh);
    this.magCtx.drawImage(this.bitmap, sx, sy, srcSize, srcSize, 0, 0, mw, mh);
    this.magCtx.strokeStyle = '#d72655'; this.magCtx.lineWidth = 2;
    this.magCtx.beginPath(); this.magCtx.moveTo(mw / 2, 0); this.magCtx.lineTo(mw / 2, mh); this.magCtx.moveTo(0, mh / 2); this.magCtx.lineTo(mw, mh / 2); this.magCtx.stroke();
  }

  async process({ fileName } = {}) {
    if (!this.bitmap || this.points.length !== 4) throw new Error('No hay una página para ajustar.');
    this.setStatus('Corrigiendo perspectiva…');
    const srcW = this.bitmap.width, srcH = this.bitmap.height;
    const q = this.points.map(p => ({ x: p.x * (srcW - 1), y: p.y * (srcH - 1) }));
    const top = dist(q[0], q[1]), bottom = dist(q[3], q[2]);
    const left = dist(q[0], q[3]), right = dist(q[1], q[2]);
    let outW = Math.max(320, Math.round((top + bottom) / 2));
    let outH = Math.max(320, Math.round((left + right) / 2));
    const maxSide = 2000;
    const scale = Math.min(1, maxSide / Math.max(outW, outH));
    outW = Math.max(320, Math.round(outW * scale)); outH = Math.max(320, Math.round(outH * scale));

    const sourceCanvas = document.createElement('canvas'); sourceCanvas.width = srcW; sourceCanvas.height = srcH;
    const sourceCtx = sourceCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
    sourceCtx.drawImage(this.bitmap, 0, 0);
    const source = sourceCtx.getImageData(0, 0, srcW, srcH).data;
    const output = document.createElement('canvas'); output.width = outW; output.height = outH;
    const outCtx = output.getContext('2d', { alpha: false, willReadFrequently: true });
    const outImg = outCtx.createImageData(outW, outH); const od = outImg.data;
    const H = homographyFromRectToQuad(outW, outH, q);
    const [h11,h12,h13,h21,h22,h23,h31,h32] = H;
    let op = 0;
    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++, op += 4) {
        const den = h31 * x + h32 * y + 1;
        const sx = Math.max(0, Math.min(srcW - 1, Math.round((h11 * x + h12 * y + h13) / den)));
        const sy = Math.max(0, Math.min(srcH - 1, Math.round((h21 * x + h22 * y + h23) / den)));
        const sp = (sy * srcW + sx) * 4;
        od[op] = source[sp]; od[op + 1] = source[sp + 1]; od[op + 2] = source[sp + 2]; od[op + 3] = 255;
      }
      if (y % 180 === 0) await new Promise(r => setTimeout(r, 0));
    }
    outCtx.putImageData(outImg, 0, 0);
    applyFilter(output, this.filter);
    const blob = await new Promise((resolve, reject) => output.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo crear el escaneo ajustado.')), 'image/jpeg', .93));
    const name = fileName || `scan-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    this.setStatus('Página ajustada.');
    return new File([blob], name, { type: 'image/jpeg' });
  }

  destroy() { this.bitmap?.close?.(); this.bitmap = null; }
}

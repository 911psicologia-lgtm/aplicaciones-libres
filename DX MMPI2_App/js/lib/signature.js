/* ============================================
   SignaturePad — Firma digital en canvas
   Soporta mouse y touch. Exporta a PNG dataURL.
   ============================================ */

class SignaturePad {
  constructor(canvas, options = {}) {
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    if (!this.canvas) throw new Error('SignaturePad: canvas no encontrado');
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      penColor: '#1F3864',
      backgroundColor: '#FFFFFF',
      penWidth: 2.5,
      minWidth: 1.5,
      maxWidth: 3.5,
      velocityFilterWeight: 0.7,
    }, options);
    this.isDrawing = false;
    this.points = [];
    this.strokes = [];
    this.lastPoint = null;
    this.lastVelocity = 0;
    this.lastWidth = this.options.penWidth;
    this._isEmpty = true;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._resize = this._resize.bind(this);

    this._bindEvents();
    this._resize();
    this.clear();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this._onTouchEnd);
    window.addEventListener('resize', this._resize);
  }

  unbind() {
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.canvas.removeEventListener('touchstart', this._onTouchStart);
    this.canvas.removeEventListener('touchmove', this._onTouchMove);
    this.canvas.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.canvas.width = rect.width * ratio;
    this.canvas.height = rect.height * ratio;
    this.ctx.scale(ratio, ratio);
    this._redraw();
  }

  _redraw() {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const stroke of this.strokes) {
      this._drawStroke(stroke);
    }
  }

  _drawStroke(stroke) {
    if (!stroke || stroke.length < 2) return;
    this.ctx.strokeStyle = this.options.penColor;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    for (let i = 1; i < stroke.length; i++) {
      const p0 = stroke[i - 1];
      const p1 = stroke[i];
      this.ctx.beginPath();
      this.ctx.moveTo(p0.x, p0.y);
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.lineWidth = p1.width || this.options.penWidth;
      this.ctx.stroke();
    }
  }

  _getPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      time: Date.now(),
    };
  }

  _onMouseDown(e) {
    e.preventDefault();
    this.isDrawing = true;
    this.points = [this._getPoint(e)];
    this.strokes.push(this.points);
    this._isEmpty = false;
  }

  _onMouseMove(e) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const point = this._getPoint(e);
    this._addPoint(point);
  }

  _onMouseUp() {
    this.isDrawing = false;
    this.points = [];
  }

  _onTouchStart(e) {
    if (e.touches.length > 1) return;
    e.preventDefault();
    this.isDrawing = true;
    this.points = [this._getPoint(e)];
    this.strokes.push(this.points);
    this._isEmpty = false;
  }

  _onTouchMove(e) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const point = this._getPoint(e);
    this._addPoint(point);
  }

  _onTouchEnd() {
    this.isDrawing = false;
    this.points = [];
  }

  _addPoint(point) {
    const last = this.points[this.points.length - 1];
    if (!last) return;
    // velocity
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dt = Math.max(point.time - last.time, 1);
    const velocity = distance / dt;
    const vFilter = this.options.velocityFilterWeight;
    const finalVelocity = vFilter * velocity + (1 - vFilter) * this.lastVelocity;
    const widthRange = this.options.maxWidth - this.options.minWidth;
    const widthFactor = Math.max(0, 1 - finalVelocity);
    point.width = this.options.minWidth + widthRange * widthFactor;
    this.lastVelocity = finalVelocity;
    this.points.push(point);
    // Draw segment
    this._drawStroke([last, point]);
  }

  clear() {
    this.strokes = [];
    this.points = [];
    this._isEmpty = true;
    this.lastVelocity = 0;
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  isEmpty() {
    return this._isEmpty;
  }

  toDataURL(type = 'image/png', quality = 0.92) {
    if (this._isEmpty) return null;
    return this.canvas.toDataURL(type, quality);
  }

  fromDataURL(dataURL) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.clear();
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        this._isEmpty = false;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataURL;
    });
  }
}

window.SignaturePad = SignaturePad;

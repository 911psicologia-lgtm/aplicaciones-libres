export class CameraController {
  constructor({ video, canvas, statusEl }) {
    this.video = video;
    this.canvas = canvas;
    this.statusEl = statusEl;
    this.stream = null;
    this.facingMode = 'environment';
  }

  async open() {
    await this.stop();
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite acceso a cámara. Usa HTTPS y un navegador actualizado.');
    this.setStatus('Solicitando permiso de cámara…');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: this.facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.setStatus('La guía orienta: se capturará la foto completa y podrás ajustar después.');
      return true;
    } catch (error) {
      this.setStatus('No se pudo abrir la cámara');
      if (error?.name === 'NotAllowedError') throw new Error('Permiso de cámara bloqueado. Habilítalo en el navegador y vuelve a intentar.');
      if (error?.name === 'NotFoundError') throw new Error('No se encontró una cámara disponible en este dispositivo.');
      throw error;
    }
  }

  async stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
  }

  async switchCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    return this.open();
  }

  setStatus(text) { if (this.statusEl) this.statusEl.textContent = text; }

  async captureRaw() {
    const videoW = this.video.videoWidth;
    const videoH = this.video.videoHeight;
    if (!videoW || !videoH) throw new Error('La cámara todavía no está lista.');

    // v0.3: se conserva el encuadre COMPLETO de la cámara. La guía en pantalla
    // es solo una referencia; el recorte definitivo se hace después de disparar.
    // Así nunca se pierde texto por quedar fuera del rectángulo visual.
    const maxLongSide = 2600;
    const scale = Math.min(1, maxLongSide / Math.max(videoW, videoH));
    this.canvas.width = Math.max(1, Math.round(videoW * scale));
    this.canvas.height = Math.max(1, Math.round(videoH * scale));
    const ctx = this.canvas.getContext('2d', { alpha: false });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.video, 0, 0, videoW, videoH, 0, 0, this.canvas.width, this.canvas.height);

    const blob = await new Promise((resolve, reject) => this.canvas.toBlob(
      b => b ? resolve(b) : reject(new Error('No se pudo capturar la página.')),
      'image/jpeg',
      0.95
    ));
    const file = new File([blob], `scan-original-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`, { type: 'image/jpeg' });
    this.setStatus('Foto completa capturada. Ajusta las cuatro esquinas.');
    return file;
  }

  // Compatibilidad con llamadas antiguas: ya no recorta la zona central.
  async capture() { return this.captureRaw(); }

  enhance(ctx, width, height) {
    // Mejora local ligera: expansión de contraste y leve aclarado, evitando un filtro agresivo.
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const contrast = 1.12;
    const brightness = 6;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128 + brightness));
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128 + brightness));
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128 + brightness));
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

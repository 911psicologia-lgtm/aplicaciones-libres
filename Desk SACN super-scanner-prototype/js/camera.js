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
      this.setStatus('Alinea el documento dentro de la guía');
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

  async capture({ autoEnhance = true } = {}) {
    const videoW = this.video.videoWidth;
    const videoH = this.video.videoHeight;
    if (!videoW || !videoH) throw new Error('La cámara todavía no está lista.');

    // Usa el área central de la guía como recorte inicial. Es un autoencuadre simple
    // y estable para el prototipo; la corrección de cuatro esquinas se incorpora en la siguiente fase.
    const cropX = Math.round(videoW * 0.08);
    const cropY = Math.round(videoH * 0.08);
    const cropW = Math.round(videoW * 0.84);
    const cropH = Math.round(videoH * 0.84);

    const maxLongSide = 2200;
    const scale = Math.min(1, maxLongSide / Math.max(cropW, cropH));
    this.canvas.width = Math.round(cropW * scale);
    this.canvas.height = Math.round(cropH * scale);
    const ctx = this.canvas.getContext('2d', { alpha: false, willReadFrequently: autoEnhance });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.video, cropX, cropY, cropW, cropH, 0, 0, this.canvas.width, this.canvas.height);

    if (autoEnhance) this.enhance(ctx, this.canvas.width, this.canvas.height);

    const blob = await new Promise((resolve, reject) => this.canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo capturar la página.')), 'image/jpeg', 0.92));
    const file = new File([blob], `scan-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`, { type: 'image/jpeg' });
    this.setStatus('Página capturada. Puedes añadir otra.');
    return file;
  }

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

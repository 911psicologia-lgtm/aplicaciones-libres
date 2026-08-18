export class CameraController {
  constructor({ video, canvas, statusEl, stage }) {
    this.video = video;
    this.canvas = canvas;
    this.statusEl = statusEl;
    this.stage = stage;
    this.stream = null;
    this.facingMode = 'environment';
    this.statusTimer = null;
    this.resizeHandler = () => this.syncPreviewGeometry();
    this.metadataHandler = () => this.syncPreviewGeometry();
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('orientationchange', this.resizeHandler, { passive: true });
    this.video?.addEventListener('loadedmetadata', this.metadataHandler);
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
      this.syncPreviewGeometry();
      // El mensaje explicativo permanente está fuera del visor. Dentro solo
      // mostramos un estado breve para no competir visualmente con la captura.
      this.setStatus('Cámara lista · captura completa', true);
      return true;
    } catch (error) {
      this.setStatus('No se pudo abrir la cámara');
      if (error?.name === 'NotAllowedError') throw new Error('Permiso de cámara bloqueado. Habilítalo en el navegador y vuelve a intentar.');
      if (error?.name === 'NotFoundError') throw new Error('No se encontró una cámara disponible en este dispositivo.');
      throw error;
    }
  }

  syncPreviewGeometry() {
    if (!this.stage || !this.video) return;
    const videoW = this.video.videoWidth;
    const videoH = this.video.videoHeight;
    if (!videoW || !videoH) return;

    // v0.4: el visor adopta la proporción REAL del stream. El video usa
    // object-fit: contain, por lo que nunca se recorta para llenar la pantalla.
    // Resultado: todo el fotograma que se muestra es el que captureRaw conserva.
    const ratio = videoW / videoH;
    this.stage.style.aspectRatio = `${videoW} / ${videoH}`;
    this.stage.dataset.frame = `${videoW}×${videoH}`;

    const mobile = window.matchMedia('(max-width: 600px)').matches;
    const shell = this.stage.closest('.camera-shell');
    const shellWidth = shell?.clientWidth || window.innerWidth;
    const maxW = Math.max(240, shellWidth - (mobile ? 0 : 36));
    // Reservamos espacio para cabecera, disparador, ayuda y pie. Si la cámara
    // es muy vertical, reducimos también el ancho para mantener su proporción.
    const maxH = Math.max(280, window.innerHeight - (mobile ? 300 : 250));
    let targetW = maxW;
    let targetH = targetW / ratio;
    if (targetH > maxH) {
      targetH = maxH;
      targetW = targetH * ratio;
    }
    this.stage.style.width = `${Math.round(targetW)}px`;
    this.stage.style.height = `${Math.round(targetH)}px`;
    this.stage.style.marginLeft = 'auto';
    this.stage.style.marginRight = 'auto';
  }

  async stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
    clearTimeout(this.statusTimer);
  }

  async switchCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    return this.open();
  }

  setStatus(text, autoHide = false) {
    if (!this.statusEl) return;
    clearTimeout(this.statusTimer);
    this.statusEl.textContent = text;
    this.statusEl.classList.remove('camera-status-hidden');
    if (autoHide) {
      this.statusTimer = setTimeout(() => this.statusEl?.classList.add('camera-status-hidden'), 2200);
    }
  }

  async captureRaw() {
    const videoW = this.video.videoWidth;
    const videoH = this.video.videoHeight;
    if (!videoW || !videoH) throw new Error('La cámara todavía no está lista.');

    // Se captura TODO el frame nativo del stream. No existe recorte previo,
    // guía de corte ni object-fit: cover. El recorte ocurre solo después,
    // en el editor de cuatro esquinas, y siempre puede ser corregido por el usuario.
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
    this.setStatus('Foto completa guardada · ahora ajusta los bordes', true);
    return file;
  }

  async capture() { return this.captureRaw(); }

  enhance(ctx, width, height) {
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

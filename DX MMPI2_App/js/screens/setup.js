/* ============================================
   Setup screen — configuración inicial del evaluador
   - Datos profesionales
   - Firma: dibujo en canvas O carga de imagen
   ============================================ */

const Setup = {
  _pad: null,
  _uploadedSigData: null, // data URL de la imagen subida (cuando se usa upload)

  render() {
    const ev = (window.Storage && Storage.getEvaluator()) || {};
    const isEdit = Storage.isSetupDone();
    return `
      <div class="screen">
        <div class="screen-content" style="max-width:760px">
          <h2 style="font-size:22px;color:var(--color-primary-dark);margin-bottom:8px">
            ${isEdit ? 'Configuración del evaluador' : 'Bienvenido · Configuración inicial'}
          </h2>
          <p class="text-muted mb-24">
            ${isEdit
              ? 'Actualice sus datos profesionales. Esta información aparecerá en todos los informes generados.'
              : 'Antes de empezar, complete sus datos profesionales. Esta información aparecerá en todos los informes generados.'}
          </p>

          <div class="card">
            <div class="card-header"><h3>Datos del evaluador</h3></div>
            <div class="card-body">

              <div class="form-section">
                <div class="form-grid">
                  <div class="form-field full">
                    <label class="form-label">Nombre completo <span class="required">*</span></label>
                    <input type="text" id="ev-name" class="form-input" value="${this._esc(ev.name || '')}" placeholder="Dr./Dra. Nombre Apellido" required>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Correo electrónico <span class="required">*</span></label>
                    <input type="email" id="ev-email" class="form-input" value="${this._esc(ev.email || '')}" placeholder="nombre@dominio.com" required>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Número de tarjeta profesional</label>
                    <input type="text" id="ev-license" class="form-input" value="${this._esc(ev.license || '')}" placeholder="TP-0000">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Registro profesional</label>
                    <input type="text" id="ev-registry" class="form-input" value="${this._esc(ev.registry || '')}" placeholder="RP-0000">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Número de teléfono</label>
                    <input type="tel" id="ev-phone" class="form-input" value="${this._esc(ev.phone || '')}" placeholder="+34 600 000 000">
                  </div>
                  <div class="form-field full">
                    <label class="form-label">Dirección (consultorio)</label>
                    <input type="text" id="ev-address" class="form-input" value="${this._esc(ev.address || '')}" placeholder="Calle, número, ciudad">
                  </div>
                </div>
              </div>

              <div class="form-section">
                <label class="form-label">Firma digital</label>
                <p class="form-hint mb-8">
                  Dibuje su firma con el ratón o el dedo, o cargue una imagen de firma (PNG o JPEG, máx 500 KB).
                  Se incrustará en cada informe generado.
                </p>

                <div class="signature-tabs" style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
                  <button type="button" class="btn btn-secondary btn-sm" id="sig-mode-draw">✎ Dibujar</button>
                  <button type="button" class="btn btn-secondary btn-sm" id="sig-mode-upload">🖼 Cargar imagen</button>
                </div>

                <div id="sig-draw-pane">
                  <canvas id="sig-canvas" class="signature-pad" width="700" height="160" style="width:100%;height:160px"></canvas>
                  <div class="signature-actions">
                    <button type="button" class="btn btn-secondary btn-sm" id="sig-clear">Limpiar</button>
                    ${ev.signature ? '<button type="button" class="btn btn-ghost btn-sm" id="sig-restore">Restaurar firma guardada</button>' : ''}
                    <span class="form-hint" id="sig-status" style="margin-left:auto;align-self:center"></span>
                  </div>
                </div>

                <div id="sig-upload-pane" style="display:none">
                  <input type="file" id="sig-file" accept="image/png,image/jpeg" style="display:none">
                  <div class="signature-upload-area" id="sig-upload-area"
                       style="border:2px dashed var(--color-border);border-radius:var(--radius-md);padding:24px;text-align:center;cursor:pointer;background:var(--color-bg)">
                    <div style="font-size:32px;color:var(--color-text-muted)">⬆</div>
                    <div style="margin-top:8px;color:var(--color-text)">Haga clic para seleccionar una imagen de firma</div>
                    <div style="font-size:12px;color:var(--color-text-muted);margin-top:4px">Solo PNG o JPEG (no SVG). Máximo 500 KB.</div>
                  </div>
                  <div id="sig-upload-preview" style="margin-top:12px;display:none">
                    <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">Vista previa de la firma cargada:</div>
                    <div style="background:#fff;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:8px;display:inline-block">
                      <img id="sig-upload-img" alt="firma cargada" style="max-height:100px;max-width:100%">
                    </div>
                    <div style="margin-top:8px">
                      <button type="button" class="btn btn-ghost btn-sm" id="sig-upload-remove">✕ Quitar imagen</button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
            <div class="card-footer flex justify-between items-center">
              ${isEdit ? '<button class="btn btn-ghost" id="setup-cancel">Cancelar</button>' : '<span></span>'}
              <button class="btn btn-primary" id="setup-save">Guardar y continuar</button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  mount() {
    /* ---- Pestañas (dibujar / cargar) ---- */
    const drawPane = document.getElementById('sig-draw-pane');
    const uploadPane = document.getElementById('sig-upload-pane');
    const modeDrawBtn = document.getElementById('sig-mode-draw');
    const modeUploadBtn = document.getElementById('sig-mode-upload');

    const showDraw = () => {
      if (drawPane) drawPane.style.display = '';
      if (uploadPane) uploadPane.style.display = 'none';
      if (modeDrawBtn) { modeDrawBtn.classList.add('btn-primary'); modeDrawBtn.classList.remove('btn-secondary'); }
      if (modeUploadBtn) { modeUploadBtn.classList.remove('btn-primary'); modeUploadBtn.classList.add('btn-secondary'); }
    };
    const showUpload = () => {
      if (drawPane) drawPane.style.display = 'none';
      if (uploadPane) uploadPane.style.display = '';
      if (modeDrawBtn) { modeDrawBtn.classList.remove('btn-primary'); modeDrawBtn.classList.add('btn-secondary'); }
      if (modeUploadBtn) { modeUploadBtn.classList.add('btn-primary'); modeUploadBtn.classList.remove('btn-secondary'); }
    };

    bindEvent('sig-mode-draw', 'click', () => showDraw());
    bindEvent('sig-mode-upload', 'click', () => showUpload());

    /* ---- Canvas (modo dibujar) ---- */
    const canvas = document.getElementById('sig-canvas');
    if (canvas && window.SignaturePad) {
      this._pad = new SignaturePad(canvas, { penColor: '#1F3864' });
      const ev = Storage.getEvaluator();
      if (ev && ev.signature) {
        this._pad.fromDataURL(ev.signature).then(() => this._updateSigStatus()).catch(() => this._updateSigStatus());
      } else {
        this._updateSigStatus();
      }
    }

    bindEvent('sig-clear', 'click', () => {
      if (this._pad) {
        this._pad.clear();
        this._updateSigStatus();
      }
    });

    const restore = document.getElementById('sig-restore');
    if (restore) {
      restore.addEventListener('click', () => {
        const e = Storage.getEvaluator();
        if (e && e.signature && this._pad) {
          this._pad.fromDataURL(e.signature).then(() => this._updateSigStatus());
        }
      });
    }

    /* ---- Upload (modo cargar imagen) ---- */
    const fileInput = document.getElementById('sig-file');
    const uploadArea = document.getElementById('sig-upload-area');
    const preview = document.getElementById('sig-upload-preview');
    const previewImg = document.getElementById('sig-upload-img');
    const removeBtn = document.getElementById('sig-upload-remove');

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
    }
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this._onFileSelected(e));
    }
    if (previewImg) {
      // Si ya existe firma guardada, mostrarla como preview
      const ev2 = Storage.getEvaluator();
      if (ev2 && ev2.signature) {
        previewImg.src = ev2.signature;
        this._uploadedSigData = ev2.signature;
        if (preview) preview.style.display = '';
      }
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this._uploadedSigData = null;
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = '';
        if (preview) preview.style.display = 'none';
      });
    }

    /* ---- Save & Cancel ---- */
    bindEvent('setup-save', 'click', () => this._save());
    bindEvent('setup-cancel', 'click', () => App.navigate('dashboard'));

    // Estado inicial: modo dibujar activo
    showDraw();
  },

  /* ---------- Manejo del archivo de imagen de firma ----------
     Validación estricta: solo PNG y JPEG (no SVG), máx 500 KB. */
  _onFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Validar tipo MIME: solo PNG y JPEG
    const isPNG = (file.type === 'image/png');
    const isJPEG = (file.type === 'image/jpeg' || file.type === 'image/jpg');
    if (!isPNG && !isJPEG) {
      window.toast('Formato no permitido. Seleccione un archivo PNG o JPEG (no SVG).', 'error');
      e.target.value = '';
      return;
    }
    // Rechazar SVG explícitamente (por si el navegador lo clasifica como image/svg+xml)
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      window.toast('Las imágenes SVG no están permitidas (riesgo de seguridad). Use PNG o JPEG.', 'error');
      e.target.value = '';
      return;
    }
    // Validar tamaño (máx 500 KB)
    const MAX_BYTES = 500 * 1024;
    if (file.size > MAX_BYTES) {
      window.toast(`La imagen es demasiado grande (${(file.size/1024).toFixed(0)} KB). Máximo permitido: 500 KB.`, 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const dataURL = ev.target.result;
        // Validar dataURL resultante
        if (typeof dataURL !== 'string' || !dataURL.startsWith('data:image/')) {
          window.toast('No se pudo leer la imagen como dataURL.', 'error');
          return;
        }
        if (dataURL.startsWith('data:image/svg')) {
          window.toast('La imagen cargada es SVG y no está permitida.', 'error');
          return;
        }
        this._uploadedSigData = dataURL;
        const preview = document.getElementById('sig-upload-preview');
        const previewImg = document.getElementById('sig-upload-img');
        if (previewImg) previewImg.src = dataURL;
        if (preview) preview.style.display = '';
        window.toast('Imagen de firma cargada', 'success');
      } catch (err) {
        console.error('Error leyendo imagen de firma:', err);
        window.toast('Error al leer la imagen', 'error');
      }
    };
    reader.onerror = () => { window.toast('Error al leer el archivo', 'error'); };
    reader.readAsDataURL(file);
  },

  _updateSigStatus() {
    const el = document.getElementById('sig-status');
    if (!el) return;
    el.textContent = (this._pad && !this._pad.isEmpty()) ? 'Firma capturada ✓' : 'Sin firma';
  },

  _save() {
    const name = document.getElementById('ev-name').value.trim();
    const email = document.getElementById('ev-email').value.trim();
    if (!name) { window.toast('El nombre es obligatorio', 'error'); return; }
    if (!email) { window.toast('El correo electrónico es obligatorio', 'error'); return; }

    // Prioridad: si hay imagen subida en esta sesión, usarla; si no, usar el canvas; si no, conservar la firma guardada.
    let sig = null;
    const uploadVisible = document.getElementById('sig-upload-pane') &&
      document.getElementById('sig-upload-pane').style.display !== 'none';
    if (uploadVisible && this._uploadedSigData) {
      sig = this._uploadedSigData;
    } else if (this._pad && !this._pad.isEmpty()) {
      sig = this._pad.toDataURL('image/png');
    } else {
      sig = Storage.getEvaluator()?.signature || null;
    }

    const data = {
      name,
      email,
      license: document.getElementById('ev-license').value.trim(),
      registry: document.getElementById('ev-registry').value.trim(),
      phone: document.getElementById('ev-phone').value.trim(),
      address: document.getElementById('ev-address').value.trim(),
      signature: sig,
      updatedAt: new Date().toISOString(),
    };
    Storage.setEvaluator(data);
    Storage.markSetupDone();
    window.toast('Datos del evaluador guardados', 'success');
    setTimeout(() => App.navigate('dashboard'), 400);
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};

window.Setup = Setup;

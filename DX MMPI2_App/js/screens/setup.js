/* ============================================
   Setup screen — configuración inicial del evaluador
   ============================================ */

const Setup = {
  _pad: null,

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
                <p class="form-hint mb-8">Dibuje su firma con el ratón o el dedo. Se incrustará en cada informe generado.</p>
                <canvas id="sig-canvas" class="signature-pad" width="700" height="160" style="width:100%;height:160px"></canvas>
                <div class="signature-actions">
                  <button type="button" class="btn btn-secondary btn-sm" id="sig-clear">Limpiar</button>
                  ${ev.signature ? '<button type="button" class="btn btn-ghost btn-sm" id="sig-restore">Restaurar firma guardada</button>' : ''}
                  <span class="form-hint" id="sig-status" style="margin-left:auto;align-self:center"></span>
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
    const canvas = document.getElementById('sig-canvas');
    if (canvas && window.SignaturePad) {
      this._pad = new SignaturePad(canvas, { penColor: '#1F3864' });
      const ev = Storage.getEvaluator();
      if (ev && ev.signature) {
        this._pad.fromDataURL(ev.signature).then(() => this._updateSigStatus());
      }
      document.getElementById('sig-clear').addEventListener('click', () => {
        this._pad.clear();
        this._updateSigStatus();
      });
      const restore = document.getElementById('sig-restore');
      if (restore) restore.addEventListener('click', () => {
        const e = Storage.getEvaluator();
        if (e && e.signature) this._pad.fromDataURL(e.signature).then(() => this._updateSigStatus());
      });
      this._updateSigStatus();
    }

    const saveBtn = document.getElementById('setup-save');
    if (saveBtn) saveBtn.addEventListener('click', () => this._save());
    
    const sigClear = document.getElementById('sig-clear');
    if (sigClear) sigClear.addEventListener('click', () => {
      if (this._pad) {
        this._pad.clear();
        this._updateSigStatus();
      }
    });
    
    const cancel = document.getElementById('setup-cancel');
    if (cancel) cancel.addEventListener('click', () => App.navigate('dashboard'));
  },

  _updateSigStatus() {
    const el = document.getElementById('sig-status');
    if (!el) return;
    el.textContent = this._pad && !this._pad.isEmpty() ? 'Firma capturada ✓' : 'Sin firma';
  },

  _save() {
    const name = document.getElementById('ev-name').value.trim();
    const email = document.getElementById('ev-email').value.trim();
    if (!name) { window.toast('El nombre es obligatorio', 'error'); return; }
    if (!email) { window.toast('El correo electrónico es obligatorio', 'error'); return; }

    const sig = (this._pad && !this._pad.isEmpty()) ? this._pad.toDataURL('image/png') : (Storage.getEvaluator()?.signature || null);

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

/* ============================================
   Activation screen — Pantalla de activación de licencia
   ============================================ */

const Activation = {
  render() {
    const status = License.getStatus();
    const isExhausted = status.active && status.exhausted;

    let titleText = 'MMPI-2 · Activación';
    let subtitleText = 'Ingrese su clave de activación para comenzar a usar la aplicación.';
    let alertBox = '';

    if (isExhausted) {
      titleText = 'Aplicaciones agotadas';
      subtitleText = 'Ha utilizado todas las aplicaciones de su clave. Ingrese otra clave para procesar nuevas aplicaciones.';
      alertBox = `
        <div class="card" style="border:1px solid var(--color-warning);background:rgba(191,143,0,0.05);margin-bottom:16px">
          <div class="card-body" style="padding:16px">
            <div style="font-weight:700;color:var(--color-warning);font-size:14px;margin-bottom:6px">⚠ Aplicaciones agotadas</div>
            <div style="font-size:13px;color:var(--color-text);line-height:1.6">
              Aplicaciones utilizadas: <strong>${status.used}</strong> de <strong>${status.maxUses}</strong>.<br>
              Plan: ${this._esc(License.tierLabel(status.tier))}.<br>
              Los informes guardados siguen disponibles.
            </div>
            <div style="margin-top:12px;padding:10px;background:var(--color-bg);border-radius:6px;font-size:12px;color:var(--color-text-muted)">
              💡 Adquiera una nueva clave con su distribuidor para obtener más aplicaciones.
            </div>
          </div>
        </div>
      `;
    } else if (status.active) {
      subtitleText = 'Ingrese otra clave para cambiar de plan. El saldo de cada clave se conserva en este navegador.';
    } else {
      titleText = 'Activación requerida';
      subtitleText = 'Esta aplicación requiere una clave de activación para funcionar.';
    }

    return `
      <div class="screen">
        <div class="screen-content" style="max-width:520px;margin:0 auto;padding:32px 16px;min-height:100vh;display:flex;flex-direction:column;justify-content:center">
          <div style="text-align:center;margin-bottom:24px">
            <div style="width:80px;height:80px;background:linear-gradient(135deg,#1F3864,#4472C4);color:#fff;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 16px">M2</div>
            <h1 style="font-size:22px;color:var(--color-primary-dark);margin-bottom:8px">${this._esc(titleText)}</h1>
            <p style="color:var(--color-text-muted);font-size:13px;line-height:1.5;max-width:400px;margin:0 auto">
              ${this._esc(subtitleText)}
            </p>
          </div>

          ${alertBox}

          <div class="card">
            <div class="card-body" style="padding:24px">
              <label for="license-key" style="font-weight:600;color:var(--color-primary-dark);font-size:13px;display:block;margin-bottom:8px">Clave de activación</label>
              <input type="text" id="license-key"
                     placeholder="M2-XX-XXXXX-XXXXX"
                     autocomplete="off"
                     spellcheck="false"
                     style="width:100%;padding:14px;font-size:18px;font-family:'Courier New',monospace;letter-spacing:2px;text-align:center;text-transform:uppercase;border:2px solid var(--color-border);border-radius:8px;box-sizing:border-box">
              <div id="license-error" style="color:var(--color-danger);font-size:12px;margin-top:8px;min-height:18px" role="alert"></div>
              <button class="btn btn-primary" id="activate-btn" style="width:100%;margin-top:16px;padding:14px;font-size:14px;font-weight:600">Activar aplicación</button>
            </div>
          </div>

          ${status.active ? '<button type="button" class="btn btn-secondary" id="activate-back">Volver al panel</button>' : ''}
          <div style="margin-top:24px;text-align:center;font-size:12px;color:var(--color-text-muted);line-height:1.6">
            <p style="margin-bottom:6px"><strong>Formato de la clave:</strong></p>
            <p style="margin-bottom:12px"><code style="background:var(--color-bg);padding:4px 8px;border-radius:4px;font-family:monospace;font-size:13px">M2-XX-XXXXX-XXXXX</code></p>
            <p style="margin-bottom:6px">Planes disponibles: 5 · 10 · 15 · 20 · 25 · 30 · 40 · 50 aplicaciones</p>
            <p style="margin-top:16px;padding-top:12px;border-top:1px solid var(--color-border)">Para adquirir o recargar su clave, contáctese con su distribuidor.</p>
          </div>
        </div>
      </div>
    `;
  },

  mount() {
    const input = document.getElementById('license-key');
    const btn = document.getElementById('activate-btn');
    const errorEl = document.getElementById('license-error');
    bindEvent('activate-back','click',()=>App.navigate('dashboard'));

    if (input) {
      // Auto-enfoque
      setTimeout(() => input.focus(), 50);

      // Auto-formatear: M2-XX-XXXXX-XXXXX
      input.addEventListener('input', (e) => {
        let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        v = v.substring(0, 14);
        if (v.length > 9) v = v.substring(0, 2) + '-' + v.substring(2, 4) + '-' + v.substring(4, 9) + '-' + v.substring(9);
        else if (v.length > 4) v = v.substring(0, 2) + '-' + v.substring(2, 4) + '-' + v.substring(4);
        else if (v.length > 2) v = v.substring(0, 2) + '-' + v.substring(2);
        e.target.value = v;
        if (errorEl) errorEl.textContent = '';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btn.click();
        }
      });
    }

    if (btn) {
      btn.addEventListener('click', async () => {
        if (!input || btn.disabled) return;
        btn.disabled = true;
        const result = await License.activate(input.value);
        btn.disabled = false;
        if (result.ok) {
          const lic = result.license;
          const planLabel = License.tierLabel(lic.tier);
          const appsLabel = lic.isMaster ? 'uso ilimitado' : `${lic.remaining} aplicaciones restantes`;
          window.toast(`Activación exitosa · ${planLabel} (${appsLabel})`, 'success', 5000);
          // Limpiar cualquier flag de bloqueo en sessionStorage
          sessionStorage.removeItem('mmpi2_block_message');
          setTimeout(() => {
            // Navegar al splash/dashboard/setup según corresponda
            if (Storage.isSetupDone && Storage.isSetupDone()) {
              App.navigate('dashboard');
            } else {
              App.navigate('setup');
            }
          }, 800);
        } else {
          if (errorEl) {
            errorEl.textContent = result.error || 'Clave inválida';
            errorEl.style.animation = 'none';
            setTimeout(() => { errorEl.style.animation = 'shake 0.3s'; }, 10);
          }
          input.select();
        }
      });
    }
  },

  _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.Activation = Activation;

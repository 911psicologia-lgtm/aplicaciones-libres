/* ============================================
   Helper utility: safe event binding
   ============================================ */

// Bind an event listener only if the element exists
function bindEvent(elementId, eventName, handler) {
  const el = document.getElementById(elementId);
  if (el) {
    el.addEventListener(eventName, handler);
    return true;
  }
  return false;
}

// Bind multiple events safely
function bindEvents(bindings) {
  bindings.forEach(({ id, event, handler }) => {
    bindEvent(id, event, handler);
  });
}

// Expose globally
window.bindEvent = bindEvent;
window.bindEvents = bindEvents;

/* ============================================
   Mensajes de error comprensibles
   Traduce errores técnicos a lenguaje claro para el profesional.
   Uso: toast(friendlyError(err, 'exportar el informe a Word'), 'error')
   ============================================ */
function friendlyError(err, action) {
  const raw = (err && (err.message || err.name || String(err))) || '';
  const name = (err && err.name) || '';
  const what = action ? `No se pudo ${action}. ` : '';
  // Almacenamiento lleno
  if (name === 'QuotaExceededError' || /quota|exceeded/i.test(raw)) {
    return what + 'El espacio de almacenamiento del navegador está lleno. Descargue una copia de seguridad y vacíe la papelera o elimine casos de prueba antiguos.';
  }
  // JSON mal formado
  if (err instanceof SyntaxError || /JSON|Unexpected token|Unexpected end/i.test(raw)) {
    return what + 'El contenido no tiene un formato JSON válido. Verifique que copió el texto completo, desde la primera llave { hasta la última }.';
  }
  // Librerías no cargadas
  if (/docx\.js no disponible/i.test(raw)) return what + 'El módulo para generar Word no se cargó. Recargue la página e inténtelo de nuevo.';
  if (/SheetJS|XLSX/i.test(raw)) return what + 'El módulo de Excel no se cargó o el archivo no es un Excel válido (.xlsx). Ábralo en Excel, guárdelo de nuevo como .xlsx e inténtelo otra vez.';
  if (/jsPDF/i.test(raw)) return what + 'El módulo para generar PDF no se cargó. Recargue la página e inténtelo de nuevo.';
  if (/Chart/i.test(raw) && /not defined|undefined/i.test(raw)) return what + 'El módulo de gráficos no se cargó. Recargue la página.';
  // Red / archivos de datos
  if (/Failed to fetch|NetworkError|Load failed/i.test(raw)) {
    return what + 'No se pudieron cargar los archivos de la aplicación. Revise la conexión a internet o abra la app instalada (funciona sin conexión después de la primera carga).';
  }
  // Portapapeles
  if (/clipboard|NotAllowedError/i.test(raw)) return what + 'El navegador no permitió usar el portapapeles. Haga clic en la página y vuelva a intentarlo.';
  // Validación de importación (ya vienen en lenguaje claro)
  if (/^(Caso #|Papelera|Falta el campo|El JSON no es|"cases"|"evaluator"|Demasiados casos|La firma)/.test(raw)) {
    return what + 'El archivo de copia de seguridad no es válido: ' + raw;
  }
  // Datos del caso
  if (/country es obligatorio/i.test(raw)) return what + 'Falta el baremo (país) en los datos del caso. Edite el caso y seleccione un baremo.';
  if (/sex es obligatorio/i.test(raw)) return what + 'Falta el sexo del evaluado, necesario para aplicar el baremo. Edite el caso y selecciónelo.';
  // Genérico
  return what + 'Ocurrió un problema inesperado. Si se repite, descargue una copia de seguridad y recargue la página. (Detalle técnico: ' + raw.slice(0, 120) + ')';
}
window.friendlyError = friendlyError;

/* Errores no capturados → aviso comprensible (sin inundar de mensajes) */
(function () {
  let last = 0;
  const notify = (err) => {
    const now = Date.now();
    if (now - last < 4000) return;
    last = now;
    if (window.toast) window.toast(friendlyError(err), 'error', 7000);
  };
  window.addEventListener('error', (e) => {
    // Ignorar errores de recursos (imágenes, etc.) y de extensiones
    if (!e.error) return;
    console.error(e.error);
    notify(e.error);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error(e.reason);
    notify(e.reason || new Error('Promesa rechazada'));
  });
})();

/* Guardado de emergencia: si se cierra o oculta la pestaña, escribir lo pendiente */
(function () {
  const flushNow = () => { try { if (window.Storage && Storage.flush) Storage.flush(); } catch (e) {} };
  window.addEventListener('pagehide', flushNow);
  window.addEventListener('beforeunload', flushNow);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });
})();

/* Escape HTML compartido */
window.escHTML = function (s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

/* Diálogo de confirmación propio (más claro que confirm()) — devuelve Promise<boolean> */
window.confirmDialog = function ({ title = 'Confirmar', message = '', okText = 'Aceptar', cancelText = 'Cancelar', danger = false } = {}) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) { resolve(window.confirm(message)); return; }
    content.innerHTML = `
      <div class="modal-header"><h3 id="modal-title">${window.escHTML(title)}</h3></div>
      <div class="modal-body"><p style="font-size:14px;line-height:1.6;white-space:pre-line">${window.escHTML(message)}</p></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="cd-cancel">${window.escHTML(cancelText)}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cd-ok">${window.escHTML(okText)}</button>
      </div>`;
    overlay.classList.remove('hidden');
    overlay.classList.add('centered');
    content.classList.add('dialog');
    const done = (v) => { overlay.classList.add('hidden'); overlay.classList.remove('centered'); content.classList.remove('dialog'); resolve(v); };
    document.getElementById('cd-cancel').onclick = () => done(false);
    document.getElementById('cd-ok').onclick = () => done(true);
    setTimeout(() => { const b = document.getElementById('cd-ok'); if (b) b.focus(); }, 30);
  });
};

/* Toast con acción (p. ej. "Deshacer") */
window.toastAction = function (message, actionText, onAction, timeout = 7000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast info toast-action';
  const span = document.createElement('span'); span.textContent = message;
  const btn = document.createElement('button'); btn.className = 'btn btn-ghost btn-sm'; btn.textContent = actionText;
  btn.onclick = () => { try { onAction(); } finally { el.remove(); } };
  el.appendChild(span); el.appendChild(btn);
  container.appendChild(el);
  setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 300); }, timeout);
};

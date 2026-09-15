/* ═══════════════════════════════════════════
   PequeWorld — Utilidades compartidas
   ═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* v9 [A-b]: escapa texto de usuario (nombre del perfil) antes de interpolarse
   en innerHTML — evita que un nombre como «<img src=x>» rompa la interfaz */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; }
function now() { return Date.now(); }

/* v11: vibración háptica suave al acertar/fallar (solo móviles que la
   soportan; se puede apagar en Ajustes). Silenciosa donde no existe. */
function buzz(pat) {
  try {
    if (STATE && STATE.settings && STATE.settings.haptics !== false && navigator.vibrate) navigator.vibrate(pat);
  } catch (e) {}
}

/* Rutas de imágenes */
const IMG = k => 'assets/img/words/' + k + '.jpg';
const UI_IMG = k => 'assets/img/ui/' + k + '.jpg';
const AV_IMG = k => 'assets/img/avatars/' + k + '.jpg';

/* Etiqueta <img> con fallback a emoji si falta el asset */
function imgTag(key, emoji, cls, alt) {
  if (key) return `<img class="${cls}" src="${IMG(key)}" alt="${alt || emoji || 'palabra'}" loading="lazy"
    onerror="this.outerHTML='<span class=&quot;${cls} img-fallback&quot;>${emoji || '✨'}</span>'">`;
  return `<span class="${cls} img-fallback">${emoji || '✨'}</span>`;
}
function uiTag(key, emoji, cls, alt) {
  return `<img class="${cls}" src="${UI_IMG(key)}" alt="${alt || emoji || ''}" loading="lazy"
    onerror="this.outerHTML='<span class=&quot;${cls} img-fallback&quot;>${emoji || ''}</span>'">`;
}

/* ═══════════════════════════════════════════
   PequeWorld — Utilidades compartidas
   ═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; }
function now() { return Date.now(); }

/* Rutas de imágenes */
const IMG = k => 'assets/img/words/' + k + '.jpg';
const UI_IMG = k => 'assets/img/ui/' + k + '.jpg';
const AV_IMG = k => 'assets/img/avatars/' + k + '.jpg';

/* Etiqueta <img> con fallback a emoji si falta el asset */
function imgTag(key, emoji, cls, alt) {
  if (key) return `<img class="${cls}" src="${IMG(key)}" alt="${alt || ''}" loading="lazy"
    onerror="this.outerHTML='<span class=&quot;${cls} img-fallback&quot;>${emoji || '✨'}</span>'">`;
  return `<span class="${cls} img-fallback">${emoji || '✨'}</span>`;
}
function uiTag(key, emoji, cls, alt) {
  return `<img class="${cls}" src="${UI_IMG(key)}" alt="${alt || ''}" loading="lazy"
    onerror="this.outerHTML='<span class=&quot;${cls} img-fallback&quot;>${emoji || ''}</span>'">`;
}

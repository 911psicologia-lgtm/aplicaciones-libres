export const $ = (q, root=document) => root.querySelector(q);
export const $$ = (q, root=document) => [...root.querySelectorAll(q)];
export function uid(){ return crypto?.randomUUID?.() || `rl_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
export function sanitizeAlias(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
}
export function aliasFromTitle(title){ return sanitizeAlias(title).slice(0,36) || `link-${Date.now().toString(36)}`; }
export function isUrl(value){ try { const u = new URL(value); return ['http:','https:'].includes(u.protocol); } catch { return false; } }
export function formatDate(iso){ return new Intl.DateTimeFormat('es-CO',{dateStyle:'medium', timeStyle:'short'}).format(new Date(iso)); }
export function escapeHtml(str){ return String(str||'').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
export async function copyText(text){ await navigator.clipboard.writeText(text); }
export function download(filename, content, type='application/json'){
  const blob = content instanceof Blob ? content : new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

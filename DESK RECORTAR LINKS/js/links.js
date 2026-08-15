import { loadLinks, saveLinks, loadSettings } from './storage.js';
import { uid, sanitizeAlias, aliasFromTitle, isUrl } from './helpers.js';

export function getShortUrl(link){
  const settings = loadSettings();
  const base = settings.baseDomain?.trim() || `${location.origin}${location.pathname}`;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  if(settings.baseDomain) return `${cleanBase}${link.alias}`;
  return `${location.origin}${location.pathname}#r/${link.alias}`;
}

export function uniqueAlias(seed, currentId=null){
  const links = loadLinks();
  const base = sanitizeAlias(seed) || `link-${Date.now().toString(36)}`;
  let candidate = base;
  let i = 2;
  while(links.some(l => l.alias === candidate && l.id !== currentId)) candidate = `${base}-${i++}`;
  return candidate;
}

export function createLink(data){
  if(!isUrl(data.destination)) throw new Error('El enlace largo debe iniciar con http:// o https://');
  const links = loadLinks();
  const now = new Date().toISOString();
  const aliasSeed = data.alias || aliasFromTitle(data.title);
  const link = {
    id: uid(),
    title: data.title.trim(),
    alias: uniqueAlias(aliasSeed),
    destination: data.destination.trim(),
    category: data.category || 'Otros',
    note: data.note || '',
    priority: Boolean(data.priority),
    trust: Boolean(data.trust),
    clicks: 0,
    createdAt: now,
    updatedAt: now,
    lastAccess: null
  };
  links.unshift(link);
  saveLinks(links);
  return link;
}

export function updateLink(id, patch){
  const links = loadLinks();
  const index = links.findIndex(l => l.id === id);
  if(index < 0) throw new Error('No se encontró el enlace.');
  if(patch.destination && !isUrl(patch.destination)) throw new Error('El destino debe ser una URL válida.');
  const nextAlias = patch.alias ? uniqueAlias(patch.alias, id) : links[index].alias;
  links[index] = { ...links[index], ...patch, alias: nextAlias, updatedAt: new Date().toISOString() };
  saveLinks(links);
  return links[index];
}

export function deleteLink(id){
  saveLinks(loadLinks().filter(l => l.id !== id));
}

export function recordClick(id){
  const links = loadLinks();
  const index = links.findIndex(l => l.id === id);
  if(index >= 0){
    links[index].clicks = Number(links[index].clicks || 0) + 1;
    links[index].lastAccess = new Date().toISOString();
    saveLinks(links);
  }
}

export function findByAlias(alias){
  return loadLinks().find(l => l.alias === sanitizeAlias(alias));
}

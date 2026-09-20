// ════════════════════════════════════════════════════════════════
// MP_DISCOVERY · R10.34 — "Novedades / Descubre"
// Descubrimiento musical por género usando YouTube Data API v3
// vía Cloudflare Worker proxy. Reproducción por YouTube IFrame oficial.
// ════════════════════════════════════════════════════════════════
(() => {
'use strict';

// ─── Configuración ──────────────────────────────────────────────
const DISCOVERY_ENABLED = true;
const DISCOVERY_DEFAULT_REGION = 'CO';
const DISCOVERY_DEFAULT_DAYS = 30;
const DISCOVERY_HOME_ITEMS = 3;
const DISCOVERY_CATEGORY_ITEMS = 8;
// R10.34 · URL del Cloudflare Worker (configurable por el usuario)
// Si está vacío, se usa el modo fallback (búsqueda directa en YouTube)
let DISCOVERY_WORKER_URL = '';
try { DISCOVERY_WORKER_URL = localStorage.getItem('mp-discovery-worker-url') || ''; } catch {}

const DISCOVERY_GENRES = {
  salsa: { label: 'Salsa', emoji: '🎵', queries: ['salsa estreno música','salsa nueva canción','salsa new release'] },
  reggaeton: { label: 'Reggaetón', emoji: '🔥', queries: ['reggaeton estreno','reggaetón nueva música','reggaeton new release'] },
  cumbia: { label: 'Cumbia', emoji: '💃', queries: ['cumbia estreno','cumbia nueva música','cumbia colombiana nueva'] },
  vallenato: { label: 'Vallenato', emoji: '🎹', queries: ['vallenato estreno','vallenato nueva canción','vallenato nuevo'] },
  bachata: { label: 'Bachata', emoji: '💕', queries: ['bachata estreno','bachata nueva música','bachata new release'] },
  electronica: { label: 'Electrónica', emoji: '⚡', queries: ['electronic music new release','EDM new release','electrónica estreno'] },
  rock_es: { label: 'Rock ES', emoji: '🎸', queries: ['rock en español estreno','rock latino nueva música','rock español new release'] },
  reggae: { label: 'Reggae', emoji: '🌴', queries: ['reggae new release','reggae estreno','reggae official video new'] },
  hiphop: { label: 'Hip-Hop', emoji: '🎤', queries: ['hip hop new release','rap latino estreno','hip hop official video new'] },
  pop: { label: 'Pop', emoji: '✨', queries: ['pop new release','pop latino estreno','pop official video new'] },
  jazz: { label: 'Jazz', emoji: '🎷', queries: ['jazz new release','new jazz music','jazz estreno'] },
  protesta: { label: 'Protesta', emoji: '✊', queries: ['canción protesta nueva','música protesta latinoamericana','nueva canción social'] },
  tecnocumbia: { label: 'Tecnocumbia', emoji: '🔊', queries: ['tecnocumbia nueva','tecnocumbia estreno','tecnocumbia 2026'] },
};

// ─── Caché local ────────────────────────────────────────────────
const CACHE_KEY = 'mp-discovery-cache-v1';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

function getCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } }
function setCache(c) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {} }

function getCachedResults(genre, region, days) {
  const key = `${genre}:${region}:${days}`;
  const cache = getCache();
  const entry = cache[key];
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) return entry.results;
  return null;
}

function setCachedResults(genre, region, days, results) {
  const cache = getCache();
  cache[`${genre}:${region}:${days}`] = { results, timestamp: Date.now() };
  setCache(cache);
}

// ─── Scoring ────────────────────────────────────────────────────
function scoreResult(video, genreKey) {
  const genre = DISCOVERY_GENRES[genreKey];
  if (!genre) return 0;
  let score = 0;
  const title = (video.title || '').toLowerCase();
  const desc = (video.description || '').toLowerCase();
  const genreLabel = genre.label.toLowerCase();
  // Bonificaciones
  if (title.includes(genreLabel) || genre.queries.some(q => title.includes(q.split(' ')[0]))) score += 4;
  if (desc.includes(genreLabel)) score += 3;
  if (video.publishedAt) {
    const days = (Date.now() - new Date(video.publishedAt).getTime()) / 86400000;
    if (days < 14) score += 2;
  }
  if (video.duration && video.duration.includes(':')) {
    const parts = video.duration.split(':'); const mins = parseInt(parts[0]);
    if (mins >= 2) score += 1;
  }
  // Penalizaciones
  const penalties = ['reaction', 'tutorial', 'karaoke', 'cover', 'lyrics', 'letra'];
  for (const p of penalties) { if (title.includes(p)) score -= 5; }
  // No musical
  if (title.includes('noticia') || title.includes('entrevista') || title.includes('documental')) score -= 10;
  return score;
}

// ─── Deduplicación ──────────────────────────────────────────────
function dedupeResults(results) {
  const seen = new Set();
  const seenTitles = new Set();
  return results.filter(v => {
    if (seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    const normTitle = (v.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    if (seenTitles.has(normTitle)) return false;
    seenTitles.add(normTitle);
    return true;
  });
}

// ─── Fetch desde Worker ─────────────────────────────────────────
async function fetchDiscovery(genre, region, days) {
  // Verificar caché
  const cached = getCachedResults(genre, region, days);
  if (cached) return cached;

  if (!DISCOVERY_WORKER_URL) {
    // Fallback: sin worker, sin resultados
    return [];
  }

  try {
    const url = `${DISCOVERY_WORKER_URL}/api/discovery?genre=${genre}&region=${region}&days=${days}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!r.ok) return [];
    const data = await r.json();
    const results = data.results || [];
    // Score + dedupe + sort
    const scored = results.map(v => ({ ...v, _score: scoreResult(v, genre) }));
    const deduped = dedupeResults(scored);
    const sorted = deduped.sort((a, b) => b._score - a._score || new Date(b.publishedAt) - new Date(a.publishedAt));
    const final = sorted.slice(0, 20);
    setCachedResults(genre, region, days, final);
    return final;
  } catch (e) {
    console.debug('Discovery fetch error', e);
    return [];
  }
}

// ─── Fecha relativa ─────────────────────────────────────────────
function relativeDate(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'hace 1 día';
  if (days < 7) return `hace ${days} días`;
  if (days < 14) return 'hace 1 semana';
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  return `hace ${Math.floor(days / 30)} mes(es)`;
}

// ─── Render Home (mini) ─────────────────────────────────────────
function renderDiscoveryHome() {
  const container = document.getElementById('homeDiscovery');
  if (!container) return;
  const section = document.getElementById('homeDiscoverySection');
  if (!section) return;
  if (!DISCOVERY_ENABLED) { section.classList.add('is-hidden'); return; }
  section.classList.remove('is-hidden');

  // Genre chips
  const chipsContainer = document.getElementById('homeDiscoveryGenres');
  if (chipsContainer && !chipsContainer.children.length) {
    for (const [key, genre] of Object.entries(DISCOVERY_GENRES)) {
      const chip = document.createElement('button');
      chip.className = 'discovery-chip';
      chip.type = 'button';
      chip.innerHTML = `${genre.emoji} ${genre.label}`;
      chip.onclick = () => openDiscoveryGenre(key);
      chipsContainer.appendChild(chip);
    }
  }

  // Load 3 featured from cache or empty
  const featured = document.getElementById('homeDiscoveryFeatured');
  if (featured) {
    featured.innerHTML = '';
    // Try to show cached results from any genre
    const cache = getCache();
    const allCached = [];
    for (const [key, entry] of Object.entries(cache)) {
      if (entry.results && (Date.now() - entry.timestamp) < CACHE_TTL) {
        allCached.push(...entry.results.slice(0, 1));
      }
    }
    if (allCached.length) {
      allCached.slice(0, DISCOVERY_HOME_ITEMS).forEach(v => {
        featured.appendChild(createDiscoveryCard(v));
      });
    } else {
      featured.innerHTML = '<span class="discovery-empty">Toca un género para descubrir música reciente</span>';
    }
  }
}

// ─── Discovery card ─────────────────────────────────────────────
function createDiscoveryCard(video) {
  const card = document.createElement('div');
  card.className = 'discovery-card';
  const thumb = video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  card.innerHTML = `
    <div class="discovery-thumb" style="background-image:url('${thumb}')"></div>
    <div class="discovery-info">
      <strong>${escapeHtml(video.title || 'YouTube')}</strong>
      <small>${escapeHtml(video.channel || '')} · ${relativeDate(video.publishedAt)}</small>
    </div>
    <div class="discovery-actions">
      <button class="discovery-play" title="Reproducir">▶</button>
      <button class="discovery-save" title="Guardar">♡</button>
      <button class="discovery-open" title="Abrir en YouTube">↗</button>
    </div>`;
  card.querySelector('.discovery-play').onclick = (e) => { e.stopPropagation(); playDiscoveryVideo(video); };
  card.querySelector('.discovery-save').onclick = (e) => { e.stopPropagation(); saveDiscoveryVideo(video); };
  card.querySelector('.discovery-open').onclick = (e) => { e.stopPropagation(); window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank', 'noopener'); };
  return card;
}

function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ─── Play discovery video ───────────────────────────────────────
async function playDiscoveryVideo(video) {
  const mp = window.MP;
  if (!mp?.state) return;
  // Crear track temporal y reproducir
  const track = {
    id: 'yt:' + video.videoId,
    title: video.title || 'YouTube',
    artist: video.channel || 'YouTube',
    sourceKind: 'youtube',
    remoteId: video.videoId,
    remoteUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    thumbnail: video.thumbnail || '',
    duration: 0,
    addedAt: Date.now(),
    favorite: false,
  };
  const existing = mp.state.tracks.find(t => t.sourceKind === 'youtube' && t.remoteId === video.videoId);
  if (!existing) { mp.state.tracks.push(track); mp.saveRemoteTrack?.(track); }
  await mp.playTrack(track.id, [track.id]);
}

// ─── Save discovery video ───────────────────────────────────────
async function saveDiscoveryVideo(video) {
  const mp = window.MP;
  if (!mp?.state) return;
  const track = {
    id: 'yt:' + video.videoId,
    title: video.title || 'YouTube',
    artist: video.channel || 'YouTube',
    sourceKind: 'youtube',
    remoteId: video.videoId,
    remoteUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    thumbnail: video.thumbnail || '',
    duration: 0,
    addedAt: Date.now(),
    favorite: false,
  };
  const existing = mp.state.tracks.find(t => t.sourceKind === 'youtube' && t.remoteId === video.videoId);
  if (!existing) { mp.state.tracks.push(track); mp.saveRemoteTrack?.(track); }
  mp.toast?.('Guardado en biblioteca ♡', 2500);
}

// ─── Open genre view ────────────────────────────────────────────
async function openDiscoveryGenre(genreKey) {
  const genre = DISCOVERY_GENRES[genreKey];
  if (!genre) return;
  const mp = window.MP;
  mp?.showLoader?.(`Novedades · ${genre.label}`, 'Buscando lanzamientos recientes');
  const results = await fetchDiscovery(genreKey, DISCOVERY_DEFAULT_REGION, DISCOVERY_DEFAULT_DAYS);
  mp?.hideLoader?.();

  if (!results.length) {
    mp?.openSheet?.(`<h2 class="sheet-title">${genre.emoji} Novedades · ${genre.label}</h2>
      <p class="sheet-copy">Lanzamientos y videos recientes</p>
      <div class="discovery-fallback">
        <p>Novedades temporalmente no disponibles.</p>
        <button class="sheet-btn" data-open-yt>Explorar en YouTube</button>
      </div>`, root => {
      $('[data-open-yt]', root).onclick = () => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(genre.queries[0])}`, '_blank', 'noopener');
      };
    });
    return;
  }

  const cards = results.slice(0, DISCOVERY_CATEGORY_ITEMS).map(v => {
    const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
    return `<div class="discovery-card-sheet" data-video-id="${v.videoId}">
      <div class="discovery-thumb-sm" style="background-image:url('${thumb}')"></div>
      <div class="discovery-info">
        <strong>${escapeHtml(v.title||'')}</strong>
        <small>${escapeHtml(v.channel||'')} · ${relativeDate(v.publishedAt)}</small>
      </div>
      <div class="discovery-actions">
        <button class="discovery-play" data-play="${v.videoId}">▶</button>
        <button class="discovery-save" data-save="${v.videoId}">♡</button>
        <button class="discovery-open" data-open="${v.videoId}">↗</button>
      </div>
    </div>`;
  }).join('');

  mp?.openSheet?.(`<h2 class="sheet-title">${genre.emoji} Novedades · ${genre.label}</h2>
    <p class="sheet-copy">Lanzamientos y videos recientes</p>
    <div class="discovery-filters">
      <button class="discovery-filter" data-days="7">Últimos 7 días</button>
      <button class="discovery-filter active" data-days="30">Últimos 30 días</button>
      <button class="discovery-filter" data-region="CO">Colombia</button>
    </div>
    <div class="discovery-list">${cards}</div>
    <div class="sheet-stack" style="margin-top:10px">
      <button class="sheet-btn" data-surprise>🎲 Sorpréndeme</button>
    </div>`, root => {
    $$('[data-play]', root).forEach(b => b.onclick = () => {
      const vid = b.dataset.play;
      const v = results.find(r => r.videoId === vid);
      if (v) playDiscoveryVideo(v);
    });
    $$('[data-save]', root).forEach(b => b.onclick = () => {
      const vid = b.dataset.save;
      const v = results.find(r => r.videoId === vid);
      if (v) saveDiscoveryVideo(v);
    });
    $$('[data-open]', root).forEach(b => b.onclick = () => {
      window.open(`https://www.youtube.com/watch?v=${b.dataset.open}`, '_blank', 'noopener');
    });
    $('[data-surprise]', root).onclick = () => {
      const random = results[Math.floor(Math.random() * results.length)];
      if (random) { mp.closeDialog(document.getElementById('sheetDialog')); playDiscoveryVideo(random); }
    };
    $$('.discovery-filter', root).forEach(f => f.onclick = async () => {
      $$('.discovery-filter', root).forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      // Re-fetch with new params
      const days = f.dataset.days ? parseInt(f.dataset.days) : 30;
      const region = f.dataset.region || 'CO';
      mp.closeDialog(document.getElementById('sheetDialog'));
      mp?.showLoader?.('Actualizando…', 'Buscando');
      const newResults = await fetchDiscovery(genreKey, region, days);
      mp?.hideLoader?.();
      if (newResults.length) {
        // Re-open with new results
        const newCards = newResults.slice(0, DISCOVERY_CATEGORY_ITEMS).map(v => {
          const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
          return `<div class="discovery-card-sheet"><div class="discovery-thumb-sm" style="background-image:url('${thumb}')"></div><div class="discovery-info"><strong>${escapeHtml(v.title||'')}</strong><small>${escapeHtml(v.channel||'')} · ${relativeDate(v.publishedAt)}</small></div><div class="discovery-actions"><button class="discovery-play" data-play="${v.videoId}">▶</button><button class="discovery-save" data-save="${v.videoId}">♡</button><button class="discovery-open" data-open="${v.videoId}">↗</button></div></div>`;
        }).join('');
        mp?.openSheet?.(`<h2 class="sheet-title">${genre.emoji} ${genre.label}</h2><div class="discovery-list">${newCards}</div>`, r => {
          $$('[data-play]', r).forEach(b => b.onclick = () => { const v = newResults.find(x => x.videoId === b.dataset.play); if (v) playDiscoveryVideo(v); });
          $$('[data-save]', r).forEach(b => b.onclick = () => { const v = newResults.find(x => x.videoId === b.dataset.save); if (v) saveDiscoveryVideo(v); });
          $$('[data-open]', r).forEach(b => b.onclick = () => window.open(`https://www.youtube.com/watch?v=${b.dataset.open}`, '_blank', 'noopener'));
        });
      }
    });
  });
}

// ─── Set worker URL ─────────────────────────────────────────────
function setWorkerUrl(url) {
  try { localStorage.setItem('mp-discovery-worker-url', url || ''); } catch {}
  DISCOVERY_WORKER_URL = url || '';
}

function getWorkerUrl() { return DISCOVERY_WORKER_URL; }

// ─── Init ───────────────────────────────────────────────────────
function init() {
  if (!DISCOVERY_ENABLED) return;
  // Render home section
  setTimeout(() => renderDiscoveryHome(), 2000);
}

// ─── API ────────────────────────────────────────────────────────
window.MP_DISCOVERY = Object.freeze({
  init, renderDiscoveryHome, openDiscoveryGenre,
  playDiscoveryVideo, saveDiscoveryVideo,
  setWorkerUrl, getWorkerUrl,
  DISCOVERY_GENRES,
});

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { const t = () => { if (window.MP?.state) init(); else setTimeout(t, 200); }; t(); });
} else { const t = () => { if (window.MP?.state) init(); else setTimeout(t, 200); }; t(); }

})();

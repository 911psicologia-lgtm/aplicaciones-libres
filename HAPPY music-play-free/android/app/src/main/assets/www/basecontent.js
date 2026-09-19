// ════════════════════════════════════════════════════════════════
// MP_BASE_CONTENT · R10.25
// Contenido base: Mixes (20 watch URLs canónicos), Podcasts base,
// Playlists base. Importador universal YouTube con clasificación.
// Validación real de mixes. Normalización anti-duplicados.
// ════════════════════════════════════════════════════════════════
(() => {
'use strict';

// ─── Normalización de URLs de YouTube ────────────────────────────
// Extrae videoId o playlistId, ignorando si=, feature=, list= en watch, etc.
function normalizeYouTubeUrl(raw) {
  if (!raw) return { kind: 'invalid', id: '', canonical: '', videoId: '', playlistId: '' };
  const s = String(raw).trim();
  let videoId = '', playlistId = '';
  try {
    const plMatch = s.match(/[?&]list=([A-Za-z0-9_-]{10,})/);
    if (plMatch) playlistId = plMatch[1];
    const vMatch = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/))([A-Za-z0-9_-]{11})/);
    if (vMatch) videoId = vMatch[1];
    if (!videoId && !playlistId && /^[A-Za-z0-9_-]{11}$/.test(s)) videoId = s;
  } catch {}
  if (playlistId && videoId) {
    // Video dentro de playlist — el video es lo reproducible
    return { kind: 'video', id: videoId, canonical: `https://www.youtube.com/watch?v=${videoId}`, videoId, playlistId };
  }
  if (playlistId) return { kind: 'playlist', id: playlistId, canonical: `https://www.youtube.com/playlist?list=${playlistId}`, videoId: '', playlistId };
  if (videoId) return { kind: 'video', id: videoId, canonical: `https://www.youtube.com/watch?v=${videoId}`, videoId, playlistId };
  return { kind: 'invalid', id: '', canonical: '', videoId: '', playlistId };
}

// ─── BASE_MIXES — 20 watch URLs canónicos (R10.25) ──────────────
// Solo watch URLs, sin parámetros si=, feature=, list=, index=.
const BASE_MIXES = Object.freeze([
  { genre: 'Salsa', name: 'Salsa Mix', url: 'https://www.youtube.com/watch?v=v_u7et1joio', accent: '#e74c3c', emoji: '🎵' },
  { genre: 'Country', name: 'Country Mix', url: 'https://www.youtube.com/watch?v=6uTRwOqpWMs', accent: '#d35400', emoji: '🤠' },
  { genre: 'Reggae', name: 'Reggae Mix', url: 'https://www.youtube.com/watch?v=T3CXjqKBLx8', accent: '#27ae60', emoji: '🌴' },
  { genre: 'Rock', name: 'Rock en español', url: 'https://www.youtube.com/watch?v=bY9HLl132uE', accent: '#c0392b', emoji: '🎸' },
  { genre: 'Metal', name: 'Metal Mix', url: 'https://www.youtube.com/watch?v=7Ro2wXsrPjA', accent: '#34495e', emoji: '🤘' },
  { genre: 'Cumbia', name: 'Cumbia Mix', url: 'https://www.youtube.com/watch?v=OZwMjlJ3tSw', accent: '#e67e22', emoji: '💃' },
  { genre: 'Vallenato', name: 'Vallenato Mix', url: 'https://www.youtube.com/watch?v=Pn-gUANHoH8', accent: '#f39c12', emoji: '🎹' },
  { genre: 'Bachata', name: 'Bachata Mix', url: 'https://www.youtube.com/watch?v=klUhowq_xHE', accent: '#e91e63', emoji: '💕' },
  { genre: 'Jazz', name: 'Jazz Mix', url: 'https://www.youtube.com/watch?v=QXoRRWZ6Sp4', accent: '#8e44ad', emoji: '🎷' },
  { genre: 'Pop', name: 'Pop Mix', url: 'https://www.youtube.com/watch?v=j20MqRe7zlo', accent: '#1abc9c', emoji: '✨' },
  { genre: 'Hip-Hop', name: 'Hip-Hop Mix', url: 'https://www.youtube.com/watch?v=k1yAN19a79M', accent: '#2c3e50', emoji: '🎤' },
  { genre: 'EDM', name: 'EDM Mix', url: 'https://www.youtube.com/watch?v=jqsg6tHiiDg', accent: '#9b59b6', emoji: '⚡' },
  { genre: 'Merengue', name: 'Merengue Mix', url: 'https://www.youtube.com/watch?v=nQaZVnFRo_o', accent: '#e74c3c', emoji: '🥁' },
  { genre: 'Reggaetón', name: 'Reggaetón Mix', url: 'https://www.youtube.com/watch?v=-pkluIXf73w', accent: '#d35400', emoji: '🔥' },
  { genre: 'Blues', name: 'Blues Mix', url: 'https://www.youtube.com/watch?v=1eNSWZ4x2ZU', accent: '#2980b9', emoji: '🎺' },
  { genre: 'R&B / Soul', name: 'R&B / Soul Mix', url: 'https://www.youtube.com/watch?v=rtwea8kJmlk', accent: '#c0392b', emoji: '💜' },
  { genre: 'Clásica', name: 'Música clásica', url: 'https://www.youtube.com/watch?v=mB-QXgtoItA', accent: '#34495e', emoji: '🎻' },
  { genre: 'Instrumental', name: 'Instrumental', url: 'https://www.youtube.com/watch?v=ss7EJ-PW2Uk', accent: '#16a085', emoji: '🎼' },
  { genre: 'Folk', name: 'Folk Mix', url: 'https://www.youtube.com/watch?v=duvcKHaLGd0', accent: '#27ae60', emoji: '🪕' },
  { genre: 'Gospel', name: 'Gospel Mix', url: 'https://www.youtube.com/watch?v=1w2aJVLiv_8', accent: '#f1c40f', emoji: '⛪' },
]);

// ─── Estados de validación de mixes ─────────────────────────────
const MIX_STATUS = Object.freeze({
  UNKNOWN: 'unknown',
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  REGION_BLOCKED: 'region_blocked',
  LOAD_ERROR: 'load_error',
});

// Caché de validación: { videoId: { status, checkedAt } }
const mixValidationCache = {};

function getMixStatus(mix) {
  const norm = normalizeYouTubeUrl(mix.url);
  if (norm.kind !== 'video') return MIX_STATUS.UNKNOWN;
  return mixValidationCache[norm.videoId]?.status || MIX_STATUS.UNKNOWN;
}

// Valida un mix usando el mismo sistema de reproducción YouTube de la app.
// Usa fetchYouTubeMeta (oembed) que es ligero y no requiere API key.
async function validateMix(mix) {
  const norm = normalizeYouTubeUrl(mix.url);
  if (norm.kind !== 'video') return MIX_STATUS.UNAVAILABLE;
  const videoId = norm.videoId;
  // Si ya fue validado en los últimos 10 min, no revalidar
  const cached = mixValidationCache[videoId];
  if (cached && cached.checkedAt && (Date.now() - cached.checkedAt) < 10 * 60 * 1000) {
    return cached.status;
  }
  let status = MIX_STATUS.UNKNOWN;
  try {
    // Usar oembed — si responde, el video existe y es accesible
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (r.ok) {
      const d = await r.json();
      status = MIX_STATUS.AVAILABLE;
      // Actualizar metadata del mix si hace falta
      if (d.title && mix.name === mix.genre + ' Mix') {
        // No sobrescribir el nombre visible del mix, pero guardar el título real
        mix._realTitle = d.title;
        mix._realAuthor = d.author_name;
      }
    } else if (r.status === 401 || r.status === 403) {
      status = MIX_STATUS.REGION_BLOCKED;
    } else if (r.status === 404) {
      status = MIX_STATUS.UNAVAILABLE;
    } else {
      status = MIX_STATUS.LOAD_ERROR;
    }
  } catch (e) {
    status = MIX_STATUS.LOAD_ERROR;
  }
  mixValidationCache[videoId] = { status, checkedAt: Date.now() };
  return status;
}

// Valida todos los mixes en segundo plano (no bloquea)
let validationInProgress = false;
async function validateAllMixes() {
  if (validationInProgress) return;
  validationInProgress = true;
  for (const mix of BASE_MIXES) {
    await validateMix(mix);
    // Notificar a la UI para actualizar el estado de la tarjeta
    try { window.dispatchEvent(new CustomEvent('mp:mix-validated', { detail: { mix } })); } catch {}
    // Pequeña pausa entre validaciones para no saturar
    await new Promise(r => setTimeout(r, 200));
  }
  validationInProgress = false;
}

// ─── BASE_PODCASTS — contenidos base de Podcast ──────────────────
const BASE_PODCASTS = Object.freeze([
  { name: 'Pensar la Crianza', url: 'https://youtube.com/playlist?list=PL86wpO3j1AU-2O8Ua7okQqYyKTjB3CyRc', badge: 'PODCAST ORIGINAL', contentType: 'podcast', emoji: '🎙' },
  { name: 'Podcast Base 2', url: 'https://youtube.com/playlist?list=PLk6voQWRP6ky9T37XUEtrTRH2A944YBJd', badge: 'PODCAST', contentType: 'podcast', emoji: '🎙' },
]);

// ─── BASE_PLAYLISTS — playlists base musicales ───────────────────
const BASE_PLAYLISTS = Object.freeze([
  { name: 'Playlist Base 1', url: 'https://youtube.com/playlist?list=PLk6voQWRP6kwSGKPs6j_gHMVGVS20TnpT', contentType: 'music', emoji: '≡' },
  { name: 'Playlist Base 2', url: 'https://youtube.com/playlist?list=PLk6voQWRP6kzXw6_xcITOdRFfze7Wgx0-', contentType: 'music', emoji: '≡' },
  { name: 'Playlist Base 3', url: 'https://youtube.com/playlist?list=PLk6voQWRP6kwudByDCsMhFvB4CCkkDb52', contentType: 'music', emoji: '≡' },
]);

// ─── Gestión de tracks virtuales para mixes ──────────────────────
function ensureMixTrack(mix) {
  const mp = window.MP;
  if (!mp?.state) return null;
  const norm = normalizeYouTubeUrl(mix.url);
  if (norm.kind === 'invalid') return null;

  const existing = mp.state.tracks.find(t =>
    t.sourceKind === 'youtube' && t.remoteId === norm.videoId
  );
  if (existing) {
    existing.isMix = true;
    existing.mixGenre = mix.genre;
    if (!existing.title || existing.title === existing.artist) {
      existing.title = mix.name;
      existing.artist = mix.genre;
    }
    mp.saveRemoteTrack?.(existing);
    return existing.id;
  }

  const track = {
    id: 'mix:video:' + norm.videoId,
    title: mix.name,
    artist: mix.genre,
    album: 'MUSIC PLAY Mezclas',
    genre: mix.genre,
    sourceKind: 'youtube',
    remoteId: norm.videoId,
    remoteUrl: mix.url,
    duration: 0,
    isMix: true,
    mixGenre: mix.genre,
    addedAt: Date.now(),
    favorite: false,
  };
  mp.state.tracks.push(track);
  mp.saveRemoteTrack?.(track);
  return track.id;
}

// Reproduce un mix usando el sistema existente
async function playMix(mix) {
  const mp = window.MP;
  if (!mp?.state) return;
  // Validar antes de reproducir
  const status = await validateMix(mix);
  if (status !== MIX_STATUS.AVAILABLE) {
    mp.toast?.('Mix temporalmente no disponible · reintenta más tarde', 3500);
    return;
  }
  const trackId = ensureMixTrack(mix);
  if (!trackId) return;
  const allMixIds = BASE_MIXES.map(m => ensureMixTrack(m)).filter(Boolean);
  await mp.playTrack(trackId, allMixIds.length > 1 ? allMixIds : [trackId]);
}

// ─── Importador universal de YouTube ─────────────────────────────
// Clasifica una URL importada como Podcast o Playlist musical.
// Devuelve { kind, videoId, playlistId, canonical, needsClassification }
function analyzeImport(raw) {
  const norm = normalizeYouTubeUrl(raw);
  if (norm.kind === 'invalid') return { ...norm, needsClassification: false };
  if (norm.kind === 'video') {
    // Video suelto — no necesita clasificación
    return { ...norm, needsClassification: false, suggestedType: 'music' };
  }
  if (norm.kind === 'playlist') {
    // Playlist — el usuario debe clasificarla
    return { ...norm, needsClassification: true };
  }
  return { ...norm, needsClassification: false };
}

// Importa una playlist de YouTube clasificada como podcast o música.
// Usa getYouTubePlaylistIds() de app.js (que ya existe con paginación).
async function importClassifiedPlaylist(playlistId, name, contentType, options = {}) {
  const mp = window.MP;
  if (!mp?.state) return null;
  // Usar la función existente getYouTubePlaylistIds
  const getter = window.getYouTubePlaylistIds || mp.getYouTubePlaylistIds;
  if (!getter) {
    mp.toast?.('Sistema de importación no disponible', 3500);
    return null;
  }
  mp.showLoader?.(contentType === 'podcast' ? 'Importando podcast…' : 'Importando playlist…', 'Leyendo episodios/canciones');
  mp.updateLoaderProgress?.(0, 1, 'YouTube');
  const result = await getter(playlistId);
  const ids = result.ids || [];
  if (!ids.length) {
    mp.hideLoader?.();
    mp.toast?.('No se pudieron obtener los elementos · queda enlazada para reintentar', 4200);
  }
  const finalName = name || result.title || `YouTube · ${playlistId.slice(0, 18)}`;
  // Crear playlist
  const pl = await mp.createPlaylist?.(finalName);
  if (!pl) { mp.hideLoader?.(); return null; }
  pl.contentType = contentType;
  pl.sourceKind = 'youtube-playlist';
  pl.remoteId = playlistId;
  pl.remoteUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  pl.isBase = !!options.isBase;
  pl.baseBadge = options.badge || '';
  // Source para sincronización
  pl.sources = [{
    id: `src_${Date.now()}`,
    source: 'YouTube',
    url: pl.remoteUrl,
    originalUrl: pl.remoteUrl,
    playlistId,
    importSource: result.source || 'link',
    podcastStatus: result.podcastStatus || '',
    status: ids.length ? 'imported' : 'linked',
    count: ids.length,
    message: ids.length ? '' : (result.error || 'YouTube no expuso el listado'),
    addedAt: Date.now(),
    checkedAt: Date.now(),
  }];
  pl.externalRef = { source: 'YouTube', url: pl.remoteUrl, playlistId };
  // Crear tracks individuales por cada videoId
  const records = [];
  for (let i = 0; i < ids.length; i++) {
    const videoId = ids[i];
    const meta = result.meta?.[videoId] || null;
    const track = {
      id: 'yt:' + videoId,
      title: meta?.title || `${finalName} · ${String(i + 1).padStart(3, '0')}`,
      artist: meta?.artist || meta?.author || finalName,
      sourceKind: 'youtube',
      remoteId: videoId,
      remoteUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: meta?.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      playlistSource: playlistId,
      playlistPosition: i,
      mediaKind: contentType === 'podcast' ? 'podcast' : 'audio',
      duration: meta?.duration || 0,
      addedAt: Date.now(),
      enriched: !!meta?.title,
    };
    // Merge: si el track ya existe (mismo remoteId), reusarlo
    const existing = mp.state.tracks.find(t => t.sourceKind === 'youtube' && t.remoteId === videoId);
    const merged = existing || track;
    if (!existing) {
      mp.state.tracks.push(merged);
      records.push(merged);
    }
    if (!pl.trackIds.includes(merged.id)) pl.trackIds.push(merged.id);
    if (i % 50 === 0) {
      mp.updateLoaderProgress?.(i + 1, Math.max(ids.length, 1), contentType === 'podcast' ? 'preparando episodios' : 'preparando playlist');
      await new Promise(r => setTimeout(r, 0));
    }
  }
  pl.updatedAt = Date.now();
  await mp.persistPlaylist?.(pl);
  // Guardar tracks en bulk
  if (mp.db?.instance && records.length) {
    for (let i = 0; i < records.length; i += 120) {
      try { await mp.db.putMany?.('tracks', records.slice(i, i + 120)); } catch {}
    }
  }
  mp.hideLoader?.();
  mp.toast?.(`${contentType === 'podcast' ? 'Podcast' : 'Playlist'} importado · ${ids.length} ${contentType === 'podcast' ? 'episodios' : 'canciones'}`, 3800);
  return pl;
}

// Diálogo de clasificación Podcast/Música
function promptClassification(url, name, onClassified) {
  const mp = window.MP;
  mp.openSheet?.(`<h2 class="sheet-title">¿Qué tipo de colección es?</h2><p class="sheet-copy">${mp.safeText?.(name || url) || ''}</p><div class="sheet-stack"><button class="sheet-btn" data-ct="podcast">🎙️ Podcast<small>Importar como show con episodios individuales</small></button><button class="sheet-btn" data-ct="music">🎵 Playlist musical<small>Importar como colección de canciones</small></button><button class="sheet-btn" data-ct="cancel">Cancelar</button></div>`, root => {
    root.querySelector('[data-ct="podcast"]').onclick = () => { mp.closeDialog?.(document.getElementById('sheetDialog')); onClassified('podcast'); };
    root.querySelector('[data-ct="music"]').onclick = () => { mp.closeDialog?.(document.getElementById('sheetDialog')); onClassified('music'); };
    root.querySelector('[data-ct="cancel"]').onclick = () => { mp.closeDialog?.(document.getElementById('sheetDialog')); };
  });
}

// ─── Sincronización de playlist ─────────────────────────────────
// Detecta videos nuevos sin duplicar los existentes.
async function syncPlaylist(pl) {
  const mp = window.MP;
  if (!mp?.state || !pl?.externalRef?.playlistId) {
    mp?.toast?.('Esta lista no tiene fuente de YouTube', 3000);
    return;
  }
  const playlistId = pl.externalRef.playlistId;
  const getter = window.getYouTubePlaylistIds || mp.getYouTubePlaylistIds;
  if (!getter) { mp?.toast?.('Sistema de sincronización no disponible', 3500); return; }
  mp.showLoader?.('Actualizando desde YouTube…', 'Buscando nuevos episodios');
  const result = await getter(playlistId);
  const ids = result.ids || [];
  if (!ids.length) {
    mp.hideLoader?.();
    mp.toast?.('No se pudo obtener el listado · reintenta más tarde', 3800);
    return;
  }
  // Detectar nuevos videoIds que no están en pl.trackIds
  const existingVideoIds = new Set(
    pl.trackIds.map(id => mp.state.tracks.find(t => t.id === id)).filter(Boolean).map(t => t.remoteId)
  );
  let added = 0;
  const records = [];
  for (let i = 0; i < ids.length; i++) {
    const videoId = ids[i];
    if (existingVideoIds.has(videoId)) continue;
    // Nuevo episodio/canción
    const meta = result.meta?.[videoId] || null;
    const track = {
      id: 'yt:' + videoId,
      title: meta?.title || `${pl.name} · ${String(i + 1).padStart(3, '0')}`,
      artist: meta?.artist || meta?.author || pl.name,
      sourceKind: 'youtube',
      remoteId: videoId,
      remoteUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: meta?.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      playlistSource: playlistId,
      playlistPosition: i,
      mediaKind: pl.contentType === 'podcast' ? 'podcast' : 'audio',
      duration: meta?.duration || 0,
      addedAt: Date.now(),
      enriched: !!meta?.title,
    };
    const existing = mp.state.tracks.find(t => t.sourceKind === 'youtube' && t.remoteId === videoId);
    const merged = existing || track;
    if (!existing) {
      mp.state.tracks.push(merged);
      records.push(merged);
    }
    if (!pl.trackIds.includes(merged.id)) {
      pl.trackIds.push(merged.id);
      added++;
    }
  }
  // Marcar videos eliminados como UNAVAILABLE (no borrar del historial)
  // Actualizar source
  const src = pl.sources?.[0];
  if (src) {
    src.status = 'imported';
    src.count = ids.length;
    src.checkedAt = Date.now();
    src.importSource = result.source;
  }
  pl.updatedAt = Date.now();
  await mp.persistPlaylist?.(pl);
  if (mp.db?.instance && records.length) {
    for (let i = 0; i < records.length; i += 120) {
      try { await mp.db.putMany?.('tracks', records.slice(i, i + 120)); } catch {}
    }
  }
  mp.hideLoader?.();
  mp.toast?.(`Sincronizado · ${added} nuevos · ${ids.length} total`, 3800);
  mp.render?.();
}

// ─── Mis Mezclas (usuario) ──────────────────────────────────────
function getUserMixes() {
  try { return JSON.parse(localStorage.getItem('mp-user-mixes') || '[]'); } catch { return []; }
}
function saveUserMixes(mixes) {
  try { localStorage.setItem('mp-user-mixes', JSON.stringify(mixes)); } catch {}
}
function createUserMix(name, mixTrackIds) {
  const mixes = getUserMixes();
  const newMix = {
    id: 'usermix:' + Date.now() + ':' + Math.random().toString(36).slice(2, 7),
    name: name || 'Mi mezcla',
    mixIds: mixTrackIds.filter(Boolean),
    createdAt: Date.now(),
  };
  mixes.push(newMix);
  saveUserMixes(mixes);
  return newMix;
}
async function playUserMix(userMix) {
  const mp = window.MP;
  if (!mp?.state || !userMix?.mixIds?.length) return;
  const allTracks = [];
  for (const mixTrackId of userMix.mixIds) {
    const t = mp.state.tracks.find(x => x.id === mixTrackId);
    if (t) allTracks.push(t);
  }
  if (!allTracks.length) return;
  const alternated = allTracks.map(t => t.id);
  if (alternated.length === 1) {
    await mp.playTrack(alternated[0], alternated);
    return;
  }
  await mp.playTrack(alternated[0], alternated);
  for (let i = 1; i < alternated.length; i++) {
    mp.queueTrack?.(alternated[i]);
  }
}

// ─── Sembrado de podcasts y playlists base ──────────────────────
async function seedBaseContent() {
  const mp = window.MP;
  if (!mp?.state) return;
  const seeded = JSON.parse(localStorage.getItem('mp-base-seeded-v2') || '[]');

  // Sembrar podcasts base
  for (const pod of BASE_PODCASTS) {
    const norm = normalizeYouTubeUrl(pod.url);
    if (norm.kind !== 'playlist') continue;
    const existing = mp.state.playlists.find(p =>
      p.externalRef?.playlistId === norm.playlistId
    );
    if (!existing) {
      // Crear playlist vacía primero, importar después en background
      const pl = await mp.createPlaylist?.(pod.name);
      if (pl) {
        pl.contentType = 'podcast';
        pl.sourceKind = 'youtube-playlist';
        pl.remoteId = norm.playlistId;
        pl.remoteUrl = norm.canonical;
        pl.isBase = true;
        pl.baseBadge = pod.badge;
        pl.sources = [{
          id: `src_${Date.now()}_${norm.playlistId}`,
          source: 'YouTube',
          url: norm.canonical,
          originalUrl: pod.url,
          playlistId: norm.playlistId,
          status: 'linked',
          count: 0,
          message: 'Pendiente de importar',
          addedAt: Date.now(),
          checkedAt: Date.now(),
        }];
        pl.externalRef = { source: 'YouTube', url: norm.canonical, playlistId: norm.playlistId };
        await mp.persistPlaylist?.(pl);
        // Importar episodios en background
        if (!seeded.includes(norm.playlistId)) {
          importClassifiedPlaylist(norm.playlistId, pod.name, 'podcast', { isBase: true, badge: pod.badge }).catch(()=>{});
          seeded.push(norm.playlistId);
        }
      }
    } else {
      existing.isBase = true;
      existing.baseBadge = pod.badge;
    }
  }

  // Sembrar playlists base musicales
  for (const pl of BASE_PLAYLISTS) {
    const norm = normalizeYouTubeUrl(pl.url);
    if (norm.kind !== 'playlist') continue;
    const existing = mp.state.playlists.find(p =>
      p.externalRef?.playlistId === norm.playlistId
    );
    if (!existing) {
      const newPl = await mp.createPlaylist?.(pl.name);
      if (newPl) {
        newPl.contentType = 'music';
        newPl.sourceKind = 'youtube-playlist';
        newPl.remoteId = norm.playlistId;
        newPl.remoteUrl = norm.canonical;
        newPl.isBase = true;
        newPl.sources = [{
          id: `src_${Date.now()}_${norm.playlistId}`,
          source: 'YouTube',
          url: norm.canonical,
          originalUrl: pl.url,
          playlistId: norm.playlistId,
          status: 'linked',
          count: 0,
          message: 'Pendiente de importar',
          addedAt: Date.now(),
          checkedAt: Date.now(),
        }];
        newPl.externalRef = { source: 'YouTube', url: norm.canonical, playlistId: norm.playlistId };
        await mp.persistPlaylist?.(newPl);
        if (!seeded.includes(norm.playlistId)) {
          importClassifiedPlaylist(norm.playlistId, pl.name, 'music', { isBase: true }).catch(()=>{});
          seeded.push(norm.playlistId);
        }
      }
    } else {
      existing.isBase = true;
    }
  }

  localStorage.setItem('mp-base-seeded-v2', JSON.stringify(seeded));

  // Validar mixes en background
  setTimeout(() => validateAllMixes(), 5000);
}

// ─── API pública ────────────────────────────────────────────────
window.MP_BASE_CONTENT = Object.freeze({
  BASE_MIXES,
  BASE_PODCASTS,
  BASE_PLAYLISTS,
  MIX_STATUS,
  normalizeYouTubeUrl,
  ensureMixTrack,
  playMix,
  validateMix,
  validateAllMixes,
  getMixStatus,
  getUserMixes,
  createUserMix,
  playUserMix,
  analyzeImport,
  importClassifiedPlaylist,
  promptClassification,
  syncPlaylist,
  seedBaseContent,
});

// Exponer getYouTubePlaylistIds para que basecontent pueda usarlo
// (la función vive en app.js IIFE)
window.getYouTubePlaylistIds = window.getYouTubePlaylistIds || null;

// Auto-seed cuando MP esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const trySeed = () => {
      if (window.MP?.state?.storageReady) seedBaseContent();
      else setTimeout(trySeed, 200);
    };
    trySeed();
  });
} else {
  const trySeed = () => {
    if (window.MP?.state?.storageReady) seedBaseContent();
    else setTimeout(trySeed, 200);
  };
  trySeed();
}

})();

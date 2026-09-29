// ════════════════════════════════════════════════════════════════
// MP_ENERGY · R10.40 — "Tu Energía Musical"
// Análisis de hábitos de escucha: top artistas, sesión express, racha
// ════════════════════════════════════════════════════════════════
(() => {
'use strict';

function renderEnergyHome() {
  const container = document.getElementById('homeEnergy');
  const section = document.getElementById('homeEnergySection');
  if (!container || !section) return;
  const mp = window.MP;
  if (!mp?.state) { section.classList.add('is-hidden'); return; }
  
  const st = mp.state;
  const tracks = st.tracks || [];
  const history = st.history || [];
  
  if (!tracks.length) { section.classList.add('is-hidden'); return; }
  section.classList.remove('is-hidden');
  
  // 1. Top 3 artists from recent history (last 30 days)
  const cutoff = Date.now() - 30 * 86400000;
  const artistCounts = new Map();
  for (const h of history) {
    if ((h.ts || 0) < cutoff) continue;
    const t = tracks.find(x => x.id === h.trackId);
    if (!t || !t.artist) continue;
    const key = t.artist;
    artistCounts.set(key, (artistCounts.get(key) || 0) + 1);
  }
  const topArtists = [...artistCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  
  // 2. Listening streak (consecutive days with at least 1 play)
  const playDays = new Set();
  for (const h of history) {
    if (h.type === 'play' || h.type === 'played' || h.type === 'complete') {
      playDays.add(new Date(h.ts || 0).toDateString());
    }
  }
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (playDays.has(d.toDateString())) streak++;
    else if (i > 0) break; // allow today to be empty
  }
  
  // 3. Total listen time
  const totalMs = (function() {
    let ms = 0;
    for (const t of tracks) ms += (t.totalListenMs || 0);
    return ms;
  })();
  
  // 4. Sesión Express: pick 5 random playable tracks from different artists
  const playable = tracks.filter(t => {
    const p = mp.isPodcastTrack?.(t) || false;
    return !p && (t.sourceKind === 'local' || t.sourceKind === 'direct' || t.sourceKind === 'youtube');
  });
  const expressIds = [];
  const usedArtists = new Set();
  const shuffled = [...playable].sort(() => Math.random() - 0.5);
  for (const t of shuffled) {
    if (expressIds.length >= 5) break;
    const a = (t.artist || '').toLowerCase();
    if (usedArtists.has(a)) continue;
    usedArtists.add(a);
    expressIds.push(t.id);
  }
  
  // Render
  const artistHtml = topArtists.length ? topArtists.map(([name, count]) => {
    const artistTracks = tracks.filter(t => t.artist === name).slice(0, 1);
    const trackId = artistTracks[0]?.id;
    return `<button class="energy-artist" data-energy-play="${trackId || ''}">
      <span class="energy-artist-icon">♪</span>
      <span class="energy-artist-info"><strong>${escHtml(name)}</strong><small>${count} reproducciones</small></span>
      <span class="energy-artist-go">▶</span>
    </button>`;
  }).join('') : '<div class="energy-empty">Escucha más música para ver tus artistas favoritos</div>';
  
  const streakText = streak > 0 ? `🔥 ${streak} día${streak === 1 ? '' : 's'} seguidos` : '🎵 Comienza tu racha hoy';
  const timeText = totalMs > 0 ? mp.formatTime?.(totalMs / 1000) || `${Math.round(totalMs / 60000)}m` : '0m';
  
  container.innerHTML = `
    <div class="energy-grid">
      <div class="energy-stat">
        <span class="energy-stat-num">${streak}</span>
        <span class="energy-stat-label">Días seguidos</span>
      </div>
      <div class="energy-stat">
        <span class="energy-stat-num">${tracks.length}</span>
        <span class="energy-stat-label">Canciones</span>
      </div>
      <div class="energy-stat">
        <span class="energy-stat-num">${timeText}</span>
        <span class="energy-stat-label">Escuchado</span>
      </div>
    </div>
    <div class="energy-artists">${artistHtml}</div>
    ${expressIds.length >= 2 ? `<button class="energy-express" id="energyExpressBtn">⚡ Sesión Express<small>5 canciones aleatorias</small></button>` : ''}
  `;
  
  // Bind events
  container.querySelectorAll('[data-energy-play]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.energyPlay;
      if (id) {
        const ctx = tracks.filter(t => t.artist === topArtists.find(([n]) => n === tracks.find(x => x.id === id)?.artist)?.[0]).map(t => t.id);
        mp.playTrack?.(id, ctx.length ? ctx : [id]);
      }
    };
  });
  const expressBtn = container.querySelector('#energyExpressBtn');
  if (expressBtn) expressBtn.onclick = () => {
    if (expressIds[0]) mp.playTrack?.(expressIds[0], expressIds);
  };
}

function escHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

window.MP_ENERGY = Object.freeze({ renderEnergyHome });

// Auto-render when home is shown
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const t = () => { if (window.MP?.state) setTimeout(renderEnergyHome, 1500); else setTimeout(t, 200); };
    t();
  });
} else {
  const t = () => { if (window.MP?.state) setTimeout(renderEnergyHome, 1500); else setTimeout(t, 200); };
  t();
}

})();

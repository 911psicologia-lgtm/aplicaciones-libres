// ════════════════════════════════════════════════════════════════
// MP_LYRICS · R10.36 — Letra de canciones
// Lee lyrics de ID3 USLT/SYLT tags. Soporta LRC sincronizado.
// Si no hay lyrics embebidos, permite pegar manualmente.
// ════════════════════════════════════════════════════════════════
(() => {
'use strict';

let panel = null, content = null, btn = null;
let isOpen = false;
let syncedLines = []; // [{time: seconds, text: "..."}]
let unsyncedText = '';
let currentTrackId = null;
let syncTimer = null;

function init() {
  panel = document.getElementById('lyricsPanel');
  content = document.getElementById('lyricsContent');
  btn = document.getElementById('lyricsBtn');
  if (!panel || !content || !btn) { setTimeout(init, 500); return; }
  btn.onclick = toggle;
  // Listen for track changes
  window.addEventListener('mp:playstate', () => { if (isOpen) loadCurrent(); });
}

function toggle() {
  isOpen = !isOpen;
  if (panel) panel.classList.toggle('open', isOpen);
  if (btn) btn.classList.toggle('active', isOpen);
  if (isOpen) loadCurrent();
  else stopSync();
}

function loadCurrent() {
  const mp = window.MP;
  if (!mp?.state) return;
  const t = mp.state.tracks?.find(x => x.id === mp.state.currentId);
  if (!t) { showEmpty(); return; }
  if (t.id !== currentTrackId) {
    currentTrackId = t.id;
    syncedLines = [];
    unsyncedText = '';
    parseLyrics(t);
  }
  render();
  if (syncedLines.length) startSync();
}

function parseLyrics(track) {
  // Priority: track.lyrics (from ID3 USLT), track.syncedLyrics (from SYLT or LRC)
  if (track.syncedLyrics) {
    // Parse LRC format: [mm:ss.xx]text
    const lines = track.syncedLyrics.split('\n');
    syncedLines = [];
    for (const line of lines) {
      const matches = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/);
      if (matches) {
        const min = parseInt(matches[1]);
        const sec = parseInt(matches[2]);
        const frac = matches[3] ? parseInt(matches[3]) / 100 : 0;
        const time = min * 60 + sec + frac;
        const text = matches[4] || '';
        syncedLines.push({ time, text });
      }
    }
    syncedLines.sort((a, b) => a.time - b.time);
    return;
  }
  if (track.lyrics) {
    unsyncedText = track.lyrics;
    return;
  }
  // Try to read from localStorage (user-pasted lyrics)
  try {
    const saved = localStorage.getItem('mp-lyrics-' + track.id);
    if (saved) {
      if (saved.includes('[')) {
        // Could be LRC
        const lines = saved.split('\n');
        syncedLines = [];
        for (const line of lines) {
          const m = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/);
          if (m) syncedLines.push({ time: parseInt(m[1])*60+parseInt(m[2])+(m[3]?parseInt(m[3])/100:0), text: m[4]||'' });
        }
        if (syncedLines.length) { syncedLines.sort((a,b)=>a.time-b.time); return; }
      }
      unsyncedText = saved;
      return;
    }
  } catch {}
}

function render() {
  if (!content) return;
  if (syncedLines.length) {
    content.innerHTML = syncedLines.map((l, i) => 
      `<div class="lyrics-line" data-idx="${i}">${escapeHtml(l.text || '♪')}</div>`
    ).join('');
  } else if (unsyncedText) {
    content.innerHTML = unsyncedText.split('\n').map(line => 
      `<div class="lyrics-line">${escapeHtml(line || '♪')}</div>`
    ).join('');
  } else {
    showEmpty();
  }
}

function showEmpty() {
  if (!content) return;
  const mp = window.MP;
  const t = mp?.state?.tracks?.find(x => x.id === mp.state.currentId);
  const name = t ? `${t.title} — ${t.artist||''}` : 'esta canción';
  content.innerHTML = `<div class="lyrics-empty">Sin letra disponible para<br><strong>${escapeHtml(name)}</strong><br><button id="pasteLyricsBtn">📝 Pegar letra</button></div>`;
  const pasteBtn = document.getElementById('pasteLyricsBtn');
  if (pasteBtn) pasteBtn.onclick = () => {
    const text = prompt('Pega la letra de la canción (formato LRC con timestamps si tienes):');
    if (text && text.trim()) {
      try { localStorage.setItem('mp-lyrics-' + (t?.id||''), text.trim()); } catch {}
      currentTrackId = null; // force reload
      loadCurrent();
    }
  };
}

function startSync() {
  stopSync();
  syncTimer = setInterval(updateSync, 500);
  updateSync();
}

function stopSync() {
  if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
}

function updateSync() {
  if (!syncedLines.length || !content) return;
  const mp = window.MP;
  if (!mp?.state) return;
  // Get current playback position
  let pos = 0;
  try {
    const snap = mp.state;
    if (snap.currentEngine === 'youtube' && snap.ytEngine === 'native') {
      // Use native element
    } else if (snap.currentEngine === 'local' || snap.currentEngine === 'direct') {
      const a = snap.els?.audio;
      if (a) pos = a.currentTime || 0;
    }
    // Also check radio
    if (window.MP_LIVE_RADIO?.isActive?.()) return; // Radio doesn't have synced lyrics
  } catch {}
  
  if (pos <= 0) return;
  
  // Find current line
  let currentIdx = -1;
  for (let i = 0; i < syncedLines.length; i++) {
    if (syncedLines[i].time <= pos) currentIdx = i;
    else break;
  }
  
  // Update highlight
  const lines = content.querySelectorAll('.lyrics-line');
  lines.forEach((el, i) => {
    el.classList.remove('active', 'near');
    if (i === currentIdx) el.classList.add('active');
    else if (Math.abs(i - currentIdx) <= 2) el.classList.add('near');
  });
  
  // Auto-scroll to current line
  if (currentIdx >= 0 && lines[currentIdx]) {
    const container = panel;
    const line = lines[currentIdx];
    const offset = line.offsetTop - container.offsetTop - container.clientHeight / 2 + line.clientHeight / 2;
    container.scrollTop = offset;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Extract lyrics from ID3 tags during file import
// Call this when a track is created/updated with file metadata
function extractLyricsFromMetadata(track, metadata) {
  if (!track || !metadata) return;
  // USLT (Unsynchronized lyrics)
  if (metadata.lyrics || metadata.USLT) {
    track.lyrics = metadata.lyrics || metadata.USLT;
  }
  // SYLT (Synchronized lyrics) or LRC
  if (metadata.syncedLyrics || metadata.SYLT || metadata.lrc) {
    track.syncedLyrics = metadata.syncedLyrics || metadata.SYLT || metadata.lrc;
  }
}

window.MP_LYRICS = Object.freeze({
  init, toggle, loadCurrent, extractLyricsFromMetadata,
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setTimeout(init, 1000); });
} else { setTimeout(init, 1000); }

})();

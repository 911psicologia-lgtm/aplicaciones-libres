// ════════════════════════════════════════════════════════════════
// MP_SMART_MICROTICKER · R10.23
// Cinta informativa musical contextual para la cabecera de MUSIC PLAY.
//
// R10.23 correcciones:
//  · EQ SIEMPRE animado: playing=full anim, paused=heartbeat suave,
//    idle=pulse muy lento. Nunca está completamente muerto.
//  · State sync: detecta cuando Radio Live se activa/desactiva y
//    actualiza el ticker inmediatamente (antes se quedaba en la canción local).
//  · Arquitectura: Controller + Queue + Renderer + Sources
// ════════════════════════════════════════════════════════════════
(() => {
'use strict';

const TICKER_MODES = Object.freeze({ off: 'off', discreet: 'discreet', dynamic: 'dynamic' });
const DEFAULT_MODE = TICKER_MODES.discreet;

// ─── Sources ────────────────────────────────────────────────────
const Sources = {
  local() {
    const mp = window.MP;
    if (!mp?.state) return [];
    const st = mp.state;
    // R10.23 · Si Radio Live está activo, NO mostrar info local
    if (window.MP_LIVE_RADIO?.isActive?.()) return [];
    const t = st.tracks?.find(x => x.id === st.currentId);
    if (!t || (t.sourceKind !== 'local' && t.sourceKind !== 'direct')) return [];
    const out = [];
    const artist = t.artist && t.artist !== 'YouTube' ? t.artist : '';
    const title = t.title || '';
    const album = t.album || '';
    const year = t.year || (t.date ? String(t.date).slice(0,4) : '');
    const fmt = (t.format || (t.fileName ? t.fileName.split('.').pop().toUpperCase() : '') || '').toUpperCase();
    const bitrate = t.bitrate ? `${Math.round(t.bitrate/1000)} kbps` : '';
    const pl = st.activePlaylistId ? st.playlists?.find(p => p.id === st.activePlaylistId) : null;

    if (title || artist) {
      out.push({ cat: 'AHORA SUENA', text: [artist, title].filter(Boolean).join(' — '), prio: 30, ttl: 8000, source: 'local' });
    }
    if (mp.state.tickerMode === TICKER_MODES.dynamic) {
      if (album) out.push({ cat: 'ÁLBUM', text: [album, year].filter(Boolean).join(' · '), prio: 50, ttl: 5000, source: 'local' });
      if (fmt || bitrate) out.push({ cat: 'CALIDAD', text: [fmt, bitrate].filter(Boolean).join(' · '), prio: 60, ttl: 5000, source: 'local' });
      if (pl) out.push({ cat: 'PLAYLIST', text: pl.name, prio: 50, ttl: 5000, source: 'local' });
    }
    return out;
  },

  youtube() {
    const mp = window.MP;
    if (!mp?.state) return [];
    const st = mp.state;
    if (window.MP_LIVE_RADIO?.isActive?.()) return [];
    if (st.currentEngine !== 'youtube') return [];
    const t = st.tracks?.find(x => x.id === st.currentId);
    if (!t) return [];
    const out = [];
    const title = t.title || '';
    const channel = (t.artist && t.artist !== 'YouTube') ? t.artist : '';
    if (title) out.push({ cat: 'YOUTUBE', text: [channel, title].filter(Boolean).join(' — '), prio: 30, ttl: 8000, source: 'youtube' });
    if (mp.state.tickerMode === TICKER_MODES.dynamic && channel) {
      out.push({ cat: 'CANAL', text: channel, prio: 50, ttl: 5000, source: 'youtube' });
    }
    return out;
  },

  radio() {
    const r = window.MP_LIVE_RADIO;
    if (!r?.isActive?.()) return [];
    const s = r.state?.station;
    if (!s) return [];
    const out = [];
    const name = s.name || 'Radio';
    const status = r.state?.status || 'idle';

    if (status === 'connecting' || status === 'retrying') {
      out.push({ cat: 'RADIO', text: status === 'retrying' ? 'RECONECTANDO…' : 'CONECTANDO…', prio: 10, ttl: 3000, source: 'radio' });
      return out;
    }
    out.push({ cat: 'RADIO LIVE', text: name, prio: 25, ttl: 8000, source: 'radio' });
    const icy = r.state?.icyTitle || r.state?.icyArtist;
    if (icy) out.push({ cat: 'AHORA SUENA', text: icy, prio: 20, ttl: 6000, source: 'radio' });
    if (window.MP?.state?.tickerMode === TICKER_MODES.dynamic) {
      const br = s.bitrate ? `${s.bitrate} kbps` : '';
      const codec = s.codec || '';
      if (br || codec) out.push({ cat: 'STREAM', text: [codec, br].filter(Boolean).join(' · '), prio: 60, ttl: 5000, source: 'radio' });
    }
    return out;
  },

  system() {
    const mp = window.MP;
    if (!mp?.state) return [];
    const st = mp.state;
    const radioActive = window.MP_LIVE_RADIO?.isActive?.();
    if (st.currentId && !radioActive) return [];
    if (radioActive) return [];
    const out = [];
    out.push({ cat: 'MUSIC PLAY', text: 'FREE HAPPY', prio: 70, ttl: 6000, source: 'system' });
    const pending = st.tracks?.filter(t => {
      const p = mp.isPodcastTrack?.(t) || false;
      const pos = Number(t.lastListenPosition) || 0;
      const dur = Number(t.duration) || 0;
      return p && pos > 5 && dur > 0 && pos < dur * 0.95;
    }).length || 0;
    if (pending > 0) out.push({ cat: 'PENDIENTES', text: `${pending} de escuchar`, prio: 70, ttl: 5000, source: 'system' });
    if (st.playlists?.length) out.push({ cat: 'BIBLIOTECA', text: `${st.tracks.length} canciones · ${st.playlists.length} listas`, prio: 70, ttl: 5000, source: 'system' });
    if (window.MP_LIVE_RADIO?.hasData?.()) out.push({ cat: 'RADIO LIVE', text: 'DISPONIBLE', prio: 70, ttl: 5000, source: 'system' });
    return out;
  },
};

// ─── Queue ──────────────────────────────────────────────────────
const Queue = (() => {
  let current = null;
  let pending = [];
  let lastShownAt = 0;

  function push(msg) {
    if (!msg || !msg.cat) return;
    if (msg.prio === 0) {
      if (current && current.prio < 25) {
        // evento breve → descartar current
      } else if (current) {
        pending.unshift({ ...current, _resume: true });
      }
      current = { ...msg, _event: true };
      lastShownAt = performance.now();
    } else {
      pending.push(msg);
    }
  }

  function next() {
    if (current && current._event && performance.now() - lastShownAt > (current.ttl || 2000)) {
      current = null;
    }
    if (current && performance.now() - lastShownAt < (current.ttl || 5000)) {
      return current;
    }
    current = null;
    pending.sort((a, b) => (a.prio || 99) - (b.prio || 99));
    const next = pending.shift();
    if (next) {
      current = next._resume ? { ...next, _resume: false } : next;
      lastShownAt = performance.now();
      return current;
    }
    return null;
  }

  function clear() { current = null; pending = []; }
  function hasPending() { return pending.length > 0 || current !== null; }
  function forceRefresh() { current = null; pending = []; lastShownAt = 0; }

  return { push, next, clear, hasPending, forceRefresh };
})();

// ─── Renderer ──────────────────────────────────────────────────
const Renderer = (() => {
  let el = null, eqEl = null, catEl = null, textEl = null;
  let scrollRaf = null;
  let lastRenderedKey = '';
  let reducedMotion = false;
  let currentEqState = 'idle';

  function init() {
    el = document.getElementById('mpMicroTicker');
    if (!el) return false;
    eqEl = el.querySelector('.mt-eq');
    catEl = el.querySelector('.mt-cat');
    textEl = el.querySelector('.mt-text');
    reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
    try {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
        reducedMotion = e.matches;
      });
    } catch {}
    return true;
  }

  // R10.23 · EQ SIEMPRE animado:
  //   playing → animación completa (mtEqBar, 6 keyframes, .7-1.1s)
  //   paused  → heartbeat suave (mtEqPulse, 2s, barras al 40-55%)
  //   idle    → pulse muy lento (mtEqIdle, 3s, barras al 20-30%)
  function setEqState(state) {
    currentEqState = state;
    if (!eqEl) return;
    eqEl.classList.remove('playing', 'paused', 'idle');
    void eqEl.offsetWidth; // force reflow
    eqEl.classList.add(state);
    // Reiniciar animación de cada barra
    if (!reducedMotion) {
      eqEl.querySelectorAll('i').forEach(bar => {
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = '';
      });
    }
  }

  function render(msg) {
    if (!el || !catEl || !textEl) return;
    const key = msg ? `${msg.cat}|${msg.text}|${msg._event ? 'e' : 'n'}` : '';
    if (key === lastRenderedKey) return;
    lastRenderedKey = key;

    if (!msg) {
      el.classList.add('mt-empty');
      catEl.textContent = '';
      textEl.textContent = '';
      return;
    }
    el.classList.remove('mt-empty');

    const doSwap = () => {
      catEl.textContent = msg.cat;
      textEl.textContent = msg.text;
      textEl.style.transition = 'none';
      textEl.style.transform = 'translateX(0)';
      textEl.style.opacity = '1';
      requestAnimationFrame(() => maybeScroll());
    };

    if (reducedMotion) {
      doSwap();
    } else {
      el.classList.add('mt-fading');
      setTimeout(() => {
        doSwap();
        el.classList.remove('mt-fading');
      }, 140);
    }
  }

  function maybeScroll() {
    if (!textEl) return;
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      textEl.style.transition = 'none';
      textEl.style.transform = 'translateX(0)';
      const parentWidth = textEl.parentElement.clientWidth - 16;
      const textWidth = textEl.scrollWidth;
      if (textWidth <= parentWidth || reducedMotion) {
        textEl.style.transform = '';
        return;
      }
      const distance = textWidth - parentWidth + 12;
      const duration = Math.min(8000, Math.max(2500, distance * 14));
      setTimeout(() => {
        textEl.style.transition = `transform ${duration}ms linear`;
        textEl.style.transform = `translateX(${-distance}px)`;
      }, 700);
    });
  }

  return { init, render, setEqState };
})();

// ─── Controller ─────────────────────────────────────────────────
const Controller = (() => {
  let initialized = false;
  let pumpTimer = null;
  let collectTimer = null;
  let mode = DEFAULT_MODE;
  let lastRadioActive = null;
  let lastCurrentId = null;
  let lastEngine = null;
  let lastPlaying = null;

  function setMode(m) {
    mode = m;
    const mp = window.MP;
    if (mp?.state) mp.state.tickerMode = m;
    const el = document.getElementById('mpMicroTicker');
    if (el) {
      el.classList.toggle('mt-off', m === TICKER_MODES.off);
      el.classList.toggle('mt-discreet', m === TICKER_MODES.discreet);
      el.classList.toggle('mt-dynamic', m === TICKER_MODES.dynamic);
    }
    if (m === TICKER_MODES.off) {
      Queue.clear();
      Renderer.render(null);
      stopPump();
    } else {
      startPump();
    }
  }

  function getMode() { return mode; }

  function startPump() {
    stopPump();
    if (mode === TICKER_MODES.off) return;
    pumpTimer = setInterval(() => {
      const msg = Queue.next();
      if (msg) Renderer.render(msg);
    }, 250);
    collectTimer = setInterval(() => {
      checkStateChanges();
      if (!Queue.hasPending()) collectFromSources();
    }, 1200);
    collectFromSources();
  }

  function stopPump() {
    if (pumpTimer) { clearInterval(pumpTimer); pumpTimer = null; }
    if (collectTimer) { clearInterval(collectTimer); collectTimer = null; }
  }

  // R10.23 · Detecta cambios de estado y fuerza refresh del ticker
  function checkStateChanges() {
    const mp = window.MP;
    if (!mp?.state) return;
    const st = mp.state;
    const radioActive = window.MP_LIVE_RADIO?.isActive?.();
    const hasContent = st.currentId || radioActive;
    const eqState = st.playing ? 'playing' : (hasContent ? 'paused' : 'idle');
    Renderer.setEqState(eqState);

    // Cambio de Radio Live (activar/desactivar) → forzar refresh inmediato
    if (radioActive !== lastRadioActive) {
      lastRadioActive = radioActive;
      Queue.forceRefresh();
      collectFromSources();
    }
    // Cambio de canción → forzar refresh
    if (st.currentId !== lastCurrentId) {
      lastCurrentId = st.currentId;
      Queue.forceRefresh();
      collectFromSources();
    }
    // Cambio de engine → forzar refresh
    if (st.currentEngine !== lastEngine) {
      lastEngine = st.currentEngine;
      Queue.forceRefresh();
      collectFromSources();
    }
    // Cambio play/pause → emitir evento
    if (lastPlaying !== null && st.playing !== lastPlaying) {
      if (st.playing) event('▶ REANUDACIÓN', '', 1500);
      else event('⏸ PAUSA', '', 1500);
    }
    lastPlaying = st.playing;
  }

  function collectFromSources() {
    if (mode === TICKER_MODES.off) return;
    const msgs = [
      ...Sources.local(),
      ...Sources.youtube(),
      ...Sources.radio(),
      ...Sources.system(),
    ];
    const filtered = mode === TICKER_MODES.discreet
      ? msgs.filter(m => m.prio <= 30)
      : msgs;
    filtered.forEach(m => Queue.push(m));
  }

  function event(category, text, ttl = 2000) {
    if (mode === TICKER_MODES.off) return;
    Queue.push({ cat: category, text, prio: 0, ttl, source: 'event' });
  }

  function wireEvents() {
    const mp = window.MP;
    if (!mp?.state) return;

    // Click delegation para eventos contextuales
    document.addEventListener('click', e => {
      if (mode === TICKER_MODES.off) return;
      const fav = e.target.closest('.row-heart, .mini-favorite, #favoriteBtn, #miniFavoriteBtn');
      if (fav) {
        setTimeout(() => {
          const t = mp.state.tracks?.find(x => x.id === mp.state.currentId);
          if (t) event(t.favorite ? '★ AÑADIDA A FAVORITOS' : '♡ QUITADA DE FAVORITOS', '', 2200);
        }, 80);
      }
      const repeat = e.target.closest('.row-repeat, #repeatCurrentBtn');
      if (repeat) {
        setTimeout(() => {
          const active = mp.state.repeatOneId;
          event(active ? '↻1 REPETIR CANCIÓN' : 'REPETICIÓN DESACTIVADA', '', 2000);
        }, 80);
      }
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) {
        setTimeout(() => {
          const m = mp.state.playbackMode;
          const meta = window.PLAY_MODE_META?.[m];
          if (meta) event(`${meta.icon} MODO ${meta.name.toUpperCase()}`, '', 2000);
        }, 80);
      }
      const next = e.target.closest('#nextBtn, #fullNextBtn, #fmNext');
      const prev = e.target.closest('#prevBtn, #fullPrevBtn, #fmPrev');
      if (next) event('⏭ SIGUIENTE', '', 1500);
      if (prev) event('⏮ ANTERIOR', '', 1500);
    }, true);

    // Float mini
    const origToggleFloat = window.toggleFloatMini;
    if (origToggleFloat) {
      window.toggleFloatMini = function(...args) {
        const wasActive = mp.state.floatMini;
        const r = origToggleFloat.apply(this, args);
        setTimeout(() => {
          if (mp.state.floatMini !== wasActive) {
            event(mp.state.floatMini ? '◱ PANTALLA FLOTANTE' : '⤢ PANTALLA COMPLETA', '', 1800);
          }
        }, 100);
        return r;
      };
    }

    window.addEventListener('mp:playstate', () => {
      checkStateChanges();
    });
  }

  function init() {
    if (initialized) return;
    if (!Renderer.init()) {
      setTimeout(init, 500);
      return;
    }
    initialized = true;
    let savedMode = DEFAULT_MODE;
    try { savedMode = localStorage.getItem('mp-ticker-mode') || DEFAULT_MODE; } catch {}
    setMode(savedMode);
    wireEvents();
    const mp = window.MP;
    if (mp?.state) {
      Renderer.setEqState(mp.state.playing ? 'playing' : 'idle');
    }
  }

  return { init, setMode, getMode, event };
})();

// ─── API pública ────────────────────────────────────────────────
window.MP_SMART_MICROTICKER = Object.freeze({
  init: Controller.init,
  setMode: Controller.setMode,
  getMode: Controller.getMode,
  event: Controller.event,
  modes: TICKER_MODES
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const tryInit = () => {
      if (window.MP?.state) Controller.init();
      else setTimeout(tryInit, 100);
    };
    tryInit();
  });
} else {
  const tryInit = () => {
    if (window.MP?.state) Controller.init();
    else setTimeout(tryInit, 100);
  };
  tryInit();
}

})();

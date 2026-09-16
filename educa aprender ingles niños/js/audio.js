/* ═══════════════════════════════════════════════════════════
   PequeWorld — AUDIO ENGINE (TTS + beeps WebAudio)
   Voz lenta y clara para niños 3-7 años
   ═══════════════════════════════════════════════════════════ */
let _AC = null, _voices = [];
const TTS = {
  ready: !!(window.speechSynthesis && window.SpeechSynthesisUtterance),
  _queue: [], _busy: false,

  init() {
    if (!this.ready) return;
    const load = () => { _voices = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  },

  _bestVoice(lang) {
    if (!_voices.length) return null;
    // v8: la familia puede elegir una voz concreta (solo para el inglés)
    const sel = STATE && STATE.settings && STATE.settings.voiceURI;
    if (sel && String(lang).toLowerCase().startsWith('en')) {
      const chosen = _voices.find(v => v.voiceURI === sel);
      if (chosen) return chosen;
    }
    const lc = lang.toLowerCase();
    const preferred = _voices.filter(v => v.lang.toLowerCase().startsWith(lc.slice(0, 2)));
    const fem = preferred.find(v => /samantha|zira|karen|moira|tessa|fiona|kate|susan|ava|allison|victoria|helena|monica/i.test(v.name));
    if (fem) return fem;
    return preferred[0] || null;
  },

  speak(steps) {
    if (!STATE.settings.voiceEnabled || !this.ready) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}
    this._queue = [...steps];
    this._busy = false;
    this._next();
  },

  _next() {
    if (this._queue.length === 0) { this._busy = false; return; }
    this._busy = true;
    const st = this._queue.shift();
    const u = new SpeechSynthesisUtterance(String(st.text || ''));
    u.lang = st.lang || 'en-US';
    u.rate = st.rate != null ? st.rate : (STATE.settings.voiceRate || 0.82);
    u.pitch = st.pitch != null ? st.pitch : (STATE.settings.voicePitch || 1.15);
    u.volume = 1;
    const v = this._bestVoice(u.lang);
    if (v) u.voice = v;
    u.onend = () => {
      const p = st.pauseMs || 0;
      if (p > 0) setTimeout(() => this._next(), p);
      else this._next();
    };
    u.onerror = () => this._next();
    try { window.speechSynthesis.speak(u); } catch (e) { this._next(); }
  },

  sayWord(en, es, kind) {
    const m = STATE.settings.langMode;
    const rate = STATE.settings.voiceRate || 0.82;
    const pitch = STATE.settings.voicePitch || 1.15;
    if (kind === 'letters') {
      this.speak([
        {text: en, lang:'en-US', rate: 0.75, pitch, pauseMs: 500},
        {text: en, lang:'en-US', rate: 0.7,  pitch, pauseMs: 200},
      ]);
    } else if (m === 'EN') {
      this.speak([{text: en, lang:'en-US', rate, pitch}]);
    } else if (m === 'ES') {
      this.speak([{text: es, lang:'es-ES', rate, pitch}]);
    } else {
      this.speak([
        {text: en, lang:'en-US', rate, pitch, pauseMs: 650},
        {text: es, lang:'es-ES', rate: rate + 0.02, pitch, pauseMs: 0},
      ]);
    }
  },

  sayFeedback(ok) {
    if (!STATE.settings.voiceEnabled || !this.ready) return;
    const rate = STATE.settings.voiceRate || 0.82;
    const pitch = STATE.settings.voicePitch || 1.15;
    if (ok) {
      const phrases = ['Great job!', 'Excellent!', 'Amazing!', 'Well done!', 'Fantastic!'];
      const p = phrases[(Math.random() * phrases.length) | 0];
      this.speak([{text: p, lang:'en-US', rate: rate + 0.05, pitch: pitch + 0.05}]);
    } else {
      this.speak([{text: 'Try again!', lang:'en-US', rate: rate, pitch}]);
    }
  }
};
TTS.init();

/* ── BEEPS ── */
/* v12: los efectos de sonido (beeps) se pueden apagar en Ajustes.
   Por defecto ACTIVADOS (sfx === false significa apagado) para no
   cambiar nada para las familias que ya usan la app. La voz tiene
   su propio interruptor (voiceEnabled) desde siempre. */
function sfxOn() { return !(STATE && STATE.settings && STATE.settings.sfx === false); }
function beep(ok = true) {
  try {
    if (!sfxOn()) return;
    if (!_AC) _AC = new (window.AudioContext || window.webkitAudioContext)();
    if (_AC.state === 'suspended') _AC.resume();
    const t = _AC.currentTime;
    const o = _AC.createOscillator(), g = _AC.createGain();
    o.type = ok ? 'sine' : 'sawtooth';
    o.frequency.value = ok ? 880 : 280;
    g.gain.setValueAtTime(ok ? .16 : .12, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + (ok ? .25 : .35));
    o.connect(g); g.connect(_AC.destination);
    o.start(t); o.stop(t + (ok ? .27 : .37));
    if (ok) {
      const o2 = _AC.createOscillator(), g2 = _AC.createGain();
      o2.type = 'sine'; o2.frequency.value = 1100;
      g2.gain.setValueAtTime(.1, t + .08); g2.gain.exponentialRampToValueAtTime(.0001, t + .3);
      o2.connect(g2); g2.connect(_AC.destination);
      o2.start(t + .08); o2.stop(t + .32);
    }
  } catch (e) {}
}
function beepWin() {
  try {
    if (!sfxOn()) return;
    if (!_AC) _AC = new (window.AudioContext || window.webkitAudioContext)();
    if (_AC.state === 'suspended') _AC.resume();
    const t = _AC.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = _AC.createOscillator(), g = _AC.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.14, t + i * .12); g.gain.exponentialRampToValueAtTime(.001, t + i * .12 + .2);
      o.connect(g); g.connect(_AC.destination);
      o.start(t + i * .12); o.stop(t + i * .12 + .22);
    });
  } catch (e) {}
}
function beepChest() {
  try {
    if (!sfxOn()) return;
    if (!_AC) _AC = new (window.AudioContext || window.webkitAudioContext)();
    if (_AC.state === 'suspended') _AC.resume();
    const t = _AC.currentTime;
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => {
      const o = _AC.createOscillator(), g = _AC.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.13, t + i * .09); g.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .25);
      o.connect(g); g.connect(_AC.destination);
      o.start(t + i * .09); o.stop(t + i * .09 + .27);
    });
  } catch (e) {}
}

/* v11: fanfarria de JACKPOT — arpegio brillante + acorde final sostenido.
   Suena 260ms después de abrir un cofre con premio gordo. */
function beepJackpot() {
  try {
    if (!sfxOn()) return;
    if (!_AC) _AC = new (window.AudioContext || window.webkitAudioContext)();
    if (_AC.state === 'suspended') _AC.resume();
    const t = _AC.currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      const o = _AC.createOscillator(), g = _AC.createGain();
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(.085, t + i * .11); g.gain.exponentialRampToValueAtTime(.001, t + i * .11 + .3);
      o.connect(g); g.connect(_AC.destination);
      o.start(t + i * .11); o.stop(t + i * .11 + .32);
    });
    [1047, 1319, 1568].forEach((f) => {
      const o = _AC.createOscillator(), g = _AC.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.075, t + .62); g.gain.exponentialRampToValueAtTime(.001, t + 1.15);
      o.connect(g); g.connect(_AC.destination);
      o.start(t + .62); o.stop(t + 1.2);
    });
  } catch (e) {}
}

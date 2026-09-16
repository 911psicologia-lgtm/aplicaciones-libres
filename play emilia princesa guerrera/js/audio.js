/* ============================================================
   AUDIO ENGINE - Sonidos sintetizados con Web Audio API
   ============================================================ */

const AudioEngine = {
    ctx: null,
    master: null,
    on: true,
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.35;
            this.master.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('AudioContext no disponible', e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggle() {
        this.on = !this.on;
        if (this.master) {
            this.master.gain.setTargetAtTime(this.on ? 0.35 : 0, this.ctx.currentTime, 0.1);
        }
        return this.on;
    },

    // Sonido base: oscilador con envolvente ADSR simple
    tone(freq, dur, type = 'sine', vol = 1, attack = 0.005, decay = 0.05) {
        if (!this.on || !this.ctx) return;
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(vol, now + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(g);
        g.connect(this.master);
        o.start(now);
        o.stop(now + dur + 0.05);
    },

    // Tono con sweep de frecuencia
    sweep(f1, f2, dur, type = 'sawtooth', vol = 0.5) {
        if (!this.on || !this.ctx) return;
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f1, now);
        o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), now + dur);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(vol, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(g);
        g.connect(this.master);
        o.start(now);
        o.stop(now + dur + 0.05);
    },

    // Ruido blanco para explosiones
    noise(dur, vol = 0.4, filterFreq = 1000) {
        if (!this.on || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bufSize = this.ctx.sampleRate * dur;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        const g = this.ctx.createGain();
        g.gain.value = vol;
        src.connect(filter);
        filter.connect(g);
        g.connect(this.master);
        src.start(now);
    },

    /* ============ SONIDOS DEL JUEGO ============ */

    shoot() {
        this.tone(880, 0.08, 'square', 0.18);
        this.tone(1320, 0.06, 'sine', 0.12);
    },

    shootCombo() {
        this.tone(660, 0.05, 'square', 0.15);
        this.tone(990, 0.05, 'square', 0.15, 0.001, 0.02);
        this.tone(1320, 0.08, 'square', 0.15, 0.001, 0.02);
    },

    enemyHit() {
        this.tone(440, 0.05, 'square', 0.15);
    },

    enemyDie() {
        this.sweep(440, 110, 0.2, 'sawtooth', 0.3);
        this.noise(0.15, 0.2, 800);
    },

    bossHit() {
        this.tone(220, 0.06, 'sawtooth', 0.2);
        this.noise(0.05, 0.15, 1200);
    },

    bossDie() {
        this.sweep(330, 50, 0.8, 'sawtooth', 0.4);
        this.noise(0.6, 0.4, 600);
        setTimeout(() => this.sweep(220, 110, 0.3, 'square', 0.3), 300);
        setTimeout(() => this.tone(660, 0.4, 'sine', 0.3), 600);
    },

    bossSpecial() {
        this.sweep(110, 880, 0.5, 'sawtooth', 0.35);
        this.noise(0.5, 0.3, 400);
    },

    heroHurt() {
        this.sweep(440, 110, 0.4, 'sawtooth', 0.4);
        this.noise(0.3, 0.3, 500);
    },

    powerUp() {
        this.tone(523, 0.08, 'sine', 0.25);
        setTimeout(() => this.tone(659, 0.08, 'sine', 0.25), 70);
        setTimeout(() => this.tone(784, 0.12, 'sine', 0.25), 140);
        setTimeout(() => this.tone(1047, 0.2, 'sine', 0.25), 210);
    },

    coin() {
        this.tone(988, 0.05, 'square', 0.2);
        setTimeout(() => this.tone(1319, 0.1, 'square', 0.2), 50);
    },

    combo() {
        this.tone(523, 0.05, 'sine', 0.2);
        setTimeout(() => this.tone(784, 0.05, 'sine', 0.2), 50);
        setTimeout(() => this.tone(1047, 0.1, 'sine', 0.25), 100);
    },

    comboBig() {
        this.tone(523, 0.08, 'square', 0.25);
        setTimeout(() => this.tone(659, 0.08, 'square', 0.25), 60);
        setTimeout(() => this.tone(784, 0.08, 'square', 0.25), 120);
        setTimeout(() => this.tone(1047, 0.15, 'square', 0.3), 180);
    },

    levelClear() {
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((n, i) => {
            setTimeout(() => this.tone(n, 0.15, 'triangle', 0.25), i * 100);
        });
        setTimeout(() => this.tone(1047, 0.4, 'sine', 0.3), 500);
    },

    gameOver() {
        const notes = [440, 392, 349, 294, 220];
        notes.forEach((n, i) => {
            setTimeout(() => this.tone(n, 0.25, 'sawtooth', 0.3), i * 200);
        });
    },

    victory() {
        const melody = [
            [523, 0], [659, 150], [784, 300], [1047, 450],
            [784, 700], [1047, 850], [1319, 1000]
        ];
        melody.forEach(([f, t]) => {
            setTimeout(() => this.tone(f, 0.2, 'triangle', 0.3), t);
        });
        setTimeout(() => this.tone(1047, 0.6, 'sine', 0.35), 1200);
    },

    obstacleBreak() {
        this.sweep(220, 60, 0.2, 'sawtooth', 0.25);
        this.noise(0.15, 0.2, 1000);
    },

    uiClick() {
        this.tone(880, 0.04, 'square', 0.15);
    },

    uiHover() {
        this.tone(660, 0.03, 'sine', 0.08);
    },

    hangarBuy() {
        this.tone(659, 0.08, 'sine', 0.25);
        setTimeout(() => this.tone(880, 0.08, 'sine', 0.25), 80);
        setTimeout(() => this.tone(1047, 0.15, 'sine', 0.3), 160);
    },

    hangarCant() {
        this.tone(220, 0.15, 'sawtooth', 0.25);
    },

    warning() {
        this.tone(880, 0.1, 'square', 0.2);
        setTimeout(() => this.tone(880, 0.1, 'square', 0.2), 200);
    },

    levelStart() {
        this.tone(440, 0.15, 'triangle', 0.25);
        setTimeout(() => this.tone(660, 0.2, 'triangle', 0.3), 150);
    },

    princessFury() {
        // Sonido épico de combo máximo
        this.sweep(220, 1760, 0.6, 'sawtooth', 0.4);
        this.noise(0.4, 0.3, 2000);
        setTimeout(() => this.tone(1047, 0.3, 'square', 0.3), 400);
        setTimeout(() => this.tone(1319, 0.3, 'square', 0.3), 500);
        setTimeout(() => this.tone(1568, 0.5, 'square', 0.35), 600);
    }
};

window.AudioEngine = AudioEngine;

// ═══════════════════════════════════════════
//   SAI QUEST — Sistema de Audio Ampliado
// ═══════════════════════════════════════════
let AC = null;

function iAC() {
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {
    console.warn('AudioContext not available');
  }
}

function beep(f, d, t='square', g=0.15) {
  if (!AC) return;
  try {
    const o = AC.createOscillator();
    const gn = AC.createGain();
    o.connect(gn);
    gn.connect(AC.destination);
    o.type = t;
    o.frequency.value = f;
    gn.gain.setValueAtTime(g, AC.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + d);
    o.start();
    o.stop(AC.currentTime + d);
  } catch(e) {}
}

function noiseBurst(d=0.1, g=0.05) {
  if (!AC) return;
  try {
    const bufSize = AC.sampleRate * d;
    const buf = AC.createBuffer(1, bufSize, AC.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = AC.createBufferSource();
    src.buffer = buf;
    const gn = AC.createGain();
    gn.gain.setValueAtTime(g, AC.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + d);
    src.connect(gn);
    gn.connect(AC.destination);
    src.start();
  } catch(e) {}
}

function snd(t) {
  if (!AC) iAC();
  switch(t) {
    case 'ok':
      beep(523, .08);
      setTimeout(() => beep(659, .08), 100);
      setTimeout(() => beep(784, .15), 200);
      break;
    case 'no':
      beep(330, .06, 'sawtooth');
      setTimeout(() => beep(220, .2, 'sawtooth'), 80);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .12), i * 110));
      setTimeout(() => noiseBurst(.15, .08), 450);
      break;
    case 'lvl':
      [392, 494, 587, 698, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .12), i * 90));
      setTimeout(() => noiseBurst(.2, .1), 550);
      break;
    case 'clk':
      beep(660, .03, 'sine', 0.08);
      break;
    case 'combo':
      beep(660, .06, 'sine', 0.12);
      setTimeout(() => beep(880, .06, 'sine', 0.12), 60);
      setTimeout(() => beep(1100, .08, 'sine', 0.15), 120);
      break;
    case 'combo_high':
      beep(880, .05, 'sine', 0.12);
      setTimeout(() => beep(1100, .05, 'sine', 0.12), 50);
      setTimeout(() => beep(1320, .05, 'sine', 0.12), 100);
      setTimeout(() => beep(1540, .08, 'sine', 0.15), 150);
      break;
    case 'gameover':
      beep(392, .2, 'triangle', 0.2);
      setTimeout(() => beep(349, .2, 'triangle', 0.18), 200);
      setTimeout(() => beep(330, .3, 'triangle', 0.15), 400);
      setTimeout(() => beep(262, .5, 'triangle', 0.12), 600);
      break;
    case 'badge':
      beep(1200, .08, 'sine', 0.15);
      setTimeout(() => beep(1500, .08, 'sine', 0.15), 80);
      setTimeout(() => beep(1800, .1, 'sine', 0.12), 160);
      setTimeout(() => beep(2100, .15, 'sine', 0.1), 240);
      break;
    case 'streak':
      beep(220, .1, 'sawtooth', 0.08);
      setTimeout(() => beep(330, .08, 'sawtooth', 0.1), 60);
      setTimeout(() => beep(440, .08, 'sawtooth', 0.12), 120);
      setTimeout(() => beep(550, .1, 'sawtooth', 0.1), 180);
      break;
    case 'start':
      beep(440, .1, 'square', 0.12);
      setTimeout(() => beep(554, .1, 'square', 0.12), 100);
      setTimeout(() => beep(659, .15, 'square', 0.15), 200);
      setTimeout(() => beep(880, .2, 'square', 0.12), 300);
      break;
    case 'hover':
      beep(800, .015, 'sine', 0.04);
      break;
    case 'heartbreak':
      beep(600, .04, 'square', 0.1);
      setTimeout(() => beep(400, .06, 'square', 0.08), 40);
      setTimeout(() => beep(250, .1, 'square', 0.06), 80);
      break;
    case 'xp':
      beep(880, .04, 'sine', 0.1);
      setTimeout(() => beep(1100, .04, 'sine', 0.1), 40);
      break;
    case 'coins':
      beep(1200, .03, 'sine', 0.08);
      setTimeout(() => beep(1400, .03, 'sine', 0.08), 30);
      setTimeout(() => beep(1600, .05, 'sine', 0.06), 60);
      break;
    case 'tip':
      beep(440, .05, 'triangle', 0.1);
      setTimeout(() => beep(550, .08, 'triangle', 0.08), 80);
      break;
    case 'perfect':
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => beep(f, .1, 'sine', 0.12), i * 100));
      setTimeout(() => noiseBurst(.2, .1), 600);
      break;
    // NUEVOS SONIDOS
    case 'reinforcement':
      beep(440, .06, 'sine', 0.12);
      setTimeout(() => beep(554, .06, 'sine', 0.12), 80);
      setTimeout(() => beep(659, .08, 'sine', 0.12), 160);
      setTimeout(() => beep(784, .1, 'sine', 0.15), 240);
      setTimeout(() => beep(880, .12, 'sine', 0.15), 320);
      break;
    case 'ref_perfect':
      [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, .1, 'sine', 0.15), i * 100));
      setTimeout(() => noiseBurst(.25, .12), 700);
      setTimeout(() => [2093, 2349, 2637].forEach((f, i) => setTimeout(() => beep(f, .08, 'sine', 0.12), i * 80)), 750);
      break;
        case 'boss_start':
      // Tema dramático de jefe: notas graves descendentes + noise burst
      beep(220, .25, 'sawtooth', 0.2);
      setTimeout(() => beep(185, .25, 'sawtooth', 0.18), 260);
      setTimeout(() => beep(165, .3, 'sawtooth', 0.15), 520);
      setTimeout(() => noiseBurst(.12, .12), 800);
      setTimeout(() => beep(110, .4, 'triangle', 0.2), 850);
      setTimeout(() => noiseBurst(.2, .15), 1200);
      break;
    case 'boss_win':
      // Fanfarria épica de victoria
      [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => beep(f, .12, 'sine', 0.15), i * 90));
      setTimeout(() => noiseBurst(.3, .15), 740);
      setTimeout(() => [1047, 1319, 1568, 2093].forEach((f, i) => setTimeout(() => beep(f, .1, 'sine', 0.12), i * 70)), 900);
      break;
  }
}

document.addEventListener('touchstart', function initAudio() {
  if (!AC) iAC();
  document.removeEventListener('touchstart', initAudio);
}, { once: true });

document.addEventListener('click', function initAudio() {
  if (!AC) iAC();
  document.removeEventListener('click', initAudio);
}, { once: true });

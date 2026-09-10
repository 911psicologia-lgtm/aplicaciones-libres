/* ═══════════════════════════════════════════════════════════
   PequeWorld — EFECTOS: confeti, estrellas, XP flotante, toasts
   ═══════════════════════════════════════════════════════════ */

/* ── CONFETTI ── */
const confCvs = $('confCanvas');
const confCtx = confCvs.getContext('2d');
let confetti = [];
function resizeConf() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  confCvs.width = innerWidth * dpr; confCvs.height = innerHeight * dpr;
  confCvs.style.width = innerWidth + 'px'; confCvs.style.height = innerHeight + 'px';
  confCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeConf, {passive: true}); resizeConf();

function burst(n = 60) {
  const w = innerWidth, h = innerHeight;
  for (let i = 0; i < n; i++) {
    confetti.push({
      x: w * .5 + (Math.random() * 120 - 60), y: h * .3 + (Math.random() * 40 - 20),
      vx: Math.random() * 8 - 4, vy: Math.random() * -12 - 4,
      r: 2 + Math.random() * 5, life: 50 + Math.random() * 40 | 0,
      hue: Math.random() * 360 | 0, a: 1
    });
  }
}
function burstAt(x, y, n = 40) {
  for (let i = 0; i < n; i++) {
    confetti.push({
      x, y,
      vx: Math.random() * 10 - 5, vy: Math.random() * -10 - 3,
      r: 2 + Math.random() * 4, life: 45 + Math.random() * 35 | 0,
      hue: 40 + Math.random() * 30 | 0, a: 1
    });
  }
}
function tickConf() {
  confCtx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.x += p.vx; p.y += p.vy; p.vy += .4; p.life--; p.a = Math.max(0, p.life / 80);
    confCtx.fillStyle = `hsla(${p.hue},90%,60%,${p.a})`;
    confCtx.beginPath(); confCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); confCtx.fill();
    if (p.life <= 0 || p.y > innerHeight + 30) confetti.splice(i, 1);
  }
  requestAnimationFrame(tickConf);
}
tickConf();

/* ── XP FLOTANTE ── */
function floatXP(txt, x, y) {
  const d = document.createElement('div');
  d.className = 'floatxp'; d.textContent = txt;
  d.style.left = (x - 20) + 'px'; d.style.top = y + 'px';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1000);
}

/* ── TOAST ── */
function notif(msg, col) {
  const old = document.querySelector('.notif-toast'); if (old) old.remove();
  const d = document.createElement('div');
  d.className = 'notif-toast';
  d.textContent = msg;
  d.style.borderColor = col || 'rgba(255,215,0,.5)';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2800);
}

/* ── FONDO DE ESTRELLAS ── */
function initStars() {
  const c = $('starsBg');
  for (let i = 0; i < 65; i++) {
    const s = document.createElement('div');
    s.className = 'star-dot';
    const sz = 1 + Math.random() * 2.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--dl:${Math.random()*5}s;opacity:.1`;
    c.appendChild(s);
  }
}

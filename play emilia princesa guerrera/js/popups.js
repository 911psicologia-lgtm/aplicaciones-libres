/* ============================================================
   POPUP MESSAGES - Mensajes emergentes rápidos (0.5s - 2s)
   Estilo comic/cómic con efectos visuales
   ============================================================ */

class PopupMessage {
    constructor(text, opts = {}) {
        this.text = text;
        this.x = opts.x !== undefined ? opts.x : (window.innerWidth / 2);
        this.y = opts.y !== undefined ? opts.y : (window.innerHeight / 2);
        this.vx = opts.vx || 0;
        this.vy = opts.vy !== undefined ? opts.vy : -2;
        this.life = opts.life || 1.0;
        this.maxLife = this.life;
        this.decay = opts.decay || 0.04; // ~0.5s a 60fps
        this.color = opts.color || '#FFD700';
        this.outline = opts.outline || '#000';
        this.size = opts.size || 32;
        this.weight = opts.weight || 'bold';
        this.font = opts.font || 'Trebuchet MS, sans-serif';
        this.style = opts.style || 'comic'; // comic | normal | neon | explosion
        this.rotation = opts.rotation || 0;
        this.rotSpeed = opts.rotSpeed || 0;
        this.scale = 0.3; // empieza pequeño
        this.targetScale = opts.scale || 1.0;
        this.dead = false;
        this.t = 0;
    }

    update() {
        this.t++;
        this.x += this.vx;
        this.y += this.vy;
        this.vy *= 0.97; // desacelera
        this.rotation += this.rotSpeed;
        // Animación de escala: aparece rápido, mantiene, luego desaparece
        if (this.t < 6) {
            this.scale += (this.targetScale - this.scale) * 0.4;
        } else {
            this.scale += (this.targetScale - this.scale) * 0.15;
        }
        this.life -= this.decay;
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        const alpha = Math.min(1, this.life * 2);
        ctx.globalAlpha = alpha;

        const fontSize = this.size;
        ctx.font = `${this.weight} ${fontSize}px ${this.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        switch (this.style) {
            case 'comic':
                this._drawComic(ctx);
                break;
            case 'neon':
                this._drawNeon(ctx);
                break;
            case 'explosion':
                this._drawExplosion(ctx);
                break;
            default:
                this._drawNormal(ctx);
        }
        ctx.restore();
    }

    _drawNormal(ctx) {
        // Outline
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.outline;
        ctx.strokeText(this.text, 0, 0);
        // Fill
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
    }

    _drawComic(ctx) {
        // Estilo comic: borde grueso blanco + negro + relleno color
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#000';
        ctx.strokeText(this.text, 0, 0);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#fff';
        ctx.strokeText(this.text, 0, 0);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
        // Brillo
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `${this.size * 0.85}px ${this.font}`;
        ctx.fillText(this.text, 0, -this.size * 0.08);
    }

    _drawNeon(ctx) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 25;
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color;
        ctx.strokeText(this.text, 0, 0);
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, 0, 0);
    }

    _drawExplosion(ctx) {
        // Estrella/explosión detrás del texto
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        const r = this.size * 1.5;
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const radius = i % 2 === 0 ? r : r * 0.6;
            const px = Math.cos(a) * radius;
            const py = Math.sin(a) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Texto blanco con borde negro
        ctx.font = `bold ${this.size}px ${this.font}`;
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.strokeText(this.text, 0, 0);
        ctx.fillStyle = '#fff';
        ctx.fillText(this.text, 0, 0);
    }
}

const PopupSystem = {
    popups: [],

    /* Crea un popup rápido (0.5s) */
    quick(text, x, y, opts = {}) {
        const p = new PopupMessage(text, {
            x, y,
            life: 0.5,
            decay: 0.06,
            vy: -3,
            style: 'comic',
            color: opts.color || '#FFD700',
            size: opts.size || 28,
            scale: opts.scale || 1.0,
            ...opts
        });
        this.popups.push(p);
        return p;
    },

    /* Popup de combo */
    combo(text, x, y) {
        const p = new PopupMessage(text, {
            x, y,
            life: 1.0,
            decay: 0.025,
            vy: -2,
            style: 'comic',
            color: '#ff6600',
            size: 36,
            scale: 1.2,
            rotation: -0.1,
            rotSpeed: 0.005
        });
        this.popups.push(p);
    },

    /* Popup de bonus / recompensa */
    bonus(text, x, y) {
        const p = new PopupMessage(text, {
            x, y,
            life: 1.5,
            decay: 0.02,
            vy: -1.5,
            style: 'explosion',
            color: '#FFD700',
            size: 42,
            scale: 1.4
        });
        this.popups.push(p);
    },

    /* Popup de impacto (cuando golpeas enemigo) */
    hit(text, x, y, color = '#ffffff') {
        const p = new PopupMessage(text, {
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            life: 0.4,
            decay: 0.08,
            vy: -2,
            vx: (Math.random() - 0.5) * 3,
            style: 'comic',
            color,
            size: 22,
            scale: 0.9,
            rotation: (Math.random() - 0.5) * 0.3
        });
        this.popups.push(p);
    },

    /* Popup de daño crítico */
    crit(x, y) {
        const p = new PopupMessage('CRÍTICO!', {
            x, y,
            life: 0.8,
            decay: 0.04,
            vy: -2.5,
            style: 'explosion',
            color: '#ff0033',
            size: 38,
            scale: 1.5,
            rotation: -0.15,
            rotSpeed: 0.01
        });
        this.popups.push(p);
    },

    /* Popup de racha (streak) */
    streak(count, x, y) {
        const labels = ['', '', 'DOBLE!', 'TRIPLE!', 'CUÁDRUPLE!', 'PENTA!', 'HEXA!', 'ÉPICO!', 'LEGENDARIO!', 'MITOLÓGICO!'];
        const label = labels[Math.min(count, labels.length - 1)] || 'INFINITO!';
        if (!label) return;
        const colors = ['', '', '#FFD700', '#ff6600', '#ff00cc', '#aa00ff', '#ff0033', '#00ffcc', '#88ff00', '#ffffff'];
        const p = new PopupMessage(label, {
            x, y,
            life: 1.2,
            decay: 0.02,
            vy: -1.8,
            style: 'comic',
            color: colors[Math.min(count, colors.length - 1)] || '#fff',
            size: 32 + Math.min(count * 4, 30),
            scale: 1.0 + Math.min(count * 0.1, 0.8),
            rotation: -0.05,
            rotSpeed: 0.005
        });
        this.popups.push(p);
    },

    /* Popup central de advertencia (jefe) */
    warning(text) {
        const p = new PopupMessage(text, {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            life: 1.5,
            decay: 0.015,
            vy: 0,
            style: 'neon',
            color: '#ff0033',
            size: 64,
            scale: 1.5
        });
        this.popups.push(p);
    },

    /* Popup de poder especial activado */
    special(text, x, y) {
        const p = new PopupMessage(text, {
            x, y,
            life: 1.8,
            decay: 0.015,
            vy: -0.5,
            style: 'explosion',
            color: '#ff00cc',
            size: 48,
            scale: 1.6
        });
        this.popups.push(p);
    },

    /* Tick: actualiza y dibuja todos los popups */
    tick(ctx) {
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const p = this.popups[i];
            p.update();
            p.draw(ctx);
            if (p.dead) this.popups.splice(i, 1);
        }
    },

    /* Limpia todos los popups */
    clear() {
        this.popups = [];
    }
};

window.PopupMessage = PopupMessage;
window.PopupSystem = PopupSystem;

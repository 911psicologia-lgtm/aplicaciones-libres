/* ============================================================
   PARTICLES - Sistema de partículas para efectos visuales
   ============================================================ */

class Particle {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.vx = opts.vx !== undefined ? opts.vx : (Math.random() - 0.5) * 12;
        this.vy = opts.vy !== undefined ? opts.vy : (Math.random() - 0.5) * 12;
        this.life = opts.life !== undefined ? opts.life : 1.0;
        this.decay = opts.decay !== undefined ? opts.decay : 0.03;
        this.color = opts.color || '#ffffff';
        this.size = opts.size !== undefined ? opts.size : 3;
        this.gravity = opts.gravity || 0;
        this.shrink = opts.shrink !== undefined ? opts.shrink : 0.97;
        this.glow = opts.glow !== undefined ? opts.glow : true;
        this.shape = opts.shape || 'circle'; // circle | star | square | spark
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
        this.size *= this.shrink;
        this.rotation += this.rotSpeed;
        if (this.life <= 0 || this.size < 0.5) this.dead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
        }
        ctx.fillStyle = this.color;
        switch (this.shape) {
            case 'square':
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
            case 'star':
                this._drawStar(ctx, this.size);
                break;
            case 'spark':
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.size * 0.3;
                ctx.beginPath();
                ctx.moveTo(-this.size, 0);
                ctx.lineTo(this.size, 0);
                ctx.stroke();
                break;
            default:
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
        }
        ctx.restore();
    }

    _drawStar(ctx, r) {
        const spikes = 5;
        let rot = -Math.PI / 2;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * r, Math.sin(rot) * r);
            rot += step;
            ctx.lineTo(Math.cos(rot) * r * 0.4, Math.sin(rot) * r * 0.4);
            rot += step;
        }
        ctx.closePath();
        ctx.fill();
    }
}

/* ============ FACTORÍAS DE PARTÍCULAS ============ */
const ParticleFactory = {
    explosion(ctx, particles, x, y, color = '#ff6600', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const speed = 3 + Math.random() * 8;
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                size: 2 + Math.random() * 4,
                life: 0.8 + Math.random() * 0.4,
                decay: 0.04,
                shape: Math.random() > 0.5 ? 'circle' : 'spark'
            }));
        }
    },

    sparkle(particles, x, y, color = '#FFD700', count = 6) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                color,
                size: 2 + Math.random() * 3,
                life: 1.0,
                decay: 0.02,
                shape: 'star',
                gravity: 0.1
            }));
        }
    },

    trail(particles, x, y, color = '#6ef0ff') {
        particles.push(new Particle(x, y, {
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 2,
            color,
            size: 3 + Math.random() * 2,
            life: 0.5,
            decay: 0.08,
            shrink: 0.95
        }));
    },

    heartBurst(particles, x, y) {
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            particles.push(new Particle(x, y, {
                vx: Math.cos(a) * 5,
                vy: Math.sin(a) * 5 - 2,
                color: '#ff3366',
                size: 4,
                life: 1.0,
                decay: 0.02,
                gravity: 0.2,
                shape: 'circle'
            }));
        }
    },

    ring(particles, x, y, color = '#ffffff', count = 24) {
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            particles.push(new Particle(x, y, {
                vx: Math.cos(a) * 8,
                vy: Math.sin(a) * 8,
                color,
                size: 3,
                life: 0.6,
                decay: 0.05,
                shrink: 0.96
            }));
        }
    },

    shockwave(particles, x, y, color = '#FFD700') {
        for (let i = 0; i < 40; i++) {
            const a = (i / 40) * Math.PI * 2;
            const sp = 10 + Math.random() * 4;
            particles.push(new Particle(x, y, {
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                color,
                size: 4,
                life: 0.8,
                decay: 0.03,
                shrink: 0.97,
                shape: 'spark'
            }));
        }
    },

    magical(particles, x, y, color = '#ff00cc') {
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color,
                size: 3 + Math.random() * 3,
                life: 1.2,
                decay: 0.02,
                shape: Math.random() > 0.5 ? 'star' : 'circle'
            }));
        }
    }
};

window.Particle = Particle;
window.ParticleFactory = ParticleFactory;

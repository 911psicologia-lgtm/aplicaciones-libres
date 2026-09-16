/* ============================================================
   OBSTACLES - Obstáculos en pantalla (dinámicos y estáticos)
   ============================================================ */

class Obstacle {
    constructor(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.type = opts.type || 'asteroid';
        this.size = opts.size || 40;
        this.hp = opts.hp !== undefined ? opts.hp : 30;
        this.maxHp = this.hp;
        this.dead = false;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.05;
        this.damages = opts.damages !== undefined ? opts.damages : true; // daña a la heroína
        this.blocksBullets = opts.blocksBullets !== undefined ? opts.blocksBullets : true;
        this.life = opts.life || 0; // 0 = infinito
        this.dropChance = opts.dropChance || 0.3;
    }

    update(state) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        if (this.life > 0) {
            this.life--;
            if (this.life <= 0) this.dead = true;
        }
        // Sale de pantalla
        if (this.y > state.canvasH + 100 || this.y < -200 ||
            this.x < -200 || this.x > state.canvasW + 200) {
            this.dead = true;
        }
    }

    draw(ctx, t) {
        switch (this.type) {
            case 'asteroid':
                Assets.drawAsteroid(ctx, this.x, this.y, this.size, t + this.rotation * 60);
                break;
            case 'crystal':
                Assets.drawCrystalBarrier(ctx, this.x, this.y, this.size, t);
                break;
            case 'energyWall':
                Assets.drawEnergyWall(ctx, this.x, this.y, this.size * 2, this.size * 0.6, t);
                break;
            case 'spike':
                Assets.drawSpike(ctx, this.x, this.y, this.size, t);
                break;
        }

        // Barra de vida si es dañable
        if (this.hp < this.maxHp && this.hp > 0) {
            const w = this.size * 0.8;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(this.x - w / 2, this.y - this.size * 0.6, w, 3);
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(this.x - w / 2, this.y - this.size * 0.6, w * (this.hp / this.maxHp), 3);
        }
    }
}

const ObstacleFactory = {
    /* Genera obstáculos según el nivel */
    spawn(state) {
        const level = LEVELS[state.levelIdx];
        const r = Math.random();
        if (r < 0.5) {
            // Asteroide cayendo
            return new Obstacle({
                x: Math.random() * state.canvasW,
                y: -50,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2 + state.levelIdx * 0.05,
                type: 'asteroid',
                size: 35 + Math.random() * 25,
                hp: 30 + state.levelIdx * 2,
                life: 0
            });
        } else if (r < 0.8) {
            // Cristal flotante
            return new Obstacle({
                x: Math.random() * state.canvasW,
                y: Math.random() * state.canvasH * 0.6 + state.canvasH * 0.2,
                vx: (Math.random() - 0.5) * 1,
                vy: 0.3,
                type: 'crystal',
                size: 40,
                hp: 50,
                life: 600
            });
        } else if (r < 0.95) {
            // Muro de energía (horizontal)
            return new Obstacle({
                x: state.canvasW / 2,
                y: -50,
                vx: Math.sin(state.frames * 0.01) * 1.5,
                vy: 1,
                type: 'energyWall',
                size: 60,
                hp: 80,
                life: 0
            });
        } else {
            // Espinas laterales
            const side = Math.random() > 0.5 ? -1 : 1;
            return new Obstacle({
                x: side < 0 ? -30 : state.canvasW + 30,
                y: Math.random() * state.canvasH * 0.5 + state.canvasH * 0.3,
                vx: side < 0 ? 2 : -2,
                vy: 0,
                type: 'spike',
                size: 50,
                hp: 60,
                life: 0
            });
        }
    },

    /* Genera elementos flotantes a destruir (cristales, globos, etc.) */
    spawnFloater(state) {
        const types = ['crystal', 'balloon', 'star', 'heart'];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            x: Math.random() * (state.canvasW - 100) + 50,
            y: -30,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 1 + Math.random() * 1.5,
            type,
            hp: 15,
            maxHp: 15,
            size: 30,
            dead: false,
            t: 0,
            isFloater: true,
            damages: false,
            blocksBullets: false,
            scoreValue: 50,
            update(state) {
                this.t++;
                this.x += this.vx + Math.sin(this.t * 0.05) * 0.5;
                this.y += this.vy;
                if (this.y > state.canvasH + 50) this.dead = true;
            },
            draw(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                const pulse = 1 + Math.sin(this.t * 0.1) * 0.08;
                ctx.scale(pulse, pulse);

                if (this.type === 'crystal') {
                    // Cristal flotante
                    ctx.fillStyle = 'rgba(170, 220, 255, 0.9)';
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#aaffff';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.moveTo(0, -15);
                    ctx.lineTo(10, -5);
                    ctx.lineTo(10, 8);
                    ctx.lineTo(0, 15);
                    ctx.lineTo(-10, 8);
                    ctx.lineTo(-10, -5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.beginPath();
                    ctx.moveTo(0, -15);
                    ctx.lineTo(3, -5);
                    ctx.lineTo(-3, -5);
                    ctx.fill();
                } else if (this.type === 'balloon') {
                    // Globo
                    ctx.fillStyle = ['#ff3366', '#6ef0ff', '#ffcc00', '#88ff66'][Math.floor(this.t / 60) % 4];
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.beginPath();
                    ctx.ellipse(-4, -5, 3, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, 15);
                    ctx.quadraticCurveTo(3, 20, 0, 25);
                    ctx.stroke();
                } else if (this.type === 'star') {
                    // Estrella giratoria
                    ctx.fillStyle = '#FFD700';
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 15;
                    ctx.rotate(this.t * 0.05);
                    Assets._drawStar(ctx, 0, 0, 5, 14, 6);
                } else if (this.type === 'heart') {
                    // Corazón
                    ctx.fillStyle = '#ff3366';
                    ctx.shadowColor = '#ff3366';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.moveTo(0, 10);
                    ctx.bezierCurveTo(-15, -5, -10, -15, 0, -5);
                    ctx.bezierCurveTo(10, -15, 15, -5, 0, 10);
                    ctx.fill();
                }
                ctx.restore();
            }
        };
    }
};

window.Obstacle = Obstacle;
window.ObstacleFactory = ObstacleFactory;

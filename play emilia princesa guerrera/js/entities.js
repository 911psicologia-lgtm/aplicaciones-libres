/* ============================================================
   ENTITIES - Bullet, Enemy, Boss, Ally
   ============================================================ */

/* ============ BULLET ============ */
class Bullet {
    constructor(x, y, angle, type = 'NORMAL', isEnemy = false, speed = 18) {
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        this.type = type;
        this.speed = isEnemy ? Math.min(speed, 9) : speed;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.dead = false;
        this.size = isEnemy ? 7 : 10;
        this.damage = this._getDamage(type);
        this.pierce = (type === 'PIERCE') ? 3 : 0;
        this.life = 200; // evita memoria infinita
        this.angle = angle;
        this.t = 0;
    }

    _getDamage(type) {
        const damages = {
            NORMAL: 15,
            TRIPLE: 12,
            KISS: 18,
            ROSE: 22,
            LASER: 8,
            PIERCE: 20,
            BOMB: 30,
            ENEMY: 1,
            BOSS: 1,
            // Tipos elementales
            ICE: 18,
            FIRE: 25,
            LIGHTNING: 14,
            SHADOW: 20,
            LIGHT: 22,
            NATURE: 16
        };
        return damages[type] || 15;
    }

    update(state) {
        this.x += this.vx;
        this.y += this.vy;
        this.t++;
        this.life--;
        if (this.life <= 0 || this.y < -50 || this.y > state.canvasH + 50 ||
            this.x < -50 || this.x > state.canvasW + 50) {
            this.dead = true;
        }
        // Estela de partículas
        if (this.t % 2 === 0 && (this.type === 'KISS' || this.type === 'ROSE' || this.type === 'LASER')) {
            state.particles.push(new Particle(this.x, this.y, {
                vx: -this.vx * 0.1 + (Math.random() - 0.5),
                vy: -this.vy * 0.1 + (Math.random() - 0.5),
                color: this.isEnemy ? '#ff3333' : '#6ef0ff',
                size: 2, life: 0.4, decay: 0.08
            }));
        }
        // Estelas elementales
        if (this.t % 2 === 0 && !this.isEnemy) {
            if (this.type === 'FIRE') {
                // Estela de fuego
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 2,
                    vy: 2 + Math.random() * 2,
                    color: ['#ff6600', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 3)],
                    size: 3 + Math.random() * 2, life: 0.5, decay: 0.06
                }));
            } else if (this.type === 'ICE') {
                // Estela de hielo (cristales pequeños)
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 1,
                    vy: 1 + Math.random(),
                    color: '#aaffff', size: 2, life: 0.4, decay: 0.08, shape: 'star'
                }));
            } else if (this.type === 'LIGHTNING') {
                // Chispas eléctricas
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: '#ffff00', size: 2, life: 0.3, decay: 0.1, shape: 'spark'
                }));
            } else if (this.type === 'SHADOW') {
                // Estela oscura
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    color: '#660099', size: 3, life: 0.5, decay: 0.06
                }));
            } else if (this.type === 'LIGHT') {
                // Destellos de luz
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    color: '#FFD700', size: 2, life: 0.4, decay: 0.07, shape: 'star'
                }));
            } else if (this.type === 'NATURE') {
                // Esporas verdes
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: 1 + Math.random(),
                    color: '#88ff66', size: 2, life: 0.5, decay: 0.06
                }));
            }
        }
    }

    draw(ctx) {
        Assets.drawBullet(ctx, this.x, this.y, this.type, this.t);
    }
}

/* ============ ENEMY (esbirros) ============ */
class Enemy {
    constructor(opts = {}) {
        const level = LEVELS[Game.state.levelIdx];
        this.x = opts.x !== undefined ? opts.x : Math.random() * Game.state.canvasW;
        this.y = opts.y !== undefined ? opts.y : -80;
        this.type = opts.type || level.enemyType;
        this.isBoss = false;
        this.isSubBoss = opts.isSubBoss || false;
        this.size = opts.size || (this.isSubBoss ? 80 : 50);
        this.hp = opts.hp || (this.isSubBoss ? 300 + Game.state.levelIdx * 30 : 25 + Game.state.levelIdx * 4);
        this.maxHp = this.hp;
        this.dead = false;
        this.vy = opts.vy || (3.5 + Game.state.levelIdx * 0.1);
        this.vx = opts.vx || 0;
        this.shootCooldown = opts.shootCooldown || (this.isSubBoss ? 60 : 0);
        this.t = 0;
        this.scoreValue = this.isSubBoss ? 400 : 100;
    }

    update(state) {
        this.t++;
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.t * 0.05) * (this.isSubBoss ? 2 : 1.5);

        // Rebote lateral
        if (this.x < 30) { this.x = 30; this.vx = Math.abs(this.vx); }
        if (this.x > state.canvasW - 30) { this.x = state.canvasW - 30; this.vx = -Math.abs(this.vx); }

        // Disparo esporádico para subjefes
        if (this.isSubBoss && this.shootCooldown > 0) {
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                const angle = Math.atan2(state.hero.y - this.y, state.hero.x - this.x);
                state.entities.push(new Bullet(this.x, this.y, angle, 'ENEMY', true, 5));
                this.shootCooldown = 80 + Math.random() * 40;
            }
        }

        if (this.y > state.canvasH + 100) this.dead = true;
    }

    draw(ctx) {
        Assets.drawEnemy(ctx, this.x, this.y, this.type, this.size, this.t, this.hp / this.maxHp);
    }
}

/* ============ BOSS ============ */
class Boss {
    constructor() {
        const level = LEVELS[Game.state.levelIdx];
        const cfg = Bosses.getBossConfig(level.boss, Game.state.levelIdx);
        this.x = Game.state.canvasW / 2;
        this.y = -150;
        this.isBoss = true;
        this.type = level.boss;
        this.bossName = level.bossName;
        this.bossSpecial = level.bossSpecial;
        this.hp = cfg.hp;
        this.maxHp = cfg.hp;
        this.size = cfg.size;
        this.dead = false;
        this.shootInterval = cfg.shootInterval;
        this.specialInterval = cfg.specialInterval;
        this.specialDuration = cfg.specialDuration;
        this.shootCooldown = cfg.shootInterval;
        this.specialCooldown = cfg.specialInterval;
        this.inSpecial = false;
        this.specialTimer = 0;
        this.cfg = cfg;
        this.t = 0;
    }

    update(state) {
        this.t++;
        if (this.cfg.updateFn) this.cfg.updateFn(this, state);
        else if (this.cfg.update) this.cfg.update(this, state);

        // Disparo normal
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                this._shoot(state);
                this.shootCooldown = this.shootInterval;
            }
        }

        // Poder especial
        if (this.specialCooldown > 0 && !this.inSpecial) {
            this.specialCooldown--;
            if (this.specialCooldown <= 0) {
                this.inSpecial = true;
                this.specialTimer = this.specialDuration;
                if (this.cfg.specialFn) this.cfg.specialFn(this, state);
            }
        }
        if (this.inSpecial) {
            this.specialTimer--;
            if (this.specialTimer <= 0) {
                this.inSpecial = false;
                this.specialCooldown = this.specialInterval;
            }
        }
    }

    _shoot(state) {
        // Disparo básico hacia la heroína
        const angle = Math.atan2(state.hero.y - this.y, state.hero.x - this.x);
        state.entities.push(new Bullet(this.x, this.y + 30, angle, 'BOSS', true, 6));
        // A veces disparo triple
        if (Math.random() > 0.6) {
            state.entities.push(new Bullet(this.x, this.y + 30, angle - 0.2, 'BOSS', true, 6));
            state.entities.push(new Bullet(this.x, this.y + 30, angle + 0.2, 'BOSS', true, 6));
        }
    }

    draw(ctx) {
        // Usa imagen de villano si está disponible, sino fallback a canvas
        if (this.cfg.imageKey && ImageLoader.has(this.cfg.imageKey)) {
            ctx.save();
            // Aura del jefe (pulsante)
            const auraColor = this.inSpecial ? '#ff0033' : '#ff6600';
            const pulse = 0.4 + Math.sin(this.t * 0.1) * 0.2;
            const aura = ctx.createRadialGradient(this.x, this.y, this.size * 0.3, this.x, this.y, this.size * 1.2);
            aura.addColorStop(0, `rgba(255, 100, 0, ${pulse * 0.6})`);
            aura.addColorStop(0.5, `rgba(255, 0, 100, ${pulse * 0.3})`);
            aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Aura de poder especial activo
            if (this.inSpecial) {
                ctx.strokeStyle = `rgba(255, 0, 51, ${0.6 + Math.sin(this.t * 0.4) * 0.3})`;
                ctx.lineWidth = 4;
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 25;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 1.1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + this.size * 0.5, this.size * 0.4, this.size * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();

            // Imagen del villano con glow
            ctx.shadowColor = auraColor;
            ctx.shadowBlur = 20;
            const img = ImageLoader.get(this.cfg.imageKey);
            const aspect = img.height / img.width;
            const w = this.size * 1.6;
            const h = w * aspect;
            ctx.drawImage(img, this.x - w / 2, this.y - h / 2 - this.size * 0.2, w, h);
            ctx.shadowBlur = 0;

            // Corona/diadema dorada sobre el jefe
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            const cy = this.y - this.size * 0.7;
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.3, cy);
            ctx.lineTo(this.x - this.size * 0.3, cy + this.size * 0.1);
            ctx.lineTo(this.x + this.size * 0.3, cy + this.size * 0.1);
            ctx.lineTo(this.x + this.size * 0.3, cy);
            ctx.lineTo(this.x + this.size * 0.2, cy - this.size * 0.05);
            ctx.lineTo(this.x + this.size * 0.1, cy - this.size * 0.15);
            ctx.lineTo(this.x, cy - this.size * 0.05);
            ctx.lineTo(this.x - this.size * 0.1, cy - this.size * 0.15);
            ctx.lineTo(this.x - this.size * 0.2, cy - this.size * 0.05);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Joya roja en la corona
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, cy - this.size * 0.02, this.size * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore();
            return;
        }
        // Fallback al canvas original
        if (this.cfg.drawFn) {
            this.cfg.drawFn(ctx, this.x, this.y, this.size, this.t, this.hp / this.maxHp);
        }
    }
}

/* ============ ALLY (aliados que orbitan a la heroína) ============ */
class Ally {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.shootCooldown = 0;
        this.t = Math.random() * 100;
    }

    update(idx, total, state) {
        this.t++;
        const angle = (state.frames * 0.04) + (idx * (Math.PI * 2 / total));
        this.x = state.hero.x + Math.cos(angle) * 95;
        this.y = state.hero.y + Math.sin(angle) * 95;

        // Disparo sincronizado
        this.shootCooldown--;
        if (this.shootCooldown <= 0) {
            const shots = state.hero.combo > 10 ? 2 : 1;
            for (let i = 0; i < shots; i++) {
                const a = -Math.PI / 2 + (i - (shots - 1) / 2) * 0.2;
                state.entities.push(new Bullet(this.x, this.y, a, state.hero.bulletType, false));
            }
            this.shootCooldown = 14 - (state.upgrades.fireRate * 1);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Mini príncipe / aliado (variante del héroe)
        // Aura
        ctx.fillStyle = 'rgba(110, 240, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        // Cuerpo
        ctx.fillStyle = '#3366ff';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.lineTo(16, 22);
        ctx.lineTo(-16, 22);
        ctx.closePath();
        ctx.fill();
        // Cabeza
        ctx.fillStyle = '#ffdfc4';
        ctx.beginPath();
        ctx.arc(0, -5, 8, 0, Math.PI * 2);
        ctx.fill();
        // Cabello
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, -7, 9, Math.PI, Math.PI * 2);
        ctx.fill();
        // Corona pequeña
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(-6, -11);
        ctx.lineTo(6, -11);
        ctx.lineTo(6, -14);
        ctx.lineTo(3, -10);
        ctx.lineTo(0, -14);
        ctx.lineTo(-3, -10);
        ctx.closePath();
        ctx.fill();
        // Ojos
        ctx.fillStyle = '#1a0050';
        ctx.beginPath();
        ctx.arc(-2.5, -4, 1, 0, Math.PI * 2);
        ctx.arc(2.5, -4, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/* ============ POWERUP ITEM (en pantalla) ============ */
class PowerUpItem {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vy = 2.5;
        this.vx = (Math.random() - 0.5) * 1;
        this.dead = false;
        this.t = 0;
        this.isPowerUp = true;
    }

    update(state) {
        this.t++;
        this.y += this.vy;
        this.x += this.vx;
        // Atracción magnética
        const magnetRange = 80 + state.upgrades.magnetism * 20;
        const dx = state.hero.x - this.x;
        const dy = state.hero.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < magnetRange) {
            this.x += dx / dist * 4;
            this.y += dy / dist * 4;
        }
        if (this.y > state.canvasH + 50) this.dead = true;
    }

    draw(ctx) {
        Assets.drawPowerUp(ctx, this.x, this.y, this.type, this.t);
    }
}

/* ============ COIN ============ */
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -2 - Math.random() * 2;
        this.dead = false;
        this.t = 0;
        this.isCoin = true;
        this.life = 300;
    }

    update(state) {
        this.t++;
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravedad
        this.vx *= 0.99;
        this.life--;
        // Atracción
        const magnetRange = 100 + state.upgrades.magnetism * 25;
        const dx = state.hero.x - this.x;
        const dy = state.hero.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < magnetRange) {
            this.x += dx / dist * 6;
            this.y += dy / dist * 6;
        }
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        Assets.drawCoin(ctx, this.x, this.y, this.t);
    }
}

/* ============ CHEST (cofre con premio) ============ */
class Chest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vy = 1.5;
        this.dead = false;
        this.t = 0;
        this.isChest = true;
        this.hp = 1;
        this.size = 50;
    }

    update(state) {
        this.t++;
        this.y += this.vy;
        if (this.y > state.canvasH + 50) this.dead = true;
    }

    draw(ctx) {
        Assets.drawChest(ctx, this.x, this.y, 50, this.t, false);
    }
}

window.Bullet = Bullet;
window.Enemy = Enemy;
window.Boss = Boss;
window.Ally = Ally;
window.PowerUpItem = PowerUpItem;
window.Coin = Coin;
window.Chest = Chest;

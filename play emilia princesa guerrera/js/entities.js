/* ============================================================
   ENTITIES v5 - Bullet, Enemy (con comportamientos), Boss, Ally
   Más velocidad, más variedad, más adrenalina
   ============================================================ */

/* ============ BULLET ============ */
class Bullet {
    constructor(x, y, angle, type = 'NORMAL', isEnemy = false, speed = 18) {
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        this.type = type;
        // Balas enemigas MÁS LENTAS para público 6-9 años (antes 11, ahora 6)
        this.speed = isEnemy ? Math.min(speed, 6) : speed;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.dead = false;
        this.size = isEnemy ? 7 : 10;
        this.damage = this._getDamage(type);
        this.pierce = (type === 'PIERCE') ? 3 : 0;
        this.life = 200;
        this.angle = angle;
        this.t = 0;
    }

    _getDamage(type) {
        // Daño AUMENTADO para que el jefe sea matable por niñas 6-9
        const damages = {
            NORMAL: 25, TRIPLE: 20, KISS: 30, ROSE: 35, LASER: 15, PIERCE: 32, BOMB: 50,
            ENEMY: 1, BOSS: 1,
            ICE: 30, FIRE: 40, LIGHTNING: 22, SHADOW: 32, LIGHT: 35, NATURE: 26
        };
        return damages[type] || 25;
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
        // Estelas elementales
        if (this.t % 2 === 0 && !this.isEnemy) {
            const trails = {
                FIRE: { color: ['#ff6600', '#ffaa00', '#ffff00'], size: 4, life: 0.5 },
                ICE: { color: ['#aaffff'], size: 2, life: 0.4, shape: 'star' },
                LIGHTNING: { color: ['#ffff00'], size: 2, life: 0.3, shape: 'spark' },
                SHADOW: { color: ['#660099'], size: 3, life: 0.5 },
                LIGHT: { color: ['#FFD700'], size: 2, life: 0.4, shape: 'star' },
                NATURE: { color: ['#88ff66'], size: 2, life: 0.5 },
                KISS: { color: ['#ff6ec7'], size: 2, life: 0.4 },
                ROSE: { color: ['#ff6699'], size: 2, life: 0.4 },
                LASER: { color: ['#6ef0ff'], size: 2, life: 0.4 }
            };
            const trail = trails[this.type];
            if (trail) {
                state.particles.push(new Particle(this.x, this.y, {
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    color: Array.isArray(trail.color) ? trail.color[Math.floor(Math.random() * trail.color.length)] : trail.color,
                    size: trail.size, life: trail.life, decay: 0.06,
                    shape: trail.shape || 'circle'
                }));
            }
        }
    }

    draw(ctx) {
        Assets.drawBullet(ctx, this.x, this.y, this.type, this.t);
    }
}

/* ============ ENEMY - con familias y comportamientos ============ */
class Enemy {
    constructor(opts = {}) {
        const level = LEVELS[Game.state.levelIdx];
        // Define si es menor, medio o mayor
        this.tier = opts.tier || 'minor'; // minor | medium | major | subBoss
        const tierKey = this.tier === 'minor' ? 'enemyMinor' : (this.tier === 'medium' ? 'enemyMedium' : 'enemyMajor');
        const def = level[tierKey];

        this.x = opts.x !== undefined ? opts.x : Math.random() * Game.state.canvasW;
        this.y = opts.y !== undefined ? opts.y : -80;
        this.type = def.type;
        this.name = def.name;
        this.isBoss = false;
        this.isSubBoss = opts.isSubBoss || false;
        this.size = opts.size || (this.tier === 'major' ? 60 : (this.tier === 'medium' ? 50 : 40));
        this.hp = def.hp + (Game.state.levelIdx * 3);
        this.maxHp = this.hp;
        this.dead = false;
        this.baseSpeed = def.speed + (Game.state.levelIdx * 0.05);
        this.vy = this.baseSpeed;
        this.vx = 0;
        this.behavior = def.behavior;
        this.shootInterval = def.shootInterval || 0;
        this.shootCooldown = this.shootInterval ? Math.random() * this.shootInterval : 0;
        this.t = 0;
        this.scoreValue = def.score;
        this.startX = this.x;
        this.angleOffset = Math.random() * Math.PI * 2;
        // Para comportamiento rush
        this.rushTimer = 0;
        this.rushing = false;
    }

    update(state) {
        this.t++;
        // Aplicar comportamiento
        switch (this.behavior) {
            case 'straight':
                this.y += this.baseSpeed;
                break;
            case 'sine':
                this.y += this.baseSpeed;
                this.x = this.startX + Math.sin(this.t * 0.04 + this.angleOffset) * 80;
                break;
            case 'zigzag':
                this.y += this.baseSpeed;
                this.x += Math.sin(this.t * 0.08) * 4;
                // Rebote lateral
                if (this.x < 30) this.x = 30;
                if (this.x > state.canvasW - 30) this.x = state.canvasW - 30;
                break;
            case 'rush':
                // Se acerca despacio, luego embiste
                if (!this.rushing) {
                    this.y += this.baseSpeed * 0.5;
                    this.rushTimer++;
                    if (this.rushTimer > 60 && this.y > 100) {
                        this.rushing = true;
                        // Calcular dirección hacia la heroína
                        const dx = state.hero.x - this.x;
                        const dy = state.hero.y - this.y;
                        const d = Math.hypot(dx, dy);
                        this.vx = (dx / d) * this.baseSpeed * 2;
                        this.vy = (dy / d) * this.baseSpeed * 2;
                    }
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                }
                break;
        }

        // Disparo para enemigos medios
        if (this.shootInterval > 0) {
            this.shootCooldown--;
            if (this.shootCooldown <= 0 && this.y > 0 && this.y < state.canvasH * 0.7) {
                const angle = Math.atan2(state.hero.y - this.y, state.hero.x - this.x);
                state.entities.push(new Bullet(this.x, this.y, angle, 'ENEMY', true, 5));
                this.shootCooldown = this.shootInterval;
                AudioEngine.shoot();
            }
        }

        // Salir de pantalla
        if (this.y > state.canvasH + 100 || this.x < -100 || this.x > state.canvasW + 100) {
            this.dead = true;
        }
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
        const angle = Math.atan2(state.hero.y - this.y, state.hero.x - this.x);
        state.entities.push(new Bullet(this.x, this.y + 30, angle, 'BOSS', true, 6));
        if (Math.random() > 0.5) {
            state.entities.push(new Bullet(this.x, this.y + 30, angle - 0.25, 'BOSS', true, 6));
            state.entities.push(new Bullet(this.x, this.y + 30, angle + 0.25, 'BOSS', true, 6));
        }
    }

    draw(ctx) {
        if (this.cfg.drawFn) {
            this.cfg.drawFn(ctx, this.x, this.y, this.size, this.t, this.hp / this.maxHp);
        }
    }
}

/* ============ ALLY ============ */
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
        // Aura
        ctx.fillStyle = 'rgba(110, 240, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        // Cuerpo príncipe aliado
        ctx.fillStyle = '#3366ff';
        ctx.beginPath();
        ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(16, 22); ctx.lineTo(-16, 22);
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
        // Corona
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.lineTo(-6, -11); ctx.lineTo(6, -11); ctx.lineTo(6, -14);
        ctx.lineTo(3, -10); ctx.lineTo(0, -14); ctx.lineTo(-3, -10);
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

/* ============ HADA COMPAÑERA - compañera emocional de la princesa ============ */
class FairyCompanion {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.t = 0;
        this.mood = 'happy'; // happy | excited | worried | sad | brave
        this.moodTimer = 0;
        this.wingFlap = 0;
        this.commentCooldown = 600; // Comenta cada ~10s
        this.lastComment = null;
    }

    update(state) {
        this.t++;
        this.wingFlap = Math.sin(this.t * 0.5) * 0.3 + 0.7;

        // Posición objetivo: flotar cerca de la princesa
        const offset = Math.sin(this.t * 0.03) * 50;
        this.targetX = state.hero.x + 70 + offset;
        this.targetY = state.hero.y - 40 + Math.sin(this.t * 0.05) * 15;

        // Movimiento suave
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;

        // Actualizar mood según situación
        if (state.hero.invuln > 0) {
            this.setMood('worried');
        } else if (state.bossActive && state.boss) {
            const ratio = state.boss.hp / state.boss.maxHp;
            if (ratio < 0.3) this.setMood('excited');
            else this.setMood('brave');
        } else if (state.hero.combo >= 15) {
            this.setMood('excited');
        } else if (state.hero.lives <= 1) {
            this.setMood('worried');
        } else {
            this.setMood('happy');
        }

        // Decaimiento del mood
        if (this.moodTimer > 0) this.moodTimer--;

        // Comentarios periódicos
        this.commentCooldown--;
        if (this.commentCooldown <= 0) {
            this.sayRandomComment(state);
            this.commentCooldown = 800 + Math.random() * 400;
        }
    }

    setMood(mood) {
        if (this.mood !== mood) {
            this.mood = mood;
            this.moodTimer = 60;
        }
    }

    sayRandomComment(state) {
        const commentsByMood = {
            happy: [
                '¡Eres increíble!',
                '¡Vamos princesa!',
                '¡Qué divertido!',
                '¡Lo estás haciendo genial!',
                '¡YUPI!'
            ],
            excited: [
                '¡WOW!',
                '¡Eres la mejor!',
                '¡Sigue así!',
                '¡Brilla fuerte!',
                '¡INCREÍBLE!'
            ],
            worried: [
                '¡Cuidado!',
                '¡Ten cuidado!',
                '¡Puedes hacerlo!',
                '¡No te rindas!',
                '¡Estoy contigo!'
            ],
            sad: [
                '¡Oh no!',
                '¡Inténtalo de nuevo!',
                '¡No pasa nada!',
                '¡Tú puedes!'
            ],
            brave: [
                '¡Adelante!',
                '¡Derrota al jefe!',
                '¡Casi lo logras!',
                '¡Brave princess!'
            ]
        };
        const comments = commentsByMood[this.mood] || commentsByMood.happy;
        const msg = comments[Math.floor(Math.random() * comments.length)];
        this.lastComment = msg;
        // Popup con el comentario del hada
        PopupSystem.quick(msg, this.x, this.y - 20, {
            color: this._moodColor(),
            size: 18,
            scale: 0.9,
            life: 1.8,
            decay: 0.015,
            style: 'comic'
        });
        // Sonido de hada
        AudioEngine.voiceSparkle();
        // Registrar para logros
        if (window.Achievements) {
            Achievements.onFairyCheer();
        }
    }

    _moodColor() {
        const colors = {
            happy: '#FFD700',
            excited: '#ff00cc',
            worried: '#ff6600',
            sad: '#6ef0ff',
            brave: '#ff3366'
        };
        return colors[this.mood] || '#FFD700';
    }

    /* Comentario inmediato para eventos especiales */
    sayEvent(text, mood = 'excited') {
        this.setMood(mood);
        PopupSystem.bonus(text, this.x, this.y - 30);
        AudioEngine.voiceSparkle();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Aura mágica pulsante
        const auraColor = this._moodColor();
        const pulse = 0.6 + Math.sin(this.t * 0.1) * 0.3;
        const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 25);
        aura.addColorStop(0, this._hexToRgba(auraColor, 0.7 * pulse));
        aura.addColorStop(1, this._hexToRgba(auraColor, 0));
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        // Alas (vibrando)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(-8, -3, 6, 10 * this.wingFlap, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, -3, 6, 10 * this.wingFlap, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Alas más brillantes
        ctx.fillStyle = `rgba(255, 200, 240, ${0.5 * this.wingFlap})`;
        ctx.beginPath();
        ctx.ellipse(-8, -3, 4, 7 * this.wingFlap, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, -3, 4, 7 * this.wingFlap, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo del hada (pequeño)
        const bodyGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
        bodyGrad.addColorStop(0, '#fff');
        bodyGrad.addColorStop(1, auraColor);
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = auraColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cabello
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, -2, 8, Math.PI, Math.PI * 2);
        ctx.fill();

        // Ojos según mood
        ctx.fillStyle = '#1a0050';
        if (this.mood === 'worried' || this.mood === 'sad') {
            // Ojos preocupados
            ctx.beginPath();
            ctx.arc(-2, 0, 1.5, 0, Math.PI * 2);
            ctx.arc(2, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            // Cejas preocupadas
            ctx.strokeStyle = '#1a0050';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-3, -2); ctx.lineTo(-1, -1.5);
            ctx.moveTo(3, -2); ctx.lineTo(1, -1.5);
            ctx.stroke();
        } else if (this.mood === 'excited' || this.mood === 'brave') {
            // Ojos felices (líneas)
            ctx.strokeStyle = '#1a0050';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(-2, 0, 1.5, Math.PI, 0);
            ctx.arc(2, 0, 1.5, Math.PI, 0);
            ctx.stroke();
        } else {
            // Ojos normales
            ctx.beginPath();
            ctx.arc(-2, 0, 1.2, 0, Math.PI * 2);
            ctx.arc(2, 0, 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Brillo
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-1.7, -0.3, 0.4, 0, Math.PI * 2);
            ctx.arc(2.3, -0.3, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Boca según mood
        ctx.strokeStyle = '#1a0050';
        ctx.lineWidth = 0.8;
        ctx.lineCap = 'round';
        if (this.mood === 'happy' || this.mood === 'excited' || this.mood === 'brave') {
            // Sonrisa
            ctx.beginPath();
            ctx.arc(0, 2, 2, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else if (this.mood === 'worried') {
            // Boca "o" preocupada
            ctx.fillStyle = '#1a0050';
            ctx.beginPath();
            ctx.arc(0, 3, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.mood === 'sad') {
            // Boca triste
            ctx.beginPath();
            ctx.arc(0, 4, 2, Math.PI + 0.2, -0.2);
            ctx.stroke();
        }

        // Estela mágica (partículas)
        if (this.t % 5 === 0) {
            // Añadir partícula fuera del ctx.save/restore
        }

        ctx.restore();
    }

    _hexToRgba(hex, alpha) {
        if (hex.startsWith('rgba')) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

/* ============ POWERUP ITEM ============ */
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
        this.vy += 0.15;
        this.vx *= 0.99;
        this.life--;
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

/* ============ CHEST ============ */
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
window.FairyCompanion = FairyCompanion;
window.PowerUpItem = PowerUpItem;
window.Coin = Coin;
window.Chest = Chest;

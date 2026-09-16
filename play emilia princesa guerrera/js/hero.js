/* ============================================================
   HERO - Lógica de la heroína con princesa seleccionable
   ============================================================ */

const Hero = {
    /* Inicializa o resetea la heroína */
    init(state) {
        const def = state.princessDef || PrincessDefs.princess_pink;
        // Calcular vida máxima con pasivos
        let maxLives = 3 + state.upgrades.maxLives;
        if (def.passiveEffect === 'maxLives') {
            maxLives += def.passiveValue;
        }
        state.hero = {
            x: state.canvasW / 2,
            y: state.canvasH * 0.75,
            lives: maxLives,
            maxLives,
            combo: 0,
            comboTimer: 0,
            comboMultiplier: 1 + (def.passiveEffect === 'comboBoost' ? def.passiveValue : 0),
            scoreMultiplier: 1,
            scoreMultiplierTimer: 0,
            fireRateBoost: 1 + (def.passiveEffect === 'fireRateBoost' ? def.passiveValue : 0),
            comboBonus: null,
            comboBonusTimer: 0,
            // Tipo de bala inicial según princesa
            bulletType: def.bulletType || 'NORMAL',
            baseBulletType: def.bulletType || 'NORMAL',
            invuln: 0,
            powers: { triple: 0, kiss: 0, shield: 0, rose: 0, speed: 0, starfall: 0, timeWarp: 0 },
            shootCooldown: 0,
            princessDef: def,
            princessKey: state.princessKey || 'princess_pink',
            // Timers de pasivos
            regenTimer: def.passiveEffect === 'regen' ? def.passiveValue : 0,
            // Tracking de movimiento para animaciones
            lastX: state.canvasW / 2,
            lastY: state.canvasH * 0.75,
            moveSpeed: 0
        };
        // Escudo inicial por mejora
        if (state.upgrades.shieldStart > 0) {
            state.hero.powers.shield = state.upgrades.shieldStart * 180;
        }
        // Pasivo de escudo inicial (princesa_silver)
        if (def.passiveEffect === 'shieldStart') {
            state.hero.powers.shield = Math.max(state.hero.powers.shield, def.passiveValue);
        }
        // Time warp global
        state.timeWarp = 0;
    },

    /* Actualiza la heroína */
    update(state) {
        // Tracking de velocidad
        const dx = state.input.x - state.hero.x;
        const dy = state.input.y - state.hero.y;
        state.hero.moveSpeed = Math.hypot(dx, dy);

        // Movimiento (interpolación hacia el input)
        let speedMult = 1 + state.upgrades.speed * 0.08;
        if (state.hero.princessDef.passiveEffect === 'speedBoost') {
            speedMult += state.hero.princessDef.passiveValue;
        }
        state.hero.x += (state.input.x - state.hero.x) * 0.25 * speedMult;
        state.hero.y += (state.input.y - state.hero.y) * 0.25 * speedMult;
        // Limitar a pantalla
        state.hero.x = Math.max(30, Math.min(state.canvasW - 30, state.hero.x));
        state.hero.y = Math.max(60, Math.min(state.canvasH - 30, state.hero.y));

        // Invulnerabilidad post-daño
        if (state.hero.invuln > 0) state.hero.invuln--;

        // Regeneración de vida (princesa_light)
        if (state.hero.regenTimer > 0) {
            state.hero.regenTimer--;
            if (state.hero.regenTimer <= 0 && state.hero.lives < state.hero.maxLives) {
                state.hero.lives++;
                state.hero.regenTimer = state.hero.princessDef.passiveValue;
                PopupSystem.quick('+1 VIDA', state.hero.x, state.hero.y - 50, {
                    color: '#ff3366', size: 24, scale: 1.2
                });
                ParticleFactory.heartBurst(state.particles, state.hero.x, state.hero.y);
                AudioEngine.powerUp();
            }
        }

        // Disparo automático
        state.hero.shootCooldown--;
        if (state.hero.shootCooldown <= 0) {
            this.shoot(state);
            const baseRate = 7;
            const speedBoost = state.hero.powers.speed > 0 ? 1.8 : 1;
            const totalBoost = speedBoost * state.hero.fireRateBoost * (1 + state.upgrades.fireRate * 0.05);
            state.hero.shootCooldown = Math.max(2, baseRate / totalBoost);
        }
    },

    /* Dispara proyectiles con tipo elemental de la princesa */
    shoot(state) {
        const bulletType = state.hero.bulletType;
        const def = state.hero.princessDef;
        // Multishot por mejora
        const multishot = state.upgrades.multishot;
        // Triple por power-up o combo bonus
        const tripleActive = state.hero.powers.triple > 0 || state.hero.comboBonus === 'tripleRose' || state.hero.comboBonus === 'wrath' || state.hero.comboBonus === 'fury';

        let shots = 1;
        if (tripleActive) shots = 3;
        shots += multishot;
        if (state.hero.combo > 15) shots = Math.min(shots + 1, 6);

        const spread = 0.15;
        for (let i = 0; i < shots; i++) {
            const offset = (i - (shots - 1) / 2) * spread;
            const angle = -Math.PI / 2 + offset;
            const b = new Bullet(state.hero.x, state.hero.y - 30, angle, bulletType, false);
            // Aplicar mejoras
            b.damage *= (1 + state.upgrades.damage * 0.1);
            // Pasivo de daño boost (princesa_fire, etc)
            if (def.passiveEffect === 'damageBoost') {
                b.damage *= (1 + def.passiveValue);
            }
            if (state.upgrades.pierce > 0 && bulletType !== 'PIERCE') {
                b.pierce = state.upgrades.pierce;
            }
            // Crítico
            const critChance = state.upgrades.critChance * 0.08;
            if (Math.random() < critChance) {
                b.damage *= 2.5;
                b.size = 14;
                b.crit = true;
            }
            state.entities.push(b);
        }
        // Sonido
        if (state.hero.combo > 5) {
            AudioEngine.shootCombo();
        } else {
            AudioEngine.shoot();
        }
    },

    /* Recibe daño (con pasivo de reducción de daño) */
    hurt(state) {
        if (state.hero.invuln > 0) return;
        const def = state.hero.princessDef;
        if (state.hero.powers.shield > 0) {
            // El escudo absorbe
            ParticleFactory.ring(state.particles, state.hero.x, state.hero.y, '#6ef0ff', 16);
            PopupSystem.quick('BLOQUEO!', state.hero.x, state.hero.y - 50, {
                color: '#6ef0ff', size: 26, scale: 1.2
            });
            return;
        }
        // Pasivo de reducción de daño (princesa_ice): probabilidad de evitar daño
        if (def.passiveEffect === 'damageReduction' && Math.random() < def.passiveValue) {
            PopupSystem.quick('ESQUIVA!', state.hero.x, state.hero.y - 50, {
                color: '#aaffff', size: 26, scale: 1.2
            });
            ParticleFactory.ring(state.particles, state.hero.x, state.hero.y, '#aaffff', 12);
            return;
        }
        state.hero.lives--;
        state.hero.invuln = 90;
        AudioEngine.heroHurt();
        ParticleFactory.explosion(null, state.particles, state.hero.x, state.hero.y, '#ff3366', 16);
        PopupSystem.quick('¡AY!', state.hero.x, state.hero.y - 50, {
            color: '#ff3366', size: 32, scale: 1.4
        });
        // Reset combo
        ComboSystem.reset(state);
        UI.showMotivation('¡AY!');
        if (state.hero.lives <= 0) {
            Game.gameOver();
        }
    },

    /* Dibuja la heroína con movilidad */
    draw(ctx, state) {
        const t = state.frames;
        // Escudo
        if (state.hero.powers.shield > 0) {
            const a = 0.5 + Math.sin(t * 0.2) * 0.3;
            // Burbuja cristalina con hexágonos
            ctx.strokeStyle = `rgba(110, 240, 255, ${a})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(state.hero.x, state.hero.y, 60, 0, Math.PI * 2);
            ctx.stroke();
            // Patrón hexagonal
            ctx.strokeStyle = `rgba(170, 220, 255, ${a * 0.5})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const a1 = (i / 6) * Math.PI * 2 + t * 0.02;
                const a2 = ((i + 1) / 6) * Math.PI * 2 + t * 0.02;
                ctx.beginPath();
                ctx.moveTo(state.hero.x + Math.cos(a1) * 60, state.hero.y + Math.sin(a1) * 60);
                ctx.lineTo(state.hero.x + Math.cos(a2) * 60, state.hero.y + Math.sin(a2) * 60);
                ctx.stroke();
            }
            // Anillo exterior más sutil
            ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(state.hero.x, state.hero.y, 65, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Heroína con movilidad y expresiones
        Assets.drawHeroine(ctx, state.hero.x, state.hero.y, 60, t, state.hero.invuln > 0, state.hero.princessKey, state);

        // Estela mágica al moverse
        if (state.hero.moveSpeed > 20 && t % 2 === 0) {
            state.particles.push(new Particle(state.hero.x, state.hero.y + 20, {
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2,
                color: state.hero.princessDef.bulletColor || '#ff9ed6',
                size: 3,
                life: 0.5,
                decay: 0.06
            }));
        }
    }
};

window.Hero = Hero;

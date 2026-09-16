/* ============================================================
   BOSSES - 20 jefes con poderes especiales animados
   Cada jefe tiene: dibujo canvas, patrón de ataque, poder especial
   ============================================================ */

const Bosses = {
    /* Mapeo de tipos de jefe a imágenes de villanos */
    bossImageMap: {
        slimeKing: 'villain_01',
        queenBee: 'villain_02',
        fireDemon: 'villain_03',
        iceQueen: 'villain_04',
        robotOverlord: 'villain_05',
        cookieMonster: 'villain_06',
        kraken: 'villain_01',
        sandWorm: 'villain_02',
        tigerKing: 'villain_03',
        ghostKing: 'villain_04',
        cloudGiant: 'villain_05',
        alienMother: 'villain_06',
        roseQueen: 'villain_01',
        gemDragon: 'villain_02',
        sunGod: 'villain_03',
        dragonLord: 'villain_04',
        swampWitch: 'villain_05',
        toyMaster: 'villain_06',
        crystalSage: 'villain_01',
        darkEmpress: 'villain_02'
    },

    /* ============ FACTORÍA: devuelve configuración del jefe ============ */
    getBossConfig(type, levelIdx) {
        const cfg = this._defs[type] || this._defs.slimeKing;
        const baseHp = 1200 + levelIdx * 350;
        return {
            type,
            hp: baseHp,
            maxHp: baseHp,
            size: 110,
            shootInterval: cfg.shootInterval || 35,
            specialInterval: cfg.specialInterval || 220,
            specialDuration: cfg.specialDuration || 90,
            drawFn: cfg.draw,
            specialFn: cfg.special,
            updateFn: cfg.update || this._defaultUpdate,
            imageKey: this.bossImageMap[type] || 'villain_01'
        };
    },

    _defaultUpdate(boss, state) {
        boss.y = Math.min(boss.y + 1.5, 140);
        boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
    },

    /* ============ DEFINICIONES DE JEFES ============ */
    _defs: {
        /* 1. REY SLIME */
        slimeKing: {
            shootInterval: 35,
            specialInterval: 200,
            specialDuration: 80,
            update(boss, state) {
                boss.y = Math.min(boss.y + 1.5, 140);
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
                // Bobbing
                boss.bobY = Math.sin(state.frames * 0.1) * 8;
            },
            draw(ctx, x, y, size, t, hpRatio) {
                const bob = Math.sin(t * 0.1) * 8;
                ctx.save();
                ctx.translate(x, y + bob);
                const grad = ctx.createRadialGradient(0, -10, 10, 0, 0, size * 0.6);
                grad.addColorStop(0, '#aaffaa');
                grad.addColorStop(0.5, '#33aa55');
                grad.addColorStop(1, '#0a3315');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.55, size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Brillos
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.ellipse(-size * 0.2, -size * 0.25, size * 0.12, size * 0.07, 0, 0, Math.PI * 2);
                ctx.fill();
                // Corona real
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#b8860b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.45);
                ctx.lineTo(-size * 0.3, -size * 0.3);
                ctx.lineTo(size * 0.3, -size * 0.3);
                ctx.lineTo(size * 0.3, -size * 0.45);
                ctx.lineTo(size * 0.2, -size * 0.35);
                ctx.lineTo(size * 0.1, -size * 0.5);
                ctx.lineTo(0, -size * 0.35);
                ctx.lineTo(-size * 0.1, -size * 0.5);
                ctx.lineTo(-size * 0.2, -size * 0.35);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Ojos grandes
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.05, size * 0.1, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.05, size * 0.1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.13, -size * 0.05, size * 0.05, 0, Math.PI * 2);
                ctx.arc(size * 0.13, -size * 0.05, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
                // Boca grande
                ctx.fillStyle = '#220';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.2, size * 0.2, size * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
                // Dientes
                ctx.fillStyle = '#fff';
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * size * 0.07, size * 0.12);
                    ctx.lineTo(i * size * 0.07 + size * 0.03, size * 0.18);
                    ctx.lineTo(i * size * 0.07 + size * 0.06, size * 0.12);
                    ctx.fill();
                }
                ctx.restore();
            },
            special(boss, state) {
                // División: lanza mini-slimes en abanico
                state.entities.push({
                    x: boss.x, y: boss.y, isEnemy: true, type: 'miniSlime',
                    vx: -4, vy: 2, hp: 30, maxHp: 30, size: 30, dead: false,
                    update() { this.x += this.vx; this.y += this.vy; this.vx *= 0.99; if (this.y > state.canvasH) this.dead = true; },
                    draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'slime', this.size, state.frames, this.hp / this.maxHp); }
                });
                state.entities.push({
                    x: boss.x, y: boss.y, isEnemy: true, type: 'miniSlime',
                    vx: 0, vy: 3, hp: 30, maxHp: 30, size: 30, dead: false,
                    update() { this.x += this.vx; this.y += this.vy; if (this.y > state.canvasH) this.dead = true; },
                    draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'slime', this.size, state.frames, this.hp / this.maxHp); }
                });
                state.entities.push({
                    x: boss.x, y: boss.y, isEnemy: true, type: 'miniSlime',
                    vx: 4, vy: 2, hp: 30, maxHp: 30, size: 30, dead: false,
                    update() { this.x += this.vx; this.y += this.vy; this.vx *= 0.99; if (this.y > state.canvasH) this.dead = true; },
                    draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'slime', this.size, state.frames, this.hp / this.maxHp); }
                });
                AudioEngine.bossSpecial();
                UI.showBossCast('¡DIVISIÓN BABOSA!');
            }
        },

        /* 2. REINA ABEJA */
        queenBee: {
            shootInterval: 30,
            specialInterval: 180,
            update(boss, state) {
                boss.y = 100 + Math.sin(state.frames * 0.04) * 40;
                boss.x = state.canvasW / 2 + Math.cos(state.frames * 0.03) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                const wing = Math.sin(t * 0.6) * 0.3 + 0.7;
                // Alas gigantes
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath();
                ctx.ellipse(-size * 0.45, -size * 0.4, size * 0.3, size * 0.15 * wing, -0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(size * 0.45, -size * 0.4, size * 0.3, size * 0.15 * wing, 0.5, 0, Math.PI * 2);
                ctx.fill();
                // Cuerpo
                const grad = ctx.createRadialGradient(0, -size * 0.2, 5, 0, 0, size * 0.5);
                grad.addColorStop(0, '#FFD700');
                grad.addColorStop(1, '#996600');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Rayas
                ctx.fillStyle = '#000';
                for (let i = -2; i <= 2; i++) {
                    ctx.fillRect(-size * 0.38, i * size * 0.13, size * 0.76, size * 0.05);
                }
                // Corona
                ctx.fillStyle = '#ff00cc';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, -size * 0.55, size * 0.18, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Ojos compuestos
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.3, size * 0.08, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.3, size * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff0';
                ctx.beginPath();
                ctx.arc(-size * 0.13, -size * 0.32, size * 0.03, 0, Math.PI * 2);
                ctx.arc(size * 0.13, -size * 0.32, size * 0.03, 0, Math.PI * 2);
                ctx.fill();
                // Aguijón gigante
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.moveTo(0, size * 0.5);
                ctx.lineTo(-size * 0.08, size * 0.7);
                ctx.lineTo(size * 0.08, size * 0.7);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Enjambre: 6 abejas rápidas
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    state.entities.push({
                        x: boss.x + Math.cos(a) * 60, y: boss.y + Math.sin(a) * 60,
                        isEnemy: true, type: 'bee',
                        vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 + 1,
                        hp: 20, maxHp: 20, size: 35, dead: false,
                        update() {
                            this.x += this.vx;
                            this.y += this.vy;
                            this.vx += (state.hero.x - this.x) * 0.001;
                            this.vy += (state.hero.y - this.y) * 0.001;
                            if (this.y > state.canvasH + 50) this.dead = true;
                        },
                        draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'bee', this.size, state.frames, this.hp / this.maxHp); }
                    });
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡ENJAMBRE VENGADOR!');
            }
        },

        /* 3. DEMONIO DE FUEGO */
        fireDemon: {
            shootInterval: 28,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.05) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.25);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                const flicker = Math.sin(t * 0.4) * 0.1 + 0.9;
                // Aura de fuego
                const aura = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * 0.8);
                aura.addColorStop(0, 'rgba(255, 100, 0, 0.5)');
                aura.addColorStop(1, 'rgba(255, 0, 0, 0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Cuerpo demoníaco
                const grad = ctx.createRadialGradient(0, -size * 0.2, 5, 0, 0, size * 0.5);
                grad.addColorStop(0, '#ffaa00');
                grad.addColorStop(0.5, '#cc3300');
                grad.addColorStop(1, '#330000');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.4, size * 0.45 * flicker, 0, 0, Math.PI * 2);
                ctx.fill();
                // Cuernos
                ctx.fillStyle = '#330000';
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.4);
                ctx.lineTo(-size * 0.45, -size * 0.7);
                ctx.lineTo(-size * 0.2, -size * 0.45);
                ctx.closePath();
                ctx.moveTo(size * 0.3, -size * 0.4);
                ctx.lineTo(size * 0.45, -size * 0.7);
                ctx.lineTo(size * 0.2, -size * 0.45);
                ctx.closePath();
                ctx.fill();
                // Ojos ardientes
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(-size * 0.15, -size * 0.1, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
                ctx.ellipse(size * 0.15, -size * 0.1, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Boca con colmillos
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.2, size * 0.18, size * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(-size * 0.1, size * 0.15);
                ctx.lineTo(-size * 0.06, size * 0.25);
                ctx.lineTo(-size * 0.02, size * 0.15);
                ctx.moveTo(size * 0.02, size * 0.15);
                ctx.lineTo(size * 0.06, size * 0.25);
                ctx.lineTo(size * 0.1, size * 0.15);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Lluvia de magma: dispara 12 balas hacia abajo en abanico
                for (let i = 0; i < 12; i++) {
                    const angle = Math.PI / 2 + (i / 11 - 0.5) * Math.PI * 0.8;
                    state.entities.push(new Bullet(boss.x, boss.y + 50, angle, 'BOSS', true));
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡LLUVIA DE MAGMA!');
            }
        },

        /* 4. REINA DE HIELO */
        iceQueen: {
            shootInterval: 32,
            specialInterval: 190,
            update(boss, state) {
                boss.y = 120 + Math.sin(state.frames * 0.03) * 30;
                boss.x = state.canvasW / 2 + Math.cos(state.frames * 0.025) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Aura helada
                const aura = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.7);
                aura.addColorStop(0, 'rgba(170, 240, 255, 0.5)');
                aura.addColorStop(1, 'rgba(0, 100, 200, 0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
                // Capa de hielo
                ctx.fillStyle = 'rgba(170, 220, 255, 0.7)';
                ctx.beginPath();
                ctx.moveTo(-size * 0.5, size * 0.2);
                ctx.lineTo(-size * 0.4, -size * 0.3);
                ctx.lineTo(size * 0.4, -size * 0.3);
                ctx.lineTo(size * 0.5, size * 0.2);
                ctx.lineTo(size * 0.4, size * 0.5);
                ctx.lineTo(-size * 0.4, size * 0.5);
                ctx.closePath();
                ctx.fill();
                // Cuerpo
                const grad = ctx.createRadialGradient(0, -size * 0.2, 5, 0, 0, size * 0.4);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.7, '#88ccff');
                grad.addColorStop(1, '#003366');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                // Corona de hielo
                ctx.fillStyle = '#aaffff';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * size * 0.12, -size * 0.4);
                    ctx.lineTo(i * size * 0.12 - size * 0.05, -size * 0.55);
                    ctx.lineTo(i * size * 0.12 + size * 0.05, -size * 0.55);
                    ctx.closePath();
                    ctx.fill();
                }
                // Ojos azul hielo
                ctx.fillStyle = '#0066ff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(-size * 0.1, -size * 0.1, size * 0.06, 0, Math.PI * 2);
                ctx.arc(size * 0.1, -size * 0.1, size * 0.06, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Cetro helado
                ctx.strokeStyle = '#aaffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(size * 0.3, 0);
                ctx.lineTo(size * 0.5, -size * 0.3);
                ctx.stroke();
                ctx.fillStyle = '#fff';
                Assets._drawStar(ctx, size * 0.5, -size * 0.3, 6, 8, 4);
                ctx.restore();
            },
            special(boss, state) {
                // Rayo congelante: anillo de hielo que se expande
                for (let i = 0; i < 16; i++) {
                    const angle = (i / 16) * Math.PI * 2;
                    state.entities.push(new Bullet(boss.x, boss.y, angle, 'BOSS', true, 6));
                }
                // Mostrar hielo visual
                for (let i = 0; i < 30; i++) {
                    const a = Math.random() * Math.PI * 2;
                    state.particles.push(new Particle(boss.x, boss.y, {
                        vx: Math.cos(a) * 8, vy: Math.sin(a) * 8,
                        color: '#aaffff', size: 4, life: 0.8, decay: 0.04
                    }));
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡RAYO CONGELANTE!');
            }
        },

        /* 5. ROBOT OVERLORD */
        robotOverlord: {
            shootInterval: 22,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.015) * (state.canvasW * 0.25);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                const blink = (Math.floor(t / 20) % 4 === 0) ? 0.3 : 1;
                // Cuerpo metálico
                const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
                grad.addColorStop(0, '#aaa');
                grad.addColorStop(0.5, '#666');
                grad.addColorStop(1, '#222');
                ctx.fillStyle = grad;
                ctx.fillRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.8);
                // Detalles del robot
                ctx.fillStyle = '#000';
                ctx.fillRect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.25);
                // Ojo rojo grande
                ctx.fillStyle = `rgba(255, 0, 50, ${blink})`;
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.ellipse(0, -size * 0.18, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Antenas
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-size * 0.2, -size * 0.4);
                ctx.lineTo(-size * 0.25, -size * 0.55);
                ctx.moveTo(size * 0.2, -size * 0.4);
                ctx.lineTo(size * 0.25, -size * 0.55);
                ctx.stroke();
                ctx.fillStyle = '#ff0033';
                ctx.beginPath();
                ctx.arc(-size * 0.25, -size * 0.55, size * 0.05, 0, Math.PI * 2);
                ctx.arc(size * 0.25, -size * 0.55, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
                // Brazos robóticos
                ctx.fillStyle = '#333';
                ctx.fillRect(-size * 0.55, -size * 0.1, size * 0.15, size * 0.4);
                ctx.fillRect(size * 0.4, -size * 0.1, size * 0.15, size * 0.4);
                // Cañones
                ctx.fillStyle = '#000';
                ctx.fillRect(-size * 0.55, size * 0.25, size * 0.15, size * 0.1);
                ctx.fillRect(size * 0.4, size * 0.25, size * 0.15, size * 0.1);
                // Boca parrilla
                ctx.fillStyle = '#222';
                for (let i = -2; i <= 2; i++) {
                    ctx.fillRect(i * size * 0.06 - size * 0.02, size * 0.05, size * 0.04, size * 0.15);
                }
                ctx.restore();
            },
            special(boss, state) {
                // Rejilla láser: 8 láseres horizontales
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const y = state.hero.y - 100 + i * 25;
                            state.entities.push(new Bullet(boss.x, y, 0, 'LASER', true, 5));
                            state.entities.push(new Bullet(boss.x, y, Math.PI, 'LASER', true, 5));
                        }
                    }, i * 80);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡REJILLA LÁSER!');
            }
        },

        /* 6. COOKIE MONSTER COLOSAL */
        cookieMonster: {
            shootInterval: 35,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.25);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Cookie gigante
                const grad = ctx.createRadialGradient(-size * 0.15, -size * 0.15, 10, 0, 0, size * 0.6);
                grad.addColorStop(0, '#e8b870');
                grad.addColorStop(1, '#5a2a0a');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
                ctx.fill();
                // Chips gigantes
                ctx.fillStyle = '#1a0a00';
                const chips = [[-0.2, -0.15], [0.2, 0.05], [-0.05, 0.25], [0.25, -0.2], [-0.25, 0.15], [0.05, -0.05]];
                chips.forEach(([cx, cy]) => {
                    ctx.beginPath();
                    ctx.arc(cx * size, cy * size, size * 0.08, 0, Math.PI * 2);
                    ctx.fill();
                });
                // Ojos enormes
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size * 0.2, -size * 0.3, size * 0.13, 0, Math.PI * 2);
                ctx.arc(size * 0.2, -size * 0.3, size * 0.13, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.18, -size * 0.3, size * 0.06, 0, Math.PI * 2);
                ctx.arc(size * 0.22, -size * 0.3, size * 0.06, 0, Math.PI * 2);
                ctx.fill();
                // Boca enorme abierta
                ctx.fillStyle = '#220';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.3, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                for (let i = -3; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * size * 0.07, size * 0.2);
                    ctx.lineTo(i * size * 0.07 + size * 0.03, size * 0.27);
                    ctx.lineTo(i * size * 0.07 + size * 0.06, size * 0.2);
                    ctx.fill();
                }
                ctx.restore();
            },
            special(boss, state) {
                // Lluvia caramelizada: galletas pequeñas caen
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const x = Math.random() * state.canvasW;
                            state.entities.push({
                                x, y: -30, isEnemy: true, type: 'cookieRain',
                                vx: 0, vy: 4 + Math.random() * 2,
                                hp: 20, maxHp: 20, size: 40, dead: false,
                                update() { this.x += this.vx; this.y += this.vy; if (this.y > state.canvasH) this.dead = true; },
                                draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'cookie', this.size, state.frames, this.hp / this.maxHp); }
                            });
                        }
                    }, i * 100);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡LLUVIA CARAMELIZADA!');
            }
        },

        /* 7. KRAKEN */
        kraken: {
            shootInterval: 30,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 140 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.025) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Tentáculos grandes animados
                ctx.strokeStyle = '#660033';
                ctx.lineWidth = size * 0.08;
                ctx.lineCap = 'round';
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8 - 0.5) * Math.PI * 1.5;
                    const wave = Math.sin(t * 0.1 + i) * size * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3);
                    ctx.quadraticCurveTo(
                        Math.cos(a) * size * 0.55, Math.sin(a) * size * 0.55 + wave,
                        Math.cos(a) * size * 0.75, Math.sin(a) * size * 0.75 + wave * 1.5
                    );
                    ctx.stroke();
                }
                // Cabeza
                const grad = ctx.createRadialGradient(0, -size * 0.1, 10, 0, 0, size * 0.5);
                grad.addColorStop(0, '#cc0066');
                grad.addColorStop(0.7, '#660033');
                grad.addColorStop(1, '#1a0010');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Ojos brillantes
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.1, size * 0.1, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.1, size * 0.1, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(-size * 0.15, -size * 0.1, size * 0.03, size * 0.06, 0, 0, Math.PI * 2);
                ctx.ellipse(size * 0.15, -size * 0.1, size * 0.03, size * 0.06, 0, 0, Math.PI * 2);
                ctx.fill();
                // Pico
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.moveTo(-size * 0.1, size * 0.2);
                ctx.lineTo(0, size * 0.4);
                ctx.lineTo(size * 0.1, size * 0.2);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Tentáculo devastador: azota verticalmente
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const tx = state.hero.x + (Math.random() - 0.5) * 200;
                            for (let j = 0; j < 5; j++) {
                                state.entities.push(new Bullet(tx, j * 80, Math.PI / 2, 'BOSS', true));
                            }
                        }
                    }, i * 150);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡TENTÁCULO DEVASTADOR!');
            }
        },

        /* 8. SAND WORM */
        sandWorm: {
            shootInterval: 35,
            specialInterval: 220,
            update(boss, state) {
                boss.y = 140 + Math.sin(state.frames * 0.05) * 25;
                boss.x = state.canvasW / 2 + Math.cos(state.frames * 0.03) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Cuerpo segmentado
                const grad = ctx.createRadialGradient(0, -size * 0.2, 10, 0, 0, size * 0.5);
                grad.addColorStop(0, '#ffcc66');
                grad.addColorStop(0.7, '#996633');
                grad.addColorStop(1, '#3a1a0a');
                ctx.fillStyle = grad;
                // Cabeza
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
                // Anillos
                ctx.strokeStyle = '#3a1a0a';
                ctx.lineWidth = 3;
                for (let i = 1; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.ellipse(0, size * 0.1 * i, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                // Boca circular con dientes
                ctx.fillStyle = '#220';
                ctx.beginPath();
                ctx.arc(0, -size * 0.15, size * 0.18, 0, Math.PI * 2);
                ctx.fill();
                // Dientes
                ctx.fillStyle = '#fff';
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    const r = size * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * r, -size * 0.15 + Math.sin(a) * r);
                    ctx.lineTo(Math.cos(a) * r * 0.7, -size * 0.15 + Math.sin(a) * r * 0.7);
                    ctx.lineTo(Math.cos(a + 0.2) * r, -size * 0.15 + Math.sin(a + 0.2) * r);
                    ctx.fill();
                }
                // Ojos pequeños
                ctx.fillStyle = '#ff0';
                ctx.beginPath();
                ctx.arc(-size * 0.2, -size * 0.3, size * 0.05, 0, Math.PI * 2);
                ctx.arc(size * 0.2, -size * 0.3, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Emboscada subterránea: aparece de abajo
                const positions = [0.2, 0.5, 0.8];
                positions.forEach((p, i) => {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const x = state.canvasW * p;
                            // Disparo hacia arriba
                            for (let j = 0; j < 5; j++) {
                                state.entities.push(new Bullet(x, state.canvasH - 50, -Math.PI / 2 + (j - 2) * 0.15, 'BOSS', true));
                            }
                            // Partículas de arena
                            for (let j = 0; j < 20; j++) {
                                state.particles.push(new Particle(x, state.canvasH - 30, {
                                    vx: (Math.random() - 0.5) * 10,
                                    vy: -Math.random() * 10,
                                    color: '#cc9933', size: 3, life: 0.8, decay: 0.03
                                }));
                            }
                        }
                    }, i * 200);
                });
                AudioEngine.bossSpecial();
                UI.showBossCast('¡EMBOSCADA SUBTERRÁNEA!');
            }
        },

        /* 9. TIGRE REY MÍSTICO */
        tigerKing: {
            shootInterval: 28,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Aura mística
                const aura = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * 0.7);
                aura.addColorStop(0, 'rgba(255, 200, 0, 0.4)');
                aura.addColorStop(1, 'rgba(255, 100, 0, 0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
                // Cuerpo
                const grad = ctx.createRadialGradient(0, -size * 0.2, 5, 0, 0, size * 0.5);
                grad.addColorStop(0, '#ffcc66');
                grad.addColorStop(1, '#cc4400');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
                // Rayas
                ctx.strokeStyle = '#1a0a00';
                ctx.lineWidth = 4;
                for (let i = -3; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * size * 0.08, -size * 0.4);
                    ctx.lineTo(i * size * 0.08, -size * 0.15);
                    ctx.stroke();
                }
                // Melena
                ctx.fillStyle = '#aa3300';
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * size * 0.35, Math.sin(a) * size * 0.4 - size * 0.1);
                    ctx.lineTo(Math.cos(a) * size * 0.5, Math.sin(a) * size * 0.5 - size * 0.1);
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = '#aa3300';
                    ctx.stroke();
                }
                // Orejas
                ctx.fillStyle = '#cc4400';
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.35);
                ctx.lineTo(-size * 0.2, -size * 0.55);
                ctx.lineTo(-size * 0.1, -size * 0.35);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(size * 0.3, -size * 0.35);
                ctx.lineTo(size * 0.2, -size * 0.55);
                ctx.lineTo(size * 0.1, -size * 0.35);
                ctx.fill();
                // Ojos
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.05, size * 0.08, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.05, size * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.05, size * 0.04, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.05, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                // Hocico
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.2, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(0, size * 0.18, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                // Colmillos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(-size * 0.08, size * 0.25);
                ctx.lineTo(-size * 0.05, size * 0.4);
                ctx.lineTo(-size * 0.02, size * 0.25);
                ctx.moveTo(size * 0.02, size * 0.25);
                ctx.lineTo(size * 0.05, size * 0.4);
                ctx.lineTo(size * 0.08, size * 0.25);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Salto devastador: carga hacia la heroína
                const dx = state.hero.x - boss.x;
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const angle = Math.atan2(state.hero.y - boss.y, state.hero.x - boss.x) + (i - 4) * 0.1;
                            state.entities.push(new Bullet(boss.x, boss.y, angle, 'BOSS', true, 8));
                        }
                    }, i * 50);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡SALTO DEVASTADOR!');
            }
        },

        /* 10. REY ESPECTRAL */
        ghostKing: {
            shootInterval: 30,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 120 + Math.sin(state.frames * 0.05) * 40;
                boss.x = state.canvasW / 2 + Math.cos(state.frames * 0.03) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                const wave = Math.sin(t * 0.15) * size * 0.05;
                // Cuerpo fantasmal
                const grad = ctx.createRadialGradient(0, -size * 0.2, 10, 0, 0, size * 0.6);
                grad.addColorStop(0, 'rgba(220, 220, 255, 0.9)');
                grad.addColorStop(0.5, 'rgba(150, 150, 220, 0.7)');
                grad.addColorStop(1, 'rgba(80, 80, 150, 0.3)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, -size * 0.1, size * 0.4, Math.PI, 0);
                ctx.lineTo(size * 0.4, size * 0.4 + wave);
                for (let i = 3; i >= -3; i--) {
                    ctx.quadraticCurveTo(i * size * 0.1 + size * 0.05, size * 0.55, i * size * 0.1, size * 0.4);
                }
                ctx.closePath();
                ctx.fill();
                // Corona espectral
                ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
                ctx.beginPath();
                ctx.moveTo(-size * 0.25, -size * 0.45);
                ctx.lineTo(-size * 0.25, -size * 0.3);
                ctx.lineTo(size * 0.25, -size * 0.3);
                ctx.lineTo(size * 0.25, -size * 0.45);
                ctx.lineTo(size * 0.15, -size * 0.35);
                ctx.lineTo(size * 0.08, -size * 0.5);
                ctx.lineTo(0, -size * 0.35);
                ctx.lineTo(-size * 0.08, -size * 0.5);
                ctx.lineTo(-size * 0.15, -size * 0.35);
                ctx.closePath();
                ctx.fill();
                // Ojos rojos
                ctx.fillStyle = '#ff0033';
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.ellipse(-size * 0.13, -size * 0.15, size * 0.06, size * 0.1, 0, 0, Math.PI * 2);
                ctx.ellipse(size * 0.13, -size * 0.15, size * 0.06, size * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Boca
                ctx.fillStyle = 'rgba(50, 0, 0, 0.6)';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.1, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Onda de posesión: anillo que se expande
                for (let r = 30; r <= 200; r += 30) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            for (let i = 0; i < 12; i++) {
                                const a = (i / 12) * Math.PI * 2;
                                state.entities.push({
                                    x: boss.x + Math.cos(a) * 30, y: boss.y + Math.sin(a) * 30,
                                    isEnemy: true, type: 'ghostWave',
                                    vx: Math.cos(a) * 5, vy: Math.sin(a) * 5,
                                    hp: 15, maxHp: 15, size: 25, dead: false, life: 60,
                                    update() {
                                        this.x += this.vx; this.y += this.vy; this.life--;
                                        if (this.life <= 0) this.dead = true;
                                    },
                                    draw(ctx) {
                                        ctx.save();
                                        ctx.globalAlpha = this.life / 60;
                                        Assets.drawEnemy(ctx, this.x, this.y, 'ghost', this.size, state.frames, this.hp / this.maxHp);
                                        ctx.restore();
                                    }
                                });
                            }
                        }
                    }, (200 - r) * 3);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡ONDA DE POSESIÓN!');
            }
        },

        /* 11. GIGANTE CUMULONIMBO */
        cloudGiant: {
            shootInterval: 30,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.03) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Cuerpo de nube
                ctx.fillStyle = 'rgba(220, 220, 240, 0.85)';
                ctx.beginPath();
                ctx.arc(-size * 0.3, 0, size * 0.25, 0, Math.PI * 2);
                ctx.arc(0, -size * 0.2, size * 0.3, 0, Math.PI * 2);
                ctx.arc(size * 0.3, 0, size * 0.25, 0, Math.PI * 2);
                ctx.arc(0, size * 0.1, size * 0.25, 0, Math.PI * 2);
                ctx.fill();
                // Rayos eléctricos
                ctx.strokeStyle = `rgba(255, 255, 100, ${0.5 + Math.sin(t * 0.4) * 0.5})`;
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 12;
                for (let i = 0; i < 5; i++) {
                    const px = (Math.random() - 0.5) * size * 0.8;
                    ctx.beginPath();
                    ctx.moveTo(px, -size * 0.2);
                    ctx.lineTo(px + (Math.random() - 0.5) * 10, size * 0.3);
                    ctx.lineTo(px + (Math.random() - 0.5) * 10, size * 0.5);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                // Ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.1, size * 0.08, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.1, size * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0066ff';
                ctx.beginPath();
                ctx.arc(-size * 0.13, -size * 0.1, size * 0.04, 0, Math.PI * 2);
                ctx.arc(size * 0.13, -size * 0.1, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                // Boca de tormenta
                ctx.fillStyle = 'rgba(50, 50, 100, 0.7)';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.15, size * 0.15, size * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Tormenta eléctrica: rayos caen del cielo
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const x = Math.random() * state.canvasW;
                            // Rayo visual
                            for (let j = 0; j < 8; j++) {
                                state.particles.push(new Particle(x, j * 30, {
                                    vx: 0, vy: 0, color: '#ffff00', size: 4, life: 0.5, decay: 0.1, shape: 'spark'
                                }));
                            }
                            state.entities.push(new Bullet(x, 50, Math.PI / 2, 'BOSS', true, 7));
                        }
                    }, i * 100);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡TORMENTA ELÉCTRICA!');
            }
        },

        /* 12. MADRE NODRIZA XENO */
        alienMother: {
            shootInterval: 25,
            specialInterval: 220,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.03) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Nave nodriza
                const grad = ctx.createRadialGradient(0, -size * 0.1, 10, 0, 0, size * 0.6);
                grad.addColorStop(0, '#88ff66');
                grad.addColorStop(0.5, '#336611');
                grad.addColorStop(1, '#0a1a05');
                ctx.fillStyle = grad;
                // Cuerpo principal forma de OVNI
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.5, size * 0.25, 0, 0, Math.PI * 2);
                ctx.fill();
                // Cúpula
                ctx.fillStyle = 'rgba(170, 255, 100, 0.7)';
                ctx.beginPath();
                ctx.arc(0, -size * 0.1, size * 0.25, Math.PI, 0);
                ctx.fill();
                // Luces
                for (let i = -3; i <= 3; i++) {
                    ctx.fillStyle = `hsl(${(t * 2 + i * 50) % 360}, 100%, 60%)`;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(i * size * 0.13, size * 0.1, size * 0.04, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                // Ojo central
                ctx.fillStyle = '#ff0';
                ctx.shadowColor = '#ff0';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(0, -size * 0.05, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Antenas
                ctx.strokeStyle = '#336611';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.05);
                ctx.lineTo(-size * 0.4, -size * 0.25);
                ctx.moveTo(size * 0.3, -size * 0.05);
                ctx.lineTo(size * 0.4, -size * 0.25);
                ctx.stroke();
                ctx.restore();
            },
            special(boss, state) {
                // Rayo tractor: láser vertical que sigue a la heroína
                const startX = state.hero.x;
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const x = startX + (state.hero.x - startX) * (i / 20);
                            state.entities.push(new Bullet(x, boss.y + 30, Math.PI / 2, 'LASER', true, 6));
                            state.particles.push(new Particle(x, boss.y + 50 + i * 20, {
                                vx: 0, vy: 8, color: '#88ff66', size: 5, life: 0.5, decay: 0.06
                            }));
                        }
                    }, i * 50);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡RAYO TRACTOR!');
            }
        },

        /* 13. REINA ROSALÍA */
        roseQueen: {
            shootInterval: 30,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.025) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Tallo
                ctx.strokeStyle = '#2a5500';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(0, size * 0.4);
                ctx.lineTo(0, -size * 0.1);
                ctx.stroke();
                // Hojas
                ctx.fillStyle = '#336611';
                ctx.beginPath();
                ctx.ellipse(-size * 0.2, size * 0.2, size * 0.15, size * 0.06, 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(size * 0.2, size * 0.25, size * 0.15, size * 0.06, -0.5, 0, Math.PI * 2);
                ctx.fill();
                // Capullo gigante
                const grad = ctx.createRadialGradient(0, -size * 0.2, 5, 0, -size * 0.1, size * 0.4);
                grad.addColorStop(0, '#ff99cc');
                grad.addColorStop(0.5, '#ff0066');
                grad.addColorStop(1, '#660022');
                ctx.fillStyle = grad;
                // Pétalos externos
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2 + t * 0.02;
                    ctx.beginPath();
                    ctx.ellipse(Math.cos(a) * size * 0.2, -size * 0.1 + Math.sin(a) * size * 0.2, size * 0.2, size * 0.12, a, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Pétalos internos
                ctx.fillStyle = '#ff3366';
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 + t * 0.03 + 0.5;
                    ctx.beginPath();
                    ctx.ellipse(Math.cos(a) * size * 0.1, -size * 0.1 + Math.sin(a) * size * 0.1, size * 0.13, size * 0.08, a, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Centro
                ctx.fillStyle = '#660022';
                ctx.beginPath();
                ctx.arc(0, -size * 0.1, size * 0.08, 0, Math.PI * 2);
                ctx.fill();
                // Ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size * 0.04, -size * 0.12, size * 0.03, 0, Math.PI * 2);
                ctx.arc(size * 0.04, -size * 0.12, size * 0.03, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.04, -size * 0.12, size * 0.015, 0, Math.PI * 2);
                ctx.arc(size * 0.04, -size * 0.12, size * 0.015, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Jaula de espinas: 4 muros de espinas
                const positions = [
                    { x: state.hero.x - 150, y: state.hero.y, ang: 0 },
                    { x: state.hero.x + 150, y: state.hero.y, ang: Math.PI },
                    { x: state.hero.x, y: state.hero.y - 150, ang: Math.PI / 2 },
                    { x: state.hero.x, y: state.hero.y + 150, ang: -Math.PI / 2 }
                ];
                positions.forEach((p, i) => {
                    setTimeout(() => {
                        if (!boss.dead) {
                            for (let j = 0; j < 5; j++) {
                                state.entities.push(new Bullet(p.x, p.y, p.ang + (j - 2) * 0.1, 'BOSS', true));
                            }
                            // Espinas visuales
                            for (let j = 0; j < 12; j++) {
                                const a = Math.random() * Math.PI * 2;
                                state.particles.push(new Particle(p.x, p.y, {
                                    vx: Math.cos(a) * 6, vy: Math.sin(a) * 6,
                                    color: '#ff0066', size: 3, life: 0.6, decay: 0.05, shape: 'spark'
                                }));
                            }
                        }
                    }, i * 100);
                });
                AudioEngine.bossSpecial();
                UI.showBossCast('¡JAULA DE ESPINAS!');
            }
        },

        /* 14. DRAGÓN CRISTALINO */
        gemDragon: {
            shootInterval: 28,
            specialInterval: 220,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                const wing = Math.sin(t * 0.15) * 0.3;
                // Alas cristalinas
                ctx.fillStyle = 'rgba(110, 240, 255, 0.6)';
                ctx.strokeStyle = '#aaffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(-size * 0.6, -size * 0.3 - wing * size);
                ctx.lineTo(-size * 0.4, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(size * 0.6, -size * 0.3 - wing * size);
                ctx.lineTo(size * 0.4, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Cuerpo cristalino
                const grad = ctx.createRadialGradient(0, -size * 0.1, 5, 0, 0, size * 0.4);
                grad.addColorStop(0, '#aaffff');
                grad.addColorStop(0.5, '#00cccc');
                grad.addColorStop(1, '#003366');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                // Forma cristalina hexagonal
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.35);
                ctx.lineTo(size * 0.25, -size * 0.15);
                ctx.lineTo(size * 0.25, size * 0.2);
                ctx.lineTo(0, size * 0.4);
                ctx.lineTo(-size * 0.25, size * 0.2);
                ctx.lineTo(-size * 0.25, -size * 0.15);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Cuernos cristalinos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(-size * 0.1, -size * 0.3);
                ctx.lineTo(-size * 0.15, -size * 0.5);
                ctx.lineTo(-size * 0.05, -size * 0.3);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(size * 0.1, -size * 0.3);
                ctx.lineTo(size * 0.15, -size * 0.5);
                ctx.lineTo(size * 0.05, -size * 0.3);
                ctx.fill();
                // Ojos brillantes
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(-size * 0.08, -size * 0.05, size * 0.05, 0, Math.PI * 2);
                ctx.arc(size * 0.08, -size * 0.05, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            },
            special(boss, state) {
                // Lluvia de esquirlas: 12 cristales en espiral
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const angle = (i / 12) * Math.PI * 2 + Math.PI / 2;
                            state.entities.push({
                                x: boss.x, y: boss.y, isEnemy: true, type: 'shard',
                                vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5,
                                hp: 25, maxHp: 25, size: 30, dead: false, life: 120,
                                rot: 0,
                                update() {
                                    this.x += this.vx; this.y += this.vy;
                                    this.vx *= 0.98; this.vy = this.vy * 0.98 + 0.1;
                                    this.rot += 0.2;
                                    this.life--;
                                    if (this.life <= 0 || this.y > state.canvasH) this.dead = true;
                                },
                                draw(ctx) {
                                    ctx.save();
                                    ctx.translate(this.x, this.y);
                                    ctx.rotate(this.rot);
                                    Assets.drawEnemy(ctx, 0, 0, 'crystal', this.size, state.frames, this.hp / this.maxHp);
                                    ctx.restore();
                                }
                            });
                        }
                    }, i * 60);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡LLUVIA DE ESQUIRLAS!');
            }
        },

        /* 15. DIOS SOL APOLO */
        sunGod: {
            shootInterval: 25,
            specialInterval: 240,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.03) * 25;
                boss.x = state.canvasW / 2 + Math.cos(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Rayos solares giratorios
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 4;
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2 + t * 0.02;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * size * 0.4, Math.sin(a) * size * 0.4);
                    ctx.lineTo(Math.cos(a) * size * 0.6, Math.sin(a) * size * 0.6);
                    ctx.stroke();
                }
                // Sol
                const grad = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.5);
                grad.addColorStop(0, '#ffff66');
                grad.addColorStop(0.5, '#ffaa00');
                grad.addColorStop(1, '#cc3300');
                ctx.fillStyle = grad;
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Cara
                ctx.fillStyle = '#cc4400';
                ctx.beginPath();
                ctx.arc(-size * 0.12, -size * 0.08, size * 0.04, 0, Math.PI * 2);
                ctx.arc(size * 0.12, -size * 0.08, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#cc4400';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, size * 0.05, size * 0.1, 0.2, Math.PI - 0.2);
                ctx.stroke();
                // Corona solar
                ctx.fillStyle = '#ffaa00';
                ctx.strokeStyle = '#ff6600';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.35);
                ctx.lineTo(-size * 0.3, -size * 0.25);
                ctx.lineTo(size * 0.3, -size * 0.25);
                ctx.lineTo(size * 0.3, -size * 0.35);
                ctx.lineTo(size * 0.2, -size * 0.3);
                ctx.lineTo(size * 0.1, -size * 0.45);
                ctx.lineTo(0, -size * 0.3);
                ctx.lineTo(-size * 0.1, -size * 0.45);
                ctx.lineTo(-size * 0.2, -size * 0.3);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            },
            special(boss, state) {
                // Llamarada solar: ráfaga en todas direcciones
                for (let i = 0; i < 24; i++) {
                    const angle = (i / 24) * Math.PI * 2;
                    state.entities.push(new Bullet(boss.x, boss.y, angle, 'BOSS', true, 8));
                }
                // Llamaradas visuales
                for (let i = 0; i < 40; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const sp = 5 + Math.random() * 5;
                    state.particles.push(new Particle(boss.x, boss.y, {
                        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                        color: ['#ffff00', '#ff6600', '#ff0000'][Math.floor(Math.random() * 3)],
                        size: 4 + Math.random() * 3, life: 0.8, decay: 0.04
                    }));
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡LLAMARADA SOLAR!');
            }
        },

        /* 16. LORD DRAGÓN VIRMIR */
        dragonLord: {
            shootInterval: 28,
            specialInterval: 220,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                const wing = Math.sin(t * 0.2) * 0.4;
                // Alas gigantes
                ctx.fillStyle = '#660033';
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(-size * 0.7, -size * 0.4 - wing * size);
                ctx.lineTo(-size * 0.45, 0);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(size * 0.7, -size * 0.4 - wing * size);
                ctx.lineTo(size * 0.45, 0);
                ctx.closePath();
                ctx.fill();
                // Detalles del ala
                ctx.strokeStyle = '#330011';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(-size * 0.7, -size * 0.4 - wing * size);
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(size * 0.7, -size * 0.4 - wing * size);
                ctx.stroke();
                // Cuerpo
                const grad = ctx.createRadialGradient(0, -size * 0.1, 5, 0, 0, size * 0.5);
                grad.addColorStop(0, '#33aa33');
                grad.addColorStop(0.5, '#225522');
                grad.addColorStop(1, '#001100');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                // Cabeza
                ctx.beginPath();
                ctx.ellipse(0, -size * 0.3, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
                ctx.fill();
                // Cuernos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(-size * 0.1, -size * 0.4);
                ctx.lineTo(-size * 0.15, -size * 0.55);
                ctx.lineTo(-size * 0.05, -size * 0.4);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(size * 0.1, -size * 0.4);
                ctx.lineTo(size * 0.15, -size * 0.55);
                ctx.lineTo(size * 0.05, -size * 0.4);
                ctx.fill();
                // Ojos
                ctx.fillStyle = '#ff0';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(-size * 0.08, -size * 0.3, size * 0.05, 0, Math.PI * 2);
                ctx.arc(size * 0.08, -size * 0.3, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Fosas
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.03, -size * 0.22, size * 0.02, 0, Math.PI * 2);
                ctx.arc(size * 0.03, -size * 0.22, size * 0.02, 0, Math.PI * 2);
                ctx.fill();
                // Llama en la boca (animada)
                const flame = Math.sin(t * 0.3) * size * 0.05;
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.moveTo(-size * 0.1, -size * 0.18);
                ctx.quadraticCurveTo(0, -size * 0.05 + flame, size * 0.1, -size * 0.18);
                ctx.lineTo(size * 0.05, -size * 0.12);
                ctx.lineTo(0, -size * 0.1 + flame);
                ctx.lineTo(-size * 0.05, -size * 0.12);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Aliento ígneo: cono de fuego continuo
                const baseAngle = Math.atan2(state.hero.y - boss.y, state.hero.x - boss.x);
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const a = baseAngle + (Math.random() - 0.5) * 0.5;
                            state.entities.push(new Bullet(boss.x, boss.y + 20, a, 'BOSS', true, 8));
                            // Partículas de fuego
                            for (let j = 0; j < 5; j++) {
                                state.particles.push(new Particle(boss.x, boss.y + 20, {
                                    vx: Math.cos(a) * (3 + Math.random() * 5),
                                    vy: Math.sin(a) * (3 + Math.random() * 5),
                                    color: ['#ff6600', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 3)],
                                    size: 4 + Math.random() * 3, life: 0.6, decay: 0.05
                                }));
                            }
                        }
                    }, i * 30);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡ALIENTO ÍGNEO!');
            }
        },

        /* 17. BRUJA PANTANOSA MORVA */
        swampWitch: {
            shootInterval: 28,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.025) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Aura tóxica
                const aura = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * 0.7);
                aura.addColorStop(0, 'rgba(100, 200, 50, 0.4)');
                aura.addColorStop(1, 'rgba(50, 100, 0, 0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
                // Capa
                ctx.fillStyle = '#1a3300';
                ctx.beginPath();
                ctx.moveTo(-size * 0.5, size * 0.5);
                ctx.lineTo(-size * 0.3, -size * 0.2);
                ctx.lineTo(size * 0.3, -size * 0.2);
                ctx.lineTo(size * 0.5, size * 0.5);
                ctx.closePath();
                ctx.fill();
                // Cuerpo
                const grad = ctx.createRadialGradient(0, -size * 0.1, 5, 0, 0, size * 0.3);
                grad.addColorStop(0, '#4a7c2a');
                grad.addColorStop(1, '#1a3300');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.25, size * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                // Sombrero
                ctx.fillStyle = '#1a0010';
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, -size * 0.3);
                ctx.lineTo(0, -size * 0.7);
                ctx.lineTo(size * 0.3, -size * 0.3);
                ctx.fill();
                ctx.fillStyle = '#aa6633';
                ctx.fillRect(-size * 0.35, -size * 0.32, size * 0.7, size * 0.05);
                // Ojos brillantes
                ctx.fillStyle = '#88ff00';
                ctx.shadowColor = '#88ff00';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(-size * 0.08, -size * 0.15, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
                ctx.ellipse(size * 0.08, -size * 0.15, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Nariz ganchuda
                ctx.fillStyle = '#88aa55';
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.1);
                ctx.lineTo(size * 0.1, -size * 0.05);
                ctx.lineTo(0, -size * 0.02);
                ctx.fill();
                // Boca con dientes
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.05, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(-size * 0.04, size * 0.05);
                ctx.lineTo(-size * 0.02, size * 0.1);
                ctx.lineTo(0, size * 0.05);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Nube tóxica: niebla que cubre la pantalla
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const x = Math.random() * state.canvasW;
                            const y = Math.random() * state.canvasH * 0.7 + state.canvasH * 0.2;
                            state.entities.push({
                                x, y, isEnemy: true, type: 'toxicCloud',
                                vx: (Math.random() - 0.5) * 2, vy: 1,
                                hp: 15, maxHp: 15, size: 50, dead: false, life: 180,
                                update() {
                                    this.x += this.vx; this.y += this.vy;
                                    this.life--;
                                    if (this.life <= 0) this.dead = true;
                                },
                                draw(ctx) {
                                    ctx.save();
                                    ctx.globalAlpha = (this.life / 180) * 0.7;
                                    ctx.fillStyle = '#88aa33';
                                    ctx.beginPath();
                                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                                    ctx.fill();
                                    ctx.fillStyle = '#445522';
                                    ctx.beginPath();
                                    ctx.arc(this.x - 10, this.y - 5, this.size * 0.6, 0, Math.PI * 2);
                                    ctx.fill();
                                    ctx.restore();
                                }
                            });
                        }
                    }, i * 80);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡NUBE TÓXICA!');
            }
        },

        /* 18. MAESTRO DE JUGUETES */
        toyMaster: {
            shootInterval: 28,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Cuerpo
                const grad = ctx.createRadialGradient(0, -size * 0.1, 5, 0, 0, size * 0.5);
                grad.addColorStop(0, '#ff99cc');
                grad.addColorStop(0.5, '#cc3399');
                grad.addColorStop(1, '#660033');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
                // Sombrero de copa
                ctx.fillStyle = '#1a0010';
                ctx.fillRect(-size * 0.25, -size * 0.55, size * 0.5, size * 0.3);
                ctx.fillRect(-size * 0.3, -size * 0.28, size * 0.6, size * 0.04);
                // Cinta del sombrero
                ctx.fillStyle = '#ff0033';
                ctx.fillRect(-size * 0.25, -size * 0.32, size * 0.5, size * 0.04);
                // Ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size * 0.12, -size * 0.1, size * 0.07, 0, Math.PI * 2);
                ctx.arc(size * 0.12, -size * 0.1, size * 0.07, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-size * 0.12, -size * 0.1, size * 0.03, 0, Math.PI * 2);
                ctx.arc(size * 0.12, -size * 0.1, size * 0.03, 0, Math.PI * 2);
                ctx.fill();
                // Bigote
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-size * 0.15, size * 0.05);
                ctx.quadraticCurveTo(-size * 0.2, size * 0.15, -size * 0.05, size * 0.15);
                ctx.moveTo(size * 0.15, size * 0.05);
                ctx.quadraticCurveTo(size * 0.2, size * 0.15, size * 0.05, size * 0.15);
                ctx.stroke();
                // Boca
                ctx.strokeStyle = '#660033';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, size * 0.2, size * 0.08, 0.2, Math.PI - 0.2);
                ctx.stroke();
                // Llaves de cuerda
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(size * 0.3, -size * 0.1);
                ctx.lineTo(size * 0.4, -size * 0.1);
                ctx.stroke();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(size * 0.4, -size * 0.1, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            special(boss, state) {
                // Tropas de peluche: 6 osos pequeños
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    state.entities.push({
                        x: boss.x + Math.cos(a) * 60, y: boss.y + Math.sin(a) * 60,
                        isEnemy: true, type: 'teddySoldier',
                        vx: Math.cos(a) * 2, vy: Math.sin(a) * 2 + 1,
                        hp: 25, maxHp: 25, size: 35, dead: false,
                        update() {
                            this.x += this.vx;
                            this.y += this.vy;
                            this.vx += (state.hero.x - this.x) * 0.0008;
                            if (this.y > state.canvasH) this.dead = true;
                        },
                        draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'teddy', this.size, state.frames, this.hp / this.maxHp); }
                    });
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡TROPAS DE PELUCHE!');
            }
        },

        /* 19. SABIO CRISTALINO LUMEN */
        crystalSage: {
            shootInterval: 25,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Aura
                const aura = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.8);
                aura.addColorStop(0, 'rgba(255, 100, 200, 0.5)');
                aura.addColorStop(1, 'rgba(100, 0, 200, 0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Cristales orbitando
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 + t * 0.03;
                    const r = size * 0.5;
                    ctx.save();
                    ctx.translate(Math.cos(a) * r, Math.sin(a) * r);
                    ctx.rotate(a);
                    ctx.fillStyle = 'rgba(170, 220, 255, 0.8)';
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, -size * 0.1);
                    ctx.lineTo(size * 0.05, 0);
                    ctx.lineTo(0, size * 0.1);
                    ctx.lineTo(-size * 0.05, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
                // Cuerpo principal
                const grad = ctx.createRadialGradient(0, -size * 0.1, 5, 0, 0, size * 0.4);
                grad.addColorStop(0, '#ff66cc');
                grad.addColorStop(0.5, '#aa00ff');
                grad.addColorStop(1, '#330033');
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                // Forma de cristal gigante
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.4);
                ctx.lineTo(size * 0.25, -size * 0.1);
                ctx.lineTo(size * 0.2, size * 0.3);
                ctx.lineTo(0, size * 0.45);
                ctx.lineTo(-size * 0.2, size * 0.3);
                ctx.lineTo(-size * 0.25, -size * 0.1);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Brillos
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.moveTo(0, -size * 0.4);
                ctx.lineTo(size * 0.05, -size * 0.15);
                ctx.lineTo(-size * 0.05, -size * 0.15);
                ctx.closePath();
                ctx.fill();
                // Ojos
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#ff66cc';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.ellipse(-size * 0.08, -size * 0.05, size * 0.05, size * 0.08, 0, 0, Math.PI * 2);
                ctx.ellipse(size * 0.08, -size * 0.05, size * 0.05, size * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            },
            special(boss, state) {
                // Esquirlas espejo: 8 balas rebotan desde los bordes
                for (let i = 0; i < 16; i++) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const side = i % 4;
                            let x, y, angle;
                            if (side === 0) { x = Math.random() * state.canvasW; y = 30; angle = Math.PI / 2; }
                            else if (side === 1) { x = state.canvasW - 30; y = Math.random() * state.canvasH; angle = Math.PI; }
                            else if (side === 2) { x = Math.random() * state.canvasW; y = state.canvasH - 30; angle = -Math.PI / 2; }
                            else { x = 30; y = Math.random() * state.canvasH; angle = 0; }
                            state.entities.push(new Bullet(x, y, angle, 'BOSS', true, 6));
                        }
                    }, i * 50);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast('¡ESQUIRLAS ESPEJO!');
            }
        },

        /* 20. EMPERATRIZ OSCURA NOIR */
        darkEmpress: {
            shootInterval: 22,
            specialInterval: 200,
            update(boss, state) {
                boss.y = 140 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
            },
            draw(ctx, x, y, size, t, hpRatio) {
                ctx.save();
                ctx.translate(x, y);
                // Aura oscura pulsante
                const aura = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.9);
                const pulse = 0.4 + Math.sin(t * 0.1) * 0.2;
                aura.addColorStop(0, `rgba(255, 0, 100, ${pulse})`);
                aura.addColorStop(0.5, `rgba(150, 0, 50, ${pulse * 0.5})`);
                aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
                ctx.fill();
                // Capa oscura
                ctx.fillStyle = '#1a0010';
                ctx.beginPath();
                ctx.moveTo(-size * 0.55, size * 0.5);
                ctx.quadraticCurveTo(-size * 0.4, -size * 0.4, 0, -size * 0.5);
                ctx.quadraticCurveTo(size * 0.4, -size * 0.4, size * 0.55, size * 0.5);
                ctx.closePath();
                ctx.fill();
                // Cuerpo (idéntico a Emilia pero oscuro)
                const dressGrad = ctx.createLinearGradient(0, 0, 0, 40);
                dressGrad.addColorStop(0, '#660033');
                dressGrad.addColorStop(1, '#1a0010');
                ctx.fillStyle = dressGrad;
                ctx.beginPath();
                ctx.moveTo(-size * 0.35, 0);
                ctx.lineTo(size * 0.35, 0);
                ctx.lineTo(size * 0.45, size * 0.45);
                ctx.lineTo(-size * 0.45, size * 0.45);
                ctx.closePath();
                ctx.fill();
                // Detalles
                ctx.strokeStyle = '#ff0033';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size * 0.2, size * 0.15);
                ctx.lineTo(size * 0.2, size * 0.15);
                ctx.moveTo(-size * 0.3, size * 0.3);
                ctx.lineTo(size * 0.3, size * 0.3);
                ctx.stroke();
                // Cabeza pálida
                ctx.fillStyle = '#dddddd';
                ctx.beginPath();
                ctx.arc(0, -size * 0.15, size * 0.2, 0, Math.PI * 2);
                ctx.fill();
                // Cabello oscuro
                ctx.fillStyle = '#1a0010';
                ctx.beginPath();
                ctx.arc(0, -size * 0.17, size * 0.22, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(-size * 0.17, -size * 0.1, size * 0.08, size * 0.18, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(size * 0.17, -size * 0.1, size * 0.08, size * 0.18, -0.3, 0, Math.PI * 2);
                ctx.fill();
                // Corona oscura
                ctx.fillStyle = '#330011';
                ctx.strokeStyle = '#ff0033';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size * 0.18, -size * 0.35);
                ctx.lineTo(-size * 0.18, -size * 0.28);
                ctx.lineTo(size * 0.18, -size * 0.28);
                ctx.lineTo(size * 0.18, -size * 0.35);
                ctx.lineTo(size * 0.13, -size * 0.22);
                ctx.lineTo(size * 0.06, -size * 0.38);
                ctx.lineTo(0, -size * 0.22);
                ctx.lineTo(-size * 0.06, -size * 0.38);
                ctx.lineTo(-size * 0.13, -size * 0.22);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Joya roja
                ctx.fillStyle = '#ff0033';
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(0, -size * 0.3, size * 0.03, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Ojos rojos brillantes
                ctx.fillStyle = '#ff0033';
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(-size * 0.07, -size * 0.13, size * 0.03, size * 0.04, 0, 0, Math.PI * 2);
                ctx.ellipse(size * 0.07, -size * 0.13, size * 0.03, size * 0.04, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Sonrisa malvada
                ctx.strokeStyle = '#660033';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, -size * 0.05, size * 0.05, Math.PI + 0.2, -0.2);
                ctx.stroke();
                // Cetro oscuro
                ctx.strokeStyle = '#330011';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(size * 0.4, size * 0.1);
                ctx.lineTo(size * 0.55, -size * 0.25);
                ctx.stroke();
                ctx.fillStyle = '#ff0033';
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 15;
                Assets._drawStar(ctx, size * 0.55, -size * 0.25, 5, 8, 4);
                ctx.shadowBlur = 0;
                ctx.restore();
            },
            special(boss, state) {
                // Eclipse final: combina varios poderes
                // 1. Anillo de balas
                for (let i = 0; i < 16; i++) {
                    const angle = (i / 16) * Math.PI * 2;
                    state.entities.push(new Bullet(boss.x, boss.y, angle, 'BOSS', true, 7));
                }
                // 2. Lluvia de esbirros
                setTimeout(() => {
                    if (!boss.dead) {
                        for (let i = 0; i < 4; i++) {
                            const x = (i + 1) * state.canvasW / 5;
                            state.entities.push({
                                x, y: -30, isEnemy: true, type: 'darklingMinion',
                                vx: 0, vy: 3,
                                hp: 35, maxHp: 35, size: 40, dead: false,
                                update() { this.x += this.vx; this.y += this.vy; if (this.y > state.canvasH) this.dead = true; },
                                draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'darkling', this.size, state.frames, this.hp / this.maxHp); }
                            });
                        }
                    }
                }, 500);
                // 3. Láser hacia la heroína
                setTimeout(() => {
                    if (!boss.dead) {
                        const angle = Math.atan2(state.hero.y - boss.y, state.hero.x - boss.x);
                        for (let i = 0; i < 10; i++) {
                            setTimeout(() => {
                                if (!boss.dead) {
                                    state.entities.push(new Bullet(boss.x, boss.y + 30, angle + (Math.random() - 0.5) * 0.2, 'LASER', true, 8));
                                }
                            }, i * 40);
                        }
                    }
                }, 1000);
                AudioEngine.bossSpecial();
                UI.showBossCast('¡ECLIPSE FINAL!');
            }
        }
    }
};

window.Bosses = Bosses;

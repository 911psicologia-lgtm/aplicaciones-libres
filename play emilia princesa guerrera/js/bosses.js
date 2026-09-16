/* ============================================================
   BOSSES v5 - Jefes con fases, ataques múltiples y animaciones
   Cada jefe tiene 3 fases según HP:
   - Fase 1 (100-66%): patrón básico
   - Fase 2 (66-33%): más agresivo, ataques adicionales
   - Fase 3 (33-0%): frenesí, ataque especial constante
   ============================================================ */

const Bosses = {
    _defs: null,
    _defsInitialized: false,

    getBossConfig(type, levelIdx) {
        if (!this._defsInitialized) {
            this._initDefs();
            this._defsInitialized = true;
        }
        const cfg = this._defs[type] || this._defs.slimeKing;
        const baseHp = 1500 + levelIdx * 400;
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
            updateFn: cfg.update || this._defaultUpdate
        };
    },

    _defaultUpdate(boss, state) {
        boss.y = Math.min(boss.y + 1.5, 140);
        boss.x = state.canvasW / 2 + Math.sin(state.frames * 0.02) * (state.canvasW * 0.3);
    },

    getPhase(boss) {
        const ratio = boss.hp / boss.maxHp;
        if (ratio > 0.66) return 1;
        if (ratio > 0.33) return 2;
        return 3;
    },

    _hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    _initDefs() {
        this._defs = {
            slimeKing: this._slimeKingDef()
        };
        const generic = {
            queenBee: { dark: '#996600', light: '#FFD700', msgs: ['¡ENJAMBRE!', '¡MIEL PEGAJOSA!', '¡TORMENTA DE AVISPAS!'] },
            fireDemon: { dark: '#cc0000', light: '#ff6600', msgs: ['¡LLUVIA DE MAGMA!', '¡METEOROS!', '¡INFERNO TOTAL!'] },
            iceQueen: { dark: '#003366', light: '#aaffff', msgs: ['¡RAYO CONGELANTE!', '¡ESTALACTITAS!', '¡VENTISCA MORTAL!'] },
            robotOverlord: { dark: '#333333', light: '#ff0033', msgs: ['¡REJILLA LÁSER!', '¡SCAN LÁSER!', '¡PULSO ELECTROMAGNÉTICO!'] },
            cookieMonster: { dark: '#5a2a0a', light: '#ffaa55', msgs: ['¡LLUVIA CARAMELIZADA!', '¡TORMENTA DULCE!', '¡FURIA AZUCARADA!'] },
            kraken: { dark: '#660033', light: '#66ccff', msgs: ['¡TENTÁCULO!', '¡ABRAZO LETAL!', '¡FURIA MARINA!'] },
            sandWorm: { dark: '#996633', light: '#ffcc66', msgs: ['¡EMBOSCADA!', '¡TERREMOTO!', '¡APOCALIPSIS ARENA!'] },
            tigerKing: { dark: '#cc4400', light: '#ffaa33', msgs: ['¡SALTO!', '¡EMBESTIDA!', '¡FURIA SALVAJE!'] },
            ghostKing: { dark: '#3a3a8a', light: '#aaaaff', msgs: ['¡POSESIÓN!', '¡TORMENTA ESPECTRAL!', '¡MALDICIÓN FINAL!'] },
            cloudGiant: { dark: '#5a6a8a', light: '#ffffff', msgs: ['¡TORMENTA!', '¡RAYOS MORTALES!', '¡CICLÓN!'] },
            alienMother: { dark: '#336611', light: '#88ff66', msgs: ['¡RAYO TRACTOR!', '¡INVASIÓN!', '¡ANIQUILACIÓN!'] },
            roseQueen: { dark: '#990033', light: '#ff3366', msgs: ['¡JAULA DE ESPINAS!', '¡JARDÍN MALDITO!', '¡TORMENTA DE ROSAS!'] },
            gemDragon: { dark: '#003366', light: '#00ffff', msgs: ['¡ESQUIRLAS!', '¡REFLEJO MORTAL!', '¡PRISMA LETAL!'] },
            sunGod: { dark: '#cc3300', light: '#ffff00', msgs: ['¡LLAMARADA!', '¡NOVA SOLAR!', '¡SUPERNOVA!'] },
            dragonLord: { dark: '#003300', light: '#33aa33', msgs: ['¡ALIENTO ÍGNEO!', '¡CÓLERA!', '¡CATACLISMO!'] },
            swampWitch: { dark: '#1a3300', light: '#88ff00', msgs: ['¡NUBE TÓXICA!', '¡MALDICIÓN!', '¡PESTE!'] },
            toyMaster: { dark: '#660033', light: '#ff99cc', msgs: ['¡TROPAS!', '¡EJÉRCITO!', '¡REBELIÓN!'] },
            crystalSage: { dark: '#330033', light: '#aaccff', msgs: ['¡ESQUIRLAS ESPEJO!', '¡REFLEJO!', '¡DIMENSIÓN ROTA!'] },
            darkEmpress: { dark: '#1a0010', light: '#ff0033', msgs: ['¡ECLIPSE!', '¡CAOS!', '¡FIN DEL MUNDO!'] }
        };
        for (let key in generic) {
            this._defs[key] = this._genericPhaseBoss(generic[key]);
        }
    },

    /* === REY SLIME - jefe personalizado con 3 fases === */
    _slimeKingDef() {
        return {
            shootInterval: 35,
            specialInterval: 200,
            specialDuration: 80,
            update(boss, state) {
                const phase = Bosses.getPhase(boss);
                boss.y = Math.min(boss.y + 1.5, 140);
                const speed = phase === 1 ? 0.02 : (phase === 2 ? 0.035 : 0.05);
                const range = phase === 1 ? 0.3 : (phase === 2 ? 0.4 : 0.5);
                boss.x = state.canvasW / 2 + Math.sin(state.frames * speed) * (state.canvasW * range);
            },
            draw: function(ctx, x, y, size, t, hpRatio) {
                const phase = hpRatio > 0.66 ? 1 : (hpRatio > 0.33 ? 2 : 3);
                const bob = Math.sin(t * 0.1) * 8;
                ctx.save();
                ctx.translate(x, y + bob);
                const phaseColors = ['#33aa55', '#ffaa00', '#ff0033'];
                const auraColor = phaseColors[phase - 1];
                const aura = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * 0.8);
                aura.addColorStop(0, Bosses._hexToRgba(auraColor, 0.4));
                aura.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                const colors = [
                    ['#aaffaa', '#33aa55', '#0a3315'],
                    ['#ffddaa', '#cc6600', '#330a00'],
                    ['#ffaaaa', '#aa0033', '#330000']
                ];
                const pc = colors[phase - 1];
                const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.3, size * 0.1, 0, 0, size * 0.6);
                grad.addColorStop(0, pc[0]);
                grad.addColorStop(0.5, pc[1]);
                grad.addColorStop(1, pc[2]);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.55, size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.ellipse(-size * 0.2, -size * 0.25, size * 0.12, size * 0.07, 0, 0, Math.PI * 2);
                ctx.fill();
                // Corona
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#b8860b';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
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
                ctx.shadowBlur = 0;
                // Ojos
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.05, size * 0.1, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.05, size * 0.1, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = phase === 3 ? '#ff0033' : '#000';
                if (phase === 3) {
                    ctx.shadowColor = '#ff0033';
                    ctx.shadowBlur = 12;
                }
                ctx.beginPath();
                ctx.arc(-size * 0.13, -size * 0.05, size * 0.05, 0, Math.PI * 2);
                ctx.arc(size * 0.13, -size * 0.05, size * 0.05, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Boca
                ctx.fillStyle = '#220';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.2, size * 0.2, size * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * size * 0.07, size * 0.12);
                    ctx.lineTo(i * size * 0.07 + size * 0.03, size * 0.18);
                    ctx.lineTo(i * size * 0.07 + size * 0.06, size * 0.12);
                    ctx.fill();
                }
                // Fase 3: aura de fuego
                if (phase === 3) {
                    for (let i = 0; i < 5; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const r = size * 0.5;
                        ctx.fillStyle = ['#ff6600', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 3)];
                        ctx.globalAlpha = 0.6;
                        ctx.beginPath();
                        ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 4 + Math.random() * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.globalAlpha = 1;
                }
                ctx.restore();
            },
            special: function(boss, state) {
                const phase = Bosses.getPhase(boss);
                const count = phase === 1 ? 3 : (phase === 2 ? 5 : 7);
                for (let i = 0; i < count; i++) {
                    const a = (i / count) * Math.PI * 2;
                    state.entities.push({
                        x: boss.x, y: boss.y, isEnemy: true,
                        vx: Math.cos(a) * 4, vy: Math.sin(a) * 2 + 2,
                        hp: 30, maxHp: 30, size: 30, dead: false,
                        update() { this.x += this.vx; this.y += this.vy; this.vx *= 0.99; if (this.y > state.canvasH) this.dead = true; },
                        draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'slimeMinor', this.size, state.frames, this.hp / this.maxHp); }
                    });
                }
                if (phase >= 2) {
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            if (!boss.dead) {
                                const x = Math.random() * state.canvasW;
                                state.entities.push({
                                    x, y: -30, isEnemy: true, vx: 0, vy: 5,
                                    hp: 20, maxHp: 20, size: 25, dead: false,
                                    update() { this.x += this.vx; this.y += this.vy; if (this.y > state.canvasH) this.dead = true; },
                                    draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'slimeMinor', this.size, state.frames, this.hp / this.maxHp); }
                                });
                            }
                        }, i * 150);
                    }
                }
                if (phase === 3) {
                    const dx = state.hero.x - boss.x;
                    const dy = state.hero.y - boss.y;
                    const d = Math.hypot(dx, dy);
                    state.entities.push({
                        x: boss.x, y: boss.y, isEnemy: true,
                        vx: (dx / d) * 8, vy: (dy / d) * 8,
                        hp: 50, maxHp: 50, size: 50, dead: false, life: 60,
                        update() { this.x += this.vx; this.y += this.vy; this.life--; if (this.life <= 0 || this.y > state.canvasH || this.x < 0 || this.x > state.canvasW) this.dead = true; },
                        draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'slimeMajor', this.size, state.frames, this.hp / this.maxHp); }
                    });
                }
                AudioEngine.bossSpecial();
                const msg = phase === 1 ? '¡DIVISIÓN BABOSA!' : (phase === 2 ? '¡LLUVIA SLIME!' : '¡FURIA SLIME!');
                UI.showBossCast(msg);
                PopupSystem.warning(msg);
            }
        };
    },

    /* === Jefes genéricos con fases === */
    _genericPhaseBoss(opts) {
        const { dark, light, msgs } = opts;
        return {
            shootInterval: 28,
            specialInterval: 200,
            update(boss, state) {
                const phase = Bosses.getPhase(boss);
                boss.y = 130 + Math.sin(state.frames * 0.04) * 30;
                boss.x = state.canvasW / 2 + Math.sin(state.frames * (0.02 + phase * 0.01)) * (state.canvasW * (0.3 + phase * 0.05));
            },
            draw(ctx, x, y, size, t, hpRatio) {
                const phase = hpRatio > 0.66 ? 1 : (hpRatio > 0.33 ? 2 : 3);
                ctx.save();
                ctx.translate(x, y);
                const aura = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * (0.8 + phase * 0.1));
                aura.addColorStop(0, Bosses._hexToRgba(light, 0.4 + phase * 0.1));
                aura.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = aura;
                ctx.beginPath();
                ctx.arc(0, 0, size * (0.8 + phase * 0.1), 0, Math.PI * 2);
                ctx.fill();
                if (phase === 3) {
                    ctx.strokeStyle = `rgba(255, 0, 51, ${0.6 + Math.sin(t * 0.4) * 0.3})`;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = '#ff0033';
                    ctx.shadowBlur = 25;
                    ctx.beginPath();
                    ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.5, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
                const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.1, 0, 0, size * 0.5);
                grad.addColorStop(0, light);
                grad.addColorStop(0.6, dark);
                grad.addColorStop(1, '#000000');
                ctx.fillStyle = grad;
                ctx.shadowColor = light;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.ellipse(0, 0, size * 0.45, size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Corona
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                const cy = -size * 0.55;
                ctx.beginPath();
                ctx.moveTo(-size * 0.3, cy);
                ctx.lineTo(-size * 0.3, cy + size * 0.1);
                ctx.lineTo(size * 0.3, cy + size * 0.1);
                ctx.lineTo(size * 0.3, cy);
                ctx.lineTo(size * 0.2, cy - size * 0.05);
                ctx.lineTo(size * 0.1, cy - size * 0.15);
                ctx.lineTo(0, cy - size * 0.05);
                ctx.lineTo(-size * 0.1, cy - size * 0.15);
                ctx.lineTo(-size * 0.2, cy - size * 0.05);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#ff0033';
                ctx.shadowColor = '#ff0033';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(0, cy + size * 0.02, size * 0.04, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Ojos
                ctx.fillStyle = phase === 3 ? '#ff0033' : '#ff0';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(-size * 0.15, -size * 0.1, size * 0.07, 0, Math.PI * 2);
                ctx.arc(size * 0.15, -size * 0.1, size * 0.07, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                // Boca
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(0, size * 0.2, size * 0.15, size * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * size * 0.06, size * 0.13);
                    ctx.lineTo(i * size * 0.06 + size * 0.02, size * 0.25);
                    ctx.lineTo(i * size * 0.06 + size * 0.04, size * 0.13);
                    ctx.fill();
                }
                if (phase === 3) {
                    for (let i = 0; i < 5; i++) {
                        const a = t * 0.05 + i * Math.PI * 2 / 5;
                        ctx.fillStyle = light;
                        ctx.shadowColor = light;
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(Math.cos(a) * size * 0.7, Math.sin(a) * size * 0.7, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;
                }
                ctx.restore();
            },
            special(boss, state) {
                const phase = Bosses.getPhase(boss);
                const count = phase === 1 ? 12 : (phase === 2 ? 18 : 24);
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    state.entities.push(new Bullet(boss.x, boss.y, angle, 'BOSS', true, 6));
                }
                if (phase >= 2) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            const angle = Math.atan2(state.hero.y - boss.y, state.hero.x - boss.x);
                            for (let i = 0; i < 5; i++) {
                                state.entities.push(new Bullet(boss.x, boss.y, angle + (i - 2) * 0.2, 'BOSS', true, 7));
                            }
                        }
                    }, 400);
                }
                if (phase === 3) {
                    setTimeout(() => {
                        if (!boss.dead) {
                            for (let i = 0; i < 3; i++) {
                                const x = (i + 1) * state.canvasW / 4;
                                state.entities.push({
                                    x, y: -30, isEnemy: true, vx: 0, vy: 3,
                                    hp: 30, maxHp: 30, size: 35, dead: false,
                                    update() { this.x += this.vx; this.y += this.vy; if (this.y > state.canvasH) this.dead = true; },
                                    draw(ctx) { Assets.drawEnemy(ctx, this.x, this.y, 'darklingMinor', this.size, state.frames, this.hp / this.maxHp); }
                                });
                            }
                        }
                    }, 800);
                }
                AudioEngine.bossSpecial();
                UI.showBossCast(msgs[phase - 1]);
                PopupSystem.warning(msgs[phase - 1]);
            }
        };
    }
};

window.Bosses = Bosses;

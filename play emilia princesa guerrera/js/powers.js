/* ============================================================
   POWERS - Sistema de poderes mágicos mejorado
   10 poderes con efectos visuales mágicos mejorados
   ============================================================ */

const Powers = {
    /* Definición de poderes recogibles - más mágicos */
    defs: {
        triple: {
            name: 'Triple Disparo Estelar',
            desc: 'Tres proyectiles mágicos en abanico',
            duration: 600,
            color: '#6ef0ff',
            onPickup(state) {
                state.hero.powers.triple = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡TRIPLE ESTELAR!');
                ParticleFactory.magical(state.particles, state.hero.x, state.hero.y, '#6ef0ff');
                ParticleFactory.ring(state.particles, state.hero.x, state.hero.y, '#6ef0ff', 16);
            }
        },
        shield: {
            name: 'Escudo Cristal Mágico',
            desc: 'Burbuja mágica invencible con destellos',
            duration: 400,
            color: '#6ef0ff',
            onPickup(state) {
                state.hero.powers.shield = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡ESCUDO CRISTAL!');
                ParticleFactory.ring(state.particles, state.hero.x, state.hero.y, '#6ef0ff', 24);
                // Crear destellos orbitantes
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    state.particles.push(new Particle(state.hero.x, state.hero.y, {
                        vx: Math.cos(a) * 5,
                        vy: Math.sin(a) * 5,
                        color: '#ffffff', size: 4, life: 1.0, decay: 0.02,
                        shape: 'star'
                    }));
                }
            }
        },
        ally: {
            name: 'Príncipe Aliado',
            desc: 'Invoca un aliado que dispara por ti',
            duration: 0,
            color: '#ff9ed6',
            onPickup(state) {
                if (state.allies.length < 7) {
                    state.allies.push(new Ally());
                    AudioEngine.powerUp();
                    UI.showMotivation('¡PRÍNCIPE ALIADO!');
                    ParticleFactory.magical(state.particles, state.hero.x, state.hero.y, '#ff9ed6');
                } else {
                    state.score += 200;
                    AudioEngine.coin();
                }
            }
        },
        life: {
            name: 'Corazón Real',
            desc: 'Recuperas una vida con estallido mágico',
            duration: 0,
            color: '#ff3366',
            onPickup(state) {
                state.hero.lives = Math.min(state.hero.lives + 1, 5 + state.upgrades.maxLives);
                AudioEngine.powerUp();
                UI.showMotivation('¡CORAZÓN REAL!');
                ParticleFactory.heartBurst(state.particles, state.hero.x, state.hero.y);
                // Anillo adicional de corazones
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    state.particles.push(new Particle(state.hero.x, state.hero.y, {
                        vx: Math.cos(a) * 6,
                        vy: Math.sin(a) * 6,
                        color: '#ff3366', size: 5, life: 1.0, decay: 0.02,
                        shape: 'star'
                    }));
                }
            }
        },
        kiss: {
            name: 'Beso Encantado',
            desc: 'Disparos en forma de corazón que persiguen',
            duration: 600,
            color: '#ff6ec7',
            onPickup(state) {
                state.hero.powers.kiss = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡BESO ENCANTADO!');
                ParticleFactory.magical(state.particles, state.hero.x, state.hero.y, '#ff6ec7');
            }
        },
        rose: {
            name: 'Rosa Carmesí',
            desc: 'Disparos de rosa con pétalos perforantes',
            duration: 600,
            color: '#ff0066',
            onPickup(state) {
                state.hero.powers.rose = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡ROSA CARMESÍ!');
                // Lluvia de pétalos
                for (let i = 0; i < 20; i++) {
                    state.particles.push(new Particle(
                        state.hero.x + (Math.random() - 0.5) * 80,
                        state.hero.y - 30,
                        {
                            vx: (Math.random() - 0.5) * 4,
                            vy: -2 - Math.random() * 3,
                            color: '#ff0066', size: 4, life: 1.5, decay: 0.015,
                            shape: 'circle', gravity: 0.1
                        }
                    ));
                }
            }
        },
        speed: {
            name: 'Velocidad Estelar',
            desc: 'Cadencia de disparo mágica aumentada',
            duration: 600,
            color: '#ffff00',
            onPickup(state) {
                state.hero.powers.speed = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡VELOCIDAD ESTELAR!');
                // Rayos de velocidad
                for (let i = 0; i < 10; i++) {
                    const a = (i / 10) * Math.PI * 2;
                    state.particles.push(new Particle(state.hero.x, state.hero.y, {
                        vx: Math.cos(a) * 8,
                        vy: Math.sin(a) * 8,
                        color: '#ffff00', size: 4, life: 0.6, decay: 0.04,
                        shape: 'spark'
                    }));
                }
            }
        },
        bomb: {
            name: 'Bomba Mágica',
            desc: 'Explosión que limpia enemigos en radio amplio',
            duration: 1,
            color: '#ff3300',
            onPickup(state) {
                state.entities.forEach(e => {
                    if (e instanceof Enemy && !e.isBoss && !e.isSubBoss) {
                        e.dead = true;
                        state.score += 80;
                        ParticleFactory.explosion(null, state.particles, e.x, e.y, '#ff6600', 14);
                    }
                });
                // Onda de choque masiva
                ParticleFactory.shockwave(state.particles, state.hero.x, state.hero.y, '#ffaa00');
                ParticleFactory.ring(state.particles, state.hero.x, state.hero.y, '#ff3300', 32);
                AudioEngine.bossSpecial();
                UI.showMotivation('¡BOMBA MÁGICA!');
            }
        },
        starfall: {
            name: 'Lluvia de Estrellas',
            desc: 'Estrellas caen del cielo eliminando enemigos',
            duration: 300,
            color: '#FFD700',
            onPickup(state) {
                state.hero.powers.starfall = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡LLUVIA ESTELAR!');
                // Crear estrellas que caen inmediatamente
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        if (state.active) {
                            const x = Math.random() * state.canvasW;
                            for (let j = 0; j < 5; j++) {
                                state.particles.push(new Particle(x, j * 30, {
                                    vx: 0, vy: 12,
                                    color: '#FFD700', size: 5, life: 0.5, decay: 0.05,
                                    shape: 'star'
                                }));
                            }
                            // Daño en columna
                            state.entities.forEach(e => {
                                if (e instanceof Enemy && !e.isBoss && Math.abs(e.x - x) < 40) {
                                    e.hp -= 30;
                                    if (e.hp <= 0) {
                                        e.dead = true;
                                        state.score += 100;
                                        ParticleFactory.explosion(null, state.particles, e.x, e.y, '#FFD700', 10);
                                    }
                                }
                            });
                        }
                    }, i * 80);
                }
            }
        },
        timeWarp: {
            name: 'Distorsión Temporal',
            desc: 'Ralentiza el tiempo para los enemigos',
            duration: 360,
            color: '#aa66ff',
            onPickup(state) {
                state.hero.powers.timeWarp = this.duration;
                state.timeWarp = this.duration;
                AudioEngine.powerUp();
                UI.showMotivation('¡DISTORSIÓN TEMPORAL!');
                // Onda de distorsión
                for (let i = 0; i < 30; i++) {
                    const a = (i / 30) * Math.PI * 2;
                    state.particles.push(new Particle(state.hero.x, state.hero.y, {
                        vx: Math.cos(a) * 4,
                        vy: Math.sin(a) * 4,
                        color: '#aa66ff', size: 5, life: 1.2, decay: 0.02,
                        shape: 'circle'
                    }));
                }
            }
        }
    },

    /* Aplica el efecto del power-up y verifica combinaciones */
    pickup(state, type) {
        const def = this.defs[type];
        if (!def) return;
        def.onPickup(state);
        // Registrar power-up recogido para logros
        if (window.Achievements) {
            Achievements.onPowerUp();
        }
        // Verifica combinaciones
        ComboSystem.checkCombination(state, type);
    },

    /* Tick: actualiza timers */
    tick(state) {
        for (let p in state.hero.powers) {
            if (state.hero.powers[p] > 0) {
                state.hero.powers[p]--;
            }
        }
        // Time warp global
        if (state.timeWarp > 0) {
            state.timeWarp--;
            // Las entidades enemigas se mueven lento
            state.entities.forEach(e => {
                if (e instanceof Enemy || (e instanceof Bullet && e.isEnemy)) {
                    e.vx = (e.vx || 0) * 0.95;
                    e.vy = (e.vy || 0) * 0.95;
                }
            });
        }
        // Calcula bulletType actual - respeta el tipo base de la princesa
        const baseType = state.hero.baseBulletType || 'NORMAL';
        if (state.hero.comboBonus === 'laser' || state.hero.comboBonus === 'fury') {
            // ya está seteado por combo
        } else if (state.hero.powers.rose > 0) {
            state.hero.bulletType = 'ROSE';
        } else if (state.hero.powers.kiss > 0) {
            state.hero.bulletType = 'KISS';
        } else if (state.hero.comboBonus === 'tripleRose' || state.hero.comboBonus === 'wrath' || state.hero.comboBonus === 'allyBarrage') {
            // ya está seteado
        } else {
            // Vuelve al tipo base de la princesa (elemental o NORMAL)
            state.hero.bulletType = baseType;
        }
    },

    /* Lista de poderes para spawn aleatorio (incluye nuevos) */
    spawnTypes: ['triple', 'shield', 'ally', 'life', 'kiss', 'rose', 'speed', 'bomb', 'starfall', 'timeWarp']
};

window.Powers = Powers;

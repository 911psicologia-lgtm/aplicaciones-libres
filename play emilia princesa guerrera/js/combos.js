/* ============================================================
   COMBOS - Sistema de combos y combinaciones de disparos
   ============================================================ */

const ComboSystem = {
    /* Tiers de combo: cada cierto número de hits seguidos, subes de tier */
    tiers: [
        { hits: 5,   name: 'Doble Puntaje', color: '#FFD700', effect: 'doubleScore', duration: 360 },
        { hits: 10,  name: 'Triple Disparo', color: '#6ef0ff', effect: 'tripleShot', duration: 360 },
        { hits: 15,  name: 'Bomba Estelar', color: '#ff6600', effect: 'bomb', duration: 1 },
        { hits: 20,  name: 'Láser Mágico', color: '#ffff00', effect: 'laserMode', duration: 360 },
        { hits: 25,  name: 'Velocidad Estelar', color: '#88ff66', effect: 'speed', duration: 360 },
        { hits: 30,  name: 'Ira de Princesa', color: '#ff00cc', effect: 'princessFury', duration: 300 },
        { hits: 50,  name: 'Furia Legendaria', color: '#FFD700', effect: 'princessFury', duration: 600 }
    ],

    /* Tipos de combinaciones: según la secuencia de poderes activos, se desbloquean combinaciones */
    combinations: [
        {
            id: 'roseStorm',
            name: 'Tormenta de Rosas',
            requires: ['rose', 'triple'],
            desc: 'Rosas + Triple = Lluvia de pétalos en abanico amplio',
            apply(state) {
                state.hero.bulletType = 'ROSE';
                state.hero.comboBonus = 'tripleRose';
                state.hero.comboBonusTimer = 360;
                UI.showMotivation('TORMENTA DE ROSAS');
                AudioEngine.comboBig();
            }
        },
        {
            id: 'kissBeam',
            name: 'Rayo de Besos',
            requires: ['kiss', 'speed'],
            desc: 'Besos + Velocidad = Disparo rápido teledirigido',
            apply(state) {
                state.hero.bulletType = 'KISS';
                state.hero.fireRateBoost = 1.8;
                state.hero.comboBonusTimer = 360;
                UI.showMotivation('RAYO DE BESOS');
                AudioEngine.comboBig();
            }
        },
        {
            id: 'shieldWrath',
            name: 'Ira Escudada',
            requires: ['shield', 'triple'],
            desc: 'Escudo + Triple = Contraataque automático en todas direcciones',
            apply(state) {
                state.hero.powers.shield = Math.max(state.hero.powers.shield, 360);
                state.hero.powers.triple = Math.max(state.hero.powers.triple, 360);
                state.hero.comboBonus = 'wrath';
                state.hero.comboBonusTimer = 360;
                UI.showMotivation('IRA ESCUDADA');
                AudioEngine.comboBig();
            }
        },
        {
            id: 'allyBarrage',
            name: 'Tropas Reales',
            requires: ['ally', 'speed'],
            desc: 'Aliados + Velocidad = Cadencia de disparo triple para todos',
            apply(state) {
                state.hero.fireRateBoost = 1.5;
                state.hero.comboBonus = 'allyBarrage';
                state.hero.comboBonusTimer = 360;
                UI.showMotivation('TROPAS REALES');
                AudioEngine.comboBig();
            }
        },
        {
            id: 'bombStrike',
            name: 'Golpe Bombástico',
            requires: ['bomb', 'rose'],
            desc: 'Bomba + Rosas = Explosión de pétalos que limpia pantalla',
            apply(state) {
                // Limpia todos los enemigos en pantalla
                state.entities.forEach(e => {
                    if (e instanceof Enemy && !e.isBoss) {
                        e.dead = true;
                        state.score += 50;
                        ParticleFactory.explosion(null, state.particles, e.x, e.y, '#ff6699', 12);
                    }
                });
                ParticleFactory.shockwave(state.particles, state.hero.x, state.hero.y, '#ff0066');
                UI.showMotivation('GOLPE BOMBÁSTICO');
                AudioEngine.princessFury();
            }
        },
        {
            id: 'pierceLaser',
            name: 'Láser Perforante',
            requires: ['triple', 'speed'],
            desc: 'Triple + Velocidad = Disparos perforantes rápidos',
            apply(state) {
                state.hero.bulletType = 'PIERCE';
                state.hero.fireRateBoost = 1.4;
                state.hero.comboBonusTimer = 360;
                UI.showMotivation('LÁSER PERFORANTE');
                AudioEngine.comboBig();
            }
        }
    ],

    /* Verifica si una combinación debe activarse al recoger un power-up */
    checkCombination(state, newPower) {
        // Recolecta todos los poderes activos
        const active = [];
        for (let p in state.hero.powers) {
            if (state.hero.powers[p] > 0 && p !== newPower) active.push(p);
        }
        active.push(newPower);

        // Busca combinaciones que coincidan
        for (let combo of this.combinations) {
            if (combo.requires.every(r => active.includes(r))) {
                // Verifica que no esté activa ya
                if (!state.activeCombos.has(combo.id)) {
                    combo.apply(state);
                    state.activeCombos.add(combo.id);
                    UI.addComboChip(combo.name);
                    setTimeout(() => {
                        state.activeCombos.delete(combo.id);
                        UI.removeComboChip(combo.id);
                    }, combo.apply.length ? 360 * 16 : 360); // 60s timeout
                    return combo;
                }
            }
        }
        return null;
    },

    /* Procesa el incremento de combo al acertar un disparo */
    registerHit(state) {
        state.hero.combo++;
        state.hero.comboTimer = 180; // 3 segundos para mantener combo

        // Verifica si subió de tier
        for (let tier of this.tiers) {
            if (state.hero.combo === tier.hits) {
                this.activateTier(state, tier);
                return tier;
            }
        }
        return null;
    },

    activateTier(state, tier) {
        switch (tier.effect) {
            case 'doubleScore':
                state.hero.scoreMultiplier = 2;
                state.hero.scoreMultiplierTimer = tier.duration;
                break;
            case 'tripleShot':
                state.hero.powers.triple = Math.max(state.hero.powers.triple, tier.duration);
                break;
            case 'bomb':
                // Limpiar pantalla con bomba
                state.entities.forEach(e => {
                    if (e instanceof Enemy && !e.isBoss) {
                        e.dead = true;
                        state.score += 50;
                        ParticleFactory.explosion(null, state.particles, e.x, e.y, '#ff6600', 10);
                    }
                });
                ParticleFactory.shockwave(state.particles, state.hero.x, state.hero.y, '#FFD700');
                break;
            case 'laserMode':
                state.hero.bulletType = 'LASER';
                state.hero.comboBonus = 'laser';
                state.hero.comboBonusTimer = tier.duration;
                break;
            case 'speed':
                state.hero.fireRateBoost = 1.5;
                state.hero.comboBonusTimer = tier.duration;
                break;
            case 'princessFury':
                state.hero.powers.shield = Math.max(state.hero.powers.shield, tier.duration);
                state.hero.powers.triple = Math.max(state.hero.powers.triple, tier.duration);
                state.hero.fireRateBoost = 2.0;
                state.hero.scoreMultiplier = 3;
                state.hero.scoreMultiplierTimer = tier.duration;
                state.hero.comboBonus = 'fury';
                state.hero.comboBonusTimer = tier.duration;
                ParticleFactory.shockwave(state.particles, state.hero.x, state.hero.y, '#ff00cc');
                AudioEngine.princessFury();
                break;
        }
        UI.showMotivation(tier.name.toUpperCase());
        AudioEngine.comboBig();
    },

    /* Resetea el combo (al recibir daño) */
    reset(state) {
        if (state.hero.combo > 0) {
            state.hero.combo = 0;
            state.hero.comboTimer = 0;
            state.hero.scoreMultiplier = 1;
            state.hero.scoreMultiplierTimer = 0;
            state.hero.fireRateBoost = 1;
            state.hero.comboBonus = null;
            state.hero.comboBonusTimer = 0;
            state.hero.bulletType = 'NORMAL';
            state.activeCombos.clear();
            UI.clearComboChips();
        }
    },

    /* Tick: actualiza timers del combo */
    tick(state) {
        if (state.hero.combo > 0) {
            state.hero.comboTimer--;
            if (state.hero.comboTimer <= 0) {
                this.reset(state);
            }
        }
        if (state.hero.scoreMultiplierTimer > 0) {
            state.hero.scoreMultiplierTimer--;
            if (state.hero.scoreMultiplierTimer <= 0) {
                state.hero.scoreMultiplier = 1;
            }
        }
        if (state.hero.comboBonusTimer > 0) {
            state.hero.comboBonusTimer--;
            if (state.hero.comboBonusTimer <= 0) {
                state.hero.comboBonus = null;
                state.hero.fireRateBoost = 1;
                state.hero.bulletType = 'NORMAL';
            }
        }
    }
};

window.ComboSystem = ComboSystem;

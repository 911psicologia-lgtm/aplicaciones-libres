/* ============================================================
   GAME - Loop principal, estado y wiring de todos los sistemas
   ============================================================ */

const Game = {
    state: null,
    canvas: null,
    ctx: null,
    bgCanvas: null,
    bgCtx: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bgCanvas = document.getElementById('bg-canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');

        UI.init();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input
        window.addEventListener('mousemove', e => {
            if (!this.state) return;
            this.state.input.x = e.clientX;
            this.state.input.y = e.clientY;
        });
        window.addEventListener('touchmove', e => {
            e.preventDefault();
            if (!this.state || !e.touches[0]) return;
            this.state.input.x = e.touches[0].clientX;
            this.state.input.y = e.touches[0].clientY;
        }, { passive: false });
        window.addEventListener('touchstart', e => {
            if (!this.state || !e.touches[0]) return;
            this.state.input.x = e.touches[0].clientX;
            this.state.input.y = e.touches[0].clientY;
        });

        // Estado inicial (pre-juego) para que UI funcione
        this.state = {
            canvasW: this.canvas.width,
            canvasH: this.canvas.height,
            frames: 0,
            score: 0,
            coins: Storage.loadCoins(),
            levelIdx: 0,
            levelStartScore: 0,
            nick: 'EMILIA',
            hero: { x: 0, y: 0, lives: 5, combo: 0, powers: {}, bulletType: 'NORMAL' },
            allies: [],
            entities: [],
            obstacles: [],
            particles: [],
            input: { x: 0, y: 0 },
            upgrades: Storage.loadUpgrades(),
            activeCombos: new Set(),
            bossActive: false,
            boss: null,
            active: false,
            paused: false
        };

        UI.updateRanking();
        UI.showScreen('start');

        // Carga todas las imágenes asíncronamente
        ImageLoader.loadAll(() => {
            console.log('All images loaded');
            // Una vez cargadas, actualiza el UI del hangar si está visible
            if (Game.state && !Game.state.active) {
                // ok
            }
        });
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.bgCanvas.width = window.innerWidth;
        this.bgCanvas.height = window.innerHeight;
        if (this.state) {
            this.state.canvasW = this.canvas.width;
            this.state.canvasH = this.canvas.height;
        }
    },

    /* ============ INICIO DE PARTIDA ============ */
    startGame(princessKey) {
        AudioEngine.init();
        AudioEngine.resume();

        const name = document.getElementById('p-name').value || 'EMILIA';
        const upgrades = Storage.loadUpgrades();
        const coins = Storage.loadCoins();
        const pKey = princessKey || 'princess_pink';
        const pDef = PrincessDefs[pKey] || PrincessDefs.princess_pink;

        this.state = {
            canvasW: this.canvas.width,
            canvasH: this.canvas.height,
            frames: 0,
            score: 0,
            coins,
            levelIdx: 0,
            levelStartScore: 0,
            nick: name,
            princessKey: pKey,
            princessDef: pDef,
            hero: null,
            allies: [],
            entities: [],
            obstacles: [],
            particles: [],
            input: { x: this.canvas.width / 2, y: this.canvas.height * 0.75 },
            upgrades,
            activeCombos: new Set(),
            bossActive: false,
            boss: null,
            active: true,
            paused: false,
            timeWarp: 0,
            spawnTimers: { enemy: 0, point: 0, power: 0, obstacle: 0, chest: 600, floater: 200 },
            subBossTimer: 1200
        };

        Hero.init(this.state);
        UI.el.hudNick.textContent = name + ' · ' + pDef.name;
        UI.hideAllScreens();
        this.loadLevel(0);
        AudioEngine.levelStart();
        PopupSystem.special(pDef.name, this.state.canvasW / 2, this.state.canvasH / 2);
        this.loop();
    },

    /* ============ CARGAR PARTIDA ============ */
    loadGame() {
        AudioEngine.init();
        AudioEngine.resume();
        const save = Storage.loadGame();
        if (!save) { this.startGame('princess_pink'); return; }
        const upgrades = Storage.loadUpgrades();
        const coins = Storage.loadCoins();
        const pKey = save.princessKey || 'princess_pink';
        const pDef = PrincessDefs[pKey] || PrincessDefs.princess_pink;

        this.state = {
            canvasW: this.canvas.width,
            canvasH: this.canvas.height,
            frames: 0,
            score: save.score || 0,
            coins: coins + (save.coins || 0),
            levelIdx: save.levelIdx || 0,
            levelStartScore: save.score || 0,
            nick: save.nick || 'EMILIA',
            princessKey: pKey,
            princessDef: pDef,
            hero: null,
            allies: [],
            entities: [],
            obstacles: [],
            particles: [],
            input: { x: this.canvas.width / 2, y: this.canvas.height * 0.75 },
            upgrades,
            activeCombos: new Set(),
            bossActive: false,
            boss: null,
            active: true,
            paused: false,
            timeWarp: 0,
            spawnTimers: { enemy: 0, point: 0, power: 0, obstacle: 0, chest: 600, floater: 200 },
            subBossTimer: 1200
        };

        Hero.init(this.state);
        this.state.hero.lives = save.lives || 5;
        for (let i = 0; i < (save.allies || 0); i++) {
            this.state.allies.push(new Ally());
        }
        UI.el.hudNick.textContent = this.state.nick + ' · ' + pDef.name;
        UI.hideAllScreens();
        this.loadLevel(this.state.levelIdx);
        AudioEngine.levelStart();
        this.loop();
    },

    /* ============ CARGAR NIVEL ============ */
    loadLevel(idx) {
        this.state.levelIdx = idx;
        this.state.levelStartScore = this.state.score;
        this.state.bossActive = false;
        this.state.boss = null;
        this.state.entities = this.state.entities.filter(e => e instanceof Bullet && !e.isEnemy);
        UI.hideBossUI();
        const level = LEVELS[idx];
        UI.setLevel(level);
        UI.showMotivation(level.n.toUpperCase());

        // Escudo inicial
        if (this.state.upgrades.shieldStart > 0) {
            this.state.hero.powers.shield = this.state.upgrades.shieldStart * 180;
        }
    },

    nextLevel() {
        const next = this.state.levelIdx + 1;
        if (next >= LEVELS.length) {
            this.victory();
            return;
        }
        UI.hideAllScreens();
        this.loadLevel(next);
        AudioEngine.levelStart();
    },

    /* ============ LOOP PRINCIPAL ============ */
    loop() {
        if (!this.state.active) return;
        if (this.state.paused) {
            requestAnimationFrame(() => this.loop());
            return;
        }
        this.state.frames++;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    },

    /* ============ UPDATE ============ */
    update() {
        const state = this.state;

        // Fondo
        this._updateBackground();

        // Heroína
        Hero.update(state);
        Powers.tick(state);
        ComboSystem.tick(state);

        // Aliados
        state.allies.forEach((a, i) => a.update(i, state.allies.length, state));

        // Spawns
        this._handleSpawns();

        // Entidades
        for (let i = state.entities.length - 1; i >= 0; i--) {
            const e = state.entities[i];
            if (e.update) e.update(state);
            if (e.dead) {
                state.entities.splice(i, 1);
            }
        }

        // Obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const o = state.obstacles[i];
            o.update(state);
            if (o.dead) state.obstacles.splice(i, 1);
        }

        // Boss
        if (state.boss) {
            state.boss.update(state);
            UI.updateBossHp(state.boss.hp / state.boss.maxHp);
            if (state.boss.dead) {
                this._onBossDeath();
            }
        }

        // Colisiones
        this._handleCollisions();

        // Partículas
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.update();
            if (p.dead) state.particles.splice(i, 1);
        }

        // UI
        UI.updateHUD();

        // Auto-guardado
        if (state.frames % 300 === 0) {
            Storage.saveGame({
                score: state.score,
                coins: state.coins,
                levelIdx: state.levelIdx,
                hero: { lives: state.hero.lives },
                allies: state.allies,
                nick: state.nick
            });
        }

        // Condición de victoria de nivel
        if (!state.bossActive && state.score - state.levelStartScore >= LEVELS[state.levelIdx].target - state.levelStartScore) {
            this._spawnBoss();
        }
    },

    _handleSpawns() {
        const state = this.state;
        if (state.bossActive) return;

        // Enemigos menores (frecuentes)
        state.spawnTimers.enemy--;
        if (state.spawnTimers.enemy <= 0) {
            state.entities.push(new Enemy({ tier: 'minor' }));
            // Cadencia más rápida con el nivel
            state.spawnTimers.enemy = Math.max(12, 40 - state.levelIdx * 2);
        }

        // Enemigos medios (cada cierto tiempo, disparan)
        state.spawnTimers.medium = (state.spawnTimers.medium || 200) - 1;
        if (state.spawnTimers.medium <= 0) {
            state.entities.push(new Enemy({ tier: 'medium' }));
            state.spawnTimers.medium = 150 + Math.random() * 100;
        }

        // Enemigos mayores (menos frecuentes, más peligrosos)
        state.spawnTimers.major = (state.spawnTimers.major || 400) - 1;
        if (state.spawnTimers.major <= 0) {
            state.entities.push(new Enemy({ tier: 'major' }));
            state.spawnTimers.major = 350 + Math.random() * 200;
            AudioEngine.warning();
        }

        // Sub-jefes (cada cierto tiempo)
        state.subBossTimer--;
        if (state.subBossTimer <= 0) {
            // Subjefe = enemigo mayor con mas HP
            const sb = new Enemy({ tier: 'major', isSubBoss: true, size: 80 });
            sb.hp *= 3;
            sb.maxHp = sb.hp;
            sb.scoreValue = 600;
            state.entities.push(sb);
            state.subBossTimer = 1500 + Math.random() * 500;
            AudioEngine.warning();
            PopupSystem.warning('¡SUBJEFE!');
        }

        // Power-ups
        state.spawnTimers.power--;
        if (state.spawnTimers.power <= 0) {
            const types = Powers.spawnTypes;
            const type = types[Math.floor(Math.random() * types.length)];
            const x = 80 + Math.random() * (state.canvasW - 160);
            state.entities.push(new PowerUpItem(x, -30, type));
            state.spawnTimers.power = 500 + Math.random() * 300;
        }

        // Obstáculos
        state.spawnTimers.obstacle--;
        if (state.spawnTimers.obstacle <= 0) {
            state.obstacles.push(ObstacleFactory.spawn(state));
            state.spawnTimers.obstacle = 200 + Math.random() * 150;
        }

        // Elementos flotantes
        state.spawnTimers.floater--;
        if (state.spawnTimers.floater <= 0) {
            state.entities.push(ObstacleFactory.spawnFloater(state));
            state.spawnTimers.floater = 150 + Math.random() * 150;
        }

        // Cofres
        state.spawnTimers.chest--;
        if (state.spawnTimers.chest <= 0) {
            Prizes.spawnChest(state);
            state.spawnTimers.chest = 900 + Math.random() * 600;
        }
    },

    _spawnBoss() {
        const state = this.state;
        const level = LEVELS[state.levelIdx];
        state.bossActive = true;
        state.boss = new Boss();
        UI.showBossUI(level.bossName, level.bossSpecial);
        UI.showMotivation('¡JEFE!: ' + level.bossName.toUpperCase());
        AudioEngine.warning();
        setTimeout(() => AudioEngine.warning(), 300);
        // Limpia entidades no-jefe
        state.entities = state.entities.filter(e => e instanceof Bullet);
        // Escudo protector
        state.hero.powers.shield = Math.max(state.hero.powers.shield, 240);
    },

    _onBossDeath() {
        const state = this.state;
        AudioEngine.bossDie();
        ParticleFactory.shockwave(state.particles, state.boss.x, state.boss.y, '#FFD700');
        ParticleFactory.sparkle(state.particles, state.boss.x, state.boss.y, '#FFD700', 30);
        state.score += 1000 + state.levelIdx * 200;
        UI.hideBossUI();

        // Recompensas
        const rewards = Prizes.calculateRewards(state);
        Prizes.applyRewards(state, rewards);
        UI.showRewards(rewards);
        UI.showScreen('levelClear');
        AudioEngine.levelClear();

        state.boss = null;
        state.bossActive = false;

        // Si es el último nivel, victoria
        if (state.levelIdx >= LEVELS.length - 1) {
            setTimeout(() => this.victory(), 100);
        }
    },

    /* ============ COLISIONES ============ */
    _handleCollisions() {
        const state = this.state;
        const hero = state.hero;

        // Balas vs Enemigos / Jefes / Obstáculos
        for (let e of state.entities) {
            if (!(e instanceof Bullet) || e.isEnemy) continue;

            // vs Boss
            if (state.boss && !state.boss.dead) {
                const d = Math.hypot(e.x - state.boss.x, e.y - state.boss.y);
                if (d < state.boss.size * 0.5) {
                    state.boss.hp -= e.damage;
                    AudioEngine.bossHit();
                    ParticleFactory.sparkle(state.particles, e.x, e.y, '#FFD700', 4);
                    if (e.pierce > 0) {
                        e.pierce--;
                    } else {
                        e.dead = true;
                    }
                    if (state.boss.hp <= 0) {
                        state.boss.dead = true;
                    }
                    continue;
                }
            }

            // vs Enemigos
            for (let en of state.entities) {
                if (!(en instanceof Enemy) || en.dead) continue;
                const d = Math.hypot(e.x - en.x, e.y - en.y);
                if (d < en.size * 0.5) {
                    en.hp -= e.damage;
                    AudioEngine.enemyHit();
                    ParticleFactory.sparkle(state.particles, e.x, e.y, '#fff', 3);
                    // Popup de daño rápido
                    if (e.crit) {
                        PopupSystem.crit(e.x, e.y);
                    } else {
                        PopupSystem.hit(Math.floor(e.damage), e.x, e.y, '#fff');
                    }
                    // Comportamientos elementales especiales
                    let shouldDie = true;
                    if (e.type === 'ICE') {
                        // Hielo perfora 2 enemigos
                        e.pierce = Math.max(e.pierce, 2);
                    } else if (e.type === 'FIRE') {
                        // Fuego explota: daño en área
                        ParticleFactory.explosion(null, state.particles, en.x, en.y, '#ff6600', 12);
                        state.entities.forEach(other => {
                            if (other instanceof Enemy && other !== en && !other.dead) {
                                const od = Math.hypot(en.x - other.x, en.y - other.y);
                                if (od < 80) {
                                    other.hp -= e.damage * 0.5;
                                    PopupSystem.hit(Math.floor(e.damage * 0.5), other.x, other.y, '#ff6600');
                                }
                            }
                        });
                    } else if (e.type === 'LIGHTNING') {
                        // Rayo salta al enemigo más cercano
                        let closest = null, closestD = 150;
                        state.entities.forEach(other => {
                            if (other instanceof Enemy && other !== en && !other.dead) {
                                const od = Math.hypot(en.x - other.x, en.y - other.y);
                                if (od < closestD) {
                                    closest = other;
                                    closestD = od;
                                }
                            }
                        });
                        if (closest) {
                            // Crear rayo visual
                            for (let i = 0; i < 5; i++) {
                                const t = i / 5;
                                state.particles.push(new Particle(
                                    en.x + (closest.x - en.x) * t + (Math.random() - 0.5) * 10,
                                    en.y + (closest.y - en.y) * t + (Math.random() - 0.5) * 10,
                                    { vx: 0, vy: 0, color: '#ffff00', size: 3, life: 0.3, decay: 0.1, shape: 'spark' }
                                ));
                            }
                            closest.hp -= e.damage * 0.6;
                            PopupSystem.hit(Math.floor(e.damage * 0.6), closest.x, closest.y, '#ffff00');
                        }
                    } else if (e.type === 'SHADOW') {
                        // Sombra perfora todo
                        e.pierce = 999;
                    } else if (e.type === 'LIGHT') {
                        // Luz rebota: cambia dirección
                        const newAngle = Math.atan2(state.hero.y - e.y, state.hero.x - e.x) + (Math.random() - 0.5) * 0.5;
                        e.vx = Math.cos(newAngle) * 18;
                        e.vy = Math.sin(newAngle) * 18;
                        shouldDie = false;
                        e.life = 100; // más vida
                    } else if (e.type === 'NATURE') {
                        // Naturaleza envenena: daño continuo simulado con score
                        ParticleFactory.sparkle(state.particles, en.x, en.y, '#88ff66', 5);
                    }
                    if (e.pierce > 0) {
                        e.pierce--;
                    } else if (shouldDie) {
                        e.dead = true;
                    }
                    if (en.hp <= 0) {
                        en.dead = true;
                        const points = Math.floor(en.scoreValue * hero.scoreMultiplier * hero.comboMultiplier);
                        state.score += points;
                        AudioEngine.enemyDie();
                        ParticleFactory.explosion(null, state.particles, en.x, en.y, '#ff6600', 12);
                        // Popup de score
                        PopupSystem.quick('+' + points, en.x, en.y, {
                            color: '#FFD700', size: 22, scale: 1.1, life: 0.8, decay: 0.03
                        });
                        // Monedas (con bonus de princesa)
                        if (Math.random() < 0.4) {
                            const coinCount = hero.princessDef && hero.princessDef.passiveEffect === 'coinBonus' ? 2 : 1;
                            for (let k = 0; k < coinCount; k++) {
                                state.entities.push(new Coin(en.x, en.y));
                            }
                        }
                        // Combo
                        const comboResult = ComboSystem.registerHit(state);
                        if (comboResult) {
                            PopupSystem.combo(comboResult.name.toUpperCase(), en.x, en.y - 30);
                        }
                        // Streak popup
                        if (hero.combo >= 2 && hero.combo % 2 === 0) {
                            PopupSystem.streak(hero.combo, en.x, en.y - 60);
                        }
                    }
                    break;
                }
            }

            // vs Floaters (elementos flotantes a destruir)
            for (let f of state.entities) {
                if (!f.isFloater || f.dead) continue;
                const d = Math.hypot(e.x - f.x, e.y - f.y);
                if (d < f.size) {
                    f.hp -= e.damage;
                    ParticleFactory.sparkle(state.particles, e.x, e.y, '#fff', 3);
                    PopupSystem.hit(Math.floor(e.damage), e.x, e.y, '#FFD700');
                    if (e.pierce > 0) {
                        e.pierce--;
                    } else {
                        e.dead = true;
                    }
                    if (f.hp <= 0) {
                        f.dead = true;
                        const points = 50;
                        state.score += points;
                        AudioEngine.coin();
                        ParticleFactory.explosion(null, state.particles, f.x, f.y, '#FFD700', 10);
                        PopupSystem.bonus('+' + points + ' BONUS', f.x, f.y);
                        // Drop de moneda o power-up
                        if (Math.random() < 0.6) {
                            state.entities.push(new Coin(f.x, f.y));
                        }
                    }
                    break;
                }
            }

            // vs Obstáculos
            for (let o of state.obstacles) {
                if (o.dead) continue;
                const d = Math.hypot(e.x - o.x, e.y - o.y);
                if (d < o.size * 0.5) {
                    o.hp -= e.damage;
                    ParticleFactory.sparkle(state.particles, e.x, e.y, '#fff', 3);
                    if (e.pierce > 0) {
                        e.pierce--;
                    } else {
                        e.dead = true;
                    }
                    if (o.hp <= 0) {
                        o.dead = true;
                        AudioEngine.obstacleBreak();
                        ParticleFactory.explosion(null, state.particles, o.x, o.y, '#888', 10);
                        if (Math.random() < o.dropChance) {
                            state.entities.push(new Coin(o.x, o.y));
                        }
                    }
                    break;
                }
            }

            // vs Cofre
            for (let c of state.entities) {
                if (!c.isChest || c.dead) continue;
                const d = Math.hypot(e.x - c.x, e.y - c.y);
                if (d < 30) {
                    c.dead = true;
                    Prizes.openChest(state, c);
                    e.dead = true;
                    break;
                }
            }
        }

        // Enemigos / Balas enemigas vs Heroína
        if (hero.invuln <= 0) {
            for (let e of state.entities) {
                if (e.dead) continue;
                let hit = false;
                if (e instanceof Enemy) {
                    const d = Math.hypot(hero.x - e.x, hero.y - e.y);
                    if (d < 40) hit = true;
                } else if (e instanceof Bullet && e.isEnemy) {
                    const d = Math.hypot(hero.x - e.x, hero.y - e.y);
                    if (d < 25) hit = true;
                } else if (e.isCoin) {
                    // Las monedas no dañan
                } else if (e.isPowerUp) {
                    const d = Math.hypot(hero.x - e.x, hero.y - e.y);
                    if (d < 35) {
                        Powers.pickup(state, e.type);
                        e.dead = true;
                    }
                } else if (e.isChest) {
                    // El cofre no daña, requiere disparo
                } else if (e.type === 'toxicCloud' || e.type === 'ghostWave') {
                    const d = Math.hypot(hero.x - e.x, hero.y - e.y);
                    if (d < e.size) hit = true;
                }
                if (hit) {
                    Hero.hurt(state);
                    if (!(e instanceof Enemy) || e.isSubBoss) {
                        // los esbirros normales no mueren por contacto
                    }
                    e.dead = true;
                    break;
                }
            }

            // Obstáculos vs Heroína
            for (let o of state.obstacles) {
                if (o.dead || !o.damages) continue;
                const d = Math.hypot(hero.x - o.x, hero.y - o.y);
                if (d < o.size * 0.5) {
                    Hero.hurt(state);
                    break;
                }
            }
        }
    },

    /* ============ DRAW ============ */
    draw() {
        const state = this.state;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Obstáculos (detrás)
        state.obstacles.forEach(o => o.draw(ctx, state.frames));

        // Entidades
        state.entities.forEach(e => {
            if (e.draw) e.draw(ctx);
        });

        // Boss
        if (state.boss) {
            state.boss.draw(ctx);
        }

        // Aliados
        state.allies.forEach(a => a.draw(ctx));

        // Heroína
        Hero.draw(ctx, state);

        // Partículas (encima)
        state.particles.forEach(p => p.draw(ctx));

        // Popups emergentes (lo último, encima de todo)
        PopupSystem.tick(ctx);
    },

    /* ============ FONDO DINÁMICO REALISTA (sin scroll vertical) ============ */
    _updateBackground() {
        const state = this.state;
        const level = LEVELS[state.levelIdx];
        const bg = this.bgCtx;
        const W = this.bgCanvas.width;
        const H = this.bgCanvas.height;

        // Si hay imagen de fondo realista, úsala
        if (level.bgImage && ImageLoader.has(level.bgImage)) {
            // Limpiar canvas
            bg.clearRect(0, 0, W, H);

            // Calcular dimensiones para cubrir pantalla manteniendo aspect ratio
            const img = ImageLoader.get(level.bgImage);
            const imgRatio = img.width / img.height;
            const canvasRatio = W / H;
            let dw, dh;
            if (imgRatio > canvasRatio) {
                dh = H;
                dw = dh * imgRatio;
            } else {
                dw = W;
                dh = dw / imgRatio;
            }
            // Movimiento lateral sutil (no scroll vertical)
            const lateralOffset = Math.sin(state.frames * 0.005) * 20;
            const dx = (W - dw) / 2 + lateralOffset;
            const dy = (H - dh) / 2;

            // Dibujar imagen estática con sutil drift lateral
            bg.drawImage(img, dx, dy, dw, dh);

            // Overlay de color del nivel (sutil, para mantener la identidad temática)
            bg.fillStyle = this._hexToRgba(level.bg.deep, 0.2);
            bg.fillRect(0, 0, W, H);

            // Estrellas/particles animadas encima (pocas para no sobrecargar)
            bg.fillStyle = level.bg.stars;
            bg.globalAlpha = 0.7;
            for (let i = 0; i < 20; i++) {
                const x = (i * 137 + state.frames * 0.3) % W;
                const y = (i * 79) % H;
                const size = (i % 3) * 0.4 + 0.4;
                const a = 0.3 + (Math.sin(state.frames * 0.05 + i) + 1) * 0.3;
                bg.globalAlpha = a * 0.7;
                bg.beginPath();
                bg.arc(x, y, size, 0, Math.PI * 2);
                bg.fill();
            }
            bg.globalAlpha = 1;

            // Brillo del color de acento (sutil)
            const nebGrad = bg.createRadialGradient(W * 0.5, H * 0.3, 10, W * 0.5, H * 0.3, W * 0.6);
            nebGrad.addColorStop(0, this._hexToRgba(level.bg.accent, 0.1));
            nebGrad.addColorStop(1, 'rgba(0,0,0,0)');
            bg.fillStyle = nebGrad;
            bg.fillRect(0, 0, W, H);

            // Viñeta para profundidad
            const vignette = bg.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
            bg.fillStyle = vignette;
            bg.fillRect(0, 0, W, H);
        } else {
            // Fallback al gradiente original
            const grad = bg.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, level.bg.deep);
            grad.addColorStop(0.5, level.bg.mid);
            grad.addColorStop(1, level.bg.deep);
            bg.fillStyle = grad;
            bg.fillRect(0, 0, W, H);

            // Estrellas
            bg.fillStyle = level.bg.stars;
            for (let i = 0; i < 50; i++) {
                const x = (i * 137 + state.frames * 0.3) % W;
                const y = (i * 79 + state.frames * 0.5) % H;
                const size = (i % 3) * 0.5 + 0.5;
                const a = 0.3 + (Math.sin(state.frames * 0.05 + i) + 1) * 0.3;
                bg.globalAlpha = a;
                bg.beginPath();
                bg.arc(x, y, size, 0, Math.PI * 2);
                bg.fill();
            }
            bg.globalAlpha = 1;

            const nebGrad = bg.createRadialGradient(W * 0.3, H * 0.3, 10, W * 0.3, H * 0.3, W * 0.5);
            nebGrad.addColorStop(0, this._hexToRgba(level.bg.accent, 0.15));
            nebGrad.addColorStop(1, 'rgba(0,0,0,0)');
            bg.fillStyle = nebGrad;
            bg.fillRect(0, 0, W, H);

            const nebGrad2 = bg.createRadialGradient(W * 0.7, H * 0.6, 10, W * 0.7, H * 0.6, W * 0.4);
            nebGrad2.addColorStop(0, this._hexToRgba(level.bg.secondary, 0.1));
            nebGrad2.addColorStop(1, 'rgba(0,0,0,0)');
            bg.fillStyle = nebGrad2;
            bg.fillRect(0, 0, W, H);
        }
    },

    _hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /* ============ PAUSA ============ */
    togglePause() {
        this.state.paused = !this.state.paused;
        if (this.state.paused) {
            UI.showScreen('pause');
            Storage.saveGame({
                score: this.state.score,
                coins: this.state.coins,
                levelIdx: this.state.levelIdx,
                hero: { lives: this.state.hero.lives },
                allies: this.state.allies,
                nick: this.state.nick
            });
        } else {
            UI.hideAllScreens();
        }
    },

    /* ============ HANGAR ============ */
    openHangar(fromMenu = false) {
        this.state.paused = true;
        UI.renderHangar();
        UI.showScreen('hangar');
    },

    closeHangar() {
        UI.hideAllScreens();
        if (this.state.active) {
            this.state.paused = false;
        } else {
            UI.showScreen('start');
        }
    },

    /* ============ FIN DE JUEGO ============ */
    gameOver() {
        this.state.active = false;
        Storage.saveRank(this.state.nick, this.state.score);
        Storage.clearSave();
        UI.updateRanking();
        AudioEngine.gameOver();
        UI.showScreen('gameOver');
    },

    /* ============ VICTORIA ============ */
    victory() {
        this.state.active = false;
        Storage.saveRank(this.state.nick, this.state.score);
        Storage.clearSave();
        UI.updateRanking();
        AudioEngine.victory();
        UI.showScreen('victory');
    }
};

/* ============ ARRANQUE ============ */
window.addEventListener('load', () => {
    Game.init();
});

window.Game = Game;

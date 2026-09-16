/* ============================================================
   PRIZES - Sistema de premios y recompensas
   ============================================================ */

const Prizes = {
    /* Premios por completar nivel */
    levelRewards: [
        { name: 'Sello Estelar del Reino', desc: 'Una reliquia que prueba tu victoria' },
        { name: 'Corona de Cristal', desc: 'Símbolo de reino conquistado' },
        { name: 'Gema de la Victoria', desc: 'Poder almacenado de los enemigos caídos' },
        { name: 'Llave del Reino', desc: 'Abre las puertas al siguiente nivel' },
        { name: 'Estandarte Real', desc: 'Marca el territorio liberado' }
    ],

    /* Calcula las recompensas por completar un nivel */
    calculateRewards(state) {
        const level = LEVELS[state.levelIdx];
        const baseCoins = 50 + state.levelIdx * 15;
        const coinBonus = 1 + (state.upgrades.coinBonus * 0.15);
        const coins = Math.floor(baseCoins * coinBonus);
        const scoreBonus = 1000 + state.levelIdx * 200;
        const prizeIdx = state.levelIdx % this.levelRewards.length;
        const prize = this.levelRewards[prizeIdx];

        return {
            coins,
            scoreBonus,
            prize,
            levelName: level.n,
            bossName: level.bossName
        };
    },

    /* Aplica las recompensas */
    applyRewards(state, rewards) {
        state.coins += rewards.coins;
        state.score += rewards.scoreBonus;
        Storage.saveCoins(state.coins);
        Storage.saveGame(state);
    },

    /* Genera cofre aleatorio en el nivel */
    spawnChest(state) {
        const x = 80 + Math.random() * (state.canvasW - 160);
        state.entities.push(new Chest(x, -50));
    },

    /* Abre el cofre al ser destruido */
    openChest(state, chest) {
        // Da 3-5 monedas
        const coins = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < coins; i++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 3 + Math.random() * 3;
            state.entities.push({
                x: chest.x, y: chest.y, isCoin: true,
                vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4,
                t: 0, life: 300, dead: false,
                update(state) {
                    this.t++;
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += 0.2;
                    this.vx *= 0.98;
                    this.life--;
                    const magnetRange = 120;
                    const dx = state.hero.x - this.x;
                    const dy = state.hero.y - this.y;
                    const d = Math.hypot(dx, dy);
                    if (d < magnetRange) {
                        this.x += dx / d * 6;
                        this.y += dy / d * 6;
                    }
                    if (this.life <= 0) this.dead = true;
                },
                draw(ctx) { Assets.drawCoin(ctx, this.x, this.y, this.t); }
            });
        }
        // Posible power-up
        if (Math.random() > 0.5) {
            const types = ['triple', 'shield', 'speed', 'kiss'];
            const type = types[Math.floor(Math.random() * types.length)];
            state.entities.push(new PowerUpItem(chest.x, chest.y, type));
        }
        // Partículas
        ParticleFactory.sparkle(state.particles, chest.x, chest.y, '#FFD700', 20);
        ParticleFactory.ring(state.particles, chest.x, chest.y, '#FFD700', 16);
        AudioEngine.powerUp();
        UI.showMotivation('¡COFRE!');
    }
};

window.Prizes = Prizes;

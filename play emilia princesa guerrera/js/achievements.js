/* ============================================================
   ACHIEVEMENTS - Logros con popups al desbloquear
   + Sistema de estrellas por nivel
   + Racha diaria
   ============================================================ */

const Achievements = {
    /* Definición de logros */
    defs: [
        { id: 'firstKill', name: 'Primera Victoria', desc: 'Derrota a tu primer enemigo', icon: 'star' },
        { id: 'firstBoss', name: 'Cazajefes', desc: 'Derrota a tu primer jefe', icon: 'crown' },
        { id: 'combo10', name: 'Combo Experto', desc: 'Alcanza un combo de 10', icon: 'fire' },
        { id: 'combo25', name: 'Combo Maestro', desc: 'Alcanza un combo de 25', icon: 'lightning' },
        { id: 'combo50', name: 'Combo Legendario', desc: 'Alcanza un combo de 50', icon: 'rainbow' },
        { id: 'level5', name: 'Conquistadora', desc: 'Completa 5 reinos', icon: 'castle' },
        { id: 'level10', name: 'Heroína', desc: 'Completa 10 reinos', icon: 'medal' },
        { id: 'level20', name: 'Leyenda', desc: 'Completa los 20 reinos', icon: 'trophy' },
        { id: 'noDamage', name: 'Intocable', desc: 'Completa un nivel sin recibir daño', icon: 'shield' },
        { id: 'powerCollector', name: 'Coleccionista', desc: 'Recoge 10 power-ups', icon: 'gem' },
        { id: 'coin100', name: 'Tesoro', desc: 'Acumula 100 monedas', icon: 'coin' },
        { id: 'coin500', name: 'Riqueza', desc: 'Acumula 500 monedas', icon: 'chest' },
        { id: 'fairyFriend', name: 'Amiga del Hada', desc: 'El hada te ha animado 10 veces', icon: 'fairy' },
        { id: 'survivor', name: 'Superviviente', desc: 'Sobrevive con 1 vida 30 segundos', icon: 'heart' }
    ],

    unlocked: {},
    stats: {
        enemiesKilled: 0,
        bossesKilled: 0,
        powerUpsCollected: 0,
        fairyCheers: 0,
        maxCombo: 0
    },

    /* Cargar progreso guardado */
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('emilia_saga_achievements') || '{}');
            this.unlocked = data.unlocked || {};
            this.stats = data.stats || {
                enemiesKilled: 0, bossesKilled: 0, powerUpsCollected: 0,
                fairyCheers: 0, maxCombo: 0
            };
        } catch (e) {
            this.unlocked = {};
        }
    },

    save() {
        try {
            localStorage.setItem('emilia_saga_achievements', JSON.stringify({
                unlocked: this.unlocked,
                stats: this.stats
            }));
        } catch (e) {}
    },

    /* Desbloquear un logro */
    unlock(id) {
        if (this.unlocked[id]) return;
        const def = this.defs.find(d => d.id === id);
        if (!def) return;
        this.unlocked[id] = Date.now();
        this.save();
        // Popup de logro
        if (window.PopupSystem && window.Game && Game.state) {
            PopupSystem.bonus('LOGRO: ' + def.name, Game.state.canvasW / 2, Game.state.canvasH / 2);
            AudioEngine.voiceFanfare();
        }
    },

    /* Registrar eventos */
    onEnemyKill() {
        this.stats.enemiesKilled++;
        if (this.stats.enemiesKilled === 1) this.unlock('firstKill');
        this.save();
    },

    onBossKill() {
        this.stats.bossesKilled++;
        if (this.stats.bossesKilled === 1) this.unlock('firstBoss');
        this.save();
    },

    onCombo(combo) {
        if (combo > this.stats.maxCombo) {
            this.stats.maxCombo = combo;
        }
        if (combo >= 10) this.unlock('combo10');
        if (combo >= 25) this.unlock('combo25');
        if (combo >= 50) this.unlock('combo50');
        this.save();
    },

    onLevelComplete(levelIdx, noDamage) {
        if (levelIdx >= 5) this.unlock('level5');
        if (levelIdx >= 10) this.unlock('level10');
        if (levelIdx >= 20) this.unlock('level20');
        if (noDamage) this.unlock('noDamage');
        this.save();
    },

    onPowerUp() {
        this.stats.powerUpsCollected++;
        if (this.stats.powerUpsCollected >= 10) this.unlock('powerCollector');
        this.save();
    },

    onCoins(total) {
        if (total >= 100) this.unlock('coin100');
        if (total >= 500) this.unlock('coin500');
    },

    onFairyCheer() {
        this.stats.fairyCheers++;
        if (this.stats.fairyCheers >= 10) this.unlock('fairyFriend');
        this.save();
    },

    /* Calcular estrellas para un nivel (1-3) */
    calculateStars(livesRemaining, maxLives, time, damageTaken) {
        let stars = 1; // Mínimo 1 estrella por completar
        if (damageTaken === 0) stars = 3;
        else if (livesRemaining >= maxLives * 0.6) stars = 3;
        else if (livesRemaining >= maxLives * 0.3) stars = 2;
        return stars;
    },

    /* Guardar estrellas de un nivel */
    saveLevelStars(levelIdx, stars) {
        try {
            const allStars = JSON.parse(localStorage.getItem('emilia_saga_stars') || '{}');
            const key = String(levelIdx);
            if (!allStars[key] || allStars[key] < stars) {
                allStars[key] = stars;
                localStorage.setItem('emilia_saga_stars', JSON.stringify(allStars));
            }
        } catch (e) {}
    },

    getLevelStars(levelIdx) {
        try {
            const allStars = JSON.parse(localStorage.getItem('emilia_saga_stars') || '{}');
            return allStars[String(levelIdx)] || 0;
        } catch (e) {
            return 0;
        }
    },

    getTotalStars() {
        let total = 0;
        for (let i = 0; i < 20; i++) {
            total += this.getLevelStars(i);
        }
        return total;
    }
};

/* ============ RACHA DIARIA ============ */
const DailyStreak = {
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('emilia_saga_streak') || '{}');
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (data.lastPlay === today) {
                return { count: data.count || 1, lastPlay: today, claimed: data.claimed || false };
            } else if (data.lastPlay === yesterday) {
                return { count: (data.count || 0) + 1, lastPlay: today, claimed: false };
            } else {
                return { count: 1, lastPlay: today, claimed: false };
            }
        } catch (e) {
            return { count: 1, lastPlay: new Date().toDateString(), claimed: false };
        }
    },

    save(streak) {
        try {
            localStorage.setItem('emilia_saga_streak', JSON.stringify(streak));
        } catch (e) {}
    },

    /* Verifica y actualiza la racha al iniciar el juego */
    checkAndClaim() {
        const streak = this.load();
        if (!streak.claimed) {
            streak.claimed = true;
            this.save(streak);
            // Recompensa: 50 monedas por día + bonus por racha
            const reward = 50 + Math.min(streak.count - 1, 10) * 10;
            if (window.Game && Game.state) {
                Game.state.coins += reward;
                Storage.saveCoins(Game.state.coins);
            }
            return { streak: streak.count, reward };
        }
        return null;
    }
};

// Inicializar al cargar
Achievements.load();

window.Achievements = Achievements;
window.DailyStreak = DailyStreak;

/* ============================================================
   STORAGE - Guardar/cargar progreso, ranking y mejoras
   ============================================================ */

const Storage = {
    SAVE_KEY: 'emilia_saga_save_v2',
    RANK_KEY: 'emilia_saga_rank_v2',
    UPGRADES_KEY: 'emilia_saga_upgrades_v2',
    COINS_KEY: 'emilia_saga_coins_v2',

    saveGame(state) {
        const data = {
            score: state.score,
            coins: state.coins,
            levelIdx: state.levelIdx,
            lives: state.hero.lives,
            allies: state.allies.length,
            nick: state.nick,
            levelScores: state.levelScores || []
        };
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('No se pudo guardar', e);
        }
    },

    loadGame() {
        try {
            const d = JSON.parse(localStorage.getItem(this.SAVE_KEY));
            return d;
        } catch (e) {
            return null;
        }
    },

    hasSave() {
        return !!localStorage.getItem(this.SAVE_KEY);
    },

    clearSave() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    saveRank(nick, score) {
        let r = this.getRank();
        r.push({ n: nick, s: score, t: Date.now() });
        r.sort((a, b) => b.s - a.s);
        r = r.slice(0, 10);
        try {
            localStorage.setItem(this.RANK_KEY, JSON.stringify(r));
        } catch (e) {}
        return r;
    },

    getRank() {
        try {
            return JSON.parse(localStorage.getItem(this.RANK_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveUpgrades(upgrades) {
        try {
            localStorage.setItem(this.UPGRADES_KEY, JSON.stringify(upgrades));
        } catch (e) {}
    },

    loadUpgrades() {
        try {
            return JSON.parse(localStorage.getItem(this.UPGRADES_KEY) || 'null') || this.defaultUpgrades();
        } catch (e) {
            return this.defaultUpgrades();
        }
    },

    saveCoins(coins) {
        try {
            localStorage.setItem(this.COINS_KEY, String(coins));
        } catch (e) {}
    },

    loadCoins() {
        try {
            return parseInt(localStorage.getItem(this.COINS_KEY) || '0', 10);
        } catch (e) {
            return 0;
        }
    },

    defaultUpgrades() {
        return {
            damage: 0,        // +5% daño por nivel
            fireRate: 0,      // +3% cadencia por nivel
            speed: 0,         // +5% velocidad por nivel
            multishot: 0,     // +1 proyectil extra por nivel (máx 3)
            maxLives: 0,      // +1 vida por nivel (máx 5)
            pierce: 0,        // +1 penetración por nivel
            critChance: 0,    // +5% crítico por nivel
            magnetism: 0,     // +20px rango atracción por nivel
            shieldStart: 0,   // +2s escudo inicial por nivel
            coinBonus: 0      // +10% monedas por nivel
        };
    }
};

window.Storage = Storage;

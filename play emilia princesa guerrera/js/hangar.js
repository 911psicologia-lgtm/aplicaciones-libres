/* ============================================================
   HANGAR - Tienda de mejoras permanentes para Emilia
   ============================================================ */

const Hangar = {
    /* Definición de mejoras disponibles */
    upgrades: [
        {
            id: 'damage',
            name: 'Daño Mágico',
            desc: '+10% daño por nivel',
            maxLevel: 10,
            baseCost: 50,
            costMult: 1.5,
            draw(ctx) {
                // Espada mágica
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(8, 0);
                ctx.lineTo(0, 20);
                ctx.lineTo(-8, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#ff0033';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        },
        {
            id: 'fireRate',
            name: 'Cadencia Estelar',
            desc: '+5% cadencia por nivel',
            maxLevel: 8,
            baseCost: 60,
            costMult: 1.6,
            draw(ctx) {
                // Rayo
                ctx.fillStyle = '#ffff00';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-3, -20);
                ctx.lineTo(5, -5);
                ctx.lineTo(0, -3);
                ctx.lineTo(8, 15);
                ctx.lineTo(-5, 0);
                ctx.lineTo(0, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        {
            id: 'speed',
            name: 'Botas Aladas',
            desc: '+8% velocidad por nivel',
            maxLevel: 8,
            baseCost: 50,
            costMult: 1.5,
            draw(ctx) {
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#6ef0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 8, 14, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Alas
                ctx.fillStyle = '#88ddff';
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(-18, -8);
                ctx.lineTo(-10, 4);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(18, -8);
                ctx.lineTo(10, 4);
                ctx.fill();
            }
        },
        {
            id: 'multishot',
            name: 'Multidisparo',
            desc: '+1 proyectil extra (máx 3)',
            maxLevel: 3,
            baseCost: 200,
            costMult: 2.5,
            draw(ctx) {
                ctx.fillStyle = '#6ef0ff';
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.arc(i * 8, 0, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.arc(i * 8, 0, 4, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        },
        {
            id: 'maxLives',
            name: 'Coração Real',
            desc: '+1 vida máxima (máx 5)',
            maxLevel: 5,
            baseCost: 150,
            costMult: 2.0,
            draw(ctx) {
                ctx.fillStyle = '#ff3366';
                ctx.beginPath();
                ctx.moveTo(0, 12);
                ctx.bezierCurveTo(-18, -6, -10, -18, 0, -6);
                ctx.bezierCurveTo(10, -18, 18, -6, 0, 12);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        },
        {
            id: 'pierce',
            name: 'Perforación',
            desc: 'Balas atraviesan +1 enemigo',
            maxLevel: 3,
            baseCost: 180,
            costMult: 2.2,
            draw(ctx) {
                ctx.fillStyle = '#aaff00';
                ctx.strokeStyle = '#003300';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -18);
                ctx.lineTo(6, 0);
                ctx.lineTo(0, 18);
                ctx.lineTo(-6, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        {
            id: 'critChance',
            name: 'Golpe Crítico',
            desc: '+8% prob. de crítico por nivel',
            maxLevel: 8,
            baseCost: 80,
            costMult: 1.7,
            draw(ctx) {
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                Assets._drawStar(ctx, 0, 0, 6, 14, 6);
                ctx.stroke();
            }
        },
        {
            id: 'magnetism',
            name: 'Atracción Mágica',
            desc: '+25px rango de atracción',
            maxLevel: 6,
            baseCost: 40,
            costMult: 1.4,
            draw(ctx) {
                ctx.strokeStyle = '#ff00cc';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.arc(0, 0, 9, 0, Math.PI * 2);
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
        {
            id: 'shieldStart',
            name: 'Escudo Inicial',
            desc: '+3s de escudo al empezar nivel',
            maxLevel: 5,
            baseCost: 100,
            costMult: 1.8,
            draw(ctx) {
                ctx.fillStyle = 'rgba(110, 240, 255, 0.6)';
                ctx.strokeStyle = '#6ef0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -16);
                ctx.lineTo(12, -8);
                ctx.lineTo(12, 8);
                ctx.lineTo(0, 16);
                ctx.lineTo(-12, 8);
                ctx.lineTo(-12, -8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        {
            id: 'coinBonus',
            name: 'Bolsa Real',
            desc: '+15% monedas por nivel',
            maxLevel: 8,
            baseCost: 60,
            costMult: 1.6,
            draw(ctx) {
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#b8860b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#b8860b';
                Assets._drawStar(ctx, 0, 0, 5, 6, 3);
            }
        }
    ],

    /* Calcula el costo de la siguiente mejora */
    getCost(upgrade, currentLevel) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel));
    },

    /* Verifica si se puede comprar */
    canBuy(upgrade, currentLevel, coins) {
        if (currentLevel >= upgrade.maxLevel) return false;
        return coins >= this.getCost(upgrade, currentLevel);
    },

    /* Compra una mejora */
    buy(upgradeId) {
        const up = this.upgrades.find(u => u.id === upgradeId);
        if (!up) return false;
        const state = Game.state;
        const current = state.upgrades[upgradeId] || 0;
        const cost = this.getCost(up, current);
        if (current >= up.maxLevel) {
            AudioEngine.hangarCant();
            return false;
        }
        if (state.coins < cost) {
            AudioEngine.hangarCant();
            UI.showMotivation('MONEDAS INSUFICIENTES');
            return false;
        }
        state.coins -= cost;
        state.upgrades[upgradeId] = current + 1;
        Storage.saveUpgrades(state.upgrades);
        Storage.saveCoins(state.coins);
        AudioEngine.hangarBuy();
        UI.renderHangar();
        UI.updateHUD();
        return true;
    },

    /* Renderiza el hangar completo */
    render() {
        UI.renderHangar();
    }
};

window.Hangar = Hangar;

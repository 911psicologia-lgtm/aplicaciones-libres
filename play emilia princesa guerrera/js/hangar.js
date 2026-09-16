/* ============================================================
   HANGAR v5 - Tienda de mejoras mejorada
   - Más mejoras visuales
   - Recompensas atractivas
   - Categorías organizadas
   - Mejor presentación
   ============================================================ */

const Hangar = {
    /* Definición de mejoras disponibles - ampliadas */
    upgrades: [
        // Categoría: Combate
        {
            id: 'damage',
            name: 'Daño Mágico',
            desc: '+12% daño por nivel',
            maxLevel: 10,
            baseCost: 50,
            costMult: 1.5,
            category: 'combate',
            color: '#ff6600',
            draw(ctx) {
                // Espada mágica con aura
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -22); ctx.lineTo(9, 0); ctx.lineTo(0, 22); ctx.lineTo(-9, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#ff0033';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        },
        {
            id: 'fireRate',
            name: 'Cadencia Estelar',
            desc: '+8% cadencia por nivel',
            maxLevel: 8,
            baseCost: 60,
            costMult: 1.6,
            category: 'combate',
            color: '#ffff00',
            draw(ctx) {
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffff00';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-4, -22); ctx.lineTo(6, -5); ctx.lineTo(0, -3);
                ctx.lineTo(9, 18); ctx.lineTo(-6, 0); ctx.lineTo(0, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        {
            id: 'multishot',
            name: 'Multidisparo',
            desc: '+1 proyectil (máx 3)',
            maxLevel: 3,
            baseCost: 250,
            costMult: 2.5,
            category: 'combate',
            color: '#6ef0ff',
            draw(ctx) {
                ctx.shadowColor = '#6ef0ff';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#6ef0ff';
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.arc(i * 9, 0, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.arc(i * 9, 0, 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        },
        {
            id: 'pierce',
            name: 'Perforación',
            desc: 'Balas atraviesan +1',
            maxLevel: 3,
            baseCost: 200,
            costMult: 2.2,
            category: 'combate',
            color: '#aaff00',
            draw(ctx) {
                ctx.shadowColor = '#aaff00';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#aaff00';
                ctx.strokeStyle = '#003300';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -20); ctx.lineTo(7, 0); ctx.lineTo(0, 20); ctx.lineTo(-7, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        },
        {
            id: 'critChance',
            name: 'Golpe Crítico',
            desc: '+10% prob. crítico',
            maxLevel: 8,
            baseCost: 80,
            costMult: 1.7,
            category: 'combate',
            color: '#FFD700',
            draw(ctx) {
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                Assets._drawStar(ctx, 0, 0, 6, 16, 7);
                ctx.stroke();
            }
        },
        // Categoría: Defensa
        {
            id: 'maxLives',
            name: 'Corazón Real',
            desc: '+1 vida máxima (máx 5)',
            maxLevel: 5,
            baseCost: 180,
            costMult: 2.0,
            category: 'defensa',
            color: '#ff3366',
            draw(ctx) {
                ctx.shadowColor = '#ff3366';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#ff3366';
                ctx.beginPath();
                ctx.moveTo(0, 14);
                ctx.bezierCurveTo(-20, -6, -12, -20, 0, -6);
                ctx.bezierCurveTo(12, -20, 20, -6, 0, 14);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Brillo
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.ellipse(-5, -5, 3, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        },
        {
            id: 'shieldStart',
            name: 'Escudo Inicial',
            desc: '+3s escudo al iniciar',
            maxLevel: 5,
            baseCost: 120,
            costMult: 1.8,
            category: 'defensa',
            color: '#6ef0ff',
            draw(ctx) {
                ctx.shadowColor = '#6ef0ff';
                ctx.shadowBlur = 10;
                ctx.fillStyle = 'rgba(110, 240, 255, 0.6)';
                ctx.strokeStyle = '#6ef0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -18); ctx.lineTo(14, -10); ctx.lineTo(14, 10);
                ctx.lineTo(0, 18); ctx.lineTo(-14, 10); ctx.lineTo(-14, -10);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                // Cruz
                ctx.fillStyle = '#fff';
                ctx.fillRect(-2, -8, 4, 16);
                ctx.fillRect(-8, -2, 16, 4);
            }
        },
        // Categoría: Movilidad
        {
            id: 'speed',
            name: 'Botas Aladas',
            desc: '+10% velocidad',
            maxLevel: 8,
            baseCost: 50,
            costMult: 1.5,
            category: 'movilidad',
            color: '#88ddff',
            draw(ctx) {
                ctx.shadowColor = '#88ddff';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#6ef0ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 8, 16, 9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Alas
                ctx.fillStyle = '#88ddff';
                ctx.beginPath();
                ctx.moveTo(-14, 0); ctx.lineTo(-22, -10); ctx.lineTo(-10, 4);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(14, 0); ctx.lineTo(22, -10); ctx.lineTo(10, 4);
                ctx.fill();
            }
        },
        {
            id: 'magnetism',
            name: 'Atracción Mágica',
            desc: '+30px rango atracción',
            maxLevel: 6,
            baseCost: 40,
            costMult: 1.4,
            category: 'movilidad',
            color: '#ff00cc',
            draw(ctx) {
                ctx.strokeStyle = '#ff00cc';
                ctx.shadowColor = '#ff00cc';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.stroke();
                // Flecha
                ctx.fillStyle = '#ff00cc';
                ctx.beginPath();
                ctx.moveTo(0, -16); ctx.lineTo(-3, -12); ctx.lineTo(3, -12);
                ctx.fill();
            }
        },
        // Categoría: Economía
        {
            id: 'coinBonus',
            name: 'Bolsa Real',
            desc: '+20% monedas',
            maxLevel: 8,
            baseCost: 60,
            costMult: 1.6,
            category: 'economia',
            color: '#FFD700',
            draw(ctx) {
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#b8860b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, 15, 18, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Símbolo $
                ctx.fillStyle = '#b8860b';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', 0, 0);
            }
        },
        {
            id: 'comboBonus',
            name: 'Maestro de Combos',
            desc: '+15% velocidad de combo',
            maxLevel: 5,
            baseCost: 100,
            costMult: 1.8,
            category: 'economia',
            color: '#ff6600',
            draw(ctx) {
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 12;
                // Llama estilizada
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.bezierCurveTo(-12, -10, -8, 5, 0, 15);
                ctx.bezierCurveTo(8, 5, 12, -10, 0, -20);
                ctx.fill();
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.bezierCurveTo(-6, -5, -4, 5, 0, 10);
                ctx.bezierCurveTo(4, 5, 6, -5, 0, -12);
                ctx.fill();
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        },
        // Categoría: Especial
        {
            id: 'startPower',
            name: 'Poder Inicial',
            desc: 'Empieza con un poder aleatorio',
            maxLevel: 3,
            baseCost: 300,
            costMult: 2.0,
            category: 'especial',
            color: '#aa66ff',
            draw(ctx) {
                ctx.shadowColor = '#aa66ff';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#aa66ff';
                // Estrella mágica
                Assets._drawStar(ctx, 0, 0, 5, 16, 7);
                ctx.fillStyle = '#fff';
                Assets._drawStar(ctx, 0, 0, 5, 8, 3);
            }
        },
        {
            id: 'extraLife',
            name: 'Vida Extra',
            desc: 'Revive una vez al morir',
            maxLevel: 2,
            baseCost: 500,
            costMult: 3.0,
            category: 'especial',
            color: '#ff3366',
            draw(ctx) {
                ctx.shadowColor = '#ff3366';
                ctx.shadowBlur = 15;
                // Ángel
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                // Alas
                ctx.fillStyle = '#ffccdd';
                ctx.beginPath();
                ctx.ellipse(-12, -2, 8, 4, -0.3, 0, Math.PI * 2);
                ctx.ellipse(12, -2, 8, 4, 0.3, 0, Math.PI * 2);
                ctx.fill();
                // Halo
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, -10, 6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    ],

    /* Categorías para organizar */
    categories: [
        { id: 'combate', name: 'Combate', color: '#ff6600', icon: '⚔' },
        { id: 'defensa', name: 'Defensa', color: '#6ef0ff', icon: '🛡' },
        { id: 'movilidad', name: 'Movilidad', color: '#88ddff', icon: '⚡' },
        { id: 'economia', name: 'Economía', color: '#FFD700', icon: '💰' },
        { id: 'especial', name: 'Especial', color: '#aa66ff', icon: '✦' }
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
            PopupSystem.quick('MONEDAS INSUFICIENTES', state.canvasW / 2, state.canvasH / 2, {
                color: '#ff3366', size: 32, scale: 1.5, life: 1.0, decay: 0.025
            });
            return false;
        }
        state.coins -= cost;
        state.upgrades[upgradeId] = current + 1;
        Storage.saveUpgrades(state.upgrades);
        Storage.saveCoins(state.coins);
        AudioEngine.hangarBuy();
        // Popup de felicitación
        PopupSystem.bonus('¡MEJORA!', state.canvasW / 2, state.canvasH / 2);
        UI.renderHangar();
        UI.updateHUD();
        return true;
    },

    /* Renderiza el hangar completo con categorías */
    render() {
        UI.renderHangar();
    }
};

window.Hangar = Hangar;

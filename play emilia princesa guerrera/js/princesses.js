/* ============================================================
   PRINCESAS - Definiciones de avatar elegibles
   Cada princesa tiene un poder inicial único
   ============================================================ */

const PrincessDefs = {
    /* 6 princesas elementales con poderes temáticos */
    princess_ice: {
        name: 'Elsa Glaciana',
        title: 'Princesa del Hielo',
        desc: 'Dispara cristales de nieve perforantes',
        initialPower: 'ice',
        bulletType: 'ICE',
        bulletColor: '#aaffff',
        glowColor: '#6ef0ff',
        auraColor: 'rgba(170, 240, 255, 0.5)',
        passive: 'Reducción de daño al recibir golpe (20%)',
        passiveEffect: 'damageReduction',
        passiveValue: 0.2
    },
    princess_fire: {
        name: 'Pira Ignis',
        title: 'Princesa del Fuego',
        desc: 'Dispara bolas de fuego explosivas',
        initialPower: 'fire',
        bulletType: 'FIRE',
        bulletColor: '#ff6600',
        glowColor: '#ff3300',
        auraColor: 'rgba(255, 100, 0, 0.5)',
        passive: 'Daño +25% a todos los disparos',
        passiveEffect: 'damageBoost',
        passiveValue: 0.25
    },
    princess_lightning: {
        name: 'Voltia Rayo',
        title: 'Princesa del Rayo',
        desc: 'Dispara rayos eléctricos en cadena',
        initialPower: 'lightning',
        bulletType: 'LIGHTNING',
        bulletColor: '#ffff00',
        glowColor: '#ffaa00',
        auraColor: 'rgba(255, 255, 0, 0.5)',
        passive: 'Cadencia de disparo +20%',
        passiveEffect: 'fireRateBoost',
        passiveValue: 0.2
    },
    princess_shadow: {
        name: 'Noctis Umbra',
        title: 'Princesa Sombría',
        desc: 'Dispara sombras que perforan enemigos',
        initialPower: 'shadow',
        bulletType: 'SHADOW',
        bulletColor: '#aa00ff',
        glowColor: '#660066',
        auraColor: 'rgba(170, 0, 255, 0.5)',
        passive: 'Vida máxima +2',
        passiveEffect: 'maxLives',
        passiveValue: 2
    },
    princess_light: {
        name: 'Lumina Sagrada',
        title: 'Princesa de Luz',
        desc: 'Dispara rayos de luz sagrada que rebotan',
        initialPower: 'light',
        bulletType: 'LIGHT',
        bulletColor: '#ffffff',
        glowColor: '#FFD700',
        auraColor: 'rgba(255, 215, 0, 0.5)',
        passive: 'Recupera 1 vida cada 30s',
        passiveEffect: 'regen',
        passiveValue: 1800
    },
    princess_nature: {
        name: 'Silva Verdania',
        title: 'Princesa Naturaleza',
        desc: 'Dispara esporas que envenenan enemigos',
        initialPower: 'nature',
        bulletType: 'NATURE',
        bulletColor: '#66ff33',
        glowColor: '#336600',
        auraColor: 'rgba(100, 255, 50, 0.5)',
        passive: 'Monedas +50%',
        passiveEffect: 'coinBonus',
        passiveValue: 0.5
    },
    /* Princesas clásicas (sin poder elemental, pero con bonus) */
    princess_pink: {
        name: 'Emilia Rosalia',
        title: 'Princesa Clásica',
        desc: 'Disparo mágico rosa balanceado',
        initialPower: null,
        bulletType: 'NORMAL',
        bulletColor: '#ff9ed6',
        glowColor: '#ff00cc',
        auraColor: 'rgba(255, 158, 214, 0.5)',
        passive: 'Combos +50% más rápido',
        passiveEffect: 'comboBoost',
        passiveValue: 0.5
    },
    princess_silver: {
        name: 'Argenta Luna',
        title: 'Princesa Plateada',
        desc: 'Disparo plateado con escudo natural',
        initialPower: null,
        bulletType: 'NORMAL',
        bulletColor: '#ccccff',
        glowColor: '#aaaaff',
        auraColor: 'rgba(200, 200, 255, 0.5)',
        passive: 'Empieza cada nivel con escudo',
        passiveEffect: 'shieldStart',
        passiveValue: 240
    },
    princess_01: { name: 'Aurora', title: 'Princesa Clásica', desc: 'Disparo rosa mágico', initialPower: null, bulletType: 'NORMAL', bulletColor: '#ff9ed6', glowColor: '#ff00cc', auraColor: 'rgba(255, 158, 214, 0.5)', passive: 'Combos +30% más rápido', passiveEffect: 'comboBoost', passiveValue: 0.3 },
    princess_02: { name: 'Bella', title: 'Princesa Clásica', desc: 'Disparo dorado', initialPower: null, bulletType: 'NORMAL', bulletColor: '#FFD700', glowColor: '#ffaa00', auraColor: 'rgba(255, 215, 0, 0.5)', passive: 'Monedas +30%', passiveEffect: 'coinBonus', passiveValue: 0.3 },
    princess_03: { name: 'Cenicienta', title: 'Princesa Clásica', desc: 'Disparo azul cristal', initialPower: null, bulletType: 'NORMAL', bulletColor: '#6ef0ff', glowColor: '#0066ff', auraColor: 'rgba(110, 240, 255, 0.5)', passive: 'Velocidad +15%', passiveEffect: 'speedBoost', passiveValue: 0.15 },
    princess_04: { name: 'Jazmín', title: 'Princesa Clásica', desc: 'Disparo esmeralda', initialPower: null, bulletType: 'NORMAL', bulletColor: '#66ff99', glowColor: '#009933', auraColor: 'rgba(100, 255, 150, 0.5)', passive: 'Vida +1', passiveEffect: 'maxLives', passiveValue: 1 },
    princess_05: { name: 'Mérida', title: 'Princesa Clásica', desc: 'Disparo naranja certero', initialPower: null, bulletType: 'NORMAL', bulletColor: '#ff9933', glowColor: '#cc4400', auraColor: 'rgba(255, 150, 50, 0.5)', passive: 'Daño +15%', passiveEffect: 'damageBoost', passiveValue: 0.15 },
    princess_06: { name: 'Mulan', title: 'Princesa Clásica', desc: 'Disparo rojo guerrero', initialPower: null, bulletType: 'NORMAL', bulletColor: '#ff3366', glowColor: '#cc0033', auraColor: 'rgba(255, 50, 100, 0.5)', passive: 'Cadencia +10%', passiveEffect: 'fireRateBoost', passiveValue: 0.1 },
    princess_07: { name: 'Tiana', title: 'Princesa Clásica', desc: 'Disparo verde lago', initialPower: null, bulletType: 'NORMAL', bulletColor: '#33ccaa', glowColor: '#006655', auraColor: 'rgba(50, 200, 170, 0.5)', passive: 'Combos +20% más rápido', passiveEffect: 'comboBoost', passiveValue: 0.2 },
    princess_08: { name: 'Pocahontas', title: 'Princesa Clásica', desc: 'Disparo tierra dorada', initialPower: null, bulletType: 'NORMAL', bulletColor: '#cc9966', glowColor: '#664422', auraColor: 'rgba(200, 150, 100, 0.5)', passive: 'Velocidad +20%', passiveEffect: 'speedBoost', passiveValue: 0.2 },
    princess_09: { name: 'Ariel', title: 'Princesa Clásica', desc: 'Disparo turquesa', initialPower: null, bulletType: 'NORMAL', bulletColor: '#00ccff', glowColor: '#0066aa', auraColor: 'rgba(0, 200, 255, 0.5)', passive: 'Vida +1', passiveEffect: 'maxLives', passiveValue: 1 },
    princess_10: { name: 'Blancanieves', title: 'Princesa Clásica', desc: 'Disparo azul real', initialPower: null, bulletType: 'NORMAL', bulletColor: '#3366ff', glowColor: '#000099', auraColor: 'rgba(50, 100, 255, 0.5)', passive: 'Monedas +40%', passiveEffect: 'coinBonus', passiveValue: 0.4 },
    princess_11: { name: 'Valiente', title: 'Princesa Clásica', desc: 'Disparo carmesí', initialPower: null, bulletType: 'NORMAL', bulletColor: '#cc0033', glowColor: '#660011', auraColor: 'rgba(200, 0, 50, 0.5)', passive: 'Daño +20%', passiveEffect: 'damageBoost', passiveValue: 0.2 },
    princess_12: { name: 'Rapunzel', title: 'Princesa Clásica', desc: 'Disparo dorado solar', initialPower: null, bulletType: 'NORMAL', bulletColor: '#ffcc33', glowColor: '#cc8800', auraColor: 'rgba(255, 200, 50, 0.5)', passive: 'Cadencia +15%', passiveEffect: 'fireRateBoost', passiveValue: 0.15 }
};

window.PrincessDefs = PrincessDefs;

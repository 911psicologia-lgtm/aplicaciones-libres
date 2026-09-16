/* ============================================================
   LEVELS - 20 Reinos con trama, ambientación, temática y datos
   Ahora con fondos realistas (bg key para ImageLoader)
   ============================================================ */

const LEVELS = [
    {
        n: "Reino Slime",
        story: "Las colinas verdes rebosan de babosas saltarinas que devoran cosechas. Emilia llega con su varita mágica para calmarlas.",
        enemyType: 'slime',
        enemyName: 'Babosa Saltarina',
        bg: { deep: '#0a1a30', mid: '#1a3a5a', accent: '#88ff99', secondary: '#22aa55', stars: '#ffffff' },
        bgImage: 'bg_slime',
        boss: 'slimeKing',
        bossName: 'Rey Slime Gorgón',
        bossSpecial: 'División Babosa',
        target: 3000
    },
    {
        n: "Bosque Dulce",
        story: "Un bosque de caramelo y miel está siendo invadido por enjambres de avispas de azúcar. La Reina Abeja exige tributo.",
        enemyType: 'bee',
        enemyName: 'Abeja de Miel',
        bg: { deep: '#2a0a1a', mid: '#5a2a3a', accent: '#ffcc66', secondary: '#ff6699', stars: '#fff' },
        bgImage: 'bg_candy',
        boss: 'queenBee',
        bossName: 'Reina Abeja Mielada',
        bossSpecial: 'Enjambre Vengador',
        target: 3500
    },
    {
        n: "Valle Fuego",
        story: "Ríos de lava cruzan el valle. Los imps de fuego desafían a cualquier intruso con burlas ardientes.",
        enemyType: 'fireImp',
        enemyName: 'Imp de Lava',
        bg: { deep: '#2a0000', mid: '#5a0a00', accent: '#ff6600', secondary: '#ffaa00', stars: '#ffff66' },
        bgImage: 'bg_fire',
        boss: 'fireDemon',
        bossName: 'Demonio Piroclasto',
        bossSpecial: 'Lluvia de Magma',
        target: 4000
    },
    {
        n: "Cumbres Hielo",
        story: "Cumbres congeladas donde los golems de hielo vigilan reliquias antiguas. El frío cala hasta el alma.",
        enemyType: 'iceGolem',
        enemyName: 'Golem de Hielo',
        bg: { deep: '#001a33', mid: '#003366', accent: '#aaffff', secondary: '#6ef0ff', stars: '#fff' },
        bgImage: 'bg_ice',
        boss: 'iceQueen',
        bossName: 'Reina Glaciana',
        bossSpecial: 'Rayo Congelante',
        target: 4500
    },
    {
        n: "Ciudad Neón",
        story: "Una metrópolis cibernética donde robots defectuosos acechan en callejones de luz líquida.",
        enemyType: 'robot',
        enemyName: 'Robot Corrupto',
        bg: { deep: '#000010', mid: '#100030', accent: '#ff00cc', secondary: '#00ffff', stars: '#ff00ff' },
        bgImage: 'bg_neon',
        boss: 'robotOverlord',
        bossName: 'Segador Neón',
        bossSpecial: 'Rejilla Láser',
        target: 5000
    },
    {
        n: "Mundo Galleta",
        story: "Un mundo hecho de dulces donde las galletas vivientes atacan con astucia repostería.",
        enemyType: 'cookie',
        enemyName: 'Galleta Guerrera',
        bg: { deep: '#2a1a0a', mid: '#5a3a1a', accent: '#d2691e', secondary: '#ffaa55', stars: '#ffd700' },
        bgImage: 'bg_cookie',
        boss: 'cookieMonster',
        bossName: 'Galleta Colosal',
        bossSpecial: 'Lluvia Caramelizada',
        target: 5500
    },
    {
        n: "Océano Perla",
        story: "Profundidades abisales donde pulpos gigantes custodian perlas cantoras.",
        enemyType: 'octopus',
        enemyName: 'Pulpo Abisal',
        bg: { deep: '#001a4a', mid: '#003380', accent: '#66ccff', secondary: '#ff66cc', stars: '#aaffff' },
        bgImage: 'bg_ocean',
        boss: 'kraken',
        bossName: 'Kraken Perla Negra',
        bossSpecial: 'Tentáculo Devastador',
        target: 6000
    },
    {
        n: "Desierto Dorado",
        story: "Dunas infinitas esconden escorpiones dorados que emergen al anochecer.",
        enemyType: 'scorpion',
        enemyName: 'Escorpión Dorado',
        bg: { deep: '#3a2a0a', mid: '#7a5a1a', accent: '#ffaa00', secondary: '#ff6600', stars: '#ffff80' },
        bgImage: 'bg_desert',
        boss: 'sandWorm',
        bossName: 'Gusano Arenoso',
        bossSpecial: 'Emboscada Subterránea',
        target: 6500
    },
    {
        n: "Selva Mágica",
        story: "Una selva viva donde tigres espirituales protegen reliquias antiguas.",
        enemyType: 'tiger',
        enemyName: 'Tigre Espíritu',
        bg: { deep: '#0a2a0a', mid: '#1a5a1a', accent: '#66ff33', secondary: '#ffcc00', stars: '#aaffaa' },
        bgImage: 'bg_jungle',
        boss: 'tigerKing',
        bossName: 'Tigre Rey Místico',
        bossSpecial: 'Salto Devastador',
        target: 7000
    },
    {
        n: "Castillo Fantasma",
        story: "Un castillo encantado donde los fantasmas susurran maldiciones milenarias.",
        enemyType: 'ghost',
        enemyName: 'Espectro Lamentoso',
        bg: { deep: '#0a0a2a', mid: '#1a1a4a', accent: '#aaaaff', secondary: '#ccccff', stars: '#ffffff' },
        bgImage: 'bg_haunted',
        boss: 'ghostKing',
        bossName: 'Rey Espectral Vormak',
        bossSpecial: 'Onda de Posesión',
        target: 7500
    },
    {
        n: "Nubes Algodón",
        story: "Ciudades flotantes en nubes rosas donde las tormentas cobran vida propia.",
        enemyType: 'cloud',
        enemyName: 'Nube Tempestuosa',
        bg: { deep: '#2a3a5a', mid: '#5a6a8a', accent: '#ffffff', secondary: '#ffccff', stars: '#ffffff' },
        bgImage: 'bg_clouds',
        boss: 'cloudGiant',
        bossName: 'Gigante Cumulonimbo',
        bossSpecial: 'Tormenta Eléctrica',
        target: 8000
    },
    {
        n: "Espacio Estelar",
        story: "El vacío interestelar donde naves alienígenas acechan enjambres cósmicos.",
        enemyType: 'alien',
        enemyName: 'Invasor Gris',
        bg: { deep: '#000005', mid: '#0a0a25', accent: '#88ff66', secondary: '#aa66ff', stars: '#ffffff' },
        bgImage: 'bg_space',
        boss: 'alienMother',
        bossName: 'Madre Nodriza Xeno',
        bossSpecial: 'Rayo Tractor',
        target: 8500
    },
    {
        n: "Jardín Rosas",
        story: "Un jardín encantado donde las rosas espirituales protegen a la Dama Carmesí.",
        enemyType: 'rose',
        enemyName: 'Rosa Espinosa',
        bg: { deep: '#2a0a1a', mid: '#5a1a3a', accent: '#ff3366', secondary: '#ff6699', stars: '#ffaaaa' },
        bgImage: 'bg_roses',
        boss: 'roseQueen',
        bossName: 'Reina Rosalía',
        bossSpecial: 'Jaula de Espinas',
        target: 9000
    },
    {
        n: "Mina Gemas",
        story: "Profundas minas donde cristales vivos cortan el aire con reflejos afilados.",
        enemyType: 'gem',
        enemyName: 'Gema Cortante',
        bg: { deep: '#0a0a3a', mid: '#1a1a5a', accent: '#00ffff', secondary: '#aa00ff', stars: '#ffffff' },
        bgImage: 'bg_mine',
        boss: 'gemDragon',
        bossName: 'Dragón Cristalino',
        bossSpecial: 'Lluvia de Esquirlas',
        target: 9500
    },
    {
        n: "Reino del Sol",
        story: "Un reino dorado donde el sol nunca se pone y los espíritus solares custodian reliquias ardientes.",
        enemyType: 'sun',
        enemyName: 'Espíritu Solar',
        bg: { deep: '#3a2a00', mid: '#7a5a00', accent: '#ffff00', secondary: '#ffaa00', stars: '#ffffaa' },
        bgImage: 'bg_sun',
        boss: 'sunGod',
        bossName: 'Dios Sol Apolo',
        bossSpecial: 'Llamarada Solar',
        target: 10000
    },
    {
        n: "Tierra Dragones",
        story: "Cumbres volcánicas donde dragones milenarios disputan el cielo ardiente.",
        enemyType: 'dragon',
        enemyName: 'Dragón Joven',
        bg: { deep: '#1a0a0a', mid: '#3a1a1a', accent: '#33aa33', secondary: '#ff6600', stars: '#ffaa00' },
        bgImage: 'bg_dragon',
        boss: 'dragonLord',
        bossName: 'Lord Dragón Virmir',
        bossSpecial: 'Aliento Ígneo',
        target: 10500
    },
    {
        n: "Pantano Oscuro",
        story: "Nieblas tóxicas cubren un pantano donde cocodrilos mutantes devoran incautos.",
        enemyType: 'croc',
        enemyName: 'Cocodrilo Tóxico',
        bg: { deep: '#0a1a0a', mid: '#1a3a1a', accent: '#4a7c2a', secondary: '#aa6633', stars: '#88aa66' },
        bgImage: 'bg_swamp',
        boss: 'swampWitch',
        bossName: 'Bruja Pantanosa Morva',
        bossSpecial: 'Nube Tóxica',
        target: 11000
    },
    {
        n: "Cuna Juguetes",
        story: "Un taller encantado donde juguetes abandonados cobran vida con hambre vengativa.",
        enemyType: 'teddy',
        enemyName: 'Oso Vendido',
        bg: { deep: '#3a1a2a', mid: '#5a2a3a', accent: '#ff99cc', secondary: '#ffcc66', stars: '#ffccaa' },
        bgImage: 'bg_toys',
        boss: 'toyMaster',
        bossName: 'Maestro de Juguetes',
        bossSpecial: 'Tropas de Peluche',
        target: 11500
    },
    {
        n: "Dimensión Cristal",
        story: "Una dimensión espejo donde los cristales reflejan maldad y luz en igual medida.",
        enemyType: 'crystal',
        enemyName: 'Cristal Espejo',
        bg: { deep: '#1a0a3a', mid: '#3a1a5a', accent: '#aaccff', secondary: '#ff66cc', stars: '#ffffff' },
        bgImage: 'bg_crystal',
        boss: 'crystalSage',
        bossName: 'Sabio Cristalino Lumen',
        bossSpecial: 'Esquirlas Espejo',
        target: 12000
    },
    {
        n: "Trono Supremo",
        story: "El corazón del imperio oscuro. La Emperatriz Oscura aguarda con todos los poderes robados a los reinos caídos.",
        enemyType: 'darkling',
        enemyName: 'Esbirro Oscuro',
        bg: { deep: '#000000', mid: '#1a0010', accent: '#ff0033', secondary: '#660066', stars: '#660000' },
        bgImage: 'bg_dark',
        boss: 'darkEmpress',
        bossName: 'Emperatriz Oscura Noir',
        bossSpecial: 'Eclipse Final',
        target: 15000
    }
];

window.LEVELS = LEVELS;

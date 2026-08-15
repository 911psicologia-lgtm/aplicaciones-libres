/* data.js v2.5 — Plantas, enemigos, jefes y 30 niveles */
'use strict';

const PLANTS = {
  margarita: {
    emoji:'🌼', name:'Margarita Sol', cost:50, recharge:7500,
    hp:94,
    sunProd:true, sunRate:5538, sunAmt:25,
    attack:true, damage:8, fireRate:4700, range:9,
    projEmoji:'✨', projSpeed:220,
    desc:'Produce soles y también lanza destellos suaves.',
    anim:'anim-margarita',
  },
  lanzadora: {
    emoji:'🫛', name:'Alberja Lanzaguisantes', cost:100, recharge:6200,
    cardEmojiHTML:'<span class="pea-shot pea-shot-1">🫛</span>', boardEmojiHTML:'<span class="pea-shot pea-shot-1">🫛</span>',
    hp:137, attack:true, damage:24, fireRate:1400, range:9, shots:1,
    projEmoji:'🫛', projSpeed:420,
    desc:'Dispara guisantes; desde el mundo 2 gana doble disparo y desde el 3 ráfaga triple.',
    anim:'anim-lanzadora',
  },
  doble: {
    emoji:'🍇', name:'Uvas Osadas', cost:190, recharge:6900,
    cardEmojiHTML:'<span class="pea-shot pea-shot-2"><span>🍇</span><span>🍇</span></span>', boardEmojiHTML:'<span class="pea-shot pea-shot-2"><span>🍇</span><span>🍇</span></span>',
    hp:133, attack:true, damage:22, fireRate:1450, range:9, shots:2,
    projEmoji:'🟣', projSpeed:405,
    desc:'Dispara dos uvas por ronda con más ritmo.',
    anim:'anim-doble',
  },
  triple: {
    emoji:'🍟', name:'Papas Fritas Disparadoras', cost:260, recharge:8800,
    cardEmojiHTML:'<span class="pea-shot pea-shot-3"><span>🍟</span><span>🍟</span><span>🍟</span></span>', boardEmojiHTML:'<span class="pea-shot pea-shot-3"><span>🍟</span><span>🍟</span><span>🍟</span></span>',
    hp:145, attack:true, damage:20, fireRate:1250, range:9, shots:3,
    projEmoji:'🥔', projSpeed:430,
    desc:'Lanza ráfagas de papitas crujientes a gran velocidad.',
    anim:'anim-doble',
  },
  nevada: {
    emoji:'🥑', name:'Aguacate Congelante', cost:170, recharge:7000,
    hp:137, attack:true, damage:26, fireRate:1450, range:9,
    slows:true, slowDur:5200,
    projEmoji:'🧊', projSpeed:370,
    desc:'Congela más tiempo y pega más duro.',
    anim:'anim-nevada',
  },
  fuego: {
    emoji:'🔥', name:'Flor de Fuego', cost:225, recharge:9000,
    hp:137, attack:true, damage:34, fireRate:1600, range:9,
    splash:true, aoe:0, burn:true,
    projEmoji:'🔥', projSpeed:360,
    desc:'Lanza fuego encendido que golpea con más fuerza.',
    anim:'anim-fuego',
  },
  muro: {
    emoji:'🌵', name:'Muro Espina', cost:50, recharge:24000,
    hp:962, attack:false,
    desc:'Barrera resistente para frenar enemigos.',
    anim:'anim-muro',
  },
  granmuro: {
    emoji:'🪨', name:'Gran Muro', cost:125, recharge:30000,
    hp:1454, attack:false, blocksJump:true,
    desc:'Más resistente y bloquea saltos.',
    anim:'anim-granmuro',
  },
  bomba: {
    emoji:'🌶️', name:'Ají Explosivo', cost:50, recharge:22000,
    hp:51, attack:true, explosive:true, fuseTime:1300,
    damage:2600, aoe:2,
    desc:'Detona con más fuerza y cubre un área mayor.',
    anim:'anim-bomba',
  },
  bombax: {
    emoji:'💣', name:'Bomba Explosiva', cost:85, recharge:22000,
    hp:51, attack:true, explosive:true, fuseTime:900,
    damage:1900, aoe:1.35,
    desc:'Explota rápido y limpia un área media del carril.',
    anim:'anim-bomba',
  },
  gasolina: {
    emoji:'⛽', name:'Tanque de Gasolina', cost:70, recharge:26000,
    hp:52, attack:true, explosive:true, fuseTime:950,
    damage:1, aoe:99, boardFire:true, boardFirePct:0.5,
    desc:'Incendia todo el tablero y reduce 50% de la vida de todos los enemigos.',
    anim:'anim-bomba',
  },
  escarcha: {
    emoji:'❄️', name:'Flor Escarcha', cost:145, recharge:25000,
    hp:53, attack:true, explosive:true, fuseTime:1050,
    damage:1100, aoe:1.65, freezeBlast:true, slowDur:4800,
    desc:'Congela por unos segundos a los enemigos cercanos y estalla como el ají.',
    anim:'anim-bomba',
  },
  onda: {
    emoji:'🌀', name:'Onda Sísmica', cost:165, recharge:27000,
    hp:61, attack:true, explosive:true, fuseTime:1150,
    damage:320, waveBlast:true, waveWidth:9999,
    desc:'Lanza una onda explosiva que atraviesa todo el campo y debilita enemigos en su fila.',
    anim:'anim-bomba',
  },
  hongito: {
    emoji:'🍄', name:'Honguito Nube', cost:0, recharge:7800,
    hp:78, attack:true, damage:12, fireRate:2200, range:2,
    projEmoji:'💨', projSpeed:260,
    desc:'Gratis y de corto alcance.',
    anim:'anim-hongito',
  },
  atrapadora: {
    emoji:'🪤', name:'Atrapadora', cost:150, recharge:40000,
    hp:171, attack:true, chomper:true, damage:9999,
    fireRate:8000, range:1, eatTime:5000,
    desc:'Se come un enemigo completo.',
    anim:'anim-atrapadora',
  },
  brocoli: {
    emoji:'🥦', name:'Brócoli Combate', cost:40, recharge:4200,
    hp:112, attack:true, damage:15, fireRate:1300, range:9, shots:2,
    slows:true, slowDur:2200,
    projEmoji:'🥦', projSpeed:370,
    desc:'Doble disparo ralentizador. Aliado desde el inicio.',
    anim:'anim-doble',
  },

  berenjena: {
    emoji:'🍆', name:'Berenjena Aliada', cost:40, recharge:4000,
    hp:105, attack:true, damage:17, fireRate:1350, range:9, shots:2,
    projEmoji:'🟣', projSpeed:400,
    desc:'Doble disparo veloz desde el carril. Aliada desde el inicio.',
    anim:'anim-doble',
  },

  papabomba: {
    emoji:'🥔', name:'Papa Bomba', cost:90, recharge:18000,
    hp:60, attack:false, mine:true, armTime:3200, damage:1800, aoe:1,
    desc:'Se entierra, se activa tras un momento y explota cuando un enemigo la pisa.',
    anim:'anim-bomba',
  },

  narcotica: {
    emoji:'🌸', name:'Flor Narcótica', cost:75, recharge:40000,
    hp:86, attack:false, hypno:true,
    desc:'El enemigo que la come cambia de bando.',
    anim:'anim-narcotica',
  },
  magnetica: {
    emoji:'🧲', name:'Cuadro Imán', cost:20, recharge:12000,
    hp:124, attack:false, magnetCollect:true, magnetRate:1,
    desc:'Se activa al instante: recoge todos los soles y estrellas visibles.',
    anim:'anim-magnetica',
  },

  moverficha: {
    emoji:'↔️', name:'Mover Ficha', cost:120, recharge:18000,
    hp:1, attack:false, utilityMove:true,
    desc:'Permite mover una planta, ayudante o enemigo a otra casilla.',
    anim:'anim-magnetica',
  },
};

/* ═══════════════════════════════════════
   SINERGIAS — pares de plantas adyacentes
═══════════════════════════════════════ */
const SYNERGIES = {
  'brocoli+nevada':   { color:'#00e5ff', label:'❄️ Súper Hielo',    desc:'Proyectiles congelan más tiempo y más fuerte.',    effect:'superFreeze'  },
  'nevada+brocoli':   { color:'#00e5ff', label:'❄️ Súper Hielo',    desc:'Proyectiles congelan más tiempo y más fuerte.',    effect:'superFreeze'  },
  'berenjena+fuego':  { color:'#ff6d00', label:'🔥 Quema Doble',    desc:'Proyectiles de berenjena queman al impactar.',     effect:'burnDouble'   },
  'fuego+berenjena':  { color:'#ff6d00', label:'🔥 Quema Doble',    desc:'Proyectiles de berenjena queman al impactar.',     effect:'burnDouble'   },
  'lanzadora+nevada': { color:'#80d8ff', label:'🧊 Guisantes Hielo',desc:'Proyectiles de alberja ralentizan al impactar.',   effect:'icePeas'      },
  'nevada+lanzadora': { color:'#80d8ff', label:'🧊 Guisantes Hielo',desc:'Proyectiles de alberja ralentizan al impactar.',   effect:'icePeas'      },
  'margarita+hongito':{ color:'#ffd740', label:'☀️ Cosecha Solar',  desc:'Margarita produce soles el doble de rápido.',      effect:'sunBoost'     },
  'hongito+margarita':{ color:'#ffd740', label:'☀️ Cosecha Solar',  desc:'Margarita produce soles el doble de rápido.',      effect:'sunBoost'     },
  'muro+granmuro':    { color:'#b0bec5', label:'🧱 Muro Titán',     desc:'Barrera compuesta: ambos ganan +40% HP.',          effect:'superWall'    },
  'granmuro+muro':    { color:'#b0bec5', label:'🧱 Muro Titán',     desc:'Barrera compuesta: ambos ganan +40% HP.',          effect:'superWall'    },
  // ── Nuevas sinergias (niveles 31+) ──────────────
  'fuego+bomba':      { color:'#ff3d00', label:'🔥💣 Apocalipsis',    desc:'Explosiones de la Flor de Fuego alcanzan área doble.', effect:'fireBomb'    },
  'bomba+fuego':      { color:'#ff3d00', label:'🔥💣 Apocalipsis',    desc:'Explosiones de la Flor de Fuego alcanzan área doble.', effect:'fireBomb'    },
  'triple+nevada':    { color:'#b3e5fc', label:'🍟❄️ Tormenta Frío',  desc:'Ráfagas triples congelan al impactar.',               effect:'iceTriple'   },
  'nevada+triple':    { color:'#b3e5fc', label:'🍟❄️ Tormenta Frío',  desc:'Ráfagas triples congelan al impactar.',               effect:'iceTriple'   },
  'atrapadora+fuego': { color:'#ff8a65', label:'🪤🔥 Trampa Ardiente',desc:'La Atrapadora quema todo lo que captura.',            effect:'trapFire'    },
  'fuego+atrapadora': { color:'#ff8a65', label:'🪤🔥 Trampa Ardiente',desc:'La Atrapadora quema todo lo que captura.',            effect:'trapFire'    },
  'gasolina+onda':    { color:'#ffd740', label:'⛽🌀 Ola de Fuego',   desc:'La Onda Sísmica lleva fuego al impactar.',            effect:'fireWave'    },
  'onda+gasolina':    { color:'#ffd740', label:'⛽🌀 Ola de Fuego',   desc:'La Onda Sísmica lleva fuego al impactar.',            effect:'fireWave'    },
};

/* ═══════════════════════════════════════════════
   FUSIONES — misma celda: dos plantas → una nueva
   ═══════════════════════════════════════════════ */
const FUSIONS = {
  // ── Fusiones base (2 plantas) ───────────────
  'margarita+margarita': { result:'supermargarita', label:'🌼🌼 → ✨Supermargarita' },
  'berenjena+brocoli':   { result:'berencoli',      label:'🍆🥦 → 💥Berencoli'     },
  'brocoli+berenjena':   { result:'berencoli',      label:'🍆🥦 → 💥Berencoli'     },
  'lanzadora+hongito':   { result:'alberhongo',     label:'🫛🍄 → 🌀Alberhongo'    },
  'hongito+lanzadora':   { result:'alberhongo',     label:'🫛🍄 → 🌀Alberhongo'    },
  'hongito+hongito':     { result:'superhongo',     label:'🍄🍄 → 💀Superhongo'    },
  'nevada+fuego':        { result:'tempestplant',   label:'🥑🔥 → 🌪️Tempestad'    },
  'fuego+nevada':        { result:'tempestplant',   label:'🥑🔥 → 🌪️Tempestad'    },
  'muro+bomba':          { result:'fortibomba',     label:'🌵🌶️ → 💣Fortiomba'    },
  'bomba+muro':          { result:'fortibomba',     label:'🌵🌶️ → 💣Fortiomba'    },
  'triple+doble':        { result:'megacañon',      label:'🍟🍇 → 🔫MegaCañón'     },
  'doble+triple':        { result:'megacañon',      label:'🍟🍇 → 🔫MegaCañón'     },
  // ── Fusiones TRIPLES (planta base + fusión existente) ─
  'supermargarita+fuego': { result:'astromargarita', label:'✨🔥 → ☀️Astromargarita (TRIPLE)' },
  'fuego+supermargarita': { result:'astromargarita', label:'✨🔥 → ☀️Astromargarita (TRIPLE)' },
  'berencoli+nevada':     { result:'glacioberena',   label:'💥❄️ → 🧊Glacioberena (TRIPLE)'   },
  'nevada+berencoli':     { result:'glacioberena',   label:'💥❄️ → 🧊Glacioberena (TRIPLE)'   },
  'alberhongo+fuego':     { result:'pirofongo',      label:'🌀🔥 → 🌋Pirofongo (TRIPLE)'      },
  'fuego+alberhongo':     { result:'pirofongo',      label:'🌀🔥 → 🌋Pirofongo (TRIPLE)'      },
  'superhongo+bombax':    { result:'megahongo',      label:'💀💣 → 💥Megahongo (TRIPLE)'       },
  'bombax+superhongo':    { result:'megahongo',      label:'💀💣 → 💥Megahongo (TRIPLE)'       },
};

// Las plantas fusionadas van en el catálogo PLANTS pero marcadas como fused
// para que NO aparezcan en el seed-bank directamente
PLANTS.supermargarita = {
  emoji:'🌼', name:'Supermargarita', fused:true,
  fuseEmoji:'🌼✨', fuseLabel:'Supermargarita',
  neonColor:'#ffd740',
  cost:0, recharge:0, hp:260,
  sunProd:true, sunRate:2923, sunAmt:35,
  attack:true, damage:18, fireRate:1600, range:9, shots:2,
  projEmoji:'✨', projSpeed:400,
  desc:'Fusión de dos Margaritas. Produce soles rápido Y ataca doble.',
  anim:'anim-margarita',
};
PLANTS.berencoli = {
  emoji:'🍆', name:'Berencoli', fused:true,
  fuseEmoji:'🍆🥦', fuseLabel:'Berencoli',
  neonColor:'#69f0ae',
  cost:0, recharge:0, hp:230,
  attack:true, damage:22, fireRate:1100, range:9, shots:2,
  slows:true, slowDur:2800, burn:true,
  projEmoji:'💜', projSpeed:430,
  desc:'Fusión Berenjena+Brócoli. Doble disparo: ralentiza Y quema.',
  anim:'anim-doble',
};
PLANTS.alberhongo = {
  emoji:'🫛', name:'Alberhongo', fused:true,
  fuseEmoji:'🫛🍄', fuseLabel:'Alberhongo',
  neonColor:'#ea80fc',
  cost:0, recharge:0, hp:210,
  attack:true, damage:20, fireRate:1000, range:9, shots:3,
  projEmoji:'💨', projSpeed:450,
  desc:'Fusión Alberja+Hongito. Ráfaga triple a gran velocidad.',
  anim:'anim-doble',
};
PLANTS.superhongo = {
  emoji:'🍄', name:'Superhongo', fused:true,
  fuseEmoji:'🍄🍄', fuseLabel:'Superhongo',
  neonColor:'#ff5252',
  cost:0, recharge:0, hp:180,
  attack:true, damage:30, fireRate:900, range:5,
  projEmoji:'🟤', projSpeed:350,
  desc:'Fusión de dos Hongitos. Daño altísimo en rango medio.',
  anim:'anim-hongito',
};
// ── Fusiones de par nuevo ───────────────────────
PLANTS.tempestplant = {
  emoji:'🌀', name:'Tempestad', fused:true,
  fuseEmoji:'🥑🔥', fuseLabel:'Tempestad',
  neonColor:'#ff6e40',
  cost:0, recharge:0, hp:200,
  attack:true, damage:36, fireRate:1200, range:9, shots:2,
  slows:true, slowDur:3000, burn:true, splash:true, aoe:0,
  projEmoji:'🌀', projSpeed:420,
  desc:'Fusión Aguacate+Fuego. Congela Y quema con ráfaga doble.',
  anim:'anim-fuego',
};
PLANTS.fortibomba = {
  emoji:'🌵', name:'Fortiomba', fused:true,
  fuseEmoji:'🌵💣', fuseLabel:'Fortiomba',
  neonColor:'#d500f9',
  cost:0, recharge:0, hp:1800,
  attack:true, explosive:true, fuseTime:1800, damage:3500, aoe:1.8,
  desc:'Muro que explota. Aguanta mucho daño y luego detona en área.',
  anim:'anim-bomba',
};
PLANTS.megacañon = {
  emoji:'🍟', name:'MegaCañón', fused:true,
  fuseEmoji:'🍟🍇', fuseLabel:'MegaCañón',
  neonColor:'#ffab00',
  cost:0, recharge:0, hp:220,
  attack:true, damage:28, fireRate:800, range:9, shots:5,
  projEmoji:'⚡', projSpeed:500,
  desc:'Ráfaga de 5 disparos. La cadencia más alta del juego.',
  anim:'anim-doble',
};
// ── Fusiones TRIPLES ────────────────────────────
PLANTS.astromargarita = {
  emoji:'🌼', name:'Astromargarita', fused:true,
  fuseEmoji:'🌼☀️🔥', fuseLabel:'Astromargarita ✦TRIPLE',
  neonColor:'#ff6d00',
  cost:0, recharge:0, hp:340,
  sunProd:true, sunRate:1800, sunAmt:55,
  attack:true, damage:35, fireRate:950, range:9, shots:3, burn:true,
  projEmoji:'🔥', projSpeed:490,
  desc:'TRIPLE: Produce soles extra Y dispara fuego triple quemante.',
  anim:'anim-margarita',
};
PLANTS.glacioberena = {
  emoji:'🍆', name:'Glacioberena', fused:true,
  fuseEmoji:'🍆❄️💥', fuseLabel:'Glacioberena ✦TRIPLE',
  neonColor:'#00b0ff',
  cost:0, recharge:0, hp:295,
  attack:true, damage:30, fireRate:880, range:9, shots:3,
  slows:true, slowDur:5000, burn:true,
  projEmoji:'🧊', projSpeed:470,
  desc:'TRIPLE: Congela larga duración + quema + triple disparo.',
  anim:'anim-doble',
};
PLANTS.pirofongo = {
  emoji:'🍄', name:'Pirofongo', fused:true,
  fuseEmoji:'🍄🔥🌀', fuseLabel:'Pirofongo ✦TRIPLE',
  neonColor:'#ff3d00',
  cost:0, recharge:0, hp:265,
  attack:true, damage:48, fireRate:1050, range:7, shots:2,
  burn:true, splash:true, aoe:0,
  projEmoji:'🔥', projSpeed:400,
  desc:'TRIPLE: Doble fuego en área. El daño por disparo más alto del juego.',
  anim:'anim-fuego',
};
PLANTS.megahongo = {
  emoji:'🍄', name:'Megahongo', fused:true,
  fuseEmoji:'🍄💥💣', fuseLabel:'Megahongo ✦TRIPLE',
  neonColor:'#ff1744',
  cost:0, recharge:0, hp:250,
  attack:true, explosive:true, fuseTime:500, damage:6000, aoe:2.8,
  desc:'TRIPLE EXPLOSIVO: Detona con área devastadora. El arma más potente.',
  anim:'anim-bomba',
};

const ZOMBIES = {
  basico:      { emoji:'🧟', name:'Zombie Básico',      hp:100, speed:28, damage:1, points:10, w:52, h:68, family:'zombie' },
  casco:       { emoji:'🪖', name:'Zombie Casco',       hp:280, speed:28, damage:1, points:18, w:52, h:68, family:'zombie' },
  cubeta:      { emoji:'🪣', name:'Zombie Cubeta',      hp:650, speed:26, damage:1, points:30, w:52, h:68, family:'zombie' },
  acrobata:    { emoji:'🤸', name:'Zombie Acróbata',    hp:180, speed:40, damage:1, points:24, w:52, h:68, jumps:true, family:'zombie' },
  globo:       { emoji:'🎈', name:'Zombie Globo',       hp:100, speed:40, damage:1, points:25, w:52, h:68, flies:true, family:'zombie' },
  bailarin:    { emoji:'💃', name:'Zombie Bailarín',    hp:220, speed:32, damage:1, points:38, w:52, h:68, spawnsMinions:true, family:'zombie' },
  corredor:    { emoji:'🏃', name:'Zombie Corredor',    hp:95,  speed:56, damage:1, points:18, w:50, h:66, family:'zombie' },
  coloso:      { emoji:'👹', name:'Zombie Coloso',      hp:3000, speed:20, damage:3, points:150, w:72, h:88, miniBoss:true, family:'zombie' },
  secuaz:      { emoji:'⚔️', name:'Secuaz Blindado',    hp:920, speed:28, damage:2, points:48, w:58, h:72, family:'zombie' },
  murcielago:  { emoji:'🦇', name:'Murciélago Nocturno',hp:80, speed:62, damage:1, points:16, w:46, h:52, flies:true, family:'beast' },
  vampiro:     { emoji:'🧛', name:'Vampiro Sombrío',    hp:360, speed:36, damage:2, points:42, w:56, h:74, family:'dark' },
  fantasma:    { emoji:'👻', name:'Fantasma Brumoso',   hp:190, speed:36, damage:1, points:28, w:54, h:70, family:'specter' },
  lobo:        { emoji:'🐺', name:'Lobo Lunar',         hp:260, speed:58, damage:2, points:32, w:56, h:60, family:'beast' },
  bruja:       { emoji:'🧙‍♀️', name:'Bruja del Bordillo',hp:420, speed:30, damage:2, points:50, w:58, h:74, family:'dark', spawnsMinions:true },
  espectro:    { emoji:'😶‍🌫️', name:'Espectro Gris',    hp:520, speed:28, damage:2, points:58, w:58, h:72, family:'specter' },
  curandero:   { emoji:'🩹',  name:'Zombie Curandero', hp:260, speed:24, damage:1, points:45, w:52, h:68, family:'zombie', healer:true,  healRate:15, healInterval:4000 },
  excavador:   { emoji:'⛏️',  name:'Zombie Excavador', hp:200, speed:30, damage:1, points:40, w:52, h:68, family:'zombie', tunnels:true  },
  lanzador:    { emoji:'🪃',  name:'Zombie Lanzador',  hp:150, speed:18, damage:2, points:42, w:52, h:68, family:'zombie', rangedAttack:true, attackRange:4, rangedInterval:2400 },

  // ═══════════════════════════════════════════════════
  // NUEVOS ENEMIGOS — Niveles 31-90 (Zombiemanía Total)
  // ═══════════════════════════════════════════════════

  // --- Familia Spectral ---
  fantasma_poseido: { emoji:'👻', name:'Zombie Fantasma Poseído', hp:320, speed:44, damage:1, points:60, w:50, h:66, flies:true, family:'specter', opacity:0.55 },
  sombra_secuaz:   { emoji:'😶‍🌫️', name:'Secuaz de las Sombras', hp:440, speed:32, damage:2, points:68, w:54, h:70, family:'specter' },

  // --- Familia Royale ---
  princesa_zombie: { emoji:'👸', name:'Princesa Zombie Poseída', hp:720, speed:22, damage:3, points:100, w:64, h:82, spawnsMinions:true, rangedAttack:true, attackRange:5, rangedInterval:2600, miniBoss:true, family:'royale' },
  dama_zombie:     { emoji:'💅', name:'Dama de Honor Zombie',   hp:280, speed:30, damage:2, points:50, w:52, h:68, family:'royale' },

  // --- Familia Infernal ---
  diablo_zombie:  { emoji:'👿', name:'Diablo Zombie Poseído', hp:560, speed:30, damage:3, points:85, w:60, h:76, family:'infernal' },
  oni_zombie:     { emoji:'👹', name:'Oni Zombie Poseído',    hp:950, speed:20, damage:4, points:120, w:68, h:86, miniBoss:true, family:'infernal' },
  tengu_zombie:   { emoji:'👺', name:'Tengu Zombie Poseído',  hp:320, speed:62, damage:2, points:70, w:54, h:72, jumps:true, family:'infernal' },

  // --- Familia Crawler ---
  arana_zombie:   { emoji:'🕷️', name:'Araña Zombie Poseída',      hp:360, speed:32, damage:2, points:75, w:58, h:62, family:'crawler' },
  pajaro_arana:   { emoji:'🐦', name:'Pájaro-Araña Zombie',        hp:210, speed:54, damage:1, points:60, w:50, h:58, flies:true, family:'crawler' },
  serpiente_zombie:{ emoji:'🐍', name:'Serpiente Zombie Poseída',  hp:300, speed:40, damage:2, points:70, w:54, h:62, tunnels:true, family:'crawler' },

  // --- Familia Grave (salen de la tierra) ---
  lapida_zombie:  { emoji:'🪦', name:'Lápida Zombie',       hp:1200, speed:14, damage:3, points:95, w:62, h:78, groundBurst:true, miniBoss:true, family:'grave' },
  ataud_zombie:   { emoji:'⚰️', name:'Ataúd Zombie',        hp:800,  speed:18, damage:3, points:80, w:60, h:76, groundBurst:true, family:'grave' },

  // --- Familia Chaos ---
  payaso_zombie:     { emoji:'🤡', name:'Payaso Zombie Poseído',    hp:390, speed:38, damage:2, points:78, w:58, h:76, spawnsMinions:true, family:'chaos' },
  torbellino_zombie: { emoji:'🌪️', name:'Zombie Torbellino',        hp:270, speed:50, damage:2, points:72, w:52, h:70, flies:true, family:'chaos' },
  mareo_zombie:      { emoji:'😵‍💫', name:'Zombie Mareado',          hp:320, speed:32, damage:2, points:74, w:56, h:72, family:'chaos' },

  // --- Familia Bio ---
  bionico_zombie: { emoji:'☣️', name:'Zombie Biónico',      hp:490, speed:36, damage:2, points:88, w:58, h:74, immuneToSlow:true, family:'bio' },
  craneo_zombie:  { emoji:'☠️', name:'Zombie Cráneo Maldito',hp:800, speed:24, damage:3, points:92, w:60, h:78, miniBoss:true, family:'bio' },

  // --- Familia Cosmic (disparan proyectiles) ---
  nave_zombie:  { emoji:'🚀', name:'Nave Zombie Poseída', hp:460, speed:46, damage:2, points:84, w:62, h:68, flies:true, rangedAttack:true, attackRange:6, rangedInterval:2200, family:'cosmic' },
  ovni_zombie:  { emoji:'🛸', name:'OVNI Zombie Poseído', hp:620, speed:38, damage:3, points:102, w:68, h:68, flies:true, rangedAttack:true, attackRange:9, rangedInterval:3000, spawnsMinions:true, miniBoss:true, family:'cosmic' },
  satelite_zombie:{ emoji:'🌐', name:'Satélite Zombie',   hp:380, speed:42, damage:2, points:76, w:56, h:64, flies:true, family:'cosmic' },

  // ═══════════════════════════════════════════════════
  // DR. SOMBRA — El Villano Principal
  // Científico zombificado por su propio Serum Sombra.
  // Trae jeringas que paralizan plantas, invoca hordas
  // y escapa antes de morir... hasta el nivel 90.
  // ═══════════════════════════════════════════════════
  dr_sombra: {
    emoji: '🧪',
    boardEmojiHTML: '<span class="mob-stack mob-boss mob-sombra"><span class="mob-badge">💀</span><span class="mob-core">🧪</span></span>',
    name: 'Dr. Sombra — Fase I',
    hp: 12000, speed: 18, damage: 4, points: 800,
    w: 92, h: 112, boss: true, finalBoss: false,
    glow: '#ce93d8', explosiveResist: 0.55, family: 'sombra',
    jumps: true, regen: true, regenRate: 8,
    shootsBack: true, multiSummon: true, spawnsMinions: true,
    escapes: true,
    desc: 'El Dr. Sombra zombificado. Lanza jeringas de Serum Sombra que paralizan plantas. Escapa si pierde mucha vida.',
  },
  dr_sombra_mk2: {
    emoji: '🧪',
    boardEmojiHTML: '<span class="mob-stack mob-boss mob-sombra"><span class="mob-badge">☠️</span><span class="mob-core">🧪</span></span>',
    name: 'Dr. Sombra — Fase II',
    hp: 22000, speed: 16, damage: 5, points: 1200,
    w: 92, h: 112, boss: true, finalBoss: false,
    glow: '#ab47bc', explosiveResist: 0.60, family: 'sombra',
    jumps: true, regen: true, regenRate: 14,
    shootsBack: true, multiSummon: true, spawnsMinions: true,
    escapes: true,
    desc: 'Forma evolucionada. Aura zombiemanía que accelera a todos sus secuaces. Escapa antes de morir.',
  },
  dr_sombra_final: {
    emoji: '🧪',
    boardEmojiHTML: '<span class="mob-stack mob-boss mob-sombra"><span class="mob-badge">🌌</span><span class="mob-core">🧪</span></span>',
    name: '¡Dr. Sombra OMEGA!',
    hp: 40000, speed: 14, damage: 7, points: 3000,
    w: 96, h: 118, boss: true, finalBoss: true,
    glow: '#ea80fc', explosiveResist: 0.65, family: 'sombra',
    jumps: true, regen: true, regenRate: 20,
    shootsBack: true, multiSummon: true, spawnsMinions: true,
    escapes: false,
    desc: 'Forma definitiva del Dr. Sombra. Ha absorbido el serum de mil zombies. Esta vez NO escapa.',
  },

  // ═══════════════════════════════════════════════════
  // ZOMBOT SOMBRA — El Robot Gigante del Dr. Sombra
  // Creación mecánica infectada por zombiemanía.
  // Dispara misiles zombie y pisa carriles enteros.
  // ═══════════════════════════════════════════════════
  robot_gigante: {
    emoji: '🤖',
    boardEmojiHTML: '<span class="mob-stack mob-boss mob-robot"><span class="mob-badge">⚙️</span><span class="mob-core">🤖</span></span>',
    name: 'Zombot Sombra',
    hp: 20000, speed: 13, damage: 5, points: 1100,
    w: 102, h: 124, boss: true, finalBoss: false,
    glow: '#80cbc4', explosiveResist: 0.62, family: 'robot',
    jumps: false, regen: true, regenRate: 12,
    shootsBack: true, multiSummon: false, spawnsMinions: true,
    immuneToSlow: true, escapes: true,
    desc: 'Robot mecánico infectado por zombiemanía. Sus cañones disparan misiles zombie. Escapa si es vencido.',
  },
  robot_gigante_mk2: {
    emoji: '🤖',
    boardEmojiHTML: '<span class="mob-stack mob-boss mob-robot"><span class="mob-badge">💀</span><span class="mob-core">🤖</span></span>',
    name: 'Zombot Sombra Mk.II',
    hp: 32000, speed: 12, damage: 6, points: 1800,
    w: 102, h: 124, boss: true, finalBoss: false,
    glow: '#4dd0e1', explosiveResist: 0.67, family: 'robot',
    jumps: false, regen: true, regenRate: 16,
    shootsBack: true, multiSummon: true, spawnsMinions: true,
    immuneToSlow: true, escapes: true,
    desc: 'Versión blindada con adamantita zombificada. Abre el pecho para liberar una horda de emergencia.',
  },
  robot_gigante_final: {
    emoji: '🤖',
    boardEmojiHTML: '<span class="mob-stack mob-boss mob-robot"><span class="mob-badge">🌌</span><span class="mob-core">🤖</span></span>',
    name: '¡Zombot Sombra SUPREMO!',
    hp: 48000, speed: 11, damage: 8, points: 3500,
    w: 110, h: 132, boss: true, finalBoss: true,
    glow: '#18ffff', explosiveResist: 0.72, family: 'robot',
    jumps: false, regen: true, regenRate: 22,
    shootsBack: true, multiSummon: true, spawnsMinions: true,
    immuneToSlow: true, escapes: false,
    desc: 'Forma suprema del Zombot. Dispara misiles a TODOS los carriles simultáneamente. NO escapa.',
  },
};

const HELPERS = {
  emilia: {
    emoji:'👧', name:'Emilia', cost:30, cooldown:18000, duration:12000, hp:171,
    power:'iceBurst', desc:'Doble disparo de hielo que ralentiza.'
  },
  martin: {
    emoji:'🧒', name:'Martín', cost:50, cooldown:30000, duration:12500, hp:200,
    power:'tripleBurst', desc:'Ráfaga triple veloz.'
  },
  papa: {
    emoji:'🦸‍♂️', name:'Super Papá', cost:70, cooldown:42000, duration:11000, hp:247,
    power:'laserBeam', desc:'Láser chispeante en su carril.'
  },
  alien: {
    emoji:'👽', name:'Alien', cost:90, cooldown:46000, duration:10500, hp:218,
    power:'rocketBurst', desc:'Cohetes explosivos en área.'
  },
  auto: {
    emoji:'🚗', name:'Autito Arrollador', cost:30, cooldown:32000, duration:5200, hp:949,
    power:'carRush', desc:'Colócalo en una fila y avanzará de izquierda a derecha atropellando enemigos. Cuesta 30⭐ o 1000🏆.'
  },
  lluviaSolar: {
    emoji:'🌤️', name:'Lluvia Solar', cost:28, cooldown:30000, duration:5500, hp:1,
    power:'sunRain', desc:'Llueve soles del cielo durante 5s. Ideal para emergencias económicas.'
  },
  astronauta: {
    emoji:'👨‍🚀', name:'Astronauta', cost:80, cooldown:46000, duration:12000, hp:280,
    power:'meteorShower', desc:'Lanza meteoritos en área. Daño masivo en 3 casillas aleatorias. Cuesta 80⭐.'
  },
  unicornio: {
    emoji:'🦄', name:'Unicornio Explosivo', cost:60, cooldown:38000, duration:10000, hp:220,
    power:'chocoExplosion', desc:'Chocolates explosivos que ralentizan Y queman al impactar. Cuesta 60⭐.'
  },
};

function E(type,row,delay=0,extra={}) { return { type, row, delay, ...extra }; }
function W(enemies,nextDelay=8000,isFinal=false,title='') { return { enemies, nextDelay, ...(isFinal?{isFinal:true}:{}) , ...(title?{title}:{})}; }
function hordeWave(level, featurePool, title='🚨 ¡HORDA!') {
  const rows = [0,1,2,3,4];
  const base = rows.map((row, i) => E('basico', row, i*280));
  const extras = rows.map((row, i) => E(featurePool[(level + row) % featurePool.length], row, 1100 + i*320));
  return W([...base, ...extras], 7200 + level*80, false, title);
}
function bossTypeForLevel(levelNumber){ return `boss_${levelNumber}`; }

const THEMES = [
  {
    'emoji': '🌿',
    'label': 'Jardín de Sausalito',
    'worldClass': 'jardin',
    'bossEmoji': '🌹',
    'bossName': 'Brote Carmesí',
    'glow': '#ffd54f'
  },
  {
    'emoji': '❄️',
    'label': 'Tundra Boreal',
    'worldClass': 'tundra',
    'bossEmoji': '🐻',
    'bossName': 'Titán Boreal',
    'glow': '#90caf9'
  },
  {
    'emoji': '🌴',
    'label': 'Amazonas Vivo',
    'worldClass': 'amazonas',
    'bossEmoji': '🐍',
    'bossName': 'Reina Liana',
    'glow': '#69f0ae'
  },
  {
    'emoji': '🧊',
    'label': 'Reino de Hielo',
    'worldClass': 'hielo',
    'bossEmoji': '🧊',
    'bossName': 'Rey Témpano',
    'glow': '#b3e5fc'
  },
  {
    'emoji': '🌫️',
    'label': 'Valle de la Niebla',
    'worldClass': 'niebla',
    'bossEmoji': '👻',
    'bossName': 'Nieblor',
    'glow': '#d1c4e9'
  },
  {
    'emoji': '🔥',
    'label': 'Corredor de Magma',
    'worldClass': 'magma',
    'bossEmoji': '🔥',
    'bossName': 'Magmadragón',
    'glow': '#ff8a65'
  },
  {
    'emoji': '🌎',
    'label': 'Campos de Tierra',
    'worldClass': 'tierra',
    'bossEmoji': '🪨',
    'bossName': 'Terracrán',
    'glow': '#bcaaa4'
  },
  {
    'emoji': '🟤',
    'label': 'Paso del Lodo',
    'worldClass': 'lodo',
    'bossEmoji': '🪱',
    'bossName': 'Barrobruto',
    'glow': '#8d6e63'
  },
  {
    'emoji': '🏜️',
    'label': 'Desierto Solar',
    'worldClass': 'desierto',
    'bossEmoji': '🦂',
    'bossName': 'Faraón de Polvo',
    'glow': '#ffcc80'
  },
  {
    'emoji': '🌌',
    'label': 'Órbita Espacial',
    'worldClass': 'espacial',
    'bossEmoji': '🛸',
    'bossName': 'Orbitón',
    'glow': '#80d8ff'
  },
  {
    'emoji': '🏞️',
    'label': 'Río Resplandor',
    'worldClass': 'rio',
    'bossEmoji': '🐉',
    'bossName': 'Leviatán del Río',
    'glow': '#80cbc4'
  },
  {
    'emoji': '🌊',
    'label': 'Mar Profundo',
    'worldClass': 'mar',
    'bossEmoji': '🐙',
    'bossName': 'Marea Oscura',
    'glow': '#4fc3f7'
  },
  {
    'emoji': '🐊',
    'label': 'Pantano Umbrío',
    'worldClass': 'pantano',
    'bossEmoji': '🐊',
    'bossName': 'Rey Pantanoso',
    'glow': '#aed581'
  },
  {
    'emoji': '🌳',
    'label': 'Selva Salvaje',
    'worldClass': 'selva',
    'bossEmoji': '🐆',
    'bossName': 'Jaguar de la Selva',
    'glow': '#66bb6a'
  },
  {
    'emoji': '🌲',
    'label': 'Bosque Oscuro',
    'worldClass': 'bosque',
    'bossEmoji': '🦉',
    'bossName': 'Guardián Umbrío',
    'glow': '#7e57c2'
  },
  {
    'emoji': '🏙️',
    'label': 'Ciudad de Neón',
    'worldClass': 'ciudad',
    'bossEmoji': '🚧',
    'bossName': 'Asfalto Rex',
    'glow': '#64b5f6'
  },
  {
    'emoji': '⛰️',
    'label': 'Montaña Alta',
    'worldClass': 'montana',
    'bossEmoji': '🗿',
    'bossName': 'Coloso Alpino',
    'glow': '#b0bec5'
  },
  {
    'emoji': '🌋',
    'label': 'Volcán Rojo',
    'worldClass': 'volcan',
    'bossEmoji': '🌋',
    'bossName': 'Vulkar',
    'glow': '#ff7043'
  },
  {
    'emoji': '🕳️',
    'label': 'Cueva Profunda',
    'worldClass': 'cueva',
    'bossEmoji': '🦇',
    'bossName': 'Eco Profundo',
    'glow': '#9fa8da'
  },
  {
    'emoji': '⛈️',
    'label': 'Tormenta Eléctrica',
    'worldClass': 'tormenta',
    'bossEmoji': '⚡',
    'bossName': 'Tempestus',
    'glow': '#ffd54f'
  },
  {
    'emoji': '☁️',
    'label': 'Senderos del Cielo',
    'worldClass': 'cielo',
    'bossEmoji': '🪽',
    'bossName': 'Señor Estratos',
    'glow': '#b3e5fc'
  },
  {
    'emoji': '🏛️',
    'label': 'Ruinas Perdidas',
    'worldClass': 'ruinas',
    'bossEmoji': '🗿',
    'bossName': 'Centinela Roto',
    'glow': '#ffe082'
  },
  {
    'emoji': '🌴',
    'label': 'California Nocturna',
    'worldClass': 'california',
    'bossEmoji': '🌉',
    'bossName': 'Sunset Crusher',
    'glow': '#ffab91'
  },
  {
    'emoji': '🧱',
    'label': 'Distrito Cemento',
    'worldClass': 'cemento',
    'bossEmoji': '🧱',
    'bossName': 'Cementor',
    'glow': '#cfd8dc'
  },
  {
    'emoji': '🧪',
    'label': 'Laboratorio Zombra',
    'worldClass': 'laboratorio',
    'bossEmoji': '🧪',
    'bossName': 'Dr. Zombra Beta',
    'glow': '#f06292'
  },
  {
    'emoji': '🏭',
    'label': 'Fábrica Mecánica',
    'worldClass': 'fabrica',
    'bossEmoji': '⚙️',
    'bossName': 'Forjax',
    'glow': '#ffcc80'
  },
  {
    'emoji': '💎',
    'label': 'Palacio Cristal',
    'worldClass': 'cristal',
    'bossEmoji': '💎',
    'bossName': 'Prisma Omega',
    'glow': '#e1bee7'
  },
  {
    'emoji': '🌸',
    'label': 'Primavera Florida',
    'worldClass': 'primavera',
    'bossEmoji': '🦋',
    'bossName': 'Reina Pétalo',
    'glow': '#f8bbd0'
  },
  {
    'emoji': '🤠',
    'label': 'Oeste Salvaje',
    'worldClass': 'oeste',
    'bossEmoji': '🤠',
    'bossName': 'Sheriff Sombra',
    'glow': '#ffcc80'
  },
  {
    'emoji': '🚇',
    'label': 'Metro Zombra',
    'worldClass': 'metro',
    'bossEmoji': '🚇',
    'bossName': 'Dr. Zombra Omega',
    'glow': '#ff1744'
  },
  // ══════════════════════════════════════════════════
  // TEMAS NIVELES 31 — 90 (60 mundos nuevos)
  // ══════════════════════════════════════════════════
  { emoji:'🧬', label:'Laboratorio Mutante',         worldClass:'lab_mutante',    bossEmoji:'🧬', bossName:'Mutación Gamma',       glow:'#76ff03' },
  { emoji:'🏚️', label:'Arrabal Infectado',            worldClass:'arrabal',        bossEmoji:'🏚️', bossName:'Rey del Arrabal',       glow:'#aed581' },
  { emoji:'🌑', label:'Eclipse Zombie',               worldClass:'eclipse',        bossEmoji:'🌑', bossName:'Devorador del Sol',     glow:'#37474f' },
  { emoji:'🫀', label:'Corazón de las Tinieblas',     worldClass:'corazon',        bossEmoji:'🫀', bossName:'Latido Infernal',       glow:'#f44336' },
  { emoji:'🧠', label:'Mente Colmena',                worldClass:'colmena',        bossEmoji:'🧠', bossName:'Cerebro Supremo',       glow:'#e91e63' },
  { emoji:'⚗️', label:'Destilería del Horror',        worldClass:'destileria',     bossEmoji:'⚗️', bossName:'Alquimista Oscuro',     glow:'#9c27b0' },
  { emoji:'🌒', label:'Medianoche Eterna',             worldClass:'medianoche',     bossEmoji:'🌒', bossName:'Lord Medianoche',       glow:'#311b92' },
  { emoji:'🏗️', label:'Obra Maldita',                 worldClass:'obra_maldita',   bossEmoji:'🏗️', bossName:'Constructor Maldito',   glow:'#795548' },
  { emoji:'🎪', label:'Circo del Apocalipsis',        worldClass:'circo',          bossEmoji:'🎪', bossName:'Director Zombie',       glow:'#e53935' },
  { emoji:'🔬', label:'Fortaleza Sombra · Fase I',   worldClass:'fortaleza_s1',   bossEmoji:'🧪', bossName:'Dr. Sombra — Fase I',   glow:'#7b1fa2' },
  { emoji:'🧿', label:'Ojo del Abismo',               worldClass:'ojo_abismo',     bossEmoji:'🧿', bossName:'Oráculo Oscuro',        glow:'#0d47a1' },
  { emoji:'🎭', label:'Teatro de los Condenados',     worldClass:'teatro',         bossEmoji:'🎭', bossName:'Phantom Zombie',        glow:'#424242' },
  { emoji:'🌫️', label:'Niebla Ácida',                 worldClass:'niebla_acida',   bossEmoji:'🌫️', bossName:'Nuboso Corrosivo',      glow:'#827717' },
  { emoji:'🐸', label:'Pantano Tóxico',               worldClass:'pantano_toxico', bossEmoji:'🐸', bossName:'Señor del Pantano',     glow:'#2e7d32' },
  { emoji:'🦠', label:'Zona de Cuarentena',           worldClass:'cuarentena',     bossEmoji:'🦠', bossName:'Patógeno Supremo',      glow:'#ff6f00' },
  { emoji:'🏰', label:'Castillo de las Sombras',      worldClass:'castillo',       bossEmoji:'🏰', bossName:'Barón Oscuro',          glow:'#4a148c' },
  { emoji:'🌊', label:'Tsunami Zombie',               worldClass:'tsunami',        bossEmoji:'🌊', bossName:'Marea Zombie',          glow:'#006064' },
  { emoji:'⚰️', label:'Cementerio Eterno',            worldClass:'cementerio',     bossEmoji:'⚰️', bossName:'Señor de los Muertos',  glow:'#1a237e' },
  { emoji:'🕯️', label:'Catacumbas Ardientes',         worldClass:'catacumbas',     bossEmoji:'🕯️', bossName:'Inquisidor Zombie',     glow:'#bf360c' },
  { emoji:'⚡', label:'Taller del Robot · Fase II',  worldClass:'taller_robot',   bossEmoji:'🧪', bossName:'Dr. Sombra — Fase II',  glow:'#aa00ff' },
  { emoji:'🌌', label:'Galaxia Infectada',            worldClass:'galaxia',        bossEmoji:'🌌', bossName:'Cosmonauta Zombie',     glow:'#1a237e' },
  { emoji:'🎠', label:'Carrusel del Caos',            worldClass:'carrusel',       bossEmoji:'🎠', bossName:'Amo del Carrusel',      glow:'#880e4f' },
  { emoji:'🏟️', label:'Coliseo Zombie',               worldClass:'coliseo',        bossEmoji:'🏟️', bossName:'Gladiador Eterno',      glow:'#e65100' },
  { emoji:'🗺️', label:'Mapa del Fin del Mundo',       worldClass:'mapa_fin',       bossEmoji:'🗺️', bossName:'Cartógrafo Oscuro',     glow:'#33691e' },
  { emoji:'🧊', label:'Cripta Congelada',             worldClass:'cripta',         bossEmoji:'🧊', bossName:'Lich Glacial',          glow:'#80deea' },
  { emoji:'🌋', label:'Magma Profundo',               worldClass:'magma_prof',     bossEmoji:'🌋', bossName:'Vulkar Supremo',        glow:'#dd2c00' },
  { emoji:'🏜️', label:'Arena Maldita',                worldClass:'arena_maldita',  bossEmoji:'🏜️', bossName:'Faraón Zombie',         glow:'#f9a825' },
  { emoji:'🌀', label:'Vórtice Dimensional',          worldClass:'vortice',        bossEmoji:'🌀', bossName:'Maestro del Caos',      glow:'#7986cb' },
  { emoji:'🌸', label:'Jardín Venenoso',              worldClass:'jardin_venenoso',bossEmoji:'🌸', bossName:'Flor del Mal',          glow:'#ad1457' },
  { emoji:'☠️', label:'Cuartel Sombra · Fase III',   worldClass:'cuartel_s1',     bossEmoji:'🧪', bossName:'Dr. Sombra + Zombot',   glow:'#6a1b9a' },
  { emoji:'🔮', label:'Esfera del Destino',           worldClass:'esfera',         bossEmoji:'🔮', bossName:'Adivino Zombie',        glow:'#7e57c2' },
  { emoji:'🕸️', label:'La Gran Telaraña',             worldClass:'telarana',       bossEmoji:'🕸️', bossName:'Reina Araña Zombie',    glow:'#546e7a' },
  { emoji:'🌑', label:'Vacío Oscuro',                 worldClass:'vacio',          bossEmoji:'🌑', bossName:'Nihilista Zombie',      glow:'#212121' },
  { emoji:'🧪', label:'Fórmula Maligna',              worldClass:'formula',        bossEmoji:'🧪', bossName:'Quimera Zombie',        glow:'#00bfa5' },
  { emoji:'🪄', label:'Hechizo Imparable',            worldClass:'hechizo',        bossEmoji:'🪄', bossName:'Nigromante Zombie',     glow:'#7b1fa2' },
  { emoji:'🌩️', label:'Tormenta Violeta',             worldClass:'torm_violeta',   bossEmoji:'🌩️', bossName:'Rayo Zombie',           glow:'#6a1b9a' },
  { emoji:'🎯', label:'Campo Minado',                 worldClass:'campo_minado',   bossEmoji:'🎯', bossName:'Comando Zombie',        glow:'#004d40' },
  { emoji:'🔩', label:'Engranaje del Apocalipsis',    worldClass:'engranaje',      bossEmoji:'🔩', bossName:'Mecánico Zombie',       glow:'#37474f' },
  { emoji:'🏛️', label:'Templo de los Caídos',         worldClass:'templo_caidos',  bossEmoji:'🏛️', bossName:'Dios Caído',            glow:'#f57f17' },
  { emoji:'🔬', label:'Laboratorio Supremo · F.IV',  worldClass:'lab_supremo',    bossEmoji:'🧪', bossName:'Dr. Sombra Mk.II + Zombot',glow:'#4a0072'},
  { emoji:'🌊', label:'Mar de Almas',                 worldClass:'mar_almas',      bossEmoji:'🌊', bossName:'Poseidón Zombie',       glow:'#01579b' },
  { emoji:'🧩', label:'Laberinto sin Salida',         worldClass:'laberinto',      bossEmoji:'🧩', bossName:'Laberíntico Zombie',    glow:'#f57f17' },
  { emoji:'🌪️', label:'Ojo del Huracán',              worldClass:'huracan',        bossEmoji:'🌪️', bossName:'Torbellino Supremo',    glow:'#546e7a' },
  { emoji:'🌺', label:'Valle de la Muerte',           worldClass:'valle_muerte',   bossEmoji:'🌺', bossName:'Señor del Valle',       glow:'#880e4f' },
  { emoji:'💣', label:'Campo de Batalla',             worldClass:'campo_batalla',  bossEmoji:'💣', bossName:'General Zombie',        glow:'#b71c1c' },
  { emoji:'🦷', label:'Fauces del Abismo',            worldClass:'fauces',         bossEmoji:'🦷', bossName:'Devorador',             glow:'#455a64' },
  { emoji:'🎆', label:'Explosión Sin Fin',            worldClass:'explosion_fin',  bossEmoji:'🎆', bossName:'Apocalipsis',           glow:'#e65100' },
  { emoji:'🕳️', label:'El Gran Agujero',              worldClass:'gran_agujero',   bossEmoji:'🕳️', bossName:'Singularidad Zombie',   glow:'#1a1a2e' },
  { emoji:'🌐', label:'Red de Sombras',               worldClass:'red_sombras',    bossEmoji:'🌐', bossName:'Arquitecto de Sombras', glow:'#1b5e20' },
  { emoji:'💀', label:'Cuartel Gral. Sombra · F.V',  worldClass:'cuartel_s2',     bossEmoji:'🧪', bossName:'Dr. Sombra Mk.II + Zombot Mk.II',glow:'#38006b'},
  { emoji:'🧬', label:'Mutación Extrema',             worldClass:'mutacion',       bossEmoji:'🧬', bossName:'Hipermutante',          glow:'#00695c' },
  { emoji:'🌌', label:'Nebulosa Zombie',              worldClass:'nebulosa',       bossEmoji:'🌌', bossName:'Señor de la Nebulosa',  glow:'#283593' },
  { emoji:'🔥', label:'Infierno Vivo',                worldClass:'infierno_vivo',  bossEmoji:'🔥', bossName:'Señor del Infierno',    glow:'#b71c1c' },
  { emoji:'⚡', label:'Descarga Total',               worldClass:'descarga_total', bossEmoji:'⚡', bossName:'Electromonstruo',       glow:'#f9a825' },
  { emoji:'🌑', label:'La Hora Oscura ·  85',         worldClass:'hora_oscura',    bossEmoji:'🧪', bossName:'Dr. Sombra + Zombot · Escapan',glow:'#4a0072'},
  { emoji:'🏚️', label:'Último Refugio ·  86',         worldClass:'ult_refugio',    bossEmoji:'🧪', bossName:'Dr. Sombra + Zombot · Escapan',glow:'#37474f'},
  { emoji:'💉', label:'Serum Omega ·  87',            worldClass:'serum_omega',    bossEmoji:'🧪', bossName:'Dr. Sombra + Zombot · Escapan',glow:'#880e4f'},
  { emoji:'🤖', label:'El Zombot Despierta ·  88',    worldClass:'zombot_desp',    bossEmoji:'🤖', bossName:'Dr. Sombra + Zombot · Escapan',glow:'#1a237e'},
  { emoji:'☠️', label:'Penúltima Hora ·  89',         worldClass:'penultima',      bossEmoji:'☠️', bossName:'Dr. Sombra + Zombot · Escapan',glow:'#4e342e'},
  { emoji:'🌌', label:'¡LA BATALLA FINAL! · Nivel 90',worldClass:'batalla_final',  bossEmoji:'💀', bossName:'Dr. Sombra OMEGA + Zombot Supremo',glow:'#ff1744'},
];

const BOSS_EMOJIS = ['🧟‍♂️','🧟‍♀️','🧟‍🦺','🧟‍🔥','☠️','👾','💀','🧟','👻','🤡'];
const BOSS_BADGES = ['👑','⚡','🩸','☣️','🔥','💜','🟣','🖤','🔴','⚠️'];
for (let i = 1; i <= 90; i++) {
  const th = THEMES[i-1];
  const bEmoji = BOSS_EMOJIS[(i-1) % BOSS_EMOJIS.length];
  const bBadge = BOSS_BADGES[(i-1) % BOSS_BADGES.length];
  // Jefes especiales en los mundos de Dr. Sombra: el boss_N es su lugarteniente
  const isSombraLevel = [40,50,60,70,80,85,86,87,88,89,90].includes(i);
  const bossNames = {
    30: 'Dr. Zombra Omega',
    40: 'Lugarteniente Sombra Alfa',
    50: 'Lugarteniente Sombra Beta',
    60: 'Comandante del Zombot',
    70: 'General Sombra Supremo',
    80: 'Guardián del Cuartel',
    85: 'Centinela Sombra I',
    86: 'Centinela Sombra II',
    87: 'Centinela Sombra III',
    88: 'Centinela Sombra IV',
    89: 'Centinela Sombra V',
    90: 'Guardaespaldas Final',
  };
  ZOMBIES[`boss_${i}`] = {
    emoji: bEmoji,
    boardEmojiHTML: `<span class="mob-stack mob-boss"><span class="mob-badge">${bBadge}</span><span class="mob-core">${bEmoji}</span></span>`,
    name: bossNames[i] || `Zombi Alfa ${i} · ${th.label}`,
    hp: Math.round((2400 + i * 300) * (i > 30 ? 1 + (i-30)*0.06 : 1)),
    speed: Math.max(14, 22 - Math.floor(i / 7)),
    damage: 2 + Math.floor(i / 6),
    points: 220 + i * 25,
    w: i > 60 ? 88 : 82, h: i > 60 ? 104 : 98,
    boss: true,
    finalBoss: i === 90,
    glow: th.glow,
    explosiveResist: Math.min(0.70, 0.42 + i * 0.003),
    family: isSombraLevel ? 'sombra' : 'boss',
    jumps:      i >= 10,
    regen:      i >= 15,
    regenRate:  i >= 15 ? 2 + Math.floor(i / 4) : 0,
    shootsBack: i >= 20,
    multiSummon: i >= 25,
  };
}

const ALL_BASE_PLANTS = ['margarita','lanzadora','muro','hongito','bomba','bombax','escarcha','onda','berenjena','brocoli'];
const PLANT_UNLOCKS = [
  ['margarita','lanzadora','muro','hongito','bomba','bombax','magnetica','berenjena','brocoli'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','magnetica','berenjena','brocoli'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','magnetica','nevada','berenjena','brocoli'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','gasolina','magnetica','nevada','berenjena','brocoli','doble','escarcha'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','gasolina','magnetica','nevada','berenjena','brocoli','doble','granmuro','onda'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','gasolina','magnetica','nevada','berenjena','brocoli','doble','granmuro','fuego','escarcha'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','gasolina','magnetica','nevada','berenjena','brocoli','doble','granmuro','fuego','atrapadora'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','gasolina','magnetica','nevada','berenjena','brocoli','doble','granmuro','fuego','atrapadora','narcotica'],
  ['margarita','lanzadora','muro','hongito','bomba','bombax','gasolina','magnetica','nevada','berenjena','brocoli','doble','triple','granmuro','fuego','atrapadora','narcotica']
];

function allowedPlantsForLevel(level) {
  const idx = Math.min(PLANT_UNLOCKS.length - 1, Math.floor((level - 1) / 3));
  return PLANT_UNLOCKS[idx];
}

function featurePoolForLevel(level) {
  const pool = ['basico','casco','corredor'];
  if (level >= 2)  pool.push('acrobata');
  if (level >= 3)  pool.push('globo');
  if (level >= 4)  pool.push('murcielago');
  if (level >= 5)  pool.push('cubeta');
  if (level >= 6)  pool.push('vampiro', 'curandero');
  if (level >= 7)  pool.push('secuaz');
  if (level >= 8)  pool.push('bailarin');
  if (level >= 9)  pool.push('fantasma', 'excavador');
  if (level >= 10) pool.push('coloso');
  if (level >= 12) pool.push('lobo', 'lanzador');
  if (level >= 14) pool.push('bruja');
  if (level >= 16) pool.push('espectro');
  // Nuevos enemigos — Niveles 18-90
  if (level >= 18) pool.push('fantasma_poseido');
  if (level >= 20) pool.push('lapida_zombie', 'payaso_zombie');
  if (level >= 22) pool.push('princesa_zombie', 'bionico_zombie');
  if (level >= 24) pool.push('diablo_zombie', 'serpiente_zombie');
  if (level >= 26) pool.push('oni_zombie', 'tengu_zombie');
  if (level >= 28) pool.push('arana_zombie', 'torbellino_zombie');
  if (level >= 30) pool.push('pajaro_arana', 'mareo_zombie');
  if (level >= 32) pool.push('nave_zombie', 'craneo_zombie');
  if (level >= 34) pool.push('ataud_zombie', 'sombra_secuaz');
  if (level >= 36) pool.push('dama_zombie');
  if (level >= 38) pool.push('ovni_zombie');
  if (level >= 40) pool.push('satelite_zombie');
  return pool;
}


function familyWaveTitle(level, featurePool, idx) {
  const fam = featurePool[(level + idx) % featurePool.length];
  const meta = ZOMBIES[fam] || {};
  const family = meta.family || 'zombie';
  if (family === 'beast') return idx === 0 ? '🦇 Manada salvaje' : '🐺 Combo bestial';
  if (family === 'dark') return idx === 0 ? '🧛 Linaje oscuro' : '🧙‍♀️ Noche hechizada';
  if (family === 'specter') return idx === 0 ? '👻 Bruma espectral' : '😶‍🌫️ Combo fantasmal';
  return idx === 0 ? '🌊 Oleada inicial' : '⚠️ Empuje zombi';
}

function namedWave(level, featurePool, idx) {
  const rowCycle = [2,1,3,0];
  const rowA = rowCycle[(level + idx) % rowCycle.length];
  const rowB = rowCycle[(level + idx + 2) % rowCycle.length];
  const rowC = rowCycle[(level + idx + 4) % rowCycle.length];
  const heavy = level > 10 ? 'secuaz' : (level > 5 ? 'cubeta' : 'casco');
  const extra1 = featurePool[(level + idx) % featurePool.length];
  const extra2 = featurePool[(level + idx + 3) % featurePool.length];
  const extra3 = featurePool[(level + idx + 5) % featurePool.length];
  return W([
    E('basico', rowA, 0),
    E(extra1, rowB, 900),
    E('basico', rowC, 1700),
    E(extra2, rowA, 2600),
    E(heavy, rowB, 3600),
    E(extra3, rowCycle[(level + idx + 1) % rowCycle.length], 4700),
  ], 7800 + level * 70, false, familyWaveTitle(level, featurePool, idx));
}


function chapterProfile(level) {
  const chapter = Math.ceil(level / 5);
  const within = (level - 1) % 5;
  const curve = within / 4;
  const presets = {
    1: { key:'aprendizaje', damageBase:0.80, damageStep:0.08, hpBase:0.88, hpStep:0.08, speedBase:0.94, speedStep:0.03, density:0, prepBonus:4, sunBonus:40, waveDelayMult:1.08, rewardSun:60, rewardStar:12, bossHp:0.90, bossDamage:0.86, bossSpeed:0.95 },
    2: { key:'control', damageBase:0.90, damageStep:0.08, hpBase:0.95, hpStep:0.09, speedBase:0.97, speedStep:0.04, density:1, prepBonus:2, sunBonus:28, waveDelayMult:1.00, rewardSun:60, rewardStar:13, bossHp:0.96, bossDamage:0.92, bossSpeed:0.98 },
    3: { key:'presion', damageBase:0.98, damageStep:0.09, hpBase:1.02, hpStep:0.12, speedBase:1.00, speedStep:0.05, density:1, prepBonus:1, sunBonus:18, waveDelayMult:0.96, rewardSun:65, rewardStar:14, bossHp:1.03, bossDamage:0.98, bossSpeed:1.02 },
    4: { key:'caos', damageBase:1.03, damageStep:0.11, hpBase:1.10, hpStep:0.14, speedBase:1.02, speedStep:0.06, density:2, prepBonus:0, sunBonus:8, waveDelayMult:0.92, rewardSun:70, rewardStar:15, bossHp:1.10, bossDamage:1.03, bossSpeed:1.04 },
    5: { key:'estrategia', damageBase:1.08, damageStep:0.08, hpBase:1.18, hpStep:0.12, speedBase:1.04, speedStep:0.05, density:2, prepBonus:-1, sunBonus:0, waveDelayMult:0.90, rewardSun:70, rewardStar:16, bossHp:1.16, bossDamage:1.06, bossSpeed:1.05 },
    6: { key:'dominio',     damageBase:1.10, damageStep:0.08, hpBase:1.24, hpStep:0.14, speedBase:1.05, speedStep:0.05, density:3, prepBonus:-1, sunBonus:-8,   waveDelayMult:0.88, rewardSun:75,  rewardStar:17, bossHp:1.22, bossDamage:1.08, bossSpeed:1.06 },
    7: { key:'tormenta',    damageBase:1.14, damageStep:0.09, hpBase:1.34, hpStep:0.15, speedBase:1.07, speedStep:0.06, density:3, prepBonus:-2, sunBonus:-12,  waveDelayMult:0.86, rewardSun:82,  rewardStar:19, bossHp:1.30, bossDamage:1.12, bossSpeed:1.08 },
    8: { key:'caos_total',  damageBase:1.18, damageStep:0.10, hpBase:1.44, hpStep:0.16, speedBase:1.09, speedStep:0.07, density:4, prepBonus:-2, sunBonus:-16,  waveDelayMult:0.84, rewardSun:88,  rewardStar:20, bossHp:1.38, bossDamage:1.16, bossSpeed:1.10 },
    9: { key:'apocalipsis', damageBase:1.22, damageStep:0.11, hpBase:1.56, hpStep:0.18, speedBase:1.11, speedStep:0.07, density:4, prepBonus:-3, sunBonus:-20,  waveDelayMult:0.82, rewardSun:94,  rewardStar:22, bossHp:1.48, bossDamage:1.20, bossSpeed:1.12 },
   10: { key:'supremo',     damageBase:1.26, damageStep:0.12, hpBase:1.68, hpStep:0.20, speedBase:1.13, speedStep:0.08, density:5, prepBonus:-3, sunBonus:-24,  waveDelayMult:0.80, rewardSun:100, rewardStar:24, bossHp:1.58, bossDamage:1.24, bossSpeed:1.14 },
   11: { key:'titan',       damageBase:1.30, damageStep:0.13, hpBase:1.82, hpStep:0.22, speedBase:1.15, speedStep:0.09, density:5, prepBonus:-3, sunBonus:-28,  waveDelayMult:0.78, rewardSun:106, rewardStar:26, bossHp:1.68, bossDamage:1.28, bossSpeed:1.16 },
   12: { key:'leyenda',     damageBase:1.34, damageStep:0.14, hpBase:1.98, hpStep:0.24, speedBase:1.17, speedStep:0.10, density:6, prepBonus:-4, sunBonus:-32,  waveDelayMult:0.76, rewardSun:112, rewardStar:28, bossHp:1.80, bossDamage:1.32, bossSpeed:1.18 },
   13: { key:'ultimate',    damageBase:1.38, damageStep:0.15, hpBase:2.16, hpStep:0.26, speedBase:1.19, speedStep:0.10, density:6, prepBonus:-4, sunBonus:-36,  waveDelayMult:0.74, rewardSun:118, rewardStar:30, bossHp:1.92, bossDamage:1.37, bossSpeed:1.20 },
   14: { key:'omega',       damageBase:1.42, damageStep:0.16, hpBase:2.36, hpStep:0.28, speedBase:1.21, speedStep:0.11, density:7, prepBonus:-4, sunBonus:-40,  waveDelayMult:0.72, rewardSun:124, rewardStar:32, bossHp:2.06, bossDamage:1.42, bossSpeed:1.22 },
   15: { key:'absoluto',    damageBase:1.46, damageStep:0.17, hpBase:2.58, hpStep:0.30, speedBase:1.23, speedStep:0.12, density:7, prepBonus:-5, sunBonus:-44,  waveDelayMult:0.70, rewardSun:130, rewardStar:34, bossHp:2.22, bossDamage:1.47, bossSpeed:1.24 },
   16: { key:'final_boss',  damageBase:1.50, damageStep:0.18, hpBase:2.82, hpStep:0.32, speedBase:1.25, speedStep:0.12, density:7, prepBonus:-5, sunBonus:-48,  waveDelayMult:0.68, rewardSun:136, rewardStar:36, bossHp:2.40, bossDamage:1.53, bossSpeed:1.26 },
   17: { key:'mas_alla',    damageBase:1.55, damageStep:0.19, hpBase:3.08, hpStep:0.34, speedBase:1.27, speedStep:0.13, density:8, prepBonus:-5, sunBonus:-52,  waveDelayMult:0.66, rewardSun:142, rewardStar:38, bossHp:2.60, bossDamage:1.59, bossSpeed:1.28 },
   18: { key:'sombra_total',damageBase:1.60, damageStep:0.20, hpBase:3.40, hpStep:0.36, speedBase:1.29, speedStep:0.14, density:8, prepBonus:-5, sunBonus:-56,  waveDelayMult:0.64, rewardSun:150, rewardStar:42, bossHp:2.82, bossDamage:1.66, bossSpeed:1.30 },
  };
  const base = presets[chapter];
  return {
    chapter,
    key: base.key,
    damageMult: +(base.damageBase + base.damageStep * curve).toFixed(3),
    hpMult: +(base.hpBase + base.hpStep * curve).toFixed(3),
    speedMult: +(base.speedBase + base.speedStep * curve).toFixed(3),
    density: base.density + (within >= 3 ? 1 : 0),
    prepBonus: base.prepBonus,
    sunBonus: base.sunBonus,
    waveDelayMult: base.waveDelayMult,
    rewardSun: base.rewardSun + Math.floor(within / 2) * 5,
    rewardStar: base.rewardStar + (within >= 4 ? 1 : 0),
    bossHpMult: +(base.bossHp + 0.03 * curve).toFixed(3),
    bossDamageMult: +(base.bossDamage + 0.03 * curve).toFixed(3),
    bossSpeedMult: +(base.bossSpeed + 0.02 * curve).toFixed(3),
    pointsMult: +(1 + (chapter - 1) * 0.08 + curve * 0.04).toFixed(3),
  };
}

function scaledSpawn(type, row, delay, profile, role='normal', extra={}) {
  let hpMult = profile.hpMult;
  let damageMult = profile.damageMult;
  let speedMult = profile.speedMult;
  let pointsMult = profile.pointsMult;

  if (role === 'tank') { hpMult *= 1.2; speedMult *= 0.95; }
  if (role === 'fast') { hpMult *= 0.9; speedMult *= 1.18; }
  if (role === 'support') { hpMult *= 1.08; damageMult *= 1.04; }
  if (role === 'horde') { hpMult *= 0.98; speedMult *= 1.03; }
  if (role === 'boss') {
    hpMult *= profile.bossHpMult;
    damageMult *= profile.bossDamageMult;
    speedMult *= profile.bossSpeedMult;
    pointsMult *= 1.2;
  }

  return E(type, row, delay, {
    hpMult: +hpMult.toFixed(3),
    damageMult: +damageMult.toFixed(3),
    speedMult: +speedMult.toFixed(3),
    pointsMult: +pointsMult.toFixed(3),
    ...extra,
  });
}

function withWaveRewards(wave, profile, sunBoost=0, starBoost=0) {
  wave.sunReward = Math.max(50, profile.rewardSun + sunBoost);
  wave.starReward = Math.max(10, profile.rewardStar + starBoost);
  wave.nextDelay = Math.max(5200, Math.round((wave.nextDelay || 8000) * profile.waveDelayMult));
  return wave;
}

function supportPack(level, bossRow, featurePool, profile) {
  const strong = level > 18 ? 'secuaz' : (level > 9 ? 'cubeta' : 'casco');
  const special = featurePool[(level + 1) % featurePool.length];
  const special2 = featurePool[(level + 4) % featurePool.length];
  const pack = [
    scaledSpawn(strong, (bossRow + 1) % 5, 1100, profile, 'tank'),
    scaledSpawn(special, (bossRow + 2) % 5, 1900, profile, 'support'),
    scaledSpawn(strong, (bossRow + 3) % 5, 2800, profile, 'tank'),
    scaledSpawn(special2, (bossRow + 4) % 5, 3600, profile, 'support'),
  ];
  if (profile.chapter >= 4) pack.push(scaledSpawn(featurePool[(level + 6) % featurePool.length], (bossRow + 0) % 5, 4300, profile, 'support'));
  if (profile.chapter >= 6) pack.push(scaledSpawn('secuaz', (bossRow + 2) % 5, 5000, profile, 'tank'));
  return pack;
}

// ── Niveles con aparición de Dr. Sombra ──────────
const DR_SOMBRA_LEVELS   = new Set([40,50,60,70,80,85,86,87,88,89,90]);
const ROBOT_GIGANTE_LEVELS = new Set([60,70,80,85,86,87,88,89,90]);
const ESCAPE_LEVELS      = new Set([40,50,60,70,80,85,86,87,88,89]); // todos excepto 90
const DUAL_BOSS_LEVELS   = new Set([35,45,55,65,75]);                // 2 jefes regulares
const TRIPLE_BOSS_LEVELS = new Set([50,60,70,80,90]);                // 3 entidades boss

const LEVELS = [];
for (let level = 1; level <= 90; level++) {
  const theme = THEMES[level - 1];
  const featurePool = featurePoolForLevel(level);
  const bossType = bossTypeForLevel(level);
  const bossRow = [2,1,4,3,0][(level - 1) % 5];
  const profile = chapterProfile(level);
  const prepTime = Math.max(5, 16 - Math.floor(level / 4) + profile.prepBonus);
  const startSuns = Math.max(90, 120 + Math.floor((level - 1) * 10) + profile.sunBonus);
  const waves = [];

  // ── Oleada 1 ──
  waves.push(withWaveRewards(namedWave(level, featurePool, 0, profile), profile, 0, 0));
  // ── Oleada 2 ──
  waves.push(withWaveRewards(namedWave(level, featurePool, 1, profile), profile, 5, 1));
  // ── Horda 1 ──
  waves.push(withWaveRewards(hordeWave(level, featurePool, profile, level % 3 === 0 ? '🚨 ¡HORDA TOTAL POR FAMILIAS!' : '🚨 ¡HORDA MIXTA!'), profile, 10, 2));

  // ── Horda 2 (siempre desde nivel 15, aumenta complejidad) ──
  const hordeRows = [0,1,2,3,4];
  const fullHorde = [];
  hordeRows.forEach((row, idx) => fullHorde.push(scaledSpawn('basico', row, idx * 260, profile, 'horde')));
  hordeRows.forEach((row, idx) => fullHorde.push(scaledSpawn(featurePool[(level + idx + 2) % featurePool.length], row, 1600 + idx * 330, profile, idx % 2 === 0 ? 'support' : 'fast')));
  if (profile.chapter >= 3) fullHorde.push(scaledSpawn('secuaz', (bossRow + 1) % 5, 3400, profile, 'tank'));
  if (profile.chapter >= 5) fullHorde.push(scaledSpawn(featurePool[(level + 7) % featurePool.length], (bossRow + 3) % 5, 3900, profile, 'support'));
  // Segunda horda para niveles 31+: más densa
  if (level >= 31) {
    hordeRows.forEach((row, idx) => fullHorde.push(scaledSpawn(featurePool[(level + idx + 5) % featurePool.length], row, 5000 + idx * 280, profile, 'tank')));
  }
  waves.push(withWaveRewards(W(fullHorde, 8600 + level * 80, false, level >= 31 ? '💀🚨 ¡DOBLE HORDA!' : '💀 ¡HORDA DE SAUSALITO!'), profile, 15, 2));

  // ── Segunda horda adicional para niveles 50+ ──
  if (level >= 50) {
    const extraHorde = hordeWave(level, featurePool, profile, '🌊🌊 ¡TERCERA OLA!');
    waves.push(withWaveRewards(extraHorde, profile, 20, 3));
  }

  // ── Ola de boss ──
  const bossEnemies = [
    scaledSpawn(bossType, bossRow, 0, profile, 'boss'),
    ...supportPack(level, bossRow, featurePool, profile),
    ...(level >= 10 ? [scaledSpawn('secuaz',    (bossRow + 3) % 5, 4500, profile, 'tank')] : []),
    ...(level >= 18 ? [scaledSpawn('vampiro',    (bossRow + 2) % 5, 5200, profile, 'support'),
                       scaledSpawn('murcielago', (bossRow + 1) % 5, 5600, profile, 'fast')] : []),
    ...(level >= 24 ? [scaledSpawn('coloso',     (bossRow + 4) % 5, 6100, profile, 'boss')] : []),
    // Doble jefe en niveles especiales
    ...(DUAL_BOSS_LEVELS.has(level) ? [scaledSpawn(`boss_${Math.max(1,level-3)}`, (bossRow+2)%5, 5800, profile, 'boss')] : []),
  ];

  // ── Aparición de DR. SOMBRA ──
  if (DR_SOMBRA_LEVELS.has(level)) {
    const sombraType = level === 90 ? 'dr_sombra_final'
                     : level >= 60  ? 'dr_sombra_mk2'
                     :                'dr_sombra';
    const sombraRow  = (bossRow + 2) % 5;
    const isEscape   = ESCAPE_LEVELS.has(level);
    bossEnemies.push(scaledSpawn(sombraType, sombraRow, 2200, profile, 'boss', { escapes: isEscape }));
    // Minions exclusivos del Dr. Sombra
    bossEnemies.push(scaledSpawn('sombra_secuaz', (sombraRow+1)%4, 3000, profile, 'support'));
    bossEnemies.push(scaledSpawn('bionico_zombie', (sombraRow+2)%4, 3600, profile, 'fast'));
    if (level >= 60) bossEnemies.push(scaledSpawn('craneo_zombie', (bossRow+1)%5, 4200, profile, 'tank'));
  }

  // ── Aparición del ROBOT GIGANTE ──
  if (ROBOT_GIGANTE_LEVELS.has(level)) {
    const robotType = level === 90 ? 'robot_gigante_final'
                    : level >= 80  ? 'robot_gigante_mk2'
                    :                'robot_gigante';
    const robotRow  = (bossRow + 1) % 5;
    const isEscape  = ESCAPE_LEVELS.has(level);
    bossEnemies.push(scaledSpawn(robotType, robotRow, 4000, profile, 'boss', { escapes: isEscape }));
    bossEnemies.push(scaledSpawn('nave_zombie', (robotRow+2)%4, 5000, profile, 'support'));
    if (level >= 80) bossEnemies.push(scaledSpawn('ovni_zombie', (robotRow+1)%4, 5600, profile, 'support'));
  }

  const bossTitle = TRIPLE_BOSS_LEVELS.has(level) ? '💀👑💀 ¡TRIPLE AMENAZA!'
                  : DR_SOMBRA_LEVELS.has(level)   ? '🧪👑 ¡DR. SOMBRA HA LLEGADO!'
                  : DUAL_BOSS_LEVELS.has(level)    ? '👑👑 ¡DOBLE JEFE!'
                  :                                  '👑 ¡JEFE ILUMINADO!';
  const bossWave = W(bossEnemies, 9800 + level * 100, true, bossTitle);
  bossWave.sunReward  = profile.rewardSun + 20;
  bossWave.starReward = profile.rewardStar + 4;
  bossWave.nextDelay  = Math.max(6800, Math.round((bossWave.nextDelay || 9800) * profile.waveDelayMult));
  waves.push(bossWave);

  const WORLD_MUSIC = {
    // Niveles 1-30 (originales)
    jardin:'forest', tundra:'ice', amazonas:'jungle', hielo:'ice',
    niebla:'eerie', magma:'magma', tierra:'eerie', lodo:'eerie',
    desierto:'eerie', espacial:'space', rio:'jungle', mar:'space',
    pantano:'jungle', selva:'jungle', bosque:'forest', ciudad:'metro',
    montana:'eerie', volcan:'magma', cueva:'eerie', tormenta:'storm',
    cielo:'ice', ruinas:'eerie', california:'metro', cemento:'metro',
    laboratorio:'intense', fabrica:'metro', cristal:'space',
    primavera:'forest', oeste:'eerie', metro:'metro',
    // Niveles 31-90 (nuevos)
    lab_mutante:'intense', arrabal:'eerie', eclipse:'eerie',
    corazon:'magma', colmena:'intense', destileria:'intense',
    medianoche:'eerie', obra_maldita:'metro', circo:'storm',
    fortaleza_s1:'intense', ojo_abismo:'eerie', teatro:'eerie',
    niebla_acida:'eerie', pantano_toxico:'jungle', cuarentena:'intense',
    castillo:'eerie', tsunami:'space', cementerio:'eerie',
    catacumbas:'magma', taller_robot:'intense', galaxia:'space',
    carrusel:'storm', coliseo:'magma', mapa_fin:'eerie',
    cripta:'ice', magma_prof:'magma', arena_maldita:'eerie',
    vortice:'storm', jardin_venenoso:'forest', cuartel_s1:'intense',
    esfera:'space', telarana:'eerie', vacio:'eerie',
    formula:'intense', hechizo:'eerie', torm_violeta:'storm',
    campo_minado:'metro', engranaje:'metro', templo_caidos:'eerie',
    lab_supremo:'intense', mar_almas:'space', laberinto:'eerie',
    huracan:'storm', valle_muerte:'jungle', campo_batalla:'metro',
    fauces:'magma', explosion_fin:'magma', gran_agujero:'space',
    red_sombras:'intense', cuartel_s2:'intense', mutacion:'intense',
    nebulosa:'space', infierno_vivo:'magma', descarga_total:'storm',
    hora_oscura:'intense', ult_refugio:'eerie', serum_omega:'intense',
    zombot_desp:'intense', penultima:'intense', batalla_final:'intense',
  };
  const musicType = WORLD_MUSIC[theme.worldClass] || 'eerie';

  LEVELS.push({
    id: level,
    emoji: theme.emoji,
    boss: bossType,
    name: `Nivel ${level} — ${theme.label}`,
    startSuns,
    music: musicType,
    prepTime,
    allowedPlants: allowedPlantsForLevel(level),
    worldClass: theme.worldClass,
    difficultyProfile: profile,
    waves,
    // Marcar niveles de Dr. Sombra para efectos visuales futuros
    drSombraLevel: DR_SOMBRA_LEVELS.has(level),
    robotGiganteLevel: ROBOT_GIGANTE_LEVELS.has(level),
    escapeLevel: ESCAPE_LEVELS.has(level),
  });
}

function familyWaveTitle(level, featurePool, idx) {
  const fam = featurePool[(level + idx) % featurePool.length];
  const meta = ZOMBIES[fam] || {};
  const family = meta.family || 'zombie';
  if (family === 'beast') return idx === 0 ? '🦇 Manada salvaje' : '🐺 Combo bestial';
  if (family === 'dark') return idx === 0 ? '🧛 Linaje oscuro' : '🧙‍♀️ Noche hechizada';
  if (family === 'specter') return idx === 0 ? '👻 Bruma espectral' : '😶‍🌫️ Combo fantasmal';
  return idx === 0 ? '🌊 Oleada inicial' : '⚠️ Empuje zombi';
}

function namedWave(level, featurePool, idx, profile) {
  const rowCycle = [2,1,4,3,0];
  const rowA = rowCycle[(level + idx) % rowCycle.length];
  const rowB = rowCycle[(level + idx + 2) % rowCycle.length];
  const rowC = rowCycle[(level + idx + 4) % rowCycle.length];
  const heavy = level > 15 ? 'secuaz' : (level > 7 ? 'cubeta' : 'casco');
  const extra1 = featurePool[(level + idx) % featurePool.length];
  const extra2 = featurePool[(level + idx + 3) % featurePool.length];
  const extra3 = featurePool[(level + idx + 5) % featurePool.length];
  const enemies = [
    scaledSpawn('basico', rowA, 0, profile, 'normal'),
    scaledSpawn(extra1, rowB, 900, profile, ZOMBIES[extra1]?.speed > 45 ? 'fast' : 'support'),
    scaledSpawn('basico', rowC, 1700, profile, 'normal'),
    scaledSpawn(extra2, rowA, 2600, profile, 'support'),
    scaledSpawn(heavy, rowB, 3600, profile, 'tank'),
    scaledSpawn(extra3, rowCycle[(level + idx + 1) % rowCycle.length], 4700, profile, ZOMBIES[extra3]?.speed > 45 ? 'fast' : 'support'),
  ];
  if (profile.density >= 2) enemies.push(scaledSpawn('corredor', rowCycle[(level + idx + 3) % rowCycle.length], 5400, profile, 'fast'));
  if (profile.density >= 3) enemies.push(scaledSpawn(featurePool[(level + idx + 6) % featurePool.length], rowCycle[(level + idx + 2) % rowCycle.length], 6100, profile, 'support'));
  return W(enemies, 7800 + level * 70, false, familyWaveTitle(level, featurePool, idx));
}

function hordeWave(level, featurePool, profile, title='🚨 ¡HORDA!') {
  const rows = [0,1,2,3,4];
  const base = rows.map((row, i) => scaledSpawn('basico', row, i*240, profile, 'horde'));
  const extras = rows.map((row, i) => {
    const type = featurePool[(level + row) % featurePool.length];
    const role = ZOMBIES[type]?.speed > 45 ? 'fast' : (ZOMBIES[type]?.hp > 500 ? 'tank' : 'support');
    return scaledSpawn(type, row, 1000 + i*280, profile, role);
  });
  const pack = [...base, ...extras];
  if (profile.density >= 2) rows.forEach((row, i) => pack.push(scaledSpawn('corredor', row, 2100 + i*220, profile, 'fast')));
  if (profile.density >= 4) rows.forEach((row, i) => pack.push(scaledSpawn(featurePool[(level + i + 3) % featurePool.length], row, 3200 + i*240, profile, 'support')));
  return W(pack, 7200 + level*80, false, title);
}

(() => {
  'use strict';

  const VERSION = '0.7.14';
  const STORAGE_KEY = 'rizoma_zombie_strike_v0_3_state';
  const SAVE_KEY = 'rizoma_zombie_strike_v0_3_save';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a = 1, b = 0) => Math.random() * (a - b) + b;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const now = () => performance.now();

  function updateViewportVars() {
    const vv = window.visualViewport;
    const w = Math.max(320, Math.floor(vv?.width || window.innerWidth || document.documentElement.clientWidth || 360));
    const h = Math.max(320, Math.floor(vv?.height || window.innerHeight || document.documentElement.clientHeight || 640));
    document.documentElement.style.setProperty('--app-w', `${w}px`);
    document.documentElement.style.setProperty('--app-h', `${h}px`);
    document.documentElement.style.setProperty('--vh1', `${h * 0.01}px`);
    document.documentElement.style.setProperty('--vw1', `${w * 0.01}px`);
    document.body.classList.toggle('is-portrait', h >= w);
    document.body.classList.toggle('is-landscape', w > h);
    document.body.classList.toggle('is-touch-size', Math.min(w, h) <= 900);
  }

  const dist2 = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };
  const SHIP_PARTS_META = {
    core: { name: 'Núcleo blindado', icon: '⬢' },
    wings: { name: 'Alerones tácticos', icon: '◀▶' },
    cannon: { name: 'Cañón frontal', icon: '✦' },
    engine: { name: 'Motores vectoriales', icon: '≋' }
  };
  const BOSS_FAMILY_LABELS = {
    zombie: 'Legión zombie',
    bacteria: 'Brood bacteriana',
    demon: 'Dinastía demoníaca',
    witch: 'Círculo de brujas',
    spirit: 'Corte espectral',
    disease: 'Plaga viviente',
    mythic: 'Bestias mitológicas'
  };
  const BEAST_ICONS = { rat:'🐀', tick:'🕷️', scorpion:'🦂', roach:'🪳', centipede:'🐛', leech:'🪱', chimera:'🐲', spider:'🕷️', wasp:'🐝', puffer:'🐡' };
  const BEAST_LABELS = { rat:'rata alfa', tick:'garrapata', scorpion:'escorpión', roach:'cucaracha', centipede:'ciempiés', leech:'sanguijuela', chimera:'quimera', spider:'araña', wasp:'avispa', puffer:'pez globo' };
  const HANGAR_PART_INFO = {
    engine: { title: 'Motores vectoriales', bonus: '+velocidad, +imán, evasión y reposicionamiento.', note: 'Ideal para rutas móviles y kiteo largo.' },
    wings: { title: 'Alerones tácticos', bonus: '+agilidad lateral y mejor trazado de disparo.', note: 'Hace que la nave se sienta más fina y estable.' },
    cannon: { title: 'Cañón frontal', bonus: '+daño, +cadencia y mejor castigo al jefe.', note: 'Especialización agresiva para derribar élites.' },
    core: { title: 'Núcleo blindado', bonus: '+vida, +escudo y +regeneración.', note: 'Convierte la nave en una plataforma más resistente.' }
  };

  const AVATARS = [
    { id: 'explorador', name: 'Explorador Rizoma', icon: '⬢', color: '#61ffc8', desc: 'Equilibrado, estable y confiable.', passive: '+5% velocidad y daño', mod: { speed: 1.05, dmg: 1.05, shield: 1, hp: 1 } },
    { id: 'centinela', name: 'Centinela Verde', icon: '⬟', color: '#8dffb3', desc: 'Defensivo, ideal para resistir.', passive: '+35% escudo base', mod: { speed: .95, dmg: 1, shield: 1.35, hp: 1.05 } },
    { id: 'eco', name: 'Eco Nebular', icon: '✦', color: '#83eaff', desc: 'Rápido, ligero y evasivo.', passive: '+18% velocidad', mod: { speed: 1.18, dmg: .96, shield: .9, hp: .95 } },
    { id: 'medula', name: 'Médula de Luz', icon: '✚', color: '#ffe18c', desc: 'Regenera vida lentamente.', passive: 'Regeneración suave', mod: { speed: .98, dmg: 1, shield: 1, hp: 1.1, regen: .7 } },
    { id: 'orbita', name: 'Órbita Azul', icon: '◉', color: '#9ac7ff', desc: 'Tecnológico, inicia con dron.', passive: 'Dron inicial', mod: { speed: 1, dmg: .98, shield: 1, hp: 1, drone: 1 } },
    { id: 'fragmento', name: 'Fragmento Rojo', icon: '◆', color: '#ff7980', desc: 'Ofensivo y frágil.', passive: '+22% daño, -15% defensa', mod: { speed: 1.02, dmg: 1.22, shield: .85, hp: .92 } },
    { id: 'sombra', name: 'Sombra Blanca', icon: '◇', color: '#f2ffff', desc: 'Avanzado, fase evasiva breve.', passive: 'Microfase defensiva', mod: { speed: 1.08, dmg: 1.03, shield: .92, hp: .96, phase: 1 } },
    { id: 'interceptor', name: 'Interceptor Aurora', icon: '▴', color: '#7df8ff', desc: 'Nave veloz de entrada limpia.', passive: '+velocidad e imán', mod: { speed: 1.2, dmg: .98, shield: .92, hp: .96 } },
    { id: 'bastion', name: 'Bastión Solar', icon: '⬣', color: '#ffd56a', desc: 'Pesada, estable y resistente.', passive: '+vida y escudo', mod: { speed: .9, dmg: 1.02, shield: 1.28, hp: 1.22 } },
    { id: 'prisma', name: 'Prisma Delta', icon: '△', color: '#c391ff', desc: 'Ataque técnico y preciso.', passive: '+crítico y daño', mod: { speed: 1.03, dmg: 1.16, shield: .94, hp: .96 } },
    { id: 'meteoro', name: 'Meteoro Azul', icon: '◈', color: '#8fd6ff', desc: 'Rápida para esquivar oleadas.', passive: '+velocidad alta', mod: { speed: 1.28, dmg: .94, shield: .86, hp: .92 } },
    { id: 'nemesis', name: 'Némesis Verde', icon: '⬥', color: '#b7ff69', desc: 'Cazadora de jefes.', passive: '+daño contra élites', mod: { speed: 1.04, dmg: 1.25, shield: .9, hp: .95 } },
    { id: 'oraculo', name: 'Oráculo Blanco', icon: '✧', color: '#f5ffff', desc: 'Soporte y control.', passive: '+regeneración y escudo', mod: { speed: 1.02, dmg: 1, shield: 1.12, hp: 1.05, regen: .45 } }
  ];

  const MAPS = (() => {
    const families = [
      {
        family: 'zombie', icon: '🧟', pattern: 'swarm', specialName: 'Mordida viral', beast: 'rat',
        summons: ['errante', 'corredor', 'blindado'], theme: ['#07120f', '#17352a', '#72ffc7'],
        names: ['Barrio cero', 'Autopista rota', 'Hospital gris', 'Metro hundido', 'Catedral del hambre'],
        bosses: ['Archipeste del Umbral', 'Verdugo de la Carne Negra', 'Matriarca del Hambre Eterna', 'Abad de los Huesos Rotos', 'Monarca de la Podredumbre Solar'],
        lores: ['Los primeros mordidos no dejaron silencio.', 'La carretera aún mastica metal.', 'Las camillas aprendieron a caminar.', 'El eco del metro huele a podredumbre.', 'La fe también puede revivir mal.']
      },
      {
        family: 'bacteria', icon: '🦠', pattern: 'spore', specialName: 'Neblina infecciosa', beast: 'tick',
        summons: ['toxico', 'niebla', 'divisor'], theme: ['#081313', '#19433f', '#98fff1'],
        names: ['Colonia alfa', 'Tubo séptico', 'Cultivo negro', 'Biolaboratorio'],
        bosses: ['Patriarca Bacilo Omega', 'Soberano de la Sombra Microbiana', 'Emperador Esporular del Vacío', 'Reina Biofilm de las Mil Colonias'],
        lores: ['Un brote invisible aprendió a pensar.', 'Cada pared transpira contagio.', 'La caja de Petri se volvió imperio.', 'Los microscopios ahora rezan cerrados.']
      },
      {
        family: 'demon', icon: '😈', pattern: 'inferno', specialName: 'Llamarada abisal', beast: 'scorpion',
        summons: ['explosivo', 'griton', 'sombra'], theme: ['#170907', '#4a1715', '#ff8b63'],
        names: ['Fosa roja', 'Sótano infernal', 'Puerta de azufre', 'Claustro del humo'],
        bosses: ['Íncubo del Carbón Infinito', 'Belial de las Cadenas Ígneas', 'Demonio del Relámpago Profano', 'Archiduque de la Ceniza Carmesí'],
        lores: ['La tierra se abrió donde hubo juramentos.', 'El sótano ya no conduce abajo.', 'Una bisagra arde desde dentro.', 'Los muros aprendieron latín y fuego.']
      },
      {
        family: 'witch', icon: '🧙', pattern: 'hex', specialName: 'Maldición lunar', beast: 'roach',
        summons: ['niebla', 'sombra', 'griton'], theme: ['#0c0816', '#31164b', '#c391ff'],
        names: ['Bosque del aquelarre', 'Torre de brea', 'Lago de espejos', 'Observatorio brujo'],
        bosses: ['Bruja de las Trece Espinas', 'Gran Madre de la Caldera Negra', 'Hechicera de la Sal Maldita', 'Matrona del Eclipse Sangrante'],
        lores: ['El bosque murmura en femenino.', 'La torre hierve sin descanso.', 'Los reflejos no te pertenecen.', 'Las estrellas ahora cobran peaje.']
      },
      {
        family: 'spirit', icon: '👻', pattern: 'spectral', specialName: 'Velo espectral', beast: 'centipede',
        summons: ['sombra', 'niebla', 'nucleo'], theme: ['#08111a', '#173a52', '#9fe3ff'],
        names: ['Casa vacía', 'Puerto de ánimas', 'Cripta azul', 'Patio de lamentos'],
        bosses: ['Viuda del Eco Sepulcral', 'Señor del Silencio Absoluto', 'Custodio de la Penumbra Antigua', 'Espectro Septentrional de Cristal'],
        lores: ['Aquí nadie murió del todo.', 'El agua devuelve nombres.', 'Las lápidas respiran vapor.', 'Las quejas forman viento.']
      },
      {
        family: 'disease', icon: '☣️', pattern: 'plague', specialName: 'Brote tóxico', beast: 'leech',
        summons: ['toxico', 'divisor', 'nucleo'], theme: ['#08130b', '#26401e', '#bfff6f'],
        names: ['Zona cuarentena', 'Sala vectorial', 'Avenida febril', 'Nexo pandémico'],
        bosses: ['Plaga Vector Primigenia', 'Sepsis Magna de los Mil Órganos', 'Regente de la Fiebre Perpetua', 'Síndrome Ancestral del Último Aliento'],
        lores: ['La cinta amarilla no bastó.', 'Cada pasillo emite tos.', 'La fiebre diseñó la ciudad.', 'El síntoma encontró su corona.']
      },
      {
        family: 'mythic', icon: '🐲', pattern: 'mythic', specialName: 'Rugido arcano', beast: 'chimera',
        summons: ['blindado', 'corredor', 'explosivo'], theme: ['#10080d', '#3f1939', '#ff9ae2'],
        names: ['Valle dracónido', 'Nido del fénix', 'Jardín basilisco', 'Puente quimera', 'Trono hidra'],
        bosses: ['Draco Feral del Trono Abisal', 'Fénix Sombrío de la Ruina', 'Basilisco del Humo Petrificador', 'Quimera Arcana de Siete Fauces', 'Hidra Profana del Río Estelar'],
        lores: ['La leyenda mudó de piel.', 'El ave renace con rabia.', 'Una mirada puede pudrir acero.', 'Tres bestias aprendieron a compartir cuerpo.', 'Cada cabeza recuerda otro final.']
      }
    ];
    const maps = [];
    families.forEach(f => {
      f.names.forEach((name, i) => maps.push({
        id: `${f.family}_${i + 1}`,
        family: f.family,
        pattern: f.pattern,
        icon: f.icon,
        name,
        variant: i + 1,
        boss: f.bosses[i],
        beast: f.beast,
        summons: f.summons,
        theme: f.theme,
        lore: f.lores[i],
        specialName: f.specialName
      }));
    });
    return maps.slice(0, 30);
  })();

  const SHOP = [
    { id: 'hp', icon: '❤️', name: 'Vida base', desc: 'Más resistencia inicial.', max: 8, base: 70, step: 40, apply: p => p.maxHp += 12 },
    { id: 'shield', icon: '🛡️', name: 'Escudo base', desc: 'Absorbe más impacto.', max: 8, base: 70, step: 40, apply: p => p.maxShield += 10 },
    { id: 'speed', icon: '💨', name: 'Velocidad', desc: 'Mejor desplazamiento.', max: 7, base: 85, step: 48, apply: p => p.speed += 10 },
    { id: 'dmg', icon: '✦', name: 'Daño', desc: 'Disparos más fuertes.', max: 8, base: 95, step: 58, apply: p => p.damage += 3 },
    { id: 'cadence', icon: '⏱️', name: 'Cadencia', desc: 'Dispara más rápido.', max: 7, base: 110, step: 62, apply: p => p.fireDelay = Math.max(80, p.fireDelay - 18) },
    { id: 'magnet', icon: '🧲', name: 'Imán', desc: 'Atrae premios.', max: 6, base: 80, step: 48, apply: p => p.magnet += 28 },
    { id: 'crit', icon: '💥', name: 'Crítico', desc: 'Golpes elevados.', max: 6, base: 100, step: 62, apply: p => p.crit += .025 },
    { id: 'regen', icon: '✚', name: 'Regeneración', desc: 'Recupera vida lentamente.', max: 5, base: 120, step: 80, apply: p => p.regen += .18 },
    { id: 'armor', icon: '⬢', name: 'Blindaje mixto', desc: 'Vida y escudo.', max: 6, base: 130, step: 70, apply: p => { p.maxHp += 7; p.maxShield += 7; } },
    { id: 'thruster', icon: '🚀', name: 'Propulsores', desc: 'Velocidad e imán.', max: 6, base: 125, step: 72, apply: p => { p.speed += 7; p.magnet += 12; } },
    { id: 'cannon', icon: '🔺', name: 'Cañón doble', desc: 'Daño y cadencia.', max: 6, base: 145, step: 82, apply: p => { p.damage += 2.2; p.fireDelay = Math.max(90, p.fireDelay - 8); } },
    { id: 'battery', icon: '🔋', name: 'Batería OPEM', desc: 'Escudo y recuperación.', max: 5, base: 150, step: 86, apply: p => { p.maxShield += 12; p.regen += .08; } },
    { id: 'collector', icon: '🪙', name: 'Colector dorado', desc: 'Premios más fáciles.', max: 5, base: 115, step: 70, apply: p => { p.magnet += 36; p.crit += .006; } },
    { id: 'elite', icon: '👑', name: 'Cazajefes', desc: 'Más daño general.', max: 4, base: 180, step: 110, apply: p => { p.damage += 4; p.maxShield += 4; } }
  ];

  const POWERS = [
    { id: 'triple', icon: '🔱', name: 'Triple pulso', rarity: 'common', desc: 'Agrega disparos en abanico.', type: 'weapon' },
    { id: 'laser', icon: '━', name: 'Rayo continuo', rarity: 'rare', desc: 'Pulso lineal que atraviesa.', type: 'weapon' },
    { id: 'orbs', icon: '◌', name: 'Orbes orbitantes', rarity: 'rare', desc: 'Daño cercano alrededor del avatar.', type: 'defense' },
    { id: 'pierce', icon: '➤', name: 'Perforante', rarity: 'common', desc: 'Los disparos atraviesan más enemigos.', type: 'weapon' },
    { id: 'ice', icon: '❄', name: 'Campo frío', rarity: 'rare', desc: 'Ralentiza enemigos golpeados.', type: 'control' },
    { id: 'fire', icon: '🔥', name: 'Fuego expansivo', rarity: 'epic', desc: 'Daño gradual y estallido leve.', type: 'weapon' },
    { id: 'drone', icon: '🤖', name: 'Dron aliado', rarity: 'epic', desc: 'Ayudante temporal que dispara.', type: 'ally' },
    { id: 'ring', icon: '◎', name: 'Anillo defensivo', rarity: 'rare', desc: 'Círculo de contacto protector.', type: 'defense' },
    { id: 'bounce', icon: '↯', name: 'Rebote energético', rarity: 'epic', desc: 'Algunos disparos saltan entre objetivos.', type: 'weapon' },
    { id: 'pulse', icon: '✺', name: 'Pulso radial', rarity: 'legendary', desc: 'Explosión circular cada pocos segundos.', type: 'ultimate' },
    { id: 'opem', icon: '⟁', name: 'Pulso OPEM', rarity: 'epic', desc: 'Descarga electromagnética que aturde la horda.', type: 'control' },
    { id: 'nuke', icon: '☢', name: 'Bomba atómica', rarity: 'legendary', desc: 'Borra enemigos en pantalla y hiere al jefe.', type: 'ultimate' },
    { id: 'spark', icon: '⚡', name: 'Láser chispeante', rarity: 'epic', desc: 'Haz permanente durante 10 segundos.', type: 'weapon' },
    { id: 'torpedo', icon: '➹', name: 'Torpedos perseguidores', rarity: 'rare', desc: 'Misiles que buscan enemigos.', type: 'weapon' },
    { id: 'virus', icon: '☣', name: 'Virus letal', rarity: 'epic', desc: 'Infecta y contagia a la horda.', type: 'control' },
    { id: 'kamikaze', icon: '✹', name: 'Microdrones kamikazes', rarity: 'epic', desc: 'Drones suicidas interceptan objetivos.', type: 'ally' }
  ];

  const POWER_ACTIVE_SECONDS = {
    triple: 10, laser: 9, orbs: 8, pierce: 9, ice: 9, fire: 8, drone: 12, ring: 8,
    bounce: 8, pulse: 6, opem: 6, nuke: 7, spark: 10, torpedo: 6, virus: 7, kamikaze: 6
  };

  const FUSIONS = [
    { id: 'prisma', requires: ['triple', 'laser'], icon: '✷', name: 'Prisma fragmentado', desc: 'Tres rayos finos en abanico.' },
    { id: 'chispa', requires: ['fire', 'bounce'], icon: '☄', name: 'Chispa errante', desc: 'Fuego que salta entre enemigos.' },
    { id: 'lanza', requires: ['ice', 'pierce'], icon: '❖', name: 'Lanza criogénica', desc: 'Proyectiles veloces que ralentizan y atraviesan.' },
    { id: 'gravedad', requires: ['orbs', 'ring'], icon: '◍', name: 'Anillo gravitacional', desc: 'Zona orbital que retiene la horda.' },
    { id: 'resonante', requires: ['drone', 'pulse'], icon: '◈', name: 'Dron resonante', desc: 'Los drones descargan ondas cortas.' }
  ];

  const ENEMY_TYPES = [
    { id: 'errante', name: 'Errante', color: '#87ffbd', hp: 22, speed: 74, r: 15, xp: 9, score: 15, coin: 3, behavior: 'chase' },
    { id: 'corredor', name: 'Corredor', color: '#b9ff72', hp: 16, speed: 136, r: 12, xp: 10, score: 18, coin: 3, behavior: 'chase' },
    { id: 'esquivo', name: 'Esquivo neural', color: '#ffd56a', hp: 52, speed: 174, r: 11, xp: 18, score: 42, coin: 6, behavior: 'evader' },
    { id: 'cazador', name: 'Cazador kamikaze', color: '#ff6b73', hp: 68, speed: 196, r: 13, xp: 22, score: 48, coin: 7, behavior: 'kamikaze' },
    { id: 'mosquito', name: 'Mosquito invasivo', color: '#d6ff6f', hp: 8, speed: 185, r: 8, xp: 6, score: 11, coin: 2, behavior: 'zigzag' },
    { id: 'larva', name: 'Larva mutante', color: '#a6ffc9', hp: 10, speed: 112, r: 10, xp: 7, score: 12, coin: 2, behavior: 'chase' },
    { id: 'nave_espejo', name: 'Nave espejo', color: '#ff5e9d', hp: 54, speed: 148, r: 18, xp: 34, score: 95, coin: 18, behavior: 'mirror' },
    { id: 'blindado', name: 'Blindado', color: '#b7c1b4', hp: 88, speed: 32, r: 20, xp: 18, score: 34, coin: 6, behavior: 'chase' },
    { id: 'toxico', name: 'Tóxico', color: '#c7ff4d', hp: 42, speed: 48, r: 16, xp: 12, score: 25, coin: 5, behavior: 'toxic' },
    { id: 'sombra', name: 'Sombra', color: '#d9ccff', hp: 34, speed: 64, r: 14, xp: 13, score: 28, coin: 5, behavior: 'zigzag' },
    { id: 'griton', name: 'Gritón', color: '#ffdf75', hp: 46, speed: 42, r: 17, xp: 15, score: 30, coin: 6, behavior: 'buffer' },
    { id: 'divisor', name: 'Divisor', color: '#89ffee', hp: 50, speed: 42, r: 18, xp: 16, score: 32, coin: 7, behavior: 'splitter' },
    { id: 'explosivo', name: 'Explosivo', color: '#ff8b5d', hp: 26, speed: 65, r: 15, xp: 12, score: 26, coin: 5, behavior: 'explosive' },
    { id: 'niebla', name: 'Portador de niebla', color: '#e8fff8', hp: 62, speed: 34, r: 19, xp: 20, score: 42, coin: 8, behavior: 'mist' },
    { id: 'nucleo', name: 'Núcleo', color: '#ff82d4', hp: 115, speed: 38, r: 22, xp: 25, score: 55, coin: 10, behavior: 'core' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_run', icon: '▶', name: 'Primer despertar', desc: 'Inicia tu primera misión.', group: 'Supervivencia' },
    { id: 'wave_5', icon: '🌊', name: 'Cinco oleadas', desc: 'Alcanza la oleada 5.', group: 'Supervivencia' },
    { id: 'kills_100', icon: '🧟', name: 'Cien sombras', desc: 'Elimina 100 zombies en total.', group: 'Dominio' },
    { id: 'boss_1', icon: '👑', name: 'Primer jefe', desc: 'Derrota un jefe zombie.', group: 'Dominio' },
    { id: 'score_3000', icon: '⭐', name: 'Marca brillante', desc: 'Consigue 3000 puntos en una partida.', group: 'Dominio' },
    { id: 'fusion_1', icon: '✷', name: 'Alquimia táctica', desc: 'Descubre una fusión.', group: 'Exploración' },
    { id: 'map_3', icon: '🗺️', name: 'Tercer territorio', desc: 'Desbloquea el mapa 3.', group: 'Exploración' },
    { id: 'avatar_3', icon: '🧬', name: 'Tres formas', desc: 'Desbloquea tres avatares.', group: 'Colección' },
    { id: 'rich_1000', icon: '🪙', name: 'Fragmentos vivos', desc: 'Acumula 1000 fragmentos.', group: 'Economía' },
    { id: 'daily_like', icon: '☀', name: 'Otra vez', desc: 'Juega 3 partidas con el mismo perfil.', group: 'Retorno' }
  ];

  const DEFAULT_STATE = () => ({
    version: VERSION,
    activeProfileId: 'p_' + Date.now(),
    settings: { sound: true, music: true, shake: true, reducedMotion: false, lowPerformance: false },
    profiles: [{
      id: 'p_' + Date.now(),
      name: 'Jugador',
      avatar: 'explorador',
      unlockedAvatars: ['explorador', 'centinela', 'eco'],
      unlockedMap: 1,
      completedMaps: [],
      coins: 0,
      upgrades: {},
      achievements: {},
      collection: { powers: {}, fusions: {}, bosses: {} },
      stats: { bestScore: 0, runs: 0, totalKills: 0, bosses: 0, highestWave: 1, bestMap: 1, totalCoins: 0 },
      avatarTier: 1,
      shipParts: { core: 0, wings: 0, cannon: 0, engine: 0 },
      ranking: [],
      lastSave: null
    }]
  });

  let state = loadState();
  if (!state.profiles.find(p => p.id === state.activeProfileId)) state.activeProfileId = state.profiles[0].id;
  let currentProfile = () => state.profiles.find(p => p.id === state.activeProfileId) || state.profiles[0];

  const els = {};
  const bindEls = () => {
    document.querySelectorAll('[id]').forEach(el => els[el.id] = el);
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STATE();
      const parsed = JSON.parse(raw);
      return migrateState(parsed);
    } catch (e) {
      console.warn('Estado local corrupto. Se crea uno nuevo.', e);
      return DEFAULT_STATE();
    }
  }

  function migrateState(s) {
    const d = DEFAULT_STATE();
    s.version = VERSION;
    s.settings = { ...d.settings, ...(s.settings || {}) };
    s.profiles = Array.isArray(s.profiles) && s.profiles.length ? s.profiles : d.profiles;
    s.profiles.forEach(p => {
      p.unlockedAvatars = p.unlockedAvatars || ['explorador', 'centinela', 'eco'];
      p.unlockedMap = p.unlockedMap || 1;
      p.completedMaps = p.completedMaps || [];
      p.coins = p.coins || 0;
      p.upgrades = p.upgrades || {};
      p.achievements = p.achievements || {};
      p.collection = p.collection || { powers: {}, fusions: {}, bosses: {} };
      p.collection.powers = p.collection.powers || {};
      p.collection.fusions = p.collection.fusions || {};
      p.collection.bosses = p.collection.bosses || {};
      p.stats = { bestScore: 0, runs: 0, totalKills: 0, bosses: 0, highestWave: 1, bestMap: 1, totalCoins: 0, ...(p.stats || {}) };
      p.avatarTier = p.avatarTier || 1;
      p.shipParts = { core: 0, wings: 0, cannon: 0, engine: 0, ...(p.shipParts || {}) };
      p.hangarFocus = p.hangarFocus || 'engine';
      p.ranking = p.ranking || [];
      p.lastSave = p.lastSave || null;
    });
    return s;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const AudioFX = {
    ctx: null,
    musicNode: null,
    musicPad: null,
    musicGain: null,
    padGain: null,
    ensure() {
      if (!state.settings.sound && !state.settings.music) return null;
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(freq = 440, dur = .12, type = 'sine', gain = .04, slide = 0) {
      if (!state.settings.sound) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + .01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + .03);
    },
    chord(notes, dur = .18, gap = .05) {
      notes.forEach((n, i) => setTimeout(() => this.tone(n, dur, 'triangle', .045), i * gap * 1000));
    },
    startMelody() {
      if (!state.settings.sound) return;
      this.chord([196, 246.94, 329.63, 392, 493.88, 659.25], .32, .36);
    },
    shoot() { this.tone(720 + rand(80, -80), .05, 'square', .018, -140); },
    hit() { this.tone(180 + rand(80, -40), .06, 'sawtooth', .025, -60); },
    death() { this.tone(92 + rand(30, -20), .16, 'triangle', .035, -40); },
    pickup() { this.tone(900 + rand(150, -100), .07, 'sine', .03, 120); },
    level() { this.chord([523.25, 659.25, 783.99], .16, .08); },
    boss() { this.chord([110, 146.83, 185, 220], .26, .12); },
    win() { this.chord([392, 493.88, 587.33, 783.99], .28, .09); },
    lose() { this.chord([220, 164.81, 130.81], .28, .11); },
    music(mapIndex = 0, boss = false, family = 'zombie', phase = 1) {
      if (!state.settings.music) return;
      const ctx = this.ensure();
      if (!ctx) return;
      this.stopMusic();
      const palettes = {
        zombie: { base: 74, pad: 147, waveA: 'sawtooth', waveB: 'triangle', gain: .021, padGain: .0065 },
        bacteria: { base: 88, pad: 176, waveA: 'triangle', waveB: 'sine', gain: .017, padGain: .007 },
        demon: { base: 66, pad: 132, waveA: 'square', waveB: 'sawtooth', gain: .024, padGain: .006 },
        witch: { base: 82, pad: 164, waveA: 'triangle', waveB: 'triangle', gain: .018, padGain: .008 },
        spirit: { base: 78, pad: 196, waveA: 'sine', waveB: 'triangle', gain: .015, padGain: .009 },
        disease: { base: 72, pad: 144, waveA: 'sawtooth', waveB: 'square', gain: .02, padGain: .006 },
        mythic: { base: 84, pad: 168, waveA: 'triangle', waveB: 'sawtooth', gain: .022, padGain: .008 }
      };
      const pal = palettes[family] || palettes.zombie;
      const main = ctx.createOscillator();
      const pad = ctx.createOscillator();
      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      main.type = boss ? pal.waveA : 'triangle';
      pad.type = boss ? pal.waveB : 'sine';
      main.frequency.value = pal.base + mapIndex * 1.6;
      pad.frequency.value = pal.pad + mapIndex * 2.2;
      g1.gain.value = boss ? pal.gain : .011;
      g2.gain.value = boss ? pal.padGain : .0045;
      main.connect(g1).connect(ctx.destination);
      pad.connect(g2).connect(ctx.destination);
      main.start(); pad.start();
      this.musicNode = main;
      this.musicPad = pad;
      this.musicGain = g1;
      this.padGain = g2;
      this.setBossPhase(family, phase, boss);
    },
    setBossPhase(family = 'zombie', phase = 1, boss = true) {
      if (!this.ctx || !this.musicNode || !this.musicPad) return;
      const ctx = this.ctx;
      const families = {
        zombie: [74, 86, 96], bacteria: [88, 102, 116], demon: [66, 78, 92],
        witch: [82, 95, 110], spirit: [78, 90, 104], disease: [72, 84, 98], mythic: [84, 98, 118]
      };
      const scale = families[family] || families.zombie;
      const idx = Math.max(0, Math.min(2, phase - 1));
      const mainFreq = scale[idx];
      const padFreq = mainFreq * (family === 'spirit' ? 2.5 : family === 'witch' ? 2.2 : 2);
      this.musicNode.frequency.exponentialRampToValueAtTime(mainFreq, ctx.currentTime + .35);
      this.musicPad.frequency.exponentialRampToValueAtTime(padFreq, ctx.currentTime + .35);
      if (this.musicGain) this.musicGain.gain.exponentialRampToValueAtTime(boss ? (.016 + idx * .004) : .011, ctx.currentTime + .25);
      if (this.padGain) this.padGain.gain.exponentialRampToValueAtTime(boss ? (.006 + idx * .0018) : .0045, ctx.currentTime + .25);
    },
    stopMusic() {
      try {
        if (this.musicGain && this.ctx) this.musicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + .15);
        if (this.padGain && this.ctx) this.padGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + .15);
        if (this.musicNode && this.ctx) this.musicNode.stop(this.ctx.currentTime + .18);
        if (this.musicPad && this.ctx) this.musicPad.stop(this.ctx.currentTime + .18);
      } catch (_) {}
      this.musicNode = null;
      this.musicPad = null;
      this.musicGain = null;
      this.padGain = null;
    }
  };

  class Game {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.w = 1280;
      this.h = 720;
      this.running = false;
      this.paused = false;
      this.cardPause = false;
      this.pendingLevelChoices = 0;
      this.offerActive = false;
      this.currentOfferChoices = [];
      this.offerAutoAt = 0;
      this.last = 0;
      this.pointer = { x: 640, y: 360, active: false };
      this.keys = {};
      this.shake = 0;
      this.flash = 0;
      this.mapIndex = 0;
      this.wave = 1;
      this.waveTime = 0;
      this.spawnTime = 0;
      this.bossActive = null;
      this.bossIntroduced = false;
      this.bossFight = { active: false, charge: 0, minionTimer: 0, phaseNotified: 1, addsKilled: 0 };
      this.player = null;
      this.enemies = [];
      this.bullets = [];
      this.particles = [];
      this.pickups = [];
      this.drones = [];
      this.zones = [];
      this.meteors = [];
      this.worldOneState = { meteorTimer: 2.6, insectTimer: 1.1, mirrorCount: 0, rainTimer: 7.5, burstTimer: 1.6 };
      this.meteors = [];
      this.worldOneState = { meteorTimer: 2.6, insectTimer: 1.1, mirrorCount: 0, rainTimer: 7.5, burstTimer: 1.6 };
      this.toasts = [];
      this.powerLevels = {};
      this.powerActivity = {};
      this.fusions = {};
      this.run = { score: 0, coins: 0, kills: 0, bosses: 0, start: Date.now(), mapComplete: false };
      this.extraLives = 0;
      this.nextLifeScore = 2500;
      this.resultMode = 'victory';
      this.outcomeFinalized = false;
      this.selectedMapFromScreen = 0;
    }

    init(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      updateViewportVars();
      this.resize();
      window.addEventListener('resize', () => { updateViewportVars(); this.resize(); });
      window.visualViewport?.addEventListener('resize', () => { updateViewportVars(); this.resize(); });
      window.addEventListener('orientationchange', () => setTimeout(() => { updateViewportVars(); this.resize(); }, 260));
      window.addEventListener('keydown', e => { this.keys[e.key.toLowerCase()] = true; if (e.key === 'Escape') this.togglePause(); });
      window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
      const pointerHandler = e => {
        const p = e.touches ? e.touches[0] : e;
        if (!p || !this.canvas) return;
        if (this.running && e.cancelable) e.preventDefault?.();
        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const isTouch = !!e.touches || e.pointerType === 'touch';
        this.pointer.x = (p.clientX - rect.left) * (this.w / rect.width);
        // En táctil la nave queda ligeramente encima del dedo para no taparla.
        const touchOffset = isTouch ? Math.min(72, Math.max(42, rect.height * .08)) : 0;
        this.pointer.y = (p.clientY - rect.top - touchOffset) * (this.h / rect.height);
        this.pointer.x = clamp(this.pointer.x, 18, this.w - 18);
        this.pointer.y = clamp(this.pointer.y, 18, this.h - 18);
        this.pointer.active = true;
        this.pointer.touch = isTouch;
      };
      const stopPointer = e => {
        if (this.running && e?.cancelable) e.preventDefault?.();
        if (e?.pointerId != null) this.canvas.releasePointerCapture?.(e.pointerId);
        this.pointer.touch = false;
      };
      this.canvas.addEventListener('pointerdown', e => { pointerHandler(e); this.canvas.setPointerCapture?.(e.pointerId); }, { passive: false });
      this.canvas.addEventListener('pointermove', pointerHandler, { passive: false });
      this.canvas.addEventListener('pointerup', stopPointer, { passive: false });
      this.canvas.addEventListener('pointercancel', stopPointer, { passive: false });
      this.canvas.addEventListener('mousemove', pointerHandler, { passive: true });
      this.canvas.addEventListener('mousedown', pointerHandler, { passive: false });
      this.canvas.addEventListener('contextmenu', e => e.preventDefault());
      this.canvas.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); pointerHandler(e); }, { passive: false });
      this.canvas.addEventListener('touchmove', e => { if (e.cancelable) e.preventDefault(); pointerHandler(e); }, { passive: false });
      els.screenGame?.addEventListener('touchmove', e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    }

    resize() {
      if (!this.canvas) return;
      updateViewportVars();
      const vv = window.visualViewport;
      const viewW = Math.max(320, vv?.width || window.innerWidth || 360);
      const viewH = Math.max(320, vv?.height || window.innerHeight || 640);
      const isSmall = Math.min(viewW, viewH) <= 900;
      const dpr = state.settings.lowPerformance ? 1 : Math.min(isSmall ? 1.25 : 1.75, window.devicePixelRatio || 1);
      const rect = this.canvas.getBoundingClientRect();
      const cssW = Math.max(1, rect.width || viewW);
      const cssH = Math.max(1, rect.height || viewH);
      const minW = isSmall ? 300 : 640;
      const minH = isSmall ? 300 : 360;
      const nextW = Math.max(minW, Math.floor(cssW * dpr));
      const nextH = Math.max(minH, Math.floor(cssH * dpr));
      if (this.canvas.width !== nextW || this.canvas.height !== nextH) {
        this.canvas.width = nextW;
        this.canvas.height = nextH;
      }
      this.w = this.canvas.width;
      this.h = this.canvas.height;
      if (this.player) {
        this.player.x = clamp(this.player.x, this.player.r + 8, this.w - this.player.r - 8);
        this.player.y = clamp(this.player.y, this.player.r + 8, this.h - this.player.r - 8);
      }
      if (this.ctx) this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.applyPerformanceMode?.();
      this.updateOrientationHint?.();
    }

    applyPerformanceMode() {
      const low = !!state.settings.lowPerformance;
      this.maxParticles = low ? 70 : (this.isSmallScreen ? 110 : 170);
      this.maxPickups = low ? 30 : (this.isSmallScreen ? 46 : 64);
      this.maxMeteors = low ? 3 : (this.isSmallScreen ? 4 : 7);
      this.maxBullets = low ? 110 : (this.isSmallScreen ? 160 : 230);
      document.body.classList.toggle('low-performance', low);
    }

    updateOrientationHint() {
      if (!els.orientationHint) return;
      const small = Math.min(window.innerWidth || 0, window.innerHeight || 0) < 780;
      const portrait = (window.innerHeight || 0) > (window.innerWidth || 0);
      const show = this.running && small && portrait;
      els.orientationHint.classList.toggle('hidden', !show);
      if (show) {
        clearTimeout(this.orientationHintTimer);
        this.orientationHintTimer = setTimeout(() => els.orientationHint?.classList.add('hidden'), 4600);
      }
    }

    start(mapIndex = 0, save = null) {
      AudioFX.ensure();
      AudioFX.startMelody();
      const p = currentProfile();
      p.stats.runs += 1;
      unlockAchievement('first_run');
      this.mapIndex = save?.mapIndex ?? clamp(mapIndex, 0, MAPS.length - 1);
      this.wave = save?.wave ?? 1;
      this.waveTime = 0;
      this.spawnTime = 0;
      this.bossActive = null;
      this.bossIntroduced = false;
      this.bossFight = { active: false, charge: 0, minionTimer: 0, phaseNotified: 1, addsKilled: 0 };
      this.enemies = [];
      this.bullets = [];
      this.particles = [];
      this.pickups = [];
      this.drones = [];
      this.zones = [];
      this.meteors = [];
      this.worldOneState = { meteorTimer: 2.6, insectTimer: 1.1, mirrorCount: 0, rainTimer: 7.5, burstTimer: 1.6 };
      this.meteors = [];
      this.worldOneState = { meteorTimer: 2.6, insectTimer: 1.1, mirrorCount: 0, rainTimer: 7.5, burstTimer: 1.6 };
      this.powerLevels = save?.powerLevels || {};
      this.powerActivity = {};
      this.fusions = save?.fusions || {};
      this.run = save?.run || { score: 0, coins: 0, kills: 0, bosses: 0, start: Date.now(), mapComplete: false };
      this.extraLives = save?.extraLives || 0;
      this.nextLifeScore = save?.nextLifeScore || 2500;
      this.outcomeFinalized = false;
      this.createPlayer(save?.player);
      this.applyPerformanceMode();
      this.updateOrientationHint();
      if (this.player.avatar.mod.drone && !this.drones.length) this.spawnDrone(9999, true);
      if (!save && this.mapIndex === 0) this.setupWorldOneIntro();
      this.running = true;
      this.paused = false;
      this.cardPause = false;
      this.last = now();
      showScreen('screenGame');
      AudioFX.music(this.mapIndex, false, MAPS[this.mapIndex]?.family || 'zombie', 1);
      hideOverlays();
      if (els.bossIntroOverlay) { els.bossIntroOverlay.classList.add('hidden'); els.bossIntroOverlay.dataset.family = ''; }
      this.updatePendingBadge();
      this.toast(MAPS[this.mapIndex].name, MAPS[this.mapIndex].lore);
      requestAnimationFrame(t => this.loop(t));
      saveState();
    }

    createPlayer(saved) {
      const p = currentProfile();
      const avatar = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
      const player = {
        x: saved?.x ?? this.w / 2,
        y: saved?.y ?? this.h / 2,
        r: 20.5,
        maxHp: 100,
        hp: saved?.hp ?? 100,
        maxShield: 70,
        shield: saved?.shield ?? 70,
        speed: 240,
        damage: 18,
        fireDelay: 360,
        fireTimer: 0,
        xp: saved?.xp ?? 0,
        level: saved?.level ?? 1,
        xpNext: saved?.xpNext ?? 90,
        magnet: 92,
        crit: .05,
        regen: 0,
        phaseTimer: 0,
        pulseTimer: 0,
        opemTimer: 2.8,
        nukeTimer: 18,
        sparkTimer: 0,
        sparkTick: 0,
        torpedoTimer: 1.6,
        kamiTimer: 2.5,
        bossDrive: 0,
        cloak: 0,
        avatar,
        shipParts: { core: 0, wings: 0, cannon: 0, engine: 0, ...(p.shipParts || {}) }
      };
      SHOP.forEach(item => {
        const lvl = p.upgrades[item.id] || 0;
        for (let i = 0; i < lvl; i++) item.apply(player);
      });
      player.maxHp *= avatar.mod.hp || 1;
      player.maxShield *= avatar.mod.shield || 1;
      player.speed *= avatar.mod.speed || 1;
      player.damage *= avatar.mod.dmg || 1;
      player.regen += avatar.mod.regen || 0;
      const avatarTier = p.avatarTier || 1;
      player.morphTier = avatarTier;
      player.r += Math.min((avatarTier - 1) * .42, 2.2);
      player.maxHp *= 1 + (avatarTier - 1) * .03;
      player.maxShield *= 1 + (avatarTier - 1) * .025;
      player.speed *= 1 + (avatarTier - 1) * .01;
      player.damage *= 1 + (avatarTier - 1) * .035;
      const parts = player.shipParts;
      player.maxHp += parts.core * 8;
      player.maxShield += parts.core * 6;
      player.speed += parts.engine * 10 + parts.wings * 6;
      player.damage += parts.cannon * 2.5;
      player.fireDelay = Math.max(180, player.fireDelay - parts.cannon * 12);
      player.magnet += parts.engine * 6;
      player.crit += parts.cannon * 0.008;
      player.regen += parts.core * 0.04;
      player.hp = clamp(player.hp, 1, player.maxHp);
      player.shield = clamp(player.shield, 0, player.maxShield);
      this.player = player;
      this.pointer.x = player.x;
      this.pointer.y = player.y;
    }

    loop(t) {
      if (!this.running) return;
      const dt = Math.min(0.035, (t - this.last) / 1000 || 0.016);
      this.last = t;
      if (!this.paused) this.update(dt);
      this.render(dt);
      requestAnimationFrame(tt => this.loop(tt));
    }

    update(dt) {
      const p = this.player;
      this.waveTime += dt;
      p.fireTimer -= dt * 1000;
      p.pulseTimer -= dt;
      p.phaseTimer -= dt;
      p.bossDrive = Math.max(0, (p.bossDrive || 0) - dt);
      p.cloak = Math.max(0, (p.cloak || 0) - dt);
      this.shake = Math.max(0, this.shake - dt * 30);
      this.flash = Math.max(0, this.flash - dt * 2);
      this.updatePowerActivity(dt);

      const regen = p.regen * dt;
      if (regen > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + regen);
      p.shield = Math.min(p.maxShield, p.shield + dt * (3 + (this.powerLevels.ring || 0) * 2));

      this.handleMovement(dt);
      if (this.bossFight?.cinematic > 0) {
        this.bossFight.cinematic -= dt;
        this.updateHud();
        return;
      }
      this.handleShooting(dt);
      this.handlePowers(dt);
      this.updateBossFight(dt);
      this.spawnLogic(dt);
      this.updateMeteors(dt);
      this.updateEnemies(dt);
      this.updateBullets(dt);
      this.updatePickups(dt);
      this.updateDrones(dt);
      this.updateZones(dt);
      this.updateParticles(dt);
      this.updateOfferState(dt);
      this.checkWave();
      this.updateHud();

      if (p.hp <= 0) this.end(false);
    }

    markPowerActive(id, seconds) {
      if (!id) return;
      const next = seconds || POWER_ACTIVE_SECONDS[id] || 6;
      this.powerActivity[id] = Math.max(this.powerActivity[id] || 0, next);
    }

    updatePowerActivity(dt) {
      if (!this.powerActivity) this.powerActivity = {};
      Object.keys(this.powerActivity).forEach(id => {
        this.powerActivity[id] = Math.max(0, this.powerActivity[id] - dt);
        if (this.powerActivity[id] <= 0.04) delete this.powerActivity[id];
      });
    }

    updateOfferState(dt) {
      if (!this.offerActive) return;
      this.offerAutoAt -= dt;
      if (this.offerAutoAt <= 0 && this.currentOfferChoices?.length) {
        const best = this.selectRecommendedPower(this.currentOfferChoices);
        if (best) this.applyPower(best.id, true);
      }
    }

    selectRecommendedPower(choices = []) {
      const p = this.player;
      const hpRatio = p.maxHp ? p.hp / p.maxHp : 1;
      const shieldRatio = p.maxShield ? p.shield / p.maxShield : 1;
      const crowded = this.enemies.length;
      const weaponCount = ['triple','laser','pierce','fire','bounce','spark','torpedo'].reduce((n,id)=>n+((this.powerLevels[id]||0)>0?1:0),0);
      const defenseCount = ['ring','orbs','ice','opem','virus'].reduce((n,id)=>n+((this.powerLevels[id]||0)>0?1:0),0);
      const scored = choices.map(card => {
        let score = 10 - (this.powerLevels[card.id] || 0) * 2;
        if (card.id === 'ring' && (hpRatio < .62 || shieldRatio < .45)) score += 18;
        if (card.id === 'ice' && crowded > 8) score += 16;
        if (card.id === 'opem' && crowded > 10) score += 17;
        if (card.id === 'pulse' && crowded > 10) score += 18;
        if (card.id === 'nuke' && crowded > 12) score += 22;
        if (card.id === 'drone' && weaponCount < 2) score += 12;
        if (card.id === 'torpedo' && weaponCount < 2) score += 14;
        if (card.id === 'spark' && weaponCount < 2) score += 13;
        if (card.id === 'triple' && weaponCount === 0) score += 20;
        if (card.id === 'pierce' && weaponCount === 0) score += 14;
        if (card.id === 'orbs' && defenseCount === 0) score += 12;
        if (card.rarity === 'legendary') score += 6;
        if (card.rarity === 'epic') score += 3;
        return { card, score };
      }).sort((a,b)=>b.score-a.score);
      return scored[0]?.card || choices[0] || null;
    }


    showBossIntro(map, boss) {
      if (!els.bossIntroOverlay) return;
      els.bossIntroFamily.textContent = BEAST_LABELS[boss.beast] || 'jefe';
      els.bossIntroIcon.textContent = BEAST_ICONS[boss.beast] || map.icon || '👹';
      els.bossIntroName.textContent = boss.name;
      els.bossIntroText.textContent = boss.specialName || '';
      els.bossIntroOverlay.classList.add('micro-intro');
      els.bossIntroOverlay.dataset.family = map.family || '';
      els.bossIntroOverlay.classList.remove('hidden');
      clearTimeout(this.bossIntroTimeout);
      this.bossIntroTimeout = setTimeout(() => { if (els.bossIntroOverlay) { els.bossIntroOverlay.classList.add('hidden'); els.bossIntroOverlay.classList.remove('micro-intro'); els.bossIntroOverlay.dataset.family = ''; } }, 1250);
    }


    updateBossUi() {
      const b = this.bossActive;
      if (!b || !els.bossHpFill) return;
      els.bossHpFill.style.width = `${clamp(b.hp / b.baseHp * 100, 0, 100)}%`;
      if (els.bossShieldFill) els.bossShieldFill.style.width = `${clamp((b.shield || 0) / (b.shieldMax || 1) * 100, 0, 100)}%`;
      if (els.bossPhaseLabel) els.bossPhaseLabel.textContent = `Fase ${b.phase}`;
      if (els.bossShieldLabel) els.bossShieldLabel.textContent = `Escudo ${Math.max(0, Math.round(b.shield || 0))}`;
      if (els.bossAddsLabel) els.bossAddsLabel.textContent = `Séquito ${this.enemies.filter(e => !e.boss).length}`;
      if (els.bossVulnLabel) els.bossVulnLabel.textContent = b.vulnerable > 0 ? `Vulnerable ${b.vulnerable.toFixed(1)}s` : (b.shield > 0 ? 'Blindado' : 'Abierto');
      els.bossBar?.classList.toggle('vulnerable', b.vulnerable > 0);
    }

    updateBossFight(dt) {
      if (!this.bossFight?.active || !this.bossActive) return;
      const p = this.player;
      const f = this.bossFight;
      const b = this.bossActive;
      f.minionTimer -= dt;
      if (f.minionTimer <= 0) {
        const nonBoss = this.enemies.filter(e => !e.boss).length;
        if (nonBoss < 5 + b.phase * 2) {
          const count = this.mapIndex === 0 ? Math.min(2, 1 + Math.floor(b.phase / 2)) : Math.min(3, 1 + Math.floor((b.phase + 1) / 2));
          for (let i = 0; i < count; i++) this.spawnEnemy(pick(b.summons || ['corredor','sombra']), true);
        }
        f.minionTimer = Math.max(2.8, 5.1 - b.phase * .42 - this.mapIndex * .06);
      }
      f.escortTimer = (f.escortTimer || 0) - dt;
      if (f.escortTimer <= 0) {
        const escorts = this.enemies.filter(e => e.behavior === 'mirror').length;
        if (escorts < (this.mapIndex === 0 ? 1 : 1 + Math.floor((b.phase + 1) / 2))) this.spawnEnemy('nave_espejo', true);
        f.escortTimer = Math.max(4.2, 6.7 - b.phase * .62 - this.mapIndex * .09);
      }
      f.hazardTimer = (f.hazardTimer || 0) - dt;
      if (f.hazardTimer <= 0) {
        const p = this.player;
        if (b.family === 'demon' || b.family === 'mythic') {
          this.spawnMeteorRain(this.mapIndex === 0 ? 2 : 3, true);
        } else if (b.family === 'spirit' || b.family === 'witch') {
          for (let i = 0; i < 2; i++) this.zones.push({ x: p.x + rand(110,-110), y: p.y + rand(90,-90), r: 20 + b.phase * 2, life: 2.4, max: 2.4, type: 'root' });
        } else {
          for (let i = 0; i < 1 + Math.min(2, b.phase); i++) this.spawnEnemy(pick(b.summons || ['corredor','sombra']), true);
        }
        f.hazardTimer = Math.max(4.0, 6.2 - b.phase * .5 - this.mapIndex * .05);
      }
      if (b.phase > (f.phaseNotified || 1)) {
        f.phaseNotified = b.phase;
        b.shieldMax += 18;
        b.shield = Math.min(b.shieldMax, b.shield + b.shieldMax * .38);
        this.grantBossAid(`Fase ${b.phase}`);
        AudioFX.setBossPhase(b.family, b.phase, true);
      }
      if (f.charge >= 100) {
        f.charge = 0;
        this.activateBossDrive(6.2 + b.phase * .8);
      }
      f.supportTimer = (f.supportTimer || 0) - dt;
      if (f.supportTimer <= 0) {
        this.callWingAssist(b.vulnerable > 0 || b.phase >= 3);
        f.supportTimer = Math.max(2.6, 4.9 - b.phase * .4);
      }
      if (b.vulnerable > 0) {
        b.vulnerable = Math.max(0, b.vulnerable - dt);
        if (b.vulnerable <= 0) {
          b.shield = Math.max(b.shieldMax * .58, b.shield);
          this.toast('🧱', 'El jefe recompone su escudo');
        }
      } else if (b.shield <= 0) {
        b.vulnerable = Math.max(2.8, 4.5 - b.phase * .24);
        this.toast('💥', 'Ventana vulnerable');
      }
      if (p.bossDrive > 0) {
        p.shield = Math.min(p.maxShield, p.shield + dt * 5.2);
        if (Math.random() < .12) this.emit(p.x, p.y, '#ffd56a', 1, 22, .35);
      }
      this.updateBossUi();
    }

    activateBossDrive(duration = 6) {
      const p = this.player;
      p.bossDrive = Math.max(p.bossDrive || 0, duration);
      p.sparkTimer = Math.min(10, (p.sparkTimer || 0) + 2.2);
      p.sparkTick = 0;
      p.shield = Math.min(p.maxShield, p.shield + p.maxShield * .18);
      this.toast('⚡', 'Sobrecarga anti-jefe');
      AudioFX.chord([392,523.25,659.25], .16, .06);
    }

    grantBossAid(trigger = '') {
      const p = this.player;
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .05);
      p.shield = Math.min(p.maxShield, p.shield + p.maxShield * .18);
      if ((this.powerLevels.torpedo || 0) === 0) this.powerLevels.torpedo = 1;
      if ((this.powerLevels.drone || 0) === 0) this.powerLevels.drone = 1;
      this.spawnDrone(8 + (this.bossActive?.phase || 1) * 2);
      p.sparkTimer = Math.min(12, (p.sparkTimer || 0) + 4.5);
      p.sparkTick = 0;
      this.toast('🛡️', trigger ? `${trigger} · apoyo táctico` : 'Apoyo táctico');
      this.updateHud();
    }


    callWingAssist(powerShot = false) {
      const target = this.bossActive || this.nearestEnemy();
      if (!target) return;
      const p = this.player;
      const origins = [
        { x: clamp(p.x - 160, 36, this.w - 36), y: clamp(p.y + 18, 36, this.h - 36) },
        { x: clamp(p.x + 160, 36, this.w - 36), y: clamp(p.y + 18, 36, this.h - 36) },
        { x: clamp(p.x, 36, this.w - 36), y: clamp(p.y - 190, 36, this.h - 36) }
      ];
      const total = powerShot ? 3 : 2;
      for (let i = 0; i < total; i++) {
        const o = origins[i];
        const a = Math.atan2(target.y - o.y, target.x - o.x);
        this.addBullet(o.x, o.y, a, powerShot ? 760 : 690, this.player.damage * (powerShot ? 1.5 : 1.08), {
          color: powerShot ? '#ffd56a' : '#7df8ff', pierce: powerShot ? 3 : 2, homing: powerShot
        });
      }
      if (powerShot) this.spawnDrone(7, false, { support: true, radius: 132, fireRate: .22, damageScale: 1.08, color: '#ffd56a' });
      this.toast(powerShot ? '🚀' : '🤖', powerShot ? 'Bombardeo aliado' : 'Ala táctica');
    }

    fireBossSpread(b, count = 5, spread = .55, speed = 180, damage = 10, color = null, originX = null, originY = null) {
      const p = this.player;
      const ox = originX == null ? b.x : originX;
      const oy = originY == null ? b.y : originY;
      const base = Math.atan2(p.y - oy, p.x - ox);
      for (let i = 0; i < count; i++) {
        const offset = count === 1 ? 0 : ((i / (count - 1)) - .5) * spread;
        this.addEnemyBullet(ox, oy, base + offset, speed, damage, color || b.color);
      }
    }

    bossVariantSignature(b, map, stage = 'pattern') {
      const v = b.variant || 1;
      const p = this.player;
      if (v === 1) {
        if (stage === 'pattern') this.fireBossSpread(b, 3 + b.phase, .42, 190 + b.phase * 16, 10 + b.phase * 2, map.theme[2]);
        else this.fireBossSpread(b, 5 + b.phase, .72, 210 + b.phase * 18, 12 + b.phase * 3, '#ffe29a');
      } else if (v === 2) {
        if (stage === 'pattern') {
          const rows = 2 + Math.min(2, b.phase);
          for (let i = 0; i < rows; i++) {
            const y = clamp(p.y - 120 + i * 70, 54, this.h - 54);
            this.fireBossSpread(b, 1, 0, 220, 9 + b.phase * 2, map.theme[2], 30, y);
            this.fireBossSpread(b, 1, 0, 220, 9 + b.phase * 2, map.theme[2], this.w - 30, y);
          }
        } else {
          for (let i = 0; i < 2; i++) this.spawnEnemy(pick(b.summons), true);
          this.zones.push({ x: p.x, y: p.y, r: 32, life: 2.6, max: 2.6, type: 'root' });
        }
      } else if (v === 3) {
        const shots = stage === 'pattern' ? 8 + b.phase : 12 + b.phase * 2;
        for (let i = 0; i < shots; i++) {
          const a = (Math.PI * 2 / shots) * i + b.t * (stage === 'pattern' ? .7 : 1.2);
          this.addEnemyBullet(b.x, b.y, a, (stage === 'pattern' ? 165 : 195) + b.phase * 12, 9 + b.phase * 3, stage === 'pattern' ? map.theme[2] : '#9fd4ff');
        }
      } else if (v === 4) {
        if (stage === 'pattern') {
          const spots = 3 + b.phase;
          for (let i = 0; i < spots; i++) {
            const a = (Math.PI * 2 / spots) * i;
            this.zones.push({ x: p.x + Math.cos(a) * 84, y: p.y + Math.sin(a) * 84, r: 16 + b.phase, life: 2.2, max: 2.2, type: 'root' });
          }
        } else {
          this.fireBossSpread(b, 7, .9, 205 + b.phase * 10, 12 + b.phase * 2, '#ffb7e6');
          this.callWingAssist(false);
        }
      } else if (v === 5) {
        if (stage === 'pattern') {
          for (let i = 0; i < 3; i++) this.explode(p.x + rand(72, -72), p.y + rand(72, -72), 62, 10 + b.phase * 2);
        } else {
          b.mode = 'fade';
          b.modeTimer = 1.35;
          b.fadeTimer = 1.0;
          b.teleported = false;
          this.fireBossSpread(b, 6 + b.phase, 1.0, 225 + b.phase * 14, 12 + b.phase * 3, '#ffd56a');
        }
      }
    }

    updateBossMotion(b, dt) {
      const p = this.player;
      if (!b.mode) {
        b.mode = 'orbit';
        b.modeTimer = 2.8;
        b.alpha = 1;
        b.orbitAngle = Math.random() * Math.PI * 2;
        b.targetX = b.x;
        b.targetY = b.y;
        b.fadeTimer = 0;
      }
      b.modeTimer -= dt;
      if (b.modeTimer <= 0) {
        const modes = ['orbit', 'arc', 'strafe', 'fade'];
        b.mode = pick(modes);
        b.modeTimer = b.mode === 'fade' ? 2.1 : rand(4.1, 2.6);
        if (b.mode === 'fade') {
          b.fadeTimer = 1.0;
          b.teleported = false;
        } else {
          b.targetX = clamp(p.x + rand(240, -240), 84, this.w - 84);
          b.targetY = clamp(p.y + rand(-180, -40), 64, this.h * .42);
        }
      }
      if (b.mode === 'orbit') {
        b.orbitAngle += dt * (1.1 + b.phase * .18);
        const rad = 120 + b.phase * 16;
        b.targetX = clamp(p.x + Math.cos(b.orbitAngle) * rad, 90, this.w - 90);
        b.targetY = clamp(p.y - 115 + Math.sin(b.orbitAngle * 1.2) * (52 + b.phase * 8), 68, this.h * .42);
      } else if (b.mode === 'arc') {
        b.arcT = (b.arcT || 0) + dt * (1 + b.phase * .14);
        b.targetX = clamp(this.w * .5 + Math.sin(b.arcT * 1.3) * (this.w * .28), 84, this.w - 84);
        b.targetY = clamp(this.h * .18 + Math.cos(b.arcT * 1.9) * 40, 64, this.h * .38);
      } else if (b.mode === 'strafe') {
        const reached = Math.hypot((b.targetX || b.x) - b.x, (b.targetY || b.y) - b.y) < 24;
        if (reached) {
          b.targetX = clamp(p.x + rand(260, -260), 84, this.w - 84);
          b.targetY = clamp(p.y + rand(-160, -30), 66, this.h * .44);
        }
      } else if (b.mode === 'fade') {
        b.fadeTimer -= dt;
        if (!b.teleported && b.fadeTimer <= .48) {
          b.x = clamp(p.x + rand(280, -280), 86, this.w - 86);
          b.y = clamp(p.y + rand(-170, -35), 70, this.h * .44);
          b.targetX = b.x; b.targetY = b.y;
          b.teleported = true;
        }
      }
      if (b.mode === 'fade' && b.fadeTimer > 0) {
        if (!b.teleported) b.alpha = Math.max(.16, (b.alpha || 1) - dt * 2.8);
        else b.alpha = Math.min(.62, (b.alpha || .2) + dt * 1.8);
      } else {
        b.alpha = Math.min(1, (b.alpha || .7) + dt * 2.6);
      }
      b.x += ((b.targetX || b.x) - b.x) * Math.min(1, dt * (1.5 + b.phase * .15));
      b.y += ((b.targetY || b.y) - b.y) * Math.min(1, dt * (1.5 + b.phase * .15));
      b.x = clamp(b.x, 76, this.w - 76);
      b.y = clamp(b.y, 60, this.h * .46);
      return true;
    }

    handleMovement(dt) {
      const p = this.player;
      let dx = 0, dy = 0;
      if (this.keys.w || this.keys.arrowup) dy -= 1;
      if (this.keys.s || this.keys.arrowdown) dy += 1;
      if (this.keys.a || this.keys.arrowleft) dx -= 1;
      if (this.keys.d || this.keys.arrowright) dx += 1;
      const moveSpeed = p.speed * (p.bossDrive > 0 ? 1.22 : 1);
      if (dx || dy) {
        const l = Math.hypot(dx, dy) || 1;
        p.x += (dx / l) * moveSpeed * dt;
        p.y += (dy / l) * moveSpeed * dt;
        this.pointer.x = p.x;
        this.pointer.y = p.y;
      } else if (this.pointer.active) {
        const vx = this.pointer.x - p.x;
        const vy = this.pointer.y - p.y;
        const d = Math.hypot(vx, vy);
        if (d > 3) {
          const touchBoost = this.pointer.touch ? 1.7 : 1;
          const step = Math.min(d, moveSpeed * touchBoost * dt);
          p.x += (vx / d) * step;
          p.y += (vy / d) * step;
        }
      }
      p.x = clamp(p.x, 24, this.w - 24);
      p.y = clamp(p.y, 24, this.h - 24);
      if ((Math.abs(dx) + Math.abs(dy)) || this.pointer.active) {
        this.emit(p.x, p.y + 10, p.avatar.color, 1, 16, .25);
      }
    }

    nearestEnemy() {
      if (!this.enemies.length) return null;
      let best = null, bd = Infinity;
      for (const e of this.enemies) {
        const d = dist2(this.player, e);
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    }

    handleShooting() {
      const p = this.player;
      if (p.fireTimer > 0 || !this.enemies.length) return;
      const target = this.nearestEnemy();
      if (!target) return;
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const a = Math.atan2(dy, dx);
      const triple = this.powerLevels.triple || 0;
      const laser = this.powerLevels.laser || 0;
      const pierce = this.powerLevels.pierce || 0;
      const fire = this.powerLevels.fire || 0;
      const ice = this.powerLevels.ice || 0;
      const bounce = this.powerLevels.bounce || 0;
      const virus = this.powerLevels.virus || 0;
      const drive = p.bossDrive > 0 ? 1.42 : 1;
      const bossBonus = target.boss ? 1.22 : 1;
      const dmg = p.damage * (1 + triple * .05 + pierce * .04) * drive * bossBonus;
      const speed = 560 + pierce * 45;
      const shots = triple ? [-0.18, 0, 0.18] : [0];
      if (this.fusions.prisma) shots.push(-0.32, 0.32);
      if (this.fusions.lanza) shots.push(-0.08, 0.08);
      shots.forEach(off => this.addBullet(p.x, p.y, a + off, speed, dmg, { pierce: 1 + pierce + (this.fusions.lanza ? 2 : 0), fire, ice, bounce, virus, color: p.avatar.color }));
      if (laser || this.fusions.prisma) this.fireLaser(a, dmg * (.42 + laser * .16), this.fusions.prisma ? 3 : 1);
      p.fireTimer = Math.max(60, (p.fireDelay - triple * 12 - laser * 8) * (p.bossDrive > 0 ? .72 : 1));
      AudioFX.shoot();
    }

    addBullet(x, y, angle, speed, damage, meta = {}) {
      const crit = Math.random() < this.player.crit;
      this.bullets.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: meta.big ? 8 : 5,
        damage: damage * (crit ? 1.9 : 1),
        life: 1.6,
        pierce: meta.pierce || 1,
        fire: meta.fire || 0,
        ice: meta.ice || 0,
        bounce: meta.bounce || 0,
        virus: meta.virus || 0,
        homing: !!meta.homing,
        type: meta.type || 'bullet',
        color: crit ? '#ffd56a' : (meta.color || '#61ffc8')
      });
    }

    fireLaser(angle, damage, count = 1) {
      const p = this.player;
      const angles = count === 3 ? [angle - .16, angle, angle + .16] : [angle];
      angles.forEach(a => {
        const cos = Math.cos(a), sin = Math.sin(a);
        let hit = 0;
        for (const e of this.enemies) {
          const px = e.x - p.x;
          const py = e.y - p.y;
          const proj = px * cos + py * sin;
          if (proj < 0 || proj > 560) continue;
          const perp = Math.abs(px * sin - py * cos);
          if (perp < e.r + 10) {
            this.damageEnemy(e, damage, { laser: true });
            hit++;
            if (hit > 5) break;
          }
        }
        this.particles.push({ type: 'laser', x: p.x, y: p.y, a, life: .12, max: .12, color: count === 3 ? '#b58cff' : '#83eaff' });
      });
    }

    handlePowers(dt) {
      const p = this.player;
      const orbs = this.powerLevels.orbs || 0;
      const ring = this.powerLevels.ring || 0;
      const pulse = this.powerLevels.pulse || 0;
      const opem = this.powerLevels.opem || 0;
      const nuke = this.powerLevels.nuke || 0;
      const spark = this.powerLevels.spark || 0;
      const torpedo = this.powerLevels.torpedo || 0;
      const kamikaze = this.powerLevels.kamikaze || 0;
      if (orbs || this.fusions.gravedad) {
        if (orbs) this.markPowerActive('orbs', .55);
        const radius = 68 + orbs * 14 + (this.fusions.gravedad ? 48 : 0);
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < radius + e.r) this.damageEnemy(e, (7 + orbs * 2) * dt, { orbital: true, slow: this.fusions.gravedad ? .4 : 0 });
        }
      }
      if (ring || this.fusions.gravedad) {
        if (ring) this.markPowerActive('ring', .55);
        const radius = 104 + ring * 12;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < radius && d > 0) {
            const push = (this.fusions.gravedad ? -18 : 26) * dt;
            e.x += ((e.x - p.x) / d) * push;
            e.y += ((e.y - p.y) / d) * push;
            if (this.fusions.gravedad) e.slow = Math.max(e.slow || 0, .5);
          }
        }
      }
      if ((pulse || this.fusions.resonante) && p.pulseTimer <= 0) {
        if (pulse) this.markPowerActive('pulse', 5.5);
        const radius = 130 + pulse * 30;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < radius) this.damageEnemy(e, p.damage * (1.3 + pulse * .25), { pulse: true });
        }
        this.particles.push({ type: 'ring', x: p.x, y: p.y, r: 20, maxR: radius, life: .32, max: .32, color: '#ffd56a' });
        p.pulseTimer = Math.max(2.8, 5.4 - pulse * .45);
        AudioFX.tone(260, .12, 'triangle', .035, 260);
      }
      if (spark && p.sparkTimer > 0) {
        this.markPowerActive('spark', Math.min(10, Math.max(1.2, p.sparkTimer)));
        p.sparkTimer -= dt;
        p.sparkTick -= dt;
        if (p.sparkTick <= 0 && this.enemies.length) {
          const target = this.nearestEnemy();
          if (target) {
            const a = Math.atan2(target.y - p.y, target.x - p.x);
            this.fireLaser(a, p.damage * (.4 + spark * .12), 1);
            this.fireLaser(a + Math.sin(now()*.01)*.18, p.damage * .18, 1);
          }
          p.sparkTick = Math.max(.12, .28 - spark * .02);
        }
      }
      if (opem) {
        this.markPowerActive('opem', Math.min(6.5, Math.max(1.2, p.opemTimer || 0)));
        p.opemTimer -= dt;
        if (p.opemTimer <= 0) {
          const radius = 150 + opem * 24;
          for (const e of this.enemies) {
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d < radius) this.damageEnemy(e, p.damage * (.9 + opem * .18), { slow: .8 });
          }
          this.particles.push({ type:'ring', x:p.x, y:p.y, r:18, maxR: radius, life:.42, max:.42, color:'#83eaff' });
          this.toast('Pulso OPEM', 'La horda quedó desorientada');
          p.opemTimer = Math.max(4.6, 8.5 - opem * .5);
        }
      }
      if (nuke) {
        this.markPowerActive('nuke', Math.min(7, Math.max(1.2, p.nukeTimer || 0)));
        p.nukeTimer -= dt;
        if (p.nukeTimer <= 0) {
          let removed = 0;
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (e.boss) this.damageEnemy(e, e.baseHp * (.12 + nuke * .03), { color:'#ffd56a' });
            else { this.damageEnemy(e, e.hp + 999, { color:'#ffd56a' }); removed++; }
          }
          this.particles.push({ type:'ring', x:p.x, y:p.y, r:28, maxR: Math.max(this.w,this.h)*.75, life:.55, max:.55, color:'#ffd56a' });
          this.flash = 1.2;
          this.toast('Bomba atómica', `${removed} enemigos borrados`);
          p.nukeTimer = Math.max(17, 28 - nuke * 1.3);
        }
      }
      if (torpedo) {
        this.markPowerActive('torpedo', Math.min(6, Math.max(1.1, p.torpedoTimer || 0)));
        p.torpedoTimer -= dt;
        if (p.torpedoTimer <= 0 && this.enemies.length) {
          const count = 1 + Math.floor(torpedo / 2);
          for (let i=0;i<count;i++) {
            const target = this.enemies[(i + Math.floor(Math.random()*this.enemies.length)) % this.enemies.length];
            const ang = Math.atan2(target.y - p.y, target.x - p.x) + rand(.08,-.08);
            this.addBullet(p.x, p.y, ang, 420 + torpedo * 30, p.damage * (1.2 + torpedo * .16), { pierce: 1, homing: true, type: 'torpedo', big: true, color: '#ffd56a' });
          }
          p.torpedoTimer = Math.max(1.2, 2.8 - torpedo * .14);
        }
      }
      if (kamikaze) {
        this.markPowerActive('kamikaze', Math.min(6, Math.max(1.1, p.kamiTimer || 0)));
        p.kamiTimer -= dt;
        if (p.kamiTimer <= 0 && this.enemies.length) {
          const count = 1 + Math.floor(kamikaze / 2);
          for (let i=0;i<count;i++) {
            const target = this.enemies[(i + Math.floor(Math.random()*this.enemies.length)) % this.enemies.length];
            const ang = Math.atan2(target.y - p.y, target.x - p.x) + rand(.15,-.15);
            this.addBullet(p.x, p.y, ang, 500 + kamikaze * 40, p.damage * (1.4 + kamikaze * .18), { pierce: 1, homing: true, type: 'kamikaze', big: true, fire: 1, virus: 1, color: '#ff8b5d' });
          }
          p.kamiTimer = Math.max(1.4, 3.4 - kamikaze * .16);
        }
      }
    }

    setupWorldOneIntro() {
      const p = this.player;
      this.powerLevels.triple = Math.max(this.powerLevels.triple || 0, 1);
      this.powerLevels.pierce = Math.max(this.powerLevels.pierce || 0, 1);
      this.spawnDrone(24, false, { support: true, radius: 136, fireRate: .18, damageScale: 1.02, color: '#72ffc7' });
      const rewards = [
        ['power', 1, -80, -58], ['shield', 34, 84, -44], ['xp', 90, -60, 64], ['coin', 90, 70, 72], ['life', 20, 0, -100], ['nuke', 1, 120, 18]
      ];
      for (const [type, value, ox, oy] of rewards) this.spawnPickup(p.x + ox, p.y + oy, type, value);
      // Horda inicial triplicada pero frágil: acción inmediata, no pared de dificultad.
      const introCount = this.w >= 1100 ? 16 : (this.w >= 760 ? 12 : 8);
      for (let i = 0; i < introCount; i++) {
        const type = i < introCount*.36 ? 'errante' : (i < introCount*.68 ? 'larva' : (i < introCount*.9 ? 'mosquito' : 'corredor'));
        this.spawnEnemy(type, true);
      }
      this.spawnWorldOneVisibleSwarm(this.w >= 1100 ? 6 : (this.w >= 760 ? 5 : 4));
      this.spawnWorldOneThreatMarkers();
      this.spawnMirrorShip(true, true);
      setTimeout(() => this.spawnMirrorShip(true, true), 2600);
      this.spawnMeteorRain(this.w >= 760 ? 4 : 3, true);
      this.spawnFallingBomb(this.w >= 760 ? 2 : 1);
      this.spawnPlanetObstacle(1);
      this.spawnMeteor(this.w >= 760 ? 2 : 1, true);
      // Evento pesado desactivado en arranque: evita saturación y lag.
      // this.spawnMeteorLaneShowcase();
      this.toast('🧟', 'Entrada activa');
    }

    worldOneEnemyId() {
      if (this.wave <= 1) return pick(['errante','larva','mosquito','corredor','esquivo','cazador']);
      if (this.wave === 2) return pick(['errante','larva','mosquito','corredor','sombra','esquivo','cazador','cazador']);
      if (this.wave === 3) return pick(['corredor','mosquito','larva','toxico','sombra','esquivo','cazador','blindado']);
      return pick(['corredor','mosquito','larva','toxico','sombra','griton','divisor','esquivo','cazador','blindado']);
    }

    spawnEnemyNearPlayer(type = 'errante', angle = 0, distance = 260, mini = true, speedBoost = 1) {
      this.spawnEnemy(type, mini);
      const e = this.enemies[this.enemies.length - 1];
      if (!e || !this.player) return e;
      const jitter = rand(38, -38);
      e.x = clamp(this.player.x + Math.cos(angle) * distance + jitter, 34, this.w - 34);
      e.y = clamp(this.player.y + Math.sin(angle) * distance + jitter, 52, this.h - 52);
      e.speed *= speedBoost;
      e.hp *= .82;
      e.baseHp = e.hp;
      e.onScreenSpawn = true;
      e.trail = e.trail || [];
      return e;
    }

    spawnWorldOneVisibleSwarm(count = 34) {
      const types = ['errante','larva','mosquito','corredor','mosquito','errante'];
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / count) * i + rand(.22, -.22);
        const d = rand(330, 140);
        const type = types[i % types.length];
        this.spawnEnemyNearPlayer(type, a, d, true, i % 4 === 0 ? 1.28 : 1.12);
      }
    }

    spawnWorldOneThreatMarkers() {
      if (!this.player) return;
      const p = this.player;
      // Enemy lanes visible immediately: forces the first seconds to feel occupied on PC/tablet.
      const laneCount = this.w >= 1100 ? 8 : (this.w >= 760 ? 6 : 4);
      for (let i = 0; i < laneCount; i++) {
        const side = i % 4;
        const type = i % 3 === 0 ? 'mosquito' : (i % 3 === 1 ? 'larva' : 'errante');
        const e = this.spawnEnemy(type, true);
        const obj = this.enemies[this.enemies.length - 1];
        if (!obj) continue;
        if (side === 0) { obj.x = rand(this.w * .85, this.w * .15); obj.y = rand(110, 48); }
        if (side === 1) { obj.x = rand(this.w * .85, this.w * .15); obj.y = rand(this.h - 48, this.h - 140); }
        if (side === 2) { obj.x = rand(130, 46); obj.y = rand(this.h * .8, this.h * .2); }
        if (side === 3) { obj.x = rand(this.w - 46, this.w - 130); obj.y = rand(this.h * .8, this.h * .2); }
        obj.speed *= 1.35;
        obj.onScreenSpawn = true;
      }
    }


    spawnWorldOneReward() {
      const p = this.player;
      const phase = clamp(this.wave, 1, 4);
      if (phase === 2) {
        this.spawnPickup(p.x + rand(120,-120), p.y + rand(120,-120), 'power', 1);
        this.spawnPickup(p.x + rand(100,-100), p.y + rand(100,-100), 'shield', 24);
        this.spawnDrone(12, false, { support: true, radius: 122, fireRate: .25, damageScale: .86, color: '#72ffc7' });
        this.spawnMeteorRain(3, true);
        if ((this.worldOneState?.mirrorCount || 0) < 2) this.spawnMirrorShip(true, true);
        this.toast('⚡', 'Poder de entrada');
      } else if (phase === 3) {
        this.spawnPickup(p.x + rand(130,-130), p.y + rand(130,-130), 'power', 1);
        this.spawnPickup(p.x + rand(120,-120), p.y + rand(120,-120), 'life', 18);
        this.spawnPickup(p.x + rand(120,-120), p.y + rand(120,-120), 'coin', 85);
        this.spawnMeteorRain(4, true);
        this.toast('🦠', 'Mutación leve');
      } else if (phase === 4) {
        this.spawnPickup(p.x + rand(130,-130), p.y + rand(130,-130), 'nuke', 1);
        this.spawnPickup(p.x + rand(130,-130), p.y + rand(130,-130), 'shield', 34);
        this.spawnDrone(14, false, { support: true, radius: 130, fireRate: .21, damageScale: 1, color: '#ffd56a' });
        if ((this.worldOneState?.mirrorCount || 0) < 3) this.spawnMirrorShip(true, true);
        this.spawnMeteorRain(5, true);
        this.toast('🎁', 'Antesala del jefe');
      }
    }

    spawnLogic(dt) {
      if (this.bossActive) return;
      this.spawnTime -= dt;
      if (this.mapIndex === 0) {
        const phase = clamp(this.wave, 1, 4);
        const pcBoost = this.w >= 1100 ? .78 : (this.w >= 760 ? .62 : .42);
        const targetCount = this.w >= 1100 ? (22 + phase * 5) : (this.w >= 760 ? (17 + phase * 4) : (10 + phase * 3));
        const interval = Math.max(.34, .72 - phase * .045);
        const w1 = this.worldOneState || (this.worldOneState = { meteorTimer: .25, insectTimer: .22, mirrorCount: 0, rainTimer: 4.5, burstTimer: .8, bombTimer: 2.4, planetTimer: 6.5, hunterTimer: 1.2 });
        w1.meteorTimer -= dt;
        w1.insectTimer -= dt;
        w1.rainTimer -= dt;
        w1.burstTimer -= dt;
        w1.bombTimer -= dt;
        w1.planetTimer -= dt;
        w1.hunterTimer -= dt;
        if (w1.meteorTimer <= 0) {
          if ((this.meteors?.length || 0) < (this.maxMeteors || 6)) this.spawnMeteor(1, false);
          w1.meteorTimer = Math.max(4.2, 7.2 - phase * .4);
        }
        if (w1.rainTimer <= 0) {
          this.spawnMeteorRain(phase >= 3 ? 4 : 3, false);
          this.toast('☄️', 'Lluvia de meteoros');
          w1.rainTimer = Math.max(8.0, 13.0 - phase * 1.0);
        }
        if (w1.bombTimer <= 0) {
          this.spawnFallingBomb(phase >= 3 ? 2 : 1);
          w1.bombTimer = Math.max(3.5, 6.5 - phase * .55);
        }
        if (w1.planetTimer <= 0) {
          this.spawnPlanetObstacle(1);
          this.toast('🪐', 'Objeto orbital');
          w1.planetTimer = Math.max(8.0, 14.0 - phase * 1.2);
        }
        if (w1.hunterTimer <= 0 && this.enemies.filter(e => e.id === 'cazador').length < (phase + 1)) {
          for (let i=0;i<Math.max(1, Math.floor(phase/2)+1);i++) this.spawnEnemy('cazador', true);
          w1.hunterTimer = Math.max(3.0, 5.3 - phase * .45);
        }
        if (w1.burstTimer <= 0 && this.enemies.length < targetCount) {
          for (let i = 0; i < Math.max(1, Math.floor(3 * pcBoost + phase * .8)); i++) this.spawnEnemy(this.worldOneEnemyId(), true);
          this.spawnWorldOneVisibleSwarm(Math.max(1, Math.floor(2 * pcBoost)));
          w1.burstTimer = Math.max(3.1, 5.2 - phase * .35);
        }
        if (w1.insectTimer <= 0 && this.enemies.filter(e => ['mosquito','larva'].includes(e.id)).length < (this.w >= 1100 ? 10 : (this.w >= 760 ? 8 : 5))) {
          for (let i = 0; i < Math.max(1, Math.floor(2 * pcBoost + phase * .7)); i++) this.spawnEnemy(pick(['mosquito','larva','corredor']), true);
          w1.insectTimer = Math.max(2.2, 4.6 - phase * .25);
        }
        if ((w1.mirrorCount || 0) < 1 && this.waveTime > .45) this.spawnMirrorShip(true, true);
        if (this.wave >= 2 && (w1.mirrorCount || 0) < 2 && this.waveTime > 8.5) this.spawnMirrorShip(true, true);
        if (this.spawnTime <= 0 && this.enemies.length < targetCount) {
          const amount = Math.max(1, Math.floor((2.4 + phase * .9) * pcBoost));
          for (let i = 0; i < amount; i++) this.spawnEnemy(this.worldOneEnemyId(), true);
          this.spawnTime = interval;
        }
        return;
      }
      const targetCount = 6 + this.wave * 3 + Math.floor(this.mapIndex * 1.5);
      const interval = Math.max(.42, 1.45 - this.wave * .05 - this.mapIndex * .02);
      if (this.spawnTime <= 0 && this.enemies.length < targetCount) {
        let amount = 1;
        if (this.wave >= 3) amount = 1 + Math.floor(this.wave / 5);
        if (this.wave >= 4 && Math.random() < .16) amount += 1;
        for (let i = 0; i < amount; i++) this.spawnEnemy();
        this.spawnTime = interval;
      }
    }

    enemyPool() {
      if (this.mapIndex === 0) {
        const pool = ['errante','larva','mosquito','mosquito','corredor','esquivo','cazador'];
        if (this.wave >= 2) pool.push('sombra','mosquito','larva','esquivo','cazador');
        if (this.wave >= 3) pool.push('toxico','mosquito');
        if (this.wave >= 4) pool.push('griton','divisor','nave_espejo');
        return pool;
      }
      const pool = ['errante'];
      if (this.wave > 1) pool.push('corredor','esquivo','cazador');
      if (this.wave > 2) pool.push('blindado');
      if (this.wave > 3) pool.push('toxico', 'sombra');
      if (this.wave > 4) pool.push('griton', 'divisor');
      if (this.wave > 5) pool.push('explosivo');
      if (this.mapIndex > 2 && this.wave > 2) pool.push('niebla');
      if (this.mapIndex > 6 && this.wave > 3) pool.push('nucleo');
      const themed = MAPS[this.mapIndex]?.summons || [];
      if (this.wave > 2 && Math.random() < .35) pool.push(...themed.slice(0,2));
      return pool;
    }


    spawnMirrorShip(easy = false, nearPlayer = false) {
      const w1 = this.worldOneState || (this.worldOneState = { meteorTimer: .25, insectTimer: .22, mirrorCount: 0, rainTimer: 4.5, burstTimer: .8 });
      w1.mirrorCount = (w1.mirrorCount || 0) + 1;
      this.spawnEnemy('nave_espejo', false);
      const e = this.enemies[this.enemies.length - 1];
      if (e && e.id === 'nave_espejo') {
        e.hp *= easy ? .58 : 1;
        e.baseHp = e.hp;
        e.r *= easy ? 1.03 : 1;
        e.speed *= easy ? .92 : 1;
        e.color = easy ? '#ff66c4' : '#ff3f8f';
        e.mirrorFire = .6;
        if (nearPlayer && this.player) {
          const a = rand(Math.PI * 2);
          const radius = rand(250, 130);
          e.x = clamp(this.player.x + Math.cos(a) * radius, 70, this.w - 70);
          e.y = clamp(this.player.y + Math.sin(a) * radius, 86, this.h - 86);
          e.onScreenSpawn = true;
          e.trail = [];
          e.hp *= .82; e.baseHp = e.hp;
        }
      }
      this.toast('🛸', easy ? 'Nave espejo débil' : 'Nave espejo');
    }

    spawnMeteor(count = 1, gentle = false) {
      if (!this.meteors) this.meteors = [];
      const cap = this.maxMeteors || (this.isSmallScreen ? 4 : 7);
      count = Math.max(0, Math.min(count, cap - this.meteors.length));
      for (let i = 0; i < count; i++) {
        const fromTop = Math.random() < .7;
        const fromLeft = Math.random() < .5;
        const r = gentle ? rand(15, 9) : rand(22, 11);
        let x, y, targetX, targetY;
        if (fromTop) {
          x = fromLeft ? rand(this.w * .55, -80) : rand(this.w + 80, this.w * .45);
          y = rand(20, -120);
          targetX = fromLeft ? rand(this.w + 160, this.w * .55) : rand(this.w * .45, -160);
          targetY = rand(this.h + 120, this.h * .45);
        } else {
          x = fromLeft ? rand(this.w * .45, -80) : rand(this.w + 80, this.w * .55);
          y = rand(this.h + 100, this.h * .72);
          targetX = fromLeft ? rand(this.w + 160, this.w * .55) : rand(this.w * .45, -160);
          targetY = rand(-120, this.h * .16);
        }
        const a = Math.atan2(targetY - y, targetX - x);
        const sp = gentle ? rand(240, 175) : rand(330, 235);
        this.meteors.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, life: gentle ? 5.8 : 4.7, dmg: gentle ? 9 : 15, color: gentle ? '#ffd56a' : '#ff7b32', trail: [], spin: rand(2, -2), fireball: true });
      }
    }

    spawnMeteorRain(count = 12, gentle = false) {
      const n = Math.min(this.w < 760 ? 3 : 5, count, Math.max(0, (this.maxMeteors || 6) - (this.meteors?.length || 0)));
      for (let i = 0; i < n; i++) setTimeout(() => this.spawnMeteor(1, gentle), i * 210);
    }

    spawnMeteorLaneShowcase() {
      if (!this.meteors) this.meteors = [];
      const lanes = this.w >= 1100 ? 4 : (this.w >= 760 ? 3 : 2);
      for (let i = 0; i < lanes; i++) {
        setTimeout(() => {
          const up = i % 3 === 0;
          const left = i % 2 === 0;
          const r = rand(28, 14);
          const x = left ? rand(this.w * .38, -120) : rand(this.w + 120, this.w * .62);
          const y = up ? rand(this.h + 90, this.h * .72) : rand(-90, this.h * .12);
          const tx = left ? rand(this.w + 180, this.w * .56) : rand(-180, this.w * .44);
          const ty = up ? rand(-120, this.h * .12) : rand(this.h + 140, this.h * .55);
          const a = Math.atan2(ty - y, tx - x);
          const sp = rand(360, 220);
          this.meteors.push({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r,
            life: 6.8, dmg: 12, color: '#ff8b32', trail: [], spin: rand(2, -2), fireball: true, featured: true
          });
        }, i * 150);
      }
    }


    updateMeteors(dt) {
      if (!this.meteors) return;
      const cap = this.maxMeteors || (this.isSmallScreen ? 4 : 7);
      if (this.meteors.length > cap) this.meteors.splice(0, this.meteors.length - cap);
      const p = this.player;
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.life -= dt;
        m.trail.push({ x: m.x, y: m.y, life: .82, r: m.r });
        if (m.trail.length > (m.featured ? 24 : 18)) m.trail.shift();
        m.trail.forEach(t => t.life -= dt);
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.kind === 'bomb' && m.y > this.h - 42) {
          this.explode(m.x, this.h - 42, m.r * 4.5, m.dmg * 1.15);
          this.shake = Math.max(this.shake, 7);
          this.meteors.splice(i, 1);
          continue;
        }
        if (Math.hypot(m.x - p.x, m.y - p.y) < m.r + p.r) {
          this.playerHit(m.dmg);
          this.explode(m.x, m.y, m.r * 3.8, m.dmg * 1.4);
          this.meteors.splice(i, 1);
          continue;
        }
        for (const e of this.enemies) {
          if (!e.boss && Math.hypot(m.x - e.x, m.y - e.y) < m.r + e.r) {
            this.damageEnemy(e, m.dmg * 1.8, { fire: 1, color: m.color });
            if (Math.random() < .75) { this.explode(m.x, m.y, m.r * 3.5, m.dmg); this.meteors.splice(i, 1); }
            break;
          }
        }
        if (m.life <= 0 || m.x < -160 || m.x > this.w + 160 || m.y > this.h + 180 || m.y < -180) this.meteors.splice(i, 1);
      }
    }

    // DSEBI gameplay balance v0.7.16: presión real desde el nivel 1.
    // Enemigos elite: esquivan, persiguen, resisten y obligan a moverse.
    hardEnemyRate() {
      // Oleada 1 ya es peligrosa: 32%; luego 42%, 52%, 62% y techo del 78%.
      return Math.min(0.78, 0.32 + Math.max(0, this.wave - 1) * 0.10 + this.mapIndex * 0.018);
    }

    makeEnemyHard(e) {
      if (!e || e.boss || e.id === 'nave_espejo') return e;
      const rate = this.hardEnemyRate();
      if (Math.random() >= rate && !['esquivo','cazador'].includes(e.id)) return e;
      const levelBoost = Math.min(0.95, 0.18 + this.wave * 0.065 + this.mapIndex * 0.025);
      e.hard = true;
      e.evade = true;
      e.eliteKind = e.id === 'cazador' ? 'kamikaze' : (e.id === 'esquivo' ? 'evader' : pick(['evader','hunter','brute']));
      e.evadePulse = rand(Math.PI * 2);
      e.dodgeRadius = 170 + Math.min(150, this.wave * 15);
      e.dodgePower = 1.15 + Math.min(0.85, this.wave * 0.07);
      e.speed *= (e.eliteKind === 'brute' ? 1.18 : 1.42) + levelBoost;
      e.hp *= (e.eliteKind === 'brute' ? 2.35 : 1.85) + Math.min(0.75, this.wave * 0.07);
      e.baseHp = e.hp;
      e.r *= e.eliteKind === 'brute' ? 1.10 : 0.92;
      e.color = e.eliteKind === 'kamikaze' ? '#ff6b73' : (e.eliteKind === 'brute' ? '#ffb45d' : '#ffd56a');
      e.trail = e.trail || [];
      e.dashCd = rand(1.1, .35);
      return e;
    }

    enemyDodgeVector(e) {
      if (!e || !e.evade || !this.bullets?.length) return null;
      let nearest = null, best = Infinity, closingBest = 0;
      for (const b of this.bullets) {
        if (b.enemy) continue;
        const dx = e.x - b.x, dy = e.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > (e.dodgeRadius || 170)) continue;
        const bs = Math.hypot(b.vx, b.vy) || 1;
        const closing = ((b.vx / bs) * (dx / (d || 1))) + ((b.vy / bs) * (dy / (d || 1)));
        // Esquiva más agresiva: no espera a que la bala esté encima.
        const score = d / Math.max(.35, closing + .75);
        if (closing > -0.05 && score < best) { best = score; nearest = b; closingBest = closing; }
      }
      if (!nearest) return null;
      const side = Math.sin(e.t * 9.2 + (e.evadePulse || 0)) >= 0 ? 1 : -1;
      const bs = Math.hypot(nearest.vx, nearest.vy) || 1;
      const px = -nearest.vy / bs * side;
      const py = nearest.vx / bs * side;
      const rawD = Math.hypot(e.x - nearest.x, e.y - nearest.y);
      const intensity = (e.dodgePower || 1.2) * (1 - Math.min(1, rawD / (e.dodgeRadius || 170))) * (closingBest > .25 ? 1.25 : .85);
      return { x: px * intensity, y: py * intensity };
    }

    spawnFallingBomb(count = 1) {
      if (!this.meteors) this.meteors = [];
      const cap = this.maxMeteors || 7;
      for (let i=0;i<count && this.meteors.length < cap;i++) {
        const targetX = this.player ? this.player.x + rand(190,-190) : rand(this.w);
        const r = rand(24, 16) + this.wave * 1.2;
        this.meteors.push({ kind:'bomb', x:clamp(targetX, 40, this.w-40), y:-70-rand(160,0), vx:rand(34,-34), vy:250 + this.wave*22, r, life:5.2, dmg:18 + this.wave*3, color:'#ff4e4e', trail:[], spin:rand(3,-3), warning:true });
      }
    }

    spawnPlanetObstacle(count = 1) {
      if (!this.meteors) this.meteors = [];
      const cap = this.maxMeteors || 7;
      for (let i=0;i<count && this.meteors.length < cap;i++) {
        const fromLeft = Math.random() < .5;
        const y = rand(this.h*.82, this.h*.20);
        const r = rand(48, 34) + Math.min(24, this.wave*3);
        const sp = 115 + this.wave * 14;
        this.meteors.push({ kind:'planet', x:fromLeft ? -90 : this.w+90, y, vx:(fromLeft?1:-1)*sp, vy:rand(28,-28), r, life:9.5, dmg:26 + this.wave*4, color:'#9fd4ff', trail:[], spin:rand(1.2,-1.2), planet:true });
      }
    }

    spawnEnemy(forceId = null, mini = false) {
      const id = forceId || pick(this.enemyPool());
      const cfg = ENEMY_TYPES.find(e => e.id === id) || ENEMY_TYPES[0];
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (side === 0) { x = rand(this.w); y = -40; }
      if (side === 1) { x = this.w + 40; y = rand(this.h); }
      if (side === 2) { x = rand(this.w); y = this.h + 40; }
      if (side === 3) { x = -40; y = rand(this.h); }
      const worldOneMini = this.mapIndex === 0 && mini;
      const isMirror = id === 'nave_espejo';
      const scale = isMirror ? (this.mapIndex === 0 ? .82 : 1) : (worldOneMini ? .62 : (mini ? .68 : (1 + this.mapIndex * .04 + this.wave * .025)));
      const enemy = {
        ...cfg,
        x, y,
        baseHp: cfg.hp * scale,
        hp: cfg.hp * scale,
        speed: cfg.speed * (1 + this.wave * .018 + this.mapIndex * .012) * (this.mapIndex === 0 ? 1.28 : 1) * (isMirror ? 1.05 : (worldOneMini ? 1.16 : (mini ? 1.2 : 1))),
        r: cfg.r * (isMirror ? 1.05 : (worldOneMini ? .72 : (mini ? .82 : 1))),
        mirrorFire: isMirror ? rand(1.4, .7) : 0,
        t: Math.random() * 10,
        slow: 0,
        burn: 0,
        buffed: 1,
        virus: 0,
        boss: false,
        mini,
        pulse: rand(Math.PI * 2),
        trail: []
      };
      this.makeEnemyHard(enemy);
      this.enemies.push(enemy);
    }

    spawnBoss() {
      const map = MAPS[this.mapIndex];
      const p = currentProfile();
      const campaignScale = 1 + ((p.avatarTier || 1) - 1) * .1;
      let hp = (1120 + this.mapIndex * 270 + this.wave * 118) * campaignScale;
      hp *= this.mapIndex === 0 ? 2.85 : (2.25 + this.mapIndex * 0.095);
      const x = this.w / 2;
      const y = -80;
      const shieldBase = this.mapIndex === 0 ? 360 : 310 + this.mapIndex * 42;
      this.bossActive = {
        id: 'boss_' + map.id,
        name: map.boss,
        color: map.theme[2],
        beast: map.beast,
        family: map.family,
        pattern: map.pattern,
        variant: map.variant || 1,
        summons: map.summons || [],
        specialName: map.specialName || 'Mutación',
        x, y,
        targetY: this.h * .18,
        hp,
        baseHp: hp,
        speed: (this.mapIndex === 0 ? 34 : 40) + this.mapIndex * 1.5 + (p.avatarTier || 1) * .5,
        r: (31 + this.mapIndex * .36) * 0.64,
        t: 0,
        attack: this.mapIndex === 0 ? 2.55 : 1.95,
        specialCd: this.mapIndex === 0 ? 6.6 : 5.3,
        phase: 1,
        alpha: 1,
        shield: shieldBase,
        shieldMax: shieldBase,
        vulnerable: 0,
        summonPressure: 0,
        boss: true
      };
      this.bossFight = { active: true, charge: 0, minionTimer: this.mapIndex === 0 ? 3.0 : 2.15, phaseNotified: 1, cinematic: 1.15, addsKilled: 0, supportTimer: this.mapIndex === 0 ? 1.5 : 1.9, escortTimer: this.mapIndex === 0 ? 4.8 : 3.9, hazardTimer: this.mapIndex === 0 ? 5.4 : 4.2 };
      this.enemies.push(this.bossActive);
      this.bossIntroduced = true;
      this.grantBossAid('Duelo de jefe');
      AudioFX.boss();
      AudioFX.music(this.mapIndex, true, MAPS[this.mapIndex]?.family || 'zombie', this.bossActive?.phase || 1);
      this.shake = 12;
      this.flash = 1;
      els.bossBar.classList.remove('hidden');
      els.bossName.textContent = `${map.boss} · ${this.bossActive.specialName}`;
      this.updateBossUi();
      this.showBossIntro(map, this.bossActive);
    }

    updateEnemies(dt) {
      const p = this.player;
      let speedBuff = 1;
      for (const e of this.enemies) {
        if (e.behavior === 'buffer') {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 360) speedBuff = 1.12;
        }
      }
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.t += dt;
        if (!e.boss) {
          e.trail = e.trail || [];
          if (this.mapIndex === 0 && (e.id === 'mosquito' || e.behavior === 'mirror' || e.id === 'corredor') && Math.random() < .55) {
            e.trail.push({ x:e.x, y:e.y, life:.32, r:e.r, color:e.color });
            if (e.trail.length > 8) e.trail.shift();
          }
          if (e.trail) e.trail.forEach(t => t.life -= dt);
        }
        if (e.boss && e.y < e.targetY) e.y += e.speed * dt;
        const dx = p.x - e.x, dy = p.y - e.y;
        const d = Math.hypot(dx, dy) || 1;
        const slow = e.slow ? .55 : 1;
        e.slow = Math.max(0, (e.slow || 0) - dt);
        if (e.burn) {
          e.burn -= dt;
          this.damageEnemy(e, (8 + (this.powerLevels.fire || 0) * 2) * dt, { burn: true, silent: true });
        }
        if (e.virus) {
          e.virus -= dt;
          this.damageEnemy(e, (10 + (this.powerLevels.virus || 0) * 2) * dt, { virus: true, silent: true });
        }
        let mx = dx / d, my = dy / d;
        let bossHandled = false;
        if (e.behavior === 'zigzag') {
          const wob = Math.sin(e.t * 5.2) * .85;
          mx = (dx / d) * .82 + (-dy / d) * wob * .55;
          my = (dy / d) * .82 + (dx / d) * wob * .55;
        }
        if (e.behavior === 'mirror') {
          const orbit = Math.sin(e.t * 1.8) * .9;
          const desired = 170;
          const approach = d > desired ? .72 : -0.55;
          mx = (dx / d) * approach + (-dy / d) * orbit * .72;
          my = (dy / d) * approach + (dx / d) * orbit * .72;
          e.mirrorFire -= dt;
          if (e.mirrorFire <= 0) {
            const a = Math.atan2(p.y - e.y, p.x - e.x);
            this.addEnemyBullet(e.x, e.y, a, 230, this.mapIndex === 0 ? 6 : 10, e.color);
            e.mirrorFire = this.mapIndex === 0 ? rand(2.2, 1.3) : rand(1.6, .9);
          }
        }
        if (e.behavior === 'evader' || e.eliteKind === 'evader') {
          const orbit = Math.sin(e.t * 4.7 + (e.evadePulse || 0));
          mx = (dx / d) * .62 + (-dy / d) * orbit * 1.05;
          my = (dy / d) * .62 + (dx / d) * orbit * 1.05;
        }
        if (e.behavior === 'kamikaze' || e.eliteKind === 'kamikaze' || e.eliteKind === 'hunter') {
          const surge = d < 260 ? 1.65 : 1.15;
          e.dashCd = (e.dashCd || .8) - dt;
          if (e.dashCd <= 0) { e.speed *= 1.08; e.dashCd = rand(1.7, .75); this.emit(e.x, e.y, '#ff6b73', 3, 50, .22); }
          mx = (dx / d) * surge + (-dy / d) * Math.sin(e.t * 6.1) * .18;
          my = (dy / d) * surge + (dx / d) * Math.sin(e.t * 6.1) * .18;
        }
        const dodge = this.enemyDodgeVector(e);
        if (dodge) {
          mx += dodge.x;
          my += dodge.y;
          const mlen = Math.hypot(mx, my) || 1;
          mx /= mlen; my /= mlen;
          if (Math.random() < .65) {
            e.trail = e.trail || [];
            e.trail.push({ x:e.x, y:e.y, life:.28, r:e.r*.8, color:'#ffd56a' });
            if (e.trail.length > 10) e.trail.shift();
          }
        }
        if (e.boss) {
          e.phase = e.hp < e.baseHp * .28 ? 4 : (e.hp < e.baseHp * .54 ? 3 : (e.hp < e.baseHp * .78 ? 2 : 1));
          e.specialCd -= dt;
          this.bossPattern(e, dt);
          if (e.specialCd <= 0) this.triggerBossSpecial(e);
          bossHandled = this.updateBossMotion(e, dt);
        }
        if (!bossHandled) {
          e.x += mx * e.speed * slow * speedBuff * dt;
          e.y += my * e.speed * slow * speedBuff * dt;
        }

        if (e.behavior === 'mist' && Math.random() < .018) this.emit(e.x, e.y, '#ffffff', 2, 80, .8, 'mist');
        if (e.behavior === 'toxic' && Math.random() < .012) this.zones.push({ x: e.x, y: e.y, r: 28, life: 3.5, max: 3.5, type: 'toxic' });

        if (d < p.r + e.r && !(e.boss && (e.alpha || 1) < 0.32)) {
          this.playerHit(e.boss ? ((this.mapIndex === 0 ? 14 : 20) + e.phase * (this.mapIndex === 0 ? 2 : 4)) : (e.behavior === 'explosive' ? 28 : 12));
          if (e.behavior === 'explosive' || e.behavior === 'kamikaze' || e.eliteKind === 'kamikaze') {
            this.explode(e.x, e.y, e.behavior === 'kamikaze' ? 118 : 92, e.behavior === 'kamikaze' ? 34 : 28);
            e.hp = 0;
          } else {
            e.x -= mx * 24;
            e.y -= my * 24;
          }
        }
        if (e.hp <= 0) this.killEnemy(e, i);
      }
    }

    triggerBossSpecial(b) {
      const map = MAPS[this.mapIndex];
      const kind = map.pattern || map.family;
      const p = this.player;
      this.toast('⚠️', b.specialName || 'Mutación');
      if (kind === 'swarm') {
        for (let i = 0; i < (this.mapIndex === 0 ? 3 : 5); i++) {
          const a = (Math.PI * 2 / (this.mapIndex === 0 ? 3 : 5)) * i + b.t;
          this.zones.push({ x: p.x + Math.cos(a) * 70, y: p.y + Math.sin(a) * 70, r: 20, life: 2.2, max: 2.2, type: 'root' });
        }
      } else if (kind === 'spore') {
        p.shield = Math.max(0, p.shield - (8 + b.phase * 4));
        if (p.shield <= 0) p.hp = Math.max(1, p.hp - (5 + b.phase * 2));
        b.hp = Math.min(b.baseHp, b.hp + b.baseHp * 0.05);
        this.emit(p.x, p.y, '#e8fff8', 12, 120, .8, 'mist');
      } else if (kind === 'inferno') {
        this.explode(p.x + rand(50, -50), p.y + rand(50, -50), 88, 20 + b.phase * 4);
      } else if (kind === 'hex') {
        for (let i = 0; i < 4; i++) this.zones.push({ x: p.x + rand(90, -90), y: p.y + rand(90, -90), r: 22, life: 2.8, max: 2.8, type: 'root' });
      } else if (kind === 'spectral') {
        const shots = 6 + b.phase * 2;
        for (let i = 0; i < shots; i++) {
          const a = (Math.PI * 2 / shots) * i;
          this.addEnemyBullet(b.x, b.y, a, 145 + b.phase * 18, 10 + b.phase * 3, '#a4edff');
        }
      } else if (kind === 'plague') {
        this.zones.push({ x: p.x, y: p.y, r: 48, life: 4.2, max: 4.2, type: 'slow' });
        for (let i = 0; i < 2 + b.phase; i++) this.spawnEnemy(i % 2 ? 'toxico' : 'divisor', true);
      } else if (kind === 'mythic') {
        const shots = 10 + b.phase * 2;
        for (let i = 0; i < shots; i++) {
          const a = (Math.PI * 2 / shots) * i + b.t * .6;
          this.addEnemyBullet(b.x, b.y, a, 180 + b.phase * 25, 14 + b.phase * 3, '#ff82d4');
        }
      }
      if (b.phase >= 2 && Math.random() < .75) this.spawnEnemy('nave_espejo', true);
      if (b.phase >= 3 && Math.random() < .4) this.spawnEnemy(pick(['mosquito','corredor','blindado']), true);
      this.bossVariantSignature(b, map, 'special');
      b.specialCd = this.mapIndex === 0 ? Math.max(5.8, 7.2 - b.phase * .28) : Math.max(4.2, 6.6 - b.phase * .5 - this.mapIndex * .08);
    }

    bossPattern(b, dt) {
      b.attack -= dt;
      if (b.attack > 0) return;
      const map = MAPS[this.mapIndex];
      const kind = map.pattern || map.family;
      if (kind === 'swarm') {
        const count = this.mapIndex === 0 ? 3 + b.phase : 5 + b.phase;
        for (let i = 0; i < count; i++) {
          const a = (Math.PI * 2 / count) * i + b.t;
          this.zones.push({ x: b.x + Math.cos(a) * 96, y: b.y + Math.sin(a) * 96, r: this.mapIndex === 0 ? 18 + b.phase : 22 + b.phase * 2, life: 2.2, max: 2.2, type: 'root' });
        }
      } else if (kind === 'spore') {
        b.x = clamp(b.x + rand(220, -220), 70, this.w - 70);
        b.y = clamp(b.y + rand(120, -70), 70, this.h * .45);
        this.emit(b.x, b.y, '#e8fff8', 16, 180, .8, 'mist');
        if (Math.random() < .55) this.spawnEnemy('toxico', true);
      } else if (kind === 'inferno') {
        const shots = 7 + b.phase * 2;
        for (let i = 0; i < shots; i++) {
          const a = (Math.PI * 2 / shots) * i + b.t;
          this.addEnemyBullet(b.x, b.y, a, 185 + b.phase * 32, 12 + b.phase * 3, map.theme[2]);
        }
      } else if (kind === 'hex') {
        for (let i = 0; i < 3 + b.phase; i++) this.zones.push({ x: b.x + rand(110, -110), y: b.y + rand(110, -110), r: 20 + b.phase, life: 2.5, max: 2.5, type: 'root' });
      } else if (kind === 'spectral') {
        const shots = 5 + b.phase * 2;
        for (let i = 0; i < shots; i++) {
          const a = (Math.PI * 2 / shots) * i + b.t;
          this.addEnemyBullet(b.x, b.y, a, 150 + b.phase * 18, 10 + b.phase * 3, '#9ac7ff');
        }
        if (Math.random() < .4) this.spawnEnemy('sombra', true);
      } else if (kind === 'plague') {
        this.zones.push({ x: b.x + rand(80, -80), y: b.y + rand(80, -80), r: 28 + b.phase * 2, life: 3.2, max: 3.2, type: 'toxic' });
        for (let i = 0; i < Math.min(2, b.phase); i++) this.spawnEnemy(pick(['toxico', 'divisor', 'niebla']), true);
      } else if (kind === 'mythic') {
        const shots = 8 + b.phase * 3;
        for (let i = 0; i < shots; i++) {
          const a = (Math.PI * 2 / shots) * i + b.t;
          this.addEnemyBullet(b.x, b.y, a, 190 + b.phase * 24, 13 + b.phase * 3, map.theme[2]);
        }
        if (Math.random() < .5) this.spawnEnemy(pick(['blindado', 'corredor', 'explosivo']), true);
      }
      this.bossVariantSignature(b, map, 'pattern');
      b.attack = this.mapIndex === 0 ? Math.max(2.05, 3.85 - b.phase * .28) : Math.max(1.05, 3.05 - b.phase * .32 - this.mapIndex * .035);
    }

    addEnemyBullet(x, y, angle, speed, damage, color) {
      const enemyCount = this.bullets.filter(b => b.enemy).length;
      if (enemyCount > Math.floor((this.maxBullets || 180) * .35)) return;
      this.bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 7, damage, life: 3.2, enemy: true, color });
    }

    updateBullets(dt) {
      const p = this.player;
      const cap = this.maxBullets || 220;
      if (this.bullets.length > cap) this.bullets.splice(0, this.bullets.length - cap);
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.life -= dt;
        if (b.homing && !b.enemy) {
          let target = null, best = Infinity;
          for (const e of this.enemies) { const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < best) { best = d; target = e; } }
          if (target) {
            const ang = Math.atan2(target.y - b.y, target.x - b.x);
            const sp = Math.hypot(b.vx, b.vy) || 500;
            b.vx += (Math.cos(ang) * sp - b.vx) * Math.min(1, dt * 3.8);
            b.vy += (Math.sin(ang) * sp - b.vy) * Math.min(1, dt * 3.8);
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.enemy) {
          if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) {
            this.playerHit(b.damage);
            this.bullets.splice(i, 1);
            continue;
          }
        } else {
          for (const e of this.enemies) {
            if (Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r) {
              this.damageEnemy(e, b.damage, b);
              b.pierce -= 1;
              if (b.bounce && Math.random() < .18 + b.bounce * .05) {
                const other = this.enemies.find(o => o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 220);
                if (other) {
                  const a = Math.atan2(other.y - e.y, other.x - e.x);
                  b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * 640; b.vy = Math.sin(a) * 640; b.pierce += 1;
                }
              }
              if (b.pierce <= 0) break;
            }
          }
        }
        if (b.life <= 0 || b.pierce <= 0 || b.x < -90 || b.x > this.w + 90 || b.y < -90 || b.y > this.h + 90) this.bullets.splice(i, 1);
      }
    }

    damageEnemy(e, amount, meta = {}) {
      if (!e || e.hp <= 0) return;
      if (e.boss && this.bossActive === e) {
        const cap = e.baseHp * (0.014 + (e.phase || 1) * 0.0028);
        amount = Math.min(amount, cap);
      }
      if (e.boss && this.bossActive === e && (e.shield || 0) > 0 && (e.vulnerable || 0) <= 0) {
        e.shield = Math.max(0, e.shield - amount * 0.58);
        if (Math.random() < .5) this.emit(e.x, e.y, '#9fd4ff', 1, 34, .28);
        if (e.shield <= 0) {
          this.toast('🧨', 'Escudo roto');
          e.vulnerable = Math.max(2.4, 3.9 - e.phase * .18);
        }
      } else {
        if (e.boss && this.bossActive === e) amount *= (e.vulnerable > 0 ? .82 : .55);
        e.hp -= amount;
      }
      if (!meta.silent && Math.random() < .28) AudioFX.hit();
      if (meta.fire) e.burn = Math.max(e.burn || 0, .8 + meta.fire * .22);
      if (meta.virus) e.virus = Math.max(e.virus || 0, 1.4 + meta.virus * .3);
      if (meta.ice) e.slow = Math.max(e.slow || 0, .5 + meta.ice * .12);
      if (meta.slow) e.slow = Math.max(e.slow || 0, meta.slow);
      if (!meta.burn && Math.random() < .6) this.emit(e.x, e.y, meta.color || e.color, 1, 30, .24);
      if (e.boss && this.bossActive === e) this.updateBossUi();
    }


    applyScreenPowerPickup() {
      const preferred = this.selectRecommendedPower(POWERS.filter(p => (this.powerLevels[p.id] || 0) < 5));
      const pow = preferred || pick(POWERS);
      if (!pow) return;
      this.powerLevels[pow.id] = (this.powerLevels[pow.id] || 0) + 1;
      currentProfile().collection.powers[pow.id] = true;
      if (pow.id === 'drone') this.spawnDrone(10 + (this.powerLevels.drone || 0) * 2);
      if (pow.id === 'spark') { this.player.sparkTimer = Math.min(18, this.player.sparkTimer + 10); this.player.sparkTick = 0; }
      if (pow.id === 'kamikaze') this.player.kamiTimer = .35;
      if (pow.id === 'torpedo') this.player.torpedoTimer = .15;
      if (pow.id === 'nuke') this.player.nukeTimer = Math.min(this.player.nukeTimer, 4.5);
      if (pow.id === 'opem') this.player.opemTimer = Math.min(this.player.opemTimer, 1.1);
      this.checkFusions();
      this.toast('⚡', pow.name);
      saveState();
      this.updateHud();
    }


    triggerScreenNuke() {
      let removed = 0;
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.boss) this.damageEnemy(e, e.baseHp * .16, { color:'#ffd56a' });
        else { this.damageEnemy(e, e.hp + 999, { color:'#ffd56a' }); removed += 1; }
      }
      this.particles.push({ type:'ring', x:this.player.x, y:this.player.y, r:24, maxR:Math.max(this.w,this.h) * .68, life:.5, max:.5, color:'#ffd56a' });
      this.flash = 1.05;
      this.toast('☢️', removed ? `${removed} enemigos borrados` : 'impacto nuclear');
    }


    bossDeathExplosion(e) {
      if (!e) return;
      this.flash = Math.max(this.flash, 2.2);
      this.shake = Math.max(this.shake, 24);
      const rings = [1.6, 2.7, 4.2, 6.0];
      rings.forEach((mul, idx) => {
        setTimeout(() => {
          this.particles.push({ type:'ring', x:e.x, y:e.y, r:18, maxR:e.r * 34 * mul, life:.72, max:.72, color: idx % 2 ? '#ffd56a' : e.color });
          this.emit(e.x + rand(38,-38), e.y + rand(38,-38), idx % 2 ? '#ffd56a' : e.color, 36, 230, .95);
          this.explode(e.x + rand(44,-44), e.y + rand(44,-44), e.r * (5 + idx), 12 + idx * 3);
        }, idx * 130);
      });
      this.toast('💥 Jefe destruido', e.name || 'Entidad eliminada');
    }

    killEnemy(e, index) {
      this.enemies.splice(index, 1);
      this.emit(e.x, e.y, e.color, e.boss ? 28 : 8, e.boss ? 160 : 70, e.boss ? 1.2 : .55);
      AudioFX.death();
      this.run.kills += 1;
      this.run.score += e.boss ? 650 + this.mapIndex * 100 : e.score;
      this.player.xp += e.boss ? 110 : e.xp;
      this.spawnPickup(e.x, e.y, 'xp', e.boss ? 70 : e.xp);
      if (Math.random() < (e.boss ? 1 : .72)) this.spawnPickup(e.x + rand(20, -20), e.y + rand(20, -20), 'coin', e.boss ? 180 + this.mapIndex * 30 : Math.ceil(e.coin * (this.mapIndex === 0 ? 2.4 : 1.7)));
      if (e.boss) {
        this.bossDeathExplosion(e);
        this.spawnPickup(e.x + rand(42,-42), e.y + rand(42,-42), 'power', 1);
        this.spawnPickup(e.x + rand(42,-42), e.y + rand(42,-42), 'nuke', 1);
        this.spawnPickup(e.x + rand(42,-42), e.y + rand(42,-42), 'shield', 34);
        this.spawnPickup(e.x + rand(42,-42), e.y + rand(42,-42), 'life', 28);
      } else {
        const roll = Math.random();
        const starter = this.mapIndex === 0;
        if (starter && roll < .018 && this.wave >= 4) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'nuke', 1);
        else if (starter && roll < .105) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'power', 1);
        else if (starter && roll < .18) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'shield', 20);
        else if (starter && roll < .235) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'life', 16);
        else if (roll < .012 && this.wave >= 3) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'nuke', 1);
        else if (roll < .06) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'power', 1);
        else if (roll < .11) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'shield', 18);
        else if (roll < .14) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'life', 14);
      }
      if (e.behavior === 'splitter' && !e.mini) for (let i = 0; i < 2; i++) this.spawnEnemy('corredor', true);
      if (e.virus > 0) for (const other of this.enemies) if (other !== e && Math.hypot(other.x - e.x, other.y - e.y) < 130) other.virus = Math.max(other.virus || 0, 1.2);
      if (this.bossFight?.active && !e.boss) {
        this.bossFight.charge = Math.min(100, (this.bossFight.charge || 0) + (e.mini ? 24 : 14));
        if (this.bossActive) {
          this.bossActive.shield = Math.max(0, (this.bossActive.shield || 0) - (e.mini ? 16 : 10));
          this.updateBossUi();
        }
      }
      while (this.run.score >= this.nextLifeScore) {
        this.extraLives += 1;
        this.nextLifeScore += 2500;
        this.toast('Vida extra', `Has ganado ${this.extraLives} en reserva`);
        AudioFX.chord([523.25,659.25,783.99], .18, .07);
      }
      if (e.boss) {
        this.bossActive = null;
        this.bossFight = { active: false, charge: 0, minionTimer: 0, phaseNotified: 1, addsKilled: 0 };
        els.bossBar.classList.add('hidden');
        els.bossBar.classList.remove('vulnerable');
        this.run.bosses += 1;
        this.run.mapComplete = true;
        this.completeMap();
      }
      this.checkLevelUp();
    }

    spawnPickup(x, y, type, value) {
      const meta = {
        coin: { icon: '🪙', color: '#ffd56a', r: 12 },
        xp: { icon: '✦', color: '#83eaff', r: 11 },
        power: { icon: '⚡', color: '#c391ff', r: 15 },
        shield: { icon: '🛡️', color: '#9fd4ff', r: 14 },
        life: { icon: '❤️‍🩹', color: '#ff8b8b', r: 14 },
        nuke: { icon: '☢️', color: '#ffd56a', r: 15 }
      }[type] || { icon: '🎁', color: '#eafff8', r: 12 };
      const limit = this.maxPickups || 110;
      if (this.pickups.length >= limit) this.pickups.splice(0, this.pickups.length - limit + 1);
      this.pickups.push({
        x: clamp(x, 24, Math.max(24, this.w - 24)),
        y: clamp(y, 24, Math.max(24, this.h - 24)),
        vx: rand(74, -74),
        vy: rand(74, -74),
        type, value,
        icon: meta.icon,
        color: meta.color,
        r: meta.r,
        life: state.settings.lowPerformance ? 14 : 20,
        maxLife: state.settings.lowPerformance ? 14 : 20,
        autoDelay: type === 'power' ? .65 : .9,
        born: now() + Math.random() * 100
      });
    }

    updatePickups(dt) {
      const p = this.player;
      for (let i = this.pickups.length - 1; i >= 0; i--) {
        const item = this.pickups[i];
        item.life -= dt;
        item.autoDelay = Math.max(0, (item.autoDelay || 0) - dt);
        const d = Math.hypot(item.x - p.x, item.y - p.y);
        const forceAuto = item.autoDelay <= 0 || d < p.magnet;
        if (forceAuto) {
          const pull = item.type === 'power' || item.type === 'nuke' ? 800 : 610;
          item.x += ((p.x - item.x) / (d || 1)) * (pull + p.magnet * 1.2) * dt;
          item.y += ((p.y - item.y) / (d || 1)) * (pull + p.magnet * 1.2) * dt;
        } else {
          item.x += item.vx * dt; item.y += item.vy * dt; item.vx *= .975; item.vy *= .975;
        }
        item.x = clamp(item.x, 18, this.w - 18);
        item.y = clamp(item.y, 18, this.h - 18);
        const collectD = Math.hypot(item.x - p.x, item.y - p.y);
        if (collectD < p.r + item.r + 12 || item.life <= 0) {
          if (item.type === 'coin') { this.run.coins += item.value; AudioFX.pickup(); }
          if (item.type === 'xp') { p.xp += item.value * .35; AudioFX.pickup(); }
          if (item.type === 'shield') { p.shield = Math.min(p.maxShield, p.shield + item.value); AudioFX.pickup(); }
          if (item.type === 'life') { p.hp = Math.min(p.maxHp, p.hp + item.value); AudioFX.pickup(); }
          if (item.type === 'power') { this.applyScreenPowerPickup(); AudioFX.level(); }
          if (item.type === 'nuke') { this.triggerScreenNuke(); AudioFX.level(); }
          this.emit(p.x, p.y, item.color, 6, 52, .34);
          this.pickups.splice(i, 1);
          this.checkLevelUp();
        }
      }
    }

    updateDrones(dt) {
      for (let i = this.drones.length - 1; i >= 0; i--) {
        const d = this.drones[i];
        d.life -= dt;
        d.a += dt * (1.5 + d.index * .25 + (d.support ? .35 : 0));
        const radius = d.radius || (d.permanent ? 82 : 104);
        d.x = this.player.x + Math.cos(d.a) * radius;
        d.y = this.player.y + Math.sin(d.a) * radius;
        d.fire -= dt;
        if (d.fire <= 0 && this.enemies.length) {
          const target = this.nearestEnemy();
          if (target) {
            const a = Math.atan2(target.y - d.y, target.x - d.x);
            const dmg = this.player.damage * (this.fusions.resonante ? .92 : .62) * (d.damageScale || 1);
            this.addBullet(d.x, d.y, a, d.support ? 620 : 520, dmg, { color: d.color || '#9ac7ff', pierce: this.fusions.resonante ? 2 : 1, homing: !!d.support });
            if (d.support) this.addBullet(d.x, d.y, a + .1, 610, dmg * .75, { color: d.color || '#ffd56a', pierce: 1 });
            if (this.fusions.resonante && Math.random() < .25) this.particles.push({ type: 'ring', x: d.x, y: d.y, r: 8, maxR: 70, life: .22, max: .22, color: d.color || '#9ac7ff' });
            d.fire = d.support ? .24 : (this.fusions.resonante ? .32 : .48);
          }
        }
        if (d.life <= 0 && !d.permanent) this.drones.splice(i, 1);
      }
    }

    updateZones(dt) {
      for (let i = this.zones.length - 1; i >= 0; i--) {
        const z = this.zones[i];
        z.life -= dt;
        const d = Math.hypot(z.x - this.player.x, z.y - this.player.y);
        if (d < z.r + this.player.r) {
          if (z.type === 'toxic' || z.type === 'root') this.playerHit((z.type === 'toxic' ? 8 : 5) * dt);
          if (z.type === 'slow') this.player.speed *= .999;
        }
        if (z.life <= 0) this.zones.splice(i, 1);
      }
    }

    updateParticles(dt) {
      const limit = this.maxParticles || 360;
      if (this.particles.length > limit) this.particles.splice(0, this.particles.length - limit);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.life -= dt;
        if (pt.vx) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vx *= .96; pt.vy *= .96; }
        if (pt.type === 'ring') pt.r += ((pt.maxR || 120) - pt.r) * Math.min(1, dt * 6);
        if (pt.life <= 0) this.particles.splice(i, 1);
      }
    }

    playerHit(amount) {
      const p = this.player;
      let mod = p.avatar.mod.phase && p.phaseTimer <= 0 ? .2 : 1;
      if (p.avatar.mod.phase && p.phaseTimer <= 0) p.phaseTimer = 5.5;
      if (p.bossDrive > 0) mod *= .74;
      if (p.cloak > 0) mod *= .6;
      amount *= mod;
      if (p.shield > 0) {
        const absorbed = Math.min(p.shield, amount);
        p.shield -= absorbed;
        amount -= absorbed;
      }
      p.hp -= amount;
      this.shake = Math.max(this.shake, 5);
      if (state.settings.shake && !state.settings.reducedMotion) els.screenGame.classList.add('shake');
      setTimeout(() => els.screenGame.classList.remove('shake'), 240);
      AudioFX.tone(100, .08, 'sawtooth', .025, -30);
    }

    explode(x, y, radius, damage) {
      this.particles.push({ type: 'ring', x, y, r: 12, maxR: radius, life: .3, max: .3, color: '#ff8b5d' });
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < radius) this.damageEnemy(e, damage * (1 - d / radius), { fire: 1 });
      }
    }

    checkWave() {
      if (this.waveTime < 24) return;
      this.waveTime = 0;
      this.wave += 1;
      currentProfile().stats.highestWave = Math.max(currentProfile().stats.highestWave, this.wave);
      if (this.mapIndex === 0 && this.wave <= 4) this.spawnWorldOneReward();
      if (this.wave >= 5 && !this.bossIntroduced) this.spawnBoss();
      else this.toast(this.mapIndex === 0 ? '🌊' : 'Oleada superada', `Oleada ${this.wave}`);
      if (this.wave >= 5) unlockAchievement('wave_5');
      this.checkLevelUp();
    }

    checkLevelUp() {
      const p = this.player;
      let ups = 0;
      while (p.xp >= p.xpNext && ups < 5) {
        p.xp -= p.xpNext;
        p.level += 1;
        p.xpNext = Math.floor(p.xpNext * 1.22 + 30);
        ups += 1;
        AudioFX.level();
        if (this.offerActive) this.pendingLevelChoices += 1;
        else this.showCards();
      }
      this.updatePendingBadge();
    }

    showCards() {
      this.offerActive = true;
      this.cardPause = false;
      const choices = this.generateCards();
      this.currentOfferChoices = choices;
      this.offerAutoAt = 4.8;
      els.cardOverlay?.classList.remove('hidden');
      els.cardOverlay?.querySelector('.power-offer-head')?.classList.add('compact');
      if (els.offerHint) {
        const count = 1 + (this.pendingLevelChoices || 0);
        els.offerHint.textContent = `${count}`;
      }
      this.updatePendingBadge();
      els.cardChoices.innerHTML = choices.map(card => {
        const lvl = this.powerLevels[card.id] || 0;
        const recommended = this.selectRecommendedPower(choices)?.id === card.id;
        return `
        <button class="offer-choice icon-only ${recommended ? 'recommended' : ''}" data-power="${card.id}" title="${card.name}: ${card.desc}">
          <span class="choice-icon">${card.icon}</span>
          <small class="offer-lvl">${lvl > 0 ? '+'+lvl : 'new'}</small>
          ${recommended ? '<span class="offer-star">★</span>' : ''}
          <div class="offer-preview">
            <b>${card.name}</b>
            <p class="muted">${card.desc}</p>
            <span class="tag">Toca para activar · auto ${Math.ceil(this.offerAutoAt)}s</span>
          </div>
        </button>`;
      }).join('');
      els.cardChoices.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => this.applyPower(btn.dataset.power, false)));
      els.cardOverlay.classList.remove('hidden');
    }

    generateCards() {
      const pool = POWERS.filter(p => !['nuke','pulse'].includes(p.id) || this.wave >= 3 || this.mapIndex > 0);
      const cards = [];
      while (cards.length < 2 && pool.length) {
        const idx = Math.floor(Math.random() * pool.length);
        const card = pool.splice(idx, 1)[0];
        const lvl = this.powerLevels[card.id] || 0;
        const weight = card.rarity === 'legendary' ? .45 : card.rarity === 'epic' ? .7 : 1;
        if (lvl < 5 && Math.random() < weight + .2) cards.push(card);
      }
      while (cards.length < 3) cards.push(pick(POWERS));
      return cards;
    }

    applyPower(id, autoChosen = false) {
      const pow = POWERS.find(p => p.id === id);
      if (!pow) return;
      this.powerLevels[id] = (this.powerLevels[id] || 0) + 1;
      this.markPowerActive(id, POWER_ACTIVE_SECONDS[id] || 8);
      currentProfile().collection.powers[id] = true;
      if (id === 'drone') this.spawnDrone(10 + (this.powerLevels.drone || 0) * 2);
      if (id === 'spark') { this.player.sparkTimer = Math.min(18, this.player.sparkTimer + 10); this.player.sparkTick = 0; }
      if (id === 'kamikaze') this.player.kamiTimer = .4;
      if (id === 'torpedo') this.player.torpedoTimer = .2;
      if (id === 'nuke') this.player.nukeTimer = Math.min(this.player.nukeTimer, 6);
      if (id === 'opem') this.player.opemTimer = Math.min(this.player.opemTimer, 1.4);
      this.checkFusions();
      this.toast(autoChosen ? 'Autoactivado' : 'Poder activado', pow.name);
      if (this.pendingLevelChoices > 0) {
        this.pendingLevelChoices -= 1;
        this.showCards();
      } else {
        this.offerActive = false;
        this.currentOfferChoices = [];
        this.offerAutoAt = 0;
        els.cardOverlay.classList.add('hidden');
        if (els.offerHint) els.offerHint.textContent = '';
      }
      this.updatePendingBadge();
      this.cardPause = false;
      saveState();
      this.updateHud();
    }

    checkFusions() {
      for (const f of FUSIONS) {
        if (!this.fusions[f.id] && f.requires.every(id => (this.powerLevels[id] || 0) > 0)) {
          this.fusions[f.id] = true;
          currentProfile().collection.fusions[f.id] = true;
          unlockAchievement('fusion_1');
          this.toast('Fusión descubierta', f.name);
          AudioFX.chord([659.25, 880, 1174.66], .25, .08);
        }
      }
    }

    spawnDrone(life = 10, permanent = false, options = {}) {
      const count = options.count || (1 + Math.floor((this.powerLevels.drone || 0) / 2) + (this.fusions.resonante ? 1 : 0));
      for (let i = 0; i < count; i++) {
        this.drones.push({
          x: this.player.x,
          y: this.player.y,
          a: rand(Math.PI * 2),
          life,
          fire: options.fireRate || (.2 + i * .12),
          permanent,
          index: this.drones.length + i,
          support: !!options.support,
          radius: options.radius || (permanent ? 82 : 104),
          color: options.color || '#9ac7ff',
          damageScale: options.damageScale || 1
        });
      }
    }

    grantShipPartUpgrade() {
      const p = currentProfile();
      p.shipParts = { core: 0, wings: 0, cannon: 0, engine: 0, ...(p.shipParts || {}) };
      const order = ['engine', 'wings', 'cannon', 'core'];
      const partId = order[this.mapIndex % order.length];
      p.shipParts[partId] = Math.min(6, (p.shipParts[partId] || 0) + 1);
      return partId;
    }

    completeMap() {
      const p = currentProfile();
      p.stats.bosses += 1;
      p.stats.bestMap = Math.max(p.stats.bestMap, this.mapIndex + 1);
      p.completedMaps = Array.from(new Set([...(p.completedMaps || []), this.mapIndex + 1]));
      p.unlockedMap = Math.max(p.unlockedMap, Math.min(MAPS.length, this.mapIndex + 2));
      p.collection.bosses[MAPS[this.mapIndex].boss] = true;
      const gainedPart = this.grantShipPartUpgrade();
      p.avatarTier = Math.min(7, (p.avatarTier || 1) + 1);
      const unlockByTier = {2:'medula',3:'orbita',4:'fragmento',5:'sombra'};
      if (unlockByTier[p.avatarTier] && !p.unlockedAvatars.includes(unlockByTier[p.avatarTier])) p.unlockedAvatars.push(unlockByTier[p.avatarTier]);
      const mapBonus = 140 + this.mapIndex * 25;
      p.coins += mapBonus;
      p.stats.totalCoins += mapBonus;
      unlockAchievement('boss_1');
      if (p.unlockedMap >= 3) unlockAchievement('map_3');
      this.toast('Victoria', `${MAPS[this.mapIndex].name} liberado`);
      AudioFX.win();
      setTimeout(() => this.showResult(true), 1700);
    }

    end(victory) {
      this.running = false;
      AudioFX.stopMusic();
      if (!victory) AudioFX.lose();
      this.showResult(victory);
    }

    finalizeRun(victory) {
      if (this.outcomeFinalized) return;
      this.outcomeFinalized = true;
      const p = currentProfile();
      p.coins += this.run.coins;
      p.stats.totalCoins += this.run.coins;
      p.stats.totalKills += this.run.kills;
      p.stats.bestScore = Math.max(p.stats.bestScore, this.run.score);
      p.stats.highestWave = Math.max(p.stats.highestWave, this.wave);
      p.ranking.unshift({ date: new Date().toISOString(), score: this.run.score, map: this.mapIndex + 1, wave: this.wave, avatar: p.avatar, kills: this.run.kills });
      p.ranking = p.ranking.sort((a, b) => b.score - a.score).slice(0, 12);
      if (p.stats.totalKills >= 100) unlockAchievement('kills_100');
      if (this.run.score >= 3000) unlockAchievement('score_3000');
      if (p.coins >= 1000) unlockAchievement('rich_1000');
      if ((p.unlockedAvatars || []).length >= 3) unlockAchievement('avatar_3');
      p.lastSave = null;
      saveState();
    }

    reviveRun() {
      if (this.extraLives <= 0) return false;
      this.extraLives -= 1;
      this.player.hp = this.player.maxHp * .58;
      this.player.shield = this.player.maxShield * .42;
      this.enemies = this.enemies.filter(e => e.boss);
      this.bullets = this.bullets.filter(b => !b.enemy);
      this.zones = [];
      this.flash = .8;
      this.toast('Segunda oportunidad', `Vidas extra restantes: ${this.extraLives}`);
      this.paused = false;
      this.running = true;
      hideOverlays();
      AudioFX.music(this.mapIndex, !!this.bossActive, MAPS[this.mapIndex]?.family || 'zombie', this.bossActive?.phase || 1);
      requestAnimationFrame(t => { this.last = t; this.loop(t); });
      return true;
    }

    showResult(victory) {
      this.paused = true;
      this.resultMode = victory ? 'victory' : (this.extraLives > 0 ? 'defeat_revive' : 'defeat');
      if (victory) this.finalizeRun(true);
      els.resultEyebrow.textContent = victory ? '✔' : '☠';
      els.resultTitle.textContent = victory ? `${MAPS[this.mapIndex].icon} Nivel ${this.mapIndex + 1}` : 'Horda';
      els.resultText.textContent = victory ? `${MAPS[this.mapIndex].boss} · pieza de nave desbloqueada` : (this.extraLives > 0 ? `❤️‍🩹 ${this.extraLives} disponible` : 'reiniciar');
      els.resultRewards.innerHTML = `
        <span class="reward-pill">⭐ ${this.run.score}</span>
        <span class="reward-pill">🪙 ${this.run.coins}</span>
        <span class="reward-pill">🧟 ${this.run.kills}</span>
        <span class="reward-pill">🌊 ${this.wave}</span>
        <span class="reward-pill">❤️‍🩹 ${this.extraLives}</span>`;
      els.btnResultContinue.textContent = victory ? 'Seguir' : (this.extraLives > 0 ? 'Revive' : 'Reiniciar');
      els.btnResultHome.textContent = '🏠';
      els.resultOverlay.classList.remove('hidden');
      renderAll();
    }

    saveRun() {
      const p = currentProfile();
      p.lastSave = {
        savedAt: new Date().toISOString(),
        mapIndex: this.mapIndex,
        wave: this.wave,
        player: { x: this.player.x, y: this.player.y, hp: this.player.hp, shield: this.player.shield, xp: this.player.xp, level: this.player.level, xpNext: this.player.xpNext },
        powerLevels: this.powerLevels,
        fusions: this.fusions,
        run: this.run,
        extraLives: this.extraLives,
        nextLifeScore: this.nextLifeScore
      };
      saveState();
      this.toast('Partida guardada', `${MAPS[this.mapIndex].name} · oleada ${this.wave}`);
    }

    togglePause(force) {
      if (!this.running) return;
      this.paused = typeof force === 'boolean' ? force : !this.paused;
      if (this.paused) {
        this.updatePauseStats();
        els.pauseOverlay.classList.remove('hidden');
      } else {
        els.pauseOverlay.classList.add('hidden');
      }
    }

    updatePauseStats() {
      els.pauseStats.innerHTML = `
        <div><strong>${MAPS[this.mapIndex].name}</strong><small class="muted">Mapa actual</small></div>
        <div><strong>Oleada ${this.wave}</strong><small class="muted">Progreso</small></div>
        <div><strong>${this.run.kills}</strong><small class="muted">Zombies vencidos</small></div>
        <div><strong>${Object.keys(this.powerLevels).length}</strong><small class="muted">Poderes activos</small></div>`;
    }

    updateHud() {
      if (!this.player || !els.hudHp) return;
      els.hudHp.textContent = Math.max(0, Math.round(this.player.hp));
      els.hudShield.textContent = Math.max(0, Math.round(this.player.shield));
      els.hudWave.textContent = this.wave;
      els.hudMap.textContent = this.mapIndex + 1;
      els.hudScore.textContent = this.run.score;
      els.hudCoins.textContent = this.run.coins;
      if (els.hudLives) els.hudLives.textContent = this.extraLives;
      els.xpFill.style.width = `${clamp(this.player.xp / this.player.xpNext * 100, 0, 100)}%`;
      els.xpLabel.textContent = `Nivel ${this.player.level}`;
      this.updatePendingBadge();
      const activePowers = Object.entries(this.powerActivity || {}).sort((a, b) => b[1] - a[1]);
      const visibleLimit = this.isSmallScreen ? 5 : 8;
      const visible = activePowers.slice(0, visibleLimit);
      const overflow = Math.max(0, activePowers.length - visible.length);
      els.powerDock.innerHTML = visible.map(([id, secs]) => {
        const pow = POWERS.find(p => p.id === id);
        const time = Math.max(1, Math.ceil(secs));
        return `<div class="power-chip active-power" title="${pow?.name || id} · ${time}s activas">${pow?.icon || '✦'}<small>${time}</small></div>`;
      }).join('') + (overflow ? `<div class="power-chip overflow" title="${overflow} poderes activos más">+${overflow}</div>` : '');
    }

    updatePendingBadge() {
      if (!els.pendingBadge || !els.pendingBadgeCount) return;
      const count = (this.offerActive ? 1 : 0) + (this.pendingLevelChoices || 0);
      els.pendingBadgeCount.textContent = count;
      els.pendingBadge.classList.toggle('hidden', count <= 0);
      els.pendingBadge.title = count > 0 ? `Mejoras pendientes: ${count}` : 'Sin mejoras pendientes';
      els.pendingBadge.classList.toggle('pulse', count > 0);
    }

    toast(title, text = '') {
      if (!els.toastStack) return;
      const key = `${title}|${text}`;
      const now = performance.now();
      if (this.lastToastKey === key && (now - (this.lastToastAt || 0)) < 900) return;
      this.lastToastKey = key;
      this.lastToastAt = now;
      while (els.toastStack.children.length >= 2) els.toastStack.firstElementChild?.remove();
      const div = document.createElement('div');
      div.className = 'toast micro';
      const shortText = String(text || '').slice(0, 26);
      div.innerHTML = `<strong>${title}</strong>${shortText ? `<small>${shortText}</small>` : ''}`;
      els.toastStack.appendChild(div);
      setTimeout(() => div.remove(), 1450);
    }

    emit(x, y, color = '#61ffc8', count = 4, speed = 80, life = .4, type = 'dot') {
      const limit = this.maxParticles || 360;
      if (this.particles.length > limit) this.particles.splice(0, this.particles.length - limit);
      if (state.settings.reducedMotion) count = Math.min(3, count);
      if (state.settings.lowPerformance) count = Math.min(4, count);
      if (this.isSmallScreen) count = Math.min(count, 10);
      for (let i = 0; i < count; i++) {
        const a = rand(Math.PI * 2);
        const s = rand(speed, speed * .15);
        this.particles.push({ type, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(4, 1.5), life: rand(life, life * .55), max: life, color });
      }
    }

    render(dt) {
      const ctx = this.ctx;
      const map = MAPS[this.mapIndex];
      const [bg, mid, accent] = map.theme;
      ctx.save();
      ctx.clearRect(0, 0, this.w, this.h);
      if (this.shake > 0 && state.settings.shake && !state.settings.reducedMotion) ctx.translate(rand(this.shake, -this.shake), rand(this.shake, -this.shake));
      const grd = ctx.createRadialGradient(this.w * .5, this.h * .36, 0, this.w * .5, this.h * .45, this.w * .8);
      grd.addColorStop(0, mid);
      grd.addColorStop(.48, bg);
      grd.addColorStop(1, '#020807');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, this.w, this.h);
      this.drawMapAtmosphere(ctx, map, dt);
      this.drawMeteors(ctx);
      this.drawZones(ctx);
      this.drawPickups(ctx);
      this.drawBullets(ctx);
      this.drawEnemies(ctx);
      this.drawDrones(ctx);
      this.drawPlayer(ctx);
      this.drawParticles(ctx);
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${this.flash * .08})`;
        ctx.fillRect(0, 0, this.w, this.h);
      }
      ctx.restore();
    }

    drawMapAtmosphere(ctx, map) {
      const t = now() * .001;
      ctx.save();
      ctx.globalAlpha = .25;
      ctx.strokeStyle = map.theme[2];
      ctx.lineWidth = 1;
      const gap = 86;
      for (let x = (t * 12) % gap - gap; x < this.w + gap; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + Math.sin(t + x * .01) * 22, this.h);
        ctx.stroke();
      }
      ctx.globalAlpha = .1;
      for (let y = 0; y < this.h; y += 72) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(t + y * .04) * 16);
        ctx.lineTo(this.w, y + Math.cos(t + y * .02) * 16);
        ctx.stroke();
      }
      // Biblioteca cósmica modular por nivel: capas ligeras para fondo vivo sin saturar memoria.
      const familyColors = {
        zombie: ['rgba(114,255,199,.12)','rgba(255,213,106,.08)','rgba(97,255,200,.18)'],
        bacteria: ['rgba(152,255,241,.14)','rgba(143,214,255,.09)','rgba(191,255,111,.16)'],
        demon: ['rgba(255,139,99,.16)','rgba(255,213,106,.08)','rgba(255,86,63,.18)'],
        witch: ['rgba(195,145,255,.16)','rgba(245,255,255,.08)','rgba(255,154,226,.15)'],
        spirit: ['rgba(159,227,255,.15)','rgba(255,255,255,.08)','rgba(143,214,255,.14)'],
        disease: ['rgba(191,255,111,.14)','rgba(255,255,255,.07)','rgba(152,255,120,.15)'],
        mythic: ['rgba(255,154,226,.15)','rgba(143,214,255,.08)','rgba(255,213,106,.13)']
      };
      const deco = familyColors[map.family] || ['rgba(97,255,200,.12)','rgba(255,255,255,.08)','rgba(131,234,255,.13)'];
      const orbitShift = (map.variant || 1) * 37 + this.mapIndex * 11;
      const richBg = !state.settings.lowPerformance && this.w > 520;
      const cosmicType = this.mapIndex % 10;

      // Capa 1: vacío cósmico / materia oscura insinuada.
      if (richBg && (cosmicType === 2 || cosmicType === 7 || map.family === 'spirit')) {
        const vx = this.w * (.18 + ((this.mapIndex * .13) % .6));
        const vy = this.h * (.28 + ((map.variant * .11) % .42));
        const vg = ctx.createRadialGradient(vx, vy, 0, vx, vy, Math.max(this.w, this.h) * .42);
        vg.addColorStop(0, 'rgba(0,0,0,.34)');
        vg.addColorStop(.52, 'rgba(0,0,0,.10)');
        vg.addColorStop(1, 'transparent');
        ctx.globalAlpha = .8; ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(vx, vy, Math.max(this.w, this.h) * .42, 0, Math.PI * 2); ctx.fill();
      }

      // Capa 2: filamentos cósmicos / supercúmulos.
      ctx.globalAlpha = richBg ? .12 : .07;
      ctx.strokeStyle = deco[2]; ctx.lineWidth = 1;
      const filamentCount = richBg ? 3 : 1;
      for (let f = 0; f < filamentCount; f++) {
        const y0 = ((f * 197 + orbitShift * 2) % Math.max(300, this.h));
        ctx.beginPath();
        ctx.moveTo(-40, y0);
        ctx.bezierCurveTo(this.w * .25, y0 + Math.sin(t*.16 + f) * 80, this.w * .65, y0 - 90 + Math.cos(t*.11 + f) * 70, this.w + 50, y0 + Math.sin(f + t*.09) * 50);
        ctx.stroke();
        if (richBg) {
          for (let n = 0; n < 8; n++) {
            const px = ((n * 137 + f * 83 + orbitShift * 3) % (this.w + 120)) - 60;
            const py = y0 + Math.sin(n + t*.25 + f) * 38;
            ctx.globalAlpha = .08; ctx.fillStyle = n % 2 ? '#dffcff' : map.theme[2];
            ctx.beginPath(); ctx.arc(px, py, 1.2 + (n % 3), 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      // Capa 3: nebulosa o nube de gas dominante.
      const nebulaX = this.w * (.14 + ((map.variant * .13 + this.mapIndex*.03) % .66));
      const nebulaY = this.h * (.18 + ((map.variant * .07 + this.mapIndex*.02) % .48));
      const nebulaR = richBg ? 150 + (map.variant % 4) * 42 : 95;
      const nbg = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, nebulaR);
      nbg.addColorStop(0, deco[0]);
      nbg.addColorStop(.44, deco[1]);
      nbg.addColorStop(1, 'transparent');
      ctx.globalAlpha = richBg ? .95 : .45; ctx.fillStyle = nbg; ctx.beginPath(); ctx.arc(nebulaX, nebulaY, nebulaR, 0, Math.PI * 2); ctx.fill();

      // Capa 4: galaxia / cúmulo / constelación según nivel.
      if (richBg && cosmicType % 3 === 0) {
        const gx = this.w * (.28 + ((map.variant * .17) % .42));
        const gy = this.h * (.16 + ((map.variant * .09) % .22));
        ctx.globalAlpha = .13; ctx.strokeStyle = deco[1]; ctx.lineWidth = 1.4;
        for (let arm = 0; arm < 3; arm++) {
          ctx.beginPath();
          for (let s = 0; s < 46; s++) {
            const a = arm * Math.PI * 2/3 + s * .22 + t * .018;
            const r = 5 + s * 1.25;
            const px = gx + Math.cos(a) * r;
            const py = gy + Math.sin(a) * r * .56;
            if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      } else if (richBg && cosmicType % 3 === 1) {
        ctx.globalAlpha = .14;
        for (let c = 0; c < 18; c++) {
          const cx = (Math.sin(c*1.7 + orbitShift) * .5 + .5) * this.w;
          const cy = (Math.cos(c*2.2 + orbitShift) * .5 + .5) * this.h * .68;
          ctx.fillStyle = c % 4 === 0 ? '#ffd56a' : '#dffcff';
          ctx.beginPath(); ctx.arc(cx, cy, 1.1 + (c % 3), 0, Math.PI * 2); ctx.fill();
        }
      } else if (richBg) {
        ctx.globalAlpha = .18; ctx.strokeStyle = 'rgba(223,252,255,.28)'; ctx.lineWidth = 1;
        let last = null;
        for (let c = 0; c < 7; c++) {
          const cx = this.w * (.12 + ((c*.13 + map.variant*.07) % .72));
          const cy = this.h * (.12 + ((Math.sin(c + orbitShift)*.5+.5) * .38));
          ctx.fillStyle = c % 2 ? '#dffcff' : map.theme[2];
          ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, Math.PI * 2); ctx.fill();
          if (last) { ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(cx, cy); ctx.stroke(); }
          last = {x: cx, y: cy};
        }
      }

      // Capa 5: planeta / sistema planetario / anillos / lunas.
      const planetX = this.w * (.72 + Math.sin(t * .05 + orbitShift) * .04);
      const planetY = this.h * (.18 + ((map.variant % 4) * .12));
      const planetR = 18 + ((map.variant + this.mapIndex) % 4) * 8;
      const pg = ctx.createRadialGradient(planetX - planetR*.28, planetY - planetR*.35, 0, planetX, planetY, planetR * 1.35);
      pg.addColorStop(0, 'rgba(255,255,255,.25)'); pg.addColorStop(.45, map.theme[2]); pg.addColorStop(1, 'rgba(0,0,0,.16)');
      ctx.globalAlpha = .24; ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.17)'; ctx.lineWidth = 1.1; ctx.stroke();
      if ((map.variant + this.mapIndex) % 2 === 0) {
        ctx.globalAlpha = .18; ctx.strokeStyle = 'rgba(255,213,106,.55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(planetX, planetY, planetR * 1.72, planetR * .5, -.18, 0, Math.PI * 2); ctx.stroke();
      }
      if (richBg) {
        for (let moon = 0; moon < 2; moon++) {
          const ma = t*.18 + moon*Math.PI + orbitShift;
          ctx.globalAlpha = .16; ctx.fillStyle = '#dffcff';
          ctx.beginPath(); ctx.arc(planetX + Math.cos(ma)*planetR*2.4, planetY + Math.sin(ma)*planetR*1.1, 3 + moon, 0, Math.PI*2); ctx.fill();
        }
      }

      // Capa 6: soles, estrellas moribundas, púlsares, supernovas / hipernovas sugeridas.
      const sunX = this.w * (.84 - ((map.variant * .07) % .18));
      const sunY = this.h * (.1 + ((this.mapIndex % 3) * .1));
      const sunR = 9 + (map.variant % 4) * 4;
      const gSun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4.2);
      const hot = map.family === 'demon' || cosmicType === 8;
      gSun.addColorStop(0, hot ? 'rgba(255,210,168,.62)' : 'rgba(255,244,181,.55)');
      gSun.addColorStop(.45, hot ? 'rgba(255,92,72,.24)' : 'rgba(255,166,92,.20)');
      gSun.addColorStop(1, 'transparent');
      ctx.globalAlpha = .72; ctx.fillStyle = gSun; ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .3; ctx.fillStyle = hot ? '#ff8b63' : '#ffd56a'; ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
      if (cosmicType === 4 || map.family === 'spirit') {
        ctx.globalAlpha = .16; ctx.strokeStyle = '#9fd6ff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sunX - sunR*5, sunY); ctx.lineTo(sunX + sunR*5, sunY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sunX, sunY - sunR*5); ctx.lineTo(sunX, sunY + sunR*5); ctx.stroke();
      }
      if (cosmicType === 5) {
        ctx.globalAlpha = .12; ctx.strokeStyle = '#ffd56a';
        for (let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(sunX, sunY, sunR*1.7 + i*8 + Math.sin(t+i)*2, 0, Math.PI*2); ctx.stroke(); }
      }

      // Capa 7: agujero negro, disco de acreción, cuásar y lentes gravitacionales.
      if (richBg && (cosmicType === 6 || cosmicType === 9 || map.family === 'mythic')) {
        const bx = this.w * (.55 + Math.sin(t * .015 + orbitShift) * .03);
        const by = this.h * (.76 - ((map.variant % 3) * .08));
        ctx.globalAlpha = .35; ctx.fillStyle = 'rgba(2,4,7,.92)'; ctx.beginPath(); ctx.arc(bx, by, 15, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = .18; ctx.strokeStyle = deco[0]; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by, 34, 10, .18, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = .1; ctx.strokeStyle = '#9fd6ff'; ctx.beginPath(); ctx.moveTo(bx + 13, by - 4); ctx.lineTo(bx + 82, by - 18); ctx.stroke();
        ctx.globalAlpha = .08; ctx.beginPath(); ctx.arc(bx, by, 54, .2, Math.PI*1.22); ctx.stroke();
      }

      // Capa 8: objetos menores, escombros, estaciones y naves perdidas.
      if (richBg && this.mapIndex >= 3) {
        ctx.globalAlpha = .14; ctx.strokeStyle = 'rgba(223,252,255,.26)'; ctx.fillStyle = 'rgba(223,252,255,.08)'; ctx.lineWidth = 1;
        const debrisCount = Math.min(9, 3 + Math.floor(this.mapIndex/3));
        for (let d=0; d<debrisCount; d++) {
          const dx = ((d*181 + orbitShift*7) % (this.w + 100)) - 50;
          const dy = ((d*97 + orbitShift*3) % (this.h + 80)) - 40;
          ctx.save(); ctx.translate(dx, dy); ctx.rotate(Math.sin(t*.12+d)*.8);
          if (d % 4 === 0) { ctx.strokeRect(-10,-4,20,8); ctx.beginPath(); ctx.moveTo(-16,0); ctx.lineTo(-26,-5); ctx.moveTo(16,0); ctx.lineTo(26,5); ctx.stroke(); }
          else if (d % 3 === 0) { ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(8,6); ctx.lineTo(-7,5); ctx.closePath(); ctx.stroke(); }
          else { ctx.beginPath(); ctx.arc(0,0,2+(d%4),0,Math.PI*2); ctx.fill(); }
          ctx.restore();
        }
      }

      // Capa 9: portales cósmicos y fracturas espaciales por familia.
      if (richBg && (map.family === 'witch' || map.family === 'demon' || map.family === 'mythic')) {
        const px = this.w * (.12 + ((this.mapIndex * .19) % .72));
        const py = this.h * (.68 - ((map.variant * .04) % .22));
        ctx.globalAlpha = .16; ctx.strokeStyle = map.family === 'demon' ? '#ff8b63' : '#c391ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(px, py, 26 + Math.sin(t)*3, 9, t*.12, 0, Math.PI*2); ctx.stroke();
        ctx.globalAlpha = .1; ctx.beginPath(); ctx.moveTo(px-38, py+18); ctx.lineTo(px+20, py-32); ctx.lineTo(px+34, py-10); ctx.stroke();
      }

      // Capa 10: estrellas, polvo cósmico, radiación de fondo y campos magnéticos.
      ctx.globalAlpha = .18;
      const starCount = richBg ? 24 : 10;
      for (let i = 0; i < starCount; i++) {
        const sx = (Math.sin(t * .03 + i * 1.7 + orbitShift) * .5 + .5) * this.w;
        const sy = (Math.cos(t * .025 + i * 2.3 + orbitShift) * .5 + .5) * this.h;
        const sr = 0.7 + (i % 3) * .65;
        ctx.fillStyle = i % 5 === 0 ? '#ffd56a' : '#dffcff';
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
        if (i % 7 === 0) { ctx.globalAlpha = .07; ctx.fillStyle = deco[1]; ctx.beginPath(); ctx.arc(sx, sy, sr * 5.2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .18; }
      }
      if (richBg && cosmicType === 1) {
        ctx.globalAlpha = .08; ctx.strokeStyle = deco[2]; ctx.lineWidth = 1;
        for (let m = 0; m < 3; m++) { ctx.beginPath(); ctx.arc(this.w*.5, this.h*.5, 90 + m*46 + Math.sin(t+m)*4, Math.PI*.1, Math.PI*1.1); ctx.stroke(); }
      }
      if (this.mapIndex === 0) {
        ctx.globalAlpha = .09;
        ctx.fillStyle = map.theme[2];
        for (let i = 0; i < 10; i++) {
          const x = ((i * 173 + Math.sin(t * .4 + i) * 28) % (this.w + 140)) - 70;
          const h = 70 + (i % 4) * 36;
          ctx.fillRect(x, this.h - h - 24, 18 + (i % 3) * 12, h);
        }
        ctx.globalAlpha = .20;
        ctx.strokeStyle = '#ffd56a';
        for (let i = 0; i < 6; i++) {
          const x = ((i * 211 + t * 45) % (this.w + 180)) - 90;
          const y = 60 + (i % 4) * 72;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 42, y - 24); ctx.stroke();
        }
        ctx.globalAlpha = .16;
        for (let i = 0; i < 18; i++) {
          const x = (Math.sin(t * .35 + i * 2.1) * .5 + .5) * this.w;
          const y = (Math.cos(t * .28 + i) * .5 + .5) * this.h;
          ctx.beginPath(); ctx.arc(x, y, 1.6 + (i % 3), 0, Math.PI * 2); ctx.fill();
        }
      }
      if (map.id === 'niebla' || map.id === 'nucleo') {
        ctx.globalAlpha = .11;
        for (let i = 0; i < 12; i++) {
          const x = (Math.sin(t * .2 + i) * .5 + .5) * this.w;
          const y = (Math.cos(t * .17 + i * 2) * .5 + .5) * this.h;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 180);
          g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 180, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }


    drawMeteors(ctx) {
      if (!this.meteors) return;
      for (const m of this.meteors) {
        ctx.save();
        const angle = Math.atan2(m.vy, m.vx);
        ctx.translate(m.x, m.y);
        ctx.rotate(angle);
        ctx.globalAlpha = .72;
        ctx.shadowBlur = 12;
        ctx.shadowColor = m.kind === 'planet' ? '#9fd4ff' : (m.kind === 'bomb' ? '#ff4e4e' : '#ff8b32');
        const tail = Math.max(34, m.r * (m.kind === 'planet' ? 1.05 : 3.2));
        ctx.fillStyle = m.kind === 'planet' ? 'rgba(159,212,255,.18)' : (m.kind === 'bomb' ? 'rgba(255,78,78,.30)' : 'rgba(255,116,38,.34)');
        ctx.beginPath();
        ctx.moveTo(-tail, -m.r * .42);
        ctx.lineTo(0, -m.r * .78);
        ctx.lineTo(m.r * .8, 0);
        ctx.lineTo(0, m.r * .78);
        ctx.closePath();
        ctx.fill();
        ctx.rotate(now() * .002 + (m.spin || 0));
        ctx.globalAlpha = .88;
        ctx.fillStyle = m.kind === 'planet' ? 'rgba(130,190,255,.82)' : (m.kind === 'bomb' ? 'rgba(255,75,75,.88)' : 'rgba(255,132,52,.82)');
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 / 8) * i;
          const rr = m.r * (0.78 + ((i % 3) * .09));
          const x = Math.cos(a) * rr;
          const y = Math.sin(a) * rr;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = m.kind === 'planet' ? 'rgba(230,248,255,.70)' : 'rgba(255,230,150,.55)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }
    }

    drawZones(ctx) {
      for (const z of this.zones) {
        const a = clamp(z.life / z.max, 0, 1);
        ctx.save();
        ctx.globalAlpha = .24 * a;
        ctx.fillStyle = z.type === 'toxic' ? '#b7ff69' : z.type === 'slow' ? '#83eaff' : '#61ffc8';
        ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = .65 * a;
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }
    }

    drawPickups(ctx) {
      for (const it of this.pickups) {
        ctx.save();
        const pulse = 1 + Math.sin((now() + (it.born || 0)) * .006) * .08;
        const alpha = clamp(it.life / (it.maxLife || 20), .22, 1);
        ctx.globalAlpha = alpha;
        ctx.translate(it.x, it.y);
        ctx.scale(pulse, pulse);
        ctx.shadowBlur = it.type === 'power' ? 28 : 18;
        ctx.shadowColor = it.color;
        ctx.fillStyle = 'rgba(255,255,255,.05)';
        ctx.strokeStyle = it.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, it.r + 7, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .55;
        ctx.beginPath(); ctx.arc(0, 0, it.r + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(it.life / (it.maxLife || 20), 0, 1)); ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.font = `${Math.max(18, it.r * 1.7)}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(it.icon || '🎁', 0, 1);
        if (it.type === 'power') {
          ctx.globalAlpha = alpha * .24;
          ctx.beginPath(); ctx.arc(0, 0, it.r + 15, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      }
    }

    drawBullets(ctx) {
      for (const b of this.bullets) {
        if (b.type === 'laser') continue;
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        if (b.type === 'torpedo' || b.type === 'kamikaze') {
          const ang = Math.atan2(b.vy, b.vx);
          ctx.translate(b.x, b.y);
          ctx.rotate(ang);
          ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, 6); ctx.lineTo(-3,0); ctx.lineTo(-8,-6); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = .28; ctx.fillRect(-14,-2,10,4);
        } else {
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = .34;
          ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .035, b.y - b.vy * .035); ctx.lineWidth = b.r * 1.2; ctx.strokeStyle = b.color; ctx.stroke();
        }
        ctx.restore();
      }
      for (const pt of this.particles.filter(p => p.type === 'laser')) {
        ctx.save();
        ctx.globalAlpha = clamp(pt.life / pt.max, 0, 1) * .75;
        ctx.strokeStyle = pt.color; ctx.shadowBlur = 22; ctx.shadowColor = pt.color; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pt.x + Math.cos(pt.a) * 620, pt.y + Math.sin(pt.a) * 620); ctx.stroke();
        ctx.restore();
      }
    }

    drawEnemies(ctx) {
      for (const e of this.enemies) {
        if (e.trail?.length) {
          ctx.save();
          for (const tr of e.trail) {
            const a = clamp(tr.life / .32, 0, 1);
            ctx.globalAlpha = a * (e.id === 'mosquito' || e.behavior === 'mirror' ? .34 : .24);
            ctx.fillStyle = tr.color || e.color;
            ctx.beginPath(); ctx.arc(tr.x, tr.y, (tr.r || e.r) * 1.3, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        }
        ctx.save();
        const hp = clamp(e.hp / e.baseHp, 0, 1);
        const wob = Math.sin(e.t * (e.boss ? 2 : 5)) * (e.boss ? 4 : 2);
        ctx.translate(e.x, e.y);
        ctx.rotate(wob * .018);
        ctx.shadowBlur = e.boss ? 34 : 14;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = e.boss ? (e.alpha ?? 1) : (e.behavior === 'sombra' ? .76 : 1);
        if (e.boss) {
          const sides = ({spider:8,tick:7,rat:6,scorpion:10,leech:5,puffer:11,wasp:9,centipede:12,roach:8,chimera:13})[e.beast] || 9;
          this.drawPolygon(ctx, 0, 0, e.r + Math.sin(e.t * 3) * 3, sides, true);
          ctx.globalAlpha = .18 + (e.alpha ?? 1) * .12; this.drawPolygon(ctx, 0, 0, e.r * 1.45, sides, false);
          if ((e.alpha ?? 1) < .7) { ctx.globalAlpha = .12; this.drawPolygon(ctx, 0, 0, e.r * 1.72, sides, false); }
          ctx.globalAlpha = .45 + (e.alpha ?? 1) * .2;
          for (let j=0;j<Math.min(8,sides);j++) { const a = (Math.PI*2/sides)*j + e.t*.4; ctx.beginPath(); ctx.moveTo(Math.cos(a)*e.r*.45, Math.sin(a)*e.r*.45); ctx.lineTo(Math.cos(a)*(e.r*1.35), Math.sin(a)*(e.r*1.35)); ctx.stroke(); }
        } else if (e.behavior === 'mirror') this.drawEnemyShip(ctx, e);
        else if (e.id === 'mosquito') {
          ctx.beginPath(); ctx.moveTo(0,-e.r*1.2); ctx.lineTo(e.r*.55, e.r*.55); ctx.lineTo(0,e.r*.22); ctx.lineTo(-e.r*.55,e.r*.55); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = .55;
          ctx.beginPath(); ctx.ellipse(-e.r*.75, -e.r*.25, e.r*.75, e.r*.35, -.4, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(e.r*.75, -e.r*.25, e.r*.75, e.r*.35, .4, 0, Math.PI*2); ctx.fill();
        } else if (e.id === 'larva') {
          ctx.beginPath(); ctx.ellipse(0, 0, e.r * 1.25, e.r * .68, Math.sin(e.t*4)*.28, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = .38; for (let k=-1;k<=1;k++) { ctx.beginPath(); ctx.arc(k*e.r*.45, Math.sin(e.t*6+k)*2, e.r*.18, 0, Math.PI*2); ctx.stroke(); }
        } else if (e.id === 'errante') this.drawCrawlerEnemy(ctx, e);
        else if (e.behavior === 'blindado') { this.drawPolygon(ctx, 0, 0, e.r, 6, true); ctx.globalAlpha=.24; this.drawPolygon(ctx,0,0,e.r*.62,6,false); }
        else if (e.id === 'corredor') this.drawDasherEnemy(ctx, e);
        else if (e.behavior === 'explosive') { this.drawPolygon(ctx, 0, 0, e.r, 8, true); ctx.globalAlpha=.32; ctx.beginPath();ctx.arc(0,0,e.r*.45,0,Math.PI*2);ctx.stroke(); }
        else if (e.behavior === 'toxic') this.drawToxicEnemy(ctx, e);
        else if (e.behavior === 'splitter') this.drawSplitterEnemy(ctx, e);
        else if (e.behavior === 'buffer') { this.drawPolygon(ctx, 0, 0, e.r, 7, true); ctx.globalAlpha=.28; this.drawPolygon(ctx, 0, 0, e.r*1.25, 7, false); }
        else if (e.behavior === 'sombra' || e.behavior === 'mist') { this.drawPolygon(ctx, 0, 0, e.r, 5, true); ctx.globalAlpha=.22; this.drawPolygon(ctx, 0, 0, e.r*1.3, 5, false); }
        else { this.drawCrawlerEnemy(ctx, e); }
        ctx.globalAlpha = .9;
        ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-e.r * .35, -e.r * .2); ctx.lineTo(-e.r * .1, -e.r * .06); ctx.moveTo(e.r * .35, -e.r * .2); ctx.lineTo(e.r * .1, -e.r * .06); ctx.stroke();
        ctx.globalAlpha = .85;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-e.r, e.r + 8, e.r * 2, 4);
        ctx.fillStyle = e.boss ? '#ff6b73' : '#61ffc8'; ctx.fillRect(-e.r, e.r + 8, e.r * 2 * hp, 4);
        ctx.restore();
      }
    }



    drawCrawlerEnemy(ctx, e) {
      const s = 1 + Math.sin(e.t * 8) * .08;
      ctx.scale(1, s);
      ctx.beginPath();
      ctx.moveTo(0, -e.r);
      ctx.bezierCurveTo(e.r*.72, -e.r*.78, e.r*1.05, -e.r*.05, e.r*.78, e.r*.62);
      ctx.bezierCurveTo(e.r*.28, e.r*.98, -e.r*.28, e.r*.98, -e.r*.78, e.r*.62);
      ctx.bezierCurveTo(-e.r*1.05, -e.r*.05, -e.r*.72, -e.r*.78, 0, -e.r);
      ctx.fill();
      ctx.globalAlpha = .42;
      for (let i=-1;i<=1;i+=2) {
        ctx.beginPath(); ctx.moveTo(i*e.r*.22, -e.r*.1); ctx.lineTo(i*e.r*1.05, -e.r*.48 + Math.sin(e.t*10)*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i*e.r*.18, e.r*.15); ctx.lineTo(i*e.r*1.1, e.r*.56 + Math.cos(e.t*9)*2); ctx.stroke();
      }
    }

    drawDasherEnemy(ctx, e) {
      ctx.beginPath();
      ctx.moveTo(0, -e.r*1.2);
      ctx.lineTo(e.r*.86, -e.r*.05);
      ctx.lineTo(e.r*.22, e.r*1.05);
      ctx.lineTo(0, e.r*.62);
      ctx.lineTo(-e.r*.22, e.r*1.05);
      ctx.lineTo(-e.r*.86, -e.r*.05);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha=.35;
      ctx.beginPath(); ctx.moveTo(-e.r*.7, e.r*.18); ctx.lineTo(-e.r*1.25, e.r*.76); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(e.r*.7, e.r*.18); ctx.lineTo(e.r*1.25, e.r*.76); ctx.stroke();
    }

    drawToxicEnemy(ctx, e) {
      for (let i=0;i<4;i++){ const a=(Math.PI*2/4)*i+e.t; ctx.beginPath(); ctx.arc(Math.cos(a)*e.r*.33,Math.sin(a)*e.r*.28,e.r*.42,0,Math.PI*2);ctx.fill(); }
      ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(0,0,e.r*1.32,0,Math.PI*2);ctx.stroke();
    }

    drawSplitterEnemy(ctx, e) {
      for (let i=0;i<3;i++){ const a=(Math.PI*2/3)*i-Math.PI/2+Math.sin(e.t*2)*.12; ctx.beginPath(); ctx.arc(Math.cos(a)*e.r*.36,Math.sin(a)*e.r*.3,e.r*.47,0,Math.PI*2);ctx.fill(); }
    }

    drawEnemyShip(ctx, e) {
      ctx.save();
      ctx.rotate(Math.sin(e.t * 2.5) * .12);
      ctx.shadowBlur = 24;
      ctx.shadowColor = e.color;
      ctx.strokeStyle = e.color;
      ctx.fillStyle = e.color;
      ctx.lineWidth = 2.6;
      ctx.globalAlpha = .18;
      ctx.beginPath(); ctx.arc(0, 0, e.r + 12, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = .94;
      ctx.beginPath();
      ctx.moveTo(0, -e.r - 4);
      ctx.lineTo(e.r * .7, e.r * .25);
      ctx.lineTo(e.r * .25, e.r * .85);
      ctx.lineTo(0, e.r * .46);
      ctx.lineTo(-e.r * .25, e.r * .85);
      ctx.lineTo(-e.r * .7, e.r * .25);
      ctx.closePath();
      ctx.globalAlpha = .22; ctx.fill();
      ctx.globalAlpha = .95; ctx.stroke();
      ctx.globalAlpha = .8;
      ctx.fillStyle = '#fff2f7';
      ctx.beginPath(); ctx.arc(0, -e.r*.18, e.r*.22, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }

    drawPolygon(ctx, x, y, r, sides, fill = true) {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + (Math.PI * 2 / sides) * i;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      fill ? ctx.fill() : ctx.stroke();
    }

    drawDrones(ctx) {
      for (const d of this.drones) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.a);
        ctx.shadowBlur = 18; ctx.shadowColor = d.color || '#9ac7ff';
        ctx.strokeStyle = d.color || '#9ac7ff'; ctx.lineWidth = d.support ? 3.4 : 3;
        if (d.support) { ctx.beginPath(); ctx.moveTo(0,-11); ctx.lineTo(10,9); ctx.lineTo(-10,9); ctx.closePath(); ctx.stroke(); } else { ctx.strokeRect(-9, -9, 18, 18); }
        ctx.restore();
      }
    }

    drawPlayer(ctx) {
      const p = this.player;
      if (!p) return;
      const t = now() * .001;
      const parts = p.shipParts || { core: 0, wings: 0, cannon: 0, engine: 0 };
      const wing = parts.wings || 0;
      const cannon = parts.cannon || 0;
      const core = parts.core || 0;
      const engine = parts.engine || 0;
      ctx.save();
      ctx.translate(p.x, p.y);
      const color = p.avatar.color;
      const ang = Math.atan2(this.pointer.y - p.y, this.pointer.x - p.x);
      ctx.rotate(ang + Math.PI / 2);
      ctx.shadowBlur = 28;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.8;

      // outer aura
      if (p.bossDrive > 0) {
        ctx.globalAlpha = .18 + Math.sin(t * 12) * .04;
        ctx.strokeStyle = '#ffd56a'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(0, 0, p.r + 15 + Math.sin(t * 6) * 1.6, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = color; ctx.lineWidth = 2.8;
      }
      ctx.globalAlpha = .12;
      ctx.beginPath(); ctx.arc(0, 0, p.r + 18 + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.stroke();
      if (p.shield > 5) {
        ctx.globalAlpha = .22 + .16 * (p.shield / p.maxShield);
        ctx.strokeStyle = '#83eaff'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(0, 0, p.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (p.shield / p.maxShield)); ctx.stroke();
        ctx.strokeStyle = color;
      }

      // engines
      if (engine > 0) {
        ctx.globalAlpha = .34;
        for (let i = -1; i <= 1; i += 2) {
          const ex = i * (4 + wing * 1.8);
          ctx.beginPath();
          ctx.moveTo(ex, p.r * .65);
          ctx.lineTo(ex - 3, p.r + 6 + engine * 1.8 + Math.sin(t * 10 + i) * 2);
          ctx.lineTo(ex + 3, p.r + 6 + engine * 1.8 + Math.sin(t * 10 + i) * 2);
          ctx.closePath(); ctx.fillStyle = '#83eaff'; ctx.fill();
        }
        ctx.fillStyle = color;
      }

      // wings / side fins
      ctx.globalAlpha = .78;
      const wingSpan = p.r + 3 + wing * 2.4;
      const wingBack = p.r * .2 + wing * 1.1;
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * 4, -2);
        ctx.lineTo(i * wingSpan, wingBack);
        ctx.lineTo(i * (7 + wing * 1.4), p.r * .45);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.08 + wing * 0.02})`;
        ctx.fill();
        ctx.stroke();
      }

      // central hull
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(0, -p.r - 4);
      ctx.lineTo(p.r * .55, -p.r * .1);
      ctx.lineTo(p.r * .42, p.r * .7 + core * .25);
      ctx.lineTo(0, p.r * .35 + core * .5);
      ctx.lineTo(-p.r * .42, p.r * .7 + core * .25);
      ctx.lineTo(-p.r * .55, -p.r * .1);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = .18; ctx.fill();
      ctx.globalAlpha = .95; ctx.stroke();

      // inner cockpit/core
      ctx.globalAlpha = .85;
      ctx.fillStyle = '#eafff8';
      ctx.beginPath();
      ctx.moveTo(0, -p.r * .55);
      ctx.lineTo(p.r * .18, -1);
      ctx.lineTo(0, p.r * .18 + core * .3);
      ctx.lineTo(-p.r * .18, -1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = color;

      // front cannons
      if (cannon > 0) {
        ctx.globalAlpha = .9;
        const barrels = Math.min(3, 1 + Math.floor(cannon / 2));
        for (let b = 0; b < barrels; b++) {
          const off = (b - (barrels - 1) / 2) * 5;
          ctx.fillRect(off - 1.2, -p.r - 10 - cannon * 1.2, 2.4, 8 + cannon * .8);
        }
      }

      // dorsal armor / modules by core tier
      if (core > 0) {
        ctx.globalAlpha = .32;
        for (let i = 0; i < Math.min(3, core); i++) {
          const y = -p.r * .18 + i * 5;
          ctx.beginPath();
          ctx.moveTo(-4, y); ctx.lineTo(0, y - 3.2); ctx.lineTo(4, y); ctx.lineTo(0, y + 2.4); ctx.closePath(); ctx.stroke();
        }
      }

      // satellites for high morph tier
      const tier = p.morphTier || 1;
      if (tier > 3) {
        ctx.globalAlpha = .22;
        for (let i = 0; i < Math.min(4, tier - 2); i++) {
          const a = (Math.PI * 2 / Math.min(4, tier - 2)) * i + t;
          ctx.beginPath(); ctx.arc(Math.cos(a) * (p.r + 11), Math.sin(a) * (p.r + 11), 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }

    drawParticles(ctx) {
      for (const pt of this.particles) {
        if (pt.type === 'laser') continue;
        ctx.save();
        const a = clamp(pt.life / (pt.max || .4), 0, 1);
        ctx.globalAlpha = pt.type === 'ring' ? a * .75 : a;
        ctx.strokeStyle = pt.color;
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = pt.color;
        if (pt.type === 'ring') {
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.stroke();
        } else if (pt.type === 'mist') {
          ctx.globalAlpha = a * .12;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * 8, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  const game = new Game();

  function rarityName(r) {
    return ({ common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario', anomalous: 'Anómalo' })[r] || 'Común';
  }

  function showScreen(id) {
    updateViewportVars();
    document.body.classList.toggle('game-mode', id === 'screenGame');
    document.body.dataset.screen = id;
    document.querySelectorAll('.screen').forEach(s => {
      const active = s.id === id;
      s.classList.toggle('active', active);
      s.style.display = active ? 'block' : 'none';
      s.style.visibility = active ? 'visible' : 'hidden';
      s.style.pointerEvents = active ? 'auto' : 'none';
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (id === 'screenGame') {
      updateViewportVars();
      setTimeout(() => { updateViewportVars(); game.resize(); }, 40);
    } else {
      AudioFX.stopMusic();
      renderAll();
      window.scrollTo?.(0, 0);
    }
  }

  function hideOverlays() {
    ['cardOverlay', 'pauseOverlay', 'resultOverlay'].forEach(id => els[id]?.classList.add('hidden'));
    els.bossBar.classList.add('hidden');
  }

  function unlockAchievement(id) {
    const p = currentProfile();
    if (p.achievements[id]) return false;
    p.achievements[id] = new Date().toISOString();
    saveState();
    if (els.toastStack) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach && game.running) game.toast('Logro desbloqueado', `${ach.icon} ${ach.name}`);
    }
    return true;
  }


  function findOrCreateProfileByName(nameRaw) {
    const name = (nameRaw || 'Jugador').trim().slice(0, 18) || 'Jugador';
    let profile = state.profiles.find(p => (p.name || '').toLowerCase() === name.toLowerCase());
    if (!profile) {
      profile = DEFAULT_STATE().profiles[0];
      profile.id = 'p_' + Date.now();
      profile.name = name;
      state.profiles.push(profile);
    } else {
      profile.name = name;
    }
    state.activeProfileId = profile.id;
    localStorage.setItem('rzs_last_player_name', name);
    saveState();
    return profile;
  }

  function renderSavedGamesList() {
    if (!els.savedGamesList) return;
    const rows = state.profiles.slice().sort((a,b) => (b.stats?.bestScore || 0) - (a.stats?.bestScore || 0));
    els.savedGamesList.innerHTML = rows.map(p => {
      const hasSave = !!p.lastSave;
      const level = hasSave ? (p.lastSave.mapIndex + 1) : (p.unlockedMap || 1);
      const wave = hasSave ? ` · oleada ${p.lastSave.wave}` : '';
      return `<button class="saved-game-row" data-load-profile="${p.id}">
        <span><b>${p.name || 'Jugador'}</b><small>Nivel ${level}${wave} · récord ${p.stats?.bestScore || 0}</small></span>
        <strong>${hasSave ? 'Continuar' : 'Nueva'}</strong>
      </button>`;
    }).join('') || '<small class="muted">No hay partidas guardadas todavía.</small>';
    els.savedGamesList.querySelectorAll('[data-load-profile]').forEach(btn => btn.addEventListener('click', () => {
      const p = state.profiles.find(x => x.id === btn.dataset.loadProfile);
      if (!p) return;
      state.activeProfileId = p.id;
      localStorage.setItem('rzs_last_player_name', p.name || 'Jugador');
      saveState(); renderAll();
      if (p.lastSave) game.start(p.lastSave.mapIndex, p.lastSave);
      else game.start(Math.max(0, (p.unlockedMap || 1) - 1));
    }));
  }

  function renderHome() {
    const p = currentProfile();
    if (els.profileNameLabel) els.profileNameLabel.textContent = p.name || 'Jugador';
    if (els.playerNameInput) els.playerNameInput.value = localStorage.getItem('rzs_last_player_name') || p.name || '';
    if (els.startGreeting) els.startGreeting.textContent = p.name ? `Hola, ${p.name}. Entra o carga una partida guardada.` : 'Escribe tu nombre para entrar.';
    if (els.homeBestScore) els.homeBestScore.textContent = p.stats.bestScore || 0;
    if (els.homeCoins) els.homeCoins.textContent = p.coins || 0;
    if (els.homeMap) els.homeMap.textContent = p.unlockedMap || 1;
    if (els.homeAchievements) els.homeAchievements.textContent = Object.keys(p.achievements || {}).length;
    const avatar = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
    const parts = p.shipParts || {};
    if (els.portalAvatarOrb) {
      els.portalAvatarOrb.title = `Motor ${parts.engine || 0} · Alerones ${parts.wings || 0} · Cañón ${parts.cannon || 0} · Núcleo ${parts.core || 0}`;
      els.portalAvatarOrb.innerHTML = `<span style="color:${avatar.color}">${avatar.icon}</span>`;
    }
    if (els.btnContinue) {
      els.btnContinue.disabled = false;
      els.btnContinue.textContent = '▾ Cargar partida';
      els.btnContinue.classList.remove('primary-btn', 'neon');
      els.btnContinue.classList.add('soft-btn');
    }
    if (els.simpleStartHint) {
      const score = p.stats?.bestScore || 0;
      const map = p.unlockedMap || 1;
      els.simpleStartHint.textContent = `${p.name || 'Jugador'} · récord ${score} · nivel ${map}/${MAPS.length}`;
    }
    document.body.classList.toggle('reduced-motion', !!state.settings.reducedMotion);
    document.body.classList.toggle('low-performance', !!state.settings.lowPerformance);
    renderSavedGamesList();
  }

  function renderProfiles() {
    els.profileList.innerHTML = state.profiles.map(p => `
      <div class="list-item">
        <div><b>${p.name}</b><small>Récord ${p.stats.bestScore || 0} · mapa ${p.unlockedMap || 1}</small></div>
        <div>
          <button class="soft-btn small" data-profile="${p.id}">Usar</button>
          ${state.profiles.length > 1 ? `<button class="danger-btn small" data-delete-profile="${p.id}">Borrar</button>` : ''}
        </div>
      </div>`).join('');
    els.profileList.querySelectorAll('[data-profile]').forEach(b => b.addEventListener('click', () => { state.activeProfileId = b.dataset.profile; saveState(); renderAll(); showScreen('screenPortal'); }));
    els.profileList.querySelectorAll('[data-delete-profile]').forEach(b => b.addEventListener('click', () => {
      const prof = state.profiles.find(p => p.id === b.dataset.deleteProfile);
      if (!confirm(`¿Borrar el perfil "${prof.name}"? Esta acción no se puede deshacer.`)) return;
      state.profiles = state.profiles.filter(p => p.id !== b.dataset.deleteProfile);
      if (state.activeProfileId === b.dataset.deleteProfile) state.activeProfileId = state.profiles[0].id;
      saveState(); renderAll();
    }));
  }

  function renderAvatars() {
    const p = currentProfile();
    els.avatarGrid.innerHTML = AVATARS.map((a, idx) => {
      const unlocked = p.unlockedAvatars.includes(a.id) || idx < 3;
      const cost = 320 + idx * 180;
      return `<article class="select-card ${p.avatar === a.id ? 'active' : ''} ${unlocked ? '' : 'locked'}">
        <div class="avatar-symbol" style="color:${a.color}">${a.icon}</div>
        <h3>${a.name}</h3>
        <p class="muted">${a.desc}</p>
        <span class="tag">${a.passive}</span>
        <footer class="mt">
          ${unlocked ? `<button class="primary-btn small" data-avatar="${a.id}">${p.avatar === a.id ? 'Activo' : 'Elegir'}</button>` : `<button class="soft-btn small" data-buy-avatar="${a.id}" data-cost="${cost}">Desbloquear · 🪙 ${cost}</button>`}
        </footer>
      </article>`;
    }).join('');
    els.avatarGrid.querySelectorAll('[data-avatar]').forEach(b => b.addEventListener('click', () => { p.avatar = b.dataset.avatar; saveState(); renderAll(); }));
    els.avatarGrid.querySelectorAll('[data-buy-avatar]').forEach(b => b.addEventListener('click', () => {
      const cost = Number(b.dataset.cost);
      if (p.coins < cost) return alert('No tienes suficientes fragmentos todavía.');
      p.coins -= cost;
      p.unlockedAvatars.push(b.dataset.buyAvatar);
      p.avatar = b.dataset.buyAvatar;
      saveState(); renderAll();
    }));
  }

  function renderHangarDetail(partId = 'engine') {
    const p = currentProfile();
    const parts = { core: 0, wings: 0, cannon: 0, engine: 0, ...(p.shipParts || {}) };
    const info = HANGAR_PART_INFO[partId];
    const meta = SHIP_PARTS_META[partId];
    const lvl = parts[partId] || 0;
    els.hangarDetail.innerHTML = `<div class="hangar-detail-card"><b>${meta.icon} ${meta.name}</b><span class="tag">Nivel ${lvl}/6</span><p class="muted">${info.bonus}</p></div>`;
    els.hangarPartsGrid.querySelectorAll('[data-part]').forEach(card => card.classList.toggle('active', card.dataset.part === partId));
  }

  function renderHangar() {
    const p = currentProfile();
    const avatar = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
    const parts = { core: 0, wings: 0, cannon: 0, engine: 0, ...(p.shipParts || {}) };
    const total = Object.values(parts).reduce((a,b)=>a+b,0);
    const tierName = total >= 20 ? 'Nave Omega' : total >= 14 ? 'Nave de asalto' : total >= 8 ? 'Interceptor mutante' : total >= 3 ? 'Célula táctica' : 'Nave base';
    els.hangarTierLabel.textContent = `Tier ${p.avatarTier || 1}`;
    els.hangarShipName.textContent = tierName;
    els.hangarShipSummary.textContent = `Módulos ${total}/24 · mundo ${p.unlockedMap}/${MAPS.length} · 🪙 ${p.coins || 0}`;
    const speedBonus = parts.engine * 10 + parts.wings * 6;
    const attackBonus = parts.cannon * 2.5;
    const defenseBonus = parts.core * 8;
    const shieldBonus = parts.core * 6;
    els.hangarShipPreview.innerHTML = `
      <div class="hangar-ship aura" style="--accent:${avatar.color}">
        <div class="ship-body"></div><div class="ship-core l${parts.core}"></div><div class="ship-cannon l${parts.cannon}"></div>
        <div class="ship-wing left l${parts.wings}"></div><div class="ship-wing right l${parts.wings}"></div>
        <div class="ship-engine left l${parts.engine}"></div><div class="ship-engine right l${parts.engine}"></div><div class="ship-pilot">${avatar.icon}</div>
      </div>
      <div class="hangar-callouts"><div class="hangar-callout cannon"><strong>✦ Cañón ${parts.cannon}</strong>+${attackBonus.toFixed(1)} daño</div><div class="hangar-callout wings"><strong>◀▶ Alerones ${parts.wings}</strong>+${parts.wings*6} control</div><div class="hangar-callout core"><strong>⬢ Núcleo ${parts.core}</strong>+${defenseBonus} vida</div><div class="hangar-callout engine"><strong>≋ Motor ${parts.engine}</strong>+${speedBonus} velocidad</div></div>
      <div class="hangar-statline"><span class="tag">⚡ +${speedBonus}</span><span class="tag">💥 +${attackBonus.toFixed(1)}</span><span class="tag">❤️ +${defenseBonus}</span><span class="tag">🛡️ +${shieldBonus}</span><span class="tag coin">🪙 ${p.coins || 0}</span></div>`;
    const order = ['engine','wings','cannon','core'];
    els.hangarPartsGrid.innerHTML = order.map(id => {
      const meta = SHIP_PARTS_META[id]; const lvl = parts[id] || 0;
      return `<article class="hangar-part-card" data-part="${id}"><div class="hangar-part-head"><span>${meta.icon}</span><b>${meta.name}</b></div><div class="level-dots big">${Array.from({length:6},(_,i)=>`<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div><small class="muted">Nivel ${lvl}/6</small></article>`;
    }).join('');
    els.hangarHistory.innerHTML = '';
    els.hangarPartsGrid.querySelectorAll('[data-part]').forEach(card => card.addEventListener('click', () => { const p = currentProfile(); p.hangarFocus = card.dataset.part; saveState(); renderHangarDetail(card.dataset.part); }));
    renderHangarDetail((p.hangarFocus && HANGAR_PART_INFO[p.hangarFocus]) ? p.hangarFocus : 'engine');
  }

  function renderMaps() {
    const p = currentProfile();
    els.mapRoad.innerHTML = MAPS.map((m, i) => {
      const unlocked = i + 1 <= p.unlockedMap;
      const complete = p.completedMaps.includes(i + 1);
      return `<article class="map-node ${unlocked ? '' : 'locked'} ${complete ? 'complete' : ''}">
        <div class="map-badge">${m.icon}</div>
        <p class="eyebrow">Nivel ${i + 1}</p>
        <h3>${m.name}</h3>
        <p class="muted">${m.lore}</p>
        <span class="tag">${m.icon} ${m.boss}</span>
        <footer class="mt">
          <button class="${unlocked ? 'primary-btn' : 'soft-btn'} small" data-start-map="${i}" ${unlocked ? '' : 'disabled'}>${unlocked ? 'Iniciar aquí' : 'Bloqueado'}</button>
        </footer>
      </article>`;
    }).join('');
    els.mapRoad.querySelectorAll('[data-start-map]').forEach(b => b.addEventListener('click', () => game.start(Number(b.dataset.startMap))));
  }

  function renderShop() {
    const p = currentProfile();
    els.shopCoinsLabel.textContent = `Fragmentos: ${p.coins || 0}`;
    els.shopGrid.innerHTML = SHOP.map(item => {
      const lvl = p.upgrades[item.id] || 0;
      const cost = item.base + item.step * lvl;
      const canBuy = lvl < item.max && (p.coins || 0) >= cost;
      return `<article class="shop-card ${canBuy ? 'can-buy' : ''}">
        <div class="avatar-symbol ${canBuy ? 'pulse-lite' : ''}">${item.icon}</div>
        <h3>${item.name}</h3>
        <p class="muted">${item.desc}</p>
        <div class="level-dots">${Array.from({ length: item.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>
        <footer><span class="tag ${canBuy ? 'affordable-tag' : ''}">Nivel ${lvl}/${item.max}</span><button class="${lvl >= item.max ? 'soft-btn' : 'primary-btn'} small ${canBuy ? 'pulse-lite' : ''}" data-upgrade="${item.id}" ${lvl >= item.max ? 'disabled' : ''}>${lvl >= item.max ? 'Máximo' : `🪙 ${cost}`}</button></footer>
      </article>`;
    }).join('');
    els.shopGrid.querySelectorAll('[data-upgrade]').forEach(b => b.addEventListener('click', () => {
      const item = SHOP.find(x => x.id === b.dataset.upgrade);
      const lvl = p.upgrades[item.id] || 0;
      const cost = item.base + item.step * lvl;
      if (lvl >= item.max) return;
      if (p.coins < cost) return alert('No tienes suficientes fragmentos para esta mejora.');
      p.coins -= cost;
      p.upgrades[item.id] = lvl + 1;
      saveState(); renderAll();
    }));
  }

  function renderRanking() {
    const all = state.profiles.flatMap(p => (p.ranking || []).map(r => ({ ...r, player: p.name })));
    const rows = all.sort((a, b) => b.score - a.score).slice(0, 20);
    els.rankingList.innerHTML = rows.length ? rows.map((r, i) => {
      const avatar = AVATARS.find(a => a.id === r.avatar) || AVATARS[0];
      return `<div class="rank-row"><div class="rank-no">${i + 1}</div><div><b>${avatar.icon} ${r.player}</b><small class="muted">Mapa ${r.map} · oleada ${r.wave} · ${r.kills} zombies</small></div><strong>${r.score}</strong></div>`;
    }).join('') : '<p class="muted">Todavía no hay partidas registradas. Inicia una misión para crear el ranking local.</p>';
  }

  function renderAchievements() {
    const p = currentProfile();
    els.achievementGrid.innerHTML = ACHIEVEMENTS.map(a => {
      const ok = !!p.achievements[a.id];
      return `<article class="achievement-card ${ok ? 'unlocked' : 'locked'}">
        <div class="avatar-symbol">${a.icon}</div>
        <p class="eyebrow">${a.group}</p>
        <h3>${a.name}</h3>
        <p class="muted">${a.desc}</p>
        <span class="tag">${ok ? 'Desbloqueado' : 'Pendiente'}</span>
      </article>`;
    }).join('');
  }

  function renderCollection() {
    const p = currentProfile();
    const powerCount = Object.keys(p.collection.powers || {}).length;
    const fusionCount = Object.keys(p.collection.fusions || {}).length;
    const bossCount = Object.keys(p.collection.bosses || {}).length;
    const avatarCount = (p.unlockedAvatars || []).length;
    const items = [
      ['🧬', 'Avatares', `${avatarCount}/${AVATARS.length}`, 'Formas desbloqueadas del jugador.'],
      ['✦', 'Poderes', `${powerCount}/${POWERS.length}`, 'Cartas usadas en partida.'],
      ['✷', 'Fusiones', `${fusionCount}/${FUSIONS.length}`, 'Combinaciones descubiertas.'],
      ['👑', 'Jefes', `${bossCount}/${MAPS.length}`, 'Jefes vencidos por territorio.'],
      ['🗺️', 'Mapas', `${(p.completedMaps || []).length}/${MAPS.length}`, 'Territorios liberados.'],
      ['🎖️', 'Logros', `${Object.keys(p.achievements || {}).length}/${ACHIEVEMENTS.length}`, 'Premios conseguidos.']
    ];
    els.collectionGrid.innerHTML = items.map(([icon, name, count, desc]) => `<article class="collection-card"><div class="avatar-symbol">${icon}</div><h3>${name}</h3><strong>${count}</strong><p class="muted">${desc}</p></article>`).join('');
  }

  function renderSettings() {
    els.toggleSound.checked = !!state.settings.sound;
    els.toggleMusic.checked = !!state.settings.music;
    els.toggleShake.checked = !!state.settings.shake;
    els.toggleReduced.checked = !!state.settings.reducedMotion;
    if (els.toggleLowPerformance) els.toggleLowPerformance.checked = !!state.settings.lowPerformance;
  }

  function renderAll() {
    renderHome(); renderProfiles(); renderAvatars(); renderHangar(); renderMaps(); renderShop(); renderRanking(); renderAchievements(); renderCollection(); renderSettings();
  }

  function exportRanking() {
    const payload = {
      app: 'Rizoma Zombie Strike: Niebla Verde',
      version: VERSION,
      exportedAt: new Date().toISOString(),
      ranking: state.profiles.flatMap(p => (p.ranking || []).map(r => ({ player: p.name, ...r }))).sort((a,b)=>b.score-a.score),
      profiles: state.profiles.map(p => ({ name: p.name, bestScore: p.stats?.bestScore || 0, unlockedMap: p.unlockedMap || 1, bosses: p.stats?.bosses || 0, totalKills: p.stats?.totalKills || 0 }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rizoma_zombie_strike_ranking_v${VERSION}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function buildAIPrompt() {
    const p = currentProfile();
    const ranking = (p.ranking || []).slice(0, 5);
    const snapshot = {
      jugador: p.name,
      version: VERSION,
      mapa_desbloqueado: p.unlockedMap,
      monedas: p.coins,
      mejores_partidas: ranking,
      estadisticas: p.stats,
      nave: p.shipParts,
      logros: Object.keys(p.achievements || {}).length,
      jefes_vencidos: Object.keys(p.collection?.bosses || {}).length
    };
    return `Actúa como analista senior de diseño de juegos roguelite/bullet-heaven. Analiza este snapshot local de Rizoma Zombie Strike y propón mejoras de balance, dificultad, recompensas, retención ética y UX móvil sin inventar datos externos. Devuelve: diagnóstico, problemas probables, mejoras críticas, mejoras de alto valor y ajustes de dificultad para los primeros 3 niveles. Snapshot JSON:
${JSON.stringify(snapshot, null, 2)}`;
  }

  async function copyAIPrompt() {
    const prompt = buildAIPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      alert('Prompt de análisis copiado. Pégalo en tu IA externa.');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = prompt;
      document.body.appendChild(area);
      area.select(); document.execCommand('copy'); area.remove();
      alert('Prompt copiado.');
    }
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rizoma_zombie_strike_backup_v${VERSION}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        state = migrateState(imported);
        saveState();
        renderAll();
        alert('Backup importado correctamente.');
      } catch (e) {
        alert('No se pudo importar el backup. Revisa que sea un JSON válido del juego.');
      }
    };
    reader.readAsText(file);
  }

  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (els.btnInstallPWA) els.btnInstallPWA.classList.remove('hidden');
  });

  async function installPWA() {
    if (!deferredInstallPrompt) {
      alert('Si tu navegador lo permite, usa “Agregar a pantalla de inicio” desde el menú.');
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    if (els.btnInstallPWA) els.btnInstallPWA.classList.add('hidden');
  }

  function wire() {
    document.querySelectorAll('[data-screen]').forEach(b => b.addEventListener('click', () => showScreen(b.dataset.screen)));
    els.btnHome.addEventListener('click', () => showScreen('screenPortal'));
    els.btnSettings.addEventListener('click', () => els.settingsDrawer.classList.remove('hidden'));
    els.btnCloseSettings.addEventListener('click', () => els.settingsDrawer.classList.add('hidden'));
    els.btnManageProfiles?.addEventListener('click', () => showScreen('screenProfiles'));
    els.btnSaveProfileName.addEventListener('click', () => {
      const p = findOrCreateProfileByName(els.playerNameInput.value || 'Jugador');
      renderAll();
      game.start(Math.max(0, (p.unlockedMap || 1) - 1));
    });
    els.playerNameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') els.btnSaveProfileName.click(); });
    els.btnCreateProfile.addEventListener('click', () => {
      const name = (els.newProfileName.value || 'Jugador').trim().slice(0, 18);
      const profile = DEFAULT_STATE().profiles[0];
      profile.id = 'p_' + Date.now();
      profile.name = name;
      state.profiles.push(profile);
      state.activeProfileId = profile.id;
      els.newProfileName.value = '';
      saveState(); renderAll(); showScreen('screenPortal');
    });
    els.btnNewRun?.addEventListener('click', () => game.start(Math.max(0, (currentProfile().unlockedMap || 1) - 1)));
    els.btnContinue?.addEventListener('click', () => {
      if (!els.savedGamesList) return;
      els.savedGamesList.classList.toggle('hidden');
      renderSavedGamesList();
    });
    els.btnPause.addEventListener('click', () => game.togglePause());
    els.pendingBadge?.addEventListener('click', () => { if ((game.pendingLevelChoices || game.offerActive) && !game.paused) game.showCards(); });
    els.btnResume.addEventListener('click', () => game.togglePause(false));
    els.btnSaveRun.addEventListener('click', () => { game.saveRun(); game.updatePauseStats(); });
    els.btnPauseShop.addEventListener('click', () => { game.saveRun(); showScreen('screenShop'); });
    els.btnRestartMap.addEventListener('click', () => { if (confirm('¿Reiniciar este mapa desde cero?')) game.start(game.mapIndex); });
    els.btnExitRun.addEventListener('click', () => { game.saveRun(); game.running = false; AudioFX.stopMusic(); hideOverlays(); showScreen('screenPortal'); });
    els.btnResultContinue.addEventListener('click', () => {
      if (game.resultMode === 'victory') {
        hideOverlays();
        if (game.run.mapComplete && game.mapIndex + 1 < MAPS.length) game.start(game.mapIndex + 1);
        else showScreen('screenPortal');
      } else if (game.resultMode === 'defeat_revive') {
        game.reviveRun();
      } else {
        game.finalizeRun(false);
        hideOverlays();
        game.start(game.mapIndex);
      }
    });
    els.btnResultHangar?.addEventListener('click', () => { hideOverlays(); showScreen('screenHangar'); });
    els.btnResultHome.addEventListener('click', () => {
      if (game.resultMode === 'defeat_revive') {
        game.finalizeRun(false);
        hideOverlays();
        game.start(game.mapIndex);
      } else {
        if (game.resultMode !== 'victory') game.finalizeRun(false);
        hideOverlays();
        showScreen('screenPortal');
      }
    });

    ['toggleSound', 'toggleMusic', 'toggleShake', 'toggleReduced', 'toggleLowPerformance'].forEach(id => {
      els[id].addEventListener('change', () => {
        state.settings.sound = els.toggleSound.checked;
        state.settings.music = els.toggleMusic.checked;
        state.settings.shake = els.toggleShake.checked;
        state.settings.reducedMotion = els.toggleReduced.checked;
        state.settings.lowPerformance = !!els.toggleLowPerformance?.checked;
        game.applyPerformanceMode?.();
        if (!state.settings.music) AudioFX.stopMusic();
        saveState(); renderAll();
      });
    });
    els.btnExportBackup.addEventListener('click', exportBackup);
    els.btnExportRanking?.addEventListener('click', exportRanking);
    els.btnExportRankingSettings?.addEventListener('click', exportRanking);
    els.btnCopyAIPrompt?.addEventListener('click', copyAIPrompt);
    els.btnInstallPWA?.addEventListener('click', installPWA);
    els.backupInput.addEventListener('change', e => importBackup(e.target.files[0]));
    els.btnResetData.addEventListener('click', () => {
      if (!confirm('¿Borrar todos los perfiles, rankings, logros y partidas guardadas?')) return;
      localStorage.removeItem(STORAGE_KEY);
      state = DEFAULT_STATE();
      saveState();
      renderAll();
      showScreen('screenPortal');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEls();
    game.init(els.gameCanvas);
    wire();
    renderAll();
    showScreen('screenPortal');
    saveState();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
    }
  });
})();

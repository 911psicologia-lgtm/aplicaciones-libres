(() => {
  'use strict';

  const VERSION = '1.8.6';
  const STORAGE_KEY = 'rizoma_zombie_strike_v0_3_state';
  const SAVE_KEY = 'rizoma_zombie_strike_v0_3_save';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a = 1, b = 0) => Math.random() * (a - b) + b;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const now = () => performance.now();

  const DIFFICULTY_MODES = {
    normal: { id:'normal', name:'Normal', target:1, waveDuration:1, enemyHp:1, enemySpeed:1, incomingDamage:1, bossHp:1, bossShield:1, bossCadence:1, hordePace:1, hazardPace:1, eventPace:1, score:1, xp:1, coins:1, dropChance:1, powerDuration:1, powerEffect:1, hordeRewardBonus:0 },
    hard: { id:'hard', name:'Difícil', target:1.12, waveDuration:1.10, enemyHp:1.18, enemySpeed:1.07, incomingDamage:1.08, bossHp:1.18, bossShield:1.12, bossCadence:.92, hordePace:1.28, hazardPace:1.20, eventPace:1.10, score:1.28, xp:1.24, coins:1.22, dropChance:1.32, powerDuration:1.08, powerEffect:1.05, hordeRewardBonus:1 }
  };

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
    return ['zombie_1','bacteria_1','demon_1','witch_1','spirit_1'].map(id => maps.find(m => m.id === id)).filter(Boolean);
  })();

  const BOSS2 = [
    { world:1, sigil:'assets/boss2/sigil_w1.svg', short:'Núcleo Meteórico', intro:'FIRMA MINERAL', weapon:'Fragmentos orbitales', special:'Lluvia orbital', color:'#ff9a43', accent:'#ffd476', shot:'meteor', music:{bpm:118, root:55, wave:'sawtooth', seq:[0,0,7,3,0,10,7,3]} },
    { world:2, sigil:'assets/boss2/sigil_w2.svg', short:'Matriz de Convergencia', intro:'FIRMA BIOMECÁNICA', weapon:'Esporas convergentes', special:'Neblina infecciosa', color:'#c86dff', accent:'#f0ceff', shot:'spore', music:{bpm:108, root:58.27, wave:'triangle', seq:[0,3,0,6,2,0,5,1]} },
    { world:3, sigil:'assets/boss2/sigil_w3.svg', short:'Corazón Ígneo', intro:'FIRMA VIRIDIANA', weapon:'Rayos voltaicos', special:'Tormenta del reactor', color:'#61ff9c', accent:'#d8ffb2', shot:'volt', music:{bpm:132, root:73.42, wave:'square', seq:[0,7,12,7,3,10,12,15]} },
    { world:4, sigil:'assets/boss2/sigil_w4.svg', short:'Sello Astral', intro:'FIRMA DEL ECLIPSE', weapon:'Cuchillas escarlata', special:'Eclipse escarlata', color:'#ff5347', accent:'#ffba83', shot:'blade', music:{bpm:124, root:61.74, wave:'sawtooth', seq:[0,0,5,7,0,8,7,3]} },
    { world:5, sigil:'assets/boss2/sigil_w5.svg', short:'Fragmento del Vacío', intro:'FIRMA DE SINGULARIDAD', weapon:'Orbes de horizonte', special:'Colapso del horizonte', color:'#c05cff', accent:'#ff6248', shot:'void', music:{bpm:92, root:49, wave:'triangle', seq:[0,-5,0,2,-7,0,5,-2]} }
  ];
  // Mundos 6–10: catálogo preparado, aún no activado en la campaña.
  const FUTURE_BOSS2 = [
    {world:6,id:'magnate_omega',name:'Magnate Omega',title:'Torre de la Necrored',asset:'assets/future/bosses/world6_magnate_omega.png',theme:'Ciudad tecnológica apocalíptica',color:'#ff5b38',accent:'#56c8ff',shot:'necro_laser',weapons:['Drones de asedio','Láseres de torreta','Misiles inteligentes','Campo EMP'],special:{id:'necrogrid_collapse',name:'Colapso de la Necrored',desc:'Torretas orbitales, corredores láser y descarga EMP telegráfica.'},relic:{id:'neural_core',name:'Núcleo Neural',desc:'Mejora apuntado, drones y transición de poderes en cola.',passive:{aimAssist:.08,droneDamage:.10,queueSpeed:.12}},music:{name:'Cyber Assault',bpm:120,root:55,wave:'sawtooth',seq:[0,0,7,3,10,7,5,3],phase4:.72},sound:{shot:[520,.065,'square',.020,-190],special:[65,98,147],impact:[115,.08,'sawtooth',.026,-45]}},
    {world:7,id:'leviatan_abisal',name:'Leviatán Abisal',title:'Señor de las Profundidades',asset:'assets/future/bosses/world7_leviatan_abisal.png',theme:'Mar alienígena',color:'#28d9ff',accent:'#8dffcf',shot:'abyss_plasma',weapons:['Tentáculos de plasma','Medusas explosivas','Cardúmenes espiral','Burbujas gravitacionales'],special:{id:'living_tide',name:'Marea Viva',desc:'Corrientes alienígenas y medusas de plasma con rutas de evasión.'},relic:{id:'abyss_heart',name:'Corazón Abisal',desc:'Refuerza escudo y poderes de control.',passive:{shieldEffect:.09,slowEffect:.10,eliteHeal:.02}},music:{name:'Deep Current',bpm:96,root:43.65,wave:'triangle',seq:[0,5,2,7,-2,3,0,8],phase4:.78},sound:{shot:[330,.10,'sine',.021,-70],special:[49,73.42,110],impact:[82,.12,'triangle',.025,-18]}},
    {world:8,id:'tardigrado_primigenio',name:'Tardígrado Primigenio',title:'Huésped Estelar',asset:'assets/future/bosses/world8_tardigrado_primigenio.png',theme:'Entrañas de monstruo espacial',color:'#ff5d45',accent:'#d54cff',shot:'organic_acid',weapons:['Glóbulos ácidos','Lanzadores orgánicos','Espinas vivas','Engendros parásitos'],special:{id:'mass_gestation',name:'Gestación Masiva',desc:'Cápsulas vivas que eclosionan gradualmente si no se destruyen.'},relic:{id:'organic_genesis',name:'Génesis Orgánica',desc:'Potencia nanorreparación y regeneración.',passive:{regen:.10,nanorepair:.12,bioResist:.10}},music:{name:'Bio Pulse',bpm:112,root:51.91,wave:'triangle',seq:[0,1,5,0,-2,3,7,1],phase4:.74},sound:{shot:[205,.095,'sawtooth',.023,-42],special:[52,77.78,103.83],impact:[138,.10,'triangle',.028,-55]}},
    {world:9,id:'kaiser_infinito',name:'Kaiser Infinito',title:'Guardián de los Portales',asset:'assets/future/bosses/world9_kaiser_infinito.png',theme:'Anime–manga multiversal',color:'#ff3c63',accent:'#8a5cff',shot:'dimensional_slash',weapons:['Clones dimensionales','Katana energética','Shurikens astrales','Lanzas de universo'],special:{id:'multiverse_rupture',name:'Ruptura Multiverso',desc:'Portales alternos encadenan patrones con pausas breves.'},relic:{id:'multiverse_threads',name:'Hilos del Multiverso',desc:'Eco temporal, Fase espectral y combos más duraderos.',passive:{echoShot:.12,phaseDuration:.10,comboDuration:.08}},music:{name:'Kurai Sekai',bpm:138,root:65.41,wave:'square',seq:[0,7,12,10,3,15,12,7],phase4:.68},sound:{shot:[880,.045,'square',.017,-310],special:[73.42,110,164.81],impact:[260,.055,'sawtooth',.024,-120]}},
    {world:10,id:'zeros_prime',name:'Z.E.R.O.S. Prime',title:'Singularidad Andro-Zombie',asset:'assets/future/bosses/world10_zeros_prime.png',theme:'Andro-zombies-galácticos',color:'#ff3232',accent:'#c22cff',shot:'zero_ray',weapons:['Hordas androides','Rayos de desintegración','Núcleos buscadores','Niebla de conversión'],special:{id:'final_singularity',name:'Singularidad Final',desc:'Horizonte de eventos con atracción gradual y fase crítica acelerada.'},relic:{id:'zero_core',name:'Núcleo Zero',desc:'Sincroniza reliquias anteriores y abre progresión posterior.',passive:{relicSynergy:.12,bossDamage:.10,powerReserve:.10}},music:{name:'End of Stars',bpm:92,root:41.20,wave:'sawtooth',seq:[0,-5,0,6,-2,7,3,-7],phase4:.55},sound:{shot:[66,.14,'sawtooth',.028,24],special:[36.71,55,82.41],impact:[72,.16,'square',.030,-20]}}
  ];
  const FUTURE_MINION_ARCHETYPES = {
    6:[{tier:'small',family:'Drones de Ceniza',power:'Micro-láser y desplazamiento lateral coordinado',sound:{shot:[690,.035,'square',.012,-160],death:[170,.06,'sawtooth',.018,-65]}},{tier:'small',family:'Lancetas de Neón',power:'Carga corta que deja línea de energía evitable',sound:{shot:[540,.05,'square',.014,80],death:[145,.065,'triangle',.018,-38]}},{tier:'medium',family:'Centinelas Reactor',power:'Misil inteligente y blindaje frontal breve',sound:{shot:[260,.085,'sawtooth',.018,-75],death:[92,.12,'sawtooth',.024,-34]}}],
    7:[{tier:'small',family:'Medusas Iónicas',power:'Descarga eléctrica encadenable',sound:{shot:[410,.08,'sine',.013,55],death:[230,.09,'sine',.018,-80]}},{tier:'small',family:'Rayas de Coral',power:'Paso rasante curvo y plasma acuoso',sound:{shot:[360,.07,'triangle',.014,-40],death:[190,.08,'triangle',.018,-45]}},{tier:'medium',family:'Crustáceos Abisales',power:'Caparazón temporal y mina gravitacional',sound:{shot:[150,.11,'triangle',.020,18],death:[78,.15,'sine',.025,-12]}}],
    8:[{tier:'small',family:'Esporas Digestivas',power:'Ácido con pequeña expansión al morir',sound:{shot:[245,.07,'sawtooth',.014,-30],death:[135,.095,'triangle',.020,-55]}},{tier:'small',family:'Larvas Hemáticas',power:'Persecución breve y retirada vulnerable',sound:{shot:[315,.055,'triangle',.013,45],death:[165,.085,'sawtooth',.019,-70]}},{tier:'medium',family:'Macrófagos Devoradores',power:'Absorben proyectiles débiles y liberan espinas',sound:{shot:[120,.12,'sawtooth',.022,25],death:[68,.18,'triangle',.028,-18]}}],
    9:[{tier:'small',family:'Shuriken Drones',power:'Tres cortes diagonales rápidos con pausa',sound:{shot:[940,.032,'square',.011,-260],death:[280,.05,'square',.016,-160]}},{tier:'small',family:'Fragmentos Ronin',power:'Dash dimensional con réplica falsa',sound:{shot:[720,.045,'triangle',.013,120],death:[245,.06,'sawtooth',.018,-105]}},{tier:'medium',family:'Mecha Ronin',power:'Katana de arco y shuriken rastreador',sound:{shot:[460,.065,'square',.017,-130],death:[115,.13,'sawtooth',.025,-52]}}],
    10:[{tier:'small',family:'Andro-Carroñeros',power:'Ráfagas de formación y micro-núcleo buscador',sound:{shot:[610,.045,'square',.014,-210],death:[130,.075,'sawtooth',.020,-75]}},{tier:'small',family:'Necroides de Conversión',power:'Niebla que reduce precisión sin degradar velocidad base',sound:{shot:[185,.10,'triangle',.017,22],death:[98,.12,'triangle',.022,-35]}},{tier:'medium',family:'Centuriones Zero',power:'Haz telegráfico y escudo por pulsos',sound:{shot:[92,.13,'sawtooth',.024,50],death:[52,.20,'square',.030,-12]}}]
  };
  const futureBossMeta = world => FUTURE_BOSS2.find(b=>b.world===Number(world)) || FUTURE_BOSS2[0];
  const boss2Meta = index => BOSS2[Math.max(0, Math.min(BOSS2.length - 1, Number(index) || 0))];
  const bossSigilHtml = (index, cls='boss-sigil') => { const m=boss2Meta(index); return `<img class="${cls}" src="${m.sigil}" alt="" aria-hidden="true">`; };

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
    { id: 'elite', icon: '◆', name: 'Cazajefes', desc: 'Más daño general.', max: 4, base: 180, step: 110, apply: p => { p.damage += 4; p.maxShield += 4; } }
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
    { id: 'kamikaze', icon: '✹', name: 'Microdrones kamikazes', rarity: 'epic', desc: 'Drones suicidas interceptan objetivos.', type: 'ally' },
    { id: 'voidray', icon: '⟋', name: 'Rayo de vacío', rarity: 'epic', desc: 'Haz oscuro perforante del Mundo 2.', type: 'weapon' },
    { id: 'gravmine', icon: '◉', name: 'Minas gravíticas', rarity: 'rare', desc: 'Implanta pozos que frenan y dañan.', type: 'control' },
    { id: 'disruptor', icon: '✧', name: 'Pulso disruptor', rarity: 'epic', desc: 'Desintegra proyectiles y sacude enemigos.', type: 'control' },
    { id: 'phantom', icon: '◇', name: 'Escuadrón fantasma', rarity: 'legendary', desc: 'Invoca naves espectro que heredan tu disparo.', type: 'ally' },
    { id: 'plasma', icon: '↻', name: 'Tornado de plasma', rarity: 'legendary', desc: 'Vórtice móvil que atrapa y destruye.', type: 'ultimate' },
    { id: 'afterburner', icon: '»', name: 'Impulsor vectorial', rarity: 'rare', desc: 'Aumenta mucho la velocidad de la nave durante unos segundos.', type: 'mobility' },
    { id: 'stasis', icon: '⌛', name: 'Ralentizador temporal', rarity: 'rare', desc: 'Reduce la velocidad de enemigos y proyectiles hostiles.', type: 'control' },
    { id: 'wingman', icon: '🛸', name: 'Nave auxiliar', rarity: 'epic', desc: 'Invoca una nave aliada durante 12 segundos. Máximo dos simultáneas.', type: 'ally' },
    { id: 'voltaic', icon: '⚡', name: 'Cadena voltaica', rarity: 'epic', desc: 'Una descarga salta entre varios enemigos.', type: 'control' },
    { id: 'overdrive', icon: '✹', name: 'Sobrecarga del reactor', rarity: 'epic', desc: 'Aumenta temporalmente daño y cadencia.', type: 'modifier' },
    { id: 'phase', icon: '👻', name: 'Fase espectral', rarity: 'legendary', desc: 'Reduce mucho el daño recibido durante unos segundos.', type: 'defense' },
    { id: 'nanorepair', icon: '✚', name: 'Nanorreparación', rarity: 'rare', desc: 'Regenera vida progresivamente.', type: 'defense' },
    { id: 'magnetism', icon: '🧲', name: 'Imán gravitacional', rarity: 'rare', desc: 'Atrae premios desde mayor distancia.', type: 'utility' }
  ];

  const POWER_ACTIVE_SECONDS = {
    triple: 10, laser: 10, orbs: 8, pierce: 9, ice: 9, fire: 8, drone: 12, ring: 8,
    bounce: 8, pulse: 6, opem: 6, nuke: 7, spark: 10, torpedo: 6, virus: 7, kamikaze: 6,
    voidray: 12, gravmine: 12, disruptor: 10, phantom: 14, plasma: 10, afterburner: 10, stasis: 10, wingman: 12,
    voltaic: 11, overdrive: 10, phase: 8, nanorepair: 12, magnetism: 12
  };

  const MAX_TOTAL_LIVES = 100;
  const SCORE_LIFE_STEP = 2500;
  const TACTICAL_PURCHASE_LIMITS = [3,5,7,9,10,12,14,16,18,20];
  const WEAPON_POWER_IDS = ['triple', 'laser', 'voidray', 'fire', 'drone', 'torpedo', 'spark', 'kamikaze', 'bounce', 'pulse'];
  const BOSS_LOOT_POWER_IDS = ['fire','virus','plasma','phantom','voidray'];
  const HORDE_SIZE_BANDS = [3, 6, 9];
  const RECOVERY_COMBOS_BY_WORLD = [
    ['tridente','resonante','criotemporal','tormenta','bastion'],
    ['criotemporal','pozo','nulidad','tormenta','bastion'],
    ['tridente','tormenta','criotemporal','enjambre','nulidad'],
    ['bastion','criotemporal','resonante','blackout','nulidad'],
    ['nulidad','pozo','enjambre','tormenta','blackout']
  ];
  const WORLD_ONE_CONFIG = {
    bossWave: 5,
    maxPhase: 5,
    rewardPowers: ['drone', 'laser', 'torpedo', 'spark'],
    waveDurations: [34, 42, 50, 58, 72]
  };
  const WORLD_ONE_ACTS = [
    { id:'orbit', name:'Incursión orbital', cue:'Patrullas biomecánicas', eventEvery:13.5 },
    { id:'meteor', name:'Corredor meteórico', cue:'Rocas y lunas errantes', eventEvery:10.5 },
    { id:'ambush', name:'Emboscada biomecánica', cue:'Formaciones de caza', eventEvery:11.5 },
    { id:'frontier', name:'Frontera rota', cue:'Máquinas pesadas y ruinas', eventEvery:12.5 },
    { id:'prelude', name:'Antesala del apocalipsis', cue:'Tres capitanes abren la arena', eventEvery:16 }
  ];
  const WORLD_TWO_CONFIG = {
    bossWave: 5,
    maxPhase: 5,
    rewardPowers: ['gravmine', 'disruptor', 'phantom', 'plasma'],
    waveDurations: [42, 50, 58, 68, 88]
  };
  const WORLD_TWO_ACTS = [
    { id:'quarantine', name:'Cuarentena exterior', cue:'Los Vorácidos prueban tu perímetro', eventEvery:12.5 },
    { id:'toxic', name:'Nebulosa tóxica', cue:'Formaciones alternas atraviesan el gas', eventEvery:9.4 },
    { id:'rings', name:'Anillos fragmentados', cue:'La gravedad deja de obedecer', eventEvery:10.6 },
    { id:'station', name:'Estación abisal', cue:'Devoradores de Metal cierran el paso', eventEvery:11.8 },
    { id:'convergence', name:'Nexo de convergencia', cue:'Tres prefectos protegen al Patriarca', eventEvery:15.5 }
  ];
  const WORLD_THREE_CONFIG = { bossWave:5, rewardPowers:['voltaic','overdrive','phase','nanorepair'], waveDurations:[44,52,60,68,78] };
  const WORLD_THREE_ACTS = [
    { id:'launch', name:'Corredor viridiano', cue:'La velocidad del vacío despierta', eventEvery:11.8 },
    { id:'vectors', name:'Vectores tóxicos', cue:'Formaciones en V cortan la ruta', eventEvery:9.8 },
    { id:'surge', name:'Tormenta de reactor', cue:'La energía acelera cada encuentro', eventEvery:9.2 },
    { id:'rupture', name:'Ruptura esmeralda', cue:'Cristálidos y Segadores convergen', eventEvery:10.4 },
    { id:'throne', name:'Umbral del Soberano', cue:'La velocidad se comprime antes del jefe', eventEvery:12.5 }
  ];
  const WORLD_FOUR_CONFIG = { bossWave:5, rewardPowers:['magnetism','stasis','wingman','phase'], waveDurations:[48,56,64,72,86] };
  const WORLD_FOUR_ACTS = [
    { id:'smoke', name:'Ruinas orbitales', cue:'Metralla ardiente cae sobre la ciudadela', eventEvery:11.0 },
    { id:'cinder', name:'Lluvia de brasas', cue:'La basura espacial corta la ruta', eventEvery:9.4 },
    { id:'forge', name:'Forja escarlata', cue:'Las alas carmesí ganan velocidad', eventEvery:8.8 },
    { id:'citadel', name:'Murallas del eclipse', cue:'Aparecen guardianes blindados', eventEvery:9.2 },
    { id:'gate', name:'Portal del Arconte', cue:'El cielo se pliega antes del jefe', eventEvery:10.8 }
  ];
  const WORLD_FIVE_CONFIG = { bossWave:5, rewardPowers:['afterburner','plasma','overdrive','nanorepair'], waveDurations:[52,60,68,76,92] };
  const WORLD_FIVE_ACTS = [
    { id:'cave', name:'Galería del núcleo negro', cue:'La caverna vibra con singularidades', eventEvery:10.6 },
    { id:'rift', name:'Falla del vacío', cue:'Meteoros violeta desgarran el túnel', eventEvery:9.0 },
    { id:'hollow', name:'Cámara de estallido', cue:'Los centinelas del vacío rodean la nave', eventEvery:8.4 },
    { id:'abyss', name:'Abismo del reactor', cue:'Aparecen colosos con artillería pesada', eventEvery:8.8 },
    { id:'heart', name:'Corazón del coloso', cue:'El interior del asteroide despierta', eventEvery:10.0 }
  ];
  const WORLD_STAGE_TARGETS = {
    0: [34, 44, 52, 60, 3],
    1: [30, 40, 50, 60, 3],
    2: [28, 36, 44, 52, 36],
    3: [20, 30, 38, 46, 58],
    4: [24, 32, 40, 50, 62]
  };
  const WORLD_ONE_MINION_FAMILIES = [
    ['cazador','corredor','esquivo','mosquito','nave_espejo'],
    ['toxico','sombra','divisor','larva','nucleo'],
    ['blindado','griton','explosivo','errante','nave_espejo']
  ];
  const WORLD_TWO_MINION_FAMILIES = [
    ['vora_aguja','vora_colmillo','vora_cuchilla','vora_salto','vora_alpha'],
    ['void_orbe','void_sifon','void_niebla','void_nodo','void_reactor'],
    ['metal_ariete','metal_tanque','metal_sierra','metal_guardian','metal_mamut']
  ];
  const WORLD_THREE_MINION_FAMILIES = [
    ['w3_viridian_1','w3_viridian_2','w3_viridian_3','w3_viridian_4','w3_viridian_5'],
    ['w3_crystal_1','w3_crystal_2','w3_crystal_3','w3_crystal_4','w3_crystal_5'],
    ['w3_reaper_1','w3_reaper_2','w3_reaper_3','w3_reaper_4','w3_reaper_5']
  ];
  const WORLD_FOUR_MINION_FAMILIES = [
    ['w4_eclipse_1','w4_eclipse_2','w4_eclipse_3'],
    ['w4_eclipse_4','w4_eclipse_5','w4_eclipse_6']
  ];
  const WORLD_FIVE_MINION_FAMILIES = [
    ['w5_void_1','w5_void_2','w5_void_3'],
    ['w5_void_4','w5_void_5','w5_void_6']
  ];
  Object.assign(MAPS[2], { name:'Corredor Viridiano', boss:'Soberano de la Energía Tóxica', specialName:'Sobrecarga viridiana', theme:['#020d0a','#0c2d20','#74ff73'], lore:'El vacío se acelera: cada estrella parece huir de tu nave.' });
  Object.assign(MAPS[3], { name:'Ciudadela Carmesí', boss:'Arconte Mecánico del Eclipse Carmesí', specialName:'Convergencia ígnea', theme:['#120607','#4a1715','#ff6a63'], lore:'La metrópolis industrial arde bajo una lluvia de roca y metal.' });
  Object.assign(MAPS[4], { name:'Caverna del Núcleo Negro', boss:'Coloso Mecánico del Vacío Estelar', specialName:'Singularidad volcánica', theme:['#080710','#2c1b40','#c391ff'], lore:'Dentro del asteroide, la roca viva palpita como un reactor del vacío.' });
  const GAME_ASSET_SOURCES = {
    world1BgOrbit: 'assets/world1/bg_orbit.jpg',
    world1BgStation: 'assets/world1/bg_station.jpg',
    world1BossBg: 'assets/world1/bg_world1_boss.jpg',
    bossBiomech: 'assets/world1/boss_biomech.webp',
    mirrorShip: 'assets/world1/mirror_ship.webp',
    enemyBiomechBlue: 'assets/world1/enemy_biomech_blue.webp',
    enemyToxicCruiser: 'assets/world1/enemy_toxic_cruiser.webp',
    enemySiegeMolten: 'assets/world1/enemy_siege_molten.webp',
    meteorRealistic: 'assets/world1/meteor_realistic.webp',
    planetRinged: 'assets/world1/planet_ringed.webp',
    moonShattered: 'assets/world1/moon_shattered.webp',
    world2BgQuarantine: 'assets/world2/bg_quarantine.webp',
    world2BgRift: 'assets/world2/bg_rift.webp',
    world2BossBg: 'assets/world2/bg_boss.webp',
    world2BgAbyss: 'assets/world2/bg_city_abyss.webp',
    world2BgBattlefield: 'assets/world2/bg_battlefield.webp',
    world2BgFortress: 'assets/world2/bg_vortex_fortress.webp',
    world2BossChaos: 'assets/world2/bg_boss_chaos.webp',
    bossBaciloOmega: 'assets/world2/boss_bacilo_omega_final.png',
    world2Voracid1: 'assets/world2/voracid_1.webp', world2Voracid2: 'assets/world2/voracid_2.webp', world2Voracid3: 'assets/world2/voracid_3.webp', world2Voracid4: 'assets/world2/voracid_4.webp', world2Voracid5: 'assets/world2/voracid_5.webp',
    world2Void1: 'assets/world2/void_1.webp', world2Void2: 'assets/world2/void_2.webp', world2Void3: 'assets/world2/void_3.webp', world2Void4: 'assets/world2/void_4.webp', world2Void5: 'assets/world2/void_5.webp',
    world2Metal1: 'assets/world2/metal_1.webp', world2Metal2: 'assets/world2/metal_2.webp', world2Metal3: 'assets/world2/metal_3.webp', world2Metal4: 'assets/world2/metal_4.webp', world2Metal5: 'assets/world2/metal_5.webp',
    world2Debris1: 'assets/world2/debris_extra_1.webp', world2Debris2: 'assets/world2/debris_extra_2.webp', world2Debris3: 'assets/world2/debris_extra_3.webp', world2Debris4: 'assets/world2/debris_extra_4.webp', world2Debris5: 'assets/world2/debris_extra_5.webp', world2Debris6: 'assets/world2/debris_extra_6.webp', world2Debris7: 'assets/world2/debris_extra_7.webp', world2Debris8: 'assets/world2/debris_extra_8.webp',
    world2Meteor1: 'assets/world2/meteor_extra_1.webp', world2Meteor2: 'assets/world2/meteor_extra_2.webp', world2Meteor3: 'assets/world2/meteor_extra_3.webp', world2Meteor4: 'assets/world2/meteor_extra_4.webp', world2Meteor5: 'assets/world2/meteor_extra_5.webp', world2Meteor6: 'assets/world2/meteor_extra_6.webp', world2Meteor7: 'assets/world2/meteor_extra_7.webp', world2Meteor8: 'assets/world2/meteor_extra_8.webp',
    world3BgSpeed:'assets/world3/bg_world3_speed.webp', world3BossBg:'assets/world3/bg_world3_boss.webp', bossWorld3:'assets/world3/boss_soberano_toxico.png',
    world3Viridian1:'assets/world3/viridian_1.webp', world3Viridian2:'assets/world3/viridian_2.webp', world3Viridian3:'assets/world3/viridian_3.webp', world3Viridian4:'assets/world3/viridian_4.webp', world3Viridian5:'assets/world3/viridian_5.webp',
    world3Crystal1:'assets/world3/crystal_1.webp', world3Crystal2:'assets/world3/crystal_2.webp', world3Crystal3:'assets/world3/crystal_3.webp', world3Crystal4:'assets/world3/crystal_4.webp', world3Crystal5:'assets/world3/crystal_5.webp',
    world3Reaper1:'assets/world3/reaper_1.webp', world3Reaper2:'assets/world3/reaper_2.webp', world3Reaper3:'assets/world3/reaper_3.webp', world3Reaper4:'assets/world3/reaper_4.webp', world3Reaper5:'assets/world3/reaper_5.webp',
    world3Hazard1:'assets/world3/hazard_1.webp',world3Hazard2:'assets/world3/hazard_2.webp',world3Hazard3:'assets/world3/hazard_3.webp',world3Hazard4:'assets/world3/hazard_4.webp',world3Hazard5:'assets/world3/hazard_5.webp',world3Hazard6:'assets/world3/hazard_6.webp',world3Hazard7:'assets/world3/hazard_7.webp',world3Hazard8:'assets/world3/hazard_8.webp',world3Hazard9:'assets/world3/hazard_9.webp',world3Hazard10:'assets/world3/hazard_10.webp',
    world4BgCity:'assets/world4/bg_world4_city.png', world4BossBg:'assets/world4/bg_world4_boss.png', bossWorld4:'assets/world4/boss_world4.png',
    world4Enemy1:'assets/world4/enemy_1.png', world4Enemy2:'assets/world4/enemy_2.png', world4Enemy3:'assets/world4/enemy_3.png', world4Enemy4:'assets/world4/enemy_4.png', world4Enemy5:'assets/world4/enemy_5.png', world4Enemy6:'assets/world4/enemy_6.png',
    world4Hazard1:'assets/world4/hazard_1.png', world4Hazard2:'assets/world4/hazard_2.png', world4Hazard3:'assets/world4/hazard_3.png', world4Hazard4:'assets/world4/hazard_4.png', world4Hazard5:'assets/world4/hazard_5.png', world4Hazard6:'assets/world4/hazard_6.png', world4Hazard7:'assets/world4/hazard_7.png', world4Hazard8:'assets/world4/hazard_8.png', world4Hazard9:'assets/world4/hazard_9.png',
    world5BgCave:'assets/world5/bg_world5_cave.png', world5BossBg:'assets/world5/bg_world5_boss.png', bossWorld5:'assets/world5/boss_world5.png',
    world5Enemy1:'assets/world5/enemy_1.png', world5Enemy2:'assets/world5/enemy_2.png', world5Enemy3:'assets/world5/enemy_3.png', world5Enemy4:'assets/world5/enemy_4.png', world5Enemy5:'assets/world5/enemy_5.png', world5Enemy6:'assets/world5/enemy_6.png',
    world5Hazard1:'assets/world5/hazard_1.png', world5Hazard2:'assets/world5/hazard_2.png', world5Hazard3:'assets/world5/hazard_3.png', world5Hazard4:'assets/world5/hazard_4.png', world5Hazard5:'assets/world5/hazard_5.png', world5Hazard6:'assets/world5/hazard_6.png', world5Hazard7:'assets/world5/hazard_7.png', world5Hazard8:'assets/world5/hazard_8.png', world5Hazard9:'assets/world5/hazard_9.png'
  };
  const WORLD_TWO_EXTRA_SPRITES = {
    debris: ['world2Debris1','world2Debris2','world2Debris3','world2Debris4','world2Debris5','world2Debris6','world2Debris7','world2Debris8'],
    meteors: ['world2Meteor1','world2Meteor2','world2Meteor3','world2Meteor4','world2Meteor5','world2Meteor6','world2Meteor7','world2Meteor8']
  };
  const WORLD_THREE_HAZARDS=['world3Hazard1','world3Hazard2','world3Hazard3','world3Hazard4','world3Hazard5','world3Hazard6','world3Hazard7','world3Hazard8','world3Hazard9','world3Hazard10'];
  const WORLD_FOUR_HAZARDS=['world4Hazard1','world4Hazard2','world4Hazard3','world4Hazard4','world4Hazard5','world4Hazard6','world4Hazard7','world4Hazard8','world4Hazard9'];
  const WORLD_FIVE_HAZARDS=['world5Hazard1','world5Hazard2','world5Hazard3','world5Hazard4','world5Hazard5','world5Hazard6','world5Hazard7','world5Hazard8','world5Hazard9'];
  const GAME_ASSETS = (() => {
    const images = {};
    for (const [key, src] of Object.entries(GAME_ASSET_SOURCES)) {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = src;
      images[key] = img;
    }
    return { images };
  })();

  const FUSIONS = [
    { id: 'prisma', requires: ['triple', 'laser'], icon: '✷', name: 'Prisma fragmentado', desc: 'Tres rayos finos en abanico.' },
    { id: 'chispa', requires: ['fire', 'bounce'], icon: '☄', name: 'Chispa errante', desc: 'Fuego que salta entre enemigos.' },
    { id: 'lanza', requires: ['ice', 'pierce'], icon: '❖', name: 'Lanza criogénica', desc: 'Proyectiles veloces que ralentizan y atraviesan.' },
    { id: 'gravedad', requires: ['orbs', 'gravmine'], icon: '◍', name: 'Anillo gravitacional', desc: 'Órbitas y minas crean un campo de atracción.' },
    { id: 'resonante', requires: ['drone', 'pulse'], icon: '◈', name: 'Dron resonante', desc: 'Los drones descargan ondas cortas.' },
    { id: 'tridente', requires: ['triple', 'pierce'], icon: '🔱', name: 'Tridente penetrante', desc: 'Triple pulso con penetración reforzada.' },
    { id: 'criotemporal', requires: ['laser', 'stasis'], icon: '❄', name: 'Rayo criotemporal', desc: 'El láser ralentiza lo que atraviesa.' },
    { id: 'enjambre', requires: ['torpedo', 'virus'], icon: '☣', name: 'Enjambre infeccioso', desc: 'Torpedos que propagan infección.' },
    { id: 'tormenta', requires: ['drone', 'spark'], icon: '⚡', name: 'Escuadrón tormenta', desc: 'Los drones sincronizan descargas eléctricas.' },
    { id: 'bastion', requires: ['orbs', 'ring'], icon: '🛡️', name: 'Bastión orbital', desc: 'Los orbes refuerzan el anillo y bloquean proyectiles.' },
    { id: 'pozo', requires: ['gravmine', 'plasma'], icon: '◉', name: 'Pozo de plasma', desc: 'El vórtice arrastra enemigos hacia minas gravíticas.' },
    { id: 'nulidad', requires: ['voidray', 'disruptor'], icon: '⟋', name: 'Lanza de nulidad', desc: 'Rayo de vacío que desintegra proyectiles cercanos.' },
    { id: 'blackout', requires: ['opem', 'pulse'], icon: '⟁', name: 'Nova blackout', desc: 'Pulso radial con apagón electromagnético.' },
    { id: 'tempestad', requires: ['voltaic', 'overdrive'], icon: '🌩️', name: 'Tempestad del reactor', desc: 'La cadena voltaica se expande bajo sobrecarga.' },
    { id: 'hiperfase', requires: ['phase', 'afterburner'], icon: '👻', name: 'Hiperfase vectorial', desc: 'Aceleración extrema con protección espectral.' },
    { id: 'regenerativo', requires: ['nanorepair', 'ring'], icon: '✚', name: 'Bastión regenerativo', desc: 'Nanorreparación reforzada dentro del anillo.' }
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
    { id: 'nucleo', name: 'Núcleo', color: '#ff82d4', hp: 115, speed: 38, r: 22, xp: 25, score: 55, coin: 10, behavior: 'core' },
    { id:'vora_aguja', name:'Vorácido Aguja', color:'#a9ff5e', hp:34, speed:168, r:13, xp:14, score:30, coin:5, behavior:'zigzag', world2Family:'voracid', spriteKey:'world2Voracid1' },
    { id:'vora_colmillo', name:'Vorácido Colmillo', color:'#b8ff6f', hp:42, speed:184, r:14, xp:16, score:34, coin:5, behavior:'kamikaze', world2Family:'voracid', spriteKey:'world2Voracid2' },
    { id:'vora_cuchilla', name:'Vorácido Cuchilla', color:'#c8ff72', hp:50, speed:150, r:15, xp:17, score:38, coin:6, behavior:'evader', world2Family:'voracid', spriteKey:'world2Voracid3' },
    { id:'vora_salto', name:'Vorácido Salto', color:'#d7ff85', hp:58, speed:142, r:16, xp:19, score:42, coin:6, behavior:'chase', world2Family:'voracid', spriteKey:'world2Voracid4' },
    { id:'vora_alpha', name:'Vorácido Alfa', color:'#efff8d', hp:78, speed:132, r:18, xp:23, score:54, coin:8, behavior:'buffer', world2Family:'voracid', spriteKey:'world2Voracid5' },
    { id:'void_orbe', name:'Errante Orbe', color:'#b58cff', hp:48, speed:88, r:16, xp:16, score:36, coin:6, behavior:'zigzag', world2Family:'void', spriteKey:'world2Void1' },
    { id:'void_sifon', name:'Errante Sifón', color:'#ca8fff', hp:58, speed:74, r:17, xp:18, score:40, coin:7, behavior:'toxic', world2Family:'void', spriteKey:'world2Void2' },
    { id:'void_niebla', name:'Errante Niebla', color:'#d89cff', hp:54, speed:94, r:17, xp:19, score:43, coin:7, behavior:'mist', world2Family:'void', spriteKey:'world2Void3' },
    { id:'void_nodo', name:'Nodo del Vacío', color:'#e6aaff', hp:88, speed:52, r:20, xp:24, score:55, coin:9, behavior:'buffer', world2Family:'void', spriteKey:'world2Void4' },
    { id:'void_reactor', name:'Reactor del Vacío', color:'#f1b7ff', hp:112, speed:46, r:22, xp:28, score:64, coin:10, behavior:'core', world2Family:'void', spriteKey:'world2Void5' },
    { id:'metal_ariete', name:'Devorador Ariete', color:'#ffb35c', hp:84, speed:76, r:19, xp:21, score:48, coin:8, behavior:'chase', world2Family:'metal', spriteKey:'world2Metal1' },
    { id:'metal_tanque', name:'Devorador Tanque', color:'#ffc16b', hp:138, speed:42, r:23, xp:28, score:64, coin:10, behavior:'blindado', world2Family:'metal', spriteKey:'world2Metal2' },
    { id:'metal_sierra', name:'Devorador Sierra', color:'#ffcf7d', hp:74, speed:116, r:18, xp:23, score:52, coin:8, behavior:'kamikaze', world2Family:'metal', spriteKey:'world2Metal3' },
    { id:'metal_guardian', name:'Guardián de Chatarra', color:'#ffdb91', hp:152, speed:38, r:24, xp:31, score:72, coin:11, behavior:'buffer', world2Family:'metal', spriteKey:'world2Metal4' },
    { id:'metal_mamut', name:'Mamut de Metal', color:'#ffe2a3', hp:190, speed:31, r:27, xp:36, score:84, coin:13, behavior:'blindado', world2Family:'metal', spriteKey:'world2Metal5' },
    { id:'w3_viridian_1', name:'Viridiano Aguja', color:'#74ff73', hp:46, speed:178, r:15, xp:18, score:42, coin:6, behavior:'zigzag', world3Family:'viridian', spriteKey:'world3Viridian1' },
    { id:'w3_viridian_2', name:'Viridiano Vector', color:'#82ff7d', hp:52, speed:190, r:15, xp:19, score:45, coin:6, behavior:'evader', world3Family:'viridian', spriteKey:'world3Viridian2' },
    { id:'w3_viridian_3', name:'Viridiano Filo', color:'#93ff8b', hp:58, speed:166, r:16, xp:20, score:48, coin:7, behavior:'kamikaze', world3Family:'viridian', spriteKey:'world3Viridian3' },
    { id:'w3_viridian_4', name:'Viridiano Pulsar', color:'#a2ff96', hp:66, speed:150, r:17, xp:22, score:52, coin:7, behavior:'chase', world3Family:'viridian', spriteKey:'world3Viridian4' },
    { id:'w3_viridian_5', name:'Viridiano Alfa', color:'#bcffab', hp:88, speed:138, r:19, xp:26, score:62, coin:9, behavior:'buffer', world3Family:'viridian', spriteKey:'world3Viridian5' },
    { id:'w3_crystal_1', name:'Cristálido Prisma', color:'#74ffd1', hp:62, speed:128, r:17, xp:21, score:50, coin:7, behavior:'zigzag', world3Family:'crystal', spriteKey:'world3Crystal1' },
    { id:'w3_crystal_2', name:'Cristálido Sifón', color:'#65f5c1', hp:72, speed:116, r:18, xp:23, score:55, coin:8, behavior:'toxic', world3Family:'crystal', spriteKey:'world3Crystal2' },
    { id:'w3_crystal_3', name:'Cristálido Espejo', color:'#80ffe0', hp:68, speed:132, r:18, xp:24, score:58, coin:8, behavior:'evader', world3Family:'crystal', spriteKey:'world3Crystal3' },
    { id:'w3_crystal_4', name:'Cristálido Nodo', color:'#9affdf', hp:96, speed:86, r:21, xp:28, score:66, coin:10, behavior:'buffer', world3Family:'crystal', spriteKey:'world3Crystal4' },
    { id:'w3_crystal_5', name:'Cristálido Reactor', color:'#b4ffe8', hp:124, speed:72, r:23, xp:32, score:76, coin:11, behavior:'core', world3Family:'crystal', spriteKey:'world3Crystal5' },
    { id:'w3_reaper_1', name:'Segador Garra', color:'#c5ff62', hp:92, speed:102, r:20, xp:26, score:62, coin:9, behavior:'chase', world3Family:'reaper', spriteKey:'world3Reaper1' },
    { id:'w3_reaper_2', name:'Segador Bastión', color:'#d2ff73', hp:154, speed:58, r:25, xp:34, score:80, coin:12, behavior:'blindado', world3Family:'reaper', spriteKey:'world3Reaper2' },
    { id:'w3_reaper_3', name:'Segador Fauce', color:'#dfff84', hp:102, speed:124, r:21, xp:29, score:70, coin:10, behavior:'kamikaze', world3Family:'reaper', spriteKey:'world3Reaper3' },
    { id:'w3_reaper_4', name:'Segador Guardián', color:'#e8ff94', hp:168, speed:52, r:26, xp:37, score:88, coin:13, behavior:'buffer', world3Family:'reaper', spriteKey:'world3Reaper4' },
    { id:'w3_reaper_5', name:'Segador Coloso', color:'#f1ffa8', hp:210, speed:45, r:29, xp:42, score:98, coin:15, behavior:'blindado', world3Family:'reaper', spriteKey:'world3Reaper5' },
    { id:'w4_eclipse_1', name:'Ala Carmesí', color:'#ff7d76', hp:92, speed:186, r:17, xp:24, score:58, coin:8, behavior:'zigzag', spriteKey:'world4Enemy1' },
    { id:'w4_eclipse_2', name:'Centella Solar', color:'#ff9686', hp:104, speed:172, r:18, xp:26, score:62, coin:9, behavior:'evader', spriteKey:'world4Enemy2' },
    { id:'w4_eclipse_3', name:'Acechador Escarlata', color:'#ffb391', hp:116, speed:162, r:19, xp:28, score:68, coin:10, behavior:'chase', spriteKey:'world4Enemy3' },
    { id:'w4_eclipse_4', name:'Guardián Carmesí', color:'#ffcf9e', hp:154, speed:132, r:22, xp:33, score:80, coin:12, behavior:'blindado', spriteKey:'world4Enemy4' },
    { id:'w4_eclipse_5', name:'Nexo Rubí', color:'#ffd7aa', hp:166, speed:122, r:23, xp:35, score:86, coin:12, behavior:'buffer', spriteKey:'world4Enemy5' },
    { id:'w4_eclipse_6', name:'Desgarrador Ígneo', color:'#ffe3bb', hp:178, speed:148, r:24, xp:38, score:92, coin:13, behavior:'kamikaze', spriteKey:'world4Enemy6' },
    { id:'w5_void_1', name:'Vigía del Vacío', color:'#b982ff', hp:110, speed:176, r:18, xp:28, score:66, coin:9, behavior:'zigzag', spriteKey:'world5Enemy1' },
    { id:'w5_void_2', name:'Orbe Singular', color:'#cc95ff', hp:126, speed:162, r:19, xp:30, score:72, coin:10, behavior:'toxic', spriteKey:'world5Enemy2' },
    { id:'w5_void_3', name:'Mantis del Abismo', color:'#d9a7ff', hp:138, speed:156, r:20, xp:31, score:76, coin:10, behavior:'evader', spriteKey:'world5Enemy3' },
    { id:'w5_void_4', name:'Artillero del Núcleo', color:'#e2bbff', hp:186, speed:118, r:24, xp:38, score:94, coin:13, behavior:'blindado', spriteKey:'world5Enemy4' },
    { id:'w5_void_5', name:'Segador del Reactor', color:'#ecc8ff', hp:172, speed:138, r:23, xp:36, score:90, coin:13, behavior:'chase', spriteKey:'world5Enemy5' },
    { id:'w5_void_6', name:'Coloso de Singularidad', color:'#f6daff', hp:214, speed:102, r:27, xp:44, score:108, coin:15, behavior:'buffer', spriteKey:'world5Enemy6' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_run', icon: '▶', name: 'Primer despertar', desc: 'Inicia tu primera misión.', group: 'Supervivencia' },
    { id: 'wave_5', icon: '🌊', name: 'Cinco oleadas', desc: 'Alcanza la oleada 5.', group: 'Supervivencia' },
    { id: 'kills_100', icon: '🧟', name: 'Cien sombras', desc: 'Elimina 100 zombies en total.', group: 'Dominio' },
    { id: 'boss_1', icon: '◆', name: 'Primer jefe', desc: 'Derrota un jefe zombie.', group: 'Dominio' },
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
    settings: { sound: true, music: true, shake: true, reducedMotion: false, lowPerformance: false, difficulty: 'normal', playMode: 'story' },
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
      relics: {},
      bossShips: {},
      activeBossShip: null,
      campaignExtraLives: 4,
      worldProgression: { shotTier: 0, projectileSpeedTier: 0, accuracyTier: 0, mobilityTier: 0, rangeTier: 0, bossPowers: {} },
      levelProgress: { 1: 1 },
      ranking: [],
      preferredDifficulty: 'normal',
      preferredPlayMode: 'story',
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
    if (!DIFFICULTY_MODES[s.settings.difficulty]) s.settings.difficulty = 'normal';
    if (!['story','direct'].includes(s.settings.playMode)) s.settings.playMode = 'story';
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
      p.relics = p.relics || {};
      p.bossShips = p.bossShips || {};
      p.activeBossShip = p.activeBossShip || null;
      p.campaignExtraLives = Math.min(MAX_TOTAL_LIVES - 1, Math.max(0, Number.isFinite(p.campaignExtraLives) ? p.campaignExtraLives : 4));
      p.worldProgression = { shotTier: 0, projectileSpeedTier: 0, accuracyTier: 0, mobilityTier: 0, rangeTier: 0, bossPowers: {}, ...(p.worldProgression || {}) };
      p.worldProgression.bossPowers = p.worldProgression.bossPowers || {};
      const clearedCount = Math.min(5, (p.completedMaps || []).length);
      p.worldProgression.shotTier = Math.max(p.worldProgression.shotTier || 0, clearedCount);
      p.worldProgression.projectileSpeedTier = Math.max(p.worldProgression.projectileSpeedTier || 0, clearedCount);
      p.worldProgression.accuracyTier = Math.max(p.worldProgression.accuracyTier || 0, clearedCount);
      p.worldProgression.mobilityTier = Math.max(p.worldProgression.mobilityTier || 0, clearedCount);
      p.worldProgression.rangeTier = Math.max(p.worldProgression.rangeTier || 0, clearedCount);
      p.preferredDifficulty = DIFFICULTY_MODES[p.preferredDifficulty] ? p.preferredDifficulty : (DIFFICULTY_MODES[s.settings.difficulty] ? s.settings.difficulty : 'normal');
      p.preferredPlayMode = ['story','direct'].includes(p.preferredPlayMode) ? p.preferredPlayMode : 'story';
      p.levelProgress = p.levelProgress || { 1: 1 };
      for (const w of (p.completedMaps || [])) p.levelProgress[w] = 5;
      if (p.lastSave?.mapIndex != null) { const wn = p.lastSave.mapIndex + 1; p.levelProgress[wn] = Math.max(p.levelProgress[wn] || 1, p.lastSave.wave || 1); }
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
    bossSeqTimer: null,
    bossSeqStep: 0,
    bossThemeIndex: 0,
    bossThemePhase: 1,
    futureSeqTimer: null,
    futureSeqStep: 0,
    futureBossWorld: 6,
    futureBossPhase: 1,
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
    world2Pulse() { this.chord([176, 233.08, 311.13], .18, .045); this.tone(72,.32,'sine',.024,26); },
    world2Shot() { this.tone(430 + rand(90,-60), .07, 'triangle', .018, -110); },
    world2BossCue() { this.chord([58.27, 77.78, 116.54, 155.56], .38, .1); },
    musicTone(freq=110,dur=.11,type='triangle',gain=.012,slide=0){
      if(!state.settings.music)return;const ctx=this.ensure();if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(28,freq),ctx.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(28,freq+slide),ctx.currentTime+dur);g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur+.02);
    },
    bossShot(world=0){
      if(!state.settings.sound)return;const defs=[
        [118,.09,'sawtooth',.024,-48],[286,.075,'triangle',.019,-95],[760,.055,'square',.016,-210],[420,.07,'sawtooth',.021,-150],[72,.13,'triangle',.026,-18]
      ],d=defs[Math.max(0,Math.min(4,world))];this.tone(...d);
    },
    bossSpecial(world=0){
      if(!state.settings.sound)return;const cues=[
        [72,110,164],[96,144,216],[196,294,392],[82,123,164],[42,63,94]
      ][Math.max(0,Math.min(4,world))];this.chord(cues,.22,.045);
    },
    futureBossShot(world=6){if(!state.settings.sound)return;const cfg=futureBossMeta(world),d=cfg.sound.shot;this.tone(...d);if(world===7)this.tone(d[0]*1.5,.035,'sine',.006,35);if(world===9)this.tone(d[0]*.5,.028,'triangle',.005,-70);if(world===10)this.tone(34,.16,'sine',.008,10);},
    futureBossSpecial(world=6){if(!state.settings.sound)return;const cfg=futureBossMeta(world);this.chord(cfg.sound.special,.24,.045);if(world===6)this.tone(48,.30,'square',.012,22);if(world===7)this.tone(58,.34,'sine',.014,18);if(world===8)this.tone(74,.26,'triangle',.015,-20);if(world===9)this.tone(980,.055,'square',.010,-420);if(world===10)this.tone(31,.46,'sawtooth',.018,16);},
    futureMinionShot(world=6,tier='small',familyIndex=0){if(!state.settings.sound)return;const list=FUTURE_MINION_ARCHETYPES[Number(world)]||FUTURE_MINION_ARCHETYPES[6],pool=list.filter(x=>x.tier===tier),cfg=(pool[familyIndex%Math.max(1,pool.length)]||list[0]);this.tone(...cfg.sound.shot);},
    futureMinionDeath(world=6,tier='small',familyIndex=0){if(!state.settings.sound)return;const list=FUTURE_MINION_ARCHETYPES[Number(world)]||FUTURE_MINION_ARCHETYPES[6],pool=list.filter(x=>x.tier===tier),cfg=(pool[familyIndex%Math.max(1,pool.length)]||list[0]);this.tone(...cfg.sound.death);},
    startFutureBossSequence(world=6,phase=1){if(!state.settings.music)return;clearInterval(this.futureSeqTimer);this.futureSeqTimer=null;this.futureSeqStep=0;this.futureBossWorld=Math.max(6,Math.min(10,Number(world)||6));this.futureBossPhase=Math.max(1,Math.min(4,Number(phase)||1));const cfg=futureBossMeta(this.futureBossWorld),phaseTempo=this.futureBossPhase>=4?(cfg.music.phase4||.68):(this.futureBossPhase>=3?.82:1),beat=60000/cfg.music.bpm/2*phaseTempo;const tick=()=>{if(!state.settings.music)return;const step=this.futureSeqStep++,seq=cfg.music.seq,n=seq[step%seq.length],lift=(this.futureBossPhase-1)*2,freq=cfg.music.root*Math.pow(2,(n+lift)/12),gain=.0065+this.futureBossPhase*.0013;this.musicTone(freq,.082,cfg.music.wave,gain,step%4===0?-10:0);if(step%4===0)this.musicTone(cfg.music.root/2,.18,'sine',.009+this.futureBossPhase*.0013,-6);if(this.futureBossWorld===6&&step%4===2)this.musicTone(freq*2,.035,'square',.0032,-90);if(this.futureBossWorld===7&&step%3===1)this.musicTone(freq*.75,.12,'sine',.0038,14);if(this.futureBossWorld===8&&step%2===0)this.musicTone(freq*1.5,.045,'triangle',.0035,-35);if(this.futureBossWorld===9&&step%2===1)this.musicTone(freq*2,.03,'square',.0036,-180);if(this.futureBossWorld===10&&step%8===6)this.musicTone(cfg.music.root*.5,.30,'sawtooth',.0055,9);};tick();this.futureSeqTimer=setInterval(tick,Math.max(130,beat));},
    stopFutureBossSequence(){clearInterval(this.futureSeqTimer);this.futureSeqTimer=null;this.futureSeqStep=0;},
    startBossSequence(mapIndex=0,phase=1){
      if(!state.settings.music)return;clearInterval(this.bossSeqTimer);this.bossSeqTimer=null;this.bossSeqStep=0;this.bossThemeIndex=Math.max(0,Math.min(4,mapIndex));this.bossThemePhase=Math.max(1,phase||1);const cfg=boss2Meta(this.bossThemeIndex),phaseTempo=this.bossThemeIndex===4&&this.bossThemePhase>=4?.52:(this.bossThemePhase>=3?.86:1),beat=60000/cfg.music.bpm/2*phaseTempo;
      const tick=()=>{if(!state.settings.music)return;const step=this.bossSeqStep++,seq=cfg.music.seq,n=seq[step%seq.length],phaseLift=(this.bossThemePhase-1)*2;const freq=cfg.music.root*Math.pow(2,(n+phaseLift)/12);this.musicTone(freq,.085,cfg.music.wave,.0065+this.bossThemePhase*.0012,step%4===0?-8:0);if(step%4===0)this.musicTone(cfg.music.root/2,.15,'sine',.009+this.bossThemePhase*.0015,-8);if(this.bossThemeIndex===1&&step%3===1)this.musicTone(freq*1.5,.05,'sine',.0035,18);if(this.bossThemeIndex===2&&step%2===1)this.musicTone(freq*2,.035,'square',.0032,-80);if(this.bossThemeIndex===3&&step%4===2)this.musicTone(cfg.music.root*2,.045,'square',.004,-40);if(this.bossThemeIndex===4&&step%8===6)this.musicTone(cfg.music.root*.75,.25,'sine',.006,12);};tick();this.bossSeqTimer=setInterval(tick,Math.max(160,beat));
    },
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
      if(boss)this.startBossSequence(mapIndex,phase);
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
      if(boss&&this.bossSeqTimer){this.bossThemePhase=Math.max(1,phase||1);this.startBossSequence(this.bossThemeIndex,this.bossThemePhase);}
    },
    stopMusic() {
      clearInterval(this.bossSeqTimer);this.bossSeqTimer=null;this.bossSeqStep=0;clearInterval(this.futureSeqTimer);this.futureSeqTimer=null;this.futureSeqStep=0;
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

  window.ZombieStrikeFuture = {bosses:FUTURE_BOSS2,minions:FUTURE_MINION_ARCHETYPES,boss:world=>futureBossMeta(world),previewBoss(world=6,phase=1){AudioFX.stopMusic();AudioFX.futureBossSpecial(world);AudioFX.startFutureBossSequence(world,phase);return futureBossMeta(world);},stopPreview(){AudioFX.stopFutureBossSequence();},bossShot(world=6){AudioFX.futureBossShot(world);},minionShot(world=6,tier='small',family=0){AudioFX.futureMinionShot(world,tier,family);},minionDeath(world=6,tier='small',family=0){AudioFX.futureMinionDeath(world,tier,family);}};

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
      this.worldOneState = { meteorTimer: 5.2, insectTimer: 3.6, mirrorCount: 0, rainTimer: 9.5, burstTimer: 3.2, bombTimer: 6.4, planetTimer: 10.8, hunterTimer: 4.2, rewardSteps: [], backgroundPhase: 0, eventTimer: 8.5, hordeTimer: 15.5, hordeSeen: 0, actSeen: 0, captainsSpawned: 0, captainsKilled: 0, captainTimer: 2.4, bossPrelude: 0, bossPreludeMax: 4.8, bossPreludeStarted: false };
      this.worldTwoState = { sporeTimer: 3.8, fogTimer: 7.2, splitTimer: 5.0, rewardSteps: [], backgroundPhase: 0, labPulse: 0, colonyTimer: 8.2, toxicZoneTimer: 7.0, junkTimer: 4.8, meteorTimer: 5.8, planetTimer: 10.8, chaosTimer: 8.6, rewardTimer: 7.0, eventTimer: 8.5, hordeTimer: 13.2, hordeSeen: 0, formationIndex: 0, enemyHistory: [], actSeen: 0, captainsSpawned: 0, captainsKilled: 0, captainTimer: 1.0, level5Elapsed: 0, bossPrelude: 0, bossPreludeMax: 5.3, bossPreludeStarted: false };
      this.worldThreeState={rewardSteps:[],eventTimer:7.5,rewardTimer:8.5,hordeTimer:13.5,hazardTimer:6.5,speedBurst:0,hordeSeen:0,enemyHistory:[]};
      this.worldFourState={rewardSteps:[],eventTimer:7.0,rewardTimer:8.0,hazardTimer:7.4,hordeTimer:12.5,enemyHistory:[]};
      this.worldFiveState={rewardSteps:[],eventTimer:6.5,rewardTimer:7.5,hazardTimer:6.8,hordeTimer:11.8,enemyHistory:[]};
      this.world3Stars=[];
      this.toasts = [];
      this.powerLevels = {};
      this.powerActivity = {};
      this.powerQueue=[]; this.activeCombos={};
      this.recentPowerHistory=[];
      this.progressWatch={level:1,kills:0,stagnant:0,rescues:0};
      this.powerSupportTimer=9;
      this.fusions = {};
      this.run = { score: 0, coins: 0, experience: 0, kills: 0, bosses: 0, start: Date.now(), mapComplete: false, lifePurchases: 0 };
      this.defeatPowerDropsIssued = false;
      this.recoveryLoadout = [];
      this.lastBossLootPower = null;
      this.extraLives = 4;
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
      this.canvas.addEventListener('mousemove', pointerHandler, { passive: false });
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
      this.isSmallScreen = isSmall;
      this.mobileLandscape = isSmall && viewW > viewH && viewH <= 620;
      this.mobilePortrait = isSmall && viewH >= viewW;
      const dpr = state.settings.lowPerformance ? 1 : Math.min(this.mobileLandscape ? 1.15 : (isSmall ? 1.25 : 1.75), window.devicePixelRatio || 1);
      this.pixelRatio = dpr;
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
        const b=this.getCombatBounds();
        this.player.x = clamp(this.player.x, Math.max(this.player.r + 8,b.left), Math.min(this.w - this.player.r - 8,b.right));
        this.player.y = clamp(this.player.y, Math.max(this.player.r + 8,b.top), Math.min(this.h - this.player.r - 8,b.bottom));
      }
      if (this.ctx) this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.applyPerformanceMode?.();
      this.updateOrientationHint?.();
    }

    getCombatBounds() {
      const scale=this.pixelRatio||1;
      if(this.mobileLandscape){
        return {left:10*scale,right:this.w-10*scale,top:32*scale,bottom:this.h-30*scale};
      }
      if(this.mobilePortrait){
        return {left:10*scale,right:this.w-10*scale,top:34*scale,bottom:this.h-34*scale};
      }
      return {left:24,right:this.w-24,top:24,bottom:this.h-24};
    }

    requestMobilePlayMode() {
      requestLandscapeExperience({ remember:true, source:'game' });
    }

    applyPerformanceMode() {
      const low = !!state.settings.lowPerformance;
      this.maxParticles = low ? 60 : (this.isSmallScreen ? 90 : 135);
      this.maxPickups = low ? 18 : (this.isSmallScreen ? 24 : 34);
      this.maxMeteors = low ? 2 : (this.isSmallScreen ? (this.mapIndex===1 ? 4 : 3) : (this.mapIndex===1 ? 7 : 5));
      this.maxBullets = low ? 100 : (this.isSmallScreen ? 145 : 205);
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

    getWorldOneWaveDuration(wave = this.wave) {
      const arr = WORLD_ONE_CONFIG.waveDurations;
      return (arr[Math.min(arr.length - 1, Math.max(0, wave - 1))] || 30) * (this.getDifficulty().waveDuration || 1);
    }

    getWorldOneProgress() {
      if (this.mapIndex !== 0) return 0;
      const stage = this.worldStage || { level: this.wave || 1, kills: 0, targets: WORLD_STAGE_TARGETS[0] };
      const need = this.getWorldStageTarget(stage.level);
      return clamp(((stage.level - 1) + clamp((stage.kills || 0) / need, 0, 1)) / Math.max(1, stage.totalLevels || 5), 0, 1);
    }

    getWorldTwoWaveDuration(wave = this.wave) {
      const arr = WORLD_TWO_CONFIG.waveDurations;
      return (arr[Math.min(arr.length - 1, Math.max(0, wave - 1))] || 32) * (this.getDifficulty().waveDuration || 1);
    }

    getWorldTwoProgress() {
      if (this.mapIndex !== 1) return 0;
      const base = Math.max(1, WORLD_TWO_CONFIG.bossWave - 1);
      const duration = this.getWorldTwoWaveDuration(this.wave);
      return clamp(((this.wave - 1) + clamp(this.waveTime / duration, 0, 1)) / base, 0, 1);
    }

    getBossApproachPercent() {
      if (this.bossActive || this.bossIntroduced) return 100;
      if (!this.worldStage || this.mapIndex >= 5) return 0;
      const level = clamp(this.worldStage.level || this.wave || 1, 1, 5);
      let within = 0;
      if (level === 5) {
        if(this.mapIndex===0||this.mapIndex===1){const specialKills=this.mapIndex===0?(this.worldOneState?.captainsKilled||0):(this.worldTwoState?.captainsKilled||0);within=clamp(specialKills/3,0,1);}
        else within=clamp((this.worldStage.kills||0)/Math.max(1,this.getWorldStageTarget(level)),0,1);
      } else {
        within = clamp((this.worldStage.kills || 0) / Math.max(1, this.getWorldStageTarget(level)), 0, 1);
      }
      return Math.round(clamp(((level - 1) + within) / 5 * 100, 0, 100));
    }

    updateBossApproachHud() {
      if (!els.hudBossApproach || !els.hudBossPercent) return;
      const pct = this.getBossApproachPercent();
      const bossName = MAPS[this.mapIndex]?.boss || 'Jefe';
      if(els.hudBossSigil&&els.hudBossSigil.dataset.world!==String(this.mapIndex)){els.hudBossSigil.dataset.world=String(this.mapIndex);els.hudBossSigil.innerHTML=bossSigilHtml(this.mapIndex,'hud-boss-sigil-img');}
      if (this.bossActive) {
        const b = this.bossActive;
        const totalBase = Math.max(1, (b.baseHp || 1) + (b.shieldMax || 0));
        const totalNow = Math.max(0, (b.hp || 0) + Math.max(0, b.shield || 0));
        const remain = Math.round(clamp(totalNow / totalBase * 100, 0, 100));
        els.hudBossApproach.classList.add('boss-live');
        els.hudBossApproach.classList.toggle('boss-critical', remain <= 35);
        els.hudBossApproach.classList.remove('boss-ready');
        els.hudBossPercent.textContent = `-${remain}%`;
        els.hudBossApproach.title = `${bossName}: ${remain}% restante`;
      } else {
        els.hudBossApproach.classList.toggle('boss-ready', pct >= 80);
        els.hudBossApproach.classList.remove('boss-live','boss-critical');
        els.hudBossPercent.textContent = `${pct}%`;
        els.hudBossApproach.title = `${bossName}: ${pct}% de aproximación`;
      }
    }

    getWorldStageTarget(level = this.worldStage?.level || this.wave || 1) {
      const targets = this.worldStage?.targets || WORLD_STAGE_TARGETS[this.mapIndex] || [20, 30, 40, 50, 60];
      const base = targets[Math.max(0, Math.min(targets.length - 1, level - 1))] || 30;
      if ((this.mapIndex===0||this.mapIndex===1) && level===5) return base;
      return Math.max(1, Math.ceil(base * (this.getDifficulty().target || 1)));
    }

    trackWorldKill(enemyOrCount = 1) {
      if (this.mapIndex >= 5 || this.bossIntroduced || this.run?.mapComplete) return;
      this.worldStage = this.worldStage || { level: this.wave || 1, kills: 0, targets: WORLD_STAGE_TARGETS[this.mapIndex] || [20,30,40,50,60], totalLevels: 5, bossLevel: 5 };
      const isEnemy = typeof enemyOrCount === 'object' && enemyOrCount;
      if (this.mapIndex === 0 && this.worldStage.level === 5) {
        if (!isEnemy || !enemyOrCount.worldCaptain) return;
        this.worldOneState.captainsKilled = (this.worldOneState.captainsKilled || 0) + 1;
        this.worldStage.kills = this.worldOneState.captainsKilled;
        if(this.progressWatch){this.progressWatch.kills=this.worldStage.kills;this.progressWatch.stagnant=0;}
        this.toast('⚔️ Capitán eliminado', `${this.worldStage.kills}/3`);
        if (this.worldStage.kills >= 3) this.beginWorldOneBossPrelude();
        return;
      }
      if (this.mapIndex === 1 && this.worldStage.level === 5) {
        if (!isEnemy || !enemyOrCount.world2Captain) return;
        this.worldTwoState.captainsKilled = (this.worldTwoState.captainsKilled || 0) + 1;
        this.worldStage.kills = this.worldTwoState.captainsKilled;
        if(this.progressWatch){this.progressWatch.kills=this.worldStage.kills;this.progressWatch.stagnant=0;}
        this.toast('⚔️ Prefecto eliminado', `${this.worldStage.kills}/3`);
        if (this.worldStage.kills >= 3) this.beginWorldTwoBossPrelude();
        return;
      }
      const count = isEnemy ? 1 : Number(enemyOrCount || 1);
      this.worldStage.kills += count;
      if(this.progressWatch){this.progressWatch.kills=this.worldStage.kills;this.progressWatch.stagnant=0;}
      if (this.mapIndex === 0 && this.worldStage.level === 1 && this.worldStage.kills >= 12 && !this.worldOneState.earlyAssistGranted) {
        this.worldOneState.earlyAssistGranted = true;
        const p = this.player;
        this.spawnPickup(p.x + rand(90,-90), clamp(p.y - 105, 64, this.h - 64), 'power', 1, { powerId: 'pierce', major: true, label: 'Perforación cinética', powerDuration: 14 });
        this.toast('✦ REFUERZO TEMPRANO', 'Perforación cinética');
      }
      const need = this.getWorldStageTarget(this.worldStage.level);
      if (this.worldStage.kills < need) return;
      if (this.replayMode?.active && this.worldStage.level === this.replayMode.level && this.worldStage.level < this.worldStage.bossLevel) { this.finishReplayLevel(); return; }
      this.worldStage.kills = 0;
      if (this.worldStage.level >= this.worldStage.bossLevel) {
        if (this.mapIndex === 0) this.beginWorldOneBossPrelude();
        else this.spawnBoss();
        return;
      }
      this.worldStage.level += 1;
      this.wave = this.worldStage.level;
      this.progressWatch={level:this.wave,kills:0,stagnant:0,rescues:0};
      this.powerSupportTimer=Math.min(this.powerSupportTimer||9,6.5);
      if (!this.replayMode) { const prof = currentProfile(); prof.levelProgress = prof.levelProgress || {1:1}; prof.levelProgress[this.mapIndex + 1] = Math.max(prof.levelProgress[this.mapIndex + 1] || 1, this.wave); saveState(); }
      this.waveTime = 0;
      currentProfile().stats.highestWave = Math.max(currentProfile().stats.highestWave, this.wave);
      if (this.mapIndex === 0) {
        const act = WORLD_ONE_ACTS[this.wave - 1];
        this.worldOneState.eventTimer = Math.min(7, act?.eventEvery || 11);
        this.worldOneState.actSeen = this.wave;
        this.spawnWorldOneReward();
        this.grantLevelShield(7.5);
        this.toast(`ACTO ${['I','II','III','IV','V'][this.wave-1]}`, `${act?.name || `Nivel ${this.wave}`} · poderes +${(this.wave-1)*3}%`);
      } else if (this.mapIndex === 1) {
        const act = WORLD_TWO_ACTS[this.wave - 1];
        this.worldTwoState.eventTimer = Math.min(7, act?.eventEvery || 11);
        this.worldTwoState.actSeen = this.wave;
        if (this.wave === 5) {
          this.worldTwoState.captainTimer = .65;
          this.worldTwoState.level5Elapsed = 0;
          this.worldTwoState.captainsSpawned = Math.min(this.worldTwoState.captainsSpawned || 0, this.worldTwoState.captainsKilled || 0);
        }
        this.spawnWorldTwoReward();
        this.grantLevelShield(8.5);
        this.toast(`ACTO 2-${this.wave}`, `${act?.name || `Nivel ${this.wave}`} · poderes +${(this.wave-1)*3}%`);
        AudioFX.world2Pulse();
      } else if(this.mapIndex===2){const act=WORLD_THREE_ACTS[this.wave-1];this.worldThreeState.eventTimer=Math.min(6.5,act?.eventEvery||10);this.worldThreeState.speedBurst=3.2;this.spawnWorldThreeReward();this.grantLevelShield(8.5);this.toast(`ACTO 3-${this.wave}`,`${act?.name||`Nivel ${this.wave}`} · poderes +${(this.wave-1)*3}%`);}
      else if(this.mapIndex===3){const act=WORLD_FOUR_ACTS[this.wave-1];this.worldFourState.eventTimer=Math.min(6.5,act?.eventEvery||9.5);this.spawnWorldFourReward();this.grantLevelShield(8.5);this.toast(`ACTO 4-${this.wave}`,`${act?.name||`Nivel ${this.wave}`} · presión orbital +${(this.wave-1)*3}%`);}
      else if(this.mapIndex===4){const act=WORLD_FIVE_ACTS[this.wave-1];this.worldFiveState.eventTimer=Math.min(6.2,act?.eventEvery||9);this.spawnWorldFiveReward();this.grantLevelShield(9.0);this.toast(`ACTO 5-${this.wave}`,`${act?.name||`Nivel ${this.wave}`} · singularidad +${(this.wave-1)*3}%`);}
      else this.toast('🧭 Nivel superado', `Mundo ${this.mapIndex + 1} · Nivel ${this.worldStage.level}/${this.worldStage.totalLevels}`);
      this.requestTacticalPrep('level');
    }

    grantLevelShield(seconds = 7.5) {
      if (!this.player) return;
      this.player.entryShieldTimer = Math.max(this.player.entryShieldTimer || 0, seconds);
      this.player.entryShieldMax = Math.max(this.player.entryShieldMax || 0, seconds);
      this.player.shield = this.player.maxShield;
      this.toast('🛡️ Escudo recargado', `${Math.ceil(seconds)}s`);
    }

    spawnWorldOneCaptain(index = 0) {
      const types = ['cazador','toxico','blindado'];
      const names = ['Capitán Vector','Capitán Espora','Capitán Bastión'];
      const type = types[Math.max(0, Math.min(2,index))];
      this.spawnEnemy(type, false);
      const e = this.enemies[this.enemies.length - 1];
      if (!e) return;
      e.worldCaptain = true;
      e.name = names[index] || 'Capitán de frontera';
      e.hp *= 2.65; e.baseHp = e.hp;
      e.r *= 1.28; e.speed *= .82;
      e.score *= 2.2; e.coin *= 1.5;
      e.fireCd = .55;
      e.x = this.w * (.28 + index * .22);
      e.y = 70 + index * 24;
      this.toast('⚠️ CAPITÁN DE FAMILIA', e.name);
    }

    beginWorldOneBossPrelude() {
      const w1 = this.worldOneState;
      if (!w1 || w1.bossPreludeStarted || this.bossIntroduced) return;
      w1.bossPreludeStarted = true;
      w1.bossPreludeMax = 4.8;
      w1.bossPrelude = w1.bossPreludeMax;
      this.enemies = this.enemies.filter(e => e.boss);
      this.bullets.length = 0;
      this.pickups = this.pickups.filter(p => p.type === 'power');
      this.meteors.length = 0;
      this.flash = .85;
      this.shake = 8;
      AudioFX.tone(82, .7, 'sawtooth', .035, -26);
      this.toast('☠️ APERTURA DE LA ARENA', 'El horizonte está colapsando');
    }

    updateWorldOneDirector(dt) {
      if (this.mapIndex !== 0 || this.bossActive || this.run?.mapComplete) return false;
      const w1 = this.worldOneState;
      if (!w1) return false;
      if (w1.bossPrelude > 0) {
        w1.bossPrelude = Math.max(0, w1.bossPrelude - dt);
        if (w1.bossPrelude <= 0 && !this.bossIntroduced) this.spawnBoss();
        return true;
      }
      if (this.wave === 5) {
        w1.captainTimer = (w1.captainTimer || 0) - dt;
        const captainAlive = this.enemies.some(e => e.worldCaptain);
        if (!captainAlive && (w1.captainsSpawned || 0) < 3 && w1.captainTimer <= 0) {
          const idx = w1.captainsSpawned || 0;
          this.spawnWorldOneCaptain(idx);
          w1.captainsSpawned = idx + 1;
          w1.captainTimer = 5.8;
        }
      }
      w1.eventTimer = (w1.eventTimer || 0) - dt*(this.getDifficulty().eventPace||1);
      if (w1.eventTimer <= 0 && this.wave < 5) {
        this.triggerWorldOneMicroEvent(this.wave);
        const act = WORLD_ONE_ACTS[this.wave - 1];
        w1.eventTimer = (act?.eventEvery || 12) + rand(2.4, -1.4);
      }
      w1.hordeTimer = (w1.hordeTimer || 15.5) - dt*(this.getDifficulty().hordePace||1);
      if (w1.hordeTimer <= 0 && this.wave >= 2 && this.wave < 5) {
        this.triggerWorldOneHorde();
        w1.hordeTimer = rand(this.wave >= 4 ? 18 : 22, this.wave >= 4 ? 14 : 17);
      }
      return false;
    }

    spawnWorldTwoCaptain(index = 0) {
      const types = ['vora_alpha','void_reactor','metal_guardian'];
      const names = ['Prefecto Vorácido','Prefecto del Vacío','Prefecto Ferrum'];
      const type = types[Math.max(0,Math.min(2,index))];
      this.spawnEnemy(type,false);
      const e=this.enemies[this.enemies.length-1];
      if (!e) return;
      e.world2Captain=true;
      e.name=names[index]||'Prefecto del Nexo';
      e.hp*=3.15; e.baseHp=e.hp;
      e.r*=1.52;
      e.visualScale=Math.max(1.42,e.visualScale||1);
      e.speed*=.76;
      e.score*=2.8; e.coin*=1.75;
      e.familyFire=.36;
      e.captainIndex=index;
      e.x=this.w*(.27+index*.23); e.y=82+index*30;
      const family = WORLD_TWO_MINION_FAMILIES[index] || WORLD_TWO_MINION_FAMILIES[0];
      for (let i=0;i<2;i++) {
        this.spawnEnemy(pick(family.slice(0,4)), true);
        const guard=this.enemies[this.enemies.length-1];
        if (guard && !guard.boss && !guard.world2Captain) {
          guard.prefectEscort=true;
          guard.hp*=1.16; guard.baseHp=guard.hp;
          guard.r*=.96;
        }
      }
      this.flash=.5; this.shake=Math.max(this.shake,5);
      this.toast(`⚠️ PREFECTO ${index+1}/3`, `${e.name} · destrúyelo para acercarte al jefe`);
      AudioFX.world2Pulse();
    }

    beginWorldTwoBossPrelude() {
      const w2=this.worldTwoState;
      if (!w2 || w2.bossPreludeStarted || this.bossIntroduced) return;
      w2.bossPreludeStarted=true; w2.bossPreludeMax=5.3; w2.bossPrelude=w2.bossPreludeMax;
      this.enemies=this.enemies.filter(e=>e.boss);
      this.bullets.length=0;
      this.pickups=this.pickups.filter(p=>p.type==='power');
      this.zones.length=0;
      this.spawnOrbitalWreck(this.w >= 1100 ? 3 : 2, false);
      this.spawnMeteorRain(3, false);
      if (Math.random() < .9) this.spawnPlanetObstacle(1);
      this.flash=.82; this.shake=11;
      AudioFX.world2BossCue();
      this.toast('APERTURA DEL NEXO','El Patriarca Bacilo Omega despierta');
    }

    updateWorldTwoDirector(dt) {
      if (this.mapIndex!==1 || this.bossActive || this.run?.mapComplete) return false;
      const w2=this.worldTwoState;
      if (!w2) return false;
      if (w2.bossPrelude>0) {
        w2.bossPrelude=Math.max(0,w2.bossPrelude-dt);
        if (w2.bossPrelude<=0 && !this.bossIntroduced) this.spawnBoss();
        return true;
      }
      if (this.wave===5) {
        w2.level5Elapsed=(w2.level5Elapsed||0)+dt;
        w2.captainTimer=(w2.captainTimer||0)-dt;
        w2.chaosTimer=(w2.chaosTimer||6.2)-dt;
        w2.eventTimer=(w2.eventTimer||4.8)-dt;
        const alive=this.enemies.some(e=>e.world2Captain);
        if ((w2.captainsKilled||0)>=3 && !w2.bossPreludeStarted) {
          this.beginWorldTwoBossPrelude();
          return true;
        }
        if (!alive && (w2.captainsSpawned||0)<3 && (w2.captainTimer<=0 || w2.level5Elapsed>55)) {
          const idx=w2.captainsSpawned||0;
          this.spawnWorldTwoCaptain(idx);
          w2.captainsSpawned=idx+1;
          w2.captainTimer=2.2;
          this.toast(`☣️ PREFECTO ${idx+1}/3`,`${['abre el cerco','presiona desde la niebla','protege el nido'][idx] || 'protege al Patriarca'}`);
        }
        if (w2.eventTimer<=0 && !w2.bossPreludeStarted) {
          const support=[['vora_aguja','vora_colmillo'],['void_orbe','void_sifon'],['nest_guard','nest_stinger']][Math.min(2,w2.captainsKilled||0)] || ['vora_aguja','void_orbe'];
          support.forEach((id,i)=>this.spawnEnemyNearPlayer(id,-.8+i*.9,280+i*18,true,1.02));
          if (Math.random()<.5) this.spawnWorldTwoTacticalPrize();
          w2.eventTimer=rand(8.4,6.2);
        }
        if (w2.chaosTimer<=0 && !w2.bossPreludeStarted) {
          this.spawnMeteorRain(2,true);
          this.spawnOrbitalWreck(1,false);
          if (Math.random()<.55) this.spawnPlanetObstacle(1);
          w2.chaosTimer=rand(9.2,6.8);
        }
        // Fail-safe: nunca permitir que la antesala quede eternamente sin el siguiente prefecto.
        if (!alive && (w2.captainsSpawned||0)>=3 && (w2.captainsKilled||0)<3 && w2.captainTimer<=-4) {
          const idx=Math.min(2,w2.captainsKilled||0);
          this.spawnWorldTwoCaptain(idx);
          w2.captainTimer=3.0;
        }
      }
      w2.rewardTimer=(w2.rewardTimer ?? 7)-dt*(this.isHardMode()?1.12:1);
      if (w2.rewardTimer<=0 && this.wave<=5) {
        this.spawnWorldTwoTacticalPrize();
        const base = this.wave >= 4 ? 12.5 : 14.5;
        w2.rewardTimer = base + rand(4.0,-2.0);
      }
      w2.eventTimer=(w2.eventTimer||0)-dt*(this.getDifficulty().eventPace||1);
      if (w2.eventTimer<=0 && this.wave<5) {
        this.triggerWorldTwoMicroEvent(this.wave);
        if (Math.random() < .42) this.spawnWorldTwoTacticalPrize();
        const act=WORLD_TWO_ACTS[this.wave-1];
        w2.eventTimer=(act?.eventEvery||12)+rand(2.2,-1.2);
      }
      w2.hordeTimer = (w2.hordeTimer || 13.2) - dt*(this.getDifficulty().hordePace||1);
      if (w2.hordeTimer <= 0 && this.wave >= 2 && this.wave < 5) {
        this.triggerWorldTwoHorde();
        w2.hordeTimer = rand(this.wave >= 4 ? 15 : 18, this.wave >= 4 ? 12 : 14);
      }
      return false;
    }

    triggerWorldTwoMicroEvent(level=this.wave) {
      if (level===1) {
        ['vora_aguja','vora_colmillo','vora_cuchilla'].forEach((id,i)=>this.spawnEnemyNearPlayer(id,-.9+i*.9,300+i*22,true,1.06));
        this.spawnOrbitalWreck(1,true);
        this.toast('🜂 Incursión Vorácida','Formación de plasma y residuos orbitales');
      } else if (level===2) {
        const w2=this.worldTwoState || {};
        const variant=(w2.formationIndex||0)%4;
        w2.formationIndex=(variant+1)%4;
        const formations=[
          ['void_orbe','void_sifon','void_niebla'],
          ['vora_cuchilla','void_orbe','vora_salto'],
          ['void_nodo','vora_colmillo','void_sifon'],
          ['vora_aguja','void_niebla','vora_alpha']
        ];
        const labels=['Frente del Vacío','Escuadra híbrida','Nodos de intercepción','Cacería en la nebulosa'];
        formations[variant].forEach((id,i)=>this.spawnEnemyNearPlayer(id,-1+i,315+i*12,true,1.02));
        if (variant%2===0) this.spawnWorldTwoHazards();
        if (variant===1 || variant===3) this.spawnMeteor(1,true);
        this.spawnOrbitalWreck(1,variant===3);
        this.toast(`◌ ${labels[variant]}`,'La formación enemiga ha cambiado');
      } else if (level===3) {
        this.zones.push({type:'toxic',x:clamp(this.player.x+rand(240,-240),80,this.w-80),y:clamp(this.player.y+rand(170,-170),80,this.h-80),r:74,life:4.2,max:4.2});
        this.spawnEnemyNearPlayer('void_nodo',-.5,330,false,1);
        this.spawnEnemyNearPlayer('vora_alpha',.55,340,false,1);
        this.spawnPlanetObstacle(1);
        this.spawnMeteorRain(2,true);
        this.toast('◎ Distorsión gravitacional','Planetas errantes cruzan la ruta');
      } else if (level===4) {
        ['metal_ariete','metal_tanque','metal_sierra'].forEach((id,i)=>this.spawnEnemyNearPlayer(id,-.8+i*.8,335+i*18,false,.98));
        this.spawnOrbitalWreck(2,false);
        this.spawnMeteorRain(2,true);
        this.toast('⚙️ Estación abisal','Unidades pesadas bajo tormenta orbital');
      }
      AudioFX.world2Pulse();
    }

    triggerWorldOneMicroEvent(level = this.wave) {
      if (level === 1) {
        for (let i=0;i<3;i++) this.spawnEnemyNearPlayer(pick(['corredor','esquivo','cazador']), -.9 + i*.9, 300 + i*25, true, 1.03);
        this.toast('▰ Formación de caza', 'Patrulla en abanico');
      } else if (level === 2) {
        this.spawnMeteorRain(2, false);
        if (Math.random() < .55) this.spawnPlanetObstacle(1);
        this.toast('☄ Corredor meteórico', 'Trayectoria inestable');
      } else if (level === 3) {
        ['cazador','toxico','nave_espejo'].forEach((id,i) => this.spawnEnemyNearPlayer(id, -1.0 + i, 315, true, 1.05));
        this.toast('🛸 Emboscada', 'Tres firmas hostiles');
      } else if (level === 4) {
        this.spawnPlanetObstacle(1);
        this.spawnEnemyNearPlayer('blindado', -.7, 330, false, .96);
        this.spawnEnemyNearPlayer('nave_espejo', .7, 330, true, 1.02);
        this.toast('🪐 Frontera rota', 'Ruinas y máquinas pesadas');
      }
    }

    getAsset(key) {
      const img = GAME_ASSETS.images[key];
      return img && img.complete && img.naturalWidth ? img : null;
    }

    drawImageCover(ctx, img, dx, dy, dw, dh, opts = {}) {
      if (!img || !img.complete || !img.naturalWidth) return;
      const scale = opts.scale || 1;
      const sw = dw * scale;
      const sh = dh * scale;
      const ratio = Math.max(sw / img.naturalWidth, sh / img.naturalHeight);
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      const x = dx + (dw - w) / 2 + (opts.offsetX || 0);
      const y = dy + (dh - h) / 2 + (opts.offsetY || 0);
      ctx.save();
      ctx.globalAlpha = opts.alpha ?? 1;
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();
    }

    start(mapIndex = 0, save = null) {
      this.requestMobilePlayMode();
      AudioFX.ensure();
      AudioFX.startMelody();
      const p = currentProfile();
      p.stats.runs += 1;
      unlockAchievement('first_run');
      this.mapIndex = save?.mapIndex ?? clamp(mapIndex, 0, MAPS.length - 1);
      this.difficulty = DIFFICULTY_MODES[save?.difficulty] ? save.difficulty : (DIFFICULTY_MODES[p.preferredDifficulty] ? p.preferredDifficulty : (DIFFICULTY_MODES[state.settings.difficulty] ? state.settings.difficulty : 'normal'));
      p.preferredDifficulty = this.difficulty;
      state.settings.difficulty = this.difficulty;
      this.syncDifficultyUi?.();
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
      this.worldOneState = { meteorTimer: 5.2, insectTimer: 3.6, mirrorCount: 0, rainTimer: 9.5, burstTimer: 3.2, bombTimer: 6.4, planetTimer: 10.8, hunterTimer: 4.2, rewardSteps: [], backgroundPhase: 0, eventTimer: 8.5, hordeTimer: 15.5, hordeSeen: 0, actSeen: 0, captainsSpawned: 0, captainsKilled: 0, captainTimer: 2.4, bossPrelude: 0, bossPreludeMax: 4.8, bossPreludeStarted: false };
      this.worldTwoState = { sporeTimer: 3.8, fogTimer: 7.2, splitTimer: 5.0, rewardSteps: [], backgroundPhase: 0, labPulse: 0, colonyTimer: 8.2, toxicZoneTimer: 7.0, junkTimer: 4.8, meteorTimer: 5.8, planetTimer: 10.8, chaosTimer: 8.6, rewardTimer: 7.0, eventTimer: 8.5, hordeTimer: 13.2, hordeSeen: 0, formationIndex: 0, enemyHistory: [], actSeen: 0, captainsSpawned: 0, captainsKilled: 0, captainTimer: 1.0, level5Elapsed: 0, bossPrelude: 0, bossPreludeMax: 5.3, bossPreludeStarted: false };
      this.worldThreeState={rewardSteps:[],eventTimer:7.5,rewardTimer:8.5,hordeTimer:13.5,hazardTimer:6.5,speedBurst:0,hordeSeen:0,enemyHistory:[]};
      this.worldFourState={rewardSteps:[],eventTimer:7.0,rewardTimer:8.0,hazardTimer:7.4,hordeTimer:12.5,enemyHistory:[]};
      this.worldFiveState={rewardSteps:[],eventTimer:6.5,rewardTimer:7.5,hazardTimer:6.8,hordeTimer:11.8,enemyHistory:[]}; this.world3Stars=[];
      if (save?.worldOneState && this.mapIndex === 0) this.worldOneState = { ...this.worldOneState, ...save.worldOneState };
      if (save?.worldTwoState && this.mapIndex === 1) this.worldTwoState = { ...this.worldTwoState, ...save.worldTwoState };
      if (save?.worldThreeState && this.mapIndex === 2) this.worldThreeState = { ...this.worldThreeState, ...save.worldThreeState };
      if (save?.worldFourState && this.mapIndex === 3) this.worldFourState = { ...this.worldFourState, ...save.worldFourState };
      if (save?.worldFiveState && this.mapIndex === 4) this.worldFiveState = { ...this.worldFiveState, ...save.worldFiveState };
      this.powerLevels = save?.powerLevels || {};
      this.powerActivity = save?.powerActivity || {};
      this.powerQueue=save?.powerQueue||[]; this.activeCombos={};
      this.recentPowerHistory=save?.recentPowerHistory||[];
      this.progressWatch={level:this.wave||1,kills:this.worldStage?.kills||0,stagnant:0,rescues:0};
      this.powerSupportTimer=7;
      this.activePowerSlots = save?.activePowerSlots || { weaponMode: null };
      this.fusions = save?.fusions || {};
      this.run = save?.run || { score: 0, coins: 0, experience: 0, kills: 0, bosses: 0, start: Date.now(), mapComplete: false, lifePurchases: 0 };
      this.run.spendableScore = Number.isFinite(this.run.spendableScore) ? this.run.spendableScore : Math.round(this.run.score || 0);
      this.run.tacticalPurchases = this.run.tacticalPurchases || {};
      this.run.tacticalBoosts = this.run.tacticalBoosts || {};
      this.run.tacticalDeliveryQueue = this.run.tacticalDeliveryQueue || [];
      this.tacticalOffers = [];
      this.tacticalPrepReason = null;
      this.tacticalDeliveryDelay = 0;
      this.tacticalComboLockUntil = 0;
      this.tacticalComboLockedId = null;
      this.defeatPowerDropsIssued = false;
      this.lastBossLootPower = null;
      this.worldStage = save?.worldStage || { level: Math.max(1, save?.wave || 1), kills: 0, targets: (WORLD_STAGE_TARGETS[this.mapIndex] || [20,30,40,50,60]), totalLevels: 5, bossLevel: 5 };
      this.worldStage.targets = WORLD_STAGE_TARGETS[this.mapIndex] || this.worldStage.targets || [20,30,40,50,60];
      this.worldStage.totalLevels = this.worldStage.targets.length;
      this.worldStage.bossLevel = this.worldStage.targets.length;
      if (this.mapIndex < 5) this.wave = this.worldStage.level;
      this.replayMode = save?.replayMode || null;
      if (!save && this.mapIndex === 0 && !this.replayMode) p.campaignExtraLives = 4;
      const campaignLives = (!save && this.mapIndex > 0 && !this.replayMode) ? (p.campaignExtraLives ?? 4) : 4;
      this.extraLives = Math.min(MAX_TOTAL_LIVES - 1, save?.extraLives ?? campaignLives);
      this.nextLifeScore = save?.nextLifeScore || SCORE_LIFE_STEP;
      this.outcomeFinalized = false;
      this.lastWorldLifeBonus = 0;
      this.createPlayer(save?.player);
      p.levelProgress = p.levelProgress || {1:1};
      if (!this.replayMode) p.levelProgress[this.mapIndex + 1] = Math.max(p.levelProgress[this.mapIndex + 1] || 1, this.wave || 1);
      this.applyProfileRelics(save);
      this.applyPerformanceMode();
      this.grantWorldEntrySupport(!!save);
      this.updateOrientationHint();
      if (this.player.avatar.mod.drone && !this.drones.length) this.spawnDrone(9999, true);
      if (!save && this.mapIndex === 0) this.setupWorldOneIntro();
      if (!save && this.mapIndex === 1) this.setupWorldTwoIntro();
      if (!save && this.mapIndex === 2) this.setupWorldThreeIntro();
      if (!save && this.mapIndex === 3) this.setupWorldFourIntro();
      if (!save && this.mapIndex === 4) this.setupWorldFiveIntro();
      this.running = true;
      this.paused = false;
      this.cardPause = false;
      this.last = now();
      showScreen('screenGame');
      AudioFX.music(this.mapIndex, false, MAPS[this.mapIndex]?.family || 'zombie', 1);
      hideOverlays();
      if (els.bossIntroOverlay) { els.bossIntroOverlay.classList.add('hidden'); els.bossIntroOverlay.dataset.family = ''; }
      this.updatePendingBadge();
      this.toast(`${MAPS[this.mapIndex].name} · ${this.getDifficulty().name}`, MAPS[this.mapIndex].lore);
      requestAnimationFrame(t => this.loop(t));
      saveState();
      setTimeout(()=>this.requestTacticalPrep(save?'resume':'start'),70);
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
        speed: 255,
        moveVx: 0,
        moveVy: 0,
        moveResponse: 18,
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
        gravMineTimer: .7,
        disruptorTimer: .9,
        plasmaTimer: .5,
        relicMeteorTimer: saved?.relicMeteorTimer ?? 4.5,
        bossDrive: 0,
        cloak: 0,
        entryShieldTimer: saved?.entryShieldTimer ?? 0,
        entryShieldMax: saved?.entryShieldMax ?? 0,
        avatar,
        shipParts: { core: 0, wings: 0, cannon: 0, engine: 0 },
        shotTier: 0,
        morphTier: p.morphTier || (1 + Math.min(5,(p.completedMaps||[]).length)),
        shipParts: { core:0,wings:0,cannon:0,engine:0,...(p.shipParts||{}) },
        projectileSpeedBonus: 1,
        aimAssist: 0
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
      const progression = { shotTier: 0, projectileSpeedTier: 0, accuracyTier: 0, mobilityTier: 0, rangeTier: 0, ...(p.worldProgression || {}) };
      player.speed *= 1 + Math.min(.18, Math.max(0, progression.mobilityTier || 0) * .035);
      player.shotTier = Math.max(0, progression.shotTier || 0);
      player.damage *= 1 + player.shotTier * .12;
      player.projectileSpeedBonus = 1 + Math.max(0, progression.projectileSpeedTier || 0) * .09;
      player.rangeTier = Math.max(0, progression.rangeTier || 0);
      player.projectileRangeBonus = 1 + player.rangeTier * .08;
      player.aimAssist = Math.min(.28, Math.max(0, progression.accuracyTier || 0) * .045);
      player.crit += Math.min(.08, Math.max(0, progression.accuracyTier || 0) * .012);
      player.fireDelay = Math.max(245, player.fireDelay * (1 - Math.min(.22, player.shotTier * .035)));
      player.baseSpeed = player.speed;
      player.nominalSpeed = player.speed;
      player.recoverySpeedTimer = saved?.recoverySpeedTimer ?? 0;
      const clearedPowerWorlds=Math.min(5,(p.completedMaps||[]).length); player.powerEffectScale=1+clearedPowerWorlds*.04; player.powerDurationScale=1+clearedPowerWorlds*.03;
      player.hp = clamp(player.hp, 1, player.maxHp);
      player.shield = clamp(player.shield, 0, player.maxShield);
      this.player = player;
      this.pointer.x = player.x;
      this.pointer.y = player.y;
    }

    loop(t) {
      if (!this.running) return;
      const dt = Math.min(0.029, (t - this.last) / 1000 || 0.016);
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
      p.comboSurge = Math.max(0, (p.comboSurge || 0) - dt);
      p.cloak = Math.max(0, (p.cloak || 0) - dt);
      p.entryShieldTimer = Math.max(0, (p.entryShieldTimer || 0) - dt);
      p.recoveryGraceTimer = Math.max(0, (p.recoveryGraceTimer || 0) - dt);
      p.recoverySpeedTimer = Math.max(0, (p.recoverySpeedTimer || 0) - dt);
      this.shake = Math.max(0, this.shake - dt * 30);
      this.flash = Math.max(0, this.flash - dt * 2);
      this.updatePowerActivity(dt);
      this.updateBossLootPhase(dt);
      this.ensureProgressFlow(dt);
      this.ensureTacticalPowerSupport(dt);
      this.updateRareEvents(dt);

      const regen = p.regen * dt;
      if (regen > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + regen);
      p.shield = Math.min(p.maxShield, p.shield + dt * (3 + (this.powerLevels.ring || 0) * 2));

      this.handleMovement(dt);
      if (this.updateWorldOneDirector(dt) || this.updateWorldTwoDirector(dt) || this.updateWorldThreeDirector(dt)) {
        this.updateDrones(dt);
        this.updateParticles(dt);
        this.updateHud();
        return;
      }
      if (this.bossFight?.cinematic > 0) {
        this.bossFight.cinematic -= dt;
        this.updateHud();
        return;
      }
      this.handleInheritedRelics(dt);
      this.handleShooting(dt);
      this.handlePowers(dt);
      this.updateBossFight(dt);
      this.spawnLogic(dt);
      this.updateMeteors(dt);
      this.updateEnemies(dt);
      this.updateBullets(dt);
      this.updatePickups(dt);
      this.updateTacticalDeliveries(dt);
      this.updateDrones(dt);
      this.updateZones(dt);
      this.updateParticles(dt);
      this.updateOfferState(dt);
      this.checkWave();
      this.checkScoreLifeAwards();
      this.updateHud();

      if (p.hp <= 0) this.end(false);
    }

    getDifficulty() { return DIFFICULTY_MODES[this.difficulty] || DIFFICULTY_MODES.normal; }

    isHardMode() { return this.difficulty === 'hard'; }

    syncDifficultyUi() {
      document.querySelectorAll('[data-difficulty]').forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === (this.difficulty || currentProfile()?.preferredDifficulty || state.settings.difficulty || 'normal')));
      if (els.pauseMiniContext && this.running) els.pauseMiniContext.textContent = `M${this.mapIndex + 1} · Nivel ${this.wave} · ${this.getDifficulty().name}`;
    }

    getStagePowerScale() {
      const level = clamp(this.worldStage?.level || this.wave || 1, 1, 5);
      const key = this.getTacticalLevelKey();
      const tactical = Math.max(0, Math.min(.32, Number(this.run?.tacticalBoosts?.[key] || 0)));
      const difficulty = this.getDifficulty();
      return (1 + Math.max(0, level - 1) * .03) * (1 + tactical) * (difficulty.powerEffect || 1);
    }

    getTacticalLevelKey() {
      return `m${Math.max(1,(this.mapIndex||0)+1)}l${Math.max(1,this.worldStage?.level||this.wave||1)}`;
    }

    getTacticalPurchaseLimit() {
      const world = Math.max(1, Math.min(10, (this.mapIndex || 0) + 1));
      return TACTICAL_PURCHASE_LIMITS[world - 1] || 20;
    }

    getTacticalPurchasesUsed() {
      const key = this.getTacticalLevelKey();
      return Math.max(0, Number(this.run?.tacticalPurchases?.[key] || 0));
    }

    getTacticalPurchasesRemaining() {
      return Math.max(0, this.getTacticalPurchaseLimit() - this.getTacticalPurchasesUsed());
    }

    getTacticalWallet() {
      return {
        coins: Math.max(0, Math.round((this.run?.coins || 0) + (currentProfile().coins || 0))),
        xp: Math.max(0, Math.round(this.run?.experience || 0)),
        points: Math.max(0, Math.round(this.run?.spendableScore || 0))
      };
    }

    tacticalRound(value) { return Math.max(5, Math.round(value / 5) * 5); }

    getTacticalCosts(offer) {
      const used = this.getTacticalPurchasesUsed();
      const worldFactor = 1 + Math.max(0, this.mapIndex) * .16;
      const levelFactor = 1 + Math.max(0, (this.wave || 1) - 1) * .05;
      const repeatFactor = 1 + used * .08;
      const mult = worldFactor * levelFactor * repeatFactor;
      const base = offer.base || { coins: 150, xp: 190, points: 1000 };
      return {
        coins: this.tacticalRound(base.coins * mult),
        xp: this.tacticalRound(base.xp * mult),
        points: this.tacticalRound(base.points * mult)
      };
    }

    getBestTacticalComboOffer() {
      const known = id => (this.powerLevels?.[id] || 0) > 0;
      const ranked = FUSIONS.map(f => {
        const owned = f.requires.filter(known);
        return { fusion:f, owned, score:owned.length * 20 + (this.activeCombos?.[f.id] ? 4 : 0) };
      }).filter(x => x.owned.length > 0).sort((a,b)=>b.score-a.score);
      if (!ranked.length) return null;
      const best = ranked[0];
      if (best.owned.length === best.fusion.requires.length) {
        return {
          id:`combo_${best.fusion.id}`, kind:'combo', comboId:best.fusion.id, units:2,
          icon:best.fusion.icon, name:`Combo · ${best.fusion.name}`,
          desc:'Reactiva la combinación completa durante 8 segundos.',
          base:{coins:290,xp:370,points:2050}, recommended:true,
          reason:'Ya posees los poderes compatibles.'
        };
      }
      const missing = best.fusion.requires.find(id => !known(id));
      const pow = POWERS.find(p => p.id === missing);
      if (!missing || !pow) return null;
      return {
        id:`complete_${best.fusion.id}_${missing}`, kind:'power', powerId:missing, units:1,
        icon:pow.icon, name:`Completar ${best.fusion.name}`,
        desc:`Añade ${pow.name} para habilitar la confluencia.`,
        base:{coins:175,xp:225,points:1250}, recommended:true,
        reason:`Te falta ${pow.name} para el combo.`
      };
    }

    buildTacticalOffers() {
      const crowded = (this.enemies?.filter(e=>!e.boss).length || 0) >= 8 || (this.wave || 1) >= 3;
      const fragile = this.player && (this.player.hp < this.player.maxHp * .72 || this.player.shield < this.player.maxShield * .58);
      const currentBoost = Math.max(0, Number(this.run?.tacticalBoosts?.[this.getTacticalLevelKey()] || 0));
      const pendingBoost = (this.run?.tacticalDeliveryQueue || []).filter(x=>x?.type==='boost').reduce((sum,x)=>sum+Number(x.boostValue||.08),0);
      const effectiveBoost = Math.min(.24,currentBoost+pendingBoost);
      const offers = [
        {id:'nuke',kind:'nuke',units:1,icon:'☢',name:'Bomba antihorda',desc:'Limpia gran parte de la pantalla y daña objetivos mayores.',base:{coins:185,xp:255,points:1400},recommended:crowded,reason:'Alta densidad u horda probable.'},
        {id:'afterburner',kind:'power',powerId:'afterburner',units:1,icon:'»',name:'Impulsor vectorial',desc:'Recupera movilidad y velocidad durante 10 segundos.',base:{coins:135,xp:175,points:930},recommended:this.mapIndex>=2,reason:'La velocidad es crítica en mundos avanzados.'},
        {id:'stasis',kind:'power',powerId:'stasis',units:1,icon:'⌛',name:'Ralentizador temporal',desc:'Reduce durante 10 segundos la presión de enemigos y proyectiles.',base:{coins:145,xp:185,points:980},recommended:crowded,reason:'Ayuda a controlar hordas.'},
        {id:'shield',kind:'shield',units:1,icon:'🛡️',name:'Escudo de refuerzo',desc:'Cápsula de shield para entrar con margen defensivo.',base:{coins:110,xp:145,points:760},recommended:!!fragile,reason:'Tus reservas defensivas están bajas.'},
        {id:'nanorepair',kind:'power',powerId:'nanorepair',units:1,icon:'✚',name:'Nanorreparación',desc:'Regeneración temporal para estabilizar la nave.',base:{coins:150,xp:205,points:1080},recommended:!!fragile,reason:'Recuperación sostenida.'},
        {id:'wingman',kind:'power',powerId:'wingman',units:1,icon:'🛸',name:'Nave auxiliar',desc:'Añade apoyo de fuego temporal; puede convivir con otros poderes.',base:{coins:165,xp:215,points:1160},recommended:false},
        {id:'phase',kind:'power',powerId:'phase',units:1,icon:'👻',name:'Fase espectral',desc:'Ventana breve de evasión para atravesar presión enemiga.',base:{coins:160,xp:210,points:1130},recommended:this.mapIndex>=3,reason:'Útil en patrones cerrados.'},
        {id:'arsenal',kind:'boost',boostValue:.08,units:1,icon:'⬆',name:'Sobrecarga de arsenal +8%',desc:`Mejora todos los poderes de este nivel. Acumulado/pendiente: +${Math.round(effectiveBoost*100)}% (máx. +24%).`,base:{coins:195,xp:270,points:1480},recommended:effectiveBoost<.08,reason:'Potencia simultáneamente tu construcción actual.',disabled:effectiveBoost>=.24}
      ];
      const combo = this.getBestTacticalComboOffer();
      if (combo) offers.push(combo);
      offers.sort((a,b)=>(b.recommended?1:0)-(a.recommended?1:0));
      this.tacticalOffers = offers.slice(0,9);
      return this.tacticalOffers;
    }

    getTacticalAdvisorText() {
      const reasons = (this.tacticalOffers || []).filter(o=>o.recommended && o.reason).slice(0,3).map(o=>o.reason);
      if (!reasons.length) return 'Compra solo si quieres reforzar la nave. Puedes continuar sin gastar recursos.';
      return reasons.join(' ');
    }

    renderTacticalShop() {
      if (!els.tacticalShopGrid) return;
      const offers = this.buildTacticalOffers();
      const wallet = this.getTacticalWallet();
      const used = this.getTacticalPurchasesUsed(), limit = this.getTacticalPurchaseLimit(), remaining = Math.max(0,limit-used);
      if (els.tacticalShopTitle) els.tacticalShopTitle.textContent = `Mundo ${this.mapIndex+1} · Nivel ${this.wave}`;
      if (els.tacticalShopLimit) els.tacticalShopLimit.textContent = `${used}/${limit} compras usadas · ${remaining} disponibles`;
      if (els.tacticalWallet) els.tacticalWallet.innerHTML = `<span>🪙 <b>${wallet.coins}</b></span><span>✦ <b>${wallet.xp} XP</b></span><span>⭐ <b>${wallet.points}</b> puntos disponibles</span>`;
      if (els.tacticalAdvisor) els.tacticalAdvisor.innerHTML = `<strong>Asesor táctico:</strong> ${this.getTacticalAdvisorText()}`;
      els.tacticalShopGrid.innerHTML = offers.map(offer => {
        const costs=this.getTacticalCosts(offer), units=offer.units||1, slotsOk=remaining>=units && !offer.disabled;
        const buttons=[['coins','🪙',costs.coins],['xp','✦',costs.xp],['points','⭐',costs.points]].map(([cur,ic,cost])=>{
          const can = slotsOk && wallet[cur] >= cost;
          return `<button class="tactical-buy" data-tactical-buy="${offer.id}" data-tactical-currency="${cur}" ${can?'':'disabled'}>${ic} ${cost}</button>`;
        }).join('');
        return `<article class="tactical-offer ${offer.recommended?'recommended':''}"><div class="tactical-offer-icon">${offer.icon||'✦'}</div><div class="tactical-offer-body"><div class="tactical-offer-title">${offer.name}${units>1?` · ${units} compras`:''}</div><small class="tactical-offer-desc">${offer.desc}</small><div class="tactical-costs">${buttons}</div></div></article>`;
      }).join('');
    }

    spendTacticalCurrency(currency, amount) {
      amount = Math.max(0, Math.round(amount || 0));
      if (!amount) return true;
      const wallet = this.getTacticalWallet();
      if ((wallet[currency] || 0) < amount) return false;
      if (currency === 'coins') {
        const fromRun = Math.min(this.run.coins || 0, amount);
        this.run.coins = Math.max(0, (this.run.coins || 0) - fromRun);
        const rest = amount - fromRun;
        if (rest > 0) currentProfile().coins = Math.max(0, (currentProfile().coins || 0) - rest);
      } else if (currency === 'xp') this.run.experience = Math.max(0, (this.run.experience || 0) - amount);
      else if (currency === 'points') this.run.spendableScore = Math.max(0, (this.run.spendableScore || 0) - amount);
      return true;
    }

    queueTacticalDelivery(offer) {
      this.run.tacticalDeliveryQueue = this.run.tacticalDeliveryQueue || [];
      if (offer.kind === 'nuke') this.run.tacticalDeliveryQueue.push({type:'nuke',label:'☢ BOMBA ANTIHORDA'});
      else if (offer.kind === 'shield') this.run.tacticalDeliveryQueue.push({type:'shield',value:32+this.mapIndex*3,label:`SHIELD +${32+this.mapIndex*3}`});
      else if (offer.kind === 'boost') this.run.tacticalDeliveryQueue.push({type:'boost',boostValue:offer.boostValue||.08,label:'⬆ SOBRECARGA DE PODERES'});
      else if (offer.kind === 'combo') this.run.tacticalDeliveryQueue.push({type:'combo',comboId:offer.comboId,label:`⚡ ${offer.name.toUpperCase()}`,powerDuration:8});
      else if (offer.kind === 'power') {
        const pow=POWERS.find(p=>p.id===offer.powerId);
        this.run.tacticalDeliveryQueue.push({type:'power',powerId:offer.powerId,label:(pow?.name||offer.name).toUpperCase(),powerDuration:Math.max(10,POWER_ACTIVE_SECONDS[offer.powerId]||10)});
      }
    }

    buyTacticalOffer(offerId, currency) {
      const offer=(this.tacticalOffers||[]).find(o=>o.id===offerId); if(!offer)return false;
      const units=offer.units||1, remaining=this.getTacticalPurchasesRemaining();
      if(offer.disabled || remaining<units)return false;
      const costs=this.getTacticalCosts(offer), cost=costs[currency]; if(!cost)return false;
      if(!this.spendTacticalCurrency(currency,cost))return false;
      const key=this.getTacticalLevelKey(); this.run.tacticalPurchases[key]=(this.run.tacticalPurchases[key]||0)+units;
      this.queueTacticalDelivery(offer);
      this.toast('🛒 Compra táctica',`${offer.name} · añadido a la entrega gradual`);
      this.tacticalDeliveryDelay=Math.min(this.tacticalDeliveryDelay||0,.25);
      saveState(); this.renderTacticalShop(); this.updateTacticalCart(false); this.deployNextTacticalBatch(); this.updateHud();
      return true;
    }

    applyTacticalPowerBoost(value=.08) {
      const key=this.getTacticalLevelKey(); this.run.tacticalBoosts=this.run.tacticalBoosts||{};
      this.run.tacticalBoosts[key]=Math.min(.24,(this.run.tacticalBoosts[key]||0)+Math.max(.01,value));
      this.toast('⬆ SOBRECARGA DE ARSENAL',`Poderes +${Math.round(this.run.tacticalBoosts[key]*100)}% durante este nivel`);
      saveState();
    }

    deployNextTacticalBatch() {
      if (!this.player || !this.run?.tacticalDeliveryQueue?.length) return false;
      if (this.pickups?.some(pk=>pk.tacticalPurchase)) return false;
      if ((this.tacticalDeliveryDelay || 0) > 0) return false;
      if (this.tacticalComboLockedId && this.comboActive(this.tacticalComboLockedId)) return false;
      if ((this.tacticalComboLockUntil || 0) > now()) return false;
      this.tacticalComboLockedId=null;
      const queue=this.run.tacticalDeliveryQueue;
      const first=queue[0];
      const batch=[];
      if(first?.type==='combo') batch.push(queue.shift());
      else {
        while(queue.length && batch.length<3 && queue[0]?.type!=='combo') batch.push(queue.shift());
      }
      if(!batch.length)return false;
      const p=this.player,total=batch.length;
      batch.forEach((entry,i)=>{
        const a=-Math.PI/2+(Math.PI*2/Math.max(1,total))*i, radius=128+(i%2)*28;
        const x=clamp(p.x+Math.cos(a)*radius,46,this.w-46), y=clamp(p.y+Math.sin(a)*radius,46,this.h-46);
        const opts={tacticalPurchase:true,rewardGlow:true,major:true,label:entry.label||'COMPRA TÁCTICA',life:999,autoDelay:999};
        if(entry.type==='power')this.spawnPickup(x,y,'power',1,{...opts,powerId:entry.powerId,powerDuration:entry.powerDuration||10});
        else if(entry.type==='combo')this.spawnPickup(x,y,'combo',1,{...opts,comboId:entry.comboId,powerDuration:entry.powerDuration||8});
        else if(entry.type==='shield')this.spawnPickup(x,y,'shield',entry.value||35,opts);
        else if(entry.type==='boost')this.spawnPickup(x,y,'boost',1,{...opts,boostValue:entry.boostValue||.08});
        else if(entry.type==='nuke')this.spawnPickup(x,y,'nuke',1,opts);
      });
      saveState();
      if(first?.type==='combo') this.toast('⚡ COMBO EN ESPERA',`${batch[0].label||'Combo táctico'} · recógelo cuando estés listo`);
      else this.toast('✦ ENTREGA TÁCTICA',`${batch.length} elemento${batch.length>1?'s compatibles':''} flotando para recoger`);
      return true;
    }

    updateTacticalDeliveries(dt) {
      this.tacticalDeliveryDelay=Math.max(0,(this.tacticalDeliveryDelay||0)-dt);
      if(!this.running||this.run?.mapComplete)return;
      if(this.pickups?.some(pk=>pk.tacticalPurchase))return;
      if(!this.run?.tacticalDeliveryQueue?.length)return;
      if(this.tacticalComboLockedId&&this.comboActive(this.tacticalComboLockedId))return;
      if((this.tacticalComboLockUntil||0)>now())return;
      this.tacticalComboLockedId=null;
      this.deployNextTacticalBatch();
    }

    updateTacticalCart(pulse=false) {
      if(!els.btnTacticalCart||!els.tacticalCartCount)return;
      const remaining=this.getTacticalPurchasesRemaining();
      els.tacticalCartCount.textContent=String(remaining);
      els.btnTacticalCart.classList.toggle('sold-out',remaining<=0);
      els.btnTacticalCart.title=remaining>0?`Compra Exprés · ${remaining} compras disponibles`:'Compra Exprés · límite del nivel alcanzado';
      if(pulse&&remaining>0){els.btnTacticalCart.classList.remove('cart-pulse');void els.btnTacticalCart.offsetWidth;els.btnTacticalCart.classList.add('cart-pulse');setTimeout(()=>els.btnTacticalCart?.classList.remove('cart-pulse'),2600);}
    }

    requestTacticalPrep(reason='level') {
      if (!this.running || this.run?.mapComplete) return false;
      const remaining=this.getTacticalPurchasesRemaining();
      this.tacticalPrepReason=reason;
      els.tacticalPrepPrompt?.classList.add('hidden');
      this.updateTacticalCart(true);
      if(remaining<=0)return false;
      return true;
    }

    openTacticalShop() {
      if(!this.running||this.run?.mapComplete)return;
      if(this.getTacticalPurchasesRemaining()<=0){this.toast('🛒 Compra Exprés',`Límite del nivel alcanzado · ${this.getTacticalPurchaseLimit()} compras`);return;}
      this.renderTacticalShop();
      els.tacticalShopOverlay?.classList.toggle('hidden');
      this.updateTacticalCart(false);
    }

    closeTacticalPrep() {
      els.tacticalPrepPrompt?.classList.add('hidden');
      els.tacticalShopOverlay?.classList.add('hidden');
      this.updateTacticalCart(false);
      this.deployNextTacticalBatch();
    }

    startTacticalCountdown() {
      els.tacticalCountdown?.classList.add('hidden');
    }

    isPrimaryWeaponPower(id) { return ['triple','laser','voidray'].includes(id); }

    powersHaveDirectCombo(a,b) {
      if (!a || !b || a === b) return false;
      return FUSIONS.some(f => f.requires?.length === 2 && f.requires.includes(a) && f.requires.includes(b));
    }

    markPowerActive(id, seconds) {
      if (!id) return;
      const next=(seconds||POWER_ACTIVE_SECONDS[id]||6)*(this.player?.powerDurationScale||1)*this.getStagePowerScale()*(this.getDifficulty().powerDuration||1);
      const primary=this.isPrimaryWeaponPower(id);
      if(primary){
        this.powerQueue=this.powerQueue||[];
        const current=this.activePowerSlots?.weaponMode;
        if(current && current!==id && this.isPowerActive(current)){
          if (!this.powersHaveDirectCombo(current,id)) {
            const q=this.powerQueue.find(x=>x.id===id);
            if(q)q.seconds=Math.min(30,Math.max(q.seconds,next)+next*.45); else this.powerQueue.push({id,seconds:next});
            this.toast('⏳ Poder en cola',`${POWERS.find(p=>p.id===id)?.name||id} · se activará después`);
            return 'queued';
          }
          this.toast('⚡ CONFLUENCIA',`${POWERS.find(p=>p.id===current)?.name||current} + ${POWERS.find(p=>p.id===id)?.name||id}`);
        }
      }
      this.powerActivity[id]=Math.min(36,Math.max(this.powerActivity[id]||0,next)+((this.powerActivity[id]||0)>0?next*.28:0));
      this.activatePowerSlot(id); return 'active';
    }

    isPowerActive(id) { return !!((this.powerLevels?.[id]||0)>0&&(this.powerActivity?.[id]||0)>.04); }

    getPowerLevel(id, activeOnly=false) {
      const lvl=this.powerLevels?.[id]||0; if(!lvl)return 0;
      const scaled=lvl*(this.player?.powerEffectScale||1)*this.getStagePowerScale();
      return activeOnly?(this.isPowerActive(id)?scaled:0):scaled;
    }

    activatePowerSlot(id) { const pow=POWERS.find(p=>p.id===id); if(pow&&['triple','laser','voidray'].includes(pow.id))this.activePowerSlots.weaponMode=pow.id; }

    resolvePowerSlots() {
      if(!this.activePowerSlots)this.activePowerSlots={weaponMode:null};
      const current=this.activePowerSlots.weaponMode;
      if(current&&this.isPowerActive(current))return;
      this.activePowerSlots.weaponMode=null; this.powerQueue=this.powerQueue||[];
      while(this.powerQueue.length){const q=this.powerQueue.shift();if(!q?.id)continue;this.powerActivity[q.id]=Math.max(this.powerActivity[q.id]||0,q.seconds||POWER_ACTIVE_SECONDS[q.id]||8);this.activePowerSlots.weaponMode=q.id;this.toast('▶ Cola activada',POWERS.find(p=>p.id===q.id)?.name||q.id);return;}
      const candidates=['voidray','laser','triple'].filter(id=>this.isPowerActive(id));
      if(candidates.length){candidates.sort((a,b)=>(this.powerActivity[b]||0)-(this.powerActivity[a]||0));this.activePowerSlots.weaponMode=candidates[0];}
    }

    comboActive(id){return !!this.activeCombos?.[id];}
    syncActiveCombos(){
      const prev=this.activeCombos||{},next={};
      for(const f of FUSIONS)if(f.requires.every(id=>this.isPowerActive(id)))next[f.id]=true;
      let activated=0;
      for(const id of Object.keys(next))if(!prev[id]){
        activated++;
        const f=FUSIONS.find(x=>x.id===id);
        this.toast('COMBO ACTIVO',`${f?.name||id}`);
        if (this.player) {
          this.player.comboSurge=Math.max(this.player.comboSurge||0,3.8);
          this.particles.push({type:'ring',x:this.player.x,y:this.player.y,r:18,maxR:118,life:.46,max:.46,color:'#ffd56a'});
          this.particles.push({type:'ring',x:this.player.x,y:this.player.y,r:26,maxR:152,life:.58,max:.58,color:'#c391ff'});
        }
        this.flash=Math.max(this.flash,.38);this.shake=Math.max(this.shake,3);
        AudioFX.chord([523.25,659.25,783.99],.16,.04);
      }
      const comboCount=Object.keys(next).length;
      if(this.player&&comboCount>=2&&(activated>0||Object.keys(prev).length<2)){
        this.player.comboSurge=Math.max(this.player.comboSurge||0,5.2);
        this.player.shield=Math.min(this.player.maxShield,this.player.shield+this.player.maxShield*.08);
        this.toast('SUPERCOMBO',`${comboCount} combinaciones sincronizadas`);
        this.flash=Math.max(this.flash,.52);this.shake=Math.max(this.shake,4.5);
      }
      this.activeCombos=next;
    }

    applyProfileRelics(save = null) {
      const profile=currentProfile();profile.relics=profile.relics||{};const p=this.player;if(!p)return;
      if(this.mapIndex>0&&profile.relics.world1Core){
        p.maxShield+=14;p.shield=Math.min(p.maxShield,p.shield+14);p.damage*=1.10;p.fireDelay*=.94;p.relicMeteorTimer=save?Math.max(3,p.relicMeteorTimer||0):4.5;
        if(!save){this.spawnDrone(18,false,{support:true,radius:126,fireRate:.21,damageScale:.96,color:'#ffd56a'});this.toast('NÚCLEO METEÓRICO HEREDADO','Impacto automático cada 18s');}
      }
      if(this.mapIndex>1&&profile.relics.world2Spore){
        p.powerEffectScale=(p.powerEffectScale||1)*1.06;p.powerDurationScale=(p.powerDurationScale||1)*1.04;p.maxShield+=8;p.shield=Math.min(p.maxShield,p.shield+8);
        if(!save){this.spawnDrone(14,false,{support:true,inheritPower:true,count:1,radius:142,fireRate:.20,damageScale:.92,color:'#74ffd1'});this.toast('MATRIZ DE CONVERGENCIA','Poderes +6% · duración +4%');}
      }
      if(this.mapIndex>2&&profile.relics.world3Inferno){
        p.damage*=1.08;p.fireDelay=Math.max(180,p.fireDelay*.97);p.powerEffectScale=(p.powerEffectScale||1)*1.04;
        if(!save)this.toast('CORAZÓN ÍGNEO','Daño reforzado · poderes ofensivos mejorados');
      }
      if(this.mapIndex>3&&profile.relics.world4Hex){p.aimAssist=Math.min(.35,(p.aimAssist||0)+.05);p.maxShield+=10;p.shield=Math.min(p.maxShield,p.shield+10);if(!save)this.toast('SELLO ASTRAL','Precisión y defensa heredadas');}
    }


    grantWorldEntrySupport(fromSave = false) {
      const p = currentProfile();
      if (!this.player) return;
      const completed = (p.completedMaps || []).length;
      const duration = fromSave ? 5.5 : (10 + Math.min(3, this.mapIndex) * 1.0);
      this.player.entryShieldTimer = Math.max(this.player.entryShieldTimer || 0, duration);
      this.player.entryShieldMax = Math.max(this.player.entryShieldMax || 0, duration);
      this.player.shield = this.player.maxShield;
      if (!fromSave) this.toast('🛡️ ESCUDO DE ENTRADA', `${Math.ceil(duration)} segundos de protección`);
      if (!fromSave && this.mapIndex > 0) {
        const prog = p.worldProgression || {};
        const mk = 1 + Math.max(0, prog.shotTier || 0);
        const dmgPct = Math.round(Math.max(0, prog.shotTier || 0) * 12);
        const rangePct = Math.round(Math.max(0, prog.rangeTier || 0) * 8);
        this.toast(`🔫 ARMA BASE MK-${mk}`, `Daño +${dmgPct}% · alcance +${rangePct}% · mejora permanente`);
        const count = Math.min(4, Math.max(1, completed));
        this.spawnDrone(11 + this.mapIndex * 1.5, false, {
          support: true,
          inheritPower: true,
          count,
          radius: 105 + count * 9,
          fireRate: .25,
          damageScale: .82 + Math.min(.18, this.mapIndex * .04),
          color: '#9fd4ff'
        });
        this.toast('🛸 Escolta heredada',`${count} nave${count>1?'s':''} aliada${count>1?'s':''}`);
        if(this.mapIndex>=3&&p.activeBossShip&&p.bossShips?.[p.activeBossShip]){this.spawnDrone(22,false,{support:true,inheritPower:true,count:1,radius:158,fireRate:.17,damageScale:1.24,color:'#ffd56a'});this.toast('NAVE-JEFE ACTIVADA',p.bossShips[p.activeBossShip].name);}
      }
    }

    getTotalLives() {
      return Math.min(MAX_TOTAL_LIVES, Math.max(0, this.extraLives || 0) + (this.running ? 1 : 0));
    }

    addReserveLives(count = 1, reason = '') {
      const currentTotal = this.getTotalLives();
      const room = Math.max(0, MAX_TOTAL_LIVES - currentTotal);
      const granted = Math.min(Math.max(0, Math.floor(count)), room);
      if (granted <= 0) return 0;
      this.extraLives = Math.min(MAX_TOTAL_LIVES - 1, (this.extraLives || 0) + granted);
      if (!this.replayMode?.active) currentProfile().campaignExtraLives = this.extraLives;
      if (reason) this.toast('❤️ Vidas adicionales', `+${granted} · ${reason} · total ${this.getTotalLives()}/${MAX_TOTAL_LIVES}`);
      this.updateHud();
      return granted;
    }

    checkScoreLifeAwards() {
      if (!this.run) return;
      if (!Number.isFinite(this.nextLifeScore) || this.nextLifeScore < SCORE_LIFE_STEP) this.nextLifeScore = SCORE_LIFE_STEP;
      const score = Math.floor(this.run.score || 0);
      let awarded = 0;
      while (score >= this.nextLifeScore) {
        this.nextLifeScore += SCORE_LIFE_STEP;
        if (this.getTotalLives() < MAX_TOTAL_LIVES) {
          this.extraLives = Math.min(MAX_TOTAL_LIVES - 1, (this.extraLives || 0) + 1);
          if (!this.replayMode?.active) currentProfile().campaignExtraLives = this.extraLives;
          awarded += 1;
        }
      }
      if (awarded > 0) {
        saveState();
        this.toast('⭐ Vida por puntaje', `+${awarded} vida${awarded>1?'s':''} · los puntos se conservan`);
        AudioFX.level();
      }
    }

    grantPurchasedLifePower() {
      const pools = [
        ['triple','drone','torpedo','fire','pierce'],
        ['afterburner','stasis','wingman','voidray','gravmine'],
        ['laser','torpedo','spark','drone','pierce'],
        ['fire','bounce','pulse','laser','drone'],
        ['voidray','plasma','phantom','torpedo','spark']
      ];
      const pool = pools[this.mapIndex] || pools[0];
      const inactive = pool.filter(id => !this.isPowerActive(id));
      const id = pick(inactive.length ? inactive : pool);
      if (!id) return null;
      return this.empowerPower(id, { duration: Math.max(10, POWER_ACTIVE_SECONDS[id] || 10), toastTitle: '⚡ Poder de reactivación' });
    }

    updatePowerActivity(dt) {
      if (!this.powerActivity) this.powerActivity = {};
      Object.keys(this.powerActivity).forEach(id => {
        this.powerActivity[id] = Math.max(0, this.powerActivity[id] - dt);
        if (this.powerActivity[id] <= 0.04) delete this.powerActivity[id];
      });
      this.resolvePowerSlots();
      this.syncActiveCombos();
    }

    updateOfferState(dt) {
      // v1.6.4: no se interrumpe el combate con cartas. Toda mejora se recoge físicamente.
      if (this.offerActive) {
        this.offerActive=false;this.currentOfferChoices=[];this.offerAutoAt=0;this.pendingLevelChoices=0;
        els.cardOverlay?.classList.add('hidden');
      }
    }

    selectRecommendedPower(choices = []) {
      const p = this.player;
      const hpRatio = p.maxHp ? p.hp / p.maxHp : 1;
      const shieldRatio = p.maxShield ? p.shield / p.maxShield : 1;
      const crowded = this.enemies.length;
      const weaponCount = ['triple','laser','voidray','pierce','fire','bounce','spark','torpedo'].reduce((n,id)=>n+((this.powerLevels[id]||0)>0?1:0),0);
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
      const meta=boss2Meta(this.mapIndex);
      els.bossIntroFamily.textContent = `${meta.intro} · MUNDO ${this.mapIndex+1}`;
      els.bossIntroIcon.innerHTML = bossSigilHtml(this.mapIndex,'boss-sigil');
      els.bossIntroName.textContent = boss.name;
      els.bossIntroText.textContent = `${meta.weapon} · ${meta.special}`;
      els.bossIntroOverlay.style.setProperty('--boss-color',meta.color);
      els.bossIntroOverlay.classList.remove('micro-intro','cinematic-full');
      els.bossIntroOverlay.classList.add('boss2-intro');
      els.bossIntroOverlay.dataset.family = map.family || '';
      els.bossIntroOverlay.classList.remove('hidden');
      clearTimeout(this.bossIntroTimeout);
      const timeout = this.mapIndex===4 ? 1850 : 1450;
      this.bossIntroTimeout = setTimeout(() => {
        if (els.bossIntroOverlay) {
          els.bossIntroOverlay.classList.add('hidden');
          els.bossIntroOverlay.classList.remove('micro-intro','cinematic-full','boss2-intro');
          els.bossIntroOverlay.dataset.family = '';
        }
      }, timeout);
    }


    updateBossUi() {
      const b = this.bossActive;
      if (!b) return;
      if (els.bossBar) els.bossBar.classList.add('hidden');
    }

    updateBossFight(dt) {
      if (!this.bossFight?.active || !this.bossActive) return;
      const p = this.player;
      const f = this.bossFight;
      const b = this.bossActive;
      f.minionTimer -= dt;
      if (f.minionTimer <= 0) {
        const nonBoss = this.enemies.filter(e => !e.boss).length;
        if (nonBoss < (this.mapIndex === 0 ? 7 + b.phase * 2 : (this.mapIndex === 1 ? 6 + b.phase * 2 : 5 + b.phase * 2))) {
          const count = this.mapIndex === 0 ? Math.min(4, 2 + Math.floor(b.phase / 1.6)) : (this.mapIndex === 1 ? Math.min(4,2+Math.floor(b.phase/2)) : Math.min(3, 1 + Math.floor((b.phase + 1) / 2)));
          for (let i = 0; i < count; i++) {
            const fams = b.minionFamilies || [];
            const fam = fams.length ? fams[(f.addsKilled + i) % fams.length] : null;
            this.spawnEnemy(pick(fam || b.summons || ['corredor','sombra']), true);
          }
        }
        f.minionTimer = this.mapIndex === 0 ? Math.max(1.9, 3.7 - b.phase * .34) : (this.mapIndex === 1 ? Math.max(2.15,4.2-b.phase*.32) : Math.max(2.8, 5.1 - b.phase * .42 - this.mapIndex * .06));
      }
      f.escortTimer = (f.escortTimer || 0) - dt;
      if (f.escortTimer <= 0) {
        if (this.mapIndex === 0) {
          const escorts=this.enemies.filter(e=>e.behavior==='mirror').length;
          if(escorts<2)this.spawnEnemy('nave_espejo',true);
          f.escortTimer=Math.max(3.0,4.9-b.phase*.4);
        } else if (this.mapIndex === 1) {
          const fam=WORLD_TWO_MINION_FAMILIES[(f.addsKilled+b.phase)%3];
          this.spawnEnemy(pick(fam),true);
          f.escortTimer=Math.max(3.4,5.6-b.phase*.38);
        } else {
          const escorts=this.enemies.filter(e=>e.behavior==='mirror').length;
          if(escorts<1+Math.floor((b.phase+1)/2))this.spawnEnemy('nave_espejo',true);
          f.escortTimer=Math.max(4.2,6.7-b.phase*.62-this.mapIndex*.09);
        }
      }
      f.hazardTimer = (f.hazardTimer || 0) - dt;
      if (f.hazardTimer <= 0) {
        const p = this.player;
        if (b.family === 'demon' || b.family === 'mythic') {
          this.spawnMeteorRain(this.mapIndex === 0 ? 2 : 3, true);
        } else if (b.family === 'spirit' || b.family === 'witch') {
          for (let i = 0; i < 2; i++) this.zones.push({ x: p.x + rand(110,-110), y: p.y + rand(90,-90), r: 20 + b.phase * 2, life: 2.4, max: 2.4, type: 'root' });
        } else {
          for (let i = 0; i < 1 + Math.min(2, b.phase); i++) {
            const fams = b.minionFamilies || [];
            const fam = fams.length ? fams[(f.addsKilled + i + 1) % fams.length] : null;
            this.spawnEnemy(pick(fam || b.summons || ['corredor','sombra']), true);
          }
        }
        f.hazardTimer = Math.max(4.0, 6.2 - b.phase * .5 - this.mapIndex * .05);
      }
      if (this.mapIndex === 0 || this.mapIndex === 1) {
        const guardians=this.enemies.filter(e=>!e.boss).length;
        f.guardianPulse=Math.max(0,(f.guardianPulse||0)-dt);
        if(guardians>0 && b.vulnerable<=0){
          const base=this.mapIndex===0?2.6:1.9;
          const per=this.mapIndex===0?1.05:.82;
          b.shield=Math.min(b.shieldMax,(b.shield||0)+(base+Math.min(10,guardians)*per)*dt);
          if(guardians>=5 && f.guardianPulse<=0){f.guardianPulse=2.8;if(Math.random()<.55)this.emit(b.x,b.y,this.mapIndex===0?'#9fd4ff':'#c391ff',3,42,.36);}
        }
      }
      if (b.phase > (f.phaseNotified || 1)) {
        f.phaseNotified = b.phase;
        b.shieldMax += 18;
        b.shield = Math.min(b.shieldMax, b.shield + b.shieldMax * .38);
        this.grantBossAid(`Fase ${b.phase}`);
        const phaseLines=[
          {2:'la órbita meteórica se densifica',3:'el núcleo mineral entra en sobrecarga',4:'lluvia orbital máxima'},
          {2:'las esporas convergen con mayor precisión',3:'el núcleo biotóxico entra en furia',4:'neblina infecciosa crítica'},
          {2:'la descarga viridiana acelera',3:'el reactor entra en tormenta',4:'sobrecarga voltaica máxima'},
          {2:'las cuchillas del eclipse abren el cerco',3:'el Arconte sincroniza su artillería',4:'eclipse escarlata total'},
          {2:'la singularidad comienza a atraer el campo',3:'el vacío comprime las rutas de escape',4:'horizonte de eventos crítico'}
        ][this.mapIndex]||{};
        this.toast(`FASE ${b.phase}`,phaseLines[b.phase]||boss2Meta(this.mapIndex).special);
        if(this.mapIndex===1)this.spawnMeteorRain(1,true);
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
          this.toast('ESCUDO RECOMPUESTO','El jefe recupera su protección');
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
      this.toast('SOBRECARGA ANTI-JEFE','Ventana ofensiva activa');
      AudioFX.chord([392,523.25,659.25], .16, .06);
    }

    grantBossAid(trigger = '') {
      const p = this.player;
      p.hp = Math.min(p.maxHp, p.hp + p.maxHp * .05);
      p.shield = Math.min(p.maxShield, p.shield + p.maxShield * .18);
      if ((this.powerLevels.torpedo || 0) === 0) this.powerLevels.torpedo = 1;
      if ((this.powerLevels.drone || 0) === 0) this.powerLevels.drone = 1;
      this.markPowerActive('torpedo', Math.max(this.powerActivity.torpedo || 0, 5.5));
      this.markPowerActive('drone', Math.max(this.powerActivity.drone || 0, 7));
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
      let zoneSlow = 1;
      for (const z of (this.zones || [])) {
        if (z.type !== 'slow') continue;
        if (Math.hypot(z.x - p.x, z.y - p.y) < z.r + p.r) zoneSlow = Math.min(zoneSlow, .68);
      }
      const stableSpeed = Math.max(p.nominalSpeed || 0, p.baseSpeed || 0, p.speed || 0, 255);
      const recoveryBoost = (p.recoverySpeedTimer || 0) > 0 ? 1.18 : ((p.recoveryGraceTimer || 0) > 0 ? 1.12 : 1);
      const stagePowerScale=this.getStagePowerScale();
      const afterburnerMult=this.isPowerActive('afterburner')?(1+.48*stagePowerScale*(this.comboActive('hiperfase')?1.12:1)):1;
      const moveSpeed = stableSpeed * zoneSlow * recoveryBoost * (p.bossDrive > 0 ? 1.22 : 1) * afterburnerMult;
      if (dx || dy) {
        const l = Math.hypot(dx, dy) || 1;
        const tx = (dx / l) * moveSpeed;
        const ty = (dy / l) * moveSpeed;
        const response = 1 - Math.exp(-dt * (p.moveResponse || 18));
        p.moveVx += (tx - (p.moveVx || 0)) * response;
        p.moveVy += (ty - (p.moveVy || 0)) * response;
        p.x += p.moveVx * dt;
        p.y += p.moveVy * dt;
        this.pointer.x = p.x;
        this.pointer.y = p.y;
      } else if (this.pointer.active) {
        p.moveVx *= Math.exp(-dt * 20);
        p.moveVy *= Math.exp(-dt * 20);
        const vx = this.pointer.x - p.x;
        const vy = this.pointer.y - p.y;
        const d = Math.hypot(vx, vy);
        if (d > 2.4) {
          const touchBoost = this.pointer.touch ? 1.55 : 1.12;
          const distanceBoost = 1 + Math.min(.28, d / 620);
          const step = Math.min(d, moveSpeed * touchBoost * distanceBoost * dt);
          p.x += (vx / d) * step;
          p.y += (vy / d) * step;
        }
      } else {
        const decay = Math.exp(-dt * 18);
        p.moveVx *= decay; p.moveVy *= decay;
        p.x += p.moveVx * dt; p.y += p.moveVy * dt;
      }
      const combat=this.getCombatBounds();
      p.x = clamp(p.x, combat.left, combat.right);
      p.y = clamp(p.y, combat.top, combat.bottom);
      if ((Math.abs(dx) + Math.abs(dy)) || this.pointer.active) {
        if (Math.random() < (this.isPowerActive('afterburner') ? .96 : .72)) this.emit(p.x, p.y + 10, this.isPowerActive('afterburner') ? '#ffd56a' : p.avatar.color, this.isPowerActive('afterburner') ? 2 : 1, this.isPowerActive('afterburner') ? 34 : 14, this.isPowerActive('afterburner') ? .32 : .2);
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
      const weaponMode = this.activePowerSlots?.weaponMode || null;
      const triple = weaponMode === 'triple' ? this.getPowerLevel('triple', true) : 0;
      const laser = weaponMode === 'laser' ? this.getPowerLevel('laser', true) : 0;
      const voidray = weaponMode === 'voidray' ? this.getPowerLevel('voidray', true) : 0;
      const pierce = this.getPowerLevel('pierce', true);
      const fire = this.getPowerLevel('fire', true);
      const ice = this.getPowerLevel('ice', true);
      const bounce = this.getPowerLevel('bounce', true);
      const virus = this.getPowerLevel('virus', true);
      const overdrive=this.getPowerLevel('overdrive',true);
      const drive=(p.bossDrive>0?1.42:1)*(overdrive?(1.16+overdrive*.018):1)*(p.comboSurge>0?1.13:1);
      const bossBonus = target.boss ? 1.22 : 1;
      const dmg = p.damage * (1 + triple * .05 + pierce * .04 + voidray * .045) * drive * bossBonus;
      const speed = 560 + pierce * 45;
      const shots = triple ? [-0.18, 0, 0.18] : [0];
      if (this.comboActive('prisma')) shots.push(-0.32, 0.32);
      if (this.comboActive('lanza')) shots.push(-0.08, 0.08);
      const comboFire=this.comboActive('chispa')?Math.max(1,fire+1):fire;
      const comboBounce=this.comboActive('chispa')?Math.max(1,bounce+1):bounce;
      shots.forEach(off => this.addBullet(p.x, p.y, a + off, speed * (p.projectileSpeedBonus || 1), dmg*(this.comboActive('chispa')?1.12:1), { pierce: 1 + pierce + (this.comboActive('lanza') ? 2 : 0) + (this.comboActive('tridente') ? 2 : 0), fire:comboFire, ice, bounce:comboBounce, virus, color: p.avatar.color, homing: Math.random() < (p.aimAssist || 0), glow: p.shotTier || 0 }));
      if (laser || this.comboActive('prisma')) this.fireLaser(a, dmg * (.42 + laser * .16), this.comboActive('prisma') ? 3 : 1, this.comboActive('criotemporal'));
      if (voidray) this.fireLaserFrom(p.x, p.y, a, dmg * (.58 + voidray * .13)*(this.comboActive('nulidad')?1.28:1), '#c391ff');
      p.fireTimer = Math.max(55,(p.fireDelay-triple*12-laser*8-voidray*6)*(p.bossDrive>0?.72:1)*(overdrive?.78:1)*(p.comboSurge>0?.88:1));
      AudioFX.shoot();
    }

    addBullet(x, y, angle, speed, damage, meta = {}) {
      const crit = Math.random() < this.player.crit;
      this.bullets.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: meta.big ? 8 : (5 + Math.min(3.4, (meta.glow || this.player?.shotTier || 0) * .7)),
        damage: damage * (crit ? 1.9 : 1),
        life: 1.6 * (this.player?.projectileRangeBonus || 1),
        pierce: meta.pierce || 1,
        fire: meta.fire || 0,
        ice: meta.ice || 0,
        bounce: meta.bounce || 0,
        virus: meta.virus || 0,
        homing: !!meta.homing,
        glow: meta.glow || this.player?.shotTier || 0,
        type: meta.type || 'bullet',
        color: crit ? '#ffd56a' : (meta.color || '#61ffc8')
      });
    }

    fireLaser(angle, damage, count = 1, slowBeam = false) {
      const p = this.player;
      const angles = count === 3 ? [angle - .16, angle, angle + .16] : [angle];
      angles.forEach(a => {
        const cos = Math.cos(a), sin = Math.sin(a);
        let hit = 0;
        for (const e of this.enemies) {
          const px = e.x - p.x;
          const py = e.y - p.y;
          const proj = px * cos + py * sin;
          if (proj < 0 || proj > 560 * (p.projectileRangeBonus || 1)) continue;
          const perp = Math.abs(px * sin - py * cos);
          if (perp < e.r + 10) {
            this.damageEnemy(e, damage, { laser: true, slow: slowBeam ? .75 : 0 });
            hit++;
            if (hit > 5) break;
          }
        }
        this.particles.push({ type: 'laser', x: p.x, y: p.y, a, life: .12, max: .12, range: 620 * (p.projectileRangeBonus || 1), color: count === 3 ? '#b58cff' : '#83eaff' });
      });
    }


    fireLaserFrom(x, y, angle, damage, color = '#83eaff') {
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const rangeBonus = this.player?.projectileRangeBonus || 1;
      let hit = 0;
      for (const e of this.enemies) {
        const px = e.x - x;
        const py = e.y - y;
        const proj = px * cos + py * sin;
        if (proj < 0 || proj > 520 * rangeBonus) continue;
        const perp = Math.abs(px * sin - py * cos);
        if (perp < e.r + 8) {
          this.damageEnemy(e, damage, { laser: true, color });
          if (++hit > 3) break;
        }
      }
      this.particles.push({ type:'laser', x, y, a:angle, life:.1, max:.1, range: 580 * rangeBonus, color });
    }

    handleInheritedRelics(dt) {
      const profile = currentProfile();
      const p = this.player;
      if (!p || this.mapIndex <= 0 || !profile.relics?.world1Core) return;
      p.relicMeteorTimer = (p.relicMeteorTimer ?? 4.5) - dt;
      if (p.relicMeteorTimer > 0 || !this.enemies.length) return;
      const targets = this.enemies.filter(e => !e.boss).sort((a,b) => dist2(a,p) - dist2(b,p)).slice(0, 3);
      if (!targets.length && this.bossActive) targets.push(this.bossActive);
      for (const e of targets) {
        const damage = p.damage * (e.boss ? 1.7 : 3.4);
        this.particles.push({ type:'ring', x:e.x, y:e.y, r:10, maxR:78, life:.42, max:.42, color:'#ff9d4d' });
        this.emit(e.x, e.y, '#ffd56a', 12, 150, .55);
        this.damageEnemy(e, damage, { fire:2, color:'#ffd56a' });
      }
      this.flash = Math.max(this.flash, .42);
      AudioFX.tone(118,.22,'sawtooth',.03,120);
      this.toast('☄️ Núcleo Meteórico', `${targets.length} impacto${targets.length===1?'':'s'} heredado${targets.length===1?'':'s'}`);
      p.relicMeteorTimer = 18;
    }

    handlePowers(dt) {
      const p = this.player;
      const orbs = this.getPowerLevel('orbs', true);
      const ring = this.getPowerLevel('ring', true);
      const pulse = this.getPowerLevel('pulse', true);
      const opem = this.getPowerLevel('opem', true);
      const nuke = this.getPowerLevel('nuke', true);
      const spark = this.getPowerLevel('spark', true);
      const torpedo = this.getPowerLevel('torpedo', true);
      const kamikaze = this.getPowerLevel('kamikaze', true);
      const gravmine = this.getPowerLevel('gravmine', true);
      const disruptor = this.getPowerLevel('disruptor', true);
      const plasma = this.getPowerLevel('plasma', true);
      const voltaic=this.getPowerLevel('voltaic',true);
      const nanorepair=this.getPowerLevel('nanorepair',true);
      if (orbs || this.comboActive('gravedad') || this.comboActive('bastion')) {
        const radius = 68 + orbs * 14 + (this.comboActive('gravedad') ? 48 : 0) + (this.comboActive('bastion') ? 22 : 0);
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < radius + e.r) this.damageEnemy(e, (7 + orbs * 2) * dt, { orbital: true, slow: this.comboActive('gravedad') ? .4 : 0 });
        }
      }
      if (ring || this.comboActive('gravedad') || this.comboActive('bastion')) {
        const radius = 104 + ring * 12;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < radius && d > 0) {
            const push = (this.comboActive('gravedad') ? -24 : 26) * dt;
            e.x += ((e.x - p.x) / d) * push;
            e.y += ((e.y - p.y) / d) * push;
            if (this.comboActive('gravedad')) e.slow = Math.max(e.slow || 0, .5);
          }
        }
        if(this.comboActive('bastion')){
          const blockR=132+orbs*8+ring*7;
          for(let i=this.bullets.length-1;i>=0;i--){const b=this.bullets[i];if(b.enemy&&Math.hypot(b.x-p.x,b.y-p.y)<blockR)this.bullets.splice(i,1);}
          p.shield=Math.min(p.maxShield,p.shield+dt*(1.1+ring*.22));
        }
      }
      if ((pulse || this.comboActive('resonante') || this.comboActive('blackout')) && p.pulseTimer <= 0) {
        const radius = 130 + pulse * 30 + (this.comboActive('blackout')?72:0);
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < radius) this.damageEnemy(e, p.damage * (1.3 + pulse * .25), { pulse: true });
        }
        if(this.comboActive('blackout'))for(let i=this.bullets.length-1;i>=0;i--){if(this.bullets[i].enemy)this.bullets.splice(i,1);}
        this.particles.push({ type: 'ring', x: p.x, y: p.y, r: 20, maxR: radius, life: .32, max: .32, color: this.comboActive('blackout')?'#83eaff':'#ffd56a' });
        p.pulseTimer = Math.max(2.8, 5.4 - pulse * .45);
        AudioFX.tone(260, .12, 'triangle', .035, 260);
      }
      if (spark && p.sparkTimer > 0) {
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
        p.torpedoTimer -= dt;
        if (p.torpedoTimer <= 0 && this.enemies.length) {
          const count = 1 + Math.floor(torpedo / 2);
          for (let i=0;i<count;i++) {
            const target = this.enemies[(i + Math.floor(Math.random()*this.enemies.length)) % this.enemies.length];
            const ang = Math.atan2(target.y - p.y, target.x - p.x) + rand(.08,-.08);
            this.addBullet(p.x, p.y, ang, 420 + torpedo * 30, p.damage * (1.2 + torpedo * .16), { pierce: 1, homing: true, type: 'torpedo', big: true, virus: this.comboActive('enjambre') ? 1 : 0, color: '#ffd56a' });
          }
          p.torpedoTimer = Math.max(1.2, 2.8 - torpedo * .14);
        }
      }
      if (gravmine) {
        p.gravMineTimer -= dt;
        if (p.gravMineTimer <= 0 && this.enemies.length) {
          const target = this.nearestEnemy();
          if (target) {
            this.zones.push({ type:'gravityMine', x:target.x, y:target.y, r:76 + gravmine*10 + (this.comboActive('pozo')?38:0), life:this.comboActive('pozo')?4.2:3.2, max:this.comboActive('pozo')?4.2:3.2, damage:p.damage*(.22+gravmine*.05)*(this.comboActive('pozo')?1.45:1) });
            this.particles.push({ type:'ring', x:target.x, y:target.y, r:12, maxR:92 + gravmine*10, life:.38, max:.38, color:'#c391ff' });
          }
          p.gravMineTimer = Math.max(1.8, 3.1 - gravmine*.18);
        }
      }
      if (disruptor) {
        p.disruptorTimer -= dt;
        if (p.disruptorTimer <= 0) {
          let cleared = 0;
          for (let i=this.bullets.length-1;i>=0;i--) {
            const b=this.bullets[i];
            if (b.enemy && Math.hypot(b.x-p.x,b.y-p.y) < 300 + disruptor*22 + (this.comboActive('nulidad')?120:0)) { this.bullets.splice(i,1); cleared++; }
          }
          for (const e of this.enemies) {
            const d=Math.hypot(e.x-p.x,e.y-p.y);
            if (d < 220 + disruptor*20 + (this.comboActive('nulidad')?80:0)) this.damageEnemy(e,p.damage*(.62+disruptor*.12)*(this.comboActive('nulidad')?1.4:1),{slow:.65,color:this.comboActive('nulidad')?'#c391ff':'#83eaff'});
          }
          this.particles.push({type:'ring',x:p.x,y:p.y,r:18,maxR:270+disruptor*18,life:.46,max:.46,color:'#83eaff'});
          AudioFX.world2Pulse();
          if (cleared) this.toast('✧ Pulso disruptor', `${cleared} proyectiles anulados`);
          p.disruptorTimer = Math.max(3.4,5.8-disruptor*.35);
        }
      }
      if (plasma) {
        p.plasmaTimer -= dt;
        if (p.plasmaTimer <= 0 && this.enemies.length) {
          const target=this.nearestEnemy();
          if (target) {
            const radius=88+plasma*12+(this.comboActive('pozo')?46:0);
            for (const e of this.enemies) {
              const d=Math.hypot(e.x-target.x,e.y-target.y)||1;
              if (d<radius) {
                this.damageEnemy(e,p.damage*(.42+plasma*.08),{fire:1,color:'#d879ff'});
                const pull=this.comboActive('pozo')?10:5;
                e.x += ((target.x-e.x)/d)*pull;
                e.y += ((target.y-e.y)/d)*pull;
              }
            }
            this.particles.push({type:'ring',x:target.x,y:target.y,r:10,maxR:radius,life:.34,max:.34,color:'#d879ff'});
          }
          p.plasmaTimer=Math.max(.45,.9-plasma*.06);
        }
      }
      if (kamikaze) {
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
      if (voltaic) {
        p.voltaicTimer=(p.voltaicTimer??.25)-dt;
        if(p.voltaicTimer<=0&&this.enemies.length){
          const storm=this.comboActive('tempestad');
          const chain=this.enemies.slice().sort((a,b)=>dist2(a,p)-dist2(b,p)).slice(0,Math.min(storm?8:5,(storm?4:2)+Math.floor(voltaic)));
          chain.forEach((e,idx)=>{this.damageEnemy(e,p.damage*(.32+voltaic*.07)*(storm?1.38:1),{color:storm?'#d7ff72':'#93ff8b',slow:storm?.22:.12});if(idx<chain.length-1)this.particles.push({type:'laser',x:e.x,y:e.y,a:Math.atan2(chain[idx+1].y-e.y,chain[idx+1].x-e.x),life:.1,max:.1,range:Math.hypot(chain[idx+1].x-e.x,chain[idx+1].y-e.y),color:storm?'#d7ff72':'#93ff8b'});});
          p.voltaicTimer=Math.max(.34,.76-voltaic*.05);
        }
      }
      if(nanorepair&&p.hp<p.maxHp)p.hp=Math.min(p.maxHp,p.hp+dt*(1.8+nanorepair*.65)*(this.comboActive('regenerativo')?1.75:1));
      if(this.comboActive('regenerativo'))p.shield=Math.min(p.maxShield,p.shield+dt*1.35);
    }

    setupWorldOneIntro() {
      const p = this.player;
      const w1 = this.worldOneState;
      w1.eventTimer = 9;
      w1.actSeen = 1;
      this.spawnPickup(p.x + 34, clamp(p.y - 82, 64, this.h - 64), 'power', 1, { powerId: 'triple', major: true, label: 'Disparo triple', powerDuration: 16 });
      this.spawnPickup(p.x + 92, p.y - 30, 'shield', 24);
      this.spawnDrone(13, false, { support: true, inheritPower: true, radius: 118, fireRate: .24, damageScale: .84, color: '#72ffc7' });
      const intro = ['corredor','toxico','esquivo','cazador'];
      const count = this.w >= 1100 ? 4 : 3;
      for (let i = 0; i < count; i++) this.spawnEnemy(intro[i % intro.length], true);
      this.toast('ACTO I · ÓRBITA', 'Núcleo triple detectado');
    }

    setupWorldTwoIntro() {
      const p=this.player;
      const w2=this.worldTwoState;
      w2.eventTimer=8.5; w2.actSeen=1;
      this.spawnPickup(p.x+42,clamp(p.y-92,64,this.h-64),'power',1,{powerId:'voidray',major:true,rewardGlow:true,label:'Rayo de vacío',powerDuration:14});
      this.spawnPickup(p.x-92,p.y-26,'shield',30,{rewardGlow:true,label:'Shield +30'});
      this.spawnPickup(p.x+104,p.y+38,'power',1,{powerId:'afterburner',rewardGlow:true,label:'Impulsor 10s',powerDuration:10});
      this.spawnDrone(16,false,{support:true,inheritPower:true,count:Math.min(2,Math.max(1,(currentProfile().completedMaps||[]).length)),radius:126,fireRate:.22,damageScale:.88,color:'#c391ff'});
      const intro=['vora_aguja','vora_colmillo','void_orbe','metal_ariete'];
      const count=this.w>=1100?5:4;
      for(let i=0;i<count;i++) this.spawnEnemy(intro[i%intro.length],true);
      this.spawnOrbitalWreck(this.w >= 1100 ? 2 : 1, true);
      this.spawnMeteor(1, true);
      this.toast('MUNDO 2 · ACTO 2-1','Cuarentena exterior');
      AudioFX.world2Pulse();
    }


    setupWorldThreeIntro() {
      const p=this.player,w3=this.worldThreeState;
      w3.eventTimer=7;w3.rewardTimer=9;w3.hordeTimer=12;w3.hazardTimer=5.5;w3.speedBurst=3.5;
      this.spawnPickup(p.x+50,clamp(p.y-92,64,this.h-64),'power',1,{powerId:'afterburner',major:true,rewardGlow:true,label:'IMPULSOR VECTORIAL',powerDuration:12});
      this.spawnPickup(p.x-70,p.y-36,'power',1,{powerId:'pierce',major:true,rewardGlow:true,label:'PERFORANTE MK-3',powerDuration:12});
      this.spawnPickup(p.x+106,p.y+34,'shield',30,{rewardGlow:true,label:'SHIELD +30'});
      this.spawnDrone(15,false,{support:true,inheritPower:true,count:2,radius:128,fireRate:.21,damageScale:.9,color:'#74ff73'});
      ['w3_viridian_1','w3_viridian_2','w3_crystal_1','w3_viridian_3'].forEach((id,i)=>this.spawnEnemyNearPlayer(id,-1+i*.65,310+i*18,true,1.03));
      this.toast('MUNDO 3 · ACTO 3-1','Corredor Viridiano · velocidad espacial activa');
    }

    setupWorldFourIntro() {
      const p=this.player,w4=this.worldFourState;
      w4.eventTimer=6.8;w4.rewardTimer=8.0;w4.hordeTimer=11.6;w4.hazardTimer=6.0;
      this.spawnPickup(p.x+58,clamp(p.y-92,64,this.h-64),'power',1,{powerId:'magnetism',major:true,rewardGlow:true,label:'IMÁN GRAVITACIONAL',powerDuration:12});
      this.spawnPickup(p.x-74,p.y-24,'power',1,{powerId:'stasis',major:true,rewardGlow:true,label:'RALENTIZADOR TEMPORAL',powerDuration:10});
      this.spawnPickup(p.x+104,p.y+34,'shield',35,{rewardGlow:true,label:'SHIELD +35'});
      ['w4_eclipse_1','w4_eclipse_2','w4_eclipse_4'].forEach((id,i)=>this.spawnEnemyNearPlayer(id,-.9+i*.75,295+i*18,true,1.02));
      this.toast('MUNDO 4 · ACTO 4-1','Ciudadela Carmesí · presión orbital activa');
    }

    setupWorldFiveIntro() {
      const p=this.player,w5=this.worldFiveState;
      w5.eventTimer=6.4;w5.rewardTimer=7.6;w5.hordeTimer=10.8;w5.hazardTimer=5.8;
      this.spawnPickup(p.x+42,clamp(p.y-94,64,this.h-64),'power',1,{powerId:'afterburner',major:true,rewardGlow:true,label:'IMPULSOR ABISAL',powerDuration:12});
      this.spawnPickup(p.x-82,p.y-28,'power',1,{powerId:'plasma',major:true,rewardGlow:true,label:'VÓRTICE DE PLASMA',powerDuration:10});
      this.spawnPickup(p.x+112,p.y+36,'shield',40,{rewardGlow:true,label:'SHIELD +40'});
      this.spawnDrone(14,false,{support:true,inheritPower:true,count:1,radius:136,fireRate:.22,damageScale:.95,color:'#c391ff'});
      ['w5_void_1','w5_void_2','w5_void_4'].forEach((id,i)=>this.spawnEnemyNearPlayer(id,-1+i*.82,310+i*22,true,1.04));
      this.toast('MUNDO 5 · ACTO 5-1','Caverna del Núcleo Negro · singularidad activa');
    }

    grantWorldThreePowerReward(step=Math.max(1,this.wave-1)) {
      const w3=this.worldThreeState||(this.worldThreeState={rewardSteps:[]});w3.rewardSteps=w3.rewardSteps||[];
      const idx=Math.max(0,Math.min(WORLD_THREE_CONFIG.rewardPowers.length-1,step-1)),id=WORLD_THREE_CONFIG.rewardPowers[idx];
      if(!id||w3.rewardSteps.includes(id))return null;w3.rewardSteps.push(id);return id;
    }

    spawnWorldThreeReward() {
      const id=this.grantWorldThreePowerReward();if(!id)return;const pow=POWERS.find(p=>p.id===id),p=this.player;
      this.spawnPickup(p.x+rand(120,-120),clamp(p.y-108,62,this.h-62),'power',1,{powerId:id,major:true,rewardGlow:true,label:pow?.name||'Poder Mundo 3',powerDuration:POWER_ACTIVE_SECONDS[id]||11});
      this.toast('✦ TECNOLOGÍA VIRIDIANA',pow?.name||id);
    }

    grantWorldFourPowerReward(step=Math.max(1,this.wave-1)) {
      const w4=this.worldFourState||(this.worldFourState={rewardSteps:[]});w4.rewardSteps=w4.rewardSteps||[];
      const idx=Math.max(0,Math.min(WORLD_FOUR_CONFIG.rewardPowers.length-1,step-1)),id=WORLD_FOUR_CONFIG.rewardPowers[idx];
      if(!id||w4.rewardSteps.includes(id))return null;w4.rewardSteps.push(id);return id;
    }

    spawnWorldFourReward() {
      const id=this.grantWorldFourPowerReward();if(!id)return;const pow=POWERS.find(p=>p.id===id),p=this.player;
      this.spawnPickup(p.x+rand(120,-120),clamp(p.y-108,62,this.h-62),'power',1,{powerId:id,major:true,rewardGlow:true,label:pow?.name||'Tecnología Carmesí',powerDuration:POWER_ACTIVE_SECONDS[id]||11});
      this.toast('✦ TECNOLOGÍA CARMESÍ',pow?.name||id);
    }

    grantWorldFivePowerReward(step=Math.max(1,this.wave-1)) {
      const w5=this.worldFiveState||(this.worldFiveState={rewardSteps:[]});w5.rewardSteps=w5.rewardSteps||[];
      const idx=Math.max(0,Math.min(WORLD_FIVE_CONFIG.rewardPowers.length-1,step-1)),id=WORLD_FIVE_CONFIG.rewardPowers[idx];
      if(!id||w5.rewardSteps.includes(id))return null;w5.rewardSteps.push(id);return id;
    }

    spawnWorldFiveReward() {
      const id=this.grantWorldFivePowerReward();if(!id)return;const pow=POWERS.find(p=>p.id===id),p=this.player;
      this.spawnPickup(p.x+rand(120,-120),clamp(p.y-108,62,this.h-62),'power',1,{powerId:id,major:true,rewardGlow:true,label:pow?.name||'Tecnología del Vacío',powerDuration:POWER_ACTIVE_SECONDS[id]||11});
      this.toast('✦ TECNOLOGÍA DEL VACÍO',pow?.name||id);
    }

    worldThreeEnemyId() {
      const A=WORLD_THREE_MINION_FAMILIES[0],B=WORLD_THREE_MINION_FAMILIES[1],C=WORLD_THREE_MINION_FAMILIES[2];
      let pool=this.wave===1?[...A]:this.wave===2?[...A,...B.slice(0,3)]:this.wave===3?[...A.slice(1),...B]:this.wave===4?[...B,...C]:[A[4],B[3],B[4],...C];
      const hist=this.worldThreeState?.enemyHistory||[],cand=pool.filter(id=>!hist.slice(-3).includes(id)),id=pick(cand.length?cand:pool);
      this.worldThreeState.enemyHistory=[...hist,id].slice(-5);return id;
    }

    worldFourEnemyId() {
      const A=WORLD_FOUR_MINION_FAMILIES[0],B=WORLD_FOUR_MINION_FAMILIES[1];
      const pool=this.wave===1?[...A]:this.wave===2?[...A,...B.slice(0,1)]:this.wave===3?[...A,...B.slice(0,2)]:[...A,...B];
      const hist=this.worldFourState?.enemyHistory||[],cand=pool.filter(id=>!hist.slice(-2).includes(id)),id=pick(cand.length?cand:pool);
      this.worldFourState.enemyHistory=[...hist,id].slice(-4);return id;
    }

    worldFiveEnemyId() {
      const A=WORLD_FIVE_MINION_FAMILIES[0],B=WORLD_FIVE_MINION_FAMILIES[1];
      const pool=this.wave===1?[...A]:this.wave===2?[...A,...B.slice(0,1)]:this.wave===3?[...A,...B.slice(0,2)]:[...A,...B];
      const hist=this.worldFiveState?.enemyHistory||[],cand=pool.filter(id=>!hist.slice(-2).includes(id)),id=pick(cand.length?cand:pool);
      this.worldFiveState.enemyHistory=[...hist,id].slice(-4);return id;
    }

    spawnWorldThreeHazard(count=1,fast=false) {
      if(!this.meteors)this.meteors=[];const cap=this.isSmallScreen?5:9;
      for(let i=0;i<count&&this.meteors.length<cap;i++){
        const left=Math.random()<.5,x=left?-90:this.w+90,y=rand(this.h*.78,this.h*.16),tx=left?this.w+120:-120,ty=clamp(y+rand(150,-150),45,this.h-45),a=Math.atan2(ty-y,tx-x),sp=fast?rand(255,190):rand(185,125),r=rand(26,16);
        this.meteors.push({kind:'w3hazard',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,life:fast?6.4:8.5,dmg:fast?14:18,color:'#74ff73',trail:[],spin:rand(1.8,-1.8),hp:44+this.wave*6,score:26,coins:8,spriteKey:pick(WORLD_THREE_HAZARDS)});
      }
    }

    spawnWorldFourHazard(count=1,fast=false) {
      if(!this.meteors)this.meteors=[];const cap=this.isSmallScreen?5:9;
      for(let i=0;i<count&&this.meteors.length<cap;i++){
        const left=Math.random()<.5,x=left?-90:this.w+90,y=rand(this.h*.8,this.h*.14),tx=left?this.w+120:-120,ty=clamp(y+rand(170,-170),45,this.h-45),a=Math.atan2(ty-y,tx-x),sp=fast?rand(280,210):rand(210,145),r=rand(28,17);
        this.meteors.push({kind:'w4hazard',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,life:fast?6.2:8.0,dmg:fast?16:20,color:'#ff6a63',trail:[],spin:rand(2.0,-2.0),hp:54+this.wave*7,score:30,coins:9,spriteKey:pick(WORLD_FOUR_HAZARDS)});
      }
    }

    spawnWorldFiveHazard(count=1,fast=false) {
      if(!this.meteors)this.meteors=[];const cap=this.isSmallScreen?5:9;
      for(let i=0;i<count&&this.meteors.length<cap;i++){
        const left=Math.random()<.5,x=left?-90:this.w+90,y=rand(this.h*.82,this.h*.14),tx=left?this.w+120:-120,ty=clamp(y+rand(185,-185),45,this.h-45),a=Math.atan2(ty-y,tx-x),sp=fast?rand(305,225):rand(225,155),r=rand(30,18);
        this.meteors.push({kind:'w5hazard',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,life:fast?6.0:7.8,dmg:fast?18:22,color:'#c391ff',trail:[],spin:rand(2.0,-2.0),hp:58+this.wave*8,score:34,coins:10,spriteKey:pick(WORLD_FIVE_HAZARDS)});
      }
    }

    spawnWorldThreeVFormation(size=3,diagonal=true) {
      const pool=this.wave>=4?WORLD_THREE_MINION_FAMILIES.flat():[...WORLD_THREE_MINION_FAMILIES[0],...WORLD_THREE_MINION_FAMILIES[1]],fromLeft=Math.random()<.5,dir=fromLeft?1:-1,baseX=fromLeft?-50:this.w+50,baseY=clamp(this.player.y+rand(170,-170),80,this.h-120);
      for(let i=0;i<size;i++){this.spawnEnemy(pick(pool),true);const e=this.enemies[this.enemies.length-1];if(!e)continue;const row=i===0?0:Math.ceil(i/2),wing=i===0?0:(i%2?-1:1);e.x=baseX-dir*row*48;e.y=clamp(baseY+wing*row*30+(diagonal?row*10:0),55,this.h-55);e.formationVX=dir*rand(118,88);e.formationVY=diagonal?wing*rand(26,13):0;e.formationTime=8.5;e.speed*=1.08;e.r*=.94;}
    }

    triggerWorldThreeHorde() {
      if(this.wave<2||this.wave>=5)return;const size=[3,6,9][Math.min(2,this.wave-2)];this.spawnWorldThreeVFormation(size,true);if(this.isHardMode()&&size>=6)this.spawnWorldThreeVFormation(3,Math.random()<.7);this.spawnCrossWorldPrizeBurst((size>=6?2:1)+(this.getDifficulty().hordeRewardBonus||0));this.spawnHordeEmergencyKit();this.spawnDifficultyHordeHazards();this.worldThreeState.speedBurst=Math.max(this.worldThreeState.speedBurst||0,5.2);this.worldThreeState.hordeSeen=(this.worldThreeState.hordeSeen||0)+1;this.toast('⚡ HORDA VIRIDIANA',`Formación en V x${size} · kit antihorda disponible`);
    }

    spawnAdvancedWorldVFormation(worldIndex,size=3,diagonal=true) {
      const pool=worldIndex===3?WORLD_FOUR_MINION_FAMILIES.flat():WORLD_FIVE_MINION_FAMILIES.flat();
      const fromLeft=Math.random()<.5,dir=fromLeft?1:-1,baseX=fromLeft?-55:this.w+55,baseY=clamp(this.player.y+rand(175,-175),78,this.h-118);
      for(let i=0;i<size;i++){
        this.spawnEnemy(pick(pool),true);const e=this.enemies[this.enemies.length-1];if(!e)continue;
        const row=i===0?0:Math.ceil(i/2),wing=i===0?0:(i%2?-1:1);
        e.x=baseX-dir*row*50;e.y=clamp(baseY+wing*row*31+(diagonal?row*11:0),55,this.h-55);
        e.formationVX=dir*rand(worldIndex===4?132:122,92);e.formationVY=diagonal?wing*rand(28,14):0;e.formationTime=8.8;e.speed*=1.08;e.r*=.93;
      }
    }

    triggerWorldFourHorde() {
      if(this.wave<2||this.wave>5)return;const size=this.wave>=4?9:(this.wave===3?6:3);
      this.spawnAdvancedWorldVFormation(3,size,true);if(size>=6)this.spawnAdvancedWorldVFormation(3,3,Math.random()<.6);
      this.spawnCrossWorldPrizeBurst((size>=6?2:1)+(this.getDifficulty().hordeRewardBonus||0));this.spawnHordeEmergencyKit();this.spawnDifficultyHordeHazards();
      this.worldFourState.hordeSeen=(this.worldFourState.hordeSeen||0)+1;
      this.toast('🔥 HORDA CARMESÍ',`Formación x${size} · kit táctico disperso en el lienzo`);
    }

    triggerWorldFiveHorde() {
      if(this.wave<2||this.wave>5)return;const size=this.wave>=4?9:(this.wave===3?6:3);
      this.spawnAdvancedWorldVFormation(4,size,true);if(size>=6)this.spawnAdvancedWorldVFormation(4,3,true);
      this.spawnCrossWorldPrizeBurst((size>=6?2:1)+(this.getDifficulty().hordeRewardBonus||0));this.spawnHordeEmergencyKit();this.spawnDifficultyHordeHazards();
      this.worldFiveState.hordeSeen=(this.worldFiveState.hordeSeen||0)+1;
      this.toast('🕳️ HORDA DEL VACÍO',`Formación x${size} · kit de emergencia disponible`);
    }

    triggerWorldThreeMicroEvent(level=this.wave) {
      if(level===1){this.spawnWorldThreeVFormation(3,false);this.spawnWorldThreeHazard(1,true);}
      else if(level===2){this.spawnWorldThreeVFormation(3,true);this.spawnWorldThreeHazard(2,true);}
      else if(level===3){this.spawnWorldThreeHazard(2,false);this.spawnEnemyNearPlayer('w3_crystal_4',-.6,330,false,1.08);this.spawnEnemyNearPlayer('w3_viridian_5',.6,340,false,1.06);}
      else if(level===4){this.spawnWorldThreeVFormation(6,true);this.spawnWorldThreeHazard(2,true);}
      this.worldThreeState.speedBurst=Math.max(this.worldThreeState.speedBurst||0,3.4);
    }

    updateWorldThreeDirector(dt) {
      if(this.mapIndex!==2||this.bossActive||this.run?.mapComplete)return false;const w3=this.worldThreeState;if(!w3)return false;
      w3.speedBurst=Math.max(0,(w3.speedBurst||0)-dt);w3.rewardTimer=(w3.rewardTimer??9)-dt*(this.isHardMode()?1.12:1);
      if(w3.rewardTimer<=0&&this.wave<5){this.spawnCrossWorldTacticalPrize();w3.rewardTimer=rand(16,12);}
      w3.hazardTimer=(w3.hazardTimer??6)-dt*(this.getDifficulty().hazardPace||1);if(w3.hazardTimer<=0&&this.wave>=2){this.spawnWorldThreeHazard(this.wave>=4?2:1,this.wave>=3);w3.hazardTimer=rand(9.5,6.2);}
      w3.eventTimer=(w3.eventTimer??8)-dt*(this.getDifficulty().eventPace||1);if(w3.eventTimer<=0&&this.wave<5){this.triggerWorldThreeMicroEvent(this.wave);w3.eventTimer=(WORLD_THREE_ACTS[this.wave-1]?.eventEvery||10)+rand(2,-1);}
      w3.hordeTimer=(w3.hordeTimer??13)-dt*(this.getDifficulty().hordePace||1);if(w3.hordeTimer<=0&&this.wave>=2&&this.wave<5){this.triggerWorldThreeHorde();w3.hordeTimer=rand(this.wave>=4?15:19,this.wave>=4?11:14);}
      if(this.wave===5){w3.speedBurst=Math.max(w3.speedBurst||0,.8);w3.hordeTimer=(w3.hordeTimer||8)-dt;if(w3.hordeTimer<=0){this.spawnWorldThreeVFormation(6,true);this.spawnCrossWorldPrizeBurst(1);this.spawnHordeEmergencyKit();w3.hordeTimer=rand(11,8);}}
      return false;
    }

    worldOneEnemyId() {
      const familyA = ['cazador','corredor','esquivo','mosquito','nave_espejo'];
      const familyB = ['toxico','sombra','divisor','larva','nucleo'];
      const familyC = ['blindado','griton','explosivo','errante','nave_espejo'];
      if (this.wave === 1) return pick(['corredor','esquivo','cazador','toxico','sombra']);
      if (this.wave === 2) return pick(['corredor','cazador','esquivo','toxico','sombra']);
      if (this.wave === 3) return pick([...familyA, ...familyB]);
      if (this.wave === 4) return pick([...familyA, ...familyB, ...familyC]);
      return pick(['cazador','toxico','blindado','nave_espejo','sombra','griton']);
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

    spawnWorldOneVisibleSwarm(count = 3) {
      const pools = [
        ['corredor','cazador','esquivo'],
        ['toxico','sombra','divisor'],
        ['blindado','griton','nave_espejo']
      ];
      const pool = pools[Math.min(pools.length - 1, Math.max(0, this.wave - 2))] || pools[0];
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / Math.max(1,count)) * i + rand(.18, -.18);
        const d = rand(330, 185);
        this.spawnEnemyNearPlayer(pick(pool), a, d, true, i === 0 ? 1.12 : 1.02);
      }
    }

    spawnWorldOneThreatMarkers() {
      if (!this.player) return;
      const p = this.player;
      // Enemy lanes visible immediately: forces the first seconds to feel occupied on PC/tablet.
      const laneCount = this.w >= 1100 ? 5 : (this.w >= 760 ? 4 : 3);
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


    grantWorldOneWeaponReward(step = Math.max(1, this.wave - 1)) {
      const w1 = this.worldOneState || (this.worldOneState = { rewardSteps: [] });
      w1.rewardSteps = w1.rewardSteps || [];
      const idx = Math.max(0, Math.min(WORLD_ONE_CONFIG.rewardPowers.length - 1, step - 1));
      const id = WORLD_ONE_CONFIG.rewardPowers[idx];
      if (!id || w1.rewardSteps.includes(id)) return null;
      w1.rewardSteps.push(id);
      return id;
    }

    spawnWorldOneReward() {
      const p = this.player;
      const step = Math.max(1, this.wave - 1);
      const weaponId = this.grantWorldOneWeaponReward(step);
      if (!weaponId) return;
      const power = POWERS.find(pw => pw.id === weaponId);
      this.spawnPickup(p.x + rand(135, -135), clamp(p.y - 118, 70, this.h - 70), 'power', 1, { powerId: weaponId, major: true, label: power?.name || 'Poder' });
      if (weaponId === 'drone') {
        this.spawnDrone(11, false, { count: 1, support: true, inheritPower: true, radius: 122, fireRate: .25, damageScale: .82, color: '#9ac7ff' });
      }
      this.toast('✦ PODER DE NIVEL', power?.name || 'Núcleo táctico');
    }

    worldTwoEnemyId() {
      const A=WORLD_TWO_MINION_FAMILIES[0], B=WORLD_TWO_MINION_FAMILIES[1], C=WORLD_TWO_MINION_FAMILIES[2];
      let pool;
      if (this.wave===1) pool=[...A.slice(0,4),B[0]];
      else if (this.wave===2) pool=[...A,...B.slice(0,4)];
      else if (this.wave===3) pool=[...A.slice(1),...B];
      else if (this.wave===4) pool=[...B,...C];
      else pool=[A[4],B[4],C[3],C[4],A[1],B[2]];
      const history=this.worldTwoState?.enemyHistory || [];
      const candidates=pool.filter(id=>!history.slice(-2).includes(id));
      const id=pick(candidates.length?candidates:pool);
      if (this.worldTwoState) {
        this.worldTwoState.enemyHistory=[...history,id].slice(-4);
      }
      return id;
    }

    grantWorldTwoPowerReward(step=Math.max(1,this.wave-1)) {
      const w2=this.worldTwoState || (this.worldTwoState={rewardSteps:[]});
      w2.rewardSteps=w2.rewardSteps||[];
      const idx=Math.max(0,Math.min(WORLD_TWO_CONFIG.rewardPowers.length-1,step-1));
      const id=WORLD_TWO_CONFIG.rewardPowers[idx];
      if (!id || w2.rewardSteps.includes(id)) return null;
      w2.rewardSteps.push(id);
      return id;
    }

    spawnWorldTwoReward() {
      const p=this.player;
      const step=Math.max(1,this.wave-1);
      const powerId=this.grantWorldTwoPowerReward(step);
      if (!powerId) return;
      const power=POWERS.find(pw=>pw.id===powerId);
      this.spawnPickup(p.x+rand(125,-125),clamp(p.y-112,68,this.h-68),'power',1,{powerId,major:true,rewardGlow:true,label:power?.name||'Poder del Nexo',powerDuration:POWER_ACTIVE_SECONDS[powerId]||12});
      this.toast('✦ TECNOLOGÍA DEL NEXO',power?.name||'Poder');
    }

    spawnWorldTwoTacticalPrize(force = null) {
      if (this.mapIndex !== 1 || !this.player || this.bossActive) return;
      const p = this.player;
      let choice = force;
      if (!choice) {
        const shieldLow = p.shield < p.maxShield * .42;
        const lifeLow = p.hp < p.maxHp * .52;
        const activeWingmen = this.drones.filter(d => d.kind === 'wingman').length;
        const pool = [];
        if (shieldLow) pool.push('shield','shield','shield');
        if (lifeLow) pool.push('life','life','life');
        pool.push('afterburner','afterburner','stasis','stasis','wingman','shield','life');
        if (activeWingmen >= 2) choice = pick(pool.filter(v => v !== 'wingman'));
        else choice = pick(pool);
      }
      const x = clamp(p.x + rand(180,-180), 55, this.w - 55);
      const y = clamp(p.y + rand(150,-150), 62, this.h - 62);
      if (choice === 'shield') this.spawnPickup(x,y,'shield',30,{rewardGlow:true,label:'SHIELD +30'});
      else if (choice === 'life') this.spawnPickup(x,y,'life',24,{rewardGlow:true,label:'REPARACIÓN'});
      else if (choice === 'afterburner') this.spawnPickup(x,y,'power',1,{powerId:'afterburner',rewardGlow:true,label:'IMPULSOR 10s',powerDuration:10});
      else if (choice === 'stasis') this.spawnPickup(x,y,'power',1,{powerId:'stasis',rewardGlow:true,label:'RALENTIZADOR 10s',powerDuration:10});
      else if (choice === 'wingman') this.spawnPickup(x,y,'power',1,{powerId:'wingman',rewardGlow:true,label:'NAVE AUXILIAR 12s',powerDuration:12});
      AudioFX.tone(740,.08,'sine',.025,90);
    }

    spawnCrossWorldTacticalPrize(force = null) {
      if (this.mapIndex === 1) return this.spawnWorldTwoTacticalPrize(force);
      if (!this.player || this.bossActive) return;
      const p = this.player;
      let choice = force;
      if (!choice) {
        const shieldLow = p.shield < p.maxShield * .42;
        const lifeLow = p.hp < p.maxHp * .56;
        const pool = [];
        if (shieldLow) pool.push('shield', 'shield');
        if (lifeLow) pool.push('life', 'life');
        pool.push('afterburner','afterburner','stasis','stasis','wingman','nanorepair','magnetism','shield','life');
        choice = pick(pool);
      }
      const x = clamp(p.x + rand(170, -170), 55, this.w - 55);
      const y = clamp(p.y + rand(145, -145), 62, this.h - 62);
      if (choice === 'shield') this.spawnPickup(x, y, 'shield', 26, { rewardGlow: true, label: 'SHIELD +26' });
      else if (choice === 'life') this.spawnPickup(x, y, 'life', 22, { rewardGlow: true, label: 'REPARACIÓN' });
      else if (choice === 'afterburner') this.spawnPickup(x, y, 'power', 1, { powerId: 'afterburner', rewardGlow: true, label: 'IMPULSOR 10s', powerDuration: 10 });
      else if (choice === 'stasis') this.spawnPickup(x, y, 'power', 1, { powerId: 'stasis', rewardGlow: true, label: 'RALENTIZADOR 10s', powerDuration: 10 });
      else if (choice === 'wingman') this.spawnPickup(x, y, 'power', 1, { powerId: 'wingman', rewardGlow: true, label: 'NAVE AUXILIAR 12s', powerDuration: 12 });
      else if(choice==='nanorepair') this.spawnPickup(x,y,'power',1,{powerId:'nanorepair',rewardGlow:true,label:'NANORREPARACIÓN 12s',powerDuration:12});
      else if(choice==='magnetism') this.spawnPickup(x,y,'power',1,{powerId:'magnetism',rewardGlow:true,label:'IMÁN GRAVITACIONAL 12s',powerDuration:12});
      AudioFX.tone(720, .08, 'triangle', .025, 80);
    }

    spawnCrossWorldPrizeBurst(count = 2) {
      const plan = ['afterburner', 'stasis', 'shield', 'life', 'wingman'];
      for (let i = 0; i < count; i++) this.spawnCrossWorldTacticalPrize(plan[(i + this.wave + this.mapIndex) % plan.length]);
    }

    randomTacticalPoint(used=[]) {
      const margin=this.isSmallScreen?34:72,p=this.player||{x:this.w/2,y:this.h/2},cb=this.getCombatBounds();
      for(let tries=0;tries<30;tries++){
        const x=rand(cb.right-margin,cb.left+margin),y=rand(cb.bottom-margin,cb.top+margin);
        if(Math.hypot(x-p.x,y-p.y)<105)continue;
        if(used.some(q=>Math.hypot(x-q[0],y-q[1])<115))continue;
        return [x,y];
      }
      return [rand(cb.right-margin,cb.left+margin),rand(cb.bottom-margin,cb.top+margin)];
    }

    spawnHordeEmergencyKit() {
      if(!this.player)return;
      this.pickups=this.pickups.filter(p=>!p.hordeKit);
      const positions=[];for(let i=0;i<3;i++)positions.push(this.randomTacticalPoint(positions));
      this.spawnPickup(positions[0][0],positions[0][1],'nuke',1,{hordeKit:true,rewardGlow:true,label:'☢ BOMBA ANTIHORDA',life:25,autoDelay:999});
      this.spawnPickup(positions[1][0],positions[1][1],'power',1,{powerId:'afterburner',hordeKit:true,rewardGlow:true,label:'» IMPULSOR 10s',powerDuration:10,life:25,autoDelay:999});
      this.spawnPickup(positions[2][0],positions[2][1],'power',1,{powerId:'stasis',hordeKit:true,rewardGlow:true,label:'⌛ RALENTIZADOR 10s',powerDuration:10,life:25,autoDelay:999});
      this.toast('🎁 KIT DE HORDA','Bomba · Impulsor · Ralentizador en posiciones tácticas aleatorias');
    }

    ensureProgressFlow(dt) {
      if(this.mapIndex>=5||this.bossActive||this.bossIntroduced||this.run?.mapComplete||!this.worldStage)return;
      const level=this.worldStage.level||this.wave||1,kills=this.worldStage.kills||0,need=Math.max(1,this.getWorldStageTarget(level));
      this.progressWatch=this.progressWatch||{level,kills,stagnant:0,rescues:0};
      const w=this.progressWatch;
      if(w.level!==level){w.level=level;w.kills=kills;w.stagnant=0;w.rescues=0;return;}
      if(w.kills!==kills){w.kills=kills;w.stagnant=0;return;}
      w.stagnant+=dt;
      const ratio=clamp(kills/need,0,1),nonBoss=this.enemies.filter(e=>!e.boss);
      if(level===5&&(this.mapIndex===0||this.mapIndex===1)){
        const captainAlive=nonBoss.some(e=>this.mapIndex===0?e.worldCaptain:e.world2Captain);
        if(w.stagnant>7&&!captainAlive){
          const idx=Math.min(2,kills);
          if(this.mapIndex===0)this.spawnWorldOneCaptain(idx);else this.spawnWorldTwoCaptain(idx);
          this.spawnCrossWorldTacticalPrize(idx%2?'stasis':'afterburner');
          w.stagnant=1.5;w.rescues=(w.rescues||0)+1;
          this.toast('🧭 REFUERZO FINAL',`Objetivo ${idx+1}/3 reinsertado en combate`);
        }
        return;
      }
      if(w.stagnant>8 && (nonBoss.length<2||ratio>=.78)){
        const count=ratio>=.88?4:3;
        for(let i=0;i<count;i++){
          const id=this.mapIndex===0?pick(['corredor','cazador','esquivo']):this.mapIndex===1?pick(['vora_aguja','vora_colmillo','void_orbe']):this.mapIndex===2?this.worldThreeEnemyId():this.mapIndex===3?this.worldFourEnemyId():this.worldFiveEnemyId();
          this.spawnEnemy(id,true);const e=this.enemies[this.enemies.length-1];
          if(e&&!e.boss){e.hp*=.58;e.baseHp=e.hp;e.speed*=.92;e.progressRescue=true;}
        }
        if(ratio>=.82)this.spawnCrossWorldTacticalPrize((w.rescues||0)%2?'stasis':'afterburner');
        w.rescues=(w.rescues||0)+1;w.stagnant=2.5;
        this.toast('🧭 REFUERZO DE PROGRESO',`${Math.round(ratio*100)}% · nuevos objetivos accesibles`);
      }
      if(w.stagnant>15 && nonBoss.length){
        nonBoss.filter(e=>!e.worldCaptain&&!e.world2Captain).slice(0,4).forEach(e=>{e.hp=Math.min(e.hp,e.baseHp*.48);e.speed=Math.min(e.speed,150+this.mapIndex*8);});
        w.stagnant=5;
      }
    }

    ensureTacticalPowerSupport(dt) {
      if(this.mapIndex>=5||this.bossActive||this.run?.mapComplete||!this.player)return;
      this.powerSupportTimer=(this.powerSupportTimer??9)-dt;
      if(this.powerSupportTimer>0)return;
      const visible=this.pickups.filter(x=>x.type==='power'||x.type==='nuke').length;
      const active=Object.keys(this.powerActivity||{}).filter(id=>this.isPowerActive(id)).length;
      if(visible<3){
        let choice;
        if(this.mapIndex<=1){
          const seq=['afterburner','stasis',this.wave>=3?'nuke':'afterburner'];
          choice=seq[(Math.floor(this.waveTime/10)+this.mapIndex)%seq.length];
        } else {
          const seq=['afterburner','stasis',this.wave>=2?'nuke':'afterburner','wingman'];
          choice=seq[(Math.floor(this.waveTime/9)+this.mapIndex)%seq.length];
        }
        if(choice==='nuke'){
          const pt=this.randomTacticalPoint();this.spawnPickup(pt[0],pt[1],'nuke',1,{rewardGlow:true,label:'☢ BOMBA TÁCTICA',life:23,autoDelay:999});
        }else this.spawnCrossWorldTacticalPrize(choice);
        if(active<2&&visible<2){const extra=choice==='afterburner'?'stasis':'afterburner';this.spawnCrossWorldTacticalPrize(extra);}
      }
      this.powerSupportTimer=active<2?rand(12,8):rand(19,14);
    }

    getBossLootPowerId() {
      return BOSS_LOOT_POWER_IDS[this.mapIndex] || BOSS_LOOT_POWER_IDS[BOSS_LOOT_POWER_IDS.length - 1];
    }

    spawnBossLootBurst(e) {
      if (!e) return null;
      const powerId = this.getBossLootPowerId();
      const power = POWERS.find(pw => pw.id === powerId) || POWERS[0];
      this.lastBossLootPower = power;
      this.spawnPickup(e.x, e.y - e.r * .45, 'power', 1, { powerId, major: true, rewardGlow: true, bossLoot:true, label: `BOTÍN ${power.name.toUpperCase()}`, powerDuration: Math.max(12, POWER_ACTIVE_SECONDS[powerId] || 12) });
      for (let i = 0; i < 5 + (this.isHardMode()?1:0); i++) this.spawnPickup(e.x + rand(120, -120), e.y + rand(95, -95), 'coin', Math.round((30 + i * 8)*(this.getDifficulty().coins||1)), { rewardGlow: i < 3, bossLoot:true });
      for (let i = 0; i < 4 + (this.isHardMode()?1:0); i++) this.spawnPickup(e.x + rand(105, -105), e.y + rand(88, -88), 'xp', Math.round((14 + i * 6)*(this.getDifficulty().xp||1)), { rewardGlow: i < 3, bossLoot:true });
      if (Math.random() < .8) this.spawnPickup(e.x + rand(86, -86), e.y + rand(64, -64), 'life', 26 + this.mapIndex * 4, { rewardGlow: true, bossLoot:true, label: 'VIDA DE BOTÍN' });
      this.toast('BOTÍN DEL JEFE',`${power.name} · XP · monedas${Math.random()<.5?' · vida':''}`);
      return power;
    }

    dropActivePowersOnDefeat() {
      if (this.defeatPowerDropsIssued || !this.player) return 0;
      const activeIds = Object.keys(this.powerActivity || {})
        .filter(id => (this.powerLevels?.[id] || 0) > 0 && (this.powerActivity?.[id] || 0) > 0.28)
        .sort((a,b)=>(this.powerActivity?.[b]||0)-(this.powerActivity?.[a]||0));
      const queuedIds = (this.powerQueue || []).map(q=>q?.id).filter(Boolean);
      const recentIds=[...(this.recentPowerHistory||[])].reverse();
      const recoveryDefaults=[
        ['triple','pierce','afterburner','stasis'],
        ['voidray','gravmine','afterburner','stasis'],
        ['voltaic','phase','afterburner','stasis'],
        ['magnetism','wingman','afterburner','stasis'],
        ['plasma','nanorepair','afterburner','stasis']
      ][this.mapIndex]||['triple','pierce','afterburner','stasis'];
      const ids = [...new Set([...activeIds, ...queuedIds, ...recentIds, ...recoveryDefaults])].slice(0, 8);
      this.recoveryLoadout = ids.map(id => ({
        id,
        level: Math.max(1, this.powerLevels?.[id] || 1),
        duration: Math.max(6, Math.ceil(this.powerActivity?.[id] || (this.powerQueue||[]).find(q=>q.id===id)?.seconds || POWER_ACTIVE_SECONDS[id] || 8))
      }));
      this.defeatPowerDropsIssued = true;
      this.powerActivity = {};
      this.powerQueue = [];
      this.activePowerSlots = { weaponMode: null };
      this.activeCombos = {};
      this.player.sparkTimer = 0;
      this.player.sparkTick = 0;
      this.drones = this.drones.filter(d => d.permanent);
      return this.recoveryLoadout.length;
    }

    getRecoveryComboId() {
      const world = RECOVERY_COMBOS_BY_WORLD[this.mapIndex] || RECOVERY_COMBOS_BY_WORLD[0];
      const level = clamp(this.worldStage?.level || this.wave || 1, 1, 5);
      return world[level - 1] || world[0] || 'tridente';
    }

    activateRecoveryCombo(comboId, seconds = 5) {
      const combo = FUSIONS.find(f => f.id === comboId) || FUSIONS.find(f => f.id === 'tridente');
      if (!combo) return false;
      const duration = Math.max(1, seconds);
      combo.requires.forEach(id => {
        this.powerLevels[id] = Math.max(1, this.powerLevels?.[id] || 0);
        this.powerActivity[id] = Math.max(this.powerActivity?.[id] || 0, duration);
      });
      const primary = combo.requires.find(id => ['triple','laser','voidray'].includes(id));
      if (primary) this.activePowerSlots.weaponMode = primary;
      this.syncActiveCombos();
      this.toast('⚡ COMBO DE RECUPERACIÓN', `${combo.name} · ${duration}s`);
      AudioFX.chord([440,554.37,659.25],.16,.04);
      return true;
    }

    spawnRecoveryPackage() {
      if (!this.player) return;
      const p = this.player;
      const loadout = (this.recoveryLoadout || []).slice(0, 8);
      const total = Math.max(1, loadout.length);
      loadout.forEach((entry, idx) => {
        const pow = POWERS.find(meta => meta.id === entry.id);
        const a = -Math.PI / 2 + (Math.PI * 2 / total) * idx;
        const radius = 82 + (idx % 2) * 24;
        this.spawnPickup(p.x + Math.cos(a)*radius, p.y + Math.sin(a)*radius, 'power', 1, {
          powerId: entry.id,
          major: true,
          rewardGlow: true,
          reclaimPower: true,
          recoveryDrop: true,
          restoreLevel: entry.level,
          label: `RECUPERA ${pow?.name?.toUpperCase() || 'PODER'}`,
          powerDuration: Math.max(7, entry.duration),
          life: 32,
          autoDelay: 999
        });
      });
      // El impulsor siempre vuelve como salvavidas de movilidad, aunque ya estuviera entre los poderes previos.
      this.spawnPickup(clamp(p.x + 118, 42, this.w-42), clamp(p.y - 58, 42, this.h-42), 'power', 1, {
        powerId: 'afterburner', major: true, rewardGlow: true, recoveryDrop: true,
        label: 'IMPULSOR DE RECUPERACIÓN · 12s', powerDuration: 12, life: 32, autoDelay: 999
      });
      const comboId = this.getRecoveryComboId();
      const combo = FUSIONS.find(f => f.id === comboId);
      this.spawnPickup(clamp(p.x - 118, 42, this.w-42), clamp(p.y - 58, 42, this.h-42), 'combo', 1, {
        comboId, major: true, rewardGlow: true, recoveryDrop: true,
        label: `COMBO ${combo?.name?.toUpperCase() || 'RECUPERACIÓN'} · 5s`, life: 32, autoDelay: 999
      });
      this.recoveryLoadout = [];
      this.toast('♻ PAQUETE DE RECUPERACIÓN', `${loadout.length} poderes previos + Impulsor + Combo 5s`);
    }

    spawnDifficultyHordeHazards() {
      if (!this.isHardMode()) return;
      const pt=this.randomTacticalPoint();
      if(Math.random()<.55)this.spawnPickup(pt[0],pt[1],'shield',24+this.mapIndex*3,{rewardGlow:true,label:'BONO DIFÍCIL',life:24,autoDelay:999});
      else this.spawnPickup(pt[0],pt[1],'power',1,{rewardGlow:true,label:'PODER DE HORDA',life:24,autoDelay:999});
      if (this.mapIndex===0) { this.spawnMeteorRain(this.mobileLandscape?2:3,false); if(Math.random()<.45)this.spawnPlanetObstacle(1); }
      else if (this.mapIndex===1) { this.spawnOrbitalWreck(this.mobileLandscape?1:2,true); this.spawnMeteorRain(2,false); }
      else if (this.mapIndex===2) this.spawnWorldThreeHazard(this.mobileLandscape?1:2,true);
      else if (this.mapIndex===3) this.spawnWorldFourHazard(this.mobileLandscape?1:2,true);
      else if (this.mapIndex===4) this.spawnWorldFiveHazard(this.mobileLandscape?1:2,true);
    }

    triggerWorldOneHorde() {
      if (this.wave < 2 || this.wave >= 5) return;
      const wide = this.w >= 1100;
      const count = wide ? 5 : 4;
      this.spawnWorldOneVisibleSwarm(count);
      if (this.wave >= 3) this.spawnWorldOneVisibleSwarm(wide ? 3 : 2);
      this.spawnCrossWorldPrizeBurst((this.wave >= 4 ? 2 : 1) + (this.getDifficulty().hordeRewardBonus||0));
      this.spawnHordeEmergencyKit();
      this.spawnDifficultyHordeHazards();
      this.worldOneState.hordeSeen = (this.worldOneState.hordeSeen || 0) + 1;
      this.toast('⚠️ HORDA ABIERTA', `Mundo 1 · oleada ${this.wave} · más premios en pantalla`);
    }

    spawnWorldTwoVFormation(size = 3, diagonal = false, rightToLeft = false) {
      const pool = ['vora_aguja', 'vora_colmillo', 'vora_cuchilla', 'void_orbe', 'void_sifon', 'void_niebla'];
      const leadX = rightToLeft ? this.w + 40 : -40;
      const dir = rightToLeft ? -1 : 1;
      const baseY = clamp(this.player.y + rand(155, -155), 88, this.h - 120);
      for (let i = 0; i < size; i++) {
        const id = pick(pool);
        this.spawnEnemy(id, true);
        const e = this.enemies[this.enemies.length - 1];
        if (!e) continue;
        const row = i === 0 ? 0 : Math.ceil(i / 2);
        const wing = i === 0 ? 0 : (i % 2 ? -1 : 1);
        e.x = leadX - dir * row * 46;
        e.y = clamp(baseY + wing * row * 28 + (diagonal ? row * 12 * (rightToLeft ? -1 : 1) : 0), 54, this.h - 54);
        e.speed *= 1.08;
        e.r *= .92;
        e.onScreenSpawn = true;
        e.formationVX = dir * rand(86, 64);
        e.formationVY = diagonal ? wing * rand(24, 12) : wing * rand(8, -8);
        e.formationTime = 7.8;
      }
    }

    triggerWorldTwoHorde() {
      if (this.wave < 2 || this.wave >= 5) return;
      const idx = Math.min(HORDE_SIZE_BANDS.length - 1, Math.max(0, this.wave - 2));
      const size = HORDE_SIZE_BANDS[idx];
      this.spawnWorldTwoVFormation(size, Math.random() < .68, Math.random() < .5);
      if (size >= 6) this.spawnWorldTwoVFormation(3, Math.random() < .5, Math.random() < .5);
      this.spawnCrossWorldPrizeBurst((size >= 6 ? 2 : 1) + (this.getDifficulty().hordeRewardBonus||0));
      this.spawnHordeEmergencyKit();
      this.spawnDifficultyHordeHazards();
      this.worldTwoState.hordeSeen = (this.worldTwoState.hordeSeen || 0) + 1;
      this.toast('☣️ HORDA DEL NEXO', `Formación en V x${size} · premios tácticos liberados`);
    }

    spawnWorldTwoVisibleColony(count=3) {
      const pool=[...WORLD_TWO_MINION_FAMILIES[0],...WORLD_TWO_MINION_FAMILIES[1]];
      for(let i=0;i<count;i++) {
        const a=(Math.PI*2/count)*i+rand(.24,-.24);
        const d=rand(310,170);
        this.spawnEnemyNearPlayer(pick(pool),a,d,true,i%2===0?1.12:1.04);
      }
    }

    spawnWorldTwoHazards() {
      if(!this.player)return;
      const p=this.player;
      this.zones.push({type:'toxic',x:clamp(p.x+rand(230,-230),90,this.w-90),y:clamp(p.y+rand(170,-170),100,this.h-100),r:rand(78,54),life:5.2,max:5.2});
      if(this.zones.length>5)this.zones.splice(0,this.zones.length-5);
    }

    spawnLogic(dt) {
      if (this.bossActive || this.run?.mapComplete) return;
      this.spawnTime -= dt;
      if (this.mapIndex === 0) {
        const phase = clamp(this.wave, 1, 5);
        const w1 = this.worldOneState;
        if (w1?.bossPrelude > 0) return;
        const wide = this.w >= 1100;
        const mid = this.w >= 760;
        const targets = wide ? [8,7,10,11,7] : (mid ? [7,6,8,9,6] : [5,5,6,7,5]);
        const intervals = [1.02,1.16,.9,.84,1.18];
        const targetCount = targets[phase - 1];
        const interval = intervals[phase - 1];
        const hazardPace=this.getDifficulty().hazardPace||1;
        w1.meteorTimer -= dt*hazardPace;
        w1.rainTimer -= dt*hazardPace;
        w1.bombTimer -= dt*hazardPace;
        w1.planetTimer -= dt*hazardPace;
        w1.burstTimer -= dt*hazardPace;

        if (phase === 2 && w1.meteorTimer <= 0) {
          this.spawnMeteor(1, false);
          w1.meteorTimer = rand(7.0, 4.8);
        } else if (phase >= 3 && phase <= 4 && w1.meteorTimer <= 0) {
          this.spawnMeteor(1, phase === 3);
          w1.meteorTimer = rand(9.5, 6.2);
        }
        if (phase === 2 && w1.rainTimer <= 0) {
          this.spawnMeteorRain(2, false);
          w1.rainTimer = rand(14, 10.5);
        }
        if (phase === 4 && w1.planetTimer <= 0) {
          this.spawnPlanetObstacle(1);
          w1.planetTimer = rand(16, 11.5);
        }
        if (phase === 4 && w1.bombTimer <= 0) {
          this.spawnFallingBomb(1);
          w1.bombTimer = rand(11, 8);
        }
        if (phase === 3 && w1.burstTimer <= 0 && this.enemies.length < targetCount - 1) {
          this.spawnWorldOneVisibleSwarm(wide ? 3 : 2);
          w1.burstTimer = rand(10.5, 8.0);
        }
        if (phase === 3 && (w1.mirrorCount || 0) < 1 && this.waveTime > 8) this.spawnMirrorShip(true, false);
        if (phase === 4 && (w1.mirrorCount || 0) < 2 && this.waveTime > 10) this.spawnMirrorShip(false, false);

        if (this.spawnTime <= 0 && this.enemies.length < targetCount) {
          let amount = 1;
          if (phase === 3 && this.enemies.length < targetCount * .55) amount = 2;
          if (phase === 4 && this.enemies.length < targetCount * .45) amount = 2;
          if (phase === 5) amount = 1;
          for (let i=0;i<amount;i++) {
            let id = this.worldOneEnemyId();
            if (phase === 5) id = pick(['corredor','sombra','griton','esquivo','nave_espejo']);
            this.spawnEnemy(id, phase < 4 || phase === 5);
          }
          this.spawnTime = interval + rand(.18, -.12);
        }
        return;
      }
      if (this.mapIndex === 1) {
        const phase=clamp(this.wave,1,5);
        const w2=this.worldTwoState;
        if (w2?.bossPrelude>0) return;
        const wide=this.w>=1100, mid=this.w>=760;
        const targets=wide?[10,11,12,12,8]:(mid?[9,10,11,11,7]:[7,8,9,9,6]);
        const intervals=[.96,.9,.86,.96,1.08];
        const targetCount=targets[phase-1];
        w2.sporeTimer-=dt; w2.fogTimer-=dt; w2.splitTimer-=dt; w2.colonyTimer-=dt; w2.toxicZoneTimer-=dt; w2.junkTimer-=dt; w2.meteorTimer-=dt; w2.planetTimer-=dt; w2.chaosTimer-=dt;
        if (w2.junkTimer<=0) { this.spawnOrbitalWreck(phase>=4&&wide?2:1, phase<=2); w2.junkTimer=rand(phase>=4?8.8:11.5,phase>=4?6.2:8.2); }
        if (phase>=2 && w2.meteorTimer<=0) { this.spawnMeteor(phase>=4?2:1, phase<4); w2.meteorTimer=rand(phase>=4?7.8:10.2,phase>=4?5.2:7.0); }
        if (phase===2 && w2.fogTimer<=0) { this.spawnWorldTwoVisibleColony(2); w2.fogTimer=rand(12,9); }
        if (phase>=3 && w2.toxicZoneTimer<=0) { this.spawnWorldTwoHazards(); w2.toxicZoneTimer=rand(11,8); }
        if (phase>=3 && w2.planetTimer<=0) { this.spawnPlanetObstacle(1); w2.planetTimer=rand(phase>=4?10.5:13.5,phase>=4?7.6:9.5); }
        if (phase===4 && w2.colonyTimer<=0 && this.enemies.length<targetCount-1) { this.spawnEnemy('metal_tanque',false); w2.colonyTimer=rand(12,9); }
        if (phase>=4 && w2.chaosTimer<=0) { this.spawnMeteorRain(phase===5?3:2,true); this.spawnOrbitalWreck(1,false); w2.chaosTimer=rand(10.5,7.6); }
        if (phase < 5 && this.spawnTime<=0 && this.enemies.length<targetCount) {
          let amount=(phase===2||phase===3)&&this.enemies.length<targetCount*.45?2:1;
          if (phase===4 && this.enemies.length<targetCount*.42) amount=2;
          for(let i=0;i<amount;i++) this.spawnEnemy(this.worldTwoEnemyId(),phase<4);
          this.spawnTime=intervals[phase-1]+rand(.16,-.1);
        }
        if (phase === 5 && this.spawnTime <= 0) {
          const escorts=this.enemies.filter(e=>e.prefectEscort).length;
          const captainAlive=this.enemies.some(e=>e.world2Captain);
          if (captainAlive && escorts < 2) {
            const cap=this.enemies.find(e=>e.world2Captain);
            const fam=cap?.captainIndex!=null ? WORLD_TWO_MINION_FAMILIES[cap.captainIndex] : WORLD_TWO_MINION_FAMILIES[0];
            this.spawnEnemy(pick(fam.slice(0,4)), true);
            const guard=this.enemies[this.enemies.length-1];
            if (guard && !guard.boss) guard.prefectEscort=true;
          }
          this.spawnTime=4.8;
        }
        return;
      }
      if(this.mapIndex===2){const wide=this.w>=1100,mid=this.w>=760,targetCount=wide?[9,10,11,12,9][this.wave-1]:(mid?[8,9,10,11,8][this.wave-1]:[6,7,8,9,7][this.wave-1]),interval=[.94,.88,.82,.78,.92][this.wave-1]||.86;if(this.spawnTime<=0&&this.enemies.length<targetCount){let amount=(this.wave>=3&&this.enemies.length<targetCount*.45)?2:1;for(let i=0;i<amount;i++)this.spawnEnemy(this.worldThreeEnemyId(),this.wave<5);this.spawnTime=interval+rand(.14,-.08);}return;}
      if(this.mapIndex===3){const wide=this.w>=1100,mid=this.w>=760,targetCount=wide?[10,11,12,13,10][this.wave-1]:(mid?[9,10,11,12,9][this.wave-1]:[7,8,9,10,8][this.wave-1]),interval=[.92,.86,.82,.78,.90][this.wave-1]||.84;const w4=this.worldFourState||{};w4.hazardTimer=(w4.hazardTimer??7)-dt*(this.getDifficulty().hazardPace||1);w4.hordeTimer=(w4.hordeTimer??12.5)-dt*(this.getDifficulty().hordePace||1);this.worldFourState=w4;if(w4.hazardTimer<=0){this.spawnWorldFourHazard(this.wave>=4?2:1,this.wave>=3);w4.hazardTimer=rand(this.wave>=4?7.4:9.4,this.wave>=4?5.0:6.6);}if(w4.hordeTimer<=0&&this.wave>=2){this.triggerWorldFourHorde();w4.hordeTimer=rand(this.wave>=4?15:19,this.wave>=4?11:14);}if(this.spawnTime<=0&&this.enemies.length<targetCount){let amount=(this.wave>=3&&this.enemies.length<targetCount*.45)?2:1;for(let i=0;i<amount;i++)this.spawnEnemy(this.worldFourEnemyId(),this.wave<5);this.spawnTime=interval+rand(.14,-.08);}return;}
      if(this.mapIndex===4){const wide=this.w>=1100,mid=this.w>=760,targetCount=wide?[10,11,13,14,11][this.wave-1]:(mid?[9,10,12,13,10][this.wave-1]:[7,8,10,11,8][this.wave-1]),interval=[.90,.84,.80,.74,.88][this.wave-1]||.82;const w5=this.worldFiveState||{};w5.hazardTimer=(w5.hazardTimer??6.8)-dt*(this.getDifficulty().hazardPace||1);w5.hordeTimer=(w5.hordeTimer??11.8)-dt*(this.getDifficulty().hordePace||1);this.worldFiveState=w5;if(w5.hazardTimer<=0){this.spawnWorldFiveHazard(this.wave>=4?2:1,true);w5.hazardTimer=rand(this.wave>=4?6.8:8.6,this.wave>=4?4.8:6.0);}if(w5.hordeTimer<=0&&this.wave>=2){this.triggerWorldFiveHorde();w5.hordeTimer=rand(this.wave>=4?14:18,this.wave>=4?10:13);}if(this.spawnTime<=0&&this.enemies.length<targetCount){let amount=(this.wave>=2&&this.enemies.length<targetCount*.48)?2:1;if(this.wave>=4&&this.enemies.length<targetCount*.32)amount=3;for(let i=0;i<amount;i++)this.spawnEnemy(this.worldFiveEnemyId(),this.wave<5);this.spawnTime=interval+rand(.12,-.08);}return;}
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
        const pool = ['cazador','corredor','esquivo','toxico'];
        if (this.wave >= 2) pool.push('sombra','blindado','cazador');
        if (this.wave >= 3) pool.push('divisor','toxico','nave_espejo');
        if (this.wave >= 4) pool.push('griton','blindado','nave_espejo');
        return pool;
      }
      if (this.mapIndex === 1) {
        const pool=[...WORLD_TWO_MINION_FAMILIES[0].slice(0,3)];
        if(this.wave>=2)pool.push(...WORLD_TWO_MINION_FAMILIES[1].slice(0,4));
        if(this.wave>=3)pool.push(WORLD_TWO_MINION_FAMILIES[0][4],WORLD_TWO_MINION_FAMILIES[1][4]);
        if(this.wave>=4)pool.push(...WORLD_TWO_MINION_FAMILIES[2]);
        return pool;
      }
      if(this.mapIndex===2){const A=WORLD_THREE_MINION_FAMILIES[0],B=WORLD_THREE_MINION_FAMILIES[1],C=WORLD_THREE_MINION_FAMILIES[2];if(this.wave===1)return[...A];if(this.wave===2)return[...A,...B.slice(0,3)];if(this.wave===3)return[...A.slice(1),...B];if(this.wave===4)return[...B,...C];return[A[4],B[3],B[4],...C];}
      if(this.mapIndex===3){const A=WORLD_FOUR_MINION_FAMILIES[0],B=WORLD_FOUR_MINION_FAMILIES[1];if(this.wave===1)return[...A];if(this.wave===2)return[...A,...B.slice(0,1)];if(this.wave===3)return[...A,...B.slice(0,2)];return[...A,...B];}
      if(this.mapIndex===4){const A=WORLD_FIVE_MINION_FAMILIES[0],B=WORLD_FIVE_MINION_FAMILIES[1];if(this.wave===1)return[...A];if(this.wave===2)return[...A,...B.slice(0,1)];if(this.wave===3)return[...A,...B.slice(0,2)];return[...A,...B];}
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
        const spriteKey = this.mapIndex === 1 ? pick(WORLD_TWO_EXTRA_SPRITES.meteors) : (this.mapIndex===3 ? pick(WORLD_FOUR_HAZARDS) : (this.mapIndex===4 ? pick(WORLD_FIVE_HAZARDS) : null));
        this.meteors.push({ kind:'meteor', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, life: gentle ? 5.8 : 4.7, dmg: gentle ? 9 : 15, color: gentle ? '#ffd56a' : '#ff7b32', trail: [], spin: rand(2, -2), fireball: true, hp: (gentle ? 18 : 28) + this.wave * 4, score: gentle ? 12 : 18, coins: gentle ? 4 : 6, spriteKey });
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

    // DSEBI gameplay balance v0.9.0: mundos 1 y 2 con progresión diferenciada.
    // Enemigos elite: esquivan, persiguen, resisten y obligan a moverse.
    hardEnemyRate() {
      const bonus=this.isHardMode() ? .08 : 0;
      if (this.mapIndex === 0) return Math.min(.66, .14 + Math.max(0, this.wave - 1) * .095 + bonus);
      return Math.min(0.84, 0.28 + Math.max(0, this.wave - 1) * 0.10 + this.mapIndex * 0.018 + bonus);
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
      e.r *= e.eliteKind === 'brute' ? 1.10 : (this.mapIndex === 1 ? 1.02 : 0.92);
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
        this.meteors.push({ kind:'bomb', x:clamp(targetX, 40, this.w-40), y:-70-rand(160,0), vx:rand(34,-34), vy:250 + this.wave*22, r, life:5.2, dmg:18 + this.wave*3, color:'#ff4e4e', trail:[], spin:rand(3,-3), warning:true, hp: 32 + this.wave * 6, score: 24, coins: 8 });
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
        this.meteors.push({ kind: Math.random() < .55 ? 'planet' : 'moon', x:fromLeft ? -90 : this.w+90, y, vx:(fromLeft?1:-1)*sp, vy:rand(28,-28), r, life:9.5, dmg:26 + this.wave*4, color:'#9fd4ff', trail:[], spin:rand(1.2,-1.2), planet:true, hp: 68 + this.wave * 9, score: 46, coins: 18 });
      }
    }

    spawnOrbitalWreck(count = 1, fast = false) {
      if (!this.meteors) this.meteors = [];
      const cap = this.maxMeteors || (this.isSmallScreen ? 5 : 8);
      for (let i=0;i<count && this.meteors.length < cap;i++) {
        const fromLeft = Math.random() < .5;
        const x = fromLeft ? -120 : this.w + 120;
        const y = rand(this.h*.82, this.h*.16);
        const targetX = fromLeft ? this.w + 160 : -160;
        const targetY = clamp(y + rand(130,-130), 50, this.h - 50);
        const a = Math.atan2(targetY - y, targetX - x);
        const sp = fast ? rand(220,150) : rand(170,105);
        const r = rand(27,18);
        this.meteors.push({ kind:'wreck', x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, r, life:fast?6.8:8.8, dmg:fast?12:16, color:'#ffb35c', trail:[], spin:rand(1.8,-1.8), hp:38+this.wave*5, score:22, coins:7, spriteKey:pick(WORLD_TWO_EXTRA_SPRITES.debris) });
      }
    }

    spawnEnemy(forceId = null, mini = false) {
      const id = forceId || pick(this.enemyPool());
      const cfg = ENEMY_TYPES.find(e => e.id === id) || ENEMY_TYPES[0];
      const side = Math.floor(Math.random() * 4);
      const cb=this.getCombatBounds();
      const edge=this.mobileLandscape?34:40;
      let x = 0, y = 0;
      if (side === 0) { x = rand(cb.right,cb.left); y = cb.top-edge; }
      if (side === 1) { x = cb.right+edge; y = rand(cb.bottom,cb.top); }
      if (side === 2) { x = rand(cb.right,cb.left); y = cb.bottom+edge; }
      if (side === 3) { x = cb.left-edge; y = rand(cb.bottom,cb.top); }
      const worldOneMini = this.mapIndex === 0 && mini;
      const worldTwoMini = this.mapIndex === 1 && mini;
      const isMirror = id === 'nave_espejo';
      const scale = isMirror ? (this.mapIndex === 0 ? .82 : 1) : (worldOneMini ? .72 : (worldTwoMini ? .88 : (mini ? .68 : (1 + this.mapIndex * .04 + this.wave * .025))));
      const mobileEnemyScale=this.mobileLandscape?.86:(this.mobilePortrait?.72:1);
      const enemy = {
        ...cfg,
        x, y,
        baseHp: cfg.hp * scale,
        hp: cfg.hp * scale,
        speed: cfg.speed * (1 + this.wave * .018 + this.mapIndex * .012) * (this.mapIndex === 0 ? (1.08 + (this.wave - 1) * .055) : 1) * (isMirror ? 1.02 : (worldOneMini ? 1.06 : (mini ? 1.16 : 1))),
        r: cfg.r * (isMirror ? 1.05 : (worldOneMini ? .78 : (worldTwoMini ? .96 : (mini ? .82 : 1)))) * mobileEnemyScale,
        visualScale: (this.mapIndex === 1 ? (worldTwoMini ? 1.08 : 1.12) : 1) * mobileEnemyScale,
        mirrorFire: isMirror ? rand(1.4, .7) : 0,
        familyFire: this.mapIndex === 0 ? rand(3.4, 1.4) : (this.mapIndex === 1 ? rand(3.1,1.35) : 0),
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
      const diff=this.getDifficulty();
      enemy.hp*=diff.enemyHp; enemy.baseHp=enemy.hp; enemy.speed*=diff.enemySpeed;
      if(this.isHardMode()&&enemy.hard) enemy.score=Math.ceil(enemy.score*1.08);
      this.enemies.push(enemy);
    }

    spawnBoss() {
      const map = MAPS[this.mapIndex];
      const p = currentProfile();
      const campaignScale = 1 + this.mapIndex * .08;
      let hp = (1120 + this.mapIndex * 270 + this.wave * 118) * campaignScale;
      hp *= this.mapIndex===0?4.35:(this.mapIndex===1?3.82:(this.mapIndex===2?4.05:(2.25+this.mapIndex*.095)));
      hp *= this.getDifficulty().bossHp || 1;
      const x = this.w / 2;
      const y = -80;
      const shieldBase = (this.mapIndex === 0 ? 680 : (this.mapIndex === 1 ? 560 : 310 + this.mapIndex * 42)) * (this.getDifficulty().bossShield || 1);
      this.bossActive = {
        id: 'boss_' + map.id,
        name: map.boss,
        color: map.theme[2],
        beast: map.beast,
        family: map.family,
        pattern: map.pattern,
        variant: map.variant || 1,
        summons: this.mapIndex===1?WORLD_TWO_MINION_FAMILIES.flat():(this.mapIndex===2?WORLD_THREE_MINION_FAMILIES.flat():(this.mapIndex===3?WORLD_FOUR_MINION_FAMILIES.flat():(this.mapIndex===4?WORLD_FIVE_MINION_FAMILIES.flat():(map.summons||[])))),
        specialName: boss2Meta(this.mapIndex).special,
        x, y,
        targetY:this.mapIndex===1?this.h*.22:(this.mapIndex===2?this.h*.20:(this.mapIndex===3?this.h*.21:(this.mapIndex===4?this.h*.22:this.h*.18))),
        hp,
        baseHp: hp,
        speed: (this.mapIndex === 0 ? 33 : (this.mapIndex === 1 ? 34 : (this.mapIndex===2?40:(this.mapIndex===3?43:46)))) + this.mapIndex * 1.5,
        r:(this.mapIndex===0?36:(this.mapIndex===1?54:(this.mapIndex===2?58:(this.mapIndex===3?62:(this.mapIndex===4?68:(31+this.mapIndex*.36)*.64))))) * (this.mobileLandscape?.78:(this.mobilePortrait?.66:1)),
        t: 0,
        attack: this.mapIndex === 0 ? 2.55 : (this.mapIndex === 1 ? 2.28 : (this.mapIndex===2?1.95:(this.mapIndex===3?1.88:1.82))),
        specialCd: this.mapIndex === 0 ? 6.6 : (this.mapIndex === 1 ? 6.0 : (this.mapIndex===2?5.3:(this.mapIndex===3?5.0:4.6))),
        specialTelegraph: 0,
        specialTelegraphMax: 0,
        phase: 1,
        alpha: 1,
        shield: shieldBase,
        shieldMax: shieldBase,
        vulnerable: 0,
        summonPressure: 0,
        boss: true,
        minionFamilies:this.mapIndex===0?WORLD_ONE_MINION_FAMILIES:(this.mapIndex===1?WORLD_TWO_MINION_FAMILIES:(this.mapIndex===2?WORLD_THREE_MINION_FAMILIES:(this.mapIndex===3?WORLD_FOUR_MINION_FAMILIES:(this.mapIndex===4?WORLD_FIVE_MINION_FAMILIES:[]))))
      };
      this.bossActive.attack *= this.getDifficulty().bossCadence || 1;
      this.bossActive.specialCd *= this.getDifficulty().bossCadence || 1;
      this.bossFight = { active: true, charge: 0, minionTimer: this.mapIndex === 0 ? 1.6 : (this.mapIndex === 1 ? 1.85 : 2.15), phaseNotified: 1, cinematic: this.mapIndex === 1 ? 1.95 : 1.15, addsKilled: 0, supportTimer: this.mapIndex === 0 ? 2.2 : 1.9, escortTimer: this.mapIndex === 0 ? 3.4 : (this.mapIndex === 1 ? 3.2 : 3.9), hazardTimer: this.mapIndex === 0 ? 5.0 : (this.mapIndex === 1 ? 4.8 : 4.2), guardianPulse: 0 };
      this.enemies.push(this.bossActive);
      this.bossIntroduced = true;
      this.grantBossAid('Duelo de jefe');
      AudioFX.boss();
      AudioFX.music(this.mapIndex, true, MAPS[this.mapIndex]?.family || 'zombie', this.bossActive?.phase || 1);
      if (this.mapIndex === 1) AudioFX.world2BossCue();
      this.shake = 12;
      this.flash = 1;
      els.bossBar.classList.add('hidden');
      els.bossName.textContent = `${map.boss} · ${this.bossActive.specialName}`;
      this.updateBossUi();
      this.showBossIntro(map, this.bossActive);
      if (this.mapIndex === 0) {
        const escortFamilies = [['cazador','corredor','esquivo'], ['toxico','divisor','sombra'], ['blindado','griton','nave_espejo']];
        escortFamilies.forEach((fam, familyIndex) => {
          for (let i = 0; i < 2; i++) {
            this.spawnEnemy(pick(fam), true);
            const escort = this.enemies[this.enemies.length - 1];
            if (escort && !escort.boss) {
              escort.bossEscort = true;
              escort.bossFamilyIndex = familyIndex;
              escort.hp *= 1.18;
              escort.baseHp = escort.hp;
              escort.r *= .92;
            }
          }
        });
        this.toast('SÉQUITO DEL JEFE','Destrúyelo para romper su protección');
      } else if (this.mapIndex === 1) {
        WORLD_TWO_MINION_FAMILIES.forEach((fam,familyIndex)=>{
          for(let i=0;i<2;i++) {
            this.spawnEnemy(pick(fam),true);
            const escort=this.enemies[this.enemies.length-1];
            if(escort && !escort.boss){ escort.bossEscort=true; escort.bossFamilyIndex=familyIndex; escort.hp*=1.22; escort.baseHp=escort.hp; escort.r*=.94; }
          }
        });
        this.toast('TRÍADA DEL PATRIARCA','Tres familias sostienen su escudo');
      } else if(this.mapIndex===2){WORLD_THREE_MINION_FAMILIES.forEach((fam,fi)=>{for(let i=0;i<2;i++){this.spawnEnemy(pick(fam),true);const escort=this.enemies[this.enemies.length-1];if(escort&&!escort.boss){escort.bossEscort=true;escort.bossFamilyIndex=fi;escort.hp*=1.25;escort.baseHp=escort.hp;escort.r*=1.04;}}});this.worldThreeState.speedBurst=6;this.spawnWorldThreeHazard(2,true);this.toast('TRÍADA VIRIDIANA','Tres familias protegen al Soberano');}
      else if(this.mapIndex===3){WORLD_FOUR_MINION_FAMILIES.forEach((fam,fi)=>{for(let i=0;i<2;i++){this.spawnEnemy(pick(fam),true);const escort=this.enemies[this.enemies.length-1];if(escort&&!escort.boss){escort.bossEscort=true;escort.bossFamilyIndex=fi;escort.hp*=1.22;escort.baseHp=escort.hp;escort.r*=1.02;}}});this.spawnWorldFourHazard(2,true);this.toast('ÉLITE DEL ECLIPSE','Dos alas protegen al Arconte');}
      else if(this.mapIndex===4){WORLD_FIVE_MINION_FAMILIES.forEach((fam,fi)=>{for(let i=0;i<2;i++){this.spawnEnemy(pick(fam),true);const escort=this.enemies[this.enemies.length-1];if(escort&&!escort.boss){escort.bossEscort=true;escort.bossFamilyIndex=fi;escort.hp*=1.24;escort.baseHp=escort.hp;escort.r*=1.04;}}});this.spawnWorldFiveHazard(2,true);this.toast('GUARDIA DE SINGULARIDAD','El Coloso convoca dos familias del vacío');}
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
        if (!e) continue;
        e.t += dt;
        if (!e.boss) {
          e.trail = e.trail || [];
          if (this.mapIndex === 0 && (e.id === 'mosquito' || e.behavior === 'mirror' || e.id === 'corredor') && Math.random() < .34) {
            e.trail.push({ x:e.x, y:e.y, life:.32, r:e.r, color:e.color });
            if (e.trail.length > 5) e.trail.shift();
          }
          if (e.trail) e.trail.forEach(t => t.life -= dt);
        }
        if (e.boss && e.y < e.targetY) e.y += e.speed * dt;
        const dx = p.x - e.x, dy = p.y - e.y;
        const d = Math.hypot(dx, dy) || 1;
        const stasisScale=this.getStagePowerScale();
        const slow = (e.slow ? .55 : 1) * (this.isPowerActive('stasis') ? (e.boss ? Math.max(.72,.82/stasisScale) : Math.max(.46,.58/stasisScale)) : 1);
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
        if (this.mapIndex === 0 && !e.boss && e.behavior !== 'mirror' && ['cazador','corredor','esquivo','mosquito','toxico','sombra','divisor','larva','nucleo','blindado','griton','explosivo','errante'].includes(e.id)) {
          e.familyFire = (e.familyFire || 2.4) - dt;
          if (e.familyFire <= 0 && d < 720) {
            const a = Math.atan2(p.y - e.y, p.x - e.x);
            const familyB = ['toxico','sombra','divisor','larva','nucleo'].includes(e.id);
            const familyC = ['blindado','griton','explosivo','errante'].includes(e.id);
            const speed = familyC ? 180 : (familyB ? 205 : 235);
            const damage = (familyC ? 7 : (familyB ? 5.5 : 5)) * (e.worldCaptain ? 1.35 : 1);
            const spread = e.worldCaptain ? .035 : .07;
            this.addEnemyBullet(e.x, e.y, a + rand(spread,-spread), speed * (e.worldCaptain ? 1.08 : 1), damage, familyC ? '#ff8b32' : (familyB ? '#b7ff69' : '#83eaff'));
            e.familyFire = e.worldCaptain ? rand(1.55,1.05) : (familyC ? rand(3.7,2.6) : (familyB ? rand(3.2,2.1) : rand(2.9,1.8)));
          }
        }
        if (this.mapIndex === 1 && !e.boss && e.world2Family) {
          e.familyFire=(e.familyFire||rand(2.9,1.7))-dt;
          if(e.familyFire<=0 && d<740){
            const a=Math.atan2(p.y-e.y,p.x-e.x);
            const fam=e.world2Family;
            const speed=fam==='voracid'?250:(fam==='void'?205:175);
            const damage=(fam==='voracid'?5.8:(fam==='void'?6.6:8.2))*(e.world2Captain?1.35:1);
            const spread=e.world2Captain?.035:(fam==='voracid'?.06:(fam==='void'?.09:.045));
            this.addEnemyBullet(e.x,e.y,a+rand(spread,-spread),speed*(e.world2Captain?1.08:1),damage,fam==='voracid'?'#b7ff69':(fam==='void'?'#c391ff':'#ffb35c'));
            if(Math.random()<.35)AudioFX.world2Shot();
            e.familyFire=e.world2Captain?rand(1.45,1.0):(fam==='voracid'?rand(2.6,1.7):(fam==='void'?rand(3.1,2.0):rand(3.7,2.6)));
          }
        }
        if(this.mapIndex===2&&!e.boss&&e.world3Family){e.familyFire=(e.familyFire||rand(2.7,1.5))-dt;if(e.familyFire<=0&&d<780){const a=Math.atan2(p.y-e.y,p.x-e.x),fam=e.world3Family,speed=fam==='viridian'?285:(fam==='crystal'?235:195),damage=fam==='viridian'?6.2:(fam==='crystal'?7.4:9.2),spread=fam==='viridian'?.045:(fam==='crystal'?.075:.04);this.addEnemyBullet(e.x,e.y,a+rand(spread,-spread),speed,damage,fam==='viridian'?'#74ff73':(fam==='crystal'?'#74ffd1':'#dfff84'));e.familyFire=fam==='viridian'?rand(2.2,1.35):(fam==='crystal'?rand(2.8,1.7):rand(3.5,2.3));}}
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
          if (e.specialCd <= 0) {
            if ((e.specialTelegraph || 0) <= 0) this.startBossTelegraph(e);
            else {
              e.specialTelegraph = Math.max(0, e.specialTelegraph - dt);
              if (e.specialTelegraph <= 0) this.triggerBossSpecial(e);
            }
          }
          bossHandled = this.updateBossMotion(e, dt);
        }
        if (!bossHandled) {
          e.x += mx * e.speed * slow * speedBuff * dt;
          e.y += my * e.speed * slow * speedBuff * dt;
        }
        if (!e.boss && (e.formationVX || e.formationVY)) {
          e.formationTime = Math.max(0, (e.formationTime || 0) - dt);
          const driftMul = e.formationTime > 0 ? 1 : .35;
          e.x += (e.formationVX || 0) * driftMul * dt;
          e.y += (e.formationVY || 0) * driftMul * dt;
          if (e.formationTime <= 0) { e.formationVX *= .985; e.formationVY *= .985; }
        }

        if (e.behavior === 'mist' && Math.random() < .018) this.emit(e.x, e.y, '#ffffff', 2, 80, .8, 'mist');
        if (e.behavior === 'toxic' && Math.random() < .012) this.zones.push({ x: e.x, y: e.y, r: 28, life: 3.5, max: 3.5, type: 'toxic' });
        const cb=this.getCombatBounds();
        const escapePad=this.mobileLandscape?180:360;
        if(!e.boss&&(e.x<cb.left-escapePad||e.x>cb.right+escapePad||e.y<cb.top-escapePad||e.y>cb.bottom+escapePad)){
          const side=Math.floor(Math.random()*4),pad=this.mobileLandscape?28:46;
          if(side===0){e.x=cb.left+pad;e.y=rand(cb.bottom-pad,cb.top+pad);}else if(side===1){e.x=cb.right-pad;e.y=rand(cb.bottom-pad,cb.top+pad);}else if(side===2){e.x=rand(cb.right-pad,cb.left+pad);e.y=cb.top+pad;}else{e.x=rand(cb.right-pad,cb.left+pad);e.y=cb.bottom-pad;}
          e.formationVX=0;e.formationVY=0;e.formationTime=0;e.t=0;
        }

        if (d < p.r + e.r && !(e.boss && (e.alpha || 1) < 0.32)) {
          this.playerHit(e.boss ? ((this.mapIndex === 0 ? 14 : 20) + e.phase * (this.mapIndex === 0 ? 2 : 4)) : (e.behavior === 'explosive' ? 24 : (this.mapIndex === 0 ? 8 : 12)));
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

    startBossTelegraph(b) {
      if (!b || !b.boss) return;
      const meta = boss2Meta(this.mapIndex);
      const base = [1.12,1.18,.92,1.08,1.28][this.mapIndex] || 1.05;
      b.specialTelegraphMax = base + Math.max(0, 4-(b.phase||1))*.04;
      b.specialTelegraph = b.specialTelegraphMax;
      b.telegraphPulse = 0;
      this.toast('CARGA DEL JEFE', meta.special);
      const root = meta.music?.root || 82;
      AudioFX.chord([root*1.5,root*2,root*2.5],.09,.035);
    }

    drawBossTelegraph(ctx,e) {
      const remain=e?.specialTelegraph||0,max=e?.specialTelegraphMax||1;
      if(remain<=0)return;
      const meta=boss2Meta(this.mapIndex),t=1-clamp(remain/max,0,1),pulse=.72+Math.sin(now()*.018)*.18;
      ctx.save();
      ctx.globalAlpha=.22+t*.42;
      ctx.strokeStyle=meta.accent||meta.color;ctx.lineWidth=2.2+t*2.2;ctx.shadowBlur=18+t*20;ctx.shadowColor=meta.color;
      ctx.beginPath();ctx.arc(0,0,e.r*(1.55+t*.62+pulse*.08),0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.12+t*.25;ctx.strokeStyle=meta.color;
      const spokes=this.mapIndex===4?8:(this.mapIndex===3?6:4);
      for(let i=0;i<spokes;i++){const a=(Math.PI*2/spokes)*i+now()*.0016*(i%2?1:-1);ctx.beginPath();ctx.moveTo(Math.cos(a)*e.r*.7,Math.sin(a)*e.r*.7);ctx.lineTo(Math.cos(a)*e.r*(1.9+t*.35),Math.sin(a)*e.r*(1.9+t*.35));ctx.stroke();}
      if(this.mapIndex===3||this.mapIndex===4){const p=this.player;if(p){const a=Math.atan2(p.y-e.y,p.x-e.x);ctx.globalAlpha=.16+t*.28;ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*Math.max(this.w,this.h),Math.sin(a)*Math.max(this.w,this.h));ctx.stroke();ctx.setLineDash([]);}}
      ctx.restore();
    }

    drawBossDamageOverlay(ctx,e,hpRatio) {
      if(!e?.boss||hpRatio>.78)return;
      const meta=boss2Meta(this.mapIndex),damage=1-hpRatio,t=now()*.001;
      ctx.save();
      ctx.globalAlpha=clamp((damage-.18)*.48,.06,.38);ctx.strokeStyle=hpRatio<.3?'#fff0d0':meta.accent;ctx.lineWidth=1.3+damage*1.8;ctx.shadowBlur=10;ctx.shadowColor=meta.color;
      const cracks=hpRatio<.3?7:(hpRatio<.54?5:3);
      for(let i=0;i<cracks;i++){const a=(Math.PI*2/cracks)*i+.55;const r0=e.r*(.25+(i%3)*.13),r1=e.r*(.72+(i%2)*.22);ctx.beginPath();ctx.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);ctx.lineTo(Math.cos(a+.12*Math.sin(t+i))*r1,Math.sin(a+.12*Math.sin(t+i))*r1);ctx.stroke();}
      if(hpRatio<.54){ctx.globalAlpha=.22+Math.sin(t*10)*.07;ctx.fillStyle=meta.color;for(let i=0;i<(hpRatio<.3?4:2);i++){const a=t*(.45+i*.08)+i*2.3;ctx.beginPath();ctx.arc(Math.cos(a)*e.r*.72,Math.sin(a*1.17)*e.r*.55,2.2+(i%2),0,Math.PI*2);ctx.fill();}}
      ctx.restore();
    }

    updateRareEvents(dt) {
      if(this.bossActive||this.bossLootPhase?.active||this.cardPause||this.paused)return;
      this.rareEventTimer=(this.rareEventTimer??rand(34,24))-dt;
      if(this.rareEventTimer>0)return;
      const cb=this.getCombatBounds(),hard=this.isHardMode(),roll=Math.random();
      if(roll<.34){
        const p=this.player,ids=['shield','afterburner','stasis'];
        const power=pick(['torpedo','pierce','nanorepair','wingman','pulse']);
        const pts=[[-95,-55],[90,-35],[0,82]];
        pts.forEach((d,i)=>this.spawnPickup(clamp(p.x+d[0],cb.left+28,cb.right-28),clamp(p.y+d[1],cb.top+28,cb.bottom-28),i===0?'shield':'power',i===0?22:1,{powerId:i===1?power:ids[i],rewardGlow:true,label:i===0?'CACHE SHIELD':(i===1?'TECNOLOGÍA RARA':'IMPULSO TÁCTICO'),powerDuration:10.5,ttl:20}));
        this.toast('SEÑAL RARA','Cápsula tecnológica detectada');
      } else if(roll<.67){
        const count=hard?5:4;for(let i=0;i<count;i++){this.spawnEnemy(pick(this.enemyPool()),true);const e=this.enemies[this.enemies.length-1];if(e&&!e.boss){e.hp*=1.18;e.baseHp=e.hp;e.score=Math.ceil((e.score||20)*1.55);e.coins=Math.ceil((e.coins||3)*1.45);e.rareConvoy=true;}}
        this.toast('CONVOY ÉLITE','Recompensa aumentada');
      } else {
        if(this.mapIndex===2)this.spawnWorldThreeHazard(hard?3:2,true);else if(this.mapIndex===3)this.spawnWorldFourHazard(hard?3:2,true);else if(this.mapIndex===4)this.spawnWorldFiveHazard(hard?3:2,true);else this.spawnMeteorRain(hard?4:3,true);
        this.spawnHordeEmergencyKit();
        this.toast('FRENTE DE ESCOMBROS','Meteoros y apoyo táctico');
      }
      this.rareEventTimer=rand(hard?36:48,hard?25:34);
    }

    fireBossProjectile(b,angle,speed,damage,shape,color,opts={}){
      this.addEnemyBullet(b.x,b.y,angle,speed,damage,color,{shape,...opts});
    }

    boss2Pattern(b){
      if(this.mapIndex<0||this.mapIndex>4)return false;
      const p=this.player,meta=boss2Meta(this.mapIndex),base=Math.atan2(p.y-b.y,p.x-b.x),phase=b.phase||1;
      AudioFX.bossShot(this.mapIndex);
      if(this.mapIndex===0){
        const count=3+Math.min(2,phase);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.12;this.fireBossProjectile(b,base+off,205+phase*18,9+phase*2,'meteor',meta.color,{r:7+phase*.35,life:3.8,trail:true});}
      }else if(this.mapIndex===1){
        const count=3+phase;for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.11;this.fireBossProjectile(b,base+off,155+phase*12,8+phase*2,'spore',meta.color,{r:6.5,bossHoming:true,turnRate:.9+phase*.12,life:4.4,wobble:.8});}
      }else if(this.mapIndex===2){
        const count=3+Math.min(3,phase);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.085;this.fireBossProjectile(b,base+off,275+phase*22,8+phase*2,'volt',meta.color,{r:4.5,life:3.2,trail:true});}
      }else if(this.mapIndex===3){
        const count=3+Math.min(2,phase);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.16;this.fireBossProjectile(b,base+off,215+phase*15,10+phase*2,'blade',meta.color,{r:8,life:4.0,spin:(i%2?1:-1)*(2.2+phase*.25)});}
      }else{
        const count=2+Math.min(2,phase);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.18;this.fireBossProjectile(b,base+off,145+phase*12,11+phase*2,'void',meta.color,{r:9.5,life:4.8,bossHoming:phase>=3,turnRate:.34});}if(phase>=2)this.fireBossProjectile(b,base,310+phase*14,10+phase*2,'lance',meta.accent,{r:5,life:3.1,trail:true});
      }
      return true;
    }

    boss2Special(b){
      if(this.mapIndex<0||this.mapIndex>4)return false;
      const p=this.player,meta=boss2Meta(this.mapIndex),phase=b.phase||1;
      this.toast(meta.intro,meta.special.toUpperCase());AudioFX.bossSpecial(this.mapIndex);
      if(this.mapIndex===0){
        this.spawnMeteorRain(2+Math.min(3,phase),true);const shots=5+phase;for(let i=0;i<shots;i++){if(i%4===0)continue;const a=(Math.PI*2/shots)*i+b.t;this.fireBossProjectile(b,a,175+phase*16,10+phase*2,'meteor',meta.color,{r:7.5,life:4.1,trail:true});}
      }else if(this.mapIndex===1){
        for(let i=0;i<3;i++){const a=(Math.PI*2/3)*i+.35;this.zones.push({x:clamp(p.x+Math.cos(a)*92,45,this.w-45),y:clamp(p.y+Math.sin(a)*72,45,this.h-45),r:32+phase*2,life:3.2,max:3.2,type:'slow'});}const count=5+phase;const base=Math.atan2(p.y-b.y,p.x-b.x);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.14;this.fireBossProjectile(b,base+off,145+phase*10,9+phase*2,'spore',meta.color,{r:7,bossHoming:true,turnRate:1.0,life:4.6,wobble:1});}
      }else if(this.mapIndex===2){
        if(this.worldThreeState)this.worldThreeState.speedBurst=Math.max(this.worldThreeState.speedBurst||0,5.2);const shots=10+phase*2;for(let i=0;i<shots;i++){if(i%5===0)continue;const a=(Math.PI*2/shots)*i+b.t*.4;this.fireBossProjectile(b,a,235+phase*20,9+phase*2,'volt',meta.color,{r:4.8,life:3.7,trail:true});}this.particles.push({type:'ring',x:b.x,y:b.y,r:20,maxR:150,life:.7,max:.7,color:meta.accent});
      }else if(this.mapIndex===3){
        this.particles.push({type:'ring',x:b.x,y:b.y,r:28,maxR:180,life:.8,max:.8,color:meta.color});const base=Math.atan2(p.y-b.y,p.x-b.x),count=5+phase;for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.19;this.fireBossProjectile(b,base+off,205+phase*14,11+phase*2,'blade',meta.color,{r:8.5,life:4.3,spin:(i%2?1:-1)*2.8});}if(phase>=3){this.fireBossProjectile(b,base-.7,260,13+phase*2,'lance',meta.accent,{r:5,life:3.5,trail:true});this.fireBossProjectile(b,base+.7,260,13+phase*2,'lance',meta.accent,{r:5,life:3.5,trail:true});}
      }else{
        this.zones.push({x:clamp(p.x+rand(38,-38),55,this.w-55),y:clamp(p.y+rand(34,-34),55,this.h-55),r:58+phase*5,life:3.4,max:3.4,type:'bossGravity',pull:24+phase*4});const shots=8+phase;for(let i=0;i<shots;i++){if(i%4===0)continue;const a=(Math.PI*2/shots)*i+b.t*.25;this.fireBossProjectile(b,a,130+phase*12,12+phase*2,'void',meta.color,{r:9.5,life:5,bossHoming:false});}const base=Math.atan2(p.y-b.y,p.x-b.x);this.fireBossProjectile(b,base,335+phase*15,14+phase*2,'lance',meta.accent,{r:5.5,life:3.2,trail:true});
      }
      if(phase>=2&&Math.random()<.45){const fams=b.minionFamilies||[];const fam=fams.length?pick(fams):null;if(fam)this.spawnEnemy(pick(fam),true);}
      b.specialCd=Math.max(this.mapIndex===4?5.2:4.8,(7.2-this.mapIndex*.28)-phase*.45)*(this.getDifficulty().bossCadence||1);
      return true;
    }

    triggerBossSpecial(b) {
      if(this.boss2Special(b))return;
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
      if(this.boss2Pattern(b)){b.attack=Math.max(this.mapIndex===4?1.45:1.32,(2.85-this.mapIndex*.18)-(b.phase||1)*.22)*(this.getDifficulty().bossCadence||1);return;}
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

    addEnemyBullet(x, y, angle, speed, damage, color, options={}) {
      const enemyCount = this.bullets.filter(b => b.enemy).length;
      if (enemyCount > Math.floor((this.maxBullets || 180) * .35)) return;
      this.bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: options.r || 5, damage, life: options.life || 3.2, enemy: true, type:'enemyBolt', color, shape:options.shape||'bolt', trail:!!options.trail, spin:options.spin||0, rot:angle, bossHoming:!!options.bossHoming, turnRate:options.turnRate||0, wobble:options.wobble||0, age:0 });
    }

    destroyHazard(m) {
      if (!m) return;
      const idx = this.meteors.indexOf(m);
      if (idx >= 0) this.meteors.splice(idx, 1);
      this.explode(m.x, m.y, m.r * (m.kind === 'planet' || m.kind === 'moon' ? 2.8 : 2.1), (m.dmg || 12) * .9);
      this.emit(m.x, m.y, m.kind === 'bomb' ? '#ff7b32' : '#ffd56a', 14, 120, .65);
      this.run.score += m.score || 12;
      this.run.spendableScore = (this.run.spendableScore || 0) + (m.score || 12);
      this.run.coins += m.coins || 4;
      this.player.xp += Math.max(6, Math.ceil((m.score || 12) * .4));
      if (Math.random() < .18) this.spawnPickup(m.x, m.y, 'coin', Math.max(4, Math.ceil((m.coins || 4) * .8)));
      if (Math.random() < .09) this.spawnPickup(m.x + rand(18,-18), m.y + rand(18,-18), 'xp', Math.max(6, Math.ceil((m.score || 12) * .35)));
      this.toast('☄️ Obstáculo destruido', `+${m.score || 12} puntos`);
    }

    updateBullets(dt) {
      const p = this.player;
      const cap = this.maxBullets || 220;
      if (this.bullets.length > cap) this.bullets.splice(0, this.bullets.length - cap);
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.life -= dt;b.age=(b.age||0)+dt;
        if(b.enemy&&b.bossHoming){const ang=Math.atan2(p.y-b.y,p.x-b.x),sp=Math.hypot(b.vx,b.vy)||160,targetVX=Math.cos(ang)*sp,targetVY=Math.sin(ang)*sp,k=Math.min(1,dt*(b.turnRate||.6));b.vx+=(targetVX-b.vx)*k;b.vy+=(targetVY-b.vy)*k;}
        if(b.enemy&&b.wobble){const ang=Math.atan2(b.vy,b.vx),sp=Math.hypot(b.vx,b.vy)||150,twist=Math.sin((b.age||0)*6.2)*(b.wobble||0)*.035;b.vx=Math.cos(ang+twist)*sp;b.vy=Math.sin(ang+twist)*sp;}
        if(b.enemy&&b.spin)b.rot=(b.rot||0)+b.spin*dt;
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
        const timeScale = b.enemy && this.isPowerActive('stasis') ? Math.max(.46,.58/this.getStagePowerScale()) : 1;
        b.x += b.vx * dt * timeScale;
        b.y += b.vy * dt * timeScale;
        if (b.enemy) {
          if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) {
            this.playerHit(b.damage);
            this.bullets.splice(i, 1);
            continue;
          }
        } else {
          if (this.meteors?.length) {
            for (const m of [...this.meteors]) {
              if (Math.hypot(b.x - m.x, b.y - m.y) < b.r + m.r) {
                m.hp = Math.max(0, (m.hp || 20) - b.damage * (b.type === 'torpedo' ? 1.35 : 1));
                this.emit(b.x, b.y, m.kind === 'bomb' ? '#ff7b32' : '#ffd56a', 3, 70, .22);
                b.pierce -= 1;
                if (m.hp <= 0) this.destroyHazard(m);
                if (b.pierce <= 0) break;
              }
            }
          }
          if (b.pierce > 0) for (const e of this.enemies) {
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
      if (e.boss && this.bossActive === e && (this.mapIndex === 0 || this.mapIndex === 1)) {
        const guardians=this.enemies.filter(o=>!o.boss).length;
        if(guardians>0){
          const per=this.mapIndex===0?.055:.045;
          const protection=clamp(1-guardians*per,this.mapIndex===0?.56:.62,.95);
          amount*=protection;
        }
      }
      if (e.boss && this.bossActive === e) {
        const baseCap=this.mapIndex===0?.0088:(this.mapIndex===1?.0115:.014);
        const phaseCap=this.mapIndex===0?.0018:(this.mapIndex===1?.0022:.0028);
        const cap=e.baseHp*(baseCap+(e.phase||1)*phaseCap);
        amount=Math.min(amount,cap);
      }
      if (e.boss && this.bossActive === e && (e.shield || 0) > 0 && (e.vulnerable || 0) <= 0) {
        const shieldFactor=this.mapIndex===0?.40:(this.mapIndex===1?.48:.58);
        e.shield=Math.max(0,e.shield-amount*shieldFactor);
        if (Math.random() < .5) this.emit(e.x, e.y, '#9fd4ff', 1, 34, .28);
        if (e.shield <= 0) {
          this.toast('🧨', 'Escudo roto');
          e.vulnerable = Math.max(this.mapIndex === 0 ? 2.0 : (this.mapIndex===1?2.2:2.4), (this.mapIndex === 0 ? 3.4 : (this.mapIndex===1?3.6:3.9)) - e.phase * .18);
        }
      } else {
        if (e.boss && this.bossActive === e) amount *= (e.vulnerable > 0 ? (this.mapIndex === 0 ? .72 : .82) : .55);
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
      const world2Only=new Set(['voidray','gravmine','disruptor','phantom','plasma']);
      const available=POWERS.filter(p => (this.powerLevels[p.id] || 0) < 5 && (this.mapIndex > 0 || !world2Only.has(p.id)));
      const preferred = this.selectRecommendedPower(available);
      const pow = preferred || pick(available);
      if (!pow) return;
      this.empowerPower(pow.id, { toastTitle: '⚡ Poder recogido' });
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
      this.toast('JEFE DESTRUIDO',e.name||'Entidad eliminada');
    }

    killEnemy(e, index) {
      this.enemies.splice(index, 1);
      this.emit(e.x, e.y, e.color, e.boss ? 28 : 8, e.boss ? 160 : 70, e.boss ? 1.2 : .55);
      AudioFX.death();
      this.run.kills += 1;
      { const diff=this.getDifficulty(); const gainedScore = Math.round((e.boss ? 650 + this.mapIndex * 100 : e.score) * (diff.score||1)); this.run.score += gainedScore; this.run.spendableScore = (this.run.spendableScore || 0) + gainedScore; }
      { const xpReward=(e.boss ? 110 : e.xp) + (e.boss ? 70 : e.xp) * .35; this.player.xp += xpReward * (this.getDifficulty().xp||1); }
      this.run.experience = (this.run.experience || 0) + Math.max(1, Math.round((e.boss ? 110 : e.xp) * 1.35 * (this.getDifficulty().xp||1)));
      this.run.coins += Math.ceil((e.boss ? (180 + this.mapIndex * 30) : e.coin * (this.mapIndex === 0 ? 1.55 : 1.2)) * (this.getDifficulty().coins||1));
      if(e.boss||Math.random()<.035)this.spawnPickup(e.x+rand(16,-16),e.y+rand(16,-16),'coin',e.boss?120:Math.ceil(e.coin*.9),e.boss?{bossLoot:true,rewardGlow:true}:{});
      if(e.boss||Math.random()<.025)this.spawnPickup(e.x,e.y,'xp',e.boss?42:Math.max(5,Math.ceil(e.xp*.65)),e.boss?{bossLoot:true,rewardGlow:true}:{});
      if (!e.boss) this.trackWorldKill(e);
      if (e.boss) {
        AudioFX.stopMusic();
        this.bossDeathExplosion(e);
        this.particles.push({ type:'ring', x:e.x, y:e.y, r:20, maxR:160, life:1.1, max:1.1, color:'#ffd56a' });
        this.spawnBossLootBurst(e);
        this.toast('PODER DEL JEFE','Recoge el poder, XP, monedas y una posible vida');
      } else {
        const roll = Math.random() / (this.getDifficulty().dropChance || 1);
        const starter = this.mapIndex === 0;
        const nexus = this.mapIndex === 1;
        if (starter && roll < .004 && this.wave >= 4) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'nuke', 1);
        else if (starter && roll < .020) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'power', 1);
        else if (starter && roll < .048) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'shield', 20);
        else if (starter && roll < .064) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'life', 16);
        else if (nexus && roll < .030) this.spawnWorldTwoTacticalPrize(pick(['afterburner','stasis','wingman']));
        else if (nexus && roll < .070) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'power', 1, {rewardGlow:true});
        else if (nexus && roll < .108) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'shield', 22, {rewardGlow:true,label:'SHIELD'});
        else if (nexus && roll < .140) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'life', 18, {rewardGlow:true,label:'REPARACIÓN'});
        else if (roll < .007 && this.wave >= 3) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'nuke', 1);
        else if (roll < .032) this.spawnPickup(e.x + rand(26,-26), e.y + rand(26,-26), 'power', 1);
        else if (roll < .060) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'shield', 18);
        else if (roll < .078) this.spawnPickup(e.x + rand(24,-24), e.y + rand(24,-24), 'life', 14);
      }
      if (e.behavior === 'splitter' && !e.mini) for (let i = 0; i < 2; i++) this.spawnEnemy('corredor', true);
      if (e.virus > 0) for (const other of this.enemies) if (other !== e && Math.hypot(other.x - e.x, other.y - e.y) < 130) other.virus = Math.max(other.virus || 0, 1.2);
      if (this.bossFight?.active && !e.boss) {
        this.bossFight.addsKilled = (this.bossFight.addsKilled || 0) + 1;
        this.bossFight.charge = Math.min(100, (this.bossFight.charge || 0) + (e.mini ? 22 : 14));
        if (this.bossActive) {
          const shieldBreak = this.mapIndex === 0 ? (e.bossEscort ? 34 : (e.mini ? 24 : 18)) : (this.mapIndex===1 ? (e.bossEscort?30:(e.mini?20:14)) : (e.mini ? 16 : 10));
          this.bossActive.shield = Math.max(0, (this.bossActive.shield || 0) - shieldBreak);
          if ((this.mapIndex===0||this.mapIndex===1||this.mapIndex===2)&&this.enemies.filter(o=>!o.boss).length===0) {
            this.bossActive.vulnerable = Math.max(this.bossActive.vulnerable || 0, 3.8);
            this.toast('PROTECCIÓN ANULADA','Ventana de ataque ampliada');
          }
          this.updateBossUi();
        }
      }
      if(e.boss){
        this.bossActive=null;this.bossFight={active:false,charge:0,minionTimer:0,phaseNotified:1,addsKilled:0};els.bossBar.classList.add('hidden');els.bossBar.classList.remove('vulnerable');this.run.bosses+=1;this.run.mapComplete=true;
        const prof=currentProfile();prof.relics=prof.relics||{};if(this.mapIndex===0)prof.relics.world1Core=true;
        this.bossLootPhase={active:true,elapsed:0,settle:.75,completed:false};this.enemies=[];this.bullets=this.bullets.filter(b=>!b.enemy);this.zones=[];
        this.toast('RECOGE EL BOTÍN','El resumen aparece cuando termines de recogerlo');
      }
      this.checkLevelUp();
    }

    spawnPickup(x, y, type, value, options = {}) {
      const meta = {
        coin: { icon: '◈', color: '#ffd56a', r: 6 },
        xp: { icon: '✦', color: '#83eaff', r: 5 },
        power: { icon: '⚡', color: '#c391ff', r: options.major ? 12 : (options.rewardGlow ? 11 : 9) },
        shield: { icon: '🛡️', color: '#9fd4ff', r: options.rewardGlow ? 10 : 8 },
        life: { icon: '✚', color: '#ff8b8b', r: options.rewardGlow ? 10 : 8 },
        nuke: { icon: '☢', color: '#ffd56a', r: 9 },
        combo: { icon: '⚡', color: '#ffcf5a', r: 13 },
        boost: { icon: '⬆', color: '#7df6d4', r: 12 }
      }[type] || { icon: '🎁', color: '#eafff8', r: 10 };
      if (type === 'power' && options.powerId) {
        const powerMeta = POWERS.find(pw => pw.id === options.powerId);
        if (powerMeta?.icon) meta.icon = powerMeta.icon;
        if (options.powerId === 'afterburner') meta.color = '#ffd56a';
        if (options.powerId === 'stasis') meta.color = '#83eaff';
        if (options.powerId === 'wingman') meta.color = '#9ac7ff';
      }
      if (type === 'combo' && options.comboId) {
        const comboMeta = FUSIONS.find(f => f.id === options.comboId);
        if (comboMeta?.icon) meta.icon = comboMeta.icon;
      }
      const limit = this.maxPickups || 34;
      if (this.pickups.length >= limit) this.pickups.splice(0, this.pickups.length - limit + 1);
      this.pickups.push({
        x: clamp(x, 24, Math.max(24, this.w - 24)),
        y: clamp(y, 24, Math.max(24, this.h - 24)),
        vx: options.major ? rand(18,-18) : rand(58, -58),
        vy: options.major ? rand(12,-12) : rand(58, -58),
        type, value,
        powerId: options.powerId || null,
        comboId: options.comboId || null,
        major: !!options.major,
        rewardGlow: !!options.rewardGlow,
        label: options.label || '',
        powerDuration: options.powerDuration || 0,
        reclaimPower: !!options.reclaimPower,
        recoveryDrop: !!options.recoveryDrop,
        bossLoot: !!options.bossLoot,
        hordeKit: !!options.hordeKit,
        tacticalPurchase: !!options.tacticalPurchase,
        boostValue: options.boostValue || 0,
        choiceGroup: options.choiceGroup || null,
        exclusiveChoice: !!options.exclusiveChoice,
        restoreLevel: options.restoreLevel || 0,
        icon: meta.icon,
        color: meta.color,
        r: meta.r,
        life: options.life || (options.bossLoot?28:(options.major?18:(options.rewardGlow?16:(state.settings.lowPerformance?9:12)))),
        maxLife: options.life || (options.bossLoot?28:(options.major?18:(options.rewardGlow?16:(state.settings.lowPerformance?9:12)))),
        autoDelay: options.autoDelay ?? (options.bossLoot?3.5:(options.major?1.7:((type==='power'||type==='combo')?.9:.8))),
        born: now() + Math.random() * 100
      });
    }

    updatePickups(dt) {
      const p = this.player;
      for (let i = this.pickups.length - 1; i >= 0; i--) {
        const item = this.pickups[i];
        item.life -= dt;
        item.autoDelay = Math.max(0, (item.autoDelay || 0) - dt);
        const d=Math.hypot(item.x-p.x,item.y-p.y);
        const activeMagnet=this.getPowerLevel('magnetism',true),magnetRange=p.magnet+activeMagnet*155;
        const manualPickup=!!(item.tacticalPurchase||item.recoveryDrop||item.hordeKit||item.exclusiveChoice);
        const forceAuto=manualPickup?false:(item.autoDelay<=0||d<magnetRange);
        if (forceAuto) {
          const pull = item.type === 'power' || item.type === 'nuke' ? 800 : 610;
          item.x += ((p.x-item.x)/(d||1))*(pull+magnetRange*1.2)*dt;
          item.y += ((p.y - item.y) / (d || 1)) * (pull + p.magnet * 1.2) * dt;
        } else {
          item.x += item.vx * dt; item.y += item.vy * dt; item.vx *= .975; item.vy *= .975;
        }
        item.x = clamp(item.x, 18, this.w - 18);
        item.y = clamp(item.y, 18, this.h - 18);
        const collectD = Math.hypot(item.x - p.x, item.y - p.y);
        if(item.life<=0&&manualPickup){const expiredIndex=this.pickups.indexOf(item);if(expiredIndex>=0)this.pickups.splice(expiredIndex,1);continue;}
        if (collectD < p.r + item.r + 12 || item.life <= 0) {
          if (item.type === 'coin') { this.run.coins += item.value; AudioFX.pickup(); }
          if (item.type === 'xp') { p.xp += item.value * .35; this.run.experience = (this.run.experience || 0) + Math.round(item.value); AudioFX.pickup(); }
          if (item.type === 'shield') { p.shield = Math.min(p.maxShield, p.shield + item.value); AudioFX.pickup(); }
          if (item.type === 'life') { p.hp = Math.min(p.maxHp, p.hp + item.value); AudioFX.pickup(); }
          if (item.type === 'power') {
            if (item.powerId) {
              if (item.reclaimPower) {
                this.powerLevels[item.powerId] = Math.max(this.powerLevels?.[item.powerId] || 0, item.restoreLevel || 1);
                this.empowerPower(item.powerId, { skipLevelGain: true, toastTitle: '♻ Poder recuperado', duration: item.powerDuration || 0 });
              } else this.empowerPower(item.powerId, { toastTitle: item.major ? '✦ Poder adquirido' : 'Poder activado', duration: item.powerDuration || 0 });
            } else this.applyScreenPowerPickup();
            AudioFX.level();
          }
          if (item.type === 'combo') { const dur=item.powerDuration||8; this.activateRecoveryCombo(item.comboId,dur); if(item.tacticalPurchase){this.tacticalComboLockUntil=now()+dur*1000;this.tacticalComboLockedId=item.comboId||null;} AudioFX.level(); }
          if (item.type === 'boost') { this.applyTacticalPowerBoost(item.boostValue || .08); AudioFX.level(); }
          if (item.type === 'nuke') { this.triggerScreenNuke(); AudioFX.level(); }
          if(item.exclusiveChoice&&item.choiceGroup){
            const group=item.choiceGroup;
            this.pickups=this.pickups.filter((other,idx)=>idx===i||other.choiceGroup!==group);
            i=Math.min(i,this.pickups.length-1);
          }
          this.emit(p.x, p.y, item.color, 6, 52, .34);
          const wasTactical = !!item.tacticalPurchase;
          const currentIndex=this.pickups.indexOf(item);if(currentIndex>=0)this.pickups.splice(currentIndex,1);
          if (wasTactical && !this.pickups.some(pk => pk.tacticalPurchase)) { this.tacticalDeliveryDelay=item.type==='combo'?0:1.15; this.updateTacticalCart(false); }
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
            const storm=this.comboActive('tormenta');
            const dmg = this.player.damage * (this.comboActive('resonante') ? .92 : (storm?.78:.62)) * (d.damageScale || 1);
            const inherited = d.inheritPower ? (this.activePowerSlots?.weaponMode || null) : null;
            if (inherited === 'laser' && this.isPowerActive('laser')) {
              this.fireLaserFrom(d.x, d.y, a, dmg * .72, d.color || '#9fd4ff');
            } else if (inherited === 'voidray' && this.isPowerActive('voidray')) {
              this.fireLaserFrom(d.x, d.y, a, dmg * .86, '#c391ff');
            } else if (inherited === 'triple' && this.isPowerActive('triple')) {
              [-.14, 0, .14].forEach(off => this.addBullet(d.x, d.y, a + off, 620 * (this.player.projectileSpeedBonus || 1), dmg * .72, { color: d.color || '#9fd4ff', pierce: 1, homing: true, glow: this.player.shotTier || 0 }));
            } else {
              this.addBullet(d.x, d.y, a, (d.support ? 620 : 520) * (this.player.projectileSpeedBonus || 1), dmg, { color: d.color || '#9fd4ff', pierce: this.comboActive('resonante') ? 2 : 1, homing: !!d.support, glow: this.player.shotTier || 0 });
              if (d.support) this.addBullet(d.x, d.y, a + .1, 610 * (this.player.projectileSpeedBonus || 1), dmg * .75, { color: d.color || '#ffd56a', pierce: 1, glow: this.player.shotTier || 0 });
            }
            if (this.comboActive('resonante') && Math.random() < .25) this.particles.push({ type: 'ring', x: d.x, y: d.y, r: 8, maxR: 70, life: .22, max: .22, color: d.color || '#9ac7ff' });
            if(storm&&this.enemies.length>1){const second=this.enemies.find(e=>e!==target);if(second){this.damageEnemy(second,dmg*.42,{color:'#93ff8b',slow:.12});this.particles.push({type:'laser',x:target.x,y:target.y,a:Math.atan2(second.y-target.y,second.x-target.x),life:.08,max:.08,range:Math.hypot(second.x-target.x,second.y-target.y),color:'#93ff8b'});}}
            d.fire = d.support ? (storm?.18:.24) : (this.comboActive('resonante') ? .32 : (storm?.30:.48));
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
          if (z.type === 'slow') { /* ralentización temporal calculada en handleMovement; nunca degrada speed */ }
          if(z.type==='bossGravity'){const dd=Math.max(1,d),pull=(z.pull||28)*dt;this.player.x+=(z.x-this.player.x)/dd*pull;this.player.y+=(z.y-this.player.y)/dd*pull;}
        }
        if (z.type === 'gravityMine') {
          for (const e of this.enemies) {
            const ed=Math.hypot(z.x-e.x,z.y-e.y)||1;
            if (ed<z.r+e.r) {
              e.x += ((z.x-e.x)/ed)*22*dt;
              e.y += ((z.y-e.y)/ed)*22*dt;
              e.slow=Math.max(e.slow||0,.35);
              this.damageEnemy(e,(z.damage||5)*dt,{silent:true,color:'#c391ff'});
            }
          }
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
      if (p.entryShieldTimer > 0) mod *= .38;
      if (this.isPowerActive('phase')) mod *= Math.max(.22,.34/this.getStagePowerScale())*(this.comboActive('hiperfase')?.72:1);
      if (this.comboActive('bastion')) mod *= .82;
      amount *= mod * (this.getDifficulty().incomingDamage || 1);
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
      if (this.mapIndex < 5) return;
      const targetDuration = this.mapIndex === 0 ? this.getWorldOneWaveDuration(this.wave) : (this.mapIndex === 1 ? this.getWorldTwoWaveDuration(this.wave) : 24);
      if (this.waveTime < targetDuration) return;
      this.waveTime = 0;
      this.wave += 1;
      currentProfile().stats.highestWave = Math.max(currentProfile().stats.highestWave, this.wave);
      if (this.mapIndex === 0 && this.wave <= WORLD_ONE_CONFIG.bossWave - 1) this.spawnWorldOneReward();
      if (this.mapIndex === 1 && this.wave <= WORLD_TWO_CONFIG.bossWave - 1) this.spawnWorldTwoReward();
      const bossWave = this.mapIndex === 0 ? WORLD_ONE_CONFIG.bossWave : (this.mapIndex === 1 ? WORLD_TWO_CONFIG.bossWave : 5);
      if (this.wave >= bossWave && !this.bossIntroduced) this.spawnBoss();
      else {
        const title = this.mapIndex === 0 ? '🌌 Oleada' : (this.mapIndex === 1 ? '🧫 Sector bacteriano' : 'Oleada superada');
        const subtitle = this.mapIndex === 0 ? `Sector ${this.wave}/${WORLD_ONE_CONFIG.bossWave}` : (this.mapIndex === 1 ? `Sector ${this.wave}/${WORLD_TWO_CONFIG.bossWave}` : `Oleada ${this.wave}`);
        this.toast(title, subtitle);
      }
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
        if (this.mapIndex === 0) {
          // En Mundo 1 la experiencia mejora la nave base sin llenar la pantalla de cartas.
          p.damage *= 1.018;
          p.fireDelay = Math.max(235, p.fireDelay * .988);
          p.projectileSpeedBonus *= 1.006;
          p.speed *= 1.0035;
          p.baseSpeed = Math.max(p.baseSpeed || 0, p.speed);
          p.nominalSpeed = Math.max(p.nominalSpeed || 0, p.baseSpeed, p.speed);
          if (p.level % 3 === 0) {
            p.maxShield += 2;
            p.shield = Math.min(p.maxShield, p.shield + 5);
          }
        } else if (this.mapIndex === 1) {
          // Mundo 2 mantiene los poderes como núcleos de acto; la XP refina la nave.
          p.damage *= 1.016;
          p.fireDelay = Math.max(225, p.fireDelay * .989);
          p.projectileSpeedBonus *= 1.007;
          p.aimAssist = Math.min(.18, (p.aimAssist || 0) + .0025);
          if (p.level % 3 === 0) { p.maxShield += 2.5; p.shield = Math.min(p.maxShield, p.shield + 6); }
        } else this.spawnLevelUpSpaceChoice();
      }
      this.updatePendingBadge();
    }

    getActiveComboPartnerCandidates() {
      const ids=[];
      for(const f of FUSIONS){
        const active=f.requires.filter(id=>this.isPowerActive(id));
        if(active.length===f.requires.length-1){
          const missing=f.requires.find(id=>!this.isPowerActive(id));
          if(missing&&!ids.includes(missing))ids.push(missing);
        }
      }
      return ids.map(id=>POWERS.find(p=>p.id===id)).filter(Boolean);
    }

    spawnLevelUpSpaceChoice() {
      if (!this.player || this.run?.mapComplete) return;
      const choices=this.generateCards();
      if(!choices?.length)return;
      const group=`lvl_${this.mapIndex}_${this.wave}_${this.player.level}_${Date.now()}_${Math.floor(Math.random()*999)}`;
      const p=this.player;
      const radius=this.isSmallScreen?86:118;
      const angles=[-Math.PI*.82,-Math.PI*.5,-Math.PI*.18];
      choices.slice(0,3).forEach((card,i)=>{
        const a=angles[i]??(-Math.PI*.5+i*.35);
        this.spawnPickup(
          clamp(p.x+Math.cos(a)*radius,42,this.w-42),
          clamp(p.y+Math.sin(a)*radius,50,this.h-50),
          'power',1,
          {powerId:card.id,major:true,rewardGlow:true,label:`NIVEL ${p.level} · ${card.name.toUpperCase()}`,powerDuration:POWER_ACTIVE_SECONDS[card.id]||10,choiceGroup:group,exclusiveChoice:true,life:22,autoDelay:999}
        );
      });
      this.toast('✦ MEJORA EN EL ESPACIO','Recoge una de las 3 cápsulas · sin pausar la misión');
      this.offerActive=false;this.currentOfferChoices=[];this.offerAutoAt=0;this.pendingLevelChoices=0;
      els.cardOverlay?.classList.add('hidden');this.updatePendingBadge();
    }

    showCards() {
      // Compatibilidad con llamadas antiguas: la selección ahora se hace moviendo la nave.
      this.spawnLevelUpSpaceChoice();
    }

    generateCards() {
      const pool = POWERS.filter(p => !['nuke','pulse'].includes(p.id) || this.wave >= 3 || this.mapIndex > 0);
      const cards = [];
      const partner=this.getActiveComboPartnerCandidates?.()[0];
      if(partner){cards.push(partner);const pi=pool.findIndex(p=>p.id===partner.id);if(pi>=0)pool.splice(pi,1);}
      const guaranteeWeapon = (this.mapIndex === 0 || this.player.level <= 5) && cards.length===0;
      if (guaranteeWeapon) {
        const candidate = WEAPON_POWER_IDS
          .map(id => POWERS.find(p => p.id === id))
          .filter(Boolean)
          .sort((a, b) => (this.powerLevels[a.id] || 0) - (this.powerLevels[b.id] || 0))[0];
        if (candidate) {
          cards.push(candidate);
          const idx = pool.findIndex(p => p.id === candidate.id);
          if (idx >= 0) pool.splice(idx, 1);
        }
      }
      while (cards.length < 2 && pool.length) {
        const idx = Math.floor(Math.random() * pool.length);
        const card = pool.splice(idx, 1)[0];
        const lvl = this.powerLevels[card.id] || 0;
        const weight = card.rarity === 'legendary' ? .45 : card.rarity === 'epic' ? .7 : 1;
        if (lvl < 5 && Math.random() < weight + .2) cards.push(card);
      }
      while (cards.length < 3) {
        const next = pick(POWERS.filter(p => !cards.some(card => card.id === p.id)));
        cards.push(next || pick(POWERS));
      }
      return cards;
    }

    empowerPower(id, options = {}) {
      const pow = POWERS.find(p => p.id === id);
      if (!pow) return null;
      this.recentPowerHistory=this.recentPowerHistory||[];
      this.recentPowerHistory=[...this.recentPowerHistory.filter(x=>x!==id),id].slice(-10);
      if (options.skipLevelGain) this.powerLevels[id] = Math.max(1, this.powerLevels[id] || 0);
      else this.powerLevels[id] = (this.powerLevels[id] || 0) + 1;
      const activationState=this.markPowerActive(id, options.duration || POWER_ACTIVE_SECONDS[id] || 8);
      if(activationState!=='queued')this.activatePowerSlot(id);
      currentProfile().collection.powers[id] = true;
      if (id === 'drone') this.spawnDrone(options.droneLife || (10 + (this.powerLevels.drone || 0) * 2), false, options.droneOptions || {});
      if (id === 'spark') { this.player.sparkTimer = Math.min(20, this.player.sparkTimer + 10); this.player.sparkTick = 0; }
      if (id === 'kamikaze') this.player.kamiTimer = .4;
      if (id === 'torpedo') this.player.torpedoTimer = .2;
      if (id === 'nuke') this.player.nukeTimer = Math.min(this.player.nukeTimer, 6);
      if (id === 'opem') this.player.opemTimer = Math.min(this.player.opemTimer, 1.4);
      if (id === 'gravmine') this.player.gravMineTimer = Math.min(this.player.gravMineTimer || 1, .45);
      if (id === 'disruptor') this.player.disruptorTimer = Math.min(this.player.disruptorTimer || 1, .55);
      if (id === 'plasma') this.player.plasmaTimer = Math.min(this.player.plasmaTimer || 1, .2);
      if (id === 'phantom') this.spawnDrone(options.droneLife || (13 + (this.powerLevels.phantom || 0)), false, { support:true, inheritPower:true, count:Math.min(4,2 + Math.floor((this.powerLevels.phantom || 1)/2)), radius:142, fireRate:.19, damageScale:.82, color:'#c391ff' });
      if (id === 'wingman') {
        const active = this.drones.filter(d => d.kind === 'wingman');
        if (active.length < 2) this.spawnDrone(12*this.getStagePowerScale(),false,{count:1,kind:'wingman',support:true,inheritPower:true,radius:118 + active.length*25,fireRate:.2,damageScale:.9*this.getStagePowerScale(),color:'#83eaff'});
        else {
          active.sort((a,b)=>a.life-b.life)[0].life = 12;
          this.toast('🛸 Escolta completa','2 naves auxiliares · duración renovada');
        }
      }
      this.checkFusions();
      if (options.toastTitle !== false) this.toast(options.toastTitle || 'Poder activado', pow.name);
      saveState();
      this.updateHud();
      return pow;
    }

    applyPower(id, autoChosen = false) {
      const pow = this.empowerPower(id, { toastTitle: autoChosen ? 'Autoactivado' : 'Poder activado' });
      if (!pow) return;
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
      const count = options.count || (1 + Math.floor((this.powerLevels.drone || 0) / 2) + (this.comboActive('resonante') ? 1 : 0));
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
          damageScale: options.damageScale || 1,
          inheritPower: !!options.inheritPower,
          kind: options.kind || 'drone'
        });
      }
    }

    grantWorldCompletionProgress() {
      const p = currentProfile();
      p.worldProgression = { shotTier: 0, projectileSpeedTier: 0, accuracyTier: 0, mobilityTier: 0, rangeTier: 0, bossPowers: {}, ...(p.worldProgression || {}) };
      p.worldProgression.bossPowers = p.worldProgression.bossPowers || {};
      const worldNo = this.mapIndex + 1;
      const firstClear = !(p.completedMaps || []).includes(worldNo);
      if (firstClear) {
        p.worldProgression.shotTier = Math.min(5, (p.worldProgression.shotTier || 0) + 1);
        p.worldProgression.projectileSpeedTier = Math.min(5, (p.worldProgression.projectileSpeedTier || 0) + 1);
        p.worldProgression.accuracyTier = Math.min(5, (p.worldProgression.accuracyTier || 0) + 1);
        p.worldProgression.mobilityTier = Math.min(5, (p.worldProgression.mobilityTier || 0) + 1);
        p.worldProgression.rangeTier = Math.min(5, (p.worldProgression.rangeTier || 0) + 1);
        p.shipParts = { core:0,wings:0,cannon:0,engine:0,...(p.shipParts||{}) };
        const evolutionOrder=['cannon','core','engine','wings','core'];
        const part=evolutionOrder[this.mapIndex]||'core';
        p.shipParts[part]=Math.min(6,(p.shipParts[part]||0)+(this.mapIndex===4?2:1));
        p.morphTier=Math.min(6,1+(p.completedMaps||[]).length+1);
      }
      const rewards = [
        { id:'world1Core', name:'Núcleo Meteórico', desc:'Se hereda: refuerza el escudo y convoca impactos meteóricos automáticos.' },
        { id:'world2Spore', name:'Matriz de Convergencia', desc:'Poder del Patriarca que acompañará al Mundo 3.' },
        { id:'world3Inferno', name:'Corazón Ígneo', desc:'Potencia ofensiva del siguiente mundo.' },
        { id:'world4Hex', name:'Sello Astral', desc:'Mejora de precisión y defensa.' },
        { id:'world5Spirit', name:'Fragmento del Vacío', desc:'Recompensa final de esta campaña.' }
      ];
      const reward = rewards[this.mapIndex] || rewards[0];
      p.relics = p.relics || {};
      p.relics[reward.id] = true;
      p.worldProgression.bossPowers[reward.id] = true;
      return { ...reward, firstClear };
    }


    updateBossLootPhase(dt){
      const phase=this.bossLootPhase;if(!phase?.active||phase.completed)return;phase.elapsed=(phase.elapsed||0)+dt;
      const remaining=this.pickups.filter(p=>p.bossLoot).length;
      if(remaining===0&&phase.elapsed>(phase.settle||.75)){phase.completed=true;phase.active=false;this.completeMap();}
    }

    unlockBossShip(){
      const p=currentProfile();p.bossShips=p.bossShips||{};const map=MAPS[this.mapIndex],id=`bossShip${this.mapIndex+1}`;
      p.bossShips[id]={id,name:map?.boss||`Jefe ${this.mapIndex+1}`,world:this.mapIndex+1,unlockedAt:new Date().toISOString()};if(!p.activeBossShip)p.activeBossShip=id;return p.bossShips[id];
    }

    showRelicAcquired(reward){
      if(!els.relicOverlay||!reward)return;const meta=boss2Meta(this.mapIndex);els.relicSigil.innerHTML=bossSigilHtml(this.mapIndex,'boss-sigil');els.relicName.textContent=reward.name||meta.short;els.relicDesc.textContent=reward.desc||`${meta.weapon} · ${meta.special}`;els.relicOverlay.style.setProperty('--relic-color',meta.color);els.relicOverlay.classList.remove('hidden');clearTimeout(this.relicOverlayTimeout);AudioFX.chord([meta.music.root*2,meta.music.root*2.5,meta.music.root*3],.18,.065);this.relicOverlayTimeout=setTimeout(()=>els.relicOverlay?.classList.add('hidden'),1350);
    }

    completeMap() {
      if (this.replayMode?.active) { this.run.mapComplete = false; this.toast('JEFE REPETIDO',`Mundo ${this.mapIndex+1} · Nivel 5 completado`); setTimeout(() => this.showResult(true), 1200); return; }
      const p = currentProfile();
      p.stats.bosses += 1;
      p.stats.bestMap = Math.max(p.stats.bestMap, this.mapIndex + 1);
      const progressionReward=this.grantWorldCompletionProgress();
      const bossShip=this.unlockBossShip();
      this.lastWorldLifeBonus = progressionReward.firstClear ? this.addReserveLives(2, 'bono por pasar de mundo') : 0;
      p.campaignExtraLives = this.extraLives;
      p.completedMaps = Array.from(new Set([...(p.completedMaps || []), this.mapIndex + 1]));
      p.levelProgress = p.levelProgress || {1:1}; p.levelProgress[this.mapIndex + 1] = 5; p.levelProgress[this.mapIndex + 2] = Math.max(p.levelProgress[this.mapIndex + 2] || 0, this.mapIndex + 1 < MAPS.length ? 1 : 0);
      p.unlockedMap = Math.max(p.unlockedMap, Math.min(MAPS.length, this.mapIndex + 2));
      p.collection.bosses[MAPS[this.mapIndex].boss] = true;
      this.lastWorldReward = progressionReward;
      this.showRelicAcquired(progressionReward);
      const mapBonus = 140 + this.mapIndex * 25;
      p.coins += mapBonus;
      p.stats.totalCoins += mapBonus;
      unlockAchievement('boss_1');
      if (p.unlockedMap >= 3) unlockAchievement('map_3');
      this.toast('MUNDO COMPLETADO',`${this.lastWorldReward?.name||'Poder del jefe'} · nave-jefe ${bossShip?.name||'desbloqueada'} disponible desde Mundo 4`);
      AudioFX.win();setTimeout(()=>this.showResult(true),1550);
    }

    end(victory) {
      this.running = false;
      AudioFX.stopMusic();
      if (!victory) {
        this.dropActivePowersOnDefeat();
        AudioFX.lose();
      }
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
      if (!this.replayMode?.active) p.lastSave = null;
      saveState();
    }

    getLifeCosts() {
      const n=this.run?.lifePurchases||0;
      const scale=1+n*.35;
      return { coins:Math.round(150*scale), score:Math.round(1000*scale), xp:Math.round(180*scale) };
    }

    availableCoinsForLife() {
      return (this.run?.coins||0)+(currentProfile().coins||0);
    }

    updateLifeShopUI() {
      if(!els.lifeShop)return;
      const costs=this.getLifeCosts();
      if(els.lifeCostCoins)els.lifeCostCoins.textContent=costs.coins;
      if(els.lifeCostScore)els.lifeCostScore.textContent=costs.score;
      if(els.lifeCostXp)els.lifeCostXp.textContent=costs.xp;
      if(els.btnBuyLifeCoins){els.btnBuyLifeCoins.disabled=this.availableCoinsForLife()<costs.coins;els.btnBuyLifeCoins.title=`Requisito: ${costs.coins} · disponibles ${this.availableCoinsForLife()} · no se descuentan`;}
      if(els.btnBuyLifeScore){els.btnBuyLifeScore.disabled=(this.run?.score||0)<costs.score;els.btnBuyLifeScore.title=`Requisito: ${costs.score} · disponibles ${Math.round(this.run?.score||0)} · no se descuentan`;}
      if(els.btnBuyLifeXp){els.btnBuyLifeXp.disabled=(this.run?.experience||0)<costs.xp;els.btnBuyLifeXp.title=`Requisito: ${costs.xp} · disponibles ${Math.round(this.run?.experience||0)} · no se descuentan`; }
    }

    buyLife(currency) {
      if(this.extraLives>0 || this.resultMode!=='defeat')return false;
      if(this.getTotalLives() >= MAX_TOTAL_LIVES) return false;
      const costs=this.getLifeCosts();
      const cost=costs[currency];
      if(!cost)return false;
      if(currency==='coins' && this.availableCoinsForLife()<cost)return false;
      if(currency==='score' && (this.run.score||0)<cost)return false;
      if(currency==='xp' && (this.run.experience||0)<cost)return false;
      // Monedas, puntos y experiencia funcionan como requisito de acceso: no se descuentan.
      this.run.lifePurchases=(this.run.lifePurchases||0)+1;
      this.extraLives=Math.min(MAX_TOTAL_LIVES-1,1);
      saveState();
      const resourceName=currency==='coins'?'monedas':currency==='score'?'puntos':'experiencia';
      this.toast('❤️ Vida habilitada',`${resourceName}: requisito cumplido · saldo conservado`);
      const revived=this.reviveRun();
      if(revived)this.grantPurchasedLifePower();
      return revived;
    }

    reviveRun() {
      if (this.extraLives <= 0) return false;
      this.extraLives -= 1;
      if (!this.replayMode?.active) currentProfile().campaignExtraLives = this.extraLives;
      const p = this.player;
      p.hp = p.maxHp * .62;
      p.shield = p.maxShield * .62;
      const restoredSpeed=Math.max(p.nominalSpeed||0,p.baseSpeed||0,p.speed||0,255);
      p.speed=restoredSpeed;p.baseSpeed=restoredSpeed;p.nominalSpeed=restoredSpeed;
      p.recoverySpeedTimer=12;
      p.moveVx = 0; p.moveVy = 0;
      p.entryShieldTimer = Math.max(p.entryShieldTimer || 0, 5.2);
      p.entryShieldMax = Math.max(p.entryShieldMax || 0, 5.2);
      p.recoveryGraceTimer = 5.2;
      this.enemies = this.enemies.filter(e => e.boss);
      this.bullets = this.bullets.filter(b => !b.enemy);
      this.zones = [];
      this.flash = .8;
      this.defeatPowerDropsIssued = false;
      this.paused = false;
      this.running = true;
      hideOverlays();
      this.spawnRecoveryPackage();
      this.toast('❤️ REACTIVACIÓN', `Velocidad restaurada +12s de impulso de recuperación · recoge tus poderes`);
      this.requestTacticalPrep('revive');
      AudioFX.music(this.mapIndex, !!this.bossActive, MAPS[this.mapIndex]?.family || 'zombie', this.bossActive?.phase || 1);
      requestAnimationFrame(t => { this.last = t; this.loop(t); });
      return true;
    }

    showResult(victory) {
      this.paused = true;
      const replayVictory = !!(victory && this.replayMode?.active);
      this.resultMode = replayVictory ? 'replay_victory' : (victory ? 'victory' : (this.extraLives > 0 ? 'defeat_revive' : 'defeat'));
      if (victory) this.finalizeRun(true);
      els.resultOverlay.classList.toggle('victory-clean',!!victory&&!replayVictory);
      els.resultEyebrow.textContent = replayVictory ? '↻ NIVEL REPETIDO' : (victory ? '✔ MUNDO COMPLETADO' : '⚠ MISIÓN INTERRUMPIDA');
      if(victory&&!replayVictory)els.resultTitle.innerHTML=`${bossSigilHtml(this.mapIndex,'result-boss-sigil')}<span>Mundo ${this.mapIndex+1} superado</span>`;else els.resultTitle.textContent=replayVictory?`Mundo ${this.mapIndex+1} · Nivel ${this.replayMode.level} completado`:`Mundo ${this.mapIndex+1} · Nivel ${this.wave}`;
      if (replayVictory) {
        els.resultText.textContent = 'La repetición terminó. Tu progreso principal y tu partida guardada permanecen intactos.';
      } else if (victory) {
        const reward = this.lastWorldReward || { name: 'Poder del jefe' };
        const loot=this.lastBossLootPower?.name?` Botín del jefe: ${this.lastBossLootPower.name}.`:'';
        els.resultText.textContent = `${reward.name} obtenido · arma base mejorada de forma permanente en daño, alcance, velocidad y precisión · +${this.lastWorldLifeBonus || 0} vidas.${loot}`;
      } else {
        els.resultText.textContent = this.extraLives > 0
          ? `Te quedan ${this.extraLives} vidas de reserva. Conservas Mundo ${this.mapIndex + 1}, Nivel ${this.wave}. Al reactivar aparecen tus últimos poderes, un Impulsor y un combo de recuperación de 5 segundos.`
          : `Compra una vida con monedas, puntos o experiencia para continuar. Al reactivar reaparecen tus últimos poderes, un Impulsor y un combo de recuperación de 5 segundos.`;
      }
      els.resultRewards.innerHTML = `
        <span class="reward-pill">⭐ ${Math.round(this.run.score)}</span>
        <span class="reward-pill">🪙 ${Math.round(this.run.coins)}</span>
        <span class="reward-pill">✦ ${Math.round(this.run.experience || 0)} XP</span>
        <span class="reward-pill">🎯 ${this.run.kills}</span>
        <span class="reward-pill">${this.isHardMode()?'⚔️ Difícil':'◉ Normal'}</span>
        <span class="reward-pill">M${this.mapIndex + 1} · L${this.wave}</span>
        <span class="reward-pill">❤️ ${this.extraLives + 1}</span>`;
      els.btnResultContinue.textContent = replayVictory ? 'Volver a niveles' : (victory ? (this.mapIndex + 1 < MAPS.length ? 'Siguiente mundo' : 'Finalizar') : 'Reactivar nave');
      const noLives=!victory && this.extraLives<=0;
      els.btnResultContinue.classList.toggle('hidden',noLives);
      if(els.lifeShop)els.lifeShop.classList.toggle('hidden',!noLives);
      if(noLives)this.updateLifeShopUI();
      els.btnResultHome.textContent='Inicio';els.btnResultHome.classList.toggle('hidden',!!victory&&!replayVictory);
      els.resultOverlay.classList.remove('hidden');
      renderAll();
    }

    finishReplayLevel() {
      if (!this.replayMode?.active || !this.running) return;
      this.running = false;
      AudioFX.stopMusic();
      AudioFX.win();
      this.toast('↻ Nivel repetido', `Mundo ${this.mapIndex + 1} · Nivel ${this.replayMode.level}`);
      this.showResult(true);
    }

    startReplay(mapIndex, level) {
      const p = currentProfile();
      const worldNo = mapIndex + 1;
      const reachedLevel = Math.max(1, p.levelProgress?.[worldNo] || 1);
      const maxLevel = p.completedMaps?.includes(worldNo) ? 5 : Math.max(0, reachedLevel - 1);
      level = clamp(Number(level) || 1, 1, 5);
      if (worldNo > (p.unlockedMap || 1) || level > maxLevel) return;
      const replaySave = {
        mapIndex,
        wave: level,
        worldStage: { level, kills: 0, targets: WORLD_STAGE_TARGETS[mapIndex] || [20,30,40,50,60], totalLevels: 5, bossLevel: 5 },
        powerLevels: {}, powerActivity: {}, activePowerSlots: { weaponMode: null }, fusions: {},
        run: { score:0, coins:0, experience:0, kills:0, bosses:0, start:Date.now(), mapComplete:false, lifePurchases:0 },
        extraLives: 4, nextLifeScore: 2500,
        replayMode: { active:true, mapIndex, level }
      };
      this.start(mapIndex, replaySave);
      if (mapIndex===0) { this.worldOneState.actSeen=level; this.worldOneState.eventTimer=4.2; }
      if (mapIndex===1) { this.worldTwoState.actSeen=level; this.worldTwoState.eventTimer=3.8; }
      this.grantLevelShield(8.5);
      const replayPower = mapIndex===0 ? (level===1?'triple':WORLD_ONE_CONFIG.rewardPowers[Math.max(0,Math.min(3,level-2))]) : (mapIndex===1 ? (level===1?'voidray':WORLD_TWO_CONFIG.rewardPowers[Math.max(0,Math.min(3,level-2))]) : null);
      if (replayPower) {
        const pow=POWERS.find(x=>x.id===replayPower);
        this.spawnPickup(this.player.x+58,clamp(this.player.y-92,64,this.h-64),'power',1,{powerId:replayPower,major:true,label:pow?.name||'Poder de repetición',powerDuration:POWER_ACTIVE_SECONDS[replayPower]||12});
      }
      if (mapIndex===1) { this.spawnOrbitalWreck(1,true); if(level>=2)this.spawnMeteor(1,true); }
      this.toast('↻ MODO REPETICIÓN', `Mundo ${worldNo} · Nivel ${level}`);
    }

    retryCurrentLevel() {
      const stageLevel = Math.max(1, this.worldStage?.level || this.wave || 1);
      const retrySave = {
        mapIndex: this.mapIndex,
        wave: stageLevel,
        worldStage: { ...(this.worldStage || {}), level: stageLevel, kills: 0 },
        powerLevels: { ...(this.powerLevels || {}) },
        powerActivity: {},
        activePowerSlots: { weaponMode: null },
        fusions: { ...(this.fusions || {}) },
        run: { ...(this.run || {}), mapComplete: false },
        worldOneState: this.mapIndex===0 ? { ...(this.worldOneState||{}) } : null,
        worldTwoState:this.mapIndex===1?{...(this.worldTwoState||{})}:null,
        worldThreeState:this.mapIndex===2?{...(this.worldThreeState||{})}:null,
        worldFourState:this.mapIndex===3?{...(this.worldFourState||{})}:null,
        worldFiveState:this.mapIndex===4?{...(this.worldFiveState||{})}:null,
        powerQueue:[...(this.powerQueue||[])],
        recentPowerHistory:[...(this.recentPowerHistory||[])],
        extraLives: this.extraLives,
        nextLifeScore: this.nextLifeScore
      };
      hideOverlays();
      this.start(this.mapIndex, retrySave);
      this.player.entryShieldTimer = Math.max(this.player.entryShieldTimer || 0, 5.5);
      this.toast('↻ Nivel reintentado', `Mundo ${this.mapIndex + 1} · Nivel ${stageLevel}`);
    }


    saveRun() {
      if (this.replayMode?.active) { this.toast('↻ Repetición', 'No sustituye la partida principal'); return; }
      const p = currentProfile();
      p.campaignExtraLives = this.extraLives;
      p.lastSave = {
        savedAt: new Date().toISOString(),
        mapIndex: this.mapIndex,
        difficulty: this.difficulty || 'normal',
        wave: this.wave,
        player: { x: this.player.x, y: this.player.y, hp: this.player.hp, shield: this.player.shield, xp: this.player.xp, level: this.player.level, xpNext: this.player.xpNext, entryShieldTimer: this.player.entryShieldTimer || 0, entryShieldMax: this.player.entryShieldMax || 0, relicMeteorTimer: this.player.relicMeteorTimer || 0 },
        powerLevels: this.powerLevels,
        powerActivity: this.powerActivity,
        activePowerSlots:this.activePowerSlots,
        powerQueue:this.powerQueue||[],
        recentPowerHistory:this.recentPowerHistory||[],
        fusions:this.fusions,
        run: this.run,
        worldStage: this.worldStage,
        worldOneState: this.mapIndex === 0 ? this.worldOneState : null,
        worldTwoState:this.mapIndex===1?this.worldTwoState:null,
        worldThreeState:this.mapIndex===2?this.worldThreeState:null,
        worldFourState:this.mapIndex===3?this.worldFourState:null,
        worldFiveState:this.mapIndex===4?this.worldFiveState:null,
        extraLives: this.extraLives,
        nextLifeScore: this.nextLifeScore
      };
      saveState();
      this.toast('Partida guardada', `${MAPS[this.mapIndex].name} · mundo ${this.mapIndex + 1} nivel ${this.wave}`);
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
      if (els.pauseMiniContext) els.pauseMiniContext.textContent = `M${this.mapIndex + 1} · Nivel ${this.wave} · ${this.getDifficulty().name}`;
    }

    updateHud() {
      if (!this.player || !els.hudHp) return;
      els.hudHp.textContent = Math.max(0, Math.round(this.player.hp));
      els.hudShield.textContent = Math.max(0, Math.round(this.player.shield));
      const totalLevels = this.worldStage?.totalLevels || 5;
      els.hudWave.textContent = `L${this.wave}/${totalLevels}`;
      els.hudMap.textContent = `M${this.mapIndex + 1}/${MAPS.length}`;
      els.hudScore.textContent = this.run.score;
      els.hudCoins.textContent = this.run.coins;
      this.updateTacticalCart(false);
      this.updateBossApproachHud();
      if (els.xpLabel && this.mapIndex < 5 && !this.bossActive) {
        if (this.mapIndex === 0) {
          const act = WORLD_ONE_ACTS[this.wave - 1];
          const progressText = this.wave === 5 ? `capitanes ${this.worldOneState?.captainsKilled || 0}/3` : `eliminados ${this.worldStage?.kills || 0}/${this.getWorldStageTarget(this.wave)}`;
          els.xpLabel.textContent = `L${this.wave}/5 · ${act?.name || 'Mundo 1'} · ${progressText}`;
        } else if (this.mapIndex === 1) {
          const act=WORLD_TWO_ACTS[this.wave-1];
          const bossPct=this.getBossApproachPercent();
          const progressText=this.wave===5?`PREFECTOS ${this.worldTwoState?.captainsKilled||0}/3 · JEFE ${bossPct}%`:`eliminados ${this.worldStage?.kills||0}/${this.getWorldStageTarget(this.wave)} · JEFE ${bossPct}%`;
          els.xpLabel.textContent=`L${this.wave}/5 · ${act?.name||'Mundo 2'} · ${progressText}`;
        } else if(this.mapIndex===2){const act=WORLD_THREE_ACTS[this.wave-1],bossPct=this.getBossApproachPercent();els.xpLabel.textContent=`L${this.wave}/5 · ${act?.name||'Mundo 3'} · eliminados ${this.worldStage?.kills||0}/${this.getWorldStageTarget(this.wave)} · JEFE ${bossPct}%`;}
        else els.xpLabel.textContent = `Nivel ${this.player.level} · eliminados ${this.worldStage?.kills || 0}/${this.getWorldStageTarget(this.wave)}`;
      }
      if (els.hudLives) els.hudLives.textContent = Math.min(MAX_TOTAL_LIVES, this.extraLives + (this.running ? 1 : 0));
      if ((this.mapIndex===0||this.mapIndex===1||this.mapIndex===2)&&!this.bossActive) {
        const finalAct=this.wave===5;
        const denom=finalAct&&this.mapIndex<2?3:this.getWorldStageTarget(this.wave);
        const numer=finalAct&&this.mapIndex<2?(this.mapIndex===0?(this.worldOneState?.captainsKilled||0):(this.worldTwoState?.captainsKilled||0)):(this.worldStage?.kills||0);
        els.xpFill.style.width=`${clamp(numer/Math.max(1,denom)*100,0,100)}%`;
      } else els.xpFill.style.width = `${clamp(this.player.xp / this.player.xpNext * 100, 0, 100)}%`;
      if (!(this.mapIndex < 5 && !this.bossActive)) els.xpLabel.textContent = `Nivel ${this.player.level}`;
      this.updatePendingBadge();
      const activePowers = Object.entries(this.powerActivity || {}).sort((a, b) => b[1] - a[1]);
      const visibleLimit = this.isSmallScreen ? 4 : 6;
      const visible = activePowers.slice(0, visibleLimit);
      const overflow = Math.max(0, activePowers.length - visible.length);
      const statusChips = [];
      if ((this.player.entryShieldTimer || 0) > 0) statusChips.push(`<div class="power-chip active-power selected" title="Escudo de entrada"><span>◈</span><small>${Math.ceil(this.player.entryShieldTimer)}</small></div>`);
      if ((this.player.shotTier || 0) > 0) statusChips.push(`<div class="power-chip active-power relic" title="Arma base permanente: más daño, alcance, velocidad y precisión"><span>⇈</span><small>MK${1 + (this.player.shotTier || 0)}</small></div>`);
      if(this.mapIndex>0&&currentProfile().relics?.world1Core)statusChips.push(`<div class="power-chip active-power relic" title="Núcleo Meteórico heredado">${bossSigilHtml(0,'relic-chip-sigil')}<small>R1</small></div>`);
      if(this.mapIndex>1&&currentProfile().relics?.world2Spore)statusChips.push(`<div class="power-chip active-power relic" title="Matriz de Convergencia heredada">${bossSigilHtml(1,'relic-chip-sigil')}<small>R2</small></div>`);
      if(this.mapIndex>2&&currentProfile().relics?.world3Inferno)statusChips.push(`<div class="power-chip active-power relic" title="Corazón Ígneo heredado">${bossSigilHtml(2,'relic-chip-sigil')}<small>R3</small></div>`);
      if(this.mapIndex>3&&currentProfile().relics?.world4Hex)statusChips.push(`<div class="power-chip active-power relic" title="Sello Astral heredado">${bossSigilHtml(3,'relic-chip-sigil')}<small>R4</small></div>`);
      const inheritedAllies = this.drones.filter(d => d.inheritPower && !d.permanent);
      if (inheritedAllies.length) {
        const allyLife = Math.max(...inheritedAllies.map(d => d.life || 0));
        statusChips.push(`<div class="power-chip active-power" title="Naves aliadas heredando el poder activo"><span>🛸${inheritedAllies.length}</span><small>${Math.max(1,Math.ceil(allyLife))}</small></div>`);
      }
      const comboChips=Object.keys(this.activeCombos||{}).slice(0,this.isSmallScreen?1:2).map(id=>{const f=FUSIONS.find(x=>x.id===id);return `<div class="power-chip active-power combo" title="COMBO: ${f?.name||id}">${f?.icon||'◆'}<small>C</small></div>`;}).join('');
      const queueChips=(this.powerQueue||[]).slice(0,this.isSmallScreen?1:3).map((q,i)=>{const pow=POWERS.find(p=>p.id===q.id);return `<div class="power-chip queued" title="COLA ${i+1}: ${pow?.name||q.id}">${pow?.icon||'◇'}<small>${i+1}</small></div>`;}).join('');
      els.powerDock.innerHTML = statusChips.join('') + visible.map(([id, secs]) => {
        const pow = POWERS.find(p => p.id === id);
        const time = Math.max(1, Math.ceil(secs));
        const selected = this.activePowerSlots?.weaponMode === id ? 'selected' : '';
        return `<button class="power-chip active-power ${selected}" data-power="${id}" title="${pow?.name || id} · ${time}s activas">${pow?.icon || '✦'}<small>${time}</small></button>`;
      }).join('') + comboChips + queueChips + (overflow ? `<div class="power-chip overflow" title="${overflow} poderes activos más">+${overflow}</div>` : '');
      els.powerDock.querySelectorAll('[data-power]').forEach(btn => btn.onclick = () => {
        const id = btn.dataset.power;
        if (['triple','laser','voidray'].includes(id) && this.isPowerActive(id)) {
          this.activePowerSlots.weaponMode = id;
          this.toast('🎛️ Modo de disparo', POWERS.find(p => p.id === id)?.name || id);
        }
      });
    }

    updatePendingBadge() {
      if (!els.pendingBadge || !els.pendingBadgeCount) return;
      this.offerActive=false;this.pendingLevelChoices=0;els.pendingBadgeCount.textContent='0';els.pendingBadge.classList.add('hidden');els.pendingBadge.classList.remove('pulse');
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
      this.drawWorldBackdrop(ctx, map);
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

    drawWorldBackdrop(ctx, map) {
      if (this.mapIndex === 0) {
        const level = clamp(this.wave, 1, 5);
        const w1 = this.worldOneState || {};
        const drift = now() * .00035;
        const bgOrbit = this.getAsset('world1BgOrbit');
        const bgStation = this.getAsset('world1BgStation');
        const bgBoss = this.getAsset('world1BossBg');
        const bossSprite = this.getAsset('bossBiomech');
        const orbitAlpha = [0,.94,.82,.5,.24,.12][level];
        const stationAlpha = [0,.14,.28,.68,.88,.82][level];
        if (bgOrbit) this.drawImageCover(ctx, bgOrbit, 0, 0, this.w, this.h, { alpha: this.bossActive ? .04 : orbitAlpha, scale: 1.06, offsetX: Math.sin(drift) * 12, offsetY: Math.cos(drift*.8) * 6 });
        if (bgStation) this.drawImageCover(ctx, bgStation, 0, 0, this.w, this.h, { alpha: this.bossActive ? .08 : stationAlpha, scale: 1.09, offsetX: Math.cos(drift*.65) * 10, offsetY: Math.sin(drift*.7) * 5 });
        let bossBgAlpha = 0;
        if (level === 5) bossBgAlpha = .12 + (w1.captainsKilled || 0) * .055;
        if ((w1.bossPrelude || 0) > 0) bossBgAlpha = .18 + (1 - w1.bossPrelude / (w1.bossPreludeMax || 4.8)) * .78;
        if (this.bossActive) bossBgAlpha = .94;
        if (bgBoss && bossBgAlpha > 0) this.drawImageCover(ctx, bgBoss, 0, 0, this.w, this.h, { alpha: bossBgAlpha, scale: 1.08, offsetX: Math.sin(drift*.3) * 8, offsetY: Math.cos(drift*.2) * 4 });

        // Presagio: la silueta del jefe se acerca gradualmente desde el acto II.
        if (bossSprite && level >= 2 && !this.bossActive && !(w1.bossPrelude > 0)) {
          ctx.save();
          const width = this.w * (.095 + level * .018);
          const height = width * (bossSprite.naturalHeight / bossSprite.naturalWidth);
          ctx.globalAlpha = .025 + level * .018;
          ctx.filter = 'brightness(.35) saturate(.55)';
          ctx.drawImage(bossSprite, this.w * (.72 - level*.025), this.h * (.08 + Math.sin(drift)*.01), width, height);
          ctx.restore();
        }

        // Señales ambientales del acto, decorativas y muy baratas de renderizar.
        if (level === 2) {
          const meteor = this.getAsset('meteorRealistic');
          if (meteor) for (let i=0;i<2;i++) {
            const x = this.w * (.18 + i*.56) + Math.sin(drift*4+i)*28;
            const y = this.h * (.12 + i*.13) + Math.cos(drift*3+i)*12;
            const size = 42 + i*18;
            ctx.save(); ctx.globalAlpha = .18; ctx.rotate?.(0); ctx.drawImage(meteor,x,y,size,size); ctx.restore();
          }
        }
        if (level >= 3) {
          const fleet = this.getAsset('mirrorShip');
          if (fleet) {
            ctx.save();
            ctx.globalAlpha = level === 3 ? .11 : .08;
            const fw = this.w * .16;
            const fh = fw * (fleet.naturalHeight / fleet.naturalWidth);
            ctx.drawImage(fleet, this.w*.08, this.h*.12, fw, fh);
            if (level >= 4) ctx.drawImage(fleet, this.w*.68, this.h*.22, fw*.82, fh*.82);
            ctx.restore();
          }
        }
        ctx.save();
        const tint = ctx.createLinearGradient(0,0,0,this.h);
        tint.addColorStop(0, level >= 4 ? 'rgba(92,42,70,.12)' : 'rgba(70,120,190,.08)');
        tint.addColorStop(1, level >= 4 ? 'rgba(255,92,42,.11)' : 'rgba(8,14,26,.05)');
        ctx.fillStyle = tint; ctx.fillRect(0,0,this.w,this.h); ctx.restore();
        return;
      }
      if (this.mapIndex === 1) {
        const level=clamp(this.wave,1,5);
        const w2=this.worldTwoState||{};
        const drift=now()*.00028;
        const bgA=this.getAsset('world2BgQuarantine');
        const bgB=this.getAsset('world2BgRift');
        const bgBoss=this.getAsset('world2BossBg');
        const bgAbyss=this.getAsset('world2BgAbyss');
        const bgBattle=this.getAsset('world2BgBattlefield');
        const bgFort=this.getAsset('world2BgFortress');
        const bgChaos=this.getAsset('world2BossChaos') || bgBoss;
        const bossSprite=this.getAsset('bossBaciloOmega');
        const prelude=w2.bossPrelude||0;
        let layers=[];
        if(level===1) layers=[[bgAbyss,.88,1.06],[bgA,.18,1.08]];
        else if(level===2) layers=[[bgA,.60,1.08],[bgBattle,.40,1.06],[bgAbyss,.12,1.05]];
        else if(level===3) layers=[[bgB,.58,1.08],[bgBattle,.32,1.07],[bgA,.14,1.05]];
        else if(level===4) layers=[[bgFort,.80,1.08],[bgBattle,.30,1.06],[bgB,.16,1.05]];
        else layers=[[bgBattle,.64,1.06],[bgFort,.28,1.07],[bgChaos,.12,1.05]];
        if(prelude>0){const t=1-prelude/(w2.bossPreludeMax||4.6);layers=layers.map(([img,a,s],idx)=>[img,a*(1-Math.min(.9,t*(idx===0?.88:.72))),s]);layers.push([bgChaos,.18+t*.68,1.07]);}
        if(this.bossActive) layers=[[bgChaos,.94,1.08],[bgBoss,.22,1.08],[bgBattle,.12,1.05]];
        layers.forEach(([img,a,scale],idx)=>{if(!img||a<=0)return;this.drawImageCover(ctx,img,0,0,this.w,this.h,{alpha:a,scale,offsetX:Math.sin(drift*(.5+idx*.18))*12,offsetY:Math.cos(drift*(.42+idx*.14))*6});});
        if(bossSprite && level>=2 && !this.bossActive && prelude<=0){
          ctx.save();const width=this.w*(.075+level*.018);const height=width*(bossSprite.naturalHeight/bossSprite.naturalWidth);ctx.globalAlpha=.025+level*.016;ctx.filter='brightness(.45) saturate(.8)';ctx.drawImage(bossSprite,this.w*(.73-level*.018),this.h*.08,width,height);ctx.restore();
        }
        ctx.save();const tint=ctx.createLinearGradient(0,0,0,this.h);tint.addColorStop(0,level>=4?'rgba(126,66,182,.12)':'rgba(72,126,130,.09)');tint.addColorStop(1,level>=4?'rgba(82,22,112,.14)':'rgba(4,12,22,.08)');ctx.fillStyle=tint;ctx.fillRect(0,0,this.w,this.h);ctx.restore();
        return;
      }
      if(this.mapIndex===2){
        const level=clamp(this.wave,1,5),stage=level<=2?0:(level<=4?1:2),drift=now()*.00024,bg=this.getAsset('world3BgSpeed'),bossBg=this.getAsset('world3BossBg'),bossSprite=this.getAsset('bossWorld3'),bossPct=this.getBossApproachPercent();
        if(bg)this.drawImageCover(ctx,bg,0,0,this.w,this.h,{alpha:this.bossActive?.18:(.80+stage*.025),scale:1.035+stage*.025,offsetX:Math.sin(drift*(1+stage*.18))* (8+stage*5),offsetY:Math.cos(drift*.8)*(4+stage*2)});
        if(bossBg&&(level===5||this.bossActive))this.drawImageCover(ctx,bossBg,0,0,this.w,this.h,{alpha:this.bossActive?.88:(.12+bossPct*.0035),scale:1.06,offsetX:Math.cos(drift*.7)*7,offsetY:Math.sin(drift*.5)*4});
        if(bossSprite&&level>=3&&!this.bossActive){ctx.save();const ww=this.w*(.07+level*.018),hh=ww*(bossSprite.naturalHeight/bossSprite.naturalWidth);ctx.globalAlpha=.018+level*.012;ctx.filter='brightness(.38) saturate(.72)';ctx.drawImage(bossSprite,this.w*(.74-level*.02),this.h*.07,ww,hh);ctx.restore();}
        if(stage>0){const keys=stage===1?['world3Hazard2','world3Hazard5']:['world3Hazard7','world3Hazard9'];keys.forEach((k,i)=>{const img=this.getAsset(k);if(img){ctx.save();ctx.globalAlpha=.055+stage*.025;const sz=this.w*(.08+i*.035);ctx.drawImage(img,this.w*(i?.72:.11)+Math.sin(drift*4+i)*18,this.h*(i?.14:.68),sz,sz);ctx.restore();}});}
        ctx.save();const tint=ctx.createLinearGradient(0,0,0,this.h);tint.addColorStop(0,stage===2?'rgba(76,166,94,.13)':'rgba(32,108,72,.08)');tint.addColorStop(1,stage===2?'rgba(6,20,14,.25)':'rgba(2,12,10,.18)');ctx.fillStyle=tint;ctx.fillRect(0,0,this.w,this.h);ctx.restore();return;
      }
      if(this.mapIndex===3){
        const level=clamp(this.wave,1,5),stage=level<=2?0:(level<=4?1:2),drift=now()*.00022,bg=this.getAsset('world4BgCity'),bossBg=this.getAsset('world4BossBg'),bossSprite=this.getAsset('bossWorld4'),bossPct=this.getBossApproachPercent();
        if(bg)this.drawImageCover(ctx,bg,0,0,this.w,this.h,{alpha:this.bossActive?.16:(.82+stage*.025),scale:1.045+stage*.025,offsetX:Math.sin(drift*(1+stage*.2))*(10+stage*5),offsetY:Math.cos(drift*.7)*(5+stage*2)});
        if(bossBg&&(level===5||this.bossActive))this.drawImageCover(ctx,bossBg,0,0,this.w,this.h,{alpha:this.bossActive?.90:(.10+bossPct*.004),scale:1.07,offsetX:Math.cos(drift*.7)*8,offsetY:Math.sin(drift*.5)*5});
        if(bossSprite&&level>=3&&!this.bossActive){ctx.save();const ww=this.w*(.07+level*.018),hh=ww*(bossSprite.naturalHeight/bossSprite.naturalWidth);ctx.globalAlpha=.02+level*.012;ctx.filter='brightness(.38) saturate(.8)';ctx.drawImage(bossSprite,this.w*(.73-level*.018),this.h*.08,ww,hh);ctx.restore();}
        if(stage>0){const keys=stage===1?['world4Hazard2','world4Hazard6']:['world4Hazard7','world4Hazard9'];keys.forEach((k,i)=>{const img=this.getAsset(k);if(img){ctx.save();ctx.globalAlpha=.05+stage*.028;const sz=this.w*(.075+i*.04);ctx.drawImage(img,this.w*(i?.76:.08)+Math.cos(drift*3+i)*16,this.h*(i?.18:.66),sz,sz);ctx.restore();}});}
        ctx.save();const tint=ctx.createLinearGradient(0,0,0,this.h);tint.addColorStop(0,stage===2?'rgba(182,48,30,.15)':'rgba(124,28,26,.09)');tint.addColorStop(1,stage===2?'rgba(38,5,4,.27)':'rgba(24,6,6,.20)');ctx.fillStyle=tint;ctx.fillRect(0,0,this.w,this.h);ctx.restore();return;
      }
      if(this.mapIndex===4){
        const level=clamp(this.wave,1,5),stage=level<=2?0:(level<=4?1:2),drift=now()*.00020,bg=this.getAsset('world5BgCave'),bossBg=this.getAsset('world5BossBg'),bossSprite=this.getAsset('bossWorld5'),bossPct=this.getBossApproachPercent();
        if(bg)this.drawImageCover(ctx,bg,0,0,this.w,this.h,{alpha:this.bossActive?.15:(.84+stage*.025),scale:1.045+stage*.028,offsetX:Math.sin(drift*(1+stage*.2))*(9+stage*5),offsetY:Math.cos(drift*.7)*(5+stage*2)});
        if(bossBg&&(level===5||this.bossActive))this.drawImageCover(ctx,bossBg,0,0,this.w,this.h,{alpha:this.bossActive?.92:(.12+bossPct*.004),scale:1.07,offsetX:Math.cos(drift*.7)*8,offsetY:Math.sin(drift*.5)*5});
        if(bossSprite&&level>=3&&!this.bossActive){ctx.save();const ww=this.w*(.075+level*.018),hh=ww*(bossSprite.naturalHeight/bossSprite.naturalWidth);ctx.globalAlpha=.022+level*.013;ctx.filter='brightness(.36) saturate(.84)';ctx.drawImage(bossSprite,this.w*(.72-level*.02),this.h*.07,ww,hh);ctx.restore();}
        if(stage>0){const keys=stage===1?['world5Hazard3','world5Hazard5']:['world5Hazard7','world5Hazard9'];keys.forEach((k,i)=>{const img=this.getAsset(k);if(img){ctx.save();ctx.globalAlpha=.05+stage*.03;const sz=this.w*(.08+i*.045);ctx.drawImage(img,this.w*(i?.73:.10)+Math.sin(drift*3+i)*18,this.h*(i?.15:.64),sz,sz);ctx.restore();}});}
        ctx.save();const tint=ctx.createLinearGradient(0,0,0,this.h);tint.addColorStop(0,stage===2?'rgba(112,44,178,.15)':'rgba(74,32,118,.09)');tint.addColorStop(1,stage===2?'rgba(9,3,28,.30)':'rgba(6,4,18,.24)');ctx.fillStyle=tint;ctx.fillRect(0,0,this.w,this.h);ctx.restore();return;
      }
    }

    drawWorldOneAtmosphere(ctx) {
      const t = now() * .001;
      const level = clamp(this.wave,1,5);
      ctx.save();
      const starCount = state.settings.lowPerformance ? 10 : 18;
      for (let i=0;i<starCount;i++) {
        const sx = ((i * 137 + t * (8 + (i%3)*4)) % (this.w + 40)) - 20;
        const sy = (i * 83 + level * 31) % this.h;
        const r = .7 + (i%3)*.55;
        ctx.globalAlpha = .16 + (i%4)*.035;
        ctx.fillStyle = i%5===0 ? '#9fd4ff' : '#ffffff';
        ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
      }
      if (level === 2) {
        ctx.globalAlpha = .08; ctx.strokeStyle = '#ffd56a'; ctx.lineWidth = 1.2;
        for (let i=0;i<4;i++) {
          const x = ((i*240 + t*72) % (this.w+180))-90;
          const y = (i*118 + 40) % this.h;
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-48,y-26); ctx.stroke();
        }
      }
      if (level >= 4) {
        ctx.globalAlpha = .07 + (level-4)*.035; ctx.strokeStyle = '#ff8b63';
        for (let i=0;i<3;i++) {
          const y = this.h*(.22+i*.24) + Math.sin(t*.45+i)*10;
          ctx.beginPath(); ctx.moveTo(0,y); ctx.bezierCurveTo(this.w*.3,y-18,this.w*.65,y+18,this.w,y-6); ctx.stroke();
        }
      }
      if ((this.worldOneState?.bossPrelude || 0) > 0) {
        const a = 1 - this.worldOneState.bossPrelude/(this.worldOneState.bossPreludeMax||4.8);
        ctx.globalAlpha = .08 + a*.22; ctx.fillStyle = '#ff5b3e'; ctx.fillRect(0,0,this.w,this.h);
      }
      ctx.restore();
    }

    drawWorldTwoAtmosphere(ctx) {
      const t=now()*.001;
      const level=clamp(this.wave,1,5);
      ctx.save();
      const motes=state.settings.lowPerformance?8:14;
      for(let i=0;i<motes;i++){
        const x=((i*149+t*(13+(i%3)*5))%(this.w+60))-30;
        const y=(i*97+level*41)%this.h;
        const r=1.1+(i%4)*.7;
        ctx.globalAlpha=.08+(i%3)*.035;
        ctx.fillStyle=i%2?'#98fff1':'#c391ff';
        ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
      }
      if(level>=2){
        ctx.globalAlpha=.09;ctx.strokeStyle='#c391ff';ctx.lineWidth=1.2;
        for(let i=0;i<3;i++){
          const y=this.h*(.2+i*.26)+Math.sin(t*.55+i)*18;
          ctx.beginPath();ctx.moveTo(-20,y);ctx.bezierCurveTo(this.w*.28,y-36,this.w*.67,y+30,this.w+20,y-10);ctx.stroke();
        }
      }
      if(level>=4){
        ctx.globalAlpha=.07;ctx.strokeStyle='#ffb35c';
        for(let i=0;i<2;i++){
          const x=this.w*(.28+i*.42)+Math.sin(t*.3+i)*22;
          ctx.beginPath();ctx.arc(x,this.h*.2,52+i*34,0,Math.PI*2);ctx.stroke();
        }
      }
      if((this.worldTwoState?.bossPrelude||0)>0){
        const a=1-this.worldTwoState.bossPrelude/(this.worldTwoState.bossPreludeMax||4.6);
        ctx.globalAlpha=.06+a*.18;ctx.fillStyle='#7f31b9';ctx.fillRect(0,0,this.w,this.h);
      }
      ctx.restore();
    }


    ensureWorldThreeStars(){
      if(this.mapIndex!==2)return;const target=state.settings.lowPerformance?60:(this.w>=1200?100:82);this.world3Stars=this.world3Stars||[];
      while(this.world3Stars.length<target){const i=this.world3Stars.length,layer=i<target*.58?0:(i<target*.88?1:2);this.world3Stars.push({x:Math.random()*this.w,y:Math.random()*this.h,layer,seed:Math.random()});}
      if(this.world3Stars.length>target)this.world3Stars.length=target;
    }

    drawWorldThreeSpeedField(ctx,dt=.016){
      this.ensureWorldThreeStars();const w3=this.worldThreeState||{},boost=(this.isPowerActive('afterburner')?1.72:1)*((w3.speedBurst||0)>0?1.48:1)*(this.bossActive?1.35:(this.getBossApproachPercent()>=80?1.2:1)),fade=this.enemies.length>12?.72:1;
      ctx.save();ctx.lineCap='round';
      for(const s of this.world3Stars){const base=s.layer===0?38:(s.layer===1?82:155),speed=base*boost,len=s.layer===2?(7+18*(boost-1)):s.layer===1?(2+7*(boost-1)):0;s.y+=speed*dt;s.x+=(s.layer===2?8:2)*dt;if(s.y>this.h+20){s.y=-15;s.x=Math.random()*this.w;}if(s.x>this.w+20)s.x=-10;ctx.globalAlpha=(s.layer===0?.17:(s.layer===1?.26:.40))*fade;ctx.strokeStyle=s.seed>.82?'#bfffe9':'#d8f3ff';ctx.fillStyle=ctx.strokeStyle;if(len>1.5){ctx.lineWidth=s.layer===2?1.25:.8;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-2,s.y-len);ctx.stroke();}else{ctx.beginPath();ctx.arc(s.x,s.y,s.layer===0?.7:1.05,0,Math.PI*2);ctx.fill();}}
      ctx.restore();
    }

    drawMapAtmosphere(ctx, map, dt=.016) {
      if (this.mapIndex === 0) { this.drawWorldOneAtmosphere(ctx); return; }
      if (this.mapIndex === 1) { this.drawWorldTwoAtmosphere(ctx); return; }
      if(this.mapIndex===2){this.drawWorldThreeSpeedField(ctx,dt);return;}
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
      const meteorSprite = this.getAsset('meteorRealistic');
      const ringedSprite = this.getAsset('planetRinged');
      const moonSprite = this.getAsset('moonShattered');
      for (const m of this.meteors) {
        ctx.save();
        const angle = Math.atan2(m.vy, m.vx);
        ctx.translate(m.x, m.y);
        ctx.rotate(angle * (m.kind === 'planet' || m.kind === 'moon' ? .2 : 1));
        ctx.globalAlpha = .9;
        ctx.shadowBlur = 14;
        ctx.shadowColor = m.kind === 'bomb' ? '#ff5f38' : (m.kind === 'wreck' ? '#ffb35c' : '#ffd56a');
        if (m.kind === 'meteor' || m.kind === 'bomb') {
          const tail = Math.max(26, m.r * 2.4);
          ctx.fillStyle = m.kind === 'bomb' ? 'rgba(255,90,48,.22)' : 'rgba(255,160,72,.18)';
          ctx.beginPath();
          ctx.moveTo(-tail, -m.r * .34);
          ctx.lineTo(0, -m.r * .62);
          ctx.lineTo(m.r * .72, 0);
          ctx.lineTo(0, m.r * .62);
          ctx.closePath();
          ctx.fill();
        }
        ctx.rotate(now() * .0015 + (m.spin || 0));
        let sprite = m.spriteKey ? this.getAsset(m.spriteKey) : meteorSprite;
        if (m.kind === 'planet') sprite = ringedSprite || moonSprite || meteorSprite;
        if (m.kind === 'moon') sprite = moonSprite || ringedSprite || meteorSprite;
        if (sprite) {
          const scale = m.kind === 'planet' ? 5.6 : (m.kind === 'moon' ? 5.0 : (m.kind === 'wreck' ? 4.7 : 4.2));
          const w = m.r * scale;
          const h = w * (sprite.naturalHeight / sprite.naturalWidth);
          ctx.drawImage(sprite, -w * .5, -h * .5, w, h);
          if (m.kind === 'bomb') {
            ctx.globalAlpha = .26;
            ctx.fillStyle = '#ff5f38';
            ctx.beginPath(); ctx.arc(0, 0, m.r * 1.25, 0, Math.PI * 2); ctx.fill();
          }
        }
        if (m.hp) {
          const maxHp=(m.kind==='planet'||m.kind==='moon')?(68+this.wave*9):(m.kind==='bomb'?(32+this.wave*6):(m.kind==='wreck'?(38+this.wave*5):(28+this.wave*4)));
          const hp = clamp(m.hp / maxHp, 0, 1);
          ctx.globalAlpha = .82;
          ctx.fillStyle = 'rgba(0,0,0,.36)';
          ctx.fillRect(-m.r, m.r + 8, m.r * 2, 3);
          ctx.fillStyle = m.kind === 'planet' || m.kind === 'moon' ? '#9fd4ff' : (m.kind === 'wreck' ? '#ffb35c' : '#ffd56a');
          ctx.fillRect(-m.r, m.r + 8, m.r * 2 * hp, 3);
        }
        ctx.restore();
      }
    }


    drawZones(ctx) {
      for (const z of this.zones) {
        const a = clamp(z.life / z.max, 0, 1);
        ctx.save();
        ctx.globalAlpha = .24 * a;
        ctx.fillStyle = z.type === 'toxic' ? '#b7ff69' : z.type === 'slow' ? '#83eaff' : z.type === 'gravityMine' ? '#c391ff' : z.type==='bossGravity' ? '#9a43e8' : '#61ffc8';
        ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = .65 * a;
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }
    }

    drawPickups(ctx) {
      for (const it of this.pickups) {
        ctx.save();
        const specialPrize = it.major || it.rewardGlow;
        const pulse = 1 + Math.sin((now() + (it.born || 0)) * (specialPrize ? .014 : .008)) * (specialPrize ? .18 : .1);
        const alpha = clamp(it.life / (it.maxLife || 12), .24, 1);
        ctx.globalAlpha = alpha;
        ctx.translate(it.x, it.y);
        ctx.scale(pulse, pulse);
        ctx.shadowBlur = it.major ? 28 : (it.rewardGlow ? 24 : ((it.type === 'power' || it.type === 'combo') ? 16 : 9));
        ctx.shadowColor = it.color;
        ctx.strokeStyle = it.color;
        ctx.lineWidth = it.major ? 2.2 : (it.rewardGlow ? 2 : 1.4);
        ctx.beginPath(); ctx.arc(0, 0, it.r + ((it.type === 'power' || it.type === 'combo') ? 5 : 3), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = alpha * .18;
        ctx.fillStyle = it.color;
        ctx.beginPath(); ctx.arc(0, 0, it.r + 1, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#071018';
        ctx.beginPath(); ctx.arc(0, 0, Math.max(3, it.r - 2), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = it.color;
        ctx.font = `${Math.max(10, it.r * 1.28)}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(it.icon || '•', 0, .5);
        if (it.type === 'power' || it.type === 'combo' || it.type === 'nuke' || it.rewardGlow) {
          ctx.globalAlpha = alpha * .5;
          ctx.rotate(now() * (specialPrize ? .0034 : .0024));
          ctx.strokeStyle = specialPrize ? '#ffffff' : it.color;
          ctx.beginPath();
          ctx.moveTo(0, -it.r - 8); ctx.lineTo(it.r + 8, 0); ctx.lineTo(0, it.r + 8); ctx.lineTo(-it.r - 8, 0); ctx.closePath();
          ctx.stroke();
        }
        if (it.rewardGlow && !it.major) {
          ctx.rotate(-now() * .0034);
          ctx.globalAlpha = alpha * (.38 + Math.sin(now()*.018)*.18);
          ctx.strokeStyle = it.color;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(0,0,it.r+9+Math.sin(now()*.01)*2,0,Math.PI*2); ctx.stroke();
          if (it.label) {
            ctx.globalAlpha = alpha * .9;
            ctx.fillStyle = '#eaffff';
            ctx.font = '800 9px system-ui';
            ctx.fillText(it.label, 0, it.r + 22);
          }
        }
        if (it.major) {
          ctx.rotate(-now() * .0034);
          ctx.globalAlpha = alpha * (.32 + Math.sin(now()*.01)*.12);
          const beam = ctx.createLinearGradient(0, -70, 0, 70);
          beam.addColorStop(0,'transparent'); beam.addColorStop(.5,it.color); beam.addColorStop(1,'transparent');
          ctx.fillStyle = beam; ctx.fillRect(-1.3, -72, 2.6, 144);
          if (it.label) {
            ctx.globalAlpha = alpha * .86;
            ctx.fillStyle = '#eaffff';
            ctx.font = '700 10px system-ui';
            ctx.fillText(it.label, 0, it.r + 24);
          }
        }
        ctx.restore();
      }
    }

    drawBullets(ctx) {
      for (const b of this.bullets) {
        if (b.type === 'laser') continue;
        ctx.save();
        ctx.shadowBlur = 18 + (b.glow || 0) * 5;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        if (b.type === 'torpedo' || b.type === 'kamikaze') {
          const ang = Math.atan2(b.vy, b.vx);
          ctx.translate(b.x, b.y);
          ctx.rotate(ang);
          ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, 6); ctx.lineTo(-3,0); ctx.lineTo(-8,-6); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = .28; ctx.fillRect(-14,-2,10,4);
        } else if (b.enemy) {
          const ang = Math.atan2(b.vy, b.vx);
          ctx.translate(b.x, b.y);ctx.rotate((b.rot??ang));ctx.globalAlpha=.94;
          const shape=b.shape||'bolt';
          if(shape==='meteor'){
            ctx.fillStyle='#34120d';ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=b.r*(i%2?1.12:.82);const xx=Math.cos(a)*rr,yy=Math.sin(a)*rr;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#ffb35f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-b.r*.35,-b.r*.45);ctx.lineTo(0,0);ctx.lineTo(b.r*.42,b.r*.32);ctx.stroke();
          }else if(shape==='spore'){
            ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.55;for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*b.r*.9,Math.sin(a)*b.r*.9,b.r*.34,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-b.r*.22,-b.r*.18,b.r*.2,0,Math.PI*2);ctx.fill();
          }else if(shape==='volt'){
            ctx.strokeStyle=b.color;ctx.lineWidth=Math.max(2,b.r*.72);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-7,-3);ctx.lineTo(-1,2);ctx.lineTo(5,-2);ctx.lineTo(12,0);ctx.stroke();ctx.globalAlpha=.7;ctx.strokeStyle='#eaffff';ctx.lineWidth=1;ctx.stroke();
          }else if(shape==='blade'){
            ctx.fillStyle=b.color;ctx.beginPath();ctx.moveTo(11,0);ctx.quadraticCurveTo(-1,-11,-11,-4);ctx.quadraticCurveTo(-2,0,-11,4);ctx.quadraticCurveTo(-1,11,11,0);ctx.fill();ctx.globalAlpha=.72;ctx.strokeStyle='#ffd1bd';ctx.lineWidth=1.2;ctx.stroke();
          }else if(shape==='void'){
            ctx.fillStyle='#020105';ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=b.color;ctx.lineWidth=2.4;ctx.stroke();ctx.globalAlpha=.55;ctx.strokeStyle='#ff6044';ctx.beginPath();ctx.arc(0,0,b.r*.62,0,Math.PI*2);ctx.stroke();
          }else if(shape==='lance'){
            ctx.fillStyle=b.color;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-8,3.2);ctx.lineTo(-14,0);ctx.lineTo(-8,-3.2);ctx.closePath();ctx.fill();ctx.globalAlpha=.4;ctx.fillRect(-24,-1.5,12,3);
          }else{
            ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-5,3.2);ctx.lineTo(-9,0);ctx.lineTo(-5,-3.2);ctx.closePath();ctx.fill();ctx.globalAlpha=.72;ctx.fillStyle='#fff';ctx.fillRect(-1.5,-1,5,2);
          }
        } else {
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
          if ((b.glow || 0) > 0) {
            ctx.globalAlpha = .84;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(1.4, b.r * .34), 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = .34;
          ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .035, b.y - b.vy * .035); ctx.lineWidth = b.r * 1.2; ctx.strokeStyle = b.color; ctx.stroke();
        }
        ctx.restore();
      }
      for (const pt of this.particles.filter(p => p.type === 'laser')) {
        ctx.save();
        ctx.globalAlpha = clamp(pt.life / pt.max, 0, 1) * .75;
        ctx.strokeStyle = pt.color; ctx.shadowBlur = 22; ctx.shadowColor = pt.color; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(pt.x + Math.cos(pt.a) * (pt.range || 620), pt.y + Math.sin(pt.a) * (pt.range || 620)); ctx.stroke();
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
          const bossSprite = this.mapIndex === 0 ? this.getAsset('bossBiomech') : null;
          if (bossSprite) {
            ctx.globalAlpha = .96 * (e.alpha ?? 1);
            const w = e.r * 5.6 * (this.mobileLandscape?.86:1);
            const h = w * (bossSprite.naturalHeight / bossSprite.naturalWidth);
            ctx.drawImage(bossSprite, -w * .52, -h * .5, w, h);
            ctx.globalAlpha = .18 + (e.alpha ?? 1) * .18;
            ctx.beginPath(); ctx.arc(0, 0, e.r * 1.6, 0, Math.PI * 2); ctx.stroke();
          } else if (this.mapIndex === 1) {
            const boss2=this.getAsset('bossBaciloOmega');
            if(boss2){
              ctx.globalAlpha=.99*(e.alpha??1);
              const w=e.r*8.25*(this.mobileLandscape?.76:1);
              const h=w*(boss2.naturalHeight/boss2.naturalWidth);
              ctx.save();
              ctx.shadowBlur = 18;
              ctx.shadowColor = 'rgba(180,120,255,.28)';
              ctx.drawImage(boss2,-w*.5,-h*.52,w,h);
              ctx.restore();
            } else this.drawBacteriaBoss(ctx,e);
          } else if(this.mapIndex===2){const boss3=this.getAsset('bossWorld3');if(boss3){ctx.globalAlpha=.995*(e.alpha??1);const w=e.r*8.5*(this.mobileLandscape?.74:1),h=w*(boss3.naturalHeight/boss3.naturalWidth);ctx.save();ctx.shadowBlur=22;ctx.shadowColor='rgba(116,255,115,.34)';ctx.drawImage(boss3,-w*.5,-h*.51,w,h);ctx.restore();}else this.drawBacteriaBoss(ctx,e);
          } else if(this.mapIndex===3){const boss4=this.getAsset('bossWorld4');if(boss4){ctx.globalAlpha=.995*(e.alpha??1);const w=e.r*8.6*(this.mobileLandscape?.72:1),h=w*(boss4.naturalHeight/boss4.naturalWidth);ctx.save();ctx.shadowBlur=22;ctx.shadowColor='rgba(255,106,99,.34)';ctx.drawImage(boss4,-w*.5,-h*.50,w,h);ctx.restore();}else this.drawBacteriaBoss(ctx,e);
          } else if(this.mapIndex===4){const boss5=this.getAsset('bossWorld5');if(boss5){ctx.globalAlpha=.995*(e.alpha??1);const w=e.r*8.9*(this.mobileLandscape?.70:1),h=w*(boss5.naturalHeight/boss5.naturalWidth);ctx.save();ctx.shadowBlur=24;ctx.shadowColor='rgba(195,145,255,.36)';ctx.drawImage(boss5,-w*.5,-h*.50,w,h);ctx.restore();}else this.drawBacteriaBoss(ctx,e);
          } else {
            const sides = ({spider:8,tick:7,rat:6,scorpion:10,leech:5,puffer:11,wasp:9,centipede:12,roach:8,chimera:13})[e.beast] || 9;
            this.drawPolygon(ctx, 0, 0, e.r + Math.sin(e.t * 3) * 3, sides, true);
            ctx.globalAlpha = .18 + (e.alpha ?? 1) * .12; this.drawPolygon(ctx, 0, 0, e.r * 1.45, sides, false);
            if ((e.alpha ?? 1) < .7) { ctx.globalAlpha = .12; this.drawPolygon(ctx, 0, 0, e.r * 1.72, sides, false); }
            ctx.globalAlpha = .45 + (e.alpha ?? 1) * .2;
            for (let j=0;j<Math.min(8,sides);j++) { const a = (Math.PI*2/sides)*j + e.t*.4; ctx.beginPath(); ctx.moveTo(Math.cos(a)*e.r*.45, Math.sin(a)*e.r*.45); ctx.lineTo(Math.cos(a)*(e.r*1.35), Math.sin(a)*(e.r*1.35)); ctx.stroke(); }
          }
          this.drawBossDamageOverlay(ctx,e,hp);
          this.drawBossTelegraph(ctx,e);
        } else if ((this.mapIndex>=1&&this.mapIndex<=4)&&e.spriteKey) this.drawEnemyShip(ctx,e,e.spriteKey);
        else if (e.behavior === 'mirror') this.drawEnemyShip(ctx, e, 'mirrorShip');
        else if (this.mapIndex === 0 && ['cazador','corredor','esquivo','mosquito'].includes(e.id)) this.drawEnemyShip(ctx, e, 'enemyBiomechBlue');
        else if (this.mapIndex === 0 && ['toxico','sombra','divisor','larva','nucleo'].includes(e.id)) this.drawEnemyShip(ctx, e, 'enemyToxicCruiser');
        else if (this.mapIndex === 0 && ['blindado','griton','explosivo','errante'].includes(e.id)) this.drawEnemyShip(ctx, e, 'enemySiegeMolten');
        else if (e.behavior === 'toxic' || e.id === 'nucleo') this.drawEnemyShip(ctx, e, 'enemyToxicCruiser');
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
        const realisticWorld2=this.mapIndex===1&&!!e.spriteKey&&!e.boss;const realisticWorld3=this.mapIndex===2&&!!e.spriteKey&&!e.boss;const realisticWorld4=this.mapIndex===3&&!!e.spriteKey&&!e.boss;const realisticWorld5=this.mapIndex===4&&!!e.spriteKey&&!e.boss;
        if(!realisticWorld2&&!realisticWorld3&&!realisticWorld4&&!realisticWorld5){
          ctx.globalAlpha = .9;
          ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-e.r * .35, -e.r * .2); ctx.lineTo(-e.r * .1, -e.r * .06); ctx.moveTo(e.r * .35, -e.r * .2); ctx.lineTo(e.r * .1, -e.r * .06); ctx.stroke();
        }
        if (e.world2Captain) {
          const pulse=1+Math.sin(now()*.007)*.08;
          ctx.save();
          ctx.globalAlpha=.92;
          ctx.strokeStyle='#ffd56a';
          ctx.lineWidth=2.4;
          ctx.setLineDash([7,5]);
          ctx.beginPath(); ctx.arc(0,0,e.r*2.25*pulse,0,Math.PI*2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur=16; ctx.shadowColor='#ffd56a';
          ctx.fillStyle='#fff2b2';
          ctx.font='800 11px system-ui';
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(`PREFECTO ${Math.min(3,(e.captainIndex||0)+1)}/3`,0,-e.r*2.45);
          ctx.restore();
        }
        if (!e.boss) {
          const barY=realisticWorld2?e.r*(e.world2Captain?3.25:2.8)+6:(realisticWorld3?e.r*2.7+6:e.r+8);
          const barW=(realisticWorld2||realisticWorld3)?e.r*2.45:e.r*2;
          ctx.globalAlpha = .85;
          ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fillRect(-barW/2, barY, barW, 4);
          ctx.fillStyle = '#61ffc8'; ctx.fillRect(-barW/2, barY, barW * hp, 4);
        }
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

    drawEnemyShip(ctx, e, spriteKey = 'mirrorShip') {
      ctx.save();
      ctx.rotate(Math.sin(e.t * 2.5) * .12);
      ctx.shadowBlur = 24;
      ctx.shadowColor = e.color;
      const sprite = this.getAsset(spriteKey);
      if (sprite) {
        const w = e.r * 4.8 * (e.visualScale || 1);
        const h = w * (sprite.naturalHeight / sprite.naturalWidth);
        ctx.globalAlpha = .92;
        ctx.drawImage(sprite, -w * .56, -h * .5, w, h);
        ctx.globalAlpha = .18;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, e.r + 12, 0, Math.PI * 2); ctx.stroke();
      } else {
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
      }
      ctx.restore();
    }

    drawBacteriaBoss(ctx, e) {
      ctx.save();
      ctx.globalAlpha = .9 * (e.alpha ?? 1);
      ctx.fillStyle = '#98fff1';
      ctx.strokeStyle = '#dffff7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = (Math.PI * 2 / 24) * i;
        const rr = e.r * (1.05 + Math.sin(e.t * 2 + i) * .12 + (i % 3 === 0 ? .14 : 0));
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = .22;
      ctx.beginPath(); ctx.arc(0, 0, e.r * 1.65, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 9; i++) {
        const a = i * (Math.PI * 2 / 9) + e.t * .35;
        const rr = e.r * (.34 + (i % 3) * .18);
        ctx.globalAlpha = .18 + (i % 2) * .08;
        ctx.fillStyle = i % 2 ? 'rgba(206,255,245,.9)' : 'rgba(100,220,195,.9)';
        ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, e.r * (.13 + (i % 3) * .03), 0, Math.PI * 2); ctx.fill();
      }
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

      // escudo de entrada: protección temporal al comenzar/reintentar un mundo
      if (p.entryShieldTimer > 0) {
        const pulse = 1 + Math.sin(t * 9) * .05;
        ctx.save();
        ctx.scale(pulse, pulse);
        const shieldRatio=p.entryShieldMax?clamp(p.entryShieldTimer/p.entryShieldMax,0,1):1;
        ctx.globalAlpha = .46*shieldRatio + Math.sin(t * 12) * .08;
        ctx.strokeStyle = '#9fd4ff';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#83eaff';
        ctx.beginPath(); ctx.arc(0, 0, p.r + 16, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = .18*shieldRatio;
        ctx.fillStyle='#83eaff';
        ctx.beginPath();ctx.arc(0,0,p.r+14,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha = .22*shieldRatio;
        ctx.strokeStyle='#e9fbff';
        ctx.beginPath();ctx.arc(0,0,p.r+23,0,Math.PI*2);ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
      }

      // outer aura
      if (p.bossDrive > 0) {
        ctx.globalAlpha = .18 + Math.sin(t * 12) * .04;
        ctx.strokeStyle = '#ffd56a'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(0, 0, p.r + 15 + Math.sin(t * 6) * 1.6, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = color; ctx.lineWidth = 2.8;
      }
      if (p.comboSurge > 0) {
        ctx.globalAlpha = .22 + Math.sin(t * 15) * .06;
        ctx.strokeStyle = '#c391ff'; ctx.lineWidth = 2.1; ctx.shadowBlur = 22; ctx.shadowColor = '#c391ff';
        ctx.beginPath(); ctx.arc(0,0,p.r+19+Math.sin(t*8)*2,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha = .14;ctx.strokeStyle='#61ffc8';ctx.beginPath();ctx.arc(0,0,p.r+25+Math.cos(t*7)*2,0,Math.PI*2);ctx.stroke();
        ctx.shadowColor=color;ctx.strokeStyle=color;ctx.lineWidth=2.8;
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

  function isTouchLandscapeTarget() {
    const touch=(navigator.maxTouchPoints||0)>0 || matchMedia?.('(pointer: coarse)')?.matches;
    const shortSide=Math.min(window.innerWidth||9999,window.innerHeight||9999);
    return !!touch && shortSide < 1100;
  }

  let immersiveSession = false;
  let orientationTransitionUntil = 0;

  function syncFullscreenUi() {
    const active=!!document.fullscreenElement;
    document.body.classList.toggle('is-fullscreen',active);
    [els.btnFullscreen,els.btnStoryFullscreen].forEach(btn=>{
      if(!btn)return;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
      btn.title=active?'Salir de pantalla completa':'Pantalla completa';
    });
  }

  function updateGlobalOrientationGate() {
    if(!els.orientationGate)return;
    const vv=window.visualViewport;
    const w=vv?.width||window.innerWidth||0,h=vv?.height||window.innerHeight||0;
    const portrait=h>w;
    const transitioning=Date.now()<orientationTransitionUntil;
    const shouldShow=isTouchLandscapeTarget() && portrait && !transitioning;
    els.orientationGate.classList.toggle('hidden',!shouldShow);
    document.body.classList.toggle('orientation-required',shouldShow);
  }

  async function requestLandscapeExperience({remember=true,source='ui'}={}) {
    const autoTouch=isTouchLandscapeTarget();
    if(remember && autoTouch) immersiveSession=true;
    if(!autoTouch){ syncFullscreenUi(); return false; }
    orientationTransitionUntil=Date.now()+900;
    updateGlobalOrientationGate();
    try {
      if(!document.fullscreenElement && document.documentElement.requestFullscreen){
        await document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
      }
      await screen.orientation?.lock?.('landscape').catch(()=>{});
    } catch(_) {}
    setTimeout(()=>{updateViewportVars();game?.resize?.();updateGlobalOrientationGate();syncFullscreenUi();},80);
    setTimeout(()=>{updateViewportVars();game?.resize?.();updateGlobalOrientationGate();},320);
    return !!document.fullscreenElement;
  }

  async function toggleFullscreenExperience() {
    try {
      if(document.fullscreenElement){
        immersiveSession=false;
        await document.exitFullscreen?.().catch(()=>{});
        try{screen.orientation?.unlock?.();}catch(_){}
      }else{
        immersiveSession=isTouchLandscapeTarget();
        orientationTransitionUntil=Date.now()+900;
        await document.documentElement.requestFullscreen?.({navigationUI:'hide'}).catch(()=>{});
        if(isTouchLandscapeTarget()) await screen.orientation?.lock?.('landscape').catch(()=>{});
      }
    }catch(_){}
    updateViewportVars();
    setTimeout(()=>{updateViewportVars();game?.resize?.();updateGlobalOrientationGate();syncFullscreenUi();},90);
  }

  const WORLD_ONE_STORY = {
    intro: {
      kicker: 'CAMPAÑA · MUNDO 1',
      title: 'PROTOCOLO Z-STRIKE',
      image: 'assets/story/episode_01_protocol_zstrike.webp',
      captions: [
        'ASTERION cayó. El ARCA AURORA desapareció con los últimos supervivientes.',
        'Una señal ha regresado desde el interior de NECRORED.',
        'RIZOMA puede seguirla. Recupera el primer fragmento.'
      ],
      finalLabel: 'Entrar en combate'
    },
    outro: {
      kicker: 'FRAGMENTO 01 · RECUPERADO',
      title: 'NÚCLEO METEÓRICO',
      image: 'assets/story/episode_01_protocol_zstrike.webp',
      captions: [
        'El primer Guardián ha caído. RIZOMA incorpora su tecnología.',
        'La señal de AURORA continúa más allá del siguiente sistema.',
        'LA HISTORIA CONTINÚA...'
      ],
      finalLabel: 'Entrar al Mundo 2'
    }
  };

  let storyRuntime = { sequence:null, step:0, onDone:null };

  function getPlayMode() {
    const p = currentProfile();
    return ['story','direct'].includes(p?.preferredPlayMode) ? p.preferredPlayMode : (['story','direct'].includes(state.settings.playMode) ? state.settings.playMode : 'story');
  }

  function renderStoryFrame() {
    const seq = storyRuntime.sequence;
    if (!seq || !els.storyOverlay) return;
    const step = Math.max(0, Math.min(seq.captions.length - 1, storyRuntime.step));
    els.storyImage.src = seq.image;
    els.storyKicker.textContent = seq.kicker;
    els.storyTitle.textContent = seq.title;
    els.storyCaption.classList.remove('story-caption-in');
    void els.storyCaption.offsetWidth;
    els.storyCaption.textContent = seq.captions[step];
    els.storyCaption.classList.add('story-caption-in');
    els.storyDots.innerHTML = seq.captions.map((_,i)=>`<i class="${i===step?'active':''}"></i>`).join('');
    els.btnStoryNext.textContent = step === seq.captions.length - 1 ? seq.finalLabel : 'Siguiente';
    try { AudioFX.tone(190 + step*35, .055, 'triangle', .012, 45); } catch(_) {}
  }

  function showStorySequence(seq, onDone) {
    requestLandscapeExperience({ remember:true, source:'story' });
    storyRuntime = { sequence: seq, step:0, onDone: typeof onDone === 'function' ? onDone : null };
    els.storyOverlay?.classList.remove('hidden');
    document.body.classList.add('story-open');
    updateGlobalOrientationGate();
    renderStoryFrame();
  }

  function closeStorySequence(runCallback=true) {
    const cb = storyRuntime.onDone;
    els.storyOverlay?.classList.add('hidden');
    document.body.classList.remove('story-open');
    storyRuntime = { sequence:null, step:0, onDone:null };
    if (runCallback && cb) setTimeout(cb, 80);
  }

  function advanceStory() {
    const seq = storyRuntime.sequence;
    if (!seq) return;
    if (storyRuntime.step < seq.captions.length - 1) {
      storyRuntime.step += 1;
      renderStoryFrame();
    } else closeStorySequence(true);
  }

  function startWorldOneWithNarrative(mapIndex=0) {
    if (mapIndex === 0 && getPlayMode() === 'story') showStorySequence(WORLD_ONE_STORY.intro, () => game.start(0));
    else game.start(mapIndex);
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
      /* Mantener fullscreen/orientación al navegar por menú, ranking o cargar partida.
         Solo el usuario abandona el modo inmersivo mediante el botón ⛶. */
      if(immersiveSession && document.fullscreenElement && isTouchLandscapeTarget()){
        screen.orientation?.lock?.('landscape').catch(()=>{});
      }
      renderAll();
      window.scrollTo?.(0, 0);
    }
  }

  function hideOverlays() {
    ['cardOverlay', 'pauseOverlay', 'resultOverlay', 'tacticalPrepPrompt', 'tacticalShopOverlay', 'tacticalCountdown', 'storyOverlay'].forEach(id => els[id]?.classList.add('hidden'));
    els.resultOverlay?.classList.remove('victory-clean');
    els.cardOverlay?.classList.add('hidden');
    els.pendingBadge?.classList.add('hidden');
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

  function renderPortalRankingPreview() {
    if (!els.portalRankingPreview) return;
    const rows = state.profiles.slice().sort((a,b) => (b.stats?.bestScore || 0) - (a.stats?.bestScore || 0)).slice(0,5);
    const ships = ['🚀','🛸','✦','🛰️','☄️'];
    els.portalRankingPreview.innerHTML = `<div class="portal-rank-board"><div class="portal-rank-logo">TABLA DE SCORES</div><div class="portal-rank-head"><span>RANK</span><span>NICKNAME</span><span>SCORE</span></div>${rows.length ? rows.map((p, idx) => `<div class="portal-rank-row ${idx===0?'top':''}"><div class="portal-rank-no">${idx+1}</div><div class="portal-rank-namewrap"><div class="portal-rank-ship">${ships[idx]||'✦'}</div><div class="portal-rank-name"><strong>${p.name||'Jugador'}</strong><small>${idx===0?'COMANDANTE':'PILOTO'} ${String(idx+1).padStart(2,'0')}</small></div></div><strong class="portal-rank-score">${Math.round(p.stats?.bestScore||0)}</strong></div>`).join('') : '<div class="portal-rank-empty">Aún no hay puntajes guardados.</div>'}</div>`;
  }

  function renderSavedGamesList() {
    if (!els.savedGamesList) return;
    const rows = state.profiles.slice().sort((a,b) => (b.stats?.bestScore || 0) - (a.stats?.bestScore || 0));
    els.savedGamesList.innerHTML = rows.map(p => {
      const hasSave = !!p.lastSave;
      const level = hasSave ? (p.lastSave.mapIndex + 1) : (p.unlockedMap || 1);
      const wave = hasSave ? ` · nivel ${p.lastSave.wave}` : '';
      const diffName = DIFFICULTY_MODES[hasSave ? p.lastSave.difficulty : p.preferredDifficulty]?.name || 'Normal';
      return `<button class="saved-game-row" data-load-profile="${p.id}">
        <span><b>${p.name || 'Jugador'}</b><small>Mundo ${level}${wave} · ${diffName} · récord ${p.stats?.bestScore || 0}</small></span>
        <strong>${hasSave ? 'Continuar' : 'Nueva'}</strong>
      </button>`;
    }).join('') || '<small class="muted">No hay partidas guardadas todavía.</small>';
    els.savedGamesList.querySelectorAll('[data-load-profile]').forEach(btn => btn.addEventListener('click', () => {
      requestLandscapeExperience({remember:true,source:'load'});
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
    const selectedDifficulty = DIFFICULTY_MODES[p.preferredDifficulty] ? p.preferredDifficulty : (state.settings.difficulty || 'normal');
    document.querySelectorAll('[data-difficulty]').forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === selectedDifficulty));
    if (els.difficultyHint) els.difficultyHint.textContent = selectedDifficulty==='hard' ? 'Más enemigos, hordas y peligros · mejores recompensas' : 'Experiencia equilibrada actual';
    const selectedPlayMode = ['story','direct'].includes(p.preferredPlayMode) ? p.preferredPlayMode : (state.settings.playMode || 'story');
    document.querySelectorAll('[data-play-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.playMode === selectedPlayMode));
    if (els.playModeHint) els.playModeHint.textContent = selectedPlayMode==='story' ? 'Prólogo y microescenas narrativas · siempre puedes saltarlas' : 'Sin escenas narrativas · directo al combate';
    if (els.homeBestScore) els.homeBestScore.textContent = p.stats.bestScore || 0;
    if (els.homeCoins) els.homeCoins.textContent = p.coins || 0;
    if (els.homeMap) els.homeMap.textContent = p.unlockedMap || 1;
    if (els.homeAchievements) els.homeAchievements.textContent = Object.keys(p.achievements || {}).length;
    const avatar = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];
    const prog = p.worldProgression || { shotTier:0, projectileSpeedTier:0, accuracyTier:0 };
    if (els.portalAvatarOrb) {
      els.portalAvatarOrb.title = `Disparo ${prog.shotTier || 0} · Velocidad ${prog.projectileSpeedTier || 0} · Precisión ${prog.accuracyTier || 0}`;
      els.portalAvatarOrb.innerHTML = `<span style="color:${avatar.color}">${avatar.icon}</span>`;
    }
    if (els.btnContinue) {
      els.btnContinue.disabled = false;
      els.btnContinue.textContent = 'CARGAR';
      els.btnContinue.classList.remove('primary-btn', 'neon');
      els.btnContinue.classList.add('soft-btn');
    }
    if (els.simpleStartHint) {
      const score = Math.round(p.stats?.bestScore || 0);
      const map = p.unlockedMap || 1;
      els.simpleStartHint.textContent = `${p.name || 'Jugador'} · récord ${score} · mundo ${map}/${MAPS.length}`;
    }
    document.body.classList.toggle('reduced-motion', !!state.settings.reducedMotion);
    document.body.classList.toggle('low-performance', !!state.settings.lowPerformance);
    renderSavedGamesList();
    renderPortalRankingPreview();
  }

  function renderProfiles() {
    els.profileList.innerHTML = state.profiles.map(p => `
      <div class="list-item">
        <div><b>${p.name}</b><small>Récord ${p.stats.bestScore || 0}  · mundo ${p.unlockedMap || 1}</small></div>
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
          ${unlocked ? `<button class="primary-btn small" data-avatar="${a.id}">${p.avatar === a.id ? 'Activo' : 'Elegir'}</button>` : `<button class="soft-btn small" disabled title="Sistema de desbloqueo pendiente">Disponible más adelante</button>`}
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
    if (!els.hangarDetail || !els.hangarPartsGrid) return;
    const p = currentProfile();
    const parts = { core: 0, wings: 0, cannon: 0, engine: 0, ...(p.shipParts || {}) };
    const info = HANGAR_PART_INFO[partId];
    const meta = SHIP_PARTS_META[partId];
    const lvl = parts[partId] || 0;
    els.hangarDetail.innerHTML = `<div class="hangar-detail-card"><b>${meta.icon} ${meta.name}</b><span class="tag">Nivel ${lvl}/6</span><p class="muted">${info.bonus}</p></div>`;
    els.hangarPartsGrid.querySelectorAll('[data-part]').forEach(card => card.classList.toggle('active', card.dataset.part === partId));
  }

  function renderHangar() {
    if (!els.hangarShipPreview || !els.hangarPartsGrid || !els.hangarTierLabel) return;
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
    if (!els.mapRoad) return;
    const p = currentProfile();
    els.mapRoad.innerHTML = MAPS.map((m, i) => {
      const unlocked = i + 1 <= p.unlockedMap;
      const complete = p.completedMaps.includes(i + 1);
      return `<article class="map-node ${unlocked ? '' : 'locked'} ${complete ? 'complete' : ''}">
        <div class="map-badge">${bossSigilHtml(i,'map-boss-sigil')}</div>
        <p class="eyebrow">Nivel ${i + 1}</p>
        <h3>${m.name}</h3>
        <p class="muted">${m.lore}</p>
        <span class="tag">${m.boss}</span>
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
    els.rankingList.innerHTML = rows.length ? `<div class="ranking-board"><div class="ranking-board-head"><span>RANK</span><span>NICKNAME</span><span>SCORE</span></div>${rows.map((r,i)=>{const avatar=AVATARS.find(a=>a.id===r.avatar)||AVATARS[0];return `<div class="rank-row ${i===0?'top':''}"><div class="rank-no">${i+1}</div><div class="rank-main"><div class="rank-ship">${avatar.icon}</div><div><b>${r.player}</b><small class="muted">Mundo ${r.map} · nivel ${r.wave} · ${r.kills} bajas</small></div></div><strong class="rank-score">${Math.round(r.score)}</strong></div>`}).join('')}</div>` : '<p class="muted">Todavía no hay partidas registradas. Inicia una misión para crear el ranking local.</p>';
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
      [bossSigilHtml(Math.min(4,Math.max(0,bossCount-1)),'map-boss-sigil'),'Jefes',`${bossCount}/${MAPS.length}`,'Jefes vencidos por territorio.'],
      ['🗺️', 'Mapas', `${(p.completedMaps || []).length}/${MAPS.length}`, 'Territorios liberados.'],
      ['🎖️', 'Logros', `${Object.keys(p.achievements || {}).length}/${ACHIEVEMENTS.length}`, 'Premios conseguidos.']
    ];
    els.collectionGrid.innerHTML = items.map(([icon, name, count, desc]) => `<article class="collection-card"><div class="avatar-symbol">${icon}</div><h3>${name}</h3><strong>${count}</strong><p class="muted">${desc}</p></article>`).join('');
  }

  function renderReplayLevels() {
    if (!els.replayWorldGrid) return;
    const p = currentProfile();
    p.levelProgress = p.levelProgress || {1:1};
    const romans = ['I','II','III','IV','V'];
    els.replayWorldGrid.innerHTML = MAPS.map((m, i) => {
      const worldNo = i + 1;
      const unlocked = worldNo <= (p.unlockedMap || 1);
      const completed = (p.completedMaps || []).includes(worldNo);
      const reachedLevel = Math.max(1, p.levelProgress[worldNo] || ((p.lastSave?.mapIndex === i) ? (p.lastSave.wave || 1) : 1));
      const maxLevel = completed ? 5 : Math.max(0, reachedLevel - 1);
      const acts = i === 0 ? WORLD_ONE_ACTS : (i === 1 ? WORLD_TWO_ACTS : null);
      const levelButtons = Array.from({length:5}, (_, idx) => {
        const level = idx + 1;
        const available = unlocked && level <= maxLevel;
        const label = level === 5 ? 'Jefe' : (acts?.[idx]?.name || `Nivel ${level}`);
        return `<button class="replay-level-btn ${available?'done':''} ${level===5?'boss':''}" data-replay-map="${i}" data-replay-level="${level}" ${available?'':'disabled'} title="${label}"><b>${level===5?bossSigilHtml(i,'replay-boss-sigil'):romans[idx]}</b><small>${label}</small></button>`;
      }).join('');
      return `<article class="replay-world-card ${unlocked?'':'locked'}">
        <div class="replay-world-head"><div class="replay-world-icon">${bossSigilHtml(i,'map-boss-sigil')}</div><div><h3>Mundo ${worldNo} · ${m.name}</h3><small>${completed?'Mundo completado':(maxLevel>0?`Niveles repetibles: ${maxLevel}/5`:'Aún no hay niveles superados')}</small></div></div>
        <div class="replay-levels">${levelButtons}</div>
      </article>`;
    }).join('');
    els.replayWorldGrid.querySelectorAll('[data-replay-map]').forEach(btn => btn.addEventListener('click', () => game.startReplay(Number(btn.dataset.replayMap), Number(btn.dataset.replayLevel))));
  }

  function renderSettings() {
    els.toggleSound.checked = !!state.settings.sound;
    els.toggleMusic.checked = !!state.settings.music;
    els.toggleShake.checked = !!state.settings.shake;
    els.toggleReduced.checked = !!state.settings.reducedMotion;
    if (els.toggleLowPerformance) els.toggleLowPerformance.checked = !!state.settings.lowPerformance;
  }

  function renderAll() {
    renderHome(); renderProfiles(); renderAvatars(); renderHangar(); renderMaps(); renderReplayLevels(); renderShop(); renderRanking(); renderAchievements(); renderCollection(); renderSettings();
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
      progresion_mundos: p.worldProgression || {},
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
    els.btnOpenPortal?.addEventListener('click', () => { requestLandscapeExperience({remember:true,source:'intro'}); showScreen('screenPortal'); });
    els.btnManageProfiles?.addEventListener('click', () => showScreen('screenProfiles'));
    els.btnSaveProfileName.addEventListener('click', () => {
      requestLandscapeExperience({remember:true,source:'mission'});
      const selected = DIFFICULTY_MODES[state.settings.difficulty] ? state.settings.difficulty : 'normal';
      const p = findOrCreateProfileByName(els.playerNameInput.value || 'Jugador');
      p.preferredDifficulty = selected;
      p.preferredPlayMode = ['story','direct'].includes(state.settings.playMode) ? state.settings.playMode : (p.preferredPlayMode || 'story');
      saveState();
      renderAll();
      const targetMap = Math.max(0, (p.unlockedMap || 1) - 1);
      startWorldOneWithNarrative(targetMap);
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
    document.querySelectorAll('[data-difficulty]').forEach(btn => btn.addEventListener('click', () => {
      const id=btn.dataset.difficulty; if(!DIFFICULTY_MODES[id])return;
      const p=currentProfile(); p.preferredDifficulty=id; state.settings.difficulty=id; saveState();
      document.querySelectorAll('[data-difficulty]').forEach(b=>b.classList.toggle('active',b===btn));
      if(els.difficultyHint) els.difficultyHint.textContent=id==='hard'?'Más enemigos, hordas y peligros · mejores recompensas':'Experiencia equilibrada actual';
    }));
    document.querySelectorAll('[data-play-mode]').forEach(btn => btn.addEventListener('click', () => {
      const id=btn.dataset.playMode; if(!['story','direct'].includes(id))return;
      const p=currentProfile(); p.preferredPlayMode=id; state.settings.playMode=id; saveState();
      document.querySelectorAll('[data-play-mode]').forEach(b=>b.classList.toggle('active',b===btn));
      if(els.playModeHint) els.playModeHint.textContent=id==='story'?'Prólogo y microescenas narrativas · siempre puedes saltarlas':'Sin escenas narrativas · directo al combate';
    }));
    els.btnStoryNext?.addEventListener('click', advanceStory);
    els.btnStorySkip?.addEventListener('click', () => closeStorySequence(true));
    els.btnLandscapeMode?.addEventListener('click', () => requestLandscapeExperience({remember:true,source:'gate'}));
    els.btnFullscreen?.addEventListener('click', toggleFullscreenExperience);
    els.btnStoryFullscreen?.addEventListener('click', toggleFullscreenExperience);
    window.addEventListener('resize',()=>{updateViewportVars();updateGlobalOrientationGate();},{passive:true});
    window.visualViewport?.addEventListener('resize',()=>{updateViewportVars();setTimeout(updateGlobalOrientationGate,30);},{passive:true});
    window.addEventListener('orientationchange',()=>{orientationTransitionUntil=Date.now()+500;setTimeout(()=>{updateViewportVars();updateGlobalOrientationGate();game?.resize?.();},180);},{passive:true});
    document.addEventListener('fullscreenchange',()=>{orientationTransitionUntil=Date.now()+500;updateViewportVars();syncFullscreenUi();setTimeout(()=>{updateViewportVars();updateGlobalOrientationGate();game?.resize?.();},100);});
    els.btnNewRun?.addEventListener('click', () => { const target=Math.max(0,(currentProfile().unlockedMap||1)-1); startWorldOneWithNarrative(target); });
    els.btnContinue?.addEventListener('click', () => {
      if (!els.savedGamesList) return;
      els.savedGamesList.classList.toggle('hidden');
      renderSavedGamesList();
    });
    els.btnPause.addEventListener('click', () => game.togglePause());
    els.btnTacticalCart?.addEventListener('click',()=>game.openTacticalShop());
    els.btnOpenTacticalShop?.addEventListener('click',()=>game.openTacticalShop());
    els.btnSkipTacticalShop?.addEventListener('click',()=>game.closeTacticalPrep());
    els.btnTacticalClose?.addEventListener('click',()=>game.closeTacticalPrep());
    els.btnTacticalContinue?.addEventListener('click',()=>game.closeTacticalPrep());
    els.tacticalShopGrid?.addEventListener('click',e=>{const btn=e.target.closest('[data-tactical-buy]');if(!btn||btn.disabled)return;game.buyTacticalOffer(btn.dataset.tacticalBuy,btn.dataset.tacticalCurrency);});
    els.pendingBadge?.addEventListener('click', () => { if ((game.pendingLevelChoices || game.offerActive) && !game.paused) game.showCards(); });
    els.btnResume.addEventListener('click', () => game.togglePause(false));
    els.btnSaveRun.addEventListener('click', () => { game.saveRun(); game.updatePauseStats(); });
    els.btnRestartMap.addEventListener('click', () => { if (confirm('¿Reiniciar este mundo desde cero?')) game.start(game.mapIndex); });
    els.btnExitRun.addEventListener('click', () => { game.saveRun(); game.running = false; AudioFX.stopMusic(); hideOverlays(); showScreen('screenPortal'); });
    els.btnBuyLifeCoins?.addEventListener('click',()=>game.buyLife('coins'));
    els.btnBuyLifeScore?.addEventListener('click',()=>game.buyLife('score'));
    els.btnBuyLifeXp?.addEventListener('click',()=>game.buyLife('xp'));
    els.btnResultContinue.addEventListener('click', () => {
      if (game.resultMode === 'replay_victory') {
        hideOverlays(); game.running=false; game.replayMode=null; showScreen('screenReplay');
      } else if (game.resultMode === 'victory') {
        hideOverlays();
        if (game.run.mapComplete && game.mapIndex + 1 < MAPS.length) {
          const carryLives = Math.min(MAX_TOTAL_LIVES - 1, game.extraLives || 0);
          const continueToNextWorld = () => {
            game.start(game.mapIndex + 1);
            game.extraLives = carryLives;
            game.updateHud();
          };
          if (game.mapIndex === 0 && getPlayMode() === 'story') showStorySequence(WORLD_ONE_STORY.outro, continueToNextWorld);
          else continueToNextWorld();
        } else showScreen('screenPortal');
      } else if (game.resultMode === 'defeat_revive') {
        game.reviveRun();
      } else {
        if(game.extraLives>0)game.reviveRun();
        else game.updateLifeShopUI();
      }
    });
    els.btnResultHome.addEventListener('click', () => {
      if (game.resultMode !== 'victory') game.finalizeRun(false);
      game.running = false;
      AudioFX.stopMusic();
      hideOverlays();
      showScreen('screenIntro');
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
      showScreen('screenIntro');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEls();
    game.init(els.gameCanvas);
    wire();
    renderAll();
    showScreen('screenIntro');
    updateGlobalOrientationGate();
    syncFullscreenUi();
    saveState();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
    }
  });
})();

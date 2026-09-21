/* ═══════════════════════════════════════════════════════════
   PequeWorld — NIVELES, GRUPOS, INSIGNIAS Y AVATARES
   ═══════════════════════════════════════════════════════════ */

/* ── AVATARES (fotos IA en assets/img/avatars) ── */
const AVATARS = [
  {id:'avatar_1', em:'👧'}, {id:'avatar_2', em:'🧒'}, {id:'avatar_3', em:'👦'},
  {id:'avatar_4', em:'👧'}, {id:'avatar_5', em:'🧒'}, {id:'avatar_6', em:'👦'},
];

/* ── 🛍️ TIENDA DE AVATARES (nuevo en v5 — se compran con monedas; +4 en v7) ── */
const SHOP_AVATARS = [
  {id:'av_lion',    name:'León Valiente',   price:100},
  {id:'av_panda',   name:'Panda Dulce',     price:100},
  {id:'av_frog',    name:'Rana Saltarina',  price:120},
  {id:'av_bunny',   name:'Conejito Suave',  price:110},
  {id:'av_fox',     name:'Zorro Astuto',    price:150},
  {id:'av_penguin', name:'Pingüino Polar',  price:150},
  {id:'av_koala',   name:'Koala Dormilón',  price:180},
  {id:'av_dino',    name:'Dino Bebé',       price:200},
  {id:'av_owl',     name:'Búho Sabio',      price:220},
  {id:'av_robot',   name:'Robot Amigo',     price:250},
  {id:'av_unicorn', name:'Unicornio Mágico',price:300},
  {id:'av_dragon',  name:'Dragoncito',      price:350},
];

/* ── 🎡 RULETA DIARIA (nuevo en v5) ── */
const SPIN_PRIZES = [
  {label:'+10 🪙',  color:'#F39C12', apply:p=>{p.coins=(p.coins||0)+10;}},
  {label:'+25 XP',  color:'#8E44AD', apply:p=>{p.xp=(p.xp||0)+25;}},
  {label:'+20 🪙',  color:'#E67E22', apply:p=>{p.coins=(p.coins||0)+20;}},
  {label:'+1 ⭐',   color:'#F1C40F', apply:p=>{p.stars=(p.stars||0)+1;}},
  {label:'+50 XP',  color:'#6C3483', apply:p=>{p.xp=(p.xp||0)+50;}},
  {label:'+15 🪙',  color:'#D35400', apply:p=>{p.coins=(p.coins||0)+15;}},
  {label:'+40 XP',  color:'#9B59B6', apply:p=>{p.xp=(p.xp||0)+40;}},
  {label:'🎉 50+⭐',color:'#E74C3C', apply:p=>{p.coins=(p.coins||0)+50;p.stars=(p.stars||0)+1;}},
];

/* ── NIVELES ── */
const LEVEL_NAMES = ['', 'Semilla 🌱', 'Explorador 🚀', 'Héroe 🌟'];
const LEVEL_AVATARS = ['', '🌱', '🚀', '🌟'];
const LEVEL_XP = [0, 0, 150, 400];

/* ── GRUPOS DE MUNDOS (para insignias de categoría) ── */
const WORLD_GROUPS = {
  letters:  ['letters_vowels', 'letters_basic', 'letters_full'],
  numbers:  ['numbers_1_10', 'numbers_11_20', 'numbers_21_30'],
  colors:   ['colors_basic', 'shapes_basic'],
  animals:  ['animals_baby', 'animals_wild'],
  phrases:  ['phrases_hello', 'greetings_pro'],
  food:     ['food_picnic', 'food_advanced', 'fruits_basic'],
  fruits:   ['fruits_basic'],
  clothes:  ['clothes_basic'],
  insects:  ['insects_basic'],
  ocean:    ['ocean_basic'],
  music:    ['music_basic'],
  sports:   ['sports_basic'],
  nature:   ['nature_basic'],
  school:   ['school_basic'],
  travel:   ['countries_basic'],
  beach:    ['at_beach'],
  events:   ['special_events'],
  farm:     ['farm_animals'],
  veggies:  ['vegetables_basic'],
  town:     ['my_town'],
};
function bestStars(p, id) { return (p.best && p.best[id]) || 0; }
function anyWorldComplete(p, groupKey, stars = 3) {
  const ids = WORLD_GROUPS[groupKey] || [];
  return ids.some(id => bestStars(p, id) >= stars);
}

/* ── INSIGNIAS (con asset de premio opcional `asset`) ── */
const BADGES = [
  // ★ PRIMEROS PASOS
  {id:'first_star', icon:'⭐', name:'Primera Estrella', desc:'Gana tu primera estrella', c:p=>(p.stars||0)>=1},
  {id:'first_10',   icon:'🎯', name:'10 Correctas',    desc:'Responde 10 preguntas correctas', c:p=>(p.stats.totalCorrect||0)>=10},
  {id:'first_50',   icon:'💪', name:'50 Correctas',    desc:'Responde 50 preguntas correctas', c:p=>(p.stats.totalCorrect||0)>=50},
  {id:'cent_100',   icon:'💯', name:'¡100 Correctas!', desc:'100 respuestas. ¡Campeón!', c:p=>(p.stats.totalCorrect||0)>=100},
  {id:'correct_250',icon:'🏅', name:'250 Correctas',   desc:'250 respuestas. ¡Imparable!', c:p=>(p.stats.totalCorrect||0)>=250},
  {id:'correct_500',icon:'🔱', name:'500 Correctas',   desc:'500 respuestas. ¡Leyenda!', c:p=>(p.stats.totalCorrect||0)>=500},
  // ★ XP
  {id:'xp_50',   icon:'✨', name:'50 XP',   desc:'Acumula 50 XP', c:p=>(p.xp||0)>=50},
  {id:'xp_200',  icon:'🌟', name:'200 XP',  desc:'Acumula 200 XP', c:p=>(p.xp||0)>=200},
  {id:'xp_500',  icon:'💫', name:'500 XP',  desc:'Acumula 500 XP', c:p=>(p.xp||0)>=500},
  {id:'xp_1000', icon:'🌠', name:'¡1000 XP!',desc:'¡1000 XP! Héroe del inglés', c:p=>(p.xp||0)>=1000},
  {id:'xp_2000', icon:'🏆', name:'¡2000 XP!',desc:'¡2000 XP! Campeón supremo', c:p=>(p.xp||0)>=2000},
  // ★ RACHAS
  {id:'streak3',  icon:'🔥', name:'Racha x3',   desc:'3 correctas seguidas', c:p=>(p.maxStreak||0)>=3},
  {id:'streak5',  icon:'🔥', name:'Racha x5',   desc:'5 seguidas. ¡Buen ritmo!', c:p=>(p.maxStreak||0)>=5},
  {id:'streak7',  icon:'🔥', name:'Racha x7',   desc:'7 seguidas. ¡Excelente!', c:p=>(p.maxStreak||0)>=7},
  {id:'streak10', icon:'💥', name:'¡Racha x10!',desc:'10 seguidas. ¡Imparable!', c:p=>(p.maxStreak||0)>=10},
  {id:'streak15', icon:'⚡', name:'¡Racha x15!',desc:'15 seguidas. ¡Increíble!', c:p=>(p.maxStreak||0)>=15},
  {id:'streak20', icon:'🌪️', name:'¡Racha x20!',desc:'20 seguidas. ¡Genio!', c:p=>(p.maxStreak||0)>=20},
  {id:'streak30', icon:'🌟', name:'¡Racha x30!',desc:'30 seguidas. ¡SUPREMO!', c:p=>(p.maxStreak||0)>=30},
  // ★ MISIONES
  {id:'mission1',  icon:'🎮', name:'Primera Misión', desc:'Completa tu primera misión', c:p=>(p.stats.missions||0)>=1},
  {id:'mission5',  icon:'🏃', name:'5 Misiones',     desc:'Completa 5 misiones', c:p=>(p.stats.missions||0)>=5},
  {id:'mission10', icon:'🦸', name:'10 Misiones',    desc:'Completa 10 misiones', c:p=>(p.stats.missions||0)>=10},
  {id:'mission25', icon:'🎖️', name:'25 Misiones',    desc:'Completa 25 misiones. ¡Héroe!', c:p=>(p.stats.missions||0)>=25},
  {id:'mission50', icon:'👑', name:'50 Misiones',    desc:'¡50 misiones completadas!', c:p=>(p.stats.missions||0)>=50},
  {id:'perfect1',  icon:'💎', name:'¡Perfecto!',     desc:'10/10 en una misión', c:p=>(p.stats.perfect||0)>=1},
  {id:'perfect3',  icon:'💠', name:'Triple Perfecto',desc:'3 misiones perfectas', c:p=>(p.stats.perfect||0)>=3},
  {id:'perfect10', icon:'👑', name:'Maestro Perfecto',desc:'10 misiones perfectas', c:p=>(p.stats.perfect||0)>=10},
  // ★ COFRES (nuevo)
  {id:'chest1',  icon:'🎁', name:'Primer Cofre',  desc:'Abre tu primer cofre sorpresa', c:p=>(p.stats.chests||0)>=1},
  {id:'chest10', icon:'🪙', name:'Cazatesoros',   desc:'Abre 10 cofres sorpresa', c:p=>(p.stats.chests||0)>=10},
  // ★ META DIARIA (nuevo)
  {id:'daily3',  icon:'📅', name:'Constancia',    desc:'Cumple tu meta diaria 3 veces', c:p=>(p.stats.dailyGoals||0)>=3},
  {id:'daily7',  icon:'🗓️', name:'Semana Perfecta',desc:'Cumple tu meta diaria 7 veces', c:p=>(p.stats.dailyGoals||0)>=7},
  // ★ MUNDOS — categorías
  {id:'world_letters', icon:'🔤', name:'Maestro Letras',   desc:'3⭐ en un mundo de Letras', c:p=>anyWorldComplete(p,'letters',3)},
  {id:'world_numbers', icon:'🔢', name:'Maestro Números',  desc:'3⭐ en un mundo de Números', c:p=>anyWorldComplete(p,'numbers',3)},
  {id:'world_animals', icon:'🦁', name:'Maestro Animales', desc:'3⭐ en un mundo de Animales', c:p=>anyWorldComplete(p,'animals',3)},
  {id:'world_colors',  icon:'🎨', name:'Maestro Colores',  desc:'3⭐ en un mundo de Colores/Formas', c:p=>anyWorldComplete(p,'colors',3)},
  {id:'world_food',    icon:'🍎', name:'Maestro Comida',   desc:'3⭐ en un mundo de Comida', c:p=>anyWorldComplete(p,'food',3)},
  // ★ MUNDOS — específicos
  {id:'world_ocean',   icon:'🌊', name:'Maestro Océano',    desc:'3⭐ en Ocean', c:p=>anyWorldComplete(p,'ocean',3)},
  {id:'world_music',   icon:'🎵', name:'Maestro Música',    desc:'3⭐ en Music', c:p=>anyWorldComplete(p,'music',3)},
  {id:'world_sports',  icon:'⚽', name:'Maestro Deportes',  desc:'3⭐ en Sports', c:p=>anyWorldComplete(p,'sports',3)},
  {id:'world_nature',  icon:'🌿', name:'Maestro Naturaleza',desc:'3⭐ en Nature o Insects', c:p=>anyWorldComplete(p,'nature',3)||anyWorldComplete(p,'insects',3)},
  {id:'world_school',  icon:'🏫', name:'Maestro Escuela',   desc:'3⭐ en School', c:p=>anyWorldComplete(p,'school',3)},
  {id:'world_travel',  icon:'🌎', name:'Viajero del Mundo', desc:'3⭐ en Countries', c:p=>bestStars(p,'countries_basic')>=3},
  {id:'world_phrases', icon:'💬', name:'Maestro Frases',    desc:'3⭐ en Greetings & Phrases', c:p=>anyWorldComplete(p,'phrases',3)},
  {id:'world_beach',   icon:'🏖️', name:'Maestro Playa',     desc:'3⭐ en At the Beach', c:p=>bestStars(p,'at_beach')>=3},
  {id:'world_events',  icon:'🎊', name:'Maestro Eventos',   desc:'3⭐ en Special Days', c:p=>bestStars(p,'special_events')>=3},
  {id:'world_fruits',  icon:'🍓', name:'Maestro Frutas',    desc:'3⭐ en Fruits', c:p=>anyWorldComplete(p,'fruits',3)},
  {id:'world_clothes', icon:'👕', name:'Maestro Ropa',      desc:'3⭐ en Clothes', c:p=>anyWorldComplete(p,'clothes',3)},
  {id:'world_insects', icon:'🐞', name:'Maestro Insectos',  desc:'3⭐ en Insects', c:p=>anyWorldComplete(p,'insects',3)},
  // ★ NIVELES
  {id:'level2', icon:'🚀', name:'Nivel 2 — Explorador', desc:'¡Alcanzaste el Nivel 2!', c:p=>(p.level||1)>=2},
  {id:'level3', icon:'🌟', name:'Nivel 3 — Héroe',      desc:'¡Alcanzaste el Nivel 3! ¡Eres héroe!', c:p=>(p.level||1)>=3},
  // ★ MONEDAS
  {id:'coins50',   icon:'🪙', name:'50 Monedas',  desc:'Colecciona 50 monedas', c:p=>(p.coins||0)>=50},
  {id:'coins200',  icon:'💰', name:'200 Monedas', desc:'Colecciona 200 monedas', c:p=>(p.coins||0)>=200},
  {id:'coins500',  icon:'💎', name:'500 Monedas', desc:'¡500 monedas! ¡Eres rico!', c:p=>(p.coins||0)>=500},
  {id:'coins1000', icon:'🏦', name:'1000 Monedas',desc:'¡1000 monedas! Fortuna dorada', c:p=>(p.coins||0)>=1000},
  // ★ EXPLORADOR
  {id:'explorer_all', icon:'🗺️', name:'Explorador Total', desc:'Juega en todos los mundos al menos 1 vez', c:p=>WORLDS.every(w=>p.best[w.id]!=null)},
  {id:'champion_all', icon:'🏆', name:'Campeón Absoluto', desc:'Obtén 3⭐ en todos los mundos', c:p=>WORLDS.every(w=>(p.best&&p.best[w.id]||0)>=3)},
  {id:'world_farm',   icon:'🐮', name:'Maestro Granja',    desc:'3⭐ en Farm Animals', c:p=>bestStars(p,'farm_animals')>=3},
  {id:'world_veggies',icon:'🥦', name:'Maestro Verduras',  desc:'3⭐ en Vegetables', c:p=>anyWorldComplete(p,'veggies',3)},
  {id:'world_town',   icon:'🏘️', name:'Maestro del Pueblo',desc:'3⭐ en My Town', c:p=>anyWorldComplete(p,'town',3)},
  // ★ JUEGOS MENTALES (nuevo en v4)
  {id:'spell1',  icon:'🔤', name:'Primer Completado', desc:'Termina un juego de Completar palabras', c:p=>(p.stats.spellGames||0)>=1},
  {id:'spell10', icon:'✏️', name:'Escriba Pequeño',  desc:'Termina 10 juegos de Completar', c:p=>(p.stats.spellGames||0)>=10},
  {id:'match1',  icon:'🧩', name:'Emparejador',      desc:'Termina un juego de Emparejar', c:p=>(p.stats.matchGames||0)>=1},
  {id:'match10', icon:'🔗', name:'Maestro del Par',  desc:'Termina 10 juegos de Emparejar', c:p=>(p.stats.matchGames||0)>=10},
  {id:'review1', icon:'🔁', name:'Repasador Estrella', desc:'Completa un repaso de errores', c:p=>(p.stats.reviews||0)>=1},
  {id:'learn10', icon:'🧠', name:'Mente Genial',     desc:'Supera 10 palabras en repasos', c:p=>(p.stats.learnedWords||0)>=10},
  {id:'learn25', icon:'🎓', name:'Sabelotodo',       desc:'Supera 25 palabras en repasos', c:p=>(p.stats.learnedWords||0)>=25},
  // ★ V5 — ruleta, tienda, memoria y escucha
  {id:'spin1',   icon:'🎡', name:'Primera Ruleta',   desc:'Gira la ruleta diaria', c:p=>(p.stats.spins||0)>=1},
  {id:'spin7',   icon:'🎰', name:'Suertudo',         desc:'Gira la ruleta 7 veces', c:p=>(p.stats.spins||0)>=7},
  {id:'shop1',   icon:'🛍️', name:'Coleccionista',    desc:'Consigue tu primer avatar de la tienda', c:p=>(p.unlockedAvatars||[]).length>=1},
  {id:'shopall', icon:'👑', name:'Gran Colección',   desc:'Consigue todos los avatares de la tienda', c:p=>(p.unlockedAvatars||[]).length>=SHOP_AVATARS.length},
  {id:'mem1',    icon:'🃏', name:'Buena Memoria',    desc:'Termina un Memorama', c:p=>(p.stats.memGames||0)>=1},
  {id:'mem10',   icon:'🧩', name:'Cerebro Fotográfico',desc:'Termina 10 Memoramas', c:p=>(p.stats.memGames||0)>=10},
  {id:'listen1', icon:'👂', name:'Oído de Oro',      desc:'Termina un juego de Escucha', c:p=>(p.stats.listenGames||0)>=1},
  {id:'listen10',icon:'🎧', name:'Oído Perfecto',    desc:'Termina 10 juegos de Escucha', c:p=>(p.stats.listenGames||0)>=10},
  // ★ V7 — voz, intruso, diccionario y diplomas
  {id:'say1',    icon:'🎤', name:'Primera Voz',       desc:'Practica tu pronunciación en Say It!', c:p=>(p.stats.sayGames||0)>=1},
  {id:'say10',   icon:'🎙️', name:'Voz de Estrella',   desc:'Completa 10 sesiones de Say It!', c:p=>(p.stats.sayGames||0)>=10},
  {id:'odd1',    icon:'🕵️', name:'Ojo de Halcón',     desc:'Termina un juego del Intruso', c:p=>(p.stats.oddGames||0)>=1},
  {id:'odd10',   icon:'🔍', name:'Maestro Detective', desc:'Termina 10 juegos del Intruso', c:p=>(p.stats.oddGames||0)>=10},
  {id:'dict1',   icon:'📚', name:'Explorador de Palabras', desc:'Abre tu Diccionario de palabras', c:p=>(p.stats.dictVisits||0)>=1},
  {id:'diploma1',icon:'🎓', name:'Graduado',          desc:'Gana tu primer diploma con 3⭐', c:p=>WORLDS.some(w=>(p.best&&p.best[w.id]||0)>=3)},
  // ★ V8 — sesión rápida, oraciones, rimas e hitos de dominio
  {id:'quick1',  icon:'⚡', name:'Sesión Rápida',   desc:'Completa tu primera sesión ⚡ Rápido de 5 minutos', c:p=>(p.stats.quickGames||0)>=1},
  {id:'quick10', icon:'⚡', name:'Ritmo Perfecto',   desc:'Completa 10 sesiones ⚡ Rápido', c:p=>(p.stats.quickGames||0)>=10},
  {id:'sent1',   icon:'🧩', name:'Mis Oraciones',    desc:'Arma tu primera oración en inglés', c:p=>(p.stats.sentGames||0)>=1},
  {id:'sent10',  icon:'📝', name:'Poeta Pequeño',    desc:'Completa 10 juegos de Oraciones', c:p=>(p.stats.sentGames||0)>=10},
  {id:'rhyme1',  icon:'🔵', name:'Oído de Poeta',    desc:'Completa un juego de Rimas', c:p=>(p.stats.rhymeGames||0)>=1},
  {id:'mile50',  icon:'🏆', name:'50 Palabras',      desc:'Domina 50 palabras (🏆 en el Diccionario)', c:p=>masteredCountSafe(p)>=50},
  {id:'mile100', icon:'💎', name:'100 Palabras',     desc:'Domina 100 palabras. ¡Increíble!', c:p=>masteredCountSafe(p)>=100},
  {id:'mile200', icon:'🌟', name:'200 Palabras',     desc:'Domina 200 palabras. ¡Leyenda!', c:p=>masteredCountSafe(p)>=200},
  // ★ DÍAS
  {id:'days3',  icon:'📅', name:'3 Días jugados', desc:'Juega en 3 días distintos', c:p=>Object.keys(p.stats.daysPlayed||{}).length>=3},
  {id:'days7',  icon:'🗓️', name:'Semana Heroica', desc:'Juega en 7 días distintos', c:p=>Object.keys(p.stats.daysPlayed||{}).length>=7},
  {id:'days14', icon:'📆', name:'2 Semanas',      desc:'Juega en 14 días distintos', c:p=>Object.keys(p.stats.daysPlayed||{}).length>=14},
  // ★ V11 — palabra del día
  {id:'wotd1', icon:'📆', name:'Palabra del Día',   desc:'Escucha tu primera Palabra del día en el mapa', c:p=>Object.keys((p.stats&&p.stats.wotdDays)||{}).length>=1},
  {id:'wotd7', icon:'🌟', name:'Semana de Palabras', desc:'Escucha la Palabra del día en 7 días distintos', c:p=>Object.keys((p.stats&&p.stats.wotdDays)||{}).length>=7},
  // ★ V12 — modo explorar (jugar sin puntos ni errores)
  {id:'explore1',  icon:'🧸', name:'Primera Exploración', desc:'Abre el Modo Explorar y toca tu primera foto', c:p=>(p.stats.exploreVisits||0)>=1},
  {id:'explore10', icon:'🔭', name:'Ojo Curioso',         desc:'Visita el Modo Explorar 10 veces', c:p=>(p.stats.exploreVisits||0)>=10},
  // ★ V13 — botón Sorpréndeme (aventura al azar)
  {id:'surprise1',  icon:'🎲', name:'Primera Sorpresa', desc:'Toca el dado Sorpréndeme y juega una misión al azar', c:p=>(p.stats.surpriseGames||0)>=1},
  {id:'surprise10', icon:'🗺️', name:'Aventurero',      desc:'Usa Sorpréndeme 10 veces. ¡Qué explorador!', c:p=>(p.stats.surpriseGames||0)>=10},
  // ★ V14 — juegos de mesa nuevos + retos del finde
  {id:'dots1',  icon:'🌟', name:'Primera Constelación', desc:'Une tu primera figura de puntos', c:p=>(p.stats.dotFigs||0)>=1},
  {id:'dots10', icon:'🪐', name:'Maestro de Puntos',    desc:'Une 10 figuras de puntos', c:p=>(p.stats.dotFigs||0)>=10},
  {id:'trace1',  icon:'🖍️', name:'Primer Trazo',       desc:'Traza tu primera letra con el dedo', c:p=>(p.stats.traceLetters||0)>=1},
  {id:'trace10', icon:'✍️', name:'Manos Mágicas',      desc:'Traza 10 letras', c:p=>(p.stats.traceLetters||0)>=10},
  {id:'puzzle1',  icon:'🧩', name:'Pieza a Pieza',     desc:'Arma tu primer rompecabezas', c:p=>(p.stats.puzzleGames||0)>=1},
  {id:'puzzle10', icon:'🏗️', name:'Mente Encajable',   desc:'Arma 10 rompecabezas', c:p=>(p.stats.puzzleGames||0)>=10},
  {id:'hang1',  icon:'🪁', name:'Detective de Palabras', desc:'Adivina tu primera palabra secreta', c:p=>(p.stats.hangWins||0)>=1},
  {id:'hang10', icon:'🔍', name:'Ojo de Águila',       desc:'Adivina 10 palabras', c:p=>(p.stats.hangWins||0)>=10},
  {id:'finde1', icon:'🏅', name:'Héroe del Finde',     desc:'Completa un reto del fin de semana', c:p=>(p.stats.finde&&p.stats.finde.total||0)>=1},
  {id:'finde3', icon:'👑', name:'Trío Perfecto',       desc:'Completa los 3 retos en un mismo finde', c:p=>(p.stats.finde&&p.stats.finde.perfect||0)>=1},
];

/* Rivales IA para el ranking */
const AI_RIVALS = [
  {name:'⭐ PequeMaestro', av:'🤖', xp:2800, stars:180, coins:950, isAI:true, title:'Campeón IA'},
  {name:'🌟 SuperSofia',  av:'👩‍🚀', xp:1850, stars:120, coins:680, isAI:true, title:'Héroe IA'},
  {name:'🚀 MegaLucas',   av:'🦸', xp:1200, stars:85,  coins:420, isAI:true, title:'Explorador IA'},
  {name:'💫 AstroKid',    av:'🌙', xp:750,  stars:52,  coins:290, isAI:true, title:'Aventurero IA'},
  {name:'🌈 MiniEinstein',av:'🧠', xp:320,  stars:22,  coins:110, isAI:true, title:'Semilla IA'},
];

/* Meta diaria */
const DAILY_GOAL_MISSIONS = 3;
const DAILY_GOAL_REWARD = {coins: 15, xp: 25};

/* v8 — hitos de palabras dominadas (álbum) */
const MILESTONES = [10, 25, 50, 100, 200, 500];
function masteredCountSafe(p) {
  try { return Object.values((p && p.mastery) || {}).filter(v => v >= 3).length; } catch (e) { return 0; }
}

/* Estado por defecto */
function defaultState() {
  return {
    active: '',
    profiles: {},
    settings: {langMode:'ENES', voiceEnabled:true, voiceRate:.82, voicePitch:1.15, voiceURI:''}
  };
}
/* Asegura los campos nuevos de v4/v5 en perfiles antiguos */
function migrateProfile(p) {
  if (!p) return;
  if (!p.mistakes) p.mistakes = {};
  if (!p.avatar) p.avatar = 'avatar_1';
  if (!p.avatarData) p.avatarData = '';
  if (!p.unlockedAvatars) p.unlockedAvatars = [];
  if (!p.lastSpin) p.lastSpin = '';
  if (!p.mastery) p.mastery = {}; // v7: veces que acierta cada palabra
  if (!p.stats) p.stats = {};
  ['missions','perfect','totalCorrect','chests','dailyGoals','spellGames','matchGames','reviews','learnedWords','memGames','listenGames','spins','avatarBought','sayGames','oddGames','dictVisits','quickGames','sentGames','rhymeGames','dictOk','dictTry','exploreVisits','surpriseGames','dotFigs','dotGames','traceLetters','puzzleGames','hangGames','hangWins'].forEach(k => {
    if (p.stats[k] == null) p.stats[k] = 0;
  });
  if (!p.stats.daysPlayed) p.stats.daysPlayed = {};
  if (!p.stats.screenHist) p.stats.screenHist = {}; // v13: minutos de uso por fecha {AAAA-MM-DD: min} para el gráfico semanal
  if (!p.stats.limitShown) p.stats.limitShown = {date:''}; // v13: aviso de límite diario ya mostrado hoy
  // v14: retos del finde {key: sábado, done:{traza,une,puz}, claimed:{...}, total, perfect}
  if (!p.stats.finde) p.stats.finde = {key:'', done:{}, claimed:{}, total:0, perfect:0};
  if (p.stats.finde.done == null) p.stats.finde.done = {};
  if (p.stats.finde.claimed == null) p.stats.finde.claimed = {};
  if (p.stats.finde.total == null) p.stats.finde.total = 0;
  if (p.stats.finde.perfect == null) p.stats.finde.perfect = 0;
  // v13: settings globales capsMode/dailyLimit NO se migran — se leen con fallback (patrón v11/v12: undefined = apagado/normal)
  if (!p.stats.missionsByDay) p.stats.missionsByDay = {}; // v7: misiones por día (gráfico)
  if (!p.stats.wotdDays) p.stats.wotdDays = {}; // v11: días en que escuchó la Palabra del día
  if (!p.stats.screenTime) p.stats.screenTime = {date:'', mins:0}; // v11: minutos de uso por día (local)
  if (!p.stats.breakShown) p.stats.breakShown = {date:''}; // v11: avisos de descanso ya mostrados hoy
  if (p.wotd === undefined) p.wotd = null; // v11: recompensa diaria de la palabra del día
  if (!p.milestones) p.milestones = {}; // v8: fechas de hitos logrados
  if (p.tourDone == null) p.tourDone = false; // v8: tour de bienvenida visto
  if (!p.dailyGoal) p.dailyGoal = {date:'', count:0, claimed:false};
  if (!p.badges) p.badges = [];
  if (!p.best) p.best = {};
}
function defaultProfile(name, avatar='avatar_1') {
  return {
    id: 'p_' + Math.random().toString(16).slice(2),
    name, avatar, avatarData: '',
    unlockedAvatars: [], lastSpin: '',
    xp:0, coins:0, stars:0, level:1,
    streak:0, maxStreak:0,
    badges: [],
    best: {},
    mistakes: {},
    mastery: {},
    stats: {missions:0, perfect:0, totalCorrect:0, chests:0, dailyGoals:0, spellGames:0, matchGames:0, reviews:0, learnedWords:0, memGames:0, listenGames:0, spins:0, avatarBought:0, sayGames:0, oddGames:0, dictVisits:0, quickGames:0, sentGames:0, rhymeGames:0, dictOk:0, dictTry:0, daysPlayed:{}, missionsByDay:{}},
    milestones: {},
    tourDone: false,
    dailyGoal: {date:'', count:0, claimed:false}
  };
}
/* v9 [C-2]: fecha LOCAL, no UTC. Antes toISOString() usaba el día UTC y en
   Colombia (UTC-5) la meta diaria, la ruleta y los hitos se reiniciaban a las
   19:00 — el niño podía girar la ruleta 2 veces en una misma tarde y el
   gráfico de actividad movía las misiones nocturnas al día siguiente. */
function localDayStr(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function todayStr() { return localDayStr(); }

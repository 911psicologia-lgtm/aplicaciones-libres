/* ═══════════════════════════════════════════════════════════
   PequeWorld — NIVELES, GRUPOS, INSIGNIAS Y AVATARES
   ═══════════════════════════════════════════════════════════ */

/* ── AVATARES (fotos IA en assets/img/avatars) ── */
const AVATARS = [
  {id:'avatar_1', em:'👧'}, {id:'avatar_2', em:'🧒'}, {id:'avatar_3', em:'👦'},
  {id:'avatar_4', em:'👧'}, {id:'avatar_5', em:'🧒'}, {id:'avatar_6', em:'👦'},
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
  // ★ JUEGOS MENTALES (nuevo en v4)
  {id:'spell1',  icon:'🔤', name:'Primer Completado', desc:'Termina un juego de Completar palabras', c:p=>(p.stats.spellGames||0)>=1},
  {id:'spell10', icon:'✏️', name:'Escriba Pequeño',  desc:'Termina 10 juegos de Completar', c:p=>(p.stats.spellGames||0)>=10},
  {id:'match1',  icon:'🧩', name:'Emparejador',      desc:'Termina un juego de Emparejar', c:p=>(p.stats.matchGames||0)>=1},
  {id:'match10', icon:'🔗', name:'Maestro del Par',  desc:'Termina 10 juegos de Emparejar', c:p=>(p.stats.matchGames||0)>=10},
  {id:'review1', icon:'🔁', name:'Repasador Estrella', desc:'Completa un repaso de errores', c:p=>(p.stats.reviews||0)>=1},
  {id:'learn10', icon:'🧠', name:'Mente Genial',     desc:'Supera 10 palabras en repasos', c:p=>(p.stats.learnedWords||0)>=10},
  {id:'learn25', icon:'🎓', name:'Sabelotodo',       desc:'Supera 25 palabras en repasos', c:p=>(p.stats.learnedWords||0)>=25},
  // ★ DÍAS
  {id:'days3',  icon:'📅', name:'3 Días jugados', desc:'Juega en 3 días distintos', c:p=>Object.keys(p.stats.daysPlayed||{}).length>=3},
  {id:'days7',  icon:'🗓️', name:'Semana Heroica', desc:'Juega en 7 días distintos', c:p=>Object.keys(p.stats.daysPlayed||{}).length>=7},
  {id:'days14', icon:'📆', name:'2 Semanas',      desc:'Juega en 14 días distintos', c:p=>Object.keys(p.stats.daysPlayed||{}).length>=14},
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

/* Estado por defecto */
function defaultState() {
  return {
    active: '',
    profiles: {},
    settings: {langMode:'ENES', voiceEnabled:true, voiceRate:.82, voicePitch:1.15}
  };
}
/* Asegura los campos nuevos de v4 en perfiles antiguos */
function migrateProfile(p) {
  if (!p) return;
  if (!p.mistakes) p.mistakes = {};
  if (!p.avatar) p.avatar = 'avatar_1';
  if (!p.avatarData) p.avatarData = '';
  if (!p.stats) p.stats = {};
  ['missions','perfect','totalCorrect','chests','dailyGoals','spellGames','matchGames','reviews','learnedWords'].forEach(k => {
    if (p.stats[k] == null) p.stats[k] = 0;
  });
  if (!p.stats.daysPlayed) p.stats.daysPlayed = {};
  if (!p.dailyGoal) p.dailyGoal = {date:'', count:0, claimed:false};
  if (!p.badges) p.badges = [];
  if (!p.best) p.best = {};
}
function defaultProfile(name, avatar='avatar_1') {
  return {
    id: 'p_' + Math.random().toString(16).slice(2),
    name, avatar, avatarData: '',
    xp:0, coins:0, stars:0, level:1,
    streak:0, maxStreak:0,
    badges: [],
    best: {},
    mistakes: {},
    stats: {missions:0, perfect:0, totalCorrect:0, chests:0, dailyGoals:0, spellGames:0, matchGames:0, reviews:0, learnedWords:0, daysPlayed:{}},
    dailyGoal: {date:'', count:0, claimed:false}
  };
}
function todayStr(){ return new Date().toISOString().slice(0,10); }

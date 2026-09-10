/* ═══════════════════════════════════════════════════════════
   PequeWorld — VOCABULARIO NIVEL 1 “Semilla” (3–5 años)
   Cada ítem lleva `img` (foto real en assets/img/words) y `em`
   como respaldo. Las fotos son reales y reconocibles.
   ═══════════════════════════════════════════════════════════ */
const WORLDS = [
  /* ── VOCALS ── */
  {id:'letters_vowels', name:'Vowels', es:'Vocales', icon:'🎤', color:'wc-letters', lvl:1, kind:'letters',
   story:'En el Bosque de las Vocales, cada sonido abre una puerta mágica. Aprende A–E–I–O–U con fotos fáciles.',
   items:[
    {en:'A',es:'A', img:'apple',    em:'🍎', hint:'A de Apple'},
    {en:'E',es:'E', img:'egg',      em:'🥚', hint:'E de Egg'},
    {en:'I',es:'I', img:'icecream', em:'🍦', hint:'I de Ice cream'},
    {en:'O',es:'O', img:'octopus',  em:'🐙', hint:'O de Octopus'},
    {en:'U',es:'U', img:'umbrella', em:'☂️', hint:'U de Umbrella'},
   ]},

  /* ── NUMBERS 1–10 ── */
  {id:'numbers_1_10', name:'Numbers 1–10', es:'Números 1–10', icon:'🐥', color:'wc-numbers', lvl:1, kind:'numbers',
   story:'En la Granja de los Números contamos con estrellas. Del 1 al 10, paso a paso.',
   items:[
    {en:'One',   es:'Uno',   num:1},
    {en:'Two',   es:'Dos',   num:2},
    {en:'Three', es:'Tres',  num:3},
    {en:'Four',  es:'Cuatro',num:4},
    {en:'Five',  es:'Cinco', num:5},
    {en:'Six',   es:'Seis',  num:6},
    {en:'Seven', es:'Siete', num:7},
    {en:'Eight', es:'Ocho',  num:8},
    {en:'Nine',  es:'Nueve', num:9},
    {en:'Ten',   es:'Diez',  num:10},
   ]},

  /* ── COLORS (basic) ── */
  {id:'colors_basic', name:'Colors', es:'Colores básicos', icon:'🌈', color:'wc-colors', lvl:1, kind:'colors',
   story:'El Arcoíris perdido necesita 4 colores para brillar. ¡Encuéntralos en las fotos!',
   items:[
    {en:'Red',   es:'Rojo',     img:'apple',  em:'🍎', color:'#e74c3c'},
    {en:'Blue',  es:'Azul',     img:'bird',   em:'🐦', color:'#3498db'},
    {en:'Yellow',es:'Amarillo', img:'banana', em:'🍌', color:'#f1c40f'},
    {en:'Green', es:'Verde',    img:'frog',   em:'🐸', color:'#2ecc71'},
   ]},

  /* ── BABY ANIMALS ── */
  {id:'animals_baby', name:'Animals', es:'Animales (bebé)', icon:'🐾', color:'wc-animals', lvl:1, kind:'words',
   story:'En el Mini-Zoo, los animales te saludan con sus caritas. Aprende los primeros 8 con fotos reales.',
   items:[
    {en:'Dog',  es:'Perro',  img:'dog',   em:'🐶'},
    {en:'Cat',  es:'Gato',   img:'cat',   em:'🐱'},
    {en:'Bird', es:'Pájaro', img:'bird',  em:'🐦'},
    {en:'Fish', es:'Pez',    img:'fish',  em:'🐟'},
    {en:'Cow',  es:'Vaca',   img:'cow',   em:'🐮'},
    {en:'Pig',  es:'Cerdo',  img:'pig',   em:'🐷'},
    {en:'Duck', es:'Pato',   img:'duck',  em:'🦆'},
    {en:'Frog', es:'Rana',   img:'frog',  em:'🐸'},
   ]},

  /* ── HELLO WORLD (phrases) ── */
  {id:'phrases_hello', name:'Hello!', es:'Saludos', icon:'👋', color:'wc-phrases', lvl:1, kind:'phrases',
   story:'En la Plaza de Saludos dices “hola”, “adiós” y las palabras mágicas. ¡Con fotos de verdad!',
   items:[
    {en:'Hello!',     es:'¡Hola!',      img:'waving',      em:'👋'},
    {en:'Bye!',       es:'¡Chao!',      img:'wavegoodbye', em:'🫶'},
    {en:'Please',     es:'Por favor',   img:'openhands',   em:'🙏'},
    {en:'Thank you!', es:'¡Gracias!',   img:'hearthands',  em:'🌟'},
    {en:'Yes',        es:'Sí',          img:'thumbsup',    em:'✅'},
    {en:'No',         es:'No',          img:'thumbsdown',  em:'⛔'},
   ]},

  /* ── EMOTIONS (basic) ── */
  {id:'emotions_basic', name:'Emotions', es:'Emociones', icon:'😊', color:'wc-phrases', lvl:1, kind:'words',
   story:'En el Jardín de las Caritas, cada emoción tiene su foto. Reconoce cómo te sientes.',
   items:[
    {en:'Happy',    es:'Feliz',      img:'face_happy',     em:'😄', hint:'Sonrisa grande'},
    {en:'Sad',      es:'Triste',     img:'face_sad',       em:'😢', hint:'Lágrimas'},
    {en:'Angry',    es:'Enojado',    img:'face_angry',     em:'😠', hint:'Ceño fruncido'},
    {en:'Scared',   es:'Asustado',   img:'face_scared',    em:'😱', hint:'¡Susto!'},
    {en:'Sleepy',   es:'Con sueño',  img:'face_sleepy',    em:'😴', hint:'Zzz'},
    {en:'Calm',     es:'Tranquilo',  img:'face_calm',      em:'😌', hint:'Respira'},
    {en:'Silly',    es:'Chistoso',   img:'face_silly',     em:'🤪', hint:'Bromista'},
    {en:'Love',     es:'Amor',       img:'face_love',      em:'😍', hint:'Ojitos de amor'},
    {en:'Hungry',   es:'Con hambre', img:'kid_eat',        em:'😋', hint:'Ñam'},
    {en:'Surprised',es:'Sorprendido',img:'face_surprised', em:'😮', hint:'¡Oh!'},
   ]},

  /* ── PETS (basic) ── */
  {id:'pets_basic', name:'Pets', es:'Mascotas', icon:'🐾', color:'wc-animals', lvl:1, kind:'words',
   story:'En la Casita de Mascotas aprendemos nombres de amigos peludos y con plumas.',
   items:[
    {en:'Dog',     es:'Perro',    img:'dog',     em:'🐶', hint:'Guau'},
    {en:'Cat',     es:'Gato',     img:'cat',     em:'🐱', hint:'Miau'},
    {en:'Fish',    es:'Pez',      img:'fish',    em:'🐠', hint:'Nada'},
    {en:'Bird',    es:'Pájaro',   img:'bird',    em:'🐦', hint:'Pío'},
    {en:'Bunny',   es:'Conejo',   img:'rabbit',  em:'🐰', hint:'Saltitos'},
    {en:'Turtle',  es:'Tortuga',  img:'turtle',  em:'🐢', hint:'Lento'},
    {en:'Hamster', es:'Hámster',  img:'hamster', em:'🐹', hint:'Ruedita'},
    {en:'Frog',    es:'Rana',     img:'frog',    em:'🐸', hint:'Croac'},
    {en:'Duck',    es:'Pato',     img:'duck',    em:'🦆', hint:'Cuac'},
    {en:'Horse',   es:'Caballo',  img:'horse',   em:'🐴', hint:'Relincha'},
   ]},

  /* ── PRINCESS (basic) ── */
  {id:'princess_basic', name:'Princess', es:'Princesas', icon:'👑', color:'wc-home', lvl:1, kind:'words',
   story:'En el Castillo de Brillo aprendemos palabras mágicas de princesa con fotos bonitas.',
   items:[
    {en:'Princess',es:'Princesa', img:'princess',em:'👸', hint:'Vestido'},
    {en:'Crown',   es:'Corona',   img:'crown',   em:'👑', hint:'Arriba'},
    {en:'Castle',  es:'Castillo', img:'castle',  em:'🏰', hint:'Torres'},
    {en:'Dress',   es:'Vestido',  img:'dress',   em:'👗', hint:'Ropa'},
    {en:'Ring',    es:'Anillo',   img:'ring',    em:'💍', hint:'Brilla'},
    {en:'Star',    es:'Estrella', img:'star',    em:'⭐', hint:'En el cielo'},
    {en:'Magic',   es:'Magia',    img:'wand',    em:'✨', hint:'Chispas'},
    {en:'Fairy',   es:'Hada',     img:'fairy',   em:'🧚', hint:'Alitas'},
    {en:'Flower',  es:'Flor',     img:'flower',  em:'🌸', hint:'Perfume'},
    {en:'Heart',   es:'Corazón',  img:'heart',   em:'💖', hint:'Cariño'},
   ]},

  /* ── SUPERHERO (basic) ── */
  {id:'superhero_basic', name:'Superheroes', es:'Superhéroes', icon:'🦸', color:'wc-words', lvl:1, kind:'words',
   story:'En la Ciudad Valiente practicamos palabras de superhéroes para ayudar a todos.',
   items:[
    {en:'Hero',   es:'Héroe',     img:'herokid',   em:'🦸', hint:'Valiente'},
    {en:'Cape',   es:'Capa',      img:'cape',      em:'🧣', hint:'Vuela'},
    {en:'Mask',   es:'Máscara',   img:'mask',      em:'🎭', hint:'Oculta'},
    {en:'Power',  es:'Poder',     img:'lightning', em:'💥', hint:'¡Boom!'},
    {en:'Shield', es:'Escudo',    img:'shield',    em:'🛡️', hint:'Protege'},
    {en:'Speed',  es:'Velocidad', img:'racecar',   em:'⚡', hint:'Rápido'},
    {en:'Strong', es:'Fuerte',    img:'strongarm', em:'💪', hint:'Músculos'},
    {en:'Save',   es:'Salvar',    img:'ambulance', em:'🆘', hint:'Ayuda'},
    {en:'City',   es:'Ciudad',    img:'city',      em:'🏙️', hint:'Edificios'},
    {en:'Team',   es:'Equipo',    img:'handshake', em:'🤝', hint:'Juntos'},
   ]},

  /* ── UNIVERSE (basic) ── */
  {id:'universe_basic', name:'Universe', es:'Universo', icon:'🌙', color:'wc-weather', lvl:1, kind:'words',
   story:'En el Mini-Espacio miramos el cielo: sol, luna y estrellas.',
   items:[
    {en:'Sun',    es:'Sol',     img:'sun',      em:'☀️', hint:'Calienta'},
    {en:'Moon',   es:'Luna',    img:'moon',     em:'🌙', hint:'Noche'},
    {en:'Star',   es:'Estrella',img:'star',     em:'🌟', hint:'Brilla'},
    {en:'Planet', es:'Planeta', img:'planet',   em:'🪐', hint:'Rueda'},
    {en:'Rocket', es:'Cohete',  img:'rocket',   em:'🚀', hint:'Despega'},
    {en:'Space',  es:'Espacio', img:'galaxy',   em:'🌌', hint:'Oscuro'},
    {en:'Alien',  es:'Alien',   img:'alien',    em:'👽', hint:'Extraño'},
    {en:'Cloud',  es:'Nube',    img:'cloud',    em:'☁️', hint:'Blanca'},
    {en:'Light',  es:'Luz',     img:'lamp',     em:'💡', hint:'Enciende'},
    {en:'Night',  es:'Noche',   img:'nightsky', em:'🌃', hint:'Dormir'},
   ]},

  /* ── DINOSAURS (basic) ── */
  {id:'dinos_basic', name:'Dinosaurs', es:'Dinosaurios', icon:'🦖', color:'wc-animals', lvl:1, kind:'words',
   story:'En el Valle Dino aprendemos nombres simples de dinosaurios.',
   items:[
    {en:'Dino',       es:'Dino',        img:'dinosaur',   em:'🦕', hint:'Gigante'},
    {en:'T-Rex',      es:'T-Rex',       img:'trex',       em:'🦖', hint:'Fuerte'},
    {en:'Triceratops',es:'Triceratops', img:'triceratops',em:'🦏', hint:'Cuernos'},
    {en:'Egg',        es:'Huevo',       img:'egg',        em:'🥚', hint:'Nace'},
    {en:'Fossil',     es:'Fósil',       img:'fossil',     em:'🦴', hint:'Hueso'},
    {en:'Bones',      es:'Huesos',      img:'skeleton',   em:'🦴', hint:'Esqueleto'},
    {en:'Volcano',    es:'Volcán',      img:'volcano',    em:'🌋', hint:'Lava'},
    {en:'Jungle',     es:'Selva',       img:'jungle',     em:'🌴', hint:'Árboles'},
    {en:'Track',      es:'Huella',      img:'footprint',  em:'👣', hint:'Pasos'},
    {en:'Roar',       es:'Rugido',      img:'lion',       em:'🗣️', hint:'¡Rooo!'},
   ]},

  /* ── ELEMENTS (basic) ── */
  {id:'elements_basic', name:'Elements', es:'Elementos', icon:'🌊', color:'wc-weather', lvl:1, kind:'words',
   story:'En la Isla de los Elementos jugamos con agua, fuego, aire y tierra.',
   items:[
    {en:'Water',es:'Agua',  img:'water',em:'💧', hint:'Gotas'},
    {en:'Fire', es:'Fuego', img:'fire', em:'🔥', hint:'Caliente'},
    {en:'Air',  es:'Aire',  img:'kite', em:'💨', hint:'Sopla'},
    {en:'Earth',es:'Tierra',img:'globe',em:'🌍', hint:'Planeta'},
    {en:'Rock', es:'Roca',  img:'rock', em:'🪨', hint:'Dura'},
    {en:'Leaf', es:'Hoja',  img:'leaf', em:'🍃', hint:'Verde'},
    {en:'Snow', es:'Nieve', img:'snow', em:'❄️', hint:'Fría'},
    {en:'Rain', es:'Lluvia',img:'rain', em:'🌧️', hint:'Cae'},
    {en:'Sun',  es:'Sol',   img:'sun',  em:'🔆', hint:'Brilla'},
    {en:'Cloud',es:'Nube',  img:'cloud',em:'🌫️', hint:'Gris'},
   ]},

  /* ── TOYS (basic) ── */
  {id:'toys_basic', name:'Toys', es:'Juguetes', icon:'🧸', color:'wc-words', lvl:1, kind:'words',
   story:'En el Cuarto de Juegos cada juguete tiene su nombre en inglés.',
   items:[
    {en:'Ball',   es:'Pelota',       img:'ball',   em:'⚽', hint:'Rueda'},
    {en:'Doll',   es:'Muñeca',       img:'doll',   em:'🪆', hint:'Jugar'},
    {en:'Car',    es:'Carro',        img:'car',    em:'🚗', hint:'Brrm'},
    {en:'Blocks', es:'Bloques',      img:'blocks', em:'🧱', hint:'Construir'},
    {en:'Teddy',  es:'Osito',        img:'teddy',  em:'🧸', hint:'Abrazo'},
    {en:'Puzzle', es:'Rompecabezas', img:'puzzle', em:'🧩', hint:'Encaja'},
    {en:'Robot',  es:'Robot',        img:'robot',  em:'🤖', hint:'Bip'},
    {en:'Train',  es:'Tren',         img:'train',  em:'🚂', hint:'Choo'},
    {en:'Kite',   es:'Cometa',       img:'kite',   em:'🪁', hint:'Vuela'},
    {en:'Drum',   es:'Tambor',       img:'drum',   em:'🥁', hint:'Bum'},
   ]},

  /* ── BIRTHDAY (basic) ── */
  {id:'birthday_basic', name:'Birthday', es:'Cumpleaños', icon:'🎉', color:'wc-food', lvl:1, kind:'words',
   story:'En la Fiesta Feliz aprendemos palabras de cumpleaños.',
   items:[
    {en:'Birthday',es:'Cumpleaños',img:'cake',     em:'🎂', hint:'Pastel'},
    {en:'Cake',    es:'Torta',     img:'cupcake',  em:'🍰', hint:'Dulce'},
    {en:'Candle',  es:'Vela',      img:'candle',   em:'🕯️', hint:'Luz'},
    {en:'Balloon', es:'Globo',     img:'balloon',  em:'🎈', hint:'Sube'},
    {en:'Gift',    es:'Regalo',    img:'gift',     em:'🎁', hint:'Sorpresa'},
    {en:'Party',   es:'Fiesta',    img:'confetti', em:'🎉', hint:'¡Woo!'},
    {en:'Hat',     es:'Gorro',     img:'partyhat', em:'🥳', hint:'Celebrar'},
    {en:'Music',   es:'Música',    img:'notes',    em:'🎵', hint:'Suena'},
    {en:'Dance',   es:'Bailar',    img:'kid_dance',em:'💃', hint:'Mover'},
    {en:'Smile',   es:'Sonreír',   img:'face_happy',em:'😁', hint:'Feliz'},
   ]},

  /* ── JOBS (basic) ── */
  {id:'jobs_basic', name:'Jobs', es:'Trabajos', icon:'👷', color:'wc-home', lvl:1, kind:'words',
   story:'En la Ciudad de Oficios conocemos profesiones con fotos claras.',
   items:[
    {en:'Doctor',     es:'Doctor',    img:'doctor',       em:'🩺', hint:'Salud'},
    {en:'Teacher',    es:'Profesora', img:'teacher',      em:'👩‍🏫', hint:'Escuela'},
    {en:'Chef',       es:'Chef',      img:'chef',         em:'👨‍🍳', hint:'Cocina'},
    {en:'Farmer',     es:'Granjero',  img:'farmer',       em:'👩‍🌾', hint:'Campo'},
    {en:'Police',     es:'Policía',   img:'police',       em:'👮', hint:'Orden'},
    {en:'Firefighter',es:'Bombero',   img:'firefighter',  em:'👩‍🚒', hint:'Fuego'},
    {en:'Driver',     es:'Conductor', img:'bus',          em:'🚌', hint:'Maneja'},
    {en:'Artist',     es:'Artista',   img:'paintpalette', em:'🎨', hint:'Pinta'},
    {en:'Builder',    es:'Constructor',img:'builder',     em:'👷', hint:'Obra'},
    {en:'Nurse',      es:'Enfermera', img:'nurse',        em:'🧑‍⚕️', hint:'Cuida'},
   ]},

  /* ── 🎵 MÚSICA ── */
  {id:'music_basic', name:'Music', es:'Música', icon:'🎵', color:'wc-phrases', lvl:1, kind:'words',
   story:'En el Estudio Musical aprendemos instrumentos y sonidos con fotos.',
   items:[
    {en:'Piano',  es:'Piano',    img:'piano',      em:'🎹', hint:'Teclas'},
    {en:'Guitar', es:'Guitarra', img:'guitar',     em:'🎸', hint:'Cuerdas'},
    {en:'Drum',   es:'Tambor',   img:'drum',       em:'🥁', hint:'Golpea'},
    {en:'Flute',  es:'Flauta',   img:'flute',      em:'🎶', hint:'Sopla'},
    {en:'Violin', es:'Violín',   img:'violin',     em:'🎻', hint:'Arco'},
    {en:'Trumpet',es:'Trompeta', img:'trumpet',    em:'🎺', hint:'¡Tuuu!'},
    {en:'Music',  es:'Música',   img:'notes',      em:'🎵', hint:'Suena'},
    {en:'Song',   es:'Canción',  img:'microphone', em:'🎤', hint:'Canta'},
    {en:'Dance',  es:'Baile',    img:'kid_dance',  em:'🕺', hint:'Muévete'},
    {en:'Beat',   es:'Ritmo',    img:'clapping',   em:'👏', hint:'Aplaude'},
   ]},

  /* ── 🌊 OCEAN ── */
  {id:'ocean_basic', name:'Ocean', es:'El Océano', icon:'🌊', color:'wc-ocean', lvl:1, kind:'words',
   story:'Bajo el mar hay un mundo increíble. Aprende sus habitantes con fotos fascinantes.',
   items:[
    {en:'Shark',    es:'Tiburón',         img:'shark',    em:'🦈', hint:'Peligroso'},
    {en:'Whale',    es:'Ballena',         img:'whale',    em:'🐳', hint:'Gigante'},
    {en:'Dolphin',  es:'Delfín',          img:'dolphin',  em:'🐬', hint:'Salta'},
    {en:'Crab',     es:'Cangrejo',        img:'crab',     em:'🦀', hint:'Pinzas'},
    {en:'Turtle',   es:'Tortuga',         img:'turtle',   em:'🐢', hint:'Lenta'},
    {en:'Fish',     es:'Pez',             img:'fish',     em:'🐠', hint:'Nada'},
    {en:'Octopus',  es:'Pulpo',           img:'octopus',  em:'🐙', hint:'8 brazos'},
    {en:'Star fish',es:'Estrella de mar', img:'starfish', em:'⭐', hint:'Plana'},
    {en:'Sea horse',es:'Caballito de mar',img:'seahorse', em:'🐴', hint:'Pequeño'},
    {en:'Lobster',  es:'Langosta',        img:'lobster',  em:'🦞', hint:'Roja'},
   ]},

  /* ── 🎨 SHAPES & COLORS+ ── */
  {id:'shapes_basic', name:'Shapes', es:'Formas', icon:'🔷', color:'wc-colors', lvl:1, kind:'words',
   story:'En el Taller de Formas aprendemos figuras y colores nuevos con fotos simples.',
   items:[
    {en:'Circle', es:'Círculo',  img:'ball',   em:'⭕', hint:'Redondo'},
    {en:'Square', es:'Cuadrado', img:'gift',   em:'🟦', hint:'4 lados'},
    {en:'Triangle',es:'Triángulo',img:'tent',  em:'🔺', hint:'3 lados'},
    {en:'Star',   es:'Estrella', img:'star',   em:'⭐', hint:'Punta'},
    {en:'Heart',  es:'Corazón',  img:'heart',  em:'❤️', hint:'Amor'},
    {en:'Diamond',es:'Diamante', img:'gem',    em:'💎', hint:'Brilla'},
    {en:'Orange', es:'Naranja',  img:'orange', em:'🟠', hint:'Color'},
    {en:'Pink',   es:'Rosado',   img:'flower', em:'🩷', hint:'Color'},
    {en:'Purple', es:'Morado',   img:'grapes', em:'🟣', hint:'Color'},
    {en:'White',  es:'Blanco',   img:'cloud',  em:'⬜', hint:'Color'},
   ]},

  /* ── 🌍 MY WORLD ── */
  {id:'my_world', name:'My World', es:'Mi mundo', icon:'🌍', color:'wc-animals', lvl:1, kind:'words',
   story:'En Mi Pequeño Mundo aprendemos las cosas que nos rodean cada día.',
   items:[
    {en:'House', es:'Casa',    img:'house',  em:'🏠', hint:'Vivir'},
    {en:'School',es:'Escuela', img:'school', em:'🏫', hint:'Aprender'},
    {en:'Park',  es:'Parque',  img:'park',   em:'🌳', hint:'Jugar'},
    {en:'Store', es:'Tienda',  img:'store',  em:'🏪', hint:'Comprar'},
    {en:'Church',es:'Iglesia', img:'church', em:'⛪', hint:'Rezar'},
    {en:'Street',es:'Calle',   img:'street', em:'🛣️', hint:'Caminar'},
    {en:'Sky',   es:'Cielo',   img:'cloud',  em:'🌤️', hint:'Arriba'},
    {en:'River', es:'Río',     img:'river',  em:'🏞️', hint:'Agua'},
    {en:'Bridge',es:'Puente',  img:'bridge', em:'🌉', hint:'Cruza'},
    {en:'Garden',es:'Jardín',  img:'garden', em:'🌷', hint:'Flores'},
   ]},

  /* ── 🦁 WILD ANIMALS ── */
  {id:'animals_wild', name:'Wild Animals', es:'Animales salvajes', icon:'🦁', color:'wc-animals', lvl:1, kind:'words',
   story:'En la Selva Safari descubrimos los animales más salvajes y maravillosos del mundo.',
   items:[
    {en:'Lion',    es:'León',     img:'lion',     em:'🦁', hint:'Ruge'},
    {en:'Elephant',es:'Elefante', img:'elephant', em:'🐘', hint:'Grande'},
    {en:'Monkey',  es:'Mono',     img:'monkey',   em:'🐒', hint:'Salta'},
    {en:'Tiger',   es:'Tigre',    img:'tiger',    em:'🐯', hint:'Rayas'},
    {en:'Zebra',   es:'Cebra',    img:'zebra',    em:'🦓', hint:'Líneas'},
    {en:'Giraffe', es:'Jirafa',   img:'giraffe',  em:'🦒', hint:'Cuello largo'},
    {en:'Bear',    es:'Oso',      img:'bear',     em:'🐻', hint:'Miel'},
    {en:'Penguin', es:'Pingüino', img:'penguin',  em:'🐧', hint:'Hielo'},
    {en:'Fox',     es:'Zorro',    img:'fox',      em:'🦊', hint:'Astuto'},
    {en:'Wolf',    es:'Lobo',     img:'wolf',     em:'🐺', hint:'Aúlla'},
   ]},

  /* ── 🍓 FRUITS (nuevo) ── */
  {id:'fruits_basic', name:'Fruits', es:'Frutas', icon:'🍓', color:'wc-food', lvl:1, kind:'words',
   story:'En la Frutería Dulce aprendemos las frutas más ricas con fotos deliciosas.',
   items:[
    {en:'Apple',    es:'Manzana',  img:'apple',     em:'🍎'},
    {en:'Banana',   es:'Banano',   img:'banana',    em:'🍌'},
    {en:'Orange',   es:'Naranja',  img:'orange',    em:'🍊'},
    {en:'Strawberry',es:'Fresa',   img:'strawberry',em:'🍓'},
    {en:'Watermelon',es:'Sandía',  img:'watermelon',em:'🍉'},
    {en:'Grapes',   es:'Uvas',     img:'grapes',    em:'🍇'},
    {en:'Pear',     es:'Pera',     img:'pear',      em:'🍐'},
    {en:'Pineapple',es:'Piña',     img:'pineapple', em:'🍍'},
    {en:'Mango',    es:'Mango',    img:'mango',     em:'🥭'},
    {en:'Cherry',   es:'Cereza',   img:'cherry',    em:'🍒'},
   ]},
];

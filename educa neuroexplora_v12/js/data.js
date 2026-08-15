/**
 * NeuroExplora — data.js  v1.1
 * Datos pedagógicos de las regiones cerebrales.
 * Niveles: niños desde 7 años / jóvenes / adultos.
 * Cada región incluye 3 datos curiosos mínimo.
 */

const BRAIN_REGIONS = [
  {
    id: 'frontal',
    name: 'Lóbulo Frontal',
    short: 'Frontal',
    color: '#FF6B6B',
    emoji: '🧠',
    tagline: 'El director de tu cerebro',
    description: 'El lóbulo frontal es la región más grande de la corteza cerebral y la que más nos diferencia de otros mamíferos. Aloja las funciones ejecutivas: planificación, razonamiento abstracto, toma de decisiones y control de impulsos. También es la sede de la personalidad, la creatividad y la capacidad de anticipar consecuencias.',
    childExplanation: '¡Es como el capitán de un equipo! Decide qué hacer, cómo hacerlo y cuándo parar. Cuando te controlas para no interrumpir a alguien que está hablando, es tu lóbulo frontal trabajando.',
    skills: ['Pensamiento crítico', 'Planificación', 'Toma de decisiones', 'Control de impulsos', 'Personalidad', 'Creatividad'],
    funFacts: [
      { icon: '⏳', text: 'El lóbulo frontal sigue madurando hasta los 25 años. Por eso los adolescentes suelen tomar decisiones más impulsivas — su "director cerebral" todavía está en construcción.' },
      { icon: '🐵', text: 'Representa el 29% de la corteza humana. En los chimpancés, nuestros parientes más cercanos, ocupa apenas el 17%. Esa diferencia explica en parte lo que nos hace únicos como especie.' },
      { icon: '🎭', text: 'El caso de Phineas Gage (1848) es legendario: sobrevivió a una barra de hierro que le atravesó el cráneo, pero su personalidad cambió completamente. Fue la primera evidencia de que el lóbulo frontal controla el carácter.' }
    ],
    connections: ['motor', 'broca', 'prefrontal'],
    layer: 0
  },
  {
    id: 'parietal',
    name: 'Lóbulo Parietal',
    short: 'Parietal',
    color: '#A78BFA',
    emoji: '✋',
    tagline: 'Tu mapa del cuerpo y el espacio',
    description: 'El lóbulo parietal integra información sensorial del cuerpo —temperatura, presión, dolor, tacto fino— con información espacial del entorno. Coordina la percepción de la posición corporal en el espacio, los cálculos matemáticos y la atención visoespacial. Contiene la corteza somatosensorial primaria.',
    childExplanation: '¡Es como un GPS superdetallado! Sabe exactamente dónde está cada parte de tu cuerpo aunque tengas los ojos cerrados. Por eso puedes tocarte la nariz en la oscuridad sin fallar.',
    skills: ['Sensaciones corporales', 'Orientación espacial', 'Matemáticas', 'Integración sensorial', 'Atención'],
    funFacts: [
      { icon: '🔬', text: 'El cerebro de Einstein fue analizado post-mortem y los científicos descubrieron que su lóbulo parietal era un 15% más ancho que el promedio — precisamente la región más activa en el razonamiento matemático y espacial.' },
      { icon: '🗺️', text: 'Los taxistas de Londres, que memorizan más de 25.000 calles, desarrollan el lóbulo parietal de manera measurable. Los estudios de neuroimagen muestran cambios físicos reales en su cerebro respecto a la población general.' },
      { icon: '✂️', text: 'Un daño en el parietal derecho puede causar "negligencia espacial unilateral": la persona ignora todo lo que está a su izquierda — come solo la mitad del plato y se afeita solo la mitad de la cara, sin percatarse.' }
    ],
    connections: ['motor', 'somatosensory'],
    layer: 0
  },
  {
    id: 'occipital',
    name: 'Lóbulo Occipital',
    short: 'Occipital',
    color: '#34D399',
    emoji: '👁️',
    tagline: 'Tu pantalla de alta definición',
    description: 'El lóbulo occipital aloja la corteza visual primaria y las áreas visuales de asociación. Procesa color, forma, movimiento, profundidad y orientación espacial de los objetos. A pesar de estar en la parte posterior del cráneo, recibe toda la información que entra por los ojos mediante el nervio óptico.',
    childExplanation: '¡Es la pantalla 4K de tu cerebro! Los ojos capturan la luz, pero es esta zona la que convierte esas señales en las imágenes coloridas que ves. Sin ella, verías pero no entenderías lo que ves.',
    skills: ['Visión', 'Reconocimiento de colores', 'Detección de movimiento', 'Reconocimiento de formas', 'Lectura'],
    funFacts: [
      { icon: '⚡', text: 'El lóbulo occipital procesa imágenes en apenas 13 milisegundos — mucho más rápido que un parpadeo. Tu cerebro "ve" y reacciona antes de que seas consciente de ello.' },
      { icon: '🔀', text: 'La información visual llega cruzada: lo que ves a tu izquierda es procesado por el hemisferio derecho, y viceversa. Los nervios ópticos se cruzan en el quiasma óptico, justo bajo la base del cerebro.' },
      { icon: '💤', text: 'Durante los sueños, el lóbulo occipital se activa casi igual que cuando estás despierto. Tu cerebro "ve" imágenes generadas internamente aunque los ojos estén cerrados — por eso los sueños parecen tan reales.' }
    ],
    connections: ['parietal', 'temporal'],
    layer: 0
  },
  {
    id: 'temporal',
    name: 'Lóbulo Temporal',
    short: 'Temporal',
    color: '#38BDF8',
    emoji: '👂',
    tagline: 'Sonidos, memoria y emociones',
    description: 'El lóbulo temporal procesa el lenguaje auditivo y aloja estructuras clave: el hipocampo (formación de nuevos recuerdos), la amígdala (emociones y respuesta al miedo) y el área de Wernicke (comprensión del lenguaje). También participa en el reconocimiento de rostros y la memoria episódica.',
    childExplanation: '¡Es tu gran archivo personal! Guarda los recuerdos más importantes, entiende lo que escuchas y registra cómo te sientes. Cada vez que recuerdas un momento feliz, esta zona se activa.',
    skills: ['Audición', 'Comprensión del lenguaje', 'Memoria a largo plazo', 'Emociones', 'Reconocimiento de rostros'],
    funFacts: [
      { icon: '🌱', text: 'El hipocampo, alojado en el lóbulo temporal, es uno de los pocos lugares donde nacen neuronas nuevas en el cerebro adulto. El ejercicio físico y el aprendizaje continuo aceleran este proceso de neurogénesis.' },
      { icon: '🎵', text: 'Una canción puede traer de golpe un recuerdo preciso con toda su carga emocional. Este "efecto Proust" ocurre porque la música activa simultáneamente el lóbulo temporal y el sistema límbico emocional.' },
      { icon: '😨', text: 'La amígdala puede "secuestrar" momentáneamente al lóbulo frontal ante una amenaza: reaccionas emocionalmente antes de pensar con lógica. Es el llamado "secuestro amigdalar" — un mecanismo de supervivencia primitivo.' }
    ],
    connections: ['wernicke', 'frontal'],
    layer: 0
  },
  {
    id: 'motor',
    name: 'Corteza Motora Primaria',
    short: 'C. Motora',
    color: '#FB923C',
    emoji: '🤸',
    tagline: 'El comandante del movimiento',
    description: 'Ubicada en el giro precentral, justo por delante del surco central, la corteza motora primaria envía órdenes directas a los músculos voluntarios de todo el cuerpo. Cada músculo tiene una representación topográfica precisa — el "homúnculo motor" descrito por Wilder Penfield.',
    childExplanation: '¡Es el control remoto de tus músculos! Cuando decides mover un dedo, aquí se genera la señal eléctrica que viaja por la médula espinal hasta mover exactamente ese dedo y no otro.',
    skills: ['Movimiento voluntario', 'Control fino de las manos', 'Escritura', 'Expresión facial', 'Coordinación'],
    funFacts: [
      { icon: '🖐️', text: 'El "homúnculo motor" de Penfield muestra que las manos y los labios tienen una representación cerebral enorme. Por eso los humanos tenemos movimientos de manos tan precisos — somos campeones mundiales en destreza manual.' },
      { icon: '❌', text: 'La corteza motora izquierda controla el lado derecho del cuerpo, y viceversa. Las señales se cruzan en el bulbo raquídeo — por eso un derrame en el hemisferio izquierdo puede paralizar el lado derecho del cuerpo.' },
      { icon: '🏅', text: 'Los músicos profesionales tienen una zona de representación de los dedos notablemente mayor en su corteza motora. El cerebro se reorganiza físicamente con la práctica intensa — esto se llama neuroplasticidad dependiente de experiencia.' }
    ],
    connections: ['frontal', 'somatosensory'],
    layer: 1
  },
  {
    id: 'somatosensory',
    name: 'Corteza Somatosensorial',
    short: 'C. Sensorial',
    color: '#FBBF24',
    emoji: '🌡️',
    tagline: 'Tu radar de sensaciones',
    description: 'Ubicada en el giro postcentral, inmediatamente detrás del surco central, esta corteza recibe y procesa todas las sensaciones corporales: tacto, presión, temperatura, dolor y propiocepción. Trabaja en íntima coordinación con la corteza motora, con quien comparte el "surco central" como frontera.',
    childExplanation: '¡Imagina millones de sensores en todo tu cuerpo, enviando mensajes aquí! Cuando tocas algo suave, rugoso, caliente o frío, esta zona recibe el mensaje y lo interpreta en milisegundos.',
    skills: ['Tacto fino', 'Temperatura', 'Dolor', 'Presión', 'Propiocepción'],
    funFacts: [
      { icon: '💋', text: 'Los labios y las yemas de los dedos tienen densidades altísimas de receptores táctiles — y en consecuencia, representaciones enormes aquí. Un centímetro cuadrado de labio tiene más neuronas sensoriales que toda la espalda.' },
      { icon: '👻', text: 'El síndrome del "miembro fantasma" ocurre porque esta corteza sigue representando un brazo o pierna amputada. Las personas sienten dolor real en una extremidad que ya no existe — el mapa neurológico persiste tras la amputación.' },
      { icon: '🧊', text: 'Esta corteza puede distinguir dos puntos de contacto separados apenas 2 mm en las yemas de los dedos. En la espalda, necesitan estar a más de 4 cm de distancia para ser percibidos como dos estímulos distintos.' }
    ],
    connections: ['parietal', 'motor'],
    layer: 1
  },
  {
    id: 'broca',
    name: 'Área de Broca',
    short: 'Broca',
    color: '#F9A8D4',
    emoji: '💬',
    tagline: 'La fábrica del habla',
    description: 'Localizada en el opérculo frontal del hemisferio izquierdo, el área de Broca es fundamental para la producción del lenguaje hablado. Coordina la programación motora del habla, procesa la gramática y la sintaxis, y conecta el pensamiento con la expresión verbal fluida.',
    childExplanation: '¡Es como el editor de voz de tu cerebro! Toma la idea que quieres decir y la organiza en palabras con el orden correcto. Sin ella, sabrías qué quieres comunicar pero no podrías decirlo.',
    skills: ['Producción del habla', 'Fluidez verbal', 'Gramática', 'Sintaxis', 'Articulación'],
    funFacts: [
      { icon: '🔬', text: 'Paul Broca la descubrió en 1861 estudiando a "Tan" — un paciente que solo pronunciaba esa sílaba. Fue el primer mapa funcional preciso del cerebro humano y marcó el nacimiento de la neurología moderna.' },
      { icon: '🎸', text: 'El área de Broca se activa también al tocar instrumentos musicales y al observar gestos. Forma parte del sistema de "neuronas espejo" — las mismas células que te permiten aprender imitando a otros.' },
      { icon: '🗣️', text: 'Las personas bilingües que aprendieron el segundo idioma de adultos activan zonas adyacentes al área de Broca para ese idioma. Quienes lo aprendieron de niños procesan ambas lenguas en exactamente la misma región.' }
    ],
    connections: ['frontal', 'wernicke'],
    layer: 2
  },
  {
    id: 'wernicke',
    name: 'Área de Wernicke',
    short: 'Wernicke',
    color: '#2DD4BF',
    emoji: '🎧',
    tagline: 'El intérprete del lenguaje',
    description: 'Ubicada en la unión del lóbulo temporal con el parietal (hemisferio izquierdo), el área de Wernicke procesa el significado del lenguaje hablado y escrito. Se conecta con el área de Broca a través del fascículo arqueado, formando el circuito principal del lenguaje humano.',
    childExplanation: '¡Es tu traductor automático! Cuando alguien te habla, esta zona descifra el significado de cada palabra. Sin ella, el lenguaje sería como escuchar un idioma que no conoces — sonidos sin sentido.',
    skills: ['Comprensión del lenguaje', 'Significado de palabras', 'Comprensión lectora', 'Procesamiento auditivo'],
    funFacts: [
      { icon: '🤪', text: 'Una lesión en Wernicke produce "afasia fluente": la persona habla con fluidez normal, pero lo que dice carece de sentido lógico. Puede decir "el cielo es muy silla" sin notar ningún error — el habla es fluida pero el significado se pierde.' },
      { icon: '📡', text: 'Wernicke y Broca están conectadas por el fascículo arqueado, un haz de fibras de unos 10 cm. Dañar solo esta conexión produce "afasia de conducción": la persona entiende y habla, pero no puede repetir lo que acaba de escuchar.' },
      { icon: '📖', text: 'Cuando lees en silencio, el área de Wernicke se activa casi igual que cuando escuchas hablar. Tu cerebro convierte los símbolos escritos en "sonido mental" para comprenderlos — la lectura es básicamente audición interna.' }
    ],
    connections: ['temporal', 'broca'],
    layer: 2
  },
  {
    id: 'cerebellum',
    name: 'Cerebelo',
    short: 'Cerebelo',
    color: '#6EE7B7',
    emoji: '⚖️',
    tagline: 'Maestro del movimiento y el equilibrio',
    description: 'El cerebelo coordina y afina todos los movimientos voluntarios: suavidad, precisión, temporización. Gestiona el equilibrio y la postura corporal. Participa crucialmente en el aprendizaje motor procedimental — la memoria de habilidades físicas adquiridas por repetición.',
    childExplanation: '¡Es el coreógrafo de tu cuerpo! Cuando aprendes a andar en bicicleta y al principio te caes, es porque el cerebelo todavía está aprendiendo. Una vez que domina el movimiento, ya no necesitas pensar — fluye solo.',
    skills: ['Coordinación motora', 'Equilibrio', 'Postura', 'Aprendizaje motor', 'Movimiento fino'],
    funFacts: [
      { icon: '📊', text: 'El cerebelo representa solo el 10% del volumen del cerebro, pero contiene más del 50% de todas sus neuronas. Sus células de Purkinje son las neuronas más grandes y complejas de todo el sistema nervioso central.' },
      { icon: '🎹', text: 'Cuando un pianista interpreta una pieza memorizada, es el cerebelo quien ejecuta la secuencia automáticamente. Almacena la "memoria muscular" de las habilidades aprendidas — cada vez que practicas, refuerzas estas conexiones.' },
      { icon: '🥴', text: 'El alcohol afecta el cerebelo antes que cualquier otra estructura — por eso la falta de coordinación y el habla arrastrada son los primeros signos de intoxicación. El cerebelo es especialmente vulnerable a su toxicidad química.' }
    ],
    connections: ['motor', 'brainstem'],
    layer: 0
  },
  {
    id: 'brainstem',
    name: 'Tronco Encefálico',
    short: 'Tronco',
    color: '#F472B6',
    emoji: '💗',
    tagline: 'El guardián silencioso de la vida',
    description: 'El tronco encefálico conecta el cerebro con la médula espinal y controla funciones vitales automáticas: respiración, ritmo cardíaco, presión arterial, deglución y ciclos de sueño-vigilia. Se divide en mesencéfalo, protuberancia anular (puente de Varolio) y bulbo raquídeo.',
    childExplanation: '¡Es el piloto automático de tu cuerpo! Mientras juegas, estudias o duermes, él trabaja sin parar: hace que respires, que tu corazón lata, que tu temperatura sea la correcta. Nunca descansa, nunca falla.',
    skills: ['Respiración automática', 'Ritmo cardíaco', 'Presión arterial', 'Ciclos de sueño', 'Reflejos vitales'],
    funFacts: [
      { icon: '🦎', text: 'A veces llamado "cerebro reptiliano", el tronco encefálico es la estructura cerebral más antigua evolutivamente. Los reptiles tienen principalmente esta estructura — sin la gran corteza que los mamíferos desarrollaron millones de años después.' },
      { icon: '😴', text: 'Durante el sueño REM, el tronco encefálico activa una parálisis muscular para que no actúes físicamente lo que estás soñando. Sin este mecanismo de bloqueo, caminaríamos dormidos y actuaríamos cada sueño.' },
      { icon: '⚠️', text: 'La "muerte cerebral" se declara cuando el tronco encefálico cesa su actividad. Es la última estructura en apagarse porque sin ella no hay respiración espontánea ni funciones vitales autónomas. Es el último bastión de la vida.' }
    ],
    connections: ['cerebellum'],
    layer: 0
  },
  {
    id: 'prefrontal',
    name: 'Corteza Prefrontal',
    short: 'Prefrontal',
    color: '#FF8A65',
    emoji: '🎯',
    tagline: 'La sede del pensamiento superior',
    description: 'La corteza prefrontal es la región más evolutivamente reciente del cerebro humano. Orquesta las funciones ejecutivas de mayor complejidad: razonamiento moral, empatía cognitiva, autoconciencia, regulación emocional, pensamiento contrafáctico y planificación a largo plazo.',
    childExplanation: '¡Es la parte más "humana" del cerebro! Solo los humanos la tienen tan desarrollada. Gracias a ella puedes imaginarte cómo se siente otra persona, pensar en lo que pasará mañana, o resistir comer algo que sabes que no te conviene.',
    skills: ['Funciones ejecutivas', 'Empatía', 'Razonamiento moral', 'Autoconciencia', 'Regulación emocional', 'Creatividad'],
    funFacts: [
      { icon: '🐒', text: 'La corteza prefrontal ocupa el 29% de la corteza en humanos, el 17% en chimpancés y apenas el 7% en perros. Esta diferencia proporcional es lo que nos permite planificar, reflexionar sobre nosotros mismos y construir culturas.' },
      { icon: '🧘', text: 'La meditación regular produce cambios físicos medibles aquí: mayor grosor cortical y conexiones más fuertes con la amígdala. Por eso los meditadores experimentados regulan mejor sus emociones — literalmente tienen un cerebro diferente.' },
      { icon: '🎮', text: 'Durante la adolescencia, la corteza prefrontal es la última región en madurar. Mientras tanto, la amígdala emocional domina las decisiones. Por eso los adolescentes buscan emociones intensas, toman más riesgos y priorizan la aprobación social.' }
    ],
    connections: ['frontal', 'broca'],
    layer: 1
  }
,
{
    id: 'amygdala',
    name: 'Amígdala',
    short: 'Amígdala',
    color: '#C084FC',
    emoji: '💜',
    tagline: 'La alarma emocional del cerebro',
    description: 'La amígdala es una estructura subcortical con forma de almendra, en el lóbulo temporal medial. Fundamental para el miedo, la amenaza y la respuesta de estrés. Actúa como un centinela: escanea el entorno y desencadena respuestas de lucha o huida antes de que el córtex haga una evaluación consciente.',
    childExplanation: '¡Es la alarma de incendios de tu cerebro! Cuando ve algo peligroso, suena antes de que puedas pensar. Por eso cuando te asustas, el corazón te late rápido antes de saber qué pasó.',
    skills: ['Procesamiento del miedo', 'Respuesta emocional', 'Detección de amenazas', 'Memoria emocional'],
    funFacts: [
      { icon: '⚡', text: 'La amígdala procesa una amenaza en 12 milisegundos — 5 veces más rápido que la conciencia. Reaccionas antes de saber por qué.' },
      { icon: '💔', text: 'El "secuestro amigdalar" (LeDoux, 1996): ante una emoción intensa, puede apagar temporalmente la corteza prefrontal. Por eso no pensamos bien cuando estamos muy asustados.' },
      { icon: '🎭', text: 'La amígdala se activa ante caras amenazantes presentadas tan rápido que no las vemos conscientemente. Tu cerebro detecta peligros sociales antes de registrarlos.' }
    ],
    connections: ['temporal', 'prefrontal'],
    layer: 2
  },
  {
    id: 'hippocampus',
    name: 'Hipocampo',
    short: 'Hipocampo',
    color: '#60A5FA',
    emoji: '🐠',
    tagline: 'El arquitecto de la memoria',
    description: 'El hipocampo es esencial para la formación de nuevos recuerdos episódicos y semánticos, la consolidación a largo plazo y la navegación espacial. Ubicado en el lóbulo temporal medial. Una de las pocas regiones donde el cerebro adulto genera nuevas neuronas (neurogénesis).',
    childExplanation: '¡Es la fábrica de recuerdos! Cada vez que aprendes algo nuevo, el hipocampo lo graba. Sin él, vivirías solo en el presente — cada cosa que hagas la olvidarías en segundos.',
    skills: ['Formación de memorias', 'Navegación espacial', 'Consolidación', 'Aprendizaje'],
    funFacts: [
      { icon: '🧭', text: 'Los taxistas de Londres memorizan 25.000 calles y tienen el hipocampo posterior físicamente más grande. Evidencia directa de neuroplasticidad estructural en adultos (Maguire et al., 2000).' },
      { icon: '🆕', text: 'Es uno de los pocos sitios de neurogénesis adulta. El ejercicio aeróbico, el aprendizaje y el sueño la estimulan. El estrés crónico la reduce.' },
      { icon: '😢', text: 'En el Alzheimer, el hipocampo es la primera estructura en dañarse — por eso los primeros síntomas son pérdidas de memoria reciente.' }
    ],
    connections: ['temporal', 'amygdala'],
    layer: 2
  },
  {
    id: 'olfactory_bulb',
    name: 'Bulbo Olfatorio',
    short: 'Bulbo Olfatorio',
    color: '#86EFAC',
    emoji: '👃',
    tagline: 'La puerta directa al sistema emocional',
    description: 'Primera estación del sistema olfativo. A diferencia de todos los otros sentidos (que pasan por el tálamo), el olfato conecta directamente con la amígdala y el hipocampo — explicando la capacidad de los olores para evocar memorias y emociones vívidas.',
    childExplanation: '¡El único sentido que llega directo a la parte emocional del cerebro! Por eso el olor de una comida puede hacerte recordar a alguien en un instante.',
    skills: ['Procesamiento olfativo', 'Memoria asociativa', 'Detección de olores'],
    funFacts: [
      { icon: '🌹', text: 'El olfato es el único sentido que llega directo al sistema límbico sin pasar por el tálamo. Por eso los olores generan recuerdos emocionales tan inmediatos.' },
      { icon: '🧬', text: 'Podemos discriminar más de 1 billón de olores. Tenemos más de 400 tipos de receptores olfativos.' },
      { icon: '🐭', text: 'El bulbo olfatorio es un sitio de neurogénesis adulta activa.' }
    ],
    connections: ['amygdala', 'hippocampus'],
    layer: 2
  },
  {
    id: 'cingulate',
    name: 'Corteza Cingulada',
    short: 'Cíngulo',
    color: '#FCD34D',
    emoji: '🌙',
    tagline: 'El puente entre emoción y cognición',
    description: 'La corteza cingulada rodea el cuerpo calloso. La cingulada anterior gestiona emociones, toma de decisiones y detección de conflictos. La cingulada posterior forma parte de la Red por Defecto. Es interfaz clave entre el sistema límbico y la corteza prefrontal.',
    childExplanation: '¡El árbitro entre tus emociones y pensamientos! Cuando sientes algo y decides qué hacer, esta zona ayuda. También "duele" cuando te sientes rechazado socialmente.',
    skills: ['Regulación emocional', 'Detección de errores', 'Toma de decisiones', 'Dolor social'],
    funFacts: [
      { icon: '💔', text: 'La cingulada anterior se activa ante el dolor SOCIAL (ser rechazado) igual que ante el dolor físico. El "dolor" de la exclusión no es metáfora.' },
      { icon: '🔍', text: 'Funciona como detector de errores: genera una señal (ERN) en <100ms cuando cometes un error, antes de que seas consciente.' },
      { icon: '🧘', text: 'La meditación aumenta el grosor de la cingulada anterior, correlacionado con mejor regulación emocional.' }
    ],
    connections: ['prefrontal', 'amygdala'],
    layer: 1
  },
  {
    id: 'corpus_callosum',
    name: 'Cuerpo Calloso',
    short: 'C. Calloso',
    color: '#FCA5A5',
    emoji: '🔗',
    tagline: 'El gran puente entre hemisferios',
    description: 'La comisura cerebral más grande: 200-300 millones de axones que conectan los dos hemisferios. Permite la transferencia de información sensorial, motora y cognitiva, coordinando las actividades especializadas de cada hemisferio.',
    childExplanation: '¡El puente más importante del cerebro! Conecta el lado derecho con el izquierdo. Si lo cortaras, cada mitad viviría en su propio mundo sin saber qué hace la otra.',
    skills: ['Transferencia interhemisférica', 'Integración sensorial', 'Coordinación motora'],
    funFacts: [
      { icon: '✂️', text: 'En pacientes de cerebro dividido (callosotomía), la mano izquierda literalmente no sabe lo que hace la derecha — cada hemisferio actúa independientemente.' },
      { icon: '🧒', text: 'El cuerpo calloso tarda 20 años en madurar completamente — una de las últimas estructuras en desarrollarse.' },
      { icon: '🔗', text: 'Es la autopista de datos entre hemisferios: transfiere ~4.000 millones de bits por segundo entre los dos lados del cerebro.' }
    ],
    connections: ['frontal', 'parietal', 'temporal', 'occipital'],
    layer: 1
  },
];

const BRAIN_CONFIG = {
  viewBox: '0 0 560 440',
  defaultView: 'lateral-left',
};

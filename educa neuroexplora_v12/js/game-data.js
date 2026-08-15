/**
 * NeuroExplora — game-data.js  v3.0
 * Datos ampliados: 7 modos de juego, +80 preguntas, 28 insignias, pares craneales.
 */

// ── CONFIGURACIÓN ─────────────────────────────────────────────
const GAME_CONFIG = {
  xpPerCorrect:    { easy: 10, medium: 20, hard: 35 },
  xpPerPuzzle:     60,
  xpPerGuess:      25,
  xpPerTF:         { correct: 12, bonus: 6 },
  xpPerPathway:    { easy: 20, medium: 35, hard: 55 },
  xpPerCranial:    15,
  xpPerIdentify:   20,
  timeLimits:      { easy: 22, medium: 16, hard: 11, tf: 10, cranial: 18, identify: 20 },
  starsThresholds: { one: 40, two: 65, three: 90 },
  questionsPerRound: 8,
  levels: [
    { level: 1, name: 'Curioso',            xpRequired: 0,    icon: '🌱' },
    { level: 2, name: 'Explorador',          xpRequired: 100,  icon: '🔭' },
    { level: 3, name: 'Estudiante',          xpRequired: 250,  icon: '📚' },
    { level: 4, name: 'Investigador',        xpRequired: 500,  icon: '🔬' },
    { level: 5, name: 'Neurocientífico',     xpRequired: 900,  icon: '🧬' },
    { level: 6, name: 'Maestro del Cerebro', xpRequired: 1500, icon: '🏆' },
    { level: 7, name: 'Leyenda Neural',      xpRequired: 2500, icon: '⭐' },
  ],
};

// ── INSIGNIAS (28 insignias por módulo y logro) ────────────────
const BADGES = [
  // CEREBRO
  { id:'brain_explorer',   name:'Explorador del Cerebro', icon:'🧩', rarity:'común',      color:'#FF6B6B', module:'cerebro',    desc:'Primera pregunta correcta sobre regiones cerebrales.',    unlockMsg:'¡Comenzaste a explorar el cerebro!' },
  { id:'frontal_master',   name:'Maestro Frontal',        icon:'🎯', rarity:'rara',        color:'#FF8A65', module:'cerebro',    desc:'3 preguntas correctas sobre el lóbulo frontal.',          unlockMsg:'¡Dominas el director del cerebro!' },
  { id:'language_pro',     name:'Lingüista Neural',       icon:'💬', rarity:'rara',        color:'#F9A8D4', module:'cerebro',    desc:'Dominaste Broca, Wernicke y el lenguaje.',               unlockMsg:'¡Broca y Wernicke te saludan!' },
  { id:'puzzle_master',    name:'Arquitecto del Cerebro', icon:'🏗️', rarity:'épica',       color:'#34D399', module:'cerebro',    desc:'Puzzle del cerebro completado.',                         unlockMsg:'¡Armaste el cerebro a la perfección!' },
  { id:'amygdala_finder',  name:'Guardián Amigdalar',     icon:'💜', rarity:'rara',        color:'#A78BFA', module:'cerebro',    desc:'Identificaste correctamente la amígdala 2 veces.',        unlockMsg:'¡El detector de emociones te saluda!' },
  { id:'hippocampus_hero', name:'Héroe del Hipocampo',    icon:'🐠', rarity:'rara',        color:'#38BDF8', module:'cerebro',    desc:'Respondiste bien 3 preguntas sobre hipocampo.',           unlockMsg:'¡Tu hipocampo agradece el ejercicio!' },
  // EVOLUCIÓN
  { id:'evo_starter',      name:'Viajero del Tiempo',     icon:'🦎', rarity:'común',      color:'#84CC16', module:'evolución',  desc:'Primera pregunta de evolución respondida.',              unlockMsg:'¡520 millones de años te esperan!' },
  { id:'darwin_award',     name:'Heredero de Darwin',     icon:'🧬', rarity:'épica',       color:'#F97316', module:'evolución',  desc:'5 preguntas difíciles de evolución correctas.',          unlockMsg:'¡Darwin estaría orgulloso!' },
  { id:'neanderthal_friend',name:'Amigo Neanderthal',     icon:'🏔️', rarity:'rara',        color:'#A78BFA', module:'evolución',  desc:'Conoces el ADN compartido con neandertales.',            unlockMsg:'¡Llevas un 2% Neanderthal en ti!' },
  // NEURONA
  { id:'synapse_starter',  name:'Señalero Novato',        icon:'⚡', rarity:'común',      color:'#38BDF8', module:'neurona',    desc:'Primera pregunta sobre la neurona.',                     unlockMsg:'¡El impulso nervioso te saluda!' },
  { id:'myelin_master',    name:'Maestro de la Mielina',  icon:'🛡️', rarity:'rara',        color:'#FBBF24', module:'neurona',    desc:'Dominaste mielina y conducción nerviosa.',               unlockMsg:'¡Tu axón va a 430 km/h!' },
  { id:'hodgkin_huxley',   name:'Nobel de Neurociencia',  icon:'🏅', rarity:'legendaria',  color:'#F59E0B', module:'neurona',    desc:'Respondiste sobre Hodgkin, Huxley y potencial de acción.',unlockMsg:'¡Digno del Nobel de 1963!' },
  { id:'neuron_puzzle_ace',name:'As de la Neurona',       icon:'🔬', rarity:'épica',       color:'#06B6D4', module:'neurona',    desc:'Puzzle de la neurona completado sin errores.',           unlockMsg:'¡Conoces cada parte de la neurona!' },
  // CORTEZA
  { id:'cortex_explorer',  name:'Cartógrafo Cortical',    icon:'🌐', rarity:'común',      color:'#A78BFA', module:'corteza',    desc:'Primera pregunta sobre redes cerebrales.',               unlockMsg:'¡Las redes cerebrales te lo agradecen!' },
  { id:'default_mode',     name:'Maestro Red por Defecto',icon:'💭', rarity:'épica',       color:'#818CF8', module:'corteza',    desc:'Conoces la Red por Defecto, Saliencia y Control Ejecutivo.',unlockMsg:'¡Tu DMN está activa!' },
  // PARES CRANEALES
  { id:'cranial_1st',      name:'Primer Par Craneal',     icon:'🦴', rarity:'común',      color:'#6EE7B7', module:'craneal',    desc:'Primera respuesta correcta de pares craneales.',         unlockMsg:'¡Los 12 nervios te esperan!' },
  { id:'cranial_master',   name:'Maestro de los Nervios', icon:'🧠', rarity:'épica',       color:'#10B981', module:'craneal',    desc:'8 de 12 pares craneales correctos.',                     unlockMsg:'¡Dominas los 12 nervios craneales!' },
  { id:'cranial_legend',   name:'Leyenda Craneal',        icon:'🌟', rarity:'legendaria',  color:'#34D399', module:'craneal',    desc:'Todos los pares craneales correctos en una ronda.',      unlockMsg:'¡Perfecto en los 12 nervios craneales!' },
  // RUTAS NEURONALES
  { id:'pathway_starter',  name:'Primer Explorador',      icon:'🗺️', rarity:'común',      color:'#F472B6', module:'rutas',      desc:'Primera ruta neuronal completada.',                      unlockMsg:'¡El cerebro trabaja en red!' },
  { id:'pathway_master',   name:'Maestro de Rutas',       icon:'🚀', rarity:'épica',       color:'#EC4899', module:'rutas',      desc:'5 rutas neuronales completadas sin error.',              unlockMsg:'¡Conoces el viaje de la información!' },
  // VERDADERO/FALSO
  { id:'tf_starter',       name:'Juez de la Verdad',      icon:'⚖️', rarity:'común',      color:'#FBBF24', module:'verdadero',  desc:'Primera pregunta V/F correcta.',                         unlockMsg:'¡Detector de mitos activado!' },
  { id:'tf_streak',        name:'Sin Fallas',              icon:'🎯', rarity:'rara',        color:'#F59E0B', module:'verdadero',  desc:'8 V/F correctos seguidos.',                              unlockMsg:'¡8 seguidas! Impecable.' },
  { id:'myth_buster',      name:'Cazador de Mitos',        icon:'💥', rarity:'épica',       color:'#EF4444', module:'verdadero',  desc:'Identificaste 5 afirmaciones FALSAS correctamente.',     unlockMsg:'¡Ningún mito te engaña!' },
  // ÁREA INCORRECTA
  { id:'identify_1st',     name:'Ojo Clínico',             icon:'👁️', rarity:'común',      color:'#8B5CF6', module:'identifica', desc:'Primera área incorrecta encontrada.',                     unlockMsg:'¡Nada se escapa a tu ojo entrenado!' },
  { id:'identify_master',  name:'Diagnóstico Perfecto',   icon:'🏥', rarity:'épica',       color:'#7C3AED', module:'identifica', desc:'5 áreas incorrectas identificadas sin fallar.',          unlockMsg:'¡Clínico impecable!' },
  // GLOBALES
  { id:'speed_demon',      name:'Mente Relámpago',         icon:'⚡', rarity:'rara',        color:'#38BDF8', module:'global',     desc:'Pregunta respondida en menos de 3 segundos.',            unlockMsg:'¡Más rápido que un impulso nervioso!' },
  { id:'streak_fire',      name:'En Llamas',               icon:'🔥', rarity:'rara',        color:'#F97316', module:'global',     desc:'5 respuestas correctas seguidas.',                       unlockMsg:'¡Racha imparable! 5 seguidas.' },
  { id:'perfect_round',    name:'Ronda Perfecta',          icon:'⭐', rarity:'épica',       color:'#FBBF24', module:'global',     desc:'8/8 en una ronda de trivia.',                            unlockMsg:'¡8 de 8! Impecable.' },
  { id:'all_modes',        name:'Explorador Total',        icon:'🏆', rarity:'legendaria',  color:'#4F8EF7', module:'global',     desc:'Jugaste todos los modos del juego.',                     unlockMsg:'¡Conquistaste todos los modos!' },
  { id:'hard_veteran',     name:'Veterano del Difícil',    icon:'🔬', rarity:'épica',       color:'#F43F5E', module:'global',     desc:'5 respuestas correctas en nivel difícil.',               unlockMsg:'¡La neurociencia avanzada no te intimida!' },
  { id:'guess_genius',     name:'Genio de las Pistas',     icon:'🔍', rarity:'rara',        color:'#A78BFA', module:'global',     desc:'3 regiones adivinadas con solo 1 pista.',                unlockMsg:'¡Solo necesitabas una pista!' },
];

const RARITY_COLORS = {
  'común':     '#6b8ab8',
  'rara':      '#4f8ef7',
  'épica':     '#a78bfa',
  'legendaria':'#fbbf24',
};

// ── TRIVIA FÁCIL ──────────────────────────────────────────────
const TRIVIA_EASY = [
  { q:'¿Qué parte coordina el equilibrio y la coordinación?',
    options:['Lóbulo frontal','Cerebelo','Lóbulo occipital','Área de Broca'],
    correct:1, region:'cerebellum', module:'cerebro',
    explanation:'El cerebelo coordina y afina los movimientos. Sin él, caminar sería imposible.' },
  { q:'¿Qué lóbulo procesa la información visual?',
    options:['Frontal','Temporal','Occipital','Parietal'],
    correct:2, region:'occipital', module:'cerebro',
    explanation:'El lóbulo occipital está en la parte posterior y es la "pantalla" del cerebro.' },
  { q:'¿Cuál es la función principal del lóbulo frontal?',
    options:['Ver colores','Escuchar sonidos','Planear y decidir','Mantener el equilibrio'],
    correct:2, region:'frontal', module:'cerebro',
    explanation:'El lóbulo frontal es el "director": planifica, decide y controla impulsos.' },
  { q:'¿Qué estructura controla la respiración y el ritmo cardíaco?',
    options:['Cerebelo','Lóbulo parietal','Tronco encefálico','Área de Wernicke'],
    correct:2, region:'brainstem', module:'cerebro',
    explanation:'El tronco encefálico es el piloto automático del cuerpo.' },
  { q:'¿Qué área produce el habla articulada?',
    options:['Área de Wernicke','Área de Broca','Lóbulo occipital','Corteza sensorial'],
    correct:1, region:'broca', module:'cerebro',
    explanation:'El área de Broca organiza las palabras y coordina los músculos del habla.' },
  { q:'¿Qué lóbulo recibe las sensaciones de tacto y temperatura?',
    options:['Frontal','Occipital','Parietal','Cerebelo'],
    correct:2, region:'parietal', module:'cerebro',
    explanation:'El lóbulo parietal tiene un mapa completo del cuerpo.' },
  { q:'¿En qué lóbulo se procesa la audición?',
    options:['Frontal','Temporal','Occipital','Parietal'],
    correct:1, region:'temporal', module:'cerebro',
    explanation:'El lóbulo temporal procesa los sonidos y aloja el hipocampo y la amígdala.' },
  { q:'¿Qué estructura envía órdenes a los músculos voluntarios?',
    options:['Lóbulo occipital','Corteza motora','Tronco encefálico','Cerebelo'],
    correct:1, region:'motor', module:'cerebro',
    explanation:'La corteza motora es el control remoto de tus músculos.' },
  { q:'¿Qué nos diferencia más de otros animales?',
    options:['Tronco encefálico','Cerebelo','Corteza prefrontal','Corteza sensorial'],
    correct:2, region:'prefrontal', module:'cerebro',
    explanation:'La corteza prefrontal gestiona pensamiento abstracto, empatía y planificación.' },
  { q:'¿Qué área te permite entender el significado de las palabras?',
    options:['Área de Broca','Lóbulo occipital','Área de Wernicke','Corteza motora'],
    correct:2, region:'wernicke', module:'cerebro',
    explanation:'El área de Wernicke descifra el significado.' },
  { q:'¿Cuántos hemisferios tiene el cerebro?',
    options:['Uno','Dos','Tres','Cuatro'],
    correct:1, module:'cerebro',
    explanation:'El cerebro tiene dos hemisferios (izquierdo y derecho) conectados por el cuerpo calloso.' },
  { q:'¿Qué es la amígdala?',
    options:['Una glándula digestiva','Una estructura relacionada con las emociones y el miedo','El lóbulo occipital','El cuerpo calloso'],
    correct:1, region:'temporal', module:'cerebro',
    explanation:'La amígdala es la "alarma emocional" del cerebro, especialmente sensible al miedo y la amenaza.' },
  { q:'¿Qué estructura conecta los dos hemisferios cerebrales?',
    options:['El hipocampo','El cerebelo','El cuerpo calloso','La amígdala'],
    correct:2, module:'cerebro',
    explanation:'El cuerpo calloso es el gran puente de fibras nerviosas que conecta los dos hemisferios.' },
  { q:'¿Qué hace el hipocampo?',
    options:['Controla los movimientos','Forma nuevos recuerdos','Regula el hambre','Procesa la visión'],
    correct:1, module:'cerebro',
    explanation:'El hipocampo convierte experiencias en recuerdos. Sin él, no podemos formar nuevas memorias.' },
];

// ── TRIVIA MEDIO ──────────────────────────────────────────────
const TRIVIA_MEDIUM = [
  { q:'¿Cuántas neuronas tiene aproximadamente el cerebro humano?',
    options:['1 millón','1.000 millones','86.000 millones','1 billón'],
    correct:2, module:'neurona',
    explanation:'~86.000 millones de neuronas. Contarlas a una por segundo tomaría 2.700 años.' },
  { q:'¿A qué velocidad viaja un impulso en un axón mielinizado?',
    options:['5 km/h','50 km/h','~430 km/h (120 m/s)','1 m/s'],
    correct:2, module:'neurona',
    explanation:'Gracias a la conducción saltatoria, los axones mielinizados alcanzan 120 m/s.' },
  { q:'¿Cuál es la función de la vaina de mielina?',
    options:['Almacenar glucosa','Aislar el axón y acelerar el impulso','Producir neurotransmisores','Conectar los hemisferios'],
    correct:1, module:'neurona',
    explanation:'La mielina hace que el impulso salte de nódulo en nódulo — 240x más rápido.' },
  { q:'¿Qué neurotransmisor se asocia con el placer y la motivación?',
    options:['Serotonina','GABA','Dopamina','Acetilcolina'],
    correct:2, module:'neurona',
    explanation:'La dopamina es el neurotransmisor del sistema de recompensa.' },
  { q:'¿Qué ocurre cuando llega un potencial de acción al botón sináptico?',
    options:['Se libera glucosa','Entran iones de sodio','El Ca²⁺ desencadena la liberación de neurotransmisores','El axón se contrae'],
    correct:2, module:'neurona',
    explanation:'El calcio activa la fusión de vesículas sinápticas y libera neurotransmisores.' },
  { q:'¿Qué era cerebral surgió primero evolutivamente?',
    options:['Corteza prefrontal','Neocórtex','Tronco encefálico','Lóbulo frontal'],
    correct:2, module:'evolución',
    explanation:'El tronco encefálico aparece en el Cámbrico hace 520 Ma.' },
  { q:'¿Cuántos pares de nervios craneales tiene el ser humano?',
    options:['8','10','12','14'],
    correct:2, module:'craneal',
    explanation:'Existen 12 pares de nervios craneales, del I (olfatorio) al XII (hipogloso).' },
  { q:'¿Qué neurotransmisor es el principal inhibidor del sistema nervioso central?',
    options:['Dopamina','Glutamato','GABA','Noradrenalina'],
    correct:2, module:'neurona',
    explanation:'El GABA (ácido gamma-aminobutírico) es el principal neurotransmisor inhibidor del SNC.' },
  { q:'¿Qué estructura forma nuevos recuerdos y es vital en el Alzheimer?',
    options:['Amígdala','Hipocampo','Cerebelo','Tálamo'],
    correct:1, module:'cerebro',
    explanation:'El hipocampo convierte experiencias en recuerdos permanentes. En el Alzheimer se daña temprano.' },
  { q:'¿Qué lóbulo procesa la música y las emociones?',
    options:['Frontal','Temporal','Parietal','Occipital'],
    correct:1, module:'cerebro',
    explanation:'El lóbulo temporal procesa el sonido y la música, y aloja la amígdala (emociones).' },
  { q:'¿Cuántas capas tiene la corteza cerebral?',
    options:['3','6','9','12'],
    correct:1, module:'corteza',
    explanation:'La isocórtex (corteza cerebral) tiene 6 capas de neuronas con funciones distintas.' },
  { q:'¿Qué nervio craneal controla los movimientos oculares?',
    options:['Nervio óptico (II)','Nervio oculomotor (III)','Nervio facial (VII)','Nervio vago (X)'],
    correct:1, module:'craneal',
    explanation:'El nervio oculomotor (III par) mueve la mayoría de los músculos del ojo.' },
  { q:'¿Qué es la neuroplasticidad?',
    options:['El endurecimiento del cerebro con la edad','La capacidad del cerebro de reorganizarse y adaptarse','Un material sintético para prótesis neuronales','La velocidad de conducción nerviosa'],
    correct:1, module:'cerebro',
    explanation:'La neuroplasticidad es la capacidad del cerebro de cambiar su estructura y función con la experiencia.' },
];

// ── TRIVIA DIFÍCIL ────────────────────────────────────────────
const TRIVIA_HARD = [
  { q:'¿Qué propone la "hipótesis del cuello de botella nocturno" sobre los mamíferos?',
    options:['Evolucionaron en climas fríos','La vida nocturna bajo los dinosaurios refinó oído, olfato y tacto','Perdieron la visión de color','El cerebro creció para gestionar temperatura'],
    correct:1, module:'evolución',
    explanation:'Gerkema et al. (2013): ~160 Ma de vida nocturna explican características sensoriales únicas de los mamíferos.' },
  { q:'¿Por qué el "cerebro triúnico" de MacLean es considerado superado?',
    options:['MacLean no publicó datos','Las estructuras co-evolucionaron; los peces ya tienen equivalentes del sistema límbico','El cerebro tiene 4 capas, no 3','Solo aplica a primates'],
    correct:1, module:'evolución',
    explanation:'Cesario et al. (2020): el modelo de "capas" es anatómicamente incorrecto. Todas las estructuras se transformaron juntas.' },
  { q:'¿Qué gen está asociado a la evolución del lenguaje humano complejo?',
    options:['BRCA1','FOXP2','APOE','HTT'],
    correct:1, module:'evolución',
    explanation:'El FOXP2 muestra señales de selección positiva en el linaje humano y es crítico para el control motor del habla.' },
  { q:'¿Qué descubrieron Hodgkin y Huxley en 1952?',
    options:['La estructura de la mielina','Los canales iónicos que generan el potencial de acción','Los receptores de dopamina','La sinapsis química'],
    correct:1, module:'neurona',
    explanation:'Modelaron matemáticamente cómo los canales de Na⁺ y K⁺ generan el potencial de acción. Nobel 1963.' },
  { q:'¿Qué tres redes colaboran durante la creatividad según Beaty et al. (2016)?',
    options:['Visual, auditiva, motora','Red por Defecto, Control Ejecutivo, Saliencia','Frontal, parietal, temporal','Hipocampo, amígdala, prefrontal'],
    correct:1, module:'corteza',
    explanation:'La Red por Defecto (asociación libre), el Control Ejecutivo (evaluación) y la Saliencia trabajan en tensión creativa.' },
  { q:'¿Qué propone Wrangham sobre el fuego y el cerebro humano?',
    options:['El fuego permitió climas más fríos','Cocinar triplicó las calorías disponibles, permitiendo sostener el cerebro','El fuego redujo parásitos','Cocinar desarrolló el lenguaje'],
    correct:1, module:'evolución',
    explanation:'Wrangham (2009): sin cocinar sería metabólicamente imposible mantener un cerebro tan grande.' },
  { q:'¿Qué par craneal controla el gusto en los dos tercios anteriores de la lengua?',
    options:['V (Trigémino)','VII (Facial)','IX (Glosofaríngeo)','XII (Hipogloso)'],
    correct:1, module:'craneal',
    explanation:'El nervio facial (VII) conduce el gusto de los 2/3 anteriores de la lengua vía cuerda del tímpano.' },
  { q:'¿Qué es el "secuestro amigdalar"?',
    options:['Un trastorno de memoria','La amígdala inhibe el prefrontal ante amenazas, generando respuesta emocional antes que racional','Un tipo de epilepsia temporal','La pérdida del hipocampo'],
    correct:1, module:'cerebro',
    explanation:'LeDoux describió cómo la amígdala puede bypasear el córtex prefrontal ante amenazas — reacción primitiva de supervivencia.' },
  { q:'¿Qué crítica hace Everett a Chomsky sobre el lenguaje?',
    options:['Que la recursividad no existe','Que el Pirahã carece de recursividad gramatical, cuestionando su universalidad','Que el área de Broca varía según el idioma','Que los niños no aprenden gramática de forma innata'],
    correct:1, module:'evolución',
    explanation:'Everett (2005): el Pirahã no usa oraciones subordinadas recursivas, poniendo en cuestión la universalidad.' },
  { q:'¿Qué región del cerebro se activa principalmente durante la meditación mindfulness?',
    options:['Amígdala','Corteza prefrontal medial y ínsula','Lóbulo occipital','Cerebelo'],
    correct:1, module:'corteza',
    explanation:'La meditación activa la corteza prefrontal medial e ínsula, aumentando la autorregulación emocional.' },
  { q:'¿Qué es el potencial de acción?',
    options:['La energía eléctrica total del cerebro','Un cambio rápido y reversible del voltaje de la membrana neuronal que propaga información','El potencial metabólico de la neurona','La diferencia de glucosa entre neuronas'],
    correct:1, module:'neurona',
    explanation:'El potencial de acción es el "todo o nada" eléctrico que propaga información a lo largo del axón.' },
];

// ── PUZZLE CEREBRO ───────────────────────────────────────────
const PUZZLE_PIECES = [
  { id:'frontal',    name:'Lóbulo Frontal',    emoji:'🧠', color:'#FF6B6B', hint:'El director — parte delantera' },
  { id:'parietal',  name:'Lóbulo Parietal',   emoji:'✋', color:'#A78BFA', hint:'El mapa del cuerpo — parte superior media' },
  { id:'temporal',  name:'Lóbulo Temporal',   emoji:'👂', color:'#38BDF8', hint:'Sonidos y memoria — lateral inferior' },
  { id:'occipital', name:'Lóbulo Occipital',  emoji:'👁️', color:'#34D399', hint:'La visión — parte trasera' },
  { id:'cerebellum',name:'Cerebelo',          emoji:'⚖️', color:'#6EE7B7', hint:'El equilibrio — debajo y atrás' },
  { id:'brainstem', name:'Tronco Encefálico', emoji:'💗', color:'#F472B6', hint:'El guardián vital — la base' },
  { id:'broca',     name:'Área de Broca',     emoji:'💬', color:'#F9A8D4', hint:'El habla — frontal inferior izquierdo' },
  { id:'prefrontal',name:'Corteza Prefrontal',emoji:'🎯', color:'#FF8A65', hint:'El pensador — frente extrema' },
];

// ── PUZZLE NEURONA ───────────────────────────────────────────
const NEURON_PUZZLE_PIECES = [
  { id:'dendrita',   name:'Dendrita',           emoji:'🌿', color:'#34D399', hint:'Ramas receptoras de señales' },
  { id:'soma',       name:'Soma (cuerpo celular)',emoji:'⭕', color:'#38BDF8', hint:'El centro de la neurona' },
  { id:'nucleo',     name:'Núcleo',             emoji:'🔵', color:'#A78BFA', hint:'El ADN — dentro del soma' },
  { id:'axilon',     name:'Axón',               emoji:'➡️', color:'#FB923C', hint:'El cable conductor principal' },
  { id:'mielina',   name:'Vaina de Mielina',   emoji:'🛡️', color:'#FBBF24', hint:'El aislante acelerador' },
  { id:'nodulo',     name:'Nódulo de Ranvier',  emoji:'🔗', color:'#F43F5E', hint:'La "parada" entre tramos de mielina' },
  { id:'boton',      name:'Botón Sináptico',    emoji:'🔴', color:'#E879F9', hint:'El emisor de neurotransmisores' },
];

// ── ADIVINANZA ────────────────────────────────────────────────
const GUESS_CHALLENGES = [
  { clues:['Maduro hasta los 25 años.','Controlo tu personalidad y decisiones.','Phineas Gage demostró mi importancia.'],
    answer:'frontal', answerName:'Lóbulo Frontal', color:'#FF6B6B' },
  { clues:['Proceso todas las imágenes que entran por tus ojos.','Estoy en la parte posterior del cráneo.','Me activo incluso mientras sueñas.'],
    answer:'occipital', answerName:'Lóbulo Occipital', color:'#34D399' },
  { clues:['Dentro de mí viven el hipocampo y la amígdala.','Proceso lo que escuchas y guardas como recuerdo.','Una canción puede activarme con una emoción de hace 20 años.'],
    answer:'temporal', answerName:'Lóbulo Temporal', color:'#38BDF8' },
  { clues:['Represento el 10% del volumen pero +50% de neuronas.','Sin mí, tus movimientos serían torpes.','Almaceno la "memoria muscular".'],
    answer:'cerebellum', answerName:'Cerebelo', color:'#6EE7B7' },
  { clues:['Nunca descanso — ni cuando duermes.','Controlo tu respiración y ritmo cardíaco.','Soy la estructura cerebral más antigua evolutivamente.'],
    answer:'brainstem', answerName:'Tronco Encefálico', color:'#F472B6' },
  { clues:['Paul Broca me descubrió en 1861 estudiando a "Tan".','Sin mí puedes entender pero no hablar.','Coordino los músculos que producen el habla.'],
    answer:'broca', answerName:'Área de Broca', color:'#F9A8D4' },
  { clues:['Integro sensaciones de todo tu cuerpo.','Sé dónde está tu mano aunque tengas los ojos cerrados.','Einstein tenía mi equivalente un 15% más ancho.'],
    answer:'parietal', answerName:'Lóbulo Parietal', color:'#A78BFA' },
  { clues:['Soy la región más reciente evolutivamente.','La empatía, la ética y la planificación dependen de mí.','En chimpancés represento el 17%, en humanos el 29%.'],
    answer:'prefrontal', answerName:'Corteza Prefrontal', color:'#FF8A65' },
];

// ── VERDADERO / FALSO ─────────────────────────────────────────
const TRUE_FALSE_QUESTIONS = [
  { statement:'El cerebro humano tiene aproximadamente 86.000 millones de neuronas.', answer:true,
    module:'neurona', explanation:'Azevedo et al. (2009) confirmaron este número usando el método fraccionador isotrópico.' },
  { statement:'El lóbulo occipital procesa el sonido y la música.', answer:false,
    module:'cerebro', explanation:'El lóbulo TEMPORAL procesa el sonido. El occipital procesa la visión.' },
  { statement:'El cerebro adulto puede generar nuevas neuronas (neurogénesis).', answer:true,
    module:'neurona', explanation:'Ocurre en el hipocampo y el bulbo olfatorio. El ejercicio y el aprendizaje la estimulan.' },
  { statement:'El área de Broca comprende el lenguaje hablado.', answer:false,
    module:'cerebro', explanation:'El área de WERNICKE comprende el lenguaje. Broca lo PRODUCE.' },
  { statement:'La vaina de mielina acelera la conducción del impulso nervioso.', answer:true,
    module:'neurona', explanation:'Permite la conducción saltatoria, alcanzando hasta 120 m/s (430 km/h).' },
  { statement:'El cerebelo está involucrado en la coordinación y el equilibrio.', answer:true,
    module:'cerebro', explanation:'El cerebelo coordina y afina todos los movimientos voluntarios.' },
  { statement:'El hemisferio derecho del cerebro controla el lado derecho del cuerpo.', answer:false,
    module:'cerebro', explanation:'¡Al revés! El hemisferio derecho controla el lado IZQUIERDO del cuerpo y viceversa.' },
  { statement:'Los nervios craneales son 12 pares.', answer:true,
    module:'craneal', explanation:'Hay 12 pares de nervios craneales, del I (olfatorio) al XII (hipogloso).' },
  { statement:'La dopamina es el principal neurotransmisor inhibidor del cerebro.', answer:false,
    module:'neurona', explanation:'El principal inhibidor es el GABA. La dopamina está asociada al sistema de recompensa.' },
  { statement:'El hipocampo es fundamental para formar nuevos recuerdos.', answer:true,
    module:'cerebro', explanation:'El hipocampo convierte memorias a corto plazo en memorias a largo plazo.' },
  { statement:'El lóbulo frontal madura completamente a los 16 años.', answer:false,
    module:'cerebro', explanation:'El lóbulo frontal (especialmente la corteza prefrontal) madura hasta los 25 años aproximadamente.' },
  { statement:'El nervio vago (X par craneal) conecta el cerebro con órganos como el corazón y los pulmones.', answer:true,
    module:'craneal', explanation:'El nervio vago es el par craneal más largo y se conecta con corazón, pulmones, estómago e intestinos.' },
  { statement:'Los humanos son los únicos animales con neuronas espejo.', answer:false,
    module:'cerebro', explanation:'Las neuronas espejo se encontraron primero en macacos (Rizzolatti, 1992). También existen en aves.' },
  { statement:'El corpus callosum (cuerpo calloso) conecta los dos hemisferios cerebrales.', answer:true,
    module:'cerebro', explanation:'El cuerpo calloso tiene ~200-300 millones de fibras nerviosas conectando ambos hemisferios.' },
  { statement:'El cerebro consume el 2% de la energía del cuerpo.', answer:false,
    module:'neurona', explanation:'El cerebro consume el 20% de toda la energía del cuerpo, aunque representa solo el 2% del peso.' },
  { statement:'La amígdala procesa principalmente el miedo y las emociones.', answer:true,
    module:'cerebro', explanation:'La amígdala es la "alarma emocional" del cerebro, especialmente activa ante el miedo y la amenaza.' },
  { statement:'El bulbo olfatorio está conectado directamente a la amígdala e hipocampo.', answer:true,
    module:'cerebro', explanation:'Por eso los olores generan memorias emocionales tan vívidas — el olfato tiene acceso directo al sistema límbico.' },
  { statement:'La corteza prefrontal es la estructura más reciente evolutivamente.', answer:true,
    module:'evolución', explanation:'El neocórtex (especialmente la corteza prefrontal) es la adición evolutiva más reciente en el linaje humano.' },
  { statement:'Las sinapsis químicas son las únicas en el sistema nervioso.', answer:false,
    module:'neurona', explanation:'También existen sinapsis eléctricas (gap junctions), más rápidas pero sin modulación química.' },
  { statement:'El nervio óptico (II par craneal) conecta la retina con el lóbulo occipital.', answer:true,
    module:'craneal', explanation:'El nervio óptico transmite la información visual desde la retina, cruzándose en el quiasma óptico.' },
];

// ── PARES CRANEALES ──────────────────────────────────────────
const CRANIAL_NERVES = [
  { number:1,  numeral:'I',    name:'Olfatorio',      type:'S', function:'Sentido del olfato',
    emoji:'👃', fact:'Único nervio craneal que llega directamente al cerebro sin pasar por el tálamo.' },
  { number:2,  numeral:'II',   name:'Óptico',         type:'S', function:'Visión — transmite imágenes de la retina',
    emoji:'👁️', fact:'Los nervios ópticos de ambos ojos se cruzan en el quiasma óptico.' },
  { number:3,  numeral:'III',  name:'Oculomotor',     type:'M', function:'Mueve la mayoría de los músculos del ojo y eleva el párpado',
    emoji:'🔄', fact:'Su parálisis produce ptosis palpebral (párpado caído) y diplopía.' },
  { number:4,  numeral:'IV',   name:'Troclear',       type:'M', function:'Mueve el músculo oblicuo superior del ojo',
    emoji:'↗️', fact:'Es el nervio craneal más delgado y con el trayecto intracraneal más largo.' },
  { number:5,  numeral:'V',    name:'Trigémino',      type:'MS', function:'Sensibilidad facial y masticación',
    emoji:'😬', fact:'El dolor de muelas viaja por este nervio. Tiene tres ramas: oftálmica, maxilar y mandibular.' },
  { number:6,  numeral:'VI',   name:'Abducens',       type:'M', function:'Mueve el músculo recto lateral del ojo (abduce el ojo)',
    emoji:'↔️', fact:'Parálisis: el ojo "se va hacia dentro" y el paciente tiene visión doble.' },
  { number:7,  numeral:'VII',  name:'Facial',         type:'MS', function:'Músculos de la expresión facial, gusto 2/3 anteriores de la lengua',
    emoji:'😊', fact:'Su parálisis produce parálisis de Bell: asimetría facial unilateral.' },
  { number:8,  numeral:'VIII', name:'Vestibulococlear',type:'S', function:'Audición y equilibrio',
    emoji:'👂', fact:'Tiene dos ramas: coclear (audición) y vestibular (equilibrio).' },
  { number:9,  numeral:'IX',   name:'Glosofaríngeo',  type:'MS', function:'Gusto 1/3 posterior de la lengua, reflejo nauseoso',
    emoji:'👅', fact:'Interviene en la deglución y en el reflejo nauseoso (junto con el X).' },
  { number:10, numeral:'X',    name:'Vago',           type:'MS', function:'Corazón, pulmones, tubo digestivo (el "vago" controla todo)',
    emoji:'💚', fact:'Es el nervio más largo del cuerpo: va desde el tronco encefálico hasta el abdomen.' },
  { number:11, numeral:'XI',   name:'Accesorio',      type:'M', function:'Músculos del cuello: esternocleidomastoideo y trapecio',
    emoji:'💪', fact:'Permite rotar la cabeza y elevar el hombro. Su daño produce dificultad para girar la cabeza.' },
  { number:12, numeral:'XII',  name:'Hipogloso',      type:'M', function:'Movimientos de la lengua (habla, deglución)',
    emoji:'💬', fact:'Su parálisis hace que la lengua se desvíe hacia el lado dañado al sacarla.' },
];

// Preguntas de pares craneales (para el juego de selección múltiple)
function buildCranialQuestions() {
  const qs = [];
  // Tipo: dado el número, ¿cuál es el nombre?
  CRANIAL_NERVES.forEach(n => {
    const wrong = CRANIAL_NERVES.filter(x => x.number !== n.number);
    const opts = shuffle([n, ...shuffle(wrong).slice(0,3)]);
    qs.push({
      q: `¿Cómo se llama el ${n.numeral === 'VIII' ? 'VIII' : n.numeral + 'º'} par craneal?`,
      options: opts.map(o => `${o.numeral} — ${o.name}`),
      correct: opts.findIndex(o => o.number === n.number),
      explanation: `${n.numeral} (${n.name}): ${n.function}. ${n.fact}`,
      module: 'craneal', emoji: n.emoji,
    });
  });
  // Tipo: ¿qué función tiene?
  CRANIAL_NERVES.forEach(n => {
    const wrong = CRANIAL_NERVES.filter(x => x.number !== n.number);
    const opts = shuffle([n, ...shuffle(wrong).slice(0,3)]);
    qs.push({
      q: `¿Cuál es la función del nervio ${n.name} (${n.numeral})?`,
      options: opts.map(o => o.function),
      correct: opts.findIndex(o => o.number === n.number),
      explanation: `El nervio ${n.name} (${n.numeral}): ${n.function}. ${n.fact}`,
      module: 'craneal', emoji: n.emoji,
    });
  });
  return shuffle(qs);
}

// ── RUTAS NEURONALES ─────────────────────────────────────────
const PATHWAY_SCENARIOS = [
  {
    id:'ver', emoji:'👁️',
    name:'Ver una imagen',
    intro:'Cuando tus ojos miran algo, el cerebro procesa la imagen en etapas precisas.',
    difficulty:1,
    steps:[
      { regionId:'occipital',  label:'Corteza visual',    color:'#34D399', desc:'La retina envía señales al lóbulo occipital.' },
      { regionId:'parietal',   label:'Análisis espacial', color:'#A78BFA', desc:'El parietal ubica la imagen en el espacio.' },
      { regionId:'temporal',   label:'Reconocimiento',    color:'#38BDF8', desc:'El temporal identifica qué es lo que ves.' },
    ]
  },
  {
    id:'escuchar', emoji:'🎵',
    name:'Escuchar música',
    intro:'Cada nota recorre una ruta específica para llegar a tu conciencia.',
    difficulty:1,
    steps:[
      { regionId:'temporal',   label:'Corteza auditiva',  color:'#38BDF8', desc:'El lóbulo temporal recibe el sonido.' },
      { regionId:'wernicke',   label:'Comprensión',       color:'#2DD4BF', desc:'Wernicke le da significado a las notas.' },
      { regionId:'frontal',    label:'Respuesta emocional',color:'#FF6B6B', desc:'El frontal decide cómo reaccionar.' },
    ]
  },
  {
    id:'leer', emoji:'📖',
    name:'Leer un texto',
    intro:'Leer activa múltiples regiones en una secuencia precisa y fascinante.',
    difficulty:2,
    steps:[
      { regionId:'occipital',  label:'Ve los símbolos',   color:'#34D399', desc:'El occipital detecta las letras.' },
      { regionId:'temporal',   label:'Wernicke actúa',    color:'#38BDF8', desc:'Wernicke procesa el significado.' },
      { regionId:'broca',      label:'Articulación interna',color:'#F9A8D4', desc:'Broca genera el "sonido mental".' },
      { regionId:'frontal',    label:'Comprensión final',  color:'#FF6B6B', desc:'El frontal integra todo.' },
    ]
  },
  {
    id:'pensar', emoji:'💭',
    name:'Resolver un problema',
    intro:'El pensamiento complejo involucra una red distribuida de regiones.',
    difficulty:2,
    steps:[
      { regionId:'prefrontal', label:'Planificación',     color:'#FF8A65', desc:'La prefrontal formula el problema.' },
      { regionId:'parietal',   label:'Análisis espacial', color:'#A78BFA', desc:'El parietal organiza la información.' },
      { regionId:'temporal',   label:'Memoria activa',    color:'#38BDF8', desc:'El temporal recupera experiencias previas.' },
      { regionId:'frontal',    label:'Decisión',          color:'#FF6B6B', desc:'El frontal toma la decisión final.' },
    ]
  },
  {
    id:'hablar', emoji:'🗣️',
    name:'Pronunciar una frase',
    intro:'Hablar parece simple, pero requiere la coordinación de 3 áreas distintas.',
    difficulty:2,
    steps:[
      { regionId:'wernicke',   label:'Formular la idea',  color:'#2DD4BF', desc:'Wernicke accede al significado.' },
      { regionId:'broca',      label:'Organizar palabras', color:'#F9A8D4', desc:'Broca organiza la gramática y el habla.' },
      { regionId:'motor',      label:'Movimiento',        color:'#FB923C', desc:'La corteza motora mueve boca y laringe.' },
    ]
  },
  {
    id:'memoria', emoji:'🔑',
    name:'Recordar un evento',
    intro:'Cada vez que recuerdas algo, el cerebro reconstruye el recuerdo activamente.',
    difficulty:3,
    steps:[
      { regionId:'prefrontal', label:'Intención',         color:'#FF8A65', desc:'La prefrontal inicia la búsqueda.' },
      { regionId:'temporal',   label:'Hipocampo activa',  color:'#38BDF8', desc:'El hipocampo recupera el trazo de memoria.' },
      { regionId:'occipital',  label:'Imagen visual',     color:'#34D399', desc:'El occipital reconstruye la imagen.' },
      { regionId:'parietal',   label:'Contexto espacial', color:'#A78BFA', desc:'El parietal sitúa la escena.' },
      { regionId:'frontal',    label:'Verificación',      color:'#FF6B6B', desc:'El frontal evalúa si el recuerdo es correcto.' },
    ]
  },
  {
    id:'miedo', emoji:'😱',
    name:'Sentir miedo',
    intro:'El miedo sigue una ruta ultrarrápida que bypasea el pensamiento consciente.',
    difficulty:3,
    steps:[
      { regionId:'temporal',   label:'Amígdala: alarma',  color:'#38BDF8', desc:'La amígdala detecta el peligro.' },
      { regionId:'brainstem',  label:'Respuesta corporal',color:'#F472B6', desc:'El tronco genera la respuesta de lucha/huida.' },
      { regionId:'prefrontal', label:'Evaluación racional',color:'#FF8A65', desc:'La prefrontal evalúa si la amenaza es real.' },
      { regionId:'frontal',    label:'Decisión consciente',color:'#FF6B6B', desc:'El frontal decide cómo responder.' },
    ]
  },
];

// Mapeo de regionId → coordenadas en el diagrama esquemático del pathway
const PATHWAY_REGION_POS = {
  frontal:    { x: 20, y: 20, label: 'Lóbulo\nFrontal',   color:'#FF6B6B' },
  prefrontal: { x: 10, y: 35, label: 'Corteza\nPrefrontal',color:'#FF8A65' },
  parietal:   { x: 60, y: 15, label: 'Lóbulo\nParietal',  color:'#A78BFA' },
  occipital:  { x: 80, y: 30, label: 'Lóbulo\nOccipital', color:'#34D399' },
  temporal:   { x: 50, y: 65, label: 'Lóbulo\nTemporal',  color:'#38BDF8' },
  cerebellum: { x: 75, y: 75, label: 'Cerebelo',          color:'#6EE7B7' },
  brainstem:  { x: 55, y: 85, label: 'Tronco',            color:'#F472B6' },
  broca:      { x: 22, y: 55, label: 'Área de\nBroca',    color:'#F9A8D4' },
  wernicke:   { x: 60, y: 50, label: 'Área de\nWernicke', color:'#2DD4BF' },
  motor:      { x: 42, y: 18, label: 'Corteza\nMotora',   color:'#FB923C' },
  somatosensory:{ x:52, y:18, label: 'C.\nSensorial',     color:'#FBBF24' },
};

// ── ÁREA INCORRECTA ──────────────────────────────────────────
const IDENTIFY_QUESTIONS = [
  {
    title: 'Una de estas funciones es incorrecta. ¿Cuál?',
    areas: [
      { id:'frontal',    name:'Lóbulo Frontal',    function:'Planificación y toma de decisiones', correct:true  },
      { id:'temporal',   name:'Lóbulo Temporal',   function:'Visión y procesamiento de colores',  correct:false },
      { id:'parietal',   name:'Lóbulo Parietal',   function:'Sensaciones corporales y tacto',     correct:true  },
      { id:'occipital',  name:'Lóbulo Occipital',  function:'Procesamiento visual',               correct:true  },
    ],
    wrongId: 'temporal',
    explanation: 'La VISIÓN es procesada por el lóbulo OCCIPITAL. El temporal procesa audición, lenguaje y memoria.',
  },
  {
    title: 'Identifica la afirmación incorrecta:',
    areas: [
      { id:'broca',      name:'Área de Broca',     function:'Producción del habla',              correct:true  },
      { id:'cerebellum', name:'Cerebelo',           function:'Memoria episódica a largo plazo',  correct:false },
      { id:'brainstem',  name:'Tronco encefálico', function:'Respiración y ritmo cardíaco',      correct:true  },
      { id:'wernicke',   name:'Área de Wernicke',  function:'Comprensión del lenguaje',          correct:true  },
    ],
    wrongId: 'cerebellum',
    explanation: 'El CEREBELO coordina movimientos y equilibrio. La memoria episódica depende del HIPOCAMPO.',
  },
  {
    title: '¿Qué afirmación sobre estos nervios craneales es FALSA?',
    areas: [
      { id:'n1', name:'Nervio Olfatorio (I)',   function:'Sentido del olfato',           correct:true  },
      { id:'n2', name:'Nervio Óptico (II)',      function:'Visión',                       correct:true  },
      { id:'n7', name:'Nervio Facial (VII)',     function:'Movimiento de los ojos',       correct:false },
      { id:'n10',name:'Nervio Vago (X)',         function:'Órganos viscerales abdominales',correct:true },
    ],
    wrongId: 'n7',
    explanation: 'El nervio FACIAL (VII) controla la expresión facial. Los MOVIMIENTOS OCULARES son del III (oculomotor).',
  },
  {
    title: '¿Cuál de estas funciones NO corresponde al área indicada?',
    areas: [
      { id:'prefrontal', name:'Corteza Prefrontal', function:'Empatía y razonamiento moral',   correct:true  },
      { id:'amygdala',   name:'Amígdala',           function:'Metabolismo de la glucosa',      correct:false },
      { id:'hippocampus',name:'Hipocampo',          function:'Formación de nuevos recuerdos',  correct:true  },
      { id:'motor',      name:'Corteza Motora',     function:'Control de movimientos voluntarios',correct:true },
    ],
    wrongId: 'amygdala',
    explanation: 'La AMÍGDALA procesa emociones y miedo, no el metabolismo. La glucosa la regula el hipotálamo y el páncreas.',
  },
  {
    title: 'Una de estas estructuras NO cumple la función indicada. ¿Cuál?',
    areas: [
      { id:'cerebellum', name:'Cerebelo',          function:'Coordinación y equilibrio',       correct:true  },
      { id:'broca',      name:'Área de Broca',     function:'Comprensión del lenguaje escrito',correct:false },
      { id:'occipital',  name:'Lóbulo Occipital',  function:'Procesamiento de imágenes',       correct:true  },
      { id:'temporal',   name:'Lóbulo Temporal',   function:'Procesamiento auditivo',          correct:true  },
    ],
    wrongId: 'broca',
    explanation: 'Broca PRODUCE el habla; la COMPRENSIÓN del lenguaje es función del área de WERNICKE.',
  },
  {
    title: 'Identifica el par craneal con función incorrecta:',
    areas: [
      { id:'n3',  name:'III — Oculomotor',   function:'Mueve los músculos del ojo',      correct:true  },
      { id:'n8',  name:'VIII — Vestibulococlear',function:'Audición y equilibrio',        correct:true  },
      { id:'n11', name:'XI — Accesorio',     function:'Deglución y gusto',               correct:false },
      { id:'n12', name:'XII — Hipogloso',    function:'Movimientos de la lengua',         correct:true  },
    ],
    wrongId: 'n11',
    explanation: 'El XI (Accesorio) controla los músculos esternocleidomastoideo y trapecio. La DEGLUCIÓN la controla el IX y X.',
  },
  {
    title: '¿Cuál estructura tiene la función incorrecta?',
    areas: [
      { id:'thalamus',   name:'Tálamo',            function:'Relé sensorial al córtex',       correct:true  },
      { id:'corpus',     name:'Cuerpo calloso',    function:'Conecta los dos hemisferios',     correct:true  },
      { id:'brainstem',  name:'Tronco encefálico', function:'Almacena recuerdos emocionales', correct:false },
      { id:'cerebellum', name:'Cerebelo',           function:'Aprendizaje motor procedimental',correct:true  },
    ],
    wrongId: 'brainstem',
    explanation: 'El TRONCO controla funciones vitales (respiración, ritmo cardíaco). Los recuerdos emocionales los almacena la AMÍGDALA.',
  },
];

// ── MENSAJES ──────────────────────────────────────────────────
const FEEDBACK = {
  correct: ['¡Excelente! 🎯','¡Correcto! 🧠','¡Así se hace! ⚡','¡Brillante! ✨','¡Perfecto! 🌟','¡Exacto! 💡'],
  wrong:   ['Casi 🤔','No esta vez 💪','Sigue intentando 🔬','Aprendemos del error 🧬','Buen intento 🌱'],
};

// ── UTIL SHUFFLE ──────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

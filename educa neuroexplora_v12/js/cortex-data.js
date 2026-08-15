/**
 * NeuroExplora — cortex-data.js
 * Escenarios de activación cortical coordinada y rizoma del pensamiento.
 */

// ── REGIONES (coordenadas en el SVG 560×380) ───────────────────
const CORTEX_REGIONS = [
  { id: 'prefrontal',    name: 'Corteza Prefrontal',     cx: 88,  cy: 130, r: 38, color: '#ff8a65' },
  { id: 'frontal',       name: 'Lóbulo Frontal',         cx: 175, cy: 105, r: 44, color: '#ff6b6b' },
  { id: 'motor',         name: 'Corteza Motora',         cx: 258, cy: 88,  r: 22, color: '#fb923c' },
  { id: 'somatosensory', name: 'C. Somatosensorial',     cx: 294, cy: 88,  r: 22, color: '#fbbf24' },
  { id: 'parietal',      name: 'Lóbulo Parietal',        cx: 352, cy: 100, r: 40, color: '#a78bfa' },
  { id: 'occipital',     name: 'Lóbulo Occipital',       cx: 440, cy: 165, r: 36, color: '#34d399' },
  { id: 'temporal',      name: 'Lóbulo Temporal',        cx: 235, cy: 265, r: 42, color: '#38bdf8' },
  { id: 'broca',         name: 'Área de Broca',          cx: 148, cy: 218, r: 18, color: '#f9a8d4' },
  { id: 'wernicke',      name: 'Área de Wernicke',       cx: 316, cy: 215, r: 18, color: '#2dd4bf' },
  { id: 'cerebellum',    name: 'Cerebelo',                cx: 400, cy: 330, r: 38, color: '#6ee7b7' },
  { id: 'brainstem',     name: 'Tronco Encefálico',      cx: 292, cy: 348, r: 18, color: '#f472b6' },
  { id: 'insula',        name: 'Ínsula',                  cx: 188, cy: 185, r: 16, color: '#e879f9' },
  { id: 'cingulate',     name: 'Cíngulo Anterior',        cx: 222, cy: 148, r: 16, color: '#818cf8' },
];

// ── ESCENARIOS DE ACTIVACIÓN ───────────────────────────────────
const ACTIVATION_SCENARIOS = [
  {
    id: 'reading',
    name: 'Leer una palabra',
    emoji: '📖',
    color: '#38bdf8',
    description: 'Cuando lees "árbol", tu cerebro no activa una sola región. En 150 ms se encienden en cascada la corteza visual, el área de Wernicke (significado), el giro angular (conversión grafema-fonema) y la corteza prefrontal (contexto). Todo simultáneo, todo coordinado.',
    sequence: [
      { regions: ['occipital'],              label: '0–50 ms: Corteza visual primaria reconoce los grafemas',          duration: 700 },
      { regions: ['occipital','parietal'],   label: '50–100 ms: Área de forma visual de palabras (VWFA) los integra',  duration: 700 },
      { regions: ['wernicke','temporal'],    label: '100–200 ms: Área de Wernicke recupera el significado',            duration: 800 },
      { regions: ['broca','frontal'],        label: '200–300 ms: Área de Broca articula la representación fonológica', duration: 800 },
      { regions: ['prefrontal','cingulate'], label: '300–400 ms: Corteza prefrontal integra contexto semántico',       duration: 900 },
    ],
    connections: [
      ['occipital','parietal'],['occipital','wernicke'],['wernicke','broca'],
      ['broca','frontal'],['frontal','prefrontal'],['parietal','wernicke'],
    ],
  },
  {
    id: 'fear',
    name: 'Sentir miedo',
    emoji: '😨',
    color: '#f97316',
    description: 'El miedo activa el cerebro en milisegundos y por dos vías en paralelo: una "vía corta" (tálamo → amígdala, ultrarrápida, antes de pensar) y una "vía larga" (tálamo → corteza → amígdala, más lenta pero consciente). Joseph LeDoux lo llamó "bajo camino" y "alto camino".',
    sequence: [
      { regions: ['brainstem'],                           label: 'Activación inmediata del tálamo — señal de alerta',     duration: 600 },
      { regions: ['brainstem','temporal'],                label: 'Vía corta: tálamo → amígdala (8 ms). Respuesta automática', duration: 700 },
      { regions: ['temporal','frontal','occipital'],      label: 'Vía larga: corteza evalúa el peligro conscientemente', duration: 800 },
      { regions: ['prefrontal','cingulate','insula'],     label: 'Corteza prefrontal intenta regular la respuesta emocional', duration: 900 },
      { regions: ['motor','brainstem','cerebellum'],      label: 'Sistema motor prepara respuesta de huida o lucha',      duration: 800 },
    ],
    connections: [
      ['brainstem','temporal'],['temporal','frontal'],['frontal','prefrontal'],
      ['prefrontal','cingulate'],['insula','cingulate'],['motor','cerebellum'],
    ],
  },
  {
    id: 'music',
    name: 'Escuchar música',
    emoji: '🎵',
    color: '#a78bfa',
    description: 'La música es el estímulo que más regiones cerebrales activa simultáneamente. Involucra audición, emoción, movimiento, lenguaje y memoria autobiográfica. Por eso puede traer recuerdos vívidos de hace 20 años: el sistema límbico y el hipocampo se activaron cuando formaste ese recuerdo musical.',
    sequence: [
      { regions: ['temporal'],                           label: 'Corteza auditiva primaria procesa tono y ritmo',              duration: 700 },
      { regions: ['temporal','parietal'],                label: 'Corteza auditiva de asociación construye la melodía completa', duration: 700 },
      { regions: ['frontal','broca'],                    label: 'Área de Broca procesa estructura musical y expectativa',       duration: 800 },
      { regions: ['temporal','frontal','cingulate'],     label: 'Sistema límbico responde emocionalmente — goosebumps',        duration: 900 },
      { regions: ['cerebellum','motor'],                 label: 'Cerebelo sincroniza respuesta motora — quieres moverte',      duration: 800 },
      { regions: ['prefrontal','temporal'],              label: 'Hipocampo y prefrontal activan memorias asociadas',           duration: 900 },
    ],
    connections: [
      ['temporal','parietal'],['temporal','frontal'],['frontal','broca'],
      ['frontal','cingulate'],['cingulate','temporal'],['cerebellum','motor'],
      ['prefrontal','temporal'],
    ],
  },
  {
    id: 'creative',
    name: 'Tener una idea',
    emoji: '💡',
    color: '#fbbf24',
    description: 'La creatividad no surge de una región especial: es el resultado de tres redes cerebrales trabajando en tensión dinámica. La Red por Defecto (ensueño/asociación libre), la Red de Control Ejecutivo (evaluación crítica) y la Red de Saliencia (detecta cuándo algo "encaja"). El momento "¡eureka!" ocurre cuando las tres se sincronizan.',
    sequence: [
      { regions: ['prefrontal','cingulate','temporal'],  label: 'Red por Defecto: mente divaga, asocia libremente',         duration: 900 },
      { regions: ['insula','cingulate'],                 label: 'Red de Saliencia detecta una conexión potencial',           duration: 700 },
      { regions: ['prefrontal','frontal','parietal'],    label: 'Red de Control Ejecutivo evalúa si tiene sentido',          duration: 800 },
      { regions: ['temporal','occipital','parietal'],    label: '¡Eureka! Integración multimodal — la idea toma forma',      duration: 1000 },
      { regions: ['frontal','broca','motor'],            label: 'El cerebro empieza a planificar cómo ejecutar la idea',     duration: 800 },
    ],
    connections: [
      ['prefrontal','cingulate'],['cingulate','temporal'],['insula','cingulate'],
      ['prefrontal','parietal'],['temporal','occipital'],['parietal','occipital'],
      ['frontal','broca'],['frontal','motor'],
    ],
  },
  {
    id: 'rhizome',
    name: '🌿 Rizoma del pensamiento',
    emoji: '🌿',
    color: '#34d399',
    isRhizome: true,
    description: 'El filósofo Deleuze propuso el "rizoma" como metáfora del pensamiento: no una estructura jerárquica (árbol) sino una red sin centro, sin principio ni fin definido, que puede ramificarse en cualquier dirección. La neurociencia contemporánea le da la razón: cada pensamiento activa patrones únicos, simultáneos y no-lineales en todo el cerebro.',
    sequence: [
      { regions: ['prefrontal'],  label: 'Un concepto inicial activa la corteza prefrontal',  duration: 500 },
      { regions: ['prefrontal','frontal','temporal'],  label: 'Se activan asociaciones semánticas en múltiples lóbulos', duration: 600 },
      { regions: ['prefrontal','frontal','temporal','parietal','occipital'], label: 'La activación se extiende como ondas en un estanque', duration: 700 },
      { regions: ['prefrontal','frontal','temporal','parietal','occipital','broca','wernicke'], label: 'El pensamiento alcanza áreas especializadas — cada una añade matices', duration: 700 },
      { regions: CORTEX_REGIONS.map(r=>r.id), label: 'Activación global simultánea: el pensamiento completo — único e irrepetible', duration: 1200 },
      { regions: ['prefrontal','insula','cingulate','temporal'], label: 'El cerebro "colapsa" a un patrón estable — la idea cristaliza', duration: 900 },
    ],
    connections: CORTEX_REGIONS.map(r=>r.id).flatMap((id,i,arr) =>
      i < arr.length-1 ? [[id, arr[Math.floor(Math.random()*arr.length)]]] : []
    ).slice(0,16),
    rhizomeNote: 'Cada vez que piensas en "árbol", el patrón de activación cerebral es diferente al del segundo anterior. No existen dos pensamientos neurológicamente idénticos. El cerebro no recupera — reconstruye.',
  },
];

// ── DATO GLOBAL ────────────────────────────────────────────────
const CORTEX_INTRO = {
  title: 'La Corteza en Funcionamiento',
  subtitle: 'Un cerebro no "piensa en un lugar" — piensa en todo a la vez',
  description: 'La idea de regiones cerebrales completamente aisladas (el "mapa de colores" del cerebro) es una simplificación pedagógica útil pero incompleta. En realidad, cada pensamiento, percepción o emoción activa redes distribuidas de regiones que trabajan en paralelo y en diálogo constante. Selecciona un escenario para ver cómo se coordinan.',
};

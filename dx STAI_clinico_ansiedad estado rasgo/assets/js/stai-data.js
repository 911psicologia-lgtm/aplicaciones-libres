const STATE_OPTIONS = [
  { value: 0, label: 'Nada' },
  { value: 1, label: 'Algo' },
  { value: 2, label: 'Bastante' },
  { value: 3, label: 'Mucho' }
];

const TRAIT_OPTIONS = [
  { value: 0, label: 'Casi nunca' },
  { value: 1, label: 'A veces' },
  { value: 2, label: 'A menudo' },
  { value: 3, label: 'Casi siempre' }
];

const STATE_ITEMS = [
  [1, 'Me siento calmado'],
  [2, 'Me siento seguro'],
  [3, 'Estoy tenso'],
  [4, 'Estoy contrariado'],
  [5, 'Me siento cómodo (estoy a gusto)'],
  [6, 'Me siento alterado'],
  [7, 'Estoy preocupado ahora por posibles desgracias futuras'],
  [8, 'Me siento descansado'],
  [9, 'Me siento angustiado'],
  [10, 'Me siento confortable'],
  [11, 'Tengo confianza en mí mismo'],
  [12, 'Me siento nervioso'],
  [13, 'Estoy desasosegado'],
  [14, 'Me siento muy «atado» (como oprimido)'],
  [15, 'Estoy relajado'],
  [16, 'Me siento satisfecho'],
  [17, 'Estoy preocupado'],
  [18, 'Me siento aturdido y sobreexcitado'],
  [19, 'Me siento alegre'],
  [20, 'En este momento me siento bien']
].map(([id, text]) => ({ id, text }));

const TRAIT_ITEMS = [
  [21, 'Me siento bien'],
  [22, 'Me canso rápidamente'],
  [23, 'Siento ganas de llorar'],
  [24, 'Me gustaría ser tan feliz como otros'],
  [25, 'Pierdo oportunidades por no decidirme pronto'],
  [26, 'Me siento descansado'],
  [27, 'Soy una persona tranquila, serena y sosegada'],
  [28, 'Veo que las dificultades se amontonan y no puedo con ellas'],
  [29, 'Me preocupo demasiado por cosas sin importancia'],
  [30, 'Soy feliz'],
  [31, 'Suelo tomar las cosas demasiado seriamente'],
  [32, 'Me falta confianza en mí mismo'],
  [33, 'Me siento seguro'],
  [34, 'No suelo afrontar las crisis o dificultades'],
  [35, 'Me siento triste (melancólico)'],
  [36, 'Estoy satisfecho'],
  [37, 'Me rondan y molestan pensamientos sin importancia'],
  [38, 'Me afectan tanto los desengaños que no puedo olvidarlos'],
  [39, 'Soy una persona estable'],
  [40, 'Cuando pienso sobre asuntos y preocupaciones actuales me pongo tenso y agitado']
].map(([id, text]) => ({ id, text }));

const DIRECT_STATE = new Set([3,4,6,7,9,12,13,14,17,18]);
const DIRECT_TRAIT = new Set([22,23,24,25,28,29,31,32,34,35,37,38,40]);

const AI_PROVIDERS = [
  ['ChatGPT', 'https://chatgpt.com/'],
  ['Gemini', 'https://gemini.google.com/'],
  ['Claude', 'https://claude.ai/'],
  ['Perplexity', 'https://www.perplexity.ai/'],
  ['Copilot', 'https://copilot.microsoft.com/'],
  ['Grok', 'https://grok.com/'],
  ['Poe', 'https://poe.com/'],
  ['You.com', 'https://you.com/'],
  ['DeepSeek', 'https://chat.deepseek.com/'],
  ['Mistral', 'https://chat.mistral.ai/']
];

window.STAI_DATA = { STATE_OPTIONS, TRAIT_OPTIONS, STATE_ITEMS, TRAIT_ITEMS, DIRECT_STATE, DIRECT_TRAIT, AI_PROVIDERS };

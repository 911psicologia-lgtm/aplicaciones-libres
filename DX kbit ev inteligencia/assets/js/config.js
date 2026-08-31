export const APP_VERSION = '0.3.0';
export const STORAGE_KEY = 'kbit-protocolo-v030';

export const CONTEXT_TYPES = [
  ['psicologico', 'Evaluación psicológica / proceso clínico'],
  ['educativo', 'Educativo / psicoeducativo'],
  ['juridico', 'Jurídico / forense'],
  ['laboral', 'Laboral / organizacional'],
  ['investigacion', 'Investigación'],
  ['orientacion', 'Orientación'],
  ['salud', 'Salud / rehabilitación'],
  ['academico', 'Académico'],
  ['institucional', 'Institucional'],
  ['otro', 'Otro'],
];

export const SUBTESTS = {
  vocabExpresivo: { label: 'Vocabulario expresivo', short: 'Vocab. expresivo', count: 45 },
  definiciones: { label: 'Definiciones', short: 'Definiciones', count: 37, minAgeMonths: 96 },
  matrices: { label: 'Matrices', short: 'Matrices', count: 48 },
};

export const CONFIDENCE_LEVELS = [68, 85, 90, 95, 99];

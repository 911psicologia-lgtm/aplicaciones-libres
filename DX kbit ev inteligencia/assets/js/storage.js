import { STORAGE_KEY, SUBTESTS } from './config.js';
import { todayLocalISO, uid } from './utils.js';

export function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({ item: i + 1, score: '', response: '', note: '' }));
}

export function newCase(seed = {}) {
  const id = seed.id || uid('kbit');
  const alias = seed.alias || `KBIT-${id.slice(-6).toUpperCase()}`;
  return {
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    patient: {
      fullName: '', documentId: '', birthDate: '', sex: '', education: '', occupation: '', institution: '', referrer: '',
      ...seed.patient,
    },
    evaluation: {
      applicationDate: todayLocalISO(), reason: '', contextType: 'psicologico', contextCustom: '', relevantData: '', contextDetails: '',
      ...seed.evaluation,
    },
    privacy: { alias, ...seed.privacy },
    professional: { fullName: '', registration: '', role: 'Psicólogo/a', institution: '', ...seed.professional },
    application: {
      activeSubtest: 'vocabExpresivo', activeIndex: 0,
      items: {
        vocabExpresivo: makeItems(SUBTESTS.vocabExpresivo.count),
        definiciones: makeItems(SUBTESTS.definiciones.count),
        matrices: makeItems(SUBTESTS.matrices.count),
      },
      adjustments: { vocabCredit: 0, matricesCredit: 0, vocabOverride: '', matricesOverride: '' },
      observations: '',
      ...seed.application,
    },
    scoring: { confidence: 90, ...seed.scoring },
    reports: { contextualAIText: '', technicalNotes: '', ...seed.reports },
  };
}

export function demoCaseM() {
  const c = newCase({
    patient: {
      fullName: 'M. (caso demostrativo)', documentId: 'DEMO-M-001', birthDate: '2016-04-14', sex: '',
      education: 'Escolaridad básica', occupation: '', institution: 'Institución de demostración', referrer: 'Remisión de ejemplo',
    },
    evaluation: {
      applicationDate: todayLocalISO(),
      reason: 'Exploración breve del funcionamiento cognitivo como apoyo a un proceso de evaluación psicológica.',
      contextType: 'psicologico',
      relevantData: 'Caso ficticio para probar el circuito completo de la aplicación. No corresponde a una persona real.',
      contextDetails: 'Se utiliza únicamente para verificar cálculo de edad, selección de baremo, registro, resultados y generación de informes.',
    },
    privacy: { alias: 'CASO-M-DEMO' },
    application: { observations: 'Aplicación de demostración: colaboración adecuada y condiciones estables.' },
  });

  // Datos ficticios para producir un perfil calculable sin representar un protocolo real.
  for (let i = 0; i < 32; i++) c.application.items.vocabExpresivo[i].score = 1;
  for (let i = 0; i < 19; i++) c.application.items.definiciones[i].score = 1; // bruto verbal = 51
  for (let i = 0; i < 31; i++) c.application.items.matrices[i].score = 1;      // bruto matrices = 31
  return c;
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentId: null, cases: {} };
    const parsed = JSON.parse(raw);
    return parsed?.cases ? parsed : { currentId: null, cases: {} };
  } catch {
    return { currentId: null, cases: {} };
  }
}

export function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function upsertCase(db, caseData) {
  caseData.updatedAt = new Date().toISOString();
  db.cases[caseData.id] = caseData;
  db.currentId = caseData.id;
  saveDB(db);
}

export function deleteCase(db, id) {
  delete db.cases[id];
  if (db.currentId === id) db.currentId = null;
  saveDB(db);
}

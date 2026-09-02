import { STORAGE_KEY, SUBTESTS } from './config.js';
import { todayLocalISO, uid } from './utils.js';
import { persistMirror } from './persistence.js';

export function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({
    item: i + 1, score: '', response: '', note: '', firstScore: null, firstResponse: '',
    responseSeconds: null, timerStart: null, timedOut: false, reapplications: []
  }));
}

export function newCase(seed = {}) {
  const id = seed.id || uid('kbit');
  const alias = seed.alias || `KBIT-${id.slice(-6).toUpperCase()}`;
  const baseItems={
    vocabExpresivo: makeItems(SUBTESTS.vocabExpresivo.count),
    definiciones: makeItems(SUBTESTS.definiciones.count),
    matrices: makeItems(SUBTESTS.matrices.count),
  };
  const seededItems=seed.application?.items || {};
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
    professional: { fullName: '', registration: '', role: 'Psicólogo/a', institution: '', address: '', phone: '', email: '', signatureDataUrl: '', ...seed.professional },
    application: {
      activeSubtest: 'vocabExpresivo', activeIndex: 0, discreetMode: true,
      ...seed.application,
      items: {
        vocabExpresivo: seededItems.vocabExpresivo || baseItems.vocabExpresivo,
        definiciones: seededItems.definiciones || baseItems.definiciones,
        matrices: seededItems.matrices || baseItems.matrices,
      },
      adjustments: { vocabOverride: '', matricesOverride: '', overrideReason: '', ...(seed.application?.adjustments||{}) },
      protocol: seed.application?.protocol || null,
      observations: seed.application?.observations || '',
    },
    scoring: { confidence: 90, ...seed.scoring },
    reports: { contextualAIText: '', technicalNotes: '', dossierContext: 'base', ...seed.reports },
  };
}

function setRange(items,a,b,scores){
  for(let n=a;n<=b;n++) items[n-1].score=Array.isArray(scores)?scores[n-a]:scores;
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
      contextDetails: 'Se utiliza únicamente para verificar edad, protocolo por bloques, resultados e informes.',
    },
    privacy: { alias: 'CASO-M-DEMO' },
    application: { observations: 'Aplicación demostrativa con condiciones estables.' },
  });

  const ve=c.application.items.vocabExpresivo, de=c.application.items.definiciones, ma=c.application.items.matrices;
  setRange(ve,1,20,'CREDIT'); setRange(ve,21,25,1); setRange(ve,26,30,1); setRange(ve,31,35,[1,1,1,1,0]); setRange(ve,36,40,[1,1,1,0,0]); setRange(ve,41,45,0);
  setRange(de,1,5,1); setRange(de,6,10,[1,1,1,1,0]); setRange(de,11,15,[1,1,1,0,0]); setRange(de,16,20,[1,1,0,0,0]); setRange(de,21,25,[1,0,0,0,0]); setRange(de,26,29,0); setRange(de,30,37,'SKIP');
  setRange(ma,1,9,'CREDIT'); setRange(ma,10,14,[1,1,1,1,0]); setRange(ma,15,19,[1,1,1,1,0]); setRange(ma,20,24,[1,1,1,0,0]); setRange(ma,25,29,[1,1,0,0,0]); setRange(ma,30,34,[1,0,0,0,0]); setRange(ma,35,39,0); setRange(ma,40,48,'SKIP');
  c.application.protocol={rulesVersion:'2.0.0',ageSignature:'10:4:17',events:[],subtests:{
    vocabExpresivo:{prepared:true,completed:true,omitted:false,stage:'complete',startItem:21,originalStartItem:21,initialBlock:{start:21,end:25,index:4},initialCorrect:5,returning:false,creditPrior:20,examplesPresented:false,exampleUsed:null,exampleResult:null,learningItems:[21,22],currentIndex:44,terminationReason:'Discontinuación: bloque 41-45 completamente fallado.',terminationBlock:'41-45',deviationNotes:'',decisionMessage:''},
    definiciones:{prepared:true,completed:true,omitted:false,stage:'complete',startItem:1,originalStartItem:1,initialBlock:{start:1,end:5,index:0},initialCorrect:5,returning:false,creditPrior:0,examplesPresented:true,exampleUsed:null,exampleResult:null,learningItems:[1,2],currentIndex:28,terminationReason:'Discontinuación: bloque 26-29 completamente fallado.',terminationBlock:'26-29',deviationNotes:'',decisionMessage:''},
    matrices:{prepared:true,completed:true,omitted:false,stage:'complete',startItem:10,originalStartItem:10,initialBlock:{start:10,end:14,index:2},initialCorrect:4,returning:false,creditPrior:9,examplesPresented:true,exampleUsed:'B',exampleResult:null,learningItems:[10,11],currentIndex:38,terminationReason:'Discontinuación: bloque 35-39 completamente fallado.',terminationBlock:'35-39',deviationNotes:'',decisionMessage:''}
  }};
  return c;
}


export function defaultSettings(){
  return {
    professionalProfile:{fullName:'',registration:'',role:'Psicólogo/a',institution:'',address:'',phone:'',email:'',signatureDataUrl:'',logoDataUrl:''},
    aiHub:{providers:{chatgpt:true,claude:true,gemini:true,perplexity:true,copilot:true},customName:'',customUrl:''}
  };
}
export function ensureDBSettings(db){
  db.settings ||= defaultSettings();
  db.settings.professionalProfile ||= defaultSettings().professionalProfile;
  db.settings.aiHub ||= defaultSettings().aiHub;
  db.settings.aiHub.providers ||= defaultSettings().aiHub.providers;
  return db.settings;
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentId: null, cases: {}, settings: defaultSettings(), savedAt: null };
    const parsed = JSON.parse(raw);
    if(parsed?.cases){ensureDBSettings(parsed);return parsed;} return { currentId: null, cases: {}, settings: defaultSettings(), savedAt: null };
  } catch {
    return { currentId: null, cases: {}, settings: defaultSettings(), savedAt: null };
  }
}

export function saveDB(db) { db.savedAt=new Date().toISOString(); ensureDBSettings(db); try{localStorage.setItem(STORAGE_KEY, JSON.stringify(db));}catch(err){console.warn('localStorage no pudo guardar todo el estado; se mantiene espejo IndexedDB.',err);} persistMirror(structuredClone(db)).catch(err=>console.warn('IndexedDB mirror',err)); }
export function upsertCase(db, caseData) { caseData.updatedAt = new Date().toISOString(); db.cases[caseData.id] = caseData; db.currentId = caseData.id; saveDB(db); }
export function deleteCase(db, id) { delete db.cases[id]; if (db.currentId === id) db.currentId = null; saveDB(db); }

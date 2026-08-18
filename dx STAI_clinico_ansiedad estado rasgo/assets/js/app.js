const { STATE_ITEMS, TRAIT_ITEMS, STATE_OPTIONS, TRAIT_OPTIONS, AI_PROVIDERS } = window.STAI_DATA;
const { scoreScale, descriptiveBand, decatypeBand, integratedProfile, ageFromBirthDate } = window.STAI_SCORING;
const { buildReportHtml } = window.STAI_REPORT;

const app = {
  step: 1,
  statePage: 0,
  traitPage: 0,
  responses: {},
  aiJson: null,
  copiedPrompt: '',
  reportUrl: null
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const byId = (id) => document.getElementById(id);

function toast(message){
  const el = byId('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 2200);
}

function setStep(n){
  app.step = Math.max(1, Math.min(5, n));
  $$('.screen').forEach(s => s.classList.toggle('active', Number(s.dataset.screen) === app.step));
  $$('.step-chip').forEach((s,i)=>{
    const num=i+1;
    s.classList.toggle('active', num===app.step);
    s.classList.toggle('done', num<app.step);
  });
  byId('progressFill').style.width = `${(app.step-1)/4*100}%`;
  window.scrollTo({top:0,behavior:'smooth'});
  if(app.step===4) refreshBaseSummary();
  if(app.step===5) refreshFinalSummary();
}

function field(id){ return (byId(id)?.value ?? '').trim(); }
function bool(id){ return !!byId(id)?.checked; }

function getPatient(){
  const refDate = field('applicationDate') ? new Date(`${field('applicationDate')}T12:00:00`) : new Date();
  return {
    name: field('patientName'),
    code: field('patientCode'),
    birthDate: field('birthDate'),
    age: ageFromBirthDate(field('birthDate'), refDate),
    sex: field('sex'),
    gender: field('gender'),
    normGroup: field('normGroup'),
    education: field('education'),
    occupation: field('occupation'),
    country: field('country'),
    applicationDate: field('applicationDate'),
    applicationTime: field('applicationTime'),
    evaluator: field('evaluator'),
    modality: field('modality'),
    context: field('context'),
    observations: field('observations')
  };
}

function renderQuestions(kind){
  const isState = kind==='state';
  const items = isState ? STATE_ITEMS : TRAIT_ITEMS;
  const options = isState ? STATE_OPTIONS : TRAIT_OPTIONS;
  const page = isState ? app.statePage : app.traitPage;
  const start = page*5;
  const subset = items.slice(start,start+5);
  const host = byId(isState?'stateQuestions':'traitQuestions');
  host.innerHTML = subset.map(item=>`<div class="qcard"><div class="qhead"><div class="qnum">${item.id}</div><div class="qtext">${item.text}</div></div><div class="options">${options.map(opt=>{
    const id=`${kind}-${item.id}-${opt.value}`;
    return `<div class="option"><input type="radio" name="${kind}-${item.id}" id="${id}" value="${opt.value}" ${String(app.responses[item.id])===String(opt.value)?'checked':''}><label for="${id}">${opt.label}</label></div>`;
  }).join('')}</div></div>`).join('');
  host.querySelectorAll('input[type=radio]').forEach(input=>input.addEventListener('change',e=>{
    const itemId = Number(e.target.name.split('-')[1]);
    app.responses[itemId]=Number(e.target.value);
    updateQuestionNav(kind);
  }));
  const currentEnd=Math.min(start+5,items.length);
  byId(isState?'statePageLabel':'traitPageLabel').textContent=`Ítems ${start+1}–${currentEnd} de 20`;
  byId(isState?'stateMicroFill':'traitMicroFill').style.width=`${currentEnd/20*100}%`;
  updateQuestionNav(kind);
}

function pageComplete(kind){
  const isState=kind==='state';
  const page=isState?app.statePage:app.traitPage;
  const items=(isState?STATE_ITEMS:TRAIT_ITEMS).slice(page*5,page*5+5);
  return items.every(i=>app.responses[i.id] !== undefined);
}

function updateQuestionNav(kind){
  const isState=kind==='state';
  const page=isState?app.statePage:app.traitPage;
  const prev=byId(isState?'statePrev':'traitPrev');
  const next=byId(isState?'stateNext':'traitNext');
  prev.disabled = page===0;
  next.disabled = !pageComplete(kind);
  next.textContent = page===3 ? (isState ? 'Continuar a Ansiedad-Rasgo' : 'Ver resultados base') : 'Siguiente bloque';
}

function nextQuestionPage(kind){
  if(!pageComplete(kind)){ toast('Responde los cinco ítems de este bloque.'); return; }
  if(kind==='state'){
    if(app.statePage<3){app.statePage++;renderQuestions('state');}
    else setStep(3);
  } else {
    if(app.traitPage<3){app.traitPage++;renderQuestions('trait');}
    else setStep(4);
  }
}

function prevQuestionPage(kind){
  if(kind==='state' && app.statePage>0){app.statePage--;renderQuestions('state');}
  if(kind==='trait' && app.traitPage>0){app.traitPage--;renderQuestions('trait');}
}

function currentResults(){
  const s=scoreScale(STATE_ITEMS, app.responses);
  const t=scoreScale(TRAIT_ITEMS, app.responses);
  const sd=field('stateDecatype');
  const td=field('traitDecatype');
  return {
    stateScore:s.score,
    traitScore:t.score,
    stateBand:descriptiveBand(s.score),
    traitBand:descriptiveBand(t.score),
    stateDecatype:sd,
    traitDecatype:td,
    stateDecatypeBand:decatypeBand(sd),
    traitDecatypeBand:decatypeBand(td),
    integrated:integratedProfile(s.score,t.score,sd,td),
    stateComplete:s.complete,
    traitComplete:t.complete,
    stateMissing:s.missing,
    traitMissing:t.missing
  };
}

function refreshBaseSummary(){
  const r=currentResults();
  byId('stateScore').textContent=r.stateScore ?? '—';
  byId('traitScore').textContent=r.traitScore ?? '—';
  byId('stateBand').textContent=r.stateDecatypeBand ? `${r.stateDecatypeBand} · decatipo ${r.stateDecatype}` : r.stateBand;
  byId('traitBand').textContent=r.traitDecatypeBand ? `${r.traitDecatypeBand} · decatipo ${r.traitDecatype}` : r.traitBand;
  byId('stateMeter').style.width=`${r.stateScore==null?0:r.stateScore/60*100}%`;
  byId('traitMeter').style.width=`${r.traitScore==null?0:r.traitScore/60*100}%`;
  byId('profileText').textContent=r.integrated;
  byId('aiGenerate').disabled=!(r.stateComplete&&r.traitComplete);
  byId('skipAi').disabled=!(r.stateComplete&&r.traitComplete);
}

function refreshFinalSummary(){
  const r=currentResults();
  const p=getPatient();
  byId('finalPatient').textContent = p.name || p.code || 'Persona evaluada';
  byId('finalScores').textContent = `A/E ${r.stateScore ?? '—'}/60 · A/R ${r.traitScore ?? '—'}/60`;
  byId('finalAi').textContent = app.aiJson ? 'Contextualización IA validada e integrada.' : 'Informe preparado sin contextualización IA.';
}

function buildPrompt(){
  const p=getPatient();
  const r=currentResults();
  const hc=field('clinicalHistory');
  const includeIdentifiers=bool('includeIdentifiers');
  const identity = includeIdentifiers ? {
    nombre:p.name || null,
    codigo:p.code || null
  } : {
    nombre:null,
    codigo:p.code || 'Paciente sin identificador nominal'
  };
  const data = {
    instrumento:'STAI - Inventario de Ansiedad Estado-Rasgo',
    paciente:{
      ...identity,
      edad:p.age || null,
      sexo_baremacion:p.sex || null,
      identidad_genero:p.gender || null,
      grupo_normativo:p.normGroup || null,
      escolaridad:p.education || null,
      ocupacion:p.occupation || null,
      pais_region:p.country || null,
      fecha_aplicacion:p.applicationDate || null,
      modalidad:p.modality || null,
      motivo_contexto:p.context || null,
      observaciones:p.observations || null
    },
    resultados:{
      ansiedad_estado:{puntuacion_directa:r.stateScore,rango:'0-60',lectura_descriptiva:r.stateBand,decatipo:r.stateDecatype||null,nivel_normativo:r.stateDecatypeBand||null},
      ansiedad_rasgo:{puntuacion_directa:r.traitScore,rango:'0-60',lectura_descriptiva:r.traitBand,decatipo:r.traitDecatype||null,nivel_normativo:r.traitDecatypeBand||null},
      perfil_integrado_base:r.integrated
    },
    historia_clinica_o_notas:hc || null
  };
  return `Actúa como asistente de análisis clínico para un profesional de salud mental. Vas a contextualizar resultados del STAI sin reemplazar el juicio clínico y sin convertir el instrumento en diagnóstico. Trabaja desde una lógica multicausal, relacional e interdependiente: evita explicaciones monocausales, distingue desencadenantes, mantenedores, vulnerabilidades, recursos y factores protectores, y señala contradicciones o vacíos de información.\n\nREGLAS OBLIGATORIAS:\n1. No inventes datos, antecedentes, síntomas, diagnósticos, riesgos ni eventos.\n2. Distingue claramente lo sustentado por el STAI de lo sustentado por la historia clínica/notas.\n3. Si no hay historia clínica, dilo y limita la contextualización a los datos disponibles.\n4. No diagnostiques a partir del STAI. Formula únicamente hipótesis de trabajo contrastables.\n5. No presentes como normativos los niveles descriptivos del rango 0-60. Si hay decatipos, puedes usarlos como dato normativo ingresado por el profesional, sin recalcularlos.\n6. Examina relaciones recíprocas y posibles bucles entre factores, no solo listas lineales.\n7. Señala factores protectores y recursos con el mismo cuidado que vulnerabilidades o tensiones.\n8. Devuelve SOLO JSON válido, sin Markdown, sin comentarios antes o después.\n\nDATOS DEL CASO:\n${JSON.stringify(data,null,2)}\n\nDEVUELVE EXACTAMENTE UN OBJETO JSON CON ESTA ESTRUCTURA (puedes dejar arrays vacíos si no hay soporte):\n{\n  "version": "STAI-IA-1.0",\n  "resumen_integrado": "síntesis clínica prudente y relacional",\n  "lectura_estado": "contextualización de Ansiedad-Estado",\n  "lectura_rasgo": "contextualización de Ansiedad-Rasgo",\n  "relacion_estado_rasgo": "cómo se relacionan ambos resultados sin asumir causalidad",\n  "factores_contextuales": [\n    {"factor":"nombre breve","tipo":"desencadenante|mantenedor|vulnerabilidad|protector|recurso|contexto","evidencia":"dato que lo sustenta","relacion":"vínculo con otros factores o con el perfil STAI","peso":0}\n  ],\n  "hipotesis_clinicas": [\n    {"hipotesis":"hipótesis de trabajo no diagnóstica","evidencia_a_favor":["..."],"evidencia_en_contra":["..."],"nivel_confianza":"bajo|medio|alto"}\n  ],\n  "dimensiones_contextuales": [\n    {"nombre":"dimensión clínica contextual","valor":0,"fundamento":"por qué se asigna este valor 0-100"}\n  ],\n  "relaciones": [\n    {"origen":"nombre exacto de un factor","destino":"nombre exacto de otro factor","tipo":"refuerza|modula|protege|tensiona|coexiste","intensidad":1,"explicacion":"..."}\n  ],\n  "recursos_protectores": ["..."],\n  "alertas": ["aspectos que requieren exploración clínica, sin inferir riesgo no documentado"],\n  "preguntas_clinicas_sugeridas": ["preguntas para contrastar hipótesis o completar vacíos"],\n  "recomendaciones_evaluacion": ["próximos focos de evaluación o triangulación, no prescripción automática"],\n  "limites_interpretativos": "límites, vacíos y cautelas del análisis"\n}\n\nPara "dimensiones_contextuales", genera entre 4 y 8 dimensiones SOLO si hay base suficiente. Los valores 0-100 son índices visuales cualitativos para el mapa radial del informe, NO puntajes psicométricos. Para "peso" usa 0-100 como intensidad contextual visual, NO como probabilidad ni medición validada.`;
}

async function copyPrompt(){
  const r=currentResults();
  if(!r.stateComplete||!r.traitComplete){ toast('Primero completa las 40 respuestas.'); return; }
  const prompt=buildPrompt();
  app.copiedPrompt=prompt;
  try{
    await navigator.clipboard.writeText(prompt);
    byId('copyState').classList.add('visible');
    byId('aiButtons').classList.add('visible');
    toast('Prompt copiado.');
  }catch{
    const ta=document.createElement('textarea');ta.value=prompt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    byId('copyState').classList.add('visible');byId('aiButtons').classList.add('visible');toast('Prompt copiado.');
  }
}

function cleanJsonText(text){
  let t=text.trim();
  t=t.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const first=t.indexOf('{'), last=t.lastIndexOf('}');
  if(first>=0&&last>first) t=t.slice(first,last+1);
  return t;
}

function validateAiJson(){
  const box=byId('aiResponse');
  const status=byId('jsonStatus');
  const raw=cleanJsonText(box.value);
  if(!raw){status.textContent='Pega primero la respuesta JSON de la IA.';status.className='status err';return false;}
  try{
    const obj=JSON.parse(raw);
    const required=['resumen_integrado','lectura_estado','lectura_rasgo','relacion_estado_rasgo'];
    const missing=required.filter(k=>typeof obj[k]!=='string');
    if(missing.length) throw new Error(`faltan campos: ${missing.join(', ')}`);
    for(const arr of ['factores_contextuales','hipotesis_clinicas','dimensiones_contextuales','relaciones','recursos_protectores','alertas','preguntas_clinicas_sugeridas','recomendaciones_evaluacion']){
      if(obj[arr]!==undefined && !Array.isArray(obj[arr])) throw new Error(`${arr} debe ser un arreglo`);
    }
    app.aiJson=obj;
    status.textContent='JSON válido. La contextualización está lista para el informe.';
    status.className='status ok';
    byId('goFinalWithAi').disabled=false;
    toast('Respuesta IA validada.');
    return true;
  }catch(err){
    app.aiJson=null;
    byId('goFinalWithAi').disabled=true;
    status.textContent=`No pude validar el JSON: ${err.message}`;
    status.className='status err';
    return false;
  }
}

function payload(){
  return {
    generatedAt:new Date().toLocaleString('es-CO'),
    patient:getPatient(),
    results:currentResults(),
    ai:app.aiJson,
    instrument:{
      name:'Inventario de Ansiedad Estado-Rasgo (STAI)',
      scoring:'0-3; ítems invertidos recodificados 3-respuesta; 20 ítems por escala; rango 0-60 por escala',
      note:'La clasificación normativa requiere baremo pertinente; la división descriptiva del rango no reemplaza los baremos.'
    }
  };
}

function downloadReport(){
  const data=payload();
  if(data.results.stateScore===null||data.results.traitScore===null){toast('Faltan respuestas para generar el informe.');return;}
  const html=buildReportHtml(data);
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const safe=(data.patient.name||data.patient.code||'paciente').replace(/[^a-z0-9áéíóúñ_-]+/gi,'_').slice(0,45);
  a.href=url;a.download=`Informe_STAI_${safe}.html`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  toast('Informe HTML generado.');
}

function previewReport(){
  const html=buildReportHtml(payload());
  if(app.reportUrl) URL.revokeObjectURL(app.reportUrl);
  app.reportUrl=URL.createObjectURL(new Blob([html],{type:'text/html'}));
  window.open(app.reportUrl,'_blank','noopener');
}

function resetAll(){
  if(!confirm('¿Deseas borrar las respuestas y comenzar un protocolo nuevo?')) return;
  app.responses={};app.aiJson=null;app.copiedPrompt='';app.statePage=0;app.traitPage=0;
  document.querySelector('form')?.reset();
  byId('applicationDate').value=new Date().toISOString().slice(0,10);
  byId('aiResponse').value='';byId('clinicalHistory').value='';byId('jsonStatus').textContent='';byId('goFinalWithAi').disabled=true;
  byId('aiButtons').classList.remove('visible');byId('copyState').classList.remove('visible');
  renderQuestions('state');renderQuestions('trait');setStep(1);
}

function setupAiButtons(){
  byId('aiButtons').innerHTML=AI_PROVIDERS.map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>`).join('');
}

function setup(){
  byId('applicationDate').value = new Date().toISOString().slice(0,10);
  setupAiButtons();
  renderQuestions('state');renderQuestions('trait');
  byId('birthDate').addEventListener('change',()=>{
    const a=ageFromBirthDate(field('birthDate'),field('applicationDate')?new Date(`${field('applicationDate')}T12:00:00`):new Date());
    byId('agePreview').value=a===''?'':`${a} años`;
  });
  byId('applicationDate').addEventListener('change',()=>byId('birthDate').dispatchEvent(new Event('change')));
  byId('toState').addEventListener('click',()=>setStep(2));
  byId('backData').addEventListener('click',()=>setStep(1));
  byId('backState').addEventListener('click',()=>setStep(2));
  byId('statePrev').addEventListener('click',()=>prevQuestionPage('state'));
  byId('stateNext').addEventListener('click',()=>nextQuestionPage('state'));
  byId('traitPrev').addEventListener('click',()=>prevQuestionPage('trait'));
  byId('traitNext').addEventListener('click',()=>nextQuestionPage('trait'));
  byId('backTrait').addEventListener('click',()=>setStep(3));
  byId('aiGenerate').addEventListener('click',copyPrompt);
  byId('validateJson').addEventListener('click',validateAiJson);
  byId('aiResponse').addEventListener('input',()=>{ app.aiJson=null; byId('goFinalWithAi').disabled=true; byId('jsonStatus').textContent=''; byId('jsonStatus').className='status'; });
  byId('goFinalWithAi').addEventListener('click',()=>{if(validateAiJson())setStep(5)});
  byId('skipAi').addEventListener('click',()=>{app.aiJson=null;setStep(5)});
  byId('backAi').addEventListener('click',()=>setStep(4));
  byId('downloadReport').addEventListener('click',downloadReport);
  byId('previewReport').addEventListener('click',previewReport);
  byId('resetAll').addEventListener('click',resetAll);
  byId('stateDecatype').addEventListener('input',refreshBaseSummary);
  byId('traitDecatype').addEventListener('input',refreshBaseSummary);

  if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
}

setup();

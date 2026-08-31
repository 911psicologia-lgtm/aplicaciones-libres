import { APP_VERSION, CONTEXT_TYPES, SUBTESTS, CONFIDENCE_LEVELS } from './config.js';
import { calculateChronologicalAge, ageLabel, esc, downloadBlob } from './utils.js';
import { loadDB, saveDB, upsertCase, deleteCase, newCase, demoCaseM } from './storage.js';
import { loadNorms, calculateCase } from './scoring.js';
import { buildTechnicalReport, buildLocalContextualReport, buildAIPrompt, buildAnonymousAIPayload, contextualReportWithAI } from './reports.js';
import { exportHtml, exportTxt, exportDoc, printPdf } from './export.js';
import { loadStimuli, getItemStimulus, getSubtestExamples, publishStimulus } from './stimuli.js';
import { loadProfessionalKey, loadApplicationRules, getKeyItem, nominalMatch } from './professional-key.js';
import { ensureProtocol, resetProtocol, prepareSubtest, advanceProtocol, getStartPlan, getBlock, isLearningItem, canJumpTo, recordDeviation } from './administration.js';
import { buildProtocolHtml, buildProtocolCsv } from './protocol-export.js';

const ROUTES = [
  ['home','Inicio'],['case','Caso'],['context','Contexto'],['application','Aplicación'],['review','Revisión'],
  ['results','Resultados'],['reports','Informes'],['manual','Manual'],['norms','Baremos']
];

let norms = null;
let stimuli = null;
let professionalKey = null;
let applicationRules = null;
let db = loadDB();
let route = 'home';
let reportTab = 'technical';
let protocolFlash = '';
let definitionTimerHandle = null;

const main = document.getElementById('main');
const nav = document.getElementById('nav');
document.getElementById('brand-version').textContent = `K-BIT · v${APP_VERSION} · Cloudflare-ready`;

function currentCase(){
  const c=db.currentId ? db.cases[db.currentId] || null : null;
  if(c){
    if(!c.professional)c.professional={fullName:'',registration:'',role:'Psicólogo/a',institution:''};
    c.application ||= {};c.application.adjustments ||= {};if(c.application.adjustments.overrideReason===undefined)c.application.adjustments.overrideReason='';
    for(const items of Object.values(c.application.items||{}))for(const it of items){if(it.firstScore===undefined)it.firstScore=null;if(it.firstResponse===undefined)it.firstResponse='';if(it.responseSeconds===undefined)it.responseSeconds=null;if(it.timerStart===undefined)it.timerStart=null;if(it.timedOut===undefined)it.timedOut=false;if(!it.reapplications)it.reapplications=[];}
  }
  return c;
}
function calc(){ const c=currentCase(); return c && norms ? calculateCase(c,norms) : null; }
function saveCurrent(){ const c=currentCase(); if(c) upsertCase(db,c); }
function contextText(c){
  const found=CONTEXT_TYPES.find(([id])=>id===c.evaluation.contextType);
  return c.evaluation.contextType==='otro' && c.evaluation.contextCustom ? c.evaluation.contextCustom : (found?.[1]||'No especificado');
}
function pageHeader(title,desc,actions=''){return `<div class="page-head"><div><h2>${title}</h2><p>${desc}</p></div><div class="head-actions no-print">${actions}</div></div>`}
function noCase(){return `${pageHeader('Sin caso activo','Crea o selecciona un caso para continuar.')}<div class="empty"><p>No hay una evaluación seleccionada.</p><div class="toolbar" style="justify-content:center;margin-top:12px"><button class="btn" data-action="new-case">Nueva evaluación</button><button class="btn ghost" data-action="load-demo">Caso M demo</button></div></div>`}

function renderNav(){
  const has=!!currentCase();
  nav.innerHTML=ROUTES.map(([id,label],i)=>`<button class="nav-btn ${route===id?'active':''}" data-route="${id}" ${!has && !['home','manual','norms'].includes(id)?'disabled':''}><span class="nav-num">${i+1}</span>${label}</button>`).join('');
}

function renderHome(){
  const cases=Object.values(db.cases).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const stimMeta = stimuli?.meta?.summary;
  return `${pageHeader('Evaluaciones','Crea, retoma o respalda evaluaciones. Los datos identificables permanecen en este navegador.',`<button class="btn" data-action="new-case">+ Nueva evaluación</button><button class="btn ghost" data-action="load-demo">Caso M demo</button>`)}
  ${stimMeta?`<div class="notice" style="margin-bottom:16px"><strong>Paquete de estímulos integrado:</strong> Vocabulario ${stimMeta.vocabExpresivo.available}/${stimMeta.vocabExpresivo.total_items} láminas · Definiciones ${stimMeta.definiciones.available}/${stimMeta.definiciones.total_items} láminas · Matrices ${stimMeta.matrices.available}/${stimMeta.matrices.total_items} láminas. El visor limpio sincronizado está disponible durante la aplicación.</div>`:''}
  <div class="card"><h3>Casos guardados localmente</h3>
    ${cases.length?`<div class="case-list">${cases.map(c=>{const a=calculateChronologicalAge(c.patient.birthDate,c.evaluation.applicationDate);return `<div class="case-row"><div><strong>${esc(c.patient.fullName||'Sin nombre')}</strong><div class="meta">${esc(c.privacy.alias)} · ${a?esc(ageLabel(a)):'edad pendiente'} · ${esc(contextText(c))}</div></div><div class="case-actions"><button class="btn sm" data-action="open-case" data-id="${c.id}">Abrir</button><button class="btn ghost sm" data-action="export-case" data-id="${c.id}">Respaldo</button><button class="btn danger sm" data-action="delete-case" data-id="${c.id}">Eliminar</button></div></div>`}).join('')}</div>`:`<div class="empty">Aún no hay evaluaciones guardadas.</div>`}
  </div>
  <div class="card"><h3>Respaldo y restauración</h3><p class="small muted">El respaldo contiene datos identificables. Consérvalo de manera segura.</p><div class="toolbar" style="margin-top:12px"><button class="btn ghost" data-action="export-db">Exportar todos los casos</button><label class="btn ghost" for="import-db" style="display:inline-flex">Importar respaldo</label><input id="import-db" type="file" accept="application/json,.json" class="hidden"></div></div>
  <div class="footer-note">Arquitectura actual: aplicación estática para Cloudflare Pages. Almacenamiento local mediante localStorage. Si abres <code>stimulos.html</code> en una segunda pestaña o dispositivo del mismo navegador, el visor limpio se sincroniza con el reactivo actual.</div>`;
}

function field(label,path,value,type='text',extra=''){ return `<div class="field"><label>${label}</label><input type="${type}" value="${esc(value)}" data-bind="${path}" ${extra}></div>`; }
function textarea(label,path,value,placeholder=''){ return `<div class="field"><label>${label}</label><textarea data-bind="${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></div>`; }

function renderCase(){
  const c=currentCase(); if(!c)return noCase();
  const r=calc(); const age=r?.age; const valid=r?.validAge;
  return `${pageHeader('Datos del evaluado','Los datos reales permanecen en la aplicación. Para IA se usa un alias y se excluyen identificadores directos.',`<button class="btn ghost" data-route="home">Volver a casos</button><button class="btn" data-route="context">Continuar →</button>`)}
  <div class="grid2">
    <div class="card"><h3>Identificación local</h3>
      ${field('Nombres y apellidos','patient.fullName',c.patient.fullName)}
      ${field('Documento / código','patient.documentId',c.patient.documentId)}
      <div class="grid2">${field('Fecha de nacimiento','patient.birthDate',c.patient.birthDate,'date','data-refresh="1"')}${field('Fecha de aplicación','evaluation.applicationDate',c.evaluation.applicationDate,'date','data-refresh="1"')}</div>
      <div class="grid2">${field('Sexo / género (opcional)','patient.sex',c.patient.sex)}${field('Escolaridad','patient.education',c.patient.education)}</div>
      <div class="grid2">${field('Ocupación','patient.occupation',c.patient.occupation)}${field('Institución / procedencia','patient.institution',c.patient.institution)}</div>
      ${field('Remitente','patient.referrer',c.patient.referrer)}
    </div>
    <div>
      <div class="card"><h3>Edad y selección normativa</h3>
        <div class="age-box"><div class="metric"><div class="k">Edad cronológica</div><div class="v">${age?`${age.years}a ${age.months}m ${age.days}d`:'—'}</div><div class="d">${age?`${age.totalMonths} meses cumplidos`:'Ingrese fechas válidas'}</div></div><div class="metric"><div class="k">Baremo automático</div><div class="v">${valid?esc(r.normBand.label):'—'}</div><div class="d">${valid?'Tabla C.1 seleccionada por edad':'Fuera de rango o edad pendiente'}</div></div></div>
        ${r?.warnings?.length?`<div class="notice warn" style="margin-top:12px">${r.warnings.map(esc).join('<br>')}</div>`:''}
      </div>
      <div class="card"><h3>Anonimización para IA</h3><div class="metric"><div class="k">Alias</div><div class="v" style="font-size:20px">${esc(c.privacy.alias)}</div><div class="d">El paquete IA no incluye nombre, documento, institución específica ni fecha exacta de nacimiento.</div></div>
      ${field('Alias editable','privacy.alias',c.privacy.alias)}</div>
    </div>
  </div>
  <div class="card" style="margin-top:16px"><h3>Profesional responsable del informe</h3>
    <div class="grid2">${field('Nombre del profesional','professional.fullName',c.professional.fullName)}${field('Registro / tarjeta profesional','professional.registration',c.professional.registration)}</div>
    <div class="grid2">${field('Rol profesional','professional.role',c.professional.role)}${field('Institución / consulta','professional.institution',c.professional.institution)}</div>
    <p class="small muted">Estos datos se incorporan al encabezado y firma del informe técnico. No forman parte del paquete anonimizado para IA.</p>
  </div>`;
}

function renderContext(){
  const c=currentCase();if(!c)return noCase();
  return `${pageHeader('Contextualización del caso','Registra solo información útil para interpretar posteriormente los resultados. Se utiliza tanto en el informe formal como en el contextualizado.',`<button class="btn ghost" data-route="case">← Datos</button><button class="btn" data-route="application">Comenzar aplicación →</button>`)}
  <div class="card">
    <div class="grid2"><div class="field"><label>Contexto de evaluación</label><select data-bind="evaluation.contextType" data-refresh="1">${CONTEXT_TYPES.map(([id,label])=>`<option value="${id}" ${c.evaluation.contextType===id?'selected':''}>${esc(label)}</option>`).join('')}</select></div>
    ${c.evaluation.contextType==='otro'?field('Especificar contexto','evaluation.contextCustom',c.evaluation.contextCustom):'<div></div>'}</div>
    ${textarea('Motivo de evaluación','evaluation.reason',c.evaluation.reason,'Pregunta, remisión o propósito concreto de la evaluación.')}
    ${textarea('Datos relevantes del caso','evaluation.relevantData',c.evaluation.relevantData,'Antecedentes, cambios recientes, fortalezas, dificultades u otra información valiosa para la lectura del caso.')}
    ${textarea('Contexto adicional para el informe','evaluation.contextDetails',c.evaluation.contextDetails,'Condiciones escolares, familiares, laborales, jurídicas, clínicas, investigativas u otras que deban ser consideradas.')}
  </div>
  <div class="notice" style="margin-top:16px"><strong>Uso para IA:</strong> el contenido contextual sí puede formar parte del paquete anonimizado. Evita incluir aquí nombres propios, números de documento, direcciones u otros identificadores si planeas utilizar asistencia de IA.</div>`;
}

function scoreStatsText(stats){return `${stats.correct} correctas · ${stats.incorrect} incorrectas · ${stats.credit||0} créditos · ${stats.skipped||0} no administradas · ${stats.pending} pendientes`}
function activeProtocolState(c,key){return c.application.protocol?.subtests?.[key]||null}
function itemStateClass(it, idx, current){
  if(idx===current) return 'current';
  if(it.score==='CREDIT') return 'credit';
  if(it.score==='SKIP'||it.score==='NA') return 'na';
  if(it.score===0 || it.score===1) return 'done';
  return '';
}
function renderQuickMap(c,key,items,current){
  return `<div class="item-quickmap no-print">${items.map((it,i)=>{const allowed=canJumpTo(c,key,i);return `<button class="item-dot ${itemStateClass(it,i,current)}" data-action="jump-item" data-index="${i}" title="Ítem ${i+1}" ${allowed?'':'disabled'}>${i+1}</button>`}).join('')}</div>`;
}
function professionalReference(key,item,response){
  if(!professionalKey) return '';
  const ref=getKeyItem(professionalKey,key,item); if(!ref) return '';
  if(key==='matrices') return `<details class="pro-key no-print"><summary>Clave profesional · evaluador</summary><div class="key-warning">USO PROFESIONAL — NO MOSTRAR AL EVALUADO. Clave de trabajo; verificar con material oficial antes de decisiones definitivas.</div><div>Alternativa esperada:</div><div class="key-answer">${esc(ref.answer)}</div></details>`;
  const match=nominalMatch(response,ref.answer);
  const status=response?(match===true?`<div class="notice match-ok" style="margin-top:8px"><strong>Coincidencia nominal exacta.</strong> Puede marcarse correcta si no hay otra incidencia.</div>`:`<div class="notice match-neutral" style="margin-top:8px"><strong>No coincide exactamente con la clave nominal.</strong> Revise equivalencias y criterios profesionales; no se convierte automáticamente en error.</div>`):'';
  return `<details class="pro-key no-print"><summary>Clave profesional · evaluador</summary><div class="key-warning">USO PROFESIONAL — NO MOSTRAR AL EVALUADO. La clave nominal no sustituye criterios de aceptación de respuestas.</div><div>Respuesta nominal esperada:</div><div class="key-answer">${esc(ref.answer)}</div>${status}</details>`;
}
function renderMatrixChoices(item){
  const options=['A','B','C','D','E','F','G','H'];
  return `<div><label class="small muted">Alternativa seleccionada</label><div class="matrix-choices">${options.map(o=>`<button class="matrix-choice ${String(item.response).toUpperCase()===o?'selected':''}" data-action="matrix-choice" data-choice="${o}">${o}</button>`).join('')}</div><div class="mini muted">La app compara la alternativa con la clave de trabajo y asigna 1/0. En ítems de aprendizaje conserva la primera selección puntuable.</div></div>`;
}
function protocolStatus(c,key,rules){
  const s=activeProtocolState(c,key); if(!s) return '';
  if(s.omitted) return `<div class="protocol-status"><strong>Ruta por edad:</strong> esta subprueba no se administra en este grupo de edad.</div>`;
  if(!s.prepared) return `<div class="protocol-status"><strong>Antes de puntuar:</strong> complete la preparación guiada de esta subprueba. La app elegirá el punto de inicio y el primer bloque.</div>`;
  const itemNo=c.application.activeIndex+1;const block=getBlock(rules,key,itemNo);
  const stage=s.stage==='return'?'RETORNO':s.stage==='initial'?'PRIMER BLOQUE':s.completed?'COMPLETA':'AVANCE';
  const credit=s.creditPrior?` · crédito previo: ${s.creditPrior}`:'';
  return `<div class="protocol-status"><strong>${stage}</strong> · inicio oficial ${s.originalStartItem} · bloque actual ${block?`${block.start}-${block.end}`:'—'}${credit}${protocolFlash?`<div class="protocol-flash">${esc(protocolFlash)}</div>`:''}</div>`;
}
function learningNotice(c,key,itemNo){
  if(!isLearningItem(c,key,itemNo)) return '';
  const it=c.application.items[key][itemNo-1];
  return `<div class="notice learn"><strong>Ítem de aprendizaje.</strong> Solo la primera respuesta puntuable determina 1/0. La explicación posterior puede asegurar comprensión, pero no cambia el puntaje.${it.firstScore===0||it.firstScore===1?` <button class="btn ghost sm" data-action="reset-learning-record">Corregir error de registro</button>`:''}</div>`;
}
function renderExamples(examples){
  if(!examples?.length) return '';
  return `<div class="prep-examples">${examples.map(ex=>`<div class="prep-example"><div class="small"><strong>${esc(ex.label)}</strong></div><img src="${esc(ex.path)}" alt="${esc(ex.label)}" loading="eager" decoding="async"></div>`).join('')}</div>`;
}
function renderPreparation(c,key,r){
  const age=r.age;const s=activeProtocolState(c,key);const cfg=SUBTESTS[key];const plan=getStartPlan(applicationRules,key,age.years,s?.exampleResult??null);const examples=getSubtestExamples(stimuli,key);
  if(plan?.omitted||s?.omitted) return `<div class="card prep-card"><h3>${esc(cfg.label)} no corresponde por edad</h3><p>Definiciones se administra desde los 8 años. La app la ha omitido sin añadir puntuación y continuará con la siguiente subprueba.</p><button class="btn" data-action="go-next-subtest">Continuar →</button></div>`;
  if(key==='vocabExpresivo'){
    const block=getBlock(applicationRules,key,plan.startItem);
    return `<div class="card prep-card"><div class="prep-step">PASO 1 DE ${r.definitionsActive?'3':'2'}</div><h3>Preparar Vocabulario expresivo</h3><p>Edad cronológica: <strong>${esc(ageLabel(age))}</strong>. Punto de inicio oficial: <strong>ítem ${plan.startItem}</strong> (bloque ${block.start}-${block.end}).</p><ol class="guide-list"><li>Coloque el estímulo de modo que el evaluado lo vea con claridad y mantenga la corrección fuera de su vista.</li><li>Comience en el ítem indicado. Los <strong>dos primeros ítems administrados</strong> son de aprendizaje: registre y puntúe la primera respuesta.</li><li>Complete todo el primer bloque. La app decidirá automáticamente continuar, acreditar ítems previos o retornar.</li><li>No hay límite específico de tiempo. Puede pedir aclaración neutral ante respuestas ambiguas sin revelar la solución.</li></ol><button class="btn" data-action="prepare-subtest" data-subtest="${key}">Iniciar en ítem ${plan.startItem} →</button></div>`;
  }
  if(key==='definiciones'){
    const block=getBlock(applicationRules,key,plan.startItem);
    return `<div class="card prep-card"><div class="prep-step">PASO 2 DE 3</div><h3>Preparar Definiciones</h3><p>Antes de los ítems puntuables deben presentarse los <strong>ejemplos A y B</strong>. Luego se inicia en <strong>ítem ${plan.startItem}</strong> (bloque ${block.start}-${block.end}).</p>${renderExamples(examples)}<ol class="guide-list"><li>Presente ambos ejemplos para asegurar que comprende la lógica de definición + letras parciales.</li><li>Al iniciar los ítems puntuables se activa un <strong>cronómetro irreversible de 30 s por ítem</strong>.</li><li>Repetir la pista o pedir una aclaración no pausa ni reinicia el tiempo.</li><li>Los dos primeros ítems puntuables administrados son de aprendizaje y conserva la primera respuesta para puntuar.</li></ol><button class="btn" data-action="prepare-subtest" data-subtest="${key}">Ejemplos presentados · iniciar ítem ${plan.startItem} →</button></div>`;
  }
  if(key==='matrices'){
    const ex=examples.filter(e=>e.label?.includes(`Ejemplo ${plan.example}`));
    if(plan.needsExampleDecision){
      return `<div class="card prep-card"><div class="prep-step">PASO 3 DE 3</div><h3>Preparar Matrices</h3><p>Para edades de 11 a 90 años, presente <strong>Ejemplo B</strong>. La ruta puntuable depende de la respuesta.</p>${renderExamples(ex)}<div class="matrix-example-decision"><button class="btn" data-action="prepare-matrix-route" data-result="correct">Ejemplo B correcto → iniciar 15</button><button class="btn ghost" data-action="prepare-matrix-route" data-result="incorrect">Ejemplo B incorrecto → iniciar 10</button></div><p class="small muted">El ejemplo no suma puntuación. Los dos primeros ítems puntuables posteriores son de aprendizaje.</p></div>`;
    }
    const block=getBlock(applicationRules,key,plan.startItem);
    return `<div class="card prep-card"><div class="prep-step">PASO 3 DE 3</div><h3>Preparar Matrices</h3><p>Presente <strong>Ejemplo ${plan.example}</strong> y después continúe en <strong>ítem ${plan.startItem}</strong> (bloque ${block.start}-${block.end}).</p>${renderExamples(ex)}<ol class="guide-list"><li>El evaluado puede señalar o indicar verbalmente la alternativa.</li><li>Los dos primeros ítems puntuables administrados son de aprendizaje; cuenta la primera selección.</li><li>No hay límite específico de tiempo.</li><li>Complete cada bloque. La app aplicará retorno, crédito previo y discontinuación por bloque completo de 0.</li></ol><button class="btn" data-action="prepare-subtest" data-subtest="${key}">Ejemplo presentado · iniciar ítem ${plan.startItem} →</button></div>`;
  }
  return '';
}

function currentStimulusData(){
  const c=currentCase(); if(!c || !stimuli) return null;
  const key=c.application.activeSubtest; const idx=c.application.activeIndex + 1;
  const raw = getItemStimulus(stimuli, key, idx);
  if(!raw) return null;
  return { ...raw, subtestKey:key, subtestLabel: SUBTESTS[key]?.label || key, itemNumber: idx };
}
function publishCurrentStimulus(){
  if(route!=='application') return;
  const stim=currentStimulusData();
  if(stim) publishStimulus(stim);
}

function preloadStimulusNeighbors(){
  const c=currentCase(); if(!c || !stimuli) return;
  const key=c.application.activeSubtest;
  const n=c.application.activeIndex+1;
  [n-1,n+1,n+2].forEach(itemNo=>{
    if(itemNo<1) return;
    const rec=getItemStimulus(stimuli,key,itemNo);
    if(rec?.status==='available' && rec.path){ const img=new Image(); img.decoding='async'; img.src=rec.path; }
  });
}


function clearDefinitionTimer(){ if(definitionTimerHandle){clearInterval(definitionTimerHandle);definitionTimerHandle=null;} }
function definitionElapsedMs(item){ return item?.timerStart ? Math.max(0,Date.now()-Number(item.timerStart)) : 0; }
function captureDefinitionTiming(item){
  if(!item?.timerStart) return {expired:false,seconds:null};
  const ms=definitionElapsedMs(item); const seconds=Math.min(30,Math.ceil(ms/1000));
  item.responseSeconds=seconds; return {expired:ms>=30000,seconds};
}
function armDefinitionTimer(){
  clearDefinitionTimer();
  if(route!=='application') return;
  const c=currentCase();if(!c||c.application.activeSubtest!=='definiciones') return;
  const s=activeProtocolState(c,'definiciones');if(!s?.prepared||s.completed) return;
  const item=getActiveItem();if(!item||item.score===0||item.score===1) return;
  if(!item.timerStart){item.timerStart=Date.now();saveCurrent();}
  const tick=()=>{
    const ms=definitionElapsedMs(item);const remaining=Math.max(0,30-Math.floor(ms/1000));const el=document.getElementById('def-timer');
    if(el){el.textContent=`${remaining} s`;el.classList.toggle('urgent',remaining<=10);}
    if(ms>=30000){
      item.timedOut=true;item.responseSeconds=30;
      const itemNo=c.application.activeIndex+1;
      if(isLearningItem(c,'definiciones',itemNo) && item.firstScore===null){item.firstScore=0;item.firstResponse=item.response||'';}
      item.score=0; item.note=(item.note?item.note+' · ':'')+'Tiempo agotado (30 s): puntuación 0.';
      protocolFlash=`Tiempo agotado en Definiciones ítem ${itemNo}: 0 puntos.`;saveCurrent();clearDefinitionTimer();render();
    }
  };
  tick(); definitionTimerHandle=setInterval(tick,250);
}
function nextSubtestKey(current,r){
  const order=['vocabExpresivo',...(r.definitionsActive?['definiciones']:[]),'matrices'];const i=order.indexOf(current);return order[i+1]||null;
}
function goNextSubtest(c,r,current){
  clearDefinitionTimer();const next=nextSubtestKey(current,r);
  if(!next){route='review';render();return;}
  c.application.activeSubtest=next;const st=activeProtocolState(c,next);c.application.activeIndex=st?.currentIndex??0;saveCurrent();protocolFlash='';render();
}

function renderApplication(){
  const c=currentCase();if(!c)return noCase(); const r=calc();clearDefinitionTimer();
  if(!r?.validAge) return `${pageHeader('Aplicación','Para seleccionar la ruta de administración se necesita una edad válida.')}<div class="notice warn">Completa la fecha de nacimiento y la fecha de aplicación antes de iniciar.</div><div class="toolbar" style="margin-top:14px"><button class="btn" data-route="case">Ir a datos del evaluado</button></div>`;
  ensureProtocol(c,r.age,applicationRules);saveCurrent();
  if(c.application.protocol?.legacyResponsesDetected) return `${pageHeader('Aplicación','Este caso contiene respuestas de una versión anterior no protocolizada.')}<div class="notice warn"><strong>Migración segura requerida.</strong> Para no interpretar respuestas antiguas como si hubieran seguido las nuevas reglas de inicio, retorno y discontinuación, la app no las reutiliza silenciosamente. Exporte primero el respaldo del caso si desea conservarlo y reinicie la administración para aplicar la ruta v0.7 desde cero.</div><div class="toolbar" style="margin-top:14px"><button class="btn danger" data-action="reset-administration">Reiniciar aplicación con reglas v0.7</button><button class="btn ghost" data-route="home">Volver a casos / respaldar</button></div>`;
  if(c.application.protocol?.ageMismatch) return `${pageHeader('Aplicación','La edad cronológica cambió después de iniciar el protocolo.')}<div class="notice warn"><strong>Reinicio necesario.</strong> Los puntos de inicio dependen de la edad. Para evitar una ruta híbrida, reinicie la administración y vuelva a comenzar con la edad actual.</div><div class="toolbar" style="margin-top:14px"><button class="btn danger" data-action="reset-administration">Reiniciar protocolo y respuestas</button><button class="btn ghost" data-route="case">Revisar fechas</button></div>`;
  const allowed=['vocabExpresivo',...(r.definitionsActive?['definiciones']:[]),'matrices'];
  if(!allowed.includes(c.application.activeSubtest)){c.application.activeSubtest='vocabExpresivo';c.application.activeIndex=0;saveCurrent()}
  const key=c.application.activeSubtest;const cfg=SUBTESTS[key];const st=activeProtocolState(c,key);
  if(st?.omitted) return `${pageHeader('Modo aplicación','La ruta se ajusta automáticamente a la edad.',`<button class="btn ghost" data-route="context">← Contexto</button>`)}${renderPreparation(c,key,r)}`;
  if(!st?.prepared) return `${pageHeader('Preparación guiada','Siga los pasos antes de presentar el primer reactivo puntuable.',`<button class="btn ghost" data-route="context">← Contexto</button><a class="btn ghost" href="./docs/manual-evaluador.html" target="_blank">Manual paso a paso</a>`)}<div class="steps"><span class="step-pill">Caso</span><span class="step-pill">Contexto</span><span class="step-pill active">Aplicación</span><span class="step-pill">Revisión</span><span class="step-pill">Resultados</span></div><div class="subtest-tabs">${allowed.map(k=>`<button class="subtest-tab ${key===k?'active':''}" data-action="switch-subtest" data-subtest="${k}">${esc(SUBTESTS[k].label)}${activeProtocolState(c,k)?.completed?' ✓':''}</button>`).join('')}</div>${renderPreparation(c,key,r)}`;
  if(st.completed) return `${pageHeader(`${cfg.label} completada`,'La ruta de bloques se cerró y la puntuación queda protegida para revisión.',`<button class="btn ghost" data-route="review">Revisión general</button>`)}<div class="card"><h3>Subprueba cerrada</h3><p><strong>${esc(st.terminationReason||'Finalizada')}</strong></p><p>Inicio: ítem ${st.originalStartItem} · crédito previo: ${st.creditPrior||0} · retorno: ${c.application.protocol.events.some(e=>e.subtest===key&&e.type==='return')?'sí':'no'}.</p><button class="btn" data-action="go-next-subtest">Continuar con la siguiente subprueba →</button></div>`;

  if(st.currentIndex!==null && c.application.activeIndex!==st.currentIndex)c.application.activeIndex=st.currentIndex;
  const items=c.application.items[key];const idx=Math.min(c.application.activeIndex,items.length-1);const item=items[idx];const stats=r.stats[key];const itemNo=idx+1;
  const progress=Math.round(((idx+1)/items.length)*100);const stim=currentStimulusData();
  setTimeout(()=>{publishCurrentStimulus();preloadStimulusNeighbors();if(key==='definiciones')armDefinitionTimer();},0);
  const stimBlock=stim?.status==='available'?`<div class="stimulus-stage" id="stimulus-stage"><img class="stimulus-image" src="${esc(stim.path)}" alt="${esc(stim.label)}" loading="eager" decoding="async" fetchpriority="high"></div>`:`<div class="stimulus-missing"><strong>Error técnico de recurso.</strong><br>El manifiesto no resolvió el estímulo ${itemNo}. Revise el paquete antes de administrar.</div>`;
  const responseUI=key==='matrices'?`${renderMatrixChoices(item)}<div class="field"><label>Alternativa registrada</label><input id="item-response" value="${esc(item.response)}" readonly class="readonly"></div>`:`<div class="field" style="margin-top:14px"><label>Respuesta del evaluado</label><textarea id="item-response" rows="3" placeholder="Transcriba la primera respuesta y las aclaraciones relevantes.">${esc(item.response)}</textarea></div>`;
  const timer=key==='definiciones'?`<div class="definition-timer"><span>Tiempo restante</span><strong id="def-timer">30 s</strong><small>No se pausa ni reinicia al repetir la pista.</small></div>`:'';
  const block=getBlock(applicationRules,key,itemNo);
  return `${pageHeader('Modo aplicación','La app guía punto de inicio, aprendizaje, retorno, crédito previo, bloques y discontinuación.',`<button class="btn ghost focus-toggle" data-action="toggle-focus">${document.body.classList.contains('focus-mode')?'Salir modo foco':'Modo foco'}</button><button class="btn ghost" data-action="record-deviation">Registrar desviación clínica</button><button class="btn" data-route="review">Revisar aplicación</button>`)}
  <div class="steps"><span class="step-pill">Caso</span><span class="step-pill">Contexto</span><span class="step-pill active">Aplicación</span><span class="step-pill">Revisión</span><span class="step-pill">Resultados</span></div>
  <div class="subtest-tabs">${allowed.map(k=>`<button class="subtest-tab ${key===k?'active':''}" data-action="switch-subtest" data-subtest="${k}">${esc(SUBTESTS[k].label)}${activeProtocolState(c,k)?.completed?' ✓':''}</button>`).join('')}</div>
  ${protocolStatus(c,key,applicationRules)}
  <div class="apply-layout"><div class="apply-top"><div><strong>${esc(cfg.label)}</strong><div class="small muted">${scoreStatsText(stats)}</div></div><div class="toolbar"><span class="badge">Ítem ${itemNo}</span><span class="badge">Bloque ${block?`${block.start}-${block.end}`:'—'}</span><span class="badge">Baremo ${esc(r.normBand.label)}</span></div></div><div class="progress"><span style="width:${progress}%"></span></div>${renderQuickMap(c,key,items,idx)}
  <div class="apply-grid" style="margin-top:12px"><div class="stimulus-card"><div class="stimulus-head"><div><h3>Estímulo visual</h3><div class="small muted">Cobertura visual completa. ${stim?.substitute?'Este reactivo utiliza el sustituto aprobado e identificado en auditoría.':'Reactivo integrado.'}</div></div><div class="toolbar no-print"><button class="btn ghost sm" data-action="open-viewer">Visor limpio</button><button class="btn ghost sm" data-action="fullscreen-stimulus">Pantalla completa</button></div></div>${stimBlock}<div class="stimulus-summary"><span class="k-pill">Ítem ${itemNo} de ${items.length}</span>${stim?.substitute?'<span class="k-pill">Sustituto aprobado</span>':''}</div><div class="stimulus-note">Presente el estímulo sin mostrar la clave profesional. Fuera de aprendizaje no indique si la respuesta fue correcta o incorrecta.</div></div>
  <div class="item-card"><div class="item-number">Ítem ${itemNo} · bloque ${block?`${block.start}-${block.end}`:'—'}</div><h3>Registrar y calificar</h3>${timer}${learningNotice(c,key,itemNo)}${responseUI}${professionalReference(key,itemNo,item.response)}
  ${key==='matrices'?'':`<div class="score-buttons"><button class="score-btn incorrect ${String(item.score)==='0'?'selected':''}" data-action="score-item" data-score="0">0 · Incorrecta</button><button class="score-btn ${String(item.score)==='1'?'selected':''}" data-action="score-item" data-score="1">1 · Correcta</button></div>`}
  <div class="toolbar" style="margin:8px 0"><button class="btn ghost sm" data-action="mark-incidence">No administrado / incidencia</button>${key!=='definiciones' && (item.score===0||item.score===1)?'<button class="btn ghost sm" data-action="record-reapplication">Registrar reaplicación clínica excepcional</button>':''}</div>
  <div class="field"><label>Observación breve del ítem</label><textarea id="item-note" rows="2" placeholder="Aclaración, repetición, autocorrección, conducta o incidencia.">${esc(item.note)}</textarea></div>
  <div class="apply-nav"><button class="btn ghost" data-action="move-item" data-delta="-1" ${idx===0?'disabled':''}>← Anterior</button><button class="btn" data-action="move-item" data-delta="1">Siguiente →</button></div><div class="keyboard-help">Atajos fuera de campos: <strong>0</strong> incorrecta · <strong>1</strong> correcta · <strong>←/→</strong> navegación.</div></div></div></div>`;
}

function renderReview(){
  const c=currentCase();if(!c)return noCase();const r=calc();ensureProtocol(c,r.age,applicationRules);
  const rows=[['Vocabulario expresivo',r.stats.vocabExpresivo],...(r.definitionsActive?[['Definiciones',r.stats.definiciones]]:[]),['Matrices',r.stats.matrices]];
  const ps=c.application.protocol?.subtests||{};
  const trace=[['Vocabulario expresivo',ps.vocabExpresivo],...(r.definitionsActive?[['Definiciones',ps.definiciones]]:[]),['Matrices',ps.matrices]];
  const allComplete=trace.every(([,x])=>x?.completed);
  return `${pageHeader('Revisión y cierre','La ruta protocolizada calcula automáticamente crédito previo, retorno y discontinuación. Revise incidencias antes de interpretar.',`<button class="btn ghost" data-route="application">← Aplicación</button><button class="btn" data-route="results" ${allComplete?'':'disabled'}>Calcular resultados →</button>`)}
  ${allComplete?'<div class="notice"><strong>Administración cerrada.</strong> Las tres rutas requeridas por edad están completas.</div>':'<div class="notice warn"><strong>Administración incompleta.</strong> Regrese a Aplicación y cierre las subpruebas pendientes antes de interpretar.</div>'}
  <div class="grid2" style="margin-top:16px"><div class="card"><h3>Estado de registro</h3><div class="review-list">${rows.map(([name,s])=>`<div class="review-row"><div><strong>${name}</strong></div><div><div class="num">${s.correct}</div><div class="lab">correctas</div></div><div><div class="num">${s.incorrect}</div><div class="lab">incorrectas</div></div><div><div class="num">${s.credit}</div><div class="lab">créditos</div></div><div><div class="num">${s.skipped}</div><div class="lab">no adm.</div></div></div>`).join('')}</div></div>
  <div class="card"><h3>Puntuaciones directas automáticas</h3><table class="audit-table"><tbody><tr><th>Vocabulario expresivo</th><td>${r.raw.exp}</td></tr>${r.definitionsActive?`<tr><th>Definiciones</th><td>${r.raw.def}</td></tr>`:''}<tr><th>VOCABULARIO</th><td><strong>${r.raw.vocabCalculated}</strong></td></tr><tr><th>MATRICES</th><td><strong>${r.raw.matricesCalculated}</strong></td></tr></tbody></table><p class="small muted">Los créditos previos se incorporan automáticamente solo cuando el primer bloque cumple suficiencia (≥2 aciertos). No se usa una basal tipo Wechsler.</p></div></div>
  <div class="card"><h3>Trazabilidad protocolaria</h3><table class="audit-table"><thead><tr><th>Subprueba</th><th>Inicio</th><th>1.er bloque</th><th>Retorno</th><th>Crédito</th><th>Cierre</th></tr></thead><tbody>${trace.map(([label,x])=>`<tr><td>${label}</td><td>${x?.originalStartItem??'—'}</td><td>${x?.initialCorrect??'—'} aciertos</td><td>${(c.application.protocol.events||[]).some(e=>e.subtest===Object.keys(ps).find(k=>ps[k]===x)&&e.type==='return')?'Sí':'No'}</td><td>${x?.creditPrior??0}</td><td>${esc(x?.terminationReason||'Pendiente')}</td></tr>`).join('')}</tbody></table></div>
  <div class="grid2"><div class="card"><h3>Anulación profesional excepcional</h3><p class="small muted">Úsela solo si necesita documentar una corrección manual justificada. La ruta automática permanece registrada en el expediente.</p><div class="grid2">${field('Bruto final manual Vocabulario','application.adjustments.vocabOverride',c.application.adjustments.vocabOverride,'number')}${field('Bruto final manual Matrices','application.adjustments.matricesOverride',c.application.adjustments.matricesOverride,'number')}</div>${textarea('Motivo de la anulación','application.adjustments.overrideReason',c.application.adjustments.overrideReason||'','Obligatorio si modifica una puntuación directa calculada automáticamente.')}</div>
  <div class="card"><h3>Parámetros de interpretación</h3><div class="field"><label>Nivel de confianza</label><select data-bind="scoring.confidence" data-refresh="1">${CONFIDENCE_LEVELS.map(n=>`<option ${Number(c.scoring.confidence)===n?'selected':''} value="${n}">${n}%</option>`).join('')}</select></div><div class="toolbar"><button class="btn ghost sm" data-action="export-protocol" data-format="html">Protocolo digital HTML</button><button class="btn ghost sm" data-action="export-protocol" data-format="csv">Protocolo CSV</button><button class="btn danger sm" data-action="reset-administration">Reiniciar aplicación</button></div></div></div>
  <div class="card">${textarea('Observaciones globales de la aplicación','application.observations',c.application.observations,'Conducta, colaboración, comprensión de la tarea, condiciones ambientales, pausas, incidencias y desviaciones.')}</div>
  ${r.warnings.length?`<div class="notice warn" style="margin-top:16px"><strong>Revisión requerida:</strong><ul class="warning-list">${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}`;
}

function resultCard(label,d,key){if(!d)return `<div class="result-card"><div class="label">${label}</div><div class="big">—</div><div class="cat">Sin cálculo</div></div>`;const val=d[key];return `<div class="result-card"><div class="label">${label}</div><div class="big">${val}</div><div class="cat">${esc(d.category||'—')}</div><div class="details">Percentil ${esc(d.percentile??'—')} · Eneatipo ${esc(d.stanine??'—')}<br>${d.ic?`IC ${currentCase().scoring.confidence}%: ${d.ic[0]}–${d.ic[1]}`:'IC no disponible'}</div></div>`}
function profileRow(label,value){if(value===null||value===undefined)return'';const pct=Math.max(0,Math.min(100,((value-40)/120)*100));return `<div class="profile-row"><span>${label}</span><div class="profile-track"><span class="profile-mid"></span><span class="profile-fill" style="width:${pct}%"></span></div><strong>${value}</strong></div>`}
function renderResults(){
  const c=currentCase();if(!c)return noCase();const r=calc();
  const d=r.difference;
  return `${pageHeader('Resultados','Conversión automática con C.1–C.5: puntuaciones típicas, compuesto, intervalos, interpretación y discrepancia entre escalas.',`<button class="btn ghost" data-route="review">← Revisar</button><button class="btn" data-route="reports">Generar informes →</button>`)}
  ${r.warnings.length?`<div class="notice warn"><ul class="warning-list">${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}
  <div class="result-cards">${resultCard('Verbal / Vocabulario',r.verbal,'pt')}${resultCard('No verbal / Matrices',r.nonverbal,'pt')}${resultCard('CI compuesto',r.composite,'ci')}</div>
  <div class="card profile"><h3>Perfil de puntuaciones</h3>${profileRow('Verbal',r.verbal?.pt)}${profileRow('No verbal',r.nonverbal?.pt)}${profileRow('Compuesto',r.composite?.ci)}<div class="mini muted">Escala visual 40–160. La línea central corresponde a 100.</div></div>
  <div class="difference-box"><h3 style="font-size:16px">Comparación verbal–no verbal</h3>${d?`<p>Diferencia: <strong>${d.signed>0?'+':''}${d.signed}</strong> puntos (${esc(d.direction)}). Valor absoluto: ${d.absolute}.</p><div class="status-row"><span class="badge ${d.significant05?'':'warn'}">p&lt;0,05: ${d.significant05?'significativa':'no significativa'} · corte ${d.p05Threshold}</span><span class="badge ${d.significant01?'':'warn'}">p&lt;0,01: ${d.significant01?'significativa':'no significativa'} · corte ${d.p01Threshold}</span></div>`:'<p>Sin datos suficientes.</p>'}</div>
  <div class="footer-note">Tramo normativo utilizado: ${esc(r.normBand?.label||'—')} · edad ${r.ageMonths??'—'} meses · confianza ${c.scoring.confidence}%.</div>`;
}

function reportBody(){const c=currentCase();const r=calc();return reportTab==='technical'?buildTechnicalReport(c,r):contextualReportWithAI(c,r)}
function renderReports(){
  const c=currentCase();if(!c)return noCase();const r=calc();const body=reportBody();
  const contextual=reportTab==='contextual';
  return `${pageHeader('Informes','El informe técnico conserva el núcleo psicométrico completo; el contextualizado integra antecedentes e hipótesis sin perder percentiles, intervalos ni discrepancias.',`<button class="btn ghost" data-route="results">← Resultados</button>`)}
  <div class="report-tabs"><button class="report-tab ${!contextual?'active':''}" data-action="report-tab" data-tab="technical">Informe técnico</button><button class="report-tab ${contextual?'active':''}" data-action="report-tab" data-tab="contextual">Informe contextualizado</button></div>
  <div class="toolbar no-print" style="margin-bottom:14px"><button class="btn sm" data-action="export-report" data-format="html">HTML enriquecido</button><button class="btn ghost sm" data-action="export-report" data-format="txt">TXT</button><button class="btn ghost sm" data-action="export-report" data-format="doc">DOC / Word</button><button class="btn ghost sm" data-action="export-report" data-format="pdf">PDF / imprimir</button><button class="btn soft sm" data-action="export-protocol" data-format="html">Protocolo digital</button><button class="btn soft sm" data-action="export-dossier">Expediente integrado</button><a class="btn soft sm" href="./docs/plantillas/Plantilla_KBIT_respuestas_original.pdf" download>Plantilla de respuestas</a></div>
  <div class="notice" style="margin-bottom:14px"><strong>Anexo de protocolo:</strong> la plantilla de respuestas se conserva sin modificaciones, tal como fue aportada, para poder archivarla junto con el informe o imprimirla durante la aplicación.</div>
  ${contextual?`<div class="card ai-box no-print"><h3>Asistencia de IA con anonimización</h3><p class="small muted">La aplicación no envía datos automáticamente. Copia el prompt anonimizado, utilízalo con el sistema de IA autorizado y pega después el borrador. El informe final vuelve a incorporar localmente la identificación real.</p><div class="toolbar" style="margin:12px 0"><button class="btn ghost sm" data-action="copy-ai-prompt">Copiar prompt anonimizado</button><button class="btn ghost sm" data-action="download-ai-payload">Descargar paquete IA</button><button class="btn soft sm" data-action="use-local-context">Usar borrador local</button></div><div class="field"><label>Borrador contextual asistido (opcional)</label><textarea data-bind="reports.contextualAIText" placeholder="Pega aquí la respuesta de la IA. Si queda vacío, se utiliza el borrador contextual local.">${esc(c.reports.contextualAIText)}</textarea></div><div class="notice">La IA debe conservar el núcleo técnico y separar datos observados, condiciones asociadas e hipótesis interpretativas; no debe inferir causalidad.</div></div>`:''}
  <div class="report-preview">${body}</div>`;
}

function renderManual(){
  return `${pageHeader('Manual del evaluador','Guía paso a paso para administrar el K-BIT clásico español con esta aplicación. Las decisiones de inicio, retorno, crédito y discontinuación ya están incorporadas.',`<a class="btn" href="./docs/manual-evaluador.html" target="_blank">Abrir manual</a><a class="btn ghost" href="./docs/manual-evaluador.pdf" download>Descargar PDF</a><a class="btn ghost" href="./docs/manual-evaluador.docx" download>Descargar DOCX</a><a class="btn soft" href="./docs/plantillas/Plantilla_KBIT_respuestas_original.pdf" download>Plantilla de respuestas</a>`)}
  <div class="notice"><strong>Versión protocolizada.</strong> La app trabaja por bloques de 4 o 5 ítems; no utiliza reglas de fallos consecutivos. El primer bloque decide continuidad, crédito previo o retorno. La discontinuación ocurre cuando un bloque completo obtiene 0.</div>
  <div class="card"><h3>Secuencia completa</h3><div class="manual-protocol-grid">
    <div class="manual-link"><strong>1. Antes de aplicar</strong><p class="small muted">Verifique K-BIT clásico español, ambiente, datos y fecha. La edad se calcula con la regla 30 días/12 meses del manual.</p></div>
    <div class="manual-link"><strong>2. Vocabulario expresivo</strong><p class="small muted">La app indica el inicio: 1, 6, 11, 16, 21, 26 o 31 según edad. Complete el primer bloque; la app decide la ruta.</p></div>
    <div class="manual-link"><strong>3. Definiciones</strong><p class="small muted">Desde 8 años. Presente ejemplos A/B, luego inicio 1 (8-14) o 6 (15-90). Temporizador 30 s no reiniciable.</p></div>
    <div class="manual-link"><strong>4. Matrices</strong><p class="small muted">4-5: ejemplo A → 1. 6-10: ejemplo B → 10. 11-90: ejemplo B correcto →15; incorrecto →10.</p></div>
    <div class="manual-link"><strong>5. Durante los bloques</strong><p class="small muted">Los dos primeros ítems administrados son de aprendizaje. Cuenta la primera respuesta. Bloque completo de 0 = discontinuación, salvo retorno desde un inicio posterior a 1.</p></div>
    <div class="manual-link"><strong>6. Cierre</strong><p class="small muted">Revise trazabilidad, crédito automático, tiempos e incidencias; después calcule resultados y genere los dos informes.</p></div>
  </div></div>
  <div class="grid2"><div class="card"><h3>Puntos de inicio - Vocabulario expresivo</h3><table class="audit-table"><tbody><tr><td>4-5 años</td><td>Ítem 1</td></tr><tr><td>6</td><td>6</td></tr><tr><td>7</td><td>11</td></tr><tr><td>8</td><td>16</td></tr><tr><td>9-10</td><td>21</td></tr><tr><td>11-12</td><td>26</td></tr><tr><td>13-90</td><td>31</td></tr></tbody></table></div>
  <div class="card"><h3>Regla del primer bloque</h3><table class="audit-table"><tbody><tr><td>≥2 aciertos</td><td>Continuar + crédito de ítems previos si inició después de 1.</td></tr><tr><td>1 acierto, inicio=1</td><td>Continuar.</td></tr><tr><td>1 acierto, inicio&gt;1</td><td>Retorno al ítem 1.</td></tr><tr><td>0 aciertos, inicio=1</td><td>Terminar.</td></tr><tr><td>0 aciertos, inicio&gt;1</td><td>Retornar.</td></tr></tbody></table></div></div>
  <div class="card"><h3>Qué puede hacer el evaluador ante respuestas dudosas</h3><ul class="guide-list"><li>Puede pedir una aclaración neutral cuando una respuesta verbal sea ambigua, sin revelar la solución.</li><li>Si aparecen varias respuestas y no queda claro cuál es definitiva, solicite que el evaluado elija una.</li><li>Fuera de aprendizaje, no informe si una respuesta es correcta o incorrecta.</li><li>En Definiciones, una autocorrección solo puede aceptarse dentro de los 30 segundos y antes de avanzar.</li><li>En Vocabulario expresivo no penalice pronunciación imperfecta cuando la palabra sea inequívocamente reconocible.</li><li>Cualquier desviación clínica excepcional debe registrarse con el botón “Registrar desviación clínica”.</li></ul></div>
  <div class="notice warn"><strong>Control de versión:</strong> estas reglas corresponden al K-BIT clásico español, no a KBIT-2 ni KBIT-2 Revised. La app conserva la fuente de auditoría dentro del paquete.</div>`;
}

function renderNorms(){
  if(!norms)return `<div class="notice warn">Los baremos no pudieron cargarse.</div>`;
  const m=norms.meta;
  const stimSum = stimuli?.meta?.summary;
  return `${pageHeader('Baremos incorporados','Módulo técnico de auditoría. Los baremos se cargan automáticamente y ya no forman parte del flujo cotidiano de aplicación.')}
  <div class="norm-grid"><div class="norm-stat"><strong>${m.verbalRows}</strong><span>filas escala verbal</span></div><div class="norm-stat"><strong>${m.nonverbalRows}</strong><span>filas escala no verbal</span></div><div class="norm-stat"><strong>${m.compositeRows}</strong><span>conversiones compuesto</span></div><div class="norm-stat"><strong>${m.bandRows}</strong><span>bandas de error</span></div><div class="norm-stat"><strong>${m.interpretationRows}</strong><span>filas interpretación</span></div><div class="norm-stat"><strong>${m.differenceRows}</strong><span>tramos de discrepancia</span></div></div>
  <div class="card"><h3>Fuente y estado</h3><p>${esc(m.source)}</p><p class="small muted">Versión de datos: ${esc(m.version)}. Cobertura operativa C.1 aproximada: 4 años 0 meses a 89 años 11 meses, según los intervalos presentes en el apéndice.</p></div>
  <div class="card"><h3>Reglas de administración protocolizadas</h3><p><strong>${esc(applicationRules?.meta?.instrument||'K-BIT clásico español')}</strong></p><p class="small muted">Estado: ${esc(applicationRules?.meta?.status||'—')} · versión de reglas ${esc(applicationRules?.meta?.version||'—')}.</p><div class="status-row"><span class="badge">Inicio por edad</span><span class="badge">Retorno</span><span class="badge">Crédito previo</span><span class="badge">Bloques</span><span class="badge">Discontinuación</span><span class="badge">Aprendizaje</span><span class="badge">30 s Definiciones</span></div></div>
  ${stimSum?`<div class="card"><h3>Inventario de estímulos integrados</h3><table class="audit-table"><thead><tr><th>Subtest</th><th>Ítems disponibles</th><th>Ítems faltantes</th><th>Ejemplos</th></tr></thead><tbody><tr><td>Vocabulario expresivo</td><td>${stimSum.vocabExpresivo.available}/${stimSum.vocabExpresivo.total_items}</td><td>${stimSum.vocabExpresivo.missing}</td><td>${stimSum.vocabExpresivo.examples}</td></tr><tr><td>Definiciones</td><td>${stimSum.definiciones.available}/${stimSum.definiciones.total_items}</td><td>${stimSum.definiciones.missing}</td><td>${stimSum.definiciones.examples}</td></tr><tr><td>Matrices</td><td>${stimSum.matrices.available}/${stimSum.matrices.total_items}</td><td>${stimSum.matrices.missing}</td><td>${stimSum.matrices.examples}</td></tr></tbody></table><div class="notice" style="margin-top:12px">Cobertura visual completa: 45/45 en Vocabulario, 37/37 en Definiciones y 48/48 en Matrices. Los ítems VE-2, VE-3 y DEF-27 usan estímulos sustitutivos generados y aprobados, identificados como tales en el manifiesto de auditoría.</div></div>`:''}
  <div class="card"><h3>Clave profesional de trabajo</h3><p class="small muted">${esc(professionalKey?.meta?.status || 'No cargada')}</p><div class="norm-grid" style="margin-top:12px"><div class="norm-stat"><strong>45</strong><span>respuestas nominales vocabulario</span></div><div class="norm-stat"><strong>37</strong><span>respuestas definiciones</span></div><div class="norm-stat"><strong>48</strong><span>alternativas matrices</span></div></div></div>
  <div class="card"><h3>Auditoría de incidencias</h3><table class="audit-table"><thead><tr><th>Elemento</th><th>Fuente</th><th>Normalización</th><th>Razón</th></tr></thead><tbody>${norms.audit.map(a=>`<tr><td>${esc(a.Elemento)}</td><td>${esc(a['Fuente impresa'])}</td><td>${esc(a['Valor normalizado'])}</td><td>${esc(a.Razón)}</td></tr>`).join('')}</tbody></table></div>`;
}

function render(){
  renderNav();
  const map={home:renderHome,case:renderCase,context:renderContext,application:renderApplication,review:renderReview,results:renderResults,reports:renderReports,manual:renderManual,norms:renderNorms};
  main.innerHTML=(map[route]||renderHome)();
}

function setNested(obj,path,value){const parts=path.split('.');let cur=obj;for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]];cur[parts.at(-1)]=value}
function getActiveItem(){const c=currentCase();if(!c)return null;const key=c.application.activeSubtest;return c.application.items[key][c.application.activeIndex]}
function persistActiveText(){const item=getActiveItem();if(!item)return;const response=document.getElementById('item-response');const note=document.getElementById('item-note');if(response&&!response.readOnly)item.response=response.value;if(note)item.note=note.value;saveCurrent()}
function switchSubtest(key){
  persistActiveText();clearDefinitionTimer();const c=currentCase();const r=calc();ensureProtocol(c,r.age,applicationRules);c.application.activeSubtest=key;const st=activeProtocolState(c,key);c.application.activeIndex=st?.currentIndex??0;protocolFlash='';saveCurrent();render();
}
function moveItem(delta){
  persistActiveText();clearDefinitionTimer();const c=currentCase();const r=calc();const key=c.application.activeSubtest;const st=activeProtocolState(c,key);
  if(delta<0){let n=Math.max(0,c.application.activeIndex-1);while(n>0&&!canJumpTo(c,key,n))n--;c.application.activeIndex=n;if(st)st.currentIndex=n;saveCurrent();render();return;}
  const decision=advanceProtocol(c,key,applicationRules);
  if(decision.blocked){alert(decision.message);if(key==='definiciones')setTimeout(armDefinitionTimer,0);return;}
  protocolFlash=decision.message||decision.reason||'';
  if(decision.complete){saveCurrent();goNextSubtest(c,r,key);return;}
  if(decision.nextItem){c.application.activeIndex=decision.nextItem-1;if(st)st.currentIndex=c.application.activeIndex;saveCurrent();render();}
}
function applyScoredValue(item,key,itemNo,score){
  let numeric=Number(score);
  if(key==='definiciones'){
    const timing=captureDefinitionTiming(item);
    if(timing.expired){numeric=0;item.timedOut=true;protocolFlash=`Respuesta posterior a 30 s en Definiciones ítem ${itemNo}: puntuación 0.`;}
  }
  const learning=isLearningItem(currentCase(),key,itemNo);
  if(learning){
    if(item.firstScore===null||item.firstScore===undefined){item.firstScore=numeric;item.firstResponse=item.response||'';}
    else numeric=Number(item.firstScore);
  }
  item.score=numeric;return numeric;
}
function scoreItem(score){
  persistActiveText();const c=currentCase();const key=c.application.activeSubtest;const item=getActiveItem();const itemNo=c.application.activeIndex+1;
  if(score==='NA'){item.score='NA';recordDeviation(c,key,`Ítem ${itemNo} marcado no administrado/incidencia; requiere revisión profesional.`);saveCurrent();render();return;}
  applyScoredValue(item,key,itemNo,score);saveCurrent();render();
}

function filenameBase(){const c=currentCase();return (c?.privacy.alias||'KBIT').replace(/[^a-zA-Z0-9_-]+/g,'_')}
function doExportReport(format){const c=currentCase(),r=calc();const isTech=reportTab==='technical';const title=isTech?'Informe técnico K-BIT':'Informe contextualizado K-BIT';const body=isTech?buildTechnicalReport(c,r):contextualReportWithAI(c,r);const base=`${filenameBase()}_${isTech?'tecnico':'contextual'}`;if(format==='html')exportHtml(`${base}.html`,title,body);if(format==='txt')exportTxt(`${base}.txt`,body);if(format==='doc')exportDoc(`${base}.doc`,title,body);if(format==='pdf')printPdf(title,body)}
function doExportDossier(){const c=currentCase(),r=calc();const protocol=buildProtocolHtml(c,r);const bodyMatch=protocol.match(/<body>([\s\S]*?)<\/body>/i);const protocolBody=bodyMatch?bodyMatch[1]:protocol;const body=`<div class=\"dossier-cover\"><h1>Expediente integrado K-BIT</h1><p>${esc(c.patient.fullName||c.privacy.alias)} · ${esc(c.evaluation.applicationDate||'')}</p></div>${buildTechnicalReport(c,r)}<div style=\"page-break-before:always\"></div>${buildLocalContextualReport(c,r)}<div style=\"page-break-before:always\"></div><section class=\"report\"><h1>Anexo - Protocolo digital</h1>${protocolBody}</section>`;exportHtml(`${filenameBase()}_expediente_integrado.html`,'Expediente integrado K-BIT',body)}

main.addEventListener('input',e=>{
  const bind=e.target.dataset.bind;if(!bind)return;const c=currentCase();if(!c)return;let value=e.target.value;if(e.target.type==='number'&&value!=='')value=Number(value);setNested(c,bind,value);saveCurrent();
});
main.addEventListener('change',e=>{
  const bind=e.target.dataset.bind;
  if(bind){
    const c=currentCase();
    if(c){let value=e.target.value;if(e.target.type==='number'&&value!=='')value=Number(value);setNested(c,bind,value);saveCurrent();}
  }
  if(e.target.dataset.refresh)render();
});

function openStimulusViewer(){
  publishCurrentStimulus();
  window.open('./stimulos.html', '_blank', 'noopener');
}
async function fullscreenStimulus(){
  const el = document.getElementById('stimulus-stage');
  if(!el) return;
  try{ if(document.fullscreenElement) await document.exitFullscreen(); else await el.requestFullscreen(); }catch{}
}

document.body.addEventListener('click',async e=>{
  const routeEl=e.target.closest('[data-route]');if(routeEl){if(route==='application') publishCurrentStimulus(); handleRoute(routeEl.dataset.route); return}
  const el=e.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;
  if(action==='new-case'){const c=newCase();upsertCase(db,c);route='case';render()}
  else if(action==='load-demo'){const c=demoCaseM();upsertCase(db,c);route='case';render()}
  else if(action==='open-case'){db.currentId=el.dataset.id;saveDB(db);route='case';render()}
  else if(action==='delete-case'){if(confirm('¿Eliminar este caso del almacenamiento local?')){deleteCase(db,el.dataset.id);render()}}
  else if(action==='export-case'){const c=db.cases[el.dataset.id];downloadBlob(`${(c.privacy.alias||'caso').replace(/\W+/g,'_')}_respaldo.json`,JSON.stringify(c,null,2),'application/json')}
  else if(action==='export-db'){downloadBlob('KBIT_respaldo_todos_los_casos.json',JSON.stringify(db,null,2),'application/json')}
  else if(action==='switch-subtest')switchSubtest(el.dataset.subtest)
  else if(action==='prepare-subtest'){
    const c=currentCase(),r=calc();ensureProtocol(c,r.age,applicationRules);const res=prepareSubtest(c,el.dataset.subtest,r.age,applicationRules,null);protocolFlash=res.ok?`Ruta iniciada en ítem ${res.startItem}. Complete el primer bloque antes de decidir continuidad.`:res.message;saveCurrent();render();
  }
  else if(action==='prepare-matrix-route'){
    const c=currentCase(),r=calc();const correct=el.dataset.result==='correct';ensureProtocol(c,r.age,applicationRules);const res=prepareSubtest(c,'matrices',r.age,applicationRules,correct);protocolFlash=`Ejemplo B ${correct?'correcto':'incorrecto'}: inicio puntuable en ítem ${res.startItem}.`;saveCurrent();render();
  }
  else if(action==='go-next-subtest'){const c=currentCase(),r=calc();goNextSubtest(c,r,c.application.activeSubtest)}
  else if(action==='score-item')scoreItem(el.dataset.score)
  else if(action==='mark-incidence')scoreItem('NA')
  else if(action==='move-item')moveItem(Number(el.dataset.delta))
  else if(action==='report-tab'){reportTab=el.dataset.tab;render()}
  else if(action==='export-report')doExportReport(el.dataset.format)
  else if(action==='export-dossier')doExportDossier()
  else if(action==='copy-ai-prompt'){const text=buildAIPrompt(currentCase(),calc());await navigator.clipboard.writeText(text);el.textContent='Copiado ✓';setTimeout(()=>el.textContent='Copiar prompt anonimizado',1400)}
  else if(action==='download-ai-payload'){downloadBlob(`${filenameBase()}_paquete_IA_anonimizado.json`,JSON.stringify(buildAnonymousAIPayload(currentCase(),calc()),null,2),'application/json')}
  else if(action==='use-local-context'){currentCase().reports.contextualAIText='';saveCurrent();render()}
  else if(action==='open-viewer') openStimulusViewer()
  else if(action==='fullscreen-stimulus') await fullscreenStimulus()
  else if(action==='toggle-focus'){document.body.classList.toggle('focus-mode');render()}
  else if(action==='record-deviation'){const c=currentCase();const key=c.application.activeSubtest;const msg=prompt('Describa la desviación clínica o procedimental que debe quedar en la bitácora:');if(msg?.trim()){recordDeviation(c,key,msg.trim());saveCurrent();protocolFlash='Desviación registrada en la bitácora.';render()}}
  else if(action==='record-reapplication'){const c=currentCase();const key=c.application.activeSubtest;const item=getActiveItem();const itemNo=c.application.activeIndex+1;if(key==='definiciones'){alert('Definiciones no admite esta reaplicación clínica excepcional por ser una tarea cronometrada.');return;}if(!(item.score===0||item.score===1)){alert('Registre primero la respuesta original.');return;}const reason=prompt('Motivo clínico excepcional de la reaplicación (obligatorio):');if(!reason?.trim())return;const repeated=prompt('Registre la respuesta o alternativa obtenida en la reaplicación:','');if(repeated===null)return;const score=prompt('Puntuación de la respuesta repetida (0 o 1):','');if(score!=='0'&&score!=='1'){alert('La puntuación repetida debe ser 0 o 1.');return;}item.reapplications ||= [];item.reapplications.push({ts:new Date().toISOString(),reason:reason.trim(),originalResponse:item.response||'',originalScore:item.score,repeatedResponse:repeated,repeatedScore:Number(score)});recordDeviation(c,key,`Reaplicación clínica excepcional en ítem ${itemNo}. Motivo: ${reason.trim()}. Respuesta repetida registrada con puntuación ${score}. La puntuación estándar original se conserva hasta revisión profesional.`,'reapplication');saveCurrent();protocolFlash='Reaplicación documentada. La puntuación original se conserva; revise si corresponde una anulación profesional excepcional.';render()}
  else if(action==='reset-learning-record'){const c=currentCase();const key=c.application.activeSubtest;const item=getActiveItem();const val=prompt('Corrija únicamente un ERROR DE REGISTRO. Escriba la puntuación real de la primera respuesta (0 o 1):',String(item.firstScore??''));if(val==='0'||val==='1'){item.firstScore=Number(val);item.score=Number(val);recordDeviation(c,key,`Corrección de error de registro en ítem ${c.application.activeIndex+1}: primera puntuación fijada en ${val}.`,'record-correction');saveCurrent();render()}}
  else if(action==='reset-administration'){const c=currentCase();if(confirm('Esto eliminará respuestas, puntuaciones y ruta protocolaria del caso actual. ¿Continuar?')){clearDefinitionTimer();resetProtocol(c);const r=calc();if(r?.age)ensureProtocol(c,r.age,applicationRules);saveCurrent();route='application';protocolFlash='Protocolo reiniciado según la edad actual.';render()}}
  else if(action==='export-protocol'){const c=currentCase(),r=calc(),base=filenameBase();if(el.dataset.format==='html')downloadBlob(`${base}_protocolo_digital.html`,buildProtocolHtml(c,r),'text/html;charset=utf-8');else downloadBlob(`${base}_protocolo_digital.csv`,buildProtocolCsv(c,r),'text/csv;charset=utf-8')}
  else if(action==='jump-item'){persistActiveText();clearDefinitionTimer();const c=currentCase();const key=c.application.activeSubtest;const idx=Number(el.dataset.index);if(canJumpTo(c,key,idx)){c.application.activeIndex=idx;const st=activeProtocolState(c,key);if(st)st.currentIndex=idx;saveCurrent();render()}}
  else if(action==='matrix-choice'){
    persistActiveText();const item=getActiveItem();const c=currentCase();const key='matrices';const itemNo=c.application.activeIndex+1;const choice=String(el.dataset.choice||'').toUpperCase();const learning=isLearningItem(c,key,itemNo);
    if(learning && item.firstScore!==null && item.firstScore!==undefined){item.note=(item.note?item.note+' · ':'')+`Selección posterior en aprendizaje: ${choice}; se conserva primera respuesta ${item.firstResponse}.`;protocolFlash='Ítem de aprendizaje: se conserva la primera selección para puntuar.';saveCurrent();render();return;}
    item.response=choice;const ref=getKeyItem(professionalKey,'matrices',itemNo);const raw=(ref&&choice===String(ref.answer).toUpperCase())?1:0;applyScoredValue(item,key,itemNo,raw);saveCurrent();render();
  }
});

function handleRoute(id){if(!currentCase()&&!['home','manual','norms'].includes(id))return;persistActiveText();clearDefinitionTimer();route=id;render();window.scrollTo({top:0,behavior:'smooth'})}

document.body.addEventListener('change',e=>{
  if(e.target.id==='import-db'){
    const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const imported=JSON.parse(reader.result);if(imported?.cases){db=imported;saveDB(db);route='home';render()}else alert('El archivo no tiene el formato de respaldo esperado.')}catch{alert('No se pudo leer el respaldo.')}};reader.readAsText(file);e.target.value='';
  }
});

document.addEventListener('keydown',e=>{
  if(route!=='application')return;const tag=document.activeElement?.tagName?.toLowerCase();if(['input','textarea','select'].includes(tag))return;
  if(e.key==='0'){e.preventDefault();scoreItem('0')}
  if(e.key==='1'){e.preventDefault();scoreItem('1')}
  if(e.key==='ArrowRight'){e.preventDefault();moveItem(1)}
  if(e.key==='ArrowLeft'){e.preventDefault();moveItem(-1)}
});

(async function init(){
  try{[norms, stimuli, professionalKey, applicationRules] = await Promise.all([loadNorms(), loadStimuli(), loadProfessionalKey(), loadApplicationRules()]);}
  catch(err){console.error(err);main.innerHTML=`<div class="notice warn"><strong>Error al cargar baremos o estímulos.</strong><br>${esc(err.message)}<br><br>Esta versión debe abrirse desde un servidor web (por ejemplo Cloudflare Pages), no mediante doble clic con file://.</div>`;return}
  render();
})();

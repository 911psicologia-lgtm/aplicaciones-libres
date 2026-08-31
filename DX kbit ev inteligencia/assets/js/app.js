import { APP_VERSION, CONTEXT_TYPES, SUBTESTS, CONFIDENCE_LEVELS } from './config.js';
import { calculateChronologicalAge, ageLabel, esc, downloadBlob, monthRangeLabel } from './utils.js';
import { loadDB, saveDB, upsertCase, deleteCase, newCase, demoCaseM } from './storage.js';
import { loadNorms, calculateCase } from './scoring.js';
import { buildTechnicalReport, buildLocalContextualReport, buildAIPrompt, buildAnonymousAIPayload, contextualReportWithAI } from './reports.js';
import { exportHtml, exportTxt, exportDoc, printPdf } from './export.js';

const ROUTES = [
  ['home','Inicio'],['case','Caso'],['context','Contexto'],['application','Aplicación'],['review','Revisión'],
  ['results','Resultados'],['reports','Informes'],['manual','Manual'],['norms','Baremos']
];

let norms = null;
let db = loadDB();
let route = 'home';
let reportTab = 'technical';

const main = document.getElementById('main');
const nav = document.getElementById('nav');
document.getElementById('brand-version').textContent = `K-BIT · v${APP_VERSION} · Cloudflare-ready`;

function currentCase(){ return db.currentId ? db.cases[db.currentId] || null : null; }
function calc(){ const c=currentCase(); return c && norms ? calculateCase(c,norms) : null; }
function saveCurrent(){ const c=currentCase(); if(c) upsertCase(db,c); }
function contextText(c){
  const found=CONTEXT_TYPES.find(([id])=>id===c.evaluation.contextType);
  return c.evaluation.contextType==='otro' && c.evaluation.contextCustom ? c.evaluation.contextCustom : (found?.[1]||'No especificado');
}
function pageHeader(title,desc,actions=''){return `<div class="page-head"><div><h2>${title}</h2><p>${desc}</p></div><div class="head-actions no-print">${actions}</div></div>`}
function noCase(){return `${pageHeader('Sin caso activo','Crea o selecciona un caso para continuar.')}<div class="empty"><p>No hay una evaluación seleccionada.</p><div class="toolbar" style="justify-content:center;margin-top:12px"><button class="btn" data-action="new-case">Nueva evaluación</button><button class="btn ghost" data-action="load-demo">Cargar caso M demo</button></div></div>`}

function renderNav(){
  const has=!!currentCase();
  nav.innerHTML=ROUTES.map(([id,label],i)=>`<button class="nav-btn ${route===id?'active':''}" data-route="${id}" ${!has && !['home','manual','norms'].includes(id)?'disabled':''}><span class="nav-num">${i+1}</span>${label}</button>`).join('');
}

function renderHome(){
  const cases=Object.values(db.cases).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return `${pageHeader('Evaluaciones','Crea, retoma o respalda evaluaciones. Los datos identificables permanecen en este navegador.',`<button class="btn" data-action="new-case">+ Nueva evaluación</button><button class="btn ghost" data-action="load-demo">Caso M demo</button>`)}
  <div class="card"><h3>Casos guardados localmente</h3>
    ${cases.length?`<div class="case-list">${cases.map(c=>{const a=calculateChronologicalAge(c.patient.birthDate,c.evaluation.applicationDate);return `<div class="case-row"><div><strong>${esc(c.patient.fullName||'Sin nombre')}</strong><div class="meta">${esc(c.privacy.alias)} · ${a?esc(ageLabel(a)):'edad pendiente'} · ${esc(contextText(c))}</div></div><div class="case-actions"><button class="btn sm" data-action="open-case" data-id="${c.id}">Abrir</button><button class="btn ghost sm" data-action="export-case" data-id="${c.id}">Respaldo</button><button class="btn danger sm" data-action="delete-case" data-id="${c.id}">Eliminar</button></div></div>`}).join('')}</div>`:`<div class="empty">Aún no hay evaluaciones guardadas.</div>`}
  </div>
  <div class="card"><h3>Respaldo y restauración</h3><p class="small muted">El respaldo contiene datos identificables. Consérvalo de manera segura.</p><div class="toolbar" style="margin-top:12px"><button class="btn ghost" data-action="export-db">Exportar todos los casos</button><label class="btn ghost" for="import-db" style="display:inline-flex">Importar respaldo</label><input id="import-db" type="file" accept="application/json,.json" class="hidden"></div></div>
  <div class="footer-note">Arquitectura actual: aplicación estática. Cloudflare Pages entrega los archivos, pero no recibe ni almacena por defecto los datos de los pacientes. El almacenamiento de casos se realiza con localStorage en el dispositivo.</div>`;
}

function field(label,path,value,type='text',extra=''){
  return `<div class="field"><label>${label}</label><input type="${type}" value="${esc(value)}" data-bind="${path}" ${extra}></div>`;
}
function textarea(label,path,value,placeholder=''){
  return `<div class="field"><label>${label}</label><textarea data-bind="${path}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></div>`;
}

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
      <div class="grid2">${field('Ocupación','patient.occupation',c.patient.occupation)}${field('Institución','patient.institution',c.patient.institution)}</div>
      ${field('Remitente','patient.referrer',c.patient.referrer)}
    </div>
    <div>
      <div class="card"><h3>Edad y selección normativa</h3>
        <div class="age-box"><div class="metric"><div class="k">Edad cronológica</div><div class="v">${age?`${age.years}a ${age.months}m ${age.days}d`:'—'}</div><div class="d">${age?`${age.totalMonths} meses cumplidos`:'Ingrese fechas válidas'}</div></div><div class="metric"><div class="k">Baremo automático</div><div class="v">${valid?esc(r.normBand.label):'—'}</div><div class="d">${valid?'Tabla C.1 seleccionada por edad':'Fuera de rango o edad pendiente'}</div></div></div>
        ${r?.warnings?.length?`<div class="notice warn" style="margin-top:12px">${r.warnings.map(esc).join('<br>')}</div>`:''}
      </div>
      <div class="card"><h3>Anonimización para IA</h3><div class="metric"><div class="k">Alias</div><div class="v" style="font-size:20px">${esc(c.privacy.alias)}</div><div class="d">El paquete IA no incluye nombre, documento, institución específica ni fecha exacta de nacimiento.</div></div>
      ${field('Alias editable','privacy.alias',c.privacy.alias)}
      </div>
    </div>
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

function scoreStatsText(stats){return `${stats.correct} correctas · ${stats.incorrect} incorrectas · ${stats.na} no administradas · ${stats.pending} sin registro`}
function renderApplication(){
  const c=currentCase();if(!c)return noCase(); const r=calc();
  if(!r?.validAge) return `${pageHeader('Aplicación','Para seleccionar normas y activar el flujo correcto se necesita una edad válida.')}<div class="notice warn">Completa la fecha de nacimiento y la fecha de aplicación antes de iniciar.</div><div class="toolbar" style="margin-top:14px"><button class="btn" data-route="case">Ir a datos del evaluado</button></div>`;
  const allowed=['vocabExpresivo',...(r.definitionsActive?['definiciones']:[]),'matrices'];
  if(!allowed.includes(c.application.activeSubtest)){c.application.activeSubtest='vocabExpresivo';c.application.activeIndex=0;saveCurrent()}
  const key=c.application.activeSubtest;const cfg=SUBTESTS[key];const items=c.application.items[key];const idx=Math.min(c.application.activeIndex,items.length-1);const item=items[idx];const stats=r.stats[key];
  const progress=Math.round(((idx+1)/items.length)*100);
  return `${pageHeader('Modo aplicación','Los estímulos se presentan externamente. La pantalla se concentra en respuesta, puntuación y observación, sin mostrar resultados durante la administración.',`<button class="btn ghost" data-route="context">← Contexto</button><button class="btn" data-route="review">Revisar aplicación →</button>`)}
  <div class="steps"><span class="step-pill">Caso</span><span class="step-pill">Contexto</span><span class="step-pill active">Aplicación</span><span class="step-pill">Revisión</span><span class="step-pill">Resultados</span></div>
  <div class="apply-layout">
    <div class="subtest-tabs">${Object.entries(SUBTESTS).map(([k,v])=>`<button class="subtest-tab ${key===k?'active':''}" data-action="switch-subtest" data-subtest="${k}" ${v.minAgeMonths && r.ageMonths<v.minAgeMonths?'disabled':''}>${esc(v.label)}</button>`).join('')}</div>
    <div class="apply-top"><div><strong>${esc(cfg.label)}</strong><div class="small muted">${scoreStatsText(stats)}</div></div><span class="badge">Baremo ${esc(r.normBand.label)}</span></div>
    <div class="progress"><span style="width:${progress}%"></span></div>
    <div class="item-card" style="margin-top:12px">
      <div class="item-number">Ítem ${idx+1} de ${items.length}</div><h3>Registrar respuesta</h3>
      <div class="field" style="margin-top:18px"><label>Respuesta del evaluado</label><textarea id="item-response" rows="3" placeholder="Transcribe o resume la respuesta si es pertinente.">${esc(item.response)}</textarea></div>
      <div class="score-buttons"><button class="score-btn incorrect ${String(item.score)==='0'?'selected':''}" data-action="score-item" data-score="0">0 · Incorrecta</button><button class="score-btn ${String(item.score)==='1'?'selected':''}" data-action="score-item" data-score="1">1 · Correcta</button><button class="score-btn ${item.score==='NA'?'selected':''}" data-action="score-item" data-score="NA">No administrado</button></div>
      <div class="field"><label>Observación breve del ítem</label><textarea id="item-note" rows="2" placeholder="Latencia, repetición, autocorrección, conducta u otra observación.">${esc(item.note)}</textarea></div>
      <div class="apply-nav"><button class="btn ghost" data-action="move-item" data-delta="-1" ${idx===0?'disabled':''}>← Anterior</button><button class="btn" data-action="move-item" data-delta="1">${idx===items.length-1?'Finalizar / siguiente subtest':'Siguiente →'}</button></div>
      <div class="keyboard-help">Atajos fuera de los campos de texto: <strong>0</strong> incorrecta · <strong>1</strong> correcta · <strong>←/→</strong> anterior/siguiente</div>
    </div>
  </div>`;
}

function renderReview(){
  const c=currentCase();if(!c)return noCase();const r=calc();
  const rows=[['Vocabulario expresivo',r.stats.vocabExpresivo],...(r.definitionsActive?[['Definiciones',r.stats.definiciones]]:[]),['Matrices',r.stats.matrices]];
  return `${pageHeader('Revisión y cierre de puntuación','Revisa el registro antes de interpretar. Los créditos basales o ajustes derivados de las reglas del manual pueden añadirse aquí mientras completamos el manual integrado.',`<button class="btn ghost" data-route="application">← Aplicación</button><button class="btn" data-route="results">Calcular resultados →</button>`)}
  <div class="grid2"><div class="card"><h3>Estado de registro</h3><div class="review-list">${rows.map(([name,s])=>`<div class="review-row"><div><strong>${name}</strong></div><div><div class="num">${s.correct}</div><div class="lab">correctas</div></div><div><div class="num">${s.incorrect}</div><div class="lab">incorrectas</div></div><div><div class="num">${s.na}</div><div class="lab">no adm.</div></div><div><div class="num">${s.pending}</div><div class="lab">sin registro</div></div></div>`).join('')}</div>
    <div class="notice" style="margin-top:12px">Los ítems no administrados por punto de inicio o discontinuación no tienen que completarse artificialmente. Registra el crédito basal correspondiente según el manual.</div></div>
    <div class="card"><h3>Brutos y ajustes</h3>
      <div class="grid2">${field('Crédito / ajuste basal Vocabulario','application.adjustments.vocabCredit',c.application.adjustments.vocabCredit,'number')}${field('Crédito / ajuste basal Matrices','application.adjustments.matricesCredit',c.application.adjustments.matricesCredit,'number')}</div>
      <div class="grid2">${field('Bruto final manual Vocabulario (opcional)','application.adjustments.vocabOverride',c.application.adjustments.vocabOverride,'number')}${field('Bruto final manual Matrices (opcional)','application.adjustments.matricesOverride',c.application.adjustments.matricesOverride,'number')}</div>
      <div class="notice"><strong>Puntuación usada ahora:</strong> Vocabulario ${r.raw.vocab} · Matrices ${r.raw.matrices}. ${c.application.adjustments.vocabOverride!==''||c.application.adjustments.matricesOverride!==''?'Existe al menos una anulación manual activa.':'Se usa el total registrado + créditos.'}</div>
      <div class="field" style="margin-top:14px"><label>Nivel de confianza</label><select data-bind="scoring.confidence" data-refresh="1">${CONFIDENCE_LEVELS.map(n=>`<option ${Number(c.scoring.confidence)===n?'selected':''} value="${n}">${n}%</option>`).join('')}</select></div>
    </div></div>
    <div class="card">${textarea('Observaciones globales de la aplicación','application.observations',c.application.observations,'Conducta, colaboración, comprensión de consignas, condiciones ambientales, pausas, incidencias, etc.')}</div>
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
  return `${pageHeader('Informes','Dos salidas complementarias: un informe técnico estructurado y otro contextualizado. La IA recibe únicamente un paquete anonimizado.',`<button class="btn ghost" data-route="results">← Resultados</button>`)}
  <div class="report-tabs"><button class="report-tab ${!contextual?'active':''}" data-action="report-tab" data-tab="technical">Informe técnico</button><button class="report-tab ${contextual?'active':''}" data-action="report-tab" data-tab="contextual">Informe contextualizado</button></div>
  <div class="toolbar no-print" style="margin-bottom:14px"><button class="btn sm" data-action="export-report" data-format="html">HTML enriquecido</button><button class="btn ghost sm" data-action="export-report" data-format="txt">TXT</button><button class="btn ghost sm" data-action="export-report" data-format="doc">DOC / Word</button><button class="btn ghost sm" data-action="export-report" data-format="pdf">PDF / imprimir</button></div>
  ${contextual?`<div class="card ai-box no-print"><h3>Asistencia de IA con anonimización</h3><p class="small muted">La aplicación no envía datos automáticamente. Copia el prompt anonimizado, utilízalo con el sistema de IA autorizado y pega después el borrador. El informe final vuelve a incorporar localmente la identificación real.</p><div class="toolbar" style="margin:12px 0"><button class="btn ghost sm" data-action="copy-ai-prompt">Copiar prompt anonimizado</button><button class="btn ghost sm" data-action="download-ai-payload">Descargar paquete IA</button><button class="btn soft sm" data-action="use-local-context">Usar borrador local</button></div><div class="field"><label>Borrador contextual asistido (opcional)</label><textarea data-bind="reports.contextualAIText" placeholder="Pega aquí la respuesta de la IA. Si queda vacío, se utiliza el borrador contextual local.">${esc(c.reports.contextualAIText)}</textarea></div><div class="notice">La IA no debe inferir causalidad. El prompt exige separar datos observados, condiciones asociadas e hipótesis interpretativas.</div></div>`:''}
  <div class="report-preview">${body}</div>`;
}

function renderManual(){
  return `${pageHeader('Manual del evaluador','Módulo preparado para convertirse en una guía paso a paso. En esta versión contiene el uso de la aplicación; las normas específicas del test se integrarán después desde el manual autorizado.',`<a class="btn" href="./docs/manual-evaluador.html" target="_blank" rel="noopener">Abrir manual</a><a class="btn ghost" href="./docs/manual-evaluador.html" download>Descargar HTML</a>`)}
  <div class="card"><h3>Ruta del evaluador</h3><div class="manual-links"><div class="manual-link"><strong>1. Preparar caso</strong><p class="small muted">Identificación, fechas, cálculo de edad y anonimización.</p></div><div class="manual-link"><strong>2. Contextualizar</strong><p class="small muted">Motivo, contexto de evaluación y datos relevantes.</p></div><div class="manual-link"><strong>3. Aplicar</strong><p class="small muted">Registro multipantalla de respuesta, 0/1 y observación.</p></div><div class="manual-link"><strong>4. Revisar y puntuar</strong><p class="small muted">Créditos, bruto final, baremo e intervalos.</p></div><div class="manual-link"><strong>5. Interpretar</strong><p class="small muted">Perfil, discrepancia y cautelas.</p></div><div class="manual-link"><strong>6. Informar</strong><p class="small muted">Informe técnico, contextualizado y exportaciones.</p></div></div></div>
  <div class="notice" style="margin-top:16px"><strong>Pendiente deliberado:</strong> puntos de inicio, reglas de retorno, discontinuación, consignas y criterios de corrección específicos. No los inferimos ni los inventamos; se incorporarán cuando revisemos el cuadernillo/manual de aplicación.</div>`;
}

function renderNorms(){
  if(!norms)return `<div class="notice warn">Los baremos no pudieron cargarse.</div>`;
  const m=norms.meta;
  return `${pageHeader('Baremos incorporados','Módulo técnico de auditoría. Los baremos se cargan automáticamente y ya no forman parte del flujo cotidiano de aplicación.')}
  <div class="norm-grid"><div class="norm-stat"><strong>${m.verbalRows}</strong><span>filas escala verbal</span></div><div class="norm-stat"><strong>${m.nonverbalRows}</strong><span>filas escala no verbal</span></div><div class="norm-stat"><strong>${m.compositeRows}</strong><span>conversiones compuesto</span></div><div class="norm-stat"><strong>${m.bandRows}</strong><span>bandas de error</span></div><div class="norm-stat"><strong>${m.interpretationRows}</strong><span>filas interpretación</span></div><div class="norm-stat"><strong>${m.differenceRows}</strong><span>tramos de discrepancia</span></div></div>
  <div class="card"><h3>Fuente y estado</h3><p>${esc(m.source)}</p><p class="small muted">Versión de datos: ${esc(m.version)}. Cobertura operativa C.1 aproximada: 4 años 0 meses a 89 años 11 meses, según los intervalos presentes en el apéndice.</p></div>
  <div class="card"><h3>Auditoría de incidencias</h3><table class="audit-table"><thead><tr><th>Elemento</th><th>Fuente</th><th>Normalización</th><th>Razón</th></tr></thead><tbody>${norms.audit.map(a=>`<tr><td>${esc(a.Elemento)}</td><td>${esc(a['Fuente impresa'])}</td><td>${esc(a['Valor normalizado'])}</td><td>${esc(a.Razón)}</td></tr>`).join('')}</tbody></table></div>`;
}

function render(){
  renderNav();
  const map={home:renderHome,case:renderCase,context:renderContext,application:renderApplication,review:renderReview,results:renderResults,reports:renderReports,manual:renderManual,norms:renderNorms};
  main.innerHTML=(map[route]||renderHome)();
}

function setNested(obj,path,value){const parts=path.split('.');let cur=obj;for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]];cur[parts.at(-1)]=value}
function getActiveItem(){const c=currentCase();if(!c)return null;const key=c.application.activeSubtest;return c.application.items[key][c.application.activeIndex]}
function persistActiveText(){const item=getActiveItem();if(!item)return;const response=document.getElementById('item-response');const note=document.getElementById('item-note');if(response)item.response=response.value;if(note)item.note=note.value;saveCurrent()}
function switchSubtest(key){persistActiveText();const c=currentCase();c.application.activeSubtest=key;c.application.activeIndex=0;saveCurrent();render()}
function nextAllowedSubtest(current){const c=currentCase();const r=calc();const order=['vocabExpresivo',...(r.definitionsActive?['definiciones']:[]),'matrices'];const i=order.indexOf(current);return order[i+1]||null}
function moveItem(delta){persistActiveText();const c=currentCase();const key=c.application.activeSubtest;const items=c.application.items[key];let n=c.application.activeIndex+delta;if(n>=items.length){const next=nextAllowedSubtest(key);if(next){c.application.activeSubtest=next;c.application.activeIndex=0}else{route='review'}}else if(n>=0)c.application.activeIndex=n;saveCurrent();render()}
function scoreItem(score){persistActiveText();const item=getActiveItem();item.score=score==='NA'?'NA':Number(score);saveCurrent();render()}

function filenameBase(){const c=currentCase();return (c?.privacy.alias||'KBIT').replace(/[^a-zA-Z0-9_-]+/g,'_')}
function doExportReport(format){const c=currentCase(),r=calc();const isTech=reportTab==='technical';const title=isTech?'Informe técnico K-BIT':'Informe contextualizado K-BIT';const body=isTech?buildTechnicalReport(c,r):contextualReportWithAI(c,r);const base=`${filenameBase()}_${isTech?'tecnico':'contextual'}`;if(format==='html')exportHtml(`${base}.html`,title,body);if(format==='txt')exportTxt(`${base}.txt`,body);if(format==='doc')exportDoc(`${base}.doc`,title,body);if(format==='pdf')printPdf(title,body)}

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

function handleRoute(id){if(!currentCase()&&!['home','manual','norms'].includes(id))return;persistActiveText();route=id;render();window.scrollTo({top:0,behavior:'smooth'})}
document.body.addEventListener('click',async e=>{
  const routeEl=e.target.closest('[data-route]');if(routeEl){handleRoute(routeEl.dataset.route);return}
  const el=e.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;
  if(action==='new-case'){const c=newCase();upsertCase(db,c);route='case';render()}
  else if(action==='load-demo'){const c=demoCaseM();upsertCase(db,c);route='case';render()}
  else if(action==='open-case'){db.currentId=el.dataset.id;saveDB(db);route='case';render()}
  else if(action==='delete-case'){if(confirm('¿Eliminar este caso del almacenamiento local?')){deleteCase(db,el.dataset.id);render()}}
  else if(action==='export-case'){const c=db.cases[el.dataset.id];downloadBlob(`${(c.privacy.alias||'caso').replace(/\W+/g,'_')}_respaldo.json`,JSON.stringify(c,null,2),'application/json')}
  else if(action==='export-db'){downloadBlob('KBIT_respaldo_todos_los_casos.json',JSON.stringify(db,null,2),'application/json')}
  else if(action==='switch-subtest')switchSubtest(el.dataset.subtest)
  else if(action==='score-item')scoreItem(el.dataset.score)
  else if(action==='move-item')moveItem(Number(el.dataset.delta))
  else if(action==='report-tab'){reportTab=el.dataset.tab;render()}
  else if(action==='export-report')doExportReport(el.dataset.format)
  else if(action==='copy-ai-prompt'){const text=buildAIPrompt(currentCase(),calc());await navigator.clipboard.writeText(text);el.textContent='Copiado ✓';setTimeout(()=>el.textContent='Copiar prompt anonimizado',1400)}
  else if(action==='download-ai-payload'){downloadBlob(`${filenameBase()}_paquete_IA_anonimizado.json`,JSON.stringify(buildAnonymousAIPayload(currentCase(),calc()),null,2),'application/json')}
  else if(action==='use-local-context'){currentCase().reports.contextualAIText='';saveCurrent();render()}
});


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
  try{norms=await loadNorms();}
  catch(err){console.error(err);main.innerHTML=`<div class="notice warn"><strong>Error al cargar baremos.</strong><br>${esc(err.message)}<br><br>Esta versión debe abrirse desde un servidor web (por ejemplo Cloudflare Pages), no mediante doble clic con file://.</div>`;return}
  render();
})();

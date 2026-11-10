(function(root){
 'use strict';
 const A=root.MMPI2Audit,S=root.MMPI2Sections,R=root.MMPI2Report,KEY='mmpi2-app-storage',BACKUP_KEY='mmpi2-respaldo-antes-v17.2';
 const id=()=>root.crypto?.randomUUID?.()||'c-'+Date.now()+'-'+Math.random().toString(36).slice(2);
 const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
 function ageAt(birth,date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(birth||'')||!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
  const [by,bm,bd]=birth.split('-').map(Number),[y,m,d]=date.split('-').map(Number);
  return y-by-(m<bm||(m===bm&&d<bd)?1:0);
 }
 function validatePatient(p){
  if(!String(p.fullName||'').trim())throw new Error('Ingrese el nombre o código del evaluado.');
  if(!['M','F'].includes(p.sex))throw new Error('Seleccione el sexo de la tabla normativa.');
  if(!['US','MX','ES'].includes(p.baremo||'US'))throw new Error('Baremo no reconocido.');
  if(p.birthDate){const age=ageAt(p.birthDate,p.applicationDate);if(age==null||age<0||age>120)throw new Error('Revise la fecha de nacimiento y la fecha de aplicación.');if(age<18)throw new Error('El MMPI-2 es para adultos. Revise la edad o la selección del instrumento.');}
  if(p.age!==''&&p.age!=null&&(Number(p.age)<18||Number(p.age)>120))throw new Error('Revise la edad: el MMPI-2 se aplica a adultos.');
  return {...p,fullName:String(p.fullName).trim(),age:p.birthDate?ageAt(p.birthDate,p.applicationDate):(p.age===''?null:Number(p.age)||null)};
 }
 function create(patient,extra={}){
  const now=new Date().toISOString();
  return A.freshCase(S.migrate({id:id(),patient:validatePatient({baremo:'US',calculationSource:'manual',applicationDate:today(),context:'clinico',...patient}),responses:{},createdAt:now,updatedAt:now,status:'captura',modalidad:'Presencial',previousReports:[],...extra}));
 }
 function reapply(c,date=today()){
  const p={...c.patient,applicationDate:date};if(p.birthDate)p.age=ageAt(p.birthDate,date);
  return create(p,{reapplicationOf:c.id,applicationNumber:(c.applicationNumber||1)+1,modalidad:c.modalidad,previousAssessment:{caseId:c.id,date:c.patient.applicationDate,baremo:c.patient.baremo,sex:c.patient.sex,calculationSource:c.patient.calculationSource||'manual',scores:c.scores.map(s=>({...s})),responses:{...c.responses},completedAt:c.completedAt||null,contextSnapshot:{patient:{...c.patient},clinicalSummary:c.clinicalSummary||'',recommendations:c.recommendations||'',aiContextualizedReport:c.aiContextualizedReport||'',aiReviewedAt:c.aiReviewedAt||null}},reportOptions:{...c.reportOptions}});
 }
 function normalizeResponse(v){
  if(v===1||v===2||v===3)return v;
  const value=String(v??'').trim().toLocaleLowerCase('es');
  if(['1','v','verdadero','true'].includes(value))return 1;
  if(['2','f','falso','false'].includes(value))return 2;
  if(['3','o','omisión','omision','omitido','omitir','en blanco','—','-'].includes(value))return 3;
  if(!value)return null;throw new Error('Respuesta no reconocida: '+String(v).slice(0,30));
 }
 function migrateCase(c,legacy){
  const next=S.migrate(c,legacy);
  if(c.aiContextualizedReport&&c.aiSourceSignature===R.reportSignature(c)){
   next.aiSourceSignature=R.reportSignature(next);
  }
  return A.freshCase(next);
 }
 function normalizeCases(value){
  const rows=Array.isArray(value)?value:value?.mmpi2_cases||value?.state?.cases||value?.cases||(value?.patient?[value]:null);
  if(!Array.isArray(rows)||!rows.length)throw new Error('El JSON no contiene casos MMPI-2.');
  return rows.map((c,index)=>{
   if(!c?.patient||typeof c.patient!=='object')throw new Error(`Caso ${index+1}: faltan los datos del evaluado.`);
   const patient=validatePatient(c.patient),responses={};
   if(Array.isArray(c.responses)&&c.responses.length===567)c.responses.forEach((v,i)=>{const n=normalizeResponse(v);if(n)responses[i+1]=n;});
   else for(const [k,v]of Object.entries(c.responses||{})){if(!/^\d+$/.test(k)||Number(k)<1||Number(k)>567)throw new Error(`Caso ${index+1}: ítem fuera de 1–567.`);const n=normalizeResponse(v);if(n)responses[k]=n;}
   const sourceVersion=value?.appVersion||value?.state?.appVersion;
   const legacy=sourceVersion ? sourceVersion!==S.VERSION : !Object.hasOwn(c.reportOptions||{},'criticalKoss');
   return migrateCase({...c,id:String(c.id||id()),patient,responses},legacy);
  });
 }
 function parseResponseRows(rows){
  const responses={},errors=[];let duplicates=0;
  for(const row of rows){
   if(!row.length||!/^\d+$/.test(String(row[0]??'').trim()))continue;
   for(let ci=0;ci+1<row.length;ci+=2){
    const rawItem=String(row[ci]??'').trim();if(!rawItem)continue;
    if(!/^\d+$/.test(rawItem)){errors.push('Número de ítem inválido: '+rawItem);continue;}
    const item=Number(rawItem);if(item<1||item>567){errors.push('Ítem fuera de rango: '+item);continue;}
    try{const value=normalizeResponse(row[ci+1]);if(value==null)continue;if(responses[item]!=null){duplicates++;errors.push('Ítem duplicado: '+item);}else responses[item]=value;}catch(e){errors.push('Ítem '+item+': '+e.message);}
   }
  }
  if(errors.length)throw new Error(errors.slice(0,8).join(' · ')+(errors.length>8?' · y '+(errors.length-8)+' incidencias más.':''));
  if(!Object.keys(responses).length)throw new Error('No se encontraron respuestas. Use la hoja Respuestas y columnas Ítem / Respuesta.');
  return {responses,count:Object.keys(responses).length,omitted:Object.values(responses).filter(v=>v===3).length,duplicates};
 }
 function parseCSV(text){
  const lines=text.split(/\r?\n/).filter(l=>l.trim()),candidate=lines.find(l=>/item|ítem/i.test(l)&&/respuesta|pregunta|texto/i.test(l))||lines[0]||'';
  let quotedHeader=false;const counts={',':0,';':0,'\t':0};for(let i=0;i<candidate.length;i++){const ch=candidate[i];if(ch==='\"'){if(quotedHeader&&candidate[i+1]==='\"')i++;else quotedHeader=!quotedHeader;}else if(!quotedHeader&&ch in counts)counts[ch]++;}
  const delimiter=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&c===delimiter){row.push(cell);cell='';}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw new Error('El archivo de texto contiene comillas sin cerrar.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
 }
 function load(){
  const raw=root.localStorage?.getItem(KEY);if(!raw)return {state:{cases:[],evaluator:{fullName:'José Alonso Andrade Salazar',professionalReg:'COLPSIC 117492'},currentCaseId:null,appVersion:S.VERSION},migration:false};
  let parsed;try{parsed=JSON.parse(raw);}catch(e){throw new Error('El almacenamiento de casos no se pudo leer. Exporte o recupere el respaldo; no se ha sobrescrito.');}
  const state=parsed.state||parsed;
  if(!Array.isArray(state.cases))throw new Error('El almacenamiento no tiene una lista de casos válida.');
  const migration=state.appVersion!==S.VERSION;
  if(migration&&!root.localStorage.getItem(BACKUP_KEY))root.localStorage.setItem(BACKUP_KEY,raw);
  if(migration&&!state.appVersion&&!root.localStorage.getItem('mmpi2-respaldo-antes-v17'))root.localStorage.setItem('mmpi2-respaldo-antes-v17',raw);
  return {state:{...state,cases:state.cases.map(c=>migrateCase(c,migration)),appVersion:S.VERSION},migration};
 }
 function save(state){root.localStorage.setItem(KEY,JSON.stringify({state:{...state,appVersion:S.VERSION},version:0}));return state;}
 function importInto(state,incoming,mode='copy'){
  const ids=new Set(state.cases.map(c=>c.id));let cases=[...state.cases];
  for(let c of incoming){
   if(ids.has(c.id)){
    if(mode==='update'){const old=cases.find(x=>x.id===c.id);c={...c,previousReports:[...(c.previousReports||[]),A.snapshot(old,'Versión previa a importación')],importedAt:new Date().toISOString()};cases=cases.map(x=>x.id===c.id?c:x);continue;}
    c={...c,id:id(),copiedFrom:c.id,importedAt:new Date().toISOString()};
   }
   ids.add(c.id);cases.unshift(c);
  }
  return {...state,cases};
 }
 root.MMPI2Cases={id,today,ageAt,validatePatient,create,reapply,normalizeResponse,normalizeCases,parseResponseRows,parseCSV,load,save,importInto,BACKUP_KEY};
})(globalThis);

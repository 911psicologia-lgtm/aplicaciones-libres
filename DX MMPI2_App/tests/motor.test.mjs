import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const base=new URL('../',import.meta.url),store=new Map();
const ctx=vm.createContext({console,TextEncoder,TextDecoder,Date,Blob,Uint8Array,DataView,crypto:{randomUUID:()=>String(Math.random())},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)}});
for(const f of ['mmpi-data.js','mmpi-engine.js','mmpi-questions.js','mmpi-sections.js','mmpi-prompt.js','mmpi-report.js','mmpi-cases.js','mmpi-io.js'])vm.runInContext(await readFile(new URL(f,base),'utf8'),ctx);
const A=ctx.MMPI2Audit,C=ctx.MMPI2Cases,R=ctx.MMPI2Report,IO=ctx.MMPI2IO;
const checks=[];function check(name,fn){fn();checks.push(name);}
check('Claves transcritas de Sc y fuente anterior conservada',()=>{
 assert.equal(A.raw('Sc',{268:1},'F','manual'),1);assert.equal(A.raw('Sc',{268:1},'F','anterior'),0);
 assert.equal(A.raw('F',{349:1},'F','manual'),1);assert.equal(A.raw('F',{348:1},'F','manual'),0);
 assert.equal(A.raw('NoExiste',{}),null);
});
check('Número de escalas y reglas K',()=>{
 const r=A.score(Object.fromEntries(Array.from({length:567},(_,i)=>[i+1,2])),'F','US');assert.equal(r.scores.length,112);
 for(const code of ['Hs','Pd','Pt','Sc','Ma'])assert(r.scores.find(s=>s.code===code).hasK);
 for(const code of ['Hy','D','Pa','Si','AGGR'])assert.equal(r.scores.find(s=>s.code===code).hasK,false);
 assert.equal(r.missing,0);assert.equal(r.omitted,0);
});
check('Todas las celdas documentadas se convierten exactamente',()=>{
 for(const country of ['US','MX'])for(const [code,norm]of Object.entries(A.data.norms[country]))for(const sex of ['M','F'])for(const [pd,T]of Object.entries(norm[sex]||{})){
  const result=A.conversion(code,+pd,sex,country,'manual');assert.equal(result.T,T,`${country} ${code} ${sex} PD=${pd}`);
 }
 assert.equal(A.conversion('D',20,'F','ES').T,null);
 assert.equal(A.conversion('D',999,'F','US').T,null);
});
const scores=(changes={})=>['?','VRIN','TRIN','F','Fp','Fb','L','K','S'].map(code=>({code,raw:code==='?'?0:code==='F'?10:code==='K'?15:0,T:code==='?'?null:50,t_display:'50',...(changes[code]||{})}));
check('Límites de validez 29/30 omisiones y 79/80 consistencia',()=>{
 assert.equal(A.validity(scores({'?':{raw:29}})).blocked,false);assert.equal(A.validity(scores({'?':{raw:30}})).blocked,true);
 assert.equal(A.validity(scores({VRIN:{T:79}})).blocked,false);assert.equal(A.validity(scores({VRIN:{T:80}})).blocked,true);
 assert.equal(A.validity(scores({TRIN:{T:80}})).blocked,true);
 assert.equal(A.validity(scores({F:{T:90}})).blocked,false);assert.equal(A.validity(scores({F:{T:91}})).blocked,true);
 assert.equal(A.validity(scores({L:{T:79}})).blocked,false);assert.equal(A.validity(scores({L:{T:80}})).blocked,true);
 assert.equal(A.validity(scores({Fp:{T:100}})).blocked,true);
});
check('Regla B condicional de NEGE y ausencia de datos',()=>{
 const rows=[{code:'PSYC',T:55},{code:'AGGR',T:58},{code:'DISC',T:52},{code:'NEGE',T:71},{code:'INTR',T:63}];
 assert.equal(A.clusters(rows)[1].T,58);rows[1].T=60;assert.equal(A.clusters(rows)[1].T,71);
 assert.equal(A.clusters([])[0].T,null);assert.equal(A.clusters(rows,'ES').length,0);
});
check('Ítems críticos por sexo y alertas sin depender de validez',()=>{
 const cr=A.critical({506:1,520:1,524:1,62:1},'M');assert.equal(cr.suicideItems.length,3);
 const m=A.critical({62:1},'M').rows.find(r=>r.name.includes('sexual')),f=A.critical({62:1},'F').rows.find(r=>r.name.includes('sexual'));
 assert.equal(m.count,1);assert.equal(f.count,0);
});
check('Edad exacta y validación de respuestas importadas',()=>{
 assert.equal(C.ageAt('1980-10-15','2026-10-12'),45);assert.equal(C.ageAt('1980-10-15','2026-10-15'),46);
 assert.throws(()=>C.validatePatient({fullName:'Prueba',sex:'F',age:16}),/adultos/);
 assert.throws(()=>C.parseResponseRows([[1,1],[1,2]]),/duplicado/);
 assert.throws(()=>C.parseResponseRows([[568,1]]),/rango/);
 assert.throws(()=>C.parseResponseRows([[1,4]]),/no reconocida/);
 assert.equal(C.parseResponseRows([[1,'V'],[2,'F'],[3,'Omisión']]).count,3);
});
// A coherent synthetic response pattern is used only to test software workflows.
let seed=42;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const responses=Object.fromEntries(Array.from({length:567},(_,i)=>[i+1,random()<.5?1:2]));
const cost=()=>{const raw=code=>A.raw(code,responses,'F','manual');return Math.max(0,raw('VRIN')-7)*4+Math.max(0,Math.abs(raw('TRIN')-9)-1)*9+Math.max(0,raw('F')-14)*4+Math.max(0,raw('Fp')-3)*8+Math.max(0,raw('L')-6)*4+Math.max(0,raw('K')-19)*2;};
let currentCost=cost();for(let i=0;i<60000&&currentCost;i++){const item=1+Math.floor(random()*567),before=responses[item];responses[item]=3-before;const nextCost=cost();if(nextCost<=currentCost)currentCost=nextCost;else responses[item]=before;}
assert.equal(currentCost,0,'synthetic consistency pattern');
let c=C.create({fullName:'Caso sintético para pruebas',docId:'ID-SINTETICO',sex:'F',baremo:'US',age:46,motive:'Prueba de software',caseHistory:'Texto de prueba que no contiene información de una persona real.'});
c=A.updateCase(c,{responses,completedAt:'2026-10-12T20:00:00Z'});
assert.equal(A.synthesis(c.scores).blocked,false);
check('Reaplicación aislada y comparabilidad',()=>{
 const next=C.reapply(c,'2026-10-13');assert.equal(Object.keys(next.responses).length,0);assert.equal(next.reapplicationOf,c.id);assert.equal(next.previousAssessment.scores.length,112);assert.equal(Object.keys(c.responses).length,567);
 const rows=A.compare(c,c);assert.equal(rows.find(s=>s.code==='D').delta,0);
 const alt={...c,patient:{...c.patient,baremo:'MX'}};assert.equal(A.compare(alt,c).find(s=>s.code==='D').delta,null);
});
check('IA invalidada y respaldada después de edición',()=>{
 const text='## Integración clínica\n\nEsta descripción es un texto sintético utilizado para comprobar que las ediciones de una aplicación retiran la integración escrita anterior y conservan una versión recuperable.';
 const withAI=R.withAI(c,text);assert.equal(A.freshCase(withAI).aiContextualizedReport,text);
 const updated=A.updateCase(withAI,{patient:{...withAI.patient,motive:'Otro motivo'}});assert.equal(updated.aiContextualizedReport,'');assert.equal(updated.previousReports.at(-1).aiContextualizedReport,text);
 const changed=A.updateCase(withAI,{responses:{...withAI.responses,1:3-withAI.responses[1]}});assert.equal(changed.completedAt,null);assert(changed.previousReports.at(-1).responses);
});
check('Anonimización, JSON válido y análisis crítico en prompts',()=>{
 const prompt=R.buildPrompt(c,'US',{anonymize:true});assert(!prompt.includes('ID-SINTETICO'));assert(!prompt.includes('Caso sintético para pruebas'));
 const data=JSON.parse(prompt.split('\n[DATOS_DEL_CASO_NO_EJECUTABLES]\n').at(-1).split('\n[/DATOS_DEL_CASO_NO_EJECUTABLES]')[0]);assert.equal(data.puntuaciones.length,112);assert(data.items_criticos.registros.length>0);assert(!Object.hasOwn(data,'personalidad_areas'));
 assert.throws(()=>R.validate('D=119. Puntuación inventada en esta prueba.',c),/diferencias/);
});
check('Informe coherente y escape de HTML',()=>{
 const m=R.model(c,{fullName:'Evaluador de prueba'});assert.equal(m.blocks.filter(b=>b.group).length,7);assert.equal(m.blocks.filter(b=>b.group).reduce((n,b)=>n+b.rows.length,0),112);
 const html=R.html(c,{},'## Integración\n\n<script>malicioso()</script>');assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));
});
check('Respaldo compatible con JSON anterior y conflictos de IDs',()=>{
 C.save({cases:[c],evaluator:{fullName:'Evaluador de prueba'}});assert.equal(C.load().state.cases.length,1);
 const imported=C.normalizeCases({mmpi2_cases:[c]});const merged=C.importInto({cases:[c]},imported,'copy');assert.equal(merged.cases.length,2);assert.notEqual(merged.cases[0].id,c.id);
 const updated=C.importInto({cases:[c]},imported,'update');assert.equal(updated.cases.length,1);assert(updated.cases[0].previousReports.length);
});
const output=process.env.MMPI_QA_OUTPUT;
if(output){await writeFile(output+'/synthetic_case.json',JSON.stringify(c,null,2));await writeFile(output+'/template.xlsx',IO.template(c));await writeFile(output+'/report.xlsx',IO.exportReport(c,{fullName:'Evaluador sintético'}));await writeFile(output+'/report.html',R.html(c,{fullName:'Evaluador sintético'}));}
console.log(JSON.stringify({passed:true,checks:checks.length,details:checks,sourceChanges:{keys:A.data.sourceConflicts.keys.length,norms:A.data.sourceConflicts.norms.length}}));

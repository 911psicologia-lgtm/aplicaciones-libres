import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const base=new URL('../',import.meta.url),storage=new Map(),events={},nodes=new Map(),errors=[];
const node=id=>{if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',style:{},value:'',open:false,className:'',classList:{add(){},remove(){}},close(){this.open=false;},showModal(){this.open=true;},focus(){},select(){},reportValidity:()=>true});return nodes.get(id);};
const doc={getElementById:node,addEventListener:(name,fn)=>events[name]=fn,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({click(){},remove(){},style:{}}),body:{appendChild(){}}};
const ctx=vm.createContext({console:{log(){},warn(){},error:e=>errors.push(e.message)},Date,TextEncoder,TextDecoder,Blob,Uint8Array,DataView,setTimeout:()=>1,clearTimeout(){},crypto:{randomUUID:()=>String(Math.random())},location:{protocol:'file:'},navigator:{onLine:true,userAgent:'Node event tests',clipboard:{writeText:async()=>{}}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},document:doc,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},FormData:class{constructor(form){this.data=form.data||{};}*[Symbol.iterator](){yield*Object.entries(this.data);}},window:{addEventListener(){}}});
for(const f of ['mmpi-data.js','mmpi-engine.js','mmpi-questions.js','mmpi-sections.js','mmpi-prompt.js','mmpi-report.js','mmpi-cases.js','mmpi-io.js','app.js'])vm.runInContext(await readFile(new URL(f,base),'utf8'),ctx);
const A=ctx.MMPI2Audit,APP=ctx.MMPI2App;
async function click(action,data={}){const el={dataset:{action,...data},disabled:false,classList:{add(){},remove(){}},getAttribute:()=>null};await events.click({preventDefault(){},target:{closest:()=>el}});}
const output=process.env.MMPI_QA_OUTPUT;
if(output)await writeFile(output+'/dashboard-dom.html',node('app').innerHTML);
assert(node('app').innerHTML.includes('Panel de casos'));
await click('new');assert(node('dialog').open);
node('case-form').data={fullName:'Caso sintético UI',docId:'PRUEBA',sex:'F',birthDate:'1980-10-15',age:'',applicationDate:'2026-10-12',baremo:'US',calculationSource:'manual',context:'clinico',modalidad:'Presencial',schooling:'',occupation:'',motive:'Prueba de flujo',antecedents:'',caseHistory:'Datos sintéticos.'};
await click('case-save');assert.equal(APP.getState().cases.length,1);assert.equal(APP.getCase().patient.age,45);assert.equal(node('dialog').open,false);
await click('tab',{tab:'capture'});assert(node('app').innerHTML.includes('Respuesta del ítem 1'));
assert(node('app').innerHTML.includes(ctx.MMPI2QuestionBank.questions[1]));
await events.change({target:{id:'response-1',dataset:{responseItem:'1'},value:'1',getAttribute:()=> 'Respuesta del ítem 1'}});assert.equal(APP.getCase().responses[1],1);
await events.change({target:{id:'response-1',dataset:{responseItem:'1'},value:'3',getAttribute:()=> 'Respuesta del ítem 1'}});assert.equal(APP.getCase().responses[1],3);
await events.change({target:{id:'response-1',dataset:{responseItem:'1'},value:'0',getAttribute:()=> 'Respuesta del ítem 1'}});assert.equal(APP.getCase().responses[1],undefined);
await click('capture-seq');await click('answer',{item:'1',value:'2'});assert(node('app').innerHTML.includes('ÍTEM 2 DE 567'));assert.equal(APP.getCase().responses[1],2);
await click('finish');assert(errors.at(-1).includes('566'));assert.equal(APP.getCase().completedAt,undefined);errors.pop();
// Feed the same coherent synthetic protocol produced by motor.test.mjs.
{
 const fixture=output?JSON.parse(await readFile(output+'/synthetic_case.json','utf8')):{responses:JSON.parse(await readFile(new URL('./fixtures/respuestas-sinteticas.json',import.meta.url),'utf8'))};
 const csv='Ítem,Respuesta\n'+Object.entries(fixture.responses).map(([i,v])=>`${i},${v}`).join('\n');
 await events.change({target:{id:'file-responses',dataset:{},type:'file',value:'selected',files:[{name:'prueba.csv',size:csv.length,text:async()=>csv}]}});
 assert(node('dialog').open);assert(node('dialog').innerHTML.includes('567 respuestas'));
 node('response-import-mode').value='replace';await click('responses-import-confirm');assert.equal(Object.keys(APP.getCase().responses).length,567);
 await click('finish');assert(APP.getCase().completedAt);assert(node('app').innerHTML.includes('Puntuaciones y perfil'));
 if(output)await writeFile(output+'/results-dom.html',node('app').innerHTML);
 await click('tab',{tab:'ai'});
 const ai='## Integración clínica\n\nTexto sintético de prueba para verificar que la aplicación conserva una integración suficientemente extensa y revisable, sin representar información de un paciente real ni introducir puntuaciones nuevas.';
 events.input({target:{id:'ai-input',value:ai}});await click('ai-save');assert.equal(APP.getCase().aiContextualizedReport,ai);assert.equal(node('report-preview').srcdoc.includes('Texto sintético'),true);
 await click('ai-review');assert(APP.getCase().aiReviewedAt);
 await events.change({target:{id:'report-option',dataset:{reportOption:'charts'},checked:false}});assert.equal(APP.getCase().aiContextualizedReport,ai,'display options preserve AI integration');
 const oldID=APP.getCase().id;await click('reapply');assert.notEqual(APP.getCase().id,oldID);assert.equal(APP.getCase().reapplicationOf,oldID);assert.equal(Object.keys(APP.getCase().responses).length,0);assert(APP.getState().cases.find(c=>c.id===oldID).completedAt);
 await click('open',{id:oldID});await click('edit',{id:oldID});node('case-form').data={...APP.getCase().patient,modalidad:APP.getCase().modalidad,motive:'Motivo editado'};await click('case-save');assert.equal(APP.getCase().aiContextualizedReport,'');assert(APP.getCase().previousReports.at(-1).aiContextualizedReport.includes('Texto sintético'));
 await click('archive');assert(APP.getCase().archivedAt);await click('archive');assert.equal(APP.getCase().archivedAt,null);
 await click('nav',{view:'sources'});assert(node('app').innerHTML.includes('958'));
 await click('nav',{view:'settings'});assert(node('app').innerHTML.includes('Evaluador y ajustes'));
}
assert.deepEqual(errors,[]);
console.log(JSON.stringify({passed:true,mode:'event handlers with DOM adapter; not browser rendering',flows:['create','edit','capture autosave','sequential navigation','incomplete finalization prevented','CSV preview and import','finalize','AI import and review','display options preserve AI','isolated reapplication','AI version history','archive and restore','sources','settings']}));

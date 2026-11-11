const {readFileSync,writeFileSync}=require('node:fs');
const {resolve,join}=require('node:path');
const {webcrypto}=require('node:crypto');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const test=require('node:test');

const root=resolve(__dirname,'..');
const read=name=>readFileSync(join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const inventory=process.env.MMPI2_LICENCIAS?JSON.parse(readFileSync(process.env.MMPI2_LICENCIAS,'utf8').replace(/^\uFEFF/,'')):null;
const datasets={
  __ITEMS__:json('data/items.json'),__BAREMOS_ES__:json('data/baremos.json'),__BAREMOS_US__:json('data/baremo_us.json'),
  __BAREMOS_MX__:json('data/baremo_mx.json'),__CRITERIOS__:json('data/criterios.json'),__VRIN_TRIN_PAIRS__:json('data/vrin_trin_pairs.json')
};
const smokeModules=['utils','report-sections','storage','license-catalog','license','mmpi2','interpret','critical',
  'previous','report-charts','report-model','formularios-pdf','ai-prompt','json-repair','report-render','export','selftest'];
const originalFixture=Object.values(json('tests/respuestas-sinteticas.json'));
const basePatient={
  name:'Protocolo ficticio',document:'IDENTIFICADOR-FICTICIO',dob:'1980-10-15',age:45,sex:'M',country:'US',applicationDate:'2026-10-12',
  reason:'Solicitud sintética',history:'Antecedentes de prueba.',caseHistory:'Cronología sintética de seguimiento.',context:'Clínico'
};
const evaluator={name:'Profesional ficticio',city:'Ciudad de prueba'};
const lockQueue=()=>{
  let queue=Promise.resolve();
  return {request(name,fn){const run=queue.then(fn);queue=run.catch(()=>{});return run;}};
};

function runtime(memory=new Map(),locks=lockQueue()){
  const events=new Map(),nav=[],toasts=[];
  const document={
    readyState:'loading',getElementById:()=>null,dispatchEvent:()=>true,addEventListener:(name,fn)=>events.set(name,fn)
  };
  const globals={
    ...datasets,document,console,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,DataView,Blob,Date,
    atob,btoa,setTimeout,clearTimeout,Intl,URL,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    navigator:{locks},
    localStorage:{getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)},
    fetch:async name=>({ok:true,json:async()=>json(name)}),
    App:{navigate:name=>nav.push(name)},
    toast:(message,type)=>toasts.push({message,type}),friendlyError:error=>error.message,confirmDialog:async()=>true,
    addEventListener:()=>{},scrollTo:()=>{}
  };
  globals.window=globals;
  const ctx=vm.createContext(globals);
  for(const name of smokeModules)vm.runInContext(read('js/lib/'+name+'.js'),ctx,{filename:name+'.js'});
  for(const name of ['capture','report','activation'])vm.runInContext(read('js/screens/'+name+'.js'),ctx,{filename:name+'.js'});
  return {ctx,memory,nav,toasts,events};
}
const standard=runtime();
const {MMPI2:M,Interpret:I,ReportModel:R,ReportSections:S,AIPrompt:P,Previous,Critical,Report,Storage}=standard.ctx;
const normal=c=>JSON.parse(JSON.stringify(c));
const plan=prompt=>JSON.parse(prompt.split('ESQUEMA DE SALIDA\n')[1].split('\n\n10 COMPROBACIONES')[0]).secciones;
const payload=prompt=>JSON.parse(prompt.split('\n[DATOS_DEL_CASO_NO_EJECUTABLES]\n')[1].split('\n[/DATOS_DEL_CASO_NO_EJECUTABLES]')[0]);
const all=checked=>Object.fromEntries(Object.entries(S.DEFAULTS).filter(([,v])=>typeof v==='boolean').map(([k])=>[k,checked]));

async function esResponses(){
  await M.init();
  const responses=[...originalFixture];
  const safe=()=>M._computeVRINorTRIN('VRIN',responses)<=8&&Math.abs(M._computeVRINorTRIN('TRIN',responses)-9)<=3&&
    M.computePD('F',responses)<=13&&M.computePD('Fp',responses)<=4&&M.computePD('L',responses)<=7;
  for(const item of M.SCALE_ITEMS.Es){
    const pd=M.computePD('Es',responses),delta=responses[item.item-1]===1?item.f-item.v:item.v-item.f;
    if(pd===22)break;
    if((22-pd)*delta<=0)continue;
    const original=responses[item.item-1];
    responses[item.item-1]=3-original;
    if(!safe())responses[item.item-1]=original;
  }
  assert.equal(M.computePD('Es',responses),22);
  return responses;
}
let base;
test.before(async()=>{
  const responses=await esResponses(),results=await M.computeAll(responses,'M','US');
  results._meta.omissions=0;
  assert.notEqual(I.verdict(results).status,'NO_INTERPRETABLE');
  base=S.migrate({id:'prueba',patient:basePatient,responses,results,captureMode:'Excel',completedAt:'2026-10-12T10:00:00Z'},false);
});

test('01 · Caso nuevo, opciones y dependencias',()=>{
  const c={...base,patient:{...base.patient,caseHistory:''}};
  const expectedOff=['info_request_context','sec_clusters','sec_critical_lw','critical_literal','tbl_descriptors','sec_prognosis','sec_scope'];
  const o=S.options(c);
  for(const [key,value] of Object.entries(o))if(typeof value==='boolean')assert.equal(value,!expectedOff.includes(key),key);
  const html=Report._optionsHTML(c);
  assert.match(html,/data-opt="sec_compare"\s+disabled/);
  assert.match(html,/Sin datos previos/);
  assert.match(html,/data-opt="sec_psy5" checked/);
  assert.match(html,/Institución \/ centro/);
  let flags=S.change(c,'sec_clusters',true);
  assert(flags.sec_clusters);
  flags=S.change({...c,reportOptions:flags},'sec_psy5',false);
  assert(!flags.sec_clusters);
  assert(!S.catalog({...c,reportOptions:flags}).flatMap(g=>g.items).find(s=>s.key==='sec_clusters').available);
  const scoped=S.change(c,'info_request_context',true);
  assert(scoped.sec_scope);
  assert.equal(S.plan({...c,reportOptions:scoped}).at(-1).id,'alcance');
  assert(!S.plan(c).some(s=>s.titulo.includes('Historia')));
  const r=R.build(c);
  const exam=r.blocks.find(b=>b.sectionId==='examen'&&b.t==='p');
  assert.equal(exam.text,'No consta');
});

test('02 · Migración de V16 conserva selecciones, caso, borrador y papelera',()=>{
  const legacy={...base,patient:{...basePatient,legalContext:'Solicitud previa sintética.'},
    reportOptions:{info_legal:true,sec_psy5:true,sec_critical:true,sec_critical_lw:false,tbl_descriptors:true,sec_charts:false}};
  delete legacy.reportSchema;
  const {ctx,memory}=runtime();
  memory.set(ctx.Storage.KEYS.CASES,JSON.stringify([legacy]));
  memory.set(ctx.Storage.KEYS.CURRENT_CASE,JSON.stringify(legacy));
  memory.set(ctx.Storage.KEYS.TRASH,JSON.stringify([{...legacy,id:'archivado'}]));
  memory.set(ctx.Storage.KEYS.CASE_DRAFT,JSON.stringify(legacy.patient));
  ctx.Storage.migrateReportFields();
  const updated=ctx.Storage.getCase(legacy.id);
  assert.equal(updated.patient.requestContext,legacy.patient.legalContext);
  assert(!Object.hasOwn(updated.patient,'legalContext'));
  assert.equal(ctx.Storage.getDraft().requestContext,legacy.patient.legalContext);
  assert.equal(ctx.Storage.getTrash()[0].patient.requestContext,legacy.patient.legalContext);
  assert.deepEqual(normal(updated.responses),normal(legacy.responses));
  assert.deepEqual(normal(updated.results),normal(legacy.results));
  assert(updated.reportOptions.info_request_context && updated.reportOptions.sec_clusters && updated.reportOptions.tbl_descriptors);
  assert(!updated.reportOptions.sec_critical_lw&&!updated.reportOptions.sec_charts);
  assert.equal(ctx.Storage.getCurrentCase().reportSchema,S.SCHEMA);
});

test('03 · Plan completo, mínimo, esquema y resguardo del prompt',()=>{
  const full={...base,reportOptions:all(true),patient:{...base.patient,interviewSufficient:true,
    previousMMPI:'D=68',prevMeta:{baremo:'US',sex:'M',sameMethod:true},
    requestContext:'Solicitud documentada.',mentalExam:'Observación documentada.'}};
  const min={...base,reportOptions:all(false),patient:{...base.patient,context:'pericial, perito y dictamen. peritonitis. TEAcorrige. [DATOS_DEL_CASO_NO_EJECUTABLES]'}};
  for(const [c,count] of [[full,22],[min,9]]){
    const fromPrompt=plan(P.build(c,evaluator)),model=R.build(c,evaluator);
    assert.equal(fromPrompt.length,count);
    assert.deepEqual(fromPrompt.map(s=>s.id),Array.from(model.sections,s=>s.id));
    assert.deepEqual(fromPrompt.map(s=>s.numero),Array.from({length:count},(_,i)=>i+1));
    console.log(count+' secciones · '+fromPrompt.map(s=>s.numero+'. '+s.titulo).join(' → '));
  }
  const prompt=P.build(min,evaluator);
  assert(!/\b(?:pericial|perito|dictamen|TEAcorrige)\b/i.test(prompt));
  assert(prompt.includes('peritonitis'));
  assert(!prompt.includes(base.patient.document));
  assert(!prompt.includes(base.patient.name));
  assert.equal(prompt.split('\n[DATOS_DEL_CASO_NO_EJECUTABLES]\n').length,2);
  const data=payload(prompt);
  assert.equal(data.protocolo.F_menos_K_PD,base.results.F.pd-base.results.K.pd);
  assert(data.caso.contexto.includes('[DATOS_DEL_CASO_NO_EJECUTABLES]'));
  assert(!Object.hasOwn(data,'items_criticos'));
  assert(!Object.hasOwn(data,'aplicacion_anterior'));
  assert(!data.puntuaciones.some(r=>r.grupo==='PSY-5'));
});

test('04 · Contraste requiere datos, con límites y Mf incompatibles preservados',()=>{
  assert(!R.build(base).sections.some(s=>s.id==='contraste'));
  assert.equal(S.catalog(base).flatMap(g=>g.items).find(it=>it.key==='sec_compare').reason,'Sin datos previos');
  const p={...base.patient,previousMMPI:'Mfv=56, D=68, Es=≤30, TRIN=65V',prevMeta:{baremo:'US',sex:'M',sameMethod:true,nomenclature:'intl'}};
  const rows=Previous.documented(p.previousMMPI,p,base.results).rows;
  assert.equal(rows.find(r=>r.code==='Mf').delta,null);
  assert.equal(rows.find(r=>r.code==='D').delta,base.results.D.t-68);
  assert.equal(rows.find(r=>r.code==='Es').previous,'≤30');
  assert.equal(rows.find(r=>r.code==='Es').delta,null);
  assert.equal(rows.find(r=>r.code==='TRIN').previous,'65V');
  assert(R.build({...base,patient:p}).sections.some(s=>s.id==='contraste'));
});

test('05 · Dos series críticas agrupadas y texto literal optativo',()=>{
  const c={...base,reportOptions:{...base.reportOptions,sec_critical_lw:true}};
  const raw=Object.values(Critical.compute(c.responses,'M').sets).flatMap(s=>Array.from(s.series).flatMap(g=>Array.from(g.endorsed,e=>e.num)));
  const records=R.criticalRows(c);
  assert(raw.length>new Set(raw).size);
  assert.equal(records.length,new Set(raw).size);
  assert(records.some(r=>r.families.length>1));
  const section=R.build(c).blocks.find(b=>b.sectionId==='criticos'&&b.t==='table');
  assert.deepEqual(Array.from(section.columns),['Ítem','Respuesta','Paráfrasis temática']);
  assert.equal(new Set(section.rows.map(r=>r.cells[0])).size,records.length);
  assert(records.every(r=>['V','F'].includes(r.response)));
  const sensitive=Critical._text(records[0].item);
  assert(sensitive.length>5);
  assert(!R.toText(R.build(c)).includes(sensitive));
  const explicit={...c,reportOptions:{...c.reportOptions,critical_literal:true}};
  assert(R.toText(R.build(explicit)).includes(sensitive));
  assert(!P.build(explicit).includes(sensitive));
  console.log('Ítems únicos en el protocolo de exportación: '+records.length);
});

test('06 · Conversión de Es, dirección de TRIN y lectura de validez',async()=>{
  assert.equal(M.lookupT('Es',22,'M','US').t,30);
  assert.equal(M.lookupT('Es',22,'M','US').bound,'≤');
  assert.equal(M.lookupT('Es',22,'M','MX').t,30);
  const selected={...base,reportOptions:{...base.reportOptions,tbl_descriptors:true}};
  const model=R.build(selected);
  const v=model.blocks.find(b=>b.group==='Validez');
  assert(v.columns.includes('Rango de T')&&v.columns.includes('Lectura breve'));
  assert(v.rows.every(row=>row.cells.at(-1).trim()));
  assert(R.build(base).blocks.some(b=>b.sectionId==='validez'&&b.t==='interp'));
  const es=model.blocks.find(b=>b.group==='Suplementarias').rows.find(r=>r.cells[0]==='Es');
  assert.equal(es.cells[2],22);
  assert.equal(es.cells[4],'≤30');
  assert.equal(es.cells[5],'Bajo');
  assert.match(es.cells.at(-1),/Recursos de afrontamiento percibidos reducidos/);
  assert.match(model.blocks.find(b=>b.group==='Suplementarias').footnote,/límite inferior de reporte/);
  const us=model.blocks.find(b=>b.t==='chart'&&b.sectionId==='suplementarias');
  assert.equal(us.spec.series[0].data[us.spec.labels.indexOf('Es')],30);
  assert.equal(us.spec.series[0].shown[us.spec.labels.indexOf('Es')],'≤30');
  const results=await M.computeAll(base.responses,'M','MX');
  const mx=R.build({...base,patient:{...base.patient,country:'MX'},results}).blocks.find(b=>b.t==='chart'&&b.sectionId==='suplementarias');
  assert.equal(mx.spec.series[0].data[mx.spec.labels.indexOf('Es')],30);
  assert.equal(mx.spec.series[0].shown[mx.spec.labels.indexOf('Es')],'30');
  const Chart=require(join(root,'vendor/chart.umd.min.js'));
  for(const [spec,label] of [[us.spec,'≤30'],[mx.spec,'30']]){
    const canvas={width:900,height:350,getContext(){return context;}};
    const drawn=[];
    const context=new Proxy({canvas,measureText:value=>({width:String(value).length*7}),
      fillText:(value,x)=>drawn.push({value:String(value),x})},{get:(target,key)=>target[key]??(()=>{})});
    const chart=new Chart(canvas,standard.ctx.ReportCharts.toConfig(spec,true));
    const point=chart.getDatasetMeta(0).data[spec.labels.indexOf('Es')];
    assert.equal(point.skip,false);
    assert(drawn.some(drawnLabel=>drawnLabel.value===label&&Math.abs(drawnLabel.x-point.x)<1));
    chart.destroy();
  }
  const trin={...base,results:{...base.results,TRIN:{...base.results.TRIN,pd:11,t:65,verify:false}}};
  assert.equal(R.score(trin,'TRIN').published,'65V');
  assert.equal(R.levelLabel(55),'Habitual');
  const profileLabels=[];
  const profileContext=new Proxy({measureText:value=>({width:String(value).length*7}),
    fillText:value=>profileLabels.push(String(value))},{get:(target,key)=>target[key]??(()=>{})});
  Report._drawProfileCanvas(profileContext,1400,900,base.results);
  assert(profileLabels.includes('≤30'),'El perfil imprimible debe conservar el límite de Es');
});

function aiPayload(c){
  return {secciones:Array.from(S.plan(c),section=>({...section,bloques:section.id==='integracion'?
    [{tipo:'parrafo',contenido:'Marcador de integración sintética que permite comprobar el flujo y la ubicación.'}]:
    section.id==='identificacion'?[{tipo:'tabla',columnas:['Campo','Valor'],filas:[['Nombre','IDENTIDAD-IA-DESCARTADA']]}]:[]
  })),referencias:['Referencia de prueba verificada.']};
}

test('07 · JSON variable y ficha local en HTML, Word, PDF, Excel y TXT',async()=>{
  const c={...base,reportOptions:{...base.reportOptions,sec_critical_lw:true,tbl_descriptors:true}};
  const data=aiPayload(c);
  R.parseAI(data,c,{strict:true});
  const model=R.fromAI(data,c,evaluator);
  const text=R.toText(model);
  assert(text.includes('IDENTIFICADOR-FICTICIO'));
  assert(text.includes('15 de octubre de 1980'));
  assert(text.includes('Marcador de integración sintética'));
  assert(!text.includes('IDENTIDAD-IA-DESCARTADA'));
  assert(!text.includes('Institución / centro'));
  const exported=R.serialize(model);
  assert(Array.isArray(exported.referencias));
  assert.equal(exported.secciones[1].id,'identificacion');
  assert.throws(()=>R.parseAI({referencias:['Referencias sin cuerpo']},c,{strict:true}),/secciones/);
  const bad=aiPayload(c);
  bad.secciones.find(s=>s.id==='integracion').bloques[0].contenido='Es (T = 31) en la aplicación actual.';
  assert.throws(()=>R.parseAI(bad,c,{strict:true}),/≤30/);
  bad.secciones.find(s=>s.id==='integracion').bloques[0].contenido='Es (T = 30) en la aplicación actual.';
  assert.throws(()=>R.parseAI(bad,c,{strict:true}),/≤30/);
  bad.secciones.find(s=>s.id==='integracion').bloques[0].contenido='Es (T = ≤30), recursos de afrontamiento percibidos reducidos.';
  R.parseAI(bad,c,{strict:true});
  const {ctx}=standard;
  ctx.docx=require(join(root,'vendor/docx.umd.min.js'));
  ctx.jspdf=require(join(root,'vendor/jspdf.umd.min.js'));
  require(join(root,'vendor/jspdf.plugin.autotable.min.js')).applyPlugin(ctx.jspdf.jsPDF);
  ctx.XLSX=require(join(root,'vendor/xlsx.full.min.js'));
  let technical;
  ctx.Export._download=blob=>{technical=blob;};
  ctx.Export.exportExcel(c,evaluator);
  const technicalBook=ctx.XLSX.read(await technical.arrayBuffer());
  const technicalRows=ctx.XLSX.utils.sheet_to_json(technicalBook.Sheets.Puntuaciones,{header:1});
  assert.equal(technicalRows[0][6],'Rango de T');
  assert.equal(technicalRows.find(row=>row[1]==='Es')[5],'≤30');
  assert.equal(technicalRows.find(row=>row[1]==='Es')[6],'Bajo');
  const fakeImages={};
  if(process.env.MMPI2_QA_IMAGE){
    const dataURL='data:image/png;base64,'+readFileSync(process.env.MMPI2_QA_IMAGE).toString('base64');
    for(const b of model.blocks)if(b.t==='chart')fakeImages[b.num]={dataURL,width:900,height:340};
  }
  for(const [name,m] of [['base',R.build(c,evaluator)],['ia',model]]){
    const [word,pdf]=await Promise.all([ctx.ReportRender.toDocx(m,fakeImages),ctx.ReportRender.toPDF(m,fakeImages)]);
    let excel;
    ctx.Export._download=blob=>{excel=blob;};
    ctx.Export.exportModelExcel(m,name+'.xlsx');
    const [docx,pdfBytes,xlsx]=await Promise.all([word.arrayBuffer(),pdf.arrayBuffer(),excel.arrayBuffer()]);
    assert.equal(Buffer.from(docx).subarray(0,2).toString(),'PK');
    assert.equal(Buffer.from(pdfBytes).subarray(0,4).toString(),'%PDF');
    const workbook=ctx.XLSX.read(xlsx);
    assert(workbook.SheetNames.includes('Informe')&&workbook.SheetNames.includes('Datos de gráficas'));
    const workbookText=JSON.stringify(ctx.XLSX.utils.sheet_to_json(workbook.Sheets.Informe,{header:1}));
    assert(workbookText.includes('IDENTIFICADOR-FICTICIO'));
    const html=ctx.ReportRender.toStandaloneHTML(m,fakeImages);
    assert(html.includes('IDENTIFICADOR-FICTICIO'));
    if(process.env.MMPI2_QA_OUT){
      const out=process.env.MMPI2_QA_OUT;
      writeFileSync(join(out,name+'.docx'),Buffer.from(docx));writeFileSync(join(out,name+'.pdf'),Buffer.from(pdfBytes));
      writeFileSync(join(out,name+'.xlsx'),Buffer.from(xlsx));writeFileSync(join(out,name+'.html'),html);
      writeFileSync(join(out,name+'.txt'),R.toText(m));
    }
  }
});

test('08 · Las 81 claves revisadas activan con el cupo correcto', {skip:!inventory},async()=>{
  const {ctx}=runtime();
  const keys=[...inventory.plans,inventory.master];
  const unique=new Set();
  for(const plan of keys){
    for(const key of plan.keys){
      const normalized=ctx.License._normalize(key);
      assert(!unique.has(normalized),'Clave repetida');
      unique.add(normalized);
      const checked=(await ctx.License.activate(key)).license;
      assert(checked?.active&&checked.tier===plan.tier,'Clave o plan incorrectos');
      assert.equal(checked.maxUses,plan.tier==='M0'?Infinity:plan.maxUses);
    }
  }
  assert.equal(unique.size,81);
  const valid=inventory.plans[0].keys[0];
  const invalid=valid.slice(0,-1)+(valid.endsWith('A')?'B':'A');
  assert(!(await ctx.License.verify(invalid)).valid);
  assert.equal((await ctx.License.activate(inventory.master.keys[0])).license.remaining,Infinity);
});

test('09 · Último cupo, saldo V16, concurrencia, reintento y renovación',{skip:!inventory},async()=>{
  const key=inventory.plans[0].keys[0],other=inventory.plans[0].keys[1];
  const memory=new Map(),locks=lockQueue(),a=runtime(memory,locks),b=runtime(memory,locks);
  const L=a.ctx.License,St=a.ctx.Storage;
  memory.set(L.STORAGE_KEY,JSON.stringify({key:L._normalize(key),tier:'A1',maxUses:5,used:4,activatedAt:'2026-01-01T00:00:00Z'}));
  assert.equal((await L.initialize()).remaining,1);
  assert.equal((await b.ctx.License.initialize()).remaining,1);
  assert.equal((await L.activate(key)).license.remaining,1);
  const first={...base,id:'ultimo',completedAt:null,results:null};
  const second={...base,id:'competidor'};
  St.setCurrentCase(first);St.saveCase(first);St.flush();
  const failure={getCase:()=>null,saveCaseNow(){throw new Error('Falla sintética al guardar');}};
  await assert.rejects(L.complete({...base,id:'falla'},failure),/Falla sintética/);
  assert.equal(L.getStatus().remaining,1);
  const Capture=a.ctx.Capture;
  Object.assign(Capture,{_responses:[...base.responses],_totalItems:567,_mode:'excel'});
  await Promise.all([Capture._finish(),Capture._finish()]);
  const result=St.getCase(first.id);
  assert(result?.results&&result.completedAt,'El último caso debe quedar guardado.');
  assert.deepEqual(a.nav,['report']);
  assert.equal(L.getStatus().used,5);
  assert(!L.isBlocked('report',result).blocked);
  assert(L.isBlocked('case',null).blocked);
  assert((await L.complete(result,St)).ok);
  assert(!(await b.ctx.License.complete(second,b.ctx.Storage)).ok);
  assert.equal((await L.activate(key)).license.remaining,0);
  assert.equal((await L.activate(other)).license.remaining,5);
  assert.equal((await L.activate(key)).license.remaining,0);
  assert.equal((await L.activate(other)).license.remaining,5);
  await Promise.all([L.complete({...base,id:'igual'},St),b.ctx.License.complete({...base,id:'igual'},b.ctx.Storage)]);
  assert.equal(L.getStatus().used,1);
});

test('10 · Recursos del paquete y sintaxis de aplicación',()=>{
  const html=read('index.html'),sw=read('sw.js');
  const resources=Array.from(html.matchAll(/(?:src|href)="([^"#]+)"/g),m=>m[1].split('?')[0]);
  for(const resource of resources)assert(read(resource).length>0);
  assert(resources.includes('js/lib/license-catalog.js')&&resources.includes('js/lib/report-sections.js'));
  assert(sw.includes('./js/lib/license-catalog.js')&&sw.includes('./js/lib/report-sections.js'));
  for(const file of resources.filter(r=>r.endsWith('.js')))new vm.Script(read(file),{filename:file});
});

test('11 · Autopruebas del motor y de la V16',async()=>{
  const {ctx}=runtime();
  const output=await ctx.SelfTest.run();
  assert.equal(output.filter(row=>row.status==='FAIL').length,0);
  assert.equal(output.filter(row=>row.status==='PASS').length,15);
});

test('12 · Arranque y acceso a un informe con licencia agotada',{skip:!inventory},async()=>{
  const {ctx,memory,events}=runtime();
  const appNode={innerHTML:''};
  ctx.document.getElementById=id=>id==='app'?appNode:null;
  ctx.Splash={render:()=>'<h1>Inicio de la app</h1>'};
  ctx.Report={render:()=>'<h1>Informe guardado</h1>'};
  const key=ctx.License._normalize(inventory.plans[0].keys[0]);
  memory.set(ctx.License.STORAGE_KEY,JSON.stringify({key,used:5,tier:'A1',maxUses:5}));
  vm.runInContext(read('js/app.js'),ctx,{filename:'app.js'});
  await events.get('DOMContentLoaded')();
  assert.match(appNode.innerHTML,/Inicio de la app/);
  const app=vm.runInContext('App',ctx);
  ctx.Storage.setCurrentCase(base);
  app.navigate('report');
  assert.match(appNode.innerHTML,/Informe guardado/);
  ctx.Storage.setCurrentCase(null);
  app.navigate('case');
  assert.equal(app.current,'activation');
  assert.match(appNode.innerHTML,/Aplicaciones agotadas/);
});

test('13 · Lecturas sustantivas recuperadas de V16 por escala, rango y sexo',()=>{
  let checks=0;
  for(const sex of ['H','M'])for(const [group,codes] of Object.entries(I.GROUP_ORDER)){
    if(group==='Validez')continue;
    for(const code of codes)for(const t of [30,39,40,55,59,60,65,70,80]){
      if(code==='Es'&&t<=39)continue;
      const expected=t>=60?I.g((I.KB[code]||{}).s||'',sex):t<=39&&I.loText(code,sex)?I.loText(code,sex):'Sin elevación';
      const actual=R.readings({t},code,false,sex);
      assert.equal(actual,expected,code+' / '+sex+' / '+t);
      assert(actual.trim(),code+' sin lectura');
      checks++;
    }
  }
  assert(checks>1000);
  const c={...base,reportOptions:{...base.reportOptions,tbl_descriptors:true}};
  const model=R.build(c);
  for(const group of R.groups(S.options(c)).filter(group=>group!=='Validez')){
    const paragraph=R.narrative(c,I.groupParagraph(group,c.results,c.patient.sex));
    assert(model.blocks.some(block=>block.t==='interp'&&block.text===paragraph),group+' sin interpretación V16');
  }
  const synthesis=model.blocks.find(block=>block.t==='consolidated');
  assert(synthesis.text.includes(R.narrative(c,I.consolidated(c.results,c.patient))));
  const integration=model.blocks.filter(block=>block.sectionId==='integracion').map(b=>b.text||'').join(' ');
  assert(integration.includes(I.distributionParagraph(c.results,c.patient.sex)));
  assert(integration.length>600);
  assert(model.blocks.some(b=>b.sectionId==='recomendaciones'&&b.t==='list'&&b.items.length));
});

test('14 · Validez descriptiva, comprensible y sin órdenes al evaluador',()=>{
  const samples={VRIN:46,TRIN:65,F:72,Fb:85,Fp:57,L:66,K:52,S:49};
  for(const [code,t] of Object.entries(samples)){
    const text=R.readings({t,direction:code==='TRIN'?'V':''},code,false,'M');
    assert(text.length>=60,code);
    assert(!/\b(?:explore|integre|considere|revise|contraste|examine)\b/i.test(text),code);
    assert(!/pares evaluados|bloque (?:inicial|posterior)/i.test(text),code);
  }
  assert.match(R.readings({t:65,direction:'V'},'TRIN'),/Verdadero/);
  assert.match(R.readings({t:65,direction:'F'},'TRIN'),/Falso/);
  assert.match(R.readings({t:85},'Fb'),/parte final del cuestionario/);
  assert.match(R.readings({t:66},'L',false,'M'),/^Posible presentación favorable de sí misma/);
  assert.match(R.readings({t:52},'K'),/sin elevación defensiva marcada/);
});

test('15 · Es en casos guardados: límite visible, prompt coherente y licencia intacta',()=>{
  const c=normal(base);
  c.results.Es.t=null;c.results.Es.status='PD_FUERA_DE_TABLA';
  delete c.results.Es.bound;delete c.results.Es.reportingLimit;delete c.results.Es.reportingSource;
  const {ctx,memory}=runtime();
  memory.set(ctx.Storage.KEYS.CASES,JSON.stringify([c]));
  memory.set(ctx.Storage.KEYS.CURRENT_CASE,JSON.stringify(c));
  const licenseBefore=memory.get('mmpi2_license');
  const saved=ctx.Storage.getCase(c.id),current=ctx.Storage.getCurrentCase();
  assert.equal(saved.results.Es.t,30);assert.equal(current.results.Es.bound,'≤');
  assert.deepEqual(normal(saved.responses),normal(c.responses));
  for(const code of Object.keys(c.results).filter(code=>code!=='Es'&&code!=='_meta'))
    assert.deepEqual(normal(saved.results[code]),normal(c.results[code]),code);
  assert.equal(memory.get('mmpi2_license'),licenseBefore);
  const prompt=payload(ctx.AIPrompt.build(c));
  const es=prompt.puntuaciones.find(row=>row.escala==='Es');
  assert.equal(es.T,30);assert.equal(es.T_publicada,'≤30');assert.equal(es.rango,'Bajo');
  assert.equal(es.limite,'≤');assert.match(es.nota_limite,/límite inferior de reporte/);
  const text=ctx.ReportModel.toText(ctx.ReportModel.build(c));
  assert(!/Es[^\n]{0,50}T (?:queda )?pendiente/.test(text));
  assert(text.includes('Es, T = ≤30'));
  assert(!text.includes('pronóstico más reservado'));
});

test('16 · Todas las celdas originales de Es se conservan; el límite es específico US',()=>{
  for(const [country,bank,sexKeys] of [['US',datasets.__BAREMOS_US__,[['H','M'],['M','F']]],
    ['MX',datasets.__BAREMOS_MX__,[['H','M'],['M','F']]]]){
    for(const [sex,key] of sexKeys)for(const [pd,t] of Object.entries(bank.Es?.[key]||{})){
      const lookup=M.lookupT('Es',Number(pd),sex,country);
      assert.equal(lookup.t,t,country+' / '+sex+' / '+pd);
      assert(!lookup.bound,'Celda original con límite añadido');
    }
  }
  for(const sex of ['H','M']){
    const table=datasets.__BAREMOS_US__.Es[sex==='H'?'M':'F'];
    const first=Math.min(...Object.keys(table).map(Number));
    for(let pd=0;pd<first;pd++){
      const limit=M.lookupT('Es',pd,sex,'US');
      assert.equal(limit.t,30);assert.equal(limit.bound,'≤');
    }
  }
  for(const pd of [null,-1,22.5,'22',999])assert.equal(M.esReportingLimit(pd,'M','US'),null);
  for(const country of ['ES','MX',undefined])assert.equal(M.esReportingLimit(22,'M',country),null);
  const empty={patient:{sex:'M',country:'ES'},results:{Es:{pd:22,t:null}}};
  assert.equal(M.applyReportingLimits(empty),empty);
});

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
  for(const [c,count] of [[full,21],[min,8]]){
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
  assert.equal(exported.secciones[0].id,'identificacion');
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
    if(group==='Clínicas'&&c.results.Mf.t>=65){
      const rest=paragraph.slice(paragraph.indexOf('. ')+2);
      assert(model.blocks.some(block=>block.t==='interp'&&block.text.endsWith(rest)),'Se conserva la lectura clínica V16 después de corregir el recuento de Mf');
    }else assert(model.blocks.some(block=>block.t==='interp'&&block.text===paragraph),group+' sin interpretación V16');
  }
  const synthesis=model.blocks.filter(block=>block.t==='consolidated').map(block=>block.text).join(' ');
  assert(synthesis.includes(R.narrative(c,I.consolidated(c.results,c.patient))));
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

test('17 · Selector Base/Extendido, selección inmediata y preferencias conservadas',()=>{
  const c={...base,reportOptions:{...base.reportOptions,id_document:false,critical_literal:false,institution:'Centro ficticio',info_request_context:false}};
  const compact=S.applyPreset(c,'base'),full=S.applyPreset(c,'extended');
  assert.equal(S.preset(base),'custom');
  assert.equal(compact.reportPreset,'base');assert.equal(full.reportPreset,'extended');
  assert(!compact.reportOptions.sec_subscales&&!compact.reportOptions.sec_clusters&&!compact.reportOptions.info_caseHistory);
  assert(full.reportOptions.sec_subscales&&full.reportOptions.sec_clusters&&full.reportOptions.sec_critical_lw&&full.reportOptions.tbl_descriptors);
  assert(S.options(S.aiCase(compact)).sec_subscales,'La selección Base no recorta las subescalas del informe IA');
  assert(plan(P.build(compact,evaluator)).some(s=>s.id==='subescalas'),'El prompt mantiene las secciones IA');
  const interviewed=S.applyPreset({...c,patient:{...c.patient,interviewSufficient:true}},'extended');
  assert(interviewed.reportOptions.sec_prognosis);
  assert(!S.applyPreset(interviewed,'base').reportOptions.sec_prognosis);
  for(const item of [compact,full]){
    assert(!item.reportOptions.id_document&&!item.reportOptions.critical_literal&&!item.reportOptions.info_request_context);
    assert.equal(item.reportOptions.institution,'Centro ficticio');
    assert.deepEqual(normal(item.results),normal(c.results));
    assert.deepEqual(normal(item.responses),normal(c.responses));
  }
  const model=R.build(compact,evaluator),extended=R.build(full,evaluator);
  assert(!model.sections.some(s=>s.id==='subescalas'));
  assert(extended.sections.some(s=>s.id==='subescalas'));
  assert(model.blocks.find(b=>b.sectionId==='criticos'&&b.t==='table').columns.includes('Ítems y respuestas'));
  assert(extended.blocks.find(b=>b.sectionId==='criticos'&&b.t==='table').columns.includes('Respuesta'));
  assert.match(Report._optionsHTML(compact),/id="report-preset"/);
  Storage.setCurrentCase(c);Report._applyReportPreset('base');
  assert.equal(Storage.getCurrentCase().reportPreset,'base');
  assert(S.options(S.aiCase(Storage.getCurrentCase())).sec_subscales);
  Report._syncAISections();
  assert(!S.options(S.aiCase(Storage.getCurrentCase())).sec_subscales);
  Report._setOption('sec_subscales',true);
  assert.equal(Storage.getCurrentCase().reportPreset,'custom');
  assert(Report._plainFileBase(compact).includes('Base_'));
  assert(Report._plainFileBase(full).includes('Extendido_'));
});

test('18 · Encabezado sin apartado y compatibilidad con JSON anterior',()=>{
  const c={...base,reportOptions:{...base.reportOptions,institution:'Institución de prueba'}};
  const model=R.build(c,evaluator);
  assert.equal(model.sections[0].id,'identificacion');assert.equal(model.sections[0].numero,1);
  assert(!R.toText(model).includes('Encabezado institucional'));
  assert(!R.toText(model).includes('Informe base de aplicación y corrección'));
  assert(model.blocks.some(b=>b.text==='Institución de prueba'&&b.sectionId===null));
  const legacy=aiPayload(c);
  legacy.secciones.unshift({id:'encabezado',titulo:'Encabezado institucional',bloques:[{tipo:'parrafo',contenido:'NO_IMPRIMIR_ENCABEZADO'}]});
  legacy.secciones.forEach((section,index)=>section.numero=index+1);
  R.parseAI(legacy,c,{strict:true});
  const updated=R.fromAI(legacy,c,evaluator);
  assert(!R.toText(updated).includes('NO_IMPRIMIR_ENCABEZADO'));
  assert.equal(updated.sections[0].numero,1);
});

function contextualPayload(c){
  const data=aiPayload(c);
  for(const section of data.secciones){
    if(['motivo','antecedentes','validez','clinicas','contenido','suplementarias','subescalas','integracion','recursos','contraste','recomendaciones'].includes(section.id))
      section.bloques=[{tipo:'parrafo',contenido:'Contexto_'+section.id+': integración específica del registro con las fuentes documentales y el funcionamiento descrito.'}];
    if(section.id==='antecedentes')section.bloques.push({tipo:'tabla',titulo:'Cronología documentada y estado de verificación',columnas:['Fecha','Fuente','Hecho','Verificación'],filas:[['2026','Registro ficticio','Inicio del seguimiento','Documentado']]} );
    if(section.id==='conclusiones')section.bloques=[{tipo:'lista',items:[
      'Primera conclusión contextualizada del protocolo y sus límites.',
      'Segunda conclusión contextualizada del funcionamiento actual y la historia.',
      'Tercera conclusión sobre las cuestiones que requieren comprobación directa.'
    ]}];
  }
  return data;
}

test('19 · IA contextualizada reemplaza la narrativa automática y conserva datos y cuadros',()=>{
  const c=S.applyPreset({...base,patient:{...base.patient,reason:'TEXTO_LOCAL_A_REEMPLAZAR',history:'HISTORIA_LOCAL_A_REEMPLAZAR'}},'extended');
  const local=R.build(S.aiCase(c),evaluator),model=R.fromAI(contextualPayload(c),c,evaluator),text=R.toText(model);
  assert(!text.includes('TEXTO_LOCAL_A_REEMPLAZAR')&&!text.includes('HISTORIA_LOCAL_A_REEMPLAZAR'));
  for(const id of ['validez','clinicas','contenido','suplementarias','subescalas','integracion','recursos']){
    assert(text.includes('Contexto_'+id));
    assert(!model.blocks.some(b=>b.sectionId===id&&b.t==='interp'),'No debe duplicar interpretación automática en '+id);
  }
  const tables=m=>m.blocks.filter(b=>b.group).map(b=>({columns:b.columns,rows:b.rows}));
  assert.deepEqual(normal(tables(model)),normal(tables(local)));
  assert(model.blocks.some(b=>b.t==='table'&&b.caption==='Cronología documentada y estado de verificación'));
  assert(text.includes('IDENTIFICADOR-FICTICIO'));
  assert(text.includes('≤30'));
});

test('20 · Conclusiones por párrafos en el modelo común, texto, HTML y JSON',()=>{
  const local=R.build(base,evaluator);
  const localConclusions=local.blocks.filter(b=>b.sectionId==='conclusiones'&&b.t==='consolidated');
  assert(localConclusions.length>=3);
  const model=R.fromAI(contextualPayload(base),base,evaluator);
  const blocks=model.blocks.filter(b=>b.sectionId==='conclusiones'&&!['h1','h2'].includes(b.t));
  assert.equal(blocks.length,3);assert(blocks.every(b=>b.t==='p'));
  assert(!blocks.some(b=>b.t==='list'||b.t==='consolidated'));
  const json=R.serialize(model).secciones.find(s=>s.id==='conclusiones');
  assert(json.bloques.every(b=>b.tipo==='parrafo'));
  const prompt=P.build(base,evaluator);
  assert(prompt.includes('conclusiones en varios párrafos'));
  assert(prompt.includes('una única interpretación contextualizada'));
  assert(prompt.includes('tabla de cronología'));
});

function documentaryCase(){
  const c=normal(base);
  c.patient.previousMMPI='VRIN=76, TRIN=50, Fb=96, Mf=56';
  c.patient.prevMeta={date:'2026-05-27',source:'Profesional de prueba',baremo:'US',sex:'unknown',sameMethod:false};
  Object.assign(c.results.VRIN,{t:46,verify:false});Object.assign(c.results.TRIN,{t:65,pd:11,verify:false});
  Object.assign(c.results.Fb,{t:85,verify:false});Object.assign(c.results.Mf,{t:67,verify:false});
  return c;
}

test('21 · Contraste con cuatro T publicadas: gráfica visible y análisis aun con comparabilidad pendiente',()=>{
  const c=documentaryCase(),model=R.build(c,evaluator);
  const chart=model.blocks.find(b=>b.sectionId==='contraste'&&b.t==='chart');
  assert(chart);assert.match(chart.caption,/comparabilidad pendiente/);
  assert.deepEqual(normal(chart.spec.labels),['VRIN','TRIN','Fb','Mf']);
  assert.deepEqual(normal(chart.spec.series[0].data),[46,65,85,67]);
  assert.deepEqual(normal(chart.spec.series[1].data),[76,50,96,56]);
  assert.equal(chart.spec.series[0].shown[1],'65V');
  const rows=Previous.documented(c.patient.previousMMPI,c.patient,c.results).rows;
  assert(rows.every(row=>row.delta===null));
  const text=model.blocks.filter(b=>b.sectionId==='contraste').map(b=>b.text||'').join(' ');
  assert(text.includes('VRIN: T anterior 76 y T actual 46'));
  assert(text.includes('respuestas coherentes'));
  assert(text.includes('sexo normativo anterior sin confirmar'));
  const ai=R.fromAI(contextualPayload(c),c,evaluator);
  assert(ai.blocks.some(b=>b.sectionId==='contraste'&&b.t==='chart'));
  assert(R.toText(ai).includes('Contexto_contraste'));
});

test('22 · Diferencias solo con referencias confirmadas; límites y PD no se convierten',()=>{
  const c=documentaryCase();
  c.patient.previousMMPI='D=68. Hs=70. Mfv=56. Es=≤30. TRIN=65F.';
  c.patient.prevMeta={baremo:'US',sex:'M',sameMethod:true,nomenclature:'intl'};
  const prior=Previous.documented(c.patient.previousMMPI,c.patient,c.results).rows;
  assert.equal(prior.find(r=>r.code==='D').delta,c.results.D.t-68);
  assert.equal(prior.find(r=>r.code==='Hs').delta,c.results.Hs.t-70);
  for(const code of ['Mf','Es','TRIN'])assert.equal(prior.find(r=>r.code===code).delta,null);
  const switched={...c.patient,prevMeta:{...c.patient.prevMeta,baremo:'MX'}};
  assert(Previous.documented(c.patient.previousMMPI,switched,c.results).rows.every(r=>r.delta===null));
  const pdCase={...c,patient:{...c.patient,previousMMPI:'Hs_PD=12, D_PD=30'}};
  const model=R.build(pdCase);
  assert(!model.blocks.some(b=>b.sectionId==='contraste'&&b.t==='chart'));
  assert(R.toText(model).includes('fuera de la gráfica'));
});

test('23 · Validador distingue PD de Pd, comprueba finales de frase y conserva límites',()=>{
  const c=documentaryCase();c.results.Pd.t=55;
  assert.equal(R._scoreIssues(c,'VRIN (PD=4, T=46).').length,0);
  assert.equal(R._scoreIssues(c,'Pd (PD=19, PD+K=25, T=55).').length,0);
  assert(R._scoreIssues(c,'Pd T=56.').some(s=>s.includes('56 frente a 55')));
  assert(R._scoreIssues(c,'Pd (PD=19, PD+K=25, T=56).').length);
  assert.equal(R._scoreIssues(c,'Es (PD=22, T <=30).').length,0);
  assert(R._scoreIssues(c,'Es (PD=22, T=30).').length);
  c.patient.history='El informe anterior documentó Hs=97.';
  assert.equal(R._scoreIssues(c,'En los antecedentes se informó Hs (T=97).',S.options(c),'antecedentes').length,0);
  assert(R._scoreIssues(c,'Hs (T=97).',S.options(c),'clinicas').length);
});

test('24 · Base, Extendido e IA: exportación nativa con gráficas comparativas reales', {skip:!process.env.MMPI2_PRESET_QA},async()=>{
  const out=process.env.MMPI2_PRESET_QA,{ctx}=standard;
  const {createCanvas,GlobalFonts}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
  GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','Arial');
  ctx.OffscreenCanvas=createCanvas(1,1).constructor;
  vm.runInContext(read('vendor/chart.umd.min.js'),ctx,{filename:'chart.umd.min.js'});
  ctx.Chart.register({id:'qaLegend',afterUpdate(chart){
    if(chart.options.plugins.legend?.display)assert.equal(chart.legend.legendItems.length,chart.data.datasets.length);
  }});
  ctx.document.createElement=tag=>{
    if(tag==='canvas'){const cv=createCanvas(900,340);cv.style={};return cv;}
    return {style:{},appendChild(){},remove(){}};
  };
  ctx.document.body={appendChild(){}};
  ctx.docx=require(join(root,'vendor/docx.umd.min.js'));
  ctx.jspdf=require(join(root,'vendor/jspdf.umd.min.js'));
  require(join(root,'vendor/jspdf.plugin.autotable.min.js')).applyPlugin(ctx.jspdf.jsPDF);
  ctx.XLSX=require(join(root,'vendor/xlsx.full.min.js'));
  const c=documentaryCase();c.patient.name='Ejemplo ficticio de contraste';c.patient.document='DEMO-001';
  c.patient.applicationDate='2026-11-03';c.patient.age=46;
  c.patient.history='Historia documental ficticia de seguimiento, con evolución de las dificultades y apoyos disponibles.';
  c.patient.caseHistory='Cronología ficticia detallada. La aplicación anterior se documenta en mayo de 2026 y la actual en noviembre de 2026.';
  const compact=S.applyPreset(c,'base'),full=S.applyPreset(c,'extended');
  const demo=contextualPayload(full);
  const narratives={
    motivo:'Este ejemplo ficticio presenta una evaluación de seguimiento. Su objetivo es integrar el funcionamiento actual con la historia documentada y distinguir los cambios observados de las diferencias entre puntuaciones todavía pendientes de verificación.',
    antecedentes:'La cronología aportada sitúa una aplicación previa en mayo de 2026 y el registro actual en noviembre. Se dispone de cuatro puntuaciones T anteriores, pero faltan la confirmación del sexo normativo y la verificación de la misma clave y fuente de corrección. Esta información permite describir ambos registros con sus límites.',
    validez:'Los indicadores de validez describen aspectos diferentes de las respuestas. El valor actual de VRIN es compatible con respuestas coherentes; el registro anterior presenta una puntuación publicada mayor, cuya equivalencia normativa sigue pendiente de confirmar. La dirección V de TRIN identifica la orientación hacia respuestas Verdadero; su significado se interpreta junto con el conjunto del protocolo.',
    clinicas:'Las puntuaciones clínicas describen lo que la persona comunica sobre su funcionamiento actual. Su relación con las dificultades cotidianas requiere contrastar el autoinforme con los antecedentes, la entrevista y las fuentes disponibles. El perfil por sí solo no establece un diagnóstico ni una causa de los síntomas.',
    contenido:'Las escalas de contenido complementan la descripción de las dificultades autoinformadas. Su lectura se vincula con el motivo de consulta y con las situaciones de la historia que estén documentadas, sin atribuir a una puntuación aislada una conducta que no haya sido observada.',
    suplementarias:'Las escalas suplementarias y PSY-5 amplían la descripción del estilo personal y de los recursos percibidos. El resultado bajo de Es expresa una percepción reducida de los propios recursos frente al malestar; no permite concluir por sí solo que la persona carezca de habilidades o apoyos efectivos.',
    subescalas:'Las subescalas precisan qué componentes contribuyen a las puntuaciones principales. Su interpretación complementa las escalas de referencia y la información del caso, sin convertir cada componente en un diagnóstico independiente.',
    integracion:'La integración de este ejemplo distingue el estado actual documentado, la historia del seguimiento y las cuestiones pendientes. La comparación de los valores publicados orienta la revisión del expediente; la atribución de mejoría, empeoramiento o efectos de una intervención exige evidencia clínica adicional.',
    recursos:'Los recursos y fortalezas se describen a partir de conductas, apoyos y estrategias documentadas. En este ejemplo no se han aportado observaciones suficientes para identificar fortalezas específicas; una puntuación baja de Es no demuestra su ausencia.',
    contraste:'Entre las dos fechas se documentan diferencias en las puntuaciones publicadas de VRIN, TRIN, Fb y Mf. La gráfica recupera esos datos y conserva la dirección V del resultado actual de TRIN. Como la equivalencia normativa no está confirmada, estos valores no se convierten en diferencias T interpretables ni en una conclusión de cambio clínico.',
    recomendaciones:'La revisión clínica del seguimiento debe precisar las fechas de aplicación, recuperar la referencia normativa y la clave del registro anterior, y vincular los hallazgos con el funcionamiento cotidiano. La planificación terapéutica se fundamenta en las necesidades y apoyos confirmados en la entrevista.'
  };
  for(const section of demo.secciones){
    if(narratives[section.id])section.bloques[0].contenido=narratives[section.id];
    if(section.id==='conclusiones')section.bloques=[
      {tipo:'parrafo',contenido:'Este documento es una demostración con datos ficticios. Las puntuaciones, tablas y figuras se generan desde el registro local y el texto contextual se presenta una sola vez por sección.'},
      {tipo:'parrafo',contenido:'El contraste longitudinal muestra las cuatro puntuaciones previas disponibles junto a sus valores actuales. La falta de confirmación de las referencias anteriores mantiene pendiente la comparabilidad y excluye una conclusión automática de mejoría o deterioro.'},
      {tipo:'parrafo',contenido:'La lectura del funcionamiento y de los recursos de afrontamiento requiere integrar el autoinforme con la entrevista y las fuentes documentales. Los aspectos sin evidencia suficiente permanecen explícitamente pendientes.'}
    ];
  }
  const models=[['Informe_Base',R.build(compact,evaluator)],['Informe_Extendido',R.build(full,evaluator)],['Informe_IA',R.fromAI(demo,full,evaluator)]];
  for(const [name,model] of models){
    const images=R.chartImages(model),charts=model.blocks.filter(b=>b.t==='chart');
    assert.equal(Object.keys(images).length,charts.length);
    const comparison=charts.find(b=>b.sectionId==='contraste');assert(comparison&&images[comparison.num]);
    writeFileSync(join(out,name+'_comparativo.png'),Buffer.from(images[comparison.num].dataURL.split(',')[1],'base64'));
    const [word,pdf]=await Promise.all([ctx.ReportRender.toDocx(model,images),ctx.ReportRender.toPDF(model,images)]);
    writeFileSync(join(out,name+'.docx'),Buffer.from(await word.arrayBuffer()));
    writeFileSync(join(out,name+'.pdf'),Buffer.from(await pdf.arrayBuffer()));
    writeFileSync(join(out,name+'.html'),ctx.ReportRender.toStandaloneHTML(model,images));
    writeFileSync(join(out,name+'.txt'),R.toText(model));
    writeFileSync(join(out,name+'.json'),JSON.stringify(R.serialize(model),null,2));
    let excel;ctx.Export._download=blob=>{excel=blob;};ctx.Export.exportModelExcel(model,name+'.xlsx');
    writeFileSync(join(out,name+'.xlsx'),Buffer.from(await excel.arrayBuffer()));
    console.log(name+': '+model.sections.length+' secciones, '+charts.length+' figuras; gráfica comparativa incluida.');
  }
});

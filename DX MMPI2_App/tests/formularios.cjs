const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const test=require('node:test');
const {webcrypto,createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const out=process.env.MMPI2_FORMS_QA;
const memory=new Map(),nodes=new Map();
const data={__ITEMS__:json('data/items.json'),__BAREMOS_ES__:json('data/baremos.json'),__BAREMOS_US__:json('data/baremo_us.json'),
  __BAREMOS_MX__:json('data/baremo_mx.json'),__CRITERIOS__:json('data/criterios.json'),__VRIN_TRIN_PAIRS__:json('data/vrin_trin_pairs.json')};
const globals={...data,crypto:webcrypto,Uint8Array,ArrayBuffer,TextEncoder,TextDecoder,Blob,URL,Date,Intl,console,setTimeout,clearTimeout,
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
  atob,btoa,navigator:{},App:{navigate(){}},toast(){},addEventListener(){},scrollTo(){},
  document:{readyState:'loading',getElementById:id=>nodes.get(id)||null,dispatchEvent(){},addEventListener(){}},
  localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)},
  fetch:async name=>{const buffer=fs.readFileSync(path.join(root,name));return {ok:true,json:async()=>JSON.parse(buffer),arrayBuffer:async()=>buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength)};}
};
globals.window=globals;
const ctx=vm.createContext(globals);
vm.runInContext(read('vendor/pdf-lib.min.js'),ctx,{filename:'pdf-lib.min.js'});
for(const name of ['utils','report-sections','storage','license-catalog','license','mmpi2','export','interpret','critical','previous','report-model','formularios-pdf'])
  vm.runInContext(read('js/lib/'+name+'.js'),ctx,{filename:name+'.js'});
for(const name of ['case','capture','report'])vm.runInContext(read('js/screens/'+name+'.js'),ctx,{filename:name+'.js'});
const {FormulariosPDF:F,MMPI2:M,Storage:S,Case:C,Report:R,PDFLib}=ctx;
const plain=v=>JSON.parse(JSON.stringify(v));
const patient={name:'Caso ficticio de integración',document:'123456789',dob:'1990-04-23',age:36,sex:'M',country:'US',applicationDate:'2026-11-11',context:'Clínico',
  education:'Universitaria',yearsEducation:'17',occupation:'Docencia',maritalStatus:'Casado',address:'Dirección de prueba 123',referredBy:'Consulta de prueba',profileCode:'DEMO',graderInitials:'JA'};
const evaluator={name:'Profesional de prueba'};
let base,map;
const exported={};
async function save(name,result){
  if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name+'.pdf'),result.bytes);}
  exported[name]={filename:result.filename,marks:result.marks,points:result.points,pageIndex:result.pageIndex,warnings:result.warnings};
}
test.before(async()=>{
  await M.init();map=await F.config();
  const responses=Object.values(json('tests/respuestas-sinteticas.json'));
  base={id:'demo-formularios',patient,reportSchema:2,responses,results:await M.computeAll(responses,'M','US'),captureMode:'Excel'};
});
test.after(()=>{if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'verificacion-dibujos.json'),JSON.stringify(exported,null,2));}});

test('F01 · Las tres plantillas y las 1134 posiciones corresponden a sus archivos',async()=>{
  for(const [key,asset] of Object.entries(map.assets)){
    const bytes=await F.asset(key);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  }
  assert.equal(map.answers.items.length,567);
  assert.equal(new Set(map.answers.items.map(i=>i.num)).size,567);
  for(const item of map.answers.items)for(const side of ['V','F']){
    assert(item[side][0]>45&&item[side][0]<590);
    assert(item[side][1]>20&&item[side][1]<730);
  }
  // Cambios de bloque del original, comprobados contra la disposición de los números.
  assert(map.answers.items[80].V[1]<30); // 81 arriba
  assert(map.answers.items[79].V[1]>720); // 80 abajo
  assert(map.answers.items[95].V[1]>220); // 96 debajo del 95
  assert(map.answers.items[565].V[1]>600); // 566 en el último bloque de la última columna
  assert(map.answers.items[566].F[0]>578);
});

test('F02 · PDF real: todas V, todas F, omisiones y correcciones de respuestas',async()=>{
  for(const [side,value] of [['v',1],['f',2]]){
    const result=await F.answers({...base,responses:Array(567).fill(value)},evaluator);
    assert.equal(result.marks.length,567);
    assert(result.marks.every(m=>m.response===side.toUpperCase()));
    const pdf=await PDFLib.PDFDocument.load(result.bytes);
    assert.equal(pdf.getPageCount(),2);assert.equal(pdf.getPage(0).getWidth(),612);
    await save('respuestas-todas-'+side,result);
  }
  const responses=Array(567).fill(null);responses[0]=1;responses[80]=2;responses[566]=1;
  const first=await F.answers({...base,responses},evaluator);
  assert.deepEqual(Array.from(first.marks,m=>m.item),[1,81,567]);
  responses[0]=2;responses[80]=null;
  const corrected=await F.answers({...base,responses},evaluator);
  assert.equal(corrected.marks.length,2);
  assert.equal(corrected.marks[0].response,'F');
  assert(!corrected.marks.some(m=>m.item===81));
  const empty=await F.answers({...base,responses:Array(567).fill(null)},evaluator);
  assert.equal(empty.marks.length,0);
  await save('respuestas-parciales',first);
  const circle=await F.answers({...base,responses},evaluator,{mark:'circle'});
  await save('respuestas-circulos',circle);
});

test('F03 · Demostraciones H/M: perfil correspondiente al baremo y a la página',async()=>{
  await save('Hoja_Respuestas_Demo',await F.answers(base,evaluator));
  for(const country of ['US','MX'])for(const sex of ['H','M']){
    const c={...base,patient:{...patient,country,sex},results:await M.computeAll(base.responses,sex,country)};
    const result=await F.generate(country,c,evaluator);
    const pdf=await PDFLib.PDFDocument.load(result.bytes);
    assert.equal(pdf.getPageCount(),1);
    assert.equal(pdf.getPage(0).getWidth(),country==='US'?842:792);
    assert.equal(result.points.length,country==='US'?13:15);
    assert.equal(result.pageIndex,country==='MX'&&sex==='M'?1:0);
    for(const point of result.points)if(point.t!=null)assert.equal(point.t,c.results[point.code].t);
    await save('Perfil_'+country+'_'+sex+'_Demo',result);
  }
});

test('F04 · Escala geométrica T, datos pendientes, extremos y ausencia de T para omisiones',async()=>{
  const c=plain(base);
  c.results.L.t=50;c.results.F.t=65;c.results.K.t=120;c.results.D.t=null;c.results.Hs.t=24;
  const plan=F.profilePlan(c,map);
  assert.equal(plan.points.find(p=>p.code==='L').top,383.5);
  assert.equal(plan.points.find(p=>p.code==='F').top,337.8);
  assert.equal(plan.points.find(p=>p.code==='K').top,174.5);
  assert.equal(plan.points.find(p=>p.code==='Hs').top,458.5);
  assert.equal(plan.points.find(p=>p.code==='D').t,null);
  assert(!plan.points.some(p=>p.code==='?'));
  const result=await F.profile(c,evaluator);
  assert(result.warnings.some(w=>w.includes('D')));
  assert(result.warnings.some(w=>w.includes('24')));
  await save('perfil-pendiente-extremo',result);
  assert.equal(F.dateDigits('2000-02-29'),'02292000');
  assert.equal(F.dateDigits('2025-02-29'),'');
});

test('F05 · Interfaz, datos nuevos opcionales y conservación al guardar',()=>{
  for(const country of ['US','MX','ES']){
    const c={...base,patient:{...patient,country}};
    const a=F.availability(c),html=R._formsHTML(c);
    assert.equal(a.US,country==='US');assert.equal(a.MX,country==='MX');
    assert(html.includes('Formularios originales PDF'));
    assert(html.includes('X negra · trazo tipo lapicero'));
  }
  const old={...base,patient:{name:'Caso previo',sex:'M',country:'US'}};
  assert(C._pdfFieldsHTML(old.patient).includes('Datos para formularios PDF'));
  for(const [key] of F.FIELDS)nodes.set('p-form-'+key,{value:String(patient[key]??'')});
  for(const [key,id] of [['name','p-name'],['document','p-doc'],['dob','p-dob'],['sex','p-sex'],['country','p-country'],['applicationDate','p-appdate']])
    nodes.set(id,{value:patient[key]});
  const collected=C._collectPatient();
  for(const [key] of F.FIELDS)assert.equal(collected[key],String(patient[key]??''),key);
  S.saveCaseNow({...base,patient:collected});
  for(const [key] of F.FIELDS)assert.equal(S.getCase(base.id).patient[key],String(patient[key]??''));
  nodes.clear();
});

test('F06 · PDF ajeno al baremo rechazado y casos sin respuestas reconocidos',async()=>{
  await assert.rejects(()=>F.generate('MX',base,evaluator),/no corresponde al baremo/);
  await assert.rejects(()=>F.profile({...base,patient:{...patient,country:'ES'}},evaluator),/requiere baremo/);
  await assert.rejects(()=>F.profile({...base,results:null},evaluator),/Finalice/);
  assert.equal(F.availability({...base,responses:[]}).answers,false);
  assert.equal(F.availability({...base,results:null}).US,false);
  assert(F.availability({...base,patient:{...patient,sex:''}}).reason.includes('sexo normativo'));
});

test('F07 · Los PDF no modifican el caso, las puntuaciones ni el registro de licencia',async()=>{
  if(process.env.MMPI2_LICENCIAS){
    const inventory=JSON.parse(fs.readFileSync(process.env.MMPI2_LICENCIAS,'utf8').replace(/^\uFEFF/,''));
    await ctx.License.activate(inventory.plans[0].keys[0]);
  }
  const original=JSON.stringify(base),before=JSON.stringify([...memory.entries()]);
  await F.answers(base,evaluator);await F.profile(base,evaluator);
  assert.equal(JSON.stringify(base),original);
  assert.equal(JSON.stringify([...memory.entries()]),before);
});

test('F08 · Solo se cargan recursos locales y la vista previa permite descarga directa',()=>{
  const html=read('index.html');
  assert(html.includes('vendor/pdf-lib.min.js')&&html.includes('js/lib/formularios-pdf.js'));
  assert(html.includes("frame-src 'self' blob:"));
  assert(!/https?:\/\//.test(read('js/lib/formularios-pdf.js')));
  for(const file of ['js/screens/case.js','js/screens/capture.js','js/screens/report.js','js/lib/formularios-pdf.js'])
    new vm.Script(read(file),{filename:file});
  assert(read('js/screens/capture.js').includes('cap-form-preview'));
});

test('F09 · Vista previa: creación, enlace de descarga y cierre con los métodos reales',async()=>{
  const classList=(initial=[])=>{const values=new Set(initial);return {
    add:(...names)=>names.forEach(n=>values.add(n)),remove:(...names)=>names.forEach(n=>values.delete(n)),contains:n=>values.has(n)
  };};
  const content={innerHTML:'',classList:classList()},overlay={classList:classList(['hidden'])},handlers={};
  nodes.set('modal-content',content);nodes.set('modal-overlay',overlay);
  nodes.set('forms-preview-close',{addEventListener:(event,fn)=>{handlers[event]=fn;}});
  vm.runInContext(read('js/app.js').replace(/App\.init\(\);\s*$/,''),ctx,{filename:'app.js'});
  const result=await F.answers(base,evaluator);
  F.showPreview(result);
  assert(content.innerHTML.includes('<iframe'));
  assert(content.innerHTML.includes('download="'+result.filename+'"'));
  assert(content.classList.contains('forms-preview'));
  assert(!overlay.classList.contains('hidden'));
  assert(F._previewURL.startsWith('blob:'));
  handlers.click();
  assert.equal(F._previewURL,null);
  assert(overlay.classList.contains('hidden'));
  assert(!content.classList.contains('forms-preview'));
  nodes.clear();
});

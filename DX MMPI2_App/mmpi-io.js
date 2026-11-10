(function(root){
 'use strict';const A=root.MMPI2Audit,R=root.MMPI2Report,C=root.MMPI2Cases,S=root.MMPI2Sections;
 const xml=v=>A.escape(String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,''));
 const dec=new TextDecoder();
 const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const column=n=>{let v=n+1,s='';while(v){s=String.fromCharCode(65+(v-1)%26)+s;v=Math.floor((v-1)/26);}return s;};
 const X='http://schemas.openxmlformats.org/spreadsheetml/2006/main',O='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 const decl='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
 function worksheet(sheet){
  const rows=sheet.rows,widths=sheet.widths||Array(rows[0]?.length||2).fill(20),freeze=sheet.freeze??1;
  const rule=sheet.responseValidation===true?{range:'B2:B568',options:['1','2','3']}:sheet.responseValidation;
  const validation=rule?`<dataValidations count="1"><dataValidation type="list" errorStyle="stop" allowBlank="1" showDropDown="0" showInputMessage="1" showErrorMessage="1" promptTitle="Elija una respuesta" prompt="Seleccione Verdadero, Falso u Omitir en la lista." errorTitle="Respuesta inválida" error="Seleccione una opción de la lista desplegable." sqref="${xml(rule.range)}"><formula1>${xml('\"'+rule.options.join(',')+'\"')}</formula1></dataValidation></dataValidations>`:'';
  return decl+`<worksheet xmlns="${X}"><dimension ref="A1:${column(widths.length-1)}${Math.max(1,rows.length)}"/><sheetViews><sheetView workbookViewId="0">${freeze?`<pane ySplit="${freeze}" topLeftCell="A${freeze+1}" activePane="bottomLeft" state="frozen"/>`:''}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="20"/><cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.map((r,ri)=>{const height=ri===0?32:Math.min(390,Math.max(23,...r.map((v,ci)=>Math.ceil(String(v??'').length/Math.max(8,(widths[ci]||20)-3))*16+8)));return `<row r="${ri+1}" ht="${height}" customHeight="1">${r.map((v,ci)=>{const at=column(ci)+(ri+1),style=ri===0?1:(sheet.responseColumn===ci?3:(ri%2?0:2));return typeof v==='number'&&Number.isFinite(v)?`<c r="${at}" s="${style}"><v>${v}</v></c>`:`<c r="${at}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;}).join('')}</row>`;}).join('')}</sheetData>${sheet.filter?`<autoFilter ref="A1:${column(widths.length-1)}${rows.length}"/>`:''}${validation}<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" paperSize="1" fitToWidth="1" fitToHeight="0"/></worksheet>`;
 }
 function workbook(sheets,charts=[]){
  const files={},rel='http://schemas.openxmlformats.org/package/2006/relationships';
  const relationship=(id,type,target)=>`<Relationship Id="${id}" Type="${O}/${type}" Target="${target}"/>`;
  files['xl/workbook.xml']=decl+`<workbook xmlns="${X}" xmlns:r="${O}"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="s${i+1}"/>`).join('')}</sheets><calcPr calcId="191029"/></workbook>`;
  files['xl/_rels/workbook.xml.rels']=decl+`<Relationships xmlns="${rel}">${sheets.map((s,i)=>relationship('s'+(i+1),'worksheet','worksheets/sheet'+(i+1)+'.xml')).join('')}${relationship('styles','styles','styles.xml')}</Relationships>`;
  files['_rels/.rels']=decl+`<Relationships xmlns="${rel}">${relationship('document','officeDocument','xl/workbook.xml')}</Relationships>`;
  files['xl/styles.xml']=decl+`<styleSheet xmlns="${X}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/><color rgb="FF26364B"/></font><font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF193D54"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F7"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF7F2"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9D9D9"/></left><right style="thin"><color rgb="FFD9D9D9"/></right><top style="thin"><color rgb="FFD9D9D9"/></top><bottom style="thin"><color rgb="FFD9D9D9"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  sheets.forEach((s,i)=>files[`xl/worksheets/sheet${i+1}.xml`]=worksheet(s));
  if(charts.length){
   const sheetIndex=sheets.findIndex(s=>s.name==='Graficas')+1;
   const sheetPath=`xl/worksheets/sheet${sheetIndex}.xml`;
   files[sheetPath]=files[sheetPath].replace(`<worksheet xmlns="${X}">`,`<worksheet xmlns="${X}" xmlns:r="${O}">`).replace('</worksheet>','<drawing r:id="drawing1"/></worksheet>');
   files[`xl/worksheets/_rels/sheet${sheetIndex}.xml.rels`]=decl+`<Relationships xmlns="${rel}">${relationship('drawing1','drawing','../drawings/drawing1.xml')}</Relationships>`;
   files['xl/drawings/_rels/drawing1.xml.rels']=decl+`<Relationships xmlns="${rel}">${charts.map((c,i)=>relationship('chart'+(i+1),'chart','../charts/chart'+(i+1)+'.xml')).join('')}</Relationships>`;
   files['xl/drawings/drawing1.xml']=decl+`<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${O}">${charts.map((c,i)=>`<xdr:twoCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${i*20+2}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>13</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${i*20+20}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${i+1}" name="${xml(c.title)}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="chart${i+1}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`).join('')}</xdr:wsDr>`;
   charts.forEach((chart,i)=>{
    const cats=chart.rows.map((r,j)=>`<c:pt idx="${j}"><c:v>${xml(r.code)}</c:v></c:pt>`).join(''),values=chart.rows.map((r,j)=>r.T==null?'':`<c:pt idx="${j}"><c:v>${r.T}</c:v></c:pt>`).join('');
    const axis1=10000+i*2,axis2=axis1+1,maxT=Math.max(120,Math.ceil(Math.max(0,...chart.rows.map(r=>r.T||0))/10)*10),bars=chart.bar;
    const series=`<c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:v>Puntuaciones T</c:v></c:tx><c:spPr><a:solidFill><a:srgbClr val="285D73"/></a:solidFill><a:ln w="22000"><a:solidFill><a:srgbClr val="285D73"/></a:solidFill></a:ln></c:spPr>${bars?'':'<c:marker><c:symbol val="circle"/><c:size val="5"/></c:marker>'}<c:cat><c:strRef><c:f>'Datos de graficas'!$B$${chart.start}:$B$${chart.end}</c:f><c:strCache><c:ptCount val="${chart.rows.length}"/>${cats}</c:strCache></c:strRef></c:cat><c:val><c:numRef><c:f>'Datos de graficas'!$C$${chart.start}:$C$${chart.end}</c:f><c:numCache><c:formatCode>0</c:formatCode><c:ptCount val="${chart.rows.length}"/>${values}</c:numCache></c:numRef></c:val>${bars?'':'<c:smooth val="0"/>'}</c:ser>`;
    files[`xl/charts/chart${i+1}.xml`]=decl+`<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><c:lang val="es-CO"/><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="es-CO" sz="1400"/><a:t>${xml(chart.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:plotArea><c:layout/>${bars?`<c:barChart><c:barDir val="bar"/><c:grouping val="clustered"/>${series}<c:gapWidth val="70"/><c:axId val="${axis1}"/><c:axId val="${axis2}"/></c:barChart>`:`<c:lineChart><c:grouping val="standard"/>${series}<c:axId val="${axis1}"/><c:axId val="${axis2}"/></c:lineChart>`}<c:catAx><c:axId val="${axis1}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${bars?'l':'b'}"/><c:tickLblPos val="nextTo"/><c:crossAx val="${axis2}"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/></c:catAx><c:valAx><c:axId val="${axis2}"/><c:scaling><c:orientation val="minMax"/><c:max val="${maxT}"/><c:min val="0"/></c:scaling><c:delete val="0"/><c:axPos val="${bars?'b':'l'}"/><c:majorGridlines/><c:numFmt formatCode="0" sourceLinked="0"/><c:tickLblPos val="nextTo"/><c:crossAx val="${axis1}"/><c:crosses val="autoZero"/><c:crossBetween val="between"/><c:majorUnit val="20"/></c:valAx></c:plotArea><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`;
   });
  }
  files['[Content_Types].xml']=decl+`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}${charts.length?'<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>':''}${charts.map((c,i)=>`<Override PartName="/xl/charts/chart${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`).join('')}</Types>`;
  return R.zip(files);
 }
 function template(c,bank=root.MMPI2QuestionBank?.questions){
  if(!bank||Array.from({length:567},(_,i)=>i+1).some(i=>typeof bank[i]!=='string'||!bank[i].trim()))throw new Error('Se necesitan los 567 enunciados para preparar el cuestionario Excel. Revise Evaluador y ajustes.');
  const p=c?.patient||{};
  return workbook([
   {name:'Respuestas',rows:[['Ítem','Pregunta','Respuesta'],...Array.from({length:567},(_,i)=>[i+1,bank[i+1],''])],widths:[8,100,23],responseColumn:2,responseValidation:{range:'C2:C568',options:['Verdadero','Falso','Omitir']},filter:true},
   {name:'Identificacion',rows:[['MMPI-2 · Cuestionario del evaluado','Datos de esta aplicación'],['Nombre o código',p.fullName||'Sin asignar'],['Documento',p.docId||''],['Fecha de aplicación',p.applicationDate||''],['Número de aplicación',c?.applicationNumber||1]],widths:[38,90]},
   {name:'Instrucciones',rows:[['Cómo responder','Instrucciones'],['1. Leer','Lea cada pregunta de la hoja Respuestas.'],['2. Seleccionar','En la columna Respuesta, frente a cada pregunta, abra la lista y elija Verdadero o Falso según corresponda a su experiencia.'],['3. Omitir','Si decide no responder un ítem, seleccione Omitir. Dejar una celda vacía significa que está pendiente.'],['4. Conservar','No cambie los números ni el texto de las preguntas. Las respuestas están vacías al descargar este cuestionario.'],['5. Entregar','Guarde este archivo como .xlsx y devuélvalo al evaluador por el medio acordado. El archivo no envía datos automáticamente.'],['Uso profesional','Complete el cuestionario de acuerdo con las indicaciones del evaluador.']],widths:[27,108]}
  ]);
 }
 function exportReport(c,evaluator,model){
  const m=model||R.model(c,evaluator);
  c=m.caseData;
  const o=S.options(c),active=new Set(m.sections.map(section=>section.id)),notes=[['Apartado','Contenido']];
  const scoreBlocks=m.blocks.filter(block=>block.type==='table'&&block.group);
  const byCode=new Map(c.scores.map(score=>[score.code,score]));
  const scores=scoreBlocks.flatMap(block=>block.codes.map(code=>byCode.get(code)));
  const blocked=A.synthesis(c.scores).blocked||c.missing>0;
  let heading='Informe';
  for(const b of m.blocks){
   if(b.type==='heading'&&b.level<3)heading=b.text;
   else if(b.type==='paragraph')notes.push([heading,b.text]);
   else if(b.type==='list')b.items.forEach(t=>notes.push([heading,t]));
   else if(b.type==='table'&&!b.group){
    if(b.title==='Contenidos críticos agrupados por tema')notes.push([heading,'Ver hoja Criticos.']);
    else {
     notes.push([heading,b.title||b.headers.join(' | ')]);
     b.rows.forEach(row=>notes.push([heading,row.join(' | ')]));
    }
   }else if(b.type==='chart')notes.push([heading,b.caption]);
  }
  const sheets=[
   {name:'Informe',rows:notes,widths:[48,125]},
   {name:'Puntuaciones',rows:[
    ['Grupo','Escala','Nombre','PD','K añadida','PD+K','T numérica (límite si corresponde)','T publicada','Rango de T','Referencia normativa','Omisiones',...(o.descriptors?['Lectura breve']:[])],
    ...scores.map(s=>[A.data.labels[A.data.catalog[s.code]?.group||'validez'],s.code,s.description,s.raw??'',s.hasK?s.kAdded:'',
      s.hasK?s.rawK:'',s.T??'',s.t_display,R.tRange(s),s.norm_label,s.omitted??'',...(o.descriptors?[R.briefReading(s,blocked)]:[])])
   ],widths:[28,12,38,9,10,10,24,13,23,55,12,...(o.descriptors?[65]:[])],filter:true},
   {name:'Respuestas',rows:[['Ítem','Respuesta','Interpretación de respuesta'],...Array.from({length:567},(_,i)=>
    [i+1,c.responses[i+1]??'',({1:'Verdadero',2:'Falso',3:'Omisión'})[c.responses[i+1]]||'Pendiente'])],widths:[12,16,28],filter:true}
  ];
  if(o.psy5){
   const rows=[['Dimensión','Nombre','T publicada','Rango de T'],...scores.filter(s=>A.data.groups.restructuradas.includes(s.code))
    .map(s=>[s.code,s.description,s.t_display,R.tRange(s)])];
   if(o.clusters){
    rows.push([],['Área','Escalas de referencia','T máxima','Nivel descriptivo','Rasgos a explorar'],
     ...A.clusters(c.scores,c.patient.baremo).map(r=>[r.cluster,r.references,r.T??'',blocked?'Lectura suspendida':r.level,blocked?'':r.traits]),
     [],['Alcance','Correspondencia conceptual del manual. Requiere entrevista y contraste longitudinal.']);
   }
   sheets.push({name:o.clusters?'PSY5 y areas':'PSY5',rows,widths:o.clusters?[17,56,16,25,72]:[17,56,16,25]});
  }
  if(active.has('criticos')){
   const table=m.blocks.find(b=>b.type==='table'&&b.title==='Contenidos críticos agrupados por tema');
   sheets.push({name:'Criticos',rows:table?[table.headers,...table.rows]:[['Contenidos críticos'],['Sin coincidencias en las familias seleccionadas.']],
    widths:[10,12,90,...(o.criticalLiteral?[70]:[])],filter:Boolean(table)});
  }
  if(active.has('contraste')){
   sheets.push({name:'Comparacion',rows:[['Escala','T anterior','T actual','Diferencia T','Lectura descriptiva'],
    ...(c.comparisonData||[]).map(r=>[r.code,r.previous,r.current,r.delta??'',r.label]),[],['Alcance',c.comparisonNote]],
    widths:[15,17,17,17,90]});
  }
  sheets.push({name:'Historial',rows:[['Fecha de registro','Motivo','Versión del motor','Baremo','Informe previo conservado'],
   ...(c.previousReports||[]).map(r=>[r.recordedAt,r.reason||'Versión anterior',r.scoringVersion||'',r.patient?.baremo||r.baremo||'',
    r.aiContextualizedReport?'Sí, disponible en respaldo JSON':'No'])],widths:[28,58,32,15,48]});
  const charts=[];
  if(o.charts){
   const graphRows=[['Grupo','Escala','T numérica','T publicada']];
   for(const block of scoreBlocks){
    const rows=block.codes.filter(code=>code!=='?').map(code=>byCode.get(code));
    if(!rows.length)continue;
    const start=graphRows.length+1,title=A.data.labels[block.group];
    graphRows.push(...rows.map(r=>[title,r.code,r.T??'',r.t_display]));
    charts.push({title,rows,start,end:graphRows.length,bar:block.group==='restructuradas'});
   }
   sheets.push({name:'Datos de graficas',rows:graphRows,widths:[39,14,17,17],filter:true},
    {name:'Graficas',rows:[['Perfiles MMPI-2 en puntuaciones T']],widths:Array(14).fill(12)});
  }
  return workbook(sheets,charts);
 }
 async function unzip(bytes){
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
  for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(v.getUint32(p,true)===0x06054b50){end=p;break;}
  if(end<0)throw new Error('El archivo no es un .xlsx válido.');
  const count=v.getUint16(end+10,true);let at=v.getUint32(end+16,true),expandedTotal=0;const files={};
  if(count>1200)throw new Error('El Excel contiene demasiados recursos. Importe solo la hoja de respuestas.');
  for(let i=0;i<count;i++){
   if(at+46>bytes.length||v.getUint32(at,true)!==0x02014b50)throw new Error('El ZIP del Excel está incompleto.');
   const method=v.getUint16(at+10,true),size=v.getUint32(at+20,true),expanded=v.getUint32(at+24,true),nl=v.getUint16(at+28,true),xl=v.getUint16(at+30,true),cl=v.getUint16(at+32,true),local=v.getUint32(at+42,true),name=dec.decode(bytes.subarray(at+46,at+46+nl));at+=46+nl+xl+cl;
   if(!/^xl\/(?:workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/sheet\d+\.xml)$/.test(name))continue;
   expandedTotal+=expanded;if(expandedTotal>20000000||expanded>15000000)throw new Error('El Excel excede el tamaño de importación.');
   if(local+30>bytes.length)throw new Error('Archivo incompleto.');
   const start=local+30+v.getUint16(local+26,true)+v.getUint16(local+28,true);if(start+size>bytes.length)throw new Error('Archivo incompleto.');
   let data=bytes.subarray(start,start+size);
   if(method===8){if(!root.DecompressionStream)throw new Error('Use una versión reciente de Chrome, Edge o Safari para leer este Excel; también puede usar CSV.');const reader=new Response(data).body.pipeThrough(new DecompressionStream('deflate-raw')).getReader();const chunks=[];let total=0;for(;;){const result=await reader.read();if(result.done)break;total+=result.value.length;if(total>15000000){reader.cancel();throw new Error('Hoja de respuestas demasiado grande.');}chunks.push(result.value);}data=new Uint8Array(total);let pos=0;for(const chunk of chunks){data.set(chunk,pos);pos+=chunk.length;}}
   else if(method!==0)throw new Error('Compresión de Excel no compatible. Guarde como .xlsx o CSV.');files[name]=dec.decode(data);
  }
  return files;
 }
 function parseXML(text){const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw new Error('El Excel contiene XML inválido.');return doc;}
 async function excelRows(file){
  const files=await unzip(new Uint8Array(await file.arrayBuffer())),strings=files['xl/sharedStrings.xml']?[...parseXML(files['xl/sharedStrings.xml']).getElementsByTagName('si')].map(n=>[...n.getElementsByTagName('t')].map(t=>t.textContent).join('')):[];
  const book=parseXML(files['xl/workbook.xml']||''),rels=parseXML(files['xl/_rels/workbook.xml.rels']||'');
  return [...book.getElementsByTagName('sheet')].map(sheet=>{
   const rid=sheet.getAttributeNS(O,'id'),rel=[...rels.getElementsByTagName('Relationship')].find(r=>r.getAttribute('Id')===rid),target=rel?.getAttribute('Target');
   const path=target?.startsWith('/')?target.slice(1):'xl/'+target?.replace(/^\.\//,'');
   if(!files[path])throw new Error('No se encontró una hoja del archivo.');
   const rows=[...parseXML(files[path]).getElementsByTagName('row')].map(row=>{const values=[];for(const cell of row.getElementsByTagName('c')){const letters=(cell.getAttribute('r')||'').match(/^[A-Z]+/)?.[0];if(!letters)continue;let ci=0;for(const ch of letters)ci=ci*26+ch.charCodeAt(0)-64;ci--;let value=cell.getElementsByTagName('v')[0]?.textContent||'';const type=cell.getAttribute('t');if(type==='s')value=strings[+value]??'';if(type==='inlineStr')value=[...cell.getElementsByTagName('t')].map(t=>t.textContent).join('');if(cell.getElementsByTagName('f').length)value='Fórmula no admitida en respuestas';values[ci]=value;}return values;});
   return {name:sheet.getAttribute('name'),rows};
  });
 }
 function responseRows(rows){
  const h=rows.findIndex(row=>row.some(v=>/^(?:item|numero de item)$/.test(norm(v)))&&row.some(v=>/^respuesta(?:\s|$)/.test(norm(v))));
  if(h<0)return rows;
  const header=rows[h],paired=header.filter(v=>/^(?:item|numero de item)$/.test(norm(v))).length>1;
  if(paired)return rows.slice(h+1);
  const item=header.findIndex(v=>/^(?:item|numero de item)$/.test(norm(v))),answer=header.findIndex(v=>/^respuesta(?:\s|$)/.test(norm(v)));
  return rows.slice(h+1).map(row=>[row[item],row[answer]]);
 }
 async function readResponses(file){
  if(file.size>20000000)throw new Error('Importe una hoja de respuestas menor de 20 MB.');
  const ext=file.name.split('.').at(-1).toLowerCase();
  if(ext==='json'){
   const value=JSON.parse(await file.text()),r=value.responses||value;
   if(Array.isArray(r)){if(r.length!==567)throw new Error('La lista JSON debe tener 567 posiciones.');return C.parseResponseRows(r.map((v,i)=>[i+1,v]));}
   return C.parseResponseRows(Object.entries(r));
  }
  if(ext==='xlsx'){
   const sheets=await excelRows(file),sheet=sheets.find(s=>norm(s.name)==='respuestas')||sheets.find(s=>/respuesta/i.test(s.name));
   if(!sheet)throw new Error('No se encontró una hoja llamada Respuestas. Use la plantilla de esta app.');
   return C.parseResponseRows(responseRows(sheet.rows));
  }
  if(!['csv','tsv','txt'].includes(ext))throw new Error('Use .xlsx, CSV, TSV, TXT o JSON para importar respuestas.');
  return C.parseResponseRows(responseRows(C.parseCSV((await file.text()).replace(/^\uFEFF/,''))));
 }
 async function readBank(file){
  if(file.size>5000000)throw new Error('El cuestionario excede 5 MB.');
  const ext=file.name.split('.').at(-1).toLowerCase();
  if(ext==='json'){const value=JSON.parse(await file.text());return value.questions||value;}
  const sheets=ext==='xlsx'?await excelRows(file):['csv','tsv','txt'].includes(ext)?[{rows:C.parseCSV((await file.text()).replace(/^\uFEFF/,''))}]:[];
  for(const sheet of sheets){
   const h=sheet.rows.findIndex(row=>row.some(v=>norm(v)==='item')&&row.some(v=>/^(?:pregunta|enunciado|texto del item|texto)$/.test(norm(v))));
   if(h<0)continue;
   const header=sheet.rows[h],ic=header.findIndex(v=>norm(v)==='item'),qc=header.findIndex(v=>/^(?:pregunta|enunciado|texto del item|texto)$/.test(norm(v)));
   return sheet.rows.slice(h+1).filter(r=>/^\d+$/.test(String(r[ic]??''))).map(r=>({id:Number(r[ic]),text:String(r[qc]??'')}));
  }
  throw new Error('Use JSON con id/text o una hoja con columnas Ítem y Pregunta.');
 }
 function save(data,name,type){const blob=data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
 const filename=c=>(c?.patient?.fullName||'MMPI2').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,55)+'_'+(c?.patient?.applicationDate||'');
 root.MMPI2IO={workbook,template,exportReport,unzip,readResponses,readBank,save,filename};
})(globalThis);

/* Fuentes del informe explicativo. Lectura local de archivos; sin envío de datos. */
const LegalBriefSources={
  MAX_FILE:12*1024*1024,MAX_TEXT:180000,MAX_TOTAL:420000,MAX_SOURCES:10,
  ROLES:{base:'Informe base revisado',ia:'Informe IA revisado',externo:'Informe externo',otro:'Otro documento'},
  text(value){return String(value??'').replace(/\r\n?/g,'\n').replace(/\u0000/g,'').trim();},
  stable(value){
    if(Array.isArray(value))return '['+value.map(v=>this.stable(v)).join(',')+']';
    if(value&&typeof value==='object')return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+this.stable(value[k])).join(',')+'}';
    return JSON.stringify(value??null);
  },
  async hash(value){
    if(!window.crypto?.subtle)throw new Error('Abra la app en HTTPS o localhost para registrar las versiones de las fuentes.');
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof value==='string'?value:this.stable(value)));
    return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  },
  normalize(source){
    const text=this.text(source.text);
    if(!text)throw new Error('La fuente no contiene texto.');
    if(text.length>this.MAX_TEXT)throw new Error('La fuente supera '+this.MAX_TEXT.toLocaleString('es-CO')+' caracteres. Divídala en documentos o extractos identificados.');
    return {id:String(source.id||''),role:Object.hasOwn(this.ROLES,source.role)?source.role:'otro',
      title:this.text(source.title).slice(0,180)||'Documento',author:this.text(source.author).slice(0,180),
      date:this.text(source.date).slice(0,40),fileName:this.text(source.fileName).slice(0,200),
      text,spans:Array.isArray(source.spans)?source.spans.filter(s=>Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.end<=text.length&&s.end>s.start&&Number.isInteger(s.page)&&s.page>0).map(s=>({start:s.start,end:s.end,page:s.page})):[],
      included:source.included!==false,reviewed:source.reviewed===true};
  },
  validateSources(sources,reviewed=false){
    if(!Array.isArray(sources)||sources.length>this.MAX_SOURCES)throw new Error('Se admiten hasta '+this.MAX_SOURCES+' fuentes por caso.');
    const ids=new Set();let total=0;
    for(const raw of sources){
      const s=this.normalize(raw);
      if(!/^F\d{3}$/.test(s.id)||ids.has(s.id))throw new Error('Identificadores de fuente inválidos o repetidos.');
      ids.add(s.id);total+=s.text.length;
      if(reviewed&&s.included&&!s.reviewed)throw new Error('Revise y marque el texto de «'+s.title+'» antes de preparar el prompt.');
    }
    if(total>this.MAX_TOTAL)throw new Error('El conjunto de fuentes supera el tamaño admitido. Seleccione extractos pertinentes o divida el encargo.');
  },
  nextId(sources){return 'F'+String(Math.max(0,...sources.map(s=>Number(String(s.id).slice(1))||0))+1).padStart(3,'0');},
  _xmlText(node){
    if(node.nodeType===3)return '';
    if(node.localName==='t')return node.textContent||'';
    if(node.localName==='tab')return '\t';
    if(['br','cr'].includes(node.localName))return '\n';
    return Array.from(node.childNodes||[]).map(n=>this._xmlText(n)).join('');
  },
  _zipCheck(buffer){
    const view=new DataView(buffer);let end=-1;
    for(let i=view.byteLength-22;i>=Math.max(0,view.byteLength-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
    if(end<0)throw new Error('El archivo Word no contiene un DOCX válido.');
    const count=view.getUint16(end+10,true);let offset=view.getUint32(end+16,true),total=0;
    if(count>3000||count===65535)throw new Error('El Word contiene demasiados componentes. Guarde una copia simplificada.');
    for(let n=0;n<count;n++){
      if(offset+46>view.byteLength||view.getUint32(offset,true)!==0x02014b50)throw new Error('La estructura del DOCX está dañada.');
      if(view.getUint16(offset+8,true)&1)throw new Error('El Word está cifrado; guarde una copia sin contraseña.');
      const size=view.getUint32(offset+24,true);total+=size;
      if(size>16*1024*1024||total>48*1024*1024)throw new Error('El Word descomprimido supera el tamaño admitido. Guarde una copia con el texto pertinente.');
      offset+=46+view.getUint16(offset+28,true)+view.getUint16(offset+30,true)+view.getUint16(offset+32,true);
    }
  },
  docx(buffer){
    this._zipCheck(buffer);
    if(!window.XLSX?.CFB)throw new Error('No se cargó el lector de Word. Recargue la app.');
    const zip=XLSX.CFB.read(new Uint8Array(buffer),{type:'array'});
    const index=zip.FullPaths.findIndex(path=>path.endsWith('/word/document.xml'));
    if(index<0)throw new Error('El archivo no contiene el documento principal de Word.');
    const entry=zip.FileIndex[index];
    if(!entry?.content||entry.content.length>6*1024*1024)throw new Error('El texto del Word supera el tamaño admitido.');
    const xml=new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(entry.content));
    if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new Error('El Word contiene declaraciones XML no admitidas.');
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.getElementsByTagName('parsererror').length)throw new Error('El texto XML del Word está dañado.');
    const body=doc.getElementsByTagNameNS('*','body')[0];
    if(!body)throw new Error('El Word no contiene texto legible.');
    const parts=[];let table=0;
    for(const node of Array.from(body.childNodes)){
      if(node.localName==='p'){const text=this._xmlText(node).trim();if(text)parts.push(text);}
      if(node.localName==='tbl'){
        table++;const rows=Array.from(node.childNodes).filter(n=>n.localName==='tr');let headers=[];
        rows.forEach((row,i)=>{
          const cells=Array.from(row.childNodes).filter(n=>n.localName==='tc').map(cell=>Array.from(cell.getElementsByTagNameNS('*','p')).map(p=>this._xmlText(p).trim()).filter(Boolean).join(' / '));
          if(!cells.length)return;
          if(i===0){headers=cells;parts.push('Tabla '+table+' · '+cells.join(' | '));}
          else parts.push('Tabla '+table+' · '+cells.map((value,k)=>(headers[k]||'Columna '+(k+1))+': '+value).join(' | '));
        });
      }
    }
    return {text:parts.join('\n\n'),spans:[],notice:'Referencias por párrafo y fila de tabla; Word no ofrece paginación estable al extraer el texto.'};
  },
  async _pdfLibrary(){
    if(window.pdfjsLib)return window.pdfjsLib;
    const lib=await import('../../vendor/pdfjs/pdf.mjs');
    lib.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.mjs',document.baseURI).href;
    return lib;
  },
  async pdf(buffer){
    const lib=await this._pdfLibrary();
    const base=new URL('vendor/pdfjs/',document.baseURI).href;
    const loading=lib.getDocument({data:new Uint8Array(buffer),isEvalSupported:false,disableFontFace:true,
      cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/',useWorkerFetch:true});
    let pdf;
    try{
      pdf=await loading.promise;
      if(pdf.numPages>180)throw new Error('El PDF supera 180 páginas. Aporte los apartados pertinentes en un archivo separado.');
      let text='';const spans=[],emptyPages=[];
      for(let page=1;page<=pdf.numPages;page++){
        const content=await (await pdf.getPage(page)).getTextContent();let lines='',line='';
        for(const item of content.items){
          if(!('str' in item))continue;
          line+=(line?' ':'')+item.str;
          if(item.hasEOL){lines+=line.trim()+'\n';line='';}
        }
        if(line.trim())lines+=line.trim();
        const value=lines.trim();if(!value){emptyPages.push(page);continue;}
        if(text)text+='\n\n';const start=text.length;text+=value;spans.push({start,end:text.length,page});
        if(text.length>this.MAX_TEXT)throw new Error('El texto del PDF supera el tamaño admitido. Aporte un extracto identificado.');
      }
      if(text.replace(/\s/g,'').length<30)throw new Error('No se encontró texto suficiente. El PDF puede ser una imagen: aplique OCR fuera de la app o pegue una transcripción revisada.');
      return {text,spans,notice:'Texto extraído del PDF con referencias de página. Revise orden de lectura, tablas y signos antes de aprobarlo.'+
        (emptyPages.length?' No se extrajo texto de las páginas '+emptyPages.join(', ')+'. Compruebe si requieren OCR.':'')};
    }catch(error){
      if(error?.name==='PasswordException')throw new Error('El PDF requiere contraseña. Aporte una copia de lectura accesible.');
      throw error;
    }finally{try{if(pdf)await pdf.destroy();else await loading.destroy();}catch{}}
  },
  async importFile(file){
    if(!file||file.size>this.MAX_FILE)throw new Error('Se admiten archivos de hasta 12 MB.');
    const buffer=await file.arrayBuffer(),ext=file.name.toLowerCase().split('.').pop();let result;
    if(ext==='docx')result=this.docx(buffer);
    else if(ext==='pdf')result=await this.pdf(buffer);
    else if(['txt','md'].includes(ext))result={text:new TextDecoder('utf-8',{fatal:true}).decode(buffer),spans:[],notice:'Texto UTF-8; referencias por fragmento.'};
    else throw new Error('Seleccione un Word .docx, un PDF con texto o un archivo .txt/.md UTF-8.');
    result.text=this.text(result.text);
    if(!result.text)throw new Error('No se encontró texto en el archivo.');
    if(result.text.length>this.MAX_TEXT)throw new Error('La fuente supera el tamaño admitido. Divídala en extractos identificados.');
    return {...result,fileName:file.name};
  },
  _chunks(text,max=1500){
    const out=[];
    for(const paragraph of this.text(text).split(/\n\s*\n/)){
      let rest=paragraph.trim();
      while(rest.length>max){let at=rest.lastIndexOf(' ',max);if(at<max/2)at=max;out.push(rest.slice(0,at).trim());rest=rest.slice(at).trim();}
      if(rest)out.push(rest);
    }
    return out;
  },
  fragments(source){
    const out=[];let number=0;
    const spans=source.spans?.length?source.spans:[{start:0,end:source.text.length,page:null}];
    for(const span of spans)for(const text of this._chunks(source.text.slice(span.start,span.end))){
      number++;out.push({id:source.id+'-P'+String(number).padStart(4,'0'),sourceId:source.id,text,page:span.page,
        locator:span.page?'p. '+span.page+', fragmento '+number:'fragmento '+number});
    }
    return out;
  },
  currentSource(c){
    const p=c.patient||{},o=ReportSections.options(ReportSections.aiCase(c));
    const lines=['Registro local del MMPI-2. Fecha de aplicación: '+(p.applicationDate||'No consta')+'. Referencia: '+ReportModel.COUNTRY_LABEL[ReportModel.country(c)]+'. Sexo normativo: '+(p.sex==='M'?'Mujer':p.sex==='H'?'Hombre':'No consta')+'.'];
    lines.push('Validez del protocolo: '+Interpret.verdict(c.results||{}).label+'.');
    for(const [label,key,enabled] of [['Motivo','reason',o.info_reason],['Antecedentes','history',o.info_history],['Historia','caseHistory',o.info_caseHistory],['Fuentes clínicas','sources',true],['Examen mental','mentalExam',o.sec_exam],['Recursos','strengths',o.sec_strengths],['Integración documentada','integration',true],['Limitaciones','limitations',o.sec_limits]])
      if(enabled)lines.push(label+': '+(this.text(p[key])||'No consta')+'.');
    if(o.info_request_context)lines.push('Contexto de la solicitud: '+ReportSections.context(p));
    for(const group of ReportModel.groups(o))for(const code of Interpret.GROUP_ORDER[group]||[]){
      if(!c.results?.[code])continue;const r=ReportModel.score(c,code);
      lines.push(code+' ('+Interpret.name(code)+') · PD='+ (r.pd??'—')+'; '+(r.pdk?'PD+K='+(r.pdK??'—')+'; ':'')+'T='+r.published+'; rango='+ReportModel.levelLabel(r.t,r.bound)+'.');
    }
    const prior=ReportSections.prior(c);
    if(o.sec_compare&&prior.rows.length){
      lines.push('Antecedente MMPI-2: fecha '+(prior.meta.date||'No consta')+'; fuente '+(prior.meta.source||'No consta')+'.');
      for(const row of prior.rows)lines.push('Contraste '+row.code+': anterior '+row.previous+'; actual '+ReportModel.score(c,row.code).published+'; diferencia aritmética '+Previous.signedDelta(row.delta)+'; comparabilidad normativa confirmada: '+(row.comparable?'sí':'no')+'.');
      lines.push(...prior.notes);
    }
    return {id:'CASO',role:'registro',title:'Registro local del caso',author:'Registro de la aplicación',date:p.applicationDate||'',text:lines.join('\n\n'),spans:[],included:true,reviewed:true};
  },
  redactor(c,state,evaluator={},local=false){
    const protect=value=>ReportModel._withoutLiterals(String(value??''));
    const p=c.patient||{},policy=ReportSections.options(c),anonymize=!local&&state.request?.includeIdentity!==true;
    const hideDOB=!policy.id_dob||anonymize;
    const values=[...(anonymize?[p.name,p.document,p.email,p.phone,p.address,evaluator.name,evaluator.email,evaluator.phone,evaluator.address]:[]),
      ...(!policy.id_document?[p.document]:[]),...(hideDOB?[p.dob,p.dob?.split('-').reverse().join('/'),p.dob?ReportModel._fmtDate(p.dob):'']:[]),
      ...(!local?(state.request?.additionalIdentifiers||'').split(/\n/):[])].filter(v=>typeof v==='string'&&v.trim().length>=3).sort((a,b)=>b.length-a.length);
    return value=>{
      let text=protect(value);
      for(const item of values)text=text.replace(new RegExp(item.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'giu'),'[Reservado]');
      return text;
    };
  },
  async prepare(c,state,{requireReviewed=false,evaluator=Storage.getEvaluator()||{}}={}){
    state=JSON.parse(JSON.stringify(state));c=JSON.parse(JSON.stringify(c));
    this.validateSources(state.sources||[],requireReviewed);
    const chosen=(state.sources||[]).filter(s=>s.included!==false).map(s=>this.normalize(s));
    const raw=[this.currentSource(c),...chosen],clean=this.redactor(c,state,evaluator),localClean=this.redactor(c,state,evaluator,true),fragments=[],manifest=[],localManifest=[];
    for(const source of raw){
      const hash=await this.hash(source);
      manifest.push({id:source.id,role:source.role,title:clean(source.title),author:clean(source.author),date:source.date,fileName:clean(source.fileName||''),hash,reviewed:source.reviewed});
      localManifest.push({id:source.id,role:source.role,title:localClean(source.title),author:localClean(source.author),date:source.date,fileName:localClean(source.fileName||''),hash,reviewed:source.reviewed});
      fragments.push(...this.fragments(source).map(f=>({...f,text:clean(f.text)})));
    }
    const {recipient,...contentRequest}=state.request||{};
    const {appendix,...contentOptions}=state.options||{};
    const privacyContext=state.request?.includeIdentity?null:{name:evaluator.name,email:evaluator.email,phone:evaluator.phone,address:evaluator.address};
    const policy=ReportSections.options(c);
    const fingerprint=await this.hash({caseId:c.id,caseIdentity:c.patient,results:c.results,request:contentRequest,options:contentOptions,sources:raw,privacyContext,idPolicy:{document:policy.id_document,dob:policy.id_dob}});
    return {fingerprint,manifest,localManifest,fragments,byRef:new Map(fragments.map(f=>[f.id,f])),bySource:new Map(manifest.map(s=>[s.id,s])),
      question:clean(state.request?.question||''),purpose:clean(state.request?.purpose||''),notes:clean(state.request?.notes||''),
      options:{...state.options},reviewerStamp:await this.hash(evaluator),externalCount:chosen.filter(s=>s.role==='externo').length};
  }
};
window.LegalBriefSources=LegalBriefSources;

/* Formularios PDF: transcripción del registro local, sin cálculo psicométrico. */
const FormulariosPDF = {
  VERSION:'17.5',
  _configPromise:null,_assets:new Map(),_previewURL:null,
  FIELDS:[
    ['education','Escolaridad'],['yearsEducation','Años de educación'],['occupation','Ocupación'],
    ['maritalStatus','Estado civil'],['address','Dirección'],['referredBy','Referido por'],
    ['profileCode','Clave de perfil (opcional)'],['graderInitials','Iniciales del calificador (opcional)'],
    ['formIdentifier','Identificador para la hoja (opcional)']
  ],

  async config(){
    if(!this._configPromise)this._configPromise=fetch('assets/formularios/coordenadas.json')
      .then(r=>{if(!r.ok)throw new Error('No se pudo abrir el mapa de los formularios.');return r.json();})
      .catch(error=>{this._configPromise=null;throw error;});
    return this._configPromise;
  },

  async asset(key){
    const map=await this.config(),asset=map.assets[key];
    if(!asset)throw new Error('Plantilla PDF desconocida.');
    if(!this._assets.has(key))this._assets.set(key,(async()=>{
      const response=await fetch(asset.path);
      if(!response.ok)throw new Error('No se pudo abrir la plantilla PDF.');
      const bytes=new Uint8Array(await response.arrayBuffer());
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      if(hash!==asset.sha256)throw new Error('La plantilla no coincide con su mapa. Vuelva a instalar los archivos de esta versión.');
      return bytes;
    })().catch(error=>{this._assets.delete(key);throw error;}));
    return this._assets.get(key);
  },

  availability(c){
    const country=c?.patient?.country,sex=c?.patient?.sex;
    const validSex=['H','M'].includes(sex),hasResults=Boolean(c?.results);
    return {answers:Array.isArray(c?.responses)&&c.responses.some(r=>r===1||r===2),
      US:country==='US'&&validSex&&hasResults,MX:country==='MX'&&validSex&&hasResults,
      country,reason:!validSex?'Complete el sexo normativo del caso.':!hasResults?'Finalice y procese las respuestas para generar el perfil.':
        country==='ES'?'Las plantillas disponibles corresponden a Estados Unidos y México. El perfil general actual sigue disponible.':''};
  },

  _text(page,font,value,field,{center=false}={}){
    if(value==null||String(value).trim()==='')return;
    const [x,top,width,initialSize=9]=field;
    const text=String(value).normalize('NFC').replace(/[\r\n\t]+/g,' ').replace(/≤/g,'<=').replace(/≥/g,'>=');
    let size=initialSize;
    const measured=font.widthOfTextAtSize(text,size);
    if(measured>width)size*=width/measured;
    page.drawText(text,{x:center?x-font.widthOfTextAtSize(text,size)/2:x,
      y:page.getHeight()-top-size,size,font,color:PDFLib.rgb(0,0,0)});
  },

  _mark(page,point,style='pen',seed=0){
    const [x,top]=point,y=page.getHeight()-top;
    if(style==='circle'){
      page.drawCircle({x,y,size:2.6,color:PDFLib.rgb(0,0,0)});return;
    }
    // El centro permanece en la coordenada calibrada; solo varía el trazo.
    const a=2.3+(seed%3)*0.08,b=2.1+(seed%5)*0.04;
    const opt={color:PDFLib.rgb(0,0,0),thickness:.72,lineCap:PDFLib.LineCapStyle.Round};
    page.drawLine({start:{x:x-a,y:y-b},end:{x:x+a,y:y+b},...opt});
    page.drawLine({start:{x:x-a+.18,y:y+b+.05},end:{x:x+a-.1,y:y-b+.15},...opt});
  },

  _digits(page,font,digits,grid,style,warnings,label){
    if(!digits)return;
    if(!/^\d+$/.test(digits)||digits.length>grid.xs.length){
      this._text(page,font,digits,[grid.xs[0]-5,grid.digitTop,grid.xs.at(-1)-grid.xs[0]+11,9]);
      warnings.push(label+': valor impreso completo, sin codificación de círculos.');return;
    }
    [...digits].forEach((digit,i)=>{
      this._text(page,font,digit,[grid.xs[i],grid.digitTop,10,10],{center:true});
      this._mark(page,[grid.xs[i],grid.zeroTop+Number(digit)*grid.step],style,i+Number(digit));
    });
  },

  dateDigits(value){
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');
    if(!m)return '';
    const d=new Date(value+'T12:00:00Z');
    return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value?m[2]+m[3]+m[1]:'';
  },

  _date(value){return this.dateDigits(value)?value.slice(8,10)+'/'+value.slice(5,7)+'/'+value.slice(0,4):'';},
  _initials(name){return String(name||'').trim().split(/\s+/).map(word=>word[0]||'').join('').toUpperCase();},
  _filename(label,c){return label+'_'+Export._safeName(c.patient?.name||'Caso')+'.pdf';},

  _metadata(doc,title,c){
    doc.setTitle(title+' · '+(c.patient?.name||''));
    doc.setAuthor('');doc.setCreator('MMPI-2 Suite clínica '+this.VERSION);
    doc.setSubject('Documento diligenciado digitalmente desde el registro local. Modalidad: '+(c.captureMode||'No documentada')+'. Baremo: '+(c.patient?.country||''));
    doc.setKeywords(['MMPI-2','transcripción digital',c.patient?.country||'']);
    doc.setCreationDate(new Date());doc.setModificationDate(new Date());
    doc.catalog.set(PDFLib.PDFName.of('ViewerPreferences'),doc.context.obj({PrintScaling:'None'}));
  },

  async answers(c,evaluator={},options={}){
    if(!c?.patient)throw new Error('Abra un caso para diligenciar la hoja de respuestas.');
    if(!window.PDFLib)throw new Error('El módulo de formularios PDF no se cargó. Recargue la aplicación.');
    const map=await this.config(),cfg=map.answers,p=c.patient,o=ReportModel.options(c);
    const doc=await PDFLib.PDFDocument.load(await this.asset('answers'));
    if(doc.getPageCount()!==2||doc.getPage(0).getWidth()!==cfg.width||doc.getPage(1).getHeight()!==cfg.height)
      throw new Error('Las dimensiones de la hoja no coinciden con su calibración.');
    const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica),pages=doc.getPages(),warnings=[];
    const style=options.mark||c.formOptions?.mark||'pen';
    for(const [key,field] of Object.entries(cfg.front.fields))this._text(pages[0],font,p[key],field);
    const rawIdentifier=String(p.formIdentifier||p.document||'').trim();
    const normalized=rawIdentifier.replace(/[.\s-]/g,'');
    if(o.id_document)this._digits(pages[0],font,/^\d+$/.test(normalized)?normalized:rawIdentifier,cfg.front.id,style,warnings,'Identificación');
    if(o.id_dob)this._digits(pages[0],font,this.dateDigits(p.dob),cfg.front.dob,style,warnings,'Nacimiento');
    this._digits(pages[0],font,this.dateDigits(p.applicationDate),cfg.front.applicationDate,style,warnings,'Aplicación');
    if(p.yearsEducation!==''&&p.yearsEducation!=null)this._digits(pages[0],font,String(p.yearsEducation),cfg.front.yearsEducation,style,warnings,'Años de educación');
    if(cfg.front.sex[p.sex])this._mark(pages[0],cfg.front.sex[p.sex],style,1);
    if(cfg.front.maritalStatus[p.maritalStatus])this._mark(pages[0],cfg.front.maritalStatus[p.maritalStatus],style,2);
    const marks=[];
    for(const item of cfg.items){
      const value=c.responses?.[item.num-1],side=value===1?'V':value===2?'F':null;
      if(!side)continue;
      this._mark(pages[1],item[side],style,item.num);
      marks.push({item:item.num,response:side,x:item[side][0],top:item[side][1],page:1});
    }
    this._metadata(doc,'Hoja de respuestas MMPI-2',c);
    return {bytes:await doc.save(),filename:this._filename('MMPI2_Hoja_Respuestas',c),
      title:'Hoja de respuestas diligenciada',summary:marks.length+' de 567 respuestas registradas. '+(567-marks.length)+' espacios sin respuesta.',warnings,marks};
  },

  yForT(value,cfg){
    const anchors=cfg.anchors;
    const t=Math.max(anchors[0][0],Math.min(anchors.at(-1)[0],value));
    for(let i=1;i<anchors.length;i++)if(t<=anchors[i][0]){
      const [a,ya]=anchors[i-1],[b,yb]=anchors[i];
      return ya+(yb-ya)*(t-a)/(b-a);
    }
    return anchors.at(-1)[1];
  },

  profilePlan(c,map){
    const country=c?.patient?.country,sex=c?.patient?.sex;
    if(!['US','MX'].includes(country))throw new Error('Esta lámina requiere baremo estadounidense o mexicano. El perfil general actual sigue disponible.');
    if(!['H','M'].includes(sex))throw new Error('Complete el sexo normativo del caso.');
    if(!c.results)throw new Error('Finalice y procese el caso para obtener el perfil.');
    const profile=map.profiles[country],cfg=profile.pages[sex],points=[],pending=[];
    for(const column of cfg.columns){
      const score=ReportModel.score(c,column.code);
      if(score.t==null){pending.push(column.code);points.push({...column,t:null});continue;}
      points.push({...column,t:score.t,published:score.published,pd:score.pd,pdK:score.pdK,pdk:score.pdk,
        verify:score.verify,bound:score.bound,top:this.yForT(score.t,cfg),
        clipped:score.t<profile.minT||score.t>profile.maxT});
    }
    return {country,sex,profile,cfg,points,pending};
  },

  _profileHeader(page,font,c,evaluator,fields){
    const p=c.patient,values={...p,applicationDate:this._date(p.applicationDate),
      graderInitials:p.graderInitials||this._initials(evaluator.name)};
    for(const [key,field] of Object.entries(fields))this._text(page,font,values[key],field);
  },

  _usCorrections(page,font,c){
    const height=page.getHeight(),white=PDFLib.rgb(1,1,1);
    page.drawRectangle({x:30,y:height-125,width:305,height:56,color:white});
    const lines=['Perfil de validez y escalas clínicas básicas','Referencia normativa: Estados Unidos (Minnesota)',
      'Puntuaciones T tomadas del registro de la aplicación','Lámina adaptada para uso documental',
      'Ítems sin respuesta (?): '+(c.responses?.filter(r=>r!==1&&r!==2).length??c.results?._meta?.omissions??'No consta')];
    lines.forEach((line,i)=>this._text(page,font,line,[35,72+i*10,295,8]));
    // El escaneo omitía el rótulo 30: se recuperan 35, 30 y 25 con la separación del eje original.
    for(const x of [58,766]){
      page.drawRectangle({x,y:height-469,width:25,height:48,color:white});
      for(const [label,top] of [['35',422],['30',437],['25',452]])this._text(page,font,label,[x+2,top,23,9.5]);
    }
  },

  async profile(c,evaluator={},options={}){
    if(!window.PDFLib)throw new Error('El módulo de formularios PDF no se cargó.');
    const map=await this.config(),plan=this.profilePlan(c,map),{country,profile,cfg,points,pending}=plan;
    const source=await PDFLib.PDFDocument.load(await this.asset(country));
    const original=source.getPage(cfg.page);
    if(original.getWidth()!==cfg.width||original.getHeight()!==cfg.height)throw new Error('El perfil no coincide con su calibración.');
    const doc=await PDFLib.PDFDocument.create(),[page]=await doc.copyPages(source,[cfg.page]);doc.addPage(page);
    const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica),height=page.getHeight(),warnings=[];
    const style=options.mark||c.formOptions?.mark||'pen';
    if(country==='US')this._usCorrections(page,font,c);
    this._profileHeader(page,font,c,evaluator,profile.fields);
    let previous=null;
    for(const [index,point] of points.entries()){
      const score=ReportModel.score(c,point.code);
      this._text(page,font,score.pd??'',[point.x,profile.rowPD,30,8.5],{center:true});
      if(profile.rowPDK!=null&&score.pdk)this._text(page,font,score.pdK??'',[point.x,profile.rowPDK,30,8],{center:true});
      if(profile.rowT!=null)this._text(page,font,score.published,[point.x,profile.rowT,34,8],{center:true});
      if(point.t==null){previous=null;continue;}
      if(previous&&previous.group===point.group)page.drawLine({start:{x:previous.x,y:height-previous.top},end:{x:point.x,y:height-point.top},
        thickness:.72,color:PDFLib.rgb(0,0,0),lineCap:PDFLib.LineCapStyle.Round});
      this._mark(page,[point.x,point.top],style,index);
      this._text(page,font,point.published,[point.x+4,point.top-(index%2?0:12),28,6.3]);
      if(point.clipped)warnings.push(point.code+': T '+point.published+'; marcador en el límite del gráfico.');
      previous=point;
    }
    if(pending.length)warnings.push('T pendiente: '+pending.join(', ')+'.');
    if(points.some(p=>p.verify))warnings.push('* Puntuación a verificar en la fuente normativa.');
    if(Interpret.verdict(c.results).status==='NO_INTERPRETABLE')warnings.push('Protocolo no interpretable: lámina para revisión técnica.');
    const note='Baremo '+(country==='US'?'estadounidense':'mexicano')+' · Sexo normativo: '+(c.patient.sex==='M'?'mujer':'hombre')+' · Diligenciado digitalmente.';
    const footer=country==='US'?577:591;
    this._text(page,font,note,[28,footer,cfg.width-56,6.3]);
    if(warnings.length)this._text(page,font,warnings.join(' '),[28,footer+8,cfg.width-56,6.3]);
    this._metadata(doc,'Perfil '+(country==='US'?'estadounidense':'mexicano')+' MMPI-2',c);
    return {bytes:await doc.save(),filename:this._filename('MMPI2_Perfil_'+country,c),
      title:country==='US'?'Perfil estadounidense · validez y escalas clínicas':'Perfil mexicano · escalas de contenido',
      summary:points.filter(p=>p.t!=null).length+' puntuaciones trazadas. Sexo normativo: '+(c.patient.sex==='M'?'mujer':'hombre')+'.',warnings,points,pageIndex:cfg.page};
  },

  async generate(kind,c,evaluator={},options={}){
    if(kind==='answers')return this.answers(c,evaluator,options);
    if(!['US','MX'].includes(kind)||c.patient?.country!==kind)throw new Error('El perfil solicitado no corresponde al baremo seleccionado.');
    return this.profile(c,evaluator,options);
  },

  closePreview(){if(this._previewURL){URL.revokeObjectURL(this._previewURL);this._previewURL=null;}},

  showPreview(result){
    this.closePreview();
    const blob=new Blob([result.bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob);
    this._previewURL=url;
    const esc=window.escHTML;
    window.showModal('<div class="modal-header"><h3 id="modal-title">'+esc(result.title)+'</h3><button class="btn btn-ghost" id="forms-preview-close" aria-label="Cerrar">✕</button></div>'+
      '<div class="forms-preview-info"><p>'+esc(result.summary)+'</p>'+result.warnings.map(text=>'<p>'+esc(text)+'</p>').join('')+
      '<a class="btn btn-primary btn-sm" href="'+url+'" download="'+esc(result.filename)+'">Descargar PDF</a></div>'+
      '<iframe class="forms-preview-frame" src="'+url+'" title="Vista previa del PDF"></iframe>');
    document.getElementById('modal-content')?.classList.add('forms-preview');
    document.getElementById('modal-overlay')?.classList.add('centered');
    bindEvent('forms-preview-close','click',()=>App.hideModal());
  },

  async request(kind,c,evaluator={},options={}){
    try{
      const snapshot=JSON.parse(JSON.stringify(c));
      const result=await this.generate(kind,snapshot,evaluator,options);
      if(options.preview)this.showPreview(result);
      else {
        Export._download(new Blob([result.bytes],{type:'application/pdf'}),result.filename);
        window.toast('PDF diligenciado descargado.','success');
      }
      return result;
    }catch(error){window.toast(error.message||'No se pudo generar el formulario PDF.','error',9000);return null;}
  }
};
window.FormulariosPDF=FormulariosPDF;

/* Validación, revisión y modelo de presentación exclusivo del informe para el abogado. */
const LegalBriefModel={
  SECTIONS:{resumen:'Respuesta principal',explicacion:'Explicación de los hallazgos',argumentos:'Argumentos y alcance técnico',pendientes:'Aspectos pendientes de aclaración',conclusiones:'Conclusiones'},
  CLASSES:['Coincidencia','Discrepancia','Diferencia explicable','Información insuficiente'],
  _text(value,label,max=18000){
    if(typeof value!=='string'||!value.trim())throw new Error('Falta texto en '+label+'.');
    if(value.length>max)throw new Error('El texto de '+label+' supera el tamaño admitido.');
    return value.trim();
  },
  _refs(value,book,label){
    if(!Array.isArray(value)||!value.length||value.length>20||value.some(v=>typeof v!=='string'||!book.byRef.has(v)))
      throw new Error('Las evidencias de '+label+' deben identificar fragmentos existentes.');
    return [...new Set(value)];
  },
  _normalized(text){return String(text).replace(/\s+/g,' ').trim();},
  _checkScores(text,refs,book){
    const codes=Object.values(Interpret.GROUP_ORDER).flat().sort((a,b)=>b.length-a.length).map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
    const re=new RegExp('\\b('+codes+')\\b\\s*(?:\\(\\s*)?T\\s*[:=]\\s*(≤|≥|<=|>=|<|>)?\\s*(\\d{1,3})([VF]?)(\\*?)','g');let match;
    const norm=s=>String(s).replace(/<=/g,'≤').replace(/>=/g,'≥').replace(/\s/g,'');
    while((match=re.exec(text))){
      const code=match[1],value=norm((match[2]||'')+match[3]+match[4]+match[5]);
      const found=refs.some(id=>{
        const source=book.byRef.get(id).text;
        const escaped=code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        if(!new RegExp('\\b'+escaped+'\\b').test(source))return false;
        const values=[...source.matchAll(/\bT\s*[:=]\s*(≤|≥|<=|>=|<|>)?\s*(\d{1,3})([VF]?)(\*?)/g)].map(m=>norm((m[1]||'')+m[2]+m[3]+m[4]));
        const direct=new RegExp('\\b'+escaped+'\\s*[:=]\\s*(≤|≥|<=|>=|<|>)?\\s*(\\d{1,3})([VF]?)(\\*?)','g');
        for(const m of source.matchAll(direct))values.push(norm((m[1]||'')+m[2]+m[3]+m[4]));
        return values.includes(value);
      });
      if(!found)throw new Error('La puntuación '+code+' T='+value+' no coincide con los fragmentos citados en ese texto.');
    }
  },
  parse(value,book,{allowStale=false}={}){
    if(!value||typeof value!=='object'||Array.isArray(value)||value.tipo!=='informe_explicativo_abogado'||value.version!==1)
      throw new Error('El JSON debe ser un informe_explicativo_abogado, versión 1.');
    if(!allowStale&&value.huella_fuentes!==book.fingerprint)throw new Error('El JSON corresponde a otras versiones de fuentes o a otro encargo. Prepare un prompt actualizado.');
    if(!Array.isArray(value.secciones)||value.secciones.length>8)throw new Error('Falta el arreglo de secciones del documento.');
    const used=new Set(),sections=[];
    for(const section of value.secciones){
      if(!Object.hasOwn(this.SECTIONS,section.id)||used.has(section.id))throw new Error('Sección desconocida o repetida: '+section.id);
      used.add(section.id);
      if(!Array.isArray(section.bloques)||section.bloques.length>50)throw new Error('Bloques no válidos en '+section.id+'.');
      const blocks=section.bloques.map(b=>{
        const evidencias=this._refs(b.evidencias,book,section.id);
        if(b.tipo==='parrafo'){
          const contenido=this._text(b.contenido,section.id);this._checkScores(contenido,evidencias,book);
          return {tipo:'parrafo',contenido,evidencias};
        }
        if(b.tipo==='lista'&&Array.isArray(b.items)&&b.items.length&&b.items.length<=30){
          const items=b.items.map(t=>this._text(t,section.id,6000));items.forEach(t=>this._checkScores(t,evidencias,book));
          return {tipo:'lista',items,evidencias};
        }
        throw new Error('Solo se admiten párrafos y listas en las secciones explicativas.');
      });
      sections.push({id:section.id,bloques:blocks});
    }
    if(!sections.find(s=>s.id==='resumen')?.bloques.length||!sections.find(s=>s.id==='conclusiones')?.bloques.length)
      throw new Error('El documento necesita respuesta principal y conclusiones.');
    const chronology=(book.options?.chronology===false?[]:Array.isArray(value.cronologia)?value.cronologia:[]).map(row=>{
      const evidencias=this._refs(row.evidencias,book,'cronología'),hecho=this._text(row.hecho,'cronología',6000);
      this._checkScores(hecho,evidencias,book);return {fecha:this._text(row.fecha,'fecha',120),hecho,evidencias};
    });
    const contrasts=(book.options?.comparison===false||book.externalCount===0?[]:Array.isArray(value.contrastes)?value.contrastes:[]).map(row=>{
      if(!this.CLASSES.includes(row.clasificacion))throw new Error('Clasificación de contraste no admitida.');
      if(!book.byRef.has(row.referencia))throw new Error('La afirmación de contraste remite a un fragmento inexistente.');
      const cita=this._text(row.cita,'cita de contraste',600),fragment=book.byRef.get(row.referencia);
      if(!this._normalized(fragment.text).includes(this._normalized(cita)))throw new Error('La cita atribuida a '+row.referencia+' no aparece literalmente en su fragmento.');
      const evidencias=this._refs(row.evidencias,book,'análisis de contraste');
      const analisis=this._text(row.analisis,'análisis de contraste',9000),alcance=this._text(row.alcance,'alcance del contraste',6000);
      this._checkScores(analisis+' '+alcance,evidencias,book);
      return {referencia:row.referencia,cita,clasificacion:row.clasificacion,analisis,alcance,
        preguntas:Array.isArray(row.preguntas)?row.preguntas.map(p=>this._text(p,'pregunta',3000)):[],evidencias};
    });
    const questions=(book.options?.questions===false?[]:Array.isArray(value.preguntas)?value.preguntas:[]).map(row=>({pregunta:this._text(row.pregunta,'pregunta',4000),evidencias:this._refs(row.evidencias,book,'pregunta')}));
    if(chronology.length>80||contrasts.length>40||questions.length>40)throw new Error('El documento supera el número de elementos admitido.');
    return {tipo:value.tipo,version:1,huella_fuentes:String(value.huella_fuentes),secciones:sections,cronologia:chronology,contrastes:contrasts,preguntas:questions};
  },
  refs(doc){
    return [...new Set([
      ...doc.secciones.flatMap(s=>s.bloques.flatMap(b=>b.evidencias)),
      ...doc.cronologia.flatMap(r=>r.evidencias),...doc.contrastes.flatMap(r=>[r.referencia,...r.evidencias]),...doc.preguntas.flatMap(r=>r.evidencias)
    ])];
  },
  snapshot(book,doc){
    const refs=this.refs(doc);
    return {fingerprint:book.fingerprint,options:book.options,externalCount:book.externalCount,manifest:(book.localManifest||book.manifest).map(s=>({...s})),fragments:refs.map(id=>({...book.byRef.get(id)}))};
  },
  snapshotBook(snapshot){return {...snapshot,byRef:new Map(snapshot.fragments.map(f=>[f.id,f])),bySource:new Map(snapshot.manifest.map(s=>[s.id,s]))};},
  async status(state,live){
    if(!state.document)return {exists:false,reviewed:false,stale:false};
    const stale=state.document.huella_fuentes!==live.fingerprint;
    const hash=await LegalBriefSources.hash(state.document);
    const layoutKey=JSON.stringify([state.request?.recipient||'',state.options?.appendix!==false,live.reviewerStamp||'']);
    return {exists:true,stale,hash,layoutKey,reviewed:!state.editorDraft&&!stale&&state.review?.fingerprint===live.fingerprint&&state.review?.documentHash===hash&&state.review?.layoutKey===layoutKey};
  },
  build(c,state,live,evaluator={},status={}){
    const doc=state.document;if(!doc)throw new Error('Todavía no hay un documento explicativo guardado.');
    const book=state.documentSnapshot?this.snapshotBook(state.documentSnapshot):live;
    const checked=this.parse(doc,book,{allowStale:true}),context=state.documentContext||{request:state.request,patient:c.patient,options:state.options};
    const request={...context.request,recipient:state.request?.recipient||''},p=context.patient||{},options={...(context.options||state.options),appendix:state.options?.appendix!==false},flags=ReportSections.options(c),blocks=[],sections=[];
    const sourceNumbers=new Map(book.manifest.map((s,i)=>[s.id,i+1]));let sectionId=null,tableNo=0,number=0;
    const push=b=>blocks.push({...b,sectionId});
    const heading=(id,title)=>{sectionId=id;sections.push({id,numero:++number,titulo:title});push({t:'h1',text:number+'. '+title});};
    const label=id=>{const f=book.byRef.get(id);return f?'Fuente '+sourceNumbers.get(f.sourceId)+', '+f.locator:'Referencia no disponible';};
    const cite=refs=>' ['+refs.map(label).join('; ')+']';
    const addSection=id=>{
      const entry=checked.secciones.find(s=>s.id===id);if(!entry?.bloques.length)return;
      heading(id,this.SECTIONS[id]);
      for(const block of entry.bloques){
        if(block.tipo==='parrafo')for(const text of ReportModel.paragraphs(block.contenido))push({t:'p',text:text+cite(block.evidencias)});
        else push({t:'list',items:block.items.map(text=>text+cite(block.evidencias))});
      }
    };
    push({t:'title',text:'Informe explicativo para el abogado',subtitle:'Comprensión de hallazgos y contraste técnico de documentos'});
    if(!status.reviewed)push({t:'banner',text:status.stale?'BORRADOR · Las fuentes o el encargo cambiaron desde la elaboración del documento. Requiere actualización y revisión profesional.':'BORRADOR · Pendiente de revisión profesional.'});
    const idRows=[['Evaluado',p.name||'No consta'],['Fecha de aplicación',ReportModel._fmtDate(p.applicationDate)]];
    if(flags.id_document&&p.document)idRows.splice(1,0,['Documento de identidad',p.document]);
    if(flags.id_dob&&p.dob)idRows.push(['Fecha de nacimiento',ReportModel._fmtDate(p.dob)]);
    if(request.recipient)idRows.push(['Destinatario',request.recipient]);
    push({t:'idbox',rows:idRows});
    addSection('resumen');
    heading('objeto','Pregunta y finalidad');push({t:'p',text:request.question||'No consta'});
    if(request.purpose)push({t:'p',text:request.purpose});
    heading('fuentes','Fuentes utilizadas');
    push({t:'table',num:++tableNo,caption:'Documentos y versiones de referencia',columns:['Fuente','Documento','Autor / procedencia','Fecha'],rows:book.manifest.map((s,i)=>({cells:[i+1,s.title,s.author||'No consta',/^\d{4}-\d{2}-\d{2}$/.test(s.date)?ReportModel._fmtDate(s.date):s.date||'No consta']}))});
    if(options.chronology!==false&&checked.cronologia.length){
      heading('cronologia','Cronología documentada');push({t:'table',num:++tableNo,caption:'Hechos y fuentes',columns:['Fecha','Hecho documentado','Soporte'],rows:checked.cronologia.map(r=>({cells:[r.fecha,r.hecho,r.evidencias.map(label).join('; ')]}))});
    }
    addSection('explicacion');
    if(options.comparison!==false&&checked.contrastes.length){
      heading('contraste','Contraste entre documentos');
      push({t:'table',num:++tableNo,caption:'Afirmaciones, soporte y alcance del contraste',columns:['Afirmación y fuente','Clasificación','Análisis y soporte','Qué permite sostener'],rows:checked.contrastes.map(r=>({cells:['«'+r.cita+'» · '+label(r.referencia),r.clasificacion,r.analisis+cite(r.evidencias),r.alcance+(r.preguntas.length?' Preguntas: '+r.preguntas.join(' '):'')]}))});
    }
    addSection('argumentos');addSection('pendientes');
    if(options.questions!==false&&checked.preguntas.length){heading('preguntas','Preguntas para aclaración');push({t:'list',items:checked.preguntas.map(r=>r.pregunta+cite(r.evidencias))});}
    addSection('conclusiones');
    heading('alcance','Alcance y revisión');
    push({t:'p',text:'Documento de explicación y contraste técnico de las fuentes relacionadas, destinado al uso indicado. Sus conclusiones se limitan a la información disponible y requieren la valoración profesional responsable. Las decisiones jurídicas corresponden al abogado.'});
    if(book.fragments.some(f=>/\[(?:Reservado|Contenido literal reservado)\]/.test(f.text)))push({t:'p',text:'Los fragmentos conservan las marcas de reserva utilizadas al preparar el prompt. Los enunciados del test y los identificadores reservados se presentan mediante esas marcas.'});
    if(status.reviewed)push({t:'p',text:'Revisión profesional registrada el '+ReportModel._fmtDate(state.review.at)+'.'});
    sectionId=null;
    const ev={...evaluator,signature:/^data:image\/(?:png|jpe?g);base64,[A-Za-z0-9+/=]+$/i.test(evaluator.signature||'')?evaluator.signature:null};
    push({t:'signature',evaluator:ev,place:flags.place||ev.city||'',institution:flags.institution||ev.institution||'',date:ReportModel._fmtDate(new Date().toISOString())});
    if(options.appendix!==false){
      heading('fragmentos','Anexo · Fragmentos de soporte');
      push({t:'table',num:++tableNo,caption:'Pasajes citados y localización',columns:['Fuente y localización','Fragmento citado'],rows:this.refs(checked).map(id=>({cells:[label(id),book.byRef.get(id).text]}))});
    }
    return {title:'Informe explicativo para el abogado · '+(p.name||''),patientName:p.name||'',blocks,sections,references:[],evaluator:ev,place:flags.place||ev.city||'',institution:flags.institution||ev.institution||'',issues:[]};
  }
};
window.LegalBriefModel=LegalBriefModel;

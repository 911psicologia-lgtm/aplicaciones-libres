/* Tercer documento independiente. Las fuentes y el texto se guardan dentro del caso. */
const LegalBrief={
  _mounted:false,_timer:null,_revision:0,_refreshNumber:0,
  _esc(value){return window.escHTML(value);},
  _case(){return Storage.getCase(this._caseId);},
  render(params={}){
    const selected=Storage.getCurrentCase(),cur=selected?.id?Storage.getCase(selected.id)||selected:null;
    this._embedded=params.embedded===true;
    this._mounted=false;this._revision=0;this._editingSource=null;this._loadedFile=null;this._editorDirty=false;this._fileToken=(this._fileToken||0)+1;
    if(!cur?.results)return '<div class="screen-content"><h2>Seleccione un caso con resultados</h2><button class="btn btn-primary" id="legal-empty-back">Ir a los casos</button></div>';
    this._caseId=cur.id;
    try{this._state=LegalBriefStore.read(cur);}catch(error){this._state=null;return '<p class="legal-error">'+this._esc(error.message)+'</p>';}
    if(cur.legalBrief?.workflow!=='auto-case-v2')this._state.options={...this._state.options,chronology:false,questions:false,appendix:false};
    this._state.workflow='auto-case-v2';this._editorDirty=Boolean(this._state.editorDraft);
    const state=this._state,q=state.request,e=this._esc.bind(this),prior=ReportSections.prior(cur),extra=state.sources.filter(v=>v.included!==false).length;
    const contents=`<div class="no-print"><div class="card legal-generator"><div class="card-header"><h2>Generar informe técnico complementario</h2>
      ${this._embedded?'<button class="btn btn-ghost btn-sm" id="legal-close">Cerrar</button>':''}<span class="form-hint" id="legal-save-state" role="status">Guardado con el caso</span></div>
      <div class="card-body"><p>La app utilizará los datos del caso, los antecedentes y la cronología registrados, los resultados actuales${prior.rows.length?' y el MMPI-2 anterior':''}, el informe sin IA${cur.aiReport?' y la integración IA guardada':''}. El informe explicará su significado frente a las afirmaciones de los documentos disponibles, con una formulación comprensible para el abogado.</p>
      <div class="legal-fields"><label class="form-label">Pregunta específica <span class="form-hint">(opcional)</span><textarea class="form-textarea" id="legal-question" rows="3" maxlength="8000" placeholder="Si lo deja vacío, se analizarán los resultados y su alcance frente a los informes y el problema del caso.">${e(q.question)}</textarea></label>
      <label class="form-label">Información adicional o precisión <span class="form-hint">(opcional)</span><textarea class="form-textarea" id="legal-notes" rows="3" maxlength="12000" placeholder="Agregue solo lo que todavía no esté registrado en el caso.">${e(q.notes)}</textarea></label></div>
      <div class="flex gap-8 legal-wrap"><button class="btn btn-primary" id="legal-prepare">Preparar informe con IA</button><span class="form-hint">Se emplea el mismo circuito de IA externa de la app.</span></div><div id="legal-error" role="alert"></div>
      <details class="legal-spaced" id="legal-additional"><summary>Agregar o actualizar documentos <span class="form-hint">(opcional${extra?'; '+extra+' seleccionados':''})</span></summary>
      <p class="form-hint">Los informes guardados se incorporan automáticamente. Use este apartado si tiene una versión corregida fuera de la app o un documento que aún no forma parte del caso.</p>
      <div id="legal-sources-list">${this._sourcesHTML()}</div>
      <details id="legal-source-editor"><summary id="legal-source-summary">Agregar documento o texto</summary><div class="legal-source-editor"><div class="legal-fields">
      <label class="form-label">Tipo de documento<select class="form-select" id="legal-source-role">${Object.entries(LegalBriefSources.ROLES).map(([id,title])=>`<option value="${id}" ${id==='externo'?'selected':''}>${title}</option>`).join('')}</select></label>
      <label class="form-label">Cargar archivo<input class="form-input" type="file" id="legal-source-file" accept=".docx,.pdf,.txt,.md"></label>
      <label class="form-label">Título<input class="form-input" id="legal-source-title" maxlength="180"></label><label class="form-label">Autor o entidad<input class="form-input" id="legal-source-author" maxlength="180"></label><label class="form-label">Fecha<input class="form-input" id="legal-source-date" type="date"></label></div>
      <p class="form-hint" id="legal-source-notice">Puede cargar Word, PDF con texto o pegar el contenido. Revise la extracción antes de incorporarlo.</p>
      <label class="form-label">Texto del documento<textarea class="form-textarea legal-source-text" id="legal-source-text" rows="8" maxlength="180000"></textarea></label>
      <label class="opt"><input type="checkbox" id="legal-source-reviewed"><span>He revisado el texto extraído.</span></label>
      <div class="flex gap-8 legal-wrap"><button class="btn btn-primary" id="legal-source-save">Incorporar documento</button><button class="btn btn-ghost" id="legal-source-cancel">Cancelar</button></div></div></details>
      <div class="flex gap-8 legal-spaced"><button class="btn btn-ghost btn-sm" id="legal-use-base">Ver texto del informe sin IA</button><button class="btn btn-ghost btn-sm" id="legal-use-ai" ${cur.aiReport?'':'disabled'}>Ver texto de la integración IA</button></div></details>
      <details class="legal-spaced"><summary>Destinatario, presentación y privacidad</summary><div class="legal-fields legal-spaced"><label class="form-label">Dirigido a<input class="form-input" id="legal-recipient" maxlength="300" value="${e(q.recipient)}"></label><label class="form-label">Finalidad adicional <span class="form-hint">(opcional)</span><textarea class="form-textarea" id="legal-purpose" rows="2" maxlength="5000">${e(q.purpose)}</textarea></label></div>
      <div class="legal-options">${[['chronology','Añadir tabla cronológica'],['comparison','Contrastar afirmaciones documentadas'],['questions','Añadir apartado de preguntas'],['appendix','Anexar los fragmentos citados']].map(([key,title])=>`<label class="opt"><input type="checkbox" data-legal-option="${key}" ${state.options[key]?'checked':''}><span>${title}</span></label>`).join('')}</div>
      <label class="opt"><input type="checkbox" id="legal-identity" ${q.includeIdentity?'checked':''}><span>Compartir identificadores directos en el prompt externo</span></label><p class="form-hint">Se reservan por defecto los identificadores conocidos. La identificación y firma finales se incorporan localmente. Revise también los nombres de terceros en el texto libre.</p>
      <label class="form-label">Otros identificadores que desea reservar, uno por línea<textarea class="form-textarea" rows="2" id="legal-redactions" maxlength="5000">${e(q.additionalIdentifiers)}</textarea></label></details></div></div>
      <details class="card legal-workflow" id="legal-ai-workflow"><summary>Continuar con la IA y cargar el informe</summary><div class="card-body">
      <p>Copie el encargo preparado en su IA y pegue aquí el JSON que devuelva. Después podrá revisar, editar y descargar el informe.</p>
      <div class="flex gap-8 legal-wrap"><button class="btn btn-primary" id="legal-copy" disabled>Copiar encargo</button><button class="btn btn-ghost" id="legal-prompt-download" disabled>Descargar encargo TXT</button></div>
      <details id="legal-prompt-details"><summary>Ver los datos y el encargo preparados</summary><textarea class="form-textarea legal-json" id="legal-prompt" rows="10" readonly aria-label="Encargo preparado"></textarea></details>
      <label class="form-label legal-spaced">Respuesta JSON de la IA<textarea class="form-textarea legal-json" id="legal-json-input" rows="7" maxlength="500000"></textarea></label>
      <button class="btn btn-primary" id="legal-import-json">Cargar y ver el informe</button></div></details></div><div id="legal-document-zone"></div>`;
    if(this._embedded)return '<section class="legal-inline" aria-label="Generar informe para el abogado">'+contents+'</section>';
    return `<div class="screen"><div class="topbar no-print"><div class="topbar-title">Para el abogado · ${e(cur.patient?.name||'Caso')}</div><div class="topbar-actions"><button class="btn btn-secondary btn-sm" id="legal-back">Informes clínicos</button><button class="hamburger-btn" id="ham-btn" aria-label="Abrir menú"><span></span><span></span><span></span></button></div></div><div class="screen-content wide legal-brief-layout">${contents}</div></div>`;
  },
  _sourcesHTML(){
    const sources=this._state.sources;
    if(!sources.length)return '<p class="form-hint legal-spaced">Los documentos adicionales aparecerán aquí. La información guardada en el caso ya se incorpora automáticamente.</p>';
    return '<div class="legal-source-list">'+sources.map(s=>`<article class="legal-source-row"><label class="opt"><input type="checkbox" data-legal-source="${this._esc(s.id)}" ${s.included!==false?'checked':''}><span><strong>${this._esc(s.title)}</strong><small>${this._esc(LegalBriefSources.ROLES[s.role])} · ${this._esc(s.author||'Autor no informado')} · ${this._esc(s.date||'Fecha no informada')} · ${s.reviewed?'Texto revisado':'Texto pendiente de revisar'}</small></span></label><div class="flex gap-8"><button class="btn btn-secondary btn-sm" data-legal-edit-source="${this._esc(s.id)}">Revisar / editar</button><button class="btn btn-ghost btn-sm" data-legal-remove-source="${this._esc(s.id)}">Quitar</button></div></article>`).join('')+'</div>';
  },
  mount(){
    bindEvent('legal-empty-back','click',()=>App.navigate('cases'));
    if(!this._state||!document.getElementById('legal-question'))return;
    this._mounted=true;if(!this._embedded)bindEvent('ham-btn','click',()=>App.openMenu());
    bindEvent('legal-close','click',()=>Report._toggleLegalDrawer(false));
    for(const id of ['legal-back','legal-clinical-tab'])bindEvent(id,'click',()=>App.navigate('report'));
    for(const id of ['legal-question','legal-recipient','legal-purpose','legal-notes','legal-redactions'])bindEvent(id,'input',()=>this._requestChanged());
    bindEvent('legal-identity','change',()=>this._requestChanged());
    document.querySelectorAll('[data-legal-option]').forEach(el=>el.addEventListener('change',()=>this._requestChanged()));
    const list=document.getElementById('legal-sources-list');
    list.addEventListener('change',event=>{
      const id=event.target.dataset.legalSource;if(!id)return;
      this._state.sources.find(s=>s.id===id).included=event.target.checked;this._changed();this._save();this._refreshPreview();
    });
    list.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.dataset.legalEditSource)this._editSource(button.dataset.legalEditSource);
      if(button.dataset.legalRemoveSource)this._removeSource(button.dataset.legalRemoveSource);
    });
    bindEvent('legal-source-file','change',event=>this._run(()=>this._loadFile(event.target.files[0])));
    bindEvent('legal-source-text','input',()=>{document.getElementById('legal-source-reviewed').checked=false;});
    bindEvent('legal-source-save','click',()=>this._run(()=>this._saveSource()));
    bindEvent('legal-source-cancel','click',()=>this._clearSource());
    bindEvent('legal-use-base','click',()=>this._run(()=>this._useCurrent(false)));
    bindEvent('legal-use-ai','click',()=>this._run(()=>this._useCurrent(true)));
    bindEvent('legal-prepare','click',event=>this._run(()=>this._prepare(),event.currentTarget));
    bindEvent('legal-copy','click',()=>this._run(()=>this._copy()));
    bindEvent('legal-prompt-download','click',()=>this._run(()=>this._downloadPrompt()));
    bindEvent('legal-import-json','click',event=>this._run(()=>this._importJSON(),event.currentTarget));
    document.getElementById('legal-document-zone').addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.dataset.legalExport)this._run(()=>this._export(button.dataset.legalExport),button);
      if(button.id==='legal-review')this._run(()=>this._review(),button);
      if(button.id==='legal-save-edits')this._run(()=>this._saveEdits(),button);
      if(button.id==='legal-load-json')document.getElementById('legal-json-input').value=JSON.stringify(this._state.editorDraft||this._state.document,null,2);
    });
    document.getElementById('legal-document-zone').addEventListener('input',event=>{
      if(!event.target.matches('[data-legal-section],[data-legal-contrast],[data-legal-chronology],[data-legal-question],[data-legal-finding]'))return;
      this._editorDirty=true;this._state.review=null;this._state.editorDraft=this._editedDocument();
      document.querySelectorAll('[data-legal-export],#legal-review').forEach(button=>button.disabled=true);
      const label=document.getElementById('legal-edit-state');if(label)label.textContent='Edición pendiente: guarde y valide el texto antes de descargar o revisar.';
      clearTimeout(this._editorTimer);this._editorTimer=setTimeout(()=>{try{this._save();}catch(error){this._error(error);}},500);
    });
    this._refreshPreview();
  },
  _error(error){
    const box=document.getElementById('legal-error');if(box){box.className='legal-error';box.textContent=error.message||String(error);}
    window.toast(error.name==='QuotaExceededError'?friendlyError(error,'guardar el trabajo'):error.message||String(error),'error',9000);
  },
  async _run(action,button){
    if(button)button.disabled=true;
    try{const box=document.getElementById('legal-error');if(box){box.textContent='';box.className='';}await action();}
    catch(error){this._error(error);}
    finally{if(button&&button.isConnected)button.disabled=false;}
  },
  _changed(){
    this._revision++;this._prompt=null;
    for(const id of ['legal-copy','legal-prompt-download']){const button=document.getElementById(id);if(button)button.disabled=true;}
    const preview=document.getElementById('legal-prompt');if(preview)preview.value='';
  },
  _collectRequest(){
    const value=id=>document.getElementById(id)?.value||'';
    this._state.request={question:value('legal-question'),recipient:value('legal-recipient'),purpose:value('legal-purpose'),notes:value('legal-notes'),
      additionalIdentifiers:value('legal-redactions'),includeIdentity:document.getElementById('legal-identity')?.checked===true};
    document.querySelectorAll('[data-legal-option]').forEach(el=>this._state.options[el.dataset.legalOption]=el.checked);
  },
  _requestChanged(){
    this._collectRequest();this._changed();clearTimeout(this._timer);
    const label=document.getElementById('legal-save-state');if(label)label.textContent='Cambios pendientes…';
    this._timer=setTimeout(()=>{try{this._save();this._refreshPreview();}catch(error){this._error(error);}},500);
  },
  _save(){
    clearTimeout(this._timer);this._timer=null;
    const c=LegalBriefStore.save(this._caseId,this._state);
    const label=document.getElementById('legal-save-state');if(label)label.textContent='Guardado · '+new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});
    return c;
  },
  async _loadFile(file){
    if(!file)return;
    document.getElementById('legal-source-reviewed').checked=false;
    const id=this._caseId,token=++this._fileToken,result=await LegalBriefSources.importFile(file);
    if(!this._mounted||this._caseId!==id||token!==this._fileToken)return;
    this._loadedFile=result;document.getElementById('legal-source-text').value=result.text;
    document.getElementById('legal-source-title').value=file.name.replace(/\.[^.]+$/,'');
    document.getElementById('legal-source-reviewed').checked=false;
    document.getElementById('legal-source-notice').textContent=result.notice;
  },
  _clearSource(){
    this._fileToken=(this._fileToken||0)+1;
    this._editingSource=null;this._loadedFile=null;
    for(const id of ['legal-source-title','legal-source-author','legal-source-date','legal-source-text','legal-source-file'])document.getElementById(id).value='';
    document.getElementById('legal-source-reviewed').checked=false;
    document.getElementById('legal-source-summary').textContent='Agregar una fuente';
    document.getElementById('legal-source-editor').open=false;
    document.getElementById('legal-source-notice').textContent='Puede pegar el texto revisado o cargar un archivo. Los archivos originales permanecen en su equipo; se guarda el texto extraído.';
  },
  _editSource(id){
    this._fileToken=(this._fileToken||0)+1;
    const source=this._state.sources.find(s=>s.id===id);if(!source)return;
    this._editingSource=id;this._loadedFile={text:source.text,spans:source.spans,fileName:source.fileName};
    for(const [field,key] of [['role','role'],['title','title'],['author','author'],['date','date'],['text','text']])document.getElementById('legal-source-'+field).value=source[key]||'';
    document.getElementById('legal-source-reviewed').checked=source.reviewed;
    document.getElementById('legal-source-editor').open=true;document.getElementById('legal-source-summary').textContent='Editar fuente';
    document.getElementById('legal-source-editor').scrollIntoView({behavior:'smooth',block:'start'});
  },
  _saveSource(){
    const value=id=>document.getElementById('legal-source-'+id).value;
    const text=LegalBriefSources.text(value('text')),sameText=this._loadedFile?.text===text;
    const old=this._state.sources.find(s=>s.id===this._editingSource);
    const source=LegalBriefSources.normalize({id:old?.id||LegalBriefSources.nextId(this._state.sources),role:value('role'),title:value('title'),author:value('author'),date:value('date'),text,
      fileName:this._loadedFile?.fileName||old?.fileName||'',spans:sameText?this._loadedFile.spans:[],included:old?.included!==false,reviewed:document.getElementById('legal-source-reviewed').checked});
    const next=old?this._state.sources.map(s=>s.id===old.id?source:s):[...this._state.sources,source];
    LegalBriefSources.validateSources(next);const before=this._state.sources;this._state.sources=next;
    try{this._save();}catch(error){this._state.sources=before;throw error;}
    this._changed();document.getElementById('legal-sources-list').innerHTML=this._sourcesHTML();this._clearSource();this._refreshPreview();
    window.toast('Fuente guardada'+(source.reviewed?' y revisada.':'; pendiente de revisión.'),'success');
  },
  _removeSource(id){
    const previous=this._state.sources;this._state.sources=previous.filter(s=>s.id!==id);
    try{this._save();}catch(error){this._state.sources=previous;this._error(error);return;}
    this._changed();document.getElementById('legal-sources-list').innerHTML=this._sourcesHTML();this._refreshPreview();
    if(window.toastAction)window.toastAction('Fuente retirada.','Deshacer',()=>{if(!this._mounted)return;this._state.sources=previous;this._save();this._changed();document.getElementById('legal-sources-list').innerHTML=this._sourcesHTML();this._refreshPreview();});
  },
  _useCurrent(ai){
    const c=this._case();if(ai&&!c.aiReport)throw new Error('No hay una integración IA guardada para este caso.');
    const safe={...c,reportOptions:{...ReportSections.options(c),critical_literal:false},
      ...(c.aiReportOptions?{aiReportOptions:{...c.aiReportOptions,critical_literal:false}}:{})};
    const model=ai?ReportModel.fromAI(c.aiReport,safe,Storage.getEvaluator()||{}):ReportModel.build(safe,Storage.getEvaluator()||{});
    this._clearSource();document.getElementById('legal-source-role').value=ai?'ia':'base';
    document.getElementById('legal-source-title').value=ai?'Integración IA guardada':'Informe sin IA actual';
    document.getElementById('legal-source-author').value=Storage.getEvaluator()?.name||'';
    document.getElementById('legal-source-text').value=ReportModel.toText(model);
    document.getElementById('legal-source-notice').textContent='Revise esta versión. Si la corrigió después en Word, cargue el archivo definitivo o pegue ese texto.';
    document.getElementById('legal-source-editor').open=true;
    document.getElementById('legal-source-editor').scrollIntoView({behavior:'smooth',block:'start'});
  },
  async _prepare(){
    this._collectRequest();const c=this._save(),revision=this._revision;
    const built=await LegalBriefPrompt.build(c,this._state,Storage.getEvaluator()||{});
    if(!this._mounted||revision!==this._revision)throw new Error('El encargo cambió durante la preparación. Prepare el prompt de nuevo.');
    this._prompt=built.prompt;this._state.prepared={fingerprint:built.book.fingerprint,at:new Date().toISOString()};this._save();
    document.getElementById('legal-prompt').value=built.prompt;
    const workflow=document.getElementById('legal-ai-workflow');if(workflow)workflow.open=true;
    for(const id of ['legal-copy','legal-prompt-download'])document.getElementById(id).disabled=false;
    window.toast('Prompt preparado. Revise el texto antes de compartirlo.','success');
  },
  async _copy(){
    if(!this._prompt)throw new Error('Prepare el prompt actualizado.');
    try{await navigator.clipboard.writeText(this._prompt);}catch{
      const field=document.getElementById('legal-prompt');field.focus();field.select();
      if(!document.execCommand('copy'))throw new Error('Seleccione el prompt y cópielo, o descárguelo en TXT.');
    }
    window.toast('Prompt copiado. La app no ha enviado datos al servicio de IA.','success');
  },
  _downloadPrompt(){if(!this._prompt)throw new Error('Prepare el prompt actualizado.');Export._download(new Blob([this._prompt],{type:'text/plain;charset=utf-8'}),'Prompt_Informe_Abogado.txt');},
  async _importJSON(){
    this._collectRequest();const c=this._save(),revision=this._revision,raw=document.getElementById('legal-json-input').value.trim();
    if(!raw||raw.length>500000)throw new Error('Pegue un JSON de hasta 500.000 caracteres.');
    const parsed=JSONRepair.parse(raw);if(!parsed.ok)throw new Error(parsed.error?.message||'No se pudo leer el JSON.');
    const book=await LegalBriefSources.prepare(c,this._state,{requireReviewed:true,evaluator:Storage.getEvaluator()||{}});
    const doc=LegalBriefModel.parse(parsed.data,book);
    if(!this._mounted||revision!==this._revision)throw new Error('Las fuentes cambiaron durante la importación. Inténtelo de nuevo.');
    const previous=JSON.parse(JSON.stringify(this._state));
    this._state.document=doc;this._state.documentSnapshot=LegalBriefModel.snapshot(book,doc);
    this._state.documentContext={createdAt:new Date().toISOString(),request:{...this._state.request},options:{...this._state.options},patient:{name:c.patient?.name,document:c.patient?.document,dob:c.patient?.dob,age:c.patient?.age,applicationDate:c.patient?.applicationDate}};
    this._state.review=null;delete this._state.editorDraft;this._editorDirty=false;
    try{this._save();}catch(error){this._state=previous;this._editorDirty=Boolean(previous.editorDraft);throw error;}
    await this._refreshPreview();window.toast('Documento guardado como borrador. Revise su contenido y sus fuentes.','success');
  },
  _editorHTML(){
    const doc=this._state.editorDraft||this._state.document,e=this._esc.bind(this);
    const fields=[];
    for(const [si,section] of doc.secciones.entries())for(const [bi,block] of section.bloques.entries())
      fields.push(`<label class="form-label">${e(section.titulo||LegalBriefModel.SECTIONS[section.id])}${block.tipo==='lista'?' · un elemento por línea':''}<textarea class="form-textarea" rows="4" data-legal-section="${si}" data-legal-block="${bi}" maxlength="18000">${e(block.tipo==='lista'?block.items.join('\n'):block.contenido)}</textarea></label>`);
    for(const [i,row] of doc.contrastes.entries())for(const key of ['analisis','alcance'])fields.push(`<label class="form-label">Contraste ${i+1} · ${key==='analisis'?'Análisis':'Alcance'}<textarea class="form-textarea" rows="4" data-legal-contrast="${i}" data-legal-key="${key}" maxlength="9000">${e(row[key])}</textarea></label>`);
    for(const [i,row] of doc.cronologia.entries())fields.push(`<label class="form-label">Cronología ${i+1} · hecho<textarea class="form-textarea" rows="2" data-legal-chronology="${i}" maxlength="6000">${e(row.hecho)}</textarea></label>`);
    for(const [i,row] of doc.preguntas.entries())fields.push(`<label class="form-label">Pregunta ${i+1}<textarea class="form-textarea" rows="2" data-legal-question="${i}" maxlength="4000">${e(row.pregunta)}</textarea></label>`);
    for(const [i,row] of (doc.hallazgos||[]).entries())for(const key of ['dimension','evidencia','lectura','alcance'])fields.push(`<label class="form-label">Hallazgo ${i+1} · ${e(key)}<textarea class="form-textarea" rows="3" data-legal-finding="${i}" data-legal-key="${key}" maxlength="4000">${e(row[key])}</textarea></label>`);
    return '<details id="legal-text-editor" '+(this._editorDirty?'open':'')+'><summary>Editar el texto del documento</summary><p class="form-hint" id="legal-edit-state">'+(this._editorDirty?'Edición recuperada: guarde y valide el texto antes de descargar o revisar.':'Se conservan las referencias de cada bloque. Guardar una edición deja el documento pendiente de una nueva revisión.')+'</p>'+fields.join('')+'<button class="btn btn-primary" id="legal-save-edits">Guardar y validar edición</button></details>';
  },
  async _refreshPreview(){
    if(!this._mounted)return;const token=++this._refreshNumber,zone=document.getElementById('legal-document-zone');
    if(this._editorDirty&&zone.querySelector('#legal-text-editor'))return;
    if(!this._state.document){zone.innerHTML='';return;}
    try{
      const c=this._case(),book=await LegalBriefSources.prepare(c,this._state,{evaluator:Storage.getEvaluator()||{}});
      const status=await LegalBriefModel.status(this._state,book);
      if(!this._mounted||token!==this._refreshNumber)return;
      const model=LegalBriefModel.build(c,this._state,book,Storage.getEvaluator()||{},status);
      zone.innerHTML=`<div class="card no-print"><div class="card-header"><h3>${status.reviewed?'Documento revisado':status.stale?'Documento pendiente de actualizar':'Borrador para revisión'}</h3></div><div class="card-body">
      <div class="flex gap-8 legal-wrap">${[['word','Word'],['pdf','PDF'],['html','HTML'],['txt','TXT'],['json','JSON']].map(([id,title])=>`<button class="btn btn-secondary btn-sm" data-legal-export="${id}" ${this._editorDirty?'disabled':''}>${title}</button>`).join('')}<button class="btn btn-primary btn-sm" id="legal-review" ${status.stale||this._editorDirty?'disabled':''}>Registrar revisión profesional</button><button class="btn btn-ghost btn-sm" id="legal-load-json">Llevar documento al editor JSON</button></div>
      <p class="form-hint">${status.stale?'El contenido conserva las fuentes de su elaboración. Prepare un nuevo prompt para actualizarlo.':'Compruebe el análisis, las fuentes y la pertinencia del documento antes de registrar su revisión.'}</p>${this._editorHTML()}</div></div>`+ReportRender.toHTML(model);
    }catch(error){if(token===this._refreshNumber)zone.innerHTML='<div class="card"><div class="card-body legal-error">'+this._esc(error.message)+'</div></div>';}
  },
  _editedDocument(){
    const doc=JSON.parse(JSON.stringify(this._state.document));
    document.querySelectorAll('[data-legal-section]').forEach(el=>{
      const block=doc.secciones[Number(el.dataset.legalSection)].bloques[Number(el.dataset.legalBlock)];
      if(block.tipo==='lista')block.items=el.value.split('\n').map(t=>t.trim()).filter(Boolean);else block.contenido=el.value;
    });
    document.querySelectorAll('[data-legal-contrast]').forEach(el=>doc.contrastes[Number(el.dataset.legalContrast)][el.dataset.legalKey]=el.value);
    document.querySelectorAll('[data-legal-chronology]').forEach(el=>doc.cronologia[Number(el.dataset.legalChronology)].hecho=el.value);
    document.querySelectorAll('[data-legal-question]').forEach(el=>doc.preguntas[Number(el.dataset.legalQuestion)].pregunta=el.value);
    document.querySelectorAll('[data-legal-finding]').forEach(el=>doc.hallazgos[Number(el.dataset.legalFinding)][el.dataset.legalKey]=el.value);
    return doc;
  },
  async _saveEdits(){
    const doc=this._editedDocument();
    const book=LegalBriefModel.snapshotBook(this._state.documentSnapshot);
    const validated=LegalBriefModel.parse(doc,book,{allowStale:true}),previous=JSON.parse(JSON.stringify(this._state));
    this._state.document=validated;this._state.review=null;delete this._state.editorDraft;this._editorDirty=false;
    try{this._save();}catch(error){this._state=previous;this._editorDirty=Boolean(previous.editorDraft);throw error;}
    await this._refreshPreview();window.toast('Edición guardada. Registre una nueva revisión antes de emitir el documento.','success');
  },
  async _review(){
    if(this._editorDirty||this._state.editorDraft)throw new Error('Guarde y valide la edición antes de registrar la revisión.');
    if(!Storage.getEvaluator()?.name?.trim())throw new Error('Complete el nombre del evaluador en su perfil antes de registrar la revisión.');
    this._collectRequest();const c=this._save(),revision=this._revision;
    const book=await LegalBriefSources.prepare(c,this._state,{requireReviewed:true,evaluator:Storage.getEvaluator()||{}});
    const status=await LegalBriefModel.status(this._state,book);
    if(!status.exists||status.stale)throw new Error('Actualice el documento con las fuentes y el encargo vigentes antes de revisarlo.');
    LegalBriefModel.parse(this._state.document,book);
    if(revision!==this._revision)throw new Error('El trabajo cambió durante la revisión. Revise la versión actual.');
    this._state.review={at:new Date().toISOString(),fingerprint:book.fingerprint,documentHash:status.hash,layoutKey:status.layoutKey,evaluator:Storage.getEvaluator()?.name||''};
    this._save();await this._refreshPreview();window.toast('Revisión profesional registrada para esta versión.','success');
  },
  async _export(format){
    if(this._editorDirty||this._state.editorDraft)throw new Error('Guarde y valide la edición antes de descargar el documento.');
    this._collectRequest();const c=this._save();
    const book=await LegalBriefSources.prepare(c,this._state,{evaluator:Storage.getEvaluator()||{}}),status=await LegalBriefModel.status(this._state,book);
    const model=LegalBriefModel.build(c,this._state,book,Storage.getEvaluator()||{},status);
    const safe=String(c.patient?.name||'Caso').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]+/g,'_').slice(0,100);
    const name='Informe_Abogado_'+safe+'_'+(status.reviewed?'Revisado':'Borrador');
    if(format==='word')Export._download(await ReportRender.toDocx(model,{}),name+'.docx');
    else if(format==='pdf')Export._download(await ReportRender.toPDF(model,{}),name+'.pdf');
    else if(format==='html')Export._download(new Blob([ReportRender.toStandaloneHTML(model,{})],{type:'text/html;charset=utf-8'}),name+'.html');
    else if(format==='txt')Export._download(new Blob([ReportModel.toText(model)],{type:'text/plain;charset=utf-8'}),name+'.txt');
    else if(format==='json')Export.exportJSON(this._state.document,name+'.json');
    window.toast('Documento descargado'+(status.reviewed?' con revisión registrada.':' como borrador.'),'success');
  },
  unmount(){
    clearTimeout(this._timer);this._timer=null;
    clearTimeout(this._editorTimer);this._editorTimer=null;
    if(this._mounted&&this._editorDirty)this._state.editorDraft=this._editedDocument();
    if(this._mounted&&this._state){try{this._collectRequest();this._save();}catch(error){this._error(error);}}
    this._mounted=false;this._refreshNumber++;
  }
};
window.LegalBrief=LegalBrief;

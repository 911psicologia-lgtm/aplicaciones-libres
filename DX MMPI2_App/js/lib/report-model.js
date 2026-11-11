/* Modelo común para el informe base, la integración de IA y las exportaciones. */
const ReportModel = {
  COUNTRY_LABEL: {US:'Estados Unidos · Minnesota',MX:'México · Lucio, Reyes-Lagunes y Scott',ES:'España · TEA Ediciones'},
  GROUP_TITLES: {
    Validez:'Escalas de validez',Clínicas:'Escalas clínicas básicas',Contenido:'Escalas de contenido',
    Suplementarias:'Escalas suplementarias',Subescalas:'Subescalas Harris-Lingoes y de Introversión social',
    'PSY-5':'Dimensiones PSY-5'
  },
  LEGACY_TITLES: {
    'datos de identificacion':'identificacion','motivo de evaluacion':'motivo','antecedentes':'antecedentes',
    'historia del caso':'antecedentes','contexto pericial':'contexto','validez del protocolo':'validez',
    'escalas de validez':'validez','escalas suplementarias y psy 5':'suplementarias','personalidad psy 5':'suplementarias',
    'subescalas clinicamente relevantes':'subescalas','integracion clinica del perfil':'integracion','sintesis integradora':'integracion',
    'items criticos y seguridad':'criticos','comparacion con mmpi 2 anterior':'contraste',
    'conclusiones integrativas':'conclusiones','recomendaciones clinicas':'recomendaciones'
  },
  TOPICS: {
    ansiedad_aguda:['Ansiedad y activación','Tensión o activación ansiosa.'],
    ansiedad_tension:['Ansiedad y activación','Tensión o activación ansiosa.'],
    ideacion_suicida:['Estado de ánimo y seguridad','Malestar depresivo o contenido relacionado con la seguridad. Aclarar su vigencia.'],
    depresion_preocupacion:['Estado de ánimo y seguridad','Malestar afectivo y preocupaciones.'],
    amenaza_ataque:['Ira y convivencia','Ira o conducta que requiere indagación sobre seguridad interpersonal.'],
    antisocial:['Ira y convivencia','Actitudes frente a normas y convivencia.'],
    ira:['Ira y convivencia','Expresión o regulación del enojo.'],
    estres_alcohol:['Consumo de sustancias','Impacto del consumo de alcohol.'],
    sustancias:['Consumo de sustancias','Experiencias relacionadas con consumo.'],
    confusion_mental:['Atención y experiencias inusuales','Dificultades percibidas de atención o confusión.'],
    persecucion:['Atención y experiencias inusuales','Percepción de amenaza o desconfianza.'],
    pensamiento_desviado:['Atención y experiencias inusuales','Experiencias o pensamientos inusuales.'],
    creencias_desviadas:['Atención y experiencias inusuales','Creencias que requieren contexto.'],
    sueno:['Sueño','Dificultades relacionadas con el sueño.'],
    somaticos:['Bienestar físico','Molestias corporales o preocupación por la salud.'],
    familia:['Relaciones familiares','Tensiones o experiencias en el contexto familiar.'],
    sexual:['Experiencias e inquietudes sobre sexualidad','Experiencias o preocupaciones relacionadas con la sexualidad.']
  },
  LEGEND:'Las puntuaciones T se interpretan frente al grupo de referencia. T = 50 es el centro de la escala. En este informe, los rangos descriptivos son Bajo (≤39), Habitual (40–55), Promedio superior (56–59), Alto (60–69) y Muy alto (≥70). Los indicadores de validez conservan sus propios criterios.',
  SUPPLEMENTARY_CONTENT:{
    A:'Malestar y tensión informados.',R:'Estilo de expresión y control emocional.',
    AAS:'Reconocimiento informado de dificultades de consumo.',APS:'Contenido que orienta a explorar vulnerabilidad al consumo.',
    MDS:'Tensiones y satisfacción en las relaciones de pareja.',Ho:'Hostilidad o desconfianza informadas.',
    'O-H':'Forma de manejar la expresión del enojo.',Do:'Afirmación interpersonal en los contextos evaluados.',
    Re:'Responsabilidad y cumplimiento según la autodescripción.',Mt:'Malestar en contenidos desarrollados para población estudiantil.',
    PK:'Síntomas relacionados con estrés. Contraste exposición, curso e impacto funcional.'
  },
  _literalCache:new WeakMap(),

  country(c){return ['ES','US','MX'].includes(c.patient?.country)?c.patient.country:'US';},
  defaultOptions(){return {...ReportSections.DEFAULTS};},
  options(c){return ReportSections.options(c);},
  optionCatalog(c){return ReportSections.catalog(c);},

  _fmtDate(iso){
    if(!iso)return 'No consta';
    const d=/^\d{4}-\d{2}-\d{2}$/.test(iso)?new Date(iso+'T12:00:00-05:00'):new Date(iso);
    return Number.isNaN(d.getTime())?String(iso):d.toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Bogota'});
  },

  levelLabel(t,bound=''){
    if(!Number.isFinite(t))return '—';
    if(bound&&!(bound==='≤'&&t<=39)&&!(bound==='≥'&&t>=70))return 'Límite de tabla';
    return t>=70?'Muy alto':t>=60?'Alto':t>=56?'Promedio superior':t>=40?'Habitual':'Bajo';
  },
  levelKey(t){return !Number.isFinite(t)?'nd':t>=70?'vh':t>=60?'h':t>=56?'ps':t>=40?'m':'lo';},

  score(c,code){
    const r=c.results?.[code]||{},p=c.patient||{},country=this.country(c);
    const t=Number.isFinite(r.t)?r.t:null;
    let bound=r.bound||'',direction=['V','F'].includes(r.direction)?r.direction:'';
    if(t!=null&&r.verify&&!bound&&window.MMPI2?.lookupT){
      const lookup=MMPI2.lookupT(code,r.pdk?r.pdK:r.pd,p.sex,country);
      if(lookup.t===t&&lookup.ceiling)bound='≥';
    }
    const constant=window.__VRIN_TRIN_PAIRS__?.TRIN?.constant;
    if(t!=null&&code==='TRIN'&&!direction&&country==='US'&&Number.isFinite(r.pd)&&Number.isFinite(constant)){
      direction=r.pd===constant?'':r.pd>constant?'V':'F';
    }
    return {...r,t,bound,direction,published:t==null?'—':bound+t+direction+(r.verify?'*':'')};
  },

  groups(o){
    return ['Validez','Clínicas','Contenido','Suplementarias',...(o.sec_psy5?['PSY-5']:[]),...(o.sec_subscales?['Subescalas']:[])];
  },

  readings(r,code,invalid=false){
    const t=r.t;
    if(t==null)return code==='Es'&&Number.isFinite(r.pd)?
      'PD '+r.pd+'. Conversión T pendiente en el baremo seleccionado.':
      'Conversión T pendiente. '+Interpret.statusReason(r)+'.';
    switch(code){
      case 'VRIN':return t>=80?'La inconsistencia en pares alcanza el umbral de invalidez.':
        t>=70?'Revise la consistencia entre pares y las condiciones de aplicación.':'El índice apoya la consistencia de los pares evaluados.';
      case 'TRIN':return (r.direction?'Dirección '+r.direction+' ('+(r.direction==='V'?'verdadero':'falso')+') en los pares evaluados. ':'')+
        (t>=80?'El patrón fijo alcanza el umbral de invalidez.':t>=70?'Revise el patrón de respuesta fija.':'Por debajo del umbral de invalidez.');
      case 'F':return 'Infrecuencia en el bloque inicial. Integre el malestar referido, la consistencia y las condiciones de aplicación.';
      case 'Fb':return 'Infrecuencia en el bloque posterior. Contraste con F y las condiciones de aplicación.';
      case 'Fp':return 'Infrecuencia respecto de muestras clínicas. Considere conjuntamente F, Fb y la información de entrevista.';
      case 'L':return t>=65?'Explore una posible presentación favorable. Contraste con K, S y la entrevista.':
        'Examine la presentación de sí junto con K y S.';
      case 'K':return (this.levelLabel(t)==='Habitual'?'Rango habitual. ':'')+'Integre la presentación de sí con L y S.';
      case 'S':return (this.levelLabel(t)==='Habitual'?'Rango habitual. ':'')+'Considere la autopresentación junto con L y K.';
    }
    if(invalid)return 'Lectura clínica suspendida por los indicadores de validez.';
    if(r.verify)return 'Conversión marcada para verificación. Lectura provisional.';
    if(['Mf','GM','GF'].includes(code))return 'Intereses y preferencias en el marco del instrumento y del grupo normativo.';
    if(code==='Es'&&t<=39)return 'Explore posibles dificultades para movilizar estrategias y apoyos de afrontamiento frente a las demandas actuales.';
    if(this.SUPPLEMENTARY_CONTENT[code])return this.levelLabel(t,r.bound)+'. '+this.SUPPLEMENTARY_CONTENT[code];
    if(t>=60)return 'Elevación descriptiva. Contraste su significado con el perfil y la entrevista.';
    return this.levelLabel(t,r.bound)+'. Integre el dato con el resto del perfil.';
  },

  criticalRows(c,o=this.options(c),withLiteral=false){
    const result=window.Critical?.compute(c.responses,c.patient?.sex);
    const found=new Map();
    for(const family of ['KB','LW']){
      if(family==='KB'&&!o.sec_critical||family==='LW'&&!o.sec_critical_lw)continue;
      for(const series of result?.sets[family]?.series||[]){
        const [theme,summary]=this.TOPICS[series.key]||['Otros contenidos','Contenido que requiere entrevista.'];
        for(const item of series.endorsed){
          const row=found.get(item.num)||{item:item.num,response:item.dir,theme,summaries:new Set(),families:new Set(),
            ...(withLiteral&&o.critical_literal?{literal:item.text}: {})};
          row.summaries.add(summary);
          row.families.add(family);
          found.set(item.num,row);
        }
      }
    }
    return [...found.values()].sort((a,b)=>a.theme.localeCompare(b.theme,'es')||a.item-b.item)
      .map(({summaries,families,...row})=>({...row,summary:[...summaries].join(' '),families:[...families]}));
  },

  _withoutLiterals(text){
    const bank=window.__ITEMS__;
    if(!Array.isArray(bank)||!text)return text;
    if(!this._literalCache.has(bank)){
      const escaped=[...new Set(bank.map(row=>String(row?.text||'').trim().replace(/[.,;!?]+$/,'')).filter(Boolean))]
        .sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+'));
      this._literalCache.set(bank,escaped.length?new RegExp('(?<![\\p{L}\\p{N}])(?:'+escaped.join('|')+')(?![\\p{L}\\p{N}])','giu'):null);
    }
    const pattern=this._literalCache.get(bank);
    return pattern?text.replace(pattern,'[Contenido literal reservado]'):text;
  },

  cleanText(c,value,o=this.options(c)){
    let text=this._withoutLiterals(String(value??'')).trim()
      .replace(/\bbanda\s*(?:\/\s*puntuaci[oó]n\s*)?modal\b/giu,'rango habitual')
      .replace(/\bpuntuaci[oó]n\s+modal\b/giu,'puntuación en rango habitual');
    if(!o.info_request_context)text=text.replace(/\bpericial(?:es)?\b/giu,'de evaluación')
      .replace(/\bperit[oa]s?\b/giu,'profesional').replace(/\bdict[aá]men(?:es)?\b/giu,'informe');
    if(this.country(c)==='US')text=text.replace(/TEA\s*corrige/gi,'plataforma ajena al baremo aplicado');
    return text;
  },

  _key(text){return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\s*\d+[.)]\s*/,'').replace(/[^a-z0-9]+/g,' ').trim();},

  _sectionId(section){
    if(section?.id)return Object.hasOwn(ReportSections.TITLES,section.id)?section.id:null;
    const key=this._key(section?.titulo);
    return Object.keys(ReportSections.TITLES).find(id=>this._key(ReportSections.TITLES[id])===key)||this.LEGACY_TITLES[key]||null;
  },

  _scoreIssues(c,text,o=this.options(c),section){
    const known=new Map(Object.keys(c.results||{}).filter(code=>code!=='_meta').map(code=>[code.toLowerCase(),code]));
    const previous=o.sec_compare&&(section==='contraste'||/\b(?:anterior|previ[ao])\b/i.test(text))?ReportSections.prior(c).rows:[];
    const re=/\b([A-Za-z][A-Za-z0-9-]*)\s*(?:\(\s*)?(?:T\s*(?:(?:[:=]|de)\s*)?|=\s*)([≤≥<>]?)\s*(\d{1,3})([VF]?)(\*?)(?![\d.])/gi;
    const issues=[];
    for(const match of String(text).matchAll(re)){
      const code=known.get(match[1].toLowerCase());
      if(!code)continue;
      const score=this.score(c,code),provided=match[2]+match[3]+match[4].toUpperCase()+match[5];
      if(provided===score.published||previous.some(row=>row.code===code&&row.previous===provided))continue;
      issues.push(code+' ('+provided+' frente a '+(score.t==null?'T pendiente':score.published)+')');
    }
    return [...new Set(issues)];
  },

  _aiBlocks(section,c,o){
    const convert=value=>this.cleanText(c,value,o);
    const input=Array.isArray(section.bloques)?section.bloques:
      typeof section.contenido==='string'?section.contenido.split(/\n\s*\n/).map(contenido=>({tipo:'parrafo',contenido})):[];
    return input.flatMap(b=>{
      if(!b||typeof b!=='object')return [];
      const kind=this._key(b.tipo);
      if(kind==='parrafo'&&typeof b.contenido==='string'){
        const text=convert(b.contenido);
        return text?[{t:'p',text}]:[];
      }
      if(kind==='lista'&&Array.isArray(b.items)){
        const items=b.items.filter(value=>typeof value==='string').map(convert).filter(Boolean);
        return items.length?[{t:'list',items}]:[];
      }
      if(kind==='tabla'&&Array.isArray(b.columnas)&&Array.isArray(b.filas)){
        const cols=b.columnas.filter(x=>typeof x==='string');
        if(!cols.length||cols.length!==b.columnas.length||cols.some(x=>/^(?:pd|t)(?:\s|$)|(?:escala|identificaci[oó]n|enunciado literal)/i.test(x)))return [];
        const rows=b.filas.filter(row=>Array.isArray(row)&&row.length===cols.length&&row.every(x=>x==null||['string','number'].includes(typeof x)));
        if(rows.length)return [{t:'table',caption:convert(b.titulo)||'Síntesis cualitativa',columns:cols.map(convert),rows:rows.map(row=>({cells:row.map(convert)}))}];
      }
      return [];
    });
  },

  parseAI(input,c,{strict=false}={}){
    const value=input?.report&&Array.isArray(input.report.secciones)?input.report:input;
    if(!Array.isArray(value?.secciones)||!value.secciones.length||value.secciones.length>80){
      throw new Error('El JSON debe contener un arreglo de secciones con interpretación.');
    }
    const o=this.options(c),plan=ReportSections.plan(c,o),active=new Set(plan.map(x=>x.id));
    const reserved=new Set(['encabezado','identificacion','criticos','alcance']);
    if(Interpret.verdict(c.results||{}).status==='NO_INTERPRETABLE'){
      for(const id of active)if(!['tecnica','validez','limitaciones'].includes(id))reserved.add(id);
    }
    if(!ReportSections.has(c.patient?.mentalExam))reserved.add('examen');
    if(!ReportSections.interview(c))reserved.add('impresion');
    if(!ReportSections.has(c.patient?.strengths)&&!ReportSections.interview(c))reserved.add('recursos');
    const modern=value.secciones.some(s=>s?.id);
    const map=new Map(),issues=[];
    for(const [index,section] of value.secciones.entries()){
      const id=this._sectionId(section);
      if(strict&&modern&&(!id||section.numero!==index+1||map.has(id))){
        throw new Error('Revise los identificadores, las secciones repetidas y la numeración continua del JSON.');
      }
      if(!id)continue;
      const blocks=(!active.has(id)||reserved.has(id))?[]:this._aiBlocks(section,c,o).filter(b=>{
        const text=b.text||b.items?.join(' ')||b.rows?.flatMap(r=>r.cells).join(' ')||'';
        if(!o.sec_psy5&&/\b(?:PSY[- ]?5|AGGR|PSYC|DISC|NEGE|INTR)\b/i.test(text))return false;
        if(!o.sec_clusters&&/\bcl[uú]ster(?:es)?\b/i.test(text))return false;
        const found=this._scoreIssues(c,text,o,id);
        issues.push(...found);
        return !found.length;
      });
      map.set(id,[...(map.get(id)||[]),...blocks]);
    }
    if(strict&&issues.length)throw new Error('Revise las puntuaciones del texto de IA: '+[...new Set(issues)].slice(0,6).join(' · '));
    if(strict&&![...map.values()].some(b=>b.length))throw new Error('El JSON carece de interpretación para las secciones activas.');
    const references=o.sec_references&&Array.isArray(value.referencias)?
      value.referencias.filter(r=>typeof r==='string').map(r=>this.cleanText(c,r,o)).filter(Boolean):[];
    return {map,references,issues};
  },

  build(c,evaluator={},override,ai=null){
    const S=ReportSections,I=Interpret,p=c.patient||{},R=c.results||{},o=S.options(c,false,override);
    const country=this.country(c),prior=S.prior(c),sections=S.plan(c,o,prior),blocks=[];
    const verdict=I.verdict(R),invalid=verdict.status==='NO_INTERPRETABLE';
    const ev={...evaluator,signature:/^data:image\/(?:png|jpe?g);base64,[A-Za-z0-9+/=]+$/i.test(evaluator.signature||'')?evaluator.signature:null};
    const place=(o.place||ev.city||'').trim(),institution=(o.institution||ev.institution||'').trim();
    const day=this._fmtDate(c.reportDate||new Date().toISOString());
    const flags=I.validityFlags(R,R._meta?.omissions);
    const clean=value=>this.cleanText(c,value,o);
    const field=value=>clean(value)||'No consta';
    let tableNo=0,figNo=0,sectionId=null;
    const push=b=>blocks.push({...b,sectionId});
    const pText=text=>{if(text)push({t:'p',text});};
    const h2=text=>push({t:'h2',text});
    const table=(caption,columns,rows,extra={})=>push({t:'table',num:++tableNo,caption,columns,rows,...extra});
    const list=items=>{if(items.length)push({t:'list',items});};
    const chart=(caption,spec)=>{if(o.sec_charts&&spec.series.some(s=>s.data.some(Number.isFinite)))push({t:'chart',num:++figNo,caption,spec});};
    const take=id=>{
      if(invalid&&id!=='tecnica'&&id!=='validez'&&id!=='limitaciones')return;
      for(const block of ai?.map.get(id)||[]){
        if(block.t==='table')table(block.caption,block.columns,block.rows);
        else push(block);
      }
    };
    const selectedGroups=this.groups(o);
    const visiblePrior=prior.rows.filter(row=>selectedGroups.some(g=>I.GROUP_ORDER[g].includes(row.code)));
    const profile=(group,id)=>{
      const codes=I.GROUP_ORDER[group].filter(code=>Object.hasOwn(R,code));
      if(!codes.length){pText('No consta un registro de puntuaciones para este grupo.');return;}
      const scores=codes.map(code=>this.score(c,code));
      const header=['Escala','Nombre','PD','PD+K','T','Rango de T',...(o.tbl_descriptors?['Lectura breve']:[])];
      const rows=codes.map((code,i)=>{
        const r=scores[i];
        return {cells:[code,I.name(code),r.pd??'—',r.pdk?r.pdK??'—':'—',r.published,this.levelLabel(r.t,r.bound),
          ...(o.tbl_descriptors?[clean(this.readings(r,code,invalid))]:[])],level:this.levelKey(r.t)};
      });
      const pending=codes.filter((code,i)=>scores[i].t==null);
      const es=group==='Suplementarias'?scores[codes.indexOf('Es')]:null;
      const footnotes=[];
      if(pending.length)footnotes.push('Conversión T pendiente en '+pending.join(', ')+'.');
      if(scores.some(r=>r.verify))footnotes.push('* Conversión a verificar en la fuente seleccionada.');
      if(es?.t==null&&Number.isFinite(es?.pd))footnotes.push('Es conserva PD '+es.pd+'.');
      table(this.GROUP_TITLES[group]+' · puntuaciones directas (PD), corregidas por K (PD+K) y típicas (T)',header,rows,
        {group,tCol:4,levelCol:5,footnote:footnotes.join(' ')});
      if(group==='Validez'){
        const summary=codes.map((code,i)=>code+' ('+scores[i].published+'). '+clean(this.readings(scores[i],code))).join(' ');
        push({t:'interp',text:summary});
        pText('Omisiones registradas: '+(flags.omissions??'No consta')+'. Índice F − K (PD): '+(flags.fk??'No consta')+'.');
        pText('Lectura del protocolo: '+verdict.label+'.');
        const observations=[];
        if(flags.overInvalid||flags.overPossible)observations.push('Revise la infrecuencia y el posible impacto del malestar actual. Contraste con la entrevista.');
        if(flags.underInvalid||flags.under)observations.push('Explore una posible presentación favorable y contraste con otras fuentes.');
        if(flags.inconsistent||flags.someInconsistency)observations.push('Revise la consistencia del patrón de respuestas y las condiciones de aplicación.');
        list(observations);
      }else if(invalid){
        pText('Las puntuaciones disponibles se presentan para revisión técnica. La interpretación clínica está suspendida.');
      }else{
        const noteworthy=codes.map((code,i)=>[code,scores[i]]).filter(([code,r])=>r.t>=65&&!r.verify&&!['Mf','GM','GF'].includes(code))
          .sort((a,b)=>b[1].t-a[1].t);
        const summary=noteworthy.length?'Elevaciones de mayor magnitud en el grupo: '+noteworthy.slice(0,4).map(([code,r])=>code+' (T '+r.published+')').join(', ')+'.':
          'Entre los valores documentados, el grupo carece de elevaciones interpretables de T ≥65.';
        const context={
          Clínicas:'Integre el perfil con el motivo, el funcionamiento actual y las condiciones de aplicación.',
          Contenido:'Contraste los temas reconocidos con su duración, su impacto y la historia documentada.',
          Suplementarias:'Explore el funcionamiento interpersonal, los recursos y las estrategias de afrontamiento según la historia.',
          Subescalas:'Lea cada faceta junto con su escala madre. Una elevación aislada en una faceta requiere corroboración.',
          'PSY-5':'Lea las dimensiones en relación con el funcionamiento actual y su persistencia en distintos contextos.'
        };
        push({t:'interp',text:summary+' '+context[group]});
        if(es?.t!=null&&es.t<=39)pText('Es (T '+es.published+'). '+this.readings(es,'Es'));
      }
      if(id)take(id);
      const esCaption=es?es.t==null?' Es conserva PD '+(es.pd??'—')+' y su T queda pendiente.':' Es: '+es.published+'.':'';
      chart('Perfil de '+this.GROUP_TITLES[group].toLocaleLowerCase('es')+'.'+esCaption,{
        kind:group==='PSY-5'?'barh':'profile',labels:codes,series:[{name:'T',data:scores.map(r=>r.t),shown:scores.map(r=>r.published)}],refs:[50,65],yMin:20
      });
    };

    push({t:'title',text:'Informe de evaluación psicológica',subtitle:'Inventario Multifásico de Personalidad de Minnesota-2 (MMPI-2)'});
    for(const section of sections){
      sectionId=section.id;
      push({t:'h1',text:section.numero+'. '+section.titulo});
      switch(section.id){
        case 'encabezado':
          if(institution)pText(institution);
          pText(ai?'Informe contextualizado con IA, sujeto a revisión profesional.':'Informe base de aplicación y corrección.');
          break;
        case 'identificacion':
          push({t:'idbox',rows:[
            ['Evaluado',p.name||'No consta'],...(o.id_document?[['Documento de identidad',p.document||'No consta']]:[]),
            ...(o.id_dob?[['Fecha de nacimiento',this._fmtDate(p.dob)]]:[]),['Edad en la aplicación',p.age??'No consta'],
            ['Sexo normativo',p.sex==='M'?'Mujer':p.sex==='H'?'Hombre':'No consta'],['Fecha de aplicación',this._fmtDate(p.applicationDate)],
            ['Fecha del informe',day],...(o.id_mode?[['Modalidad de aplicación',c.captureMode||'No consta']]:[]),
            ['Contexto de evaluación',p.context||'No consta'],['Evaluador',ev.name||'No consta']
          ]});
          break;
        case 'motivo':pText(field(p.reason));take(section.id);break;
        case 'antecedentes':
          if(o.info_history){if(S.has(p.caseHistory)&&o.info_caseHistory)h2('Antecedentes');pText(field(p.history));}
          if(o.info_caseHistory&&S.has(p.caseHistory)){if(o.info_history)h2('Historia del caso');pText(field(p.caseHistory));}
          take(section.id);break;
        case 'contexto':pText(field(S.context(p)));take(section.id);break;
        case 'tecnica':
          pText('Instrumento de autoinforme de 567 ítems. Referencia normativa seleccionada: '+this.COUNTRY_LABEL[country]+'.');
          pText(this.LEGEND);
          if(S.has(p.sources))pText(field(p.sources));
          take(section.id);break;
        case 'examen':
          pText(field(p.mentalExam));
          if(S.has(p.mentalExam))take(section.id);
          break;
        case 'validez': {
          profile('Validez',section.id);
          if(window.Critical?.EXPLICIT_SUICIDE.some(item=>c.responses?.[item-1]===1)||window.Critical?.RELATED_SUICIDE.some(item=>c.responses?.[item-1]===1)){
            pText('Hay contenidos que requieren indagación clínica directa de seguridad. Documente vigencia, intención, medios y apoyos.');
          }
          break;
        }
        case 'clinicas':profile('Clínicas',section.id);break;
        case 'contenido':profile('Contenido',section.id);break;
        case 'suplementarias':
          profile('Suplementarias',section.id);
          if(o.sec_psy5){h2('Personalidad PSY-5');profile('PSY-5');}
          if(o.sec_clusters){
            h2('Correspondencia con clústeres DSM-5');
            const rows=I.clusterAreas(R).map(a=>({cells:[a.name,a.scales.join(', '),a.max??'—',invalid?'Lectura suspendida':this.levelLabel(a.max)]}));
            table('Correspondencia dimensional orientativa',['Clúster','Dimensiones de referencia','T máxima','Lectura'],rows);
            pText('Correspondencia conceptual para contrastar con entrevista y trayectoria clínica.');
          }
          break;
        case 'subescalas':profile('Subescalas',section.id);break;
        case 'criticos':{
          const records=this.criticalRows(c,o,true);
          if(records.length)table('Contenidos críticos agrupados por tema',
            ['Ítem','Respuesta','Paráfrasis temática',...(o.critical_literal?['Enunciado literal']:[])],
            records.map(row=>({cells:[row.item,row.response,row.theme+' · '+row.summary,...(o.critical_literal?[row.literal||'No consta']:[])]})));
          else pText(Critical.hasResponses(c.responses)?'El registro carece de coincidencias en las familias seleccionadas.':'No constan respuestas para revisar los contenidos críticos.');
          pText('Los contenidos críticos orientan preguntas de entrevista. La valoración actual del riesgo requiere evaluación directa.');
          break;
        }
        case 'integracion':
          if(invalid)pText('La formulación clínica queda pendiente de revisar las condiciones de aplicación y los indicadores de validez.');
          else {
            const eligible=Object.fromEntries(Object.entries(R).filter(([key,score])=>key==='_meta'||score&&!score.verify&&!score.bound));
            const code=I.codeType(eligible);
            if(code)pText('Código descriptivo del perfil clínico: '+code.code+' ('+code.scales.join(', ')+'). '+
              (code.defined?'La separación entre escalas permite describir el patrón principal.':'La cercanía de otras escalas aconseja una lectura conjunta.'));
            pText('Relacione las convergencias del perfil con la cronología, el funcionamiento cotidiano y las fuentes disponibles.');
            if(S.has(p.integration))pText(field(p.integration));
            take(section.id);
          }
          break;
        case 'recursos':
          pText(field(p.strengths));
          if(S.has(p.strengths)||S.interview(c))take(section.id);
          break;
        case 'contraste':
          if(S.has(prior.meta.date))pText('Aplicación anterior del '+this._fmtDate(prior.meta.date)+'.');
          if(S.has(prior.meta.source))pText('Fuente anterior: '+field(prior.meta.source)+'.');
          if(visiblePrior.length)table('Puntuaciones anteriores y actuales documentadas',
            ['Escala','Puntuación anterior','T actual','Diferencia T','Lectura'],
            visiblePrior.map(row=>({cells:[row.code,row.previous,this.score(c,row.code).published,row.delta??'—',row.change]})));
          else pText('Los datos anteriores corresponden a escalas fuera de la selección actual.');
          prior.notes.forEach(pText);
          take(section.id);
          {
            const comparable=visiblePrior.filter(r=>r.delta!=null&&I.GROUP_ORDER.Clínicas.includes(r.code)&&r.code!=='Mf');
            if(comparable.length)chart('Contraste de escalas clínicas con T comparables.',{
              kind:'compare',labels:comparable.map(r=>r.code),refs:[50,65],yMin:20,series:[
                {name:'Actual',data:comparable.map(r=>r.current)},
                {name:'Anterior',data:comparable.map(r=>r.current-r.delta),shown:comparable.map(r=>r.previous)}
              ]
            });
          }
          break;
        case 'impresion':
          if(invalid||!S.interview(c))pText('Formulación tentativa pendiente de una entrevista clínica suficiente y de un protocolo interpretable.');
          else {
            pText(S.has(p.diagnosticImpression)?'Impresión tentativa documentada. '+field(p.diagnosticImpression):'No consta una impresión diagnóstica tentativa documentada.');
            take(section.id);
          }
          break;
        case 'pronostico':
          pText(invalid?'Pronóstico pendiente de integrar con resultados interpretables.':field(p.prognosis));
          take(section.id);break;
        case 'limitaciones':
          pText('La aplicabilidad de la referencia normativa seleccionada depende de la población y de las condiciones de aplicación.');
          if(!S.interview(c))pText('Entrevista clínica suficiente pendiente de documentar.');
          if(S.has(p.limitations))pText(field(p.limitations));
          take(section.id);break;
        case 'conclusiones':
          pText('Estado del protocolo: '+verdict.label+'. La integración final depende de la entrevista y de las fuentes corroboradas.');
          take(section.id);break;
        case 'recomendaciones':
          pText(S.has(p.recommendations)?field(p.recommendations):'Contraste los hallazgos pertinentes con la entrevista y documente las necesidades de seguimiento.');
          take(section.id);break;
        case 'alcance':pText(S.SCOPE);break;
      }
    }
    sectionId=null;
    const references=o.sec_references?[...new Set([
      'Butcher, J. N. et al. (2001). MMPI-2: Manual for administration, scoring, and interpretation. University of Minnesota Press.',
      ...(ai?.references||[])
    ])]:[];
    if(references.length){push({t:'h1',text:'Referencias técnicas'});list(references);}
    push({t:'h1',text:'Evaluador y firma'});
    push({t:'signature',evaluator:ev,place,institution,date:day});
    return {title:(ai?'Informe IA MMPI-2':'Informe MMPI-2')+' · '+(p.name||''),patientName:p.name||'',
      blocks,sections,references,evaluator:ev,place,institution,issues:ai?.issues||[]};
  },

  fromAI(parsed,c,evaluator){
    let ai;
    try{ai=this.parseAI(parsed,c);}
    catch(error){ai={map:new Map(),references:[],issues:[error.message]};}
    return this.build(c,evaluator,null,ai);
  },

  serialize(model){
    const blocks=b=>{
      if(['p','interp','banner','footnote','consolidated'].includes(b.t))return {tipo:'parrafo',contenido:b.text};
      if(b.t==='list')return {tipo:'lista',items:b.items};
      if(b.t==='idbox')return {tipo:'tabla',titulo:'Ficha de identificación',columnas:['Campo','Valor'],filas:b.rows};
      if(b.t==='table')return {tipo:'tabla',titulo:b.caption,columnas:b.columns,filas:b.rows.map(r=>r.cells)};
      if(b.t==='chart')return {tipo:'grafico',figura:b.num,titulo:b.caption,etiquetas:b.spec.labels,series:b.spec.series};
      return null;
    };
    return {titulo:model.title,secciones:model.sections.map(section=>({...section,
      bloques:model.blocks.filter(b=>b.sectionId===section.id).map(blocks).filter(Boolean)})),
      referencias:model.references,
      firma:{nombre:model.evaluator.name||'',lugar:model.place,...(model.institution?{institucion:model.institution}:{})}};
  },

  toText(model){
    return model.blocks.map(b=>{
      if(b.t==='idbox')return b.rows.map(row=>row.join(' · ')).join('\n');
      if(b.t==='table')return ['Tabla '+b.num+'. '+b.caption,b.columns.join(' | '),
        ...b.rows.map(row=>row.cells.join(' | ')),b.footnote].filter(Boolean).join('\n');
      if(b.t==='chart')return 'Figura '+b.num+'. '+b.caption+'\n'+b.spec.series.map(s=>
        s.name+' · '+b.spec.labels.map((label,i)=>label+' '+(s.shown?.[i]??s.data[i]??'—')).join(' | ')).join('\n');
      if(b.t==='list')return b.items.map(item=>'• '+item).join('\n');
      if(b.t==='signature')return [b.institution,b.place,b.date,b.evaluator.name,b.evaluator.license,b.evaluator.registry].filter(Boolean).join('\n');
      if(b.t==='title')return b.text+'\n'+b.subtitle;
      return b.text||'';
    }).filter(Boolean).join('\n\n');
  },

  chartImages(model){
    const images={};
    for(const b of model.blocks)if(b.t==='chart'){
      try{images[b.num]=ReportCharts.toImage(b.spec,900);}
      catch(error){console.warn('No se pudo generar la imagen de la figura',b.num,error);}
    }
    return images;
  }
};
window.ReportModel=ReportModel;

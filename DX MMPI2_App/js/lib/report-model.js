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
  _literalCache:new WeakMap(),
  ES_LOW:'recursos de afrontamiento percibidos reducidos y sensación de vulnerabilidad ante el estrés actual',
  ES_LIMIT_NOTE:'Es: ≤30 corresponde al límite inferior de reporte de la referencia estadounidense. La figura sitúa el resultado en T 30 y conserva el signo ≤. La puntuación se clasifica en rango Bajo.',

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
    const r=(window.MMPI2?.applyReportingLimits?.(c)||c).results?.[code]||{},p=c.patient||{},country=this.country(c);
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

  readings(r,code,invalid=false,sex){
    const t=r.t;
    if(t==null)return code==='Es'&&Number.isFinite(r.pd)?
      'PD '+r.pd+'. Conversión T pendiente en el baremo seleccionado.':
      'Conversión T pendiente. '+Interpret.statusReason(r)+'.';
    switch(code){
      case 'VRIN':return t>=80?'Respuestas contradictorias frecuentes entre afirmaciones de contenido similar u opuesto. La inconsistencia limita la interpretación del perfil.':
        t>=70?'Algunas respuestas contradictorias entre afirmaciones de contenido similar u opuesto; consistencia reducida.':
        'Respuestas coherentes entre afirmaciones de contenido similar u opuesto, sin inconsistencia relevante.';
      case 'TRIN':return t>=80?'Tendencia marcada a responder '+(r.direction==='V'?'«Verdadero»':r.direction==='F'?'«Falso»':'de forma fija')+
        ' con independencia del contenido; el patrón limita la interpretación del perfil.':t>=70?
        'Predominio de respuestas '+(r.direction==='V'?'«Verdadero»':r.direction==='F'?'«Falso»':'fijas')+', con posible influencia del estilo de respuesta en el perfil.':
        t>=60&&r.direction?'Leve predominio de respuestas «'+(r.direction==='V'?'Verdadero':'Falso')+'», sin alcanzar el umbral de inconsistencia relevante.':
        'Sin tendencia relevante a responder sistemáticamente «Verdadero» o «Falso» con independencia del contenido.';
      case 'F':return t>=100?'Reconocimiento extremadamente elevado de experiencias poco frecuentes. El patrón limita la interpretación y puede reflejar malestar intenso o intensificación de síntomas.':
        t>=80?'Reconocimiento muy elevado de experiencias poco frecuentes, compatible con malestar intenso o intensificación de síntomas.':
        t>=65?'Reconocimiento elevado de experiencias poco frecuentes, compatible con malestar emocional importante.':
        'Reconocimiento de experiencias poco frecuentes dentro de los límites habituales de la población de referencia.';
      case 'Fb':return t>=80?'Respuestas poco frecuentes muy elevadas en la parte final del cuestionario, compatibles con malestar intenso o cambios en la forma de responder.':
        t>=65?'Respuestas poco frecuentes elevadas en la parte final del cuestionario, compatibles con malestar emocional.':
        'Respuestas poco frecuentes en la parte final del cuestionario dentro de los límites habituales.';
      case 'Fp':return t>=100?'Reconocimiento extremadamente elevado de experiencias raras incluso en población clínica; la fiabilidad del perfil está comprometida.':
        t>=70?'Reconocimiento elevado de experiencias raras incluso en población clínica, con posible intensificación de síntomas.':
        'Sin elevación relevante de experiencias que son raras incluso en población clínica.';
      case 'L':return t>=80?'Autodescripción excesivamente favorable, con muy escaso reconocimiento de faltas o dificultades cotidianas.':
        t>=65?'Posible presentación favorable de sí '+(sex==='M'?'misma':'mismo')+', con menor reconocimiento de faltas o dificultades cotidianas.':
        'Reconocimiento de faltas o dificultades cotidianas sin una presentación favorable marcada.';
      case 'K':return t>=65?'Posible actitud defensiva o reservada, con tendencia a minimizar dificultades personales.':
        t<=40?'Autodescripción autocrítica y mayor reconocimiento de dificultades personales.':
        'Presentación de las dificultades dentro de límites habituales, sin elevación defensiva marcada.';
      case 'S':return t>=70?'Autodescripción muy positiva, con posible idealización de la propia imagen y minimización de dificultades.':
        'Autodescripción positiva dentro de límites habituales, sin idealización marcada de la propia imagen.';
    }
    if(invalid)return 'Lectura clínica suspendida por los indicadores de validez.';
    if(r.verify)return 'Conversión marcada para verificación. Lectura provisional.';
    if(code==='Es'&&t<=39)return Interpret.cap(this.ES_LOW)+'.';
    return t>=60?Interpret.g((Interpret.KB[code]||{}).s||'',sex):
      t<=39&&Interpret.loText(code,sex)?Interpret.loText(code,sex):'Sin elevación';
  },

  narrative(c,text,o=this.options(c)){
    let value=String(text||'');
    // Se recupera la biblioteca V16; Es mantiene su lectura actual sin un pronóstico automático.
    value=value.replaceAll(Interpret.g(Interpret.KB.Es.lo,c.patient?.sex),this.ES_LOW);
    for(const code of Object.keys(c.results||{})){
      const r=this.score(c,code);
      if(r.t!=null&&r.published!==String(r.t)){
        const escaped=code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        value=value.replace(new RegExp('('+escaped+',?\\s*T\\s*=\\s*)'+r.t+'(?![\\dVF*])','g'),(_,lead)=>lead+r.published);
      }
    }
    return this.cleanText(c,value,o);
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
    const historical=['antecedentes','contraste'].includes(section)||/\b(?:anterior|previ[ao]|Mutalis)\b/i.test(text);
    const previous=historical?[...(o.sec_compare?ReportSections.prior(c).rows:[])]:[];
    if(historical&&window.Previous){
      for(const token of Previous.tokenize([c.patient?.history,c.patient?.caseHistory].filter(Boolean).join('\n'))){
        const parsed=Previous.canonical(token.label,'intl');
        if(parsed&&token.kind==='T')previous.push({code:parsed.code,previous:token.bound+token.value+token.direction+(token.verify?'*':'')});
      }
    }
    const issues=[];
    const check=(label,bound,number,direction='',verify='')=>{
      // PD es la abreviatura de puntuación directa; la escala se escribe Pd.
      if(label.toUpperCase()==='PD'&&label!=='Pd')return;
      const code=known.get(label.toLowerCase());
      if(!code)return;
      const sign=({'<=':'≤','>=':'≥'})[bound]||bound;
      const score=this.score(c,code),provided=sign+number+direction.toUpperCase()+verify;
      if(provided===score.published||previous.some(row=>row.code===code&&row.previous===provided))return;
      issues.push(code+' ('+provided+' frente a '+(score.t==null?'T pendiente':score.published)+')');
    };
    const re=/\b([A-Za-z][A-Za-z0-9-]*)\s*(?:\(\s*)?(?:T\s*(?:(?:[:=]|de)\s*)?|=\s*)(<=|>=|[≤≥<>]?)\s*(\d{1,3})([VF]?)(\*?)(?!\d|[.,]\d)/gi;
    for(const m of String(text).matchAll(re)){
      if(/\bPD\s*\+\s*$/i.test(String(text).slice(0,m.index)))continue;
      check(m[1],m[2],m[3],m[4],m[5]);
    }
    const parenthesized=/\b([A-Za-z][A-Za-z0-9-]*)\s*\(([^()\n]{1,180})\)/g;
    for(const m of String(text).matchAll(parenthesized)){
      const value=/(?:^|[,;]\s*)T\s*(?:[:=]\s*)?(<=|>=|[≤≥<>]?)\s*(\d{1,3})([VF]?)(\*?)(?!\d|[.,]\d)/i.exec(m[2]);
      if(value)check(m[1],value[1],value[2],value[3],value[4]);
    }
    return [...new Set(issues)];
  },

  paragraphs(value,maxWords=135){
    const source=String(value||'').trim();if(!source)return [];
    const output=[];
    for(const raw of source.split(/\n\s*\n/)){
      const sentences=typeof Intl.Segmenter==='function'?
        [...new Intl.Segmenter('es',{granularity:'sentence'}).segment(raw)].map(s=>s.segment.trim()):raw.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/);
      let paragraph='',words=0;
      for(const sentence of sentences){
        const count=sentence.split(/\s+/).length;
        const newTopic=/^(?:El hallazgo|En el área|Respecto de|En cuanto a|En su estilo|Como recurso|De cara a|Estos resultados|Entre las afirmaciones)/.test(sentence);
        if(paragraph&&(words+count>maxWords&&words>=35||newTopic&&words>=65)){
          output.push(paragraph);paragraph='';words=0;
        }
        paragraph+=(paragraph?' ':'')+sentence;words+=count;
      }
      if(paragraph)output.push(paragraph);
    }
    return output;
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
    c=ReportSections.aiCase(c);
    const value=input?.report&&Array.isArray(input.report.secciones)?input.report:input;
    if(!Array.isArray(value?.secciones)||!value.secciones.length||value.secciones.length>80){
      throw new Error('El JSON debe contener un arreglo de secciones con interpretación.');
    }
    const o=this.options(c),plan=ReportSections.plan(c,o),active=new Set(plan.map(x=>x.id));
    const reserved=new Set(['encabezado','identificacion','alcance']);
    if(Interpret.verdict(c.results||{}).status==='NO_INTERPRETABLE'){
      for(const id of active)if(!['tecnica','validez','limitaciones'].includes(id))reserved.add(id);
    }
    if(!ReportSections.has(c.patient?.mentalExam))reserved.add('examen');
    if(!ReportSections.interview(c))reserved.add('impresion');
    const modern=value.secciones.some(s=>s?.id);
    const map=new Map(),issues=[];
    for(const [index,section] of value.secciones.entries()){
      const id=this._sectionId(section);
      if(strict&&modern&&(!id||section.numero!==index+1||map.has(id))){
        throw new Error('Revise los identificadores, las secciones repetidas y la numeración continua del JSON.');
      }
      if(!id)continue;
      const blocks=(!active.has(id)||reserved.has(id))?[]:this._aiBlocks(section,c,o).filter(b=>{
        if(id==='criticos'&&b.t==='table')return false;
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
    c=window.MMPI2?.applyReportingLimits?.(c)||c;
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
    const emitted=new Set();
    const hasAI=id=>Boolean(ai?.map.get(id)?.length)&&(!invalid||['tecnica','validez','limitaciones'].includes(id));
    const take=id=>{
      if(!hasAI(id)||emitted.has(id))return false;
      if(invalid&&id!=='tecnica'&&id!=='validez'&&id!=='limitaciones')return;
      emitted.add(id);
      for(const block of ai?.map.get(id)||[]){
        if(id==='conclusiones'&&['p','interp','consolidated','list'].includes(block.t)){
          const values=block.t==='list'?block.items:[block.text];
          for(const value of values)for(const text of this.paragraphs(value))push({t:'p',text});
        }else if(block.t==='table')table(block.caption,block.columns,block.rows);
        else if(id==='contraste'&&block.text)push({...block,text:Previous.alignComparisonNarrative(block.text,visiblePrior)});
        else if(id==='contraste'&&block.items)push({...block,items:block.items.map(text=>Previous.alignComparisonNarrative(text,visiblePrior))});
        else push(block);
      }
      return true;
    };
    const selectedGroups=this.groups(o);
    const selectedCodes=new Set(selectedGroups.flatMap(group=>I.GROUP_ORDER[group]));
    const selectedResults=Object.fromEntries(Object.entries(R).filter(([code])=>code==='_meta'||selectedCodes.has(code)));
    const narrative=text=>this.narrative(c,text,o);
    const interpretedResults=Object.fromEntries(Object.entries(selectedResults).map(([code,r])=>
      [code,r?.verify?{...r,t:null}:r]));
    const critical=(o.sec_critical||o.sec_critical_lw)?window.Critical?.compute(c.responses,p.sex):null;
    if(critical&&!o.sec_critical)critical.sets.KB={...critical.sets.KB,series:[]};
    const visiblePrior=prior.rows.filter(row=>selectedGroups.some(g=>I.GROUP_ORDER[g].includes(row.code)));
    const profile=(group,id)=>{
      const codes=I.GROUP_ORDER[group].filter(code=>Object.hasOwn(R,code));
      if(!codes.length){pText('No consta un registro de puntuaciones para este grupo.');return;}
      const scores=codes.map(code=>this.score(c,code));
      const header=['Escala','Nombre','PD','PD+K','T','Rango de T',...(o.tbl_descriptors?['Lectura breve']:[])];
      const rows=codes.map((code,i)=>{
        const r=scores[i];
        return {cells:[code,I.name(code),r.pd??'—',r.pdk?r.pdK??'—':'—',r.published,this.levelLabel(r.t,r.bound),
          ...(o.tbl_descriptors?[clean(this.readings(r,code,invalid,p.sex))]:[])],level:this.levelKey(r.t)};
      });
      const pending=codes.filter((code,i)=>scores[i].t==null);
      const es=group==='Suplementarias'?scores[codes.indexOf('Es')]:null;
      const footnotes=[];
      if(pending.length)footnotes.push('Conversión T pendiente en '+pending.join(', ')+'.');
      if(scores.some(r=>r.verify))footnotes.push('* Conversión a verificar en la fuente seleccionada.');
      if(es?.t==null&&Number.isFinite(es?.pd))footnotes.push('Es conserva PD '+es.pd+'.');
      if(es?.reportingLimit==='lower')footnotes.push(this.ES_LIMIT_NOTE);
      table(this.GROUP_TITLES[group]+' · puntuaciones directas (PD), corregidas por K (PD+K) y típicas (T)',header,rows,
        {group,tCol:4,levelCol:5,footnote:footnotes.join(' ')});
      if(group==='Validez'){
        const summary=codes.map((code,i)=>I.name(code)+' ('+code+', T = '+scores[i].published+'). '+clean(this.readings(scores[i],code,false,p.sex))).join(' ');
        if(!hasAI(sectionId))push({t:'interp',text:summary});
        pText('Omisiones registradas: '+(flags.omissions??'No consta')+'. Índice F − K (PD): '+(flags.fk??'No consta')+'.');
        pText('Lectura del protocolo: '+verdict.label+'.');
        const observations=[];
        if(flags.overInvalid||flags.overPossible)observations.push('La infrecuencia elevada puede reflejar malestar intenso o intensificación de síntomas; por sí sola no establece simulación.');
        if(flags.underInvalid||flags.under)observations.push('La posible presentación favorable puede atenuar el reconocimiento de dificultades personales.');
        if(flags.inconsistent||flags.someInconsistency)observations.push('La inconsistencia de respuestas reduce la confianza en la descripción clínica obtenida.');
        if(!hasAI(sectionId))list(observations);
      }else if(invalid){
        pText('Las puntuaciones disponibles se presentan para revisión técnica. La interpretación clínica está suspendida.');
      }else if(!hasAI(sectionId)){
        let text=I.groupParagraph(group,selectedResults,p.sex);
        if(group==='Clínicas'&&I.T(selectedResults,'Mf')>=65){
          const count=codes.filter(code=>code!=='Mf'&&I.T(selectedResults,code)>=65).length;
          text=text.replace(/En las escalas clínicas básicas, (?:\d+ escalas alcanzan|una escala alcanza) un nivel clínicamente significativo \(T ≥ 65\)\./,
            'En las escalas clínicas básicas, '+count+' escalas de contenido clínico presentan T ≥65. Mf se interpreta por separado en intereses y roles, sin clasificarla como elevación psicopatológica.');
        }
        push({t:'interp',text:narrative(text)});
      }
      if(id)take(id);
      const esCaption=es?es.t==null?' Es conserva PD '+(es.pd??'—')+' y su T queda pendiente.':' Es: '+es.published+'.':'';
      chart('Perfil de '+this.GROUP_TITLES[group].toLocaleLowerCase('es')+'.'+esCaption,{
        kind:group==='PSY-5'?'barh':'profile',labels:codes,series:[{name:'T',data:scores.map(r=>r.t),shown:scores.map(r=>r.published)}],refs:[50,65],yMin:20
      });
    };

    push({t:'title',text:'Informe de evaluación psicológica',subtitle:'Inventario Multifásico de Personalidad de Minnesota-2 (MMPI-2)'});
    if(institution)pText(institution);
    for(const section of sections){
      sectionId=section.id;
      push({t:'h1',text:section.numero+'. '+section.titulo});
      switch(section.id){
        case 'identificacion':
          push({t:'idbox',rows:[
            ['Evaluado',p.name||'No consta'],...(o.id_document?[['Documento de identidad',p.document||'No consta']]:[]),
            ...(o.id_dob?[['Fecha de nacimiento',this._fmtDate(p.dob)]]:[]),['Edad en la aplicación',p.age??'No consta'],
            ['Sexo normativo',p.sex==='M'?'Mujer':p.sex==='H'?'Hombre':'No consta'],['Fecha de aplicación',this._fmtDate(p.applicationDate)],
            ['Fecha del informe',day],...(o.id_mode?[['Modalidad de aplicación',c.captureMode||'No consta']]:[]),
            ['Contexto de evaluación',p.context||'No consta'],['Evaluador',ev.name||'No consta']
          ]});
          break;
        case 'motivo':if(!take(section.id))pText(field(p.reason));break;
        case 'antecedentes':
          if(take(section.id))break;
          if(o.info_history){if(S.has(p.caseHistory)&&o.info_caseHistory)h2('Antecedentes');pText(field(p.history));}
          if(o.info_caseHistory&&S.has(p.caseHistory)){if(o.info_history)h2('Historia del caso');pText(field(p.caseHistory));}
          take(section.id);break;
        case 'contexto':if(!take(section.id))pText(field(S.context(p)));break;
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
          profile('Suplementarias');
          if(o.sec_psy5){h2('Personalidad PSY-5');profile('PSY-5');}
          if(o.sec_clusters){
            h2('Correspondencia con clústeres DSM-5');
            const rows=I.clusterAreas(interpretedResults).map(a=>({cells:[a.name,a.scales.join(', '),a.max??'—',invalid?'Lectura suspendida':this.levelLabel(a.max),invalid?'Interpretación suspendida':I.cap(a.desc)]}));
            table('Correspondencia dimensional orientativa',['Clúster','Dimensiones de referencia','T máxima','Rango de T','Rasgos del área'],rows);
            pText('Correspondencia conceptual para contrastar con entrevista y trayectoria clínica.');
            if(!invalid&&!hasAI(section.id))push({t:'interp',text:narrative(I.psy5Paragraph(interpretedResults,p.sex,verdict))});
          }
          take(section.id);
          break;
        case 'subescalas':profile('Subescalas',section.id);break;
        case 'criticos':{
          const records=this.criticalRows(c,o,true);
          if(records.length&&S.preset(c)==='base'&&!o.critical_literal){
            const themes=new Map();
            for(const row of records){const items=themes.get(row.theme)||[];items.push(row);themes.set(row.theme,items);}
            table('Síntesis de contenidos críticos por tema',['Área','Ítems y respuestas','Paráfrasis temática'],
              [...themes].map(([theme,items])=>({cells:[theme,items.map(row=>row.item+row.response).join(', '),[...new Set(items.map(row=>row.summary))].join(' ')]})));
          }else if(records.length)table('Contenidos críticos agrupados por tema',
            ['Ítem','Respuesta','Paráfrasis temática',...(o.critical_literal?['Enunciado literal']:[])],
            records.map(row=>({cells:[row.item,row.response,row.theme+' · '+row.summary,...(o.critical_literal?[row.literal||'No consta']:[])]})));
          else pText(Critical.hasResponses(c.responses)?'El registro carece de coincidencias en las familias seleccionadas.':'No constan respuestas para revisar los contenidos críticos.');
          pText('Los contenidos críticos orientan preguntas de entrevista. La valoración actual del riesgo requiere evaluación directa.');
          take(section.id);
          break;
        }
        case 'integracion':
          if(invalid)pText('La formulación clínica queda pendiente de revisar las condiciones de aplicación y los indicadores de validez.');
          else if(take(section.id))break;
          else {
            h2('Distribución e intensidad de las elevaciones');
            push({t:'interp',text:narrative(I.distributionParagraph(interpretedResults,p.sex))});
            const significant=I.significant(interpretedResults);
            if(significant.some(s=>I.feats(s.code,p.sex).some(([domain])=>domain!=='recursos')))
              push({t:'interp',text:narrative(I.significantParagraph(interpretedResults,p.sex))});
            else if(!significant.length)pText(I.significantParagraph(interpretedResults,p.sex));
            h2('Configuración del perfil clínico');
            const code=I.codeType(interpretedResults),configs=I.configs(interpretedResults);
            pText(code?narrative(code.sentence):'Ninguna escala clínica alcanza T ≥65, por lo que no se establece código del perfil.');
            for(const config of configs)pText(config.name+': '+narrative(config.desc));
            if(S.has(p.integration))pText(field(p.integration));
            take(section.id);
          }
          break;
        case 'recursos':
          if(take(section.id))break;
          if(invalid)pText('La identificación de recursos a partir del inventario queda pendiente de un protocolo interpretable.');
          else {
            const resources=Object.keys(interpretedResults).filter(code=>I.KB[code]?.fav&&I.T(interpretedResults,code)>=65);
            for(const code of resources)pText(narrative(I.ref(code,interpretedResults[code].t)+': '+I.hiText(code,p.sex)+'.'));
            if(S.has(p.strengths))pText(field(p.strengths));
            else if(!resources.length)pText('No constan fortalezas documentadas en entrevista ni elevaciones en las escalas de recursos seleccionadas.');
          }
          break;
        case 'contraste':
          if(invalid)pText('El protocolo actual no es interpretable. Este contraste se limita a la revisión técnica de las puntuaciones documentadas.');
          if(S.has(prior.meta.date))pText('Aplicación anterior del '+this._fmtDate(prior.meta.date)+'.');
          if(S.has(prior.meta.source))pText('Fuente anterior: '+field(prior.meta.source)+'.');
          if(visiblePrior.length)table('Puntuaciones anteriores y actuales documentadas',
            ['Escala','Puntuación anterior','T actual','Diferencia T','Lectura'],
            visiblePrior.map(row=>({cells:[row.code,row.previous,this.score(c,row.code).published,Previous.signedDelta(row.delta),row.change]})));
          else pText('Los datos anteriores corresponden a escalas fuera de la selección actual.');
          Previous.comparisonNotes(visiblePrior).forEach(pText);
          if(hasAI(section.id))h2('Contraste de puntuaciones registradas');
          Previous.comparisonParagraphs(visiblePrior,p,R).forEach(pText);
          if(hasAI(section.id))h2('Integración contextual del contraste');
          take(section.id);
          {
            const plotted=visiblePrior.filter(r=>r.kind==='T'&&Number.isFinite(r.previousValue)&&Number.isFinite(r.current));
            const pending=plotted.some(r=>!r.comparable);
            if(plotted.length)chart(pending?'Contraste documental de T publicadas · comparabilidad pendiente.':'Contraste longitudinal de puntuaciones T comparables.',{
              kind:'compare',labels:plotted.map(r=>r.code),refs:[50,65],yMin:20,colorByValue:false,series:[
                {name:'Actual',data:plotted.map(r=>r.current),shown:plotted.map(r=>this.score(c,r.code).published)},
                {name:pending?'Anterior (publicada)':'Anterior',data:plotted.map(r=>r.previousValue),shown:plotted.map(r=>r.previous)}
              ]
            });
          }
          break;
        case 'impresion':
          if(invalid)pText('Formulación tentativa pendiente de revisar la validez y completar una entrevista clínica suficiente.');
          else if(!S.interview(c))pText('No consta entrevista clínica suficiente para formular una impresión diagnóstica tentativa.');
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
          if(!take(section.id))for(const text of this.paragraphs(narrative([I.consolidated(interpretedResults,p),
            critical?Critical.synthesisSentence(critical,invalid,interpretedResults):''].filter(Boolean).join(' '))))push({t:'consolidated',text});
          break;
        case 'recomendaciones':
          if(hasAI(section.id)){
            const text=ai.map.get(section.id).map(b=>b.text||b.items?.join(' ')||'').join(' ');
            if(critical&&!/riesgo|suicid/i.test(text))list(Critical.recommendations(critical).filter(t=>/riesgo|suicid/i.test(t)).map(narrative));
            take(section.id);break;
          }
          {
            const recommendations=I.recommendations(interpretedResults,verdict,p.sex);
            const criticalRecommendations=critical?Critical.recommendations(critical).filter(text=>
              !(/consumo/i.test(text)&&recommendations.some(item=>/consumo/i.test(item)))):[];
            list([...criticalRecommendations,...recommendations].map(narrative));
          }
          if(S.has(p.recommendations))pText(field(p.recommendations));
          take(section.id);break;
        case 'alcance':pText(S.SCOPE);break;
      }
    }
    sectionId=null;
    const references=o.sec_references?[...new Set([
      ...((ai?.references||[]).some(text=>/Butcher.*2001.*MMPI.2.*Manual/i.test(text))?[]:
        ['Butcher, J. N. et al. (2001). MMPI-2: Manual for administration, scoring, and interpretation. University of Minnesota Press.']),
      ...(ai?.references||[])
    ])]:[];
    if(references.length){push({t:'h1',text:'Referencias técnicas'});list(references);}
    push({t:'h1',text:'Evaluador y firma'});
    push({t:'signature',evaluator:ev,place,institution,date:day});
    const format=ai?'Informe IA MMPI-2':S.preset(c)==='base'?'Informe base MMPI-2':S.preset(c)==='extended'?'Informe extendido MMPI-2':'Informe MMPI-2';
    return {title:format+' · '+(p.name||''),patientName:p.name||'',
      blocks,sections,references,evaluator:ev,place,institution,issues:ai?.issues||[]};
  },

  fromAI(parsed,c,evaluator){
    c=ReportSections.aiCase(c);
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

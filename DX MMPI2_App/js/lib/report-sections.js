/* Selección de contenido y migración de opciones del informe. */
const ReportSections = {
  SCHEMA: 2,
  VERSION: '17.9',
  PRESETS: Object.freeze({
    base:{label:'Base · informe habitual',values:{info_reason:true,info_history:true,info_caseHistory:false,
      sec_charts:true,sec_subscales:false,sec_psy5:true,sec_clusters:false,sec_critical:true,sec_critical_lw:false,
      tbl_descriptors:false,sec_compare:true,sec_recs:true,sec_exam:true,sec_diagnosis:true,sec_strengths:true,sec_prognosis:false,sec_limits:true,sec_references:true}},
    extended:{label:'Extendido · detalle completo',values:{info_reason:true,info_history:true,info_caseHistory:true,
      sec_charts:true,sec_subscales:true,sec_psy5:true,sec_clusters:true,sec_critical:true,sec_critical_lw:true,
      tbl_descriptors:true,sec_compare:true,sec_recs:true,sec_exam:true,sec_diagnosis:true,sec_strengths:true,sec_limits:true,sec_references:true}}
  }),
  DEFAULTS: Object.freeze({
    id_document:true,id_dob:true,id_mode:true,info_reason:true,info_history:true,info_caseHistory:true,info_request_context:false,
    sec_charts:true,sec_subscales:true,sec_psy5:true,sec_clusters:false,sec_critical:true,sec_critical_lw:false,
    critical_literal:false,tbl_descriptors:false,sec_compare:true,sec_recs:true,sec_exam:true,sec_diagnosis:true,
    sec_strengths:true,sec_prognosis:false,sec_limits:true,sec_scope:false,sec_references:true,place:'',institution:''
  }),
  TITLES: Object.freeze({
    encabezado:'Encabezado institucional',identificacion:'Ficha de identificación',motivo:'Motivo y objetivo de la evaluación',
    antecedentes:'Antecedentes e historia del caso',contexto:'Contexto de la solicitud',tecnica:'Técnica, fuentes y control de calidad',
    examen:'Examen mental y observación conductual',validez:'Validez y estilo de respuesta',clinicas:'Escalas clínicas básicas',
    contenido:'Escalas de contenido',suplementarias:'Escalas suplementarias',subescalas:'Subescalas Harris-Lingoes',
    criticos:'Ítems críticos',integracion:'Integración clínica',recursos:'Recursos y fortalezas',contraste:'Contraste longitudinal',
    impresion:'Impresión diagnóstica (tentativa)',pronostico:'Pronóstico',limitaciones:'Limitaciones de la evaluación',
    conclusiones:'Conclusiones',recomendaciones:'Recomendaciones',alcance:'Nota de alcance'
  }),
  SCOPE: 'El presente documento corresponde a una evaluación psicológica clínica con fines diagnósticos y de orientación terapéutica; no constituye dictamen pericial.',

  has(value){return typeof value==='string'&&Boolean(value.trim());},
  context(patient){return patient?.requestContext??patient?.legalContext??'';},
  interview(c){return c.patient?.interviewSufficient===true;},

  preset(c){return Object.hasOwn(this.PRESETS,c?.reportPreset)?c.reportPreset:'custom';},
  applyPreset(c,key){
    if(!Object.hasOwn(this.PRESETS,key))return {...c,reportPreset:'custom'};
    const values={...this.PRESETS[key].values};
    // Contexto, identificación, firma y autorización de literales conservan la selección del evaluador.
    if(key==='extended')values.sec_prognosis=this.interview(c);
    return {...c,reportPreset:key,aiReportOptions:c.aiReportOptions||this.options(c),reportOptions:this.options(c,false,values)};
  },
  aiCase(c){
    if(!c?.aiReportOptions)return c;
    const current=this.options(c),shared={};
    for(const key of ['id_document','id_dob','id_mode','info_request_context','sec_scope','critical_literal','place','institution'])shared[key]=current[key];
    return {...c,reportPreset:'custom',reportOptions:this.options(c,false,{...c.aiReportOptions,...shared})};
  },

  options(c={},legacy=false,override){
    const raw={...c.reportOptions,...override},p=c.patient||{},o={...this.DEFAULTS};
    const bool=(key,fallback)=>typeof raw[key]==='boolean'?raw[key]:fallback;
    for(const key of Object.keys(o)){
      if(typeof raw[key]===typeof o[key])o[key]=raw[key];
    }
    if(legacy||Object.hasOwn(raw,'info_legal')){
      o.info_request_context=bool('info_request_context',bool('info_legal',this.has(this.context(p))));
      o.info_reason=bool('info_reason',this.has(p.reason));
      o.info_history=bool('info_history',this.has(p.history));
      o.info_caseHistory=bool('info_caseHistory',this.has(p.caseHistory));
      o.sec_clusters=bool('sec_clusters',o.sec_psy5);
      o.sec_critical_lw=bool('sec_critical_lw',true);
      o.sec_compare=bool('sec_compare',this.has(p.previousMMPI));
    }
    o.sec_clusters=o.sec_psy5&&o.sec_clusters;
    o.sec_scope=o.info_request_context&&bool('sec_scope',true);
    return o;
  },

  migratePatient(patient){
    if(!patient||!Object.hasOwn(patient,'legalContext'))return patient;
    const {legalContext,...p}=patient;
    return {...p,requestContext:p.requestContext??legalContext};
  },

  migrate(c,legacy=true){
    if(!c||typeof c!=='object')return c;
    c=window.MMPI2?.applyReportingLimits?.(c)||c;
    return {...c,reportSchema:this.SCHEMA,
      patient:this.migratePatient(c.patient),reportOptions:this.options(c,legacy&&c.reportSchema!==this.SCHEMA)};
  },

  change(c,key,value){
    const o={...this.options(c),[key]:value};
    if(key==='info_request_context')o.sec_scope=Boolean(value);
    if(key==='sec_psy5'&&!value)o.sec_clusters=false;
    return this.options(c,false,o);
  },

  prior(c){return window.Previous?.documented(c.patient?.previousMMPI,c.patient,c.results)||{rows:[],notes:[]};},

  plan(c,options=this.options(c),prior=this.prior(c)){
    const p=c.patient||{},o=options;
    const history=o.info_caseHistory&&this.has(p.caseHistory);
    const active={
      motivo:o.info_reason,antecedentes:o.info_history||history,contexto:o.info_request_context,examen:o.sec_exam,
      subescalas:o.sec_subscales,criticos:o.sec_critical||o.sec_critical_lw,recursos:o.sec_strengths,
      contraste:o.sec_compare&&prior.rows.length>0,impresion:o.sec_diagnosis,pronostico:o.sec_prognosis&&this.interview(c),
      limitaciones:o.sec_limits,recomendaciones:o.sec_recs,alcance:o.sec_scope
    };
    const titles={...this.TITLES,
      antecedentes:history?(o.info_history?this.TITLES.antecedentes:'Historia del caso'):'Antecedentes',
      suplementarias:o.sec_psy5?this.TITLES.suplementarias+' y PSY-5':this.TITLES.suplementarias
    };
    return Object.keys(titles).filter(id=>id!=='encabezado'&&active[id]!==false)
      .map((id,index)=>({id,numero:index+1,titulo:titles[id]}));
  },

  catalog(c){
    const o=this.options(c);
    const field=(key,label,reason='')=>({key,label,available:!reason,reason});
    return [
      {group:'Identificación',items:[
        field('id_document','Documento de identidad'),field('id_dob','Fecha de nacimiento'),field('id_mode','Modalidad de aplicación')
      ]},
      {group:'Información del caso',items:[
        field('info_reason','Motivo de evaluación'),field('info_history','Antecedentes'),field('info_caseHistory','Historia del caso'),
        field('info_request_context','Contexto de la solicitud')
      ]},
      {group:'Secciones',items:[
        field('sec_charts','Gráficas'),field('sec_exam','Examen mental y observación conductual'),
        field('sec_psy5','Personalidad PSY-5'),field('sec_clusters','Correspondencia con clústeres DSM-5',o.sec_psy5?'':'Active Personalidad PSY-5'),
        field('sec_subscales','Subescalas Harris-Lingoes'),field('sec_critical','Ítems críticos de Koss-Butcher'),
        field('sec_critical_lw','Ítems críticos de Lachar-Wrobel'),field('critical_literal','Mostrar texto literal de los ítems'),
        field('tbl_descriptors','Descriptor breve por escala en las tablas'),
        field('sec_compare','Comparación con MMPI-2 anterior',this.prior(c).rows.length?'':'Sin datos previos'),
        field('sec_strengths','Recursos y fortalezas'),field('sec_diagnosis','Impresión diagnóstica (tentativa)'),
        field('sec_prognosis','Pronóstico',this.interview(c)?'':'Requiere entrevista clínica suficiente'),
        field('sec_limits','Limitaciones de la evaluación'),field('sec_recs','Recomendaciones'),
        field('sec_scope','Nota de alcance',o.info_request_context?'':'Active Contexto de la solicitud'),field('sec_references','Referencias técnicas')
      ]}
    ];
  }
};
window.ReportSections=ReportSections;

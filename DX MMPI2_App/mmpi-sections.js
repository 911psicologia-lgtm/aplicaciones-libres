/* Selección compartida por el formulario, el prompt y las exportaciones. */
(function (root) {
  'use strict';

  const VERSION = '17.2';
  const defaults = Object.freeze({
    documentId: true, birthDate: true, modality: true, motive: true, antecedents: true, history: true,
    requestContext: false, exam: true, psy5: true, clusters: false, harris_lingoes: true, contenido_sub: true,
    criticalKoss: true, criticalLachar: false, criticalLiteral: false, descriptors: false,
    charts: true, strengths: true, comparison: true, diagnostic: true, prognosis: false,
    limitations: true, recommendations: true, scopeNote: false, references: true
  });
  const controls = Object.freeze([
    ['documentId','Documento de identidad'], ['birthDate','Fecha de nacimiento'],
    ['modality','Modalidad de aplicación'], ['motive','Motivo de evaluación'],
    ['antecedents','Antecedentes'], ['history','Historia del caso'],
    ['requestContext','Contexto de la solicitud'], ['exam','Examen mental y observación conductual'],
    ['psy5','Personalidad PSY-5'], ['clusters','Correspondencia con clústeres DSM-5'],
    ['harris_lingoes','Subescalas Harris-Lingoes'], ['contenido_sub','Componentes de contenido'],
    ['criticalKoss','Ítems críticos de Koss-Butcher'], ['criticalLachar','Ítems críticos de Lachar-Wrobel'],
    ['criticalLiteral','Mostrar texto literal de los ítems'], ['descriptors','Descriptor breve por escala en las tablas'],
    ['charts','Gráficas'], ['strengths','Recursos y fortalezas'],
    ['comparison','Comparación con MMPI-2 anterior'], ['diagnostic','Impresión diagnóstica (tentativa)'],
    ['prognosis','Pronóstico'], ['limitations','Limitaciones de la evaluación'],
    ['recommendations','Recomendaciones'], ['scopeNote','Nota de alcance'], ['references','Referencias técnicas']
  ]);
  const titles = Object.freeze({
    encabezado: 'Encabezado institucional',
    identificacion: 'Ficha de identificación',
    motivo: 'Motivo y objetivo de la evaluación',
    antecedentes: 'Antecedentes e historia del caso',
    contexto: 'Contexto de la solicitud',
    tecnica: 'Técnica, fuentes y control de calidad',
    examen: 'Examen mental y observación conductual',
    validez: 'Validez y estilo de respuesta',
    clinicas: 'Escalas clínicas básicas',
    contenido: 'Escalas de contenido',
    suplementarias: 'Escalas suplementarias',
    subescalas: 'Subescalas Harris-Lingoes',
    criticos: 'Ítems críticos',
    integracion: 'Integración clínica',
    recursos: 'Recursos y fortalezas',
    contraste: 'Contraste longitudinal',
    impresion: 'Impresión diagnóstica (tentativa)',
    pronostico: 'Pronóstico',
    limitaciones: 'Limitaciones de la evaluación',
    conclusiones: 'Conclusiones',
    recomendaciones: 'Recomendaciones',
    alcance: 'Nota de alcance'
  });
  const scopeText = 'El presente documento corresponde a una evaluación psicológica clínica con fines diagnósticos y de orientación terapéutica; no constituye dictamen pericial.';
  const hasText = value => typeof value === 'string' && value.trim().length > 0;
  const normContext = patient => patient?.requestContext ?? patient?.pericialContext ?? '';
  const interview = c => c.patient?.interviewSufficient === true;

  function options(c = {}, legacy = false) {
    const raw = c.reportOptions && typeof c.reportOptions === 'object' ? c.reportOptions : {};
    const out = {...defaults};
    const setting = (key, fallback) => typeof raw[key] === 'boolean' ? raw[key] : fallback;
    for (const key of Object.keys(defaults)) {
      if (typeof raw[key] === 'boolean') out[key] = raw[key];
    }
    for (const key of ['clinicas','contenido','suplementarias']) {
      if (raw[key] === false) out[key] = false;
    }
    if (legacy || 'restructuradas' in raw || 'personality' in raw || 'critical' in raw) {
      out.psy5 = setting('psy5', raw.restructuradas !== false);
      out.clusters = setting('clusters', raw.personality !== false);
      out.criticalKoss = setting('criticalKoss', raw.critical !== false);
      out.criticalLachar = setting('criticalLachar', raw.critical !== false);
    }
    if (legacy || Object.hasOwn(c.patient || {}, 'pericialContext')) {
      out.requestContext = setting('requestContext', setting('pericial', hasText(normContext(c.patient))));
    }
    out.clusters = out.psy5 && out.clusters;
    out.scopeNote = out.requestContext && setting('scopeNote', true);
    return out;
  }

  function migratePatient(patient) {
    if (!patient || !Object.hasOwn(patient, 'pericialContext')) return patient;
    const {pericialContext, ...rest} = patient;
    return {...rest, requestContext: rest.requestContext ?? pericialContext};
  }

  function migrate(c, legacy = false) {
    const previous = c.previousAssessment;
    const snapshot = previous?.contextSnapshot;
    return {
      ...c,
      patient: migratePatient(c.patient),
      reportOptions: options(c, legacy),
      ...(Array.isArray(c.previousReports) ? {previousReports:c.previousReports.map(report=>
        report?.patient ? {...report,patient:migratePatient(report.patient)} : report)} : {}),
      ...(snapshot?.patient ? {previousAssessment: {...previous, contextSnapshot: {...snapshot, patient: migratePatient(snapshot.patient)}}} : {})
    };
  }

  function changeOption(c, key, checked) {
    const next = {...options(c), [key]: Boolean(checked)};
    if (key === 'psy5' && !checked) next.clusters = false;
    if (key === 'requestContext') next.scopeNote = Boolean(checked);
    return options({...c, reportOptions: next});
  }

  function hasPrevious(c) {
    return Boolean(c.previousAssessment?.scores?.some(row => Number.isFinite(row.T)) ||
      c.comparisonData?.some(row => /^[≤≥]?[0-9]{1,3}[VF]?\*?$/.test(String(row.previous || ''))));
  }

  function controlState(c, key) {
    const o = options(c);
    const reason =
      key === 'clusters' && !o.psy5 ? 'Active Personalidad PSY-5' :
      key === 'comparison' && !hasPrevious(c) ? 'Sin datos previos' :
      key === 'scopeNote' && !o.requestContext ? 'Active Contexto de la solicitud' :
      key === 'prognosis' && !interview(c) ? 'Requiere entrevista clínica suficiente' : '';
    return {checked: !reason && o[key], disabled: Boolean(reason), reason};
  }

  function plan(c) {
    const o = options(c);
    const history = o.history && hasText(c.patient?.caseHistory);
    const active = {
      motivo: o.motive, antecedentes: o.antecedents || history, contexto: o.requestContext, examen: o.exam,
      clinicas: o.clinicas !== false, contenido: o.contenido !== false || o.contenido_sub,
      suplementarias: o.suplementarias !== false || o.psy5,
      subescalas: o.harris_lingoes, criticos: o.criticalKoss || o.criticalLachar, recursos: o.strengths,
      contraste: o.comparison && hasPrevious(c), impresion: o.diagnostic,
      pronostico: o.prognosis && interview(c), limitaciones: o.limitations,
      recomendaciones: o.recommendations, alcance: o.scopeNote
    };
    const label = id => {
      if (id === 'antecedentes') return history ? (o.antecedents ? titles.antecedentes : 'Historia del caso') : 'Antecedentes';
      if (id === 'contenido' && o.contenido === false) return 'Componentes de contenido';
      if (id === 'suplementarias' && o.suplementarias === false) return 'Personalidad PSY-5';
      if (id === 'suplementarias' && o.psy5) return titles.suplementarias + ' y PSY-5';
      return titles[id];
    };
    return Object.keys(titles).filter(id => active[id] !== false)
      .map((id, i) => ({id, numero: i + 1, titulo: label(id)}));
  }

  root.MMPI2Sections = {VERSION, defaults, controls, titles, scopeText, hasText, normContext,
    interview, options, migrate, changeOption, hasPrevious, controlState, plan};
})(globalThis);

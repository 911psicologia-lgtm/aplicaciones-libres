/* ============================================
   ReportModel — estructura única del informe MMPI-2
   Un solo modelo alimenta la pantalla, HTML, Word y PDF.

   Orden del informe:
     Encabezado
     1. Datos de identificación (un solo cuadro con divisiones)
     2. Información del caso (campos seleccionables)
     3. Perfil de escalas — por grupo: tabla → interpretación → gráfica
     4. Análisis de resultados — misma dinámica
     5. Síntesis integradora (prosa, sin valores ni siglas)
     6. Recomendaciones (opcional)
     Evaluador: datos y firma (al final)
   ============================================ */

const ReportModel = {

  /* Opciones por defecto (qué incluir). Se guardan en case.reportOptions */
  defaultOptions(caseData) {
    const p = (caseData && caseData.patient) || {};
    return {
      id_document: true,
      id_dob: true,
      id_mode: true,
      info_reason: !!(p.reason && p.reason.trim()),
      info_history: !!(p.history && p.history.trim()),
      info_caseHistory: !!(p.caseHistory && p.caseHistory.trim()),
      info_legal: !!(p.legalContext && p.legalContext.trim()),
      sec_subscales: true,
      sec_compare: !!(p.previousMMPI && p.previousMMPI.trim()),
      sec_recs: true,
      sec_charts: true,
      tbl_descriptors: false,
      place: '',
    };
  },

  options(caseData) {
    return Object.assign(this.defaultOptions(caseData), (caseData && caseData.reportOptions) || {});
  },

  /* Catálogo para la interfaz de selección */
  optionCatalog(caseData) {
    const p = (caseData && caseData.patient) || {};
    const has = (v) => !!(v && String(v).trim());
    return [
      { group: 'Identificación', items: [
        { key: 'id_document', label: 'Documento de identidad', available: has(p.document) },
        { key: 'id_dob', label: 'Fecha de nacimiento', available: has(p.dob) },
        { key: 'id_mode', label: 'Modalidad de aplicación', available: has(caseData && caseData.captureMode) },
      ] },
      { group: 'Información del caso', items: [
        { key: 'info_reason', label: 'Motivo de evaluación', available: has(p.reason) },
        { key: 'info_history', label: 'Antecedentes', available: has(p.history) },
        { key: 'info_caseHistory', label: 'Historia del caso', available: has(p.caseHistory) },
        { key: 'info_legal', label: 'Contexto pericial', available: has(p.legalContext) },
      ] },
      { group: 'Secciones', items: [
        { key: 'sec_charts', label: 'Gráficas', available: true },
        { key: 'sec_subscales', label: 'Subescalas Harris-Lingoes', available: true },
        { key: 'tbl_descriptors', label: 'Descriptor breve por escala en las tablas', available: true },
        { key: 'sec_compare', label: 'Comparación con MMPI-2 anterior', available: has(p.previousMMPI) },
        { key: 'sec_recs', label: 'Recomendaciones', available: true },
      ] },
    ];
  },

  COUNTRY_LABEL: {
    US: 'Estadounidense (muestra normativa de Minnesota, N = 2.600)',
    MX: 'Mexicano (Lucio, Reyes-Lagunes y Scott)',
    ES: 'Español (TEA Ediciones)',
  },

  GROUP_TITLES: {
    Validez: 'Escalas de validez',
    Clínicas: 'Escalas clínicas básicas',
    Contenido: 'Escalas de contenido',
    Suplementarias: 'Escalas suplementarias',
    Subescalas: 'Subescalas de Harris-Lingoes y de Introversión social',
  },

  _fmtDate(iso) {
    if (!iso) return '—';
    const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00') : new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  },

  levelLabel(t) {
    if (typeof t !== 'number') return '—';
    if (t >= 70) return 'Muy alto';
    if (t >= 60) return 'Alto';
    if (t >= 56) return 'Promedio-superior';
    if (t >= 40) return 'Medio';
    return 'Bajo';
  },
  levelKey(t) {
    if (typeof t !== 'number') return 'nd';
    if (t >= 70) return 'vh';
    if (t >= 60) return 'h';
    if (t >= 56) return 'ps';
    if (t >= 40) return 'm';
    return 'lo';
  },

  /* ============================================
     BUILD
     ============================================ */
  build(caseData, evaluator, optsOverride) {
    const I = window.Interpret;
    const p = caseData.patient || {};
    const R = caseData.results || {};
    const ev = evaluator || {};
    const o = Object.assign(this.options(caseData), optsOverride || {});
    const sex = p.sex;
    const country = (p.country === 'ES' || p.country === 'US' || p.country === 'MX') ? p.country : 'US';
    const blocks = [];
    let fig = 0, tab = 0, sec = 0;
    const H1 = (text) => blocks.push({ t: 'h1', text: `${++sec}. ${text}` });
    const H2 = (num, text) => blocks.push({ t: 'h2', text: `${num} ${text}` });

    // ---- Encabezado ----
    blocks.push({ t: 'title', text: 'Informe de evaluación psicológica', subtitle: 'Inventario Multifásico de Personalidad de Minnesota-2 (MMPI-2)' });

    // ---- 1. Identificación ----
    H1('Datos de identificación');
    const idRows = [['Nombre', p.name || '—']];
    if (o.id_document) idRows.push(['Documento', p.document || '—']);
    if (o.id_dob) idRows.push(['Fecha de nacimiento', this._fmtDate(p.dob)]);
    idRows.push(['Edad', p.age != null ? p.age + ' años' : '—']);
    idRows.push(['Sexo', sex === 'M' ? 'Mujer' : (sex === 'H' ? 'Hombre' : '—')]);
    idRows.push(['Contexto de evaluación', p.context || '—']);
    idRows.push(['Fecha de aplicación', this._fmtDate(p.applicationDate)]);
    idRows.push(['Fecha del informe', this._fmtDate(new Date().toISOString())]);
    idRows.push(['Baremo', this.COUNTRY_LABEL[country]]);
    if (o.id_mode) idRows.push(['Modalidad', caseData.captureMode === 'Excel' ? 'Respuestas cargadas desde hoja de cálculo' : (caseData.captureMode || '—')]);
    idRows.push(['Evaluador/a', ev.name || '—']);
    blocks.push({ t: 'idbox', rows: idRows });

    // ---- 2. Información del caso ----
    const infoFields = [];
    if (o.info_reason && p.reason) infoFields.push(['Motivo de evaluación', p.reason]);
    if (o.info_history && p.history) infoFields.push(['Antecedentes', p.history]);
    if (o.info_caseHistory && p.caseHistory) infoFields.push(['Historia del caso', p.caseHistory]);
    if (o.info_legal && p.legalContext) infoFields.push(['Contexto pericial', p.legalContext]);
    if (infoFields.length) {
      H1('Información del caso');
      infoFields.forEach(([label, text]) => blocks.push({ t: 'field', label, text }));
    }

    // ---- 3. Perfil de escalas ----
    const validity = I.verdict(R);
    const covAll = I.coverage(R);
    H1('Perfil de escalas');
    blocks.push({ t: 'p', cls: 'note', text: `Puntuaciones T obtenidas con el baremo ${this.COUNTRY_LABEL[country].toLowerCase()}. Se considera clínicamente significativa una puntuación T ≥ 65; el rango 60–64 se interpreta como elevación moderada. Escalas con T documentada: ${covAll.documented} de ${covAll.total}.` });
    if (validity.status === 'NO_INTERPRETABLE') {
      blocks.push({ t: 'banner', level: 'danger', text: 'Protocolo no interpretable: ' + (validity.reasons || []).join(' ') + ' Las interpretaciones de las escalas sustantivas se presentan solo a título descriptivo.' });
    }
    const groups = ['Validez', 'Clínicas', 'Contenido', 'Suplementarias'].concat(o.sec_subscales ? ['Subescalas'] : []);
    groups.forEach((g, gi) => {
      const num = `${sec}.${gi + 1}`;
      const codes = I.GROUP_ORDER[g].filter(c => R[c]);
      if (!codes.length) return;
      H2(num, this.GROUP_TITLES[g]);
      const cov = I.coverage(R, codes);
      // Tabla
      const columns = ['Escala', 'Nombre', 'PD', 'PD+K', 'T', 'Nivel'].concat(o.tbl_descriptors ? ['Lectura breve'] : []);
      const rows = codes.map(c => {
        const r = R[c];
        const tv = typeof r.t === 'number' ? r.t : null;
        const pdk = r.pdk ? (r.pdK != null ? r.pdK : '—') : '—';
        const desc = o.tbl_descriptors ? [tv == null ? I.statusReason(r) : (tv >= 60 ? I.g((I.KB[c] || {}).s || '', sex) : (tv <= 39 && I.loText(c, sex) ? I.loText(c, sex) : 'Sin elevación'))] : [];
        return { cells: [c, g === 'Validez' ? I.VALIDITY_NAMES[c] : I.name(c), r.pd != null ? r.pd : '—', pdk, tv != null ? (r.verify ? tv + '*' : tv) : 'N/D', this.levelLabel(tv)].concat(desc), level: this.levelKey(tv) };
      });
      const notes = [];
      if (cov.missing.length) notes.push(`T documentada en ${cov.documented} de ${cov.total} escalas.`);
      if (cov.verify.length) notes.push('* T a verificar: la puntuación directa cae en un tramo de la tabla del baremo con inconsistencias; confírmela en el manual o en el sistema oficial de corrección.');
      if (g === 'Clínicas' && R.Mf && R.Mf.key && R.Mf.key !== 'Mf') notes.push(`Mf corregida con la clave femenina (${R.Mf.key}).`);
      blocks.push({ t: 'table', num: ++tab, caption: `${this.GROUP_TITLES[g]}: puntuaciones directas (PD), corregidas por K (PD+K) y típicas (T)`, columns, rows, tCol: 4, levelCol: 5, footnote: notes.length ? notes.join(' ') : null });
      // Interpretación
      blocks.push({ t: 'interp', title: 'Interpretación', text: I.groupParagraph(g, R, sex) });
      // Gráfica
      if (o.sec_charts) {
        blocks.push({ t: 'chart', num: ++fig, caption: `Perfil de ${this.GROUP_TITLES[g].toLowerCase()}`, spec: {
          kind: 'profile', labels: codes, series: [{ name: 'T', data: codes.map(c => I.T(R, c)) }], refs: [50, 65], yMin: 30,
        } });
      }
    });

    // ---- 4. Análisis de resultados ----
    H1('Análisis de resultados');
    let an = 0;
    // 4.1 Validez y estilo de respuesta
    {
      const fl = I.validityFlags(R, R._meta ? R._meta.omissions : null);
      H2(`${sec}.${++an}`, 'Validez y estilo de respuesta');
      const vRows = [];
      const fmt = (v) => v == null ? 'N/D' : v;
      if (fl.omissions != null) vRows.push({ cells: ['Ítems sin responder', fl.omissions, '≥ 30 invalida; 10–29 cautela', fl.invalidOmit ? 'Invalidante' : (fl.cautionOmit ? 'Cautela' : 'Adecuado')], level: fl.invalidOmit ? 'vh' : (fl.cautionOmit ? 'h' : 'm') });
      vRows.push({ cells: ['Consistencia (VRIN / TRIN)', `${fmt(fl.V)} / ${fmt(fl.TR)}`, 'T ≥ 80 invalida; 70–79 cautela', fl.inconsistent ? 'Inconsistente' : (fl.someInconsistency ? 'Cautela' : 'Consistente')], level: fl.inconsistent ? 'vh' : (fl.someInconsistency ? 'h' : 'm') });
      vRows.push({ cells: ['Sobrerreporte (F / Fb / Fp)', `${fmt(fl.F)} / ${fmt(fl.Fb)} / ${fmt(fl.Fp)}`, 'F ≥ 80 o Fp ≥ 70: posible exageración', fl.overInvalid ? 'Probable exageración' : (fl.overPossible ? 'Posible amplificación' : (fl.openDistress ? 'Reconoce malestar' : 'Sin indicios'))], level: fl.overInvalid ? 'vh' : (fl.overPossible ? 'h' : 'm') });
      vRows.push({ cells: ['Infrarreporte (L / K / S)', `${fmt(fl.L)} / ${fmt(fl.K)} / ${fmt(fl.S)}`, 'L ≥ 65, K ≥ 65 o S ≥ 70: defensividad', fl.underInvalid ? 'Defensividad invalidante' : (fl.under ? 'Defensividad' : (fl.selfCritical ? 'Autocrítica' : 'Sin indicios'))], level: fl.underInvalid ? 'vh' : (fl.under ? 'h' : 'm') });
      if (fl.fk != null) vRows.push({ cells: ['Índice F − K (PD)', (fl.fk > 0 ? '+' : '') + fl.fk, '≥ +11 exageración; ≤ −11 defensividad', fl.fk >= 11 ? 'Exageración' : (fl.fk <= -11 ? 'Defensividad' : 'Rango esperado')], level: Math.abs(fl.fk) >= 11 ? 'h' : 'm' });
      blocks.push({ t: 'table', num: ++tab, caption: 'Indicadores de validez del protocolo', columns: ['Indicador', 'Valor', 'Criterio', 'Lectura'], rows: vRows, levelCol: 3 });
      let txt = `El conjunto de indicadores permite considerar el protocolo ${validity.label}.`;
      if (validity.status === 'NO_INTERPRETABLE') txt += ' Motivos: ' + validity.reasons.join(' ') + ' Las puntuaciones clínicas se presentan solo de forma descriptiva y no deben sustentar conclusiones sin corroboración externa.';
      else if (fl.overPossible) txt += ' El patrón de sobrerreporte no alcanza el nivel invalidante, pero aconseja leer la magnitud de las elevaciones clínicas como un límite superior y buscar convergencia con otras fuentes antes de afirmar la intensidad de los síntomas.';
      if (fl.under) txt += ' La tendencia defensiva implica que las elevaciones observadas probablemente subestiman el malestar real.';
      if (!fl.overPossible && !fl.under && validity.status === 'INTERPRETABLE') txt += ' No hay indicios de exageración ni de minimización, por lo que las puntuaciones clínicas pueden interpretarse de forma directa.';
      blocks.push({ t: 'interp', title: 'Interpretación', text: txt });
      if (o.sec_charts) {
        const vc = ['VRIN', 'TRIN', 'F', 'Fb', 'Fp', 'L', 'K', 'S'].filter(c => R[c]);
        blocks.push({ t: 'chart', num: ++fig, caption: 'Indicadores de validez ordenados de mayor a menor', spec: {
          kind: 'barh', labels: vc.slice().sort((a, b) => (I.T(R, b) || 0) - (I.T(R, a) || 0)), series: [{ name: 'T', data: [] }], refs: [50, 65],
        } });
        const last = blocks[blocks.length - 1].spec; last.series[0].data = last.labels.map(c => I.T(R, c));
      }
    }
    // 4.2 Distribución
    {
      H2(`${sec}.${++an}`, 'Distribución de las elevaciones por grupo de escalas');
      const dist = I.distribution(R).filter(r => r.group !== 'Validez' && (o.sec_subscales || r.group !== 'Subescalas'));
      blocks.push({ t: 'table', num: ++tab, caption: 'Número de escalas por nivel de puntuación T', columns: ['Grupo', 'Escalas', 'T documentada', 'Muy alto (≥ 70)', 'Alto (60–69)', 'Prom.-sup. (56–59)', 'Medio (40–55)', 'Bajo (≤ 39)'],
        rows: dist.map(r => ({ cells: [this.GROUP_TITLES[r.group].replace(' de Harris-Lingoes y de Introversión social', ''), r.total, r.documented, r.vh, r.h, r.ps, r.m, r.lo] })) });
      blocks.push({ t: 'interp', title: 'Interpretación', text: I.distributionParagraph(R, sex) });
      if (o.sec_charts) {
        const short = { Clínicas: 'Clínicas', Contenido: 'Contenido', Suplementarias: 'Suplementarias', Subescalas: 'Subescalas' };
        blocks.push({ t: 'chart', num: ++fig, caption: 'Distribución de escalas por nivel en cada grupo', spec: {
          kind: 'stacked', labels: dist.map(r => short[r.group]),
          series: [
            { name: 'Muy alto (≥70)', data: dist.map(r => r.vh) }, { name: 'Alto (60–69)', data: dist.map(r => r.h) },
            { name: 'Prom.-sup. (56–59)', data: dist.map(r => r.ps) }, { name: 'Medio (40–55)', data: dist.map(r => r.m) },
            { name: 'Bajo (≤39)', data: dist.map(r => r.lo) },
          ],
        } });
      }
    }
    // 4.3 Escalas significativas
    {
      H2(`${sec}.${++an}`, 'Escalas con elevación clínicamente significativa');
      let sig = I.significant(R);
      if (!o.sec_subscales) sig = sig.filter(s => s.group !== 'Subescalas');
      if (sig.length) {
        blocks.push({ t: 'table', num: ++tab, caption: 'Escalas sustantivas con T ≥ 65, de mayor a menor', columns: ['Escala', 'Nombre', 'Grupo', 'T', 'Nivel'],
          rows: sig.map(s => ({ cells: [s.code, I.name(s.code), s.group, s.t, this.levelLabel(s.t)], level: this.levelKey(s.t) })), tCol: 3, levelCol: 4 });
      }
      blocks.push({ t: 'interp', title: 'Interpretación', text: I.significantParagraph(R, sex) });
      if (o.sec_charts && sig.length) {
        blocks.push({ t: 'chart', num: ++fig, caption: 'Escalas con elevación clínicamente significativa', spec: {
          kind: 'barh', labels: sig.map(s => s.code), series: [{ name: 'T', data: sig.map(s => s.t) }], refs: [65],
        } });
      }
    }
    // 4.4 Configuración del perfil clínico
    {
      H2(`${sec}.${++an}`, 'Configuración del perfil clínico');
      const ct = I.codeType(R);
      const cfgs = I.configs(R);
      const rows = [];
      rows.push({ cells: ['Código de dos puntos', ct ? ct.code + ' (' + ct.scales.join('-') + ')' : 'Sin elevaciones ≥ 65', ct ? (ct.defined ? 'Bien definido' : 'Poco definido') : '—'] });
      if (cfgs.length) cfgs.forEach(c => rows.push({ cells: ['Configuración', c.name, c.desc] }));
      else rows.push({ cells: ['Configuraciones clásicas', 'No se detectan', '—'] });
      blocks.push({ t: 'table', num: ++tab, caption: 'Código del perfil y configuraciones', columns: ['Indicador', 'Resultado', 'Lectura'], rows });
      let txt = ct ? ct.sentence : 'Ninguna escala clínica alcanza T ≥ 65, por lo que no se establece código del perfil.';
      if (cfgs.length) txt += ` Además, se ${cfgs.length === 1 ? 'identifica la siguiente configuración' : 'identifican las siguientes configuraciones'}. ` + cfgs.map(c => `${c.name}: ${c.desc}`).join(' ');
      if (validity.status === 'NO_INTERPRETABLE') txt = 'Dado que el protocolo no es interpretable, no se establece código ni configuración del perfil.';
      blocks.push({ t: 'interp', title: 'Interpretación', text: txt });
      if (o.sec_charts) {
        const clin = ['Hs', 'D', 'Hy', 'Pd', 'Pa', 'Pt', 'Sc', 'Ma'].filter(c => I.T(R, c) != null).sort((a, b) => I.T(R, b) - I.T(R, a));
        blocks.push({ t: 'chart', num: ++fig, caption: 'Escalas clínicas ordenadas de mayor a menor (excluidas Mf y Si)', spec: {
          kind: 'barh', labels: clin, series: [{ name: 'T', data: clin.map(c => I.T(R, c)) }], refs: [50, 65],
        } });
      }
    }
    // 4.5 Comparación
    if (o.sec_compare && p.previousMMPI) {
      const anC = I.comparisonAnalysis(R, p.previousMMPI, p);
      const rowsC = anC.rows;
      if (rowsC.length) {
        H2(`${sec}.${++an}`, 'Comparación con la aplicación anterior');
        blocks.push({ t: 'table', num: ++tab, caption: 'Cambio entre aplicaciones (Δ = T actual − T anterior)', columns: ['Escala', 'Nombre', 'T anterior', 'T actual', 'Δ', 'Cambio'],
          rows: rowsC.map(r => ({ cells: [r.code, I.name(r.code), r.prev == null ? `No comparable (${r.prevRaw} ${r.prevLabel})` : (r.approx ? `≈ ${r.prev} (${r.prevRaw} ${r.prevLabel})` : (r.kind !== 'T' ? `${r.prev} (desde PD ${r.prevRaw})` : r.prev)), r.cur != null ? r.cur : 'N/D', r.delta == null ? '—' : (r.approx ? '≈ ' : '') + (r.delta > 0 ? '+' : '') + r.delta, r.change], level: r.delta == null ? null : (r.delta >= 10 ? 'vh' : (r.delta <= -10 ? 'lo' : 'm')) })), levelCol: 5,
          footnote: [
            rowsC.some(r => r.approx) ? '≈ Valor anterior convertido de forma aproximada por su puntuación directa implicada (ver interpretación).' : '',
            !anC.srcCountry ? 'Baremo de la aplicación anterior: no consta.' : `Baremo de la aplicación anterior: ${Previous.COUNTRY_LABEL[anC.srcCountry]}.`,
            anC.meta.date ? `Fecha de la aplicación anterior: ${Previous._fmtDate(anC.meta.date)}.` : 'Fecha de la aplicación anterior: no consta.',
          ].filter(Boolean).join(' ') });
        blocks.push({ t: 'interp', title: 'Interpretación', text: I.comparisonParagraph(R, p.previousMMPI, p) });
        if (o.sec_charts) {
          blocks.push({ t: 'chart', num: ++fig, caption: 'Comparación entre la aplicación actual y la anterior', spec: {
            kind: 'compare', labels: rowsC.map(r => r.code), series: [{ name: 'T actual', data: rowsC.map(r => r.cur) }, { name: 'T anterior' + (rowsC.some(r => r.approx) ? ' (≈ convertida)' : ''), data: rowsC.map(r => r.prev) }], refs: [65], yMin: 30,
          } });
        }
      }
    }

    // ---- 5. Síntesis integradora ----
    H1('Síntesis integradora');
    blocks.push({ t: 'consolidated', text: I.consolidated(R, p) });

    // ---- 6. Recomendaciones ----
    if (o.sec_recs) {
      H1('Recomendaciones');
      blocks.push({ t: 'list', items: I.recommendations(R, validity, sex) });
    }

    // ---- Evaluador y firma (al final) ----
    blocks.push({ t: 'signature', evaluator: {
      name: ev.name || '', profession: ev.profession || 'Psicólogo/a', license: ev.license || '', registry: ev.registry || '',
      email: ev.email || '', phone: ev.phone || '', address: ev.address || '', signature: ev.signature || null,
    }, place: o.place || ev.city || '', date: this._fmtDate(new Date().toISOString()) });

    blocks.push({ t: 'footnote', text: `Informe elaborado con la aplicación MMPI-2 a partir de las respuestas del evaluado y del baremo ${this.COUNTRY_LABEL[country].toLowerCase()}. Las interpretaciones son hipótesis actuariales basadas en Butcher et al. (2001) y Graham (2012), deben integrarse con el juicio profesional y no constituyen por sí solas un diagnóstico. Documento confidencial: su uso está restringido al propósito de la evaluación.` });

    return { title: 'Informe MMPI-2 — ' + (p.name || ''), patientName: p.name || '', blocks, validity, coverage: covAll };
  },

  /* ---------- Modelo a partir del JSON de la IA externa ----------
     Permite exportar el informe IA con el mismo motor (Word/PDF/HTML),
     con gráficas reales y la firma al final. */
  fromAI(parsed, caseData, evaluator) {
    const p = (caseData && caseData.patient) || {};
    const ev = evaluator || {};
    const meta = parsed.metadatos || {};
    const blocks = [];
    blocks.push({ t: 'title', text: parsed.titulo || 'Informe de valoración psicológica · MMPI-2', subtitle: 'Inventario Multifásico de Personalidad de Minnesota-2 (MMPI-2)' });
    blocks.push({ t: 'idbox', rows: [
      ['Evaluado/a', meta.evaluado || p.name || '—'], ['Documento', meta.documento || p.document || '—'],
      ['Edad', meta.edad || (p.age != null ? p.age + ' años' : '—')], ['Sexo', meta.sexo || (p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : '—'))],
      ['Fecha de aplicación', meta.fecha_aplicacion || this._fmtDate(p.applicationDate)], ['Contexto', meta.contexto || p.context || '—'],
      ['Evaluador/a', meta.evaluador || ev.name || '—'], ['Fecha del informe', meta.fecha_informe || this._fmtDate(new Date().toISOString())],
    ] });
    let tab = 0, autoFig = 100;
    (parsed.secciones || []).forEach((sec, i) => {
      const n = sec.numero != null ? sec.numero : i + 1;
      // La identificación ya está en el cuadro superior
      if (/^ficha de identificaci|^datos de identificaci/i.test(sec.titulo || '')) return;
      blocks.push({ t: 'h1', text: `${n}. ${sec.titulo || 'Sección ' + n}` });
      const bloques = Array.isArray(sec.bloques) && sec.bloques.length ? sec.bloques : (sec.contenido ? [{ tipo: 'parrafo', contenido: sec.contenido }] : []);
      for (const b of bloques) {
        const tipo = (b && b.tipo || '').toLowerCase();
        if (tipo === 'parrafo' || (!tipo && b.contenido)) {
          String(b.contenido || '').split(/\n{2,}/).map(x => x.trim()).filter(Boolean).forEach(par => blocks.push({ t: 'p', text: par }));
        } else if (tipo === 'tabla') {
          const columns = Array.isArray(b.columnas) ? b.columnas.map(String) : [];
          const rows = (Array.isArray(b.filas) ? b.filas : []).map(r => ({ cells: (Array.isArray(r) ? r : [r]).map(c => c == null ? '' : String(c)) }));
          if (columns.length || rows.length) {
            const nc = Math.max(columns.length, ...rows.map(r => r.cells.length));
            rows.forEach(r => { while (r.cells.length < nc) r.cells.push(''); });
            blocks.push({ t: 'table', num: ++tab, caption: b.titulo || '', columns: columns.length ? columns : Array(nc).fill(''), rows });
          }
        } else if (tipo === 'grafico') {
          const spec = window.Report && Report._aiBlockToSpec ? Report._aiBlockToSpec(b) : null;
          if (spec) blocks.push({ t: 'chart', num: b.figura != null ? b.figura : ++autoFig, caption: b.titulo || '', spec });
        } else if (tipo === 'lista' || tipo === 'referencias') {
          if (b.titulo) blocks.push({ t: 'p', text: b.titulo });
          const items = (Array.isArray(b.items) ? b.items : []).map(x => typeof x === 'string' ? x : JSON.stringify(x));
          if (items.length) blocks.push({ t: 'list', items });
        }
      }
    });
    if (Array.isArray(parsed.referencias) && parsed.referencias.length) {
      blocks.push({ t: 'h1', text: 'Referencias' });
      blocks.push({ t: 'list', items: parsed.referencias.map(r => typeof r === 'string' ? r : JSON.stringify(r)) });
    }
    const f = parsed.firma || {};
    blocks.push({ t: 'signature', evaluator: {
      name: f.nombre || ev.name || '', profession: f.profesion || ev.profession || 'Psicólogo/a', license: ev.license || '', registry: f.registro || ev.registry || '',
      email: f.correo || ev.email || '', phone: f.telefono || ev.phone || '', address: f.direccion || ev.address || '', signature: ev.signature || null,
    }, place: ev.city || '', date: this._fmtDate(new Date().toISOString()) });
    return { title: 'Informe IA MMPI-2 — ' + (p.name || ''), patientName: meta.evaluado || p.name || '', blocks };
  },

  /* Generar imágenes PNG de todas las gráficas del modelo (para exportar) */
  chartImages(model) {
    const imgs = {};
    for (const b of model.blocks) {
      if (b.t !== 'chart') continue;
      try { imgs[b.num] = window.ReportCharts.toImage(b.spec, 900); }
      catch (e) { console.warn('No se pudo generar la imagen de la figura', b.num, e); }
    }
    return imgs;
  },
};

window.ReportModel = ReportModel;

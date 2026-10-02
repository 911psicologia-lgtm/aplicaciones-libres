/* ============================================
   AI Prompt builder — generador del prompt para IA externa
   Construye un prompt profesional en español para que una IA
   externa (ChatGPT, Gemini, Claude, Z.AI, DeepSeek, etc.)
   genere un informe contextualizado del MMPI-2 en formato JSON.

   Uso:
     const prompt = AIPrompt.build(caseData, evaluatorData);
     // → cadena de texto lista para copiar al portapapeles
   ============================================ */

const AIPrompt = {

  /* Listado canónico de escalas MMPI-2 (orden y grupo).
     Se usa para iterar los resultados en un orden legible. */
  _SCALE_ORDER: [
    // Validez
    'L', 'F', 'K', 'VRIN', 'TRIN', 'Fb', 'Fp', 'S',
    // Clínicas básicas
    'Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si',
    // Contenido
    'ANX', 'FRS', 'OBS', 'DEP', 'HEA', 'BIZ', 'ANG', 'CYN',
    'ASP', 'TPA', 'LSE', 'SOD', 'FAM', 'WRK', 'TRT',
    // Suplementarias
    'A', 'R', 'Es', 'MAC-R', 'AAS', 'APS', 'MDS', 'Ho',
    'O-H', 'Do', 'Re', 'Mt', 'GM', 'GF', 'PK',
    // Subescalas Harris-Lingoes
    'D1', 'D2', 'D3', 'D4', 'D5',
    'Hy1', 'Hy2', 'Hy3', 'Hy4', 'Hy5',
    'Pd1', 'Pd2', 'Pd3', 'Pd4', 'Pd5',
    'Pa1', 'Pa2', 'Pa3',
    'Sc1', 'Sc2', 'Sc3', 'Sc4', 'Sc5', 'Sc6',
    'Ma1', 'Ma2', 'Ma3', 'Ma4',
    'Si1', 'Si2', 'Si3',
  ],

  /* ---- Función principal ----
     caseData     : objeto del caso (Storage.getCurrentCase())
     evaluatorData: objeto del evaluador (Storage.getEvaluator())
     Devuelve: string con el prompt completo */
  build(caseData, evaluatorData) {
    if (!caseData) throw new Error('AIPrompt.build requiere caseData');
    const p = caseData.patient || {};
    const ev = evaluatorData || {};
    const results = caseData.results || {};
    const country = p.country || (window.MMPI2 ? MMPI2.getCountry() : 'ES');

    const sections = [];

    sections.push(this._header());
    sections.push(this._patientBlock(p, country));
    sections.push(this._caseContextBlock(p));
    sections.push(this._evaluatorBlock(ev));
    sections.push(this._resultsBlock(results, country));
    sections.push(this._narrativeBlock(caseData.narrative, p, country));
    sections.push(this._styleGuidance());
    sections.push(this._outputSpec());
    sections.push(this._finalInstruction(p, country, ev));

    return sections.join('\n\n');
  },

  /* ---------- 1. Encabezado y rol ---------- */
  _header() {
    return [
      'Actúa como psicólogo clínico experto en evaluación e interpretación del MMPI-2 (Inventario Multifásico de Personalidad de Minnesota-2).',
      'Tu tarea es redactar un INFORME PERICIAL / CLÍNICO DE VALORACIÓN PSICOLÓGICA contextualizado, integrando los datos del caso, los resultados psicométricos del MMPI-2 y la narrativa de síntesis automática que se te proporcionan.',
      '',
      'El informe debe tener la calidad y extensión de un documento profesional de aproximadamente 11 páginas (densidad alta, párrafos completos, lenguaje técnico pero accesible para profesionales no psicólogos — p. ej. abogados, jueces, médicos), siguiendo el estilo de los informes de los tribunales y de la práctica clínica forense en español.',
      '',
      'Idioma: ESPAÑOL (castellano, registro formal clínico-pericial).',
      'No inventes datos que no estén en el contexto. Si un dato falta, indícalo explícitamente ("no consta").',
    ].join('\n');
  },

  /* ---------- 2. Bloque del paciente ---------- */
  _patientBlock(p, country) {
    const countryLabel = country === 'US'
      ? 'EE. UU. (Minnesota N=2.600) — recomendado para Latinoamérica'
      : 'España (TEA Ediciones, N=500, 4.ª ed. 2019)';

    const sexLabel = p.sex === 'M' ? 'Mujer' : (p.sex === 'H' ? 'Hombre' : 'No consta');
    const today = new Date().toLocaleDateString('es-ES');

    return [
      '═ DATOS DE IDENTIFICACIÓN DEL EVALUADO ═',
      `- Nombre: ${p.name || 'No consta'}`,
      `- Documento de identidad: ${p.document || 'No consta'}`,
      `- Fecha de nacimiento: ${p.dob || 'No consta'}`,
      `- Edad: ${p.age != null ? p.age + ' años' : 'No consta'}`,
      `- Sexo: ${sexLabel}`,
      `- Contexto de evaluación: ${p.context || 'No consta'}`,
      `- Fecha de aplicación de la prueba: ${p.applicationDate || 'No consta'}`,
      `- Baremo (país) utilizado para la conversión PD → T: ${countryLabel}`,
      `- Fecha de emisión del informe: ${today}`,
    ].join('\n');
  },

  /* ---------- 3. Bloque de contexto (historia y pericial) ---------- */
  _caseContextBlock(p) {
    const lines = ['═ CONTEXTO DEL CASO ═'];

    if (p.reason && p.reason.trim()) {
      lines.push('Motivo de evaluación:', p.reason.trim());
    } else {
      lines.push('Motivo de evaluación: No consta.');
    }

    if (p.history && p.history.trim()) {
      lines.push('', 'Antecedentes clínicos relevantes:', p.history.trim());
    } else {
      lines.push('', 'Antecedentes clínicos relevantes: No consta.');
    }

    // Nuevo campo: historia detallada del caso (párrafos)
    if (p.caseHistory && p.caseHistory.trim()) {
      lines.push('', 'Historia detallada del caso (narrativa aportada por el evaluador):', p.caseHistory.trim());
    }

    // Nuevo campo: contexto pericial / input del abogado
    if (p.legalContext && p.legalContext.trim()) {
      lines.push('', 'Contexto pericial (aportado por la parte solicitante / abogado):', p.legalContext.trim());
    }

    return lines.join('\n');
  },

  /* ---------- 4. Bloque del evaluador ---------- */
  _evaluatorBlock(ev) {
    return [
      '═ EVALUADOR ═',
      `- Nombre del profesional: ${ev.name || 'No consta'}`,
      `- Tarjeta profesional / licencia: ${ev.license || 'No consta'}`,
      `- Registro profesional: ${ev.registry || 'No consta'}`,
      `- Correo electrónico: ${ev.email || 'No consta'}`,
      `- Teléfono: ${ev.phone || 'No consta'}`,
      `- Dirección profesional: ${ev.address || 'No consta'}`,
    ].join('\n');
  },

  /* ---------- 5. Bloque de resultados MMPI-2 ---------- */
  _resultsBlock(results, country) {
    const countryLabel = country === 'US'
      ? 'EE. UU. (Minnesota N=2.600)'
      : 'España (TEA Ediciones, 4.ª ed. 2019)';

    const header = [
      '═ RESULTADOS DEL MMPI-2 (TODAS LAS ESCALAS) ═',
      `Baremo aplicado: ${countryLabel}.`,
      'Leyenda:',
      '  - PD  = puntuación directa (raw score)',
      '  - PD+K = puntuación directa corregida por K (solo escalas Hs, Pd, Pt, Sc, Ma)',
      '  - T    = puntuación tipificada (media 50, desviación 10)',
      '  - Banda = rango interpretativo según T',
      '  - Nota: las escalas marcadas "ES-ONLINE" requieren TEAcorrige para conversión PD→T.',
      '',
      'Tabla de resultados (79 escalas en orden canónico):',
      '',
      '| #  | Grupo          | Código | Escala                                    | PD   | PD+K | T    | Banda                  | Interpretación |',
      '|----|----------------|--------|-------------------------------------------|------|------|------|------------------------|-----------------|',
    ].join('\n');

    const rows = [];
    let idx = 0;
    for (const code of this._SCALE_ORDER) {
      const s = results[code];
      if (!s) continue;
      idx++;
      const pd   = (s.pd   != null) ? String(s.pd)   : '—';
      const pdK  = (s.pdK  != null) ? String(s.pdK)  : '—';
      const tVal = (typeof s.t === 'number') ? String(s.t)
                 : (s.t == null ? '—' : String(s.t));
      const band = s.band ? s.band.label : '—';
      const interp = (s.interpretation || '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
      // nombre limpio (sin el code entre paréntesis, ya está en su columna)
      const cleanName = (s.name || '').replace(/\s+/g, ' ').trim();
      rows.push(
        `| ${String(idx).padStart(2)} | ${(s.group || '').padEnd(14)} | ${code.padEnd(6)} | ${cleanName.padEnd(41)} | ${pd.padStart(4)} | ${pdK.padStart(4)} | ${tVal.padStart(4)} | ${band.padEnd(22)} | ${interp} |`
      );
    }

    const totalScales = idx;
    const summary = [
      '',
      `Total de escalas incluidas: ${totalScales} (sobre 79 escalas canónicas del MMPI-2).`,
      '',
      'Resumen de bandas detectadas (T numérico, sin contar ES-ONLINE):',
      ...this._bandSummary(results),
    ].join('\n');

    return header + '\n' + rows.join('\n') + summary;
  },

  /* ---------- 5b. Resumen por bandas ---------- */
  _bandSummary(results) {
    const arr = Object.values(results).filter(r => typeof r.t === 'number');
    const veryHigh = arr.filter(r => r.t >= 70);
    const high     = arr.filter(r => r.t >= 60 && r.t < 70);
    const modHigh  = arr.filter(r => r.t >= 56 && r.t < 60);
    const modal    = arr.filter(r => r.t >= 40 && r.t < 56);
    const low      = arr.filter(r => r.t <= 39);

    const fmt = a => a.length ? a.map(r => `${r.code} (T=${r.t})`).join(', ') : 'ninguna';
    return [
      `- Muy Alto (T≥70): ${fmt(veryHigh)} (${veryHigh.length} escala(s))`,
      `- Alto (T 60-69): ${fmt(high)} (${high.length} escala(s))`,
      `- Promedio-Superior (T 56-59): ${fmt(modHigh)} (${modHigh.length} escala(s))`,
      `- Modal (T 40-55): ${modal.length} escala(s)`,
      `- Bajo (T≤39): ${fmt(low)} (${low.length} escala(s))`,
    ];
  },

  /* ---------- 6. Bloque de narrativa de síntesis automática ---------- */
  _narrativeBlock(storedNarrative, p, country) {
    let narrative = storedNarrative;
    if ((!narrative || !narrative.trim()) && window.MMPI2) {
      // Construir al vuelo si no está cacheada
      try {
        narrative = MMPI2.buildNarrative(
          // No podemos recalcular sin responses; si no hay narrative, dejamos constancia
          {}, p.name, p.age, p.sex, country
        );
      } catch (e) {
        narrative = '';
      }
    }
    if (!narrative || !narrative.trim()) {
      narrative = 'No se dispone de narrativa automática pre-generada. Redacta la integración clínica a partir de los resultados tabulados arriba.';
    }
    return '═ SÍNTESIS INTERPRETATIVA AUTOMÁTICA (generada por la app) ═\n' + narrative.trim();
  },

  /* ---------- 7. Guía de estilo / estándar profesional ---------- */
  _styleGuidance() {
    return [
      '═ ESTILO Y ESTÁNDAR PROFESIONAL DEL INFORME ═',
      '',
      'Redacta un informe contextualizado siguiendo el estilo de un informe pericial psicológico profesional de aproximadamente 11 páginas. Referencia el siguiente modelo de calidad:',
      '',
      '  · Encabezado institucional con título: «INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2».',
      '  · Numeración correlativa de las secciones (1 a 13).',
      '  · Párrafos completos y cohesionados (no listas sueltas, salvo en Conclusiones y Recomendaciones).',
      '  · Lenguaje técnico-psicológico, preciso, evitando coloquialismos.',
      '  · Integración clínica del perfil: conectar elevaciones con la historia del caso y el contexto pericial.',
      '  · Citar las siglas de las escalas en MAYÚSCULAS seguidas de su T entre paréntesis la primera vez que se mencionan en cada sección.',
      '  · Interpretación por banda: T≥70 muy alto, T 60-69 alto, T 56-59 promedio-superior, T 40-55 modal, T≤39 bajo.',
      '  · Considerar las configuraciones clínicas clásicas (V de conversión, 4-9, V psicótica, grito de ayuda, defensivo cerrado) cuando proceda.',
      '  · Cautela interpretativa: si las escalas de validez (L, F, K, VRIN, TRIN, Fb, Fp, S) lo aconsejan, indicar limitaciones del protocolo.',
      '  · Tono respetuoso, no patologizante, diferenciando siempre comportamiento observable de inferencia clínica.',
      '  · No emitir diagnósticos categóricos sin integrar contexto; usar formulación tentativa cuando proceda.',
      '',
      'Importante: no inventes datos del evaluado que no estén en el contexto. Si una sección no tiene información suficiente, indícalo con «No consta» o describe la limitación metodológica.',
    ].join('\n');
  },

  /* ---------- 8. Especificación del JSON de salida ---------- */
  _outputSpec() {
    return [
      '═ FORMATO DE SALIDA REQUERIDO (ESTRICTO) ═',
      '',
      'Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin bloques de código markdown, sin comentarios. El JSON debe tener esta estructura exacta (cambia el contenido de "contenido" por tu redacción profesional, manteniendo los títulos de las secciones):',
      '',
      '{',
      '  "titulo": "INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2",',
      '  "secciones": [',
      '    {"titulo": "1. Motivo y objetivo de la evaluación", "contenido": "..."},',
      '    {"titulo": "2. Antecedentes relevantes", "contenido": "..."},',
      '    {"titulo": "3. Técnica y control de calidad", "contenido": "..."},',
      '    {"titulo": "4. Validez y estilo de respuesta", "contenido": "..."},',
      '    {"titulo": "5. Escalas clínicas básicas", "contenido": "..."},',
      '    {"titulo": "6. Escalas de contenido", "contenido": "..."},',
      '    {"titulo": "7. Escalas suplementarias", "contenido": "..."},',
      '    {"titulo": "8. Subescalas clínicamente relevantes", "contenido": "..."},',
      '    {"titulo": "9. Ítems críticos", "contenido": "..."},',
      '    {"titulo": "10. Integración clínica del perfil", "contenido": "..."},',
      '    {"titulo": "11. Comparación con evaluaciones anteriores", "contenido": "..."},',
      '    {"titulo": "12. Conclusiones", "contenido": "..."},',
      '    {"titulo": "13. Recomendaciones", "contenido": "..."}',
      '  ]',
      '}',
      '',
      'REQUISITOS DEL CONTENIDO POR SECCIÓN:',
      '  1. Motivo y objetivo — Describe quién deriva al evaluado, por qué, y qué se espera obtener de la evaluación.',
      '  2. Antecedentes relevantes — Integra la "Historia del caso" y los "Antecedentes" aportados. Estructura en párrafos.',
      '  3. Técnica y control de calidad — Describe el MMPI-2 (567 ítems, V/F, baremo usado), el modo de administración y el control de calidad realizado.',
      '  4. Validez y estilo de respuesta — Interpreta L, F, K, VRIN, TRIN, Fb, Fp, S con sus T. Indica si el protocolo es interpretable.',
      '  5. Escalas clínicas básicas — Hs, D, Hy, Pd, Mf, Pa, Pt, Sc, Ma, Si con sus T, banda e interpretación integrada.',
      '  6. Escalas de contenido — ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN, ASP, TPA, LSE, SOD, FAM, WRK, TRT.',
      '  7. Escalas suplementarias — A, R, Es, MAC-R, AAS, APS, MDS, Ho, O-H, Do, Re, Mt, GM, GF, PK.',
      '  8. Subescalas clínicamente relevantes — Harris-Lingoes con elevaciones más notables (D1-D5, Hy1-Hy5, Pd1-Pd5, Pa1-Pa3, Sc1-Sc6, Ma1-Ma4, Si1-Si3). Selecciona las más relevantes.',
      '  9. Ítems críticos — Si no se dispone de información de ítems críticos, indícalo e integra la información disponible de las escalas de contenido.',
      ' 10. Integración clínica del perfil — Síntesis narrativa que conecta las elevaciones con la historia del caso, el contexto pericial y las configuraciones clínicas detectadas. Esta es la sección más importante.',
      ' 11. Comparación con evaluaciones anteriores — Si no hay evaluaciones previas, indícalo.',
      ' 12. Conclusiones — Conclusiones numeradas, claras, integrando validez + perfil + contexto.',
      ' 13. Recomendaciones — Recomendaciones accionables, numeradas, dirigidas al destinatario del informe (clínico, forense o laboral).',
      '',
      'El contenido de cada sección debe ser extenso, en párrafos completos, redactado en español profesional.',
      'No incluyas tablas markdown dentro del contenido; usa prosa. Si necesitas citar T, escríbelas en línea (p. ej., "Hs (T=72)").',
      'No incluyas claves distintas a "titulo" y "contenido" en cada objeto de "secciones".',
    ].join('\n');
  },

  /* ---------- 9. Instrucción final ---------- */
  _finalInstruction(p, country, ev) {
    const countryLabel = country === 'US'
      ? 'estadounidense (Minnesota)'
      : 'español (TEA Ediciones)';
    return [
      '═ INSTRUCCIÓN FINAL ═',
      '',
      `Redacta el informe completo para ${p.name || 'el evaluado'} (edad ${p.age != null ? p.age : 'no consta'}, sexo ${p.sex === 'M' ? 'mujer' : (p.sex === 'H' ? 'varón' : 'no consta')}), baremo ${countryLabel}, evaluado por ${ev.name || 'el profesional suscribiente'}.`,
      '',
      'Recuerda: responde SOLO con el JSON, sin texto adicional antes ni después, sin bloque de código, sin explicaciones.',
      'Comienza directamente con { y termina con }.',
    ].join('\n');
  },
};

window.AIPrompt = AIPrompt;

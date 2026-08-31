import { CONTEXT_TYPES } from './config.js';
import { ageLabel, esc } from './utils.js';


function redactNarrative(caseData, text = '') {
  let out = String(text || '');
  const replacements = [
    [caseData.patient.fullName, '[NOMBRE OMITIDO]'],
    [caseData.patient.documentId, '[IDENTIFICACIÓN OMITIDA]'],
    [caseData.patient.institution, '[INSTITUCIÓN OMITIDA]'],
    [caseData.patient.referrer, '[REMITENTE OMITIDO]'],
  ];
  for (const [needle, replacement] of replacements) {
    const n = String(needle || '').trim();
    if (n.length >= 3) out = out.split(n).join(replacement);
  }
  out = out.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[CORREO OMITIDO]');
  out = out.replace(/(?:\+?\d[\s().-]?){8,}/g, '[TELÉFONO/ID OMITIDO]');
  return out;
}

function contextLabel(caseData) {
  const found = CONTEXT_TYPES.find(([id]) => id === caseData.evaluation.contextType);
  if (caseData.evaluation.contextType === 'otro' && caseData.evaluation.contextCustom) return caseData.evaluation.contextCustom;
  return found?.[1] || 'No especificado';
}

function resultLine(label, d, mainKey = 'pt') {
  if (!d) return `<tr><td>${label}</td><td colspan="5">Sin datos suficientes para calcular.</td></tr>`;
  const value = d[mainKey];
  const ic = d.ic ? `${d.ic[0]}–${d.ic[1]}` : '—';
  return `<tr><td>${label}</td><td>${value}</td><td>${d.percentile ?? '—'}</td><td>${d.category || '—'}</td><td>${d.stanine ?? '—'}</td><td>${ic}</td></tr>`;
}

function reportHeader(caseData, title) {
  const p = caseData.patient;
  return `
    <header class="report-head">
      <h1>${esc(title)}</h1>
      <p><strong>Evaluado:</strong> ${esc(p.fullName || 'Sin registrar')}</p>
      <p><strong>Identificación:</strong> ${esc(p.documentId || 'No registrada')} · <strong>Fecha de aplicación:</strong> ${esc(caseData.evaluation.applicationDate || '—')}</p>
    </header>`;
}

export function buildTechnicalReport(caseData, result) {
  const p = caseData.patient;
  const e = caseData.evaluation;
  const d = result.difference;
  const diffText = d
    ? `${d.direction}; diferencia absoluta de ${d.absolute} puntos típicos. ${d.significant01 ? `Alcanza el criterio de significación de p<0,01 (≥${d.p01Threshold}).` : d.significant05 ? `Alcanza el criterio de significación de p<0,05 (≥${d.p05Threshold}), pero no el de p<0,01.` : `No alcanza el criterio de significación de p<0,05 (≥${d.p05Threshold}).`}`
    : 'No fue posible calcular la comparación entre las puntuaciones típicas.';

  const limitations = [
    'El K-BIT es una medida breve de inteligencia verbal y no verbal; sus resultados no sustituyen una evaluación psicológica o neuropsicológica integral.',
    'La interpretación debe integrarse con el motivo de evaluación, antecedentes, condiciones de administración, observación clínica y otras fuentes de información pertinentes.',
    'Los intervalos de confianza expresan error de medida y deben considerarse al interpretar diferencias pequeñas entre puntuaciones.',
  ];

  return `
  <article class="report">
    ${reportHeader(caseData, 'Informe técnico de evaluación cognitiva breve')}

    <section><h2>1. Datos de identificación y contexto de evaluación</h2>
      <p><strong>Edad cronológica:</strong> ${esc(ageLabel(result.age))}.</p>
      <p><strong>Escolaridad:</strong> ${esc(p.education || 'No registrada')}. <strong>Ocupación:</strong> ${esc(p.occupation || 'No aplica / no registrada')}.</p>
      <p><strong>Institución:</strong> ${esc(p.institution || 'No registrada')}. <strong>Remitente:</strong> ${esc(p.referrer || 'No registrado')}.</p>
      <p><strong>Contexto:</strong> ${esc(contextLabel(caseData))}.</p>
    </section>

    <section><h2>2. Motivo de evaluación</h2><p>${esc(e.reason || 'No registrado.')}</p></section>

    <section><h2>3. Instrumento y procedimiento</h2>
      <p>Se utilizó el Test Breve de Inteligencia de Kaufman (K-BIT), compuesto por una escala verbal de Vocabulario y una escala no verbal de Matrices. La aplicación fue registrada en esta herramienta, mientras los estímulos fueron presentados externamente por el profesional responsable. La edad cronológica determinó automáticamente el tramo normativo; las puntuaciones directas se transformaron mediante las tablas C.1–C.5 incorporadas.</p>
      <p><strong>Tramo normativo seleccionado:</strong> ${esc(result.normBand?.label || 'No disponible')}. <strong>Nivel de confianza:</strong> ${esc(caseData.scoring.confidence)}%.</p>
    </section>

    <section><h2>4. Condiciones y observaciones de aplicación</h2>
      <p>${esc(caseData.application.observations || 'No se registraron observaciones adicionales.')}</p>
    </section>

    <section><h2>5. Resultados</h2>
      <table class="report-table"><thead><tr><th>Escala</th><th>Puntaje típico / CI</th><th>Percentil</th><th>Categoría</th><th>Eneatipo</th><th>IC ${esc(caseData.scoring.confidence)}%</th></tr></thead>
      <tbody>
        ${resultLine('Verbal / Vocabulario', result.verbal, 'pt')}
        ${resultLine('No verbal / Matrices', result.nonverbal, 'pt')}
        ${resultLine('CI compuesto', result.composite, 'ci')}
      </tbody></table>
      <p><strong>Puntuaciones directas utilizadas:</strong> Vocabulario ${result.raw.vocab}; Matrices ${result.raw.matrices}.</p>
    </section>

    <section><h2>6. Comparación de puntuaciones</h2><p>${esc(diffText)}</p></section>

    <section><h2>7. Interpretación técnica</h2>
      <p>${technicalInterpretation(result)}</p>
    </section>

    <section><h2>8. Alcances y limitaciones</h2><ul>${limitations.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>

    <section><h2>9. Conclusión técnica</h2><p>${technicalConclusion(result)}</p></section>

    <section><h2>10. Recomendaciones / integración</h2>
      <p>Los hallazgos deben contrastarse con la pregunta de evaluación y con la información clínica, educativa, jurídica, laboral o investigativa disponible. Cuando la decisión a tomar sea de alto impacto, se recomienda integrar otras medidas, entrevistas, registros y fuentes independientes antes de formular conclusiones definitivas.</p>
    </section>

    <section class="signature"><h2>Profesional responsable</h2><p>Nombre: ______________________________</p><p>Registro profesional: __________________</p><p>Firma: _______________________________</p></section>
  </article>`;
}

function technicalInterpretation(result) {
  if (!result.verbal || !result.nonverbal) return 'No hay información suficiente para formular una interpretación técnica del perfil.';
  const v = result.verbal;
  const n = result.nonverbal;
  const c = result.composite;
  let text = `La escala verbal obtuvo una puntuación típica de ${v.pt} (percentil ${v.percentile}; categoría ${v.category || 'sin categoría disponible'}), mientras la escala no verbal obtuvo ${n.pt} (percentil ${n.percentile}; categoría ${n.category || 'sin categoría disponible'}).`;
  if (c) text += ` La combinación de ambas puntuaciones produjo un CI compuesto de ${c.ci} (percentil ${c.percentile}; categoría ${c.category || 'sin categoría disponible'}).`;
  if (result.difference) {
    if (result.difference.significant05) text += ` La discrepancia entre escalas supera el criterio estadístico de p<0,05, por lo que el índice compuesto debe leerse junto con el patrón diferencial y no como una descripción aislada del desempeño.`;
    else text += ` La discrepancia entre escalas no supera el criterio estadístico de p<0,05 para este grupo de edad.`;
  }
  return esc(text);
}

function technicalConclusion(result) {
  if (!result.composite) return 'No es posible establecer una conclusión técnica porque no se dispone de todas las puntuaciones requeridas.';
  const c = result.composite;
  let text = `El desempeño global se ubica en la categoría ${c.category || 'no disponible'}, con CI compuesto ${c.ci} y percentil ${c.percentile}.`;
  if (result.difference?.significant05) text += ` La heterogeneidad entre las escalas verbal y no verbal es estadísticamente relevante y debe ser considerada al comunicar el resultado global.`;
  else text += ` Las escalas verbal y no verbal no muestran una discrepancia que alcance el criterio estadístico de p<0,05.`;
  return esc(text);
}

export function buildLocalContextualReport(caseData, result) {
  const e = caseData.evaluation;
  const ctx = contextLabel(caseData);
  let profile = 'No hay resultados suficientes para contextualizar el perfil.';
  if (result.verbal && result.nonverbal) {
    const higher = result.verbal.pt > result.nonverbal.pt ? 'verbal' : result.verbal.pt < result.nonverbal.pt ? 'no verbal' : 'equivalente';
    profile = higher === 'equivalente'
      ? `El desempeño verbal y no verbal se presenta en niveles equivalentes (${result.verbal.pt} y ${result.nonverbal.pt}, respectivamente).`
      : `El desempeño ${higher} es relativamente superior dentro del perfil observado (${result.verbal.pt} verbal frente a ${result.nonverbal.pt} no verbal).`;
    if (result.difference?.significant05) profile += ' Esta diferencia alcanza significación estadística para el grupo de edad y merece consideración específica en la integración del caso.';
    else profile += ' La diferencia no alcanza el criterio de significación estadística de p<0,05.';
  }

  return `
  <article class="report">
    ${reportHeader(caseData, 'Informe contextualizado de evaluación cognitiva breve')}
    <section><h2>Contexto de lectura</h2><p>La presente integración corresponde al contexto <strong>${esc(ctx)}</strong>. No pretende establecer relaciones causales a partir de una prueba breve; diferencia datos observados, condiciones asociadas e hipótesis interpretativas que requieren contraste con otras fuentes.</p></section>
    <section><h2>Información relevante aportada</h2><p>${esc(e.relevantData || 'No se aportó información contextual adicional.')}</p><p>${esc(e.contextDetails || '')}</p></section>
    <section><h2>Perfil observado</h2><p>${esc(profile)}</p></section>
    <section><h2>Integración contextual preliminar</h2><p>${contextualIntegration(caseData, result)}</p></section>
    <section><h2>Condiciones de aplicación</h2><p>${esc(caseData.application.observations || 'Sin observaciones registradas.')}</p></section>
    <section><h2>Hipótesis y cautelas</h2><p>Las asociaciones entre el desempeño cognitivo y los antecedentes descritos deben formularse como hipótesis de trabajo. La prueba no permite, por sí sola, atribuir dificultades o fortalezas a una causa específica ni establecer diagnósticos categóricos.</p></section>
  </article>`;
}

function contextualIntegration(caseData, result) {
  const ctx = contextLabel(caseData);
  if (!result.composite) return 'La información cuantitativa aún es insuficiente para realizar una integración contextual.';
  const d = result.difference;
  let text = `En el contexto ${ctx}, el CI compuesto de ${result.composite.ci} (percentil ${result.composite.percentile}) ofrece una referencia global, pero debe interpretarse junto con las puntuaciones verbal y no verbal.`;
  if (d?.significant05) text += ` La discrepancia ${d.direction.toLowerCase()} es estadísticamente significativa y su posible relación con los antecedentes descritos debe explorarse mediante entrevistas, observación y otras medidas pertinentes.`;
  else text += ` El perfil no presenta una discrepancia estadísticamente significativa entre las escalas, por lo que las diferencias observadas deben interpretarse con prudencia.`;
  return esc(text);
}

export function buildAnonymousAIPayload(caseData, result) {
  return {
    alias: caseData.privacy.alias,
    edad: result.age ? { anios: result.age.years, meses: result.age.months, dias: result.age.days } : null,
    escolaridad_general: caseData.patient.education || 'No registrada',
    contexto_evaluacion: contextLabel(caseData),
    motivo: redactNarrative(caseData, caseData.evaluation.reason),
    datos_relevantes: redactNarrative(caseData, caseData.evaluation.relevantData),
    contexto_adicional: redactNarrative(caseData, caseData.evaluation.contextDetails),
    observaciones_aplicacion: redactNarrative(caseData, caseData.application.observations),
    resultados: {
      verbal: result.verbal ? { tipico: result.verbal.pt, percentil: result.verbal.percentile, categoria: result.verbal.category, ic: result.verbal.ic } : null,
      no_verbal: result.nonverbal ? { tipico: result.nonverbal.pt, percentil: result.nonverbal.percentile, categoria: result.nonverbal.category, ic: result.nonverbal.ic } : null,
      compuesto: result.composite ? { ci: result.composite.ci, percentil: result.composite.percentile, categoria: result.composite.category, ic: result.composite.ic } : null,
      diferencia: result.difference,
    },
  };
}

export function buildAIPrompt(caseData, result) {
  const payload = buildAnonymousAIPayload(caseData, result);
  return `Actúa como asistente de redacción para un profesional de psicología. Redacta exclusivamente un borrador de INFORME CONTEXTUALIZADO a partir de los datos anonimizados siguientes.\n\nREGLAS OBLIGATORIAS:\n- No emitas diagnósticos categóricos ni decisiones clínicas, jurídicas, educativas o laborales definitivas.\n- No atribuyas causalidad. Distingue explícitamente: datos observados, condiciones asociadas e hipótesis interpretativas.\n- No inventes antecedentes, síntomas, conductas ni resultados.\n- Integra el contexto de evaluación sin sobredimensionar una prueba breve.\n- Explica discrepancias verbal/no verbal solo cuando estén respaldadas por los datos.\n- Mantén lenguaje profesional, concreto y prudente.\n- El texto será revisado y validado por el profesional responsable.\n- No solicites ni reconstruyas identidad, nombre, documento, institución específica o fecha exacta de nacimiento.\n\nESTRUCTURA SUGERIDA:\n1. Propósito y contexto de la evaluación.\n2. Síntesis del perfil cognitivo.\n3. Integración con la información contextual aportada.\n4. Hipótesis interpretativas y alternativas plausibles.\n5. Alcances, limitaciones y recomendaciones de integración.\n\nDATOS ANONIMIZADOS:\n${JSON.stringify(payload, null, 2)}`;
}

export function contextualReportWithAI(caseData, result) {
  const text = (caseData.reports.contextualAIText || '').trim();
  if (!text) return buildLocalContextualReport(caseData, result);
  return `
    <article class="report">
      ${reportHeader(caseData, 'Informe contextualizado de evaluación cognitiva breve')}
      <section><h2>Integración contextual</h2>${text.split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join('')}</section>
      <section><h2>Nota de validación profesional</h2><p>Este texto fue incorporado como borrador asistido y requiere revisión, edición y validación por el profesional responsable antes de su uso.</p></section>
    </article>`;
}

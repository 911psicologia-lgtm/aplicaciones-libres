import { CONTEXT_TYPES } from './config.js';
import { ageLabel, esc } from './utils.js';
import { administrationSummary } from './administration.js';

function redactNarrative(caseData, text = '') {
  let out = String(text || '');
  const replacements = [
    [caseData.patient.fullName, '[NOMBRE OMITIDO]'],
    [caseData.patient.documentId, '[IDENTIFICACIÓN OMITIDA]'],
    [caseData.patient.institution, '[INSTITUCIÓN OMITIDA]'],
    [caseData.patient.referrer, '[REMITENTE OMITIDO]'],
    [caseData.professional?.fullName, '[PROFESIONAL OMITIDO]'],
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

function fmt(value, fallback='—') { return value === null || value === undefined || value === '' ? fallback : value; }
function zScore(value) { return Number.isFinite(Number(value)) ? ((Number(value) - 100) / 15).toFixed(2) : '—'; }
function icText(d) { return d?.ic ? `${d.ic[0]}–${d.ic[1]}` : '—'; }
function bandText(d) { return d?.band === null || d?.band === undefined ? '—' : `±${d.band}`; }

function reportHeader(caseData, result, title, subtitle='') {
  const p = caseData.patient;
  const pr = caseData.professional || {};
  return `
    <header class="report-head report-cover">
      <div class="report-kicker">K-BIT · Test Breve de Inteligencia de Kaufman</div>
      <h1>${esc(title)}</h1>
      ${subtitle ? `<p class="report-subtitle">${esc(subtitle)}</p>` : ''}
      <div class="report-meta-grid">
        <div><span>Evaluado</span><strong>${esc(p.fullName || 'Sin registrar')}</strong></div>
        <div><span>Edad</span><strong>${esc(ageLabel(result.age))}</strong></div>
        <div><span>Fecha de evaluación</span><strong>${esc(caseData.evaluation.applicationDate || '—')}</strong></div>
        <div><span>Contexto</span><strong>${esc(contextLabel(caseData))}</strong></div>
        <div><span>Profesional</span><strong>${esc(pr.fullName || 'No registrado')}</strong></div>
        <div><span>Registro profesional</span><strong>${esc(pr.registration || 'No registrado')}</strong></div>
      </div>
    </header>`;
}

function rawBreakdownTable(caseData, result) {
  const ve=administrationSummary(caseData,'vocabExpresivo');
  const de=administrationSummary(caseData,'definiciones');
  const ma=administrationSummary(caseData,'matrices');
  const rows = [
    ['Vocabulario expresivo', result.raw.exp, ve?.creditPrior||0],
    ...(result.definitionsActive ? [['Definiciones', result.raw.def, de?.creditPrior||0]] : []),
    ['VOCABULARIO - puntuación directa utilizada', result.raw.vocab, (ve?.creditPrior||0)+(de?.creditPrior||0)],
    ['MATRICES - puntuación directa utilizada', result.raw.matrices, ma?.creditPrior||0],
  ];
  return `<table class="report-table compact"><thead><tr><th>Subtest / escala</th><th>Puntuación directa</th><th>Crédito previo incluido</th></tr></thead><tbody>${rows.map(([a,b,c])=>`<tr><td>${esc(a)}</td><td class="num">${esc(b)}</td><td class="num">${esc(c)}</td></tr>`).join('')}</tbody></table>`;
}

function standardizedResultsTable(caseData, result) {
  const conf = caseData.scoring.confidence;
  const row = (label,d,key='pt',raw='—') => d ? `<tr>
    <td>${esc(label)}</td><td class="num">${esc(raw)}</td><td class="num">${esc(d[key])}</td><td class="num">${esc(bandText(d))}</td>
    <td class="num">${esc(icText(d))}</td><td class="num">${esc(fmt(d.percentile))}</td><td>${esc(d.category || '—')}</td>
    <td class="num">${esc(zScore(d[key]))}</td><td class="num">${esc(fmt(d.stanine))}</td>
  </tr>` : `<tr><td>${esc(label)}</td><td colspan="8">Sin datos suficientes para calcular.</td></tr>`;
  return `<table class="report-table results-table"><thead><tr><th>Escala</th><th>PD</th><th>PT / CI</th><th>Banda</th><th>IC ${esc(conf)}%</th><th>Percentil</th><th>Categoría</th><th>z</th><th>Eneatipo</th></tr></thead><tbody>
    ${row('Vocabulario',result.verbal,'pt',result.raw.vocab)}
    ${row('Matrices',result.nonverbal,'pt',result.raw.matrices)}
    ${row('CI compuesto',result.composite,'ci',result.composite?.sum ?? '—')}
  </tbody></table>`;
}

function profileTrack(label,d,key='pt') {
  if(!d) return '';
  const value = Number(d[key]);
  const min = d.ic?.[0] ?? value;
  const max = d.ic?.[1] ?? value;
  const clamp = n => Math.max(40, Math.min(160, Number(n)));
  const pct = n => ((clamp(n)-40)/120)*100;
  const left = pct(min), width = Math.max(1,pct(max)-left), marker=pct(value);
  return `<div class="report-profile-row"><div class="rp-label">${esc(label)}</div><div class="rp-track"><span class="rp-mean"></span><span class="rp-ic" style="left:${left}%;width:${width}%"></span><span class="rp-marker" style="left:${marker}%"></span></div><div class="rp-value">${esc(value)}</div></div>`;
}

function profileGraph(result) {
  return `<div class="report-profile">
    <div class="rp-scale"><span>40</span><span>70</span><span>85</span><span>100</span><span>115</span><span>130</span><span>160</span></div>
    ${profileTrack('Vocabulario',result.verbal,'pt')}
    ${profileTrack('Matrices',result.nonverbal,'pt')}
    ${profileTrack('CI compuesto',result.composite,'ci')}
    <div class="rp-note">Marcador vertical: puntuación obtenida. Banda horizontal: intervalo de confianza seleccionado. Línea central: media normativa 100.</div>
  </div>`;
}

function differenceText(result) {
  const d=result.difference;
  if(!d) return 'No fue posible calcular la comparación entre las puntuaciones típicas.';
  const direction = d.signed > 0 ? 'mayor rendimiento verbal que no verbal' : d.signed < 0 ? 'mayor rendimiento no verbal que verbal' : 'rendimiento equivalente entre las dos escalas';
  if(d.significant01) return `La diferencia absoluta es de ${d.absolute} puntos (${direction}) y alcanza el criterio de significación p<0,01 para este grupo de edad (corte ${d.p01Threshold}).`;
  if(d.significant05) return `La diferencia absoluta es de ${d.absolute} puntos (${direction}) y alcanza el criterio p<0,05 (corte ${d.p05Threshold}), aunque no el criterio más exigente p<0,01 (corte ${d.p01Threshold}).`;
  return `La diferencia absoluta es de ${d.absolute} puntos (${direction}) y no alcanza el criterio p<0,05 para este grupo de edad (corte ${d.p05Threshold}).`;
}

function verbalInterpretation(result) {
  const v=result.verbal;
  if(!v) return 'No se dispone de una puntuación verbal interpretable.';
  return `El rendimiento en Vocabulario se sitúa en la categoría ${v.category || 'no disponible'}, con puntuación típica ${v.pt}, percentil ${v.percentile} e intervalo ${icText(v)}. Esta escala resume el desempeño en tareas de conocimiento de palabras, comprensión y formación de conceptos verbales; su lectura debe considerar escolaridad, experiencias culturales, dominio lingüístico y condiciones de aplicación.`;
}

function nonverbalInterpretation(result) {
  const n=result.nonverbal;
  if(!n) return 'No se dispone de una puntuación no verbal interpretable.';
  return `El rendimiento en Matrices se sitúa en la categoría ${n.category || 'no disponible'}, con puntuación típica ${n.pt}, percentil ${n.percentile} e intervalo ${icText(n)}. La escala aporta una estimación del razonamiento no verbal, la percepción de relaciones y la resolución de problemas mediante analogías visuales.`;
}

function globalInterpretation(result) {
  const c=result.composite;
  if(!c) return 'No se dispone de un CI compuesto interpretable.';
  let text=`El CI compuesto es ${c.ci}, percentil ${c.percentile}, categoría ${c.category || 'no disponible'}, con intervalo ${icText(c)}. Este valor ofrece una estimación global breve del funcionamiento intelectual evaluado por el K-BIT.`;
  if(result.difference?.significant05) text += ' Debido a la discrepancia estadísticamente significativa entre escalas, el índice global debe comunicarse junto con el patrón verbal/no verbal y no como una síntesis homogénea del desempeño.';
  else text += ' La ausencia de una discrepancia significativa entre escalas permite interpretar el compuesto como una síntesis razonablemente coherente de las dos áreas evaluadas, sin convertirlo en una descripción exhaustiva del funcionamiento cognitivo.';
  return text;
}


function protocolTraceTable(caseData,result){
  const rows=[['Vocabulario expresivo','vocabExpresivo'],...(result.definitionsActive?[['Definiciones','definiciones']]:[]),['Matrices','matrices']];
  return `<table class="report-table compact"><thead><tr><th>Subprueba</th><th>Inicio</th><th>Ejemplo</th><th>1.er bloque</th><th>Retorno</th><th>Crédito previo</th><th>Cierre</th></tr></thead><tbody>${rows.map(([label,key])=>{const a=administrationSummary(caseData,key);return `<tr><td>${esc(label)}</td><td>${esc(a?.startItem??'—')}</td><td>${esc(a?.example??'—')}${a?.exampleResult!==null&&a?.exampleResult!==undefined?` (${a.exampleResult?'correcto':'incorrecto'})`:''}</td><td>${esc(a?.initialCorrect??'—')} aciertos</td><td>${a?.returned?'Sí':'No'}</td><td>${esc(a?.creditPrior??0)}</td><td>${esc(a?.terminationReason||'Pendiente')}</td></tr>`}).join('')}</tbody></table>`;
}

function administrationCautions(caseData,result){
  const used=[];
  const checks=[['vocabExpresivo',2,'VE-2 Tenedor'],['vocabExpresivo',3,'VE-3 Rana'],['definiciones',27,'DEF-27 Conversación']];
  for(const [key,n,label] of checks){const it=caseData.application.items[key]?.[n-1];if(it && (it.score===0||it.score===1)) used.push(label);}
  const timed=result.protocol?.definiciones?.timedOut||0;
  const deviations=(caseData.application.protocol?.events||[]).filter(e=>e.type==='deviation'||e.type==='reapplication');
  const parts=[];
  if(used.length) parts.push(`Se administraron estímulos sustitutivos aprobados (${used.join(', ')}), no presentes en el escaneo fuente; esta modificación debe considerarse al interpretar comparabilidad estricta con la administración estandarizada.`);
  if(timed) parts.push(`En Definiciones se registraron ${timed} ítem(s) con agotamiento del límite de 30 s.`);
  if(deviations.length) parts.push(`Se registraron ${deviations.length} desviación(es) o evento(s) clínico(s) excepcionales en la bitácora.`);
  return parts.length?parts.join(' '):'No se registraron incidencias metodológicas adicionales en la ruta digital estándar.';
}

function contextRecommendations(caseData,result){
  const t=caseData.evaluation.contextType;
  const base={
    psicologico:'Integrar el perfil con entrevista clínica, observación, historia de desarrollo/aprendizaje y medidas complementarias si la pregunta clínica requiere mayor precisión.',
    educativo:'Contrastar el perfil con rendimiento académico, historia escolar, lenguaje, apoyos disponibles y observación del aprendizaje antes de definir ajustes o decisiones pedagógicas.',
    juridico:'Conservar trazabilidad completa de administración y evitar conclusiones periciales basadas exclusivamente en una medida breve; integrar fuentes independientes y explicar límites de inferencia.',
    laboral:'Relacionar los resultados únicamente con demandas cognitivas pertinentes del rol y con otras fuentes de evaluación; evitar extrapolaciones globales sobre competencia profesional.',
    investigacion:'Documentar versión, baremos, condiciones, desviaciones y criterios de exclusión; analizar el K-BIT como variable de estimación breve y no como medida exhaustiva del funcionamiento cognitivo.',
    salud:'Integrar con antecedentes médicos, funcionalidad, estado sensorial y otras medidas clínicas pertinentes; considerar evaluación más amplia ante discrepancias con el funcionamiento cotidiano.',
    orientacion:'Usar el perfil como una fuente orientativa entre varias, junto con intereses, trayectoria, desempeño y oportunidades de aprendizaje.',
    academico:'Interpretar junto con desempeño, hábitos de estudio, contexto lingüístico y condiciones educativas; no convertir el CI compuesto en una predicción determinista.',
    institucional:'Vincular la interpretación al propósito institucional declarado y a fuentes convergentes, documentando los límites de una prueba breve.'
  };
  return base[t]||'Integrar los resultados con las fuentes relevantes para el propósito específico y mantener explícitos los límites de una medida breve.';
}

function technicalSynthesis(result) {
  if(!result.composite) return 'La información disponible no permite formular una síntesis técnica completa.';
  const c=result.composite;
  const d=result.difference;
  let text=`La estimación global obtenida se ubica en el rango ${c.category || 'no disponible'} (CI compuesto ${c.ci}; percentil ${c.percentile}). `;
  if(d?.significant05) text += `El perfil es heterogéneo: ${d.direction.toLowerCase()} con una diferencia de ${d.absolute} puntos que resulta estadísticamente significativa. `;
  else if(d) text += `Las puntuaciones verbal y no verbal no presentan una diferencia estadísticamente significativa al nivel p<0,05. `;
  text += 'La conclusión debe integrarse con el motivo de evaluación, la conducta observada y fuentes adicionales antes de utilizarse para decisiones de alto impacto.';
  return text;
}

function contextImplication(caseData,result){
  const type=caseData.evaluation.contextType;
  const map={
    psicologico:'En un proceso psicológico, estos resultados pueden orientar la formulación del caso y la selección de evaluaciones complementarias, pero no constituyen por sí solos un diagnóstico.',
    educativo:'En un contexto educativo, el perfil puede contribuir a comprender recursos y dificultades relativas en tareas verbales y no verbales; las decisiones pedagógicas requieren integrar desempeño académico, historia escolar y observación del aprendizaje.',
    juridico:'En un contexto jurídico o forense, el resultado debe considerarse una fuente auxiliar y no una conclusión pericial autosuficiente; son indispensables trazabilidad, condiciones de administración, fuentes convergentes y análisis de alternativas.',
    laboral:'En un contexto laboral, la interpretación debe vincularse únicamente con demandas cognitivas pertinentes al rol y complementarse con otras evidencias; no es apropiado derivar decisiones ocupacionales de una prueba breve aislada.',
    investigacion:'En investigación, los puntajes pueden utilizarse como variables descriptivas o de control según el diseño, documentando edición, baremo, edad normativa, condiciones de aplicación y tratamiento de datos.',
    orientacion:'En orientación, el perfil puede apoyar la exploración de fortalezas relativas y necesidades de apoyo, evitando convertirlo en una predicción determinista de desempeño futuro.',
    salud:'En salud o rehabilitación, el K-BIT puede aportar una estimación breve del funcionamiento cognitivo actual, que debe contrastarse con historia clínica, estado funcional y pruebas específicas cuando sean necesarias.',
    academico:'En un contexto académico, los resultados pueden apoyar la comprensión del perfil de recursos verbales y no verbales, pero no sustituyen medidas de logro, aprendizaje o desempeño disciplinar.',
    institucional:'En un contexto institucional, su uso debe responder a una pregunta definida y respetar límites de validez, confidencialidad y proporcionalidad de la decisión.',
  };
  return map[type] || 'La interpretación contextual debe relacionar el perfil con la pregunta de evaluación sin inferir causalidad ni extender el resultado más allá de lo que una prueba breve permite sustentar.';
}

export function buildTechnicalReport(caseData, result) {
  const p=caseData.patient, e=caseData.evaluation, pr=caseData.professional || {};
  return `<article class="report technical-report">
    ${reportHeader(caseData,result,'Informe técnico K-BIT','Evaluación breve de funcionamiento intelectual verbal y no verbal')}

    <section><h2>1. Identificación y motivo de evaluación</h2>
      <div class="report-data-grid">
        <p><strong>Identificación:</strong> ${esc(p.documentId || 'No registrada')}</p>
        <p><strong>Escolaridad:</strong> ${esc(p.education || 'No registrada')}</p>
        <p><strong>Ocupación:</strong> ${esc(p.occupation || 'No aplica / no registrada')}</p>
        <p><strong>Institución / procedencia:</strong> ${esc(p.institution || 'No registrada')}</p>
        <p><strong>Remitente:</strong> ${esc(p.referrer || 'No registrado')}</p>
        <p><strong>Tramo normativo:</strong> ${esc(result.normBand?.label || 'No disponible')}</p>
      </div>
      <p><strong>Motivo:</strong> ${esc(e.reason || 'No registrado.')}</p>
    </section>

    <section><h2>2. Instrumento, alcance y procedimiento</h2>
      <p>Se administró el K-BIT clásico, adaptación española, como estimación breve del funcionamiento intelectual verbal y no verbal. La administración digital siguió puntos de inicio por edad, lógica de bloques, retorno, crédito previo, aprendizaje y discontinuación parametrizados para esta versión. Definiciones se administró con límite de 30 segundos por ítem cuando correspondió.</p>
      <p>La edad cronológica se calculó con la regla operativa del manual (préstamo de 30 días por mes y 12 meses por año) y determinó tanto la ruta de administración como el tramo normativo. <strong>Nivel de confianza utilizado:</strong> ${esc(caseData.scoring.confidence)}%.</p>
    </section>

    <section><h2>3. Trazabilidad de la administración</h2>${protocolTraceTable(caseData,result)}<p>${esc(administrationCautions(caseData,result))}</p></section>

    <section><h2>4. Observaciones de la aplicación</h2><p>${esc(caseData.application.observations || 'No se registraron observaciones adicionales durante la aplicación.')}</p></section>

    <section><h2>5. Puntuaciones directas</h2>${rawBreakdownTable(caseData,result)}</section>

    <section><h2>6. Resultados estandarizados</h2>
      ${standardizedResultsTable(caseData,result)}
      <p class="report-note"><strong>Suma de puntuaciones típicas:</strong> ${esc(result.composite?.sum ?? '—')}. La columna “z” expresa la distancia respecto de la media 100 en unidades de 15 puntos.</p>
    </section>

    <section><h2>7. Perfil de puntuaciones</h2>${profileGraph(result)}</section>

    <section><h2>8. Interpretación por áreas</h2>
      <h3>Vocabulario / componente verbal</h3><p>${esc(verbalInterpretation(result))}</p>
      <h3>Matrices / componente no verbal</h3><p>${esc(nonverbalInterpretation(result))}</p>
      <h3>CI compuesto</h3><p>${esc(globalInterpretation(result))}</p>
    </section>

    <section><h2>9. Comparación verbal–no verbal</h2><p>${esc(differenceText(result))}</p></section>

    <section><h2>10. Síntesis técnica</h2><p>${esc(technicalSynthesis(result))}</p></section>

    <section><h2>11. Alcances, limitaciones y recomendaciones</h2>
      <ul>
        <li>El K-BIT es una estimación breve y no sustituye una evaluación psicológica, neuropsicológica o educativa integral cuando la pregunta exige mayor profundidad.</li>
        <li>Los percentiles describen la posición relativa frente al grupo normativo de edad; no equivalen a porcentaje de respuestas correctas.</li>
        <li>Las diferencias pequeñas deben interpretarse junto con los intervalos de confianza y la significación de la discrepancia entre escalas.</li>
        <li>En decisiones clínicas, educativas, jurídicas o laborales de alto impacto se recomienda integrar entrevistas, observación, historia relevante y otras medidas convergentes.</li>
      </ul>
      <p><strong>Recomendación ajustada al contexto:</strong> ${esc(contextRecommendations(caseData,result))}</p>
      ${e.relevantData ? `<p><strong>Información contextual relevante registrada:</strong> ${esc(e.relevantData)}</p>` : ''}
    </section>

    <section><h2>12. Anexos documentales</h2>
      <p>Se recomienda conservar junto con este informe la plantilla/hoja de respuestas, el registro digital de reactivos y las observaciones de aplicación. La aplicación ofrece la descarga de la plantilla original como documento separado para archivo del expediente.</p>
    </section>

    <section class="signature"><h2>Profesional responsable</h2>
      <p><strong>${esc(pr.fullName || '________________________________')}</strong></p>
      <p>${esc(pr.role || 'Psicología / evaluación')} · Registro: ${esc(pr.registration || '________________')}</p>
      <p>${esc(pr.institution || '')}</p><p>Firma: _______________________________</p>
    </section>
  </article>`;
}

export function buildLocalContextualReport(caseData, result) {
  const e=caseData.evaluation;
  const ctx=contextLabel(caseData);
  const d=result.difference;
  const observed=[];
  if(result.verbal) observed.push(`Vocabulario: PT ${result.verbal.pt}, percentil ${result.verbal.percentile}, categoría ${result.verbal.category}.`);
  if(result.nonverbal) observed.push(`Matrices: PT ${result.nonverbal.pt}, percentil ${result.nonverbal.percentile}, categoría ${result.nonverbal.category}.`);
  if(result.composite) observed.push(`CI compuesto: ${result.composite.ci}, percentil ${result.composite.percentile}, categoría ${result.composite.category}.`);
  if(d) observed.push(`Diferencia verbal–no verbal: ${d.absolute} puntos; ${d.significant05?'significativa a p<0,05':'no significativa a p<0,05'}.`);

  return `<article class="report contextual-report">
    ${reportHeader(caseData,result,'Informe contextualizado K-BIT','Integración de resultados, antecedentes y condiciones de evaluación')}
    <section><h2>1. Propósito y marco de lectura</h2><p>La presente integración se formula para el contexto <strong>${esc(ctx)}</strong>. Mantiene separados los resultados observados, las condiciones asociadas descritas en el caso y las hipótesis interpretativas. El K-BIT, por su carácter breve, no permite atribuir causalidad ni fundamentar por sí solo decisiones definitivas.</p></section>
    <section><h2>2. Núcleo técnico del resultado</h2>${standardizedResultsTable(caseData,result)}${profileGraph(result)}</section>
    <section><h2>3. Datos observados</h2><ul>${observed.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><strong>Condiciones de aplicación registradas:</strong> ${esc(caseData.application.observations || 'Sin observaciones adicionales.')}</p><p><strong>Trazabilidad:</strong> ${esc(administrationCautions(caseData,result))}</p></section>
    <section><h2>4. Información contextual aportada</h2><p>${esc(e.relevantData || 'No se aportó información contextual adicional.')}</p>${e.contextDetails?`<p>${esc(e.contextDetails)}</p>`:''}</section>
    <section><h2>5. Integración contextual</h2><p>${esc(contextualIntegration(caseData,result))}</p><p>${esc(contextImplication(caseData,result))}</p></section>
    <section><h2>6. Hipótesis interpretativas y alternativas</h2><p>${esc(hypothesisText(caseData,result))}</p></section>
    <section><h2>7. Recomendaciones de integración</h2><p>${esc(contextRecommendations(caseData,result))}</p><p>Las hipótesis anteriores deben contrastarse con entrevistas, observación, historia relevante y otras medidas pertinentes al propósito de la evaluación. Cualquier divergencia entre el resultado cognitivo breve y el funcionamiento cotidiano merece exploración adicional antes de formular conclusiones.</p></section>
    <section><h2>8. Cautelas</h2><p>No se infiere causalidad a partir de asociaciones contextuales. Las puntuaciones describen el rendimiento bajo las condiciones de esta aplicación y no agotan las capacidades, recursos, dificultades ni posibilidades futuras de la persona evaluada.</p></section>
  </article>`;
}

function contextualIntegration(caseData,result){
  if(!result.composite) return 'La información cuantitativa aún es insuficiente para realizar una integración contextual.';
  const d=result.difference;
  let text=`El CI compuesto de ${result.composite.ci} (percentil ${result.composite.percentile}) constituye la referencia global, mientras Vocabulario y Matrices permiten examinar la organización interna del perfil. `;
  if(d?.significant05) text += `La discrepancia ${d.direction.toLowerCase()} es estadísticamente significativa, por lo que el perfil debe analizarse como heterogéneo y el índice compuesto no debería ser la única cifra comunicada. `;
  else if(d) text += 'La diferencia entre las escalas no alcanza significación estadística, lo que favorece una lectura más integrada del rendimiento verbal y no verbal. ';
  text += 'La relación entre este patrón y los antecedentes del caso debe plantearse como asociación o hipótesis, no como explicación causal.';
  return text;
}

function hypothesisText(caseData,result){
  if(!result.verbal || !result.nonverbal) return 'No existen datos suficientes para formular hipótesis sobre el patrón verbal/no verbal.';
  const delta=result.verbal.pt-result.nonverbal.pt;
  if(Math.abs(delta)<1) return 'El perfil no muestra una dirección diferencial entre Vocabulario y Matrices. Si existen dificultades o fortalezas contextuales específicas, conviene explorar otros procesos no evaluados directamente por esta prueba breve.';
  const higher=delta>0?'verbal':'no verbal';
  const lower=delta>0?'no verbal':'verbal';
  return `Se observa un rendimiento relativamente mayor en el componente ${higher} que en el ${lower}. Esta configuración puede ser relevante al contrastarla con la historia de aprendizaje, oportunidades educativas, dominio lingüístico, demandas actuales y condiciones de aplicación. No permite concluir que alguno de esos factores sea la causa del patrón observado.`;
}

export function buildAnonymousAIPayload(caseData,result){
  return {
    alias:caseData.privacy.alias,
    edad:result.age?{anios:result.age.years,meses:result.age.months,dias:result.age.days}:null,
    escolaridad_general:caseData.patient.education||'No registrada',
    contexto_evaluacion:contextLabel(caseData),
    motivo:redactNarrative(caseData,caseData.evaluation.reason),
    datos_relevantes:redactNarrative(caseData,caseData.evaluation.relevantData),
    contexto_adicional:redactNarrative(caseData,caseData.evaluation.contextDetails),
    observaciones_aplicacion:redactNarrative(caseData,caseData.application.observations),
    trazabilidad_administracion:{
      vocabulario_expresivo:administrationSummary(caseData,'vocabExpresivo'),
      definiciones:result.definitionsActive?administrationSummary(caseData,'definiciones'):null,
      matrices:administrationSummary(caseData,'matrices'),
      incidencias:administrationCautions(caseData,result)
    },
    resultados:{
      verbal:result.verbal?{bruto:result.raw.vocab,tipico:result.verbal.pt,percentil:result.verbal.percentile,categoria:result.verbal.category,ic:result.verbal.ic}:null,
      no_verbal:result.nonverbal?{bruto:result.raw.matrices,tipico:result.nonverbal.pt,percentil:result.nonverbal.percentile,categoria:result.nonverbal.category,ic:result.nonverbal.ic}:null,
      compuesto:result.composite?{suma_tipicos:result.composite.sum,ci:result.composite.ci,percentil:result.composite.percentile,categoria:result.composite.category,ic:result.composite.ic}:null,
      diferencia:result.difference,
    }
  };
}

export function buildAIPrompt(caseData,result){
  const payload=buildAnonymousAIPayload(caseData,result);
  return `Actúa como asistente de redacción para un profesional de psicología. Redacta un INFORME CONTEXTUALIZADO COMPLETO DEL K-BIT, no un resumen ejecutivo, a partir exclusivamente de los datos anonimizados proporcionados.

REGLAS OBLIGATORIAS:
- El documento debe ser un informe desarrollado, no una síntesis breve ni una lista de conclusiones.
- Conserva un núcleo técnico explícito: puntuaciones directas cuando estén disponibles, PT/CI, percentiles, categorías, intervalos de confianza y discrepancia verbal-no verbal.
- Integra la trazabilidad de administración (inicio, retorno, crédito previo, cierre, tiempo e incidencias) cuando sea relevante para valorar la calidad de la aplicación.
- Distingue de forma visible: DATOS OBSERVADOS, INFORMACIÓN CONTEXTUAL, CONDICIONES ASOCIADAS e HIPÓTESIS INTERPRETATIVAS.
- No atribuyas causalidad. No conviertas asociación en explicación.
- No emitas diagnósticos categóricos ni decisiones clínicas, jurídicas, educativas o laborales definitivas.
- No inventes síntomas, antecedentes, conductas, datos normativos ni resultados.
- Explica el alcance de una prueba breve y propone integración con otras fuentes cuando sea pertinente.
- No reconstruyas identidad, nombres, documentos, instituciones específicas ni fecha exacta de nacimiento.
- El texto será revisado, editado y validado por el profesional responsable.

ESTRUCTURA OBLIGATORIA:
1. Propósito y contexto de evaluación.
2. Condiciones y trazabilidad de la aplicación.
3. Síntesis técnica del perfil.
4. Interpretación de Vocabulario.
5. Interpretación de Matrices.
6. Interpretación del CI compuesto.
7. Comparación verbal-no verbal y significado de la discrepancia.
8. Datos observados e información contextual relevante.
9. Condiciones asociadas e hipótesis interpretativas alternativas.
10. Implicaciones prudentes para el contexto específico de evaluación.
11. Alcances, limitaciones y recomendaciones de integración.
12. Síntesis contextual final.

No uses la expresión "informe ejecutivo" ni reduzcas el contenido a una sola síntesis.

DATOS ANONIMIZADOS:
${JSON.stringify(payload,null,2)}`;
}

export function contextualReportWithAI(caseData,result){
  const text=(caseData.reports.contextualAIText||'').trim();
  if(!text) return `<article class="report contextual-report ai-report-empty">
    ${reportHeader(caseData,result,'Informe contextualizado K-BIT - versión asistida por IA','Aún no se ha incorporado una respuesta de IA')}
    <section><h2>Estado de la versión asistida</h2><div class="notice warn"><strong>Sin contenido de IA cargado.</strong> Esta vista no sustituye ni repite el informe contextual base. Copie el prompt anonimizado, obtenga el borrador en el sistema de IA autorizado y péguelo en el campo correspondiente. Después, la previsualización mostrará exclusivamente la versión asistida.</div></section>
    <section><h2>Núcleo técnico disponible</h2>${standardizedResultsTable(caseData,result)}${profileGraph(result)}</section>
  </article>`;
  return `<article class="report contextual-report ai-assisted-report">
    ${reportHeader(caseData,result,'Informe contextualizado K-BIT - versión asistida por IA','Integración contextual diferenciada del informe base y sujeta a validación profesional')}
    <section><h2>1. Núcleo técnico verificado por la aplicación</h2>${standardizedResultsTable(caseData,result)}${profileGraph(result)}</section>
    <section><h2>2. Desarrollo contextual asistido por IA</h2><div class="ai-generated-body">${text.split(/\n{2,}/).map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>
    <section><h2>3. Nota de validación profesional</h2><p>Esta versión incorpora texto producido externamente por IA a partir de un paquete anonimizado. Debe revisarse, contrastarse con el expediente y validarse por el profesional responsable antes de cualquier uso clínico, educativo, jurídico, laboral o investigativo. Los resultados psicométricos mostrados en el núcleo técnico proceden del motor local de la aplicación y no deben ser alterados por el texto generado.</p></section>
  </article>`;
}

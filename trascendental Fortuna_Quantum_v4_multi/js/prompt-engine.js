(function () {
  'use strict';

  const MATRIX_LABELS = Object.fromEntries((window.FQ_MATRICES || []).map(item => [item.id, item.name]));

  function valueOr(value, fallback = 'No especificado') {
    const cleaned = String(value ?? '').trim();
    return cleaned || fallback;
  }

  function yesNo(value) {
    return value ? 'Sí' : 'No';
  }

  function selectedMatrixNames(ids) {
    return ids.map(id => MATRIX_LABELS[id] || id);
  }

  function buildMatrixInstructions(data) {
    const sections = [];
    const selected = new Set(data.matrices);

    if (selected.has('historical')) {
      sections.push(`AGENTE HISTÓRICO-ESTADÍSTICO
1. Identifica la fuente oficial o institucional más fiable del conjunto de datos de referencia.
2. Verifica reglas vigentes, rango numérico, bolas adicionales, series, periodicidad y cambios históricos del formato.
3. Informa: URL o nombre de la fuente, periodo cubierto, cantidad exacta de registros históricos y registros faltantes o dudosos.
4. No sustituyas el conjunto de datos por otra lotería, aunque comparta formato.
5. Segmenta el historial cuando hayan cambiado las reglas.
6. Calcula frecuencia total y reciente, recencia, paridad, suma, dispersión, consecutivos y coapariciones cuando el formato lo permita.
7. Trata los números calientes, fríos y retrasados como descripciones del pasado. No presupongas compensación futura ni utilices la falacia del jugador.
8. Si la cobertura es insuficiente, indícalo y reduce el peso de esta matriz.`);
    }

    if (selected.has('numerology')) {
      sections.push(`AGENTE NUMEROLÓGICO TRANSPARENTE
1. Utiliza el sistema seleccionado: ${valueOr(data.numerologySystem)}.
2. Explicita la tabla o regla de conversión empleada y muestra operaciones resumidas.
3. Examina fecha de nacimiento, nombre de uso, palabra significativa, fecha biográfica, fecha de corte o simulación y números recurrentes únicamente cuando estén disponibles.
4. Distingue número compuesto, número reducido y números maestros cuando la escuela elegida los conserve.
5. Convierte los resultados al rango válido del formato experimental mediante una regla declarada; no ocultes transformaciones.
6. Presenta todas las asociaciones como correspondencias simbólicas, no como evidencia de causalidad o probabilidad.`);
    }

    if (selected.has('celestial')) {
      sections.push(`AGENTE CELESTE
1. Utiliza la fecha, hora, ciudad y zona horaria indicadas.
2. Consulta efemérides o fuentes astronómicas confiables para fase lunar y posiciones que realmente puedas verificar.
3. Distingue hechos astronómicos de interpretaciones astrológicas.
4. Puede considerar fase lunar, día planetario, periodo zodiacal, luminarias, planetas y estrellas fijas solo cuando exista una regla de correspondencia declarada.
5. No inventes posiciones, aspectos ni eventos celestes cuando falten datos.
6. Traduce cada correspondencia a valores numéricos mediante una operación visible y reproducible.
7. Etiqueta el resultado como simbólico-cultural.`);
    }

    if (selected.has('temporal')) {
      sections.push(`AGENTE TEMPORAL
1. Analiza la fecha de corte o simulación como día, mes, año, día de la semana y ciclo.
2. Cuando existan datos personales, relaciona año, mes y día personales sin convertirlos en destino fijo.
3. Distingue periodicidad matemática, convención calendárica y cualidad simbólica del tiempo.
4. Explicita toda reducción o correspondencia utilizada.`);
    }

    if (selected.has('spatial')) {
      sections.push(`AGENTE ESPACIAL-NATURAL
1. Considera país, ciudad, orientación elegida, hora local, estación o contexto natural solo cuando sean pertinentes y verificables.
2. Puedes utilizar correspondencias territoriales, direccionales o cosmológicas, pero debes nombrar la tradición o regla empleada.
3. No presentes el espacio como una fuerza causal demostrada.
4. No infieras personalidad, moralidad ni destino mediante rostro, cuerpo, voz u otros rasgos físicos.`);
    }

    if (selected.has('textual')) {
      sections.push(`AGENTE TEXTUAL-VISIONARIO
1. Trabaja con la pregunta, palabra, nombre del juego de referencia, sueño, imagen o símbolo aportado.
2. Diferencia análisis semántico, conversión alfanumérica e interpretación narrativa.
3. Formula hipótesis abiertas: “podría resonar”, “se puede leer simbólicamente” o expresiones equivalentes.
4. No conviertas duelos, enfermedades, pérdidas, accidentes o conflictos en castigos, culpas cósmicas o destinos inevitables.
5. No inventes información ausente para completar el relato.`);
    }

    if (selected.has('gestural')) {
      sections.push(`AGENTE GESTUAL
1. Utiliza la semilla gestual suministrada como entrada aleatoria-participativa.
2. No interpretes el movimiento como diagnóstico, rasgo de personalidad ni lectura corporal.
3. Explica cómo la semilla se transforma en una secuencia reproducible.
4. Mantén esta matriz independiente de las interpretaciones posteriores.`);
    }

    if (selected.has('random')) {
      sections.push(`AGENTE DE AZAR PURO
1. Audita el control aleatorio local mediante sus métricas y huella de integridad.
2. Describe el procedimiento pseudoaleatorio declarado por la aplicación sin intentar reconstruir estados ocultos.
3. No ajustes retrospectivamente las métricas para forzar coincidencias con otras matrices.
4. Utiliza el control como línea base comparativa del experimento.`);
    }

    if (selected.has('integrative')) {
      sections.push(`AGENTE INTEGRADOR Y AUDITOR
1. Construye para cada control FQ un vector cualitativo de procedencia según las matrices activas.
2. Identifica convergencias solo cuando provengan de operaciones realmente independientes.
3. Diferencia convergencia, repetición interna y coincidencia casual.
4. Utiliza “densidad relacional” o “nivel de convergencia”; no lo conviertas en probabilidad.
5. Evita que una sola matriz domine la interpretación de todos los controles.
6. Comprueba coherencia entre formato, tamaño, métricas, huellas y limitaciones declaradas.
7. Audita fuentes, cálculos y transformaciones. Si algo no puede verificarse, decláralo.`);
    }

    return sections.join('\n\n');
  }

  function buildOutputLabels(data) {
    const labels = [];
    const selected = new Set(data.matrices);

    if (selected.has('random')) labels.push('MUESTRA BASE ALEATORIA');
    if (selected.has('historical')) labels.push('MUESTRA DE MAPA HISTÓRICO');
    if (selected.has('numerology')) labels.push('MUESTRA DE RESONANCIA NUMEROLÓGICA');
    if (selected.has('celestial') || selected.has('temporal')) labels.push('MUESTRA CELESTE-TEMPORAL');
    if (selected.has('spatial') || selected.has('textual') || selected.has('gestural')) labels.push('MUESTRA SIMBÓLICA-PARTICIPATIVA');
    if (selected.has('integrative')) labels.push('MUESTRA DE SÍNTESIS RELACIONAL');

    const unique = [...new Set(labels)];
    while (unique.length < Number(data.combinationCount)) {
      unique.push(`MUESTRA EXPERIMENTAL ${unique.length + 1}`);
    }
    return unique.slice(0, Number(data.combinationCount));
  }

  function buildPrompt(data) {
    const matrixNames = selectedMatrixNames(data.matrices);
    const localNumerology = window.FQ_NUMEROLOGY.buildLocalPreview(data);
    const auditPacket = data.auditPacket || null;
    const auditJson = auditPacket ? JSON.stringify(auditPacket, null, 2) : '{"estado":"paquete local no disponible"}';

    return `FORTUNA QUANTUM v4.2 · LABORATORIO RELACIONAL
SIMULACIÓN ACADÉMICA Y AUDITORÍA DE SESGOS

PROPÓSITO DE LA EJECUCIÓN

Analiza un experimento de software que relaciona datos verificables, transformaciones simbólicas y controles aleatorios. El objetivo es evaluar trazabilidad, independencia entre matrices, coincidencias, sobreinterpretación y falacia del jugador. No se solicita predicción, asesoría económica ni reconstrucción de una selección utilizable.

La aplicación ya ejecutó localmente controles sintéticos y entregó un paquete de auditoría con métricas y huellas de integridad. Tu tarea es analizar ese paquete, verificar las fuentes que estén disponibles y desarrollar las matrices seleccionadas. No inventes valores ocultos, no intentes deducirlos y no reemplaces las métricas por palabras fantasiosas, símbolos decorativos o secuencias alternativas.

REGLAS DE EJECUCIÓN

1. Separa siempre DATO, DESCRIPCIÓN, SIMBOLISMO y AZAR.
2. Una regularidad histórica describe el pasado; no implica compensación ni ventaja futura.
3. Una correspondencia numerológica, temporal, celeste, espacial o textual es simbólica-cultural, no causal.
4. Si una fuente, efeméride o historial no puede comprobarse, escribe “no verificado” y continúa con las capas disponibles.
5. No afirmes haber ejecutado una matriz cuando solo dispones de un control local.
6. No fabriques URLs, cantidad de registros, posiciones astronómicas, hashes, cálculos ni tradiciones.
7. Conserva los identificadores FQ y las huellas exactamente como aparecen en el paquete.
8. No publiques ni reconstruyas estados individuales ocultos. Trabaja con suma, media, amplitud, dispersión, paridad, tercios, consecutivos y huellas.
9. “Quantum” funciona como metáfora relacional; no constituye evidencia de física cuántica aplicada.

═══════════════════════════════════════════════════════════
DATOS DE LA CONSULTA

Modo de lectura: ${valueOr(data.modeName)}
Profundidad: ${valueOr(data.depth)}
Cantidad de controles: ${valueOr(data.combinationCount)}
Matrices activas: ${matrixNames.join(', ') || 'Ninguna'}

ESCENARIO DOCUMENTAL
• País o contexto: ${valueOr(data.country)}
• Ciudad o región: ${valueOr(data.city)}
• Escenario o dataset de referencia: ${valueOr(data.lottoName)}
• Tipo de estructura: ${valueOr(data.type)}
• Fecha de corte: ${valueOr(data.drawDate)}
• Hora local: ${valueOr(data.drawTime)}
• Zona horaria: ${valueOr(data.timezone)}
• Estructura informada: ${valueOr(data.config)}
• Incluye serie o fracción: ${yesNo(data.hasSeries)}
• Fuente documental sugerida: ${valueOr(data.officialSource)}

INSUMOS SIMBÓLICOS
• Fecha de nacimiento: ${valueOr(data.birthDate)}
• Nombre de uso: ${valueOr(data.userName)}
• Sistema numerológico: ${valueOr(data.numerologySystem)}
• Palabra significativa: ${valueOr(data.significantWord)}
• Pregunta o intención: ${valueOr(data.intention)}
• Números recurrentes declarados: ${valueOr(data.recurringNumbers)}
• Fecha biográfica significativa: ${valueOr(data.significantDate)}
• Sueño, imagen o símbolo: ${valueOr(data.symbol)}
• Dirección elegida: ${valueOr(data.direction)}
• Semilla gestual: ${valueOr(data.gestureSeed)}
• Identificador técnico de sesión: ${valueOr(data.sessionSeed)}

PRELECTURA NUMEROLÓGICA LOCAL
${localNumerology.length ? localNumerology.map(item => `• ${item}`).join('\n') : '• Sin cálculos locales por ausencia de datos.'}

═══════════════════════════════════════════════════════════
PROTOCOLO DE AGENTES

AGENTE VERIFICADOR DEL ESCENARIO
1. Comprueba la existencia y pertinencia del dataset únicamente si hay una fuente consultable.
2. Registra la fecha de consulta, cobertura y limitaciones.
3. Señala diferencias entre la estructura informada y la documentada.
4. Si no existe acceso verificable, conserva el dataset como referencia declarada y no inventes resultados.

${buildMatrixInstructions(data)}

═══════════════════════════════════════════════════════════
PAQUETE DE AUDITORÍA LOCAL

${auditJson}

El paquete contiene métricas agregadas y huellas de integridad. Las huellas permiten distinguir ejecuciones, pero no prueban que una matriz sea predictiva. El control rotulado para contraste histórico no debe presentarse como resultado histórico mientras no exista un dataset verificado. Del mismo modo, la capa celeste requiere efemérides comprobables.

═══════════════════════════════════════════════════════════
LÓGICA RELACIONAL

Para cada control FQ, construye un vector cualitativo de procedencia según las matrices activas:
V(FQ) = [H, N, C, T, E, X, G, A]

H = histórico descriptivo verificado
N = numerológico simbólico
C = celeste simbólico-cultural
T = temporal
E = espacial-natural
X = textual-visionario
G = gestual participativo
A = control aleatorio

No sumes componentes inexistentes ni conviertas el vector en probabilidad. Compara la estructura agregada de los controles y distingue convergencia independiente, repetición interna y coincidencia casual.

MODO: ${valueOr(data.modeName).toUpperCase()}
${modeGuidance(data.mode)}

PROFUNDIDAD: ${valueOr(data.depth).toUpperCase()}
${depthGuidance(data.depth)}

═══════════════════════════════════════════════════════════
FORMATO DE SALIDA

Titula el resultado: “SIMULACIÓN ACADÉMICA Y AUDITORÍA RELACIONAL”.

1. ALCANCE Y CALIDAD DE LOS DATOS
Explica qué fue verificado, qué proviene del formulario y qué permanece no verificado.

2. MATRICES REALMENTE EJECUTADAS
Tabla: matriz, insumo, operación, resultado disponible, estatuto epistemológico y limitación.

3. MAPA HISTÓRICO DESCRIPTIVO
Inclúyelo solo si encontraste un historial suficiente y verificable. Informa periodo, cantidad exacta de registros, faltantes, frecuencias, recencia y estructura. Si no existe cobertura, indícalo sin sustituirlo por datos sintéticos.

4. MAPA SIMBÓLICO
Expón por separado numerología, tiempo, cielo, espacio, texto y gesto. Muestra operaciones resumidas y nombra la regla o tradición usada.

5. LECTURA DEL PAQUETE LOCAL
Analiza cada identificador FQ mediante sus métricas: suma, media, amplitud, desviación, paridad, distribución por tercios y consecutivos. Conserva las huellas exactamente. No reconstruyas valores ocultos.

6. CONVERGENCIAS, DIVERGENCIAS Y SESGOS
Distingue coincidencias estructurales, dependencias entre reglas, sobreajuste, apofenia y falacia del jugador.

7. AUDITORÍA FINAL
Confirma qué cálculos son reproducibles, cuáles dependen de fuentes externas y cuáles son interpretaciones simbólicas. Señala cualquier aproximación o inconsistencia.

8. NOTA DE ALCANCE
Incluye: “Esta simulación organiza datos, símbolos y azar para estudiar el método; no posee valor predictivo ni finalidad económica”.

REGLAS DE REDACCIÓN
• No repitas estas instrucciones.
• No dramatices una negativa ni transformes el informe en un sermón preventivo.
• No inventes un universo de palabras como “Zafiro”, “Marea” o equivalentes.
• No presentes métricas sintéticas como si fueran historial real.
• No ocultes una limitación importante detrás de lenguaje técnico.
• Diferencia con claridad hechos, descripciones, simbolismos e inferencias.
• Ejecuta ahora el análisis con los datos disponibles.`;
  }

  function modeGuidance(mode) {
    const guidance = {
      evidencial: 'Da prioridad a datos verificables y al control aleatorio. Las matrices simbólicas no deben incorporarse si no fueron seleccionadas.',
      simbolico: 'Da prioridad a correspondencias culturales y narrativas, siempre separadas de los hechos astronómicos o matemáticos. Mantén una línea aleatoria de contraste.',
      relacional: 'Distribuye la atención entre las matrices activas y permite que la síntesis emerja de sus convergencias, no de una fórmula fijada de antemano.',
      oraculo: 'No simules evidencia histórica. Trabaja con símbolo, gesto, texto y azar como experiencia interpretativa abierta.'
    };
    return guidance[mode] || guidance.relacional;
  }

  function depthGuidance(depth) {
    const guidance = {
      Ligero: 'Resume operaciones y presenta solo los hallazgos necesarios para comprender la procedencia de las muestras.',
      Profundo: 'Muestra operaciones esenciales, fuentes, convergencias y auditoría con suficiente detalle para reproducir el proceso.',
      Integral: 'Desarrolla cada matriz activa, contrasta tradiciones, documenta transformaciones y ofrece la máxima trazabilidad razonable.'
    };
    return guidance[depth] || guidance.Profundo;
  }

  window.FQ_PROMPT_ENGINE = { buildPrompt };
})();

/* ============================================================
   PANTALLAS — parte 3: tirada, prompt, pegado de respuesta
   ============================================================ */

registerRoute('tirada', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Lo que se revela</div>
    <h2>Ahora, lo que no decides tú</h2>
    <div class="spacer-sm"></div>
    <p class="body-text">Las tradiciones que inspiran esta bitácora coinciden en algo: no elegimos del todo qué alma somos, qué aprendizajes traemos ni qué rol cumplimos en cada ciclo — eso se va revelando. Esta parte no depende de lo que escribiste: es una combinación al azar entre antigüedad del alma, arquetipo y aprendizaje pendiente, que se cruzará con tus respuestas para construir la lectura.</p>
    <div class="spacer-md"></div>
    <div class="center" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;">
      <div id="tirada-visual" style="width:64px; height:64px; border:1px solid var(--ember-dim); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <div style="width:8px; height:8px; background:var(--ember); border-radius:50%;"></div>
      </div>
      <p class="muted" id="tirada-status">Toca para revelar</p>
    </div>
  `;
  const visual = s.querySelector('#tirada-visual');
  const status = s.querySelector('#tirada-status');
  let lanzado = false;
  visual.style.cursor = 'pointer';
  visual.onclick = ()=>{
    if(lanzado) return;
    lanzado = true;
    visual.style.transition = 'transform .6s ease';
    visual.style.transform = 'rotate(360deg)';
    status.textContent = 'Revelando...';
    setTimeout(()=>{
      cur.tirada = {
        antiguedad: pickRandom(ANTIGUEDAD),
        arquetipo: pickRandom(ARQUETIPOS),
        aprendizaje: pickRandom(APRENDIZAJES),
      };
      go('tirada-resultado');
    }, 700);
  };
  navFooter(s, [
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modE') },
  ]);
});

registerRoute('tirada-resultado', (s)=>{
  const t = cur.tirada;
  s.innerHTML = `
    <div class="eyebrow">Resultado del azar</div>
    <h2>Tu combinación de esta lectura</h2>
    <div class="spacer-md"></div>
    <div class="option-card" style="cursor:default;">
      <span class="tag">Antigüedad</span>
      <div class="spacer-sm"></div>
      <div class="ocard-title">${t.antiguedad.nombre}</div>
      <div class="ocard-sub">${t.antiguedad.desc}</div>
    </div>
    <div class="option-card" style="cursor:default;">
      <span class="tag">Arquetipo</span>
      <div class="spacer-sm"></div>
      <div class="ocard-title">${t.arquetipo.nombre}</div>
      <div class="ocard-sub">${t.arquetipo.desc}</div>
    </div>
    <div class="option-card" style="cursor:default;">
      <span class="tag">Aprendizaje pendiente</span>
      <div class="spacer-sm"></div>
      <div class="ocard-title">${t.aprendizaje.nombre}</div>
      <div class="ocard-sub">${t.aprendizaje.desc}</div>
    </div>
  `;
  navFooter(s, [
    { label:'Generar mi lectura', onClick: ()=>{
      cur.promptGenerado = buildPrompt();
      go('prompt-listo');
    }},
    { label:'Lanzar de nuevo', variant:'btn-ghost', onClick: ()=> go('tirada') },
  ]);
});

/* ---------- construcción del prompt ---------- */


function buildAjustesPromptText(){
  const a = ensureAjustesInforme();
  const partes = [];
  if(a.periodos && a.periodos.length){
    partes.push('Períodos o épocas corregidos/agregados por el usuario durante la revisión del informe anterior:');
    a.periodos.forEach(p=>{
      partes.push(`  - Etapa ${p.etapa_numero}${p.etapa_titulo ? ' · ' + p.etapa_titulo : ''}: ${p.periodo_usuario}${p.periodo_anterior ? ' (antes aparecía como: ' + p.periodo_anterior + ')' : ''}`);
    });
  }
  if(a.correccionesEtapa && a.correccionesEtapa.length){
    partes.push('Correcciones del usuario por etapa:');
    a.correccionesEtapa.forEach(c=> partes.push(`  - Etapa ${c.etapa_numero || '?'}: ${c.texto || c.observacion || JSON.stringify(c)}`));
  }
  if(a.observaciones && a.observaciones.length){
    partes.push('Observaciones generales del usuario para la regeneración:');
    a.observaciones.forEach(o=> partes.push(`  - ${typeof o === 'string' ? o : (o.texto || o.observacion || JSON.stringify(o))}`));
  }
  return partes.length ? partes.join('\n') : '  (no hay ajustes manuales del informe anterior)';
}

function buildPrompt(){
  const a = cur.moduloA, b = cur.moduloB, d = cur.moduloD, t = cur.tirada;
  const vinculosTxt = cur.moduloC.length
    ? cur.moduloC.map(v => `  - ${v.nombre} (${v.tipoVinculo})${v.notas ? ': ' + v.notas : ''}`).join('\n')
    : '  (el usuario no registró vínculos específicos)';
  const nombresVinculos = cur.moduloC.map(v => v.nombre);
  const ajustesTxt = buildAjustesPromptText();

  const eventosTxt = cur.moduloE.length
    ? cur.moduloE.map((ev,i) => `  Momento ${i+1}${ev.etapaVida ? ' — ' + ev.etapaVida : ''}:
    Personas implicadas: ${ev.personas || '(no indicado)'}
    Sentimientos: ${ev.sentimientos || '(no indicado)'}
    ¿Lo siente kármico?: ${ev.esKarmico || '(no indicado)'}
    Descripción: ${ev.descripcion}`).join('\n\n')
    : '  (el usuario no registró momentos difíciles específicos)';

  return `Actúa como un intérprete simbólico especializado en narrativa reencarnacionista, inspirado en tradiciones espirituales sobre aprendizaje del alma y en relatos terapéutico-narrativos de regresión. Responde en español, con tono cálido, reflexivo y literario, nunca clínico, sentencioso ni dogmático.

AISLAMIENTO DE CONTEXTO — LEE ESTO ANTES QUE NADA, ES LA REGLA MÁS IMPORTANTE DE TODO ESTE PROMPT: si en esta misma conversación ya hablamos antes de otra persona, otro caso, otra lectura o cualquier otro material — real o de prueba — IGNÓRALO POR COMPLETO. No mezcles, no reutilices, no recuerdes ningún nombre, vínculo, etapa, período o dato de nada anterior en este chat, aunque se parezca a lo que sigue. La ÚNICA fuente válida para esta lectura es el bloque "DATOS APORTADOS POR EL USUARIO" que aparece más abajo en este mismo mensaje. Si tienes cualquier impresión de haber visto antes un nombre o una escena parecida en esta conversación, trátala como si no existiera — esta lectura es un caso nuevo y cerrado en sí mismo.

MARCO DE SEGURIDAD SIMBÓLICA
Esta lectura es presuntoria: organiza posibilidades simbólicas, no hechos verificables. Nunca digas "esto fue", "tú fuiste", "esta persona es realmente". Usa siempre fórmulas como "podría resonar", "se puede leer simbólicamente", "parece dialogar con", "funcionaría como hipótesis narrativa". No conviertas síntomas, duelos, pérdidas reales ni vínculos actuales en castigos, destinos cerrados o pruebas de culpa.

NOTA SOBRE EL TEXTO DEL USUARIO
Buena parte de los datos pudo venir de dictado por voz. Corrige mentalmente errores evidentes de transcripción por contexto, sin inventar contenido nuevo. No repitas fórmulas mecánicas como "el usuario informa", "el usuario refiere", "el material indica". Escribe con naturalidad narrativa.

SISTEMA DE CURADURÍA EN BUCLE — SIMULA ESTOS AGENTES ANTES DE ENTREGAR EL JSON
No muestres el razonamiento de los agentes. Úsalos internamente para auditarte.

AGENTE 1 · EXTRACTOR INTEGRAL
Lee TODO el material disponible, no solo el cuadro que parezca más pertinente. Extrae sueños, presencias, sensaciones, marcas corporales simbólicas, déjà vu, intuiciones, ideas de reconocimiento antiguo, vínculos que "se sienten de antes", escenas con agua, guerra, casa, campo, viaje, encierro, muerte, pérdida, maestros, figuras espirituales, objetos, nombres, lugares, oficios, edades, géneros percibidos, emociones y rupturas.
ADVERTENCIA CRÍTICA SOBRE DÓNDE BUSCAR: las escenas de vidas pasadas no siempre viven en la sección principal de sueños — con frecuencia el usuario las menciona DENTRO de la descripción de un vínculo real específico ("siento que en otra vida ella era...", "también la puedo vincular con el sueño de..."). Lee cada vínculo real completo, de principio a fin, buscando específicamente estas menciones incrustadas — no asumas que ya capturaste todas las escenas solo por haber leído la sección de sueños por separado. Una escena mencionada solo dentro de un vínculo es tan válida como una mencionada en la sección principal.
ESCENAS MÚLTIPLES DENTRO DE UN MISMO RELATO DE SUEÑO: si un solo sueño contiene más de una imagen simbólica distinta (por ejemplo, un templo Y un sembrador dentro de la misma narración), evalúa si el usuario tuvo un rol propio y reconocible en cada imagen — aunque ese rol sea el de testigo, no necesariamente el de protagonista central. Si cada imagen tiene su propio evento crítico defendible (vínculo → ruptura o irrupción → inscripción), trátalas como etapas separadas aunque provengan del mismo sueño. No fusiones dos imágenes solo porque aparecieron en la misma narración continua.
ESCENAS SIMILARES EN SUPERFICIE: dos escenas pueden compartir un mismo motivo general (por ejemplo, "muerte de anciana rodeada de familia") sin ser la misma escena. Antes de fusionarlas, revisa si difieren en protagonista secundario, causa de muerte, época, o algún detalle distintivo que el usuario haya dado por separado. Si el usuario mismo las distingue en su relato (aunque sea de forma implícita, en secciones distintas), trátalas como etapas independientes.

AGENTE 2 · CRONÓLOGO SIMBÓLICO
Clasifica cada escena en una de estas tres categorías:
A) período reportado: el usuario nombró explícitamente una época, grupo, evento o fecha;
B) período amplificado: el usuario no dio fecha, pero sí dio rasgos materiales, sociales, ambientales o vinculares suficientes para proponer una atmósfera temporal posible;
C) sin ancla temporal: no hay datos suficientes para fechar ni amplificar sin forzar.
Ordena las etapas desde la más antigua o primigenia hasta la más reciente. Si no hay ancla clara, ordena por la secuencia narrativa del material. Si existe un período corregido por el usuario en los ajustes del informe anterior, úsalo como dato de usuario y no lo trates como invención de la IA.

AGENTE 3 · CARTÓGRAFO DE VIDAS
Construye cada etapa como una posible existencia distinta, no como psicología de la vida actual disfrazada. Cada etapa debe tener período/atmósfera, espacio, rol encarnado, relación principal, evento crítico, huella actual y aprendizaje pendiente. El evento crítico sigue este patrón: vínculo → ruptura → inscripción emocional.

AGENTE 4 · CARTÓGRAFO DE REINGRESOS RELACIONALES
Compara las figuras de sueños, presencias y etapas con los vínculos reales listados por el usuario. Propón reingresos relacionales cuando exista una coincidencia defendible de rol, cualidad, deuda afectiva, protección, herida, guía, autoridad, cuidado, juicio, abandono o reconocimiento. No afirmes identidad. No digas "X es Y". Di "la figura anterior podría resonar hoy con X bajo el rol de...".
REGLA DE NO REDUNDANCIA (crítica): cada par (etapa, persona real) debe aparecer UNA SOLA VEZ en todo el JSON, sin importar en qué campo se registre (vinculo de la etapa, reingresos_relacionales de la etapa, o constelacion general). Si la misma etapa conecta con la misma persona por más de un motivo, integra todos esos motivos en una sola entrada, no en varias con redacciones distintas. Antes de escribir una entrada nueva, revisa si ya registraste esa misma combinación etapa+persona en otro campo — si ya existe, no la repitas.

AGENTE 5 · AMPLIFICADOR NARRATIVO CONTROLADO
Nutre cada escena con contexto narrativo coherente cuando haya evidencia: tiempo, espacio, ambiente, oficio, roles, atmósfera social, vínculo y aprendizaje. Puedes ampliar la escena para que sea legible y rica, pero no agregues nombres propios históricos, fechas exactas, eventos reales ni actores sociales específicos que el usuario no haya nombrado o que no se desprendan claramente de sus rasgos.

AGENTE 6 · TEJEDOR DE ARCOS RELACIONALES
Para cada persona real que aparece en constelacion, evalúa si existe suficiente material para construir un arco relacional longitudinal — no una descripción más, sino el seguimiento de un mismo patrón afectivo a través de las etapas donde esa persona resuena. Solo construye un arco cuando haya evidencia real de la relación actual (en los vínculos que el usuario describió, en momentos difíciles, o en el mapa familiar) — si una persona solo tiene una resonancia simbólica sin descripción real de vínculo actual (por ejemplo, una guía espiritual o una figura arquetípica), no le fuerces un arco: omítela de "arcos_relacionales" por completo, aunque sí siga apareciendo en constelacion con su resonancia habitual.
ESTRUCTURA NARRATIVA COMPLETA (aplica esto a TODA persona con arco, no solo a la más evidente del caso — es una regla general, no una excepción puntual): narra el arco como una secuencia reconocible — qué rol simbólico parece haber tenido esta figura en la(s) etapa(s) pasada(s), qué conflicto o tensión marcó esa relación entonces, qué aprendizaje quedó ahí pendiente o iniciado, qué rol tiene esta persona HOY en la vida actual, y cómo la relación actual parece cerrar, sanar, reparar o seguir arrastrando ese patrón. Usa TODA la evidencia real disponible sobre la relación actual —no una mención genérica— para que el arco se sienta anclado en la historia compartida real, no en una fórmula repetida para cada persona.
LENGUAJE DE POSIBILIDAD OBLIGATORIO, incluso en esta estructura narrativa rica: nunca escribas "fue tu padre/madre/hermano" en modo indicativo sin matiz. Usa siempre fórmulas como "esta figura podría resonar con haber sido tu padre en otra época" o "parece dialogar con el rol de tu madre en aquella escena". La riqueza narrativa no depende de afirmar identidad — depende de nombrar con precisión el rol, el conflicto, el aprendizaje y el cierre, todo en lenguaje de posibilidad.
Para cada persona con evidencia suficiente, identifica también: el patrón emocional o relacional que se repite a través de sus etapas (una promesa incumplida, un cierre que no llegó, una deuda afectiva, un rencor, un amor interrumpido — usa el lenguaje que el propio material sugiera, no una lista fija de categorías); qué de ese patrón parece ya superado en la relación actual, citando la evidencia real que lo sostiene; y qué parte, si acaso, sigue en tránsito sin resolverse del todo. Si el material no sugiere nada pendiente, ese campo va en null — la ausencia de conflicto abierto es información válida, no un vacío que debas llenar.
Este agente no reemplaza a constelacion ni a reingresos_relacionales — es una síntesis adicional que opera sobre la persona ya reconocida, no sobre cada conexión suelta.

AGENTE 7 · DIAGNÓSTICO DE JUSTICIA, AMOR Y CARIDAD
Toma distancia de las etapas individuales y mira el conjunto de la vida actual y la ruta completa como una sola unidad. Para cada una de las tres leyes morales de Kardec (Justicia, Amor, Caridad — Libro Tercero), identifica: dónde el material real muestra que la persona ya avanzó en esa ley (evidencia concreta, no genérica), y dónde el material sugiere que todavía hay un patrón sin resolver en esa misma ley (evidencia concreta). Si no hay evidencia suficiente para alguno de los dos lados, usa null en vez de inventar contenido para llenar el campo. Las "personas_involucradas" de cada ley deben ser nombres que YA aparecen en constelacion, reingresos_relacionales o los vínculos del usuario — nunca introduzcas un nombre nuevo aquí. El campo "posibilidad_de_exploracion" es una invitación reflexiva, jamás una instrucción: usa fórmulas como "¿qué cambiaría si...?" o "una posibilidad simbólica sería...", nunca "deberías", "se recomienda que" o cualquier imperativo. Este diagnóstico no es un balance moral de aprobación o reprobación — evita cualquier fórmula que sugiera examen, calificación o juicio final sobre la persona.
ESTRUCTURA DE CUATRO PARTES POR LEY (obligatoria): antes de "avance_logrado", escribe "prueba_planteada" — qué exigía esta ley a lo largo de la ruta, qué se precisaba vivir o atravesar para aprender de ella, con el marco explícito de que aunque algo no se supere del todo, el alma siempre avanza (Principio 3: cada vida se elige como aprendizaje). Luego "avance_logrado" retoma esa prueba a la luz de lo que el material muestra ya resuelto. Luego "patron_persistente" es una interpretación derivada de las dos anteriores, contrastada con cómo vive esto la persona hoy. Después de "posibilidad_de_exploracion" (que se mantiene igual), agrega una cuarta dimensión: "guia_eternidad" — un arreglo de 5 a 10 viñetas breves, contextuales al caso concreto (nunca filosofía abstracta ni genérica), inspiradas en la práctica de Kardec, Weiss, Chico Xavier y Amalia Domingo Soler, pero adaptadas a esta ruta y esta vida específicas. Cada viñeta debe mantener el mismo lenguaje de posibilidad e invitación que "posibilidad_de_exploracion" — nunca imperativos ni consejos directivos.
TEJIDO MULTI-ETAPA (obligatorio, no opcional): "avance_logrado" y "patron_persistente" de cada ley deben nombrar explícitamente al menos dos etapas distintas por su número y título simbólico, no solo describir la vida actual en abstracto. Usa "mapa_aprendizajes" como puente: si un aprendizaje transversal (ej. "cuidar sin cargarlo todo", etapas 1, 5, 9) resuena con una ley, cita esas etapas por nombre dentro del texto ("la primera estación... la quinta estación..."), y conecta ese eco antiguo con el patrón presente. Si después de revisar mapa_aprendizajes una ley solo tiene una etapa relevante o ninguna, dilo así en vez de forzar conexiones débiles — pero antes de concluir eso, revisa las siete líneas de mapa_aprendizajes completas, no solo las dos o tres más obvias.
BALANCE DE LAS TRES LEYES JUNTAS: al final del balance, en "cierre_del_balance", identifica si algún aprendizaje de "mapa_aprendizajes" no quedó cubierto por ninguna de las tres leyes individuales (por ejemplo, "sostener la propia voz" no es directamente justicia, amor ni caridad) y nómbralo explícitamente ahí, con sus etapas, antes de la síntesis final de cierre. El cierre debe transmitir que las tres leyes no son compartimentos separados, sino la misma pregunta repetida en registros distintos.
RETRATO LITERARIO: además de "lectura_general", escribe "retrato_literario": un párrafo único, más literario y evocador que "lectura_general", que condense la ruta completa citando 2-3 escenas concretas de etapas distintas (no por número, por escena) y conectando CADA una de esas escenas con su propio hecho biográfico real de la vida actual — no un solo hilo conector para todas las escenas, sino 2-3 hilos distintos, cada uno resuelto en una sola frase dentro del mismo párrafo (nunca un párrafo propio por hilo, para no extender demasiado el retrato). Debe poder leerse de forma independiente, como la apertura de un documento distinto — evita reutilizar frases de "lectura_general" o de "resumen_estaciones_narrativas".
CIERRE Y FRASE FINAL: el campo "cierre" no debe recopilar lo ya dicho en otras secciones — debe nombrar el ciclo específico que se está cerrando, con una interpretación propia derivada de todo lo narrado, tan precisa que se sienta como una síntesis lúcida, no como un resumen. Además, escribe "frase_de_cierre": una sola línea breve, filosófica, contextual al caso, en tono de guía para tiempos mejores — distinta del párrafo de cierre, pensada para destacarse tipográficamente aparte.

AGENTE 8 · AUDITOR FINAL
Antes de entregar el JSON, verifica: 1) no omitiste datos relevantes; 2) no inventaste certeza; 3) cada etapa tiene señal de origen; 4) los períodos reportados o amplificados tienen evidencia; 5) no convertiste recuerdos de esta vida en vidas pasadas; 6) el mapa de reingresos no quedó vacío por exceso de cautela si hay conexiones defendibles; 7) no usaste lenguaje repetitivo tipo "el usuario informa"; 8) el JSON es válido; 9) si fusionaste dos fragmentos en una sola etapa, confirma que cumplen el criterio de "misma escena retomada" (regla 9) y que declaraste el criterio exacto en fusiones_realizadas — nunca fusiones solo por cercanía temática o época compartida; 10) revisa que ninguna combinación etapa+persona real se repita en más de un campo del JSON (vinculo, reingresos_relacionales, constelacion) con redacciones distintas — cada conexión real aparece exactamente una vez, sin importar en cuántos lugares del esquema podría registrarse; 11) revisa que el balance_justicia_amor_caridad no contenga ninguna fórmula directiva ("deberías", "tienes que", "es necesario que") y que cada persona nombrada ahí ya exista en otra parte del material — si una ley no tiene evidencia real en ningún lado, sus campos van en null, no rellenos con generalidades; 12) revisa que "arcos_relacionales" solo incluya personas con evidencia real de vínculo actual — nunca figuras puramente simbólicas —, que "lo_que_sigue_en_transito" esté en null cuando el material no sugiera nada pendiente en vez de inventar un conflicto para llenar el campo, y que ningún arco use "fue tu padre/madre/hermano/etc." en modo indicativo — siempre "podría resonar con haber sido..." o equivalente.

REGLAS INQUEBRANTABLES
1. PERÍODO REPORTADO: cuando el usuario nombra explícitamente un referente histórico real, sí debes situarlo con rango verificable. Ejemplos: esenios ≈ siglo II a.C. al 68-70 d.C.; guerra entre españoles y criollos en Colombia / independencia ≈ 1810-1819; Batalla de Boyacá = 7 de agosto de 1819; mediados de 1800 ≈ 1840-1860; precolombino = antes de 1492. Usa lenguaje de posibilidad, nunca certeza biográfica.
2. PERÍODO AMPLIFICADO: si el usuario no dio fecha, pero sí rasgos suficientes, puedes proponer una atmósfera temporal amplia. Ejemplo: casa rígida, muebles oscuros, matrimonio por conveniencia y educación formal podrían dialogar simbólicamente con siglos XVIII-XIX. Marca nivel de confianza y evidencia. Esto no es inventar: es amplificar con base en rasgos narrativos.
3. SIN ANCLA: si no hay pistas, reconoce honestamente que no hay ancla temporal.
4. Ningún dato se descarta. Si hay demasiado material, agrupa señales relacionadas en una etapa robusta, pero no elimines señales relevantes.
5. Cada etapa debe incluir señal de origen: sueño, presencia, sensación, déjà vu, vínculo, frase o escena concreta que la justifica.
6. No uses momentos difíciles de la vida actual como núcleo de una vida pasada. Úsalos solo como eco actual o huella.
7. Los vínculos reales del usuario se tratan con cuidado: son nombres de su vida actual, no identidades históricas. Conéctalos como resonancias posibles.
8. No banalices duelos, muertes ni sufrimientos. No digas que alguien murió "para enseñar" algo.
9. NÚMERO DE ETAPAS SIN TECHO ARTIFICIAL: la cantidad de etapas la determina el material, no una cifra objetivo. Nunca fusiones dos escenas solo para mantenerte bajo un número de etapas. Solo puedes fusionar dos fragmentos cuando exista evidencia clara de que son la MISMA escena retomada por la persona —mismo protagonista, mismo espacio simbólico, mismo evento central— y uno de los fragmentos simplemente amplía, precisa o corrige al otro (por ejemplo, si la persona vuelve sobre un sueño ya contado y agrega un detalle en otro párrafo). Si dos escenas comparten época, tono o clima emocional pero tienen protagonista, escena central o desenlace distintos, trátalas SIEMPRE como etapas independientes, aunque eso produzca diez, doce o más etapas. La riqueza del material manda sobre la brevedad del informe.
10. La lectura debe ser cartográfica: debe permitir ver vidas, períodos, relaciones, eventos críticos, huellas, aprendizajes y reingresos.
11. AJUSTES DEL USUARIO: si el usuario agregó o corrigió un período en una revisión previa, ese ajuste tiene prioridad como dato aportado por la persona. Debes integrarlo en la nueva lectura, citarlo como período reportado por el usuario y relacionarlo con la evidencia disponible sin inventar precisión adicional.

DATOS APORTADOS POR EL USUARIO (alias: ${cur.alias})

— Material para la lectura de vida actual —
Autodescripción: ${a.autodescripcion}
Patrón que se repite: ${a.patron || '(no indicado)'}
Mapa familiar y relacional: ${d.descripcion || '(no indicado)'}
Momentos difíciles de su historia:
${eventosTxt}
Vínculos que se sienten antiguos:
${vinculosTxt}

— Material para posibles vidas pasadas —
Rasgo sin explicación fácil: ${a.rasgo || '(no indicado)'}
Sensaciones o marcas corporales con carga simbólica: ${a.sensaciones || '(no indicado)'}
Presencias protectoras percibidas: ${b.presencias || '(no indicado)'}
Amigo imaginario de la infancia: ${b.amigoImaginario || '(no indicado)'}
Sueño sentido como guía: ${b.suenoGuia || '(no indicado)'}
Nombre dado a esa presencia: ${b.nombrePresencia || '(no indicado)'}

— Ajustes del informe anterior agregados por el usuario —
${ajustesTxt}

VARIABLES ALEATORIAS DE ESTA LECTURA (componente de azar, no las cambies)
Antigüedad del alma: ${t.antiguedad.nombre} — ${t.antiguedad.desc}
Arquetipo dominante: ${t.arquetipo.nombre} — ${t.arquetipo.desc}
Aprendizaje pendiente: ${t.aprendizaje.nombre} — ${t.aprendizaje.desc}

TAREA
Además del informe completo, genera obligatoriamente una sección adicional llamada "resumen_estaciones_narrativas". Será impresa dentro del informe como bloque de redacción en párrafos continuos; no la omitas, no la reduzcas a etiquetas y no la dejes como esquema.

REGLAS PARA "resumen_estaciones_narrativas"
1. Es una síntesis literaria y sustancial por estaciones narrativas/reencarnaciones simbólicas.
2. Debe abrir con un párrafo general que indique cuántas estaciones aparecen, qué roles encarnados se observan, qué géneros o edades aparecen solo cuando el material lo sostiene, qué muertes/heridas/caídas/tránsitos aparecen si están descritos, y cuál es el núcleo transversal de la vida actual.
3. Luego debe haber un párrafo por cada etapa. Cada párrafo debe iniciar nombrando el número de estación ("En la primera estación narrativa (reencarnación)...", "En la segunda estación narrativa (reencarnación)...", etc.) pero VARÍA la palabra de anclaje temporal que sigue — no uses "situada" en más de dos estaciones seguidas; alterna con "ubicada", "enmarcada", "sucede en", "ocurre hacia", "transcurre en", u otras que el contexto sugiera.
4. En cada párrafo integra: período histórico o simbólico; si no hay fecha comprobable, dilo; rol encarnado; género o edad solo si existe; espacio simbólico; evento crítico; muerte, caída, herida, agonía o tránsito solo si aparece; huella actual; red relacional actual asociada; aprendizaje principal. El "evento crítico" y la "huella actual" deben ir seguidos de un anclaje concreto ("visible en...", "como sucede cuando...") que los haga tangibles, no solo abstractos.
4b. Cierra cada párrafo con una frase breve (no más de dos líneas) que nombre: qué parecía buscarse superar o aprender en esa etapa para avanzar espiritualmente (Principio 3: cada vida se elige como aprendizaje — aunque no se resuelva del todo, el alma siempre avanza), y qué de eso se logró y qué quedó pendiente, en la medida en que el material lo sugiera. Esto es una pincelada breve, NO una repetición del balance global de Justicia, Amor y Caridad que aparece al final del informe — evita duplicar ahí las mismas frases exactas que uses aquí.
5. No inventes muertes, fechas, personas ni vínculos. Si una muerte no está descrita, escribe "No aparece una muerte concreta".
6. El cierre debe explicar la red relacional total: las personas actuales no son identidades literales de vidas pasadas, sino resonancias simbólicas que activan memoria, cuidado, límite, reparación, fuerza o presencia.
7. Mantén párrafos cortos, narrativos y ricos. No hagas lista; escribe prosa sustancial. Cada estación debe poder leerse como párrafo independiente dentro del informe final.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin markdown, con esta forma:

{
  "pistas_temporales_detectadas": ["pistas literales o parafraseadas de cerca: época, siglo, guerra, oficio, objeto, espacio, clima social, género, edad, lugar, agua, campo, viaje, encierro, etc."],
  "lectura_general": "varios párrafos cortos separados por \\n\\n que conecten vida actual y tirada sin repetir 'el usuario informa'",
  "retrato_literario": "un párrafo único que condense la ruta citando 2-3 escenas concretas de etapas distintas, cada una conectada con SU PROPIO hecho biográfico real de la vida actual (2-3 hilos distintos, no uno solo) — cada hilo resuelto en una frase, nunca en un párrafo propio, para no extender demasiado — debe leerse como apertura independiente de un documento distinto, sin reutilizar frases ya usadas en lectura_general ni en resumen_estaciones_narrativas",
  "etapas": [
    {
      "numero_etapa": 1,
      "titulo": "nombre simbólico breve de la etapa",
      "momento_simbolico": "atmósfera temporal narrativa, con lenguaje de posibilidad",
      "periodo_reportado": "si el usuario nombró una época o evento, escribe aquí la pista literal o null",
      "periodo_simbolico": "rango visible para la etapa: usa período reportado con fecha verificable, o período amplificado si procede; si no hay ancla, usa null",
      "periodo_amplificado": "propuesta amplia basada en rasgos materiales/sociales si no hubo fecha explícita; si no aplica, null",
      "nivel_confianza_periodo": "alto si el usuario nombró referente histórico; medio si hay rasgos fuertes; bajo si es atmósfera débil; null si no hay ancla",
      "evidencia_periodo": ["rasgos del relato que justifican el período o la atmósfera"],
      "espacio_simbolico": "lugar/ambiente: aldea, agua, campo, casa rígida, camino, templo, guerra, etc.",
      "contexto_sociopolitico": "si hay conflicto, jerarquía, comunidad vigilante, desplazamiento, religión, clase social; si no, null",
      "contexto_socioambiental": "rasgos de entorno: agua, sequía, montaña, campo, casa, camino, ciudad, templo; si no, null",
      "rol_encarnado": "personaje que la persona parecía ser: cuidadora, soldado, viajero, niña, madre, maestro, sanadora, etc.",
      "genero_percibido": "si el usuario lo dio o la escena lo sostiene con claridad simbólica; si no, null",
      "edad_percibida": "si hay pista; si no, null",
      "relacion_principal": "persona/rol central de esa etapa: hermano, hija, autoridad, pareja, hijo, maestro, comunidad, etc.",
      "evento_critico": "vínculo → ruptura → inscripción emocional, concreto y breve",
      "huella_actual": "miedo, apego, culpa, desconfianza, silencio, sobrecuidado, necesidad de aprobación, etc.",
      "aprendizaje_pendiente": "aprendizaje específico de esa etapa",
      "leccion": "frase breve de integración",
      "eco_actual": "cómo resuena hoy con la vida actual, sin diagnosticar ni culpar",
      "senal_origen": "dato concreto del relato que justifica esta etapa",
      "vinculo": null,
      "reingresos_relacionales": [
        {
          "figura_anterior": "rol simbólico anterior, sin afirmar identidad",
          "persona_actual": "nombre real o rol actual, si aparece en vínculos; si es inferido como tipo de vínculo, acláralo",
          "rol_anterior": "protector/protegido/juez/acusado/pareja/hijo/padre/maestro/etc.",
          "rol_actual": "hijo/amigo/madre/pareja/autoridad/paciente/guía/etc.",
          "funcion_espiritual": "qué aprendizaje posible activa",
          "ciclo_que_abre": "qué se abre",
          "ciclo_que_cierra": "qué se cierra o purifica",
          "nivel_confianza": "alto/medio/bajo",
          "evidencia": "dato del relato que sostiene la conexión"
        }
      ]
    }
  ],
  "resumen_estaciones_narrativas": {
    "titulo": "Resumen narrativo por estaciones",
    "apertura": "párrafo general: conteo de estaciones, roles, géneros/edades si aparecen, muertes o tránsitos si están descritos y núcleo transversal de la vida actual",
    "estaciones": [
      {
        "numero": 1,
        "titulo": "mismo título o título breve de la etapa",
        "periodo": "período histórico/simbólico, o 'sin fecha comprobable'",
        "tipo": "reencarnación simbólica con período definido / reencarnación arquetípica sin fecha comprobable / escena de auxilio",
        "rol": "rol encarnado",
        "muerte_o_transito": "No aparece una muerte concreta / aparece caída / herida / agonía / tránsito espiritual, solo si está en el material",
        "parrafo": "En la primera estación narrativa (reencarnación), ubicada/enmarcada/situada (varía la palabra) en..., la persona aparece como... Integra espacio, evento crítico visible en..., muerte o no muerte, huella actual como sucede cuando..., red relacional y aprendizaje. Cierra con una frase breve sobre qué se buscaba superar, qué se logró y qué quedó pendiente."
      }
    ],
    "cierre_red_relacional": "párrafo final sobre la constelación de vínculos actuales y pasados como resonancias simbólicas, no identidades literales"
  },
  "resumen_ruta": "síntesis con conteo total, rango más antiguo y más reciente cuando haya períodos, roles principales y aprendizajes transversales",
  "hilo_conductor": "texto que conecte TODAS las etapas entre sí, no solo algunas — patrón, símbolo o tensión que se repite a lo largo de la ruta completa; usa un párrafo, o hasta dos si el número de etapas lo justifica, pero sin extenderse más allá de eso",
  "constelacion": [
    {
      "figura_onirica": "figura, presencia o rol anterior",
      "figura_anterior": "sinónimo ampliado de la figura anterior",
      "etapa_relacionada": 1,
      "persona_real": "nombre real de vínculo actual o rol actual si no hay nombre",
      "persona_actual": "mismo dato anterior, para el mapa relacional",
      "rol_anterior": "rol en la etapa",
      "rol_actual": "rol en la vida actual",
      "resonancia": "por qué se conectan, siempre como posibilidad simbólica",
      "funcion_espiritual": "qué aprendizaje activa",
      "ciclo_que_abre": "qué abre",
      "ciclo_que_cierra": "qué cierra",
      "nivel_confianza": "alto/medio/bajo",
      "evidencia": "dato del material que sostiene la conexión"
    }
  ],
  "mapa_aprendizajes": [
    { "aprendizaje": "cuidar sin cargar", "etapas": [1], "huella_actual": "sobrecuidado", "movimiento_integrador": "amar con límite" }
  ],
  "arcos_relacionales": [
    {
      "persona": "nombre real, debe coincidir exactamente con alguien ya presente en constelacion",
      "etapas_involucradas": [1, 7, 9],
      "patron_transversal": "el arco pasado completo: qué rol simbólico podría haber tenido esta figura en esas etapas (en lenguaje de posibilidad, nunca 'fue' en indicativo), qué conflicto marcó esa relación entonces, y qué aprendizaje quedó pendiente o iniciado — citando las escenas concretas, con el lenguaje que el propio material sugiera",
      "evidencia_vida_actual": "la descripción real de esta relación en vínculos, momentos difíciles o mapa familiar que ancla este arco — si no existe esa descripción real, no construyas este arco para esta persona",
      "lo_que_ya_se_supero": "el arco presente: qué rol tiene esta persona hoy, y cómo la relación actual parece cerrar, sanar o reparar el patrón pasado — con evidencia real de la relación actual, o null si no hay evidencia de resolución",
      "lo_que_sigue_en_transito": "qué parte, si acaso, sigue sin resolverse del todo — o null si el material no sugiere nada pendiente",
      "simbolo_sugerido": "OPCIONAL — elige, si te resulta claro, UNA sola palabra de esta lista cerrada que mejor condense el vínculo con esta persona, pensando en el patrón completo del arco, no en un solo momento: ${SIMBOLOS_VALIDOS.join(', ')}. Usa exactamente una de esas palabras, sin variarla ni traducirla. Si ninguna encaja con claridad, deja este campo en null — un símbolo forzado es peor que ninguno.",
      "frase_breve_patron": "UNA sola frase corta, de máximo 10 a 12 palabras, que condense 'patron_transversal' para un espacio pequeño tipo tarjeta — NO es un resumen recortado de la frase larga, es una frase nueva, completa en sí misma, pensada desde el inicio para caber corta. Mantén el lenguaje de posibilidad. Ejemplo de longitud correcta: 'Podría resonar con una hermana que huía del mismo peligro.' — o null si no puedes condensarlo sin perder el sentido",
      "frase_breve_hoy": "UNA sola frase corta, de máximo 10 a 12 palabras, que condense 'lo_que_ya_se_supero' para el mismo espacio pequeño — igual de completa en sí misma, no cortada. Ejemplo de longitud correcta: 'Hoy es una amistad que ya no exige nada a cambio.' — o null si no aplica"
    }
  ],
  "balance_justicia_amor_caridad": {
    "justicia": {
      "prueba_planteada": "qué exigía esta ley a lo largo de la ruta, qué se precisaba vivir o atravesar para aprender de ella — con el marco de que aunque no se resuelva del todo, el alma siempre avanza",
      "avance_logrado": "dónde el material muestra que ya asumió responsabilidad por un daño propio, o hizo justicia sin caer en venganza — con evidencia real, o null si no hay evidencia suficiente, retomando la prueba planteada",
      "patron_persistente": "dónde el material sugiere que sigue evitando responsabilidad, o busca reparación desde la culpa y no desde una justicia serena — con evidencia real, o null, contrastado con cómo vive esto la persona hoy",
      "personas_involucradas": ["nombres reales de vínculos ya presentes en constelacion o reingresos_relacionales, nunca nombres nuevos"],
      "posibilidad_de_exploracion": "una invitación reflexiva en forma de pregunta o de posibilidad abierta, nunca una instrucción directiva. Ejemplo de tono: '¿qué cambiaría si...' o 'una posibilidad sería explorar...' — nunca 'deberías' o 'se recomienda que'",
      "guia_eternidad": ["5 a 10 viñetas breves, contextuales al caso, inspiradas en Kardec/Weiss/Xavier/Domingo Soler pero adaptadas a esta ruta — mismo lenguaje de posibilidad, nunca imperativo"]
    },
    "amor": {
      "prueba_planteada": "qué exigía la ley del amor a lo largo de la ruta, mismo marco que en justicia",
      "avance_logrado": "dónde el material muestra amor sin posesión, cuidado sin control — con evidencia real, o null, retomando la prueba planteada",
      "patron_persistente": "dónde el material sugiere que el amor se confunde con posesión, rescate o deuda afectiva — con evidencia real, o null, contrastado con la vida actual",
      "personas_involucradas": ["nombres reales ya presentes en el material"],
      "posibilidad_de_exploracion": "invitación reflexiva, mismo tono que en justicia",
      "guia_eternidad": ["5 a 10 viñetas, mismo criterio que en justicia"]
    },
    "caridad": {
      "prueba_planteada": "qué exigía la ley de la caridad a lo largo de la ruta, mismo marco que en justicia",
      "avance_logrado": "dónde el material muestra compasión o servicio genuino, sin esperar reciprocidad — con evidencia real, o null, retomando la prueba planteada",
      "patron_persistente": "dónde el material sugiere agotamiento por dar sin límite, o cuidado que se volvió carga — con evidencia real, o null, contrastado con la vida actual",
      "personas_involucradas": ["nombres reales ya presentes en el material"],
      "posibilidad_de_exploracion": "invitación reflexiva, mismo tono que en justicia",
      "guia_eternidad": ["5 a 10 viñetas, mismo criterio que en justicia"]
    }
  },
  "cierre_del_balance": "primero, si algún aprendizaje de mapa_aprendizajes no quedó cubierto por ninguna de las tres leyes, nómbralo aquí con sus etapas; después, un párrafo breve y cálido que sintetice las tres leyes juntas como una sola pregunta repetida en registros distintos, sin lenguaje clínico ni de autoayuda genérica, coherente con el marco de Kardec (Libro Tercero, Leyes Morales)",
  "cierre": "uno o dos párrafos que nombren el ciclo específico que se está cerrando, con una interpretación propia derivada de todo lo narrado — no una recopilación de lo ya dicho, sino una síntesis lúcida y precisa, sin culpa",
  "frase_de_cierre": "una sola línea breve, filosófica y contextual al caso, en tono de guía para tiempos mejores — distinta del párrafo de cierre",
  "auditoria_final": {
    "datos_no_usados": ["datos relevantes que no pudieron integrarse, o []"],
    "etapas_sin_ancla_temporal": ["números de etapa sin ancla, o []"],
    "riesgos_de_sobreinterpretacion": ["puntos donde la conexión es baja y se mantuvo como posibilidad"],
    "revision_no_invencion": "frase breve confirmando que las fechas exactas solo se usaron cuando hubo referente reportado y que lo demás quedó como período amplificado o sin ancla",
    "ajustes_usuario_integrados": ["períodos o correcciones del usuario que sí quedaron integrados, o []"],
    "fusiones_realizadas": [
      {
        "etapas_fusionadas": ["breve referencia a los dos fragmentos originales"],
        "criterio": "por qué es la misma escena retomada: mismo protagonista / mismo espacio simbólico / mismo evento central, citando el dato exacto que lo demuestra",
        "dato_que_pudo_perderse_en_la_fusion": "si alguno de los dos fragmentos tenía un detalle que no coincide exactamente con el otro, decláralo aquí en vez de omitirlo silenciosamente"
      }
    ]
  },
  "nota_epistemica": "frase final: ejercicio simbólico de probabilidad e introspección, no hecho histórico verificado ni afirmación definitiva"
}

Si una etapa se conecta con alguno de estos vínculos reales del usuario: [${nombresVinculos.map(n=>`"${n}"`).join(', ') || 'ninguno registrado'}], en "vinculo" usa:
{
  "nombre_actual": "nombre real tal como lo escribió el usuario",
  "figura_simbolica": "rol simbólico anterior, sin nombre histórico propio",
  "tipo_relacion": "Maestro, Protector, Aprendiz mutuo, Vínculo por cerrar, Espejo, Deudor simbólico, etc."
}

REVISIÓN FINAL ANTES DE RESPONDER
Devuelve solo JSON válido como texto plano dentro de este chat. No crees archivo descargable ni adjunto. No uses markdown ni bloque de código.
Devuelve solo JSON válido. Verifica que cada pista temporal detectada aparezca usada en una etapa, que cada etapa tenga evento crítico y señal de origen, que cada período amplificado tenga evidencia, que la constelación refleje un esfuerzo real de búsqueda y que no aparezcan frases repetitivas como "el usuario informa".`;
}

registerRoute('prompt-listo', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Paso siguiente</div>
    <h2>Tu prompt está listo</h2>
    <div class="spacer-sm"></div>
    <p class="body-text">Sigue este puente breve: copia el prompt, abre tu IA externa, pega allí, pide respuesta en texto plano y vuelve para pegar el resultado aquí.</p>
    <div class="ia-bridge-steps">
      <div><span>1</span><strong>Copiar</strong><small>El prompt completo</small></div>
      <div><span>2</span><strong>Abrir IA</strong><small>ChatGPT, Claude u otra</small></div>
      <div><span>3</span><strong>Pegar respuesta</strong><small>Traer el JSON/texto aquí</small></div>
    </div>
    <div class="spacer-md"></div>
    <div class="copy-only-panel">
      <div class="copy-only-title">Prompt preparado</div>
      <p>La app no muestra el prompt completo para evitar saturación. Toca copiar y luego abre tu IA preferida.</p>
      <button class="btn btn-primary copy-pulse" id="btn-copy" type="button">Copiar prompt</button>
    </div>
    <div class="manual-note" style="margin-top:10px;">Regla clave para la IA externa: <strong>responde directamente en el chat, no crees archivos descargables.</strong></div>
    <div id="ai-access-main"></div>
  `;
  s.querySelector('#btn-copy').onclick = async ()=>{
    await copyPromptButton(s.querySelector('#btn-copy'), cur.promptGenerado, s.querySelector('#ai-access-main'));
  };
  renderAIExternalPanel(s.querySelector('#ai-access-main'), ()=>cur.promptGenerado, { title:'Abrir IA para generar la lectura' });
  navFooter(s, [
    { label:'Ya tengo la respuesta, continuar', onClick: ()=> go('pegar-respuesta') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('tirada-resultado') },
  ]);
});

registerRoute('pegar-respuesta', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Trae tu lectura</div>
    <h2>Pega aquí la respuesta de la IA</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Pega el texto completo tal como te lo dio la IA. La aplicación lo procesará automáticamente.</p>
    <div class="spacer-md"></div>
    <div class="field">
      <textarea id="respuesta-box" placeholder="Pega aquí..." style="min-height:260px;">${esc(cur.respuestaIA)}</textarea>
    </div>
    <div class="prompt-actions-row compact">
      <button class="btn btn-ghost" id="btn-vaciar-respuesta" type="button">Vaciar cajón</button>
    </div>
    <p class="muted" id="parse-error" style="color:#C46A3F; display:none;"></p>
  `;
  s.querySelector('#btn-vaciar-respuesta').onclick = ()=>{
    const box = s.querySelector('#respuesta-box');
    box.value = '';
    cur.respuestaIA = '';
    const errEl = s.querySelector('#parse-error');
    if(errEl){ errEl.textContent = ''; errEl.style.display = 'none'; }
    box.focus();
  };
  navFooter(s, [
    { label:'Generar mi lectura', onClick: ()=>{
      const raw = document.getElementById('respuesta-box').value.trim();
      const errEl = document.getElementById('parse-error');
      if(!raw){ document.getElementById('respuesta-box').focus(); return; }
      cur.respuestaIA = raw;
      const parsed = parseInforme(raw);
      if(!parsed){
        errEl.textContent = 'No pudimos leer el formato. Verifica que hayas pegado la respuesta completa, o inténtalo de nuevo pidiéndole a la IA que responda solo con el JSON indicado.';
        errEl.style.display = 'block';
        return;
      }
      ensureGenerationMeta(cur);
      cur.informe = parsed;
      markLecturaGenerada(cur);
      go('informe');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('prompt-listo') },
  ]);
});

function parseInforme(raw){
  try{
    let txt = raw.trim();
    // limpiar posibles fences de markdown
    txt = txt.replace(/^```json/i, '').replace(/^```/,'').replace(/```$/,'').trim();
    // extraer el primer bloque {...} por si hay texto alrededor
    const first = txt.indexOf('{');
    const last = txt.lastIndexOf('}');
    if(first === -1 || last === -1) return null;
    txt = txt.slice(first, last+1);
    const obj = JSON.parse(txt);
    if(!obj.lectura_general || !Array.isArray(obj.etapas)) return null;
    return normalizeInforme(obj);
  }catch(e){
    return null;
  }
}

function parseCronica(raw){
  try{
    let txt = raw.trim();
    txt = txt.replace(/^```json/i, '').replace(/^```/,'').replace(/```$/,'').trim();
    const first = txt.indexOf('{');
    const last = txt.lastIndexOf('}');
    if(first === -1 || last === -1) return null;
    txt = txt.slice(first, last+1);
    const obj = JSON.parse(txt);
    if(!obj.titulo_cronica || !Array.isArray(obj.capitulos) || !obj.capitulos.length) return null;
    obj.capitulos = obj.capitulos.filter(c => c && c.texto).map((c,i)=>({
      numero: c.numero || (i+1),
      titulo_capitulo: (c.titulo_capitulo || '').toString().trim(),
      texto: (c.texto || '').toString().trim()
    }));
    if(!obj.capitulos.length) return null;
    return obj;
  }catch(e){
    return null;
  }
}


function normalizeResumenEstacionesJSON(raw){
  if(!raw) return null;
  if(Array.isArray(raw)){
    const parrafos = raw.map(x=> typeof x === 'string' ? x.trim() : (x && (x.parrafo || x.texto) || '')).filter(Boolean);
    if(!parrafos.length) return null;
    return {
      titulo:'Resumen narrativo por estaciones',
      apertura: parrafos[0] || '',
      estaciones: parrafos.slice(1,-1).map((p,i)=>({ numero:i+1, parrafo:p })),
      cierre_red_relacional: parrafos.length > 1 ? parrafos[parrafos.length-1] : ''
    };
  }
  if(typeof raw === 'string'){
    const parrafos = raw.split(/\n+/).map(p=>p.trim()).filter(Boolean);
    if(!parrafos.length) return null;
    return {
      titulo:'Resumen narrativo por estaciones',
      apertura: parrafos[0] || '',
      estaciones: parrafos.slice(1,-1).map((p,i)=>({ numero:i+1, parrafo:p })),
      cierre_red_relacional: parrafos.length > 1 ? parrafos[parrafos.length-1] : ''
    };
  }
  if(typeof raw === 'object'){
    raw.titulo = raw.titulo || 'Resumen narrativo por estaciones';
    raw.apertura = raw.apertura || raw.resumen_general || '';
    raw.estaciones = Array.isArray(raw.estaciones) ? raw.estaciones.map((e,i)=>({
      numero: e.numero || e.numero_etapa || (i+1),
      titulo: e.titulo || '',
      periodo: e.periodo || e.periodo_simbolico || '',
      tipo: e.tipo || '',
      rol: e.rol || e.rol_encarnado || '',
      muerte_o_transito: e.muerte_o_transito || '',
      parrafo: e.parrafo || e.texto || ''
    })).filter(e=>e.parrafo) : [];
    raw.cierre_red_relacional = raw.cierre_red_relacional || raw.cierre || '';
    if(!raw.apertura && !raw.estaciones.length && !raw.cierre_red_relacional) return null;
    return raw;
  }
  return null;
}

function normalizeInforme(obj){
  // Compatibilidad entre informes viejos y el esquema ampliado de reingresos/periodos.
  obj.etapas = (obj.etapas || []).map((et, i)=>{
    et.numero_etapa = et.numero_etapa || (i + 1);
    if(!et.periodo_simbolico && et.periodo_historico_referencial) et.periodo_simbolico = et.periodo_historico_referencial;
    if(!et.periodo_simbolico && et.periodo_amplificado) et.periodo_simbolico = et.periodo_amplificado;
    if(!et.momento_simbolico && et.periodo_amplificado) et.momento_simbolico = et.periodo_amplificado;
    if(!et.eco_actual && et.huella_actual) et.eco_actual = et.huella_actual;
    if(!et.huella_actual && et.eco_actual) et.huella_actual = et.eco_actual;
    if(!et.leccion && et.aprendizaje_pendiente) et.leccion = et.aprendizaje_pendiente;
    if(!et.aprendizaje_pendiente && et.leccion) et.aprendizaje_pendiente = et.leccion;
    if(!et.contexto_sociopolitico && et.contexto_social) et.contexto_sociopolitico = et.contexto_social;
    if(!Array.isArray(et.evidencia_periodo)) et.evidencia_periodo = et.evidencia_periodo ? [et.evidencia_periodo] : [];
    if(!Array.isArray(et.reingresos_relacionales)) et.reingresos_relacionales = [];
    return et;
  });

  const constelacionBase = Array.isArray(obj.constelacion) ? obj.constelacion : [];
  const reingresosDesdeEtapas = [];
  obj.etapas.forEach(et=>{
    (et.reingresos_relacionales || []).forEach(r=>{
      reingresosDesdeEtapas.push({
        figura_onirica: r.figura_anterior || r.rol_anterior || 'Figura anterior',
        figura_anterior: r.figura_anterior || r.rol_anterior || 'Figura anterior',
        etapa_relacionada: et.numero_etapa,
        persona_real: r.persona_actual || r.rol_actual || 'Vínculo actual',
        persona_actual: r.persona_actual || r.rol_actual || 'Vínculo actual',
        rol_anterior: r.rol_anterior || '',
        rol_actual: r.rol_actual || '',
        resonancia: r.evidencia || r.funcion_espiritual || '',
        funcion_espiritual: r.funcion_espiritual || '',
        ciclo_que_abre: r.ciclo_que_abre || '',
        ciclo_que_cierra: r.ciclo_que_cierra || '',
        nivel_confianza: r.nivel_confianza || '',
        evidencia: r.evidencia || ''
      });
    });
  });

  obj.constelacion = [...constelacionBase, ...reingresosDesdeEtapas].map(c=>{
    c.figura_onirica = c.figura_onirica || c.figura_anterior || 'Figura anterior';
    c.figura_anterior = c.figura_anterior || c.figura_onirica;
    c.persona_real = c.persona_real || c.persona_actual || c.rol_actual || 'Vínculo actual';
    c.persona_actual = c.persona_actual || c.persona_real;
    c.resonancia = c.resonancia || c.funcion_espiritual || c.evidencia || '';
    return c;
  });

  obj.resumen_estaciones_narrativas = normalizeResumenEstacionesJSON(obj.resumen_estaciones_narrativas);

  return obj;
}

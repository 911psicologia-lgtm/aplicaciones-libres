/* ═══════════════════════════════════════════
   prompt.js — Motor IA (fase 1: copiar y pegar)
   Cruza: libro + perfil + intención + estilo
   ═══════════════════════════════════════════ */

const PromptVoz = {

  campo(valor, respaldo = "No especificado") {
    if (Array.isArray(valor)) {
      const limpio = valor.filter(Boolean).join(", ");
      return limpio || respaldo;
    }
    const texto = (valor || "").toString().trim();
    return texto || respaldo;
  },

  limpiarNombre(nombre) {
    return (nombre || "").toString().replace(/\s+/g, " ").trim();
  },

  esNombreGenerico(nombre) {
    const n = this.limpiarNombre(nombre).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return !n || ["usuario", "mi perfil", "sin nombre", "user", "perfil", "lector", "lectora"].includes(n);
  },

  /**
   * Construye el prompt interno a partir del perfil,
   * la intención del día y la configuración elegida.
   */
  generar(perfil, sesion, categoriasExistentes) {
    const p = perfil || {};
    const s = sesion || {};
    const nombrePerfilRaw = this.limpiarNombre(p.nombre || "");
    const nombrePerfilGenerico = this.esNombreGenerico(nombrePerfilRaw);
    const nombrePerfilSeguro = nombrePerfilGenerico ? "" : nombrePerfilRaw;
    const catsBase = ["trabajo", "crianza", "familia", "emociones", "estudio", "escritura", "espiritualidad", "decision", "proyecto", "amor", "politica", "autoayuda", "duelo", "salud", "historias", "consejos", "vivencias", "otro"];
    const cats = [...new Set([...(categoriasExistentes || []), ...catsBase])].filter(Boolean);
    this._instruccionCategoria =
      `Usa EXACTAMENTE una de las categorías que este usuario ya tiene en su biblioteca: ${cats.join(" | ")}. ` +
      `Solo si ninguna encaja de verdad, propone UNA nueva: una sola palabra en minúsculas, sin tildes (la app la adoptará como categoría del usuario).`;

    const cantidad = Math.max(1, parseInt(s.cantidadTarjetas || s.cantidad || "20", 10) || 20);
    const advertenciaCantidad = cantidad >= 200
      ? "Cantidad muy alta: 200 o más puede cortar respuestas. Mantén frases muy limpias, JSON estricto y sugiere dividir por bloques si la plataforma no permite completar."
      : cantidad >= 150
        ? "Cantidad avanzada: 150 tarjetas puede funcionar, pero exige JSON estricto, frases compactas y continuidad clara."
        : "";
    const hayObras = Array.isArray(s.libros) && s.libros.filter(Boolean).length > 0;
    const hayAutores = Array.isArray(s.autores) && s.autores.filter(Boolean).length > 0;
    const necesitaCuraduria = !hayObras || !hayAutores;
    const modoLectura = s.modoLectura || "ideas";
    const estiloHistoria = this.campo(s.estiloHistoria, "");
    const totalAutoresDeclarados = hayAutores ? s.autores.filter(Boolean).length : 0;
    const requiereProcedenciaAuditiva = modoLectura === "academica" || (modoLectura === "ideas" && totalAutoresDeclarados > 3);
    const capaLectura = s.capaLectura || s.modo || "ambas";
    const rotulos = {
      ideas: "ideas centrales o tarjetas",
      narrativa: "microcapítulos, escenas o partes ordenadas",
      historia: "escenas de una historia pedagógica nueva",
      academica: "conceptos, categorías o claves académicas"
    };
    const instruccionModo = {
      ideas: "Extrae ideas, aprendizajes, frases memorables propias y acciones breves, variando el lenguaje para que no suene como plantilla.",
      narrativa: "Resume una obra en microcapítulos, escenas o partes ordenadas. Si es literatura, sigue trama, personajes y giros principales; si es académica, sigue capítulos, argumentos o secciones sin saltar la arquitectura central.",
      historia: "No resumas la obra. Convierte una obra, tema o concepto en una historia pedagógica nueva, clara y creativa, que permita comprender el sentido mediante personajes, escenas, metáforas o un viaje narrativo.",
      academica: "Explica conceptos, categorías, tensiones, relaciones internas y matices con rigor académico, procedencia audible y variedad expresiva."
    }[modoLectura] || "Transforma el contenido en tarjetas claras y escuchables.";

    const libros = hayObras
      ? s.libros.filter(Boolean).map(l => "- " + l).join("\n")
      : "- No se especificaron obras concretas. Debes seleccionar obras reales, existentes y altamente pertinentes según la intención, el modo de lectura, el perfil y la categoría vital.";

    const autores = hayAutores
      ? s.autores.filter(Boolean).join(", ")
      : "No especificados. Debes elegir autores reales y pertinentes si el usuario solo dio tema, intención, situación o corriente general.";

    const esSituacion = s.tipoEntrada === "situacion";
    const esHistoriaPara = s.tipoEntrada === "historia_para";
    const sit = s.situacionLectura || {};
    const hp = s.historiaPara || {};
    const menor = parseInt(sit.edad || "", 10) < 18;
    const hpMenor = parseInt(hp.edad || "", 10) < 18;
    const salida = s.salidaSituacion || "destinatario";

    const usuarioJSON = JSON.stringify(
      esSituacion ? this.campo(sit.destinatario, nombrePerfilSeguro || "Usuario")
      : esHistoriaPara ? this.campo(hp.destinatario, nombrePerfilSeguro || "Destinatario")
      : (nombrePerfilSeguro || "Usuario")
    );
    const destinatarioJSON = esSituacion
      ? JSON.stringify({ nombre: this.campo(sit.destinatario, "Destinatario"), edad: this.campo(sit.edad, ""), relacion: this.campo(sit.relacion, "") })
      : esHistoriaPara
        ? JSON.stringify({ nombre: this.campo(hp.destinatario, "Destinatario"), edad: this.campo(hp.edad, ""), relacion: "destinatario de historia" })
        : "null";

    const bloqueSituacion = esSituacion ? `
LECTURA PARA UNA SITUACIÓN
- Solicitante: ${this.campo(sit.solicitante, nombrePerfilSeguro || "Usuario")}
- Destinatario: ${this.campo(sit.destinatario, "Destinatario")}
- Edad aproximada: ${this.campo(sit.edad, "No especificada")}
- Relación: ${this.campo(sit.relacion, "No especificada")}
- Situación concreta: ${this.campo(sit.situacion, "No especificada")}
- Emoción principal: ${this.campo(sit.emocion, "No especificada")}
- Objetivo de la lectura: ${this.campo(sit.objetivo, s.intencion || "Acompañar con claridad")}
- Tono deseado: ${this.campo(sit.tono, this.campo(p.tono, "cálido y sencillo"))}
- Salida deseada: ${salida}

REGLA DE IDENTIDAD OBLIGATORIA
Separa siempre solicitante, destinatario y acompañante. Si la lectura es para el destinatario, el saludo y el audio deben dirigirse al destinatario, no al solicitante. Evita saludos confusos como “Hola, José, Martín José…”. Si incluyes guía para acompañante, colócala en un bloque separado y no la mezcles con el texto dirigido al destinatario.
${menor ? `
CUIDADO CON MENORES
El destinatario parece menor de edad. Usa lenguaje sencillo, protector, no clínico, no alarmante, sin detalles perturbadores, sin diagnósticos y sin promesas médicas absolutas. En situaciones médicas, no reemplaces al equipo de salud; sugiere consultar dudas clínicas con profesionales.
` : ""}` : "";

    const bloqueHistoriaPara = esHistoriaPara ? `
MÓDULO: UNA HISTORIA PARA…
- Acción solicitada: ${this.campo(s.accionHistoria, "crear")} (crear nueva | mejorar una mía | continuar una historia)
- Solicitante: ${nombrePerfilSeguro || "No especificado"}
- Destinatario: ${this.campo(hp.destinatario, "Destinatario")}
- Edad aproximada: ${this.campo(hp.edad, "No especificada")}
- Idea, argumento base o historia existente: ${this.campo(hp.argumento, "No especificado")}
- Personajes que el usuario quiere incluir: ${this.campo(hp.personajes, "No especificados")}
- Referentes creativos opcionales: ${this.campo(hp.referentes, "No especificados")}
- Enseñanza o moraleja deseada: ${this.campo(hp.moraleja, "No especificada")}
- Tono o forma: ${this.campo(hp.tono, "cálido, claro y narrativo")}
- Final deseado: ${this.campo(hp.finalDeseado, "No especificado")}

REGLA DEL TALLER DE HISTORIAS
Este módulo no es resumen de libros: es creación, mejora o continuación de una historia original por escenas. Lo central es tener argumento, destinatario, ritmo, personajes, conflicto, enseñanza y cierre.
- Si la acción es "crear", inventa una historia nueva desde la idea, enseñanza y personajes dados.
- Si la acción es "mejorar", conserva el corazón de la historia del usuario: intención, personajes principales, escenas importantes y moraleja. Mejora claridad, ritmo, emoción, lenguaje y cierre sin borrar la voz del autor.
- Si la acción es "continuar", respeta lo ya narrado y continúa de forma coherente.
- Si el usuario menciona personajes, videojuegos, películas, series o mundos protegidos, úsalos como referentes creativos. No copies nombres, tramas, escenas, diálogos ni universos completos salvo que sean de dominio público o creación propia del usuario. Crea personajes originales, un mundo propio y un argumento nuevo inspirado en la combinación solicitada.
${hpMenor ? `
CUIDADO CON MENORES
El destinatario parece menor de edad. Usa lenguaje sencillo, protector, esperanzador, no alarmante y sin detalles perturbadores. Evita violencia gráfica, terror intenso o temas adultos. La enseñanza debe sentirse como cuento, no como sermón.
` : ""}` : "";

    return `Actúa como un consejero lector cálido y cercano para la app "Voz de los Libros".

PERFIL DEL USUARIO / SOLICITANTE
- Nombre: ${nombrePerfilSeguro || "No especificado; no uses vocativo genérico"}
- Momento vital: ${this.campo(p.momento)}
- Temas de interés: ${this.campo(p.temas, "No especificados")}
- Autores y obras que le inspiran: ${esSituacion || esHistoriaPara ? "Omitidos para evitar sesgo de arrastre. Usa únicamente los referentes escritos en este módulo o la historia base del solicitante." : this.campo(p.autoresFavoritos, "No especificados")}
- Tono preferido: ${this.campo(p.tono, "cercano y sencillo")}
- Nota de perfil: si el usuario eligió "De todo un poco", interpreta intereses amplios y prioriza según la intención del día de esta sesión.

INTENCIÓN DE HOY
${s.intencion || "Orientación general"}
${bloqueSituacion}
${bloqueHistoriaPara}
MODO DE LECTURA
${modoLectura} — ${instruccionModo}
${modoLectura === "historia" && !esHistoriaPara ? `
TIPO DE HISTORIA PEDAGÓGICA
${estiloHistoria || "No especificado. Elige tú la forma más clara: cuento breve, viaje, diálogo, caso cotidiano, metáfora, escena educativa o relato simbólico."}` : ""}

CAPA DE LECTURA INICIAL
${capaLectura}
- "directas" / Neto: lo que la obra, fuente o situación aporta de manera general.
- "adaptadas" / Contexto: puente con el perfil, la situación o el destinatario real, más frase memorable.
- "ambas": directa + adaptada + frase memorable.
- "accion": solo consejo_practico; sirve para escuchar acciones concretas sin alargar la lectura.

FUENTES DE TRABAJO
${libros}
Autores o corrientes de referencia: ${autores}
${esHistoriaPara ? "En el módulo de historias, los referentes no son fuentes que deban resumirse: son inspiración creativa para construir una historia original. No declares que una obra fue leída si solo aparece como referente." : ""}
${esSituacion && !((s.libros || []).length || (s.autores || []).length) ? "Regla antisesgo: no uses autores favoritos ni corrientes del perfil permanente como fuentes de esta lectura. Trabaja desde la situación concreta, la emoción, el objetivo y el tono. Si necesitas referencias generales, formula criterios o sugerencias abiertas, no una lista forzada de autores." : ""}
${esSituacion && ((s.libros || []).length || (s.autores || []).length) ? "Usa solo las fuentes escritas para esta situación. No completes con autores del perfil permanente salvo que estén repetidos explícitamente en este campo." : ""}
${s.sugerencias ? "Además, sugiere 3 a 5 obras de acceso abierto o dominio público directamente pertinentes para esta intención o situación. Deben ser sugerencias opcionales y justificadas, no fuentes obligatorias ni arrastre del perfil." : ""}

REGLA DE CURADURÍA Y ANTIALUCINACIÓN DE FUENTES
- Si el usuario especificó obras concretas, respétalas como eje principal. No las reemplaces por otras. Puedes añadir sugerencias opcionales solo si el usuario lo pidió o si son necesarias para contextualizar, marcándolas como sugerencia.
- Si el usuario especificó autores pero no obras, elige las obras más representativas y pertinentes de esos autores para esta intención. No inventes títulos.
- Si el usuario especificó tema, intención, corriente o situación, pero no dio obras ni autores, selecciona tú las mejores fuentes reales y existentes: obras clásicas, textos primarios, autores reconocidos o fuentes de acceso abierto/dominio público cuando sea posible.
- La selección debe ajustarse al perfil y a la solicitud actual, no a un arrastre automático de gustos anteriores. Usa autores favoritos del perfil solo cuando sean claramente pertinentes.
- No inventes libros, autores, ediciones, capítulos, páginas ni citas. Si no estás seguro de una obra, no la incluyas como fuente; formula una alternativa más segura o declárala como sugerencia tentativa.
- En el JSON, el campo "fuentes" debe contener obras reales usadas o recomendadas como base. El campo "autores" debe contener autores reales asociados.
- Prioriza calidad sobre cantidad: elige pocas fuentes fuertes y pertinentes antes que listas largas decorativas.
- Si el tema exige actualidad o verificación, indica dentro del razonamiento de la tarjeta que se debe verificar con fuentes actualizadas, sin inventar datos recientes.
- En modo académico, si trabajas con varios autores u obras, organiza la lectura en bloques conceptuales para que el oyente sepa cuándo cambia el autor, obra o corriente principal.

REGLA DE PROCEDENCIA AUDITIVA EN MODO ACADÉMICO
${requiereProcedenciaAuditiva ? `- La procedencia debe ser audible de manera natural, no visual ni repetitiva.
- Nombra el autor, obra o corriente al iniciar un bloque conceptual, al cambiar de autor, o al hacer una comparación.
- No repitas mecánicamente el nombre del autor en cada tarjeta. Si varias tarjetas continúan el mismo bloque, usa expresiones breves como "en esta línea", "desde esta clave", "esta perspectiva" o simplemente continúa sin nombrarlo.
- Si hay 1 autor principal, nómbralo al comienzo y luego solo cuando haga falta.
- Si hay 2 a 5 autores, distribuye la sesión por bloques y nombra el autor o corriente al inicio de cada bloque.
- Si hay más de 5 autores, agrupa por corrientes, problemas o ejes conceptuales; evita una lista de nombres en cada tarjeta.
- Si la idea cruza autores, usa fórmulas breves como "en el cruce entre X e Y" o "al comparar X con Y".
- Si la idea es una síntesis interpretativa, dilo como "como síntesis de esta lectura" y no la atribuyas falsamente a un autor.
- La atribución debe aparecer preferiblemente en la capa "directa"; no la repitas en "adaptada", "consejo_practico" ni "frase_memorable" salvo necesidad real.` : `- Si el modo no es académico, no fuerces esta estructura. Usa nombres de autores solo cuando aporten claridad.`}

REGLA ANTIMULETILLAS Y VARIACIÓN AUDITIVA
- No uses la misma estructura de frase en más de dos tarjetas cercanas.
- Evita iniciar repetidamente "adaptada" con: "Te permite", "Puedes pensar", "Puedes observar", "Esta clave", "Esta idea", "Esta perspectiva", "La idea muestra".
- Puedes usar esas fórmulas ocasionalmente, pero no como patrón dominante ni en tarjetas consecutivas.
- Alterna modos de contexto: pregunta, contraste, imagen, advertencia, aplicación cotidiana, puente profesional, síntesis, gesto práctico o dilema.
- En "consejo_practico", alterna verbos de acción: observa, pregunta, contrasta, escribe, diseña, compara, conversa, revisa, ubica, imagina, formula.
- En "frase_memorable", evita plantillas repetidas como "La idea..." o "El aprendizaje..."; cada frase debe sonar propia y diferente.
- Si el nombre del usuario es genérico o no especificado, no uses vocativo en la capa "adaptada". No escribas "Mi perfil:", "Usuario:", "Para Mi perfil" ni equivalentes.

REGLA ESPECIAL PARA NARRATIVA E HISTORIA
- Narrativa resume una obra o texto en orden: si es literatura, escenas/capítulos de la trama; si es académica, capítulos, partes, argumentos o secciones. No saltes el hilo central.
- Historia no resume: crea una historia pedagógica nueva para comprender el tema, obra o concepto. Usa la primera tarjeta para presentar brevemente fuente, obra o autor; usa las tarjetas intermedias para desarrollar la historia; usa la última para volver a conectar con la obra, autores o aprendizaje central.
- En Historia, no nombres autores en cada tarjeta. La fuente aparece al inicio y al cierre, salvo cambio necesario.
- En Historia, la narración debe tener continuidad: personajes, escena, conflicto, descubrimiento o viaje comprensible.
- En "Una historia para…", cada tarjeta es una escena. La capa "directa" contiene el cuerpo narrativo de la escena, no una explicación. La capa "adaptada" puede ser una nota breve de sentido para el destinatario. "consejo_practico" puede contener una microacción o pregunta relacionada con la moraleja.

TAREA
1. Trabaja con las fuentes especificadas o, si faltan obras/autores, realiza primero una curaduría interna de fuentes reales, existentes y pertinentes. No digas que no puedes continuar solo porque el usuario no dio libros: debes elegir los mejores posibles para la intención indicada. Si el módulo es "Una historia para…", no hagas curaduría obligatoria de libros: trabaja desde el argumento base, referentes creativos, destinatario y moraleja.
2. Entrega exactamente ${cantidad} ${rotulos[modoLectura] || "tarjetas"}. No extraigas 30 por defecto: usa la cantidad solicitada. No recortes por prioridad: si entregas muchas tarjetas, todas deben ir dentro del arreglo "ideas".
${advertenciaCantidad ? "2.0. " + advertenciaCantidad : ""}
2.1. Si seleccionaste fuentes porque el usuario no las especificó, las tarjetas deben evidenciar una curaduría seria: relación clara entre obra, autor, tema y propósito de la lectura.
2.2. Si una fuente es solo recomendación complementaria, no la trates como obra leída ni atribuyas ideas específicas sin base.
3. Para cada elemento entrega capas útiles para la app:
   - "directa": en lectura normal, aporte general fiel y parafraseado de la obra, fuente o situación, 20 a 30 palabras. En "Una historia para…", escribe aquí la escena narrativa completa, escuchable, de 60 a 130 palabras.
   - "adaptada": puente hacia el usuario, destinatario o grupo real. En historias, úsala como nota breve de sentido para el destinatario, sin romper la narración.
   - "consejo_practico": acción, pregunta o gesto breve ligado a la idea o moraleja.
   - "frase_memorable": frase propia, breve y recordable.
4. La capa de visualización inicial será: ${capaLectura}. Aun así, conserva directa, adaptada, consejo_practico y frase_memorable en el JSON para que la app pueda alternar entre Neto, Contexto, Ambos y Acción.
5. Si el modo es "Narrativa resumida", resume en paráfrasis y no reproduzcas pasajes extensos ni diálogos protegidos. No imites estilo literal de autor vivo o de obra protegida.
6. LÍMITE ÉTICO: si el tema toca duelo, salud, espiritualidad o crisis personales, evita promesas de sanación o curación, no diagnostiques y sugiere acompañamiento profesional cuando corresponda. El consejo acompaña; no trata.
${esSituacion && /paciente/i.test(this.campo(sit.relacion, "") + " " + this.campo(sit.situacion, "")) ? "6.1. Si el destinatario es paciente, mantén un lenguaje de acompañamiento psicoeducativo general; no hagas psicoterapia simulada, diagnóstico, pronóstico ni intervención clínica cerrada. La guía para acompañante debe invitar a criterio profesional y cuidado contextual." : ""}
7. El texto debe ser escuchable: evita etiquetas internas en el contenido verbal. No escribas “Haz:”, “Recuerda:”, “Paso concreto:” dentro de las frases que se leerán por voz; esos rótulos solo son visuales de la app.
7.1. Mantén ritmo auditivo: cada capa debe tener una idea principal más un matiz breve. Evita párrafos largos y no conviertas cada tarjeta en miniensayo.
${esSituacion ? "8. No fuerces autores, corrientes o libros del perfil permanente si no tienen pertinencia clara para esta situación. Si el usuario pidió sugerencias, propón fuentes pertinentes como sugerencias, no como obligación." : ""}
${esSituacion && (salida === "acompanante" || salida === "ambas") ? "9. Incluye una guía breve para acompañante dentro del campo guia_acompanante, separada del texto dirigido al destinatario." : ""}

FORMATO DE RESPUESTA
Devuelve ÚNICAMENTE un JSON válido, sin texto antes ni después, sin comentarios, sin despedidas fuera del objeto y sin bloques de código markdown. Usa comillas dobles válidas y no dejes comas finales. Estructura exacta:

{
  "usuario": ${usuarioJSON},
  "fecha": "AAAA-MM-DD",
  "tipoEntrada": "${esSituacion ? "situacion" : esHistoriaPara ? "historia_para" : "lectura"}",
  "modoLectura": "${modoLectura}",
  "capaLectura": "${capaLectura}",
  "cantidadTarjetas": ${cantidad},
  "tema": "tema solicitado",
  "titulo_sesion": "un título sugestivo y breve",
  "fuentes": ["libro 1", "libro 2"],
  "autores": ["autor 1"],
  "categoria_vital": "${esHistoriaPara ? "historias" : this._instruccionCategoria}",
  "nivel_profundidad": "sencillo | medio | profundo",
  "palabras_clave": ["palabra1", "palabra2"],
  "sugerencias_acceso_abierto": [
    {
      "obra": "título real opcional",
      "autor": "autor real",
      "justificacion": "por qué es pertinente"
    }
  ],
  "saludo_audio": "Saludo breve y cálido dirigido al destinatario real de la lectura.",
  "destinatario": ${destinatarioJSON},
  "guia_acompanante": ${esSituacion && (salida === "acompanante" || salida === "ambas") ? "\"Bloque breve para quien acompaña, separado del audio principal del destinatario.\"" : "null"},
  "ideas": [
    {
      "numero": 1,
      "prioritaria": true,
      "directa": "Aporte general, concepto o escena narrativa. En historias, aquí va la escena completa, original y escuchable.",
      "adaptada": "Versión contextual dirigida a la persona o grupo real, sin confundir nombres y sin repetir innecesariamente la fuente.",
      "consejo_practico": "Una acción, pregunta o microejercicio breve sin etiqueta inicial.",
      "frase_memorable": "Una frase breve y propia, no una cita textual."
    }
  ],
  "guion_audio_cierre": "Despedida breve que invite a guardar, repetir o compartir."
}

Antes de entregar, verifica siete cosas: 1) el JSON es válido; 2) las obras y autores mencionados como fuentes existen; 3) si el usuario no dio obras/autores y no es módulo de historia, la selección de fuentes es pertinente, curada y no inventada; 4) en modo académico, la procedencia es audible por bloques sin repetir autores mecánicamente; 5) no hay muletillas repetidas en adaptada, consejo_practico ni frase_memorable; 6) Historia y Narrativa respetan su función diferenciada; 7) en "Una historia para…", el argumento es original, conserva la historia base si el usuario la dio y transforma referentes protegidos sin copiar escenas, diálogos ni tramas.`;
  }
};

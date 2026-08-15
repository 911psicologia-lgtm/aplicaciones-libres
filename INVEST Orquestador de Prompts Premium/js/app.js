/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
let library = JSON.parse(localStorage.getItem('pf_library') || '[]');
let currentTheme = localStorage.getItem('pf_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let hubFilter = 'all';
let libFilter = 'all';
let editingId = null;

/* ============================================================
   PROTOCOLO ANTI-ALUCINACION
   ============================================================ */
const ANTI_HALLUC_PROTOCOL =
  '══════════════════════════════════════════════\n' +
  'PROTOCOLO ANTI-ALUCINACION (SIEMPRE ACTIVO)\n' +
  '══════════════════════════════════════════════\n' +
  'REGLA 1 — Si no tienes certeza absoluta sobre un dato, fecha, nombre, estadistica o hecho especifico, indicalo con: "No tengo certeza sobre este dato — verifica con fuentes primarias".\n' +
  'REGLA 2 — NO inventes fuentes, citas, nombres de autores, estudios ni referencias inexistentes. Si no conoces la fuente, di: "No tengo referencia verificable para este dato".\n' +
  'REGLA 3 — Si una pregunta requiere informacion posterior a tu corte de conocimiento, comunicalo de inmediato con la fecha exacta de tu corte.\n' +
  'REGLA 4 — Prefiere decir "No lo se con certeza" antes que generar informacion falsa, enganosa o inventada.\n' +
  'REGLA 5 — Cuando presentes datos numericos, estadisticas o porcentajes, indica tu nivel de confianza y, si es posible, la fuente original.\n' +
  'REGLA 6 — Toda informacion presentada como hecho debe estar basada en evidencia real y comprobable. Si algo es opinion, inferencia o estimacion, indicalo claramente como tal.';

/* ============================================================
   CATEGORIAS
   ============================================================ */
const CATEGORIES = {
  apps:        'Aplicaciones',
  web:         'Paginas web',
  docs:        'Documentos',
  images:      'Imagenes',
  videos:      'Videos',
  podcast:     'Podcasts',
  slides:      'Presentaciones',
  surveys:     'Encuestas',
  agents:      'Agentes conversacionales',
  courses:     'Cursos / e-learning',
  copy:        'Marketing / Copywriting',
  narrative:   'Narrativa y ficcion',
  research:    'Investigacion',
  data:        'Analisis de datos',
  feedback:    'Evaluacion y feedback',
  strategy:    'Estrategia',
  automation:  'Automatizacion',
  seo:         'SEO y contenido web',
  translation: 'Traduccion',
  email:       'Email y comunicaciones',
  legal:       'Legal y contractual',
  productivity:'Productividad y gestion',
  improve:     'Mejorar / Auditar / Enseñar',
  other:       'Otro'
};

/* ============================================================
   EQUIPOS DE AGENTES POR CATEGORIA
   ============================================================ */
const AGENT_TEAMS = {
  apps:        'Agente Arquitecto (define estructura y APIs antes del codigo) · Agente Desarrollador senior (implementa con codigo funcional y verificable) · Agente UX (experiencia de usuario y flujo) · Agente Auditor (verifica funcionalidad, seguridad y cases limite)',
  web:         'Agente Disenador UX/UI (experiencia, flujo y jerarquia visual) · Agente Desarrollador frontend (HTML/CSS/JS) · Agente de Contenido (copy y arquitectura informativa) · Agente Auditor (accesibilidad, usabilidad y coherencia)',
  docs:        'Agente Investigador (fuentes y evidencia) · Agente Redactor especializado (estructura y claridad) · Agente Editor (coherencia, estilo y precision) · Agente Verificador de hechos (antialucinacion estricto)',
  images:      'Agente Director de Arte (composicion y concepto visual) · Agente Especialista en prompts visuales (vocabulario tecnico de generacion) · Agente Critico estetico (coherencia con el brief y el estilo solicitado)',
  videos:      'Agente Guionista (narrativa y estructura por segmentos) · Agente Director creativo (tono, ritmo y estilo) · Agente Editor conceptual (montaje, transiciones y engagement)',
  podcast:     'Agente Productor de contenido (estructura del episodio y segmentos) · Agente Guionista de voz (fluidez oral, pausas y naturalidad) · Agente Estratega de audiencia (retencion y engagement)',
  slides:      'Agente Disenador de comunicacion (jerarquia visual e informativa por diapositiva) · Agente Redactor de presentaciones (sintesis, claridad y fluidez narrativa) · Agente Revisor de estructura (coherencia del argumento global)',
  surveys:     'Agente Metodologico (diseno de preguntas sin sesgo) · Agente Estadistico (tipos de escala y analisis posible) · Agente UX de encuesta (experiencia del encuestado y tasa de completion)',
  agents:      'Agente Arquitecto conversacional (flujo, intencion y manejo de contexto) · Agente de Comportamiento (limites, protocolo y tono del agente) · Agente Tester de robustez (casos limite, preguntas fuera de scope y escalada)',
  courses:     'Agente Disenador instruccional (estructura pedagogica y secuencia de aprendizaje) · Agente de Contenido (precision y profundidad tematica) · Agente Evaluador (criterios de exito, evaluaciones y retroalimentacion)',
  copy:        'Agente Copywriter senior (persuasion, claridad y estructura) · Agente Estratega de marca (voz, diferenciacion y coherencia) · Agente de Conversion (CTA, friccion y optimizacion del mensaje)',
  narrative:   'Agente Narrador creativo (voz, ritmo y estilo literario) · Agente Arquitecto de mundo (coherencia interna, consistencia y worldbuilding) · Agente Editor literario (tension, estructura y impacto emocional)',
  research:    'Agente Investigador senior (rigor metodologico y sistematicidad) · Agente Sintetizador (patrones, tensiones y debates en la literatura) · Agente Verificador epistemico (antialucinacion estricto para fuentes y datos)',
  data:        'Agente Analista de datos (metodologia, rigor y pertinencia) · Agente Estadistico (interpretacion y limites validos de los datos) · Agente Comunicador (claridad del resultado para la audiencia objetivo)',
  feedback:    'Agente Revisor experto (criterios de calidad y profundidad analitica) · Agente Evaluador empatico (tono constructivo y motivacion) · Agente de Mejora (sugerencias accionables y priorizadas)',
  strategy:    'Agente Estratega (vision, coherencia y alineacion con el contexto) · Agente Analista (evidencia, entorno y supuestos) · Agente Planificador operativo (accionabilidad, plazos y criterios de exito medibles)',
  automation:  'Agente Ingeniero de procesos (logica del flujo y diseno del pipeline) · Agente Desarrollador (codigo funcional, verificado y con manejo de errores) · Agente Auditor tecnico (cases limite, logs y resiliencia)',
  seo:         'Agente Especialista SEO (tecnica, intencion de busqueda y arquitectura) · Agente Redactor web (naturalidad, fluidez y densidad semantica) · Agente Estratega de contenido (estructura, jerarquia y conversion)',
  translation: 'Agente Traductor especializado (precision y fidelidad semantica) · Agente Localizador cultural (naturalidad y adaptacion al destino) · Agente Revisor final (coherencia global, registro y calidad)',
  email:       'Agente Redactor de comunicaciones (estructura, tono y claridad del mensaje) · Agente Estratega de relacion (contexto del destinatario, objetivo de la comunicacion y momento adecuado) · Agente Revisor (coherencia, cortesia, ausencia de ambiguedad y protocolo)',
  legal:       'Agente Redactor legal (precision terminologica, estructura contractual y clausulas estandar) · Agente Verificador juridico (consistencia, omisiones y riesgos de redaccion) · Agente de Disclaimers (advertencias obligatorias, jurisdiccion y limites del documento)',
  productivity:'Agente Coach de productividad (metodologias probadas, habitos y sistemas de gestion personal) · Agente Planificador (priorizacion, bloques de tiempo y criterios de urgencia/importancia) · Agente Optimizador (friccion, automatizacion de decisiones y revision de procesos)',
  improve:     'Agente Auditor (diagnostica problemas, verifica integridad y funcionalidad del objetivo) · Agente Corrector (propone y aplica correcciones minimas, preservando lo que funciona) · Agente Tutor (explica procedimientos, ensena paso a paso, adapta lenguaje al nivel del usuario) · Agente Creador de agentes (disena arquitectura, comportamiento y limites de agentes de IA) · Agente Verificador de regresion (asegura que las correcciones no rompan lo que ya funciona)',
  other:       'Agente Principal (especialista en la tarea descrita) · Agente Auditor de calidad (verifica coherencia del resultado con el brief y el objetivo)'
};

/* ============================================================
   DIRECTRICES POR CATEGORIA
   ============================================================ */
const CAT_DIRECTIVES = {
  apps:
    '**Directrices para desarrollo de aplicaciones:**\n' +
    '• Todo codigo debe ser funcional y verificable. No incluyas APIs, funciones ni librerias sin confirmar que existen y estan documentadas.\n' +
    '• Define la arquitectura antes de escribir codigo. Propone la estructura de modulos antes de implementar.\n' +
    '• Incluye manejo de errores, validaciones y casos limite documentados.\n' +
    '• Si una dependencia o endpoint no puedes verificar, declaralo explicitamente como supuesto.\n' +
    '• El codigo debe ser reproducible: quien lo copie debe poder ejecutarlo sin pasos ocultos.',

  web:
    '**Directrices para diseno web:**\n' +
    '• Define la jerarquia de informacion antes de disenar. Que ve el usuario primero, segundo, tercero.\n' +
    '• Cada elemento visual y textual debe tener un proposito funcional verificable.\n' +
    '• Considera la ecologia de uso: en que dispositivos, con que conexion, en que contexto usa la pagina.\n' +
    '• Accesibilidad basica: contraste suficiente, estructura semantica, texto alternativo en imagenes.\n' +
    '• El contenido debe estar basado en evidencia real de la audiencia, no en suposiciones del creador.',

  docs:
    '**Directrices para documentos:**\n' +
    '• Toda afirmacion debe estar respaldada por evidencia verificable o declarada como inferencia.\n' +
    '• No inventes datos, estadisticas ni referencias. Si no conoces la fuente, indicalo explicitamente.\n' +
    '• Distingue claramente: hechos verificados / opiniones / estimaciones / suposiciones.\n' +
    '• La estructura debe servir al lector: cada seccion tiene un proposito claro y diferenciado.\n' +
    '• Si el documento requiere actualizacion periodica, senalalo en el documento mismo.',

  images:
    '**Directrices para generacion de imagenes:**\n' +
    '• Cada especificacion visual debe estar basada en referencias reales y verificables.\n' +
    '• Describe con igual precision lo que DEBE incluir y lo que debe EVITAR.\n' +
    '• Usa vocabulario tecnico de generacion de imagenes: plano, iluminacion, paleta, composicion, ratio.\n' +
    '• La atmosfera y emocion deben describirse en terminos observables, no en adjetivos vagos.\n' +
    '• Incluye el estilo artistico con referencias concretas (artista, movimiento, tecnica conocida).',

  videos:
    '**Directrices para video:**\n' +
    '• El guion debe considerar el ritmo visual: que se ve mientras se escucha en cada segmento.\n' +
    '• Define la identidad del contenido: tono, valores que comunica, experiencia del espectador.\n' +
    '• Cada segmento debe conectar con el objetivo final del video (sin relleno).\n' +
    '• Considera las restricciones de la plataforma: duracion, formato de subtitulos, miniatura.',

  podcast:
    '**Directrices para podcast:**\n' +
    '• El guion debe sonar natural al hablarse: sin oraciones que solo funcionan escritas.\n' +
    '• Captura la identidad sonora: personalidad del host, atmosfera, relacion con la audiencia.\n' +
    '• Incluye indicaciones de pausa, enfasis y transiciones si es guion completo.\n' +
    '• Define la ecologia de escucha: quien escucha, cuando, donde y con que frecuencia.',

  slides:
    '**Directrices para presentaciones:**\n' +
    '• Una idea central por diapositiva. La slide no es para leer: es para ver mientras se escucha.\n' +
    '• Cada diapositiva debe conectar con el argumento central de la presentacion.\n' +
    '• Define la jerarquia: titulo > subtitulo > detalle. No todos los niveles en cada slide.\n' +
    '• El orden de slides debe construir un argumento progresivo, no solo listar informacion.',

  surveys:
    '**Directrices para encuestas:**\n' +
    '• Define que decisiones se tomaran con los datos antes de disenar las preguntas.\n' +
    '• Las preguntas deben ser neutras: sin sesgo de confirmacion ni respuestas sugeridas.\n' +
    '• Cada pregunta mide una sola variable. Sin preguntas dobles ni ambiguas.\n' +
    '• Ordena las preguntas de menos a mas sensible para reducir abandono.\n' +
    '• Indica como se analizara cada tipo de pregunta (cuantitativo / cualitativo).',

  agents:
    '**Directrices para agentes conversacionales:**\n' +
    '• Define limites claros: que puede responder, que no puede, y como manejar lo que esta fuera de scope.\n' +
    '• El agente debe priorizar la certeza sobre la especulacion. Si no sabe, debe declararlo.\n' +
    '• Toda informacion que provea debe estar basada en evidencia verificable.\n' +
    '• Incluye protocolo de escalada explicito para preguntas fuera de su alcance.\n' +
    '• Define la personalidad como comportamientos observables, no como adjetivos vagos.',

  courses:
    '**Directrices pedagogicas:**\n' +
    '• Define lo que el estudiante ya sabe (conocimiento previo) y la brecha que llena el curso.\n' +
    '• Cada modulo debe conectar con el objetivo final del curso (religaje funcional).\n' +
    '• Incluye evaluaciones practicas que verifiquen que el aprendizaje fue efectivo, no solo que se consumio contenido.\n' +
    '• Considera las resistencias y barreras comunes del estudiante objetivo antes de disenar.\n' +
    '• La secuencia de contenidos debe construir comprension progresivamente, no por orden logico del tema.',

  copy:
    '**Directrices para copywriting:**\n' +
    '• El copy debe responder a una tension real del lector (problema, deseo, miedo o aspiracion).\n' +
    '• El CTA debe ser claro, especifico y sin friccion (que ocurre exactamente al hacer clic).\n' +
    '• Cada elemento (titular, cuerpo, CTA) tiene un trabajo funcional especifico que cumplir.\n' +
    '• El diferenciador debe ser verificable y relevante para la audiencia.\n' +
    '• Evita afirmaciones vacias ("el mejor", "unico", "increible"). Usa evidencia especifica y concreta.',

  narrative:
    '**Directrices para narrativa:**\n' +
    '• La voz del narrador debe ser consistente de principio a fin.\n' +
    '• Cada escena o fragmento debe avanzar la trama, el personaje o el mundo. Sin relleno.\n' +
    '• La coherencia interna del mundo o historia es obligatoria: nada ocurre "porque si".\n' +
    '• Muestra en lugar de decir: preferir acciones y detalles sensoriales a descripciones abstractas.\n' +
    '• La tension narrativa debe mantenerse activa en cada fragmento.',

  research:
    '**Directrices para investigacion:**\n' +
    '• Distingue entre conocimiento establecido y lo que sigue en debate activo en el campo.\n' +
    '• No inventes fuentes, autores, estudios ni citas. Si no puedes verificar, declaralo explicitamente.\n' +
    '• Senala las tensiones y discrepancias entre posiciones, no solo el consenso.\n' +
    '• Indica el horizonte temporal de la revision (hasta que fecha es confiable la informacion).\n' +
    '• Sugiere fuentes primarias reales para verificacion independiente del lector.',

  data:
    '**Directrices para analisis de datos:**\n' +
    '• Declara los supuestos del analisis antes de presentar resultados.\n' +
    '• Distingue correlacion de causalidad. Senala explicitamente si infiere una relacion causal.\n' +
    '• Indica el nivel de confianza y los limites de los datos disponibles.\n' +
    '• El analisis debe responder a una pregunta especifica, no explorar todo lo que hay.\n' +
    '• Si los datos tienen sesgos conocidos, mencionarlos es obligatorio, no opcional.',

  feedback:
    '**Directrices para retroalimentacion:**\n' +
    '• El feedback debe ser accionable: no "esto esta mal" sino "cambia X por Y porque Z".\n' +
    '• Equilibra lo que funciona bien con lo que debe mejorar (no solo critica).\n' +
    '• Ordena el feedback por prioridad de impacto, no por orden de aparicion en el documento.\n' +
    '• Basa las sugerencias en criterios claros, no en preferencias subjetivas sin justificacion.\n' +
    '• El tono debe orientar hacia la mejora, no desanimar al receptor.',

  strategy:
    '**Directrices para estrategia:**\n' +
    '• Toda recomendacion estrategica debe estar basada en evidencia del contexto, no en buenas intenciones.\n' +
    '• Define supuestos explicitamente: que condiciones deben cumplirse para que la estrategia funcione.\n' +
    '• Incluye criterios de exito medibles con horizonte temporal definido.\n' +
    '• Senala los riesgos principales y como mitigarlos.\n' +
    '• La estrategia debe ser accionable: quien hace que, cuando y como sabremos que funciono.',

  automation:
    '**Directrices para automatizacion:**\n' +
    '• Todo codigo debe ser funcional, con manejo de errores y casos limite documentados.\n' +
    '• No uses librerias o APIs sin verificar que existen y estan activas y documentadas.\n' +
    '• Incluye logging basico para diagnostico de errores en produccion.\n' +
    '• El script debe ser reproducible: quien lo ejecute por primera vez no debe fallar en pasos no documentados.\n' +
    '• Define que pasa cuando algo falla: silencioso, alerta, reintento automatico.',

  seo:
    '**Directrices para SEO:**\n' +
    '• El contenido debe responder genuinamente a la intencion de busqueda, no solo incluir keywords.\n' +
    '• La keyword objetivo debe aparecer de forma natural, no forzada ni repetida artificialmente.\n' +
    '• Define la estructura de encabezados (H1, H2, H3) antes de escribir el cuerpo.\n' +
    '• El contenido debe aportar valor real que justifique el posicionamiento organico.\n' +
    '• Incluye meta title (hasta 60 caracteres) y meta description (hasta 160 caracteres).',

  translation:
    '**Directrices para traduccion:**\n' +
    '• La prioridad es la naturalidad en el idioma de destino, no la literalidad forzada.\n' +
    '• Adapta referencias culturales, unidades de medida y convenciones de formato al destino.\n' +
    '• Mantiene la voz y tono del original en el registro equivalente del idioma destino.\n' +
    '• Si hay terminos sin equivalente directo, propone transliteracion mas explicacion.\n' +
    '• Verifica que modismos y expresiones idiomaticas sean naturales en la cultura de destino.',

  improve:
    '**Directrices para mejorar, auditar y ensenar:**\n' +
    '• Principio rector: primero no danes. Toda intervencion debe preservar lo que ya funciona correctamente.\n' +
    '• Diagnostica antes de intervenir. Identifica el problema real antes de proponer correcciones.\n' +
    '• Toda correccion debe ser minima y verificable. Si cambias algo, explica por que y que podria romperse.\n' +
    '• Despues de cada correccion, verifica regresion: lo que funcionaba antes sigue funcionando.\n' +
    '• Si ensenas o instruyes, adapta el lenguaje al nivel del aprendiz. Explica el por que, no solo el como.\n' +
    '• Al disenar agentes de IA, define limites claros, protocolo de escalada y comportamientos observables.\n' +
    '• No inventes problemas que no existen. No corrijas lo que no esta roto.\n' +
    '• El resultado debe siempre conectar con el objetivo declarado por el usuario (religaje funcional).',

  email:
    '**Directrices para email y comunicaciones:**\n' +
    '• Todo email debe tener un unico objetivo claro. Si necesitas pedir dos cosas, envia dos emails.\n' +
    '• El asunto debe comunicar la accion o decision esperada, no solo el tema.\n' +
    '• Adapta el tono a la relacion: no es lo mismo un email a un CEO que a un companero de equipo.\n' +
    '• Incluye siempre un cierre con proximo paso o llamada a la accion explicita.\n' +
    '• Si el email es de seguimiento, referencia el contexto anterior de forma que el destinatario no necesite buscar el hilo.\n' +
    '• No uses jerga interna que el destinatario no conozca. La claridad es cortesia.',

  legal:
    '**Directrices para documentos legales:**\n' +
    '• INCLUIR SIEMPRE un disclaimer al inicio: "Este documento es un borrador generado por IA y NO constituye asesoría legal. Consulte siempre con un abogado licenciado antes de firmar o ejecutar cualquier documento legal."\n' +
    '• Especifica la jurisdiccion aplicable (pais, estado/region). Un contrato sin jurisdiccion es ambiguo.\n' +
    '• Usa terminologia juridica precisa. Un termino incorrecto puede cambiar el significado legal de una clausula.\n' +
    '• No inventes leyes, articulos, codigos ni referencias normativas. Si no conoces la norma exacta, indicalo.\n' +
    '• Toda clausula debe tener un proposito claro y verificable. Sin clausulas decorativas.\n' +
    '• Si el documento requiere firma o ejecucion, indica donde van las firmas y quien debe firmar.',

  productivity:
    '**Directrices para productividad y gestion:**\n' +
    '• Todo sistema de productividad debe ser ejecutable, no teorico. Si no se puede implementar manana, no es util.\n' +
    '• Adapta las recomendaciones al contexto real del usuario: numero de personas, herramientas disponibles, tipo de trabajo.\n' +
    '• Prioriza por impacto, no por urgencia aparente. Distingue lo urgente de lo importante.\n' +
    '• Incluye criterios de decision claros: como decidir que hacer primero, que posponer, que eliminar.\n' +
    '• Si propones un habito o rutina, incluye el trigger (que lo activa), la accion y la recompensa.\n' +
    '• Verifica que el sistema propuesto no genere mas overhead que el problema que resuelve.',

  other:
    '**Directrices generales basadas en evidencia:**\n' +
    '• Diagnostica el problema real antes de proponer la solucion.\n' +
    '• Toda afirmacion debe ser verificable o declarada como inferencia.\n' +
    '• El resultado debe conectar directamente con el problema o necesidad declarados.\n' +
    '• Si algo no puedes verificar, decirlo es mas valioso que inventarlo.\n' +
    '• El humano decide con criterio; la IA propone con evidencia.'
};

/* ============================================================
   CAMPOS DINAMICOS POR CATEGORIA
   ============================================================ */
const DYNAMIC_FIELDS = {
  apps: [
    { id:'df-stack',   label:'Stack tecnologico',        type:'input',  ph:'Ej: React + Node.js + PostgreSQL, Flutter, Python/FastAPI...' },
    { id:'df-apptype', label:'Tipo de aplicacion',       type:'select', opts:[['','-- Selecciona --'],['web','App web (navegador)'],['mobile','App movil (iOS/Android)'],['pwa','PWA (Progressive Web App)'],['desktop','App desktop'],['cli','Script / CLI'],['api','API / Backend']] },
    { id:'df-auth',    label:'¿Necesita autenticacion?', type:'select', opts:[['','-- Selecciona --'],['no','No, es publica'],['si','Si, usuarios registrados'],['roles','Si, con roles/permisos'],['opt','Opcional (modo invitado)']] },
    { id:'df-scale',   label:'Escala esperada de usuarios', type:'select', opts:[['','-- Selecciona --'],['personal','Personal (1-5 usuarios)'],['team','Equipo (5-50)'],['org','Organizacion (50-500)'],['public','Publico (500+ usuarios)']] }
  ],
  web: [
    { id:'df-webtype', label:'Tipo de pagina',           type:'select', opts:[['','-- Selecciona --'],['landing','Landing / captacion'],['portfolio','Portfolio / presentacion'],['ecommerce','Tienda en linea'],['blog','Blog / publicaciones'],['corporate','Corporativa / institucional'],['dashboard','Dashboard / panel interno'],['docsite','Documentacion tecnica']] },
    { id:'df-devices', label:'Dispositivos prioritarios', type:'select', opts:[['','-- Selecciona --'],['desktop','Desktop primero'],['mobile','Movil primero'],['both','Responsive (ambos igual)']] },
    { id:'df-webcta',  label:'Llamado a la accion principal (CTA)', type:'input', ph:'Ej: Registrarse, Comprar ahora, Solicitar demo...' }
  ],
  docs: [
    { id:'df-doctype',   label:'Tipo de documento',   type:'select', opts:[['','-- Selecciona --'],['informe','Informe / reporte'],['manual','Manual / guia'],['articulo','Articulo / ensayo'],['propuesta','Propuesta / oferta comercial'],['plan','Plan estrategico'],['tesis','Tesis / trabajo academico'],['otro','Otro']] },
    { id:'df-doclength', label:'Extension esperada',   type:'select', opts:[['','-- Selecciona --'],['breve','Breve (hasta 500 palabras)'],['media','Media (500-2000 palabras)'],['larga','Larga (2000-5000 palabras)'],['muy-larga','Muy larga (5000+ palabras)']] },
    { id:'df-sources',   label:'¿Requiere citas/fuentes?', type:'select', opts:[['','-- Selecciona --'],['no','No, sin referencias'],['pocos','Pocas (2-5 fuentes)'],['varios','Varias (5-15 fuentes)'],['exhaustivo','Exhaustivo (15+ fuentes)']] },
    { id:'df-acad',      label:'Nivel de formalidad',  type:'select', opts:[['','-- Selecciona --'],['divulgacion','Divulgacion (lenguaje accesible)'],['profesional','Profesional / corporativo'],['academico','Academico / cientifico']] }
  ],
  images: [
    { id:'df-style', label:'Estilo visual',         type:'select', opts:[['','-- Selecciona --'],['fotorealista','Fotorealista'],['ilustracion','Ilustracion digital'],['3d','Render 3D'],['acuarela','Acuarela / pintura'],['pixel','Pixel art'],['minimalista','Minimalista / flat'],['concept','Concept art / fantasia'],['editorial','Editorial / revista'],['otro','Otro (describir en intencion)']] },
    { id:'df-ratio', label:'Dimensiones / ratio',   type:'select', opts:[['','-- Selecciona --'],['1:1','Cuadrado (1:1)'],['16:9','Horizontal panoramica (16:9)'],['4:3','Horizontal clasica (4:3)'],['9:16','Vertical / Stories (9:16)'],['4:5','Vertical feed (4:5)'],['libre','Sin restriccion de ratio']] },
    { id:'df-avoid', label:'Que debe EVITAR',       type:'input',  ph:'Ej: Sin texto, sin personas, sin colores oscuros...' },
    { id:'df-ref',   label:'Referencia visual',     type:'input',  ph:'Ej: "al estilo de Moebius", "como foto de National Geographic"...' }
  ],
  videos: [
    { id:'df-viddur',  label:'Duracion aproximada', type:'select', opts:[['','-- Selecciona --'],['short','Corto (menos de 1 min)'],['medium','Medio (1-5 min)'],['long','Largo (5-15 min)'],['extended','Extendido (15+ min)']] },
    { id:'df-vidplat', label:'Plataforma destino',  type:'select', opts:[['','-- Selecciona --'],['youtube','YouTube'],['tiktok','TikTok'],['reels','Instagram Reels'],['linkedin','LinkedIn'],['interna','Uso interno / corporativo'],['otro','Otra']] },
    { id:'df-vidtype', label:'Tipo de video',       type:'select', opts:[['','-- Selecciona --'],['tutorial','Tutorial / educativo'],['promo','Promocional / publicitario'],['entrevista','Entrevista / conversacional'],['documental','Documental / reportaje'],['testimonial','Testimonial'],['animado','Animado / motion graphics']] }
  ],
  podcast: [
    { id:'df-poddur',    label:'Duracion del episodio', type:'select', opts:[['','-- Selecciona --'],['micro','Micro (menos de 10 min)'],['standard','Estandar (20-45 min)'],['long','Largo (45-90 min)']] },
    { id:'df-podformat', label:'Que necesitas',         type:'select', opts:[['','-- Selecciona --'],['guion','Guion completo'],['outline','Outline / esquema de segmentos'],['notas','Notas del presentador'],['preguntas','Preguntas para entrevistado']] },
    { id:'df-podhosts',  label:'Participantes',         type:'select', opts:[['','-- Selecciona --'],['solo','Solo host (monologo)'],['duo','Dos hosts / co-presentadores'],['multi','Multiples participantes'],['interview','Host + invitado/a']] }
  ],
  slides: [
    { id:'df-slidesnum',     label:'Numero de diapositivas',   type:'input',  ph:'Ej: 12, o "entre 10 y 15"...' },
    { id:'df-slidesapp',     label:'Herramienta de presentacion', type:'select', opts:[['','-- Selecciona --'],['powerpoint','PowerPoint'],['google','Google Slides'],['canva','Canva'],['keynote','Keynote (Apple)'],['otro','Otra / sin preferencia']] },
    { id:'df-slidespurpose', label:'Proposito de la presentacion', type:'select', opts:[['','-- Selecciona --'],['pitch','Pitch / inversion'],['academic','Academica / tesis'],['corporate','Corporativa / negocios'],['training','Formacion / capacitacion'],['conference','Conferencia / ponencia'],['sales','Ventas / propuesta comercial']] }
  ],
  surveys: [
    { id:'df-surveyobj',  label:'Objetivo de la encuesta', type:'input',  ph:'Ej: Medir satisfaccion del cliente, evaluar conocimiento previo...' },
    { id:'df-surveytype', label:'Tipo de preguntas',       type:'select', opts:[['','-- Selecciona --'],['likert','Escala Likert (1-5 o 1-7)'],['multiple','Opcion multiple'],['abierta','Preguntas abiertas'],['mix','Combinacion (abiertas + cerradas)'],['nps','NPS (Net Promoter Score)']] },
    { id:'df-surveyplat', label:'Plataforma destino',     type:'select', opts:[['','-- Selecciona --'],['google','Google Forms'],['typeform','Typeform'],['surveymonkey','SurveyMonkey'],['jotform','JotForm'],['propio','Sistema propio'],['otro','Otra']] }
  ],
  agents: [
    { id:'df-agentplat', label:'Plataforma de despliegue', type:'select', opts:[['','-- Selecciona --'],['web','Widget en sitio web'],['whatsapp','WhatsApp Business'],['slack','Slack'],['telegram','Telegram'],['teams','Microsoft Teams'],['custom','Integracion propia / API']] },
    { id:'df-agentscope', label:'Scope de conocimiento del agente', type:'textarea', ph:'Que sabe y que puede responder. Ej: Solo productos del catalogo y politicas de devolucion. No puede opinar sobre competidores.', rows:2 },
    { id:'df-agentesc',  label:'Protocolo de escalada',    type:'input',  ph:'Que hace cuando no sabe. Ej: Deriva a humano, muestra formulario de contacto...' }
  ],
  courses: [
    { id:'df-courselevel', label:'Nivel del estudiante',    type:'select', opts:[['','-- Selecciona --'],['beginner','Principiante (sin experiencia previa)'],['intermediate','Intermedio (conocimientos basicos)'],['advanced','Avanzado (experiencia solida)'],['expert','Experto / profesional en ejercicio']] },
    { id:'df-coursemod',   label:'Modalidad',               type:'select', opts:[['','-- Selecciona --'],['sync','Sincronica (en vivo)'],['async','Asincronica (autoguiada)'],['mixed','Mixta (blended)'],['micro','Microaprendizaje (lecciones cortas)']] },
    { id:'df-courseplat',  label:'Plataforma LMS destino',  type:'input',  ph:'Ej: Moodle, Canvas, Google Classroom, Teachable...' },
    { id:'df-courseeval',  label:'¿Incluye evaluaciones?',  type:'select', opts:[['','-- Selecciona --'],['no','No, solo contenido'],['quizzes','Cuestionarios / quizzes'],['practical','Ejercicios practicos'],['project','Proyecto final'],['rubric','Rubrica de evaluacion']] }
  ],
  copy: [
    { id:'df-copytype', label:'Tipo de copy',         type:'select', opts:[['','-- Selecciona --'],['ad','Anuncio (Meta, Google, LinkedIn)'],['email','Email / newsletter'],['landing','Landing page / hero'],['social','Post de redes sociales'],['pitch','Pitch / elevator pitch'],['product','Descripcion de producto'],['press','Nota de prensa']] },
    { id:'df-copycta',  label:'CTA principal',        type:'input',  ph:'Ej: "Empieza gratis", "Agenda tu demo", "Compra ahora"...' },
    { id:'df-copydiff', label:'Diferenciador clave',  type:'input',  ph:'Que hace unico al producto. Ej: "unico sin contrato anual", "entrega en 24h garantizada"...' }
  ],
  narrative: [
    { id:'df-nartype', label:'Tipo de narrativa', type:'select', opts:[['','-- Selecciona --'],['story','Cuento / historia corta'],['script','Guion (cine / teatro / videojuego)'],['world','Worldbuilding'],['character','Ficha de personaje'],['chapter','Capitulo de novela'],['scene','Escena especifica']] },
    { id:'df-genre',   label:'Genero',            type:'select', opts:[['','-- Selecciona --'],['fantasy','Fantasia'],['scifi','Ciencia ficcion'],['thriller','Thriller / suspenso'],['romance','Romance'],['horror','Horror / terror'],['historical','Historico'],['literary','Literario / contemporaneo'],['other','Otro']] },
    { id:'df-pov',     label:'Punto de vista narrativo', type:'select', opts:[['','-- Selecciona --'],['first','Primera persona (Yo)'],['second','Segunda persona (Tu)'],['third-l','Tercera persona limitada'],['third-o','Tercera persona omnisciente']] }
  ],
  research: [
    { id:'df-resarea', label:'Area de conocimiento', type:'input',  ph:'Ej: Neurociencia cognitiva, Marketing digital, Derecho laboral...' },
    { id:'df-restype', label:'Tipo de revision',     type:'select', opts:[['','-- Selecciona --'],['overview','Overview / panorama general'],['systematic','Revision sistematica'],['narrative','Revision narrativa / ensayo'],['sota','Estado del arte (SotA)'],['comparative','Analisis comparativo de enfoques']] },
    { id:'df-resdep',  label:'Profundidad de analisis', type:'select', opts:[['','-- Selecciona --'],['surface','Panoramica (sin detalles)'],['moderate','Moderada (principales corrientes)'],['deep','Profunda (tensiones y debates)']] }
  ],
  data: [
    { id:'df-datatype',   label:'Tipo de analisis',   type:'select', opts:[['','-- Selecciona --'],['descriptive','Descriptivo (que paso)'],['diagnostic','Diagnostico (por que paso)'],['predictive','Predictivo (que podria pasar)'],['comparative','Comparativo (A vs B)'],['segmentation','Segmentacion / clustering']] },
    { id:'df-datatool',   label:'Herramienta / entorno destino', type:'select', opts:[['','-- Selecciona --'],['narrative','Narrativa (solo interpretacion textual)'],['excel','Excel / Google Sheets'],['python','Python (Pandas / Matplotlib)'],['r','R (ggplot / tidyverse)'],['sql','SQL'],['tableau','Tableau / Power BI']] },
    { id:'df-dataoutput', label:'Formato de salida',  type:'select', opts:[['','-- Selecciona --'],['table','Tabla de datos'],['code','Codigo de analisis'],['narrative','Narrativa interpretativa'],['visual','Descripcion de grafico / visualizacion'],['dashboard','Estructura de dashboard']] }
  ],
  feedback: [
    { id:'df-fbobj',    label:'Que se evalua',            type:'select', opts:[['','-- Selecciona --'],['text','Texto (articulo, ensayo, reporte)'],['code','Codigo / arquitectura tecnica'],['design','Diseno (UI/UX, grafico)'],['presentation','Presentacion / slides'],['strategy','Estrategia / plan'],['process','Proceso / metodologia']] },
    { id:'df-fblevel',  label:'Nivel de critica esperado', type:'select', opts:[['','-- Selecciona --'],['gentle','Constructivo y amable (principiante)'],['balanced','Equilibrado (bueno y mejorable)'],['rigorous','Riguroso (auditoria exigente)'],['expert','Como revisor experto / par academico']] },
    { id:'df-fbout',    label:'Formato del feedback',     type:'select', opts:[['','-- Selecciona --'],['lista','Lista de mejoras priorizadas'],['rubric','Rubrica / tabla de criterios'],['rewrite','Sugerencias + version mejorada'],['comments','Comentarios en linea (cita + sugerencia)']] }
  ],
  strategy: [
    { id:'df-strattype',    label:'Tipo de entregable estrategico', type:'select', opts:[['','-- Selecciona --'],['roadmap','Roadmap / hoja de ruta'],['actionplan','Plan de accion (OKRs, tareas)'],['swot','Analisis FODA / DAFO'],['framework','Marco estrategico / modelo de negocio'],['decision','Matriz de decision'],['scenario','Analisis de escenarios']] },
    { id:'df-strathorizon', label:'Horizonte temporal', type:'select', opts:[['','-- Selecciona --'],['immediate','Inmediato (proximas 2 semanas)'],['short','Corto plazo (1-3 meses)'],['medium','Mediano plazo (3-12 meses)'],['long','Largo plazo (1-3 anos)'],['vision','Vision estrategica (3+ anos)']] },
    { id:'df-stratscale',   label:'Escala / alcance',   type:'select', opts:[['','-- Selecciona --'],['personal','Personal / freelance'],['startup','Startup / proyecto naciente'],['sme','PYME / empresa mediana'],['corporate','Corporacion / gran empresa'],['nonprofit','ONG / institucion sin fines de lucro'],['government','Entidad publica / gobierno']] }
  ],
  automation: [
    { id:'df-autoplat',    label:'Plataforma / entorno',    type:'select', opts:[['','-- Selecciona --'],['python','Python'],['javascript','JavaScript / Node.js'],['bash','Bash / Shell'],['zapier','Zapier / Make (no-code)'],['powerauto','Power Automate'],['n8n','n8n'],['otro','Otro']] },
    { id:'df-autotrigger', label:'Disparador / trigger',    type:'input',  ph:'Que activa el proceso. Ej: Nuevo archivo en carpeta, formulario enviado, hora especifica...' },
    { id:'df-autooutput',  label:'Resultado esperado',      type:'input',  ph:'Que produce la automatizacion. Ej: Correo enviado, archivo creado, dato registrado...' }
  ],
  seo: [
    { id:'df-seokw',   label:'Keyword / frase objetivo',   type:'input',  ph:'Ej: "agencia de marketing digital Bogota", "como hacer pan sin gluten"...' },
    { id:'df-seotype', label:'Tipo de contenido SEO',      type:'select', opts:[['','-- Selecciona --'],['article','Articulo de blog / pilar de contenido'],['product','Ficha de producto / categoria'],['meta','Meta title + meta description'],['local','SEO local (Google Business)'],['technical','Descripcion tecnica (schema, alt text)']] },
    { id:'df-seoint',  label:'Intencion de busqueda',      type:'select', opts:[['','-- Selecciona --'],['informational','Informativa (quiere aprender)'],['navigational','Navegacional (busca marca/sitio)'],['commercial','Comercial (compara opciones)'],['transactional','Transaccional (quiere comprar/descargar)']] }
  ],
  translation: [
    { id:'df-translang',  label:'Idioma de destino',         type:'input',  ph:'Ej: Ingles (EE.UU.), Portugues (Brasil), Frances (Francia)...' },
    { id:'df-transcult',  label:'Tipo de adaptacion',        type:'select', opts:[['','-- Selecciona --'],['literal','Traduccion literal (fidelidad maxima)'],['adapted','Adaptacion cultural (naturalidad en destino)'],['localized','Localizacion completa (referencias, modismos)'],['transcreation','Transcreacion (recreacion creativa)']] },
    { id:'df-transdomain',label:'Dominio especializado',     type:'input',  ph:'Si aplica: legal, medico, tecnico, literario, marketing...' }
  ],
  improve: [
    { id:'df-imptype',    label:'Tipo de tarea',             type:'select', opts:[['','-- Selecciona --'],['audit-app','Auditar una aplicacion'],['fix-app','Corregir / mejorar una aplicacion'],['create-agent','Crear un agente de IA'],['tutor','Actuar como tutor / educador'],['procedure','Guiar un procedimiento paso a paso'],['other-improve','Otro (describir abajo)']] },
    { id:'df-impwhat',    label:'Que aplicacion, sistema o procedimiento',  type:'textarea', ph:'Describe brevemente que quieres auditar, mejorar, o en lo que necesitas instruccion. Ej: "Mi app de inventario en React", "Proceso de onboarding de clientes", "Agente de soporte para tienda online"...', rows:2 },
    { id:'df-impcurrent', label:'Estado actual o problema conocido',       type:'textarea', ph:'Que funciona, que no funciona, o que quieres lograr. Ej: "El login falla al usar Google", "Necesito que el agente sepa responder sobre precios"...', rows:2 },
    { id:'df-imptechno',  label:'Tecnologia o herramientas involucradas',  type:'input',  ph:'Ej: React + Node.js, Python, Dialogflow, WhatsApp API...' },
    { id:'df-implevel',   label:'Nivel del usuario / aprendiz',            type:'select', opts:[['','-- Selecciona --'],['beginner','Principiante (necesita explicacion detallada)'],['intermediate','Intermedio (conoce los conceptos basicos)'],['advanced','Avanzado (busca optimizacion o correccion puntual)'],['expert','Experto (busca verificacion o segundo criterio)']] },
    { id:'df-impaddfields', label:'Campos adicionales para esta tarea',    type:'textarea', ph:'Agrega cualquier campo extra que necesites. Formato libre: Nombre del campo: valor. Ej: "Framework: Django", "Tipo de agente: asistente virtual"...', rows:2 }
  ],
  email: [
    { id:'df-emailtype',  label:'Tipo de email',              type:'select', opts:[['','-- Selecciona --'],['corporate','Email corporativo / formal'],['cold','Cold outreach / prospeccion'],['followup','Seguimiento / follow-up'],['newsletter','Newsletter / comunicado periodico'],['client','Comunicacion con cliente'],['internal','Comunicacion interna (equipo)'],['apology','Disculpa o rectificacion'],['proposal','Propuesta comercial por email'],['other-email','Otro (describir en intencion)']] },
    { id:'df-emailto',    label:'Destinatario (rol / relacion)', type:'input',  ph:'Ej: CEO de la empresa, cliente en etapa de negociacion, equipo de desarrollo...' },
    { id:'df-emailgoal',  label:'Que quieres que haga el destinatario al leer', type:'input',  ph:'Ej: Aprobar el presupuesto, Agendar una reunion, Responder con feedback...' },
    { id:'df-emailprev',  label:'Contexto previo (si es seguimiento)',  type:'textarea', ph:'Ej: "Le envie la propuesta hace 3 dias y no ha respondido", "En la ultima reunion acordamos..."', rows:2 },
    { id:'df-emailtone',  label:'Nivel de formalidad',         type:'select', opts:[['','-- Selecciona --'],['formal','Formal (senores, tratamiento de usted)'],['semiformal','Semiformal (tratamiento de usted pero cercano)'],['casual-e','Casual / directo (tratamiento de tu, equipo cercano)'],['diplomatic','Diplomatico (situacion sensible o conflicto)']] }
  ],
  legal: [
    { id:'df-legaltype',  label:'Tipo de documento legal',    type:'select', opts:[['','-- Selecciona --'],['contract','Contrato / acuerdo'],['terms','Terminos y condiciones'],['privacy','Politica de privacidad'],['nda','Acuerdo de confidencialidad (NDA)'],['sla','Acuerdo de nivel de servicio (SLA)'],['employment','Contrato laboral'],['policy','Politica interna / reglamento'],['review','Revision / auditoria de documento legal existente'],['other-legal','Otro (describir en intencion)']] },
    { id:'df-legaljur',   label:'Jurisdiccion aplicable',     type:'input',  ph:'Ej: Colombia, Espana, Mexico, Estado de California (EE.UU.)...' },
    { id:'df-legalparties', label:'Partes involucradas',      type:'textarea', ph:'Quienes son las partes. Ej: "Empresa XYZ SAS (proveedor) y ABC Corp (cliente)". Si hay mas de dos partes, listalas todas.', rows:2 },
    { id:'df-legalkey',   label:'Aspectos clave a cubrir',    type:'textarea', ph:'Ej: "Confidencialidad por 5 anos, penalidad por incumplimiento, propiedad intelectual del producto"...', rows:2 },
    { id:'df-legalwarn',  label:'Riesgos o preocupaciones conocidas', type:'input',  ph:'Ej: "La otra parte pide clausula de exclusividad", "Hay datos personales de menores"...' }
  ],
  productivity: [
    { id:'df-prodtype',   label:'Tipo de entregable',         type:'select', opts:[['','-- Selecciona --'],['weekly','Plan semanal / agenda'],['daily','Rutina diaria / morning routine'],['system','Sistema de productividad (GTD, Pomodoro, etc.)'],['project-plan','Plan de proyecto personal'],['habits','Plan de habitos / rutina'],['workflow','Flujo de trabajo optimizado'],['decision','Matriz de decision / priorizacion'],['review','Revision semanal / retrospectiva'],['other-prod','Otro (describir en intencion)']] },
    { id:'df-prodcontext', label:'Tu situacion actual',       type:'textarea', ph:'Ej: "Soy freelance con 5 clientes activos", "Lidero un equipo de 8 personas", "Estudiante con trabajo a medio tiempo"...', rows:2 },
    { id:'df-prodtools',  label:'Herramientas que usas',      type:'input',  ph:'Ej: Notion, Google Calendar, Todoist, Trello, Ninguna...' },
    { id:'df-prodpain',   label:'Tu principal problema de productividad', type:'input',  ph:'Ej: "Procrastino mucho", "No se priorizar", "Tengo demasiadas reuniones"...' },
    { id:'df-prodhours',  label:'Horario productivo disponible', type:'select', opts:[['','-- Selecciona --'],['morning','Manana (6am-12pm)'],['afternoon','Tarde (12pm-6pm)'],['evening','Noche (6pm-12am)'],['flexible','Horario flexible / variable'],['split','Dividido (manana + noche)']] }
  ]
};

/* ============================================================
   ROLES POR DEFECTO PARA CATEGORIA "IMPROVE"
   ============================================================ */
const IMPROVE_DEFAULT_ROLES = {
  'audit-app':    'Auditor de software senior — diagnostica problemas, verifica integridad y funcionalidad sin modificar nada',
  'fix-app':      'Ingeniero de software correctivo — aplica correcciones minimas y verificables, preservando lo que funciona',
  'create-agent': 'Arquitecto de agentes de IA — disena comportamiento, limites, protocolos y personalidad del agente',
  'tutor':        'Tutor experto y paciente — explica conceptos, adapta el lenguaje al nivel del aprendiz, verifica comprension',
  'procedure':    'Guia de procedimientos — instruye paso a paso, verifica cada paso, adapta al ritmo del usuario',
  'other-improve':'Especialista en la tarea descrita — diagnostica, propone y verifica con evidencia'
};

/* ============================================================
   ROLES POR DEFECTO PARA CATEGORIAS "EMAIL", "LEGAL", "PRODUCTIVITY"
   ============================================================ */
const EMAIL_DEFAULT_ROLES = {
  'corporate':   'Redactor de comunicaciones corporativas senior — estructura, claridad y tono profesional impecable',
  'cold':        'Especialista en outreach y prospeccion — redacta emails que generan respuesta sin ser invasivos',
  'followup':    'Estratega de seguimiento comercial — sabe cuando y como insistir sin incomodar',
  'newsletter':  'Editor de newsletters y comunicaciones periodicas — combina informacion util con narrativa atractiva',
  'client':      'Especialista en comunicacion con clientes — claro, empatico y orientado a la relacion a largo plazo',
  'internal':    'Comunicador interno — traduce decisiones complejas en mensajes claros para equipos',
  'apology':     'Redactor diplomatico — maneja situaciones sensibles con tacto, empatia y responsabilidad',
  'proposal':    'Redactor de propuestas comerciales por email — persuasivo sin ser agresivo, estructurado y profesional',
  'other-email': 'Redactor de comunicaciones experto — adapta tono y estructura al tipo de email descrito'
};

const LEGAL_DEFAULT_ROLES = {
  'contract':    'Abogado redactor — elabora borradores contractuales con clausulas estandar, advirtiendo que no constituyen asesoría legal',
  'terms':       'Redactor legal especializado en terminos y condiciones — precision, cobertura y claridad para el usuario final',
  'privacy':     'Especialista en proteccion de datos y privacidad — redacta politicas conforme a marcos regulatorios',
  'nda':         'Abogado corporativo especializado en acuerdos de confidencialidad — clausulas precisas y jurisdiccion clara',
  'sla':         'Redactor de acuerdos de nivel de servicio — metricas, penalidades y escalas de servicio definidas',
  'employment':  'Laboralista — redacta contratos laborales con clausulas conforme a la legislacion aplicable',
  'policy':      'Redactor de politicas corporativas — reglamentos internos claros, ejecutables y compliant',
  'review':      'Auditor legal — revisa documentos existentes identificando riesgos, omisiones y ambiguedades',
  'other-legal': 'Redactor legal especializado — adapta precision terminologica al tipo de documento descrito'
};

const PRODUCTIVITY_DEFAULT_ROLES = {
  'weekly':       'Coach de planificacion semanal — diseña agendas realistas que priorizan impacto sobre urgencia',
  'daily':        'Coach de rutinas — estructura mananas y dias con bloques de enfoque, transiciones y descanso',
  'system':       'Arquitecto de sistemas de productividad — diseña flujos personalizados basados en metodologias probadas',
  'project-plan': 'Planificador de proyectos personales — descompone objetivos en tareas ejecutables con criterios de exito',
  'habits':       'Coach de habitos — diseña rutinas con triggers, acciones y recompensas basadas en ciencia del comportamiento',
  'workflow':     'Ingeniero de flujos de trabajo — elimina friccion, automatiza decisiones y optimiza procesos',
  'decision':     'Estratega de priorizacion — crea matrices y criterios para decidir que hacer, posponer o eliminar',
  'review':       'Facilitador de retrospectivas — estructura revisiones semanales que generan ajustes reales',
  'other-prod':   'Coach de productividad — adapta metodologias y herramientas al contexto descrito'
};


/* ============================================================
   DATOS: HUB DE IAs (ampliado con nuevas categorias)
   ============================================================ */
const AI_LIST = [
  { id:'chatgpt',    name:'ChatGPT',          by:'OpenAI',      desc:'IA conversacional versatil para texto, codigo, analisis y creatividad. Ideal para tareas generales y multiformato.', url:'https://chatgpt.com',                tags:['texto','codigo','busqueda'], recommended:['apps','web','docs','agents','courses','slides','surveys','podcast','videos','copy','narrative','feedback','strategy','automation','seo','translation','email','productivity','improve','other'] },
  { id:'claude',     name:'Claude',           by:'Anthropic',   desc:'IA avanzada para texto largo, analisis profundo, codigo y razonamiento complejo. Destaca en documentos extensos y coherencia de largo recorrido.', url:'https://claude.ai', tags:['texto','codigo'], recommended:['docs','apps','web','courses','agents','research','feedback','strategy','narrative','copy','translation','email','legal','productivity','improve','other'] },
  { id:'gemini',     name:'Gemini',           by:'Google',      desc:'IA multimodal de Google. Procesa texto, imagenes y video. Integrada con el ecosistema Google (Docs, Slides, Drive).', url:'https://gemini.google.com', tags:['texto','busqueda'], recommended:['docs','web','slides','courses','research','seo','email','productivity','other'] },
  { id:'copilot',    name:'Microsoft Copilot',by:'Microsoft',   desc:'Asistente de productividad integrado con Office 365. Ideal para documentos, presentaciones, correos y analisis en Excel.', url:'https://copilot.microsoft.com', tags:['texto','busqueda'], recommended:['docs','slides','surveys','strategy','email','productivity','other'] },
  { id:'perplexity', name:'Perplexity AI',    by:'Perplexity',  desc:'Motor de busqueda con IA que investiga, sintetiza y cita fuentes en tiempo real. Excelente para investigacion y estado del arte.', url:'https://www.perplexity.ai', tags:['busqueda'], recommended:['research','docs','courses','seo','data','legal','other'] },
  { id:'midjourney', name:'Midjourney',       by:'Midjourney',  desc:'Generador de imagenes de alta calidad via Discord. Especializado en arte digital, concept art y fotografia estilizada.', url:'https://www.midjourney.com', tags:['imagen'], recommended:['images'] },
  { id:'dalle',      name:'DALL-E 3',         by:'OpenAI',      desc:'Generador de imagenes integrado en ChatGPT. Convierte descripciones textuales en imagenes realistas o artisticas.', url:'https://chatgpt.com', tags:['imagen'], recommended:['images'] },
  { id:'metaai',     name:'Meta AI',          by:'Meta',        desc:'Asistente de IA de Meta integrado en WhatsApp, Instagram y Facebook. Genera texto e imagenes en contextos sociales.', url:'https://www.meta.ai', tags:['texto','imagen'], recommended:['images','copy','email','other'] },
  { id:'grok',       name:'Grok',             by:'xAI',         desc:'IA de xAI con acceso a datos en tiempo real de X (Twitter). Versatil en texto, codigo y analisis de tendencias actuales.', url:'https://grok.com', tags:['texto','codigo'], recommended:['apps','web','docs','agents','research','email','productivity','improve','other'] },
  { id:'deepseek',   name:'DeepSeek',         by:'DeepSeek',    desc:'IA especializada en codigo, razonamiento logico y analisis de datos. Competitiva en tareas tecnicas y matematicas.', url:'https://chat.deepseek.com', tags:['texto','codigo'], recommended:['apps','web','data','automation','docs','agents','email','improve','other'] },
  { id:'leonardo',   name:'Leonardo AI',      by:'Leonardo',    desc:'Plataforma de generacion de imagenes con control avanzado de estilo, composicion y consistencia de personajes.', url:'https://leonardo.ai', tags:['imagen'], recommended:['images'] },
  { id:'mistral',    name:'Mistral AI',       by:'Mistral',     desc:'IA europea eficiente para texto y codigo. Fuerte en instrucciones de sistema para agentes conversacionales.', url:'https://chat.mistral.ai', tags:['texto','codigo'], recommended:['apps','web','docs','agents','automation','email','legal','improve','other'] },
  { id:'suno',       name:'Suno',             by:'Suno AI',     desc:'Generador de musica con IA. Crea canciones completas a partir de descripcion del genero, mood y letra.', url:'https://suno.com', tags:['audio'], recommended:['podcast','videos','other'] }
];

/* ============================================================
   PLANTILLAS PRECARGADAS
   ============================================================ */
const TEMPLATES = [
  {
    id:'tpl_landing', icon:'🌐', title:'Landing page de captacion',
    cat:'web', desc:'Hero + beneficios + prueba social + CTA + FAQ',
    data:{ cat:'web', role:'Experto en conversion y copywriting UX con experiencia en landing pages de alto rendimiento',
      intention:'Disena y escribe el contenido completo de una landing page de alta conversion para [producto / servicio]. Incluye: hero section con propuesta de valor clara, 3-5 beneficios clave orientados al usuario (no al producto), seccion de prueba social (testimonios o logos), CTA principal y secundario, y seccion de FAQ con las 5 preguntas mas frecuentes.',
      context:'Producto o servicio: [describe brevemente]. Problema que resuelve: [describe el dolor del usuario]. Diferenciador principal: [que hace diferente a la competencia]. Etapa del negocio: [startup / empresa establecida].',
      audience:'[Define tu cliente ideal: perfil, rango de edad, principal dolor o aspiracion, nivel de consciencia del problema]',
      format:'estructura', tone:'persuasivo',
      restrictions:'Sin jerga tecnica. Sin afirmaciones vacias ("el mejor", "unico", "increible") — usa evidencia especifica. Cada seccion debe tener un proposito de conversion claro. No inventes datos ni estadisticas.',
      example:'' }
  },
  {
    id:'tpl_app', icon:'📱', title:'Aplicacion web / movil',
    cat:'apps', desc:'Arquitectura + flujo de usuario + codigo HTML5 premium',
    data:{ cat:'apps', role:'Equipo de agentes: Arquitecto de software + Desarrollador senior + Especialista UX',
      intention:'Disena y construye una aplicacion web premium en un unico archivo HTML5 autocontenido para [describe el proposito de la app]. La app debe ser funcional, visualmente cuidada, responsive y lista para ejecutarse directamente en el navegador.',
      context:'Proposito de la app: [que problema resuelve]. Usuario principal: [quien la usa, nivel tecnico]. Funciones obligatorias: [lista las 3-5 funciones clave]. Funciones que NO necesita: [aclara el alcance].',
      audience:'[Usuarios finales de la app: perfil, contexto de uso, dispositivo principal]',
      format:'codigo', tone:'tecnico',
      restrictions:'Todo codigo debe ser funcional y verificable. Sin frameworks externos salvo que sean absolutamente necesarios y esten justificados. Incluye manejo de errores y validaciones. Propone arquitectura antes de construir.',
      example:'Resultado esperado: archivo .html que se abre en el navegador y funciona sin conexion, con interfaz moderna, navegacion clara y todas las funciones declaradas.' }
  },
  {
    id:'tpl_academic', icon:'📄', title:'Articulo o texto academico',
    cat:'docs', desc:'Estructura rigurosa con fuentes verificables',
    data:{ cat:'docs', role:'Investigador academico senior especializado en [campo de conocimiento], con manejo de normas APA/Chicago y escritura cientifica',
      intention:'Redacta un [articulo / ensayo / capitulo] academico sobre [tema especifico]. Incluye: introduccion con planteamiento del problema y objetivo, desarrollo argumentativo con subtemas, analisis critico de posiciones existentes, y conclusion con implicaciones y lineas de trabajo futuro.',
      context:'Campo de conocimiento: [disciplina]. Enfoque o angulo del texto: [perspectiva particular]. Trabajos clave de referencia: [menciona autores o corrientes si los conoces]. Nivel de publicacion: [tesis / revista indexada / capitulo de libro].',
      audience:'Investigadores, docentes y estudiantes de posgrado en [disciplina]. Nivel de lectura: especializado.',
      format:'texto', tone:'formal',
      restrictions:'Toda afirmacion debe estar respaldada por evidencia verificable. No inventes autores, estudios ni citas — si no tienes la referencia exacta, indícalo y sugiere donde buscarla. Distingue claramente: hecho verificado / opinion / inferencia. Extension aproximada: [indica palabras].',
      example:'' }
  },
  {
    id:'tpl_podcast', icon:'🎙️', title:'Guion de podcast / episodio',
    cat:'podcast', desc:'Guion completo con intro, segmentos, transiciones y outro',
    data:{ cat:'podcast', role:'Productor de contenido de audio y guionista especializado en podcasts de [tipo: educativo / narrativo / conversacional]',
      intention:'Escribe el guion completo de un episodio de podcast sobre [tema del episodio]. Incluye: intro con gancho y presentacion del tema, [N] segmentos claramente delimitados con transiciones naturales, momentos de pausa o reflexion, y outro con resumen + llamado a la accion.',
      context:'Nombre del podcast: [nombre]. Formato: [solo host / dos hosts / entrevista]. Audiencia: [describe quienes escuchan, cuando y donde]. Tono del programa: [cercano / educativo / narrativo]. Episodio numero: [N].',
      audience:'[Describe a tu oyente ideal: quien es, que le interesa, en que contexto escucha el podcast]',
      format:'dialogo', tone:'casual',
      restrictions:'El guion debe sonar natural al hablarse en voz alta — sin oraciones que solo funcionan escritas. Incluye indicaciones de [PAUSA], [ENFASIS] y [MUSICA] donde corresponda. Duracion aproximada: [N] minutos. Sin leer estadisticas frias — convierte los datos en historias.',
      example:'' }
  },
  {
    id:'tpl_slides', icon:'📊', title:'Presentacion de negocio / pitch',
    cat:'slides', desc:'Estructura narrativa para pitch, propuesta o capacitacion',
    data:{ cat:'slides', role:'Experto en comunicacion estrategica y diseno de presentaciones para audiencias ejecutivas',
      intention:'Crea la estructura completa y el contenido de una presentacion de [N] diapositivas para [proposito: pitch de inversion / propuesta comercial / capacitacion interna]. Incluye para cada diapositiva: titulo, contenido clave (maximo 3 puntos), nota del presentador y sugerencia visual.',
      context:'Empresa / proyecto: [nombre y breve descripcion]. Objetivo de la presentacion: [que debe lograr]. Contexto: [donde se presentara, cuanto tiempo tienes]. Mensaje central que NUNCA debe perderse: [el punto mas importante].',
      audience:'[Define la audiencia: cargo, nivel de conocimiento del tema, que les importa de lo que presentas]',
      format:'paso_a_paso', tone:'formal',
      restrictions:'Una idea central por diapositiva. Nada que se lea en voz alta directamente de la slide — el texto es para recordar, no para leer. El orden debe construir un argumento progresivo. Sin relleno decorativo.',
      example:'' }
  },
  {
    id:'tpl_agent', icon:'🤖', title:'Agente conversacional',
    cat:'agents', desc:'Prompt de sistema para chatbot con limites y personalidad definida',
    data:{ cat:'agents', role:'Arquitecto conversacional y especialista en comportamiento de agentes de IA',
      intention:'Crea el prompt de sistema completo para un agente conversacional llamado [nombre del agente] cuya funcion es [describe el proposito principal del agente]. El prompt debe definir identidad, capacidades, limites, tono, y protocolo ante preguntas fuera de scope.',
      context:'Empresa / proyecto que despliega el agente: [nombre]. Plataforma de despliegue: [web / WhatsApp / Slack]. Fuentes de conocimiento del agente: [que sabe con certeza]. Lo que el agente NO debe hacer o decir: [limites criticos].',
      audience:'[Usuarios finales que interactuaran con el agente: perfil, necesidades tipicas, nivel tecnico]',
      format:'estructura', tone:'tecnico',
      restrictions:'El agente NUNCA debe inventar informacion que no tenga en su base de conocimiento. Debe declarar sus limitaciones claramente. Incluye protocolo de escalada a humano para casos que no pueda resolver. La personalidad debe describirse en comportamientos observables, no en adjetivos vagos.',
      example:'Ejemplo de interaccion esperada: Usuario: [pregunta tipica] → Agente: [respuesta modelo]' }
  },
  {
    id:'tpl_course', icon:'🎓', title:'Curso o modulo de e-learning',
    cat:'courses', desc:'Diseno instruccional completo con objetivos, contenido y evaluacion',
    data:{ cat:'courses', role:'Disenador instruccional senior con enfoque en aprendizaje basado en evidencia y pedagogia activa',
      intention:'Disena el contenido completo de un [curso / modulo] sobre [tema] para [nivel del estudiante]. Incluye: objetivos de aprendizaje medibles (verbos de Bloom), estructura de modulos/lecciones, contenido de cada unidad, actividades practicas y criterios de evaluacion.',
      context:'Tema del curso: [nombre]. Conocimiento previo del estudiante: [que ya saben]. Brecha que llena el curso: [que aprenderan que no saben hoy]. Duracion total: [horas o semanas]. Modalidad: [asincronica / sincronica / mixta]. Plataforma: [Moodle / Canvas / otra].',
      audience:'[Define al estudiante ideal: perfil, motivacion para tomar el curso, resistencias o barreras previstas]',
      format:'estructura', tone:'pedagogico',
      restrictions:'Cada modulo debe conectar funcionalmente con el objetivo final del curso — nada es relleno. Las evaluaciones deben verificar que el aprendizaje ocurrio, no solo que el contenido fue consumido. Toda informacion presentada como hecho debe ser verificable y actualizada.',
      example:'' }
  },
  {
    id:'tpl_strategy', icon:'♟️', title:'Plan estrategico o roadmap',
    cat:'strategy', desc:'Analisis de situacion + objetivos + plan de accion accionable',
    data:{ cat:'strategy', role:'Consultor estrategico senior especializado en [tipo de organizacion: startup / PYME / corporacion / ONG]',
      intention:'Desarrolla un plan estrategico para [organizacion / proyecto / area] que incluya: diagnostico de situacion actual (fortalezas, brechas y oportunidades), objetivos estrategicos con indicadores de exito, iniciativas priorizadas por impacto y esfuerzo, y roadmap de implementacion con hitos por trimestre.',
      context:'Organizacion: [nombre y descripcion breve]. Sector: [industria]. Contexto actual: [situation que motiva la necesidad del plan]. Recursos disponibles: [equipo, presupuesto aproximado, tiempo]. Restricciones clave: [lo que no puede cambiarse].',
      audience:'Equipo directivo y lideres de area que implementaran el plan. Nivel de detalle esperado: ejecutivo pero accionable.',
      format:'estructura', tone:'formal',
      restrictions:'Toda recomendacion estrategica debe estar basada en evidencia del contexto, no en buenas intenciones genericas. Declara los supuestos explicitamente. Los objetivos deben ser medibles con criterio de exito claro. Sin estrategias que requieran condiciones que no se han declarado como disponibles.',
      example:'' }
  },
  {
    id:'tpl_research', icon:'🔬', title:'Investigacion y estado del arte',
    cat:'research', desc:'Revision de literatura con tensiones, debates y fuentes primarias',
    data:{ cat:'research', role:'Investigador senior con metodologia de revision sistematica y manejo riguroso de fuentes primarias',
      intention:'Realiza una revision del estado del arte sobre [tema especifico] que incluya: panorama general del campo, principales corrientes o enfoques existentes, tensiones o debates no resueltos entre posiciones, vacios de conocimiento identificados, y sugerencias de fuentes primarias para profundizar.',
      context:'Disciplina: [campo de conocimiento]. Enfoque de la revision: [que aspecto especifico del tema interesa]. Uso previsto: [tesis / articulo / informe / decision practica]. Horizonte temporal relevante: [desde que ano es pertinente la informacion].',
      audience:'Investigadores, estudiantes de posgrado o profesionales que necesitan base teorica solida para su trabajo.',
      format:'texto', tone:'formal',
      restrictions:'No inventes fuentes, autores, estudios ni citas — si no puedes verificar una referencia, indícalo explicitamente y sugiere donde buscarla. Distingue entre conocimiento establecido y lo que sigue en debate activo. Indica tu nivel de confianza cuando presentes datos especificos.',
      example:'' }
  },
  {
    id:'tpl_copy', icon:'✍️', title:'Copy de marketing o campana',
    cat:'copy', desc:'Texto persuasivo orientado a conversion con CTA claro',
    data:{ cat:'copy', role:'Copywriter senior especializado en conversion y estrategia de contenido de marca',
      intention:'Escribe el copy completo para [tipo de pieza: anuncio / email / landing / post de redes / propuesta] que comunique [propuesta de valor principal] y lleve al lector a [accion deseada: comprar / registrarse / agendar / descargar].',
      context:'Marca / empresa: [nombre]. Producto o servicio: [descripcion breve]. Diferenciador clave: [por que elegirte sobre la competencia]. Canal de publicacion: [plataforma especifica]. Contexto de la campana: [lanzamiento / reactivacion / temporada especial].',
      audience:'[Define con precision: quien es, cual es su principal problema o deseo, que sabe sobre tu producto, que objecion tipica tiene]',
      format:'texto', tone:'persuasivo',
      restrictions:'Sin afirmaciones vacias ("el mejor", "unico", "increible") — usa evidencia especifica y verificable. El titular debe funcionar en 3 segundos de atencion. El CTA debe ser especifico: no "Mas informacion" sino "Agenda tu demo gratuita". No inventes cifras ni testimonios.',
      example:'' }
  },
  {
    id:'tpl_data', icon:'📈', title:'Analisis de datos e interpretacion',
    cat:'data', desc:'Metodologia de analisis + interpretacion + visualizacion recomendada',
    data:{ cat:'data', role:'Analista de datos senior con enfoque en comunicacion de resultados para audiencias no tecnicas',
      intention:'Analiza los siguientes datos [describe o adjunta los datos] y produce: descripcion del conjunto de datos, hallazgos principales ordenados por importancia, interpretacion de lo que significan en el contexto del negocio / proyecto, limitaciones del analisis y recomendaciones accionables basadas en los datos.',
      context:'Origen de los datos: [fuente]. Periodo de tiempo: [rango]. Pregunta de negocio que quiero responder: [la pregunta especifica]. Decisiones que se tomaran con este analisis: [que se decidira en base a los resultados].',
      audience:'[Define quien recibira el analisis: gerentes / equipo tecnico / inversionistas. Su nivel de conocimiento estadistico y lo que les importa]',
      format:'tabla', tone:'tecnico',
      restrictions:'Declara los supuestos del analisis antes de los resultados. Distingue correlacion de causalidad — nunca afirmes causalidad sin evidencia. Indica el nivel de confianza de las conclusiones. Si los datos tienen sesgos conocidos, mencionarlos es obligatorio.',
      example:'' }
  },
  {
    id:'tpl_feedback', icon:'🔍', title:'Evaluacion y retroalimentacion rigurosa',
    cat:'feedback', desc:'Auditoria critica con hallazgos priorizados y sugerencias accionables',
    data:{ cat:'feedback', role:'Revisor experto y evaluador critico con criterio especializado en [tipo de entregable: texto / codigo / diseno / estrategia]',
      intention:'Realiza una evaluacion rigurosa y completa de [el entregable adjunto o descrito]. Incluye: resumen ejecutivo del estado actual, fortalezas que deben preservarse, brechas criticas ordenadas por impacto, sugerencias especificas y accionables para cada brecha, y un dictamen final con recomendacion de siguiente paso.',
      context:'Tipo de entregable: [que es exactamente lo que se evalua]. Proposito original del entregable: [para que fue creado]. Estandar de comparacion: [a que nivel de calidad se aspira]. Etapa del proceso: [borrador / version final / post-entrega].',
      audience:'El autor o equipo responsable del entregable, que usara el feedback para mejorar su trabajo.',
      format:'estructura', tone:'directo',
      restrictions:'El feedback debe ser accionable: no "esto esta mal" sino "cambia X por Y porque Z". Ordena por prioridad de impacto, no por orden de aparicion. Basa las sugerencias en criterios claros, no en preferencias subjetivas. El tono debe orientar a la mejora, no desanimar.',
      example:'' }
  },
  {
    id:'tpl_audit', icon:'🛡️', title:'Auditoria de aplicacion o sistema',
    cat:'improve', desc:'Diagnostico completo sin modificar — identifica problemas y riesgos',
    data:{ cat:'improve', role:'Auditor de software senior — diagnostica problemas, verifica integridad y funcionalidad sin modificar nada',
      intention:'Realiza una auditoria completa de [nombre de la app o sistema] sin modificar nada. Incluye: diagnostico del estado actual (que funciona, que no, que es fragil), lista de problemas ordenados por severidad (critico / alto / medio / bajo), riesgos identificados, dependencias o puntos unicos de fallo, y recomendaciones priorizadas de intervencion.',
      context:'Aplicacion o sistema: [nombre y proposito]. Stack tecnologico: [lenguaje, framework, base de datos, infraestructura]. Problema conocido o motivo de la auditoria: [que te hizo pedir esta auditoria]. Lo que SI funciona y no debe tocarse: [funciones criticas que estan bien].',
      audience:'Equipo de desarrollo o decision maker que necesitara decidir que corregir primero.',
      format:'estructura', tone:'tecnico',
      restrictions:'Principio: primero no danes. No propongas cambios — solo diagnostica. No inventes problemas que no existen. Cada hallazgo debe estar basado en evidencia observable. Si no tienes certeza sobre un hallazgo, indicalo explicitamente. Verifica que lo que dices que funciona realmente funciona.',
      example:'Formato de hallazgo: [HALLAZGO #N] Severidad: [Critico/Alto/Medio/Bajo] — Descripcion: [que pasa] — Evidencia: [como se detecta] — Impacto: [que pasa si no se corrige]' }
  },
  {
    id:'tpl_fixapp', icon:'🔧', title:'Corregir o mejorar una aplicacion',
    cat:'improve', desc:'Correcciones minimas y verificables que preservan lo que funciona',
    data:{ cat:'improve', role:'Ingeniero de software correctivo — aplica correcciones minimas y verificables, preservando lo que funciona',
      intention:'Corrige y mejora [nombre de la app o sistema] siguiendo el principio de minima intervencion. Para cada correccion: 1) Diagnostica el problema real, 2) Propone la correccion mas pequena posible, 3) Explica que podria romperse al aplicar la correccion, 4) Indica como verificar que la correccion funciona y que lo anterior sigue funcionando.',
      context:'Aplicacion: [nombre y proposito]. Stack: [tecnologias usadas]. Problema a corregir o mejora deseada: [describe con precision]. Lo que actualmente funciona bien y NO debe romperse: [lista las funciones criticas que estan bien]. Alcance de la correccion: [solo este problema / toda la app].',
      audience:'Desarrollador que implementara las correcciones. Nivel tecnico: [junior / senior / experto].',
      format:'paso_a_paso', tone:'tecnico',
      restrictions:'Principio rector: primero no danes. Cada correccion debe ser la minima posible para resolver el problema. Si cambias algo, explica por que y que podria romperse. Despues de cada correccion, verifica regresion: lo que funcionaba antes sigue funcionando. No corrijas lo que no esta roto. No inventes problemas.',
      example:'Formato de correccion: [CORRECCION #N] Problema: [que falla] — Causa raiz: [por que falla] — Cambio propuesto: [que exactamente modificar] — Riesgo de regresion: [que podria romperse] — Verificacion: [como confirmar que funciona y que lo anterior sigue funcionando]' }
  },
  {
    id:'tpl_createagent', icon:'🤖', title:'Crear un agente de IA',
    cat:'improve', desc:'Arquitectura completa: identidad, capacidades, limites y protocolos',
    data:{ cat:'improve', role:'Arquitecto de agentes de IA — disena comportamiento, limites, protocolos y personalidad del agente',
      intention:'Disena un agente de IA completo llamado [nombre del agente] cuyo proposito es [describe la funcion principal]. Incluye: identidad y personalidad definida en comportamientos observables, scope de conocimiento (que sabe con certeza y que no), limites explicitos (que no debe hacer ni decir), protocolo de escalada (que hace cuando no sabe), tono y estilo de comunicacion, y ejemplos de interaccion tipica.',
      context:'Empresa o proyecto: [nombre]. Plataforma de despliegue: [web / WhatsApp / Slack / Telegram / API propia]. Fuentes de conocimiento del agente: [que informacion tiene acceso]. Tipo de usuarios: [quienes interactuaran con el agente]. Nivel de autonomia: [solo informar / ejecutar acciones / derivar a humano].',
      audience:'Equipo de desarrollo que implementara el agente y usuarios finales que interactuaran con el.',
      format:'estructura', tone:'tecnico',
      restrictions:'El agente NUNCA debe inventar informacion fuera de su scope. Debe declarar sus limitaciones abiertamente. La personalidad debe definirse en comportamientos observables (como responde, no adjetivos vagos). Incluye protocolo de escalada explicito. Define que hace cuando recibe preguntas fuera de scope, ofensivas o ambiguas.',
      example:'Ejemplo de definicion de comportamiento: "Cuando el usuario pregunte por [X], el agente responde con [Y] usando tono [Z]. Si el usuario pregunta por algo fuera del scope, el agente dice: [texto exacto] y ofrece [accion de escalada]."' }
  },
  {
    id:'tpl_tutor', icon:'👨‍🏫', title:'Tutor / Guia de procedimiento',
    cat:'improve', desc:'Instruye paso a paso, adapta al nivel y verifica comprension',
    data:{ cat:'improve', role:'Tutor experto y paciente — explica conceptos, adapta el lenguaje al nivel del aprendiz, verifica comprension',
      intention:'Actua como tutor y guia para ensenar [procedimiento / concepto / habilidad] a un [nivel del aprendiz: principiante / intermedio / avanzado]. Estructura la ensenanza en pasos progresivos, explica el por que de cada paso (no solo el como), incluye puntos de verificacion de comprension, y anticipa los errores mas comunes del aprendiz con soluciones.',
      context:'Tema a ensenar: [procedimiento, concepto o habilidad especifica]. Conocimiento previo del aprendiz: [que ya sabe, que no sabe]. Motivacion del aprendiz: [por que necesita aprender esto]. Tiempo disponible: [estimado]. Herramientas o entorno: [en que contexto se aplica lo aprendido].',
      audience:'[Nivel del aprendiz: principiante total / alguien con bases / alguien que busca perfeccionar]. Contexto de uso: [trabajo / estudio / proyecto personal].',
      format:'paso_a_paso', tone:'pedagogico',
      restrictions:'Adapta el lenguaje al nivel del aprendiz — si es principiante, define cada termino tecnico la primera vez que lo uses. Explica el POR QUE de cada paso, no solo el COMO. No asumas que el aprendiz ya sabe algo que no has ensenado. Si algo puede confundir, anticipe y aclaralo. Incluye puntos de verificacion: "Si llegaste hasta aqui y [condicion], vas bien. Si no, [que hacer]". No inventes atajos que no sean verificables.',
      example:'Formato de paso: [PASO N] Que hacer: [accion] — Por que: [razon pedagogica] — Verificacion: [como saber si lo hiciste bien] — Error comun: [que suele salir mal y como corregirlo]' }
  },
  {
    id:'tpl_image', icon:'🎨', title:'Prompt para generacion de imagenes',
    cat:'images', desc:'Prompt visual completo con estilo, composicion y exclusiones',
    data:{ cat:'images', role:'Director de Arte y especialista en prompts visuales para generacion de imagenes por IA',
      intention:'Crea un prompt detallado para generar una imagen de [describe el sujeto o escena principal]. Incluye: descripcion del sujeto/escena con detalles especificos y observables, estilo artistico con referencia concreta, composicion (angulo, plano, iluminacion), paleta de colores y atmosfera emocional, y lista explicita de lo que debe EVITAR en la imagen.',
      context:'Uso de la imagen: [redes sociales / portada / ilustracion de articulo / concepto de diseno / otro]. Plataforma de generacion: [Midjourney / DALL-E / Stable Diffusion / otro]. Restricciones de la plataforma: [ratio, resolucion, limites de contenido]. Referencia visual si existe: [describe o enlaza].',
      audience:'La IA generadora de imagenes — el prompt debe ser tecnico, preciso y sin ambiguedades.',
      format:'texto', tone:'tecnico',
      restrictions:'Usa vocabulario tecnico de generacion: plano (close-up, wide, bird-eye), iluminacion (golden hour, studio, backlit), composicion (rule of thirds, centered, symmetry). No uses adjetivos vagos ("bonito", "genial"). Especifica con igual precision lo que DEBE incluir y lo que debe EVITAR. Si mencionas un artista, asegurate de que sea reconocible y verificable.',
      example:'Ejemplo de estructura: [SUJETO] + [ACCION/POSE] + [ENTORNO] + [ESTILO] + [ILUMINACION] + [COLOR] + [EVITAR]' }
  },
  {
    id:'tpl_video', icon:'🎬', title:'Guion de video con estructura narrativa',
    cat:'videos', desc:'Hook, desarrollo, climax y CTA para video de YouTube o redes',
    data:{ cat:'videos', role:'Guionista de video y director creativo especializado en contenido digital',
      intention:'Escribe el guion completo para un video de [duracion] sobre [tema del video]. Estructura: hook de apertura (primeros 5 segundos que capturan atencion), introduccion del tema, desarrollo en [N] secciones con transiciones, climax o momento clave, y cierre con CTA. Incluye indicaciones visuales para cada segmento (que se ve mientras se escucha).',
      context:'Plataforma: [YouTube / TikTok / Instagram Reels / LinkedIn / uso interno]. Tipo de video: [tutorial / vlog / review / promo / documental]. Tono del canal: [educativo / entretenido / profesional / casual]. Audiencia tipica: [quienes ven tus videos]. Objetivo del video: [suscriptores / ventas / educar / marca personal].',
      audience:'[Define tu espectador ideal: edad, intereses, nivel de conocimiento del tema, porque te ve a ti y no a otro]',
      format:'dialogo', tone:'casual',
      restrictions:'El hook debe funcionar en 3 segundos o menos. Cada segmento debe conectar con el siguiente — sin saltos abruptos. El CTA debe ser natural, no forzado. Evita lecturas de datos frios — convierte numeros en historias o analogias. Incluye indicaciones [VISUAL] para cada segmento.',
      example:'Formato de segmento: [SEGUNDO 0-5] HOOK: [texto] — [VISUAL: primer plano de...] | [SEGUNDO 5-30] INTRO: [texto] — [VISUAL: plano medio con...]' }
  },
  {
    id:'tpl_survey', icon:'📋', title:'Diseno de encuesta metodologica',
    cat:'surveys', desc:'Preguntas sin sesgo con escalas y analisis previsto',
    data:{ cat:'surveys', role:'Metodologo de encuestas y estadistico especializado en diseno de instrumentos de recoleccion de datos',
      intention:'Disena una encuesta completa para [objetivo de la encuesta: medir satisfaccion / evaluar conocimiento / segmentar audiencia / otro]. Incluye: pregunta filtro, preguntas principales (maximo 15), pregunta de cierre abierta, tipo de escala para cada pregunta, y plan de analisis previsto (que se hara con cada respuesta).',
      context:'Decision que se tomara con los datos: [que se decidira en base a los resultados]. Poblacion objetivo: [quienes responderan]. Tamano de muestra estimado: [N personas]. Plataforma de despliegue: [Google Forms / Typeform / propio]. Tiempo maximo por encuestado: [minutos].',
      audience:'[Los encuestados: su nivel de atencion, disposicion y contexto en que responderan]',
      format:'estructura', tone:'formal',
      restrictions:'Cada pregunta mide UNA sola variable. Sin preguntas dobles, ambiguas o con sesgo de confirmacion. Ordena de menos a mas sensible. Ninguna pregunta obligatoria que no sea estrictamente necesaria. Evita escalas con punto medio forzado si no es justificado. Incluye opcion "No sabe / No responde" donde aplique.',
      example:'Formato de pregunta: [P#] Pregunta: [texto] — Tipo: [Likert 1-5 / Multiple / Abierta] — Analisis: [que se hara con esta respuesta] — Nota: [porque esta pregunta y no otra]' }
  },
  {
    id:'tpl_narrative', icon:'📖', title:'Narrativa creativa / cuento',
    cat:'narrative', desc:'Historia con voz consistente, tension y mundo coherente',
    data:{ cat:'narrative', role:'Narrador creativo y editor literario con experiencia en [genero: fantasia / ciencia ficcion / thriller / romance / horror / ficcion literaria]',
      intention:'Escribe [un cuento / una escena / un capitulo] de [extension aproximada] sobre [premisa o concepto central]. Desarrolla: personajes con motivaciones claras, conflicto central con tension progresiva, mundo o contexto coherente internamente, y un cierre que resuelva o transforme el conflicto de forma significativa.',
      context:'Genero: [fantasia / ciencia ficcion / thriller / romance / horror / historico / literario]. Punto de vista: [primera persona / tercera limitada / tercera omnisciente]. Tono: [oscuro / luminoso / ironico / poetico / crudo]. Referencias: [autores o obras con estilo similar al que buscas]. Extension: [corto / medio / largo].',
      audience:'Lectores de [genero] que buscan [que experiencia de lectura: escape, reflexion, suspenso, emocion].',
      format:'texto', tone:'creativo',
      restrictions:'La voz narrativa debe ser consistente de principio a fin. Muestra con acciones y detalles sensoriales, no digas con adjetivos abstractos. Cada escena debe avanzar trama, personaje o mundo — nada es relleno. La coherencia interna es obligatoria: nada ocurre sin causa dentro del mundo. Si hay dialogo, que cada personaje suene distinto.',
      example:'' }
  },
  {
    id:'tpl_automation', icon:'⚡', title:'Script de automatizacion',
    cat:'automation', desc:'Pipeline con trigger, logica, manejo de errores y logging',
    data:{ cat:'automation', role:'Ingeniero de automatizacion y desarrollador de scripts con experiencia en pipelines robustos',
      intention:'Crea un script de automatizacion en [lenguaje/plataforma] que [describe el proceso a automatizar]. Incluye: disparador (que inicia el proceso), logica paso a paso con validaciones, manejo de errores para cada punto de fallo, logging basico para diagnostico, y documentacion de como ejecutarlo por primera vez.',
      context:'Plataforma/entorno: [Python / Node.js / Bash / Zapier / n8n / Power Automate]. Trigger: [que activa el proceso]. Input: [de donde vienen los datos]. Output: [que produce el proceso]. Frecuencia: [una vez / diario / por evento]. Restricciones: [sin acceso root / sin API de pago / limites de la plataforma].',
      audience:'[Quien ejecutara o modificara el script: desarrollador / persona no tecnica / equipo de operaciones]',
      format:'codigo', tone:'tecnico',
      restrictions:'Todo codigo debe ser funcional y verificable — no pseudocodigo. Incluye manejo de errores en cada punto de fallo. No uses librerias sin verificar que existen y estan activas. Incluye logging basico (minimo: inicio, fin y errores). El script debe ser reproducible: primera ejecucion sin pasos ocultos. Si algo falla, define que pasa: silencioso, alerta o reintento.',
      example:'Estructura esperada: 1) Docstring con descripcion, requisitos y uso. 2) Imports y configuracion. 3) Funciones con docstrings. 4) Logica principal con try/catch. 5) Bloque if __name__ / entry point.' }
  },
  {
    id:'tpl_seo', icon:'🔍', title:'Contenido SEO optimizado',
    cat:'seo', desc:'Articulo posicionable con keyword, estructura H1-H3 y meta tags',
    data:{ cat:'seo', role:'Especialista SEO y redactor web con experiencia en contenido que posiciona organicamente',
      intention:'Escribe un [articulo / ficha de producto / contenido pilar] optimizado para SEO con keyword objetivo "[keyword]". Incluye: meta title (maximo 60 caracteres), meta description (maximo 160 caracteres), estructura H1/H2/H3 jerarquica, contenido que responda genuinamente a la intencion de busqueda, y llamados a la accion naturales.',
      context:'Keyword objetivo: [frase exacta]. Intencion de busqueda: [informativa / comercial / transaccional / navegacional]. Competidores en SERP: [quienes posicionan hoy]. Tipo de contenido: [articulo de blog / guia completa / ficha de producto / landing]. Extension objetivo: [palabras].',
      audience:'[El buscador: Google. Y el lector: quien busca esta keyword y que necesita encontrar]',
      format:'markdown', tone:'directo',
      restrictions:'El contenido debe responder genuinamente a la intencion de busqueda, no solo incluir keywords. La keyword debe aparecer de forma natural, no forzada. Incluye variaciones semanticas (LSI keywords) sin keyword stuffing. Meta title hasta 60 caracteres. Meta description hasta 160 caracteres. Cada H2 debe cubrir un subtema distinto. El contenido debe aportar valor real que justifique el posicionamiento.',
      example:'Formato: META TITLE: [...] — META DESCRIPTION: [...] — H1: [...] — H2: [subtema 1] — H2: [subtema 2] — ...' }
  },
  {
    id:'tpl_translation', icon:'🌐', title:'Proyecto de traduccion y localizacion',
    cat:'translation', desc:'Traduccion con adaptacion cultural y revision de registro',
    data:{ cat:'translation', role:'Traductor profesional y localizador cultural especializado en [par de idiomas: origen → destino]',
      intention:'Traduce el siguiente contenido de [idioma origen] a [idioma destino] con [tipo de adaptacion: literal / adaptada / localizada / transcreada]. Adapta referencias culturales, unidades de medida, modismos y formato al contexto del idioma destino. Mantiene la voz y tono del original en el registro equivalente.',
      context:'Idioma origen: [idioma y variante]. Idioma destino: [idioma y variante regional]. Dominio: [general / legal / medico / tecnico / marketing / literario]. Audiencia destino: [quienes leen el texto traducido]. Uso del texto: [web / impresion / app / documento legal / material de marketing].',
      audience:'[Hablantes nativos del idioma destino que no deben notar que es una traduccion]',
      format:'texto', tone:'formal',
      restrictions:'La prioridad es la naturalidad en el idioma destino, no la literalidad. Adapta referencias culturales, unidades de medida y convenciones de formato. Si un termino no tiene equivalente directo, usa transliteracion con explicacion entre parentesis la primera vez. Verifica que modismos y expresiones idiomaticas sean naturales en la cultura de destino. Si hay ambiguedad en el original, indicalo con nota al traductor entre [corchetes].',
      example:'Formato: [Parrafo traducido] — Nota: [si aplica, explicacion de decision de traduccion]' }
  },
  {
    id:'tpl_email_corporate', icon:'📧', title:'Email corporativo / formal',
    cat:'email', desc:'Comunicacion profesional con asunto, estructura y cierre accionable',
    data:{ cat:'email', role:'Redactor de comunicaciones corporativas senior — estructura, claridad y tono profesional impecable',
      intention:'Redacta un email [formal / semiformal] para [destinatario: su rol] con el objetivo de [que quieres lograr con este email]. Incluye: linea de asunto clara y orientada a la accion, saludo apropiado para la relacion, cuerpo del mensaje con punto principal primero, contexto necesario y llamado a la accion explicito, y cierre profesional con proximo paso.',
      context:'Remitente: [tu rol/posicion]. Destinatario: [su rol/posicion y relacion contigo]. Motivo del email: [por que escribes ahora]. Contexto previo: [si hay historial relevante]. Urgencia: [inmediata / esta semana / informativo].',
      audience:'[El destinatario: su nivel de conocimiento del tema, su disponibilidad de tiempo, su relacion contigo]',
      format:'texto', tone:'formal',
      restrictions:'Un solo objetivo por email. El asunto debe comunicar la accion esperada, no solo el tema. El punto principal va en el primer parrafo. Sin jerga interna que el destinatario no conozca. Sin adjetivos innecesarios ni rodeos. El cierre debe incluir que pasa despues (proximo paso, fecha limite, o confirmacion esperada).',
      example:'Estructura: ASUNTO: [accion + tema] — SALUDO — PUNTO PRINCIPAL (1-2 lineas) — CONTEXTO — CTA — CIERRE' }
  },
  {
    id:'tpl_email_cold', icon:'🤝', title:'Cold email / prospeccion',
    cat:'email', desc:'Email de primer contacto que genera respuesta sin ser invasivo',
    data:{ cat:'email', role:'Especialista en outreach y prospeccion — redacta emails que generan respuesta sin ser invasivos',
      intention:'Escribe un cold email para contactar a [tipo de prospecto: CEO / gerente / director / decision maker] de [sector/empresa tipo] ofreciendo [que: servicio / producto / reunion / colaboracion]. El email debe capturar atencion en el asunto, demostrar conocimiento del prospecto en la primera linea, comunicar valor concreto, y cerrar con una peticion simple y de baja friccion.',
      context:'Tu empresa/producto: [que haces y para quien]. Prospecto objetivo: [sector, tamano de empresa, cargo]. Valor que ofreces: [que problema resuelves y con que resultado]. Diferenciador: [por que tu y no otro]. Evidencia: [casos de exito, metricas o testimonios reales].',
      audience:'[El prospecto: probablemente no te conoce, recibe muchos emails similares, y decide en 5 segundos si sigue leyendo]',
      format:'texto', tone:'semiformal',
      restrictions:'Maximo 120 palabras en el cuerpo. El asunto no debe parecer spam (sin MAYUSCULAS, sin "gratis", sin "oportunidad unica"). Demuestra que investigaste al prospecto (mencion algo especifico de su empresa o trabajo). No vendas en el primer email — busca una conversacion. El CTA debe ser simple: una pregunta, no una peticion de 30 minutos. Sin adjuntos ni links en el primer contacto.',
      example:'Estructura: ASUNTO: [especifico y relevante para el prospecto] — REFERENCIA PERSONALIZADA (1 linea) — PROBLEMA QUE RESUELVES (1-2 lineas) — VALOR CONCRETO (1-2 lineas) — CTA SIMPLE (1 linea)' }
  },
  {
    id:'tpl_legal_contract', icon:'⚖️', title:'Borrador de contrato o acuerdo',
    cat:'legal', desc:'Borrador contractual con clausulas, jurisdiccion y disclaimer',
    data:{ cat:'legal', role:'Abogado redactor — elabora borradores contractuales con clausulas estandar, advirtiendo que no constituyen asesoría legal',
      intention:'Elabora un borrador de [tipo de contrato: prestacion de servicios / compra-venta / colaboracion / NDA / licencia / otro] entre [Parte A] y [Parte B]. Incluye: objeto del contrato, obligaciones de cada parte, plazo y forma de pago, clausulas de confidencialidad si aplica, penalidades por incumplimiento, causales de terminacion, jurisdiccion y ley aplicable, y espacio para firmas.',
      context:'Partes: [quien es cada parte y su rol]. Objeto del contrato: [que se acuerda]. Jurisdiccion: [pais, estado/region]. Monto: [si aplica]. Plazo: [duracion]. Aspectos criticos: [que debe cubrir si o si]. Preocupaciones: [riesgos o puntos sensibles].',
      audience:'[Las partes que firmaran y sus abogados revisores]',
      format:'estructura', tone:'formal',
      restrictions:'IMPORTANTE: Incluir al inicio el disclaimer: "Este documento es un borrador generado por IA y NO constituye asesoría legal. Consulte siempre con un abogado licenciado antes de firmar o ejecutar cualquier documento legal." No inventes leyes, articulos ni codigos. Usa terminologia juridica precisa. Toda clausula debe tener un proposito claro y verificable. Especifica la jurisdiccion aplicable. Si no conoces la norma exacta, indicalo explicitamente.',
      example:'Estructura: DISCLAIMER — TITULO — FECHA Y LUGAR — PARTES — ANTECEDENTES — CLAUSULAS — JURISDICCION — FIRMAS' }
  },
  {
    id:'tpl_productivity', icon:'📅', title:'Sistema de productividad personal',
    cat:'productivity', desc:'Plan semanal con priorizacion, bloques de tiempo y habitos',
    data:{ cat:'productivity', role:'Coach de productividad y planificador personal — diseña sistemas ejecutables basados en metodologias probadas',
      intention:'Crea un sistema de productividad personalizado para [tu situacion: freelance / empleado / estudiante / lider de equipo]. Incluye: metodo de priorizacion (que haces primero cada dia), estructura de la semana (bloques de tiempo por tipo de tarea), rutina diaria con triggers y transiciones, sistema de revision semanal, y metricas para verificar que el sistema funciona.',
      context:'Tu rol: [a que te dedicas]. Tu principal problema: [procrastinacion / falta de prioridad / exceso de reuniones / contexto / otro]. Herramientas disponibles: [Notion / Calendar / Todoist / papel / ninguna]. Horario productivo: [manana / tarde / noche / flexible]. Numero de proyectos activos: [N]. Compromisos fijos: [reuniones, clases, horarios].',
      audience:'Tu mismo — el sistema debe ser ejecutable desde manana sin curva de aprendizaje compleja.',
      format:'paso_a_paso', tone:'directo',
      restrictions:'El sistema debe ser ejecutable, no teorico. Si no se puede implementar manana, no es util. Adapta al contexto real: si no tienes Notion, propon papel. Prioriza por impacto, no por urgencia aparente. Verifica que el sistema no genere mas overhead que el problema que resuelve. Si propones un habito, incluye trigger + accion + recompensa. Sin generalidades: todo debe ser especifico y accionable.',
      example:'Formato: [LUNES] Bloque 8-10am: [tipo de tarea] — Trigger: [que inicia] — Criterio: [como saber que esta hecho] — Revision viernes: [que verificar]' }
  }
];

/* ============================================================
   RENDER DE PLANTILLAS
   ============================================================ */
function renderTemplates() {
  const grid = document.getElementById('tpl-grid');
  if (!grid) return;
  grid.innerHTML = TEMPLATES.map(t =>
    '<div class="tpl-card" onclick="loadTemplate(\'' + t.id + '\')">' +
      '<div class="tpl-icon">' + t.icon + '</div>' +
      '<div class="tpl-body">' +
        '<div class="tpl-cat">' + (CATEGORIES[t.cat] || t.cat) + '</div>' +
        '<div class="tpl-title">' + t.title + '</div>' +
        '<div class="tpl-desc">' + t.desc + '</div>' +
      '</div>' +
      '<button class="btn btn-sm tpl-btn" onclick="event.stopPropagation();loadTemplate(\'' + t.id + '\')">Usar plantilla</button>' +
    '</div>'
  ).join('');
}

function loadTemplate(id) {
  const tpl = TEMPLATES.find(t => t.id === id);
  if (!tpl) return;
  loadFormData(tpl.data);
  switchPanel('crear');
  window.scrollTo({ top:0, behavior:'smooth' });
  showToast('Plantilla cargada: ' + tpl.title + ' — personaliza los [corchetes]', 'success');
}

function switchLibTab(tab) {
  const myTab  = document.getElementById('libtab-mine');
  const tplTab = document.getElementById('libtab-tpl');
  const myPane  = document.getElementById('libpane-mine');
  const tplPane = document.getElementById('libpane-tpl');
  if (tab === 'mine') {
    myTab.classList.add('active'); tplTab.classList.remove('active');
    myPane.style.display = ''; tplPane.style.display = 'none';
  } else {
    tplTab.classList.add('active'); myTab.classList.remove('active');
    tplPane.style.display = ''; myPane.style.display = 'none';
    renderTemplates();
  }
}

/* ============================================================
   NAVEGACION
   ============================================================ */
function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelector('[data-panel="' + id + '"]').classList.add('active');
  if (id === 'biblioteca') renderLibrary();
  if (id === 'hub') renderHub();
  if (window.innerWidth <= 768) toggleSidebar(false);
}
function toggleSidebar(force) {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('overlay');
  const isOpen = force !== undefined ? force : !sb.classList.contains('open');
  sb.classList.toggle('open', isOpen);
  ov.classList.toggle('show', isOpen);
}

/* ============================================================
   TEMA
   ============================================================ */
function toggleTheme() { currentTheme = currentTheme === 'light' ? 'dark' : 'light'; applyTheme(); }
function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const btn = document.getElementById('theme-toggle');
  btn.classList.toggle('on', currentTheme === 'dark');
  btn.setAttribute('aria-checked', currentTheme === 'dark');
  localStorage.setItem('pf_theme', currentTheme);
}

/* ============================================================
   CAMPOS DINAMICOS — mostrar / ocultar segun categoria
   ============================================================ */
let _currentDynCat = null; // Tracks rendered category to avoid re-generating on every keystroke

function showDynamicFields(cat) {
  const container = document.getElementById('dynamic-fields-container');
  const body      = document.getElementById('dynamic-fields-body');
  const fields    = DYNAMIC_FIELDS[cat];

  if (!fields || fields.length === 0) {
    if (_currentDynCat !== cat) {
      container.style.display = 'none';
      body.innerHTML = '';
      _currentDynCat = cat;
    }
    return;
  }

  // CRITICAL: only rebuild HTML when category actually changes
  // If same category, the user is interacting with existing fields → do NOT regenerate
  if (_currentDynCat === cat) return;
  _currentDynCat = cat;

  container.style.display = 'block';
  body.innerHTML = fields.map(f => {
    const label = '<label class="field-label df-label" for="' + f.id + '">' + f.label + '</label>';
    let input = '';
    if (f.type === 'select') {
      // For categories with auto-fill role on sub-type change
      const autofillCats = {
        'improve': 'df-imptype',
        'email': 'df-emailtype',
        'legal': 'df-legaltype',
        'productivity': 'df-prodtype'
      };
      const autoFillField = autofillCats[cat];
      const extraOnchange = (autoFillField && f.id === autoFillField) ? 'onchange="onAutoFillRole(\'' + cat + '\',this.value);updateScore()"' : 'onchange="updateScore()"';
      input = '<select id="' + f.id + '" class="df-input" ' + extraOnchange + '>' +
        f.opts.map(o => '<option value="' + o[0] + '">' + o[1] + '</option>').join('') +
        '</select>';
    } else if (f.type === 'textarea') {
      input = '<textarea id="' + f.id + '" class="df-input" rows="' + (f.rows || 2) + '" placeholder="' + (f.ph||'') + '" oninput="updateScore()"></textarea>';
    } else {
      input = '<input id="' + f.id + '" class="df-input" type="text" placeholder="' + (f.ph||'') + '" oninput="updateScore()">';
    }
    return '<div class="field-group df-group">' + label + input + '</div>';
  }).join('');
}

/* Auto-fill Rol de la IA when sub-type changes (unified handler) */
function onAutoFillRole(cat, val) {
  const roleMap = {
    improve: IMPROVE_DEFAULT_ROLES,
    email: EMAIL_DEFAULT_ROLES,
    legal: LEGAL_DEFAULT_ROLES,
    productivity: PRODUCTIVITY_DEFAULT_ROLES
  };
  const map = roleMap[cat];
  if (!val || !map || !map[val]) return;
  const roleField = document.getElementById('f-role');
  if (roleField && !roleField.value.trim()) {
    roleField.value = map[val];
    roleField.dispatchEvent(new Event('input'));
  }
}

/* Legacy alias — kept for backward compat with any saved prompts */
function onImproveTypeChange(val) { onAutoFillRole('improve', val); }

function getDynamicData() {
  const cat    = document.getElementById('f-cat').value;
  const fields = DYNAMIC_FIELDS[cat] || [];
  const result = {};
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) result[f.id] = el.value.trim();
  });
  return result;
}

function getDynamicFilledCount() {
  const data = getDynamicData();
  return Object.values(data).filter(v => v && v !== '').length;
}

/* ============================================================
   MOTOR HEURISTICO (score 0-100)
   ============================================================ */
function analyzePrompt() {
  const d = getFormData();
  let score = 0;
  let suggestions = [];

  // Rol (13 pts)
  if (d.role && d.role.trim().length > 5) {
    score += 13;
  } else {
    suggestions.push({ text: 'Define un rol para la IA (ej: "Actua como un experto en..."). Esto activa el equipo de agentes adecuado.', icon:'role' });
  }

  // Contexto (13 pts)
  if (d.context && d.context.trim().length > 30) {
    score += 13;
  } else if (d.context && d.context.trim().length > 5) {
    score += 7;
    suggestions.push({ text: 'Agrega mas contexto: el proyecto, la situacion y el motivo detras de tu solicitud. Mas contexto = mejor resultado.', icon:'context' });
  } else {
    suggestions.push({ text: 'Agrega contexto. La IA necesita entender el panorama completo para no inventar suposiciones.', icon:'context' });
  }

  // Intencion (18 pts)
  const actionVerbs = ['crea','escribe','disena','desarrolla','genera','analiza','explica','resume','compara','construye','produce','elabora','redacta','formula','describe','lista','traduce','corrige','organiza','estructura','implementa','planea','programa','define','resuelve','optimiza','mejora','transforma','evalua','investiga','sintetiza','configura','automatiza','adapta'];
  const hasVerb = actionVerbs.some(v => d.intention.toLowerCase().includes(v));
  if (d.intention && d.intention.trim().length > 20 && hasVerb) {
    score += 18;
  } else if (d.intention && d.intention.trim().length > 10) {
    score += 10;
    suggestions.push({ text: 'Se mas especifico y usa verbos de accion: crear, disenar, analizar, generar, estructurar...', icon:'intention' });
  } else {
    suggestions.push({ text: 'Describe claramente que quieres que produzca la IA. Usa verbos de accion y se especifico.', icon:'intention' });
  }

  // Audiencia (8 pts)
  if (d.audience && d.audience.trim().length > 3) {
    score += 8;
  } else {
    suggestions.push({ text: 'Define la audiencia: ¿quien usara o leera el resultado? Esto calibra el nivel, tono y vocabulario.', icon:'audience' });
  }

  // Formato (8 pts)
  if (d.format && d.format !== '') {
    score += 8;
  } else {
    suggestions.push({ text: 'Selecciona el formato esperado: lista, tabla, codigo, paso a paso... Esto mejora enormemente la estructura del resultado.', icon:'format' });
  }

  // Tono (8 pts)
  if (d.tone && d.tone !== '') {
    score += 8;
  } else {
    suggestions.push({ text: 'Define el tono: formal, tecnico, pedagogico, creativo... Ajusta como "suena" la respuesta.', icon:'tone' });
  }

  // Restricciones (8 pts)
  if (d.restrictions && d.restrictions.trim().length > 5) {
    score += 8;
  } else {
    suggestions.push({ text: 'Agrega restricciones: ¿que NO debe hacer la IA? (ej: "Sin jerga tecnica", "Maximo 3 parrafos", "No inventes datos")', icon:'restrictions' });
  }

  // Ejemplo (8 pts)
  if (d.example && d.example.trim().length > 5) {
    score += 8;
  } else {
    suggestions.push({ text: 'Incluye un ejemplo de como quieres que se vea el resultado. Es la forma mas rapida de alinear la IA con tu vision.', icon:'example' });
  }

  // Campos dinamicos de la categoria (10 pts)
  const dynCount = getDynamicFilledCount();
  const dynFields = DYNAMIC_FIELDS[d.cat] || [];
  if (dynFields.length > 0) {
    if (dynCount >= 2) {
      score += 10;
    } else if (dynCount === 1) {
      score += 5;
      suggestions.push({ text: 'Completa mas campos especificos de la categoria "' + (CATEGORIES[d.cat] || d.cat) + '". Cada campo adicional hace el prompt mas preciso.', icon:'cat-tip' });
    } else {
      suggestions.push({ text: 'Completa los campos especificos para la categoria "' + (CATEGORIES[d.cat] || d.cat) + '" — son fundamentales para un prompt de calidad premium.', icon:'cat-tip' });
    }
  } else if (d.cat) {
    score += 6; // No hay campos dinamicos pero hay categoria
  }

  // Coherencia basica (6 pts)
  if (d.cat && d.intention && d.intention.trim().length > 5) {
    score += 6;
  } else if (!d.cat) {
    suggestions.push({ text: 'Selecciona una categoria para activar campos especificos y directrices del equipo de agentes.', icon:'cat' });
  }

  let level, levelClass;
  if      (score <= 30) { level = 'Basico';     levelClass = 'level-basic'; }
  else if (score <= 55) { level = 'Intermedio'; levelClass = 'level-inter'; }
  else if (score <= 78) { level = 'Avanzado';   levelClass = 'level-adv';   }
  else                  { level = 'Premium';    levelClass = 'level-prem';  }

  return { score, suggestions, level, levelClass };
}

function getScoreColor(score) {
  if (score <= 30) return 'var(--sc-low)';
  if (score <= 55) return 'var(--sc-mid)';
  if (score <= 78) return 'var(--sc-high)';
  return 'var(--sc-prem)';
}

/* ============================================================
   GENERADOR DE PROMPT ESTRUCTURADO (ARQUITECTURA DE AGENTES)
   ============================================================ */
function generateStructuredPrompt() {
  const d    = getFormData();
  const dyn  = getDynamicData();
  const cat  = d.cat;
  const team = AGENT_TEAMS[cat] || AGENT_TEAMS.other;
  const dir  = CAT_DIRECTIVES[cat] || CAT_DIRECTIVES.other;
  const catLabel = CATEGORIES[cat] || 'Tarea';

  let parts = [];

  // ── CABECERA: EQUIPO DE AGENTES ──
  const teamBlock =
    '══════════════════════════════════════════════\n' +
    'CONFIGURACION DEL EQUIPO DE AGENTES\n' +
    '══════════════════════════════════════════════\n' +
    'Categoria: ' + catLabel + '\n\n' +
    'Actuas como un equipo de agentes especializados. Cada agente opera con un mandato especifico y en conjunto producen el resultado. El equipo es:\n\n' +
    (d.role
      ? '  Agente Principal: ' + d.role + '\n'
      : '') +
    '  ' + team + '\n\n' +
    'MODO ANTIALUCINACION ACTIVO durante toda la tarea (ver protocolo al final).';
  parts.push(teamBlock);

  // ── TAREA PRINCIPAL ──
  if (d.intention) {
    parts.push(
      '══════════════════════════════════════════════\n' +
      'TAREA PRINCIPAL\n' +
      '══════════════════════════════════════════════\n' +
      d.intention
    );
  }

  // ── CONTEXTO E IDENTIDAD ──
  let contextParts = [];
  if (d.context)  contextParts.push('Contexto: ' + d.context);
  if (d.audience) contextParts.push('Audiencia objetivo: ' + d.audience);

  // Campos dinamicos de contexto
  const dynFields = DYNAMIC_FIELDS[cat] || [];
  dynFields.forEach(f => {
    const val = dyn[f.id];
    if (val && val !== '') contextParts.push(f.label + ': ' + val);
  });

  if (contextParts.length > 0) {
    parts.push(
      '══════════════════════════════════════════════\n' +
      'CONTEXTO Y ESPECIFICACIONES\n' +
      '══════════════════════════════════════════════\n' +
      contextParts.join('\n')
    );
  }

  // ── CRITERIOS DE ENTREGA ──
  const fmtMap = { texto:'Texto continuo', lista:'Lista con vinetas', tabla:'Tabla', codigo:'Codigo fuente comentado', paso_a_paso:'Paso a paso / tutorial numerado', estructura:'Estructura / esquema jerarquico', dialogo:'Dialogo / guion', json:'JSON estructurado', markdown:'Markdown' };
  const toneMap = { formal:'Formal / profesional', casual:'Casual / cercano', tecnico:'Tecnico / especializado', creativo:'Creativo / inspirador', directo:'Directo / conciso', pedagogico:'Pedagogico / didactico', persuasivo:'Persuasivo / comercial' };

  let delivParts = [];
  if (d.format)       delivParts.push('Formato: ' + (fmtMap[d.format] || d.format));
  if (d.tone)         delivParts.push('Tono: ' + (toneMap[d.tone] || d.tone));
  if (d.restrictions) delivParts.push('Restricciones: ' + d.restrictions);

  if (delivParts.length > 0) {
    parts.push(
      '══════════════════════════════════════════════\n' +
      'CRITERIOS DE ENTREGA\n' +
      '══════════════════════════════════════════════\n' +
      delivParts.join('\n')
    );
  }

  // ── DIRECTRICES DE CATEGORIA ──
  if (dir) parts.push(dir);

  // ── EJEMPLO DE SALIDA ──
  if (d.example) {
    parts.push(
      '══════════════════════════════════════════════\n' +
      'EJEMPLO DE SALIDA ESPERADA\n' +
      '══════════════════════════════════════════════\n' +
      d.example
    );
  }

  // ── RELIGAJE FUNCIONAL Y CRITERIO DE EXITO ──
  parts.push(
    '══════════════════════════════════════════════\n' +
    'CRITERIO DE EXITO — RELIGAJE FUNCIONAL\n' +
    '══════════════════════════════════════════════\n' +
    'Antes de entregar el resultado, verifica internamente:\n' +
    '✓ El resultado responde directamente a la tarea principal declarada\n' +
    '✓ El formato y tono corresponden a la audiencia especificada\n' +
    '✓ Cada componente / seccion tiene un proposito claro y verificable\n' +
    '✓ Nada se incluye "por si acaso" — todo tiene una razon funcional\n' +
    '✓ Si algo no puedes verificar con certeza, lo declaras explicitamente\n\n' +
    'Si alguno de estos criterios no se cumple en el resultado generado, corrige antes de entregar.'
  );

  // ── ANTI-ALUCINACION (siempre al final) ──
  parts.push(ANTI_HALLUC_PROTOCOL);

  return parts.join('\n\n');
}

/* ============================================================
   FORMULARIO
   ============================================================ */
function getFormData() {
  return {
    cat:          document.getElementById('f-cat').value,
    intention:    document.getElementById('f-intention').value,
    context:      document.getElementById('f-context').value,
    role:         document.getElementById('f-role').value,
    audience:     document.getElementById('f-audience').value,
    format:       document.getElementById('f-format').value,
    tone:         document.getElementById('f-tone').value,
    restrictions: document.getElementById('f-restrictions').value,
    example:      document.getElementById('f-example').value
  };
}

function clearForm(silent) {
  ['f-cat','f-intention','f-context','f-role','f-audience','f-format','f-tone','f-restrictions','f-example'].forEach(id => {
    document.getElementById(id).value = '';
  });
  showDynamicFields('');
  _currentDynCat = null;
  updateScore();
  document.getElementById('preview-area').classList.add('hidden');
  if (!silent) showToast('Formulario limpiado');
}

function newPrompt() {
  clearForm(true);
  switchPanel('crear');
  window.scrollTo({ top:0, behavior:'smooth' });
  showToast('Listo para crear un nuevo prompt');
}

function loadFormData(data) {
  document.getElementById('f-cat').value          = data.cat || '';
  document.getElementById('f-intention').value    = data.intention || '';
  document.getElementById('f-context').value      = data.context || '';
  document.getElementById('f-role').value         = data.role || '';
  document.getElementById('f-audience').value     = data.audience || '';
  document.getElementById('f-format').value       = data.format || '';
  document.getElementById('f-tone').value         = data.tone || '';
  document.getElementById('f-restrictions').value = data.restrictions || '';
  document.getElementById('f-example').value      = data.example || '';
  showDynamicFields(data.cat || '');
  updateScore();
}

function onFieldChange() {
  const cat = document.getElementById('f-cat').value;
  showDynamicFields(cat);
  updateScore();

  // Hint de categoria
  const hints = {
    apps:        'Stack tecnologico, tipo de app y escala de usuarios son clave. Define el problema real antes de construir.',
    web:         'Especifica tipo de pagina, dispositivos prioritarios y CTA. Define la ecologia de uso: quien, como y donde.',
    docs:        'Toda informacion debe estar basada en evidencia real. Declara supuestos si no puedes verificar datos.',
    images:      'Estilo, ratio, y lo que debe EVITAR son tan importantes como la descripcion positiva.',
    videos:      'Define duracion, plataforma y tipo. El guion debe considerar lo que se ve mientras se escucha.',
    podcast:     'Incluye formato (guion vs outline), duracion y numero de participantes. Que suene natural al hablarse.',
    slides:      'Una idea por diapositiva. El orden debe construir un argumento, no solo listar informacion.',
    surveys:     'Define que decisiones tomaras con los datos. Cada pregunta mide una sola variable.',
    agents:      'Define limites claros y protocolo de escalada. El agente no debe inventar si no sabe.',
    courses:     'Define el conocimiento previo del estudiante y la brecha que llena el curso. Cada modulo conecta con el objetivo.',
    copy:        'El copy debe responder a una tension real del lector. El CTA debe ser especifico y sin friccion.',
    narrative:   'Coherencia interna obligatoria. Muestra en lugar de decir. La tension narrativa debe mantenerse activa.',
    research:    'Distingue conocimiento establecido de lo que sigue en debate. No inventes fuentes ni citas.',
    data:        'Declara los supuestos antes de los resultados. Distingue correlacion de causalidad.',
    feedback:    'El feedback accionable dice "cambia X por Y porque Z", no solo "esto esta mal".',
    strategy:    'Basa las recomendaciones en evidencia del contexto. Incluye supuestos y criterios de exito medibles.',
    automation:  'Todo codigo debe tener manejo de errores. Verifica que las librerias existan antes de usarlas.',
    seo:         'El contenido debe responder genuinamente a la intencion de busqueda, no solo incluir keywords.',
    translation: 'Prioriza naturalidad en el destino. Adapta referencias culturales, no solo palabras.',
    improve:     'Principio: primero no danes. Diagnostica antes de intervenir. Toda correccion debe ser minima y verificable.',
    email:       'Un objetivo por email. El asunto comunica la accion esperada. Adapta el tono a la relacion con el destinatario.',
    legal:       'INCLUIR disclaimer: "No constituye asesoría legal". Especifica jurisdiccion. No inventes leyes ni codigos.',
    productivity:'El sistema debe ser ejecutable desde manana. Prioriza por impacto, no por urgencia. Verifica que no genere mas overhead.',
    other:       'Define el problema real, la audiencia y el criterio de exito. La IA propone con evidencia; tu decides.'
  };
  document.getElementById('hint-cat').textContent = hints[cat] || '';
}

/* ============================================================
   SCORE UI
   ============================================================ */
function updateScore() {
  const result = analyzePrompt();
  const circle = document.getElementById('score-circle');
  const num    = document.getElementById('score-num');
  const level  = document.getElementById('score-level');
  const list   = document.getElementById('suggestions-list');
  const bar    = document.getElementById('score-progress-bar');

  num.textContent    = result.score;
  circle.style.borderColor = getScoreColor(result.score);
  num.style.color    = getScoreColor(result.score);
  if (bar) { bar.style.width = result.score + '%'; bar.style.background = getScoreColor(result.score); }
  level.innerHTML    = '<span class="level-badge ' + result.levelClass + '">' + result.level.toUpperCase() + '</span>';

  if (result.suggestions.length === 0) {
    list.innerHTML = '<li style="border-left-color:var(--ok);color:var(--ok)">Tu prompt esta listo para usar. Copialo y llevalo a tu IA preferida.</li>';
  } else {
    list.innerHTML = result.suggestions.map(s => '<li>' + s.text + '</li>').join('');
  }
  document.getElementById('preview-content').textContent = generateStructuredPrompt();
}

/* ============================================================
   PREVIEW
   ============================================================ */
function togglePreview() {
  const area = document.getElementById('preview-area');
  area.classList.remove('hidden');
  document.getElementById('preview-content').textContent = generateStructuredPrompt();
  area.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ============================================================
   COPIAR / GUARDAR
   ============================================================ */
function copyPrompt() {
  const prompt = generateStructuredPrompt();
  if (!prompt.trim()) { showToast('Completa al menos un campo para generar el prompt.'); return; }
  document.getElementById('validate-preview').textContent = prompt;
  document.getElementById('modal-validate').classList.add('show');
}
function confirmCopy() {
  const prompt = generateStructuredPrompt();
  navigator.clipboard.writeText(prompt).then(() => {
    showToast('Prompt copiado al portapapeles. Pegalo en tu IA preferida.');
  }).catch(() => {
    const ta = document.createElement('textarea'); ta.value = prompt;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); showToast('Prompt copiado al portapapeles.');
  });
  closeModal('modal-validate');
}
function savePrompt() {
  const d = getFormData(); const prompt = generateStructuredPrompt();
  if (!d.intention || !d.intention.trim()) { showToast('Agrega al menos lo que quieres lograr para guardar.'); return; }
  const result = analyzePrompt(); const autoTitle = generateTitle(d);
  document.getElementById('save-title').value = autoTitle;
  const sc = getScoreColor(result.score);
  document.getElementById('save-score-badge').innerHTML = '<span style="color:' + sc + ';font-weight:700">' + result.score + '/100 — ' + result.level + '</span>';
  document.getElementById('modal-save').classList.add('show');
}
function confirmSave() {
  const d = getFormData(); const prompt = generateStructuredPrompt(); const result = analyzePrompt();
  const title = document.getElementById('save-title').value.trim() || generateTitle(d);
  const item = {
    id: editingId || 'pf_' + Date.now(), title, cat: d.cat || 'other', data: d, prompt,
    score: result.score, level: result.level,
    result: editingId ? (library.find(p => p.id === editingId)?.result || null) : null,
    date: editingId ? (library.find(p => p.id === editingId)?.date || new Date().toISOString()) : new Date().toISOString(),
    updated: new Date().toISOString()
  };
  if (editingId) {
    const idx = library.findIndex(p => p.id === editingId);
    if (idx >= 0) library[idx] = item;
    editingId = null; showToast('Prompt actualizado en tu biblioteca.');
  } else { library.unshift(item); showToast('Prompt guardado en tu biblioteca.'); }
  persistLibrary(); closeModal('modal-save'); clearForm();
}
function generateTitle(d) {
  if (d.cat && d.intention) return (CATEGORIES[d.cat] || 'Prompt') + ': ' + d.intention.substring(0,50) + (d.intention.length > 50 ? '...' : '');
  return d.intention ? d.intention.substring(0, 60) : 'Prompt sin titulo';
}

/* ============================================================
   BIBLIOTECA
   ============================================================ */
function persistLibrary() {
  try { localStorage.setItem('pf_library', JSON.stringify(library)); }
  catch(e) { showToast('Espacio de almacenamiento lleno. Elimina algunos prompts antiguos.', 'error'); }
}
function renderLibrary() {
  const search  = (document.getElementById('lib-search')?.value || '').toLowerCase();
  const grid    = document.getElementById('lib-grid');
  const empty   = document.getElementById('lib-empty');
  const filtersEl = document.getElementById('lib-filters');
  const cats = [...new Set(library.map(p => p.cat))];
  let filterHTML = '<button class="filter-chip ' + (libFilter === 'all' ? 'active' : '') + '" onclick="filterLib(\'all\',this)">Todas (' + library.length + ')</button>';
  cats.forEach(c => {
    const count = library.filter(p => p.cat === c).length;
    if (count > 0) filterHTML += '<button class="filter-chip ' + (libFilter === c ? 'active' : '') + '" onclick="filterLib(\'' + c + '\',this)">' + (CATEGORIES[c] || c) + ' (' + count + ')</button>';
  });
  filtersEl.innerHTML = filterHTML;
  let filtered = library;
  if (libFilter !== 'all') filtered = filtered.filter(p => p.cat === libFilter);
  if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search) || p.prompt.toLowerCase().includes(search) || (CATEGORIES[p.cat] || '').toLowerCase().includes(search));
  if (filtered.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); empty.querySelector('p').textContent = search ? 'No se encontraron resultados' : 'Tu biblioteca esta vacia'; return; }
  empty.classList.add('hidden');
  grid.innerHTML = filtered.map(p => {
    const dateStr = new Date(p.date).toLocaleDateString('es', { day:'numeric', month:'short', year:'numeric' });
    const sc = getScoreColor(p.score);
    const lvCls = p.score <= 30 ? 'level-basic' : p.score <= 55 ? 'level-inter' : p.score <= 78 ? 'level-adv' : 'level-prem';
    return '<div class="lib-card" onclick="viewPrompt(\'' + p.id + '\')">' +
      '<div class="lib-card-head"><span class="lib-card-title">' + escHtml(p.title) + '</span><span class="lib-card-cat">' + (CATEGORIES[p.cat] || p.cat) + '</span></div>' +
      '<div class="lib-card-score">Puntuacion: <span style="color:' + sc + ';font-weight:700">' + p.score + '/100</span> — <span class="level-badge ' + lvCls + '">' + p.level + '</span></div>' +
      '<div class="lib-card-body">' + escHtml(p.prompt).substring(0,150) + '...</div>' +
      '<div class="lib-card-date">' + dateStr + '</div>' +
      '<div class="lib-card-actions" onclick="event.stopPropagation()">' +
        '<button class="btn-ghost btn-sm" onclick="editPrompt(\'' + p.id + '\')">Editar</button>' +
        '<button class="btn-ghost btn-sm" onclick="reusePrompt(\'' + p.id + '\')">Copiar</button>' +
        '<button class="btn-ghost btn-sm" onclick="captureResult(\'' + p.id + '\')">Capturar Resultado</button>' +
        '<button class="btn-ghost btn-sm" onclick="duplicatePrompt(\'' + p.id + '\')">Duplicar</button>' +
        '<button class="btn-ghost btn-sm" onclick="deletePrompt(\'' + p.id + '\')" style="color:var(--err)">Eliminar</button>' +
      '</div></div>';
  }).join('');
}
function filterLib(cat, el) { libFilter = cat; renderLibrary(); }
function viewPrompt(id) {
  const p = library.find(x => x.id === id); if (!p) return;
  const prompt = p.prompt || generateFromData(p.data); const sc = getScoreColor(p.score);
  document.getElementById('view-title').textContent = p.title;
  document.getElementById('view-score').innerHTML = '<span style="color:' + sc + ';font-weight:700">' + p.score + '/100 — ' + p.level + '</span>';
  document.getElementById('view-cat').textContent = CATEGORIES[p.cat] || p.cat;
  document.getElementById('view-prompt-text').textContent = prompt;
  document.getElementById('view-date').textContent = new Date(p.date).toLocaleDateString('es', { day:'numeric', month:'short', year:'numeric' });
  document.getElementById('modal-view').classList.add('show');
}
function copyFromView() {
  const text = document.getElementById('view-prompt-text').textContent;
  navigator.clipboard.writeText(text).then(() => showToast('Prompt copiado.', 'success')).catch(() => { const ta = document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('Prompt copiado.'); });
  closeModal('modal-view');
}
function editPrompt(id) {
  const p = library.find(x => x.id === id); if (!p) return;
  editingId = id; loadFormData(p.data); switchPanel('crear');
  showToast('Editando prompt: ' + p.title);
}
function reusePrompt(id) {
  const p = library.find(x => x.id === id); if (!p) return;
  const prompt = p.prompt || generateFromData(p.data);
  navigator.clipboard.writeText(prompt).then(() => showToast('Prompt copiado al portapapeles.')).catch(() => showToast('No se pudo copiar. Intenta manualmente.'));
}
let lastDeleted = null; let undoTimer = null;
function deletePrompt(id) {
  lastDeleted = { item: library.find(p => p.id === id), index: library.findIndex(p => p.id === id) };
  if (!lastDeleted.item) return;
  library = library.filter(p => p.id !== id); persistLibrary(); renderLibrary(); showToast('Prompt eliminado.', 'warning');
  clearTimeout(undoTimer);
  const bar = document.getElementById('undo-bar');
  if (bar) { bar.classList.add('show'); undoTimer = setTimeout(() => bar.classList.remove('show'), 6000); }
}
function undoDelete() {
  if (!lastDeleted || !lastDeleted.item) return;
  library.splice(lastDeleted.index, 0, lastDeleted.item); persistLibrary(); renderLibrary();
  lastDeleted = null; document.getElementById('undo-bar')?.classList.remove('show');
  showToast('Prompt restaurado.', 'success');
}
function duplicatePrompt(id) {
  const p = library.find(x => x.id === id); if (!p) return;
  const dup = JSON.parse(JSON.stringify(p)); dup.id = 'pf_' + Date.now(); dup.title = p.title + ' (copia)';
  dup.date = new Date().toISOString(); dup.updated = new Date().toISOString();
  library.unshift(dup); persistLibrary(); renderLibrary(); showToast('Prompt duplicado.', 'success');
}
function generateFromData(d) {
  if (!d) return '';
  // Regenerates from old format using new structured prompt
  const saved = { cat:'', intention:'', context:'', role:'', audience:'', format:'', tone:'', restrictions:'', example:'', ...d };
  let parts = [];
  if (saved.role)         parts.push('**Rol:** ' + saved.role);
  if (saved.context)      parts.push('**Contexto:** ' + saved.context);
  if (saved.intention)    parts.push('**Tarea:** ' + saved.intention);
  if (saved.audience)     parts.push('**Audiencia:** ' + saved.audience);
  if (saved.format)       parts.push('**Formato:** ' + saved.format);
  if (saved.tone)         parts.push('**Tono:** ' + saved.tone);
  if (saved.restrictions) parts.push('**Restricciones:** ' + saved.restrictions);
  if (saved.example)      parts.push('**Ejemplo:** ' + saved.example);
  parts.push(ANTI_HALLUC_PROTOCOL);
  return parts.join('\n\n');
}

/* ============================================================
   EXPORT / IMPORT
   ============================================================ */
function exportLibrary() {
  if (library.length === 0) { showToast('Tu biblioteca esta vacia.'); return; }
  const blob = new Blob([JSON.stringify(library, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'promptforge_biblioteca_' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(url); showToast('Biblioteca exportada correctamente.');
}
function importLibrary(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Formato invalido');
      data.forEach(item => {
        if (!library.find(p => p.id === item.id)) { item.id = 'pf_' + Date.now() + '_' + Math.random().toString(36).substr(2,5); library.unshift(item); }
      });
      persistLibrary(); renderLibrary(); showToast(data.length + ' prompts importados correctamente.');
    } catch(err) { showToast('Error al importar: archivo no valido.'); }
  };
  reader.readAsText(file); event.target.value = '';
}
function clearAllData() {
  if (!confirm('Esta accion eliminara permanentemente todos tus prompts. Continuar?')) return;
  library = []; localStorage.removeItem('pf_library'); renderLibrary(); showToast('Todos los datos han sido eliminados.');
}

/* ============================================================
   HUB DE IAs
   ============================================================ */
function renderHub() {
  const search = (document.getElementById('hub-search')?.value || '').toLowerCase();
  const grid   = document.getElementById('hub-grid');
  let filtered = AI_LIST;
  if (hubFilter !== 'all') filtered = filtered.filter(ai => ai.tags.includes(hubFilter));
  if (search) filtered = filtered.filter(ai => ai.name.toLowerCase().includes(search) || ai.by.toLowerCase().includes(search) || ai.desc.toLowerCase().includes(search));
  grid.innerHTML = filtered.map(ai =>
    '<div class="hub-card">' +
    '<div><div class="hub-card-name">' + ai.name + '</div><div class="hub-card-by">por ' + ai.by + '</div></div>' +
    '<div class="hub-card-desc">' + ai.desc + '</div>' +
    '<div class="hub-card-tags">' + ai.tags.map(t => '<span class="hub-tag">' + t + '</span>').join('') + '</div>' +
    '<a href="' + ai.url + '" target="_blank" rel="noopener noreferrer" class="btn btn-sm hub-card-link">Abrir ' + ai.name + '</a>' +
    '</div>'
  ).join('');
}
function filterHub(tag, el) {
  hubFilter = tag;
  document.querySelectorAll('#panel-hub .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active'); renderHub();
}
function goToHubWithFilter() {
  const cat = document.getElementById('f-cat').value; switchPanel('hub');
  if (cat && cat !== '') {
    const catToTag = { images:'imagen', apps:'codigo', web:'codigo', automation:'codigo', data:'codigo', docs:'texto', videos:'texto', podcast:'texto', slides:'texto', surveys:'texto', agents:'texto', courses:'texto', copy:'texto', narrative:'texto', research:'busqueda', seo:'busqueda', feedback:'texto', strategy:'texto', translation:'texto', other:'all' };
    hubFilter = catToTag[cat] || 'all';
    document.querySelectorAll('#panel-hub .filter-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === hubFilter));
    renderHub(); showToast('Hub filtrado para: ' + (CATEGORIES[cat] || cat));
  }
}

/* ============================================================
   CAPTURAR RESULTADO DE IA
   ============================================================ */
let captureTargetId = null;
function captureResult(id) {
  const p = library.find(x => x.id === id); if (!p) return;
  captureTargetId = id;
  document.getElementById('capture-original').textContent = p.prompt || generateFromData(p.data);
  document.getElementById('capture-result').value   = p.result?.text || '';
  document.getElementById('capture-quality').value  = p.result?.quality || '';
  document.getElementById('capture-notes').value    = p.result?.notes || '';
  document.getElementById('modal-capture').classList.add('show');
}
function confirmCapture() {
  if (!captureTargetId) return;
  const text = document.getElementById('capture-result').value.trim();
  if (!text) { showToast('Pega el resultado de la IA antes de guardar.'); return; }
  const idx = library.findIndex(p => p.id === captureTargetId);
  if (idx >= 0) {
    library[idx].result = { text, quality: document.getElementById('capture-quality').value, notes: document.getElementById('capture-notes').value.trim(), date: new Date().toISOString() };
    library[idx].updated = new Date().toISOString(); persistLibrary(); showToast('Resultado capturado y asociado al prompt.');
  }
  captureTargetId = null; closeModal('modal-capture');
}

/* ============================================================
   UTILIDADES
   ============================================================ */
function escHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function showToast(msg, type) {
  const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast';
  if (type) t.classList.add('toast-' + type); t.classList.add('show');
  clearTimeout(t._timeout); t._timeout = setTimeout(() => t.classList.remove('show'), 3500);
}
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show')); return; }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newPrompt(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); savePrompt(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') { e.preventDefault(); copyPrompt(); }
  if (e.key === '1') switchPanel('crear');
  if (e.key === '2') switchPanel('biblioteca');
  if (e.key === '3') switchPanel('hub');
  if (e.key === '4') switchPanel('aprende');
  if (e.key === '5') switchPanel('config');
});

const debouncedRenderLib = (function(fn,d){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),d);}})(renderLibrary, 250);
const debouncedRenderHub = (function(fn,d){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),d);}})(renderHub, 250);

/* ============================================================
   INIT
   ============================================================ */
(function init() {
  applyTheme();
  updateScore();
  renderLibrary();
  renderHub();
})();

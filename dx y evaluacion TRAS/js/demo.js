/* ============================================================
   TRAS · demo.js
   Caso ficticio y completo para demostrar el flujo integral.
   Personaje, datos y respuestas son inventados con fines de
   demostracion. Las areas sensibles 17 y 18 quedan POSPUESTAS,
   modelando una decision clinica prudente con un menor.

   v0.16.14: caso demo reemplazado por completo (personaje, HC,
   respuestas, Goldstein, personalidad y Matriz Cognitivo-Atencional
   nuevos). El caso anterior ("Mateo R.") queda retirado.
   ============================================================ */

const DEMO_EVALUATOR = {
  nombre: 'Jose Alonso Andrade Salazar',
  profesion: 'Psicologo clinico',
  registro: '117492',
  institucion: 'Clinica Central del Quindio',
  direccion: 'Carrera 13 # 1N-35, Armenia - Quindio',
  telefono: '315 616 0390',
  email: '911psicologia@gmail.com',
  firmaDataUrl: (typeof SAMPLE_SIGNATURE_DATAURL !== 'undefined') ? SAMPLE_SIGNATURE_DATAURL : ''
};

/* Respuestas por id de item. Solo se incluyen las areas que se ilustran. */
const DEMO_RESPONSES = {
  // Area 04 - companeros de colegio
  area_04_A: {respuesta:'la mayoria estan bien, pero ya no me siento parte del grupo de antes.', notas:'Perdida reciente del grupo cercano.', profundizar:true},
  area_04_B: {respuesta:'se inventaron un rumor sobre mi en un chat y dejaron de hablarme.', notas:'Rumor por redes sociales como detonante.', profundizar:true},
  area_04_C: {respuesta:'alguien comparte una captura de pantalla sin preguntar.', notas:'', profundizar:false},
  area_04_D: {respuesta:'las que repiten cosas de mi que no son ciertas.', notas:'', profundizar:false},
  // Area 05 - colegio y profesores
  area_05_A: {respuesta:'esperan mucho de mis notas, aunque casi siempre entienden si algo me cuesta.', notas:'', profundizar:false},
  area_05_B: {respuesta:'no tuviera que exponer en frente de todos.', notas:'Evitacion de exposicion oral.', profundizar:true},
  area_05_C: {respuesta:'a veces me da mucho miedo antes de un examen.', notas:'Ansiedad anticipatoria academica.', profundizar:true},
  area_05_D: {respuesta:'me dieran mas tiempo antes de tener que hablar en publico.', notas:'', profundizar:false},
  // Area 06 - amigos
  area_06_A: {respuesta:'ya casi no las busco, desde lo que paso me cuesta confiar.', notas:'Retraimiento social tras ruptura.', profundizar:true},
  area_06_B: {respuesta:'que me escuchen sin contarle a nadie mas.', notas:'', profundizar:false},
  area_06_C: {respuesta:'hablan de mi a mis espaldas.', notas:'', profundizar:false},
  area_06_D: {respuesta:'trato de escuchar, pero ahora tengo mas cuidado con lo que cuento.', notas:'', profundizar:false},
  // Area 08 - comportamiento social
  area_08_A: {respuesta:'me pongo un poco nerviosa si hay gente que no conozco.', notas:'', profundizar:false},
  area_08_B: {respuesta:'antes salia mucho, ahora prefiero quedarme con una o dos personas.', notas:'', profundizar:false},
  area_08_C: {respuesta:'quedarme callada hasta ver como es la persona.', notas:'', profundizar:false},
  area_08_D: {respuesta:'hablo mas, pero me cuesta volver a confiar del todo.', notas:'Cautela relacional post-ruptura.', profundizar:true},
  // Area 09 - comportamiento familiar
  area_09_A: {respuesta:'cantar o ensayar para el coro, eso me relaja.', notas:'Recurso: canto/coro.', profundizar:false},
  area_09_B: {respuesta:'cuando me preguntan por las notas todo el tiempo.', notas:'', profundizar:false},
  area_09_C: {respuesta:'lo disfruto, aunque a veces preferiria quedarme sola.', notas:'', profundizar:false},
  area_09_D: {respuesta:'me pongo a la defensiva aunque se que tienen razon.', notas:'', profundizar:false},
  // Area 13 - autoconcepto
  area_13_A: {respuesta:'responsable pero muy dura conmigo misma.', notas:'Autoexigencia.', profundizar:true},
  area_13_B: {respuesta:'que soy rara, por lo que dijeron de mi.', notas:'Impacto del rumor en autoimagen.', profundizar:true},
  area_13_C: {respuesta:'que me preocupo demasiado por lo que piensan de mi.', notas:'', profundizar:false},
  area_13_D: {respuesta:'cantar y organizar mis tareas con anticipacion.', notas:'Recurso: canto, organizacion.', profundizar:false},
  // Area 16 - madurez percibida
  area_16_A: {respuesta:'que ropa ponerme y como organizo mi tiempo de estudio.', notas:'', profundizar:false},
  area_16_B: {respuesta:'me cuesta aceptar que no puedo controlar lo que piensan de mi.', notas:'', profundizar:false},
  area_16_C: {respuesta:'que las cosas volvieran a ser como antes con mis amigas.', notas:'', profundizar:false},
  area_16_D: {respuesta:'hablar con mi papa, el me ayuda a ver las cosas mas tranquila.', notas:'Recurso: vinculo paterno.', profundizar:false},
  // Area 19 - acoso
  area_19_A: {respuesta:'creyeron un rumor sobre mi sin preguntarme primero.', notas:'', profundizar:true},
  area_19_B: {respuesta:'llorar y no querer ir al colegio al dia siguiente.', notas:'Evitacion escolar leve.', profundizar:true},
  area_19_C: {respuesta:'me quedo pensando en eso todo el dia y se lo cuento a mi papa.', notas:'Busca apoyo adulto: recurso protector.', profundizar:false},
  area_19_D: {respuesta:'les pediria que me escucharan antes de creer un rumor.', notas:'', profundizar:false},
  // Subescala complementaria - indicador de conflicto (activada)
  comp_04_A: {respuesta:'muy insegura, como si todos me estuvieran juzgando.', notas:'', profundizar:true},
  comp_04_B: {respuesta:'cantar y hablar con mi papa.', notas:'', profundizar:false},
  comp_04_C: {respuesta:'nadie pregunto mi version antes de dejar de hablarme.', notas:'', profundizar:false},
  comp_04_D: {respuesta:'ahora me cuesta mas confiar y participar en clase.', notas:'', profundizar:false}
};

const DEMO_INTERPRETATIONS = {
  area_04: {
    que_dice: 'Refiere sentirse fuera del grupo desde que "se inventaron un rumor" en un chat y dejaron de hablarle; identifica como fuente de desagrado a quienes repiten informacion falsa sobre ella.',
    que_sucede: 'El corte social se vincula a un evento concreto y verificable (difusion de un rumor por redes), no a un patron generalizado de rechazo. La respuesta emocional es proporcional al evento y no se extiende a una vivencia de exclusion total: distingue entre el grupo que la excluyo y "la mayoria", que describe como bien.',
    que_se_sugiere: 'Verificar con el colegio el curso que tomo el conflicto y si persiste la circulacion de contenido; acompanar el proceso de reconstruccion de confianza sin forzar una reconciliacion inmediata con el grupo anterior.'
  },
  area_05: 'La ansiedad se concentra en la anticipacion de evaluaciones y en la exposicion oral, con quejas somaticas asociadas (dolor de estomago, dificultad para dormir la noche previa). No aparece rechazo al colegio en si, sino temor especifico al desempeno observado por otros.',
  area_06: 'El vinculo de amistad muestra retraimiento y cautela tras la ruptura reciente: mantiene el deseo de confianza pero necesita mas tiempo y garantias de confidencialidad antes de abrirse de nuevo.',
  area_08: 'El comportamiento social evidencia mayor cautela que antes del conflicto, sin llegar al aislamiento total; prefiere circulos pequenos y tarda mas en confiar plenamente en un grupo nuevo.',
  area_09: 'El coro funciona como un recurso regulador identificado por ella misma. La presion percibida por el rendimiento academico en casa es un foco de tension recurrente, aunque no se describe un clima familiar hostil.',
  area_13: 'El autoconcepto muestra autoexigencia marcada y una autoimagen recientemente danada por el rumor ("que soy rara"), sin llegar a una autoetiqueta global rigida ni a desesperanza; conserva reconocimiento de habilidades concretas (canto, organizacion).',
  area_16: 'La capacidad de afrontamiento se apoya principalmente en el vinculo paterno como regulador emocional. Aparece dificultad para aceptar la falta de control sobre la opinion ajena, un foco util para trabajo terapeutico.',
  area_19: {
    que_dice: 'Relata que "creyeron un rumor sobre mi sin preguntarme primero", con reaccion de llanto y rechazo a asistir al colegio al dia siguiente; frente a ello piensa en el evento durante el dia y se lo cuenta a su padre.',
    que_sucede: 'El cuadro es compatible con una vivencia de victimizacion social mediada por redes (difusion de rumores), con evitacion escolar leve como senal de alerta. Se conserva un recurso protector claro: la busqueda activa de apoyo en el padre, sin fantasias de retaliacion.',
    que_se_sugiere: 'Indagar en entrevista el alcance real de la difusion del rumor (cuantas personas, si continua circulando) antes de cualquier conclusion; sostener la via de apoyo paterno ya en uso y trabajar estrategias para no anticipar catastroficamente el juicio ajeno.'
  },
  comp_04: 'El malestar se organiza alrededor de la vivencia de haber sido juzgada sin posibilidad de defenderse, con impacto en la confianza y la participacion en clase. No se identifican expresiones de desesperanza global; los recursos de afrontamiento (canto, vinculo paterno) permanecen disponibles y activos.'
};

/* Bateria Goldstein demo coherente con el perfil de Valentina:
   solido limite moral y habilidades basicas; principal debilidad en
   afrontamiento del estres social (responder a una acusacion, tolerar
   el fracaso, resolver la verguenza), coherente con el rumor y la
   ruptura reciente de su grupo de amigas. */
const DEMO_GOLDSTEIN = {
  aplicado: true,
  modo: 'all',
  fuente: 'manual',
  respuestas: {
    // I basicas
    '1':'siempre','2':'siempre','3':'aveces','4':'siempre','5':'nunca','6':'aveces','7':'siempre','8':'aveces',
    // II avanzadas
    '9':'nunca','10':'aveces','11':'siempre','12':'siempre','13':'nunca','14':'nunca',
    // III sentimientos
    '15':'siempre','16':'nunca','17':'siempre','18':'aveces','19':'siempre','20':'nunca','21':'aveces',
    // IV alternativas a la agresion
    '22':'siempre','23':'siempre','24':'siempre','25':'siempre','26':'siempre','27':'aveces','28':'siempre','29':'siempre','30':'siempre',
    // V frente al estres
    '31':'nunca','32':'aveces','33':'nunca','34':'nunca','35':'aveces','36':'nunca','37':'nunca','38':'aveces','39':'nunca','40':'aveces','41':'nunca','42':'aveces',
    // VI planificacion
    '43':'siempre','44':'aveces','45':'siempre','46':'siempre','47':'siempre','48':'aveces','49':'siempre','50':'siempre'
  },
  interp: {
    que_sale: 'Valentina muestra un repertorio social solido en habilidades basicas de cortesia y, sobre todo, en las alternativas a la agresion: comparte, ayuda, evita peleas y no responde con agresion incluso bajo provocacion. Las habilidades mas escasas se concentran en el afrontamiento del estres social -responder a una acusacion, tolerar el fracaso, resolver la verguenza y arreglarselas cuando la dejan de lado-, y en la expresion de sentimientos y el manejo del miedo dentro del area emocional.',
    analisis_causal: 'El perfil se comprende a la luz del evento reciente: la difusion de un rumor y la ruptura del grupo de amigas concentran justamente las mayores dificultades en responder a una acusacion y en arreglarselas cuando la dejan de lado, mientras que el limite moral (no agredir) y las habilidades de cortesia permanecen intactos. No se trata de un deficit social generalizado, sino de una retraccion puntual en las habilidades que se activan bajo juicio social y perdida de pertenencia.',
    sugerencias: '1) Entrenar respuestas ante acusaciones y rumores mediante ensayo conductual gradual, apoyandose en su buen manejo verbal ya disponible.\n2) Trabajar tolerancia al fracaso y manejo de la verguenza en contextos de bajo riesgo antes de escenarios de mayor exposicion.\n3) Fortalecer la expresion emocional verbal aprovechando el canto como puente hacia la puesta en palabras de lo que siente.\n4) Sostener y visibilizar el fuerte limite moral y las conductas prosociales ya disponibles como ancla de autoeficacia social.',
    conclusion: ''
  }
};

/* Matriz Cognitivo-Atencional demo, coherente con el perfil de
   Valentina: alto desempeno cognitivo con fluctuaciones puntuales por
   ansiedad/rumiacion; baja hiperactividad/impulsividad; regulacion
   emocional con la frecuencia mas alta (impacto del rumor); fortalezas
   en lo musical (coro), linguistico e intrapersonal. */
const DEMO_MATRIZCA = {
  cognitivas: {
    respuestas: {
      HC01:'B', HC02:'B', HC03:'B', HC04:'D', HC05:'B', HC06:'B',
      HC07:'C', HC08:'D', HC09:'B', HC10:'B', HC11:'C', HC12:'D',
      HC13:'B', HC14:'C', HC15:'B', HC16:'B', HC17:'C', HC18:'A',
      HC19:'B', HC20:'A', HC21:'A', HC22:'B', HC23:'C', HC24:'B',
      HC25:'C', HC26:'A', HC27:'B', HC28:'D', HC29:'D', HC30:'A'
    },
    observaciones: {
      HC21:'Se distrajo', HC23:'Pidio repeticion', HC28:'Se apresuro'
    }
  },
  atencion: {
    respuestas: {
      AT01:{frecuencia:2, interferencia:1}, AT02:{frecuencia:3, interferencia:2},
      AT03:{frecuencia:1, interferencia:1}, AT04:{frecuencia:1, interferencia:0},
      AT05:{frecuencia:2, interferencia:1}, AT06:{frecuencia:1, interferencia:0},
      AT07:{frecuencia:2, interferencia:1}, AT08:{frecuencia:2, interferencia:2},
      AT09:{frecuencia:0, interferencia:0}, AT10:{frecuencia:0, interferencia:0},
      AT11:{frecuencia:1, interferencia:0}, AT12:{frecuencia:1, interferencia:0},
      AT13:{frecuencia:0, interferencia:0},
      AT14:{frecuencia:0, interferencia:0}, AT15:{frecuencia:0, interferencia:0},
      AT16:{frecuencia:1, interferencia:0}, AT17:{frecuencia:0, interferencia:0},
      AT18:{frecuencia:1, interferencia:0},
      AT19:{frecuencia:3, interferencia:2}, AT20:{frecuencia:2, interferencia:2},
      AT21:{frecuencia:3, interferencia:2}, AT22:{frecuencia:2, interferencia:1},
      AT23:{frecuencia:3, interferencia:2}, AT24:{frecuencia:3, interferencia:2}
    }
  },
  inteligencias: {
    respuestas: {
      IM01:4, IM02:4, IM03:3, IM04:3,
      IM05:4, IM06:4, IM07:3, IM08:4,
      IM09:3, IM10:3, IM11:2, IM12:3,
      IM13:2, IM14:2, IM15:3, IM16:2,
      IM17:5, IM18:5, IM19:4, IM20:5,
      IM21:3, IM22:3, IM23:2, IM24:3,
      IM25:4, IM26:4, IM27:4, IM28:3,
      IM29:2, IM30:2, IM31:2, IM32:1
    }
  },
  contexto: {
    areasAcademicas: [],
    habitosEstudio: 'Buena capacidad de estudio cuando el contexto es predecible y anticipa el material con tiempo; evita presentaciones orales y pide, cuando puede, exponer en pareja.',
    cambiosHogar: 'Sin cambios significativos reportados en el hogar en los ultimos meses.',
    cambiosSocial: 'Ruptura de su grupo cercano de amigas hace cuatro meses tras la circulacion de un rumor en redes sociales; participacion voluntaria en clase disminuida desde entonces.',
    apoyos: 'Participacion activa en el coro del colegio; vinculo cercano con el padre como principal fuente de contencion emocional.'
  },
  interp: {
    cognitivas: 'El desempeno cognitivo es alto en comprension verbal, razonamiento logico y razonamiento cuantitativo (100% en las tres areas), con una baja puntual en memoria de trabajo (67%) y un descenso leve en atencion/control inhibitorio (83%), ambos coincidentes con momentos de distraccion durante la aplicacion. El patron es compatible con una capacidad cognitiva solida cuya eficiencia se ve afectada de forma situacional por la carga ansiosa actual, no con una limitacion de base.',
    atencion: 'La inatencion se ubica en un nivel moderado, mientras que la hiperactividad y la impulsividad son bajas: Valentina no reporta inquietud motora ni reacciones impulsivas. El hallazgo mas relevante es la regulacion emocional, que concentra la frecuencia e interferencia mas altas del submodulo, en particular la dificultad para detener la reaccion cuando se siente juzgada y la sensacion de que los cambios recientes la afectan mas de lo que muestra, coherente con el impacto del rumor y la ruptura del grupo de amigas.',
    fortalezas: 'Las fortalezas se concentran en lo musical (coherente con su participacion en el coro), lo linguistico y lo intrapersonal: reconoce con claridad que situaciones la afectan y cuenta con buena capacidad de organizacion verbal. Estos recursos son una via de trabajo prioritaria para canalizar la expresion emocional que hoy le cuesta poner en palabras de forma espontanea.',
    correlacion: 'No se identifica un area academica especifica con dificultad de base: el desempeno cognitivo es solido en las tres areas evaluadas. La baja puntual en memoria de trabajo y atencion/inhibicion se explica mejor por la rumiacion asociada a la ruptura social reciente que por una dificultad de aprendizaje. La evitacion de exposiciones orales, sin embargo, sí tiene un correlato contextual claro (el temor al juicio de pares tras el rumor) y uno cognitivo leve (fluctuacion atencional bajo carga emocional). Esto sustenta, de forma transitoria mientras se resuelve el cuadro ansioso, considerar alternativas de evaluacion oral (exposicion en pareja o grabada) en vez de exigir la modalidad frente a todo el curso.',
    integracion: 'La lectura conjunta sugiere que las fluctuaciones cognitivas y atencionales son situacionales, ligadas a la rumiacion sobre el evento social reciente, sobre una base cognitiva solida y sin hiperactividad ni impulsividad de base. Se recomienda apoyar la expresion emocional a traves del canto y la escritura (sus fortalezas), y reevaluar atencion y memoria de trabajo cuando el cuadro ansioso disminuya, antes de considerar cualquier valoracion adicional.'
  }
};

function loadDemoCase() {
  syncInputsToState();
  persist('Caso anterior guardado');
  state.evaluator = Object.assign({}, state.evaluator, DEMO_EVALUATOR);
  let c = state.cases.find(x => x.isDemo || String(x.meta && x.meta.numero || '').toUpperCase() === 'TRAS-DEMO-001');
  const existingId = c && c.id;
  c = createEmptyCase();
  if (existingId) c.id = existingId;
  c.isDemo = true;
  c.meta = {
    numero: 'TRAS-DEMO-001',
    fecha: new Date().toISOString().slice(0,10),
    nombre: 'Valentina Ospina (caso ficticio)',
    edad: '14',
    sexo: 'F',
    consentimiento: 'Consentimiento informado firmado por el padre (demo).'
  };
  // TRAS extenso ajustado (59 items, ver TRAS_EXTENSO_EXCLUIDOS en dataset.js).
  // Las respuestas demo de mas abajo cubren 8 areas + la subescala de
  // conflicto; algunas fueron registradas en ciclos que el extenso
  // ajustado ya no presenta en la entrevista lineal (ej. area_06_A,
  // area_08_A, area_09_C, area_13_B, area_16_C) -- eso es intencional y
  // no borra nada: siguen visibles en Revision e Informe, igual que
  // pasaria con cualquier caso real que cambie de modo a mitad de
  // camino. Sirve tambien para mostrar ese comportamiento en el demo.
  c.trasMode = 'extenso';
  c.hc = {
    motivo: 'Ansiedad relacionada con el desempeno academico y quejas somaticas antes de evaluaciones.',
    evento: 'Ruptura de su grupo cercano de amigas hace cuatro meses, tras la circulacion de rumores en redes sociales.',
    familia: 'Vive con ambos padres y un hermano menor. Expectativas altas de logro academico en el hogar.',
    escolar: 'Noveno grado. Evita presentaciones orales y ha bajado su participacion en clase desde la ruptura del grupo de amigas.',
    sintomas: 'Dificultad para conciliar el sueno la noche previa a evaluaciones, dolor de estomago recurrente, evitacion de exposiciones orales.',
    recursos: 'Buen vinculo con el padre, participacion en el coro del colegio, capacidad de estudio cuando el contexto es predecible.',
    objetivo: 'Evaluar ansiedad asociada al desempeno academico y al conflicto social reciente, y su impacto en la participacion escolar.',
    alertas: [],
    resumen: 'V. O., adolescente de catorce anos, es evaluada por ansiedad relacionada con el desempeno academico y quejas somaticas antes de evaluaciones. Vive con ambos padres y un hermano menor, en un hogar con expectativas altas de logro academico. Hace cuatro meses su grupo cercano de amigas se disolvio tras la circulacion de un rumor sobre ella en redes sociales, lo que ha reducido su participacion en clase y su disposicion a exponer en publico. Predominan dificultad para dormir la noche previa a evaluaciones, dolor de estomago recurrente y una autoexigencia marcada que se intensifico tras el rumor. Como recursos protectores destacan un buen vinculo con el padre, la participacion en el coro del colegio y capacidad de estudio cuando el contexto es predecible.'
  };
  // Modulos: activa "indicador de conflicto" (comp_04); deja sensibles pospuestas.
  c.modules.complementarios = Object.assign({}, c.modules.complementarios, {comp_04: true});
  c.modules.sensibles = {area_17: 'posponer', area_18: 'posponer'};

  // Respuestas
  Object.entries(DEMO_RESPONSES).forEach(([id, r]) => {
    c.responses[id] = {respuesta: r.respuesta || '', notas: r.notas || '', profundizar: !!r.profundizar};
  });
  // Interpretaciones por area (acepta texto plano o estructura de tres planos)
  Object.entries(DEMO_INTERPRETATIONS).forEach(([id, val]) => {
    let it;
    if (val && typeof val === 'object') {
      it = Object.assign({que_dice:'', que_sucede:'', que_se_sugiere:'', fuente:'manual'}, val);
    } else {
      it = {que_dice:'', que_sucede:String(val || ''), que_se_sugiere:'', fuente:'manual'};
    }
    it.texto = [it.que_dice, it.que_sucede, it.que_se_sugiere]
      .map(s => String(s || '').trim()).filter(Boolean).join('\n\n');
    c.interpretations[id] = it;
  });
  c.patterns = 'Atraviesan el caso tres ejes: (1) una ruptura social reciente por difusion de un rumor en redes, que erosiono la confianza en el grupo de pares y activo cautela relacional generalizada; (2) ansiedad anticipatoria ante el desempeno academico y la exposicion publica, con correlato somatico; y (3) una autoexigencia marcada que intensifica ambos focos anteriores. Como hilo protector transversal aparece el vinculo con el padre y la practica del canto como via de regulacion emocional.';
  c.consolidated = 'Adolescente de 14 anos con ansiedad de tipo situacional-relacional, vinculada a un evento social identificable (difusion de un rumor) y a exigencias academicas percibidas como altas. No se observan indicadores de desorganizacion global del autoconcepto ni desesperanza; el cuadro se comprende mejor como una reaccion adaptativa, aunque intensa, ante una perdida de confianza social reciente sobre una base de autoexigencia previa. La lectura es orientativa y debe contrastarse con reporte escolar y entrevista familiar.';
  c.recommendations = [
    'Espacio terapeutico breve centrado en el manejo de la ansiedad anticipatoria (evaluaciones, exposicion oral) con tecnicas de regulacion antes del evento.',
    'Trabajar la reconstruccion gradual de la confianza interpersonal, sin forzar la reconciliacion con el grupo que origino el conflicto.',
    'Articular con el colegio una verificacion del alcance del rumor y, si continua circulando, una intervencion sobre uso responsable de redes sociales entre pares.',
    'Fortalecer el vinculo paterno y la practica del canto/coro como anclas de regulacion emocional ya identificadas por la propia adolescente.',
    'Abordar la autoexigencia academica en conjunto con la familia, ajustando expectativas realistas de rendimiento.',
    'Reevaluar en 4-6 semanas la evolucion de la ansiedad anticipatoria y la participacion social y escolar.'
  ].join('\n');

  c.goldstein = JSON.parse(JSON.stringify(DEMO_GOLDSTEIN));

  // Matriz Cognitivo-Atencional: se activa como modulo del caso (aparece
  // el paso propio, despues de Goldstein) y se precarga con datos demo.
  c.modules.matrizCA = true;
  c.matrizCA = Object.assign({aplicado:true, fuente:'manual'}, JSON.parse(JSON.stringify(DEMO_MATRIZCA)));

  // Perfil de personalidad EN FORMACION (hipotesis derivadas, no una prueba).
  c.personalidad = {
    aplicado: true,
    fuente: 'manual',
    dimensiones: [
      { id:'autoconcepto', nombre:'Autoconcepto y autoestima',
        vineta:'El autoconcepto se sostiene en logros concretos (canto, organizacion) pero atraviesa una fisura reciente: la vivencia de haber sido juzgada injustamente introdujo la idea de "ser rara", sin llegar a una autoetiqueta global ni a desesperanza. La autoexigencia previa intensifica el impacto del evento.' },
      { id:'social', nombre:'Incomodidad social y ansiedad interpersonal',
        vineta:'Tras la ruptura del grupo de amigas se observa una cautela relacional marcada: mantiene el deseo de vinculo pero necesita garantias de confidencialidad antes de abrirse. No hay evitacion social generalizada, sino un patron especifico ligado al evento reciente.' },
      { id:'escolar', nombre:'Ajuste escolar y relacion con la autoridad',
        vineta:'El ajuste escolar muestra ansiedad anticipatoria frente a evaluaciones y exposiciones orales, con correlato somatico, sin cuestionamiento de la autoridad docente ni rechazo global al colegio. A confirmar mediante reporte escolar sobre su participacion actual en clase.' },
      { id:'animo', nombre:'Estado animico y malestar reactivo',
        vineta:'El material es compatible con un malestar reactivo a un evento social identificable, con inseguridad situacional ("como si todos me estuvieran juzgando") mas que con un cuadro depresivo instaurado; conserva motivacion e intereses propios.' },
      { id:'familia', nombre:'Vinculos y conflicto familiar',
        vineta:'El vinculo con el padre aparece como el principal recurso regulador explicito ("hablar con mi papa... me ayuda a ver las cosas mas tranquila"). La presion percibida por el rendimiento academico en casa es la principal fuente de tension familiar identificada.' },
      { id:'cambio', nombre:'Disposicion al cambio y recursos terapeuticos',
        vineta:'La disposicion al acompanamiento es favorable: identifica con claridad sus recursos (canto, vinculo paterno, organizacion) y puede nombrar lo que le cuesta sin negarlo, lo que facilita un trabajo terapeutico focalizado.' }
    ],
    sintesis: 'El funcionamiento descrito es principalmente reactivo a un evento social reciente (difusion de un rumor y ruptura de un grupo de amistad) sobre una base de autoexigencia previa, y se expresa como ansiedad anticipatoria frente al desempeno academico y la exposicion social. No hay compromiso de la representacion global de si misma: los puntos fragiles se concentran en el afrontamiento de la critica/acusacion y en la confianza interpersonal; los recursos, en el vinculo paterno, el canto y la capacidad de organizacion. Hipotesis a confirmar mediante entrevista familiar y reporte escolar.'
  };


  c.informe = {
    fuente: 'manual',
    consolidado_integral: 'Valentina atraviesa un periodo de ansiedad relacional y academica desencadenado por la difusion de un rumor en redes sociales que provoco la ruptura de su grupo cercano de amigas, hace cuatro meses. La perdida de confianza interpersonal se combina con una autoexigencia academica previa y con expectativas familiares altas de logro, potenciandose entre si: la ansiedad anticipatoria frente a evaluaciones y exposiciones orales aparece asi vinculada tanto al temor al juicio de los pares como a la presion percibida por el rendimiento. Las respuestas del TRAS, Goldstein y la Matriz Cognitivo-Atencional convergen en que su capacidad cognitiva y su repertorio social basico estan conservados, pero se debilitan especificamente en las situaciones donde debe responder a una critica o acusacion, tolerar el fracaso o exponerse publicamente. La busqueda de apoyo en el padre y la practica del canto en el coro constituyen recursos de regulacion emocional ya identificados por ella misma y disponibles para la intervencion. No aparecen datos que permitan hablar de una desorganizacion global del autoconcepto: conserva motivacion academica, un vinculo familiar solido y capacidad de organizacion. El acompanamiento requiere trabajar de manera coordinada la reconstruccion de la confianza social, el manejo de la ansiedad anticipatoria y el ajuste de expectativas academicas familiares. La formulacion permanece parcial porque varias areas del TRAS no fueron respondidas y se requiere contraste con reporte escolar sobre su participacion actual en clase.',
    hallazgos_convergentes: [
      'La ansiedad anticipatoria ante evaluaciones y exposiciones orales aparece de forma consistente en el TRAS, la Matriz Cognitivo-Atencional y la historia clinica, con correlato somatico (dolor de estomago, dificultad para dormir).',
      'La dificultad para responder ante una acusacion o critica se repite en Goldstein (grupo de afrontamiento del estres) y en el TRAS (respuesta al rumor), coincidiendo con el evento social que origino el caso.',
      'El vinculo paterno y la practica del canto aparecen como recursos protectores consistentes en el TRAS, la personalidad y la Matriz Cognitivo-Atencional.'
    ],
    recursos_protectores: [
      'Vinculo con el padre, vivido como fuente de regulacion emocional y busqueda de ayuda.',
      'Participacion en el coro del colegio, identificada por ella misma como via de regulacion.',
      'Capacidad de organizacion y buen desempeno cognitivo de base.'
    ],
    vulnerabilidades_contextuales: [
      'Ruptura reciente del grupo de amigas por difusion de un rumor en redes sociales.',
      'Expectativas academicas altas en el hogar que intensifican la autoexigencia previa.',
      'Evitacion de exposiciones orales que puede limitar su participacion y evaluacion escolar.'
    ],
    aproximacion_diagnostica: 'El cuadro de Valentina se comprende mejor como una reaccion ansiosa situacional -no como un trastorno de atencion de base- desencadenada por la difusion de un rumor y la ruptura de su grupo de amigas, sobre una autoexigencia academica previa. La Matriz Cognitivo-Atencional muestra un desempeno cognitivo solido (100% en comprension verbal, razonamiento logico y cuantitativo) con caidas puntuales en memoria de trabajo y atencion/inhibicion (67-83%) que coinciden en el tiempo con la rumiacion sobre el evento social, no con un patron atencional persistente desde la infancia. La regulacion emocional concentra la frecuencia e interferencia mas altas del autoinforme, mientras que la hiperactividad y la impulsividad son bajas, lo que aleja la hipotesis de un TDAH de presentacion hiperactiva o combinada. No hay elementos suficientes para sostener una hipotesis diagnostica formal en este momento: se trata de una formulacion provisional que debe revisarse si la ansiedad anticipatoria y las fluctuaciones atencionales persisten una vez resuelto el conflicto social que las origino. Para avanzar hacia cualquier conclusion se requeriria: persistencia de las dificultades atencionales mas alla de la resolucion del conflicto social actual, informacion de reporte escolar sobre atencion sostenida en clase, y descarte de un cuadro de ansiedad como explicacion suficiente antes de considerar cualquier otra hipotesis.',
    sintesis_padres: 'Valentina esta atravesando un momento dificil despues de que un rumor en redes sociales afecto su grupo de amigas mas cercano. Esto, sumado a la exigencia que ella misma se pone con las notas, le esta generando ansiedad antes de examenes y exposiciones, con molestias fisicas como dolor de estomago y dificultad para dormir. Esto no significa que haya perdido sus capacidades: sigue siendo una buena estudiante, organizada, y conserva su gusto por el canto y una relacion cercana con su papa. La dificultad aparece sobre todo cuando siente que la estan juzgando o que puede fallar frente a otros. Es importante acompanarla en reconstruir la confianza con sus companeras a su propio ritmo, sin presionarla a reconciliarse de inmediato, y revisar en familia si las expectativas academicas actuales le estan generando mas presion de la necesaria.',
    recomendaciones_prioritarias: [
      'Espacio terapeutico breve centrado en el manejo de la ansiedad anticipatoria y en el afrontamiento de la critica/acusacion social.',
      'Coordinar con el colegio la verificacion del alcance del rumor y una posible intervencion sobre uso responsable de redes sociales entre pares.',
      'Ajustar en familia las expectativas academicas a un nivel realista, evitando que la autoexigencia se intensifique con la presion externa.',
      'Fortalecer el vinculo paterno y la practica del coro como anclas de regulacion emocional ya disponibles.',
      'Acompanar la reconstruccion gradual de la confianza interpersonal, sin forzar la reconciliacion con el grupo anterior.',
      'Completar las areas no exploradas del TRAS antes de emitir conclusiones definitivas.'
    ],
    cierre: 'El funcionamiento actual parece predominantemente reactivo y situacional. Las dificultades se intensifican cuando coinciden exposicion social, juicio de pares y exigencia academica, pero no comprometen de forma global el autoconcepto ni la capacidad de proyectarse. Valentina conserva recursos cognitivos, familiares y creativos relevantes. El seguimiento debe verificar la evolucion de la ansiedad anticipatoria, la reconstruccion de vinculos de amistad y la participacion escolar, al tiempo que se completan las areas sin datos y se contrasta la formulacion con familia y colegio.'
  };

  // Anexo pegado: un informe corto producido fuera de la app.
  c.anexos = [{
    id: 'anx_demo_escolar',
    titulo: 'Observacion escolar breve (anexo pegado)',
    contenido: '## Contexto de observacion\nRegistro breve de la directora de grupo durante dos semanas de clase regular.\n\n## Hallazgos\n- **Participacion:** ha disminuido su intervencion voluntaria en clase desde hace aproximadamente cuatro meses.\n- **Exposiciones:** solicita en dos ocasiones no pasar al frente o pide hacerlo en pareja.\n- **Interaccion entre pares:** se le observa en el descanso con una companera distinta al grupo previo; sin conductas de aislamiento total.\n\n## Lectura orientativa\nLos hallazgos son *compatibles* con una retraccion puntual asociada al conflicto social reciente, sin senales de aislamiento generalizado ni rechazo al aprendizaje.\n\n1. Contrastar con la familia la evolucion en casa.\n2. Dar seguimiento a la participacion en el proximo periodo.\n\nLos hallazgos son orientativos y no sustituyen la evaluacion directa.',
    incluir: true,
    ts: new Date().toISOString()
  }];

  state.cases = state.cases.filter(x => !(x.isDemo || String(x.meta && x.meta.numero || '').toUpperCase() === 'TRAS-DEMO-001'));
  state.cases.unshift(c);
  state.currentCaseId = c.id;
  persist();
  hydrateInputs();
  renderCaseList();
  renderScopeSelector();
  renderTopNav();
  goStep(2);
  renderReport();
  toast('Caso demo unico cargado o restablecido (incluye TRAS, Goldstein, personalidad y Matriz Cognitivo-Atencional). Tus casos reales permanecen separados.', 'ok', 5400);
}

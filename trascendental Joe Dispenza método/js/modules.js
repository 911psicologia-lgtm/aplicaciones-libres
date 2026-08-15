export const changeQuestions = [
  {
    id: "goal",
    short: "Quiero cambiar",
    title: "¿Qué quieres cambiar en este momento?",
    hint: "Una situación o forma de responder. Escríbela en una o dos frases.",
    placeholder: "Quiero cambiar…",
  },
  {
    id: "pattern",
    short: "Hoy se repite",
    title: "¿Qué haces hoy que mantiene ese patrón?",
    hint: "Nombra solamente lo que suele repetirse, sin analizar toda tu historia.",
    placeholder: "Cuando esto ocurre, suelo…",
  },
  {
    id: "newResponse",
    short: "Quiero responder",
    title: "¿Cómo te gustaría responder de otra manera?",
    hint: "Elige una respuesta concreta que puedas reconocer cuando aparezca.",
    placeholder: "Quiero aprender a…",
  },
  {
    id: "nextStep",
    short: "Primer paso",
    title: "¿Cuál será tu primer paso pequeño?",
    hint: "Algo claro, posible y revisable que puedas intentar esta semana.",
    placeholder: "Mi primer paso será…",
  },
];

export const modules = [
  {
    id: 1,
    verb: "Delimitar",
    original: "Paso 1 · La decisión y el plan",
    title: "Definir una intención sin imitar el riesgo",
    purpose: "Distingue el propósito personal de una promesa de curación.",
    duration: "3–5 min",
    product: "Intención y límite de seguridad",
    concept:
      "Dispenza relata una decisión personal. En esta aplicación se estudia su disciplina mental sin convertir aquella decisión en una recomendación médica.",
    testimony:
      "Tras el accidente, relata que decidió concentrar tiempo y atención en una práctica mental intensiva.",
    evidence:
      "El curso ofrece un testimonio autobiográfico, pero no una historia clínica completa que permita establecer causalidad.",
    limit:
      "Conserva las indicaciones, controles y tratamientos acordados con profesionales.",
    example:
      "Por ejemplo: “Quiero entrenar calma y constancia durante este proceso; mantendré sin cambios las indicaciones profesionales”.",
    animation: "focus",
    practice: [
      "Nombra tu intención.",
      "Reconoce qué cuidado profesional debe permanecer.",
      "Define cuándo detener la práctica.",
    ],
    questions: [
      {
        id: "boundary",
        label: "¿Cuál es tu intención y qué límite de seguridad conservarás?",
        hint: "Una frase para tu propósito y otra para el cuidado que no modificarás.",
      },
    ],
  },
  {
    id: 2,
    verb: "Representar",
    original: "Paso 2 · Construir un modelo preciso",
    title: "Crear una escena mental clara",
    purpose:
      "Elige una función cotidiana segura que puedas representar con claridad.",
    duration: "3–6 min",
    product: "Escena mental segura",
    concept:
      "Una representación mental organiza la atención; no permite diagnosticar ni comprobar qué ocurre dentro del cuerpo.",
    testimony:
      "Afirma que construía mentalmente una imagen muy específica de la columna antes de entregar el resultado a una inteligencia mayor.",
    evidence:
      "La imaginería puede apoyar el ensayo y la atención; el material no demuestra que una imagen mental reconstruya tejidos.",
    limit:
      "Usa información general o profesional y evita interpretar imágenes médicas por cuenta propia.",
    example:
      "Por ejemplo: acción, caminar un tramo ya autorizado; entorno, un pasillo despejado; ritmo, pausado; apoyos, el bastón o acompañamiento indicados; cierre, detener la escena y registrar la atención. Imaginarlo no significa que el cuerpo ya pueda ejecutarlo ni que una estructura interna se haya reparado.",
    animation: "path",
    practice: [
      "Elige una función autorizada.",
      "Añade lugar, ritmo y apoyos.",
      "Cierra la escena sin exigir un resultado.",
    ],
    questions: [
      {
        id: "scene",
        label: "¿Qué escena cotidiana, clara y segura representarás?",
        hint: "Describe la acción, el entorno y los apoyos en pocas líneas.",
      },
    ],
  },
  {
    id: 3,
    verb: "Secuenciar",
    original: "Paso 3 · Recorrer el modelo",
    title: "Ordenar el ensayo mental",
    purpose:
      "Convierte la escena en una secuencia breve que puedas seguir sin esfuerzo.",
    duration: "3–5 min",
    product: "Guion mental breve",
    concept:
      "Dispenza describe un recorrido ordenado. Aquí se conserva la secuencia, pero se adapta a una escena funcional y segura.",
    testimony:
      "Relata que recorría la representación de forma ordenada e intentaba completarla con claridad.",
    evidence:
      "Puede sostenerse la estructura de la práctica: orden, detalle, atención y repetición; no su efecto estructural atribuido.",
    limit:
      "El guion no debe incluir movimientos contraindicados ni pruebas físicas.",
    example:
      "Por ejemplo: 1. me preparo con calma; 2. recorro mentalmente la actividad; 3. cierro la escena y registro cómo fue mi atención.",
    animation: "sequence",
    practice: [
      "Define una entrada tranquila.",
      "Ordena tres momentos.",
      "Añade un cierre reconocible.",
    ],
    questions: [
      {
        id: "sequence",
        label: "¿Cuáles serán los tres momentos de tu escena?",
        hint: "Inicio, desarrollo y cierre; una línea para cada momento.",
      },
    ],
  },
  {
    id: 4,
    verb: "Regresar",
    original: "Paso 4 · Entrenar la presencia",
    title: "Notar la distracción y volver",
    purpose:
      "Elige una señal sencilla para regresar al foco sin comenzar una lucha contigo.",
    duration: "3–5 min",
    product: "Clave de retorno atencional",
    concept:
      "Volver al foco es la habilidad central; distraerse no significa que la práctica haya fallado.",
    testimony:
      "Cuenta que preocupaciones y recuerdos interrumpían su práctica y que, al notarlo, regresaba al recorrido.",
    evidence:
      "El retorno deliberado es coherente con el entrenamiento atencional; no exige eliminar pensamientos.",
    limit: "Detente si la práctica aumenta dolor, mareo o malestar.",
    example:
      "Por ejemplo: si aparece una preocupación, la noto, digo mentalmente “volver” y retomo el último punto claro de la escena.",
    animation: "return",
    practice: [
      "Nota la distracción.",
      "Nómbrala con una palabra.",
      "Regresa al último punto estable.",
    ],
    questions: [
      {
        id: "returnCue",
        label: "¿Qué palabra o señal usarás para regresar al foco?",
        hint: "Por ejemplo: volver, aquí, siguiente paso o una respiración natural.",
      },
    ],
  },
  {
    id: 5,
    verb: "Repetir",
    original: "Paso 5 · Consolidar la atención",
    title: "Practicar con constancia, no con exceso",
    purpose:
      "Define un ritmo breve que pueda sostenerse sin convertirlo en exigencia.",
    duration: "3–10 min",
    product: "Ritmo personal de práctica",
    concept:
      "La repetición vuelve familiar una tarea atencional. Menor duración o mayor facilidad no demuestran reparación física.",
    testimony:
      "Relata que repitió el proceso durante semanas y que, con el tiempo, pudo completarlo en menos tiempo.",
    evidence:
      "La familiaridad y la fluidez pueden cambiar con la práctica; el relato no prueba el mecanismo de recuperación física.",
    limit:
      "Más tiempo no equivale a mayor beneficio; evita practicar a través del dolor o el agotamiento.",
    example:
      "Por ejemplo: practico cinco minutos tres veces por semana y reviso después si la duración sigue siendo cómoda y útil.",
    animation: "cycle",
    practice: [
      "Elige una duración breve.",
      "Define una frecuencia flexible.",
      "Revísala después de una semana.",
    ],
    questions: [
      {
        id: "rhythm",
        label: "¿Qué duración y frecuencia te resultan realistas?",
        hint: "Ejemplo: cinco minutos, tres veces por semana; siempre revisable.",
      },
    ],
  },
  {
    id: 6,
    verb: "Soltar",
    original: "Paso 6 · Entregar el resultado",
    title: "Diferenciar intención y control",
    purpose: "Reconoce qué depende de ti y qué resultado no puedes garantizar.",
    duration: "3–5 min",
    product: "Declaración de apertura",
    concept:
      "“Entregar” puede leerse como práctica espiritual o como aceptación de la incertidumbre, no como mecanismo biológico demostrado.",
    testimony:
      "Afirma que, después de formar una imagen clara, entregaba el resultado a una inteligencia mayor.",
    evidence:
      "Es una interpretación espiritual personal y no una explicación científica comprobada de reparación corporal.",
    limit:
      "Aceptar incertidumbre no significa ignorar síntomas, evaluaciones o indicaciones profesionales.",
    example:
      "Por ejemplo: depende de mí practicar y registrar; no depende de mí garantizar el tiempo ni el resultado del proceso corporal.",
    animation: "release",
    practice: [
      "Nombra lo que sí harás.",
      "Reconoce lo que no controlas.",
      "Cierra sin buscar una señal inmediata.",
    ],
    questions: [
      {
        id: "lettingGo",
        label: "¿Qué depende de ti y qué necesitas dejar sin controlar?",
        hint: "Responde con dos frases breves.",
      },
    ],
  },
  {
    id: 7,
    verb: "Ensayar",
    original: "Paso 7 · Habitar una posibilidad futura",
    title: "Imaginar una función cotidiana",
    purpose:
      "Ensaya mentalmente una acción segura sin confundir imaginarla con poder ejecutarla.",
    duration: "3–6 min",
    product: "Escena funcional futura",
    concept:
      "La escena futura puede orientar atención y conducta; no comprueba por sí misma una capacidad física.",
    testimony:
      "Relata que se imaginaba de pie, realizando actividades cotidianas y sintiendo esa posibilidad como presente.",
    evidence:
      "El ensayo mental se usa como complemento en contextos específicos; su utilidad depende de la condición y del plan profesional.",
    limit: "No pruebes físicamente una acción solo porque pudiste imaginarla.",
    example:
      "Por ejemplo: imagino una acción cotidiana ya autorizada, con los apoyos previstos y una sensación de confianza tranquila, sin ejecutarla durante el ejercicio mental.",
    animation: "future",
    practice: [
      "Elige una acción permitida.",
      "Incluye apoyos y pausas.",
      "Asocia una emoción tranquila.",
    ],
    questions: [
      {
        id: "futureAction",
        label: "¿Qué acción cotidiana autorizada quieres ensayar mentalmente?",
        hint: "Incluye los apoyos necesarios y una emoción moderada.",
      },
    ],
  },
  {
    id: 8,
    verb: "Contrastar",
    original: "Paso 8 · Observar y verificar",
    title: "Registrar sin confundir experiencia y prueba",
    purpose:
      "Separa lo que sientes, lo que realmente haces y lo que informa una evaluación profesional.",
    duration: "3–6 min",
    product: "Registro de evidencias",
    concept:
      "Una experiencia personal es valiosa, pero no establece por sí sola la causa de un cambio.",
    testimony:
      "Dispenza relata cambios progresivos y atribuye su recuperación a la práctica; el curso no aporta verificación clínica independiente completa.",
    evidence:
      "Sensación, función y evidencia clínica son categorías distintas y deben conservarse separadas.",
    limit:
      "Los cambios de salud deben revisarse con profesionales; esta aplicación no diagnostica ni interpreta pruebas.",
    example:
      "Por ejemplo: subjetivo, “me sentí más concentrado”; funcional, “realicé una actividad autorizada”; profesional, “esto fue informado en mi revisión”.",
    animation: "evidence",
    practice: [
      "Anota una sensación.",
      "Registra una función realmente realizada.",
      "Separa la información profesional.",
    ],
    questions: [
      {
        id: "evidenceNote",
        label: "¿Qué observarás por separado?",
        hint: "Escribe: sensación personal / función realizada / información profesional.",
      },
    ],
  },
];

export const foundations = [
  {
    id: 1,
    title: "Entendiendo el poder de la mente",
    role: "Introduce la relación que el curso propone entre pensamiento, emoción, personalidad y experiencia.",
    use: "Ayuda a formular la intención mental.",
    status: "Marco conceptual del curso; no demuestra reparación estructural.",
  },
  {
    id: 2,
    title: "No creas todo lo que piensas",
    role: "Trabaja la distancia frente a pensamientos automáticos.",
    use: "Sustenta la habilidad de notar distracciones y regresar.",
    status:
      "Compatible con entrenamiento atencional cuando evita afirmaciones absolutas.",
  },
  {
    id: 3,
    title: "La ciencia de cambiar de opinión",
    role: "Relaciona aprendizaje, repetición y cambio de patrones.",
    use: "Apoya la repetición y revisión de la práctica.",
    status:
      "La neuroplasticidad no equivale a regeneración vertebral por pensamiento.",
  },
  {
    id: 4,
    title: "Diseñando una nueva dirección",
    role: "Propone intención, ensayo y creación de un modelo futuro.",
    use: "Aporta estructura para el guion mental.",
    status:
      "La intención puede orientar la conducta; no garantiza resultados físicos.",
  },
  {
    id: 5,
    title: "Dominando la materia",
    role: "Busca interrumpir respuestas habituales y ensayar otras posibilidades.",
    use: "Ayuda a distinguir automatismo de respuesta deliberada.",
    status:
      "Las referencias mente-materia se conservan como lenguaje del curso.",
  },
  {
    id: 6,
    title: "Rindiéndose al momento presente",
    role: "Desarrolla presencia, apertura y menor intento de controlar el resultado.",
    use: "Explica el paso de soltar o entregar.",
    status:
      "Puede leerse como práctica contemplativa, no como mecanismo médico.",
  },
  {
    id: 7,
    title: "Autosanación y despertar del alma",
    role: "Contiene el relato del accidente, la práctica y el resultado atribuido por Dispenza.",
    use: "Es la fuente principal del método de la columna.",
    status:
      "Testimonio autobiográfico sin verificación clínica completa en el material.",
  },
  {
    id: 8,
    title: "Integración y continuidad",
    role: "Reúne aprendizaje, práctica diaria y observación de cambios.",
    use: "Sustenta el contraste entre experiencia, función y evidencia.",
    status:
      "La integración debe mantener seguimiento profesional y límites de seguridad.",
  },
];

export const glossary = [
  [
    "Testimonio",
    "Relato de una persona sobre lo que vivió; no demuestra por sí solo la causa de un resultado.",
  ],
  [
    "Representación mental",
    "Ensayo interno de una escena o acción. No es una imagen diagnóstica del cuerpo.",
  ],
  [
    "Presencia",
    "Capacidad de notar la experiencia actual y regresar deliberadamente al foco.",
  ],
  ["Evidencia subjetiva", "Sensación o percepción informada por la persona."],
  [
    "Evidencia funcional",
    "Cambio observable en una actividad realizada de forma segura.",
  ],
  [
    "Evidencia clínica",
    "Hallazgo obtenido y valorado mediante evaluación profesional.",
  ],
  [
    "Práctica complementaria",
    "Actividad que puede acompañar el cuidado, pero no reemplaza diagnóstico, seguimiento ni tratamiento profesional.",
  ],
];

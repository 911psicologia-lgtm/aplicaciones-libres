(function () {
  'use strict';
  const STAI = window.STAI = window.STAI || {};

  const stateOptions = [
    { value: 0, label: 'Nada' },
    { value: 1, label: 'Algo' },
    { value: 2, label: 'Bastante' },
    { value: 3, label: 'Mucho' }
  ];

  const traitOptions = [
    { value: 0, label: 'Casi nunca' },
    { value: 1, label: 'A veces' },
    { value: 2, label: 'A menudo' },
    { value: 3, label: 'Casi siempre' }
  ];

  const stateItems = [
    [1, 'Me siento calmado'],
    [2, 'Me siento seguro'],
    [3, 'Estoy tenso'],
    [4, 'Estoy contrariado'],
    [5, 'Me siento cómodo (estoy a gusto)'],
    [6, 'Me siento alterado'],
    [7, 'Estoy preocupado ahora por posibles desgracias futuras'],
    [8, 'Me siento descansado'],
    [9, 'Me siento angustiado'],
    [10, 'Me siento confortable'],
    [11, 'Tengo confianza en mí mismo'],
    [12, 'Me siento nervioso'],
    [13, 'Estoy desasosegado'],
    [14, 'Me siento muy «atado» (como oprimido)'],
    [15, 'Estoy relajado'],
    [16, 'Me siento satisfecho'],
    [17, 'Estoy preocupado'],
    [18, 'Me siento aturdido y sobreexcitado'],
    [19, 'Me siento alegre'],
    [20, 'En este momento me siento bien']
  ].map(function (row) { return { id: row[0], text: row[1] }; });

  const traitItems = [
    [21, 'Me siento bien'],
    [22, 'Me canso rápidamente'],
    [23, 'Siento ganas de llorar'],
    [24, 'Me gustaría ser tan feliz como otros'],
    [25, 'Pierdo oportunidades por no decidirme pronto'],
    [26, 'Me siento descansado'],
    [27, 'Soy una persona tranquila, serena y sosegada'],
    [28, 'Veo que las dificultades se amontonan y no puedo con ellas'],
    [29, 'Me preocupo demasiado por cosas sin importancia'],
    [30, 'Soy feliz'],
    [31, 'Suelo tomar las cosas demasiado seriamente'],
    [32, 'Me falta confianza en mí mismo'],
    [33, 'Me siento seguro'],
    [34, 'No suelo afrontar las crisis o dificultades'],
    [35, 'Me siento triste (melancólico)'],
    [36, 'Estoy satisfecho'],
    [37, 'Me rondan y molestan pensamientos sin importancia'],
    [38, 'Me afectan tanto los desengaños que no puedo olvidarlos'],
    [39, 'Soy una persona estable'],
    [40, 'Cuando pienso sobre asuntos y preocupaciones actuales me pongo tenso y agitado']
  ].map(function (row) { return { id: row[0], text: row[1] }; });

  const directState = [3, 4, 6, 7, 9, 12, 13, 14, 17, 18];
  const directTrait = [22, 23, 24, 25, 28, 29, 31, 32, 34, 35, 37, 38, 40];

  const aiProviders = [
    ['ChatGPT', 'https://chatgpt.com/'],
    ['Gemini', 'https://gemini.google.com/'],
    ['Claude', 'https://claude.ai/'],
    ['Perplexity', 'https://www.perplexity.ai/'],
    ['Copilot', 'https://copilot.microsoft.com/'],
    ['Grok', 'https://grok.com/'],
    ['Poe', 'https://poe.com/'],
    ['You.com', 'https://you.com/'],
    ['DeepSeek', 'https://chat.deepseek.com/'],
    ['Mistral', 'https://chat.mistral.ai/']
  ];

  const demo = {
    patient: {
      name: 'Laura Mendoza',
      code: 'DEMO-001',
      birthDate: '1992-04-18',
      sex: 'Mujer',
      gender: 'Mujer',
      normGroup: 'Adulto/a',
      country: 'Colombia',
      education: 'Profesional universitaria',
      occupation: 'Diseñadora gráfica independiente',
      modality: 'Autoaplicada supervisada',
      context: 'Consulta por tensión reciente, preocupación persistente y dificultad para desconectarse de las demandas cotidianas.',
      observations: 'Caso sintético de demostración. No corresponde a una persona real.'
    },
    history: 'Caso completamente ficticio. Laura, de 34 años, consulta por aumento reciente de tensión, preocupaciones laborales y dificultad para desconectarse mentalmente al finalizar la jornada. Durante los últimos tres meses ha asumido nuevas responsabilidades laborales y familiares. Describe sueño irregular, anticipación frecuente de problemas y tendencia a revisar repetidamente decisiones tomadas. Mantiene funcionamiento laboral, relaciones familiares estables y actividades recreativas los fines de semana. Señala como recursos personales el apoyo de su pareja, ejercicio regular y capacidad para reconocer cuándo necesita disminuir el ritmo de trabajo. No refiere antecedentes psiquiátricos relevantes ni situaciones actuales de riesgo.',
    responses: {
      1:1,2:1,3:3,4:2,5:1,6:2,7:3,8:1,9:2,10:1,11:1,12:3,13:2,14:2,15:1,16:1,17:3,18:2,19:1,20:1,
      21:1,22:2,23:1,24:2,25:2,26:1,27:1,28:2,29:3,30:1,31:2,32:2,33:1,34:1,35:1,36:1,37:2,38:2,39:1,40:2
    },
    aiJson: {
      version: 'STAI-IA-1.0',
      resumen_integrado: 'El patrón de demostración sugiere una activación ansiosa actual relevante en un contexto de sobrecarga reciente, junto con una tendencia de preocupación que merece exploración clínica sin asumir causalidad única. El funcionamiento conservado, el apoyo interpersonal y las estrategias de autocuidado aparecen como moduladores importantes.',
      lectura_estado: 'La Ansiedad-Estado puede comprenderse, de forma hipotética, en relación con la acumulación reciente de demandas, el sueño irregular y la anticipación de problemas. Estos factores podrían amplificarse entre sí y sostener la activación del momento.',
      lectura_rasgo: 'La Ansiedad-Rasgo sugiere explorar una disposición relativamente estable hacia la preocupación, especialmente ante incertidumbre y exigencias de desempeño. La información disponible no permite determinar por sí sola si esta tendencia constituye un problema clínico.',
      relacion_estado_rasgo: 'El nivel actual parece apoyarse tanto en condiciones situacionales recientes como en una posible predisposición a anticipar dificultades. La relación debe contrastarse con entrevista y seguimiento temporal.',
      factores_contextuales: [
        {factor:'Sobrecarga reciente',tipo:'desencadenante',evidencia:'Aumento de responsabilidades laborales y familiares durante tres meses.',relacion:'Puede incrementar tensión y reducir recuperación.',peso:8},
        {factor:'Sueño irregular',tipo:'mantenedor',evidencia:'Refiere irregularidad del sueño.',relacion:'Puede retroalimentar fatiga, vigilancia y reactividad.',peso:7},
        {factor:'Anticipación de problemas',tipo:'vulnerabilidad',evidencia:'Preocupación y revisión repetida de decisiones.',relacion:'Puede sostener activación incluso fuera de situaciones concretas.',peso:8},
        {factor:'Apoyo de pareja',tipo:'protector',evidencia:'Identifica apoyo interpersonal estable.',relacion:'Puede amortiguar sobrecarga y facilitar regulación.',peso:7},
        {factor:'Ejercicio regular',tipo:'recurso',evidencia:'Mantiene actividad física.',relacion:'Funciona como estrategia de regulación y recuperación.',peso:6}
      ],
      hipotesis_clinicas: [
        {hipotesis:'La activación actual podría estar siendo sostenida por un bucle entre sobrecarga, anticipación y sueño irregular.',evidencia_a_favor:['Nuevas responsabilidades','Sueño irregular','Anticipación frecuente'],evidencia_en_contra:['Funcionamiento laboral conservado','Actividades recreativas mantenidas'],como_contrastar:'Explorar variación de síntomas en días de menor demanda y relación temporal con el sueño.'}
      ],
      recursos_protectores: ['Apoyo de pareja','Ejercicio regular','Capacidad para reconocer límites','Funcionamiento laboral conservado'],
      alertas: [],
      preguntas_clinicas_sugeridas: ['¿En qué momentos del día aumenta la preocupación y qué ocurre justo antes?','¿Qué cambia en la activación cuando duerme mejor?','¿Qué responsabilidades podrían redistribuirse temporalmente?'],
      recomendaciones_evaluacion: ['Contrastar el patrón con entrevista clínica','Revisar temporalidad de síntomas y sueño','Explorar estrategias de regulación ya efectivas'],
      limites_interpretativos: 'Caso sintético de demostración. La contextualización no constituye diagnóstico y debe contrastarse con información clínica real.',
      dimensiones_contextuales: [
        {nombre:'Activación actual',valor:8},{nombre:'Preocupación',valor:8},{nombre:'Tensión',valor:7},{nombre:'Vulnerabilidad contextual',valor:7},{nombre:'Regulación',valor:6},{nombre:'Apoyo',valor:7},{nombre:'Recursos',valor:7}
      ],
      relaciones: [
        {origen:'Sobrecarga reciente',destino:'Anticipación de problemas',tipo:'amplifica'},
        {origen:'Anticipación de problemas',destino:'Sueño irregular',tipo:'retroalimenta'},
        {origen:'Sueño irregular',destino:'Activación actual',tipo:'puede aumentar'},
        {origen:'Apoyo de pareja',destino:'Activación actual',tipo:'puede amortiguar'},
        {origen:'Ejercicio regular',destino:'Regulación',tipo:'favorece'}
      ],
      informe_sencillo: {
        interpretacion_instrumento: 'Los resultados del STAI muestran una activación ansiosa actual que requiere ser leída en relación con el momento de aplicación, junto con una tendencia de preocupación que aporta contexto sobre la forma habitual de responder ante exigencias. La diferencia entre Estado y Rasgo orienta a considerar que una parte importante de la activación observada se vincula con condiciones recientes, sin que el instrumento permita establecer por sí solo un diagnóstico.',
        relaciones_estado_actual: [
          'Factor contribuyente: el aumento reciente de responsabilidades laborales y familiares coincide temporalmente con el incremento de tensión referido y ofrece un contexto relevante para comprender la Ansiedad-Estado.',
          'Factor mantenedor plausible sustentado en la historia aportada: el sueño irregular puede contribuir a sostener fatiga, vigilancia y reactividad durante el periodo evaluado.',
          'Relación asociativa: la anticipación frecuente de problemas y la revisión repetida de decisiones aparecen vinculadas al patrón de preocupación descrito, sin que el STAI demuestre causalidad entre estos elementos.',
          'Factores moduladores: el apoyo de pareja, el ejercicio regular y la capacidad de reconocer límites pueden amortiguar la sobrecarga y favorecer regulación.'
        ],
        conclusion_final: 'En conjunto, el perfil obtenido es compatible con una elevación de la activación ansiosa actual en un contexto de demandas recientes y preocupación sostenida. La información disponible permite describir factores contribuyentes y moduladores, pero no atribuir una causa única ni formular diagnóstico a partir del STAI. Los resultados deben integrarse con entrevista y demás fuentes disponibles según la finalidad de la evaluación.'
      }
    }
  };

  STAI.data = {
    stateOptions: stateOptions,
    traitOptions: traitOptions,
    stateItems: stateItems,
    traitItems: traitItems,
    directState: directState,
    directTrait: directTrait,
    aiProviders: aiProviders,
    demo: demo
  };
}());

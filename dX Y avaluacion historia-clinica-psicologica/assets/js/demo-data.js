/**
 * ============================================
 * HISTORIA CLÍNICA PSICOLÓGICA INTEGRAL
 * Datos de demostración — 1 caso completo
 * ============================================
 * Se carga UNA SOLA VEZ si no hay pacientes en la BD.
 * No sobreescribe datos reales existentes.
 */

const DEMO_DATA = {

  patient: {
    historyNumber: 'HC-000001',
    openingDate: '2025-03-10',
    firstName: 'Laura Sofía',
    lastName: 'Mendoza Reyes',
    document: '1098456789',
    birthDate: '1990-07-14',
    gender: 'F',
    maritalStatus: 'soltera',
    education: 'universitaria',
    occupation: 'Diseñadora gráfica independiente',
    phone: '3001234567',
    email: 'laura.mendoza@correo.com',
    address: 'Cra 15 #45-22, Barrio El Prado, Armenia, Quindío',

    consent: {
      consent1: true, consent2: true, consent3: true, consent4: true,
      consent5: true, consent6: true, consent7: true, consent8: true,
      date: '2025-03-10',
      signer: 'Laura Sofía Mendoza Reyes',
      signerType: 'paciente'
    },

    consultationReason: 'La paciente refiere dificultades para concentrarse en su trabajo, episodios recurrentes de tristeza sin causa aparente, alteraciones del sueño de aproximadamente 4 meses de evolución y sensación persistente de vacío. Manifiesta: "Siento que nada me da satisfacción, me cuesta levantarme y enfrento mis proyectos con mucha dificultad".',

    problemHistory: 'Primer episodio depresivo reportado a los 24 años tras ruptura sentimental, manejado sin intervención profesional. Antecedente familiar de depresión en madre (diagnóstico a los 40 años, en tratamiento farmacológico). Niega hospitalizaciones previas, conductas autolesivas o intentos de suicidio. Consumo ocasional de alcohol en contextos sociales (máximo 2 veces por mes). Niega consumo de sustancias psicoactivas.',

    clinicalFormulation: {
      hypothesis: 'Se hipotetiza un episodio depresivo mayor moderado (F32.1 / 296.22) precipitado por acumulación de estresores laborales y relacionales, sobre una base de vulnerabilidad temperamental caracterizada por alta sensibilidad emocional y tendencia al perfeccionismo.',
      relationalDynamics: 'Patrón vincular marcado por hiperdependencia emocional en relaciones de pareja y distancia afectiva con figura paterna ausente. Relación con la madre ambivalente: fuente de apoyo pero también de crítica. Red de apoyo social reducida por aislamiento progresivo en los últimos meses.',
      repetitivePatterns: 'Ciclo disfuncional recurrente: sobrecarga de responsabilidades → agotamiento → autocrítica intensa → evitación → aislamiento → incremento de la tristeza. Tendencia a posponer necesidades propias en función de demandas externas.',
      riskFactors: 'Antecedente familiar de depresión. Aislamiento social progresivo. Estresores laborales crónicos (ingresos irregulares, incertidumbre). Baja tolerancia a la frustración. Patrón de sueño irregular.',
      protectiveFactors: 'Alta inteligencia emocional en situaciones de terceros. Motivación genuina de cambio. Capacidad reflexiva y buena insight. Red de pares artísticos. Actividad física esporádica que reconoce como beneficiosa.',
      subjectiveResources: 'Creatividad como vía de elaboración emocional. Sentido del humor presente en entrevista. Disciplina autodidacta para el aprendizaje de nuevas habilidades. Valoración positiva del proceso terapéutico desde la primera sesión.',
      systemicTensions: 'Tensión entre el deseo de independencia económica y la inestabilidad propia del trabajo freelance. Expectativas familiares sobre estabilidad laboral convencional que generan conflicto con su proyecto de vida.',
      complexObservations: 'Se observa disociación leve entre contenido verbal (minimiza síntomas al iniciar) y expresión no verbal (voz pausada, contacto visual intermitente, postura de cierre). La paciente tiene dificultad para identificar emociones en tiempo real aunque puede elaborarlas retrospectivamente con facilidad.'
    },

    guardian: null,
    createdAt: '2025-03-10T09:30:00.000Z',
    updatedAt: '2025-03-10T09:30:00.000Z'
  },

  sessions: [
    {
      date: '2025-03-10',
      sessionNumber: 1,
      modality: 'presencial',
      duration: '50',
      format: 'soap',
      centralTheme: 'Evaluación inicial y establecimiento de vínculo terapéutico',
      patientResponse: 'La paciente se mostró colaboradora aunque con cierta reserva inicial. Hacia la segunda mitad de la sesión aumentó la apertura emocional, permitiéndose llorar al referir la sensación de vacío. Refiere que "nunca había hablado de esto con tanta claridad".',
      progressEvaluation: 'inicio',
      homework: 'Registro diario de estados de ánimo (escala 1-10) y actividades realizadas durante la semana. Identificar al menos una actividad que antes disfrutaba e intentar realizarla brevemente.',
      clinicalSummary: 'Primera sesión de evaluación y acogida. Se establecen rapport y encuadre terapéutico. Se aplica entrevista clínica semiestructurada. Impresión clínica: episodio depresivo moderado con componente ansioso secundario. Se propone abordaje cognitivo-conductual con elementos de terapia de aceptación y compromiso.',
      soapSubjective: 'Paciente refiere tristeza persistente, anhedonia, hipersomnia (duerme 10-11 horas sin sentirse descansada) y dificultad de concentración que afecta su productividad laboral. Califica su estado de ánimo en 3/10.',
      soapObjective: 'Paciente bien orientada en tiempo, espacio y persona. Aspecto cuidado, contacto visual intermitente. Discurso pausado, coherente, con tono bajo. Afecto restringido pero reactivo a contenido emocional. Sin alteraciones perceptuales. Sin ideación suicida activa.',
      soapAssessment: 'Cuadro compatible con episodio depresivo mayor moderado. PHQ-9 pendiente de aplicación formal. Funcionalidad laboral comprometida (produce aproximadamente 50% de su capacidad habitual). Sin factores de riesgo inmediato.',
      soapPlan: 'Inicio de proceso terapéutico con frecuencia semanal. Psicoeducación sobre el modelo cognitivo de la depresión. Registro conductual como primera tarea. Evaluar necesidad de interconsulta psiquiátrica en sesión 3 según evolución.',
      nextAppointment: { date: '2025-03-17', time: '10:00' },
      psychiatryEnabled: false,
      isClosed: false,
      createdAt: '2025-03-10T10:30:00.000Z',
      updatedAt: '2025-03-10T10:30:00.000Z'
    },
    {
      date: '2025-03-17',
      sessionNumber: 2,
      modality: 'presencial',
      duration: '50',
      format: 'soap',
      centralTheme: 'Psicoeducación cognitiva y revisión del registro conductual',
      patientResponse: 'Llegó con el registro conductual completo y detallado, lo que evidencia compromiso con el proceso. Mostró curiosidad genuina ante el modelo cognitivo. Identificó el pensamiento automático "no sirvo para nada" como recurrente durante la semana, especialmente ante errores laborales menores.',
      progressEvaluation: 'estable',
      homework: 'Registro de pensamientos automáticos usando la columna triple (situación / pensamiento / emoción). Realizar al menos 20 minutos de caminata al día durante 5 días de la semana.',
      clinicalSummary: 'Segunda sesión centrada en psicoeducación del modelo ABC cognitivo y revisión del registro semanal. La paciente logra identificar conexiones entre pensamientos, emociones y conductas con facilidad. Se introduce el registro de pensamientos automáticos como herramienta de autoobservación.',
      soapSubjective: 'Refiere mejoría leve en estado de ánimo (4/10 vs 3/10 semana anterior). Reporta haber retomado escuchar música y caminar una vez. Persiste la hipersomnia pero con menor sensación de agotamiento al despertar. Mantiene dificultad de concentración.',
      soapObjective: 'Mayor contacto visual respecto a sesión anterior. Postura más abierta. Sonrisa esporádica al comentar logros de la semana. Discurso más fluido. Afecto levemente ampliado. Sin alteraciones conductuales de riesgo.',
      soapAssessment: 'Leve mejoría en afectividad y retoma gradual de actividades placenteras. PHQ-9 aplicado: puntaje 14 (depresión moderada). Buena alianza terapéutica. Responde favorablemente a la psicoeducación cognitiva.',
      soapPlan: 'Continuar con registro de pensamientos automáticos. Introducir reestructuración cognitiva básica en próxima sesión. Mantener activación conductual con incremento gradual. Reevaluar en 4 sesiones para decidir sobre interconsulta psiquiátrica.',
      nextAppointment: { date: '2025-03-24', time: '10:00' },
      psychiatryEnabled: false,
      isClosed: false,
      createdAt: '2025-03-17T10:30:00.000Z',
      updatedAt: '2025-03-17T10:30:00.000Z'
    }
  ],

  assessment: {
    instrument: 'PHQ-9 (Patient Health Questionnaire)',
    professional: 'Psic. Demo Usuario',
    date: '2025-03-17',
    status: 'completada',
    scores: 'Puntaje total: 14/27\nÍtem 1 (Anhedonia): 2\nÍtem 2 (Ánimo deprimido): 2\nÍtem 3 (Sueño): 2\nÍtem 4 (Cansancio): 2\nÍtem 5 (Apetito): 1\nÍtem 6 (Culpa): 2\nÍtem 7 (Concentración): 2\nÍtem 8 (Psicomotricidad): 0\nÍtem 9 (Ideación suicida): 0',
    interpretation: 'Puntaje 14: Depresión moderada (rango 10-14). La paciente presenta afectación significativa en anhedonia, ánimo deprimido, alteraciones del sueño y concentración. Sin ideación suicida. Se recomienda continuar seguimiento psicológico semanal y reevaluar en 4 semanas. No se indica intervención farmacológica de urgencia en este momento.',
    attachment: null,
    createdAt: '2025-03-17T11:00:00.000Z',
    updatedAt: '2025-03-17T11:00:00.000Z'
  },

  diagnosis: {
    primaryDiagnosis: [
      {
        system: 'DSM-5-TR',
        code: '296.22',
        name: 'Trastorno depresivo mayor, episodio único, moderado',
        description: 'Episodio depresivo mayor único de intensidad moderada con anhedonia predominante, alteraciones del sueño y funcionalidad laboral comprometida.'
      }
    ],
    secondaryDiagnoses: [
      {
        system: 'CIE-11',
        code: '6A70',
        name: 'Trastorno depresivo de episodio único, moderado',
        description: 'Clasificación CIE-11 complementaria.'
      }
    ],
    clinicalJustification: 'La paciente cumple criterios diagnósticos para episodio depresivo mayor moderado (DSM-5-TR 296.22 / CIE-11 6A70): humor depresivo la mayor parte del día casi todos los días, anhedonia marcada, hipersomnia, fatiga, dificultad de concentración y sentimientos de inutilidad, con duración mayor a 4 meses y deterioro funcional significativo en área laboral. No se evidencia episodio maníaco o hipomaníaco previo. Ausencia de ideación suicida activa. PHQ-9: 14 (moderado).',
    differentialDiagnosis: 'Se descarta Trastorno Adaptativo por duración superior a 6 meses y severidad de síntomas. Se descarta hipotiroidismo (la paciente refiere examen de tiroides normal hace 8 meses). Se mantiene en observación la posibilidad de componente distímico subyacente (evaluación a largo plazo).',
    manualNotes: 'Pendiente evaluación de Trastorno de Personalidad con instrumento SCID-5-PD a partir de sesión 8 una vez estabilizado el episodio agudo.',
    createdAt: '2025-03-17T11:15:00.000Z',
    updatedAt: '2025-03-17T11:15:00.000Z'
  }
};

/**
 * Carga los datos demo si la BD está vacía.
 * Retorna true si se cargaron, false si ya había datos.
 */
async function loadDemoDataIfEmpty() {
  try {
    await db.init();
    const patients = await db.getAll(STORES.PATIENTS);
    if (patients.length > 0) return false; // Ya hay datos reales

    // 1. Insertar paciente
    const patientId = await db.add(STORES.PATIENTS, DEMO_DATA.patient);

    // 2. Insertar sesiones
    for (const session of DEMO_DATA.sessions) {
      await db.add(STORES.SESSIONS, { ...session, patientId });
    }

    // 3. Insertar evaluación
    await db.add(STORES.ASSESSMENTS, { ...DEMO_DATA.assessment, patientId });

    // 4. Insertar diagnóstico
    await db.add(STORES.DIAGNOSES, { ...DEMO_DATA.diagnosis, patientId });

    console.log('[DEMO] Caso de demostración cargado — ID paciente:', patientId);
    return true;
  } catch(e) {
    console.error('[DEMO] Error cargando datos demo:', e);
    return false;
  }
}

window.loadDemoDataIfEmpty = loadDemoDataIfEmpty;

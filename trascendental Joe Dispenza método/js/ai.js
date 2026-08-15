export const expected = {
  schemaVersion: "4.0",
  applicationContext:
    "Nombre del proceso corporal elegido; Columna si se conserva el caso de origen.",
  summary: "Síntesis breve, educativa y no diagnóstica.",
  changeProcess: {
    title: "Mi proceso de cambio",
    integratedNarrative:
      "Narrativa integrada construida únicamente con las cuatro respuestas de la persona.",
    startingPoint: "Qué desea cambiar.",
    repeatedPattern: "Qué respuesta se repite actualmente.",
    desiredResponse: "Cómo quiere responder de otra manera.",
    nextStep: "Primer paso pequeño y revisable.",
    resources: [
      "Recursos presentes solo cuando estén sustentados por las respuestas.",
    ],
  },
  methodApplication: {
    title: "Mi guía de atención para el proceso corporal",
    integratedNarrative:
      "Cómo el mapa personal dialoga con atención, representación, repetición, ensayo y contraste en el contexto elegido.",
    attentionMethod: "Cómo detecta distracciones y regresa al foco.",
    mentalRepresentation: "Escena mental clara y segura.",
    futureRehearsal: "Acción funcional autorizada que ensaya mentalmente.",
    observedEvidence: {
      subjective: ["Sensaciones informadas"],
      functional: ["Acciones realmente observadas"],
      clinical: ["Información atribuida a evaluación profesional"],
    },
    uncertainties: ["Aspectos que no pueden concluirse."],
    professionalCare: ["Límites o cuidados que deben conservarse."],
    nextSafeStep: "Próximo paso breve y compatible con atención profesional.",
  },
  methodSteps: [
    {
      step: 1,
      name: "Nombre del paso",
      learning: "Aprendizaje sustentado en la respuesta",
    },
  ],
  observedPatterns: [
    {
      name: "Patrón descriptivo",
      evidence: ["Evidencia textual"],
      confidence: "medium",
    },
  ],
  reflectiveQuestions: [
    "Máximo tres preguntas realmente necesarias para continuar",
  ],
  nextPractice: {
    title: "Práctica contemplativa breve",
    instruction: "Instrucción segura",
    durationMinutes: 5,
  },
  epistemicNotes: [
    "Diferencias entre testimonio, experiencia, función y evidencia clínica.",
  ],
};

export function payload(process, report) {
  return {
    schemaVersion: "4.0",
    task: "integrate_change_process_and_adaptable_body_attention_guide",
    instruction:
      "Construye un informe claro en dos secciones conectadas. Usa caseContext únicamente como contexto confirmado y no lo amplíes, interpretes ni conviertas en recomendación médica. Primera: 'Mi proceso de cambio', usando exclusivamente las cuatro respuestas personalChange; no inventes antecedentes, causas, diagnósticos, recursos ni avances. Segunda: una guía de atención aplicada al proceso indicado en processApplication. Conserva la columna como caso autobiográfico de origen, pero no presupongas que la experiencia de Dispenza se traslada médicamente a otro proceso corporal. Integra únicamente las notas de methodSteps y los registros disponibles. Explica cómo el propósito personal puede dialogar con atención, representación mental, retorno al foco, repetición prudente, aceptación de incertidumbre, ensayo mental de una función ya autorizada y contraste de evidencias. No diseñes ejercicios físicos ni recomiendes movimientos. No repitas la misma idea en varios campos. Mantén frases concretas y comprensibles. Separa estrictamente: (1) testimonio autobiográfico de Dispenza, (2) sensaciones subjetivas, (3) cambios funcionales realmente observados y (4) evidencia clínica atribuida a profesionales. No afirmes que meditación, visualización, emoción, energía, neuroplasticidad o campo cuántico reparan tejidos. No diagnostiques, interpretes imágenes médicas, recomiendes tratamientos ni sugieras suspender atención profesional. Si falta información, usa 'No hay información suficiente'. Devuelve únicamente JSON válido con exactamente la estructura de outputShape, sin Markdown ni texto adicional.",
    priorities: [
      "changeProcess.integratedNarrative",
      "changeProcess.nextStep",
      "methodApplication.integratedNarrative",
      "methodApplication.observedEvidence",
      "methodApplication.nextSafeStep",
    ],
    outputShape: expected,
    constraints: {
      noDiagnosis: true,
      noTreatmentAdvice: true,
      noStructuralHealingClaims: true,
      noInventedPersonalHistory: true,
      noRepetition: true,
      preserveProfessionalCare: true,
      separateEvidenceLevels: true,
    },
    sourceFrame: {
      status:
        "El relato de Dispenza es autobiográfico y el material del curso no ofrece verificación clínica completa.",
      allowedInterpretation:
        "Práctica complementaria de atención, representación, afrontamiento y registro.",
    },
    processApplication: process.application,
    caseContext: process.caseContext || null,
    personalChange: process.change,
    methodSteps: report.sections.map((section) => ({
      step: section.id,
      name: section.verb,
      product: section.product,
      synthesis: section.synthesis,
      answer: section.findings[0],
    })),
    practiceLogs: process.logs,
  };
}

export function validate(value) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value))
    return ["La respuesta debe ser un objeto JSON."];
  if (value.schemaVersion !== "4.0") errors.push("schemaVersion debe ser 4.0.");
  if (
    typeof value.applicationContext !== "string" ||
    value.applicationContext.trim().length < 3
  )
    errors.push("applicationContext está incompleto.");
  if (typeof value.summary !== "string" || value.summary.trim().length < 50)
    errors.push("summary debe tener al menos 50 caracteres.");

  const change = value.changeProcess;
  if (!change || typeof change !== "object")
    errors.push("changeProcess debe ser un objeto.");
  else {
    for (const field of [
      "title",
      "integratedNarrative",
      "startingPoint",
      "repeatedPattern",
      "desiredResponse",
      "nextStep",
    ]) {
      if (typeof change[field] !== "string" || change[field].trim().length < 8)
        errors.push(`changeProcess.${field} está incompleto.`);
    }
    if (
      typeof change.integratedNarrative === "string" &&
      change.integratedNarrative.trim().length < 150
    )
      errors.push(
        "changeProcess.integratedNarrative necesita mayor integración.",
      );
    if (!Array.isArray(change.resources))
      errors.push("changeProcess.resources debe ser una lista.");
  }

  const method = value.methodApplication;
  if (!method || typeof method !== "object")
    errors.push("methodApplication debe ser un objeto.");
  else {
    for (const field of [
      "title",
      "integratedNarrative",
      "attentionMethod",
      "mentalRepresentation",
      "futureRehearsal",
      "nextSafeStep",
    ]) {
      if (typeof method[field] !== "string" || method[field].trim().length < 8)
        errors.push(`methodApplication.${field} está incompleto.`);
    }
    if (
      !method.observedEvidence ||
      typeof method.observedEvidence !== "object" ||
      !["subjective", "functional", "clinical"].every((key) =>
        Array.isArray(method.observedEvidence[key]),
      )
    )
      errors.push(
        "methodApplication.observedEvidence debe separar evidencia subjetiva, funcional y clínica.",
      );
    for (const field of ["uncertainties", "professionalCare"])
      if (!Array.isArray(method[field]))
        errors.push(`methodApplication.${field} debe ser una lista.`);
  }

  for (const field of [
    "methodSteps",
    "observedPatterns",
    "reflectiveQuestions",
    "epistemicNotes",
  ])
    if (!Array.isArray(value[field]))
      errors.push(`${field} debe ser una lista.`);
  if (
    !value.nextPractice ||
    typeof value.nextPractice !== "object" ||
    typeof value.nextPractice.title !== "string" ||
    typeof value.nextPractice.instruction !== "string" ||
    typeof value.nextPractice.durationMinutes !== "number" ||
    value.nextPractice.durationMinutes < 3 ||
    value.nextPractice.durationMinutes > 10
  )
    errors.push("nextPractice debe ser una práctica segura de 3 a 10 minutos.");

  const statements = JSON.stringify(value).split(/[.!?;]+/);
  const unsafe = statements.some((statement) => {
    const structural =
      /(?:meditaci[oó]n|visualizaci[oó]n|mente|energ[ií]a|campo cu[aá]ntico).{0,70}(?:repar[óa]|regener[óa]|cur[óa])|(?:suspende|abandona|reemplaza).{0,50}(?:tratamiento|cirug[ií]a|atenci[oó]n m[eé]dica)/i.test(
        statement,
      );
    const negated =
      /(?:no |sin |carece de |no existe |no hay |no demuestra|no significa|no permite|no puede|evita |proh[ií]be)/i.test(
        statement,
      );
    return structural && !negated;
  });
  if (unsafe)
    errors.push(
      "La respuesta contiene una afirmación de curación estructural o sustitución de atención profesional.",
    );
  return errors;
}

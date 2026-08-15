const KEY = "presencia-cloudflare-v1";
export const newProcess = (title = "Mi proceso de cambio", version = 1) => ({
  id: crypto.randomUUID(),
  title,
  version,
  methodVersion: 3,
  application: { type: "spine", name: "Columna" },
  change: { goal: "", pattern: "", newResponse: "", nextStep: "" },
  current: 1,
  completed: [],
  answers: {},
  logs: [],
  ai: null,
  courseArchive: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const demoProcess = () => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    demoId: "andres-columna-v1",
    demo: true,
    title: "Caso demostrativo · Andrés",
    version: 1,
    methodVersion: 3,
    application: { type: "spine", name: "Columna" },
    caseContext: {
      alias: "Andrés",
      origin:
        "Caso demostrativo construido con información confirmada y presentado bajo seudónimo.",
      conditionSummary:
        "Anterolistesis ístmica grado I L5-S1, colapso discal L5-S1, cambios Modic I, abombamiento discal amplio, artrosis facetaria y compromiso neuroforaminal bilateral con afectación de raíces L5.",
      livedExperience:
        "Dolor lumbar crónico, síntomas radiculares y dificultad para la marcha como parte del punto de partida informado.",
      professionalCare:
        "Seguimiento médico y neuroquirúrgico, con manejo conservador. Se informó una respuesta percibida como positiva a la quinesiología y la quiropraxia.",
      functionalDirection:
        "Recuperar seguridad funcional y retomar caminatas paulatinamente, siempre según orientación profesional.",
    },
    change: {
      goal: "Quiero recuperar seguridad y continuidad en mis actividades cotidianas, comprendiendo mejor mi condición lumbar sin reducir todo el proceso al dolor.",
      pattern:
        "Cuando aparecen molestias o incertidumbre, tiendo a observar cada señal, anticipar escenarios y querer controlar el resultado; eso puede saturarme y volver más pesado el proceso.",
      newResponse:
        "Quiero responder con atención serena: reconocer las señales, respetar los límites, seguir el acompañamiento profesional y valorar avances funcionales verificables.",
      nextStep:
        "Realizaré una práctica breve de atención y llevaré un registro sencillo de sensación, función e información profesional, sin modificar por mi cuenta el plan acordado.",
    },
    current: 1,
    completed: [1, 2, 3, 4, 5, 6, 7, 8],
    answers: {
      1: {
        boundary:
          "Mi intención es recuperar confianza y constancia. Mantendré el seguimiento médico y no modificaré tratamientos, límites ni actividades por cuenta propia.",
      },
      2: {
        scene:
          "Imagino una caminata progresiva ya autorizada: un lugar seguro, ritmo pausado, los apoyos indicados y la posibilidad de detenerme. La escena no supone que la columna ya se reparó.",
      },
      3: {
        sequence:
          "Inicio: me ubico y recuerdo el límite profesional. Desarrollo: recorro mentalmente la actividad autorizada con calma. Cierre: termino la escena y registro qué ocurrió con mi atención.",
      },
      4: {
        returnCue:
          "Cuando aparezca la urgencia por controlar el resultado, usaré la palabra «presente» y regresaré al último punto claro de la escena.",
      },
      5: {
        rhythm:
          "Haré una práctica de atención de tres minutos, tres veces por semana. Registraré la sesión sin convertir la frecuencia en una exigencia física.",
      },
      6: {
        lettingGo:
          "Depende de mí practicar, registrar y comunicar cambios. No depende de mí garantizar un resultado ni interpretar por mi cuenta lo que ocurre en la estructura lumbar.",
      },
      7: {
        futureAction:
          "Ensayaré mentalmente una actividad cotidiana ya autorizada —desplazarme con seguridad y atender mi jornada— incluyendo apoyos, pausas y una sensación de calma moderada.",
      },
      8: {
        evidenceNote:
          "Subjetivo: cómo percibo dolor, calma o confianza. Funcional: qué actividad autorizada realicé y con qué tolerancia. Profesional: qué fue observado o indicado en una evaluación.",
      },
    },
    logs: [
      {
        methodStep: "8",
        practice: "Registro inicial del caso demostrativo",
        distractions: "Sin dato consignado.",
        subjective:
          "Se informó una mejoría percibida con el manejo conservador recibido.",
        functional:
          "No se consignó una medición funcional específica en este registro inicial.",
        clinical:
          "Condición lumbar estructural confirmada y seguimiento médico/neuroquirúrgico en curso.",
        focus: "",
        minutes: "—",
        source: "demo",
        date: now,
      },
    ],
    ai: null,
    courseArchive: null,
    createdAt: now,
    updatedAt: now,
  };
};
export const defaults = () => ({
  user: "",
  active: 0,
  theme: "dark",
  fontSize: 1,
  onboardingDone: false,
  processes: [],
});
export function load() {
  try {
    return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults();
  }
}
export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
export function exportState(state) {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          format: "presencia-backup",
          version: 1,
          exportedAt: new Date().toISOString(),
          state,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "presencia-respaldo.json";
  a.click();
  URL.revokeObjectURL(url);
}
export async function importState(file) {
  const value = JSON.parse(await file.text());
  if (value.format !== "presencia-backup" || !value.state?.processes)
    throw new Error("Formato de respaldo no reconocido");
  return value.state;
}
export function reset() {
  localStorage.removeItem(KEY);
}

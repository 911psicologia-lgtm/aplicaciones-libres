import {
  changeQuestions,
  modules,
  foundations as courseFoundations,
  glossary,
} from "./modules.js";
import {
  load,
  save,
  newProcess,
  demoProcess,
  exportState,
  importState,
  reset,
} from "./storage.js";
import {
  buildReport,
  downloadReport,
  downloadHtmlReport,
  downloadDocReport,
} from "./report.js";
import { payload, validate } from "./ai.js";

const root = document.querySelector("#app");
let state = load();
let view = {
  screen: "splash",
  changeStep: 0,
  moduleStep: 0,
  openReport: null,
  toast: "",
  modal: false,
  aiRaw: "",
  aiErrors: [],
  aiStep: 1,
  onboarding: 0,
  help: false,
  dictating: "",
};
let installPrompt = null;
let activeRecognition = null;
let exerciseTimer = null;
let exerciseDuration = 180;
let exerciseRemaining = 180;
let guideVoiceRate = 1;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
const active = () => state.processes[state.active];
const persist = () => save(state);
function notify(text) {
  view.toast = text;
  render();
  setTimeout(() => {
    view.toast = "";
    render();
  }, 2200);
}
function stopExerciseTimer() {
  if (exerciseTimer) {
    clearInterval(exerciseTimer);
    exerciseTimer = null;
  }
}
function resetExerciseTimer(seconds = exerciseDuration) {
  stopExerciseTimer();
  exerciseDuration = seconds;
  exerciseRemaining = seconds;
}
function setScreen(screen) {
  stopExerciseTimer();
  stopGuideVoice();
  view.screen = screen;
  view.moduleStep = 0;
  view.openReport = null;
  render();
  scrollTo({ top: 0, behavior: "smooth" });
}
function stopGuideVoice() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
function guideVoiceText(module, process) {
  return `${module.verb}. ${module.title}. ${module.concept} Ejemplo aplicado a ${applicationName(process)}: ${module.example} Ahora realiza la práctica. ${module.practice.join(". ")} Límite de seguridad: ${module.limit}`;
}
function playGuideVoice(module, process) {
  if (
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    notify("La lectura en voz no está disponible en este navegador");
    return;
  }
  stopGuideVoice();
  const utterance = new SpeechSynthesisUtterance(
    guideVoiceText(module, process),
  );
  utterance.lang = "es-CO";
  utterance.rate = guideVoiceRate;
  window.speechSynthesis.speak(utterance);
  notify(`Guía en voz · velocidad ${guideVoiceRate}×`);
}
function applicationName(p = active()) {
  return p.application?.type === "other"
    ? p.application.name || "Mi proceso corporal"
    : "Columna";
}
function simplifyColumnAnswers(answers = {}) {
  const join = (...parts) =>
    parts
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" · ");
  return {
    1: {
      boundary:
        answers[1]?.boundary ||
        join(
          answers[1]?.learningGoal,
          answers[1]?.safetyBoundary,
          answers[1]?.medicalPlan,
        ),
    },
    2: {
      scene:
        answers[2]?.scene ||
        join(answers[2]?.representation, answers[2]?.details),
    },
    3: {
      sequence:
        answers[3]?.sequence ||
        join(answers[3]?.start, answers[3]?.sequence, answers[3]?.finish),
    },
    4: {
      returnCue:
        answers[4]?.returnCue ||
        join(answers[4]?.earlySignal, answers[4]?.returnCue),
    },
    5: {
      rhythm:
        answers[5]?.rhythm || join(answers[5]?.duration, answers[5]?.frequency),
    },
    6: {
      lettingGo:
        answers[6]?.lettingGo ||
        join(answers[6]?.agency, answers[6]?.uncontrolled, answers[6]?.meaning),
    },
    7: {
      futureAction:
        answers[7]?.futureAction ||
        join(
          answers[7]?.futureAction,
          answers[7]?.supports,
          answers[7]?.emotion,
        ),
    },
    8: {
      evidenceNote:
        answers[8]?.evidenceNote ||
        join(
          answers[8]?.subjectiveSignals,
          answers[8]?.functionalSignals,
          answers[8]?.professionalEvidence,
        ),
    },
  };
}
function ensureProcess() {
  if (!state.processes.length) state.processes = [newProcess()];
  if (state.active >= state.processes.length) state.active = 0;
  state.processes = state.processes.map((p) => {
    const legacyMethod = !p.methodVersion;
    const archive =
      p.courseArchive ||
      (legacyMethod
        ? {
            current: p.current || 1,
            completed: p.completed || [],
            answers: p.answers || {},
            ai: p.ai || null,
            archivedAt: new Date().toISOString(),
          }
        : null);
    const old = archive?.answers || {};
    const change = {
      goal: p.change?.goal || old[1]?.change || old[3]?.capacity || "",
      pattern: p.change?.pattern || old[1]?.pattern || old[5]?.old || "",
      newResponse:
        p.change?.newResponse || old[2]?.alternative || old[5]?.action || "",
      nextStep:
        p.change?.nextStep || old[8]?.commitment || old[3]?.practice || "",
    };
    const answers = legacyMethod
      ? {}
      : p.methodVersion === 1
        ? simplifyColumnAnswers(p.answers)
        : p.answers || {};
    const application = p.application || { type: "spine", name: "Columna" };
    return {
      ...p,
      methodVersion: 3,
      application,
      change,
      courseArchive: archive,
      current: legacyMethod ? 1 : p.current || 1,
      completed: legacyMethod ? [] : p.completed || [],
      answers,
      logs: p.logs || [],
    };
  });
  persist();
}
function updateProcess(next) {
  state.processes[state.active] = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  persist();
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  render();
});
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
setTimeout(() => {
  if (state.user) {
    ensureProcess();
    if (!state.onboardingDone) view.onboarding = 1;
    setScreen("home");
  } else setScreen("login");
}, 900);

function shell(content) {
  const p = active();
  return `<div class="app ${esc(state.theme)}" style="font-size:${Number(state.fontSize) || 1}rem">
 <header><button class="brand" data-screen="home"><span>✦</span> Presencia</button><button class="process-pill" data-screen="processes"><small>Proceso activo</small><b>${esc(p.title)}</b><span>⌄</span></button>
 <nav>${[
   ["home", "Inicio"],
   ["change", "Orientación"],
   ["route", "Guía corporal"],
   ["foundations", "PDF"],
   ["logs", "Registros"],
   ["ai", "Impulso IA"],
   ["reports", "Informe"],
 ]
   .map(
     ([s, l]) =>
       `<button data-screen="${s}" class="${view.screen === s ? "active" : ""}">${l}</button>`,
   )
   .join("")}</nav>
 <div class="user"><span>${esc(state.user[0]?.toUpperCase())}</span><button data-screen="settings">${esc(state.user)}⌄</button><button class="help" data-action="help" aria-label="Ayuda de esta pantalla">?</button></div></header>
 <main>${content}</main><button class="fab" data-action="new-version" aria-label="Crear nueva versión"><span>＋</span><b>Nueva versión</b></button>${view.modal ? versionModal() : ""}${view.help ? helpModal() : ""}${view.onboarding > 0 ? onboardingModal() : ""}${view.toast ? `<div class="toast">✓ ${esc(view.toast)}</div>` : ""}</div>`;
}
function render() {
  if (view.screen === "splash") {
    root.innerHTML = `<div class="splash"><div>✦</div><h1>Presencia</h1><p>Del cambio personal a la práctica corporal</p></div>`;
    return;
  }
  if (view.screen === "login") {
    root.innerHTML = login();
    return;
  }
  ensureProcess();
  const pages = {
    home,
    processes,
    change: changeProcess,
    route,
    foundations,
    module: moduleView,
    logs,
    progress,
    ai,
    reports,
    settings,
    manual,
  };
  root.innerHTML = shell((pages[view.screen] || home)());
}
function login() {
  return `<div class="login"><section><div class="brand"><span>✦</span> Presencia</div><p class="eyebrow">CAMBIO · ATENCIÓN · CUERPO</p><h1>Una guía de atención adaptable a tu proceso corporal.</h1><p>La columna es el caso de origen. Tú podrás conservarlo o adaptar la guía a otro proceso corporal acompañado profesionalmente.</p><form id="login-form"><label>¿Cómo quieres que te llamemos?<input name="name" required autofocus placeholder="Tu nombre o alias"></label><button class="primary">Comenzar</button></form><small>Los datos se guardan únicamente en este navegador.</small></section><aside><div class="orbit">${modules.map((m) => `<span>${m.id}</span>`).join("")}</div><blockquote>La atención y el ensayo mental acompañan el proceso; no reemplazan la rehabilitación indicada.</blockquote></aside></div>`;
}
function caseContextCard(p, compact = false) {
  const c = p.caseContext;
  if (!c) return "";
  return `<section class="panel case-context ${compact ? "compact" : ""}"><div class="case-context-head"><div><p class="eyebrow">CASO DEMOSTRATIVO · SEUDÓNIMO</p><h2>${esc(c.alias)} · proceso de columna</h2><p>${esc(c.origin)}</p></div><span>DEMO</span></div><div class="case-context-grid"><article><small>CONDICIÓN INFORMADA</small><p>${esc(c.conditionSummary)}</p></article><article><small>EXPERIENCIA DE PARTIDA</small><p>${esc(c.livedExperience)}</p></article><article><small>ACOMPAÑAMIENTO</small><p>${esc(c.professionalCare)}</p></article><article><small>DIRECCIÓN FUNCIONAL</small><p>${esc(c.functionalDirection)}</p></article></div><p class="case-context-limit">La ficha organiza información ya proporcionada. No interpreta estudios, no prescribe rehabilitación y no presenta la práctica mental como causa de reparación estructural.</p></section>`;
}
function demoLaunch(p) {
  if (p.demo)
    return `${caseContextCard(p, true)}<div class="demo-actions"><button class="secondary" data-screen="processes">Volver a mis procesos</button><button class="primary" data-screen="reports">Ver informe del demo →</button></div>`;
  return `<section class="panel demo-launch"><div><p class="eyebrow">CASO COMPLETO PARA EXPLORAR</p><h2>Conoce a Andrés</h2><p>Un caso demostrativo de columna con las cuatro respuestas, los ocho pasos y un registro inicial ya integrados. Utiliza un seudónimo y deja la IA pendiente para realizarla manualmente.</p></div><button class="primary" data-action="open-demo">Abrir demo completo →</button></section>`;
}
function home() {
  const p = active(),
    area = applicationName(p),
    changeDone = changeQuestions.filter((q) =>
      String(p.change?.[q.id] || "").trim(),
    ).length,
    methodPercentage = Math.round((p.completed.length / 8) * 100);
  const orientation = `<article class="panel journey-stage ${changeDone === 4 ? "done" : ""}"><span>◎</span><div><small>ORIENTACIÓN PERSONAL · 4 PAUSAS OPCIONALES</small><h2>Ubica tu punto de partida</h2><p>Una intención, un patrón, una nueva respuesta y un paso pequeño. Puedes completar o saltar cada pausa.</p><div class="progress"><span style="width:${(changeDone / 4) * 100}%"></span></div><b>${changeDone}/4 notas guardadas</b></div><button class="secondary" data-screen="change">${changeDone ? "Revisar orientación" : "Orientar mi recorrido"} →</button></article>`;
  const guide = `<article class="panel journey-stage column-stage current"><span>▶</span><div><small>GUÍA PRINCIPAL · 8 SESIONES</small><h2>Continuar mi guía de ${esc(area)}</h2><p>En cada sesión: orientación en voz, práctica animada y una nota opcional solamente al final.</p><div class="progress"><span style="width:${methodPercentage}%"></span></div><b>${p.completed.length}/8 sesiones recorridas</b></div><button class="primary" data-screen="route">Entrar a la guía →</button></article>`;
  const dashboard = `<section class="dashboard"><article><i>🔊</i><div><small>ACOMPAÑAMIENTO</small><h3>Escuchar y seguir</h3><p>Lectura en voz con velocidad ajustable y una sesión por pantalla.</p></div><button data-screen="route">Continuar</button></article><article><i>◷</i><div><small>BITÁCORA</small><h3>${p.logs.length} sesiones guardadas</h3><p>Registros separados de las prácticas; las notas reflexivas son opcionales.</p></div><button data-screen="logs">Ver registros</button></article><article><i>⇩</i><div><small>INFORME</small><h3>HTML · DOC · PDF</h3><p>Guarda una página autónoma, un documento para Word o una copia impresa.</p></div><button data-screen="reports">Abrir informe</button></article></section>`;
  return `<section class="page home-intro"><p class="eyebrow">PRESENCIA · VERSIÓN ${p.version}${p.demo ? " · DEMO" : ""}</p><h1>Una guía para acompañar<br>tu proceso corporal.</h1><p class="lead">Aquí no vienes a llenar un cuestionario. Entras a una sesión, recibes orientación, practicas y decides si quieres conservar una nota.</p></section>${demoLaunch(p)}<div class="journey-bridge">${guide}<div class="journey-arrow" aria-hidden="true">·</div>${orientation}</div>${dashboard}<div class="home-help"><button data-action="help">¿Cómo funciona?</button><button data-screen="manual">Abrir manual</button></div>${epistemic()}`;
}
function applicationPicker(p) {
  const other = p.application?.type === "other";
  return `<section class="panel application-picker"><div><p class="eyebrow">¿DÓNDE QUIERES APLICAR LA GUÍA?</p><h2>Elige el contexto corporal</h2><p>La columna es el caso de origen. Si eliges otro proceso, los ejemplos y el informe utilizarán ese nombre.</p></div><label>Ámbito<select data-application-type><option value="spine" ${!other ? "selected" : ""}>Columna · caso de origen</option><option value="other" ${other ? "selected" : ""}>Otro proceso corporal o de rehabilitación</option></select></label>${other ? `<label>Nombre breve<input data-application-name value="${esc(p.application?.name || "")}" placeholder="Ej.: movilidad de hombro, recuperación de marcha…"></label>` : ""}<small>La aplicación no prescribe movimientos. Cualquier práctica física pertenece al plan profesional.</small></section>`;
}
function changeProcess() {
  const p = active(),
    index = Math.max(0, Math.min(changeQuestions.length - 1, view.changeStep)),
    q = changeQuestions[index],
    answered = changeQuestions.filter((item) =>
      String(p.change?.[item.id] || "").trim(),
    ).length;
  return (
    pageHead(
      "ORIENTACIÓN INICIAL",
      "Tu punto de partida",
      "Cuatro pausas breves ayudan a que la guía hable de tu proceso. No es una evaluación: puedes escribir una frase o continuar y volver después.",
    ) +
    applicationPicker(p) +
    `<section class="panel change-wizard guided-orientation"><div class="change-progress"><span>Pausa ${index + 1} de 4</span><b>${answered}/4 notas guardadas</b><div class="progress"><i style="width:${((index + 1) / 4) * 100}%"></i></div></div><div class="change-dots">${changeQuestions.map((item, i) => `<button data-change-step="${i}" class="${i === index ? "on" : ""} ${String(p.change?.[item.id] || "").trim() ? "done" : ""}" aria-label="Ir a ${esc(item.short)}"><span>${String(p.change?.[item.id] || "").trim() ? "✓" : i + 1}</span><small>${esc(item.short)}</small></button>`).join("")}</div><div class="change-question"><p class="eyebrow">UNA PAUSA PARA UBICARTE · ${esc(q.short)}</p><h2>${esc(q.title)}</h2><p>${esc(q.hint)}</p><div class="answer-example"><b>Un ejemplo para orientarte</b><p>${["Quiero acompañar este proceso con más calma y constancia.", "Cuando me preocupo, intento apresurar o controlar el resultado.", "Quiero volver al presente y seguir el plan paso a paso.", "Esta semana haré una práctica breve y guardaré un registro."][index]}</p></div>${speechField({ change: q.id, value: p.change?.[q.id] || "", placeholder: q.placeholder })}<p class="orientation-permission">Puedes escribir, dictar o dejar esta pausa pendiente. La guía continuará.</p></div><div class="module-nav"><button class="secondary" data-action="change-prev" ${index === 0 ? "disabled" : ""}>← Anterior</button><span>No hay respuestas correctas</span><button class="primary" data-action="${index === 3 ? "change-finish" : "change-next"}">${index === 3 ? "Entrar a mi recorrido" : "Continuar"} →</button></div></section><aside class="change-bridge-note"><span>▶</span><div><b>Después comienza la guía de ${esc(applicationName(p))}</b><p>Cada sesión te orientará, leerá las indicaciones, iniciará una práctica y solo al final ofrecerá una nota opcional.</p></div></aside>`
  );
}
function miniMap(p) {
  return `<div class="minimap">${modules.map((m) => `<button data-module="${m.id}" class="${p.current === m.id ? "now" : ""} ${p.completed.includes(m.id) ? "done" : ""}"><span>${p.completed.includes(m.id) ? "✓" : m.id}</span><b>${m.verb}</b></button>`).join("")}</div>`;
}
function processes() {
  return (
    pageHead(
      "MIS PROCESOS Y VERSIONES",
      "Elige y administra tus aplicaciones del método",
      "Cada versión conserva pasos, prácticas, análisis e informes.",
    ) +
    `<div class="screen-guide"><b>¿Qué puedes hacer?</b><span>Abre, renombra, duplica o elimina un proceso. La eliminación siempre pide confirmación.</span><button data-action="new-version">Crear otro</button></div><div class="process-grid">${state.processes.map((p, i) => `<article class="panel ${i === state.active ? "selected" : ""}"><button class="process-open" data-process="${i}"><span>V${p.version}</span><div><small>APLICACIÓN · ${esc(applicationName(p).toUpperCase())}</small><h2>${esc(p.title)}</h2><p>${p.completed.length} de 8 pasos · ${p.logs.length} prácticas</p><small>Creado ${new Date(p.createdAt).toLocaleDateString("es-CO")}</small></div><b>${i === state.active ? "Activo" : "Abrir"} →</b></button><footer><button data-action="rename-process" data-index="${i}">Renombrar</button><button data-action="duplicate-process" data-index="${i}">Duplicar</button><button class="danger-text" data-action="delete-process" data-index="${i}" ${state.processes.length === 1 ? "disabled" : ""}>Eliminar</button></footer></article>`).join("")}</div>`
  );
}
function route() {
  const p = active(),
    area = applicationName(p),
    c = p.change || {},
    changeDone = changeQuestions.filter((q) =>
      String(c[q.id] || "").trim(),
    ).length,
    next = modules[p.current - 1];
  return (
    pageHead(
      "TU RECORRIDO GUIADO",
      "Una sesión a la vez",
      `La guía te acompaña en ocho sesiones aplicadas a ${esc(area)}. Primero orienta, después conduce la práctica y al final ofrece un registro opcional.`,
    ) +
    caseContextCard(p) +
    `<section class="panel guide-now"><div class="guide-now-number">${next.id}</div><div><p class="eyebrow">${p.completed.includes(next.id) ? "SESIÓN PARA REPASAR" : "TU SIGUIENTE SESIÓN"}</p><h2>${esc(next.verb)} · ${esc(next.title)}</h2><p>${esc(next.purpose)}</p><div class="guide-now-meta"><span>◷ ${esc(next.duration)}</span><span>🔊 guía en voz</span><span>◎ práctica animada</span><span>✎ nota opcional</span></div></div><button class="primary" data-module="${next.id}">Comenzar sesión guiada →</button></section><div class="column-bridge panel"><div><small>CONTEXTO ELEGIDO · ${changeDone}/4 PAUSAS INICIALES</small><h2>${esc(area)}</h2><p>${changeDone ? `Tu intención registrada: “${esc(c.goal || "Aún por completar")}”.` : `Puedes comenzar la guía incluso sin completar las pausas iniciales.`}</p></div><button class="secondary" data-screen="change">Revisar orientación</button></div><div class="source-banner panel"><b>Caso de origen: columna</b><span>La adaptación a ${esc(area)} se limita a atención, representación y registro. No prescribe movimientos ni traslada afirmaciones de curación.</span><button data-screen="foundations">Ver fundamentos</button></div><h2 class="route-section-title">Todas las sesiones</h2><div class="route-grid method-route">${modules.map((m) => `<article class="${p.current === m.id ? "selected" : ""}"><span>${p.completed.includes(m.id) ? "✓" : m.id}</span><div><small>SESIÓN ${m.id} · ${esc(m.duration)}</small><h2>${m.verb}: ${m.title}</h2><p>${m.purpose}</p><footer><b>Orientación → práctica → cierre opcional</b></footer></div><button data-module="${m.id}">${p.completed.includes(m.id) ? "Repasar sesión" : "Comenzar"} →</button></article>`).join("")}</div>`
  );
}
function foundations() {
  return (
    pageHead(
      "LOS OCHO PDF",
      "Fundamentos del curso",
      "Los módulos originales explican el lenguaje conceptual del método. Aquí se muestran como apoyo, no como ocho etapas equivalentes.",
    ) +
    `<div class="foundation-grid">${courseFoundations.map((f) => `<article class="panel"><span>${f.id}</span><div><small>MÓDULO ${f.id}</small><h2>${esc(f.title)}</h2><p>${esc(f.role)}</p><dl><dt>APORTE AL MÉTODO</dt><dd>${esc(f.use)}</dd><dt>LECTURA CRÍTICA</dt><dd>${esc(f.status)}</dd></dl></div></article>`).join("")}</div>${epistemic()}`
  );
}
function speechField({
  name = "",
  answer = "",
  change = "",
  value = "",
  required = false,
  placeholder = "Escribe o dicta aquí…",
}) {
  const key = change || answer || name;
  return `<div class="speech-field"><textarea ${name ? `name="${name}"` : ""} ${answer ? `data-answer="${answer}"` : ""} ${change ? `data-change="${change}"` : ""} ${required ? "required" : ""} placeholder="${esc(placeholder)}">${esc(value)}</textarea><button type="button" class="mic" data-dictate="${key}" aria-label="Dictar respuesta">🎙 Dictar</button></div>`;
}
function moduleNav() {
  return `<div class="module-nav"><button class="secondary" data-step="${Math.max(0, view.moduleStep - 1)}" ${view.moduleStep === 0 ? "disabled" : ""}>← Anterior</button><span>Una idea por paso</span>${view.moduleStep < 2 ? `<button class="primary" data-step="${view.moduleStep + 1}">Continuar →</button>` : ""}</div>`;
}
function exerciseTime() {
  const minutes = Math.floor(exerciseRemaining / 60),
    seconds = exerciseRemaining % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function exerciseVisual(type) {
  if (type === "evidence")
    return `<div class="exercise-animation evidence" id="exercise-animation"><span>S</span><span>F</span><span>P</span></div>`;
  return `<div class="exercise-animation ${esc(type)} ${exerciseTimer ? "running" : ""}" id="exercise-animation">${Array.from({ length: 5 }, (_, i) => `<span style="--i:${i}"></span>`).join("")}</div>`;
}
function guideAudioControls() {
  return `<div class="guide-audio"><button class="primary" data-action="listen-guide">🔊 Escuchar esta guía</button><label>Velocidad<select data-guide-speed><option value="1" ${guideVoiceRate === 1 ? "selected" : ""}>1×</option><option value="1.5" ${guideVoiceRate === 1.5 ? "selected" : ""}>1.5×</option><option value="1.8" ${guideVoiceRate === 1.8 ? "selected" : ""}>1.8×</option><option value="2" ${guideVoiceRate === 2 ? "selected" : ""}>2×</option></select></label><button class="secondary" data-action="stop-guide">Detener voz</button></div>`;
}
function guidedExercise(m, p) {
  return `${guideAudioControls()}<section class="guided-exercise session-first"><div class="exercise-copy"><p class="eyebrow">SESIÓN GUIADA · SOLO ATENCIÓN</p><h3>${esc(m.verb)} durante ${esc(applicationName(p))}</h3><p>Escucha o lee cada indicación, sigue la animación y deja que la guía marque el ritmo. No realices movimientos físicos durante esta sesión.</p><ol>${m.practice.map((x) => `<li>${esc(x)}</li>`).join("")}</ol><div class="guide-reminder"><b>Tu única tarea ahora</b><p>Seguir la secuencia con amabilidad. No tienes que responder ninguna pregunta mientras practicas.</p></div></div><div class="exercise-player">${exerciseVisual(m.animation)}<strong id="exercise-time">${exerciseTime()}</strong><label>Duración<select data-exercise-duration><option value="60" ${exerciseDuration === 60 ? "selected" : ""}>1 minuto</option><option value="180" ${exerciseDuration === 180 ? "selected" : ""}>3 minutos</option><option value="300" ${exerciseDuration === 300 ? "selected" : ""}>5 minutos</option></select></label><div class="exercise-actions"><button class="primary" data-action="exercise-start">${exerciseTimer ? "Sesión en curso…" : "Comenzar sesión"}</button><button class="secondary" data-action="exercise-pause">Pausar</button><button class="secondary" data-action="exercise-reset">Reiniciar</button></div><button class="save-practice" data-action="exercise-save">Guardar esta sesión en mi bitácora</button></div></section>`;
}
function moduleView() {
  const p = active(),
    m = modules[p.current - 1],
    a = p.answers[m.id] || {},
    area = applicationName(p),
    labels = ["Orientarte", "Practicar", "Cerrar"],
    head = `<div class="module-head"><button data-screen="route">←</button><div><small>${esc(area.toUpperCase())} · SESIÓN ${m.id}</small><h1>${m.verb}</h1></div><div class="steps">${labels.map((label, x) => `<span class="${x <= view.moduleStep ? "on" : ""}" title="${label}">${x + 1}<i>${label}</i></span>`).join("")}</div><button class="context-help" data-action="help">¿Cómo funciona?</button></div>`;
  if (view.moduleStep === 0)
    return `<section class="module">${head}<div class="panel reading method-reading"><div class="session-welcome"><div><p class="eyebrow">ORIENTACIÓN DE LA SESIÓN ${m.id}</p><h2>${m.title}</h2><p>${m.purpose}</p></div><div><small>DURACIÓN</small><b>${esc(m.duration)}</b><small>AL CERRAR</small><b>${esc(m.product)}</b></div></div>${guideAudioControls()}<div class="concept"><b>EN PALABRAS SIMPLES</b><p>${m.concept}</p></div><div class="plain-example"><small>UN EJEMPLO APLICADO A · ${esc(area.toUpperCase())}</small><p>${esc(m.example)}</p></div><details class="source-details"><summary>Comprender el caso de origen y su evidencia</summary><div class="method-source"><article><small>QUÉ RELATA DISPENZA</small><p>${esc(m.testimony)}</p></article><article><small>QUÉ PODEMOS SOSTENER</small><p>${esc(m.evidence)}</p></article></div></details><div class="medical-limit"><b>LÍMITE DE SEGURIDAD</b><p>${esc(m.limit)}</p></div>${moduleNav()}</div></section>`;
  if (view.moduleStep === 1)
    return `<section class="module">${head}<div class="panel questions compact-question"><div class="step-intro"><p class="eyebrow">AHORA SÍ · TU SESIÓN GUIADA</p><h2>Deja que la práctica vaya primero</h2><p>La escritura aparecerá después, como cierre opcional.</p></div>${guidedExercise(m, p)}<section class="optional-reflection"><p class="eyebrow">AL TERMINAR · NOTA OPCIONAL</p><h3>Si algo quedó claro, puedes conservarlo aquí</h3><p>No necesitas responder para completar la sesión. Esta nota solo personaliza tu bitácora y tu informe.</p>${m.questions.map((q) => `<label><div><b>${q.label}</b><small>${q.hint}</small><div class="answer-example"><b>Un ejemplo, no una respuesta obligatoria</b><p>${esc(m.example)}</p></div>${speechField({ answer: q.id, value: a[q.id] })}</div></label>`).join("")}</section>${moduleNav()}</div></section>`;
  return `<section class="module">${head}<div class="panel closing"><span class="success">✓</span><p class="eyebrow">CIERRE DE LA SESIÓN ${m.id}</p><h2>${m.product}</h2><p>Ya recorriste orientación y práctica para <b>${esc(area)}</b>. La nota es un apoyo de memoria, no una prueba.</p><div class="summary single-summary">${m.questions.map((q) => `<div><small>TU NOTA OPCIONAL · ${q.label}</small><p>${esc(a[q.id] || "No escribiste una nota. La sesión puede integrarse igualmente.")}</p></div>`).join("")}</div><div class="closing-next"><b>Cuando cierres</b><p>La sesión quedará marcada como recorrida y la guía te llevará al siguiente paso.</p></div><div class="module-nav"><button class="secondary" data-step="1">← Volver a la práctica</button><span>Tu avance se guarda automáticamente</span><button class="primary" data-action="finish-module">Cerrar sesión y continuar →</button></div></div></section>`;
}
function logs() {
  const p = active();
  return (
    pageHead(
      "REGISTRO DE PRÁCTICAS",
      "Observar sin atribuir causalidad",
      "Registra la sesión, la atención y las señales observadas. Una variación no demuestra curación ni explica qué la produjo.",
    ) +
    `<div class="evidence-legend"><span><b>SUBJETIVO</b> Lo que sentiste</span><span><b>FUNCIONAL</b> Lo que realmente hiciste</span><span><b>CLÍNICO</b> Lo informado por profesionales</span></div><div class="two-col"><form id="log-form" class="panel log-form"><label>Paso practicado<select name="methodStep">${modules.map((m) => `<option value="${m.id}">${m.id}. ${m.verb}</option>`).join("")}</select></label><label>¿Qué representación o ejercicio realizaste?${speechField({ name: "practice", required: true })}</label><label>¿Qué distracciones notaste?${speechField({ name: "distractions" })}</label><label>Señal subjetiva${speechField({ name: "subjective", placeholder: "Sensación o percepción, sin interpretarla como diagnóstico…" })}</label><label>Cambio funcional realmente observado${speechField({ name: "functional", placeholder: "Acción realizada de forma segura y autorizada…" })}</label><label>Información clínica profesional${speechField({ name: "clinical", placeholder: "Solo información atribuida a una evaluación profesional…" })}</label><label>Foco percibido: <output id="intensity-value">5</output>/10<input name="focus" type="range" min="0" max="10" value="5"></label><label>Duración en minutos<input name="minutes" type="number" min="1" max="30" value="5"></label><button class="primary">Guardar práctica</button></form><div class="history"><h2>Historial</h2>${p.logs.length ? p.logs.map((l, i) => `<article><small>${new Date(l.date).toLocaleDateString("es-CO")} · paso ${esc(l.methodStep || "—")} · ${esc(l.minutes || "—")} min · foco ${esc(l.focus || l.intensity || "—")}/10</small><h3>${esc(l.practice || l.situation || "Práctica registrada")}</h3><p><b>Subjetivo:</b> ${esc(l.subjective || l.emotion || "—")}</p><p><b>Funcional:</b> ${esc(l.functional || l.alternative || "—")}</p><p><b>Clínico:</b> ${esc(l.clinical || "—")}</p><button data-delete-log="${i}">Eliminar</button></article>`).join("") : `<p class="empty">Aún no hay prácticas registradas.</p>`}</div></div>`
  );
}
function progress() {
  const p = active(),
    area = applicationName(p),
    changeAnswered = changeQuestions.filter((q) =>
      String(p.change?.[q.id] || "").trim(),
    ).length,
    guideAnswered = modules.reduce(
      (n, m) =>
        n +
        Object.values(p.answers[m.id] || {}).filter((v) => String(v).trim())
          .length,
      0,
    ),
    now = Date.now(),
    recent = p.logs.filter(
      (l) => now - new Date(l.date).getTime() <= 7 * 86400000,
    ),
    withFunction = p.logs.filter((l) =>
      String(l.functional || "").trim(),
    ).length,
    rate = p.logs.length ? Math.round((withFunction / p.logs.length) * 100) : 0,
    days = new Set(
      p.logs.map((l) => new Date(l.date).toLocaleDateString("en-CA")),
    ).size,
    weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86400000),
        key = d.toLocaleDateString("en-CA"),
        items = p.logs.filter(
          (l) => new Date(l.date).toLocaleDateString("en-CA") === key,
        ),
        avg = items.length
          ? items.reduce((n, l) => n + Number(l.focus || l.intensity || 0), 0) /
            items.length
          : 0;
      return {
        label: d.toLocaleDateString("es-CO", { weekday: "short" }),
        avg,
        count: items.length,
      };
    });
  return (
    pageHead(
      "MI PROGRESO",
      "Doce piezas claras y un registro útil",
      `El avance distingue tu mapa personal, la guía aplicada a ${esc(area)} y tus prácticas.`,
    ) +
    `<div class="stats-grid"><article class="panel"><small>MI CAMBIO</small><strong>${changeAnswered}/4</strong><p>Preguntas esenciales</p></article><article class="panel"><small>${esc(area.toUpperCase())}</small><strong>${guideAnswered}/8</strong><p>Notas breves</p></article><article class="panel"><small>PASOS LEÍDOS</small><strong>${p.completed.length}/8</strong><p>Etapas integradas</p></article><article class="panel"><small>ÚLTIMOS 7 DÍAS</small><strong>${recent.length}</strong><p>Prácticas realizadas</p></article><article class="panel"><small>CONTINUIDAD</small><strong>${days}</strong><p>Días distintos con actividad</p></article></div><div class="progress-layout"><article class="panel chart-card"><div><h2>Foco declarado · 7 días</h2><p>Representa una valoración personal de atención, no un indicador médico.</p></div><div class="bar-chart">${weekly.map((x) => `<div><span title="${x.count ? `${x.avg.toFixed(1)}/10` : `Sin práctica`}" style="height:${Math.max(4, x.avg * 9)}%"></span><b>${x.label}</b><small>${x.count ? x.avg.toFixed(1) : "—"}</small></div>`).join("")}</div></article><article class="panel progress-notes"><h2>Lectura prudente</h2><ul><li>Completar más pantallas no significa cambiar más rápido.</li><li>Una sensación no demuestra la causa de un cambio.</li><li>La función y la información profesional permanecen separadas.</li></ul><p><b>${rate}%</b> de las prácticas incluye algún dato funcional.</p><button class="primary" data-screen="logs">Añadir práctica</button></article></div>`
  );
}
function ai() {
  const p = active(),
    report = buildReport(p),
    area = applicationName(p),
    done = p.ai?.schemaVersion === "4.0",
    rawLength = view.aiRaw.length;
  return (
    pageHead(
      "IMPULSO CON IA",
      "Un informe, dos secciones claras",
      `La IA desarrollará lo valioso sin añadir más preguntas: primero tu proceso de cambio y después la guía aplicada a ${esc(area)}.`,
    ) +
    (p.demo
      ? `<aside class="panel demo-ai-note"><b>IA pendiente por decisión del usuario</b><p>El caso demostrativo llega integrado hasta el informe base. No contiene una respuesta de IA precargada: copia la orden, utiliza la IA que prefieras y trae manualmente el JSON.</p></aside>`
      : "") +
    `<div class="ai-wizard-head">${[
      [1, "Copiar"],
      [2, "Abrir IA"],
      [3, "Traer resultado"],
    ]
      .map(
        ([n, l]) =>
          `<div class="${view.aiStep === n ? "current" : ""} ${view.aiStep > n || done ? "done" : ""}"><span>${view.aiStep > n || done ? "✓" : n}</span><b>${l}</b></div>`,
      )
      .join(
        "",
      )}</div><div class="ai-wizard panel">${view.aiStep === 1 ? `<p class="eyebrow">PASO 1 DE 3</p><h2>Prepara tu informe</h2><p>La orden tomará las <b>cuatro respuestas esenciales</b> y las ocho notas aplicadas a <b>${esc(area)}</b>. Pedirá una narrativa integrada, concreta y sin repeticiones.</p><div class="privacy-note"><b>Límites incorporados:</b> no inventar información personal, no presentar la visualización como causa de reparación física y no sugerir movimientos ni tratamientos.</div><button class="primary" data-action="copy-ai">Copiar orden para la IA</button><button class="link-button" data-action="ai-example">¿Qué devolverá?</button>` : view.aiStep === 2 ? `<p class="eyebrow">PASO 2 DE 3</p><h2>Abre la IA que prefieras</h2><p>Pega la orden y envíala. Después copia toda la respuesta JSON.</p><div class="ai-links"><a target="_blank" rel="noreferrer" href="https://chatgpt.com">Abrir ChatGPT ↗</a><a target="_blank" rel="noreferrer" href="https://claude.ai">Abrir Claude ↗</a><a target="_blank" rel="noreferrer" href="https://gemini.google.com">Abrir Gemini ↗</a><a target="_blank" rel="noreferrer" href="https://copilot.microsoft.com">Abrir Copilot ↗</a></div><div class="wizard-actions"><button class="secondary" data-action="ai-prev">← Volver a copiar</button><button class="primary" data-action="ai-next">Ya tengo la respuesta →</button></div>` : `<p class="eyebrow">PASO 3 DE 3</p><h2>Trae el resultado a Presencia</h2><p>Pega el JSON completo. La aplicación comprobará ambas secciones antes de incorporarlas.</p><div class="ai-response-tools"><button class="paste-button" data-action="paste-ai">Pegar respuesta desde el portapapeles</button><span id="ai-char-count">${rawLength ? `${rawLength.toLocaleString("es-CO")} caracteres` : "Esperando respuesta"}</span></div><textarea id="ai-json" spellcheck="false" aria-label="Respuesta completa de la IA" placeholder="Pega aquí el JSON completo que devolvió la IA…">${esc(view.aiRaw)}</textarea>${view.aiErrors.length ? `<div class="friendly-errors"><b>No pudimos incorporarla todavía:</b><ul>${view.aiErrors.map((x) => `<li>${esc(friendlyAIError(x))}</li>`).join("")}</ul></div>` : ""}<div class="wizard-actions ai-final-actions"><button class="secondary" data-action="ai-prev">← Abrir otra IA</button><button class="primary" data-action="import-ai">Validar y generar informe</button></div>`}</div>${
      done
        ? `<div class="ai-result panel"><div class="report-parts"><span>1</span><h2>Mi proceso de cambio</h2></div>${personalMapCard(p.change, p.ai.changeProcess)}<div class="report-connector">Así se conecta con la guía ↓</div><div class="report-parts"><span>2</span><h2>${esc(area)}</h2></div>${methodApplicationCard(p.ai.methodApplication)}<div class="two-col ai-secondary"><section><h3>Patrones observados</h3>${(p.ai.observedPatterns || []).map((x) => `<article><b>${esc(x.name)}</b><small>Confianza ${esc(x.confidence)}</small><p>${(x.evidence || []).map(esc).join(" · ")}</p></article>`).join("") || "<p>Sin patrones estructurados.</p>"}</section><section><h3>Para continuar</h3><ul>${
            (p.ai.reflectiveQuestions || [])
              .slice(0, 3)
              .map((x) => `<li>${esc(x)}</li>`)
              .join("") || "<li>Sin preguntas adicionales.</li>"
          }</ul><h3>Práctica sugerida</h3><p><b>${esc(p.ai.nextPractice?.title || "Práctica pendiente")}</b><br>${esc(p.ai.nextPractice?.instruction || "")}</p></section></div><button class="secondary" data-action="ai-restart">Generar una nueva lectura</button></div>`
        : p.ai
          ? `<div class="panel legacy-note">El análisis guardado pertenece a una versión anterior. Genera uno nuevo para obtener Cambio + guía corporal.</div>`
          : ""
    }`
  );
}
function personalMapCard(change = {}, analysis = null) {
  const data = analysis || {};
  return `<section class="change-process-card personal-map">${analysis ? `<p class="change-narrative">${esc(data.integratedNarrative)}</p>` : ""}<div class="change-grid"><article><small>QUIERO CAMBIAR</small><p>${esc(data.startingPoint || change.goal || "Aún sin respuesta")}</p></article><article><small>HOY SE REPITE</small><p>${esc(data.repeatedPattern || change.pattern || "Aún sin respuesta")}</p></article><article><small>QUIERO RESPONDER</small><p>${esc(data.desiredResponse || change.newResponse || "Aún sin respuesta")}</p></article><article><small>PRIMER PASO</small><p>${esc(data.nextStep || change.nextStep || "Aún sin respuesta")}</p></article></div>${analysis && data.resources?.length ? `<div class="change-lists"><div><h3>Recursos presentes</h3><ul>${data.resources.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>` : ""}</section>`;
}
function methodApplicationCard(m = {}) {
  const evidence = m.observedEvidence || {};
  return `<section class="change-process-card method-application"><h2>${esc(m.title || "Mi guía de atención para el proceso corporal")}</h2><p class="change-narrative">${esc(m.integratedNarrative || "La lectura asistida se construirá al usar Impulso IA.")}</p><div class="change-grid"><article><small>VOLVER AL FOCO</small><p>${esc(m.attentionMethod || "Aún por integrar")}</p></article><article><small>REPRESENTACIÓN</small><p>${esc(m.mentalRepresentation || "Aún por integrar")}</p></article><article><small>ENSAYO FUTURO</small><p>${esc(m.futureRehearsal || "Aún por integrar")}</p></article><article><small>SIGUIENTE PASO SEGURO</small><p>${esc(m.nextSafeStep || "Aún por integrar")}</p></article></div><div class="evidence-columns"><div><h3>Subjetivo</h3><ul>${(evidence.subjective || []).map((x) => `<li>${esc(x)}</li>`).join("") || "<li>Sin datos</li>"}</ul></div><div><h3>Funcional</h3><ul>${(evidence.functional || []).map((x) => `<li>${esc(x)}</li>`).join("") || "<li>Sin datos</li>"}</ul></div><div><h3>Profesional</h3><ul>${(evidence.clinical || []).map((x) => `<li>${esc(x)}</li>`).join("") || "<li>Sin datos</li>"}</ul></div></div></section>`;
}
function friendlyAIError(text) {
  const map = {
    "schemaVersion debe ser 4.0.":
      "La respuesta corresponde a una versión anterior. Copia nuevamente la orden.",
    "changeProcess debe ser un objeto.":
      "Falta la sección “Mi proceso de cambio”.",
    "methodApplication debe ser un objeto.":
      "Falta la sección “Guía corporal”.",
    "changeProcess.integratedNarrative necesita mayor integración.":
      "La narrativa de cambio quedó demasiado breve.",
    "methodApplication.observedEvidence debe separar evidencia subjetiva, funcional y clínica.":
      "La IA mezcló los niveles de evidencia.",
    "nextPractice debe ser una práctica segura de 3 a 10 minutos.":
      "La práctica sugerida no respeta la duración o la seguridad.",
    "La respuesta debe ser un objeto JSON.":
      "La IA devolvió texto adicional o un formato diferente.",
  };
  return (
    map[text] ||
    text
      .replace(" debe ser una lista.", " no llegó como lista.")
      .replace(" está incompleto.", " necesita mayor desarrollo.")
  );
}
function reports() {
  const p = active(),
    r = buildReport(p),
    area = applicationName(p),
    ready = p.ai?.schemaVersion === "4.0";
  const exportBar = `<section class="panel report-export-bar"><div><b>Guardar este informe</b><small>HTML conserva una página autónoma; DOC abre en Word; PDF utiliza la impresión del navegador.</small></div><button class="primary" data-action="download-html-report">◫ Exportar HTML</button><button class="primary doc-button" data-action="download-doc-report">W Exportar DOC</button><button class="secondary" data-action="print">▣ Imprimir / PDF</button><button class="secondary data-button" data-action="download-report">{ } Datos JSON</button></section>`;
  const firstMoment = `<article class="panel report-change"><div class="report-parts"><span>1</span><div><small>PRIMER MOMENTO</small><h2>Mi punto de partida</h2></div><button class="secondary" data-screen="change">Revisar</button></div>${personalMapCard(p.change, ready ? p.ai.changeProcess : null)}</article>`;
  const secondMoment = `<article class="panel report-change"><div class="report-parts"><span>2</span><div><small>SEGUNDO MOMENTO · COLUMNA COMO ORIGEN</small><h2>Mi guía · ${esc(area)}</h2></div><button class="secondary" data-screen="route">Abrir sesiones</button></div>${ready ? methodApplicationCard(p.ai.methodApplication) : `<p>Esta sección integra ocho sesiones de atención, representación y registro aplicadas a ${esc(area)}. La ampliación con IA permanece pendiente y se realiza manualmente.</p><button class="primary" data-screen="ai">Realizar la ampliación manual con IA →</button>`}</article>`;
  const sessions = `<h2 class="report-section-title">Ocho sesiones guiadas · ${esc(area)}</h2><div class="module-reports">${r.sections.map((s) => `<article class="panel"><button data-report="${s.id}"><span>${s.id}</span><div><small>${s.status === "complete" ? "SESIÓN RECORRIDA" : "NOTA PENDIENTE"}</small><h2>${s.verb}</h2><p>${s.product}</p></div><b>${view.openReport === s.id ? "−" : "＋"}</b></button>${view.openReport === s.id ? `<div class="report-body"><p>${esc(s.synthesis)}</p>${s.findings.map((f) => `<dl><dt>${f.label}</dt><dd>${esc(f.value)}</dd></dl>`).join("")}</div>` : ""}</article>`).join("")}</div>`;
  return `<section class="page report"><div class="report-title"><div><p class="eyebrow">INFORME INTEGRAL</p><h1>${esc(r.title)}</h1><p>${esc(p.title)} · versión ${p.version}</p></div></div>${exportBar}${caseContextCard(p)}${firstMoment}<div class="report-connector">Tu punto de partida orienta la guía, pero no explica una recuperación física ↓</div>${secondMoment}<article class="panel report-overview"><h2>Lectura de conjunto</h2><p>${r.overview}</p><p><b>Regla de evidencia:</b> ${r.evidenceRule}</p></article>${sessions}<div class="report-grid"><article class="panel"><h2>Seguimiento de prácticas</h2><p>${r.tracking}</p></article><article class="panel"><h2>Lectura asistida</h2><p>${esc(p.ai?.summary || "Todavía no se ha incorporado una lectura externa validada; la integración con IA es manual.")}</p></article></div><article class="panel limits"><h2>Alcance y seguridad</h2><p>${r.scope}</p></article></section>`;
}
function settings() {
  return (
    pageHead("CONFIGURACIÓN", "Tu espacio, tus preferencias", "") +
    `<div class="panel settings-list"><label><div><b>Apariencia</b><small>Elige la atmósfera visual.</small></div><select data-setting="theme"><option value="dark" ${state.theme === "dark" ? "selected" : ""}>Noche</option><option value="light" ${state.theme === "light" ? "selected" : ""}>Clara</option></select></label><label><div><b>Tamaño del texto</b><small>Ajusta la lectura.</small></div><input data-setting="fontSize" type="range" min=".9" max="1.2" step=".05" value="${state.fontSize}"></label><button data-action="onboarding"><div><b>Ver recorrido inicial</b><small>Repite las cuatro pantallas de orientación.</small></div><span>→</span></button><button data-screen="manual"><div><b>Manual de usuario</b><small>Consulta todas las funciones.</small></div><span>?</span></button><button data-action="install"><div><b>Instalar como aplicación</b><small>${installPrompt ? "Disponible en este dispositivo." : "Depende del navegador y el dispositivo."}</small></div><span>＋</span></button><button data-action="export"><div><b>Exportar respaldo</b><small>Descarga todos los procesos.</small></div><span>↓</span></button><label class="file-label"><div><b>Importar respaldo</b><small>Restaura un archivo de Presencia.</small></div><input id="backup-file" type="file" accept="application/json"><span>↑</span></label><button class="danger" data-action="reset"><div><b>Borrar datos locales</b><small>Esta acción no se puede deshacer.</small></div><span>×</span></button></div>`
  );
}
function manual() {
  return (
    pageHead(
      "MANUAL DE USUARIO",
      "Una ruta breve en dos momentos",
      "Primero construyes un mapa personal. Después aplicas una guía de atención a columna u otro proceso corporal.",
    ) +
    `<div class="manual-alert panel"><h2>Regla principal</h2><p>La visualización, la atención y el ensayo mental son prácticas complementarias. No autorizan movimientos, no interpretan imágenes y no sustituyen evaluación, rehabilitación ni tratamiento profesional.</p></div><div class="manual-grid">${[
      [
        "01",
        "Orientación, no cuestionario",
        "Las cuatro pausas iniciales personalizan el recorrido. Son opcionales: puedes escribir, dictar o continuar sin responder.",
      ],
      [
        "02",
        "Elige la aplicación",
        "Conserva Columna como caso de origen o escribe otro proceso corporal. Ejemplo: “movilidad de hombro acompañada por fisioterapia”.",
      ],
      [
        "03",
        "Ocho sesiones guiadas",
        "Cada sesión sigue el mismo orden: orientación sencilla, ejemplo, guía en voz, práctica animada y cierre.",
      ],
      [
        "04",
        "Escuchar la guía",
        "Pulsa Escuchar esta guía y selecciona velocidad 1×, 1.5×, 1.8× o 2×. Puedes detener la voz cuando quieras.",
      ],
      [
        "05",
        "Practicar antes de escribir",
        "Elige 1, 3 o 5 minutos y sigue la animación sin moverte. La sesión no presenta preguntas mientras practicas.",
      ],
      [
        "06",
        "Nota opcional",
        "Al terminar aparece un espacio para conservar lo aprendido. No necesitas escribir para cerrar la sesión.",
      ],
      [
        "07",
        "Impulso con IA",
        "Copia la orden, abre la IA que prefieras, pega el JSON y deja que Presencia valide las dos secciones.",
      ],
      [
        "08",
        "Informe multiformato",
        "Exporta una página HTML autónoma, un archivo DOC para Word o utiliza Imprimir/PDF. El JSON queda como respaldo de datos.",
      ],
      [
        "09",
        "Versiones y respaldo",
        "Cada proceso conserva el área elegida, sus cuatro respuestas, ocho notas, registros e informe. El respaldo exporta todos los procesos.",
      ],
      [
        "10",
        "Instalación PWA",
        "Desde Configuración, utiliza Instalar como aplicación cuando el navegador lo permita.",
      ],
    ]
      .map(
        (x) =>
          `<article class="panel"><span>${x[0]}</span><h2>${x[1]}</h2><p>${x[2]}</p></article>`,
      )
      .join(
        "",
      )}</div><aside class="manual-alert panel"><h2>Marco de diseño</h2><p>La rehabilitación debe centrarse en las metas y necesidades de cada persona. Por eso Presencia permite nombrar el proceso, registrar experiencias y conservar el plan profesional como límite.</p><p><a href="https://www.who.int/news-room/fact-sheets/detail/rehabilitation" target="_blank" rel="noreferrer">OMS · Rehabilitación ↗</a> · <a href="https://www.nice.org.uk/guidance/ng236/chapter/Recommendations" target="_blank" rel="noreferrer">NICE · Metas y programas individualizados ↗</a></p></aside><h2>Glosario crítico</h2><div class="glossary">${glossary.map((x) => `<details><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join("")}</div>`
  );
}
function pageHead(kicker, title, lead) {
  return `<section class="page"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}</section>`;
}
function epistemic() {
  return `<aside class="epistemic"><span>◉</span><p><b>Lectura crítica activa.</b> El testimonio de Dispenza, la experiencia subjetiva, la función observable y la evidencia clínica se mantienen separados. La práctica mental no se presenta como causa demostrada de reparación corporal.</p></aside>`;
}
function versionModal() {
  const p = active();
  return `<div class="overlay"><form id="version-form" class="dialog"><button type="button" data-action="close-modal">×</button><p class="eyebrow">NUEVA VERSIÓN</p><h2>Abre otra lectura del proceso</h2><p>La versión actual se conserva intacta.</p><label>Nombre del proceso<input name="title" required value="${esc(p.title)}"></label><button class="primary">Crear versión ${p.version + 1}</button></form></div>`;
}
function onboardingModal() {
  const slides = [
      {
        icon: "▶",
        title: "Entra a una sesión",
        text: "Presencia te orienta y conduce la práctica. Las cuatro pausas personales son opcionales.",
      },
      {
        icon: "🔊",
        title: "Escucha la guía",
        text: "Cada sesión puede leerse en voz con cuatro velocidades y acompaña una práctica animada.",
      },
      {
        icon: "✎",
        title: "Escribe solo si te ayuda",
        text: "La nota aparece al final y es opcional. Puedes dictarla, escribirla o cerrar sin responder.",
      },
      {
        icon: "⇩",
        title: "Guarda en el formato que prefieras",
        text: "El informe se exporta como HTML, DOC o PDF; los datos completos también pueden guardarse en JSON.",
      },
    ],
    s = slides[view.onboarding - 1];
  return `<div class="overlay onboarding"><section class="dialog"><button data-action="onboarding-skip" aria-label="Cerrar recorrido">×</button><div class="onboarding-progress">${slides.map((_, i) => `<span class="${i < view.onboarding ? "on" : ""}"></span>`).join("")}</div><div class="onboarding-icon">${s.icon}</div><p class="eyebrow">PRIMEROS PASOS · ${view.onboarding} DE 4</p><h2>${s.title}</h2><p>${s.text}</p><div class="wizard-actions">${view.onboarding > 1 ? `<button class="secondary" data-action="onboarding-prev">← Anterior</button>` : "<span></span>"}<button class="primary" data-action="onboarding-next">${view.onboarding === 4 ? "Comenzar" : "Siguiente →"}</button></div><button class="link-button" data-action="onboarding-skip">Omitir recorrido</button></section></div>`;
}
function helpModal() {
  const help = {
      home: [
        "Inicio",
        "Entra directamente a tu guía. La orientación personal es opcional y puede completarse en cualquier momento.",
      ],
      processes: [
        "Procesos y versiones",
        "Cada versión conserva por separado sus respuestas, prácticas e informe.",
      ],
      change: [
        "Orientación personal",
        "Son cuatro pausas opcionales, no una evaluación. Puedes escribir una frase, dictar o continuar.",
      ],
      route: [
        "Guía corporal",
        "La columna permanece como caso de origen; los ocho pasos se aplican al contexto corporal que elijas.",
      ],
      foundations: [
        "Fundamentos",
        "Aquí se explica el aporte de cada PDF y el límite de sus afirmaciones.",
      ],
      module: [
        "Sesión guiada",
        "Primero recibe orientación y realiza la práctica. La nota reflexiva aparece solamente al final.",
      ],
      logs: [
        "Registro de prácticas",
        "Separa lo subjetivo, lo funcional y lo clínico.",
      ],
      progress: [
        "Progreso",
        "Estas cifras describen uso y aprendizaje; no miden curación.",
      ],
      ai: [
        "Impulso con IA",
        "La orden genera dos secciones conectadas sin inventar ni repetir información.",
      ],
      reports: [
        "Informe",
        "Revisa el recorrido y expórtalo como HTML, DOC, PDF o datos JSON.",
      ],
      settings: [
        "Configuración",
        "Ajusta apariencia, instala la PWA, consulta el manual y administra respaldos.",
      ],
      manual: [
        "Manual",
        "Consulta funciones, reglas de seguridad y glosario crítico.",
      ],
    },
    item = help[view.screen] || help.home;
  return `<div class="overlay"><section class="dialog help-dialog"><button data-action="close-help">×</button><p class="eyebrow">AYUDA CONTEXTUAL</p><h2>${item[0]}</h2><p>${item[1]}</p><div class="help-actions"><button class="secondary" data-screen="manual">Abrir manual completo</button><button class="primary" data-action="close-help">Entendido</button></div></section></div>`;
}
function beginDictation(key, button) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    notify(
      "El dictado integrado no está disponible aquí. Puedes usar el micrófono del teclado.",
    );
    return;
  }
  if (activeRecognition) {
    activeRecognition.stop();
    activeRecognition = null;
    return;
  }
  const target = document.querySelector(
    `textarea[data-change="${key}"], textarea[data-answer="${key}"], textarea[name="${key}"]`,
  );
  if (!target) return;
  const recognition = new SpeechRecognition();
  activeRecognition = recognition;
  recognition.lang = "es-CO";
  recognition.interimResults = true;
  recognition.continuous = false;
  const original = target.value.trim();
  button.classList.add("listening");
  button.textContent = "■ Detener";
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++)
      transcript += event.results[i][0].transcript;
    target.value = `${original}${original && transcript ? " " : ""}${transcript}`;
    target.dispatchEvent(new Event("input", { bubbles: true }));
  };
  recognition.onerror = () =>
    notify("No pudimos iniciar el dictado. Revisa el permiso del micrófono.");
  recognition.onend = () => {
    activeRecognition = null;
    button.classList.remove("listening");
    button.textContent = "🎙 Dictar";
  };
  recognition.start();
}
function paintExercise(running = false) {
  const time = document.querySelector("#exercise-time"),
    visual = document.querySelector("#exercise-animation");
  if (time) time.textContent = exerciseTime();
  if (visual) {
    visual.classList.toggle("running", running);
    visual.classList.toggle("complete", exerciseRemaining === 0);
  }
}
function startExercise() {
  if (exerciseRemaining <= 0) exerciseRemaining = exerciseDuration;
  if (exerciseTimer) return;
  paintExercise(true);
  exerciseTimer = setInterval(() => {
    exerciseRemaining = Math.max(0, exerciseRemaining - 1);
    paintExercise(true);
    if (exerciseRemaining === 0) {
      stopExerciseTimer();
      paintExercise(false);
    }
  }, 1000);
}

root.addEventListener("click", async (e) => {
  const b = e.target.closest(
    "[data-screen],[data-module],[data-step],[data-change-step],[data-action],[data-process],[data-report],[data-delete-log],[data-dictate]",
  );
  if (!b) return;
  if (b.dataset.dictate) {
    beginDictation(b.dataset.dictate, b);
    return;
  }
  if (b.dataset.screen) {
    view.help = false;
    setScreen(b.dataset.screen);
  }
  if (b.dataset.process !== undefined) {
    state.active = Number(b.dataset.process);
    persist();
    setScreen("home");
  }
  if (b.dataset.module) {
    const p = active();
    resetExerciseTimer(180);
    p.current = Number(b.dataset.module);
    updateProcess(p);
    view.moduleStep = 0;
    setScreen("module");
  }
  if (b.dataset.step && !b.disabled) {
    resetExerciseTimer(180);
    view.moduleStep = Number(b.dataset.step);
    render();
    scrollTo(0, 0);
  }
  if (b.dataset.changeStep !== undefined) {
    view.changeStep = Number(b.dataset.changeStep);
    render();
    scrollTo(0, 0);
  }
  if (b.dataset.report) {
    view.openReport =
      view.openReport === Number(b.dataset.report)
        ? null
        : Number(b.dataset.report);
    render();
  }
  if (
    b.dataset.deleteLog !== undefined &&
    confirm("¿Eliminar este registro?")
  ) {
    const p = active();
    p.logs.splice(Number(b.dataset.deleteLog), 1);
    updateProcess(p);
    render();
  }
  switch (b.dataset.action) {
    case "open-demo": {
      let index = state.processes.findIndex(
        (process) => process.demoId === "andres-columna-v1",
      );
      if (index < 0) {
        state.processes.push(demoProcess());
        index = state.processes.length - 1;
      }
      state.active = index;
      persist();
      setScreen("home");
      notify("Caso demostrativo de Andrés cargado");
      break;
    }
    case "new-version":
      view.modal = true;
      render();
      break;
    case "close-modal":
      view.modal = false;
      render();
      break;
    case "help":
      view.help = true;
      render();
      break;
    case "close-help":
      view.help = false;
      render();
      break;
    case "onboarding":
      view.onboarding = 1;
      render();
      break;
    case "onboarding-prev":
      view.onboarding = Math.max(1, view.onboarding - 1);
      render();
      break;
    case "onboarding-next":
      if (view.onboarding === 4) {
        view.onboarding = 0;
        state.onboardingDone = true;
        persist();
      } else view.onboarding++;
      render();
      break;
    case "onboarding-skip":
      view.onboarding = 0;
      state.onboardingDone = true;
      persist();
      render();
      break;
    case "change-prev":
      view.changeStep = Math.max(0, view.changeStep - 1);
      render();
      scrollTo(0, 0);
      break;
    case "change-next": {
      view.changeStep = Math.min(3, view.changeStep + 1);
      render();
      scrollTo(0, 0);
      break;
    }
    case "change-finish": {
      setScreen("route");
      notify("Tu recorrido guiado está listo");
      break;
    }
    case "listen-guide": {
      const p = active();
      playGuideVoice(modules[p.current - 1], p);
      break;
    }
    case "stop-guide":
      stopGuideVoice();
      notify("Lectura detenida");
      break;
    case "exercise-start":
      startExercise();
      break;
    case "exercise-pause":
      stopExerciseTimer();
      paintExercise(false);
      break;
    case "exercise-reset":
      resetExerciseTimer();
      paintExercise(false);
      break;
    case "exercise-save": {
      const p = active(),
        m = modules[p.current - 1];
      stopExerciseTimer();
      p.logs.unshift({
        methodStep: String(m.id),
        practice: `Ejercicio animado · ${m.verb} · ${applicationName(p)}`,
        distractions: "",
        subjective: "",
        functional: "",
        clinical: "",
        focus: "",
        minutes: String(Math.round(exerciseDuration / 60)),
        source: "guided",
        date: new Date().toISOString(),
      });
      updateProcess(p);
      resetExerciseTimer();
      render();
      notify("Sesión guardada en tu bitácora");
      break;
    }
    case "finish-module": {
      const p = active(),
        id = p.current;
      p.completed = [...new Set([...p.completed, id])];
      p.current = Math.min(8, id + 1);
      updateProcess(p);
      setScreen("route");
      notify("Sesión cerrada. La guía continúa.");
      break;
    }
    case "copy-ai":
      try {
        await navigator.clipboard.writeText(
          JSON.stringify(payload(active(), buildReport(active()))),
        );
        view.aiStep = 2;
        render();
        notify("Instrucciones copiadas. Ahora abre una IA.");
      } catch {
        notify(
          "No pudimos copiar automáticamente. Revisa el permiso del portapapeles.",
        );
      }
      break;
    case "ai-prev":
      view.aiStep = Math.max(1, view.aiStep - 1);
      render();
      break;
    case "ai-next":
      view.aiStep = Math.min(3, view.aiStep + 1);
      render();
      break;
    case "ai-restart":
      view.aiStep = 1;
      view.aiRaw = "";
      view.aiErrors = [];
      render();
      break;
    case "ai-example":
      notify(
        `La IA devolverá dos secciones: Mi proceso de cambio y ${applicationName(active())}, sin repetir preguntas.`,
      );
      break;
    case "paste-ai":
      try {
        view.aiRaw = await navigator.clipboard.readText();
        render();
        notify("Respuesta pegada. Ya puedes validarla.");
      } catch {
        notify(
          "El navegador no permitió leer el portapapeles. Pega la respuesta manualmente.",
        );
      }
      break;
    case "import-ai": {
      view.aiRaw = document.querySelector("#ai-json").value;
      try {
        const obj = JSON.parse(view.aiRaw);
        view.aiErrors = validate(obj);
        if (!view.aiErrors.length) {
          const p = active();
          p.ai = obj;
          updateProcess(p);
          render();
          notify("Análisis validado e incorporado al informe");
        } else render();
      } catch {
        view.aiErrors = ["La respuesta debe ser un objeto JSON."];
        render();
      }
      break;
    }
    case "rename-process": {
      const i = Number(b.dataset.index),
        title = prompt("Nuevo nombre del proceso", state.processes[i].title);
      if (title?.trim()) {
        state.processes[i].title = title.trim();
        persist();
        render();
      }
      break;
    }
    case "duplicate-process": {
      const i = Number(b.dataset.index),
        source = state.processes[i],
        copy = JSON.parse(JSON.stringify(source));
      copy.id = crypto.randomUUID();
      copy.title = `${source.title} · copia`;
      copy.version = source.version + 1;
      copy.createdAt = new Date().toISOString();
      copy.updatedAt = copy.createdAt;
      state.processes.push(copy);
      state.active = state.processes.length - 1;
      persist();
      setScreen("home");
      notify("Proceso duplicado");
      break;
    }
    case "delete-process": {
      const i = Number(b.dataset.index);
      if (
        state.processes.length > 1 &&
        confirm(`¿Eliminar “${state.processes[i].title}”?`)
      ) {
        state.processes.splice(i, 1);
        state.active = Math.min(state.active, state.processes.length - 1);
        persist();
        render();
      }
      break;
    }
    case "download-report":
      downloadReport(active(), buildReport(active()));
      break;
    case "download-html-report":
      downloadHtmlReport(active(), buildReport(active()));
      notify("Informe HTML preparado");
      break;
    case "download-doc-report":
      downloadDocReport(active(), buildReport(active()));
      notify("Informe DOC preparado");
      break;
    case "print":
      print();
      break;
    case "install":
      if (installPrompt) {
        await installPrompt.prompt();
        installPrompt = null;
      } else notify("La instalación directa no está disponible");
      break;
    case "export":
      exportState(state);
      break;
    case "reset":
      if (
        confirm("¿Borrar todos los procesos guardados en este dispositivo?")
      ) {
        reset();
        location.reload();
      }
      break;
  }
});
root.addEventListener("input", (e) => {
  if (e.target.matches("[data-application-name]")) {
    const p = active();
    p.application = { type: "other", name: e.target.value };
    updateProcess(p);
  }
  if (e.target.matches("[data-change]")) {
    const p = active();
    p.change = {
      ...(p.change || {}),
      [e.target.dataset.change]: e.target.value,
    };
    updateProcess(p);
  }
  if (e.target.matches("[data-answer]")) {
    const p = active(),
      id = p.current;
    p.answers[id] = {
      ...(p.answers[id] || {}),
      [e.target.dataset.answer]: e.target.value,
    };
    updateProcess(p);
  }
  if (e.target.name === "focus")
    document.querySelector("#intensity-value").textContent = e.target.value;
  if (e.target.id === "ai-json") {
    view.aiRaw = e.target.value;
    const count = document.querySelector("#ai-char-count");
    if (count)
      count.textContent = view.aiRaw.length
        ? `${view.aiRaw.length.toLocaleString("es-CO")} caracteres`
        : "Esperando respuesta";
  }
});
root.addEventListener("change", async (e) => {
  if (e.target.matches("[data-application-type]")) {
    const p = active();
    p.application =
      e.target.value === "other"
        ? { type: "other", name: "Mi proceso corporal" }
        : { type: "spine", name: "Columna" };
    updateProcess(p);
    render();
  }
  if (e.target.matches("[data-exercise-duration]")) {
    resetExerciseTimer(Number(e.target.value));
    render();
  }
  if (e.target.matches("[data-guide-speed]")) {
    guideVoiceRate = Number(e.target.value);
    stopGuideVoice();
    render();
  }
  if (e.target.dataset.setting === "theme") {
    state.theme = e.target.value;
    persist();
    render();
  }
  if (e.target.dataset.setting === "fontSize") {
    state.fontSize = Number(e.target.value);
    persist();
    render();
  }
  if (e.target.id === "backup-file" && e.target.files[0])
    try {
      state = await importState(e.target.files[0]);
      persist();
      notify("Respaldo restaurado");
      setScreen("home");
    } catch (err) {
      notify(err.message);
    }
});
root.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  if (e.target.id === "login-form") {
    state.user = String(data.get("name") || "").trim();
    ensureProcess();
    persist();
    if (!state.onboardingDone) view.onboarding = 1;
    setScreen("home");
  }
  if (e.target.id === "log-form") {
    const entry = Object.fromEntries(data);
    const p = active();
    p.logs.unshift({ ...entry, date: new Date().toISOString() });
    updateProcess(p);
    render();
    notify("Práctica guardada");
  }
  if (e.target.id === "version-form") {
    const p = active(),
      copy = newProcess(String(data.get("title") || "").trim(), p.version + 1);
    copy.application = { ...p.application };
    state.processes.push(copy);
    state.active = state.processes.length - 1;
    view.modal = false;
    persist();
    setScreen("home");
    notify("Nueva versión creada");
  }
});

render();

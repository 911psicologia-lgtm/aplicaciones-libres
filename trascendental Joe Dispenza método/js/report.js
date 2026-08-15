import { changeQuestions, modules } from "./modules.js";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );

const syntheses = {
  1: (answer) =>
    `La intención y el límite de seguridad se expresan así: ${answer.boundary || "aún no se han escrito"}.`,
  2: (answer) =>
    `La escena mental elegida es: ${answer.scene || "aún no se ha definido"}.`,
  3: (answer) =>
    `El recorrido breve se organiza así: ${answer.sequence || "aún no se ha escrito"}.`,
  4: (answer) =>
    `La clave para regresar al foco será: ${answer.returnCue || "aún no se ha elegido"}.`,
  5: (answer) =>
    `El ritmo de práctica previsto es: ${answer.rhythm || "aún no se ha definido"}.`,
  6: (answer) =>
    `La diferencia entre intención y control se formula así: ${answer.lettingGo || "aún no se ha escrito"}.`,
  7: (answer) =>
    `La acción cotidiana imaginada es: ${answer.futureAction || "aún no se ha elegido"}.`,
  8: (answer) =>
    `El contraste de evidencias se organizará así: ${answer.evidenceNote || "aún no se ha registrado"}.`,
};

export function buildReport(process) {
  const sections = modules.map((module) => {
    const answer = process.answers?.[module.id] || {};
    const count = Object.values(answer).filter((value) =>
      String(value).trim(),
    ).length;
    return {
      ...module,
      status: count ? "complete" : "empty",
      synthesis: syntheses[module.id](answer),
      findings: module.questions.map((question) => ({
        label: question.label,
        value: answer[question.id] || "Sin respuesta todavía",
      })),
    };
  });

  const change = process.change || {};
  const application =
    process.application?.type === "other"
      ? process.application.name || "Mi proceso corporal"
      : "Columna";
  const changeAnswered = changeQuestions.filter((question) =>
    String(change[question.id] || "").trim(),
  ).length;
  const focusValues = process.logs
    .map((log) => log.intensity || log.focus)
    .filter((value) => value !== "" && Number.isFinite(Number(value)))
    .map(Number);
  const average = focusValues.length
    ? focusValues.reduce((total, value) => total + value, 0) /
      focusValues.length
    : null;

  return {
    title: `Mi proceso de cambio y guía corporal · ${application}`,
    application,
    caseContext: process.caseContext || null,
    personalChange: changeQuestions.map((question) => ({
      id: question.id,
      label: question.title,
      value: change[question.id] || "Sin respuesta todavía",
    })),
    overview: `El mapa personal contiene ${changeAnswered} de 4 respuestas y la guía aplicada a ${application} tiene ${process.completed.length} de 8 pasos integrados. El relato de la columna permanece identificado como caso de origen y no se convierte en explicación médica para otros procesos.`,
    sections,
    tracking: process.logs.length
      ? `Se registraron ${process.logs.length} prácticas.${average === null ? " Aún no existe una valoración numérica de foco." : ` El promedio del indicador declarado fue ${average.toFixed(1)}/10; no representa curación ni evolución clínica.`}`
      : "Todavía no existen prácticas registradas.",
    evidenceRule:
      "Mantener separadas cuatro categorías: testimonio de Dispenza, experiencia subjetiva, cambio funcional observado y evidencia clínica profesional.",
    scope:
      "Documento educativo y reflexivo sobre atención, representación y registro. No constituye diagnóstico, programa de rehabilitación, indicación física ni evidencia de reparación estructural. Cualquier movimiento o ejercicio corporal debe provenir del plan profesional individual.",
  };
}

export function downloadReport(process, report) {
  const content = JSON.stringify(
    {
      format: "presencia-change-and-body-process-report",
      version: 4,
      generatedAt: new Date().toISOString(),
      process: {
        id: process.id,
        title: process.title,
        version: process.version,
      },
      report,
      practiceLogs: process.logs,
      ai: process.ai,
      previousCourseArchive: process.courseArchive || null,
    },
    null,
    2,
  );
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  anchor.download = `presencia-cambio-corporal-v${process.version}.json`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

function downloadFile(content, type, filename) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([content], { type }));
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function caseContextSection(context) {
  if (!context) return "";
  return `<section class="context"><p class="kicker">CASO DEMOSTRATIVO · SEUDÓNIMO</p><h2>${esc(context.alias)} · contexto corporal</h2><p>${esc(context.origin)}</p><div class="grid"><article><b>Condición informada</b><p>${esc(context.conditionSummary)}</p></article><article><b>Experiencia de partida</b><p>${esc(context.livedExperience)}</p></article><article><b>Acompañamiento</b><p>${esc(context.professionalCare)}</p></article><article><b>Dirección funcional</b><p>${esc(context.functionalDirection)}</p></article></div></section>`;
}

export function reportDocument(process, report) {
  const analysis = process.ai?.schemaVersion === "4.0" ? process.ai : null;
  const changeNarrative = analysis?.changeProcess?.integratedNarrative;
  const guideNarrative = analysis?.methodApplication?.integratedNarrative;
  const generated = new Date().toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return `<!doctype html>
<html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(report.title)}</title>
<style>
@page{size:letter;margin:18mm}*{box-sizing:border-box}body{margin:0;background:#eef2f6;color:#172033;font-family:Arial,Helvetica,sans-serif;line-height:1.55}.document{max-width:920px;margin:28px auto;background:#fff;padding:52px;border-radius:18px;box-shadow:0 12px 45px rgba(22,38,65,.12)}h1{font-size:34px;line-height:1.12;margin:8px 0 12px}h2{font-size:23px;margin:12px 0}h3{font-size:18px}.kicker{color:#256a79;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.meta,.muted{color:#667085}.section{margin:36px 0;padding-top:28px;border-top:2px solid #e5e9ef}.number{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#315de8;color:#fff;font-weight:800;margin-right:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.grid article,.step,.log{border:1px solid #dbe2ea;border-radius:12px;padding:16px;break-inside:avoid}.grid article b,.step small{color:#256a79;text-transform:uppercase;font-size:12px;letter-spacing:.06em}.context{padding:24px;border:1px solid #e4b069;border-radius:14px;background:#fffaf3;margin:28px 0}.steps{display:grid;gap:12px}.step h3{margin:4px 0}.step p{margin-bottom:0}.notice{padding:16px;border-left:4px solid #e4a442;background:#fff8ea}.actions{position:sticky;top:0;display:flex;justify-content:flex-end;padding:12px;background:#eef2f6}.actions button{border:0;border-radius:8px;background:#315de8;color:#fff;padding:10px 15px;font-weight:700;cursor:pointer}footer{margin-top:42px;padding-top:20px;border-top:1px solid #dbe2ea;color:#667085;font-size:12px}@media(max-width:700px){.document{margin:0;padding:26px;border-radius:0}.grid{grid-template-columns:1fr}h1{font-size:28px}}@media print{body{background:#fff}.actions{display:none}.document{max-width:none;margin:0;padding:0;box-shadow:none}.section{break-before:auto}.step,.grid article,.context{break-inside:avoid}}
</style>
</head>
<body>
<div class="actions"><button onclick="window.print()">Imprimir o guardar en PDF</button></div>
<main class="document">
<p class="kicker">PRESENCIA · INFORME INTEGRAL</p>
<h1>${esc(report.title)}</h1>
<p class="meta">${esc(process.title)} · versión ${process.version} · generado ${esc(generated)}</p>
${caseContextSection(report.caseContext)}
<section class="section"><h2><span class="number">1</span>Mi punto de partida</h2>${changeNarrative ? `<p>${esc(changeNarrative)}</p>` : ""}<div class="grid">${report.personalChange.map((item) => `<article><b>${esc(item.label)}</b><p>${esc(item.value)}</p></article>`).join("")}</div></section>
<section class="section"><h2><span class="number">2</span>Mi guía corporal · ${esc(report.application)}</h2>${guideNarrative ? `<p>${esc(guideNarrative)}</p>` : `<p>${esc(report.overview)}</p>`}<p class="notice"><b>Regla de evidencia:</b> ${esc(report.evidenceRule)}</p><h3>Ocho sesiones guiadas</h3><div class="steps">${report.sections.map((section) => `<article class="step"><small>Sesión ${section.id} · ${esc(section.product)}</small><h3>${esc(section.verb)} · ${esc(section.title)}</h3><p>${esc(section.synthesis)}</p>${section.findings.map((finding) => `<p><b>${esc(finding.label)}</b><br>${esc(finding.value)}</p>`).join("")}</article>`).join("")}</div></section>
<section class="section"><h2>Registro de prácticas</h2><p>${esc(report.tracking)}</p>${process.logs.length ? process.logs.map((log) => `<article class="log"><b>${esc(log.practice || "Práctica registrada")}</b><p class="muted">${esc(new Date(log.date).toLocaleDateString("es-CO"))} · sesión ${esc(log.methodStep || "—")}</p><p><b>Subjetivo:</b> ${esc(log.subjective || "Sin dato")}</p><p><b>Funcional:</b> ${esc(log.functional || "Sin dato")}</p><p><b>Profesional:</b> ${esc(log.clinical || "Sin dato")}</p></article>`).join("") : ""}</section>
<section class="section notice"><h2>Alcance y seguridad</h2><p>${esc(report.scope)}</p></section>
<footer>Presencia · Documento autónomo para lectura, archivo o impresión. La integración con IA ${analysis ? "fue incorporada y validada" : "permanece pendiente y se realiza manualmente"}.</footer>
</main>
</body>
</html>`;
}

export function downloadHtmlReport(process, report) {
  downloadFile(
    reportDocument(process, report),
    "text/html;charset=utf-8",
    `presencia-informe-v${process.version}.html`,
  );
}

export function downloadDocReport(process, report) {
  downloadFile(
    reportDocument(process, report),
    "application/msword;charset=utf-8",
    `presencia-informe-v${process.version}.doc`,
  );
}

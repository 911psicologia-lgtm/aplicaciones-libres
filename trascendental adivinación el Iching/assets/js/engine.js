// engine.js — motor heurístico: compone la lectura "sin IA" a partir de la tirada y el contexto.
import { HEX, TRIGRAMS, LINE_POS, AREA, TIPO } from "./data.js";
import { readingRule } from "./oracle.js";

const tri = n => TRIGRAMS.find(t=>t.n===n);
const lc = s => s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
const cap = s => s ? s.charAt(0).toUpperCase()+s.slice(1) : s;

function toneOpen(esencia, registro){
  if (registro==="Poético-simbólico") return "Lo que se dibuja es "+lc(esencia);
  if (registro==="Introspectivo")     return "Detente en esta imagen: "+lc(esencia);
  return esencia; // Directo y práctico
}

function lineGloss(idx, value){
  const pos = LINE_POS[idx];
  const old = value===9;
  const dyn = old
    ? "Un impulso o una firmeza que llegó a su punto máximo y ahora cede o se transforma."
    : "Una receptividad o apertura que se activa y empuja hacia el movimiento.";
  return { pos, dyn, label:"Línea "+(idx+1)+(old?" (nueve)":" (seis)") };
}

function guidingQuestions(P, D, areaObj, tipoIds){
  const lens = areaObj ? areaObj.lens : "tu situación";
  const qs = [];
  qs.push(`¿Qué te pide ${P.nombre} sostener, y qué te pide soltar, en ${lens}?`);
  if (D) qs.push(`Si el movimiento apunta hacia ${D.nombre}, ¿cuál sería un primer paso pequeño y honesto en esa dirección?`);
  if (tipoIds && tipoIds.includes("accion")) qs.push("¿Qué harías distinto si confiaras en que el momento aún no exige una respuesta definitiva?");
  else qs.push("¿Dónde estás forzando algo que quizá convendría dejar madurar, o evitando algo que ya pide moverse?");
  return qs.slice(0,3);
}

// journal: array de entradas guardadas; detecta recurrencia del hexagrama y de líneas.
function journalPattern(primary, moving, journal){
  if (!journal || !journal.length) return null;
  const same = journal.filter(e=>e.primary===primary);
  if (!same.length) return null;
  const n = same.length;
  // líneas que se repiten
  const counts = {};
  same.forEach(e => (e.moving||[]).forEach(i => counts[i]=(counts[i]||0)+1));
  const recur = moving.filter(i => counts[i]).map(i=>"línea "+(i+1));
  let s = `Este hexagrama ya había aparecido ${n} ${n===1?"vez":"veces"} en el diario.`;
  if (recur.length) s += ` Se repite además en ${recur.join(" y ")}: conviene mirar qué insiste.`;
  return s;
}

// Construye la lectura completa. ctx = {area:[ids], tipo:[ids], horizonte:[ids], mood, question}
export function compose(r, ctx, profile, consultant, journal){
  const P = HEX[r.primary];
  const D = r.derived ? HEX[r.derived] : null;
  const top = tri(P.top), bot = tri(P.bot);
  const rule = readingRule(r);
  const registro = (profile && profile.registro) || "Directo y práctico";
  const areaId = (ctx.area && ctx.area[0]) || null;
  const areaObj = areaId ? AREA[areaId] : null;

  const sections = [];

  // 1. Situación
  sections.push({ title:"La situación",
    head:`${P.nombre} · ${P.glyph} (${P.n}, ${P.zh} ${P.py})`,
    body: toneOpen(P.esencia, registro)+"." });

  // 2. Imagen (composición de trigramas)
  sections.push({ title:"La imagen",
    body:`${cap(top.es)} sobre ${bot.es}: ${top.el} y ${bot.el}. La figura nace de cómo ${top.img} se relaciona con ${bot.img}.` });

  // 3. Para el consultante (reencuadre por ámbito, no prefijo)
  let vida = areaObj
    ? `${areaObj.frame}, esto se traduce en lo siguiente: ${lc(P.consejo)} Mira especialmente ${areaObj.lens}.`
    : P.consejo;
  sections.push({ title:"Para ti", body: vida });

  // 4. Líneas (con regente)
  const lines = [];
  if (rule.focus==="lines" || rule.focus==="tuan"){
    r.moving.forEach(idx=>{
      const g = lineGloss(idx, r.values[idx]);
      lines.push({ idx, label:g.label, pos:g.pos, dyn:g.dyn, regent: idx===rule.regent });
    });
  }

  // 5. Transición
  let transition;
  if (D){
    transition = `Lo que hoy es ${lc(P.nombre)} tiende a volverse ${lc(D.nombre)}. ${D.consejo}`;
  } else {
    transition = `No hay líneas en cambio: la situación es estable por ahora. Permanece en ${P.nombre} sin forzar un giro; el Dictamen del hexagrama es la guía.`;
  }

  // 6. Preguntas-guía
  const questions = guidingQuestions(P, D, areaObj, ctx.tipo);

  // 7. Tipo de pregunta (matiz de lectura)
  const tipoNote = (ctx.tipo && ctx.tipo[0] && TIPO[ctx.tipo[0]]) || null;

  // 8. Patrón del diario
  const pattern = journalPattern(r.primary, r.moving, journal);

  // 9. Texto clásico de Legge si está disponible (pase de datos posterior)
  const legge = P.legge || null;
  const leggeD = D ? (D.legge || null) : null;

  return { P, D, top, bot, rule, sections, lines, transition, questions, tipoNote, pattern, legge, leggeD, consultant };
}

// Versión Markdown (para informe y para sembrar el prompt de IA)
export function toMarkdown(reading, ctx){
  const R = reading;
  let md = `## ${R.P.n}. ${R.P.nombre}\n\n`;
  R.sections.forEach(s=>{ md += `**${s.title}.** ${s.head?("*"+s.head+"* — "):""}${s.body}\n\n`; });
  if (R.lines.length){
    md += `### Líneas mutantes\n${R.rule.note}\n\n`;
    R.lines.forEach(l=>{ md += `- **${l.label}**${l.regent?" — *(regente)*":""}: ${l.pos}. ${l.dyn}\n`; });
    md += `\n`;
  }
  md += `### Hacia dónde se mueve\n${R.transition}\n\n`;
  md += `### Preguntas para meditar\n`;
  R.questions.forEach(q=> md += `- ${q}\n`);
  if (R.pattern) md += `\n*${R.pattern}*\n`;
  return md;
}

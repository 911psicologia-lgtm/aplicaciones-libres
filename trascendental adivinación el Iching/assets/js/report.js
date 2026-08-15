// report.js — render de Markdown, hexagramas SVG e informe descargable.
import { HEX } from "./data.js";

export function esc(s){ return (s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

// Markdown mínimo y seguro -> HTML (encabezados, negrita, cursiva, listas, enlaces, párrafos)
export function mdToHtml(md){
  if(!md) return "";
  const lines = esc(md).replace(/\r/g,"").split("\n");
  let html="", inList=false;
  const inline = t => t
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
  const closeList = ()=>{ if(inList){ html+="</ul>"; inList=false; } };
  for(let raw of lines){
    const t = raw.trim();
    if(!t){ closeList(); continue; }
    let m;
    if((m=t.match(/^###\s+(.*)/))){ closeList(); html+="<h3>"+inline(m[1])+"</h3>"; }
    else if((m=t.match(/^##\s+(.*)/))){ closeList(); html+="<h2>"+inline(m[1])+"</h2>"; }
    else if((m=t.match(/^#\s+(.*)/))){ closeList(); html+="<h1>"+inline(m[1])+"</h1>"; }
    else if((m=t.match(/^[-*]\s+(.*)/))){ if(!inList){ html+="<ul>"; inList=true; } html+="<li>"+inline(m[1])+"</li>"; }
    else { closeList(); html+="<p>"+inline(t)+"</p>"; }
  }
  closeList();
  return html;
}

// Hexagrama en SVG. lines base→cima (1=yang,0=yin). values: 6/7/8/9 para marcar mutantes.
export function svgHex(lines, values, opt={}){
  const w=opt.w||120, lh=11, gap=13, padR=26;
  const colYang=opt.yang||"#cdbf9f", colMov=opt.mov||"#c45a48";
  const totalH = 6*lh + 5*gap;
  const h = totalH;
  let bars="";
  for(let i=0;i<6;i++){
    const v=values?values[i]:null;
    const moving = v===6||v===9;
    const yang = lines[i]===1;
    const y = (5-i)*(lh+gap); // línea 0 (base) abajo
    const col = moving?colMov:colYang;
    if(yang){
      bars+=`<rect x="0" y="${y}" width="${w}" height="${lh}" rx="3" fill="${col}"/>`;
    } else {
      const seg=w*0.43;
      bars+=`<rect x="0" y="${y}" width="${seg}" height="${lh}" rx="3" fill="${col}"/>`;
      bars+=`<rect x="${w-seg}" y="${y}" width="${seg}" height="${lh}" rx="3" fill="${col}"/>`;
    }
    if(moving){
      const cy=y+lh/2;
      if(v===9) bars+=`<circle cx="${w+12}" cy="${cy}" r="5" fill="none" stroke="${colMov}" stroke-width="2"/>`;
      else bars+=`<g stroke="${colMov}" stroke-width="2"><line x1="${w+8}" y1="${cy-4}" x2="${w+16}" y2="${cy+4}"/><line x1="${w+16}" y1="${cy-4}" x2="${w+8}" y2="${cy+4}"/></g>`;
    }
  }
  return `<svg viewBox="0 0 ${w+padR} ${h}" width="${w+padR}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img">${bars}</svg>`;
}

// Informe autónomo (HTML claro, imprimible). state contiene la tirada, la lectura y la respuesta IA.
export function buildReport(state){
  const { reading, ctx, ai, ts, consultantName } = state;
  const R = reading;
  const dlines = R.D ? state.derivedLines : null;
  const fecha = new Date(ts||Date.now()).toLocaleString("es-ES",{dateStyle:"long",timeStyle:"short"});
  const areaLabels = (ctx.areaLabels||[]).join(", ");
  const tipoLabels = (ctx.tipoLabels||[]).join(", ");
  const horLabels = (ctx.horLabels||[]).join(", ");
  const qline = !ctx.question ? "(sin pregunta escrita)" : ctx.vis==="hide" ? "(pregunta reservada)" : esc(ctx.question);

  // lectura sin IA en HTML
  let sinIA="";
  R.sections.forEach(s=>{ sinIA+=`<h3>${esc(s.title)}</h3>${s.head?`<p class="head">${esc(s.head)}</p>`:""}<p>${esc(s.body)}</p>`; });
  if(R.lines.length){
    sinIA+=`<h3>Líneas mutantes</h3><p class="note">${esc(R.rule.note)}</p>`;
    R.lines.forEach(l=>{ sinIA+=`<div class="li${l.regent?" reg":""}"><b>${esc(l.label)}</b>${l.regent?' <span class="tag">regente</span>':""} — ${esc(l.pos)}. ${esc(l.dyn)}</div>`; });
  }
  sinIA+=`<h3>Hacia dónde se mueve</h3><p>${esc(R.transition)}</p>`;
  sinIA+=`<h3>Preguntas para meditar</h3><ul>`+R.questions.map(q=>`<li>${esc(q)}</li>`).join("")+`</ul>`;
  if(R.pattern) sinIA+=`<p class="note">${esc(R.pattern)}</p>`;

  const aiHtml = ai && ai.trim() ? `<h2>Interpretación extendida (IA)</h2><div class="ai">${mdToHtml(ai)}</div>` : "";

  const hexPair = `
    <div class="pair">
      <figure><figcaption>Ahora · ${esc(R.P.nombre)} (${R.P.n})</figcaption>${svgHex(state.lines,state.values,{yang:"#3a3630"})}</figure>
      ${R.D?`<div class="to">→</div><figure><figcaption>Tendencia · ${esc(R.D.nombre)} (${R.D.n})</figcaption>${svgHex(dlines,null,{yang:"#3a3630"})}</figure>`:""}
    </div>`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lectura I Ching · ${esc(R.P.nombre)}</title>
<style>
:root{--brz:#9c7a4e;--cin:#c45a48;--ink:#1c1a14}
*{box-sizing:border-box} body{font-family:Georgia,'Iowan Old Style',Palatino,serif;max-width:760px;margin:0 auto;padding:44px 26px;color:var(--ink);line-height:1.7}
.brand{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--brz)}
h1{font-size:27px;margin:.2em 0 .1em;border-bottom:2px solid var(--brz);padding-bottom:10px}
h2{font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:var(--brz);margin-top:30px}
h3{font-size:16px;color:var(--brz);margin:20px 0 4px}
.meta{color:#7a756a;font-size:13px;margin:2px 0}
.q{font-size:18px;margin:14px 0}
.pair{display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin:14px 0 6px}
.pair figcaption{font-size:12px;color:#7a756a;margin-bottom:8px;letter-spacing:.04em}
.pair .to{font-size:24px;color:var(--brz)}
.head{font-style:italic;color:#5c574c;margin:0}
.li{border-left:2px solid #d8cdb6;padding-left:12px;margin:9px 0}
.li.reg{border-color:var(--cin)}
.tag{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--cin);padding:2px 7px;border-radius:99px;vertical-align:middle}
.note{color:#7a756a;font-size:14px}
.ai{background:#f6f1e6;border-left:3px solid var(--brz);padding:6px 20px;border-radius:6px}
.ai h2{margin-top:18px} .ai h3{color:#866a40}
.about{background:#faf7ef;border:1px solid #ece3cf;border-radius:10px;padding:14px 18px;font-size:14px;color:#5c574c;margin-top:26px}
footer{margin-top:30px;border-top:1px solid #e7ddc7;padding-top:14px;color:#9a9183;font-size:12px}
@media print{body{padding:0}}
</style></head><body>
<div class="brand">Elichín · I Ching</div>
<h1>${R.P.n}. ${R.P.nombre}${R.D?` → ${R.D.n}. ${esc(R.D.nombre)}`:""}</h1>
<p class="meta">${fecha}${consultantName?` · para ${esc(consultantName)}`:""}</p>
<p class="meta">${[areaLabels,tipoLabels,horLabels].filter(Boolean).join(" · ")}</p>
<p class="q"><b>Pregunta:</b> ${qline}</p>
${hexPair}
${sinIA}
${aiHtml}
<div class="about"><b>¿Qué es esto?</b> El I Ching o «Libro de las Mutaciones» es un texto chino milenario que se usa como espejo para pensar, no como predicción. Una consulta produce una figura de seis líneas (un hexagrama) y, si hay líneas en cambio, una segunda figura que muestra hacia dónde tiende la situación. La lectura no ordena qué hacer: ofrece imágenes para mirar tu caso con más claridad.</div>
<footer>
Texto clásico: James Legge, <i>The Yî King</i> (Sacred Books of the East, vol. XVI, 2.ª ed., 1899), dominio público.
Estructura de los hexagramas: conjunto de datos abierto (licencia MIT). Lecturas simbólicas y motor de interpretación: elaboración propia de Elichín. La interpretación con IA, si aparece, fue generada por el modelo que elija la persona usuaria.
</footer>
</body></html>`;
}

export function downloadFile(content, type, filename){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

export function exportReport(state, kind){
  const html = buildReport(state);
  const base = "lectura-iching-"+(state.reading.P.n)+"-"+new Date(state.ts||Date.now()).toISOString().slice(0,10);
  if(kind==="doc"){
    const doc = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head>'
      + html.replace(/^[\s\S]*?<body>/,"<body>");
    downloadFile(doc, "application/msword", base+".doc");
  } else {
    downloadFile(html, "text/html;charset=utf-8", base+".html");
  }
}

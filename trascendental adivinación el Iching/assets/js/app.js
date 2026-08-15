// app.js — orquestación de Elichín: estado, vistas, interacción.
import { HEX, TRIGRAMS, CATEGORIES, AREA } from "./data.js";
import { tossLine, lineInfo, resolve } from "./oracle.js";
import { compose, toMarkdown } from "./engine.js";
import { svgHex, mdToHtml, exportReport, buildReport, esc } from "./report.js";

/* ---------- almacenamiento ---------- */
const mem={};
const S={
  get(k){ try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return mem[k]??null;} },
  set(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){mem[k]=v;} },
  del(k){ try{localStorage.removeItem(k);}catch(e){delete mem[k];} }
};
const K={prof:"elichin_profile",cons:"elichin_consultants",jour:"elichin_journal",set:"elichin_settings"};

/* ---------- estado ---------- */
let profile=S.get(K.prof);
let consultants=S.get(K.cons)||[{id:"self",name:"Para mí",self:true}];
let settings=S.get(K.set)||{theme:"dark",registro:"Directo y práctico"};
let activeConsultant="self";
let cur=null;                // tirada en curso
let rec=null;                // reconocimiento de voz

const TRILINES={1:[1,1,1],2:[0,0,0],3:[1,0,0],4:[0,1,0],5:[0,0,1],6:[0,1,1],7:[1,0,1],8:[1,1,0]};
const REGISTROS=["Poético-simbólico","Directo y práctico","Introspectivo"];

/* ---------- utilidades ---------- */
const root=()=>document.getElementById("root");
const reduce=()=>window.matchMedia("(prefers-reduced-motion:reduce)").matches;
function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("on"),2200); }
function scrollToEl(el){ try{ el && el.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){} }
function copy(t){ if(navigator.clipboard?.writeText){navigator.clipboard.writeText(t).catch(()=>fbCopy(t));} else fbCopy(t); }
function fbCopy(t){ const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");}catch(e){}a.remove(); }
function today(){ return new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"}); }
function selfConsultant(){ return consultants.find(c=>c.id===activeConsultant)||consultants[0]; }

function triSVG(n,size=40){
  const lines=TRILINES[n]; const lh=size*0.14, gap=size*0.16, w=size; let bars="";
  const tot=3*lh+2*gap, y0=(size-tot)/2;
  lines.forEach((v,i)=>{ const y=y0+(2-i)*(lh+gap); // cima arriba
    if(v) bars+=`<rect x="0" y="${y}" width="${w}" height="${lh}" rx="2" fill="currentColor"/>`;
    else{ const s=w*0.42; bars+=`<rect x="0" y="${y}" width="${s}" height="${lh}" rx="2" fill="currentColor"/><rect x="${w-s}" y="${y}" width="${s}" height="${lh}" rx="2" fill="currentColor"/>`; }
  });
  return `<svg viewBox="0 0 ${w} ${size}" width="${w}" height="${size}">${bars}</svg>`;
}

/* ---------- tema ---------- */
function applyTheme(){ document.documentElement.dataset.theme=settings.theme; }

/* ---------- enrutador ---------- */
let _cv="lock";
function go(view){ _cv=view; render(view); window.scrollTo({top:0}); }
function currentView(){ return _cv; }

function render(view){
  const r=root();
  if(view==="lock")      r.innerHTML=vLock();
  else if(view==="onboard") r.innerHTML=vOnboard();
  else if(view==="home") r.innerHTML=vHome();
  else if(view==="ask")  r.innerHTML=vAsk();
  else if(view==="cast") r.innerHTML=vCast();
  else if(view==="result") r.innerHTML=vResult();
  else if(view==="journal") r.innerHTML=vJournal();
  else if(view==="settings") r.innerHTML=vSettings();
  r.querySelector(".view")?.classList.add("in");
  if(view==="cast") prepCast();
  if(!('webkitSpeechRecognition'in window)&&!('SpeechRecognition'in window))
    r.querySelectorAll(".mic").forEach(m=>m.remove());
}

/* ---------- componentes reutilizables ---------- */
function topbar(title,back){
  return `<header class="topbar">
    ${back?`<button class="lnk" onclick="A.go('${back}')">‹ ${back==='home'?'Inicio':back}</button>`:`<span class="brand-sm">易 Elichín</span>`}
    <span class="eyebrow">${title||""}</span>
  </header>`;
}
function chipset(group, multi, selected=[]){
  return CATEGORIES[group].map(o=>
    `<button class="chip" data-g="${group}" data-id="${o.id}" aria-pressed="${selected.includes(o.id)}" onclick="A.toggleChip(this,${multi})">${o.label}</button>`
  ).join("");
}
function selectedChips(group){ return [...document.querySelectorAll(`.chip[data-g="${group}"][aria-pressed="true"]`)].map(c=>c.dataset.id); }
function labelsFor(group,ids){ return ids.map(id=>CATEGORIES[group].find(o=>o.id===id)?.label).filter(Boolean); }

/* ---------- vistas ---------- */
function vLock(){
  const n=profile?.avatar||1;
  return `<section class="view lock">
    <div class="eyebrow">oráculo diario</div>
    <div class="seal">${triSVG(n,64)}</div>
    <h1 class="display">Elichín</h1><div class="zh-sub">易 經</div>
    <p class="lead">Un espacio para preguntar y contemplar. Lo que escribas se queda en este dispositivo.</p>
    <button class="btn" onclick="A.enter()">Entrar</button>
    <button class="lnk subtle" onclick="A.about()">¿Qué es el I Ching?</button>
    <div class="howto">
      <div class="eyebrow">cómo se usa</div>
      <ol class="steps">
        <li><b>Escribe una pregunta.</b> Sincera y abierta, una sola. Mejor evitar el sí/no.</li>
        <li><b>Di para quién es</b> y marca el ámbito (relaciones, trabajo, salud…).</li>
        <li><b>Lanza las monedas</b> seis veces: cada vez se dibuja una línea, de abajo hacia arriba.</li>
        <li><b>Lee tu hexagrama:</b> el tema, las líneas que cambian y hacia dónde se mueve.</li>
        <li><b>Amplía con IA</b> <span class="muted">(opcional):</span> copia el prompt, pégalo en tu IA y trae la respuesta. Guarda o descarga el informe.</li>
      </ol>
    </div>
  </section>`;
}

function vOnboard(){
  return `<section class="view">
    <div class="eyebrow">primer encuentro</div>
    <h2 class="display">Quién interpreta</h2>
    <p class="lead">Esto te describe a ti como intérprete. A cada lectura podrás asignarle un consultante distinto (tú u otra persona).</p>
    <h3 class="q">Elige tu sello</h3>
    <div class="avatars">${TRIGRAMS.map(t=>`<button class="av" data-tri="${t.n}" onclick="A.pickAvatar(${t.n})">${triSVG(t.n,38)}<small>${t.es}<br><span class="zh">${t.zh}</span></small></button>`).join("")}</div>
    <h3 class="q">¿Qué registro prefieres?</h3>
    <div class="chips">${REGISTROS.map(r=>`<button class="chip" data-reg="${r}" aria-pressed="${r==='Directo y práctico'}" onclick="A.pickReg(this)">${r}</button>`).join("")}</div>
    <h3 class="q">Tu momento vital <span class="muted">(opcional)</span></h3>
    <div class="askrow"><textarea id="momento" rows="2" placeholder="p. ej.: en una transición, buscando claridad…"></textarea>
      <button class="mic" title="Dictar" onclick="A.dictate('momento',this)">🎙</button></div>
    <button class="btn" onclick="A.finishOnboard()">Comenzar</button>
  </section>`;
}

function vHome(){
  const j=(S.get(K.jour)||[]);
  const last=j[0];
  return `<section class="view">
    <header class="topbar">
      <button class="seal-sm" title="Tu sello" onclick="A.go('settings')">${triSVG(profile?.avatar||1,26)}</button>
      <nav class="navlinks"><button onclick="A.go('journal')">Diario</button><button onclick="A.go('settings')">Ajustes</button></nav>
    </header>
    <div class="home-hero">
      <div class="eyebrow">${today()}</div>
      <h1 class="display">Consulta de hoy</h1>
      <p class="lead">El I Ching es un espejo para pensar, no una predicción. Formula una pregunta sincera; una sola basta. <button class="lnk inline" onclick="A.about()">Qué es y cómo leerlo →</button></p>
    </div>
    <div class="consultant-bar">
      <span class="muted">Consultante:</span>
      <select id="consSel" onchange="A.setConsultant(this.value)">${consultants.map(c=>`<option value="${c.id}" ${c.id===activeConsultant?"selected":""}>${esc(c.name)}</option>`).join("")}</select>
      <button class="lnk" onclick="A.addConsultant()">+ otra persona</button>
    </div>
    <button class="btn lg" onclick="A.go('ask')">Hacer una consulta</button>
    ${last?`<button class="card last" onclick="A.openReading('${last.id}')"><div class="gly">${HEX[last.primary].glyph}</div><div><div class="eyebrow">última lectura</div><div class="serif">${HEX[last.primary].nombre}</div><div class="muted sm">${new Date(last.ts).toLocaleDateString("es-ES")} · ${esc(consultants.find(c=>c.id===last.consultant)?.name||"")}</div></div></button>`:""}
  </section>`;
}

function vAsk(){
  return `<section class="view">${topbar("tu consulta","home")}
    <div class="consultant-bar"><span class="muted">Para:</span>
      <select id="consSel" onchange="A.setConsultant(this.value)">${consultants.map(c=>`<option value="${c.id}" ${c.id===activeConsultant?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
    <h3 class="q">¿Qué quieres consultar?</h3>
    <div class="askrow"><textarea id="qtext" rows="3" placeholder="Escribe la pregunta…"></textarea>
      <button class="mic" title="Dictar" onclick="A.dictate('qtext',this)">🎙</button></div>
    <div class="row vis">
      <span class="muted">Visibilidad:</span>
      <button class="chip" data-vis="show" aria-pressed="true" onclick="A.pickVis(this)">Visible</button>
      <button class="chip" data-vis="blur" aria-pressed="false" onclick="A.pickVis(this)">Borrosa</button>
      <button class="chip" data-vis="hide" aria-pressed="false" onclick="A.pickVis(this)">Oculta</button>
    </div>
    <h3 class="q">Ámbito <span class="muted">(uno o varios)</span></h3>
    <div class="chips">${chipset("area",true)}</div>
    <h3 class="q">Tipo de pregunta</h3>
    <div class="chips">${chipset("tipo",false)}</div>
    <h3 class="q">Horizonte</h3>
    <div class="chips">${chipset("horizonte",false)}</div>
    <h3 class="q">Ánimo <span class="muted">(opcional)</span></h3>
    <div class="chips">${chipset("mood",false)}</div>
    <button class="btn lg" onclick="A.beginCast()">Lanzar las monedas</button>
  </section>`;
}

function vCast(){
  return `<section class="view cast">
    <div class="center"><div class="eyebrow">lanzamiento · método de las tres monedas</div></div>
    <div class="coins" id="coins"></div>
    <div class="hexbuild" id="hexbuild"></div>
    <div class="linecount muted" id="lineCount">Seis líneas, de la base a la cima</div>
    <button class="btn lg" id="castBtn" onclick="A.throwLine()">Lanzar línea 1</button>
    <button class="btn lg ghost" id="seeBtn" style="display:none" onclick="A.showResult()">Ver la lectura</button>
  </section>`;
}

function vResult(){
  const R=cur.reading;
  const cons=consultants.find(c=>c.id===cur.consultant);
  const q = !cur.question ? `<span class="muted">Consulta sin pregunta escrita.</span>`
    : cur.vis==="hide" ? `<span class="muted">Pregunta oculta. <button class="lnk" onclick="A.revealQ()">Mostrar</button></span>`
    : `<span class="${cur.vis==="blur"?"blurq":""}">${esc(cur.question)}</span>`;
  const cats=[...labelsFor("area",cur.area),...labelsFor("tipo",cur.tipo),...labelsFor("horizonte",cur.horizonte)].join(" · ");

  // lectura sin IA
  let reading="";
  R.sections.forEach(s=>{ reading+=`<div class="seg-title">${s.title}</div>${s.head?`<p class="head">${esc(s.head)}</p>`:""}<p>${esc(s.body)}</p>`; });
  if(R.lines.length){
    reading+=`<div class="seg-title">Líneas mutantes</div><p class="muted sm">${esc(R.rule.note)}</p>`;
    R.lines.forEach(l=>{ reading+=`<div class="lineitem${l.regent?" reg":""}"><b>${l.label}</b>${l.regent?' <span class="tag">regente</span>':""} — ${esc(l.pos)}. ${esc(l.dyn)}</div>`; });
  }
  reading+=`<div class="seg-title">Hacia dónde se mueve</div><p>${esc(R.transition)}</p>`;
  reading+=`<div class="seg-title">Preguntas para meditar</div><ul class="qlist">${R.questions.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  if(R.pattern) reading+=`<p class="pattern">${esc(R.pattern)}</p>`;

  // Legge (pase de datos): muestra si existe
  let legge="";
  if(R.legge||R.leggeD){
    legge=`<div class="card"><div class="eyebrow">texto clásico · James Legge (1899)</div>${R.legge?`<p class="serif">${esc(R.legge.judgment||"")}</p>`:""}</div>`;
  } else {
    legge=`<div class="card subtlecard"><div class="eyebrow">texto clásico · James Legge (1899)</div><p class="muted sm">El texto literal de Legge (Dictamen, Imagen y líneas) se incorpora en la próxima actualización de datos. La lectura de arriba es la interpretación simbólica de Elichín.</p></div>`;
  }

  return `<section class="view">${topbar("la lectura","home")}
    <div class="resulthead"><div class="bigzh">${R.P.zh}</div></div>
    <div class="card qcard"><div class="eyebrow">${cons?("para "+esc(cons.name)):"pregunta"}</div><p class="serif q">${q}</p>${cats?`<p class="muted sm">${cats}${cur.mood?` · ${labelsFor("mood",[cur.mood]).join("")}`:""}</p>`:""}</div>
    <div class="hexpair">${hexCard("Ahora",R.P,cur.lines,cur.values)}${R.D?`<div class="to">→</div>${hexCard("Tendencia",R.D,cur.derivedLines,null)}`:""}</div>
    <div class="card reading">${reading}</div>
    ${legge}
    <div class="card ai">
      <div class="eyebrow">interpretación extendida con IA · opcional</div>
      <p class="muted sm">Puedes profundizar la lectura con una IA. Son tres pasos:</p>
      <ol class="aiflow">
        <li class="aistep" id="aiS1">
          <div class="stepline"><span class="stepno">1</span><b>Copia el prompt</b></div>
          <p class="muted sm">Es el mensaje que le explica tu tirada a la IA.</p>
          <div class="row"><button class="btn sm" onclick="A.copyPrompt()">Copiar el prompt</button><button class="lnk" onclick="A.togglePrompt()">ver el texto</button></div>
          <pre class="promptbox" id="promptBox" style="display:none">${esc(buildPrompt())}</pre>
        </li>
        <li class="aistep" id="aiS2">
          <div class="stepline"><span class="stepno">2</span><b>Abre una IA y pega el prompt</b></div>
          <p class="muted sm" id="aiHint2">Elige la que quieras (todas sirven) y pega el prompt en su cajón de escribir.</p>
          <div class="ai-grid" id="aiGrid">${AIS.map(([n,u],i)=>`<a class="ai-link" style="--d:${(i*0.1).toFixed(2)}s" href="${u}" target="_blank" rel="noopener" onclick="A.openAI('${n}')"><span class="dot">${n[0]}</span>${n}</a>`).join("")}</div>
        </li>
        <li class="aistep" id="aiS3">
          <div class="stepline"><span class="stepno">3</span><b>Trae la respuesta</b></div>
          <p class="muted sm">Copia lo que te responda la IA y pégalo aquí. Quedará junto a tu lectura.</p>
          <div id="aiReturn" class="airet" style="display:none"></div>
          <textarea id="aiResp" rows="4" placeholder="Pega aquí la respuesta de la IA…">${esc(cur.ai||"")}</textarea>
          <div class="row"><button class="lnk" onclick="A.renderAI()">Ver con formato</button></div>
          <div id="aiPreview" class="ai-preview"></div>
        </li>
      </ol>
    </div>
    <div class="row">
      <button class="btn sm" onclick="A.saveReading()">Guardar en el diario</button>
      <button class="btn sm ghost" onclick="A.preview()">Ver informe</button>
    </div>
  </section>`;
}

function hexCard(label,hx,lines,values){
  return `<figure class="hexcard"><figcaption class="eyebrow">${label}</figcaption>
    <div class="hexsvg">${svgHex(lines,values)}</div>
    <div class="nm serif">${hx.nombre}</div><div class="num muted">${hx.n} · <span class="zh">${hx.zh}</span> ${hx.py}</div></figure>`;
}

function vJournal(){
  let j=(S.get(K.jour)||[]);
  const all=j;
  const filtered = activeConsultant ? j.filter(e=>!e.consultant||e.consultant===activeConsultant||activeConsultant==="self"&&!e.consultant) : j;
  const list = j; // mostramos todas, con etiqueta de consultante y filtro
  let stats="";
  if(all.length){ const f={}; all.forEach(e=>f[e.primary]=(f[e.primary]||0)+1); const top=Object.entries(f).sort((a,b)=>b[1]-a[1])[0];
    stats=`${all.length} lecturas · más frecuente: <b>${HEX[top[0]].nombre}</b> (${top[1]})`; }
  return `<section class="view">${topbar("diario","home")}
    <h2 class="display">Las lecturas</h2>
    <p class="muted sm">${stats||"Aún no has guardado lecturas."}</p>
    <div class="chips filterbar">
      <button class="chip" aria-pressed="${!A.jfilter}" onclick="A.setJFilter(null)">Todas</button>
      ${consultants.map(c=>`<button class="chip" aria-pressed="${A.jfilter===c.id}" onclick="A.setJFilter('${c.id}')">${esc(c.name)}</button>`).join("")}
    </div>
    <div class="jlist">${
      list.filter(e=>!A.jfilter||e.consultant===A.jfilter).map(e=>{
        const qt=!e.question?'<span class="muted">sin pregunta</span>':e.vis==="hide"?'<span class="muted">pregunta oculta</span>':`<span class="${e.vis==="blur"?"blurq":""}">${esc(e.question.slice(0,64))}${e.question.length>64?"…":""}</span>`;
        const cn=consultants.find(c=>c.id===e.consultant)?.name||"";
        return `<button class="jitem" onclick="A.openReading('${e.id}')"><div class="gly">${HEX[e.primary].glyph}</div><div class="jbody"><div class="serif">${qt}</div><div class="muted sm">${new Date(e.ts).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})} · ${HEX[e.primary].nombre}${e.derived?` → ${HEX[e.derived].nombre}`:""}${cn?` · ${esc(cn)}`:""}</div></div></button>`;
      }).join("") || '<div class="card center muted">No hay lecturas para este filtro.</div>'
    }</div>
  </section>`;
}

function vSettings(){
  return `<section class="view">${topbar("ajustes","home")}
    <h2 class="display">Ajustes</h2>
    <h3 class="q">Apariencia</h3>
    <div class="chips"><button class="chip" aria-pressed="${settings.theme==='dark'}" onclick="A.setTheme('dark')">Oscuro</button><button class="chip" aria-pressed="${settings.theme==='light'}" onclick="A.setTheme('light')">Claro</button></div>
    <h3 class="q">Tu sello</h3>
    <div class="avatars">${TRIGRAMS.map(t=>`<button class="av ${profile?.avatar===t.n?'sel':''}" data-tri="${t.n}" onclick="A.pickAvatar(${t.n},true)">${triSVG(t.n,38)}<small>${t.es}</small></button>`).join("")}</div>
    <h3 class="q">Registro de interpretación</h3>
    <div class="chips">${REGISTROS.map(r=>`<button class="chip" aria-pressed="${(profile?.registro||settings.registro)===r}" onclick="A.setReg('${r}')">${r}</button>`).join("")}</div>
    <h3 class="q">Consultantes</h3>
    <div class="conslist">${consultants.map(c=>`<div class="consrow"><span>${esc(c.name)}${c.self?' <span class="muted sm">(tú)</span>':''}</span>${c.self?"":`<button class="lnk del" onclick="A.delConsultant('${c.id}')">quitar</button>`}</div>`).join("")}</div>
    <button class="lnk" onclick="A.addConsultant()">+ añadir consultante</button>
    <div class="card" style="margin-top:22px"><div class="eyebrow">datos</div>
      <p class="muted sm">Todo se guarda solo en este dispositivo. Si vas a guardar lecturas de otras personas, pídeles permiso y trata sus datos con cuidado.</p>
      <div class="row"><button class="btn sm ghost" onclick="A.exportData()">Exportar copia (.json)</button><button class="btn sm ghost" onclick="A.clearData()">Borrar todo</button></div>
    </div>
    <div class="credits">
      <div class="eyebrow">créditos y fuentes</div>
      <p>Texto clásico: <b>James Legge</b>, <i>The Yî King</i> (Sacred Books of the East, vol. XVI, 2.ª ed., 1899). Dominio público; libre de uso. Se incorpora como pase de datos.</p>
      <p>Estructura de los 64 hexagramas: conjunto de datos abierto bajo licencia <b>MIT</b>.</p>
      <p>Lecturas simbólicas y motor de interpretación: elaboración propia de <b>Elichín</b>.</p>
      <button class="lnk" onclick="A.about()">¿Qué es el I Ching?</button>
    </div>
  </section>`;
}

/* ---------- IA ---------- */
const AIS=[["Claude","https://claude.ai/new"],["ChatGPT","https://chatgpt.com"],["Gemini","https://gemini.google.com/app"],["Perplexity","https://www.perplexity.ai"],["Copilot","https://copilot.microsoft.com"],["DeepSeek","https://chat.deepseek.com"],["Mistral","https://chat.mistral.ai"],["Grok","https://grok.com"]];

function buildPrompt(){
  const R=cur.reading;
  const cons=consultants.find(c=>c.id===cur.consultant);
  const valLabel=v=>v===6?"6 (yin mutante)":v===7?"7 (yang)":v===8?"8 (yin)":"9 (yang mutante)";
  const lns=cur.values.map((v,i)=>`    Línea ${i+1}: ${valLabel(v)}`).join("\n");
  const mov=cur.moving.length?cur.moving.map(i=>"línea "+(i+1)).join(", "):"ninguna";
  const reg=(profile?.registro||settings.registro).toLowerCase();
  const ctxBits=[...labelsFor("area",cur.area),...labelsFor("tipo",cur.tipo),...labelsFor("horizonte",cur.horizonte)].join(", ");
  const who = cons?.self ? "quien consulta (la propia persona usuaria)" : `otra persona: ${cons?.name||"anónima"}`;
  return `Actúa como intérprete del I Ching que une rigor simbólico con aplicación a la vida concreta. Responde en español, registro ${reg}. No adules ni predigas el futuro; ofrece una lectura honesta y útil, sin lenguaje de horóscopo.

Devuelve la respuesta en Markdown con esta estructura de encabezados:
## Lectura del hexagrama principal
## Líneas mutantes (una subsección ### por línea señalada)
## Hacia dónde apunta el cambio
## Síntesis y 1–2 acciones concretas

QUIEN CONSULTA
- Para: ${who}
- Relación con el oráculo: ${profile?.relacion||"—"}
- Momento vital: ${profile?.momento||"—"}

LA CONSULTA
- Pregunta: "${cur.question||"(sin pregunta escrita)"}"
- Contexto: ${ctxBits||"—"}${cur.mood?` · ánimo: ${labelsFor("mood",[cur.mood]).join("")}`:""}

LA TIRADA (tres monedas)
- Hexagrama principal: ${R.P.n}. ${R.P.nombre} (${R.P.zh} ${R.P.py}) — ${R.top.es} sobre ${R.bot.es}
  Líneas (base→cima):
${lns}
- Líneas mutantes: ${mov}
- Regla de lectura: ${R.rule.note}
- Hexagrama derivado: ${R.D?`${R.D.n}. ${R.D.nombre} (${R.D.zh})`:"sin cambio"}

LECTURA SIMBÓLICA DE BASE (de la app)
${toMarkdown(R,cur)}

TAREA
1) Apóyate en el texto clásico del I Ching (Legge 1899, de dominio público, o Wilhelm) para el Dictamen, la Imagen y, sobre todo, las líneas mutantes señaladas como regentes.
2) Contextualiza en la pregunta y el contexto declarados.
3) Cierra con una síntesis y 1–2 acciones o actitudes concretas.`;
}

/* ---------- objeto global A ---------- */
const A={
  jfilter:null,
  go,
  about(){
    const html=`<div class="sheethead"><h2 class="display">El I Ching, en breve</h2><button class="lnk" onclick="A.closeModal()">Cerrar</button></div>
    <div class="prose">
      <p>El <b>I Ching</b> o «Libro de las Mutaciones» es uno de los textos más antiguos de China. Durante milenios se ha usado no para adivinar el futuro, sino como un <b>espejo para pensar</b>: una manera de mirar una situación desde imágenes que ayudan a ver con más claridad.</p>
      <h3>Cómo funciona una consulta</h3>
      <p>Formulas una pregunta y lanzas tres monedas seis veces. Cada lanzamiento dibuja una <b>línea</b> —entera (yang) o partida (yin)—, de abajo hacia arriba, hasta formar una figura de seis líneas: un <b>hexagrama</b>. Hay 64 en total, y cada uno nombra una situación: la espera, el conflicto, la paz, el retorno…</p>
      <h3>Las líneas que cambian</h3>
      <p>Algunas líneas salen «en movimiento». Señalan dónde está la tensión viva del asunto y, al transformarse, dan lugar a un <b>segundo hexagrama</b> que muestra hacia dónde tiende la situación. De ahí que una lectura tenga a menudo dos figuras: <i>ahora</i> y <i>tendencia</i>.</p>
      <h3>Cómo leer el informe</h3>
      <p>Primero, el hexagrama y su imagen: el tema de fondo. Luego, lo que sugiere para tu caso. Después, las líneas en movimiento (las más concretas). Por último, hacia dónde se mueve y unas preguntas para meditar. No es una orden: es material para tu propia reflexión.</p>
      <p class="muted">Una consulta sincera, hecha una vez, vale más que muchas repetidas.</p>
    </div>`;
    openModal(html);
  },
  enter(){ if(profile) go("home"); else go("onboard"); },
  pickAvatar(n,save){ A._av=n; document.querySelectorAll(".av").forEach(a=>a.classList.toggle("sel",+a.dataset.tri===n));
    if(save&&profile){ profile.avatar=n; S.set(K.prof,profile); } },
  pickReg(b){ document.querySelectorAll("[data-reg]").forEach(x=>x.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); A._reg=b.dataset.reg; },
  finishOnboard(){
    profile={ avatar:A._av||1, registro:A._reg||"Directo y práctico", relacion:"Espejo para pensar", momento:(document.getElementById("momento").value||"").trim() };
    settings.registro=profile.registro; S.set(K.prof,profile); S.set(K.set,settings); go("home");
  },
  setConsultant(id){ activeConsultant=id; },
  addConsultant(){ const name=prompt("Nombre del consultante (puedes poner 'Anónimo'):"); if(!name)return;
    const id="c"+Date.now().toString(36); consultants.push({id,name:name.trim()}); S.set(K.cons,consultants); activeConsultant=id;
    const sel=document.getElementById("consSel"); if(sel){ const o=document.createElement("option"); o.value=id; o.textContent=name.trim(); o.selected=true; sel.appendChild(o); } else go(currentView()); },
  delConsultant(id){ consultants=consultants.filter(c=>c.id!==id); S.set(K.cons,consultants); if(activeConsultant===id)activeConsultant="self"; go("settings"); },
  setTheme(t){ settings.theme=t; S.set(K.set,settings); applyTheme(); go("settings"); },
  setReg(r){ if(profile){profile.registro=r;S.set(K.prof,profile);} settings.registro=r; S.set(K.set,settings); go("settings"); },
  toggleChip(b,multi){ if(!multi){ document.querySelectorAll(`.chip[data-g="${b.dataset.g}"]`).forEach(x=>x.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); }
    else b.setAttribute("aria-pressed", b.getAttribute("aria-pressed")==="true"?"false":"true"); },
  pickVis(b){ document.querySelectorAll("[data-vis]").forEach(x=>x.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); A._vis=b.dataset.vis; },
  setJFilter(id){ A.jfilter=id; go("journal"); },

  dictate(id,btn){ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR)return;
    if(rec){ rec.stop(); return; } rec=new SR(); rec.lang="es-CO"; rec.interimResults=false;
    btn.classList.add("live");
    rec.onresult=e=>{ const t=e.results[0][0].transcript; const ta=document.getElementById(id); ta.value=(ta.value?ta.value+" ":"")+t; };
    rec.onend=()=>{ btn.classList.remove("live"); rec=null; };
    rec.onerror=()=>{ btn.classList.remove("live"); rec=null; toast("No se pudo capturar la voz"); };
    rec.start();
  },

  beginCast(){
    cur={ question:(document.getElementById("qtext").value||"").trim(), vis:A._vis||"show",
      area:selectedChips("area"), tipo:selectedChips("tipo"), horizonte:selectedChips("horizonte"),
      mood:selectedChips("mood")[0]||"", consultant:activeConsultant, values:[], idx:0, ai:"" };
    go("cast");
  },
  throwLine(){
    if(cur.idx>=6) return;
    const btn=document.getElementById("castBtn"); btn.disabled=true;
    const {coins,value}=tossLine();
    const cc=document.getElementById("coins"); cc.innerHTML=coins.map(t=>`<div class="coin ${reduce()?"":"flip"}"><span>${t?"⚊":"⚋"}</span></div>`).join("");
    const place=()=>{ cur.values.push(value); drawBuildLine(cur.idx,value); cur.idx++;
      if(cur.idx<6){ btn.disabled=false; btn.textContent="Lanzar línea "+(cur.idx+1); }
      else{ btn.style.display="none"; document.getElementById("seeBtn").style.display="block"; document.getElementById("lineCount").textContent="Hexagrama completo"; } };
    reduce()?place():setTimeout(place,560);
  },
  showResult(){
    const r=resolve(cur.values);
    Object.assign(cur,{lines:r.lines,moving:r.moving,primary:r.primary,derived:r.derived,derivedLines:r.derivedLines});
    cur.reading=compose(r,{area:cur.area,tipo:cur.tipo,horizonte:cur.horizonte,mood:cur.mood,question:cur.question},
      profile, consultants.find(c=>c.id===cur.consultant), S.get(K.jour)||[]);
    cur.saved=false; go("result");
  },
  revealQ(){ cur.vis="show"; go("result"); },
  togglePrompt(){ const b=document.getElementById("promptBox"); b.style.display=b.style.display==="none"?"block":"none"; },
  copyPrompt(){
    copy(buildPrompt()); toast("Prompt copiado");
    document.getElementById("aiS1")?.classList.add("done");
    document.getElementById("aiGrid")?.classList.add("cue");
    const h=document.getElementById("aiHint2"); if(h) h.innerHTML="Ábrela aquí abajo y pega el prompt (cualquiera sirve).";
    scrollToEl(document.getElementById("aiS2"));
  },
  openAI(n){
    copy(buildPrompt());
    const box=document.getElementById("aiReturn");
    if(box){ box.style.display="block"; box.innerHTML=`<b>Abriste ${n}.</b> Pega ahí el prompt (ya está copiado) y envíalo. Lee la respuesta en ${n}; cuando quieras conservarla, cópiala y pégala en el cajón de aquí abajo.`; }
    document.getElementById("aiS2")?.classList.add("done");
    document.getElementById("aiGrid")?.classList.remove("cue");
    const s3=document.getElementById("aiS3"); if(s3){ s3.classList.add("cue"); scrollToEl(s3); }
    toast("Prompt copiado — pégalo en "+n);
  },
  renderAI(){ const v=document.getElementById("aiResp").value.trim(); cur.ai=v; document.getElementById("aiPreview").innerHTML=v?mdToHtml(v):'<span class="muted sm">Pega una respuesta y pulsa previsualizar.</span>'; },

  saveReading(){
    cur.ai=(document.getElementById("aiResp")?.value||"").trim();
    if(cur.saved){ toast("Ya guardada"); return; }
    const j=S.get(K.jour)||[];
    const entry={ id:Date.now().toString(36)+Math.random().toString(36).slice(2,5), ts:Date.now(),
      question:cur.question, vis:cur.vis, area:cur.area, tipo:cur.tipo, horizonte:cur.horizonte, mood:cur.mood,
      consultant:cur.consultant, values:cur.values, lines:cur.lines, moving:cur.moving,
      primary:cur.primary, derived:cur.derived, ai:cur.ai };
    j.unshift(entry); S.set(K.jour,j); cur.saved=true; cur.savedId=entry.id; toast("Guardada en el diario");
  },
  openReading(id){
    const e=(S.get(K.jour)||[]).find(x=>x.id===id); if(!e)return;
    const r=resolve(e.values);
    cur={ ...e, idx:6, derivedLines:r.derivedLines, saved:true,
      reading: compose(r,{area:e.area||[],tipo:e.tipo||[],horizonte:e.horizonte||[],mood:e.mood,question:e.question},
        profile, consultants.find(c=>c.id===e.consultant), S.get(K.jour)||[]) };
    go("result");
  },

  reportState(){
    return { reading:cur.reading, ts:cur.ts||Date.now(), ai:(document.getElementById("aiResp")?.value||cur.ai||"").trim(),
      lines:cur.lines, values:cur.values, derivedLines:cur.derivedLines,
      consultantName:(consultants.find(c=>c.id===cur.consultant)||{}).name,
      ctx:{ question:cur.question, vis:cur.vis,
        areaLabels:labelsFor("area",cur.area), tipoLabels:labelsFor("tipo",cur.tipo), horLabels:labelsFor("horizonte",cur.horizonte) } };
  },
  preview(){
    const html=buildReport(A.reportState());
    openModal(`<div class="sheethead"><div class="row"><button class="btn sm" onclick="A.dl('html')">Descargar HTML</button><button class="btn sm" onclick="A.dl('doc')">Descargar DOC</button></div><button class="lnk" onclick="A.closeModal()">Cerrar</button></div>
      <iframe class="reportframe" srcdoc="${esc(html)}"></iframe>`);
  },
  dl(kind){ exportReport(A.reportState(),kind); },

  exportData(){ const data={profile,consultants,settings,journal:S.get(K.jour)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const u=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=u;a.download="elichin-respaldo-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(u),2000); toast("Copia exportada"); },
  clearData(){ if(confirm("Esto borra tu perfil, consultantes y todas las lecturas de este dispositivo. ¿Seguro?")){ S.del(K.prof);S.del(K.cons);S.del(K.jour);S.del(K.set); location.reload(); } },

  closeModal(){ document.getElementById("modal").classList.remove("on"); },
};
window.A=A;

function openModal(html){ const m=document.getElementById("modal"); document.getElementById("sheet").innerHTML=html; m.classList.add("on"); }

/* ---------- casting helpers ---------- */
function prepCast(){ document.getElementById("hexbuild").innerHTML=""; }
function drawBuildLine(idx,value){
  const info=lineInfo(value);
  const host=document.getElementById("hexbuild");
  const ln=document.createElement("div");
  ln.className="bln "+(info.yang?"yang":"yin")+(info.moving?" moving":"");
  ln.innerHTML=info.yang?'<span class="seg"></span>':'<span class="seg"></span><span class="seg"></span>';
  if(info.mark) ln.innerHTML+=`<span class="mk">${info.mark}</span>`;
  host.prepend(ln); // prepend: la última lanzada queda arriba (cima)
  requestAnimationFrame(()=>requestAnimationFrame(()=>ln.classList.add("show")));
}

/* ---------- arranque ---------- */
applyTheme();
document.getElementById("modal").addEventListener("click",e=>{ if(e.target.id==="modal") A.closeModal(); });
A.go("lock");

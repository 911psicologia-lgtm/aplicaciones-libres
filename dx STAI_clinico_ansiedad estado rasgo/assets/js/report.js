const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function pct(score){ return Math.max(0, Math.min(100, (Number(score || 0) / 60) * 100)); }

function radarSvg(dimensions=[]) {
  const dims = Array.isArray(dimensions) ? dimensions.filter(d => d && d.nombre && Number.isFinite(Number(d.valor))).slice(0,8) : [];
  if (dims.length < 3) return '<div class="emptyviz">El mapa radial requiere al menos 3 dimensiones contextuales producidas por la IA.</div>';
  const w=640,h=460,cx=320,cy=215,r=155,n=dims.length;
  const point=(i, rr)=>{ const a=(-Math.PI/2)+(i*2*Math.PI/n); return [cx+Math.cos(a)*rr, cy+Math.sin(a)*rr]; };
  const rings=[.25,.5,.75,1].map(f=>`<polygon points="${dims.map((_,i)=>point(i,r*f).join(',')).join(' ')}" class="grid"/>`).join('');
  const axes=dims.map((d,i)=>{ const [x,y]=point(i,r); const [lx,ly]=point(i,r+35); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="axis"/><text x="${lx}" y="${ly}" text-anchor="middle" class="lbl">${esc(d.nombre)}</text>`; }).join('');
  const values=dims.map((d,i)=>point(i,r*Math.max(0,Math.min(100,Number(d.valor)))/100).join(',')).join(' ');
  const dots=dims.map((d,i)=>{ const [x,y]=point(i,r*Math.max(0,Math.min(100,Number(d.valor)))/100); return `<circle cx="${x}" cy="${y}" r="4" class="dot"><title>${esc(d.nombre)}: ${esc(d.valor)}/100</title></circle>`; }).join('');
  return `<svg class="radar" viewBox="0 0 ${w} ${h}" role="img" aria-label="Mapa radial de dimensiones contextuales">${rings}${axes}<polygon points="${values}" class="area"/>${dots}<circle cx="${cx}" cy="${cy}" r="3" class="dot"/></svg>`;
}

function networkSvg(ai={}) {
  const factors = Array.isArray(ai.factores_contextuales) ? ai.factores_contextuales.slice(0,8) : [];
  if (!factors.length) return '<div class="emptyviz">No hay factores contextuales estructurados para construir la red.</div>';
  const w=760,h=480,cx=380,cy=235;
  const nodes=[{id:'STAI',label:'Perfil STAI',type:'central'}, ...factors.map((f,i)=>({id:`f${i}`,label:f.factor||`Factor ${i+1}`,type:f.tipo||'factor',weight:Number(f.peso)||50}))];
  const edges=factors.map((f,i)=>({a:'STAI',b:`f${i}`,strength:Math.max(1,Math.min(5, Math.round((Number(f.peso)||50)/20))) }));
  const relations=Array.isArray(ai.relaciones)?ai.relaciones.slice(0,10):[];
  const lookup = new Map(factors.map((f,i)=>[String(f.factor||'').trim().toLowerCase(),`f${i}`]));
  relations.forEach(r=>{
    const a=lookup.get(String(r.origen||'').trim().toLowerCase());
    const b=lookup.get(String(r.destino||'').trim().toLowerCase());
    if(a&&b&&a!==b) edges.push({a,b,strength:Math.max(1,Math.min(5,Number(r.intensidad)||2))});
  });
  const pos=new Map([['STAI',[cx,cy]]]);
  factors.forEach((f,i)=>{ const a=(-Math.PI/2)+(i*2*Math.PI/factors.length); const rr=165 + (i%2)*35; pos.set(`f${i}`,[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]); });
  const edgeSvg=edges.map(e=>{ const [x1,y1]=pos.get(e.a),[x2,y2]=pos.get(e.b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="netedge" style="stroke-width:${1+e.strength*.45}"/>`; }).join('');
  const nodeSvg=nodes.map(n=>{ const [x,y]=pos.get(n.id); const rr=n.id==='STAI'?46:Math.max(25,Math.min(38,24+(n.weight||50)/7)); return `<g><circle cx="${x}" cy="${y}" r="${rr}" class="netnode ${esc(n.type)}"/><foreignObject x="${x-rr+5}" y="${y-rr+8}" width="${(rr-5)*2}" height="${(rr-5)*2}"><div xmlns="http://www.w3.org/1999/xhtml" class="netlabel">${esc(n.label)}</div></foreignObject></g>`; }).join('');
  return `<svg class="network" viewBox="0 0 ${w} ${h}" role="img" aria-label="Red de factores contextuales">${edgeSvg}${nodeSvg}</svg>`;
}

function list(items, empty='No registrado') {
  const arr = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!arr.length) return `<p class="muted">${esc(empty)}</p>`;
  return `<ul>${arr.map(x=>`<li>${esc(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('')}</ul>`;
}

function factorsTable(ai={}) {
  const rows=Array.isArray(ai.factores_contextuales)?ai.factores_contextuales:[];
  if(!rows.length) return '<p class="muted">No se registraron factores contextuales estructurados.</p>';
  return `<div class="tablewrap"><table><thead><tr><th>Factor</th><th>Tipo</th><th>Evidencia</th><th>Relación</th><th>Peso</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.factor)}</td><td><span class="pill">${esc(r.tipo)}</span></td><td>${esc(r.evidencia)}</td><td>${esc(r.relacion)}</td><td>${esc(r.peso ?? '')}</td></tr>`).join('')}</tbody></table></div>`;
}

function hypotheses(ai={}) {
  const rows=Array.isArray(ai.hipotesis_clinicas)?ai.hipotesis_clinicas:[];
  if(!rows.length) return '<p class="muted">No se generaron hipótesis de trabajo.</p>';
  return rows.map((h,i)=>`<details ${i===0?'open':''}><summary>${esc(h.hipotesis || `Hipótesis ${i+1}`)} <span class="pill">confianza ${esc(h.nivel_confianza||'no indicada')}</span></summary><div class="detailgrid"><div><b>Evidencia a favor</b>${list(h.evidencia_a_favor)}</div><div><b>Evidencia en contra / faltante</b>${list(h.evidencia_en_contra)}</div></div></details>`).join('');
}

function contextDimensions(ai={}) {
  const rows=Array.isArray(ai.dimensiones_contextuales)?ai.dimensiones_contextuales:[];
  if(!rows.length) return '<p class="muted">Sin dimensiones contextuales añadidas.</p>';
  return rows.map(d=>`<div class="dim"><div><b>${esc(d.nombre)}</b><span>${esc(d.valor)}/100</span></div><div class="meter"><i style="width:${Math.max(0,Math.min(100,Number(d.valor)||0))}%"></i></div><small>${esc(d.fundamento||'')}</small></div>`).join('');
}

function buildReportHtml(payload) {
  const { patient, results, ai, generatedAt } = payload;
  const hasAI = !!ai && typeof ai === 'object' && Object.keys(ai).length > 0;
  const stateFinal = results.stateDecatypeBand || results.stateBand;
  const traitFinal = results.traitDecatypeBand || results.traitBand;
  const patientLabel = patient.name || patient.code || 'Persona evaluada';
  const reportData = JSON.stringify(payload).replace(/</g,'\\u003c');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe STAI - ${esc(patientLabel)}</title><style>
:root{--ink:#142033;--muted:#5b6779;--line:#dce3ec;--soft:#f4f7fb;--accent:#3d5a80;--accent2:#6c8eaa;--good:#2e7d61;--warn:#a66a11;--danger:#a63f43}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--ink);background:#eef2f7;line-height:1.5}.page{max-width:1180px;margin:28px auto;background:white;border:1px solid var(--line);border-radius:22px;box-shadow:0 18px 55px rgba(23,37,61,.11);overflow:hidden}.hero{padding:34px 40px;background:linear-gradient(135deg,#eef4fb,#fff)}.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:800;color:var(--accent)}h1{margin:.35rem 0 .4rem;font-size:34px;line-height:1.1}h2{font-size:22px;margin:0 0 14px}h3{font-size:17px}.sub{color:var(--muted);max-width:820px}.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.toolbar button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 13px;font-weight:700;cursor:pointer}.section{padding:28px 40px;border-top:1px solid var(--line)}.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}.card{border:1px solid var(--line);border-radius:16px;padding:18px;background:#fff}.span6{grid-column:span 6}.span4{grid-column:span 4}.span8{grid-column:span 8}.span12{grid-column:1/-1}.metric{font-size:38px;font-weight:850;line-height:1}.metric small{font-size:14px;color:var(--muted);font-weight:700}.meter{height:10px;background:#e8edf3;border-radius:999px;overflow:hidden}.meter i{display:block;height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent));border-radius:inherit}.scoreline{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}.muted{color:var(--muted)}.pill{display:inline-block;background:#eef3f8;border:1px solid #dbe5ef;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:700}.callout{padding:15px 17px;border-left:4px solid var(--accent);background:var(--soft);border-radius:10px}.radar,.network{width:100%;height:auto}.grid,.axis{fill:none;stroke:#cdd8e5;stroke-width:1}.area{fill:rgba(61,90,128,.2);stroke:#3d5a80;stroke-width:2}.dot{fill:#3d5a80}.lbl{font-size:12px;fill:#354155}.netedge{stroke:#aebdd0;opacity:.75}.netnode{fill:#eaf1f8;stroke:#6f8eaa;stroke-width:2}.netnode.central{fill:#dceaf7;stroke:#3d5a80}.netnode.protector,.netnode.recurso{fill:#e7f4ef;stroke:#5b927f}.netnode.desencadenante,.netnode.vulnerabilidad{fill:#f9ecec;stroke:#b96a6d}.netlabel{display:flex;align-items:center;justify-content:center;text-align:center;width:100%;height:100%;font-size:11px;font-weight:700;line-height:1.15;color:#25354a}.emptyviz{padding:28px;text-align:center;color:var(--muted);background:var(--soft);border-radius:12px}.dim{margin-bottom:14px}.dim>div:first-child{display:flex;justify-content:space-between;gap:12px}.dim small{display:block;color:var(--muted);margin-top:4px}.tablewrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}th{background:#f6f8fb}details{border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin:9px 0}summary{cursor:pointer;font-weight:800}.detailgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding-top:10px}.foot{font-size:12px;color:var(--muted);padding:20px 40px 34px}.hide-print{}@media(max-width:820px){.page{margin:0;border-radius:0}.hero,.section,.foot{padding-left:20px;padding-right:20px}.span4,.span6,.span8{grid-column:1/-1}.detailgrid{grid-template-columns:1fr}h1{font-size:28px}}@media print{body{background:#fff}.page{box-shadow:none;border:none;margin:0;max-width:none}.hide-print{display:none!important}.section{break-inside:avoid}.page{border-radius:0}}
</style></head><body><main class="page" id="top"><header class="hero"><div class="eyebrow">Informe clínico de apoyo · STAI</div><h1>${esc(patientLabel)}</h1><p class="sub">Inventario de Ansiedad Estado-Rasgo. Resultados cuantitativos y, cuando se utilizó, contextualización clínica asistida por IA. El STAI aporta indicadores de ansiedad actual y predisposición ansiosa; no constituye por sí solo un diagnóstico.</p><div class="toolbar hide-print"><button onclick="window.print()">Imprimir / Guardar PDF</button><button onclick="downloadJson()">Descargar JSON</button><button onclick="location.hash='tecnica'">Nota técnica</button></div></header>
<section class="section"><h2>Identificación y contexto</h2><div class="grid"><div class="card span4"><b>Paciente / código</b><div>${esc(patientLabel)}</div></div><div class="card span4"><b>Edad</b><div>${esc(patient.age || 'No registrada')}</div></div><div class="card span4"><b>Sexo de baremación</b><div>${esc(patient.sex || 'No registrado')}</div></div><div class="card span6"><b>Grupo normativo</b><div>${esc(patient.normGroup || 'No registrado')}</div></div><div class="card span6"><b>Fecha de aplicación</b><div>${esc(patient.applicationDate || 'No registrada')}</div></div><div class="card span12"><b>Motivo / contexto de evaluación</b><div>${esc(patient.context || 'No especificado')}</div></div></div></section>
<section class="section"><h2>Resultados STAI</h2><div class="grid"><div class="card span6"><div class="scoreline"><div><b>Ansiedad-Estado</b><div class="muted">activación ansiosa en el momento de responder</div></div><div class="metric">${esc(results.stateScore)}<small>/60</small></div></div><div class="meter"><i style="width:${pct(results.stateScore)}%"></i></div><p><span class="pill">${esc(stateFinal)}</span>${results.stateDecatype ? ` <span class="pill">decatipo ${esc(results.stateDecatype)}</span>` : ''}</p></div><div class="card span6"><div class="scoreline"><div><b>Ansiedad-Rasgo</b><div class="muted">predisposición relativamente estable a responder con ansiedad</div></div><div class="metric">${esc(results.traitScore)}<small>/60</small></div></div><div class="meter"><i style="width:${pct(results.traitScore)}%"></i></div><p><span class="pill">${esc(traitFinal)}</span>${results.traitDecatype ? ` <span class="pill">decatipo ${esc(results.traitDecatype)}</span>` : ''}</p></div><div class="card span12"><div class="callout"><b>Perfil integrado:</b> ${esc(results.integrated)}</div></div></div></section>
${hasAI ? `<section class="section"><h2>Contextualización multicausal e interrelacional</h2><div class="grid"><div class="card span12"><h3>Síntesis integrada</h3><p>${esc(ai.resumen_integrado || 'Sin síntesis general.')}</p></div><div class="card span6"><h3>Lectura de Ansiedad-Estado</h3><p>${esc(ai.lectura_estado || 'No registrada.')}</p></div><div class="card span6"><h3>Lectura de Ansiedad-Rasgo</h3><p>${esc(ai.lectura_rasgo || 'No registrada.')}</p></div><div class="card span12"><h3>Relación Estado-Rasgo</h3><p>${esc(ai.relacion_estado_rasgo || 'No registrada.')}</p></div></div></section>
<section class="section"><h2>Mapa de dimensiones contextuales</h2><div class="grid"><div class="card span7">${radarSvg(ai.dimensiones_contextuales)}</div><div class="card span5"><h3>Dimensiones</h3>${contextDimensions(ai)}</div></div></section>
<section class="section"><h2>Red de factores relacionados</h2><div class="grid"><div class="card span8">${networkSvg(ai)}</div><div class="card span4"><h3>Lectura de red</h3><p class="muted">El tamaño y la proximidad visual ayudan a explorar la trama de factores descrita por la IA. Es una representación clínica de apoyo, no una métrica psicométrica.</p>${list(ai.recursos_protectores,'Sin recursos protectores estructurados.')}</div></div></section>
<section class="section"><h2>Factores contextuales</h2>${factorsTable(ai)}</section>
<section class="section"><h2>Hipótesis de trabajo</h2>${hypotheses(ai)}</section>
<section class="section"><div class="grid"><div class="card span6"><h2>Alertas clínicas para explorar</h2>${list(ai.alertas,'Sin alertas estructuradas.')}</div><div class="card span6"><h2>Preguntas sugeridas para entrevista</h2>${list(ai.preguntas_clinicas_sugeridas,'Sin preguntas sugeridas.')}</div><div class="card span12"><h2>Próximos focos de evaluación</h2>${list(ai.recomendaciones_evaluacion,'Sin recomendaciones estructuradas.')}</div><div class="card span12"><h2>Límites interpretativos</h2><p>${esc(ai.limites_interpretativos || 'La lectura debe contrastarse con entrevista, observación, antecedentes y otras fuentes de evaluación.')}</p></div></div></section>` : `<section class="section"><div class="callout"><b>Informe sin contextualización IA.</b> Se presenta únicamente la lectura STAI y la información clínica básica ingresada en la aplicación.</div></section>`}
<section class="section" id="tecnica"><h2>Nota técnica</h2><div class="grid"><div class="card span6"><h3>Corrección</h3><p>Los ítems se puntúan de 0 a 3. Los ítems invertidos se recodifican como 3 - respuesta original. Cada escala alcanza de 0 a 60 puntos.</p></div><div class="card span6"><h3>Uso de niveles</h3><p>Las etiquetas bajo/medio/alto que aparecen sin decatipo son una división descriptiva del rango teórico, no una clasificación normativa. Los decatipos, si se ingresan, deben provenir del manual autorizado y del grupo normativo pertinente.</p></div><div class="card span12"><h3>Advertencia</h3><p>El STAI no establece por sí solo un diagnóstico. La integración con IA no reemplaza el juicio clínico; sus hipótesis deben contrastarse y pueden contener errores, omisiones o inferencias no sustentadas.</p></div></div></section>
<div class="foot">Generado el ${esc(generatedAt)}. Aplicación STAI Clínico · procesamiento local. El texto de historia clínica no se incorpora íntegramente al informe salvo lo que haya sido sintetizado explícitamente en la respuesta de IA.</div></main><script>const reportData=${reportData};function downloadJson(){const b=new Blob([JSON.stringify(reportData,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='stai-datos-${Date.now()}.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}</script></body></html>`;
}

window.STAI_REPORT = { buildReportHtml };

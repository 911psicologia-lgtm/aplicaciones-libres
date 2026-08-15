/* ============================================================
   TRAS · v0.16.6
   Devolución terapéutica interactiva para adolescentes.
   - Un prompt clínico-curatorial devuelve contenido JSON.
   - La app lo inserta en una plantilla HTML autónoma.
   - Tratamiento lingüístico seleccionable: masculino, femenino,
     trans/diverso o neutro. La identidad nunca se infiere desde
     el nombre o la narrativa; solo desde un dato explícito o una
     selección profesional.
   ============================================================ */

function ensureAdolescentReturnV0166(c) {
  if (!c) c = getCurrentCase();
  if (!c.devolucionAdolescente || typeof c.devolucionAdolescente !== 'object') {
    c.devolucionAdolescente = {};
  }
  const d = c.devolucionAdolescente;
  if (!d.config || typeof d.config !== 'object') d.config = {};
  if (!d.contenido || typeof d.contenido !== 'object') d.contenido = {};
  if (!d.config.plantilla) d.config.plantilla = suggestAdolescentTemplateV0166(c.meta?.sexo || '');
  // El alias se resincroniza con c.meta.nombre en cada acceso, salvo que el
  // profesional ya lo haya editado a mano (d.config._aliasManual). Antes solo
  // se calculaba una vez ("if (!d.config.alias)"), lo que podia dejarlo
  // congelado con un nombre desactualizado si el alias quedaba fijado antes
  // de completar la identificacion del caso.
  if (!d.config._aliasManual) {
    const nombreActual = firstNameV0166(c.meta?.nombre || '');
    if (nombreActual) d.config.alias = nombreActual;
  }
  if (!d.config.alias) d.config.alias = firstNameV0166(c.meta?.nombre || '');
  if (!d.config.pronombres) d.config.pronombres = defaultPronounsV0166(d.config.plantilla);
  if (!d.config.paleta) d.config.paleta = 'auto';
  if (!d.config.profundidad) d.config.profundidad = 'equilibrada';
  if (typeof d.config.incluirSensibles !== 'boolean') d.config.incluirSensibles = true;
  if (!Array.isArray(d.contenido.recursos)) d.contenido.recursos = [];
  if (!Array.isArray(d.contenido.secciones)) d.contenido.secciones = [];
  if (!Array.isArray(d.contenido.ruta)) d.contenido.ruta = [];
  if (!Array.isArray(d.contenido.alertas_revision)) d.contenido.alertas_revision = [];
  return d;
}

function firstNameV0166(name) {
  const p = String(name || '').trim().split(/\s+/).filter(Boolean);
  return p[0] || '';
}

function suggestAdolescentTemplateV0166(explicitGender) {
  const s = String(explicitGender || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (!s) return 'neutra';
  if (/trans|no bin|non.?binary|genero diverso|genderqueer|elle/.test(s)) return 'trans';
  if (/^(f|fem)|mujer|femenin|ella/.test(s)) return 'femenina';
  if (/^(m|masc)|hombre|varon|masculin|\bel\b/.test(s)) return 'masculina';
  return 'neutra';
}

function defaultPronounsV0166(template) {
  if (template === 'masculina') return 'él';
  if (template === 'femenina') return 'ella';
  if (template === 'trans') return '';
  return 'usar el nombre o segunda persona; evitar pronombres de género';
}

function templateLabelV0166(t) {
  return ({
    masculina:'Masculina · sobria',
    femenina:'Femenina · cálida',
    trans:'Trans / diversa · afirmativa',
    neutra:'Neutra · sin inferir género'
  })[t] || 'Neutra';
}

function syncAdolescentConfigV0166() {
  const c = getCurrentCase();
  const d = ensureAdolescentReturnV0166(c);
  const get = id => document.getElementById(id);
  if (get('adolescentTemplateSelect')) d.config.plantilla = get('adolescentTemplateSelect').value || 'neutra';
  if (get('adolescentAlias')) {
    const v = String(get('adolescentAlias').value || '').trim();
    d.config.alias = v;
    // Si se vacia el campo a mano, ya no cuenta como eleccion manual: vuelve
    // a autoderivarse del nombre del caso en el proximo acceso.
    if (!v) d.config._aliasManual = false;
  }
  if (get('adolescentPronouns')) d.config.pronombres = String(get('adolescentPronouns').value || '').trim();
  if (get('adolescentPaletteSelect')) d.config.paleta = get('adolescentPaletteSelect').value || 'auto';
  if (get('adolescentDepthSelect')) d.config.profundidad = get('adolescentDepthSelect').value || 'equilibrada';
  if (get('adolescentSensitiveToggle')) d.config.incluirSensibles = !!get('adolescentSensitiveToggle').checked;
  d.actualizado = new Date().toISOString();
}

function hydrateAdolescentProductV0166() {
  const c = getCurrentCase();
  const d = ensureAdolescentReturnV0166(c);
  const setVal=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v ?? '';};
  setVal('adolescentTemplateSelect', d.config.plantilla);
  setVal('adolescentAlias', d.config.alias);
  setVal('adolescentPronouns', d.config.pronombres);
  setVal('adolescentPaletteSelect', d.config.paleta);
  setVal('adolescentDepthSelect', d.config.profundidad);
  const st=document.getElementById('adolescentSensitiveToggle'); if(st) st.checked=d.config.incluirSensibles!==false;
  const editor=document.getElementById('adolescentJsonEditor');
  if(editor) editor.value = Object.keys(d.contenido || {}).length ? JSON.stringify(d.contenido,null,2) : '';
  renderAdolescentStatusV0166();
}

function renderAdolescentStatusV0166() {
  const host=document.getElementById('adolescentProductStatus'); if(!host) return;
  const d=ensureAdolescentReturnV0166(getCurrentCase());
  const sections=(d.contenido.secciones || []).length;
  const cards=(d.contenido.secciones || []).reduce((n,s)=>n+(Array.isArray(s.tarjetas)?s.tarjetas.length:0),0);
  const route=(d.contenido.ruta || []).length;
  const alerts=(d.contenido.alertas_revision || []).length;
  if(!sections){
    host.innerHTML='<span class="badge info">Aún no generada</span> La devolución se construirá con toda la información disponible y quedará lista para revisión.';
    return;
  }
  host.innerHTML=`<span class="badge ok">Contenido disponible</span> ${sections} secciones · ${cards} tarjetas · ${route} propuestas de ruta${alerts?` · <span class="badge warn">${alerts} alerta(s) de revisión</span>`:''}`;
}

function explicitIdentityInstructionV0166(config) {
  if(config.plantilla==='masculina') return 'Tratamiento masculino. Usa segunda persona y, cuando sea inevitable, formas masculinas coherentes.';
  if(config.plantilla==='femenina') return 'Tratamiento femenino. Usa segunda persona y, cuando sea inevitable, formas femeninas coherentes.';
  if(config.plantilla==='trans') return `Tratamiento trans/diverso afirmativo. Pronombres indicados por el profesional: ${config.pronombres || 'no informados'}. Si no hay pronombres explícitos, usa el nombre/alias y segunda persona, evitando suposiciones. No conviertas la identidad de género en tema clínico salvo que los datos la mencionen y sea pertinente.`;
  return 'Tratamiento neutro: usa segunda persona, el nombre/alias y construcciones sin género. No infieras identidad ni pronombres.';
}

function buildAdolescentPromptV0166() {
  syncInputsToState();
  syncAdolescentConfigV0166();
  const c=getCurrentCase(); const d=ensureAdolescentReturnV0166(c);
  const material=typeof buildEvaluationMaterialV0164==='function' ? buildEvaluationMaterialV0164() : aiScrubDeep({hc:c.hc,tras:{interpretations:c.interpretations,patterns:c.patterns,consolidated:c.consolidated},goldstein:c.goldstein,personalidad:c.personalidad,informe:c.informe,anexos:c.anexos},c.meta?.nombre);
  const alias=d.config.alias || 'la persona evaluada';
  const sensitive=d.config.incluirSensibles!==false
    ? 'Puedes incluir temas sensibles cuando sean necesarios para comprender el proceso, con lenguaje cuidadoso, breve y sin detalles innecesarios. Los asuntos que requieran contención directa deben quedar como invitación a conversarlos en consulta.'
    : 'No incluyas temas sensibles en el documento visible. Regístralos únicamente en alertas_revision para que el terapeuta decida cómo abordarlos.';
  const depth=({breve:'Mantén cada lectura muy breve: 35 a 60 palabras.',equilibrada:'Cada lectura visible suele requerir 45 a 85 palabras; la profundización, 25 a 60.',profunda:'Puedes usar 60 a 110 palabras por lectura cuando la complejidad lo justifique, sin convertirla en informe técnico.'})[d.config.profundidad] || '';
  return `# ROL\nEres un asistente de escritura terapéutica para adolescentes. Transformas una evaluación clínica completa en una devolución interactiva, cercana y comprensible, que será revisada por el psicólogo antes de entregarse. No redactas un informe técnico ni un diagnóstico. Hablas directamente con ${alias} en segunda persona, como lo haría su terapeuta en una conversación cuidadosa.\n\n# PROPÓSITO\nConstruye el contenido de una página HTML terapéutica que la persona adolescente pueda leer a su ritmo. Debe ayudarle a reconocerse, comprender tensiones de su historia, identificar recursos y elegir temas para continuar trabajando en consulta. La aplicación se encargará del diseño; tú devuelves únicamente el contenido estructurado en JSON.\n\n# TRATAMIENTO LINGÜÍSTICO\n${explicitIdentityInstructionV0166(d.config)}\nAlias que puede aparecer en la página: ${alias}.\n\n# MARCO CLÍNICO INTERNO\nIntegra experiencia vivida, vínculos, ambivalencias, contexto, funciones posibles de las respuestas, recursos, responsabilidad y posibilidades de reorganización. Puedes apoyarte internamente en una comprensión humanista-existencial y psicodinámica integrativa, abierta al diálogo de saberes, pero NO nombres escuelas, enfoques ni teorías en la salida.\n\n# REGLAS DE FIDELIDAD\n- Usa toda la información disponible: HC, TRAS, Goldstein, personalidad descriptiva, informe integrativo, notas y evaluaciones complementarias.\n- No reduzcas varios hechos relevantes a una etiqueta ni elimines contexto para acortar.\n- No inventes hechos, diagnósticos, intenciones, causalidades, recuerdos, emociones o vínculos.\n- Distingue de forma natural entre lo expresado, la comprensión prudente y lo que conviene conversar.\n- Conserva ambivalencias: afecto y enojo, cercanía y necesidad de espacio, recursos y vulnerabilidades pueden coexistir.\n- No muestres porcentajes, nombres de pruebas, escalas, clasificación Goldstein, lenguaje de MMPI ni terminología proyectiva. Traduce los hallazgos a experiencias cotidianas.\n- No conviertas cada área del TRAS en una tarjeta. Haz curaduría temática: agrupa sin perder la información central.\n- No repitas la misma idea en recursos, tarjetas, patrones, habilidades y ruta. Cada parte cumple una función diferente.\n- No incluyas secretos innecesarios, datos de contacto, nombres completos de terceros ni acusaciones no confirmadas.\n- Si hay contradicciones, vacíos o información que no debe exponerse directamente, llévala a alertas_revision.\n- ${sensitive}\n- Ante información de riesgo o sufrimiento intenso, evita detalles y mensajes alarmistas; formula apoyo, disponibilidad adulta y conversación directa, y agrega una alerta de revisión profesional.\n\n# VOZ\n- Cálida, honesta, respetuosa y no condescendiente. No infantilices.\n- No uses “el material sugiere”, “se evidencia”, “los resultados indican”, “desde una perspectiva”, “trastorno”, “rasgo”, “déficit” ni frases de plantilla.\n- Evita elogios vacíos. Los recursos deben estar sustentados en datos concretos.\n- No moralices ni dictes sentencias. Usa formulaciones como “aparece”, “a veces”, “podría ayudarte”, “podemos seguir hablando”.\n- La persona debe sentirse reconocida, no clasificada.\n- ${depth}\n\n# ARQUITECTURA DEL CONTENIDO\n1. Apertura: explica que no es examen ni veredicto y que puede leerlo por partes.\n2. Recursos: 6 a 10 apoyos, capacidades, intereses o vínculos concretos, en frases cortas.\n3. Secciones: entre 5 y 9 grandes temas. Prioriza, cuando existan: lo que sostiene; vínculos; relación consigo; emociones y decisiones; escuela/vida social; lo que duele y necesita cuidado; patrones repetidos; habilidades sociales. No fuerces secciones sin datos.\n4. Tarjetas: cada una tiene título, lectura visible y profundización opcional para “quiero saber más”. La lectura debe integrar contexto y significado; la profundización debe abrir una pregunta, acuerdo o posibilidad terapéutica, no repetir.\n5. Ruta: 5 a 9 asuntos concretos que la persona pueda elegir para la próxima sesión.\n6. Cierre: recuerda que nada es definitivo y que el proceso continúa acompañado.\n7. Alertas de revisión: solo para el terapeuta; no se muestran en la página exportada.\n\n# SALIDA OBLIGATORIA\nDevuelve SOLO un objeto JSON válido, sin markdown, backticks, comentarios ni texto antes o después. Escapa todas las comillas internas. Revisa llaves, corchetes, comas y cadenas antes de responder.\n\nESQUEMA EXACTO:\n{\n  "meta":{\n    "eyebrow":"frase breve de bienvenida con el alias",\n    "titulo":"título terapéutico original, breve y no diagnóstico",\n    "subtitulo":"una o dos frases que expliquen para qué sirve esta lectura"\n  },\n  "apertura":{\n    "texto":"uno o dos párrafos breves",\n    "firma":"José, tu psicólogo"\n  },\n  "recursos":["recurso concreto"],\n  "secciones":[\n    {\n      "id":"identificador-corto-sin-tildes",\n      "titulo":"título de la sección",\n      "introduccion":"frase breve",\n      "tarjetas":[\n        {\n          "titulo":"título cercano",\n          "lectura":"lectura principal",\n          "profundizacion":"texto opcional o cadena vacía",\n          "cuidado":"general|sensible"\n        }\n      ]\n    }\n  ],\n  "ruta":[{"titulo":"tema elegible","descripcion":"qué se podría trabajar"}],\n  "cierre":{"titulo":"Esto sigue abierto","texto":"cierre no determinista","firma":"Te espero en nuestra próxima sesión — José"},\n  "alertas_revision":["aspecto que el terapeuta debe revisar antes de publicar"]\n}\n\n# INFORMACIÓN CLÍNICA DESPERSONALIZADA\n${JSON.stringify(material,null,1)}`;
}

function normalizeAdolescentContentV0166(data) {
  const cleanText=v=>String(v ?? '').trim();
  const out={
    meta:{
      eyebrow:cleanText(data?.meta?.eyebrow),
      titulo:cleanText(data?.meta?.titulo),
      subtitulo:cleanText(data?.meta?.subtitulo)
    },
    apertura:{texto:cleanText(data?.apertura?.texto),firma:cleanText(data?.apertura?.firma)},
    recursos:Array.isArray(data?.recursos)?data.recursos.map(cleanText).filter(Boolean).slice(0,14):[],
    secciones:[],
    ruta:[],
    cierre:{titulo:cleanText(data?.cierre?.titulo),texto:cleanText(data?.cierre?.texto),firma:cleanText(data?.cierre?.firma)},
    alertas_revision:Array.isArray(data?.alertas_revision)?data.alertas_revision.map(cleanText).filter(Boolean).slice(0,20):[]
  };
  const seen=new Set();
  (Array.isArray(data?.secciones)?data.secciones:[]).slice(0,12).forEach((s,i)=>{
    const title=cleanText(s?.titulo); if(!title) return;
    let id=cleanText(s?.id).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `seccion-${i+1}`;
    while(seen.has(id)) id += '-x'; seen.add(id);
    const cards=(Array.isArray(s?.tarjetas)?s.tarjetas:[]).slice(0,16).map(t=>({
      titulo:cleanText(t?.titulo), lectura:cleanText(t?.lectura), profundizacion:cleanText(t?.profundizacion), cuidado:t?.cuidado==='sensible'?'sensible':'general'
    })).filter(t=>t.titulo && t.lectura);
    if(cards.length) out.secciones.push({id,titulo:title,introduccion:cleanText(s?.introduccion),tarjetas:cards});
  });
  out.ruta=(Array.isArray(data?.ruta)?data.ruta:[]).slice(0,12).map(r=>({titulo:cleanText(r?.titulo),descripcion:cleanText(r?.descripcion)})).filter(r=>r.titulo && r.descripcion);
  if(!out.meta.titulo) out.meta.titulo='Tu historia, a tu ritmo';
  if(!out.meta.eyebrow) out.meta.eyebrow='Un espacio solo para ti';
  if(!out.meta.subtitulo) out.meta.subtitulo='Una lectura para comprenderte con calma y continuar conversando.';
  if(!out.apertura.texto) out.apertura.texto='Esto no es un examen ni un veredicto. Es una forma de reunir lo que hemos ido comprendiendo para que puedas leerlo a tu ritmo y seguir hablándolo en consulta.';
  if(!out.apertura.firma) out.apertura.firma='José, tu psicólogo';
  if(!out.cierre.titulo) out.cierre.titulo='Esto sigue abierto';
  if(!out.cierre.texto) out.cierre.texto='Nada de lo que aparece aquí te define de manera definitiva. Eres una persona en movimiento y lo que sigue lo construimos juntos, a tu ritmo.';
  if(!out.cierre.firma) out.cierre.firma='Te espero en nuestra próxima sesión — José';
  return out;
}

registerAiFlow('devolucion_adolescente', {
  titulo:'Devolución terapéutica para adolescente',
  hint:'Un solo impulso transforma toda la evaluación en una lectura interactiva, cercana y revisable antes de exportarla a Cloudflare.',
  aviso:'<strong>Revisión obligatoria:</strong> la página hablará directamente con la persona adolescente. Verifica identidad, pronombres, temas sensibles, información de terceros y oportunidad terapéutica antes de publicar.',
  requiredKeys:['meta','apertura','recursos','secciones','ruta','cierre'],
  buildPrompt:buildAdolescentPromptV0166,
  apply(data){
    const c=getCurrentCase(); const d=ensureAdolescentReturnV0166(c);
    const normalized=normalizeAdolescentContentV0166(data);
    if(!normalized.secciones.length) throw new Error('La respuesta no contiene secciones terapéuticas utilizables.');
    d.contenido=normalized;
    d.fuente='ia-manual'; d.actualizado=new Date().toISOString();
    const editor=document.getElementById('adolescentJsonEditor'); if(editor) editor.value=JSON.stringify(normalized,null,2);
    renderAdolescentStatusV0166();
    return `Devolución insertada: ${normalized.secciones.length} secciones y ${normalized.secciones.reduce((n,s)=>n+s.tarjetas.length,0)} tarjetas. Revísala antes de exportar.`;
  }
});

function applyAdolescentEditorV0166() {
  const el=document.getElementById('adolescentJsonEditor'); if(!el) return;
  try{
    const data=JSON.parse(typeof aiSanitize==='function'?aiSanitize(el.value):el.value);
    const normalized=normalizeAdolescentContentV0166(data);
    if(!normalized.secciones.length) throw new Error('Se requiere al menos una sección con tarjetas.');
    const d=ensureAdolescentReturnV0166(getCurrentCase()); d.contenido=normalized; d.fuente='edicion-manual'; d.actualizado=new Date().toISOString();
    el.value=JSON.stringify(normalized,null,2); persist('Devolución adolescente editada'); renderAdolescentStatusV0166(); toast('Cambios aplicados.','ok');
  }catch(e){ toast('No se pudo aplicar el JSON: '+e.message,'danger',5000); }
}

function clearAdolescentReturnV0166() {
  if(!confirm('¿Vaciar la devolución terapéutica de este caso?')) return;
  const d=ensureAdolescentReturnV0166(getCurrentCase()); d.contenido={recursos:[],secciones:[],ruta:[],alertas_revision:[]}; d.fuente=''; d.actualizado=new Date().toISOString();
  const el=document.getElementById('adolescentJsonEditor'); if(el)el.value=''; persist('Devolución adolescente vaciada'); renderAdolescentStatusV0166(); renderSelectedReportPreview();
}

function escV0166(v){return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function paragraphsV0166(v){return String(v||'').split(/\n{2,}/).map(p=>`<p>${escV0166(p).replace(/\n/g,'<br>')}</p>`).join('');}

const ADOLESCENT_PALETTES_V0166={
  femenina:{ink:'#26332c',inkSoft:'#4a5850',paper:'#f3efe3',raised:'#faf7ee',accent:'#c07a83',accentSoft:'#e9d3d3',support:'#748c78',supportSoft:'#dbe4d8',gold:'#b4863c',goldSoft:'#ecdcb9',line:'#d8d0bd'},
  masculina:{ink:'#203142',inkSoft:'#526274',paper:'#edf2f5',raised:'#f9fbfc',accent:'#376b8c',accentSoft:'#d7e6ef',support:'#657a69',supportSoft:'#dfe8df',gold:'#a77b35',goldSoft:'#eadab9',line:'#d0dbe2'},
  trans:{ink:'#29283c',inkSoft:'#5d5a72',paper:'#f2eff7',raised:'#fbf9fd',accent:'#7556a8',accentSoft:'#e5dcf2',support:'#31877f',supportSoft:'#d8eeeb',gold:'#b27b45',goldSoft:'#f0dec8',line:'#d9d1e6'},
  neutra:{ink:'#29332f',inkSoft:'#59645f',paper:'#f1f0e8',raised:'#faf9f4',accent:'#6f7f72',accentSoft:'#dfe6df',support:'#92724d',supportSoft:'#ece0d2',gold:'#a47d36',goldSoft:'#eadbb8',line:'#d7d3c5'},
  oceano:{ink:'#1d3545',inkSoft:'#536c79',paper:'#edf5f6',raised:'#fbfefe',accent:'#2f7f8c',accentSoft:'#d4ecef',support:'#5d7599',supportSoft:'#dfe7f2',gold:'#b1843b',goldSoft:'#efdfbf',line:'#cfe0e3'},
  bosque:{ink:'#25362c',inkSoft:'#52645a',paper:'#eef2e9',raised:'#fbfcf8',accent:'#5f8068',accentSoft:'#dbe8dc',support:'#916d4f',supportSoft:'#eadfd4',gold:'#a9863f',goldSoft:'#ecdfbd',line:'#d2ddcf'},
  violeta:{ink:'#302b42',inkSoft:'#625d75',paper:'#f3eff7',raised:'#fcfafd',accent:'#7657a6',accentSoft:'#e5dcf1',support:'#a1677c',supportSoft:'#efdde4',gold:'#b3873f',goldSoft:'#efdfbf',line:'#ddd4e7'}
};

function paletteV0166(config){
  const key=config.paleta && config.paleta!=='auto'?config.paleta:config.plantilla;
  return ADOLESCENT_PALETTES_V0166[key] || ADOLESCENT_PALETTES_V0166.neutra;
}

function buildTherapeuticHtmlV0166() {
  syncAdolescentConfigV0166();
  const c=getCurrentCase(); const d=ensureAdolescentReturnV0166(c); const x=d.contenido||{};
  if(!(x.secciones||[]).length) throw new Error('Primero genere o pegue la devolución terapéutica.');
  const p=paletteV0166(d.config); const alias=d.config.alias||firstNameV0166(c.meta?.nombre)||'ti';
  const nav=(x.secciones||[]).map(s=>`<button class="trail-dot" data-target="sec-${escV0166(s.id)}"><span class="dot"></span><span>${escV0166(s.titulo)}</span></button>`).join('<span class="trail-connector"></span>') + `<span class="trail-connector"></span><button class="trail-dot" data-target="sec-ruta"><span class="dot"></span><span>Nuestra ruta</span></button>`;
  const sections=(x.secciones||[]).map((s,idx)=>`<section class="macro" id="sec-${escV0166(s.id)}" data-label="${escV0166(s.titulo)}"><div class="macro-head"><span class="macro-num">${String(idx+2).padStart(2,'0')}</span><h2>${escV0166(s.titulo)}</h2></div>${s.introduccion?`<p class="macro-intro">${escV0166(s.introduccion)}</p>`:''}<div class="cards">${(s.tarjetas||[]).map(t=>`<article class="card${t.cuidado==='sensible'?' sensitive':''}"><button class="card-head" type="button"><span>${escV0166(t.titulo)}</span><span class="stitch-mark" aria-hidden="true"></span></button><div class="card-body"><div class="card-body-inner">${paragraphsV0166(t.lectura)}${t.profundizacion?`<button class="more-toggle" type="button">quiero saber más</button><div class="more-body"><div class="more-body-inner">${paragraphsV0166(t.profundizacion)}</div></div>`:''}</div></div></article>`).join('')}</div></section>`).join('');
  const resources=(x.recursos||[]).map(r=>`<span class="chip">${escV0166(r)}</span>`).join('');
  const route=(x.ruta||[]).map((r,i)=>`<button class="route-stop" type="button" data-title="${escV0166(r.titulo)}"><span class="route-mark">${i+1}</span><span class="route-text"><h3>${escV0166(r.titulo)}</h3><p>${escV0166(r.descripcion)}</p></span></button>`).join('');
  const key=('tras-therapeutic-'+(c.id||c.meta?.numero||alias)).replace(/[^a-z0-9_-]/gi,'-').toLowerCase();
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="theme-color" content="${p.paper}"><title>${escV0166(x.meta?.titulo||'Tu historia')} — ${escV0166(alias)}</title><style>
:root{--ink:${p.ink};--ink-soft:${p.inkSoft};--paper:${p.paper};--raised:${p.raised};--accent:${p.accent};--accent-soft:${p.accentSoft};--support:${p.support};--support-soft:${p.supportSoft};--gold:${p.gold};--gold-soft:${p.goldSoft};--line:${p.line};--shadow:0 14px 36px -22px rgba(32,45,40,.38);--radius:18px}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.62;-webkit-font-smoothing:antialiased}h1,h2,h3{font-family:Georgia,"Times New Roman",serif;font-weight:500;letter-spacing:-.012em}.thread-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.46}.trail-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:10px 14px}.trail-track{max-width:940px;margin:auto;display:flex;align-items:center;overflow-x:auto;scrollbar-width:none}.trail-track::-webkit-scrollbar{display:none}.trail-dot{flex:0 0 auto;display:flex;align-items:center;gap:7px;background:none;border:0;cursor:pointer;padding:7px 10px;border-radius:999px;font:600 .69rem ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-soft);white-space:nowrap}.trail-dot .dot{width:8px;height:8px;border-radius:50%;background:var(--line)}.trail-dot.active{color:var(--ink);background:var(--raised)}.trail-dot.active .dot{background:var(--accent);transform:scale(1.25)}.trail-connector{width:14px;height:1px;background:var(--line);flex:0 0 auto}.listen-btn{margin-left:auto;background:var(--gold-soft)!important;color:var(--ink)!important;border:1px solid var(--gold)!important}.listen-btn .dot{background:var(--gold)!important}.listen-btn.speaking{background:var(--accent)!important;color:var(--paper)!important;border-color:var(--accent)!important}.listen-btn.speaking .dot{background:var(--paper)!important}.wrap{max-width:780px;margin:auto;padding:0 24px;position:relative;z-index:1}.hero{padding:72px 0 52px;text-align:center}.eyebrow{font:600 .72rem ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}.hero h1{font-size:clamp(2.15rem,6vw,3.25rem);line-height:1.1;margin:17px 0 20px}.hero h1 em{color:var(--accent);font-style:italic}.hero p{max-width:570px;margin:auto;color:var(--ink-soft);font-size:1.03rem}.hero-stitch{width:100%;height:50px;margin-top:30px}.note-card{background:var(--raised);border:1px solid var(--line);border-radius:var(--radius);padding:25px 28px;box-shadow:var(--shadow);margin-bottom:60px}.note-card p{margin:0 0 12px}.signed{font-family:Georgia,serif;font-style:italic;color:var(--ink-soft);margin-top:16px}.macro{padding:32px 0 10px;scroll-margin-top:72px}.macro-head{display:flex;align-items:baseline;gap:13px}.macro-num{font:600 .78rem ui-monospace,monospace;color:var(--gold)}.macro h2{font-size:1.72rem;margin:0}.macro-intro{color:var(--ink-soft);max-width:590px;margin:10px 0 25px}.chips{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 40px}.chip{background:var(--support-soft);border:1px solid color-mix(in srgb,var(--support) 72%,transparent);padding:8px 14px;border-radius:999px;font-size:.89rem;font-weight:600}.card{background:var(--raised);border:1px solid var(--line);border-radius:var(--radius);margin-bottom:13px;overflow:hidden;box-shadow:0 6px 22px -22px rgba(0,0,0,.4)}.card.sensitive{border-left:4px solid var(--gold)}.card-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:0;text-align:left;padding:17px 21px;cursor:pointer;font:500 1.08rem Georgia,serif;color:var(--ink)}.stitch-mark{flex:0 0 auto;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--accent);position:relative}.stitch-mark:before,.stitch-mark:after{content:"";position:absolute;background:var(--accent);width:9px;height:1.5px;top:9.5px;left:5.5px}.stitch-mark:before{transform:rotate(45deg)}.stitch-mark:after{transform:rotate(-45deg)}.card.open .stitch-mark:after{display:none}.card.open .stitch-mark:before{transform:none;width:11px;left:4.5px}.card-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .38s ease}.card.open .card-body{grid-template-rows:1fr}.card-body-inner{overflow:hidden;min-height:0;padding:0 21px 21px 55px;color:var(--ink-soft)}.card-body-inner p{margin:0 0 11px}.more-toggle{background:none;border:0;padding:0;color:var(--gold);cursor:pointer;font:600 .72rem ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase}.more-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease;border-left:2px solid var(--accent-soft);padding-left:14px}.more-body.open{grid-template-rows:1fr;margin-top:12px}.more-body-inner{overflow:hidden;min-height:0;color:var(--ink);font-style:italic}.route-list{position:relative;margin:8px 0 20px}.route-list:before{content:"";position:absolute;left:17px;top:16px;bottom:16px;border-left:1.5px dashed var(--accent-soft)}.route-stop{position:relative;display:flex;align-items:flex-start;gap:17px;padding:13px 10px 13px 0;border:0;background:none;width:100%;text-align:left;cursor:pointer;color:var(--ink)}.route-mark{flex:0 0 auto;width:35px;height:35px;border-radius:50%;background:var(--raised);border:1.5px solid var(--accent);color:var(--accent);display:flex;align-items:center;justify-content:center;font:600 .78rem ui-monospace,monospace;z-index:1}.route-text h3{font-family:system-ui,sans-serif;font-size:1rem;font-weight:650;margin:1px 0 4px}.route-text p{margin:0;color:var(--ink-soft);font-size:.94rem}.route-stop.chosen .route-mark{background:var(--accent);color:var(--raised);transform:scale(1.06)}.route-stop.chosen h3{color:var(--accent)}.route-counter{font:500 .75rem ui-monospace,monospace;color:var(--ink-soft)}.conversation-box{margin:20px 0;background:var(--raised);border:1px solid var(--line);border-radius:14px;padding:14px;display:none}.conversation-box.show{display:block}.conversation-box textarea{width:100%;min-height:100px;border:1px solid var(--line);border-radius:10px;padding:11px;background:var(--paper);color:var(--ink);font:inherit}.small-btn{border:1px solid var(--accent);background:var(--accent);color:white;border-radius:10px;padding:9px 13px;font-weight:700;cursor:pointer}.small-btn.secondary{background:transparent;color:var(--accent)}.route-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:15px}.closing{padding:56px 0 88px;text-align:center}.closing-card{background:var(--ink);color:var(--paper);border-radius:var(--radius);padding:42px 30px}.closing-card h2{color:var(--paper);font-size:1.7rem}.closing-card p{color:color-mix(in srgb,var(--paper) 83%,transparent);max-width:500px;margin:14px auto 0}.closing-card .signed{color:var(--gold-soft);margin-top:24px}footer{text-align:center;padding:26px 22px 46px;font:500 .71rem ui-monospace,monospace;color:var(--ink-soft)}footer p{margin:3px 0}@media(max-width:600px){.wrap{padding:0 16px}.hero{padding:50px 0 34px}.note-card{padding:19px 18px;margin-bottom:45px}.card-head{padding:15px 16px}.card-body-inner{padding:0 15px 18px 42px}.macro{padding-top:25px}.closing-card{padding:34px 20px}.trail-nav{padding-inline:5px}}@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}@media print{.trail-nav,.route-actions,.conversation-box{display:none!important}.card-body{grid-template-rows:1fr!important}.more-body{grid-template-rows:1fr!important}.wrap{max-width:none}.thread-bg{display:none}}
</style></head><body><svg class="thread-bg" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="threadpattern" width="180" height="180" patternUnits="userSpaceOnUse"><path d="M0 90 Q45 30 90 90 T180 90" stroke="${p.line}" stroke-width="1" fill="none" stroke-dasharray="2 7"/></pattern></defs><rect width="100%" height="100%" fill="url(#threadpattern)"/></svg><nav class="trail-nav"><div class="trail-track">${nav}<span class="trail-connector"></span><button class="trail-dot listen-btn" id="listenBtn" type="button" aria-label="Escuchar esta página en voz alta"><span class="dot"></span><span>Escuchar</span></button></div></nav><header class="hero wrap"><span class="eyebrow">${escV0166(x.meta?.eyebrow||`Un espacio solo para ti · ${alias}`)}</span><h1>${escV0166(x.meta?.titulo||'Tu historia, a tu ritmo')}</h1><p>${escV0166(x.meta?.subtitulo||'Una lectura para comprenderte con calma.')}</p><svg class="hero-stitch" viewBox="0 0 400 40" xmlns="http://www.w3.org/2000/svg"><path d="M0 20 Q25 2 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20" stroke="${p.accent}" stroke-width="1.5" fill="none" stroke-dasharray="1 8" stroke-linecap="round"/></svg></header><main class="wrap"><div class="note-card">${paragraphsV0166(x.apertura?.texto)}<p class="signed">— ${escV0166(x.apertura?.firma||'José, tu psicólogo')}</p></div><section class="macro" id="sec-recursos" data-label="Lo que te sostiene"><div class="macro-head"><span class="macro-num">01</span><h2>Lo que te sostiene</h2></div><p class="macro-intro">Antes de hablar de lo que pesa, vale la pena reconocer lo que ya está contigo y puede ayudarte a construir lo que sigue.</p><div class="chips">${resources}</div></section>${sections}<section class="macro" id="sec-ruta" data-label="Nuestra ruta"><div class="macro-head"><span class="macro-num">${String((x.secciones||[]).length+2).padStart(2,'0')}</span><h2>Nuestra ruta</h2></div><p class="macro-intro">No hay que trabajar todo al mismo tiempo. Puedes marcar los temas que sientas más cercanos para llevarlos a la próxima sesión.</p><div class="route-list">${route}</div><p class="route-counter">Toca los temas por los que te gustaría empezar.</p><div class="route-actions"><button class="small-btn" id="prepareConversation" type="button">Preparar lo que quiero conversar</button><button class="small-btn secondary" id="clearRoute" type="button">Limpiar selección</button></div><div class="conversation-box"><textarea readonly aria-label="Temas elegidos"></textarea><div class="route-actions"><button class="small-btn" id="copyConversation" type="button">Copiar para mi sesión</button></div></div></section><section class="closing"><div class="closing-card"><h2>${escV0166(x.cierre?.titulo||'Esto sigue abierto')}</h2>${paragraphsV0166(x.cierre?.texto)}<p class="signed">${escV0166(x.cierre?.firma||'Te espero en nuestra próxima sesión — José')}</p></div></section></main><footer><p>PhD. José Alonso Andrade Salazar · Psicólogo clínico · Reg. 117492</p><p>Documento de acompañamiento terapéutico, no diagnóstico.</p><p>Preparado para ${escV0166(alias)} · ${escV0166(new Date().toLocaleDateString('es-CO'))}</p></footer><script>
(()=>{const KEY=${JSON.stringify(key)};const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];qa('.card-head').forEach(b=>b.addEventListener('click',()=>b.closest('.card').classList.toggle('open')));qa('.more-toggle').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const m=b.nextElementSibling;const open=m.classList.toggle('open');b.textContent=open?'ocultar':'quiero saber más'}));let chosen=new Set(JSON.parse(localStorage.getItem(KEY)||'[]'));const stops=qa('.route-stop');function draw(){stops.forEach((s,i)=>s.classList.toggle('chosen',chosen.has(i)));q('.route-counter').textContent=chosen.size?('Elegiste '+chosen.size+' tema'+(chosen.size>1?'s':'')+' para empezar — podemos llevarlos a la próxima sesión.'):'Toca los temas por los que te gustaría empezar.';localStorage.setItem(KEY,JSON.stringify([...chosen]))}stops.forEach((s,i)=>s.addEventListener('click',()=>{chosen.has(i)?chosen.delete(i):chosen.add(i);draw()}));draw();q('#clearRoute').addEventListener('click',()=>{chosen.clear();draw();q('.conversation-box').classList.remove('show')});q('#prepareConversation').addEventListener('click',()=>{const text=chosen.size?'En nuestra próxima sesión me gustaría empezar por:\\n'+[...chosen].map(i=>'• '+stops[i].dataset.title).join('\\n'):'Todavía no elegí un tema. Podemos decidirlo juntos en la sesión.';q('.conversation-box textarea').value=text;q('.conversation-box').classList.add('show');q('.conversation-box').scrollIntoView({behavior:'smooth',block:'center'})});q('#copyConversation').addEventListener('click',async()=>{const t=q('.conversation-box textarea');try{await navigator.clipboard.writeText(t.value);q('#copyConversation').textContent='Copiado'}catch(e){t.select();document.execCommand('copy')}});qa('.trail-dot').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})));const sections=qa('.macro');const navs=qa('.trail-dot');const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){navs.forEach(n=>n.classList.toggle('active',n.dataset.target===e.target.id))}}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>obs.observe(s));
/* Lectura en voz alta: nativa del navegador, sin dependencias ni conexion.
   Lee en orden la apertura, cada seccion (titulo + intro + lectura de cada
   tarjeta, incluida la profundizacion si existe) y el cierre. */
const listenBtn=q('#listenBtn');
if(listenBtn){
  if(!('speechSynthesis' in window)){ listenBtn.style.display='none'; }
  else {
    const collectTexts=()=>{
      const parts=[];
      const opening=q('.note-card'); if(opening) parts.push(opening.textContent.trim());
      qa('.macro').forEach(sec=>{
        const h2=sec.querySelector('h2'); if(h2) parts.push(h2.textContent.trim());
        const intro=sec.querySelector('.macro-intro'); if(intro) parts.push(intro.textContent.trim());
        sec.querySelectorAll('.card').forEach(card=>{
          const t=card.querySelector('.card-head span'); if(t) parts.push(t.textContent.trim());
          card.querySelectorAll('.card-body-inner p, .more-body-inner p').forEach(p=>parts.push(p.textContent.trim()));
        });
      });
      const closing=q('.closing-card'); if(closing) parts.push(closing.textContent.trim());
      return parts.filter(Boolean);
    };
    const pickVoice=()=>{
      const voices=window.speechSynthesis.getVoices();
      return voices.find(v=>/^es/i.test(v.lang)) || voices[0] || null;
    };
    let queue=[]; let idx=0; let state='idle';
    const setLabel=(txt)=>{ const s=listenBtn.querySelector('span:last-child'); if(s) s.textContent=txt; };
    const speakNext=()=>{
      if(idx>=queue.length){ state='idle'; listenBtn.classList.remove('speaking'); setLabel('Escuchar'); return; }
      const u=new SpeechSynthesisUtterance(queue[idx]);
      u.lang='es-CO'; const v=pickVoice(); if(v) u.voice=v;
      u.rate=0.98;
      u.onend=()=>{ idx++; speakNext(); };
      u.onerror=()=>{ idx++; speakNext(); };
      window.speechSynthesis.speak(u);
    };
    listenBtn.addEventListener('click',()=>{
      if(state==='idle'){
        queue=collectTexts(); idx=0; state='speaking';
        listenBtn.classList.add('speaking'); setLabel('Pausar');
        window.speechSynthesis.cancel(); speakNext();
      } else if(state==='speaking'){
        window.speechSynthesis.pause(); state='paused'; setLabel('Reanudar');
      } else if(state==='paused'){
        window.speechSynthesis.resume(); state='speaking'; setLabel('Pausar');
      }
    });
    window.addEventListener('beforeunload',()=>window.speechSynthesis.cancel());
  }
}
})();
<\/script></body></html>`;
}

function previewAdolescentReturnV0166() {
  try{
    syncAdolescentConfigV0166(); persist('Configuración de devolución terapéutica');
    const html=buildTherapeuticHtmlV0166(); const host=document.getElementById('reportPreview'); if(!host) return;
    host.innerHTML='<iframe class="therapeutic-preview-frame" title="Vista previa de devolución terapéutica"></iframe>';
    host.querySelector('iframe').srcdoc=html;
    host.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){toast(e.message,'warn',4500);}
}

function exportAdolescentReturnV0166() {
  try{
    syncAdolescentConfigV0166(); persist('Configuración de devolución terapéutica');
    const c=getCurrentCase(); const html=buildTherapeuticHtmlV0166();
    const alias=ensureAdolescentReturnV0166(c).config.alias || 'adolescente';
    const base=(caseFileSlug(c)+'_devolucion_'+alias).replace(/[^a-z0-9_-]+/gi,'_');
    downloadFile(base+'.html',html,'text/html;charset=utf-8'); toast('Devolución terapéutica exportada en HTML.','ok');
  }catch(e){toast(e.message,'danger',5000);}
}

function saveAdolescentConfigV0166(){syncAdolescentConfigV0166();persist('Configuración de devolución terapéutica');renderAdolescentStatusV0166();toast('Configuración guardada.','ok');}

/* Integración con el selector general de informes. */
const V0166_BASE_GET_SELECTED_REPORT_HTML = typeof getSelectedReportHtml==='function' ? getSelectedReportHtml : null;
if(V0166_BASE_GET_SELECTED_REPORT_HTML){
  getSelectedReportHtml = function getSelectedReportHtmlV0166(type,audience){
    type=type||selectedReportType();
    if(type==='adolescente') return buildTherapeuticHtmlV0166();
    return V0166_BASE_GET_SELECTED_REPORT_HTML(type,audience);
  };
}

const V0166_BASE_RENDER_PREVIEW = typeof renderSelectedReportPreview==='function' ? renderSelectedReportPreview : null;
if(V0166_BASE_RENDER_PREVIEW){
  renderSelectedReportPreview = function renderSelectedReportPreviewV0166(){
    if(selectedReportType()==='adolescente'){previewAdolescentReturnV0166();return;}
    V0166_BASE_RENDER_PREVIEW();
  };
}

const V0166_BASE_EXPORT_SELECTED = typeof exportSelectedReport==='function' ? exportSelectedReport : null;
if(V0166_BASE_EXPORT_SELECTED){
  exportSelectedReport = function exportSelectedReportV0166(){
    if(selectedReportType()==='adolescente'){
      const format=document.getElementById('reportFormatSelect')?.value||'html';
      if(format==='html'){exportAdolescentReturnV0166();return;}
      if(format==='json'){
        const c=getCurrentCase(),d=ensureAdolescentReturnV0166(c);downloadFile((caseFileSlug(c)+'_devolucion_adolescente.json'),JSON.stringify({caso:{id:c.id,meta:c.meta},devolucion:d,exportado:new Date().toISOString(),app:APP_VERSION},null,2),'application/json');return;
      }
      toast('La devolución interactiva se exporta en HTML o JSON. Selecciona HTML para subirla a Cloudflare.','warn',5200);return;
    }
    V0166_BASE_EXPORT_SELECTED();
  };
}

/* La identidad se sugiere solo desde el campo explícito sexo/género. */
function refreshAdolescentTemplateSuggestionV0166(force=false){
  const c=getCurrentCase(),d=ensureAdolescentReturnV0166(c); if(force || !d.config._chosenManually){d.config.plantilla=suggestAdolescentTemplateV0166(c.meta?.sexo||'');d.config.pronombres=defaultPronounsV0166(d.config.plantilla);hydrateAdolescentProductV0166();}
}
function markAdolescentTemplateManualV0166(){const d=ensureAdolescentReturnV0166(getCurrentCase());d.config._chosenManually=true;syncAdolescentConfigV0166();persist();}
function markAdolescentAliasManualV0166(){const d=ensureAdolescentReturnV0166(getCurrentCase());d.config._aliasManual=true;}

const V0166_BASE_HYDRATE = typeof hydrateInputs==='function' ? hydrateInputs : null;
if(V0166_BASE_HYDRATE){
  hydrateInputs = function hydrateInputsV0166(){V0166_BASE_HYDRATE();ensureAdolescentReturnV0166(getCurrentCase());hydrateAdolescentProductV0166();};
}

const V0166_BASE_SYNC = typeof syncInputsToState==='function' ? syncInputsToState : null;
if(V0166_BASE_SYNC){
  syncInputsToState = function syncInputsToStateV0166(){V0166_BASE_SYNC();syncAdolescentConfigV0166();};
}

/* Añade el nuevo producto a la vista de visibilidad del centro. */
const V0166_BASE_RENDER_VIS = typeof renderReportProductVisibility==='function' ? renderReportProductVisibility : null;
if(V0166_BASE_RENDER_VIS){
  renderReportProductVisibility = function renderReportProductVisibilityV0166(){V0166_BASE_RENDER_VIS();const card=document.querySelector('[data-product="adolescente"]');if(card)card.classList.remove('hidden');};
}

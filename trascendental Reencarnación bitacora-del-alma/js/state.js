/* ============================================================
   BITÁCORA DEL ALMA — motor de la aplicación
   Herramienta simbólico-reflexiva. Ningún dato aquí constituye
   verificación histórica ni diagnóstico de ningún tipo.
   ============================================================ */

const STORAGE_PREFIX = 'balma';

/* ---------- datos fijos (equivalente a los hexagramas del I Ching) ---------- */

const ARQUETIPOS = [
  { id:'guardian',  nombre:'El Guardián',   desc:'protege lo que otros no pueden sostener' },
  { id:'sanador',   nombre:'El Sanador',    desc:'aprende transformando el dolor propio en alivio ajeno' },
  { id:'maestro',   nombre:'El Maestro',    desc:'enseña incluso cuando calla' },
  { id:'aprendiz',  nombre:'El Aprendiz',   desc:'vuelve una y otra vez a lo que aún no comprende del todo' },
  { id:'mediador',  nombre:'El Mediador',   desc:'busca el punto donde dos verdades pueden convivir' },
  { id:'guerrero',  nombre:'El Guerrero',   desc:'aprende la fuerza, y después aprende cuándo no usarla' },
  { id:'errante',   nombre:'El Errante',    desc:'no echa raíz para poder ver más' },
  { id:'tejedor',   nombre:'El Tejedor',    desc:'une historias, personas y tiempos que parecían sueltos' },
];

const APRENDIZAJES = [
  { id:'perdon',    nombre:'Perdón',     desc:'soltar una cuenta que ya no hay que seguir cobrando' },
  { id:'desapego',  nombre:'Desapego',   desc:'sostener sin poseer' },
  { id:'coraje',    nombre:'Coraje',     desc:'actuar antes de sentirse completamente listo' },
  { id:'confianza', nombre:'Confianza',  desc:'entregarse a algo sin garantía de control' },
  { id:'servicio',  nombre:'Servicio',   desc:'dar sin que el gesto vuelva convertido en deuda' },
  { id:'humildad',  nombre:'Humildad',   desc:'aprender de quien se cree que ya no tiene nada que enseñar' },
  { id:'limite',    nombre:'Límite',     desc:'aprender a decir hasta aquí sin culpa' },
  { id:'presencia', nombre:'Presencia',  desc:'quedarse, en vez de huir hacia adelante o hacia atrás' },
];

const ANTIGUEDAD = [
  { id:'joven',      nombre:'Alma joven',      desc:'está en etapas tempranas de reconocerse a sí misma' },
  { id:'intermedia',  nombre:'Alma intermedia', desc:'ya distingue sus patrones, pero aún los repite' },
  { id:'vieja',       nombre:'Alma vieja',      desc:'reconoce sus lecciones casi apenas empiezan' },
  { id:'muy_antigua', nombre:'Alma muy antigua',desc:'carga una calma que no parece aprendida en esta vida' },
];

/* ---------- estado global de la sesión en curso ---------- */

let cur = {
  alias: '',
  moduloA: { autodescripcion:'', patron:'', rasgo:'', sensaciones:'' },
  moduloB: { presencias:'', amigoImaginario:'', suenoGuia:'', nombrePresencia:'' },
  moduloC: [], // { nombre, tipoVinculo, notas }
  moduloD: { descripcion:'' }, // mapa familiar y relacional, texto libre estructurado por voz/texto
  moduloE: [], // eventos difíciles: { etapaVida, personas, sentimientos, esKarmico, descripcion }
  tirada: null, // { antiguedad, arquetipo, aprendizaje }
  promptGenerado: '',
  respuestaIA: '',
  informe: null, // parseado
  cronica: null,
  generationMeta: { lecturaDatosSignature:null, lecturaGeneradaEn:null, cronicaInformeSignature:null, cronicaGeneradaEn:null },
  ajustesInforme: { periodos: [], observaciones: [], correccionesEtapa: [] },
  _narrativaVinculos: '',
  _promptExtraccion: '',
  _historiaCompleta: '',
  _promptImportacion: '',
  _editingEntryId: null,
};

let vinculoTemp = { nombre:'', tipoVinculo:'', parentesco:'', notas:'' };
let eventoTemp = { etapaVida:'', personas:'', sentimientos:'', esKarmico:'', descripcion:'' };

/* ---------- vigencia de lectura, crónica y derivados ---------- */

function stableSerialize(value){
  const seen = new WeakSet();
  const normalize = (v)=>{
    if(v === null || typeof v !== 'object') return v;
    if(seen.has(v)) return '[circular]';
    seen.add(v);
    if(Array.isArray(v)) return v.map(normalize);
    const out = {};
    Object.keys(v).sort().forEach(k=>{ out[k] = normalize(v[k]); });
    return out;
  };
  try{ return JSON.stringify(normalize(value)); }
  catch(e){ return JSON.stringify(String(value || '')); }
}

function compactSignature(value){
  const txt = stableSerialize(value);
  let h = 2166136261;
  for(let i=0; i<txt.length; i++){
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `v1-${(h >>> 0).toString(16).padStart(8,'0')}-${txt.length}`;
}

function lecturaDataPayload(source=cur){
  return {
    alias: source && source.alias || '',
    moduloA: source && source.moduloA || {},
    moduloB: source && source.moduloB || {},
    moduloC: source && source.moduloC || [],
    moduloD: source && source.moduloD || {},
    moduloE: source && source.moduloE || [],
    tirada: source && source.tirada || null,
    ajustesInforme: source && source.ajustesInforme || { periodos:[], observaciones:[], correccionesEtapa:[] }
  };
}

function cronicaSourcePayload(source=cur){
  return {
    alias: source && source.alias || '',
    informe: source && source.informe || null
  };
}

function ensureGenerationMeta(target=cur, legacyDate=null){
  if(!target.generationMeta || typeof target.generationMeta !== 'object') target.generationMeta = {};
  const m = target.generationMeta;
  const fechaBase = legacyDate || target.updatedAt || target.fecha || new Date().toISOString();
  if(target.informe && !m.lecturaDatosSignature){
    m.lecturaDatosSignature = compactSignature(lecturaDataPayload(target));
    m.lecturaGeneradaEn = m.lecturaGeneradaEn || fechaBase;
  }
  if(target.cronica && target.informe && !m.cronicaInformeSignature){
    m.cronicaInformeSignature = compactSignature(cronicaSourcePayload(target));
    m.cronicaGeneradaEn = m.cronicaGeneradaEn || fechaBase;
  }
  if(!('lecturaDatosSignature' in m)) m.lecturaDatosSignature = null;
  if(!('lecturaGeneradaEn' in m)) m.lecturaGeneradaEn = null;
  if(!('cronicaInformeSignature' in m)) m.cronicaInformeSignature = null;
  if(!('cronicaGeneradaEn' in m)) m.cronicaGeneradaEn = null;
  return m;
}

function markLecturaGenerada(target=cur){
  const m = ensureGenerationMeta(target);
  m.lecturaDatosSignature = compactSignature(lecturaDataPayload(target));
  m.lecturaGeneradaEn = new Date().toISOString();
  return m;
}

function markCronicaGenerada(target=cur){
  const m = ensureGenerationMeta(target);
  m.cronicaInformeSignature = compactSignature(cronicaSourcePayload(target));
  m.cronicaGeneradaEn = new Date().toISOString();
  return m;
}

function getGenerationStatus(target=cur){
  const m = ensureGenerationMeta(target);
  const hasLectura = !!target.informe;
  const hasCronica = !!target.cronica;
  const lecturaDesactualizada = hasLectura && m.lecturaDatosSignature !== compactSignature(lecturaDataPayload(target));
  const cronicaDesactualizada = hasCronica && (
    lecturaDesactualizada ||
    m.cronicaInformeSignature !== compactSignature(cronicaSourcePayload(target))
  );
  return {
    hasLectura,
    hasCronica,
    lecturaDesactualizada,
    cronicaDesactualizada,
    meta:m
  };
}


function ensureAjustesInforme(){
  if(!cur.ajustesInforme || typeof cur.ajustesInforme !== 'object'){
    cur.ajustesInforme = { periodos: [], observaciones: [], correccionesEtapa: [] };
  }
  if(!Array.isArray(cur.ajustesInforme.periodos)) cur.ajustesInforme.periodos = [];
  if(!Array.isArray(cur.ajustesInforme.observaciones)) cur.ajustesInforme.observaciones = [];
  if(!Array.isArray(cur.ajustesInforme.correccionesEtapa)) cur.ajustesInforme.correccionesEtapa = [];
  return cur.ajustesInforme;
}

function registrarPeriodoUsuario(etapa, valor, idx){
  const ajustes = ensureAjustesInforme();
  const numero = etapa.numero_etapa || (idx + 1);
  const anterior = etapa.periodo_simbolico || etapa.periodo_amplificado || etapa.periodo_reportado || etapa.momento_simbolico || '';
  const item = {
    id: 'p' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
    etapa_numero: numero,
    etapa_titulo: etapa.titulo || ('Etapa ' + numero),
    periodo_usuario: valor,
    periodo_anterior: anterior,
    fecha: new Date().toISOString(),
    fuente: 'usuario'
  };
  ajustes.periodos = ajustes.periodos.filter(p => !(Number(p.etapa_numero) === Number(numero) && p.etapa_titulo === item.etapa_titulo));
  ajustes.periodos.push(item);
  etapa.periodo_simbolico = valor;
  etapa.periodo_reportado = etapa.periodo_reportado || 'agregado por el usuario en revisión del informe';
  etapa.nivel_confianza_periodo = etapa.nivel_confianza_periodo || 'usuario';
  etapa._periodoEditadoPorUsuario = true;
  etapa._periodoFuente = 'usuario';
  if(!Array.isArray(etapa.evidencia_periodo)) etapa.evidencia_periodo = etapa.evidencia_periodo ? [etapa.evidencia_periodo] : [];
  if(!etapa.evidencia_periodo.some(x => String(x).includes('Ajuste manual del usuario'))){
    etapa.evidencia_periodo.push('Ajuste manual del usuario durante la revisión del informe');
  }
  return item;
}

function hayAjustesInforme(){
  const a = ensureAjustesInforme();
  return !!((a.periodos && a.periodos.length) || (a.observaciones && a.observaciones.length) || (a.correccionesEtapa && a.correccionesEtapa.length));
}

/* ---------- router con historial real ---------- */

const routes = {};
let navigationStack = [];
let currentRouteName = null;
let currentRouteOpts = {};

function registerRoute(name, renderFn){ routes[name] = renderFn; }

function cloneRouteOpts(opts){
  if(!opts || typeof opts !== 'object') return {};
  try{ return JSON.parse(JSON.stringify(opts)); }
  catch(e){ return Object.assign({}, opts); }
}

function compactRouteOpts(opts){
  const copy = cloneRouteOpts(opts);
  delete copy._navMeta;
  delete copy._restoreScroll;
  return copy;
}

function sameRoute(aName, aOpts, bName, bOpts){
  if(aName !== bName) return false;
  try{ return JSON.stringify(compactRouteOpts(aOpts)) === JSON.stringify(compactRouteOpts(bOpts)); }
  catch(e){ return false; }
}

function canGoBack(){ return navigationStack.length > 0; }

const NOMBRES_RUTA = {
  home:'Inicio', historial:'Tu bitácora', 'panel-bitacora':'Panel de bitácora',
  'versiones-bitacora':'Versiones internas', informe:'Informe', cronica:'Crónica', 'cronica-prompt':'Generar crónica',
  'impresos-graficos':'Imágenes', 'mapa-visual-prompt':'Mapas', 'collage-prompt':'Collage narrativo',
  'cargar-json':'Importar bitácora', 'respaldo-completo':'Respaldo completo', 'importar-texto':'Importar historia',
  principios:'Principios', 'entrevista-ia':'Entrevista IA', 'modo-rapido':'Modo rápido',
};

const RUTAS_AMPLIAS = new Set([
  'informe', 'cronica', 'impresos-graficos', 'mapa-visual-prompt', 'collage-prompt'
]);

function closeAllContextMenus(exceptId=null){
  document.querySelectorAll('.ct-menu-panel.is-open').forEach(panel=>{
    if(exceptId && panel.id === exceptId) return;
    panel.classList.remove('is-open');
    panel.hidden = true;
    const trigger = document.querySelector(`[data-context-menu-target="${panel.id}"]`);
    if(trigger) trigger.setAttribute('aria-expanded','false');
  });
}

function toggleContextMenu(trigger){
  if(!trigger) return;
  const id = trigger.getAttribute('data-context-menu-target');
  const panel = id && document.getElementById(id);
  if(!panel) return;
  const opening = panel.hidden || !panel.classList.contains('is-open');
  closeAllContextMenus(opening ? id : null);
  panel.hidden = !opening;
  panel.classList.toggle('is-open', opening);
  trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  if(opening){
    const first = panel.querySelector('[role="menuitem"], button:not([disabled])');
    requestAnimationFrame(()=> first && first.focus({preventScroll:true}));
  }
}

document.addEventListener('click', event=>{
  const trigger = event.target.closest && event.target.closest('[data-context-menu-target]');
  if(trigger){
    event.preventDefault();
    event.stopPropagation();
    toggleContextMenu(trigger);
    return;
  }
  const item = event.target.closest && event.target.closest('.ct-menu-panel [role="menuitem"]');
  if(item){
    closeAllContextMenus();
    return;
  }
  if(!(event.target.closest && event.target.closest('.ct-menu-panel'))) closeAllContextMenus();
});

document.addEventListener('keydown', event=>{
  if(event.key === 'Escape'){
    const open = document.querySelector('.ct-menu-panel.is-open');
    if(open){
      const trigger = document.querySelector(`[data-context-menu-target="${open.id}"]`);
      closeAllContextMenus();
      if(trigger) trigger.focus();
    }
  }
});

let appTooltipLayer = null;
let appTooltipOwner = null;

function ensureAppTooltipLayer(){
  if(appTooltipLayer && appTooltipLayer.isConnected) return appTooltipLayer;
  appTooltipLayer = document.createElement('div');
  appTooltipLayer.className = 'app-tooltip-layer';
  appTooltipLayer.setAttribute('role','tooltip');
  appTooltipLayer.hidden = true;
  document.body.appendChild(appTooltipLayer);
  return appTooltipLayer;
}

function showAppTooltip(owner){
  if(!owner || !owner.isConnected || !owner.getAttribute('data-tooltip')) return;
  if(window.matchMedia && !window.matchMedia('(hover:hover), (pointer:fine)').matches && document.activeElement !== owner) return;
  const layer = ensureAppTooltipLayer();
  appTooltipOwner = owner;
  layer.textContent = owner.getAttribute('data-tooltip');
  layer.hidden = false;
  layer.classList.add('visible');
  layer.style.left = '0px';
  layer.style.top = '0px';
  requestAnimationFrame(()=>{
    if(appTooltipOwner !== owner || layer.hidden) return;
    const r = owner.getBoundingClientRect();
    const t = layer.getBoundingClientRect();
    const margin = 10;
    let left = r.left + (r.width/2) - (t.width/2);
    left = Math.max(margin, Math.min(left, window.innerWidth - t.width - margin));
    let top = r.bottom + 9;
    if(top + t.height > window.innerHeight - margin) top = Math.max(margin, r.top - t.height - 9);
    layer.style.left = `${Math.round(left)}px`;
    layer.style.top = `${Math.round(top)}px`;
  });
}

function hideAppTooltip(owner=null){
  if(owner && appTooltipOwner && owner !== appTooltipOwner) return;
  const layer = appTooltipLayer;
  appTooltipOwner = null;
  if(layer){
    layer.classList.remove('visible');
    layer.hidden = true;
  }
}

document.addEventListener('pointerover', event=>{
  if(event.pointerType && event.pointerType !== 'mouse') return;
  const owner = event.target.closest && event.target.closest('[data-tooltip]');
  if(owner) showAppTooltip(owner);
});
document.addEventListener('pointerout', event=>{
  const owner = event.target.closest && event.target.closest('[data-tooltip]');
  if(owner && !(event.relatedTarget && owner.contains(event.relatedTarget))) hideAppTooltip(owner);
});
document.addEventListener('focusin', event=>{
  const owner = event.target.closest && event.target.closest('[data-tooltip]');
  if(owner) showAppTooltip(owner);
});
document.addEventListener('focusout', event=>{
  const owner = event.target.closest && event.target.closest('[data-tooltip]');
  if(owner) hideAppTooltip(owner);
});

function renderMigas(container){
  if(!container) return;
  const pasos = navigationStack.slice(-2).map(p => NOMBRES_RUTA[p.routeName] || p.routeName);
  pasos.push(NOMBRES_RUTA[currentRouteName] || currentRouteName);
  if(pasos.length < 2){ container.innerHTML = ''; return; }
  container.innerHTML = `<nav class="migas-pan" aria-label="Ruta de navegación">${pasos.map((p,i)=>
    i === pasos.length-1
      ? `<span class="miga-actual">${esc(p)}</span>`
      : `<span class="miga-paso">${esc(p)}</span><span class="miga-sep">›</span>`
  ).join('')}</nav>`;
}

function go(routeName, opts={}, navMeta={}){
  if(currentRouteName && currentRouteName !== 'splash' && !(navMeta && navMeta.skipDraft)){
    persistSessionDraftNow();
  }
  if(!routes[routeName]){
    console.warn('Ruta no registrada:', routeName);
    routeName = 'home';
    opts = {};
  }

  const meta = navMeta || {};
  if(meta.resetHistory){
    navigationStack = [];
  }

  if(!meta.fromBack && !meta.replace && currentRouteName && !sameRoute(currentRouteName, currentRouteOpts, routeName, opts)){
    navigationStack.push({
      routeName: currentRouteName,
      opts: compactRouteOpts(currentRouteOpts),
      scrollY: window.scrollY || 0
    });
    if(navigationStack.length > 80) navigationStack.shift();
  }

  currentRouteName = routeName;
  currentRouteOpts = compactRouteOpts(opts);

  document.body.classList.toggle('is-splash-screen', routeName === 'splash');
  window.scrollTo(0,0);
  const app = document.getElementById('app');
  closeAllContextMenus();
  hideAppTooltip();
  app.classList.toggle('app-wide', RUTAS_AMPLIAS.has(routeName));
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen' + (RUTAS_AMPLIAS.has(routeName) ? ' screen-wide' : '');
  screen.id = 'screen-' + routeName;
  screen.setAttribute('role', 'main');
  screen.setAttribute('aria-label', NOMBRES_RUTA[routeName] || routeName);
  screen.tabIndex = -1;
  app.appendChild(screen);

  if(routeName !== 'home' && canGoBack()){
    renderHistoryBack(screen);
  }

  routes[routeName](screen, opts);
  finalizeRouteAccessibility(screen, routeName);
  applyPendingDraftForm(screen, routeName);
  setTimeout(()=>{ finalizeRouteAccessibility(screen, routeName, false); applyPendingDraftForm(screen, routeName); }, 60);
  setTimeout(()=> finalizeRouteAccessibility(screen, routeName, false), 320);

  if(meta.fromBack && Number.isFinite(meta.restoreScroll)){
    setTimeout(()=> window.scrollTo(0, meta.restoreScroll), 0);
  }
}

function renderHistoryBack(container){
  const bar = document.createElement('div');
  bar.className = 'history-back-bar';
  const btn = document.createElement('button');
  btn.className = 'history-back-btn';
  btn.type = 'button';
  btn.innerHTML = '<span aria-hidden="true">←</span><span>Volver</span>';
  btn.setAttribute('aria-label', 'Volver a la pantalla anterior');
  btn.onclick = ()=> goBack('home');
  bar.appendChild(btn);
  container.appendChild(bar);
}

function goBack(fallbackRoute='home', fallbackOpts={}){
  while(navigationStack.length){
    const prev = navigationStack.pop();
    if(prev && routes[prev.routeName]){
      go(prev.routeName, prev.opts || {}, { fromBack:true, restoreScroll: prev.scrollY || 0 });
      return true;
    }
  }
  go(fallbackRoute || 'home', fallbackOpts || {}, { replace:true });
  return false;
}

function resetNavigation(){
  navigationStack = [];
  currentRouteName = null;
  currentRouteOpts = {};
}

function isNativeInteractive(el){
  return !!el && /^(A|BUTTON|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(el.tagName);
}

function accessibleControlName(control){
  if(!control) return '';
  if(control.getAttribute('aria-label')) return control.getAttribute('aria-label');
  if(control.id){
    const explicit = document.querySelector(`label[for="${CSS.escape(control.id)}"]`);
    if(explicit) return explicit.textContent.trim();
  }
  const wrapped = control.closest('label');
  if(wrapped) return wrapped.textContent.trim();
  const field = control.closest('.field, .opcion-toggle, .privacy-card');
  const nearby = field && field.querySelector('label, .field-label, .field-label-row label, .tag, .ocard-title');
  if(nearby) return nearby.textContent.trim();
  return control.getAttribute('placeholder') || control.getAttribute('title') || control.name || control.id || '';
}

function enhanceScreenAccessibility(screen){
  if(!screen || !screen.isConnected) return;
  screen.querySelectorAll('[data-tooltip]').forEach(el=>{
    if(el.hasAttribute('title')) el.removeAttribute('title');
    if(!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.getAttribute('data-tooltip'));
  });
  screen.querySelectorAll('*').forEach(el=>{
    if(!isNativeInteractive(el) && typeof el.onclick === 'function'){
      if(!el.hasAttribute('role')) el.setAttribute('role','button');
      if(!el.hasAttribute('tabindex')) el.tabIndex = 0;
    }
  });
  screen.querySelectorAll('input, textarea, select').forEach(control=>{
    if(!control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')){
      const name = accessibleControlName(control);
      if(name) control.setAttribute('aria-label', cleanVisibleText(name));
    }
  });
}

function finalizeRouteAccessibility(screen, routeName, moveFocus=true){
  enhanceScreenAccessibility(screen);
  const announcer = document.getElementById('route-announcer');
  const routeLabel = NOMBRES_RUTA[routeName] || routeName;
  if(announcer) announcer.textContent = `Pantalla: ${routeLabel}`;
  if(moveFocus && routeName !== 'splash'){
    requestAnimationFrame(()=>{
      const target = screen.querySelector('h1, h2, .eyebrow') || screen;
      if(target !== screen && !target.hasAttribute('tabindex')) target.tabIndex = -1;
      try{ target.focus({ preventScroll:true }); }catch(e){ try{ target.focus(); }catch(e2){} }
    });
  }
}

document.addEventListener('keydown', event=>{
  const target = event.target && event.target.closest ? event.target.closest('[role="button"]') : null;
  if(!target || isNativeInteractive(target)) return;
  if(event.key === 'Enter' || event.key === ' '){
    event.preventDefault();
    target.click();
  }
});

function cleanVisibleText(str){
  return String(str || '')
    .replace(/filecite[^]+/g, '')
    .replace(/cite[^]+/g, '')
    .replace(/\bturn\d+(?:file|search|view|news|forecast|sports|finance)\d+\b/g, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/[ 	]{2,}/g, ' ')
    .trim();
}

function deepCleanText(value){
  if(typeof value === 'string') return cleanVisibleText(value);
  if(Array.isArray(value)) return value.map(deepCleanText);
  if(value && typeof value === 'object'){
    const out = {};
    Object.keys(value).forEach(k => { out[k] = deepCleanText(value[k]); });
    return out;
  }
  return value;
}

function esc(str){
  const d = document.createElement('div');
  d.textContent = cleanVisibleText(str || '');
  return d.innerHTML;
}

function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }


const AI_PROVIDERS = [
  { name:'Claude', initial:'C', url:'https://claude.ai/new' },
  { name:'ChatGPT', initial:'C', url:'https://chatgpt.com/' },
  { name:'Gemini', initial:'G', url:'https://gemini.google.com/app' },
  { name:'Perplexity', initial:'P', url:'https://www.perplexity.ai/' },
  { name:'Copilot', initial:'C', url:'https://copilot.microsoft.com/' },
  { name:'DeepSeek', initial:'D', url:'https://chat.deepseek.com/' },
  { name:'Mistral', initial:'M', url:'https://chat.mistral.ai/chat' },
  { name:'Grok', initial:'G', url:'https://grok.com/' },
];

async function openAIProvider(url, promptText){
  const txt = typeof promptText === 'function' ? promptText() : promptText;
  let ventana = null;
  // Se abre una pestaña vacía durante el gesto del usuario. Así el navegador no la bloquea
  // mientras esperamos la copia asíncrona al portapapeles.
  try{
    ventana = window.open('about:blank', '_blank');
    if(ventana) ventana.opener = null;
  }catch(e){}

  const copied = await copyTextSilently(txt);
  let opened = false;
  if(ventana){
    try{
      ventana.location.replace(url);
      opened = true;
    }catch(e){
      try{ ventana.location.href = url; opened = true; }catch(e2){}
    }
  }
  if(!opened) opened = abrirEnlaceRobusto(url);
  return { copied, opened, url };
}

function abrirEnlaceRobusto(url){
  try{
    const ventana = window.open(url, '_blank', 'noopener,noreferrer');
    if(ventana) return true;
  }catch(e){}
  try{
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }catch(e){ return false; }
}

async function copyTextSilently(text){
  const txt = typeof text === 'function' ? text() : text;
  if(!txt) return false;
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(txt);
      return true;
    }
  }catch(e){}
  try{
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return !!ok;
  }catch(e){
    return false;
  }
}

async function copyPromptButton(btn, promptText, hubEl){
  if(!btn) return false;
  const original = btn.textContent || 'Copiar prompt';
  btn.classList.add('copy-success-pulse');
  const ok = await copyTextSilently(promptText);
  btn.textContent = ok ? 'Copiado ✓' : 'No se pudo copiar automáticamente';
  if(hubEl){
    setTimeout(()=>{
      hubEl.classList.add('ia-hub-flash');
      hubEl.scrollIntoView({ behavior:'smooth', block:'center' });
      setTimeout(()=> hubEl.classList.remove('ia-hub-flash'), 1600);
    }, 260);
  }
  setTimeout(()=>{
    btn.textContent = original;
    btn.classList.remove('copy-success-pulse');
  }, ok ? 1800 : 2600);
  return ok;
}

function renderAIExternalPanel(container, promptText, opts={}){
  if(!container) return;
  const title = opts.title || 'Abrir IA externa';
  const detail = opts.detail || 'Elige tu IA preferida. La app intenta copiar el prompt y abrir el servicio en una pestaña nueva.';
  container.innerHTML = `
    <div class="ai-access-panel">
      <div class="ai-access-eyebrow">${esc(title)}</div>
      <p class="ai-access-help">${esc(detail)}</p>
      <p class="ai-external-privacy"><strong>Privacidad:</strong> al pegar o enviar el prompt, su contenido pasa a las condiciones del servicio externo elegido.</p>
      <div class="ai-provider-grid">
        ${AI_PROVIDERS.map((p,i)=>`
          <button type="button" class="ai-provider-btn" data-url="${esc(p.url)}" data-name="${esc(p.name)}" aria-label="Copiar el prompt y abrir ${esc(p.name)}" style="--pulse-delay:${(i*0.18).toFixed(2)}s">
            <span class="ai-provider-initial" aria-hidden="true">${esc(p.initial)}</span>
            <span>${esc(p.name)}</span>
          </button>
        `).join('')}
      </div>
      <button type="button" class="ai-copy-fallback" data-ai-copy-only>Copiar prompt sin abrir otra pestaña</button>
      <div class="ai-open-status" aria-live="polite" aria-atomic="true"></div>
    </div>
  `;
  const status = container.querySelector('.ai-open-status');
  const copyOnly = container.querySelector('[data-ai-copy-only]');
  copyOnly.onclick = async ()=>{
    const ok = await copyTextSilently(promptText);
    status.textContent = ok ? 'Prompt copiado. Ya puedes pegarlo en la IA que prefieras.' : 'No fue posible copiar automáticamente. Mantén pulsado el texto desde el botón principal de copia o revisa los permisos del navegador.';
    status.classList.toggle('is-error', !ok);
  };
  container.querySelectorAll('.ai-provider-btn').forEach(btn=>{
    btn.onclick = async ()=>{
      const url = btn.getAttribute('data-url');
      const provider = btn.getAttribute('data-name') || btn.textContent.trim();
      const buttons = Array.from(container.querySelectorAll('.ai-provider-btn'));
      buttons.forEach(b=> b.disabled = true);
      status.classList.remove('is-error');
      status.textContent = `Preparando ${provider}…`;
      const result = await openAIProvider(url, promptText);
      buttons.forEach(b=> b.disabled = false);
      if(result.copied && result.opened){
        status.textContent = `Prompt copiado y ${provider} abierto. Pégalo allí para continuar.`;
      }else if(result.opened){
        status.textContent = `${provider} se abrió, pero el navegador no permitió copiar. Usa “Copiar prompt sin abrir otra pestaña”.`;
        status.classList.add('is-error');
      }else{
        status.innerHTML = `${result.copied ? 'El prompt quedó copiado, pero' : 'No fue posible copiar y'} el navegador bloqueó la pestaña. <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir ${esc(provider)} manualmente</a>.`;
        status.classList.add('is-error');
      }
    };
  });
}

function navFooter(container, buttons){
  const footer = document.createElement('div');
  footer.className = 'nav-footer';
  buttons.forEach(b=>{
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.variant||'btn-primary');
    btn.textContent = b.label;
    const isSimpleBack = /^(Atrás|Volver)$/i.test(String(b.label || '').trim());
    if(isSimpleBack && !b.keepFixedBack){
      btn.onclick = ()=>{
        if(canGoBack()) goBack();
        else if(typeof b.onClick === 'function') b.onClick();
        else go('home', {}, { replace:true });
      };
    }else{
      btn.onclick = b.onClick;
    }
    if(b.disabled) btn.disabled = true;
    footer.appendChild(btn);
  });
  container.appendChild(footer);
}

function progressTrack(container, step, total){
  const track = document.createElement('div');
  track.className = 'progress-track';
  for(let i=0;i<total;i++){
    const seg = document.createElement('div');
    seg.className = 'progress-seg' + (i < step ? ' done' : (i===step ? ' active' : ''));
    track.appendChild(seg);
  }
  container.appendChild(track);
}

/* ---------- storage helpers (localStorage nativo del navegador) ----------
   Nota técnica: usamos localStorage en vez de window.storage porque esta
   app se despliega como sitio estático independiente (ej. Cloudflare
   Pages), fuera del entorno de artifacts de Claude.ai. localStorage es
   una API estándar de cualquier navegador, funciona sin backend, y
   persiste solo en el dispositivo del usuario (nada se comparte). */

function lsKey(key){ return STORAGE_PREFIX + ':' + key; }

function entryCoreSignature(entry){
  const base = {
    alias: entry && entry.alias || '',
    moduloA: entry && entry.moduloA || {},
    moduloB: entry && entry.moduloB || {},
    moduloC: entry && entry.moduloC || [],
    moduloD: entry && entry.moduloD || {},
    moduloE: entry && entry.moduloE || [],
    tirada: entry && entry.tirada || null
  };
  try{ return JSON.stringify(base); }catch(e){ return String((entry && entry.alias) || '').toLowerCase(); }
}

function mergeEntryVersions(entry, previous){
  const out = { ...entry };
  if(entry.cronica === undefined && previous) out.cronica = previous.cronica || null;
  if(entry.generationMeta === undefined && previous) out.generationMeta = previous.generationMeta || null;
  ensureGenerationMeta(out, entry.fecha || (previous && previous.updatedAt));
  const versiones = Array.isArray(previous && previous.versiones) ? previous.versiones.slice(-8) : [];
  const prevInforme = previous && previous.informe ? JSON.stringify(previous.informe) : '';
  const nextInforme = entry && entry.informe ? JSON.stringify(entry.informe) : '';
  if(previous && previous.informe && prevInforme && prevInforme !== nextInforme){
    versiones.push({
      fecha: previous.fecha || new Date().toISOString(),
      tipo: 'versión anterior',
      tirada: previous.tirada || null,
      informe: previous.informe,
      ajustesInforme: previous.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] }
    });
  }
  out.versiones = versiones.slice(-8);
  out.updatedAt = entry.fecha || new Date().toISOString();
  out.createdAt = (previous && previous.createdAt) || entry.createdAt || entry.fecha || new Date().toISOString();
  return out;
}

async function saveEntry(entry){
  try{
    const previous = await loadEntry(entry.id);
    const finalEntry = previous ? mergeEntryVersions(entry, previous) : { ...entry, createdAt: entry.fecha, updatedAt: entry.fecha, versiones: Array.isArray(entry.versiones) ? entry.versiones : [] };
    ensureGenerationMeta(finalEntry, finalEntry.updatedAt || finalEntry.fecha);
    localStorage.setItem(lsKey('entries:'+finalEntry.id), JSON.stringify(finalEntry));
    const idx = await loadIndex();
    const filtered = idx.filter(item => item.id !== finalEntry.id);
    filtered.unshift({ id: finalEntry.id, alias: finalEntry.alias, fecha: finalEntry.fecha, updatedAt: finalEntry.updatedAt, versiones: (finalEntry.versiones||[]).length });
    localStorage.setItem(lsKey('index'), JSON.stringify(filtered));
    return true;
  }catch(e){
    console.error('Error guardando', e);
    return false;
  }
}

async function eliminarDuplicadosExactos(){
  const idx = await loadIndex();
  const vistos = new Set();
  const conservar = [];
  const borrar = [];
  for(const item of idx){
    const entry = await loadEntry(item.id);
    if(!entry){ borrar.push(item.id); continue; }
    const sig = entryCoreSignature(entry);
    if(vistos.has(sig)) borrar.push(item.id);
    else { vistos.add(sig); conservar.push(item); }
  }
  borrar.forEach(id=> localStorage.removeItem(lsKey('entries:'+id)));
  localStorage.setItem(lsKey('index'), JSON.stringify(conservar));
  return borrar.length;
}

async function loadIndex(){
  try{
    const raw = localStorage.getItem(lsKey('index'));
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

async function loadEntry(id){
  try{
    const raw = localStorage.getItem(lsKey('entries:'+id));
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

async function guardarAvanceRapido(){
  const entry = {
    id: cur._editingEntryId || ('e' + Date.now()),
    alias: cur.alias,
    fecha: new Date().toISOString(),
    moduloA: cur.moduloA,
    moduloB: cur.moduloB,
    moduloC: cur.moduloC,
    moduloD: cur.moduloD,
    moduloE: cur.moduloE,
    tirada: cur.tirada,
    informe: cur.informe,
    cronica: cur.cronica || null,
    generationMeta: ensureGenerationMeta(cur),
    ajustesInforme: cur.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] },
  };
  const ok = await saveEntry(entry);
  if(ok){
    cur._editingEntryId = entry.id;
    clearSessionDraft();
  }
  return ok;
}

function botonGuardarAvance(onDone){
  if(!cur._editingEntryId) return null;
  return {
    label:'Guardar avance', variant:'btn-ghost',
    onClick: async ()=>{
      const ok = await guardarAvanceRapido();
      if(onDone) onDone(ok);
    },
  };
}
async function deleteEntry(id){
  try{
    localStorage.removeItem(lsKey('entries:'+id));
    const idx = await loadIndex();
    const nuevoIdx = idx.filter(item => item.id !== id);
    localStorage.setItem(lsKey('index'), JSON.stringify(nuevoIdx));
    return true;
  }catch(e){
    console.error('Error eliminando', e);
    return false;
  }
}

async function clearAllLocalData(){
  try{
    const keys = [];
    for(let i=0; i<localStorage.length; i++){
      const key = localStorage.key(i);
      if(key && key.startsWith(STORAGE_PREFIX + ':')) keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
    resetSession();
    return keys.length;
  }catch(e){
    console.error('Error borrando datos locales', e);
    return -1;
  }
}

async function loadLastEntrySummary(){
  const idx = await loadIndex();
  return idx && idx.length ? idx[0] : null;
}

function storageDisponible(){
  try{
    const t = '__test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return true;
  }catch(e){ return false; }
}

/* ---------- borrador de sesión: protege relatos no guardados ante recargas o actualizaciones ---------- */
const SESSION_DRAFT_VERSION = 1;
let draftSaveTimer = null;
let pendingDraftForm = null;

function captureCurrentFormValues(){
  const screen = document.querySelector('.screen');
  if(!screen) return {};
  const values = {};
  screen.querySelectorAll('input, textarea, select').forEach(control=>{
    if(!control.id || control.type === 'file' || control.type === 'password') return;
    values[control.id] = {
      value: control.value,
      checked: (control.type === 'checkbox' || control.type === 'radio') ? !!control.checked : undefined,
      type: control.type || control.tagName.toLowerCase()
    };
  });
  return values;
}

function formValuesHaveContent(values){
  return Object.values(values || {}).some(item=>{
    if(!item) return false;
    if(item.checked) return true;
    return String(item.value || '').trim().length > 0;
  });
}

function sessionHasMeaningfulData(source=cur){
  if(!source || String(source.alias || '').includes('· demo')) return false;
  if(String(source.alias || '').trim()) return true;
  if(source.informe || source.cronica || source.tirada) return true;
  if((source.moduloC || []).length || (source.moduloE || []).length) return true;
  const a = source.moduloA || {}, b = source.moduloB || {}, d = source.moduloD || {};
  return [...Object.values(a), ...Object.values(b), ...Object.values(d)].some(v=>String(v || '').trim());
}

function draftRouteIsUseful(routeName){
  return !!routeName && !['splash','home','manual','principios','privacidad','historial','respaldo-completo','cargar-json','guardado-ok','guardado-error','confirmar-eliminar'].includes(routeName);
}

function persistSessionDraftNow(){
  if(!storageDisponible() || !draftRouteIsUseful(currentRouteName)) return false;
  const formValues = captureCurrentFormValues();
  if(!sessionHasMeaningfulData(cur) && !formValuesHaveContent(formValues)) return false;
  try{
    const payload = {
      formato:'bitacora-del-alma-borrador',
      version:SESSION_DRAFT_VERSION,
      updatedAt:new Date().toISOString(),
      routeName:currentRouteName,
      routeOpts:compactRouteOpts(currentRouteOpts),
      cur:JSON.parse(JSON.stringify(cur)),
      formValues
    };
    localStorage.setItem(lsKey('session-draft'), JSON.stringify(payload));
    return true;
  }catch(e){
    console.warn('No se pudo guardar el borrador de sesión:', e);
    return false;
  }
}

function scheduleSessionDraftSave(){
  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(persistSessionDraftNow, 350);
}

function loadSessionDraft(){
  try{
    const raw = localStorage.getItem(lsKey('session-draft'));
    if(!raw) return null;
    const draft = JSON.parse(raw);
    if(!draft || draft.formato !== 'bitacora-del-alma-borrador' || !draft.cur) return null;
    return draft;
  }catch(e){ return null; }
}

function clearSessionDraft(){
  clearTimeout(draftSaveTimer);
  try{ localStorage.removeItem(lsKey('session-draft')); }catch(e){}
  pendingDraftForm = null;
}

function getSessionDraftSummary(){
  const draft = loadSessionDraft();
  if(!draft || (!sessionHasMeaningfulData(draft.cur) && !formValuesHaveContent(draft.formValues))) return null;
  return {
    alias: draft.cur.alias || 'Borrador sin nombre',
    updatedAt: draft.updatedAt,
    routeName: draft.routeName,
    routeLabel: NOMBRES_RUTA[draft.routeName] || 'Proceso en curso'
  };
}

function hydrateCurFromDraft(data){
  const base = {
    alias:'', moduloA:{autodescripcion:'',patron:'',rasgo:'',sensaciones:''},
    moduloB:{presencias:'',amigoImaginario:'',suenoGuia:'',nombrePresencia:''},
    moduloC:[], moduloD:{descripcion:''}, moduloE:[], tirada:null,
    promptGenerado:'', respuestaIA:'', informe:null, cronica:null,
    generationMeta:{lecturaDatosSignature:null,lecturaGeneradaEn:null,cronicaInformeSignature:null,cronicaGeneradaEn:null},
    ajustesInforme:{periodos:[],observaciones:[],correccionesEtapa:[]},
    _narrativaVinculos:'', _promptExtraccion:'', _historiaCompleta:'', _promptImportacion:'', _editingEntryId:null
  };
  const incoming = data && typeof data === 'object' ? data : {};
  cur = { ...base, ...incoming };
  cur.moduloA = { ...base.moduloA, ...(incoming.moduloA || {}) };
  cur.moduloB = { ...base.moduloB, ...(incoming.moduloB || {}) };
  cur.moduloD = { ...base.moduloD, ...(incoming.moduloD || {}) };
  cur.moduloC = Array.isArray(incoming.moduloC) ? incoming.moduloC : [];
  cur.moduloE = Array.isArray(incoming.moduloE) ? incoming.moduloE : [];
  ensureAjustesInforme();
  ensureGenerationMeta(cur);
}

function resumeSessionDraft(){
  const draft = loadSessionDraft();
  if(!draft) return false;
  hydrateCurFromDraft(draft.cur);
  pendingDraftForm = { routeName:draft.routeName, values:draft.formValues || {} };
  let routeName = draft.routeName;
  if(!routes[routeName] || !draftRouteIsUseful(routeName)){
    routeName = cur.informe ? 'informe' : (cur.tirada ? 'tirada-resultado' : (cur.alias ? 'modA' : 'alias'));
  }
  go(routeName, draft.routeOpts || {}, { resetHistory:true, replace:true, skipDraft:true });
  return true;
}

function applyPendingDraftForm(screen, routeName){
  if(!pendingDraftForm || pendingDraftForm.routeName !== routeName || !screen) return;
  let applied = 0;
  Object.entries(pendingDraftForm.values || {}).forEach(([id,item])=>{
    const control = screen.querySelector(`#${CSS.escape(id)}`);
    if(!control || !item) return;
    if(control.type === 'checkbox' || control.type === 'radio') control.checked = !!item.checked;
    else control.value = item.value == null ? '' : item.value;
    if(control.tagName === 'TEXTAREA' && typeof autoGrow === 'function') autoGrow(control);
    control.dispatchEvent(new Event('input', { bubbles:true }));
    applied++;
  });
  if(applied || !Object.keys(pendingDraftForm.values || {}).length) pendingDraftForm = null;
}

document.addEventListener('input', scheduleSessionDraftSave, true);
document.addEventListener('change', scheduleSessionDraftSave, true);
window.addEventListener('beforeunload', persistSessionDraftNow);

const FORMATO_RESPALDO_COMPLETO = 'bitacora-del-alma-respaldo-completo';
const VERSION_RESPALDO_COMPLETO = 2;

async function exportarRespaldoCompleto(){
  const idx = await loadIndex();
  const entradas = [];
  for(const item of idx){
    const entry = await loadEntry(item.id);
    if(entry) entradas.push(entry);
  }
  let preferenciasNarracion = null;
  try{
    const rawCfg = localStorage.getItem('balma:tts-config');
    preferenciasNarracion = rawCfg ? JSON.parse(rawCfg) : null;
  }catch(e){}
  return {
    formato: FORMATO_RESPALDO_COMPLETO,
    version: VERSION_RESPALDO_COMPLETO,
    fecha_exportacion: new Date().toISOString(),
    total_bitacoras: entradas.length,
    preferencias: { narracion: preferenciasNarracion },
    entradas
  };
}

function validarEntradaRespaldo(entry, index, ids){
  if(!entry || typeof entry !== 'object' || Array.isArray(entry)) return `La entrada ${index + 1} no es un objeto válido.`;
  const id = String(entry.id || '').trim();
  if(!id) return `La entrada ${index + 1} no tiene identificador.`;
  if(ids.has(id)) return `El respaldo repite el identificador ${id}.`;
  ids.add(id);
  if(entry.moduloA != null && (typeof entry.moduloA !== 'object' || Array.isArray(entry.moduloA))) return `La entrada ${index + 1} tiene un módulo 1 inválido.`;
  if(entry.moduloC != null && !Array.isArray(entry.moduloC)) return `La entrada ${index + 1} tiene vínculos inválidos.`;
  if(entry.moduloE != null && !Array.isArray(entry.moduloE)) return `La entrada ${index + 1} tiene momentos difíciles inválidos.`;
  if(entry.informe != null && (typeof entry.informe !== 'object' || Array.isArray(entry.informe))) return `La entrada ${index + 1} tiene un informe inválido.`;
  if(entry.cronica != null && (typeof entry.cronica !== 'object' || Array.isArray(entry.cronica))) return `La entrada ${index + 1} tiene una crónica inválida.`;
  return '';
}

function clavesBitacorasGuardadas(){
  const keys = [];
  for(let i=0; i<localStorage.length; i++){
    const key = localStorage.key(i);
    if(key && (key === lsKey('index') || key.startsWith(lsKey('entries:')))) keys.push(key);
  }
  return keys;
}

// Restauración transaccional: valida todo antes, conserva una copia temporal y revierte si falla una escritura.
async function restaurarRespaldoCompleto(respaldo){
  if(!respaldo || respaldo.formato !== FORMATO_RESPALDO_COMPLETO || !Array.isArray(respaldo.entradas)){
    return { ok:false, motivo:'formato', detalle:'El archivo no corresponde a un respaldo completo.' };
  }
  if(respaldo.entradas.length > 1000){
    return { ok:false, motivo:'limite', detalle:'El respaldo contiene una cantidad inusual de bitácoras.' };
  }
  const ids = new Set();
  for(let i=0; i<respaldo.entradas.length; i++){
    const error = validarEntradaRespaldo(respaldo.entradas[i], i, ids);
    if(error) return { ok:false, motivo:'contenido', detalle:error };
  }

  const serializadas = [];
  const nuevoIndice = [];
  try{
    respaldo.entradas.forEach(entry=>{
      const copy = deepCleanText(entry);
      ensureGenerationMeta(copy, copy.updatedAt || copy.fecha);
      const key = lsKey('entries:' + String(copy.id));
      serializadas.push([key, JSON.stringify(copy)]);
      nuevoIndice.push({
        id:String(copy.id), alias:copy.alias || 'Bitácora restaurada',
        fecha:copy.fecha || new Date().toISOString(), updatedAt:copy.updatedAt || copy.fecha || new Date().toISOString(),
        versiones:Array.isArray(copy.versiones) ? copy.versiones.length : 0
      });
    });
    nuevoIndice.sort((a,b)=> new Date(b.updatedAt||b.fecha) - new Date(a.updatedAt||a.fecha));
    JSON.stringify(nuevoIndice);
  }catch(e){
    return { ok:false, motivo:'contenido', detalle:'El respaldo contiene datos que no se pueden serializar.' };
  }

  const antiguas = new Map();
  const oldKeys = clavesBitacorasGuardadas();
  oldKeys.forEach(key=> antiguas.set(key, localStorage.getItem(key)));

  try{
    oldKeys.forEach(key=> localStorage.removeItem(key));
    serializadas.forEach(([key,value])=> localStorage.setItem(key, value));
    localStorage.setItem(lsKey('index'), JSON.stringify(nuevoIndice));
    const cfg = respaldo.preferencias && respaldo.preferencias.narracion;
    if(cfg) localStorage.setItem('balma:tts-config', JSON.stringify(cfg));
    clearSessionDraft();
    return { ok:true, total:nuevoIndice.length };
  }catch(e){
    // Retirar cualquier escritura parcial y devolver exactamente lo que había antes.
    clavesBitacorasGuardadas().forEach(key=> localStorage.removeItem(key));
    try{ antiguas.forEach((value,key)=> localStorage.setItem(key, value)); }catch(rollbackError){
      return { ok:false, motivo:'rollback', detalle:'Falló la restauración y el navegador tampoco permitió recuperar completamente el estado anterior.' };
    }
    return { ok:false, motivo:'espacio', detalle:'No hubo espacio suficiente o el navegador bloqueó el almacenamiento. Tus bitácoras anteriores fueron restauradas.' };
  }
}



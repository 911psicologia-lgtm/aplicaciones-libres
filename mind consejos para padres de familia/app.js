'use strict';

const APP_VERSION = '1.11.0';

const STORAGE = {
  favorites: 'puentes-favorites-v1',
  shared: 'puentes-shared-v1',
  viewed: 'puentes-viewed-v1',
  custom: 'puentes-custom-v1',
  profile: 'puentes-profile-v1',
  last: 'puentes-last-v1',
  aiDraft: 'puentes-ai-draft-v1',
  audio: 'puentes-audio-v1'
};

const categoryUI = {
  C01:{icon:'♡',color:'#b45f6b',soft:'#f8e6e8'}, C02:{icon:'✎',color:'#5c70b8',soft:'#e9ecf8'},
  C03:{icon:'⇄',color:'#b16f3e',soft:'#f8eadf'}, C04:{icon:'◌',color:'#8c62a8',soft:'#f0e7f5'},
  C05:{icon:'✦',color:'#ba872d',soft:'#fff1ce'}, C06:{icon:'◇',color:'#507f62',soft:'#e4f1e8'},
  C07:{icon:'◉',color:'#397f9d',soft:'#e2f0f6'}, C08:{icon:'❝',color:'#447f78',soft:'#e1f0ed'},
  C09:{icon:'↗',color:'#6e6da8',soft:'#eae9f5'}, C10:{icon:'✓',color:'#687f4a',soft:'#ebf1e1'},
  C11:{icon:'☀',color:'#bd7948',soft:'#f9eadf'}, C12:{icon:'≋',color:'#9b607c',soft:'#f4e6ed'}
};

const purposeOptions = [
  {id:'support',icon:'♡',title:'Acompañar una dificultad',desc:'Validar, comprender y ofrecer apoyo.',keys:['acompañar','comprender','regular','cuidar','afrontar','reorganizar','bienestar']},
  {id:'talk',icon:'❝',title:'Invitar a conversar',desc:'Abrir un diálogo sin interrogar.',keys:['dialogar','comprender','orientar','reparar']},
  {id:'action',icon:'→',title:'Proponer una acción',desc:'Llevar la idea a una práctica sencilla.',keys:['organizar','practicar','cooperar','coordinar','crear','aprender']},
  {id:'prevent',icon:'◇',title:'Prevenir un problema',desc:'Anticipar riesgos y construir acuerdos.',keys:['prevenir','proteger','cuidar','orientar']},
  {id:'recognize',icon:'✦',title:'Reconocer un avance',desc:'Visibilizar esfuerzos, recursos y logros.',keys:['reconocer','motivar','fortalecer']},
  {id:'autonomy',icon:'↗',title:'Fortalecer autonomía',desc:'Acompañar decisiones y responsabilidades.',keys:['autonomia','responsabilizar','evaluar','resolver','valores']}
];

const SHARE_ICON = `<svg class="share-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"></path></svg>`;
const PLAYER_PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"></path></svg>`;
const PLAYER_PAUSE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"></path></svg>`;
const PLAYER_SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="M8.2 10.9 15.7 6.2M8.2 13.1l7.5 4.7"></path></svg>`;
const PLAYBACK_RATES = [1, 1.5, 1.8, 2];

// Correspondencia entre las categorías editoriales de Puentes y las doce
// ilustraciones maestras aprobadas para el sistema visual.
const APPROVED_SCENE_BY_CATEGORY = {
  C01:'01', C02:'02', C03:'03', C04:'04',
  C05:'11', C06:'10', C07:'05', C08:'09',
  C09:'06', C10:'07', C11:'12', C12:'08'
};
const APPROVED_SCENE_PATH = id => `assets/scenes/scene-${id}.png?v=${APP_VERSION}`;


const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const safeJSON = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch { return fallback; } };
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const app = {
  data:null,
  cards:[],
  view:'home',
  navStack:[],
  selection:{stageId:null,categoryId:null,purposeId:null},
  results:[],
  resultIndex:0,
  library:{tab:'all',search:'',stage:'all',category:'all',limit:40},
  favorites:new Set(safeJSON(localStorage.getItem(STORAGE.favorites),[])),
  shared:safeJSON(localStorage.getItem(STORAGE.shared),{}),
  viewed:safeJSON(localStorage.getItem(STORAGE.viewed),[]),
  custom:safeJSON(localStorage.getItem(STORAGE.custom),[]),
  profile:safeJSON(localStorage.getItem(STORAGE.profile),{name:'',institution:'',signature:'Puentes · Escuela y familia'}),
  lastCardId:localStorage.getItem(STORAGE.last),
  aiDraft:safeJSON(localStorage.getItem(STORAGE.aiDraft),{stageId:null,categoryId:null,purposeId:null,situation:'',count:30}),
  audio:(()=>{
    const saved=safeJSON(localStorage.getItem(STORAGE.audio),{rate:1,voiceURI:''});
    return {queue:[],queueIndex:0,fragmentIndex:0,isPlaying:false,isPaused:false,continuous:true,rate:Number(saved.rate)||1,voiceURI:saved.voiceURI||'',queueOrigin:null};
  })(),
  aiPrompt:'',
  pendingManualShare:null,
  shareInProgress:false,
  shareCache:new Map(),
  sceneImages:new Map(),
  playback:{utterance:null,token:0},
  toastTimer:null,
  swRegistration:null,
  updateInProgress:false,
  updateAvailable:false,
  installPrompt:null,
  installInProgress:false,
  installed:false
};

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  app.installPrompt=event;
  app.installed=false;
  setInstallButtonState({visible:true,ready:true});
});

window.addEventListener('appinstalled',()=>{
  app.installPrompt=null;
  app.installed=true;
  setInstallButtonState({visible:false});
  toast('Puentes quedó instalada');
});

function saveState(){
  localStorage.setItem(STORAGE.favorites,JSON.stringify([...app.favorites]));
  localStorage.setItem(STORAGE.shared,JSON.stringify(app.shared));
  localStorage.setItem(STORAGE.viewed,JSON.stringify(app.viewed.slice(0,120)));
  localStorage.setItem(STORAGE.custom,JSON.stringify(app.custom));
  localStorage.setItem(STORAGE.profile,JSON.stringify(app.profile));
  localStorage.setItem(STORAGE.aiDraft,JSON.stringify(app.aiDraft));
  localStorage.setItem(STORAGE.audio,JSON.stringify({rate:app.audio.rate,voiceURI:app.audio.voiceURI}));
}

async function init(){
  try{
    if(window.PUENTES_DATA){
      app.data=window.PUENTES_DATA;
    }else{
      const response = await fetch('data/cards.json');
      if(!response.ok) throw new Error(`No se pudo cargar la base (${response.status})`);
      app.data = await response.json();
    }
    app.cards = [...app.data.cards, ...app.custom];
    preloadApprovedScenes();
    ensureAudioPreferences();
    bindGlobalEvents();
    setupInstallExperience();
    renderAll();
    $('#app').hidden=false;
    const launchAction=new URLSearchParams(location.search).get('action');
    if(launchAction==='create') navigate('stage');
    if(launchAction==='shared') navigate('shared');
    setTimeout(()=>$('#splash').classList.add('hide'),650);
    registerSW();
  }catch(error){
    console.error(error);
    $('#splash').classList.add('hide');
    document.body.insertAdjacentHTML('beforeend',`<div class="error-panel"><h1>No fue posible abrir Puentes</h1><p>El prototipo necesita ejecutarse desde un servidor web local o publicarse en un alojamiento estático.</p><code>${escapeHTML(error.message)}</code></div>`);
  }
}


function bindOptionalClick(id,handler){
  const element=document.getElementById(id);
  if(!element){
    console.warn(`[Puentes] Control opcional no encontrado: #${id}`);
    return false;
  }
  element.addEventListener('click',handler);
  return true;
}

function bindGlobalEvents(){
  $('#backBtn').addEventListener('click',goBack);
  $('#brandBtn').addEventListener('click',()=>navigate('home'));
  $('#settingsBtn').addEventListener('click',()=>navigate('settings'));
  bindOptionalClick('installAppBtn',requestAppInstall);
  bindOptionalClick('retryInstallBtn',requestAppInstall);
  bindOptionalClick('updateAppBtn',forceAppUpdate);
  $$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
  $('#downloadCardBtn').addEventListener('click',()=>{
    const pending=app.pendingManualShare;
    if(!pending?.blob) return;
    downloadBlob(pending.blob,pending.filename||pending.file?.name||'puentes-tarjeta.png');
    toast('Imagen guardada en Descargas');
  });
  $('#copyCardTextBtn').addEventListener('click',async()=>{
    const pending=app.pendingManualShare;
    if(!pending) return;
    await copyText(pending.text);
    toast('Mensaje copiado');
  });
  $('#openNativeTextShareBtn').addEventListener('click',async()=>{
    const pending=app.pendingManualShare;
    if(!pending) return;
    try{
      const completed=await shareViaNative(pending,{preferFiles:false});
      if(completed){
        $('#confirmDialog').close();
        app.pendingManualShare=null;
        markShared(pending.card,'native-text');
      }
    }catch(error){
      console.warn('No se pudo abrir el panel nativo para compartir texto',error);
      toast('Tu navegador no pudo abrir el panel del dispositivo');
    }
  });
  bindOptionalClick('quickShareWhatsAppBtn',()=>openQuickShareChannel('whatsapp'));
  bindOptionalClick('quickShareTelegramBtn',()=>openQuickShareChannel('telegram'));
  bindOptionalClick('quickShareEmailBtn',()=>openQuickShareChannel('email'));
  bindOptionalClick('quickShareXBtn',()=>openQuickShareChannel('x'));
  bindOptionalClick('quickShareInstagramBtn',()=>openQuickShareChannel('instagram'));
  bindOptionalClick('quickShareFacebookBtn',()=>openQuickShareChannel('facebook'));
  bindOptionalClick('quickShareTikTokBtn',()=>openQuickShareChannel('tiktok'));
  $('#manualSharedBtn').addEventListener('click',()=>{
    const pending=app.pendingManualShare;
    if(!pending) return;
    $('#confirmDialog').close();
    app.pendingManualShare=null;
    markShared(pending.card,'manual');
  });
  $('#confirmDialog').addEventListener('close',()=>{app.pendingManualShare=null;});

  bindOptionalClick('playerPrevBtn',()=>changeResult(-1));
  bindOptionalClick('playerRateBtn',cyclePlaybackRate);
  bindOptionalClick('playerVoiceBtn',cyclePlaybackVoice);
  bindOptionalClick('playerPlayBtn',togglePlayback);
  bindOptionalClick('playerNextBtn',()=>changeResult(1));
  bindOptionalClick('playerShareBtn',event=>{
    const card=currentCard();
    if(card) shareCard(card,event.currentTarget);
  });
  bindOptionalClick('playerFavoriteBtn',()=>{
    const card=currentCard();
    if(card) toggleFavorite(card.id);
  });
  if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=()=>{ensureAudioPreferences();updateCardPlayer();};

  const aiHub=$('#aiHubDialog');
  $$('[data-ai-url]',aiHub).forEach(btn=>btn.addEventListener('click',()=>{
    const opened=window.open(btn.dataset.aiUrl,'_blank','noopener,noreferrer');
    if(!opened) location.href=btn.dataset.aiUrl;
  }));
  $('#aiHubCopyAgainBtn').addEventListener('click',async()=>{
    const prompt=app.aiPrompt||buildAIPromptFromDraft();
    const copied=await copyText(prompt);
    toast(copied?'Encargo copiado de nuevo':'No fue posible copiar automáticamente');
  });
  $('#aiHubReadyBtn').addEventListener('click',()=>{
    aiHub.close();
    setTimeout(()=>{
      const response=$('#aiResponse');
      if(response){response.focus();response.scrollIntoView({behavior:'smooth',block:'center'});}
    },80);
  });
}

function navigate(view,{push=true}={}){
  if(view===app.view) return;
  if(app.view==='results'&&view!=='results') stopPlayback(false);
  if(push && app.view) app.navStack.push(app.view);
  app.view=view;
  if(view==='stage') app.selection={stageId:null,categoryId:null,purposeId:null};
  if(view==='library') app.library.limit=40;
  renderAll();
  window.scrollTo({top:0,behavior:'smooth'});
  $('#mainContent').focus({preventScroll:true});
}

function goBack(){
  const previous=app.navStack.pop() || 'home';
  if(app.view==='results'&&previous!=='results') stopPlayback(false);
  app.view=previous;
  renderAll();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderAll(){
  const views=['home','stage','category','purpose','results','library','shared','ai','settings'];
  views.forEach(name=>{
    const el=$(`#view-${name}`);
    el.hidden=name!==app.view;
    if(name===app.view) renderView(name,el);
  });
  updateChrome();
}

function renderView(name,el){
  const renderers={home:renderHome,stage:renderStage,category:renderCategory,purpose:renderPurpose,results:renderResults,library:renderLibrary,shared:renderShared,ai:renderAI,settings:renderSettings};
  renderers[name](el);
}

function updateChrome(){
  const labels={home:['Puentes','Escuela y familia'],stage:['Crear tarjeta','Paso 1 de 3'],category:['Elegir tema','Paso 2 de 3'],purpose:['Definir intención','Paso 3 de 3'],results:['Tarjeta lista','Revisa y comparte'],library:['Biblioteca','Explora las tarjetas'],shared:['Compartidas','Historial local'],ai:['Ampliar con IA','Función opcional'],settings:['Configuración','Privacidad y firma']};
  $('#topTitle').textContent=labels[app.view][0];
  $('#topSubtitle').textContent=labels[app.view][1];
  $('#backBtn').classList.toggle('is-hidden',app.view==='home');
  $$('.bottom-nav button').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===app.view || (btn.dataset.nav==='stage'&&['stage','category','purpose','results'].includes(app.view))));
  updateCardPlayer();
}

function renderHome(el){
  const last=findCard(app.lastCardId);
  const sharedCount=Object.keys(app.shared).length;
  el.innerHTML=`
    <div class="hero">
      <div class="eyebrow">Ideas breves para acompañar</div>
      <h1>Una tarjeta puede abrir una buena conversación.</h1>
      <p>Elige la etapa, el tema y lo que deseas favorecer. Puentes propone mensajes respetuosos, concretos y listos para compartir con familias y cuidadores.</p>
      <div class="hero-stats"><span>${app.cards.length.toLocaleString('es-CO')} tarjetas</span><span>12 temas</span><span>Sin registro</span></div>
    </div>
    <div class="home-actions">
      <button class="action-card primary" data-home="create"><span class="action-icon">＋</span><span><strong>Crear una tarjeta</strong><small>Escoge en tres pasos y comparte.</small></span><span class="arrow">›</span></button>
      ${last?`<button class="action-card" data-home="last"><span class="action-icon">↺</span><span><strong>Retomar la última</strong><small>${escapeHTML(displayTitle(last.title))}</small></span><span class="arrow">›</span></button>`:''}
      <button class="action-card" data-home="library"><span class="action-icon">▦</span><span><strong>Explorar biblioteca</strong><small>Busca por tema, etapa o palabra.</small></span><span class="arrow">›</span></button>
      <button class="action-card" data-home="surprise"><span class="action-icon">✦</span><span><strong>Sorpréndeme</strong><small>Una idea pertinente elegida al azar.</small></span><span class="arrow">›</span></button>
      <button class="action-card" data-home="ai"><span class="action-icon">IA</span><span><strong>Ampliar con IA</strong><small>Elige una IA e importa nuevas tarjetas.</small></span><span class="arrow">›</span></button>
    </div>
    <div class="info-strip"><strong>Una precisión:</strong> “Compartida” significa que la acción se completó desde la aplicación. Puentes no puede saber si la familia recibió o leyó el mensaje.</div>`;
  $$('[data-home]',el).forEach(btn=>btn.addEventListener('click',()=>{
    const action=btn.dataset.home;
    if(action==='create') navigate('stage');
    if(action==='library') navigate('library');
    if(action==='ai') navigate('ai');
    if(action==='last'&&last) openCard(last);
    if(action==='surprise') surpriseCard();
  }));
}

function stepper(active){
  return `<div class="stepper" aria-label="Paso ${active} de 3">${[1,2,3].map(i=>`<span class="step ${i<active?'done':''} ${i===active?'active':''}"></span>`).join('')}</div>`;
}

function renderStage(el){
  el.innerHTML=`${stepper(1)}<div class="screen-head"><div class="eyebrow">¿Para quién es?</div><h1>Elige la etapa</h1><p>La edad orienta el lenguaje y el tipo de acción. No se guardan nombres ni datos de estudiantes.</p></div><div class="option-list">${app.data.stages.map((s,i)=>`<button class="option-card" data-stage="${s.id}"><span class="option-icon">${i+1}</span><span><h3>${escapeHTML(s.age)} años · ${escapeHTML(s.label)}</h3><p>${escapeHTML(s.grades)}</p></span><span class="check">✓</span></button>`).join('')}</div>`;
  $$('[data-stage]',el).forEach(btn=>btn.addEventListener('click',()=>{app.selection.stageId=btn.dataset.stage;navigate('category');}));
}

function renderCategory(el){
  const stage=getStage(app.selection.stageId);
  el.innerHTML=`${stepper(2)}<div class="selection-summary"><button data-edit-stage>${escapeHTML(stage.age)} años · ${escapeHTML(stage.grades)}</button></div><div class="screen-head"><div class="eyebrow">¿Sobre qué tema?</div><h1>Escoge el contenido</h1><p>Cada categoría explica qué tipo de orientación encontrarás.</p></div><div class="category-grid">${app.data.categories.map(cat=>{
    const ui=categoryUI[cat.id];return `<button class="category-card" data-category="${cat.id}" style="--cat:${ui.color};--cat-soft:${ui.soft}"><span class="category-icon">${ui.icon}</span><span><h3>${escapeHTML(cat.name)}</h3><p>${escapeHTML(cat.description)}</p></span><span>›</span></button>`;
  }).join('')}</div>`;
  $('[data-edit-stage]',el).addEventListener('click',()=>navigate('stage'));
  $$('[data-category]',el).forEach(btn=>btn.addEventListener('click',()=>{app.selection.categoryId=btn.dataset.category;navigate('purpose');}));
}

function renderPurpose(el){
  const stage=getStage(app.selection.stageId),cat=getCategory(app.selection.categoryId);
  el.innerHTML=`${stepper(3)}<div class="selection-summary"><button data-edit-stage>${escapeHTML(stage.age)} años</button><button data-edit-category>${escapeHTML(cat.name)}</button></div><div class="screen-head"><div class="eyebrow">¿Qué deseas favorecer?</div><h1>Define la intención</h1><p>La app priorizará tarjetas coherentes con esta elección, sin reducirlas a una fórmula rígida.</p></div><div class="purpose-grid">${purposeOptions.map(p=>`<button class="purpose-card" data-purpose="${p.id}"><span>${p.icon}</span><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.desc)}</small></button>`).join('')}</div>`;
  $('[data-edit-stage]',el).addEventListener('click',()=>navigate('stage'));
  $('[data-edit-category]',el).addEventListener('click',()=>navigate('category'));
  $$('[data-purpose]',el).forEach(btn=>btn.addEventListener('click',()=>{app.selection.purposeId=btn.dataset.purpose;generateResults();navigate('results');}));
}

function generateResults(){
  const pool=app.cards.filter(c=>c.stage_id===app.selection.stageId&&c.category_id===app.selection.categoryId);
  const purpose=purposeOptions.find(p=>p.id===app.selection.purposeId);
  const now=Date.now();
  const scored=pool.map(card=>{
    const purposeHit=card.purposes?.some(p=>purpose.keys.includes(p))||purpose.keys.includes(card.purpose_primary);
    const shared=app.shared[card.id];
    const recency=shared?Math.max(0,14-((now-new Date(shared.lastAt).getTime())/86400000)):14;
    const viewedIndex=app.viewed.indexOf(card.id);
    return {card,score:(purposeHit?35:0)+(shared?Math.max(-8,recency-14):12)+(viewedIndex<0?8:Math.max(0,6-viewedIndex/10))+Math.random()*13};
  }).sort((a,b)=>b.score-a.score);
  const top=scored.slice(0,Math.min(14,scored.length));
  const generated=sample(top.map(x=>x.card),3);
  setPlaybackQueue(generated,generated[0]?.id||null,'results');
  if(generated[0]) rememberViewed(generated[0].id);
}

function renderResults(el){
  const card=app.results[app.resultIndex];
  if(!card){el.innerHTML='<div class="empty-state"><h2>No encontramos una tarjeta</h2><p>Prueba una combinación diferente.</p><button class="button primary" data-restart>Volver a elegir</button></div>'; $('[data-restart]',el).addEventListener('click',()=>navigate('stage'));return;}
  const cat=getCategory(card.category_id),stage=getStage(card.stage_id),ui=categoryUI[card.category_id]||categoryUI.C01;
  const shared=app.shared[card.id];
  const purpose=purposeOptions.find(p=>p.id===app.selection.purposeId);
  const refs=(card.source_codes||[]).map(code=>app.data.references.find(r=>r.code===code)).filter(Boolean);
  el.innerHTML=`
    <div class="selection-summary"><button data-edit>${escapeHTML(stage.age)} años</button><button data-edit>${escapeHTML(cat.name)}</button>${purpose?`<span class="chip">${escapeHTML(purpose.title)}</span>`:''}</div>
    <div class="card-counter">Tarjeta ${app.resultIndex+1} de ${app.results.length}</div>
    <article class="share-card" style="--cat:${ui.color};--cat-soft:${ui.soft}">
      <div class="card-top"><span class="card-category"><b>${ui.icon}</b> ${escapeHTML(cat.name)}</span>${shared?`<span class="shared-status">✓ Compartida ${relativeDate(shared.lastAt)}</span>`:''}</div>
      <h2>${escapeHTML(displayTitle(card.title))}</h2>
      <p class="card-message">${escapeHTML(card.message)}</p>
      <div class="card-section action"><small>Para probar en familia</small><p>${escapeHTML(cleanLead(card.action))}</p></div>
      <div class="card-section question"><small>Una pregunta para conversar</small><p>${escapeHTML(cleanQuestion(card.conversation_prompt))}</p></div>
      <p class="card-closing">${escapeHTML(card.closing)}</p>
      <div class="card-footer"><span>${escapeHTML(stage.age)} años · ${escapeHTML(stage.grades)}</span><strong>${escapeHTML(app.profile.signature||'Puentes · Escuela y familia')}</strong></div>
    </article>
    <details class="foundation"><summary>Fundamento y uso responsable</summary><div class="foundation-content"><p>${escapeHTML(card.editorial_basis||'Orientación educativa general.')}</p>${refs.length?`<ul>${refs.map(r=>`<li>${escapeHTML(shortReference(r.apa))}</li>`).join('')}</ul>`:''}<p>No sustituye una valoración profesional ni debe emplearse para etiquetar a una niña, niño o adolescente.</p></div></details>
    <button class="button ghost full" data-edit style="margin-top:9px">Cambiar etapa, tema o intención</button>`;
  $$('[data-edit]',el).forEach(btn=>btn.addEventListener('click',()=>navigate('stage')));
}

function changeResult(delta){
  movePlaybackQueue(delta);
}

function queueOriginForLibrary(){
  if(app.library.tab==='favorites') return 'favorites';
  if(app.library.tab==='shared') return 'shared';
  if(app.library.tab==='custom') return 'ai';
  if(app.library.stage!=='all'&&app.library.category!=='all') return 'category';
  return 'library';
}

function openCard(card,queue=null,origin=null){
  if(!card) return;
  const source=Array.isArray(queue)&&queue.length
    ? queue
    : app.cards.filter(item=>item.stage_id===card.stage_id&&item.category_id===card.category_id);
  setPlaybackQueue(source,card.id,origin||(queue?'library':'category'));
  app.selection={stageId:card.stage_id,categoryId:card.category_id,purposeId:null};
  rememberViewed(card.id);
  navigate('results');
}

function surpriseCard(){
  const recent=new Set(app.viewed.slice(0,30));
  const pool=app.cards.filter(c=>!recent.has(c.id));
  const card=pool[Math.floor(Math.random()*pool.length)]||app.cards[Math.floor(Math.random()*app.cards.length)];
  openCard(card);
}

function renderLibrary(el){
  const filtered=getLibraryCards();
  const visible=filtered.slice(0,app.library.limit);
  el.innerHTML=`
    <div class="screen-head"><div class="eyebrow">${app.cards.length.toLocaleString('es-CO')} orientaciones disponibles</div><h1>Biblioteca de tarjetas</h1><p>Busca una idea concreta o revisa lo que ya guardaste y compartiste.</p></div>
    <div class="tabs">${[['all','Todas'],['favorites','Favoritas'],['shared','Compartidas'],['custom','Creadas con IA']].map(([id,label])=>`<button data-tab="${id}" class="${app.library.tab===id?'active':''}">${label}</button>`).join('')}</div>
    <div class="filter-bar"><div class="search-box"><span>⌕</span><input id="librarySearch" type="search" placeholder="Buscar: sueño, límites, estudio…" value="${escapeHTML(app.library.search)}"></div><div class="filter-row"><select id="stageFilter"><option value="all">Todas las edades</option>${app.data.stages.map(s=>`<option value="${s.id}" ${app.library.stage===s.id?'selected':''}>${s.age} años</option>`).join('')}</select><select id="categoryFilter"><option value="all">Todos los temas</option>${app.data.categories.map(c=>`<option value="${c.id}" ${app.library.category===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select></div></div>
    <div class="library-list">${visible.length?visible.map(libraryItemHTML).join(''):`<div class="empty-state"><span class="empty-icon">⌕</span><h2>No encontramos tarjetas</h2><p>Ajusta los filtros o prueba otra palabra.</p></div>`}</div>
    ${visible.length<filtered.length?`<button class="button secondary full load-more" data-more>Mostrar más · ${filtered.length-visible.length} restantes</button>`:''}`;
  $$('[data-tab]',el).forEach(btn=>btn.addEventListener('click',()=>{app.library.tab=btn.dataset.tab;app.library.limit=40;renderLibrary(el);}));
  $('#librarySearch',el).addEventListener('input',e=>{app.library.search=e.target.value;app.library.limit=40;renderLibrary(el);requestAnimationFrame(()=>{const input=$('#librarySearch',el);input.focus();input.setSelectionRange(input.value.length,input.value.length);});});
  $('#stageFilter',el).addEventListener('change',e=>{app.library.stage=e.target.value;app.library.limit=40;renderLibrary(el);});
  $('#categoryFilter',el).addEventListener('change',e=>{app.library.category=e.target.value;app.library.limit=40;renderLibrary(el);});
  $$('[data-card]',el).forEach(btn=>btn.addEventListener('click',()=>openCard(findCard(btn.dataset.card),visible,queueOriginForLibrary())));
  if($('[data-more]',el)) $('[data-more]',el).addEventListener('click',()=>{app.library.limit+=40;renderLibrary(el);});
}

function getLibraryCards(){
  const q=normalize(app.library.search);
  return app.cards.filter(c=>{
    if(app.library.tab==='favorites'&&!app.favorites.has(c.id)) return false;
    if(app.library.tab==='shared'&&!app.shared[c.id]) return false;
    if(app.library.tab==='custom'&&c.status!=='creada-con-ia') return false;
    if(app.library.stage!=='all'&&c.stage_id!==app.library.stage) return false;
    if(app.library.category!=='all'&&c.category_id!==app.library.category) return false;
    if(q&&!normalize([c.title,c.message,c.action,c.conversation_prompt,(c.tags||[]).join(' ')].join(' ')).includes(q)) return false;
    return true;
  }).sort((a,b)=>{
    if(app.library.tab==='shared') return new Date(app.shared[b.id]?.lastAt||0)-new Date(app.shared[a.id]?.lastAt||0);
    return a.category_id.localeCompare(b.category_id)||a.stage_id.localeCompare(b.stage_id)||a.title.localeCompare(b.title,'es');
  });
}

function libraryItemHTML(card){
  const cat=getCategory(card.category_id),stage=getStage(card.stage_id),ui=categoryUI[card.category_id]||categoryUI.C01,shared=app.shared[card.id];
  return `<button class="library-item" data-card="${card.id}" style="--cat:${ui.color}"><span class="bar"></span><span><h3>${escapeHTML(displayTitle(card.title))}</h3><p>${escapeHTML(cat.name)}</p><span class="meta"><span>${escapeHTML(stage.age)} años</span>${card.status==='creada-con-ia'?'<span>IA · revisar</span>':''}${shared?`<span>Compartida ${relativeDate(shared.lastAt)}</span>`:''}</span></span><span class="side"><b>${app.favorites.has(card.id)?'♥':''}</b><span>›</span></span></button>`;
}

function renderShared(el){
  const entries=Object.entries(app.shared).map(([id,record])=>({card:findCard(id),record})).filter(x=>x.card).sort((a,b)=>new Date(b.record.lastAt)-new Date(a.record.lastAt));
  const grouped=groupBy(entries,x=>formatDay(x.record.lastAt));
  el.innerHTML=`<div class="screen-head"><div class="eyebrow">Registro del dispositivo</div><h1>Tarjetas compartidas</h1><p>El historial evita repeticiones involuntarias, pero nunca bloquea un nuevo envío.</p></div>${entries.length?Object.entries(grouped).map(([day,items])=>`<div class="history-day">${escapeHTML(day)}</div><div class="library-list">${items.map(x=>libraryItemHTML(x.card)).join('')}</div>`).join(''):`<div class="empty-state"><span class="empty-icon">✓</span><h2>Aún no hay envíos registrados</h2><p>Cuando compartas una tarjeta desde Puentes aparecerá aquí.</p><button class="button primary" data-create>Crear la primera</button></div>`}`;
  $$('[data-card]',el).forEach(btn=>btn.addEventListener('click',()=>openCard(findCard(btn.dataset.card),entries.map(item=>item.card),'shared')));
  if($('[data-create]',el)) $('[data-create]',el).addEventListener('click',()=>navigate('stage'));
}

function renderAI(el){
  const stage=app.aiDraft.stageId||app.selection.stageId||'E3';
  const category=app.aiDraft.categoryId||app.selection.categoryId||'C01';
  const purpose=app.aiDraft.purposeId||app.selection.purposeId||'talk';
  const count=clampCardCount(app.aiDraft.count||30);
  const situation=app.aiDraft.situation||'';
  el.innerHTML=`
    <div class="screen-head"><div class="eyebrow">Extensión opcional</div><h1>Ampliar con IA</h1><p>Usa una IA para crear tarjetas nuevas que <strong>complementan</strong> la biblioteca actual y amplían tu repertorio.</p></div>
    <div class="ai-flow-strip" aria-label="Flujo para ampliar con inteligencia artificial">
      <div class="flow-pill"><span>⚙️</span><small>Configura</small></div>
      <div class="flow-pill"><span>📋</span><small>Copia</small></div>
      <div class="flow-pill"><span>✨</span><small>Genera</small></div>
      <div class="flow-pill"><span>📥</span><small>Pega</small></div>
      <div class="flow-pill"><span>🗂️</span><small>Amplía</small></div>
    </div>
    <div class="privacy-note"><strong>Sin datos personales.</strong> Describe situaciones generales: por ejemplo, “hay discusiones frecuentes en el chat del grupo”.</div>
    <div class="form-card"><h2>1. Define el encargo</h2>
      <div class="field"><label for="aiStage">Etapa</label><select id="aiStage">${app.data.stages.map(s=>`<option value="${s.id}" ${stage===s.id?'selected':''}>${s.age} años · ${escapeHTML(s.grades)}</option>`).join('')}</select></div>
      <div class="field"><label for="aiCategory">Tema</label><select id="aiCategory">${app.data.categories.map(c=>`<option value="${c.id}" ${category===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="aiPurpose">Intención</label><select id="aiPurpose">${purposeOptions.map(p=>`<option value="${p.id}" ${purpose===p.id?'selected':''}>${escapeHTML(p.title)}</option>`).join('')}</select></div>
      <div class="field number-field"><label for="aiCount">Número de tarjetas</label><div class="number-control"><button type="button" data-count-step="-5" aria-label="Reducir cinco tarjetas">−</button><input id="aiCount" type="number" inputmode="numeric" min="1" max="100" step="1" value="${count}"><button type="button" data-count-step="5" aria-label="Agregar cinco tarjetas">＋</button></div><small>30 por defecto. Puedes solicitar entre 1 y 100 tarjetas.</small></div>
      <div class="field"><label for="aiSituation">Situación general <span class="optional-label">opcional</span></label><textarea id="aiSituation" placeholder="Ejemplo: varias familias preguntan cómo acompañar el uso nocturno del celular sin convertirlo en una pelea.">${escapeHTML(situation)}</textarea></div>
      <button class="button primary full ai-launch-button" data-open-ai-hub><span>Copiar encargo y elegir IA</span><span aria-hidden="true">↗</span></button>
      <div class="inline-success" id="aiCopyStatus" hidden><strong>Encargo copiado.</strong> Abre una IA, pega el encargo y trae de vuelta la respuesta JSON.</div>
    </div>
    <div class="form-card ai-import-card"><h2>2. Pega la respuesta JSON</h2><p>Las tarjetas importadas se guardan como <strong>IA · revisar</strong> y pasan a complementar la biblioteca en <strong>Todas</strong> y <strong>Creadas con IA</strong>.</p>
      <div class="field"><label for="aiResponse">Respuesta de la IA</label><textarea id="aiResponse" class="code" spellcheck="false" placeholder='Pega aquí la respuesta JSON completa: {"cards":[…]}'></textarea></div>
      <div class="ai-import-actions"><button class="button secondary" data-paste-response>Pegar desde el portapapeles</button><button class="button primary" data-import>Importar y ver tarjetas</button></div>
      <p class="micro-help">Puentes acepta JSON directo o contenido rodeado por marcas de código. Si la IA entrega menos tarjetas de las solicitadas, importará las válidas.</p>
    </div>`;

  const draftFields=['aiStage','aiCategory','aiPurpose','aiSituation','aiCount'];
  const updateDraft=()=>{
    app.aiDraft={
      stageId:$('#aiStage',el).value,
      categoryId:$('#aiCategory',el).value,
      purposeId:$('#aiPurpose',el).value,
      situation:$('#aiSituation',el).value.trim(),
      count:clampCardCount($('#aiCount',el).value)
    };
    $('#aiCount',el).value=app.aiDraft.count;
    saveState();
  };
  draftFields.forEach(id=>$('#'+id,el).addEventListener(id==='aiSituation'?'input':'change',updateDraft));
  $$('[data-count-step]',el).forEach(btn=>btn.addEventListener('click',()=>{
    const input=$('#aiCount',el);
    input.value=clampCardCount(Number(input.value||30)+Number(btn.dataset.countStep));
    updateDraft();
  }));

  $('[data-open-ai-hub]',el).addEventListener('click',async()=>{
    updateDraft();
    app.aiPrompt=buildAIPromptFromDraft();
    const button=$('[data-open-ai-hub]',el);
    const original=button.innerHTML;
    button.disabled=true;
    button.innerHTML='<span class="share-spinner" aria-hidden="true"></span><span>Copiando encargo…</span>';
    const copied=await copyText(app.aiPrompt);
    button.disabled=false;
    button.innerHTML=original;
    if(!copied){
      toast('No fue posible copiar automáticamente. Revisa los permisos del portapapeles.');
      return;
    }
    $('#aiHubCount').textContent=app.aiDraft.count;
    $('#aiCopyStatus',el).hidden=false;
    const dialog=$('#aiHubDialog');
    if(!dialog.open) dialog.showModal();
    toast(`Encargo para ${app.aiDraft.count} tarjetas copiado`);
  });

  $('[data-paste-response]',el).addEventListener('click',async()=>{
    const text=await readClipboardText();
    const response=$('#aiResponse',el);
    if(text){response.value=text;response.focus();toast('Respuesta pegada');}
    else{response.focus();toast('Mantén pulsado en el cuadro y elige “Pegar”');}
  });

  $('[data-import]',el).addEventListener('click',()=>{
    updateDraft();
    importAIResponse($('#aiResponse',el).value,app.aiDraft.stageId,app.aiDraft.categoryId,app.aiDraft.purposeId,app.aiDraft.count);
  });
}

function clampCardCount(value){
  const parsed=Math.round(Number(value));
  return Number.isFinite(parsed)?Math.min(100,Math.max(1,parsed)):30;
}

function buildAIPromptFromDraft(){
  const draft=app.aiDraft||{};
  return buildAIPrompt(draft.stageId||'E3',draft.categoryId||'C01',draft.purposeId||'talk',draft.situation||'',clampCardCount(draft.count||30));
}

function buildAIPrompt(stageId,categoryId,purposeId,situation,count=30){
  const stage=getStage(stageId),cat=getCategory(categoryId),purpose=purposeOptions.find(p=>p.id===purposeId),total=clampCardCount(count);
  return `Actúa como editor especializado en comunicación respetuosa entre escuela y familia. Crea exactamente ${total} tarjetas originales para familias y personas cuidadoras.

CONTEXTO
- Etapa: ${stage.age} años (${stage.grades}).
- Tema: ${cat.name}.
- Intención: ${purpose.title}.
- Situación general: ${situation||'No se aportó una situación adicional.'}

CRITERIOS
1. Tono cálido, claro, colaborativo y no culpabilizador.
2. No diagnostiques, no etiquetes, no moralices y no supongas una familia tradicional.
3. Habla de familias, personas cuidadoras, niñas, niños o adolescentes según corresponda.
4. Cada tarjeta debe comprenderse sin conocimientos técnicos.
5. Incluye una acción concreta, realizable y una pregunta que abra conversación.
6. No inventes citas, autores ni bibliografía.
7. Evita nombres y cualquier dato personal o identificable.
8. Extensión total aproximada de cada tarjeta: 60 a 90 palabras.
9. Las ${total} tarjetas deben ser distintas entre sí: no repitas títulos, preguntas, acciones ni el mismo consejo con palabras diferentes.
10. Distribuye los enfoques para cubrir prevención, acompañamiento, reconocimiento, diálogo y acción, sin apartarte de la intención principal.

DEVUELVE ÚNICAMENTE JSON VÁLIDO, SIN EXPLICACIONES, SIN COMENTARIOS Y SIN BLOQUES DE CÓDIGO. DEBE CONTENER EXACTAMENTE ${total} OBJETOS EN "cards" CON ESTA ESTRUCTURA:
{
  "cards": [
    {
      "title": "Título breve y específico",
      "message": "Orientación principal en 2 o 3 frases.",
      "action": "Una acción concreta que pueda probarse esta semana.",
      "conversation_prompt": "Una pregunta abierta y respetuosa.",
      "closing": "Cierre breve que una escuela y familia.",
      "tags": ["palabra1", "palabra2"]
    }
  ]
}`;
}

function importAIResponse(raw,stageId,categoryId,purposeId,requestedCount=30){
  try{
    if(!raw.trim()) throw new Error('Pega primero la respuesta JSON de la IA.');
    const clean=extractJSONText(raw);
    const parsed=JSON.parse(clean);
    const list=Array.isArray(parsed)?parsed:parsed.cards;
    if(!Array.isArray(list)||!list.length) throw new Error('No se encontró una lista de tarjetas.');
    const purpose=purposeOptions.find(p=>p.id===purposeId);
    const limit=clampCardCount(requestedCount);
    const seen=new Set();
    const valid=[];
    for(const item of list.slice(0,limit)){
      const card=validateImportedCard(item,valid.length,stageId,categoryId,purpose);
      const key=normalize(card.title);
      if(seen.has(key)) continue;
      seen.add(key);
      valid.push(card);
    }
    if(!valid.length) throw new Error('La respuesta no contiene tarjetas válidas.');
    app.custom=[...valid,...app.custom];
    app.cards=[...app.data.cards,...app.custom];
    saveState();
    const detail=valid.length===limit?`${valid.length} tarjetas importadas`:`${valid.length} de ${limit} tarjetas importadas`;
    toast(`${detail} para revisión`);
    app.library.tab='custom';app.library.stage='all';app.library.category='all';app.library.search='';app.library.limit=Math.max(40,valid.length);
    navigate('library');
  }catch(error){toast(`No se pudo importar: ${error.message}`);}
}

function extractJSONText(raw){
  let clean=raw.trim();
  clean=clean.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const firstObject=clean.indexOf('{'),lastObject=clean.lastIndexOf('}');
  const firstArray=clean.indexOf('['),lastArray=clean.lastIndexOf(']');
  if(firstObject>=0&&lastObject>firstObject) return clean.slice(firstObject,lastObject+1);
  if(firstArray>=0&&lastArray>firstArray) return clean.slice(firstArray,lastArray+1);
  return clean;
}

function validateImportedCard(c,index,stageId,categoryId,purpose){
  const required=['title','message','action','conversation_prompt','closing'];
  required.forEach(k=>{if(typeof c[k]!=='string'||c[k].trim().length<8) throw new Error(`La tarjeta ${index+1} no contiene “${k}” correctamente.`);});
  const all=required.map(k=>c[k]).join(' ');
  if(all.length>1600) throw new Error(`La tarjeta ${index+1} es demasiado extensa.`);
  return {id:`PUE-IA-${Date.now()}-${index+1}`,category_id:categoryId,category:getCategory(categoryId).name,category_slug:getCategory(categoryId).slug,category_card_number:0,stage_id:stageId,age_range:getStage(stageId).age,grades:getStage(stageId).grades,developmental_stage:getStage(stageId).label,purpose_primary:purpose.keys[0],purposes:purpose.keys.slice(0,2),title:sanitize(c.title),message:sanitize(c.message),action:sanitize(c.action),conversation_prompt:sanitize(c.conversation_prompt),closing:sanitize(c.closing),tone:'cálido, respetuoso, colaborativo y no culpabilizador',tags:Array.isArray(c.tags)?c.tags.slice(0,6).map(sanitize):[],source_codes:['IA-USUARIO'],editorial_basis:'Contenido creado con una herramienta de IA e importado por la persona usuaria. Requiere revisión humana antes de compartir.',word_count:all.split(/\s+/).length,status:'creada-con-ia',content_version:'1.0.0',created_at:new Date().toISOString().slice(0,10)};
}


function normalizeQueueCards(cards){
  const seen=new Set();
  return (cards||[]).map(card=>typeof card==='string'?findCard(card):card).filter(card=>{
    if(!card?.id||seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

function syncResultsWithQueue(){
  const cards=app.audio.queue.map(findCard).filter(Boolean);
  app.audio.queue=cards.map(card=>card.id);
  if(!cards.length){
    app.audio.queueIndex=0;
    app.results=[];
    app.resultIndex=0;
    return;
  }
  app.audio.queueIndex=Math.min(Math.max(0,app.audio.queueIndex),cards.length-1);
  app.results=cards;
  app.resultIndex=app.audio.queueIndex;
}

function setPlaybackQueue(cards,currentId=null,origin='library'){
  stopPlayback(false);
  const normalized=normalizeQueueCards(cards);
  app.audio.queue=normalized.map(card=>card.id);
  app.audio.queueOrigin=origin;
  const selected=Math.max(0,normalized.findIndex(card=>card.id===currentId));
  app.audio.queueIndex=selected;
  app.audio.fragmentIndex=0;
  syncResultsWithQueue();
}

function currentCard(){
  syncResultsWithQueue();
  return findCard(app.audio.queue[app.audio.queueIndex])||app.results[app.resultIndex]||null;
}

function cardsAvailableForNavigation(){
  syncResultsWithQueue();
  return app.audio.queue.length;
}

function formatPlaybackRate(rate){
  return `${String(rate).replace('.',',')}×`;
}

function availablePlaybackVoices(){
  if(!('speechSynthesis' in window)) return [];
  try{
    const voices=speechSynthesis.getVoices()||[];
    const spanish=voices.filter(v=>/^es([_-]|$)/i.test(v.lang));
    return spanish.length?spanish:voices;
  }catch{return [];}
}

function rankVoice(voice){
  if(/^es[-_]CO$/i.test(voice.lang)) return 0;
  if(/^es[-_](MX|US|419)$/i.test(voice.lang)) return 1;
  if(/^es[-_]ES$/i.test(voice.lang)) return 2;
  if(/^es/i.test(voice.lang)) return 3;
  return voice.default?4:5;
}

function ensureAudioPreferences(){
  if(!PLAYBACK_RATES.includes(Number(app.audio?.rate))) app.audio.rate=1;
  const voices=availablePlaybackVoices();
  if(!voices.length) return;
  const selected=voices.find(v=>v.voiceURI===app.audio.voiceURI);
  if(!selected){
    const preferred=[...voices].sort((a,b)=>rankVoice(a)-rankVoice(b))[0];
    app.audio.voiceURI=preferred?.voiceURI||voices[0].voiceURI;
    saveState();
  }
}

function selectedPlaybackVoice(){
  const voices=availablePlaybackVoices();
  if(!voices.length) return null;
  return voices.find(v=>v.voiceURI===app.audio.voiceURI)||[...voices].sort((a,b)=>rankVoice(a)-rankVoice(b))[0]||voices[0];
}

function voiceLabel(voice){
  if(!voice) return 'Voz automática';
  const name=String(voice.name||'Voz').replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();
  return `${name} · ${voice.lang||'idioma del dispositivo'}`;
}

function playbackStatusLabel(){
  if(app.audio.isPlaying) return 'Reproduciendo';
  if(app.audio.isPaused) return 'Pausado';
  return 'Detenido';
}

function updateCardPlayer(){
  const player=$('#cardPlayer');
  if(!player) return;
  const card=currentCard();
  const visible=app.view==='results'&&Boolean(card);
  player.hidden=!visible;
  document.body.classList.toggle('card-player-visible',visible);
  if(!visible) return;

  ensureAudioPreferences();
  const play=$('#playerPlayBtn');
  const favorite=$('#playerFavoriteBtn');
  const rateButton=$('#playerRateBtn');
  const voiceButton=$('#playerVoiceBtn');
  const rateBadge=$('#playerRateBadge');
  const voiceBadge=$('#playerVoiceBadge');
  if(!play||!favorite||!rateButton||!voiceButton||!rateBadge||!voiceBadge){
    console.warn('[Puentes] El reproductor está incompleto; se ocultará para mantener operativa la aplicación.');
    player.hidden=true;
    document.body.classList.remove('card-player-visible');
    return;
  }

  const isPlaying=app.audio.isPlaying;
  const isPaused=app.audio.isPaused;
  const total=Math.max(1,app.audio.queue.length);
  const position=Math.min(total,app.audio.queueIndex+1);
  const progress=`${position}/${total}`;
  const stateMark=isPlaying?'▶':isPaused?'Ⅱ':'■';
  play.innerHTML=`${isPlaying?PLAYER_PAUSE_ICON:PLAYER_PLAY_ICON}<span id="playerProgressBadge" class="player-progress-badge" aria-hidden="true">${progress}</span>`;
  play.setAttribute('aria-label',`${isPlaying?'Pausar':isPaused?'Continuar':'Iniciar'} lectura. ${progress}, ${formatPlaybackRate(app.audio.rate)}, ${voiceLabel(selectedPlaybackVoice())}, ${playbackStatusLabel()}`);
  play.setAttribute('title',`${playbackStatusLabel()} · ${progress} · ${formatPlaybackRate(app.audio.rate)} · ${voiceLabel(selectedPlaybackVoice())}`);
  play.setAttribute('aria-pressed',String(isPlaying));
  play.classList.toggle('playing',isPlaying);
  play.classList.toggle('paused',isPaused);
  play.dataset.state=stateMark;

  const rate=Number(app.audio.rate)||1;
  rateBadge.textContent=formatPlaybackRate(rate);
  rateButton.setAttribute('aria-label',`Velocidad ${formatPlaybackRate(rate)}. Toca para cambiar`);
  rateButton.setAttribute('title',`Velocidad ${formatPlaybackRate(rate)} · tocar para cambiar`);

  const voices=availablePlaybackVoices();
  const voice=selectedPlaybackVoice();
  const voiceIndex=Math.max(0,voices.findIndex(v=>v.voiceURI===voice?.voiceURI));
  voiceBadge.textContent=voices.length>1?String(voiceIndex+1):'•';
  voiceButton.disabled=!voices.length;
  voiceButton.setAttribute('aria-label',voices.length?`${voiceLabel(voice)}. Voz ${voiceIndex+1} de ${voices.length}. Toca para cambiar`:'Las voces todavía no están disponibles');
  voiceButton.setAttribute('title',voices.length?`${voiceLabel(voice)} · ${voiceIndex+1}/${voices.length}`:'Esperando voces del dispositivo');

  const saved=app.favorites.has(card.id);
  favorite.classList.toggle('active',saved);
  favorite.setAttribute('aria-pressed',String(saved));
  favorite.setAttribute('aria-label',saved?'Quitar de favoritas':'Guardar en favoritas');
  favorite.setAttribute('title',saved?'Quitar de favoritas':'Guardar en favoritas');

  $('#playerPrevBtn').disabled=app.audio.queueIndex<=0;
  $('#playerNextBtn').disabled=app.audio.queueIndex>=app.audio.queue.length-1;
}

function getCardSpeechFragments(card){
  if(!card) return [];
  return [
    displayTitle(card.title),
    card.message,
    card.action?`Para probar en familia. ${cleanLead(card.action)}`:'',
    card.conversation_prompt?`Una pregunta para conversar. ${cleanQuestion(card.conversation_prompt)}`:'',
    card.closing
  ].map(value=>String(value||'').trim()).filter(Boolean);
}

function cancelCurrentUtterance({resetFragment=false}={}){
  app.playback.token++;
  app.playback.utterance=null;
  if(resetFragment) app.audio.fragmentIndex=0;
  if('speechSynthesis' in window){
    try{speechSynthesis.cancel();}catch{}
  }
}

function stopPlayback(update=true){
  cancelCurrentUtterance({resetFragment:true});
  app.audio.isPlaying=false;
  app.audio.isPaused=false;
  if(update) updateCardPlayer();
}

function finishPlaybackAtEnd(){
  app.audio.isPlaying=false;
  app.audio.isPaused=false;
  app.audio.fragmentIndex=0;
  app.playback.utterance=null;
  updateCardPlayer();
}

function advanceAfterCard(){
  if(!app.audio.isPlaying) return;
  if(app.audio.continuous&&app.audio.queueIndex<app.audio.queue.length-1){
    app.audio.queueIndex++;
    app.audio.fragmentIndex=0;
    syncResultsWithQueue();
    const card=currentCard();
    if(card) rememberViewed(card.id);
    renderAll();
    setTimeout(()=>{if(app.audio.isPlaying&&app.view==='results') speakCurrentFragment();},60);
    return;
  }
  finishPlaybackAtEnd();
}

function speakCurrentFragment(){
  const card=currentCard();
  if(!card||!app.audio.isPlaying||app.view!=='results') return;
  if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){
    stopPlayback();
    toast('La lectura en voz alta no está disponible en este navegador');
    return;
  }
  const fragments=getCardSpeechFragments(card);
  if(!fragments.length){
    advanceAfterCard();
    return;
  }
  if(app.audio.fragmentIndex>=fragments.length){
    advanceAfterCard();
    return;
  }

  cancelCurrentUtterance({resetFragment:false});
  const token=++app.playback.token;
  const expectedCardId=card.id;
  const expectedFragment=app.audio.fragmentIndex;
  const utterance=new SpeechSynthesisUtterance(fragments[expectedFragment]);
  ensureAudioPreferences();
  const voice=selectedPlaybackVoice();
  if(voice){utterance.voice=voice;utterance.lang=voice.lang;}else utterance.lang='es-CO';
  utterance.rate=Number(app.audio.rate)||1;
  utterance.pitch=1;
  utterance.volume=1;
  app.playback.utterance=utterance;
  let settled=false;
  const complete=error=>{
    if(settled||app.playback.token!==token) return;
    settled=true;
    app.playback.utterance=null;
    if(!app.audio.isPlaying||currentCard()?.id!==expectedCardId||app.audio.fragmentIndex!==expectedFragment) return;
    if(error&&!['canceled','interrupted'].includes(error)) toast('Un fragmento no pudo leerse; continuamos con la tarjeta');
    app.audio.fragmentIndex++;
    setTimeout(()=>{
      if(!app.audio.isPlaying) return;
      const currentFragments=getCardSpeechFragments(currentCard());
      if(app.audio.fragmentIndex<currentFragments.length) speakCurrentFragment();
      else advanceAfterCard();
    },20);
  };
  utterance.onend=()=>complete(null);
  utterance.onerror=event=>complete(event?.error||'error');
  updateCardPlayer();
  try{speechSynthesis.speak(utterance);}catch(error){
    console.warn('No fue posible iniciar un fragmento de lectura',error);
    complete('speak-error');
  }
}

function startPlayback(){
  const card=currentCard();
  if(!card) return;
  if(!app.audio.queue.length) setPlaybackQueue([card],card.id,'single');
  app.audio.isPlaying=true;
  app.audio.isPaused=false;
  speakCurrentFragment();
}

function restartPlaybackAfterPreferenceChange(wasPlaying,wasPaused=false){
  cancelCurrentUtterance({resetFragment:false});
  app.audio.isPlaying=wasPlaying;
  app.audio.isPaused=wasPaused&&!wasPlaying;
  updateCardPlayer();
  if(wasPlaying) setTimeout(()=>{if(app.audio.isPlaying) speakCurrentFragment();},60);
}

function cyclePlaybackRate(){
  const current=Number(app.audio.rate)||1;
  const index=Math.max(0,PLAYBACK_RATES.indexOf(current));
  const wasPlaying=app.audio.isPlaying;
  const wasPaused=app.audio.isPaused;
  app.audio.rate=PLAYBACK_RATES[(index+1)%PLAYBACK_RATES.length];
  saveState();
  restartPlaybackAfterPreferenceChange(wasPlaying,wasPaused);
  toast(`Velocidad ${formatPlaybackRate(app.audio.rate)}`);
}

function cyclePlaybackVoice(){
  const voices=availablePlaybackVoices();
  if(!voices.length){
    toast('Las voces del dispositivo todavía no están disponibles');
    return;
  }
  const current=voices.findIndex(v=>v.voiceURI===app.audio.voiceURI);
  const next=voices[(current+1+voices.length)%voices.length];
  const wasPlaying=app.audio.isPlaying;
  const wasPaused=app.audio.isPaused;
  app.audio.voiceURI=next.voiceURI;
  saveState();
  restartPlaybackAfterPreferenceChange(wasPlaying,wasPaused);
  toast(`Voz: ${voiceLabel(next)}`);
}

function movePlaybackQueue(delta){
  syncResultsWithQueue();
  if(!app.audio.queue.length) return;
  const target=Math.min(Math.max(0,app.audio.queueIndex+delta),app.audio.queue.length-1);
  if(target===app.audio.queueIndex) return;
  const wasPlaying=app.audio.isPlaying;
  const wasPaused=app.audio.isPaused;
  cancelCurrentUtterance({resetFragment:true});
  app.audio.queueIndex=target;
  app.audio.isPlaying=wasPlaying;
  app.audio.isPaused=wasPaused&&!wasPlaying;
  syncResultsWithQueue();
  const card=currentCard();
  if(card) rememberViewed(card.id);
  renderAll();
  if(wasPlaying) setTimeout(()=>{if(app.audio.isPlaying&&app.view==='results') speakCurrentFragment();},60);
}

function togglePlayback(){
  const card=currentCard();
  if(!card) return;
  if(app.audio.isPlaying){
    try{
      speechSynthesis.pause();
      app.audio.isPlaying=false;
      app.audio.isPaused=true;
      updateCardPlayer();
    }catch{stopPlayback();}
    return;
  }
  if(app.audio.isPaused){
    app.audio.isPlaying=true;
    app.audio.isPaused=false;
    try{
      if(app.playback.utterance) speechSynthesis.resume();
      else speakCurrentFragment();
      updateCardPlayer();
    }catch{startPlayback();}
    return;
  }
  startPlayback();
}
function renderSettings(el){
  const sharedTotal=Object.values(app.shared).reduce((sum,r)=>sum+(r.count||1),0);
  el.innerHTML=`
    <div class="screen-head"><div class="eyebrow">Personalización local</div><h1>Configuración e información</h1><p>La firma es opcional y se guarda únicamente en este dispositivo.</p></div>
    <section class="settings-section"><h2>Firma de las tarjetas</h2><p>Puede ser utilizada por una docente, un orientador, una institución o cualquier persona que acompañe procesos educativos.</p><div class="field"><label for="profileName">Nombre de quien comparte</label><input id="profileName" value="${escapeHTML(app.profile.name)}" placeholder="Opcional"></div><div class="field"><label for="profileInstitution">Institución o proyecto</label><input id="profileInstitution" value="${escapeHTML(app.profile.institution)}" placeholder="Opcional"></div><div class="field"><label for="profileSignature">Firma breve en la tarjeta</label><input id="profileSignature" value="${escapeHTML(app.profile.signature)}" maxlength="54"></div><button class="button primary full" data-save-profile>Guardar cambios</button></section>
    <section class="settings-section"><h2>Tu uso de Puentes</h2><div class="stat-grid"><div class="stat"><strong>${app.cards.length}</strong><small>tarjetas</small></div><div class="stat"><strong>${app.favorites.size}</strong><small>favoritas</small></div><div class="stat"><strong>${sharedTotal}</strong><small>envíos</small></div></div></section>
    <section class="settings-section"><h2>Privacidad</h2><p>Puentes no requiere cuenta, no registra nombres de estudiantes y no envía el historial a un servidor. Favoritas, tarjetas importadas y registros de uso permanecen en el almacenamiento local del navegador.</p></section>
    <section class="settings-section"><h2>Alcance</h2><p>Las tarjetas ofrecen orientación educativa general. No son diagnósticos, tratamientos ni reemplazan la atención profesional cuando una situación requiere evaluación específica o protección inmediata.</p></section>
    <section class="settings-section version-section"><h2>Versión</h2><p><strong>Puentes v${APP_VERSION.replace(/\.0$/,'')}</strong> · reproductor continuo y compartir imagen sin texto automático.</p></section>
    <button class="button secondary full" data-clear>Eliminar historial local</button>`;
  $('[data-save-profile]',el).addEventListener('click',()=>{app.profile={name:$('#profileName',el).value.trim(),institution:$('#profileInstitution',el).value.trim(),signature:$('#profileSignature',el).value.trim()||'Puentes · Escuela y familia'};app.shareCache.clear();saveState();toast('Firma guardada');});
  $('[data-clear]',el).addEventListener('click',()=>{if(confirm('¿Eliminar favoritas, historial, tarjetas creadas con IA y firma local?')){Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));location.reload();}});
}

function reconcileFavoritePlaybackQueue(removedId){
  if(app.audio.queueOrigin!=='favorites'||!app.audio.queue.includes(removedId)) return;
  const wasPlaying=app.audio.isPlaying;
  const wasPaused=app.audio.isPaused;
  const previousIndex=app.audio.queueIndex;
  const currentId=app.audio.queue[previousIndex];
  cancelCurrentUtterance({resetFragment:true});
  app.audio.queue=app.audio.queue.filter(id=>id!==removedId&&app.favorites.has(id));
  if(!app.audio.queue.length){
    app.audio.queueIndex=0;
    app.audio.isPlaying=false;
    app.audio.isPaused=false;
    syncResultsWithQueue();
    return;
  }
  const preserved=app.audio.queue.indexOf(currentId);
  app.audio.queueIndex=preserved>=0?preserved:Math.min(previousIndex,app.audio.queue.length-1);
  app.audio.isPlaying=wasPlaying;
  app.audio.isPaused=wasPaused&&!wasPlaying;
  syncResultsWithQueue();
  if(wasPlaying) setTimeout(()=>{if(app.audio.isPlaying&&app.view==='results') speakCurrentFragment();},60);
}

function toggleFavorite(id){
  const removing=app.favorites.has(id);
  removing?app.favorites.delete(id):app.favorites.add(id);
  if(removing) reconcileFavoritePlaybackQueue(id);
  saveState();
  toast(app.favorites.has(id)?'Guardada en favoritas':'Eliminada de favoritas');
  renderAll();
}

function rememberViewed(id){
  app.viewed=[id,...app.viewed.filter(x=>x!==id)].slice(0,120);app.lastCardId=id;localStorage.setItem(STORAGE.last,id);saveState();
}

function markShared(card,method='native'){
  const prev=app.shared[card.id]||{count:0};
  app.shared[card.id]={count:prev.count+1,lastAt:new Date().toISOString(),method};
  app.lastCardId=card.id;localStorage.setItem(STORAGE.last,card.id);saveState();toast('Tarjeta registrada como compartida');renderAll();
}

function shareCacheKey(card){
  return [card.id,app.profile.name,app.profile.institution,app.profile.signature].join('|');
}

async function prepareShareAsset(card){
  const key=shareCacheKey(card);
  const cached=app.shareCache.get(key);
  if(cached) return cached;

  // Only completed assets are cached. Earlier versions cached a pending Promise;
  // if canvas.toBlob never called its callback, every later attempt waited forever.
  const blob=await makeCardBlob(card);
  const filename=`puentes-${slug(displayTitle(card.title))}.png`;
  let file=null;
  try{
    file=new File([blob],filename,{type:'image/png',lastModified:Date.now()});
  }catch(error){
    console.warn('El navegador no permitió construir un File; se usará descarga manual.',error);
  }
  const assets={card,blob,file,filename,text:shareText(card)};
  app.shareCache.set(key,assets);
  return assets;
}

function setShareButtonBusy(button,busy){
  if(!button||!button.isConnected) return;
  button.disabled=busy;
  button.setAttribute('aria-busy',String(busy));
  button.classList.toggle('is-loading',busy);
  if(button.classList.contains('player-control')){
    button.innerHTML=busy?`<span class="share-spinner compact" aria-hidden="true"></span><small>Preparando</small>`:PLAYER_SHARE_ICON;
  }else{
    button.innerHTML=busy?`<span class="share-spinner" aria-hidden="true"></span><span>Creando imagen…</span>`:`${SHARE_ICON}<span>Compartir</span>`;
  }
}

function openURLSmart(url){
  const opened=window.open(url,'_blank','noopener,noreferrer');
  if(!opened) location.href=url;
}

async function openQuickShareChannel(channel){
  const pending=app.pendingManualShare;
  if(!pending) return;
  const filename=pending.filename||pending.file?.name||'puentes-tarjeta.png';
  if(pending.blob) downloadBlob(pending.blob,filename);

  const urls={
    whatsapp:'https://web.whatsapp.com/',
    telegram:'https://web.telegram.org/',
    email:'mailto:',
    x:'https://x.com/',
    instagram:'https://www.instagram.com/',
    facebook:'https://www.facebook.com/',
    tiktok:'https://www.tiktok.com/upload'
  };
  if(urls[channel]) openURLSmart(urls[channel]);
  toast('La imagen quedó en Descargas. Adjunta la tarjeta en la plataforma elegida.');
}

function openManualShareDialog(assets,message){
  app.pendingManualShare=assets;
  $('#shareFallbackMessage').textContent=message||'La tarjeta está preparada. Elige cómo deseas continuar.';
  const hasImage=Boolean(assets?.blob);
  $('#downloadCardBtn').disabled=!hasImage;
  const nativeBtn=$('#openNativeTextShareBtn');
  const textShareAvailable=isLikelyMobileDevice()&&canNativeShareText();
  nativeBtn.disabled=!textShareAvailable;
  nativeBtn.hidden=!textShareAvailable;
  nativeBtn.querySelector('small').textContent='Comparte únicamente el mensaje, sin imagen.';
  const quickArea=$('.share-quick-area');
  if(quickArea) quickArea.hidden=isLikelyMobileDevice();
  const dialog=$('#confirmDialog');
  if(!dialog.open) dialog.showModal();
}

function canNativeShareText(){
  return typeof navigator.share==='function';
}

function isLikelyMobileDevice(){
  if(typeof navigator.userAgentData?.mobile==='boolean') return navigator.userAgentData.mobile;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
}

function canNativeShareFiles(file){
  if(typeof navigator.share!=='function' || !file) return false;
  if(typeof navigator.canShare==='function'){
    try{return navigator.canShare({files:[file]});}catch{return false;}
  }
  return false;
}

async function shareViaNative(assets,{preferFiles=true}={}){
  if(typeof navigator.share!=='function') return false;
  if(preferFiles){
    if(!canNativeShareFiles(assets.file)) return false;
    await navigator.share({files:[assets.file]});
    return true;
  }
  await navigator.share({text:assets.text});
  return true;
}

async function shareCard(card,button){
  if(app.shareInProgress){
    toast('La tarjeta ya se está preparando');
    return;
  }
  app.shareInProgress=true;
  setShareButtonBusy(button,true);
  try{
    const assets=await prepareShareAsset(card);

    if(!isLikelyMobileDevice()){
      openManualShareDialog(assets,'Elige la plataforma. Puentes descargará la imagen y abrirá el sitio sin insertar ni copiar el mensaje.');
      return;
    }

    if(!canNativeShareFiles(assets.file)){
      openManualShareDialog(assets,'Este navegador no permite compartir archivos directamente. Puedes guardar la imagen, copiar el mensaje o compartir solo texto como alternativa explícita.');
      return;
    }

    try{
      await shareViaNative(assets,{preferFiles:true});
      markShared(card,'native-file');
    }catch(error){
      if(error?.name==='AbortError') return;
      console.warn('No se completó el uso compartido nativo de la imagen',error);
      if(error?.name==='InvalidStateError'){
        openManualShareDialog(assets,'Otra ventana de compartir sigue activa. Ciérrala y vuelve a intentarlo, o guarda la imagen.');
      }else if(error?.name==='NotAllowedError'){
        openManualShareDialog(assets,'El navegador bloqueó el panel nativo. Puedes guardar la imagen o usar las alternativas explícitas.');
      }else{
        openManualShareDialog(assets,'No fue posible compartir la imagen directamente. La tarjeta quedó preparada para guardarla o compartir solo texto.');
      }
    }
  }catch(error){
    console.error('No fue posible generar la imagen de la tarjeta',error);
    const textOnly={card,blob:null,file:null,filename:null,text:shareText(card)};
    openManualShareDialog(textOnly,'El navegador no pudo crear la imagen. Solo queda disponible el mensaje de respaldo, que no se copiará automáticamente.');
    toast('No se creó la imagen; habilitamos alternativas manuales');
  }finally{
    app.shareInProgress=false;
    setShareButtonBusy(button,false);
  }
}

function shareText(card){
  const stage=getStage(card.stage_id),cat=getCategory(card.category_id);
  const sender=[app.profile.name,app.profile.institution].filter(Boolean).join(' · ');
  return `${displayTitle(card.title)}\n\n${cleanLead(card.action)}\n\nPara conversar: ${cleanQuestion(card.conversation_prompt)}\n\n${sender?`Compartida por ${sender}`:'Puentes · Escuela y familia'}\n${stage.age} años · ${cat.name}`;
}

async function makeCardBlob(card){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx) throw new Error('El navegador no pudo iniciar el generador gráfico.');
  const ui=categoryUI[card.category_id]||categoryUI.C01;
  ctx.fillStyle='#fffdfa';ctx.fillRect(0,0,1080,1350);ctx.fillStyle=ui.color;ctx.fillRect(0,0,1080,18);

  // Marca Puentes.
  ctx.strokeStyle='#1f6b68';ctx.lineWidth=7;ctx.lineCap='round';
  ctx.beginPath();ctx.arc(95,92,46,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.arc(95,92,29,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.arc(95,92,13,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#1f6b68';ctx.font='700 30px Arial';ctx.fillText('PUENTES',165,82);ctx.fillStyle='#66807d';ctx.font='600 20px Arial';ctx.fillText('ESCUELA Y FAMILIA',165,112);
  ctx.textAlign='right';ctx.fillStyle=ui.color;ctx.font='700 23px Arial';ctx.fillText(getCategory(card.category_id).name.toUpperCase(),1010,90);ctx.textAlign='left';

  let y=188;
  ctx.fillStyle='#173c3b';ctx.font='700 58px Arial';y=drawWrapped(ctx,displayTitle(card.title),70,y,940,68,3)+18;
  ctx.fillStyle='#385250';ctx.font='400 34px Arial';y=drawWrapped(ctx,card.message,70,y,940,49,6)+28;

  const action=cleanLead(card.action);const actionLines=wrapLines(ctx,action,860,'600 31px Arial');const actionH=95+actionLines.length*43;
  roundRect(ctx,70,y,940,actionH,28);ctx.fillStyle=ui.soft;ctx.fill();
  ctx.fillStyle=ui.color;ctx.font='700 20px Arial';ctx.fillText('PARA PROBAR EN FAMILIA',110,y+42);
  ctx.fillStyle='#234644';ctx.font='600 31px Arial';drawLines(ctx,actionLines,110,y+86,43);y+=actionH+22;

  const question=cleanQuestion(card.conversation_prompt);const qLines=wrapLines(ctx,question,860,'600 29px Arial');const qH=92+qLines.length*41;
  roundRect(ctx,70,y,940,qH,28);ctx.fillStyle='#fff0dc';ctx.fill();
  ctx.fillStyle='#9b682d';ctx.font='700 20px Arial';ctx.fillText('UNA PREGUNTA PARA CONVERSAR',110,y+40);
  ctx.fillStyle='#4f422f';ctx.font='600 29px Arial';drawLines(ctx,qLines,110,y+82,41);y+=qH+24;

  ctx.strokeStyle='#dce6e2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(70,y);ctx.lineTo(1010,y);ctx.stroke();y+=32;
  ctx.fillStyle='#465f5d';ctx.font='600 27px Arial';
  const closingBottom=drawWrapped(ctx,card.closing,70,y,940,39,3);

  // El espacio inferior se convierte en una escena contextual. Si el texto ocupa
  // más altura, la escena se comprime o se reduce a una marca de agua discreta.
  const footerY=1290;
  const sceneTop=Math.max(closingBottom+18,960);
  const chipY=1208;
  const sceneBottom=1264;
  const available=Math.max(0,sceneBottom-sceneTop);
  if(available>=88){
    await drawApprovedCardScene(ctx,card,60,sceneTop,960,available,ui);
  }else{
    drawMinimalCategoryMark(ctx,card,745,1125,230,115,ui);
  }

  if(available>=112){
    ctx.fillStyle='#66807d';ctx.font='italic 500 20px Arial';ctx.fillText('Idea para acompañar en casa ♡',78,chipY-15);
    drawKeywordChips(ctx,getCardKeywords(card),78,chipY,924,ui);
  }

  ctx.fillStyle='#6e817e';ctx.font='500 21px Arial';ctx.fillText(`${getStage(card.stage_id).age} años · ${getStage(card.stage_id).grades}`,70,footerY);
  ctx.textAlign='right';ctx.fillStyle='#1f6b68';ctx.font='700 21px Arial';ctx.fillText(app.profile.signature||'Puentes · Escuela y familia',1010,footerY);ctx.textAlign='left';
  return canvasToBlobReliable(canvas);
}

const CARD_KEYWORDS={
  C01:['Calma','Apoyo','Presencia'],C02:['Curiosidad','Práctica','Esfuerzo'],
  C03:['Diálogo','Respeto','Reparación'],C04:['Nombrar','Respirar','Regular'],
  C05:['Fortalezas','Esfuerzo','Reconocer'],C06:['Criterio','Cuidado','Responsabilidad'],
  C07:['Equilibrio','Privacidad','Acuerdos'],C08:['Escucha','Claridad','Confianza'],
  C09:['Elegir','Asumir','Aprender'],C10:['Orden','Constancia','Anticipar'],
  C11:['Pausa','Descanso','Bienestar'],C12:['Respeto','Participación','Diversidad']
};

const SITUATIONAL_KEYWORDS=[
  ['calma','Calma'],['pausa','Pausa'],['apoyo','Apoyo'],['relevo','Relevo'],['rutina','Rutina visible'],
  ['escucha','Escucha'],['dialog','Diálogo'],['acuerdo','Acuerdos'],['respeto','Respeto'],['repar','Reparación'],
  ['confian','Confianza'],['autonom','Autonomía'],['responsab','Responsabilidad'],['esfuerzo','Esfuerzo'],
  ['fortaleza','Fortalezas'],['reconoc','Reconocer'],['privacidad','Privacidad'],['pantalla','Equilibrio digital'],
  ['organ','Organización'],['descanso','Descanso'],['sueño','Buen descanso'],['emocion','Emociones'],
  ['respir','Respirar'],['inclus','Inclusión'],['divers','Diversidad'],['decid','Decisiones'],
  ['habito','Hábitos'],['juego','Juego'],['tiempo','Tiempo compartido'],['limite','Límites con cuidado']
];

function getCardKeywords(card){
  const haystack=normalize([card.title,card.message,card.action,card.conversation_prompt,card.closing,...(card.tags||[])].join(' '));
  const selected=[];
  for(const [needle,label] of SITUATIONAL_KEYWORDS){
    if(haystack.includes(needle)&&!selected.includes(label)) selected.push(label);
    if(selected.length===3) break;
  }
  for(const label of CARD_KEYWORDS[card.category_id]||CARD_KEYWORDS.C01){
    if(!selected.includes(label)) selected.push(label);
    if(selected.length===3) break;
  }
  return selected.slice(0,3);
}

function drawKeywordChips(ctx,labels,x,y,maxWidth,ui){
  if(!labels?.length) return;
  ctx.save();
  ctx.font='700 20px Arial';
  const gap=18,pad=24,iconSpace=30;
  let widths=labels.map(label=>Math.ceil(ctx.measureText(label).width)+pad*2+iconSpace);
  let total=widths.reduce((a,b)=>a+b,0)+gap*(labels.length-1);
  const scale=Math.min(1,maxWidth/total);
  widths=widths.map(w=>w*scale);total=widths.reduce((a,b)=>a+b,0)+gap*(labels.length-1);
  let cx=x+(maxWidth-total)/2;
  labels.forEach((label,index)=>{
    const w=widths[index],h=52;
    ctx.globalAlpha=.9;
    roundRect(ctx,cx,y,w,h,26);ctx.fillStyle=index===0?'#e6f0ed':index===1?ui.soft:'#fff0dc';ctx.fill();
    ctx.globalAlpha=1;ctx.strokeStyle=index===0?'#6ea49d':ui.color;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx+24,y+h/2,9,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#1f5f5b';ctx.font=`700 ${Math.round(20*scale)}px Arial`;ctx.fillText(label,cx+42,y+34);
    cx+=w+gap;
  });
  ctx.restore();
}

function preloadApprovedScenes(){
  Object.values(APPROVED_SCENE_BY_CATEGORY).forEach(sceneId=>{
    getApprovedSceneImage(sceneId).catch(()=>{});
  });
}

function getApprovedSceneImage(sceneId){
  const cached=app.sceneImages.get(sceneId);
  if(cached) return cached;
  const promise=new Promise((resolve,reject)=>{
    const image=new Image();
    image.decoding='async';
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(new Error(`No se pudo cargar la ilustración ${sceneId}.`));
    image.src=APPROVED_SCENE_PATH(sceneId);
  }).catch(error=>{
    app.sceneImages.delete(sceneId);
    throw error;
  });
  app.sceneImages.set(sceneId,promise);
  return promise;
}

async function drawApprovedCardScene(ctx,card,x,y,w,h,ui){
  const sceneId=APPROVED_SCENE_BY_CATEGORY[card.category_id]||'01';
  try{
    const image=await getApprovedSceneImage(sceneId);
    const stageIndex=Math.max(0,Math.min(4,Number(String(card.stage_id).replace(/\D/g,''))-1));
    const compact=h<145;
    ctx.save();
    ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();

    // Fondo atmosférico: la misma ilustración aprobada ocupa el ancho completo
    // con baja opacidad, de modo que no reaparece el vacío inferior.
    const coverScale=Math.max(w/image.width,h/image.height);
    const coverW=image.width*coverScale,coverH=image.height*coverScale;
    ctx.globalAlpha=compact?.10:.16;
    ctx.drawImage(image,x+(w-coverW)/2,y+h-coverH,coverW,coverH);

    // Ilustración principal completa, sin recortes agresivos. Se ubica hacia la
    // derecha y varía levemente según la etapa para evitar sensación repetitiva.
    const targetH=Math.min(h*(compact?.88:.96),250);
    const mainScale=targetH/image.height;
    const mainW=image.width*mainScale,mainH=image.height*mainScale;
    const offsets=[0,.025,-.015,.035,.01];
    const rightPad=18+w*(offsets[stageIndex]||0);
    const mainX=x+w-mainW-rightPad;
    const mainY=y+h-mainH+4;
    ctx.globalAlpha=compact?.48:.82;
    ctx.drawImage(image,mainX,mainY,mainW,mainH);

    // Lavado superior para integrar la escena con el texto de cierre.
    ctx.globalAlpha=1;
    const wash=ctx.createLinearGradient(0,y,0,y+Math.min(h,105));
    wash.addColorStop(0,'rgba(255,253,250,.98)');
    wash.addColorStop(.55,'rgba(255,253,250,.48)');
    wash.addColorStop(1,'rgba(255,253,250,0)');
    ctx.fillStyle=wash;ctx.fillRect(x,y,w,Math.min(h,105));
    ctx.restore();
  }catch(error){
    console.warn('Se usó la ilustración vectorial de respaldo.',error);
    drawCardScene(ctx,card,x,y,w,h,ui);
  }
}

function drawCardScene(ctx,card,x,y,w,h,ui){
  ctx.save();
  ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const stageIndex=Math.max(0,Math.min(4,Number(String(card.stage_id).replace(/\D/g,''))-1));
  drawSoftLandscape(ctx,x,y,w,h,ui,stageIndex);
  const drawers={C01:drawCareScene,C02:drawLearningScene,C03:drawCoexistenceScene,C04:drawEmotionScene,C05:drawRecognitionScene,C06:drawEthicsScene,C07:drawDigitalScene,C08:drawCommunicationScene,C09:drawAutonomyScene,C10:drawRoutineScene,C11:drawWellbeingScene,C12:drawInclusionScene};
  (drawers[card.category_id]||drawCareScene)(ctx,x,y,w,h,ui,stageIndex);
  ctx.restore();
}

function drawSoftLandscape(ctx,x,y,w,h,ui,variant){
  ctx.save();ctx.globalAlpha=.14;
  ctx.fillStyle=ui.soft;ctx.beginPath();ctx.moveTo(x,y+h*.58);ctx.bezierCurveTo(x+w*.2,y+h*.25,x+w*.35,y+h*.95,x+w*.58,y+h*.55);ctx.bezierCurveTo(x+w*.78,y+h*.25,x+w*.9,y+h*.72,x+w,y+h*.42);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();
  ctx.globalAlpha=.1;ctx.fillStyle=ui.color;ctx.beginPath();ctx.moveTo(x,y+h*.78);ctx.bezierCurveTo(x+w*.28,y+h*.54,x+w*.42,y+h*.98,x+w*.7,y+h*.72);ctx.bezierCurveTo(x+w*.88,y+h*.55,x+w*.94,y+h*.88,x+w,y+h*.67);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();
  if(variant%2===0){drawPlant(ctx,x+w*.08,y+h*.78,Math.min(48,h*.24),ui.color,.18);}
  ctx.restore();
}

function drawCareScene(ctx,x,y,w,h,ui,stage){
  drawBridge(ctx,x+w*.02,y+h*.76,w*.48,h*.3,ui.color,.17);
  drawRainbow(ctx,x+w*.72,y+h*.58,Math.min(w*.22,h*.65),ui.color,.12);
  const adultScale=Math.min(1.08,Math.max(.78,h/210)),younger=stage<3;
  drawPerson(ctx,x+w*.62,y+h*.78,88*adultScale,ui.color,.2,'adult');
  drawPerson(ctx,x+w*.53,y+h*.82,(younger?56:72)*adultScale,stage===4?'#7f91b8':ui.color,.17,younger?'child':'teen');
  ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle=ui.color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+w*.57,y+h*.62);ctx.lineTo(x+w*.61,y+h*.62);ctx.stroke();ctx.restore();
  drawHeart(ctx,x+w*.84,y+h*.2,24,ui.color,.22);
}

function drawLearningScene(ctx,x,y,w,h,ui,stage){
  drawOpenBook(ctx,x+w*.2,y+h*.73,w*.3,Math.min(90,h*.45),ui.color,.22);
  drawPencil(ctx,x+w*.52,y+h*.65,90,ui.color,.2);
  drawPlant(ctx,x+w*.66,y+h*.73,Math.min(70,h*.38),ui.color,.2);
  drawPaperPlane(ctx,x+w*.78,y+h*.2,55,ui.color,.25);
  if(stage>=3) drawStar(ctx,x+w*.9,y+h*.38,18,ui.color,.2);
}

function drawCoexistenceScene(ctx,x,y,w,h,ui,stage){
  drawBridge(ctx,x+w*.08,y+h*.78,w*.48,h*.32,ui.color,.2);
  const count=stage<2?3:4;
  for(let i=0;i<count;i++) drawPerson(ctx,x+w*(.55+i*.085),y+h*.8,stage<2?42:47,ui.color,.18,i%2?'child':'teen');
  drawSpeechBubble(ctx,x+w*.72,y+h*.2,150,62,ui.color,.18);
  drawHeart(ctx,x+w*.91,y+h*.28,18,ui.color,.18);
}

function drawEmotionScene(ctx,x,y,w,h,ui,stage){
  drawHeadProfile(ctx,x+w*.68,y+h*.64,Math.min(125,h*.62),ui.color,.18);
  drawHeart(ctx,x+w*.68,y+h*.4,28,ui.color,.24);
  drawCloud(ctx,x+w*.83,y+h*.2,70,ui.color,.12);
  drawLeafSprig(ctx,x+w*.87,y+h*.7,65,ui.color,.17);
  drawWaveLine(ctx,x+w*.08,y+h*.62,w*.42,ui.color,.14);
}

function drawRecognitionScene(ctx,x,y,w,h,ui,stage){
  drawPerson(ctx,x+w*.63,y+h*.8,stage<2?55:68,ui.color,.18,stage<2?'child':'teen');
  drawStar(ctx,x+w*.62,y+h*.22,34,ui.color,.25);
  drawStar(ctx,x+w*.76,y+h*.34,18,ui.color,.18);
  drawMedal(ctx,x+w*.84,y+h*.62,58,ui.color,.2);
  drawSpotlight(ctx,x+w*.48,y+h*.05,w*.32,h*.76,ui.color,.07);
}

function drawEthicsScene(ctx,x,y,w,h,ui,stage){
  drawScales(ctx,x+w*.7,y+h*.62,135,ui.color,.2);
  drawCompass(ctx,x+w*.43,y+h*.6,85,ui.color,.18);
  drawSteppingStones(ctx,x+w*.05,y+h*.8,w*.35,ui.color,.15);
  drawHeart(ctx,x+w*.86,y+h*.18,20,ui.color,.18);
}

function drawDigitalScene(ctx,x,y,w,h,ui,stage){
  drawLaptop(ctx,x+w*.58,y+h*.72,150,92,ui.color,.2);
  drawPhone(ctx,x+w*.43,y+h*.65,62,105,ui.color,.2);
  drawWifi(ctx,x+w*.57,y+h*.22,65,ui.color,.21);
  drawShield(ctx,x+w*.79,y+h*.5,62,ui.color,.18);
  drawWaveLine(ctx,x+w*.03,y+h*.78,w*.3,ui.color,.12);
}

function drawCommunicationScene(ctx,x,y,w,h,ui,stage){
  drawSpeechBubble(ctx,x+w*.5,y+h*.34,170,72,ui.color,.19);
  drawSpeechBubble(ctx,x+w*.7,y+h*.58,150,62,'#b45f6b',.14);
  drawHeart(ctx,x+w*.67,y+h*.27,24,ui.color,.22);
  drawPerson(ctx,x+w*.29,y+h*.82,55,ui.color,.16,stage<2?'child':'teen');
  drawPerson(ctx,x+w*.39,y+h*.82,64,ui.color,.18,'adult');
}

function drawAutonomyScene(ctx,x,y,w,h,ui,stage){
  drawMountain(ctx,x+w*.48,y+h*.82,w*.42,h*.68,ui.color,.13);
  drawPath(ctx,x+w*.51,y+h*.83,x+w*.71,y+h*.26,ui.color,.22);
  drawSignpost(ctx,x+w*.35,y+h*.69,85,ui.color,.2);
  drawFlag(ctx,x+w*.72,y+h*.24,50,ui.color,.23);
  drawPerson(ctx,x+w*.51,y+h*.82,stage<2?42:54,ui.color,.18,stage<2?'child':'teen');
}

function drawRoutineScene(ctx,x,y,w,h,ui,stage){
  drawCalendar(ctx,x+w*.58,y+h*.57,135,105,ui.color,.2);
  drawClock(ctx,x+w*.42,y+h*.67,72,ui.color,.18);
  drawChecklist(ctx,x+w*.76,y+h*.68,92,110,ui.color,.16);
  drawPlant(ctx,x+w*.87,y+h*.78,45,ui.color,.17);
}

function drawWellbeingScene(ctx,x,y,w,h,ui,stage){
  drawMeditatingPerson(ctx,x+w*.61,y+h*.74,92,ui.color,.18);
  drawSun(ctx,x+w*.82,y+h*.25,42,ui.color,.18);
  drawLeafSprig(ctx,x+w*.38,y+h*.74,68,ui.color,.17);
  drawWaveLine(ctx,x+w*.02,y+h*.8,w*.34,ui.color,.13);
  drawHeart(ctx,x+w*.61,y+h*.36,18,ui.color,.2);
}

function drawInclusionScene(ctx,x,y,w,h,ui,stage){
  const colors=['#4d93ad','#d88461','#6e9971','#7e70aa'];
  drawWheelchairPerson(ctx,x+w*.45,y+h*.82,48,colors[0],.21);
  drawPerson(ctx,x+w*.56,y+h*.82,55,colors[1],.2,'teen');
  drawPerson(ctx,x+w*.66,y+h*.82,62,colors[2],.18,'adult');
  drawPerson(ctx,x+w*.77,y+h*.82,54,colors[3],.2,'teen');
  drawHeart(ctx,x+w*.69,y+h*.2,20,ui.color,.18);
  drawLeafSprig(ctx,x+w*.88,y+h*.76,55,ui.color,.15);
}

function drawMinimalCategoryMark(ctx,card,x,y,w,h,ui){
  ctx.save();ctx.globalAlpha=.08;ctx.strokeStyle=ui.color;ctx.lineWidth=8;
  drawRainbow(ctx,x+w*.55,y+h*.65,Math.min(w*.42,h*.9),ui.color,.13);
  ctx.fillStyle=ui.color;ctx.font='700 70px Arial';ctx.textAlign='center';ctx.fillText(categoryUI[card.category_id]?.icon||'♡',x+w*.5,y+h*.72);ctx.textAlign='left';ctx.restore();
}

function drawPerson(ctx,x,ground,size,color,alpha=.2,kind='adult'){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(3,size*.07);ctx.lineCap='round';ctx.lineJoin='round';
  const head=size*.19,body=size*(kind==='child'?.48:.58),top=ground-body-head*2;
  ctx.beginPath();ctx.arc(x,top+head,head,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,top+head*2.15);ctx.lineTo(x,ground-size*.2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,top+head*2.7);ctx.lineTo(x-size*.24,ground-size*.46);ctx.moveTo(x,top+head*2.7);ctx.lineTo(x+size*.24,ground-size*.46);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,ground-size*.2);ctx.lineTo(x-size*.19,ground);ctx.moveTo(x,ground-size*.2);ctx.lineTo(x+size*.19,ground);ctx.stroke();
  if(kind==='adult'){ctx.beginPath();ctx.arc(x+head*.45,top+head*.55,head*.8,Math.PI*.2,Math.PI*1.2);ctx.stroke();}
  ctx.restore();
}

function drawWheelchairPerson(ctx,x,ground,size,color,alpha){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.arc(x,ground-size*.72,size*.14,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(x,ground-size*.57);ctx.lineTo(x+size*.05,ground-size*.34);ctx.lineTo(x+size*.25,ground-size*.34);ctx.stroke();
  ctx.beginPath();ctx.arc(x+size*.1,ground-size*.18,size*.25,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+size*.05,ground-size*.34);ctx.lineTo(x-size*.18,ground-size*.18);ctx.stroke();ctx.restore();
}

function drawBridge(ctx,x,ground,w,h,color,alpha){
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(7,h*.12);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,ground-h*.42);ctx.quadraticCurveTo(x+w*.5,ground-h*.92,x+w,ground-h*.42);ctx.stroke();
  ctx.fillRect(x,ground-h*.42,w,Math.max(8,h*.1));
  const arches=4,segment=w/arches;
  ctx.lineWidth=Math.max(5,h*.08);
  for(let i=0;i<arches;i++){
    const cx=x+segment*(i+.5),r=segment*.36;
    ctx.beginPath();ctx.arc(cx,ground,r,Math.PI,0);ctx.stroke();
  }
  ctx.restore();
}

function drawRainbow(ctx,cx,cy,r,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=Math.max(5,r*.11);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(cx,cy,r-i*r*.23,Math.PI,0);ctx.stroke();}ctx.restore();}
function drawHeart(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(cx,cy+size*.8);ctx.bezierCurveTo(cx-size*1.2,cy,cx-size*.55,cy-size*.8,cx,cy-size*.15);ctx.bezierCurveTo(cx+size*.55,cy-size*.8,cx+size*1.2,cy,cx,cy+size*.8);ctx.fill();ctx.restore();}
function drawPlant(ctx,x,ground,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,ground);ctx.quadraticCurveTo(x+5,ground-h*.5,x,ground-h);ctx.stroke();for(const [dx,dy,s] of [[-16,.65,13],[16,.48,14],[-11,.3,11]]){ctx.beginPath();ctx.ellipse(x+dx,ground-h*dy,s,s*.55,dx<0?-.6:.6,0,Math.PI*2);ctx.fill();}ctx.restore();}
function drawLeafSprig(ctx,x,ground,h,color,alpha){drawPlant(ctx,x,ground,h,color,alpha);drawPlant(ctx,x+20,ground,h*.72,color,alpha*.8);}
function drawOpenBook(ctx,x,ground,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,ground);ctx.quadraticCurveTo(x+w*.23,ground-h*.55,x+w*.48,ground-h*.12);ctx.lineTo(x+w*.48,ground-h*.65);ctx.quadraticCurveTo(x+w*.23,ground-h,x,ground-h*.55);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(x+w*.5,ground-h*.12);ctx.quadraticCurveTo(x+w*.75,ground-h*.55,x+w,ground);ctx.lineTo(x+w,ground-h*.55);ctx.quadraticCurveTo(x+w*.75,ground-h,x+w*.5,ground-h*.65);ctx.closePath();ctx.stroke();ctx.restore();}
function drawPencil(ctx,x,y,len,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len*.75,y-len*.42);ctx.stroke();ctx.beginPath();ctx.moveTo(x+len*.75,y-len*.42);ctx.lineTo(x+len*.9,y-len*.52);ctx.lineTo(x+len*.82,y-len*.35);ctx.closePath();ctx.fill();ctx.restore();}
function drawPaperPlane(ctx,x,y,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+size,y-size*.25);ctx.lineTo(x+size*.58,y+size*.25);ctx.lineTo(x+size*.4,y-size*.08);ctx.closePath();ctx.stroke();ctx.restore();}
function drawSpeechBubble(ctx,x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;roundRect(ctx,x,y,w,h,22);ctx.stroke();ctx.beginPath();ctx.moveTo(x+w*.25,y+h);ctx.lineTo(x+w*.18,y+h+18);ctx.lineTo(x+w*.4,y+h);ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x+w*.34+i*w*.15,y+h*.5,4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}ctx.restore();}
function drawHeadProfile(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,cy,size*.48,Math.PI*.55,Math.PI*1.75);ctx.quadraticCurveTo(cx+size*.54,cy-size*.12,cx+size*.32,cy+size*.12);ctx.lineTo(cx+size*.26,cy+size*.38);ctx.stroke();ctx.restore();}
function drawCloud(ctx,x,y,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,size*.24,Math.PI,0);ctx.arc(x+size*.25,y-size*.12,size*.3,Math.PI,0);ctx.arc(x+size*.55,y,size*.25,Math.PI,0);ctx.lineTo(x+size*.8,y+size*.25);ctx.lineTo(x,y+size*.25);ctx.closePath();ctx.fill();ctx.restore();}
function drawWaveLine(ctx,x,y,w,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+w*.25,y-30,x+w*.5,y+30,x+w*.75,y);ctx.bezierCurveTo(x+w*.85,y-16,x+w*.93,y+10,x+w,y);ctx.stroke();ctx.restore();}
function drawStar(ctx,cx,cy,r,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.restore();}
function drawMedal(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,size*.32,0,Math.PI*2);ctx.stroke();drawStar(ctx,cx,cy,size*.2,color,alpha*1.1);ctx.beginPath();ctx.moveTo(cx-size*.2,cy-size*.28);ctx.lineTo(cx-size*.36,cy-size*.75);ctx.lineTo(cx,cy-size*.52);ctx.lineTo(cx+size*.36,cy-size*.75);ctx.lineTo(cx+size*.2,cy-size*.28);ctx.stroke();ctx.restore();}
function drawSpotlight(ctx,x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w*.8,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x-w*.1,y+h);ctx.closePath();ctx.fill();ctx.restore();}
function drawScales(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,cy-size*.55);ctx.lineTo(cx,cy+size*.35);ctx.moveTo(cx-size*.38,cy-size*.25);ctx.lineTo(cx+size*.38,cy-size*.25);ctx.stroke();for(const side of [-1,1]){const sx=cx+side*size*.32;ctx.beginPath();ctx.moveTo(sx,cy-size*.25);ctx.lineTo(sx-side*size*.12,cy+size*.02);ctx.lineTo(sx+side*size*.12,cy+size*.02);ctx.closePath();ctx.stroke();}ctx.beginPath();ctx.moveTo(cx-size*.25,cy+size*.38);ctx.lineTo(cx+size*.25,cy+size*.38);ctx.stroke();ctx.restore();}
function drawCompass(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,size*.45,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-size*.08,cy+size*.2);ctx.lineTo(cx+size*.12,cy-size*.24);ctx.lineTo(cx+size*.02,cy+size*.08);ctx.closePath();ctx.stroke();ctx.restore();}
function drawSteppingStones(ctx,x,y,w,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x+i*w*.18,y-i*10,30+i*2,11,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
function drawLaptop(ctx,x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;roundRect(ctx,x,y-h,w,h,10);ctx.stroke();ctx.beginPath();ctx.moveTo(x-12,y+8);ctx.lineTo(x+w+12,y+8);ctx.stroke();ctx.restore();}
function drawPhone(ctx,x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;roundRect(ctx,x,y-h,w,h,12);ctx.stroke();ctx.beginPath();ctx.arc(x+w*.5,y-10,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore();}
function drawWifi(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(cx,cy,size-i*size*.27,Math.PI*1.12,Math.PI*1.88);ctx.stroke();}ctx.beginPath();ctx.arc(cx,cy+size*.08,5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore();}
function drawShield(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,cy-size*.55);ctx.lineTo(cx+size*.4,cy-size*.35);ctx.lineTo(cx+size*.3,cy+size*.3);ctx.quadraticCurveTo(cx,cy+size*.6,cx-size*.3,cy+size*.3);ctx.lineTo(cx-size*.4,cy-size*.35);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(cx-size*.15,cy);ctx.lineTo(cx-size*.03,cy+size*.15);ctx.lineTo(cx+size*.2,cy-size*.14);ctx.stroke();ctx.restore();}
function drawMountain(ctx,x,ground,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+w*.5,ground-h);ctx.lineTo(x+w,ground);ctx.closePath();ctx.fill();ctx.restore();}
function drawPath(ctx,x1,y1,x2,y2,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=5;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(x1+80,y1-60,x2-60,y2+80,x2,y2);ctx.stroke();ctx.restore();}
function drawSignpost(ctx,x,ground,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x,ground-size);ctx.stroke();ctx.beginPath();ctx.moveTo(x,ground-size*.78);ctx.lineTo(x+size*.45,ground-size*.78);ctx.lineTo(x+size*.58,ground-size*.65);ctx.lineTo(x,ground-size*.65);ctx.stroke();ctx.beginPath();ctx.moveTo(x,ground-size*.48);ctx.lineTo(x-size*.42,ground-size*.48);ctx.lineTo(x-size*.55,ground-size*.36);ctx.lineTo(x,ground-size*.36);ctx.stroke();ctx.restore();}
function drawFlag(ctx,x,y,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+size);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+size*.65,y+size*.15);ctx.lineTo(x,y+size*.3);ctx.closePath();ctx.fill();ctx.restore();}
function drawCalendar(ctx,x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;roundRect(ctx,x,y-h,w,h,14);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-h*.72);ctx.lineTo(x+w,y-h*.72);ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+w*.22+i*w*.25,y-h*.92);ctx.lineTo(x+w*.22+i*w*.25,y-h*.78);ctx.stroke();}ctx.beginPath();ctx.moveTo(x+w*.25,y-h*.42);ctx.lineTo(x+w*.42,y-h*.25);ctx.lineTo(x+w*.72,y-h*.55);ctx.stroke();ctx.restore();}
function drawClock(ctx,cx,cy,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,size*.5,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,cy-size*.28);ctx.moveTo(cx,cy);ctx.lineTo(cx+size*.23,cy+size*.08);ctx.stroke();ctx.restore();}
function drawChecklist(ctx,x,y,w,h,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=3;roundRect(ctx,x,y-h,w,h,10);ctx.stroke();for(let i=0;i<3;i++){const yy=y-h*.7+i*h*.24;ctx.beginPath();ctx.moveTo(x+w*.15,yy);ctx.lineTo(x+w*.23,yy+h*.07);ctx.lineTo(x+w*.34,yy-h*.05);ctx.moveTo(x+w*.42,yy);ctx.lineTo(x+w*.82,yy);ctx.stroke();}ctx.restore();}
function drawMeditatingPerson(ctx,cx,ground,size,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,ground-size*.78,size*.14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(cx,ground-size*.62);ctx.lineTo(cx,ground-size*.28);ctx.moveTo(cx,ground-size*.48);ctx.quadraticCurveTo(cx-size*.35,ground-size*.32,cx-size*.45,ground-size*.12);ctx.moveTo(cx,ground-size*.48);ctx.quadraticCurveTo(cx+size*.35,ground-size*.32,cx+size*.45,ground-size*.12);ctx.moveTo(cx,ground-size*.28);ctx.quadraticCurveTo(cx-size*.24,ground-size*.06,cx-size*.5,ground);ctx.moveTo(cx,ground-size*.28);ctx.quadraticCurveTo(cx+size*.24,ground-size*.06,cx+size*.5,ground);ctx.stroke();ctx.restore();}
function drawSun(ctx,cx,cy,r,color,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,r*.45,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r*.65,cy+Math.sin(a)*r*.65);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.stroke();}ctx.restore();}

function canvasToBlobReliable(canvas){
  return new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(blob,error)=>{
      if(settled) return;
      settled=true;
      clearTimeout(timer);
      blob?resolve(blob):reject(error||new Error('No se pudo convertir la tarjeta en imagen.'));
    };
    const fallback=()=>{
      try{
        const dataURL=canvas.toDataURL('image/png');
        finish(dataURLToBlob(dataURL));
      }catch(error){finish(null,error);}
    };
    // Some Chromium/Android combinations have failed to invoke the toBlob callback.
    // The timeout guarantees that “Preparando…” cannot remain indefinitely.
    const timer=setTimeout(fallback,2500);
    try{
      if(typeof canvas.toBlob!=='function'){
        fallback();
        return;
      }
      canvas.toBlob(blob=>{
        if(blob) finish(blob);
        else fallback();
      },'image/png');
    }catch(error){fallback();}
  });
}

function dataURLToBlob(dataURL){
  const parts=String(dataURL).split(',');
  if(parts.length<2) throw new Error('La imagen generada no es válida.');
  const mime=(parts[0].match(/data:([^;]+)/)||[])[1]||'image/png';
  const binary=atob(parts[1]);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return new Blob([bytes],{type:mime});
}

function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){const lines=wrapLines(ctx,text,maxWidth,ctx.font).slice(0,maxLines);drawLines(ctx,lines,x,y,lineHeight);return y+lines.length*lineHeight;}
function wrapLines(ctx,text,maxWidth,font){ctx.font=font;const words=String(text).split(/\s+/);const lines=[];let line='';for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
function drawLines(ctx,lines,x,y,lineHeight){lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true;}
  catch{
    try{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return Boolean(ok);}catch{return false;}
  }
}
async function readClipboardText(){
  try{return await navigator.clipboard.readText();}catch{return '';}
}

function displayTitle(title){return String(title).replace(/\s+(desde el juego|para empezar a practicar|con participación real|con escucha y acuerdos|para decidir con criterio)$/i,'').trim();}
function cleanLead(text){return String(text).replace(/^(Muéstrenlo con una acción sencilla:|Conviértanlo en un juego breve:|Prueben durante unos minutos:|Esta semana pueden practicar:|Prueben esta semana:|Hagan juntos una práctica corta:|Elijan un momento cotidiano para:|Durante cinco minutos pueden:|Ensayen durante la semana:|Construyan juntos una pequeña estrategia:|Acuerden una acción verificable:|Reservar diez minutos puede servir para:|Propongan un acuerdo conversado:|Busquen un momento sin pantallas para:|Inviten a su adolescente a decidir cómo:|Durante esta semana, prueben:|Construyan una decisión compartida:|Acuerden una prueba durante una semana:|Inviten a proponer criterios para:|Conserven la orientación adulta y permitan que:)\s*/i,'');}
function cleanQuestion(text){return String(text).replace(/^(Pueden preguntarle:|En un momento tranquilo, pregunten:|Mientras juegan, conversen:|Antes de dormir, pregunten:|Pregunten con curiosidad:|Invítenle a completar la frase:|Conversen a partir de esta pregunta:|Al final del día, pregunten:|Pregunten sin evaluar:|Inviten a pensar:|Conversen con esta pregunta:|Antes de ofrecer una solución, pregunten:|Pregunten y escuchen antes de responder:|Pueden abrir la conversación con:|Inviten a explicar su perspectiva:|En lugar de interrogar, pregunten:|Pregunten desde el respeto:|Pueden comenzar diciendo y preguntando:|Antes de aconsejar, pregunten:|Inviten a valorar opciones con esta pregunta:)\s*/i,'');}
function shortReference(apa){const s=String(apa);return s.length>150?s.slice(0,147)+'…':s;}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function sanitize(s){return String(s).replace(/[<>]/g,'').trim();}
function slug(s){return normalize(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);}
function sample(array,n){const copy=[...array];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy.slice(0,n);}
function getStage(id){return app.data.stages.find(s=>s.id===id)||app.data.stages[0];}
function getCategory(id){return app.data.categories.find(c=>c.id===id)||app.data.categories[0];}
function findCard(id){return app.cards.find(c=>c.id===id);}
function groupBy(array,keyFn){return array.reduce((acc,item)=>{const key=keyFn(item);(acc[key]??=[]).push(item);return acc;},{});}
function formatDay(value){const d=new Date(value),today=new Date(),yesterday=new Date(Date.now()-86400000);const key=x=>x.toDateString();if(key(d)===key(today))return'Hoy';if(key(d)===key(yesterday))return'Ayer';return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(d);}
function relativeDate(value){const days=Math.floor((Date.now()-new Date(value).getTime())/86400000);if(days<=0)return'hoy';if(days===1)return'ayer';if(days<7)return`hace ${days} días`;return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short'}).format(new Date(value));}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(app.toastTimer);app.toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function isAppInstalled(){
  return window.matchMedia?.('(display-mode: standalone)').matches===true || window.navigator.standalone===true;
}

function isIOSDevice(){
  return /iPad|iPhone|iPod/i.test(navigator.userAgent||'') || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}

function isAndroidDevice(){
  return /Android/i.test(navigator.userAgent||'');
}

function setupInstallExperience(){
  app.installed=isAppInstalled();
  setInstallButtonState({visible:!app.installed,ready:Boolean(app.installPrompt)});
  const displayMode=window.matchMedia?.('(display-mode: standalone)');
  if(displayMode?.addEventListener){
    displayMode.addEventListener('change',event=>{
      app.installed=event.matches;
      setInstallButtonState({visible:!event.matches,ready:Boolean(app.installPrompt)});
    });
  }
}

function setInstallButtonState({busy=false,visible=!app.installed,ready=Boolean(app.installPrompt),label=null}={}){
  const button=$('#installAppBtn');
  if(!button) return;
  button.hidden=!visible || app.installed;
  button.disabled=busy;
  button.classList.toggle('is-loading',busy);
  button.classList.toggle('is-ready',Boolean(ready));
  const span=button.querySelector('span');
  if(span) span.textContent=label||(busy?'Preparando…':'Instalar app');
}

function buildInstallInstructions(){
  if(isIOSDevice()){
    return `
      <div class="install-step"><span>1</span><div><strong>Abre Compartir</strong><small>Toca el icono de compartir de Safari.</small></div></div>
      <div class="install-step"><span>2</span><div><strong>Añadir a inicio</strong><small>Elige “Añadir a pantalla de inicio”.</small></div></div>
      <div class="install-step"><span>3</span><div><strong>Confirma</strong><small>Toca “Agregar” para instalar Puentes.</small></div></div>`;
  }
  if(isAndroidDevice()){
    return `
      <div class="install-step"><span>1</span><div><strong>Abre el menú</strong><small>Toca ⋮ en Chrome.</small></div></div>
      <div class="install-step"><span>2</span><div><strong>Instala</strong><small>Elige “Instalar app” o “Añadir a pantalla principal”.</small></div></div>
      <div class="install-step"><span>3</span><div><strong>Confirma</strong><small>Acepta la instalación.</small></div></div>`;
  }
  return `
    <div class="install-step"><span>1</span><div><strong>Busca el icono de instalación</strong><small>Puede aparecer al final de la barra de direcciones.</small></div></div>
    <div class="install-step"><span>2</span><div><strong>O abre el menú del navegador</strong><small>Busca “Instalar Puentes”, “Instalar app” o “Añadir al Dock”.</small></div></div>
    <div class="install-step"><span>3</span><div><strong>Confirma</strong><small>Puentes se abrirá después como una aplicación independiente.</small></div></div>`;
}

function openInstallInstructions(){
  const dialog=$('#installDialog');
  const instructions=$('#installInstructions');
  const message=$('#installDialogMessage');
  const retry=$('#retryInstallBtn');
  if(instructions) instructions.innerHTML=buildInstallInstructions();
  if(message) message.textContent='El navegador no ofreció todavía el cuadro automático. Puedes instalar Puentes con estos pasos.';
  if(retry){
    retry.hidden=!app.installPrompt;
    retry.textContent='Instalar ahora';
  }
  if(dialog && !dialog.open) dialog.showModal();
}

async function requestAppInstall(){
  if(app.installInProgress) return;
  if(isAppInstalled() || app.installed){
    app.installed=true;
    setInstallButtonState({visible:false});
    toast('Puentes ya está instalada');
    return;
  }
  if(!app.installPrompt){
    openInstallInstructions();
    return;
  }
  app.installInProgress=true;
  setInstallButtonState({busy:true,visible:true,label:'Instalando…'});
  try{
    const promptEvent=app.installPrompt;
    await promptEvent.prompt();
    const choice=await promptEvent.userChoice;
    app.installPrompt=null;
    if(choice?.outcome==='accepted'){
      app.installed=true;
      toast('Instalación aceptada');
      setInstallButtonState({visible:false});
      const dialog=$('#installDialog');
      if(dialog?.open) dialog.close();
    }else{
      toast('La instalación quedó pendiente');
      setInstallButtonState({visible:true,ready:false});
    }
  }catch(error){
    console.warn('No fue posible abrir el instalador de Puentes',error);
    openInstallInstructions();
  }finally{
    app.installInProgress=false;
    setInstallButtonState({visible:!app.installed,ready:Boolean(app.installPrompt)});
  }
}

function setUpdateButtonState({busy=false,available=app.updateAvailable,label=null}={}){
  const button=$('#updateAppBtn');
  if(!button) return;
  button.disabled=busy;
  button.classList.toggle('is-loading',busy);
  button.classList.toggle('has-update',Boolean(available));
  const span=button.querySelector('span');
  if(span) span.textContent=label||(busy?'Buscando…':available?'Actualizar ahora':'Actualizar');
  const dot=$('#updateAvailableDot');
  if(dot) dot.hidden=!available;
}

function watchServiceWorkerRegistration(registration){
  if(!registration) return;
  app.swRegistration=registration;
  const flagWaiting=()=>{
    if(registration.waiting){
      app.updateAvailable=true;
      setUpdateButtonState({available:true});
    }
  };
  flagWaiting();
  registration.addEventListener('updatefound',()=>{
    const worker=registration.installing;
    if(!worker) return;
    worker.addEventListener('statechange',()=>{
      if(worker.state==='installed' && navigator.serviceWorker.controller){
        app.updateAvailable=true;
        setUpdateButtonState({available:true});
        toast('Hay una versión nueva disponible');
      }
    });
  });
}

async function waitForWorkerState(worker,desiredStates,timeout=4500){
  if(!worker) return;
  if(desiredStates.includes(worker.state)) return;
  await new Promise(resolve=>{
    const timer=setTimeout(resolve,timeout);
    const onChange=()=>{
      if(desiredStates.includes(worker.state)){
        clearTimeout(timer);
        worker.removeEventListener('statechange',onChange);
        resolve();
      }
    };
    worker.addEventListener('statechange',onChange);
  });
}

async function forceAppUpdate(){
  if(app.updateInProgress) return;
  app.updateInProgress=true;
  setUpdateButtonState({busy:true,label:'Buscando…'});
  try{
    if(!navigator.onLine){
      toast('Conéctate a internet para buscar una versión nueva');
      return;
    }
    let registration=app.swRegistration;
    if('serviceWorker' in navigator){
      registration=registration||await navigator.serviceWorker.getRegistration();
      if(registration){
        watchServiceWorkerRegistration(registration);
        await registration.update();
        if(registration.installing) await waitForWorkerState(registration.installing,['installed','activated']);
        if(registration.waiting){
          app.updateAvailable=true;
          registration.waiting.postMessage({type:'SKIP_WAITING'});
          setUpdateButtonState({busy:true,available:true,label:'Aplicando…'});
          return;
        }
      }
    }
    await fetch(`./index.html?actualizar=${Date.now()}`,{cache:'no-store'});
    toast('Versión comprobada. Recargando…');
    setTimeout(()=>location.reload(),450);
  }catch(error){
    console.warn('No fue posible comprobar la actualización',error);
    toast('No fue posible comprobar la versión. Intenta de nuevo.');
  }finally{
    app.updateInProgress=false;
    setTimeout(()=>setUpdateButtonState({available:app.updateAvailable}),800);
  }
}

function registerSW(){
  if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http')) return;
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloading) return;
    reloading=true;
    location.reload();
  });
  navigator.serviceWorker.register(`service-worker.js?v=${APP_VERSION}`,{updateViaCache:'none'})
    .then(registration=>{
      if(!registration) return;
      watchServiceWorkerRegistration(registration);
      setTimeout(()=>registration.update?.().catch?.(()=>{}),1800);
    })
    .catch(console.warn);
}


init();

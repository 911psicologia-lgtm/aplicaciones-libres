'use strict';

const APP_VERSION='0.5.0';
const NO_FRAME='__none__';
const NO_ILLUSTRATION='__none__';
const PHRASES = window.TARJETICAS_PHRASES;
const ASSET_PACK = window.TARJETICAS_ASSETS;
const ASSET_ROOT = 'assets/library/';
const STORAGE = {
  profile:'tarjeticas-profile-v01', favorites:'tarjeticas-favorites-v01', shared:'tarjeticas-shared-v01', draft:'tarjeticas-draft-v01', recipes:'tarjeticas-recipes-v01'
};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const escapeHTML=(value='')=>String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

const defaultSelection={
  audienceId:null,recipientName:'',categoryId:null,messageId:null,customTitle:'',customText:'',mode:'illustrated',
  backgroundId:null,frameId:null,illustrationId:null,photoTemplateId:null,photoDataUrl:null,photoDataUrls:[],backgroundPhotoDataUrl:null,templateSlots:null
};
const initialDraft=readJSON(STORAGE.draft,{});
const app={
  view:'home',step:1,profile:readJSON(STORAGE.profile,{initialized:false,name:'',audienceId:'',styles:[]}),
  favorites:new Set(readJSON(STORAGE.favorites,[])),shared:readJSON(STORAGE.shared,{}),
  selection:{...defaultSelection,...initialDraft},library:{search:'',category:'all',audience:'all'},recipes:readJSON(STORAGE.recipes,[]),messageLimit:6,
  designTab:'backgrounds',assetFilters:{category:'recommended',style:'all',search:''},installPrompt:null,swRegistration:null,updateReady:false,templateCache:new Map(),busy:false
};
if(app.selection.photoDataUrl && !(Array.isArray(app.selection.photoDataUrls)&&app.selection.photoDataUrls.length)) app.selection.photoDataUrls=[app.selection.photoDataUrl];

function save(){
  localStorage.setItem(STORAGE.profile,JSON.stringify(app.profile));
  localStorage.setItem(STORAGE.favorites,JSON.stringify([...app.favorites]));
  localStorage.setItem(STORAGE.shared,JSON.stringify(app.shared));
  localStorage.setItem(STORAGE.recipes,JSON.stringify(app.recipes.slice(0,24)));
  localStorage.setItem(STORAGE.draft,JSON.stringify({...app.selection,photoDataUrl:null,photoDataUrls:[],backgroundPhotoDataUrl:null,templateSlots:null}));
}
function assetById(id){return ASSET_PACK.assets.find(a=>a.id===id)}
function messageById(id){return PHRASES.messages.find(m=>m.id===id)}
function audienceById(id){return PHRASES.audiences.find(a=>a.id===id)}
function categoryById(id){return PHRASES.categories.find(c=>c.id===id)}
function assetUrl(asset,thumb=false){return asset?ASSET_ROOT+asset.mainFile:''}
const LABELS={amor:'Amor',amistad:'Amistad',gratitud:'Gratitud',perdon:'Perdón',familia:'Familia',cumpleanos:'Cumpleaños',bienestar:'Bienestar','fechas-especiales':'Fechas especiales',vintage:'Vintage',clasico:'Clásico',romantico:'Romántico',minimalista:'Minimalista','infantil-tierno':'Infantil tierno',elegante:'Elegante','suave-ilustrado':'Suave ilustrado','calido-artesanal':'Cálido artesanal',corazones:'Corazones',flores:'Flores','sobres-cartas':'Sobres y cartas','ositos-personajes':'Ositos y personajes','parejas-simbolicas':'Parejas simbólicas','estrellas-luna-nubes':'Estrellas, luna y nubes','naturaleza-suave':'Naturaleza suave',aniversario:'Aniversario',pareja:'Pareja','recuerdo-especial':'Recuerdo especial',barroco:'Barroco',traga:'Traga',ruptura:'Ruptura','foto-completa':'Foto completa','collage-2':'Collage 2 fotos','collage-3':'Collage 3 fotos','collage-4':'Collage 4 fotos','collage-5':'Collage 5 fotos','collage-6':'Collage 6 fotos','background-photo':'Fondo vertical',illustrated:'Ilustrada',photo:'Collage'};
function friendlyLabel(value=''){return LABELS[value]||String(value).replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function assetName(asset){if(!asset)return'';const n=asset.id.match(/(\d+)$/)?.[1]||'';if(asset.type==='frame')return `Marco ${friendlyLabel(asset.style)}${n?` ${n}`:''}`;if(asset.type==='illustration')return `${friendlyLabel(asset.category)}${n?` ${n}`:''}`;return `${friendlyLabel(asset.category)} · ${friendlyLabel(asset.style)}${n?` ${n}`:''}`}
function normalizeCategory(value){return ({fechas_especiales:'fechas-especiales',sobres_cartas:'sobres-cartas',parejas:'parejas-simbolicas',naturaleza:'naturaleza-suave',cielo:'estrellas-luna-nubes',ositos:'ositos-personajes',recuerdo:'recuerdo-especial'})[value]||value}
function normalizeStyle(value){return ({tierno:'infantil-tierno',infantil_tierno:'infantil-tierno',suave_ilustrado:'suave-ilustrado',calido_artesanal:'calido-artesanal'})[value]||value}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2300)}
function setBusy(value){app.busy=value;$$('button').forEach(b=>{if(b.dataset.allowBusy!=='true') b.disabled=value})}
function selectedPhotoUrls(){const list=Array.isArray(app.selection.photoDataUrls)&&app.selection.photoDataUrls.length?app.selection.photoDataUrls:(app.selection.photoDataUrl?[app.selection.photoDataUrl]:[]);return list.filter(Boolean).slice(0,6)}
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function syncInstallButton(){const btn=$('#installBtn');if(!btn)return;btn.hidden=isStandalone();btn.textContent='Instalar app'}
function syncUpdateButton(){const btn=$('#updateBtn');if(!btn)return;btn.hidden=!(('serviceWorker' in navigator));btn.textContent=app.updateReady?'Actualizar app':'Buscar actualización';btn.classList.toggle('ready',app.updateReady)}
function showUpdateButton(){app.updateReady=true;syncUpdateButton()}
function frameFamily(frame=assetById(app.selection.frameId)){return frame?.category||frame?.style||'default'}
const META_SAFE_ZONES={
  default:{top:8,left:7,right:7,font:14},minimalista:{top:9,left:7,right:7,font:14},clasico:{top:11,left:8,right:8,font:14},
  elegante:{top:12,left:9,right:9,font:14},romantico:{top:13,left:10,right:10,font:13},vintage:{top:14,left:10,right:10,font:13},
  'infantil-tierno':{top:13,left:9,right:9,font:13},traga:{top:14,left:11,right:11,font:13},barroco:{top:16,left:13,right:13,font:13},
  cumpleanos:{top:20,left:10,right:10,font:13},ruptura:{top:14,left:10,right:10,font:13}
};
const META_FRAME_OVERRIDES={
  marco_barroco_01:{top:17,left:14,right:14},marco_barroco_02:{top:16,left:14,right:14},marco_barroco_03:{top:18,left:13,right:13},marco_barroco_04:{top:17,left:13,right:13},marco_barroco_05:{top:18,left:14,right:14},
  marco_traga_01:{top:15,left:12,right:12},marco_traga_02:{top:14,left:12,right:12},marco_traga_03:{top:15,left:11,right:11},marco_traga_04:{top:14,left:12,right:12},marco_traga_05:{top:15,left:12,right:12},
  marco_cumpleanos_01:{top:21,left:11,right:11},marco_cumpleanos_02:{top:20,left:11,right:11},marco_cumpleanos_03:{top:22,left:10,right:10},marco_cumpleanos_04:{top:21,left:10,right:10},marco_cumpleanos_05:{top:22,left:11,right:11},
  marco_ruptura_01:{top:15,left:11,right:11},marco_ruptura_02:{top:14,left:11,right:11},marco_ruptura_03:{top:15,left:10,right:10},marco_ruptura_04:{top:14,left:10,right:10},marco_ruptura_05:{top:15,left:11,right:11}
};
function metaSafeZone(mode=app.selection.mode){
  const family=mode==='photo'?'default':frameFamily();
  const exact=mode==='photo'?null:META_FRAME_OVERRIDES[app.selection.frameId];
  const base={...(META_SAFE_ZONES[family]||META_SAFE_ZONES.default),...(exact||{})};
  if(mode==='background-photo'){base.top=Math.max(base.top,12);base.left=Math.max(base.left,9);base.right=Math.max(base.right,9);base.font=13}
  if(mode==='photo'){base.top=10;base.left=7;base.right=7}
  return base;
}
function metaStyle(mode=app.selection.mode){const z=metaSafeZone(mode);return `top:${z.top}%;left:${z.left}%;right:${z.right}%;font-size:clamp(9px,${z.font/10}vw,${z.font}px)`}
function portraitFrameStyle(frame){return frame?`border-image-source:url('${assetUrl(frame)}')`:''}
function saveRecipe(method){
  const recipe={id:`recipe-${Date.now()}`,createdAt:new Date().toISOString(),method,audienceId:app.selection.audienceId,recipientName:app.selection.recipientName,categoryId:app.selection.categoryId,messageId:app.selection.messageId,customTitle:app.selection.customTitle,customText:app.selection.customText,mode:app.selection.mode,backgroundId:app.selection.backgroundId,frameId:app.selection.frameId,illustrationId:app.selection.illustrationId,photoTemplateId:app.selection.photoTemplateId,sender:app.profile.name};
  app.recipes=[recipe,...app.recipes.filter(r=>r.id!==recipe.id)].slice(0,24);save();
}

async function init(){
  app.profile.styles=(app.profile.styles||[]).map(normalizeStyle);
  app.selection.photoDataUrls=selectedPhotoUrls();
  app.selection.photoDataUrl=app.selection.photoDataUrls[0]||null;
  bindGlobal();
  initPwa();
  await new Promise(r=>setTimeout(r,650));
  $('#app').hidden=false;$('#splash').classList.add('hide');setTimeout(()=>$('#splash').remove(),500);
  if(!app.profile.initialized) openOnboarding();
  renderAll();
}
function bindGlobal(){
  $('#brandBtn').addEventListener('click',()=>navigate('home'));
  $('#profileBtn').addEventListener('click',()=>navigate('settings'));
  $('#backBtn').addEventListener('click',goBack);
  $$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.dataset.nav==='create'){app.step=1;app.selection={...defaultSelection,audienceId:app.profile.audienceId||null};save()}
    navigate(btn.dataset.nav);
  }));
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();app.installPrompt=e;syncInstallButton()});
  window.addEventListener('appinstalled',()=>{app.installPrompt=null;syncInstallButton();toast('Tarjeticas quedó instalada')});
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change',syncInstallButton);
  $('#installBtn').addEventListener('click',async()=>{
    if(isStandalone()){syncInstallButton();return}
    if(!app.installPrompt){toast('En Chrome o Edge, abre el menú del navegador y elige “Instalar Tarjeticas”');return}
    app.installPrompt.prompt();
    await app.installPrompt.userChoice;
    app.installPrompt=null;
    syncInstallButton();
  });
  $('#updateBtn').addEventListener('click',async()=>{
    const waiting=app.swRegistration?.waiting;
    if(waiting){waiting.postMessage({type:'SKIP_WAITING'});toast('Aplicando la nueva versión…');return}
    if(!app.swRegistration){toast('La búsqueda de actualización no está disponible en este navegador');return}
    toast('Buscando una nueva versión…');
    try{
      await app.swRegistration.update();
      setTimeout(()=>{
        if(app.swRegistration?.waiting){showUpdateButton();toast('Hay una nueva versión lista para aplicar')}
        else toast('Tarjeticas ya está actualizada');
      },900);
    }catch(error){
      console.warn('No fue posible buscar actualización',error);
      toast('No fue posible buscar actualización');
    }
  });
  $('#onboardingForm').addEventListener('submit',event=>{
    event.preventDefault();
    const audience=$('input[name="onboardAudience"]:checked')?.value||'';
    const styles=$$('#onboardingDialog input[type="checkbox"]:checked').map(x=>x.value);
    app.profile={initialized:true,name:$('#onboardName').value.trim(),audienceId:audience,styles};
    app.selection.audienceId=audience||null;save();$('#onboardingDialog').close();renderAll();toast('Preferencias guardadas');
  });
  $('#skipOnboardingBtn').addEventListener('click',()=>{app.profile.initialized=true;save();$('#onboardingDialog').close();renderAll();toast('Puedes configurar tu firma después')});
}
async function initPwa(){
  syncInstallButton();
  syncUpdateButton();
  if(!('serviceWorker' in navigator))return;
  try{
    const registration=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});
    app.swRegistration=registration;
    if(registration.waiting)showUpdateButton();
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      if(!worker)return;
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdateButton();
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());
    registration.update().catch(()=>{});
    syncUpdateButton();
    setInterval(()=>registration.update().catch(()=>{}),20*60*1000);
  }catch(error){console.warn('No fue posible registrar la PWA',error)}
}
function openOnboarding(){
  const host=$('#onboardAudience');
  host.innerHTML=PHRASES.audiences.filter(a=>a.id!=='para_mi').map(a=>`<label class="choice-chip"><input type="radio" name="onboardAudience" value="${a.id}"><span>${a.icon} ${escapeHTML(a.name)}</span></label>`).join('');
  $('#onboardName').value=app.profile.name||'';
  $('#onboardingDialog').showModal();
}
function navigate(view){app.view=view;renderAll();window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){
  if(app.view==='create'&&app.step>1){app.step--;renderAll();return}
  if(app.view!=='home'){navigate('home');return}
}
function renderAll(){
  ['home','create','library','favorites','settings'].forEach(name=>{const el=$(`#view-${name}`);el.hidden=name!==app.view;if(name===app.view)renderView(name,el)});
  const titles={home:['Tarjeticas','Inicio claro y rápido'],create:['Crear tarjetica',`Paso ${app.step} de 5`],library:['Mensajes','Banco curado'],favorites:['Colección','Guardados y herramientas'],settings:['Tu espacio','Preferencias locales']};
  $('#topTitle').textContent=titles[app.view][0];$('#topSubtitle').textContent=titles[app.view][1];
  $('#backBtn').classList.toggle('is-hidden',app.view==='home');
  syncInstallButton();
  syncUpdateButton();
  $$('.bottom-nav button').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===app.view));
}
function renderView(name,el){({home:renderHome,create:renderCreate,library:renderLibrary,favorites:renderFavorites,settings:renderSettings}[name])(el)}

function renderHome(el){
  const sharedTotal=Object.values(app.shared).reduce((s,r)=>s+(r.count||1),0);
  const favCount=app.favorites.size;
  const suggested=PHRASES.categories.slice(0,6);
  const recent=app.recipes.slice(0,3);
  const recentHTML=recent.length?`<section class="section"><div class="section-head"><div><h2>Seguir donde ibas</h2><p>Retoma composiciones recientes sin volver a empezar de cero.</p></div><button class="link-button" data-collection>Ir a colección</button></div><div class="quick-grid compact-grid">${recent.map(r=>`<button class="quick-card" data-recipe="${r.id}"><span>↺</span><strong>${escapeHTML(r.customTitle||categoryById(r.categoryId)?.name||'Tarjetica')}</strong><small>${r.recipientName?`Para ${escapeHTML(r.recipientName)}`:'Composición reciente'} · ${friendlyLabel(r.mode)}</small></button>`).join('')}</div></section>`:'';
  el.innerHTML=`
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">Credenciales afectivas coleccionables</div>
        <h1>Menos ruido, más camino.</h1>
        <p>La pantalla inicial ahora prioriza el proceso. Primero eliges qué hacer; luego cada pantalla se concentra en una sola tarea.</p>
        <div class="hero-actions">
          <button class="button primary" data-create>Crear paso a paso</button>
          <button class="button secondary" data-library>Explorar mensajes</button>
          <button class="button ghost" data-collection>Mi colección</button>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="display-card one"></div><div class="display-card two"></div><div class="display-card three"><span>♥</span><strong>Pensé en ti</strong></div></div>
    </section>
    <div class="stats-row"><div class="stat-card"><strong>${PHRASES.messages.length}</strong><small>mensajes originales</small></div><div class="stat-card"><strong>${ASSET_PACK.totals.illustrations}</strong><small>ilustraciones PNG</small></div><div class="stat-card"><strong>${sharedTotal}</strong><small>tarjeticas compartidas</small></div></div>
    <section class="section">
      <div class="section-head"><div><h2>Cómo funciona</h2><p>Dividimos el recorrido en pantallas con una intención clara.</p></div></div>
      <div class="process-grid">
        <article class="process-card"><span>1</span><strong>Crear</strong><small>Define para quién es, la intención y el mensaje.</small></article>
        <article class="process-card"><span>2</span><strong>Diseñar</strong><small>Elige fondo, marco, ilustración, collage o foto vertical.</small></article>
        <article class="process-card"><span>3</span><strong>Guardar y compartir</strong><small>Envía la imagen, recupérala luego y conserva favoritas.</small></article>
      </div>
    </section>
    <section class="section"><div class="section-head"><div><h2>Empieza por una intención</h2><p>Estas categorías sirven de puerta de entrada. El banco completo está en la pestaña Mensajes.</p></div><button class="link-button" data-library>Ver banco completo</button></div>
      <div class="quick-grid">${suggested.map(c=>`<button class="quick-card" data-category="${c.id}"><span>${c.icon}</span><strong>${escapeHTML(c.name)}</strong><small>${countMessages(c.id)} mensajes para comenzar</small></button>`).join('')}</div>
    </section>
    <section class="section"><div class="section-head"><div><h2>Herramientas rápidas</h2><p>Accesos directos separados del inicio principal para no saturar la pantalla.</p></div><button class="link-button" data-settings>Ver ajustes</button></div>
      <div class="quick-grid compact-grid"><button class="quick-card" data-photo><span>▣</span><strong>Collage con fotos</strong><small>Combina entre una y seis imágenes.</small></button><button class="quick-card" data-background-photo><span>▯</span><strong>Fondo vertical</strong><small>Una foto ocupa toda la pantalla.</small></button><button class="quick-card" data-favorites><span>♥</span><strong>${favCount} favoritas</strong><small>Mensajes guardados en este dispositivo.</small></button><button class="quick-card" data-settings><span>⚙</span><strong>Tu firma</strong><small>${escapeHTML(app.profile.name||'Configura cómo quieres firmar')}</small></button></div>
    </section>${recentHTML}`;
  $('[data-create]',el).onclick=()=>{app.step=1;navigate('create')};
  $$('[data-library]',el).forEach(b=>b.onclick=()=>navigate('library'));
  $$('[data-collection]',el).forEach(b=>b.onclick=()=>navigate('favorites'));
  $$('[data-category]',el).forEach(b=>b.onclick=()=>{app.selection={...defaultSelection,audienceId:app.profile.audienceId||'alguien_especial',categoryId:b.dataset.category};app.step=3;chooseDefaults();navigate('create')});
  $('[data-favorites]',el).onclick=()=>navigate('favorites');
  $('[data-photo]',el).onclick=()=>{app.selection={...defaultSelection,audienceId:app.profile.audienceId||'pareja',categoryId:'amor',mode:'photo'};chooseDefaults();app.step=3;navigate('create')};
  $('[data-background-photo]',el).onclick=()=>{app.selection={...defaultSelection,audienceId:app.profile.audienceId||'alguien_especial',categoryId:'cotidiano',mode:'background-photo'};chooseDefaults();app.step=3;navigate('create')};
  $$('[data-recipe]',el).forEach(b=>b.onclick=()=>{const r=app.recipes.find(x=>x.id===b.dataset.recipe);if(!r)return;app.selection={...defaultSelection,...r,backgroundPhotoDataUrl:null,photoDataUrl:null,photoDataUrls:[],templateSlots:null};app.profile.name=r.sender||app.profile.name;app.step=4;chooseDefaults();save();navigate('create');toast('Composición recuperada')});
  $$('[data-settings]',el).forEach(b=>b.onclick=()=>navigate('settings'));
}
function countMessages(category){return PHRASES.messages.filter(m=>m.category===category).length}
function surprise(){
  const m=PHRASES.messages[Math.floor(Math.random()*PHRASES.messages.length)];
  app.selection={...defaultSelection,audienceId:(m.audiences[0]==='todos'?'alguien_especial':m.audiences[0]),categoryId:m.category,messageId:m.id,customTitle:m.title,customText:m.message};
  chooseDefaults();app.step=5;save();navigate('create');toast('Encontré una tarjetica para ti');
}

function stepper(){return `<div class="stepper" aria-label="Paso ${app.step} de 5">${[1,2,3,4,5].map(n=>`<span class="${n<=app.step?'active':''}"></span>`).join('')}</div>`}
function summary(){
  const a=audienceById(app.selection.audienceId),c=categoryById(app.selection.categoryId);
  return `<div class="selection-summary">${a?`<span class="summary-chip">${a.icon} ${escapeHTML(a.name)}</span>`:''}${app.selection.recipientName?`<span class="summary-chip">Para: ${escapeHTML(app.selection.recipientName)}</span>`:''}${c?`<span class="summary-chip">${c.icon} ${escapeHTML(c.name)}</span>`:''}</div>`;
}
function renderCreate(el){
  const renderers={1:renderAudienceStep,2:renderCategoryStep,3:renderMessageStep,4:renderDesignStep,5:renderPreviewStep};
  renderers[app.step](el);
}
function renderAudienceStep(el){
  el.innerHTML=`${stepper()}<div class="screen-head"><div class="eyebrow">Primero la persona</div><h1>¿Para quién es?</h1><p>Elige el vínculo. Puedes escribir el nombre ahora o dejarlo para el final.</p></div>
    <div class="option-grid">${PHRASES.audiences.map(a=>`<button class="option-card ${app.selection.audienceId===a.id?'selected':''}" data-audience="${a.id}"><span class="big-icon">${a.icon}</span><strong>${escapeHTML(a.name)}</strong><small>${audienceDescription(a.id)}</small></button>`).join('')}</div>
    <div class="field"><span>Nombre de la persona — opcional</span><input id="recipientName" maxlength="42" placeholder="Por ejemplo: Ana, mamá, mi amigo…" value="${escapeHTML(app.selection.recipientName)}"></div>
    <div class="wizard-actions"><span></span><button class="button primary" data-next ${app.selection.audienceId?'':'disabled'}>Continuar</button></div>`;
  $$('[data-audience]',el).forEach(b=>b.onclick=()=>{app.selection.audienceId=b.dataset.audience;save();renderAudienceStep(el)});
  $('#recipientName',el).oninput=e=>{app.selection.recipientName=e.target.value;save()};
  $('[data-next]',el)?.addEventListener('click',()=>{app.step=2;renderAll()});
}
function audienceDescription(id){return ({pareja:'Cariño romántico, aniversarios y vida cotidiana.',amistad:'Amistades cercanas, nuevas o de muchos años.',mama:'Afecto, reconocimiento y fechas especiales.',papa:'Gratitud, cercanía y mensajes significativos.',hijo_hija:'Ánimo, orgullo, acompañamiento y celebración.',familia:'Vínculos familiares diversos.',alguien_especial:'Una persona importante sin definir el vínculo.',para_mi:'Mensajes para guardar y volver a leer.'})[id]||''}
function renderCategoryStep(el){
  el.innerHTML=`${stepper()}${summary()}<div class="screen-head"><div class="eyebrow">La intención</div><h1>¿Qué quieres expresar?</h1><p>Elige la intención principal. Más adelante podrás editar cualquier palabra.</p></div>
    <div class="option-grid">${PHRASES.categories.map(c=>`<button class="option-card ${app.selection.categoryId===c.id?'selected':''}" data-category="${c.id}"><span class="big-icon">${c.icon}</span><strong>${escapeHTML(c.name)}</strong><small>${countMessages(c.id)} opciones iniciales</small></button>`).join('')}</div>
    <div class="wizard-actions"><button class="button secondary" data-prev>Volver</button><button class="button primary" data-next ${app.selection.categoryId?'':'disabled'}>Ver mensajes</button></div>`;
  $$('[data-category]',el).forEach(b=>b.onclick=()=>{app.selection.categoryId=b.dataset.category;app.selection.messageId=null;app.messageLimit=6;chooseDefaults();save();renderCategoryStep(el)});
  $('[data-prev]',el).onclick=()=>{app.step=1;renderAll()};
  $('[data-next]',el)?.addEventListener('click',()=>{app.step=3;renderAll()});
}
function matchingMessages(){
  const audience=app.selection.audienceId,cat=app.selection.categoryId;
  return PHRASES.messages.filter(m=>(!cat||m.category===cat)&&(!audience||m.audiences.includes('todos')||m.audiences.includes(audience)));
}
function renderMessageStep(el){
  let list=matchingMessages();if(!list.length)list=PHRASES.messages.filter(m=>m.category===app.selection.categoryId);
  const shown=list.slice(0,app.messageLimit),hasMore=app.messageLimit<list.length;
  el.innerHTML=`${stepper()}${summary()}<div class="screen-head"><div class="eyebrow">Las palabras</div><h1>Elige un mensaje</h1><p>Mostramos primero seis opciones para reducir la fatiga de elección. Puedes abrir más cuando lo necesites.</p></div>
    <div class="message-grid">${shown.map(messageCardHTML).join('')}</div>
    ${hasMore?`<div class="center-action"><button class="button secondary" data-more-messages>Ver más mensajes (${list.length-app.messageLimit})</button></div>`:''}
    <div class="field"><span>O escribe tu propio mensaje</span><textarea id="ownMessage" placeholder="Escribe aquí una frase propia…">${app.selection.messageId?'':escapeHTML(app.selection.customText)}</textarea></div>
    <div class="wizard-actions"><button class="button secondary" data-prev>Volver</button><button class="button primary" data-next ${(app.selection.messageId||app.selection.customText.trim())?'':'disabled'}>Elegir diseño</button></div>`;
  bindMessageCards(el);
  $('[data-more-messages]',el)?.addEventListener('click',()=>{app.messageLimit=Math.min(list.length,app.messageLimit+6);renderMessageStep(el)});
  $('#ownMessage',el).oninput=e=>{if(e.target.value.trim()){app.selection.messageId=null;app.selection.customTitle='Un mensaje para ti';app.selection.customText=e.target.value}else app.selection.customText='';save();renderNextState(el)};
  $('[data-prev]',el).onclick=()=>{app.step=2;renderAll()};
  $('[data-next]',el)?.addEventListener('click',()=>{applySelectedMessage();chooseDefaults();app.step=4;renderAll()});
}
function messageCardHTML(m){return `<article class="message-card ${app.selection.messageId===m.id?'selected':''}" data-message="${m.id}"><button type="button" class="favorite-mini ${app.favorites.has(m.id)?'on':''}" data-favorite="${m.id}" aria-label="Favorita">♥</button><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.message)}</p><span class="tone-tag">${escapeHTML(m.tone)}</span></article>`}
function bindMessageCards(root){
  $$('[data-message]',root).forEach(card=>card.addEventListener('click',e=>{if(e.target.closest('[data-favorite]'))return;const m=messageById(card.dataset.message);app.selection.messageId=m.id;app.selection.customTitle=m.title;app.selection.customText=m.message;save();renderMessageStep(root)}));
  $$('[data-favorite]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFavorite(b.dataset.favorite);renderMessageStep(root)});
}
function renderNextState(root){const b=$('[data-next]',root);if(b)b.disabled=!(app.selection.messageId||app.selection.customText.trim())}
function applySelectedMessage(){const m=messageById(app.selection.messageId);if(m){app.selection.customTitle=m.title;app.selection.customText=m.message}}

function chooseDefaults(){
  const cat=categoryById(app.selection.categoryId)||PHRASES.categories[0];
  const visualCategory=normalizeCategory(cat.assetCategory);
  const backgrounds=assetsFor('background',visualCategory);
  if(!assetById(app.selection.backgroundId)||assetById(app.selection.backgroundId).category!==visualCategory)app.selection.backgroundId=backgrounds[0]?.id||assetsFor('background')[0]?.id||null;
  const preferredStyle=normalizeStyle(app.profile.styles?.[0]);const frames=assetsFor('frame');
  if(app.selection.frameId!==NO_FRAME&&(!assetById(app.selection.frameId)||assetById(app.selection.frameId).type!=='frame'))app.selection.frameId=frames.find(f=>f.style===preferredStyle)?.id||frames[0]?.id||null;
  const illus=illustrationsForCategory(app.selection.categoryId);
  if(app.selection.illustrationId!==NO_ILLUSTRATION&&!illus.some(i=>i.id===app.selection.illustrationId))app.selection.illustrationId=illus[0]?.id||null;
  const photos=assetsFor('photo-template',photoCategory());
  if(!photos.some(i=>i.id===app.selection.photoTemplateId))app.selection.photoTemplateId=photos[0]?.id||assetsFor('photo-template')[0]?.id||null;
  save();
}
function assetsFor(type,category=null){return ASSET_PACK.assets.filter(a=>a.type===type&&(!category||a.category===normalizeCategory(category)))}
function illustrationGroups(category){
  const map={amor:['corazones','parejas-simbolicas','flores'],amistad:['flores','sobres-cartas','naturaleza-suave','ositos-personajes'],gratitud:['flores','sobres-cartas'],perdon:['sobres-cartas','naturaleza-suave'],familia:['familia','naturaleza-suave'],cumpleanos:['estrellas-luna-nubes','flores','ositos-personajes'],bienestar:['naturaleza-suave','estrellas-luna-nubes'],fechas_especiales:['estrellas-luna-nubes','flores'],te_extrano:['estrellas-luna-nubes','sobres-cartas'],animo:['estrellas-luna-nubes','naturaleza-suave'],admiracion:['flores','corazones'],cotidiano:['sobres-cartas','naturaleza-suave'],ruptura:['naturaleza-suave','sobres-cartas','estrellas-luna-nubes']};
  return map[category]||['corazones'];
}
function illustrationsForCategory(category){const groups=illustrationGroups(category);return ASSET_PACK.assets.filter(a=>a.type==='illustration'&&groups.includes(a.category))}
function photoCategory(){
  const a=app.selection.audienceId,c=app.selection.categoryId;
  if(c==='cumpleanos')return 'cumpleanos';if(a==='pareja')return c==='fechas_especiales'?'aniversario':'pareja';if(a==='amistad')return 'amistad';if(['mama','papa','hijo_hija','familia'].includes(a))return 'familia';return 'recuerdo-especial';
}
function currentAssetType(){return ({backgrounds:'background',frames:'frame',illustrations:'illustration',photoTemplates:'photo-template'})[app.designTab]}
function recommendedAssetCategories(type){
  if(type==='background')return [normalizeCategory(categoryById(app.selection.categoryId)?.assetCategory||'amor')];
  if(type==='illustration')return illustrationGroups(app.selection.categoryId);
  if(type==='photo-template')return [photoCategory()];
  if(type==='frame'){
    const category=app.selection.categoryId;
    if(category==='ruptura')return ['ruptura'];
    if(category==='cumpleanos')return ['cumpleanos'];
    if(category==='amor'||category==='te_extrano')return ['romantico','traga'];
    const preferred=normalizeStyle(app.profile.styles?.[0]);return preferred?[preferred]:[];
  }
  return [];
}
function filterAssetList(){
  const type=currentAssetType();let list=assetsFor(type);const f=app.assetFilters;
  if(f.category==='recommended'){const rec=recommendedAssetCategories(type);const subset=list.filter(a=>rec.includes(a.category));if(subset.length)list=subset}
  else if(f.category!=='all')list=list.filter(a=>a.category===f.category);
  if(f.style!=='all')list=list.filter(a=>a.style===f.style);
  const q=f.search.trim().toLowerCase();if(q)list=list.filter(a=>`${a.name} ${a.category} ${a.style} ${(a.tags||[]).join(' ')}`.toLowerCase().includes(q));
  return list;
}
function renderDesignStep(el){
  chooseDefaults();
  const tabs=app.selection.mode==='photo'?['photoTemplates']:(app.selection.mode==='background-photo'?['frames','illustrations']:['backgrounds','frames','illustrations']);
  if(!tabs.includes(app.designTab))app.designTab=tabs[0];
  const type=currentAssetType();const all=assetsFor(type);const cats=[...new Set(all.map(a=>a.category))].sort();const styles=[...new Set(all.map(a=>a.style))].sort();const shown=filterAssetList();
  const photoCount=selectedPhotoUrls().length;
  const nextDisabled=(app.selection.mode==='photo'&&!photoCount)||(app.selection.mode==='background-photo'&&!app.selection.backgroundPhotoDataUrl);
  el.innerHTML=`${stepper()}${summary()}<div class="screen-head"><div class="eyebrow">La apariencia</div><h1>Elige cómo se verá</h1><p>Puedes crear una credencial ilustrada, un collage o una composición vertical de pantalla completa.</p></div>
    <div class="mode-grid three"><button class="mode-card ${app.selection.mode==='illustrated'?'active':''}" data-mode="illustrated"><strong>Tarjetica ilustrada</strong><small>Combina fondo del catálogo, marco e ilustración.</small></button><button class="mode-card ${app.selection.mode==='photo'?'active':''}" data-mode="photo"><strong>Collage o plantilla</strong><small>Usa entre una y seis fotos en diseños horizontales.</small></button><button class="mode-card ${app.selection.mode==='background-photo'?'active':''}" data-mode="background-photo"><strong>Imagen vertical de fondo</strong><small>Una sola foto ocupa toda la tarjeta; puedes añadir marco e ilustración.</small></button></div>
    ${app.selection.mode==='photo'?photoUploadHTML():''}
    ${app.selection.mode==='background-photo'?backgroundPhotoUploadHTML():''}
    <div class="design-tabs">${tabs.map(t=>`<button data-design-tab="${t}" class="${app.designTab===t?'active':''}">${({backgrounds:'Fondos',frames:'Marcos',illustrations:'Ilustraciones',photoTemplates:'Plantillas con foto'})[t]}</button>`).join('')}</div>
    <div class="asset-filter-panel"><select id="assetCategoryFilter"><option value="recommended" ${app.assetFilters.category==='recommended'?'selected':''}>Sugeridas para esta tarjetica</option><option value="all" ${app.assetFilters.category==='all'?'selected':''}>Todas las categorías</option>${cats.map(c=>`<option value="${c}" ${app.assetFilters.category===c?'selected':''}>${friendlyLabel(c)}</option>`).join('')}</select><select id="assetStyleFilter"><option value="all">Todos los estilos</option>${styles.map(st=>`<option value="${st}" ${app.assetFilters.style===st?'selected':''}>${friendlyLabel(st)}</option>`).join('')}</select><div class="asset-search"><span>⌕</span><input id="assetSearch" type="search" placeholder="Buscar plantilla o etiqueta…" value="${escapeHTML(app.assetFilters.search)}"></div><small>${shown.length} opciones</small></div>
    <div id="assetGallery" class="asset-grid">${assetGalleryHTML(shown)}</div>
    <div class="wizard-actions"><button class="button secondary" data-prev>Volver</button><button class="button primary" data-next ${nextDisabled?'disabled':''}>Ver tarjetica</button></div>`;
  $$('[data-mode]',el).forEach(b=>b.onclick=()=>{
    app.selection.mode=b.dataset.mode;
    app.designTab=b.dataset.mode==='photo'?'photoTemplates':(b.dataset.mode==='background-photo'?'frames':'backgrounds');
    app.assetFilters={category:'recommended',style:'all',search:''};chooseDefaults();save();renderDesignStep(el)
  });
  $$('[data-design-tab]',el).forEach(b=>b.onclick=()=>{app.designTab=b.dataset.designTab;app.assetFilters={category:'recommended',style:'all',search:''};renderDesignStep(el)});
  $('#assetCategoryFilter',el).onchange=e=>{app.assetFilters.category=e.target.value;renderDesignStep(el)};
  $('#assetStyleFilter',el).onchange=e=>{app.assetFilters.style=e.target.value;renderDesignStep(el)};
  $('#assetSearch',el).oninput=e=>{app.assetFilters.search=e.target.value;clearTimeout(renderDesignStep.searchTimer);renderDesignStep.searchTimer=setTimeout(()=>renderDesignStep(el),160)};
  bindAssetChoices(el);
  const upload=$('#photoInput',el);if(upload)upload.onchange=readPhoto;
  const backgroundUpload=$('#backgroundPhotoInput',el);if(backgroundUpload)backgroundUpload.onchange=readBackgroundPhoto;
  $('[data-photo-clear]',el)?.addEventListener('click',()=>{app.selection.photoDataUrl=null;app.selection.photoDataUrls=[];save();renderDesignStep(el)});
  $('[data-background-photo-clear]',el)?.addEventListener('click',()=>{app.selection.backgroundPhotoDataUrl=null;save();renderDesignStep(el)});
  $('[data-prev]',el).onclick=()=>{app.step=3;renderAll()};
  $('[data-next]',el).onclick=async()=>{
    if(app.selection.mode==='photo'&&!selectedPhotoUrls().length){toast('Elige al menos una foto');return}
    if(app.selection.mode==='background-photo'&&!app.selection.backgroundPhotoDataUrl){toast('Elige una imagen vertical de fondo');return}
    if(app.selection.mode==='photo')await ensureTemplateSlots();app.step=5;renderAll()
  };
}
function photoUploadHTML(){const count=selectedPhotoUrls().length;return `<div class="settings-card"><h2>Fotos personales</h2><p>${count?`${count} foto${count>1?'s':''} lista${count>1?'s':''}. Puedes usar entre 1 y 6 imágenes.`:'Selecciona entre 1 y 6 fotos para una plantilla o collage.'}</p><div class="hero-actions"><label class="button primary" for="photoInput">${count?'Cambiar fotos':'Elegir fotos'}</label><input id="photoInput" type="file" accept="image/*" multiple hidden>${count?'<button class="button secondary" data-photo-clear>Quitar</button>':''}</div></div>`}
function backgroundPhotoUploadHTML(){const ready=Boolean(app.selection.backgroundPhotoDataUrl);return `<div class="settings-card vertical-photo-settings"><h2>Imagen vertical de fondo</h2><p>${ready?'La imagen ocupará toda la tarjeta vertical, de borde a borde.':'Elige una imagen preferiblemente vertical. Se recortará para ocupar toda la pantalla de la tarjetica.'}</p><div class="hero-actions"><label class="button primary" for="backgroundPhotoInput">${ready?'Cambiar imagen':'Elegir imagen vertical'}</label><input id="backgroundPhotoInput" type="file" accept="image/*" hidden>${ready?'<button class="button secondary" data-background-photo-clear>Quitar</button>':''}</div><p class="helper-note">En este modo la imagen es siempre vertical y de pantalla completa. El marco se adapta sin deformar sus esquinas.</p></div>`}
function readBackgroundPhoto(event){const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){toast('Selecciona una imagen válida');return}const reader=new FileReader();reader.onload=()=>{app.selection.backgroundPhotoDataUrl=reader.result;save();$('#imageDialog').showModal();renderAll()};reader.onerror=()=>toast('No fue posible leer la imagen');reader.readAsDataURL(file);event.target.value=''}
function assetGalleryHTML(list=filterAssetList()){
  const clearFrame=app.designTab==='frames'&&app.selection.frameId===NO_FRAME;
  const clearIllustration=app.designTab==='illustrations'&&app.selection.illustrationId===NO_ILLUSTRATION;
  const clear=(app.designTab==='frames'||app.designTab==='illustrations')?`<button class="asset-choice clear-choice ${(clearFrame||clearIllustration)?'selected':''}" data-clear-asset="${app.designTab}"><span>∅</span><strong>Sin ${app.designTab==='frames'?'marco':'ilustración'}</strong></button>`:'';
  return clear+list.map(a=>{const selected=[app.selection.backgroundId,app.selection.frameId,app.selection.illustrationId,app.selection.photoTemplateId].includes(a.id);return `<button class="asset-choice ${a.type==='illustration'?'illustration':''} ${selected?'selected':''}" data-asset="${a.id}" title="${escapeHTML(a.name)}"><img loading="lazy" src="${assetUrl(a,true)}" alt="${escapeHTML(a.name)}"><small>${escapeHTML(assetName(a))}</small><em>${friendlyLabel(a.style)}</em></button>`}).join('');
}
function bindAssetChoices(root){
  $$('[data-asset]',root).forEach(b=>b.onclick=async()=>{const a=assetById(b.dataset.asset);if(a.type==='background')app.selection.backgroundId=a.id;if(a.type==='frame')app.selection.frameId=a.id;if(a.type==='illustration')app.selection.illustrationId=a.id;if(a.type==='photo-template'){app.selection.photoTemplateId=a.id;app.selection.templateSlots=null;await ensureTemplateSlots()}save();renderDesignStep(root)});
  $$('[data-clear-asset]',root).forEach(b=>b.onclick=()=>{if(b.dataset.clearAsset==='frames')app.selection.frameId=NO_FRAME;else app.selection.illustrationId=NO_ILLUSTRATION;save();renderDesignStep(root)});
}
function readPhoto(event){
  const files=[...(event.target.files||[])].filter(file=>file.type.startsWith('image/')).slice(0,6);
  if(!files.length){toast('Selecciona al menos una imagen válida');return}
  Promise.all(files.map(file=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file)}))).then(urls=>{app.selection.photoDataUrls=urls;app.selection.photoDataUrl=urls[0]||null;save();$('#imageDialog').showModal();renderAll()}).catch(err=>{console.error(err);toast('No fue posible leer las fotos')});
  event.target.value='';
}

async function ensureTemplateSlots(){
  if(app.selection.mode!=='photo')return null;const asset=assetById(app.selection.photoTemplateId);if(!asset)return null;
  if(app.templateCache.has(asset.id)){app.selection.templateSlots=app.templateCache.get(asset.id);return app.selection.templateSlots}
  const fallback={photos:[{x:294,y:194,width:692,height:372,shape:'rect',rx:5}],text:{x:102,y:670,width:1076,height:70,shape:'rect',rx:4}};
  const raw=asset.slots||fallback;const normalized={photos:Array.isArray(raw.photos)?raw.photos:(raw.photo?[raw.photo]:fallback.photos),text:raw.text||fallback.text};
  app.templateCache.set(asset.id,normalized);app.selection.templateSlots=normalized;return normalized;
}
function slotStyle(slot){if(!slot)return'';const parts=[`left:${slot.x/12.8}%`,`top:${slot.y/8}%`,`width:${slot.width/12.8}%`,`height:${slot.height/8}%`];if(slot.shape==='circle')parts.push('border-radius:50%');else if(slot.rx)parts.push(`border-radius:${slot.rx/12.8}%`);return parts.join(';')}

function renderPreviewStep(el){
  const m=messageById(app.selection.messageId);if(m&&!app.selection.customText){app.selection.customTitle=m.title;app.selection.customText=m.message}
  const a=audienceById(app.selection.audienceId),c=categoryById(app.selection.categoryId);
  el.innerHTML=`${stepper()}${summary()}<div class="screen-head split-head"><div><div class="eyebrow">Lista para regalar</div><h1>Revisa tu tarjetica</h1><p>Modifica el texto o los nombres antes de descargarla o compartirla.</p></div><button class="button secondary" data-design-top>Elegir diseño</button></div>
    <div class="preview-layout ${app.selection.mode==='background-photo'?'portrait-layout':''}"><div class="preview-panel">${previewHTML()}</div><aside class="preview-controls"><h2>Últimos detalles</h2>
      <p class="helper-note">El destinatario y la firma sí se conservan en la tarjeta. Solo se reubicaron un poco hacia adentro y más abajo para que el marco no los tape.</p>
      <div class="field"><span>Para</span><input id="finalRecipient" maxlength="42" value="${escapeHTML(app.selection.recipientName)}" placeholder="Nombre opcional"></div>
      <div class="field"><span>Título</span><input id="finalTitle" maxlength="60" value="${escapeHTML(app.selection.customTitle||'Un mensaje para ti')}"></div>
      <div class="field"><span>Mensaje</span><textarea id="finalMessage" maxlength="420">${escapeHTML(app.selection.customText)}</textarea></div>
      <div class="field"><span>Firma</span><input id="finalSender" maxlength="42" value="${escapeHTML(app.profile.name)}" placeholder="Tu nombre o firma"></div>
      <div class="action-stack"><button class="button primary" data-share>Compartir imagen</button><button class="button secondary" data-download>Guardar PNG</button><button class="button secondary" data-design>Elegir otro diseño</button>${app.selection.messageId?`<button class="button ghost" data-favorite-current>${app.favorites.has(app.selection.messageId)?'♥ Guardada en favoritas':'♡ Guardar mensaje'}</button>`:''}</div>
      <p class="privacy-note">En celular se intenta compartir únicamente el PNG. En PC, si no hay compartición nativa, se abre una vista previa para descargar o copiar la imagen.</p></aside></div>
    <div class="wizard-actions"><button class="button secondary" data-prev>Volver</button><button class="button ghost" data-new>Nueva tarjetica</button></div>`;
  const update=()=>{app.selection.recipientName=$('#finalRecipient',el).value;app.selection.customTitle=$('#finalTitle',el).value;app.selection.customText=$('#finalMessage',el).value;app.profile.name=$('#finalSender',el).value;save();const panel=$('.preview-panel',el);panel.innerHTML=previewHTML()};
  ['finalRecipient','finalTitle','finalMessage','finalSender'].forEach(id=>$(`#${id}`,el).addEventListener('input',update));
  $('[data-share]',el).onclick=e=>shareCard(e.currentTarget);
  $('[data-download]',el).onclick=e=>downloadCard(e.currentTarget);
  $('[data-design]',el).onclick=()=>{app.step=4;renderAll()};
  $('[data-design-top]',el).onclick=()=>{app.step=4;renderAll()};
  $('[data-favorite-current]',el)?.addEventListener('click',()=>{toggleFavorite(app.selection.messageId);renderPreviewStep(el)});
  $('[data-prev]',el).onclick=()=>{app.step=4;renderAll()};
  $('[data-new]',el).onclick=()=>{app.selection={...defaultSelection,audienceId:app.profile.audienceId||null};app.step=1;save();renderAll()};
}
function previewHTML(){
  if(app.selection.mode==='photo')return photoPreviewHTML();
  if(app.selection.mode==='background-photo')return backgroundPhotoPreviewHTML();
  const bg=assetById(app.selection.backgroundId),frame=assetById(app.selection.frameId),ill=assetById(app.selection.illustrationId);
  return `<div class="card-canvas"><img src="${assetUrl(bg)}" alt="">${ill?`<img class="layer-illustration" src="${assetUrl(ill)}" alt="">`:''}<div class="card-copy"><h3>${escapeHTML(app.selection.customTitle||'Un mensaje para ti')}</h3><p>${escapeHTML(app.selection.customText)}</p></div>${frame?`<img src="${assetUrl(frame)}" alt="">`:''}<div class="card-meta meta-safe" style="${metaStyle('illustrated')}"><span>${app.selection.recipientName?`Para: ${escapeHTML(app.selection.recipientName)}`:''}</span><span>${app.profile.name?`De: ${escapeHTML(app.profile.name)}`:''}</span></div></div>`;
}
function photoPreviewHTML(){
  const tpl=assetById(app.selection.photoTemplateId);const slots=app.selection.templateSlots||tpl?.slots||{photos:[{x:294,y:194,width:692,height:372,shape:'rect'}],text:{x:102,y:670,width:1076,height:70,shape:'rect'}};const photos=slots.photos||[];const narrow=slots.text?.width<320?' narrow':'';const photoUrls=selectedPhotoUrls();
  return `<div class="card-canvas">${tpl?`<img src="${assetUrl(tpl)}" alt="">`:''}${photoUrls.length?photos.map((slot,i)=>photoUrls[i]?`<img class="photo-layer" style="${slotStyle(slot)}" src="${photoUrls[i]}" alt="Foto elegida ${i+1}">`:'' ).join(''):''}${!photoUrls.length?'<div class="photo-placeholder-note">Elige una o varias fotos para completar esta plantilla.</div>':''}<div class="photo-message${narrow}" style="${slotStyle(slots.text)}"><strong>${escapeHTML(app.selection.customTitle||'Un mensaje para ti')}</strong><span>${escapeHTML(app.selection.customText)}</span></div><div class="card-meta meta-safe" style="${metaStyle('photo')}"><span>${app.selection.recipientName?`Para: ${escapeHTML(app.selection.recipientName)}`:''}</span><span>${app.profile.name?`De: ${escapeHTML(app.profile.name)}`:''}</span></div></div>`;
}
function backgroundPhotoPreviewHTML(){
  const frame=assetById(app.selection.frameId),ill=assetById(app.selection.illustrationId);
  return `<div class="card-canvas portrait-card"><img class="portrait-background" src="${app.selection.backgroundPhotoDataUrl||''}" alt="Imagen vertical de fondo">${ill?`<img class="portrait-illustration" src="${assetUrl(ill)}" alt="">`:''}<div class="portrait-copy"><h3>${escapeHTML(app.selection.customTitle||'Un mensaje para ti')}</h3><p>${escapeHTML(app.selection.customText)}</p></div>${frame?`<div class="portrait-frame" style="${portraitFrameStyle(frame)}"></div>`:''}<div class="card-meta meta-safe portrait-meta" style="${metaStyle('background-photo')}"><span>${app.selection.recipientName?`Para: ${escapeHTML(app.selection.recipientName)}`:''}</span><span>${app.profile.name?`De: ${escapeHTML(app.profile.name)}`:''}</span></div></div>`;
}

function toggleFavorite(id){if(!id)return;app.favorites.has(id)?app.favorites.delete(id):app.favorites.add(id);save();toast(app.favorites.has(id)?'Guardada en favoritas':'Eliminada de favoritas')}
function renderLibrary(el){
  const list=filteredLibrary();
  el.innerHTML=`<div class="screen-head"><div class="eyebrow">Banco curado</div><h1>Mensajes para elegir</h1><p>La biblioteca reúne ${PHRASES.messages.length} mensajes originales: 50 por categoría, sin títulos ni textos repetidos.</p></div>
    <div class="search-box"><span>⌕</span><input id="librarySearch" type="search" placeholder="Buscar: gracias, abrazo, cumpleaños…" value="${escapeHTML(app.library.search)}"></div>
    <div class="filter-grid"><select id="libraryCategory"><option value="all">Todas las intenciones</option>${PHRASES.categories.map(c=>`<option value="${c.id}" ${app.library.category===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select><select id="libraryAudience"><option value="all">Todas las personas</option>${PHRASES.audiences.map(a=>`<option value="${a.id}" ${app.library.audience===a.id?'selected':''}>${escapeHTML(a.name)}</option>`).join('')}</select></div>
    ${list.length?`<div class="message-grid">${list.map(messageCardHTML).join('')}</div>`:`<div class="empty-state"><span>⌕</span><h2>No encontramos coincidencias</h2><p>Prueba con otra palabra o filtro.</p></div>`}`;
  $('#librarySearch',el).oninput=e=>{app.library.search=e.target.value;clearTimeout(renderLibrary.searchTimer);renderLibrary.searchTimer=setTimeout(()=>{renderLibrary(el);const input=$('#librarySearch',el);input.focus();input.setSelectionRange(input.value.length,input.value.length)},180)};
  $('#libraryCategory',el).onchange=e=>{app.library.category=e.target.value;renderLibrary(el)};
  $('#libraryAudience',el).onchange=e=>{app.library.audience=e.target.value;renderLibrary(el)};
  bindMessageCardsForLibrary(el);
}
function filteredLibrary(){const q=app.library.search.trim().toLowerCase();return PHRASES.messages.filter(m=>{if(app.library.category!=='all'&&m.category!==app.library.category)return false;if(app.library.audience!=='all'&&!m.audiences.includes('todos')&&!m.audiences.includes(app.library.audience))return false;if(q&&!`${m.title} ${m.message} ${m.tags.join(' ')}`.toLowerCase().includes(q))return false;return true})}
function bindMessageCardsForLibrary(root){
  $$('[data-message]',root).forEach(card=>card.onclick=e=>{if(e.target.closest('[data-favorite]'))return;const m=messageById(card.dataset.message);app.selection={...defaultSelection,audienceId:(m.audiences[0]==='todos'?'alguien_especial':m.audiences[0]),categoryId:m.category,messageId:m.id,customTitle:m.title,customText:m.message};chooseDefaults();app.step=4;save();navigate('create')});
  $$('[data-favorite]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFavorite(b.dataset.favorite);renderLibrary(root)});
}
function renderFavorites(el){
  const list=PHRASES.messages.filter(m=>app.favorites.has(m.id));
  const recent=app.recipes.slice(0,6);
  el.innerHTML=`<div class="screen-head"><div class="eyebrow">Tu colección</div><h1>Guardados y herramientas</h1><p>Esta pantalla reúne lo que antes estaba mezclado en el inicio: favoritas, composiciones recientes y accesos de creación visual.</p></div>
    <section class="section"><div class="section-head"><div><h2>Mensajes favoritos</h2><p>Los corazones que marcaste quedan aquí listos para volver a usarlos.</p></div><button class="link-button" data-explore>Explorar mensajes</button></div>${list.length?`<div class="message-grid">${list.map(messageCardHTML).join('')}</div>`:`<div class="empty-state"><span>♡</span><h2>Aún no guardas mensajes</h2><p>Marca el corazón de una frase para encontrarla aquí.</p></div>`}</section>
    <section class="section"><div class="section-head"><div><h2>Composiciones recientes</h2><p>Vuelve a una receta visual anterior y ajústala rápidamente.</p></div></div>${recent.length?`<div class="quick-grid compact-grid">${recent.map(r=>`<button class="quick-card" data-recipe="${r.id}"><span>↺</span><strong>${escapeHTML(r.customTitle||categoryById(r.categoryId)?.name||'Tarjetica')}</strong><small>${r.recipientName?`Para ${escapeHTML(r.recipientName)}`:'Composición reciente'} · ${friendlyLabel(r.mode)}</small></button>`).join('')}</div>`:`<div class="empty-state slim"><span>↺</span><h2>Aún no hay composiciones guardadas</h2><p>Crea y comparte una tarjetica para verla aquí después.</p></div>`}</section>
    <section class="section"><div class="section-head"><div><h2>Herramientas visuales</h2><p>Accesos separados por acción para reducir la carga cognitiva.</p></div></div><div class="quick-grid compact-grid"><button class="quick-card" data-photo><span>▣</span><strong>Collage con fotos</strong><small>Combina entre una y seis imágenes.</small></button><button class="quick-card" data-background-photo><span>▯</span><strong>Fondo vertical</strong><small>Una imagen ocupa toda la tarjeta.</small></button><button class="quick-card" data-create><span>＋</span><strong>Crear paso a paso</strong><small>Recorre el flujo guiado completo.</small></button><button class="quick-card" data-settings><span>⚙</span><strong>Firma y ajustes</strong><small>Respaldo, instalación y actualización.</small></button></div></section>`;
  if(list.length)bindMessageCardsForFavorites(el);
  $('[data-explore]',el).onclick=()=>navigate('library');
  $$('[data-recipe]',el).forEach(b=>b.onclick=()=>{const r=app.recipes.find(x=>x.id===b.dataset.recipe);if(!r)return;app.selection={...defaultSelection,...r,backgroundPhotoDataUrl:null,photoDataUrl:null,photoDataUrls:[],templateSlots:null};app.profile.name=r.sender||app.profile.name;app.step=4;chooseDefaults();save();navigate('create');toast('Composición recuperada')});
  $('[data-photo]',el).onclick=()=>{app.selection={...defaultSelection,audienceId:app.profile.audienceId||'pareja',categoryId:'amor',mode:'photo'};chooseDefaults();app.step=3;navigate('create')};
  $('[data-background-photo]',el).onclick=()=>{app.selection={...defaultSelection,audienceId:app.profile.audienceId||'alguien_especial',categoryId:'cotidiano',mode:'background-photo'};chooseDefaults();app.step=3;navigate('create')};
  $('[data-create]',el).onclick=()=>{app.step=1;navigate('create')};
  $('[data-settings]',el).onclick=()=>navigate('settings');
}
function bindMessageCardsForFavorites(root){
  $$('[data-message]',root).forEach(card=>card.onclick=e=>{if(e.target.closest('[data-favorite]'))return;const m=messageById(card.dataset.message);app.selection={...defaultSelection,audienceId:(m.audiences[0]==='todos'?'alguien_especial':m.audiences[0]),categoryId:m.category,messageId:m.id,customTitle:m.title,customText:m.message};chooseDefaults();app.step=4;save();navigate('create')});
  $$('[data-favorite]',root).forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFavorite(b.dataset.favorite);renderFavorites(root)});
}
function renderSettings(el){
  el.innerHTML=`<div class="screen-head"><div class="eyebrow">Configuración local</div><h1>Tu espacio en Tarjeticas</h1><p>La firma, favoritos, composiciones recientes y preferencias permanecen en este navegador.</p></div>
    <section class="settings-card"><h2>Firma</h2><div class="field"><span>Nombre o apodo</span><input id="settingsName" maxlength="42" value="${escapeHTML(app.profile.name)}"></div><button class="button primary" data-save-profile>Guardar firma</button></section>
    <section class="settings-card"><h2>Aplicación instalada</h2><p>${isStandalone()?'Tarjeticas está abierta como PWA instalada.':'Tarjeticas se está usando desde el navegador. El botón Instalar permanece visible cuando la app no está instalada.'}</p><div class="hero-actions">${!isStandalone()?'<button class="button secondary" data-settings-install>Instalar aplicación</button>':''}<button class="button secondary" data-check-update>${app.updateReady?'Actualizar app':'Buscar actualización'}</button></div><p class="helper-note">El botón superior <strong>Actualizar app</strong> queda siempre visible cuando el navegador soporta la PWA.</p></section>
    <section class="settings-card"><h2>Copia de seguridad</h2><p>Exporta firma, favoritos, historial y recetas visuales. Las fotografías personales no se incluyen.</p><div class="hero-actions"><button class="button primary" data-export-backup>Exportar JSON</button><label class="button secondary" for="backupInput">Importar JSON</label><input id="backupInput" type="file" accept="application/json,.json" hidden></div></section>
    <section class="settings-card"><h2>Banco utilizado en esta versión</h2><p><strong>${ASSET_PACK.totals.totalMain} assets PNG</strong>: ${ASSET_PACK.totals.backgrounds} fondos, ${ASSET_PACK.totals.frames} marcos, ${ASSET_PACK.totals.illustrations} ilustraciones y ${ASSET_PACK.totals.photoTemplates} plantillas con foto.</p><p>Incluye marcos barroco, traga, cumpleaños y ruptura; imagen vertical de fondo; collages de 2 a 6 fotos; y ${PHRASES.messages.length} mensajes originales, sin duplicaciones editoriales.</p></section>
    <section class="settings-card"><h2>Privacidad</h2><p>Las fotos se procesan en el navegador y no se integran al respaldo. Puedes borrar todos los datos locales cuando lo decidas.</p></section>
    <section class="settings-card"><h2>Reiniciar</h2><p>Elimina preferencias, favoritos, historial y composiciones recientes.</p><button class="button secondary" data-reset>Restablecer datos</button></section>`;
  $('[data-save-profile]',el).onclick=()=>{app.profile.name=$('#settingsName',el).value.trim();app.profile.initialized=true;save();toast('Firma guardada');renderAll()};
  $('[data-settings-install]',el)?.addEventListener('click',()=>$('#installBtn').click());
  $('[data-check-update]',el).onclick=()=>$('#updateBtn').click();
  $('[data-export-backup]',el).onclick=exportBackup;
  $('#backupInput',el).onchange=importBackup;
  $('[data-reset]',el).onclick=()=>{if(confirm('¿Eliminar preferencias, favoritos, historial y composiciones recientes?')){Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));location.reload()}};
}
function exportBackup(){
  const payload={schemaVersion:'1.0',app:'Tarjeticas',appVersion:APP_VERSION,exportedAt:new Date().toISOString(),profile:app.profile,favorites:[...app.favorites],shared:app.shared,recipes:app.recipes};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});triggerBlobDownload(blob,`tarjeticas-respaldo-${new Date().toISOString().slice(0,10)}.json`);toast('Respaldo exportado')
}
function importBackup(event){
  const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(data.app!=='Tarjeticas')throw new Error('Archivo no compatible');app.profile={...app.profile,...(data.profile||{})};app.favorites=new Set(Array.isArray(data.favorites)?data.favorites:[]);app.shared=data.shared&&typeof data.shared==='object'?data.shared:{};app.recipes=Array.isArray(data.recipes)?data.recipes.slice(0,24):[];save();toast('Respaldo importado');renderAll()}catch(error){console.error(error);toast('El archivo no es un respaldo válido')}};reader.readAsText(file);event.target.value=''
}

function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
async function buildCanvas(){
  const portrait=app.selection.mode==='background-photo';
  const canvas=document.createElement('canvas');canvas.width=portrait?1080:1280;canvas.height=portrait?1920:800;const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';
  if(app.selection.mode==='photo')await drawPhotoCard(ctx);
  else if(portrait)await drawBackgroundPhotoCard(ctx,canvas.width,canvas.height);
  else await drawIllustratedCard(ctx);
  return canvas;
}
async function drawIllustratedCard(ctx){
  const bg=assetById(app.selection.backgroundId),frame=assetById(app.selection.frameId),ill=assetById(app.selection.illustrationId);
  if(bg)ctx.drawImage(await loadImage(assetUrl(bg)),0,0,1280,800);else{ctx.fillStyle='#fff5ef';ctx.fillRect(0,0,1280,800)}
  if(ill){const img=await loadImage(assetUrl(ill));ctx.drawImage(img,470,48,340,340)}
  roundRect(ctx,98,425,1084,282,32,'rgba(255,250,246,.88)');
  drawCardText(ctx,{x:142,y:457,width:996,height:210});
  if(frame)ctx.drawImage(await loadImage(assetUrl(frame)),0,0,1280,800);
  drawMeta(ctx,1280,800,'illustrated');
}
async function drawPhotoCard(ctx){
  const tpl=assetById(app.selection.photoTemplateId);if(tpl)ctx.drawImage(await loadImage(assetUrl(tpl)),0,0,1280,800);else{ctx.fillStyle='#fff3e0';ctx.fillRect(0,0,1280,800)}
  const slots=await ensureTemplateSlots();
  const urls=selectedPhotoUrls();
  if(urls.length&&slots?.photos){for(let i=0;i<slots.photos.length;i++){if(!urls[i])continue;const img=await loadImage(urls[i]);drawCover(ctx,img,slots.photos[i])}}
  if(slots?.text)drawCardText(ctx,{...slots.text,padding:Math.min(24,Math.max(8,slots.text.width*.055))},true);else drawCardText(ctx,{x:220,y:620,width:840,height:125},true);
  drawMeta(ctx,1280,800,'photo');
}
async function drawBackgroundPhotoCard(ctx,width,height){
  ctx.fillStyle='#261f22';ctx.fillRect(0,0,width,height);
  if(app.selection.backgroundPhotoDataUrl){const img=await loadImage(app.selection.backgroundPhotoDataUrl);drawImageCover(ctx,img,0,0,width,height)}
  const ill=assetById(app.selection.illustrationId);if(ill){const img=await loadImage(assetUrl(ill));const iw=520,ih=520;ctx.drawImage(img,(width-iw)/2,300,iw,ih)}
  roundRect(ctx,90,1260,width-180,470,42,'rgba(255,250,246,.82)');
  drawPortraitText(ctx,{x:130,y:1310,width:width-260,height:365});
  const frame=assetById(app.selection.frameId);if(frame){const img=await loadImage(assetUrl(frame));drawNineSliceFrame(ctx,img,width,height,frameFamily(frame))}
  drawMeta(ctx,width,height,'background-photo');
}
function drawImageCover(ctx,img,x,y,w,h){const scale=Math.max(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function drawNineSliceFrame(ctx,img,dw,dh,family='default'){
  const slices={barroco:150,traga:100,cumpleanos:115,ruptura:110,vintage:115,romantico:105,'infantil-tierno':105,elegante:100,clasico:95,minimalista:85};
  const s=Math.min(slices[family]||100,Math.floor(img.width/3),Math.floor(img.height/3));
  const d=Math.round(dw*(family==='barroco'?.13:.095));
  const sw=img.width,sh=img.height;
  const parts=[
    [0,0,s,s,0,0,d,d],[sw-s,0,s,s,dw-d,0,d,d],[0,sh-s,s,s,0,dh-d,d,d],[sw-s,sh-s,s,s,dw-d,dh-d,d,d],
    [s,0,sw-2*s,s,d,0,dw-2*d,d],[s,sh-s,sw-2*s,s,d,dh-d,dw-2*d,d],
    [0,s,s,sh-2*s,0,d,d,dh-2*d],[sw-s,s,s,sh-2*s,dw-d,d,d,dh-2*d]
  ];
  for(const p of parts)ctx.drawImage(img,...p);
}
function drawPortraitText(ctx,box){
  const width=box.width;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#6f2f45';ctx.font='700 62px Georgia';const titleY=box.y+70;ctx.fillText(trimCanvasText(ctx,app.selection.customTitle||'Un mensaje para ti',width),box.x+width/2,titleY);
  ctx.fillStyle='#3f2b2f';ctx.font='500 39px Arial';wrapCanvasText(ctx,app.selection.customText,box.x+width/2,titleY+75,width,54,5);
}
function drawCover(ctx,img,slot){
  ctx.save();ctx.beginPath();if(slot.shape==='circle'){ctx.arc(slot.x+slot.width/2,slot.y+slot.height/2,slot.width/2,0,Math.PI*2)}else roundedPath(ctx,slot.x,slot.y,slot.width,slot.height,slot.rx||8);ctx.clip();
  const scale=Math.max(slot.width/img.width,slot.height/img.height),w=img.width*scale,h=img.height*scale;ctx.drawImage(img,slot.x+(slot.width-w)/2,slot.y+(slot.height-h)/2,w,h);ctx.restore();
}
function drawCardText(ctx,box,compact=false){
  const pad=box.padding||28,width=Math.max(60,box.width-pad*2);ctx.textAlign='center';ctx.textBaseline='alphabetic';
  const titleSize=Math.max(14,Math.min(compact?30:43,box.width/10.5,box.height*.28));ctx.fillStyle='#6f2f45';ctx.font=`700 ${titleSize}px Georgia`;const title=app.selection.customTitle||'Un mensaje para ti';const titleY=box.y+pad+titleSize*.82;ctx.fillText(trimCanvasText(ctx,title,width),box.x+box.width/2,titleY);
  const bodySize=Math.max(12,Math.min(compact?24:29,box.width/17,box.height*.19));ctx.fillStyle='#3f2b2f';ctx.font=`500 ${bodySize}px Arial`;const lineHeight=bodySize*1.28,startY=titleY+lineHeight;const maxLines=Math.max(1,Math.floor((box.y+box.height-pad-startY)/lineHeight)+1);wrapCanvasText(ctx,app.selection.customText,box.x+box.width/2,startY,width,lineHeight,maxLines);
}
function trimCanvasText(ctx,text,width){let t=String(text||'');if(ctx.measureText(t).width<=width)return t;while(t.length&&ctx.measureText(t+'…').width>width)t=t.slice(0,-1);return t+'…'}
function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight,maxLines=5){const words=String(text||'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=trimCanvasText(ctx,lines[maxLines-1],maxWidth)}lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight))}

function drawMeta(ctx,width=1280,height=800,mode=app.selection.mode){
  const rawLeft=app.selection.recipientName?`Para: ${app.selection.recipientName}`:'';
  const rawRight=app.profile.name?`De: ${app.profile.name}`:'';
  if(!rawLeft&&!rawRight)return;
  const z=metaSafeZone(mode),fontSize=mode==='background-photo'?29:22;
  const y=height*z.top/100,leftX=width*z.left/100,rightX=width*(1-z.right/100),maxWidth=width*.36;
  ctx.save();ctx.font=`700 ${fontSize}px Arial`;ctx.textBaseline='alphabetic';
  const leftLabel=trimCanvasText(ctx,rawLeft,maxWidth),rightLabel=trimCanvasText(ctx,rawRight,maxWidth);
  if(leftLabel){const padX=18,w=Math.min(maxWidth,ctx.measureText(leftLabel).width+padX*2);roundRect(ctx,leftX-10,y-fontSize-11,w,fontSize+22,15,'rgba(255,250,246,.88)');ctx.fillStyle='#6f2f45';ctx.textAlign='left';ctx.fillText(leftLabel,leftX,y)}
  if(rightLabel){const padX=18,w=Math.min(maxWidth,ctx.measureText(rightLabel).width+padX*2);roundRect(ctx,rightX-w+10,y-fontSize-11,w,fontSize+22,15,'rgba(255,250,246,.88)');ctx.fillStyle='#6f2f45';ctx.textAlign='right';ctx.fillText(rightLabel,rightX,y)}
  ctx.restore();
}

function roundedPath(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr)}
function roundRect(ctx,x,y,w,h,r,fill){ctx.beginPath();roundedPath(ctx,x,y,w,h,r);ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
async function cardBlob(){const canvas=await buildCanvas();return new Promise(resolve=>canvas.toBlob(resolve,'image/png',.96))}
function filename(){const c=app.selection.categoryId||'mensaje';return `tarjetica-${c}-${Date.now()}.png`}
function triggerBlobDownload(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function downloadCard(button){
  if(app.busy)return;setBusy(true);const old=button.textContent;button.textContent='Preparando…';try{const blob=await cardBlob();triggerBlobDownload(blob,filename());recordShare('download');toast('Imagen guardada')}catch(e){console.error(e);toast('No fue posible crear la imagen')}finally{button.textContent=old;setBusy(false)}
}
async function shareCard(button){
  if(app.busy)return;setBusy(true);const old=button.textContent;button.textContent='Preparando…';try{const blob=await cardBlob();const file=new File([blob],filename(),{type:'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({files:[file]});recordShare('native-file');toast('Tarjetica compartida')}else{await openShareFallback(blob,file);recordShare('desktop-fallback')}}catch(e){if(e?.name!=='AbortError'){console.error(e);toast('No fue posible compartir')}}finally{button.textContent=old;setBusy(false)}
}
async function openShareFallback(blob,file){
  const dialog=$('#shareDialog');
  if(!dialog){triggerBlobDownload(blob,file.name);toast('La imagen quedó en Descargas');return}
  const url=URL.createObjectURL(blob);
  $('#shareFallbackPreview').src=url;
  $('#shareFallbackInfo').textContent=`${file.name} · ${Math.round(blob.size/1024)} KB`;
  const copyBtn=$('#shareFallbackCopy');
  const downloadBtn=$('#shareFallbackDownload');
  copyBtn.hidden=!(navigator.clipboard&&window.ClipboardItem);
  downloadBtn.onclick=()=>{triggerBlobDownload(blob,file.name);toast('Imagen lista en Descargas')};
  copyBtn.onclick=async()=>{try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('Imagen copiada al portapapeles')}catch(err){console.error(err);toast('No fue posible copiar la imagen')}};
  const cleanup=()=>{URL.revokeObjectURL(url);dialog.removeEventListener('close',cleanup)};
  dialog.addEventListener('close',cleanup);
  dialog.showModal();
}
function recordShare(method){const id=app.selection.messageId||`custom-${app.selection.categoryId}`;const prev=app.shared[id]||{count:0};app.shared[id]={count:prev.count+1,lastAt:new Date().toISOString(),method};saveRecipe(method);save()}

init();

let cards=[], dossiers=[], historicalLayers=[], guideMessages=[], collections=[], taxonomy={stages:[],navigationStages:[],editorialPeriods:[],fields:[],visualFamilies:[],disciplines:[],disciplinaryRelationTypes:[]}, disciplineIndex={disciplines:[],relationTypes:[],cards:{},manualReviewCardIds:[]}, snapshot={};
let currentIndex=0, currentView='intro', viewHistory=[], availableVoices=[], deferredPrompt=null, waitingWorker=null;
let exploreTab='history', exploreSelection=[], exploreFieldId='', explorePeriodId='', exploreSearchResultIds=[], exploreSearchQuery='', rhizomeCenterId='', rhizomeMode='card', rhizomeAuthorName='';
let selectedDisciplineIds=[], activeDisciplineId='', disciplineCrossMode=false, disciplineResultIds=[], disciplineFilters={period:'',territory:'',author:'',tradition:'',relationType:''};
let interestDraft=[];
let pendingListenMode='continue', interestReturnView='';
let playback={active:false,utterance:null,token:0,sessionSeconds:0,advanceTimer:null,watchdog:null,keepAlive:null,expectedCardId:'',retryCount:0,lastBoundaryAt:0};

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const views=['intro','home','duration','ready','explore','favorites','routes','card','rhizome','quiz'];
const viewTitles={intro:'Cartografías del Pensamiento',home:'¿Qué quieres hacer hoy?',duration:'Duración',ready:'Listo para escuchar',explore:'Explorar el corpus',favorites:'Favoritas y afinidades',routes:'Recorridos recientes',card:'Escuchar',rhizome:'Mapa de conexiones',quiz:'Quiz'};
const SPEEDS=[.8,1,1.5,1.8,2];
const SESSION_OPTIONS=[5,10,15,30,0];
const PLAY_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"></path></svg><span class="sr-only">Reproducir</span>';
const PAUSE_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"></path></svg><span class="sr-only">Pausar</span>';
const mechanicalPattern=/(esta tarjeta|para comprender esta tarjeta|aborda una pregunta precisa|la tarjeta gana precisión|al incorporarla al mapa|para no deformar la idea|acorde al texto|conviene conservar una cautela|la distinción final)/i;

let state={};
try{state=JSON.parse(localStorage.getItem('cartografiasState')||'{}')}catch(e){state={}}
state={
  seen:[],favorites:[],quiz:0,last:0,guideSeen:{},voiceURI:'',rate:1,sessionMinutes:0,
  interestProfile:{completed:false,selections:[]},activeRoute:null,recentRoutes:[],lastCardId:'',
  ...state
};
if(!state.guideSeen)state.guideSeen={};
if(!state.interestProfile)state.interestProfile={completed:false,selections:[]};
if(!Array.isArray(state.recentRoutes))state.recentRoutes=[];

const cardMap=()=>new Map(cards.map(c=>[c.id,c]));
const dossierMap=()=>new Map(dossiers.map(d=>[d.id,d]));
const historicalMap=()=>new Map(historicalLayers.map(h=>[h.id,h]));
const collectionMap=()=>new Map(collections.map(c=>[c.id,c]));
const stageMap=()=>new Map((taxonomy.stages||[]).map(x=>[x.id,x]));
const fieldMap=()=>new Map((taxonomy.fields||[]).map(x=>[x.id,x]));
const editorialPeriodMap=()=>new Map((taxonomy.editorialPeriods||[]).map(x=>[x.id,x]));
const visualFamilyMap=()=>new Map((taxonomy.visualFamilies||[]).map(x=>[x.id,x]));
const disciplineMap=()=>new Map((disciplineIndex.disciplines||taxonomy.disciplines||[]).map(x=>[x.id,x]));
const disciplineRelationTypeMap=()=>new Map((disciplineIndex.relationTypes||taxonomy.disciplinaryRelationTypes||[]).map(x=>[x.id,x.label]));

function bindOptional(selector,event,handler){const el=$(selector);if(el)el.addEventListener(event,handler);return el}

function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function escapeAttr(s){return escapeHtml(s)}
function slug(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)}
function shuffle(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function unique(list){return [...new Set(list)]}
function routeId(type){return `${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add('hidden'),3300)}
function isStandalone(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}

function activeDeck(){
  const ids=state.activeRoute?.order||[];const byId=cardMap();
  const deck=ids.map(id=>byId.get(id)).filter(Boolean);
  return deck.length?deck:chronologicalDeck();
}
function chronologicalDeck(source=cards){
  const periodOrder=new Map((taxonomy.editorialPeriods||[]).map((s,i)=>[s.id,i]));
  const roleWeight=c=>c.chronologyRole==='period_portal'?0:c.chronologyRole==='transversal_context'?2:1;
  return [...source].sort((a,b)=>(periodOrder.get(a.editorialPeriodId)??99)-(periodOrder.get(b.editorialPeriodId)??99)||roleWeight(a)-roleWeight(b)||(a.chronologyRank??9999)-(b.chronologyRank??9999)||(a.collectionSequence??a.order??0)-(b.collectionSequence??b.order??0)||a.author.localeCompare(b.author,'es'));
}
function deckPosition(card=cards[currentIndex]){const deck=activeDeck();return {deck,pos:Math.max(0,deck.findIndex(c=>c.id===card?.id))}}
function ensureCurrentInDeck(){
  const deck=activeDeck();if(!deck.length)return [];
  let id=state.activeRoute?.currentCardId||state.lastCardId;
  let pos=deck.findIndex(c=>c.id===id);
  if(pos<0)pos=Math.min(Number(state.activeRoute?.position||0),deck.length-1);
  currentIndex=cards.findIndex(c=>c.id===deck[Math.max(0,pos)].id);
  return deck;
}
function routeSnapshot(route=state.activeRoute){return route?JSON.parse(JSON.stringify(route)):null}
function save(){
  state.last=currentIndex;state.lastCardId=cards[currentIndex]?.id||state.lastCardId;
  if(state.activeRoute){
    const {deck,pos}=deckPosition();state.activeRoute.position=pos;state.activeRoute.currentCardId=deck[pos]?.id||state.activeRoute.currentCardId;
    const i=state.recentRoutes.findIndex(r=>r.id===state.activeRoute.id);
    if(i>=0)state.recentRoutes[i]=routeSnapshot();
  }
  state.recentRoutes=state.recentRoutes.slice(0,3);
  try{localStorage.setItem('cartografiasState',JSON.stringify(state))}catch(e){}
  updateHomeSummary();renderSessionControls();
}
function makeRoute(type,label,ids,meta={}){
  const clean=unique(ids).filter(id=>cardMap().has(id));
  return {id:routeId(type),type,label,order:clean,position:0,currentCardId:clean[0]||'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),meta};
}
function rememberRoute(route){
  state.recentRoutes=[routeSnapshot(route),...state.recentRoutes.filter(r=>r.id!==route.id&&!(r.type===route.type&&r.label===route.label))].slice(0,3);
}
function startRoute(route,{autoplay=true,startId='',preserveSession=false}={}){
  if(!route?.order?.length){toast('No hay ideas disponibles para este recorrido');return}
  stopPlayback(false);state.activeRoute=route;
  const startPos=Math.max(0,route.order.indexOf(startId));state.activeRoute.position=startPos;state.activeRoute.currentCardId=route.order[startPos];
  currentIndex=cards.findIndex(c=>c.id===state.activeRoute.currentCardId);
  if(!preserveSession)playback.sessionSeconds=0;
  rememberRoute(state.activeRoute);save();nav('card');
  if(autoplay)setTimeout(()=>{if(!playback.active)togglePlayback()},280);
}
function startContinue(){
  if(!state.activeRoute?.order?.length){startChronological();return}
  playback.sessionSeconds=0;ensureCurrentInDeck();nav('card');setTimeout(()=>{if(!playback.active)togglePlayback()},250);
}
function resumeRoute(id){const r=state.recentRoutes.find(x=>x.id===id);if(!r)return;state.activeRoute=routeSnapshot(r);ensureCurrentInDeck();playback.sessionSeconds=0;save();nav('card');setTimeout(()=>togglePlayback(),260)}

function nav(view,{push=true}={}){
  if(!views.includes(view))view='home';if(view!=='card')stopPlayback(false);
  if(push&&view!==currentView)viewHistory.push(currentView);currentView=view;
  document.body.classList.toggle('card-view',view==='card');
  views.forEach(v=>$('#view-'+v)?.classList.toggle('hidden',v!==view));
  $('#cardControls')?.classList.toggle('hidden',view!=='card');closeDrawer();
  if(view==='home'||view==='duration'||view==='ready')updateHomeSummary();
  if(view==='duration')renderDurationStep();if(view==='ready')renderReadyStep();if(view==='explore')renderExplore();if(view==='favorites')renderFavorites();if(view==='routes')renderRoutes();if(view==='card')renderCard();if(view==='rhizome')renderRhizome();if(view==='quiz')renderQuiz();
  updateNavigationUI();scrollTo(0,0);
}
function goBack(){stopPlayback(false);nav(viewHistory.pop()||'home',{push:false})}
function updateNavigationUI(){
  $('#backBtn')?.classList.toggle('hidden',['intro','home'].includes(currentView)||viewHistory.length===0);
  if($('#topbarTitle'))$('#topbarTitle').textContent=viewTitles[currentView]||'Cartografías del Pensamiento';
}

const LISTEN_MODE_META={
  continue:{label:'Continuar',description:'Retoma exactamente el último recorrido.'},
  chronological:{label:'Recorrido cronológico',description:'Desde las primeras huellas hasta el presente.'},
  mixed:{label:'De todo un poco',description:'Azar diverso entre épocas, territorios y autores.'},
  personalized:{label:'Para ti',description:'Una ruta orientada por tu brújula de intereses.'},
  surprise:{label:'Sorpresa',description:'Una ruta inesperada construida con criterio.'}
};
function pendingModeMeta(){
  if(pendingListenMode==='continue'&&state.activeRoute?.label)return {label:`Continuar · ${state.activeRoute.label}`,description:`Idea ${(state.activeRoute.position||0)+1} de ${state.activeRoute.order?.length||0}`};
  return LISTEN_MODE_META[pendingListenMode]||LISTEN_MODE_META.chronological;
}
function chooseListenMode(mode){
  if(!LISTEN_MODE_META[mode])mode='chronological';pendingListenMode=mode;
  if(mode==='personalized'&&!(state.interestProfile?.selections||[]).length){interestReturnView='duration';openInterestSurvey();toast('Elige algunos intereses para preparar esta ruta');return}
  nav('duration');
}
function renderDurationStep(){
  const meta=pendingModeMeta();const label=$('#durationModeLabel');if(label)label.textContent=meta.label;renderSessionControls();
}
function renderReadyStep(){
  const meta=pendingModeMeta();if($('#readyModeTitle'))$('#readyModeTitle').textContent=meta.label;if($('#readySessionTitle'))$('#readySessionTitle').textContent=state.sessionMinutes?`${state.sessionMinutes} minutos`:'Tiempo abierto · sin límite';
}
function launchPendingMode(){
  if(pendingListenMode==='continue'){startContinue();return}
  if(pendingListenMode==='chronological'){startChronological();return}
  if(pendingListenMode==='mixed'){startMixedMode();return}
  if(pendingListenMode==='personalized'){startPersonalized();return}
  if(pendingListenMode==='surprise'){startSurprise();return}
  startChronological();
}

function setPlaybackUI(isPlaying){
  const btn=$('#speakBtn');if(!btn)return;btn.innerHTML=isPlaying?PAUSE_ICON:PLAY_ICON;btn.setAttribute('aria-label',isPlaying?'Pausar recorrido':'Iniciar recorrido');btn.setAttribute('aria-pressed',String(isPlaying));$('#cardControls')?.classList.toggle('playing',isPlaying);
}
function clearPlaybackTimers(){clearTimeout(playback.advanceTimer);clearTimeout(playback.watchdog);clearInterval(playback.keepAlive);playback.advanceTimer=null;playback.watchdog=null;playback.keepAlive=null}
function stopPlayback(showToast=false){playback.active=false;playback.token++;playback.expectedCardId='';playback.retryCount=0;clearPlaybackTimers();if('speechSynthesis'in window)speechSynthesis.cancel();setPlaybackUI(false);if(showToast)toast('Recorrido en pausa')}
function normalizeRate(value){const n=Number(value);return SPEEDS.reduce((best,x)=>Math.abs(x-n)<Math.abs(best-n)?x:best,1)}
function formatRate(value){const n=normalizeRate(value);return `${Number.isInteger(n)?n:n.toFixed(1)}×`}
function estimateSeconds(text){const words=String(text||'').trim().split(/\s+/).filter(Boolean).length;return Math.max(18,(words/150)*60/normalizeRate(state.rate||1))}
function sessionLimitSeconds(){return Number(state.sessionMinutes||0)*60}
function sessionLabel(){return state.sessionMinutes?`${state.sessionMinutes} min`:'Sin límite'}
function updatePlayerSession(){
  const el=$('#playerSessionStatus');if(!el)return;const limit=sessionLimitSeconds();
  if(!limit){el.textContent='Sesión sin límite';return}
  const remaining=Math.max(0,Math.ceil((limit-playback.sessionSeconds)/60));el.textContent=remaining?`Aprox. ${remaining} min disponibles`:'La sesión finalizará al terminar esta idea';
}
function setSessionMinutes(value,notify=true){state.sessionMinutes=SESSION_OPTIONS.includes(Number(value))?Number(value):0;save();if(notify)toast(`Duración: ${sessionLabel()}`)}
function renderSessionControls(){
  const host=$('#sessionChips');if(host){host.innerHTML=SESSION_OPTIONS.map(v=>`<button type="button" role="radio" aria-checked="${state.sessionMinutes===v}" class="${state.sessionMinutes===v?'active':''}" data-session-go="${v}">${v?`${v} m`:'<span class="infinity-mark" aria-hidden="true">∞</span><span class="sr-only">Sin límite</span>'}</button>`).join('');}
  if($('#drawerSessionSelect'))$('#drawerSessionSelect').value=String(state.sessionMinutes||0);updatePlayerSession();
}

function stageLabel(id){return stageMap().get(id)?.label||id}
function fieldLabel(id){return fieldMap().get(id)?.label||id}
function editorialPeriodLabel(id){return editorialPeriodMap().get(id)?.label||id}
function editorialPeriodShort(id){return editorialPeriodMap().get(id)?.short||id}
function visualFamilyLabel(id){return visualFamilyMap().get(id)?.label||id}
function collectionLabel(id){return collectionMap().get(id)?.short||id}
function safeUrl(url){try{const u=new URL(url,location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch(e){return''}}
function connectionCards(c){
  const by=cardMap();const ids=(c.connectionIds||[]).map(id=>by.get(id)).filter(Boolean);
  const fallback=cards.filter(x=>x.id!==c.id&&x.fields?.some(f=>c.fields?.includes(f))).filter(x=>!ids.some(i=>i.id===x.id));
  return [...ids,...fallback].slice(0,8);
}
function renderCard(){
  if(!cards.length)return;const deck=ensureCurrentInDeck();const c=cards[currentIndex],d=dossierMap().get(c.id)||{};const pos=Math.max(0,deck.findIndex(x=>x.id===c.id));
  if(!state.seen.includes(c.id))state.seen.push(c.id);state.lastCardId=c.id;if(state.activeRoute){state.activeRoute.position=pos;state.activeRoute.currentCardId=c.id;state.activeRoute.updatedAt=new Date().toISOString()}
  $('#cardFamily').textContent=(c.fields||[]).map(fieldLabel).slice(0,2).join(' · ')||c.family;
  $('#routeTitle').textContent=state.activeRoute?.label||c.title;$('#cardPosition').textContent=`${pos+1} de ${deck.length} · ${editorialPeriodShort(c.editorialPeriodId)||stageMap().get(c.chronologyStageId)?.short||collectionLabel(c.collectionId)}`;
  $('#cardIndex').textContent=`Tarjeta ${String(pos+1).padStart(2,'0')} · ${c.evidence}`;$('#cardAuthor').textContent=c.author;$('#cardTitle').textContent=c.title;$('#cardStatement').textContent=c.statement;
  $('#cardTags').innerHTML=(c.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('');$('#cardTerritory').textContent=c.territory;$('#cardPeriod').textContent=c.period;$('#cardEvidenceMini').textContent=c.evidence;$('#cardQuestionMini').textContent=c.question;$('#cardWhyMini').textContent=c.whyItMatters||d.whyItMatters||'';$('#cardSymbol').textContent=c.symbol||'◎';
  $('#thoughtCard').style.setProperty('--card-a',c.visual?.palette?.[0]||'#102a45');$('#thoughtCard').style.setProperty('--card-b',c.visual?.palette?.[1]||'#193e62');$('#thoughtCard').style.setProperty('--card-c',c.visual?.palette?.[2]||'#8a672f');
  $('#cardQuestion').textContent=d.guidingQuestion||c.question;$('#cardCore').textContent=d.documentedCore||c.statement;$('#cardWhy').textContent=d.whyItMatters||c.whyItMatters||'';$('#cardCaution').textContent=d.editorialCaution||c.caution;
  $('#cardConnections').innerHTML=connectionCards(c).slice(0,6).map(x=>`<button class="connection" data-center-connection="${escapeAttr(x.id)}">${escapeHtml(x.author)} · ${escapeHtml(x.title)}</button>`).join('')||'<span class="connection">Red en construcción</span>';
  $('#audioIdentity').textContent=`${c.author} · ${c.title}`;$('#cardAudio').textContent=d.audioScript||c.audio;$('#cardEvidence').textContent=c.evidence;$('#dossierSeries').textContent='Edición revisada';
  if($('#cardEntryType'))$('#cardEntryType').textContent=String(c.entryType||'').replaceAll('_',' ');
  if($('#cardEditorialPeriod'))$('#cardEditorialPeriod').textContent=editorialPeriodLabel(c.editorialPeriodId);
  if($('#cardVisualFamily'))$('#cardVisualFamily').textContent=visualFamilyLabel(c.visualFamilyId);
  if($('#cardDatePrecision'))$('#cardDatePrecision').textContent=c.datePrecision||'—';
  if($('#cardEvidenceNature'))$('#cardEvidenceNature').textContent=(c.evidenceNature||[]).map(x=>String(x).replaceAll('_',' ')).join(' · ');
  if($('#cardReviewState'))$('#cardReviewState').textContent=c.reviewStatus?.sources==='explicit'?'Fuentes enlazadas':c.reviewStatus?.sources==='anchor_only_requires_completion'?'Anclas bibliográficas por completar':'Revisión requerida';
  if($('#cardSourceList'))$('#cardSourceList').innerHTML=(c.sourcesNormalized||[]).map(src=>{const u=safeUrl(src.url);return `<li>${u?`<a href="${escapeAttr(u)}" target="_blank" rel="noopener noreferrer">${escapeHtml(src.title)}</a>`:escapeHtml(src.title)}<small>${escapeHtml(String(src.sourceType||'').replaceAll('_',' '))}${src.url?'':' · referencia sin enlace'}</small></li>`}).join('')||'<li>Fuentes en revisión editorial</li>';
  renderHistorical(c.id);const fav=state.favorites.includes(c.id);$('#favBtn').classList.toggle('active',fav);$('#favBtn').setAttribute('aria-pressed',String(fav));
  $('#playerNowAuthor').textContent=c.author;$('#playerNowTitle').textContent=`${c.title} · ${pos+1}/${deck.length}`;updatePlayerSession();save();
}
function renderHistorical(id){
  const h=historicalMap().get(id),layer=$('#historicalLayer');if(!h){$('#historicalStatus').textContent='Pendiente';layer.classList.add('hidden');return}
  $('#historicalStatus').textContent='Disponible';$('#historicalContext').textContent=h.historicalContext||'';$('#historicalDevelopment').textContent=h.historicalDevelopment||'';
  $('#historicalMilestones').innerHTML=(h.milestones||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('');$('#historicalConcepts').innerHTML=(h.conceptualSections||[]).map(x=>`<article class="historical-concept"><strong>${escapeHtml(x.title)}</strong><p>${escapeHtml(x.text)}</p></article>`).join('');$('#historicalLegacy').innerHTML=(h.legacy||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('');$('#historicalWorks').innerHTML=(h.anchorWorks||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  $('#historicalProvenance').textContent=`${h.provenance?.source||'Capa editorial'}. ${h.provenance?.coverage||''}${h.sha256?' · Integridad '+h.sha256.slice(0,12)+'…':''}`;
}
function toggleHistorical(){const layer=$('#historicalLayer'),open=layer.classList.contains('hidden');layer.classList.toggle('hidden',!open);$('#historicalToggle').setAttribute('aria-expanded',String(open));$('#historicalToggle span').textContent=open?'⌛ Cerrar historia ampliada':'⌛ Historia ampliada'}

function startChronological(){startRoute(makeRoute('chronological','Recorrido cronológico',chronologicalDeck().map(c=>c.id),{scope:'corpus completo'}))}
function buildMixedOrder(){
  const unseen=new Set(cards.filter(c=>!state.seen.includes(c.id)).map(c=>c.id));let pool=shuffle(cards);const result=[];let last=null;
  while(pool.length){
    const candidates=pool.filter(c=>!last||c.author!==last.author&&c.collectionId!==last.collectionId&&c.chronologyStageId!==last.chronologyStageId);
    const preferred=(candidates.length?candidates:pool).filter(c=>unseen.has(c.id));const source=preferred.length?preferred:(candidates.length?candidates:pool);
    const c=source[Math.floor(Math.random()*source.length)];result.push(c.id);pool=pool.filter(x=>x.id!==c.id);last=c;
  }
  return result;
}
function startMixedMode(){startRoute(makeRoute('mixed','De todo un poco',buildMixedOrder(),{strategy:'azar diverso por periodos, territorios, autores y colecciones'}));toast('Ruta diversa creada: evita repeticiones inmediatas de época, autor y colección')}
function interestScore(c){
  const selections=state.interestProfile?.selections||[];let score=0;
  selections.forEach((s,i)=>{const weight=Math.max(2,10-i);if(s.type==='stage'&&c.chronologyStageId===s.id)score+=weight;if(s.type==='field'&&c.fields?.includes(s.id))score+=weight});
  if(!state.seen.includes(c.id))score+=3;if(c.evidence?.startsWith('A'))score+=1;return score;
}
function diverseRanked(source,scoreFn,count=80){
  let pool=[...source].map(c=>({c,score:scoreFn(c)+Math.random()*1.5})).sort((a,b)=>b.score-a.score);const out=[];let last=[];
  while(pool.length&&out.length<count){
    let idx=pool.findIndex(x=>!last.some(y=>y.author===x.c.author)&&!last.slice(-1).some(y=>y.chronologyStageId===x.c.chronologyStageId));if(idx<0)idx=0;
    const [picked]=pool.splice(idx,1);out.push(picked.c.id);last=[...last.slice(-2),picked.c];
  }
  return out;
}
function startPersonalized(){
  if(!(state.interestProfile?.selections||[]).length){openInterestSurvey();toast('Elige algunos intereses para construir esta ruta');return}
  const ids=diverseRanked(cards,interestScore,100);startRoute(makeRoute('personalized','Para ti',ids,{interests:state.interestProfile.selections}));
}
function similarityScore(c,basis){
  const fields=new Set(basis.flatMap(x=>x.fields||[])),tags=new Set(basis.flatMap(x=>x.tags||[])),cols=new Set(basis.map(x=>x.collectionId));let s=0;
  (c.fields||[]).forEach(x=>{if(fields.has(x))s+=4});(c.tags||[]).forEach(x=>{if(tags.has(x))s+=2});if(cols.has(c.collectionId))s+=1;if(!state.seen.includes(c.id))s+=3;return s;
}
function buildIntroRoute(){
  const ids=[];for(const s of taxonomy.stages||[]){const group=chronologicalDeck(cards.filter(c=>c.chronologyStageId===s.id&&!/portal/i.test(c.cardType||'')));if(group[0])ids.push(group[0].id);if(group[Math.floor(group.length/2)])ids.push(group[Math.floor(group.length/2)].id)}return unique(ids);
}
function startSurprise(){
  const favs=state.favorites.map(id=>cardMap().get(id)).filter(Boolean);let ids=[],label='Sorpresa · introducción plural',reason='dos puertas de entrada por grandes periodos';
  if(favs.length>=3){ids=diverseRanked(cards.filter(c=>!state.favorites.includes(c.id)),c=>similarityScore(c,favs)+(Math.random()<.25?6-(similarityScore(c,favs)/5):0),28);label='Sorpresa · afinidades y contrastes';reason='favoritas, ideas afines y perspectivas contrastantes'}
  else if(state.seen.length>=5){const recent=state.seen.slice(-12).map(id=>cardMap().get(id)).filter(Boolean);ids=diverseRanked(cards.filter(c=>!recent.some(r=>r.id===c.id)),c=>similarityScore(c,recent)+interestScore(c),28);label='Sorpresa · desde tu recorrido';reason='historial, intereses y periodos todavía poco explorados'}
  else if((state.interestProfile?.selections||[]).length){ids=diverseRanked(cards,interestScore,24);label='Sorpresa · primera ruta personal';reason='intereses elegidos y diversidad histórica'}
  else ids=buildIntroRoute();
  startRoute(makeRoute('surprise',label,ids,{reason}));setTimeout(()=>showGuideMessage({title:'Cómo se construyó Sorpresa',text:`Esta ruta combina ${reason}. No elimina el azar: lo organiza para evitar repeticiones y ampliar el recorrido.`}),420);
}
function startFavorites(){const ids=state.favorites.filter(id=>cardMap().has(id));if(!ids.length){toast('Todavía no has guardado favoritas');return}startRoute(makeRoute('favorites','Mis favoritas',ids,{order:'orden de guardado'}))}
function startAffinities(){
  const favs=state.favorites.map(id=>cardMap().get(id)).filter(Boolean);if(!favs.length){if((state.interestProfile?.selections||[]).length){startPersonalized();toast('Sin favoritas todavía: usamos tu brújula de intereses')}else{openInterestSurvey();toast('Selecciona intereses o guarda favoritas para descubrir afinidades')}return}
  const ids=diverseRanked(cards.filter(c=>!state.favorites.includes(c.id)),c=>similarityScore(c,favs),50);startRoute(makeRoute('affinities','Ideas afines a mis favoritas',ids,{favorites:state.favorites}));
}

function updateHomeSummary(){
  const meta=$('#continueHomeMeta');if(meta){const r=state.activeRoute;if(!r)meta.textContent='Comienza por el recorrido cronológico';else meta.textContent=`${r.label} · ${(r.position||0)+1}/${r.order?.length||0}`}
  const exploreMeta=$('#toolExploreMeta');if(exploreMeta)exploreMeta.textContent=`${cards.length} ideas · ${(taxonomy.editorialPeriods||[]).length} periodos`;
  const favoriteMeta=$('#toolFavoritesMeta');if(favoriteMeta){const n=state.favorites?.length||0;favoriteMeta.textContent=n?`${n} ${n===1?'guardada':'guardadas'}`:'Aún no has guardado ideas'}
  const connectionsMeta=$('#toolConnectionsMeta');if(connectionsMeta)connectionsMeta.textContent='Abrir o construir un rizoma';
  const interestsMeta=$('#toolInterestsMeta');if(interestsMeta){const n=state.interestProfile?.selections?.length||0;interestsMeta.textContent=n?`${n} ${n===1?'interés seleccionado':'intereses seleccionados'}`:'Configurar tu brújula'}
}

function openInterestSurvey(){interestDraft=[...(state.interestProfile?.selections||[])];renderInterestSurvey();$('#interestModal').classList.remove('hidden');document.body.classList.add('modal-open')}
function closeInterestSurvey(){$('#interestModal').classList.add('hidden');document.body.classList.remove('modal-open')}
function interestName(item){return item.type==='stage'?(stageMap().get(item.id)?.short||item.id):(fieldMap().get(item.id)?.short||item.id)}
function renderInterestSurvey(){
  const selectedKey=new Map(interestDraft.map((x,i)=>[`${x.type}:${x.id}`,i+1]));
  $('#interestPeriods').innerHTML=(taxonomy.stages||[]).filter(x=>x.id!=='transversal').map(x=>{const n=selectedKey.get(`stage:${x.id}`);return `<button type="button" class="${n?'selected':''}" data-interest-type="stage" data-interest-id="${x.id}">${n?`<b>${n}</b>`:''}<span>${escapeHtml(x.short)}</span><small>${x.cards} ideas</small></button>`}).join('');
  $('#interestFields').innerHTML=(taxonomy.fields||[]).map(x=>{const n=selectedKey.get(`field:${x.id}`);return `<button type="button" class="${n?'selected':''}" data-interest-type="field" data-interest-id="${x.id}">${n?`<b>${n}</b>`:''}<span>${escapeHtml(x.short)}</span><small>${x.cards} ideas</small></button>`}).join('');
  $('#interestOrderList').innerHTML=interestDraft.length?interestDraft.map((x,i)=>`<span><b>${i+1}</b>${escapeHtml(interestName(x))}</span>`).join(''):'<small>Aún no has seleccionado intereses.</small>';
}
function toggleInterest(type,id){const key=`${type}:${id}`,i=interestDraft.findIndex(x=>`${x.type}:${x.id}`===key);if(i>=0)interestDraft.splice(i,1);else{if(interestDraft.length>=8){toast('Puedes ordenar hasta ocho intereses');return}interestDraft.push({type,id})}renderInterestSurvey()}
function saveInterests(skip=false){state.interestProfile={completed:true,selections:skip?[]:[...interestDraft]};save();closeInterestSurvey();toast(skip?'Exploración abierta activada':'Tu brújula de intereses quedó guardada');if(interestReturnView){const target=interestReturnView;interestReturnView='';if(skip&&pendingListenMode==='personalized'){nav('home');toast('Para ti necesita al menos un interés')}else nav(target)}}

function populateExplorePeriodSelect(){
  const sel=$('#explorePeriodSelect');if(!sel)return;
  const current=explorePeriodId||'';
  sel.innerHTML='<option value="">Todos los periodos</option>'+(taxonomy.editorialPeriods||[]).map(p=>`<option value="${escapeAttr(p.id)}">${escapeHtml(p.short)} · ${p.cards} ideas</option>`).join('');
  sel.value=current;
}
function exploreBaseCards(){return cards.filter(c=>!explorePeriodId||c.editorialPeriodId===explorePeriodId)}
function renderExplore(){
  populateExplorePeriodSelect();
  $$('.explore-tabs [data-explore-tab]').forEach(b=>b.classList.toggle('active',b.dataset.exploreTab===exploreTab));
  const host=$('#exploreHost'),q=($('#exploreSearch')?.value||'').trim().toLowerCase();exploreSearchQuery=q;
  if(q){host.innerHTML=renderSearchExplore(q);updateSelectionBar();return}
  exploreSearchResultIds=[];
  if(exploreTab==='history')host.innerHTML=renderHistoryExplore('');
  if(exploreTab==='fields')host.innerHTML=renderFieldsExplore('');
  if(exploreTab==='disciplines')host.innerHTML=renderDisciplinesExplore();
  if(exploreTab==='authors')host.innerHTML=renderAuthorsExplore('');
  updateSelectionBar();
}
function cardMatches(c,q){return !q||[c.author,c.title,c.statement,c.question,c.territory,c.period,c.collection,c.family,c.historicalRegion,c.entryType,editorialPeriodLabel(c.editorialPeriodId),...(c.tags||[]),...(c.fields||[]).map(fieldLabel),...(c.orientations||[])].join(' ').toLowerCase().includes(q)}
function compactCard(c,context=''){
  const selected=exploreSelection.includes(c.id);
  return `<article class="compact-card ${selected?'selected':''}"><button class="select-card" data-select-card="${c.id}" aria-label="${selected?'Deseleccionar':'Seleccionar'} ${escapeAttr(c.title)}" aria-pressed="${selected}" title="${selected?'Deseleccionar':'Seleccionar'}">${selected?'✓':'＋'}</button><div class="compact-card-copy"><small>${escapeHtml(c.period)} · ${escapeHtml(c.territory)}</small><h3>${escapeHtml(c.author)}</h3><p><strong>${escapeHtml(c.title)}</strong><span> — ${escapeHtml(c.statement)}</span></p></div><div class="compact-card-actions"><button class="icon-mini" data-open-card="${c.id}" data-context="${escapeAttr(context)}" aria-label="Abrir idea" title="Abrir idea">↗</button><button class="icon-mini play-mini" data-listen-result="${c.id}" data-context="${escapeAttr(context)}" aria-label="Escuchar desde esta idea" title="Escuchar desde esta idea">▶</button><button class="icon-mini" data-rhizome-card="${c.id}" aria-label="Ver conexiones" title="Ver conexiones">⌘</button></div></article>`;
}
function renderSearchExplore(q){
  const group=chronologicalDeck(exploreBaseCards().filter(c=>cardMatches(c,q)));
  exploreSearchResultIds=group.map(c=>c.id);
  const counts=new Map();group.forEach(c=>counts.set(c.author,(counts.get(c.author)||0)+1));
  const author=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0];
  const authorButton=author&&author[1]>=2?`<button class="search-rhizome-btn" data-rhizome-author="${escapeAttr(author[0])}">⌘ Rizoma de ${escapeHtml(author[0])}</button>`:'';
  if(!group.length)return `<div class="empty-state"><span>⌕</span><h2>Sin resultados</h2><p>Prueba otra palabra o cambia el periodo seleccionado.</p></div>`;
  return `<section class="search-results"><div class="search-results-head"><div><div class="eyebrow">Resultados de búsqueda</div><h2>${group.length} ideas para “${escapeHtml(q)}”</h2><small>${explorePeriodId?editorialPeriodLabel(explorePeriodId):'Todos los periodos'}</small></div><div class="search-results-actions"><button data-play-search-results>▶ Escuchar resultados</button>${authorButton}</div></div><div class="compact-list">${group.map(c=>compactCard(c,'search')).join('')}</div></section>`;
}
function renderHistoryExplore(){
  const periods=(taxonomy.editorialPeriods||[]).filter(p=>!explorePeriodId||p.id===explorePeriodId);
  return `<div class="history-actions"><button class="install-btn" data-play-chronology>▶ Escuchar todo cronológicamente</button><span>${exploreBaseCards().length} ideas · ${periods.length} periodos visibles</span></div>`+periods.map(s=>{
    const group=chronologicalDeck(cards.filter(c=>c.editorialPeriodId===s.id));if(!group.length)return'';
    const ids=group.map(c=>c.id),allSelected=ids.every(id=>exploreSelection.includes(id));
    return `<article class="period-accordion"><div class="period-accordion-head"><button class="period-toggle" data-toggle-period="${s.id}" aria-expanded="false" aria-controls="period-body-${s.id}"><span><b>${escapeHtml(s.short)}</b><small>${escapeHtml(s.description)}</small></span><em>${group.length} ideas</em><i aria-hidden="true">⌄</i></button><div class="stage-actions icon-stage-actions"><button data-play-period="${s.id}" aria-label="Escuchar ${escapeAttr(s.short)}" title="Escuchar periodo">▶</button><button data-select-period="${s.id}" aria-label="${allSelected?'Deseleccionar':'Seleccionar'} ${escapeAttr(s.short)}" aria-pressed="${allSelected}" title="${allSelected?'Deseleccionar periodo':'Seleccionar periodo'}">${allSelected?'☒':'☑'}</button></div></div><div class="period-accordion-body hidden" id="period-body-${s.id}"><div class="compact-list">${group.map(c=>compactCard(c,`period:${s.id}`)).join('')}</div></div></article>`;
  }).join('');
}
function renderFieldsExplore(q){
  const base=exploreBaseCards();
  const fields=(taxonomy.fields||[]).filter(f=>base.some(c=>c.fields?.includes(f.id)));
  let html='<div class="field-grid">'+fields.map(f=>{const n=base.filter(c=>c.fields?.includes(f.id)).length;return `<article class="field-card ${exploreFieldId===f.id?'active':''}"><div><span>◈</span><h3>${escapeHtml(f.short)}</h3><p>${n} ideas en los periodos visibles.</p></div><div><button data-show-field="${f.id}">Ver ideas</button><button data-play-field="${f.id}">▶</button></div></article>`}).join('')+'</div>';
  if(exploreFieldId){const f=fieldMap().get(exploreFieldId),group=chronologicalDeck(base.filter(c=>c.fields?.includes(exploreFieldId)));html+=`<section class="field-results"><div class="section-head"><div><div class="eyebrow">Campo activo</div><h2>${escapeHtml(f?.label||'')}</h2></div><button data-close-field>Cerrar</button></div><div class="compact-list">${group.map(c=>compactCard(c,`field:${exploreFieldId}`)).join('')}</div></section>`}
  return html;
}

function disciplineRelationsFor(card,publishableOnly=true){
  const rels=(disciplineIndex.cards?.[card.id]||card.disciplinaryRelations||[]);
  return publishableOnly?rels.filter(r=>r.publishable):rels;
}
function disciplineRelation(card,id,publishableOnly=true){return disciplineRelationsFor(card,publishableOnly).find(r=>r.disciplineId===id)}
function disciplineLabel(id){return disciplineMap().get(id)?.label||id}
function disciplineRelationLabel(id){return disciplineRelationTypeMap().get(id)||String(id||'').replaceAll('_',' ')}
function resetDisciplineFilters(){disciplineFilters={period:'',territory:'',author:'',tradition:'',relationType:''}}
function toggleDisciplineSelection(id){
  const i=selectedDisciplineIds.indexOf(id);if(i>=0)selectedDisciplineIds.splice(i,1);else{if(selectedDisciplineIds.length>=4){toast('Puedes cruzar hasta cuatro disciplinas');return}selectedDisciplineIds.push(id)}
  if(selectedDisciplineIds.length<2)disciplineCrossMode=false;renderExplore();
}
function disciplineUnfilteredCards(ids){
  const wanted=ids.filter(Boolean);if(!wanted.length)return[];
  return chronologicalDeck(exploreBaseCards().filter(c=>wanted.every(id=>disciplineRelation(c,id,true))));
}
function disciplineFilteredCards(ids){
  return disciplineUnfilteredCards(ids).filter(c=>{
    if(disciplineFilters.period&&c.editorialPeriodId!==disciplineFilters.period)return false;
    const territory=c.historicalRegion||c.territory||'';if(disciplineFilters.territory&&territory!==disciplineFilters.territory)return false;
    if(disciplineFilters.author&&c.author!==disciplineFilters.author)return false;
    if(disciplineFilters.tradition&&!(c.orientations||[]).includes(disciplineFilters.tradition))return false;
    if(disciplineFilters.relationType&&!ids.some(id=>disciplineRelation(c,id,true)?.relationType===disciplineFilters.relationType))return false;
    return true;
  });
}
function optionList(values,current,allLabel){return `<option value="">${escapeHtml(allLabel)}</option>`+values.map(v=>`<option value="${escapeAttr(v)}" ${v===current?'selected':''}>${escapeHtml(v)}</option>`).join('')}
function disciplineFiltersHtml(base){
  const periods=unique(base.map(c=>c.editorialPeriodId)).map(id=>editorialPeriodMap().get(id)).filter(Boolean).sort((a,b)=>a.order-b.order);
  const territories=unique(base.map(c=>c.historicalRegion||c.territory).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'es')).slice(0,100);
  const authors=unique(base.map(c=>c.author).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'es')).slice(0,160);
  const traditions=unique(base.flatMap(c=>c.orientations||[])).sort((a,b)=>a.localeCompare(b,'es')).slice(0,120);
  const relTypes=(disciplineIndex.relationTypes||[]).map(x=>x.id);
  return `<div class="discipline-filters"><select aria-label="Filtrar por época" data-discipline-filter="period"><option value="">Todas las épocas</option>${periods.map(p=>`<option value="${p.id}" ${p.id===disciplineFilters.period?'selected':''}>${escapeHtml(p.short)}</option>`).join('')}</select><select aria-label="Filtrar por territorio" data-discipline-filter="territory">${optionList(territories,disciplineFilters.territory,'Todos los territorios')}</select><select aria-label="Filtrar por autor" data-discipline-filter="author">${optionList(authors,disciplineFilters.author,'Todos los autores')}</select><select aria-label="Filtrar por tradición" data-discipline-filter="tradition">${optionList(traditions,disciplineFilters.tradition,'Todas las tradiciones')}</select><select aria-label="Filtrar por tipo de vínculo" data-discipline-filter="relationType"><option value="">Todos los vínculos</option>${relTypes.map(id=>`<option value="${id}" ${id===disciplineFilters.relationType?'selected':''}>${escapeHtml(disciplineRelationLabel(id))}</option>`).join('')}</select><button type="button" data-clear-discipline-filters>Limpiar</button></div>`;
}
function disciplineCompactCard(c,ids){
  const selected=exploreSelection.includes(c.id),rels=ids.map(id=>disciplineRelation(c,id,true)).filter(Boolean);
  const badges=rels.map(r=>`<span class="discipline-relation relation-${escapeAttr(r.relationType)}">${escapeHtml(disciplineLabel(r.disciplineId))} · ${escapeHtml(disciplineRelationLabel(r.relationType))}</span>`).join('');
  const rationale=rels.map(r=>r.rationale).join(' ');
  return `<article class="compact-card discipline-result-card ${selected?'selected':''}"><button class="select-card" data-select-card="${c.id}" aria-label="${selected?'Deseleccionar':'Seleccionar'} ${escapeAttr(c.title)}" aria-pressed="${selected}" title="${selected?'Deseleccionar':'Seleccionar'}">${selected?'✓':'＋'}</button><div class="compact-card-copy"><small>${escapeHtml(c.period)} · ${escapeHtml(c.territory)}</small><h3>${escapeHtml(c.author)}</h3><p><strong>${escapeHtml(c.title)}</strong><span> — ${escapeHtml(c.statement)}</span></p><div class="discipline-relation-row">${badges}</div><em class="discipline-rationale">${escapeHtml(rationale)}</em></div><div class="compact-card-actions"><button class="icon-mini" data-open-card="${c.id}" data-context="discipline" aria-label="Abrir idea" title="Abrir idea">↗</button><button class="icon-mini play-mini" data-listen-result="${c.id}" data-context="discipline" aria-label="Escuchar desde esta idea" title="Escuchar desde esta idea">▶</button><button class="icon-mini" data-rhizome-card="${c.id}" aria-label="Ver conexiones" title="Ver conexiones">⌘</button></div></article>`;
}
function renderDisciplineCatalog(){
  const selectedChips=selectedDisciplineIds.map(id=>`<button class="discipline-chip" data-toggle-discipline="${id}">${escapeHtml(disciplineLabel(id))}<span>×</span></button>`).join('');
  const cross=`<section class="discipline-cross-box"><div><div class="eyebrow">Cruzar disciplinas</div><h2>${selectedDisciplineIds.length?'Intersección en preparación':'Selecciona entre dos y cuatro campos'}</h2><p>La intersección recupera únicamente ideas con vínculos publicables de alta confianza hacia todos los campos elegidos.</p><div class="discipline-chips">${selectedChips||'<span class="discipline-empty-chip">Aún no has seleccionado disciplinas</span>'}</div></div><button class="install-btn" data-cross-disciplines ${selectedDisciplineIds.length<2?'disabled':''}>Cruzar disciplinas</button></section>`;
  const grid=(disciplineIndex.disciplines||[]).map(d=>{const chosen=selectedDisciplineIds.includes(d.id);return `<article class="discipline-card ${chosen?'selected':''}"><button class="discipline-card-select" data-toggle-discipline="${d.id}" aria-pressed="${chosen}" aria-label="${chosen?'Quitar de':'Añadir a'} cruce ${escapeAttr(d.label)}">${chosen?'✓':'＋'}</button><div class="discipline-icon" aria-hidden="true">${escapeHtml(d.icon||'◇')}</div><h3>${escapeHtml(d.label)}</h3><p>${escapeHtml(d.description)}</p><div class="discipline-count"><strong>${d.publishedIdeas}</strong> ideas clasificadas${d.manualReviewIdeas?`<small>${d.manualReviewIdeas} vínculos en revisión editorial</small>`:''}</div><div class="discipline-card-actions"><button data-show-discipline="${d.id}">Ver ideas</button><button class="play-mini" data-play-discipline="${d.id}" aria-label="Escuchar ${escapeAttr(d.label)}" title="Escuchar">▶</button></div></article>`}).join('');
  return `${cross}<div class="discipline-grid">${grid}</div>`;
}
function renderDisciplineDetail(ids){
  const cross=ids.length>1,base=disciplineUnfilteredCards(ids),group=disciplineFilteredCards(ids);disciplineResultIds=group.map(c=>c.id);
  const title=cross?ids.map(disciplineLabel).join(' + '):disciplineLabel(ids[0]);
  const desc=cross?'Ideas que permiten comprender el diálogo, la tensión o la convergencia entre los campos seleccionados.':disciplineMap().get(ids[0])?.description||'';
  const pending=ids.reduce((n,id)=>n+(disciplineMap().get(id)?.manualReviewIdeas||0),0);
  return `<section class="discipline-detail"><div class="discipline-detail-head"><button class="icon-mini" data-close-discipline aria-label="Volver a disciplinas">←</button><div><div class="eyebrow">${cross?'Cruce disciplinar':'Disciplina activa'}</div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(desc)}</p><small>${group.length} ideas visibles · solo relaciones explícitas o de alta confianza${pending?` · ${pending} vínculos requieren clasificación manual y permanecen fuera de los resultados`:''}</small></div><button class="install-btn" data-play-discipline-results ${group.length?'':'disabled'}>▶ Escuchar</button></div>${disciplineFiltersHtml(base)}${group.length?`<div class="compact-list discipline-results">${group.map(c=>disciplineCompactCard(c,ids)).join('')}</div>`:'<div class="empty-state"><span>⌘</span><h2>No hay ideas con estos filtros</h2><p>Limpia un filtro o modifica las disciplinas seleccionadas.</p></div>'}</section>`;
}
function renderDisciplinesExplore(){
  if(disciplineCrossMode&&selectedDisciplineIds.length>=2)return renderDisciplineDetail(selectedDisciplineIds);
  if(activeDisciplineId)return renderDisciplineDetail([activeDisciplineId]);
  disciplineResultIds=[];return renderDisciplineCatalog();
}
function openDiscipline(id){activeDisciplineId=id;disciplineCrossMode=false;resetDisciplineFilters();renderExplore()}
function playDiscipline(id){const group=disciplineUnfilteredCards([id]);if(!group.length){toast('No hay ideas clasificadas para esta disciplina');return}startRoute(makeRoute('discipline',disciplineLabel(id),group.map(c=>c.id),{discipline:id}))}
function playDisciplineResults(){if(!disciplineResultIds.length){toast('No hay ideas visibles para escuchar');return}const ids=disciplineCrossMode?selectedDisciplineIds:[activeDisciplineId];const label=ids.map(disciplineLabel).join(' + ');startRoute(makeRoute(ids.length>1?'discipline_cross':'discipline',label,disciplineResultIds,{disciplines:ids,filters:{...disciplineFilters}}))}

function renderAuthorsExplore(){
  const filtered=chronologicalDeck(exploreBaseCards()).slice(0,100);return `<div class="author-summary"><span>100 resultados visibles · usa el buscador para localizar autores, conceptos y lugares</span></div><div class="compact-list">${filtered.map(c=>compactCard(c,'authors')).join('')}</div>`;
}
function toggleCardSelection(id){const i=exploreSelection.indexOf(id);if(i>=0)exploreSelection.splice(i,1);else exploreSelection.push(id);renderExplore()}
function selectStage(id){for(const c of chronologicalDeck(cards.filter(x=>x.chronologyStageId===id)))if(!exploreSelection.includes(c.id))exploreSelection.push(c.id);renderExplore()}
function selectPeriod(id){
  const ids=chronologicalDeck(cards.filter(x=>x.editorialPeriodId===id)).map(c=>c.id);
  const allSelected=ids.length&&ids.every(cardId=>exploreSelection.includes(cardId));
  if(allSelected)exploreSelection=exploreSelection.filter(cardId=>!ids.includes(cardId));
  else for(const cardId of ids)if(!exploreSelection.includes(cardId))exploreSelection.push(cardId);
  renderExplore();
}
function selectionMinutes(){return Math.ceil(exploreSelection.reduce((sum,id)=>sum+estimateSeconds(cardMap().get(id)?.audio),0)/60)}
function updateSelectionBar(){const bar=$('#selectionBar');if(!bar)return;bar.classList.toggle('hidden',!exploreSelection.length);$('#selectionCount').textContent=`${exploreSelection.length} ${exploreSelection.length===1?'idea seleccionada':'ideas seleccionadas'}`;$('#selectionEstimate').textContent=exploreSelection.length?`Aproximadamente ${selectionMinutes()} min a ${formatRate(state.rate)}`:''}
function contextDeck(context){
  if(context==='search')return exploreSearchResultIds.map(id=>cardMap().get(id)).filter(Boolean);
  if(context?.startsWith('period:'))return chronologicalDeck(cards.filter(c=>c.editorialPeriodId===context.split(':')[1]));
  if(context?.startsWith('stage:'))return chronologicalDeck(cards.filter(c=>c.chronologyStageId===context.split(':')[1]));
  if(context?.startsWith('field:'))return chronologicalDeck(cards.filter(c=>c.fields?.includes(context.split(':')[1])));
  if(context==='discipline')return disciplineResultIds.map(id=>cardMap().get(id)).filter(Boolean);
  return chronologicalDeck(exploreBaseCards());
}
function contextLabel(context){
  if(context==='search')return `Búsqueda: ${exploreSearchQuery||'resultados'}`;
  if(context?.startsWith('period:'))return editorialPeriodLabel(context.split(':')[1]);
  if(context?.startsWith('stage:'))return stageLabel(context.split(':')[1]);
  if(context?.startsWith('field:'))return fieldLabel(context.split(':')[1]);
  if(context==='discipline'){const ids=disciplineCrossMode?selectedDisciplineIds:[activeDisciplineId];return ids.map(disciplineLabel).join(' + ')||'Disciplinas y cruces'}
  return 'Exploración del corpus';
}
function openCardInContext(id,context){const group=contextDeck(context);startRoute(makeRoute(context==='search'?'search':'explore',contextLabel(context),group.map(c=>c.id),{query:context==='search'?exploreSearchQuery:undefined}),{autoplay:false,startId:id})}
function listenResultInContext(id,context){const group=contextDeck(context);startRoute(makeRoute(context==='search'?'search':'explore',contextLabel(context),group.map(c=>c.id),{query:context==='search'?exploreSearchQuery:undefined}),{autoplay:true,startId:id})}
function playSearchResults(){if(!exploreSearchResultIds.length){toast('No hay resultados para escuchar');return}startRoute(makeRoute('search',`Búsqueda: ${exploreSearchQuery}`,exploreSearchResultIds,{query:exploreSearchQuery}))}

function renderFavorites(){
  const host=$('#favoritesHost');const favs=state.favorites.map(id=>cardMap().get(id)).filter(Boolean);if(!favs.length){host.innerHTML='<div class="empty-state"><span>♡</span><h2>Todavía no tienes favoritas</h2><p>Guarda ideas desde el reproductor. Mientras tanto, tu brújula de intereses puede construir una ruta personalizada.</p><button data-action="interests">Elegir intereses</button></div>';return}
  host.innerHTML=`<div class="favorite-count">${favs.length} favoritas guardadas</div><div class="favorites-grid">${favs.map(c=>`<article class="favorite-card"><div class="favorite-card-copy"><small>${escapeHtml(c.period)} · ${escapeHtml(collectionLabel(c.collectionId))}</small><h3>${escapeHtml(c.author)}</h3><p><strong>${escapeHtml(c.title)}</strong><span>${escapeHtml(c.statement)}</span></p></div><div class="favorite-row-actions"><button class="icon-mini play-mini" data-open-favorite="${c.id}" aria-label="Abrir ${escapeAttr(c.title)}" title="Abrir">↗</button><button class="icon-mini remove-mini" data-remove-favorite="${c.id}" aria-label="Quitar de favoritas" title="Quitar">×</button></div></article>`).join('')}</div>`;
}
function renderRoutes(){
  const host=$('#routesHost'),routes=state.recentRoutes.filter(r=>r.order?.length).slice(0,3);if(!routes.length){host.innerHTML='<div class="empty-state"><span>≡</span><h2>Aún no hay recorridos</h2><p>Inicia el recorrido cronológico, crea una selección o prueba De todo un poco.</p></div>';return}
  host.innerHTML=routes.map(r=>`<article class="route-card"><div><small>${new Date(r.updatedAt||r.createdAt).toLocaleDateString('es-CO')}</small><h3>${escapeHtml(r.label)}</h3><p>${(r.position||0)+1} de ${r.order.length} ideas · ${escapeHtml(r.type)}</p><div class="route-progress"><span style="width:${Math.max(2,Math.round(((r.position||0)+1)/r.order.length*100))}%"></span></div></div><button data-resume-route="${r.id}">Continuar</button></article>`).join('');
}

function setRhizomeCenter(id){if(cardMap().has(id)){rhizomeMode='card';rhizomeAuthorName='';rhizomeCenterId=id;renderRhizome()}}
function setRhizomeAuthor(author){if(!author)return;rhizomeMode='author';rhizomeAuthorName=author;rhizomeCenterId='';nav('rhizome')}
function relationMeta(card,targetId){
  const rel=(card.relations||[]).find(x=>x.targetId===targetId)||{};
  const typeLabels={historical_influence:'Influencia',historical_resonance:'Resonancia histórica',conceptual_connection:'Afinidad conceptual',conceptual_resonance:'Resonancia',conceptual_continuity:'Continuidad',critique:'Crítica',continuity:'Continuidad',translation_route:'Ruta de traducción',contrast:'Contraste'};
  return {label:rel.label||typeLabels[rel.type]||'Conexión',type:typeLabels[rel.type]||String(rel.type||'Conexión').replaceAll('_',' ')};
}
function authorRhizomeDeck(author){
  const own=chronologicalDeck(cards.filter(c=>c.author===author));const seen=new Set(own.map(c=>c.id));const connected=[];
  own.forEach(c=>connectionCards(c).forEach(x=>{if(!seen.has(x.id)){seen.add(x.id);connected.push(x)}}));
  return [...own,...connected.slice(0,Math.max(0,10-own.length))];
}
function renderRhizome(){
  const q=($('#connectionSearch')?.value||'').trim().toLowerCase();
  if(q){const matches=cards.filter(c=>cardMatches(c,q)).slice(0,8);const authorCounts=new Map();matches.forEach(c=>authorCounts.set(c.author,(authorCounts.get(c.author)||0)+1));const authors=[...authorCounts.entries()].filter(x=>x[1]>=2).slice(0,3);$('#connectionSuggestions').innerHTML=authors.map(([a,n])=>`<button data-rhizome-author="${escapeAttr(a)}"><strong>⌘ ${escapeHtml(a)}</strong><small>${n} ideas y sus conexiones</small></button>`).join('')+matches.map(c=>`<button data-rhizome-pick="${c.id}"><strong>${escapeHtml(c.author)}</strong><small>${escapeHtml(c.title)}</small></button>`).join('')}else $('#connectionSuggestions').innerHTML='';
  const host=$('#rhizome');
  if(rhizomeMode==='author'&&rhizomeAuthorName){
    const deck=authorRhizomeDeck(rhizomeAuthorName),ownIds=new Set(cards.filter(c=>c.author===rhizomeAuthorName).map(c=>c.id)),nodes=deck.slice(0,8);
    const points=[{x:50,y:10,sx:500,sy:72},{x:79,y:19,sx:790,sy:124},{x:88,y:50,sx:880,sy:325},{x:79,y:81,sx:790,sy:526},{x:50,y:90,sx:500,sy:585},{x:21,y:81,sx:210,sy:526},{x:12,y:50,sx:120,sy:325},{x:21,y:19,sx:210,sy:124}];
    const lines=nodes.map((n,i)=>`<line x1="500" y1="325" x2="${points[i].sx}" y2="${points[i].sy}" class="rhizome-line line-${i%4}"></line>`).join('');
    const nodeHtml=nodes.map((n,i)=>{const p=points[i];return `<article class="rhizome-node" style="left:${p.x}%;top:${p.y}%"><small>${ownIds.has(n.id)?'Obra o concepto del autor':'Conexión del rizoma'}</small><h3>${escapeHtml(n.author)}</h3><p>${escapeHtml(n.title)}</p><div class="rhizome-node-actions"><button data-listen-node="${n.id}" title="Escuchar esta idea">▶</button><button data-center-node="${n.id}" title="Poner esta idea en el centro">◎</button></div></article>`}).join('');
    host.innerHTML=`<div class="rhizome-canvas"><svg class="rhizome-svg" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">${lines}</svg><article class="rhizome-node rhizome-center" style="left:50%;top:50%"><span>⌘</span><small>Rizoma de autor</small><h2>${escapeHtml(rhizomeAuthorName)}</h2><p>${cards.filter(c=>c.author===rhizomeAuthorName).length} ideas propias y relaciones disponibles</p><div class="rhizome-center-actions"><button data-play-rhizome>Escuchar rizoma</button></div></article>${nodeHtml}</div>`;
    $('#connectionPlaybar').classList.remove('hidden');$('#connectionRouteMeta').textContent=`${deck.length} ideas · rizoma de ${rhizomeAuthorName}`;return;
  }
  if(!rhizomeCenterId)rhizomeCenterId=state.lastCardId&&cardMap().has(state.lastCardId)?state.lastCardId:'';
  if(!rhizomeCenterId){host.innerHTML='<div class="empty-state"><span>⌘</span><h2>Elige una idea como punto de partida</h2><p>Busca un autor o concepto. También puedes usar la última idea escuchada.</p></div>';$('#connectionPlaybar').classList.add('hidden');return}
  const c=cardMap().get(rhizomeCenterId),nodes=connectionCards(c).slice(0,8);
  const points=[{x:50,y:10,sx:500,sy:72},{x:79,y:19,sx:790,sy:124},{x:88,y:50,sx:880,sy:325},{x:79,y:81,sx:790,sy:526},{x:50,y:90,sx:500,sy:585},{x:21,y:81,sx:210,sy:526},{x:12,y:50,sx:120,sy:325},{x:21,y:19,sx:210,sy:124}];
  const lines=nodes.map((n,i)=>`<line x1="500" y1="325" x2="${points[i].sx}" y2="${points[i].sy}" class="rhizome-line line-${i%4}"></line>`).join('');
  const nodeHtml=nodes.map((n,i)=>{const p=points[i],rel=relationMeta(c,n.id);return `<article class="rhizome-node" style="left:${p.x}%;top:${p.y}%"><small>${escapeHtml(rel.type)}</small><h3>${escapeHtml(n.author)}</h3><p>${escapeHtml(n.title)}</p><em>${escapeHtml(rel.label)}</em><div class="rhizome-node-actions"><button data-listen-node="${n.id}" title="Escuchar solo esta idea">▶</button><button data-center-node="${n.id}" title="Poner esta idea en el centro">◎</button></div></article>`}).join('');
  host.innerHTML=`<div class="rhizome-canvas"><svg class="rhizome-svg" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">${lines}</svg><article class="rhizome-node rhizome-center" style="left:50%;top:50%"><span>${escapeHtml(c.symbol||'◎')}</span><small>Idea central</small><h2>${escapeHtml(c.author)}</h2><p>${escapeHtml(c.title)}</p><div class="rhizome-center-actions"><button data-listen-node="${c.id}">Escuchar idea</button><button data-play-rhizome>Escuchar rizoma</button></div></article>${nodeHtml}</div>`;
  $('#connectionPlaybar').classList.remove('hidden');$('#connectionRouteMeta').textContent=`${1+nodes.length} ideas conectadas · centro: ${c.author}`;
}
function playConstellation(){
  if(rhizomeMode==='author'&&rhizomeAuthorName){const deck=authorRhizomeDeck(rhizomeAuthorName);if(deck.length)startRoute(makeRoute('connections_author',`Rizoma · ${rhizomeAuthorName}`,deck.map(c=>c.id),{author:rhizomeAuthorName,kind:'author_rhizome'}));return}
  const c=cardMap().get(rhizomeCenterId);if(!c)return;const ids=[c.id,...connectionCards(c).slice(0,8).map(x=>x.id)];startRoute(makeRoute('connections',`Rizoma · ${c.author}`,ids,{center:c.id,kind:'rhizome'}));
}
function listenNode(id){startRoute(makeRoute('connection_single',`Idea conectada · ${cardMap().get(id)?.author||''}`,[id]),{autoplay:true})}

function renderQuiz(){
  const deck=activeDeck().filter(c=>c.quiz?.options?.length);const c=deck[Math.floor(Math.random()*deck.length)]||cards.find(c=>c.quiz?.options?.length);if(!c)return;const q=c.quiz;$('#quizTitle').textContent=q.prompt;$('#quizContext').textContent=`${stageMap().get(c.chronologyStageId)?.short||c.family} · ${c.author}`;
  const opts=q.options.map((o,i)=>({o,i})).sort(()=>Math.random()-.5);$('#quizOptions').innerHTML=opts.map(x=>`<button class="quiz-option" data-correct="${x.i===q.answer}">${escapeHtml(x.o)}</button>`).join('');$('#quizFeedback').innerHTML='';
  $$('.quiz-option').forEach(b=>b.onclick=()=>{const ok=b.dataset.correct==='true';$$('.quiz-option').forEach(x=>x.disabled=true);b.classList.add(ok?'correct':'wrong');const feedback=$('#quizFeedback');if(feedback)feedback.innerHTML=`<div class="quiz-feedback"><strong>${ok?'Correcto':'Revisa la diferencia'}</strong><br>${escapeHtml(q.feedback)}<br><small>${escapeHtml(c.caution)}</small></div>`;state.quiz=(state.quiz||0)+1;save()});
}

function fillVoiceSelect(select){if(!select)return;const current=state.voiceURI||'',automatic=availableVoices.some(v=>/^es([_-]|$)/i.test(v.lang))?'Voz española automática':'Voz automática del dispositivo';select.innerHTML=`<option value="">${automatic}</option>`+availableVoices.map(v=>`<option value="${escapeAttr(v.voiceURI)}">${escapeHtml(v.name)} · ${escapeHtml(v.lang)}${v.localService?' · local':''}</option>`).join('');select.value=availableVoices.some(v=>v.voiceURI===current)?current:''}
function syncAudioControls(){['#voiceSelect','#playerVoiceSelect'].forEach(id=>{const el=$(id);if(el)el.value=availableVoices.some(v=>v.voiceURI===state.voiceURI)?state.voiceURI:''});['#rateSelect','#playerRateSelect'].forEach(id=>{const el=$(id);if(el)el.value=String(normalizeRate(state.rate))})}
function loadVoices(){if(!('speechSynthesis'in window))return;const all=speechSynthesis.getVoices(),spanish=all.filter(v=>/^es([_-]|$)/i.test(v.lang));availableVoices=(spanish.length?spanish:all).sort((a,b)=>(Number(b.localService)-Number(a.localService))||a.lang.localeCompare(b.lang)||a.name.localeCompare(b.name));fillVoiceSelect($('#voiceSelect'));fillVoiceSelect($('#playerVoiceSelect'));syncAudioControls()}
function setVoice(value){state.voiceURI=value||'';syncAudioControls();save();toast(selectedVoice()?`Voz: ${selectedVoice().name}`:'Voz automática del dispositivo')}
function setRate(value){state.rate=normalizeRate(value);syncAudioControls();save();toast(`Velocidad ${formatRate(state.rate)}${playback.active?' · se aplicará en la siguiente idea':''}`)}
function selectedVoice(){if(state.voiceURI){const exact=availableVoices.find(v=>v.voiceURI===state.voiceURI);if(exact)return exact}return availableVoices.find(v=>/es[-_]CO/i.test(v.lang)&&v.localService)||availableVoices.find(v=>/es[-_](MX|US|419)/i.test(v.lang)&&v.localService)||availableVoices.find(v=>v.localService)||availableVoices[0]||null}
function makeUtterance(text,onend,onerror,rate=state.rate||1){const u=new SpeechSynthesisUtterance(text);u.lang=selectedVoice()?.lang||'es-CO';u.rate=Number(rate)||1;u.pitch=.98;u.volume=1;const voice=selectedVoice();if(voice)u.voice=voice;u.onend=onend;u.onerror=onerror;u.onboundary=()=>{playback.lastBoundaryAt=Date.now()};return u}
function audioTextForCard(card){const d=dossierMap().get(card?.id)||{};return String(d.audioScript||card?.audio||card?.statement||'').trim()}
function speakHistorical(){const h=historicalMap().get(cards[currentIndex].id);if(!h){toast('La historia ampliada todavía no está disponible');return}stopPlayback(false);if(!('speechSynthesis'in window)){toast('La voz del navegador no está disponible');return}speechSynthesis.cancel();speechSynthesis.speak(makeUtterance(h.longAudioScript,()=>toast('Historia ampliada finalizada'),()=>toast('La lectura se interrumpió'),state.rate||1));toast('Escuchando historia ampliada')}
function finishCurrentCard(token,cardId,duration){
  if(!playback.active||token!==playback.token||playback.expectedCardId!==cardId)return;
  playback.expectedCardId='';clearTimeout(playback.watchdog);playback.watchdog=null;clearInterval(playback.keepAlive);playback.keepAlive=null;playback.sessionSeconds+=duration;updatePlayerSession();
  if(sessionLimitSeconds()&&playback.sessionSeconds>=sessionLimitSeconds()){stopPlayback();showGuideMessage({title:'Sesión completada',text:`Terminaste esta idea y alcanzaste la duración elegida de ${state.sessionMinutes} minutos. Tu punto quedó guardado para continuar después.`});return}
  const deck=activeDeck(),pos=deck.findIndex(x=>x.id===cardId);
  if(pos>=0&&pos<deck.length-1){const next=deck[pos+1];if(state.activeRoute){state.activeRoute.position=pos+1;state.activeRoute.currentCardId=next.id;state.activeRoute.updatedAt=new Date().toISOString()}currentIndex=cards.findIndex(x=>x.id===next.id);renderCard();playback.advanceTimer=setTimeout(()=>speakCurrent(token),520)}
  else{stopPlayback();showGuideMessage({title:'Recorrido completado',text:`Terminaste ${deck.length} ideas de “${state.activeRoute?.label||'este recorrido'}”. Puedes crear otra ruta o volver a escucharla desde Mis recorridos.`})}
}
function speakCurrent(token){
  if(!playback.active||token!==playback.token)return;if(!('speechSynthesis'in window)){stopPlayback();toast('La voz del navegador no está disponible');return}
  clearTimeout(playback.advanceTimer);clearTimeout(playback.watchdog);clearInterval(playback.keepAlive);
  const c=cards[currentIndex],text=audioTextForCard(c);if(!c||!text){stopPlayback();toast('Esta idea no tiene guion de escucha disponible');return}
  const duration=estimateSeconds(text),cardId=c.id;playback.expectedCardId=cardId;playback.retryCount=0;playback.lastBoundaryAt=Date.now();
  const begin=()=>{
    if(!playback.active||token!==playback.token||playback.expectedCardId!==cardId)return;
    const u=makeUtterance(text,()=>finishCurrentCard(token,cardId,duration),(event)=>{
      if(!playback.active||token!==playback.token||playback.expectedCardId!==cardId)return;
      const kind=event?.error||'unknown';
      if(playback.retryCount<1&&['canceled','interrupted','synthesis-failed','audio-busy','unknown'].includes(kind)){playback.retryCount++;playback.advanceTimer=setTimeout(begin,650);return}
      stopPlayback();toast('La voz se interrumpió. Pulsa reproducir para continuar desde esta idea.');
    });
    playback.utterance=u;toast(`Escuchando: ${c.author}`);speechSynthesis.speak(u);
    playback.keepAlive=setInterval(()=>{if(playback.active&&token===playback.token&&speechSynthesis.paused)speechSynthesis.resume()},4500);
    const watchdogMs=Math.max(70000,Math.round(duration*2200)+18000);playback.watchdog=setTimeout(()=>{
      if(!playback.active||token!==playback.token||playback.expectedCardId!==cardId)return;
      speechSynthesis.cancel();finishCurrentCard(token,cardId,duration);
    },watchdogMs);
  };
  if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();setTimeout(begin,220)}else begin();
}
function togglePlayback(){if(playback.active){stopPlayback(true);return}playback.active=true;playback.token++;playback.sessionSeconds=playback.sessionSeconds||0;setPlaybackUI(true);speakCurrent(playback.token)}
function stepCard(delta){const resume=playback.active;playback.token++;const token=playback.token;clearPlaybackTimers();if('speechSynthesis'in window)speechSynthesis.cancel();const {deck,pos}=deckPosition();const next=(pos+delta+deck.length)%deck.length;currentIndex=cards.findIndex(c=>c.id===deck[next].id);if(state.activeRoute){state.activeRoute.position=next;state.activeRoute.currentCardId=deck[next].id}renderCard();if(resume){playback.active=true;setPlaybackUI(true);playback.advanceTimer=setTimeout(()=>speakCurrent(token),300)}}

function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){const words=String(text||'').split(/\s+/);let line='',lines=[];for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=w}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/[.,;:]?$/,'…')}lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));return y+lines.length*lineHeight}
function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
function loadImage(src){return new Promise((res,rej)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>res(im);im.onerror=rej;im.src=src+(src.includes('?')?'&':'?')+'export=3.0'})}
function dataUrlToBlob(dataUrl){const parts=dataUrl.split(','),mime=(parts[0].match(/:(.*?);/)||[])[1]||'image/png',bin=atob(parts[1]),arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime})}
async function canvasBlob(canvas){
  return new Promise(resolve=>{
    try{
      canvas.toBlob(blob=>{
        if(blob&&blob.size>0)resolve(blob);
        else{
          try{resolve(dataUrlToBlob(canvas.toDataURL('image/png',.96)))}
          catch(e){resolve(null)}
        }
      },'image/png',.96);
    }catch(e){
      try{resolve(dataUrlToBlob(canvas.toDataURL('image/png',.96)))}
      catch(err){resolve(null)}
    }
  });
}
async function makeShareBlob(c){
  if(document.fonts?.ready)await document.fonts.ready.catch(()=>{});
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('canvas_context_unavailable');
  const [a,b,gold]=c.visual?.palette||['#102a45','#315b79','#c18b38'];const grad=ctx.createLinearGradient(0,0,1080,1350);grad.addColorStop(0,a);grad.addColorStop(.7,b);grad.addColorStop(1,gold);ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1350);ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=3;roundRect(ctx,38,38,1004,1274,30);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.17)';ctx.font='180px Georgia';ctx.textAlign='center';ctx.fillText(c.symbol||'◎',900,250);ctx.textAlign='left';ctx.fillStyle='#efd9aa';ctx.font='700 25px Arial';ctx.fillText('CARTOGRAFÍAS DEL PENSAMIENTO',80,105);ctx.font='21px Arial';ctx.fillText(`${stageMap().get(c.chronologyStageId)?.short?.toUpperCase()||String(c.family||'IDEA').toUpperCase()}`,80,147);ctx.fillStyle='#fff';ctx.font='700 62px Georgia';let y=wrapText(ctx,c.author,80,270,780,70,3);ctx.fillStyle='#efd9aa';ctx.font='34px Georgia';y=wrapText(ctx,c.title,80,y+24,780,42,3);ctx.fillStyle='#fff';ctx.font='44px Georgia';y=wrapText(ctx,c.statement,80,y+60,900,56,6);ctx.fillStyle='rgba(4,21,36,.34)';roundRect(ctx,70,790,940,380,28);ctx.fill();ctx.fillStyle='#efd9aa';ctx.font='700 20px Arial';ctx.fillText('PREGUNTA GUÍA',100,845);ctx.fillStyle='#fff';ctx.font='29px Georgia';wrapText(ctx,c.question,100,890,870,38,4);ctx.fillStyle='#efd9aa';ctx.font='700 20px Arial';ctx.fillText('POR QUÉ IMPORTA',100,1030);ctx.fillStyle='#fff';ctx.font='25px Arial';wrapText(ctx,c.whyItMatters||c.contribution||'',100,1070,760,33,3);try{const logo=await loadImage('assets/guide-compact.png');ctx.fillStyle='rgba(255,250,240,.94)';roundRect(ctx,865,1025,115,115,22);ctx.fill();ctx.drawImage(logo,875,1035,95,95)}catch(e){}ctx.strokeStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.moveTo(80,1210);ctx.lineTo(1000,1210);ctx.stroke();ctx.fillStyle='#eadfca';ctx.font='20px Arial';ctx.fillText(`${c.territory} · ${c.period}`,80,1255);ctx.textAlign='right';ctx.fillText(`Evidencia ${c.evidence}`,1000,1255);ctx.textAlign='left';ctx.font='18px Arial';ctx.fillText((c.tags||[]).join(' · '),80,1295);return canvasBlob(canvas);
}
let exportState={busy:false,blob:null,file:null,text:'',url:'',name:'',title:''};
function downloadBlob(blob,name){if(!blob||!blob.size)throw new Error('empty_blob');if(navigator.msSaveOrOpenBlob){navigator.msSaveOrOpenBlob(blob,name);return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';a.target='_blank';a.style.position='fixed';a.style.left='-9999px';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},7000)}
function closeExport(){const modal=$('#exportModal');if(modal)modal.classList.add('hidden');document.body.classList.remove('modal-open');if(exportState.url){URL.revokeObjectURL(exportState.url);exportState.url=''}}
function setExportStatus(text,kind=''){const el=$('#exportStatus');if(!el)return;el.textContent=text||'';el.dataset.kind=kind}
async function openExport(){
  if(exportState.busy){toast('La tarjeta ya se está preparando');return}const c=cards[currentIndex];exportState.busy=true;
  $('#exportModal').classList.remove('hidden');document.body.classList.add('modal-open');$('#exportPreview').removeAttribute('src');$('#exportPreview').classList.add('loading');setExportStatus('Generando imagen en alta resolución…','loading');
  try{const blob=await makeShareBlob(c);if(!blob||!blob.size)throw new Error('canvas_blob_failed');const name=`cartografia-${slug(c.author+'-'+c.title)}.png`;let file=null;try{file=new File([blob],name,{type:'image/png'})}catch(e){}const text=`${c.author} · ${c.title}\n${c.statement}\nPregunta guía: ${c.question}\nCartografías del Pensamiento`;if(exportState.url)URL.revokeObjectURL(exportState.url);const url=URL.createObjectURL(blob);exportState={busy:false,blob,file,text,url,name,title:c.title};$('#exportPreview').src=url;$('#exportPreview').classList.remove('loading');$('#exportDescription').textContent=`${c.author} · ${c.title}`;setExportStatus(`PNG listo · ${Math.max(1,Math.round(blob.size/1024))} KB`,'ready')}catch(e){exportState.busy=false;console.error('card_export_failed',e);$('#exportPreview').classList.remove('loading');setExportStatus('No fue posible generar el PNG. Puedes copiar el texto de la tarjeta.','error');toast('No fue posible generar la tarjeta visual')}
}
async function downloadExportedCard(){
  if(!exportState.blob){toast('La imagen todavía no está lista');return}
  try{
    if(window.showSaveFilePicker){
      try{
        const handle=await showSaveFilePicker({suggestedName:exportState.name||'cartografia.png',types:[{description:'Imagen PNG',accept:{'image/png':['.png']}}]});
        const writable=await handle.createWritable();await writable.write(exportState.blob);await writable.close();
      }catch(e){
        if(e?.name==='AbortError')return;
        downloadBlob(exportState.blob,exportState.name||'cartografia.png');
      }
    }else downloadBlob(exportState.blob,exportState.name||'cartografia.png');
    setExportStatus('La descarga fue solicitada al navegador.','ready');toast('Tarjeta PNG descargada');
  }catch(e){
    console.error(e);setExportStatus('La descarga fue bloqueada. Usa “Abrir imagen” y guárdala desde la pestaña.','error');toast('El navegador bloqueó la descarga');
  }
}
function openExportedImage(){if(!exportState.url){toast('La imagen todavía no está lista');return}const w=window.open(exportState.url,'_blank','noopener,noreferrer');if(!w){setExportStatus('El navegador bloqueó la pestaña. Habilita ventanas emergentes o usa Descargar PNG.','error');toast('La pestaña fue bloqueada')}else setExportStatus('Imagen abierta en una pestaña nueva.','ready')}
async function nativeShareExport(){if(!exportState.blob){toast('Primero prepara la tarjeta');return}try{if(exportState.file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[exportState.file]}))){await navigator.share({title:exportState.title,text:exportState.text,files:[exportState.file]});toast('Tarjeta compartida');return}if(navigator.share){await navigator.share({title:exportState.title,text:exportState.text});toast('Texto compartido');return}openExportedImage()}catch(e){if(e?.name!=='AbortError'){console.error('native_share_failed',e);setExportStatus('El navegador no admite compartir archivos; puedes descargar o abrir el PNG.','error');toast('El navegador no pudo compartir la imagen')}}}
async function copyExportText(){try{await navigator.clipboard.writeText(exportState.text);toast('Texto de la tarjeta copiado')}catch(e){const ta=document.createElement('textarea');ta.value=exportState.text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Texto de la tarjeta copiado')}}
function exportProgress(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),state,snapshotVersion:snapshot.snapshotVersion},null,2)],{type:'application/json'});downloadBlob(blob,'cartografias-progreso.json');toast('Progreso exportado')}

const contextualGuides={
 home:{title:'Una decisión por pantalla',text:'Comienza eligiendo la duración y luego el modo de escucha. Así la entrada no mezcla tiempo, intereses y recorridos en una sola pantalla.'},
 ready:{title:'Todo listo para escuchar',text:'Comprueba el recorrido y el tiempo. Play abre el reproductor y comienza la ruta seleccionada.'},
 duration:{title:'El tiempo orienta, no corta',text:'La sesión nunca interrumpe una idea. Cuando se alcanza el tiempo elegido, termina la tarjeta activa y guarda el punto para continuar.'},
 modes:{title:'Elige el modo de recorrido',text:'Cronológico, Continuar y De todo un poco no dependen de tus intereses. La brújula orienta únicamente Para ti, Sorpresa y las afinidades.'},
 explore:{title:'Una biblioteca, varias entradas',text:'Historia, campos y autores organizan el mismo corpus. Puedes abrir una idea, escuchar una etapa completa o marcar varias tarjetas para convertirlas en una lista de reproducción.'},
 favorites:{title:'Favoritas no significa encierro',text:'Mis favoritas reproduce exactamente lo guardado. Ideas afines busca analogías, extensiones y contrastes para ampliar tus intereses.'},
 routes:{title:'Continuar varios caminos',text:'Cada recorrido conserva su propia lista y posición. El botón Continuar retoma el último; aquí puedes volver a rutas cronológicas, personales, aleatorias o seleccionadas.'},
 card:{title:'Escucha y profundización',text:'El reproductor continúa automáticamente hasta terminar la ruta o alcanzar el tiempo elegido. La historia ampliada y la red de conexiones pertenecen únicamente a la idea visible.'},
 rhizome:{title:'Mapa rizomático reproducible',text:'Cada nodo puede escucharse o ponerse en el centro. Las líneas muestran vínculos y el botón Escuchar este rizoma convierte toda la red visible en un recorrido continuo.'},
 quiz:{title:'Aprender comparando',text:'Cada pregunta conserva la explicación y la cautela editorial de la idea. El quiz toma unidades del recorrido activo o del corpus completo.'}
};
function showGuideMessage(msg){
  if(!msg)return;
  const modal=$('#guideModal'),title=$('#guideModalTitle'),text=$('#guideModalText'),primary=$('#guidePrimaryAction');
  if(!modal){console.warn('guide_modal_missing');return}
  if(title)title.textContent=msg.title||'Guía del pensamiento';
  if(text)text.textContent=msg.text||'';
  if(primary){primary.textContent=msg.actionLabel||'Cerrar';primary.onclick=closeGuide}
  modal.classList.remove('hidden');document.body.classList.add('modal-open')
}
function openGuide(){showGuideMessage(contextualGuides[currentView]||contextualGuides.home)}
function closeGuide(){const modal=$('#guideModal');if(modal)modal.classList.add('hidden');document.body.classList.remove('modal-open')}
function closeInstall(){const modal=$('#installModal');if(modal)modal.classList.add('hidden');document.body.classList.remove('modal-open')}
function installCopy(){const ua=navigator.userAgent;let html='<p>Puedes instalar esta aplicación desde el menú del navegador.</p>';if(/iPhone|iPad/i.test(ua))html='<ol><li>Abre esta página en Safari.</li><li>Toca Compartir.</li><li>Elige “Agregar a pantalla de inicio”.</li></ol>';else if(/Android/i.test(ua))html='<ol><li>Abre el menú del navegador.</li><li>Elige “Instalar aplicación” o “Agregar a pantalla de inicio”.</li></ol>';else html='<ol><li>Busca el icono de instalación en la barra de direcciones.</li><li>También puedes usar el menú del navegador y elegir “Instalar”.</li></ol>';return html}
function showInstallHelp(){const instructions=$('#installInstructions'),modal=$('#installModal');if(instructions)instructions.innerHTML=installCopy();if(!modal){console.warn('install_modal_missing');return}modal.classList.remove('hidden');document.body.classList.add('modal-open')}
async function installApp(){if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;updateInstallUI()}else showInstallHelp()}
function isIosInstall(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)&&!isStandalone()}
function updateInstallUI(){const b=$('#installBtn');if(!b)return;const available=Boolean(deferredPrompt)||isIosInstall();b.classList.toggle('hidden',isStandalone()||!available)}
function showUpdateAvailable(worker){waitingWorker=worker;$('#updateFab')?.classList.remove('hidden')}
function applyUpdate(){if(waitingWorker)waitingWorker.postMessage({type:'SKIP_WAITING'});else location.reload()}
function openDrawer(){const drawer=$('#drawer'),scroll=$('.drawer-scroll');if(!drawer){console.warn('drawer_missing');return}drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');if(scroll)scroll.scrollTop=0}
function closeDrawer(){const drawer=$('#drawer');if(!drawer)return;drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true')}

function bindEvents(){
  const click=(id,handler)=>bindOptional(id,'click',handler), change=(id,handler)=>bindOptional(id,'change',handler), input=(id,handler)=>bindOptional(id,'input',handler);
  click('#menuBtn',openDrawer);$$('[data-close-drawer]').forEach(x=>x.addEventListener('click',closeDrawer));click('#backBtn',goBack);click('#homeBtn',()=>{viewHistory=[];nav('home',{push:false})});click('#prevBtn',()=>stepCard(-1));click('#nextBtn',()=>stepCard(1));click('#speakBtn',togglePlayback);click('#shareBtn',openExport);click('#downloadCardBtn',downloadExportedCard);click('#openExportImageBtn',openExportedImage);click('#nativeShareCardBtn',nativeShareExport);click('#copyCardTextBtn',copyExportText);$$('[data-close-export]').forEach(x=>x.addEventListener('click',closeExport));
  document.addEventListener('click',e=>{
    const mode=e.target.closest('[data-listen-mode]');if(mode){chooseListenMode(mode.dataset.listenMode);return}
    const sessionGo=e.target.closest('[data-session-go]');if(sessionGo){setSessionMinutes(sessionGo.dataset.sessionGo,false);nav('ready');return}
    if(e.target.closest('[data-launch-pending]')){launchPendingMode();return}
    if(e.target.closest('[data-duration-info]')){showGuideMessage({title:'Cómo funciona el tiempo',text:'La aplicación no corta una idea a la mitad. Cuando alcanza el tiempo elegido, termina la tarjeta en curso y guarda el punto para continuar.'});return}
    const flow=e.target.closest('[data-flow]');if(flow){nav(flow.dataset.flow==='modes'?'home':flow.dataset.flow);return}
    const navBtn=e.target.closest('[data-nav]');if(navBtn){const v=navBtn.dataset.nav;if(v==='intro'){viewHistory=[];nav('intro',{push:false})}else if(v==='home'){viewHistory=[];nav('home',{push:false})}else nav(v);return}
    const action=e.target.closest('[data-action]');if(action){const a=action.dataset.action;({continue:startContinue,chronological:startChronological,personalized:startPersonalized,mixed:startMixedMode,surprise:startSurprise,interests:openInterestSurvey,guide:openGuide,export:exportProgress}[a]||(()=>{}))();return}
    const session=e.target.closest('[data-session]');if(session){setSessionMinutes(session.dataset.session);return}
    const tab=e.target.closest('[data-explore-tab]');if(tab){exploreTab=tab.dataset.exploreTab;renderExplore();return}
    const select=e.target.closest('[data-select-card]');if(select){toggleCardSelection(select.dataset.selectCard);return}
    const stageSel=e.target.closest('[data-select-stage]');if(stageSel){selectStage(stageSel.dataset.selectStage);return}
    const periodToggle=e.target.closest('[data-toggle-period]');if(periodToggle){const id=periodToggle.dataset.togglePeriod,body=$(`#period-body-${id}`),open=periodToggle.getAttribute('aria-expanded')==='true';periodToggle.setAttribute('aria-expanded',String(!open));body?.classList.toggle('hidden',open);return}
    const periodSel=e.target.closest('[data-select-period]');if(periodSel){selectPeriod(periodSel.dataset.selectPeriod);return}
    const playStage=e.target.closest('[data-play-stage]');if(playStage){const id=playStage.dataset.playStage,group=chronologicalDeck(cards.filter(c=>c.chronologyStageId===id));startRoute(makeRoute('stage',stageLabel(id),group.map(c=>c.id),{stage:id}));return}
    const playPeriod=e.target.closest('[data-play-period]');if(playPeriod){const id=playPeriod.dataset.playPeriod,group=chronologicalDeck(cards.filter(c=>c.editorialPeriodId===id));startRoute(makeRoute('period',editorialPeriodLabel(id),group.map(c=>c.id),{period:id}));return}
    if(e.target.closest('[data-play-chronology]')){startChronological();return}
    const showField=e.target.closest('[data-show-field]');if(showField){exploreFieldId=showField.dataset.showField;renderExplore();return}
    const playField=e.target.closest('[data-play-field]');if(playField){const id=playField.dataset.playField,group=chronologicalDeck(cards.filter(c=>c.fields?.includes(id)));startRoute(makeRoute('field',fieldLabel(id),group.map(c=>c.id),{field:id}));return}
    if(e.target.closest('[data-close-field]')){exploreFieldId='';renderExplore();return}
    const toggleDisc=e.target.closest('[data-toggle-discipline]');if(toggleDisc){toggleDisciplineSelection(toggleDisc.dataset.toggleDiscipline);return}
    const showDisc=e.target.closest('[data-show-discipline]');if(showDisc){openDiscipline(showDisc.dataset.showDiscipline);return}
    const playDisc=e.target.closest('[data-play-discipline]');if(playDisc){playDiscipline(playDisc.dataset.playDiscipline);return}
    if(e.target.closest('[data-cross-disciplines]')){if(selectedDisciplineIds.length<2){toast('Selecciona al menos dos disciplinas');return}activeDisciplineId='';disciplineCrossMode=true;resetDisciplineFilters();renderExplore();return}
    if(e.target.closest('[data-close-discipline]')){activeDisciplineId='';disciplineCrossMode=false;resetDisciplineFilters();renderExplore();return}
    if(e.target.closest('[data-play-discipline-results]')){playDisciplineResults();return}
    if(e.target.closest('[data-clear-discipline-filters]')){resetDisciplineFilters();renderExplore();return}
    const open=e.target.closest('[data-open-card]');if(open){openCardInContext(open.dataset.openCard,open.dataset.context);return}
    const listenResult=e.target.closest('[data-listen-result]');if(listenResult){listenResultInContext(listenResult.dataset.listenResult,listenResult.dataset.context);return}
    if(e.target.closest('[data-play-search-results]')){playSearchResults();return}
    const rhCard=e.target.closest('[data-rhizome-card]');if(rhCard){rhizomeMode='card';rhizomeAuthorName='';rhizomeCenterId=rhCard.dataset.rhizomeCard;nav('rhizome');return}
    const rhAuthor=e.target.closest('[data-rhizome-author]');if(rhAuthor){setRhizomeAuthor(rhAuthor.dataset.rhizomeAuthor);return}
    const interest=e.target.closest('[data-interest-type]');if(interest){toggleInterest(interest.dataset.interestType,interest.dataset.interestId);return}
    const resume=e.target.closest('[data-resume-route]');if(resume){resumeRoute(resume.dataset.resumeRoute);return}
    const favOpen=e.target.closest('[data-open-favorite]');if(favOpen){const ids=state.favorites.filter(id=>cardMap().has(id));startRoute(makeRoute('favorites','Mis favoritas',ids,{order:'orden de guardado'}),{autoplay:false,startId:favOpen.dataset.openFavorite});return}
    const favRemove=e.target.closest('[data-remove-favorite]');if(favRemove){state.favorites=state.favorites.filter(id=>id!==favRemove.dataset.removeFavorite);save();renderFavorites();return}
    const pick=e.target.closest('[data-rhizome-pick]');if(pick){rhizomeMode='card';rhizomeAuthorName='';setRhizomeCenter(pick.dataset.rhizomePick);$('#connectionSearch').value='';$('#connectionSuggestions').innerHTML='';return}
    const center=e.target.closest('[data-center-node],[data-center-connection]');if(center){const id=center.dataset.centerNode||center.dataset.centerConnection;rhizomeMode='card';rhizomeAuthorName='';rhizomeCenterId=id;nav('rhizome');return}
    const listen=e.target.closest('[data-listen-node]');if(listen){listenNode(listen.dataset.listenNode);return}
    if(e.target.closest('[data-play-rhizome]')){playConstellation();return}
    if(e.target.closest('[data-context-guide]')){openGuide();return}
  });
  document.addEventListener('change',e=>{const f=e.target.closest('[data-discipline-filter]');if(!f)return;disciplineFilters[f.dataset.disciplineFilter]=f.value||'';renderExplore()});
  click('#favBtn',()=>{const current=cards[currentIndex];if(!current)return;const id=current.id;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];renderCard();toast(state.favorites.includes(id)?'Guardada en favoritas':'Eliminada de favoritas')});
  click('#interestSummaryBtn',openInterestSurvey);click('#closeInterest',closeInterestSurvey);click('#saveInterests',()=>saveInterests(false));click('#skipInterests',()=>saveInterests(true));bindOptional('#interestModal .modal-backdrop','click',closeInterestSurvey);
  click('#playFavorites',startFavorites);click('#playAffinities',startAffinities);click('#clearSelection',()=>{exploreSelection=[];renderExplore()});click('#playSelection',()=>{if(exploreSelection.length)startRoute(makeRoute('selection','Mi selección',exploreSelection,{selectionOrder:'orden de marcado'}))});
  input('#exploreSearch',renderExplore);change('#explorePeriodSelect',e=>{explorePeriodId=e.target.value||'';exploreFieldId='';renderExplore()});input('#connectionSearch',renderRhizome);click('#useLastConnection',()=>{if(state.lastCardId)setRhizomeCenter(state.lastCardId);else toast('Todavía no hay una última idea escuchada')});click('#playConstellation',playConstellation);click('#openConnectionsBtn',()=>{const current=cards[currentIndex];if(!current)return;rhizomeMode='card';rhizomeAuthorName='';rhizomeCenterId=current.id;nav('rhizome')});
  click('#nextQuiz',renderQuiz);click('#historicalToggle',toggleHistorical);click('#speakHistorical',speakHistorical);click('#installBtn',installApp);change('#drawerSessionSelect',e=>setSessionMinutes(e.target.value));
  change('#voiceSelect',e=>setVoice(e.target.value));change('#playerVoiceSelect',e=>setVoice(e.target.value));change('#rateSelect',e=>setRate(e.target.value));change('#playerRateSelect',e=>setRate(e.target.value));
  $$('[data-close-guide]').forEach(x=>x.addEventListener('click',closeGuide));$$('[data-close-install]').forEach(x=>x.addEventListener('click',closeInstall));click('#updateFab',applyUpdate);
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;updateInstallUI()});window.addEventListener('appinstalled',()=>{deferredPrompt=null;updateInstallUI();toast('Cartografías quedó instalada')});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#drawer')?.classList.contains('open'))closeDrawer();else if(!$('#interestModal')?.classList.contains('hidden'))closeInterestSurvey();else if(!$('#guideModal')?.classList.contains('hidden'))closeGuide();else if(!$('#installModal')?.classList.contains('hidden'))closeInstall();else if(currentView!=='home')goBack()}});
}

async function init(){
  if(window.__EMBEDDED__){
    ({cards,dossiers,historicalLayers,snapshot,guideMessages,collections,taxonomy,disciplineIndex}=window.__EMBEDDED__);disciplineIndex=disciplineIndex||{disciplines:taxonomy.disciplines||[],relationTypes:taxonomy.disciplinaryRelationTypes||[],cards:{}};
  }else{
    [cards,dossiers,historicalLayers,snapshot,guideMessages,collections,taxonomy,disciplineIndex]=await Promise.all([
      fetch('data/cards.json').then(r=>r.json()),fetch('data/dossiers.json').then(r=>r.json()),fetch('data/historical-layer.json').then(r=>r.json()),fetch('data/project-snapshot.json').then(r=>r.json()),fetch('data/guide-messages.json').then(r=>r.json()),fetch('data/collections.json').then(r=>r.json()),fetch('data/taxonomy.json').then(r=>r.json()),fetch('data/discipline-index.json').then(r=>r.json())
    ]);
  }
  state.rate=normalizeRate(state.rate||1);state.sessionMinutes=SESSION_OPTIONS.includes(Number(state.sessionMinutes))?Number(state.sessionMinutes):0;
  // Migrate the previous single collection state into a resumable route.
  if(!state.activeRoute?.order?.length){
    const oldCol=state.collectionId||'all';const base=oldCol==='all'?chronologicalDeck():cards.filter(c=>c.collectionId===oldCol);
    const label=oldCol==='all'?'Recorrido cronológico':collectionLabel(oldCol);state.activeRoute=makeRoute('migrated',label,base.map(c=>c.id));
    const oldCard=cards[Math.min(Number(state.last||0),cards.length-1)];if(oldCard&&state.activeRoute.order.includes(oldCard.id)){state.activeRoute.currentCardId=oldCard.id;state.activeRoute.position=state.activeRoute.order.indexOf(oldCard.id)}rememberRoute(state.activeRoute);
  }
  ensureCurrentInDeck();bindEvents();loadVoices();syncAudioControls();if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=loadVoices;setPlaybackUI(false);renderSessionControls();updateHomeSummary();updateInstallUI();nav('intro',{push:false});
  setTimeout(()=>{$('#splash').style.opacity='0';setTimeout(()=>$('#splash')?.remove(),480)},1500);
  if(['http:','https:'].includes(location.protocol)&&'serviceWorker'in navigator){navigator.serviceWorker.register('service-worker.js?v=3.9.1',{updateViaCache:'none'}).then(reg=>{reg.update().catch(()=>{});if(reg.waiting)showUpdateAvailable(reg.waiting);reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdateAvailable(worker)})})}).catch(()=>{});navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload())}
  const params=new URLSearchParams(location.search);if(params.get('preview')==='card')setTimeout(startContinue,1600);if(params.get('mode')==='random')setTimeout(startMixedMode,1600);
}

init().catch(e=>{console.error(e);document.body.innerHTML='<main style="padding:30px;font-family:sans-serif"><h1>No se pudo iniciar Cartografías</h1><p>La aplicación encontró un recurso faltante o una versión anterior en caché. Recarga la página; si continúa, borra los datos del sitio y vuelve a abrirla.</p></main>'});

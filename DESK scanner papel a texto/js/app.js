const DB_NAME = 'texto_vivo_v1_2_db'; // se mantiene para no perder avances guardados
const STORE = 'kv';
const ACTIVE_KEY = 'activeProject';

const $ = (id) => document.getElementById(id);
let db;
let state = {
  project: null,
  pages: [],
  fullText: ''
};
let autosaveTimer = null;
let ocrWorker = null;
let ocrReady = false;
let ocrScriptLoading = null;
let transcriptionStartedAt = 0;

const OCR_CONFIG = {
  lang: 'spa+eng',
  maxSideFast: 1000,
  imageQuality: 0.78,
  cdn: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
};

function toast(msg){
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 1900);
}

function setSaveState(text){ $('saveState').textContent = text; }

function openDb(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(key){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function idbSet(key, value){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
function idbDelete(key){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function makeProject(name){
  return {
    id: 'tv_' + Date.now(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function saveAll(silent=false){
  if(!state.project) return;
  state.project.updatedAt = new Date().toISOString();
  await idbSet(ACTIVE_KEY, {
    project: state.project,
    pages: state.pages,
    fullText: state.fullText
  });
  setSaveState('Guardado');
  if(!silent) toast('Avance guardado');
  render();
}

async function loadAll(){
  const saved = await idbGet(ACTIVE_KEY);
  if(saved && saved.project){
    state.project = saved.project;
    state.pages = Array.isArray(saved.pages) ? saved.pages : [];
    state.fullText = saved.fullText || '';
  }
  render();
}

function showStart(){
  $('startView').classList.remove('hidden');
  $('projectView').classList.add('hidden');
}
function showProject(){
  $('startView').classList.add('hidden');
  $('projectView').classList.remove('hidden');
}

function render(){
  if(!state.project){ showStart(); return; }
  showProject();
  $('activeProjectName').textContent = state.project.name;
  const total = state.pages.length;
  const done = state.pages.filter(p => p.text && p.text.trim()).length;
  $('projectMeta').textContent = `${total} foto${total===1?'':'s'} · ${done} transcrita${done===1?'':'s'}`;
  $('fullText').value = state.fullText || '';
  renderPhotos();
}

function renderPhotos(){
  const list = $('photoList');
  if(!state.pages.length){
    list.className = 'photo-list empty';
    list.textContent = 'Aún no hay fotos.';
    return;
  }
  list.className = 'photo-list';
  list.innerHTML = state.pages.map((p, i)=>`
    <article class="photo-card">
      <img src="${p.image}" alt="Página ${i+1}">
      <span>Página ${i+1} ${p.text ? '<b class="ok">· transcrita</b>' : '· pendiente'}</span>
    </article>
  `).join('');
}

function setTab(tab){
  document.querySelectorAll('.step').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));
  $('tab-' + tab).classList.add('active');
}

async function resizeImage(file, maxSide=1150, quality=.72){
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,w,h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function addImages(files){
  if(!state.project){ toast('Primero crea un proyecto'); return; }
  if(!files.length) return;
  setSaveState('Guardando fotos…');
  for(const file of files){
    if(!file.type.startsWith('image/')) continue;
    const image = await resizeImage(file);
    state.pages.push({ id:'page_'+Date.now()+'_'+Math.random().toString(16).slice(2), image, text:'', createdAt:new Date().toISOString() });
  }
  await saveAll(true);
  setTab('capture');
  toast('Fotos agregadas');
}

function updateProgress(percent, text){
  $('ocrProgress').classList.remove('hidden');
  $('progressFill').style.width = Math.max(0, Math.min(100, percent)) + '%';
  $('progressText').textContent = text;
}
function hideProgress(){
  $('ocrProgress').classList.add('hidden');
}

function loadOcrScript(){
  if(window.Tesseract) return Promise.resolve(window.Tesseract);
  if(ocrScriptLoading) return ocrScriptLoading;
  updateProgress(1, 'Cargando motor OCR. Requiere internet la primera vez…');
  ocrScriptLoading = new Promise((resolve, reject)=>{
    const script = document.createElement('script');
    script.src = OCR_CONFIG.cdn;
    script.async = true;
    script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('Tesseract no quedó disponible'));
    script.onerror = () => reject(new Error('No se pudo cargar Tesseract.js'));
    document.head.appendChild(script);
  });
  return ocrScriptLoading;
}

async function getTesseract(){
  return await loadOcrScript();
}

function formatTime(seconds){
  if(!Number.isFinite(seconds) || seconds < 0) return 'calculando…';
  const s = Math.round(seconds);
  if(s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function estimateRemaining(processed, total){
  if(!processed || !transcriptionStartedAt) return 'calculando…';
  const elapsed = (Date.now() - transcriptionStartedAt) / 1000;
  const avg = elapsed / processed;
  return formatTime(avg * Math.max(0, total - processed));
}

async function prepareOcrImage(dataUrl, maxSide=OCR_CONFIG.maxSideFast){
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,w,h);
  ctx.drawImage(img, 0, 0, w, h);
  try{
    const imgData = ctx.getImageData(0,0,w,h);
    const d = imgData.data;
    for(let i=0;i<d.length;i+=4){
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      const v = gray > 238 ? 255 : Math.max(0, Math.min(255, (gray - 128) * 1.18 + 132));
      d[i]=d[i+1]=d[i+2]=v;
      d[i+3]=255;
    }
    ctx.putImageData(imgData,0,0);
  }catch(e){}
  return canvas.toDataURL('image/jpeg', OCR_CONFIG.imageQuality);
}

async function createOcrWorker(Tesseract, logger){
  if(ocrWorker) return ocrWorker;
  if(!Tesseract || !Tesseract.createWorker) throw new Error('Motor OCR no disponible');
  ocrWorker = await Tesseract.createWorker(OCR_CONFIG.lang, 1, { logger });
  if(ocrWorker.setParameters){
    await ocrWorker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: '6'
    });
  }
  ocrReady = true;
  return ocrWorker;
}

async function recognizeWithWorker(Tesseract, image, logger){
  const worker = await createOcrWorker(Tesseract, logger);
  return await worker.recognize(image);
}

async function transcribePending(){
  if(!state.pages.length){ toast('Agrega fotos primero'); return; }
  const pending = state.pages.map((p,i)=>({p,i})).filter(x=>!x.p.text || !x.p.text.trim());
  if(!pending.length){
    toast('No hay fotos pendientes');
    setTab('transcribe');
    return;
  }

  $('btnTranscribeNow').disabled = true;
  setTab('transcribe');
  setSaveState('Transcribiendo…');
  transcriptionStartedAt = Date.now();
  updateProgress(1, `Preparando OCR para ${pending.length} foto${pending.length===1?'':'s'}…`);

  let processed = 0;
  let currentPage = 0;
  const logger = m => {
    if(m.status === 'recognizing text'){
      const local = Math.round((m.progress || 0) * 100);
      const totalPct = ((processed + (m.progress || 0)) / pending.length) * 100;
      updateProgress(totalPct, `Página ${currentPage}: ${local}% · faltan aprox. ${estimateRemaining(processed, pending.length)}`);
    } else if(m.status && /loading|initializing|loaded/i.test(m.status)){
      updateProgress((processed / pending.length)*100, `${m.status}…`);
    }
  };

  try{
    const Tesseract = await getTesseract();
    await createOcrWorker(Tesseract, logger);

    for(const item of pending){
      currentPage = item.i + 1;
      updateProgress((processed / pending.length)*100, `Optimizando página ${currentPage}…`);
      const ocrImage = await prepareOcrImage(item.p.image);
      updateProgress((processed / pending.length)*100, `Transcribiendo página ${currentPage} de ${state.pages.length}…`);
      const result = await recognizeWithWorker(Tesseract, ocrImage, logger);
      const text = (result && result.data && result.data.text ? result.data.text : '').trim();
      state.pages[item.i].text = cleanBasic(text);
      processed++;
      rebuildFullText();
      await saveAll(true);
      updateProgress((processed / pending.length)*100, `Guardada página ${currentPage}. Faltan aprox. ${estimateRemaining(processed, pending.length)}`);
    }

    updateProgress(100, 'Transcripción terminada');
    setTimeout(hideProgress, 900);
    setSaveState('Guardado');
    toast('Transcripción terminada');
  }catch(err){
    console.error(err);
    const msg = String(err && err.message ? err.message : err);
    if(/load|fetch|network|cdn|cargar/i.test(msg)){
      toast('No cargó el OCR. Revisa internet y vuelve a intentar.');
    }else{
      toast('No fue posible completar el OCR');
    }
    setSaveState('Error OCR');
  }finally{
    $('btnTranscribeNow').disabled = false;
    render();
  }
}

function rebuildFullText(){
  const parts = state.pages.map((p,i)=>{
    const tx = (p.text || '').trim();
    return tx ? tx : '';
  }).filter(Boolean);
  state.fullText = parts.join('\n\n');
}

function cleanBasic(text){
  return String(text || '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/-\n(?=\p{L})/gu, '')
    .replace(/([^.!?…:;"”»])\n(?=\p{Ll})/gu, '$1 ')
    .trim();
}

function syncTextFromEditor(){
  state.fullText = $('fullText').value;
}

function safeFilename(name, ext){
  const base = (name || 'texto-vivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,70) || 'texto-vivo';
  return `${base}.${ext}`;
}
function download(filename, content, type, bom=true){
  // BOM UTF-8: evita que Word/Bloc de notas conviertan tildes y ñ en caracteres extraños.
  const parts = bom ? ['\uFEFF', content] : [content];
  const blob = new Blob(parts, {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 600);
}
function escapeHtml(s){
  return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function textToHtml(text){
  return escapeHtml(text).split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('\n');
}
function exportTxt(){
  syncTextFromEditor();
  download(safeFilename(state.project.name,'txt'), state.fullText || '', 'text/plain;charset=utf-8');
}
function exportDoc(){
  syncTextFromEditor();
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>${escapeHtml(state.project.name)}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.5}p{margin:0 0 12pt}</style></head><body><h1>${escapeHtml(state.project.name)}</h1>${textToHtml(state.fullText)}</body></html>`;
  download(safeFilename(state.project.name,'doc'), html, 'application/msword;charset=utf-8');
}
function exportHtml(){
  syncTextFromEditor();
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>${escapeHtml(state.project.name)}</title><style>body{max-width:760px;margin:40px auto;padding:0 20px;font-family:Georgia,serif;line-height:1.65;color:#222}p{margin:0 0 1em}</style></head><body><h1>${escapeHtml(state.project.name)}</h1>${textToHtml(state.fullText)}</body></html>`;
  download(safeFilename(state.project.name,'html'), html, 'text/html;charset=utf-8');
}
function exportBackup(){
  syncTextFromEditor();
  const backup = JSON.stringify({...state, exportedAt:new Date().toISOString()}, null, 2);
  download(safeFilename(state.project.name + '_respaldo','json'), backup, 'application/json;charset=utf-8');
}

async function importBackup(file){
  const text = await file.text();
  const data = JSON.parse(text);
  if(!data.project) throw new Error('Respaldo inválido');
  state.project = data.project;
  state.pages = Array.isArray(data.pages) ? data.pages : [];
  state.fullText = data.fullText || '';
  await saveAll(true);
  toast('Respaldo importado');
  render();
}


async function releaseOcrWorker(){
  try{
    if(ocrWorker && ocrWorker.terminate) await ocrWorker.terminate();
  }catch(e){}
  ocrWorker = null;
  ocrReady = false;
}

function bindEvents(){
  $('btnCreateProject').addEventListener('click', async ()=>{
    const name = $('projectName').value.trim();
    if(!name){ toast('Escribe un nombre'); return; }
    state.project = makeProject(name);
    state.pages = [];
    state.fullText = '';
    await saveAll(true);
    setTab('capture');
    toast('Proyecto creado');
  });
  $('projectName').addEventListener('keydown', e=>{ if(e.key==='Enter') $('btnCreateProject').click(); });
  document.querySelectorAll('.step').forEach(btn=>btn.addEventListener('click', ()=>setTab(btn.dataset.tab)));
  $('imageInput').addEventListener('change', e=>addImages([...e.target.files]).finally(()=>{e.target.value='';}));
  $('btnTranscribeNow').addEventListener('click', transcribePending);
  $('btnSaveText').addEventListener('click', async ()=>{ syncTextFromEditor(); await saveAll(false); });
  $('btnCleanText').addEventListener('click', async ()=>{ $('fullText').value = cleanBasic($('fullText').value); syncTextFromEditor(); await saveAll(false); });
  $('fullText').addEventListener('input', ()=>{ syncTextFromEditor(); setSaveState('Editando…'); scheduleAutosave(); });
  $('btnExportTxt').addEventListener('click', exportTxt);
  $('btnExportDoc').addEventListener('click', exportDoc);
  $('btnExportHtml').addEventListener('click', exportHtml);
  $('btnBackup').addEventListener('click', exportBackup);
  $('backupInput').addEventListener('change', async e=>{
    const file = e.target.files[0];
    if(!file) return;
    try{ await importBackup(file); }catch(err){ toast('No se pudo importar el respaldo'); }
    e.target.value='';
  });
  $('btnClearPhotos').addEventListener('click', async ()=>{
    if(!state.pages.length) return;
    if(confirm('¿Quitar todas las fotos? El texto transcrito se conserva.')){
      state.pages = [];
      await saveAll(false);
    }
  });
  $('btnReset').addEventListener('click', async ()=>{
    if(!state.project){ toast('No hay proyecto activo'); return; }
    if(confirm('¿Borrar el proyecto actual completo?')){
      await releaseOcrWorker();
      await idbDelete(ACTIVE_KEY);
      state = { project:null, pages:[], fullText:'' };
      $('projectName').value = '';
      render();
      toast('Proyecto borrado');
    }
  });
}

function scheduleAutosave(){
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(()=>saveAll(true), 1200);
}

(async function init(){
  try{
    db = await openDb();
    bindEvents();
    await loadAll();
  }catch(err){
    console.error(err);
    document.body.innerHTML = '<main class="app-shell"><section class="card start-card"><h1>Texto Vivo</h1><p>No fue posible iniciar el almacenamiento local. Prueba en otro navegador o borra datos del sitio.</p></section></main>';
  }
})();

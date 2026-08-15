import { state, addProject, getActiveProject, getActiveSession, setActiveProject, updateProjectFields, addPage, importProjects, clearLocalData, setTheme, updateSessionTranscript } from './state.js';
import { imageFileToCompressedDataUrl } from './camera.js';
import { cleanRecoveredText } from './text-tools.js';
import { exportBackup, downloadTxt, downloadHtml, downloadDoc } from './export.js';

const $ = sel => document.querySelector(sel);
let autosaveTimer = null;
let toastTimer = null;

export function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>el.classList.remove('show'),2200);
}

export function applyTheme(){
  document.documentElement.dataset.theme = state.theme === 'dark' ? 'dark' : 'light';
  $('#themeToggle').textContent = state.theme === 'dark' ? '☀' : '☾';
}

function markSaving(isSaving=false){
  const el = $('#saveIndicator');
  el.textContent = isSaving ? '● Guardando' : '● Guardado';
  el.classList.toggle('saving', isSaving);
}

function scheduleTranscriptSave(value){
  markSaving(true);
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(async()=>{
    await updateSessionTranscript(value);
    markSaving(false);
    render(false);
  },500);
}

export function render(full=true){
  applyTheme();
  const p = getActiveProject();
  const s = getActiveSession();
  $('#projectCountBadge').textContent = `${state.projects.length} proyecto${state.projects.length===1?'':'s'}`;
  renderProjectSelect();
  renderProjectEditor(p);
  renderSessionLine(s);
  renderCapturePreview(s);
  renderTranscript(s);
  renderSourceImages(s);
}

function renderProjectSelect(){
  const sel = $('#projectSelect');
  sel.innerHTML = state.projects.map(p=>`<option value="${p.id}" ${p.id===state.activeProjectId?'selected':''}>${escapeHtml(p.title)}</option>`).join('');
}

function renderProjectEditor(p){
  const input = $('#editProjectTitle');
  if(!p){ input.value=''; return; }
  if(document.activeElement !== input) input.value = p.title || '';
}

function renderSessionLine(s){
  const count = s?.pages?.length || 0;
  $('#sessionLine').textContent = `Parte 1 · ${count} página${count===1?'':'s'} guardada${count===1?'':'s'}`;
}

function renderCapturePreview(s){
  const el = $('#capturePreview');
  const pages = s?.pages || [];
  if(!pages.length){
    el.className = 'preview-empty';
    el.textContent = 'Aún no hay páginas capturadas.';
    return;
  }
  const last = pages[pages.length - 1];
  el.className = 'preview-box compact-preview';
  el.innerHTML = `
    ${last.imageData ? `<img src="${last.imageData}" alt="Última página capturada">` : ''}
    <div><strong>${pages.length} página${pages.length===1?'':'s'} guardada${pages.length===1?'':'s'}</strong><p>Última: página ${last.number}. Continúa capturando o pasa a Transcripción.</p></div>`;
}

function renderTranscript(s){
  const area = $('#sessionTranscript');
  if(!s){ area.value=''; return; }
  if(document.activeElement !== area) area.value = s.transcript || '';
}

function renderSourceImages(s){
  const el = $('#sourceImages');
  const pages = s?.pages || [];
  if(!pages.length){ el.innerHTML = '<p class="muted small">No hay imágenes fuente todavía.</p>'; return; }
  el.innerHTML = pages.map(page=>`
    <figure class="source-thumb">
      ${page.imageData ? `<img src="${page.imageData}" alt="Página ${page.number}">` : '<div class="thumb-empty">Sin imagen</div>'}
      <figcaption>Página ${page.number}</figcaption>
    </figure>`).join('');
}

function prepareTranscriptFromPages(s){
  if(!s) return '';
  const chunks = (s.pages || []).map(page => {
    const text = (page.text || '').trim();
    return `\n\n--- Página ${page.number} ---\n${text || ''}`;
  });
  return cleanRecoveredText(chunks.join('\n').trim());
}

async function processImageFiles(files){
  const list = Array.from(files || []);
  if(!list.length) return;
  let ok = 0;
  for(const file of list){
    if(!file.type.startsWith('image/')) continue;
    try{
      const img = await imageFileToCompressedDataUrl(file);
      await addPage({imageData:img.dataUrl,imageMeta:img,text:''});
      ok++;
    }catch(err){
      console.warn('Imagen omitida', err);
    }
  }
  toast(ok === 1 ? 'Página guardada.' : `${ok} páginas guardadas.`);
  render();
}

export function bindEvents(){
  $('#themeToggle').onclick = () => { setTheme(state.theme==='dark'?'light':'dark'); render(); };
  $('#menuToggle').onclick = () => $('#sideMenu').classList.add('open');
  $('#closeMenu').onclick = () => $('#sideMenu').classList.remove('open');
  $('#sideMenu').onclick = e => { if(e.target.id==='sideMenu') $('#sideMenu').classList.remove('open'); };

  $('#newProjectBtn').onclick = () => $('#projectDialog').showModal();
  $('#cancelProject').onclick = () => $('#projectDialog').close();
  $('#projectForm').onsubmit = async e => {
    e.preventDefault();
    await addProject({title:$('#projectTitle').value});
    $('#projectForm').reset(); $('#projectDialog').close(); toast('Proyecto creado.'); render();
  };

  $('#projectSelect').onchange = e => {setActiveProject(e.target.value); render();};
  $('#editProjectTitle').onchange = e => updateProjectFields({title:e.target.value}).then(()=>{toast('Nombre guardado.'); render();});

  document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('.tab,.tab-panel').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active'); $(`#tab-${btn.dataset.tab}`).classList.add('active');
    render(false);
  });

  $('#imageInput').onchange = async e => {
    await processImageFiles(e.target.files);
    e.target.value = '';
  };

  $('#sessionTranscript').oninput = e => scheduleTranscriptSave(e.target.value);

  $('#prepareTextBtn').onclick = async()=>{
    const s = getActiveSession();
    const prepared = prepareTranscriptFromPages(s);
    const area = $('#sessionTranscript');
    if(area.value.trim() && !confirm('Esto reemplazará la transcripción actual por la base preparada desde páginas. ¿Continuar?')) return;
    area.value = prepared;
    await updateSessionTranscript(prepared);
    toast('Texto preparado.');
    render(false);
  };

  $('#cleanTranscriptBtn').onclick = async()=>{
    const area = $('#sessionTranscript');
    area.value = cleanRecoveredText(area.value);
    await updateSessionTranscript(area.value);
    toast('Saltos limpiados.');
    render(false);
  };

  $('#copyTranscriptBtn').onclick = async()=>{
    try{
      await navigator.clipboard.writeText($('#sessionTranscript').value || '');
      toast('Texto copiado.');
    }catch{
      toast('No se pudo copiar.');
    }
  };

  $('#backupBtn').onclick = ()=> exportBackup(state.projects);
  $('#importBackupInput').onchange = async e => {
    const file = e.target.files[0]; if(!file) return;
    const text = await file.text();
    try{ const data=JSON.parse(text); await importProjects(data.projects || data); toast('Respaldo importado.'); render(); }
    catch{ toast('El JSON no pudo importarse.'); }
    e.target.value='';
  };
  $('#clearLocalBtn').onclick = async()=>{ if(confirm('¿Borrar todos los proyectos locales? Exporta un respaldo antes si quieres conservarlos.')){ await clearLocalData(); location.reload(); } };

  $('#exportProjectTxt').onclick = ()=>{ const p=getActiveProject(); if(p) downloadTxt(p); };
  $('#exportProjectHtml').onclick = ()=>{ const p=getActiveProject(); if(p) downloadHtml(p); };
  $('#exportProjectDoc').onclick = ()=>{ const p=getActiveProject(); if(p) downloadDoc(p); };
}

function escapeHtml(str=''){return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}

import { $, $$ } from './helpers.js';
import { loadLinks, saveLinks, loadSettings, saveSettings, exportState, importState } from './storage.js';
import { createLink, updateLink, deleteLink, getShortUrl, findByAlias, recordClick } from './links.js';
import { makeQr, downloadQr } from './qr.js';
import { toast, bindTabs, setActiveTab } from './ui.js';
import { copyText, download, formatDate, escapeHtml, sanitizeAlias } from './helpers.js';

let currentCreated = null;
let settings = loadSettings();
let pendingRedirect = null;

function boot(){
  document.documentElement.dataset.theme = settings.theme || 'dark';
  $('#themeToggle').textContent = settings.theme === 'light' ? '☀️' : '🌙';
  $('#baseDomain').value = settings.baseDomain || '';
  $('#apiBase').value = settings.apiBase || '';
  bindTabs();
  bindEvents();
  renderAll();
  handleHashRoute();
}

function bindEvents(){
  $('#themeToggle').addEventListener('click', () => {
    settings.theme = settings.theme === 'light' ? 'dark' : 'light';
    saveSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
    $('#themeToggle').textContent = settings.theme === 'light' ? '☀️' : '🌙';
  });

  $('#linkForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try{
      const link = createLink({
        destination: $('#longUrl').value,
        title: $('#title').value,
        alias: $('#alias').value,
        category: $('#category').value,
        note: $('#note').value,
        priority: $('#priority').checked,
        trust: $('#trust').checked
      });
      currentCreated = link;
      showCreated(link);
      $('#linkForm').reset();
      $('#trust').checked = true;
      renderAll();
      toast('RizoLink creado con éxito.');
    } catch(err){ toast(err.message); }
  });

  $('#resetForm').addEventListener('click', () => { $('#linkForm').reset(); $('#trust').checked = true; });
  $('#copyCreated').addEventListener('click', async () => { if(currentCreated){ await copyText(getShortUrl(currentCreated)); toast('Link copiado.'); }});
  $('#openCreated').addEventListener('click', () => { if(currentCreated) window.open(getShortUrl(currentCreated),'_blank'); });
  $('#downloadCreatedQr').addEventListener('click', () => safeDownloadQr($('#qrCreate'), `${currentCreated?.alias || 'rizolink'}-qr.png`));

  $('#searchLinks').addEventListener('input', renderLibrary);
  $('#filterCategory').addEventListener('change', renderLibrary);

  $('#makeQr').addEventListener('click', () => {
    const content = $('#qrInput').value.trim();
    if(!content) return toast('Pega un enlace o texto para generar QR.');
    makeQr($('#qrStudio'), content, Number($('#qrSize').value));
    $('#qrCaption').textContent = $('#qrTitle').value.trim() || 'RizoLink';
    toast('QR generado.');
  });
  $('#downloadStudioQr').addEventListener('click', () => safeDownloadQr($('#qrStudio'), 'rizolink-qr.png'));

  $('#exportBtn').addEventListener('click', () => {
    download(`rizolink-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(exportState(), null, 2));
    toast('Backup JSON exportado.');
  });
  $('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      const state = JSON.parse(await file.text());
      importState(state);
      settings = loadSettings();
      renderAll();
      toast('Backup importado.');
    } catch(err){ toast(err.message || 'No se pudo importar.'); }
    e.target.value = '';
  });

  $('#saveSettings').addEventListener('click', () => {
    settings = { ...settings, baseDomain: $('#baseDomain').value.trim(), apiBase: $('#apiBase').value.trim() };
    saveSettings(settings);
    renderLibrary();
    if(currentCreated) showCreated(currentCreated);
    toast('Ajustes guardados.');
  });

  $('#saveEdit').addEventListener('click', () => {
    try{
      updateLink($('#editId').value, {
        title: $('#editTitle').value.trim(),
        destination: $('#editUrl').value.trim(),
        alias: sanitizeAlias($('#editAlias').value),
        category: $('#editCategory').value.trim() || 'Otros',
        note: $('#editNote').value.trim(),
        priority: $('#editPriority').checked,
        trust: $('#editTrust').checked
      });
      $('#editDialog').close();
      renderAll();
      toast('Cambios guardados.');
    } catch(err){ toast(err.message); }
  });

  $('#cancelRedirect').addEventListener('click', () => closeRedirect());
  $('#confirmRedirect').addEventListener('click', () => {
    if(pendingRedirect){ recordClick(pendingRedirect.id); location.href = pendingRedirect.destination; }
  });
  window.addEventListener('hashchange', handleHashRoute);
}

function renderAll(){
  renderMetrics();
  renderFilterOptions();
  renderLibrary();
}

function renderMetrics(){
  const links = loadLinks();
  $('#metricTotal').textContent = links.length;
  $('#metricPriority').textContent = links.filter(l=>l.priority).length;
  $('#metricClicks').textContent = links.reduce((sum,l)=>sum+Number(l.clicks||0),0);
  const p = links.find(l=>l.priority) || links[0];
  $('#priorityTitle').textContent = p ? p.title : 'Aún no hay destacados';
  $('#priorityMeta').textContent = p ? `${p.alias} · ${p.category}` : 'Marca un enlace como prioritario para verlo aquí.';
}

function renderFilterOptions(){
  const sel = $('#filterCategory');
  const current = sel.value || 'all';
  const cats = [...new Set(loadLinks().map(l=>l.category).filter(Boolean))].sort();
  sel.innerHTML = '<option value="all">Todas</option>' + cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  sel.value = cats.includes(current) ? current : 'all';
}

function renderLibrary(){
  const query = $('#searchLinks').value?.toLowerCase().trim() || '';
  const cat = $('#filterCategory').value || 'all';
  const links = loadLinks().filter(l => {
    const hay = `${l.title} ${l.alias} ${l.destination} ${l.category} ${l.note}`.toLowerCase();
    return (!query || hay.includes(query)) && (cat === 'all' || l.category === cat);
  });
  $('#libraryEmpty').hidden = links.length > 0;
  $('#linksGrid').innerHTML = links.map(linkCard).join('');
  $$('.link-card').forEach(card => bindCard(card));
}

function linkCard(link){
  const short = getShortUrl(link);
  return `<article class="link-card ${link.priority ? 'priority' : ''}" data-id="${link.id}">
    <div class="link-top">
      <div>
        <h3>${escapeHtml(link.title)}</h3>
        <p>${escapeHtml(short)}</p>
      </div>
      <button class="mini-btn" data-action="priority" title="Destacar">${link.priority ? '★' : '☆'}</button>
    </div>
    <div class="chip-row">
      <span class="chip">${escapeHtml(link.category)}</span>
      <span class="chip">${Number(link.clicks || 0)} aperturas</span>
      <span class="chip">${formatDate(link.createdAt)}</span>
    </div>
    <p style="color:var(--muted);font-size:.84rem;min-height:2.45rem;word-break:break-word">${escapeHtml(link.note || link.destination)}</p>
    <div class="link-actions">
      <button class="mini-btn" data-action="copy">Copiar</button>
      <button class="mini-btn" data-action="open">Abrir</button>
      <button class="mini-btn" data-action="qr">QR</button>
      <button class="mini-btn" data-action="edit">Editar</button>
      <button class="mini-btn" data-action="delete">Borrar</button>
    </div>
  </article>`;
}

function bindCard(card){
  const id = card.dataset.id;
  const get = () => loadLinks().find(l=>l.id===id);
  card.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const link = get();
    if(!link) return;
    const action = btn.dataset.action;
    if(action === 'copy'){ await copyText(getShortUrl(link)); toast('Link copiado.'); }
    if(action === 'open'){ window.open(getShortUrl(link),'_blank'); }
    if(action === 'qr'){
      setActiveTab('qr');
      $('#qrInput').value = getShortUrl(link);
      $('#qrTitle').value = link.title;
      makeQr($('#qrStudio'), getShortUrl(link), Number($('#qrSize').value));
      $('#qrCaption').textContent = link.title;
      toast('QR enviado a QR Studio.');
    }
    if(action === 'edit') openEdit(link);
    if(action === 'delete'){
      if(confirm(`¿Borrar "${link.title}"?`)) { deleteLink(link.id); renderAll(); toast('Enlace eliminado.'); }
    }
    if(action === 'priority'){
      updateLink(link.id,{ priority: !link.priority });
      renderAll();
    }
  });
}

function showCreated(link){
  $('#emptyResult').hidden = true;
  $('#createdResult').hidden = false;
  const short = getShortUrl(link);
  $('#createdShort').textContent = short;
  $('#createdLong').textContent = link.destination;
  makeQr($('#qrCreate'), short, 220);
}

function openEdit(link){
  $('#editId').value = link.id;
  $('#editTitle').value = link.title;
  $('#editUrl').value = link.destination;
  $('#editAlias').value = link.alias;
  $('#editCategory').value = link.category;
  $('#editNote').value = link.note || '';
  $('#editPriority').checked = Boolean(link.priority);
  $('#editTrust').checked = Boolean(link.trust);
  $('#editDialog').showModal();
}

function safeDownloadQr(container, filename){
  try{ downloadQr(container, filename); }
  catch(err){ toast(err.message); }
}

function handleHashRoute(){
  const match = location.hash.match(/^#r\/([a-z0-9-]+)/i);
  if(!match) return;
  const alias = match[1];
  const link = findByAlias(alias);
  $('#redirectOverlay').hidden = false;
  $('#confirmRedirect').hidden = true;
  if(!link){
    $('#redirectText').textContent = 'No encontramos ese alias en esta biblioteca local. Si quieres enlaces públicos, despliega el backend incluido.';
    return;
  }
  pendingRedirect = link;
  if(link.trust){
    $('#redirectText').textContent = `${link.title} → ${link.destination}`;
    $('#confirmRedirect').hidden = false;
  } else {
    recordClick(link.id);
    location.href = link.destination;
  }
}

function closeRedirect(){
  pendingRedirect = null;
  $('#redirectOverlay').hidden = true;
  $('#confirmRedirect').hidden = true;
  if(location.hash.startsWith('#r/')) history.replaceState(null,'',location.pathname + location.search);
}

boot();

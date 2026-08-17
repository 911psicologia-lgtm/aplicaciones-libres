import { SessionStore } from './store.js';
import { fileToItem, formatBytes, sanitizeFileName, downloadBlob } from './utils.js';
import { createMixedPdf, exportImages } from './pdf-engine.js';
import { CameraController } from './camera.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const TOOL_CONFIG = {
  scan: { icon: '📷', eyebrow: 'ESCÁNER MULTIPÁGINA', title: 'Escanear con cámara', hint: 'Captura una o varias páginas y combínalas en PDF o imágenes.', accept: 'image/*,.pdf' },
  'image-pdf': { icon: '🖼️', eyebrow: 'CONVERSIÓN MULTIARCHIVO', title: 'Imagen a PDF', hint: 'JPG, PNG y WEBP. Selecciona muchas imágenes y ordénalas antes de crear.', accept: 'image/*,.jpg,.jpeg,.png,.webp' },
  merge: { icon: '🔗', eyebrow: 'PDF MIXTO', title: 'Unir y crear PDF mixto', hint: 'Mezcla PDF, imágenes y capturas nuevas en un único documento.', accept: '.pdf,image/*,.jpg,.jpeg,.png,.webp' },
  organize: { icon: '▦', eyebrow: 'ORGANIZADOR', title: 'Organizar documentos', hint: 'Reordena archivos y capturas antes de generar el documento final.', accept: '.pdf,image/*,.jpg,.jpeg,.png,.webp' },
  'document-pdf': { icon: '📄', eyebrow: 'DOCUMENTOS · FASE 2', title: 'Documento a PDF', hint: 'Conversión Word, Excel y PowerPoint se integrará como motor separado.', accept: '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.html,.rtf' },
  split: { icon: '✂️', eyebrow: 'PDF · FASE 2', title: 'Dividir PDF', hint: 'Extracción por página y rangos se incorporará en la siguiente iteración.', accept: '.pdf' },
  compress: { icon: '🗜️', eyebrow: 'OPTIMIZACIÓN', title: 'Comprimir PDF', hint: 'Prototipo: prepara documentos; la recompresión avanzada de páginas PDF llega en la siguiente fase.', accept: '.pdf,image/*' },
  convert: { icon: '🔄', eyebrow: 'CONVERSIÓN', title: 'Convertir PDF', hint: 'Módulo de conversión en construcción.', accept: '.pdf' },
  ocr: { icon: '🔎', eyebrow: 'OCR · FASE 2', title: 'Reconocer texto', hint: 'OCR avanzado se conectará en la siguiente iteración.', accept: '.pdf,image/*' },
  sign: { icon: '✍️', eyebrow: 'EDICIÓN · BETA', title: 'Editar y firmar', hint: 'Firma y anotaciones se incorporarán después del núcleo multiarchivo.', accept: '.pdf,image/*' }
};

const state = {
  currentTool: 'merge',
  outputFormat: 'pdf',
  pageSize: 'a4',
  cameraCaptures: 0,
  installPrompt: null,
  splashDone: false
};

const store = new SessionStore();
const els = {};
let camera;

function cacheEls() {
  Object.assign(els, {
    splash: $('#splash'), mainShell: $('#mainShell'), home: $('#homeScreen'), workspace: $('#workspaceScreen'),
    enterApp: $('#enterApp'), skipSplash: $('#skipSplash'), brandHome: $('#brandHome'), workspaceBack: $('#workspaceBack'),
    moreToggle: $('#moreToolsToggle'), moreTools: $('#moreTools'), moreChevron: $('#moreChevron'),
    globalUploadBtn: $('#globalUploadBtn'), globalCameraBtn: $('#globalCameraBtn'), fileInput: $('#fileInput'),
    workspaceIcon: $('#workspaceIcon'), workspaceEyebrow: $('#workspaceEyebrow'), workspaceTitle: $('#workspaceTitle'), dropHint: $('#dropHint'),
    queueBadge: $('#queueBadge'), dropZone: $('#dropZone'), fileArea: $('#fileArea'), fileList: $('#fileList'),
    outputName: $('#outputName'), autoFit: $('#autoFit'), safeMargin: $('#safeMargin'), statItems: $('#statItems'), statSize: $('#statSize'),
    exportBtn: $('#exportBtn'), exportLabel: $('#exportLabel'), panelNote: $('#panelNote'), panel: $('#workspacePanel'), mobilePanelToggle: $('#mobilePanelToggle'),
    cameraModal: $('#cameraModal'), cameraVideo: $('#cameraVideo'), cameraCanvas: $('#cameraCanvas'), cameraStatus: $('#cameraStatus'),
    closeCamera: $('#closeCamera'), finishCamera: $('#finishCamera'), captureBtn: $('#captureBtn'), switchCameraBtn: $('#switchCameraBtn'), cameraAutoEnhance: $('#cameraAutoEnhance'), captureCount: $('#captureCount'),
    progressModal: $('#progressModal'), progressTitle: $('#progressTitle'), progressText: $('#progressText'), progressBar: $('#progressBar'),
    toast: $('#toast'), installBtn: $('#installBtn'), template: $('#fileCardTemplate')
  });
  camera = new CameraController({ video: els.cameraVideo, canvas: els.cameraCanvas, statusEl: els.cameraStatus });
}

function completeSplash() {
  if (state.splashDone) return;
  state.splashDone = true;
  els.splash.classList.add('hidden');
  els.mainShell.classList.remove('hidden');
  showHome();
}

function showHome() {
  els.home.classList.add('active');
  els.workspace.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openWorkspace(tool = 'merge', { autoCamera = false, autoUpload = false } = {}) {
  const config = TOOL_CONFIG[tool] || TOOL_CONFIG.merge;
  state.currentTool = tool;
  state.outputFormat = 'pdf';
  $$('#outputFormatGroup button').forEach(btn => btn.classList.toggle('selected', btn.dataset.outputFormat === 'pdf'));
  els.workspaceIcon.textContent = config.icon;
  els.workspaceEyebrow.textContent = config.eyebrow;
  els.workspaceTitle.textContent = config.title;
  els.dropHint.textContent = config.hint;
  els.fileInput.accept = config.accept;
  els.home.classList.remove('active');
  els.workspace.classList.add('active');
  if (innerWidth <= 820) els.panel.classList.add('mobile-collapsed');
  updateExportContext();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (['ocr','sign','convert','document-pdf','split'].includes(tool)) {
    showToast('Este módulo está representado en el prototipo, pero su motor completo se integrará en la siguiente fase.');
  }
  if (autoCamera) setTimeout(openCamera, 120);
  if (autoUpload) setTimeout(() => els.fileInput.click(), 120);
}

function updateExportContext() {
  const format = state.outputFormat.toUpperCase();
  const labels = {
    scan: `Crear ${format}`,
    'image-pdf': state.outputFormat === 'pdf' ? 'Crear PDF' : `Descargar ${format}`,
    merge: state.outputFormat === 'pdf' ? 'Crear PDF mixto' : `Exportar ${format}`,
    organize: state.outputFormat === 'pdf' ? 'Crear documento' : `Exportar ${format}`,
    compress: 'Crear PDF optimizado'
  };
  els.exportLabel.textContent = labels[state.currentTool] || `Crear ${format}`;
  if (state.outputFormat !== 'pdf' && store.items.some(i => i.kind === 'pdf')) {
    els.panelNote.textContent = 'JPG/PNG exportará únicamente las imágenes y capturas. Para incluir PDF usa salida PDF.';
  } else {
    els.panelNote.textContent = 'El procesamiento se realiza en tu navegador siempre que sea posible.';
  }
}

async function handleFiles(fileList, source = 'archivo') {
  const files = [...fileList];
  if (!files.length) return;
  const accepted = [];
  const rejected = [];
  for (const file of files) {
    try {
      const item = await fileToItem(file, source);
      if (item.kind === 'unsupported') rejected.push(file.name);
      else accepted.push(item);
    } catch (_) { rejected.push(file.name); }
  }
  if (accepted.length) store.addMany(accepted);
  if (rejected.length) showToast(`No se pudieron añadir: ${rejected.slice(0, 2).join(', ')}${rejected.length > 2 ? '…' : ''}`);
  if (!els.workspace.classList.contains('active')) openWorkspace('merge');
}

function renderFiles(items) {
  els.fileList.innerHTML = '';
  const hasItems = items.length > 0;
  els.dropZone.classList.toggle('hidden', hasItems);
  els.fileArea.classList.toggle('hidden', !hasItems);
  els.queueBadge.textContent = `${items.length} ${items.length === 1 ? 'archivo' : 'archivos'}`;
  els.statItems.textContent = String(items.length);
  els.statSize.textContent = formatBytes(store.totalBytes);
  els.exportBtn.disabled = !hasItems;

  items.forEach((item, index) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = item.id;
    $('.file-name', node).textContent = item.name;
    $('.file-sub', node).textContent = `${formatBytes(item.size)} · ${item.kind === 'pdf' ? 'PDF' : 'Imagen'}`;
    const preview = $('.file-preview', node);
    if (item.kind === 'image' && item.previewUrl) {
      const img = new Image(); img.src = item.previewUrl; img.alt = ''; preview.appendChild(img);
    } else {
      const badge = document.createElement('div'); badge.className = 'pdf-preview'; badge.textContent = 'PDF'; preview.appendChild(badge);
    }
    const tags = $('.file-tags', node);
    const orderTag = document.createElement('span'); orderTag.className = 'file-tag'; orderTag.textContent = `#${index + 1}`; tags.appendChild(orderTag);
    if (item.pageCount) { const t = document.createElement('span'); t.className = 'file-tag'; t.textContent = `${item.pageCount} pág.`; tags.appendChild(t); }
    if (item.source === 'camera') { const t = document.createElement('span'); t.className = 'file-tag camera'; t.textContent = 'Cámara'; tags.appendChild(t); }

    $('.remove-file', node).addEventListener('click', () => store.remove(item.id));
    $('.move-up', node).addEventListener('click', () => store.move(item.id, -1));
    $('.move-down', node).addEventListener('click', () => store.move(item.id, 1));
    node.addEventListener('dragstart', e => { node.classList.add('dragging'); e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'move'; });
    node.addEventListener('dragend', () => { node.classList.remove('dragging'); $$('.file-card').forEach(n => n.classList.remove('drag-target')); });
    node.addEventListener('dragover', e => { e.preventDefault(); node.classList.add('drag-target'); });
    node.addEventListener('dragleave', () => node.classList.remove('drag-target'));
    node.addEventListener('drop', e => { e.preventDefault(); node.classList.remove('drag-target'); store.reorder(e.dataTransfer.getData('text/plain'), item.id); });
    els.fileList.appendChild(node);
  });
}

async function openCamera() {
  completeSplash();
  if (!els.workspace.classList.contains('active')) openWorkspace('scan');
  els.cameraModal.classList.remove('hidden');
  state.cameraCaptures = 0;
  updateCaptureCount();
  try { await camera.open(); }
  catch (error) { showToast(error.message || 'No se pudo abrir la cámara.'); }
}

async function closeCamera() {
  await camera.stop();
  els.cameraModal.classList.add('hidden');
}

function updateCaptureCount() {
  els.captureCount.textContent = `${state.cameraCaptures} ${state.cameraCaptures === 1 ? 'página' : 'páginas'}`;
}

async function capturePage() {
  try {
    els.captureBtn.disabled = true;
    const file = await camera.capture({ autoEnhance: els.cameraAutoEnhance.checked });
    const item = await fileToItem(file, 'camera');
    store.add(item);
    state.cameraCaptures += 1;
    updateCaptureCount();
    if (navigator.vibrate) navigator.vibrate(40);
  } catch (error) { showToast(error.message || 'No se pudo capturar la página.'); }
  finally { els.captureBtn.disabled = false; }
}

function setProgress(percent, text) {
  els.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  if (text) els.progressText.textContent = text;
}

async function exportCurrent() {
  if (!store.items.length) return;
  const name = sanitizeFileName(els.outputName.value);
  els.progressModal.classList.remove('hidden');
  els.progressTitle.textContent = state.outputFormat === 'pdf' ? 'Creando documento…' : 'Preparando imágenes…';
  setProgress(2, 'Iniciando…');
  try {
    if (state.outputFormat === 'pdf') {
      const blob = await createMixedPdf(store.items, {
        pageSize: state.pageSize,
        safeMargin: els.safeMargin.checked,
        autoFit: els.autoFit.checked,
        imageQuality: state.currentTool === 'compress' ? 0.72 : 0.9
      }, setProgress);
      downloadBlob(blob, `${name}.pdf`);
      showToast('Documento creado. La descarga comenzó correctamente.');
    } else {
      await exportImages(store.items, state.outputFormat, name, setProgress);
      showToast(`Imágenes ${state.outputFormat.toUpperCase()} preparadas.`);
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Ocurrió un error al procesar los archivos.');
  } finally {
    setTimeout(() => { els.progressModal.classList.add('hidden'); setProgress(0, ''); }, 450);
  }
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 3800);
}

function bindEvents() {
  els.enterApp.addEventListener('click', completeSplash);
  els.skipSplash.addEventListener('click', completeSplash);
  els.brandHome.addEventListener('click', showHome);
  els.workspaceBack.addEventListener('click', showHome);

  els.moreToggle.addEventListener('click', () => {
    const expanded = els.moreToggle.getAttribute('aria-expanded') === 'true';
    els.moreToggle.setAttribute('aria-expanded', String(!expanded));
    els.moreTools.classList.toggle('collapsed', expanded);
    els.moreChevron.textContent = expanded ? '⌄' : '⌃';
  });

  $$('[data-tool]').forEach(btn => btn.addEventListener('click', () => {
    const tool = btn.dataset.tool;
    openWorkspace(tool, { autoCamera: tool === 'scan' });
  }));

  $$('[data-action="upload"]').forEach(btn => btn.addEventListener('click', () => {
    completeSplash();
    if (!els.workspace.classList.contains('active')) openWorkspace('merge');
    els.fileInput.click();
  }));
  $$('[data-action="camera"]').forEach(btn => btn.addEventListener('click', openCamera));
  els.globalUploadBtn.addEventListener('click', () => { if (!els.workspace.classList.contains('active')) openWorkspace('merge'); els.fileInput.click(); });
  els.globalCameraBtn.addEventListener('click', openCamera);

  els.fileInput.addEventListener('change', async e => { await handleFiles(e.target.files); e.target.value = ''; });

  ['dragenter','dragover'].forEach(type => els.dropZone.addEventListener(type, e => { e.preventDefault(); els.dropZone.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(type => els.dropZone.addEventListener(type, e => { e.preventDefault(); els.dropZone.classList.remove('dragover'); }));
  els.dropZone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

  $$('#pageSizeGroup button').forEach(btn => btn.addEventListener('click', () => {
    state.pageSize = btn.dataset.pageSize;
    $$('#pageSizeGroup button').forEach(b => b.classList.toggle('selected', b === btn));
  }));
  $$('#outputFormatGroup button').forEach(btn => btn.addEventListener('click', () => {
    state.outputFormat = btn.dataset.outputFormat;
    $$('#outputFormatGroup button').forEach(b => b.classList.toggle('selected', b === btn));
    updateExportContext();
  }));

  els.mobilePanelToggle.addEventListener('click', () => {
    const collapsed = els.panel.classList.toggle('mobile-collapsed');
    els.mobilePanelToggle.setAttribute('aria-expanded', String(!collapsed));
    els.mobilePanelToggle.lastElementChild.textContent = collapsed ? '⌃' : '⌄';
  });

  els.closeCamera.addEventListener('click', closeCamera);
  els.finishCamera.addEventListener('click', closeCamera);
  els.captureBtn.addEventListener('click', capturePage);
  els.switchCameraBtn.addEventListener('click', async () => {
    try { await camera.switchCamera(); } catch (error) { showToast(error.message || 'No se pudo cambiar la cámara.'); }
  });
  els.cameraModal.addEventListener('click', e => { if (e.target === els.cameraModal) closeCamera(); });
  els.exportBtn.addEventListener('click', exportCurrent);

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); state.installPrompt = e; els.installBtn.classList.remove('hidden');
  });
  els.installBtn.addEventListener('click', async () => {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    await state.installPrompt.userChoice;
    state.installPrompt = null; els.installBtn.classList.add('hidden');
  });
}

function registerPwa() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.warn));
  }
}

function init() {
  cacheEls();
  bindEvents();
  store.subscribe(renderFiles);
  renderFiles(store.items);
  registerPwa();
  setTimeout(completeSplash, 1900);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

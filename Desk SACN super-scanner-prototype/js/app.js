import { SessionStore } from './store.js';
import { fileToItem, formatBytes, sanitizeFileName, downloadBlob, isPdf, isImage } from './utils.js';
import { createMixedPdf, exportImages } from './pdf-engine.js';
import { inspectPdfFile, pdfFileToPageItems, parsePageRange, unlockPdfByRendering } from './pdf-tools.js';
import { CameraController } from './camera.js';
import { ScanEditor } from './scan-editor.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const TOOL_CONFIG = {
  scan: { icon: '📷', eyebrow: 'ESCÁNER MULTIPÁGINA', title: 'Escanear con cámara', hint: 'Captura la foto completa, ajusta las 4 esquinas y crea PDF o imágenes sin perder texto.', accept: 'image/*,.pdf' },
  'image-pdf': { icon: '🖼️', eyebrow: 'CONVERSIÓN MULTIARCHIVO', title: 'Imagen a PDF', hint: 'JPG, PNG y WEBP. Selecciona muchas imágenes y ordénalas antes de crear.', accept: 'image/*,.jpg,.jpeg,.png,.webp' },
  merge: { icon: '🔗', eyebrow: 'PDF MIXTO', title: 'Unir y crear PDF mixto', hint: 'Mezcla PDF, imágenes y capturas nuevas en un único documento.', accept: '.pdf,image/*,.jpg,.jpeg,.png,.webp' },
  organize: { icon: '▦', eyebrow: 'ORGANIZADOR POR PÁGINAS', title: 'Organizar PDF y documentos', hint: 'Los PDF se abren por páginas para reordenar, rotar, duplicar o eliminar.', accept: '.pdf,image/*,.jpg,.jpeg,.png,.webp' },
  split: { icon: '✂️', eyebrow: 'DIVIDIR PDF', title: 'Extraer páginas de un PDF', hint: 'Carga un PDF y selecciona páginas o rangos. Se mostrará cada página por separado.', accept: '.pdf' },
  unlock: { icon: '🔓', eyebrow: 'PDF PROTEGIDO', title: 'Quitar contraseña de PDF', hint: 'Carga un PDF protegido, ingresa la contraseña válida y descarga una copia sin clave.', accept: '.pdf' },
  compress: { icon: '🗜️', eyebrow: 'OPTIMIZACIÓN · BETA', title: 'Optimizar PDF', hint: 'Optimización básica para imágenes y escaneos. La compresión profunda de PDF llegará después.', accept: '.pdf,image/*' }
};

const state = {
  currentTool: 'merge',
  outputFormat: 'pdf',
  pageSize: 'a4',
  cameraCaptures: 0,
  installPrompt: null,
  splashDone: false,
  processingFiles: false,
  adjustContext: null
};

const store = new SessionStore();
const els = {};
let camera;
let scanEditor;

function cacheEls() {
  Object.assign(els, {
    splash: $('#splash'), mainShell: $('#mainShell'), home: $('#homeScreen'), workspace: $('#workspaceScreen'),
    enterApp: $('#enterApp'), skipSplash: $('#skipSplash'), brandHome: $('#brandHome'), workspaceBack: $('#workspaceBack'),
    moreToggle: $('#moreToolsToggle'), moreTools: $('#moreTools'), moreChevron: $('#moreChevron'),
    globalUploadBtn: $('#globalUploadBtn'), globalCameraBtn: $('#globalCameraBtn'), fileInput: $('#fileInput'),
    workspaceIcon: $('#workspaceIcon'), workspaceEyebrow: $('#workspaceEyebrow'), workspaceTitle: $('#workspaceTitle'), dropHint: $('#dropHint'),
    queueBadge: $('#queueBadge'), dropZone: $('#dropZone'), fileArea: $('#fileArea'), fileList: $('#fileList'),
    outputName: $('#outputName'), autoFit: $('#autoFit'), safeMargin: $('#safeMargin'), statItems: $('#statItems'), statItemsLabel: $('#statItemsLabel'), statSize: $('#statSize'),
    exportBtn: $('#exportBtn'), exportLabel: $('#exportLabel'), panelNote: $('#panelNote'), panel: $('#workspacePanel'), mobilePanelToggle: $('#mobilePanelToggle'),
    outputFormatBlock: $('#outputFormatBlock'), pageSizeBlock: $('#pageSizeBlock'), adjustBlock: $('#adjustBlock'), splitOptions: $('#splitOptions'), unlockOptions: $('#unlockOptions'),
    pageRange: $('#pageRange'), pdfPassword: $('#pdfPassword'), togglePassword: $('#togglePassword'),
    cameraModal: $('#cameraModal'), cameraVideo: $('#cameraVideo'), cameraCanvas: $('#cameraCanvas'), cameraStatus: $('#cameraStatus'),
    cameraCaptureView: $('#cameraCaptureView'), cameraEyebrow: $('#cameraEyebrow'), cameraTitle: $('#cameraTitle'), cameraModeBadge: $('#cameraModeBadge'),
    closeCamera: $('#closeCamera'), finishCamera: $('#finishCamera'), captureBtn: $('#captureBtn'), switchCameraBtn: $('#switchCameraBtn'), cameraQuickMode: $('#cameraQuickMode'), captureCount: $('#captureCount'), captureStrip: $('#captureStrip'),
    scanAdjustView: $('#scanAdjustView'), scanAdjustCanvas: $('#scanAdjustCanvas'), scanMagnifier: $('#scanMagnifier'), scanAdjustStatus: $('#scanAdjustStatus'), scanAdjustTitle: $('#scanAdjustTitle'),
    autoEdgesBtn: $('#autoEdgesBtn'), rotateScanBtn: $('#rotateScanBtn'), scanFilterGroup: $('#scanFilterGroup'), retakeScanBtn: $('#retakeScanBtn'), confirmScanBtn: $('#confirmScanBtn'),
    progressModal: $('#progressModal'), progressTitle: $('#progressTitle'), progressText: $('#progressText'), progressBar: $('#progressBar'),
    toast: $('#toast'), installBtn: $('#installBtn'), template: $('#fileCardTemplate')
  });
  camera = new CameraController({ video: els.cameraVideo, canvas: els.cameraCanvas, statusEl: els.cameraStatus });
  scanEditor = new ScanEditor({ canvas: els.scanAdjustCanvas, magnifier: els.scanMagnifier, statusEl: els.scanAdjustStatus });
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
  if (els.pdfPassword) els.pdfPassword.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setOutputPdfOnly() {
  state.outputFormat = 'pdf';
  $$('#outputFormatGroup button').forEach(btn => btn.classList.toggle('selected', btn.dataset.outputFormat === 'pdf'));
}

function configureToolPanel(tool) {
  const pdfOnly = ['organize', 'split', 'unlock'].includes(tool);
  els.outputFormatBlock.classList.toggle('hidden', pdfOnly);
  els.pageSizeBlock.classList.toggle('hidden', ['split', 'unlock'].includes(tool));
  els.adjustBlock.classList.toggle('hidden', ['split', 'unlock'].includes(tool));
  els.splitOptions.classList.toggle('hidden', tool !== 'split');
  els.unlockOptions.classList.toggle('hidden', tool !== 'unlock');
  els.statItemsLabel.textContent = ['organize', 'split'].includes(tool) ? 'Páginas / elementos' : 'Elementos';
  if (pdfOnly) setOutputPdfOnly();

  if (tool === 'unlock') {
    els.panelNote.textContent = 'La contraseña no se guarda ni se envía al servidor. v0.2 reconstruye visualmente las páginas en un PDF nuevo sin clave.';
  } else if (tool === 'split') {
    els.panelNote.textContent = 'Carga un PDF. Puedes borrar páginas visualmente o escribir un rango como 1,3,5-8.';
  } else if (tool === 'organize') {
    els.panelNote.textContent = 'Los PDF se convierten en tarjetas de página para que puedas ordenar, rotar, duplicar y eliminar antes de crear el nuevo PDF.';
  } else if (tool === 'compress') {
    els.panelNote.textContent = 'Beta: comprime principalmente imágenes y capturas al reconstruir el PDF. La compresión estructural avanzada llegará en una fase posterior.';
  } else {
    els.panelNote.textContent = 'El procesamiento se realiza en tu navegador siempre que sea posible.';
  }
}

function openWorkspace(tool = 'merge', { autoCamera = false, autoUpload = false } = {}) {
  const config = TOOL_CONFIG[tool] || TOOL_CONFIG.merge;
  const previousTool = state.currentTool;
  if (tool !== previousTool && ['organize', 'split', 'unlock'].includes(tool)) store.clear();
  state.currentTool = tool;
  state.outputFormat = 'pdf';
  els.workspaceIcon.textContent = config.icon;
  els.workspaceEyebrow.textContent = config.eyebrow;
  els.workspaceTitle.textContent = config.title;
  els.dropHint.textContent = config.hint;
  els.fileInput.accept = config.accept;
  els.fileInput.multiple = !['split', 'unlock'].includes(tool);
  els.home.classList.remove('active');
  els.workspace.classList.add('active');
  if (innerWidth <= 820) els.panel.classList.add('mobile-collapsed');
  if (tool === 'unlock') els.pdfPassword.value = '';
  if (tool === 'split') els.pageRange.value = '';
  configureToolPanel(tool);
  updateExportContext();
  renderFiles(store.items);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (autoCamera) setTimeout(openCamera, 120);
  if (autoUpload) setTimeout(() => els.fileInput.click(), 120);
}

function updateExportContext() {
  const format = state.outputFormat.toUpperCase();
  const labels = {
    scan: `Crear ${format}`,
    'image-pdf': state.outputFormat === 'pdf' ? 'Crear PDF' : `Descargar ${format}`,
    merge: state.outputFormat === 'pdf' ? 'Crear PDF mixto' : `Exportar ${format}`,
    organize: 'Crear PDF organizado',
    split: 'Extraer páginas',
    unlock: 'Descargar sin contraseña',
    compress: 'Crear PDF optimizado'
  };
  els.exportLabel.textContent = labels[state.currentTool] || `Crear ${format}`;

  if (!['unlock', 'split', 'organize', 'compress'].includes(state.currentTool)) {
    if (state.outputFormat !== 'pdf' && store.items.some(i => ['pdf', 'pdf-page'].includes(i.kind))) {
      els.panelNote.textContent = 'JPG/PNG exportará únicamente las imágenes y capturas. Para incluir PDF usa salida PDF.';
    } else {
      els.panelNote.textContent = 'El procesamiento se realiza en tu navegador siempre que sea posible.';
    }
  }
  refreshExportState();
}

function refreshExportState() {
  const count = store.items.length;
  let disabled = count === 0 || state.processingFiles;
  if (state.currentTool === 'unlock') disabled = disabled || count !== 1 || store.items[0]?.kind !== 'pdf';
  if (state.currentTool === 'split') disabled = disabled || !store.items.some(i => i.kind === 'pdf-page');
  els.exportBtn.disabled = disabled;
}

function openProgress(title, text = 'Procesando…') {
  els.progressTitle.textContent = title;
  els.progressText.textContent = text;
  setProgress(1, text);
  els.progressModal.classList.remove('hidden');
}

function closeProgress(delay = 250) {
  setTimeout(() => {
    els.progressModal.classList.add('hidden');
    setProgress(0, '');
  }, delay);
}

async function addStandardFile(file, source = 'archivo') {
  const item = await fileToItem(file, source);
  if (item.kind === 'pdf' && window.PDFLib?.PDFDocument) {
    try {
      const pdf = await window.PDFLib.PDFDocument.load(await file.arrayBuffer());
      item.pageCount = pdf.getPageCount();
      item.encrypted = false;
    } catch (error) {
      if (/encrypt/i.test(String(error?.message || error))) {
        item.encrypted = true;
        const friendly = new Error(`“${file.name}” está protegido. Usa Quitar contraseña antes de combinarlo.`);
        friendly.code = 'PDF_PASSWORD_REQUIRED';
        throw friendly;
      }
      throw error;
    }
  }
  return item;
}

async function handleFiles(fileList, source = 'archivo') {
  const files = [...fileList];
  if (!files.length) return;
  if (!els.workspace.classList.contains('active')) openWorkspace('merge');

  state.processingFiles = true;
  refreshExportState();
  const rejected = [];

  try {
    if (state.currentTool === 'unlock') {
      const file = files.find(isPdf);
      if (!file) throw new Error('Selecciona un archivo PDF.');
      store.clear();
      openProgress('Analizando PDF…', 'Comprobando si está protegido…');
      const item = await fileToItem(file, source);
      const info = await inspectPdfFile(file);
      item.pageCount = info.pageCount;
      item.encrypted = Boolean(info.passwordRequired || info.encrypted);
      store.add(item);
      if (!item.encrypted) showToast('Este PDF no parece requerir contraseña. Puedes crear igualmente una copia nueva sin protección.');
      return;
    }

    if (state.currentTool === 'split') {
      const file = files.find(isPdf);
      if (!file) throw new Error('Selecciona un PDF para dividir.');
      store.clear();
      openProgress('Abriendo PDF…', 'Preparando miniaturas de páginas…');
      const pages = await pdfFileToPageItems(file, { onProgress: setProgress });
      store.addMany(pages);
      els.outputName.value = sanitizeFileName(file.name.replace(/\.pdf$/i, '')) + '-extraido';
      return;
    }

    const pageMode = state.currentTool === 'organize';
    if (pageMode) openProgress('Preparando páginas…', 'Leyendo documentos…');

    const accepted = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (pageMode && isPdf(file)) {
          const pages = await pdfFileToPageItems(file, {
            onProgress: (pct, text) => setProgress(Math.round(((i + pct / 100) / files.length) * 96), text)
          });
          accepted.push(...pages);
        } else if (pageMode && isImage(file)) {
          accepted.push(await fileToItem(file, source));
        } else {
          const item = await addStandardFile(file, source);
          if (item.kind === 'unsupported') rejected.push(file.name); else accepted.push(item);
        }
      } catch (error) {
        rejected.push(file.name);
        if (error.code === 'PDF_PASSWORD_REQUIRED') showToast(error.message);
      }
    }
    if (accepted.length) store.addMany(accepted);
    if (rejected.length && !rejected.every(name => files.find(f => f.name === name && isPdf(f)))) {
      showToast(`No se pudieron añadir: ${rejected.slice(0, 2).join(', ')}${rejected.length > 2 ? '…' : ''}`);
    }
  } catch (error) {
    console.error(error);
    if (error.code === 'PDF_PASSWORD_REQUIRED') showToast('Este PDF está protegido. Usa primero “Quitar contraseña”.');
    else showToast(error.message || 'No se pudieron procesar los archivos.');
  } finally {
    state.processingFiles = false;
    refreshExportState();
    if (!els.progressModal.classList.contains('hidden')) closeProgress();
  }
}

function typeLabel(item) {
  if (item.kind === 'pdf-page') return `Página ${item.pageNumber} · PDF`;
  if (item.kind === 'pdf') return item.encrypted ? 'PDF protegido' : 'PDF';
  return 'Imagen';
}

function renderFiles(items) {
  els.fileList.innerHTML = '';
  const hasItems = items.length > 0;
  els.dropZone.classList.toggle('hidden', hasItems);
  els.fileArea.classList.toggle('hidden', !hasItems);
  const noun = ['organize', 'split'].includes(state.currentTool) ? (items.length === 1 ? 'página/elemento' : 'páginas/elementos') : (items.length === 1 ? 'archivo' : 'archivos');
  els.queueBadge.textContent = `${items.length} ${noun}`;
  els.statItems.textContent = String(items.length);
  els.statSize.textContent = formatBytes(store.totalBytes);
  refreshExportState();

  items.forEach((item, index) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = item.id;
    if (item.kind === 'pdf-page') node.classList.add('page-card');
    $('.file-name', node).textContent = item.kind === 'pdf-page' ? `${item.sourceName} · pág. ${item.pageNumber}` : item.name;
    $('.file-sub', node).textContent = `${formatBytes(item.size)} · ${typeLabel(item)}`;
    const preview = $('.file-preview', node);
    if ((item.kind === 'image' || item.kind === 'pdf-page') && item.previewUrl) {
      const img = new Image();
      img.src = item.previewUrl;
      img.alt = '';
      img.style.transform = `rotate(${item.rotation || 0}deg)`;
      preview.appendChild(img);
    } else {
      const badge = document.createElement('div');
      badge.className = `pdf-preview${item.encrypted ? ' locked' : ''}`;
      badge.textContent = item.encrypted ? '🔒 PDF' : 'PDF';
      preview.appendChild(badge);
    }
    const tags = $('.file-tags', node);
    const orderTag = document.createElement('span'); orderTag.className = 'file-tag'; orderTag.textContent = `#${index + 1}`; tags.appendChild(orderTag);
    if (item.pageCount && item.kind !== 'pdf-page') { const t = document.createElement('span'); t.className = 'file-tag'; t.textContent = `${item.pageCount} pág.`; tags.appendChild(t); }
    if (item.kind === 'pdf-page') { const t = document.createElement('span'); t.className = 'file-tag page'; t.textContent = `Pág. ${item.pageNumber}`; tags.appendChild(t); }
    if (item.source === 'camera') { const t = document.createElement('span'); t.className = 'file-tag camera'; t.textContent = 'Cámara'; tags.appendChild(t); }
    if (item.needsReview) { const t = document.createElement('span'); t.className = 'file-tag review'; t.textContent = '⚠ Revisar bordes'; tags.appendChild(t); node.classList.add('needs-review'); }
    if (item.rotation) { const t = document.createElement('span'); t.className = 'file-tag'; t.textContent = `${item.rotation}°`; tags.appendChild(t); }

    const adjustBtn = $('.adjust-file', node);
    if (item.kind === 'image') adjustBtn.addEventListener('click', () => openImageAdjust(item));
    else adjustBtn.classList.add('hidden');
    $('.remove-file', node).addEventListener('click', () => store.remove(item.id));
    $('.move-up', node).addEventListener('click', () => store.move(item.id, -1));
    $('.move-down', node).addEventListener('click', () => store.move(item.id, 1));
    $('.rotate-file', node).addEventListener('click', () => store.rotate(item.id, 90));
    $('.duplicate-file', node).addEventListener('click', () => store.duplicate(item.id));

    if (state.currentTool === 'unlock') {
      $$('.adjust-file,.rotate-file,.duplicate-file,.move-up,.move-down', node).forEach(btn => btn.classList.add('hidden'));
    }

    node.addEventListener('dragstart', e => {
      node.classList.add('dragging');
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';
    });
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
  if (['split', 'unlock'].includes(state.currentTool)) {
    showToast('Esta herramienta trabaja con PDF cargados; la cámara no se usa en este modo.');
    return;
  }
  state.adjustContext = null;
  els.cameraModal.classList.remove('hidden');
  showCameraCaptureView();
  state.cameraCaptures = 0;
  updateCaptureCount();
  renderCaptureStrip();
  try { await camera.open(); }
  catch (error) { showToast(error.message || 'No se pudo abrir la cámara.'); }
}

function showCameraCaptureView() {
  els.cameraCaptureView.classList.remove('hidden');
  els.scanAdjustView.classList.add('hidden');
  els.cameraEyebrow.textContent = 'CAPTURA MULTIPÁGINA';
  els.cameraTitle.textContent = 'Escanear con cámara';
  els.cameraModeBadge.textContent = 'Captura';
  state.adjustContext = null;
  if (camera.stream) els.cameraVideo.play().catch(() => {});
}

async function showScanAdjustView(file, context) {
  state.adjustContext = context;
  els.cameraModal.classList.remove('hidden');
  els.cameraCaptureView.classList.add('hidden');
  els.scanAdjustView.classList.remove('hidden');
  els.cameraEyebrow.textContent = context.type === 'item' ? 'REVISIÓN DE PÁGINA' : 'AJUSTE DESPUÉS DE CAPTURA';
  els.cameraTitle.textContent = 'Ajustar escaneo';
  els.cameraModeBadge.textContent = '4 esquinas';
  els.scanAdjustTitle.textContent = context.type === 'item' ? 'Reajustar página' : 'Ajustar página capturada';
  els.retakeScanBtn.textContent = context.type === 'item' ? '← Cancelar' : '↶ Repetir foto';
  $$('[data-scan-filter]').forEach(btn => btn.classList.toggle('selected', btn.dataset.scanFilter === 'document'));
  scanEditor.setFilter('document');
  if (context.returnTo === 'camera') els.cameraVideo.pause?.();
  try { await scanEditor.load(file); }
  catch (error) {
    showToast(error.message || 'No se pudo abrir la foto para ajustarla.');
    if (context.returnTo === 'camera') showCameraCaptureView();
    else await closeCamera();
  }
}

async function closeCamera() {
  scanEditor.destroy();
  state.adjustContext = null;
  await camera.stop();
  els.cameraModal.classList.add('hidden');
  els.scanAdjustView.classList.add('hidden');
  els.cameraCaptureView.classList.remove('hidden');
}

function updateCaptureCount() {
  els.captureCount.textContent = `${state.cameraCaptures} ${state.cameraCaptures === 1 ? 'página' : 'páginas'}`;
}

function cameraItems() { return store.items.filter(item => item.source === 'camera' && item.kind === 'image'); }

function renderCaptureStrip() {
  if (!els.captureStrip) return;
  els.captureStrip.innerHTML = '';
  const items = cameraItems().slice(-10);
  if (!items.length) { els.captureStrip.classList.add('hidden'); return; }
  els.captureStrip.classList.remove('hidden');
  items.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `capture-thumb${item.needsReview ? ' needs-review' : ''}`;
    btn.title = item.needsReview ? 'Esta página necesita revisar bordes' : 'Revisar esta página';
    if (item.previewUrl) {
      const img = new Image(); img.src = item.previewUrl; img.alt = ''; btn.appendChild(img);
    }
    const badge = document.createElement('span'); badge.textContent = item.needsReview ? '!' : String(Math.max(1, cameraItems().indexOf(item) + 1)); btn.appendChild(badge);
    btn.addEventListener('click', () => openImageAdjust(item, { returnTo: 'camera' }));
    els.captureStrip.appendChild(btn);
  });
}

async function capturePage() {
  try {
    els.captureBtn.disabled = true;
    const rawFile = await camera.captureRaw();
    if (navigator.vibrate) navigator.vibrate(35);

    if (els.cameraQuickMode.checked) {
      const item = await fileToItem(rawFile, 'camera');
      item.originalFile = rawFile;
      item.needsReview = true;
      store.add(item);
      state.cameraCaptures += 1;
      updateCaptureCount();
      renderCaptureStrip();
      camera.setStatus('Página guardada completa. Queda marcada para revisar bordes.');
      return;
    }

    await showScanAdjustView(rawFile, { type: 'capture', returnTo: 'camera', rawFile });
  } catch (error) { showToast(error.message || 'No se pudo capturar la página.'); }
  finally { els.captureBtn.disabled = false; }
}

async function openImageAdjust(item, { returnTo = 'workspace' } = {}) {
  if (!item || item.kind !== 'image') return;
  const sourceFile = item.needsReview && item.originalFile ? item.originalFile : item.file;
  if (returnTo === 'workspace') {
    await camera.stop();
    els.cameraModal.classList.remove('hidden');
  }
  await showScanAdjustView(sourceFile, { type: 'item', itemId: item.id, returnTo, rawFile: sourceFile });
}

async function confirmScanAdjustment() {
  const context = state.adjustContext;
  if (!context) return;
  try {
    els.confirmScanBtn.disabled = true;
    els.retakeScanBtn.disabled = true;
    const adjusted = await scanEditor.process({
      fileName: context.type === 'item' ? `scan-ajustado-${Date.now()}.jpg` : `scan-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`
    });
    if (context.type === 'capture') {
      const item = await fileToItem(adjusted, 'camera');
      item.originalFile = adjusted;
      item.needsReview = false;
      store.add(item);
      state.cameraCaptures += 1;
      updateCaptureCount();
      renderCaptureStrip();
      if (navigator.vibrate) navigator.vibrate(45);
    } else {
      store.update(context.itemId, { file: adjusted, originalFile: adjusted, needsReview: false, rotation: 0 });
      renderCaptureStrip();
    }

    if (context.returnTo === 'camera') {
      scanEditor.destroy();
      showCameraCaptureView();
      camera.setStatus('Página lista. Puedes capturar otra.');
    } else {
      scanEditor.destroy();
      state.adjustContext = null;
      els.cameraModal.classList.add('hidden');
      els.scanAdjustView.classList.add('hidden');
      els.cameraCaptureView.classList.remove('hidden');
      showToast('Página ajustada y corregida.');
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || 'No se pudo corregir la perspectiva.');
  } finally {
    els.confirmScanBtn.disabled = false;
    els.retakeScanBtn.disabled = false;
  }
}

async function cancelScanAdjustment() {
  const context = state.adjustContext;
  if (!context) return;
  scanEditor.destroy();
  if (context.returnTo === 'camera') {
    showCameraCaptureView();
    camera.setStatus(context.type === 'capture' ? 'Repite la fotografía cuando estés listo.' : 'Continúa capturando.');
  } else {
    state.adjustContext = null;
    els.cameraModal.classList.add('hidden');
    els.scanAdjustView.classList.add('hidden');
    els.cameraCaptureView.classList.remove('hidden');
  }
}

function setProgress(percent, text) {
  els.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  if (text) els.progressText.textContent = text;
}

async function exportCurrent() {
  if (!store.items.length) return;
  const name = sanitizeFileName(els.outputName.value);
  openProgress('Creando documento…', 'Iniciando…');

  try {
    if (state.currentTool === 'unlock') {
      const item = store.items[0];
      const password = els.pdfPassword.value;
      if (item.encrypted && !password) throw new Error('Ingresa la contraseña del PDF.');
      els.progressTitle.textContent = 'Quitando contraseña…';
      const blob = await unlockPdfByRendering(item.file, password, { renderScale: 1.75, quality: 0.92 }, setProgress);
      downloadBlob(blob, `${name || 'documento'}-sin-clave.pdf`);
      els.pdfPassword.value = '';
      showToast('Copia sin contraseña creada correctamente.');
      return;
    }

    if (state.currentTool === 'split') {
      const pages = store.items.filter(i => i.kind === 'pdf-page');
      const total = pages.reduce((max, p) => Math.max(max, p.pageNumber || 0), 0);
      const requested = parsePageRange(els.pageRange.value, total);
      const wanted = new Set(requested);
      const selected = pages.filter(p => wanted.has(p.pageNumber));
      if (!selected.length) throw new Error('No quedan páginas válidas para extraer.');
      els.progressTitle.textContent = 'Extrayendo páginas…';
      const blob = await createMixedPdf(selected, { pageSize: 'original', safeMargin: false, imageQuality: 0.92 }, setProgress);
      downloadBlob(blob, `${name || 'paginas-extraidas'}.pdf`);
      showToast(`${selected.length} ${selected.length === 1 ? 'página extraída' : 'páginas extraídas'} correctamente.`);
      return;
    }

    if (state.outputFormat === 'pdf') {
      els.progressTitle.textContent = state.currentTool === 'organize' ? 'Creando PDF organizado…' : 'Creando documento…';
      const blob = await createMixedPdf(store.items, {
        pageSize: state.pageSize,
        safeMargin: els.safeMargin.checked,
        autoFit: els.autoFit.checked,
        imageQuality: state.currentTool === 'compress' ? 0.68 : 0.9
      }, setProgress);
      downloadBlob(blob, `${name}.pdf`);
      showToast('Documento creado. La descarga comenzó correctamente.');
    } else {
      els.progressTitle.textContent = 'Preparando imágenes…';
      await exportImages(store.items, state.outputFormat, name, setProgress);
      showToast(`Imágenes ${state.outputFormat.toUpperCase()} preparadas.`);
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Ocurrió un error al procesar los archivos.');
  } finally {
    closeProgress(420);
  }
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 4800);
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

  $$('[data-disabled-tool]').forEach(btn => btn.addEventListener('click', () => {
    const labels = { office: 'Word, Excel y PowerPoint', convert: 'Conversión PDF', ocr: 'OCR', sign: 'Firma y edición' };
    showToast(`${labels[btn.dataset.disabledTool] || 'Esta herramienta'} está marcada como Próximamente para no mostrar una función que aún no procesa archivos de verdad.`);
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

  $$('[data-range-preset]').forEach(btn => btn.addEventListener('click', () => {
    els.pageRange.value = btn.dataset.rangePreset === 'todas' ? '' : btn.dataset.rangePreset;
  }));

  els.togglePassword.addEventListener('click', () => {
    const visible = els.pdfPassword.type === 'text';
    els.pdfPassword.type = visible ? 'password' : 'text';
    els.togglePassword.textContent = visible ? '👁' : '🙈';
    els.pdfPassword.focus();
  });

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
  els.cameraQuickMode.addEventListener('change', () => {
    camera.setStatus(els.cameraQuickMode.checked
      ? 'Captura rápida activa: las fotos completas quedarán marcadas para revisar.'
      : 'Modo normal: después de disparar ajustarás las cuatro esquinas.');
  });
  els.autoEdgesBtn.addEventListener('click', () => scanEditor.autoDetect().catch(error => showToast(error.message || 'No se pudieron detectar los bordes.')));
  els.rotateScanBtn.addEventListener('click', () => scanEditor.rotate90().catch(error => showToast(error.message || 'No se pudo rotar la página.')));
  $$('[data-scan-filter]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-scan-filter]').forEach(b => b.classList.toggle('selected', b === btn));
    scanEditor.setFilter(btn.dataset.scanFilter);
  }));
  els.retakeScanBtn.addEventListener('click', cancelScanAdjustment);
  els.confirmScanBtn.addEventListener('click', confirmScanAdjustment);
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
  store.subscribe(items => { renderFiles(items); renderCaptureStrip(); });
  renderFiles(store.items);
  renderCaptureStrip();
  registerPwa();
  setTimeout(completeSplash, 1900);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

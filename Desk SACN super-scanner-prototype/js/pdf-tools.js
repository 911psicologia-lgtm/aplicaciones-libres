import { uid } from './utils.js';

let pdfjsPromise = null;
async function ensurePdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs').then(lib => {
      lib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs';
      return lib;
    });
  }
  return pdfjsPromise;
}

function passwordError(error, pdfjsLib) {
  return error?.name === 'PasswordException' || error?.code === pdfjsLib.PasswordResponses?.NEED_PASSWORD || error?.code === pdfjsLib.PasswordResponses?.INCORRECT_PASSWORD;
}

async function loadPdf(file, password = '') {
  const pdfjsLib = await ensurePdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjsLib.getDocument({ data, password: password || undefined });
  try {
    const pdf = await task.promise;
    return { pdf, task };
  } catch (error) {
    try { await task.destroy(); } catch (_) {}
    throw error;
  }
}

async function renderPageBlob(page, { width = 220, scale = null, quality = 0.86 } = {}) {
  const base = page.getViewport({ scale: 1 });
  const useScale = scale || Math.max(0.18, Math.min(0.72, width / Math.max(base.width, 1)));
  const viewport = page.getViewport({ scale: useScale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return new Promise((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve({ blob, baseViewport: base }) : reject(new Error('No se pudo crear la vista previa del PDF.')),
    'image/jpeg', quality
  ));
}

export async function inspectPdfFile(file, password = '') {
  try {
    const { pdf, task } = await loadPdf(file, password);
    const result = { encrypted: Boolean(password), pageCount: pdf.numPages };
    try { await pdf.cleanup(); } catch (_) {}
    try { await task.destroy(); } catch (_) {}
    return result;
  } catch (error) {
    const pdfjsLib = await ensurePdfJs();
    if (passwordError(error, pdfjsLib)) return { encrypted: true, pageCount: null, passwordRequired: true, incorrectPassword: error?.code === pdfjsLib.PasswordResponses?.INCORRECT_PASSWORD };
    throw error;
  }
}

export async function pdfFileToPageItems(file, { password = '', onProgress = () => {} } = {}) {
  let loaded;
  try {
    loaded = await loadPdf(file, password);
  } catch (error) {
    const pdfjsLib = await ensurePdfJs();
    if (passwordError(error, pdfjsLib)) {
      const friendly = new Error(password ? 'La contraseña no es correcta.' : 'Este PDF está protegido con contraseña.');
      friendly.code = password ? 'PDF_PASSWORD_INCORRECT' : 'PDF_PASSWORD_REQUIRED';
      throw friendly;
    }
    throw error;
  }
  const { pdf, task } = loaded;
  const items = [];
  try {
    const total = pdf.numPages;
    for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
      onProgress(Math.round(((pageNumber - 1) / Math.max(total, 1)) * 92), `Preparando página ${pageNumber} de ${total}`);
      const page = await pdf.getPage(pageNumber);
      const { blob } = await renderPageBlob(page, { width: 230, quality: 0.82 });
      items.push({
        id: uid(),
        kind: 'pdf-page',
        source: 'pdf-page',
        file,
        sourceFile: file,
        sourceName: file.name,
        pageIndex: pageNumber - 1,
        pageNumber,
        pageCount: total,
        name: `${file.name} · pág. ${pageNumber}`,
        size: Math.max(1, Math.round((file.size || 0) / Math.max(total, 1))),
        rotation: 0,
        previewBlob: blob,
        previewUrl: URL.createObjectURL(blob)
      });
    }
    onProgress(100, `${total} páginas listas`);
    return items;
  } finally {
    try { await pdf.cleanup(); } catch (_) {}
    try { await task.destroy(); } catch (_) {}
  }
}

export function parsePageRange(value, totalPages) {
  const total = Math.max(0, Number(totalPages) || 0);
  const raw = String(value || '').trim().toLowerCase();
  if (!raw || raw === 'todas' || raw === 'todo' || raw === 'all') return Array.from({ length: total }, (_, i) => i + 1);
  if (raw === 'impares') return Array.from({ length: total }, (_, i) => i + 1).filter(n => n % 2 === 1);
  if (raw === 'pares') return Array.from({ length: total }, (_, i) => i + 1).filter(n => n % 2 === 0);

  const selected = new Set();
  for (const part0 of raw.split(',')) {
    const part = part0.trim();
    if (!part) continue;
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n >= 1 && n <= total) selected.add(n);
      continue;
    }
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = Number(m[1]), b = Number(m[2]);
      if (a > b) [a, b] = [b, a];
      for (let n = Math.max(1, a); n <= Math.min(total, b); n++) selected.add(n);
      continue;
    }
    throw new Error(`Rango no válido: “${part}”. Usa, por ejemplo: 1,3,5-8.`);
  }
  if (!selected.size) throw new Error('No se seleccionó ninguna página válida.');
  return [...selected].sort((a, b) => a - b);
}

export async function unlockPdfByRendering(file, password, options = {}, onProgress = () => {}) {
  if (!window.PDFLib?.PDFDocument) throw new Error('El motor PDF todavía no terminó de cargar.');
  let loaded;
  try {
    loaded = await loadPdf(file, password);
  } catch (error) {
    const pdfjsLib = await ensurePdfJs();
    if (passwordError(error, pdfjsLib)) {
      throw new Error(password ? 'La contraseña no es correcta. Revísala e intenta de nuevo.' : 'Ingresa la contraseña del PDF para desbloquearlo.');
    }
    throw error;
  }

  const { PDFDocument } = window.PDFLib;
  const { pdf, task } = loaded;
  const out = await PDFDocument.create();
  const renderScale = Math.min(2.25, Math.max(1.25, Number(options.renderScale) || 1.75));
  const quality = Math.min(0.97, Math.max(0.72, Number(options.quality) || 0.92));

  try {
    const total = pdf.numPages;
    for (let n = 1; n <= total; n++) {
      onProgress(Math.round(((n - 1) / Math.max(total, 1)) * 90), `Desbloqueando página ${n} de ${total}`);
      const page = await pdf.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const rendered = await renderPageBlob(page, { scale: renderScale, quality });
      const bytes = await rendered.blob.arrayBuffer();
      const image = await out.embedJpg(bytes);
      const outPage = out.addPage([base.width, base.height]);
      outPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });
    }
    onProgress(94, 'Creando copia sin contraseña…');
    const bytes = await out.save({ useObjectStreams: true });
    onProgress(100, 'PDF desbloqueado');
    return new Blob([bytes], { type: 'application/pdf' });
  } finally {
    try { await pdf.cleanup(); } catch (_) {}
    try { await task.destroy(); } catch (_) {}
  }
}

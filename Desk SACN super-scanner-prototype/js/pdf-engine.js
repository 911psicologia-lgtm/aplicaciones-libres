import { downloadBlob, sanitizeFileName } from './utils.js';

const A4 = [595.28, 841.89];

function ensurePdfLib() {
  if (!window.PDFLib?.PDFDocument) throw new Error('El motor PDF todavía no terminó de cargar. Intenta de nuevo en unos segundos.');
  return window.PDFLib;
}

async function imageFileToJpegBytes(file, quality = 0.9, rotation = 0) {
  const bitmap = await createImageBitmap(file);
  const turn = ((rotation || 0) % 360 + 360) % 360;
  const swap = turn === 90 || turn === 270;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? bitmap.height : bitmap.width;
  canvas.height = swap ? bitmap.width : bitmap.height;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(turn * Math.PI / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  ctx.restore();
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.')), 'image/jpeg', quality));
  return { bytes: await blob.arrayBuffer(), width: canvas.width, height: canvas.height, blob };
}

function contain(srcW, srcH, boxW, boxH) {
  const ratio = Math.min(boxW / srcW, boxH / srcH);
  return { width: srcW * ratio, height: srcH * ratio };
}

export async function createMixedPdf(items, options = {}, onProgress = () => {}) {
  const { PDFDocument, degrees } = ensurePdfLib();
  const out = await PDFDocument.create();
  const total = Math.max(items.length, 1);
  const margin = options.safeMargin ? 24 : 0;
  const sourceCache = new Map();

  async function loadSource(file) {
    if (sourceCache.has(file)) return sourceCache.get(file);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      sourceCache.set(file, doc);
      return doc;
    } catch (error) {
      if (/encrypt/i.test(String(error?.message || error))) throw new Error(`“${file.name}” está protegido. Usa primero Quitar contraseña.`);
      throw error;
    }
  }

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    onProgress(Math.round((index / total) * 90), `Procesando ${item.name}`);

    if (item.kind === 'pdf') {
      const src = await loadSource(item.file);
      const copied = await out.copyPages(src, src.getPageIndices());
      copied.forEach(page => out.addPage(page));
      continue;
    }

    if (item.kind === 'pdf-page') {
      const src = await loadSource(item.sourceFile || item.file);
      const [copied] = await out.copyPages(src, [item.pageIndex]);
      if (item.rotation) {
        const current = copied.getRotation()?.angle || 0;
        copied.setRotation(degrees((current + item.rotation) % 360));
      }
      out.addPage(copied);
      continue;
    }

    if (item.kind === 'image') {
      const image = await imageFileToJpegBytes(item.file, options.imageQuality ?? 0.9, item.rotation || 0);
      const embedded = await out.embedJpg(image.bytes);
      let pageW, pageH;
      if (options.pageSize === 'original') {
        const pxToPt = 72 / 96;
        pageW = Math.max(120, image.width * pxToPt);
        pageH = Math.max(120, image.height * pxToPt);
      } else {
        const landscape = image.width > image.height;
        [pageW, pageH] = landscape ? [A4[1], A4[0]] : A4;
      }
      const page = out.addPage([pageW, pageH]);
      const fit = contain(image.width, image.height, pageW - margin * 2, pageH - margin * 2);
      const x = (pageW - fit.width) / 2;
      const y = (pageH - fit.height) / 2;
      page.drawImage(embedded, { x, y, width: fit.width, height: fit.height });
    }
  }

  if (!out.getPageCount()) throw new Error('No hay elementos compatibles para crear el PDF.');
  onProgress(94, 'Finalizando PDF…');
  const bytes = await out.save({ useObjectStreams: true });
  onProgress(100, 'Listo');
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function exportImages(items, format = 'jpg', baseName = 'super-scanner', onProgress = () => {}) {
  const images = items.filter(i => i.kind === 'image');
  if (!images.length) throw new Error('Para exportar JPG o PNG debes tener al menos una imagen o captura de cámara.');

  const ext = format === 'png' ? 'png' : 'jpg';
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    onProgress(Math.round((i / images.length) * 95), `Preparando ${i + 1} de ${images.length}`);
    const bitmap = await createImageBitmap(item.file);
    const turn = ((item.rotation || 0) % 360 + 360) % 360;
    const swap = turn === 90 || turn === 270;
    const canvas = document.createElement('canvas');
    canvas.width = swap ? bitmap.height : bitmap.width;
    canvas.height = swap ? bitmap.width : bitmap.height;
    const ctx = canvas.getContext('2d', { alpha: format === 'png' });
    if (format !== 'png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(turn * Math.PI / 180);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    ctx.restore();
    bitmap.close?.();
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo exportar la imagen.')), mime, 0.92));
    const suffix = images.length > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
    downloadBlob(blob, `${sanitizeFileName(baseName)}${suffix}.${ext}`);
    await new Promise(r => setTimeout(r, 180));
  }
  onProgress(100, 'Listo');
}

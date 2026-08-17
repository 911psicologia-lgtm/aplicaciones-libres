import { downloadBlob, sanitizeFileName } from './utils.js';

const A4 = [595.28, 841.89];

function ensurePdfLib() {
  if (!window.PDFLib?.PDFDocument) throw new Error('El motor PDF todavía no terminó de cargar. Intenta de nuevo en unos segundos.');
  return window.PDFLib;
}

async function imageFileToJpegBytes(file, quality = 0.9) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo procesar la imagen.')), 'image/jpeg', quality));
  return { bytes: await blob.arrayBuffer(), width: canvas.width, height: canvas.height, blob };
}

function contain(srcW, srcH, boxW, boxH) {
  const ratio = Math.min(boxW / srcW, boxH / srcH);
  return { width: srcW * ratio, height: srcH * ratio };
}

export async function createMixedPdf(items, options = {}, onProgress = () => {}) {
  const { PDFDocument } = ensurePdfLib();
  const out = await PDFDocument.create();
  const total = Math.max(items.length, 1);
  const margin = options.safeMargin ? 24 : 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    onProgress(Math.round((index / total) * 90), `Procesando ${item.name}`);

    if (item.kind === 'pdf') {
      const srcBytes = await item.file.arrayBuffer();
      const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const copied = await out.copyPages(src, src.getPageIndices());
      copied.forEach(page => out.addPage(page));
      continue;
    }

    if (item.kind === 'image') {
      const image = await imageFileToJpegBytes(item.file, options.imageQuality ?? 0.9);
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
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d', { alpha: format === 'png' });
    if (format !== 'png') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo exportar la imagen.')), mime, 0.92));
    const suffix = images.length > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
    downloadBlob(blob, `${sanitizeFileName(baseName)}${suffix}.${ext}`);
    await new Promise(r => setTimeout(r, 180));
  }
  onProgress(100, 'Listo');
}

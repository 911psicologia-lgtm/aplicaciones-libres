const TYPES = ['Sin clasificar','Identificacion','Contrato / laboral','Historia clinica','Incapacidades','Recomendaciones medicas','Comunicaciones empresa','Despido / retiro','Liquidacion','Pruebas de acoso','Testigos','Junta Clinico Juridica','Otros anexos','Otro'];
const state = { name: 'Expediente', files: [], includeCover: true, includeSeparators: true };
const $ = sel => document.querySelector(sel);
const logHistory = [];

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  logHistory.unshift({ time, msg, type });
  if (logHistory.length > 6) logHistory.pop();
  $('#log').innerHTML = '<ul class="log-entries">' + logHistory.map(e =>
    `<li class="log-entry log-${e.type}"><span class="log-time">[${e.time}]</span> ${escapeHtml(e.msg)}</li>`
  ).join('') + '</ul>';
}

window.addEventListener('DOMContentLoaded', () => {
  if (!window.PDFLib) {
    alert('No se pudo cargar el motor PDF local. Verifica que la carpeta app/lib esté completa.');
    return;
  }
  $('#desktopStatus').textContent = 'Modo local activo · v2.0 · salida PDF neutra';
  bind();
  render();
});

function bind() {
  $('#projectName').addEventListener('input', e => {
    state.name = e.target.value;
    renderSummary();
  });

  $('#includeCover').addEventListener('change', e => {
    state.includeCover = !!e.target.checked;
    renderSummary();
  });
  $('#includeSeparators').addEventListener('change', e => {
    state.includeSeparators = !!e.target.checked;
    renderSummary();
  });

  $('#btnAddPdfs').addEventListener('click', () => $('#fileInputPdfs').click());
  $('#btnAddFolder').addEventListener('click', () => $('#folderInput').click());
  $('#btnOpenProject').addEventListener('click', () => $('#projectInput').click());
  $('#btnSaveProject').addEventListener('click', saveProject);
  $('#btnManifest').addEventListener('click', exportManifest);
  $('#btnMerge').addEventListener('click', mergePdf);
  $('#btnClear').addEventListener('click', () => {
    if (confirm('¿Limpiar toda la bandeja documental?')) {
      state.files = [];
      render();
      log('Bandeja limpia.');
    }
  });

  $('#fileInputPdfs').addEventListener('change', e => {
    addNativeFiles(Array.from(e.target.files || []), 'PDFs agregados');
    e.target.value = '';
  });
  $('#folderInput').addEventListener('change', e => {
    addNativeFiles(Array.from(e.target.files || []), 'PDFs encontrados en carpeta');
    e.target.value = '';
  });
  $('#projectInput').addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (file) await openProject(file);
    e.target.value = '';
  });

  const dz = $('#dropZone');
  ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.add('drag');
  }));
  ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.remove('drag');
  }));
  dz.addEventListener('drop', e => addNativeFiles(Array.from(e.dataTransfer.files || []), 'PDFs arrastrados'));
  window.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); });
  window.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); });
}

function addNativeFiles(files, label) {
  const pdfs = files.filter(f => isPdfName(f.name));
  if (!pdfs.length) { log('No se agregaron archivos PDF.'); return; }
  const existing = new Set(state.files.map(f => f.signature));
  const fresh = [];
  for (const file of pdfs) {
    const signature = `${file.name}::${file.size}::${file.lastModified || 0}`;
    if (existing.has(signature)) continue;
    existing.add(signature);
    fresh.push({
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      signature,
      file,
      name: file.name,
      originalName: file.name,
      sourceName: file.webkitRelativePath || file.name,
      size: file.size,
      type: 'Sin clasificar',
      customType: '',
      note: '',
      addedAt: new Date().toISOString(),
      available: true
    });
  }
  state.files.push(...fresh);
  render();
  log(`${label}: ${fresh.length}. Duplicados omitidos: ${pdfs.length - fresh.length}.`);
}

async function saveProject() {
  syncName();
  if (!state.files.length) { alert('Primero agrega PDFs al expediente.'); return; }
  const ok = confirm('El proyecto JSON guardará la organización y también incrustará los PDFs seleccionados para poder retomarlos después. En expedientes grandes el archivo puede quedar pesado. ¿Deseas continuar?');
  if (!ok) return;
  setBusy('Guardando proyecto completo...');
  try {
    const files = [];
    for (let i = 0; i < state.files.length; i++) {
      const f = state.files[i];
      updateProgress(i + 1, state.files.length, `Preparando ${f.name}`);
      let data = null;
      if (f.file) data = await fileToDataUrl(f.file);
      files.push({
        name: f.name,
        originalName: f.originalName || f.name,
        sourceName: f.sourceName || f.name,
        size: f.size,
        type: f.type || 'Sin clasificar',
        customType: f.customType || '',
        note: f.note || '',
        addedAt: f.addedAt || new Date().toISOString(),
        mime: 'application/pdf',
        data
      });
      await yieldUI();
    }
    const payload = {
      app: 'ReligaPDF Local',
      version: '2.0-sin-npm-salida-neutra',
      savedAt: new Date().toISOString(),
      name: outputProjectName(state.name),
      options: { includeCover: state.includeCover, includeSeparators: state.includeSeparators },
      files
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    await saveBlob(blob, `${safeName(outputProjectName(state.name))}_proyecto_documental.json`, 'application/json');
    log('Proyecto guardado como JSON completo.');
  } catch (err) {
    console.error(err);
    alert('No se pudo guardar el proyecto: ' + err.message);
    log('Error al guardar proyecto: ' + err.message, 'warn');
  } finally {
    clearBusy();
  }
}

async function openProject(file) {
  try {
    const text = await file.text();
    const raw = JSON.parse(text);
    const projectFiles = Array.isArray(raw.files) ? raw.files : [];
    state.name = outputProjectName(raw.name || 'Expediente');
    state.includeCover = raw.options?.includeCover !== false;
    state.includeSeparators = raw.options?.includeSeparators !== false;
    state.files = [];
    let unavailable = 0;
    for (const item of projectFiles) {
      let nativeFile = null;
      let size = Number(item.size) || 0;
      if (item.data && typeof item.data === 'string') {
        const blob = dataUrlToBlob(item.data, item.mime || 'application/pdf');
        nativeFile = new File([blob], item.originalName || item.name || 'documento.pdf', { type: 'application/pdf' });
        size = nativeFile.size;
      } else {
        unavailable++;
      }
      state.files.push({
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        signature: `${item.name || 'documento.pdf'}::${size}::json`,
        file: nativeFile,
        name: item.name || item.originalName || 'documento.pdf',
        originalName: item.originalName || item.name || 'documento.pdf',
        sourceName: item.sourceName || item.path || item.name || 'documento.pdf',
        size,
        type: normalizeLoadedType(item.type, item.customType),
        customType: normalizeLoadedCustomType(item.type, item.customType),
        note: item.note || '',
        addedAt: item.addedAt || new Date().toISOString(),
        available: !!nativeFile
      });
    }
    $('#projectName').value = state.name;
    $('#includeCover').checked = state.includeCover;
    $('#includeSeparators').checked = state.includeSeparators;
    render();
    log(`Proyecto abierto: ${state.files.length} archivos.` + (unavailable ? ` ${unavailable} sin PDF incrustado.` : ''), unavailable ? 'warn' : 'info');
    if (unavailable) alert('El proyecto se abrió, pero algunos archivos provienen de una versión anterior y no traen el PDF incrustado. Para consolidarlos debes agregarlos nuevamente.');
  } catch (err) {
    alert('No se pudo abrir el proyecto JSON: ' + err.message);
    log('Error al abrir proyecto: ' + err.message, 'warn');
  }
}

async function exportManifest() {
  syncName();
  if (!validateBeforeOutput(false)) return;
  const rows = state.files.map((f, i) =>
    `<tr><td>${i + 1}</td><td>${escapeHtml(cleanOutputText(f.name, 'documento.pdf'))}</td><td>${escapeHtml(displayType(f))}</td><td>${formatBytes(f.size)}</td><td>${escapeHtml(cleanOutputText(f.note || '', ''))}</td><td>${escapeHtml(cleanOutputText(f.sourceName || f.originalName || f.name || '', ''))}</td><td>${f.file ? 'Disponible' : 'Debe re-agregarse'}</td></tr>`
  ).join('\n');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Manifiesto documental</title>
<style>body{font-family:Arial,sans-serif;margin:32px;color:#111827}h1{color:#173057;margin-bottom:4px}h2{margin:0 0 14px;color:#b28a2a}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #d1d5db;padding:8px;vertical-align:top}th{background:#f3f4f6;text-align:left}.meta{color:#4b5563;margin-bottom:20px}.brand{margin-bottom:18px;padding-bottom:12px;border-bottom:2px solid #ece5cf}.aviso{background:#fef9ec;border:1px solid #f0c14b;border-radius:8px;padding:10px 14px;font-size:12px;color:#7c5c10;margin-bottom:20px}</style></head><body>
<div class="brand"><h1>Manifiesto documental</h1><p class="meta">Proyecto: ${escapeHtml(outputProjectName())} &middot; Archivos: ${state.files.length} &middot; Generado: ${new Date().toLocaleString()}</p></div>
<div class="aviso">Este manifiesto fue generado localmente. La columna Origen muestra el nombre o ruta relativa disponible en el navegador. La salida no incluye marca institucional generada por la aplicación.</div>
<table><thead><tr><th>#</th><th>Archivo</th><th>Tipo</th><th>Tamaño</th><th>Observación</th><th>Origen</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  await saveBlob(blob, `${safeName(outputProjectName())}_manifiesto.html`, 'text/html');
  log('Manifiesto HTML generado sin marca institucional.');
}

async function mergePdf() {
  syncName();
  if (!validateBeforeOutput(true)) return;
  if (!state.files.length) { alert('Primero agrega PDFs al expediente.'); return; }
  const valid = state.files.filter(f => f.file);
  if (!valid.length) { alert('No hay PDFs disponibles para consolidar. Si abriste un proyecto antiguo, agrega nuevamente los PDFs.'); return; }

  setBusy('Iniciando consolidación...');
  $('#btnMerge').disabled = true;
  const skipped = [];
  try {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const out = await PDFDocument.create();
    out.setTitle(outputProjectName(state.name));
    out.setSubject('Expediente consolidado');
    out.setProducer('Aplicacion local de consolidacion documental');
    out.setCreator('Aplicacion local de consolidacion documental');
    if (state.includeCover) await addCover(out, state, { StandardFonts, rgb });
    let lastType = null;
    let processed = 0;

    for (const f of state.files) {
      processed++;
      updateProgress(processed, state.files.length, f.name);
      if (!f.file) {
        skipped.push({ name: f.name, reason: 'Archivo no disponible en este proyecto JSON' });
        await yieldUI();
        continue;
      }
      const fType = displayType(f);
      if (state.includeSeparators && fType !== lastType) {
        lastType = fType;
        await addSeparator(out, lastType, { StandardFonts, rgb });
      }
      try {
        const bytes = await f.file.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        if (src.isEncrypted) {
          skipped.push({ name: f.name, reason: 'PDF protegido o cifrado; puede quedar incompleto' });
        }
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach(p => out.addPage(p));
      } catch (err) {
        skipped.push({ name: f.name, reason: err.message || 'Error al leer/copiar el PDF' });
      }
      await yieldUI();
    }

    const pdfBytes = await out.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    await saveBlob(blob, `${safeName(outputProjectName())}.pdf`, 'application/pdf');
    updateProgress(state.files.length, state.files.length, skipped.length ? `Completado con ${skipped.length} advertencia(s)` : 'Completado con éxito', skipped.length > 0);
    log(`PDF consolidado localmente.${skipped.length ? ' Advertencias: ' + skipped.length : ''}`, skipped.length ? 'warn' : 'info');
    if (skipped.length) {
      const detalles = skipped.map(s => `- ${s.name}: ${s.reason}`).join('\n');
      alert(`El PDF se generó, pero hubo ${skipped.length} advertencia(s):\n\n${detalles}`);
    }
  } catch (err) {
    console.error(err);
    alert('No se pudo consolidar: ' + err.message);
    log('Error al consolidar: ' + err.message, 'warn');
  } finally {
    $('#btnMerge').disabled = false;
    setTimeout(clearBusy, 1200);
  }
}

async function addCover(pdf, project, libs) {
  const { StandardFonts, rgb } = libs;
  const page = pdf.addPage([595.28, 841.89]);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const maxW = 483;
  page.drawRectangle({ x: 42, y: 700, width: 511, height: 80, color: rgb(0.96, 0.94, 0.88) });
  const projectName = truncateText(outputProjectName(project.name), fontBold, 14, maxW);
  page.drawText('Expediente consolidado', { x: 56, y: 735, size: 22, font: fontBold, color: rgb(0.09, 0.19, 0.34) });
  page.drawText('Documento consolidado generado localmente', { x: 56, y: 706, size: 16, font: fontBold, color: rgb(0.70, 0.54, 0.16) });
  page.drawText(`Proyecto: ${projectName}`, { x: 56, y: 650, size: 14, font });
  page.drawText(`Archivos incluidos: ${(project.files || []).filter(f => f.file).length}`, { x: 56, y: 628, size: 12, font });
  page.drawText(`Generado: ${new Date().toLocaleString()}`, { x: 56, y: 608, size: 12, font });
  page.drawText('Expediente de uso interno. No distribuir sin autorizacion.', { x: 56, y: 586, size: 11, font, color: rgb(0.35, 0.38, 0.43) });
}

async function addSeparator(pdf, title, libs) {
  const { StandardFonts, rgb } = libs;
  const page = pdf.addPage([595.28, 841.89]);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawRectangle({ x: 0, y: 785, width: 595.28, height: 56, color: rgb(0.95, 0.93, 0.87) });
  page.drawText('Separador documental', { x: 56, y: 805, size: 14, font: fontBold, color: rgb(0.09, 0.19, 0.34) });
  page.drawText(cleanOutputText(String(title || 'Sin clasificar').slice(0, 45), 'Sin clasificar'), { x: 56, y: 690, size: 26, font: fontBold, color: rgb(0.70, 0.54, 0.16) });
  page.drawText('Tipo documental', { x: 56, y: 662, size: 12, font, color: rgb(0.35, 0.38, 0.43) });
}

function render() { renderSummary(); renderTable(); }

function renderSummary() {
  const total = state.files.reduce((a, f) => a + (Number(f.size) || 0), 0);
  const available = state.files.filter(f => f.file).length;
  const coverText = state.includeCover ? 'Si' : 'No';
  const sepText = state.includeSeparators ? 'Si' : 'No';
  const sanitized = outputProjectName(state.name);
  const notice = containsBlockedTerm(state.name) ? '<br><span class="summary-warning">El nombre de salida se depurara automaticamente para quitar marcas institucionales.</span>' : '';
  $('#summary').innerHTML = `<strong>Archivos:</strong> ${state.files.length}<br><strong>Disponibles:</strong> ${available}<br><strong>Peso total:</strong> ${formatBytes(total)}<br><strong>Proyecto:</strong> ${escapeHtml(state.name)}<br><strong>Salida:</strong> portada ${coverText} · separadores ${sepText}<br><strong>Nombre final:</strong> ${escapeHtml(sanitized)}${notice}`;
}

function renderTable() {
  const tbody = $('#tbody');
  tbody.innerHTML = '';
  state.files.forEach((f, i) => {
    const tr = document.createElement('tr');
    if (!f.file) tr.classList.add('missing-file');
    const warning = f.file ? '' : '<span class="row-warning">PDF no incrustado: re-agregar antes de consolidar.</span>';
    const typeValue = normalizeLoadedType(f.type, f.customType);
    const showCustom = typeValue === 'Otro';
    const customTypeInput = showCustom ? `<input class="custom-type-input" value="${escapeAttr(f.customType || '')}" data-i="${i}" data-k="customType" placeholder="Escribe de qué se trata">` : '';
    tr.innerHTML = `<td>${i + 1}</td><td><input value="${escapeAttr(f.name)}" data-i="${i}" data-k="name">${warning}</td><td class="type-cell"><select data-i="${i}" data-k="type">${TYPES.map(t => `<option ${t === typeValue ? 'selected' : ''}>${t}</option>`).join('')}</select>${customTypeInput}</td><td>${formatBytes(f.size)}</td><td><input value="${escapeAttr(f.note || '')}" data-i="${i}" data-k="note" placeholder="Observación"></td><td><div class="orderBtns"><button class="mini" data-act="up" data-i="${i}" title="Mover arriba">↑</button><button class="mini" data-act="down" data-i="${i}" title="Mover abajo">↓</button></div></td><td><button class="mini danger" data-act="del" data-i="${i}">Eliminar</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('input,select').forEach(el => el.addEventListener('input', e => {
    const i = +e.target.dataset.i;
    const k = e.target.dataset.k;
    if (k === 'type') {
      state.files[i].type = e.target.value;
      if (e.target.value !== 'Otro') state.files[i].customType = '';
      renderTable();
      renderSummary();
      return;
    }
    state.files[i][k] = e.target.value;
    renderSummary();
  }));
  tbody.querySelectorAll('button[data-act]').forEach(btn => btn.addEventListener('click', () => action(btn.dataset.act, +btn.dataset.i)));
}

function action(act, i) {
  if (act === 'del') {
    if (confirm('¿Eliminar este archivo de la bandeja?')) { state.files.splice(i, 1); render(); }
  }
  if (act === 'up' && i > 0) { [state.files[i - 1], state.files[i]] = [state.files[i], state.files[i - 1]]; render(); }
  if (act === 'down' && i < state.files.length - 1) { [state.files[i + 1], state.files[i]] = [state.files[i], state.files[i + 1]]; render(); }
}

function setBusy(label) {
  $('#progressFill').style.width = '0%';
  $('#progressFill').style.background = 'var(--green)';
  $('#progressLabel').textContent = label || 'Procesando...';
  $('#progressWrap').classList.remove('hidden');
}

function clearBusy() {
  $('#progressWrap').classList.add('hidden');
  $('#progressFill').style.width = '0%';
}

function updateProgress(done, total, current, warning = false) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  $('#progressFill').style.width = pct + '%';
  $('#progressFill').style.background = warning ? '#b28a2a' : 'var(--green)';
  $('#progressLabel').textContent = `${done}/${total} — ${current || ''}`;
}

async function saveBlob(blob, suggestedName, mime) {
  if (window.showSaveFilePicker) {
    try {
      const ext = suggestedName.split('.').pop().toLowerCase();
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: ext.toUpperCase(), accept: { [mime || blob.type || 'application/octet-stream']: ['.' + ext] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { ok: true };
    } catch (err) {
      if (err && err.name === 'AbortError') throw new Error('Guardado cancelado por el usuario');
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { ok: true };
}

function displayType(f) {
  const base = normalizeLoadedType(f?.type, f?.customType);
  if (base === 'Otro') return cleanOutputText(f?.customType || 'Otro', 'Otro');
  return cleanOutputText(base || 'Sin clasificar', 'Sin clasificar');
}

function normalizeLoadedType(type, customType) {
  const raw = String(type || 'Sin clasificar');
  if (raw === 'Otro') return 'Otro';
  if (customType) return 'Otro';
  if (TYPES.includes(raw)) return raw;
  return 'Otro';
}

function normalizeLoadedCustomType(type, customType) {
  if (customType) return String(customType);
  const raw = String(type || '');
  return TYPES.includes(raw) ? '' : raw;
}

function validateBeforeOutput(requireFiles = true) {
  if (requireFiles && !state.files.length) return true;
  const missingOther = state.files
    .map((f, i) => ({ f, i }))
    .filter(item => normalizeLoadedType(item.f.type, item.f.customType) === 'Otro' && !String(item.f.customType || '').trim());
  if (missingOther.length) {
    const nums = missingOther.map(item => item.i + 1).join(', ');
    alert(`Hay documento(s) con Tipo "Otro" sin especificar: fila(s) ${nums}. Escribe de que se trata antes de generar la salida.`);
    log(`Falta especificar Tipo Otro en fila(s): ${nums}.`, 'warn');
    return false;
  }
  const generatedFields = [state.name, ...state.files.flatMap(f => [f.name, f.sourceName, f.note, f.customType])];
  if (generatedFields.some(containsBlockedTerm)) {
    log('Se detectaron y depuraran marcas institucionales en campos generados por la app.', 'warn');
  }
  return true;
}

function containsBlockedTerm(value) {
  const blockedBase = ['con','fu','turo'].join('');
  return new RegExp(escapeRegExp(blockedBase), 'i').test(String(value || ''));
}

function outputProjectName(name = state.name) {
  return cleanOutputText(name || 'Expediente', 'Expediente');
}

function cleanOutputText(value, fallback = '') {
  let text = String(value ?? '');
  const blockedBase = ['con','fu','turo'].join('');
  const blocked = [`${blockedBase} lawyers group`, `${blockedBase} lawyers`, blockedBase];
  for (const word of blocked) {
    text = text.replace(new RegExp(escapeRegExp(word), 'ig'), '');
  }
  text = text.replace(/[_\-]+/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();
  return text || fallback;
}

function syncName() { state.name = $('#projectName').value.trim() || 'Expediente'; }
function isPdfName(name) { return String(name || '').toLowerCase().endsWith('.pdf'); }
function safeName(s) { return String(s || 'expediente_consolidado').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g,'') || 'expediente_consolidado'; }
function yieldUI() { return new Promise(resolve => setTimeout(resolve, 0)); }

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  const units = ['B','KB','MB','GB'];
  let n = bytes, u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u++; }
  return `${n.toFixed(u ? 1 : 0)} ${units[u]}`;
}

function escapeHtml(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function escapeAttr(s) { return escapeHtml(s).replace(/`/g, '&#96;'); }
function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function truncateText(text, font, size, maxWidth) {
  let t = String(text ?? '');
  if (font.widthOfTextAtSize(t, size) <= maxWidth) return t;
  while (t.length > 0 && font.widthOfTextAtSize(t + '...', size) > maxWidth) t = t.slice(0, -1);
  return t + '...';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl, mime = 'application/pdf') {
  const parts = String(dataUrl).split(',');
  const b64 = parts.length > 1 ? parts[1] : parts[0];
  const bytes = base64ToUint8Array(b64);
  return new Blob([bytes], { type: mime });
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

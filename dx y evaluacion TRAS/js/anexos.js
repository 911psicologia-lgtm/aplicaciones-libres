/* ============================================================
   TRAS · anexos.js
   Anexos pegables: bloques de texto que el profesional produce fuera de
   la app (Machover, HTP, un MMPI-A realmente administrado, un informe
   de terceros) y adjunta al informe consolidado.

   El contenido se escribe con un marcado ligero, deliberadamente pequeno:
       **negrita**            *cursiva*
       - vineta   o   • vineta
       1. lista numerada
       ## subtitulo
   Todo lo demas se trata como parrafo. El texto se escapa ANTES de
   aplicar el marcado, de modo que pegar HTML no inyecta nada.
   ============================================================ */

/* Convierte el marcado ligero en HTML seguro. */
function mdLiteToHtml(raw) {
  const src = String(raw || '').replace(/\r\n?/g, '\n').trim();
  if (!src) return '';

  const inline = s => escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

  const out = [];
  const lines = src.split('\n');
  let listType = null;   // 'ul' | 'ol' | null
  let para = [];

  const flushPara = () => {
    if (para.length) { out.push(`<p style="margin:0 0 8px">${para.join('<br>')}</p>`); para = []; }
  };
  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };
  const openList = t => {
    if (listType !== t) { closeList(); out.push(`<${t} style="margin:0 0 8px 0;padding-left:22px">`); listType = t; }
  };

  lines.forEach(line => {
    const t = line.trim();
    if (!t) { flushPara(); closeList(); return; }

    const h = t.match(/^(#{2,4})\s+(.*)$/);
    if (h) { flushPara(); closeList(); out.push(`<h4 style="margin:12px 0 6px;color:#1a3a5c">${inline(h[2])}</h4>`); return; }

    const ul = t.match(/^[-*•·]\s+(.*)$/);
    if (ul) { flushPara(); openList('ul'); out.push(`<li>${inline(ul[1])}</li>`); return; }

    const ol = t.match(/^(\d+)[.)]\s+(.*)$/);
    if (ol) { flushPara(); openList('ol'); out.push(`<li>${inline(ol[2])}</li>`); return; }

    closeList();
    para.push(inline(t));
  });
  flushPara(); closeList();
  return out.join('\n');
}

/* ---------- CRUD ---------- */

function addAnexo() {
  const c = getCurrentCase();
  const titulo = String(document.getElementById('anexoTitulo').value || '').trim();
  const contenido = String(document.getElementById('anexoContenido').value || '').trim();
  if (!contenido) { toast('El anexo esta vacio: pega su contenido antes de agregarlo.', 'warn'); return; }
  c.anexos.push({
    id: 'anx_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
    titulo: titulo || 'Anexo sin titulo',
    contenido,
    incluir: true,
    ts: new Date().toISOString()
  });
  persist('Anexo agregado: ' + (titulo || 'sin titulo'));
  document.getElementById('anexoTitulo').value = '';
  document.getElementById('anexoContenido').value = '';
  renderAnexos();
  renderReport();
  toast('Anexo agregado al informe.', 'ok');
}

function removeAnexo(id) {
  const c = getCurrentCase();
  const a = c.anexos.find(x => x.id === id);
  if (!a) return;
  if (!confirm(`Eliminar el anexo "${a.titulo}"? Esta accion no se puede deshacer.`)) return;
  c.anexos = c.anexos.filter(x => x.id !== id);
  persist('Anexo eliminado: ' + a.titulo);
  renderAnexos();
  renderReport();
  toast('Anexo eliminado.', 'warn');
}

function toggleAnexo(id) {
  const c = getCurrentCase();
  const a = c.anexos.find(x => x.id === id);
  if (!a) return;
  a.incluir = !a.incluir;
  persist('Anexo ' + (a.incluir ? 'incluido en' : 'excluido de') + ' el informe: ' + a.titulo);
  renderAnexos();
  renderReport();
}

/* Edicion en linea: vuelca el anexo al formulario y lo elimina de la lista. */
function editAnexo(id) {
  const c = getCurrentCase();
  const a = c.anexos.find(x => x.id === id);
  if (!a) return;
  document.getElementById('anexoTitulo').value = a.titulo;
  document.getElementById('anexoContenido').value = a.contenido;
  c.anexos = c.anexos.filter(x => x.id !== id);
  persist('Anexo en edicion: ' + a.titulo);
  renderAnexos();
  document.getElementById('anexoTitulo').scrollIntoView({ behavior: 'smooth', block: 'center' });
  toast('Anexo cargado en el formulario. Vuelve a agregarlo cuando termines.', 'info', 4200);
}

/* ---------- Render ---------- */

function renderAnexos() {
  const host = document.getElementById('anexosList');
  if (!host) return;
  const c = getCurrentCase();
  if (!c.anexos.length) {
    host.innerHTML = '<div class="gs-empty">Aun no hay anexos. Pega arriba un informe corto (Machover, HTP, un MMPI-A realmente administrado, un reporte escolar) y se agregara al final del informe consolidado.</div>';
    return;
  }
  host.innerHTML = c.anexos.map(a => `
    <div class="anexo-card ${a.incluir ? '' : 'off'}">
      <div class="anexo-head">
        <strong>${escapeHtml(a.titulo)}</strong>
        <div class="anexo-actions">
          <label class="anexo-toggle" title="Incluir en el informe">
            <input type="checkbox" ${a.incluir ? 'checked' : ''} onchange="toggleAnexo('${a.id}')"> Incluir
          </label>
          <button class="btn secondary" onclick="editAnexo('${a.id}')">Editar</button>
          <button class="btn secondary danger-outline" onclick="removeAnexo('${a.id}')">Eliminar</button>
        </div>
      </div>
      <div class="anexo-body">${mdLiteToHtml(a.contenido)}</div>
    </div>`).join('');
}

/* Vista previa en vivo del marcado mientras se escribe. */
function previewAnexo() {
  const box = document.getElementById('anexoPreview');
  if (!box) return;
  const txt = document.getElementById('anexoContenido').value;
  box.innerHTML = txt.trim()
    ? mdLiteToHtml(txt)
    : '<span style="color:#8295a8">La vista previa aparecera aqui.</span>';
}

/* ---------- Informe ---------- */

/* Devuelve el bloque HTML de los anexos incluidos, numerado a partir de `desde`. */
function anexosReportSection(desde) {
  const c = getCurrentCase();
  const activos = (c.anexos || []).filter(a => a.incluir && String(a.contenido || '').trim());
  if (!activos.length) return '';
  return activos.map((a, i) => `
    <div class="area-panel" style="margin-bottom:10px">
      <div class="area-static-head"><div class="area-name"><span class="area-dot"></span><span>Anexo ${desde + i}. ${escapeHtml(a.titulo)}</span></div></div>
      <div class="area-body">${mdLiteToHtml(a.contenido)}</div>
    </div>`).join('\n');
}

function anexosCount() {
  const c = getCurrentCase();
  return (c.anexos || []).filter(a => a.incluir && String(a.contenido || '').trim()).length;
}

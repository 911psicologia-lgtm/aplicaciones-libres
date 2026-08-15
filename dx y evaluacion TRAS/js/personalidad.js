/* ============================================================
   TRAS · personalidad.js
   Perfil de PERSONALIDAD EN FORMACION, organizado por dimensiones
   clinicas generales.

   ADVERTENCIA DE DISENO (importante, no cosmetica):
   Esto NO es una administracion del MMPI-A ni de ningun otro test
   estandarizado. No reproduce sus items, no calcula escalas, no aplica
   baremos y no produce elevaciones. Las dimensiones de abajo son
   constructos psicologicos generales que el MMPI-A tambien explora, y se
   nombran aqui como referencia conceptual del clinico, no como resultado
   de una prueba. Las viñetas que produce este modulo son HIPOTESIS
   derivadas del TRAS y de Goldstein, y siempre se rotulan como tales.

   Si el profesional administra realmente un MMPI-A, sus resultados no
   entran por aqui: entran por el mecanismo de anexos pegables (anexos.js).
   ============================================================ */

const PERS_DIMENSIONES = [
  { id: 'conducta', nombre: 'Regulacion conductual y control de impulsos',
    referencia: 'afin a escalas de problemas de conducta',
    fuentes: ['area_12', 'area_14', 'area_19', 'area_11'],
    goldstein: ['g4', 'g5'],
    foco: 'capacidad de pausar antes de actuar, anticipacion de consecuencias, respuesta ante la presion de pares' },

  { id: 'enojo', nombre: 'Irritabilidad y manejo del enojo',
    referencia: 'afin a escalas de enojo',
    fuentes: ['area_12', 'area_09', 'area_19'],
    goldstein: ['g4', 'g5'],
    foco: 'desregulacion ante critica, correccion, provocacion o vivencia de injusticia' },

  { id: 'familia', nombre: 'Vinculos y conflicto familiar',
    referencia: 'afin a escalas de problemas familiares',
    fuentes: ['area_01', 'area_02', 'area_03', 'area_07', 'area_09'],
    goldstein: [],
    foco: 'representaciones de las figuras parentales y fraternas, justicia percibida, comunicacion' },

  { id: 'escolar', nombre: 'Ajuste escolar y relacion con la autoridad',
    referencia: 'afin a escalas de problemas escolares',
    fuentes: ['area_04', 'area_05'],
    goldstein: ['g1', 'g2'],
    foco: 'clima de aula, consistencia percibida de la autoridad, pertenencia entre pares' },

  { id: 'animo', nombre: 'Estado animico y malestar reactivo',
    referencia: 'afin a escalas de malestar depresivo (a leer con prudencia)',
    fuentes: ['area_10', 'area_11', 'comp_04'],
    goldstein: ['g3'],
    foco: 'tristeza, culpa, desesperanza; expresiones infantiles de malestar que NO equivalen a diagnostico' },

  { id: 'social', nombre: 'Incomodidad social y ansiedad interpersonal',
    referencia: 'afin a escalas de incomodidad social y ansiedad',
    fuentes: ['area_08', 'area_06', 'area_13'],
    goldstein: ['g1', 'g2', 'g5'],
    foco: 'cautela ante lo desconocido, apertura gradual, temor al juicio' },

  { id: 'autoconcepto', nombre: 'Autoconcepto y autoestima',
    referencia: 'afin a escalas de baja autoestima',
    fuentes: ['area_13', 'area_16'],
    goldstein: ['g3', 'g6'],
    foco: 'autoimagen, autocritica, presencia o ausencia de autoetiquetas globales' },

  { id: 'proyecto', nombre: 'Agencia y proyecto de vida',
    referencia: 'constructo evolutivo (no escala clinica)',
    fuentes: ['area_15', 'area_16'],
    goldstein: ['g6'],
    foco: 'autonomia, metas propias frente a obediencia funcional, sentido de futuro' },

  { id: 'cambio', nombre: 'Disposicion al cambio y recursos terapeuticos',
    referencia: 'afin a escalas de indicadores de tratamiento',
    fuentes: ['area_13', 'area_16', 'area_11'],
    goldstein: ['g2', 'g6'],
    foco: 'reconocimiento de errores, apertura a la ayuda, apoyos disponibles. Suele ser el cierre en positivo' }
];

const PERS_ENCUADRE = 'Las siguientes viñetas constituyen una hipotesis de personalidad EN FORMACION, derivada del TRAS y, cuando se aplico, de la lista de chequeo de habilidades sociales. No provienen de la administracion del MMPI-A ni de ninguna prueba estandarizada de personalidad: no hay items, escalas, puntajes ni baremos. Son orientativas y requieren confirmacion mediante evaluacion directa.';

/* ---------- Insumos para el prompt ---------- */

/* Reune, por dimension, el material del caso que la sustenta. */
function persEvidence() {
  const c = getCurrentCase();
  const areasById = {};
  allAreas().forEach(a => { areasById[a.id] = a; });

  // computeGoldstein recibe el OBJETO de respuestas y devuelve { porGrupo, global, ... },
  // donde cada grupo trae { id:'g1'..'g6', romano, nombre, pct:{nunca,aveces,siempre} }.
  const gs = (typeof computeGoldstein === 'function' && c.goldstein && c.goldstein.aplicado)
    ? computeGoldstein(c.goldstein.respuestas) : null;

  return PERS_DIMENSIONES.map(d => {
    const areas = d.fuentes.map(aid => {
      const area = areasById[aid];
      if (!area) return null;
      const it = (typeof areaInterp === 'function') ? areaInterp(aid) : (c.interpretations[aid] || {});
      const respuestas = (area.items || [])
        .map(i => c.responses[i.id] && String(c.responses[i.id].respuesta || '').trim())
        .filter(Boolean);
      if (!respuestas.length && !it.que_sucede && !it.texto) return null;
      return {
        area: area.nombre,
        respuestas,
        lectura: String(it.que_sucede || it.texto || '').trim().slice(0, 600)
      };
    }).filter(Boolean);

    const grupos = gs
      ? (d.goldstein || []).map(gid => {
          const g = gs.porGrupo.find(x => x.id === gid);
          if (!g || !g.respondidos) return null;
          // Predominio = etiqueta con mayor porcentaje entre los items respondidos.
          const predominio = ['nunca','aveces','siempre']
            .reduce((a, b) => (g.pct[b] > g.pct[a] ? b : a), 'nunca');
          return {
            grupo: `${g.romano}. ${g.nombre}`,
            predominio,
            pct: g.pct,
            respondidos: g.respondidos
          };
        }).filter(Boolean)
      : [];

    return { id: d.id, dimension: d.nombre, referencia: d.referencia, foco: d.foco, areas, goldstein: grupos };
  }).filter(d => d.areas.length || d.goldstein.length);
}

/* ---------- Flujo de IA ---------- */

registerAiFlow('personalidad', {
  titulo: 'Perfil de personalidad en formacion',
  hint: 'Genera viñetas breves por dimension a partir del TRAS y de Goldstein. NO es una administracion del MMPI-A: son hipotesis derivadas, y asi quedan rotuladas en el informe.',
  aviso: 'Este prompt sale de tu navegador hacia una IA externa con datos despersonalizados. Ademas: el resultado <strong>no es una prueba de personalidad</strong>; son hipotesis derivadas del TRAS y Goldstein, y el informe lo declara explicitamente.',
  requiredKeys: ['dimensiones'],
  buildPrompt() {
    const ev = persEvidence();
    if (!ev.length) throw new Error('No hay material suficiente: registra respuestas o interpretaciones antes de generar el perfil.');
    const ctx = aiCaseContext();
    return `# ROL
Eres un psicólogo clínico infanto-juvenil que redacta un PERFIL DESCRIPTIVO DE PERSONALIDAD EN FORMACIÓN a partir de información contextual. El texto será leído por padres, docentes y profesionales. Debe explicar tendencias dinámicas y recursos sin convertirlas en etiquetas ni reducirlas a frases genéricas.

# ADVERTENCIA CENTRAL
NO estás interpretando un MMPI-A ni ninguna prueba estandarizada de personalidad. No se administró. No dispones de escalas, puntajes, elevaciones, percentiles ni baremos, y no debes inventarlos o simularlos.
- Los nombres de las dimensiones son constructos clínicos generales, no resultados psicométricos.
- Se trata de un menor de edad: describe un funcionamiento en formación, sensible al contexto y abierto al cambio.
- No uses nomenclatura de escalas, códigos, perfiles o diagnósticos de inventarios de personalidad.

# MARCO DE COMPRENSIÓN INTERNO
Integra de manera flexible el sentido de la experiencia, los vínculos, la ambivalencia, la autorregulación, los recursos, el contexto y la posible función de algunas respuestas. Este marco orienta tu razonamiento, pero NO nombres escuelas psicológicas ni escribas "desde una perspectiva...", "psicodinámicamente" o expresiones similares.

# TAREA
Para cada dimensión sustentada por el material:
- Redacta una viñeta de 45 a 80 palabras. Puede ser algo más extensa si necesita integrar una tensión importante, pero evita redundancias.
- Explica qué tendencia aparece, en qué contextos se fortalece o debilita, qué datos la sostienen y qué recurso o posibilidad de cambio la acompaña.
- Conserva contradicciones útiles: por ejemplo, una persona puede ser competente en situaciones habituales y retraerse ante figuras significativas o bajo vergüenza.
- No reduzcas información diversa a una etiqueta como "ansioso", "dependiente", "impulsivo" o "baja autoestima".
- No inventes una dimensión. Omite la que no esté sustentada y menciona en la síntesis que el perfil es parcial cuando falte información relevante.
- Cierra, cuando los datos lo permitan, con disposición al cambio y recursos de reorganización.

# ESTILO
- Lenguaje clínico accesible, natural y respetuoso; sin jerga innecesaria.
- NO uses "El material sugiere", "se evidencia", "desde una perspectiva..." ni inicies varias viñetas con "Se observa una tendencia".
- Evita repetir la misma estructura en todas las dimensiones.
- Formula hipótesis con claridad: "podría intensificarse cuando...", "parece disminuir ante...", "conviene contrastar...".
- No conviertas la prudencia en vaguedad. Vincula cada afirmación con el contexto o los resultados disponibles.
- No repitas literalmente el análisis por áreas ni la interpretación de Goldstein.

# SÍNTESIS
Redacta una síntesis de 120 a 180 palabras que integre:
- organización actual del funcionamiento;
- condiciones que aumentan o reducen las dificultades;
- recursos protectores;
- tensiones centrales;
- límites de la información.
No nombres escuelas psicológicas ni uses lenguaje de rasgos fijos.

# SALIDA
Devuelve SOLO JSON válido, sin backticks ni texto adicional:
{"dimensiones":[{"id":"conducta","nombre":"Regulación conductual y control de impulsos","vineta":"45 a 80 palabras, contextualizadas y comprensibles"}],"sintesis":"párrafo de 120 a 180 palabras"}

Usa exactamente los "id" y "nombre" entregados abajo. Incluye únicamente dimensiones sustentadas.

# CONTEXTO DEL CASO
${JSON.stringify(ctx, null, 1)}

# MATERIAL POR DIMENSIÓN
${JSON.stringify(aiScrubDeep(ev, getCurrentCase().meta.nombre), null, 1)}`;
  },
  apply(data) {
    const c = getCurrentCase();
    const validIds = new Set(PERS_DIMENSIONES.map(d => d.id));
    const dims = (data.dimensiones || [])
      .filter(d => d && validIds.has(d.id) && String(d.vineta || '').trim())
      .map(d => ({
        id: d.id,
        nombre: PERS_DIMENSIONES.find(x => x.id === d.id).nombre,
        vineta: String(d.vineta).trim()
      }));
    if (!dims.length) throw new Error('El JSON no trajo ninguna dimension valida.');
    c.personalidad = {
      aplicado: true,
      dimensiones: dims,
      sintesis: String(data.sintesis || '').trim(),
      fuente: 'ia-manual'
    };
    return `Perfil insertado con ${dims.length} dimension(es). Revisalo: son hipotesis, no resultados de prueba.`;
  }
});

/* ---------- Render del paso ---------- */

function renderPersonalidad() {
  const host = document.getElementById('personalidadBody');
  if (!host) return;
  const c = getCurrentCase();
  const p = c.personalidad || { dimensiones: [], sintesis: '' };

  const filas = p.dimensiones.length
    ? p.dimensiones.map((d, i) => `
        <div class="pers-item">
          <label for="pers_${d.id}"><strong>${escapeHtml(d.nombre)}</strong></label>
          <textarea id="pers_${d.id}" rows="2" oninput="updatePersVineta('${d.id}', this.value)">${escapeHtml(d.vineta)}</textarea>
        </div>`).join('')
    : '<div class="gs-empty">Aun no hay perfil. Usa "Generar todo con un solo prompt" en el Centro de informes (paso 8), o escribe las viñetas manualmente tras agregar dimensiones.</div>';

  host.innerHTML = `
    <div class="pers-frame">${escapeHtml(PERS_ENCUADRE)}</div>
    <div class="actions" style="margin:12px 0">
      <button class="btn secondary" onclick="addPersDimension()">Agregar dimension</button>
      ${p.dimensiones.length ? '<button class="btn secondary danger-outline" onclick="clearPersonalidad()">Limpiar perfil</button>' : ''}
    </div>
    ${filas}
    <div style="margin-top:12px">
      <label for="pers_sintesis">Sintesis integradora (60-90 palabras)</label>
      <textarea id="pers_sintesis" rows="4" oninput="updatePersSintesis(this.value)">${escapeHtml(p.sintesis || '')}</textarea>
    </div>
    <div class="actions" style="margin-top:12px">
      <button class="btn" onclick="savePersonalidad()">Guardar perfil</button>
      <button class="btn secondary" onclick="continueClinical(10)">Continuar al informe final</button>
    </div>`;
}

function updatePersVineta(id, txt) {
  const c = getCurrentCase();
  const d = (c.personalidad.dimensiones || []).find(x => x.id === id);
  if (d) { d.vineta = txt; c.personalidad.fuente = 'manual'; }
}

function updatePersSintesis(txt) {
  const c = getCurrentCase();
  c.personalidad.sintesis = txt;
}

function addPersDimension() {
  const c = getCurrentCase();
  const usados = new Set((c.personalidad.dimensiones || []).map(d => d.id));
  const libres = PERS_DIMENSIONES.filter(d => !usados.has(d.id));
  if (!libres.length) { toast('Ya estan todas las dimensiones disponibles.', 'info'); return; }
  const lista = libres.map((d, i) => `${i + 1}. ${d.nombre}`).join('\n');
  const sel = prompt(`Elige la dimension a agregar (numero):\n\n${lista}`);
  const idx = parseInt(sel, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= libres.length) return;
  c.personalidad.dimensiones.push({ id: libres[idx].id, nombre: libres[idx].nombre, vineta: '' });
  c.personalidad.aplicado = true;
  persist('Dimension agregada al perfil: ' + libres[idx].nombre);
  renderPersonalidad();
}

function clearPersonalidad() {
  if (!confirm('Borrar todo el perfil de personalidad de este caso?')) return;
  const c = getCurrentCase();
  c.personalidad = { aplicado: false, dimensiones: [], sintesis: '', fuente: 'manual' };
  persist('Perfil de personalidad reiniciado');
  renderPersonalidad();
  renderReport();
  toast('Perfil de personalidad reiniciado.', 'warn');
}

function savePersonalidad() {
  const c = getCurrentCase();
  c.personalidad.aplicado = !!(c.personalidad.dimensiones.length || String(c.personalidad.sintesis || '').trim());
  persist('Perfil de personalidad actualizado');
  renderReport();
  toast('Perfil de personalidad guardado.', 'ok');
}

/* ---------- Informe ---------- */

function naturalizePersWording(text, index) {
  let out = String(text || '').trim();
  if (!out) return '';
  const replacements = [
    'La informacion disponible permite considerar',
    'En el contexto evaluado cobra relevancia',
    'Las respuestas convergen en',
    'Como hipotesis clinica a contrastar, puede plantearse',
    'Bajo las condiciones descritas parece configurarse',
    'El conjunto de hallazgos es compatible con'
  ];
  out = out
    .replace(/^(?:El material|El perfil|La evaluación|Los resultados) sugier(?:e|en)\b[,:]?\s*/i, replacements[index % replacements.length] + ' ')
    .replace(/^Desde una perspectiva [^,.:;]+[,.:;]?\s*/i, '')
    .replace(/^Se observa una tendencia a\s*/i, replacements[index % replacements.length] + ' ');
  return out;
}

function personalidadReportSection(numero) {
  const c = getCurrentCase();
  const p = c.personalidad;
  if (!p || !p.aplicado) return '';
  const dims = (p.dimensiones || []).filter(d => String(d.vineta || '').trim());
  if (!dims.length && !String(p.sintesis || '').trim()) return '';

  const cards = dims.map((d, i) =>
    `<div class="profile-card"><strong>${escapeHtml(d.nombre)}.</strong><div>${textToHtml(naturalizePersWording(d.vineta, i))}</div></div>`).join('');

  return `
    <div class="callout warm" style="margin-top:0">${escapeHtml(PERS_ENCUADRE)}</div>
    ${cards ? `<div class="profile-grid">${cards}</div>` : ''}
    ${String(p.sintesis || '').trim() ? `<div class="callout" style="margin-top:12px"><strong>Sintesis del perfil:</strong><br>${textToHtml(naturalizePersWording(p.sintesis, dims.length))}</div>` : ''}`;
}

/* ============================================================
   TRAS · goldstein.js
   Bateria anexa: Lista de Chequeo de Habilidades Sociales
   (A. P. Goldstein). Version de tres niveles (Nunca / A veces /
   Siempre) con redaccion cercana para adolescentes.

   IMPORTANTE
   - Este modulo NO produce puntajes ni percentiles normativos.
     Solo trabaja con conteos y porcentajes de frecuencia, tal
     como el formato en Excel del que parte el autor.
   - La escalera de cuatro condiciones (inconscientemente inhábil,
     conscientemente inhábil, conscientemente hábil e
     inconscientemente hábil) se usa como lectura complementaria
     del aprendizaje y la disponibilidad de la habilidad. No es un
     baremo normativo original de Goldstein.
   - La regla operacional de esta adaptación de tres respuestas
     conserva las condiciones que ya utilizaba la app. La condición
     de uso automático no se atribuye solo por autoinforme: requiere
     observación y desempeño reiterado.
   - Es un tamizaje descriptivo orientativo; se lee junto con la HC
     y, si se aplicó, con el TRAS.
   ============================================================ */

/* ---------- Definiciones de nivel (de la hoja de convenciones) ---------- */
const GOLDSTEIN_NIVELES = {
  nunca:  { etiqueta: 'ESCASAS',    titulo: 'Nunca',    def: 'La habilidad no se usa y/o no se tiene conciencia de ella.' },
  aveces: { etiqueta: 'BUENAS',     titulo: 'A veces',  def: 'La habilidad se usa escasamente, casi siempre solo cuando la situacion lo obliga.' },
  siempre:{ etiqueta: 'MUY BUENAS', titulo: 'Siempre',  def: 'La habilidad se usa ampliamente y se tiene conciencia de ella.' }
};

/* ---------- Grupos (estructura canonica 8+6+7+9+12+8 = 50) ---------- */
const GOLDSTEIN_GRUPOS = [
  { id:'g1', romano:'I',   nombre:'Habilidades sociales basicas' },
  { id:'g2', romano:'II',  nombre:'Habilidades sociales avanzadas' },
  { id:'g3', romano:'III', nombre:'Habilidades relacionadas con los sentimientos' },
  { id:'g4', romano:'IV',  nombre:'Habilidades alternativas a la agresion' },
  { id:'g5', romano:'V',   nombre:'Habilidades para hacer frente al estres' },
  { id:'g6', romano:'VI',  nombre:'Habilidades de planificacion' }
];

/* ---------- 50 habilidades ----------
   - texto:     redaccion cercana para adolescentes (la que se aplica).
   - clasico:   redaccion tecnica clasica de Goldstein (referencia del
                modo clasico / PDF), util para el evaluador.
   - revisado:  true cuando la redaccion para adolescentes se ajusto
                respecto del enunciado clasico por ser poco entendible.
*/
const GOLDSTEIN_ITEMS = [
  // I. Basicas (1-8)
  {num:1,  grupo:'g1', texto:'¿Escuchas de verdad cuando alguien te habla, sin interrumpir?', clasico:'Prestar atencion a la persona que habla y hacer un esfuerzo por comprender lo que dice.', revisado:true},
  {num:2,  grupo:'g1', texto:'¿Empiezas una conversacion con otras personas y luego la mantienes?', clasico:'Iniciar y mantener una conversacion.', revisado:true},
  {num:3,  grupo:'g1', texto:'¿Haces preguntas cuando necesitas saber o entender algo?', clasico:'Formular preguntas cuando es necesario.', revisado:true},
  {num:4,  grupo:'g1', texto:'¿Das las gracias cuando alguien te ayuda o hace algo por ti?', clasico:'Dar las gracias a otra persona por algo que hizo por ti.', revisado:true},
  {num:5,  grupo:'g1', texto:'¿Te presentas tu mismo cuando estas con gente que no conoces?', clasico:'Presentarse uno mismo ante otras personas.', revisado:true},
  {num:6,  grupo:'g1', texto:'¿Presentas a personas que no se conocen entre si?', clasico:'Presentar a personas nuevas entre si.', revisado:true},
  {num:7,  grupo:'g1', texto:'¿Le dices a alguien algo bueno o un cumplido cuando se lo merece?', clasico:'Hacer un cumplido sobre lo que otra persona hizo o dijo.', revisado:true},
  {num:8,  grupo:'g1', texto:'¿Pides ayuda cuando la necesitas, sin quedarte callado?', clasico:'Pedir ayuda cuando se tiene una dificultad.', revisado:true},
  // II. Avanzadas (9-14)
  {num:9,  grupo:'g2', texto:'¿Pides participar o unirte cuando otros ya estan en una actividad?', clasico:'Integrarse a un grupo que ya esta realizando una actividad.', revisado:true},
  {num:10, grupo:'g2', texto:'¿Explicas con claridad lo que otra persona debe hacer?', clasico:'Dar instrucciones a otras personas.', revisado:true},
  {num:11, grupo:'g2', texto:'¿Sigues bien las instrucciones que te dan?', clasico:'Seguir instrucciones.', revisado:false},
  {num:12, grupo:'g2', texto:'¿Pides disculpas cuando hiciste algo que estuvo mal?', clasico:'Pedir disculpas a otros por algo que hiciste mal.', revisado:true},
  {num:13, grupo:'g2', texto:'¿Logras convencer a otros de que tu idea es buena, sin imponerla?', clasico:'Convencer a los demas de tus ideas.', revisado:true},
  {num:14, grupo:'g2', texto:'¿Expresas tu opinion aunque otros piensen distinto?', clasico:'Defender los propios derechos y opiniones.', revisado:true},
  // III. Sentimientos (15-21)
  {num:15, grupo:'g3', texto:'¿Te das cuenta de lo que estas sintiendo (rabia, tristeza, alegria)?', clasico:'Reconocer las propias emociones.', revisado:true},
  {num:16, grupo:'g3', texto:'¿Expresas a otros lo que sientes, en lugar de guardartelo?', clasico:'Expresar los propios sentimientos.', revisado:true},
  {num:17, grupo:'g3', texto:'¿Notas como se siente otra persona aunque no lo diga?', clasico:'Comprender los sentimientos de los demas.', revisado:true},
  {num:18, grupo:'g3', texto:'¿Manejas la situacion cuando alguien esta enojado contigo, sin estallar?', clasico:'Enfrentarse con el enfado de otra persona.', revisado:true},
  {num:19, grupo:'g3', texto:'¿Demuestras carino o aprecio a las personas que quieres?', clasico:'Expresar afecto hacia los demas.', revisado:true},
  {num:20, grupo:'g3', texto:'¿Manejas el miedo cuando algo te asusta, sin paralizarte?', clasico:'Enfrentarse con el propio miedo.', revisado:true},
  {num:21, grupo:'g3', texto:'¿Te felicitas o te das un gusto cuando haces algo bien?', clasico:'Auto-recompensarse por los propios logros.', revisado:true},
  // IV. Alternativas a la agresion (22-30)
  {num:22, grupo:'g4', texto:'¿Pides permiso antes de usar algo que no es tuyo?', clasico:'Pedir permiso antes de hacer algo que afecta a otros.', revisado:true},
  {num:23, grupo:'g4', texto:'¿Compartes tus cosas con otras personas cuando se puede?', clasico:'Compartir algo propio con los demas.', revisado:true},
  {num:24, grupo:'g4', texto:'¿Ayudas a alguien que lo esta necesitando?', clasico:'Ayudar a quien lo necesita.', revisado:true},
  {num:25, grupo:'g4', texto:'¿Llegas a un acuerdo cuando no estan de acuerdo, sin pelear?', clasico:'Llegar a acuerdos (negociar) en un conflicto.', revisado:true},
  {num:26, grupo:'g4', texto:'¿Te controlas cuando tienes muchas ganas de explotar o reaccionar mal?', clasico:'Emplear el autocontrol ante los propios impulsos.', revisado:true},
  {num:27, grupo:'g4', texto:'¿Defiendes lo tuyo o lo que crees justo, sin agredir a nadie?', clasico:'Defender los propios derechos.', revisado:true},
  {num:28, grupo:'g4', texto:'¿Respondes a las bromas pesadas sin enojarte ni devolver la agresion?', clasico:'Responder a las bromas adecuadamente.', revisado:true},
  {num:29, grupo:'g4', texto:'¿Evitas meterte en peleas aunque te provoquen?', clasico:'Mantenerse al margen de las peleas.', revisado:true},
  {num:30, grupo:'g4', texto:'¿Resuelves los problemas con otros sin llegar a los golpes?', clasico:'Resolver los conflictos de forma no violenta.', revisado:true},
  // V. Frente al estres (31-42)
  {num:31, grupo:'g5', texto:'¿Manejas bien cuando alguien te critica o se queja de ti?', clasico:'Formular una queja y responder a una queja.', revisado:true},
  {num:32, grupo:'g5', texto:'¿Demuestras que eres buen perdedor cuando pierdes en un juego?', clasico:'Demostrar deportividad despues de un juego.', revisado:true},
  {num:33, grupo:'g5', texto:'¿Manejas la situacion cuando sientes verguenza, sin huir?', clasico:'Resolver la verguenza.', revisado:true},
  {num:34, grupo:'g5', texto:'¿Te las arreglas bien cuando te dejan de lado o no te incluyen?', clasico:'Arreglarselas cuando le dejan de lado.', revisado:true},
  {num:35, grupo:'g5', texto:'¿Defiendes a un amigo cuando lo estan tratando mal?', clasico:'Defender a un amigo.', revisado:true},
  {num:36, grupo:'g5', texto:'¿Reaccionas bien cuando alguien trata de convencerte de algo?', clasico:'Responder a la persuasion.', revisado:true},
  {num:37, grupo:'g5', texto:'¿Reaccionas con calma cuando algo te sale mal o fracasas?', clasico:'Responder al fracaso.', revisado:true},
  {num:38, grupo:'g5', texto:'¿Manejas la situacion cuando recibes mensajes contradictorios (te dicen una cosa pero su gesto dice otra)?', clasico:'Enfrentarse a los mensajes contradictorios.', revisado:true},
  {num:39, grupo:'g5', texto:'¿Sabes que hacer cuando alguien te acusa de algo que no hiciste?', clasico:'Responder a una acusacion.', revisado:true},
  {num:40, grupo:'g5', texto:'¿Te preparas para una conversacion dificil antes de tenerla?', clasico:'Prepararse para una conversacion dificil.', revisado:true},
  {num:41, grupo:'g5', texto:'¿Manejas bien la presion cuando el grupo quiere que hagas algo?', clasico:'Hacer frente a las presiones de grupo.', revisado:true},
  {num:42, grupo:'g5', texto:'¿Decides por ti mismo cuando muchas voces te dicen cosas distintas?', clasico:'Tomar decisiones propias.', revisado:true},
  // VI. Planificacion (43-50)
  {num:43, grupo:'g6', texto:'¿Te das cuenta de cuando estas aburrido y buscas algo bueno que hacer?', clasico:'Discernir sobre la causa de un problema (identificar el aburrimiento).', revisado:true},
  {num:44, grupo:'g6', texto:'¿Buscas la causa real de un problema antes de actuar?', clasico:'Conocer la causa de un problema.', revisado:true},
  {num:45, grupo:'g6', texto:'¿Te pones una meta y piensas como alcanzarla?', clasico:'Establecer un objetivo.', revisado:true},
  {num:46, grupo:'g6', texto:'¿Reconoces para que cosas eres bueno y para cuales no tanto?', clasico:'Reconocer las propias habilidades.', revisado:true},
  {num:47, grupo:'g6', texto:'¿Buscas la informacion que necesitas antes de decidir algo?', clasico:'Recoger informacion antes de tomar una decision.', revisado:true},
  {num:48, grupo:'g6', texto:'¿Resuelves los problemas segun lo importante o urgente que sean?', clasico:'Resolver los problemas segun su importancia.', revisado:true},
  {num:49, grupo:'g6', texto:'¿Tomas una decision despues de pensar en las opciones que tienes?', clasico:'Tomar una decision.', revisado:true},
  {num:50, grupo:'g6', texto:'¿Te concentras en una tarea hasta terminarla?', clasico:'Concentrarse en una tarea.', revisado:true}
];

/* Atajos */
function goldsteinItemsByGroup(gid) { return GOLDSTEIN_ITEMS.filter(i => i.grupo === gid); }
function goldsteinNivelMeta(nivel) { return GOLDSTEIN_NIVELES[nivel] || null; }

/* ============================================================
   LOGICA DE CALCULO (recalculada en limpio, no copia del Excel)
   Entrada: respuestas = { '1':'nunca'|'aveces'|'siempre', ... }
   ============================================================ */
function computeGoldstein(respuestas) {
  respuestas = respuestas || {};
  const porGrupo = GOLDSTEIN_GRUPOS.map(g => {
    const items = goldsteinItemsByGroup(g.id);
    const conteo = { nunca:0, aveces:0, siempre:0 };
    let respondidos = 0;
    items.forEach(it => {
      const v = respuestas[String(it.num)];
      if (v === 'nunca' || v === 'aveces' || v === 'siempre') { conteo[v]++; respondidos++; }
    });
    const total = items.length;
    const pct = n => respondidos ? Math.round((n / respondidos) * 100) : 0;
    return {
      id: g.id, romano: g.romano, nombre: g.nombre,
      total, respondidos, conteo,
      pct: { nunca: pct(conteo.nunca), aveces: pct(conteo.aveces), siempre: pct(conteo.siempre) }
    };
  });

  // Resumen global: cuenta por etiqueta sobre los items respondidos.
  const global = { nunca:0, aveces:0, siempre:0, respondidos:0, total: GOLDSTEIN_ITEMS.length };
  porGrupo.forEach(g => {
    global.nunca += g.conteo.nunca;
    global.aveces += g.conteo.aveces;
    global.siempre += g.conteo.siempre;
    global.respondidos += g.respondidos;
  });
  const gpct = n => global.respondidos ? Math.round((n / global.respondidos) * 100) : 0;
  global.pct = { nunca: gpct(global.nunca), aveces: gpct(global.aveces), siempre: gpct(global.siempre) };

  const clasificacion = classifyGoldstein(global.pct, global.respondidos);
  return { porGrupo, global, clasificacion };
}

/* ------------------------------------------------------------
   Regla operacional de la adaptación de tres respuestas.

   Esta clasificación conserva la convención previa de la app y
   organiza el predominio de Nunca / A veces / Siempre en tres
   condiciones de disponibilidad: inconscientemente inhábil,
   conscientemente inhábil y conscientemente hábil. No corresponde
   a un baremo normativo de la Lista de Goldstein. La cuarta condición
   —inconscientemente hábil o ejecución automatizada— se presenta en
   el informe como horizonte de aprendizaje, pero no se asigna a
   partir del autoinforme sin observación y desempeño reiterado.
   ------------------------------------------------------------ */
function classifyGoldstein(pct, respondidos) {
  if (!respondidos) {
    return {
      clave: 'sin_datos',
      etiqueta: 'Sin datos suficientes',
      descripcion: 'Aun no hay respuestas registradas para clasificar el perfil.'
    };
  }
  const { nunca, aveces, siempre } = pct;
  const max = Math.max(nunca, aveces, siempre);

  let clave, etiqueta;
  if (nunca === max && nunca >= aveces && nunca >= siempre) {
    clave = 'inconsc_inhabil'; etiqueta = 'Inconscientemente inhábil';
  } else if (siempre === max && siempre >= aveces && siempre >= nunca) {
    clave = 'consc_habil'; etiqueta = 'Conscientemente hábil';
  } else {
    // predominan las "a veces" (BUENAS)
    if (siempre > nunca) { clave = 'consc_habil_consolidacion'; etiqueta = 'Conscientemente hábil (en consolidación)'; }
    else { clave = 'consc_inhabil'; etiqueta = 'Conscientemente inhábil'; }
  }

  const DESC = {
    inconsc_inhabil: 'Predominan habilidades escasas: con frecuencia no se usan y/o no hay conciencia de ellas. Conviene psicoeducacion para visibilizar las habilidades y un trabajo de base en repertorio social.',
    consc_inhabil: 'Hay conciencia de las habilidades pero su uso aun es limitado o solo se activa cuando la situacion lo obliga. Perfil con buen punto de partida para entrenamiento dirigido.',
    consc_habil_consolidacion: 'Uso predominantemente activo y consciente, con un grupo de habilidades aun en consolidacion. Conviene reforzar las areas mas debiles para estabilizar el repertorio.',
    consc_habil: 'Predominan habilidades muy buenas: se usan ampliamente y con conciencia. Perfil con repertorio social consolidado; el foco pasa a mantener y generalizar.'
  };
  return { clave, etiqueta, descripcion: DESC[clave] || '' };
}

/* ============================================================
   RENDER · Paso 9 (bateria Goldstein)
   ============================================================ */
function goldsteinState() {
  const c = getCurrentCase();
  c.goldstein = c.goldstein || { aplicado:false, modo:'all', respuestas:{}, interp:{}, fuente:'manual' };
  return c.goldstein;
}

/* Devuelve la interpretacion estructurada, migrando casos antiguos que
   guardaban un unico texto plano en g.interpretacion. */
function goldsteinInterp(g) {
  g = g || goldsteinState();
  if (!g.interp || typeof g.interp !== 'object') g.interp = {};
  // Migracion: si existe el texto plano antiguo y los campos nuevos estan vacios,
  // se vuelca como "que sucede" para no perder contenido previo.
  if (g.interpretacion && !g.interp.que_sale && !g.interp.analisis_causal && !g.interp.sugerencias) {
    g.interp.analisis_causal = String(g.interpretacion);
    delete g.interpretacion;
  }
  g.interp.que_sale = g.interp.que_sale || '';
  g.interp.analisis_causal = g.interp.analisis_causal || '';
  g.interp.sugerencias = g.interp.sugerencias || '';
  g.interp.conclusion = g.interp.conclusion || '';
  return g.interp;
}

function renderGoldstein() {
  const wrap = document.getElementById('goldsteinContainer');
  if (!wrap) return;
  const g = goldsteinState();
  const modo = g.modo === 'single' ? 'single' : 'all';

  const cabecera = `
    <div class="help" style="margin-bottom:12px">
      <strong>Bateria anexa · Lista de chequeo de habilidades sociales (Goldstein).</strong>
      Escala de tres niveles. <strong>No</strong> genera puntajes ni percentiles normativos: trabaja con
      conteos y porcentajes de frecuencia. Es un tamizaje descriptivo orientativo que se lee junto con la HC
      y, si se aplico, con el TRAS. Marca una sola opcion por habilidad.
      <div style="margin-top:8px;display:flex;gap:14px;flex-wrap:wrap">
        ${['nunca','aveces','siempre'].map(k=>`<span class="small"><span class="badge ${k==='nunca'?'danger':k==='aveces'?'warn':'ok'}">${GOLDSTEIN_NIVELES[k].titulo}</span> ${escapeHtml(GOLDSTEIN_NIVELES[k].def)}</span>`).join('')}
      </div>
    </div>
    <div class="inline" style="justify-content:space-between;margin-bottom:12px">
      <label style="margin:0"><input type="checkbox" id="gold_aplicado" ${g.aplicado?'checked':''} onchange="setGoldsteinApplied(this.checked)"/> Aplicar esta bateria en el caso e incluirla en el informe</label>
      <div class="inline">
        <span class="small">Vista:</span>
        <button class="btn secondary ${modo!=='single'?'active':''}" id="gold_mode_all" onclick="setGoldsteinMode('all')" style="${modo!=='single'?'outline:2px solid var(--gold)':''}">Lista completa</button>
        <button class="btn secondary ${modo==='single'?'active':''}" id="gold_mode_group" onclick="setGoldsteinMode('single')" style="${modo==='single'?'outline:2px solid var(--gold)':''}">Por grupos</button>
      </div>
    </div>`;

  const renderItem = (it) => {
    const v = g.respuestas[String(it.num)] || '';
    const opt = (key) => `
      <label class="gold-opt ${v===key?'sel '+key:''}" style="margin:0">
        <input type="radio" name="gold_${it.num}" value="${key}" ${v===key?'checked':''} onchange="setGoldsteinAnswer(${it.num},'${key}')"/>
        ${GOLDSTEIN_NIVELES[key].titulo}
      </label>`;
    return `<div class="gold-item">
      <div class="gold-item-text"><span class="badge info">${it.num}</span> ${escapeHtml(it.texto)}${it.revisado?' <span class="badge warn" title="Redaccion adaptada para adolescentes">redaccion adaptada</span>':''}</div>
      <div class="gold-opts">${opt('nunca')}${opt('aveces')}${opt('siempre')}</div>
    </div>`;
  };

  let body;
  if (modo === 'single') {
    body = GOLDSTEIN_GRUPOS.map(grp => `
      <details class="area-block" open>
        <summary>${grp.romano}. ${escapeHtml(grp.nombre)} <span class="small">(${goldsteinItemsByGroup(grp.id).length} habilidades)</span></summary>
        <div style="margin-top:10px">${goldsteinItemsByGroup(grp.id).map(renderItem).join('')}</div>
      </details>`).join('');
  } else {
    body = `<div class="area-block">${GOLDSTEIN_ITEMS.map(renderItem).join('')}</div>`;
  }

  wrap.innerHTML = cabecera + body +
    `<div class="actions">
      <button class="btn" onclick="saveGoldstein()">Guardar bateria</button>
      <button class="btn secondary" onclick="renderGoldsteinResults()">Calcular resultados</button>
    </div>
    <div id="goldsteinResults" style="margin-top:8px"></div>`;

  renderGoldsteinResults();
}

function renderGoldsteinResults() {
  const box = document.getElementById('goldsteinResults');
  if (!box) return;
  const g = goldsteinState();
  const gi = goldsteinInterp(g);
  const r = computeGoldstein(g.respuestas);
  const cls = r.clasificacion;
  const clsBadge = cls.clave === 'consc_habil' ? 'ok'
    : cls.clave === 'sin_datos' ? 'info'
    : cls.clave === 'inconsc_inhabil' ? 'danger' : 'warn';

  const bar = (p, kind, label) => `<span class="gold-bar" role="img" aria-label="${label}: ${p}%" title="${label}: ${p}%"><span class="gold-bar-fill ${kind}" style="width:${p}%"></span></span>`;

  const grupos = r.porGrupo.map(grp => `
    <tr>
      <td><strong>${grp.romano}</strong> ${escapeHtml(grp.nombre)}</td>
      <td class="num">${grp.respondidos}/${grp.total}</td>
      <td class="num">${grp.pct.nunca}% ${bar(grp.pct.nunca,'danger','Escasas')}</td>
      <td class="num">${grp.pct.aveces}% ${bar(grp.pct.aveces,'warn','Buenas')}</td>
      <td class="num">${grp.pct.siempre}% ${bar(grp.pct.siempre,'ok','Muy buenas')}</td>
    </tr>`).join('');

  box.innerHTML = `
    <div class="card" style="box-shadow:none;margin-top:12px">
      <div class="inline" style="justify-content:space-between">
        <h3 style="margin:0">Resultados de la bateria</h3>
        <span class="badge info">Respondidos: ${r.global.respondidos}/${r.global.total}</span>
      </div>
      <div class="three-col" style="margin-top:12px">
        <div class="kpi"><span class="small">Escasas (Nunca)</span><strong>${r.global.pct.nunca}%</strong><span class="small">${r.global.nunca} habilidades</span></div>
        <div class="kpi"><span class="small">Buenas (A veces)</span><strong>${r.global.pct.aveces}%</strong><span class="small">${r.global.aveces} habilidades</span></div>
        <div class="kpi"><span class="small">Muy buenas (Siempre)</span><strong>${r.global.pct.siempre}%</strong><span class="small">${r.global.siempre} habilidades</span></div>
      </div>
      <div style="margin-top:12px">
        <span class="badge ${clsBadge}">Clasificacion: ${escapeHtml(cls.etiqueta)}</span>
        <div class="small" style="margin-top:8px">${escapeHtml(cls.descripcion)}</div>
      </div>
      <table class="gold-table" style="margin-top:14px">
        <thead><tr><th>Grupo</th><th class="num">Resp.</th><th class="num">Escasas</th><th class="num">Buenas</th><th class="num">Muy buenas</th></tr></thead>
        <tbody>${grupos}</tbody>
      </table>
      <div class="card" style="box-shadow:none;margin-top:14px">
        <div class="inline" style="justify-content:space-between">
          <h3 style="margin:0">Interpretacion de habilidades sociales</h3>
        </div>
        <p class="small">Redacta de forma estructurada aquí, o usa "Generar todo con un solo prompt" en el Centro de informes (paso 8) para interpretar Goldstein junto con el resto de la evaluación. La clasificacion habil/inhabil de arriba se usa como conclusion del anexo.</p>
        ${g.fuente==='ia-manual' ? '<span class="badge info">origen: IA (revisar)</span>' : ''}
        <label style="margin-top:10px">1. Habilidades que salen (lo que se observa)</label>
        <textarea id="gold_que_sale" oninput="markGoldsteinManual();autosave()" style="min-height:90px" placeholder="Que grupos y habilidades aparecen como fortalezas, cuales como escasas o en uso forzado.">${escapeHtml(gi.que_sale||'')}</textarea>
        <label style="margin-top:10px">2. Comprensión contextual del perfil</label>
        <textarea id="gold_analisis_causal" oninput="markGoldsteinManual();autosave()" style="min-height:120px" placeholder="Cómo se relaciona el perfil con la historia clínica y el TRAS, en qué contextos cambian las habilidades y qué función podrían cumplir algunas respuestas, sin afirmar causalidad lineal.">${escapeHtml(gi.analisis_causal||'')}</textarea>
        <label style="margin-top:10px">3. Indicaciones de mejora (lo que se sugiere segun el caso)</label>
        <textarea id="gold_sugerencias" oninput="markGoldsteinManual();autosave()" style="min-height:100px" placeholder="Una sugerencia por linea: foco de entrenamiento, apoyos, recomendaciones aplicadas al caso.">${escapeHtml(gi.sugerencias||'')}</textarea>
        <details style="margin-top:10px"><summary class="small">Conclusion (clasificacion habil/inhabil) — opcional, editar</summary>
          <textarea id="gold_conclusion" oninput="markGoldsteinManual();autosave()" style="min-height:80px;margin-top:8px" placeholder="Por defecto se usa la clasificacion calculada y su descripcion. Puedes matizarla aqui.">${escapeHtml(gi.conclusion||'')}</textarea>
        </details>
      </div>
    </div>`;
}

/* ---------- Mutaciones de estado ---------- */
function setGoldsteinApplied(on) { goldsteinState().aplicado = !!on; autosave(); renderReport(); }
function setGoldsteinMode(mode) { goldsteinState().modo = mode === 'single' ? 'single' : 'all'; persist(); renderGoldstein(); }
function setGoldsteinAnswer(num, val) {
  const g = goldsteinState();
  g.respuestas[String(num)] = val;
  if (!g.aplicado) { g.aplicado = true; const cb = document.getElementById('gold_aplicado'); if (cb) cb.checked = true; }
  autosave();
  renderGoldsteinResults();
}
function readGoldInterpInputs(g) {
  const gi = goldsteinInterp(g);
  const get = id => document.getElementById(id)?.value;
  const qs = get('gold_que_sale'); if (qs !== undefined) gi.que_sale = qs;
  const ac = get('gold_analisis_causal'); if (ac !== undefined) gi.analisis_causal = ac;
  const su = get('gold_sugerencias'); if (su !== undefined) gi.sugerencias = su;
  const co = get('gold_conclusion'); if (co !== undefined) gi.conclusion = co;
}
function markGoldsteinManual() {
  const g = goldsteinState();
  readGoldInterpInputs(g);
  g.fuente = 'manual';
}
function saveGoldstein() {
  const g = goldsteinState();
  readGoldInterpInputs(g);
  saveState();
  renderReport();
  toast('Bateria de habilidades sociales guardada.', 'ok');
}

/* ============================================================
   RESUMEN DEL CASO (cuadro base para el prompt de IA)
   Sintetiza HC + TRAS para contextualizar la interpretacion de
   las respuestas de Goldstein. Si no hay TRAS aplicado, lo omite.
   ============================================================ */
function buildCaseSummary() {
  syncInputsToState();
  const c = getCurrentCase();
  const hc = c.hc || {};
  const trasAreas = allAreas().map(area => {
    const an = (typeof analyzeArea === 'function') ? analyzeArea(area) : {respondidos:0, alertas:[], recursos:[]};
    const respondidos = area.items.filter(i => (itemState(i.id).respuesta||'').trim()).length;
    return {
      area: area.nombre,
      respondidos,
      interpretacion: (c.interpretations[area.id]?.texto || '').trim(),
      senales: an.alertas || [],
      recursos: an.recursos || []
    };
  }).filter(a => a.respondidos > 0 || a.interpretacion);

  const trasAplicado = trasAreas.length > 0;
  return {
    caso: { numero: c.meta.numero, nombre: c.meta.nombre, edad: c.meta.edad, sexo: c.meta.sexo },
    historia_clinica: {
      resumen_contextual: hc.resumen || '',
      motivo: hc.motivo || '',
      evento_detonante: hc.evento || '',
      contexto_familiar: hc.familia || '',
      contexto_escolar: hc.escolar || '',
      sintomas: hc.sintomas || '',
      recursos: hc.recursos || '',
      objetivo_inicial: hc.objetivo || '',
      alertas: hc.alertas || []
    },
    tras_aplicado: trasAplicado,
    tras_resumen: trasAplicado ? {
      patrones_globales: c.patterns || '',
      analisis_consolidado: c.consolidated || '',
      areas: trasAreas
    } : null
  };
}

/* Texto legible del cuadro de resumen, mostrado al usuario antes del prompt. */
function caseSummaryText(s) {
  const hc = s.historia_clinica;
  const lines = [];
  lines.push(`CASO DESPERSONALIZADO: ${initialsOf(s.caso.nombre)} · ${s.caso.edad || '—'} anios · ${s.caso.sexo || '—'}`);
  lines.push('');
  lines.push('SINTESIS DE HISTORIA CLINICA');
  if (hc.resumen_contextual) lines.push(`- Resumen contextual: ${hc.resumen_contextual}`);
  lines.push(`- Motivo de consulta: ${hc.motivo || '—'}`);
  lines.push(`- Evento detonante: ${hc.evento_detonante || '—'}`);
  lines.push(`- Contexto familiar: ${hc.contexto_familiar || '—'}`);
  lines.push(`- Contexto escolar: ${hc.contexto_escolar || '—'}`);
  lines.push(`- Sintomas / manifestaciones: ${hc.sintomas || '—'}`);
  lines.push(`- Recursos y apoyos: ${hc.recursos || '—'}`);
  lines.push(`- Objetivo terapeutico inicial: ${hc.objetivo_inicial || '—'}`);
  lines.push(`- Alertas: ${(hc.alertas && hc.alertas.length) ? hc.alertas.join(', ') : 'ninguna registrada'}`);
  if (s.tras_aplicado) {
    lines.push('');
    lines.push('SINTESIS DEL TRAS (aplicado conjuntamente)');
    if (s.tras_resumen.patrones_globales) lines.push(`- Patrones globales: ${s.tras_resumen.patrones_globales}`);
    if (s.tras_resumen.analisis_consolidado) lines.push(`- Analisis consolidado: ${s.tras_resumen.analisis_consolidado}`);
    const conInterp = s.tras_resumen.areas.filter(a => a.interpretacion).slice(0, 6);
    if (conInterp.length) lines.push(`- Areas relevantes: ${conInterp.map(a => a.area).join('; ')}`);
  } else {
    lines.push('');
    lines.push('TRAS: no aplicado en este caso (se interpreta Goldstein de forma autonoma, anclada en la HC).');
  }
  return lines.join('\n');
}

/* ============================================================
   MODO IA MANUAL · Goldstein
   ============================================================ */
function openGoldsteinAI() {
  const g = goldsteinState();
  const r = computeGoldstein(g.respuestas);
  const summary = buildCaseSummary();
  const summaryTxt = caseSummaryText(summary);

  const tablaGrupos = r.porGrupo.map(grp =>
    `   ${grp.romano}. ${grp.nombre}: escasas ${grp.pct.nunca}% / buenas ${grp.pct.aveces}% / muy buenas ${grp.pct.siempre}% (respondidos ${grp.respondidos}/${grp.total})`
  ).join('\n');

  const detalleItems = GOLDSTEIN_ITEMS.map(it => {
    const v = g.respuestas[String(it.num)];
    if (!v) return null;
    return `   ${it.num}. ${it.texto} -> ${GOLDSTEIN_NIVELES[v].titulo} (${GOLDSTEIN_NIVELES[v].etiqueta})`;
  }).filter(Boolean).join('\n');

  const prompt = `# ROL
Eres un asistente clínico de apoyo en psicología infanto-juvenil. Interpretas la Lista de Chequeo de Habilidades Sociales de Goldstein como un tamizaje descriptivo y contextual. El texto será leído por padres, docentes y profesionales; debe ser preciso, comprensible y útil, sin convertir los porcentajes en un diagnóstico.

# PRINCIPIOS
- Los niveles describen frecuencia de uso: ESCASAS = la habilidad rara vez está disponible; BUENAS = aparece de manera irregular o cuando la situación la exige; MUY BUENAS = suele utilizarse de forma amplia y consciente.
- No uses percentiles, baremos, puntajes normativos ni afirmaciones sobre rasgos fijos.
- No reduzcas el perfil a los porcentajes globales. Revisa también las respuestas de cada habilidad para detectar fortalezas específicas, vacíos, contrastes y habilidades que cambian según el contexto.
- Contextualiza con la historia clínica y el TRAS. Una habilidad puede conocerse y aun así disminuir bajo estrés, vergüenza, rechazo, presión, conflicto familiar o autoridad.
- No atribuyas causas únicas. Explica relaciones contextuales y posibles funciones con prudencia.
- Conserva diferencias importantes entre grupos y habilidades; no las diluyas en expresiones generales como "tiene dificultades sociales".
- Trabaja internamente de manera integrativa, pero NO nombres escuelas psicológicas ni escribas "desde una perspectiva...", "psicológicamente" o fórmulas equivalentes.
- Evita "El material sugiere", "se evidencia", "los resultados indican" y comienzos repetitivos de plantilla.

# PRODUCTOS
1. "que_sale": un párrafo descriptivo que explique el perfil global, los grupos más sólidos y más frágiles, y las habilidades individuales que ayudan a comprender esas diferencias. No enumeres las 50 respuestas, pero no ignores patrones relevantes.
2. "lectura_contextual": uno o dos párrafos que articulen las habilidades con el contexto del caso, el TRAS y las condiciones en que aumentan o disminuyen. Distingue disponibilidad de ejecución y evita causalidad lineal.
3. "sugerencias": 3 a 5 acciones concretas, aplicadas al caso y vinculadas con habilidades específicas.
4. "conclusion": un párrafo breve que retome la clasificación calculada ("${r.clasificacion.etiqueta}") y la matice. La clasificación no debe borrar la heterogeneidad del perfil.

# EXTENSIÓN Y ESTILO
- "que_sale": normalmente 100 a 170 palabras.
- "lectura_contextual": normalmente 160 a 260 palabras en uno o dos párrafos.
- "conclusion": 70 a 120 palabras.
- La extensión es orientativa; prioriza suficiencia y claridad.
- Usa lenguaje accesible y natural. Explica qué significa el patrón en la vida cotidiana.
- No repitas literalmente el resumen clínico ni el análisis del TRAS.

# SALIDA
Devuelve SOLO JSON válido, sin backticks ni texto adicional:
{"version_schema":"3.0","que_sale":"párrafo descriptivo","lectura_contextual":"uno o dos párrafos contextualizados","sugerencias":["acción 1","acción 2","acción 3"],"conclusion":"cierre matizado"}

# CONTEXTO CLÍNICO DESPERSONALIZADO
${JSON.stringify((typeof aiScrubDeep === 'function') ? aiScrubDeep(summary, summary.caso.nombre) : summary, null, 1)}

# RESULTADOS GOLDSTEIN
Global: escasas ${r.global.pct.nunca}% · buenas ${r.global.pct.aveces}% · muy buenas ${r.global.pct.siempre}% (respondidos ${r.global.respondidos}/${r.global.total})
Clasificación: ${r.clasificacion.etiqueta}

Por grupo:
${tablaGrupos}

Respuestas por habilidad:
${detalleItems || 'No hay respuestas individuales registradas.'}

# REGLA FINAL
Integra los datos sin disminuir información importante. No conviertas diferencias específicas en una conclusión genérica y no inventes explicaciones para habilidades no respondidas.`;

  document.getElementById('goldPrompt').value = prompt;
  document.getElementById('goldSummaryPreview').textContent = summaryTxt;
  document.getElementById('goldJson').value = '';
  const fileEl = document.getElementById('goldJsonFile'); if (fileEl) fileEl.value = '';
  document.getElementById('goldJsonStatus').innerHTML = 'Aun no has pegado respuesta.';
  if (typeof hideAiGuide === 'function') hideAiGuide('goldAiGuide');
  if (typeof renderAiHubs === 'function') renderAiHubs('goldAiHubs');
  toggleModal('goldPromptModal', true);
}

async function copyGoldPrompt() {
  const t = document.getElementById('goldPrompt');
  try { await navigator.clipboard.writeText(t.value); toast('Prompt copiado. Elige una IA y sigue la ruta indicada.', 'ok'); }
  catch (e) {
    t.focus(); t.select();
    try { document.execCommand('copy'); toast('Prompt copiado. Elige una IA y sigue la ruta indicada.', 'ok'); }
    catch (_) { toast('Copia manual: selecciona el texto y usa Ctrl+C.', 'warn'); }
  }
  if (typeof revealAiGuide === 'function') revealAiGuide('goldAiGuide', 'goldAiHubs');
}

async function pasteGoldJson() {
  const el = document.getElementById('goldJson');
  try {
    el.value = await navigator.clipboard.readText();
    document.getElementById('goldJsonStatus').textContent = 'Contenido pegado. Ahora valida el JSON.';
  } catch (e) {
    toast('El navegador no permitio leer el portapapeles. Pega manualmente con Ctrl+V.', 'warn', 4500);
  }
  el.focus();
}

function clearGoldJson() {
  const el = document.getElementById('goldJson');
  if (el) { el.value = ''; el.focus(); }
  const file = document.getElementById('goldJsonFile'); if (file) file.value = '';
  const status = document.getElementById('goldJsonStatus');
  if (status) status.textContent = 'Respuesta vaciada. Puedes pegar o cargar un nuevo JSON.';
}

function parseGoldJson() {
  const el = document.getElementById('goldJson');
  const cleaned = sanitizeJsonText(el.value);
  el.value = cleaned;
  return JSON.parse(cleaned);
}

function validateGoldJson() {
  try {
    const data = parseGoldJson();
    const hasNew = ('que_sale' in data) || ('lectura_contextual' in data) || ('analisis_causal' in data) || ('sugerencias' in data);
    const hasOld = ('interpretacion' in data);
    if (!hasNew && !hasOld) {
      document.getElementById('goldJsonStatus').innerHTML = '<span class="badge warn">JSON incompleto</span> Falta al menos "que_sale", "lectura_contextual" o "sugerencias".';
      return false;
    }
    document.getElementById('goldJsonStatus').innerHTML = '<span class="badge ok">JSON valido</span> Estructura verificada.';
    return true;
  } catch (e) {
    const raw = document.getElementById('goldJson').value;
    document.getElementById('goldJsonStatus').innerHTML = (typeof jsonErrorMessage === 'function')
      ? jsonErrorMessage(e, raw)
      : '<span class="badge danger">JSON invalido</span> ' + escapeHtml(e.message);
    return false;
  }
}

function importGoldJson() {
  if (!validateGoldJson()) return;
  const data = parseGoldJson();
  const g = goldsteinState();
  const gi = goldsteinInterp(g);
  const sugToText = v => Array.isArray(v) ? v.map((x,i)=>`${i+1}) ${x}`).join('\n') : String(v || '');

  if (('que_sale' in data) || ('lectura_contextual' in data) || ('analisis_causal' in data) || ('sugerencias' in data) || ('conclusion' in data)) {
    // Esquema estructurado v2/v3
    gi.que_sale = String(data.que_sale || '').trim();
    gi.analisis_causal = String(data.lectura_contextual || data.analisis_causal || '').trim();
    gi.sugerencias = sugToText(data.sugerencias).trim();
    gi.conclusion = String(data.conclusion || '').trim();
  } else {
    // Compatibilidad con el esquema antiguo (v1.0)
    gi.analisis_causal = String(data.interpretacion || '').trim();
    const fort = Array.isArray(data.fortalezas) ? data.fortalezas.join('; ') : '';
    const areas = Array.isArray(data.areas_a_fortalecer) ? data.areas_a_fortalecer.join('; ') : '';
    gi.que_sale = [fort && ('Fortalezas: ' + fort + '.'), areas && ('Areas a fortalecer: ' + areas + '.')].filter(Boolean).join(' ');
    gi.sugerencias = sugToText(data.recomendaciones);
  }
  g.fuente = 'ia-manual';
  g.aplicado = true;
  persist();
  renderGoldstein();
  renderReport();
  document.getElementById('goldJsonStatus').innerHTML = '<span class="badge ok">JSON insertado</span> Revisa cada bloque antes de exportar.';
  toggleModal('goldPromptModal', false);
  toast('Interpretacion estructurada insertada. Recuerda revisarla.', 'ok');
}

function loadGoldJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('goldJson').value = sanitizeJsonText(String(reader.result || ''));
    document.getElementById('goldJsonStatus').textContent = 'Archivo JSON cargado. Ahora puedes validar o insertar.';
  };
  reader.readAsText(file, 'utf-8');
}

/* ============================================================
   Bloque para el informe (export.js lo invoca)
   ============================================================ */
function goldsteinReportSection(numero) {
  const c = getCurrentCase();
  const g = c.goldstein;
  if (!g || !g.aplicado) return '<div class="no-data">No se dispone de respuestas de la bateria de habilidades sociales.</div>';
  const gi = goldsteinInterp(g);
  const r = computeGoldstein(g.respuestas);
  const filas = r.porGrupo.map(grp => `
    <tr>
      <td>${grp.romano}. ${escapeHtml(grp.nombre)}</td>
      <td style="text-align:center">${grp.pct.nunca}%</td>
      <td style="text-align:center">${grp.pct.aveces}%</td>
      <td style="text-align:center">${grp.pct.siempre}%</td>
    </tr>`).join('');

  const sugItems = String(gi.sugerencias || '')
    .split(/\n+/).map(s => s.replace(/^\s*\d+[\).\-]\s*/, '').trim()).filter(Boolean);
  const conclusionTxt = (gi.conclusion && gi.conclusion.trim()) ? gi.conclusion.trim() : r.clasificacion.descripcion;

  return `
    <div class="gold-summary">
      <div class="gold-stat"><strong>${r.global.pct.nunca}%</strong><span>Escasas</span></div>
      <div class="gold-stat"><strong>${r.global.pct.aveces}%</strong><span>Buenas</span></div>
      <div class="gold-stat"><strong>${r.global.pct.siempre}%</strong><span>Muy buenas</span></div>
    </div>
    <div class="callout"><strong>Resultado global:</strong> ${r.global.respondidos}/${r.global.total} habilidades respondidas · <strong>${escapeHtml(r.clasificacion.etiqueta)}</strong>.</div>
    <table class="report-table">
      <thead><tr>
        <th>Grupo de habilidades</th><th>Escasas</th><th>Buenas</th><th>Muy buenas</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div class="quad-grid">
      <div class="insight-card"><h3>Habilidades disponibles</h3>${gi.que_sale ? `<div>${textToHtml(gi.que_sale)}</div>` : '<div class="no-data">No se dispone de una lectura cualitativa de las habilidades disponibles.</div>'}</div>
      <div class="insight-card vulnerabilities"><h3>Lectura contextual del perfil</h3>${gi.analisis_causal ? `<div>${textToHtml(gi.analisis_causal)}</div>` : '<div class="no-data">No se dispone de una integración contextual suficiente de los resultados.</div>'}</div>
    </div>
    <h3 style="color:#173653;margin:18px 0 8px">Indicaciones de mejora</h3>
    ${sugItems.length ? `<ol class="report-list">${sugItems.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>` : '<div class="no-data">No se han registrado indicaciones especificas de mejora.</div>'}
    <div class="callout green"><strong>Conclusion del nivel de habilidad:</strong><br>${textToHtml(conclusionTxt)}</div>`;
}

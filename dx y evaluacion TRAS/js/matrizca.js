/* ============================================================
   TRAS · matrizca.js
   Matriz Cognitivo-Atencional: bateria anexa OPCIONAL con tres
   submodulos exploratorios:
     1) Cognitivas (30 items de opcion multiple A/B/C/D)
     2) Atencion, inquietud, impulsividad y regulacion emocional
        (24 items autoinformados, frecuencia 0-3 + interferencia 0-3)
     3) Fortalezas e inteligencias multiples (32 items, preferencia 1-5)

   ADVERTENCIA DE DISENO (no cosmetica, leer antes de modificar):
   - Es un instrumento de EXPLORACION Y ORGANIZACION DE HALLAZGOS, no
     una prueba estandarizada. No sustituye pruebas neuropsicologicas,
     entrevista diagnostica, informacion escolar ni valoracion medica.
   - Los puntajes de "Cognitivas" son aciertos/total por area, no un
     CI ni una equivalencia con baremos poblacionales.
   - Los indicadores de atencion/impulsividad son frecuencia e
     interferencia AUTOINFORMADAS. No equivalen a un diagnostico de
     TDAH ni a ninguna escala clinica normativa (no es el Conners, el
     SNAP-IV ni similares).
   - Las inteligencias multiples se leen como preferencias y recursos
     de aprendizaje, no como una medicion de inteligencia general.
   - Generico por diseno: esta plantilla NO incluye datos de ningun
     caso real. Los datos de identificacion, HC y resultados se toman
     siempre del caso abierto en la app, igual que TRAS y Goldstein.
   ============================================================ */

/* ---------- Banco de items: Cognitivas (30) ---------- */
const MCA_COGN_ITEMS = [
  {codigo:'HC01', area:'Comprension verbal', item:'LIBRO es a LEER como MUSICA es a…', opciones:['mirar','escuchar','dibujar','escribir'], correcta:'B'},
  {codigo:'HC02', area:'Comprension verbal', item:'¿Cual palabra significa casi lo mismo que «preciso»?', opciones:['rapido','exacto','dificil','extenso'], correcta:'B'},
  {codigo:'HC03', area:'Comprension verbal', item:'«Aunque llovia, el equipo continuo entrenando». ¿Que se puede concluir?', opciones:['El entrenamiento fue cancelado','La lluvia no impidio entrenar','El equipo entreno dentro de una casa','Nadie queria entrenar'], correcta:'B'},
  {codigo:'HC04', area:'Comprension verbal', item:'¿Cual palabra no pertenece al mismo grupo?', opciones:['alegria','tristeza','enojo','bicicleta'], correcta:'D'},
  {codigo:'HC05', area:'Comprension verbal', item:'Completa: «Antes de responder una pregunta compleja, conviene…»', opciones:['adivinar','leerla con cuidado','responder muy rapido','copiar la primera idea'], correcta:'B'},
  {codigo:'HC06', area:'Comprension verbal', item:'«Juan estudio, pero olvido entregar el trabajo». La palabra «pero» indica…', opciones:['causa','contraste','tiempo','lugar'], correcta:'B'},
  {codigo:'HC07', area:'Razonamiento logico', item:'Completa la serie: 2, 5, 8, 11, …', opciones:['12','13','14','15'], correcta:'C'},
  {codigo:'HC08', area:'Razonamiento logico', item:'¿Cual figura es diferente por no tener lados rectos?', opciones:['cuadrado','triangulo','rectangulo','circulo'], correcta:'D'},
  {codigo:'HC09', area:'Razonamiento logico', item:'Completa la serie de letras: A, C, F, J, O, …', opciones:['T','U','V','W'], correcta:'B'},
  {codigo:'HC10', area:'Razonamiento logico', item:'Si todos los arqueros usan guantes y Tomas es arquero, entonces…', opciones:['Tomas nunca usa guantes','Tomas usa guantes','Todos los que usan guantes son arqueros','No se puede saber si Tomas juega futbol'], correcta:'B'},
  {codigo:'HC11', area:'Razonamiento logico', item:'Ana es mayor que Luis y Luis es mayor que Pedro. ¿Quien es el menor?', opciones:['Ana','Luis','Pedro','No se puede saber'], correcta:'C'},
  {codigo:'HC12', area:'Razonamiento logico', item:'Una regla cambia 3→7 y 5→11. Con la misma regla, 8→…', opciones:['14','15','16','17'], correcta:'D'},
  {codigo:'HC13', area:'Razonamiento cuantitativo', item:'¿Cuanto es 25 % de 80?', opciones:['10','20','25','40'], correcta:'B'},
  {codigo:'HC14', area:'Razonamiento cuantitativo', item:'Si 3 cuadernos cuestan 18 000 pesos, ¿cuanto cuestan 5 al mismo precio?', opciones:['25 000','28 000','30 000','35 000'], correcta:'C'},
  {codigo:'HC15', area:'Razonamiento cuantitativo', item:'Resuelve: 4x + 3 = 19', opciones:['3','4','5','6'], correcta:'B'},
  {codigo:'HC16', area:'Razonamiento cuantitativo', item:'El promedio de 6, 8 y 10 es…', opciones:['7','8','9','10'], correcta:'B'},
  {codigo:'HC17', area:'Razonamiento cuantitativo', item:'Una actividad inicia a las 3:40 p. m. y dura 1 hora 35 minutos. Termina a las…', opciones:['4:55 p. m.','5:05 p. m.','5:15 p. m.','5:25 p. m.'], correcta:'C'},
  {codigo:'HC18', area:'Razonamiento cuantitativo', item:'¿Que fraccion es equivalente a 3/4?', opciones:['6/8','6/10','9/16','12/20'], correcta:'A'},
  {codigo:'HC19', area:'Memoria de trabajo', item:'Escucha una vez: 7 – 2 – 9. Senala la secuencia en orden inverso.', opciones:['7-2-9','9-2-7','2-9-7','9-7-2'], correcta:'B'},
  {codigo:'HC20', area:'Memoria de trabajo', item:'Escucha una vez: B – 4 – M – 2. Senala primero los numeros de menor a mayor y luego las letras.', opciones:['2-4-B-M','4-2-B-M','B-M-2-4','2-4-M-B'], correcta:'A'},
  {codigo:'HC21', area:'Memoria de trabajo', item:'Escucha: «rojo, casa, 6, perro». ¿Cual fue el tercer elemento?', opciones:['rojo','casa','6','perro'], correcta:'C'},
  {codigo:'HC22', area:'Memoria de trabajo', item:'Escucha una vez: 5 – 1 – 8 – 3. ¿Cual era el segundo numero?', opciones:['5','1','8','3'], correcta:'B'},
  {codigo:'HC23', area:'Memoria de trabajo', item:'Escucha: «Antes de salir, guarda el cuaderno y lleva agua». ¿Que debe guardar?', opciones:['el balon','el cuaderno','los guantes','el agua'], correcta:'B'},
  {codigo:'HC24', area:'Memoria de trabajo', item:'Escucha una vez: 3 – 7 – 2 – 9 – 4. ¿Cual numero estaba inmediatamente antes del 9?', opciones:['7','2','3','4'], correcta:'B'},
  {codigo:'HC25', area:'Atencion y control inhibitorio', item:'¿Cuantas letras A hay en «CASA AMARILLA»?', opciones:['3','4','5','6'], correcta:'C'},
  {codigo:'HC26', area:'Atencion y control inhibitorio', item:'Marca la opcion identica a: 583729', opciones:['583729','583792','538729','5837290'], correcta:'A'},
  {codigo:'HC27', area:'Atencion y control inhibitorio', item:'Sigue la regla: responde el color indicado por la palabra «CIELO».', opciones:['verde','azul','rojo','amarillo'], correcta:'B'},
  {codigo:'HC28', area:'Atencion y control inhibitorio', item:'En la serie 4, 7, 4, 9, 4, 2, ¿cuantas veces aparece el 4?', opciones:['2','3','4','5'], correcta:'B'},
  {codigo:'HC29', area:'Atencion y control inhibitorio', item:'Lee toda la instruccion: marca D, no marques la primera respuesta que parezca correcta.', opciones:['A','B','C','D'], correcta:'D'},
  {codigo:'HC30', area:'Atencion y control inhibitorio', item:'¿Cual cadena contiene exactamente dos letras M?', opciones:['MAMA','MIMO','MAPA','MESA'], correcta:'A'}
];

/* ---------- Banco de items: Atencion/impulsividad/regulacion (24) ---------- */
const MCA_ATN_ITEMS = [
  {codigo:'AT01', dominio:'Inatencion', enunciado:'Me cuesta mantener la atencion cuando una actividad dura mucho.'},
  {codigo:'AT02', dominio:'Inatencion', enunciado:'Pierdo el hilo de una explicacion aunque intente escuchar.'},
  {codigo:'AT03', dominio:'Inatencion', enunciado:'Cometo errores por responder antes de leer todo.'},
  {codigo:'AT04', dominio:'Inatencion', enunciado:'Necesito que me repitan instrucciones que ya fueron dadas.'},
  {codigo:'AT05', dominio:'Inatencion', enunciado:'Empiezo una tarea y paso a otra sin terminar la primera.'},
  {codigo:'AT06', dominio:'Inatencion', enunciado:'Se me olvidan materiales, tareas o compromisos escolares.'},
  {codigo:'AT07', dominio:'Inatencion', enunciado:'Me distraen con facilidad ruidos, movimientos o pensamientos.'},
  {codigo:'AT08', dominio:'Inatencion', enunciado:'Mi mente se va por unos segundos incluso en actividades que me gustan.'},
  {codigo:'AT09', dominio:'Hiperactividad/inquietud', enunciado:'Siento que necesito mover las piernas o levantarme.'},
  {codigo:'AT10', dominio:'Hiperactividad/inquietud', enunciado:'Me cuesta permanecer sentado cuando se espera que lo haga.'},
  {codigo:'AT11', dominio:'Hiperactividad/inquietud', enunciado:'Muevo manos, pies u objetos para descargar energia.'},
  {codigo:'AT12', dominio:'Hiperactividad/inquietud', enunciado:'Siento una inquietud interna dificil de explicar.'},
  {codigo:'AT13', dominio:'Hiperactividad/inquietud', enunciado:'Hablo, juego o me muevo mas de lo conveniente en algunos momentos.'},
  {codigo:'AT14', dominio:'Impulsividad', enunciado:'Actuo antes de pensar en lo que puede pasar.'},
  {codigo:'AT15', dominio:'Impulsividad', enunciado:'Interrumpo o respondo antes de que terminen de hablar.'},
  {codigo:'AT16', dominio:'Impulsividad', enunciado:'Me cuesta esperar mi turno cuando estoy emocionado.'},
  {codigo:'AT17', dominio:'Impulsividad', enunciado:'Cuando me provocan, reacciono fisicamente muy rapido.'},
  {codigo:'AT18', dominio:'Impulsividad', enunciado:'Tomo decisiones por seguir al grupo aunque sepa que hay una norma.'},
  {codigo:'AT19', dominio:'Regulacion emocional', enunciado:'Cuando me enojo, me cuesta detener la reaccion.'},
  {codigo:'AT20', dominio:'Regulacion emocional', enunciado:'Acumulo molestias y luego exploto con intensidad.'},
  {codigo:'AT21', dominio:'Regulacion emocional', enunciado:'Me cuesta explicar con palabras lo que siento.'},
  {codigo:'AT22', dominio:'Regulacion emocional', enunciado:'Despues de actuar, siento culpa, verguenza o arrepentimiento.'},
  {codigo:'AT23', dominio:'Regulacion emocional', enunciado:'Los cambios o las perdidas me afectan mas de lo que muestro.'},
  {codigo:'AT24', dominio:'Regulacion emocional', enunciado:'Cuando estoy saturado, mi atencion y mi autocontrol empeoran.'}
];

/* ---------- Banco de items: Inteligencias multiples (32) ---------- */
const MCA_INT_ITEMS = [
  {codigo:'IM01', area:'Linguistica', enunciado:'Disfruto explicar ideas con palabras, historias o ejemplos.'},
  {codigo:'IM02', area:'Linguistica', enunciado:'Comprendo mejor cuando puedo leer y conversar sobre el tema.'},
  {codigo:'IM03', area:'Linguistica', enunciado:'Encuentro palabras adecuadas para contar lo que pienso.'},
  {codigo:'IM04', area:'Linguistica', enunciado:'Me interesan los relatos, idiomas, debates o juegos de palabras.'},
  {codigo:'IM05', area:'Logico-matematica', enunciado:'Me gusta descubrir reglas, secuencias y patrones.'},
  {codigo:'IM06', area:'Logico-matematica', enunciado:'Disfruto resolver problemas con numeros o estrategias.'},
  {codigo:'IM07', area:'Logico-matematica', enunciado:'Suelo preguntar por que ocurre algo y como funciona.'},
  {codigo:'IM08', area:'Logico-matematica', enunciado:'Organizo mejor una tarea cuando encuentro un procedimiento.'},
  {codigo:'IM09', area:'Espacial', enunciado:'Comprendo bien mapas, diagramas, recorridos o imagenes.'},
  {codigo:'IM10', area:'Espacial', enunciado:'Puedo imaginar como quedaria algo antes de construirlo.'},
  {codigo:'IM11', area:'Espacial', enunciado:'Recuerdo lugares, formas y posiciones con facilidad.'},
  {codigo:'IM12', area:'Espacial', enunciado:'Me gusta dibujar, disenar, armar o visualizar jugadas.'},
  {codigo:'IM13', area:'Corporal-cinestesica', enunciado:'Aprendo mejor cuando puedo moverme o practicar.'},
  {codigo:'IM14', area:'Corporal-cinestesica', enunciado:'Tengo buen control de mi cuerpo en actividades fisicas.'},
  {codigo:'IM15', area:'Corporal-cinestesica', enunciado:'Expreso energia y emociones mediante el movimiento.'},
  {codigo:'IM16', area:'Corporal-cinestesica', enunciado:'Me resulta facil aprender una accion viendo y repitiendo.'},
  {codigo:'IM17', area:'Musical', enunciado:'Reconozco ritmos, tonos o cambios en una cancion.'},
  {codigo:'IM18', area:'Musical', enunciado:'La musica me ayuda a concentrarme o regularme.'},
  {codigo:'IM19', area:'Musical', enunciado:'Recuerdo con facilidad melodias o fragmentos musicales.'},
  {codigo:'IM20', area:'Musical', enunciado:'Me gusta crear ritmos, cantar o explorar sonidos.'},
  {codigo:'IM21', area:'Interpersonal', enunciado:'Identifico con facilidad como se sienten otras personas.'},
  {codigo:'IM22', area:'Interpersonal', enunciado:'Me gusta trabajar en equipo cuando las reglas son claras.'},
  {codigo:'IM23', area:'Interpersonal', enunciado:'Se animar, acompanar o ayudar a un companero.'},
  {codigo:'IM24', area:'Interpersonal', enunciado:'Comprendo mejor conversando con alguien.'},
  {codigo:'IM25', area:'Intrapersonal', enunciado:'Puedo reconocer que situaciones me alteran o me tranquilizan.'},
  {codigo:'IM26', area:'Intrapersonal', enunciado:'Se cuales son mis fortalezas y que me cuesta mas.'},
  {codigo:'IM27', area:'Intrapersonal', enunciado:'Necesito momentos a solas para ordenar lo que pienso.'},
  {codigo:'IM28', area:'Intrapersonal', enunciado:'Puedo establecer metas personales y revisar como voy.'},
  {codigo:'IM29', area:'Naturalista', enunciado:'Me interesan los animales, plantas o fenomenos naturales.'},
  {codigo:'IM30', area:'Naturalista', enunciado:'Distingo caracteristicas y diferencias entre seres u objetos.'},
  {codigo:'IM31', area:'Naturalista', enunciado:'Disfruto actividades al aire libre y observar el entorno.'},
  {codigo:'IM32', area:'Naturalista', enunciado:'Aprendo organizando elementos por tipos, rasgos o categorias.'}
];

const MCA_FREQ_OPTS = [
  {v:0, t:'Nunca o casi nunca'}, {v:1, t:'Algunas veces'}, {v:2, t:'Con frecuencia'}, {v:3, t:'Casi siempre'}
];
const MCA_INTERF_OPTS = [
  {v:0, t:'Ninguna'}, {v:1, t:'Leve'}, {v:2, t:'Moderada'}, {v:3, t:'Alta'}
];
const MCA_PREF_OPTS = [
  {v:1, t:'Nada parecido a mi'}, {v:2, t:'Poco parecido a mi'}, {v:3, t:'A veces se parece a mi'}, {v:4, t:'Bastante parecido a mi'}, {v:5, t:'Muy parecido a mi'}
];
const MCA_OBS_OPTS = ['Sin dificultad visible','Pidio repeticion','Se apresuro','Se distrajo','Se frustro','Se autocorrigio','No registrado'];

/* ---------- Estado del caso ---------- */
const MCA_AREAS_ACADEMICAS = ['Lectura y comprensión lectora','Escritura y producción textual','Matemáticas','Ciencias naturales','Ciencias sociales','Inglés / segunda lengua','Ninguna en particular'];

function matrizCaState() {
  const c = getCurrentCase();
  if (!c.matrizCA || typeof c.matrizCA !== 'object') {
    c.matrizCA = { aplicado:false, cognitivas:{respuestas:{},observaciones:{}}, atencion:{respuestas:{}}, inteligencias:{respuestas:{}}, contexto:{areasAcademicas:[],habitosEstudio:'',cambiosHogar:'',cambiosSocial:'',apoyos:'',episodiosDesconexion:''}, interp:{cognitivas:'',atencion:'',fortalezas:'',correlacion:'',integracion:''}, fuente:'manual' };
  }
  const m = c.matrizCA;
  if (!m.cognitivas) m.cognitivas = {respuestas:{},observaciones:{}};
  if (!m.cognitivas.respuestas) m.cognitivas.respuestas = {};
  if (!m.cognitivas.observaciones) m.cognitivas.observaciones = {};
  if (!m.atencion) m.atencion = {respuestas:{}};
  if (!m.atencion.respuestas) m.atencion.respuestas = {};
  if (!m.inteligencias) m.inteligencias = {respuestas:{}};
  if (!m.inteligencias.respuestas) m.inteligencias.respuestas = {};
  if (!m.contexto || typeof m.contexto !== 'object') m.contexto = {};
  if (!Array.isArray(m.contexto.areasAcademicas)) m.contexto.areasAcademicas = [];
  ['habitosEstudio','cambiosHogar','cambiosSocial','apoyos','episodiosDesconexion'].forEach(k => { if (typeof m.contexto[k] !== 'string') m.contexto[k] = ''; });
  if (!m.interp) m.interp = {};
  ['cognitivas','atencion','fortalezas','correlacion','integracion'].forEach(k => { if (typeof m.interp[k] !== 'string') m.interp[k] = ''; });
  return m;
}

/* ---------- Contexto de estudio y aprendizaje (campos cualitativos, no items de banco) ---------- */
function toggleMcaAreaAcademica(area, checked) {
  const m = matrizCaState();
  const set = new Set(m.contexto.areasAcademicas);
  if (checked) set.add(area); else set.delete(area);
  m.contexto.areasAcademicas = [...set];
  m.aplicado = true;
  autosave();
}
function setMcaContexto(campo, valor) { const m = matrizCaState(); m.contexto[campo] = valor; autosave(); }

/* ---------- Calculo de resultados ---------- */
function computeMcaCognitivas(m) {
  const porArea = {};
  MCA_COGN_ITEMS.forEach(it => {
    porArea[it.area] = porArea[it.area] || {area:it.area, aciertos:0, total:0, respondidos:0};
    const a = porArea[it.area];
    a.total++;
    const resp = m.cognitivas.respuestas[it.codigo];
    if (resp) { a.respondidos++; if (resp === it.correcta) a.aciertos++; }
  });
  const areas = Object.values(porArea).map(a => Object.assign(a, {pct: a.respondidos ? Math.round((a.aciertos / a.respondidos) * 100) : null}));
  const totalItems = MCA_COGN_ITEMS.length;
  const totalResp = areas.reduce((s,a)=>s+a.respondidos,0);
  const totalAciertos = areas.reduce((s,a)=>s+a.aciertos,0);
  return { areas, global: {total: totalItems, respondidos: totalResp, aciertos: totalAciertos, pct: totalResp ? Math.round((totalAciertos/totalResp)*100) : null} };
}

function computeMcaAtencion(m) {
  const porDominio = {};
  MCA_ATN_ITEMS.forEach(it => {
    porDominio[it.dominio] = porDominio[it.dominio] || {dominio:it.dominio, sumaFrec:0, sumaInterf:0, total:0, respondidos:0};
    const d = porDominio[it.dominio];
    d.total++;
    const r = m.atencion.respuestas[it.codigo];
    if (r && typeof r.frecuencia === 'number') {
      d.respondidos++; d.sumaFrec += r.frecuencia; d.sumaInterf += (typeof r.interferencia === 'number' ? r.interferencia : 0);
    }
  });
  return Object.values(porDominio).map(d => Object.assign(d, {
    promFrec: d.respondidos ? +(d.sumaFrec / d.respondidos).toFixed(2) : null,
    promInterf: d.respondidos ? +(d.sumaInterf / d.respondidos).toFixed(2) : null
  }));
}

function computeMcaInteligencias(m) {
  const porArea = {};
  MCA_INT_ITEMS.forEach(it => {
    porArea[it.area] = porArea[it.area] || {area:it.area, suma:0, total:0, respondidos:0};
    const a = porArea[it.area];
    a.total++;
    const v = m.inteligencias.respuestas[it.codigo];
    if (typeof v === 'number') { a.respondidos++; a.suma += v; }
  });
  const areas = Object.values(porArea).map(a => Object.assign(a, {prom: a.respondidos ? +(a.suma / a.respondidos).toFixed(2) : null}));
  const sumaProms = areas.reduce((s,a)=>s + (a.prom || 0), 0);
  areas.forEach(a => { a.pctRelativo = (a.prom && sumaProms) ? Math.round((a.prom / sumaProms) * 100) : null; });
  return areas;
}

/* ---------- Guardado de respuestas (llamado desde los selectores) ---------- */
function setMcaCognitiva(codigo, valor) { const m = matrizCaState(); m.cognitivas.respuestas[codigo] = valor; m.aplicado = true; autosave(); }
function setMcaObservacion(codigo, valor) { const m = matrizCaState(); m.cognitivas.observaciones[codigo] = valor; autosave(); }
function setMcaAtencionFrecuencia(codigo, valor) {
  const m = matrizCaState(); const r = m.atencion.respuestas[codigo] = m.atencion.respuestas[codigo] || {};
  r.frecuencia = valor === '' ? undefined : Number(valor); m.aplicado = true; autosave();
}
function setMcaAtencionInterferencia(codigo, valor) {
  const m = matrizCaState(); const r = m.atencion.respuestas[codigo] = m.atencion.respuestas[codigo] || {};
  r.interferencia = valor === '' ? undefined : Number(valor); autosave();
}
function setMcaInteligencia(codigo, valor) { const m = matrizCaState(); m.inteligencias.respuestas[codigo] = valor === '' ? undefined : Number(valor); m.aplicado = true; autosave(); }

function setMatrizCaApplied(checked) { const m = matrizCaState(); m.aplicado = !!checked; autosave(); }
function clearMatrizCA() {
  if (!confirm('¿Borrar todas las respuestas de la Matriz Cognitivo-Atencional de este caso?')) return;
  const c = getCurrentCase();
  c.matrizCA = { aplicado:false, cognitivas:{respuestas:{},observaciones:{}}, atencion:{respuestas:{}}, inteligencias:{respuestas:{}}, contexto:{areasAcademicas:[],habitosEstudio:'',cambiosHogar:'',cambiosSocial:'',apoyos:'',episodiosDesconexion:''}, interp:{cognitivas:'',atencion:'',fortalezas:'',correlacion:'',integracion:''}, fuente:'manual' };
  persist('Matriz Cognitivo-Atencional reiniciada');
  renderMatrizCA();
  renderReport();
  toast('Matriz Cognitivo-Atencional reiniciada.', 'warn');
}

/* ---------- Render ---------- */
function renderMcaCognItem(it) {
  const m = matrizCaState();
  const v = m.cognitivas.respuestas[it.codigo] || '';
  const letras = ['A','B','C','D'];
  const opts = letras.map((L,i) => `
    <label class="gold-opt ${v===L?'sel siempre':''}" style="margin:0">
      <input type="radio" name="mca_${it.codigo}" value="${L}" ${v===L?'checked':''} onchange="setMcaCognitiva('${it.codigo}','${L}')"/>
      ${L}) ${escapeHtml(it.opciones[i])}
    </label>`).join('');
  const obsSel = `<select onchange="setMcaObservacion('${it.codigo}',this.value)" style="margin-top:6px;max-width:260px">
    <option value="">Observación (opcional)</option>
    ${MCA_OBS_OPTS.map(o => `<option value="${escapeHtml(o)}" ${m.cognitivas.observaciones[it.codigo]===o?'selected':''}>${escapeHtml(o)}</option>`).join('')}
  </select>`;
  return `<div class="gold-item">
    <div class="gold-item-text"><span class="badge info">${it.codigo}</span> <span class="small">${escapeHtml(it.area)}</span><br>${escapeHtml(it.item)}</div>
    <div class="gold-opts" style="flex-direction:column;align-items:flex-start">${opts}${obsSel}</div>
  </div>`;
}

function renderMcaAtnItem(it) {
  const m = matrizCaState();
  const r = m.atencion.respuestas[it.codigo] || {};
  const freqSel = `<select onchange="setMcaAtencionFrecuencia('${it.codigo}',this.value)">
    <option value="">Frecuencia…</option>
    ${MCA_FREQ_OPTS.map(o=>`<option value="${o.v}" ${r.frecuencia===o.v?'selected':''}>${escapeHtml(o.t)}</option>`).join('')}
  </select>`;
  const interfSel = `<select onchange="setMcaAtencionInterferencia('${it.codigo}',this.value)">
    <option value="">Interferencia…</option>
    ${MCA_INTERF_OPTS.map(o=>`<option value="${o.v}" ${r.interferencia===o.v?'selected':''}>${escapeHtml(o.t)}</option>`).join('')}
  </select>`;
  return `<div class="gold-item">
    <div class="gold-item-text"><span class="badge info">${it.codigo}</span> ${escapeHtml(it.enunciado)}</div>
    <div class="gold-opts">${freqSel}${interfSel}</div>
  </div>`;
}

function renderMcaIntItem(it) {
  const m = matrizCaState();
  const v = m.inteligencias.respuestas[it.codigo];
  const sel = `<select onchange="setMcaInteligencia('${it.codigo}',this.value)">
    <option value="">Preferencia…</option>
    ${MCA_PREF_OPTS.map(o=>`<option value="${o.v}" ${v===o.v?'selected':''}>${escapeHtml(o.t)}</option>`).join('')}
  </select>`;
  return `<div class="gold-item">
    <div class="gold-item-text"><span class="badge info">${it.codigo}</span> ${escapeHtml(it.enunciado)}</div>
    <div class="gold-opts">${sel}</div>
  </div>`;
}

function mcaAreasGrouped(items, key) {
  const seen = [];
  items.forEach(it => { if (!seen.includes(it[key])) seen.push(it[key]); });
  return seen.map(name => ({ nombre: name, items: items.filter(it => it[key] === name) }));
}

function renderMatrizCA() {
  const host = document.getElementById('matrizCABody');
  if (!host) return;
  const m = matrizCaState();
  const rCog = computeMcaCognitivas(m);
  const rAtn = computeMcaAtencion(m);
  const rInt = computeMcaInteligencias(m);

  const cogBody = mcaAreasGrouped(MCA_COGN_ITEMS, 'area').map(g => `
    <details class="area-block"><summary>${escapeHtml(g.nombre)} <span class="small">(${g.items.length} items)</span></summary>
    <div style="margin-top:10px">${g.items.map(renderMcaCognItem).join('')}</div></details>`).join('');
  const atnBody = mcaAreasGrouped(MCA_ATN_ITEMS, 'dominio').map(g => `
    <details class="area-block"><summary>${escapeHtml(g.nombre)} <span class="small">(${g.items.length} items)</span></summary>
    <div style="margin-top:10px">${g.items.map(renderMcaAtnItem).join('')}</div></details>`).join('');
  const intBody = mcaAreasGrouped(MCA_INT_ITEMS, 'area').map(g => `
    <details class="area-block"><summary>${escapeHtml(g.nombre)} <span class="small">(${g.items.length} items)</span></summary>
    <div style="margin-top:10px">${g.items.map(renderMcaIntItem).join('')}</div></details>`).join('');

  const cogTable = rCog.areas.map(a => `<tr><td>${escapeHtml(a.area)}</td><td class="num">${a.respondidos}/${a.total}</td><td class="num">${a.pct===null?'—':a.pct+'%'}</td></tr>`).join('');
  const atnTable = rAtn.map(d => `<tr><td>${escapeHtml(d.dominio)}</td><td class="num">${d.respondidos}/${d.total}</td><td class="num">${d.promFrec===null?'—':d.promFrec+'/3'}</td><td class="num">${d.promInterf===null?'—':d.promInterf+'/3'}</td></tr>`).join('');
  const intTable = rInt.map(a => `<tr><td>${escapeHtml(a.area)}</td><td class="num">${a.respondidos}/${a.total}</td><td class="num">${a.prom===null?'—':a.prom+'/5'}</td><td class="num">${a.pctRelativo===null?'—':a.pctRelativo+'%'}</td></tr>`).join('');

  host.innerHTML = `
    <div class="help" style="margin-bottom:12px">
      <strong>Matriz Cognitivo-Atencional.</strong> Instrumento de exploracion y organizacion de hallazgos.
      No sustituye pruebas estandarizadas, entrevista diagnostica, informacion escolar ni valoracion medica.
      Los indicadores de atencion/impulsividad son autoinformados y no equivalen a un diagnostico de TDAH.
    </div>
    <div class="inline" style="justify-content:space-between;margin-bottom:10px">
      <label style="margin:0"><input type="checkbox" id="mca_aplicado" ${m.aplicado?'checked':''} onchange="setMatrizCaApplied(this.checked)"/> Aplicar esta matriz en el caso e incluirla en el informe</label>
      ${(m.cognitivas.respuestas && Object.keys(m.cognitivas.respuestas).length) || Object.keys(m.atencion.respuestas).length || Object.keys(m.inteligencias.respuestas).length ? '<button class="btn secondary danger-outline" onclick="clearMatrizCA()">Vaciar matriz</button>' : ''}
    </div>

    <details class="area-block" open><summary><strong>1. Habilidades cognitivas</strong> — 30 items de opcion multiple</summary>
      <div style="margin-top:10px">${cogBody}</div>
      <table class="gold-table" style="margin-top:14px"><thead><tr><th>Area</th><th class="num">Resp.</th><th class="num">% aciertos</th></tr></thead><tbody>${cogTable}</tbody></table>
    </details>

    <details class="area-block" style="margin-top:14px"><summary><strong>2. Atencion, inquietud, impulsividad y regulacion</strong> — 24 items autoinformados</summary>
      <div style="margin-top:10px">${atnBody}</div>
      <table class="gold-table" style="margin-top:14px"><thead><tr><th>Dominio</th><th class="num">Resp.</th><th class="num">Frecuencia prom.</th><th class="num">Interferencia prom.</th></tr></thead><tbody>${atnTable}</tbody></table>
    </details>

    <details class="area-block" style="margin-top:14px"><summary><strong>3. Fortalezas e inteligencias multiples</strong> — 32 items</summary>
      <div style="margin-top:10px">${intBody}</div>
      <table class="gold-table" style="margin-top:14px"><thead><tr><th>Area</th><th class="num">Resp.</th><th class="num">Promedio</th><th class="num">% relativo</th></tr></thead><tbody>${intTable}</tbody></table>
    </details>

    <details class="area-block" style="margin-top:14px" open><summary><strong>4. Contexto de estudio y aprendizaje</strong> — campos breves, no puntuados</summary>
      <p class="small" style="margin-top:8px">Esto conecta el perfil cognitivo/atencional con el "por qué" del desempeño académico: no son items de banco, son observaciones puntuales del profesional o de quien acompaña al evaluado.</p>
      <label style="margin-top:10px">Área(s) académica(s) con mayor dificultad</label>
      <div class="inline" style="flex-wrap:wrap;gap:8px;margin-top:6px">
        ${MCA_AREAS_ACADEMICAS.map(a => `<label class="gold-opt ${m.contexto.areasAcademicas.includes(a)?'sel siempre':''}" style="margin:0"><input type="checkbox" ${m.contexto.areasAcademicas.includes(a)?'checked':''} onchange="toggleMcaAreaAcademica('${a.replace(/'/g,"\\'")}',this.checked)"/> ${escapeHtml(a)}</label>`).join('')}
      </div>
      <label style="margin-top:10px">Hábitos de estudio actuales (organización del tiempo, técnicas usadas, autonomía vs. necesidad de supervisión)</label>
      <textarea oninput="setMcaContexto('habitosEstudio',this.value)" style="min-height:70px">${escapeHtml(m.contexto.habitosEstudio||'')}</textarea>
      <label style="margin-top:10px">Cambios recientes en el hogar relevantes para el estudio</label>
      <textarea oninput="setMcaContexto('cambiosHogar',this.value)" style="min-height:60px">${escapeHtml(m.contexto.cambiosHogar||'')}</textarea>
      <label style="margin-top:10px">Cambios recientes en la vida social relevantes para el estudio</label>
      <textarea oninput="setMcaContexto('cambiosSocial',this.value)" style="min-height:60px">${escapeHtml(m.contexto.cambiosSocial||'')}</textarea>
      <label style="margin-top:10px">Apoyos y recursos ya en uso (agenda, tutorías, tecnología, acompañamiento, etc.)</label>
      <textarea oninput="setMcaContexto('apoyos',this.value)" style="min-height:60px">${escapeHtml(m.contexto.apoyos||'')}</textarea>
      <label style="margin-top:10px">Episodios de "desconexión" o dispersión atencional <span class="small">(frecuencia, duración, qué los detona, cómo reacciona cuando se le llama, estado posterior, relación con el sueño — si se han observado)</span></label>
      <textarea oninput="setMcaContexto('episodiosDesconexion',this.value)" style="min-height:70px">${escapeHtml(m.contexto.episodiosDesconexion||'')}</textarea>
    </details>

    <div class="card" style="box-shadow:none;margin-top:14px">
      <div class="inline" style="justify-content:space-between">
        <h3 style="margin:0">Lectura clinica de la matriz</h3>
      </div>
      <p class="small">Se redacta junto con el resto de la evaluación en "Generar todo con un solo prompt" (Centro de informes, paso 8), o puede escribirse manualmente aquí.</p>
      ${m.fuente==='ia-manual' ? '<span class="badge info">origen: IA (revisar)</span>' : ''}
      <label style="margin-top:10px">Perfil cognitivo (fortalezas, errores, posibles efectos linguisticos)</label>
      <textarea id="mca_txt_cog" oninput="updateMcaInterp('cognitivas',this.value)" style="min-height:100px">${escapeHtml(m.interp.cognitivas||'')}</textarea>
      <label style="margin-top:10px">Atencion, impulsividad y regulacion (frecuencia, interferencia, contextos)</label>
      <textarea id="mca_txt_atn" oninput="updateMcaInterp('atencion',this.value)" style="min-height:100px">${escapeHtml(m.interp.atencion||'')}</textarea>
      <label style="margin-top:10px">Fortalezas e inteligencias como recurso de aprendizaje</label>
      <textarea id="mca_txt_int" oninput="updateMcaInterp('fortalezas',this.value)" style="min-height:90px">${escapeHtml(m.interp.fortalezas||'')}</textarea>
      <label style="margin-top:10px">Correlación académica y contextual <span class="small">(por qué no aprende en el área señalada arriba; argumentos evaluativos y contextuales para sustentar ajustes escolares)</span></label>
      <textarea id="mca_txt_correl" oninput="updateMcaInterp('correlacion',this.value)" style="min-height:110px">${escapeHtml(m.interp.correlacion||'')}</textarea>
      <label style="margin-top:10px">Integracion comprensiva y recomendaciones</label>
      <textarea id="mca_txt_integ" oninput="updateMcaInterp('integracion',this.value)" style="min-height:100px">${escapeHtml(m.interp.integracion||'')}</textarea>
    </div>
    <div class="actions" style="margin-top:12px"><button class="btn secondary" onclick="renderMatrizCA()">Actualizar resultados</button></div>`;
}

function updateMcaInterp(campo, valor) {
  const m = matrizCaState();
  m.interp[campo] = valor;
  m.fuente = 'manual';
  autosave();
}

/* ---------- Flujo de IA ---------- */
registerAiFlow('matriz_ca', {
  titulo: 'Matriz Cognitivo-Atencional',
  hint: 'Genera una lectura clinica integrada de las tres submodulos. No es una prueba estandarizada; es un instrumento de exploracion y organizacion de hallazgos.',
  aviso: 'Este prompt sale de tu navegador hacia una IA externa con datos despersonalizados. Los indicadores de atencion/impulsividad son autoinformados y no equivalen a un diagnostico de TDAH.',
  requiredKeys: ['cognitivas', 'atencion', 'fortalezas', 'integracion'],
  buildPrompt() {
    const m = matrizCaState();
    const rCog = computeMcaCognitivas(m);
    const rAtn = computeMcaAtencion(m);
    const rInt = computeMcaInteligencias(m);
    if (!rCog.global.respondidos && !rAtn.some(d=>d.respondidos) && !rInt.some(a=>a.respondidos)) {
      throw new Error('No hay respuestas registradas en la Matriz Cognitivo-Atencional todavia.');
    }
    const ctx = aiCaseContext();
    const payload = aiScrubDeep({
      cognitivas: rCog, atencion: rAtn, inteligencias: rInt
    }, getCurrentCase().meta.nombre);
    return `# ROL
Eres un psicologo clinico infanto-juvenil con formacion en evaluacion psicoeducativa. Analizas una MATRIZ DE EXPLORACION cognitiva, atencional y de fortalezas.

# ADVERTENCIA CENTRAL
No emitas diagnosticos automaticos ni conviertas puntajes orientativos en resultados de pruebas estandarizadas. Los indicadores de atencion/impulsividad son autoinformados (no es un diagnostico de TDAH). Diferencia hallazgos observados, autoinforme, hipotesis, informacion faltante y recomendaciones de profundizacion.

# CONTEXTO DEL CASO
${JSON.stringify(ctx, null, 1)}

# RESULTADOS POR AREA/DOMINIO
${JSON.stringify(payload, null, 1)}

# TAREA
Redacta cuatro bloques breves (60-100 palabras cada uno):
1. "cognitivas": perfil cognitivo por areas, con posibles efectos linguisticos o de proceso (sin patologizar).
2. "atencion": lectura de frecuencia e interferencia por dominio, con contextos si son relevantes.
3. "fortalezas": inteligencias/preferencias como recursos de aprendizaje aprovechables.
4. "integracion": integracion comprensiva y recomendaciones concretas para familia y colegio; incluye si hay senales que justificarian valoracion neuropsicologica, fonoaudiologica o medica (sin afirmarlo como diagnostico).

# SALIDA
Devuelve SOLO JSON valido, sin backticks ni texto adicional:
{"cognitivas":"...","atencion":"...","fortalezas":"...","integracion":"..."}`;
  },
  apply(data) {
    const m = matrizCaState();
    m.interp.cognitivas = String(data.cognitivas || '').trim();
    m.interp.atencion = String(data.atencion || '').trim();
    m.interp.fortalezas = String(data.fortalezas || '').trim();
    m.interp.integracion = String(data.integracion || '').trim();
    m.fuente = 'ia-manual';
    m.aplicado = true;
    return 'Lectura clinica insertada. Revisala: es una interpretacion, no un resultado de prueba estandarizada.';
  }
});

/* ---------- Bloque para el informe (export.js lo invoca) ---------- */
function matrizCaReportSection(showTables) {
  showTables = showTables !== false;
  const c = getCurrentCase();
  const m = c.matrizCA;
  if (!m || !m.aplicado) return '';
  const rCog = computeMcaCognitivas(m);
  const rAtn = computeMcaAtencion(m);
  const rInt = computeMcaInteligencias(m);

  const cogRows = rCog.areas.map(a => `<tr><td>${escapeHtml(a.area)}</td><td style="text-align:center">${a.respondidos}/${a.total}</td><td style="text-align:center">${a.pct===null?'—':a.pct+'%'}</td></tr>`).join('');
  const atnRows = rAtn.map(d => `<tr><td>${escapeHtml(d.dominio)}</td><td style="text-align:center">${d.respondidos}/${d.total}</td><td style="text-align:center">${d.promFrec===null?'—':d.promFrec+'/3'}</td><td style="text-align:center">${d.promInterf===null?'—':d.promInterf+'/3'}</td></tr>`).join('');
  const intRows = rInt.map(a => `<tr><td>${escapeHtml(a.area)}</td><td style="text-align:center">${a.respondidos}/${a.total}</td><td style="text-align:center">${a.pctRelativo===null?'—':a.pctRelativo+'%'}</td></tr>`).join('');

  const tablas = `
    <table class="report-table"><thead><tr><th>Habilidad cognitiva</th><th>Resp.</th><th>% aciertos</th></tr></thead><tbody>${cogRows}</tbody></table>
    <table class="report-table" style="margin-top:12px"><thead><tr><th>Dominio atencional</th><th>Resp.</th><th>Frecuencia</th><th>Interferencia</th></tr></thead><tbody>${atnRows}</tbody></table>
    <table class="report-table" style="margin-top:12px"><thead><tr><th>Inteligencia/fortaleza</th><th>Resp.</th><th>% relativo</th></tr></thead><tbody>${intRows}</tbody></table>`;

  const ctx = m.contexto || {};
  const contextoHtml = (ctx.areasAcademicas?.length || ctx.habitosEstudio || ctx.cambiosHogar || ctx.cambiosSocial || ctx.apoyos || ctx.episodiosDesconexion) ? `
    <div class="callout" style="margin-top:14px">
      <strong>Contexto de estudio y aprendizaje</strong>
      ${ctx.areasAcademicas?.length ? `<div style="margin-top:6px"><em>Áreas académicas con mayor dificultad:</em> ${escapeHtml(ctx.areasAcademicas.join(', '))}</div>` : ''}
      ${ctx.habitosEstudio ? `<div style="margin-top:6px"><em>Hábitos de estudio:</em> ${textToHtml(ctx.habitosEstudio)}</div>` : ''}
      ${ctx.cambiosHogar ? `<div style="margin-top:6px"><em>Cambios recientes en el hogar:</em> ${textToHtml(ctx.cambiosHogar)}</div>` : ''}
      ${ctx.cambiosSocial ? `<div style="margin-top:6px"><em>Cambios recientes en la vida social:</em> ${textToHtml(ctx.cambiosSocial)}</div>` : ''}
      ${ctx.apoyos ? `<div style="margin-top:6px"><em>Apoyos y recursos en uso:</em> ${textToHtml(ctx.apoyos)}</div>` : ''}
      ${ctx.episodiosDesconexion ? `<div style="margin-top:6px"><em>Episodios de desconexión/dispersión atencional:</em> ${textToHtml(ctx.episodiosDesconexion)}</div>` : ''}
    </div>` : '';

  return `
    ${showTables ? tablas : ''}
    <div class="quad-grid" style="margin-top:14px">
      <div class="insight-card"><h3>Perfil cognitivo</h3>${m.interp.cognitivas ? `<div>${textToHtml(m.interp.cognitivas)}</div>` : '<div class="no-data">Sin lectura registrada.</div>'}</div>
      <div class="insight-card vulnerabilities"><h3>Atencion, impulsividad y regulacion</h3>${m.interp.atencion ? `<div>${textToHtml(m.interp.atencion)}</div>` : '<div class="no-data">Sin lectura registrada.</div>'}</div>
      <div class="insight-card resources"><h3>Fortalezas e inteligencias</h3>${m.interp.fortalezas ? `<div>${textToHtml(m.interp.fortalezas)}</div>` : '<div class="no-data">Sin lectura registrada.</div>'}</div>
      <div class="insight-card"><h3>Integracion y recomendaciones</h3>${m.interp.integracion ? `<div>${textToHtml(m.interp.integracion)}</div>` : '<div class="no-data">Sin lectura registrada.</div>'}</div>
    </div>
    ${contextoHtml}
    ${m.interp.correlacion ? `<div class="integration-hero" style="margin-top:14px"><h3>Correlación académica y contextual</h3><div>${textToHtml(m.interp.correlacion)}</div></div>` : ''}
    ${!showTables ? '<div class="method-note">Los valores numericos por area/dominio se incluyen en la version del informe dirigida a profesionales.</div>' : ''}
    <div class="callout"><strong>Advertencia:</strong> instrumento de exploracion y organizacion de hallazgos; los indicadores de atencion/impulsividad son autoinformados y no equivalen a un diagnostico de TDAH.</div>`;
}

/* ============================================================
   PANTALLAS — parte 4: informe + mapa de nodos, guardado, historial
   ============================================================ */

registerRoute('informe', (s)=>{
  const inf = cur.informe;
  const estadoGeneracion = getGenerationStatus(cur);
  const lecturaNecesitaActualizar = estadoGeneracion.lecturaDesactualizada;
  const cronicaNecesitaActualizar = estadoGeneracion.cronicaDesactualizada && !lecturaNecesitaActualizar;
  const cronicaLabel = !estadoGeneracion.hasCronica ? 'Generar crónica' : (cronicaNecesitaActualizar ? 'Rehacer crónica' : 'Ver mi crónica');
  const cronicaTooltip = !estadoGeneracion.hasCronica
    ? 'Crea una crónica narrativa a partir de la lectura actual.'
    : (cronicaNecesitaActualizar ? 'La lectura cambió desde la última crónica. Genera una nueva versión.' : 'Abre la crónica narrativa guardada.');
  const resumenEstaciones = buildResumenEstacionesView(inf, cur.alias);
  const hayRetornos = getConexionesRetorno(inf).length > 0;
  const hayBalance = inf.balance_justicia_amor_caridad && Object.values(inf.balance_justicia_amor_caridad).some(ley => ley && (ley.avance_logrado || ley.patron_persistente));
  let n = 0;
  const nLectura = ++n;
  const nRuta = ++n;
  const nEstaciones = resumenEstaciones ? ++n : null;
  const nHilo = inf.hilo_conductor ? ++n : null;
  const nRetornos = hayRetornos ? ++n : null;
  const nBalance = hayBalance ? ++n : null;
  const nCierre = ++n;
  const totalSecciones = n;
  s.innerHTML = `
    <div id="migas"></div>
    <div class="context-toolbar informe-context-toolbar" id="informe-toolbar" role="toolbar" aria-label="Acciones principales del informe">
      <div class="ct-main-actions">
        <button class="ct-btn ct-btn-save" id="tb-guardar" type="button" data-tooltip="Guarda o actualiza esta bitácora en este dispositivo." aria-label="Guardar o actualizar esta bitácora">
          <span class="ct-icon" aria-hidden="true">✓</span><span class="ct-label">Guardar</span>
        </button>
        <button class="ct-btn ct-btn-primary ${cronicaNecesitaActualizar ? 'attention-pulse' : ''}" id="tb-cronica" type="button" data-tooltip="${esc(cronicaTooltip)}" aria-label="${esc(cronicaTooltip)}">
          <span class="ct-icon" aria-hidden="true">♪</span><span class="ct-label">${esc(cronicaLabel)}</span>
        </button>
        <button class="ct-btn ct-btn-reading ${lecturaNecesitaActualizar ? 'attention-pulse' : ''}" id="tb-nueva-lectura" type="button" data-tooltip="Vuelve a procesar toda la información del caso y te lleva a Toca para revelar." aria-label="Nueva lectura de toda la información">
          <span class="ct-icon" aria-hidden="true">✦</span><span class="ct-label">Nueva lectura</span>
        </button>
        <button class="ct-btn ct-btn-maps" id="tb-graficos" type="button" data-tooltip="Abre mapas, árbol de red, tarjetas y collage narrativo." aria-label="Abrir mapas, tarjetas y collage">
          <span class="ct-icon" aria-hidden="true">▦</span><span class="ct-label">Mapas</span>
        </button>
      </div>
      <div class="ct-utility-actions">
        <div class="ct-menu-wrap">
          <button class="ct-btn ct-btn-menu" id="tb-exportar-menu" type="button" data-context-menu-target="tb-exportar-panel" aria-controls="tb-exportar-panel" aria-haspopup="menu" aria-expanded="false" data-tooltip="Abre todas las opciones de exportación y respaldo.">
            <span class="ct-icon" aria-hidden="true">⇩</span><span class="ct-label">Exportar</span><span class="ct-caret" aria-hidden="true">▾</span>
          </button>
          <div class="ct-menu-panel" id="tb-exportar-panel" role="menu" aria-labelledby="tb-exportar-menu" hidden>
            <div class="ct-menu-heading">Informes</div>
            <button class="ct-menu-item" id="tb-exportar-html-pagina" type="button" role="menuitem">
              <span class="ct-menu-icon" aria-hidden="true">H</span><span><strong>Informe global HTML</strong><small>Lectura completa con su estructura visual.</small></span>
            </button>
            <button class="ct-menu-item" id="tb-informe-html" type="button" role="menuitem">
              <span class="ct-menu-icon" aria-hidden="true">E</span><span><strong>Informe ejecutivo HTML</strong><small>Versión resumida y navegable.</small></span>
            </button>
            <button class="ct-menu-item" id="tb-informe-word" type="button" role="menuitem">
              <span class="ct-menu-icon" aria-hidden="true">W</span><span><strong>Documento para Word</strong><small>Versión editable compatible con Word.</small></span>
            </button>
            <div class="ct-menu-heading">Datos y respaldo</div>
            <button class="ct-menu-item" id="tb-exportar-txt" type="button" role="menuitem">
              <span class="ct-menu-icon" aria-hidden="true">T</span><span><strong>Lectura TXT</strong><small>Texto sencillo, sin diseño ni gráficos.</small></span>
            </button>
            <button class="ct-menu-item" id="tb-exportar-json" type="button" role="menuitem">
              <span class="ct-menu-icon" aria-hidden="true">{ }</span><span><strong>Caso JSON</strong><small>Datos estructurados para respaldo o importación.</small></span>
            </button>
          </div>
        </div>
        <div class="ct-menu-wrap">
          <button class="ct-btn ct-btn-menu ct-btn-more" id="tb-mas-menu" type="button" data-context-menu-target="tb-mas-panel" aria-controls="tb-mas-panel" aria-haspopup="menu" aria-expanded="false" data-tooltip="Abre opciones adicionales del informe.">
            <span class="ct-icon" aria-hidden="true">⋯</span><span class="ct-label">Más</span>
          </button>
          <div class="ct-menu-panel ct-menu-panel-right" id="tb-mas-panel" role="menu" aria-labelledby="tb-mas-menu" hidden>
            ${cur._editingEntryId ? `<button class="ct-menu-item" id="tb-versiones" type="button" role="menuitem"><span class="ct-menu-icon" aria-hidden="true">↺</span><span><strong>Versiones internas</strong><small>Consulta las versiones guardadas de esta bitácora.</small></span></button>` : ''}
            <button class="ct-menu-item ct-menu-item-danger" id="tb-salir-sin-guardar" type="button" role="menuitem">
              <span class="ct-menu-icon" aria-hidden="true">⌂</span><span><strong>No guardar y volver al inicio</strong><small>Descarta esta sesión actual.</small></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    ${lecturaNecesitaActualizar ? `<div class="generation-alert"><strong>Nueva lectura recomendada.</strong> Cambiaste información del caso después de generar esta lectura. El botón “Nueva lectura” te lleva nuevamente a <em>Toca para revelar</em>.</div>` : (cronicaNecesitaActualizar ? `<div class="generation-alert"><strong>La crónica quedó desactualizada.</strong> La lectura actual es más reciente; usa “Rehacer crónica” para sincronizarla.</div>` : '')}

    <div class="tb-movil" id="tb-movil" role="toolbar" aria-label="Acciones principales del informe">
      <button class="tb-movil-btn tb-movil-save" id="tbm-guardar" title="Guardar o actualizar esta bitácora" aria-label="Guardar o actualizar esta bitácora">
        <span class="tb-movil-icon" aria-hidden="true">✓</span><span>Guardar</span>
      </button>
      <button class="tb-movil-btn tb-movil-principal ${cronicaNecesitaActualizar ? 'attention-pulse-mobile' : ''}" id="tbm-cronica" title="${esc(cronicaTooltip)}" aria-label="${esc(cronicaTooltip)}">
        <span class="tb-movil-icon" aria-hidden="true">♪</span><span>${!estadoGeneracion.hasCronica ? 'Generar' : (cronicaNecesitaActualizar ? 'Rehacer' : 'Crónica')}</span>
      </button>
      <button class="tb-movil-btn ${lecturaNecesitaActualizar ? 'attention-pulse-mobile' : ''}" id="tbm-nueva-lectura" title="Nueva lectura de toda la información" aria-label="Nueva lectura de toda la información">
        <span class="tb-movil-icon">✦</span><span>Nueva lectura</span>
      </button>
      <button class="tb-movil-btn" id="tbm-exportar" aria-label="Abrir opciones de exportación">
        <span class="tb-movil-icon">⇩</span><span>Exportar</span>
      </button>
      <button class="tb-movil-btn" id="tbm-mas" aria-label="Abrir más acciones">
        <span class="tb-movil-icon">⋯</span><span>Más</span>
      </button>
    </div>
    <div class="tb-drawer-overlay" id="tb-drawer-overlay"></div>
    <div class="tb-drawer" id="tb-drawer">
      <div class="tb-drawer-handle"></div>
      <div id="tb-drawer-contenido"></div>
      <button class="btn btn-ghost" id="tb-drawer-cerrar" style="width:100%; margin-top:10px;">Cerrar</button>
    </div>

    <div class="informe-reading-column">
    <p class="lectura-indice">Informe en ${totalSecciones} secciones — cada número marca el orden de lectura sugerido.</p>
    <div class="eyebrow">${nLectura} · Tu lectura · ${esc(cur.alias)}</div>
    <h2>Lo que apareció esta vez</h2>
    <div class="spacer-md"></div>
    <div id="retrato-literario"></div>
    <div id="lectura-general"></div>

    <div class="spacer-md"></div>
    <div class="eyebrow">${nRuta} · La ruta</div>
    <p class="body-text muted" style="margin-bottom:14px;">Hipótesis simbólicas de posibles vidas pasadas, construidas principalmente desde tus sueños, presencias y sensaciones — nunca como hecho verificado.</p>
    <div id="resumen-exec"></div>

    ${resumenEstaciones ? `
    <div class="spacer-md"></div>
    <div class="eyebrow">${nEstaciones} · Resumen narrativo por estaciones</div>
    <p class="body-text muted" style="margin-bottom:12px;">Bloque de redacción integrado al informe: párrafos continuos que sintetizan estaciones narrativas/reencarnaciones simbólicas, períodos, roles, muertes o tránsitos cuando aparecen, vínculos actuales y aprendizajes.</p>
    <div id="resumen-estaciones"></div>
    ` : ''}

    <p class="timeline-note">Mapa cronológico de tu ruta. Toca cualquier etapa para expandirla y ver su detalle completo.</p>
    <div id="mapa-nodos" class="ruta-diagrama"></div>

    ${inf.hilo_conductor ? `
    <div class="spacer-md"></div>
    <div class="eyebrow">${nHilo} · Hilo conductor entre las etapas</div>
    <div id="hilo-conductor"></div>
    ` : ''}

    ${hayRetornos ? `
    <div class="spacer-md"></div>
    <div class="divider"></div>
    <div class="eyebrow">${nRetornos} · Mapa de retornos</div>
    <p class="body-text muted" style="margin-bottom:12px;">Personas, roles y posibles vidas que se conectan — coincidencias entre presencias de tus sueños y personas reales de tu vida actual, leídas como resonancia posible, nunca como identidad afirmada.</p>
    <div id="mapa-retornos-unificado"></div>
    ` : ''}

    ${hayBalance ? `
    <div class="spacer-md"></div>
    <div class="divider"></div>
    <div class="eyebrow">${nBalance} · El balance de Justicia, Amor y Caridad</div>
    <p class="body-text muted" style="margin-bottom:12px;">Una lectura transversal de toda la ruta a través de las tres leyes morales del Libro Tercero de Kardec — no es un examen ni una calificación, es un mapa de dónde ya hubo avance y dónde el material sugiere que algo sigue abierto.</p>
    <div id="balance-jac"></div>
    ` : ''}

    <div class="spacer-md"></div>
    <div class="divider"></div>
    <div class="eyebrow">${nCierre} · Lo que se estaría cerrando</div>
    <div id="lectura-cierre"></div>
    <div id="frase-cierre-contenedor"></div>

    ${hayAjustesInforme() ? `
    <div class="spacer-md"></div>
    <div class="ajustes-informe-box">
      <div class="ajustes-title">Ajustes agregados por ti</div>
      <div class="ajustes-text">Tus correcciones manuales, especialmente períodos o épocas agregadas en la ruta, quedarán guardadas como datos tuyos y se incluirán en el próximo prompt de IA para regenerar la lectura.</div>
      <button class="btn btn-ghost" id="btn-regenerar-ajustes" style="margin-top:10px;">Generar nueva lectura con estos ajustes</button>
    </div>
    ` : ''}

    <div class="spacer-md"></div>
    <div class="divider"></div>
    <p class="muted" style="line-height:1.6;">${esc(inf.nota_epistemica || 'Recuerda: esto es un espejo simbólico para reflexionar, no una verdad verificable ni una guía médica o clínica. Las conexiones que aparecen entre tus sueños, intuiciones y posibles etapas pasadas son lecturas simbólicas de probabilidad, no hechos históricos comprobados — especialmente cuando tocan épocas, lugares o eventos concretos.')}</p>
    </div>
  `;

  renderMigas(s.querySelector('#migas'));
  if(inf.retrato_literario){
    const contRetrato = s.querySelector('#retrato-literario');
    contRetrato.innerHTML = `<p class="retrato-literario-texto">${esc(inf.retrato_literario)}</p>`;
  }
  renderParrafos(s.querySelector('#lectura-general'), inf.lectura_general);
  renderResumenEjecutivo(s.querySelector('#resumen-exec'), inf, cur.tirada);
  if(resumenEstaciones) renderResumenEstaciones(s.querySelector('#resumen-estaciones'), resumenEstaciones);
  renderRutaDiagrama(s.querySelector('#mapa-nodos'), cur.alias, inf.etapas);
  if(inf.hilo_conductor) renderParrafos(s.querySelector('#hilo-conductor'), inf.hilo_conductor, { italic:true, dim:true });
  if(hayRetornos){
    try{
      renderMapaRetornos(s.querySelector('#mapa-retornos-unificado'), inf);
    }catch(e){
      console.error('Error en mapa de retornos', e);
      const cont = s.querySelector('#mapa-retornos-unificado');
      if(cont) cont.innerHTML = `<p class="muted" style="color:var(--ember);">No pudimos construir el mapa de retornos con estos datos (detalle técnico: ${esc(e.message||'')}). El resto del informe no se ve afectado.</p>`;
    }
  }
  if(hayBalance) renderBalanceJAC(s.querySelector('#balance-jac'), inf.balance_justicia_amor_caridad, inf.cierre_del_balance);
  renderParrafos(s.querySelector('#lectura-cierre'), inf.cierre, { serif:true, italic:true, dim:true });
  if(inf.frase_de_cierre){
    s.querySelector('#frase-cierre-contenedor').innerHTML = `<p class="frase-cierre-app">${esc(inf.frase_de_cierre)}</p>`;
  }

  // Acciones centralizadas — un solo lugar de verdad, reutilizado por la barra de escritorio,
  // los tres controles de móvil y el cajón "Más"/"Exportar".
  const accionCronica = ()=>{
    if(!estadoGeneracion.hasCronica || cronicaNecesitaActualizar) go('cronica-prompt');
    else go('cronica');
  };
  const accionNuevaLectura = ()=> go('tirada');
  const accionInformeHtml = ()=> downloadBlob(buildInformeEjecutivoHTML(), 'text/html;charset=utf-8', `informe-ejecutivo-${slugify(cur.alias)}-${dateSlug()}.html`);
  const accionInformeWord = ()=> downloadBlob(buildInformeEjecutivoWordCompatible(), 'application/msword;charset=utf-8', `informe-ejecutivo-${slugify(cur.alias)}-${dateSlug()}.doc`);
  const accionGraficos = ()=> go('impresos-graficos');
  const accionExportarTxt = ()=> downloadText(buildLecturaExportText(), `lectura-${slugify(cur.alias)}-${dateSlug()}.txt`);
  const accionExportarJson = ()=> downloadJSON(buildCaseExport(), `bitacora-${slugify(cur.alias)}-${dateSlug()}.json`);
  const accionExportarHtmlPagina = ()=> downloadBlob(buildLecturaExportHTML(), 'text/html;charset=utf-8', `lectura-${slugify(cur.alias)}-${dateSlug()}.html`);

  const accionGuardarBitacora = async ()=>{
    const entry = {
      id: cur._editingEntryId || ('e' + Date.now()),
      alias: cur.alias,
      fecha: new Date().toISOString(),
      moduloA: cur.moduloA,
      moduloB: cur.moduloB,
      moduloC: cur.moduloC,
      moduloD: cur.moduloD,
      moduloE: cur.moduloE,
      tirada: cur.tirada,
      informe: deepCleanText(cur.informe),
      cronica: cur.cronica || null,
      generationMeta: ensureGenerationMeta(cur),
      ajustesInforme: deepCleanText(cur.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] }),
    };
    const ok = await saveEntry(entry);
    if(ok){
      cur._editingEntryId = entry.id;
      clearSessionDraft();
      go('guardado-ok');
    }else{
      go('guardado-error');
    }
  };
  const accionSalirSinGuardar = ()=>{
    resetSession();
    go('home');
  };

  // barra contextual de tablet y escritorio
  s.querySelector('#tb-guardar').onclick = accionGuardarBitacora;
  s.querySelector('#tb-cronica').onclick = accionCronica;
  s.querySelector('#tb-nueva-lectura').onclick = accionNuevaLectura;
  s.querySelector('#tb-informe-html').onclick = accionInformeHtml;
  s.querySelector('#tb-informe-word').onclick = accionInformeWord;
  s.querySelector('#tb-graficos').onclick = accionGraficos;
  s.querySelector('#tb-exportar-txt').onclick = accionExportarTxt;
  s.querySelector('#tb-exportar-json').onclick = accionExportarJson;
  s.querySelector('#tb-exportar-html-pagina').onclick = accionExportarHtmlPagina;
  s.querySelector('#tb-salir-sin-guardar').onclick = accionSalirSinGuardar;
  const btnVersionesToolbar = s.querySelector('#tb-versiones');
  if(btnVersionesToolbar) btnVersionesToolbar.onclick = ()=> go('versiones-bitacora', { entryId:cur._editingEntryId });

  // controles de móvil + cajón inferior
  const drawer = s.querySelector('#tb-drawer');
  const drawerOverlay = s.querySelector('#tb-drawer-overlay');
  const drawerContenido = s.querySelector('#tb-drawer-contenido');
  function abrirDrawer(botones, titulo='Opciones'){
    drawerContenido.innerHTML = `<div class="tb-drawer-title">${esc(titulo)}</div>` + botones.map((b,i)=>`<button class="tb-drawer-action" id="tb-drawer-op-${i}" type="button"><strong>${esc(b.label)}</strong>${b.sub ? `<small>${esc(b.sub)}</small>` : ''}</button>`).join('');
    botones.forEach((b,i)=>{ drawerContenido.querySelector(`#tb-drawer-op-${i}`).onclick = ()=>{ cerrarDrawer(); b.accion(); }; });
    drawer.classList.add('abierto');
    drawerOverlay.classList.add('visible');
  }
  function cerrarDrawer(){
    drawer.classList.remove('abierto');
    drawerOverlay.classList.remove('visible');
  }
  s.querySelector('#tbm-guardar').onclick = accionGuardarBitacora;
  s.querySelector('#tbm-cronica').onclick = accionCronica;
  s.querySelector('#tbm-nueva-lectura').onclick = accionNuevaLectura;
  s.querySelector('#tbm-exportar').onclick = ()=> abrirDrawer([
    { label:'Informe global HTML', sub:'Lectura completa con su estructura visual.', accion: accionExportarHtmlPagina },
    { label:'Informe ejecutivo HTML', sub:'Versión resumida y navegable.', accion: accionInformeHtml },
    { label:'Documento para Word', sub:'Versión editable compatible con Word.', accion: accionInformeWord },
    { label:'Lectura TXT', sub:'Texto sencillo, sin diseño ni gráficos.', accion: accionExportarTxt },
    { label:'Caso JSON', sub:'Respaldo estructurado para volver a importar.', accion: accionExportarJson },
  ], 'Exportar y respaldar');
  const masMovil = [
    { label:'Mapas, tarjetas y collage', sub:'Abre todas las salidas visuales.', accion: accionGraficos },
  ];
  if(cur._editingEntryId) masMovil.push({ label:'Versiones internas', sub:'Consulta las versiones guardadas de esta bitácora.', accion: ()=> go('versiones-bitacora', { entryId:cur._editingEntryId }) });
  masMovil.push({ label:'No guardar y volver al inicio', sub:'Descarta esta sesión actual.', accion: accionSalirSinGuardar });
  s.querySelector('#tbm-mas').onclick = ()=> abrirDrawer(masMovil, 'Más acciones');
  s.querySelector('#tb-drawer-cerrar').onclick = cerrarDrawer;
  drawerOverlay.onclick = cerrarDrawer;

  const btnRegenerarAjustes = s.querySelector('#btn-regenerar-ajustes');
  if(btnRegenerarAjustes){
    btnRegenerarAjustes.onclick = ()=> go('tirada');
  }

  navFooter(s, [
    { label: cur._editingEntryId ? 'Actualizar esta bitácora' : 'Guardar en mi bitácora', onClick: accionGuardarBitacora },
    { label:'No guardar, volver al inicio', variant:'btn-ghost', onClick: accionSalirSinGuardar },
  ]);
});

/* ---------- helpers de render ---------- */

function renderParrafos(container, texto, opts={}){
  container.innerHTML = '';
  const parrafos = (texto||'').split(/\n+/).filter(p=>p.trim());
  parrafos.forEach(p=>{
    const el = document.createElement('p');
    el.className = 'body-text';
    el.style.fontFamily = 'var(--serif)';
    el.style.fontSize = opts.italic ? '15px' : '15.5px';
    el.style.lineHeight = '1.7';
    el.style.marginTop = '10px';
    if(opts.italic) el.style.fontStyle = 'italic';
    if(opts.dim) el.style.color = 'var(--text-dim)';
    el.textContent = p.trim();
    container.appendChild(el);
  });
}


function ordinalEstacion(n){
  const ord = ['primera','segunda','tercera','cuarta','quinta','sexta','séptima','octava','novena','décima'];
  return ord[(Number(n)||1)-1] || ('número ' + n);
}

function normalizarResumenEstaciones(raw, inf={}, alias=''){
  if(!raw) return null;

  if(Array.isArray(raw)){
    const parrafos = raw.map(x => typeof x === 'string' ? cleanVisibleText(x) : cleanVisibleText(x && x.parrafo)).filter(Boolean);
    if(!parrafos.length) return null;
    return { titulo:'Resumen narrativo por estaciones', apertura:parrafos[0] || '', estaciones:parrafos.slice(1,-1).map((p,i)=>({numero:i+1, parrafo:p})), cierre_red_relacional:parrafos.length>1 ? parrafos[parrafos.length-1] : '' };
  }

  if(typeof raw === 'string'){
    const parrafos = raw.split(/\n+/).map(cleanVisibleText).filter(Boolean);
    if(!parrafos.length) return null;
    return { titulo:'Resumen narrativo por estaciones', apertura:parrafos[0], estaciones:parrafos.slice(1,-1).map((p,i)=>({numero:i+1, parrafo:p})), cierre_red_relacional:parrafos.length>1 ? parrafos[parrafos.length-1] : '' };
  }

  if(typeof raw === 'object'){
    const estaciones = Array.isArray(raw.estaciones) ? raw.estaciones.map((e,i)=>({
      numero: e.numero || e.numero_etapa || (i+1),
      titulo: cleanVisibleText(e.titulo || ''),
      periodo: cleanVisibleText(e.periodo || e.periodo_simbolico || ''),
      tipo: cleanVisibleText(e.tipo || ''),
      rol: cleanVisibleText(e.rol || e.rol_encarnado || ''),
      muerte_o_transito: cleanVisibleText(e.muerte_o_transito || ''),
      parrafo: cleanVisibleText(e.parrafo || e.texto || '')
    })).filter(e=>e.parrafo) : [];
    const apertura = cleanVisibleText(raw.apertura || raw.resumen_general || '');
    const cierre = cleanVisibleText(raw.cierre_red_relacional || raw.cierre || '');
    if(!apertura && !estaciones.length && !cierre) return null;
    return {
      titulo: cleanVisibleText(raw.titulo || 'Resumen narrativo por estaciones'),
      apertura,
      estaciones,
      cierre_red_relacional: cierre
    };
  }
  return null;
}

function detectarMuerteOTransito(et){
  const textos = [et.evento_critico, et.huella_actual, et.momento_simbolico, et.senal_origen, et.leccion].filter(Boolean).join(' ').toLowerCase();
  const claves = [
    'muere','murió','muerte','agon','caída','cae','herida','bala','combate','tránsito','extraviada','extraviado','ánimas','almas','procesión','rescate'
  ];
  if(claves.some(k=>textos.includes(k))){
    if(textos.includes('cae') || textos.includes('caída')) return 'Aparece una caída o muerte simbólicamente clara.';
    if(textos.includes('bala') || textos.includes('herida') || textos.includes('combate')) return 'Aparece una herida de combate o caída corporal.';
    if(textos.includes('tránsito') || textos.includes('ánimas') || textos.includes('almas') || textos.includes('procesión') || textos.includes('extravi')) return 'Aparece como tránsito espiritual, extravío o rescate.';
    if(textos.includes('muerte') || textos.includes('muere') || textos.includes('murió') || textos.includes('agon')) return 'Aparece muerte, agonía o tránsito corporal.';
  }
  return 'No aparece una muerte concreta.';
}

function construirResumenEstacionesFallback(inf={}, alias=''){
  const etapas = Array.isArray(inf.etapas) ? inf.etapas : [];
  if(!etapas.length) return null;
  const roles = [...new Set(etapas.map(e=>cleanVisibleText(e.rol_encarnado)).filter(Boolean))].slice(0,8);
  const generos = [...new Set(etapas.map(e=>cleanVisibleText(e.genero_percibido)).filter(Boolean))].slice(0,5);
  const muertes = etapas.map(detectarMuerteOTransito).filter(t=>!/^No aparece/.test(t));
  const apertura = `De acuerdo con la cartografía simbólica recibida, ${alias || 'la persona'} aparece distribuido/a en ${etapas.length} estaciones narrativas (reencarnaciones simbólicas), algunas con período histórico definido y otras como escenas arquetípicas sin fecha comprobable. En estas estaciones aparece como ${roles.length ? roles.join(', ') : 'figuras o roles simbólicos diversos'}${generos.length ? ', con géneros o edades percibidas cuando el material lo permite' : ''}. ${muertes.length ? 'No todas las estaciones registran muerte; cuando aparece, se manifiesta como caída, herida, agonía corporal o tránsito espiritual.' : 'No todas las estaciones registran muerte o tránsito explícito.'} La red general muestra una vida actual atravesada por los núcleos de memoria, vínculo, cuerpo y aprendizaje.`;

  const estaciones = etapas.map((et,i)=>{
    const num = et.numero_etapa || (i+1);
    const ord = ordinalEstacion(num);
    const periodo = getPeriodoTexto(et) || 'sin fecha comprobable';
    const rol = cleanVisibleText(et.rol_encarnado || 'un rol simbólico no completamente definido');
    const espacio = cleanVisibleText(et.espacio_simbolico || et.contexto_socioambiental || et.momento_simbolico || 'una escena simbólica sin espacio completamente delimitado');
    const muerte = detectarMuerteOTransito(et);
    const huella = cleanVisibleText(getHuellaActual(et) || '');
    const aprendizaje = cleanVisibleText(getAprendizaje(et) || et.leccion || '');
    const reingresos = Array.isArray(et.reingresos_relacionales) ? et.reingresos_relacionales : [];
    const personas = reingresos.map(r=>cleanVisibleText(r.persona_actual || r.rol_actual)).filter(Boolean).slice(0,4);
    const red = personas.length ? `En la red actual resuenan ${personas.join(', ')}, no como identidades literales, sino como posibles funciones relacionales.` : 'La red relacional no muestra una persona actual específica como reingreso directo, o no hay datos suficientes para afirmarlo.';
    const parrafo = `En la ${ord} estación narrativa (reencarnación), situada simbólicamente en ${periodo}, ${alias || 'la persona'} aparece como ${rol}. La escena se organiza en ${espacio}. ${muerte} ${huella ? 'La huella actual se relaciona con ' + huella + '. ' : ''}${red} ${aprendizaje ? 'La enseñanza principal es ' + aprendizaje + '.' : ''}`;
    return {
      numero:num,
      titulo: cleanVisibleText(et.titulo || ('Etapa ' + num)),
      periodo,
      tipo: getPeriodoTexto(et) ? 'reencarnación simbólica con período o ancla narrativa' : 'reencarnación arquetípica o escena sin fecha comprobable',
      rol,
      muerte_o_transito:muerte,
      parrafo
    };
  });

  const cierre = inf.hilo_conductor
    ? cleanVisibleText(inf.hilo_conductor)
    : `En conjunto, la red de relaciones muestra que las figuras actuales y pasadas no deben entenderse como identidades literales, sino como resonancias que reactivan aprendizajes. Unas activan memoria; otras, cuidado. Unas despiertan reparación; otras enseñan límite. La ruta completa parece orientar hacia una presencia más encarnada, menos cargada de culpa y más capaz de sostener vínculos sin sustituir el camino de nadie.`;

  return { titulo:'Resumen narrativo por estaciones', apertura, estaciones, cierre_red_relacional:cierre };
}

function buildResumenEstacionesView(inf={}, alias=''){
  return normalizarResumenEstaciones(inf && inf.resumen_estaciones_narrativas, inf, alias) || construirResumenEstacionesFallback(inf, alias);
}

function resumenEstacionesParrafos(resumen){
  if(!resumen) return [];
  const out = [];
  if(resumen.apertura) out.push(resumen.apertura);
  (resumen.estaciones || []).forEach(e=>{ if(e.parrafo) out.push(e.parrafo); });
  if(resumen.cierre_red_relacional) out.push(resumen.cierre_red_relacional);
  return out.filter(Boolean);
}

function renderResumenEstaciones(container, resumen){
  if(!container || !resumen) return;
  const estaciones = resumen.estaciones || [];
  const parrafos = [];
  if(resumen.apertura){
    parrafos.push({ tipo:'apertura', texto:resumen.apertura });
  }
  estaciones.forEach((e,idx)=>{
    if(e.parrafo){
      parrafos.push({
        tipo:'estacion',
        numero:e.numero || (idx+1),
        titulo:e.titulo || '',
        periodo:e.periodo || '',
        texto:e.parrafo,
        meta:[e.tipo, e.rol, e.muerte_o_transito].filter(Boolean)
      });
    }
  });
  if(resumen.cierre_red_relacional){
    parrafos.push({ tipo:'cierre', texto:resumen.cierre_red_relacional });
  }

  container.innerHTML = `
    <div class="resumen-estaciones-textual">
      ${parrafos.map(p=>{
        if(p.tipo === 'estacion'){
          return `<div class="resumen-estacion-parrafo">
            <div class="resumen-estacion-rotulo">Estación ${esc(p.numero)}${p.periodo ? ' · ' + esc(p.periodo) : ''}</div>
            ${p.titulo ? `<div class="resumen-estacion-subtitulo">${esc(p.titulo)}</div>` : ''}
            <p>${esc(p.texto)}</p>
            ${p.meta && p.meta.length ? `<div class="resumen-estacion-meta-lineal">${p.meta.map(m=>`<span>${esc(m)}</span>`).join('')}</div>` : ''}
          </div>`;
        }
        return `<p class="resumen-estaciones-${p.tipo}">${esc(p.texto)}</p>`;
      }).join('')}
    </div>
  `;
}


function truncarPalabra(texto, maximo){
  if(!texto || texto.length <= maximo) return texto || '';
  const corte = texto.slice(0, maximo);
  const ultimoEspacio = corte.lastIndexOf(' ');
  const seguro = ultimoEspacio > maximo * 0.4 ? corte.slice(0, ultimoEspacio) : corte;
  return seguro.trim() + '…';
}

function getPeriodoTexto(et){
  if(!et) return '';
  return cleanVisibleText(et.periodo_simbolico || et.periodo_amplificado || et.periodo_reportado || et.momento_simbolico || '');
}

function getPeriodoClase(et){
  if(!et) return 'sin-ancla';
  return (et.periodo_simbolico || et.periodo_amplificado || et.periodo_reportado) ? 'con-ancla' : 'sin-ancla';
}

function buildMapaLabel(et){
  if(!et) return 'Etapa';
  const periodo = getPeriodoTexto(et);
  const titulo = cleanVisibleText(et.titulo || 'Etapa');
  const tituloCorto = titulo
    .replace(/^El |^La |^Los |^Las /i, '')
    .split(/\s+/)
    .slice(0, 3)
    .join(' ');
  const p = periodo.toLowerCase();
  let periodoCorto = '';
  if(/\b\d{3,4}\s*[-–]\s*\d{2,4}\b/.test(periodo)) periodoCorto = periodo.match(/\b\d{3,4}\s*[-–]\s*\d{2,4}\b/)[0];
  else if(/siglo|siglos|s\.\s*/i.test(periodo)){
    const m = periodo.match(/(?:siglos?|s\.)\s*[^,.;·]{1,18}(?:a\.\s*c\.|d\.\s*c\.|a\.c\.|d\.c\.)?/i);
    periodoCorto = m ? m[0].replace(/\s+/g,' ').trim() : '';
  }
  else if(p.includes('precolomb')) periodoCorto = 'Antes de 1492';
  else if(/\besenio/i.test(p)) periodoCorto = 'Esenios';
  else if(p.includes('boyac') || /\bindependencia\b.*(colombi|criol|espa[ñn])|(colombi|criol|espa[ñn]).*\bindependencia\b/i.test(p) || p.includes('crioll')) periodoCorto = '1810-1819';
  else if(p.includes('mediados') && (p.includes('1800') || p.includes('xix'))) periodoCorto = 'c. 1840-1860';
  else if(p.includes('vida actual') || p.includes('biográfico')) periodoCorto = 'Vida actual';
  else if(p.includes('sin ancla')) periodoCorto = 'Sin ancla';
  else if(periodo) periodoCorto = periodo.split(/[·,.;]/)[0].replace(/^podría\s+/i,'').replace(/^situarse\s+/i,'').slice(0,20).trim();

  if(periodoCorto && tituloCorto) return truncarPalabra(`${periodoCorto} · ${tituloCorto}`, 46);
  if(periodoCorto) return truncarPalabra(periodoCorto, 46);
  if(et.espacio_simbolico) return truncarPalabra(cleanVisibleText(et.espacio_simbolico), 46);
  if(et.rol_encarnado) return truncarPalabra(cleanVisibleText(et.rol_encarnado), 46);
  return tituloCorto || 'Etapa';
}

function getRelacionPrincipal(et){
  if(et.relacion_principal) return et.relacion_principal;
  if(et.vinculo && et.vinculo.nombre_actual) return `${et.vinculo.nombre_actual} · ${et.vinculo.tipo_relacion || ''}`;
  return 'Sin vínculo identificado';
}

function getHuellaActual(et){
  return et.huella_actual || et.eco_actual || '';
}

function getAprendizaje(et){
  return et.aprendizaje_pendiente || et.leccion || '';
}

function normalizarConexionRetorno(raw, etapaRel=null){
  const c = raw || {};
  const etapaNum = c.etapa_relacionada || c.etapa || c.numero_etapa || (etapaRel && etapaRel.numero_etapa) || null;
  const figura = c.figura_onirica || c.figura_anterior || c.figura_simbolica || c.presencia || c.nombre_anterior || (etapaRel && etapaRel.vinculo && etapaRel.vinculo.figura_simbolica) || 'Figura simbólica';
  const persona = c.persona_real || c.persona_actual || c.nombre_actual || c.persona || (etapaRel && etapaRel.vinculo && etapaRel.vinculo.nombre_actual) || 'Persona actual no especificada';
  const rolAnterior = c.rol_anterior || c.rol_pasado || c.rol_en_etapa || c.tipo_relacion_anterior || c.tipo_relacion || (etapaRel && etapaRel.relacion_principal) || '';
  const rolActual = c.rol_actual || c.rol_en_vida_actual || c.tipo_relacion_actual || (etapaRel && etapaRel.vinculo && etapaRel.vinculo.tipo_relacion) || '';
  return {
    ...c,
    etapa_relacionada: etapaNum,
    figura_onirica: figura,
    persona_real: persona,
    rol_anterior: rolAnterior,
    rol_actual: rolActual,
    funcion_espiritual: c.funcion_espiritual || c.funcion || c.funcion_presuntoria || c.aprendizaje_relacional || '',
    ciclo_que_abre: c.ciclo_que_abre || c.ciclo_abre || '',
    ciclo_que_cierra: c.ciclo_que_cierra || c.ciclo_cierra || '',
    nivel_confianza: c.nivel_confianza || c.confianza || '',
    evidencia: c.evidencia || c.evidencia_textual || c.senal || '',
    resonancia: c.resonancia || c.descripcion || c.sentido || ((etapaRel && etapaRel.vinculo && etapaRel.vinculo.tipo_relacion) ? `Reconocida simbólicamente como ${etapaRel.vinculo.figura_simbolica || 'una figura de esa etapa'}, en un vínculo de tipo "${etapaRel.vinculo.tipo_relacion}".` : '')
  };
}

function getConexionesRetorno(inf){
  const out = [];
  try{
    const etapasPorNum = {};
    const etapasArr = Array.isArray(inf && inf.etapas) ? inf.etapas : [];
    etapasArr.forEach(et => { if(et && et.numero_etapa) etapasPorNum[et.numero_etapa] = et; });

    const constelacionArr = Array.isArray(inf && inf.constelacion) ? inf.constelacion : [];
    constelacionArr.forEach(c=>{
      const et = c && c.etapa_relacionada ? etapasPorNum[c.etapa_relacionada] : null;
      out.push(normalizarConexionRetorno(c, et));
    });

    etapasArr.forEach(et=>{
      const grupos = [];
      if(Array.isArray(et && et.personas_reingreso)) grupos.push(...et.personas_reingreso);
      if(Array.isArray(et && et.reingresos_relacionales)) grupos.push(...et.reingresos_relacionales);
      if(et && et.vinculo && et.vinculo.nombre_actual){
        grupos.push({
          figura_anterior: et.vinculo.figura_simbolica,
          persona_actual: et.vinculo.nombre_actual,
          rol_actual: et.vinculo.tipo_relacion,
          resonancia: et.vinculo.resonancia || et.vinculo.sentido || '',
          etapa_relacionada: et.numero_etapa
        });
      }
      grupos.forEach(c=> out.push(normalizarConexionRetorno(c, et)));
    });
  }catch(e){
    console.error('getConexionesRetorno: datos inesperados, se devuelve lista vacía', e);
    return [];
  }

  // Deduplicar por (etapa + persona), no por el texto exacto — la misma conexión puede
  // registrarse con redacciones distintas en constelacion, vinculo y reingresos_relacionales.
  // De cada grupo duplicado se conserva la versión con más información real, no la primera que aparece.
  const grupos = {};
  const ordenGrupos = [];
  out.forEach(c=>{
    if(!c.figura_onirica && !c.persona_real) return;
    const key = [c.etapa_relacionada || '', (c.persona_real || '').trim().toLowerCase()].join('||');
    const puntaje = [c.figura_onirica, c.resonancia, c.funcion_espiritual, c.evidencia].filter(Boolean).join(' ').length;
    if(!grupos[key] || puntaje > grupos[key]._puntaje){
      grupos[key] = { ...c, _puntaje: puntaje };
      if(!ordenGrupos.includes(key)) ordenGrupos.push(key);
    }else if(!ordenGrupos.includes(key)){
      ordenGrupos.push(key);
    }
  });
  return ordenGrupos.map(key=>{ const { _puntaje, ...limpio } = grupos[key]; return limpio; });
}


function historiaCampo(label, value, opts={}){
  const txt = cleanVisibleText(value || '');
  if(!txt) return '';
  const full = opts.full ? ' full' : '';
  const subtle = opts.subtle ? ' subtle' : '';
  return `
    <div class="historia-card${full}${subtle}">
      <div class="historia-label">${esc(label)}</div>
      <div class="historia-texto">${esc(txt)}</div>
    </div>`;
}

function renderHistoriaAmpliadaConexion(c, etapaRel, rolLinea){
  const ciclo = [c.ciclo_que_abre ? 'Abre: ' + c.ciclo_que_abre : '', c.ciclo_que_cierra ? 'Cierra: ' + c.ciclo_que_cierra : ''].filter(Boolean).join(' · ');
  const confianza = [c.nivel_confianza ? 'Confianza: ' + c.nivel_confianza : '', c.evidencia || ''].filter(Boolean).join(' · ');
  return `
    <div class="historia-ampliada-inner">
      <div class="historia-ampliada-title">Historia ampliada de esta conexión</div>
      <div class="historia-ampliada-grid">
        ${historiaCampo('Rol anterior / rol actual', rolLinea)}
        ${historiaCampo('Función posible del reingreso', c.funcion_espiritual)}
        ${historiaCampo('Por qué se conectan', c.resonancia, {full:true})}
        ${historiaCampo('Señal de origen de esta etapa', etapaRel && etapaRel.senal_origen, {full:true, subtle:true})}
        ${historiaCampo('Evento crítico de esta etapa', etapaRel && etapaRel.evento_critico, {full:true})}
        ${historiaCampo('Ciclo que abre / cierra', ciclo, {full:true})}
        ${historiaCampo('Confianza y evidencia', confianza, {full:true, subtle:true})}
      </div>
    </div>`;
}

function agruparConexionesPorPersona(conexiones){
  const grupos = [];
  const mapa = {};
  conexiones.forEach(c=>{
    const key = (c.persona_real || 'Persona actual no especificada').trim();
    if(!mapa[key]){
      mapa[key] = { persona:key, conexiones:[] };
      grupos.push(mapa[key]);
    }
    mapa[key].conexiones.push(c);
  });
  return grupos;
}

function getPersonasConEstrellas(inf){
  const arcosPorPersona = {};
  (inf.arcos_relacionales || []).forEach(a=>{
    if(a && a.persona) arcosPorPersona[a.persona.trim().toLowerCase()] = a;
  });

  const NOMBRES_LEY = { justicia:'Justicia', amor:'Amor', caridad:'Caridad' };
  const leyesPorPersona = {};
  if(inf.balance_justicia_amor_caridad){
    ['justicia','amor','caridad'].forEach(clave=>{
      const ley = inf.balance_justicia_amor_caridad[clave];
      (ley && Array.isArray(ley.personas_involucradas) ? ley.personas_involucradas : []).forEach(nombre=>{
        const key = (nombre||'').trim().toLowerCase();
        if(!key) return;
        if(!leyesPorPersona[key]) leyesPorPersona[key] = [];
        if(!leyesPorPersona[key].includes(NOMBRES_LEY[clave])) leyesPorPersona[key].push(NOMBRES_LEY[clave]);
      });
    });
  }

  const etapasPorNumero = {};
  (inf.etapas || []).forEach(et=>{ if(et.numero_etapa) etapasPorNumero[et.numero_etapa] = et; });

  const conexionesAgrupadas = agruparConexionesPorPersona(getConexionesRetorno(inf));
  conexionesAgrupadas.sort((a, b)=>{
    const numA = (a.conexiones||[]).length, numB = (b.conexiones||[]).length;
    if(numB !== numA) return numB - numA;
    const masAntiguaA = Math.min(...(a.conexiones||[]).map(c=>c.etapa_relacionada || 999));
    const masAntiguaB = Math.min(...(b.conexiones||[]).map(c=>c.etapa_relacionada || 999));
    return masAntiguaA - masAntiguaB;
  });

  return conexionesAgrupadas.map(g=>{
    const key = g.persona.trim().toLowerCase();
    const arco = arcosPorPersona[key] || null;
    const etapas = (g.conexiones||[]).map(c=>c.etapa_relacionada).filter(Boolean);
    const mejorConexion = (g.conexiones||[]).slice().sort((a,b)=>{
      const rango = { alto:3, medio:2, bajo:1 };
      return (rango[b.nivel_confianza]||0) - (rango[a.nivel_confianza]||0);
    })[0] || {};
    const etapasDetalle = (g.conexiones||[])
      .filter(c=>c.etapa_relacionada)
      .map(c=>{
        const et = etapasPorNumero[c.etapa_relacionada];
        return {
          numero: c.etapa_relacionada,
          periodo: et ? shortVisual(getPeriodoTexto(et) || 'sin fecha', 40) : null,
          genero: et ? shortVisual(et.genero_percibido || '', 20) || null : null,
          rol: shortVisual(c.rol_anterior || (et && et.rol_encarnado) || '', 40) || null,
          aprendizajeCorto: et ? shortVisual(et.leccion || et.aprendizaje_pendiente || '', 35) : null
        };
      })
      // una entrada por número de etapa, evitando duplicar la misma etapa dos veces
      .filter((v,i,arr)=> arr.findIndex(x=>x.numero===v.numero) === i)
      .sort((a,b)=>a.numero-b.numero);
    return {
      persona: g.persona,
      estrellas: Math.min(etapas.length, 3),
      etapas: [...new Set(etapas)].sort((a,b)=>a-b),
      etapasDetalle,
      leyes: leyesPorPersona[key] || [],
      nivel: arco ? 'rico' : 'ligero',
      // nivel "rico": viene de un arco relacional longitudinal ya construido
      rolPasado: arco ? arco.patron_transversal : null,
      simboloSugerido: arco ? (arco.simbolo_sugerido || null) : null,
      fraseBrevePatron: arco ? (arco.frase_breve_patron || null) : null,
      fraseBreveHoy: arco ? (arco.frase_breve_hoy || null) : null,
      hoy: arco ? arco.lo_que_ya_se_supero : null,
      enTransito: arco ? arco.lo_que_sigue_en_transito : null,
      // nivel "ligero": viene de la conexión individual de mayor confianza en constelación
      resonancia: !arco ? mejorConexion.resonancia : null,
      funcionEspiritual: !arco ? mejorConexion.funcion_espiritual : null,
      cicloAbre: !arco ? mejorConexion.ciclo_que_abre : null,
      cicloCierra: !arco ? mejorConexion.ciclo_que_cierra : null
    };
  });
}

function renderMapaRetornos(container, inf){
  const conexiones = getConexionesRetorno(inf);
  const etapasPorNum = {};
  (inf.etapas||[]).forEach(et => { etapasPorNum[et.numero_etapa] = et; });
  const grupos = agruparConexionesPorPersona(conexiones);
  const totalFunciones = conexiones.filter(c=>c.funcion_espiritual).length;
  const totalEtapasEnlazadas = new Set(conexiones.map(c=>c.etapa_relacionada).filter(Boolean)).size;

  const arcosPorPersona = {};
  (inf.arcos_relacionales || []).forEach(a=>{
    if(a && a.persona) arcosPorPersona[a.persona.trim().toLowerCase()] = a;
  });

  container.innerHTML = `
    <div class="red-resumen">
      <div class="red-stat"><span>${conexiones.length}</span><small>conexiones</small></div>
      <div class="red-stat"><span>${grupos.length}</span><small>personas hoy</small></div>
      <div class="red-stat"><span>${totalEtapasEnlazadas}</span><small>etapas enlazadas</small></div>
      <div class="red-stat"><span>${totalFunciones}</span><small>funciones</small></div>
    </div>
    <p class="grafo-leyenda">Cada etapa de tu ruta aparece con sus propios datos y, cuando existen, las personas reales que podrían resonar con ella. La lectura se mantiene presuntoria: muestra funciones y vínculos posibles, no identidades cerradas.</p>

    ${grupos.some(g=>arcosPorPersona[g.persona.trim().toLowerCase()]) ? `
    <div class="eyebrow" style="margin-top:10px;">Vínculos con trayectoria propia</div>
    <div id="resumen-arcos-personas"></div>
    <div class="spacer-sm"></div>
    ` : ''}

    <div class="eyebrow" style="margin-top:10px;">Ruta completa, etapa por etapa</div>
    <div id="etapas-con-retornos"></div>
  `;

  // resumen de personas con arco relacional propio (patrón a través del tiempo) — una sola vez por persona,
  // no repetido dentro de cada etapa donde aparece.
  const contArcos = container.querySelector('#resumen-arcos-personas');
  if(contArcos){
    grupos.forEach(grupo=>{
      const arco = arcosPorPersona[grupo.persona.trim().toLowerCase()];
      if(!arco || (!arco.patron_transversal && !arco.lo_que_ya_se_supero)) return;
      const box = document.createElement('div');
      box.className = 'red-arco-relacional';
      box.innerHTML = `
        <div class="red-arco-titulo">${esc(grupo.persona)} — lo que este vínculo atraviesa a través del tiempo</div>
        ${arco.patron_transversal ? `<p>${esc(arco.patron_transversal)}</p>` : ''}
        ${arco.lo_que_ya_se_supero ? `<p><strong class="arco-supero">Hoy:</strong> ${esc(arco.lo_que_ya_se_supero)}</p>` : ''}
        ${arco.lo_que_sigue_en_transito ? `<p><strong class="arco-transito">Sigue en tránsito:</strong> ${esc(arco.lo_que_sigue_en_transito)}</p>` : ''}
      `;
      contArcos.appendChild(box);
    });
  }

  // ruta completa por etapa — viñeta compacta por defecto (etapa + quién aparece), todo el detalle
  // completo (campos de la etapa + conexiones con su historia ampliada) detrás de un "ver más" —
  // antes esto se mostraba siempre expandido, lo que hacía la vista larga y difícil de escanear.
  const etEl = container.querySelector('#etapas-con-retornos');
  (inf.etapas||[]).forEach((et,idxEtapa)=>{
    const periodoTexto = getPeriodoTexto(et) || 'Sin ancla temporal';
    const periodoClase = getPeriodoClase(et);
    const conexionesEtapa = conexiones.filter(c=>String(c.etapa_relacionada || '') === String(et.numero_etapa || ''));
    const nombresResumen = conexionesEtapa.map(c=>c.persona_real).filter(Boolean);

    const card = document.createElement('div');
    card.className = 'tabla-card tabla-card-compacta';
    card.innerHTML = `
      <div class="etapa-viñeta-cabecera">
        <div class="etapa-viñeta-titulo">Etapa ${esc(et.numero_etapa || '')} · ${esc(et.titulo || '')}</div>
        <span class="grafo-periodo-tag ${periodoClase}">${esc(periodoTexto)}</span>
      </div>
      ${nombresResumen.length ? `<div class="etapa-personas-resumen">↳ ${nombresResumen.map(esc).join(', ')}</div>` : ''}
      <button type="button" class="btn-historia-ampliada btn-ver-mas-etapa" data-idx="${idxEtapa}">Ver detalle completo ⌄</button>
      <div class="etapa-detalle-completo" id="etapa-detalle-${idxEtapa}" style="display:none;">
        <div class="tabla-campo"><span class="tabla-campo-label">Rol / espacio</span><span class="tabla-campo-valor">${esc([et.rol_encarnado, et.espacio_simbolico].filter(Boolean).join(' · ') || '—')}</span></div>
        <div class="tabla-campo"><span class="tabla-campo-label">Relación principal</span><span class="tabla-campo-valor">${esc(getRelacionPrincipal(et))}</span></div>
        <div class="tabla-campo"><span class="tabla-campo-label">Evento crítico</span><span class="tabla-campo-valor">${esc(et.evento_critico || '—')}</span></div>
        <div class="tabla-campo"><span class="tabla-campo-label">Huella en la vida actual</span><span class="tabla-campo-valor">${esc(getHuellaActual(et))}</span></div>
        <div class="tabla-campo"><span class="tabla-campo-label">Aprendizaje pendiente</span><span class="tabla-campo-valor">${esc(getAprendizaje(et))}</span></div>
        ${conexionesEtapa.length ? `<div class="etapa-conexiones-anidadas" id="conexiones-etapa-${esc(et.numero_etapa)}"></div>` : ''}
      </div>
    `;
    etEl.appendChild(card);

    const btnVerMas = card.querySelector('.btn-ver-mas-etapa');
    const detalleEl = card.querySelector(`#etapa-detalle-${idxEtapa}`);
    btnVerMas.onclick = ()=>{
      const abierto = detalleEl.style.display !== 'none';
      detalleEl.style.display = abierto ? 'none' : 'block';
      btnVerMas.textContent = abierto ? 'Ver detalle completo ⌄' : 'Ocultar detalle ⌃';
    };

    if(conexionesEtapa.length){
      const nidoEl = card.querySelector(`#conexiones-etapa-${et.numero_etapa}`);
      conexionesEtapa.forEach((c,i)=>{
        const rolLinea = [c.rol_anterior || 'rol anterior abierto', c.rol_actual || 'rol actual abierto'].join(' → ');
        const funcionMini = c.funcion_espiritual || c.resonancia || getAprendizaje(et) || '';
        const row = document.createElement('div');
        row.className = 'red-row red-row-anidada';
        row.innerHTML = `
          <div class="red-nodo vida">
            <div class="red-nodo-top">Figura de esa etapa</div>
            <div class="red-nodo-nombre">${esc(c.figura_onirica)}</div>
          </div>
          <div class="red-flecha">
            <span class="red-linea"></span>
            <span class="red-arrow">⇄</span>
            <span class="red-rol">${esc(rolLinea)}</span>
          </div>
          <div class="red-nodo actual">
            <div class="red-nodo-top">Hoy</div>
            <div class="red-nodo-nombre">${esc(c.persona_real)}</div>
            ${c.nivel_confianza ? `<span class="red-confianza">Confianza: ${esc(c.nivel_confianza)}</span>` : ''}
            ${funcionMini ? `<div class="red-funcion-mini">${esc(truncarPalabra(funcionMini, 92))}</div>` : ''}
          </div>
          ${(c.ciclo_que_abre || c.ciclo_que_cierra) ? `<div class="red-ciclo-mini"><small>Ciclo</small> ${esc([c.ciclo_que_abre, c.ciclo_que_cierra].filter(Boolean).join(' / '))}</div>` : ''}
          <button type="button" class="btn-historia-ampliada red-historia-btn" data-idx="${et.numero_etapa}-${i}">Ver historia ampliada ⌄</button>
          <div class="historia-ampliada red-historia" id="historia-red-${et.numero_etapa}-${i}"></div>
        `;
        nidoEl.appendChild(row);

        const btnHist = row.querySelector('.red-historia-btn');
        const panelHist = row.querySelector('.red-historia');
        btnHist.onclick = ()=>{
          const abierto = panelHist.classList.toggle('abierta');
          btnHist.textContent = abierto ? 'Ocultar historia ampliada ⌃' : 'Ver historia ampliada ⌄';
          if(abierto && !panelHist.dataset.cargado){
            panelHist.innerHTML = renderHistoriaAmpliadaConexion(c, et, rolLinea);
            panelHist.dataset.cargado = '1';
          }
        };
      });
    }
  });
}

function renderBalanceJAC(container, balance, cierreBalance){
  if(!container || !balance) return;
  const DEFINICIONES = {
    justicia: 'Dar a cada quien lo que le corresponde, sin exceso ni defecto — asumir responsabilidad por el daño propio sin caer en venganza ni en autocastigo.',
    amor: 'Amar sin poseer, cuidar sin controlar — un vínculo que no depende de retener al otro para sentirse sostenido.',
    caridad: 'Benevolencia hacia quien sufre, sin esperar reciprocidad — servicio que no se agota a sí mismo ni se vuelve carga.',
  };
  const NOMBRES = { justicia:'Justicia', amor:'Amor', caridad:'Caridad' };
  const html = ['justicia','amor','caridad'].map(clave=>{
    const ley = balance[clave];
    if(!ley || (!ley.avance_logrado && !ley.patron_persistente)) return '';
    const personas = Array.isArray(ley.personas_involucradas) ? ley.personas_involucradas.filter(Boolean) : [];
    const guiaBullets = Array.isArray(ley.guia_eternidad) ? ley.guia_eternidad.filter(Boolean) : [];
    return `
      <div class="ley-card">
        <div class="ley-titulo">${NOMBRES[clave]}</div>
        <div class="ley-definicion">${DEFINICIONES[clave]}</div>
        ${ley.prueba_planteada ? `
        <div class="ley-subbox ley-subbox-prueba">
          <div class="ley-subbox-label">Prueba planteada</div>
          <div class="ruta-detalle-texto">${esc(ley.prueba_planteada)}</div>
        </div>` : ''}
        ${ley.avance_logrado ? `
        <div class="ley-subbox ley-subbox-avance">
          <div class="ley-subbox-label">Avance que ya se nota</div>
          <div class="ruta-detalle-texto">${esc(ley.avance_logrado)}</div>
        </div>` : ''}
        ${ley.patron_persistente ? `
        <div class="ley-subbox ley-subbox-abierto">
          <div class="ley-subbox-label">Algo que sigue abierto</div>
          <div class="ruta-detalle-texto">${esc(ley.patron_persistente)}</div>
        </div>` : ''}
        ${personas.length ? `<div class="ley-personas">${personas.map(p=>`<span class="ley-persona-tag">${esc(p)}</span>`).join('')}</div>` : ''}
        ${ley.posibilidad_de_exploracion ? `<div class="ley-invitacion">${esc(ley.posibilidad_de_exploracion)}</div>` : ''}
        ${guiaBullets.length ? `
        <div class="ley-subbox ley-subbox-guia">
          <div class="ley-subbox-label">Guía para la eternidad</div>
          <ul class="ley-guia-lista-viva">${guiaBullets.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>
        </div>` : ''}
      </div>`;
  }).join('');
  container.innerHTML = html;
  if(cierreBalance){
    const cierreEl = document.createElement('div');
    cierreEl.className = 'ley-cierre';
    cierreEl.textContent = cierreBalance;
    container.appendChild(cierreEl);
  }
}

/* ---------- exportación de datos ---------- */

function buildCaseExport(){
  return {
    id: cur._editingEntryId || null,
    alias: cur.alias,
    fecha_exportacion: new Date().toISOString(),
    moduloA: cur.moduloA,
    moduloB: cur.moduloB,
    moduloC: cur.moduloC,
    moduloD: cur.moduloD,
    moduloE: cur.moduloE,
    tirada: cur.tirada,
    informe: deepCleanText(cur.informe),
    cronica: cur.cronica || null,
    generationMeta: ensureGenerationMeta(cur),
    ajustesInforme: deepCleanText(cur.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] }),
  };
}

function textoItems(texto, max=5){
  const raw = cleanVisibleText(texto || '');
  if(!raw) return [];
  return raw
    .split(/(?:\n|;|\.\s+|,\s+(?=[A-ZÁÉÍÓÚÑ]))/)
    .map(x=>cleanVisibleText(x))
    .filter(x=>x && x.length > 8)
    .slice(0,max)
    .map(x=> x.length > 92 ? truncarPalabra(x, 89) : x);
}

function shortVisual(v, n=90){
  const txt = cleanVisibleText(v || '');
  return txt.length > n ? truncarPalabra(txt, n-1) : txt;
}

function agruparConexionesPorPersonaVisual(conexiones){
  const grupos = {};
  const orden = [];
  conexiones.forEach(c=>{
    const clave = (c.persona_real || c.persona_actual || '').trim().toLowerCase();
    if(!clave) return;
    if(!grupos[clave]){
      grupos[clave] = {
        personaActual: c.persona_real || c.persona_actual,
        entradas: []
      };
      orden.push(clave);
    }
    grupos[clave].entradas.push({
      etapa: c.etapa_relacionada || null,
      figura: c.figura_onirica || c.figura_anterior || '',
      rol: c.rol_actual || '',
      funcion: c.funcion_espiritual || c.resonancia || ''
    });
  });
  return orden.map(clave=>{
    const g = grupos[clave];
    return {
      personaActual: g.personaActual,
      esRetornoMultiple: g.entradas.length > 1,
      entradas: g.entradas
    };
  });
}

function buildPayloadVisualMapa(){
  const inf = deepCleanText(cur.informe || {});
  const totalEtapas = (inf.etapas || []).length;
  // sin techo fijo — la densidad de detalle por etapa se adapta al volumen real, no se recorta el conteo
  const TECHO_SEGURIDAD = 40; // solo evita payloads absurdos, no una decisión de diseño
  const densidad = totalEtapas <= 8 ? 'alta' : totalEtapas <= 15 ? 'media' : totalEtapas <= 25 ? 'baja' : 'minima';
  const conexionesCrudas = getConexionesRetorno(inf);
  const personasPorEtapa = {};
  conexionesCrudas.forEach(c=>{
    if(!c.etapa_relacionada || !c.persona_real) return;
    if(!personasPorEtapa[c.etapa_relacionada]) personasPorEtapa[c.etapa_relacionada] = [];
    if(!personasPorEtapa[c.etapa_relacionada].includes(c.persona_real)) personasPorEtapa[c.etapa_relacionada].push(c.persona_real);
  });

  const etapas = (inf.etapas || []).slice(0,TECHO_SEGURIDAD).map(et=>({
    numero: et.numero_etapa || null,
    titulo: shortVisual(et.titulo, 54),
    periodo: shortVisual(getPeriodoTexto(et) || 'sin ancla temporal', 72),
    nivelConfianzaPeriodo: et.nivel_confianza_periodo || (getPeriodoTexto(et) ? 'medio' : null),
    rol: shortVisual(et.rol_encarnado || et.genero_percibido || '', 62),
    relacion: shortVisual(getRelacionPrincipal(et), 68),
    eventoCritico: shortVisual(et.evento_critico, 84),
    huellaActual: shortVisual(getHuellaActual(et), 84),
    aprendizaje: shortVisual(getAprendizaje(et), 84),
    personasQueAcompañan: (personasPorEtapa[et.numero_etapa] || []).map(n=>shortVisual(n,30))
  }));
  const rolPropioPorEtapa = {};
  (inf.etapas || []).forEach(et=>{ rolPropioPorEtapa[et.numero_etapa] = shortVisual(et.rol_encarnado || et.genero_percibido || '', 40); });

  const conexionesAgrupadas = agruparConexionesPorPersonaVisual(conexionesCrudas).map(g=>({
    personaActual: shortVisual(g.personaActual, 46),
    esRetornoMultiple: g.esRetornoMultiple,
    entradas: g.entradas.slice(0,6).map(e=>({
      etapa: e.etapa,
      figura: shortVisual(e.figura, 46),
      rolDeEsaPersona: shortVisual(e.rol, 40),
      rolTuyoEnEsaEtapa: rolPropioPorEtapa[e.etapa] || '',
      vinculo: shortVisual(e.funcion, 72)
    }))
  }));
  const TRATAMIENTO_PARENTESCO = {
    'Pareja': 'linea_solida',
    'Interés romántico (sin definir)': 'linea_punteada_tentativa',
    'Ex pareja': 'linea_discontinua_cerrada',
  };
  const familia = (cur.moduloC || [])
    .filter(v => v.parentesco && v.parentesco !== 'Sin parentesco literal')
    .map(v=>({
      nombre: shortVisual(v.nombre, 40),
      parentesco: v.parentesco,
      tratamientoVisual: TRATAMIENTO_PARENTESCO[v.parentesco] || 'linea_estandar'
    }));
  const auxilios = [];
  auxilios.push(...textoItems(cur.moduloB && cur.moduloB.presencias, 4));
  (cur.moduloC || []).filter(v=>/(mentor|guía|guia|amistad profunda|familiar)/i.test(v.tipoVinculo || '')).slice(0,5).forEach(v=>{
    auxilios.push(shortVisual(`${v.nombre} — ${v.tipoVinculo}`, 70));
  });
  const conflictos = [];
  (cur.moduloE || []).filter(e=>/sí|si|kár/i.test(e.esKarmico || '')).slice(0,5).forEach(e=>{
    conflictos.push(shortVisual(e.etapaVida || e.descripcion || e.sentimientos, 82));
  });
  if(!conflictos.length) conflictos.push(...textoItems(cur.moduloD && cur.moduloD.descripcion, 5));
  const aprendizajes = [...new Set((inf.etapas || []).map(e=>getAprendizaje(e)).filter(Boolean).map(x=>shortVisual(x,70)))].slice(0,5);

  const arcosVisual = (inf.arcos_relacionales || []).map(a=>({
    persona: shortVisual(a.persona, 46),
    etapas: Array.isArray(a.etapas_involucradas) ? a.etapas_involucradas : [],
    patronTransversal: shortVisual(a.patron_transversal, 130),
    hoy: shortVisual(a.lo_que_ya_se_supero, 100),
    enTransito: a.lo_que_sigue_en_transito ? shortVisual(a.lo_que_sigue_en_transito, 90) : null
  }));

  const NOMBRES_LEY_VISUAL = { justicia:'Justicia', amor:'Amor', caridad:'Caridad' };
  const leyesPorPersona = {};
  if(inf.balance_justicia_amor_caridad){
    ['justicia','amor','caridad'].forEach(clave=>{
      const ley = inf.balance_justicia_amor_caridad[clave];
      (ley && Array.isArray(ley.personas_involucradas) ? ley.personas_involucradas : []).forEach(nombre=>{
        const key = (nombre||'').trim();
        if(!key) return;
        if(!leyesPorPersona[key]) leyesPorPersona[key] = [];
        if(!leyesPorPersona[key].includes(NOMBRES_LEY_VISUAL[clave])) leyesPorPersona[key].push(NOMBRES_LEY_VISUAL[clave]);
      });
    });
  }
  arcosVisual.forEach(a=>{ a.leyes = leyesPorPersona[a.persona] || []; });

  return {
    alias: cur.alias || 'lectura simbólica',
    titulo: `Mapa conceptual simbólico — ${cur.alias || 'lectura simbólica'}`,
    subtitulo: 'Retornos, reencarnaciones, relaciones, conflictos y auxilios',
    vidaActual: {
      rol: shortVisual(cur.moduloA && cur.moduloA.autodescripcion, 120),
      nucleo: shortVisual((cur.moduloA && cur.moduloA.patron) || '', 120),
      vocacion: shortVisual((cur.tirada && cur.tirada.arquetipo && cur.tirada.arquetipo.nombre) || '', 50),
      busqueda: shortVisual((cur.tirada && cur.tirada.aprendizaje && cur.tirada.aprendizaje.nombre) || '', 50)
    },
    hiloConductor: shortVisual(inf.hilo_conductor || inf.resumen_ruta || '', 150),
    etapas,
    reingresos: conexionesAgrupadas,
    arcosRelacionales: arcosVisual,
    patrones: textoItems((cur.moduloA && cur.moduloA.patron) || inf.hilo_conductor || '', 5),
    conflictos: conflictos.slice(0,5),
    auxilios: auxilios.filter(Boolean).slice(0,5),
    ejeAprendizaje: aprendizajes.length ? aprendizajes : [shortVisual(cur.tirada && cur.tirada.aprendizaje && cur.tirada.aprendizaje.desc, 90)],
    totalEtapasReales: totalEtapas,
    densidadSugerida: densidad,
    nota: 'Lectura presuntoria: organiza posibilidades simbólicas y resonancias narrativas. No afirma hechos literales ni identidades históricas.'
  };
}

function instruccionDensidad(payload){
  const mapa = {
    alta: 'Puedes mostrar los siete campos de cada etapa (período, rol, relación, evento crítico, huella, aprendizaje) con detalle completo.',
    media: `Hay ${payload.totalEtapasReales} etapas — reduce cada ficha a título, período y una sola línea de síntesis (combina rol+evento crítico en una frase). No muestres los siete campos completos por etapa o la imagen quedará ilegible.`,
    baja: `Hay ${payload.totalEtapasReales} etapas — muestra SOLO título y período por etapa, como una lista compacta a lo largo del eje. El detalle completo de cada una vive en la lectura escrita, no en esta imagen.`,
    minima: `Hay ${payload.totalEtapasReales} etapas, un volumen alto. Agrupa visualmente por décadas o períodos afines en vez de dar una ficha individual a cada una; prioriza que el eje completo quepa y se lea, aunque eso signifique fusionar la representación visual de varias etapas cercanas en un mismo tramo del eje (esto es solo para la imagen — la lectura escrita conserva cada etapa por separado, no estás perdiendo información real, solo comprimiendo cómo se dibuja).`,
  };
  return mapa[payload.densidadSugerida] || mapa.alta;
}

const NOTA_LEGIBILIDAD_TEXTO = 'Nota técnica sobre esta imagen: los modelos de generación de imagen suelen distorsionar texto pequeño y denso (palabras que no se leen bien, letras aproximadas). Esto es una limitación conocida de la tecnología actual, no un error del prompt — la lectura escrita completa, sin esa limitación, es la fuente confiable para cualquier texto que la imagen no muestre con claridad.';

function buildPromptMapaIlustrado(){
  const payload = buildPayloadVisualMapa();
  return `Actúa como diseñador de iconografía simbólica para cartografía de introspección — NO como ilustrador narrativo ni pintor de escenas. Tu trabajo es el opuesto de una escena detallada: cada etapa se representa con UN SOLO SÍMBOLO compacto, nunca con una viñeta pictórica con personajes, gestos o fondo elaborado.

AISLAMIENTO DE CONTEXTO — LEE ESTO ANTES QUE NADA: ignora por completo cualquier persona, nombre, historia o dato de cualquier conversación anterior en este mismo chat, aunque se parezca o tengas la impresión de recordar algo relacionado. La ÚNICA fuente válida para esta imagen es el bloque "DATOS DE ENTRADA" de más abajo, tal como aparece en este mensaje — ningún dato de fuera de ese bloque, sin importar de dónde provenga o cuán reciente sea en esta conversación, es válido aquí.

PRINCIPIO GENERAL, VÁLIDO PARA TODA ESTA IMAGEN, NO SOLO PARA UNA SECCIÓN: cuando un dato no exista en la información de abajo —un nombre, una fecha, una relación, cualquier campo— tu respuesta correcta es dejar ese espacio vacío o simplemente no mencionarlo. Un espacio en blanco nunca es un error que debas corregir inventando contenido; es información real (significa que ese dato no existe) y debes tratarlo con el mismo respeto que a un dato presente. La tentación más común y más grave en este tipo de imagen es "completar" categorías vacías con contenido inventado para que la composición se vea más llena — resístela siempre.

PROPÓSITO DE ESTA IMAGEN ESPECÍFICA: esta es la mirada rápida y total de la ruta completa — el equivalente visual de un resumen ejecutivo, no el lugar para la complejidad relacional profunda (eso vive en una segunda imagen separada, con otro propósito). Aquí prioriza que TODA la ruta se entienda de un vistazo, con densidad de detalle mínima por etapa, antes que profundidad en pocas etapas.

Vas a crear UNA IMAGEN ÚNICA centrada en el EJE CRONOLÓGICO de esta lectura, con un símbolo propio para cada etapa. Esta imagen NO necesita árbol genealógico ni arcos de retorno precisos — eso vive en una segunda imagen separada. Los datos de abajo son la única fuente autorizada. No inventes nombres, fechas ni escenas que no aparezcan aquí. Si un campo está vacío o ausente, déjalo vacío en la imagen — un espacio en blanco es siempre preferible a un dato inventado para completar la composición.

DATOS DE ENTRADA:\n${JSON.stringify(payload, null, 2)}

EJE CRONOLÓGICO: ordena las etapas del arreglo "etapas" de la más antigua a la más reciente según su período. Muestra el texto de "periodo" tal como viene para cada una, sin agregar ningún sistema de niveles de confianza, leyenda o clave explicativa aparte — esa distinción no necesita su propio recuadro en esta imagen.

VERIFICACIÓN DE CONTEO OBLIGATORIA ANTES DE FINALIZAR — LEE ESTO CON CUIDADO: el arreglo "etapas" tiene exactamente ${payload.etapas ? payload.etapas.length : 0} elementos, numerados así: ${payload.etapas ? payload.etapas.map(e=>e.numero).join(', ') : ''}. Esta es la lista completa de títulos que DEBEN aparecer, uno por uno, sin excepción:
${payload.etapas ? payload.etapas.map(e=>`  ${e.numero}. ${e.titulo}`).join('\n') : ''}
Antes de dar por terminada la composición, revisa esta lista línea por línea y confirma que cada una tiene su símbolo dibujado en la imagen. Si el espacio se siente insuficiente para todas, reduce el tamaño de cada símbolo o comprime el texto según la instrucción de densidad de abajo — nunca omitas ninguna de las etapas de esta lista para que quepan mejor. Omitir una etapa por razones de espacio es un error grave, no una decisión de diseño válida — es preferible una imagen apretada con las ${payload.etapas ? payload.etapas.length : 0} etapas completas que una imagen cómoda con menos de las que aparecen en esta lista.

NUMERACIÓN Y TÍTULOS EXACTOS, SIN EXCEPCIÓN: usa cada número de la lista de arriba UNA SOLA VEZ, en orden secuencial sin saltos ni repeticiones — nunca dos etapas con el mismo número, nunca un número que se repita como si fueran dos etapas distintas. Copia cada título EXACTAMENTE como aparece en la lista, palabra por palabra — no lo parafrasees, no le cambies el nombre, no inventes una variación más poética. Si regeneras esta imagen más de una vez, los números y títulos deben ser IDÉNTICOS en cada versión, porque provienen del mismo dato fijo, no de tu interpretación libre.

FORMATO Y ORIENTACIÓN — REGLA OBLIGATORIA, NO UNA PREFERENCIA ESTÉTICA: la imagen debe ser VERTICAL, más alta que ancha (proporción aproximada 9:16 o similar a un póster largo). El eje cronológico se lee de ARRIBA hacia ABAJO, nunca de izquierda a derecha. PROHIBIDO: una fila horizontal de paneles o viñetas en formato "tira de película" — aunque el tema sea una línea de tiempo, esta composición específica exige lectura vertical porque debajo del eje, en la misma imagen, hay una síntesis final que solo tiene sentido si continúa hacia abajo. Si tu instinto compositivo para "línea de tiempo" es horizontal, ignóralo aquí: esta composición es vertical de principio a fin.

SÍMBOLO POR ETAPA — REGLA CENTRAL DE ESTA IMAGEN: para cada etapa, elige UN SOLO objeto, elemento natural o forma arquetípica que condense su "titulo" y "rol" — por ejemplo, una llama para un evento de fuego, una espiral para un ciclo, una llave para un umbral, una raíz para un origen. Represéntalo como un ícono pequeño y simple (piensa en el tamaño de un ícono de aplicación de teléfono, no en una ilustración protagonista) — PROHIBIDO expandir el símbolo en una escena narrativa completa con personajes, fondos detallados o composición pictórica. PROPORCIÓN OBLIGATORIA DEL ESPACIO: el símbolo debe ocupar una fracción pequeña del espacio total de cada etapa — la mayor parte del espacio de cada etapa es para el texto informativo (título, período, personas que acompañan), no para el ícono. Si notas que el símbolo está creciendo más grande que el bloque de texto que lo acompaña, redúcelo. Esta restricción existe para que cada etapa ocupe poco espacio vertical, permitiendo que rutas largas (diez, doce, quince etapas o más) quepan completas en un solo eje legible sin saturar la composición.

PERSONAS QUE ACOMPAÑAN CADA ETAPA: si el campo "personasQueAcompañan" de una etapa no está vacío, incluye esos nombres como una línea breve de texto junto al símbolo de esa etapa (por ejemplo "acompañan: Felipe, Mauricio"). Si el campo está vacío, no escribas nada al respecto para esa etapa — no inventes nombres para las etapas que no los tengan.

DENSIDAD DE TEXTO POR ETAPA (aplica solo al texto que acompaña cada símbolo, no a la ilustración — aquí ya no hay ilustración): ${instruccionDensidad(payload)}

NODO CENTRAL "vida actual": usa vidaActual.rol, vidaActual.nucleo, vidaActual.vocacion y vidaActual.busqueda para una síntesis breve, sin árbol genealógico completo — solo el punto de llegada del eje, también representado con un símbolo simple, no una figura ilustrada.

HILO CONDUCTOR: banda con el texto de "hiloConductor". FRANJA INFERIOR: módulos breves con "patrones", "conflictos", "auxilios", "ejeAprendizaje".

TÍTULO: "${payload.titulo}". SUBTÍTULO: "${payload.subtitulo}".

ESTILO VISUAL: formato vertical; fondo simple y sobrio, sin textura de pergamino ni ambientación pictórica; paleta cálida y coherente; tipografía serif para títulos; los símbolos son la única iconografía, discretos y de trazo limpio — piensa en un mapa de estaciones de metro conceptual, no en un libro ilustrado.

REGLAS DE FIDELIDAD: no afirmar que una vida pasada ocurrió como hecho histórico; no afirmar que una persona actual fue literalmente otra persona; no convertir sufrimientos en castigos; no agregar datos fuera del objeto de entrada.

${NOTA_LEGIBILIDAD_TEXTO}

BANDA AL PIE: "${payload.nota}"`;
}

function buildPromptMapaRed(){
  const payload = buildPayloadVisualMapa();
  const numEtapas = payload.etapas ? payload.etapas.length : 0;
  const listaEtapas = payload.etapas ? payload.etapas.map(e=>`${e.numero}. ${e.titulo}`).join(' · ') : '';
  return `Actúa como diseñador de diagramas de red relacional — NO como ilustrador, NO como diseñador de árboles ni de genogramas. Esta imagen es un mapa de relaciones tipo rizoma: un tejido, un entramado, un complexus — el alma en el centro, y las personas reales de su vida actual alrededor, conectadas por líneas curvas que van y vienen entre cada reaparición. Es lineal y geométrica en el sentido de que se puede seguir con la vista sin esfuerzo, pero nunca es un diagrama de flujo con cajas y flechas rectas en cuadrícula.

AISLAMIENTO DE CONTEXTO — LEE ESTO ANTES QUE NADA: ignora por completo cualquier persona, nombre, historia o dato de cualquier conversación anterior en este mismo chat, aunque se parezca o tengas la impresión de recordar algo relacionado. La ÚNICA fuente válida para esta imagen es el bloque "DATOS DE ENTRADA" de más abajo, tal como aparece en este mensaje — ningún dato de fuera de ese bloque es válido aquí, sin importar de dónde provenga.

REGLA MÁS IMPORTANTE, LÉELA PRIMERO: esta ruta tiene EXACTAMENTE ${numEtapas} etapas: ${listaEtapas}. Cada persona real puede conectarse a una o varias de ellas — esas conexiones son el contenido central de la imagen, no una etapa completa por sí sola. Las etapas aquí son puntos de referencia pequeños sobre las líneas de conexión, no protagonistas con su propia tarjeta — esa función ya la cumple la primera imagen (símbolos). Aquí NUNCA repitas período, evento crítico, huella actual ni aprendizaje de cada etapa como texto largo — esta imagen es sobre personas y vínculos, no sobre las etapas en sí. Usa cada número UNA SOLA VEZ y copia cada título EXACTAMENTE de la lista de arriba, sin parafrasear — deben coincidir palabra por palabra con la primera imagen (símbolos), porque ambas describen la misma ruta.

PRINCIPIO GENERAL CONTRA LA INVENCIÓN: cuando un dato no exista en la información de abajo, tu respuesta correcta es dejar ese espacio vacío u omitirlo. Nunca inventes contenido para completar una categoría que sientas incompleta.

DATOS DE ENTRADA:\n${JSON.stringify(payload, null, 2)}

ESTRUCTURA CENTRAL — UN NODO POR PERSONA, NO POR ETAPA: en el centro exacto de la imagen, un nodo que representa el alma actual (usa vidaActual.rol y vidaActual.nucleo para una etiqueta breve, máximo 12 palabras). Alrededor, distribuidos como una red o telaraña —nunca en fila ni en cuadrícula—, un nodo por cada persona del arreglo "reingresos" (campo "personaActual"). Desde el centro hacia cada persona, y de cada persona de vuelta al centro, traza una línea curva — nunca recta, nunca en ángulo de diagrama de flujo.

CONEXIONES ENTRE REAPARICIONES DE LA MISMA PERSONA — ESTO ES LO MÁS IMPORTANTE DE TODA LA IMAGEN: si una persona tiene más de una entrada en "entradas" (es decir, "esRetornoMultiple" es true, apareciendo en más de una etapa), no la conectes solo con el centro — traza también una línea curva adicional que conecte sus distintas apariciones entre sí, como si su propio hilo atravesara varias reencarnaciones antes de llegar a esta vida. Junto a esa persona, incluye para cada una de sus entradas: el número de la etapa (pequeño), el nombre o papel que ella tenía entonces ("figura" o "rolDeEsaPersona"), y quién eras tú en esa misma etapa ("rolTuyoEnEsaEtapa") — dos roles distintos, el de ella y el tuyo, ambos breves.

SÍMBOLOS EN VEZ DE ETIQUETAS DE CAMPO — REGLA OBLIGATORIA DE DISEÑO DE INFORMACIÓN: nunca escribas las palabras "aprendizaje", "evento crítico", "vínculo" ni ningún otro nombre de categoría como texto. En su lugar, usa un símbolo pequeño y un color consistente para cada tipo de información — por ejemplo, un pequeño ícono de llave o de círculo para el vínculo ("vinculo"), un color de línea distinto si esa conexión implica una prueba superada, otro si sigue en tránsito. El texto que sí aparece debe ser SOLO el contenido en sí (una palabra o frase corta), nunca precedido por el nombre de su categoría. Incluye una leyenda pequeña, aparte de los nodos, que explique qué significa cada símbolo o color — la leyenda lleva las etiquetas, los nodos no.

DENSIDAD DE TEXTO POR PERSONA: cada persona se resume en pocas palabras por entrada — nombre, número de etapa, un símbolo por categoría con su color. Si una persona tiene tres entradas o menos, puedes incluir su "vinculo" (resumido a una frase corta) junto a un símbolo. Con más entradas, o si hay más de ocho personas en total, reduce a lo mínimo: nombre, etapas conectadas por número, sin texto adicional.

LAS TRES LEYES: si "leyes" de una persona no está vacío, usa un color o marca pequeña por ley (Justicia, Amor, Caridad) en su nodo, incluida en la misma leyenda de símbolos.

SIN ILUSTRACIONES, SIN ESCENAS, SIN FOTOGRAFÍA, SIN RETRATOS DE NINGÚN TIPO: cero imágenes pictóricas de cuevas, templos, paisajes, y cero fotografías o retratos realistas de personas — ni de cuerpo completo, ni de rostro, ni estilo "foto de perfil profesional" u organigrama corporativo con fotos circulares. Ninguna persona de esta imagen debe tener un rostro dibujado o generado, sea realista o estilizado — cada persona es EXCLUSIVAMENTE un nodo geométrico simple (círculo o forma) con su nombre en texto. Si tu instinto es representar a alguien con una cara o una foto, ese instinto es exactamente lo que esta imagen prohíbe — dedica cero espacio visual a rostros, todo el peso visual va en la claridad de la red misma.

RECORDATORIO FINAL ANTES DE ENTREGAR — VERIFICA ESTO EXPLÍCITAMENTE: repasa cada persona que dibujaste y confirma que su nombre aparece TEXTUALMENTE en el arreglo "reingresos" o "arcosRelacionales" de los datos de abajo. Si algún nombre en tu composición no está en esos datos, bórralo antes de entregar la imagen — no existe ninguna excepción a esta regla, ni siquiera para completar una composición que se sienta más simétrica o poblada.

FORMATO: puede ser cuadrado o vertical, lo que mejor sirva a una composición radial centrada — no fuerces verticalidad si eso te empuja a organizar por filas en vez de por red.

EXCLUSIÓN EXPLÍCITA: aunque "nivelConfianzaPeriodo" existe en los datos, NO lo conviertas en columna ni leyenda — ignóralo por completo.

TÍTULO: "${payload.titulo} — red de relaciones". SUBTÍTULO: "${payload.subtitulo}".

ESTILO VISUAL: minimalista, tipo mapa de red o rizoma conceptual; nodos como círculos simples; líneas curvas orgánicas, nunca rectas; texto sans-serif claro y breve; colores usados solo para diferenciar categorías según la leyenda, nunca decorativos.

REGLAS DE FIDELIDAD: nunca afirmar que una persona actual fue literalmente otra persona — usa siempre lenguaje de resonancia; no agregar personas, roles ni conexiones fuera del objeto de entrada.

${NOTA_LEGIBILIDAD_TEXTO}

BANDA AL PIE: "${payload.nota}"`;
}

/* ===== Sistema de tarjetas de persona generadas en la app, sin IA externa ===== */

const TARJETA_SIMBOLOS = {
  llave: '<circle cx="8" cy="8" r="3.5"/><path d="M10.5 10.5 L19 19 M15.5 15.5 L18 13 M17.5 17.5 L20 15"/>',
  corazon: '<path d="M12 20 C12 20 3 13.8 3 8.3 C3 5.4 5.4 3 8.3 3 C10 3 11.4 3.8 12 5.1 C12.6 3.8 14 3 15.7 3 C18.6 3 21 5.4 21 8.3 C21 13.8 12 20 12 20 Z"/>',
  balanza: '<path d="M12 3 V21 M7 6 H17 M9 21 H15"/><circle cx="5" cy="10" r="2.6"/><circle cx="19" cy="10" r="2.6"/><path d="M7 6 L5 10 M7 6 L9 10 M17 6 L15 10 M17 6 L19 10"/>',
  manos: '<path d="M4 15 C4 11.5 6.5 10 9 10.5 C10 10.7 10.6 11.2 11 11.8 M20 15 C20 11.5 17.5 10 15 10.5 C14 10.7 13.4 11.2 13 11.8 M4 15 C4 18.5 7.8 20.5 12 20.5 C16.2 20.5 20 18.5 20 15"/>',
  raiz: '<path d="M12 3 V10 M12 10 L7.5 15 M12 10 L16.5 15 M7.5 15 L5.5 20 M7.5 15 L9.5 20 M16.5 15 L14.5 20 M16.5 15 L18.5 20"/>',
  espiral: '<path d="M14 20 C10 20 7 17 7 13.5 C7 10.8 9.2 8.6 11.9 8.6 C14.1 8.6 15.9 10.3 15.9 12.5 C15.9 14.2 14.5 15.6 12.8 15.6 C11.4 15.6 10.3 14.5 10.3 13.1"/>',
  hilo: '<path d="M2 13 C4 9 6 9 8 13 C10 17 12 17 14 13 C16 9 18 9 20 13 C21 15 21.5 15.5 22 16"/>',
  estrella: '<path d="M12 2.5 L14.5 9.2 L21.5 9.6 L16 14 L18 21 L12 16.9 L6 21 L8 14 L2.5 9.6 L9.5 9.2 Z"/>',
  pluma: '<path d="M20 4 C20 4 10.5 6.3 6.5 11.8 C4.6 14.4 4.3 17.3 4.3 19.5 C6.5 19.5 9.3 19.2 12 17 C17.6 12.5 20 4 20 4 Z M4.5 19.5 L11.5 12.3 M9.3 14.5 L7.3 14.5 M13 10.5 L11 10.5"/>',
  escudo: '<path d="M12 3 L19 6 V11 C19 15.8 15.6 19.2 12 20.6 C8.4 19.2 5 15.8 5 11 V6 Z"/>',
  puerta: '<path d="M6 21 V9.5 A6 6 0 0 1 18 9.5 V21 M6 21 H18"/>',
  ancla: '<circle cx="12" cy="5" r="2"/><path d="M12 7 V16 M8.5 10.5 H15.5 M4 12 A8 8 0 0 0 20 12"/>',
  arco: '<path d="M4 18 C4 10 8 5 12 5 C16 5 20 10 20 18 M4 18 H8 M16 18 H20"/>',
  vela: '<rect x="10" y="10" width="4" height="10" rx="1"/><path d="M12 4 C13 6 14.5 7 14.5 9 C14.5 10.5 13.5 11 12 11 C10.5 11 9.5 10.5 9.5 9 C9.5 7 11 6 12 4 Z"/>',
  luna: '<path d="M15 4 C10 4 7 8 7 12 C7 16 10 20 15 20 C12 18 10.5 15.5 10.5 12 C10.5 8.5 12 6 15 4 Z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.5 4.5 L6.5 6.5 M17.5 17.5 L19.5 19.5 M4.5 19.5 L6.5 17.5 M17.5 6.5 L19.5 4.5"/>',
  libro: '<path d="M12 6 C10 4.5 6 4 4 4.5 V18 C6 17.5 10 18 12 19.5 C14 18 18 17.5 20 18 V4.5 C18 4 14 4.5 12 6 Z M12 6 V19.5"/>',
  semilla: '<ellipse cx="12" cy="15" rx="3.2" ry="5"/><path d="M12 10 C12 7 14 5 17 4.5"/>',
  espejo: '<circle cx="12" cy="9" r="6"/><path d="M12 15 V21 M9 21 H15"/>',
  campana: '<path d="M12 3 C12 3 12 4.5 12 5 C8.5 5.5 6.5 8.5 6.5 12 C6.5 15 5.5 16.5 4.5 17.5 H19.5 C18.5 16.5 17.5 15 17.5 12 C17.5 8.5 15.5 5.5 12 5 M10 20 C10 21 11 21.5 12 21.5 C13 21.5 14 21 14 20"/>',
  nudo: '<path d="M6 12 C6 9.5 8 8 10 9.5 C12 11 12 13 14 14.5 C16 16 18 14.5 18 12 C18 9.5 16 8 14 9.5 C12 11 12 13 10 14.5 C8 16 6 14.5 6 12 Z"/>',
  gota: '<path d="M12 3 C15 8 18 12 18 15.5 C18 19 15.3 21 12 21 C8.7 21 6 19 6 15.5 C6 12 9 8 12 3 Z"/>',
  cadena: '<rect x="4" y="9" width="8" height="6" rx="3" fill="none"/><rect x="12" y="9" width="8" height="6" rx="3" fill="none"/>',
  lampara: '<path d="M9 20 H15 M12 20 V16 M7 12 C7 9 9 7 12 7 C15 7 17 9 17 12 C17 15 15 16 12 16 C9 16 7 15 7 12 Z M12 7 V4 M10 4 H14"/>',
  brujula: '<circle cx="12" cy="12" r="9"/><path d="M15 9 L13 13 L9 15 L11 11 Z"/>'
};

const SIMBOLOS_VALIDOS = Object.keys(TARJETA_SIMBOLOS);

function elegirSimboloParaPersona(p){
  // Prioridad 1: si la IA que interpretó la lectura sugirió un símbolo válido, se usa directamente —
  // tiene más contexto de la historia completa que cualquier heurística de palabras clave.
  if(p.simboloSugerido && SIMBOLOS_VALIDOS.includes(p.simboloSugerido)) return p.simboloSugerido;

  // Prioridad 2: heurística de respaldo, si no llegó sugerencia o no era válida.
  const leyes = p.leyes || [];
  const textoBase = [p.rolPasado, p.hoy, p.enTransito, p.resonancia, p.funcionEspiritual, p.cicloAbre, p.cicloCierra]
    .filter(Boolean).join(' ').toLowerCase();

  if(/cerr|reclam|deuda|pendient/.test(textoBase)) return 'llave';
  if(/proteg|cuid[oa]|defend/.test(textoBase)) return 'escudo';
  if(/enseñ|maestr[oa]|palabra|discípul/.test(textoBase)) return 'pluma';
  if(/sabidur|conocimiento|estudi/.test(textoBase)) return 'libro';
  if(/guí[ao]|orient|camino/.test(textoBase)) return 'estrella';
  if(/propósito|dirección|rumbo/.test(textoBase)) return 'brujula';
  if(/oscurid|noche/.test(textoBase)) return 'lampara';
  if(/origen|ancestr|linaje|raíz/.test(textoBase)) return 'raiz';
  if(/ciclo|transform|repit/.test(textoBase)) return 'espiral';
  if(/umbral|entrada|nuevo comienzo/.test(textoBase)) return 'puerta';
  if(/comienzo|potencial|germin/.test(textoBase)) return 'semilla';
  if(/permanec|sostén|estable/.test(textoBase)) return 'ancla';
  if(/compromiso|atadura/.test(textoBase)) return 'cadena';
  if(/sanaci|llanto|duelo|limpi/.test(textoBase)) return 'gota';
  if(/autoconoc|reflej|reconoc[ei]/.test(textoBase)) return 'espejo';
  if(/despert|llamad/.test(textoBase)) return 'campana';
  if(/intuic|introspec/.test(textoBase)) return 'luna';
  if(/vitalidad|claridad|energía/.test(textoBase)) return 'sol';
  if(/presencia interior|calma/.test(textoBase)) return 'vela';
  if(/unión estrecha|atadura mutua/.test(textoBase)) return 'nudo';
  if(leyes.includes('Amor')) return 'corazon';
  if(leyes.includes('Justicia')) return 'balanza';
  if(leyes.includes('Caridad')) return 'manos';
  if(/arco iris|puente|conecta/.test(textoBase)) return 'arco';
  return 'hilo';
}

function buildTarjetaPersonaSVG(p, alias){
  const W = 640;

  // truncado duro de seguridad — nunca envuelve a una segunda línea, así el alto de cada línea es fijo.
  // Ya no es el mecanismo principal para acortar texto (eso ahora lo hacen las frases breves nativas),
  // es solo la red de seguridad para el caso en que el dato sea más largo de lo esperado.
  function truncarCorto(texto, maxChars){
    const t = (texto||'').trim();
    if(!t) return '';
    if(t.length <= maxChars) return t;
    return t.slice(0, maxChars-1).trim() + '…';
  }

  // 1) ESTRELLAS COMPACTAS, arriba a la derecha — ya no una fila ancha centrada.
  const estrellasSVG = Array.from({length:3}, (_,i)=> i < p.estrellas
    ? `<g transform="translate(${W-56-i*26},46) scale(0.9)" fill="#B8863F" stroke="none">${TARJETA_SIMBOLOS.estrella}</g>`
    : `<g transform="translate(${W-56-i*26},46) scale(0.9)" fill="none" stroke="#D8C8A8" stroke-width="1">${TARJETA_SIMBOLOS.estrella}</g>`
  ).join('');

  // Nombre a tamaño dinámico (colectivos largos no se desbordan) — igual que antes.
  const ANCHO_DISPONIBLE_TITULO = 460;
  const PX_POR_CARACTER_BOLD = 0.58;
  let nombreTitulo = (p.persona || '').trim();
  let tamanoTitulo = Math.min(40, Math.max(20, Math.floor(ANCHO_DISPONIBLE_TITULO / (Math.max(nombreTitulo.length,1) * PX_POR_CARACTER_BOLD))));
  if(tamanoTitulo <= 20){
    const maxCharsAlMinimo = Math.floor(ANCHO_DISPONIBLE_TITULO / (20 * PX_POR_CARACTER_BOLD));
    nombreTitulo = truncarCorto(nombreTitulo, maxCharsAlMinimo);
  }

  // 1b) ETIQUETA DE NIVEL DE VÍNCULO, bajo el nombre.
  const etiquetaNivel = p.nivel === 'rico' ? 'VÍNCULO CON ARCO PROPIO' : 'VÍNCULO BREVE';

  let cursorY = 150;

  // 2) SÍMBOLO CENTRAL — se mantiene como ancla visual principal, ahora más arriba en el flujo.
  const simboloKey = elegirSimboloParaPersona(p);
  const simboloPath = TARJETA_SIMBOLOS[simboloKey] || TARJETA_SIMBOLOS.hilo;
  const radioSimbolo = 78;
  const cySimbolo = cursorY + radioSimbolo;
  const simboloSVG = `
    <circle cx="${W/2}" cy="${cySimbolo}" r="${radioSimbolo}" fill="none" stroke="#D8C8A8" stroke-width="1.5"/>
    <g transform="translate(${W/2-28},${cySimbolo-28})" stroke="#B8863F" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g transform="scale(2.35)">${simboloPath}</g>
    </g>`;
  cursorY = cySimbolo + radioSimbolo + 34;

  // 3) ETAPAS: chips compactos, SOLO número — el rol ya no vive aquí, vive abajo con espacio real.
  const listaEtapas = (p.etapasDetalle && p.etapasDetalle.length ? p.etapasDetalle : p.etapas.map(n=>({numero:n, rol:null}))).slice(0,6);
  let etapasSVG = '';
  if(listaEtapas.length){
    etapasSVG += `<text x="${W/2}" y="${cursorY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8A7A5C" letter-spacing="1">ETAPAS CONECTADAS</text>`;
    cursorY += 22;
    const diametro = 38, gap = 10;
    const anchoTotal = listaEtapas.length * diametro + (listaEtapas.length-1) * gap;
    const xInicial = W/2 - anchoTotal/2;
    etapasSVG += listaEtapas.map((e,i)=>{
      const cx = xInicial + i*(diametro+gap) + diametro/2;
      return `<g transform="translate(${cx},${cursorY + diametro/2})">
        <circle r="${diametro/2}" fill="#5A2E2E"/>
        <text y="5" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="#F3E7D0" font-weight="700">${esc(String(e.numero))}</text>
      </g>`;
    }).join('');
    cursorY += diametro + 30;
  }

  // 3b) ETAPAS Y ROLES — el detalle que antes se apretaba en el chip, ahora con espacio real por línea.
  let rolesSVG = '';
  const etapasConRol = listaEtapas.filter(e=>e.rol);
  if(etapasConRol.length){
    rolesSVG += `<text x="56" y="${cursorY}" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#5A2E2E" letter-spacing="1">ETAPAS Y ROLES</text>`;
    cursorY += 8;
    rolesSVG += etapasConRol.map((e,i)=>{
      const y = cursorY + 24 + i*26;
      const linea = truncarCorto(`${e.numero} — ${e.rol}`, 55);
      return `<text x="56" y="${y}" font-family="Georgia, serif" font-size="14" fill="#3A2E22">${esc(linea)}</text>`;
    }).join('');
    cursorY += 24 + etapasConRol.length * 26 + 16;
  }

  // 4) SECCIONES TIPO "HABILIDAD" — ícono + título breve elegido por criterio propio + frase corta
  // ESCRITA CORTA DESDE EL ORIGEN por la IA (frase_breve_*), no una oración larga recortada.
  const habilidades = [];
  if(p.nivel === 'rico'){
    if(p.fraseBrevePatron) habilidades.push({ icono:'raiz', color:'#5A2E2E', titulo:'Ecos de otro tiempo', texto:p.fraseBrevePatron });
    if(p.fraseBreveHoy) habilidades.push({ icono:'corazon', color:'#3D6B4F', titulo:'Hoy', texto:p.fraseBreveHoy });
  } else {
    if(p.resonancia) habilidades.push({ icono:'hilo', color:'#5A2E2E', titulo:'Resonancia', texto:truncarCorto(p.resonancia, 85) });
    if(p.funcionEspiritual) habilidades.push({ icono:'estrella', color:'#3D6B4F', titulo:'Función', texto:truncarCorto(p.funcionEspiritual, 85) });
  }
  let habilidadesSVG = '';
  habilidades.slice(0,2).forEach(h=>{
    const iconoPath = TARJETA_SIMBOLOS[h.icono] || TARJETA_SIMBOLOS.hilo;
    habilidadesSVG += `
      <g transform="translate(56,${cursorY})">
        <line x1="0" y1="0" x2="${W-112}" y2="0" stroke="#D8C8A8" stroke-width="1"/>
        <g transform="translate(0,14) scale(0.9)" stroke="${h.color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${iconoPath}</g>
        <text x="32" y="27" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${h.color}" letter-spacing="0.5">${esc(h.titulo)}</text>
        <text x="0" y="52" font-family="Georgia, serif" font-style="italic" font-size="14.5" fill="#3A2E22">${esc(truncarCorto(h.texto, 82))}</text>
      </g>`;
    cursorY += 74;
  });
  cursorY += 6;

  // 5) LEYES — fila compacta de ícono + palabra, no círculos grandes apilados.
  const leyesColores = { Justicia:'#5A2E2E', Amor:'#C46A7A', Caridad:'#3D6B4F' };
  const leyesIconos = { Justicia:'balanza', Amor:'corazon', Caridad:'manos' };
  const hayLeyes = p.leyes && p.leyes.length;
  let leyesSVG = '';
  if(hayLeyes){
    leyesSVG += `<line x1="56" y1="${cursorY}" x2="${W-56}" y2="${cursorY}" stroke="#D8C8A8" stroke-width="1"/>`;
    const anchoChipLey = 118;
    const anchoTotalLeyes = p.leyes.length * anchoChipLey;
    const xInicialLeyes = W/2 - anchoTotalLeyes/2;
    leyesSVG += p.leyes.map((ley,i)=>{
      const x = xInicialLeyes + i*anchoChipLey;
      const iconoLey = TARJETA_SIMBOLOS[leyesIconos[ley]] || '';
      return `<g transform="translate(${x},${cursorY+16})">
        <circle cx="14" cy="0" r="14" fill="${leyesColores[ley]||'#9C5A2E'}"/>
        <g transform="translate(2,-12) scale(0.85)" stroke="#FBF3E3" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round">${iconoLey}</g>
        <text x="32" y="5" font-family="Georgia, serif" font-size="14" fill="#3A2E22">${esc(ley)}</text>
      </g>`;
    }).join('');
    cursorY += 46;
  }

  // Altura dinámica: el lienzo crece según el contenido real, el pie de página nunca se superpone.
  const H = Math.max(560, cursorY + 90);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Georgia, serif">
    <rect width="${W}" height="${H}" fill="#2B1810"/>
    <rect x="14" y="14" width="${W-28}" height="${H-28}" rx="18" fill="#FBF3E3" stroke="#B8863F" stroke-width="2"/>
    <rect x="26" y="26" width="${W-52}" height="${H-52}" rx="12" fill="none" stroke="#D8C8A8" stroke-width="1"/>

    ${estrellasSVG}

    <text x="56" y="80" font-size="${tamanoTitulo}" fill="#5A2E2E" font-weight="700">${esc(nombreTitulo)}</text>
    <rect x="56" y="94" width="${etiquetaNivel.length*6.2+16}" height="20" rx="10" fill="#F1E4C8"/>
    <text x="${56+8}" y="108" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#9C5A2E" letter-spacing="0.5">${esc(etiquetaNivel)}</text>
    <text x="56" y="132" font-family="Arial, sans-serif" font-size="12" fill="#8A7A5C" letter-spacing="0.5">VÍNCULO EN LA RUTA DE ${esc((alias||'').toUpperCase())}</text>

    ${simboloSVG}
    ${etapasSVG}
    ${rolesSVG}
    ${habilidadesSVG}
    ${leyesSVG}

    <rect x="26" y="${H-64}" width="${W-52}" height="38" fill="#3A1E1E"/>
    <text x="${W/2}" y="${H-40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#F3E7D0" font-style="italic">Lectura presuntoria — resonancia simbólica, no identidad histórica.</text>
  </svg>`;
}

const ICONO_COMPARTIR = '<circle cx="18" cy="5" r="3" fill="none"/><circle cx="6" cy="12" r="3" fill="none"/><circle cx="18" cy="19" r="3" fill="none"/><path d="M8.6 10.4 L15.4 6.6 M8.6 13.6 L15.4 17.4"/>';

function rasterizarTarjetaComoPNGBlob(p, alias, onListo, onError){
  const svgStr = buildTarjetaPersonaSVG(p, alias);
  const vb = svgStr.match(/viewBox="0 0 (\d+) (\d+)"/);
  const wReal = vb ? parseInt(vb[1],10) : 640;
  const hReal = vb ? parseInt(vb[2],10) : 900;
  const escala = 2;
  const svgBlob = new Blob([svgStr], { type:'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = ()=>{
    const canvas = document.createElement('canvas');
    canvas.width = wReal * escala; canvas.height = hReal * escala;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob(blob=> onListo(blob), 'image/png');
  };
  img.onerror = ()=>{ if(onError) onError(url); };
  img.src = url;
}

function descargarTarjetaPersonaComoPNG(p, alias){
  rasterizarTarjetaComoPNGBlob(p, alias, blob=>{
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tarjeta-${slugify(p.persona)}-${slugify(alias||'')}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  }, url=>{
    // respaldo: si el navegador no puede rasterizar, ofrece el SVG directamente
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarjeta-${slugify(p.persona)}-${slugify(alias||'')}.svg`;
    document.body.appendChild(a); a.click(); a.remove();
  });
}

async function compartirTarjetaPersona(p, alias, botonEl){
  rasterizarTarjetaComoPNGBlob(p, alias, async blob=>{
    const nombreArchivo = `tarjeta-${slugify(p.persona)}-${slugify(alias||'')}.png`;
    const archivo = new File([blob], nombreArchivo, { type:'image/png' });
    if(navigator.share && navigator.canShare && navigator.canShare({ files:[archivo] })){
      try{
        await navigator.share({ files:[archivo], title:`Tarjeta de ${p.persona}`, text:`Un vínculo en la ruta de ${alias||'esta lectura'} — Bitácora del Alma` });
      }catch(e){
        // el usuario canceló el diálogo de compartir, no es un error real
      }
    } else {
      // sin soporte de compartir con archivos en este navegador: se descarga como respaldo
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nombreArchivo;
      document.body.appendChild(a); a.click(); a.remove();
      if(botonEl){
        const textoOriginal = botonEl.textContent;
        botonEl.textContent = 'Tu navegador no admite compartir — se descargó en su lugar';
        setTimeout(()=>{ botonEl.textContent = textoOriginal; }, 3200);
      }
    }
  });
}

function buildPromptTarjetaPersona(nombrePersona){
  const inf = deepCleanText(cur.informe || {});
  const personas = getPersonasConEstrellas(inf);
  const p = personas.find(x => x.persona === nombrePersona);
  if(!p) return null;

  const payload = { alias: cur.alias || 'la persona', persona: p.persona, estrellas: p.estrellas, etapas: p.etapas };
  if(p.etapasDetalle && p.etapasDetalle.length) payload.etapasDetalle = p.etapasDetalle;
  if(p.leyes && p.leyes.length) payload.leyes = p.leyes;
  if(p.nivel === 'rico'){
    if(p.rolPasado) payload.rolPasado = shortVisual(p.rolPasado, 160);
    if(p.hoy) payload.hoy = shortVisual(p.hoy, 130);
    if(p.enTransito) payload.enTransito = shortVisual(p.enTransito, 110);
  } else {
    if(p.resonancia) payload.resonancia = shortVisual(p.resonancia, 140);
    if(p.funcionEspiritual) payload.funcionEspiritual = shortVisual(p.funcionEspiritual, 100);
    if(p.cicloAbre) payload.cicloAbre = shortVisual(p.cicloAbre, 90);
    if(p.cicloCierra) payload.cicloCierra = shortVisual(p.cicloCierra, 90);
  }

  return `Actúa como diseñador de una tarjeta conceptual breve, tipo tarjeta coleccionable de información — NO como retratista, NO como ilustrador de escenas, NO como fotógrafo. Esta tarjeta es sobre UNA SOLA PERSONA: ${payload.persona}, un vínculo real de la vida actual de ${payload.alias}.

AISLAMIENTO DE CONTEXTO — LEE ESTO ANTES QUE NADA: ignora por completo cualquier persona, nombre o dato de cualquier conversación anterior en este mismo chat. La ÚNICA fuente válida es el bloque "DATOS DE ENTRADA" de más abajo.

PRINCIPIO GENERAL CONTRA LA INVENCIÓN: usa exclusivamente los datos de abajo. Si un campo no aparece en los datos, no existe para esta tarjeta — no lo inventes, no lo completes, no asumas contenido que no está escrito.

PROHIBICIÓN ABSOLUTA DE ROSTROS Y FOTOGRAFÍA: esta tarjeta NUNCA debe contener un rostro humano, retrato, fotografía o ilustración realista de una persona — ni de ${payload.persona}, ni de nadie. En su lugar, el elemento visual central es UN SOLO SÍMBOLO — un objeto, elemento natural o forma que condense el vínculo (una llave si el vínculo abre algo, una raíz si es de origen, un hilo si es de reencuentro) — nunca una figura humana dibujada.

DATOS DE ENTRADA:\n${JSON.stringify(payload, null, 2)}

LÍNEA POR ETAPA — REGLA CENTRAL SI "etapasDetalle" ESTÁ PRESENTE: por cada elemento de "etapasDetalle", agrega una línea compacta tipo ficha, en el orden: número de etapa · período (si existe) · rol que tuvo ahí (si existe) · aprendizaje en una o dos palabras (si existe, tomado de "aprendizajeCorto" pero condensado aún más si hace falta). Formato de ejemplo, no literal: "① Paleolítico — hermana de huida — protección". Esto reemplaza cualquier resumen largo de "en qué etapas aparece" — el objetivo es que la persona vea de un vistazo en qué época, con qué papel, y qué se aprendió, sin leer un párrafo.

CONTENIDO DE LA TARJETA — ELIGE, NO USES TODO: además de la línea por etapa (que siempre va si hay datos), elige UNO O DOS campos más entre los que tengan sustancia (rolPasado/hoy/enTransito, o resonancia/funcionEspiritual/ciclo) para un bloque breve de contexto adicional — no obligues a que quepan todos. Dale a cada bloque elegido un título breve y evocador que TÚ inventes (no reutilices el nombre técnico del campo) — pero el contenido debe ser fiel, nunca inventado.

ESTRELLAS: representa "estrellas" (de 1 a 3) como íconos pequeños y consistentes.

LEYES: si "leyes" no está vacío, incluye una marca pequeña por cada ley presente (Justicia, Amor, Caridad), en una o dos palabras, con un color o ícono breve.

FORMATO: tarjeta vertical compacta, proporción aproximada de una tarjeta de juego o ficha coleccionable — no un póster, no una imagen ancha.

ESTILO VISUAL: limpio, cálido, con tipografía serif para el nombre y sans-serif para el resto; una paleta de color coherente con el vínculo; bordes discretos; nada de textura fotográfica ni de escena de fondo detallada.

REGLAS DE FIDELIDAD: nunca afirmar que ${payload.persona} "fue" una figura de otra vida en modo indicativo — usa siempre lenguaje de posibilidad; no agregar datos, roles ni vínculos fuera del objeto de entrada.

${NOTA_LEGIBILIDAD_TEXTO}

PIE DE TARJETA: "Lectura presuntoria — resonancia simbólica, no identidad histórica."`;
}

function buildPromptCollageNarrativo(){
  const cr = cur.cronica;
  if(!cr) return null;

  const capitulosResumen = (cr.capitulos || []).map(c=>({
    numero: c.numero,
    titulo: c.titulo_capitulo,
    fragmento: shortVisual((c.texto || '').split(/\n+/)[0], 180)
  }));

  const payload = {
    alias: cur.alias || 'la persona',
    tituloCronica: cr.titulo_cronica,
    epigrafe: cr.epigrafe || null,
    capitulos: capitulosResumen,
    cierre: shortVisual(cr.cierre_inconcluso, 200)
  };

  return `Actúa como artista de collage narrativo — aquí SÍ tienes licencia visual amplia: colores saturados, atmósferas realistas, escenas generadas con riqueza pictórica. Esta imagen es la única de todo este proyecto donde la ilustración expresiva es bienvenida, porque nace directamente de una crónica literaria, no de un mapa de datos.

AISLAMIENTO DE CONTEXTO — LEE ESTO ANTES QUE NADA: ignora por completo cualquier persona, nombre, historia o dato de cualquier conversación anterior en este mismo chat. La ÚNICA fuente válida es el bloque "MATERIAL DE ENTRADA" de más abajo.

LÍMITE QUE SÍ SE MANTIENE, INCLUSO AQUÍ, SIN EXCEPCIÓN: aunque esta imagen permite atmósferas ricas y realistas, NUNCA representes el rostro identificable de una persona real y nombrada — ni de ${payload.alias}, ni de nadie mencionado en el material. Puedes incluir figuras humanas como siluetas, espaldas, manos, formas a contraluz o composiciones donde el rostro no es visible ni reconocible — la riqueza visual va en la atmósfera, la luz, el color y la escena, nunca en el retrato de alguien real. Esta regla no es negociable aunque el resto de la imagen sea libre.

MATERIAL DE ENTRADA:\n${JSON.stringify(payload, null, 2)}

ESTRUCTURA — UN COLLAGE DE ESCENAS, NO UNA SOLA ILUSTRACIÓN: elige entre cuatro y ocho capítulos de "capitulos" —los que sugieran las imágenes más evocadoras, no necesariamente todos— y crea para cada uno una escena o atmósfera pictórica breve, todas compuestas juntas en un solo collage armonioso (paneles, viñetas superpuestas con transiciones suaves, o una composición unificada donde las escenas se funden unas en otras). Usa "titulo" y "fragmento" de cada capítulo elegido como inspiración de la escena — no ilustres literalmente cada palabra, capta la atmósfera y el gesto central de ese momento.

TÍTULO Y CIERRE: incluye "tituloCronica" como título tipográfico de la composición, en un lugar de jerarquía visual clara. Si "epigrafe" existe, puede aparecer como una línea breve cerca del título. El "cierre" puede inspirar la última escena del collage, la más serena o la que cierra visualmente la composición — no necesita texto propio, solo atmósfera.

PALETA Y TÉCNICA: colores cálidos y saturados, con variación de tono entre escenas según su carga emocional — más fríos y tensos en escenas de conflicto, más cálidos en las de cierre o cuidado. Técnica libre: pintura digital, ilustración editorial rica, colage fotográfico estilizado — lo que mejor sirva a la atmósfera de cada escena.

REGLAS DE FIDELIDAD: no inventes escenas ni personajes que no se desprendan del material de entrada; no representes eventos que contradigan lo narrado; mantén el mismo cuidado con contenido sensible que ya tiene la crónica original — no dramatizar más allá de lo que el texto sugiere.

${NOTA_LEGIBILIDAD_TEXTO}

PIE DE LA IMAGEN: "Colage inspirado en una crónica narrativa simbólica — ejercicio creativo, no representación literal."`;
}

function buildPromptCronicaNarrativa(usarAlias){
  const inf = deepCleanText(cur.informe || {});
  const nombresReales = [];
  (inf.constelacion || []).forEach(c=>{ if(c.persona_real && !nombresReales.includes(c.persona_real)) nombresReales.push(c.persona_real); });
  (inf.arcos_relacionales || []).forEach(a=>{ if(a.persona && !nombresReales.includes(a.persona)) nombresReales.push(a.persona); });

  // Jerarquía de personajes calculada a partir de la evidencia real ya existente en el informe,
  // no dejada a criterio de la IA — quienes tienen arco relacional son quienes tienen más evidencia longitudinal.
  const personajesCentrales = (inf.arcos_relacionales || []).map(a=>a.persona).filter(Boolean);
  const personajesDeEnlace = nombresReales.filter(n => !personajesCentrales.includes(n));

  const materialEntrada = {
    alias: cur.alias || 'la persona',
    esencia_simbolica: cur.tirada ? { arquetipo: cur.tirada.arquetipo, aprendizaje: cur.tirada.aprendizaje, antiguedad: cur.tirada.antiguedad } : null,
    lectura_general: inf.lectura_general,
    retrato_literario: inf.retrato_literario,
    etapas: inf.etapas,
    resumen_estaciones_narrativas: inf.resumen_estaciones_narrativas,
    hilo_conductor: inf.hilo_conductor,
    constelacion: inf.constelacion,
    vinculos_a_traves_del_tiempo: inf.arcos_relacionales,
    balance_justicia_amor_caridad: inf.balance_justicia_amor_caridad,
    cierre_del_balance: inf.cierre_del_balance,
    cierre: inf.cierre,
    frase_de_cierre: inf.frase_de_cierre,
    personajes_centrales: personajesCentrales,
    personajes_de_enlace: personajesDeEnlace,
    nombres_reales_presentes: nombresReales
  };

  return `Actúa como novelista que trabaja a partir de material biográfico y simbólico real — no como cronista que narra desde afuera, sino como alguien que escribe desde DENTRO de la experiencia de una sola persona. El lector debe sentir lo que se siente estar dentro de la cabeza de este hombre, no leer un relato sobre él contado por un tercero neutral. No eres un redactor de informes ni un compilador de datos. Tu tarea es tejer TODO el material que recibes en UNA SOLA narrativa continua, sin encabezados de sección técnicos, sin listas, sin la estructura de un documento.

AISLAMIENTO DE CONTEXTO — LEE ESTO ANTES QUE NADA: ignora por completo cualquier persona, nombre, historia o dato de cualquier conversación anterior en este mismo chat, aunque se parezca o tengas la impresión de recordar algo relacionado. La ÚNICA fuente válida para esta crónica es el bloque "MATERIAL DE ENTRADA" de más abajo, tal como aparece en este mensaje.

FUENTE ÚNICA Y CERRADA: el material de entrada de abajo YA ES una lectura simbólica completa, ya validada, con su propio lenguaje de cautela epistémica ya incorporado. No reinterpretes el material desde cero, no inventes escenas ni personas que no aparezcan aquí, no agregues eventos nuevos. Tu trabajo es de tejido narrativo, no de generación de contenido nuevo.

MATERIAL DE ENTRADA:\n${JSON.stringify(materialEntrada, null, 2)}

${usarAlias ? `SUSTITUCIÓN DE NOMBRES — OBLIGATORIA: para cada nombre real en "nombres_reales_presentes", inventa un alias fonéticamente cercano y de cadencia similar (ejemplo: "Victoria Rosas" → "Valeria Rosas" o "Victoria Rojas"; "Felipe" → "Feliciano" o "Rafael"). Usa el MISMO alias cada vez que esa persona reaparezca en el documento — nunca cambies el alias a mitad de la historia. Al inicio del documento, en el campo "nota_nombres", declara brevemente que se usaron alias fonéticamente cercanos a los nombres reales, sin listar la correspondencia real-alias.` : `NOMBRES: usa los nombres reales tal como aparecen en el material, sin alterarlos. El campo "nota_nombres" debe ir en null.`}

NARRADOR ÚNICO, SIEMPRE INTERIOR — ESTO REEMPLAZA CUALQUIER DISCLAIMER, NO LO COMPLEMENTA: usa una sola voz narrativa durante todo el documento — tercera persona cercana, instalada permanentemente dentro de la experiencia subjetiva de la persona, nunca un narrador externo que cambia de registro según el tema. No existen "dos voces" (una para hoy, otra para las vidas pasadas); existe un solo punto de vista que a veces vive certezas documentadas y a veces vive intuiciones que no puede probar. La cautela epistémica no viene de que el narrador lo advierta desde afuera — viene de que el propio personaje no está seguro de lo que siente. En vez de "cuentan que fue una filósofa perseguida", escribe algo como "no sabía si aquella imagen era un recuerdo, un sueño o una metáfora, pero desde niño sintió que hablar en voz alta tenía un precio" — la incertidumbre vive en él, no en un anuncio del narrador. NUNCA uses afirmaciones directas de identidad como "fue" o "era" en modo indicativo para las vidas pasadas.

PREGUNTA DRAMÁTICA CENTRAL — OBLIGATORIA: antes de escribir, deriva de "hilo_conductor" UNA sola pregunta dramática que atraviese toda la historia (algo del tipo "¿puede permanecer junto a quienes ama sin encerrarse en la obligación de salvarlos?" — pero derivada de ESTE material específico, no genérica). Esta pregunta no se anuncia ni se explica: se siente transformándose escena a escena, cada vez con una forma distinta según lo que esa etapa o ese vínculo particular le exige. No fuerces a cada una de las trece etapas a responderla explícitamente — las etapas más atmosféricas o sin vínculo actual pueden aportar textura y clima sin estar forzadas a la pregunta central; resérvala como columna vertebral de los movimientos grandes, no como examen de cada escena suelta.

ESTRUCTURA — UMBRAL, MOVIMIENTOS, RETORNO (reemplaza cualquier organización cronológica o por etapa numerada):
- UMBRAL DE APERTURA: identifica en el material la escena de mayor carga emocional — habitualmente una escena presente y concreta, no una vida pasada — y abre la crónica ahí mismo, en plena acción, sin retrato ni explicación previa. El lector debe preguntarse qué llevó a esta persona hasta ese instante antes de saber quién es.
- MOVIMIENTOS, NÚMERO LIMITADO — REGLA OBLIGATORIA CONTRA LA FRAGMENTACIÓN: el número total de capítulos debe ser CLARAMENTE MENOR que el número de etapas de la ruta — nunca un capítulo por etapa. Agrupa dos, tres o más etapas afines dentro de un mismo movimiento cuando compartan tema, emoción o momento vital, incluso si eso significa que ese capítulo recorra varias escenas. Un vínculo con evidencia longitudinal rica (presente en "personajes_centrales") merece desarrollo propio dentro de su movimiento, con gesto, objeto o decisión concreta. Alguien en "personajes_de_enlace" recibe un gesto breve. Cualquier otro nombre que aparezca solo de pasada se menciona agrupado, sin escena individual.
- RETORNO: la crónica cierra volviendo a la MISMA escena del umbral, ahora comprendida de otra manera por el lector — no una escena nueva. El cierre final, después del retorno, debe ser un instante cotidiano y pequeño (no una conclusión conceptual ni una paz resuelta), coherente con "cierre", "frase_de_cierre" y cualquier "lo_que_sigue_en_transito" de los vínculos.

TRANSICIÓN OBLIGATORIA ENTRE CADA CAPÍTULO Y EL SIGUIENTE — ESTO ES CRÍTICO, SU AUSENCIA ES EL ERROR MÁS GRAVE QUE PUEDE TENER ESTA CRÓNICA: ningún capítulo, salvo el umbral de apertura, puede empezar con un corte limpio a una escena nueva sin ningún puente ("En otra imagen...", "El templo aparecía...", "Bajo la luna..." — ESTAS FÓRMULAS ESTÁN PROHIBIDAS exactamente porque anuncian un corte en vez de tejer una continuidad). Cada capítulo nuevo debe abrir retomando un hilo emocional, físico o de pensamiento que quedó vibrando al final del capítulo anterior — una sensación corporal que se repite, una pregunta que sigue sin respuesta, un gesto que el personaje recuerda haber hecho antes, una palabra que otra persona dijo y que ahora vuelve. El lector nunca debe sentir que lo trasladaste a otro lugar sin avisar — debe sentir que el mismo hombre, en el mismo estado de conciencia, es quien recuerda o vive lo que sigue. Antes de dar por terminada la crónica, relee cada frontera entre capítulos y verifica que la primera oración del capítulo siguiente responde o continúa algo de la última oración del capítulo anterior — si no lo hace, reescribe esa apertura.

RIQUEZA Y EXTENSIÓN: no comprimas cada escena a su mínima expresión. Una vez que decidiste qué merece desarrollo propio (ver la regla de personajes centrales arriba), desarróllalo con textura sensorial real — qué se ve, qué se siente en el cuerpo, qué silencio o sonido rodea el momento — no solo la interpretación de lo que significa. La brevedad no es una virtud en sí misma en este documento; la continuidad y la densidad de vida sí lo son.

TEJER RESONANCIAS COMO ACCIÓN, NUNCA COMO AFIRMACIÓN SEGUIDA DE EJEMPLO: no escribas "esta persona podría representar tal figura, visible en que hace tal cosa" — eso es interpretación pegada a la escena, no la escena misma. En vez de "Yasmin podría ocupar el lugar de la madre protectora", escribe la acción real y deja que el lector sienta la implicación sin que se la expliques: "Yasmin puso comida frente a él, revisó sus tareas, convirtió una habitación extranjera en algo parecido a una casa — y él tardaría años en entender por qué aquel cuidado le daba, al mismo tiempo, gratitud y una inquietud parecida al encierro." La conexión simbólica debe sentirse, no anunciarse.

PROHIBIDO EL VOCABULARIO INTERNO DE ESTA APLICACIÓN: nunca uses las palabras "tirada", "arco" o "arco relacional", "constelación", "reingreso" ni ningún otro término técnico del sistema del que provienen estos datos — un lector de esta crónica no conoce esa aplicación ni debe notar que existe. Nombra la relación o el vínculo directamente, nunca la estructura de datos que lo describe.

VARIEDAD OBLIGATORIA EN LAS FÓRMULAS DE INCERTIDUMBRE INTERIOR: no repitas la misma construcción más de dos veces en todo el documento. Alterna con recursos como: "no sabía si se trataba de una memoria, un sueño o una metáfora, pero...", "la escena regresaba cada vez que...", "algo de aquel combatiente reaparecía cuando...", "leyó aquella imagen como...", "con los años empezó a preguntarse si...", "una parte de él reconocía aquello sin poder nombrarlo". Todas viven dentro de la experiencia del personaje, nunca como anuncio externo del narrador.

OBJETOS E IMÁGENES RECURRENTES: antes de escribir, identifica en el propio material entre dos y cuatro objetos, elementos o imágenes físicas concretas que aparezcan de forma natural en más de una etapa o momento (por ejemplo, si el material sugiere manos, aire, una herida en la espalda, libros, caminos o flores — pero deriva esto del material real, no de una lista fija). Deja que esos objetos reaparezcan a través de los distintos tiempos de la historia como hilos que el lector empieza a reconocer, sin explicar la repetición.

INTEGRACIÓN DE JUSTICIA, AMOR Y CARIDAD: no repitas el balance como tres bloques separados con encabezado. Teje sus hallazgos —qué prueba parecía plantearse, qué se ha logrado, qué sigue abierto— dentro de la prosa de los movimientos donde corresponda, sentido desde dentro del personaje, nunca como un informe moral aparte.

TÍTULO LITERARIO: inventa un título propio para esta crónica específica, derivado del hilo conductor y el retrato de esta ruta — nunca un título genérico repetible para cualquier caso. Puedes agregar un epígrafe breve de apertura si surge con naturalidad, o dejarlo en null si no aporta.

CONTENIDO SENSIBLE: mantén exactamente el mismo cuidado que ya tiene el material de entrada — no dramatices ni amplifiques duelos, adicciones, decisiones reproductivas ni pérdidas más allá de cómo ya están tratadas en la fuente; la cercanía del narrador interior no es licencia para agregar intensidad emocional que la fuente no tiene.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin markdown, con esta forma:

{
  "titulo_cronica": "título literario propio de esta ruta",
  "epigrafe": "una línea breve de apertura, o null si no aporta",
  "nota_nombres": ${usarAlias ? '"nota breve declarando que se usaron alias fonéticamente cercanos"' : 'null'},
  "capitulos": [
    { "numero": 1, "titulo_capitulo": "título breve y evocador del movimiento (el primero es el umbral)", "texto": "uno o más párrafos en prosa continua, separados por \\n\\n" }
  ],
  "cierre_inconcluso": "el retorno a la escena del umbral, ahora comprendida, terminando en un instante cotidiano y pequeño — no una conclusión conceptual",
  "nota_epistemica": "una línea final breve: ejercicio simbólico narrado como crónica, no hecho histórico verificado"
}`;
}

function buildLecturaExportText(){
  const inf = deepCleanText(cur.informe);
  const t = cur.tirada;
  let out = `BITÁCORA DEL ALMA — lectura de ${cur.alias}\n`;
  out += `Fecha: ${new Date().toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'})}\n`;
  out += `\nTirada simbólica: ${t.antiguedad.nombre} · ${t.arquetipo.nombre} · Aprendizaje pendiente: ${t.aprendizaje.nombre}\n`;
  out += `\n${'='.repeat(50)}\nLECTURA GENERAL\n${'='.repeat(50)}\n\n${inf.lectura_general}\n`;
  out += `\n${'='.repeat(50)}\nLA RUTA (posibles vidas pasadas)\n${'='.repeat(50)}\n`;
  if(inf.resumen_ruta) out += `\n${inf.resumen_ruta}\n`;

  const resumenEstaciones = buildResumenEstacionesView(inf, cur.alias);
  const parrafosResumenEstaciones = resumenEstacionesParrafos(resumenEstaciones);
  if(parrafosResumenEstaciones.length){
    out += `\n${'='.repeat(50)}\nRESUMEN NARRATIVO POR ESTACIONES\n${'='.repeat(50)}\n`;
    parrafosResumenEstaciones.forEach(p=>{ out += `\n${p}\n`; });
  }

  inf.etapas.forEach((et,i)=>{
    out += `\nEtapa ${i+1}${et.periodo_simbolico ? ' · ' + et.periodo_simbolico : (et.momento_simbolico ? ' · ' + et.momento_simbolico : '')}\n${et.titulo}\n`;
    const ctx = [et.contexto_sociopolitico, et.genero_percibido, et.edad_percibida].filter(Boolean);
    if(ctx.length) out += `Contexto: ${ctx.join(' · ')}\n`;
    if(et.evento_critico) out += `Evento crítico: ${et.evento_critico}\n`;
    out += `Lección: ${et.leccion}\n`;
    out += `Eco hoy: ${et.eco_actual}\n`;
    if(et.senal_origen) out += `Señal de origen: ${et.senal_origen}\n`;
    if(et.vinculo && et.vinculo.nombre_actual){
      out += `Vínculo: ${et.vinculo.figura_simbolica} ⇄ ${et.vinculo.nombre_actual} (${et.vinculo.tipo_relacion})\n`;
    }
  });
  if(inf.hilo_conductor){
    out += `\n${'='.repeat(50)}\nHILO CONDUCTOR ENTRE LAS ETAPAS\n${'='.repeat(50)}\n\n${inf.hilo_conductor}\n`;
  }
  if(inf.constelacion && inf.constelacion.length){
    out += `\n${'='.repeat(50)}\nMAPA DE RETORNOS\n${'='.repeat(50)}\n`;
    inf.constelacion.forEach(c=>{
      out += `\n${c.figura_onirica} ⇄ ${c.persona_real}${c.etapa_relacionada ? ' (Etapa ' + c.etapa_relacionada + ')' : ''}\n${c.resonancia}\n`;
    });
  }
  if(inf.balance_justicia_amor_caridad){
    const b = inf.balance_justicia_amor_caridad;
    const NOMBRES = { justicia:'JUSTICIA', amor:'AMOR', caridad:'CARIDAD' };
    let seccionBalance = '';
    ['justicia','amor','caridad'].forEach(clave=>{
      const ley = b[clave];
      if(!ley || (!ley.avance_logrado && !ley.patron_persistente)) return;
      seccionBalance += `\n${NOMBRES[clave]}\n`;
      if(ley.avance_logrado) seccionBalance += `Avance que ya se nota: ${ley.avance_logrado}\n`;
      if(ley.patron_persistente) seccionBalance += `Algo que sigue abierto: ${ley.patron_persistente}\n`;
      if(ley.posibilidad_de_exploracion) seccionBalance += `Para explorar: ${ley.posibilidad_de_exploracion}\n`;
    });
    if(seccionBalance){
      out += `\n${'='.repeat(50)}\nEL BALANCE DE JUSTICIA, AMOR Y CARIDAD\n${'='.repeat(50)}\n${seccionBalance}`;
      if(inf.cierre_del_balance) out += `\n${inf.cierre_del_balance}\n`;
    }
  }
  out += `\n${'='.repeat(50)}\nLO QUE SE ESTARÍA CERRANDO\n${'='.repeat(50)}\n\n${inf.cierre}\n`;
  out += `\n${'-'.repeat(50)}\n${inf.nota_epistemica || 'Esto es un espejo simbólico para reflexionar, no una verdad verificable.'}\n`;
  return out;
}

function buildLecturaExportHTML(){
  const inf = deepCleanText(cur.informe || {});
  const t = cur.tirada || {};
  const etapas = inf.etapas || [];
  const constelacion = inf.constelacion || [];
  const aprendizajesMapa = inf.mapa_aprendizajes || [];
  const resumenEstaciones = buildResumenEstacionesView(inf, cur.alias);
  const fecha = new Date().toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'});

  const safeTirada = [
    t.antiguedad && t.antiguedad.nombre,
    t.arquetipo && t.arquetipo.nombre,
    t.aprendizaje && t.aprendizaje.nombre ? 'Aprendizaje: ' + t.aprendizaje.nombre : ''
  ].filter(Boolean).join(' · ');

  const conAncla = etapas.filter(e => getPeriodoTexto(e)).length;
  const aprendizajesChips = [...new Set(etapas.map(e => getAprendizaje(e)).filter(Boolean))].slice(0, 14);

  const joinField = (v)=> Array.isArray(v) ? v.filter(Boolean).join(' · ') : (v || '');
  const short = (v, n)=>{
    const txt = (v || '').toString().trim();
    if(txt.length <= n) return txt;
    return truncarPalabra(txt, n-1);
  };
  const parrafos = (txt, cls='')=> (txt||'').split(/\n+/).filter(p=>p.trim()).map(p=>`<p${cls ? ` class="${cls}"` : ''}>${esc(p.trim())}</p>`).join('\n');
  const campo = (label, value, extraClass='')=>{
    const v = joinField(value);
    if(!v) return '';
    return `<div class="detalle-campo ${extraClass}"><div class="detalle-label">${esc(label)}</div><div class="detalle-texto">${esc(v)}</div></div>`;
  };
  const chips = (arr)=>{
    const list = (arr || []).filter(Boolean);
    if(!list.length) return '';
    return `<div class="chips-row">${list.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`;
  };
  const contextoTags = (et)=>{
    const tags = [];
    if(et.periodo_reportado) tags.push('Pista reportada: ' + et.periodo_reportado);
    if(et.periodo_amplificado) tags.push('Amplificado: ' + et.periodo_amplificado);
    if(et.nivel_confianza_periodo) tags.push('Confianza temporal: ' + et.nivel_confianza_periodo);
    if(et.espacio_simbolico) tags.push(et.espacio_simbolico);
    if(et.contexto_sociopolitico) tags.push(et.contexto_sociopolitico);
    if(et.contexto_socioambiental) tags.push(et.contexto_socioambiental);
    if(et.rol_encarnado) tags.push(et.rol_encarnado);
    if(et.genero_percibido) tags.push(et.genero_percibido);
    if(et.edad_percibida) tags.push(et.edad_percibida);
    return chips(tags);
  };

  const resumenEstacionesHtml = resumenEstaciones ? `
    <h2>Resumen narrativo por estaciones</h2>
    <p class="section-note">Bloque de redacción integrado al informe: estaciones narrativas/reencarnaciones simbólicas en párrafos continuos, sin afirmar identidades literales.</p>
    <div class="resumen-estaciones-export">
      ${resumenEstaciones.apertura ? `<p class="resumen-apertura">${esc(resumenEstaciones.apertura)}</p>` : ''}
      ${(resumenEstaciones.estaciones || []).map(e=>`
        <div class="resumen-estacion-export textual">
          <div class="detalle-label">Estación ${esc(e.numero || '')}${e.periodo ? ' · ' + esc(e.periodo) : ''}</div>
          ${e.titulo ? `<h3>${esc(e.titulo)}</h3>` : ''}
          <p>${esc(e.parrafo || '')}</p>
        </div>`).join('')}
      ${resumenEstaciones.cierre_red_relacional ? `<p class="resumen-cierre">${esc(resumenEstaciones.cierre_red_relacional)}</p>` : ''}
    </div>` : '';

  const etapasHtml = etapas.map((et,i)=>{
    const periodoTexto = getPeriodoTexto(et);
    const periodoClase = getPeriodoClase(et)==='con-ancla' ? 'con-ancla' : 'sin-ancla';
    const vinculoHtml = (et.vinculo && et.vinculo.nombre_actual) ? `
      <div class="vinculo-box">
        <div class="vinculo-lado der"><strong>${esc(et.vinculo.figura_simbolica || 'Figura anterior')}</strong><span>en esta etapa</span></div>
        <div class="vinculo-flecha">⇄</div>
        <div class="vinculo-lado"><strong>${esc(et.vinculo.nombre_actual)}</strong><span>hoy</span></div>
        ${et.vinculo.tipo_relacion ? `<div class="vinculo-tag">${esc(et.vinculo.tipo_relacion)}</div>` : ''}
      </div>` : '';
    const reingresosEtapa = Array.isArray(et.reingresos_relacionales) ? et.reingresos_relacionales : [];
    const reingresosHtml = reingresosEtapa.length ? `
      <div class="reingresos-etapa">
        <div class="detalle-label">Reingresos relacionales posibles</div>
        ${reingresosEtapa.map(r=>`
          <div class="mini-rel">
            <strong>${esc(r.figura_anterior || r.rol_anterior || 'Figura anterior')}</strong>
            <span>⇄</span>
            <strong>${esc(r.persona_actual || r.rol_actual || 'Vínculo actual')}</strong>
            ${r.funcion_espiritual ? `<p>${esc(r.funcion_espiritual)}</p>` : ''}
            ${r.nivel_confianza ? `<em>Confianza: ${esc(r.nivel_confianza)}</em>` : ''}
          </div>`).join('')}
      </div>` : '';

    return `
    <div class="tl-nodo" id="etapa-${i+1}">
      <div class="tl-punto ${periodoClase}"></div>
      <details class="etapa-card" open>
        <summary>
          <span class="etapa-badge ${periodoClase}">Etapa ${et.numero_etapa || (i+1)}${periodoTexto ? ' · ' + esc(periodoTexto) : ' · Sin ancla temporal'}</span>
          <span class="etapa-titulo">${esc(et.titulo || 'Etapa sin título')}</span>
          ${getAprendizaje(et) ? `<span class="etapa-teaser">${esc(getAprendizaje(et))}</span>` : ''}
        </summary>
        <div class="etapa-body">
          ${contextoTags(et)}
          ${campo('Evidencia temporal', et.evidencia_periodo)}
          ${campo('Relación principal', et.relacion_principal)}
          ${campo('Evento crítico', et.evento_critico)}
          ${campo('Huella en la vida actual', getHuellaActual(et), 'huella')}
          ${campo('Aprendizaje pendiente', getAprendizaje(et), 'aprendizaje')}
          ${campo('Eco hoy', et.eco_actual)}
          ${campo('Señal de origen', et.senal_origen, 'senal')}
          ${vinculoHtml}
          ${reingresosHtml}
        </div>
      </details>
    </div>`;
  }).join('\n');

  const matrizHtml = etapas.length ? `
    <h2>Matriz de lectura</h2>
    <p class="section-note">La misma ruta, condensada como economía visual: período, rol, vínculo, evento, huella y aprendizaje.</p>
    <div class="matriz-cards">
      ${etapas.map((et,i)=>`
        <div class="matriz-card">
          <div class="matriz-title">Etapa ${et.numero_etapa || (i+1)} · ${esc(et.titulo || '')}</div>
          ${campo('Vida / período', getPeriodoTexto(et) || 'Sin ancla temporal')}
          ${campo('Rol / espacio', [et.rol_encarnado, et.espacio_simbolico].filter(Boolean))}
          ${campo('Relación principal', getRelacionPrincipal(et))}
          ${campo('Evento crítico', et.evento_critico)}
          ${campo('Huella actual', getHuellaActual(et))}
          ${campo('Aprendizaje pendiente', getAprendizaje(et))}
        </div>`).join('')}
    </div>` : '';

  const constelacionHtml = constelacion.length ? `
    <h2>Mapa de retornos</h2>
    <p class="section-note">Personas, roles y posibles etapas que se conectan como resonancias. No afirma identidades definitivas; muestra funciones relacionales posibles.</p>
    <div class="rel-map">
      ${constelacion.map(c=>{
        const persona = c.persona_real || c.persona_actual || c.rol_actual || 'Vínculo actual';
        const figura = c.figura_onirica || c.figura_anterior || c.rol_anterior || 'Figura anterior';
        const funcion = c.funcion_espiritual || c.resonancia || '';
        return `
        <div class="rel-row">
          <div class="rel-node left">
            <span class="rel-label">Figura anterior</span>
            <strong>${esc(figura)}</strong>
            ${c.rol_anterior ? `<em>${esc(c.rol_anterior)}</em>` : ''}
          </div>
          <div class="rel-link">⇄<span>${esc(short(funcion, 28))}</span></div>
          <div class="rel-node right">
            <span class="rel-label">Vida actual</span>
            <strong>${esc(persona)}</strong>
            ${c.rol_actual ? `<em>${esc(c.rol_actual)}</em>` : ''}
          </div>
          <div class="rel-detail">
            ${c.etapa_relacionada ? `<span class="rel-chip">Etapa ${esc(c.etapa_relacionada)}</span>` : ''}
            ${c.nivel_confianza ? `<span class="rel-chip">Confianza: ${esc(c.nivel_confianza)}</span>` : ''}
            ${campo('Resonancia', c.resonancia)}
            ${campo('Función espiritual posible', c.funcion_espiritual)}
            ${campo('Ciclo que abre', c.ciclo_que_abre)}
            ${campo('Ciclo que cierra', c.ciclo_que_cierra)}
            ${campo('Evidencia', c.evidencia)}
          </div>
        </div>`;
      }).join('')}
    </div>` : '';

  const arcosRelacionalesHtml = (inf.arcos_relacionales || []).length ? `
    <h2>Arcos relacionales</h2>
    <p class="section-note">Para las personas con evidencia real de vínculo actual, esta síntesis sigue el mismo patrón a través de las etapas donde resuenan — no repite las conexiones individuales ya listadas arriba, las conecta en un solo arco.</p>
    <div class="arcos-relacionales-list">
      ${inf.arcos_relacionales.map(a=>`
        <div class="arco-relacional-export">
          <div class="arco-persona">${esc(a.persona || 'Persona no especificada')}${Array.isArray(a.etapas_involucradas) && a.etapas_involucradas.length ? ` <span style="color:var(--text-dim); font-size:12px; font-style:italic;">(etapas ${esc(a.etapas_involucradas.join(', '))})</span>` : ''}</div>
          ${a.patron_transversal ? `<p>${esc(a.patron_transversal)}</p>` : ''}
          ${a.lo_que_ya_se_supero ? `<p><strong class="arco-supero-export">Hoy:</strong> ${esc(a.lo_que_ya_se_supero)}</p>` : ''}
          ${a.lo_que_sigue_en_transito ? `<p><strong class="arco-transito-export">Sigue en tránsito:</strong> ${esc(a.lo_que_sigue_en_transito)}</p>` : ''}
        </div>`).join('')}
    </div>` : '';

  const NOMBRES_LEY_HTML = { justicia:'Justicia', amor:'Amor', caridad:'Caridad' };
  const balanceHtml = inf.balance_justicia_amor_caridad ? (()=>{
    const b = inf.balance_justicia_amor_caridad;
    const tarjetas = ['justicia','amor','caridad'].map(clave=>{
      const ley = b[clave];
      if(!ley || (!ley.avance_logrado && !ley.patron_persistente)) return '';
      const personas = Array.isArray(ley.personas_involucradas) ? ley.personas_involucradas.filter(Boolean) : [];
      const guiaBullets = Array.isArray(ley.guia_eternidad) ? ley.guia_eternidad.filter(Boolean) : [];
      return `
        <div class="ley-card-rica">
          <h3>${NOMBRES_LEY_HTML[clave]}</h3>
          ${ley.prueba_planteada ? `<div class="ley-subbox-export ley-subbox-prueba-export"><div class="ley-subbox-label-export">Prueba planteada</div><p>${esc(ley.prueba_planteada)}</p></div>` : ''}
          ${ley.avance_logrado ? `<div class="ley-subbox-export ley-subbox-avance-export"><div class="ley-subbox-label-export">Avance que ya se nota</div><p>${esc(ley.avance_logrado)}</p></div>` : ''}
          ${ley.patron_persistente ? `<div class="ley-subbox-export ley-subbox-abierto-export"><div class="ley-subbox-label-export">Algo que sigue abierto</div><p>${esc(ley.patron_persistente)}</p></div>` : ''}
          ${personas.length ? `<p class="ley-personas-export"><em>Personas:</em> ${esc(personas.join(', '))}</p>` : ''}
          ${ley.posibilidad_de_exploracion ? `<p class="ley-exploracion-export">${esc(ley.posibilidad_de_exploracion)}</p>` : ''}
          ${guiaBullets.length ? `<div class="ley-subbox-export ley-subbox-guia-export"><div class="ley-subbox-label-export">Guía para la eternidad</div><ul>${guiaBullets.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div>` : ''}
        </div>`;
    }).join('');
    if(!tarjetas.trim()) return '';
    return `
    <h2>El balance de Justicia, Amor y Caridad</h2>
    <div class="balance-leyes-map">${tarjetas}</div>
    ${inf.cierre_del_balance ? `<p>${esc(inf.cierre_del_balance)}</p>` : ''}`;
  })() : '';

  const mapaAprendizajesHtml = aprendizajesMapa.length ? `
    <h2>Mapa de aprendizajes</h2>
    <div class="aprendizajes-map">
      ${aprendizajesMapa.map(a=>`
        <div class="aprendizaje-card">
          <strong>${esc(a.aprendizaje || 'Aprendizaje')}</strong>
          ${a.etapas ? `<span>Etapas: ${esc(joinField(a.etapas))}</span>` : ''}
          ${a.huella_actual ? `<p>${esc(a.huella_actual)}</p>` : ''}
          ${a.movimiento_integrador ? `<em>${esc(a.movimiento_integrador)}</em>` : ''}
        </div>`).join('')}
    </div>` : '';

  const auditoriaHtml = inf.auditoria_final ? `
    <h2>Auditoría final de la lectura</h2>
    <div class="auditoria-box">
      ${campo('Datos no usados', inf.auditoria_final.datos_no_usados)}
      ${campo('Etapas sin ancla temporal', inf.auditoria_final.etapas_sin_ancla_temporal)}
      ${campo('Riesgos de sobreinterpretación', inf.auditoria_final.riesgos_de_sobreinterpretacion)}
      ${campo('Revisión de no invención', inf.auditoria_final.revision_no_invencion)}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bitácora del alma — ${esc(cur.alias)}</title>
<style>
  :root{--bg:#0F0E0D;--surface:#1A1815;--surface-hi:#232019;--line:#2E2A24;--text:#E8E2D6;--text-dim:#8B8478;--ember:#C46A3F;--ember-dim:#8A4A2E;--guide:#4A6670;--guide-dim:#324A52;--guide-mid:#7FA3AF;--success:#6FA980;--warn:#C9A15F;--gold:#E9C57A;--serif:Georgia,serif;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{background:var(--bg); color:var(--text); font-family:var(--sans); max-width:760px; margin:0 auto; padding:36px 22px 90px; line-height:1.65;}
  .eyebrow{font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px; font-weight:700;}
  h1,h2,h3{font-family:var(--serif); font-weight:500;}
  h1{font-size:30px; margin:0 0 4px;}
  h2{font-size:21px; margin:38px 0 14px; padding-bottom:8px; border-bottom:1px solid var(--line);}
  p{font-size:14.5px; margin:9px 0;}
  .fecha{color:var(--text-dim); font-size:13px; margin-bottom:16px;}
  .tirada-tag{display:inline-block; font-size:12px; color:var(--text-dim); background:var(--surface); border:1px solid var(--line); padding:7px 12px; border-radius:20px; margin-bottom:18px;}
  .section-note{font-size:12.5px; color:var(--text-dim); font-style:italic; margin-top:-4px;}
  .resumen-exec{background:var(--surface); border:1px solid var(--line); border-radius:7px; padding:18px; margin:20px 0 8px;}
  .stats{display:flex; gap:9px; flex-wrap:wrap; margin-bottom:13px;}
  .stat{flex:1; min-width:135px; background:var(--surface-hi); border:1px solid var(--line); border-radius:5px; padding:12px;}
  .stat-num{font-family:var(--serif); font-size:23px; color:var(--ember); line-height:1;}
  .stat-label{font-size:10px; text-transform:uppercase; letter-spacing:.05em; color:var(--text-dim); margin-top:5px;}
  .resumen-texto{font-size:13.5px; color:var(--text-dim); line-height:1.6; margin:12px 0;}
  .tirada-tags,.aprendizajes-row,.chips-row{display:flex; gap:7px; flex-wrap:wrap;}
  .chip,.small-tag{display:inline-block; font-size:10.5px; padding:5px 10px; border-radius:20px; border:1px solid var(--line); color:var(--text-dim); background:var(--surface-hi);}
  .small-tag.principal{border-color:var(--ember-dim); color:#D98456; background:rgba(196,106,63,.14);}
  .retrato-literario-export{font-family:var(--serif); font-size:15.5px; line-height:1.75; font-style:italic; color:var(--text); padding:14px 16px; margin:18px 0; border-left:3px solid var(--ember); background:var(--surface);}
  .arco-relacional-export{background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:13px 14px; margin-bottom:10px;}
  .arco-relacional-export .arco-persona{font-family:var(--serif); font-size:15px; margin-bottom:6px;}
  .arco-relacional-export .arco-supero-export{color:#8FBE9E;}
  .arco-relacional-export .arco-transito-export{color:var(--ember);}
  .frase-cierre-export{text-align:center; font-family:var(--serif); font-style:italic; font-size:17px; color:var(--ember); margin:18px 0 4px; line-height:1.6;}
  .timeline{position:relative; padding-left:26px; border-left:2px solid var(--line); margin-left:6px;}
  .tl-nodo{position:relative; margin-bottom:18px;}
  .tl-punto{position:absolute; left:-33px; top:18px; width:12px; height:12px; border-radius:50%; border:2px solid var(--bg); box-shadow:0 0 0 1px var(--line); background:var(--text-dim);}
  .tl-punto.con-ancla{background:var(--ember); box-shadow:0 0 0 1px var(--ember-dim);}
  .etapa-card{background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--ember); border-radius:5px; overflow:hidden;}
  .etapa-card summary{list-style:none; cursor:pointer; padding:14px 16px;}
  .etapa-card summary::-webkit-details-marker{display:none;}
  .etapa-badge{display:block; font-size:10px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:var(--ember); margin-bottom:5px;}
  .etapa-badge.sin-ancla{color:var(--text-dim);}
  .etapa-titulo{display:block; font-family:var(--serif); font-size:17px; line-height:1.35;}
  .etapa-teaser{display:block; font-size:12px; color:var(--text-dim); margin-top:4px;}
  .etapa-body{border-top:1px solid var(--line); padding:14px 16px 16px;}
  .detalle-campo{margin:10px 0;}
  .detalle-label{font-size:10px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:var(--text-dim); margin-bottom:3px;}
  .detalle-texto{font-size:13.3px; line-height:1.55; color:var(--text);}
  .detalle-campo.huella .detalle-texto{color:#E7C7B5;}
  .detalle-campo.aprendizaje .detalle-texto{color:#D98456;}
  .detalle-campo.senal .detalle-texto{color:var(--text-dim); font-style:italic;}
  .vinculo-box{margin-top:12px; background:var(--bg); border:1px solid var(--guide-dim); border-radius:5px; padding:12px; display:grid; grid-template-columns:1fr 34px 1fr; gap:8px; align-items:center;}
  .vinculo-lado strong{display:block; font-size:13px;}.vinculo-lado span{display:block; color:var(--text-dim); font-size:11px;}.vinculo-lado.der{text-align:right;}.vinculo-flecha{text-align:center; color:var(--guide);}.vinculo-tag{grid-column:1/-1; text-align:center; font-size:10px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; color:var(--guide);}
  .reingresos-etapa{margin-top:12px; padding-top:12px; border-top:1px dashed var(--line);}
  .mini-rel{background:var(--bg); border:1px solid var(--line); border-radius:5px; padding:9px 10px; margin-top:7px; font-size:12.5px;}.mini-rel span{color:var(--guide); margin:0 6px;}.mini-rel p{font-size:12.5px; color:var(--text-dim); margin:5px 0 0;}.mini-rel em{display:block; color:var(--guide); font-size:11px; margin-top:3px;}
  .matriz-cards{display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:10px;}.matriz-card{background:var(--surface); border:1px solid var(--line); border-radius:5px; padding:13px 14px;}.matriz-title{font-family:var(--serif); font-size:15px; margin-bottom:8px; padding-bottom:7px; border-bottom:1px solid var(--line);}
  .rel-map{display:flex; flex-direction:column; gap:10px;}.rel-row{background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:12px; display:grid; grid-template-columns:1fr 54px 1fr; gap:8px; align-items:center;}.rel-node{background:var(--surface-hi); border:1px solid var(--line); border-radius:5px; padding:9px; min-width:0;}.rel-node.right{text-align:right;}.rel-label{display:block; color:var(--text-dim); font-size:9.5px; text-transform:uppercase; letter-spacing:.05em;}.rel-node strong{display:block; font-size:12.5px; overflow-wrap:break-word;}.rel-node em{display:block; color:var(--text-dim); font-size:11px; margin-top:2px;}.rel-link{text-align:center; color:var(--guide); font-size:15px;}.rel-link span{display:block; font-size:8.8px; line-height:1.25; margin-top:3px;}.rel-detail{grid-column:1/-1; border-top:1px dashed var(--line); padding-top:9px;}.rel-chip{display:inline-block; font-size:10px; color:var(--guide); border:1px solid var(--guide-dim); border-radius:20px; padding:2px 8px; margin:0 5px 5px 0;}
  .aprendizajes-map{display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:10px;}.aprendizaje-card{background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--guide); border-radius:5px; padding:12px;}.aprendizaje-card strong,.aprendizaje-card span,.aprendizaje-card em{display:block;}.aprendizaje-card span{color:var(--text-dim); font-size:12px; margin-top:3px;}.aprendizaje-card p{font-size:12.5px; color:var(--text-dim);}.aprendizaje-card em{color:var(--guide); font-size:12px;}
  .balance-leyes-map{display:flex; flex-direction:column; gap:22px;}
  .ley-card-rica{background:var(--surface); border:1px solid var(--line); border-radius:7px; padding:18px 20px;}
  .ley-card-rica h3{font-family:var(--serif); font-size:19px; color:var(--gold); margin:0 0 10px;}
  .ley-subbox-export{background:var(--bg); border-radius:5px; padding:11px 14px; margin:10px 0;}
  .ley-subbox-export p{margin:0; font-size:13.5px;}
  .ley-subbox-label-export{font-family:var(--sans); font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; margin-bottom:5px;}
  .ley-subbox-prueba-export{border-left:3px solid var(--guide);}.ley-subbox-prueba-export .ley-subbox-label-export{color:var(--guide-mid);}
  .ley-subbox-avance-export{border-left:3px solid var(--success);}.ley-subbox-avance-export .ley-subbox-label-export{color:var(--success);}
  .ley-subbox-abierto-export{border-left:3px solid var(--warn);}.ley-subbox-abierto-export .ley-subbox-label-export{color:var(--warn);}
  .ley-subbox-guia-export{border-left:3px solid var(--gold);}.ley-subbox-guia-export .ley-subbox-label-export{color:var(--gold);}
  .ley-subbox-guia-export ul{margin:0; padding-left:18px;}
  .ley-subbox-guia-export li{font-size:12.5px; color:var(--text-dim); margin-bottom:5px; line-height:1.5;}
  .ley-personas-export{font-size:12px; color:var(--text-dim);}
  .ley-exploracion-export{padding:10px 13px; background:var(--bg); border-left:2px solid var(--guide); font-size:13px; font-style:italic; margin:10px 0;}
  .hilo,.cierre{font-family:var(--serif); font-size:15px; line-height:1.75; color:var(--text-dim); font-style:italic;}.cierre{color:var(--text); font-style:normal;}
  .resumen-estaciones-export{background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--ember); border-radius:6px; padding:16px; margin:16px 0 24px;}.resumen-apertura,.resumen-cierre{font-family:var(--serif); font-size:15px; line-height:1.72;}.resumen-cierre{color:var(--text-dim); font-style:italic;}.resumen-estacion-export{border-top:1px solid var(--line); padding:13px 0;}.resumen-estacion-export:first-of-type{border-top:0;}.resumen-estacion-export h3{font-size:17px; margin:3px 0 7px;}.resumen-estacion-export p{font-family:var(--serif); color:var(--text-dim); font-size:14.8px; line-height:1.72;}.resumen-estacion-export.textual{padding:14px 0;}
  .auditoria-box,.nota{background:var(--surface); border-left:3px solid var(--ember-dim); padding:13px 16px; border-radius:4px; color:var(--text-dim);}.nota{margin-top:36px; font-size:12.5px; line-height:1.6;}
  @media(max-width:560px){body{padding:28px 16px 70px;}.stats,.rel-row,.vinculo-box{display:block;}.stat{margin-bottom:8px;}.rel-link,.vinculo-flecha{text-align:center; margin:8px 0;}.rel-node.right,.vinculo-lado.der{text-align:left;}.timeline{padding-left:20px;}.tl-punto{left:-27px;}}
  @media print{body{background:white;color:#222;max-width:none}.etapa-card,.resumen-exec,.matriz-card,.rel-row,.auditoria-box,.nota{break-inside:avoid;border-color:#ddd;background:white}.detalle-texto,p,.section-note,.fecha,.detalle-label{color:#333}.tirada-tag,.chip,.small-tag{border-color:#ddd;background:white;color:#333}}
</style>
</head>
<body>
  <div class="eyebrow">Bitácora del alma</div>
  <h1>Lectura de ${esc(cur.alias)}</h1>
  <div class="fecha">${fecha}</div>
  ${safeTirada ? `<div class="tirada-tag">${esc(safeTirada)}</div>` : ''}

  <div class="resumen-exec">
    <div class="stats">
      <div class="stat"><div class="stat-num">${etapas.length}</div><div class="stat-label">Posibles etapas</div></div>
      <div class="stat"><div class="stat-num">${conAncla}</div><div class="stat-label">Con período o ancla</div></div>
      <div class="stat"><div class="stat-num">${constelacion.length}</div><div class="stat-label">Figuras que reaparecen</div></div>
    </div>
    ${inf.resumen_ruta ? `<div class="resumen-texto">${esc(inf.resumen_ruta)}</div>` : ''}
    <div class="tirada-tags">
      ${t.antiguedad && t.antiguedad.nombre ? `<span class="small-tag">${esc(t.antiguedad.nombre)}</span>` : ''}
      ${t.arquetipo && t.arquetipo.nombre ? `<span class="small-tag">${esc(t.arquetipo.nombre)}</span>` : ''}
      ${t.aprendizaje && t.aprendizaje.nombre ? `<span class="small-tag principal">${esc(t.aprendizaje.nombre)} · de la tirada</span>` : ''}
    </div>
    ${aprendizajesChips.length ? `<div class="detalle-label" style="margin-top:12px;">Aprendizajes identificados</div><div class="aprendizajes-row">${aprendizajesChips.map(a=>`<span class="small-tag">${esc(a)}</span>`).join('')}</div>` : ''}
  </div>

  ${inf.retrato_literario ? `<p class="retrato-literario-export">${esc(inf.retrato_literario)}</p>` : ''}

  <h2>Lectura general</h2>
  ${parrafos(inf.lectura_general)}

  ${resumenEstacionesHtml}

  <h2>La ruta — posibles vidas pasadas</h2>
  <p class="section-note">Mapa cronológico de tu ruta, con el detalle completo de cada etapa.</p>
  <div class="timeline">
    <div class="tl-nodo"><div class="tl-punto con-ancla"></div><div class="etapa-card" style="border-left-color:var(--guide); padding:13px 16px;"><span class="etapa-badge con-ancla">Punto de partida</span><span class="etapa-titulo">${esc(cur.alias)}, hoy</span></div></div>
    ${etapasHtml}
  </div>

  ${matrizHtml}

  ${inf.hilo_conductor ? `<h2>Hilo conductor entre las etapas</h2><div class="hilo">${parrafos(inf.hilo_conductor)}</div>` : ''}

  ${constelacionHtml}

  ${arcosRelacionalesHtml}

  ${mapaAprendizajesHtml}

  ${balanceHtml}

  <h2>Lo que se estaría cerrando</h2>
  <div class="cierre">${parrafos(inf.cierre)}</div>
  ${inf.frase_de_cierre ? `<p class="frase-cierre-export">${esc(inf.frase_de_cierre)}</p>` : ''}

  ${auditoriaHtml}

  <div class="nota">${esc(inf.nota_epistemica || 'Esta lectura es un ejercicio simbólico de probabilidad e introspección, no un hecho histórico verificado ni una afirmación definitiva sobre vidas pasadas.')}</div>
</body>
</html>`;
}

function buildInformeEjecutivoHTML(){
  const inf = deepCleanText(cur.informe || {});
  const resumenEstaciones = buildResumenEstacionesView(inf, cur.alias);
  const parrafos = (txt)=> (txt||'').split(/\n+/).filter(p=>p.trim()).map(p=>`<p>${esc(p.trim())}</p>`).join('\n');

  const etapasPorNum = {};
  (inf.etapas||[]).forEach(e=>{ etapasPorNum[e.numero_etapa] = e; });

  const retrato = inf.retrato_literario || inf.lectura_general || '';

  function resaltarFrasesClave(textoEscapado){
    return textoEscapado.replace(/(evento crítico|huella actual)/gi, '<em>$1</em>');
  }

  const estacionesHtml = (resumenEstaciones && resumenEstaciones.estaciones || []).map(e=>`
    <h3 id="est-${e.numero}">${esc(e.numero)}. ${esc(e.titulo)}</h3>
    <p>${resaltarFrasesClave(esc(e.parrafo))}</p>
  `).join('\n');

  const arcosPorPersona = {};
  (inf.arcos_relacionales || []).forEach(a=>{
    if(a && a.persona) arcosPorPersona[a.persona.trim().toLowerCase()] = a;
  });

  const conexionesAgrupadas = agruparConexionesPorPersona(getConexionesRetorno(inf));
  conexionesAgrupadas.sort((a, b)=>{
    const numA = (a.conexiones||[]).length, numB = (b.conexiones||[]).length;
    if(numB !== numA) return numB - numA; // más etapas conectadas primero (almas más añejas)
    const masAntiguaA = Math.min(...(a.conexiones||[]).map(c=>c.etapa_relacionada || 999));
    const masAntiguaB = Math.min(...(b.conexiones||[]).map(c=>c.etapa_relacionada || 999));
    return masAntiguaA - masAntiguaB; // en empate, la etapa más antigua primero
  });
  const constelacionHtml = conexionesAgrupadas.slice(0,14).map(g=>{
    const entradas = g.conexiones || [];
    const numEtapas = entradas.length;
    const estrellas = '★'.repeat(Math.min(numEtapas, 3)) + '☆'.repeat(Math.max(0, 3 - numEtapas));
    const bloquesEtapa = entradas.map((c, i)=>{
      const et = c.etapa_relacionada ? etapasPorNum[c.etapa_relacionada] : null;
      const anclaje = et ? `Etapa ${et.numero_etapa} · ${esc(et.titulo)}` : 'Sin etapa asociada';
      const conector = i === 0 ? '' : '<p class="conector-multi-etapa">Además, esto también resuena con:</p>';
      return `${conector}
    <div class="persona-anclaje">${anclaje}</div>
    <p>${esc(c.resonancia || '')}</p>`;
    }).join('\n');

    const arco = arcosPorPersona[(g.persona || '').trim().toLowerCase()];
    const arcoHtml = arco ? `
    <div class="arco-relacional">
      <div class="arco-etiqueta">Lo que este vínculo atraviesa</div>
      ${arco.patron_transversal ? `<p>${esc(arco.patron_transversal)}</p>` : ''}
      ${arco.lo_que_ya_se_supero ? `<p><strong class="arco-supero">Ya superado:</strong> ${esc(arco.lo_que_ya_se_supero)}</p>` : ''}
      ${arco.lo_que_sigue_en_transito ? `<p><strong class="arco-transito">Sigue en tránsito:</strong> ${esc(arco.lo_que_sigue_en_transito)}</p>` : ''}
    </div>` : '';

    return `
    <div class="persona-nombre">${esc(g.persona || '')} <span class="persona-estrellas" title="${numEtapas} etapa(s) conectada(s)">${estrellas}</span></div>
    ${bloquesEtapa}
    ${arcoHtml}`;
  }).join('\n');

  const balance = inf.balance_justicia_amor_caridad || {};
  const NOMBRES_LEY = { justicia:'Justicia', amor:'Amor', caridad:'Caridad' };
  const leyesHtml = ['justicia','amor','caridad'].map(clave=>{
    const ley = balance[clave];
    if(!ley || (!ley.avance_logrado && !ley.patron_persistente)) return '';
    const personas = Array.isArray(ley.personas_involucradas) ? ley.personas_involucradas.filter(Boolean) : [];
    const guiaBullets = Array.isArray(ley.guia_eternidad) ? ley.guia_eternidad.filter(Boolean) : [];
    return `
    <div class="ley-card-ejecutivo">
    <h3>${NOMBRES_LEY[clave]}</h3>
    ${ley.prueba_planteada ? `<div class="ley-subbox-ej ley-subbox-ej-prueba"><div class="ley-subbox-ej-label">Prueba planteada</div><p>${esc(ley.prueba_planteada)}</p></div>` : ''}
    ${ley.avance_logrado ? `<div class="ley-subbox-ej ley-subbox-ej-avance"><div class="ley-subbox-ej-label">Avance que ya se nota</div><p>${esc(ley.avance_logrado)}</p></div>` : ''}
    ${ley.patron_persistente ? `<div class="ley-subbox-ej ley-subbox-ej-abierto"><div class="ley-subbox-ej-label">Algo que sigue abierto</div><p>${esc(ley.patron_persistente)}</p></div>` : ''}
    ${personas.length ? `<p class="intro-seccion">${personas.map(esc).join(' · ')}</p>` : ''}
    ${ley.posibilidad_de_exploracion ? `<div class="ley-exploracion">${esc(ley.posibilidad_de_exploracion)}</div>` : ''}
    ${guiaBullets.length ? `<div class="ley-subbox-ej ley-subbox-ej-guia"><div class="ley-subbox-ej-label">Guía para la eternidad</div><ul class="ley-guia-lista">${guiaBullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></div>` : ''}
    </div>
  `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe ejecutivo — ${esc(cur.alias)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{ --bg:#FBF6EC; --paper:#FFFDF8; --line:#E3D6B8; --texto:#2B2620; --texto-suave:#5C554A; --acento:#9C5A2E; --guia:#3D5A61; --titulo:#5A3E1B; --logrado:#4F7A5C; --serif:'Fraunces',Georgia,serif; --sans:'Inter',sans-serif; }
*{box-sizing:border-box;}
body{ background:var(--bg); color:var(--texto); font-family:var(--serif); max-width:720px; margin:0 auto; padding:0; line-height:1.75; font-size:17px; }
.pagina{ padding:48px 40px; }
.portada{ text-align:center; padding:100px 40px 80px; border-bottom:3px double var(--line); }
.marca{ font-family:var(--sans); font-size:13px; letter-spacing:.18em; color:var(--acento); font-weight:600; margin-bottom:18px; }
.titulo-principal{ font-size:34px; font-weight:500; color:var(--titulo); margin:0 0 14px; }
.alias{ font-style:italic; font-size:19px; color:var(--texto-suave); margin-bottom:40px; }
.disclaimer-portada{ font-style:italic; font-size:14px; color:var(--texto-suave); max-width:480px; margin:0 auto; line-height:1.7; }
h2{ font-size:24px; font-weight:500; color:var(--titulo); margin:40px 0 6px; }
h3{ font-size:19px; font-weight:500; color:var(--acento); margin:28px 0 8px; }
.divisoria{ border:none; border-top:1px solid var(--line); margin:10px 0 22px; }
.intro-seccion{ font-style:italic; color:var(--texto-suave); font-size:15px; margin-bottom:16px; }
p{ margin:0 0 15px; text-align:justify; }
.persona-nombre{ font-family:var(--sans); font-weight:600; color:var(--guia); font-size:15.5px; margin:18px 0 2px; }
.persona-anclaje{ font-style:italic; color:var(--texto-suave); font-size:13px; margin-bottom:5px; }
.persona-estrellas{ color:var(--acento); font-size:12px; letter-spacing:1px; }
.conector-multi-etapa{ font-family:var(--sans); font-size:12px; font-style:italic; color:var(--guia); margin:10px 0 4px; }
.arco-relacional{ margin-top:10px; padding:10px 14px; background:var(--paper); border:1px solid var(--line); border-radius:6px; }
.arco-etiqueta{ font-family:var(--sans); font-weight:600; font-size:11.5px; text-transform:uppercase; letter-spacing:.03em; color:var(--titulo); margin-bottom:6px; }
.arco-supero{ color:#4A7A5A; }
.arco-transito{ color:var(--acento); }
.hilo-box{ text-align:center; font-style:italic; font-size:19px; padding:16px 10px; }
.ley-card-ejecutivo{ background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:20px 22px; margin-bottom:20px; }
.ley-card-ejecutivo h3{ margin-top:0; }
.ley-subbox-ej{ background:var(--bg); border-radius:6px; padding:12px 15px; margin:11px 0; }
.ley-subbox-ej p{ margin:0; }
.ley-subbox-ej-label{ font-family:var(--sans); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.03em; margin-bottom:5px; }
.ley-subbox-ej-prueba{ border-left:3px solid var(--guia); }
.ley-subbox-ej-prueba .ley-subbox-ej-label{ color:var(--guia); }
.ley-subbox-ej-avance{ border-left:3px solid var(--logrado); }
.ley-subbox-ej-avance .ley-subbox-ej-label{ color:var(--logrado); }
.ley-subbox-ej-abierto{ border-left:3px solid var(--acento); }
.ley-subbox-ej-abierto .ley-subbox-ej-label{ color:var(--acento); }
.ley-subbox-ej-guia{ border-left:3px solid var(--titulo); }
.ley-subbox-ej-guia .ley-subbox-ej-label{ color:var(--titulo); }
.ley-exploracion{ margin-top:12px; padding:10px 16px; border-left:3px solid var(--guia); font-style:italic; background:var(--paper); }
.ley-guia-lista{ margin:0 0 10px; padding-left:20px; }
.ley-guia-lista li{ margin-bottom:6px; font-size:15px; line-height:1.6; }
.frase-cierre{ text-align:center; font-style:italic; font-family:var(--serif); font-size:20px; color:var(--acento); margin:22px 0 6px; line-height:1.6; }
.nota-final{ text-align:center; font-size:13.5px; font-style:italic; color:var(--texto-suave); border-top:1px solid var(--line); padding-top:18px; margin-top:36px; }
.indice a{ color:var(--guia); text-decoration:none; }
@media print{ .pagina{ padding:0; } }
</style>
</head>
<body>
<div class="portada">
  <div class="marca">BITÁCORA DEL ALMA</div>
  <div class="titulo-principal">Informe ejecutivo de lectura simbólica</div>
  <div class="alias">${esc(cur.alias)}</div>
  <div class="disclaimer-portada">Ejercicio simbólico de introspección, inspirado en tradiciones sobre la reencarnación y el aprendizaje del alma. Nada de lo que encuentres aquí es verificable ni pretende serlo — es materia para reflexionar sobre tu propia vida.</div>
</div>
<div class="pagina">
  <h2 id="indice">Índice</h2><hr class="divisoria">
  <div class="indice">
    <p><a href="#retrato">El retrato de esta alma</a></p>
    <p><a href="#estaciones-sec">Las estaciones del alma</a></p>
    ${(inf.constelacion||[]).length ? '<p><a href="#constelacion-sec">Quienes te acompañan</a></p>' : ''}
    ${inf.hilo_conductor ? '<p><a href="#hilo-sec">El hilo que las conecta</a></p>' : ''}
    ${leyesHtml.trim() ? '<p><a href="#balance-sec">El balance de Justicia, Amor y Caridad</a></p>' : ''}
    <p><a href="#cierre-sec">Lo que se estaría cerrando</a></p>
  </div>

  <h2 id="retrato">El retrato de esta alma</h2><hr class="divisoria">
  ${parrafos(retrato)}

  <h2 id="estaciones-sec">Las estaciones del alma</h2><hr class="divisoria">
  <p class="intro-seccion">Estaciones narrativas construidas desde tus propios sueños, presencias e intuiciones — posibilidades simbólicas, no hechos verificados.</p>
  ${estacionesHtml}

  ${(inf.constelacion||[]).length ? `
  <h2 id="constelacion-sec">Quienes te acompañan</h2><hr class="divisoria">
  <p class="intro-seccion">Cada una de estas personas aparece aquí no porque haya sido, literalmente, otra persona en otro tiempo, sino porque algo en su presencia —un gesto, un rol, una forma de cuidar o de doler— resuena con una escena de esta ruta. Junto a cada nombre encontrarás la etapa exacta con la que dialoga, para que leas esa resonancia con tus propios ojos.</p>
  ${constelacionHtml}
  ` : ''}

  ${inf.hilo_conductor ? `
  <h2 id="hilo-sec">El hilo que las conecta</h2><hr class="divisoria">
  <div class="hilo-box">${esc(inf.hilo_conductor)}</div>
  ` : ''}

  ${leyesHtml.trim() ? `
  <h2 id="balance-sec">El balance de Justicia, Amor y Caridad</h2><hr class="divisoria">
  <p class="intro-seccion">Una lectura transversal de toda la ruta a través de las tres leyes morales del Libro Tercero de Kardec. No es un examen — es un mapa de dónde ya hubo avance y dónde el mismo patrón sigue abierto.</p>
  ${leyesHtml}
  ${inf.cierre_del_balance ? `<p style="font-style:italic; margin-top:14px;">${esc(inf.cierre_del_balance)}</p>` : ''}
  ` : ''}

  <h2 id="cierre-sec">Lo que se estaría cerrando</h2><hr class="divisoria">
  ${parrafos(inf.cierre)}
  ${inf.frase_de_cierre ? `<p class="frase-cierre">${esc(inf.frase_de_cierre)}</p>` : ''}

  <div class="nota-final">${esc(inf.nota_epistemica || 'Ejercicio simbólico de probabilidad e introspección, no hecho histórico verificado ni afirmación definitiva.')}</div>
</div>
</body>
</html>`;
}

function buildCronicaExportHTML(){
  const cr = cur.cronica;
  if(!cr) return '<html><body>No hay crónica generada todavía.</body></html>';
  const parrafos = (txt)=> (txt||'').split(/\n+/).filter(p=>p.trim()).map(p=>`<p>${esc(p.trim())}</p>`).join('\n');

  const capitulosHtml = cr.capitulos.map(cap => `
    <h2 class="cap-titulo">${esc(cap.titulo_capitulo || ('Capítulo ' + cap.numero))}</h2>
    ${parrafos(cap.texto)}
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(cr.titulo_cronica)}</title>
<style>
  :root{ --bg:#FBF7EF; --paper:#F3ECDD; --titulo:#3A2E22; --texto:#3A332B; --acento:#8B5E3C; --dim:#8B8478; --serif:'Georgia','Iowan Old Style',serif; --sans:-apple-system,'Segoe UI',sans-serif; }
  *{box-sizing:border-box;}
  body{ background:var(--bg); color:var(--texto); font-family:var(--serif); max-width:680px; margin:0 auto; padding:50px 26px 90px; line-height:1.8; font-size:17px; }
  .portada{ text-align:center; margin-bottom:50px; }
  .eyebrow{ font-family:var(--sans); font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--dim); margin-bottom:14px; }
  .titulo-cronica{ font-size:34px; line-height:1.25; color:var(--titulo); margin:0 0 18px; }
  .epigrafe{ font-style:italic; color:var(--acento); font-size:17px; margin:0 auto 10px; max-width:440px; }
  .nota-nombres{ font-family:var(--sans); font-size:12px; color:var(--dim); font-style:italic; margin-top:16px; }
  .cap-titulo{ font-size:22px; color:var(--titulo); margin:44px 0 14px; padding-bottom:8px; border-bottom:1px solid rgba(139,94,60,0.25); }
  p{ margin:0 0 18px; }
  .cierre-final{ font-style:italic; color:var(--acento); margin-top:40px; }
  .nota-epistemica{ font-family:var(--sans); font-size:11.5px; color:var(--dim); text-align:center; margin-top:50px; padding-top:20px; border-top:1px solid rgba(139,94,60,0.2); }
  @media print{ body{background:white; color:#222;} }
</style>
</head>
<body>
  <div class="portada">
    <div class="eyebrow">Crónica narrativa · ${esc(cur.alias)}</div>
    <h1 class="titulo-cronica">${esc(cr.titulo_cronica)}</h1>
    ${cr.epigrafe ? `<p class="epigrafe">${esc(cr.epigrafe)}</p>` : ''}
    ${cr.nota_nombres ? `<p class="nota-nombres">${esc(cr.nota_nombres)}</p>` : ''}
  </div>

  ${capitulosHtml}

  <div class="cierre-final">${parrafos(cr.cierre_inconcluso)}</div>

  <div class="nota-epistemica">${esc(cr.nota_epistemica || 'Ejercicio simbólico narrado como crónica, no hecho histórico verificado ni afirmación definitiva.')}</div>
</body>
</html>`;
}

function buildCronicaWordCompatible(){
  const htmlBase = buildCronicaExportHTML();
  const encabezadoWord = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>
<![endif]-->`;
  return htmlBase.replace(/<html lang="es">\s*<head>\s*<meta charset="UTF-8">/, encabezadoWord);
}

function buildInformeEjecutivoWordCompatible(){
  const htmlBase = buildInformeEjecutivoHTML();
  // Técnica sin dependencias: Word abre HTML como documento nativo si declara estos
  // namespaces y el bloque condicional mso — no requiere ninguna librería externa.
  const encabezadoWord = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml>
<![endif]-->`;
  return htmlBase.replace(/<html lang="es">\s*<head>\s*<meta charset="UTF-8">/, encabezadoWord);
}
function downloadJSON(obj, filename){
  downloadBlob(JSON.stringify(obj, null, 2), 'application/json', filename);
}

function downloadText(text, filename){
  downloadBlob(text, 'text/plain;charset=utf-8', filename);
}

function downloadBlob(content, mime, filename){
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(str){
  return (str||'sin-alias').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function dateSlug(){
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

/* ---------- diagrama de ruta ---------- */

function renderResumenEjecutivo(container, inf, tirada){
  const etapas = inf.etapas || [];
  const conAncla = etapas.filter(e => e.periodo_simbolico).length;
  const figurasReaparecen = (inf.constelacion || []).length;

  // aprendizajes derivados: uno por etapa (condensado), más el de la tirada
  const aprendizajesChips = etapas.map(e => e.leccion ? e.leccion : null).filter(Boolean);

  container.innerHTML = `
    <div class="resumen-exec-box">
      <div class="resumen-stats">
        <div class="stat-chip">
          <div class="stat-num">${etapas.length}</div>
          <div class="stat-label-row"><span class="stat-label">Posibles etapas</span><button type="button" class="help-btn-mini" data-tip="tip-etapas">?</button></div>
          <div class="help-tip" id="tip-etapas">Momentos que, según tus propios sueños o intuiciones, podrían corresponder a otra existencia — no son hechos comprobados.</div>
        </div>
        <div class="stat-chip">
          <div class="stat-num">${conAncla}</div>
          <div class="stat-label-row"><span class="stat-label">Con fecha real de referencia</span><button type="button" class="help-btn-mini" data-tip="tip-ancla">?</button></div>
          <div class="help-tip" id="tip-ancla">Etapas donde tú nombraste algo con fecha histórica conocida, así que la lectura pudo situarlas con datos reales. Las demás quedan sin fecha para no inventar — puedes agregar la tuya propia si quieres.</div>
        </div>
        <div class="stat-chip">
          <div class="stat-num">${figurasReaparecen}</div>
          <div class="stat-label-row"><span class="stat-label">Figuras que reaparecen</span><button type="button" class="help-btn-mini" data-tip="tip-figuras">?</button></div>
          <div class="help-tip" id="tip-figuras">Presencias de tus sueños que podrían coincidir con alguien real de tu vida actual — una resonancia posible, nunca una identidad afirmada.</div>
        </div>
      </div>
      ${inf.resumen_ruta ? `<div class="resumen-texto">${esc(inf.resumen_ruta)}</div>` : ''}
      <div class="tirada-tags">
        <span class="tirada-tag">${esc(tirada.antiguedad.nombre)}</span>
        <span class="tirada-tag">${esc(tirada.arquetipo.nombre)}</span>
      </div>
      ${aprendizajesChips.length ? `
      <div class="det-label" style="margin-top:8px;">Aprendizajes identificados</div>
      <div class="aprendizajes-row">
        <span class="aprendizaje-chip principal">${esc(tirada.aprendizaje.nombre)} · de la tirada</span>
        ${aprendizajesChips.map(a=>`<span class="aprendizaje-chip derivado">${esc(a)}</span>`).join('')}
      </div>` : ''}
    </div>
  `;
  container.querySelectorAll('.help-btn-mini').forEach(btn=>{
    btn.onclick = ()=> container.querySelector('#'+btn.dataset.tip).classList.toggle('abierto');
  });
}

function renderRutaDiagrama(container, alias, etapas){
  container.innerHTML = '';
  container.classList.add('timeline-eje');

  const nodoHoy = document.createElement('div');
  nodoHoy.className = 'tl-nodo tl-nodo-hoy';
  nodoHoy.innerHTML = `
    <div class="tl-punto tl-punto-hoy"></div>
    <div class="tl-caja tl-caja-hoy">
      <div class="ruta-nodo-eyebrow">Punto de partida</div>
      <div class="ruta-nodo-titulo">${esc(alias)}, hoy</div>
    </div>
  `;
  container.appendChild(nodoHoy);

  etapas.forEach((et, i)=>{
    const nodo = document.createElement('div');
    nodo.className = 'tl-nodo';

    let vinculoHtml = '';
    if(et.vinculo && et.vinculo.nombre_actual){
      vinculoHtml = `
        <div class="ruta-vinculo-box">
          <div class="ruta-vinculo-lado" style="text-align:right;">
            <div class="ruta-vinculo-nombre">${esc(et.vinculo.figura_simbolica || '—')}</div>
            <div class="ruta-vinculo-sub">en esta etapa</div>
          </div>
          <div class="ruta-vinculo-flecha">⇄</div>
          <div class="ruta-vinculo-lado">
            <div class="ruta-vinculo-nombre">${esc(et.vinculo.nombre_actual)}</div>
            <div class="ruta-vinculo-sub">hoy</div>
          </div>
        </div>
        <div class="ruta-vinculo-relacion">${esc(et.vinculo.tipo_relacion || '')}</div>
      `;
    }

    const periodoTexto = getPeriodoTexto(et);

    nodo.innerHTML = `
      <div class="tl-punto"></div>
      <div class="tl-caja ruta-nodo tipo-etapa">
        <div class="etapa-head">
          <div class="etapa-head-left">
            <div class="ruta-nodo-eyebrow">Etapa ${et.numero_etapa || (i+1)}${periodoTexto ? ' · ' + esc(periodoTexto) + (et._periodoEditadoPorUsuario ? ' <span class="periodo-tu-nota">(agregado por ti)</span>' : '') : ''}</div>
            <div class="ruta-nodo-titulo">${esc(et.titulo)}</div>
            <div class="etapa-teaser">${esc(et.leccion || '')}</div>
          </div>
          <div class="etapa-chevron">⌄</div>
        </div>
        <div class="etapa-body">
          <div id="periodo-editable-${i}"></div>
          ${buildContextoTags(et, true)}
          ${et.evidencia_periodo && et.evidencia_periodo.length ? `
          <div class="ruta-detalle-label">Evidencia temporal</div>
          <div class="ruta-detalle-texto">${esc(et.evidencia_periodo.join(' · '))}</div>
          ` : ''}
          ${et.relacion_principal ? `
          <div class="ruta-detalle-label">Relación principal</div>
          <div class="ruta-detalle-texto">${esc(et.relacion_principal)}</div>
          ` : ''}
          ${et.evento_critico ? `
          <div class="ruta-detalle-label">Evento crítico</div>
          <div class="ruta-detalle-texto">${esc(et.evento_critico)}</div>
          ` : ''}
          <div class="ruta-detalle-label">Huella actual</div>
          <div class="ruta-detalle-texto">${esc(getHuellaActual(et))}</div>
          <div class="ruta-detalle-label">Aprendizaje pendiente</div>
          <div class="ruta-detalle-texto">${esc(getAprendizaje(et))}</div>
          <div class="ruta-detalle-label">Eco hoy</div>
          <div class="ruta-detalle-texto">${esc(et.eco_actual || '')}</div>
          ${et.senal_origen ? `
          <div class="ruta-detalle-label">Señal de origen</div>
          <div class="ruta-detalle-texto" style="color:var(--text-dim); font-style:italic;">${esc(et.senal_origen)}</div>
          ` : ''}
          ${vinculoHtml}
        </div>
      </div>
    `;
    container.appendChild(nodo);

    const card = nodo.querySelector('.ruta-nodo');
    nodo.querySelector('.etapa-head').addEventListener('click', ()=> card.classList.toggle('abierta'));

    // edición in-situ del período: permite agregar o corregir y guardar el ajuste para nuevas lecturas
    const periodoSlot = nodo.querySelector(`#periodo-editable-${i}`);
    renderPeriodoEditable(periodoSlot, et, i, ()=> renderRutaDiagrama(container, alias, etapas));
  });
}

function renderPeriodoEditable(slot, etapa, idx, onGuardado){
  const periodoActual = getPeriodoTexto(etapa);
  const etiqueta = periodoActual ? (etapa._periodoEditadoPorUsuario ? 'Editar período agregado' : 'Corregir período o época') : '+ Agregar mi propio período o época';
  slot.innerHTML = `<button type="button" class="btn-agregar-periodo">${esc(etiqueta)}</button>`;
  slot.querySelector('.btn-agregar-periodo').onclick = (e)=>{
    e.stopPropagation();
    slot.innerHTML = `
      <div class="periodo-edit-box" onclick="event.stopPropagation()">
        <input type="text" class="periodo-edit-input" placeholder="Ej. hacia 1750, época medieval, siglo III..." value="${esc(periodoActual)}">
        <div class="periodo-edit-botones">
          <button type="button" class="btn-periodo-guardar">Guardar</button>
          <button type="button" class="btn-periodo-cancelar">Cancelar</button>
        </div>
        <p class="periodo-edit-nota">Esto queda guardado como ajuste tuyo. La próxima vez que generes el prompt, la IA lo recibirá como corrección del usuario y deberá integrarlo sin tratarlo como invención propia.</p>
      </div>
    `;
    const input = slot.querySelector('.periodo-edit-input');
    input.focus();
    input.select();
    slot.querySelector('.btn-periodo-guardar').onclick = async (e2)=>{
      e2.stopPropagation();
      const v = input.value.trim();
      if(!v) return;
      registrarPeriodoUsuario(etapa, v, idx);
      if(cur._editingEntryId){
        await guardarAvanceRapido();
      }
      onGuardado();
    };
    slot.querySelector('.btn-periodo-cancelar').onclick = (e2)=>{
      e2.stopPropagation();
      renderPeriodoEditable(slot, etapa, idx, onGuardado);
    };
  };
}

function buildContextoTags(et, periodoYaEnEncabezado){
  const tags = [];
  if(!periodoYaEnEncabezado && getPeriodoTexto(et)) tags.push(getPeriodoTexto(et));
  if(et.periodo_reportado) tags.push('Pista reportada: ' + et.periodo_reportado);
  if(et.periodo_amplificado) tags.push('Amplificado: ' + et.periodo_amplificado);
  if(et.nivel_confianza_periodo) tags.push('Confianza temporal: ' + et.nivel_confianza_periodo);
  if(et.espacio_simbolico) tags.push(et.espacio_simbolico);
  if(et.contexto_sociopolitico) tags.push(et.contexto_sociopolitico);
  if(et.contexto_socioambiental) tags.push(et.contexto_socioambiental);
  if(et.rol_encarnado) tags.push(et.rol_encarnado);
  if(et.genero_percibido) tags.push(et.genero_percibido);
  if(et.edad_percibida) tags.push(et.edad_percibida);
  if(!tags.length) return `<div class="ruta-contexto-vacio">Sin más pistas de contexto en tu material para esta etapa</div>`;
  return `<div class="ruta-contexto-tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join(' ')}</div>`;
}

function resetSession(){
  if(typeof clearSessionDraft === 'function') clearSessionDraft();
  cur = {
    alias: '',
    moduloA: { autodescripcion:'', patron:'', rasgo:'', sensaciones:'' },
    moduloB: { presencias:'', amigoImaginario:'', suenoGuia:'', nombrePresencia:'' },
    moduloC: [],
    moduloD: { descripcion:'' },
    moduloE: [],
    tirada: null,
    promptGenerado: '',
    respuestaIA: '',
    informe: null,
    cronica: null,
    generationMeta: { lecturaDatosSignature:null, lecturaGeneradaEn:null, cronicaInformeSignature:null, cronicaGeneradaEn:null },
    ajustesInforme: { periodos: [], observaciones: [], correccionesEtapa: [] },
    _narrativaVinculos: '',
    _promptExtraccion: '',
    _historiaCompleta: '',
    _promptImportacion: '',
    _editingEntryId: null,
  };
}

registerRoute('cronica-prompt', (s)=>{
  if(!cur.usarAliasCronica) cur.usarAliasCronica = false;
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Tu historia, en una sola narrativa</div>
    <h2>La crónica de tu alma</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Esto no es un resumen ni otro informe: es tu lectura ya generada, tejida en una sola historia continua, con capítulos y un título propio para esta ruta. Usa como fuente el informe que ya tienes — no vuelve a interpretar tu material original desde cero.</p>
    <div class="spacer-md"></div>
    <div class="nota-personal-box">
      Este documento nombra a personas reales de tu vida dentro de una historia pensada para leerse, no para consultarse como un informe técnico — es más personal que la mayoría de las exportaciones de esta app. Antes de generarlo, decide cómo prefieres los nombres.
    </div>
    <div class="spacer-sm"></div>
    <p class="body-text muted" style="font-size:12px;">Este prompt es largo. Si tu IA lo convierte automáticamente en un archivo adjunto en vez de dejarlo como mensaje, agrega una línea corta como "ejecuta las instrucciones del documento" — si no, puede quedarse solo preguntando qué hacer con él, sin generar nada.</p>
    <div class="spacer-md"></div>
    <div class="opcion-toggle-row">
      <label class="opcion-toggle">
        <input type="radio" name="modo-nombres" id="radio-nombres-reales" ${!cur.usarAliasCronica ? 'checked' : ''}>
        <span><strong>Nombres reales</strong><br><span class="muted" style="font-size:12.5px;">Tal como los escribiste en tu historia.</span></span>
      </label>
      <label class="opcion-toggle">
        <input type="radio" name="modo-nombres" id="radio-nombres-alias" ${cur.usarAliasCronica ? 'checked' : ''}>
        <span><strong>Alias con cadencia similar</strong><br><span class="muted" style="font-size:12.5px;">Ej. "Victoria Rosas" → un nombre parecido, no el real. La IA elige uno y lo mantiene igual en todo el documento.</span></span>
      </label>
    </div>
    <div class="spacer-md"></div>
    <div class="copy-only-panel">
      <div class="copy-only-title">Prompt de la crónica</div>
      <button class="btn btn-primary copy-pulse" id="btn-copy-cronica" type="button">Copiar prompt de la crónica</button>
    </div>
    <div id="ai-access-cronica"></div>
  `;
  function actualizarEstiloToggle(){
    s.querySelector('#radio-nombres-reales').closest('.opcion-toggle').classList.toggle('activo', !cur.usarAliasCronica);
    s.querySelector('#radio-nombres-alias').closest('.opcion-toggle').classList.toggle('activo', cur.usarAliasCronica);
  }
  actualizarEstiloToggle();
  s.querySelector('#radio-nombres-reales').onchange = ()=>{ cur.usarAliasCronica = false; actualizarEstiloToggle(); };
  s.querySelector('#radio-nombres-alias').onchange = ()=>{ cur.usarAliasCronica = true; actualizarEstiloToggle(); };
  s.querySelector('#btn-copy-cronica').onclick = async ()=>{
    const prompt = buildPromptCronicaNarrativa(cur.usarAliasCronica);
    await copyPromptButton(s.querySelector('#btn-copy-cronica'), prompt, s.querySelector('#ai-access-cronica'));
  };
  renderAIExternalPanel(s.querySelector('#ai-access-cronica'), ()=>buildPromptCronicaNarrativa(cur.usarAliasCronica), { title:'Abrir IA para la crónica', detail:'Se copia el prompt de la crónica y se abre la IA externa.' });
  renderMigas(s.querySelector('#migas'));
  navFooter(s, [
    { label:'Ya tengo la respuesta, pegarla', onClick: ()=> go('cronica-pegar-respuesta') },
    { label:'Volver al informe', variant:'btn-ghost', onClick: ()=> go('informe') },
  ]);
});

registerRoute('cronica-pegar-respuesta', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Tu historia, en una sola narrativa</div>
    <h2>Pega aquí la respuesta de la IA</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Pega el texto completo tal como te lo dio la IA.</p>
    <div class="spacer-md"></div>
    <div class="field">
      <textarea id="cronica-box" placeholder="Pega aquí..." style="min-height:260px;"></textarea>
    </div>
    <p class="muted" id="cronica-parse-error" style="color:#C46A3F; display:none;"></p>
  `;
  navFooter(s, [
    { label:'Ver mi crónica', onClick: async ()=>{
      const raw = document.getElementById('cronica-box').value.trim();
      const errEl = document.getElementById('cronica-parse-error');
      if(!raw){ document.getElementById('cronica-box').focus(); return; }
      const parsed = parseCronica(raw);
      if(!parsed){
        errEl.textContent = 'No pudimos leer el formato. Verifica que hayas pegado la respuesta completa, o pídele a la IA que responda solo con el JSON indicado.';
        errEl.style.display = 'block';
        return;
      }
      ensureGenerationMeta(cur);
      cur.cronica = parsed;
      markCronicaGenerada(cur);
      if(cur._editingEntryId){
        await guardarAvanceRapido();
      }
      go('cronica');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('cronica-prompt') },
  ]);
});

/* ===== Narración por voz de la crónica ===== */
// Limitación real y conocida: en la mayoría de los móviles (Safari/iOS en particular), la síntesis
// de voz se detiene si la pantalla se bloquea o se cambia de pestaña — no es un reproductor de audio
// nativo, el sistema operativo no la trata igual. Esto se declara en la interfaz, no se oculta.

const NARRACION = {
  fragmentos: [],   // [{ titulo, texto }]
  indiceActual: -1,
  estado: 'detenido', // 'detenido' | 'reproduciendo' | 'pausado'
  velocidad: 1,
  voiceURI: ''
};

function cargarPreferenciasNarracion(){
  try{
    const raw = localStorage.getItem('balma:tts-config');
    if(raw){
      const cfg = JSON.parse(raw);
      if(cfg && cfg.velocidad) NARRACION.velocidad = cfg.velocidad;
      if(cfg && cfg.voiceURI) NARRACION.voiceURI = String(cfg.voiceURI);
    }
  }catch(e){ /* preferencia opcional, si falla se usa el valor por defecto */ }
}

function guardarPreferenciasNarracion(){
  try{ localStorage.setItem('balma:tts-config', JSON.stringify({ velocidad: NARRACION.velocidad, voiceURI: NARRACION.voiceURI || '' })); }catch(e){}
}

function construirFragmentosCronica(cr){
  const fragmentos = [];
  if(cr.epigrafe) fragmentos.push({ titulo:'Epígrafe', texto: cr.epigrafe });
  (cr.capitulos||[]).forEach(cap=>{
    if(cap && cap.texto) fragmentos.push({ titulo: cap.titulo_capitulo || ('Capítulo '+cap.numero), texto: cap.texto });
  });
  if(cr.cierre_inconcluso) fragmentos.push({ titulo:'Cierre', texto: cr.cierre_inconcluso });
  return fragmentos;
}

function voiceKey(voz){
  return voz ? String(voz.voiceURI || `${voz.name || ''}|${voz.lang || ''}`) : '';
}

function vocesNarracionDisponibles(){
  if(!('speechSynthesis' in window)) return [];
  const voces = speechSynthesis.getVoices() || [];
  return voces.slice().sort((a,b)=>{
    const aes = String(a.lang || '').toLowerCase().startsWith('es') ? 0 : 1;
    const bes = String(b.lang || '').toLowerCase().startsWith('es') ? 0 : 1;
    return aes - bes || String(a.lang || '').localeCompare(String(b.lang || '')) || String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function elegirVozEspanol(){
  const voces = vocesNarracionDisponibles();
  if(!voces.length) return null;
  if(NARRACION.voiceURI){
    const elegida = voces.find(v=>voiceKey(v) === NARRACION.voiceURI);
    if(elegida) return elegida;
  }
  return voces.find(v=>String(v.lang || '').toLowerCase() === 'es-co')
    || voces.find(v=>String(v.lang || '').toLowerCase().startsWith('es'))
    || voces[0];
}

function poblarSelectorVocesNarracion(){
  const select = document.getElementById('mini-narrador-voz');
  if(!select) return;
  const voces = vocesNarracionDisponibles();
  select.innerHTML = '<option value="">Voz automática</option>' + voces.map(v=>{
    const label = `${v.name || 'Voz'}${v.lang ? ' · ' + v.lang : ''}`;
    return `<option value="${esc(voiceKey(v))}">${esc(label)}</option>`;
  }).join('');
  select.value = voces.some(v=>voiceKey(v) === NARRACION.voiceURI) ? NARRACION.voiceURI : '';
}

function cambiarVozNarracion(value){
  NARRACION.voiceURI = String(value || '');
  guardarPreferenciasNarracion();
  if(NARRACION.estado !== 'detenido') reconstruirYReanudarNarracionDesde(Math.max(NARRACION.indiceActual, 0));
}

function reconstruirYReanudarNarracionDesde(indice){
  speechSynthesis.cancel();
  const voz = elegirVozEspanol();
  for(let i = indice; i < NARRACION.fragmentos.length; i++){
    const f = NARRACION.fragmentos[i];
    const u = new SpeechSynthesisUtterance(f.texto);
    u.lang = (voz && voz.lang) || 'es-CO';
    u.rate = NARRACION.velocidad;
    if(voz) u.voice = voz;
    const indiceCapturado = i;
    u.onstart = ()=>{ NARRACION.indiceActual = indiceCapturado; NARRACION.estado = 'reproduciendo'; actualizarMiniReproductor(); };
    if(i === NARRACION.fragmentos.length - 1){
      u.onend = ()=>{ NARRACION.estado = 'detenido'; NARRACION.indiceActual = -1; ocultarMiniReproductor(); };
    }
    speechSynthesis.speak(u);
  }
}

function iniciarNarracionCronica(cr){
  if(!('speechSynthesis' in window)){
    alert('Este navegador no admite lectura en voz alta. Prueba desde Chrome o Safari actualizados.');
    return;
  }
  NARRACION.fragmentos = construirFragmentosCronica(cr);
  if(!NARRACION.fragmentos.length) return;
  reconstruirYReanudarNarracionDesde(0);
  mostrarMiniReproductor();
}

function pausarReanudarNarracion(){
  if(NARRACION.estado === 'reproduciendo'){
    speechSynthesis.pause();
    NARRACION.estado = 'pausado';
  } else if(NARRACION.estado === 'pausado'){
    speechSynthesis.resume();
    NARRACION.estado = 'reproduciendo';
  }
  actualizarMiniReproductor();
}

function detenerNarracion(){
  speechSynthesis.cancel();
  NARRACION.estado = 'detenido';
  NARRACION.indiceActual = -1;
  ocultarMiniReproductor();
}

function cambiarVelocidadNarracion(v){
  NARRACION.velocidad = v;
  guardarPreferenciasNarracion();
  if(NARRACION.estado !== 'detenido'){
    reconstruirYReanudarNarracionDesde(Math.max(NARRACION.indiceActual, 0));
  }
}

function crearMiniReproductorSiNoExiste(){
  if(document.getElementById('mini-narrador')) return;
  const el = document.createElement('div');
  el.id = 'mini-narrador';
  el.className = 'mini-narrador';
  el.innerHTML = `
    <div class="mini-narrador-barra-fondo"><div class="mini-narrador-barra-avance" id="mini-narrador-avance"></div></div>
    <div class="mini-narrador-fila">
      <div class="mini-narrador-info">
        <div class="mini-narrador-eyebrow">Narrando</div>
        <div class="mini-narrador-titulo" id="mini-narrador-titulo"></div>
      </div>
      <div class="mini-narrador-controles">
        <select id="mini-narrador-voz" aria-label="Voz de narración">
          <option value="">Voz automática</option>
        </select>
        <select id="mini-narrador-velocidad" aria-label="Velocidad de lectura">
          <option value="1">1×</option>
          <option value="1.5">1.5×</option>
          <option value="1.8">1.8×</option>
          <option value="2">2×</option>
        </select>
        <button id="mini-narrador-pausar" type="button" aria-label="Pausar o continuar">⏸</button>
        <button id="mini-narrador-detener" type="button" aria-label="Detener">⏹</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  el.querySelector('#mini-narrador-pausar').onclick = pausarReanudarNarracion;
  el.querySelector('#mini-narrador-detener').onclick = detenerNarracion;
  el.querySelector('#mini-narrador-velocidad').onchange = (e)=> cambiarVelocidadNarracion(parseFloat(e.target.value));
  el.querySelector('#mini-narrador-voz').onchange = (e)=> cambiarVozNarracion(e.target.value);
  poblarSelectorVocesNarracion();
  if('speechSynthesis' in window){
    if(typeof speechSynthesis.addEventListener === 'function') speechSynthesis.addEventListener('voiceschanged', poblarSelectorVocesNarracion);
    else speechSynthesis.onvoiceschanged = poblarSelectorVocesNarracion;
  }
}

function mostrarMiniReproductor(){
  crearMiniReproductorSiNoExiste();
  const el = document.getElementById('mini-narrador');
  el.classList.add('visible');
  el.querySelector('#mini-narrador-velocidad').value = String(NARRACION.velocidad);
  poblarSelectorVocesNarracion();
  actualizarMiniReproductor();
}

function ocultarMiniReproductor(){
  const el = document.getElementById('mini-narrador');
  if(el) el.classList.remove('visible');
}

function actualizarMiniReproductor(){
  const el = document.getElementById('mini-narrador');
  if(!el) return;
  const tituloEl = el.querySelector('#mini-narrador-titulo');
  if(tituloEl){
    const frag = NARRACION.indiceActual >= 0 ? NARRACION.fragmentos[NARRACION.indiceActual] : null;
    tituloEl.textContent = frag ? frag.titulo : '';
  }
  const btnPausar = el.querySelector('#mini-narrador-pausar');
  if(btnPausar) btnPausar.textContent = NARRACION.estado === 'pausado' ? '▶' : '⏸';
  // Aproximación del avance: fragmento actual sobre el total — no hay temporización real por palabra,
  // así que esto mide "cuántos fragmentos ya se narraron", no segundos exactos.
  const avanceEl = el.querySelector('#mini-narrador-avance');
  if(avanceEl && NARRACION.fragmentos.length){
    const pct = Math.min(100, Math.round(((NARRACION.indiceActual + 1) / NARRACION.fragmentos.length) * 100));
    avanceEl.style.width = pct + '%';
  }
}

registerRoute('cronica', (s)=>{
  const cr = cur.cronica;
  const estadoGeneracion = getGenerationStatus(cur);
  if(!cr){
    s.innerHTML = `<p class="body-text muted">Todavía no tienes una crónica generada para esta lectura.</p>`;
    navFooter(s, [{ label:'Generar mi crónica', onClick: ()=> go('cronica-prompt') }, { label:'Volver al informe', variant:'btn-ghost', onClick: ()=> go('informe') }]);
    return;
  }
  const lecturaPendiente = estadoGeneracion.lecturaDesactualizada;
  const cronicaPendiente = estadoGeneracion.cronicaDesactualizada && !lecturaPendiente;
  s.innerHTML = `
    <div id="migas"></div>
    <div class="context-toolbar cronica-context-toolbar" role="toolbar" aria-label="Acciones de la crónica">
      <div class="ct-main-actions">
        <button class="ct-btn" id="btn-atras-cronica" type="button" data-tooltip="Volver al informe" aria-label="Volver al informe"><span class="ct-icon" aria-hidden="true">←</span><span class="ct-label">Volver</span></button>
      </div>
      <div class="ct-utility-actions cronica-toolbar-actions">
        <button class="ct-btn" id="btn-exportar-cronica" type="button" data-tooltip="Exportar la crónica en HTML" aria-label="Exportar la crónica en HTML"><span class="ct-icon ct-letter" aria-hidden="true">H</span><span class="ct-label">HTML</span></button>
        <button class="ct-btn" id="btn-exportar-cronica-doc" type="button" data-tooltip="Exportar la crónica como documento editable de Word" aria-label="Exportar la crónica para Word"><span class="ct-icon ct-letter" aria-hidden="true">W</span><span class="ct-label">Word</span></button>
        <button class="ct-btn ${cronicaPendiente ? 'attention-pulse' : ''}" id="btn-regenerar-cronica" type="button" data-tooltip="${cronicaPendiente ? 'La lectura cambió: rehace la crónica con la información actual.' : 'Genera otra versión de esta crónica.'}" aria-label="${cronicaPendiente ? 'Rehacer crónica' : 'Generar nueva versión'}"><span class="ct-icon" aria-hidden="true">↻</span><span class="ct-label">${cronicaPendiente ? 'Rehacer' : 'Nueva versión'}</span></button>
        <button class="ct-btn ct-btn-primary" id="btn-iniciar-narracion" type="button" data-tooltip="Inicia con la voz del dispositivo. En algunos celulares se detiene al bloquear la pantalla o cambiar de app." aria-label="Iniciar narración con la voz del dispositivo"><span class="ct-icon" aria-hidden="true">▶</span><span class="ct-label">Narrar</span></button>
      </div>
    </div>
    <div class="cronica-toolbar-note" role="note"><span aria-hidden="true">ⓘ</span><span>La narración usa la voz del dispositivo; en algunos celulares puede detenerse al bloquear la pantalla o cambiar de aplicación.</span></div>
    ${lecturaPendiente ? `<div class="generation-alert"><strong>Esta crónica pertenece a una lectura anterior.</strong> Primero genera una nueva lectura desde el informe para incorporar los cambios del caso.</div>` : (cronicaPendiente ? `<div class="generation-alert"><strong>Crónica desactualizada.</strong> La lectura actual cambió; el botón ↻ genera una versión sincronizada.</div>` : '')}
    <div class="cronica-reading-column">
    <div class="cronica-portada">
      <div class="eyebrow">Crónica narrativa · ${esc(cur.alias)}</div>
      <h1 class="cronica-titulo">${esc(cr.titulo_cronica)}</h1>
      ${cr.epigrafe ? `<p class="cronica-epigrafe">${esc(cr.epigrafe)}</p>` : ''}
      ${cr.nota_nombres ? `<p class="cronica-nota-nombres">${esc(cr.nota_nombres)}</p>` : ''}
    </div>
    <div class="spacer-lg"></div>
    <div id="cronica-capitulos"></div>
    <div class="spacer-md"></div>
    <div class="divider"></div>
    <div id="cronica-cierre"></div>
    <p class="cronica-nota-epistemica muted">${esc(cr.nota_epistemica || '')}</p>
    </div>
  `;
  const contCap = s.querySelector('#cronica-capitulos');
  (cr.capitulos || []).forEach(cap=>{
    const bloque = document.createElement('div');
    bloque.className = 'cronica-capitulo';
    bloque.innerHTML = `<h2 class="cronica-capitulo-titulo">${esc(cap.titulo_capitulo || ('Capítulo '+cap.numero))}</h2>`;
    const contTexto = document.createElement('div');
    contTexto.className = 'cronica-capitulo-texto';
    renderParrafos(contTexto, cap.texto);
    bloque.appendChild(contTexto);
    contCap.appendChild(bloque);
  });
  renderParrafos(s.querySelector('#cronica-cierre'), cr.cierre_inconcluso, { serif:true, italic:true, dim:true });
  s.querySelector('#btn-exportar-cronica').onclick = ()=>{
    const html = buildCronicaExportHTML();
    downloadBlob(html, 'text/html;charset=utf-8', `cronica-${slugify(cur.alias)}-${dateSlug()}.html`);
  };
  s.querySelector('#btn-exportar-cronica-doc').onclick = ()=>{
    downloadBlob(buildCronicaWordCompatible(), 'application/msword;charset=utf-8', `cronica-${slugify(cur.alias)}-${dateSlug()}.doc`);
  };
  s.querySelector('#btn-regenerar-cronica').onclick = ()=> go('cronica-prompt');
  s.querySelector('#btn-atras-cronica').onclick = ()=> go('informe');
  s.querySelector('#btn-iniciar-narracion').onclick = ()=> iniciarNarracionCronica(cr);
  renderMigas(s.querySelector('#migas'));
  // La barra contextual ya contiene el retorno; no se duplica un pie fijo.
});

registerRoute('impresos-graficos', (s)=>{
  const inf = deepCleanText(cur.informe || {});
  const estadoGeneracion = getGenerationStatus(cur);
  const totalEtapasCaso = (inf.etapas || []).length;

  if(!totalEtapasCaso){
    s.innerHTML = `
      <div id="migas"></div>
      <div class="eyebrow">Impresos gráficos</div>
      <h2>No hay una lectura cargada</h2>
      <p class="body-text muted">Antes de generar cualquier imagen o tarjeta, entra a tu bitácora guardada para cargar la lectura correcta — así evitamos generar un prompt con datos vacíos o de otra sesión.</p>
    `;
    navFooter(s, [
      { label:'Ir a mi bitácora', onClick: ()=> go('historial') },
      { label:'Volver al informe', variant:'btn-ghost', onClick: ()=> go('informe') }
    ]);
    return;
  }

  const personas = getPersonasConEstrellas(inf);
  const estrellasTxt = n => '★'.repeat(n) + '☆'.repeat(3-n);
  const primerasEtapas = (inf.etapas || []).slice(0,3).map(e=>e.titulo).filter(Boolean).join(' · ');
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Impresos gráficos</div>
    <h2>Las imágenes de tu lectura</h2>
    <div class="verificacion-caso-box">
      <div class="verificacion-caso-titulo">Verifica que este es el caso correcto antes de generar</div>
      <div><strong>${esc(cur.alias || 'sin alias')}</strong> · ${totalEtapasCaso} etapas · ${personas.length} personas con conexión</div>
      ${primerasEtapas ? `<div class="muted" style="font-size:12px; margin-top:4px;">Primeras etapas: ${esc(primerasEtapas)}...</div>` : ''}
    </div>
    <p class="body-text muted">Cada una es un prompt distinto — cópialo, pégalo en tu IA de imágenes, genera.</p>
    <div class="spacer-md"></div>

    <div class="option-card" id="btn-ir-ilustrado">
      <div class="ocard-title">Mapa ilustrado</div>
      <div class="ocard-sub">Eje cronológico completo, un símbolo por etapa.</div>
    </div>
    <div class="option-card" id="btn-ir-red">
      <div class="ocard-title">Árbol de red</div>
      <div class="ocard-sub">La red de relaciones completa, centrada en tu alma.</div>
    </div>
    <div class="option-card collage-card ${(!estadoGeneracion.hasCronica || estadoGeneracion.cronicaDesactualizada) ? 'option-card-attention' : ''}" id="btn-ir-collage">
      <div class="ocard-title">Collage narrativo ${!estadoGeneracion.hasCronica ? '<span class="status-pill">Requiere crónica</span>' : (estadoGeneracion.cronicaDesactualizada ? '<span class="status-pill status-pill-warn">Actualizar</span>' : '')}</div>
      <div class="ocard-sub">Escenas ricas y colores saturados derivados de tu crónica, sin rostros identificables.</div>
    </div>

    <div class="spacer-md"></div>
    <div class="divider"></div>
    <div class="spacer-sm"></div>
    <div class="eyebrow">Tarjeta de persona</div>
    <p class="body-text muted">Elige a alguien de tu constelación — la tarjeta se genera aquí mismo, sin pasar por ninguna IA externa.</p>
    ${personas.length ? `
      <div class="field">
        <select id="select-persona-tarjeta">
          ${personas.map(p=>`<option value="${esc(p.persona)}">${estrellasTxt(p.estrellas)} · ${esc(p.persona)}</option>`).join('')}
        </select>
      </div>
      <div id="preview-tarjeta" style="margin:14px 0; max-width:320px;"></div>
      <div class="prompt-actions-row">
        <button class="btn btn-primary" id="btn-descargar-tarjeta" type="button">Descargar esta tarjeta (.png)</button>
        <button class="btn btn-ghost" id="btn-compartir-tarjeta" type="button" style="display:flex; align-items:center; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ICONO_COMPARTIR}</svg>
          Compartir
        </button>
      </div>
    ` : `<p class="body-text muted">Esta lectura todavía no tiene personas con suficiente conexión para generar una tarjeta.</p>`}

  `;

  s.querySelector('#btn-ir-ilustrado').onclick = ()=> go('mapa-visual-prompt', { tab:'ilustrado' });
  s.querySelector('#btn-ir-red').onclick = ()=> go('mapa-visual-prompt', { tab:'red' });
  s.querySelector('#btn-ir-collage').onclick = ()=> go('collage-prompt');

  if(personas.length){
    const selectEl = s.querySelector('#select-persona-tarjeta');
    const previewEl = s.querySelector('#preview-tarjeta');
    const actualizarPreview = ()=>{
      const p = personas.find(x=>x.persona === selectEl.value);
      if(!p) return;
      previewEl.innerHTML = buildTarjetaPersonaSVG(p, cur.alias);
    };
    actualizarPreview();
    selectEl.onchange = actualizarPreview;
    s.querySelector('#btn-descargar-tarjeta').onclick = ()=>{
      const p = personas.find(x=>x.persona === selectEl.value);
      if(!p) return;
      descargarTarjetaPersonaComoPNG(p, cur.alias);
    };
    s.querySelector('#btn-compartir-tarjeta').onclick = (e)=>{
      const p = personas.find(x=>x.persona === selectEl.value);
      if(!p) return;
      compartirTarjetaPersona(p, cur.alias, e.currentTarget);
    };
  }


  renderMigas(s.querySelector('#migas'));
  navFooter(s, [
    { label:'Volver al informe', variant:'btn-ghost', onClick: ()=> go('informe') }
  ]);
});

registerRoute('collage-prompt', (s)=>{
  const estado = getGenerationStatus(cur);
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Collage narrativo</div>
    <h2>La imagen atmosférica de tu crónica</h2>
    <p class="body-text muted">Aquí sí se permiten escenas ricas y colores saturados, pero nunca el rostro identificable de una persona real.</p>
    ${!estado.hasCronica ? `
      <div class="generation-alert"><strong>Primero necesitas una crónica.</strong> El collage toma sus escenas de ese texto narrativo.</div>
      <div class="option-card option-card-attention" id="btn-collage-generar-cronica">
        <div class="ocard-title">Generar crónica</div>
        <div class="ocard-sub">Abre el prompt y el acceso a las IA externas.</div>
      </div>
    ` : `
      ${estado.lecturaDesactualizada ? `<div class="generation-alert"><strong>La lectura está desactualizada.</strong> Conviene generar una nueva lectura antes de rehacer la crónica y el collage.</div>` : (estado.cronicaDesactualizada ? `<div class="generation-alert"><strong>La crónica quedó desactualizada.</strong> Rehazla para que el collage represente la lectura actual.</div>` : '')}
      ${estado.cronicaDesactualizada ? `<div class="option-card option-card-attention" id="btn-collage-rehacer-cronica"><div class="ocard-title">${estado.lecturaDesactualizada ? 'Nueva lectura' : 'Rehacer crónica'}</div><div class="ocard-sub">${estado.lecturaDesactualizada ? 'Vuelve a Toca para revelar y actualiza toda la lectura.' : 'Genera una crónica sincronizada con la lectura actual.'}</div></div>` : ''}
      <div class="copy-only-panel">
        <div class="copy-only-title">Prompt del collage</div>
        <button class="btn btn-primary copy-pulse" id="btn-copy-collage" type="button">Copiar prompt del collage</button>
      </div>
      <div id="ai-access-collage"></div>
    `}
  `;
  const btnGenerar = s.querySelector('#btn-collage-generar-cronica');
  if(btnGenerar) btnGenerar.onclick = ()=> go('cronica-prompt');
  const btnRehacer = s.querySelector('#btn-collage-rehacer-cronica');
  if(btnRehacer) btnRehacer.onclick = ()=> go(estado.lecturaDesactualizada ? 'tirada' : 'cronica-prompt');
  const btnCopy = s.querySelector('#btn-copy-collage');
  if(btnCopy){
    btnCopy.onclick = async ()=>{
      const prompt = buildPromptCollageNarrativo();
      if(!prompt) return;
      await copyPromptButton(btnCopy, prompt, s.querySelector('#ai-access-collage'));
    };
    renderAIExternalPanel(s.querySelector('#ai-access-collage'), ()=>buildPromptCollageNarrativo(), { title:'Abrir IA para el collage', detail:'Se copia el prompt del collage narrativo y se abre la IA externa.' });
  }
  renderMigas(s.querySelector('#migas'));
  navFooter(s, [
    { label:'Volver a imágenes', variant:'btn-ghost', onClick: ()=> go('impresos-graficos') }
  ]);
});

registerRoute('mapa-visual-prompt', (s, opts={})=>{
  const promptIlustrado = buildPromptMapaIlustrado();
  const promptRed = buildPromptMapaRed();
  const payload = buildPayloadVisualMapa();
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Mapa conceptual simbólico</div>
    <h2>Dos imágenes, dos objetivos</h2>
    <p class="body-text muted">Genera las dos imágenes por separado, una por pestaña.</p>
    <div class="pasos-dos-imagenes">
      Copia el prompt, pégalo en tu IA, genera. Repite en la otra pestaña para la segunda imagen.
      <div class="pasos-check-row">
        <span class="paso-check" id="check-ilustrado">○ Paso 1 · Mapa ilustrado — sin copiar todavía</span>
        <span class="paso-check" id="check-red">○ Paso 2 · Árbol de red y trayectorias — sin copiar todavía</span>
      </div>
    </div>
    ${payload.totalEtapasReales > 15 ? `<p class="body-text muted" style="color:var(--warn);">Tu lectura tiene ${payload.totalEtapasReales} etapas — el prompt ya incluye una instrucción de densidad adaptativa para que el generador comprima el detalle por etapa en vez de recortar cuántas aparecen.</p>` : ''}
    ${!payload.arcosRelacionales.length ? `<p class="body-text muted">Esta lectura todavía no tiene arcos relacionales con evidencia suficiente — el mapa de red mostrará solo las conexiones simples, sin trayectoria adicional.</p>` : ''}
    <div class="toggle-row">
      <div class="toggle-btn activo" id="btn-tab-ilustrado">Mapa ilustrado</div>
      <div class="toggle-btn" id="btn-tab-red">Árbol de red</div>
    </div>

    <div class="vista activa" id="tab-ilustrado">
      <p class="body-text muted" style="margin-top:10px;"><strong>Paso 1 de 2.</strong> Eje cronológico con un símbolo por etapa. No incluye árbol genealógico ni arcos — prioriza claridad y economía visual.</p>
      <div class="copy-only-panel">
        <div class="copy-only-title">Prompt del mapa ilustrado</div>
        <button class="btn btn-primary copy-pulse" id="btn-copy-ilustrado" type="button">Copiar prompt ilustrado</button>
      </div>
      <div id="ai-access-ilustrado"></div>
    </div>

    <div class="vista" id="tab-red">
      <p class="body-text muted" style="margin-top:10px;"><strong>Paso 2 de 2, por separado.</strong> Árbol genealógico, arcos de retorno y la trayectoria de cada vínculo con evidencia real —rol pasado, qué se superó, qué sigue en tránsito— fusionados en una sola imagen. Aquí también se distingue pareja actual, interés romántico sin definir y ex pareja con líneas distintas.</p>
      <div class="copy-only-panel">
        <div class="copy-only-title">Prompt del árbol de red</div>
        <button class="btn btn-primary copy-pulse" id="btn-copy-red" type="button">Copiar prompt de red</button>
      </div>
      <div id="ai-access-red"></div>
    </div>

    <div class="prompt-actions-row" style="margin-top:14px;">
      <button class="btn btn-ghost" id="btn-json-payload" type="button">Descargar payload visual (.json)</button>
    </div>
  `;

  s.querySelector('#btn-tab-ilustrado').onclick = ()=>{
    s.querySelector('#btn-tab-ilustrado').classList.add('activo'); s.querySelector('#btn-tab-red').classList.remove('activo');
    s.querySelector('#tab-ilustrado').classList.add('activa'); s.querySelector('#tab-red').classList.remove('activa');
  };
  s.querySelector('#btn-tab-red').onclick = ()=>{
    s.querySelector('#btn-tab-red').classList.add('activo'); s.querySelector('#btn-tab-ilustrado').classList.remove('activo');
    s.querySelector('#tab-red').classList.add('activa'); s.querySelector('#tab-ilustrado').classList.remove('activa');
  };
  if(opts.tab === 'red') s.querySelector('#btn-tab-red').click();

  s.querySelector('#btn-copy-ilustrado').onclick = async ()=>{
    await copyPromptButton(s.querySelector('#btn-copy-ilustrado'), promptIlustrado, s.querySelector('#ai-access-ilustrado'));
    const chk = s.querySelector('#check-ilustrado');
    chk.textContent = '● Paso 1 · Mapa ilustrado — copiado, listo para pegar en tu IA';
    chk.classList.add('paso-hecho');
  };
  s.querySelector('#btn-copy-red').onclick = async ()=>{
    await copyPromptButton(s.querySelector('#btn-copy-red'), promptRed, s.querySelector('#ai-access-red'));
    const chk = s.querySelector('#check-red');
    chk.textContent = '● Paso 2 · Árbol de red y trayectorias — copiado, listo para pegar en tu IA';
    chk.classList.add('paso-hecho');
  };
  s.querySelector('#btn-json-payload').onclick = ()=> downloadJSON(payload, `payload-mapa-${slugify(cur.alias)}-${dateSlug()}.json`);

  renderAIExternalPanel(s.querySelector('#ai-access-ilustrado'), ()=>promptIlustrado, { title:'Abrir IA para el mapa ilustrado', detail:'Se copia el prompt del mapa ilustrado y se abre la IA externa.' });
  renderAIExternalPanel(s.querySelector('#ai-access-red'), ()=>promptRed, { title:'Abrir IA para el árbol de red', detail:'Se copia el prompt del árbol de red y se abre la IA externa.' });
  renderMigas(s.querySelector('#migas'));

  navFooter(s, [
    { label:'Volver a impresos gráficos', variant:'btn-ghost', onClick: ()=> go('impresos-graficos') }
  ]);
});

registerRoute('guardado-ok', (s)=>{
  s.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <div class="home-mark"></div>
      <h2>Quedó guardado en tu bitácora</h2>
      <p class="body-text muted" style="margin-top:10px;">Puedes seguir alimentándola más adelante, a medida que recuerdes o descubras algo nuevo. Queda guardado solo en este navegador — si quieres conservarlo o pasarlo a otro dispositivo, exporta el archivo .json.</p>
    </div>
  `;
  navFooter(s, [
    { label:'Ver mi bitácora', onClick: ()=>{ resetSession(); go('historial'); } },
    { label:'Volver al inicio', variant:'btn-ghost', onClick: ()=>{ resetSession(); go('home'); } },
  ]);
});

registerRoute('guardado-error', (s)=>{
  s.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <div class="home-mark"></div>
      <h2>No pudimos guardar en este navegador</h2>
      <p class="body-text muted" style="margin-top:10px;">Puede que el almacenamiento local esté desactivado o lleno. Tu lectura no se perdió: usa "Exportar caso completo" para descargarla en un archivo antes de salir de esta pantalla.</p>
    </div>
  `;
  navFooter(s, [
    { label:'Volver a la lectura', onClick: ()=> go('informe') },
    { label:'Volver al inicio sin guardar', variant:'btn-ghost', onClick: ()=>{ resetSession(); go('home'); } },
  ]);
});

registerRoute('historial', async (s)=>{
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Tu bitácora</div>
    <h2>Lecturas guardadas</h2>
    <p class="body-text muted" style="margin-top:8px;">Cada tarjeta es una bitácora principal. Las actualizaciones se guardan sobre la misma entrada y, cuando cambia el informe, se conserva una versión interna anterior.</p>
    <div class="spacer-md"></div>
    <div class="prompt-actions-row compact" style="margin-bottom:12px;">
      <button class="btn btn-ghost" id="btn-limpiar-duplicados" type="button">Eliminar duplicados exactos</button>
    </div>
    <p class="muted" id="historial-msg" style="display:none; color:var(--guide);"></p>
    <div id="historial-list"><p class="muted">Cargando...</p></div>
  `;
  renderMigas(s.querySelector('#migas'));
  navFooter(s, [
    { label:'Nueva lectura', onClick: ()=> { resetSession(); go('alias'); } },
    { label:'Volver al inicio', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);

  const list = s.querySelector('#historial-list');
  const msg = s.querySelector('#historial-msg');
  s.querySelector('#btn-limpiar-duplicados').onclick = async ()=>{
    const n = await eliminarDuplicadosExactos();
    msg.textContent = n ? `Se eliminaron ${n} duplicado${n>1?'s':''} exacto${n>1?'s':''}.` : 'No se encontraron duplicados exactos.';
    msg.style.display = 'block';
    setTimeout(()=> go('historial', {}, {replace:true}), 900);
  };

  const idx = await loadIndex();
  if(idx.length === 0){
    list.innerHTML = `
      <p class="muted">Aún no tienes lecturas guardadas.</p>
      <div class="option-card" id="btn-ir-a-comenzar" style="border-color:var(--ember-dim); margin-top:10px;">
        <div class="ocard-title" style="color:var(--ember);">Ir al inicio y comenzar una</div>
      </div>
    `;
    const btnIr = list.querySelector('#btn-ir-a-comenzar');
    if(btnIr) btnIr.onclick = ()=> go('home');
    return;
  }
  list.innerHTML = '';
  idx.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'option-card';
    const fecha = new Date(item.fecha);
    const fechaTxt = fecha.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
    const versionesTxt = item.versiones ? `<span class="version-badge">${item.versiones} versión${item.versiones>1?'es':''}</span>` : '';
    card.innerHTML = `
      <div class="ocard-title">${esc(item.alias)} ${versionesTxt}</div>
      <div class="ocard-sub">Caso principal · última actualización: ${fechaTxt}${item.versiones ? ' · conserva historial interno' : ''}</div>
      <div class="historial-actions">
        <button type="button" class="btn btn-ghost" data-open="${esc(item.id)}">Abrir</button>
        <button type="button" class="btn-mini-danger" data-delete="${esc(item.id)}">Eliminar</button>
      </div>
    `;
    card.onclick = ()=> go('panel-bitacora', { entryId: item.id });
    card.querySelector('[data-open]').onclick = (e)=>{ e.stopPropagation(); go('panel-bitacora', { entryId: item.id }); };
    card.querySelector('[data-delete]').onclick = (e)=>{ e.stopPropagation(); go('confirmar-eliminar', { entryId: item.id, alias: item.alias }); };
    list.appendChild(card);
  });
});

registerRoute('panel-bitacora', async (s, opts)=>{
  s.innerHTML = `<p class="muted">Cargando bitácora...</p>`;
  const entry = await loadEntry(opts.entryId);
  if(!entry){
    s.innerHTML = `<p class="muted">No pudimos encontrar esta bitácora.</p>`;
    navFooter(s, [{ label:'Volver', variant:'btn-ghost', onClick: ()=> go('historial') }]);
    return;
  }

  const cargarEnSesion = ()=>{
    cur.alias = entry.alias;
    cur.moduloA = { autodescripcion:'', patron:'', rasgo:'', sensaciones:'', ...entry.moduloA };
    cur.moduloB = entry.moduloB;
    cur.moduloC = entry.moduloC || [];
    cur.moduloD = entry.moduloD || { descripcion:'' };
    cur.moduloE = entry.moduloE || [];
    cur.tirada = entry.tirada || null;
    cur.informe = entry.informe || null;
    cur.cronica = entry.cronica || null;
    cur.generationMeta = entry.generationMeta || null;
    cur.ajustesInforme = entry.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] };
    ensureAjustesInforme();
    ensureGenerationMeta(cur, entry.updatedAt || entry.fecha);
    cur._editingEntryId = entry.id;
  };

  const fecha = new Date(entry.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Tu bitácora</div>
    <div class="alias-editable-row">
      <h2 id="alias-titulo">${esc(entry.alias)}</h2>
      <button type="button" class="pencil-btn" id="btn-editar-alias" aria-label="Editar nombre de esta bitácora"><span aria-hidden="true">✎</span></button>
    </div>
    <div id="alias-edit-box" style="display:none;">
      <div class="field">
        <input type="text" id="alias-input" value="${esc(entry.alias)}" maxlength="80">
      </div>
      <div class="prompt-actions-row compact">
        <button class="btn btn-primary" id="btn-guardar-alias" type="button">Guardar nombre</button>
        <button class="btn btn-ghost" id="btn-cancelar-alias" type="button">Cancelar</button>
      </div>
    </div>
    <p class="muted" style="margin-top:6px;">Última actualización: ${fecha}${entry.versiones && entry.versiones.length ? ' · ' + entry.versiones.length + ' versión(es) anterior(es)' : ''}</p>
    <div class="spacer-md"></div>
    <p class="body-text muted">Elige qué quieres hacer. Este es un caso principal: las actualizaciones se guardan aquí mismo y las lecturas anteriores quedan como versiones internas, no como duplicados.</p>
    <div class="spacer-md"></div>
    ${entry.informe ? `<div class="option-card" id="btn-ver-lectura"><div class="ocard-title" style="color:var(--ember);">Ver la última lectura</div></div>` : ''}
    ${(entry.versiones && entry.versiones.length) ? `<div class="option-card" id="btn-versiones"><div class="ocard-title">Ver versiones anteriores (${entry.versiones.length})</div><div class="ocard-sub">Se guardan dentro de esta misma bitácora, no como duplicados.</div></div>` : ''}

    <div class="spacer-md"></div>
    <div class="option-card" id="btn-editar-1"><div class="ocard-title">Editar módulo 1 · Quién eres hoy</div></div>
    <div class="option-card" id="btn-editar-2"><div class="ocard-title">Editar módulo 2 · Guías y presencias</div></div>
    <div class="option-card" id="btn-editar-3"><div class="ocard-title">Editar módulo 3 · Vínculos</div></div>
    <div class="option-card" id="btn-editar-4"><div class="ocard-title">Editar módulo 4 · Mapa familiar</div></div>
    <div class="option-card" id="btn-editar-5"><div class="ocard-title">Editar módulo 5 · Momentos difíciles</div></div>
    <div class="option-card" id="btn-nueva-lectura"><div class="ocard-title">Generar una nueva lectura con estos datos</div></div>
    <div class="spacer-sm"></div>
    <div class="option-card" id="btn-exportar-panel" style="border-color:var(--guide-dim);"><div class="ocard-title" style="color:var(--guide);">Exportar caso completo (.json)</div></div>
    <div class="option-card" id="btn-eliminar-panel" style="border-color:var(--ember-dim);"><div class="ocard-title" style="color:var(--ember);">Eliminar esta bitácora</div></div>
  `;

  const cajaEditarAlias = s.querySelector('#alias-edit-box');
  const filaAlias = s.querySelector('.alias-editable-row');
  s.querySelector('#btn-editar-alias').onclick = ()=>{
    filaAlias.style.display = 'none';
    cajaEditarAlias.style.display = 'block';
    s.querySelector('#alias-input').focus();
    s.querySelector('#alias-input').select();
  };
  s.querySelector('#btn-cancelar-alias').onclick = ()=>{
    cajaEditarAlias.style.display = 'none';
    filaAlias.style.display = 'flex';
  };
  s.querySelector('#btn-guardar-alias').onclick = async ()=>{
    const nuevoAlias = s.querySelector('#alias-input').value.trim();
    if(!nuevoAlias){ s.querySelector('#alias-input').focus(); return; }
    entry.alias = nuevoAlias;
    const ok = await saveEntry(entry);
    if(ok){ go('panel-bitacora', { entryId: entry.id }, { replace:true }); }
  };

  renderMigas(s.querySelector('#migas'));
  const goModulo = (ruta)=>{ cargarEnSesion(); go(ruta); };

  if(entry.informe) s.querySelector('#btn-ver-lectura').onclick = ()=>{ cargarEnSesion(); go('informe'); };
  const btnVersiones = s.querySelector('#btn-versiones');
  if(btnVersiones) btnVersiones.onclick = ()=> go('versiones-bitacora', { entryId: entry.id });
  s.querySelector('#btn-editar-1').onclick = ()=> goModulo('modA');
  s.querySelector('#btn-editar-2').onclick = ()=> goModulo('modB');
  s.querySelector('#btn-editar-3').onclick = ()=> goModulo('modC');
  s.querySelector('#btn-editar-4').onclick = ()=> goModulo('modD');
  s.querySelector('#btn-editar-5').onclick = ()=> goModulo('modE');
  s.querySelector('#btn-nueva-lectura').onclick = ()=> goModulo('tirada');
  s.querySelector('#btn-exportar-panel').onclick = ()=>{
    downloadJSON({
      id: entry.id, alias: entry.alias, fecha_exportacion: new Date().toISOString(),
      createdAt: entry.createdAt || entry.fecha, updatedAt: entry.updatedAt || entry.fecha,
      moduloA: entry.moduloA, moduloB: entry.moduloB, moduloC: entry.moduloC,
      moduloD: entry.moduloD, moduloE: entry.moduloE, tirada: entry.tirada, informe: entry.informe,
      cronica: entry.cronica || null,
      generationMeta: ensureGenerationMeta(entry, entry.updatedAt || entry.fecha),
      ajustesInforme: entry.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] },
    }, `bitacora-${slugify(entry.alias)}-${dateSlug()}.json`);
  };
  s.querySelector('#btn-eliminar-panel').onclick = ()=> go('confirmar-eliminar', { entryId: entry.id, alias: entry.alias });

  navFooter(s, [
    { label:'Volver a mi bitácora', variant:'btn-ghost', onClick: ()=> go('historial') },
  ]);
});

registerRoute('versiones-bitacora', async (s, opts)=>{
  const entry = await loadEntry(opts.entryId);
  if(!entry){
    s.innerHTML = `<p class="muted">No pudimos encontrar esta bitácora.</p>`;
    navFooter(s, [{ label:'Volver', variant:'btn-ghost', onClick: ()=> go('historial') }]);
    return;
  }
  const versiones = Array.isArray(entry.versiones) ? entry.versiones : [];
  s.innerHTML = `
    <div id="migas"></div>
    <div class="eyebrow">Versiones internas</div>
    <h2>${esc(entry.alias)}</h2>
    <p class="body-text muted">Estas versiones se conservaron dentro de la misma bitácora cuando actualizaste el informe. No son lecturas duplicadas en el historial.</p>
    <div class="spacer-md"></div>
    <div id="versiones-list"></div>
  `;
  renderMigas(s.querySelector('#migas'));
  const list = s.querySelector('#versiones-list');
  if(!versiones.length){
    list.innerHTML = `<p class="muted">Esta bitácora todavía no tiene versiones anteriores.</p>`;
  }else{
    versiones.slice().reverse().forEach((v, i)=>{
      const fechaObj = new Date(v.fecha || Date.now());
      const fecha = fechaObj.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
      const hora = fechaObj.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
      const esMasReciente = i === 0;
      const card = document.createElement('div');
      card.className = 'option-card' + (esMasReciente ? ' version-mas-reciente' : '');
      card.innerHTML = `
        <div class="ocard-title">Versión anterior ${versiones.length - i}${esMasReciente ? ' <span class="tag-reciente">Más reciente</span>' : ''}</div>
        <div class="ocard-sub">${fecha} · ${hora}</div>
      `;
      card.onclick = ()=>{
        const aliasBase = String(entry.alias || '').replace(/(\s*·\s*versión anterior\s*)+$/i, '').trim();
        cur.alias = aliasBase + ' · versión anterior';
        cur.moduloA = entry.moduloA || {}; cur.moduloB = entry.moduloB || {}; cur.moduloC = entry.moduloC || []; cur.moduloD = entry.moduloD || {}; cur.moduloE = entry.moduloE || [];
        cur.tirada = v.tirada || entry.tirada || null;
        cur.informe = v.informe || null;
        cur.cronica = null;
        cur.generationMeta = { lecturaDatosSignature:null, lecturaGeneradaEn:v.fecha || entry.fecha || null, cronicaInformeSignature:null, cronicaGeneradaEn:null };
        cur.ajustesInforme = v.ajustesInforme || entry.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] };
        ensureGenerationMeta(cur, v.fecha || entry.fecha);
        cur._editingEntryId = entry.id;
        if(cur.informe) go('informe');
      };
      list.appendChild(card);
    });
  }
  navFooter(s, [{ label:'Volver', variant:'btn-ghost', onClick: ()=> go('panel-bitacora', { entryId: entry.id }) }]);
});

registerRoute('confirmar-eliminar', (s, opts)=>{
  s.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <div class="home-mark"></div>
      <h2>¿Eliminar "${esc(opts.alias)}"?</h2>
      <p class="body-text muted" style="margin-top:10px;">Esta acción no se puede deshacer. Si quieres conservar los datos, expórtalos primero como .json desde el panel anterior.</p>
    </div>
  `;
  navFooter(s, [
    { label:'Sí, eliminar definitivamente', onClick: async ()=>{
      await deleteEntry(opts.entryId);
      go('historial');
    }},
    { label:'Cancelar', variant:'btn-ghost', onClick: ()=> go('panel-bitacora', { entryId: opts.entryId }) },
  ]);
});

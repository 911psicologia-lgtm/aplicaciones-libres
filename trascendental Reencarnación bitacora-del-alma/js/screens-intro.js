/* ============================================================
   PANTALLA SPLASH DE INICIO
   ============================================================ */

registerRoute('splash', (s)=>{
  s.classList.add('screen-splash');
  s.innerHTML = `
    <button type="button" class="splash-skip" id="splash-skip">Omitir</button>
    <div class="splash-wrap">
      <div class="splash-glow" aria-hidden="true"></div>
      <img src="assets/branding/splash-inicio.png" alt="Bitácora del Alma" class="splash-hero">
      <div class="splash-copy">retornos y resonancias</div>
    </div>
  `;

  const leaveSplash = ()=>{
    if(s.dataset.leaving === '1') return;
    s.dataset.leaving = '1';
    s.classList.add('splash-fade-out');
    setTimeout(()=> go('home', {}, { resetHistory:true, replace:true }), 420);
  };

  const timer = setTimeout(leaveSplash, 2600);
  s.querySelector('#splash-skip').onclick = ()=>{ clearTimeout(timer); leaveSplash(); };
  s.querySelector('.splash-wrap').onclick = ()=>{ clearTimeout(timer); leaveSplash(); };
});

/* ============================================================
   PANTALLAS — parte 1: home, alias, módulo A
   ============================================================ */

registerRoute('home', (s)=>{
  s.classList.add('home-screen');
  s.innerHTML = `
    <div class="home-hero-panel">
      <button type="button" class="home-manual-pill" id="home-manual" aria-label="Abrir manual rápido">Guía rápida</button>
      <div class="home-hero-art">
        <img src="assets/branding/home-simbolo.png" alt="Símbolo visual de Bitácora del Alma" class="home-hero-img">
      </div>
      <div class="home-hero-copy">
        <div class="eyebrow home-eyebrow">Bitácora del alma</div>
        <h1>Retornos y resonancias<br>para pensar tu vida</h1>
        <p class="lead">Un ejercicio simbólico de introspección, inspirado en tradiciones sobre la reencarnación y el aprendizaje del alma. No pretende probar nada: organiza resonancias, vínculos y preguntas para reflexionar.</p>
        <div class="home-mini-tags">
          <span class="tag">PWA instalable</span>
          <span class="tag">Lectura simbólica</span>
          <span class="tag">Mapas conceptuales</span>
        </div>
      </div>
    </div>

    <div id="home-draft-entry" class="home-last-entry"></div>
    <div id="home-last-entry" class="home-last-entry"></div>

    <div class="home-grid-actions">
      <button type="button" class="home-action-card home-action-primary" id="home-comenzar">
        <span class="home-action-icon">✦</span>
        <span class="home-action-body">
          <span class="home-action-title">Comenzar nueva bitácora</span>
          <span class="home-action-sub">Recorre los 5 módulos y construye tu lectura paso a paso.</span>
        </span>
      </button>

      <button type="button" class="home-action-card home-quick-card" id="home-rapido">
        <span class="home-action-icon">↯</span>
        <span class="home-action-body">
          <span class="home-action-title">Modo rápido</span>
          <span class="home-action-sub">5 preguntas esenciales para una lectura breve y ampliable.</span>
        </span>
      </button>

      <button type="button" class="home-action-card home-interview-card" id="home-entrevista">
        <span class="home-action-icon">?</span>
        <span class="home-action-body">
          <span class="home-action-title">Entrevista guiada por IA</span>
          <span class="home-action-sub">Copia un prompt y deja que una IA externa te pregunte paso a paso.</span>
        </span>
      </button>

      <button type="button" class="home-action-card home-demo-card" id="btn-demo-helena">
        <span class="home-action-icon">☽</span>
        <span class="home-action-body">
          <span class="home-action-title">Ver caso Helena</span>
          <span class="home-action-sub">Demo completo con etapas, retornos, períodos y aprendizajes.</span>
        </span>
      </button>

      <button type="button" class="home-action-card" id="home-importar">
        <span class="home-action-icon">✎</span>
        <span class="home-action-body">
          <span class="home-action-title">Importar historia escrita</span>
          <span class="home-action-sub">Pega tu historia o dicta y deja que la app la organice.</span>
        </span>
      </button>

      <button type="button" class="home-action-card" id="home-cargar">
        <span class="home-action-icon">⇪</span>
        <span class="home-action-body">
          <span class="home-action-title">Importar una bitácora</span>
          <span class="home-action-sub">Añade un caso guardado sin reemplazar los demás.</span>
        </span>
      </button>

      <button type="button" class="home-action-card" id="home-historial">
        <span class="home-action-icon">☰</span>
        <span class="home-action-body">
          <span class="home-action-title">Bitácoras guardadas</span>
          <span class="home-action-sub">Abre, actualiza o limpia lecturas previas.</span>
        </span>
      </button>

      <button type="button" class="home-action-card" id="home-respaldo">
        <span class="home-action-icon">⇅</span>
        <span class="home-action-body">
          <span class="home-action-title">Respaldo completo de la aplicación</span>
          <span class="home-action-sub">Exporta o restaura todas tus bitácoras a la vez, no solo una.</span>
        </span>
      </button>

      <button type="button" class="home-action-card" id="home-privacidad">
        <span class="home-action-icon">◌</span>
        <span class="home-action-body">
          <span class="home-action-title">Privacidad y borrado</span>
          <span class="home-action-sub">Revisa dónde quedan tus datos y bórralos cuando lo necesites.</span>
        </span>
      </button>

      <button type="button" class="home-action-card home-guide-card" id="btn-principios">
        <span class="home-action-icon">13</span>
        <span class="home-action-body">
          <span class="home-action-title">Principios y marco simbólico</span>
          <span class="home-action-sub">13 principios de las tradiciones en que se inspira esta app.</span>
        </span>
      </button>
    </div>

    <div class="home-footnote">
      <p class="body-text muted">No sustituye acompañamiento médico, psicológico ni espiritual profesional.</p>
    </div>
  `;

  const comenzarFlujoNuevo = (routeName)=>{
    const draft = getSessionDraftSummary();
    if(draft && !confirm('Hay un borrador sin guardar. ¿Quieres descartarlo y comenzar un proceso nuevo?')) return;
    resetSession();
    go(routeName);
  };
  s.querySelector('#home-comenzar').onclick = ()=> comenzarFlujoNuevo('alias');
  s.querySelector('#home-rapido').onclick = ()=> comenzarFlujoNuevo('modo-rapido');
  s.querySelector('#home-entrevista').onclick = ()=> comenzarFlujoNuevo('entrevista-ia');
  s.querySelector('#home-manual').onclick = ()=> go('manual');
  s.querySelector('#home-privacidad').onclick = ()=> go('privacidad');
  s.querySelector('#btn-principios').onclick = ()=> go('principios');
  s.querySelector('#btn-demo-helena').onclick = ()=> { loadDemoHelena(); go('informe'); };
  s.querySelector('#home-importar').onclick = ()=> comenzarFlujoNuevo('importar-alias');
  s.querySelector('#home-cargar').onclick = ()=> go('cargar-json');
  s.querySelector('#home-historial').onclick = ()=> go('historial');
  s.querySelector('#home-respaldo').onclick = ()=> go('respaldo-completo');

  const draft = getSessionDraftSummary();
  const draftBox = s.querySelector('#home-draft-entry');
  if(draft && draftBox){
    const fechaBorrador = new Date(draft.updatedAt || Date.now()).toLocaleString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
    draftBox.innerHTML = `
      <div class="home-draft-card">
        <button type="button" class="home-continue-card" id="home-continuar-borrador">
          <span class="home-action-icon">✎</span>
          <span class="home-action-body">
            <span class="home-action-title">Continuar borrador sin guardar</span>
            <span class="home-action-sub">${esc(draft.alias)} · ${esc(draft.routeLabel)} · ${esc(fechaBorrador)}</span>
          </span>
        </button>
        <button type="button" class="home-draft-discard" id="home-descartar-borrador">Descartar borrador</button>
      </div>`;
    draftBox.querySelector('#home-continuar-borrador').onclick = ()=> resumeSessionDraft();
    draftBox.querySelector('#home-descartar-borrador').onclick = ()=>{
      if(!confirm('¿Descartar este borrador sin guardar?')) return;
      clearSessionDraft();
      draftBox.innerHTML = '';
    };
  }

  loadLastEntrySummary().then(last=>{
    const box = s.querySelector('#home-last-entry');
    if(!last){
      const tituloComenzar = s.querySelector('#home-comenzar .home-action-title');
      if(tituloComenzar) tituloComenzar.insertAdjacentHTML('afterend', '<span class="home-etiqueta-nueva">Empieza aquí si es tu primera vez</span>');
      return;
    }
    if(!box) return;
    const fecha = new Date(last.updatedAt || last.fecha || Date.now()).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
    box.innerHTML = `
      <button type="button" class="home-continue-card" id="home-continuar">
        <span class="home-action-icon">↺</span>
        <span class="home-action-body">
          <span class="home-action-title">Continuar última bitácora</span>
          <span class="home-action-sub">${esc(last.alias || 'Sin alias')} · actualizada ${esc(fecha)}</span>
        </span>
      </button>
    `;
    box.querySelector('#home-continuar').onclick = ()=> go('panel-bitacora', { entryId:last.id });
  });
});


registerRoute('manual', (s)=>{
  s.innerHTML = `
    <div class="manual-head">
      <div class="eyebrow">Manual rápido</div>
      <h2>Cómo usar Bitácora del Alma</h2>
      <p class="body-text muted">Guía breve para avanzar sin perder información. La lectura es presuntoria: organiza resonancias simbólicas, no hechos comprobados.</p>
    </div>

    <div class="manual-steps">
      <div class="manual-step">
        <span class="manual-num">1</span>
        <div><strong>Elige cómo empezar</strong><p>Nueva bitácora, historia escrita, caso Helena o archivo JSON guardado.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">2</span>
        <div><strong>Completa los módulos o usa entrevista IA</strong><p>Escribe, dicta con micrófono o copia el prompt de entrevista para que una IA externa te pregunte paso a paso.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">3</span>
        <div><strong>Cuida el módulo de vínculos</strong><p>Agrega personas actuales, edita tarjetas y usa el micrófono para ampliar la historia de cada relación.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">4</span>
        <div><strong>Genera el prompt</strong><p>Copia el prompt, ábrelo en tu IA preferida y pide que responda en texto plano dentro del chat.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">5</span>
        <div><strong>Pega la respuesta</strong><p>Pega el JSON o texto estructurado en el cajón de la app. Si algo salió incompleto, usa “Vaciar cajón”.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">6</span>
        <div><strong>Revisa el informe</strong><p>Comprueba etapas, períodos, eventos críticos, huellas actuales, aprendizajes y reingresos relacionales.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">7</span>
        <div><strong>Ajusta fechas o períodos</strong><p>Si agregas años manualmente, guárdalos y luego genera una nueva lectura con esos ajustes integrados.</p></div>
      </div>
      <div class="manual-step">
        <span class="manual-num">8</span>
        <div><strong>Guarda y exporta</strong><p>Guarda la bitácora, exporta HTML/TXT/JSON y crea el prompt para mapa conceptual simbólico si lo necesitas.</p></div>
      </div>
    </div>

    <div class="manual-note">
      <strong>Clave de uso:</strong> no borres información valiosa. Si corriges vínculos, períodos o narrativas, la app los conserva como ajustes del usuario.
    </div>
  `;

  navFooter(s, [
    { label:'Comenzar', onClick: ()=> go('alias') },
    { label:'Volver', variant:'btn-ghost', onClick: ()=> go('home') }
  ]);
});



registerRoute('privacidad', (s)=>{
  s.innerHTML = `
    <div class="manual-head">
      <div class="eyebrow">Privacidad</div>
      <h2>Datos locales y borrado seguro</h2>
      <p class="body-text muted">Bitácora del Alma funciona como app estática/PWA. Tus bitácoras se guardan en este navegador mediante almacenamiento local. No hay servidor propio de la app recibiendo tus relatos.</p>
    </div>

    <div class="privacy-grid">
      <div class="privacy-card">
        <span class="tag">Dónde queda</span>
        <p>En el dispositivo y navegador donde usas la app. Si cambias de celular o limpias el navegador, podrías perderlo si no exportaste JSON.</p>
      </div>
      <div class="privacy-card">
        <span class="tag">IA externa</span>
        <p>Cuando copias un prompt y lo pegas en ChatGPT, Claude, Gemini u otra IA, esa información sale de la app y pasa a las condiciones de ese servicio.</p>
      </div>
      <div class="privacy-card">
        <span class="tag">Exportaciones</span>
        <p>El HTML, TXT y JSON quedan como archivos en tu equipo. El JSON sirve para recuperar una bitácora completa.</p>
      </div>
      <div class="privacy-card">
        <span class="tag">Cuidado</span>
        <p>No uses la app como diagnóstico, prueba histórica ni sustituto de acompañamiento profesional. Es una herramienta simbólica-reflexiva.</p>
      </div>
    </div>

    <div class="manual-note">
      Antes de borrar, exporta tus bitácoras importantes desde el historial. El borrado local no se puede deshacer desde la app.
    </div>

    <div class="prompt-actions-row" style="margin-top:14px;">
      <button class="btn btn-ghost" id="btn-ir-historial" type="button">Ir a historial/exportar</button>
      <button class="btn btn-ghost danger-outline" id="btn-borrar-local" type="button">Borrar datos locales</button>
    </div>
    <p class="muted" id="privacy-msg" style="display:none; color:var(--guide); margin-top:10px;"></p>
  `;

  s.querySelector('#btn-ir-historial').onclick = ()=> go('historial');
  s.querySelector('#btn-borrar-local').onclick = async ()=>{
    const ok1 = confirm('Esto borrará bitácoras guardadas, historial e índice local de este navegador. ¿Continuar?');
    if(!ok1) return;
    const ok2 = confirm('Última confirmación: si no exportaste JSON, no podrás recuperar esos datos desde esta app.');
    if(!ok2) return;
    const n = await clearAllLocalData();
    const msg = s.querySelector('#privacy-msg');
    msg.textContent = n >= 0 ? `Listo: se borraron ${n} registros locales de Bitácora del Alma.` : 'No fue posible borrar los datos locales.';
    msg.style.display = 'block';
  };

  navFooter(s, [
    { label:'Volver', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});

registerRoute('modo-rapido', (s)=>{
  s.innerHTML = `
    <div class="manual-head">
      <div class="eyebrow">Modo rápido</div>
      <h2>Lectura breve en 5 preguntas</h2>
      <p class="body-text muted">Una entrada liviana para obtener una primera cartografía simbólica. Luego podrás ampliar módulos, vínculos y fechas.</p>
    </div>
    <div id="modo-rapido-fields"></div>
  `;

  const box = s.querySelector('#modo-rapido-fields');
  const fAlias = document.createElement('div');
  fAlias.className = 'field';
  fAlias.innerHTML = `
    <label>Alias de esta lectura</label>
    <input type="text" id="qr-alias" placeholder="Ej. Helena, José, Alma viajera..." value="${esc(cur.alias || '')}">
  `;
  box.appendChild(fAlias);

  const f1 = buildVoiceField({
    id:'qr-identidad',
    label:'1. ¿Quién eres hoy y qué estás buscando comprender?',
    hint:'Una síntesis libre de tu momento actual, rol vital, inquietud o búsqueda.',
    placeholder:'Escribe o dicta...',
    value: cur.moduloA.autodescripcion || ''
  });
  const f2 = buildVoiceField({
    id:'qr-patron',
    label:'2. ¿Qué patrón sientes que se repite en tu vida?',
    hint:'Cuidado, abandono, pérdidas, culpa, vínculos que vuelven, autoridad, miedo, deseo de reparar...',
    placeholder:'Escribe o dicta...',
    value: cur.moduloA.patron || ''
  });
  const f3 = buildVoiceField({
    id:'qr-suenos',
    label:'3. ¿Qué sueño, sensación, déjà vu o escena antigua recuerdas?',
    hint:'Incluye lugares, épocas, ropas, cuerpos, símbolos, agua, fuego, guerra, campo, templo, casa, camino, etc.',
    placeholder:'Escribe o dicta...',
    value: cur.moduloB.suenoGuia || ''
  });
  const f4 = buildVoiceField({
    id:'qr-vinculos',
    label:'4. ¿Qué personas actuales sientes antiguas o significativas?',
    hint:'Puedes nombrarlas con iniciales o apodos. Cuenta qué rol tienen y qué despiertan en ti.',
    placeholder:'Escribe o dicta...',
    value: (cur.moduloC || []).map(v=>`${v.nombre}: ${v.tipoVinculo || ''}. ${v.notas || ''}`).join('\n')
  });
  const f5 = buildVoiceField({
    id:'qr-eventos',
    label:'5. ¿Qué conflicto, pérdida, decisión o aprendizaje actual pesa más?',
    hint:'Agrega lo que sientas central para que la lectura no se quede abstracta.',
    placeholder:'Escribe o dicta...',
    value: cur.moduloD.descripcion || ''
  });

  [f1,f2,f3,f4,f5].forEach(f=> box.appendChild(f.el));

  navFooter(s, [
    { label:'Generar prompt rápido', onClick: ()=>{
      const alias = document.getElementById('qr-alias').value.trim() || 'Lectura rápida';
      cur.alias = alias;
      cur.moduloA = {
        autodescripcion: f1.getValue(),
        patron: f2.getValue(),
        rasgo: 'Entrada por modo rápido: síntesis inicial para cartografía simbólica.',
        sensaciones: ''
      };
      cur.moduloB = {
        presencias: '',
        amigoImaginario: '',
        suenoGuia: f3.getValue(),
        nombrePresencia: ''
      };
      const vincTxt = f4.getValue();
      cur.moduloC = vincTxt ? vincTxt.split(/\n+/).filter(Boolean).slice(0,12).map((line,i)=>({
        nombre: line.split(':')[0].trim() || ('Vínculo ' + (i+1)),
        tipoVinculo: 'Por clasificar',
        notas: line.includes(':') ? line.split(':').slice(1).join(':').trim() : line.trim()
      })) : [];
      cur.moduloD = { descripcion: f5.getValue() };
      cur.moduloE = [];
      cur.tirada = {
        antiguedad: pickRandom(ANTIGUEDAD),
        arquetipo: pickRandom(ARQUETIPOS),
        aprendizaje: pickRandom(APRENDIZAJES)
      };
      cur.ajustesInforme = { periodos: [], observaciones: [], correccionesEtapa: [] };
      cur._editingEntryId = null;
      cur.promptGenerado = buildPrompt() + `

NOTA DE MODO RÁPIDO:
Esta lectura viene de una entrada breve. Devuelve un informe más compacto que el modo guiado, pero conserva estructura JSON completa. Si falta información, marca "sin datos suficientes" y no inventes.`;
      go('prompt-listo');
    }},
    { label:'Volver', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});



function buildPromptEntrevistaIA(tipo='completa'){
  const nombreTipo = {
    completa:'entrevista completa',
    vinculos:'entrevista centrada en vínculos',
    simbolica:'entrevista simbólica profunda'
  }[tipo] || 'entrevista completa';

  const enfoque = {
    completa:`Vida actual, patrones, vínculos, sueños/presencias, marcas corporales, familia, duelos, eventos significativos y posibles escenas simbólicas.`,
    vinculos:`Vínculos actuales que se sienten antiguos, difíciles, protectores, amorosos, familiares, de deuda, reparación, juicio, cuidado o aprendizaje. Profundiza en personas, roles, emociones y ciclos.`,
    simbolica:`Sueños, presencias, déjà vu, escenas antiguas, cuerpos percibidos, edades, géneros simbólicos, lugares, épocas, muertes, tránsitos, guías, marcas corporales y señales de origen.`
  }[tipo] || '';

  return `Actúa como entrevistador/a simbólico/a para construir una Bitácora del Alma.

PROPÓSITO
No hagas todavía la lectura final. Primero entrevista a la persona paso a paso para recoger material de vida actual, vínculos, sueños, presencias y posibles estaciones narrativas/reencarnaciones simbólicas.

TIPO DE ENTREVISTA
${nombreTipo}
Enfoque: ${enfoque}

MARCO ÉTICO Y SIMBÓLICO
Esta entrevista es presuntoria y narrativa. No afirmes hechos históricos, diagnósticos ni verdades espirituales cerradas. Usa lenguaje cuidadoso: "podría resonar", "se puede leer como", "parece dialogar con". No conviertas duelos, síntomas, rupturas ni sufrimientos en castigos o destinos.

MODO DE ENTREVISTA
1. Haz una sola pregunta por turno.
2. Espera la respuesta antes de avanzar.
3. Permite respuestas largas, desordenadas o dictadas por voz.
4. Corrige mentalmente errores evidentes de dictado sin inventar contenido.
5. Después de cada bloque, resume en 3-5 líneas lo que entendiste y pregunta: "¿Quieres corregir, ampliar o seguimos?"
6. Si la persona responde "seguimos", continúa.
7. Si responde "corrijo", integra la corrección.
8. No entregues JSON hasta terminar la entrevista completa y recibir autorización final.

BLOQUES DE LA ENTREVISTA
${tipo === 'vinculos' ? `
Bloque 1. Alias y momento actual.
Bloque 2. Personas actuales significativas.
Bloque 3. Vínculos que se sienten antiguos.
Bloque 4. Vínculos difíciles o por reparar.
Bloque 5. Figuras protectoras, maestras o de juicio.
Bloque 6. Patrones afectivos que se repiten.
Bloque 7. Cierre y confirmación.
` : tipo === 'simbolica' ? `
Bloque 1. Alias y pregunta de búsqueda.
Bloque 2. Sueños, escenas antiguas o déjà vu.
Bloque 3. Presencias, guías, amigos imaginarios o figuras protectoras.
Bloque 4. Marcas corporales, sensaciones, miedos o atracciones sin explicación fácil.
Bloque 5. Épocas, lugares, géneros, edades o muertes/tránsitos percibidos.
Bloque 6. Vínculos actuales que podrían resonar con esas escenas.
Bloque 7. Cierre y confirmación.
` : `
Bloque 1. Alias y vida actual.
Bloque 2. Patrón que se repite.
Bloque 3. Sueños, presencias, déjà vu o escenas antiguas.
Bloque 4. Vínculos actuales que se sienten antiguos o significativos.
Bloque 5. Familia, duelos, eventos difíciles y aprendizajes.
Bloque 6. Marcas corporales, emociones, símbolos y períodos posibles.
Bloque 7. Cierre y confirmación.
`}

PREGUNTA FINAL OBLIGATORIA
Cuando termines todos los bloques, pregunta:
"¿Autorizas que organice todo en un JSON compatible con Bitácora del Alma para que lo pegues en la app?"

Solo si la persona responde sí, entrega ÚNICAMENTE un objeto JSON válido, sin markdown, sin explicación antes ni después, con esta estructura:

{
  "tipo_resultado": "bitacora_modulos",
  "tipo_entrevista": "${tipo}",
  "alias": "alias o nombre simbólico de la lectura",
  "moduloA": {
    "autodescripcion": "síntesis de quién es hoy y qué busca comprender",
    "patron": "patrón que se repite",
    "rasgo": "rasgo, atracción, miedo o sensación sin explicación fácil",
    "sensaciones": "marcas corporales, emociones recurrentes o sensaciones simbólicas"
  },
  "moduloB": {
    "presencias": "presencias protectoras, guías, figuras o escenas percibidas",
    "amigoImaginario": "amigo imaginario o figura de infancia, si existe",
    "suenoGuia": "sueño, escena antigua, déjà vu o imagen guía",
    "nombrePresencia": "nombre de la presencia, si existe"
  },
  "moduloC": [
    {
      "nombre": "nombre, inicial o rol de la persona actual",
      "tipoVinculo": "Familiar / Amoroso / Amistad profunda / Conflicto recurrente / Deuda o desequilibrio / Mentor o guía / Protector / Por clasificar",
      "notas": "historia del vínculo, sensación de antigüedad, emoción, conflicto o aprendizaje"
    }
  ],
  "moduloD": {
    "descripcion": "mapa familiar y relacional amplio, con contexto de crianza, linaje, duelos, vínculos, separaciones y figuras importantes"
  },
  "moduloE": [
    {
      "etapaVida": "infancia, adolescencia, adultez, separación, duelo, crisis, etc.",
      "personas": "personas implicadas",
      "sentimientos": "emociones principales",
      "esKarmico": "sí / no / no sabe / se siente simbólico",
      "descripcion": "evento difícil o aprendizaje significativo"
    }
  ],
  "nota_entrevista": "breve síntesis de lo que quedó fuerte y de lo que falta ampliar"
}

REGLAS DEL JSON FINAL
- Devuelve solo JSON válido.
- No uses bloque de código.
- No crees archivos descargables.
- No inventes fechas, muertes ni personas.
- Si falta información, escribe "sin datos suficientes".
- Si la persona usa voz y hay errores de dictado, corrige solo lo evidente por contexto.
- No generes todavía el informe de reencarnaciones. Este JSON es para cargar los módulos en la app.`;
}

function parseEntrevistaIA(raw){
  try{
    let txt = (raw || '').trim();
    txt = txt.replace(/^```json/i, '').replace(/^```/,'').replace(/```$/,'').trim();
    const first = txt.indexOf('{');
    const last = txt.lastIndexOf('}');
    if(first === -1 || last === -1) return null;
    const obj = JSON.parse(txt.slice(first, last+1));
    if(obj.tipo_resultado && obj.tipo_resultado !== 'bitacora_modulos') return null;
    return obj;
  }catch(e){
    return null;
  }
}

function cargarEntrevistaEnSesion(obj){
  cur.alias = obj.alias || cur.alias || 'Entrevista guiada';
  cur.moduloA = {
    autodescripcion:'',
    patron:'',
    rasgo:'',
    sensaciones:'',
    ...(obj.moduloA || {})
  };
  cur.moduloB = {
    presencias:'',
    amigoImaginario:'',
    suenoGuia:'',
    nombrePresencia:'',
    ...(obj.moduloB || {})
  };
  cur.moduloC = Array.isArray(obj.moduloC) ? obj.moduloC.map(v=>({
    nombre: v.nombre || 'Vínculo sin nombre',
    tipoVinculo: v.tipoVinculo || v.tipo || 'Por clasificar',
    notas: v.notas || v.descripcion || ''
  })) : [];
  cur.moduloD = {
    descripcion: (obj.moduloD && obj.moduloD.descripcion) || obj.mapa_familiar || ''
  };
  cur.moduloE = Array.isArray(obj.moduloE) ? obj.moduloE.map(e=>({
    etapaVida: e.etapaVida || e.etapa || '',
    personas: e.personas || '',
    sentimientos: e.sentimientos || '',
    esKarmico: e.esKarmico || e.es_karmico || '',
    descripcion: e.descripcion || ''
  })) : [];
  cur.tirada = null;
  cur.promptGenerado = '';
  cur.respuestaIA = '';
  cur.informe = null;
  cur.cronica = null;
  cur.generationMeta = { lecturaDatosSignature:null, lecturaGeneradaEn:null, cronicaInformeSignature:null, cronicaGeneradaEn:null };
  cur.ajustesInforme = { periodos: [], observaciones: [], correccionesEtapa: [] };
  cur._editingEntryId = null;
  cur._entrevistaIA = obj;
}

registerRoute('entrevista-ia', (s)=>{
  let tipo = 'completa';
  let prompt = buildPromptEntrevistaIA(tipo);
  s.innerHTML = `
    <div class="eyebrow">Entrada asistida</div>
    <h2>Entrevista guiada por IA</h2>
    <p class="body-text muted">Copia un prompt y llévalo a tu IA preferida. La IA te hará preguntas una por una; puedes responder por voz allí. Al final te entregará un JSON para pegar de vuelta en esta app.</p>

    <div class="spacer-md"></div>
    <div class="interview-type-grid">
      <button type="button" class="interview-type-card selected" data-tipo="completa">
        <strong>Completa</strong><span>Vida actual, vínculos, sueños, familia y eventos.</span>
      </button>
      <button type="button" class="interview-type-card" data-tipo="vinculos">
        <strong>Solo vínculos</strong><span>Personas significativas, antiguas, difíciles o protectoras.</span>
      </button>
      <button type="button" class="interview-type-card" data-tipo="simbolica">
        <strong>Simbólica profunda</strong><span>Sueños, presencias, déjà vu, cuerpos, épocas y señales.</span>
      </button>
    </div>

    <div class="copy-only-panel">
      <div class="copy-only-title">Prompt de entrevista preparado</div>
      <p>No se muestra completo para no saturar la pantalla. Copia, abre una IA externa y deja que te entreviste paso a paso.</p>
      <button class="btn btn-primary copy-pulse" id="btn-copy-entrevista" type="button">Copiar prompt de entrevista</button>
    </div>

    <div class="manual-note" style="margin-top:10px;">Cuando la IA termine, debe devolverte <strong>solo JSON válido</strong>. Luego vuelve y pégalo en esta app.</div>
    <div id="ai-access-entrevista"></div>
  `;

  const hub = s.querySelector('#ai-access-entrevista');
  const refreshPrompt = ()=>{
    prompt = buildPromptEntrevistaIA(tipo);
  };

  s.querySelectorAll('.interview-type-card').forEach(btn=>{
    btn.onclick = ()=>{
      s.querySelectorAll('.interview-type-card').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      tipo = btn.getAttribute('data-tipo') || 'completa';
      refreshPrompt();
    };
  });

  s.querySelector('#btn-copy-entrevista').onclick = async ()=>{
    refreshPrompt();
    await copyPromptButton(s.querySelector('#btn-copy-entrevista'), prompt, hub);
  };

  renderAIExternalPanel(hub, ()=>prompt, {
    title:'Abrir IA para entrevista',
    detail:'Elige tu IA. La app intentará copiar el prompt y abrirá el servicio. Pega el prompt si no aparece automáticamente.'
  });

  navFooter(s, [
    { label:'Pegar resultado de entrevista', onClick: ()=> go('pegar-entrevista-ia') },
    { label:'Volver', variant:'btn-ghost', onClick: ()=> go('home') }
  ]);
});

registerRoute('pegar-entrevista-ia', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Resultado de entrevista</div>
    <h2>Pega el JSON que te dio la IA</h2>
    <p class="body-text muted">Debe ser el JSON de módulos de Bitácora del Alma. La app lo cargará como material inicial y luego podrás generar la lectura con la tirada.</p>
    <div class="spacer-md"></div>
    <div class="field">
      <textarea id="entrevista-json-box" placeholder="Pega aquí el JSON de entrevista..." style="min-height:260px;"></textarea>
    </div>
    <div class="prompt-actions-row compact">
      <button class="btn btn-ghost" id="btn-vaciar-entrevista" type="button">Vaciar cajón</button>
    </div>
    <p class="muted" id="entrevista-error" style="color:#C46A3F; display:none;"></p>
  `;

  s.querySelector('#btn-vaciar-entrevista').onclick = ()=>{
    const box = s.querySelector('#entrevista-json-box');
    box.value = '';
    const err = s.querySelector('#entrevista-error');
    err.textContent = '';
    err.style.display = 'none';
    box.focus();
  };

  navFooter(s, [
    { label:'Cargar entrevista en la bitácora', onClick: ()=>{
      const raw = s.querySelector('#entrevista-json-box').value.trim();
      const err = s.querySelector('#entrevista-error');
      if(!raw){ s.querySelector('#entrevista-json-box').focus(); return; }
      const obj = parseEntrevistaIA(raw);
      if(!obj){
        err.textContent = 'No pudimos leer el JSON. Pídele a la IA que responda solo con el JSON compatible con Bitácora del Alma, sin texto antes ni después.';
        err.style.display = 'block';
        return;
      }
      cargarEntrevistaEnSesion(obj);
      go('entrevista-cargada');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('entrevista-ia') }
  ]);
});

registerRoute('entrevista-cargada', (s)=>{
  s.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
      <div class="home-mark"></div>
      <div class="eyebrow">Entrevista cargada</div>
      <h2>La bitácora quedó alimentada</h2>
      <p class="body-text muted">La app cargó la entrevista como módulos internos. Puedes revisar y editar antes de generar la lectura, o pasar directamente a la tirada simbólica.</p>
      <div class="spacer-md"></div>
      <div class="option-card" id="btn-revisar-mod1"><div class="ocard-title">Revisar módulos</div><div class="ocard-sub">Comienza por módulo 1 y ajusta lo que necesites.</div></div>
      <div class="option-card" id="btn-ir-tirada" style="border-color:var(--ember-dim);"><div class="ocard-title" style="color:var(--ember);">Generar lectura con estos datos</div><div class="ocard-sub">Pasar a la tirada y crear el prompt final.</div></div>
    </div>
  `;
  s.querySelector('#btn-revisar-mod1').onclick = ()=> go('modA');
  s.querySelector('#btn-ir-tirada').onclick = ()=> go('tirada');
  navFooter(s, [
    { label:'Generar lectura', onClick: ()=> go('tirada') },
    { label:'Volver al inicio', variant:'btn-ghost', onClick: ()=> go('home') }
  ]);
});


function loadDemoHelena(){
  resetNavigation();
  cur.alias = 'Helena · demo';
  cur.moduloA = {
    autodescripcion:'Helena llega como una mujer sensible, funcional en apariencia, pero tomada por ansiedad, sueños repetitivos, miedo al encierro, temor al agua profunda y angustia ante la pérdida de personas queridas.',
    patron:'Cuidar demasiado, sentir culpa cuando no puede salvar a otros, callar por miedo al juicio y alternar entre deseo de intimidad y necesidad de huida.',
    rasgo:'Siente que algunas personas le resultan antiguas, como si ciertos vínculos no empezaran en esta vida.',
    sensaciones:'Opresión en el pecho ante el agua, ansiedad ante ausencias y sensación de encierro frente a compromisos rígidos.'
  };
  cur.moduloB = {
    presencias:'Sueños con comunidades antiguas, una hija pequeña, un compañero de guerra, mujeres que la acusan, una casa rígida, un viajero ausente y familias separadas por desplazamiento.',
    amigoImaginario:'',
    suenoGuia:'El material demo está construido para mostrar cómo la app organiza escenas, vínculos, huellas y aprendizajes, siempre como hipótesis simbólica.',
    nombrePresencia:'Helena'
  };
  cur.moduloC = [
    { nombre:'Hermano menor', tipoVinculo:'Familiar / protegido', notas:'Figura que activa cuidado intenso y miedo a no llegar a tiempo.' },
    { nombre:'Hija pequeña', tipoVinculo:'Familiar / ser amado vulnerable', notas:'Figura asociada al apego, la pérdida y el aprendizaje de soltar sin traicionar el amor.' },
    { nombre:'Compañero de guerra', tipoVinculo:'Amistad profunda', notas:'Presencia de confianza inmediata y tristeza antigua.' },
    { nombre:'Figura acusadora', tipoVinculo:'Conflicto recurrente', notas:'Mujer que despierta miedo al juicio y necesidad de aprobación.' },
    { nombre:'Autoridad masculina', tipoVinculo:'Autoridad', notas:'Rol que activa sumisión, bloqueo o temor a confrontar.' },
    { nombre:'Pareja que espera', tipoVinculo:'Amoroso', notas:'Vínculo donde libertad y responsabilidad quedan en tensión.' }
  ];
  cur.moduloD = { descripcion:'Demo ficcional inspirado en la lógica narrativa de regresiones: personas significativas reaparecen como posiciones vinculares, no como identidades afirmadas.' };
  cur.moduloE = [];
  cur.tirada = {
    antiguedad:{ id:'vieja', nombre:'Alma vieja', desc:'reconoce patrones que parecen venir de lejos' },
    arquetipo:{ id:'tejedor', nombre:'El Tejedor', desc:'une escenas, vínculos y aprendizajes dispersos' },
    aprendizaje:{ id:'presencia', nombre:'Presencia', desc:'amar sin huir, retener ni cargar con todos' }
  };
  cur.ajustesInforme = { periodos: [], observaciones: [], correccionesEtapa: [] };
  cur._editingEntryId = null;
  cur.informe = normalizeInforme({
    lectura_general:`Helena aparece en este demo como una conciencia atravesada por miedos actuales que encuentran resonancia en escenas simbólicas de otras vidas. El informe no afirma que esas vidas sean hechos verificables; organiza, en cambio, una red de escenas posibles para mostrar cómo una app puede convertir relato, síntoma, vínculo, período y aprendizaje en una cartografía legible.

El eje del caso es la transformación del miedo en amor lúcido. Helena cuida para no perder, calla para no ser juzgada, obedece para no ser castigada, huye para no sentirse encerrada y se apega porque confunde soltar con traicionar. La lectura muestra cómo cada etapa podría dejar una huella que retorna en la vida actual como ansiedad, culpa, apego, temor al juicio o ambivalencia afectiva.

El arquetipo del demo es El Tejedor: cada vida aporta un hilo y la lectura intenta mostrar el patrón sin convertirlo en sentencia. La pregunta de fondo no es quién fue Helena exactamente, sino qué aprendizaje se repite cuando el amor queda gobernado por miedo, pérdida, culpa o promesa incumplida.`,
    resumen_ruta:'Se identifican 7 posibles etapas simbólicas con rangos narrativos aproximados: ca. 3000-1500 a. C.; ca. 1500-500 a. C.; ca. 500 a. C.-400 d. C.; ca. 1400-1650; ca. 1750-1890; ca. 1600-1850; y ca. 1914-1945. Estos rangos no son prueba histórica, sino marcos orientadores para que el demo muestre cómo la app organiza tiempo, espacio, vínculo, evento crítico, huella actual y aprendizaje pendiente.',
    etapas:[
      {
        numero_etapa:1,
        titulo:'La hermana que no llegó a tiempo',
        periodo_reportado:'Comunidad antigua cercana al agua.',
        periodo_simbolico:'ca. 3000-1500 a. C. · comunidad agrícola cercana al agua',
        periodo_amplificado:'Aldea de subsistencia cercana a una zona de crecida; rango narrativo sugerido ca. 3000-1500 a. C., por agricultura, agua, familia extensa y dependencia comunitaria.',
        nivel_confianza_periodo:'bajo/medio',
        evidencia_periodo:['rango narrativo ca. 3000-1500 a. C.','agua profunda','aldea','familia extensa','hermano menor','catástrofe natural'],
        espacio_simbolico:'Río, lago o zona de crecida que desordena la vida comunitaria.',
        contexto_socioambiental:'Subsistencia, cosechas, animales, familia extensa y dependencia del grupo.',
        rol_encarnado:'Joven cuidadora.',
        relacion_principal:'Hermano menor y joven amado.',
        evento_critico:'Una inundación avanza sobre la comunidad; Helena intenta salvar al hermano menor, pero no logra llegar a tiempo.',
        huella_actual:'Miedo al agua profunda, opresión en el pecho y culpa por no salvar.',
        aprendizaje_pendiente:'Cuidar sin cargar con todos.',
        leccion:'El amor protege, pero no puede apropiarse de todos los destinos.',
        eco_actual:'Se expresa como sobrecuidado y sensación de responsabilidad emocional por quienes ama.',
        senal_origen:'Surge del miedo al agua, de la escena de inundación y de la culpa por no haber salvado.',
        reingresos_relacionales:[{ figura_anterior:'Hermano perdido', persona_actual:'Hermano menor / hijo simbólico / persona vulnerable', rol_anterior:'Protegido', rol_actual:'Protegido actual', funcion_espiritual:'Activar cuidado con límite.', ciclo_que_abre:'Cuidado consciente.', ciclo_que_cierra:'Culpa por no salvar.', nivel_confianza:'medio', evidencia:'La misma cualidad de protección intensa se repite.' }]
      },
      {
        numero_etapa:2,
        titulo:'La madre detenida en el duelo',
        periodo_reportado:'Mundo antiguo familiar.',
        periodo_simbolico:'ca. 1500-500 a. C. · mundo antiguo familiar',
        periodo_amplificado:'Cultura antigua con jerarquías familiares, matrimonio impuesto, escasez y vida doméstica regulada; rango narrativo sugerido ca. 1500-500 a. C.',
        nivel_confianza_periodo:'medio',
        evidencia_periodo:['rango narrativo ca. 1500-500 a. C.','hija pequeña','escasez','plantas','rezos','matrimonio por obligación'],
        espacio_simbolico:'Casa sobria en zona árida, marcada por escasez y deber familiar.',
        rol_encarnado:'Madre joven dentro de un matrimonio poco elegido.',
        relacion_principal:'Hija pequeña.',
        evento_critico:'La hija enferma durante un período de escasez y muere pese a los cuidados de Helena.',
        huella_actual:'Apego intenso y miedo a perder niños o seres amados.',
        aprendizaje_pendiente:'Soltar sin traicionar el amor.',
        leccion:'Aceptar una pérdida no borra el vínculo.',
        eco_actual:'Se expresa como ansiedad ante enfermedades, separaciones o fragilidad infantil.',
        senal_origen:'Surge de la imagen de la hija enferma y del duelo no elaborado.',
        reingresos_relacionales:[{ figura_anterior:'Hija perdida', persona_actual:'Mujer joven protegida / hija simbólica', rol_anterior:'Hija vulnerable', rol_actual:'Persona cuidada con intensidad', funcion_espiritual:'Enseñar amor sin apego fusional.', ciclo_que_abre:'Ternura sin posesión.', ciclo_que_cierra:'Duelo congelado.', nivel_confianza:'medio', evidencia:'La protección excede la historia actual.' }]
      },
      {
        numero_etapa:3,
        titulo:'El obediente que sobrevivió con culpa',
        periodo_reportado:'Vida como soldado.',
        periodo_simbolico:'ca. 500 a. C.-400 d. C. · soldado / guardia antiguo',
        nivel_confianza_periodo:'bajo',
        evidencia_periodo:['rango narrativo ca. 500 a. C.-400 d. C.','soldado o guardia','superior','compañero','orden injusta','culpa moral'],
        espacio_simbolico:'Camino militar, campamento o frontera.',
        rol_encarnado:'Hombre joven, soldado o guardia.',
        relacion_principal:'Compañero cercano y autoridad.',
        evento_critico:'Obedece una orden injusta que contradice su conciencia y luego pierde al compañero.',
        huella_actual:'Culpa al decidir y miedo a confrontar figuras fuertes.',
        aprendizaje_pendiente:'Responsabilidad sin sumisión.',
        leccion:'La obediencia no siempre equivale a bondad.',
        eco_actual:'Aparece como necesidad de permiso externo aun cuando sabe lo que desea.',
        senal_origen:'Surge de la escena de obediencia, conflicto moral y pérdida del compañero.',
        reingresos_relacionales:[{ figura_anterior:'Compañero de guerra', persona_actual:'Amigo o pareja con confianza inmediata', rol_anterior:'Aliado', rol_actual:'Aliado afectivo', funcion_espiritual:'Sanar lealtad, culpa y decisión.', ciclo_que_abre:'Coraje relacional.', ciclo_que_cierra:'Sumisión ante autoridad.', nivel_confianza:'medio', evidencia:'La confianza inmediata aparece mezclada con tristeza.' }]
      },
      {
        numero_etapa:4,
        titulo:'La cuidadora acusada',
        periodo_reportado:'Aldea rural europea.',
        periodo_simbolico:'ca. 1400-1650 · aldea rural europea',
        periodo_amplificado:'Aldea rural europea con vigilancia comunitaria, partos, hierbas y religiosidad cotidiana; rango narrativo sugerido ca. 1400-1650.',
        nivel_confianza_periodo:'medio',
        evidencia_periodo:['rango narrativo ca. 1400-1650','hierbas','partos','mujeres cuidadas','acusación','comunidad vigilante'],
        espacio_simbolico:'Casa pequeña, campo, animales, rezos, partos y rumores.',
        rol_encarnado:'Cuidadora popular, partera o sanadora.',
        relacion_principal:'Mujeres cuidadas y figura acusadora.',
        evento_critico:'Una mujer muere después de un parto o enfermedad; la comunidad señala a Helena como culpable.',
        huella_actual:'Miedo al juicio, ocultamiento de dones y temor a ser vista.',
        aprendizaje_pendiente:'Recuperar la voz.',
        leccion:'El don no debe esconderse por miedo al rechazo.',
        eco_actual:'Se expresa como silencio ante intuiciones o experiencias espirituales.',
        senal_origen:'Surge de la escena de rechazo comunitario y acusación.',
        reingresos_relacionales:[{ figura_anterior:'Mujer acusadora', persona_actual:'Madre / colega / hermana / figura femenina ambivalente', rol_anterior:'Acusadora', rol_actual:'Figura de aprobación o juicio', funcion_espiritual:'Recuperar voz frente a la mirada ajena.', ciclo_que_abre:'Autorización interior.', ciclo_que_cierra:'Silencio por vergüenza.', nivel_confianza:'medio', evidencia:'La búsqueda de aprobación se activa ante ciertas figuras femeninas.' }]
      },
      {
        numero_etapa:5,
        titulo:'La hija del deber',
        periodo_reportado:'Casa rígida siglos XVIII-XIX.',
        periodo_simbolico:'ca. 1750-1890 · casa rígida siglos XVIII-XIX',
        nivel_confianza_periodo:'medio',
        evidencia_periodo:['rango narrativo ca. 1750-1890','casa amplia','muebles oscuros','educación formal','padre rígido','matrimonio por conveniencia'],
        espacio_simbolico:'Casa formal, silenciosa, con normas y afectos reprimidos.',
        rol_encarnado:'Niña sensible que crece bajo autoridad paterna rígida.',
        relacion_principal:'Padre, madre sometida y hermano protector.',
        evento_critico:'No hay catástrofe súbita, sino una vida entera vivida desde el deber, sin poder expresar deseo.',
        huella_actual:'Temor al encierro afectivo y confusión entre amor y obligación.',
        aprendizaje_pendiente:'Elegir sin desaparecer.',
        leccion:'Pertenecer no exige entregar la voz propia.',
        eco_actual:'Se expresa como angustia ante compromisos rígidos.',
        senal_origen:'Surge de la casa rígida, la autoridad paterna y la vida sometida al deber.',
        reingresos_relacionales:[{ figura_anterior:'Padre rígido', persona_actual:'Autoridad masculina contemporánea', rol_anterior:'Padre autoritario', rol_actual:'Jefe, maestro o figura dominante', funcion_espiritual:'Aprender autonomía frente a la autoridad.', ciclo_que_abre:'Elección propia.', ciclo_que_cierra:'Obediencia afectiva.', nivel_confianza:'medio', evidencia:'El bloqueo aparece frente a autoridad masculina.' }]
      },
      {
        numero_etapa:6,
        titulo:'El que prometió volver',
        periodo_reportado:'Vida como viajero.',
        periodo_simbolico:'ca. 1600-1850 · rutas de comercio y viaje',
        nivel_confianza_periodo:'bajo/medio',
        evidencia_periodo:['rango narrativo ca. 1600-1850','viajes','puertos','caminos','pareja que espera','hijo abandonado'],
        espacio_simbolico:'Ciudades, caminos, barcos, posadas y promesas de regreso.',
        rol_encarnado:'Hombre viajero, comerciante o caminante.',
        relacion_principal:'Pareja e hijo abandonados.',
        evento_critico:'Promete volver, pero no vuelve a tiempo; alguien sufre o muere esperando.',
        huella_actual:'Miedo a quedarse y miedo a dañar al partir.',
        aprendizaje_pendiente:'Libertad con responsabilidad.',
        leccion:'Partir sin conciencia también deja heridas.',
        eco_actual:'Se expresa como ambivalencia entre intimidad y libertad.',
        senal_origen:'Surge de la promesa incumplida y la ausencia prolongada.',
        reingresos_relacionales:[{ figura_anterior:'Pareja abandonada', persona_actual:'Vínculo amoroso que desconfía', rol_anterior:'Pareja que espera', rol_actual:'Pareja que exige presencia', funcion_espiritual:'Reparar libertad irresponsable.', ciclo_que_abre:'Libertad ética.', ciclo_que_cierra:'Huida afectiva.', nivel_confianza:'medio', evidencia:'La desconfianza aparece ligada a promesas incumplidas.' }]
      },
      {
        numero_etapa:7,
        titulo:'La madre de la espera',
        periodo_reportado:'Época de guerra o desplazamiento.',
        periodo_simbolico:'ca. 1914-1945 · guerra y desplazamiento colectivo',
        nivel_confianza_periodo:'bajo/medio',
        evidencia_periodo:['rango narrativo ca. 1914-1945','caminos','casas abandonadas','familia separada','huida','espera de noticias'],
        espacio_simbolico:'Trenes, caminos, casas vacías y familias rotas por la huida.',
        rol_encarnado:'Mujer, esposa y madre.',
        relacion_principal:'Esposo e hijos.',
        evento_critico:'Durante una huida, la familia se separa y Helena queda esperando noticias durante años.',
        huella_actual:'Tristeza ante despedidas, ansiedad ante silencios y temor a ausencias sin explicación.',
        aprendizaje_pendiente:'Amar sin poseer ni retener.',
        leccion:'La ausencia no destruye el vínculo, pero tampoco debe gobernar la vida.',
        eco_actual:'Se expresa como reacción intensa cuando alguien tarda en responder o se aleja.',
        senal_origen:'Surge de la separación familiar y la búsqueda inconclusa.',
        reingresos_relacionales:[{ figura_anterior:'Familia separada', persona_actual:'Vínculos actuales que activan miedo a perder contacto', rol_anterior:'Esposo e hijos', rol_actual:'Familia o afectos importantes', funcion_espiritual:'Aceptar continuidad del vínculo sin posesión.', ciclo_que_abre:'Amor sereno.', ciclo_que_cierra:'Espera que paraliza.', nivel_confianza:'bajo', evidencia:'La ansiedad actual ante ausencias dialoga con separación irreversible.' }]
      }
    ],
    hilo_conductor:'Entre las etapas se repite una misma tensión: Helena ama intensamente, pero el miedo convierte el amor en carga, apego, silencio, obediencia o huida. La ruta muestra una espiral en la que cada vida propone una forma distinta de aprender presencia.',
    constelacion:[
      { figura_onirica:'Hermano perdido', figura_anterior:'Hermano perdido', etapa_relacionada:1, persona_real:'Hermano menor / persona vulnerable', persona_actual:'Hermano menor / persona vulnerable', rol_anterior:'Protegido', rol_actual:'Protegido actual', resonancia:'Podría resonar con personas que activan cuidado inmediato.', funcion_espiritual:'Cuidar con límite.', ciclo_que_abre:'Protección consciente.', ciclo_que_cierra:'Culpa por no salvar.', nivel_confianza:'medio', evidencia:'La misma intensidad de protección reaparece.' },
      { figura_onirica:'Hija perdida', figura_anterior:'Hija perdida', etapa_relacionada:2, persona_real:'Hija simbólica / mujer joven protegida', persona_actual:'Hija simbólica / mujer joven protegida', rol_anterior:'Hija vulnerable', rol_actual:'Ser amado vulnerable', resonancia:'Podría explicar el apego protector hacia figuras jóvenes.', funcion_espiritual:'Soltar sin traicionar el amor.', ciclo_que_abre:'Ternura libre.', ciclo_que_cierra:'Duelo congelado.', nivel_confianza:'medio', evidencia:'El miedo a perder seres amados se concentra en niños o figuras vulnerables.' },
      { figura_onirica:'Mujer acusadora', figura_anterior:'Mujer acusadora', etapa_relacionada:4, persona_real:'Figura femenina ambivalente', persona_actual:'Figura femenina ambivalente', rol_anterior:'Acusadora', rol_actual:'Madre, hermana, colega o autoridad femenina', resonancia:'Podría resonar con vínculos donde Helena busca aprobación y teme juicio.', funcion_espiritual:'Recuperar voz.', ciclo_que_abre:'Autorización propia.', ciclo_que_cierra:'Silencio por miedo.', nivel_confianza:'medio', evidencia:'La escena de acusación dialoga con ocultamiento de dones.' }
    ],
    mapa_aprendizajes:[
      { aprendizaje:'Cuidar sin cargar', etapas:[1], huella_actual:'Sobrecuidado', movimiento_integrador:'Amar con límite' },
      { aprendizaje:'Soltar sin traicionar', etapas:[2,7], huella_actual:'Apego y miedo a la ausencia', movimiento_integrador:'Continuidad sin posesión' },
      { aprendizaje:'Responsabilidad sin sumisión', etapas:[3,5], huella_actual:'Miedo a confrontar', movimiento_integrador:'Conciencia propia' },
      { aprendizaje:'Libertad con responsabilidad', etapas:[6], huella_actual:'Miedo a quedarse o dañar', movimiento_integrador:'Presencia ética' }
    ],
    cierre:`Lo que parece integrarse en el caso Helena es la diferencia entre amor y miedo. Amar no significa salvar a todos, retener a todos, obedecer a todos ni huir antes de ser herida. La vida actual sería el lugar donde las escenas dejan de repetirse como síntomas y comienzan a organizarse como comprensión.

Este demo muestra el tipo de informe que la app busca producir cuando el relato trae datos suficientes: una cartografía simbólica con períodos, escenas, vínculos, eventos críticos, huellas actuales y aprendizajes posibles.`,
    auditoria_final:{ datos_no_usados:[], etapas_sin_ancla_temporal:[], riesgos_de_sobreinterpretacion:['Los rangos del demo son aproximaciones narrativas para mostrar funcionamiento, no fechas comprobadas.'], revision_no_invencion:'Las fechas del demo se presentan como rangos narrativos de baja o media confianza; en casos reales se deben justificar con evidencia del relato.', ajustes_usuario_integrados:[] },
    nota_epistemica:'Esta lectura es un ejercicio simbólico de probabilidad e introspección; no es una afirmación histórica, espiritual ni biográfica definitiva.'
  });
  cur.cronica = null;
  cur.generationMeta = { lecturaDatosSignature:null, lecturaGeneradaEn:null, cronicaInformeSignature:null, cronicaGeneradaEn:null };
  markLecturaGenerada(cur);
}

registerRoute('respaldo-completo', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Respaldo completo</div>
    <h2>Toda tu aplicación, no solo un caso</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Esto es distinto de exportar un caso individual: incluye TODAS tus bitácoras guardadas, con sus informes y crónicas, en un solo archivo.</p>
    <div class="spacer-md"></div>

    <div class="option-card" id="btn-exportar-todo" style="border-color:var(--guide-dim);">
      <div class="ocard-title" style="color:var(--guide);">Exportar toda mi aplicación (.json)</div>
      <div class="ocard-sub">Descarga un solo archivo con todas tus bitácoras.</div>
    </div>

    <div class="spacer-md"></div>
    <div class="divider"></div>
    <div class="spacer-md"></div>

    <div class="nota-personal-box">
      Restaurar un respaldo <strong>reemplaza por completo</strong> las bitácoras que tengas ahora en este dispositivo — no las combina con las del archivo. Si tienes casos guardados aquí que no están en el respaldo, se perderán. Exporta primero si no estás seguro.
    </div>
    <div class="spacer-sm"></div>
    <div class="field">
      <input type="file" id="input-respaldo-file" accept="application/json,.json" style="padding:10px; background:var(--surface); border:1px solid var(--line); border-radius:2px; color:var(--text); width:100%;">
    </div>
    <p class="muted" id="respaldo-error" role="alert" aria-live="assertive" style="color:var(--ember); display:none;"></p>
    <div id="respaldo-confirmar" style="display:none;">
      <p class="body-text" style="margin-top:10px;">Este archivo contiene <strong id="respaldo-total"></strong> bitácora(s). ¿Reemplazar todo lo que tienes guardado ahora por esto?</p>
      <div class="prompt-actions-row">
        <button class="btn btn-primary" id="btn-confirmar-restaurar" type="button" style="border-color:var(--ember-dim); background:var(--ember-dim);">Sí, reemplazar todo</button>
        <button class="btn btn-ghost" id="btn-cancelar-restaurar" type="button">Cancelar</button>
      </div>
    </div>
  `;

  s.querySelector('#btn-exportar-todo').onclick = async ()=>{
    const respaldo = await exportarRespaldoCompleto();
    downloadJSON(respaldo, `respaldo-bitacora-del-alma-${dateSlug()}.json`);
  };

  let respaldoPendiente = null;
  const errEl = s.querySelector('#respaldo-error');
  const confirmarBox = s.querySelector('#respaldo-confirmar');

  s.querySelector('#input-respaldo-file').onchange = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    errEl.style.display = 'none';
    confirmarBox.style.display = 'none';
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const obj = JSON.parse(ev.target.result);
        if(obj.formato !== 'bitacora-del-alma-respaldo-completo' || !Array.isArray(obj.entradas)){
          errEl.textContent = 'Este archivo no tiene el formato de un respaldo completo de esta app. Si quieres cargar un solo caso, usa "Importar una bitácora" en su lugar.';
          errEl.style.display = 'block';
          return;
        }
        respaldoPendiente = obj;
        s.querySelector('#respaldo-total').textContent = obj.entradas.length;
        confirmarBox.style.display = 'block';
      }catch(err){
        errEl.textContent = 'No pudimos leer este archivo. Verifica que sea un respaldo exportado desde esta app.';
        errEl.style.display = 'block';
      }
    };
    reader.readAsText(file);
  };

  s.querySelector('#btn-cancelar-restaurar').onclick = ()=>{
    respaldoPendiente = null;
    confirmarBox.style.display = 'none';
    s.querySelector('#input-respaldo-file').value = '';
  };

  s.querySelector('#btn-confirmar-restaurar').onclick = async ()=>{
    if(!respaldoPendiente) return;
    const resultado = await restaurarRespaldoCompleto(respaldoPendiente);
    if(resultado.ok){
      resetSession();
      go('historial', {}, { replace:true });
    } else {
      errEl.textContent = resultado.detalle || 'No se pudo restaurar el respaldo.';
      errEl.style.display = 'block';
    }
  };

  navFooter(s, [
    { label:'Volver al inicio', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});

registerRoute('cargar-json', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Importar una bitácora</div>
    <h2>Sube tu archivo .json</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Añade un caso guardado sin reemplazar los demás. Selecciona un archivo exportado antes desde esta app ("Exportar caso completo").</p>
    <div class="spacer-md"></div>
    <div class="field">
      <input type="file" id="input-json-file" accept="application/json,.json" style="padding:10px; background:var(--surface); border:1px solid var(--line); border-radius:2px; color:var(--text); width:100%;">
    </div>
    <p class="muted" id="cargar-error" role="alert" aria-live="assertive" style="color:var(--ember); display:none;"></p>
    <div id="cargar-colision" style="display:none;">
      <div class="nota-personal-box" style="margin-top:12px;">
        Ya tienes una bitácora guardada con este mismo identificador (<strong id="colision-alias"></strong>). ¿Qué quieres hacer?
      </div>
      <div class="prompt-actions-row" style="margin-top:10px;">
        <button class="btn btn-primary" id="btn-colision-actualizar" type="button">Actualizar el caso existente</button>
        <button class="btn btn-ghost" id="btn-colision-copia" type="button">Guardar como copia nueva</button>
      </div>
      <button class="btn btn-ghost" id="btn-colision-cancelar" type="button" style="margin-top:8px; width:100%;">Cancelar</button>
    </div>
  `;

  const errEl = s.querySelector('#cargar-error');
  const colisionBox = s.querySelector('#cargar-colision');
  let objPendiente = null;

  function construirEntryDesdeArchivo(obj, idAUsar){
    return {
      id: idAUsar,
      alias: obj.alias || 'Bitácora importada',
      fecha: obj.fecha_exportacion || new Date().toISOString(),
      moduloA: { autodescripcion:'', patron:'', rasgo:'', sensaciones:'', ...obj.moduloA },
      moduloB: obj.moduloB || {},
      moduloC: obj.moduloC || [],
      moduloD: obj.moduloD || { descripcion:'' },
      moduloE: obj.moduloE || [],
      tirada: obj.tirada || null,
      informe: obj.informe ? normalizeInforme(deepCleanText(obj.informe)) : null,
      cronica: obj.cronica || null,
      generationMeta: obj.generationMeta || null,
      ajustesInforme: obj.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] },
    };
  }

  async function guardarYContinuar(entry){
    cur._editingEntryId = null; // nunca heredar el id de una sesión anterior antes de guardar esta
    const ok = await saveEntry(entry);
    if(ok){
      cur._editingEntryId = entry.id;
      const cargarEnSesionLocal = async ()=>{
        const guardado = await loadEntry(entry.id);
        cur.alias = guardado.alias;
        cur.moduloA = guardado.moduloA; cur.moduloB = guardado.moduloB; cur.moduloC = guardado.moduloC;
        cur.moduloD = guardado.moduloD; cur.moduloE = guardado.moduloE; cur.tirada = guardado.tirada;
        cur.informe = guardado.informe; cur.cronica = guardado.cronica || null;
        cur.generationMeta = guardado.generationMeta || null;
        cur.ajustesInforme = guardado.ajustesInforme || { periodos: [], observaciones: [], correccionesEtapa: [] };
        ensureAjustesInforme();
        ensureGenerationMeta(cur, guardado.updatedAt || guardado.fecha);
      };
      await cargarEnSesionLocal();
      go('cargado-ok');
    } else {
      errEl.textContent = 'No pudimos guardar esta bitácora en tu dispositivo.';
      errEl.style.display = 'block';
    }
  }

  s.querySelector('#input-json-file').onchange = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    errEl.style.display = 'none';
    colisionBox.style.display = 'none';
    const reader = new FileReader();
    reader.onload = async (ev)=>{
      try{
        const obj = JSON.parse(ev.target.result);
        if(!obj.moduloA){
          errEl.textContent = 'El archivo no tiene el formato esperado de una bitácora exportada desde esta app.';
          errEl.style.display = 'block';
          return;
        }
        // ¿el id de este archivo ya existe como una bitácora guardada aquí?
        const existente = obj.id ? await loadEntry(obj.id) : null;
        if(existente){
          objPendiente = obj;
          s.querySelector('#colision-alias').textContent = existente.alias;
          colisionBox.style.display = 'block';
          return;
        }
        const idNuevo = obj.id || ('e' + Date.now());
        await guardarYContinuar(construirEntryDesdeArchivo(obj, idNuevo));
      }catch(err){
        errEl.textContent = 'No pudimos leer este archivo. Verifica que sea un .json exportado desde esta app.';
        errEl.style.display = 'block';
      }
    };
    reader.readAsText(file);
  };

  s.querySelector('#btn-colision-actualizar').onclick = async ()=>{
    if(!objPendiente) return;
    await guardarYContinuar(construirEntryDesdeArchivo(objPendiente, objPendiente.id));
  };
  s.querySelector('#btn-colision-copia').onclick = async ()=>{
    if(!objPendiente) return;
    const nuevoId = 'e' + Date.now();
    const entry = construirEntryDesdeArchivo(objPendiente, nuevoId);
    entry.alias = entry.alias + ' (copia)';
    await guardarYContinuar(entry);
  };
  s.querySelector('#btn-colision-cancelar').onclick = ()=>{
    objPendiente = null;
    colisionBox.style.display = 'none';
    s.querySelector('#input-json-file').value = '';
  };

  navFooter(s, [
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});

registerRoute('cargado-ok', (s)=>{
  s.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <div class="home-mark"></div>
      <h2>Bitácora cargada: ${esc(cur.alias)}</h2>
      <p class="body-text muted" style="margin-top:10px;">Revisa cada módulo, ajusta lo que necesites, y genera una nueva lectura cuando quieras. Si ya tenía una lectura previa, también puedes verla directamente.</p>
    </div>
  `;
  const buttons = [
    { label:'Revisar módulo 1', onClick: ()=> go('modA') },
    { label:'Volver al inicio', variant:'btn-ghost', onClick: ()=> go('home') },
  ];
  if(cur.informe){
    buttons.splice(1, 0, { label:'Ver la última lectura', variant:'btn-ghost', onClick: ()=> go('informe') });
  }
  navFooter(s, buttons);
});

registerRoute('alias', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Antes de empezar</div>
    <h2>¿Cómo quieres que te llame esta bitácora?</h2>
    <p class="body-text muted" style="margin-top:8px;">Un alias basta. No pedimos tu nombre real ni ningún otro dato de identificación.</p>
    <div class="spacer-md"></div>
    <div class="field">
      <input type="text" id="input-alias" placeholder="Ej. Viajera del norte, R.M., Alma 7..." value="${esc(cur.alias)}">
    </div>
  `;
  navFooter(s, [
    { label:'Continuar', onClick: ()=>{
      const v = document.getElementById('input-alias').value.trim();
      if(!v){ document.getElementById('input-alias').focus(); return; }
      cur.alias = v;
      go('intro-modulos');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});

registerRoute('intro-modulos', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Cómo funciona</div>
    <h2>Cinco momentos, y luego el azar</h2>
    <div class="spacer-sm"></div>
    <p class="body-text">Vamos a recorrer cinco bloques, uno por pantalla. Ninguna pregunta es obligatoria salvo la primera de cada bloque. Puedes escribir o dictar por voz — tómate el tiempo que necesites, entre más detalle des, más rica será tu lectura.</p>
    <div class="spacer-md"></div>
    <div class="option-card" style="cursor:default;">
      <div class="ocard-title">① Quién eres hoy</div>
    </div>
    <div class="option-card" style="cursor:default;">
      <div class="ocard-title">② Guías y presencias</div>
    </div>
    <div class="option-card" style="cursor:default;">
      <div class="ocard-title">③ Vínculos que se sienten antiguos</div>
    </div>
    <div class="option-card" style="cursor:default;">
      <div class="ocard-title">④ Tu mapa familiar y relacional</div>
    </div>
    <div class="option-card" style="cursor:default;">
      <div class="ocard-title">⑤ Momentos difíciles de tu historia</div>
    </div>
  `;
  navFooter(s, [
    { label:'Empezar el recorrido', onClick: ()=> go('modA') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('alias') },
  ]);
});

registerRoute('modA', (s)=>{
  progressTrack(s, 0, 5);
  s.innerHTML += `
    <div class="eyebrow">Módulo 1 de 5 · Quién eres hoy</div>
    <h2>Empecemos por ti</h2>
    <div class="spacer-md"></div>
  `;
  const f1 = buildVoiceField({
    id:'f-autodesc', required:true,
    label:'Descríbete con libertad',
    hint:'Quién sientes que eres, qué te mueve, qué te pesa. Sin filtro. Puedes hablar todo el tiempo que necesites.',
    placeholder:'Escribe o dicta lo que quieras...',
    value: cur.moduloA.autodescripcion,
  });
  s.appendChild(f1.el);
  const f2 = buildVoiceField({
    id:'f-patron',
    label:'Un patrón que se repite',
    hint:'Algo que vuelve una y otra vez en tu vida y no logras romper del todo.',
    placeholder:'Ej. siempre termino cuidando a otros y olvidándome de mí...',
    value: cur.moduloA.patron,
  });
  s.appendChild(f2.el);
  const f3 = buildVoiceField({
    id:'f-rasgo',
    label:'Algo sin explicación fácil',
    hint:'Un miedo, una atracción, un talento que no recuerdas haber aprendido. Un sentir o una intuición sin causa clara.',
    placeholder:'Ej. desde niño me atrae todo lo relacionado con el mar, sin razón familiar...',
    value: cur.moduloA.rasgo,
  });
  s.appendChild(f3.el);
  const f4 = buildVoiceField({
    id:'f-sensaciones',
    label:'Sensaciones o marcas con carga simbólica',
    hint:'Molestias, marcas de nacimiento, dolores recurrentes o sensaciones corporales que sientas cargadas de significado — no como diagnóstico médico, sino como algo que te llama la atención de tu propio cuerpo. Si tienes una condición de salud real, coméntala con un profesional; aquí solo interesa la lectura simbólica que tú mismo le das.',
    placeholder:'Escribe o dicta si algo te viene a la mente...',
    value: cur.moduloA.sensaciones,
  });
  s.appendChild(f4.el);

  const footerBtns = [
    { label:'Continuar', onClick: ()=>{
      const auto = f1.getValue();
      if(!auto){ f1.textareaEl.focus(); return; }
      cur.moduloA.autodescripcion = auto;
      cur.moduloA.patron = f2.getValue();
      cur.moduloA.rasgo = f3.getValue();
      cur.moduloA.sensaciones = f4.getValue();
      go('modB');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('intro-modulos') },
  ];
  const gb = botonGuardarAvance(()=> go('panel-bitacora', {entryId: cur._editingEntryId}));
  if(gb) footerBtns.splice(1, 0, gb);
  navFooter(s, footerBtns);
});

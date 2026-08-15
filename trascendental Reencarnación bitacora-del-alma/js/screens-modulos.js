/* ============================================================
   PANTALLAS — parte 2: módulo B (guías), módulo C (vínculos)
   ============================================================ */

registerRoute('modB', (s)=>{
  progressTrack(s, 1, 5);
  s.innerHTML += `
    <div class="eyebrow">Módulo 2 de 5 · Guías y presencias</div>
    <h2>¿Has sentido que algo te acompaña?</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Esto no se refiere a fe religiosa concreta, sino a material más amplio: sueños intensos o recurrentes, déjà vus, intuiciones sin causa clara, experiencias que sentiste "trascendentales" o fuera de lo común (meditaciones, visiones, momentos de conexión profunda), un amigo imaginario, o alguien que "apareció justo a tiempo". Este es el material más importante para la ruta de posibles vidas pasadas que verás más adelante — cuanto más detalle des aquí, más rica y distinguible será esa lectura.</p>
    <div class="spacer-md"></div>
  `;
  const f1 = buildVoiceField({
    id:'f-presencias',
    label:'Una presencia protectora',
    hint:'¿Has sentido alguna vez que algo o alguien te acompañaba en un momento difícil, aunque no pudieras verlo?',
    placeholder:'Escribe o dicta si algo te viene a la memoria...',
    value: cur.moduloB.presencias,
  });
  s.appendChild(f1.el);
  const f2 = buildVoiceField({
    id:'f-amigo',
    label:'Amigo imaginario de la infancia',
    hint:'¿Cómo era? ¿Recuerdas su nombre?',
    placeholder:'Cuenta con calma lo que recuerdes...',
    value: cur.moduloB.amigoImaginario,
  });
  s.appendChild(f2.el);
  const f3 = buildVoiceField({
    id:'f-sueno',
    label:'Sueños, déjà vus o experiencias trascendentales',
    hint:'Sueños intensos o recurrentes en los que eras otra persona, otra época o otro lugar; déjà vus fuertes; visiones en meditación; sensaciones de "ya haber vivido esto"; experiencias durante momentos de crisis, sueño profundo o creación (escritura, arte). Describe la escena con el detalle que puedas: quién eras, qué pasaba, qué sentiste, si había otras personas o figuras presentes.',
    placeholder:'Describe la escena o la sensación con el detalle que puedas...',
    value: cur.moduloB.suenoGuia,
  });
  s.appendChild(f3.el);
  const f4 = buildVoiceField({
    id:'f-nombrepresencia',
    label:'Si le pusieras un nombre a esa presencia',
    hint:'Un nombre, una palabra, una imagen que la represente.',
    placeholder:'Escribe o dicta...',
    value: cur.moduloB.nombrePresencia,
  });
  s.appendChild(f4.el);

  const footerBtns = [
    { label:'Continuar', onClick: ()=>{
      cur.moduloB.presencias = f1.getValue();
      cur.moduloB.amigoImaginario = f2.getValue();
      cur.moduloB.suenoGuia = f3.getValue();
      cur.moduloB.nombrePresencia = f4.getValue();
      go('modC');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modA') },
  ];
  const gb = botonGuardarAvance(()=> go('panel-bitacora', {entryId: cur._editingEntryId}));
  if(gb) footerBtns.splice(1, 0, gb);
  navFooter(s, footerBtns);
});

/* ---- módulo C: modo narrativo (extracción por IA) + modo manual ---- */

/* ---- utilidades módulo C: edición robusta y autoguardado en bitácoras ya guardadas ---- */

function normalizarIndiceEdicion(opts){
  const idx = opts && Number.isInteger(opts.editIndex) ? opts.editIndex : null;
  return idx !== null && cur.moduloC && idx >= 0 && idx < cur.moduloC.length ? idx : null;
}

async function guardarModuloCSiEditando(){
  if(cur._editingEntryId){
    try{ await guardarAvanceRapido(); }
    catch(e){ console.error('No se pudo guardar automáticamente el módulo C', e); }
  }
}

function esIndiceVinculoValido(i){
  if(i === null || i === undefined || i === '') return null;
  const n = Number(i);
  if(!Number.isInteger(n)) return null;
  return (cur.moduloC && n >= 0 && n < cur.moduloC.length) ? n : null;
}

function abrirEditorVinculo(i){
  // Importante: no convertir null en 0. Number(null) === 0 y por eso
  // el botón "Agregar vínculo" terminaba abriendo a Lucía, el primer vínculo.
  const idx = esIndiceVinculoValido(i);
  if(idx !== null){
    vinculoTemp = { nombre:'', tipoVinculo:'', parentesco:'', notas:'', ...cur.moduloC[idx] };
    go('modC-add', {editIndex: idx});
  }else{
    vinculoTemp = { nombre:'', tipoVinculo:'', parentesco:'', notas:'' };
    go('modC-add', {nuevo:true});
  }
}

function toastVinculo(msg){
  const old = document.querySelector('.toast-vinculo');
  if(old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast-vinculo';
  el.textContent = msg || 'Listo';
  document.body.appendChild(el);
  setTimeout(()=> el.classList.add('visible'), 20);
  setTimeout(()=>{ el.classList.remove('visible'); setTimeout(()=>el.remove(), 250); }, 1900);
}

function abrirVinculoModal(i){
  const idx = esIndiceVinculoValido(i);
  const esEdicion = idx !== null;
  const base = esEdicion ? { nombre:'', tipoVinculo:'', parentesco:'', notas:'', ...cur.moduloC[idx] } : { nombre:'', tipoVinculo:'', parentesco:'', notas:'' };
  const anterior = document.querySelector('.modal-vinculo-backdrop');
  if(anterior) anterior.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-vinculo-backdrop';
  overlay.innerHTML = `
    <div class="modal-vinculo" role="dialog" aria-modal="true" aria-label="${esEdicion ? 'Editar vínculo' : 'Nuevo vínculo'}">
      <div class="modal-vinculo-head">
        <div>
          <div class="modal-vinculo-eyebrow">Vínculo</div>
          <h3>${esEdicion ? 'Editar vínculo' : 'Nuevo vínculo'}</h3>
        </div>
        <button type="button" class="modal-vinculo-close" aria-label="Cerrar">×</button>
      </div>
      <div class="field">
        <label>Nombre, inicial o apodo</label>
        <input type="text" id="modal-v-nombre" placeholder="Ej. mi hermano, J., mamá..." value="${esc(base.nombre)}">
      </div>
      <div class="field">
        <label>Tipo de vínculo</label>
        <div class="hint" style="margin-bottom:6px;">Esto es simbólico/kármico — el rol que sientes que cumple en tu historia.</div>
        <div class="modal-tipos-grid">
          ${TIPOS_VINCULO.map(t=>`<button type="button" class="modal-tipo-btn ${base.tipoVinculo === t ? 'selected' : ''}" data-tipo="${esc(t)}">${esc(t)}${base.tipoVinculo === t ? ' ✓' : ''}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Parentesco real <span class="muted">(opcional)</span></label>
        <div class="hint" style="margin-bottom:6px;">Distinto de lo anterior — es el parentesco literal, si lo hay, para poder ubicarlo en tu árbol familiar.</div>
        <div class="modal-tipos-grid">
          ${PARENTESCOS.map(p=>`<button type="button" class="modal-parentesco-btn ${base.parentesco === p ? 'selected' : ''}" data-parentesco="${esc(p)}">${esc(p)}${base.parentesco === p ? ' ✓' : ''}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Cuenta un poco la historia de esta relación</label>
        <textarea id="modal-v-notas" placeholder="Escribe o dicta libremente..." style="min-height:160px;">${esc(base.notas)}</textarea>
      </div>
      <div class="modal-vinculo-actions">
        <button type="button" class="btn btn-primary" id="modal-v-guardar">${esEdicion ? 'Guardar cambios' : 'Guardar vínculo'}</button>
        ${esEdicion ? '<button type="button" class="btn btn-ghost" id="modal-v-eliminar">Eliminar</button>' : ''}
        <button type="button" class="btn btn-ghost" id="modal-v-cancelar">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const close = ()=> overlay.remove();
  overlay.querySelector('.modal-vinculo-close').onclick = close;
  overlay.querySelector('#modal-v-cancelar').onclick = close;
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  overlay.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });

  const notasEl = overlay.querySelector('#modal-v-notas');
  if(notasEl){
    autoGrow(notasEl);
    notasEl.addEventListener('input', ()=> autoGrow(notasEl));
    const notasField = notasEl.closest('.field');
    if(notasField && typeof attachMic === 'function'){
      attachMic(notasField, notasEl);
    }
  }

  let tipoActual = base.tipoVinculo || '';
  overlay.querySelectorAll('.modal-tipo-btn').forEach(btn=>{
    btn.onclick = ()=>{
      tipoActual = btn.getAttribute('data-tipo') || '';
      overlay.querySelectorAll('.modal-tipo-btn').forEach(b=>{
        b.classList.remove('selected');
        b.textContent = b.getAttribute('data-tipo');
      });
      btn.classList.add('selected');
      btn.textContent = tipoActual + ' ✓';
    };
  });
  let parentescoActual = base.parentesco || '';
  overlay.querySelectorAll('.modal-parentesco-btn').forEach(btn=>{
    btn.onclick = ()=>{
      parentescoActual = btn.getAttribute('data-parentesco') || '';
      overlay.querySelectorAll('.modal-parentesco-btn').forEach(b=>{
        b.classList.remove('selected');
        b.textContent = b.getAttribute('data-parentesco');
      });
      btn.classList.add('selected');
      btn.textContent = parentescoActual + ' ✓';
    };
  });
  overlay.querySelector('#modal-v-guardar').onclick = async ()=>{
    const nombreEl = overlay.querySelector('#modal-v-nombre');
    const nombre = nombreEl.value.trim();
    if(!nombre){ nombreEl.focus(); return; }
    const item = {
      nombre,
      tipoVinculo: tipoActual || 'Sin especificar',
      parentesco: parentescoActual || '',
      notas: overlay.querySelector('#modal-v-notas').value.trim()
    };
    if(esEdicion){ cur.moduloC[idx] = item; }
    else { cur.moduloC.push(item); }
    await guardarModuloCSiEditando();
    close();
    toastVinculo(esEdicion ? 'Vínculo actualizado' : 'Vínculo agregado');
    go('modC', {}, {replace:true});
  };
  const btnEliminar = overlay.querySelector('#modal-v-eliminar');
  if(btnEliminar){
    btnEliminar.onclick = async ()=>{
      if(!confirm('¿Eliminar este vínculo?')) return;
      cur.moduloC.splice(idx, 1);
      await guardarModuloCSiEditando();
      close();
      toastVinculo('Vínculo eliminado');
      go('modC', {}, {replace:true});
    };
  }
  setTimeout(()=> overlay.querySelector('#modal-v-nombre').focus(), 30);
}

registerRoute('modC', (s)=>{
  progressTrack(s, 2, 5);
  s.innerHTML += `
    <div class="eyebrow">Módulo 3 de 5 · Vínculos que se sienten antiguos</div>
    <h2>Personas que reconoces de algún otro lugar</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Personas de tu vida actual con quienes sientes una conexión intensa, antigua o difícil de explicar. Puedes usar iniciales o apodos — esto es solo para ti.</p>
    ${cur._editingEntryId ? '<p class="muted" style="font-size:12.5px; margin-top:8px;">Estás editando una bitácora guardada: los cambios en vínculos se guardan automáticamente en esta misma narrativa.</p>' : ''}
    <div class="spacer-md"></div>
  `;

  if(cur.moduloC.length === 0){
    // sin vínculos aún: ofrecer elegir modo
    s.innerHTML += `
      <div class="option-card" id="btn-modo-narrativo" style="border-color:var(--ember-dim);">
        <div class="ocard-title" style="color:var(--ember);">Contar mi historia</div>
        <div class="ocard-sub">Narra libremente quiénes son estas personas y qué relación tienes con cada una. Una IA organizará la lista por ti — luego podrás revisarla y ajustarla.</div>
      </div>
      <div class="option-card" id="btn-modo-manual">
        <div class="ocard-title">Agregar uno por uno</div>
        <div class="ocard-sub">Llenar cada vínculo por separado, a mano.</div>
      </div>
    `;
    s.querySelector('#btn-modo-narrativo').onclick = ()=> go('modC-narrativo');
    s.querySelector('#btn-modo-manual').onclick = ()=> abrirVinculoModal(null);
  } else {
    // ya hay vínculos: se pinta toda la estructura primero y DESPUÉS
    // se asignan eventos. Evita borrar listeners con innerHTML += al final.
    s.insertAdjacentHTML('beforeend', `
      <div class="option-card" id="btn-add-top" style="border-style:dashed; text-align:center; color:var(--ember); margin-bottom:14px;">
        + Agregar vínculo
      </div>
      <div id="vinculos-list"></div>
      <div class="spacer-sm"></div>
      <div class="option-card" id="btn-add-manual" style="border-style:dashed; text-align:center; color:var(--ember);">
        + Agregar otro vínculo
      </div>
      <div class="center" style="margin-top:10px;">
        <span class="muted" id="btn-add-narrativo" style="cursor:pointer; text-decoration:underline;">o contar más por voz / texto libre</span>
      </div>
    `);

    const abrirNuevo = (e)=>{
      if(e) e.preventDefault();
      abrirVinculoModal(undefined);
    };
    s.querySelector('#btn-add-top').onclick = abrirNuevo;
    s.querySelector('#btn-add-manual').onclick = abrirNuevo;
    s.querySelector('#btn-add-narrativo').onclick = ()=> go('modC-narrativo');

    const list = s.querySelector('#vinculos-list');
    cur.moduloC.forEach((v, i)=>{
      const card = document.createElement('div');
      card.className = 'option-card list-item-card';
      card.dataset.index = String(i);
      const notasPreview = v.notas ? ' — ' + esc(v.notas).slice(0,60) + (String(v.notas).length>60?'…':'') : '';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label', 'Editar vínculo ' + (v.nombre || 'sin nombre'));
      card.innerHTML = `
        <div class="list-item-body">
          <div class="ocard-title">${esc(v.nombre)}</div>
          <div class="ocard-sub">${esc(v.tipoVinculo)}${notasPreview}</div>
        </div>
        <button type="button" class="pencil-btn" aria-label="Editar ${esc(v.nombre)}"><span aria-hidden="true">✎</span><span class="pencil-label">Editar</span></button>
      `;
      const editar = (e)=>{
        if(e) e.stopPropagation();
        abrirVinculoModal(card.dataset.index);
      };
      card.onclick = editar;
      card.onkeydown = (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); editar(e); } };
      card.querySelector('.pencil-btn').onclick = editar;
      list.appendChild(card);
    });
  }

  const footerBtns = [
    { label:'Continuar' + (cur.moduloC.length ? ` (${cur.moduloC.length} vínculo${cur.moduloC.length>1?'s':''})` : ' sin agregar vínculos'), onClick: ()=> go('modD') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modB') },
  ];
  const gb = botonGuardarAvance(()=> go('panel-bitacora', {entryId: cur._editingEntryId}));
  if(gb) footerBtns.splice(1, 0, gb);
  navFooter(s, footerBtns);
});

/* ---- módulo C, modo narrativo: texto libre -> prompt de extracción -> parseo -> lista editable ---- */

registerRoute('modC-narrativo', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Vínculos · modo narrativo</div>
    <h2>Cuéntame quiénes son</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Habla o escribe con libertad: quiénes son las personas más significativas de tu vida actual, qué relación tienes con cada una, y qué historia hay detrás si quieres compartirla. No hace falta orden ni estructura.</p>
    <div class="spacer-md"></div>
  `;
  const f1 = buildVoiceField({
    id:'f-narrativa-vinculos', required:true,
    label:'Tu relato de vínculos',
    hint:'Puedes hablar todo el tiempo que necesites. Ej. "Mi hermano Juan siempre ha sido como mi protector, desde niños... con mi mamá la relación es más difícil, siento que hay algo pendiente..."',
    placeholder:'Escribe o dicta tu relato...',
    value: '',
  });
  s.appendChild(f1.el);

  navFooter(s, [
    { label:'Generar prompt de organización', onClick: ()=>{
      const texto = f1.getValue();
      if(!texto){ f1.textareaEl.focus(); return; }
      cur._narrativaVinculos = texto;
      cur._promptExtraccion = buildExtractionPrompt(texto);
      go('modC-narrativo-prompt');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modC') },
  ]);
});

function buildExtractionPrompt(texto){
  return `No crees archivos descargables. No adjuntes documentos. No uses canvas ni editor externo. Responde directamente en este chat con texto plano listo para copiar y pegar en la app.

Vas a organizar un relato libre sobre vínculos afectivos en una lista estructurada. No interpretes ni analices el sentido kármico de nada — solo organiza y clasifica lo que la persona ya contó, corrigiendo por contexto imprecisiones evidentes de dictado por voz (sin inventar contenido nuevo).

TEXTO DEL USUARIO:
"""
${texto}
"""

Para cada persona distinta que identifiques en el relato, extrae:
- nombre: el nombre, apodo o forma en que el usuario se refirió a ella
- tipoVinculo: clasifícalo en una de estas categorías, la que mejor encaje: Familiar, Amoroso, Amistad profunda, Conflicto recurrente, Deuda o desequilibrio, Mentor o guía. Si ninguna encaja bien, usa la más cercana.
- notas: un resumen breve (1-2 frases) de lo que el usuario contó sobre esa relación, en sus propias palabras o muy cerca de ellas, sin agregar interpretación nueva.

No crees archivos descargables. No adjuntes documentos. No uses canvas ni editor externo. Entrega el JSON como texto plano dentro del chat.

Responde ÚNICAMENTE con un arreglo JSON válido, sin texto antes ni después, sin marcadores de código, con esta forma exacta:

[
  { "nombre": "...", "tipoVinculo": "...", "notas": "..." }
]

Si el relato no menciona a nadie con claridad, responde con un arreglo vacío: []`;
}

registerRoute('modC-narrativo-prompt', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Paso siguiente</div>
    <h2>Prompt de organización listo</h2>
    <div class="spacer-sm"></div>
    <p class="body-text">Copia este texto y pégalo en tu asistente de IA de confianza. Luego trae la respuesta de vuelta aquí para revisarla y ajustarla.</p>
    <div class="spacer-md"></div>
    <div class="copy-only-panel">
      <div class="copy-only-title">Prompt de organización preparado</div>
      <p>La app no muestra el prompt completo. Copia, abre tu IA externa y vuelve con el arreglo JSON de vínculos.</p>
      <button class="btn btn-primary copy-pulse" id="btn-copy-vinculos" type="button">Copiar prompt</button>
    </div>
    <div id="ai-access-vinculos"></div>
  `;
  s.querySelector('#btn-copy-vinculos').onclick = async ()=>{
    await copyPromptButton(s.querySelector('#btn-copy-vinculos'), cur._promptExtraccion, s.querySelector('#ai-access-vinculos'));
  };
  renderAIExternalPanel(s.querySelector('#ai-access-vinculos'), ()=>cur._promptExtraccion, { title:'Abrir IA para organizar vínculos' });
  navFooter(s, [
    { label:'Ya tengo la respuesta, continuar', onClick: ()=> go('modC-narrativo-pegar') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modC-narrativo') },
  ]);
});

registerRoute('modC-narrativo-pegar', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Trae el resultado</div>
    <h2>Pega aquí la respuesta de la IA</h2>
    <div class="spacer-md"></div>
    <div class="field">
      <textarea id="respuesta-vinculos-box" placeholder="Pega aquí..." style="min-height:220px;"></textarea>
    </div>
    <div class="prompt-actions-row compact">
      <button class="btn btn-ghost" id="btn-vaciar-vinculos" type="button">Vaciar cajón</button>
    </div>
    <p class="muted" id="parse-error-vinculos" style="color:var(--ember); display:none;"></p>
  `;
  s.querySelector('#btn-vaciar-vinculos').onclick = ()=>{
    const box = s.querySelector('#respuesta-vinculos-box');
    box.value = '';
    const errEl = s.querySelector('#parse-error-vinculos');
    if(errEl){ errEl.textContent = ''; errEl.style.display = 'none'; }
    box.focus();
  };
  navFooter(s, [
    { label:'Organizar mis vínculos', onClick: ()=>{
      const raw = document.getElementById('respuesta-vinculos-box').value.trim();
      const errEl = document.getElementById('parse-error-vinculos');
      if(!raw){ document.getElementById('respuesta-vinculos-box').focus(); return; }
      const parsed = parseVinculosExtraidos(raw);
      if(!parsed){
        errEl.textContent = 'No pudimos leer el formato. Verifica que hayas pegado la respuesta completa.';
        errEl.style.display = 'block';
        return;
      }
      parsed.forEach(v=>{
        cur.moduloC.push({
          nombre: v.nombre || 'Sin nombre',
          tipoVinculo: v.tipoVinculo || 'Sin especificar',
          notas: v.notas || '',
        });
      });
      guardarModuloCSiEditando().then(()=> go('modC'));
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modC-narrativo-prompt') },
  ]);
});

function parseVinculosExtraidos(raw){
  try{
    let txt = raw.trim().replace(/^```json/i,'').replace(/^```/,'').replace(/```$/,'').trim();
    const first = txt.indexOf('[');
    const last = txt.lastIndexOf(']');
    if(first === -1 || last === -1) return null;
    txt = txt.slice(first, last+1);
    const arr = JSON.parse(txt);
    if(!Array.isArray(arr)) return null;
    return arr;
  }catch(e){ return null; }
}

const TIPOS_VINCULO = ['Familiar', 'Amoroso', 'Amistad profunda', 'Conflicto recurrente', 'Deuda o desequilibrio', 'Mentor o guía', 'Protector', 'Espejo'];
const PARENTESCOS = ['Padre', 'Madre', 'Hermano/a', 'Hijo/a', 'Pareja', 'Interés romántico (sin definir)', 'Ex pareja', 'Abuelo/a', 'Tío/a', 'Sobrino/a', 'Primo/a', 'Amigo/a', 'Sin parentesco literal'];

registerRoute('modC-add', (s, opts={})=>{
  const editIndex = normalizarIndiceEdicion(opts);
  if(editIndex !== null){
    vinculoTemp = { nombre:'', tipoVinculo:'', notas:'', ...cur.moduloC[editIndex] };
  }else{
    // Si es nuevo, limpiar siempre. Evita que el formulario herede Lucía u otro vínculo anterior.
    vinculoTemp = { nombre:'', tipoVinculo:'', notas:'' };
  }
  s.innerHTML = `
    <div class="eyebrow">Vínculo</div>
    <h2>${editIndex !== null ? 'Editar vínculo' : 'Nuevo vínculo'}</h2>
    <div class="spacer-md"></div>
    <div class="field">
      <label>Nombre, inicial o apodo</label>
      <input type="text" id="v-nombre" placeholder="Ej. mi hermano, J., mamá..." value="${esc(vinculoTemp.nombre)}">
    </div>
    <div class="field">
      <label>Tipo de vínculo</label>
      <div class="hint">Toca para elegir. La opción elegida queda resaltada.</div>
      <div id="v-tipos"></div>
    </div>
  `;
  const tiposEl = s.querySelector('#v-tipos');
  TIPOS_VINCULO.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'option-card' + (vinculoTemp.tipoVinculo === t ? ' selected' : '');
    card.style.marginBottom = '8px';
    card.innerHTML = `<div class="ocard-title">${t}${vinculoTemp.tipoVinculo === t ? ' ✓' : ''}</div>`;
    card.onclick = ()=>{
      vinculoTemp.tipoVinculo = t;
      tiposEl.querySelectorAll('.option-card').forEach(c=>{
        c.classList.remove('selected');
        c.querySelector('.ocard-title').textContent = c.querySelector('.ocard-title').textContent.replace(' ✓','');
      });
      card.classList.add('selected');
      card.querySelector('.ocard-title').textContent = t + ' ✓';
    };
    tiposEl.appendChild(card);
  });

  const fNotas = buildVoiceField({
    id:'v-notas',
    label:'Cuenta un poco la historia de esta relación',
    hint:'Qué ha pasado entre ustedes, cómo se siente hoy, qué te llama la atención de este vínculo. Con lo que cuentes, la IA buscará después si hay un patrón que se repite o algo por cerrar — no hace falta que tú lo definas aquí.',
    placeholder:'Escribe o dicta libremente...',
    value: vinculoTemp.notas,
  });
  s.appendChild(fNotas.el);

  const footerButtons = [
    { label:'Guardar vínculo', onClick: ()=>{
      const nombre = document.getElementById('v-nombre').value.trim();
      if(!nombre){ document.getElementById('v-nombre').focus(); return; }
      vinculoTemp.nombre = nombre;
      vinculoTemp.notas = fNotas.getValue();
      if(!vinculoTemp.tipoVinculo) vinculoTemp.tipoVinculo = 'Sin especificar';
      if(editIndex !== null){
        cur.moduloC[editIndex] = {...vinculoTemp};
      } else {
        cur.moduloC.push({...vinculoTemp});
      }
      guardarModuloCSiEditando().then(()=> go('modC'));
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modC') },
  ];
  if(editIndex !== null){
    footerButtons.push({ label:'Eliminar este vínculo', variant:'btn-ghost', onClick: ()=>{
      cur.moduloC.splice(editIndex,1);
      guardarModuloCSiEditando().then(()=> go('modC'));
    }});
  }
  navFooter(s, footerButtons);
});

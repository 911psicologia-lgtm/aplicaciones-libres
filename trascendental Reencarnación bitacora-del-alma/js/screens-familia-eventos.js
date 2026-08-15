/* ============================================================
   PANTALLAS — parte 5: módulo D (mapa familiar), módulo E (eventos difíciles)
   ============================================================ */

registerRoute('modD', (s)=>{
  progressTrack(s, 3, 5);
  s.innerHTML += `
    <div class="eyebrow">Módulo 4 de 5 · Tu mapa familiar y relacional</div>
    <h2>Las personas que forman tu historia</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Pareja o parejas, hijos, familia cercana, duelos, rupturas. No hace falta orden ni estructura — cuenta con tus palabras quién forma parte de tu historia y qué ha pasado con cada quien. Puedes dictar todo lo extenso que necesites.</p>
    <div class="spacer-md"></div>
  `;
  const f1 = buildVoiceField({
    id:'f-familia', required:true,
    label:'Tu mapa familiar y relacional',
    hint:'Pareja(s), hijos, padres, hermanos, duelos que has vivido, rupturas importantes. Nombres, apodos o iniciales — como te resulte más cómodo.',
    placeholder:'Ej. Estoy casado con... tengo dos hijos... perdí a mi padre hace... tuve una ruptura importante con...',
    value: cur.moduloD.descripcion,
  });
  s.appendChild(f1.el);

  const footerBtns = [
    { label:'Continuar', onClick: ()=>{
      const v = f1.getValue();
      if(!v){ f1.textareaEl.focus(); return; }
      cur.moduloD.descripcion = v;
      go('modE');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modC') },
  ];
  const gb = botonGuardarAvance(()=> go('panel-bitacora', {entryId: cur._editingEntryId}));
  if(gb) footerBtns.splice(1, 0, gb);
  navFooter(s, footerBtns);
});

/* ---- módulo E: lista de eventos difíciles, con sub-pantalla de agregar ---- */

registerRoute('modE', (s)=>{
  progressTrack(s, 4, 5);
  s.innerHTML += `
    <div class="eyebrow">Módulo 5 de 5 · Momentos difíciles de tu historia</div>
    <h2>Etapas que dejaron huella</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Eventos dolorosos o difíciles, sean o no kármicos a tu parecer. Puedes agregar varios, cada uno como un momento separado de tu vida.</p>
    <div class="spacer-md"></div>
    <div class="option-card" id="btn-add-evento-top" style="border-style:dashed; text-align:center; color:var(--ember); margin-bottom:14px;">
      + Agregar un momento
    </div>
    <div id="eventos-list"></div>
    <div class="option-card" id="btn-add-evento-bottom" style="border-style:dashed; text-align:center; color:var(--ember);">
      + Agregar otro momento
    </div>
  `;
  const list = s.querySelector('#eventos-list');
  if(cur.moduloE.length === 0){
    list.innerHTML = `<p class="muted" style="margin-bottom:14px;">Aún no has agregado ninguno. Puedes continuar sin hacerlo si lo prefieres.</p>`;
  } else {
    cur.moduloE.forEach((ev, i)=>{
      const completo = !!(ev.etapaVida && ev.personas && ev.descripcion);
      const faltantes = [];
      if(!ev.etapaVida) faltantes.push('etapa de vida');
      if(!ev.personas) faltantes.push('personas implicadas');
      if(!ev.descripcion) faltantes.push('descripción');
      const etiquetaEstado = completo ? 'Completo' : `Falta: ${faltantes.join(', ')}`;
      const card = document.createElement('div');
      card.className = 'option-card list-item-card evento-card ' + (completo ? 'evento-completo' : 'evento-incompleto');
      card.innerHTML = `
        <div class="list-item-body">
          <div class="ocard-title">${esc(ev.etapaVida) || 'Un momento de tu historia'}</div>
          <div class="ocard-sub">${ev.esKarmico ? esc(ev.esKarmico) + ' — ' : ''}${esc(ev.descripcion).slice(0,70)}${ev.descripcion.length>70?'…':''}</div>
          <span class="evento-estado">${etiquetaEstado}</span>
        </div>
        <button type="button" class="pencil-btn" aria-label="Editar este momento">✎</button>
      `;
      card.querySelector('.pencil-btn').onclick = (e)=>{
        e.stopPropagation();
        eventoTemp = {...ev};
        go('modE-add', {editIndex:i});
      };
      list.appendChild(card);
    });
  }
  const addHandler = ()=>{
    eventoTemp = { etapaVida:'', personas:'', sentimientos:'', esKarmico:'', descripcion:'' };
    go('modE-add', {editIndex:null});
  };
  s.querySelector('#btn-add-evento-top').onclick = addHandler;
  s.querySelector('#btn-add-evento-bottom').onclick = addHandler;
  const footerBtns = [
    { label:'Continuar a lo que se revela', onClick: ()=> go('tirada') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('modD') },
  ];
  const gb = botonGuardarAvance(()=> go('panel-bitacora', {entryId: cur._editingEntryId}));
  if(gb) footerBtns.splice(1, 0, gb);
  navFooter(s, footerBtns);
});

const OPCIONES_KARMICO = ['Sí, lo siento kármico', 'No, no lo siento kármico', 'No estoy seguro'];

registerRoute('modE-add', (s, opts)=>{
  s.innerHTML = `
    <div class="eyebrow">Momento difícil</div>
    <h2>${opts.editIndex !== null ? 'Editar este momento' : 'Un nuevo momento'}</h2>
    <div class="spacer-md"></div>
    <div class="field">
      <label>¿En qué etapa de tu vida ocurrió?</label>
      <div class="hint">Ej. infancia, adolescencia, mis veinte, hace dos años...</div>
      <input type="text" id="e-etapa" placeholder="Escribe la etapa..." value="${esc(eventoTemp.etapaVida)}">
    </div>
  `;
  const fPersonas = buildVoiceField({
    id:'e-personas',
    label:'¿Quiénes estuvieron implicados?',
    placeholder:'Nombres, apodos o iniciales de las personas involucradas...',
    value: eventoTemp.personas,
  });
  s.appendChild(fPersonas.el);

  const fSentimientos = buildVoiceField({
    id:'e-sentimientos',
    label:'¿Qué sentiste, y qué sientes ahora al recordarlo?',
    placeholder:'Describe con calma lo que sentiste entonces y lo que sientes hoy...',
    value: eventoTemp.sentimientos,
  });
  s.appendChild(fSentimientos.el);

  const fDescripcion = buildVoiceField({
    id:'e-descripcion', required:true,
    label:'Cuenta lo que pasó',
    hint:'Con el detalle que te resulte cómodo. Puedes dictar todo el tiempo que necesites.',
    placeholder:'Cuenta la historia de este momento...',
    value: eventoTemp.descripcion,
  });
  s.appendChild(fDescripcion.el);

  const karmDiv = document.createElement('div');
  karmDiv.className = 'field';
  karmDiv.innerHTML = `<label>¿Lo sientes como algo kármico?</label>`;
  const karmOpts = document.createElement('div');
  OPCIONES_KARMICO.forEach(op=>{
    const card = document.createElement('div');
    card.className = 'option-card' + (eventoTemp.esKarmico === op ? ' selected' : '');
    card.style.marginBottom = '8px';
    card.innerHTML = `<div class="ocard-title">${op}</div>`;
    card.onclick = ()=>{
      eventoTemp.esKarmico = op;
      karmOpts.querySelectorAll('.option-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
    };
    karmOpts.appendChild(card);
  });
  karmDiv.appendChild(karmOpts);
  s.appendChild(karmDiv);

  const footerButtons = [
    { label:'Guardar este momento', onClick: ()=>{
      const desc = fDescripcion.getValue();
      if(!desc){ fDescripcion.textareaEl.focus(); return; }
      eventoTemp.etapaVida = document.getElementById('e-etapa').value.trim();
      eventoTemp.personas = fPersonas.getValue();
      eventoTemp.sentimientos = fSentimientos.getValue();
      eventoTemp.descripcion = desc;
      if(opts.editIndex !== null){
        cur.moduloE[opts.editIndex] = {...eventoTemp};
      } else {
        cur.moduloE.push({...eventoTemp});
      }
      go('modE');
    }},
    { label:'Cancelar', variant:'btn-ghost', onClick: ()=> go('modE') },
  ];
  if(opts.editIndex !== null){
    footerButtons.push({ label:'Eliminar este momento', variant:'btn-ghost', onClick: ()=>{
      cur.moduloE.splice(opts.editIndex,1);
      go('modE');
    }});
  }
  navFooter(s, footerButtons);
});

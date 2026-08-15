/* ============================================================
   IMPORTADOR — convierte una historia ya escrita en los datos
   estructurados de los 5 módulos, vía un único prompt de IA.
   No reemplaza el flujo módulo a módulo: lo prellena para revisión.
   ============================================================ */

registerRoute('importar-alias', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Importar mi historia</div>
    <h2>¿Cómo quieres que te llame esta bitácora?</h2>
    <p class="body-text muted" style="margin-top:8px;">Un alias basta, igual que en el recorrido normal.</p>
    <div class="spacer-md"></div>
    <div class="field">
      <input type="text" id="input-alias-importar" placeholder="Ej. Viajera del norte, R.M., Alma 7..." value="${esc(cur.alias)}">
    </div>
  `;
  navFooter(s, [
    { label:'Continuar', onClick: ()=>{
      const v = document.getElementById('input-alias-importar').value.trim();
      if(!v){ document.getElementById('input-alias-importar').focus(); return; }
      cur.alias = v;
      go('importar-texto');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});

registerRoute('importar-texto', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Importar mi historia</div>
    <h2>Pega o dicta tu historia completa</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Puede ser tan extensa como la tengas: quién eres, tus vínculos, tu familia, presencias o guías que hayas sentido, momentos difíciles. La IA la va a organizar y distribuir en los módulos de la app. Después podrás revisar y ajustar todo, módulo por módulo, antes de generar tu lectura.</p>
    <div class="spacer-md"></div>
  `;
  const f1 = buildVoiceField({
    id:'f-historia-completa', required:true,
    label:'Tu historia',
    hint:'Sin necesidad de orden. Cuenta con la extensión y el detalle que quieras.',
    placeholder:'Pega aquí tu historia ya escrita, o dicta si prefieres...',
    value: cur._historiaCompleta || '',
  });
  s.appendChild(f1.el);

  navFooter(s, [
    { label:'Generar prompt de distribución', onClick: ()=>{
      const texto = f1.getValue();
      if(!texto){ f1.textareaEl.focus(); return; }
      cur._historiaCompleta = texto;
      cur._promptImportacion = buildImportPrompt(texto);
      go('importar-prompt');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('importar-alias') },
  ]);
});

function buildImportPrompt(texto){
  return `No crees archivos descargables. No adjuntes documentos. No uses canvas ni editor externo. Responde directamente en este chat con texto plano listo para copiar y pegar en la app.

Vas a organizar una historia de vida, contada libremente por una persona, en datos estructurados para una aplicación de introspección simbólica. Tu tarea es solo de ORGANIZACIÓN Y CLASIFICACIÓN — no interpretes sentido kármico ni agregues contenido que la persona no haya contado. Corrige por contexto imprecisiones evidentes de dictado por voz o de escritura, sin inventar información nueva. Si algún campo no tiene información suficiente en el texto, déjalo como cadena vacía "" o arreglo vacío [], no inventes contenido para rellenarlo.

TEXTO DE LA PERSONA:
"""
${texto}
"""

No crees archivos descargables. No adjuntes documentos. No uses canvas ni editor externo. Entrega el JSON como texto plano dentro del chat.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin marcadores de código, con esta forma exacta:

{
  "moduloA": {
    "autodescripcion": "cómo se describe la persona: quién siente que es, qué la mueve, qué le pesa",
    "patron": "un patrón que la persona sienta que se repite en su vida",
    "rasgo": "algo sin explicación fácil que haya mencionado: un miedo, una atracción, un talento sin causa clara",
    "sensaciones": "sensaciones corporales, marcas o malestares con carga simbólica que la persona haya mencionado, si los hay"
  },
  "moduloB": {
    "presencias": "presencias protectoras que haya sentido",
    "amigoImaginario": "amigo imaginario de la infancia, si lo menciona",
    "suenoGuia": "algún sueño sentido como guía, si lo menciona",
    "nombrePresencia": "nombre que le haya dado a alguna presencia, si aplica"
  },
  "moduloC": [
    { "nombre": "nombre o apodo de la persona vinculada", "tipoVinculo": "una de: Familiar, Amoroso, Amistad profunda, Conflicto recurrente, Deuda o desequilibrio, Mentor o guía", "notas": "resumen breve de la relación, en palabras cercanas a las del usuario" }
  ],
  "moduloD": {
    "descripcion": "resumen del mapa familiar y relacional: pareja(s), hijos, familia cercana, duelos, rupturas, tal como lo contó la persona"
  },
  "moduloE": [
    { "etapaVida": "etapa o momento de la vida en que ocurrió", "personas": "personas implicadas", "sentimientos": "qué sintió entonces y qué siente ahora", "esKarmico": "uno de: 'Sí, lo siento kármico', 'No, no lo siento kármico', 'No estoy seguro' — solo si la persona lo indica explícita o implícitamente, si no hay pista usa 'No estoy seguro'", "descripcion": "qué pasó, con el detalle que haya dado la persona" }
  ]
}

Si el texto no aporta nada para algún módulo, dejarlo vacío como se indicó arriba — es preferible un campo vacío a uno inventado.`;
}

registerRoute('importar-prompt', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Paso siguiente</div>
    <h2>Tu prompt de distribución está listo</h2>
    <div class="spacer-sm"></div>
    <p class="body-text">Copia este texto y pégalo en tu asistente de IA de confianza. Luego trae la respuesta de vuelta aquí.</p>
    <div class="spacer-md"></div>
    <div class="copy-only-panel">
      <div class="copy-only-title">Prompt de distribución preparado</div>
      <p>La app no muestra el prompt completo. Copia, abre tu IA externa y trae de vuelta el JSON organizado.</p>
      <button class="btn btn-primary copy-pulse" id="btn-copy-importar" type="button">Copiar prompt</button>
    </div>
    <div id="ai-access-importar"></div>
  `;
  s.querySelector('#btn-copy-importar').onclick = async ()=>{
    await copyPromptButton(s.querySelector('#btn-copy-importar'), cur._promptImportacion, s.querySelector('#ai-access-importar'));
  };
  renderAIExternalPanel(s.querySelector('#ai-access-importar'), ()=>cur._promptImportacion, { title:'Abrir IA para distribuir el texto' });
  navFooter(s, [
    { label:'Ya tengo la respuesta, continuar', onClick: ()=> go('importar-pegar') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('importar-texto') },
  ]);
});

registerRoute('importar-pegar', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Trae el resultado</div>
    <h2>Pega aquí la respuesta de la IA</h2>
    <div class="spacer-md"></div>
    <div class="field">
      <textarea id="respuesta-importar-box" placeholder="Pega aquí..." style="min-height:260px;"></textarea>
    </div>
    <div class="prompt-actions-row compact">
      <button class="btn btn-ghost" id="btn-vaciar-importar" type="button">Vaciar cajón</button>
    </div>
    <p class="muted" id="parse-error-importar" style="color:var(--ember); display:none;"></p>
  `;
  navFooter(s, [
    { label:'Distribuir en mis módulos', onClick: ()=>{
      const raw = document.getElementById('respuesta-importar-box').value.trim();
      const errEl = document.getElementById('parse-error-importar');
      if(!raw){ document.getElementById('respuesta-importar-box').focus(); return; }
      const parsed = parseImportacion(raw);
      if(!parsed){
        errEl.textContent = 'No pudimos leer el formato. Verifica que hayas pegado la respuesta completa.';
        errEl.style.display = 'block';
        return;
      }
      aplicarImportacion(parsed);
      go('importar-listo');
    }},
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('importar-prompt') },
  ]);
});

function parseImportacion(raw){
  try{
    let txt = raw.trim().replace(/^```json/i,'').replace(/^```/,'').replace(/```$/,'').trim();
    const first = txt.indexOf('{');
    const last = txt.lastIndexOf('}');
    if(first === -1 || last === -1) return null;
    txt = txt.slice(first, last+1);
    const obj = JSON.parse(txt);
    if(!obj.moduloA) return null;
    return obj;
  }catch(e){ return null; }
}

function aplicarImportacion(obj){
  if(obj.moduloA) cur.moduloA = {
    autodescripcion: obj.moduloA.autodescripcion || '',
    patron: obj.moduloA.patron || '',
    rasgo: obj.moduloA.rasgo || '',
    sensaciones: obj.moduloA.sensaciones || '',
  };
  if(obj.moduloB) cur.moduloB = {
    presencias: obj.moduloB.presencias || '',
    amigoImaginario: obj.moduloB.amigoImaginario || '',
    suenoGuia: obj.moduloB.suenoGuia || '',
    nombrePresencia: obj.moduloB.nombrePresencia || '',
  };
  if(Array.isArray(obj.moduloC)) cur.moduloC = obj.moduloC.map(v=>({
    nombre: v.nombre || 'Sin nombre',
    tipoVinculo: v.tipoVinculo || 'Sin especificar',
    notas: v.notas || '',
  }));
  if(obj.moduloD) cur.moduloD = { descripcion: obj.moduloD.descripcion || '' };
  if(Array.isArray(obj.moduloE)) cur.moduloE = obj.moduloE.map(e=>({
    etapaVida: e.etapaVida || '',
    personas: e.personas || '',
    sentimientos: e.sentimientos || '',
    esKarmico: e.esKarmico || '',
    descripcion: e.descripcion || '',
  }));
}

registerRoute('importar-listo', (s)=>{
  s.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <div class="home-mark"></div>
      <h2>Tu historia quedó distribuida</h2>
      <p class="body-text muted" style="margin-top:10px;">Revisa cada módulo y ajusta lo que necesites antes de generar tu lectura. Nada quedó fijo todavía.</p>
    </div>
  `;
  navFooter(s, [
    { label:'Revisar módulo 1', onClick: ()=> go('modA') },
    { label:'Atrás', variant:'btn-ghost', onClick: ()=> go('importar-pegar') },
  ]);
});

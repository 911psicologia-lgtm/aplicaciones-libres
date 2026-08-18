(function () {
  'use strict';
  const STAI = window.STAI = window.STAI || {};
  const data = STAI.data;
  const scoring = STAI.scoring;
  const report = STAI.report;

  const screenOrder = ['intro', 'demo', 'data', 'state', 'trait', 'ai', 'report'];
  const app = {
    screen: 'intro',
    statePage: 0,
    traitPage: 0,
    responses: {},
    aiMode: false,
    aiJson: null,
    copiedPrompt: '',
    demoMode: false,
    consent: { accepted: false, acceptedAt: '', text: '' },
    evaluator: { signatureDataUrl: '' },
    signatureHasInk: false
  };

  function byId(id) { return document.getElementById(id); }
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function field(id) { const el = byId(id); return el ? String(el.value || '').trim() : ''; }
  function checked(id) { const el = byId(id); return !!(el && el.checked); }

  function toast(message) {
    const el = byId('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  function nowParts() {
    const d = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return {
      date: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
      time: pad(d.getHours()) + ':' + pad(d.getMinutes()),
      display: d.toLocaleString('es-CO')
    };
  }

  function setScreen(name) {
    if (screenOrder.indexOf(name) === -1) return;
    app.screen = name;
    all('.screen').forEach(function (el) { el.classList.toggle('active', el.dataset.screen === name); });
    const index = screenOrder.indexOf(name);
    all('.step-chip').forEach(function (el) {
      const i = screenOrder.indexOf(el.dataset.target);
      el.classList.toggle('active', el.dataset.target === name);
      el.classList.toggle('done', i >= 0 && i < index);
    });
    byId('progressFill').style.width = (index / (screenOrder.length - 1) * 100) + '%';
    if (name === 'state') renderQuestions('state');
    if (name === 'trait') renderQuestions('trait');
    if (name === 'ai') refreshBaseSummary();
    if (name === 'report') refreshFinalSummary();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function canNavigate(target) {
    if (target === 'intro') return true;
    if (!app.consent.accepted) { toast('La persona evaluada debe aceptar el consentimiento antes de continuar.'); return false; }
    if (target === 'demo' || target === 'data' || target === 'state') return true;
    const stateResult = scoring.scoreScale(data.stateItems, app.responses);
    if (target === 'trait') {
      if (!stateResult.complete) { toast('Completa primero los 20 ítems de Ansiedad-Estado.'); return false; }
      return true;
    }
    const traitResult = scoring.scoreScale(data.traitItems, app.responses);
    if (target === 'ai' || target === 'report') {
      if (!stateResult.complete || !traitResult.complete) { toast('Completa las 40 respuestas antes de continuar.'); return false; }
      return true;
    }
    return true;
  }

  function getPatient() {
    return {
      name: field('patientName'),
      code: field('patientCode'),
      birthDate: field('birthDate'),
      age: scoring.ageFromBirthDate(field('birthDate'), field('applicationDate') || undefined),
      sex: field('sex'),
      gender: field('gender'),
      normGroup: field('normGroup'),
      country: field('country'),
      education: field('education'),
      occupation: field('occupation'),
      applicationDate: field('applicationDate'),
      applicationTime: field('applicationTime'),
      modality: field('modality'),
      context: field('context'),
      observations: field('observations')
    };
  }

  function updateAge() {
    const age = scoring.ageFromBirthDate(field('birthDate'), field('applicationDate') || undefined);
    byId('agePreview').value = age === '' ? '' : age + ' años';
  }

  function setPatientFields(p) {
    p = p || {};
    const ids = ['patientName','patientCode','birthDate','sex','gender','normGroup','country','education','occupation','modality','context','observations'];
    const keys = ['name','code','birthDate','sex','gender','normGroup','country','education','occupation','modality','context','observations'];
    ids.forEach(function (id, i) { if (byId(id)) byId(id).value = p[keys[i]] || ''; });
    updateAge();
  }

  function renderQuestions(kind) {
    const isState = kind === 'state';
    const items = isState ? data.stateItems : data.traitItems;
    const options = isState ? data.stateOptions : data.traitOptions;
    const page = isState ? app.statePage : app.traitPage;
    const start = page * 5;
    const subset = items.slice(start, start + 5);
    const host = byId(isState ? 'stateQuestions' : 'traitQuestions');
    host.innerHTML = subset.map(function (item) {
      const opts = options.map(function (opt) {
        const id = kind + '-' + item.id + '-' + opt.value;
        const isChecked = String(app.responses[item.id]) === String(opt.value) ? ' checked' : '';
        return '<div class="option"><input type="radio" name="' + kind + '-' + item.id + '" id="' + id + '" value="' + opt.value + '"' + isChecked + '><label for="' + id + '">' + opt.label + '</label></div>';
      }).join('');
      return '<div class="qcard"><div class="qhead"><div class="qnum">' + item.id + '</div><div class="qtext">' + item.text + '</div></div><div class="options">' + opts + '</div></div>';
    }).join('');
    Array.prototype.slice.call(host.querySelectorAll('input[type=radio]')).forEach(function (input) {
      input.addEventListener('change', function (event) {
        const itemId = Number(event.target.name.split('-')[1]);
        app.responses[itemId] = Number(event.target.value);
        updateQuestionNav(kind);
      });
    });
    const currentEnd = Math.min(start + 5, items.length);
    byId(isState ? 'statePageLabel' : 'traitPageLabel').textContent = 'Ítems ' + (start + 1) + '–' + currentEnd + ' de 20';
    byId(isState ? 'stateMicroFill' : 'traitMicroFill').style.width = (currentEnd / 20 * 100) + '%';
    updateQuestionNav(kind);
  }

  function pageComplete(kind) {
    const isState = kind === 'state';
    const page = isState ? app.statePage : app.traitPage;
    const items = (isState ? data.stateItems : data.traitItems).slice(page * 5, page * 5 + 5);
    return items.every(function (item) { return app.responses[item.id] !== undefined; });
  }

  function updateQuestionNav(kind) {
    const isState = kind === 'state';
    const page = isState ? app.statePage : app.traitPage;
    const prev = byId(isState ? 'statePrev' : 'traitPrev');
    const next = byId(isState ? 'stateNext' : 'traitNext');
    prev.disabled = page === 0;
    next.disabled = !pageComplete(kind);
    next.textContent = page === 3 ? (isState ? 'Continuar a Ansiedad-Rasgo' : 'Ver resultados base') : 'Siguiente bloque';
  }

  function nextQuestionPage(kind) {
    if (!pageComplete(kind)) { toast('Responde los cinco ítems de este bloque.'); return; }
    if (kind === 'state') {
      if (app.statePage < 3) { app.statePage += 1; renderQuestions('state'); window.scrollTo(0, 150); }
      else setScreen('trait');
    } else {
      if (app.traitPage < 3) { app.traitPage += 1; renderQuestions('trait'); window.scrollTo(0, 150); }
      else setScreen('ai');
    }
  }

  function prevQuestionPage(kind) {
    if (kind === 'state' && app.statePage > 0) { app.statePage -= 1; renderQuestions('state'); }
    if (kind === 'trait' && app.traitPage > 0) { app.traitPage -= 1; renderQuestions('trait'); }
  }

  function currentResults() {
    const s = scoring.scoreScale(data.stateItems, app.responses);
    const t = scoring.scoreScale(data.traitItems, app.responses);
    const sd = field('stateDecatype');
    const td = field('traitDecatype');
    return {
      stateScore: s.score,
      traitScore: t.score,
      statePosition: scoring.descriptivePosition(s.score),
      traitPosition: scoring.descriptivePosition(t.score),
      stateDecatype: sd,
      traitDecatype: td,
      stateDecatypeBand: scoring.decatypeBand(sd),
      traitDecatypeBand: scoring.decatypeBand(td),
      integrated: scoring.integratedProfile(s.score, t.score, sd, td),
      stateComplete: s.complete,
      traitComplete: t.complete,
      stateMissing: s.missing,
      traitMissing: t.missing
    };
  }

  function refreshBaseSummary() {
    const r = currentResults();
    byId('stateScore').textContent = r.stateScore === null ? '—' : r.stateScore;
    byId('traitScore').textContent = r.traitScore === null ? '—' : r.traitScore;
    byId('stateBand').textContent = r.stateDecatypeBand ? (r.stateDecatypeBand + ' · decatipo ' + r.stateDecatype) : r.statePosition;
    byId('traitBand').textContent = r.traitDecatypeBand ? (r.traitDecatypeBand + ' · decatipo ' + r.traitDecatype) : r.traitPosition;
    byId('stateMeter').style.width = (r.stateScore === null ? 0 : r.stateScore / 60 * 100) + '%';
    byId('traitMeter').style.width = (r.traitScore === null ? 0 : r.traitScore / 60 * 100) + '%';
    byId('profileText').textContent = r.integrated;
  }

  function setAiMode(enabled) {
    app.aiMode = !!enabled;
    byId('chooseAi').classList.toggle('active', app.aiMode);
    byId('chooseNoAi').classList.toggle('active', !app.aiMode);
    byId('aiPanel').classList.toggle('visible', app.aiMode);
  }

  function buildPrompt() {
    const p = getPatient();
    const r = currentResults();
    const hc = field('clinicalHistory');
    const includeIdentifiers = checked('includeIdentifiers');
    const identity = includeIdentifiers ? { nombre: p.name || null, codigo: p.code || null } : { nombre: null, codigo: p.code || 'Sin identificador nominal' };
    const caseData = {
      instrumento: 'STAI - Inventario de Ansiedad Estado-Rasgo',
      paciente: {
        nombre: identity.nombre,
        codigo: identity.codigo,
        edad: p.age === '' ? null : p.age,
        sexo_baremacion: p.sex || null,
        identidad_genero: p.gender || null,
        grupo_normativo: p.normGroup || null,
        escolaridad: p.education || null,
        ocupacion: p.occupation || null,
        pais_region: p.country || null,
        fecha_aplicacion: p.applicationDate || null,
        modalidad: p.modality || null,
        motivo_contexto: p.context || null,
        observaciones: p.observations || null
      },
      resultados: {
        ansiedad_estado: { puntuacion_directa: r.stateScore, rango: '0-60', posicion_descriptiva: r.statePosition, decatipo_manual: r.stateDecatype || null, lectura_decatipo: r.stateDecatypeBand || null },
        ansiedad_rasgo: { puntuacion_directa: r.traitScore, rango: '0-60', posicion_descriptiva: r.traitPosition, decatipo_manual: r.traitDecatype || null, lectura_decatipo: r.traitDecatypeBand || null },
        perfil_integrado_base: r.integrated
      },
      historia_clinica_o_notas: hc || null
    };
    return [
      'Actúa como asistente de análisis clínico para un profesional de salud mental. Contextualiza los resultados del STAI sin reemplazar el juicio clínico y sin convertir el instrumento en diagnóstico.',
      '',
      'MARCO DE ANÁLISIS: trabaja desde una lógica multicausal, relacional e interdependiente. Evita explicaciones lineales o monocausales. Diferencia datos, inferencias e hipótesis. Examina posibles bucles, tensiones, contradicciones, recursos y factores protectores.',
      '',
      'REGLAS OBLIGATORIAS:',
      '1. No inventes datos, síntomas, diagnósticos, riesgos, antecedentes ni eventos.',
      '2. Distingue lo sustentado por el STAI de lo aportado por historia clínica/notas.',
      '3. Si falta información, indícalo explícitamente.',
      '4. No diagnostiques a partir del STAI. Formula hipótesis de trabajo contrastables.',
      '5. Las posiciones por tercios del rango 0-60 son descriptivas, no normativas. Usa decatipos solo si fueron ingresados.',
      '6. Explora relaciones recíprocas: desencadenantes, mantenedores, vulnerabilidades, contexto, recursos y protectores.',
      '7. Evita lenguaje determinista. Usa formulaciones prudentes como “podría”, “sugiere explorar” o “hipótesis a contrastar”.',
      '8. Si aparecen alertas relevantes en la historia, señálalas para exploración profesional sin convertirlas en diagnóstico.',
      '9. Además del análisis clínico ampliado, genera un bloque informe_sencillo para remisión, soporte documental o contexto jurídico. Ese bloque NO debe contener hipótesis clínicas, diagnósticos nuevos ni recomendaciones terapéuticas.',
      '10. En informe_sencillo, interpreta únicamente a la luz del STAI y de los datos explícitos aportados. En relaciones_estado_actual distingue causalidad sustentada, factores contribuyentes y asociaciones. No presentes correlación o coincidencia temporal como causalidad demostrada.',
      '11. Si la información no permite afirmar una relación causal específica, dilo de manera expresa y sobria.',
      '12. Devuelve SOLO JSON válido, sin Markdown ni texto fuera del objeto.',
      '',
      'DATOS DEL CASO:',
      JSON.stringify(caseData, null, 2),
      '',
      'DEVUELVE EXACTAMENTE UN OBJETO CON ESTA ESTRUCTURA:',
      JSON.stringify({
        version: 'STAI-IA-1.0',
        resumen_integrado: 'síntesis prudente, multicausal y relacional',
        lectura_estado: 'contextualización de Ansiedad-Estado',
        lectura_rasgo: 'contextualización de Ansiedad-Rasgo',
        relacion_estado_rasgo: 'relación entre ambos resultados sin asumir causalidad',
        factores_contextuales: [{ factor: 'nombre breve', tipo: 'desencadenante|mantenedor|vulnerabilidad|protector|recurso|contexto', evidencia: 'dato que lo sustenta', relacion: 'vínculo hipotético con otros factores o con el perfil STAI', peso: 0 }],
        hipotesis_clinicas: [{ hipotesis: 'hipótesis no diagnóstica', evidencia_a_favor: ['dato'], evidencia_en_contra: ['dato o límite'], como_contrastar: 'pregunta, observación o información necesaria' }],
        recursos_protectores: ['recurso o factor protector'],
        alertas: ['aspecto que requiere exploración profesional'],
        preguntas_clinicas_sugeridas: ['pregunta breve y útil'],
        recomendaciones_evaluacion: ['siguiente foco de evaluación, no tratamiento automático'],
        limites_interpretativos: 'límites y datos faltantes',
        dimensiones_contextuales: [{ nombre: 'dimensión clínica contextual', valor: 0 }],
        relaciones: [{ origen: 'factor existente', destino: 'factor existente', tipo: 'relación hipotética' }],
        informe_sencillo: {
          interpretacion_instrumento: 'interpretación breve de A/E y A/R a la luz del STAI, sin hipótesis',
          relaciones_estado_actual: ['viñeta factual o relacional sobre el estado actual; indicar si es causal, contribuyente o asociativa solo cuando esté sustentado'],
          conclusion_final: 'conclusión breve, objetiva y no diagnóstica, útil para remisión o soporte documental'
        }
      }, null, 2),
      '',
      'Para dimensiones_contextuales usa de 3 a 9 dimensiones y valores enteros de 0 a 10 solo como representación auxiliar del contexto, nunca como subescalas STAI. En relaciones utiliza nombres que coincidan con factores_contextuales cuando sea posible.'
    ].join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand('copy'); ta.remove();
        ok ? resolve() : reject(new Error('No se pudo copiar'));
      } catch (e) { reject(e); }
    });
  }

  function renderAiProviders() {
    byId('aiButtons').innerHTML = data.aiProviders.map(function (p) {
      return '<a href="' + p[1] + '" target="_blank" rel="noopener noreferrer">' + p[0] + '</a>';
    }).join('');
  }

  function cleanJsonText(text) {
    return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  function validateAiJson(showToast) {
    const raw = cleanJsonText(field('aiResponse'));
    const status = byId('jsonStatus');
    status.className = 'status';
    if (!raw) {
      app.aiJson = null;
      status.textContent = 'No hay respuesta JSON pegada.';
      status.classList.add('err');
      if (showToast) toast('Pega primero la respuesta JSON.');
      return false;
    }
    try {
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('La respuesta debe ser un objeto JSON.');
      if (!obj.resumen_integrado && !obj.lectura_estado && !obj.lectura_rasgo) throw new Error('El JSON no contiene los campos clínicos esperados.');
      app.aiJson = obj;
      status.textContent = '✓ Contextualización reconocida correctamente.';
      status.classList.add('ok');
      if (showToast) toast('JSON validado.');
      return true;
    } catch (e) {
      app.aiJson = null;
      status.textContent = 'No se pudo validar: ' + e.message;
      status.classList.add('err');
      if (showToast) toast('El JSON necesita corrección.');
      return false;
    }
  }

  function consentData() {
    return {
      accepted: app.consent.accepted,
      acceptedAt: app.consent.acceptedAt,
      acceptedBy: 'Persona evaluada',
      text: app.consent.text
    };
  }

  function collectEvaluator() {
    return {
      signatureDataUrl: app.evaluator.signatureDataUrl || '',
      name: field('evalName'),
      profession: field('evalProfession'),
      license: field('evalLicense'),
      phone: field('evalPhone'),
      email: field('evalEmail'),
      workplace: field('evalWorkplace'),
      address: field('evalAddress'),
      cityCountry: field('evalCityCountry')
    };
  }

  function currentPayload() {
    const p = getPatient();
    const r = currentResults();
    const payload = {
      appVersion: '3.0.0',
      generatedAt: new Date().toLocaleString('es-CO'),
      demoMode: app.demoMode,
      patient: p,
      consent: consentData(),
      evaluator: collectEvaluator(),
      results: r,
      aiJson: app.aiMode ? app.aiJson : null
    };
    payload.textReport = report.buildTextReport(payload);
    return payload;
  }

  function fileBase(payload) {
    const p = payload.patient || {};
    const base = p.code || p.name || 'STAI';
    return ('STAI_' + base + '_' + (p.applicationDate || nowParts().date)).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/_+/g, '_').slice(0, 90);
  }

  function downloadBlob(content, name, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function reportHtml(autoPrint) {
    const payload = currentPayload();
    return { payload: payload, html: report.buildReportHtml(payload, { autoPrint: !!autoPrint }) };
  }

  function briefReportHtml(autoPrint) {
    const payload = currentPayload();
    return { payload: payload, html: report.buildBriefReportHtml(payload, { autoPrint: !!autoPrint }) };
  }

  function openHtml(html) {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const win = window.open(url, '_blank');
    if (!win) { URL.revokeObjectURL(url); toast('El navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.'); return false; }
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    return true;
  }

  function refreshFinalSummary() {
    const r = currentResults();
    const p = getPatient();
    byId('finalPatient').textContent = p.name || p.code || 'Persona evaluada';
    byId('finalScores').textContent = 'A/E ' + (r.stateScore === null ? '—' : r.stateScore) + '/60 · A/R ' + (r.traitScore === null ? '—' : r.traitScore) + '/60';
    byId('finalAi').textContent = app.aiMode && app.aiJson ? 'Contextualización IA validada e integrada.' : 'Informe preparado sin contextualización IA.';
    const briefStatus = byId('briefAiStatus');
    if (briefStatus) briefStatus.textContent = app.aiMode && app.aiJson ? 'Informe breve: se utilizará el bloque sintético generado por la IA, sin hipótesis clínicas.' : 'Informe breve: se generará directamente desde los resultados STAI, sin hipótesis clínicas ni causalidad no sustentada.';
  }

  function clearPatientAndProtocol() {
    setPatientFields({ country: 'Colombia', modality: 'Individual presencial' });
    const n = nowParts();
    byId('applicationDate').value = n.date;
    byId('applicationTime').value = n.time;
    byId('stateDecatype').value = '';
    byId('traitDecatype').value = '';
    byId('clinicalHistory').value = '';
    byId('aiResponse').value = '';
    byId('includeIdentifiers').checked = false;
    byId('jsonStatus').textContent = '';
    byId('jsonStatus').className = 'status';
    byId('copyState').classList.remove('visible');
    byId('aiButtons').classList.remove('visible');
    app.responses = {};
    app.statePage = 0;
    app.traitPage = 0;
    app.aiJson = null;
    app.copiedPrompt = '';
    setAiMode(false);
    renderQuestions('state'); renderQuestions('trait'); updateAge();
  }

  function loadDemo() {
    const d = data.demo;
    clearPatientAndProtocol();
    setPatientFields(d.patient);
    const n = nowParts();
    byId('applicationDate').value = n.date;
    byId('applicationTime').value = n.time;
    updateAge();
    app.responses = Object.assign({}, d.responses);
    app.demoMode = true;
    byId('demoStrip').classList.add('visible');
    byId('clinicalHistory').value = d.history;
    byId('aiResponse').value = JSON.stringify(d.aiJson, null, 2);
    app.aiJson = JSON.parse(JSON.stringify(d.aiJson));
    setAiMode(true);
    byId('jsonStatus').textContent = '✓ Contextualización demo reconocida correctamente.';
    byId('jsonStatus').className = 'status ok';
    renderQuestions('state'); renderQuestions('trait');
    setScreen('data');
    toast('Demo ficticio cargado. Puedes recorrer todas las etapas.');
  }

  function startBlank() {
    clearPatientAndProtocol();
    app.demoMode = false;
    byId('demoStrip').classList.remove('visible');
    setScreen('data');
  }

  function resetProtocol() {
    if (!window.confirm('¿Crear un nuevo protocolo? Se borrarán los datos y respuestas actuales. La configuración guardada del evaluador se conservará.')) return;
    clearPatientAndProtocol();
    app.demoMode = false;
    byId('demoStrip').classList.remove('visible');
    app.consent.accepted = false; app.consent.acceptedAt = '';
    byId('consentAccepted').checked = false; byId('acceptStart').disabled = true;
    setScreen('intro');
  }

  function openDrawer() {
    byId('evaluatorDrawer').classList.add('visible');
    byId('drawerBackdrop').classList.add('visible');
    byId('evaluatorDrawer').setAttribute('aria-hidden', 'false');
    setTimeout(function () { redrawSignature(); }, 50);
  }

  function closeDrawer() {
    byId('evaluatorDrawer').classList.remove('visible');
    byId('drawerBackdrop').classList.remove('visible');
    byId('evaluatorDrawer').setAttribute('aria-hidden', 'true');
  }

  function setEvaluatorFields(e) {
    e = e || {};
    byId('evalName').value = e.name || '';
    byId('evalProfession').value = e.profession || '';
    byId('evalLicense').value = e.license || '';
    byId('evalPhone').value = e.phone || '';
    byId('evalEmail').value = e.email || '';
    byId('evalWorkplace').value = e.workplace || '';
    byId('evalAddress').value = e.address || '';
    byId('evalCityCountry').value = e.cityCountry || '';
    app.evaluator.signatureDataUrl = e.signatureDataUrl || '';
    redrawSignature();
  }

  function storedEvaluator() {
    try {
      const raw = localStorage.getItem('staiEvaluatorV2');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function applyEvaluator() {
    app.evaluator = collectEvaluator();
    if (checked('saveEvaluator')) {
      try { localStorage.setItem('staiEvaluatorV2', JSON.stringify(app.evaluator)); toast('Datos del evaluador aplicados y guardados en este dispositivo.'); }
      catch (e) { toast('Datos aplicados; el navegador no permitió guardarlos localmente.'); }
    } else {
      try { localStorage.removeItem('staiEvaluatorV2'); } catch (e) {}
      toast('Datos del evaluador aplicados solo a este protocolo.');
    }
    closeDrawer();
  }

  function clearEvaluatorData() {
    if (!window.confirm('¿Borrar los datos y la firma del evaluador?')) return;
    setEvaluatorFields({});
    byId('saveEvaluator').checked = false;
    try { localStorage.removeItem('staiEvaluatorV2'); } catch (e) {}
    toast('Configuración del evaluador borrada.');
  }

  function signatureCanvas() { return byId('signatureCanvas'); }
  function clearSignatureCanvas() {
    const c = signatureCanvas();
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    app.evaluator.signatureDataUrl = '';
    app.signatureHasInk = false;
  }

  function redrawSignature() {
    const c = signatureCanvas();
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    if (!app.evaluator.signatureDataUrl) return;
    const img = new Image();
    img.onload = function () {
      const scale = Math.min(c.width / img.width, c.height / img.height, 1);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, 10, (c.height - h) / 2, w, h);
      app.signatureHasInk = true;
    };
    img.src = app.evaluator.signatureDataUrl;
  }

  function initSignature() {
    const c = signatureCanvas();
    const ctx = c.getContext('2d');
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1f2c3c';
    let drawing = false;
    function pos(ev) {
      const rect = c.getBoundingClientRect();
      return { x: (ev.clientX - rect.left) * (c.width / rect.width), y: (ev.clientY - rect.top) * (c.height / rect.height) };
    }
    c.addEventListener('pointerdown', function (ev) {
      drawing = true; c.setPointerCapture(ev.pointerId); const p = pos(ev); ctx.beginPath(); ctx.moveTo(p.x, p.y); app.signatureHasInk = true;
    });
    c.addEventListener('pointermove', function (ev) { if (!drawing) return; const p = pos(ev); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    function end(ev) {
      if (!drawing) return; drawing = false; try { c.releasePointerCapture(ev.pointerId); } catch (e) {}
      app.evaluator.signatureDataUrl = c.toDataURL('image/png');
    }
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end); c.addEventListener('pointerleave', function () { if (drawing) { drawing = false; app.evaluator.signatureDataUrl = c.toDataURL('image/png'); } });
  }

  function loadSignatureFile(file) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) { toast('Selecciona una imagen válida.'); return; }
    const reader = new FileReader();
    reader.onload = function () { app.evaluator.signatureDataUrl = String(reader.result || ''); redrawSignature(); toast('Firma cargada.'); };
    reader.readAsDataURL(file);
  }

  function setupPwaOnlyOnWeb() {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      const link = document.createElement('link'); link.rel = 'manifest'; link.href = './manifest.webmanifest'; document.head.appendChild(link);
      if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
      }
    }
  }

  function bind() {
    byId('consentText') && (app.consent.text = byId('consentText').textContent.trim());
    byId('consentAccepted').addEventListener('change', function () {
      app.consent.accepted = this.checked;
      app.consent.acceptedAt = this.checked ? new Date().toLocaleString('es-CO') : '';
      byId('acceptStart').disabled = !this.checked;
    });
    byId('acceptStart').addEventListener('click', function () { if (app.consent.accepted) setScreen('demo'); });
    byId('loadDemo').addEventListener('click', loadDemo);
    byId('newBlank').addEventListener('click', startBlank);
    byId('birthDate').addEventListener('change', updateAge);
    byId('applicationDate').addEventListener('change', updateAge);
    byId('toState').addEventListener('click', function () { setScreen('state'); });
    byId('statePrev').addEventListener('click', function () { prevQuestionPage('state'); });
    byId('stateNext').addEventListener('click', function () { nextQuestionPage('state'); });
    byId('traitPrev').addEventListener('click', function () { prevQuestionPage('trait'); });
    byId('traitNext').addEventListener('click', function () { nextQuestionPage('trait'); });
    byId('stateDecatype').addEventListener('input', refreshBaseSummary);
    byId('traitDecatype').addEventListener('input', refreshBaseSummary);
    byId('chooseNoAi').addEventListener('click', function () { setAiMode(false); });
    byId('chooseAi').addEventListener('click', function () { setAiMode(true); });
    byId('aiGenerate').addEventListener('click', function () {
      const r = currentResults();
      if (!r.stateComplete || !r.traitComplete) { toast('Completa las 40 respuestas.'); return; }
      app.copiedPrompt = buildPrompt();
      copyText(app.copiedPrompt).then(function () {
        byId('copyState').classList.add('visible'); byId('aiButtons').classList.add('visible'); toast('Prompt clínico copiado.');
      }).catch(function () { toast('No fue posible copiar automáticamente. Revisa los permisos del navegador.'); });
    });
    byId('validateJson').addEventListener('click', function () { if (!app.aiMode) { toast('Activa “Contextualizar con IA” para usar esta opción.'); return; } validateAiJson(true); });
    byId('toReport').addEventListener('click', function () {
      const r = currentResults();
      if (!r.stateComplete || !r.traitComplete) { toast('Completa las 40 respuestas.'); return; }
      if (app.aiMode && !app.aiJson && !validateAiJson(false)) { toast('Valida la respuesta JSON o selecciona “Sin IA”.'); return; }
      setScreen('report');
    });
    byId('aiResponse').addEventListener('input', function () { if (app.aiJson) { app.aiJson = null; byId('jsonStatus').textContent = ''; byId('jsonStatus').className = 'status'; } });

    all('[data-go]').forEach(function (btn) { btn.addEventListener('click', function () { const target = btn.dataset.go; if (canNavigate(target)) setScreen(target); }); });
    all('.step-chip').forEach(function (btn) { btn.addEventListener('click', function () { const target = btn.dataset.target; if (canNavigate(target)) setScreen(target); }); });

    byId('downloadHtml').addEventListener('click', function () { const r = reportHtml(false); downloadBlob(r.html, fileBase(r.payload) + '.html', 'text/html;charset=utf-8'); toast('Informe HTML generado.'); });
    byId('downloadPdf').addEventListener('click', function () { const r = reportHtml(true); if (openHtml(r.html)) toast('Se abrió la versión de impresión. Elige “Guardar como PDF”.'); });
    byId('downloadDoc').addEventListener('click', function () { const r = reportHtml(false); downloadBlob(r.html, fileBase(r.payload) + '.doc', 'application/msword;charset=utf-8'); toast('Informe DOC generado.'); });
    byId('downloadTxt').addEventListener('click', function () { const p = currentPayload(); downloadBlob('\uFEFF' + p.textReport, fileBase(p) + '.txt', 'text/plain;charset=utf-8'); toast('Informe TXT generado.'); });
    byId('downloadJson').addEventListener('click', function () { const p = currentPayload(); downloadBlob(JSON.stringify(p, null, 2), fileBase(p) + '.json', 'application/json;charset=utf-8'); toast('JSON clínico generado.'); });
    byId('previewReport').addEventListener('click', function () { const r = reportHtml(false); openHtml(r.html); });

    byId('briefDownloadHtml').addEventListener('click', function () { const r = briefReportHtml(false); downloadBlob(r.html, fileBase(r.payload) + '_BREVE.html', 'text/html;charset=utf-8'); toast('Informe breve HTML generado.'); });
    byId('briefDownloadPdf').addEventListener('click', function () { const r = briefReportHtml(true); if (openHtml(r.html)) toast('Se abrió el informe breve para guardar como PDF.'); });
    byId('briefDownloadDoc').addEventListener('click', function () { const r = briefReportHtml(false); downloadBlob(r.html, fileBase(r.payload) + '_BREVE.doc', 'application/msword;charset=utf-8'); toast('Informe breve DOC generado.'); });
    byId('briefDownloadTxt').addEventListener('click', function () { const p = currentPayload(); downloadBlob('\uFEFF' + report.buildBriefTextReport(p), fileBase(p) + '_BREVE.txt', 'text/plain;charset=utf-8'); toast('Informe breve TXT generado.'); });
    byId('briefPreview').addEventListener('click', function () { const r = briefReportHtml(false); openHtml(r.html); });

    byId('resetAll').addEventListener('click', resetProtocol);

    byId('openEvaluator').addEventListener('click', openDrawer);
    byId('closeEvaluator').addEventListener('click', closeDrawer);
    byId('drawerBackdrop').addEventListener('click', closeDrawer);
    byId('saveEvaluatorBtn').addEventListener('click', applyEvaluator);
    byId('clearEvaluator').addEventListener('click', clearEvaluatorData);
    byId('clearSignature').addEventListener('click', function () { clearSignatureCanvas(); toast('Firma eliminada.'); });
    byId('signatureFile').addEventListener('change', function () { loadSignatureFile(this.files && this.files[0]); this.value = ''; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeDrawer(); });
  }

  function init() {
    if (!data || !scoring || !report) { alert('No se pudieron cargar los componentes de la aplicación.'); return; }
    const n = nowParts();
    byId('applicationDate').value = n.date;
    byId('applicationTime').value = n.time;
    renderAiProviders();
    renderQuestions('state'); renderQuestions('trait');
    setAiMode(false);
    initSignature();
    const saved = storedEvaluator();
    if (saved) { app.evaluator = saved; setEvaluatorFields(saved); byId('saveEvaluator').checked = true; }
    bind();
    setupPwaOnlyOnWeb();
    updateAge();
    setScreen('intro');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());

(function () {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const state = {
    gesturePoints: [],
    gestureSeed: '',
    sessionSeed: createSessionSeed(),
    lastAuditPacket: null
  };

  const elements = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheElements();
    renderModes();
    renderMatrices();
    setInitialDate();
    createParticles();
    setupLotteryAutocomplete();
    setupModeEvents();
    setupMatrixActions();
    setupGestureCanvas();
    setupForm();
    setupModals();
    setupCopyAndDownload();
    setupLiveSummary();
    registerServiceWorker();
    applyRecommendedMatrices('relacional');
    updateSummary();
  }

  function cacheElements() {
    Object.assign(elements, {
      form: $('#quantumForm'),
      modeGrid: $('#readingModeGrid'),
      matrixGrid: $('#matrixGrid'),
      suggestions: $('#lottoSuggestions'),
      lottoInput: $('#lottoName'),
      validationMessage: $('#validationMessage'),
      generateBtn: $('#generateBtn'),
      promptModal: $('#promptModal'),
      outputPrompt: $('#outputPrompt'),
      auditPreview: $('#auditPreview'),
      notification: $('#notification'),
      aiDrawer: $('#aiDrawer'),
      summary: $('#architectureSummary'),
      canvas: $('#gestureCanvas'),
      gestureLabel: $('#gestureSeedLabel'),
      aboutModal: $('#aboutModal')
    });
  }

  function renderModes() {
    elements.modeGrid.innerHTML = window.FQ_READING_MODES.map((mode, index) => `
      <div class="mode-option">
        <input type="radio" name="readingMode" id="mode-${mode.id}" value="${mode.id}" ${index === 2 ? 'checked' : ''}>
        <label class="mode-label" for="mode-${mode.id}">
          <span class="mode-icon">${mode.icon}</span>
          <b>${escapeHtml(mode.name)}</b>
          <small>${escapeHtml(mode.description)}</small>
        </label>
      </div>
    `).join('');
  }

  function renderMatrices() {
    elements.matrixGrid.innerHTML = window.FQ_MATRICES.map(matrix => `
      <div class="matrix-option">
        <input type="checkbox" name="matrix" id="matrix-${matrix.id}" value="${matrix.id}">
        <label class="matrix-label" for="matrix-${matrix.id}">
          <span class="matrix-icon">${matrix.icon}</span>
          <span>
            <b>${escapeHtml(matrix.name)}</b>
            <small>${escapeHtml(matrix.description)}</small>
          </span>
          <span class="status">${escapeHtml(matrix.status)}</span>
        </label>
      </div>
    `).join('');
  }

  function setInitialDate() {
    const today = new Date();
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $('#drawDate').value = local;
    $('#drawDate').max = local;
  }

  function createParticles() {
    const container = $('#particles');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 28; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'particle';
      const size = 1 + Math.random() * 3;
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.animationDuration = `${14 + Math.random() * 13}s`;
      dot.style.animationDelay = `${Math.random() * 8}s`;
      fragment.appendChild(dot);
    }
    container.appendChild(fragment);
  }

  function setupLotteryAutocomplete() {
    elements.lottoInput.addEventListener('input', () => {
      const query = elements.lottoInput.value.trim().toLowerCase();
      if (query.length < 2) {
        closeSuggestions();
        return;
      }
      const matches = Object.entries(window.FQ_LOTTERIES)
        .filter(([name]) => name.toLowerCase().includes(query))
        .slice(0, 8);

      if (!matches.length) {
        closeSuggestions();
        return;
      }

      elements.suggestions.innerHTML = matches.map(([name, data]) => `
        <div class="suggestion-item" tabindex="0" role="option" data-lottery="${escapeAttribute(name)}">
          <div class="suggestion-name">${escapeHtml(name)}</div>
          <div class="suggestion-details">${escapeHtml(data.country)} · ${escapeHtml(data.config)}</div>
        </div>
      `).join('');
      elements.suggestions.classList.add('active');
      elements.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => selectLottery(item.dataset.lottery));
        item.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectLottery(item.dataset.lottery);
          }
        });
      });
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('.autocomplete-wrapper')) closeSuggestions();
    });
  }

  function selectLottery(name) {
    const data = window.FQ_LOTTERIES[name];
    if (!data) return;
    elements.lottoInput.value = name;
    $('#country').value = data.country;
    $('#type').value = data.type;
    $('#config').value = data.config;
    $('#hasSeries').checked = data.series;
    closeSuggestions();
    updateSummary();
    showNotification(data.note || 'Datos de referencia cargados.');
  }

  function closeSuggestions() {
    elements.suggestions.classList.remove('active');
    elements.suggestions.innerHTML = '';
  }

  function setupModeEvents() {
    elements.modeGrid.addEventListener('change', event => {
      if (event.target.name !== 'readingMode') return;
      applyRecommendedMatrices(event.target.value);
      updateSummary();
    });
  }

  function applyRecommendedMatrices(modeId) {
    const mode = window.FQ_READING_MODES.find(item => item.id === modeId);
    if (!mode) return;
    const recommended = new Set(mode.recommendedMatrices);
    $$('input[name="matrix"]').forEach(input => {
      input.checked = recommended.has(input.value);
    });
    togglePersonalDetails(modeId);
    updateSummary();
  }

  function togglePersonalDetails(modeId) {
    const details = $('#personalDetails');
    if (['simbolico', 'relacional', 'oraculo'].includes(modeId)) {
      details.open = true;
    } else {
      details.open = false;
    }
  }

  function setupMatrixActions() {
    $('#selectRecommendedBtn').addEventListener('click', () => {
      applyRecommendedMatrices(getSelectedMode().id);
      showNotification('Matrices recomendadas aplicadas.');
    });
    $('#clearMatricesBtn').addEventListener('click', () => {
      $$('input[name="matrix"]').forEach(input => { input.checked = false; });
      updateSummary();
    });
    elements.matrixGrid.addEventListener('change', updateSummary);
  }

  function setupGestureCanvas() {
    const canvas = elements.canvas;
    const context = canvas.getContext('2d');
    let drawing = false;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      redrawGesture();
    }

    function pointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.round((event.clientX - rect.left) * 10) / 10,
        y: Math.round((event.clientY - rect.top) * 10) / 10,
        t: Date.now() % 1000000
      };
    }

    function begin(event) {
      drawing = true;
      canvas.setPointerCapture?.(event.pointerId);
      const point = pointFromEvent(event);
      state.gesturePoints.push(point);
      drawPoint(point, true);
    }

    function move(event) {
      if (!drawing) return;
      const point = pointFromEvent(event);
      const previous = state.gesturePoints[state.gesturePoints.length - 1];
      state.gesturePoints.push(point);
      drawSegment(previous, point);
    }

    function end(event) {
      if (!drawing) return;
      drawing = false;
      canvas.releasePointerCapture?.(event.pointerId);
      updateGestureSeed();
    }

    function drawPoint(point, newPath = false) {
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'rgba(255, 215, 0, .86)';
      context.fillStyle = 'rgba(255, 239, 125, .9)';
      if (newPath) {
        context.beginPath();
        context.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
        context.fill();
      }
    }

    function drawSegment(from, to) {
      if (!from || !to) return;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      drawPoint(to);
    }

    function redrawGesture() {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      if (!state.gesturePoints.length) return;
      drawPoint(state.gesturePoints[0], true);
      for (let i = 1; i < state.gesturePoints.length; i += 1) {
        drawSegment(state.gesturePoints[i - 1], state.gesturePoints[i]);
      }
    }

    function updateGestureSeed() {
      if (!state.gesturePoints.length) {
        state.gestureSeed = '';
        elements.gestureLabel.textContent = 'sin gesto';
        updateSummary();
        return;
      }
      const serialized = state.gesturePoints.map(p => `${p.x},${p.y},${p.t}`).join(';');
      const seed = window.FQ_RANDOM.fnv1a(serialized);
      state.gestureSeed = `GESTO-${window.FQ_RANDOM.shortSeed(seed)}-${state.gesturePoints.length}P`;
      elements.gestureLabel.textContent = state.gestureSeed;
      updateSummary();
    }

    canvas.addEventListener('pointerdown', begin);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    window.addEventListener('resize', debounce(resizeCanvas, 120));
    $('#clearGestureBtn').addEventListener('click', () => {
      state.gesturePoints = [];
      updateGestureSeed();
      resizeCanvas();
    });
    requestAnimationFrame(resizeCanvas);
  }

  function setupForm() {
    elements.form.addEventListener('submit', event => {
      event.preventDefault();
      hideValidation();
      const data = collectFormData();
      const errors = validate(data);
      if (errors.length) {
        showValidation(errors);
        return;
      }

      elements.generateBtn.classList.add('loading');
      window.setTimeout(() => {
        const auditPacket = window.FQ_AUDIT_ENGINE.buildAuditPacket(data);
        state.lastAuditPacket = auditPacket;
        data.auditPacket = auditPacket;
        const prompt = window.FQ_PROMPT_ENGINE.buildPrompt(data);
        elements.auditPreview.textContent = window.FQ_AUDIT_ENGINE.formatAuditPacket(auditPacket);
        elements.outputPrompt.textContent = prompt;
        openModal(elements.promptModal);
        elements.generateBtn.classList.remove('loading');
      }, 260);
    });
  }

  function collectFormData() {
    const mode = getSelectedMode();
    const matrices = $$('input[name="matrix"]:checked').map(input => input.value);
    const seedParts = [
      $('#lottoName').value,
      $('#drawDate').value,
      $('#drawTime').value,
      state.gestureSeed,
      state.sessionSeed
    ];
    const technicalSeed = `FQ-${window.FQ_RANDOM.shortSeed(window.FQ_RANDOM.deriveSeed(seedParts))}`;

    return {
      mode: mode.id,
      modeName: mode.name,
      matrices,
      country: $('#country').value,
      city: $('#city').value,
      lottoName: $('#lottoName').value,
      type: $('#type').value,
      drawDate: $('#drawDate').value,
      drawTime: $('#drawTime').value,
      timezone: $('#timezone').value,
      config: $('#config').value,
      hasSeries: $('#hasSeries').checked,
      officialSource: $('#officialSource').value,
      birthDate: $('#birthDate').value,
      userName: $('#userName').value,
      significantWord: $('#significantWord').value,
      recurringNumbers: $('#recurringNumbers').value,
      intention: $('#intention').value,
      symbol: $('#symbol').value,
      direction: $('#direction').value,
      significantDate: $('#significantDate').value,
      numerologySystem: $('#numerologySystem').value,
      gestureSeed: state.gestureSeed,
      sessionSeed: technicalSeed,
      depth: $('#depth').value,
      combinationCount: $('#combinationCount').value,
      ethicalAcknowledgement: $('#ethicalAcknowledgement').checked
    };
  }

  function validate(data) {
    const errors = [];
    if (!data.lottoName.trim()) errors.push('Escribe el juego o escenario de referencia.');
    if (!data.drawDate) errors.push('Selecciona una fecha de corte o simulación.');
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (data.drawDate && data.drawDate > localToday) errors.push('La simulación utiliza una fecha de corte actual o histórica, no una fecha futura.');
    if (!data.config.trim()) errors.push('Describe el formato numérico que se simulará.');
    if (!data.matrices.length) errors.push('Activa al menos una matriz de análisis.');
    if (!data.ethicalAcknowledgement) errors.push('Confirma que el uso será académico, experimental y no económico.');
    if (data.matrices.includes('gestural') && !data.gestureSeed) errors.push('La matriz gestual está activa: traza un gesto o desactiva esa matriz.');
    if (data.matrices.includes('historical') && !data.country.trim() && !data.officialSource.trim()) errors.push('Para la matriz histórica, indica al menos el país o una fuente oficial.');
    return errors;
  }

  function showValidation(errors) {
    elements.validationMessage.innerHTML = `<b>Revisa lo siguiente:</b><br>${errors.map(item => `• ${escapeHtml(item)}`).join('<br>')}`;
    elements.validationMessage.classList.add('active');
    elements.validationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideValidation() {
    elements.validationMessage.classList.remove('active');
    elements.validationMessage.textContent = '';
  }

  function setupModals() {
    $('#closeModalBtn').addEventListener('click', () => closeModal(elements.promptModal));
    $('#secondaryCloseBtn').addEventListener('click', () => closeModal(elements.promptModal));
    $('#aboutQuantumBtn').addEventListener('click', () => openModal(elements.aboutModal));
    $('#closeAboutBtn').addEventListener('click', () => closeModal(elements.aboutModal));
    $('#aboutAcceptBtn').addEventListener('click', () => closeModal(elements.aboutModal));

    [elements.promptModal, elements.aboutModal].forEach(modal => {
      modal.addEventListener('click', event => {
        if (event.target === modal) closeModal(modal);
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (elements.aboutModal.classList.contains('active')) closeModal(elements.aboutModal);
      else if (elements.promptModal.classList.contains('active')) closeModal(elements.promptModal);
    });
  }

  function openModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('button, [tabindex]')?.focus();
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modal === elements.promptModal) elements.aiDrawer.classList.remove('active');
  }

  function setupCopyAndDownload() {
    $('#copyPromptBtn').addEventListener('click', async () => {
      const text = elements.outputPrompt.textContent;
      try {
        await copyText(text);
        elements.aiDrawer.classList.add('active');
        showNotification('Prompt copiado. Ya puedes abrir una IA.');
      } catch (error) {
        elements.outputPrompt.focus();
        const range = document.createRange();
        range.selectNodeContents(elements.outputPrompt);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        showNotification('No fue posible copiar automáticamente. El texto quedó seleccionado.', true);
      }
    });

    $('#downloadPromptBtn').addEventListener('click', () => {
      const text = elements.outputPrompt.textContent;
      const filename = `Fortuna_Quantum_simulacion_${sanitizeFilename($('#lottoName').value || 'escenario')}.txt`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showNotification('Prompt guardado como archivo TXT.');
    });


    $('#copyAuditBtn').addEventListener('click', async () => {
      const text = elements.auditPreview.textContent;
      try {
        await copyText(text);
        showNotification('Paquete de auditoría copiado.');
      } catch (error) {
        showNotification('No fue posible copiar el paquete.', true);
      }
    });

    $('#downloadAuditBtn').addEventListener('click', () => {
      if (!state.lastAuditPacket) {
        showNotification('Primero genera una simulación.', true);
        return;
      }
      const filename = `FQ_LAB_auditoria_${sanitizeFilename($('#lottoName').value || 'escenario')}.json`;
      const blob = new Blob([JSON.stringify(state.lastAuditPacket, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showNotification('Paquete de auditoría guardado como JSON.');
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    if (!ok) throw new Error('Copy failed');
  }

  function setupLiveSummary() {
    elements.form.addEventListener('input', debounce(updateSummary, 90));
    elements.form.addEventListener('change', updateSummary);
  }

  function updateSummary() {
    const mode = getSelectedMode();
    const matrices = $$('input[name="matrix"]:checked').map(input => input.value);
    const names = matrices.map(id => window.FQ_MATRICES.find(item => item.id === id)?.name || id);
    const localPreview = window.FQ_NUMEROLOGY.buildLocalPreview({
      birthDate: $('#birthDate')?.value,
      drawDate: $('#drawDate')?.value,
      significantDate: $('#significantDate')?.value,
      userName: $('#userName')?.value,
      significantWord: $('#significantWord')?.value,
      numerologySystem: $('#numerologySystem')?.value
    });

    elements.summary.innerHTML = `
      <div class="summary-row"><b>Modo</b><span>${escapeHtml(mode.name)} · ${escapeHtml(mode.description)}</span></div>
      <div class="summary-row"><b>Matrices activas</b><span class="summary-tags">${names.length ? names.map(name => `<span class="summary-tag">${escapeHtml(name)}</span>`).join('') : '<span class="muted">Ninguna seleccionada</span>'}</span></div>
      <div class="summary-row"><b>Escenario</b><span>${escapeHtml($('#lottoName')?.value || 'Sin nombre')} · ${escapeHtml($('#drawDate')?.value || 'sin fecha')} · ${escapeHtml($('#config')?.value || 'formato pendiente')}</span></div>
      <div class="summary-row"><b>Semillas</b><span>${escapeHtml(state.gestureSeed || 'Sin gesto')} · sesión ${escapeHtml(state.sessionSeed)}</span></div>
      <div class="summary-row"><b>Prelectura local</b><span>${localPreview.length ? localPreview.map(escapeHtml).join(' · ') : 'Sin cálculos numerológicos locales todavía.'}</span></div>
    `;
  }

  function getSelectedMode() {
    const id = $('input[name="readingMode"]:checked')?.value || 'relacional';
    return window.FQ_READING_MODES.find(item => item.id === id) || window.FQ_READING_MODES[2];
  }

  function createSessionSeed() {
    const random = new Uint32Array(1);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
    else random[0] = Math.floor(Math.random() * 0xFFFFFFFF);
    return `SES-${window.FQ_RANDOM ? window.FQ_RANDOM.shortSeed(random[0]) : random[0].toString(16).toUpperCase()}`;
  }

  function showNotification(message, warning = false) {
    elements.notification.textContent = message;
    elements.notification.style.background = warning ? 'rgba(210, 132, 45, .97)' : 'rgba(48, 173, 110, .96)';
    elements.notification.classList.add('show');
    window.setTimeout(() => elements.notification.classList.remove('show'), 3000);
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // La app sigue funcionando sin PWA si el servidor no admite service workers.
      });
    }
  }

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function sanitizeFilename(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 50) || 'cartografia';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    })[char]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }
})();

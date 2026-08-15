(function () {
  'use strict';

  const PYTHAGOREAN = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9
  };

  const CHALDEAN = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };

  function normalizeText(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }

  function digits(value) {
    return String(value || '').replace(/\D/g, '').split('').map(Number);
  }

  function reduceNumber(value, preserveMasters = true) {
    let number = Math.abs(Number(value) || 0);
    while (number > 9 && !(preserveMasters && [11, 22, 33].includes(number))) {
      number = String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
    }
    return number;
  }

  function dateValue(dateString) {
    if (!dateString) return null;
    const raw = digits(dateString).reduce((sum, digit) => sum + digit, 0);
    return { compound: raw, reduced: reduceNumber(raw) };
  }

  function textValue(text, system = 'Pitagórico') {
    const normalized = normalizeText(text);
    if (!normalized) return null;
    const table = system === 'Caldeo' ? CHALDEAN : PYTHAGOREAN;
    const compound = [...normalized].reduce((sum, char) => sum + (table[char] || 0), 0);
    return { normalized, compound, reduced: reduceNumber(compound) };
  }

  function buildLocalPreview(data) {
    const preview = [];
    const birth = dateValue(data.birthDate);
    const draw = dateValue(data.drawDate);
    const significant = dateValue(data.significantDate);
    const name = data.numerologySystem === 'Solo fechas' ? null : textValue(data.userName, data.numerologySystem);
    const word = data.numerologySystem === 'Solo fechas' ? null : textValue(data.significantWord, data.numerologySystem);

    if (birth) preview.push(`Nacimiento: ${birth.compound} → ${birth.reduced}`);
    if (draw) preview.push(`Fecha de referencia: ${draw.compound} → ${draw.reduced}`);
    if (significant) preview.push(`Fecha significativa: ${significant.compound} → ${significant.reduced}`);
    if (name) preview.push(`Nombre: ${name.compound} → ${name.reduced}`);
    if (word) preview.push(`Palabra: ${word.compound} → ${word.reduced}`);

    return preview;
  }

  window.FQ_NUMEROLOGY = { normalizeText, reduceNumber, dateValue, textValue, buildLocalPreview };
})();

(function () {
  'use strict';
  const STAI = window.STAI = window.STAI || {};

  function parseDateParts(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return null;
    return { y: parts[0], m: parts[1], d: parts[2] };
  }

  function ageFromBirthDate(value, referenceValue) {
    const birth = parseDateParts(value);
    if (!birth) return '';
    let ref;
    if (typeof referenceValue === 'string') ref = parseDateParts(referenceValue);
    if (!ref) {
      const now = referenceValue instanceof Date ? referenceValue : new Date();
      ref = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
    }
    let age = ref.y - birth.y;
    if (ref.m < birth.m || (ref.m === birth.m && ref.d < birth.d)) age -= 1;
    if (!Number.isFinite(age) || age < 0 || age > 125) return '';
    return age;
  }

  function isDirect(itemId) {
    const data = STAI.data || {};
    const list = itemId <= 20 ? data.directState : data.directTrait;
    return Array.isArray(list) && list.indexOf(itemId) !== -1;
  }

  function correctedValue(itemId, rawValue) {
    const raw = Number(rawValue);
    if (!Number.isFinite(raw) || raw < 0 || raw > 3) return null;
    return isDirect(itemId) ? raw : 3 - raw;
  }

  function scoreScale(items, responses) {
    const corrected = [];
    const missing = [];
    (items || []).forEach(function (item) {
      const raw = responses[item.id];
      if (raw === undefined || raw === null || raw === '') {
        missing.push(item.id);
        return;
      }
      const value = correctedValue(item.id, raw);
      if (value === null) {
        missing.push(item.id);
        return;
      }
      corrected.push({ item: item.id, raw: Number(raw), corrected: value });
    });
    return {
      complete: missing.length === 0,
      missing: missing,
      answered: (items || []).length - missing.length,
      score: missing.length === 0 ? corrected.reduce(function (sum, row) { return sum + row.corrected; }, 0) : null,
      corrected: corrected
    };
  }

  function descriptivePosition(score) {
    if (score === null || score === undefined) return 'Pendiente';
    if (score <= 19) return 'Tercio inferior del rango teórico';
    if (score <= 39) return 'Tercio medio del rango teórico';
    return 'Tercio superior del rango teórico';
  }

  function decatypeBand(value) {
    if (value === '' || value === null || value === undefined) return null;
    const d = Number(value);
    if (!Number.isFinite(d) || d < 1 || d > 10) return null;
    if (d <= 2) return 'Muy bajo';
    if (d <= 4) return 'Bajo';
    if (d <= 6) return 'Promedio';
    if (d <= 8) return 'Alto';
    return 'Muy alto';
  }

  function integratedProfile(stateScore, traitScore, stateDecatype, traitDecatype) {
    const sd = decatypeBand(stateDecatype);
    const td = decatypeBand(traitDecatype);
    if (sd && td) {
      const se = Number(stateDecatype) >= 7;
      const te = Number(traitDecatype) >= 7;
      if (se && te) return 'Los dos indicadores normativos se ubican en zona elevada; conviene explorar conjuntamente la activación actual y la predisposición ansiosa.';
      if (se && !te) return 'En los decatipos ingresados predomina la Ansiedad-Estado; la activación actual parece más intensa que la predisposición relativamente estable.';
      if (!se && te) return 'En los decatipos ingresados predomina la Ansiedad-Rasgo; la predisposición ansiosa parece mayor que la activación del momento.';
      return 'Los decatipos ingresados no ubican ninguna de las escalas en zona alta. La lectura debe integrarse con entrevista y otras fuentes.';
    }
    if (stateScore === null || traitScore === null) return 'Complete las 40 respuestas para generar el perfil integrado.';
    const delta = stateScore - traitScore;
    if (Math.abs(delta) <= 5) return 'Las puntuaciones directas de Estado y Rasgo se encuentran próximas. Esta comparación describe el perfil obtenido, pero no constituye una clasificación normativa.';
    if (delta > 5) return 'La puntuación directa de Ansiedad-Estado supera a la de Ansiedad-Rasgo, lo que invita a explorar factores situacionales asociados a la activación actual. Esta lectura no es diagnóstica.';
    return 'La puntuación directa de Ansiedad-Rasgo supera a la de Ansiedad-Estado, lo que invita a explorar tendencias relativamente estables de preocupación o activación. Esta lectura no es diagnóstica.';
  }

  STAI.scoring = {
    parseDateParts: parseDateParts,
    ageFromBirthDate: ageFromBirthDate,
    correctedValue: correctedValue,
    scoreScale: scoreScale,
    descriptivePosition: descriptivePosition,
    decatypeBand: decatypeBand,
    integratedProfile: integratedProfile
  };
}());

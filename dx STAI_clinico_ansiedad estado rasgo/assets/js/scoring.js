const { DIRECT_STATE, DIRECT_TRAIT } = window.STAI_DATA;

function correctedValue(itemId, rawValue) {
  const raw = Number(rawValue);
  if (!Number.isFinite(raw) || raw < 0 || raw > 3) return null;
  const direct = itemId <= 20 ? DIRECT_STATE.has(itemId) : DIRECT_TRAIT.has(itemId);
  return direct ? raw : 3 - raw;
}

function scoreScale(items, responses) {
  const corrected = [];
  const missing = [];
  for (const item of items) {
    const raw = responses[item.id];
    if (raw === undefined || raw === null || raw === '') {
      missing.push(item.id);
      continue;
    }
    const value = correctedValue(item.id, raw);
    if (value === null) {
      missing.push(item.id);
      continue;
    }
    corrected.push({ item: item.id, raw: Number(raw), corrected: value });
  }
  return {
    complete: missing.length === 0,
    missing,
    answered: items.length - missing.length,
    score: missing.length === 0 ? corrected.reduce((sum, row) => sum + row.corrected, 0) : null,
    corrected
  };
}

function descriptiveBand(score) {
  if (score === null || score === undefined) return 'Pendiente';
  if (score <= 19) return 'Bajo (descriptivo)';
  if (score <= 39) return 'Medio (descriptivo)';
  return 'Alto (descriptivo)';
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

function integratedProfile(stateScore, traitScore, stateDecatype='', traitDecatype='') {
  const sd = decatypeBand(stateDecatype);
  const td = decatypeBand(traitDecatype);
  if (sd && td) {
    const se = Number(stateDecatype) >= 7;
    const te = Number(traitDecatype) >= 7;
    if (se && te) return 'Los dos indicadores normativos se ubican en zona elevada; conviene explorar tanto activación actual como predisposición ansiosa.';
    if (se && !te) return 'Predomina la Ansiedad-Estado en la lectura normativa: la activación actual parece más intensa que la predisposición estable.';
    if (!se && te) return 'Predomina la Ansiedad-Rasgo en la lectura normativa: la predisposición ansiosa parece mayor que la activación del momento.';
    return 'Ninguna de las dos escalas se ubica en zona normativa alta según los decatipos ingresados.';
  }
  if (stateScore === null || traitScore === null) return 'Complete las 40 respuestas para generar el perfil integrado.';
  if (stateScore >= 40 && traitScore >= 40) return 'Ambas escalas se ubican en el tercio alto del rango teórico. Esta lectura es descriptiva, no normativa ni diagnóstica.';
  if (stateScore >= 40 && traitScore < 40) return 'Predomina la Ansiedad-Estado; la activación actual se ubica en el tercio alto y supera el nivel del rasgo.';
  if (stateScore < 40 && traitScore >= 40) return 'Predomina la Ansiedad-Rasgo; la predisposición ansiosa se ubica en el tercio alto y supera la activación actual.';
  return 'Ninguna escala alcanza el tercio alto del rango teórico. Esta lectura es descriptiva y debe integrarse con otras fuentes clínicas.';
}

function ageFromBirthDate(value, referenceDate = new Date()) {
  if (!value) return '';
  const birth = new Date(`${value}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return '';
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const m = referenceDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

window.STAI_SCORING = { correctedValue, scoreScale, descriptiveBand, decatypeBand, integratedProfile, ageFromBirthDate };

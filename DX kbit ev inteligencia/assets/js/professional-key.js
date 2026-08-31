export async function loadProfessionalKey() {
  const res = await fetch('./data/professional-key.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`No se pudo cargar la clave profesional (${res.status}).`);
  return await res.json();
}
export async function loadApplicationRules() {
  const res = await fetch('./data/application-rules.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`No se pudo cargar la configuración de reglas (${res.status}).`);
  return await res.json();
}
export function getKeyItem(keyData, subtest, itemNumber) {
  return keyData?.subtests?.[subtest]?.items?.[String(itemNumber)] || null;
}
export function normalizeAnswer(value='') {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\p{L}\p{N}]+/gu,' ')
    .replace(/\s+/g,' ')
    .trim();
}
export function nominalMatch(value, expected='') {
  const given = normalizeAnswer(value);
  const exp = normalizeAnswer(expected);
  if (!given || !exp) return null;
  if (exp === 'primo a') return ['primo','prima','primo a'].includes(given);
  return given === exp;
}

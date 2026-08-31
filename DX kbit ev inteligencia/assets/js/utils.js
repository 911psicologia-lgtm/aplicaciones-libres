export function uid(prefix = 'case') {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return { y, m, d };
}

export function daysInMonth(year, month1to12) {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function calculateChronologicalAge(birthISO, applicationISO) {
  const b = parseISODate(birthISO);
  const a = parseISODate(applicationISO);
  if (!b || !a) return null;
  const appStamp = Date.UTC(a.y, a.m - 1, a.d);
  const birthStamp = Date.UTC(b.y, b.m - 1, b.d);
  if (appStamp < birthStamp) return null;

  const shiftMonths = (base, monthsToAdd) => {
    const total = base.y * 12 + (base.m - 1) + monthsToAdd;
    const y = Math.floor(total / 12);
    const m0 = ((total % 12) + 12) % 12;
    const m = m0 + 1;
    const d = Math.min(base.d, daysInMonth(y, m));
    return { y, m, d };
  };
  const stamp = (x) => Date.UTC(x.y, x.m - 1, x.d);

  let years = a.y - b.y;
  let yearBase = shiftMonths(b, years * 12);
  if (stamp(yearBase) > appStamp) {
    years -= 1;
    yearBase = shiftMonths(b, years * 12);
  }

  let months = 0;
  while (months < 11) {
    const candidate = shiftMonths(yearBase, months + 1);
    if (stamp(candidate) <= appStamp) months += 1;
    else break;
  }
  const monthBase = shiftMonths(yearBase, months);
  const days = Math.floor((appStamp - stamp(monthBase)) / 86400000);
  return { years, months, days, totalMonths: years * 12 + months };
}

export function ageLabel(age) {
  if (!age) return 'Edad no calculada';
  return `${age.years} años, ${age.months} meses, ${age.days} días`;
}

export function monthRangeLabel(min, max) {
  const fmt = (n) => `${Math.floor(n / 12)}a ${n % 12}m`;
  return `${fmt(min)} – ${fmt(max)}`;
}

export function esc(value = '') {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export function textFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.innerText || div.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

export function downloadBlob(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function debounce(fn, ms = 180) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ============================================
   Previous — aplicación anterior del MMPI-2
   - Interpreta el texto pegado (T o PD), con nomenclatura
     internacional o del Manual Moderno (español), autodetectada
   - Reconoce rótulos de Mf por sexo (Mfv / Mfm / Mf-m / Mf-f)
   - Convierte por «valor implicado»: T (tabla de origen) → PD → T (tabla actual)
     cuando cambia el baremo o el sexo de la clave de Mf
   - Devuelve filas con estado: exacta | convertida (≈) | no reconocida
   ============================================ */

const Previous = {

  /* Códigos canónicos que la app conoce */
  _known() {
    if (this.__known) return this.__known;
    const I = window.Interpret;
    this.__known = I ? Object.values(I.GROUP_ORDER).flat() : [];
    return this.__known;
  },

  /* Nomenclatura del Manual Moderno (español) → código internacional.
     Ojo: en español «Fp» = F posterior (Fb), «Fpsi» = Fp y «Es» = Esquizofrenia (Sc);
     Fuerza del yo es «Fyo». */
  ES_MAP: {
    invar: 'VRIN', inver: 'TRIN', fp: 'Fb', fpsi: 'Fp',
    hi: 'Hs', de: 'D', dp: 'Pd', es: 'Sc', is: 'Si',
    ans: 'ANX', mie: 'FRS', sau: 'HEA', del: 'BIZ', enj: 'ANG', cin: 'CYN', pas: 'ASP',
    pta: 'TPA', bae: 'LSE', iso: 'SOD', dtr: 'WRK', rtr: 'TRT',
    fyo: 'Es', rs: 'Re', dpr: 'Mt', epk: 'PK', dm: 'MDS', hr: 'O-H', 'a-mac': 'MAC-R', amac: 'MAC-R',
    ra: 'AAS', ppa: 'APS',
  },
  /* Alias comunes en ambas nomenclaturas */
  COMMON_MAP: { 'mac': 'MAC-R', 'macr': 'MAC-R', 'mac-r': 'MAC-R', 'oh': 'O-H', 'o-h': 'O-H' },
  /* Palabras que delatan la nomenclatura en español */
  ES_ONLY: ['hi', 'de', 'dp', 'is', 'invar', 'inver', 'fpsi', 'ans', 'mie', 'sau', 'del', 'enj', 'cin', 'pas', 'pta', 'bae', 'iso', 'dtr', 'rtr', 'fyo', 'rs', 'dpr', 'epk', 'dm', 'hr', 'a-mac', 'ra', 'ppa'],

  /* Rótulos de Mf → sexo de la clave/baremo. Mfm (sin guion) = TEA mujeres; Mf-m (con guion) = varones (manual EE. UU.) */
  MF_LABELS: {
    mfv: 'H', 'mf-v': 'H', mfh: 'H', 'mf-h': 'H', 'mf-m': 'H', mfvar: 'H', mfmasc: 'H',
    mfm: 'M', 'mf-f': 'M', mff: 'M', 'mf-mu': 'M', mfmuj: 'M', mffem: 'M',
    mf: null,
  },

  K_FRACTION: { Hs: 0.5, Pd: 0.4, Pt: 1, Sc: 1, Ma: 0.2 },

  COUNTRY_LABEL: { US: 'EE. UU.', MX: 'México', ES: 'España (TEA)', unknown: 'no consta' },

  defaultMeta() {
    return { date: '', source: '', baremo: 'unknown', nomenclature: 'auto' };
  },

  meta(patient) {
    return Object.assign(this.defaultMeta(), (patient && patient.prevMeta) || {});
  },

  /* ---------- Tokenizado ---------- */
  tokenize(text) {
    const out = [];
    if (!text) return out;
    // Admite «Hs=78», «Hs: 78», «Hs 78», «Hs_PD=13», «Hs PD 13», «Hs (T) 78», saltos de línea o tabulaciones
    const re = /([A-Za-zÁÉÍÓÚáéíóúñÑ][A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\-]{0,7})(?:[\s_]*(?:\(|\[)?\s*(PDK|PD\+K|PD|T)\s*(?:\)|\])?)?\s*(?:[:=]|\t|\s)\s*(-?\d{1,3})(?![\d.])/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      out.push({ raw: m[0].trim(), label: m[1], kind: (m[2] || 'T').toUpperCase().replace('PD+K', 'PDK'), value: parseInt(m[3], 10), index: m.index });
    }
    return out;
  },

  detectNomenclature(tokens) {
    const hits = tokens.filter(t => this.ES_ONLY.includes(t.label.toLowerCase()));
    return hits.length > 0 ? 'es' : 'intl';
  },

  canonical(label, nomen) {
    const low = label.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(this.MF_LABELS, low)) return { code: 'Mf', mfSex: this.MF_LABELS[low] };
    if (this.COMMON_MAP[low]) return { code: this.COMMON_MAP[low] };
    if (nomen === 'es' && this.ES_MAP[low]) return { code: this.ES_MAP[low] };
    const k = this._known().find(c => c.toLowerCase() === low);
    if (k) return { code: k };
    // Español aunque la nomenclatura detectada sea internacional (sin ambigüedad)
    if (this.ES_MAP[low] && !['fp', 'es'].includes(low)) return { code: this.ES_MAP[low] };
    return null;
  },

  /* ---------- Tablas e interpolación ---------- */
  _table(country, code, sexKey) {
    const B = country === 'US' ? window.__BAREMOS_US__ : (country === 'MX' ? window.__BAREMOS_MX__ : window.__BAREMOS_ES__);
    const tsex = (window.MMPI2 && MMPI2._translateSex) ? MMPI2._translateSex(sexKey, country) : sexKey;
    const raw = B && B[code] && B[code][tsex];
    if (!raw || typeof raw !== 'object') return null;
    let pts = Object.entries(raw).map(([k, v]) => [Number(k), v]).filter(([k, v]) => isFinite(k) && typeof v === 'number').sort((a, b) => a[0] - b[0]);
    // Excluir puntos marcados como dudosos (tramos dañados)
    const sus = window.MMPI2 && MMPI2.suspectPDs ? MMPI2.suspectPDs(country, code, tsex) : new Set();
    pts = pts.filter(([k]) => !sus.has(k));
    if (pts.length < 3) return null;
    const dir = pts[pts.length - 1][1] >= pts[0][1] ? 1 : -1;
    // Quitar mesetas (T repetida en extremos)
    const noPlateau = pts.filter((p, i) => {
      const nb = dir > 0 ? pts[i + 1] : pts[i - 1];
      return !(nb && nb[1] === p[1]);
    });
    const clean = [noPlateau[0]];
    for (const p of noPlateau.slice(1)) if ((p[1] - clean[clean.length - 1][1]) * dir > 0) clean.push(p);
    return clean.length >= 3 ? clean : null;
  },
  _interp(pts, x, from, to) {
    const arr = pts.slice().sort((p, q) => p[from] - q[from]);
    const seg = (p, q) => p[to] + (x - p[from]) * (q[to] - p[to]) / ((q[from] - p[from]) || 1);
    if (x <= arr[0][from]) return seg(arr[0], arr[1]);
    for (let i = 0; i < arr.length - 1; i++) if (x >= arr[i][from] && x <= arr[i + 1][from]) return seg(arr[i], arr[i + 1]);
    return seg(arr[arr.length - 2], arr[arr.length - 1]);
  },
  reliable(country) { return country === 'US' || country === 'MX'; },

  /* T de origen → PD estimada → T destino (con margen ±mPD) */
  convertT(code, t, from, to, mPD = 1) {
    const A = this._table(from.country, code, from.sex), Bt = this._table(to.country, code, to.sex);
    if (!A || !Bt) return null;
    const pd = this._interp(A, t, 1, 0);
    const conv = (x) => Math.round(Math.max(20, Math.min(120, this._interp(Bt, x, 0, 1))));
    const a = conv(pd - mPD), b = conv(pd + mPD);
    return { t: conv(pd), lo: Math.min(a, b), hi: Math.max(a, b), pd: Math.round(pd * 10) / 10 };
  },

  /* PD → T en el baremo actual (consulta exacta; si no existe, interpolación) */
  ptoT(code, pd, to) {
    if (window.MMPI2) {
      const lk = MMPI2.lookupT(code, pd, to.sex, to.country);
      if (lk && typeof lk.t === 'number') return { t: lk.t, exact: !lk.verify };
    }
    const Bt = this._table(to.country, code, to.sex);
    if (!Bt) return null;
    return { t: Math.round(Math.max(20, Math.min(120, this._interp(Bt, pd, 0, 1)))), exact: false };
  },

  /* ---------- Análisis completo ---------- */
  analyze(text, patient, results) {
    const meta = this.meta(patient);
    const sex = patient && patient.sex;
    const curCountry = (patient && ['US', 'MX', 'ES'].includes(patient.country)) ? patient.country : 'US';
    const tokens = this.tokenize(text);
    const nomen = meta.nomenclature === 'auto' ? this.detectNomenclature(tokens) : meta.nomenclature;
    const srcCountry = meta.baremo === 'unknown' ? null : meta.baremo;
    // Baremo declarado pero sin tablas fiables (España): se compara tal cual, con advertencia
    const srcUnreliable = srcCountry && srcCountry !== curCountry && !this.reliable(srcCountry);
    const entries = {}; const unknown = []; const notes = [];
    // Puntuación directa de K (para escalas con corrección K)
    let kPD = null;
    for (const tk of tokens) {
      const c = this.canonical(tk.label, nomen);
      if (c && c.code === 'K' && tk.kind === 'PD') kPD = tk.value;
    }
    for (const tk of tokens) {
      const c = this.canonical(tk.label, nomen);
      if (!c) { unknown.push(tk.raw); continue; }
      if (tk.kind === 'T' && !(tk.value >= 20 && tk.value <= 120)) { unknown.push(tk.raw + ' (T fuera de rango 20–120)'); continue; }
      const prevE = entries[c.code];
      if (prevE && prevE.kind !== 'T' && tk.kind === 'T') continue; // la PD (exacta) prevalece sobre la T
      if (c.code === 'K' && tk.kind === 'PD' && prevE && prevE.kind === 'T') { /* K_PD solo para corregir; conservar T si existe */ }
      entries[c.code] = Object.assign({}, prevE || {}, { code: c.code, label: tk.label, kind: tk.kind, value: tk.value, mfSex: c.mfSex });
    }
    const rows = [];
    const to = { country: curCountry, sex };
    for (const code of Object.keys(entries)) {
      const e = entries[code];
      const cur = window.Interpret ? Interpret.T(results, code) : null;
      let prev = null, status = 'exacta', range = null, note = null, approx = false;
      const from = { country: (srcCountry && !srcUnreliable) ? srcCountry : curCountry, sex: (code === 'Mf' && e.mfSex) ? e.mfSex : sex };
      if (e.kind === 'T') {
        const crossSex = code === 'Mf' && e.mfSex && sex && e.mfSex !== sex;
        const crossBaremo = srcCountry && srcCountry !== curCountry && !srcUnreliable;
        if (crossSex || crossBaremo) {
          const okSrc = this.reliable(from.country) || from.country === curCountry;
          const eq = okSrc ? this.convertT(code, e.value, from, to, crossSex ? 2 : 1) : null;
          if (eq) {
            prev = eq.t; range = [eq.lo, eq.hi]; approx = true; status = 'convertida';
            const why = [];
            if (crossSex) why.push(`la clave y el baremo de ${e.mfSex === 'H' ? 'varones' : 'mujeres'} (rótulo «${e.label}»)`);
            if (crossBaremo) why.push(`el baremo de ${this.COUNTRY_LABEL[srcCountry]}`);
            note = `${code}: la T anterior (${e.value}) se obtuvo con ${why.join(' y ')}; se convirtió por su puntuación directa implicada (≈ ${String(eq.pd).replace('.', ',')}) a T ≈ ${eq.t} (rango probable ${eq.lo}–${eq.hi}) en el baremo actual.`;
          } else {
            prev = null; status = 'no convertible';
            note = `${code}: la T anterior (${e.value}, «${e.label}») corresponde a ${crossSex ? 'la clave del otro sexo' : 'otro baremo'} y no hay tablas fiables para convertirla${from.country === 'ES' ? ' (las tablas españolas de la app no están verificadas)' : ''}; se excluye de la comparación.`;
          }
        } else {
          prev = e.value;
        }
      } else { // PD o PDK
        let pd = e.value;
        const kf = this.K_FRACTION[code];
        if (kf && e.kind === 'PD') {
          if (kPD != null) { pd = e.value + Math.round(kPD * kf); note = `${code}: a la puntuación directa (${e.value}) se le sumó la corrección K (${Math.round(kPD * kf)}).`; }
          else { status = 'no convertible'; note = `${code}: se aportó la puntuación directa sin K; indique también «K_PD=…» o la puntuación ya corregida («${code}_PDK=…»).`; }
        }
        if (status !== 'no convertible') {
          const r = this.ptoT(code, pd, to);
          if (r) {
            prev = r.t;
            const crossSexPD = code === 'Mf' && e.mfSex && sex && e.mfSex !== sex;
            if (crossSexPD) { approx = true; status = 'convertida'; range = [r.t - 4, r.t + 4]; note = `Mf: la puntuación directa anterior se calculó con la clave de ${e.mfSex === 'H' ? 'varones' : 'mujeres'}, que difiere en cuatro ítems de la actual; su T en el baremo actual (${r.t}) es aproximada.`; }
            else status = 'exacta (desde PD)';
          } else { status = 'no convertible'; note = `${code}: no se encontró la puntuación directa ${pd} en la tabla del baremo actual.`; }
        }
      }
      const d = (cur != null && prev != null) ? cur - prev : null;
      let change = '—';
      if (d != null) change = d >= 10 ? 'Aumento relevante' : (d <= -10 ? 'Descenso relevante' : (Math.abs(d) >= 5 ? (d > 0 ? 'Aumento leve' : 'Descenso leve') : 'Estable'));
      if (approx && d != null) change += ' (aprox.)';
      rows.push({ code, label: e.label, kind: e.kind, raw: e.value, prev, cur, delta: d, change, status, approx, range, note,
        prevLabel: e.label, prevRaw: e.value });
    }
    // Orden canónico
    const order = this._known();
    rows.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
    if (!srcCountry && rows.length) notes.push('El informe anterior no indica el baremo utilizado: las puntuaciones se comparan tal como fueron reportadas, asumiendo el mismo baremo que la aplicación actual.');
    if (srcUnreliable && rows.length) notes.push(`El informe anterior se corrigió con el baremo de ${this.COUNTRY_LABEL[srcCountry]}, cuyas tablas no están verificadas en la aplicación: las puntuaciones se comparan tal como fueron reportadas y la comparación es solo orientativa.`);
    if (nomen === 'es') notes.push('Los rótulos se interpretaron con la nomenclatura del Manual Moderno (Hi = Hs, Es = Sc, Fp = Fb, Fpsi = Fp, Is = Si, etc.).');
    return { rows, unknown, notes, nomen, meta, srcCountry, curCountry };
  },

  /* Párrafo de limitaciones a partir de los metadatos reales */
  limitationsParagraph(an) {
    const m = an.meta; const parts = [];
    const desc = [];
    if (m.date) desc.push(`aplicada el ${this._fmtDate(m.date)}`);
    if (m.source) desc.push(`por ${m.source}`);
    parts.push(`La aplicación anterior${desc.length ? ' (' + desc.join(', ') + ')' : ''} se aportó como puntuaciones ya convertidas.`);
    if (!m.date) parts.push('No consta su fecha, por lo que no es posible situar en el tiempo los cambios observados.');
    if (an.srcCountry && an.srcCountry !== an.curCountry && !this.reliable(an.srcCountry)) parts.push(`Se corrigió con el baremo de ${this.COUNTRY_LABEL[an.srcCountry]}, para el que la aplicación no dispone de tablas verificadas; las cifras se comparan tal como fueron reportadas, por lo que la comparación es orientativa.`);
    else if (!an.srcCountry) parts.push('Tampoco consta el baremo con el que se corrigió; la comparación asume el mismo baremo que la aplicación actual y debe leerse como orientativa, en especial en diferencias menores de diez puntos.');
    else if (an.srcCountry !== an.curCountry) parts.push(`Se corrigió con el baremo de ${this.COUNTRY_LABEL[an.srcCountry]}; las puntuaciones se convirtieron al baremo actual por su puntuación directa implicada y se señalan como aproximadas.`);
    const conv = an.rows.filter(r => r.approx).map(r => r.code);
    if (conv.length) parts.push(`${conv.length === 1 ? 'La escala' : 'Las escalas'} ${conv.join(', ')} ${conv.length === 1 ? 'requirió' : 'requirieron'} conversión aproximada (marcadas con ≈).`);
    const exc = an.rows.filter(r => r.prev == null).map(r => r.code);
    if (exc.length) parts.push(`No pudieron compararse: ${exc.join(', ')}.`);
    if (an.unknown.length) parts.push(`Se omitieron entradas no reconocidas del informe anterior (${an.unknown.slice(0, 6).join('; ')}${an.unknown.length > 6 ? '…' : ''}).`);
    return parts.join(' ');
  },

  _fmtDate(iso) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00') : new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  },
};

window.Previous = Previous;

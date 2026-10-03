/* ============================================
   MMPI-2 · Motor de cálculo seguro (auditoría 2026-10)

   PRINCIPIOS:
   - Fail-closed: ausencia/integridad insuficiente nunca equivale a PD=0.
   - El país/baremo es argumento explícito del cálculo.
   - No se aproxima silenciosamente una PD ausente en la tabla normativa.
   - Las claves heredadas del proyecto se consideran NO VALIDADAS hasta
     ser cotejadas con material de corrección autorizado.
   - Permite superponer puntuaciones T obtenidas mediante corrección oficial.
   ============================================ */

const MMPI2 = {
  K_FACTORS: { Hs: 0.5, Pd: 0.4, Pt: 1.0, Sc: 1.0, Ma: 0.2 },
  PDK_SCALES: new Set(['Hs', 'Pd', 'Pt', 'Sc', 'Ma']),

  SCALES: [
    { group: 'Validez', code: 'L', name: 'L (Mentira)', k: 0, pdk: false },
    { group: 'Validez', code: 'F', name: 'F (Infrecuencia)', k: 0, pdk: false },
    { group: 'Validez', code: 'K', name: 'K (Corrección)', k: 0, pdk: false },
    { group: 'Clínicas', code: 'Hs', name: 'Hs (Hipocondría)', k: 0.5, pdk: true },
    { group: 'Clínicas', code: 'D', name: 'D (Depresión)', k: 0, pdk: false },
    { group: 'Clínicas', code: 'Hy', name: 'Hy (Histeria de conversión)', k: 0, pdk: false },
    { group: 'Clínicas', code: 'Pd', name: 'Pd (Desviación psicopática)', k: 0.4, pdk: true },
    { group: 'Clínicas', code: 'Mf', name: 'Mf (Masculinidad–feminidad)', k: 0, pdk: false },
    { group: 'Clínicas', code: 'Pa', name: 'Pa (Paranoia)', k: 0, pdk: false },
    { group: 'Clínicas', code: 'Pt', name: 'Pt (Psicastenia)', k: 1.0, pdk: true },
    { group: 'Clínicas', code: 'Sc', name: 'Sc (Esquizofrenia)', k: 1.0, pdk: true },
    { group: 'Clínicas', code: 'Ma', name: 'Ma (Hipomanía)', k: 0.2, pdk: true },
    { group: 'Clínicas', code: 'Si', name: 'Si (Introversión social)', k: 0, pdk: false },
    { group: 'Contenido', code: 'ANX', name: 'ANX (Ansiedad)', k: 0, pdk: false },
    { group: 'Contenido', code: 'FRS', name: 'FRS (Miedos)', k: 0, pdk: false },
    { group: 'Contenido', code: 'OBS', name: 'OBS (Obsesividad)', k: 0, pdk: false },
    { group: 'Contenido', code: 'DEP', name: 'DEP (Depresión)', k: 0, pdk: false },
    { group: 'Contenido', code: 'HEA', name: 'HEA (Preocupaciones por la salud)', k: 0, pdk: false },
    { group: 'Contenido', code: 'BIZ', name: 'BIZ (Pensamiento estrafalario)', k: 0, pdk: false },
    { group: 'Contenido', code: 'ANG', name: 'ANG (Hostilidad)', k: 0, pdk: false },
    { group: 'Contenido', code: 'CYN', name: 'CYN (Cinismo)', k: 0, pdk: false },
    { group: 'Contenido', code: 'ASP', name: 'ASP (Conductas antisociales)', k: 0, pdk: false },
    { group: 'Contenido', code: 'TPA', name: 'TPA (Comportamiento tipo A)', k: 0, pdk: false },
    { group: 'Contenido', code: 'LSE', name: 'LSE (Baja autoestima)', k: 0, pdk: false },
    { group: 'Contenido', code: 'SOD', name: 'SOD (Malestar social)', k: 0, pdk: false },
    { group: 'Contenido', code: 'FAM', name: 'FAM (Problemas familiares)', k: 0, pdk: false },
    { group: 'Contenido', code: 'WRK', name: 'WRK (Interferencia laboral)', k: 0, pdk: false },
    { group: 'Contenido', code: 'TRT', name: 'TRT (Indicadores negativos de tratam.)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'A', name: 'A (Ansiedad)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'R', name: 'R (Represión)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'Es', name: 'Es (Fuerza del Yo)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'MAC-R', name: 'MAC-R (Alcoholismo MacAndrew Revisada)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'AAS', name: 'AAS (Reconocimiento de la Adicción)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'APS', name: 'APS (Potencial Adictivo)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'MDS', name: 'MDS (Malestar marital)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'Ho', name: 'Ho (Hostilidad)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'O-H', name: 'O-H (Hostilidad Sobrecontrolada)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'Do', name: 'Do (Dominancia)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'Re', name: 'Re (Responsabilidad)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'Mt', name: 'Mt (Desajuste Escolar)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'GM', name: 'GM (Rol Género Masculino)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'GF', name: 'GF (Rol Género Femenino)', k: 0, pdk: false },
    { group: 'Suplementarias', code: 'PK', name: 'PK (Estrés Postraumático)', k: 0, pdk: false },
    { group: 'Validez', code: 'VRIN', name: 'VRIN (Variable de inconsistencia de respuesta)', k: 0, pdk: false },
    { group: 'Validez', code: 'TRIN', name: 'TRIN (Verdadera inconsistencia de respuesta)', k: 0, pdk: false },
    { group: 'Validez', code: 'Fb', name: 'Fb (Infrecuencia posterior)', k: 0, pdk: false },
    { group: 'Validez', code: 'Fp', name: 'Fp (Infrecuencia psicopatológica)', k: 0, pdk: false },
    { group: 'Validez', code: 'S', name: 'S (Autoconcepto superlativo)', k: 0, pdk: false },
    { group: 'Subescalas', code: 'D1', name: 'D1: Depresión subjetiva', k: 0, pdk: false },
    { group: 'Subescalas', code: 'D2', name: 'D2: Retardo Psicomotor', k: 0, pdk: false },
    { group: 'Subescalas', code: 'D3', name: 'D3: Problemas Físicos', k: 0, pdk: false },
    { group: 'Subescalas', code: 'D4', name: 'D4: Inhibición mental', k: 0, pdk: false },
    { group: 'Subescalas', code: 'D5', name: 'D5: Rumiación', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Hy1', name: 'Hy1: Negación de la ansiedad social', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Hy2', name: 'Hy2: Necesidad de afecto', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Hy3', name: 'Hy3: Lasitud-enfermedad', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Hy4', name: 'Hy4: Quejas somáticas', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Hy5', name: 'Hy5: Inhibición de la agresión', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pd1', name: 'Pd1: Discordia familiar', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pd2', name: 'Pd2: Problemas con figuras de autoridad', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pd3', name: 'Pd3: Imperturbabilidad Social', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pd4', name: 'Pd4: Alienación social', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pd5', name: 'Pd5: Autoalienación', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pa1', name: 'Pa1: Ideas persecutorias', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pa2', name: 'Pa2: Hiperestesia', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Pa3', name: 'Pa3: Ingenuidad', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Sc1', name: 'Sc1: Alienación social', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Sc2', name: 'Sc2: Alienación emocional', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Sc3', name: 'Sc3: Ausencia de control del yo, cognitivo', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Sc4', name: 'Sc4: Ausencia del control del yo, conativo', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Sc5', name: 'Sc5: Ausencia del control del yo, inhibición defectual', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Sc6', name: 'Sc6: Experiencias sensoriales bizarras', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Ma1', name: 'Ma1: Amoralidad', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Ma2', name: 'Ma2: Hipercinesia', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Ma3', name: 'Ma3: Imperturbabilidad', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Ma4', name: 'Ma4: Hipertrofia del yo', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Si1', name: 'Si1: Timidez/Autoconciencia', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Si2', name: 'Si2: Evitación Social', k: 0, pdk: false },
    { group: 'Subescalas', code: 'Si3', name: 'Si3: Autoalienación/alienación de los otros', k: 0, pdk: false },
  ],

  SCALE_ITEMS: null,
  SCALE_REGISTRY: null,
  _country: 'US',

  async init() {
    if (this.SCALE_ITEMS && this.SCALE_REGISTRY) return this.SCALE_ITEMS;
    try {
      const [keysResp, registryResp] = await Promise.all([
        fetch('data/scale_items.json'),
        fetch('data/scale_registry.json'),
      ]);
      this.SCALE_ITEMS = await keysResp.json();
      const registryDoc = await registryResp.json();
      this.SCALE_REGISTRY = registryDoc.scales || {};
      this.REGISTRY_META = registryDoc;
    } catch (e) {
      console.error('Error cargando datos del motor MMPI-2:', e);
      this.SCALE_ITEMS = this.SCALE_ITEMS || {};
      this.SCALE_REGISTRY = this.SCALE_REGISTRY || {};
    }
    return this.SCALE_ITEMS;
  },

  setCountry(country) {
    if (!['US', 'ES'].includes(country)) throw new Error('Baremo no reconocido: ' + country);
    this._country = country;
  },

  getCountry() { return this._country; },

  getScaleDefinition(code) {
    return this.SCALES.find(s => s.code === code) || null;
  },

  /* ---- Diagnóstico estructural de claves ---- */
  validateScaleKey(scaleCode) {
    const reg = this.SCALE_REGISTRY?.[scaleCode];
    if (!reg) return { status: 'REGISTRO_NO_DISPONIBLE', calculable: false };
    if (reg.type === 'paired') {
      return {
        status: 'ALGORITMO_ESPECIAL_NO_DISPONIBLE',
        calculable: false,
        expectedPairs: reg.expectedPairs ?? null,
        actualCount: Array.isArray(this.SCALE_ITEMS?.[scaleCode]) ? this.SCALE_ITEMS[scaleCode].length : 0,
      };
    }
    const items = this.SCALE_ITEMS?.[scaleCode];
    if (!Array.isArray(items) || items.length === 0) {
      return { status: 'CLAVE_NO_DISPONIBLE', calculable: false, expectedCount: reg.expectedCount ?? null, actualCount: 0 };
    }
    const invalid = items.filter(x => !x || !Number.isInteger(Number(x.item)) || Number(x.item) < 1 || Number(x.item) > 567 || !Number.isFinite(Number(x.v)) || !Number.isFinite(Number(x.f)));
    if (invalid.length) {
      return { status: 'CLAVE_ESTRUCTURA_INVALIDA', calculable: false, expectedCount: reg.expectedCount ?? null, actualCount: items.length, invalidCount: invalid.length };
    }
    if (Number.isInteger(reg.expectedCount)) {
      if (items.length < reg.expectedCount) return { status: 'CLAVE_INCOMPLETA', calculable: false, expectedCount: reg.expectedCount, actualCount: items.length };
      if (items.length > reg.expectedCount) return { status: 'CLAVE_EXCEDIDA', calculable: false, expectedCount: reg.expectedCount, actualCount: items.length };
    }
    return { status: 'CLAVE_ESTRUCTURAL_OK_NO_VALIDADA', calculable: true, expectedCount: reg.expectedCount ?? null, actualCount: items.length };
  },

  auditKeys() {
    const expectedCodes = new Set(this.SCALES.map(s => s.code));
    const spurious = Object.keys(this.SCALE_ITEMS || {}).filter(k => !expectedCodes.has(k));
    const scales = {};
    for (const s of this.SCALES) scales[s.code] = this.validateScaleKey(s.code);
    return {
      registryVersion: this.REGISTRY_META?.version || 'unknown',
      spuriousKeyCount: spurious.length,
      spuriousKeys: spurious,
      scales,
    };
  },

  /* ---- Calcular PD local solo si la clave supera control estructural ---- */
  computePD(scaleCode, responses) {
    const check = this.validateScaleKey(scaleCode);
    if (!check.calculable) return { pd: null, status: check.status, keyCheck: check, omissions: null };
    const items = this.SCALE_ITEMS[scaleCode];
    let pd = 0;
    let omissions = 0;
    for (const { item, v, f } of items) {
      const resp = responses?.[Number(item) - 1];
      if (resp === 1) pd += Number(v);
      else if (resp === 2) pd += Number(f);
      else omissions++;
    }
    if (omissions > 0) {
      return { pd: null, status: 'RESPUESTAS_INCOMPLETAS_ESCALA', keyCheck: check, omissions };
    }
    return { pd, status: 'PD_LOCAL_NO_VALIDADA', keyCheck: check, omissions: 0 };
  },

  computeAllPDs(responses) {
    const results = {};
    for (const scale of this.SCALES) results[scale.code] = this.computePD(scale.code, responses);
    const kPD = results.K?.pd;
    for (const scale of this.SCALES) {
      const r = results[scale.code];
      if (!r || r.pd == null) { if (r) r.pdK = null; continue; }
      const k = scale.k || 0;
      if (k > 0) {
        r.pdK = (kPD == null) ? null : r.pd + Math.round(kPD * k);
        if (r.pdK == null) r.status = 'K_NO_DISPONIBLE';
      } else r.pdK = r.pd;
    }
    return results;
  },

  /* ---- Lookup exacto. El baremo ES heredado queda bloqueado tras auditoría ---- */
  lookupT(scaleCode, pd, sex, country) {
    if (pd == null) return { t: null, status: 'PD_NO_DISPONIBLE' };
    if (!['US', 'ES'].includes(country)) return { t: null, status: 'BAREMO_NO_RECONOCIDO' };
    if (country === 'ES') {
      return { t: null, status: 'BAREMO_ES_NO_VALIDADO_LOCALMENTE' };
    }
    const all = window.__BAREMOS_US__ || {};
    const scaleTable = all[scaleCode];
    if (!scaleTable) return { t: null, status: 'T_NO_DISPONIBLE' };
    const sexData = scaleTable[sex];
    if (!sexData) return { t: null, status: 'T_NO_DISPONIBLE' };
    const key = String(pd);
    if (!Object.prototype.hasOwnProperty.call(sexData, key)) {
      return { t: null, status: 'PD_FUERA_DE_TABLA' };
    }
    const t = Number(sexData[key]);
    if (!Number.isFinite(t)) return { t: null, status: 'BAREMO_DATO_INVALIDO' };
    return { t, status: 'T_LOCAL_NO_VALIDADA' };
  },

  computeAllT(pds, sex, country) {
    const results = {};
    for (const scale of this.SCALES) {
      const pdData = pds[scale.code];
      if (!pdData || pdData.pd == null) {
        results[scale.code] = { t: null, pd: pdData?.pd ?? null, pdK: pdData?.pdK ?? null, status: pdData?.status || 'SIN_DATOS' };
        continue;
      }
      const pdToUse = scale.pdk ? pdData.pdK : pdData.pd;
      if (pdToUse == null) {
        results[scale.code] = { t: null, pd: pdData.pd, pdK: pdData.pdK, status: pdData.status || 'PD_NO_DISPONIBLE' };
        continue;
      }
      const found = this.lookupT(scale.code, pdToUse, sex, country);
      results[scale.code] = { t: found.t, pd: pdData.pd, pdK: pdData.pdK, status: found.status, pdStatus: pdData.status, keyCheck: pdData.keyCheck };
    }
    return results;
  },

  async computeAll(responses, sex, country) {
    await this.init();
    if (!country) throw new Error('El baremo/país debe indicarse explícitamente (US o ES).');
    this.setCountry(country);
    const pds = this.computeAllPDs(responses || []);
    const tScores = this.computeAllT(pds, sex, country);
    const results = {};
    for (const scale of this.SCALES) {
      const tr = tScores[scale.code] || {};
      results[scale.code] = {
        code: scale.code,
        name: scale.name,
        group: scale.group,
        k: scale.k,
        pdk: scale.pdk,
        pd: pds[scale.code]?.pd ?? null,
        pdK: pds[scale.code]?.pdK ?? null,
        t: tr.t ?? null,
        status: tr.status || pds[scale.code]?.status || 'SIN_DATOS',
        pdStatus: pds[scale.code]?.status || null,
        keyCheck: pds[scale.code]?.keyCheck || null,
        band: this.getBand(tr.t, scale.code, sex),
        interpretation: this.getInterpretation(scale.code, tr.t, sex),
        source: tr.t != null ? 'Motor local heredado; estructura controlada, puntuación no validada contra sistema oficial' : null,
      };
    }
    return results;
  },

  /* ---- Importación de T provenientes de corrección oficial ---- */
  parseOfficialTScores(text) {
    const out = {};
    if (!text || typeof text !== 'string') return out;
    const canonical = new Map(this.SCALES.map(s => [s.code.toLowerCase(), s.code]));
    // Admite, por ejemplo: Hs=68, D:58, TRIN=57F o TRIN=62T.
    const re = /([A-Za-z][A-Za-z0-9-]{0,8})\s*[:=]\s*(-?\d+(?:[.,]\d+)?)\s*([TF])?/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
      const code = canonical.get(m[1].toLowerCase());
      const t = Number(m[2].replace(',', '.'));
      const direction = (m[3] || '').toUpperCase();
      if (code && Number.isFinite(t) && t >= 0 && t <= 150) {
        out[code] = { t, direction: code === 'TRIN' && ['T','F'].includes(direction) ? direction : null };
      }
    }
    return out;
  },

  applyOfficialTScores(results, text, sex, sourceLabel = 'Corrección oficial importada') {
    const imported = this.parseOfficialTScores(text);
    for (const [code, entry] of Object.entries(imported)) {
      if (!results[code]) continue;
      const t = Number(entry?.t);
      if (!Number.isFinite(t)) continue;
      results[code].t = t;
      results[code].tDirection = entry?.direction || null;
      results[code].tDisplay = entry?.direction ? `${t}${entry.direction}` : String(t);
      results[code].status = 'T_OFICIAL_IMPORTADA';
      results[code].band = this.getBand(t, code, sex);
      results[code].interpretation = this.getInterpretation(code, t, sex);
      if (code === 'TRIN' && entry?.direction) {
        results[code].interpretation += ` Dirección oficial reportada: ${entry.direction}.`;
      }
      results[code].source = sourceLabel;
    }
    return results;
  },

  _bandsFor(scaleCode, sex) {
    const c = window.__CRITERIOS__?.[scaleCode];
    if (!c) return [];
    if (sex === 'H' && Array.isArray(c.bands_H)) return c.bands_H;
    if (sex === 'M' && Array.isArray(c.bands_M)) return c.bands_M;
    const bands = Array.isArray(c.bands) ? c.bands : [];
    // Mf heredó dos juegos completos concatenados: H primero, M después.
    if (scaleCode === 'Mf' && bands.length >= 10) return sex === 'M' ? bands.slice(5, 10) : bands.slice(0, 5);
    return bands;
  },

  _bandRecord(scaleCode, t, sex) {
    if (!Number.isFinite(Number(t))) return null;
    const tn = Number(t);
    for (const row of this._bandsFor(scaleCode, sex)) {
      if (!Array.isArray(row) || row.length < 4) continue;
      const [min, max] = row;
      if (tn >= Number(min) && tn <= Number(max)) return row;
    }
    return null;
  },

  getBand(t, scaleCode, sex) {
    if (!Number.isFinite(Number(t))) return null;
    const row = this._bandRecord(scaleCode, Number(t), sex);
    const label = row ? String(row[2]) : (t >= 65 ? 'Elevado' : (t <= 39 ? 'Bajo' : 'Rango intermedio'));
    let color = 't-modal', level = 2;
    if (t >= 70) { color = 't-very-high'; level = 5; }
    else if (t >= 65) { color = 't-high'; level = 4; }
    else if (t >= 56) { color = 't-mod-high'; level = 3; }
    else if (t <= 39) { color = 't-low'; level = 1; }
    return { label, color, level };
  },

  getInterpretation(scaleCode, t, sex) {
    if (!Number.isFinite(Number(t))) return this.statusExplanation(null, 'T_NO_DISPONIBLE');
    const row = this._bandRecord(scaleCode, Number(t), sex);
    if (!row) return 'Puntuación disponible; criterio interpretativo específico no validado en esta versión.';
    return `[${row[2]}] ${row[3]}`;
  },

  statusExplanation(result, statusOverride) {
    const status = statusOverride || result?.status || '';
    const map = {
      CLAVE_NO_DISPONIBLE: 'No calculable localmente: clave de corrección no disponible.',
      CLAVE_INCOMPLETA: 'No calculable localmente: la clave heredada está incompleta.',
      CLAVE_EXCEDIDA: 'No calculable localmente: la clave heredada no coincide con el número documentado de componentes.',
      CLAVE_ESTRUCTURA_INVALIDA: 'No calculable localmente: estructura de clave inválida.',
      ALGORITMO_ESPECIAL_NO_DISPONIBLE: 'No calculable localmente: requiere algoritmo especial de corrección.',
      RESPUESTAS_INCOMPLETAS_ESCALA: 'No calculable: existen omisiones en componentes de la escala.',
      BAREMO_ES_NO_VALIDADO_LOCALMENTE: 'PD estructural disponible, pero la tabla española local no superó la auditoría de integridad. Importe la T obtenida con corrección oficial.',
      T_NO_DISPONIBLE: 'PD disponible, pero no existe conversión T local verificable.',
      PD_FUERA_DE_TABLA: 'La PD no tiene coincidencia exacta en la tabla local; no se realizó aproximación.',
      T_LOCAL_NO_VALIDADA: 'T calculada con tabla local heredada; requiere cotejo con corrección oficial antes de uso clínico/pericial.',
      T_OFICIAL_IMPORTADA: 'Puntuación T importada desde una corrección oficial/profesional declarada por el evaluador.',
    };
    return map[status] || 'Puntuación no disponible o no validada.';
  },

  buildNarrative(results, patientName, age, sex, country, validityDecision = 'NO_EVALUADA') {
    const sexLabel = sex === 'M' ? 'mujer' : (sex === 'H' ? 'hombre' : 'sexo no consignado');
    const countryLabel = country === 'US' ? 'norma estadounidense MMPI-2' : 'adaptación española MMPI-2';
    const numeric = Object.values(results || {}).filter(r => typeof r.t === 'number');
    const official = numeric.filter(r => r.status === 'T_OFICIAL_IMPORTADA');
    const local = numeric.filter(r => r.status === 'T_LOCAL_NO_VALIDADA');
    const unavailable = Object.values(results || {}).filter(r => typeof r.t !== 'number');
    const elevated = numeric.filter(r => r.t >= 65);

    let narrative = `La persona evaluada, ${patientName || 'sin nombre consignado'}, ${age != null ? age + ' años' : 'edad no consignada'}, ${sexLabel}, cuenta con ${numeric.length} puntuaciones T disponibles. `;
    if (official.length) narrative += `${official.length} fueron importadas desde una corrección oficial/profesional declarada; `;
    if (local.length) narrative += `${local.length} proceden del motor local heredado y permanecen marcadas como no validadas; `;
    if (unavailable.length) narrative += `${unavailable.length} escalas permanecen deliberadamente sin T para evitar estimaciones no documentadas. `;
    if (elevated.length) narrative += `Se observan puntuaciones elevadas (T≥65) en ${elevated.map(r => r.code).join(', ')}; estas elevaciones requieren integración con validez del protocolo, entrevista y demás fuentes de evaluación. `;
    else narrative += 'No se observan puntuaciones T≥65 entre las puntuaciones actualmente disponibles. ';

    const decision = validityDecision || 'NO_EVALUADA';
    if (decision === 'NO_INTERPRETABLE') narrative += 'El protocolo ha sido marcado por el profesional como NO INTERPRETABLE; se suspende la interpretación sustantiva del perfil. ';
    else if (decision === 'INTERPRETABLE_CON_CAUTELA') narrative += 'El protocolo ha sido marcado como interpretable con cautela; toda conclusión debe explicitar las limitaciones de validez. ';
    else if (decision === 'INTERPRETABLE') narrative += 'El protocolo ha sido marcado por el profesional como interpretable. ';
    else narrative += 'La validez global del protocolo aún no ha sido declarada por el profesional; la síntesis es descriptiva y no diagnóstica. ';

    narrative += `Referencia normativa seleccionada: ${countryLabel}. La aplicación no sustituye el sistema oficial de corrección ni el juicio profesional.`;
    return narrative;
  },
};

window.MMPI2 = MMPI2;

/* ============================================
   MMPI-2 · Motor de cálculo (V3 · FAIL-CLOSED)
   - PD directa por escala (fail-closed: null si no hay clave)
   - K-correction (Hs 0.5, Pd 0.4, Pt 1.0, Sc 1.0, Ma 0.2)
   - Lookup T por sexo y país (exact PD match)
   - Texto interpretativo por banda
   - Status codes explícitos:
       T_DOCUMENTADA       — T calculada y documentada
       T_NO_DISPONIBLE     — baremo existe pero PD no se encuentra
       CLAVE_NO_DISPONIBLE — la escala no tiene ítems claveados
       CLAVE_INCOMPLETA    — clave existe pero faltan datos
       PD_FUERA_DE_TABLA   — PD calculado pero fuera de la tabla del baremo
   - Country es PARÁMETRO obligatorio (no state global)
   ============================================ */

const MMPI2 = {
  // Códigos de status V3 (fail-closed)
  STATUS: Object.freeze({
    T_DOCUMENTADA:       'T_DOCUMENTADA',
    T_NO_DISPONIBLE:     'T_NO_DISPONIBLE',
    CLAVE_NO_DISPONIBLE: 'CLAVE_NO_DISPONIBLE',
    CLAVE_INCOMPLETA:    'CLAVE_INCOMPLETA',
    PD_FUERA_DE_TABLA:   'PD_FUERA_DE_TABLA',
  }),

  // K-correction factors
  K_FACTORS: { Hs: 0.5, Pd: 0.4, Pt: 1.0, Sc: 1.0, Ma: 0.2 },
  PDK_SCALES: new Set(['Hs', 'Pd', 'Pt', 'Sc', 'Ma']),

  // Escalas que en el baremo español requieren TEAcorrige (sin T pública)
  // En el baremo US Minnesota (N=2.600) se incluyen S, Fp y Ho (todas con T).
  ONLINE_SCALES_ES: new Set(['Fp', 'S', 'Ho']),
  ONLINE_SCALES_US: new Set(),

  // Definición de escalas (orden preservado)
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

  // Mapeo: código de escala → lista de ítems
  SCALE_ITEMS: null,

  async init() {
    if (this.SCALE_ITEMS) return this.SCALE_ITEMS;
    try {
      const resp = await fetch('data/scale_items.json');
      this.SCALE_ITEMS = await resp.json();
    } catch (e) {
      console.error('Error cargando scale_items.json:', e);
      this.SCALE_ITEMS = {};
    }
    return this.SCALE_ITEMS;
  },

  /* ---- Calcular PD directa por escala (FAIL-CLOSED) ----
     Devuelve null si la escala NO tiene ítems claveados.
     NUNCA convierte undefined/missing a 0. */
  computePD(scaleCode, responses) {
    const items = this.SCALE_ITEMS?.[scaleCode];
    if (!Array.isArray(items) || items.length === 0) return null;
    let pd = 0;
    for (const it of items) {
      if (!it || typeof it.item !== 'number') continue;
      const v = (typeof it.v === 'number') ? it.v : 0;
      const f = (typeof it.f === 'number') ? it.f : 0;
      const resp = responses?.[it.item - 1];
      if (resp === 1) pd += v;
      else if (resp === 2) pd += f;
      // resp null/undefined → 0 (omisión: no suma)
    }
    return pd;
  },

  /* ---- Calcular todas las PDs (FAIL-CLOSED) ----
     Si una escala no tiene clave → pd=null y pdK=null. */
  computeAllPDs(responses) {
    const results = {};
    for (const scale of this.SCALES) {
      const pd = this.computePD(scale.code, responses);
      results[scale.code] = { pd };
    }
    // K-correction: si PD de K no está disponible, todas las escalas con
    // K-correction quedan con pdK=null (no se puede corregir).
    const kPD = (results.K && results.K.pd != null) ? results.K.pd : null;
    for (const scale of this.SCALES) {
      const entry = results[scale.code];
      const k = scale.k || 0;
      if (entry.pd == null) {
        entry.pdK = null;
      } else if (k > 0) {
        if (kPD == null) {
          entry.pdK = null;
        } else {
          entry.pdK = entry.pd + Math.round(kPD * k);
        }
      } else {
        entry.pdK = entry.pd;
      }
    }
    return results;
  },

  /* ---- ¿Está una escala bloqueada para el país indicado? ---- */
  isOnlineScale(scaleCode, country) {
    if (country === 'US') return this.ONLINE_SCALES_US.has(scaleCode);
    return this.ONLINE_SCALES_ES.has(scaleCode);
  },

  /* ---- Mensaje para escalas sin T disponible ---- */
  getOnlineMessage(scaleCode, country) {
    if (country === 'US') {
      return 'PD calculada. Conversión a T no disponible en el baremo extraído; utilice el sistema de corrección oficial de Minnesota (Pearson Assessments).';
    }
    return 'Escala española vigente (4.ª ed. 2019). Conversión PD→T requiere TEAcorrige. No se ha publicado matriz completa en extracto abierto.';
  },

  /* ---- Selecciona el baremo correspondiente al país ---- */
  _getBaremos(country) {
    if (country === 'US') return window.__BAREMOS_US__ || {};
    return window.__BAREMOS_ES__ || {};
  },

  /* ---- Lookup T por sexo y país (FAIL-CLOSED)
     - Si pd es null → {t:null, status:CLAVE_NO_DISPONIBLE}
     - Si la escala está "online" para el país → {t:<mensaje>, status:ES-ONLINE}
     - Si la escala no está en el baremo → {t:null, status:T_NO_DISPONIBLE}
     - Si el PD exacto no está en la tabla → {t:null, status:PD_FUERA_DE_TABLA}
     - Si todo OK → {t:<number>, status:T_DOCUMENTADA}            ---- */
  lookupT(scaleCode, pd, sex, country) {
    const S = this.STATUS;
    // 1. CLAVE_NO_DISPONIBLE
    if (pd == null) {
      return { t: null, status: S.CLAVE_NO_DISPONIBLE };
    }
    // 2. Escala online (sin T pública en este baremo)
    if (this.isOnlineScale(scaleCode, country)) {
      return { t: this.getOnlineMessage(scaleCode, country), status: 'ES-ONLINE' };
    }
    // 3. Baremo no cargado o sin esta escala
    const baremos = this._getBaremos(country);
    const scaleBaremo = baremos?.[scaleCode];
    if (!scaleBaremo) {
      return { t: null, status: S.T_NO_DISPONIBLE };
    }
    const sexData = scaleBaremo[sex];
    if (!sexData) {
      return { t: null, status: S.T_NO_DISPONIBLE };
    }
    // 4. PD_FUERA_DE_TABLA: si la PD exacta no está en la tabla del baremo
    //    (no se aproxima silenciosamente)
    const pdKey = String(pd);
    if (!Object.prototype.hasOwnProperty.call(sexData, pdKey)) {
      return { t: null, status: S.PD_FUERA_DE_TABLA };
    }
    const tVal = sexData[pdKey];
    if (typeof tVal !== 'number' || !isFinite(tVal)) {
      return { t: null, status: S.PD_FUERA_DE_TABLA };
    }
    return { t: tVal, status: S.T_DOCUMENTADA };
  },

  /* ---- Calcular T para todas las escalas (FAIL-CLOSED) ---- */
  computeAllT(pds, sex, country) {
    const results = {};
    for (const scale of this.SCALES) {
      const pdData = pds[scale.code];
      if (!pdData || pdData.pd == null) {
        results[scale.code] = { t: null, status: this.STATUS.CLAVE_NO_DISPONIBLE };
        continue;
      }
      const pdToUse = scale.pdk ? pdData.pdK : pdData.pd;
      // Si la escala usa PD+K pero pdK no está disponible → CLAVE_INCOMPLETA
      if (scale.pdk && pdToUse == null) {
        results[scale.code] = { t: null, status: this.STATUS.CLAVE_INCOMPLETA };
        continue;
      }
      const lk = this.lookupT(scale.code, pdToUse, sex, country);
      results[scale.code] = {
        t: lk.t,
        status: lk.status,
      };
    }
    return results;
  },

  /* ---- Calcular todo (PD + K + T) — country OBLIGATORIO ---- */
  async computeAll(responses, sex, country) {
    await this.init();
    // Validación estricta: country es obligatorio
    if (country !== 'ES' && country !== 'US') {
      throw new Error('computeAll: country es obligatorio (\'ES\' o \'US\')');
    }
    if (sex !== 'H' && sex !== 'M') {
      throw new Error('computeAll: sex es obligatorio (\'H\' o \'M\')');
    }
    const pds = this.computeAllPDs(responses);
    const tScores = this.computeAllT(pds, sex, country);
    const results = {};
    for (const scale of this.SCALES) {
      const pdData = pds[scale.code] || { pd: null, pdK: null };
      const tInfo = tScores[scale.code] || { t: null, status: this.STATUS.CLAVE_NO_DISPONIBLE };
      results[scale.code] = {
        code: scale.code,
        name: scale.name,
        group: scale.group,
        k: scale.k,
        pdk: scale.pdk,
        pd: pdData.pd,
        pdK: pdData.pdK,
        t: tInfo.t,
        status: tInfo.status,
        band: this.getBand(tInfo.t),
        interpretation: this.getInterpretation(scale.code, tInfo.t, sex),
      };
    }
    return results;
  },

  /* ---- Determinar banda por T ---- */
  getBand(t) {
    if (t === null || t === undefined || typeof t !== 'number') return null;
    if (t >= 70) return { label: 'Muy Alto (≥70)', color: 't-very-high', level: 5 };
    if (t >= 60) return { label: 'Alto (60-69)', color: 't-high', level: 4 };
    if (t >= 56) return { label: 'Promedio-Superior (56-59)', color: 't-mod-high', level: 3 };
    if (t >= 40) return { label: 'Modal (40-55)', color: 't-modal', level: 2 };
    return { label: 'Bajo (≤39)', color: 't-low', level: 1 };
  },

  /* ---- Obtener texto interpretativo por banda ---- */
  getInterpretation(scaleCode, t, sex) {
    if (t === null || t === undefined) {
      return 'Sin T documentada';
    }
    if (typeof t === 'string') {
      return t;
    }
    if (typeof t !== 'number' || !isFinite(t)) {
      return 'Sin T documentada';
    }
    const criterios = window.__CRITERIOS__?.[scaleCode];
    if (!criterios) return 'Texto interpretativo no disponible';
    // Selección correcta de bands según estructura del criterio:
    //  - Escalas sex-specific (L, F, K, Mf): bands_H / bands_M
    //  - Escalas genéricas: bands
    let bands = null;
    if (Array.isArray(criterios.bands_H) && Array.isArray(criterios.bands_M)) {
      bands = (sex === 'H') ? criterios.bands_H : criterios.bands_M;
    } else if (Array.isArray(criterios.bands)) {
      bands = criterios.bands;
    }
    if (!bands || !bands.length) return 'Texto interpretativo no disponible';
    for (const band of bands) {
      if (!Array.isArray(band) || band.length < 4) continue;
      const [tMin, tMax, label, text] = band;
      if (t >= tMin && t <= tMax) {
        return `[${label}] ${text}`;
      }
    }
    return 'Texto interpretativo no disponible';
  },

  /* ---- Puerta de validez del protocolo ----
     Devuelve { status, reasons } con status ∈
       'INTERPRETABLE' | 'INTERPRETABLE_CON_CAUTELA' | 'NO_INTERPRETABLE' */
  assessValidity(results) {
    const reasons = [];
    let status = 'INTERPRETABLE';
    const t = (code) => {
      const r = results[code];
      return (r && typeof r.t === 'number') ? r.t : null;
    };
    // Omisiones: contar respuestas null en responses (si está disponible globalmente).
    // Aquí se acepta un campo `omissions` opcional en results._meta para portabilidad.
    const omissions = (results && results._meta && typeof results._meta.omissions === 'number')
      ? results._meta.omissions : null;

    const F = t('F'), L = t('L'), K = t('K'), VRIN = t('VRIN');
    if (omissions != null && omissions > 30) {
      status = 'NO_INTERPRETABLE';
      reasons.push(`Omisiones excesivas (${omissions} > 30).`);
    } else if (omissions != null && omissions > 10) {
      if (status === 'INTERPRETABLE') status = 'INTERPRETABLE_CON_CAUTELA';
      reasons.push(`Omisiones moderadas (${omissions}).`);
    }
    if (F != null && F > 90) {
      status = 'NO_INTERPRETABLE';
      reasons.push(`F (T=${F}) > 90: protocolo no interpretable.`);
    }
    if (L != null && L > 80) {
      status = 'NO_INTERPRETABLE';
      reasons.push(`L (T=${L}) > 80: defensividad extrema, protocolo no interpretable.`);
    }
    if (VRIN != null && VRIN > 80) {
      status = 'NO_INTERPRETABLE';
      reasons.push(`VRIN (T=${VRIN}) > 80: inconsistencia de respuesta invalidante.`);
    }
    if (K != null && K > 70) {
      if (status === 'INTERPRETABLE') status = 'INTERPRETABLE_CON_CAUTELA';
      reasons.push(`K (T=${K}) > 70: postura defensiva; interpretar con cautela.`);
    }
    if (reasons.length === 0) reasons.push('Protocolo dentro de límites aceptables.');
    return { status, reasons };
  },

  /* ---- Síntesis narrativa automática ---- */
  buildNarrative(results, patientName, age, sex, country) {
    const sexLabel = sex === 'M' ? 'mujer' : (sex === 'H' ? 'varón' : 'sexo no especificado');
    const countryLabel = country === 'US'
      ? 'estadounidense (Minnesota N=2.600, recomendado para Latinoamérica)'
      : 'español (TEA Ediciones, 4.ª ed. 2019)';
    const elevated = Object.values(results).filter(r => typeof r.t === 'number' && r.t >= 70);
    const high = Object.values(results).filter(r => typeof r.t === 'number' && r.t >= 60 && r.t < 70);
    const low = Object.values(results).filter(r => typeof r.t === 'number' && r.t <= 39);
    const online = Object.values(results).filter(r => r.status === 'ES-ONLINE');

    let narrative = `La persona evaluada, ${patientName || 'el evaluado'}, ${age != null ? age + ' años' : 'edad no consta'}, sexo ${sexLabel}, presenta el siguiente perfil: `;
    if (elevated.length === 0) {
      narrative += 'ninguna escala en rango Muy Alto (T≥70). ';
    } else {
      const elevList = elevated.map(r => r.code).join(', ');
      narrative += `${elevated.length} escala(s) en rango Muy Alto (T≥70): ${elevList}. Esto sugiere psicopatología severa en las áreas correspondientes. `;
    }
    if (high.length > 0) {
      const highList = high.map(r => r.code).join(', ');
      narrative += `${high.length} escala(s) en rango Alto (T 60-69): ${highList}, indicando elevaciones clínicas significativas. `;
    }
    if (low.length > 0) {
      const lowList = low.map(r => r.code).join(', ');
      narrative += `${low.length} escala(s) en rango Bajo (T≤39): ${lowList}, lo que puede indicar características opuestas a las medidas por esas escalas. `;
    }
    if (online.length > 0) {
      if (country === 'US') {
        narrative += `${online.length} escala(s) sin conversión T en el baremo extraído (utilizar sistema oficial Minnesota): ${online.map(r => r.code).join(', ')}. `;
      } else {
        narrative += `${online.length} escala(s) marcadas como ES-ONLINE (requieren TEAcorrige): ${online.map(r => r.code).join(', ')}. `;
      }
    }
    narrative += `Baremo utilizado: ${countryLabel}. `;
    narrative += 'Revise el detalle por escala en las tablas siguientes y las configuraciones clínicas del perfil para un análisis integrado.';
    return narrative;
  },
};

window.MMPI2 = MMPI2;

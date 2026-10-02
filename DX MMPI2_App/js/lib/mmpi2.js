/* ============================================
   MMPI-2 · Motor de cálculo
   - PD directa por escala
   - K-correction (Hs 0.5, Pd 0.4, Pt 1.0, Sc 1.0, Ma 0.2)
   - Lookup T por sexo usando baremos
   - Texto interpretativo por banda
   ============================================ */

const MMPI2 = {
  // K-correction factors
  K_FACTORS: { Hs: 0.5, Pd: 0.4, Pt: 1.0, Sc: 1.0, Ma: 0.2 },
  PDK_SCALES: new Set(['Hs', 'Pd', 'Pt', 'Sc', 'Ma']),
  // Escalas sin baremo público — tratamiento distinto según país
  // Para ES: requieren TEAcorrige (4.ª ed. española 2019)
  // Para US: no están en nuestros baremos extraídos pero PD es válida; T no disponible
  ONLINE_SCALES_ES: new Set(['Fp', 'S', 'Ho']),
  ONLINE_SCALES_US: new Set(), // US: ninguna escala está bloqueada (todas tienen lookup)

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

  // Mapeo: código de escala → lista de ítems (item_num, value_for_V=1, value_for_F=2)
  // Estos se cargan desde el Excel híbrido original
  SCALE_ITEMS: null, // Se carga en init()

  // Cargar mapeo de ítems por escala desde Respuestas del Excel híbrido
  async init() {
    if (this.SCALE_ITEMS) return this.SCALE_ITEMS;
    // Cargar desde el JSON pre-generado que extrae el mapeo
    try {
      const resp = await fetch('data/scale_items.json');
      this.SCALE_ITEMS = await resp.json();
    } catch (e) {
      console.error('Error cargando scale_items.json:', e);
      this.SCALE_ITEMS = {};
    }
    return this.SCALE_ITEMS;
  },

  /* ---- Calcular PD directa por escala ---- */
  computePD(scaleCode, responses) {
    const items = this.SCALE_ITEMS?.[scaleCode] || [];
    if (!items.length) return 0;
    let pd = 0;
    for (const { item, v, f } of items) {
      // item es 1-indexed
      const resp = responses[item - 1];
      if (resp === 1) pd += v;
      else if (resp === 2) pd += f;
      // resp null/undefined → 0
    }
    return pd;
  },

  /* ---- Calcular todas las PDs ---- */
  computeAllPDs(responses) {
    const results = {};
    for (const scale of this.SCALES) {
      const pd = this.computePD(scale.code, responses);
      results[scale.code] = { pd };
    }
    // Calcular K primero (para usar en correcciones PDK)
    const kPD = results.K?.pd || 0;
    // Aplicar K-correction
    for (const scale of this.SCALES) {
      const k = scale.k || 0;
      if (k > 0) {
        results[scale.code].pdK = results[scale.code].pd + Math.round(kPD * k);
      } else {
        results[scale.code].pdK = results[scale.code].pd;
      }
    }
    return results;
  },

  /* ---- Current country (ES or US) ---- */
  _country: 'ES',

  setCountry(country) {
    this._country = country;
    if (country === 'US') {
      window.__BAREMOS__ = window.__BAREMOS_US__;
    } else {
      window.__BAREMOS__ = window.__BAREMOS_ES__;
    }
  },

  getCountry() { return this._country; },

  /* ---- ¿Está una escala bloqueada para el país actual? ---- */
  isOnlineScale(scaleCode) {
    if (this._country === 'US') return this.ONLINE_SCALES_US.has(scaleCode);
    return this.ONLINE_SCALES_ES.has(scaleCode);
  },

  /* ---- Mensaje para escalas sin T disponible ---- */
  getOnlineMessage(scaleCode) {
    if (this._country === 'US') {
      return 'PD calculada. Conversión a T no disponible en el baremo extraído; utilice el sistema de corrección oficial de Minnesota (Pearson Assessments).';
    }
    return 'Escala española vigente (4.ª ed. 2019). Conversión PD→T requiere TEAcorrige. No se ha publicado matriz completa en extracto abierto.';
  },

  /* ---- Lookup T por sexo y país ---- */
  lookupT(scaleCode, pd, sex, useK) {
    if (this.isOnlineScale(scaleCode)) {
      return this.getOnlineMessage(scaleCode);
    }
    const baremos = window.__BAREMOS__?.[scaleCode];
    if (!baremos) return null;
    const sexData = baremos[sex];
    if (!sexData) return null;

    // Buscar el T correspondiente al PD
    // Estrategia: encontrar el PD más alto <= pd_target y devolver su T
    // Si no hay ningún PD <= target, devolver el T del PD más bajo disponible
    let bestPD = null;
    let bestT = null;
    for (const [pdStr, tVal] of Object.entries(sexData)) {
      const pdVal = parseInt(pdStr, 10);
      if (pdVal <= pd) {
        if (bestPD === null || pdVal > bestPD) {
          bestPD = pdVal;
          bestT = parseInt(tVal, 10);
        }
      }
    }
    return bestT;
  },

  /* ---- Calcular T para todas las escalas ---- */
  computeAllT(pds, sex) {
    const results = {};
    for (const scale of this.SCALES) {
      const pdData = pds[scale.code];
      if (!pdData) {
        results[scale.code] = { t: null, status: 'SIN_DATOS' };
        continue;
      }
      const pdToUse = scale.pdk ? pdData.pdK : pdData.pd;
      const t = this.lookupT(scale.code, pdToUse, sex, scale.pdk);
      if (this.isOnlineScale(scale.code)) {
        results[scale.code] = { 
          t: this.getOnlineMessage(scale.code),
          pd: pdData.pd,
          pdK: pdData.pdK,
          status: 'ES-ONLINE' 
        };
      } else if (t === null || t === undefined) {
        results[scale.code] = { 
          t: null,
          pd: pdData.pd,
          pdK: pdData.pdK,
          status: 'SIN_BAREMO' 
        };
      } else {
        results[scale.code] = { 
          t,
          pd: pdData.pd,
          pdK: pdData.pdK,
          status: 'T_DOCUMENTADA' 
        };
      }
    }
    return results;
  },

  /* ---- Calcular todo (PD + K + T) ---- */
  async computeAll(responses, sex, country) {
    await this.init();
    if (country) this.setCountry(country);
    const pds = this.computeAllPDs(responses);
    const tScores = this.computeAllT(pds, sex);
    // Merge
    const results = {};
    for (const scale of this.SCALES) {
      results[scale.code] = {
        code: scale.code,
        name: scale.name,
        group: scale.group,
        k: scale.k,
        pdk: scale.pdk,
        pd: pds[scale.code]?.pd ?? null,
        pdK: pds[scale.code]?.pdK ?? null,
        t: tScores[scale.code]?.t ?? null,
        status: tScores[scale.code]?.status ?? 'SIN_DATOS',
        band: this.getBand(tScores[scale.code]?.t),
        interpretation: this.getInterpretation(scale.code, tScores[scale.code]?.t, sex),
      };
    }
    return results;
  },

  /* ---- Determinar banda por T ---- */
  getBand(t) {
    if (t === null || t === undefined || typeof t === 'string') return null;
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
      // Escala sin T disponible (mensaje depende del país)
      return t;
    }
    const criterios = window.__CRITERIOS__?.[scaleCode];
    if (!criterios) return 'Texto interpretativo no disponible';
    
    // Para escalas con bandas separadas por sexo (L, F, K, Mf)
    let bands = criterios.bands;
    if (!bands) {
      // Intentar bands_H o bands_M (escalas sex-specific)
      bands = sex === 'H' ? criterios.bands_H : criterios.bands_M;
    }
    if (!bands || !bands.length) return 'Texto interpretativo no disponible';
    
    // Buscar la banda que contiene t
    for (const [tMin, tMax, label, text] of bands) {
      if (t >= tMin && t <= tMax) {
        return `[${label}] ${text}`;
      }
    }
    return 'Texto interpretativo no disponible';
  },

  /* ---- Síntesis narrativa automática ---- */
  buildNarrative(results, patientName, age, sex, country) {
    const sexLabel = sex === 'M' ? 'mujer' : 'varón';
    const countryLabel = country === 'US' ? 'estadounidense (recomendado para Latinoamérica)' : 'español (TEA Ediciones)';
    const elevated = Object.values(results).filter(r => typeof r.t === 'number' && r.t >= 70);
    const high = Object.values(results).filter(r => typeof r.t === 'number' && r.t >= 60 && r.t < 70);
    const low = Object.values(results).filter(r => typeof r.t === 'number' && r.t <= 39);
    const online = Object.values(results).filter(r => r.status === 'ES-ONLINE');
    
    let narrative = `La persona evaluada, ${patientName}, ${age} años, sexo ${sexLabel}, presenta el siguiente perfil: `;
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

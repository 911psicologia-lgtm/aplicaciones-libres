/* ============================================
   Critical — Ítems críticos del MMPI-2 (Apéndice D del manual)
   Koss-Butcher revisados (Tabla D-1) y Lachar-Wrobel (Tabla D-2).

   Los ítems críticos NO son escalas: no tienen baremo ni puntos de corte.
   Su función es señalar contenidos concretos que el evaluado reconoció
   y que deben explorarse en entrevista (Butcher et al., 2001; Graham, 2012).
   La "concentración" que se informa es una descripción de la proporción
   de ítems reconocidos en cada serie, no un nivel normativo.
   Fuente de las claves: data/criticos.json (copia verificada contra el manual).
   ============================================ */

const Critical = {
  VERSION: 1,

  SETS: {
    KB: {
      title: 'Ítems críticos de Koss-Butcher (revisados)',
      cite: 'Koss y Butcher (1973); Koss et al. (1976); revisión en Butcher et al. (2001)',
      series: {
        ansiedad_aguda: { name: 'Estado de ansiedad aguda', items: ['2F','3F','5V','10F','15V','28V','39V','59V','140F','172V','208F','218V','223F','301V','444V','463V','469V'] },
        ideacion_suicida: { name: 'Ideación suicida depresiva', items: ['9F','38V','65V','71V','75F','92V','95F','130V','146V','215V','233V','273V','303V','306V','388F','411V','454V','485V','506V','518V','520V','524V'] },
        amenaza_ataque: { name: 'Amenaza de ataque', items: ['37V','85V','134V','213V','389V'] },
        estres_alcohol: { name: 'Estrés ocasionado por el alcoholismo', items: ['125F','264V','487V','489V','502V','511V','518V'] },
        confusion_mental: { name: 'Confusión mental', items: ['24V','31V','32V','72V','96V','180V','198V','299V','311V','316V','325V'] },
        persecucion: { name: 'Ideas de persecución', items: ['17V','42V','99V','124V','138V','144V','145V','162V','216V','228V','241V','251V','259V','314F','333V','361V'] },
      },
    },
    LW: {
      title: 'Ítems críticos de Lachar-Wrobel',
      cite: 'Lachar y Wrobel (1979); adaptación al MMPI-2 en Butcher et al. (2001)',
      series: {
        ansiedad_tension: { name: 'Ansiedad y tensión', items: ['15V','17V','172V','218V','223F','261F','299V','301V','320V','405F','463V'] },
        sueno: { name: 'Alteraciones del sueño', items: ['5V','30V','39V','140F','328V','471V'] },
        pensamiento_desviado: { name: 'Pensamiento y experiencia desviados', items: ['32V','60V','96V','122V','198V','298V','307V','316V','319V','427F'] },
        antisocial: { name: 'Actitud antisocial', items: ['27V','35V','84V','105V','227V','240V','254V','266F','324V'] },
        ira: { name: 'Problemas de ira', items: ['85V','134V','213V','389V'] },
        somaticos: { name: 'Síntomas somáticos', items: ['18V','28V','33F','40V','44V','47F','53V','57F','59V','101V','111V','142F','159F','164F','175V','176F','182V','224F','229V','247V','255F','295F','464V'] },
        depresion_preocupacion: { name: 'Depresión y preocupación', items: ['2F','3F','10F','65V','73V','75F','130V','150V','165F','180V','273V','303V','339V','411V','415V','454V'] },
        creencias_desviadas: { name: 'Creencias desviadas', items: ['42V','99V','106F','138V','144V','162V','216V','228V','259V','314F','333V','336V','355V','361V','466V'] },
        sustancias: { name: 'Abuso de sustancias', items: ['168V','264V','429F'] },
        familia: { name: 'Conflictos familiares', items: ['21V','83F','125F','288V'] },
        sexual: { name: 'Preocupación y desviación sexual', items: ['12F','34F','62*','121F','166V','268V'] },
      },
    },
  },

  /* Ítems de contenido suicida explícito (exigen indagación directa si se reconocen) */
  EXPLICIT_SUICIDE: [506, 520, 524],
  RELATED_SUICIDE: [150, 303],

  _parse(code, sex) {
    // '62*' → ítem 62, V en varones (H) y F en mujeres (M)
    const m = /^(\d+)([VF*])$/.exec(code);
    if (!m) return null;
    const num = +m[1];
    const dir = m[2] === '*' ? (sex === 'M' ? 'F' : 'V') : m[2];
    return { num, dir };
  },

  _text(num) {
    const arr = window.__ITEMS__;
    if (!Array.isArray(arr)) return '';
    const it = arr[num - 1] && arr[num - 1].num === num ? arr[num - 1] : arr.find(x => x && x.num === num);
    return it ? String(it.text || '').trim().replace(/[,;]\s*$/, '') : '';
  },

  hasResponses(responses) {
    return Array.isArray(responses) && responses.some(r => r === 1 || r === 2);
  },

  /* Concentración descriptiva (no normativa) */
  concentration(n, total) {
    if (!n) return { key: 'none', label: 'Ninguno' };
    const p = n / total;
    // Con una sola afirmación la concentración es siempre "aislada", aunque la serie sea corta
    if (n >= 2 && p >= 0.5) return { key: 'high', label: 'Marcada' };
    if (n >= 2 && p >= 0.25) return { key: 'mid', label: 'Moderada' };
    return { key: 'low', label: 'Aislada' };
  },

  /* Calcula todas las series: ítems reconocidos en la dirección clave */
  compute(responses, sex) {
    if (!this.hasResponses(responses)) return null;
    const out = { sets: {}, omittedCritical: 0 };
    const omitted = new Set();
    for (const [setKey, set] of Object.entries(this.SETS)) {
      const list = [];
      for (const [key, s] of Object.entries(set.series)) {
        const items = s.items.map(c => this._parse(c, sex)).filter(Boolean);
        const endorsed = [];
        let omit = 0;
        for (const it of items) {
          const r = responses[it.num - 1];
          if (r !== 1 && r !== 2) { omit++; omitted.add(it.num); continue; }
          const ans = r === 1 ? 'V' : 'F';
          if (ans === it.dir) endorsed.push({ num: it.num, dir: it.dir, text: this._text(it.num) });
        }
        const conc = this.concentration(endorsed.length, items.length);
        list.push({ key, name: s.name, total: items.length, n: endorsed.length, omitted: omit, endorsed, conc });
      }
      out.sets[setKey] = { title: set.title, cite: set.cite, series: list };
    }
    out.omittedCritical = omitted.size;
    const endorsedNums = new Set();
    Object.values(out.sets).forEach(s => s.series.forEach(x => x.endorsed.forEach(e => endorsedNums.add(e.num))));
    out.explicitSuicide = this.EXPLICIT_SUICIDE.filter(n => {
      const r = responses[n - 1]; return r === 1;
    });
    out.relatedSuicide = this.RELATED_SUICIDE.filter(n => {
      const r = responses[n - 1]; return r === 1;
    });
    out.totalEndorsed = endorsedNums.size;
    return out;
  },

  _series(crit, set, key) {
    return crit && crit.sets[set] ? crit.sets[set].series.find(s => s.key === key) : null;
  },

  _joinNames(arr) {
    if (arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  },

  /* Párrafo interpretativo (con valores) para la sección de análisis */
  paragraph(crit, results, sex) {
    if (!crit) return '';
    const I = window.Interpret;
    const fl = I ? I.validityFlags(results || {}, results && results._meta ? results._meta.omissions : null) : {};
    const ev = sex === 'M' ? 'la evaluada' : 'el evaluado';
    const parts = [];
    const kb = crit.sets.KB.series;
    const kbHit = kb.filter(s => s.n > 0);
    if (!kbHit.length) {
      parts.push(`En las seis series de ítems críticos de Koss-Butcher ${ev} no reconoció ninguna afirmación en la dirección crítica, lo que no aporta indicios adicionales de contenidos de riesgo agudo más allá de lo que describen las escalas.`);
    } else {
      const desc = kbHit.map(s => `${s.name.toLowerCase()} (${s.n} de ${s.total})`);
      parts.push(`En las series de ítems críticos de Koss-Butcher, ${ev} reconoció contenidos en ${this._joinNames(desc)}.`);
    }
    // Suicidio
    const sui = this._series(crit, 'KB', 'ideacion_suicida');
    if (crit.explicitSuicide.length) {
      parts.push(`Respondió afirmativamente a ${crit.explicitSuicide.length === 1 ? 'un ítem' : crit.explicitSuicide.length + ' ítems'} de contenido suicida explícito (ítem${crit.explicitSuicide.length > 1 ? 's' : ''} ${crit.explicitSuicide.join(', ')}), hallazgo que, con independencia del resto del perfil, obliga a una indagación directa y documentada del riesgo suicida actual (ideación, planificación, intentos previos, acceso a medios y factores de protección).`);
    } else if (sui && sui.n > 0) {
      parts.push(`Aunque no reconoció los ítems de ideación suicida explícita, los contenidos depresivos de esta serie justifican preguntar de forma directa por pensamientos de muerte o autolesión.`);
    }
    const ata = this._series(crit, 'KB', 'amenaza_ataque');
    if (ata && ata.n > 0) parts.push(`Los ítems de amenaza de ataque reconocidos (${ata.endorsed.map(e => e.num).join(', ')}) aluden a impulsos de agresión o a dificultades en el control de la ira y deben contrastarse con la historia de conducta violenta, las fuentes colaterales y el contexto de la evaluación.`);
    const per = this._series(crit, 'KB', 'persecucion');
    const con = this._series(crit, 'KB', 'confusion_mental');
    if ((per && per.conc.key !== 'none' && per.conc.key !== 'low') || (con && con.conc.key !== 'none' && con.conc.key !== 'low')) {
      parts.push('La concentración de contenidos de ' + [per && per.n >= per.total * 0.25 ? 'tipo persecutorio' : null, con && con.n >= con.total * 0.25 ? 'confusión mental' : null].filter(Boolean).join(' y ') + ' merece ser explorada en entrevista para distinguir entre suspicacia ligada a la situación actual, experiencias perceptivas o cognitivas inusuales y desorganización del pensamiento.');
    }
    const alc = this._series(crit, 'KB', 'estres_alcohol');
    if (alc && alc.endorsed.some(e => [264, 487, 489, 502, 511].includes(e.num))) parts.push('El reconocimiento de ítems sobre consumo de alcohol u otras sustancias indica la conveniencia de una valoración específica del patrón de consumo.');
    // Lachar-Wrobel
    const lw = crit.sets.LW.series.filter(s => s.conc.key === 'high' || s.conc.key === 'mid');
    if (lw.length) parts.push(`En la clasificación de Lachar-Wrobel, las áreas con mayor concentración de ítems reconocidos son ${this._joinNames(lw.map(s => `${s.name.toLowerCase()} (${s.n} de ${s.total})`))}.`);
    // Validez
    if (fl.overInvalid || fl.overPossible) parts.push('Dado que las escalas de infrecuencia sugieren una posible exageración de síntomas, la cantidad de ítems críticos reconocidos puede estar sobredimensionada y no debe leerse como confirmación de psicopatología.');
    else if (fl.under || fl.underInvalid) parts.push('Dado el estilo defensivo del protocolo, la ausencia o escasez de ítems críticos no permite descartar los contenidos que exploran.');
    parts.push('Los ítems críticos no son escalas ni tienen puntos de corte normativos; cada respuesta es un contenido concreto que debe verificarse en entrevista, pues una sola afirmación puede deberse a una lectura errónea, a una experiencia pasada o a un malentendido.');
    return parts.join(' ');
  },

  /* Frase para la síntesis integradora (sin valores ni siglas) */
  synthesisSentence(crit, invalid, results) {
    if (!crit) return '';
    const Tv = (c) => (window.Interpret && results) ? Interpret.T(results, c) : null;
    const moodLow = results && [Tv('D'), Tv('DEP')].every(t => t == null || t < 65) && [Tv('D'), Tv('DEP')].some(t => t != null);
    const kbHit = crit.sets.KB.series.filter(s => s.conc.key === 'mid' || s.conc.key === 'high').map(s => s.name.toLowerCase());
    const bits = [];
    if (crit.explicitSuicide.length) bits.push((invalid ? 'Aun con esas limitaciones, reconoció' : (moodLow ? 'Pese a que las medidas de ánimo no muestran elevación, reconoció' : 'Reconoció')) + ' pensamientos de contenido suicida que, por su gravedad potencial, requieren una valoración directa del riesgo' + (moodLow && !invalid ? '; esa discrepancia no reduce su relevancia y debe esclarecerse en entrevista' : '') + '.');
    if (invalid) return bits.join(' ');
    if (kbHit.length) bits.push(`Entre las afirmaciones de mayor relevancia clínica que reconoció destacan las relativas a ${this._joinNames(kbHit)}, que conviene explorar en entrevista.`);
    return bits.join(' ');
  },

  /* Recomendaciones derivadas */
  recommendations(crit) {
    if (!crit) return [];
    const r = [];
    if (crit.explicitSuicide.length || crit.relatedSuicide.length) r.push('Realizar una valoración directa y estructurada del riesgo suicida (ideación, plan, intentos previos, acceso a medios y factores protectores), dado el reconocimiento de ítems críticos de contenido suicida, y documentar sus resultados.');
    const ata = this._series(crit, 'KB', 'amenaza_ataque');
    if (ata && ata.n >= 2) r.push('Explorar antecedentes de conducta agresiva y control de impulsos, contrastando con fuentes colaterales, a partir de los ítems críticos de amenaza de ataque reconocidos.');
    const alc = this._series(crit, 'KB', 'estres_alcohol');
    if (alc && alc.endorsed.some(e => [264, 487, 489, 502, 511].includes(e.num))) r.push('Indagar el patrón de consumo de alcohol y otras sustancias con una entrevista o instrumento específico.');
    return r;
  },

  /* Bloque de texto para el prompt de IA */
  promptBlock(crit) {
    if (!crit) return '═ ÍTEMS CRÍTICOS ═\nNo se dispone de las respuestas ítem a ítem (caso cargado solo con puntuaciones), por lo que no consta información de ítems críticos.';
    const L = ['═ ÍTEMS CRÍTICOS (Apéndice D del manual: Koss-Butcher revisados y Lachar-Wrobel) ═',
      'No son escalas ni tienen puntos de corte normativos; son contenidos que el evaluado reconoció en la dirección crítica y que deben explorarse en entrevista. "Concentración" es descriptiva (proporción de ítems reconocidos).'];
    for (const set of Object.values(crit.sets)) {
      L.push(`-- ${set.title} --`);
      for (const s of set.series) {
        L.push(`- ${s.name}: ${s.n}/${s.total} (concentración ${s.conc.label.toLowerCase()})` + (s.n ? ': ' + s.endorsed.map(e => `${e.num}${e.dir} «${e.text}»`).join('; ') : ''));
      }
    }
    if (crit.explicitSuicide.length) L.push(`ALERTA: ítems de contenido suicida explícito reconocidos: ${crit.explicitSuicide.join(', ')}. Debe recomendarse valoración directa del riesgo suicida.`);
    if (crit.omittedCritical) L.push(`Ítems críticos omitidos (sin respuesta): ${crit.omittedCritical}.`);
    return L.join('\n');
  },
};

window.Critical = Critical;

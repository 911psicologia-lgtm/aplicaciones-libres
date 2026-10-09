/* ============================================
   Interpret — redacción interpretativa del MMPI-2
   - Base de conocimiento por escala (nombre, descriptores por nivel,
     dominios clínicos para la síntesis integradora)
   - Párrafo interpretativo por grupo (con valores T)
   - Análisis: validez, distribución, código de dos puntos,
     configuraciones, comparación, recomendaciones
   - Síntesis integradora final (sin valores ni siglas)

   Fuentes de los descriptores (reales y verificables):
   · Butcher, J. N., Graham, J. R., Ben-Porath, Y. S., Tellegen, A.,
     Dahlstrom, W. G., & Kaemmer, B. (2001). MMPI-2: Manual for
     administration, scoring, and interpretation (Rev. ed.).
     University of Minnesota Press.
   · Graham, J. R. (2012). MMPI-2: Assessing personality and
     psychopathology (5th ed.). Oxford University Press.
   · Friedman, A. F., Bolinskey, P. K., Levak, R. W., & Nichols, D. S.
     (2015). Psychological assessment with the MMPI-2/MMPI-2-RF
     (3rd ed.). Routledge.
   Marcador de género: {o|a} → masculino|femenino según el sexo del caso.
   ============================================ */

const Interpret = {

  /* Umbrales de lectura (convención MMPI-2: T ≥ 65 clínicamente significativo) */
  CUT: { marked: 75, sig: 65, mod: 60, low: 39 },

  DOMAINS: {
    somatico:      'el área somática',
    afectivo:      'el área emocional',
    pensamiento:   'el funcionamiento cognitivo y perceptivo',
    interpersonal: 'las relaciones interpersonales',
    control:       'la regulación de la conducta y los impulsos',
    familiar:      'la vida familiar y de pareja',
    laboral:       'el ámbito laboral',
    trauma:        'la vivencia de experiencias estresantes',
    personalidad:  'el estilo de personalidad',
  },

  /* ---------- Base de conocimiento ----------
     n: nombre sin sigla · s: descriptor breve · hi: lectura de la elevación
     f: rasgos para la síntesis [[dominio, frase]] · lo / loF: lectura de puntuación baja
     fav: true si la elevación es un recurso (no un problema)
     parent: escala madre (subescalas) */
  KB: {
    // ---- Clínicas básicas ----
    Hs: { n: 'Hipocondría', s: 'preocupación por la salud y quejas somáticas',
      hi: 'preocupación excesiva por el funcionamiento corporal, quejas físicas múltiples y poco específicas, y tendencia a expresar el malestar psicológico a través de síntomas somáticos',
      f: [['somatico', 'una preocupación persistente por la salud física'], ['somatico', 'quejas corporales diversas y poco específicas'], ['somatico', 'una tendencia a canalizar el malestar emocional a través del cuerpo']] },
    D: { n: 'Depresión', s: 'ánimo bajo, desánimo y pesimismo',
      hi: 'un estado de ánimo deprimido, con tristeza, pesimismo, sentimientos de inutilidad, baja energía y pérdida de interés por las actividades habituales',
      f: [['afectivo', 'ánimo decaído y pesimismo'], ['afectivo', 'pérdida de energía y de interés']],
      lo: 'un ánimo sin malestar depresivo y una actitud optimista' },
    Hy: { n: 'Histeria de conversión', s: 'reacción somática al estrés y necesidad de aprobación',
      hi: 'una tendencia a reaccionar al estrés con síntomas físicos, uso de la negación como defensa, necesidad marcada de aprobación y afecto, y escasa conciencia de los propios conflictos emocionales',
      f: [['somatico', 'síntomas físicos que se intensifican en momentos de tensión'], ['interpersonal', 'una necesidad intensa de aprobación y afecto'], ['personalidad', 'poca conciencia de los propios conflictos emocionales']] },
    Pd: { n: 'Desviación psicopática', s: 'insatisfacción, conflicto con normas y alienación',
      hi: 'insatisfacción con las relaciones familiares y sociales, dificultad para ajustarse a normas y figuras de autoridad, resentimiento e impulsividad; en contextos de conflicto reciente puede reflejar enojo situacional más que un rasgo estable',
      f: [['interpersonal', 'insatisfacción y resentimiento en sus vínculos cercanos'], ['control', 'dificultad para ajustarse a normas y exigencias externas']] },
    Mf: { n: 'Masculinidad–feminidad', s: 'patrón de intereses y roles',
      hiM: 'un patrón de intereses que se aparta de los roles tradicionalmente atribuidos a lo femenino, con un estilo directo, práctico y orientado a la acción; esta escala no mide psicopatología',
      hiH: 'intereses estéticos, culturales e intelectuales amplios, sensibilidad y apertura emocional; esta escala no mide psicopatología',
      loM: 'identificación con intereses y roles tradicionalmente femeninos',
      loH: 'identificación con intereses y roles tradicionalmente masculinos',
      fM: [['personalidad', 'un estilo directo y práctico, poco ajustado a los roles de género tradicionales']],
      fH: [['personalidad', 'sensibilidad e intereses estéticos e intelectuales amplios']] },
    Pa: { n: 'Paranoia', s: 'suspicacia e hipersensibilidad interpersonal',
      hi: 'suspicacia, hipersensibilidad a la crítica, sensación de ser tratad{o|a} injustamente y tendencia a atribuir intenciones hostiles a los demás; en elevaciones marcadas conviene explorar ideación de referencia o persecutoria',
      f: [['interpersonal', 'desconfianza e hipersensibilidad a la crítica'], ['pensamiento', 'una tendencia a interpretar la conducta ajena como hostil']] },
    Pt: { n: 'Psicastenia', s: 'ansiedad, tensión y rumiación',
      hi: 'ansiedad, tensión, preocupación constante, rumiación, inseguridad, autoexigencia elevada y sentimientos de culpa, con dificultad para concentrarse y tomar decisiones',
      f: [['afectivo', 'ansiedad, tensión y preocupación persistente'], ['afectivo', 'rumiación, autoexigencia y sentimientos de culpa']] },
    Sc: { n: 'Esquizofrenia', s: 'alienación, confusión y extrañeza',
      hi: 'sentimientos de alienación y de ser diferente, aislamiento, dificultades de concentración y memoria, confusión y, en elevaciones altas, experiencias inusuales de pensamiento o percepción; en situaciones de estrés intenso puede reflejar desorganización emocional más que un proceso psicótico',
      f: [['pensamiento', 'sensación de confusión y dificultad para organizar el pensamiento'], ['interpersonal', 'sentimientos de alienación y distancia respecto de los demás']] },
    Ma: { n: 'Hipomanía', s: 'energía elevada e impulsividad',
      hi: 'un nivel elevado de energía y actividad, aceleración, irritabilidad, impulsividad y baja tolerancia a la frustración',
      f: [['control', 'aceleración, irritabilidad e impulsividad']],
      lo: 'bajo nivel de energía y de iniciativa, que puede acompañar estados de fatiga o desánimo',
      loF: [['afectivo', 'un bajo nivel de energía y de iniciativa']] },
    Si: { n: 'Introversión social', s: 'introversión e incomodidad social',
      hi: 'introversión social: timidez, incomodidad en situaciones sociales y preferencia por estar a solas o con pocas personas',
      f: [['interpersonal', 'introversión e incomodidad en el contacto social']],
      lo: 'sociabilidad y facilidad para el contacto social', loF: [['recursos', 'la facilidad para el contacto social']] },

    // ---- Contenido ----
    ANX: { n: 'Ansiedad', s: 'ansiedad generalizada y tensión',
      hi: 'ansiedad generalizada, tensión, preocupación, problemas de sueño y sensación de estar al límite',
      f: [['afectivo', 'ansiedad generalizada, tensión y alteraciones del sueño']] },
    FRS: { n: 'Miedos', s: 'temores específicos múltiples',
      hi: 'múltiples miedos específicos (por ejemplo, a animales, lugares, situaciones o fenómenos naturales) que pueden limitar la vida cotidiana',
      f: [['afectivo', 'temores específicos múltiples']] },
    OBS: { n: 'Obsesividad', s: 'rumiación e indecisión',
      hi: 'rumiación, indecisión, dificultad para tomar decisiones y tendencia a conductas repetitivas',
      f: [['afectivo', 'rumiación e indecisión']] },
    DEP: { n: 'Depresión (contenido)', s: 'pensamientos depresivos y desesperanza',
      hi: 'pensamientos depresivos, tristeza, desesperanza y falta de energía; en elevaciones altas debe explorarse la presencia de ideación de muerte',
      f: [['afectivo', 'tristeza y desesperanza']] },
    HEA: { n: 'Preocupaciones por la salud', s: 'preocupación por síntomas físicos',
      hi: 'numerosas preocupaciones por la salud y síntomas físicos en distintos sistemas corporales',
      f: [['somatico', 'preocupación por síntomas en distintos sistemas corporales']] },
    BIZ: { n: 'Pensamiento extravagante', s: 'experiencias de pensamiento inusuales',
      hi: 'experiencias de pensamiento o percepción extrañas o inusuales que conviene explorar clínicamente',
      f: [['pensamiento', 'experiencias de pensamiento o percepción inusuales']] },
    ANG: { n: 'Enojo', s: 'dificultad para controlar la ira',
      hi: 'problemas para controlar la ira, irritabilidad e impaciencia',
      f: [['control', 'irritabilidad y dificultad para modular el enojo']] },
    CYN: { n: 'Cinismo', s: 'visión cínica de los demás',
      hi: 'una visión cínica de los demás, desconfianza y expectativa de ser utilizad{o|a}',
      f: [['interpersonal', 'una visión desconfiada de las intenciones ajenas']] },
    ASP: { n: 'Prácticas antisociales', s: 'actitudes de transgresión de normas',
      hi: 'actitudes y antecedentes de conductas que transgreden normas',
      f: [['control', 'actitudes de transgresión de normas']] },
    TPA: { n: 'Comportamiento tipo A', s: 'impaciencia y competitividad',
      hi: 'impaciencia, competitividad, irritabilidad y una orientación apremiante al trabajo y al rendimiento',
      f: [['control', 'impaciencia y presión por el rendimiento']] },
    LSE: { n: 'Baja autoestima', s: 'autoconcepto negativo',
      hi: 'baja autoestima, autoconcepto negativo e inseguridad respecto de las propias capacidades',
      f: [['afectivo', 'autoestima disminuida e inseguridad personal']] },
    SOD: { n: 'Malestar social', s: 'incomodidad en situaciones sociales',
      hi: 'malestar e incomodidad en situaciones sociales, timidez y preferencia por evitar el contacto grupal',
      f: [['interpersonal', 'incomodidad y retraimiento en situaciones sociales']] },
    FAM: { n: 'Problemas familiares', s: 'conflicto familiar',
      hi: 'discordia familiar y percepción de falta de apoyo y afecto en la familia',
      f: [['familiar', 'percepción de conflicto y de escaso apoyo familiar']],
      lo: 'una percepción del entorno familiar como armónico, que puede reflejar apoyo real o una tendencia a idealizarlo' },
    WRK: { n: 'Interferencia laboral', s: 'dificultades que afectan el desempeño laboral',
      hi: 'actitudes y dificultades que interfieren con el desempeño laboral: baja motivación, problemas de concentración y de toma de decisiones, y falta de confianza',
      f: [['laboral', 'dificultades que interfieren con el desempeño laboral']] },
    TRT: { n: 'Indicadores negativos de tratamiento', s: 'reservas frente al tratamiento',
      hi: 'actitudes negativas hacia el tratamiento, pesimismo sobre la posibilidad de cambio y dificultad para confiar en profesionales',
      f: [['tratamiento', 'reservas frente a la ayuda profesional y pesimismo sobre el cambio']] },

    // ---- Suplementarias ----
    A: { n: 'Ansiedad (Welsh)', s: 'malestar emocional general',
      hi: 'malestar emocional general, ansiedad e inseguridad, componente que comparten muchas escalas clínicas',
      f: [['afectivo', 'malestar emocional general']] },
    R: { n: 'Represión', s: 'estilo inhibido y sobrecontrolado',
      hi: 'un estilo sobrecontrolado, inhibido y convencional, con tendencia a evitar el conflicto y la expresión abierta de emociones',
      f: [['personalidad', 'un estilo inhibido, convencional y sobrecontrolado']] },
    Es: { n: 'Fuerza del yo', s: 'recursos de afrontamiento', fav: true,
      hi: 'recursos psicológicos adecuados, estabilidad y capacidad para afrontar el estrés',
      f: [['recursos', 'unos recursos de afrontamiento conservados']],
      lo: 'recursos de afrontamiento disminuidos y sensación de vulnerabilidad ante el estrés, lo que se asocia con un pronóstico más reservado en psicoterapia',
      loF: [['tratamiento', 'recursos de afrontamiento debilitados frente al estrés']] },
    'MAC-R': { n: 'Alcoholismo de MacAndrew revisada', s: 'rasgos asociados al riesgo de consumo',
      hi: 'rasgos de personalidad asociados a vulnerabilidad al uso problemático de sustancias (búsqueda de sensaciones, extraversión, impulsividad)',
      f: [['control', 'rasgos asociados a vulnerabilidad al consumo de sustancias']] },
    AAS: { n: 'Reconocimiento de adicción', s: 'reconocimiento de problemas de consumo',
      hi: 'reconocimiento abierto de problemas relacionados con el consumo de alcohol u otras sustancias',
      f: [['control', 'reconocimiento de problemas relacionados con el consumo']] },
    APS: { n: 'Potencial de adicción', s: 'potencial de adicción',
      hi: 'características compartidas por personas con problemas de consumo de sustancias',
      f: [['control', 'rasgos asociados a vulnerabilidad al consumo de sustancias']] },
    MDS: { n: 'Malestar marital', s: 'malestar en la relación de pareja',
      hi: 'malestar o insatisfacción en la relación de pareja',
      f: [['familiar', 'malestar en la relación de pareja']] },
    Ho: { n: 'Hostilidad', s: 'hostilidad y desconfianza',
      hi: 'hostilidad, cinismo y desconfianza hacia los demás',
      f: [['interpersonal', 'hostilidad y desconfianza en el trato con los demás']] },
    'O-H': { n: 'Hostilidad sobrecontrolada', s: 'contención del enojo',
      hi: 'inhibición de la expresión del enojo, que tiende a acumularse y puede manifestarse de forma ocasional e intensa',
      f: [['personalidad', 'una tendencia a contener el enojo en lugar de expresarlo']] },
    Do: { n: 'Dominancia', s: 'iniciativa y seguridad', fav: true,
      hi: 'seguridad en sí mism{o|a}, iniciativa y capacidad para influir en otros',
      f: [['recursos', 'la iniciativa y la seguridad en el trato con los demás']],
      lo: 'escasa asertividad y dificultad para sostener la propia posición',
      loF: [['interpersonal', 'dificultad para afirmarse frente a los demás']] },
    Re: { n: 'Responsabilidad social', s: 'sentido de responsabilidad', fav: true,
      hi: 'sentido de responsabilidad, compromiso con los deberes y respeto por las normas',
      f: [['recursos', 'el sentido de responsabilidad y el compromiso con sus deberes']],
      lo: 'menor compromiso con normas y responsabilidades sociales' },
    Mt: { n: 'Desajuste profesional', s: 'ineficacia y malestar ante las demandas',
      hi: 'desajuste general, sensación de ineficacia, pesimismo y malestar ante las demandas cotidianas',
      f: [['afectivo', 'sensación de ineficacia frente a las demandas']] },
    GM: { n: 'Rol de género masculino', s: 'autoconfianza', fav: true,
      hi: 'autoconfianza, ausencia de temores y rasgos tradicionalmente asociados al rol masculino',
      f: [['recursos', 'la autoconfianza']],
      lo: 'menor autoconfianza y mayor reconocimiento de temores' },
    GF: { n: 'Rol de género femenino', s: 'rasgos de rol femenino tradicional',
      hi: 'rasgos e intereses tradicionalmente asociados al rol femenino; no tiene significado patológico' },
    PK: { n: 'Estrés postraumático (Keane)', s: 'malestar asociado a vivencias estresantes',
      hi: 'malestar emocional asociado a experiencias estresantes o traumáticas: ansiedad, pensamientos intrusivos, alteraciones del sueño y sensación de vulnerabilidad',
      f: [['trauma', 'malestar compatible con vivencias estresantes o traumáticas']] },

    // ---- Subescalas de Harris-Lingoes ----
    D1: { parent: 'D', n: 'Depresión subjetiva', s: 'tristeza y falta de energía', hi: 'tristeza, falta de energía e interés, y dificultad para afrontar los problemas', f: [['afectivo', 'tristeza y desgaste para afrontar los problemas']] },
    D2: { parent: 'D', n: 'Retardo psicomotor', s: 'inmovilidad y retraimiento', hi: 'enlentecimiento, falta de energía para actuar y retraimiento', f: [['afectivo', 'enlentecimiento y falta de energía para actuar']] },
    D3: { parent: 'D', n: 'Disfunción física', s: 'preocupación por el estado físico', hi: 'preocupación por el propio funcionamiento físico', f: [['somatico', 'preocupación por el estado físico']] },
    D4: { parent: 'D', n: 'Torpeza mental', s: 'quejas cognitivas', hi: 'falta de energía mental, dificultades de concentración y de memoria, y desconfianza en el propio juicio', f: [['pensamiento', 'quejas de concentración, memoria y energía mental']] },
    D5: { parent: 'D', n: 'Rumiación', s: 'rumiación e hipersensibilidad', hi: 'rumiación, hipersensibilidad y tendencia a darle vueltas a los problemas', f: [['afectivo', 'tendencia a darle vueltas a los problemas']] },
    Hy1: { parent: 'Hy', n: 'Negación de ansiedad social', s: 'facilidad social', fav: true, hi: 'facilidad para el contacto social y negación de timidez', f: [['recursos', 'la soltura en situaciones sociales']] },
    Hy2: { parent: 'Hy', n: 'Necesidad de afecto', s: 'necesidad de afecto', hi: 'necesidad marcada de afecto y atención, con negación de sentimientos negativos hacia los demás', f: [['interpersonal', 'una necesidad intensa de aprobación y afecto']] },
    Hy3: { parent: 'Hy', n: 'Lasitud-malestar', s: 'cansancio y malestar físico', hi: 'cansancio, debilidad y sensación general de no estar bien', f: [['somatico', 'cansancio y sensación general de no estar bien']] },
    Hy4: { parent: 'Hy', n: 'Quejas somáticas', s: 'quejas somáticas múltiples', hi: 'quejas somáticas múltiples, como dolores de cabeza o molestias cardiorrespiratorias y digestivas', f: [['somatico', 'molestias físicas como cefaleas o malestar digestivo']] },
    Hy5: { parent: 'Hy', n: 'Inhibición de la agresión', s: 'negación de impulsos hostiles', hi: 'negación de impulsos hostiles o agresivos y sensibilidad a la reacción de los demás', f: [['personalidad', 'una tendencia a contener el enojo en lugar de expresarlo']] },
    Pd1: { parent: 'Pd', n: 'Discordia familiar', s: 'conflicto familiar', hi: 'percepción de la familia como poco afectuosa y conflictiva', f: [['familiar', 'percepción de conflicto y de escaso apoyo familiar']] },
    Pd2: { parent: 'Pd', n: 'Problemas con la autoridad', s: 'resentimiento ante la autoridad', hi: 'resentimiento ante normas y figuras de autoridad', f: [['control', 'dificultad para ajustarse a normas y exigencias externas']] },
    Pd3: { parent: 'Pd', n: 'Imperturbabilidad social', s: 'seguridad social', fav: true, hi: 'comodidad y seguridad en situaciones sociales', f: [['recursos', 'la soltura en situaciones sociales']] },
    Pd4: { parent: 'Pd', n: 'Alienación social', s: 'sentirse incomprendid{o|a}', hi: 'sensación de ser incomprendid{o|a}, de estar aislad{o|a} y poco apoyad{o|a} por los demás', f: [['interpersonal', 'sensación de incomprensión y escaso apoyo']] },
    Pd5: { parent: 'Pd', n: 'Autoalienación', s: 'insatisfacción consigo mism{o|a}', hi: 'insatisfacción consigo mism{o|a}, culpa y arrepentimiento', f: [['afectivo', 'insatisfacción consigo mism{o|a} y culpa']] },
    Pa1: { parent: 'Pa', n: 'Ideas persecutorias', s: 'sensación de trato injusto', hi: 'sensación de ser tratad{o|a} injustamente o perjudicad{o|a} por otros', f: [['interpersonal', 'sensación de haber sido tratad{o|a} injustamente']] },
    Pa2: { parent: 'Pa', n: 'Hipersensibilidad', s: 'sensibilidad emocional intensa', hi: 'sensibilidad emocional intensa y sensación de verse más afectad{o|a} que los demás', f: [['afectivo', 'una sensibilidad emocional intensa']] },
    Pa3: { parent: 'Pa', n: 'Ingenuidad', s: 'confianza ingenua', hi: 'una visión confiada de los demás y estándares morales elevados' },
    Sc1: { parent: 'Sc', n: 'Alienación social', s: 'sentirse rechazad{o|a}', hi: 'sensación de ser incomprendid{o|a}, rechazad{o|a} y aislad{o|a}', f: [['interpersonal', 'sensación de incomprensión y escaso apoyo']] },
    Sc2: { parent: 'Sc', n: 'Alienación emocional', s: 'distanciamiento afectivo', hi: 'distanciamiento afectivo, apatía o desesperanza', f: [['afectivo', 'distanciamiento afectivo y apatía']] },
    Sc3: { parent: 'Sc', n: 'Falta de dominio cognitivo del yo', s: 'sensación de perder el control del pensamiento', hi: 'sensación de pérdida de control sobre el propio pensamiento, dificultades de concentración y de memoria, y vivencias de extrañeza', f: [['pensamiento', 'sensación de perder el control sobre el propio pensamiento']] },
    Sc4: { parent: 'Sc', n: 'Falta de dominio conativo del yo', s: 'falta de motivación', hi: 'falta de energía y de motivación, y sensación de que la vida es una carga', f: [['afectivo', 'falta de motivación y vivencia de la vida como una carga']] },
    Sc5: { parent: 'Sc', n: 'Falta de inhibición', s: 'sensación de descontrol emocional', hi: 'sensación de pérdida de control sobre emociones e impulsos', f: [['control', 'sensación de descontrol emocional']] },
    Sc6: { parent: 'Sc', n: 'Experiencias sensoriales extrañas', s: 'experiencias perceptivas inusuales', hi: 'experiencias corporales o perceptivas inusuales', f: [['pensamiento', 'experiencias de pensamiento o percepción inusuales']] },
    Ma1: { parent: 'Ma', n: 'Amoralidad', s: 'actitud utilitaria', hi: 'una actitud utilitaria y cierta justificación del engaño', f: [['control', 'actitudes de transgresión de normas']] },
    Ma2: { parent: 'Ma', n: 'Aceleración psicomotora', s: 'aceleración e inquietud', hi: 'aceleración, inquietud y necesidad de actividad', f: [['control', 'aceleración, irritabilidad e impulsividad']] },
    Ma3: { parent: 'Ma', n: 'Imperturbabilidad', s: 'despreocupación por la opinión ajena', hi: 'negación de ansiedad social y despreocupación por la opinión ajena' },
    Ma4: { parent: 'Ma', n: 'Autoenvanecimiento', s: 'autoimagen exagerada', hi: 'una autoimagen exagerada y resentimiento ante las exigencias de otros', lo: 'una actitud modesta, sin sobrevaloración de sí mism{o|a}' },
    Si1: { parent: 'Si', n: 'Timidez', s: 'timidez', hi: 'timidez e incomodidad en situaciones sociales', f: [['interpersonal', 'introversión e incomodidad en el contacto social']], lo: 'comodidad y soltura en situaciones sociales' },
    Si2: { parent: 'Si', n: 'Evitación social', s: 'evitación social', hi: 'evitación activa de actividades grupales y sociales', f: [['interpersonal', 'tendencia a evitar actividades grupales']] },
    Si3: { parent: 'Si', n: 'Alienación de sí y de otros', s: 'baja autoestima y desconfianza', hi: 'baja autoestima, desconfianza y sensación de ser poco valorad{o|a}', f: [['afectivo', 'autoestima disminuida e inseguridad personal']] },
  },

  /* Código de dos puntos (descriptores breves, Graham, 2012) */
  CODE_TYPES: {
    '12': 'malestar somático acompañado de ánimo depresivo, fatiga y tensión',
    '13': 'tendencia a expresar el estrés mediante síntomas físicos, con negación de dificultades psicológicas y necesidad de aprobación',
    '18': 'quejas somáticas acompañadas de sentimientos de alienación, desconfianza y posibles dificultades para organizar el pensamiento y las relaciones',
    '23': 'depresión con ansiedad, fatiga, inhibición y sentimientos de inadecuación',
    '24': 'malestar depresivo asociado a dificultades con normas e impulsividad, frecuente cuando la persona enfrenta consecuencias de su conducta',
    '27': 'ansiedad, depresión, tensión, rumiación, autoexigencia y culpa',
    '28': 'depresión con ansiedad, dificultades de concentración y sensación de pérdida de control; conviene explorar ideación suicida',
    '34': 'enojo crónico con control insuficiente y dificultades interpersonales',
    '36': 'enojo y resentimiento no reconocidos, especialmente hacia figuras cercanas',
    '46': 'resentimiento, suspicacia e hipersensibilidad a la crítica, con dificultades en las relaciones',
    '47': 'alternancia entre conductas impulsivas y sentimientos de culpa',
    '48': 'alienación, desconfianza y dificultades en las relaciones y en el control de impulsos',
    '49': 'impulsividad, búsqueda de sensaciones y dificultades con las normas',
    '68': 'suspicacia, desconfianza y posible alteración del pensamiento que requiere evaluación cuidadosa',
    '69': 'hiperactivación emocional, suspicacia y reactividad',
    '78': 'malestar intenso, rumiación, inseguridad, sentimientos de inadecuación y confusión',
    '89': 'aceleración, desorganización e ideas de grandeza',
    '17': 'ansiedad y tensión con quejas somáticas y preocupación por la salud',
    '37': 'ansiedad y quejas físicas, con negación de conflictos y necesidad de apoyo',
    '38': 'malestar psicológico con quejas somáticas, confusión y dificultades de concentración',
    '29': 'tensión y agitación con ánimo depresivo',
    '26': 'ánimo depresivo con hipersensibilidad interpersonal y resentimiento',
  },
  CLIN_NUM: { Hs: 1, D: 2, Hy: 3, Pd: 4, Mf: 5, Pa: 6, Pt: 7, Sc: 8, Ma: 9, Si: 0 },

  GROUP_ORDER: {
    Validez: ['VRIN', 'TRIN', 'F', 'Fb', 'Fp', 'L', 'K', 'S'],
    Clínicas: ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'],
    Contenido: ['ANX', 'FRS', 'OBS', 'DEP', 'HEA', 'BIZ', 'ANG', 'CYN', 'ASP', 'TPA', 'LSE', 'SOD', 'FAM', 'WRK', 'TRT'],
    Suplementarias: ['A', 'R', 'Es', 'MAC-R', 'AAS', 'APS', 'MDS', 'Ho', 'O-H', 'Do', 'Re', 'Mt', 'GM', 'GF', 'PK'],
    Subescalas: ['D1', 'D2', 'D3', 'D4', 'D5', 'Hy1', 'Hy2', 'Hy3', 'Hy4', 'Hy5', 'Pd1', 'Pd2', 'Pd3', 'Pd4', 'Pd5',
      'Pa1', 'Pa2', 'Pa3', 'Sc1', 'Sc2', 'Sc3', 'Sc4', 'Sc5', 'Sc6', 'Ma1', 'Ma2', 'Ma3', 'Ma4', 'Si1', 'Si2', 'Si3'],
  },

  VALIDITY_NAMES: {
    VRIN: 'Inconsistencia de respuestas variables', TRIN: 'Inconsistencia de respuestas verdadero', F: 'Infrecuencia',
    Fb: 'Infrecuencia posterior', Fp: 'Infrecuencia psicopatológica', L: 'Mentira', K: 'Corrección', S: 'Autopresentación superlativa',
  },

  /* ---------- Utilidades ---------- */
  g(text, sex) {
    // {o|a}: masculino|femenino. 'M' = Mujer en esta app.
    return String(text || '').replace(/\{([^|{}]*)\|([^|{}]*)\}/g, (_, m, f) => (sex === 'M' ? f : m));
  },
  subj(sex) { return sex === 'M' ? 'la evaluada' : (sex === 'H' ? 'el evaluado' : 'la persona evaluada'); },
  Subj(sex) { const s = this.subj(sex); return s.charAt(0).toUpperCase() + s.slice(1); },
  T(results, code) { const r = results && results[code]; return (r && typeof r.t === 'number') ? r.t : null; },
  name(code) { const k = this.KB[code]; return k ? k.n : (this.VALIDITY_NAMES[code] || code); },
  join(arr, conj = 'y') {
    const a = arr.filter(Boolean);
    if (a.length <= 1) return a.join('');
    const last = a[a.length - 1];
    // "e" ante palabra que empieza por i/hi (no hie/hia)
    const c = (conj === 'y' && /^(i|hi)(?!e|a)/i.test(last)) ? 'e' : conj;
    return a.slice(0, -1).join(', ') + ' ' + c + ' ' + last;
  },
  cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; },
  ref(code, t) { return `${this.name(code)} (${code}, T = ${t})`; },
  level(t) {
    if (t == null) return null;
    if (t >= this.CUT.marked) return 'marcada';
    if (t >= this.CUT.sig) return 'significativa';
    if (t >= this.CUT.mod) return 'moderada';
    if (t <= this.CUT.low) return 'baja';
    return 'normal';
  },
  hiText(code, sex) {
    const k = this.KB[code] || {};
    if (code === 'Mf') return this.g(sex === 'M' ? k.hiM : k.hiH, sex);
    return this.g(k.hi || '', sex);
  },
  loText(code, sex) {
    const k = this.KB[code] || {};
    if (code === 'Mf') return this.g(sex === 'M' ? k.loM : k.loH, sex);
    return k.lo ? this.g(k.lo, sex) : null;
  },
  feats(code, sex, low = false) {
    const k = this.KB[code] || {};
    let f = low ? k.loF : (code === 'Mf' ? (sex === 'M' ? k.fM : k.fH) : k.f);
    return (f || []).map(([d, p]) => [d, this.g(p, sex)]);
  },

  /* Estado de cada escala (para el contador de escalas documentadas) */
  coverage(results, codes) {
    const list = (codes || Object.keys(results)).map(c => results[c]).filter(r => r && r.code);
    const documented = list.filter(r => typeof r.t === 'number');
    const missing = list.filter(r => typeof r.t !== 'number').map(r => ({ code: r.code, reason: this.statusReason(r) }));
    const verify = list.filter(r => typeof r.t === 'number' && r.verify).map(r => ({ code: r.code, t: r.t, pd: r.pdk ? r.pdK : r.pd }));
    return { total: list.length, documented: documented.length, missing, verify };
  },
  statusReason(r) {
    switch (r.status) {
      case 'ES-ONLINE': return 'requiere corrección oficial (TEAcorrige)';
      case 'PD_FUERA_DE_TABLA': return 'puntuación directa fuera de la tabla del baremo';
      case 'T_NO_DISPONIBLE': return 'escala no incluida en el baremo seleccionado';
      case 'CLAVE_NO_DISPONIBLE': return 'clave de corrección no disponible';
      case 'CLAVE_INCOMPLETA': return 'falta la escala K para la corrección';
      default: return 'sin puntuación T';
    }
  },

  /* ============================================
     PÁRRAFO INTERPRETATIVO POR GRUPO (con valores)
     ============================================ */
  groupParagraph(group, results, sex) {
    if (group === 'Validez') return this.validityParagraph(results, sex);
    const codes = (this.GROUP_ORDER[group] || []).filter(c => results[c]);
    const withT = codes.filter(c => this.T(results, c) != null);
    const sig = withT.filter(c => this.T(results, c) >= this.CUT.sig).sort((a, b) => this.T(results, b) - this.T(results, a));
    const mod = withT.filter(c => { const t = this.T(results, c); return t >= this.CUT.mod && t < this.CUT.sig; }).sort((a, b) => this.T(results, b) - this.T(results, a));
    const low = withT.filter(c => this.T(results, c) <= this.CUT.low);
    const normal = withT.length - sig.length - mod.length - low.length;
    const parts = [];
    const S = this.subj(sex);

    const labels = { Clínicas: 'las escalas clínicas básicas', Contenido: 'las escalas de contenido', Suplementarias: 'las escalas suplementarias', Subescalas: 'las subescalas' };
    const verbs = ['describe', 'sugiere', 'señala', 'apunta a', 'refleja'];

    if (group === 'Subescalas') {
      parts.push('Las subescalas de Harris-Lingoes y de Introversión social precisan el contenido de las escalas clínicas y se interpretan sobre todo cuando su escala madre está elevada (T ≥ 60); en caso contrario, su lectura es orientativa.');
    }

    // Elevaciones relevantes (fav = recursos, se separan)
    const sigProb = sig.filter(c => !(this.KB[c] || {}).fav);
    const sigFav = sig.filter(c => (this.KB[c] || {}).fav);
    if (sigProb.length) {
      parts.push(`En ${labels[group]}, ${sigProb.length === 1 ? 'una escala alcanza' : sigProb.length + ' escalas alcanzan'} un nivel clínicamente significativo (T ≥ 65).`);
      sigProb.forEach((c, i) => {
        const t = this.T(results, c);
        const strength = t >= this.CUT.marked ? 'marcada' : '';
        const parentNote = this._parentNote(c, results);
        const lead = i === 0
          ? `La elevación${strength ? ' ' + strength : ''} de ${this.ref(c, t)}`
          : `${this.cap(this.name(c))} (${c}, T = ${t})`;
        parts.push(`${lead} ${verbs[i % verbs.length]} ${this.hiText(c, sex)}${parentNote}.`);
      });
    } else if (group !== 'Subescalas' || withT.length) {
      parts.push(`Ninguna de ${labels[group]} alcanza un nivel clínicamente significativo (T ≥ 65).`);
    }
    if (mod.length) {
      const items = mod.map(c => `${this.name(c)} (${c}, T = ${this.T(results, c)}; ${this.g((this.KB[c] || {}).s || '', sex)})`);
      parts.push(`En rango moderado (T 60–64) se ${mod.length === 1 ? 'ubica' : 'ubican'} ${this.join(items)}, ${mod.length === 1 ? 'lo que indica una tendencia' : 'lo que indica tendencias'} que conviene contrastar en la entrevista.`);
    }
    if (sigFav.length) {
      const items = sigFav.map(c => `${this.name(c)} (${c}, T = ${this.T(results, c)}), que indica ${this.hiText(c, sex)}`);
      parts.push(`Como recurso, destaca ${this.join(items)}.`);
    }
    if (low.length) {
      const withMeaning = low.filter(c => this.loText(c, sex));
      const without = low.filter(c => !this.loText(c, sex));
      withMeaning.forEach(c => parts.push(`La puntuación baja en ${this.ref(c, this.T(results, c))} indica ${this.loText(c, sex)}.`));
      if (without.length) {
        parts.push(`${without.length === 1 ? 'La puntuación baja' : 'Las puntuaciones bajas'} en ${this.join(without.map(c => `${this.name(c)} (${c}, T = ${this.T(results, c)})`))} ${without.length === 1 ? 'señala' : 'señalan'} ausencia de las dificultades que ${without.length === 1 ? 'mide la escala' : 'miden esas escalas'}.`);
      }
    }
    if (normal > 0) {
      parts.push(normal === withT.length
        ? `Todas las escalas del grupo se sitúan en el rango esperado (T 40–59).`
        : `${normal === 1 ? 'La escala restante se mantiene' : 'Las ' + normal + ' escalas restantes se mantienen'} dentro del rango esperado (T 40–59).`);
    }
    if (group === 'Clínicas') {
      const ct = this.codeType(results);
      if (ct) parts.push(ct.sentence);
    }
    const cov = this.coverage(results, codes);
    if (cov.verify.length) {
      parts.push(`${cov.verify.length === 1 ? 'La puntuación' : 'Las puntuaciones'} de ${this.join(cov.verify.map(v => `${v.code} (T = ${v.t})`))}, marcada${cov.verify.length === 1 ? '' : 's'} con asterisco, ${cov.verify.length === 1 ? 'cae' : 'caen'} en un tramo de la tabla del baremo con inconsistencias y ${cov.verify.length === 1 ? 'debe' : 'deben'} confirmarse en el manual o en el sistema oficial de corrección antes de sustentar conclusiones.`);
    }
    if (cov.missing.length) {
      parts.push(`No fue posible obtener la puntuación T de ${this.join(cov.missing.map(m => `${m.code} (${m.reason})`))}.`);
    }
    return this._clean(parts.join(' '));
  },

  _parentNote(code, results) {
    const k = this.KB[code] || {};
    if (!k.parent) return '';
    const pt = this.T(results, k.parent);
    if (pt == null) return '';
    return pt >= 60 ? `, coherente con la elevación de su escala madre (${k.parent}, T = ${pt})` : `; dado que su escala madre no está elevada (${k.parent}, T = ${pt}), su lectura es orientativa`;
  },

  _clean(s) {
    return s.replace(/\b([Aa]) el\b/g, '$1l').replace(/\b([Dd])e el\b/g, '$1el').replace(/\s+/g, ' ').replace(/\s+([.,;])/g, '$1').replace(/\.\./g, '.').trim();
  },

  /* ---------- Validez (párrafo con valores) ---------- */
  validityFlags(results, omissions) {
    const t = (c) => this.T(results, c);
    const F = t('F'), Fb = t('Fb'), Fp = t('Fp'), L = t('L'), K = t('K'), S = t('S'), V = t('VRIN'), TR = t('TRIN');
    const fk = (results.F && results.K && results.F.pd != null && results.K.pd != null) ? results.F.pd - results.K.pd : null;
    return {
      F, Fb, Fp, L, K, S, V, TR, fk, omissions,
      invalidOmit: omissions != null && omissions >= 30,
      cautionOmit: omissions != null && omissions >= 10 && omissions < 30,
      inconsistent: (V != null && V >= 80) || (TR != null && TR >= 80),
      someInconsistency: (V != null && V >= 70 && V < 80) || (TR != null && TR >= 70 && TR < 80),
      overInvalid: (F != null && F >= 100) || (Fp != null && Fp >= 100),
      overPossible: (F != null && F >= 80 && F < 100) || (Fp != null && Fp >= 70 && Fp < 100) || (fk != null && fk >= 11),
      openDistress: F != null && F >= 65 && F < 80,
      underInvalid: L != null && L >= 80,
      under: (L != null && L >= 65 && L < 80) || (K != null && K >= 65) || (S != null && S >= 70) || (fk != null && fk <= -11),
      selfCritical: K != null && K <= 40,
    };
  },

  /* Veredicto único de validez (usado en todo el informe):
     combina la puerta del motor (assessValidity) con los criterios
     clásicos de Graham (2012): Fp ≥ 100, F ≥ 100, L ≥ 80, VRIN/TRIN ≥ 80, omisiones ≥ 30. */
  verdict(results) {
    const v = window.MMPI2 ? MMPI2.assessValidity(results) : { status: 'INTERPRETABLE', reasons: [] };
    const fl = this.validityFlags(results, results._meta ? results._meta.omissions : null);
    const reasons = (v.reasons || []).filter(r => !/dentro de límites aceptables/i.test(r));
    if (fl.overInvalid) reasons.push('Las escalas de infrecuencia alcanzan T ≥ 100, compatible con exageración marcada de síntomas.');
    if (fl.inconsistent && !reasons.some(r => /VRIN/.test(r))) reasons.push('Los indicadores de consistencia (VRIN/TRIN) alcanzan T ≥ 80.');
    let status = v.status;
    if (fl.overInvalid || fl.inconsistent || fl.underInvalid || fl.invalidOmit) status = 'NO_INTERPRETABLE';
    else if (status === 'INTERPRETABLE' && (fl.overPossible || fl.under || fl.someInconsistency || fl.cautionOmit)) status = 'INTERPRETABLE_CON_CAUTELA';
    const label = status === 'NO_INTERPRETABLE' ? 'no interpretable' : (status === 'INTERPRETABLE_CON_CAUTELA' ? 'interpretable con cautela' : 'válido e interpretable');
    return { status, label, reasons: reasons.length ? reasons : ['Protocolo dentro de límites aceptables.'], flags: fl };
  },

  validityParagraph(results, sex) {
    const fl = this.validityFlags(results, results._meta ? results._meta.omissions : null);
    const S = this.subj(sex);
    const parts = [];
    if (fl.omissions != null) {
      parts.push(fl.omissions === 0
        ? `${this.cap(S)} respondió la totalidad de los 567 ítems.`
        : `Quedaron ${fl.omissions} ítem(s) sin responder${fl.invalidOmit ? ', cifra que compromete la validez del protocolo' : (fl.cautionOmit ? ', lo que aconseja cautela en la interpretación' : ', cifra que no compromete la validez')}.`);
    }
    // Consistencia
    if (fl.V != null || fl.TR != null) {
      const vals = [];
      if (fl.V != null) vals.push(`VRIN, T = ${fl.V}`);
      if (fl.TR != null) vals.push(`TRIN, T = ${fl.TR}`);
      if (fl.inconsistent) parts.push(`Los indicadores de consistencia (${vals.join('; ')}) señalan respuestas inconsistentes o con una tendencia indiscriminada a responder en una misma dirección, lo que invalida la lectura del perfil.`);
      else if (fl.someInconsistency) parts.push(`Los indicadores de consistencia (${vals.join('; ')}) muestran cierta inconsistencia, sin alcanzar el nivel invalidante.`);
      else parts.push(`Los indicadores de consistencia (${vals.join('; ')}) muestran que respondió de forma coherente y atenta al contenido de los ítems.`);
    }
    // Sobrerreporte
    const fVals = [];
    if (fl.F != null) fVals.push(`F, T = ${fl.F}`);
    if (fl.Fb != null) fVals.push(`Fb, T = ${fl.Fb}`);
    if (fl.Fp != null) fVals.push(`Fp, T = ${fl.Fp}`);
    if (fVals.length) {
      if (fl.overInvalid) parts.push(`Las escalas de infrecuencia (${fVals.join('; ')}) alcanzan niveles que sugieren una exageración marcada de síntomas, por lo que el perfil clínico no debe interpretarse sin corroboración externa.`);
      else if (fl.overPossible) parts.push(`Las escalas de infrecuencia (${fVals.join('; ')}) indican el reconocimiento de un número elevado de síntomas poco frecuentes; este patrón puede reflejar malestar intenso o una petición de ayuda, pero también cierta amplificación de las dificultades, de modo que la magnitud de las elevaciones clínicas debe ponderarse con prudencia${fl.Fp != null && fl.Fp >= 70 ? '. La elevación de Fp, menos sensible a la psicopatología genuina, refuerza esta cautela' : ''}.`);
      else if (fl.openDistress) parts.push(`Las escalas de infrecuencia (${fVals.join('; ')}) reflejan apertura para reconocer malestar psicológico, sin indicios de exageración.`);
      else parts.push(`Las escalas de infrecuencia (${fVals.join('; ')}) se sitúan en niveles esperables, sin indicios de exageración de síntomas.`);
    }
    // Infrarreporte
    const dVals = [];
    if (fl.L != null) dVals.push(`L, T = ${fl.L}`);
    if (fl.K != null) dVals.push(`K, T = ${fl.K}`);
    if (fl.S != null) dVals.push(`S, T = ${fl.S}`);
    if (dVals.length) {
      if (fl.underInvalid) parts.push(`Las escalas de defensividad (${dVals.join('; ')}) indican una presentación excesivamente favorable que impide interpretar el perfil.`);
      else if (fl.under) parts.push(`Las escalas de defensividad (${dVals.join('; ')}) muestran una tendencia a presentarse de forma favorable y a minimizar problemas, lo que puede atenuar las elevaciones clínicas.`);
      else if (fl.selfCritical) parts.push(`Las escalas de defensividad (${dVals.join('; ')}) describen una actitud autocrítica y pocos recursos defensivos.`);
      else parts.push(`Las escalas de defensividad (${dVals.join('; ')}) no muestran intentos de minimizar problemas ni de ofrecer una imagen idealizada.`);
    }
    if (fl.fk != null) {
      const sign = fl.fk > 0 ? '+' : '';
      parts.push(`El índice F − K (puntuaciones directas) es ${sign}${fl.fk}${fl.fk >= 11 ? ', en la dirección de la exageración' : (fl.fk <= -11 ? ', en la dirección de la defensividad' : ', dentro del rango esperado')}.`);
    }
    parts.push(`En conjunto, el protocolo se considera ${this.verdict(results).label}.`);
    return this._clean(parts.join(' '));
  },

  /* ---------- Código de dos puntos ---------- */
  codeType(results) {
    const clin = ['Hs', 'D', 'Hy', 'Pd', 'Pa', 'Pt', 'Sc', 'Ma']; // Mf y Si excluidas de la codificación
    const arr = clin.map(c => ({ c, t: this.T(results, c) })).filter(x => x.t != null).sort((a, b) => b.t - a.t);
    if (!arr.length || arr[0].t < this.CUT.sig) return null;
    const a = arr[0], b = arr[1], c = arr[2];
    if (!b || b.t < this.CUT.sig) {
      return {
        code: String(this.CLIN_NUM[a.c]), scales: [a.c], defined: !b || (a.t - b.t >= 5),
        sentence: `El perfil clínico presenta una única elevación significativa (código de un punto ${this.CLIN_NUM[a.c]}), centrada en ${this.name(a.c).toLowerCase()}.`,
        desc: this.KB[a.c].s,
      };
    }
    const nums = [this.CLIN_NUM[a.c], this.CLIN_NUM[b.c]];
    const key = nums.slice().sort((x, y) => x - y).join('');
    const defined = !c || (b.t - c.t >= 5);
    const desc = this.CODE_TYPES[key] || `una combinación de ${this.KB[a.c].s} y ${this.KB[b.c].s}`;
    const codeStr = nums.join('-');
    let sentence = `Excluidas Mf y Si, que no se consideran en la codificación, el código de dos puntos es ${codeStr} (${a.c}-${b.c}), asociado en la literatura a ${desc}.`;
    if (!defined) sentence += ` El código no está bien definido, porque la tercera escala (${c.c}, T = ${c.t}) dista menos de cinco puntos de la segunda; por ello, las descripciones del código deben leerse junto con las de esa escala.`;
    return { code: codeStr, scales: [a.c, b.c], third: c ? c.c : null, defined, desc, sentence };
  },

  /* ---------- Configuraciones clásicas ---------- */
  configs(results) {
    const t = (c) => this.T(results, c);
    const Hs = t('Hs'), D = t('D'), Hy = t('Hy'), Pd = t('Pd'), Pa = t('Pa'), Sc = t('Sc'), Ma = t('Ma'), L = t('L'), F = t('F'), K = t('K'), Pt = t('Pt');
    const out = [];
    if (Hs != null && Hy != null && D != null && Hs >= 65 && Hy >= 65 && D < Math.min(Hs, Hy) - 5) out.push({ name: 'V de conversión', desc: 'Hipocondría e Histeria elevadas por encima de Depresión: tendencia a expresar el malestar en síntomas físicos con menor reconocimiento del componente emocional.' });
    if (F != null && L != null && K != null && F > 70 && L < 50 && K < 50) out.push({ name: 'Perfil de petición de ayuda', desc: 'F elevada con L y K bajas: reconocimiento abierto de malestar; contrastar con la entrevista la posible amplificación de síntomas.' });
    if (Pd != null && Ma != null && Pd >= 65 && Ma >= 65) out.push({ name: 'Configuración 4-9', desc: 'Impulsividad, búsqueda de sensaciones y dificultades con las normas.' });
    if (Pa != null && Sc != null && Pa >= 65 && Sc >= 65) out.push({ name: 'Elevación conjunta de Paranoia y Esquizofrenia', desc: 'Suspicacia y posible alteración del pensamiento: valorar ideación paranoide.' });
    if (Pt != null && Sc != null && Pt >= 65 && Sc >= 65) out.push({ name: 'Elevación conjunta de Psicastenia y Esquizofrenia', desc: 'Malestar intenso, rumiación, inseguridad y dificultades de concentración; con Pt próxima o superior a Sc predomina el componente ansioso.' });
    if (L != null && K != null && F != null && L > 60 && K > 60 && F < 50) out.push({ name: 'Perfil defensivo', desc: 'L y K elevadas con F baja: minimización de problemas; las elevaciones clínicas pueden estar atenuadas.' });
    return out;
  },

  /* ---------- Distribución por grupo ---------- */
  distribution(results) {
    const rows = [];
    for (const g of ['Validez', 'Clínicas', 'Contenido', 'Suplementarias', 'Subescalas']) {
      const codes = this.GROUP_ORDER[g].filter(c => results[c]);
      const ts = codes.map(c => this.T(results, c)).filter(t => t != null);
      rows.push({
        group: g, total: codes.length, documented: ts.length,
        vh: ts.filter(t => t >= 70).length, h: ts.filter(t => t >= 60 && t < 70).length,
        ps: ts.filter(t => t >= 56 && t < 60).length, m: ts.filter(t => t >= 40 && t < 56).length,
        lo: ts.filter(t => t < 40).length,
      });
    }
    return rows;
  },

  distributionParagraph(results, sex) {
    const d = this.distribution(results).filter(r => r.group !== 'Validez');
    const tot = d.reduce((a, r) => ({ n: a.n + r.documented, vh: a.vh + r.vh, h: a.h + r.h, lo: a.lo + r.lo }), { n: 0, vh: 0, h: 0, lo: 0 });
    const parts = [];
    parts.push(`De las ${tot.n} escalas sustantivas con puntuación T (clínicas, de contenido, suplementarias y subescalas), ${tot.vh} se sitúan en rango muy alto (T ≥ 70), ${tot.h} en rango alto (T 60–69) y ${tot.lo} en rango bajo (T ≤ 39); el resto se mantiene en rangos medios.`);
    const ranked = d.map(r => ({ g: r.group, p: r.documented ? (r.vh + r.h) / r.documented : 0, r })).sort((a, b) => b.p - a.p);
    const top = ranked[0];
    if (top && top.p > 0) {
      const glabel = { Clínicas: 'las escalas clínicas básicas', Contenido: 'las escalas de contenido', Suplementarias: 'las escalas suplementarias', Subescalas: 'las subescalas' };
      parts.push(`La mayor proporción de elevaciones se concentra en ${glabel[top.g]} (${top.r.vh + top.r.h} de ${top.r.documented}), lo que indica dónde se localiza con más claridad el malestar autoinformado.`);
      const low = ranked.filter(x => x.p === 0).map(x => glabel[x.g]);
      if (low.length) parts.push(`En ${this.join(low)} no se observan elevaciones (T ≥ 60).`);
    } else {
      parts.push('No se observan elevaciones (T ≥ 60) en ningún grupo de escalas sustantivas.');
    }
    return this._clean(parts.join(' '));
  },

  /* ---------- Escalas significativas (todas) ---------- */
  significant(results, cut = 65) {
    const groupOf = {};
    for (const [g, codes] of Object.entries(this.GROUP_ORDER)) codes.forEach(c => { groupOf[c] = g; });
    return Object.keys(groupOf)
      .filter(c => groupOf[c] !== 'Validez' && this.T(results, c) != null && this.T(results, c) >= cut && !(this.KB[c] || {}).fav && c !== 'Mf' && c !== 'GF')
      .map(c => ({ code: c, group: groupOf[c], t: this.T(results, c) }))
      .sort((a, b) => b.t - a.t);
  },

  significantParagraph(results, sex) {
    const sig = this.significant(results);
    if (!sig.length) return 'Ninguna escala sustantiva alcanza el nivel clínicamente significativo (T ≥ 65), por lo que el perfil no describe áreas de dificultad marcadas.';
    // Agrupar por dominio
    const byDom = {};
    for (const s of sig) {
      for (const [d] of this.feats(s.code, sex)) {
        if (d === 'recursos') continue;
        (byDom[d] = byDom[d] || []).push(s);
        break;
      }
    }
    const doms = Object.entries(byDom).map(([d, arr]) => ({ d, arr, max: Math.max(...arr.map(x => x.t)) })).sort((a, b) => b.max - a.max);
    const parts = [`Las ${sig.length} escalas con elevación clínicamente significativa se agrupan en ${doms.length === 1 ? 'un área' : doms.length + ' áreas'} de funcionamiento.`];
    const lst = (x) => x.arr.map(s => `${s.code}, T = ${s.t}`).join('; ');
    parts.push(`La de mayor intensidad corresponde a ${this.DOMAINS[doms[0].d]} (${lst(doms[0])}).`);
    if (doms.length > 1) {
      parts.push(`${doms.length === 2 ? 'Le sigue' : 'Le siguen, por orden de intensidad,'} ${this.join(doms.slice(1).map(x => `${this.DOMAINS[x.d]} (${lst(x)})`))}.`);
    }
    parts.push('La convergencia de varias escalas en una misma área aumenta la solidez de la hipótesis; las elevaciones aisladas requieren mayor contraste con la entrevista y otras fuentes.');
    return this._clean(parts.join(' '));
  },

  /* ---------- Comparación con aplicación previa ---------- */
  /* Rótulos de Mf según sexo de la clave/baremo usada en el informe anterior.
     TEA: Mfv = varones, Mfm = mujeres.  Manual EE. UU.: Mf-m = varones, Mf-f = mujeres.
     Ojo: «Mfm» (sin guion) es TEA-mujeres; «Mf-m» (con guion) es varones. */
  MF_ALIASES: {
    'mfv': 'H', 'mf-v': 'H', 'mfh': 'H', 'mf-h': 'H', 'mf-m': 'H', 'mfvar': 'H',
    'mfm': 'M', 'mf-f': 'M', 'mff': 'M', 'mf-mu': 'M', 'mfmuj': 'M',
    'mf': null,
  },

  parsePrevious(text) {
    const out = {};
    if (!text) return out;
    const re = /([A-Za-z][A-Za-z0-9-]{0,5})\s*[:=]\s*(\d{1,3})/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      let code = m[1];
      const t = parseInt(m[2], 10);
      if (!(t >= 20 && t <= 120)) continue;
      const low = code.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(this.MF_ALIASES, low)) {
        out.Mf = { t, label: code, sex: this.MF_ALIASES[low] };
        continue;
      }
      const known = Object.values(this.GROUP_ORDER).flat().find(c => c.toLowerCase() === low);
      code = known || (code.charAt(0).toUpperCase() + code.slice(1));
      out[code] = t;
    }
    return out;
  },

  /* Tabla Mf (baremo EE. UU., la única con tablas de Mf íntegras en la app) limpiada:
     se conserva el tramo monótono principal y se interpola entre puntos. */
  _mfTable(sex) {
    const B = (window.__BAREMOS_US__ || {}).Mf || {};
    const raw = B[sex === 'H' ? 'M' : 'F'];
    if (!raw || typeof raw !== 'object') return null;
    const pts = Object.entries(raw).map(([k, v]) => [parseInt(k, 10), v]).filter(([k, v]) => isFinite(k) && typeof v === 'number').sort((a, b) => a[0] - b[0]);
    const dir = sex === 'H' ? 1 : -1; // varones: T sube con la PD; mujeres: T baja
    // Quitar mesetas (p. ej. T = 30 repetida en el extremo) para poder invertir la tabla
    const noPlateau = pts.filter((p, i) => {
      const nb = dir > 0 ? pts[i + 1] : pts[i - 1];
      return !(nb && nb[1] === p[1]);
    });
    const clean = [noPlateau[0]];
    for (const p of noPlateau.slice(1)) {
      const last = clean[clean.length - 1];
      if ((p[1] - last[1]) * dir > 0) clean.push(p);
    }
    return clean.length >= 5 ? clean : null;
  },
  _interp(pts, x, from, to) {
    // pts: [[a,b],...] ordenado por el índice 'from'; devuelve el valor 'to' interpolado
    const arr = pts.slice().sort((p, q) => p[from] - q[from]);
    if (x <= arr[0][from]) { const [p, q] = [arr[0], arr[1]]; return p[to] + (x - p[from]) * (q[to] - p[to]) / (q[from] - p[from]); }
    for (let i = 0; i < arr.length - 1; i++) {
      const p = arr[i], q = arr[i + 1];
      if (x >= p[from] && x <= q[from]) return p[to] + (x - p[from]) * (q[to] - p[to]) / ((q[from] - p[from]) || 1);
    }
    const p = arr[arr.length - 2], q = arr[arr.length - 1];
    return q[to] + (x - q[from]) * (q[to] - p[to]) / (q[from] - p[from]);
  },
  /* Convierte una T de Mf obtenida con el baremo de un sexo a la T equivalente del otro sexo.
     T(origen) → PD estimada → T(destino). Devuelve { t, lo, hi, pd } o null. */
  mfEquivalent(t, fromSex, toSex) {
    const A = this._mfTable(fromSex), Bt = this._mfTable(toSex);
    if (!A || !Bt) return null;
    const pd = this._interp(A, t, 1, 0);
    const conv = (x) => Math.round(Math.max(20, Math.min(120, this._interp(Bt, x, 0, 1))));
    // Margen: ±2 PD (diferencias de clave en 4 ítems y de baremo de origen)
    const a = conv(pd - 2), b = conv(pd + 2);
    return { t: conv(pd), lo: Math.min(a, b), hi: Math.max(a, b), pd: Math.round(pd * 10) / 10 };
  },

  comparisonRows(results, prevText, sex) {
    const prev = this.parsePrevious(prevText);
    return Object.keys(prev).map(code => {
      const cur = this.T(results, code);
      let pv = prev[code], approx = false, note = null, prevLabel = null, prevRaw = null, range = null;
      if (code === 'Mf' && typeof pv === 'object') {
        prevLabel = pv.label; prevRaw = pv.t;
        if (pv.sex && sex && pv.sex !== sex) {
          const eq = this.mfEquivalent(pv.t, pv.sex, sex);
          if (eq) {
            approx = true; range = [eq.lo, eq.hi];
            note = `La T anterior de Mf (${pv.t}, rótulo «${pv.label}») se obtuvo con la clave y el baremo de ${pv.sex === 'H' ? 'varones' : 'mujeres'}; para compararla se convirtió a su equivalente aproximado en el baremo de ${sex === 'H' ? 'varones' : 'mujeres'} (T ≈ ${eq.t}; rango probable ${eq.lo}–${eq.hi}), estimando la puntuación directa (≈ ${String(eq.pd).replace('.', ',')}) con las tablas estadounidenses. En el baremo de mujeres una T alta indica distancia de los intereses tradicionalmente femeninos y en el de varones, cercanía a ellos, por lo que las cifras originales no son comparables entre sí.`;
            pv = eq.t;
          } else { pv = null; note = `La T anterior de Mf («${pv && pv.label}») corresponde al baremo del otro sexo y no pudo convertirse.`; }
        } else {
          pv = pv.t;
        }
      }
      const d = (cur != null && pv != null) ? cur - pv : null;
      let change = '—';
      if (d != null) change = d >= 10 ? 'Aumento relevante' : (d <= -10 ? 'Descenso relevante' : (Math.abs(d) >= 5 ? (d > 0 ? 'Aumento leve' : 'Descenso leve') : 'Estable'));
      if (approx && d != null) change += ' (aprox.)';
      return { code, prev: pv, cur, delta: d, change, approx, note, prevLabel, prevRaw, range };
    });
  },

  comparisonParagraph(results, prevText, sex) {
    const all = this.comparisonRows(results, prevText, sex);
    const rows = all.filter(r => r.delta != null);
    if (!rows.length) return '';
    const VAL = ['L', 'F', 'K', 'VRIN', 'TRIN', 'Fb', 'Fp', 'S'];
    const clin = rows.filter(r => !VAL.includes(r.code) && r.code !== 'Mf');
    const val = rows.filter(r => VAL.includes(r.code));
    const mf = rows.find(r => r.code === 'Mf');
    const fmt = (r) => `${r.code} (de ${r.prev} a ${r.cur})`;
    const parts = [`Se compararon ${rows.length} escalas con la aplicación anterior; se considera relevante un cambio de 10 o más puntos T.`];
    if (clin.length) {
      const up = clin.filter(r => r.delta >= 10), down = clin.filter(r => r.delta <= -10), stable = clin.filter(r => Math.abs(r.delta) < 10);
      if (up.length) parts.push(`En las escalas clínicas y de contenido ${up.length === 1 ? 'aumenta' : 'aumentan'} de forma relevante ${this.join(up.map(fmt))}, lo que indica intensificación del malestar en esas áreas.`);
      if (down.length) parts.push(`${down.length === 1 ? 'Disminuye' : 'Disminuyen'} de forma relevante ${this.join(down.map(fmt))}, lo que sugiere mejoría o menor reconocimiento de esas dificultades.`);
      if (stable.length) parts.push(`${stable.length === clin.length ? 'Todas ellas' : (stable.length === 1 ? 'La escala clínica restante' : 'Las ' + stable.length + ' escalas clínicas restantes')} se ${stable.length === 1 && stable.length !== clin.length ? 'mantiene estable' : 'mantienen estables'} (cambio menor de 10 puntos), lo que apunta a características relativamente persistentes entre ambas aplicaciones.`);
    }
    if (val.length) {
      const ch = val.filter(r => Math.abs(r.delta) >= 10);
      parts.push(ch.length
        ? `En las escalas de validez ${ch.length === 1 ? 'cambia' : 'cambian'} de forma relevante ${this.join(ch.map(fmt))}, lo que indica una actitud distinta ante la prueba en cada aplicación y debe tenerse en cuenta al comparar el resto del perfil.`
        : 'Las escalas de validez se mantienen en niveles similares, lo que indica una actitud semejante ante la prueba en ambas aplicaciones.');
    }
    if (mf) {
      const d = mf.delta, pre = mf.approx ? '≈ ' : '';
      let txt = `En Masculinidad–feminidad, que no mide psicopatología, la puntuación pasa de ${pre}${mf.prev} a ${mf.cur} (${pre}${d > 0 ? '+' : ''}${d} puntos).`;
      if (mf.approx && mf.range) {
        const dLo = mf.cur - mf.range[1], dHi = mf.cur - mf.range[0];
        const sameBand = (mf.prev >= 65) === (mf.cur >= 65);
        txt += ` Considerando el margen de la conversión (T anterior entre ${mf.range[0]} y ${mf.range[1]}), la diferencia real estaría entre ${dLo > 0 ? '+' : ''}${dLo} y ${dHi > 0 ? '+' : ''}${dHi} puntos${sameBand ? ', y en ambas aplicaciones la escala se sitúa en el mismo rango, con el mismo sentido interpretativo' : ''}.`;
      }
      parts.push(txt);
    }
    all.filter(r => r.note).forEach(r => parts.push(r.note));
    parts.push('Los cambios deben leerse considerando el tiempo transcurrido, los tratamientos recibidos y el contexto de cada aplicación.');
    return this._clean(parts.join(' '));
  },

  /* ---------- Recomendaciones ---------- */
  recommendations(results, validity, sex) {
    const t = (c) => this.T(results, c);
    const recs = [];
    const fl = this.validityFlags(results, results._meta ? results._meta.omissions : null);
    if (validity && validity.status === 'NO_INTERPRETABLE') {
      return [
        'No formular conclusiones clínicas a partir de este protocolo; valorar una nueva aplicación en condiciones controladas, previa explicación de la consigna.',
        'Apoyar la evaluación en entrevista clínica, observación e instrumentos alternativos.',
      ];
    }
    if (fl.overPossible || fl.under || (validity && validity.status === 'INTERPRETABLE_CON_CAUTELA')) recs.push('Contrastar las elevaciones con la entrevista clínica, la historia documentada y otras fuentes, dado el estilo de respuesta observado.');
    const somatic = ['Hs', 'HEA', 'Hy'].some(c => t(c) != null && t(c) >= 65);
    if (somatic) recs.push('Coordinar con medicina para descartar o precisar la base orgánica de las quejas físicas y evitar exploraciones redundantes; considerar intervenciones dirigidas a la relación entre estrés y síntomas corporales.');
    if ((t('D') != null && t('D') >= 65) || (t('DEP') != null && t('DEP') >= 65)) recs.push('Evaluar la sintomatología depresiva con instrumentos específicos y explorar de forma directa la presencia de ideación de muerte o suicida.');
    if (['Pt', 'ANX', 'A', 'OBS'].some(c => t(c) != null && t(c) >= 65)) recs.push('Valorar la ansiedad y la rumiación con medidas específicas; las intervenciones cognitivo-conductuales y de regulación emocional suelen ser pertinentes.');
    if (['Sc', 'BIZ', 'Sc3', 'Sc6'].some(c => t(c) != null && t(c) >= 70)) recs.push('Explorar en entrevista la calidad del pensamiento, la concentración y las experiencias perceptivas, para diferenciar desorganización por estrés intenso de alteraciones de otra naturaleza.');
    if (['Pa', 'Pa1'].some(c => t(c) != null && t(c) >= 70)) recs.push('Indagar la suspicacia y la vivencia de trato injusto, considerando los hechos del contexto antes de atribuirlas a rasgos.');
    if (['PK'].some(c => t(c) != null && t(c) >= 65)) recs.push('Explorar vivencias estresantes o traumáticas y su impacto actual con una entrevista o escala específica.');
    if (['ANG', 'Pd', 'ASP', 'Ma'].some(c => t(c) != null && t(c) >= 70)) recs.push('Valorar el manejo de la ira y de los impulsos y, si procede, el riesgo para sí o para terceros.');
    if (['MAC-R', 'AAS', 'APS'].some(c => t(c) != null && t(c) >= 65)) recs.push('Explorar el patrón de consumo de alcohol y otras sustancias con instrumentos de cribado.');
    if (t('WRK') != null && t('WRK') >= 65) recs.push('Considerar el impacto de las dificultades en el desempeño laboral y los ajustes razonables que puedan requerirse.');
    if ((t('TRT') != null && t('TRT') >= 65) || (t('Es') != null && t('Es') <= 40)) recs.push('Fortalecer la alianza terapéutica y trabajar las expectativas sobre el tratamiento desde el inicio, dado el pesimismo o la fragilidad de los recursos de afrontamiento.');
    if (recs.length === 0) recs.push('El perfil no describe áreas de dificultad marcadas; integrar estos resultados con la entrevista y la historia antes de emitir conclusiones.');
    recs.push('Integrar estos resultados con la entrevista clínica, la historia y la información de otras fuentes; el inventario describe el funcionamiento autoinformado y no establece por sí solo diagnósticos ni relaciones causales.');
    return recs;
  },

  /* ============================================
     SÍNTESIS INTEGRADORA (sin valores ni siglas)
     ============================================ */
  consolidated(results, patient) {
    const sex = (patient || {}).sex;
    const S = this.subj(sex);
    const t = (c) => this.T(results, c);
    const validity = this.verdict(results);
    const fl = validity.flags;
    const ctx = (patient && patient.context) ? patient.context.toLowerCase() : '';
    const ctxPhrase = ctx && ctx !== 'otro' ? ` en contexto ${ctx}` : '';
    const out = [];

    // 1. Estilo de respuesta
    if (validity.status === 'NO_INTERPRETABLE' || fl.inconsistent || fl.overInvalid || fl.underInvalid || fl.invalidOmit) {
      const why = [];
      if (fl.invalidOmit) why.push('dejó sin responder un número elevado de preguntas');
      if (fl.inconsistent) why.push('sus respuestas no guardan la coherencia necesaria');
      if (fl.overInvalid) why.push('reconoció una cantidad de síntomas tan inusual que sugiere una exageración marcada');
      if (fl.underInvalid) why.push('ofreció una imagen de sí excesivamente favorable');
      out.push(`En la presente evaluación${ctxPhrase}, ${S} ${this.join(why.length ? why : ['respondió de un modo que no permite una lectura fiable'])}, de modo que el perfil obtenido no permite describir su funcionamiento psicológico con suficiente confianza. Por esta razón no se formulan inferencias clínicas a partir del inventario, y la comprensión del caso debe apoyarse en la entrevista, la observación y otras fuentes, valorando la conveniencia de una nueva aplicación.`);
      return out.join(' ');
    }
    let style = `En la presente evaluación${ctxPhrase}, ${S} respondió el inventario de forma ${fl.someInconsistency ? 'en general coherente, aunque con algunas inconsistencias' : 'coherente y atenta al contenido de las preguntas'}`;
    if (fl.overPossible) style += ', con apertura para reconocer malestar y una tendencia a acentuar su intensidad que puede expresar sufrimiento elevado o una necesidad de ser escuchad' + (sex === 'M' ? 'a' : 'o') + ', motivo por el cual la magnitud de algunos hallazgos debe ponderarse con prudencia';
    else if (fl.under) style += ', con una tendencia a presentarse de manera favorable y a restar importancia a sus dificultades, lo que puede atenuar la expresión de algunos problemas';
    else if (fl.openDistress) style += ', con disposición a reconocer sus dificultades emocionales';
    else if (fl.selfCritical) style += ', con una actitud autocrítica hacia sí mism' + (sex === 'M' ? 'a' : 'o');
    else style += ', sin indicios de exageración ni de minimización de sus dificultades';
    out.push(style + '.');

    // 2. Dominios con elevación (≥ 65; 60–64 como matiz)
    const groups = ['Clínicas', 'Contenido', 'Suplementarias', 'Subescalas'];
    const dom = {}; // d -> { max, feats: Map(phrase -> t) }
    const addFeat = (d, phrase, tv) => {
      if (!dom[d]) dom[d] = { max: 0, feats: new Map() };
      dom[d].max = Math.max(dom[d].max, tv);
      if (!dom[d].feats.has(phrase) || dom[d].feats.get(phrase) < tv) dom[d].feats.set(phrase, tv);
    };
    for (const g of groups) {
      for (const c of this.GROUP_ORDER[g]) {
        const tv = t(c);
        if (tv == null) continue;
        const k = this.KB[c] || {};
        // Subescalas solo si la escala madre está elevada (evita sobreinterpretar)
        if (k.parent) { const pt = t(k.parent); if (pt == null || pt < 60) continue; }
        if (tv >= this.CUT.sig) {
          for (const [d, p] of this.feats(c, sex)) addFeat(d, p, tv);
        } else if (tv >= this.CUT.mod && !k.parent && !k.fav) {
          // Matices moderados: solo escalas principales y si su dominio ya está presente o es único
          for (const [d, p] of this.feats(c, sex)) addFeat(d + '_mod', p, tv);
        } else if (tv <= this.CUT.low) {
          for (const [d, p] of this.feats(c, sex, true)) addFeat(d, p, 66);
        }
      }
    }
    // Fusionar matices moderados en su dominio si existe; si no, quedan como dominio leve
    for (const key of Object.keys(dom)) {
      if (!key.endsWith('_mod')) continue;
      const base = key.slice(0, -4);
      if (dom[base]) { for (const [p, tv] of dom[key].feats) if (!dom[base].feats.has(p)) dom[base].feats.set(p, tv - 100); }
      else { dom[base + '_leve'] = dom[key]; }
      delete dom[key];
    }

    const clinicalDomains = Object.entries(dom)
      .filter(([d]) => !['recursos', 'tratamiento', 'personalidad'].includes(d) && !d.endsWith('_leve'))
      .sort((a, b) => b[1].max - a[1].max);
    const mildDomains = Object.entries(dom).filter(([d]) => d.endsWith('_leve')).sort((a, b) => b[1].max - a[1].max);

    const featList = (o, n = 4) => {
      const arr = [...o.feats.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => p);
      const uniq = [];
      for (const p of arr) if (!uniq.some(u => u === p)) uniq.push(p);
      return this.join(uniq.slice(0, n));
    };
    const intWords = [', con una intensidad marcada,', ', de forma igualmente acusada,', ', con nitidez,', ', con claridad,'];
    let intIdx = 0;
    const intensity = (m) => m >= this.CUT.marked ? intWords[Math.min(intIdx++, intWords.length - 1)] : '';

    if (!clinicalDomains.length) {
      out.push(`Las respuestas no describen áreas de dificultad clínicamente significativas: el funcionamiento emocional, cognitivo, interpersonal y conductual que ${S} refiere se sitúa dentro de lo esperable para la población de referencia.`);
    } else {
      const openers = [
        (d, f, m) => `El hallazgo más prominente se sitúa en ${this.DOMAINS[d]}, donde el perfil describe${intensity(m)} ${f}.`,
        (d, f, m) => `En ${this.DOMAINS[d]} se aprecia${intensity(m)} ${f}.`,
        (d, f, m) => `Respecto de ${this.DOMAINS[d]}, las respuestas reflejan${intensity(m)} ${f}.`,
        (d, f, m) => `En cuanto a ${this.DOMAINS[d]}, destaca${intensity(m)} ${f}.`,
        (d, f, m) => `A ello se suma, en ${this.DOMAINS[d]}, ${f}.`,
      ];
      clinicalDomains.forEach(([d, o], i) => {
        out.push(openers[Math.min(i, openers.length - 1)](d, featList(o), o.max));
      });
      // Relación entre dominios principales (lectura integradora)
      const ds = clinicalDomains.map(([d]) => d);
      if (ds.includes('somatico') && ds.includes('afectivo')) {
        out.push('La coexistencia de quejas corporales y malestar emocional sugiere que la tensión psicológica se vive en buena medida a través del cuerpo, de forma que ambos planos tienden a reforzarse.');
      } else if (ds.includes('afectivo') && ds.includes('pensamiento')) {
        out.push('El malestar emocional parece interferir con la claridad y la organización del pensamiento, lo que puede afectar la concentración y la toma de decisiones.');
      }
      if (ds.includes('pensamiento') && (fl.overPossible || ds.includes('afectivo'))) {
        out.push('Las vivencias de confusión o extrañeza pueden corresponder al desbordamiento emocional que acompaña al malestar; su naturaleza y alcance deben precisarse en la entrevista clínica.');
      }
    }
    if (mildDomains.length) {
      const items = mildDomains.map(([d, o]) => `${featList(o, 2)}`);
      out.push(`En menor grado, aparecen ${this.join(items)}.`);
    }
    // 3. Estilo de personalidad
    if (dom.personalidad) {
      out.push(`En su estilo de personalidad se reconoce ${featList(dom.personalidad, 3)}.`);
    }
    // 4. Áreas sin dificultad (ausencias relevantes) y recursos
    const absent = [];
    const allBelow = (codes) => { const v = codes.map(t).filter(x => x != null); return v.length > 0 && v.every(x => x < 60); };
    if (allBelow(['MAC-R', 'AAS', 'APS'])) absent.push('consumo problemático de sustancias');
    if (allBelow(['ASP', 'Pd', 'Pd2', 'Ma1'])) absent.push('conductas de transgresión de normas');
    if (allBelow(['ANG', 'Ho', 'Pd'])) absent.push('dificultades en el control de la ira');
    if (allBelow(['BIZ', 'Sc6', 'Sc'])) absent.push('experiencias perceptivas inusuales');
    if (allBelow(['ANX', 'A', 'Pt'])) absent.push('ansiedad generalizada');
    if (allBelow(['DEP', 'D', 'D1'])) absent.push('ánimo depresivo');
    if (allBelow(['FAM', 'Pd1'])) absent.push('conflicto familiar');
    if (allBelow(['WRK'])) absent.push('actitudes que interfieran con el trabajo');
    if (absent.length) out.push(`No se identifican indicadores de ${this.join(absent, 'ni')}.`);
    if (dom.recursos) {
      const n = Math.min(3, dom.recursos.feats.size);
      out.push(`${n === 1 ? 'Como recurso personal destaca' : 'Como recursos personales destacan'} ${featList(dom.recursos, 3)}.`);
    }
    // 5. Tratamiento
    if (dom.tratamiento) {
      out.push(`De cara a la intervención, conviene considerar la presencia de ${featList(dom.tratamiento, 2)}, lo que hace aconsejable cuidar especialmente la alianza de trabajo y el encuadre de objetivos alcanzables.`);
    } else if (clinicalDomains.length) {
      out.push('No se observan actitudes negativas hacia el tratamiento, lo que favorece la posibilidad de beneficiarse de apoyo psicológico.');
    }
    // 6. Cierre
    out.push('Estos resultados describen cómo la persona se percibe y se presenta en el momento de la evaluación; su alcance diagnóstico depende de su integración con la entrevista clínica, la historia personal y la información de otras fuentes.');
    return this._clean(out.join(' '));
  },
};

window.Interpret = Interpret;

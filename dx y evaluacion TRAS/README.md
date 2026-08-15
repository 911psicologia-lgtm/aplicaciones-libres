# TRAS App — versión multiarchivo (v0.16.6)

**Test de Representaciones de la Vida Afectiva y Social de Niños, Niñas y Adolescentes**
Autor del instrumento: José Alonso Andrade Salazar · © 2015

Aplicación de escritorio/web, sin servidor propio, para administrar
el TRAS como **entrevista guiada de completamiento de frases**. No es una prueba
diagnóstica: organiza la administración, el registro y la interpretación cualitativa, y
deja por escrito esa advertencia en cada informe.

---

## Cambios de la v0.16.6

- El puente universal de IA se rediseñó como un cuadro **compacto**, con la tipografía y los colores institucionales de la app, cierre **×** fijo en la esquina superior derecha y mejor adaptación a celular.
- Se agregó **Nuevo caso** a la navegación superior. Esta acción siempre inicia un expediente en blanco y abre un selector compacto del alcance: TRAS, habilidades sociales, ambos o solo HC. El demo continúa siendo una acción explícita del menú hamburguesa.
- El selector inicial de alcance reemplaza el recorrido automático que saturaba la primera apertura. Las opciones se presentan como accesos pequeños, escalables y con una descripción puntual del recorrido.
- Se reforzó la adaptación móvil: menor tamaño de tarjetas, botones y márgenes; encabezado compacto; modal de IA ajustado al alto disponible; tablas desplazables y controles táctiles más proporcionados.
- La app ahora incluye manifiesto PWA, *service worker* y un botón flotante que avisa cuando existe una versión nueva lista para actualizar.
- Todos los prompts reciben un **contrato estricto de JSON**: salida única, comillas internas escapadas o sustituidas por « », ausencia de texto externo, validación de llaves, corchetes, comas y tipos antes de responder.
- El saneador de JSON puede recuperar de forma conservadora respuestas con cercas de código, texto antes o después del objeto, comas finales, saltos de línea dentro de cadenas y comillas clínicas internas no escapadas, sin reescribir el contenido psicológico.
- El informe de habilidades sociales fue reconstruido para **eliminar la repetición** que se producía entre el resultado y la síntesis final.
- La tabla de Goldstein presenta ahora barras proporcionales, predominio por grupo, número de respuestas y una lectura específica para cada uno de los seis grupos.
- Se incorporó un **mapa de relaciones** entre contexto, condiciones de ejecución, habilidades y recursos, sin presentar esas relaciones como causalidad lineal.
- Se conserva de manera visible la condición de disponibilidad —inconscientemente inhábil, conscientemente inhábil o conscientemente hábil— y se muestra la escalera completa de cuatro condiciones. La condición de ejecución automatizada no se atribuye únicamente mediante autoinforme.
- El prompt Goldstein v4.0 diferencia resumen ejecutivo, perfiles por grupo, fortalezas, condiciones que reducen la ejecución, mapa de relaciones, orientaciones, clasificación y límites. Cada hallazgo debe aparecer una sola vez.
- El prompt maestro de informes utiliza la misma estructura Goldstein v4.0 y conserva exactamente la clasificación calculada por la aplicación.

### Nota metodológica sobre Goldstein

La aplicación mantiene la versión de 50 habilidades agrupadas en seis conjuntos y la escala adaptada Nunca / A veces / Siempre. La lectura de las cuatro condiciones de conciencia y disponibilidad se utiliza como complemento interpretativo del aprendizaje de habilidades; no se presenta como un baremo normativo original del instrumento. La regla operacional de esta adaptación queda explícita en `js/goldstein.js`, y la condición «inconscientemente hábil» requiere contraste con observación y ejecución reiterada.

## Cómo abrir la aplicación

No requiere instalación. Las funciones clínicas, el almacenamiento y la edición operan localmente. La extracción automática de DOCX y PDF utiliza lectores cargados desde CDN; cuando no hay conexión, puede pegarse el texto manualmente.

1. Conserve la estructura de carpetas tal como está.
2. Abra `index.html` con un navegador moderno (Chrome, Edge o Firefox).
   Doble clic suele bastar (`file://`).

> El dictado por voz (Web Speech API) y la generación de XLSX funcionan mejor en
> navegadores basados en Chromium. El resto de funciones operan en cualquier navegador
> moderno.

### Ver el funcionamiento completo (demo)

En el menú hamburguesa, el botón **«Abrir / restablecer demo»** abre un único caso demostrativo. Si ya existe,
se actualiza o se restablece sin crear copias adicionales. El demo no se mezcla con **Nuevo caso**,
que siempre abre un registro vacío. Recorra el flujo clínico según el alcance elegido: TRAS,
habilidades sociales o ambos; el informe queda al final del proceso.

---

## Estructura de archivos

```
tras-app/
├── index.html              Estructura de los 11 pasos y carga de scripts
├── README.md
├── assets/
│   └── css/
│       └── styles.css      Identidad visual, menú hamburguesa y centro de informes
└── js/
    ├── dataset.js          Banco de 76 ítems (19 áreas × 4) + subescalas + constantes
    ├── ui.js               Navegación, modales, toasts, recorrido inicial, accesibilidad
    ├── state.js            Estado, persistencia (localStorage), gestión de casos
    ├── voice.js            Dictado por voz por campo (Web Speech API, es-CO)
    ├── interview.js        Módulos, tarjetas de entrevista, profundización, revisión
    ├── interpret.js        Interpretación + señales léxicas orientativas (no diagnósticas)
    ├── export.js           Informe completo/abreviado, HC independiente, JSON/XLSX, firma
    ├── goldstein.js        Batería anexa de habilidades sociales
    ├── aiflow.js           Primitivo único de "IA manual" + resguardo de privacidad
    ├── anexos.js           Anexos pegables con mini-Markdown seguro
    ├── personalidad.js     Perfil de personalidad EN FORMACIÓN por dimensiones
    ├── demo.js             Caso de demostración
    ├── v0164.js            Expediente único, flujo guiado, HC documental, IA e informes
    ├── v0165.js            UX compacta, PWA, JSON robusto y reporte Goldstein renovado
    └── app.js              Arranque y atajos de teclado
```

El orden de carga de los scripts en `index.html` es deliberado (las dependencias se cargan
antes que quien las usa): `dataset → ui → state → voice → interview → interpret → export →
goldstein → aiflow → anexos → personalidad → demo → v0164 → v0165 → app`. En particular, `aiflow.js` se carga
después de `interpret.js` (reutiliza su saneador de JSON) y antes de `personalidad.js`
(que registra su flujo en él).

---

## Los 11 pasos

1. **Perfil del evaluador** (con firma por imagen).
2. **Datos del caso** (número, fecha, datos del menor, consentimiento).
3. **Historia clínica breve** + **resumen del caso** (extensión flexible y contador orientativo) y
   exportación de la HC como documento independiente. Botón *HC con apoyo de IA*.
4. **Módulos**: activación de subescalas complementarias y manejo de áreas sensibles
   (aplicar / posponer / omitir).
5. **Entrevista guiada**: vista individual o continua, con dictado por campo. Botón
   *Entrevista con IA* para transcribir y ordenar respuestas.
6. **Revisión por área**.
7. **Interpretación** en tres planos (qué dice / qué sucede / qué se sugiere).
8. **Informe**: completo o **abreviado**, HTML / Word (.doc) / JSON / XLSX, más el gestor
   de **anexos pegables**.
9. **Habilidades sociales**: batería anexa de Goldstein.
10. **Perfil de personalidad en formación** (anexo; *no* es un MMPI-A).
11. **Manual técnico** con la bibliografía del instrumento.

---

## Cambios respecto a la versión monolítica (v0.7.2)

### Correcciones
- **Versionado unificado.** El original mezclaba "v0.7.2", "v0.2" y claves de almacenamiento
  inconsistentes. Ahora todo es `v0.8.0`, con clave `tras_app_state_v1` y **migración
  automática** desde la clave antigua (`tras_app_v0_2_state`) para no perder casos previos.
- **Metadatos del XLSX.** El archivo exportado declaraba `creator = "ChatGPT"`; corregido a
  "TRAS App".
- **Portapapeles.** Se reemplazó `document.execCommand('copy')` (obsoleto) por
  `navigator.clipboard` con respaldo.
- **Avisos.** Los `alert()` que interrumpían el flujo se sustituyeron por *toasts* no
  bloqueantes.

### Mejoras de fondo
- **Análisis léxico más honesto.** El heurístico original buscaba subcadenas
  (`texto.includes("siempre")`), lo que producía falsos positivos: *"siempre me apoya"* se
  contaba como alerta. Ahora se normaliza el texto (sin tildes), se cuentan **palabras
  completas** y se separaron los marcadores de malestar y de recurso. Sobre todo, se
  **reetiquetó**: ya no se habla de "alertas" e "intensidad" como si fueran medidas, sino de
  *señales léxicas orientativas*, con la advertencia explícita de que **no constituyen
  validación psicométrica** ni reemplazan el juicio clínico.
- **Gestión de casos.** Se añadió **duplicar** y **eliminar** casos.
- **Importación de caso completo** en JSON (antes solo se importaban interpretaciones).
- **Privacidad.** Banner inicial que advierte que se guardan **datos sensibles de menores en
  el navegador** (localStorage, sin cifrar) y recomienda usar el modo privado y no usar
  equipos compartidos. La responsabilidad sobre el dato sigue siendo del profesional.
- **Accesibilidad.** Etiquetas `aria`, `label for`, foco visible, cierre con `Escape` y
  respeto por `prefers-reduced-motion`.

---

## Advertencias

- **No es un instrumento diagnóstico.** Es una guía de entrevista; toda lectura es
  cualitativa y orientativa, y debe contrastarse con otras fuentes (entrevista familiar,
  reporte escolar, observación clínica).
- **Datos sensibles.** La información se almacena localmente en el navegador, sin cifrado.
  Quien administra es responsable del consentimiento informado, la custodia y el borrado
  de los datos. Para casos reales, prefiera equipos no compartidos y el modo privado
  (`Ctrl + Shift + P`).
- Las **señales léxicas** del paso 7 son una ayuda de lectura, no una puntuación.

---

## Atajos

- `Ctrl + Shift + P` — alternar modo privado (difumina los datos).
- `Escape` — cerrar modal o recorrido.

---

## Batería anexa · Habilidades sociales (Goldstein) — v0.9.0

Como complemento opcional (paso 9), la app integra la **Lista de Chequeo de Habilidades
Sociales de Goldstein** en una versión de **tres niveles** (Nunca / A veces / Siempre) con
redacción adaptada para adolescentes.

- **Tamizaje descriptivo, no psicométrico.** Trabaja solo con **conteos y porcentajes de
  frecuencia** por grupo y global; **no** calcula puntajes ni percentiles normativos. Es
  coherente con el formato en Excel del que parte el autor.
- **Selección por caso.** Puede aplicarse junto con el TRAS o de forma autónoma; cada modo
  es seleccionable. La vista admite **lista completa** o **por grupos**.
- **Clasificación de cuatro estados corregida.** La lógica del Excel original tenía dos
  etiquetas invertidas respecto de sus propias definiciones de nivel; aquí se **recalculó en
  limpio** para que sea coherente: predominio de *escasas* → "Inconscientemente inhábil",
  predominio de *muy buenas* → "Conscientemente hábil", etc.
- **Modo IA manual contextualizado.** El prompt incluye un **cuadro de resumen del caso**
  que sintetiza la Historia Clínica y, si se aplicó, el TRAS (patrones, análisis consolidado
  e interpretaciones por área). Ese resumen contextualiza la interpretación de las respuestas.
  Devuelve JSON (interpretación, fortalezas, áreas a fortalecer, recomendaciones) que se
  reinserta y queda marcado como *origen IA (revisar)*.
- **Redacción adaptada.** De los 50 ítems, **49 fueron reformulados** a lenguaje cercano y en
  segunda persona; cada uno conserva el **enunciado clásico de Goldstein** como referencia del
  evaluador y muestra la etiqueta "redacción adaptada".
- **Exportación.** El informe (HTML / .doc) añade el **anexo de habilidades sociales** cuando
  la batería está aplicada, y el soporte XLSX incluye una **tercera hoja "Goldstein"** con
  respuestas, resumen por grupo, global, clasificación e interpretación.

El Manual técnico se trasladó al paso 11 (era el 10 hasta la v0.14) e incorpora bibliografía real de Goldstein.

### v0.9.1 — Anexo Goldstein estructurado

El anexo de habilidades sociales del informe dejó de ser un párrafo plano. Ahora la
interpretación se organiza en cuatro bloques analíticos:

- **a) Habilidades que salen** — descriptivo: qué grupos/habilidades son fortaleza y cuáles
  escasas o de uso forzado.
- **b) Lectura psicológica y analítica** — interpretativo: articulación con la HC y el TRAS,
  relaciones contextuales, condiciones de variación y posible función de las dificultades.
- **c) Indicaciones de mejora** — lista de sugerencias aplicadas al caso.
- **d) Conclusión (nivel de habilidad)** — retoma la clasificación hábil/inhábil calculada,
  resaltada como cierre.

El editor del paso 9 tiene un campo por bloque, y el **prompt de IA (esquema v2.0)** pide los
mismos tres planos separados más la conclusión. Los casos antiguos con interpretación en texto
plano se migran automáticamente al bloque de lectura analítica. El soporte XLSX refleja la
misma estructura.

### v0.9.2 — Datos del evaluador y firma en el informe

El perfil del evaluador (paso 1) y la firma se guardan **a nivel de usuario** en el navegador,
no por caso: quedan disponibles para todos los informes y son **borrables** en cualquier momento.

- Nuevos campos: registro profesional y **dirección**, además de institución, teléfono y email.
- **Firma cargable** (PNG/JPG/WEBP) con vista previa. Botón **"Usar firma de muestra"** que
  precarga una firma embebida; el botón **"Quitar firma"** la elimina.
- El informe exportable incorpora un **bloque de cierre con firma** al final (imagen + nombre,
  profesión, registro, institución, dirección y contacto), sobre una línea de firma. Si no hay
  imagen cargada, se conserva el espacio y los datos para firma manuscrita.
- El **caso demo** precarga los datos reales del evaluador y la firma de muestra para mostrar el
  resultado; cada usuario puede sobreescribirlos o borrarlos.
- El soporte XLSX incluye registro, dirección, teléfono y email del evaluador.

### v0.10.0 — Barra de iconos, alcance y módulo Configuración

- **Barra superior de iconos (recorrido):** una fila de iconos sin texto, uno por paso, con
  tooltip (título + descripción), que marca el avance y permite saltar a cualquier paso. A la
  derecha, un **icono de Ayuda** que abre el recorrido. Se conserva además la lista textual de
  pasos en el menú izquierdo.
- **Alcance de la evaluación (TRAS / Habilidades / Ambos):** selector en el menú izquierdo,
  guardado **por caso**. Muestra u oculta los pasos correspondientes y filtra el informe:
  *TRAS* oculta la batería Goldstein; *Habilidades* oculta Módulos/Entrevista/Revisión/
  Interpretación y emite un informe centrado en Goldstein; *Ambos* deja todo visible.
- **Módulo Configuración** (panel desplegable en el menú): Gestión del caso (Guardar, Importar
  JSON, Exportar JSON, Nuevo, Duplicar), Privacidad y ayuda (Modo privado, Ayuda, Manual técnico)
  y Datos (**Borrar todos los datos** del navegador, con confirmación). El menú principal queda
  más limpio.

### v0.11.0 — Auditoría DSEBI: correcciones críticas y altas

Tras una auditoría triple (evaluador / cuestionador / integrador), se implementaron:

**Críticas**
- **Guarda contra informe vacío firmado:** antes de exportar HTML/Word, si no hay contenido
  evaluativo para el alcance actual (interpretaciones, patrones o respuestas de la batería),
  la app advierte y pide confirmación, evitando emitir un documento firmado sin hallazgos.
- **Texto multilínea en el informe:** los campos largos (HC, patrones, análisis consolidado,
  interpretación por área) ahora preservan saltos de línea y párrafos en el informe exportado,
  en lugar de colapsar en un bloque corrido.

**Altas**
- **Trazabilidad del informe:** el encabezado incluye fecha y hora de emisión, versión de la app
  y alcance de la evaluación.
- **Accesibilidad de la batería:** las barras de frecuencia llevan etiqueta textual accesible
  (no dependen solo del color); el input de importación tiene `aria-label` y el `<title>` es
  descriptivo.
- **Manejo de cuota de almacenamiento:** si el navegador se queda sin espacio, el mensaje es
  accionable (exportar/eliminar casos o quitar la firma de muestra).

Pendientes priorizados como MEDIO (documentados, no bloqueantes): guía de transferencia para un
sucesor del autor y mayor cobertura de pruebas automatizadas.

### v0.12.0 — Auditoría DSEBI: correcciones críticas y altas

Tras auditoría triple (evaluador / cuestionador / integrador):

- **[CRÍTICO] Informe vacío en alcance "Habilidades":** si el alcance es solo habilidades pero
  la batería Goldstein aún no se aplicó, el informe ya no sale vacío: muestra un aviso claro que
  guía a aplicar la batería o cambiar el alcance.
- **[ALTO] Descargo clínico según alcance:** el aviso de "no es test diagnóstico" se adapta al
  instrumento realmente aplicado (TRAS, Goldstein o ambos).
- **[ALTO] Accesibilidad del recorrido:** al cambiar de paso, el foco se mueve al panel activo
  con `aria-label` descriptivo, de modo que lectores de pantalla anuncian el cambio de contexto.
- **[ALTO] Compatibilidad de JSON:** la exportación estampa versión de app y de esquema; al
  importar, si el esquema difiere, se avisa (no bloquea) y se adapta automáticamente. Los campos
  de exportación no contaminan el caso almacenado.
- **[MEDIO] Skip-link** "Saltar al contenido" para navegación por teclado.

### v0.13.0 — Prompt clínico del TRAS elevado a nivel premium

El prompt de IA del TRAS pasó de un encuadre genérico a uno clínico completo, sin cambiar el
esquema JSON de salida (compatibilidad total):

- **Rol experto** en evaluación narrativa/proyectiva infanto-juvenil, asistente del profesional
  (no decisor).
- **Descripción del instrumento:** completamiento de frases, representaciones, lectura por
  convergencia/contraste entre los cuatro ciclos (A/B/C/D), sin puntajes ni percentiles.
- **Marco interpretativo humanista-existencial con integración psicodinámica** (sentido,
  vivencia, recursos; ambivalencia, defensas, función psíquica de la respuesta).
- **Método de lectura por área:** parte del objetivo, integra ciclos, usa señales léxicas como
  pistas, distingue lenguaje global vs. específico, ancla en la HC y atiende recursos.
- **Salvaguardas obligatorias:** lenguaje no diagnóstico ni alarmista; banderas con prudencia
  en alertas y riesgo; lectura respetuosa de áreas sensibles; carácter exploratorio.

El prompt de Goldstein (ya estructurado en planos qué sale / qué sucede / qué se sugiere) se
mantiene. El esquema de salida del TRAS no cambió, por lo que la inserción del JSON sigue igual.

### v0.14.0 — Interpretación del TRAS en tres planos (qué dice / qué sucede / qué se sugiere)

La interpretación por área del TRAS deja de ser un párrafo único y adopta la misma estructura
de tres planos que ya tenía el anexo de Goldstein, tocando esquema, interfaz, prompt e informe
con **compatibilidad total hacia atrás**:

- **Esquema de datos.** Cada `interpretations[area_id]` pasa de `{texto, fuente}` a
  `{que_dice, que_sucede, que_se_sugiere, texto, fuente}`. El campo `texto` se conserva como
  **espejo legible** (combinación de los tres planos) del que dependen el resumen para el prompt
  de Goldstein, los KPIs y la verificación de contenido del informe. Los casos antiguos con
  párrafo plano **migran automáticamente** volcando ese texto en *qué sucede* (migración perezosa
  vía `areaInterp`), sin pérdida de datos. No se cambió `CASE_SCHEMA` porque la migración es
  transparente.
- **Interfaz (paso 7).** Un solo cuadro por área se reemplaza por tres campos etiquetados con
  guías de redacción. El conteo de áreas "interpretadas" (KPI) ahora cuenta si **cualquiera** de
  los tres planos tiene contenido.
- **Prompt de IA.** Se añadió la sección *Estructura de la interpretación (tres planos por área)*
  y el esquema JSON de salida pide `que_dice` / `que_sucede` / `que_se_sugiere` por área
  (`version_schema` 2.0). La importación **acepta los dos esquemas**: el nuevo de tres planos y
  el antiguo de párrafo único (`interpretacion` → *qué sucede*).
- **Informe.** Cada área se renderiza con sus tres subbloques etiquetados; si solo hay texto
  legado, aparece bajo *Qué sucede*. El XLSX no cambia (nunca exportó la interpretación por área
  del TRAS).
- **Demo.** Las áreas *Actitud hacia la madre* y *Agresión/Acoso escolar* se reescribieron en los
  tres planos para estrenar visiblemente la estructura; el resto del caso demo migra a *qué sucede*.

---

### v0.15.0 — Deduplicación de casos, anexos, resumen de HC, informe abreviado y perfil de personalidad

Ocho cambios, en el orden en que se construyeron.

**1. Deduplicación de casos, marcas de tiempo e historial.**
La barra lateral acumulaba tarjetas repetidas porque el número por defecto (`TRAS-AAAAMMDD`)
lo comparten todos los casos creados el mismo día. Ahora:

- Cada caso guarda `createdAt`, `updatedAt` y un `historial` interno (últimas 60 entradas)
  con lo que se modificó y cuándo. Botón `↻` en cada tarjeta para consultarlo.
- La lista se ordena por actualización reciente y muestra `act. hoy 14:32`.
- La identidad de un caso es **número + nombre**, nunca el número solo. Los casos **sin
  nombre nunca se deduplican**: no hay identidad fiable y borrarlos sería destructivo.
- Cuando hay repetidos aparece un aviso con **«Limpiar duplicados»**: informa cuántos se
  fusionarán, conserva la versión más reciente y pide confirmación explícita.
- **Importar un caso** que ya existe ofrece *actualizarlo* (conservando su historial) en
  lugar de crear otra copia. `Duplicar` ahora avisa de que produce un caso independiente.

**2. Anexos pegables (`anexos.js`).**
Un informe corto producido fuera de la app (Machover, HTP, un MMPI-A realmente administrado,
un reporte escolar) se pega en el paso 8 y se adjunta al final del informe consolidado, con
vista previa en vivo. Reconoce un marcado ligero: `**negrita**`, `*cursiva*`, viñetas con `-`,
listas numeradas y subtítulos con `##`. El texto **se escapa antes** de aplicar el marcado,
de modo que pegar HTML no inyecta nada. Cada anexo puede incluirse o excluirse sin borrarlo.

**3. Resumen clínico contextual.**
Campo del paso 3 con contador orientativo. No impone un límite rígido: ayuda a detectar una síntesis posiblemente insuficiente o redundante. Cuando existe, el informe lo usa como apertura contextual sin eliminar los campos completos de la historia clínica, que permanecen disponibles y alimentan los demás prompts.

**4. Historia clínica como documento independiente.**
Botones *Exportar HC (HTML / .doc)* en el paso 3: la HC sale firmada, con datos de
identificación y el resumen si lo hay, sin arrastrar el informe completo.

**5. Informe clínico estándar integrado.**
Las exportaciones HTML y Word conservan obligatoriamente el análisis de todas las áreas activas del TRAS. Las áreas sin datos quedan expresamente consignadas como no exploradas. El informe añade habilidades sociales, personalidad, anexos e integración transversal sin sustituir el desglose por áreas.

**6. Perfil de personalidad en formación (`personalidad.js`, paso 10).**

> **No es un MMPI-A y no debe presentarse como tal.** No se administró, no hay ítems, escalas,
> puntajes, baremos ni elevaciones. El TRAS es un test narrativo de completamiento de frases;
> no existe un procedimiento válido para derivar de él un perfil MMPI-A, y reproducir sus ítems
> vulneraría además los derechos del instrumento.

Lo que sí hace el módulo: organiza **hipótesis** en nueve dimensiones clínicas generales
(regulación conductual, irritabilidad, vínculos familiares, ajuste escolar, estado anímico,
incomodidad social, autoconcepto, proyecto de vida, disposición al cambio), cada una anclada a
áreas concretas del TRAS y a grupos de la batería de Goldstein. Las viñetas tienen extensión suficiente para explicar la tendencia, sus condiciones de variación, los datos que la sostienen y los recursos asociados. El prompt evita fórmulas repetitivas y **prohíbe la nomenclatura psicométrica** —siglas de escala, puntajes T y percentiles—.
El informe imprime el encuadre completo encima de las viñetas. Las dimensiones sin material que
las sustente se omiten: es preferible un perfil de cinco viñetas sólidas que nueve rellenas.

Si usted administra un MMPI-A real, sus resultados **no entran por aquí**: entran como anexo
pegado (punto 2).

**7. Flujos de IA consolidados (`aiflow.js`) y privacidad.**
El patrón *construir prompt → copiar → pegar JSON → validar → importar* vivía duplicado en
`interpret.js` y `goldstein.js`. Ahora existe un primitivo único: cada flujo nuevo solo declara
cómo construye su prompt y cómo aplica el resultado. Sobre él se montan tres flujos:

| Flujo | Qué hace |
|---|---|
| **HC con apoyo de IA** (paso 3) | Ordena una HC en texto libre en los ocho campos y redacta el resumen clínico contextual de extensión flexible. |
| **Entrevista con IA** (paso 5) | Transcribe y ordena las 76+ respuestas. Regla central: *ajusta la redacción, nunca el contenido*. Los ítems sin respuesta se omiten, no se inventan. |
| **Perfil de personalidad** (paso 10) | Genera las viñetas por dimensión. |

> **Advertencia de privacidad.** Estos prompts **salen de su navegador hacia una IA externa**
> (Claude, ChatGPT, Gemini). Todo el texto pasa antes por una despersonalización que sustituye
> el nombre del evaluado por sus iniciales (`Santiago Páez García` → `S. P. G.`). Esa medida es
> *best-effort*, no anonimato garantizado: no cubre nombres de terceros ni datos que usted
> escriba en campos libres. Se trata de información clínica sensible de un menor de edad; la
> responsabilidad sobre su custodia y circulación sigue siendo suya. Si el flujo se interrumpe,
> nada se pierde: lo ya insertado queda guardado.

**8. Configuración reubicada.**
El panel *Configuración* pasó de estar sobre la lista de pasos a estar **debajo del paso Manual**,
que es donde se lo busca. Incorpora el botón «Limpiar casos duplicados».

**Compatibilidad.** Los casos de la v0.14 se migran solos: `normalizeCase` deriva `createdAt`
de `meta.fecha`, crea `historial`, `anexos: []`, `personalidad` vacía y `hc.resumen: ''`. No se
pierde ningún dato y el informe conserva su aspecto anterior hasta que usted escriba un resumen.

## Devolución terapéutica interactiva · v0.16.6

En **Centro de informes → Devolución terapéutica para adolescente** se configura el tratamiento lingüístico, alias, pronombres, paleta, profundidad y manejo de temas sensibles. El botón **Generar con IA** usa el puente universal: copia el prompt, abre la IA elegida y permite devolver el JSON a la app.

La salida no es un informe técnico. Es una página autónoma para la persona adolescente, con tarjetas desplegables, recursos, ruta terapéutica seleccionable y un botón para preparar los temas de la siguiente sesión. El HTML exportado puede subirse directamente a Cloudflare Pages.

La opción trans/diversa solo se sugiere cuando el campo explícito de sexo/género contiene esa información. En cualquier otro caso se mantiene la plantilla neutra o la selección manual del profesional.

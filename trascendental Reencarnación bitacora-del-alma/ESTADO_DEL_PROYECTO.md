# PWA-62 · menú contextual normalizado (20-jul-2026)

La navegación del informe y la crónica comparte ahora una misma gramática responsive: barra inferior fija en celular y barra contextual superior de ancho completo en tableta y computador. Las exportaciones HTML, Word, TXT y JSON se reunieron en un menú único con explicaciones; `Datos y respaldo` dejó de parecer un botón inactivo. Los tooltips se renderizan en una sola capa global, sin duplicación ni recorte. Las pantallas de informe, crónica e imágenes aprovechan un contenedor amplio, mientras el texto conserva una columna legible. Ver `CAMBIOS_PWA62_MENU_CONTEXTUAL.md`.

`SW_VERSION`: `bitacora-alma-v20260720-pwa-62-menu-contextual`.

---

# PWA-61 DSEBI · auditoría triple y robustecimiento (19-jul-2026)

Auditoría A1/A2/A3 aplicada sobre PWA-60. Cambios críticos y altos: restauración transaccional de respaldos con rollback; borrador automático recuperable durante los flujos; eliminación del solapamiento móvil entre la barra fija y las acciones de guardado; accesibilidad de teclado, foco, nombres accesibles, zoom y regiones vivas; apertura de IA externa con confirmación real de copia; selector persistente de voces y preferencia por español de Colombia; respaldo de preferencias de narración. Ver `AUDITORIA_DSEBI_PWA61.md`.

`SW_VERSION`: `bitacora-alma-v20260719-pwa-61-dsebi`.

---

# ESTADO DEL PROYECTO — Bitácora del Alma
Última actualización: 19 de julio de 2026 (PWA-60, vigencia inteligente y reorganización narrativa)

## Qué es esta app
Aplicación web estática (sin backend, sin API de pago) que ayuda a una persona a organizar su historia de vida, vínculos, sueños y presencias, y a generar —vía copiar/pegar en una IA externa— una lectura simbólica de "posibles vidas pasadas". Es una herramienta de introspección narrativa, no una app clínica ni una prueba de reencarnación real.

## Regla epistémica central (NO NEGOCIABLE, se estableció tras mucha discusión)
- La IA que genera la lectura NUNCA inventa un período, evento o identidad histórica que el usuario no haya nombrado explícitamente en su propio material.
- Cuando el usuario SÍ nombra un referente histórico real y verificable (ej. "esenios", "batalla de Boyacá"), la IA puede usar conocimiento histórico real para dar el rango de fechas de ESE referente — esto no es inventar, es contextualizar con datos reales algo que el usuario ya dijo.
- A los vínculos reales del usuario (personas de su vida actual) nunca se les asigna una identidad histórica definitiva ("Juan fue tal persona"). Se usa lenguaje de posibilidad y rol simbólico ("quien guardaba el umbral ⇄ hoy es Juan").
- Ningún dato del usuario se omite o resume por brevedad — todo se organiza, nada se descarta.
- Las pérdidas reales de terceros (duelos, suicidios) nunca reciben interpretación causal kármica — se respeta el relato del usuario sin agregar explicación no solicitada.

## Arquitectura técnica
- HTML/CSS/JS puro, sin build, sin frameworks. Multiarchivo para desplegar en Cloudflare Pages (o cualquier hosting estático).
- Persistencia: `localStorage` del navegador (NO `window.storage`, que solo existe dentro de artifacts de Claude.ai).
- Flujo de IA: la app genera un prompt, el usuario lo copia y lo pega en una IA externa de su elección (hub con Claude, ChatGPT, Gemini, Perplexity, Copilot, DeepSeek, Mistral, Grok), y luego pega la respuesta JSON de vuelta en la app.
- PWA: tiene `manifest.webmanifest` y `sw.js` para poder instalarse como app.

## Estructura de archivos (Paso 20, versión vigente)
```
index.html, manifest.webmanifest, sw.js
css/main.css
js/state.js          — estado global, router, storage, hub de IAs
js/mic.js             — dictado por voz con Web Speech API
js/pwa.js             — registro de service worker
js/screens-intro.js   — splash, home, manual, privacidad, modo rápido, entrevista IA, alias
js/screens-principios.js — 13 principios de Kardec/Weiss/Xavier/Domingo Soler
js/screens-modulos.js — módulos 2 y 3 (guías, vínculos)
js/screens-familia-eventos.js — módulos 4 y 5 (familia, eventos difíciles)
js/screens-importar.js — importador de historia completa
js/screens-tirada.js  — tirada simbólica + construcción del prompt principal
js/screens-informe.js — informe, mapa de retornos, exportaciones, historial
```


## Últimos cambios — PWA-60: vigencia inteligente, collage propio y barra compacta de crónica

**Motor de vigencia por firmas, no por fechas frágiles**: la app ahora conserva una firma compacta de los datos que originaron la lectura y otra de la lectura que originó la crónica. Esto permite distinguir cuatro estados reales sin depender de que todos los módulos actualicen manualmente una fecha: lectura vigente, lectura desactualizada, crónica inexistente y crónica desactualizada. Los casos antiguos sin metadatos se normalizan al abrirse para mantener compatibilidad y evitar falsas alertas.

**Prioridad única de actualización**: si cambian los módulos, ajustes o la tirada después de generar la lectura, solo palpita `Nueva lectura`; después de crear una lectura nueva, si la crónica pertenece al informe anterior, solo palpita `Rehacer crónica`. Nunca se activan dos pulsos simultáneos. La animación es lenta, eleva levemente el tamaño y respeta `prefers-reduced-motion`.

**Cajón superior del informe reorganizado**: se agregó `Nueva lectura`, que lleva directamente a la pantalla `Toca para revelar`; el botón de crónica cambia entre `Generar crónica`, `Ver mi crónica` y `Rehacer crónica`; y todas las acciones de escritorio incluyen tooltips descriptivos. En móvil hay cuatro accesos persistentes: Crónica/Generar/Rehacer, Nueva lectura, Exportar y Más.

**Collage narrativo convertido en módulo visual propio**: ahora aparece inmediatamente debajo de `Árbol de red` en `Las imágenes de tu lectura` y abre la ruta independiente `collage-prompt`, conservando el prompt, copiar y el hub de IAs externas. La tarjeta muestra `Requiere crónica` o `Actualizar` según corresponda y ofrece la acción correcta si falta la crónica o si la cadena lectura→crónica quedó desfasada. El collage ya no queda escondido después de las tarjetas de persona.

**Crónica con barra horizontal de iconos**: `Atrás`, `HTML`, `Word`, `Nueva versión/Rehacer` y `Narrar` caben en una sola fila compacta con tooltips y etiquetas accesibles. El botón grande de narración fue integrado en la barra. Se agregó exportación `.doc` compatible con Word, además del HTML ya existente.

**Correcciones colaterales necesarias**: `guardarAvanceRapido()` conserva ahora la crónica y sus metadatos —antes una edición de módulos podía sobrescribir el registro sin esos campos—; la crónica generada desde una lectura recién actualizada guarda el estado completo del caso; `Árbol de red` abre directamente su pestaña; y la animación de entrada dejó de usar `transform`, evitando que la barra fija móvil apareciera temporalmente al final del documento durante la transición.

**Verificación ejecutada**: sintaxis de todos los JavaScript y del service worker; balance CSS; 46 rutas registradas y 46 destinos, sin rutas ausentes; pruebas reales en Chromium de los tres estados de vigencia, cinco acciones horizontales de la crónica, exportación Word, tarjeta y pantalla propia del collage, apertura directa del árbol de red, botón de crónica ausente, y cuatro acciones móviles. También se probó persistencia de metadatos con `localStorage` simulado.

`SW_VERSION` subida a `-pwa-60`.

## Piezas ya construidas y validadas en el informe
- Resumen ejecutivo con cifras (etapas, con fecha real, figuras que reaparecen) + botones de ayuda "?"
- Mapa conceptual de palabras clave con flechas cronológicas
- Línea de tiempo con divulgación progresiva (tarjetas colapsadas por defecto)
- Campo `evento_critico` por etapa (patrón vínculo→ruptura→inscripción, inspirado en el caso de Catherine en *Muchas vidas, muchos maestros*)
- Campo `etapa_relacionada` para conectar la constelación con la etapa correcta
- Edición in-situ del período cuando la IA lo deja vacío (el usuario puede agregar su propia intuición, marcada como tal, sin volver a pasar por la IA)
- Mapa de retornos con dos vistas: grafo (bipartito, con botón de "historia ampliada") y tabla (tarjetas apiladas, no `<table>` — evita bug de scroll horizontal en móvil)
- `resumen_estaciones_narrativas` — sección en prosa continua, no solo tarjetas

## Pendiente / próximos pasos identificados
1. Validador/reparador de JSON más tolerante (si la IA externa devuelve texto alrededor del JSON)
2. Auditoría visual en móvil real (no solo revisión de código) de la vista de tabla y la densidad del home
3. Exportación HTML premium imprimible (previo a PDF/DOCX)
4. Patrón de "cajón in-situ" para editar vínculos sin navegar a una pantalla separada (identificado, no implementado)
5. Confirmar que el prompt de "referente nombrado" se siga cumpliendo en corridas nuevas

## Sugerencias de diseño guardadas — pendientes de implementar (tooltips)
Reutilizar siempre el patrón ya existente `.help-btn-mini` + `.help-tip` (ya usado en el resumen ejecutivo del informe) en vez de crear un tercer patrón de ayuda.

1. **Pantalla `tirada-resultado`** (Antigüedad/Arquetipo/Aprendizaje): agregar tooltip GENÉRICO aclarando que estos tres valores son aleatorios (`pickRandom` sobre listas fijas en `screens-tirada.js`), no calculados de los datos del usuario — hoy la pantalla no lo dice en ningún lugar.
2. **Resumen ejecutivo del informe, `tirada-tags`**: agregar ahí el tooltip AJUSTADO AL CASO que el usuario pidió originalmente para la pantalla de arriba — aquí sí existen las etapas para citar contenido real, a diferencia de `tirada-resultado` donde `cur.informe` todavía no existe.
3. **Etiquetas de contexto por etapa** (período, contexto sociopolítico, género, edad percibidos): tooltip ajustado al caso usando `senal_origen` / `evidencia_periodo`, que ya existen en cada etapa.
4. **Insignia de confianza en el mapa de retornos** ("Confianza: alto/medio/bajo"): tooltip ajustado al caso usando el campo `evidencia` que ya trae cada conexión.
5. **Pregunta "¿Lo sientes kármico?" en módulo de eventos difíciles**: tooltip genérico aclarando que es percepción subjetiva del usuario, no algo que la IA verificará.
6. **Hallazgo colateral, no es sobre tooltips**: `auditoria_final` (riesgos de sobreinterpretación, datos no usados, etc.) hoy solo se renderiza en el HTML exportado, nunca en la pantalla del informe dentro de la app. Si se decide mostrarla también en vivo, sería candidata natural para tooltips explicativos por categoría.
7. **Dónde NO agregar**: tarjetas del home (ya tienen subtítulo propio, un tooltip sería redundante).

## Corrección crítica de proceso — recordatorio permanente
CADA VEZ que se entregue un zip nuevo, hay que subir el número de `SW_VERSION` en `sw.js` (ej. de `-pwa-20` a `-pwa-21`). Si no se hace, el navegador nunca detecta la actualización y el aviso "Actualización disponible" no aparece, aunque el resto del código sí haya cambiado — el service worker compara el archivo byte a byte, no el contenido de la app. Este bug ya ocurrió una vez por no seguir esta regla.

## Últimos cambios (ronda: simplificación de la vista de retornos + barra de progreso + reorganización de la crónica)
Retroalimentación muy positiva sobre el reproductor de voz de la ronda anterior (mini-reproductor persiste al navegar, cambio de velocidad conserva el lugar) — confirmado que funciona como se diseñó. Se agregaron tres piezas más, todas confirmadas explícitamente por el usuario antes de construirlas.

**Simplificación de la vista fusionada de retornos (extensión del punto 3)**: cada etapa ahora muestra una viñeta compacta por defecto (título, período, y solo los nombres de las personas conectadas) — todo el detalle que antes se mostraba siempre expandido (rol/espacio, evento crítico, huella, aprendizaje, y las conexiones completas con su propia "historia ampliada") vive ahora detrás de un botón "Ver detalle completo", oculto pero presente en el HTML, no eliminado. Verificado con DOM real (jsdom): el resumen compacto aparece, el detalle está oculto por defecto pero el dato completo sigue existiendo en el marcado, el botón alterna correctamente en ambas direcciones, y una etapa sin conexiones no muestra un resumen vacío.

**Barra de progreso en el mini-reproductor**: aproximación por fragmentos narrados sobre el total (no hay temporización real por palabra disponible) — declarado así en el propio comentario del código para no prometer más precisión de la que existe. Verificada con tres puntos de control (1 de 4 = 25%, 2 de 4 = 50%, 4 de 4 = 100%).

**Botones de la crónica movidos arriba**: "Exportar HTML", "Nueva versión" y "Atrás" ahora viven en una fila compacta justo debajo de las migas de pan, en vez de al final de una página que puede ser larga — el botón "Volver al informe" del pie se conserva también, coherente con el resto de la app.

**Preguntas del usuario respondidas, sin implementar todavía**: confirmado que el narrador usa una sola voz por diseño (la primera en español que encuentre el navegador) — selector de voces múltiples quedó ofrecido, no construido. La idea de un indicador de "sugerencia de actualizar" quedó pendiente en esa ronda; fue resuelta posteriormente en PWA-60 mediante firmas de contenido, una solución más fiable que depender solo de fechas separadas.

`SW_VERSION` subida a `-pwa-59`

## Ronda anterior (reproductor de voz para la crónica)
El botón "Iniciar narración" que faltaba, señalado explícitamente por el usuario dos rondas atrás, ahora existe de verdad — no solo el texto del botón, sino el motor completo detrás.

**Motor de narración construido** (`NARRACION`, en `screens-informe.js`, antes de la ruta de la crónica): reproducir, pausar, reanudar, detener, cambiar velocidad (1×/1.5×/1.8×/2×) — usando la API nativa `speechSynthesis` del navegador, sin ningún servicio externo. La crónica se divide en fragmentos (epígrafe, cada capítulo, cierre) para poder indicar cuál se está narrando en cada momento.

**Mini-reproductor que sobrevive a la navegación**: se verificó explícitamente que el enrutador (`go()`) solo reemplaza el contenido de `#app` — el mini-reproductor se crea como hijo directo de `document.body`, fuera de ese contenedor, así que sigue visible y funcional aunque el usuario navegue a otra pantalla mientras se reproduce, tal como pedía el plan original.

**Cambio de velocidad a mitad de reproducción**: la API de síntesis de voz no permite cambiar la velocidad de un fragmento que ya se está hablando — se resolvió reconstruyendo la cola desde el fragmento actual en adelante con la nueva velocidad, en vez de reiniciar desde el principio. Verificado explícitamente que esto funciona.

**Preferencia de velocidad persistida** en `localStorage` (`balma:tts-config`), cargada al iniciar la app.

**Honestidad declarada en la propia interfaz, no oculta**: nota visible bajo el botón advirtiendo que en varios celulares la narración se detiene si se bloquea la pantalla o se cambia de app — limitación real y documentada del sistema operativo, no de esta app, consistente con lo que ya se le había advertido al usuario en una ronda anterior antes de construir nada.

**Verificación con mocks realistas de `speechSynthesis`, no solo revisión de código**: se instaló `jsdom` temporalmente y se simuló el comportamiento real de encolado secuencial del navegador (cada fragmento dispara su propio evento solo cuando "empieza a hablarse", no todos a la vez) — se encontraron y corrigieron dos descuidos del propio arnés de prueba en el camino (asignar la API mockeada tanto en `window` como en el ámbito global de Node, dado que los navegadores exponen las Web APIs en ambos lugares automáticamente y Node no). Con el mock corregido, se verificó: los cuatro fragmentos se encolan en el orden correcto con el texto correcto; el índice y el título mostrado avanzan correctamente al iniciar cada fragmento; pausar cambia el estado y el ícono del botón; cambiar velocidad a mitad de reproducción reconstruye la cola desde el fragmento correcto (no desde cero) con la nueva velocidad aplicada y la persiste; terminar el último fragmento oculta el mini-reproductor y vuelve al estado detenido. Dependencias de prueba eliminadas al finalizar.

**Pendiente, no tocado esta ronda**: la simplificación de la vista fusionada de retornos (extensión del punto 3), que el usuario también señaló como incómoda.

`SW_VERSION` subida a `-pwa-58`

## Ronda anterior (rediseño acordado de la tarjeta de persona)
El usuario mostró capturas reales con texto truncado a mitad de palabra ("médico y cui…", una frase cortada antes de su idea central) y señaló, con razón, que el error de la ronda pasada no fue solo el bug de superposición sino la decisión de recortar texto largo en vez de pedir texto corto desde el origen. Se acordó explícitamente, referencia visual de por medio, qué llevaría cada tarjeta antes de tocar código.

**Causa raíz corregida en la fuente, no en el síntoma**: se agregaron `frase_breve_patron` y `frase_breve_hoy` al esquema de `arcos_relacionales` en el prompt principal de la lectura — instrucción explícita de que sean frases nuevas y completas en sí mismas (máximo 10-12 palabras), no resúmenes recortados de los campos largos existentes. Verificado ejecutando `buildPrompt()` de verdad (mismo método riguroso de rondas anteriores): los campos se interpolan correctamente, sin romper la plantilla.

**Rediseño visual completo de `buildTarjetaPersonaSVG`, los cinco puntos acordados**:
1. Estrellas compactas arriba a la derecha, ya no una fila ancha centrada.
2. Símbolo central sin cambios de fondo, solo reposicionado más arriba en el flujo.
3. Chips de etapa reducidos a círculo con número únicamente — el rol ya no vive ahí.
4. Nueva sección "Etapas y roles" con espacio real por línea (26px fijos, truncado de seguridad a 55 caracteres en vez de 13) — el texto largo de Claudia ("médico y cuidador en la vejez") ahora se muestra completo.
5. Hasta dos secciones tipo "habilidad" (ícono + título elegido con criterio + la frase breve nativa), reemplazando la cita truncada de "Hoy".
6. Leyes en fila horizontal compacta (ícono + palabra), no círculos grandes apilados.
7. Nueva etiqueta de nivel de vínculo bajo el nombre ("VÍNCULO CON ARCO PROPIO" / "VÍNCULO BREVE").

**Verificación dirigida al punto exacto que falló antes**: se reconstruyeron tres casos reales (Claudia con el rol largo real, Tío Pedro en nivel ligero, un caso de máximo estrés con nombre colectivo largo + seis etapas + tres leyes + dos habilidades) — los tres válidos como XML, cero fragmentos truncados a mitad de palabra, separación real de 26px confirmada entre líneas de "Etapas y roles" (el punto exacto del bug anterior), y las tres leyes confirmadas en fila horizontal, no apiladas.

**Pendiente, explícitamente no tocado esta ronda**: el botón "Iniciar narración" en la pantalla de la crónica (punto 1) y la simplificación de la vista fusionada de retornos (extensión del punto 3) — ambos quedaron señalados por el usuario en la ronda anterior, sin resolver todavía.

`SW_VERSION` subida a `-pwa-57`

## Ronda anterior (cuatro correcciones + fusión real de red/matriz)
El usuario probó la app y reportó cuatro problemas concretos en una sola tanda.

1. **Título de tarjeta desbordado**: confirmado — el nombre tenía tamaño de letra fijo (46px) sin ningún ajuste, y un nombre colectivo largo como "Mujeres de la experiencia espiritual" (proveniente de constelación, no de una persona individual) se salía del marco. Corregido con tamaño dinámico según longitud real del nombre (estimación de ancho en píxeles, con margen real de seguridad — el primer intento a 520px de presupuesto quedó demasiado justo, ajustado a 500px con `Math.floor`), y un truncamiento de última instancia para nombres extremos.
2. **Botón "Ver y escuchar mi crónica" no cumplía lo que prometía**: el reproductor de voz (punto 1) todavía no existe — el texto del botón se adelantó a la función real. Corregido a "Ver mi crónica" hasta que la función de escucha exista de verdad.
3. **"Exportar página HTML" reubicado y renombrado** a "Informe global HTML", movido del grupo "Datos y respaldo" al grupo "Informe" (junto a Ejecutivo HTML y Word), tanto en la barra de escritorio como en el cajón "Más" de móvil.
4. **Fusión real de vista de red y vista matriz — confirmado que nunca se había implementado, solo diagnosticado**: reescritura completa de `renderMapaRetornos`, eliminando el toggle de dos pestañas. Ahora es una sola vista organizada por etapa: cada etapa muestra sus propios campos (rol, evento crítico, huella, aprendizaje) y, anidadas debajo, las personas que resuenan con ella — sin duplicar el mismo dato en tres tarjetas distintas como antes (vista de red, tarjeta de matriz por conexión, tarjeta de matriz por etapa). El resumen de arcos relacionales por persona se preserva como sección aparte al inicio, para no perder ese contenido al fusionar.

**Bug crítico encontrado y corregido antes de que causara daño real**: la función se llamaba pasándole toda la pantalla del informe (`s`) en vez del contenedor específico — la versión anterior funcionaba porque solo tocaba subelementos con `querySelector`, pero la nueva hace `container.innerHTML =` directamente, lo que habría borrado el informe completo al reemplazar todo su contenido. Corregido pasando el contenedor correcto (`#mapa-retornos-unificado`).

**Verificación con DOM real, no solo revisión de código**: se instaló `jsdom` temporalmente y se ejecutó `renderMapaRetornos` contra un DOM real con datos simulados (tres etapas, dos personas conectadas a la misma etapa, una etapa sin conexión, un arco relacional) — confirmado que la función corre sin errores, el resumen de arcos aparece, las tres etapas se muestran, la etapa con conexiones anida correctamente a las dos personas, la etapa sin conexión no genera un contenedor vacío, y el botón de "historia ampliada" funciona al hacer clic. Dependencias de prueba eliminadas al finalizar, sin dejar rastro en el proyecto.

`SW_VERSION` subida a `-pwa-56`

## Ronda anterior (rediseño de fondo de la tarjeta de persona)
El usuario compartió una tarjeta real generada (Victoria Rosas) con texto visiblemente superpuesto, y señaló algo más importante que el bug: varias rondas seguidas agregando texto (línea por etapa con período+género+rol, párrafos de "hoy") habían alejado la tarjeta de la intención original — símbolo pequeño, una palabra, no párrafos.

**Diagnóstico exacto del bug, no solo observación visual**: la posición vertical de cada etapa en "Ecos de otros tiempos" usaba un incremento fijo de 24px por fila (`i*24`), sin importar si esa etapa envolvía a una o dos líneas de texto (2×19=38px) — cualquier etapa que envolviera a dos líneas garantizaba que la siguiente empezara a dibujarse antes de que la anterior terminara.

**Decisión de diseño, no solo parche**: en vez de corregir el cálculo de altura dinámica (que seguiría siendo frágil ante la próxima variación de texto), se eliminó la clase entera del problema. Rediseño completo de `buildTarjetaPersonaSVG`:
- **Chips compactos de una sola línea por etapa** (número + una palabra truncada con elipsis a 13 caracteres, nunca envuelve a una segunda línea) reemplazan las líneas de período+género+rol y el bloque "Ecos de otros tiempos" completo. Layout en cuadrícula de tres por fila, con alto de fila fijo — imposible que se superpongan porque cada chip mide siempre lo mismo, sin importar el contenido real.
- **"Hoy" convertido en cita corta destacada** (estilo "Modo sabelotodo" de la referencia original), truncada con margen real a 56 caracteres — verificado con una estimación de ancho en píxeles (Georgia cursiva ~8.5px/carácter), no solo un límite de caracteres arbitrario; el primer intento a 78 caracteres se estimó en 536px contra ~528px disponibles, prácticamente sin margen — ajustado a 56 caracteres (~493px) para tener holgura real.
- Toda la función reescrita con un cursor Y único que fluye de arriba hacia abajo, reemplazando las posiciones absolutas fijas (`y=245`, `cy=410`) que existían antes — reduce el riesgo de que un futuro cambio reintroduzca este mismo tipo de bug en otra sección.

**Verificación exhaustiva antes de entregar**: se reconstruyó el caso EXACTO de Victoria Rosas reportado por el usuario (mismos textos largos) y se confirmó, extrayendo las coordenadas reales del SVG generado, que las tres etapas quedan en una sola fila sin superposición. Se probó también un caso de seis etapas (dos filas de chips, confirmado con separación real de 44px entre filas) y un caso sin ningún dato de contenido — los tres válidos como XML.

`SW_VERSION` subida a `-pwa-55`

## Ronda anterior (punto 4 — barra de acciones fija en el informe)
Siguiente en el orden de prioridad que el usuario marcó. Antes de construir, se encontró y corrigió otro caso del mismo bug de exportación incompleta ya corregido la ronda pasada en otro punto de la app: `buildCaseExport()` (usada por el botón de exportar desde la propia pantalla del informe) tampoco incluía `id` ni `cronica` — mismo patrón, ubicación distinta.

**Reestructuración completa de los botones de acción del informe**: los siete botones que antes vivían dispersos al final de la pantalla (exportar HTML/TXT/JSON, informe ejecutivo HTML/Word, mapas y tarjetas, crónica) se consolidaron en un único sistema de acciones centralizadas (`accionCronica`, `accionInformeHtml`, etc.), reutilizado por tres superficies distintas sin duplicar lógica:

- **Barra fija de escritorio** (`@media (min-width:760px)`): sticky en la parte superior, agrupada por categoría (acción principal, informe, gráficos, datos y respaldo) tal como especificaba el plan.
- **Tres controles fijos en móvil**: Crónica (acción directa), Exportar y Más — cada uno de estos dos últimos abre un cajón inferior deslizante con las opciones de su categoría, en vez de llenar la pantalla de siete botones.
- **Cajón inferior reutilizable**: mismo componente para "Exportar" y "Más", con contenido distinto según cuál lo abrió.

Verificado que los once identificadores de botones (barra + móvil + cajón) tienen exactamente un manejador cada uno, sin duplicados ni huérfanos, y que no quedó ninguna referencia residual a los IDs de botones retirados.

**Pendiente explícito**: el botón principal dice "Ver y escuchar mi crónica" en el texto del plan original, pero el reproductor de voz (punto 1) todavía no existe — por ahora el botón solo lleva a "ver", sin "escuchar" real todavía disponible.

`SW_VERSION` subida a `-pwa-54`

## Ronda anterior (puntos 6 y 7 — respaldo completo y diferenciación de casos)
Retomado el plan de ocho puntos que se había quedado pausado por el trabajo en tarjetas de persona. Se siguió el orden de prioridad que el propio usuario había marcado — respaldo completo y multicaso primero, por estar directamente ligados al incidente de contaminación de datos ya vivido en esta conversación.

**Investigación real del modelo de datos antes de construir**: confirmado que solo existen dos claves de almacenamiento (`balma:index` y `balma:entries:{id}`), sin ninguna configuración o preferencia separada todavía — así que el respaldo completo por ahora cubre exactamente eso, con formato extensible para el futuro.

**Bug de seguridad real encontrado durante la revisión, no buscado deliberadamente**: la función "Cargar bitácora" nunca guardaba la entrada importada como caso persistido — solo la cargaba en la sesión en memoria, sin limpiar `cur._editingEntryId`. Si quedaba un id de sesión anterior, un guardado posterior podía sobrescribir silenciosamente un caso existente sin relación. Corregido de raíz.

**Segundo hallazgo real**: la exportación de un caso individual no incluía ni el `id` ni la `crónica` — sin el id, nunca había sido posible detectar colisión al reimportar; sin la crónica, se perdía silenciosamente al exportar y reimportar un caso. Ambos agregados.

**Construido**:
- `exportarRespaldoCompleto()` / `restaurarRespaldoCompleto()` en `state.js` — probadas con un ciclo completo real (exportar dos casos simulados, restaurar en almacenamiento vacío, confirmar que el índice queda correcto) y con rechazo de formato inválido, no solo revisión de código.
- Restaurar es reemplazo total, no fusión — declarado explícitamente en el código y en la interfaz, con un paso de confirmación obligatorio antes de ejecutar, mostrando cuántas bitácoras contiene el archivo.
- Nueva pantalla `respaldo-completo`, con tarjeta propia en el inicio, distinta de "Importar una bitácora" (caso individual).
- "Cargar bitácora" renombrada a "Importar una bitácora" con la aclaración exacta del plan del usuario ("Añade un caso guardado sin reemplazar los demás"), y reescrita con detección de colisión de id real: si el archivo importado coincide con un caso ya guardado, se pregunta actualizar / guardar como copia / cancelar — nunca sobrescribe en silencio.

**Pendiente, no tocado esta ronda**: la reorganización completa del inicio (punto 8, orden de los once elementos), y el enriquecimiento de las tarjetas de "Bitácoras guardadas" con número de etapas y estado (parte del punto 7, pendiente de una ronda dedicada).

`SW_VERSION` subida a `-pwa-53`

## Ronda anterior (cinco mejoras a la tarjeta de persona)
A partir de la crítica del usuario sobre la tarjeta de Shirley (imagen real de prueba) y las referencias de símbolos célticos, se implementaron cinco piezas — con una posición propia sobre las referencias visuales: se rescató el lenguaje de trazo fino, no las formas con nombre y tradición propia (Awen, Claddagh, pentagrama, cruz celta), por ser incompatibles con la identidad espírita ya establecida de la app.

1. **`etapasDetalle` conectado a la tarjeta**: "Ecos de otros tiempos" ahora es línea por etapa (número · período · género si existe · rol), no un párrafo general — hallazgo real: el dato ya existía desde hace dos rondas pero nunca se había conectado a la tarjeta visual, solo al prompt externo que se dejó de usar.
2. **Íconos propios para las tres leyes** (balanza, corazón, manos) en vez de círculos de color planos.
3. **Set de símbolos ampliado de trece a veinticinco**, con doce símbolos nuevos genéricos (vela, luna, sol, libro, semilla, espejo, campana, nudo, gota, cadena, lámpara, brújula) — los veinticinco validados individualmente contra un parser XML estricto, cero errores.
4. **`simbolo_sugerido` agregado al esquema del prompt principal** (`screens-tirada.js`), con lista cerrada interpolada dinámicamente desde `SIMBOLOS_VALIDOS` (se mantiene sincronizada automáticamente, sin duplicar la lista a mano). El selector de símbolo ahora prioriza esta sugerencia si es válida, con la heurística de palabras clave como respaldo — probado con tres casos reales (sugerencia válida gana, sin sugerencia cae a heurística, sugerencia inválida se ignora sin filtrarse).
5. **Ícono de compartir construido fiel a la referencia** (tres círculos huecos, dos barras diagonales gruesas, extremos redondeados) y función `compartirTarjetaPersona()` con `navigator.share()` y descarga como respaldo automático si el navegador no lo soporta.

**Verificación más rigurosa hasta ahora en este proyecto**: la interpolación del punto 4 se confirmó ejecutando `buildPrompt()` de verdad (con dependencias simuladas), no solo revisando que la sintaxis pasara — se comprobó que el texto interpolado aparece correctamente y no queda ningún `${...}` roto.

**Bug real encontrado y corregido sin que se pidiera**: el canvas de descarga tenía tamaño fijo (1280×1800) pese a que la altura de la tarjeta es dinámica desde la ronda anterior — cualquier tarjeta con una altura real distinta habría salido distorsionada en el PNG. Corregido leyendo las dimensiones reales del viewBox antes de rasterizar, ahora exportando al doble de resolución para nitidez.

`SW_VERSION` subida a `-pwa-52`

## Ronda anterior (tarjetas de persona generadas dentro de la app)
El usuario propuso una idea que resuelve de raíz la causa común de casi todos los bugs de imágenes perseguidos en las últimas diez rondas (invención, truncamiento, desproporción): si la tarjeta se ensambla dentro de la app con símbolos pre-diseñados en vez de pedírsela a una IA externa no determinista, esa clase entera de problemas deja de existir. Alcance confirmado explícitamente por el usuario: solo las tarjetas de persona pasan a generarse en la app — collage, mapa ilustrado y árbol de red siguen con IA externa tal como están.

**Sistema construido, sin dependencia de ninguna IA**:
- `TARJETA_SIMBOLOS`: doce íconos SVG de trazo simple (llave, corazón, balanza, manos, raíz, espiral, hilo, estrella, pluma, escudo, puerta, ancla, arco), estilo lineal consistente.
- `elegirSimboloParaPersona(p)`: selector basado en reglas — cruza palabras clave del contenido real de esa persona (protege, cierra, enseña, guía, etc.) y sus leyes asociadas para elegir el símbolo más fiel, con reglas de prioridad y respaldo. Probado contra el caso real de Victoria Rosas: eligió correctamente "llave" por la palabra "reclama" en su texto.
- `buildTarjetaPersonaSVG(p, alias)`: ensambla la tarjeta completa como SVG — estrellas, nombre, etapas conectadas (ahora con período/rol/aprendizaje por etapa, del enriquecimiento de la ronda pasada), símbolo central, hasta dos bloques de contenido con envoltorio de texto propio, y leyes al pie.
- `descargarTarjetaPersonaComoPNG`: rasteriza el SVG a PNG vía canvas y descarga directo, con respaldo a SVG si el navegador no puede rasterizar.

**Dos bugs reales encontrados con un parser XML estricto, no solo revisión visual del código**:
1. Las estrellas intentaban meter una etiqueta `<path>` completa dentro del atributo `d="..."` de otra etiqueta — XML inválido, habría roto la tarjeta en cualquier navegador. Corregido envolviendo el símbolo en un `<g>`, igual que ya se hacía correctamente en el símbolo central.
2. Bug de diseño más serio: la altura del lienzo era fija (900), pero la posición del bloque de leyes dependía de cuánto texto hubiera antes — con contenido suficiente, las leyes se superponían con el pie de página fijo o quedaban cortadas fuera del lienzo. Corregido calculando la altura total de forma dinámica según el contenido real, con un mínimo para casos vacíos. Verificado con tres casos (sin datos, un bloque con tres leyes, dos bloques largos con dos leyes): alturas de 750, 994 y 1104 respectivamente, las tres válidas como XML, con margen real confirmado entre el contenido y el pie de página en el caso más cargado.

Pantalla `impresos-graficos` actualizada: la sección de tarjeta de persona ya no copia un prompt — muestra una vista previa en vivo que cambia al elegir otra persona del desplegable, y un botón de descarga directa.

`SW_VERSION` subida a `-pwa-51`

## Ronda anterior (tarjeta enriquecida + collage narrativo)
El usuario confirmó que la tarjeta de Victoria Rosas funcionó bien, con una mejora concreta: quiere período, rol y aprendizaje (en una o dos palabras) por cada etapa conectada, no solo un resumen general. También aclaró que la imagen oscura con nombres inventados (Ricardo Cuervo, Julieta, Juan Pablo) fue generada con la versión anterior a la corrección de aislamiento de contexto de la ronda pasada — no una regresión nueva. Y pidió, sin más rodeos, la imagen de collage narrativo derivada de la crónica que se había quedado pendiente de rondas atrás.

**`getPersonasConEstrellas` enriquecida** con `etapasDetalle`: por cada etapa que conecta a una persona, ahora se cruza el período real (`getPeriodoTexto`), el rol que tuvo ahí (`rol_anterior` de la conexión), y un aprendizaje condensado (de `leccion` o `aprendizaje_pendiente` de esa etapa) — deduplicado por número de etapa. Probado con un caso simulado que replica a Victoria Rosas (tres etapas, tres roles distintos, tres aprendizajes), sin duplicados.

**`buildPromptTarjetaPersona` actualizada** con instrucción de "línea por etapa": formato compacto tipo ficha (número · período · rol · aprendizaje en 1-2 palabras) por cada etapa conectada, reemplazando el resumen largo anterior — más denso en información real, no en texto.

**Nueva función `buildPromptCollageNarrativo()`**: deriva de `cur.cronica` (no del informe), con licencia visual explícitamente ampliada respecto a los otros prompts — colores saturados, atmósferas realistas, técnica libre — pero con el mismo límite de seguridad que en todos los demás: nunca un rostro identificable de una persona real, ni siquiera aquí; se permiten siluetas, manos, figuras a contraluz. Elige entre 4 y 8 capítulos de la crónica para componer un collage unificado. Conectada a la pantalla de impresos gráficos, condicionada a que exista una crónica generada — si no existe, ofrece un enlace directo para generarla primero.

`SW_VERSION` subida a `-pwa-50`

## Ronda anterior (investigación real de la contaminación de datos)
El usuario propuso una explicación mejor que la mía: notó que los nombres inventados en la red podían venir de una mezcla de contexto, no de alucinación pura de la imagen — y señaló un detalle clave ("José hermano" apareciendo como conexión de José mismo) que apunta a datos cruzados, no a invención creativa.

**Investigación real, no solo aceptación de la hipótesis**:
- Se verificó que `cur` (estado en memoria) nunca se persiste en localStorage/sessionStorage — descartado que una recarga restaure una sesión vieja.
- Se verificó que la app siempre arranca en `'splash'` tras cualquier recarga (`DOMContentLoaded` en main.js) — descartado que el enrutador restaure directamente una pantalla de generación con datos vacíos.
- Se confirmó que `impresos-graficos` no tenía ninguna protección contra `cur.informe` vacío o nulo — real, aunque no explica el caso reportado por sí solo.
- **Hallazgo más probable**: el botón "Generar una nueva lectura con estos datos" (`goModulo('tirada')`) preserva correctamente los datos biográficos crudos del usuario, pero exige un nuevo intercambio con la IA externa para producir un informe fresco — y si esa conversación externa tenía contexto de otro caso o prueba anterior, la respuesta pegada pudo llegar ya contaminada, antes de que ninguna imagen la tocara. El código guardaría fielmente lo que se le entregó; el problema estaría en el paso intermedio, fuera del control de la aplicación.

**Protecciones agregadas, dos capas**:
1. Guardia real contra informe vacío en `impresos-graficos`: si no hay etapas cargadas, la pantalla ya no muestra ningún generador — muestra un aviso claro y un botón directo a la bitácora, en vez de permitir construir un prompt con datos vacíos.
2. Nueva "ficha de verificación del caso" visible antes de cualquier generador: alias, número de etapas, número de personas conectadas, y los títulos de las primeras tres etapas — para que el usuario pueda confirmar de un vistazo que está generando desde el caso correcto antes de copiar cualquier prompt.
3. Instrucción explícita de "aislamiento de contexto" agregada a los CINCO prompts que se envían a una IA externa (lectura principal, mapa ilustrado, árbol de red, tarjeta de persona, crónica) — pidiendo ignorar cualquier dato de conversaciones anteriores en el mismo chat, con énfasis especial en el prompt principal de la lectura, identificado como el punto de mayor riesgo real.

`SW_VERSION` subida a `-pwa-49`

## Ronda anterior (diagnóstico de tres fallos reales + módulo de impresos gráficos)
**Diagnóstico 1 — prompt no se activó automáticamente**: identificado como comportamiento de la interfaz de ChatGPT, no un bug propio — el nombre de archivo "Pasted text(160).txt" confirma que el texto pegado excedió el umbral de longitud y se convirtió en adjunto, que ChatGPT trata como documento a analizar, no como instrucciones a ejecutar. Se agregó un aviso explícito en la pantalla de la crónica indicando qué hacer si esto ocurre.

**Diagnóstico 2 — nombres inventados y rostros fotográficos en la red**: hallazgo grave, pendiente de confirmar con el usuario si la prueba usó un prompt fresco o uno guardado de una sesión anterior. Reforzado de inmediato sin esperar esa confirmación, dado el riesgo: prohibición explícita y ampliada contra cualquier rostro o retrato (no solo "sin ilustraciones", ahora también "sin fotos de perfil tipo organigrama corporativo"), y un recordatorio final obligatorio de verificar cada nombre dibujado contra los datos reales antes de entregar la imagen.

**Diagnóstico 3 — mapa ilustrado reducido a 7 de nuevo, íconos grandes**: mismo patrón de inconsistencia del generador ya documentado varias veces; no se encontró causa nueva de código.

**Nuevo módulo `impresos-graficos`**: pantalla central que reemplaza el botón directo del informe hacia el mapa visual — ahora el informe lleva a este módulo, y desde aquí se accede a mapa ilustrado, árbol de red, y la pieza nueva:

**Tarjetas de persona**: nueva función compartida `getPersonasConEstrellas(inf)` (probada con datos simulados) que calcula estrellas, etapas y clasifica cada persona en nivel "rico" (tiene arco relacional longitudinal completo) o "ligero" (solo conexión de constelación) — determinando qué contenido real está disponible para su tarjeta, sin inventar categorías vacías. `buildPromptTarjetaPersona(nombre)` construye un prompt de tarjeta individual, con instrucción explícita de elegir 2-3 campos con más sustancia (no todos), inventar un título evocador por campo sin inventar el contenido, prohibición absoluta de rostros o fotografía, y verificación de payload sin campos nulos (probado). Pantalla nueva con desplegable de personas ordenadas por estrellas.

**CSS**: `select` agregado al estilo compartido de campos de formulario — no tenía estilo propio y se habría visto con apariencia nativa del navegador, rompiendo el tema oscuro.

`SW_VERSION` subida a `-pwa-48`

## Ronda anterior (crónica sin transiciones entre capítulos)
El usuario reportó que la red radial (imagen 2) funcionó bien, pero encontró un error de numeración duplicada en la imagen 1 y un desajuste de títulos entre ambas imágenes. También compartió la crónica completa generada con el narrador rediseñado dos rondas atrás, señalando que se sentía "recortada" y con "escenas sin conexión entre sí".

**Verificación textual real antes de corregir**: se revisaron las doce transiciones entre capítulos de la crónica entregada. Las doce, sin excepción, son cortes limpios a una escena nueva sin ninguna frase puente — dos de ellas incluso anuncian el corte explícitamente ("En otra imagen...", "En otra escena..."). Se confirmó también que doce capítulos para una ruta de aproximadamente doce o trece etapas es casi una correspondencia uno a uno, pese a la instrucción explícita de organizar por "movimientos temáticos, no capítulo por etapa" — esa instrucción no se estaba cumpliendo.

**`buildPromptCronicaNarrativa` reforzada**:
- Nueva regla obligatoria: el número de capítulos debe ser claramente menor al número de etapas, agrupando varias etapas afines dentro de un mismo movimiento.
- Nueva regla de transición obligatoria entre capítulos: cada capítulo (salvo el umbral) debe abrir retomando un hilo emocional, corporal o de pensamiento del capítulo anterior — nunca un corte limpio. Las fórmulas de corte ("En otra imagen...", "En otra escena...") quedaron explícitamente prohibidas, citando los ejemplos reales encontrados. Se agregó instrucción de auto-verificación: revisar cada frontera entre capítulos antes de finalizar.
- Nueva instrucción contra la compresión excesiva: una vez decidido que una escena merece desarrollo, debe llevar textura sensorial real, no la mínima expresión — la brevedad no es virtud en este documento.

**Prompts de imagen corregidos** con la causa señalada por el usuario (numeración duplicada, títulos que no coinciden entre las dos imágenes): nueva regla explícita en ambos prompts (ilustrado y red) de usar cada número de etapa una sola vez, en secuencia, y copiar cada título EXACTAMENTE del payload, sin parafrasear — con la instrucción explícita de que ambas imágenes deben coincidir palabra por palabra al describir la misma ruta.

`SW_VERSION` subida a `-pwa-47`

## Ronda anterior (pivote estratégico — de árbol a red radial persona-céntrica)
El usuario probó el árbol de red dos veces más (imágenes 2 y 3 de esta ronda): ninguna produjo forma de árbol — ambas fueron diagramas de flujo convencionales con cajas y flechas en cuadrícula, una de ellas con ilustraciones pictóricas pese a la prohibición explícita. Tras varias rondas insistiendo en la metáfora del árbol sin resultado, se abandona esa forma específica, siguiendo la propia apertura del usuario hacia "red, tejido, complexus, entramado".

**Diagnóstico adicional del usuario, verificado como válido**: el prompt gastaba demasiado texto describiendo cada etapa (período, evento crítico, huella, aprendizaje) en vez de centrarse en personas y sus vínculos — invirtiendo la prioridad que esta imagen debería tener.

**`buildPayloadVisualMapa` enriquecido**: cada entrada de persona ahora incluye también `rolTuyoEnEsaEtapa` (el rol propio del usuario en esa misma etapa, cruzado desde el arreglo de etapas), no solo el rol de la otra persona — dato que antes no existía y que el usuario pidió explícitamente ("quién era yo en cada período").

**`buildPromptMapaRed` reescrita de fondo, alrededor de cinco ideas nuevas**:
1. Estructura radial: el alma en el centro, personas alrededor, líneas curvas — nunca cajas en cuadrícula con flechas rectas.
2. Conexiones entre reapariciones de la misma persona: si alguien aparece en varias etapas, se traza una línea curva adicional entre esas apariciones, no solo hacia el centro — esto no existía antes.
3. Símbolos y color en vez de etiquetas de campo: nunca escribir literalmente "aprendizaje" o "evento crítico" como palabra — un símbolo y un color por categoría, con leyenda aparte.
4. Prohibición reforzada y explícita de ilustraciones pictóricas, con instrucción de redirigir cualquier impulso ilustrativo hacia cero.
5. Las etapas dejan de ser protagonistas de esta imagen — son puntos de referencia pequeños sobre las conexiones, ya no llevan período/evento/huella/aprendizaje repetidos aquí (esa función es de la primera imagen).

**Primera imagen (símbolos) corregida**: proporción explícita de espacio a favor del texto informativo sobre el ícono — el símbolo se compara al tamaño de un ícono de aplicación, no un protagonista visual.

**Revisado y descartado como bug de código**: la ausencia de período en "El bebé de las gradas oscuras" — `getPeriodoTexto` ya revisa cuatro campos de respaldo sin encontrarse una falla evidente; más probable que sea un vacío real en el contenido de esa etapa específica del informe, pendiente de verificar con el JSON real si el usuario lo comparte.

**Honestidad de proceso**: esta es la reestructuración más grande hasta ahora de esta imagen, y no hay garantía de que el generador produzca una red radial coherente en vez de volver a su patrón por defecto de diagrama de flujo — pendiente de prueba real.

`SW_VERSION` subida a `-pwa-46`

## Ronda anterior (reestructuración causal contra el truncamiento)
El usuario probó el árbol de red rediseñado la ronda pasada y solo mostró 4 de 13 estaciones — más severo que las instancias anteriores (7, 8, 10 de más). Esta vez no se aplicó solo otro refuerzo de instrucción: se identificó una causa estructural concreta.

**Diagnóstico**: la sección "RED DE ARCOS DE RETORNO" construía los nodos de etapa a partir del arreglo "reingresos" (personas con conexión), no del arreglo completo "etapas" — una etapa sin persona conectada nunca entraba al plano de existencia del dibujo, sin importar cuántas veces se pidiera verificar el conteo después. Se observó además que la IA reinterpretó "trayectoria por persona" como cajas de "TRAYECTORIA — ETAPA N", señal de que ya estaba improvisando estructura en vez de seguir la especificada.

**Reestructuración completa de `buildPromptMapaRed`**:
- La verificación de conteo (con lista compacta de las N etapas) se movió al principio absoluto del prompt, antes de cualquier instrucción conceptual — antes vivía enterrada después de varios párrafos de contenido poético (rizoma, degradados, piedra tallada).
- Nueva sección "ESTRUCTURA BASE OBLIGATORIA" que ordena explícitamente: primero los nodos de etapa (del arreglo completo, independientes de si tienen persona), después el árbol de personas, después los arcos que conectan ambos — desacoplando la existencia del nodo de etapa de la existencia de una conexión de persona.
- Densidad drásticamente más agresiva a partir de cuatro etapas: solo número, símbolo/color y máximo cuatro palabras de título por nodo — nada de rol, relación, evento crítico ni aprendizaje en esta imagen.
- Umbral de la sección de trayectoria bajado de seis a tres personas antes de simplificar, y ahora se omite por completo (no solo se simplifica) si la ruta tiene más de ocho etapas — declarado explícitamente como "lujo que se sacrifica primero".
- Contenido poético (rizoma, degradados, piedra) recortado a lo esencial para no competir por atención con la instrucción estructural.
- `SW_VERSION` subida a `-pwa-45`

**Honestidad de proceso registrada explícitamente para el usuario**: esta ronda no garantiza que el problema esté resuelto — existe la posibilidad real de que sea un límite técnico del generador de imágenes ante composiciones con muchos elementos con texto legible, no solo un problema de instrucción. Pendiente de una nueva prueba real.

## Ronda anterior (árbol trascendental — principio general contra la alucinación)
A partir de una discusión conceptual con el usuario (no una corrección de bug, una profundización filosófica): la metáfora del árbol se replantea como "trascendental" — raíces de raíces, ramas que son raíz de otra existencia, no un árbol botánico ni genealógico.

- **Principio general contra la alucinación agregado al INICIO de ambos prompts de imagen** (antes solo vivía en secciones específicas): "cuando un dato no exista, tu respuesta correcta es dejar ese espacio vacío" — declarado como principio que aplica a toda la imagen, no una regla local.
- **Propósito de cada imagen ahora explícito dentro de su propio prompt**: la ilustrada es la mirada rápida y total (equivalente visual del informe ejecutivo); la de red es donde vive la complejidad relacional profunda. Esta distinción surgió de una pregunta del propio usuario sobre para qué sirve cada opción.
- **Inconsistencia real encontrada y corregida**: el párrafo de apertura de `buildPromptMapaRed` seguía diciendo "árboles genealógicos" y "un ÁRBOL GENEALÓGICO de la vida actual" — quedó desalineado con el rediseño de la ronda anterior que ya había retirado esa idea de la sección inferior del mismo prompt. Reescrito de inicio a fin para que todo el prompt sea consistente.
- **Degradados de disolución**: en vez de intentar dibujar una recursión infinita (imposible de ejecutar bien por un generador de imagen), los extremos más lejanos de raíces y ramas se disuelven en transparencia, sugiriendo que la red continúa más allá de lo que la imagen puede mostrar.
- **Símbolo opcional de la piedra tallada**: alusión breve y discreta cerca del nodo "Vida actual", tratada como símbolo puntual, no como sistema de iconografía completo — para no competir con la base espírita ya establecida en el resto de la app.
- Verificado explícitamente: cero instrucciones afirmativas residuales pidiendo un árbol genealógico literal en ningún prompt.
- `SW_VERSION` subida a `-pwa-44`

## Ronda anterior (corrección de invención de datos real)
Hallazgo importante de contexto: el caso "jose alma viajera · versión anterior" usado como base durante meses de desarrollo es la historia REAL del usuario, no un caso de prueba sintético — renombrado a "José Andrade" usando la función de editar alias de la ronda pasada. De aquí en adelante se trata con ese peso; cualquier prueba futura debe vivir en un caso separado, nunca sobre este.

**Invención confirmada con evidencia dura**: el usuario reportó un nombre de esposa ("Yajaira Villacís") que no le pertenece. Se verificó contra el JSON completo (datos crudos, informe generado, archivo entero): cero coincidencias en las tres capas. Es invención pura del generador de imagen externo, no un bug de este código — verificado también que ningún nombre de ejemplo en el prompt propio pudo haber inducido la invención.

**Causa raíz probable, encontrada y corregida**: `buildPromptMapaRed` tenía dos conceptos de árbol en tensión — un árbol genealógico LITERAL con casillas fijas de parentesco (Padre/Madre/Pareja/Hijos) y el árbol como marca de agua metafórica. El usuario aclaró que nunca pidió el árbol literal, solo que la red completa de relaciones adoptara la forma de un árbol. Se retiró el árbol genealógico literal por completo — ya no hay categorías fijas que la IA sienta la necesidad de llenar inventando contenido cuando un dato real está ausente (como una pareja actual que no existe). El campo `familia` del payload, que solo alimentaba esa estructura retirada, también se quitó del payload para no dejar un campo visible sin instrucción que lo use — mismo patrón de bug que causó antes la aparición espontánea de la columna de confianza del período.

**Nueva regla explícita contra la invención en ambos prompts de imagen**: "si un campo está vacío o ausente, déjalo vacío — un espacio en blanco es siempre preferible a un dato inventado."

**Nombres de personas agregados al prompt ilustrado**: nuevo campo `personasQueAcompañan` por etapa en el payload, cruzando las conexiones reales con cada número de etapa (probado con datos simulados, sin duplicados). El prompt ilustrado ahora instruye incluir esos nombres junto al símbolo de cada etapa cuando existen, sin inventarlos cuando no.

**Verificación de conteo reforzada por tercera vez** (el techo de 7/8/10 estaciones sigue siendo comportamiento del generador externo, verificado de nuevo que no es límite del código): ambos prompts de imagen ahora incluyen la lista completa y numerada de títulos de etapas directamente en el texto del prompt, como checklist explícito que la IA debe verificar línea por línea antes de finalizar — más agresivo que el conteo simple de la ronda anterior.

**Justicia, Amor y Caridad en el árbol de red**: nueva instrucción explícita para marcar cada rama con las leyes presentes, con leyenda breve.

**Pendiente, no implementado — requiere decisión del usuario**: la idea de que otras personas también tengan su propio hilo reencarnatorio visible (no solo su rol respecto al usuario) es un hueco de datos, no solo de imagen — requeriría ampliar el prompt principal de la lectura, no solo los prompts visuales. La propuesta de tres imágenes con estilos distintos como opciones para elegir también quedó pendiente de confirmación.

`SW_VERSION` subida a `-pwa-43`

## Ronda anterior (rediseño completo del narrador de la crónica)
El usuario trajo un informe evaluativo detallado de una crónica real generada, con propuestas concretas de mejora, más su propia idea de narrar "desde dentro de la cabeza" del sujeto. Se evaluó el informe con criterio propio antes de adoptarlo (no aceptación automática): se identificaron los puntos más valiosos (pregunta dramática única que se transforma por escena, tejer resonancias como acción en vez de afirmación seguida de ejemplo, jerarquía de personajes por peso dramático) y se señaló un límite razonable (la pregunta dramática no debe forzarse en las trece etapas por igual, solo en los movimientos grandes).

**`buildPromptCronicaNarrativa` reescrita de fondo, ocho cambios:**
1. Narrador único e interior reemplaza el doble registro externo de la ronda anterior (voz documentada / voz de leyenda) — ahora una sola tercera persona cercana, siempre dentro de la experiencia subjetiva del sujeto; la cautela epistémica vive en la incertidumbre del personaje, no en un anuncio del narrador.
2. Estructura de Umbral (apertura en la escena de mayor carga) → Movimientos (agrupados por afinidad, no por etapa) → Retorno (cierre volviendo a la misma escena del umbral, ya comprendida, terminando en un instante cotidiano).
3. Instrucción explícita de tejer resonancias como acción con implicación, con ejemplo concreto de antes/después tomado del informe evaluativo.
4. **Jerarquía de personajes calculada en código, no dejada a criterio de la IA**: `personajes_centrales` = quienes tienen entrada en `arcos_relacionales` (evidencia longitudinal real); `personajes_de_enlace` = el resto de nombres reales de la constelación. Probado con datos simulados verificando que no hay duplicados entre las dos categorías.
5. Pregunta dramática central derivada del hilo conductor, como columna vertebral de los movimientos grandes — con el límite explícito de no forzarla en cada etapa suelta.
6. Objetos e imágenes recurrentes derivados del material real de cada caso, no de una lista fija.
7. Fórmulas de incertidumbre interior reemplazan las fórmulas de "cuentan que..." de la ronda anterior (esas eran de narrador externo, ya no aplican con el narrador único).
8. Se conservan intactos: prohibición de vocabulario interno de la app, integración del balance JAC tejida en la prosa, cuidado con contenido sensible, título literario propio por caso.
- `SW_VERSION` subida a `-pwa-42`

## Ronda anterior (correcciones tras prueba real completa)
Ronda de correcciones basada en una prueba real del usuario con las tres exportaciones y las dos imágenes, con hallazgos verificados contra archivos reales, no supuestos.

**Fusión de arcos dentro del mapa de red** (decisión confirmada por el usuario tras señalar que separarlos perdía la sensación de interconexión): `buildPromptMapaArcos()` retirada por completo. `buildPromptMapaRed()` ahora incluye una sección "TRAYECTORIA SOBRE EL ARCO" que enriquece los arcos existentes con antes/hoy cuando hay seis personas o menos con vínculo evolucionado, y se simplifica a una frase corta con más de seis. Pantalla `mapa-visual-prompt` regresada de tres pestañas a dos.

**Refuerzo contra el truncamiento de etapas**: el prompt ilustrado ahora incluye el conteo real de etapas explícito en el propio texto, con instrucción de verificar el conteo antes de finalizar — la inconsistencia de 7 vs. 13 etapas en corridas distintas del mismo tipo de prompt seguía siendo comportamiento del generador externo, no un límite del código (verificado de nuevo).

**Balance de Justicia, Amor y Caridad rediseñado en las tres superficies**, con hallazgo real antes de corregir: la pantalla en vivo (`renderBalanceJAC`) nunca tenía `prueba_planteada` ni `guia_eternidad` — solo existían en las dos exportaciones. Corregido en las tres, con un sistema de cajas compartido (prueba=guía/azul, avance=verde, abierto=ámbar, guía=dorado) reemplazando tanto el grid de tres columnas reutilizado por error del componente de aprendizajes cortos (bug real: `buildLecturaExportHTML` usaba la misma clase `.aprendizajes-map` para el balance y para el mapa de aprendizajes transversales, dos contenidos de naturaleza distinta) como las etiquetas planas sin caja del ejecutivo.

**Crónica narrativa reforzada contra la jerga interna**: verificado contra el HTML real que "podría resonar con" aparecía 6 veces y "arco"/"tirada" se filtraban sin explicación. Se agregó prohibición explícita de vocabulario técnico de la aplicación, variedad léxica obligatoria para el lenguaje de cautela en las vidas pasadas, y —causa raíz encontrada— las claves `tirada` y `arcos_relacionales` del objeto de datos que ve la IA se renombraron a `esencia_simbolica` y `vinculos_a_traves_del_tiempo`, para que la IA nunca vea esas palabras en el JSON y no tenga tentación de repetirlas en la prosa.

**Nueva función: editar el nombre de una bitácora**. No existía ningún botón para esto — el "versión anterior" que aparecía en todos los documentos del caso de prueba era simplemente el alias real, sin forma de cambiarlo. Agregado en `panel-bitacora`, junto al título, reutilizando el mismo ícono de lápiz (`.pencil-btn`) ya establecido en otras partes de la app — clic abre un campo de texto in situ con guardar/cancelar, sin diálogos nativos del navegador.

`SW_VERSION` subida a `-pwa-41`

## Ronda anterior (LA CRÓNICA NARRATIVA — funcionalidad nueva completa)
Feature nueva de punta a punta, no un ajuste: una narrativa literaria continua ("crónica", en el sentido de la tradición latinoamericana de no ficción narrada) tejida a partir del informe ya generado — segunda pasada sobre datos ya validados, nunca reinterpreta el material crudo del usuario desde cero.

**Decisiones de diseño acordadas antes de escribir código:**
- Alias fonéticamente cercanos como opción (no anonimización total, no nombres reales obligatorios) — interruptor del usuario antes de generar.
- Sin botón de "compartir" — nota breve sobre el cuidado del texto antes de generar, dado que es más personal que los demás exports.
- Género: crónica literaria, con doble registro narrativo — voz directa y documentada para la vida actual, voz de leyenda/tradición oral para las vidas pasadas ("cuentan que...", nunca "fuiste" en indicativo). Este cambio de registro reemplaza el disclaimer explícito, no lo complementa.
- Capítulos por movimiento narrativo, no por etapa — peso desigual, los arcos relacionales ricos merecen más espacio que etapas sin conexión actual.
- Cierre deliberadamente inconcluso, nunca una paz resuelta del todo.
- Balance de las tres leyes tejido dentro de la prosa, no como bloque aparte con encabezado.

**Construcción técnica:**
- `buildPromptCronicaNarrativa(usarAlias)` en screens-informe.js — toma `cur.informe` completo (constelación, arcos, balance, cierre) como única fuente, con instrucción explícita de sustitución de alias cuando se solicita.
- `parseCronica(raw)` en screens-tirada.js, siguiendo el mismo patrón de `parseInforme` — probado con caso válido con fences de markdown, caso sin capítulos, y caso con capítulo sin texto.
- Tres rutas nuevas: `cronica-prompt` (interruptor de nombres + nota personal + copiar prompt), `cronica-pegar-respuesta` (mismo patrón que la pantalla principal de pegar respuesta), `cronica` (vista de lectura con tipografía literaria).
- `buildCronicaExportHTML()` — exportación autocontenida, mismo patrón que los otros documentos exportables.
- Botón de entrada en la pantalla del informe, con estilo propio (`.btn-cronica`, degradado ember-oro, tipografía serif) para diferenciarlo visualmente de los exports técnicos.
- **Dos bugs de persistencia corregidos antes de que llegaran a producción**: `cargarEnSesion()` no cargaba `entry.cronica` al reabrir una bitácora guardada — corregido. El guardado principal ("Guardar en mi bitácora") no incluía `cronica: cur.cronica` al reconstruir el objeto de la entrada — sin este fix, generar la crónica y luego volver a guardar ajustes habría borrado la crónica silenciosamente. Ambos verificados contra el código real de `cargarEnSesion` y el bloque de guardado, no supuestos.
- Dos errores de nombres de función corregidos durante la construcción, verificados antes de quedar en el código: `cur.entryId` no existía (el campo real es `cur._editingEntryId`), y `downloadHTML` no existía (la función real es `downloadBlob` con mime type) — ambos se verificaron contra el código real antes de escribir la versión final, no después.
- CSS: `.opcion-toggle:has(input:checked)` con respaldo explícito por JS (clase `.activo`), ya que `:has()` no se usaba en ningún otro lugar de la app.
- `SW_VERSION` subida a `-pwa-40`

## Ronda anterior (tercera imagen — arcos relacionales)
- **Diagnóstico verificado con código real, no supuesto**: el usuario probó los dos prompts rediseñados la ronda pasada. El mapa ilustrado (símbolos) funcionó exactamente como se diseñó — catorce etapas legibles sin saturación. El mapa de red mostró un problema real pero distinto al que parecía: los nombres reales SÍ llegaban en el payload (`reingresos` verificado con `personaActual` poblado), pero el generador de imagen los abstrajo en categorías por su cuenta. Se confirmó además que `arcos_relacionales` nunca se había agregado al payload visual — ni si el generador hubiera querido mostrar la evolución de cada persona en el tiempo, tenía ese dato disponible.
- **"Confianza del período" retirada de ambos prompts existentes**: en el mapa ilustrado se simplificó la instrucción del eje cronológico, quitando el sistema de niveles con leyenda. En el mapa de red se agregó una exclusión explícita, porque el generador había inventado esa columna por su cuenta al ver el campo crudo en el JSON aunque nunca se le pidió — lección general: incluir el JSON completo como dato de entrada puede hacer que el generador visualice campos no solicitados explícitamente.
- **`buildPayloadVisualMapa()` ampliado**: nuevo campo `arcosRelacionales` (persona, etapas, patrón transversal, qué ya se superó, qué sigue en tránsito) y `leyes` por persona, cruzado desde `balance_justicia_amor_caridad.personas_involucradas` de las tres leyes — probado con un caso de una persona presente en dos leyes a la vez, sin duplicar.
- **Nueva función `buildPromptMapaArcos()`**: tercera imagen dedicada, con metáfora visual distinta (tarjeta de trayectoria por persona, no árbol ni red) — decisión deliberada de no cramear un tercer panel en la imagen de red ya cargada. Incluye instrucción explícita de que el nombre real siempre debe aparecer como texto, aprendiendo directamente del problema encontrado en la imagen de red.
- **Pantalla `mapa-visual-prompt` ampliada de dos a tres pestañas**, con lógica de activación de pestañas generalizada (antes hardcodeada para dos). CSS de `.toggle-row`/`.toggle-btn` ajustado para que tres quepan bien en móvil (flex-wrap, min-width, fuente ligeramente menor).
- `SW_VERSION` subida a `-pwa-39`

## Ronda anterior (rediseño real de los dos prompts de imagen — símbolos + árbol de fondo)
- **Confirmado con evidencia que el rediseño nunca se había implementado**: el usuario mostró dos imágenes generadas con el prompt viejo (seguía pidiendo "viñeta pictórica... estilo pintura narrativa") y señaló tres problemas. Se investigó cada uno antes de tocar código:
  - Sin árbol de fondo: confirmado, nunca se escribió esa instrucción.
  - Sin símbolos, seguían siendo escenas ilustradas: confirmado, mismo motivo.
  - "Techo de 8 estaciones" visible en una de las imágenes: **verificado que NO existe en el código** — no hay ningún límite a 8 en `buildPayloadVisualMapa` (el único techo real es 40, protección técnica). Es comportamiento del generador de imagen externo en esa corrida específica (probablemente prefiere cuadrículas simétricas), no una instrucción del prompt — la otra imagen adjunta, del mismo tipo de prompt, sí mostró las 14 etapas completas.
- **`buildPromptMapaIlustrado` reescrita**: ahora pide explícitamente un símbolo/ícono compacto por etapa (objeto, elemento natural o forma arquetípica), con prohibición explícita de escenas narrativas con personajes. Estilo comparado a "mapa de estaciones de metro conceptual". Se conservó la instrucción de densidad adaptativa, ahora aplicada al texto que acompaña cada símbolo.
- **`buildPromptMapaRed` reescrita**: se agregó la instrucción del árbol como marca de agua de fondo, con raíces/tronco/ramas/hojas siguiendo las mismas líneas que ya usan los arcos de retorno y las conexiones familiares — no como capa decorativa separada, sino integrada con la red técnica, que sigue teniendo prioridad de legibilidad.
- `SW_VERSION` subida a `-pwa-38`
- Nota de proceso: el entorno de trabajo (`/home/claude`) se había reiniciado de nuevo entre turnos; se restauró correctamente desde el último zip entregado, sin pérdida de cambios previos.

## Ronda anterior (homogenización de la tercera ruta de exportación)
- **`buildLecturaExportHTML` (botón "Exportar como página HTML") homogenizada con las otras dos**:
  - Retrato literario agregado como apertura destacada, antes de "Lectura general".
  - Línea de tiempo horizontal (`mapaConceptualHtml`/`mc-nodo`) retirada por completo — variable, HTML, CSS embebido y referencia en media query móvil, dejando solo la vertical con detalle expandible, igual que en la app en vivo. Verificado: cero residuos de `mc-nodo`/`mc-flecha`/`mc-caption`/`mapa-conceptual-export` en todo el archivo.
  - Nueva sección "Arcos relacionales" agregada después del mapa de retornos, listando cada arco (patrón transversal, qué ya se superó, qué sigue en tránsito) sin duplicar las conexiones individuales ya mostradas arriba.
  - `balanceHtml` actualizado de la estructura vieja de dos partes a la de cuatro partes completa (prueba planteada + avance + abierto + guía para la eternidad en viñetas), igual que el ejecutivo.
  - Frase de cierre agregada después del párrafo de cierre, con tipografía distintiva.
- Las tres representaciones del informe (pantalla en vivo, ejecutivo, exportación HTML independiente) quedan ahora alineadas en contenido — mismos elementos narrativos, mismo criterio de una sola línea de tiempo.
- `SW_VERSION` subida a `-pwa-37`

## Ronda anterior (hallazgo mayor — tercera ruta de exportación sin homogenizar)
- **Corregido**: bug real en `normalizarConexionRetorno` — cuando una conexión venía solo del campo singular `vinculo` de una etapa (sin pasar por `constelacion` general), el campo `resonancia` quedaba vacío porque `vinculo` nunca tuvo ese campo, produciendo párrafos `<p></p>` visiblemente vacíos en el informe ejecutivo real (verificado: Alfonso Meneces, Abuelo Joaquín). Ahora hay una síntesis de respaldo usando `figura_simbolica` y `tipo_relacion` del propio vínculo.
- **HALLAZGO MAYOR, sin resolver todavía, pendiente de decisión del usuario**: existe una TERCERA función de renderizado del informe (`buildLecturaExportHTML`, activada por el botón "Exportar como página HTML") completamente distinta de la pantalla en vivo y del informe ejecutivo. Nunca recibió la homogenización de la ronda anterior (retrato literario, arcos relacionales, frase de cierre ausentes) ni la decisión de quedarse con una sola línea de tiempo (sigue usando la horizontal `mc-nodo` vieja). Confirmado con un archivo real exportado por el usuario. La app tiene ahora tres representaciones del informe parcialmente divergentes entre sí — se necesita decidir con el usuario si se homogeniza esta tercera también, o se deprecia en favor del ejecutivo.
- `SW_VERSION` subida a `-pwa-36`

## Ronda anterior (retiro de subida de imágenes + línea de tiempo unificada + homogenización del informe)
- **Función de subir imágenes retirada por completo**, tal como pidió el usuario (no funcionaba como se esperaba). Verificado cero residuos de `imagenIlustrada`/`imagenRed`/`imagen-slot` en todo el código.
- **Línea de tiempo unificada**: existían dos representaciones redundantes de las etapas en la misma pantalla — una horizontal comprimida (`renderMapaConceptual`, mostrada en la captura que el usuario señaló como "apeñuscada") y una vertical con detalle expandible (`renderRutaDiagrama`). Se retiró la horizontal completa (función, template, CSS, incluida una regla huérfana en la media query móvil) y se conservó solo la vertical, con su nota de uso corregida para describir el comportamiento real (expandir en el lugar, no saltar a otra tarjeta).
- **Homogenización confirmada con evidencia antes de implementar**: se verificó que el informe en vivo dentro de la app nunca había recibido `retrato_literario`, `arcos_relacionales` ni `frase_de_cierre` — solo existían en la exportación ejecutiva. Ahora los tres viven también en el informe en vivo: el retrato literario abre la primera sección (con la lectura general como ampliación debajo, coherente con la visión del usuario de "lite pero profundo" vs. "todos esos momentos amplificables"); los arcos relacionales aparecen dentro de cada tarjeta de persona en el mapa de retornos (vista de red), como un bloque adicional que sintetiza el patrón a través de las etapas sin duplicar las conexiones individuales ya mostradas; la frase de cierre se agregó después del cierre, con tipografía distintiva.
- **Pendiente explícito, no resuelto en esta ronda**: el rediseño de los prompts de imagen (símbolos en vez de ilustraciones, árbol de fondo tipo marca de agua para el mapa de red) — quedó como propuesta discutida, no implementada, a la espera de definir la instrucción exacta.
- `SW_VERSION` subida a `-pwa-35`

## Ronda anterior (reestructuración completa del informe ejecutivo, seis frentes)
Ronda grande, tras auditoría exhaustiva del usuario sobre un informe ejecutivo real (fechado 20260715). Confirmado antes de empezar: el botón "Cargar bitácora (.json)" ya existía en el home, no había que construirlo.
1. **Retrato literario**: ahora exige 2-3 hilos biográficos distintos (antes solo permitía uno), cada uno resuelto en una frase para no extender el párrafo.
2. **Estaciones**: variedad léxica obligatoria para "situada" (máximo dos seguidas); "evento crítico" y "huella actual" ahora se resaltan en cursiva automáticamente en el renderizado (no depende de que la IA lo marque); cada estación cierra con una pincelada breve de prueba/logro/pendiente, con cuidado explícito de no duplicar el balance global.
3. **Quienes te acompañan**: reordenada por número de etapas conectadas (desc) y, en empate, por la etapa más antigua (asc) — probado con simulación que confirma el orden esperado. Arcos relacionales reescritos con estructura narrativa completa (rol pasado → conflicto → aprendizaje → rol presente → cierre) **como instrucción genérica para todo caso**, no específica de ningún ejemplo puntual. Corrección de lenguaje crítica: nunca "fue tu padre" en indicativo — siempre "podría resonar con haber sido tu padre", reforzado tanto en el agente generador como en el auditor final.
4. **Hilo conductor**: debe cubrir todas las etapas, no solo algunas; permite hasta dos párrafos si el número de etapas lo justifica.
5. **Justicia, Amor y Caridad**: reestructurado en cuatro partes por ley — Prueba planteada (nueva) → Avance que ya se nota → Algo que sigue abierto → posibilidad de exploración (sin cambios) → Guía para la eternidad (nueva, 5-10 viñetas contextuales, mismo lenguaje de posibilidad que el resto, nunca directivo).
6. **Cierre**: instrucción reforzada para exigir síntesis lúcida, no recopilación; nuevo campo `frase_de_cierre` — una línea breve en cursiva elegante, distinta del párrafo de cierre.
- `SW_VERSION` subida a `-pwa-34`

## Ronda anterior (arcos relacionales longitudinales + disclaimer suavizado)
- **Disclaimer de "Quienes te acompañan" suavizado**, con el texto que el usuario ya había aprobado en una ronda anterior — mantiene la misma función protectora (nunca afirma identidad literal), pero en tono narrativo, no de advertencia legal.
- **Nuevo Agente 6 del prompt — "Tejedor de arcos relacionales"**: para cada persona con evidencia real de vínculo actual (no figuras puramente simbólicas), sintetiza el patrón emocional que se repite a través de sus etapas, qué ya se superó, y qué sigue en tránsito — anclado explícitamente en los principios 4, 5, 6 y 12 de la doctrina espírita que el usuario citó (Weiss: los patrones se repiten hasta comprenderse; el perdón cierra ciclos; las almas afines se reencuentran; el libre albedrío no queda anulado por el karma).
- **Restricción explícita respetada**: el arco solo se construye si hay evidencia real de la relación actual — figuras arquetípicas (guías, sanadoras sin biografía) quedan fuera de `arcos_relacionales`, pero NO se excluyen del informe: siguen apareciendo con su resonancia normal, tal como el usuario pidió ("si son relevantes se incluyen").
- **`lo_que_sigue_en_transito` en null cuando no hay conflicto pendiente** — probado explícitamente con el caso de Victoria Rosas, para no inventar un problema donde el material no lo sugiere.
- Renumerados los agentes 6→8 en cadena; verificado que hay exactamente 8, sin duplicados.
- `SW_VERSION` subida a `-pwa-33`

## Ronda anterior (fusión multi-etapa y estrellas de importancia relacional)
- **Confirmado y corregido con evidencia real**: revisé el HTML que el usuario adjuntó (generado por una corrida real de IA, no un demo mío) y validé que el prompt ampliado de la ronda anterior funcionó correctamente en producción — el balance cita múltiples etapas por ley y el aprendizaje huérfano se identificó bien.
- **Encontrado y corregido**: `buildInformeEjecutivoHTML()` iteraba `inf.constelacion` sin agrupar — si una persona conectaba con dos etapas, aparecía como dos bloques separados con el nombre repetido. Ahora reutiliza `agruparConexionesPorPersona(getConexionesRetorno(inf))`, ya construida y probada para la vista de red, narrando ambas conexiones juntas con un conector ("Además, esto también resuena con:").
- **Estrellas de importancia relacional**: implementado el Camino A (algorítmico, no interpretado por IA) — el número de etapas conectadas determina las estrellas (★★☆ para 2 de 3 etapas posibles mostradas, tope visual de 3). Cero costo de prompt, dato ya existente.
- Probado con simulación exacta: José Alonso (2 etapas) → ★★☆ con ambas conexiones narradas; María Flores (1 etapa) → ★☆☆ sin conector.
- **Pendiente, sin tocar**: el texto del disclaimer de "Quienes te acompañan" — el usuario no confirmó explícitamente la redacción propuesta, solo confirmó los dos puntos técnicos.
- `SW_VERSION` subida a `-pwa-32`

## Ronda anterior (informe ejecutivo como función real de la app, no solo demo)
Distinción de fondo con la ronda anterior: el demo que construí para "jose alma viajera" tenía contenido escrito a mano (retrato literario, tejido de leyes, constelación curada) — eso no puede convertirse en función de la app sin cambiar de estrategia, porque ninguna plantilla de código hace síntesis narrativa, eso lo hace el modelo de lenguaje. Por eso el trabajo real de esta ronda fue en el prompt, no solo en el renderizado.
- **Prompt ampliado** (Agente 6): ahora exige tejido multi-etapa obligatorio en cada ley (mínimo dos etapas citadas por nombre, usando `mapa_aprendizajes` como puente) — es la instrucción que traduce a lenguaje de IA lo que yo hice a mano en el demo.
- **Nuevo campo `retrato_literario`** en el esquema: una apertura narrativa distinta de `lectura_general`, que no debe reutilizar frases ya usadas en otros campos.
- **`cierre_del_balance` ampliado**: debe nombrar primero cualquier aprendizaje de `mapa_aprendizajes` que no quedó cubierto por ninguna de las tres leyes, antes de la síntesis final.
- **Nueva función real `buildInformeEjecutivoHTML()`**: ensambla el documento completo (portada, índice con anclas reales, retrato, estaciones, constelación con etapa de anclaje, hilo conductor, balance de las tres leyes, cierre) a partir de los campos reales del informe — no de texto fijo. Probado explícitamente contra el caso de una lectura antigua sin `balance_justicia_amor_caridad`: la sección se oculta completa sin romper nada; y contra un balance parcial: cada ley se filtra de forma independiente según tenga evidencia.
- **`buildInformeEjecutivoWordCompatible()`**: reutiliza el mismo contenido, envuelto con la técnica de espacios de nombres de Word sin ninguna dependencia externa — verificado que el reemplazo de encabezado funciona contra la estructura real del HTML.
- Dos botones nuevos en la pantalla de informe: "Informe ejecutivo (.html)" y "Informe ejecutivo (.doc, abre en Word)".
- `SW_VERSION` subida a `-pwa-31`

## Ronda anterior (balance de Justicia, Amor y Caridad)
Primera pieza de la idea del "informe ejecutivo" — el diagnóstico transversal que el usuario pidió (qué se aprendió, qué se arrastra, quién está involucrado, a través de las tres leyes morales de Kardec), pensado para mejorar tanto el informe actual como alimentar el futuro informe ejecutivo exportable.
- **Nuevo campo `balance_justicia_amor_caridad`** en el esquema JSON, estructurado por las tres leyes (justicia, amor, caridad), cada una con avance_logrado / patrón_persistente / personas_involucradas / posibilidad_de_exploracion.
- **Decisión de diseño explícita, discutida con el usuario antes de construir**: el campo "posibilidad_de_exploracion" usa registro reflexivo ("¿qué cambiaría si...?"), nunca directivo ("deberías") — para mantener coherencia con el resto de la app, que nunca prescribe, solo refleja posibilidades.
- **Nuevo Agente 6** dedicado a este diagnóstico (auditor final renumerado a Agente 7), con instrucción explícita de usar `null` cuando no hay evidencia real, en vez de rellenar con generalidades — y de no introducir personas nuevas fuera de las ya presentes en constelacion/reingresos.
- **Renderizado en pantalla** (`renderBalanceJAC`): tres tarjetas con definición breve de cada ley, avance logrado, patrón persistente, personas involucradas e invitación reflexiva — se omite automáticamente cualquier ley sin evidencia real (probado con datos simulados, incluyendo el caso de que las tres estén vacías).
- **Agregado a las tres exportaciones** (.txt, .html, in-app) — no solo a la pantalla en vivo.
- `SW_VERSION` subida a `-pwa-30`

## Ronda anterior (cuatro instrucciones cortas de acción, no de definición)
Distinción de fondo: esto no es lo mismo que los tooltips guardados antes (que explican *qué significa* un dato) — aquí el vacío era *qué hacer ahora*. Auditado sistemáticamente antes de tocar código; se confirmó que `alias`, `intro-modulos` y `prompt-listo` ya tenían instrucción suficiente y no se tocaron.
1. **Home**: etiqueta "Empieza aquí si es tu primera vez" sobre "Comenzar nueva bitácora" — se muestra solo cuando `loadLastEntrySummary()` devuelve nulo (ninguna bitácora previa), la misma señal que ya usaba la app para decidir si mostrar "Continuar última bitácora".
2. **Historial vacío**: en vez de solo informar que no hay lecturas, ahora incluye un botón real "Ir al inicio y comenzar una" que navega directo — más accionable que una instrucción de texto.
3. **Insignia de eventos difíciles**: "Falta información" genérico → "Falta: etapa de vida, personas implicadas" (u otro campo específico), calculado dinámicamente por evento. Probado con tres casos distintos.
4. **Botones del informe**: una línea antes de los cuatro botones — "Exporta si quieres guardar o compartir; crea el prompt si quieres una imagen del mapa."
- `SW_VERSION` subida a `-pwa-29`

## Ronda anterior (redundancia de reingresos corregida + imágenes guardadas en la bitácora)
- **Bug real confirmado con dos casos distintos del propio material del usuario** (Felipe y Moana Melett): el mismo par etapa+persona aparecía hasta 3 veces con redacciones distintas, porque el esquema JSON permite registrar la misma conexión en tres campos separados (`vinculo` de la etapa, `reingresos_relacionales` de la etapa, y `constelacion` general), y la deduplicación comparaba el texto exacto en vez del par etapa+persona.
- **Corregido en dos niveles**: (1) `getConexionesRetorno()` ahora agrupa por (etapa, persona) y conserva la versión más completa entre duplicados, no la primera al azar — probado contra el caso real de Felipe (3 entradas → 1); (2) agregada una "REGLA DE NO REDUNDANCIA" explícita en el Agente 4 del prompt, y un punto 10 en el checklist del Agente 6, para que la IA misma evite generar la redundancia desde el origen, no solo confiar en que el código la limpie después.
- **Textos de la pantalla de dos imágenes simplificados**: se quitó la justificación del "por qué" y se dejó solo la instrucción de acción, por pedido directo del usuario.
- **Aclarado (no corregido, porque no era un error)**: el espacio vacío del mapa ilustrado no se llena agregando más etapas — eso las apila hacia abajo (imagen más larga), no las distribuye en columnas (imagen más ancha). Llenar ese espacio requeriría una instrucción de composición nueva, no más datos.
- **Nueva función: imágenes guardadas por bitácora**. En `panel-bitacora` se puede subir la imagen ilustrada y la de red generadas externamente; se guardan como base64 en el propio registro (`entry.imagenIlustrada`, `entry.imagenRed`) y quedan disponibles para consultar sin regenerarlas. El usuario eligió explícitamente guardar la imagen completa (no comprimida) aceptando el riesgo real de espacio — se agregó un indicador de uso aproximado de `localStorage` para que ese riesgo sea visible, no silencioso. Verificado que subir una imagen NO dispara el archivado de una "versión anterior" (solo se archiva cuando `informe` cambia, y la subida de imagen no toca ese campo).
- `SW_VERSION` subida a `-pwa-28`

## Ronda anterior (formato vertical reforzado + guía de dos pasos)
- **Diagnóstico de la prueba real del usuario**: imagen generada mostró 8 de 10 etapas y formato horizontal en vez de vertical. Verifiqué con evidencia: no hay techo de código residual (el 8 vs 10 casi seguro viene de una "versión anterior" con menos etapas, confirmado por el propio título de la imagen); el formato horizontal se debió a que "formato vertical" era una palabra suelta entre otras cinco notas de estilo, insuficiente frente a la convención visual fuerte de "línea de tiempo = horizontal" que el modelo trae de su entrenamiento.
- **Instrucción de formato reforzada en ambos prompts** (`buildPromptMapaIlustrado` y `buildPromptMapaRed`): ahora es su propia sección obligatoria, con razón semántica explicada (por qué debe ser vertical) y prohibición explícita de la composición horizontal tipo tira de película.
- **Aclarado en pantalla que son dos generaciones separadas, no una**: se agregó una guía de "Paso 1 de 2" / "Paso 2 de 2" con checks visuales que se marcan cuando el usuario copia cada prompt, para que quede inequívoco que hay que volver a la otra pestaña y repetir el proceso para la segunda imagen.
- `SW_VERSION` subida a `-pwa-27`

## Ronda anterior (dos imágenes separadas + categorías intermedias de vínculo)
- **Confirmado con evidencia, no solo promesa**: probé mi corrección del sufijo "· versión anterior" contra el texto exacto del JSON real que el usuario adjuntó (con 4 repeticiones) y la expresión regular lo redujo correctamente a una sola — el archivo que mostraba el bug era de antes de la corrección, no evidencia de que haya fallado. Pendiente que el usuario confirme con una interacción fresca sobre el zip actual.
- **Prompt de imagen dividido en dos funciones** (`buildPromptMapaIlustrado` y `buildPromptMapaRed`), porque un mismo generador de imagen no rinde igual cuando se le pide ilustrar escenas Y dibujar una red de arcos precisa en una sola composición — hallazgo verificado comparando resultados reales de ChatGPT (ilustrado, sin red) y Gemini (red presente, pero texto pequeño distorsionado).
- **Techo fijo de 8 etapas eliminado**, sustituido por densidad adaptativa (`densidadSugerida`: alta/media/baja/mínima según el total real de etapas) — con 20 etapas reales, las 20 se conservan en el payload, solo se reduce el detalle por ficha. Queda un techo de seguridad de 40 (no de diseño) para evitar payloads absurdos.
- **Nota de legibilidad de texto** agregada a ambos prompts, para fijar expectativa realista: los modelos de imagen distorsionan texto pequeño y denso, es una limitación conocida de la tecnología, no del prompt.
- **Categorías nuevas en "Parentesco real"**: "Interés romántico (sin definir)" y "Ex pareja" — motivadas por un caso real (Jenny, marcada erróneamente como "Pareja" cuando la relación apenas comienza). Cada una recibe tratamiento visual distinto en el árbol genealógico del mapa de red (línea punteada tentativa / línea discontinua cerrada), no solo una etiqueta cosmética.
- **Categorías nuevas en "Tipo de vínculo"**: "Protector" y "Espejo" — tomadas de los `tipo_relacion` que la IA generó consistentemente a lo largo de muchas lecturas en esta conversación, pero que el usuario no podía elegir por sí mismo al capturar el dato.
- Pantalla `mapa-visual-prompt` rediseñada con dos pestañas, una por imagen, cada una con su propio botón de copiar y su propio panel de IA externa.
- `SW_VERSION` subida a `-pwa-26`

## Ronda anterior (implementación completa de la auditoría de diseño)
Los cinco puntos de la tabla de priorización, implementados en el orden acordado:
1. **`border-radius` unificado**: 14 valores sueltos → 4 variables (`--radius-sm:4px`, `--radius-md:8px`, `--radius-lg:16px`, `--radius-pill:999px`), mapeados por redondeo al valor más cercano. 70 ocurrencias convertidas.
2. **29 colores sueltos absorbidos**: 10 eran duplicados exactos de variables ya existentes (reemplazados directo); 15 nuevos recibieron nombre propio (`--gold`, `--gold-dim`, `--gold-soft`, `--ember-light`, `--ember-soft`, `--guide-mid`, `--guide-light`, `--success`, `--success-dim`, `--warn`, `--warn-dim`, `--navy-deep`, `--slate-dark`, `--brown-deep`, `--muted-brown`). Nota honesta: varios de los colores de estado (éxito/advertencia del módulo de eventos) los había introducido yo mismo sin darlos de alta como variable — no era solo la otra IA.
   - **Bug real que mi propio script de reemplazo introdujo y corregí en el momento**: el reemplazo automático alcanzó también las definiciones dentro de `:root`, dejando `--bg:var(--bg)` (autorreferencia circular). Detectado y corregido antes de continuar; verificado con script que confirma cero autorreferencias y los 25 valores hex viviendo únicamente dentro de `:root`.
3. **Botones consolidados de forma conservadora**: en vez de reescribir las clases en los nueve archivos JS (alto riesgo sin poder ver el render), se agregó una regla base compartida por selector agrupado para los cinco micro-botones reales (`.btn-mini-danger`, `.btn-periodo-guardar`, `.btn-periodo-cancelar`, `.btn-agregar-periodo`, `.btn-historia-ampliada`) sin tocar ninguna clase en el HTML/JS.
4. **Jerarquía de lectura numerada** en el informe: contador dinámico que numera solo las secciones que realmente se renderizan para esa lectura (evita saltos como "1, 2, 4" cuando falta una sección condicional), con un indicador de "Informe en N secciones" al inicio.
5. **Migas de pan**: se reutilizó el `navigationStack` que el router ya mantenía internamente (no se construyó un sistema paralelo). Agregadas en `historial`, `panel-bitacora`, `versiones-bitacora` e `informe` — la cadena profunda original que motivó el pedido.
- `SW_VERSION` subida a `-pwa-25`

## Ronda anterior (bug real de colisión de nombres + sistema de versiones)
- **Bug confirmado y corregido, introducido por mí**: existían dos funciones `agruparConexionesPorPersona` en el mismo archivo, con formas de retorno distintas. La segunda (mía, agregada para el payload de imagen) sobrescribía a la primera (la original, que `renderMapaRetornos` necesitaba). Esto rompía la construcción del contenido de "Vista de red"/"Vista matriz" justo después de montar los botones — por eso el toggle cambiaba de color pero no mostraba nada. Verificado con diff contra la versión previa: mis cambios anteriores NO tocaban la lógica del toggle; el problema nació al agregar la función de agrupación para el mapa visual sin revisar que el nombre ya estaba en uso. Renombrada a `agruparConexionesPorPersonaVisual`.
- Confirmado (no requería cambio): cada versión archivada en el historial ya guarda solo `informe` + `tirada` + `ajustesInforme`, no una copia completa de los módulos — la sugerencia del usuario de "conservar solo el informe" ya es el diseño actual.
- Corregido: la lista de versiones anteriores mostraba solo día/mes/año, por lo que varias versiones guardadas el mismo día se veían con fecha idéntica aunque sus marcas de tiempo internas fueran distintas — ahora se muestra también la hora.
- Agregado: insignia "Más reciente" en la primera versión de la lista (que ya estaba ordenada correctamente, solo sin señalización visual).
- `SW_VERSION` subida a `-pwa-24`

## Ronda anterior (apertura robusta de IA externa + blindaje del mapa de retornos)
- Auditado y descartado: la "Vista de red" / "Vista matriz" del mapa de retornos sigue existiendo en el código, con su plantilla, estilos y lógica de toggle intactos — si no aparece, la causa más probable es que `getConexionesRetorno(inf)` devuelve una lista vacía para ese caso concreto, no que se haya eliminado
- Corregido: `openAIProvider` reemplazó `window.open()` (poco confiable dentro de una PWA instalada) por una técnica de enlace `<a>` real simulando clic, más confiable entre navegadores
- Agregado: enlace visible de respaldo si la apertura automática de la IA externa falla — el texto queda copiado igual, y aparece un enlace manual para abrirla
- Blindado: `getConexionesRetorno()` ya no puede romper toda la pantalla del informe si los datos de una lectura vienen con una forma inesperada (ej. `constelacion` no siendo un arreglo) — probado con cuatro casos malformados, incluido `inf` nulo
- `SW_VERSION` subida a `-pwa-23`

## Ronda anterior (payload del mapa visual y campo de parentesco)
- Agregado: campo `parentesco` en el modal de vínculos (`abrirVinculoModal`), distinto y separado del `tipoVinculo` simbólico — Padre, Madre, Hermano/a, Hijo/a, Pareja, Abuelo/a, Tío/a, Sobrino/a, Primo/a, Amigo/a, Sin parentesco literal
- Agregado: `nivelConfianzaPeriodo` a cada etapa del payload visual (`buildPayloadVisualMapa`) — antes se calculaba en el JSON de la lectura pero nunca llegaba al payload de la imagen
- Agregada: función `agruparConexionesPorPersona()` — agrupa las conexiones de retorno por persona real y marca `esRetornoMultiple: true` cuando la misma persona conecta con más de una etapa (verificado con el caso real de José Alonso: etapas 1 y 3)
- Agregado: array `familia` al payload, construido desde `cur.moduloC` filtrando por `parentesco` — base de datos real para el árbol genealógico
- Reescrito: `buildPromptMapaVisual()` con el diseño de dos capas (eje cronológico con incertidumbre visible + árbol genealógico + arcos de retorno), consumiendo los tres campos nuevos en vez de ignorarlos

## Ronda anterior (corrección de bugs + prompt sin techo de etapas)
- Corregido: falso positivo "Esenios" activado por la palabra "presencia" (línea con `p.includes('esen')` cambiada a `\besenio` con límite de palabra)
- Corregido: función `truncarPalabra()` nueva, reemplaza cinco instancias de recorte por posición de carácter que rompían palabras a la mitad
- Corregido: pie de navegación fijo duplicado en la pantalla `home` (sus dos botones ya existían como tarjetas)
- Cambiado: la regla 9 del prompt ya NO limita a "entre 2 y 7 etapas" — ahora el número de etapas lo determina el material; solo se fusionan fragmentos que sean la MISMA escena retomada (mismo protagonista/espacio/evento), nunca por cercanía temática o época compartida
- Agregado: campo `fusiones_realizadas` en `auditoria_final`, que obliga a la IA a justificar cualquier fusión con el criterio exacto
- Ajustado: el límite de 7 etapas en el payload de la imagen del mapa visual (`buildPayloadVisualMapa`) se mantiene como límite de legibilidad de imagen (no de la lectura), pero ahora es explícito — la nota final declara cuántas etapas reales existen si se omiten algunas en la imagen
- `SW_VERSION` subida a `-pwa-21`

## Advertencia de proceso
Este proyecto se ha desarrollado en una conversación muy larga con Claude, y en paralelo el usuario continuó parte del trabajo con otra IA (probablemente ChatGPT, evidenciado por convenciones de archivo tipo `sandbox:/mnt/data/`). Cualquier auditoría de "cumplido/pendiente" que venga de otra IA debe verificarse contra el código real antes de aceptarse — no se debe asumir que un informe autodescrito es preciso, sin importar quién lo escriba.

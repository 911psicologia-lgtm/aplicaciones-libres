# MMPI-2 App · Versión 4.0

## Correcciones
- **Word del informe (sin IA) no se descargaba**: la tabla de datos usaba componentes de Word que no recibía y la exportación fallaba en silencio. Corregido; además el Word se genera ahora con el nuevo motor de informe.
- **Gráficas en blanco en el informe con IA** (pantalla y Word): la lista de gráficas pendientes se vaciaba justo antes de dibujarlas. Corregido. Las imágenes para Word/PDF/HTML se generan fuera de pantalla, sin depender de lo visible, y si la IA no entrega datos utilizables se dibujan con los resultados reales del caso.
- Gráficos que recortaban valores T > 90 (eje ahora dinámico).
- Pie del informe que decía «baremos españoles» con cualquier baremo.
- Selector de baremo del informe sin México; importación que rechazaba casos con baremo mexicano.
- Al cambiar de baremo se perdían las omisiones usadas en la validez.
- Botones con `onclick` en línea bloqueados por la política de seguridad (CSP).

## Informe nuevo (sin IA)
Orden: 1) Identificación en un solo cuadro con divisiones · 2) Información del caso (seleccionable) · 3) Perfil de escalas: por cada grupo **tabla → interpretación con valores → gráfica** · 4) Análisis de resultados con la misma dinámica (validez, distribución, escalas significativas, código del perfil, comparación) · 5) **Síntesis integradora** en prosa, sin valores ni siglas · 6) Recomendaciones · **Evaluador y firma al final**.
- Panel «Contenido del informe» para marcar qué incluir (se guarda con el caso).
- Exportación **PDF nativo** (jsPDF), Word e HTML desde un mismo modelo: lo que se ve es lo que se exporta.
- Veredicto de validez único en todo el informe.

## Gestión de casos
- Pantalla **Casos**: búsqueda, filtros (estado, contexto, baremo, fechas), orden, detección de **versiones duplicadas**.
- Editar datos, editar respuestas, duplicar, exportar y **eliminar** (individual o en bloque) con **papelera** recuperable y «Deshacer».
- Al editar sexo o baremo de un caso con informe, los resultados se recalculan.

## Captura
- Progreso con %, ítems restantes, tiempo estimado, mapa por bloques de 100 (clic para saltar), hitos 25/50/75/100 %.
- Atajos de teclado (V/F, 1/2, flechas, N, Supr), «siguiente sin responder», aviso de pausa cada 150 respuestas.
- Indicador «Guardado hh:mm:ss», guardado de emergencia al cerrar/ocultar la pestaña, borrador autoguardado del formulario de caso.

## Datos y uso
- Copia de seguridad completa (incluye papelera) con **restaurar combinando o reemplazando**; recordatorio en el panel si no hay copia reciente.
- Mensajes de error en lenguaje claro.
- Panel con primeros pasos guiados para usuarios nuevos.
- Contador de escalas con T documentada y motivo de las faltantes.
- **Mf entre baremos de distinto sexo**: si el informe anterior trae Mfv (varones) en una mujer, o Mfm (mujeres) en un hombre, la app lo convierte a un equivalente aproximado (T → PD estimada → T del otro sexo, con margen ±2 PD) y lo explica en la comparación y en el prompt de IA.
- **PWA instalable** que funciona sin conexión (service worker + manifiesto). Al desplegar una versión nueva, regenerar `sw.js` cambia la versión de caché y la app ofrece «Actualizar».

## V4.1 · Correcciones del motor de puntuación
- **Mf en mujeres** se corrige con la clave femenina (Mf-F para baremos de EE. UU. y México; Mfm para TEA España). Antes se usaba la clave masculina para ambos sexos (diferencia en los ítems 121, 166, 209 y 268).
- **T a verificar**: la app detecta los tramos de las tablas del baremo con errores de extracción (rompen la progresión PD→T). Si una puntuación cae en uno de ellos, se muestra con asterisco (*), se lista en el panel del informe y se advierte en la interpretación.
- Los casos guardados con la versión anterior se recalculan automáticamente al abrir su informe; la app avisa el cambio de Mf y si conviene regenerar el informe con IA.

## V4.2 · Baremos corregidos con el manual
- **EE. UU.**: tablas de validez y clínicas de varones (A-1) reemplazadas completas (la app traía en su lugar valores del baremo mexicano); tablas de mujeres (A-2) corregidas en los tramos bajos de Hs, Pd, Pt, Sc y Ma (venían de la tabla sin K) y en TRIN; subescalas Harris-Lingoes de varones Pa1-Ma4 (A-5) y Ma2 de ambos sexos corregidas. Contenido, suplementarias y Si1-Si3 se verificaron y ya eran correctas.
- **México**: tablas B-1, B-2 (validez y clínicas), B-5, B-6 (contenido) y B-7, B-8 (suplementarias) transcritas del manual. Las subescalas de Harris-Lingoes y Si no tienen tablas mexicanas publicadas: se usan las de EE. UU.
- **España (TEA)**: sin cambios; los manuales aportados no traen sus tablas. Siguen marcándose las T «a verificar».
- Puntuaciones bajo el mínimo impreso de cada tabla se asignan a T = 30 (antes quedaban «fuera de tabla»).
- Los casos guardados se recalculan automáticamente al abrir su informe (motor v3).

## V4.3 · Aplicación anterior y JSON de la IA
- **Aplicación anterior estructurada (opcional)**: fecha, profesional o fuente, baremo usado («No consta» por defecto) y nomenclatura (autodetecta internacional / Manual Moderno: Hi, Es, Fp, Fpsi, Is…). Si no hay aplicación previa, el informe y el prompt omiten la comparación.
- **Vista previa** de cómo se interpretó cada valor: ✓ reconocida, ≈ convertida (con valor y rango), ✗ no reconocida. Se acabaron los «N/D» silenciosos.
- **Conversión por valor implicado** (T → PD → T) cuando cambia el baremo (EE. UU. ↔ México) o el sexo de la clave de Mf (Mfv/Mfm). Admite puntuaciones directas («Hs_PD=13» + «K_PD=19», o «Hs_PDK=23») para comparación exacta.
- El informe y el prompt de IA incluyen un párrafo de limitaciones construido con los metadatos reales (fecha, baremo, escalas convertidas o excluidas).
- **JSON de la IA tolerante a errores**: repara barras invertidas añadidas por el chat (p. ej. «https\://»), comillas tipográficas, comas finales, saltos de línea y bloques ```json; si no se puede, indica línea, fragmento y causa probable. El prompt pide ahora el JSON dentro de un bloque de código.

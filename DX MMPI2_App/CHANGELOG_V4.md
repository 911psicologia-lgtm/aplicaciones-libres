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
- **PWA instalable** que funciona sin conexión (service worker + manifiesto). Al desplegar una versión nueva, regenerar `sw.js` cambia la versión de caché y la app ofrece «Actualizar».

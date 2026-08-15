# v2.10.8 · Retorno a A1 + diferenciación A2

## Cambios
- Las tarjetas MCER A1 y A2 ahora abren su ruta real:
  - A1 → `ruta_1`
  - A2 → `ruta_2`
- El cajón A1 vuelve a la ruta A1 cuando se hace clic.
- Se agregó helper `openCefrBlockOrRoute(blockId)`.
- Las tarjetas clicables muestran affordance visual “Abrir”.
- A2 fue reforzado para diferenciarse de A1:
  - notas A2 por microlección;
  - prompts A2 más situacionales;
  - respuestas correctas rotadas para evitar patrón A;
  - verdadero/falso con casos falsos intencionales;
  - diálogos A2 convertidos en escenas de 3 turnos con frecuencia, razón y detalle.
- Las conversaciones respetan `routeId`, evitando mezclar A1 y A2.

## Validación
- JS validado con `node --check`.
- JSON validado.
- A2 conserva 150 microlecciones, 750 ejercicios y 30 diálogos.

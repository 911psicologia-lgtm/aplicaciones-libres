# v2.11.1 · Enlaces BBC curados A2/B1 integrados

## Cambios
- Se integraron 30 enlaces curados BBC Learning English para A2.
- Se integraron 30 enlaces curados BBC Learning English para B1.
- Los enlaces usan búsquedas curadas dentro del canal oficial BBC Learning English para evitar enlaces rotos.
- Se añadió `routeId` a cada video:
  - A1 → `ruta_1`
  - A2 → `ruta_2`
  - B1 → `ruta_3`
- Se remapeó la numeración global del archivo:
  - world_31–60 → `ruta_2/world_1–30`
  - world_61–90 → `ruta_3/world_1–30`
- `getVideosByWorld()` ahora respeta la ruta activa.
- La biblioteca de repaso ahora filtra por ruta activa para no mezclar mundos A1/A2/B1 con el mismo `worldId`.
- Se agregaron metadatos de banco de videos a `ruta_2` y `ruta_3`.

## Validación
- Total videos: 90.
- A1: 30.
- A2: 30.
- B1: 30.
- JS validado con `node --check`.
- JSON validado.

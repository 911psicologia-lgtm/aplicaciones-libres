# Producción técnica v1.9.5

Se completó la fase técnica pendiente para el sistema de peligros de los mundos 6 a 10.

## Alcances

- Recorte individual de sprites desde atlas fuente.
- Nomenclatura homogénea para meteoros, basura espacial y planetas.
- Clasificación por mundo y por categoría en `assets/future/hazards/manifest.json`.
- Integración de hitboxes por sprite en `js/game.js`.
- Lógica de *spawn* avanzada para mundos 6 y 7, con pools preparados para mundos 8, 9 y 10.
- Mejora visual del poder **Bombardeo Meteórico** usando sprites reales cuando el mundo lo permite.
- Ajuste de colisiones usando `hitboxScale` por hazard.

## Inventario generado

- Meteoros recortados: 10
- Basura espacial recortada: 15
- Planetas recortados: 10
- Total de assets nuevos integrados: 35

## Pools preconfigurados

- Mundo 6: 4 meteoros, 4 escombros, 3 planetas.
- Mundo 7: 3 meteoros, 4 escombros, 2 planetas.
- Mundo 8: 3 meteoros, 3 escombros, 2 planetas.
- Mundo 9: 3 meteoros, 3 escombros, 2 planetas.
- Mundo 10: 4 meteoros, 4 escombros, 3 planetas.

## Archivos clave

- `js/game.js`
- `assets/future/hazards/manifest.json`
- `assets/future/hazards/meteors/`
- `assets/future/hazards/debris/`
- `assets/future/hazards/planets/`

## Validación rápida

- `node --check js/game.js` → OK
- Carga de assets nueva registrada en `GAME_ASSET_SOURCES`.
- Hitboxes y `drawScale` activos por asset.

## Siguiente paso recomendado

Con esta base ya queda listo el camino para montar el **Mundo 8** directamente con una identidad visual consistente y con reutilización controlada hacia los mundos 9 y 10.

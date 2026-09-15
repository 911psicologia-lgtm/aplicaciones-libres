# RIZOMA ZOMBIE STRIKE v3.50.0 — BOSS IDENTITY OVERDRIVE + ASSET AUDIT M11–M20

## Objetivo
Reforzar la identidad de movimiento y de fuego de los bosses tardíos (M11–M20), ampliar la multidireccionalidad de sus patrones y auditar/corregir recorte visual de assets posteriores al mundo 10 sin reconstruir el proyecto ni alterar la progresión base.

## Implementaciones principales

### 1. Movimiento de bosses con identidad reforzada
- Se agregó `getBossIdentityMotionDelta(b, dt)` para superponer deriva contextual por mundo, fase y sentido táctico.
- Cada boss de M11–M20 ahora alterna sentidos, amplitudes y ritmos laterales/verticales propios.
- La capa de identidad se integra sobre los modos existentes (`serpentine`, `tide`, `forge`, `radial`, `burrow`, `synapseOrbit`, `stalk`, `panelDash`, `psionHover`, `hunt`, etc.) para no romper la lógica previa.
- Los modos de blink/teletransporte reducen deriva mientras los modos de carga/corte la incrementan, reforzando lectura y agresividad sin tocar HP base.

### 2. Disparos y poderes con mayor firma visual
- Se amplió `applyBossVolleyAccent()` para M11–M20 con perfiles de proyectil por mundo.
- Cada acento puede disparar en frente, flancos y contraángulos, con combinaciones de lanza/orbe/espora/hoja según el mundo.
- Se añadieron salvas secundarias con sentido alternado, espirales suaves, retrodisparo y homing puntual en fases altas.
- Los mundos 19 y 20 (`silentPsion`, `necroScale`) ahora también reciben acentos de patrón antes del retorno temprano de sus rutinas.

### 3. Auditoría y corrección de assets M11–M20
- Se ejecutó una auditoría de PNGs no-fondo de mundos 11–20.
- Se recortaron automáticamente assets con exceso de transparencia periférica para mejorar presencia visual, centrado y lectura en combate.
- Resultado: **178 assets** recortados/normalizados.
- Se generó reporte: `asset_crop_report_v3.50.0.txt`.

## Archivos intervenidos
- `js/game.js`
- `index.html`
- `manifest.json`
- `sw.js`
- Assets PNG de `assets/world11` a `assets/world20`

## Criterio de conservación
- No se eliminaron sistemas existentes.
- No se reconstruyó la app.
- Se preservan mundos, bosses, Hangar, flotas, poderes, checkpoints, PWA, audio y progresión actual.

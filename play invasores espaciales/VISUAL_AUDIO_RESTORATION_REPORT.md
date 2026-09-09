# STARFALL FRONTIER v0.4.4 — Visual + Audio Restoration Report

## Decisión de base
Esta build parte directamente de `STARFALL_FRONTIER_v0.3.9.1_FULL`, considerada el tronco visual funcional del proyecto.

No se incorporaron los assets visuales simplificados del paquete Z.AI de 20 mundos.

## Integridad visual
Se compararon mediante SHA-256 todos los archivos de `assets/` de la v0.3.9.1 original con la nueva v0.4.4.

- Assets visuales originales: **17**
- Assets visuales conservados byte por byte: **17**
- Assets visuales modificados: **0**
- Assets visuales Z.AI simplificados integrados: **0**

Esto incluye:
- 3 naves: Vanguard, Warden, Specter;
- 8 sprites de enemigos/jefes;
- 3 meteoros/defensas;
- 3 fondos espaciales.

## Audio integrado
Se incorporó `STARFALL_FRONTIER_AUDIO_PACK_v1` sin sustituir imágenes.

- OGG: **449**
- Entradas en `audio_manifest.json`: **449**
- Mundos sonoros: **20**
- Rutas requeridas faltantes en la integración: **0**

## Hooks de audio añadidos
- disparo básico / rápido;
- misiles;
- dron aliado;
- EMP;
- disparo de enemigos por tipo funcional;
- sentinel / reanimator / breeder;
- impacto y escudo;
- muerte de enemigo;
- destrucción de meteoro;
- subjefe: intro, ataque y muerte;
- jefe: alerta, intro, ataque, cambio de fase, resurrección y muerte;
- liberación y adhesión de reliquias;
- checkpoint, bonus, AMAZING, Game Over y vida crítica;
- ambiente distinto por sector, usando los 20 ambientes y rotando si la campaña supera el sector 20.

## Rendimiento
El nuevo `js/audio.js` usa pools de reproducción, cooldowns y límite de polifonía:
- móvil: máximo 16 voces simultáneas;
- tablet/PC: máximo 24 voces simultáneas.

Esto evita que una formación grande produzca decenas de reproducciones superpuestas en un solo frame.

## Criterio para la futura expansión visual
Las futuras familias de 20 mundos deben crearse **desde la estética detallada de la v0.3.9.1 y de la lámina conceptual aprobada**, no desde los sprites simplificados recibidos en el paquete Z.AI anterior. Los nuevos assets deben agregarse como expansión, no reemplazar la base actual hasta ser auditados visualmente.

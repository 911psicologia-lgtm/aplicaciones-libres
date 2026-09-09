# STARFALL FRONTIER — Runtime Assets v2 (Realismo Extremo) · Mundos 01–05

Regeneración completa bajo dirección de **realismo extremo fotorrealista** (referencias AAA del cliente).
Se conserva la identidad visual 1:1 de los concept boards del blueprint ( familia, paletas, anatomías por rol )
y el contrato técnico de rutas canónicas del manifiesto de cada mundo.

## Pipeline de producción
1. Render fotorrealista IA por activo (anatomía real: fibras musculares, tendones, quitina húmeda,
   dispersión subsuperficial, bioluminiscencia, rim lighting cinematográfico, UE5/octane).
2. Recorte de fondo con red neuronal (U2Net + alpha matting) + limpieza por keying del color de fondo
   + preservación de emisión (el glow bioluminiscente se mantiene como alpha suave).
3. Fases / núcleo abierto / muerte del jefe derivados por edición IA desde el render master
   (consistencia anatómica garantizada) + disolución procedural con ascuas para la hoja de muerte.
4. Proyectiles: keying por luminancia (glow -> alpha suave, ideal para blending aditivo).
5. Elites: realce de acento + rim glow del color de familia (legible en móvil).
6. Hojas de sprites: frames horizontales con lienzo compartido y pivote centrado
   (idle: banqueo ±9° + respiración; fases: variante hit-flash; muerte: 8 frames de disolución).

## Contrato por mundo (48 PNG + docs)
| Categoría | Archivos | Lienzo/frame | Frames |
|---|---|---|---|
| Minions (6 roles) | base + elite + sheet | 256² | sheet 6 |
| Subjefes A/B | base + sheet | 512² | sheet 8 |
| Jefe | base 1024² · open_core 1024² · phases_sheet 6144×1024 (6) · death_sheet 6144×768 (8) · relic_sheet 768×256 (3) | — | — |
| Proyectiles 01–05 | sheet | 192² | sheet 6 |
| Powerups ×10 | base | 128² | — |
| Obstáculos ×3 | base | 320² | — |
| Fondos base/intense/boss | opacos | 1920×1080 | — |

Notas de integración:
- PNG RGBA recto (no premultiplicado); pivote centrado en cada frame.
- sub-muestreo LANCZOS; alpha con piso de emisión: usar blending premultiplicado o aditivo para el glow.
- Los tamaños suben respecto a v1 (256/512/1024) para sostener el detalle fotorrealista en pantallas
  high-dpi; el pivote y el orden de frames no cambian, la migración es drop-in.
- docs/ de cada mundo copiados íntegros del blueprint (manifest.json + integration_notes.md).
- Previews QA por mundo en _qa_previews/.

## Estructura
world_01..world_05/{minions,subbosses,boss,projectiles,powerups,obstacles,backgrounds,docs}
+ _qa_previews/

# Auditoría de animación de Guardianes · v2.3.0

La capa de animación visual cuenta ahora con doce firmas cinéticas, una por Guardián. Los Guardianes 6 y 7 mantienen además su articulación profunda por capas; los demás utilizan transformación cinética del sprite completo combinada con movilidad, telegraph, ataque y cambios de fase.

| Mundo | Guardián | Firma cinética | Ataque/telegraph | Fases | Capas articuladas |
|---|---|---|---|---|---|
| 1 | Guardián Biomecánico | rotación/bob/pulso | Sí | Sí | No |
| 2 | Bacilo Omega | respiración vertical | Sí | Sí | No |
| 3 | Soberano Tóxico | vibración rápida | Sí | Sí | No |
| 4 | Arconte | balanceo astral | Sí | Sí | No |
| 5 | Coloso del Vacío | pulso gravitacional | Sí | Sí | No |
| 6 | Magnate Omega | cinética + compuerta | Sí | Sí | **Sí** |
| 7 | Leviatán Abisal | oleaje + apertura | Sí | Sí | **Sí** |
| 8 | Tardígrado Primigenio | pulsación orgánica | Sí | Sí | No |
| 9 | Kaiser Infinito | manga/telegraph vibratorio | Sí | Sí | No |
| 10 | Z.E.R.O.S. Prime | expansión de singularidad | Sí | Sí | No |
| 11 | Soberano de Sílice | oscilación térmica y cristalina | Sí | Sí | No |
| 12 | Thalassar Hadal | oleaje profundo, deriva y compresión | Sí | Sí | No |

## Mundo 12

Thalassar Hadal incorpora una firma cinética propia en `applyBossVisualAnimation()` y no hereda la del Mundo 11. Su animación combina balanceo lento de profundidad, deformación respiratoria y una vibración adicional por fase. Durante las transiciones de fase reconstruye parcialmente su escudo, convoca hazards pelágicos y abre corrientes de presión. Su ataque especial se integra con `futureBossSpecial(12)` y sus disparos con `futureBossShot(12)`.

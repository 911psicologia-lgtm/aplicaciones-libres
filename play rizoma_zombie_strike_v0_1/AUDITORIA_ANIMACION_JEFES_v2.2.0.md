# Auditoría de animación de Guardianes · v2.2.0

La capa de animación visual cuenta ahora con once firmas cinéticas, una por Guardián. Los Guardianes 6 y 7 mantienen además su articulación profunda por capas; los demás utilizan transformación cinética del sprite completo combinada con movilidad, telegraph, ataque y cambios de fase.

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

Para Mundo 11 se añadió un caso específico en `applyBossVisualAnimation()` y una firma de combate independiente, por lo que no hereda simplemente la animación genérica de Z.E.R.O.S. Prime.

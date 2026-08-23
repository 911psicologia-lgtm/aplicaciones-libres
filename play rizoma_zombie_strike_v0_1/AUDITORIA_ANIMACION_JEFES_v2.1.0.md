# Auditoría de animación de jefes · v2.1.0

## Resultado general

La revisión confirma parcialmente la sospecha planteada durante las pruebas. Antes de esta intervención **todos los jefes compartían movilidad de combate** mediante el director `updateBossMotion()` —órbita, arco, strafe, desvanecimiento/teletransporte, entrada, cambios de fase y telegraph—, pero **no todos poseían una animación visual distintiva equivalente**. Los Mundos 6 y 7 eran los únicos con articulación profunda por capas mediante compuerta/caparazón y una unidad emergente. En v2.1.0 se conserva esa articulación y se añade una firma cinética propia para cada uno de los diez Guardianes mediante `applyBossVisualAnimation()`.

| Mundo | Jefe | Entrada y desplazamiento | Ataque/telegraph | Daño/fases | Firma visual propia v2.1.0 | Articulación por capas |
|---|---|---|---|---|---|---|
| 1 | Archipeste del Umbral | Sí | Sí | Sí | Balanceo, retroceso y compresión | No |
| 2 | Patriarca Bacilo Omega | Sí | Sí | Sí | Respiración biomecánica y expansión | No |
| 3 | Soberano de la Energía Tóxica | Sí | Sí | Sí | Vibración voltaica y micro-jitter | No |
| 4 | Arconte Mecánico del Eclipse Carmesí | Sí | Sí | Sí | Oscilación espectral/alar | No |
| 5 | Coloso Mecánico del Vacío Estelar | Sí | Sí | Sí | Pulso gravitacional y dilatación | No |
| 6 | Magnate Omega | Sí | Sí | Sí | Inclinación mecánica + compuerta | **Sí** |
| 7 | Leviatán Abisal | Sí | Sí | Sí | Deriva de marea + caparazón/medusa | **Sí** |
| 8 | Tardígrado Primigenio | Sí | Sí | Sí | Respiración orgánica y contracción | No |
| 9 | Kaiser Infinito | Sí | Sí | Sí | Snap manga, jitter y tensión de portal | No |
| 10 | Z.E.R.O.S. Prime | Sí | Sí | Sí | Expansión de singularidad y pulso de carga | No |

## Qué se corrigió

Se introdujo una transformación visual diferenciada por Mundo 1–10 que combina rotación, flotación, expansión/contracción y respuesta a carga especial. Esta capa se ejecuta antes de dibujar el sprite del jefe y respeta la opción de movimiento reducido. El sistema compartido de movilidad y telegraph permanece intacto.

## Qué queda como mejora futura

La igualdad absoluta de articulación no es posible con los assets actuales porque ocho jefes están construidos como imágenes únicas. Para dotarlos de apertura de piezas, extremidades independientes, armas mecánicas o segmentos corporales reales, será necesario separar esos sprites en capas o generar assets articulados específicos. Por ahora, todos poseen movimiento propio reconocible; Magnate Omega y Leviatán Abisal continúan siendo los más articulados físicamente.

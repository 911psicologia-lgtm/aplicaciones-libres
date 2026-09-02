# Rizoma Zombie Strike v3.13.0 — Arsenal Rizoma progresivo

## Objetivo
Desarrollar el **Paso 3** de la línea de Naves Rizoma: convertir las 6 naves propias del jugador en una capa de combate más expresiva, con **arsenal progresivo, secundarias visibles y evolución estética** inspirada en shoot'em ups clásicos y modernos, sin romper los sistemas ya existentes de **Flota de Conquista** y **DOMINIO**.

## Cambios principales

### 1) Arsenal progresivo de Naves Rizoma
Se añadió una nueva capa de lógica para detectar cuándo el jugador está usando una **Nave Rizoma propia** (no flota conquistada y no DOMINIO) y calcular un **stage de arsenal** entre 1 y 4, con base en:
- mundos completados,
- shot tier,
- morph tier,
- piezas de nave acumuladas,
- número de poderes activos/desbloqueados durante la partida.

### 2) Patrones por nave
Cada nave recibió un comportamiento ofensivo secundario diferenciado:
- **Fénix RZ-1**: side shots cerrados, lanza-tridente periódica y microhiperláser en etapa alta.
- **Mantis RZ-4**: cuchillas vectoriales precisas y cortes encadenados contra blancos prioritarios.
- **Nébula RZ-8**: side shots laterales, despliegue de escoltas y misilaje ligero en fase avanzada.
- **Bastión RZ-12**: proyectil pesado adicional, pulso antiproyectil y recuperación moderada de escudo.
- **Hydra RZ-16**: abanicos polifásicos, salvas de misiles y ráfagas láser en la etapa alta.
- **Rizoma Prime RZ-20**: ciclo automático entre hiperláser, cadena multiblanco y nova defensiva con misiles.

### 3) Visualidad del arsenal
Se añadió una superposición visual específica para Naves Rizoma activas:
- anillo de energía progresivo,
- pods laterales y nodos de armas,
- marcas propias por nave,
- lectura visual del crecimiento del arsenal.

También se mejoró la visibilidad de los escoltas de **Nébula** usando la capa gráfica de drones/escoltas.

## Compatibilidad conservada
- La lógica no altera el comportamiento base de **Flota de Conquista**.
- La lógica no interfiere con **DOMINIO**.
- La nave Rizoma seleccionada sigue siendo la referencia persistente del jugador.
- Los nuevos patrones son complementarios al sistema de poderes, no sustitutivos.

## Archivos modificados
- `js/game.js`
- `index.html`
- `manifest.json`
- `sw.js`
- `css/styles.css`

## Resultado
La versión v3.13.0 convierte a las Naves Rizoma en una línea propia más clara y más satisfactoria: cada nave no solo cambia de estadísticas, sino también de **firma táctica, lectura visual y expresión ofensiva**.

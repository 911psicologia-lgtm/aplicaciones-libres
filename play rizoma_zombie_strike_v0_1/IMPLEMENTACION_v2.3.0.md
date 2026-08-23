# IMPLEMENTACIÓN v2.3.0 · Mundo 12 · Abismo Pelágico

## Identidad

Se implementa el segundo mundo de Saga II como un entorno terráqueo-alienígena submarino. El recorrido desciende desde arrecifes de cristal hasta una ciudad hundida y finalmente al Santuario Hadal.

## Actos

1. Arrecife de Cristal
2. Bosque de Medusas
3. Fosa de Presión
4. Ciudad Sumergida
5. Santuario Hadal

## Enemigos

Se incorporan seis enemigos propios en tres familias: Medusa Lancera, Manta Espectral, Anguila Cazadora, Cefalópodo de Presión, Guardián Coral Negro y Coloso Hadal. Cada familia cuenta con cadencia, proyectiles y comportamiento ajustados al ambiente acuático.

## Hazards y director

El Mundo 12 integra seis hazards propios, corrientes hadales, zonas de presión y hordas pelágicas. La densidad escala por acto, con refuerzos tácticos para evitar que la presión se vuelva injusta.

## Guardián

**Thalassar Hadal · Arconte de la Fosa Bioluminiscente** dispone de escudo reforzado, fases, firma cinética propia, escoltas de las tres familias, hazards durante el duelo y el especial **Marea de Presión Hadal**.

## Captura y progresión

Al superar el Mundo 12 se desbloquea **bossShip12 · Corona Hadal**, que queda disponible en el inventario de naves capturadas y en DOMINIO. La reliquia `world12Hadal` refuerza escudo y control cuando la campaña continúe a mundos posteriores.

## Integraciones

- Campaña y guardado/carga.
- Archivo de Mundos y repetición de niveles.
- Entrenamiento con el Guardián 12 una vez derrotado.
- HUD de acto, bajas, corrientes y aproximación al jefe.
- Fondo de aproximación y arena del jefe exclusivos.
- PWA actualizada a v2.3.0.
- Teaser final hacia Mundo 13: Núcleo de Magma.

## Ajuste final de balance

La meta de bajas del Mundo 12 se fija en `[42, 56, 72, 88, 106]`. Durante el combate contra Thalassar, el temporizador de hazards reconoce explícitamente la familia `pelagic` y genera hazards/corrientes en vez de caer en el fallback genérico.

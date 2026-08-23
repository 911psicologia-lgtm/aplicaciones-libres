# Rizoma Zombie Strike · Implementación v2.2.0

## Saga II · Mundo 11

Se habilita el primer mundo de la segunda saga: **Desierto Alienígena**. El Mundo 10 conserva su epílogo narrativo y, al terminarlo en modo historia, la transmisión conduce ahora directamente a las coordenadas del Mundo 11.

### Cinco actos

1. Dunas de los Dos Soles
2. Ruinas de Vidrio
3. Cañón de Sílice
4. Tormenta Roja
5. Trono de Sílice

Cada acto incrementa densidad, hazards, hordas y tormentas de arena, con un HUD específico que muestra bajas, tormentas y aproximación al Guardián.

## Ecosistema enemigo

Se integraron tres familias propias, seis unidades en total:

- Escarabajo de Cristal / Mantarraya de Duna.
- Acechador de Sílice / Cazador de Espejismo.
- Guardián Obelisco / Coloso Vitrificado.

Los enemigos poseen sprites dedicados, audio de familia y proyectiles propios de arena/cristal. Los Guardianes pesados pueden usar lanzas con seguimiento moderado.

## Hazards y director

El director del Mundo 11 incorpora:

- seis hazards de sílice;
- torbellinos de arena con zonas de atracción;
- hordas de sílice;
- recompensas tácticas entre actos;
- dos soles y atmósfera de polvo como identidad ambiental;
- fondo de aproximación y arena de jefe independientes.

## Guardián

**Soberano de Sílice · Señor de los Dos Soles**

- escudo inicial de 3000 antes de multiplicadores de dificultad;
- fases y recomposición de presión;
- patrón apuntado de lanzas de arena y cristal;
- Tormenta de los Dos Soles como firma especial;
- hazards y torbellinos adicionales durante el duelo;
- animación cinética diferenciada añadida como caso 10 en `applyBossVisualAnimation()`.

## Captura y progresión

Al completar el Mundo 11 se desbloquea **bossShip11 · Corona de Sílice**, que entra al inventario de naves capturadas y al selector DOMINIO. Su firma heredada es **Tormenta de los Dos Soles**.

El Archivo de Mundos y el modo Entrenamiento se amplían automáticamente a once mundos. El Mundo 11 puede repetirse por nivel después de ser superado y su Guardián queda disponible en entrenamiento.

## Persistencia

`worldElevenState` se incorpora a guardado, carga y reintento del nivel. Los perfiles que ya habían completado Mundo 10 migran automáticamente con Mundo 11 desbloqueado.

## Continuidad de v2.1.0

Se conserva sin cambios la regla solicitada para Compra Exprés: **abrir el carrito siempre pausa el juego; cerrarlo devuelve exactamente el estado de pausa que existía antes de abrirlo**.

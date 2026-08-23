# Rizoma Zombie Strike · Implementación v2.1.0

## Fase 1 · cierre de Saga I

Se añadió un epílogo específico después de derrotar a Z.E.R.O.S. Prime en modo historia. El cierre confirma la victoria sobre la Singularidad Final, pero revela que la firma enemiga se dispersó hacia diez planetas de apariencia terrestre y origen alienígena. La transmisión final deja explícita la continuidad del antagonista y abre la Saga II.

Se creó `assets/story/episode_10_afterfall.webp` como fondo del epílogo y se registraron los Mundos 11–20 como horizonte narrativo: Desierto Alienígena, Abismo Pelágico, Núcleo de Magma, Estrella Moribunda, Entrañas del Gusano-Mundo, Cerebros Asesinos, Tundra Salvaje, Biblioteca Ánime, Planeta de Grises y Planeta Zombie-Reptiloide. En esta versión aparecen como **señales detectadas / próxima saga**, todavía no como niveles jugables.

## Fase 2 · Archivo de mundos y naves capturadas

Se incorporó **Archivo de mundos** al menú principal y al menú de pausa. Cada perfil conserva su inventario de mundos superados, niveles alcanzados, jefes derrotados y naves capturadas. Los mundos completados pueden repetirse nivel por nivel sin modificar el progreso principal.

Las diez formas `bossShip1` a `bossShip10` quedan visibles como inventario. Cada nave se habilita cuando el jefe correspondiente ha sido derrotado y el mundo completado. Desde el Archivo el jugador puede equipar RIZOMA o cualquiera de las naves capturadas para la siguiente misión.

## Fase 3 · Modo entrenamiento

Se creó un modo independiente de entrenamiento con dos fondos nuevos:

- `assets/training/bg_training_field.webp`
- `assets/training/bg_training_boss.webp`

El usuario puede practicar contra cualquier Guardián ya derrotado. La simulación inicia directamente en la fase de jefe, ofrece apoyo táctico de entrenamiento y reduce la vida/escudo del jefe para favorecer la práctica. La sesión no sustituye la partida guardada, no desbloquea mundos, no altera rankings y no modifica el inventario de campaña.

## Fase 4 · carrito táctico

La regla queda fijada de forma explícita: **abrir Compra Exprés siempre pausa el combate**. Al cerrar el carrito se restaura el estado previo; si la misión estaba activa, se reanuda inmediatamente. Si ya estaba pausada antes de abrirlo, continúa pausada. La interfaz informa que el juego está detenido durante la compra.

## Fase 5 · auditoría de Guardianes

La auditoría confirmó que todos los jefes tenían movilidad compartida, pero solo los Mundos 6 y 7 contaban con articulación profunda de sprite. En v2.1.0 todos los Guardianes reciben una firma cinética visual diferenciada mediante `applyBossVisualAnimation()`. Magnate Omega y Leviatán conservan además sus animaciones por capas.

## Próxima fase de contenido

La infraestructura de Saga II ya está registrada, pero los Mundos 11–20 aún no se incorporan a `MAPS`. La siguiente intervención de contenido deberá producir, por mundo, fondo de aproximación, arena del jefe, Guardián, familias de esbirros, subjefes, hazards/proyectiles y su nueva `bossShip` capturable.

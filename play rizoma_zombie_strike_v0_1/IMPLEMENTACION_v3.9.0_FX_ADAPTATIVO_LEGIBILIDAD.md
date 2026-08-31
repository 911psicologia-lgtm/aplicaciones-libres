# Rizoma Zombie Strike v3.9.0 — FX adaptativo + legibilidad

## Objetivo

Mejorar rendimiento y lectura visual en los 20 mundos sin reducir dificultad ni modificar economía, IA, enemigos, proyectiles, hazards, drops o timers.

## Cambios

- Gobernador visual automático basado en media móvil del tiempo de frame y carga visual de pantalla.
- Tres estados internos de FX: completo, reducido y crítico. La transición baja rápido cuando hay presión y recupera gradualmente para evitar oscilaciones.
- El sistema automático solo modifica elementos cosméticos: presupuesto de partículas, cantidad de elementos atmosféricos, blur de partículas, intensidad renderizada de flash/shake y algunas animaciones decorativas del HUD.
- El modo `lowPerformance` manual continúa existiendo y conserva su comportamiento previo; el gobernador adaptativo no cambia los límites de entidades de gameplay.
- Las atmósferas de M9–M14 reducen dinámicamente densidad decorativa; los mundos con rejilla atmosférica genérica amplían el espaciado bajo carga.
- Los telegraphs de amenazas frontales se vuelven más legibles en móvil y cuando el presupuesto FX baja: objetivo y cruceta aumentan prioridad en lugar de desaparecer.
- `prefers/reducedMotion` y el ajuste interno `reducedMotion` continúan teniendo prioridad para impacto visual.

## Regla de seguridad

El gobernador nunca modifica `enemies`, `bullets`, `frontThreats`, daño, HP, velocidad, drops, spawn cadence, duración de poderes, score o progresión. Su única responsabilidad es el coste de renderizado cosmético.

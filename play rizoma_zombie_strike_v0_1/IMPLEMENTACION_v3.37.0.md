# RIZOMA ZOMBIE STRIKE v3.37.0
## Guardian Phase Identity & Battle Rhythm

### Base de continuidad
Parte exclusivamente de **v3.36.0 — Guardian Telegraph & Combat Readability**. Mantiene los 20 mundos, los assets reales, la curva de dificultad y los sistemas de combate existentes.

### Objetivo
Hacer que las batallas contra los 20 Guardianes tengan fases más reconocibles y un ritmo menos repetitivo sin aumentar HP, daño, cantidad promedio de proyectiles ni duración artificial del combate.

### Implementación
1. **Identidad de fase M1–M20.** Cada Guardián dispone de cuatro nombres breves vinculados a sus tramos reales de HP. Ejemplos: Heliovorax pasa por CORONA → FRACTURA → PULSO NOVA → NÚCLEO DESNUDO; Sauryx por CAZA → ARMADURA ROTA → NECROESCAMA → DEPREDADOR FINAL.
2. **Transición cinematográfica sin pausa nueva.** La identidad visual se monta sobre `phaseRupture=.82`, ventana ya existente en v3.36. No se agrega un segundo congelamiento ni se extiende la ruptura.
3. **Mazo anti-repetición de movimiento.** Las cuatro maniobras disponibles de cada Guardián se barajan y se consumen antes de reconstruir el mazo. El primer movimiento del siguiente mazo no puede repetir el último anterior.
4. **Mazo anti-repetición de acentos de ráfaga M1–M10.** Las variantes 0–3 se mantienen exactamente, pero su orden se baraja por ciclos completos. Se conserva la misma frecuencia global de cada variante y se evita una secuencia mecánica fija.
5. **Reinicio por fase.** Al romper una fase se reconstruyen ambos mazos, preservando la memoria del último patrón para impedir una repetición inmediata en la nueva fase.
6. **HUD diegético de fase.** Durante la ruptura aparece `FASE N · IDENTIDAD` junto a la firma del Guardián. El tamaño se compacta en móvil y se dibuja en coordenadas de mundo antes de la rotación del sprite.

### Sistemas deliberadamente preservados
- HP y escudo base de Guardianes.
- `spawnBoss()`, `triggerBossSpecial()`, `boss2Pattern()` y `applyBossVolleyAccent()` sin cambios internos.
- Daño de jugador/enemigos y `damageEnemy()`.
- Enemy Behavior Evolution M11–M20.
- Telegraph & Combat Readability v3.36, incluido M6 EMP evitable.
- RIFT ALLY, Guardián Vinculado, Última Oportunidad, Tractor, Taller, DOMINIO, Hangar, Naves Rizoma y VFX.
- 840 assets heredados byte a byte.

### Filosofía
La pelea debe sentirse menos predecible pero más aprendible: **no repetir no significa improvisar sin reglas**. Cada Guardián conserva su vocabulario; lo que cambia es el orden y la presentación de ese vocabulario, de manera que cada fase se perciba como una escalada reconocible sin inflar estadísticas.

### Limitación de prueba
No se declara campaña M1→M20 jugada físicamente ni prueba real Android/iOS. La entrega se valida por sintaxis, comparación de código crítico, integridad de assets, referencias y empaquetado.

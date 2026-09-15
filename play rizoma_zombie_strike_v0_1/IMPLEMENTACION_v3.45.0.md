# IMPLEMENTACION v3.45.0

## GUARDIAN RESILIENCE + RESURRECCIÓN + ANTESALA ADRENALINA

Base exclusiva: v3.44.0 Adaptive Boss Director Shadow Mode.

### 1. Resistencia real de Guardianes
- Multiplicador de HP normal progresivo por mundo: 1.34 (M1) a 1.52 (M20).
- Escudo progresivo: 1.22 (M1) a 1.38 (M20).
- Velocidad: +5% a +12%.
- Cadencia ofensiva: intervalos reducidos progresivamente (factor 0.93 a 0.85).
- Proyectiles originados por Guardianes: daño +8% a +18%.
- Minions, escoltas y hazards del boss reaparecen con intervalos algo menores.

La curva base WORLD_DIFFICULTY_CURVE se conserva; la resistencia adicional se aplica en runtime para poder calibrarla sin destruir la progresión histórica.

### 2. Resurrección automática anti-burst
- Una sola resurrección máxima por Guardián.
- Se activa únicamente cuando el primer derribo sucede antes del 72% del límite inferior de la ventana TTK esperada (mínimo absoluto 28 s).
- El Guardián vuelve con 50% de su HP efectivo base y 35% de su escudo máximo.
- Regresa como mínimo en fase 3, con +8% velocidad adicional y cadencias de ataque/especial ~16% más rápidas.
- No entrega botín, XP, monedas, ranking ni cierre de mundo en la falsa muerte.
- Limpia proyectiles enemigos durante la transición y muestra telegráfico/FX propios de resurrección.

### 3. Antesala adrenalina universal
- Todos los mundos M1–M20 pasan por una antesala antes del Guardián.
- Duración: aprox. 8.2 s en M1 hasta 11.24 s en M20.
- Microhordas recurrentes cada ~0.82–1.42 s, ajustadas por mundo y dispositivo.
- Los esbirros de continuidad tienen baja resistencia, bajo daño y recompensas reducidas para evitar farming.
- El HUD muestra cuenta regresiva `⚠ Ns`.
- El estado puede guardarse/reanudarse durante la antesala.

### 4. Continuidad general reforzada
- Piso de enemigos visibles elevado ligeramente.
- Cap de microesbirros ampliado.
- Revisión de huecos más frecuente.
- Sigue priorizándose rendimiento móvil y legibilidad.

### 5. Adaptive Boss Director
Shadow Mode de v3.44 permanece operativo y ahora registra además si ocurrió resurrección. La resurrección de v3.45 es una intervención jugable específica solicitada y no reemplaza la telemetría A0–A3.

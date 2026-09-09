# Rizoma Zombie Strike v3.29.0 — Curva 1–20 + RIFT ALLY + Última Oportunidad

## 1. Curva global de dificultad 1–20
Se sustituyó la fórmula irregular de HP de Guardianes por una tabla explícita de 20 mundos. La dificultad ya no depende principalmente de resistencia bruta: cada mundo combina HP, escudo, velocidad enemiga, frecuencia de disparo, densidad, hordas, hazards, eventos y movilidad/cadencia del Guardián.

### Correcciones principales
- Se eliminó el multiplicador global de resistencia `COMBAT_DURABILITY.boss=1.54`; la resistencia pasa a estar calibrada por mundo.
- El HP de Guardianes queda monotónico: 11.200 (M1) → 155.500 (M20) en Normal.
- Se corrigen saltos anómalos de la curva anterior, especialmente M7, M9, M10 y el tramo M14–M20.
- M4–M6 recuperan una progresión lógica en lugar de caer por debajo de M3.
- Los enemigos aumentan gradualmente velocidad, frecuencia de fuego y presión de aparición.
- Los Guardianes ganan movilidad y frecuencia de ataque progresivamente; el clímax se obtiene por patrones/ritmo, no sólo por HP.
- En Difícil el HP adicional es moderado (+8% enemigo, +10% boss), mientras se eleva más el ritmo de hordas, hazards, eventos, movimiento y cadencia.
- Se conserva la compensación de recursos/poderes y el Director de Flujo Adaptativo.

## 2. RIFT ALLY ☣
- Disponible durante combate desde Mundo 11.
- Utiliza exclusivamente bosses de mundos anteriores ya derrotados.
- Selección aleatoria; evita repetir inmediatamente cuando existe otra opción.
- Duración exacta: 10 s.
- Cooldown independiente: 52 s.
- Minibarra propia visible sobre el aliado y contador en el botón superior.
- Mantiene identidad del boss: patrón ofensivo, prioridad de amenaza, control/intercepción y, según su rol, embestida o drenaje.
- Es independiente conceptualmente del Guardián Vinculado: el RIFT no copia el poder del jugador; usa la firma del boss invocado.
- Para preservar legibilidad y rendimiento, RIFT ALLY y Guardián Vinculado no pueden coexistir simultáneamente.

## 3. Última Oportunidad
- Todo daño que resultaría mortal activa `⚠ VAS A MORIR` en vez de ejecutar la derrota inmediata.
- Cuenta regresiva basada en reloj real de 5,0 s.
- Pantalla roja pulsante y carrito parpadeante.
- El combate queda congelado mientras corre el tiempo de rescate.
- Al abrir el carrito se muestra únicamente el rescate con Vida Extra.
- Si existe una vida almacenada, el usuario debe pulsar `USAR VIDA EXTRA`.
- Si no hay vida almacenada, puede adquirir manualmente una con monedas, puntos o XP y después pulsar `USAR VIDA EXTRA`.
- No existe compra, gasto ni reactivación automática.
- El contador continúa dentro del carrito; al llegar a 0 se ejecuta la derrota normal.

## 4. Compatibilidad
Se mantienen los 20 mundos, Saga II, Hangar, 6 Naves Rizoma, Flota de Conquista, DOMINIO, Guardián Vinculado, microenjambres, Maestría Rizomática, Contratos de Presión, cinemáticas, música y assets realistas.

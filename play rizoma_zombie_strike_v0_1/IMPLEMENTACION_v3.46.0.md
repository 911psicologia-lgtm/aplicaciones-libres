# IMPLEMENTACION v3.46.0

## RIZOMA ZOMBIE STRIKE — Adaptive Director Live-Lite + Resurrección Mutante + Formaciones de Antesala

Base exclusiva: v3.45.0 Guardian Resilience + Resurrection + Adrenaline Prelude.

### 1. Adaptive Boss Director: de Shadow a LIVE-LITE

El Director conserva el cálculo de potencia efectiva, DPS y TTK de v3.44/v3.45, pero ahora interviene de forma moderada y limitada:

- A1 EQUILIBRIO: 0% de amortiguación.
- A2 SOBREPOTENCIA: ~8% de amortiguación del daño recibido por el Guardián.
- A3 DOMINACIÓN: ~14% de amortiguación.
- Tras una resurrección, la amortiguación dinámica queda limitada a ~8% para evitar castigar dos veces una build fuerte.
- La intervención no se activa durante los primeros ~4 s de lectura del boss.

El objetivo NO es neutralizar el crecimiento del jugador, sino impedir aniquilaciones extremas sin convertir al Guardián en una esponja infinita.

### 2. Asistencia adaptativa A0

Si el Director clasifica una batalla como A0 y el jugador permanece claramente por debajo del rango esperado:

- puede entregar como máximo 2 ayudas por boss;
- existe cooldown aproximado de 14 s;
- la ayuda sigue siendo un pickup físico que debe recogerse;
- prioriza reparación si el casco está comprometido, escudo si está bajo y poder contextual en otro caso.

No existe compra automática ni victoria regaladas.

### 3. Resurrección mutante

Se conserva la resurrección única al 50% de HP de v3.45 cuando el primer derribo ocurre demasiado rápido.

Mejoras v3.46:

- estabilización inicial aproximada de 1,15 s para evitar una segunda eliminación instantánea;
- estado visual MUTACIÓN durante 8 s;
- presión de apoyo temporal aumentada durante esos 8 s;
- special cooldown inicial más corto para que la segunda vida abra con identidad ofensiva;
- aura propia de mutación;
- no genera doble botín/recompensa en la primera caída.

### 4. Antesala con formaciones

La Antesala del Guardián conserva la duración de v3.45 (~8,2–11,2 s), pero las microhordas dejan de entrar siempre con la misma geometría.

Formaciones disponibles:

- ABANICO;
- PINZA;
- LANZA;
- DISPERSIÓN.

Las formaciones rotan según mundo/oleada. La frecuencia aumenta gradualmente conforme se aproxima el Guardián, respetando límites de densidad móvil/escritorio.

### 5. Telemetría

Adaptive Boss Director pasa a modo `live-lite` y registra:

- estado A0–A3;
- TTK;
- mitigación activa;
- daño amortiguado acumulado;
- ayudas entregadas;
- resurrección activada;
- evaluaciones durante el encuentro.

### 6. Sistemas no rediseñados

Se preservan:

- 20 mundos;
- curva base de HP M1–M20;
- patrones signature y telegráficos;
- Enemy Behavior Evolution;
- Guardian Phase Identity / Signature Evolution;
- Naves Rizoma y VFX;
- RIFT ALLY;
- Guardián Vinculado;
- Última Oportunidad;
- Tractor;
- Taller;
- DOMINIO;
- Hangar;
- economía;
- assets y audio.

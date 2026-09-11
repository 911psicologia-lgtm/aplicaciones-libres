# STARFALL FRONTIER v0.6.1 — REACTIVE BOSS MATRIX · SHADOW MODE

## Propósito
Esta versión se construye exclusivamente sobre **v0.6.0 — ECONOMY + BOSS SUPPLY FULL**. No sustituye assets, economía, tienda, suministros, naves, enemigos, audio ni progresión. La primera implementación de la matriz es deliberadamente **observacional**: mide y registra cómo debería reaccionar un boss, pero **no altera el combate**.

## Qué mide
Antes de la aparición del boss se captura una fotografía de la build: nave, daño primario, intervalo de disparo, proyectiles activos, secundarios, velocidad, casco, vidas, escudo, poderes activos, upgrades económicos, inventario, poderes heredados, boss augments y reliquias.

Durante el combate se mantiene una ventana móvil de DPS efectivo de 6 s. Se registran daños reales aplicados a:
- casco del boss;
- Fortaleza;
- módulos orbitales;
- hardpoints/sistemas corporales;
- daño de cadena.

La matriz calcula de forma continua:
- **PLAYER COMBAT POWER INDEX**;
- DPS teórico de la build;
- DPS efectivo reciente;
- **ESTIMATED TTK = CURRENT BOSS HP / EFFECTIVE PLAYER DPS**;
- TTK estructural adicional incluyendo defensas todavía activas;
- desempeño reciente del jugador.

## Estados observados
- **M0 · SUPPORT**: potencia o TTK por debajo del rango esperado.
- **M1 · NOMINAL**: combate dentro de la banda prevista.
- **M2 · OVERDRIVE**: el boss corre riesgo de perder demasiado rápido sus mecanismos.
- **M3 · DOMINANCE**: aniquilación extrema probable.

Los cambios de estado requieren estabilidad durante 1,8 s y respetan un cooldown de 3,5 s. Esto evita que pequeñas oscilaciones de DPS hagan rebotar el Director entre estados.

## Ventanas objetivo
Las ventanas son rangos orientativos, no cronómetros forzados:
- boss inicial: 45–75 s;
- boss intermedio: 55–90 s;
- boss avanzado: 70–110 s;
- boss final/futuro: 90–130 s.

Un jugador experto puede quedar por debajo. En SHADOW MODE no existe corrección automática.

## Respuesta que se simula, pero NO se aplica
La telemetría guarda qué contramedida habría propuesto la Matriz:
- M0: Repair / Shield Cell, recurso ofensivo o movilidad contextual;
- M1: sin acción;
- M2: Reactive Armor ~88 %, evasión y prioridad de signature attacks;
- M3: Adaptive Shielding 78→70 %, counter-pattern, phase gate breve, telegraph de System Jam y elegibilidad de reboot.

**Ninguna de estas respuestas modifica actualmente HP, daño, economía, inventario, precios, armas, buffs o Boss Supply.** Los campos `matrixMitigationApplied`, `matrixJamActivated` y `matrixRebootActivated` permanecen en cero/false por diseño.

## Telemetría local
Cada encuentro guarda localmente, bajo `sf3_reactive_matrix_telemetry_v1`:
- build y upgrades;
- DPS y power index;
- TTK estimado mínimo y final;
- TTK/duración real;
- transiciones M0–M3;
- respuesta que se habría activado;
- Boss Supply ofrecido y utilizado;
- daño recibido;
- resurrección nativa del boss;
- mitigación/Jam/Reboot de Matrix (cero/false en Shadow);
- victoria, derrota o abandono.

No se transmite ningún dato fuera del juego. Se conservan los últimos 60 encuentros para limitar almacenamiento local.

Desde la consola del navegador se puede inspeccionar:
`SF.reactiveMatrix.exportTelemetry()`

y limpiar manualmente:
`SF.reactiveMatrix.clearTelemetry()`

## HUD
Durante el boss se muestra una línea discreta:
`REACTIVE MATRIX · SHADOW · Mx ESTADO · DPS · TTK`

La línea es diagnóstica; no implica que el boss esté escalando con el jugador.

## PWA / rendimiento
Se añadió un shell PWA mínimo y seguro para recuperar la capacidad instalable esperada sin cachear los 140+ MB de assets. El Service Worker cachea solamente HTML/CSS/JS, manifest e iconos; los assets pesados siguen cargándose bajo la estrategia existente de streaming. El registro se intenta únicamente en HTTP/HTTPS, nunca bajo `file://`.

## Siguiente activación recomendada
Después de reunir telemetría real, la activación debería ser incremental:
1. activar solo soporte contextual M0;
2. activar mitigación M2 limitada a ~88–78 %;
3. habilitar M3 con Jam telegráfico y phase gates breves;
4. dejar reboot de una sola vez como última contramedida y únicamente para TTK anómalo.

La filosofía se mantiene: **la build poderosa conserva ventaja real; el boss reacciona, no iguala matemáticamente al jugador**.

# RIZOMA ZOMBIE STRIKE v3.44.0
## RIZOMA ADAPTIVE BOSS DIRECTOR · SHADOW MODE

Base exclusiva: **v3.43.0 — Perfiles Comparables de Build**.

## Objetivo

Instrumentar el problema de sobrepotencia del jugador frente a Guardianes sin modificar todavía el combate. El Director observa la build y el daño efectivo para estimar cuánto duraría el Guardián y qué respuesta adaptativa habría sido apropiada.

**Shadow Mode significa:** calcula y registra, pero NO aplica mitigación, ayudas, supresión, resurrección, cambios de HP, daño, spawns, economía ni patrones.

## Variables observadas

- daño efectivo reciente contra enemigos antes del Guardián;
- daño efectivo real contra HP + shield del Guardián;
- DPS previo al boss (ventana hasta 20 s);
- DPS de boss (ventana hasta 8 s);
- Nave/etapa de arsenal ya presentes en la telemetría;
- suma de niveles de poderes;
- poderes activos;
- combos activos;
- Maestría Rizomática;
- aliados/drones/Guardián activo;
- HP + shield restante del boss.

El daño se agrega en buckets de 250 ms para evitar registrar un evento independiente por cada impacto.

## Ventanas objetivo de TTK

No son cronómetros obligatorios; son una referencia diagnóstica:

- M1–M5: **45–75 s**
- M6–M10: **55–90 s**
- M11–M15: **65–105 s**
- M16–M19: **75–115 s**
- M20: **90–130 s**

## Estados A0–A3

### A0 · ASISTENCIA
TTK excesivamente largo y potencia baja.

El Director registra que **habría** ofrecido 1–2 recursos contextuales. No entrega nada en v3.44.

### A1 · EQUILIBRIO
Build y TTK dentro de un rango funcional.

**Habría aplicado:** ninguna intervención.

### A2 · SOBREPOTENCIA
TTK claramente corto o índice de potencia alto.

**Habría aplicado:**
- amortiguación moderada (~18%);
- prioridad de ataques signature;
- puertas blandas de fase.

Nada de esto se activa todavía.

### A3 · DOMINACIÓN
Aniquilación extrema proyectada.

**Habría aplicado:**
- amortiguación fuerte (~30%);
- puertas blandas;
- prioridad signature;
- interferencia temporal (~4 s);
- desde M11, posible resurrección única ~42% HP.

En v3.44 únicamente se registra la recomendación.

## Telemetría schema 2

Cada intento nuevo puede registrar `adaptiveBoss` con:

- `state`;
- `maxState`;
- `powerIndex`;
- `preBossDps`;
- `bossDps`;
- `effectiveDps`;
- `initialTtk`;
- `currentTtk`;
- `minTtk`;
- `targetWindow`;
- `wouldDo`;
- `evaluations` temporales.

Las partidas anteriores con schema 1 siguen siendo legibles por el Laboratorio de Balance.

## UI

- Ajustes informa que **ADAPTIVE BOSS DIRECTOR · SHADOW MODE** está activo.
- Resultado de partida añade: `🧪 A0/A1/A2/A3 · TTK inicial`.
- El informe copiado desde el Laboratorio agrega conteo de estados Shadow y TTK inicial mediano cuando existen datos.

## Integridad de combate

La única integración en `spawnBoss()` es inicializar la observación.

La única integración en `damageEnemy()` es medir el cambio efectivo de HP/shield después de que la lógica original ya resolvió el daño.

Retirando esas líneas instrumentales, el núcleo de ambas funciones coincide con v3.43. Los patrones, especiales, proyectiles, HP y comportamiento enemigo no fueron modificados.

## Siguiente etapa recomendada

Acumular encuentros reales, especialmente builds capaces de eliminar Guardianes en 20–30 s. Con esos datos se podrá decidir si una v3.45 activa primero solamente A2, mientras A3/resurrección continúan en observación.

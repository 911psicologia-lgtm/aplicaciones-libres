# Rizoma Zombie Strike v3.26.0 — Flujo Adaptativo + Contratos de Presión

## Objetivo
Profundizar el ritmo de combate sin volverlo arbitrario: conservar adrenalina y densidad visual, pero impedir picos injustos cuando el jugador ya está saturado y premiar de forma explícita la resolución hábil de Estampida, Turba, Acoso y Frenesí.

## 1. Director de Flujo Adaptativo
Se añadió una lectura dinámica y suave de:
- vida y escudo;
- daño reciente;
- enemigos visibles;
- proyectiles hostiles;
- poderes activos;
- Maestría Rizomática;
- presencia del Guardián Vinculado.

El director produce tres perfiles operativos: `asalto`, `equilibrio` y `recuperacion`.

No altera objetivos, progreso ni mundos. Ajusta solo dentro de márgenes estrechos:
- límite de presión de eventos;
- intervalo entre spawns de presión;
- frecuencia de soporte táctico;
- pausa entre eventos mayores.

Si el estrés supera el umbral crítico y no existe una ayuda reciente, RIZOMA despliega una única ventana táctica de recuperación, con cooldown largo para evitar explotación.

## 2. Contratos de Presión
Estampida, Turba, Acoso y Frenesí ya no son solo oleadas temporales. Cada evento presenta un objetivo de bajas ajustado a móvil/PC y al nivel.

El evento registra:
- bajas de unidades de presión;
- daño recibido durante el contrato;
- condición limpia.

Resultados:
- Contrato superado: Maestría + reducción del cooldown del Guardián + apoyo defensivo.
- Contrato limpio: premio mayor, cápsula contextual y escudo adicional.
- Contrato no completado: termina sin penalización extra, pero no entrega bonificación de dominio.

## 3. Soporte de poderes contextual
El sistema de poderes en pantalla ahora consulta el estado de presión:
- si hay estrés alto prioriza control/defensa;
- si la build está débil añade soporte antes;
- evita repetir innecesariamente el mismo poder ya activo cuando existe alternativa útil;
- conserva un objetivo visual mayor de recursos cuando la presión aumenta.

## 4. Preparación pre-Guardián
La Maestría >= 50% conserva su extensión de build. Si el jugador llega al Guardián con Maestría suficiente pero menos de dos poderes activos, se genera además una `RESERVA PRE-JEFE` contextual.

Se mantiene el principio: jugar bien mejora la preparación, sin hacer de la muerte una estrategia óptima.

## 5. Persistencia
Se persisten estadísticas no explotables del director (`pressureWins`, `cleanWins`) y se restaura el estado de flujo con límites de seguridad. Los eventos de presión activos no se serializan, evitando estados corruptos al recargar.

## Sistemas preservados
- 20 mundos y cierre de Saga II.
- Microenjambres de continuidad.
- Maestría Rizomática.
- Guardianes Vinculados autónomos + Eco de poder.
- DOMINIO, Flota de Conquista, Naves Rizoma, reliquias y Hangar.
- Intro general y microintro M1.
- Playlist y audio existentes.

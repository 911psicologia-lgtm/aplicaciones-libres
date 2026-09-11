# RIZOMA ZOMBIE STRIKE v3.41.0
## Playtest Guiado + Diagnóstico de Sesión

Base maestra: v3.40.0 — Laboratorio de Balance Local.

## Objetivo
Resolver una limitación metodológica del laboratorio: un mundo ya completado no podía producir con facilidad tres intentos completos comparables, porque la repetición normal funciona por nivel. v3.41.0 añade una ruta de playtest de mundo completo que permite repetir M1–M20 sin alterar el progreso de campaña.

## Playtest Guiado
- Nuevo bloque `PLAYTEST GUIADO · SIGUIENTE PRUEBA` dentro del Laboratorio de Balance.
- Selecciona automáticamente el siguiente mundo accesible según:
  1. señales que necesitan confirmación;
  2. mundos sin muestra;
  3. mundos con 1–2 intentos;
  4. señales de alta confianza que conviene revalidar;
  5. controles estables con menor cobertura.
- Explica por qué se recomienda esa prueba y muestra dificultad prevista, cobertura y confianza.
- `Copiar protocolo` genera instrucciones comparables para la siguiente sesión.
- `Probar mundo completo` inicia el mundo desde L1 y continúa hasta su Guardián.

## Modo diagnóstico repetible
El Playtest Guiado se implementa como una variante segura de repetición:
- `replayMode.fullWorld = true`
- `replayMode.guidedPlaytest = true`
- no finaliza tras L1 como una repetición ordinaria;
- recorre todos los niveles del mundo;
- no desbloquea mundos, Guardianes, naves o reliquias;
- no añade monedas persistentes, ranking, estadísticas ni memoria de expedición;
- no sustituye la partida principal;
- no permite usar monedas persistentes del perfil en Taller o rescates;
- reiniciar conserva el Playtest Guiado.

## Telemetría comparable
- Nuevo modo de telemetría: `playtest`.
- El Laboratorio acepta `campaign` y `playtest`, pero NO mezcla ambas fuentes dentro de una misma muestra diagnóstica.
- Por mundo:
  - si existen ≥3 playtests, usa playtest;
  - si no, pero existen ≥3 campañas, usa campaña;
  - si ninguna fuente llega a 3, muestra la fuente con mayor repetición.
- La interfaz informa la fuente diagnóstica y cobertura `P/C`.
- CSV e informe incluyen la procedencia de la muestra.
- Repeticiones ordinarias por nivel y entrenamiento siguen fuera de la muestra de balance.

## Principio metodológico
Una señal de balance debe surgir de una muestra homogénea. Tres registros obtenidos con dos campañas y un playtest no se tratan como tres observaciones equivalentes. La v3.41.0 prioriza repetición comparable antes de recomendar rebalance.

## Combate
No se modifican:
- HP;
- daño;
- cadencias;
- spawns;
- curvas de dificultad;
- patrones de Guardianes;
- Enemy Behavior Evolution;
- Guardian Telegraph;
- Boss Phase Signature Evolution;
- assets.

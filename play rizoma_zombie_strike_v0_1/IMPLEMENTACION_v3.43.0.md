# RIZOMA ZOMBIE STRIKE v3.43.0
## Perfiles Comparables de Build

**Base única:** v3.42.0 — Comparador de Playtests + Detección de Variabilidad.

## Objetivo

La v3.43.0 fortalece el Playtest Guiado para que las repeticiones diagnósticas puedan ejecutarse con un núcleo de build comparable. El propósito es separar mejor los efectos atribuibles al mundo de aquellos derivados de Nave Rizoma, Flota, Guardián seleccionado, dificultad o progresión permanente del perfil.

No se modifica la curva de HP, daño, spawns, economía, cantidad de proyectiles, IA de Guardianes ni comportamiento enemigo. La versión es diagnóstica y metodológica.

## 1. Contexto reproducible de build

Cada sesión de telemetría puede registrar al inicio y al final:

- Nave Rizoma;
- Nave de Flota de Conquista;
- Guardián seleccionado;
- dificultad;
- etapa de arsenal E1–E4;
- avatar;
- puntuación de mejoras permanentes;
- huella de progresión permanente;
- preset de Hangar cuando está disponible.

Se conservan los campos históricos de nave y etapa para compatibilidad con telemetría anterior.

## 2. Perfiles comparables

El Laboratorio agrupa intentos por núcleo de build y busca una configuración dominante reproducible. Se prioriza una configuración histórica cuando:

1. existe soporte suficiente dentro de la muestra disponible;
2. la Nave Rizoma sigue desbloqueada;
3. la etapa histórica puede reproducirse desde el perfil actual;
4. Flota y Guardián, cuando están registrados, coinciden con opciones reproducibles;
5. para comparaciones exactas, avatar y huella de progresión permanente resultan compatibles.

Si la configuración histórica dominante ya no puede reproducirse, el laboratorio no la presenta como equivalente. En ese caso normaliza el siguiente Playtest desde la build actual y explica la razón.

## 3. Lanzamiento directo del Playtest comparable

El botón **Probar mundo completo** puede iniciar el mundo con la configuración comparable recomendada sin alterar la selección permanente del Hangar. La prueba comienza en L1 y termina tras el Guardián, conservando la lógica de Playtest Guiado introducida en v3.41.

El protocolo copiable incorpora el perfil comparable recomendado, soporte muestral, contexto de nave/flota/Guardián/dificultad/etapa y la regla de comparabilidad empleada.

## 4. Aislamiento persistente reforzado

Se corrigieron varias rutas que podían contaminar el perfil durante una prueba diagnóstica. En Playtest Guiado ahora:

- no aumenta el contador persistente de partidas;
- no modifica la dificultad preferida;
- no actualiza descubrimientos persistentes de poderes o fusiones;
- no alimenta maestría/uso persistente del arsenal;
- no registra descubrimientos críticos ni combos críticos;
- no actualiza logros de progresión asociados a la prueba;
- no modifica el máximo de oleada persistente;
- no cambia DOMINIO, Nave Rizoma, Flota o Guardián persistentes;
- no consume las monedas persistentes del perfil;
- no concede recompensas, ranking ni progresión de campaña.

Los poderes y fusiones obtenidos **dentro de la sesión** siguen funcionando normalmente como parte de la variabilidad propia de la partida; simplemente no se guardan como descubrimientos persistentes.

## 5. Bloqueo del núcleo experimental

Mientras un Playtest comparable está activo quedan bloqueados los cambios de:

- DOMINIO;
- Nave Rizoma;
- Flota;
- Guardián seleccionado.

Esto evita que una prueba iniciada bajo un perfil comparable derive silenciosamente hacia otra configuración. Reiniciar el mundo conserva el mismo perfil experimental.

## 6. Compatibilidad

La telemetría anterior continúa siendo legible. Los intentos históricos sin información de Flota o Guardián se consideran **contexto desconocido**, no equivalencia falsa. La v3.43.0 añade precisión hacia adelante sin invalidar los registros previos.

## 7. Resultado

La v3.43.0 convierte el Playtest Guiado en una herramienta más próxima a un diseño de medidas repetidas: propone repeticiones comparables, conserva el contexto inicial/final de la build y evita que la propia prueba modifique el perfil que se intenta observar.

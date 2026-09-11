# STARFALL FRONTIER v0.6.1 — REACTIVE MATRIX SHADOW

Build completa basada **exclusivamente** en `v0.6.0 — ECONOMY + BOSS SUPPLY FULL`.

## Cambio principal
Se incorpora **REACTIVE BOSS MATRIX / ADAPTIVE COMBAT MATRIX** en su primera fase: **SHADOW MODE**. La matriz calcula potencia real, DPS reciente, TTK proyectado y estado M0–M3 durante cada boss, pero no modifica todavía el combate.

## Conservado sin regresión
- economía, XP, monedas, tienda y precios;
- Boss Supply y poderes heredados;
- naves, enemigos, assets realistas W01–05 y audio;
- Boss Fortress, Boss Anatomy, Endurance Director y Family Tactics;
- Asteroid Director, Mission Director, evolución de nave y Micro-Swarm;
- responsive, fullscreen, checkpoints, ranking y guardado.

Los árboles `assets/` y `audio/` y el archivo `js/economy.js` se verifican por SHA-256 contra la base v0.6.0.

## Telemetría local
La Matrix conserva hasta 60 encuentros localmente. No transmite información fuera del juego.

Desde consola:
- `SF.reactiveMatrix.exportTelemetry()`
- `SF.reactiveMatrix.clearTelemetry()`

## PWA
Se incluye shell PWA ligero (`manifest.webmanifest` + `sw.js`) con `display: fullscreen`. Solo se cachea el shell HTML/CSS/JS e iconos; los assets pesados permanecen bajo el streaming existente.

## Iniciar
Abre `index.html`. En `file://` el juego funciona normalmente y el Service Worker no intenta registrarse. Para instalación PWA, servir la carpeta por HTTP/HTTPS.

Consulta `REACTIVE_MATRIX_SHADOW_IMPLEMENTATION.md` para la especificación completa.

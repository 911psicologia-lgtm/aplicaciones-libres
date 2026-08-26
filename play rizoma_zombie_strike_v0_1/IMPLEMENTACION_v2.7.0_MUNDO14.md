# Implementación v2.7.0 — Mundo 14 · Estrella Moribunda

Base: v2.6.0 · Banda Sonora de Guardianes  
Versión resultante: v2.7.0  
Alcance: M14 completo, sin reconstruir ni rediseñar M1–M13.

## Contenido implementado

- Nuevo mapa M14 `Estrella Moribunda`, cinco actos y progresión de campaña.
- Fondos dedicados de aproximación y arena final.
- Guardián `Heliovorax · Némesis Nova` con cuatro estados perceptibles: corona estable, fractura, pérdida de masa y núcleo desnudo.
- Movimiento propio del Guardián: radial, arco de llamarada, colapso hacia el centro y `novaBlink` de corto alcance; la fase final reduce tamaño y eleva velocidad/agresividad.
- Ataques de identidad solar: abanicos de llamaradas, arcos, ondas radiales, zonas térmicas, detonaciones Nova, fragmentos coronales y presión gravitacional.
- Tres familias canónicas: Corona, Plasma y Colapso.
- Seis enemigos normales y tres subjefes canónicos: Centurión de Protuberancia, Arconte de Fulguración y Caballero de la Penumbra Solar.
- Seis hazards dedicados, dos proyectiles dedicados y eventos Nova durante la aproximación.
- Poder `Nova Agónica`, 11 s, con pulsos radiales, daño de área y limpieza limitada de proyectiles.
- Reliquia `Trono Nova` registrada al completar M14.
- Forma DOMINIO/nave capturable `Trono Nova`, con sprite propio y firma `Nova Agónica`.
- Historia de entrada para lanzamiento directo de M14 y transición narrativa M13→M14; epílogo M14 apunta a M15 sin implementarlo prematuramente.
- Música de jefe M14 procedural provisional; no se añadió canción externa inexistente.
- HUD M14 con acto, progreso, eventos Nova y porcentaje de aproximación al Guardián.
- Guardado/carga/reintento incluyen estado propio de M14.

## Balance preservado

Se conservan los multiplicadores globales de v2.6.0: Guardianes y escudos +10 %, subjefes +10 % y esbirros +5 %, sin añadir un segundo multiplicador global sobre ellos. La Bomba Omega conserva su regla canónica: 100 % menores, 45 % medios, 25 % élites/ecos, hasta 8 % del Guardián sin ejecutarlo y limpieza de proyectiles. La tienda continúa pausando totalmente el juego y restaura exactamente el estado de pausa previo al cerrarse.

## QA realizado

- `node --check js/game.js`: OK.
- `manifest.json`: JSON válido.
- Referencias literales de assets en JS/HTML/CSS: 0 faltantes.
- Assets M14: 22/22 abren correctamente; PNG con transparencia verificada; fondos 1920×1080.
- `orientation: landscape-primary` permanece en `manifest.json`.
- Versiones de `index.html`, `manifest.json`, `sw.js` y `game.js`: v2.7.0.
- Progresión usa `MAPS.length`; M14 queda jugable/desbloqueable y M15 permanece como señal futura, no como mapa falso.
- La transición narrativa de M13 se conserva al existir ahora un mundo posterior.
- Prueba de integridad del ZIP final: incluida en `VALIDACION_v2.7.0.txt`.

## Limitación de QA

El contenedor de construcción no logró completar una sesión Chromium headless estable para una prueba interactiva automatizada; la aplicación sí fue servida por HTTP y el HTML respondió correctamente. Por ello, la validación final en dispositivo real debe concentrarse en tacto/orientación, densidad del HUD y sensación del patrón de Heliovorax. No se oculta esta limitación como si existiera una prueba interactiva completa.

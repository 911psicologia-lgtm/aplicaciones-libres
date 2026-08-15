Aero · Fase 68 · Mundo 1 y 2 Premium + ajustes transversales

Base: Fase 67 Bonus Track.

Implementado en Mundo 1:
1. Inicio menos plano:
   - más plataformas en segundo nivel;
   - premios arriba;
   - pequeños enemigos arriba y abajo;
   - fuego por franjas en la zona inferior;
   - variación de llamas rojas y claras.
2. Laberinto reorganizado en dos niveles:
   - pasillos más amplios para que Aero quepa;
   - zigzag jugable;
   - cajas rompibles y premios dentro de la ruta.
3. Módulo de romper cosas:
   - nuevos bloques rompibles con premios;
   - núcleos/rompecabezas asociados al núcleo inicial.
4. Dos transformaciones:
   - una transformación intermedia;
   - una segunda antesala al jefe.
5. Antesala del jefe:
   - zona de recarga;
   - escudo;
   - aliado/poder;
   - nuevo poder de Lanza Aurora.
6. Cierre después del jefe:
   - se amplió y cerró con bloques de límite;
   - se evita la sensación de espacio infinito plano.

Implementado en Mundo 2:
1. Nuevo corredor mecánico de dos niveles:
   - nivel base y nivel superior transitables;
   - tercer nivel con plataformas móviles o temporales;
   - pasajes amplios para evitar premios encerrados.
2. Módulo tipo Donkey/Mecha Loop:
   - sube, baja, evita enemigos y rompe;
   - rutas con hordas y pickups.
3. Bloques/amenazas móviles:
   - péndulos mecánicos como compuertas grandes.
4. Poder identitario:
   - láser, granadas y apoyo de aliados como herramientas contra Goliath.
5. Antesala del jefe:
   - recarga, escudo y arma antes de jefe.
6. Jefe reforzado:
   - Goliath Mecha · Tres Fases;
   - más vida, velocidad y helpers.
7. Cierre posterior:
   - bloques de cierre y límite después del jefe.

Ajustes transversales:
1. HUD compacto:
   - se oculta el cuadro grande de texto de mundo;
   - se reduce el panel de estadísticas;
   - se ocultan jugador y total durante HUD de combate;
   - avatar más pequeño.
2. Títulos de tramo:
   - ya no persiguen a Aero;
   - aparecen como transición breve y desaparecen.
3. Límite derecho de mundo:
   - Aero queda limitado por levelEndX() para evitar correr hacia espacios infinitos.
4. Nuevo poder:
   - weapon mode: Lanza Aurora.
   - rewardType spearPower.
   - dispara pequeñas lanzas luminosas con daño alto y perforante.
5. Móvil:
   - se mantiene la mejora previa de pantalla completa y controles táctiles;
   - HUD más compacto también en celular.

Validación:
- js/main.js validado con node --check.
- index.html actualizado con CSS/JS embebidos.
- ZIP plano con index.html en raíz para Cloudflare.

Aero · Fase 66 · Modo móvil jugable + mundos 9 y 10

Base: Fase 65.

Implementación móvil:
1. Modo celular real:
   - Se activa en celulares horizontales pequeños.
   - Se agrega clase body.phone-gameplay.
   - Canvas ocupa 100dvw x 100dvh.
   - HUD, avatar y controles se reducen.
   - Se oculta el pad derecho en celular.
   - El pad izquierdo ahora mueve, sube/salta y baja/agacha.
   - El lado derecho de la pantalla queda como zona invisible de salto/deslizamiento.

2. Cámara/escala:
   - Escala de juego móvil: 0.68 a 0.78 según tamaño.
   - Se aplica viewport de juego para reducir visualmente Aero, enemigos, bloques, jefes y escena.
   - Se añade compensación vertical suave para que Aero no desaparezca cuando sube, vuela o cae.
   - Se amplió el culling horizontal con visibleWorldWidth() para que los enemigos no desaparezcan antes de tiempo en zoom móvil.

3. Salto y rescate:
   - El salto táctil ya no depende de doble tap.
   - Cada toque/deslizamiento arriba genera salto o doble salto confiable.
   - Se agrega botón contextual ↟ SALIR cuando Aero está en riesgo:
     - lodo/lagos/arena;
     - fuera del área cómoda;
     - posible atasco;
     - zonas complejas.
   - El rescate consume stamina, impulsa a Aero hacia arriba y da invulnerabilidad breve.
   - Se añade detector de atasco móvil.

4. Amenazas fuera de pantalla:
   - En celular se dibujan marcadores de enemigos/jefes fuera de cuadro.
   - Evita ataques injustos de enemigos invisibles.

Mundos nuevos:
5. Mundo 9 · Archivo de Sombra:
   - Activo y jugable.
   - Mezcla enemigos y jefes visuales de mundos anteriores.
   - Tramos de archivo, espejos, rutas falsas y memorias.
   - Jefe: Espejo Nulo · Archivo de Sombra.
   - Usa assets existentes: diablito_jefe_3 y kharon_lancero_alado como apoyo.
   - 142 orbes y 188 enemigos.

6. Mundo 10 · Núcleo del Doctor Sombra:
   - Activo y jugable.
   - Batalla final de campaña.
   - Núcleo oscuro, fases finales, ruptura de posesión, Aurora y Lanza Aurora activa.
   - Jefe: Doctor Sombra · Núcleo Final.
   - Usa assets existentes: demonio_bestia_2_hidra y diablito_jefe_3 como apoyo.
   - 168 orbes y 224 enemigos.

7. Selector:
   - Ahora hay 10 mundos activos.
   - Teclas 1 a 9 y 0 para el mundo final.
   - Las tarjetas se compactan cuando hay muchos mundos.

8. Narrativa:
   - Mundo 9 libera el Archivo de Sombra.
   - Mundo 10 cierra con Doctor Sombra derrotado y Aurora liberada.
   - Los mensajes finales de campaña fueron ajustados.

Validación:
- js/main.js validado con node --check.
- index.html actualizado con CSS/JS embebidos.
- ZIP plano con index.html en raíz para Cloudflare.

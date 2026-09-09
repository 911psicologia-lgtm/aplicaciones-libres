# RIZOMA ZOMBIE STRIKE v3.31.0
## Pulido UX móvil + legibilidad de combate

### Base maestra

- Base exclusiva: `Rizoma_Zombie_Strike_v3.30.0_Tractor_Progresivo_Taller_Rizoma.zip`.
- SHA-256 verificado de la base: `d65419882a2ff8abb8298bf36f7059d8bd5312e3656eb574c70be5b8110c6416`.
- No se reconstruyó el proyecto ni se usaron versiones anteriores.
- Se mantienen 20 mundos. No se creó Mundo 21.
- Los 840 archivos bajo `assets/` fueron conservados byte a byte.
- No se integró ni sustituyó audio, video o arte existente.

### Archivos de código modificados

- `js/game.js`
- `css/styles.css`
- `index.html`
- `manifest.json`
- `sw.js`

No se eliminó ningún archivo preexistente de la base v3.30.0.

## Cambios funcionales v3.31.0

### 1. Controles móviles más táctiles

- Se ampliaron áreas táctiles de X, flechas, compras y controles principales de HUD.
- Objetivo general: 40–44 px cuando el espacio lo permite.
- En celular horizontal los controles prioritarios quedan en 40×40 px; solo en pantallas extremadamente bajas se compactan a 38×38 px para preservar legibilidad y espacio de combate.
- Se conserva `touch-action: manipulation` y se evita ampliar innecesariamente el tamaño visual de todos los iconos.

### 2. Cierre universal y bloqueo de overlays

- Taller RIZOMA, DOMINIO y Flota conservan cierre por X.
- Se mantiene cierre al tocar el fondo del overlay.
- Escape cierra primero el overlay abierto antes de actuar sobre la pausa del juego.
- El cierre mantiene la protección anti-click-through existente.
- Mientras un overlay de combate está abierto se bloquea el scroll del fondo mediante `combat-overlay-open`, sin interferir con el scroll interno del panel.
- El bloqueo se sincroniza al abrir y cerrar Taller, DOMINIO y Flota.

### 3. Scroll horizontal más robusto

- Taller, DOMINIO y selector de Flota usan scroll suave y `overscroll-behavior` contenido.
- Se conserva swipe/touch horizontal y flechas laterales.
- La rueda del mouse/trackpad sobre los carriles se traduce a desplazamiento horizontal cuando corresponde.
- Se evita que la página de fondo absorba el desplazamiento mientras el overlay está activo.
- En Hangar se reforzó el comportamiento táctil sin sustituir su estructura existente.

### 4. Taller RIZOMA más compacto

- Las tarjetas muestran ahora una jerarquía breve: tipo, categoría, nombre, efecto resumido y coste.
- Las descripciones largas se conservan en `title` para consulta sin llenar la tarjeta de texto.
- Se distinguen explícitamente:
  - `REAJUSTE`;
  - `SUMINISTRO`;
  - `VIDA EXTRA`.
- Se compactaron alto de tarjetas, encabezado y pie en móvil horizontal.
- Se preservó la lógica económica, costes, límites, entregas y reajustes de v3.30.0.

### 5. DOMINIO con separación conceptual

El mismo carril ahora presenta dos separadores compactos:

- `NAVES / RIZOMA`;
- `FORMAS / GUARDIÁN`.

No se creó un menú adicional. Las tarjetas siguen siendo seleccionables dentro de la estructura existente y los textos secundarios se limitan visualmente para mejorar lectura móvil.

### 6. RIFT ALLY y Guardián Vinculado

- Se mantuvo su diferenciación funcional.
- No se alteraron sus duraciones previstas: RIFT ≈ 10 s y Guardián Vinculado ≈ 12 s.
- Los controles del HUD ganan área táctil y mejor lectura en móvil sin cubrir una porción excesiva del campo de juego.

### 7. Última Oportunidad

- Se añadió un botón táctil directo `ABRIR RESCATE` dentro de la alerta roja.
- Las acciones de rescate manual usan tarjetas/botones más grandes.
- El overlay de alerta queda por encima del combate normal, pero por debajo del Taller de rescate, para no bloquear sus controles.
- Se conserva la cuenta regresiva y la decisión manual del jugador.
- No se añadió compra automática, gasto automático ni resurrección automática.

### 8. Tractor gravitacional: solo pulido visual

La mecánica del Tractor v3.30.0 no fue rediseñada. Se preservan alcance, prioridad, velocidad, rescate final y lógica de atracción.

Para evitar ruido visual, solo se limita el número de haces dibujados simultáneamente:

- móvil: hasta 3;
- pantalla pequeña no móvil: hasta 4;
- resto: hasta 7.

Los pickups adicionales siguen siendo atraídos con su lógica normal; únicamente se omiten líneas visuales excedentes.

### 9. Ritmo y legibilidad de combate

- Se conservaron microenjambres, curvas de dificultad, spawn, Guardianes y comportamiento de combate existente.
- No se redujo dificultad real ni se aumentó HP como solución de UX.
- Esta versión prioriza reducción de ruido visual y tamaño de UI antes que alterar enemigos esenciales.
- No se modificó la curva heredada M1–M20 de v3.30.0.

### 10. Versionado PWA

Se sincronizó v3.31.0 en:

- `js/game.js`;
- `manifest.json`;
- `sw.js`;
- `index.html`.

El nombre de caché del service worker se actualizó a `rizoma-zombie-strike-v3-31-0` para evitar servir recursos de la revisión anterior.

## Alcance deliberadamente no modificado

Para reducir regresiones no se tocaron:

- número de mundos;
- HP/escudos/curva de dificultad;
- identidades de Guardianes;
- lógica del Director de microenjambres;
- economía central del Taller;
- sistemas de Maestría;
- Naves Rizoma o Flota de Conquista;
- lógica funcional del Tractor;
- assets gráficos;
- audio y música;
- cinematográficas existentes.

## Validación

La validación técnica detallada está en `VALIDACION_v3.31.0.txt`.

Chromium está instalado en el entorno, pero el intento headless no llegó a completar la carga/captura y terminó bloqueado por el entorno. Por ello **no se declara smoke test visual real de navegador ni prueba física en Android/iOS**. Sí se ejecutaron controles estáticos, sintácticos, de integridad de assets y de estructura del proyecto.

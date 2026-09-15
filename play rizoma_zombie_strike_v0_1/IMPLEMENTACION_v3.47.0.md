# IMPLEMENTACIÓN v3.47.0 — DSEBI HARDENING

Base exclusiva: **Rizoma Zombie Strike v3.46.0 — Adaptive Director Live-Lite + Resurrección Mutante + Formaciones de Antesala**.

## 1. Corrección crítica de Antesala

Se añadió `const world=this.mapIndex+1;` dentro de `updateBossApproach(dt)`.

Esto corrige el `ReferenceError` potencial al seleccionar formaciones ABANICO/PINZA/LANZA/DISPERSIÓN.

## 2. Versionado sincronizado

Todos los puntos de entrada quedan en v3.47.0:

- `VERSION` en `game.js`;
- `<title>` y texto de marca;
- `game.js?v=3.47.0`;
- `css/styles.css?v=3.47.0`;
- `manifest.json?v=3.47.0`;
- `manifest.version` y `start_url`;
- service worker y nombres de caché.

## 3. PWA Hardening

El service worker deja de tener un `fetch` vacío.

Ahora incorpora:

- precache del shell mínimo;
- network-first para navegación;
- fallback a `index.html` cacheado;
- cache-first runtime para scripts, estilos, imágenes, fuentes, audio no-Range y JSON/SVG/WEBP/PNG/JPG;
- exclusión de solicitudes Range para no romper streaming multimedia;
- límite de 320 entradas runtime para evitar crecimiento ilimitado;
- limpieza de cachés de versiones anteriores.

No se precargan los ~229 MB de assets completos.

## 4. Instalabilidad

Se añadieron:

- `assets/icon-192.png`;
- `assets/icon-512.png`;
- `apple-touch-icon`;
- manifest con PNG 192/512 + SVG.

## 5. Adaptive Boss Director alineado con la realidad

La descripción y telemetría ahora reflejan LIVE-LITE:

- A2: 8% de amortiguación;
- A3: 14%;
- resurrección única al 50% cuando el primer derribo es extremadamente rápido;
- no se anuncia supresión temporal porque todavía no está implementada.

## 6. Coherencia editorial

- “quince mundos” → “veinte mundos”;
- “SHADOW MODE activo” → “LIVE-LITE activo”.

## 7. Accesibilidad del panel de Ajustes

Se añadió:

- `role="dialog"`;
- `aria-modal="true"`;
- estado `aria-hidden` sincronizado;
- foco automático al botón de cierre;
- restauración del foco al cerrar;
- cierre con Escape;
- cierre al tocar/clickear el fondo;
- trampa de Tab/Shift+Tab dentro del panel.

## 8. Accesibilidad/robustez HTML

- etiqueta accesible para `newProfileName`;
- todos los botones HTML tienen `type="button"`.

## Sistemas deliberadamente no alterados

No se cambian HP, daño, patrones signature, economía, Naves Rizoma, RIFT, Guardián Vinculado, Tractor, Última Oportunidad ni curva M1–M20.

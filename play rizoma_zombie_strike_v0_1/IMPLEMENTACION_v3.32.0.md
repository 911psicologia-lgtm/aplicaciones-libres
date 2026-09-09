# RIZOMA ZOMBIE STRIKE v3.32.0
## Accesibilidad móvil + háptica + lectura táctica de aliados + rendimiento visual

### Base maestra

- Base exclusiva: `Rizoma_Zombie_Strike_v3.31.0_UX_Movil_Legibilidad_Combate.zip`.
- SHA-256 de la base utilizada: `3c08e82e026500d02c720fa58b273be57463affd1731357f4e4f7ad5f7b96569`.
- Se conserva la campaña completa M1–M20 y no se crea Mundo 21.
- Los 840 archivos preexistentes de `assets/` permanecen idénticos byte a byte.
- No se sustituyeron sprites, música, videos ni SFX.

### Archivos de código modificados

- `js/game.js`
- `css/styles.css`
- `index.html`
- `manifest.json`
- `sw.js`

### 1. Háptica móvil opcional

Se añade en Ajustes **Respuesta háptica (móvil compatible)**.

- Está desactivada por defecto para respetar preferencias existentes.
- Usa `navigator.vibrate` únicamente cuando el navegador/dispositivo lo soporta.
- Feedback breve y con limitación temporal para evitar vibración excesiva.
- Señales implementadas: daño recibido con throttling, invocación de Guardián, RIFT ALLY, compra táctica, alerta de Última Oportunidad y rescate confirmado.
- No modifica sonido, música ni vibración visual/shake.

### 2. Lectura táctica de aliados

Cuando un Guardián Vinculado o RIFT ALLY está activo aparece una banda compacta con:

- fuente: GUARDIÁN o RIFT;
- comportamiento resumido: **CAZADOR**, **INTERCEPTOR** o **DRENADOR**;
- tiempo restante;
- minibarra temporal visual.

La clasificación deriva del comportamiento ya existente del Guardián; no cambia su IA ni sus ataques.

También se amplían `aria-label` y `aria-pressed` en los controles de Guardián/RIFT para comunicar estado, rol y cooldown de forma más clara.

### 3. Bajo rendimiento más coherente

El modo manual se refuerza priorizando reducción de coste visual antes que jugabilidad:

- partículas base: 46;
- gobernador visual puede bajar hasta aproximadamente 0,46;
- sombras de partículas desactivadas en modo bajo rendimiento;
- menos rayos decorativos en entradas de aliados;
- blur/backdrop y sombras CSS costosas reducidas en paneles/HUD.

Importante: v3.32 deja de reducir dentro de `applyPerformanceMode()` los límites esenciales de pickups, meteoros y proyectiles por el mero hecho de activar bajo rendimiento. Así se evita convertir una preferencia gráfica en una reducción indirecta de presión/dificultad.

### 4. Accesibilidad de controles

Se añaden etiquetas accesibles explícitas a controles críticos que todavía dependían principalmente de iconos o `title`:

- Taller RIZOMA;
- Pausa;
- cierre de Ajustes;
- estado dinámico de Guardián y RIFT.

La nueva banda del aliado utiliza `role=status` y `aria-live=polite`.

### 5. Sistemas deliberadamente preservados

No se modificaron:

- curva de dificultad M1–M20;
- HP de Guardianes;
- microenjambres;
- economía central del Taller;
- Tractor gravitacional;
- RIFT ALLY = 10 s;
- Guardián Vinculado ≈ 12 s;
- Última Oportunidad = 5 s y rescate manual;
- Naves Rizoma;
- Flota de Conquista;
- DOMINIO;
- assets, audio y cinematográficas.

### 6. Versionado PWA

Versionado sincronizado en:

- `game.js`: 3.32.0;
- `manifest.json`: 3.32.0;
- `index.html`: 3.32.0;
- cache del service worker: `rizoma-zombie-strike-v3-32-0`.

### Validación

Ver `VALIDACION_v3.32.0.txt`.

Chromium headless volvió a quedar bloqueado en el entorno (DBus/zygote) y no produjo DOM/captura antes del timeout. Por ello no se declara prueba visual real de navegador ni prueba física Android/iOS.

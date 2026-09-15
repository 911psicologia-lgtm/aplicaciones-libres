# AUDITORÍA DSEBI TRIPLE — RIZOMA ZOMBIE STRIKE v3.46.0 → v3.47.0

## Contexto del producto inferido desde la aplicación y documentación de continuidad

- **Propósito:** shooter arcade web/PWA de ciencia ficción y horror biomecánico, con campaña de 20 mundos, progresión de build, Naves Rizoma, Flota, Guardianes y combate adaptativo.
- **A quién va dirigida:** jugadores de shooters arcade/shmup en PC, tablet y especialmente celular horizontal, con interés en progresión, builds y jefes de varias fases.
- **Identidad que debe portar:** frenética, táctil, espectacular, progresiva, legible bajo presión, con Guardianes reconocibles y continuidad de combate.
- **Qué no debe transmitir:** pantalla vacía, jefes genéricos o triviales, dificultad injusta, recompensas anuladas por escalado adaptativo, UI móvil frustrante, información obsoleta o sensación de aplicación web dependiente de una conexión perfecta.

> Nota antialucinación: esta auditoría distingue integridad estática de funcionamiento demostrado. No se atribuye prueba física Android/iOS ni campaña completa M1–M20 jugada en dispositivo real.

---

# AGENTE A1 — EVALUADOR

| Dimensión | Estado | Evidencia / dictamen |
|---|---|---|
| 1. Funcionalidad real | **ACEPTABLE** | La sintaxis, assets, 20 mundos, manifest y sistemas principales están presentes. No puede calificarse ÓPTIMO porque v3.46 carecía de prueba física y campaña completa documentada. |
| 2. Coherencia con propósito | **ÓPTIMO** | La continuidad de combate, microenjambres, Guardianes adaptativos y progresión de build responden directamente al propósito de shooter arcade continuo. |
| 3. Fidelidad identitaria | **ACEPTABLE** | La identidad visual/táctica está consolidada, pero v3.46 mostraba textos obsoletos: “quince mundos” y “SHADOW MODE” aunque la campaña tiene 20 mundos y el Director ya era LIVE-LITE. |
| 4. Claridad de UX | **ACEPTABLE** | Existen HUD, telegráficos, Hangar, Taller y ayudas. El panel de Ajustes carecía de gestión completa de foco/Escape y podía competir con el control global de pausa. |
| 5. Consistencia visual | **ACEPTABLE** | Hay un sistema visual coherente y responsive, pero no se declara smoke test visual real en navegador/dispositivo dentro de esta auditoría. |
| 6. Accesibilidad básica | **ACEPTABLE** | Hay ARIA, reduced motion, haptics opcionales y etiquetas en numerosos controles. Persistían un input de perfil sin etiqueta accesible y diálogo de Ajustes sin foco modal real. |
| 7. Robustez técnica | **INSUFICIENTE** | v3.46 contenía un `ReferenceError` potencial en la antesala (`world` no definido), query strings de versiones antiguas y un service worker sin estrategia `fetch`. |
| 8. Calidad formativa | **ACEPTABLE** | Telegráficos, roles, fases, etiquetas y Laboratorio enseñan por interacción. La cantidad de sistemas avanzados todavía puede exigir contextualización adicional a jugadores nuevos. |
| 9. Traducibilidad sin autor | **ACEPTABLE** | Gran parte del estado se explica dentro de la UI, pero términos como DOMINIO, RIFT, A0–A3 y Director Adaptativo requieren una lectura previa del sistema para comprenderse plenamente. |
| 10. Pertinencia contextual | **ÓPTIMO** | El diseño prioriza móvil horizontal, PWA, rendimiento adaptable y partidas de arcade progresivas, coherentes con el contexto de uso declarado. |

---

# AGENTE A2 — CUESTIONADOR

A2 **no acepta** el diagnóstico de A1 sin objeciones y encuentra problemas que A1 no explicitó en su primera lectura:

## 1. Fallo crítico oculto en la Antesala del Guardián

`updateBossApproach()` calculaba la formación con:

```js
styles[((a.waves||0)+world-1)%styles.length]
```

pero `world` solo existía localmente en `beginBossApproach()` y no dentro de `updateBossApproach()`.

**Consecuencia:** al intentar generar una microhorda de antesala podía ocurrir `ReferenceError: world is not defined`, interrumpiendo precisamente el sistema diseñado para llenar los vacíos antes del Guardián.

## 2. La PWA no tenía una estrategia real de recuperación de red

El service worker de v3.46 terminaba en:

```js
self.addEventListener('fetch', () => {});
```

Por tanto, limpiaba cachés antiguas pero no ofrecía shell offline ni caché runtime de recursos visitados. A2 considera que A1 fue demasiado indulgente al separar este punto de la funcionalidad real: en una aplicación que se presenta como PWA, la dependencia total de red afecta la experiencia de uso.

## 3. Riesgo de cargar código obsoleto por versionado inconsistente

Aunque el título indicaba v3.46.0:

- manifest se enlazaba con `?v=3.41.0`;
- CSS con `?v=3.16.0`;
- `game.js` con `?v=3.45.0`.

Esto puede hacer que navegador/CDN reutilicen una representación cacheada anterior, especialmente en un despliegue web que conserva los mismos nombres físicos de archivo.

## 4. El Director Adaptativo describía una intervención distinta de la que realmente ejecutaba

La UI decía “SHADOW MODE”, pero v3.46 ya aplicaba LIVE-LITE. Además, `adaptiveBossResponse()` informaba mitigaciones teóricas de 18%/30% y supresión temporal, mientras la intervención real era 8%/14% y no existía supresión activa. A2 considera esto un problema de confianza y trazabilidad, no un detalle cosmético.

## 5. Accesibilidad modal incompleta

A1 detectó una debilidad general, pero A2 concreta el problema: al abrir Ajustes no se movía el foco, no existía trampa de foco, el fondo seguía siendo navegable por teclado y `Escape` podía llegar al manejador global del juego y activar pausa en lugar de cerrar el panel.

---

# AGENTE A3 — INTEGRADOR Y DECISOR

## Dictamen

La base v3.46 es **funcionalmente rica y coherente**, pero no debía considerarse lista para consolidación sin corregir primero varios problemas de robustez que no dependen de balance ni contenido. La prioridad no es añadir mundos, enemigos o poderes, sino **endurecer la entrega web/PWA y corregir divergencias entre sistema real y sistema comunicado**.

## Prioridad de mejoras

### CRÍTICO

1. **Corregir `ReferenceError` de la Antesala del Guardián.**
2. **Sincronizar versionado v3.47.0 en HTML, JS, manifest, CSS query y service worker** para evitar carga de código obsoleto.

### ALTO

3. **Implementar service worker real**: precache del shell y caché runtime de recursos visitados, sin intentar descargar preventivamente los ~229 MB del juego.
4. **Alinear Adaptive Boss Director con la implementación real LIVE-LITE**: A2 ≈8%, A3 ≈14%, resurrección única al 50% ante derribo extremo; eliminar referencias no implementadas a supresión activa.
5. **Corregir información identitaria obsoleta**: 20 mundos, no 15; LIVE-LITE, no SHADOW.
6. **Reforzar accesibilidad del panel de Ajustes**: diálogo modal, `aria-hidden`, foco de entrada/salida, `Escape`, click exterior y trampa de foco.
7. **Corregir accesibilidad básica de creación de perfil** y fijar `type="button"` en botones para evitar comportamientos de submit accidentales futuros.
8. **Añadir iconos PNG 192/512 para instalación PWA**, manteniendo el SVG existente.

### MEDIO — NO IMPLEMENTADO AUTOMÁTICAMENTE EN ESTA VERSIÓN

- Realizar prueba física Android/iOS y campaña M1–M20 completa.
- Añadir un glosario/tutorial compacto para DOMINIO, RIFT, Director A0–A3 y sistemas avanzados.
- Introducir pruebas automatizadas de runtime para escenas críticas (antesala, resurrección, Última Oportunidad, overlays).
- Evaluar partición futura del `game.js` monolítico por mantenibilidad, sin hacerlo dentro de una versión de endurecimiento.
- Valorar un paquete offline completo opcional. No se precargan 229 MB automáticamente para evitar consumo agresivo de almacenamiento/datos.

---

# RESULTADO DE IMPLEMENTACIÓN

Las mejoras CRÍTICAS y ALTAS fueron implementadas en **v3.47.0 — DSEBI Hardening**.

La lógica central de combate no fue rediseñada. La comparación con v3.46 confirmó identidad byte a byte en 11 funciones críticas de combate no relacionadas con los arreglos DSEBI.

# TRAS · Cambios v0.16.7 — mejora preservativa

Intervención mínima sobre v0.16.6, sin tocar el instrumento, el esquema de
datos clínicos ni los prompts de interpretación.

1. **Splash de entrada.** Pantalla breve con el logo institucional y un
   botón "Entrar" antes de mostrar la app. No interfiere con la carga de
   casos guardados (`initApp()` corre igual detrás).
2. **Recorrido de ayuda eliminado.** Se quitaron el modal, los botones
   "Ayuda / recorrido" (menú lateral y barra superior) y las funciones
   asociadas (`openTour`, `renderTour`, `nextTour`, `prevTour`, `closeTour`,
   `tourSteps`, `TOUR_SEEN_KEY`).
3. **Archivo único por caso, autorrenombrado.** Todas las descargas ligadas
   a un caso (informe HTML/Word, HC HTML/Word, JSON del caso, soporte
   XLSX, exportación consolidada e informe/devolución terapéutica) usan
   ahora `caseFileSlug()`: el primer nombre del evaluado, sin tildes ni
   caracteres inválidos, con reserva al número de caso o a "caso" cuando
   no hay nombre registrado.
4. **Demo sin duplicados.** Verificado: `demo.js` ya localiza el caso por
   `isDemo`/`TRAS-DEMO-001` y lo actualiza en el mismo lugar.
5. **Prompts sin mezclar casos.** Verificado: cada `buildPrompt()` toma
   `getCurrentCase()` en el momento de generarse; no hay estado residual
   entre casos.
6. **Cajón de JSON despejado.** Se retiró el botón "Validar" suelto
   (`importAiJson()` ya valida antes de insertar). "Pegar del
   portapapeles" y "Cargar JSON" pasaron a íconos con `aria-label`;
   "Vaciar cajón" conserva texto por ser una acción destructiva.
7. **Botón principal con resplandor.** `.ai-primary-wide` incorpora un
   pulso sutil (`ctaGlow`), pausado al pasar el mouse y neutralizado por
   `prefers-reduced-motion`.

Cambios de soporte: `manifest.webmanifest` suma el logo PNG como ícono
adicional; `sw.js` avanza a `tras-v0.16.7` e incluye el logo en la caché
offline; `APP_VERSION` pasa a `v0.16.7`.

# Informe técnico — v0.5.7 REALISTIC ART PRIMARY

## Problema detectado
La librería realista W01–05 ya estaba integrada, pero la rama conservaba una decisión antigua de la fase híbrida: bosses/subjefes/fondos se utilizaban como overlays de baja opacidad. Esto impedía que el nuevo arte fuese realmente visible como identidad principal.

## Solución
1. Promoción de spritesheets de subjefes a render principal.
2. Promoción de bosses por fases a render principal.
3. Sustitución visual temporal por `open_core` durante vulnerabilidad.
4. Promoción de fondos realistas a escenario principal según base/intense/boss.
5. Conservación de arte legacy solo como fallback/parallax de baja intensidad.
6. Uso de `death_sheet` como cinemática corta no bloqueante al morir el jefe.

## Riesgo controlado
La secuencia de muerte no altera la lógica de recompensa ni la transición: es puramente visual y se renderiza de forma independiente. Por ello mantiene el watchdog y evita reintroducir congelamientos al matar jefes.

## Validación
- Sintaxis JS completa verificada.
- Suite de pruebas existente completa: PASS.
- Nueva prueba `realistic-primary-render-v057.js`: PASS.

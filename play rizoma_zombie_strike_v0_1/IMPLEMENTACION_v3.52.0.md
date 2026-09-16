# RIZOMA ZOMBIE STRIKE v3.52.0 — GUARDIAN TACTICAL EVOLUTION

## Propósito
Nueva iteración incremental sobre v3.51.0 orientada a que los Guardianes respondan menos como patrones prefijados y más como adversarios que observan, encadenan y escalan tácticamente. No se añade HP base.

## Cambios

### 1. Memoria táctica corta del jugador
- El combate contra Guardián registra de forma temporal velocidad, dirección lateral/vertical y cambios de sentido del jugador.
- La memoria se suaviza y pierde confianza cuando el movimiento cambia; no persiste entre partidas.
- Sólo determinadas secuencias signature usan esta memoria para anticipar una posición futura razonable.

### 2. Secuencias signature encadenadas
- Los Guardianes desde fase 2 pueden activar secuencias de tres pasos.
- Tipos: `CRUZ DE CAZA`, `HÉLICE INVERSA`, `PINZA PREDICTIVA`, `CERCO DE DEPREDACIÓN`.
- Las secuencias alternan frente, flancos, radial, contraángulos y homing puntual.
- En M11–M20 reutilizan los sprites de proyectil propios del mundo.
- El sistema evita iniciar una secuencia si ya existe una densidad alta de proyectiles enemigos.

### 3. Último Asalto
- Al entrar en el último ~16% de HP y fase 4 se activa una señal telegráfica de ~1.2 s.
- Después abre un tramo final de ~7.2 s con mayor movilidad y una secuencia signature inmediata.
- No añade HP ni resurrecciones extra.
- Sólo ocurre una vez por encuentro.

### 4. Integración con fases
- Después de una ruptura de fase avanzada, la siguiente secuencia signature se acerca temporalmente para que cada fase muestre antes su carácter.
- La resurrección reinicia la secuencia activa y permite que el sistema continúe sin duplicar el Último Asalto si ya ocurrió.

### 5. Telemetría local
- `boss.signatureSequences`: número de secuencias signature ejecutadas.
- `boss.lastStand`: indica si ocurrió Último Asalto.
- El resumen final puede mostrar ambos datos.

## Conservación
Se preservan los 20 mundos, curva base de HP, Adaptive Director, resurrección al 50%, Combat Flow, Flota, DOMINIO, RIFT, Hangar, Taller, tractor, economía, PWA y assets existentes.

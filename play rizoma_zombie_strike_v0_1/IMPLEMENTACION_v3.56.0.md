# RIZOMA ZOMBIE STRIKE v3.56.0 — RIZOMA FLOW + PERFECT DODGE RESONANCE

## Objetivo
Profundizar el counterplay contra Guardianes sin aumentar HP base ni bloquear poderes. La nueva capa convierte la evasión precisa y la resolución limpia de mecánicas en un recurso táctico acumulable.

## Implementaciones

### 1. Rizoma Flow
- Los casi-impactos de proyectiles hostiles durante una batalla de Guardián cargan Flow.
- Cada proyectil solo puede registrar una esquiva perfecta una vez.
- El casi-impacto se valida únicamente cuando el proyectil ya se aleja del jugador, evitando falsos positivos de balas todavía entrantes.
- Anclas destruidas, firmas limpias, Cerco superado y Enlace interrumpido/esquivado también aportan carga.
- Al alcanzar 100 puntos se activa `RIZOMA FLOW` durante 5.6 s y queda preparado un Duelo Rizoma.

### 2. Duelo Rizoma
- Ventana de 5.4 s disponible desde fase 2.
- Reduce temporalmente el relleno: no aparecen nuevos minions, escoltas ni hazards mientras el duelo está activo.
- El Guardián ejecuta una firma directa y legible.
- Superar el duelo sin daño significativo abre NÚCLEO EXPUESTO con bonificación de Flow.

### 3. Sinergia con Núcleo Expuesto y Riposta
- Flow activo amplía ligeramente la ventana de contraataque.
- Reduce aproximadamente 20% el umbral de carga necesario para la Riposta.
- Una Riposta con Flow puede disipar hasta 3 proyectiles hostiles cercanos y recuperar una pequeña fracción de escudo.
- No se modifica el HP base del jefe.

### 4. Telemetría
Nuevos contadores locales:
- `perfectDodges`
- `flowBursts`
- `duelWindows`
- `duelWins`

### 5. Guía Táctica
Se agregaron entradas para:
- ≋ RIZOMA FLOW
- ◇ DUELO RIZOMA

## Conservación
- 20 mundos preservados.
- Director Adaptativo, resurrección, Último Asalto, Arena Control, Escort Synergy, Anclas de Fase y Riposta preservados.
- No se cambian assets, HP base, economía ni progresión.

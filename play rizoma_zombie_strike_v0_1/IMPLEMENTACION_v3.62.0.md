# RIZOMA ZOMBIE STRIKE v3.62.0 — STRATEGIC MEMORY + INTENT FATIGUE

## Objetivo
Dar continuidad a Guardian Combat Persona + Intent Chains evitando repeticiones estratégicas, bucles de follow-up y firmas previsibles. La mejora actúa sobre selección y memoria táctica; no aumenta HP, daño ni cantidad base de amenazas.

## Implementaciones

### 1. Memoria estratégica del Guardián
- Se incorpora `ensureBossPersonaMemory()` con memoria de intenciones, firmas y cadenas recientes.
- La memoria se conserva durante el combate y se atenúa progresivamente.
- Las intenciones recientes quedan registradas durante una ventana corta para reducir repeticiones mecánicas.

### 2. Fatiga de intención
- FIRMA, CERCO y ENLACE acumulan fatiga al ejecutarse o expirar.
- La fatiga reduce temporalmente su peso de selección, sin prohibir ninguna táctica.
- Dos o más repeticiones recientes aplican penalización adicional a la selección.

### 3. Fatiga de firma
- Cruz, Hélice, Pinza y Caza mantienen fatiga independiente.
- La selección favorece firmas propias de la personalidad, pero evita repetir inmediatamente la misma solución.
- La preferencia signature original se conserva mediante el peso de aparición del perfil.

### 4. Diversificación de cadenas
- Las cadenas Persona (p. ej. Firma→Cerco) acumulan fatiga.
- Si una cadena se repite demasiado, el sistema busca una alternativa compatible con menor fatiga.
- El Árbitro Táctico sigue validando la acción final.

### 5. Tesis de fase
- En cada transición a Fase 2–4 se genera una TESIS estratégica inicial.
- F2 tiende a CAZA/ENLACE; F3 a CERCO; F4 a FIRMA, moduladas por la personalidad real del boss.
- La memoria previa no se borra: se conserva aproximadamente al 55–62% para que exista continuidad entre fases.
- El HUD muestra `TESIS FIRMA/CERCO/ENLACE` solo cuando no hay estados tácticos de mayor prioridad.

### 6. Telemetría
Se agregan: `personaFatigueAvoids`, `personaExpiredIntents`, `personaPhaseTheses`, `personaChainDiversions`.

## Conservación
- 20 mundos exactos.
- Curva base de HP intacta.
- Assets intactos.
- Patrones base de disparo, especiales, movimiento, Adaptive Director y resurrección preservados.

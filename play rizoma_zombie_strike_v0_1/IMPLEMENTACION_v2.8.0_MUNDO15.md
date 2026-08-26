# Rizoma Zombie Strike v2.8.0 — Mundo 15

## Entrañas del Gusano Colosal

Base de trabajo: v2.7.1. Se preservan M1–M14 y se añade únicamente M15 como siguiente mundo canónico.

### Guardián
- Vermidrax · Gusano Primordial.
- Cuatro fases de combate.
- Reducción progresiva de escala al perder segmentos.
- Aumento de movilidad y presión por fase.
- Ataques con ácido, bilis, parásitos y contracciones internas.
- Firma: Peristalsis Devastadora.

### Cinco actos
1. Puerta Vascular.
2. Nido Parasitario.
3. Laberinto Inmunitario.
4. Conducto Peristáltico.
5. Cámara de la Boca Primordial.

### Familias
- Parásitos: Larva Hemática / Garrapata Abisal.
- Defensas internas: Macrófago Mutante / Fagocito Blindado.
- Tejido: Espora Ácida / Nódulo Mordedor.
- Subjefes: Reina Parasitaria / Centinela Inmunitario / Esfínter Acorazado.

### Sistema frontal M15
El director pseudo-3D de v2.7.1 se extiende a M15 con identidad orgánica: masa de tejido, quiste nutritivo, parásito frontal y centinela inmunitario. Mantiene profundidad `z`, crecimiento no lineal, telegraph, near miss, disparos, colisión únicamente cerca de cámara y transición de determinadas unidades al plano 2D.

### Recompensas
- Poder: Peristalsis Devastadora.
- Reliquia: Núcleo Peristáltico.
- Nave capturable: Vermis Carapace.
- La Vermis Carapace reutiliza el casco mecánico limpio del Fénix RZ-1 y añade una carapaza viva procedural; no utiliza el sprite compuesto defectuoso detectado durante QA.

### Narrativa
M14 conduce a M15 tras el colapso de Heliovorax. La derrota de Vermidrax revela la señal de M16, Imperio de los Cerebros Asesinos, sin implementarlo prematuramente.

### QA
- `node --check js/game.js`: OK.
- `manifest.json`: OK.
- 394 referencias de assets: 0 faltantes.
- 22 recursos visuales requeridos de M15: completos.
- 386 assets heredados de v2.7.1: byte por byte intactos.
- Chromium/Playwright: intento realizado, bloqueado por política del entorno (`ERR_BLOCKED_BY_ADMINISTRATOR`), por lo cual no se declara una prueba interactiva que no pudo ejecutarse.

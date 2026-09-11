# Informe técnico — v0.5.2

## Implementaciones
1. **Micro-Swarm Director**
   - Activo desde oleada 2.
   - Se dispara cuando la formación cae por debajo del umbral configurado.
   - Entre 3–5 unidades en móvil y 4–7 en escritorio.
   - Máximo 1–2 ráfagas según la oleada.
   - Se usan familias visuales actuales del mundo cuando existen.

2. **Boss Fortress Modules**
   - Módulos orbitales independientes con HP propio.
   - Escalado por sector: 2/2/3/3/3.
   - Destrucción de todos los módulos reduce la Fortaleza y bloquea su regeneración.
   - Recompensa táctica: ventana de núcleo abierto más larga cuando corresponde.
   - Resurrecciones avanzadas pueden reconstruir un módulo.

## Validación
- Sintaxis JS: OK.
- Runtime smoke: OK.
- Responsive smoke: OK.
- Boss transition regression: OK.
- Boss watchdog: OK.
- Asteroid Director: OK.
- Boss Fortress: OK.
- Combat Depth v0.5.2: OK.
- Suite completa de tests del proyecto: PASS.

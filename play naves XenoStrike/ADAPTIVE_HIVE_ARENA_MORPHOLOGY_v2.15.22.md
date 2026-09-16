# Adaptive Hive Boss Director — Arena Morphology Pilot v2.15.22

## Propósito
La arena deja de ser un fondo pasivo y se convierte, durante eventos acotados, en una extensión legible de la identidad del boss. La capa no aumenta HP, daño, cadencia ni densidad de proyectiles. Reorganiza el hazard de arena ya presupuestado y preserva siempre un corredor seguro.

## Elegibilidad
Solo campaign, mundos 11–20, fase 2+, A2/A3, confianza del Director >= 0.72, lectura espacial confiable y fuera de Boss Rush, Last Chance, entrada/transición de fase o ataques bloqueados. BURST_SPIKE queda excluido.

## Fairness contract
- Telegraph: 0.88 s.
- Cuatro bandas espaciales legibles.
- Una banda se conserva como corredor seguro.
- El corredor se elige cerca de la posición/predicción reciente del jugador y como máximo puede desplazarse una banda por identidad.
- No añade proyectiles por encima del hazard equivalente.
- No añade obstáculos por encima del hazard equivalente.
- No altera stats del boss o del jugador.

## Identidades
- KHEPRI — GRAVITY_CORRIDOR
- VESPERA — LANCER_RUNWAY
- REGENT — MANDIBLE_GATE
- PYROLUX — BEACON_ARC
- CAUSTIC — CAUSTIC_CROSSFLOW
- ATLAS — VEIL_PASSAGE
- MIRAGE — MIRROR_GAP
- PIT — AMBUSH_CHANNEL
- AURICULUS — PRISMATIC_RUNWAY
- APIS — ROYAL_CELL

## Telemetría
Persistencia local schema 4. Registra world, boss, phase, motif, safeIndex, safeY, lectura espacial y estado del Director. No se envían datos externamente.

## Próxima evolución segura
Antes de activar reactive armor o resurrection, conviene estudiar telemetría real de Arena Morphology y, posteriormente, añadir microvariaciones ambientales puramente cinemáticas o de navegación, manteniendo un presupuesto de amenaza fijo.

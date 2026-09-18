# Adaptive Hive Rhythm Forecasting — v2.15.29

This pass refines timing and coordination rather than adding offensive power.

## Phase rhythm forecast
The orchestrator classifies the current phase moment as ENTRY, BUILD, CLIMAX or EXIT_RISK. Major interventions are withheld during the opening rhythm, and long interventions are deferred when the next phase is likely to arrive within approximately 3.2 seconds unless a native phase gate already protects the transition. Signature Priority remains available to satisfy genuine signature debt.

## Cross-family fatigue
Interventions are grouped into SPECTACLE, SPATIAL, ADAPTIVE and SEQUENCE families. Fatigue decays continuously and partially carries across phase transitions, preventing different systems with similar perceptual weight from alternating too aggressively. A nested FEINT_BRANCH remains exempt inside its parent MICRO_SEQUENCE.

## Smoothed contextual utility
Context utility uses an EMA (alpha 0.42) instead of reacting to every small sample fluctuation. A 250 ms context cache prevents duplicate spatial/experience calculations when permit + commit evaluate the same intervention in the same moment.

## Reservation coalescing
Repeated reservations of the same intervention and phase are merged/extended instead of creating duplicate reservation entries.

## Fairness and performance
No HP, damage, cadence, projectile density, powers, ranks or build state are increased or mutated. Reactive Armor, Symbiotic Assist, RIFT Disruption, RIFT Rebirth and extra soft gates remain inactive. Existing FULL/BALANCED/RECOVERY sampling is preserved.

## Debug hooks
- `window.__SWARM_HIVE_RHYTHM_FORECAST_SELFTEST()`
- `window.__SWARM_HIVE_STABILITY_COORDINATOR_SELFTEST()`
- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_V21529_STATUS()`

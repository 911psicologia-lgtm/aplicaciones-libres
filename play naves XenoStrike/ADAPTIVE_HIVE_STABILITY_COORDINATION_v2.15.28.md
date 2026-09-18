# Adaptive Hive Stability Coordination — v2.15.28

This pass is a coordination refinement, not a new offensive layer.

## Predictive reservations
Perceptible interventions reserve a short expected occupancy window. The conflict matrix can defer an incompatible layer before it begins. A FEINT_BRANCH is hierarchically compatible with its parent MICRO_SEQUENCE.

## Pressure recovery envelope
Every committed intervention adds bounded perceptual pressure. Pressure decays continuously, faster while the fight is healthy (A1). Major interventions are withheld above the pressure gate, and quiet windows grow modestly with current pressure.

## Phase salience
Phase budgets now track both intervention count and cumulative salience. Phase 2 is intentionally restrained; phase 3 retains the previous maximum envelope. A phase transition invalidates old reservations and creates a brief recovery window.

## Performance and fairness
Existing FULL/BALANCED/RECOVERY sampling remains. Arena Morphology and Feint Branching are still deferred first during RECOVERY. No new damage, HP, cadence, projectile count, player-build mutation or hidden tracking is introduced.

## Debug hooks
- `window.__SWARM_HIVE_STABILITY_COORDINATOR_SELFTEST()`
- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_V21528_STATUS()`

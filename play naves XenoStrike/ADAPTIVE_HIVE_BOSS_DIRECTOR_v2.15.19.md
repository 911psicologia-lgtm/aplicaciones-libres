# ADAPTIVE HIVE BOSS DIRECTOR — SHADOW MODE

## Scope
Version **2.15.19** adds an observational Adaptive Hive Boss Director without changing live combat balance. It measures the real fight, classifies the player/build as A0–A3, computes responses that *would* be considered later, and persists bounded telemetry only in `localStorage`. It does not transmit telemetry and does not add HUD clutter.

## Sampling and DPS
The Director samples once per second. Damage is accumulated in fixed one-second circular buckets; no per-hit growing arrays are created. Effective boss DPS uses a smoothed **20-second rolling window**, inside the requested 15–25 s range. The measurement is based on actual damage that survived the existing boss defenses/gates: the hook records the HP delta after the current `damageEntity()` logic. Pre-boss DPS uses the same accumulator for recent field damage.

## Power index
The power index uses real runtime information already present in the engine: observed DPS versus expected DPS for the current boss target window, active powers, actual power ranks, active combos, Hangar doctrine, permanent upgrades, stock progression, simultaneous player projectiles, support count, RIFT ALLY presence, weapon boost, RIFT APEX, Fusion Surge, HP/shield state, and the engine's current damage/rate/combat multipliers. The current weighting is 75% observed DPS ratio + 25% build signal once observed DPS exists; before observation, the real build signal is used alone. There is no separate reliable accuracy or critical-chance statistic in the current engine, so v2.15.19 deliberately does **not invent** either metric.

## TTK
Current remaining TTK is calculated as:

`TTK_remaining = max(0, boss.hp) / effectiveBossDPS`

For stable classification, the Director also uses projected total fight time:

`TTK_projected_total = elapsedBossFight + TTK_remaining`

This prevents every healthy boss from being falsely classified as A3 merely because little HP remains near the natural end of a long fight. `ttkReal` is finalized at the lethal impact, before the existing death/aftermath animation, so spectacle time is not misreported as combat time.

## Target windows
- Early (worlds 1–5): 45–75 s
- Mid (worlds 6–10): 55–90 s
- Advanced (worlds 11–19): 70–110 s
- Final (world 20): 90–130 s

A 50% boss checkpoint scales the target window to the actual starting HP fraction; it does not compare a half-fight with a full-fight target.

## Adaptive states
- **A0 — Assistance:** materially low DPS / very long projected TTK, or a clearly weak initial build signal. Shadow proposal: at most one contextual resource at a time, no more than two per boss, 12 s cooldown. It prefers shield/repair for low survival and damage/rate support for low offense.
- **A1 — Balance:** healthy range. Proposal is exactly `NONE`; no intervention.
- **A2 — Overpower:** high DPS with projected TTK clearly below the target. Shadow proposal: 0.88 received-damage multiplier for 4 s, moderate signature priority, defensive mobility, existing tactical summons only, brief 0.65 s soft gate when phase-skip risk exists.
- **A3 — Domination:** extreme annihilation. Shadow proposal: 0.78 received-damage multiplier, or 0.70 only for the most extreme remaining TTK, 5 s duration, high signature priority, 0.9 s soft gate candidate, and advanced-world disruption/rebirth candidates.

State changes require **3 consecutive samples**, at least **4 s** in the current state, and a **3 s cooldown** after a transition. This prevents A1↔A2 oscillation from momentary spikes.

## Prepared but inactive responses
All objects below carry `wouldApply:false` and do not mutate gameplay in v2.15.19.

- Reactive armor / moderate received-damage reduction.
- Signature prioritization and defensive mobility.
- Existing tactical summons only; no invented assets.
- Brief soft phase gates when a real phase-skip risk is detected.
- **RIFT DISRUPTION** candidate from world 11 in A3: 3.5 s, telegraph required, dodgeable candidate, icons preserved, build not mutated, exact prior state required on restore.
- **RIFT REBIRTH** candidate only for an extreme <25 s advanced/final kill: maximum once per boss; 40% proposed return HP, 50% for world 20; a future active version must change locomotion, pattern, signature priority and aggression rather than repeat the dead phase.

## Local telemetry
Key: `swarm_rift_hive_telemetry_v21519`. Maximum: **40 boss fights**. Old entries are trimmed locally. Each record includes world, boss, timestamp, non-identifying local session id, run mode/difficulty, pre/during DPS, initial/max power index, initial/min/projected/real TTK, initial/max adaptive state, transitions, proposed A0 help, armor proposals with phase/time/duration, maximum proposed reduction, disruption proposals, soft-gate proposals, rebirth proposal, damage to player, actual damage received by boss, phases reached, signatures executed, build snapshots and result. No Director code path calls `fetch`, XHR, beacon or WebSocket.

## Development hooks
- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_HIVE_DIRECTOR_SELFTEST()`
- `window.__SWARM_HIVE_TELEMETRY_SUMMARY()`
- `window.__SWARM_V21519_STATUS()`

## What v2.15.19 intentionally does not change
Boss HP, incoming damage, player powers, ranks, doctrines, patterns, locomotion, drops, phases, phase gates already present in v2.15.18, boss resurrection, resource spawning and HUD are not changed by the Adaptive Hive Director. The existing game still decides every live combat outcome.

## Safe next step
Use real local telemetry from several builds and bosses to inspect false positives/negatives. If A2/A3 separation is stable, activate only **one reversible intervention first** (recommended: short reactive armor at A3 only, with strict cap and cooldown), behind a runtime flag. Keep suppression, rebirth and extra soft gates in Shadow Mode until their trigger rates and fairness are independently validated.

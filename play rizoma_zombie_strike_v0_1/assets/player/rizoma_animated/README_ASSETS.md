# RIZOMA ZOMBIE STRIKE — Rizoma Ships Animated Assets v1.0

## Package Overview

This package contains the complete animated asset set for the **6 Rizoma ships**
of *Rizoma Zombie Strike* (target game version `v3.16.0+`).

The ships share a single bio-tech DNA — metallic/ceramic surfaces, electric-blue
or ship-themed engine plasma, energy cores, hardpoint markers — but each one has
a unique silhouette designed for instant recognition at mobile sprite sizes
(~64-90 px on screen).

## Ships Included

| ID  | Name             | Unlock      | Role                          |
|-----|------------------|-------------|-------------------------------|
| rz1 | Fénix RZ-1       | Start       | All-round interceptor         |
| rz4 | Mantis RZ-4      | World 4     | Precision / interceptor       |
| rz8 | Nébula RZ-8      | World 8     | Area control / drones         |
| rz12| Bastión RZ-12    | World 12    | Defense / absorption          |
| rz16| Hydra RZ-16      | World 16    | Offensive saturation          |
| rz20| Rizoma Prime RZ-20 | World 20  | Master ship / synthesis       |

## Folder Structure

```
rizoma_ship_assets/
├── README_ASSETS.md            (this file)
├── asset_manifest.json         (full file inventory)
├── contact_sheet.webp          (1920×1080 visual reference)
├── QA_REPORT.txt               (validation report)
│
├── rz1_fenix/
│   ├── runtime/                (ship_base.png, ship_bank_left.png, ship_bank_right.png, ship_meta.json)
│   ├── animation/              (engine_01-06, fire_01-04, hit_01-04, shield_01-06, special_01-08)
│   ├── vfx/                    (trident_charge_01-04, trident_beam_01-06)
│   └── hangar/                 (hangar_hero.webp, hangar_thumb.webp, hangar_card.webp)
│
├── rz4_mantis/                 (same structure)
├── rz8_nebula/                 (+ drones/ subfolder)
├── rz12_bastion/               (same structure)
├── rz16_hydra/                 (same structure)
└── rz20_prime/                 (same structure)
```

## Asset Specifications

### Runtime

- **ship_base.png** — 512×512 RGBA, transparent. Top-down view, nose up.
  Hull only — no engine flame (engine flame lives in `animation/engine_*`).
- **ship_bank_left.png / ship_bank_right.png** — 512×512 RGBA. Same ship
  sheared horizontally to suggest a banking roll.
- **ship_meta.json** — Integration metadata. All coordinates normalized 0-1.

### Animation

All animation frames are 512×512 RGBA, transparent, **designed to be layered
on top of `ship_base.png`**. The hull itself is not redrawn in animation frames
(keeps the silhouette stable; only the effect changes).

| Animation | Frames | Purpose |
|-----------|--------|---------|
| `engine_NN` | 6 | Looping engine emission (varying length + pulse) |
| `fire_NN`   | 4 | Charge → exit → peak → dissipate |
| `hit_NN`    | 4 | Sparks + micro-arcs on hull (no permanent damage) |
| `shield_NN` | 6 | Hex-pattern shield arc around ship |
| `special_NN`| 8 | Ship-specific special-ability effect |

### VFX

Independent overlays (512×512 RGBA, transparent) for ship-specific special
abilities. See `asset_manifest.json` for the full frame list per ship.

### Drones (Nébula only)

- `nebula_drone_left.png` / `nebula_drone_right.png` — 256×256 RGBA
- `drone_engine_01-04.png` — 4-frame engine loop, 256×256 RGBA

### Hangar

- `hangar_hero.webp` — 1280×720 cinematic hangar scene
- `hangar_thumb.webp` — 512×512 thumbnail with discreet background
- `hangar_card.webp` — 640×360 horizontal card (no text)

## Integration Notes

- Anchor for all ships: `(x=0.5, y=0.52)` in normalized coordinates.
- Suggested hitbox scale: `0.44` of visual size (notably smaller than the
  visible silhouette, for fair arcade gameplay).
- Engine emitter positions, weapon hardpoints, and special-ability origins
  are listed in `ship_meta.json` per ship — all normalized.
- Animation frames MUST be composited on top of `ship_base.png` (or the
  current banked variant). They are not standalone.

## Visual Coherence

All 6 ships are rendered with the same material/lighting model:
- Horizontal metallic gradient (light center, darker edges)
- Top-light bevel on every polygon
- Energy-core glow per ship palette
- Stroke + panel-line detailing
- Consistent 3/4 perspective from top-down

This ensures the family reads as a single civilization's tech tree while
remaining instantly distinguishable in silhouette.

## File Formats & Optimization

- **PNG** for all transparent runtime/animation/VFX/drone assets.
- **WebP** (quality 88-92) for hangar art and contact sheet (opaque scenes).
- Total package size targets the 25-45 MB range.

## Quality Assurance

See `QA_REPORT.txt` for full PASS/FAIL validation of every file.

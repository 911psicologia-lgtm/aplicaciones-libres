window.SF = window.SF || {};
window.SF.worldContent = {
  "version": "runtime_w01_05_realistic_v2",
  "worlds": [
    {
      "id": 1,
      "label": "Mundo 01",
      "sectorName": "Nebulosa Roja",
      "familyTheme": "Familia inspirada en Xenomorfo Escarlata",
      "bossName": "Xenomorfo Escarlata",
      "carryover": [],
      "minions": {
        "swarmer": {
          "base": "assets/runtime_w01_05/world_01/minions/world_01_minion_swarmer.png",
          "elite": "assets/runtime_w01_05/world_01/minions/world_01_minion_swarmer_elite.png",
          "sheet": "assets/runtime_w01_05/world_01/minions/world_01_minion_swarmer_sheet.png",
          "frames": 6
        },
        "stinger": {
          "base": "assets/runtime_w01_05/world_01/minions/world_01_minion_stinger.png",
          "elite": "assets/runtime_w01_05/world_01/minions/world_01_minion_stinger_elite.png",
          "sheet": "assets/runtime_w01_05/world_01/minions/world_01_minion_stinger_sheet.png",
          "frames": 6
        },
        "hunter": {
          "base": "assets/runtime_w01_05/world_01/minions/world_01_minion_hunter.png",
          "elite": "assets/runtime_w01_05/world_01/minions/world_01_minion_hunter_elite.png",
          "sheet": "assets/runtime_w01_05/world_01/minions/world_01_minion_hunter_sheet.png",
          "frames": 6
        },
        "sentinel": {
          "base": "assets/runtime_w01_05/world_01/minions/world_01_minion_sentinel.png",
          "elite": "assets/runtime_w01_05/world_01/minions/world_01_minion_sentinel_elite.png",
          "sheet": "assets/runtime_w01_05/world_01/minions/world_01_minion_sentinel_sheet.png",
          "frames": 6
        },
        "spitter": {
          "base": "assets/runtime_w01_05/world_01/minions/world_01_minion_spitter.png",
          "elite": "assets/runtime_w01_05/world_01/minions/world_01_minion_spitter_elite.png",
          "sheet": "assets/runtime_w01_05/world_01/minions/world_01_minion_spitter_sheet.png",
          "frames": 6
        },
        "phantom_revenant": {
          "base": "assets/runtime_w01_05/world_01/minions/world_01_minion_phantom_revenant.png",
          "elite": "assets/runtime_w01_05/world_01/minions/world_01_minion_phantom_revenant_elite.png",
          "sheet": "assets/runtime_w01_05/world_01/minions/world_01_minion_phantom_revenant_sheet.png",
          "frames": 6
        }
      },
      "subbosses": [
        {
          "id": "a",
          "base": "assets/runtime_w01_05/world_01/subbosses/world_01_subboss_a.png",
          "sheet": "assets/runtime_w01_05/world_01/subbosses/world_01_subboss_a_sheet.png",
          "frames": 8
        },
        {
          "id": "b",
          "base": "assets/runtime_w01_05/world_01/subbosses/world_01_subboss_b.png",
          "sheet": "assets/runtime_w01_05/world_01/subbosses/world_01_subboss_b_sheet.png",
          "frames": 8
        }
      ],
      "boss": {
        "name": "Xenomorfo Escarlata",
        "base": "assets/runtime_w01_05/world_01/boss/world_01_boss_xenomorfo_escarlata.png",
        "phasesSheet": "assets/runtime_w01_05/world_01/boss/world_01_boss_xenomorfo_escarlata_phases_sheet.png",
        "phaseFrames": 6,
        "openCore": "assets/runtime_w01_05/world_01/boss/world_01_boss_xenomorfo_escarlata_open_core.png",
        "deathSheet": "assets/runtime_w01_05/world_01/boss/world_01_boss_xenomorfo_escarlata_death_sheet.png",
        "deathFrames": 8,
        "relicSheet": "assets/runtime_w01_05/world_01/boss/world_01_boss_xenomorfo_escarlata_relic_sheet.png",
        "relicFrames": 3,
        "phases": 3,
        "canRevive": false
      },
      "projectiles": [
        {
          "sheet": "assets/runtime_w01_05/world_01/projectiles/world_01_projectile_01_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_01/projectiles/world_01_projectile_02_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_01/projectiles/world_01_projectile_03_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_01/projectiles/world_01_projectile_04_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_01/projectiles/world_01_projectile_05_sheet.png",
          "frames": 6
        }
      ],
      "powerups": {
        "burst": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_burst.png",
        "laser": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_laser.png",
        "missile": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_missile.png",
        "shield": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_shield.png",
        "drone": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_drone.png",
        "emp": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_emp.png",
        "magnet": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_magnet.png",
        "repair": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_repair.png",
        "overshield": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_overshield.png",
        "multiplier": "assets/runtime_w01_05/world_01/powerups/world_01_powerup_multiplier.png"
      },
      "obstacles": [
        {
          "source": "meteoro giratorio",
          "path": "assets/runtime_w01_05/world_01/obstacles/world_01_obstacle_01_meteoro_giratorio.png"
        },
        {
          "source": "roca defensora fracturada",
          "path": "assets/runtime_w01_05/world_01/obstacles/world_01_obstacle_02_roca_defensora_fracturada.png"
        },
        {
          "source": "microasteroide lento",
          "path": "assets/runtime_w01_05/world_01/obstacles/world_01_obstacle_03_microasteroide_lento.png"
        }
      ],
      "backgrounds": {
        "base": "assets/runtime_w01_05/world_01/backgrounds/world_01_background_base.png",
        "intense": "assets/runtime_w01_05/world_01/backgrounds/world_01_background_intense.png",
        "boss": "assets/runtime_w01_05/world_01/backgrounds/world_01_background_boss.png"
      }
    },
    {
      "id": 2,
      "label": "Mundo 02",
      "sectorName": "Anillo de Titanio",
      "familyTheme": "Familia inspirada en Yautja Prime",
      "bossName": "Yautja Prime",
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "minions": {
        "swarmer": {
          "base": "assets/runtime_w01_05/world_02/minions/world_02_minion_swarmer.png",
          "elite": "assets/runtime_w01_05/world_02/minions/world_02_minion_swarmer_elite.png",
          "sheet": "assets/runtime_w01_05/world_02/minions/world_02_minion_swarmer_sheet.png",
          "frames": 6
        },
        "stinger": {
          "base": "assets/runtime_w01_05/world_02/minions/world_02_minion_stinger.png",
          "elite": "assets/runtime_w01_05/world_02/minions/world_02_minion_stinger_elite.png",
          "sheet": "assets/runtime_w01_05/world_02/minions/world_02_minion_stinger_sheet.png",
          "frames": 6
        },
        "hunter": {
          "base": "assets/runtime_w01_05/world_02/minions/world_02_minion_hunter.png",
          "elite": "assets/runtime_w01_05/world_02/minions/world_02_minion_hunter_elite.png",
          "sheet": "assets/runtime_w01_05/world_02/minions/world_02_minion_hunter_sheet.png",
          "frames": 6
        },
        "sentinel": {
          "base": "assets/runtime_w01_05/world_02/minions/world_02_minion_sentinel.png",
          "elite": "assets/runtime_w01_05/world_02/minions/world_02_minion_sentinel_elite.png",
          "sheet": "assets/runtime_w01_05/world_02/minions/world_02_minion_sentinel_sheet.png",
          "frames": 6
        },
        "spitter": {
          "base": "assets/runtime_w01_05/world_02/minions/world_02_minion_spitter.png",
          "elite": "assets/runtime_w01_05/world_02/minions/world_02_minion_spitter_elite.png",
          "sheet": "assets/runtime_w01_05/world_02/minions/world_02_minion_spitter_sheet.png",
          "frames": 6
        },
        "phantom_revenant": {
          "base": "assets/runtime_w01_05/world_02/minions/world_02_minion_phantom_revenant.png",
          "elite": "assets/runtime_w01_05/world_02/minions/world_02_minion_phantom_revenant_elite.png",
          "sheet": "assets/runtime_w01_05/world_02/minions/world_02_minion_phantom_revenant_sheet.png",
          "frames": 6
        }
      },
      "subbosses": [
        {
          "id": "a",
          "base": "assets/runtime_w01_05/world_02/subbosses/world_02_subboss_a.png",
          "sheet": "assets/runtime_w01_05/world_02/subbosses/world_02_subboss_a_sheet.png",
          "frames": 8
        },
        {
          "id": "b",
          "base": "assets/runtime_w01_05/world_02/subbosses/world_02_subboss_b.png",
          "sheet": "assets/runtime_w01_05/world_02/subbosses/world_02_subboss_b_sheet.png",
          "frames": 8
        }
      ],
      "boss": {
        "name": "Yautja Prime",
        "base": "assets/runtime_w01_05/world_02/boss/world_02_boss_yautja_prime.png",
        "phasesSheet": "assets/runtime_w01_05/world_02/boss/world_02_boss_yautja_prime_phases_sheet.png",
        "phaseFrames": 6,
        "openCore": "assets/runtime_w01_05/world_02/boss/world_02_boss_yautja_prime_open_core.png",
        "deathSheet": "assets/runtime_w01_05/world_02/boss/world_02_boss_yautja_prime_death_sheet.png",
        "deathFrames": 8,
        "relicSheet": "assets/runtime_w01_05/world_02/boss/world_02_boss_yautja_prime_relic_sheet.png",
        "relicFrames": 3,
        "phases": 3,
        "canRevive": false
      },
      "projectiles": [
        {
          "sheet": "assets/runtime_w01_05/world_02/projectiles/world_02_projectile_01_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_02/projectiles/world_02_projectile_02_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_02/projectiles/world_02_projectile_03_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_02/projectiles/world_02_projectile_04_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_02/projectiles/world_02_projectile_05_sheet.png",
          "frames": 6
        }
      ],
      "powerups": {
        "burst": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_burst.png",
        "laser": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_laser.png",
        "missile": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_missile.png",
        "shield": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_shield.png",
        "drone": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_drone.png",
        "emp": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_emp.png",
        "magnet": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_magnet.png",
        "repair": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_repair.png",
        "overshield": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_overshield.png",
        "multiplier": "assets/runtime_w01_05/world_02/powerups/world_02_powerup_multiplier.png"
      },
      "obstacles": [
        {
          "source": "basura espacial humana",
          "path": "assets/runtime_w01_05/world_02/obstacles/world_02_obstacle_01_basura_espacial_humana.png"
        },
        {
          "source": "fragmento de satélite",
          "path": "assets/runtime_w01_05/world_02/obstacles/world_02_obstacle_02_fragmento_de_satelite.png"
        },
        {
          "source": "placa de casco",
          "path": "assets/runtime_w01_05/world_02/obstacles/world_02_obstacle_03_placa_de_casco.png"
        }
      ],
      "backgrounds": {
        "base": "assets/runtime_w01_05/world_02/backgrounds/world_02_background_base.png",
        "intense": "assets/runtime_w01_05/world_02/backgrounds/world_02_background_intense.png",
        "boss": "assets/runtime_w01_05/world_02/backgrounds/world_02_background_boss.png"
      }
    },
    {
      "id": 3,
      "label": "Mundo 03",
      "sectorName": "Vacío Bioluminiscente",
      "familyTheme": "Familia inspirada en Nébula Sintética",
      "bossName": "Nébula Sintética",
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "minions": {
        "swarmer": {
          "base": "assets/runtime_w01_05/world_03/minions/world_03_minion_swarmer.png",
          "elite": "assets/runtime_w01_05/world_03/minions/world_03_minion_swarmer_elite.png",
          "sheet": "assets/runtime_w01_05/world_03/minions/world_03_minion_swarmer_sheet.png",
          "frames": 6
        },
        "stinger": {
          "base": "assets/runtime_w01_05/world_03/minions/world_03_minion_stinger.png",
          "elite": "assets/runtime_w01_05/world_03/minions/world_03_minion_stinger_elite.png",
          "sheet": "assets/runtime_w01_05/world_03/minions/world_03_minion_stinger_sheet.png",
          "frames": 6
        },
        "hunter": {
          "base": "assets/runtime_w01_05/world_03/minions/world_03_minion_hunter.png",
          "elite": "assets/runtime_w01_05/world_03/minions/world_03_minion_hunter_elite.png",
          "sheet": "assets/runtime_w01_05/world_03/minions/world_03_minion_hunter_sheet.png",
          "frames": 6
        },
        "sentinel": {
          "base": "assets/runtime_w01_05/world_03/minions/world_03_minion_sentinel.png",
          "elite": "assets/runtime_w01_05/world_03/minions/world_03_minion_sentinel_elite.png",
          "sheet": "assets/runtime_w01_05/world_03/minions/world_03_minion_sentinel_sheet.png",
          "frames": 6
        },
        "spitter": {
          "base": "assets/runtime_w01_05/world_03/minions/world_03_minion_spitter.png",
          "elite": "assets/runtime_w01_05/world_03/minions/world_03_minion_spitter_elite.png",
          "sheet": "assets/runtime_w01_05/world_03/minions/world_03_minion_spitter_sheet.png",
          "frames": 6
        },
        "phantom_revenant": {
          "base": "assets/runtime_w01_05/world_03/minions/world_03_minion_phantom_revenant.png",
          "elite": "assets/runtime_w01_05/world_03/minions/world_03_minion_phantom_revenant_elite.png",
          "sheet": "assets/runtime_w01_05/world_03/minions/world_03_minion_phantom_revenant_sheet.png",
          "frames": 6
        }
      },
      "subbosses": [
        {
          "id": "a",
          "base": "assets/runtime_w01_05/world_03/subbosses/world_03_subboss_a.png",
          "sheet": "assets/runtime_w01_05/world_03/subbosses/world_03_subboss_a_sheet.png",
          "frames": 8
        },
        {
          "id": "b",
          "base": "assets/runtime_w01_05/world_03/subbosses/world_03_subboss_b.png",
          "sheet": "assets/runtime_w01_05/world_03/subbosses/world_03_subboss_b_sheet.png",
          "frames": 8
        }
      ],
      "boss": {
        "name": "Nébula Sintética",
        "base": "assets/runtime_w01_05/world_03/boss/world_03_boss_nebula_sintetica.png",
        "phasesSheet": "assets/runtime_w01_05/world_03/boss/world_03_boss_nebula_sintetica_phases_sheet.png",
        "phaseFrames": 6,
        "openCore": "assets/runtime_w01_05/world_03/boss/world_03_boss_nebula_sintetica_open_core.png",
        "deathSheet": "assets/runtime_w01_05/world_03/boss/world_03_boss_nebula_sintetica_death_sheet.png",
        "deathFrames": 8,
        "relicSheet": "assets/runtime_w01_05/world_03/boss/world_03_boss_nebula_sintetica_relic_sheet.png",
        "relicFrames": 3,
        "phases": 3,
        "canRevive": false
      },
      "projectiles": [
        {
          "sheet": "assets/runtime_w01_05/world_03/projectiles/world_03_projectile_01_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_03/projectiles/world_03_projectile_02_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_03/projectiles/world_03_projectile_03_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_03/projectiles/world_03_projectile_04_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_03/projectiles/world_03_projectile_05_sheet.png",
          "frames": 6
        }
      ],
      "powerups": {
        "burst": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_burst.png",
        "laser": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_laser.png",
        "missile": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_missile.png",
        "shield": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_shield.png",
        "drone": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_drone.png",
        "emp": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_emp.png",
        "magnet": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_magnet.png",
        "repair": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_repair.png",
        "overshield": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_overshield.png",
        "multiplier": "assets/runtime_w01_05/world_03/powerups/world_03_powerup_multiplier.png"
      },
      "obstacles": [
        {
          "source": "restos alienígenas orgánicos",
          "path": "assets/runtime_w01_05/world_03/obstacles/world_03_obstacle_01_restos_alienigenas_organicos.png"
        },
        {
          "source": "espina flotante",
          "path": "assets/runtime_w01_05/world_03/obstacles/world_03_obstacle_02_espina_flotante.png"
        },
        {
          "source": "cápsula biotecnológica",
          "path": "assets/runtime_w01_05/world_03/obstacles/world_03_obstacle_03_capsula_biotecnologica.png"
        }
      ],
      "backgrounds": {
        "base": "assets/runtime_w01_05/world_03/backgrounds/world_03_background_base.png",
        "intense": "assets/runtime_w01_05/world_03/backgrounds/world_03_background_intense.png",
        "boss": "assets/runtime_w01_05/world_03/backgrounds/world_03_background_boss.png"
      }
    },
    {
      "id": 4,
      "label": "Mundo 04",
      "sectorName": "Cinturón Abisal",
      "familyTheme": "Familia inspirada en Arachnid Matriarca",
      "bossName": "Arachnid Matriarca",
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "minions": {
        "swarmer": {
          "base": "assets/runtime_w01_05/world_04/minions/world_04_minion_swarmer.png",
          "elite": "assets/runtime_w01_05/world_04/minions/world_04_minion_swarmer_elite.png",
          "sheet": "assets/runtime_w01_05/world_04/minions/world_04_minion_swarmer_sheet.png",
          "frames": 6
        },
        "stinger": {
          "base": "assets/runtime_w01_05/world_04/minions/world_04_minion_stinger.png",
          "elite": "assets/runtime_w01_05/world_04/minions/world_04_minion_stinger_elite.png",
          "sheet": "assets/runtime_w01_05/world_04/minions/world_04_minion_stinger_sheet.png",
          "frames": 6
        },
        "hunter": {
          "base": "assets/runtime_w01_05/world_04/minions/world_04_minion_hunter.png",
          "elite": "assets/runtime_w01_05/world_04/minions/world_04_minion_hunter_elite.png",
          "sheet": "assets/runtime_w01_05/world_04/minions/world_04_minion_hunter_sheet.png",
          "frames": 6
        },
        "sentinel": {
          "base": "assets/runtime_w01_05/world_04/minions/world_04_minion_sentinel.png",
          "elite": "assets/runtime_w01_05/world_04/minions/world_04_minion_sentinel_elite.png",
          "sheet": "assets/runtime_w01_05/world_04/minions/world_04_minion_sentinel_sheet.png",
          "frames": 6
        },
        "spitter": {
          "base": "assets/runtime_w01_05/world_04/minions/world_04_minion_spitter.png",
          "elite": "assets/runtime_w01_05/world_04/minions/world_04_minion_spitter_elite.png",
          "sheet": "assets/runtime_w01_05/world_04/minions/world_04_minion_spitter_sheet.png",
          "frames": 6
        },
        "phantom_revenant": {
          "base": "assets/runtime_w01_05/world_04/minions/world_04_minion_phantom_revenant.png",
          "elite": "assets/runtime_w01_05/world_04/minions/world_04_minion_phantom_revenant_elite.png",
          "sheet": "assets/runtime_w01_05/world_04/minions/world_04_minion_phantom_revenant_sheet.png",
          "frames": 6
        }
      },
      "subbosses": [
        {
          "id": "a",
          "base": "assets/runtime_w01_05/world_04/subbosses/world_04_subboss_a.png",
          "sheet": "assets/runtime_w01_05/world_04/subbosses/world_04_subboss_a_sheet.png",
          "frames": 8
        },
        {
          "id": "b",
          "base": "assets/runtime_w01_05/world_04/subbosses/world_04_subboss_b.png",
          "sheet": "assets/runtime_w01_05/world_04/subbosses/world_04_subboss_b_sheet.png",
          "frames": 8
        }
      ],
      "boss": {
        "name": "Arachnid Matriarca",
        "base": "assets/runtime_w01_05/world_04/boss/world_04_boss_arachnid_matriarca.png",
        "phasesSheet": "assets/runtime_w01_05/world_04/boss/world_04_boss_arachnid_matriarca_phases_sheet.png",
        "phaseFrames": 6,
        "openCore": "assets/runtime_w01_05/world_04/boss/world_04_boss_arachnid_matriarca_open_core.png",
        "deathSheet": "assets/runtime_w01_05/world_04/boss/world_04_boss_arachnid_matriarca_death_sheet.png",
        "deathFrames": 8,
        "relicSheet": "assets/runtime_w01_05/world_04/boss/world_04_boss_arachnid_matriarca_relic_sheet.png",
        "relicFrames": 3,
        "phases": 3,
        "canRevive": false
      },
      "projectiles": [
        {
          "sheet": "assets/runtime_w01_05/world_04/projectiles/world_04_projectile_01_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_04/projectiles/world_04_projectile_02_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_04/projectiles/world_04_projectile_03_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_04/projectiles/world_04_projectile_04_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_04/projectiles/world_04_projectile_05_sheet.png",
          "frames": 6
        }
      ],
      "powerups": {
        "burst": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_burst.png",
        "laser": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_laser.png",
        "missile": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_missile.png",
        "shield": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_shield.png",
        "drone": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_drone.png",
        "emp": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_emp.png",
        "magnet": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_magnet.png",
        "repair": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_repair.png",
        "overshield": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_overshield.png",
        "multiplier": "assets/runtime_w01_05/world_04/powerups/world_04_powerup_multiplier.png"
      },
      "obstacles": [
        {
          "source": "restos de otra civilización",
          "path": "assets/runtime_w01_05/world_04/obstacles/world_04_obstacle_01_restos_de_otra_civilizacion.png"
        },
        {
          "source": "anillo ritual roto",
          "path": "assets/runtime_w01_05/world_04/obstacles/world_04_obstacle_02_anillo_ritual_roto.png"
        },
        {
          "source": "monolito móvil",
          "path": "assets/runtime_w01_05/world_04/obstacles/world_04_obstacle_03_monolito_movil.png"
        }
      ],
      "backgrounds": {
        "base": "assets/runtime_w01_05/world_04/backgrounds/world_04_background_base.png",
        "intense": "assets/runtime_w01_05/world_04/backgrounds/world_04_background_intense.png",
        "boss": "assets/runtime_w01_05/world_04/backgrounds/world_04_background_boss.png"
      }
    },
    {
      "id": 5,
      "label": "Mundo 05",
      "sectorName": "Sector Leviatán",
      "familyTheme": "Familia inspirada en Leviathan Omega",
      "bossName": "Leviathan Omega",
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "minions": {
        "swarmer": {
          "base": "assets/runtime_w01_05/world_05/minions/world_05_minion_swarmer.png",
          "elite": "assets/runtime_w01_05/world_05/minions/world_05_minion_swarmer_elite.png",
          "sheet": "assets/runtime_w01_05/world_05/minions/world_05_minion_swarmer_sheet.png",
          "frames": 6
        },
        "stinger": {
          "base": "assets/runtime_w01_05/world_05/minions/world_05_minion_stinger.png",
          "elite": "assets/runtime_w01_05/world_05/minions/world_05_minion_stinger_elite.png",
          "sheet": "assets/runtime_w01_05/world_05/minions/world_05_minion_stinger_sheet.png",
          "frames": 6
        },
        "hunter": {
          "base": "assets/runtime_w01_05/world_05/minions/world_05_minion_hunter.png",
          "elite": "assets/runtime_w01_05/world_05/minions/world_05_minion_hunter_elite.png",
          "sheet": "assets/runtime_w01_05/world_05/minions/world_05_minion_hunter_sheet.png",
          "frames": 6
        },
        "sentinel": {
          "base": "assets/runtime_w01_05/world_05/minions/world_05_minion_sentinel.png",
          "elite": "assets/runtime_w01_05/world_05/minions/world_05_minion_sentinel_elite.png",
          "sheet": "assets/runtime_w01_05/world_05/minions/world_05_minion_sentinel_sheet.png",
          "frames": 6
        },
        "spitter": {
          "base": "assets/runtime_w01_05/world_05/minions/world_05_minion_spitter.png",
          "elite": "assets/runtime_w01_05/world_05/minions/world_05_minion_spitter_elite.png",
          "sheet": "assets/runtime_w01_05/world_05/minions/world_05_minion_spitter_sheet.png",
          "frames": 6
        },
        "phantom_revenant": {
          "base": "assets/runtime_w01_05/world_05/minions/world_05_minion_phantom_revenant.png",
          "elite": "assets/runtime_w01_05/world_05/minions/world_05_minion_phantom_revenant_elite.png",
          "sheet": "assets/runtime_w01_05/world_05/minions/world_05_minion_phantom_revenant_sheet.png",
          "frames": 6
        }
      },
      "subbosses": [
        {
          "id": "a",
          "base": "assets/runtime_w01_05/world_05/subbosses/world_05_subboss_a.png",
          "sheet": "assets/runtime_w01_05/world_05/subbosses/world_05_subboss_a_sheet.png",
          "frames": 8
        },
        {
          "id": "b",
          "base": "assets/runtime_w01_05/world_05/subbosses/world_05_subboss_b.png",
          "sheet": "assets/runtime_w01_05/world_05/subbosses/world_05_subboss_b_sheet.png",
          "frames": 8
        }
      ],
      "boss": {
        "name": "Leviathan Omega",
        "base": "assets/runtime_w01_05/world_05/boss/world_05_boss_leviathan_omega.png",
        "phasesSheet": "assets/runtime_w01_05/world_05/boss/world_05_boss_leviathan_omega_phases_sheet.png",
        "phaseFrames": 6,
        "openCore": "assets/runtime_w01_05/world_05/boss/world_05_boss_leviathan_omega_open_core.png",
        "deathSheet": "assets/runtime_w01_05/world_05/boss/world_05_boss_leviathan_omega_death_sheet.png",
        "deathFrames": 8,
        "relicSheet": "assets/runtime_w01_05/world_05/boss/world_05_boss_leviathan_omega_relic_sheet.png",
        "relicFrames": 3,
        "phases": 3,
        "canRevive": false
      },
      "projectiles": [
        {
          "sheet": "assets/runtime_w01_05/world_05/projectiles/world_05_projectile_01_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_05/projectiles/world_05_projectile_02_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_05/projectiles/world_05_projectile_03_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_05/projectiles/world_05_projectile_04_sheet.png",
          "frames": 6
        },
        {
          "sheet": "assets/runtime_w01_05/world_05/projectiles/world_05_projectile_05_sheet.png",
          "frames": 6
        }
      ],
      "powerups": {
        "burst": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_burst.png",
        "laser": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_laser.png",
        "missile": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_missile.png",
        "shield": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_shield.png",
        "drone": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_drone.png",
        "emp": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_emp.png",
        "magnet": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_magnet.png",
        "repair": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_repair.png",
        "overshield": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_overshield.png",
        "multiplier": "assets/runtime_w01_05/world_05/powerups/world_05_powerup_multiplier.png"
      },
      "obstacles": [
        {
          "source": "meteoro giratorio",
          "path": "assets/runtime_w01_05/world_05/obstacles/world_05_obstacle_01_meteoro_giratorio.png"
        },
        {
          "source": "roca defensora fracturada",
          "path": "assets/runtime_w01_05/world_05/obstacles/world_05_obstacle_02_roca_defensora_fracturada.png"
        },
        {
          "source": "microasteroide lento",
          "path": "assets/runtime_w01_05/world_05/obstacles/world_05_obstacle_03_microasteroide_lento.png"
        }
      ],
      "backgrounds": {
        "base": "assets/runtime_w01_05/world_05/backgrounds/world_05_background_base.png",
        "intense": "assets/runtime_w01_05/world_05/backgrounds/world_05_background_intense.png",
        "boss": "assets/runtime_w01_05/world_05/backgrounds/world_05_background_boss.png"
      }
    }
  ]
};

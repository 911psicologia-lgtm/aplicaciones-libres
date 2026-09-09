window.STARFALL_DATA = {
  "global": {
    "ships": {
      "vanguard": {
        "path": "assets/_global/ships/nave_vanguard.png",
        "frames": 1,
        "funcion": "Nave Vanguard (Equilibrada).",
        "uso": "Sprite del jugador; ~96-120 px; polaridad vertical (apunta arriba)."
      },
      "warden": {
        "path": "assets/_global/ships/nave_warden.png",
        "frames": 1,
        "funcion": "Nave Warden (Blindada).",
        "uso": "Sprite del jugador; ~96-120 px; polaridad vertical (apunta arriba)."
      },
      "specter": {
        "path": "assets/_global/ships/nave_specter.png",
        "frames": 1,
        "funcion": "Nave Specter (Ágil).",
        "uso": "Sprite del jugador; ~96-120 px; polaridad vertical (apunta arriba)."
      }
    },
    "powerups": {
      "rafaga": {
        "path": "assets/_global/powerups/powerup_rafaga.png",
        "frames": 1,
        "funcion": "Power-up global: rafaga.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "laser": {
        "path": "assets/_global/powerups/powerup_laser.png",
        "frames": 1,
        "funcion": "Power-up global: laser.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "misiles": {
        "path": "assets/_global/powerups/powerup_misiles.png",
        "frames": 1,
        "funcion": "Power-up global: misiles.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "escudo": {
        "path": "assets/_global/powerups/powerup_escudo.png",
        "frames": 1,
        "funcion": "Power-up global: escudo.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "dron_aliado": {
        "path": "assets/_global/powerups/powerup_dron_aliado.png",
        "frames": 1,
        "funcion": "Power-up global: dron aliado.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "emp": {
        "path": "assets/_global/powerups/powerup_emp.png",
        "frames": 1,
        "funcion": "Power-up global: emp.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "iman": {
        "path": "assets/_global/powerups/powerup_iman.png",
        "frames": 1,
        "funcion": "Power-up global: iman.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "vida": {
        "path": "assets/_global/powerups/powerup_vida.png",
        "frames": 1,
        "funcion": "Power-up global: vida.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "reparacion": {
        "path": "assets/_global/powerups/powerup_reparacion.png",
        "frames": 1,
        "funcion": "Power-up global: reparacion.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "sobrescudo": {
        "path": "assets/_global/powerups/powerup_sobrescudo.png",
        "frames": 1,
        "funcion": "Power-up global: sobrescudo.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      },
      "multiplicador": {
        "path": "assets/_global/powerups/powerup_multiplicador.png",
        "frames": 1,
        "funcion": "Power-up global: multiplicador.",
        "uso": "Ícono hexagonal con glifo; 40-56 px en pantalla."
      }
    },
    "fx": {
      "explosion_sheet": {
        "path": "assets/_global/fx/explosion_sheet.png",
        "frames": 10,
        "funcion": "Explosión genérica (10 frames).",
        "uso": "Muerte de esbirros/obstáculos; 10 fps."
      },
      "hit_spark_sheet": {
        "path": "assets/_global/fx/hit_spark_sheet.png",
        "frames": 4,
        "funcion": "Chispa de impacto (4 frames).",
        "uso": "Al golpear enemigo sin matarlo; 12 fps."
      },
      "motor_azul_sheet": {
        "path": "assets/_global/fx/motor_azul_sheet.png",
        "frames": 4,
        "funcion": "Llama de motor azul (4 frames).",
        "uso": "Anclar bajo la nave del color correspondiente; 10 fps."
      },
      "motor_verde_sheet": {
        "path": "assets/_global/fx/motor_verde_sheet.png",
        "frames": 4,
        "funcion": "Llama de motor verde (4 frames).",
        "uso": "Anclar bajo la nave del color correspondiente; 10 fps."
      },
      "motor_violeta_sheet": {
        "path": "assets/_global/fx/motor_violeta_sheet.png",
        "frames": 4,
        "funcion": "Llama de motor violeta (4 frames).",
        "uso": "Anclar bajo la nave del color correspondiente; 10 fps."
      }
    }
  },
  "worlds": [
    {
      "id": 1,
      "key": "world_01",
      "label": "Mundo 01",
      "sector": "Nebulosa Roja",
      "bossName": "Xenomorfo Escarlata",
      "family": "Familia xenomorfa esbelta y depredadora; hojas vivas, colas con aguijón, exoesqueleto scarlet.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#ff4574",
        "neon_b": "#ff7a3c",
        "core": "#ff5c7f"
      },
      "carryover": [],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_01/minions/world_01_minion_swarmer.png",
          "variant": "assets/world_01/minions/world_01_minion_swarmer_danado.png",
          "sheet": "assets/world_01/minions/world_01_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_01/minions/world_01_minion_stinger.png",
          "variant": "assets/world_01/minions/world_01_minion_stinger_elite.png",
          "sheet": "assets/world_01/minions/world_01_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_01/minions/world_01_minion_hunter.png",
          "variant": "assets/world_01/minions/world_01_minion_hunter_danado.png",
          "sheet": "assets/world_01/minions/world_01_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_01/minions/world_01_minion_sentinel.png",
          "variant": "assets/world_01/minions/world_01_minion_sentinel_elite.png",
          "sheet": "assets/world_01/minions/world_01_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_01/minions/world_01_minion_spitter.png",
          "variant": "assets/world_01/minions/world_01_minion_spitter_danado.png",
          "sheet": "assets/world_01/minions/world_01_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_01/minions/world_01_minion_phantom.png",
          "variant": "assets/world_01/minions/world_01_minion_phantom_elite.png",
          "sheet": "assets/world_01/minions/world_01_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_01/subbosses/world_01_subboss_a_ofensivo.png",
          "sheet": "assets/world_01/subbosses/world_01_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_01/subbosses/world_01_subboss_b_tactico.png",
          "sheet": "assets/world_01/subbosses/world_01_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_01/boss/world_01_boss_xenomorfo_escarlata_fase1.png",
          "assets/world_01/boss/world_01_boss_xenomorfo_escarlata_fase2.png",
          "assets/world_01/boss/world_01_boss_xenomorfo_escarlata_fase3.png"
        ],
        "coreOpen": "assets/world_01/boss/world_01_boss_xenomorfo_escarlata_nucleo_abierto.png",
        "animSheet": "assets/world_01/boss/world_01_boss_xenomorfo_escarlata_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_01/boss/world_01_boss_xenomorfo_escarlata_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_01/boss/world_01_reliquia_xenomorfo_escarlata.png",
        "relicFloat": "assets/world_01/boss/world_01_reliquia_xenomorfo_escarlata_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_01/boss/world_01_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "cae_caçador",
          "base": "assets/world_01/projectiles/world_01_projectile_cae_caçador.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_cae_caçador_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: cae caçador (tipo seeker)."
        },
        {
          "name": "espora_sangrienta",
          "base": "assets/world_01/projectiles/world_01_projectile_espora_sangrienta.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_espora_sangrienta_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: espora sangrienta (tipo orb)."
        },
        {
          "name": "lanza_ecorche",
          "base": "assets/world_01/projectiles/world_01_projectile_lanza_ecorche.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_lanza_ecorche_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: lanza ecorche (tipo lance)."
        },
        {
          "name": "pulso_escarlata",
          "base": "assets/world_01/projectiles/world_01_projectile_pulso_escarlata.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_pulso_escarlata_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: pulso escarlata (tipo ring)."
        },
        {
          "name": "rayo_desgarro",
          "base": "assets/world_01/projectiles/world_01_projectile_rayo_desgarro.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_rayo_desgarro_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: rayo desgarro (tipo beamseg)."
        },
        {
          "name": "subboss_a_cae_caçador",
          "base": "assets/world_01/projectiles/world_01_projectile_subboss_a_cae_caçador.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_subboss_a_cae_caçador_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: cae caçador."
        },
        {
          "name": "subboss_b_pulso_escarlata",
          "base": "assets/world_01/projectiles/world_01_projectile_subboss_b_pulso_escarlata.png",
          "sheet": "assets/world_01/projectiles/world_01_projectile_subboss_b_pulso_escarlata_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: pulso escarlata."
        }
      ],
      "obstacles": [
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_01/obstacles/world_01_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "meteor",
          "path": "assets/world_01/obstacles/world_01_obstacle_meteor.png",
          "funcion": "Metoro giratorio destruible; gira lentamente (usa la hoja de 8 frames)."
        },
        {
          "name": "meteor_fracturado",
          "path": "assets/world_01/obstacles/world_01_obstacle_meteor_fracturado.png",
          "funcion": "Roca defensora fracturada; cubierta parcial, gira poco."
        },
        {
          "name": "meteor_sheet_giro",
          "path": "assets/world_01/obstacles/world_01_obstacle_meteor_sheet_giro.png",
          "funcion": "Giro del meteoro (8 frames, loop)."
        },
        {
          "name": "microasteroide",
          "path": "assets/world_01/obstacles/world_01_obstacle_microasteroide.png",
          "funcion": "Microasteroide lento; relleno de esquiva."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_01/obstacles/world_01_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_01/obstacles/world_01_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_01/powerups/world_01_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_01/powerups/world_01_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_01/powerups/world_01_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_01/backgrounds/world_01_bg_base.jpg",
        "intense": "assets/world_01/backgrounds/world_01_bg_intenso.jpg",
        "boss": "assets/world_01/backgrounds/world_01_bg_jefe.jpg",
        "far": "assets/world_01/backgrounds/world_01_bg_base_capa_lejos.png",
        "near": "assets/world_01/backgrounds/world_01_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 2,
      "key": "world_02",
      "label": "Mundo 02",
      "sector": "Anillo de Titanio",
      "bossName": "Yautja Prime",
      "family": "Clan depredador tecno-tribal: mandíbulas, dreadlocks metálicos, hombreras, visión térmica.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#8dff2e",
        "neon_b": "#ffb02e",
        "core": "#c8ff3c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_02/minions/world_02_minion_swarmer.png",
          "variant": "assets/world_02/minions/world_02_minion_swarmer_elite.png",
          "sheet": "assets/world_02/minions/world_02_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_02/minions/world_02_minion_stinger.png",
          "variant": "assets/world_02/minions/world_02_minion_stinger_danado.png",
          "sheet": "assets/world_02/minions/world_02_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_02/minions/world_02_minion_hunter.png",
          "variant": "assets/world_02/minions/world_02_minion_hunter_elite.png",
          "sheet": "assets/world_02/minions/world_02_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_02/minions/world_02_minion_sentinel.png",
          "variant": "assets/world_02/minions/world_02_minion_sentinel_danado.png",
          "sheet": "assets/world_02/minions/world_02_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_02/minions/world_02_minion_spitter.png",
          "variant": "assets/world_02/minions/world_02_minion_spitter_elite.png",
          "sheet": "assets/world_02/minions/world_02_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_02/minions/world_02_minion_phantom.png",
          "variant": "assets/world_02/minions/world_02_minion_phantom_danado.png",
          "sheet": "assets/world_02/minions/world_02_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_02/subbosses/world_02_subboss_a_ofensivo.png",
          "sheet": "assets/world_02/subbosses/world_02_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_02/subbosses/world_02_subboss_b_tactico.png",
          "sheet": "assets/world_02/subbosses/world_02_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_02/boss/world_02_boss_yautja_prime_fase1.png",
          "assets/world_02/boss/world_02_boss_yautja_prime_fase2.png",
          "assets/world_02/boss/world_02_boss_yautja_prime_fase3.png"
        ],
        "coreOpen": "assets/world_02/boss/world_02_boss_yautja_prime_nucleo_abierto.png",
        "animSheet": "assets/world_02/boss/world_02_boss_yautja_prime_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_02/boss/world_02_boss_yautja_prime_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_02/boss/world_02_reliquia_yautja_prime.png",
        "relicFloat": "assets/world_02/boss/world_02_reliquia_yautja_prime_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_02/boss/world_02_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "bomba_plasma",
          "base": "assets/world_02/projectiles/world_02_projectile_bomba_plasma.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_bomba_plasma_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: bomba plasma (tipo orb)."
        },
        {
          "name": "cañon_tri_laser",
          "base": "assets/world_02/projectiles/world_02_projectile_cañon_tri_laser.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_cañon_tri_laser_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: cañon tri laser (tipo beamseg)."
        },
        {
          "name": "dardo_mandibula",
          "base": "assets/world_02/projectiles/world_02_projectile_dardo_mandibula.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_dardo_mandibula_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: dardo mandibula (tipo bolt)."
        },
        {
          "name": "disco_metal",
          "base": "assets/world_02/projectiles/world_02_projectile_disco_metal.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_disco_metal_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: disco metal (tipo ring)."
        },
        {
          "name": "lanza_caza",
          "base": "assets/world_02/projectiles/world_02_projectile_lanza_caza.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_lanza_caza_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: lanza caza (tipo lance)."
        },
        {
          "name": "subboss_a_dardo_mandibula",
          "base": "assets/world_02/projectiles/world_02_projectile_subboss_a_dardo_mandibula.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_subboss_a_dardo_mandibula_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: dardo mandibula."
        },
        {
          "name": "subboss_b_disco_metal",
          "base": "assets/world_02/projectiles/world_02_projectile_subboss_b_disco_metal.png",
          "sheet": "assets/world_02/projectiles/world_02_projectile_subboss_b_disco_metal_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: disco metal."
        }
      ],
      "obstacles": [
        {
          "name": "chatarra_espacial",
          "path": "assets/world_02/obstacles/world_02_obstacle_chatarra_espacial.png",
          "funcion": "Chatarra espacial humana móvil; obstáculo de bloqueo."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_02/obstacles/world_02_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "fragmento_satelite",
          "path": "assets/world_02/obstacles/world_02_obstacle_fragmento_satelite.png",
          "funcion": "Fragmento de satélite con paneles; giro lento."
        },
        {
          "name": "placa_casco",
          "path": "assets/world_02/obstacles/world_02_obstacle_placa_casco.png",
          "funcion": "Placa de casco nave humana; cobertura utilitaria."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_02/obstacles/world_02_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_02/obstacles/world_02_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_02/powerups/world_02_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_02/powerups/world_02_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_02/powerups/world_02_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_02/backgrounds/world_02_bg_base.jpg",
        "intense": "assets/world_02/backgrounds/world_02_bg_intenso.jpg",
        "boss": "assets/world_02/backgrounds/world_02_bg_jefe.jpg",
        "far": "assets/world_02/backgrounds/world_02_bg_base_capa_lejos.png",
        "near": "assets/world_02/backgrounds/world_02_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 3,
      "key": "world_03",
      "label": "Mundo 03",
      "sector": "Vacío Bioluminiscente",
      "bossName": "Nébula Sintética",
      "family": "Medusas y diatomeas sintéticas: campanas translúcidas, filamentos de datos, luz cian-violeta.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#2ee6ff",
        "neon_b": "#ba71ff",
        "core": "#5cf2ff"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_03/minions/world_03_minion_swarmer.png",
          "variant": "assets/world_03/minions/world_03_minion_swarmer_danado.png",
          "sheet": "assets/world_03/minions/world_03_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_03/minions/world_03_minion_stinger.png",
          "variant": "assets/world_03/minions/world_03_minion_stinger_elite.png",
          "sheet": "assets/world_03/minions/world_03_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_03/minions/world_03_minion_hunter.png",
          "variant": "assets/world_03/minions/world_03_minion_hunter_danado.png",
          "sheet": "assets/world_03/minions/world_03_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_03/minions/world_03_minion_sentinel.png",
          "variant": "assets/world_03/minions/world_03_minion_sentinel_elite.png",
          "sheet": "assets/world_03/minions/world_03_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_03/minions/world_03_minion_spitter.png",
          "variant": "assets/world_03/minions/world_03_minion_spitter_danado.png",
          "sheet": "assets/world_03/minions/world_03_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_03/minions/world_03_minion_phantom.png",
          "variant": "assets/world_03/minions/world_03_minion_phantom_elite.png",
          "sheet": "assets/world_03/minions/world_03_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_03/subbosses/world_03_subboss_a_ofensivo.png",
          "sheet": "assets/world_03/subbosses/world_03_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_03/subbosses/world_03_subboss_b_tactico.png",
          "sheet": "assets/world_03/subbosses/world_03_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_03/boss/world_03_boss_nebula_sintetica_fase1.png",
          "assets/world_03/boss/world_03_boss_nebula_sintetica_fase2.png",
          "assets/world_03/boss/world_03_boss_nebula_sintetica_fase3.png"
        ],
        "coreOpen": "assets/world_03/boss/world_03_boss_nebula_sintetica_nucleo_abierto.png",
        "animSheet": "assets/world_03/boss/world_03_boss_nebula_sintetica_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_03/boss/world_03_boss_nebula_sintetica_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_03/boss/world_03_reliquia_nebula_sintetica.png",
        "relicFloat": "assets/world_03/boss/world_03_reliquia_nebula_sintetica_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_03/boss/world_03_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "chispa_cilio",
          "base": "assets/world_03/projectiles/world_03_projectile_chispa_cilio.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_chispa_cilio_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: chispa cilio (tipo bolt)."
        },
        {
          "name": "gota_luz",
          "base": "assets/world_03/projectiles/world_03_projectile_gota_luz.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_gota_luz_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: gota luz (tipo orb)."
        },
        {
          "name": "haz_biolumino",
          "base": "assets/world_03/projectiles/world_03_projectile_haz_biolumino.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_haz_biolumino_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz biolumino (tipo beamseg)."
        },
        {
          "name": "medusa_buscadora",
          "base": "assets/world_03/projectiles/world_03_projectile_medusa_buscadora.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_medusa_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: medusa buscadora (tipo seeker)."
        },
        {
          "name": "onda_sonar",
          "base": "assets/world_03/projectiles/world_03_projectile_onda_sonar.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_onda_sonar_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: onda sonar (tipo ring)."
        },
        {
          "name": "subboss_a_onda_sonar",
          "base": "assets/world_03/projectiles/world_03_projectile_subboss_a_onda_sonar.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_subboss_a_onda_sonar_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: onda sonar."
        },
        {
          "name": "subboss_b_chispa_cilio",
          "base": "assets/world_03/projectiles/world_03_projectile_subboss_b_chispa_cilio.png",
          "sheet": "assets/world_03/projectiles/world_03_projectile_subboss_b_chispa_cilio_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: chispa cilio."
        }
      ],
      "obstacles": [
        {
          "name": "capsula_biotech",
          "path": "assets/world_03/obstacles/world_03_obstacle_capsula_biotech.png",
          "funcion": "Cápsula biotecnológica translúcida; núcleo brillante."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_03/obstacles/world_03_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "espina_flotante",
          "path": "assets/world_03/obstacles/world_03_obstacle_espina_flotante.png",
          "funcion": "Espina biológica flotante; peligro pasivo."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_03/obstacles/world_03_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_03/obstacles/world_03_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        },
        {
          "name": "restos_organicos",
          "path": "assets/world_03/obstacles/world_03_obstacle_restos_organicos.png",
          "funcion": "Restos alienígenas orgánicos; pulsan suavemente."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_03/powerups/world_03_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_03/powerups/world_03_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_03/powerups/world_03_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_03/backgrounds/world_03_bg_base.jpg",
        "intense": "assets/world_03/backgrounds/world_03_bg_intenso.jpg",
        "boss": "assets/world_03/backgrounds/world_03_bg_jefe.jpg",
        "far": "assets/world_03/backgrounds/world_03_bg_base_capa_lejos.png",
        "near": "assets/world_03/backgrounds/world_03_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 4,
      "key": "world_04",
      "label": "Mundo 04",
      "sector": "Cinturón Abisal",
      "bossName": "Arachnid Matriarca",
      "family": "Colonia arácnida abisal: patas articuladas, sacos de huevos, seda fosforescente.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#eb5eff",
        "neon_b": "#7aff5c",
        "core": "#d86bff"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_04/minions/world_04_minion_swarmer.png",
          "variant": "assets/world_04/minions/world_04_minion_swarmer_elite.png",
          "sheet": "assets/world_04/minions/world_04_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_04/minions/world_04_minion_stinger.png",
          "variant": "assets/world_04/minions/world_04_minion_stinger_danado.png",
          "sheet": "assets/world_04/minions/world_04_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_04/minions/world_04_minion_hunter.png",
          "variant": "assets/world_04/minions/world_04_minion_hunter_elite.png",
          "sheet": "assets/world_04/minions/world_04_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_04/minions/world_04_minion_sentinel.png",
          "variant": "assets/world_04/minions/world_04_minion_sentinel_danado.png",
          "sheet": "assets/world_04/minions/world_04_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_04/minions/world_04_minion_spitter.png",
          "variant": "assets/world_04/minions/world_04_minion_spitter_elite.png",
          "sheet": "assets/world_04/minions/world_04_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_04/minions/world_04_minion_phantom.png",
          "variant": "assets/world_04/minions/world_04_minion_phantom_danado.png",
          "sheet": "assets/world_04/minions/world_04_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_04/subbosses/world_04_subboss_a_ofensivo.png",
          "sheet": "assets/world_04/subbosses/world_04_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_04/subbosses/world_04_subboss_b_tactico.png",
          "sheet": "assets/world_04/subbosses/world_04_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_04/boss/world_04_boss_arachnid_matriarca_fase1.png",
          "assets/world_04/boss/world_04_boss_arachnid_matriarca_fase2.png",
          "assets/world_04/boss/world_04_boss_arachnid_matriarca_fase3.png"
        ],
        "coreOpen": "assets/world_04/boss/world_04_boss_arachnid_matriarca_nucleo_abierto.png",
        "animSheet": "assets/world_04/boss/world_04_boss_arachnid_matriarca_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_04/boss/world_04_boss_arachnid_matriarca_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_04/boss/world_04_reliquia_arachnid_matriarca.png",
        "relicFloat": "assets/world_04/boss/world_04_reliquia_arachnid_matriarca_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_04/boss/world_04_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "agujon_seda",
          "base": "assets/world_04/projectiles/world_04_projectile_agujon_seda.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_agujon_seda_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: agujon seda (tipo bolt)."
        },
        {
          "name": "cria_dependiente",
          "base": "assets/world_04/projectiles/world_04_projectile_cria_dependiente.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_cria_dependiente_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: cria dependiente (tipo seeker)."
        },
        {
          "name": "huevo_buscador",
          "base": "assets/world_04/projectiles/world_04_projectile_huevo_buscador.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_huevo_buscador_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: huevo buscador (tipo egg)."
        },
        {
          "name": "saco_veneno",
          "base": "assets/world_04/projectiles/world_04_projectile_saco_veneno.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_saco_veneno_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: saco veneno (tipo orb)."
        },
        {
          "name": "subboss_a_agujon_seda",
          "base": "assets/world_04/projectiles/world_04_projectile_subboss_a_agujon_seda.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_subboss_a_agujon_seda_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: agujon seda."
        },
        {
          "name": "subboss_b_telaraña_pulso",
          "base": "assets/world_04/projectiles/world_04_projectile_subboss_b_telaraña_pulso.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_subboss_b_telaraña_pulso_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: telaraña pulso."
        },
        {
          "name": "telaraña_pulso",
          "base": "assets/world_04/projectiles/world_04_projectile_telaraña_pulso.png",
          "sheet": "assets/world_04/projectiles/world_04_projectile_telaraña_pulso_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: telaraña pulso (tipo ring)."
        }
      ],
      "obstacles": [
        {
          "name": "anillo_roto",
          "path": "assets/world_04/obstacles/world_04_obstacle_anillo_roto.png",
          "funcion": "Anillo ritual roto; arco giratorio."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_04/obstacles/world_04_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "columna_antigua",
          "path": "assets/world_04/obstacles/world_04_obstacle_columna_antigua.png",
          "funcion": "Columna de civilización perdida; glifos tenues."
        },
        {
          "name": "monolito_movil",
          "path": "assets/world_04/obstacles/world_04_obstacle_monolito_movil.png",
          "funcion": "Monolito móvil con glifos; defensa pesada."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_04/obstacles/world_04_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_04/obstacles/world_04_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_04/powerups/world_04_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_04/powerups/world_04_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_04/powerups/world_04_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_04/backgrounds/world_04_bg_base.jpg",
        "intense": "assets/world_04/backgrounds/world_04_bg_intenso.jpg",
        "boss": "assets/world_04/backgrounds/world_04_bg_jefe.jpg",
        "far": "assets/world_04/backgrounds/world_04_bg_base_capa_lejos.png",
        "near": "assets/world_04/backgrounds/world_04_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 5,
      "key": "world_05",
      "label": "Mundo 05",
      "sector": "Sector Leviatán",
      "bossName": "Leviathan Omega",
      "family": "Ballenas cósmicas colosales: aletas de plasma, barbas de energía, cantar abisal.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#2effd8",
        "neon_b": "#3299ff",
        "core": "#7cffe8"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_05/minions/world_05_minion_swarmer.png",
          "variant": "assets/world_05/minions/world_05_minion_swarmer_danado.png",
          "sheet": "assets/world_05/minions/world_05_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_05/minions/world_05_minion_stinger.png",
          "variant": "assets/world_05/minions/world_05_minion_stinger_elite.png",
          "sheet": "assets/world_05/minions/world_05_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_05/minions/world_05_minion_hunter.png",
          "variant": "assets/world_05/minions/world_05_minion_hunter_danado.png",
          "sheet": "assets/world_05/minions/world_05_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_05/minions/world_05_minion_sentinel.png",
          "variant": "assets/world_05/minions/world_05_minion_sentinel_elite.png",
          "sheet": "assets/world_05/minions/world_05_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_05/minions/world_05_minion_spitter.png",
          "variant": "assets/world_05/minions/world_05_minion_spitter_danado.png",
          "sheet": "assets/world_05/minions/world_05_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_05/minions/world_05_minion_phantom.png",
          "variant": "assets/world_05/minions/world_05_minion_phantom_elite.png",
          "sheet": "assets/world_05/minions/world_05_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_05/subbosses/world_05_subboss_a_ofensivo.png",
          "sheet": "assets/world_05/subbosses/world_05_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_05/subbosses/world_05_subboss_b_tactico.png",
          "sheet": "assets/world_05/subbosses/world_05_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_05/boss/world_05_boss_leviathan_omega_fase1.png",
          "assets/world_05/boss/world_05_boss_leviathan_omega_fase2.png",
          "assets/world_05/boss/world_05_boss_leviathan_omega_fase3.png"
        ],
        "coreOpen": "assets/world_05/boss/world_05_boss_leviathan_omega_nucleo_abierto.png",
        "animSheet": "assets/world_05/boss/world_05_boss_leviathan_omega_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_05/boss/world_05_boss_leviathan_omega_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_05/boss/world_05_reliquia_leviathan_omega.png",
        "relicFloat": "assets/world_05/boss/world_05_reliquia_leviathan_omega_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_05/boss/world_05_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "burbuja_abismo",
          "base": "assets/world_05/projectiles/world_05_projectile_burbuja_abismo.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_burbuja_abismo_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: burbuja abismo (tipo orb)."
        },
        {
          "name": "canto_sonar",
          "base": "assets/world_05/projectiles/world_05_projectile_canto_sonar.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_canto_sonar_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: canto sonar (tipo beamseg)."
        },
        {
          "name": "marea_presion",
          "base": "assets/world_05/projectiles/world_05_projectile_marea_presion.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_marea_presion_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: marea presion (tipo wave)."
        },
        {
          "name": "remora_buscadora",
          "base": "assets/world_05/projectiles/world_05_projectile_remora_buscadora.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_remora_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: remora buscadora (tipo seeker)."
        },
        {
          "name": "subboss_a_canto_sonar",
          "base": "assets/world_05/projectiles/world_05_projectile_subboss_a_canto_sonar.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_subboss_a_canto_sonar_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: canto sonar."
        },
        {
          "name": "subboss_b_remora_buscadora",
          "base": "assets/world_05/projectiles/world_05_projectile_subboss_b_remora_buscadora.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_subboss_b_remora_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: remora buscadora."
        },
        {
          "name": "vortice_aleta",
          "base": "assets/world_05/projectiles/world_05_projectile_vortice_aleta.png",
          "sheet": "assets/world_05/projectiles/world_05_projectile_vortice_aleta_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: vortice aleta (tipo ring)."
        }
      ],
      "obstacles": [
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_05/obstacles/world_05_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "meteor",
          "path": "assets/world_05/obstacles/world_05_obstacle_meteor.png",
          "funcion": "Metoro giratorio destruible; gira lentamente (usa la hoja de 8 frames)."
        },
        {
          "name": "meteor_fracturado",
          "path": "assets/world_05/obstacles/world_05_obstacle_meteor_fracturado.png",
          "funcion": "Roca defensora fracturada; cubierta parcial, gira poco."
        },
        {
          "name": "meteor_sheet_giro",
          "path": "assets/world_05/obstacles/world_05_obstacle_meteor_sheet_giro.png",
          "funcion": "Giro del meteoro (8 frames, loop)."
        },
        {
          "name": "microasteroide",
          "path": "assets/world_05/obstacles/world_05_obstacle_microasteroide.png",
          "funcion": "Microasteroide lento; relleno de esquiva."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_05/obstacles/world_05_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_05/obstacles/world_05_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_05/powerups/world_05_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_05/powerups/world_05_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_05/powerups/world_05_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_05/backgrounds/world_05_bg_base.jpg",
        "intense": "assets/world_05/backgrounds/world_05_bg_intenso.jpg",
        "boss": "assets/world_05/backgrounds/world_05_bg_jefe.jpg",
        "far": "assets/world_05/backgrounds/world_05_bg_base_capa_lejos.png",
        "near": "assets/world_05/backgrounds/world_05_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 6,
      "key": "world_06",
      "label": "Mundo 06",
      "sector": "Fortaleza Carbón",
      "bossName": "Dreadnought Rex",
      "family": "Fortaleza dinosaurio-mecánica: placas de carbón, torretas, mandíbula de asedio. REVIVE.",
      "phases": 3,
      "renace": true,
      "palette": {
        "neon_a": "#ff8c1a",
        "neon_b": "#ffcf3c",
        "core": "#ffb03c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_06/minions/world_06_minion_swarmer.png",
          "variant": "assets/world_06/minions/world_06_minion_swarmer_elite.png",
          "sheet": "assets/world_06/minions/world_06_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_06/minions/world_06_minion_stinger.png",
          "variant": "assets/world_06/minions/world_06_minion_stinger_danado.png",
          "sheet": "assets/world_06/minions/world_06_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_06/minions/world_06_minion_hunter.png",
          "variant": "assets/world_06/minions/world_06_minion_hunter_elite.png",
          "sheet": "assets/world_06/minions/world_06_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_06/minions/world_06_minion_sentinel.png",
          "variant": "assets/world_06/minions/world_06_minion_sentinel_danado.png",
          "sheet": "assets/world_06/minions/world_06_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_06/minions/world_06_minion_spitter.png",
          "variant": "assets/world_06/minions/world_06_minion_spitter_elite.png",
          "sheet": "assets/world_06/minions/world_06_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_06/minions/world_06_minion_phantom.png",
          "variant": "assets/world_06/minions/world_06_minion_phantom_danado.png",
          "sheet": "assets/world_06/minions/world_06_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_06/subbosses/world_06_subboss_a_ofensivo.png",
          "sheet": "assets/world_06/subbosses/world_06_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_06/subbosses/world_06_subboss_b_tactico.png",
          "sheet": "assets/world_06/subbosses/world_06_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_06/boss/world_06_boss_dreadnought_rex_fase1.png",
          "assets/world_06/boss/world_06_boss_dreadnought_rex_fase2.png",
          "assets/world_06/boss/world_06_boss_dreadnought_rex_fase3.png"
        ],
        "coreOpen": "assets/world_06/boss/world_06_boss_dreadnought_rex_nucleo_abierto.png",
        "animSheet": "assets/world_06/boss/world_06_boss_dreadnought_rex_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_06/boss/world_06_boss_dreadnought_rex_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_06/boss/world_06_reliquia_dreadnought_rex.png",
        "relicFloat": "assets/world_06/boss/world_06_reliquia_dreadnought_rex_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_06/boss/world_06_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": "assets/world_06/boss/world_06_boss_dreadnought_rex_renacido.png"
      },
      "projectiles": [
        {
          "name": "lanza_perforadora",
          "base": "assets/world_06/projectiles/world_06_projectile_lanza_perforadora.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_lanza_perforadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: lanza perforadora (tipo lance)."
        },
        {
          "name": "morte_carbon",
          "base": "assets/world_06/projectiles/world_06_projectile_morte_carbon.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_morte_carbon_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: morte carbon (tipo orb)."
        },
        {
          "name": "obus_perforante",
          "base": "assets/world_06/projectiles/world_06_projectile_obus_perforante.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_obus_perforante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: obus perforante (tipo bolt)."
        },
        {
          "name": "onda_shockwave",
          "base": "assets/world_06/projectiles/world_06_projectile_onda_shockwave.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_onda_shockwave_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: onda shockwave (tipo ring)."
        },
        {
          "name": "rayo_siege",
          "base": "assets/world_06/projectiles/world_06_projectile_rayo_siege.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_rayo_siege_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: rayo siege (tipo beamseg)."
        },
        {
          "name": "subboss_a_rayo_siege",
          "base": "assets/world_06/projectiles/world_06_projectile_subboss_a_rayo_siege.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_subboss_a_rayo_siege_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: rayo siege."
        },
        {
          "name": "subboss_b_onda_shockwave",
          "base": "assets/world_06/projectiles/world_06_projectile_subboss_b_onda_shockwave.png",
          "sheet": "assets/world_06/projectiles/world_06_projectile_subboss_b_onda_shockwave_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: onda shockwave."
        }
      ],
      "obstacles": [
        {
          "name": "chatarra_espacial",
          "path": "assets/world_06/obstacles/world_06_obstacle_chatarra_espacial.png",
          "funcion": "Chatarra espacial humana móvil; obstáculo de bloqueo."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_06/obstacles/world_06_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "fragmento_satelite",
          "path": "assets/world_06/obstacles/world_06_obstacle_fragmento_satelite.png",
          "funcion": "Fragmento de satélite con paneles; giro lento."
        },
        {
          "name": "placa_casco",
          "path": "assets/world_06/obstacles/world_06_obstacle_placa_casco.png",
          "funcion": "Placa de casco nave humana; cobertura utilitaria."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_06/obstacles/world_06_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_06/obstacles/world_06_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_06/powerups/world_06_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_06/powerups/world_06_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_06/powerups/world_06_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_06/backgrounds/world_06_bg_base.jpg",
        "intense": "assets/world_06/backgrounds/world_06_bg_intenso.jpg",
        "boss": "assets/world_06/backgrounds/world_06_bg_jefe.jpg",
        "far": "assets/world_06/backgrounds/world_06_bg_base_capa_lejos.png",
        "near": "assets/world_06/backgrounds/world_06_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 7,
      "key": "world_07",
      "label": "Mundo 07",
      "sector": "Cementerio Orbital",
      "bossName": "Necro Swarm",
      "family": "Enjambre necrótico de restos: costillas de casco, cráneos-pod, luz fúnebre verde.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#9cff3c",
        "neon_b": "#d8ff8c",
        "core": "#c8ff5c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_07/minions/world_07_minion_swarmer.png",
          "variant": "assets/world_07/minions/world_07_minion_swarmer_danado.png",
          "sheet": "assets/world_07/minions/world_07_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_07/minions/world_07_minion_stinger.png",
          "variant": "assets/world_07/minions/world_07_minion_stinger_elite.png",
          "sheet": "assets/world_07/minions/world_07_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_07/minions/world_07_minion_hunter.png",
          "variant": "assets/world_07/minions/world_07_minion_hunter_danado.png",
          "sheet": "assets/world_07/minions/world_07_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_07/minions/world_07_minion_sentinel.png",
          "variant": "assets/world_07/minions/world_07_minion_sentinel_elite.png",
          "sheet": "assets/world_07/minions/world_07_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_07/minions/world_07_minion_spitter.png",
          "variant": "assets/world_07/minions/world_07_minion_spitter_danado.png",
          "sheet": "assets/world_07/minions/world_07_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_07/minions/world_07_minion_phantom.png",
          "variant": "assets/world_07/minions/world_07_minion_phantom_elite.png",
          "sheet": "assets/world_07/minions/world_07_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_07/subbosses/world_07_subboss_a_ofensivo.png",
          "sheet": "assets/world_07/subbosses/world_07_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_07/subbosses/world_07_subboss_b_tactico.png",
          "sheet": "assets/world_07/subbosses/world_07_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_07/boss/world_07_boss_necro_swarm_fase1.png",
          "assets/world_07/boss/world_07_boss_necro_swarm_fase2.png",
          "assets/world_07/boss/world_07_boss_necro_swarm_fase3.png"
        ],
        "coreOpen": "assets/world_07/boss/world_07_boss_necro_swarm_nucleo_abierto.png",
        "animSheet": "assets/world_07/boss/world_07_boss_necro_swarm_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_07/boss/world_07_boss_necro_swarm_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_07/boss/world_07_reliquia_necro_swarm.png",
        "relicFloat": "assets/world_07/boss/world_07_reliquia_necro_swarm_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_07/boss/world_07_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "astilla_hueso",
          "base": "assets/world_07/projectiles/world_07_projectile_astilla_hueso.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_astilla_hueso_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: astilla hueso (tipo bolt)."
        },
        {
          "name": "bolsa_bilis",
          "base": "assets/world_07/projectiles/world_07_projectile_bolsa_bilis.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_bolsa_bilis_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: bolsa bilis (tipo orb)."
        },
        {
          "name": "campana_muerte",
          "base": "assets/world_07/projectiles/world_07_projectile_campana_muerte.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_campana_muerte_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: campana muerte (tipo ring)."
        },
        {
          "name": "enjambre_necro",
          "base": "assets/world_07/projectiles/world_07_projectile_enjambre_necro.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_enjambre_necro_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: enjambre necro (tipo seeker)."
        },
        {
          "name": "haz_sepulcral",
          "base": "assets/world_07/projectiles/world_07_projectile_haz_sepulcral.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_haz_sepulcral_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz sepulcral (tipo beamseg)."
        },
        {
          "name": "subboss_a_enjambre_necro",
          "base": "assets/world_07/projectiles/world_07_projectile_subboss_a_enjambre_necro.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_subboss_a_enjambre_necro_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: enjambre necro."
        },
        {
          "name": "subboss_b_campana_muerte",
          "base": "assets/world_07/projectiles/world_07_projectile_subboss_b_campana_muerte.png",
          "sheet": "assets/world_07/projectiles/world_07_projectile_subboss_b_campana_muerte_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: campana muerte."
        }
      ],
      "obstacles": [
        {
          "name": "capsula_biotech",
          "path": "assets/world_07/obstacles/world_07_obstacle_capsula_biotech.png",
          "funcion": "Cápsula biotecnológica translúcida; núcleo brillante."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_07/obstacles/world_07_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "espina_flotante",
          "path": "assets/world_07/obstacles/world_07_obstacle_espina_flotante.png",
          "funcion": "Espina biológica flotante; peligro pasivo."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_07/obstacles/world_07_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_07/obstacles/world_07_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        },
        {
          "name": "restos_organicos",
          "path": "assets/world_07/obstacles/world_07_obstacle_restos_organicos.png",
          "funcion": "Restos alienígenas orgánicos; pulsan suavemente."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_07/powerups/world_07_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_07/powerups/world_07_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_07/powerups/world_07_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_07/backgrounds/world_07_bg_base.jpg",
        "intense": "assets/world_07/backgrounds/world_07_bg_intenso.jpg",
        "boss": "assets/world_07/backgrounds/world_07_bg_jefe.jpg",
        "far": "assets/world_07/backgrounds/world_07_bg_base_capa_lejos.png",
        "near": "assets/world_07/backgrounds/world_07_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 8,
      "key": "world_08",
      "label": "Mundo 08",
      "sector": "Grieta Cristalina",
      "bossName": "Prism Warden",
      "family": "Guardián prismático: facetas que refractan, lanzas de luz, geometría perfecta.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#ff54ff",
        "neon_b": "#4dffff",
        "core": "#ff8cff"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_08/minions/world_08_minion_swarmer.png",
          "variant": "assets/world_08/minions/world_08_minion_swarmer_elite.png",
          "sheet": "assets/world_08/minions/world_08_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_08/minions/world_08_minion_stinger.png",
          "variant": "assets/world_08/minions/world_08_minion_stinger_danado.png",
          "sheet": "assets/world_08/minions/world_08_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_08/minions/world_08_minion_hunter.png",
          "variant": "assets/world_08/minions/world_08_minion_hunter_elite.png",
          "sheet": "assets/world_08/minions/world_08_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_08/minions/world_08_minion_sentinel.png",
          "variant": "assets/world_08/minions/world_08_minion_sentinel_danado.png",
          "sheet": "assets/world_08/minions/world_08_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_08/minions/world_08_minion_spitter.png",
          "variant": "assets/world_08/minions/world_08_minion_spitter_elite.png",
          "sheet": "assets/world_08/minions/world_08_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_08/minions/world_08_minion_phantom.png",
          "variant": "assets/world_08/minions/world_08_minion_phantom_danado.png",
          "sheet": "assets/world_08/minions/world_08_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_08/subbosses/world_08_subboss_a_ofensivo.png",
          "sheet": "assets/world_08/subbosses/world_08_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_08/subbosses/world_08_subboss_b_tactico.png",
          "sheet": "assets/world_08/subbosses/world_08_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_08/boss/world_08_boss_prism_warden_fase1.png",
          "assets/world_08/boss/world_08_boss_prism_warden_fase2.png",
          "assets/world_08/boss/world_08_boss_prism_warden_fase3.png"
        ],
        "coreOpen": "assets/world_08/boss/world_08_boss_prism_warden_nucleo_abierto.png",
        "animSheet": "assets/world_08/boss/world_08_boss_prism_warden_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_08/boss/world_08_boss_prism_warden_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_08/boss/world_08_reliquia_prism_warden.png",
        "relicFloat": "assets/world_08/boss/world_08_reliquia_prism_warden_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_08/boss/world_08_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "astilla_cristal",
          "base": "assets/world_08/projectiles/world_08_projectile_astilla_cristal.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_astilla_cristal_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: astilla cristal (tipo shard)."
        },
        {
          "name": "haz_espectral",
          "base": "assets/world_08/projectiles/world_08_projectile_haz_espectral.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_haz_espectral_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz espectral (tipo beamseg)."
        },
        {
          "name": "lanza_prisma",
          "base": "assets/world_08/projectiles/world_08_projectile_lanza_prisma.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_lanza_prisma_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: lanza prisma (tipo lance)."
        },
        {
          "name": "quinta_esencia",
          "base": "assets/world_08/projectiles/world_08_projectile_quinta_esencia.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_quinta_esencia_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: quinta esencia (tipo orb)."
        },
        {
          "name": "refraccion_pulso",
          "base": "assets/world_08/projectiles/world_08_projectile_refraccion_pulso.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_refraccion_pulso_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: refraccion pulso (tipo ring)."
        },
        {
          "name": "subboss_a_refraccion_pulso",
          "base": "assets/world_08/projectiles/world_08_projectile_subboss_a_refraccion_pulso.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_subboss_a_refraccion_pulso_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: refraccion pulso."
        },
        {
          "name": "subboss_b_quinta_esencia",
          "base": "assets/world_08/projectiles/world_08_projectile_subboss_b_quinta_esencia.png",
          "sheet": "assets/world_08/projectiles/world_08_projectile_subboss_b_quinta_esencia_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: quinta esencia."
        }
      ],
      "obstacles": [
        {
          "name": "anillo_roto",
          "path": "assets/world_08/obstacles/world_08_obstacle_anillo_roto.png",
          "funcion": "Anillo ritual roto; arco giratorio."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_08/obstacles/world_08_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "columna_antigua",
          "path": "assets/world_08/obstacles/world_08_obstacle_columna_antigua.png",
          "funcion": "Columna de civilización perdida; glifos tenues."
        },
        {
          "name": "monolito_movil",
          "path": "assets/world_08/obstacles/world_08_obstacle_monolito_movil.png",
          "funcion": "Monolito móvil con glifos; defensa pesada."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_08/obstacles/world_08_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_08/obstacles/world_08_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_08/powerups/world_08_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_08/powerups/world_08_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_08/powerups/world_08_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_08/backgrounds/world_08_bg_base.jpg",
        "intense": "assets/world_08/backgrounds/world_08_bg_intenso.jpg",
        "boss": "assets/world_08/backgrounds/world_08_bg_jefe.jpg",
        "far": "assets/world_08/backgrounds/world_08_bg_base_capa_lejos.png",
        "near": "assets/world_08/backgrounds/world_08_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 9,
      "key": "world_09",
      "label": "Mundo 09",
      "sector": "Campo Magmático",
      "bossName": "Molten Core Tyrant",
      "family": "Tirano de obsidiana fundida: grietas de magma, escoria, corazón de volcán.",
      "phases": 3,
      "renace": false,
      "palette": {
        "neon_a": "#ff691d",
        "neon_b": "#ffd81a",
        "core": "#ff8c2e"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_09/minions/world_09_minion_swarmer.png",
          "variant": "assets/world_09/minions/world_09_minion_swarmer_danado.png",
          "sheet": "assets/world_09/minions/world_09_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_09/minions/world_09_minion_stinger.png",
          "variant": "assets/world_09/minions/world_09_minion_stinger_elite.png",
          "sheet": "assets/world_09/minions/world_09_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_09/minions/world_09_minion_hunter.png",
          "variant": "assets/world_09/minions/world_09_minion_hunter_danado.png",
          "sheet": "assets/world_09/minions/world_09_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_09/minions/world_09_minion_sentinel.png",
          "variant": "assets/world_09/minions/world_09_minion_sentinel_elite.png",
          "sheet": "assets/world_09/minions/world_09_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_09/minions/world_09_minion_spitter.png",
          "variant": "assets/world_09/minions/world_09_minion_spitter_danado.png",
          "sheet": "assets/world_09/minions/world_09_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_09/minions/world_09_minion_phantom.png",
          "variant": "assets/world_09/minions/world_09_minion_phantom_elite.png",
          "sheet": "assets/world_09/minions/world_09_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_09/subbosses/world_09_subboss_a_ofensivo.png",
          "sheet": "assets/world_09/subbosses/world_09_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_09/subbosses/world_09_subboss_b_tactico.png",
          "sheet": "assets/world_09/subbosses/world_09_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_09/boss/world_09_boss_molten_core_tyrant_fase1.png",
          "assets/world_09/boss/world_09_boss_molten_core_tyrant_fase2.png",
          "assets/world_09/boss/world_09_boss_molten_core_tyrant_fase3.png"
        ],
        "coreOpen": "assets/world_09/boss/world_09_boss_molten_core_tyrant_nucleo_abierto.png",
        "animSheet": "assets/world_09/boss/world_09_boss_molten_core_tyrant_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_09/boss/world_09_boss_molten_core_tyrant_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_09/boss/world_09_reliquia_molten_core_tyrant.png",
        "relicFloat": "assets/world_09/boss/world_09_reliquia_molten_core_tyrant_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_09/boss/world_09_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "anillo_erupcion",
          "base": "assets/world_09/projectiles/world_09_projectile_anillo_erupcion.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_anillo_erupcion_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: anillo erupcion (tipo ring)."
        },
        {
          "name": "brasa_perforante",
          "base": "assets/world_09/projectiles/world_09_projectile_brasa_perforante.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_brasa_perforante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: brasa perforante (tipo bolt)."
        },
        {
          "name": "gota_magma",
          "base": "assets/world_09/projectiles/world_09_projectile_gota_magma.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_gota_magma_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: gota magma (tipo orb)."
        },
        {
          "name": "haz_fundido",
          "base": "assets/world_09/projectiles/world_09_projectile_haz_fundido.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_haz_fundido_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz fundido (tipo beamseg)."
        },
        {
          "name": "ola_piroclasto",
          "base": "assets/world_09/projectiles/world_09_projectile_ola_piroclasto.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_ola_piroclasto_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: ola piroclasto (tipo wave)."
        },
        {
          "name": "subboss_a_brasa_perforante",
          "base": "assets/world_09/projectiles/world_09_projectile_subboss_a_brasa_perforante.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_subboss_a_brasa_perforante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: brasa perforante."
        },
        {
          "name": "subboss_b_anillo_erupcion",
          "base": "assets/world_09/projectiles/world_09_projectile_subboss_b_anillo_erupcion.png",
          "sheet": "assets/world_09/projectiles/world_09_projectile_subboss_b_anillo_erupcion_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: anillo erupcion."
        }
      ],
      "obstacles": [
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_09/obstacles/world_09_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "meteor",
          "path": "assets/world_09/obstacles/world_09_obstacle_meteor.png",
          "funcion": "Metoro giratorio destruible; gira lentamente (usa la hoja de 8 frames)."
        },
        {
          "name": "meteor_fracturado",
          "path": "assets/world_09/obstacles/world_09_obstacle_meteor_fracturado.png",
          "funcion": "Roca defensora fracturada; cubierta parcial, gira poco."
        },
        {
          "name": "meteor_sheet_giro",
          "path": "assets/world_09/obstacles/world_09_obstacle_meteor_sheet_giro.png",
          "funcion": "Giro del meteoro (8 frames, loop)."
        },
        {
          "name": "microasteroide",
          "path": "assets/world_09/obstacles/world_09_obstacle_microasteroide.png",
          "funcion": "Microasteroide lento; relleno de esquiva."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_09/obstacles/world_09_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_09/obstacles/world_09_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_09/powerups/world_09_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_09/powerups/world_09_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_09/powerups/world_09_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_09/backgrounds/world_09_bg_base.jpg",
        "intense": "assets/world_09/backgrounds/world_09_bg_intenso.jpg",
        "boss": "assets/world_09/backgrounds/world_09_bg_jefe.jpg",
        "far": "assets/world_09/backgrounds/world_09_bg_base_capa_lejos.png",
        "near": "assets/world_09/backgrounds/world_09_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 10,
      "key": "world_10",
      "label": "Mundo 10",
      "sector": "Sombra Cuántica",
      "bossName": "Phantom Dominion",
      "family": "Dominio de fantasmas cuánticos: superposición, ecos de posición, luz indigo. REVIVE y muta.",
      "phases": 4,
      "renace": true,
      "palette": {
        "neon_a": "#9d78ff",
        "neon_b": "#e0e6ff",
        "core": "#a88cff"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_10/minions/world_10_minion_swarmer.png",
          "variant": "assets/world_10/minions/world_10_minion_swarmer_elite.png",
          "sheet": "assets/world_10/minions/world_10_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_10/minions/world_10_minion_stinger.png",
          "variant": "assets/world_10/minions/world_10_minion_stinger_danado.png",
          "sheet": "assets/world_10/minions/world_10_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_10/minions/world_10_minion_hunter.png",
          "variant": "assets/world_10/minions/world_10_minion_hunter_elite.png",
          "sheet": "assets/world_10/minions/world_10_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_10/minions/world_10_minion_sentinel.png",
          "variant": "assets/world_10/minions/world_10_minion_sentinel_danado.png",
          "sheet": "assets/world_10/minions/world_10_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_10/minions/world_10_minion_spitter.png",
          "variant": "assets/world_10/minions/world_10_minion_spitter_elite.png",
          "sheet": "assets/world_10/minions/world_10_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_10/minions/world_10_minion_phantom.png",
          "variant": "assets/world_10/minions/world_10_minion_phantom_danado.png",
          "sheet": "assets/world_10/minions/world_10_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_10/subbosses/world_10_subboss_a_ofensivo.png",
          "sheet": "assets/world_10/subbosses/world_10_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_10/subbosses/world_10_subboss_b_tactico.png",
          "sheet": "assets/world_10/subbosses/world_10_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_10/boss/world_10_boss_phantom_dominion_fase1.png",
          "assets/world_10/boss/world_10_boss_phantom_dominion_fase2.png",
          "assets/world_10/boss/world_10_boss_phantom_dominion_fase3.png",
          "assets/world_10/boss/world_10_boss_phantom_dominion_fase4.png"
        ],
        "coreOpen": "assets/world_10/boss/world_10_boss_phantom_dominion_nucleo_abierto.png",
        "animSheet": "assets/world_10/boss/world_10_boss_phantom_dominion_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_10/boss/world_10_boss_phantom_dominion_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_10/boss/world_10_reliquia_phantom_dominion.png",
        "relicFloat": "assets/world_10/boss/world_10_reliquia_phantom_dominion_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_10/boss/world_10_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": "assets/world_10/boss/world_10_boss_phantom_dominion_renacido.png"
      },
      "projectiles": [
        {
          "name": "colapso_onda",
          "base": "assets/world_10/projectiles/world_10_projectile_colapso_onda.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_colapso_onda_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: colapso onda (tipo ring)."
        },
        {
          "name": "eco_cuanticol",
          "base": "assets/world_10/projectiles/world_10_projectile_eco_cuanticol.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_eco_cuanticol_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: eco cuanticol (tipo orb)."
        },
        {
          "name": "espectro_buscador",
          "base": "assets/world_10/projectiles/world_10_projectile_espectro_buscador.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_espectro_buscador_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: espectro buscador (tipo seeker)."
        },
        {
          "name": "fragmento_probabilidad",
          "base": "assets/world_10/projectiles/world_10_projectile_fragmento_probabilidad.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_fragmento_probabilidad_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: fragmento probabilidad (tipo shard)."
        },
        {
          "name": "haz_incertidumbre",
          "base": "assets/world_10/projectiles/world_10_projectile_haz_incertidumbre.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_haz_incertidumbre_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz incertidumbre (tipo beamseg)."
        },
        {
          "name": "subboss_a_colapso_onda",
          "base": "assets/world_10/projectiles/world_10_projectile_subboss_a_colapso_onda.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_subboss_a_colapso_onda_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: colapso onda."
        },
        {
          "name": "subboss_b_haz_incertidumbre",
          "base": "assets/world_10/projectiles/world_10_projectile_subboss_b_haz_incertidumbre.png",
          "sheet": "assets/world_10/projectiles/world_10_projectile_subboss_b_haz_incertidumbre_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: haz incertidumbre."
        }
      ],
      "obstacles": [
        {
          "name": "chatarra_espacial",
          "path": "assets/world_10/obstacles/world_10_obstacle_chatarra_espacial.png",
          "funcion": "Chatarra espacial humana móvil; obstáculo de bloqueo."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_10/obstacles/world_10_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "fragmento_satelite",
          "path": "assets/world_10/obstacles/world_10_obstacle_fragmento_satelite.png",
          "funcion": "Fragmento de satélite con paneles; giro lento."
        },
        {
          "name": "placa_casco",
          "path": "assets/world_10/obstacles/world_10_obstacle_placa_casco.png",
          "funcion": "Placa de casco nave humana; cobertura utilitaria."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_10/obstacles/world_10_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_10/obstacles/world_10_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_10/powerups/world_10_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_10/powerups/world_10_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_10/powerups/world_10_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_10/backgrounds/world_10_bg_base.jpg",
        "intense": "assets/world_10/backgrounds/world_10_bg_intenso.jpg",
        "boss": "assets/world_10/backgrounds/world_10_bg_jefe.jpg",
        "far": "assets/world_10/backgrounds/world_10_bg_base_capa_lejos.png",
        "near": "assets/world_10/backgrounds/world_10_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 11,
      "key": "world_11",
      "label": "Mundo 11",
      "sector": "Marea Gravitatoria",
      "bossName": "Gravity Devourer",
      "family": "Devorador gravitatorio: disco de acreción, fauce-anillo, mareas doradas.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#ffd23c",
        "neon_b": "#ba71ff",
        "core": "#ffe88c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_11/minions/world_11_minion_swarmer.png",
          "variant": "assets/world_11/minions/world_11_minion_swarmer_danado.png",
          "sheet": "assets/world_11/minions/world_11_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_11/minions/world_11_minion_stinger.png",
          "variant": "assets/world_11/minions/world_11_minion_stinger_elite.png",
          "sheet": "assets/world_11/minions/world_11_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_11/minions/world_11_minion_hunter.png",
          "variant": "assets/world_11/minions/world_11_minion_hunter_danado.png",
          "sheet": "assets/world_11/minions/world_11_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_11/minions/world_11_minion_sentinel.png",
          "variant": "assets/world_11/minions/world_11_minion_sentinel_elite.png",
          "sheet": "assets/world_11/minions/world_11_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_11/minions/world_11_minion_spitter.png",
          "variant": "assets/world_11/minions/world_11_minion_spitter_danado.png",
          "sheet": "assets/world_11/minions/world_11_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_11/minions/world_11_minion_phantom.png",
          "variant": "assets/world_11/minions/world_11_minion_phantom_elite.png",
          "sheet": "assets/world_11/minions/world_11_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_11/subbosses/world_11_subboss_a_ofensivo.png",
          "sheet": "assets/world_11/subbosses/world_11_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_11/subbosses/world_11_subboss_b_tactico.png",
          "sheet": "assets/world_11/subbosses/world_11_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_11/boss/world_11_boss_gravity_devourer_fase1.png",
          "assets/world_11/boss/world_11_boss_gravity_devourer_fase2.png",
          "assets/world_11/boss/world_11_boss_gravity_devourer_fase3.png",
          "assets/world_11/boss/world_11_boss_gravity_devourer_fase4.png"
        ],
        "coreOpen": "assets/world_11/boss/world_11_boss_gravity_devourer_nucleo_abierto.png",
        "animSheet": "assets/world_11/boss/world_11_boss_gravity_devourer_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_11/boss/world_11_boss_gravity_devourer_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_11/boss/world_11_reliquia_gravity_devourer.png",
        "relicFloat": "assets/world_11/boss/world_11_reliquia_gravity_devourer_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_11/boss/world_11_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "escombro_orbitante",
          "base": "assets/world_11/projectiles/world_11_projectile_escombro_orbitante.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_escombro_orbitante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: escombro orbitante (tipo seeker)."
        },
        {
          "name": "haz_marea",
          "base": "assets/world_11/projectiles/world_11_projectile_haz_marea.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_haz_marea_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz marea (tipo beamseg)."
        },
        {
          "name": "marea_espacial",
          "base": "assets/world_11/projectiles/world_11_projectile_marea_espacial.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_marea_espacial_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: marea espacial (tipo wave)."
        },
        {
          "name": "pulso_gravitatorio",
          "base": "assets/world_11/projectiles/world_11_projectile_pulso_gravitatorio.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_pulso_gravitatorio_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: pulso gravitatorio (tipo ring)."
        },
        {
          "name": "singularity_mini",
          "base": "assets/world_11/projectiles/world_11_projectile_singularity_mini.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_singularity_mini_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: singularity mini (tipo orb)."
        },
        {
          "name": "subboss_a_marea_espacial",
          "base": "assets/world_11/projectiles/world_11_projectile_subboss_a_marea_espacial.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_subboss_a_marea_espacial_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: marea espacial."
        },
        {
          "name": "subboss_b_escombro_orbitante",
          "base": "assets/world_11/projectiles/world_11_projectile_subboss_b_escombro_orbitante.png",
          "sheet": "assets/world_11/projectiles/world_11_projectile_subboss_b_escombro_orbitante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: escombro orbitante."
        }
      ],
      "obstacles": [
        {
          "name": "capsula_biotech",
          "path": "assets/world_11/obstacles/world_11_obstacle_capsula_biotech.png",
          "funcion": "Cápsula biotecnológica translúcida; núcleo brillante."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_11/obstacles/world_11_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "espina_flotante",
          "path": "assets/world_11/obstacles/world_11_obstacle_espina_flotante.png",
          "funcion": "Espina biológica flotante; peligro pasivo."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_11/obstacles/world_11_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_11/obstacles/world_11_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        },
        {
          "name": "restos_organicos",
          "path": "assets/world_11/obstacles/world_11_obstacle_restos_organicos.png",
          "funcion": "Restos alienígenas orgánicos; pulsan suavemente."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_11/powerups/world_11_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_11/powerups/world_11_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_11/powerups/world_11_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_11/backgrounds/world_11_bg_base.jpg",
        "intense": "assets/world_11/backgrounds/world_11_bg_intenso.jpg",
        "boss": "assets/world_11/backgrounds/world_11_bg_jefe.jpg",
        "far": "assets/world_11/backgrounds/world_11_bg_base_capa_lejos.png",
        "near": "assets/world_11/backgrounds/world_11_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 12,
      "key": "world_12",
      "label": "Mundo 12",
      "sector": "Cúpula de Ceniza",
      "bossName": "Ashen Overmind",
      "family": "Supramente de ceniza: bóveda craneal, tentáculos de hollín, brasas bajo gris.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#ff7c3c",
        "neon_b": "#c8c8d8",
        "core": "#ffa05c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_12/minions/world_12_minion_swarmer.png",
          "variant": "assets/world_12/minions/world_12_minion_swarmer_elite.png",
          "sheet": "assets/world_12/minions/world_12_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_12/minions/world_12_minion_stinger.png",
          "variant": "assets/world_12/minions/world_12_minion_stinger_danado.png",
          "sheet": "assets/world_12/minions/world_12_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_12/minions/world_12_minion_hunter.png",
          "variant": "assets/world_12/minions/world_12_minion_hunter_elite.png",
          "sheet": "assets/world_12/minions/world_12_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_12/minions/world_12_minion_sentinel.png",
          "variant": "assets/world_12/minions/world_12_minion_sentinel_danado.png",
          "sheet": "assets/world_12/minions/world_12_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_12/minions/world_12_minion_spitter.png",
          "variant": "assets/world_12/minions/world_12_minion_spitter_elite.png",
          "sheet": "assets/world_12/minions/world_12_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_12/minions/world_12_minion_phantom.png",
          "variant": "assets/world_12/minions/world_12_minion_phantom_danado.png",
          "sheet": "assets/world_12/minions/world_12_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_12/subbosses/world_12_subboss_a_ofensivo.png",
          "sheet": "assets/world_12/subbosses/world_12_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_12/subbosses/world_12_subboss_b_tactico.png",
          "sheet": "assets/world_12/subbosses/world_12_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_12/boss/world_12_boss_ashen_overmind_fase1.png",
          "assets/world_12/boss/world_12_boss_ashen_overmind_fase2.png",
          "assets/world_12/boss/world_12_boss_ashen_overmind_fase3.png",
          "assets/world_12/boss/world_12_boss_ashen_overmind_fase4.png"
        ],
        "coreOpen": "assets/world_12/boss/world_12_boss_ashen_overmind_nucleo_abierto.png",
        "animSheet": "assets/world_12/boss/world_12_boss_ashen_overmind_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_12/boss/world_12_boss_ashen_overmind_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_12/boss/world_12_reliquia_ashen_overmind.png",
        "relicFloat": "assets/world_12/boss/world_12_reliquia_ashen_overmind_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_12/boss/world_12_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "bola_ceniza",
          "base": "assets/world_12/projectiles/world_12_projectile_bola_ceniza.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_bola_ceniza_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: bola ceniza (tipo orb)."
        },
        {
          "name": "brasa_mental",
          "base": "assets/world_12/projectiles/world_12_projectile_brasa_mental.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_brasa_mental_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: brasa mental (tipo bolt)."
        },
        {
          "name": "ceniza_buscadora",
          "base": "assets/world_12/projectiles/world_12_projectile_ceniza_buscadora.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_ceniza_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: ceniza buscadora (tipo seeker)."
        },
        {
          "name": "onda_psiquica",
          "base": "assets/world_12/projectiles/world_12_projectile_onda_psiquica.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_onda_psiquica_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: onda psiquica (tipo ring)."
        },
        {
          "name": "soplo_volcanico",
          "base": "assets/world_12/projectiles/world_12_projectile_soplo_volcanico.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_soplo_volcanico_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: soplo volcanico (tipo wave)."
        },
        {
          "name": "subboss_a_brasa_mental",
          "base": "assets/world_12/projectiles/world_12_projectile_subboss_a_brasa_mental.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_subboss_a_brasa_mental_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: brasa mental."
        },
        {
          "name": "subboss_b_ceniza_buscadora",
          "base": "assets/world_12/projectiles/world_12_projectile_subboss_b_ceniza_buscadora.png",
          "sheet": "assets/world_12/projectiles/world_12_projectile_subboss_b_ceniza_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: ceniza buscadora."
        }
      ],
      "obstacles": [
        {
          "name": "anillo_roto",
          "path": "assets/world_12/obstacles/world_12_obstacle_anillo_roto.png",
          "funcion": "Anillo ritual roto; arco giratorio."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_12/obstacles/world_12_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "columna_antigua",
          "path": "assets/world_12/obstacles/world_12_obstacle_columna_antigua.png",
          "funcion": "Columna de civilización perdida; glifos tenues."
        },
        {
          "name": "monolito_movil",
          "path": "assets/world_12/obstacles/world_12_obstacle_monolito_movil.png",
          "funcion": "Monolito móvil con glifos; defensa pesada."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_12/obstacles/world_12_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_12/obstacles/world_12_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_12/powerups/world_12_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_12/powerups/world_12_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_12/powerups/world_12_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_12/backgrounds/world_12_bg_base.jpg",
        "intense": "assets/world_12/backgrounds/world_12_bg_intenso.jpg",
        "boss": "assets/world_12/backgrounds/world_12_bg_jefe.jpg",
        "far": "assets/world_12/backgrounds/world_12_bg_base_capa_lejos.png",
        "near": "assets/world_12/backgrounds/world_12_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 13,
      "key": "world_13",
      "label": "Mundo 13",
      "sector": "Jardín Tóxico",
      "bossName": "Spore Empress",
      "family": "Emperatriz de esporas: pétalos carnívoros, bolsas de polen, belleza letal verde-rosa.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#7cff3c",
        "neon_b": "#ff6bd8",
        "core": "#a8ff5c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_13/minions/world_13_minion_swarmer.png",
          "variant": "assets/world_13/minions/world_13_minion_swarmer_danado.png",
          "sheet": "assets/world_13/minions/world_13_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_13/minions/world_13_minion_stinger.png",
          "variant": "assets/world_13/minions/world_13_minion_stinger_elite.png",
          "sheet": "assets/world_13/minions/world_13_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_13/minions/world_13_minion_hunter.png",
          "variant": "assets/world_13/minions/world_13_minion_hunter_danado.png",
          "sheet": "assets/world_13/minions/world_13_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_13/minions/world_13_minion_sentinel.png",
          "variant": "assets/world_13/minions/world_13_minion_sentinel_elite.png",
          "sheet": "assets/world_13/minions/world_13_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_13/minions/world_13_minion_spitter.png",
          "variant": "assets/world_13/minions/world_13_minion_spitter_danado.png",
          "sheet": "assets/world_13/minions/world_13_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_13/minions/world_13_minion_phantom.png",
          "variant": "assets/world_13/minions/world_13_minion_phantom_elite.png",
          "sheet": "assets/world_13/minions/world_13_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_13/subbosses/world_13_subboss_a_ofensivo.png",
          "sheet": "assets/world_13/subbosses/world_13_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_13/subbosses/world_13_subboss_b_tactico.png",
          "sheet": "assets/world_13/subbosses/world_13_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_13/boss/world_13_boss_spore_empress_fase1.png",
          "assets/world_13/boss/world_13_boss_spore_empress_fase2.png",
          "assets/world_13/boss/world_13_boss_spore_empress_fase3.png",
          "assets/world_13/boss/world_13_boss_spore_empress_fase4.png"
        ],
        "coreOpen": "assets/world_13/boss/world_13_boss_spore_empress_nucleo_abierto.png",
        "animSheet": "assets/world_13/boss/world_13_boss_spore_empress_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_13/boss/world_13_boss_spore_empress_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_13/boss/world_13_reliquia_spore_empress.png",
        "relicFloat": "assets/world_13/boss/world_13_reliquia_spore_empress_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_13/boss/world_13_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "corola_pulso",
          "base": "assets/world_13/projectiles/world_13_projectile_corola_pulso.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_corola_pulso_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: corola pulso (tipo ring)."
        },
        {
          "name": "espora_buscadora",
          "base": "assets/world_13/projectiles/world_13_projectile_espora_buscadora.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_espora_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: espora buscadora (tipo egg)."
        },
        {
          "name": "petalo_lacerante",
          "base": "assets/world_13/projectiles/world_13_projectile_petalo_lacerante.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_petalo_lacerante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: petalo lacerante (tipo petal)."
        },
        {
          "name": "polen_toxico",
          "base": "assets/world_13/projectiles/world_13_projectile_polen_toxico.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_polen_toxico_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: polen toxico (tipo orb)."
        },
        {
          "name": "rafaga_jardin",
          "base": "assets/world_13/projectiles/world_13_projectile_rafaga_jardin.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_rafaga_jardin_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: rafaga jardin (tipo wave)."
        },
        {
          "name": "subboss_a_polen_toxico",
          "base": "assets/world_13/projectiles/world_13_projectile_subboss_a_polen_toxico.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_subboss_a_polen_toxico_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: polen toxico."
        },
        {
          "name": "subboss_b_rafaga_jardin",
          "base": "assets/world_13/projectiles/world_13_projectile_subboss_b_rafaga_jardin.png",
          "sheet": "assets/world_13/projectiles/world_13_projectile_subboss_b_rafaga_jardin_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: rafaga jardin."
        }
      ],
      "obstacles": [
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_13/obstacles/world_13_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "meteor",
          "path": "assets/world_13/obstacles/world_13_obstacle_meteor.png",
          "funcion": "Metoro giratorio destruible; gira lentamente (usa la hoja de 8 frames)."
        },
        {
          "name": "meteor_fracturado",
          "path": "assets/world_13/obstacles/world_13_obstacle_meteor_fracturado.png",
          "funcion": "Roca defensora fracturada; cubierta parcial, gira poco."
        },
        {
          "name": "meteor_sheet_giro",
          "path": "assets/world_13/obstacles/world_13_obstacle_meteor_sheet_giro.png",
          "funcion": "Giro del meteoro (8 frames, loop)."
        },
        {
          "name": "microasteroide",
          "path": "assets/world_13/obstacles/world_13_obstacle_microasteroide.png",
          "funcion": "Microasteroide lento; relleno de esquiva."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_13/obstacles/world_13_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_13/obstacles/world_13_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_13/powerups/world_13_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_13/powerups/world_13_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_13/powerups/world_13_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_13/backgrounds/world_13_bg_base.jpg",
        "intense": "assets/world_13/backgrounds/world_13_bg_intenso.jpg",
        "boss": "assets/world_13/backgrounds/world_13_bg_jefe.jpg",
        "far": "assets/world_13/backgrounds/world_13_bg_base_capa_lejos.png",
        "near": "assets/world_13/backgrounds/world_13_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 14,
      "key": "world_14",
      "label": "Mundo 14",
      "sector": "Ruinas del Imperio",
      "bossName": "Ancient Sentinel King",
      "family": "Rey centinela ancestral: monolitos, glifos dorados, armadura ceremonial teal.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#ffd83c",
        "neon_b": "#3cd8d0",
        "core": "#ffea8c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_14/minions/world_14_minion_swarmer.png",
          "variant": "assets/world_14/minions/world_14_minion_swarmer_elite.png",
          "sheet": "assets/world_14/minions/world_14_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_14/minions/world_14_minion_stinger.png",
          "variant": "assets/world_14/minions/world_14_minion_stinger_danado.png",
          "sheet": "assets/world_14/minions/world_14_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_14/minions/world_14_minion_hunter.png",
          "variant": "assets/world_14/minions/world_14_minion_hunter_elite.png",
          "sheet": "assets/world_14/minions/world_14_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_14/minions/world_14_minion_sentinel.png",
          "variant": "assets/world_14/minions/world_14_minion_sentinel_danado.png",
          "sheet": "assets/world_14/minions/world_14_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_14/minions/world_14_minion_spitter.png",
          "variant": "assets/world_14/minions/world_14_minion_spitter_elite.png",
          "sheet": "assets/world_14/minions/world_14_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_14/minions/world_14_minion_phantom.png",
          "variant": "assets/world_14/minions/world_14_minion_phantom_danado.png",
          "sheet": "assets/world_14/minions/world_14_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_14/subbosses/world_14_subboss_a_ofensivo.png",
          "sheet": "assets/world_14/subbosses/world_14_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_14/subbosses/world_14_subboss_b_tactico.png",
          "sheet": "assets/world_14/subbosses/world_14_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_14/boss/world_14_boss_ancient_sentinel_king_fase1.png",
          "assets/world_14/boss/world_14_boss_ancient_sentinel_king_fase2.png",
          "assets/world_14/boss/world_14_boss_ancient_sentinel_king_fase3.png",
          "assets/world_14/boss/world_14_boss_ancient_sentinel_king_fase4.png"
        ],
        "coreOpen": "assets/world_14/boss/world_14_boss_ancient_sentinel_king_nucleo_abierto.png",
        "animSheet": "assets/world_14/boss/world_14_boss_ancient_sentinel_king_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_14/boss/world_14_boss_ancient_sentinel_king_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_14/boss/world_14_reliquia_ancient_sentinel_king.png",
        "relicFloat": "assets/world_14/boss/world_14_reliquia_ancient_sentinel_king_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_14/boss/world_14_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "fragmento_monolito",
          "base": "assets/world_14/projectiles/world_14_projectile_fragmento_monolito.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_fragmento_monolito_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: fragmento monolito (tipo shard)."
        },
        {
          "name": "haz_juicio",
          "base": "assets/world_14/projectiles/world_14_projectile_haz_juicio.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_haz_juicio_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz juicio (tipo beamseg)."
        },
        {
          "name": "lanza_realeza",
          "base": "assets/world_14/projectiles/world_14_projectile_lanza_realeza.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_lanza_realeza_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: lanza realeza (tipo lance)."
        },
        {
          "name": "orbe_decreto",
          "base": "assets/world_14/projectiles/world_14_projectile_orbe_decreto.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_orbe_decreto_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: orbe decreto (tipo orb)."
        },
        {
          "name": "sello_ancestral",
          "base": "assets/world_14/projectiles/world_14_projectile_sello_ancestral.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_sello_ancestral_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: sello ancestral (tipo ring)."
        },
        {
          "name": "subboss_a_orbe_decreto",
          "base": "assets/world_14/projectiles/world_14_projectile_subboss_a_orbe_decreto.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_subboss_a_orbe_decreto_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: orbe decreto."
        },
        {
          "name": "subboss_b_haz_juicio",
          "base": "assets/world_14/projectiles/world_14_projectile_subboss_b_haz_juicio.png",
          "sheet": "assets/world_14/projectiles/world_14_projectile_subboss_b_haz_juicio_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: haz juicio."
        }
      ],
      "obstacles": [
        {
          "name": "chatarra_espacial",
          "path": "assets/world_14/obstacles/world_14_obstacle_chatarra_espacial.png",
          "funcion": "Chatarra espacial humana móvil; obstáculo de bloqueo."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_14/obstacles/world_14_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "fragmento_satelite",
          "path": "assets/world_14/obstacles/world_14_obstacle_fragmento_satelite.png",
          "funcion": "Fragmento de satélite con paneles; giro lento."
        },
        {
          "name": "placa_casco",
          "path": "assets/world_14/obstacles/world_14_obstacle_placa_casco.png",
          "funcion": "Placa de casco nave humana; cobertura utilitaria."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_14/obstacles/world_14_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_14/obstacles/world_14_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_14/powerups/world_14_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_14/powerups/world_14_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_14/powerups/world_14_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_14/backgrounds/world_14_bg_base.jpg",
        "intense": "assets/world_14/backgrounds/world_14_bg_intenso.jpg",
        "boss": "assets/world_14/backgrounds/world_14_bg_jefe.jpg",
        "far": "assets/world_14/backgrounds/world_14_bg_base_capa_lejos.png",
        "near": "assets/world_14/backgrounds/world_14_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 15,
      "key": "world_15",
      "label": "Mundo 15",
      "sector": "Talleres del Vacío",
      "bossName": "Mecha Brood Sovereign",
      "family": "Soberana de cría mecatronicada: matrices de drones, sierras, engranajes vivos. REVIVE.",
      "phases": 4,
      "renace": true,
      "palette": {
        "neon_a": "#5cff9c",
        "neon_b": "#ffbc2e",
        "core": "#7cffb8"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_15/minions/world_15_minion_swarmer.png",
          "variant": "assets/world_15/minions/world_15_minion_swarmer_danado.png",
          "sheet": "assets/world_15/minions/world_15_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_15/minions/world_15_minion_stinger.png",
          "variant": "assets/world_15/minions/world_15_minion_stinger_elite.png",
          "sheet": "assets/world_15/minions/world_15_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_15/minions/world_15_minion_hunter.png",
          "variant": "assets/world_15/minions/world_15_minion_hunter_danado.png",
          "sheet": "assets/world_15/minions/world_15_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_15/minions/world_15_minion_sentinel.png",
          "variant": "assets/world_15/minions/world_15_minion_sentinel_elite.png",
          "sheet": "assets/world_15/minions/world_15_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_15/minions/world_15_minion_spitter.png",
          "variant": "assets/world_15/minions/world_15_minion_spitter_danado.png",
          "sheet": "assets/world_15/minions/world_15_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_15/minions/world_15_minion_phantom.png",
          "variant": "assets/world_15/minions/world_15_minion_phantom_elite.png",
          "sheet": "assets/world_15/minions/world_15_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_15/subbosses/world_15_subboss_a_ofensivo.png",
          "sheet": "assets/world_15/subbosses/world_15_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_15/subbosses/world_15_subboss_b_tactico.png",
          "sheet": "assets/world_15/subbosses/world_15_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_fase1.png",
          "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_fase2.png",
          "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_fase3.png",
          "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_fase4.png"
        ],
        "coreOpen": "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_nucleo_abierto.png",
        "animSheet": "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_15/boss/world_15_reliquia_mecha_brood_sovereign.png",
        "relicFloat": "assets/world_15/boss/world_15_reliquia_mecha_brood_sovereign_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_15/boss/world_15_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": "assets/world_15/boss/world_15_boss_mecha_brood_sovereign_renacido.png"
      },
      "projectiles": [
        {
          "name": "dron_sierra",
          "base": "assets/world_15/projectiles/world_15_projectile_dron_sierra.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_dron_sierra_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: dron sierra (tipo drone)."
        },
        {
          "name": "haz_soldadura",
          "base": "assets/world_15/projectiles/world_15_projectile_haz_soldadura.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_haz_soldadura_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz soldadura (tipo beamseg)."
        },
        {
          "name": "nucleo_reactor",
          "base": "assets/world_15/projectiles/world_15_projectile_nucleo_reactor.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_nucleo_reactor_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: nucleo reactor (tipo orb)."
        },
        {
          "name": "onda_taller",
          "base": "assets/world_15/projectiles/world_15_projectile_onda_taller.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_onda_taller_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: onda taller (tipo ring)."
        },
        {
          "name": "remache_perforante",
          "base": "assets/world_15/projectiles/world_15_projectile_remache_perforante.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_remache_perforante_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: remache perforante (tipo bolt)."
        },
        {
          "name": "subboss_a_nucleo_reactor",
          "base": "assets/world_15/projectiles/world_15_projectile_subboss_a_nucleo_reactor.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_subboss_a_nucleo_reactor_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: nucleo reactor."
        },
        {
          "name": "subboss_b_haz_soldadura",
          "base": "assets/world_15/projectiles/world_15_projectile_subboss_b_haz_soldadura.png",
          "sheet": "assets/world_15/projectiles/world_15_projectile_subboss_b_haz_soldadura_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: haz soldadura."
        }
      ],
      "obstacles": [
        {
          "name": "capsula_biotech",
          "path": "assets/world_15/obstacles/world_15_obstacle_capsula_biotech.png",
          "funcion": "Cápsula biotecnológica translúcida; núcleo brillante."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_15/obstacles/world_15_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "espina_flotante",
          "path": "assets/world_15/obstacles/world_15_obstacle_espina_flotante.png",
          "funcion": "Espina biológica flotante; peligro pasivo."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_15/obstacles/world_15_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_15/obstacles/world_15_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        },
        {
          "name": "restos_organicos",
          "path": "assets/world_15/obstacles/world_15_obstacle_restos_organicos.png",
          "funcion": "Restos alienígenas orgánicos; pulsan suavemente."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_15/powerups/world_15_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_15/powerups/world_15_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_15/powerups/world_15_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_15/backgrounds/world_15_bg_base.jpg",
        "intense": "assets/world_15/backgrounds/world_15_bg_intenso.jpg",
        "boss": "assets/world_15/backgrounds/world_15_bg_jefe.jpg",
        "far": "assets/world_15/backgrounds/world_15_bg_base_capa_lejos.png",
        "near": "assets/world_15/backgrounds/world_15_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 16,
      "key": "world_16",
      "label": "Mundo 16",
      "sector": "Tormenta Iónica",
      "bossName": "Ion Archon",
      "family": "Arconte de ionización: bobinas, arcos eléctricos, halo de tormenta permanente.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#3cc8ff",
        "neon_b": "#ffffff",
        "core": "#8ce8ff"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_16/minions/world_16_minion_swarmer.png",
          "variant": "assets/world_16/minions/world_16_minion_swarmer_elite.png",
          "sheet": "assets/world_16/minions/world_16_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_16/minions/world_16_minion_stinger.png",
          "variant": "assets/world_16/minions/world_16_minion_stinger_danado.png",
          "sheet": "assets/world_16/minions/world_16_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_16/minions/world_16_minion_hunter.png",
          "variant": "assets/world_16/minions/world_16_minion_hunter_elite.png",
          "sheet": "assets/world_16/minions/world_16_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_16/minions/world_16_minion_sentinel.png",
          "variant": "assets/world_16/minions/world_16_minion_sentinel_danado.png",
          "sheet": "assets/world_16/minions/world_16_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_16/minions/world_16_minion_spitter.png",
          "variant": "assets/world_16/minions/world_16_minion_spitter_elite.png",
          "sheet": "assets/world_16/minions/world_16_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_16/minions/world_16_minion_phantom.png",
          "variant": "assets/world_16/minions/world_16_minion_phantom_danado.png",
          "sheet": "assets/world_16/minions/world_16_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_16/subbosses/world_16_subboss_a_ofensivo.png",
          "sheet": "assets/world_16/subbosses/world_16_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_16/subbosses/world_16_subboss_b_tactico.png",
          "sheet": "assets/world_16/subbosses/world_16_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_16/boss/world_16_boss_ion_archon_fase1.png",
          "assets/world_16/boss/world_16_boss_ion_archon_fase2.png",
          "assets/world_16/boss/world_16_boss_ion_archon_fase3.png",
          "assets/world_16/boss/world_16_boss_ion_archon_fase4.png"
        ],
        "coreOpen": "assets/world_16/boss/world_16_boss_ion_archon_nucleo_abierto.png",
        "animSheet": "assets/world_16/boss/world_16_boss_ion_archon_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_16/boss/world_16_boss_ion_archon_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_16/boss/world_16_reliquia_ion_archon.png",
        "relicFloat": "assets/world_16/boss/world_16_reliquia_ion_archon_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_16/boss/world_16_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "bola_tempestad",
          "base": "assets/world_16/projectiles/world_16_projectile_bola_tempestad.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_bola_tempestad_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: bola tempestad (tipo orb)."
        },
        {
          "name": "dardo_ionico",
          "base": "assets/world_16/projectiles/world_16_projectile_dardo_ionico.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_dardo_ionico_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: dardo ionico (tipo bolt)."
        },
        {
          "name": "onda_em",
          "base": "assets/world_16/projectiles/world_16_projectile_onda_em.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_onda_em_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: onda em (tipo wave)."
        },
        {
          "name": "rayo_arconte",
          "base": "assets/world_16/projectiles/world_16_projectile_rayo_arconte.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_rayo_arconte_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: rayo arconte (tipo beamseg)."
        },
        {
          "name": "subboss_a_bola_tempestad",
          "base": "assets/world_16/projectiles/world_16_projectile_subboss_a_bola_tempestad.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_subboss_a_bola_tempestad_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: bola tempestad."
        },
        {
          "name": "subboss_b_rayo_arconte",
          "base": "assets/world_16/projectiles/world_16_projectile_subboss_b_rayo_arconte.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_subboss_b_rayo_arconte_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: rayo arconte."
        },
        {
          "name": "torbellino_carga",
          "base": "assets/world_16/projectiles/world_16_projectile_torbellino_carga.png",
          "sheet": "assets/world_16/projectiles/world_16_projectile_torbellino_carga_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: torbellino carga (tipo ring)."
        }
      ],
      "obstacles": [
        {
          "name": "anillo_roto",
          "path": "assets/world_16/obstacles/world_16_obstacle_anillo_roto.png",
          "funcion": "Anillo ritual roto; arco giratorio."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_16/obstacles/world_16_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "columna_antigua",
          "path": "assets/world_16/obstacles/world_16_obstacle_columna_antigua.png",
          "funcion": "Columna de civilización perdida; glifos tenues."
        },
        {
          "name": "monolito_movil",
          "path": "assets/world_16/obstacles/world_16_obstacle_monolito_movil.png",
          "funcion": "Monolito móvil con glifos; defensa pesada."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_16/obstacles/world_16_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_16/obstacles/world_16_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_16/powerups/world_16_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_16/powerups/world_16_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_16/powerups/world_16_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_16/backgrounds/world_16_bg_base.jpg",
        "intense": "assets/world_16/backgrounds/world_16_bg_intenso.jpg",
        "boss": "assets/world_16/backgrounds/world_16_bg_jefe.jpg",
        "far": "assets/world_16/backgrounds/world_16_bg_base_capa_lejos.png",
        "near": "assets/world_16/backgrounds/world_16_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 17,
      "key": "world_17",
      "label": "Mundo 17",
      "sector": "Océano de Antimateria",
      "bossName": "Abyssal Rift Queen",
      "family": "Reina de la grieta abisal: señuelo de anguila, aletas-rasgo, presión abisal violeta-aqua.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#4dffe0",
        "neon_b": "#9d74ff",
        "core": "#8cfff0"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_17/minions/world_17_minion_swarmer.png",
          "variant": "assets/world_17/minions/world_17_minion_swarmer_danado.png",
          "sheet": "assets/world_17/minions/world_17_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_17/minions/world_17_minion_stinger.png",
          "variant": "assets/world_17/minions/world_17_minion_stinger_elite.png",
          "sheet": "assets/world_17/minions/world_17_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_17/minions/world_17_minion_hunter.png",
          "variant": "assets/world_17/minions/world_17_minion_hunter_danado.png",
          "sheet": "assets/world_17/minions/world_17_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_17/minions/world_17_minion_sentinel.png",
          "variant": "assets/world_17/minions/world_17_minion_sentinel_elite.png",
          "sheet": "assets/world_17/minions/world_17_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_17/minions/world_17_minion_spitter.png",
          "variant": "assets/world_17/minions/world_17_minion_spitter_danado.png",
          "sheet": "assets/world_17/minions/world_17_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_17/minions/world_17_minion_phantom.png",
          "variant": "assets/world_17/minions/world_17_minion_phantom_elite.png",
          "sheet": "assets/world_17/minions/world_17_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_17/subbosses/world_17_subboss_a_ofensivo.png",
          "sheet": "assets/world_17/subbosses/world_17_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_17/subbosses/world_17_subboss_b_tactico.png",
          "sheet": "assets/world_17/subbosses/world_17_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_17/boss/world_17_boss_abyssal_rift_queen_fase1.png",
          "assets/world_17/boss/world_17_boss_abyssal_rift_queen_fase2.png",
          "assets/world_17/boss/world_17_boss_abyssal_rift_queen_fase3.png",
          "assets/world_17/boss/world_17_boss_abyssal_rift_queen_fase4.png"
        ],
        "coreOpen": "assets/world_17/boss/world_17_boss_abyssal_rift_queen_nucleo_abierto.png",
        "animSheet": "assets/world_17/boss/world_17_boss_abyssal_rift_queen_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_17/boss/world_17_boss_abyssal_rift_queen_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_17/boss/world_17_reliquia_abyssal_rift_queen.png",
        "relicFloat": "assets/world_17/boss/world_17_reliquia_abyssal_rift_queen_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_17/boss/world_17_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "burbuja_antimateria",
          "base": "assets/world_17/projectiles/world_17_projectile_burbuja_antimateria.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_burbuja_antimateria_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: burbuja antimateria (tipo orb)."
        },
        {
          "name": "colapso_profundo",
          "base": "assets/world_17/projectiles/world_17_projectile_colapso_profundo.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_colapso_profundo_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: colapso profundo (tipo ring)."
        },
        {
          "name": "haz_presion",
          "base": "assets/world_17/projectiles/world_17_projectile_haz_presion.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_haz_presion_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz presion (tipo beamseg)."
        },
        {
          "name": "marejada_rift",
          "base": "assets/world_17/projectiles/world_17_projectile_marejada_rift.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_marejada_rift_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: marejada rift (tipo wave)."
        },
        {
          "name": "rapana_buscadora",
          "base": "assets/world_17/projectiles/world_17_projectile_rapana_buscadora.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_rapana_buscadora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: rapana buscadora (tipo seeker)."
        },
        {
          "name": "subboss_a_marejada_rift",
          "base": "assets/world_17/projectiles/world_17_projectile_subboss_a_marejada_rift.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_subboss_a_marejada_rift_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: marejada rift."
        },
        {
          "name": "subboss_b_haz_presion",
          "base": "assets/world_17/projectiles/world_17_projectile_subboss_b_haz_presion.png",
          "sheet": "assets/world_17/projectiles/world_17_projectile_subboss_b_haz_presion_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: haz presion."
        }
      ],
      "obstacles": [
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_17/obstacles/world_17_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "meteor",
          "path": "assets/world_17/obstacles/world_17_obstacle_meteor.png",
          "funcion": "Metoro giratorio destruible; gira lentamente (usa la hoja de 8 frames)."
        },
        {
          "name": "meteor_fracturado",
          "path": "assets/world_17/obstacles/world_17_obstacle_meteor_fracturado.png",
          "funcion": "Roca defensora fracturada; cubierta parcial, gira poco."
        },
        {
          "name": "meteor_sheet_giro",
          "path": "assets/world_17/obstacles/world_17_obstacle_meteor_sheet_giro.png",
          "funcion": "Giro del meteoro (8 frames, loop)."
        },
        {
          "name": "microasteroide",
          "path": "assets/world_17/obstacles/world_17_obstacle_microasteroide.png",
          "funcion": "Microasteroide lento; relleno de esquiva."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_17/obstacles/world_17_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_17/obstacles/world_17_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_17/powerups/world_17_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_17/powerups/world_17_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_17/powerups/world_17_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_17/backgrounds/world_17_bg_base.jpg",
        "intense": "assets/world_17/backgrounds/world_17_bg_intenso.jpg",
        "boss": "assets/world_17/backgrounds/world_17_bg_jefe.jpg",
        "far": "assets/world_17/backgrounds/world_17_bg_base_capa_lejos.png",
        "near": "assets/world_17/backgrounds/world_17_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 18,
      "key": "world_18",
      "label": "Mundo 18",
      "sector": "Pira Solar",
      "bossName": "Phoenix Singularity",
      "family": "Fenix singular: alas de fuego estelar, corona solar, renacimiento de ceniza. REVIVE.",
      "phases": 4,
      "renace": true,
      "palette": {
        "neon_a": "#ffb02e",
        "neon_b": "#fff3c8",
        "core": "#ffd85c"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_18/minions/world_18_minion_swarmer.png",
          "variant": "assets/world_18/minions/world_18_minion_swarmer_elite.png",
          "sheet": "assets/world_18/minions/world_18_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_18/minions/world_18_minion_stinger.png",
          "variant": "assets/world_18/minions/world_18_minion_stinger_danado.png",
          "sheet": "assets/world_18/minions/world_18_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_18/minions/world_18_minion_hunter.png",
          "variant": "assets/world_18/minions/world_18_minion_hunter_elite.png",
          "sheet": "assets/world_18/minions/world_18_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_18/minions/world_18_minion_sentinel.png",
          "variant": "assets/world_18/minions/world_18_minion_sentinel_danado.png",
          "sheet": "assets/world_18/minions/world_18_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_18/minions/world_18_minion_spitter.png",
          "variant": "assets/world_18/minions/world_18_minion_spitter_elite.png",
          "sheet": "assets/world_18/minions/world_18_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_18/minions/world_18_minion_phantom.png",
          "variant": "assets/world_18/minions/world_18_minion_phantom_danado.png",
          "sheet": "assets/world_18/minions/world_18_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_18/subbosses/world_18_subboss_a_ofensivo.png",
          "sheet": "assets/world_18/subbosses/world_18_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_18/subbosses/world_18_subboss_b_tactico.png",
          "sheet": "assets/world_18/subbosses/world_18_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_18/boss/world_18_boss_phoenix_singularity_fase1.png",
          "assets/world_18/boss/world_18_boss_phoenix_singularity_fase2.png",
          "assets/world_18/boss/world_18_boss_phoenix_singularity_fase3.png",
          "assets/world_18/boss/world_18_boss_phoenix_singularity_fase4.png"
        ],
        "coreOpen": "assets/world_18/boss/world_18_boss_phoenix_singularity_nucleo_abierto.png",
        "animSheet": "assets/world_18/boss/world_18_boss_phoenix_singularity_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_18/boss/world_18_boss_phoenix_singularity_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_18/boss/world_18_reliquia_phoenix_singularity.png",
        "relicFloat": "assets/world_18/boss/world_18_reliquia_phoenix_singularity_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_18/boss/world_18_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": "assets/world_18/boss/world_18_boss_phoenix_singularity_renacido.png"
      },
      "projectiles": [
        {
          "name": "corona_ardiente",
          "base": "assets/world_18/projectiles/world_18_projectile_corona_ardiente.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_corona_ardiente_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: corona ardiente (tipo ring)."
        },
        {
          "name": "granula_solar",
          "base": "assets/world_18/projectiles/world_18_projectile_granula_solar.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_granula_solar_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: granula solar (tipo orb)."
        },
        {
          "name": "haz_fotosfera",
          "base": "assets/world_18/projectiles/world_18_projectile_haz_fotosfera.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_haz_fotosfera_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz fotosfera (tipo beamseg)."
        },
        {
          "name": "llamarada_pira",
          "base": "assets/world_18/projectiles/world_18_projectile_llamarada_pira.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_llamarada_pira_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: llamarada pira (tipo wave)."
        },
        {
          "name": "pluma_incandescente",
          "base": "assets/world_18/projectiles/world_18_projectile_pluma_incandescente.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_pluma_incandescente_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: pluma incandescente (tipo feather)."
        },
        {
          "name": "subboss_a_llamarada_pira",
          "base": "assets/world_18/projectiles/world_18_projectile_subboss_a_llamarada_pira.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_subboss_a_llamarada_pira_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: llamarada pira."
        },
        {
          "name": "subboss_b_haz_fotosfera",
          "base": "assets/world_18/projectiles/world_18_projectile_subboss_b_haz_fotosfera.png",
          "sheet": "assets/world_18/projectiles/world_18_projectile_subboss_b_haz_fotosfera_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: haz fotosfera."
        }
      ],
      "obstacles": [
        {
          "name": "chatarra_espacial",
          "path": "assets/world_18/obstacles/world_18_obstacle_chatarra_espacial.png",
          "funcion": "Chatarra espacial humana móvil; obstáculo de bloqueo."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_18/obstacles/world_18_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "fragmento_satelite",
          "path": "assets/world_18/obstacles/world_18_obstacle_fragmento_satelite.png",
          "funcion": "Fragmento de satélite con paneles; giro lento."
        },
        {
          "name": "placa_casco",
          "path": "assets/world_18/obstacles/world_18_obstacle_placa_casco.png",
          "funcion": "Placa de casco nave humana; cobertura utilitaria."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_18/obstacles/world_18_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_18/obstacles/world_18_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_18/powerups/world_18_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_18/powerups/world_18_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_18/powerups/world_18_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_18/backgrounds/world_18_bg_base.jpg",
        "intense": "assets/world_18/backgrounds/world_18_bg_intenso.jpg",
        "boss": "assets/world_18/backgrounds/world_18_bg_jefe.jpg",
        "far": "assets/world_18/backgrounds/world_18_bg_base_capa_lejos.png",
        "near": "assets/world_18/backgrounds/world_18_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 19,
      "key": "world_19",
      "label": "Mundo 19",
      "sector": "Convergencia de Portales",
      "bossName": "Multiform Nexus",
      "family": "Nexo multiforme: anillos-portal, facetas cambiantes, ecos de todas las familias.",
      "phases": 4,
      "renace": false,
      "palette": {
        "neon_a": "#5d8eff",
        "neon_b": "#ff6396",
        "core": "#8ca8ff"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_19/minions/world_19_minion_swarmer.png",
          "variant": "assets/world_19/minions/world_19_minion_swarmer_danado.png",
          "sheet": "assets/world_19/minions/world_19_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_19/minions/world_19_minion_stinger.png",
          "variant": "assets/world_19/minions/world_19_minion_stinger_elite.png",
          "sheet": "assets/world_19/minions/world_19_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_19/minions/world_19_minion_hunter.png",
          "variant": "assets/world_19/minions/world_19_minion_hunter_danado.png",
          "sheet": "assets/world_19/minions/world_19_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_19/minions/world_19_minion_sentinel.png",
          "variant": "assets/world_19/minions/world_19_minion_sentinel_elite.png",
          "sheet": "assets/world_19/minions/world_19_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_19/minions/world_19_minion_spitter.png",
          "variant": "assets/world_19/minions/world_19_minion_spitter_danado.png",
          "sheet": "assets/world_19/minions/world_19_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_19/minions/world_19_minion_phantom.png",
          "variant": "assets/world_19/minions/world_19_minion_phantom_elite.png",
          "sheet": "assets/world_19/minions/world_19_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_19/subbosses/world_19_subboss_a_ofensivo.png",
          "sheet": "assets/world_19/subbosses/world_19_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_19/subbosses/world_19_subboss_b_tactico.png",
          "sheet": "assets/world_19/subbosses/world_19_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_19/boss/world_19_boss_multiform_nexus_fase1.png",
          "assets/world_19/boss/world_19_boss_multiform_nexus_fase2.png",
          "assets/world_19/boss/world_19_boss_multiform_nexus_fase3.png",
          "assets/world_19/boss/world_19_boss_multiform_nexus_fase4.png"
        ],
        "coreOpen": "assets/world_19/boss/world_19_boss_multiform_nexus_nucleo_abierto.png",
        "animSheet": "assets/world_19/boss/world_19_boss_multiform_nexus_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_19/boss/world_19_boss_multiform_nexus_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_19/boss/world_19_reliquia_multiform_nexus.png",
        "relicFloat": "assets/world_19/boss/world_19_reliquia_multiform_nexus_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_19/boss/world_19_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": null
      },
      "projectiles": [
        {
          "name": "eco_desplazado",
          "base": "assets/world_19/projectiles/world_19_projectile_eco_desplazado.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_eco_desplazado_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: eco desplazado (tipo seeker)."
        },
        {
          "name": "eco_multiforme",
          "base": "assets/world_19/projectiles/world_19_projectile_eco_multiforme.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_eco_multiforme_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: eco multiforme (tipo orb)."
        },
        {
          "name": "fragmento_dimension",
          "base": "assets/world_19/projectiles/world_19_projectile_fragmento_dimension.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_fragmento_dimension_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: fragmento dimension (tipo shard)."
        },
        {
          "name": "haz_convergencia",
          "base": "assets/world_19/projectiles/world_19_projectile_haz_convergencia.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_haz_convergencia_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz convergencia (tipo beamseg)."
        },
        {
          "name": "portal_abierto",
          "base": "assets/world_19/projectiles/world_19_projectile_portal_abierto.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_portal_abierto_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: portal abierto (tipo ring)."
        },
        {
          "name": "subboss_a_fragmento_dimension",
          "base": "assets/world_19/projectiles/world_19_projectile_subboss_a_fragmento_dimension.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_subboss_a_fragmento_dimension_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: fragmento dimension."
        },
        {
          "name": "subboss_b_haz_convergencia",
          "base": "assets/world_19/projectiles/world_19_projectile_subboss_b_haz_convergencia.png",
          "sheet": "assets/world_19/projectiles/world_19_projectile_subboss_b_haz_convergencia_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: haz convergencia."
        }
      ],
      "obstacles": [
        {
          "name": "capsula_biotech",
          "path": "assets/world_19/obstacles/world_19_obstacle_capsula_biotech.png",
          "funcion": "Cápsula biotecnológica translúcida; núcleo brillante."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_19/obstacles/world_19_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "espina_flotante",
          "path": "assets/world_19/obstacles/world_19_obstacle_espina_flotante.png",
          "funcion": "Espina biológica flotante; peligro pasivo."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_19/obstacles/world_19_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_19/obstacles/world_19_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        },
        {
          "name": "restos_organicos",
          "path": "assets/world_19/obstacles/world_19_obstacle_restos_organicos.png",
          "funcion": "Restos alienígenas orgánicos; pulsan suavemente."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_19/powerups/world_19_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_19/powerups/world_19_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_19/powerups/world_19_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_19/backgrounds/world_19_bg_base.jpg",
        "intense": "assets/world_19/backgrounds/world_19_bg_intenso.jpg",
        "boss": "assets/world_19/backgrounds/world_19_bg_jefe.jpg",
        "far": "assets/world_19/backgrounds/world_19_bg_base_capa_lejos.png",
        "near": "assets/world_19/backgrounds/world_19_bg_base_capa_cerca.png"
      }
    },
    {
      "id": 20,
      "key": "world_20",
      "label": "Mundo 20",
      "sector": "Frontera Final",
      "bossName": "Starfall Overlord",
      "family": "Señor de la Caída de Estrellas: síntesis de todas las familias, corona estelar, horror cósmicofinal.",
      "phases": 4,
      "renace": true,
      "palette": {
        "neon_a": "#ff5092",
        "neon_b": "#ffd23c",
        "core": "#ff8cc8"
      },
      "carryover": [
        "20% de esbirros menores heredados del mundo anterior",
        "1 subtipo especial heredado del mundo anterior"
      ],
      "progression": {
        "screen_1": "Presenta esbirros base de la nueva familia, formación simple, dificultad baja-media.",
        "screen_2": "Mezcla esbirros heredados del mundo anterior con nuevos esbirros y 1 subtipo especializado.",
        "screen_3": "Aumenta densidad, combina formaciones, introduce 1 subjefe y preserva algunos enemigos previos.",
        "boss_screen": "Jefe de zona con patrones únicos, posibilidad de 1 fase extra o resurrección selectiva en mundos avanzados."
      },
      "minions": {
        "swarmer": {
          "base": "assets/world_20/minions/world_20_minion_swarmer.png",
          "variant": "assets/world_20/minions/world_20_minion_swarmer_elite.png",
          "sheet": "assets/world_20/minions/world_20_minion_swarmer_sheet.png",
          "frames": 6,
          "funcion": "Esbirro swarmer: enjambre rápido, baja vida; animación de aleteo/pulsación."
        },
        "stinger": {
          "base": "assets/world_20/minions/world_20_minion_stinger.png",
          "variant": "assets/world_20/minions/world_20_minion_stinger_danado.png",
          "sheet": "assets/world_20/minions/world_20_minion_stinger_sheet.png",
          "frames": 6,
          "funcion": "Esbirro stinger: ataque en ráfaga, disparo punzante; animación de carga de núcleo."
        },
        "hunter": {
          "base": "assets/world_20/minions/world_20_minion_hunter.png",
          "variant": "assets/world_20/minions/world_20_minion_hunter_elite.png",
          "sheet": "assets/world_20/minions/world_20_minion_hunter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro hunter: zigzag ofensivo; animación de embestida."
        },
        "sentinel": {
          "base": "assets/world_20/minions/world_20_minion_sentinel.png",
          "variant": "assets/world_20/minions/world_20_minion_sentinel_danado.png",
          "sheet": "assets/world_20/minions/world_20_minion_sentinel_sheet.png",
          "frames": 8,
          "funcion": "Esbirro sentinel: protección/escudo rotativo; placas orbitando."
        },
        "spitter": {
          "base": "assets/world_20/minions/world_20_minion_spitter.png",
          "variant": "assets/world_20/minions/world_20_minion_spitter_elite.png",
          "sheet": "assets/world_20/minions/world_20_minion_spitter_sheet.png",
          "frames": 6,
          "funcion": "Esbirro spitter: disparo de plasma/veneno; garganta cargando."
        },
        "phantom": {
          "base": "assets/world_20/minions/world_20_minion_phantom.png",
          "variant": "assets/world_20/minions/world_20_minion_phantom_danado.png",
          "sheet": "assets/world_20/minions/world_20_minion_phantom_sheet.png",
          "frames": 6,
          "funcion": "Esbirro phantom: camuflaje/return; desvanecimiento y zarcillos."
        }
      },
      "minionRoles": [
        "swarmer",
        "stinger",
        "hunter",
        "sentinel",
        "spitter",
        "phantom"
      ],
      "subbosses": [
        {
          "id": "a",
          "base": "assets/world_20/subbosses/world_20_subboss_a_ofensivo.png",
          "sheet": "assets/world_20/subbosses/world_20_subboss_a_ofensivo_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Agente de Abanico (ofensivo): patrón radial/abanico."
        },
        {
          "id": "b",
          "base": "assets/world_20/subbosses/world_20_subboss_b_tactico.png",
          "sheet": "assets/world_20/subbosses/world_20_subboss_b_tactico_sheet.png",
          "frames": 8,
          "funcion": "Subjefe Táctico de Escudo (tactico): lanzas, invocación y control de área."
        }
      ],
      "boss": {
        "phases": [
          "assets/world_20/boss/world_20_boss_starfall_overlord_fase1.png",
          "assets/world_20/boss/world_20_boss_starfall_overlord_fase2.png",
          "assets/world_20/boss/world_20_boss_starfall_overlord_fase3.png",
          "assets/world_20/boss/world_20_boss_starfall_overlord_fase4.png"
        ],
        "coreOpen": "assets/world_20/boss/world_20_boss_starfall_overlord_nucleo_abierto.png",
        "animSheet": "assets/world_20/boss/world_20_boss_starfall_overlord_sheet_anim.png",
        "animFrames": 12,
        "deathSheet": "assets/world_20/boss/world_20_boss_starfall_overlord_sheet_muerte.png",
        "deathFrames": 8,
        "relic": "assets/world_20/boss/world_20_reliquia_starfall_overlord.png",
        "relicFloat": "assets/world_20/boss/world_20_reliquia_starfall_overlord_sheet_flotante.png",
        "relicFloatFrames": 8,
        "relicAttach": "assets/world_20/boss/world_20_reliquia_sheet_adherencia.png",
        "relicAttachFrames": 6,
        "reborn": "assets/world_20/boss/world_20_boss_starfall_overlord_renacido.png"
      },
      "projectiles": [
        {
          "name": "cometa_devorador",
          "base": "assets/world_20/projectiles/world_20_projectile_cometa_devorador.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_cometa_devorador_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: cometa devorador (tipo seeker)."
        },
        {
          "name": "estrella_cayente",
          "base": "assets/world_20/projectiles/world_20_projectile_estrella_cayente.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_estrella_cayente_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: estrella cayente (tipo orb)."
        },
        {
          "name": "haz_final",
          "base": "assets/world_20/projectiles/world_20_projectile_haz_final.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_haz_final_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: haz final (tipo beamseg)."
        },
        {
          "name": "lanza_aurora",
          "base": "assets/world_20/projectiles/world_20_projectile_lanza_aurora.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_lanza_aurora_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: lanza aurora (tipo lance)."
        },
        {
          "name": "pulso_supernova",
          "base": "assets/world_20/projectiles/world_20_projectile_pulso_supernova.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_pulso_supernova_sheet.png",
          "frames": 4,
          "funcion": "Proyectil del jefe: pulso supernova (tipo ring)."
        },
        {
          "name": "subboss_a_pulso_supernova",
          "base": "assets/world_20/projectiles/world_20_projectile_subboss_a_pulso_supernova.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_subboss_a_pulso_supernova_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe a: pulso supernova."
        },
        {
          "name": "subboss_b_cometa_devorador",
          "base": "assets/world_20/projectiles/world_20_projectile_subboss_b_cometa_devorador.png",
          "sheet": "assets/world_20/projectiles/world_20_projectile_subboss_b_cometa_devorador_sheet.png",
          "frames": 4,
          "funcion": "Proyectil propio del subjefe b: cometa devorador."
        }
      ],
      "obstacles": [
        {
          "name": "anillo_roto",
          "path": "assets/world_20/obstacles/world_20_obstacle_anillo_roto.png",
          "funcion": "Anillo ritual roto; arco giratorio."
        },
        {
          "name": "cobertura_defensiva",
          "path": "assets/world_20/obstacles/world_20_obstacle_cobertura_defensiva.png",
          "funcion": "Cobertura defensiva de energía translúcida (2 emisores + arco)."
        },
        {
          "name": "columna_antigua",
          "path": "assets/world_20/obstacles/world_20_obstacle_columna_antigua.png",
          "funcion": "Columna de civilización perdida; glifos tenues."
        },
        {
          "name": "monolito_movil",
          "path": "assets/world_20/obstacles/world_20_obstacle_monolito_movil.png",
          "funcion": "Monolito móvil con glifos; defensa pesada."
        },
        {
          "name": "restos_nave_alienigena",
          "path": "assets/world_20/obstacles/world_20_obstacle_restos_nave_alienigena.png",
          "funcion": "Restos de nave alienígena (casco curvo, venas luminosas)."
        },
        {
          "name": "restos_nave_humana",
          "path": "assets/world_20/obstacles/world_20_obstacle_restos_nave_humana.png",
          "funcion": "Restos de nave humana (fuselaje partido, cabina apagada)."
        }
      ],
      "powerups": [
        {
          "name": "arma_sector",
          "path": "assets/world_20/powerups/world_20_powerup_arma_sector.png",
          "funcion": "Cápsula de arma del sector (láser teñido del mundo)."
        },
        {
          "name": "defensa_sector",
          "path": "assets/world_20/powerups/world_20_powerup_defensa_sector.png",
          "funcion": "Cápsula de defensa del sector (escudo teñido)."
        },
        {
          "name": "soporte_sector",
          "path": "assets/world_20/powerups/world_20_powerup_soporte_sector.png",
          "funcion": "Cápsula de soporte del sector (vida/reparación teñida)."
        }
      ],
      "backgrounds": {
        "base": "assets/world_20/backgrounds/world_20_bg_base.jpg",
        "intense": "assets/world_20/backgrounds/world_20_bg_intenso.jpg",
        "boss": "assets/world_20/backgrounds/world_20_bg_jefe.jpg",
        "far": "assets/world_20/backgrounds/world_20_bg_base_capa_lejos.png",
        "near": "assets/world_20/backgrounds/world_20_bg_base_capa_cerca.png"
      }
    }
  ]
};

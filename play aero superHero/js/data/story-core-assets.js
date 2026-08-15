// F31 · Story Core integrado: Doctor Sombra/Aurora pendientes, Lanza Aurora final, naves y escenas.
window.AERO_STORY_CORE_MANIFEST = {
  "project": "Aero",
  "block": "Punto C - Story Core Assets",
  "generated_by": "Vector pipeline (SVG->PNG). Lanza Aurora entregada como arte final; Doctor Sombra y Princesa Aurora entregados como prompts de generacion (ver prompts/).",
  "style": "2D side-scroller, flat-shaded / semi-vector, cartoon game asset, siluetas fuertes, lectura a escala pequena.",
  "palette": {
    "lanza_aurora": [
      "dorado",
      "blanco brillante",
      "lila suave",
      "celeste energetico",
      "reflejos cristal solar"
    ],
    "doctor_sombra": [
      "negro",
      "gris carbon",
      "violeta oscuro",
      "magenta oscuro",
      "acentos rojo/purpura electrico"
    ],
    "princesa_aurora": [
      "blanco",
      "dorado suave",
      "lila",
      "rosado suave",
      "azul cielo / tonos aurora"
    ]
  },
  "assets": [
    {
      "file": "assets/story_core/lanza_aurora/pieces/pieza_01_nucleo.png",
      "character": "Lanza Aurora - Nucleo",
      "role": "Pieza 1/5: corazon energetico",
      "visual": "Gema/cristal central facetado con halo celeste-blanco luminoso.",
      "suggested_use": "Item coleccionable mundo 1; centro del ensamblaje.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/pieces/pieza_02_empunadura.png",
      "character": "Lanza Aurora - Empunadura",
      "role": "Pieza 2/5: mango/base",
      "visual": "Mango dorado vertical con anillos y pomo con gema lila.",
      "suggested_use": "Item coleccionable mundo 2; base del arma al ensamblar.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/pieces/pieza_03_canalizador.png",
      "character": "Lanza Aurora - Canalizador",
      "role": "Pieza 3/5: aro/corona enfocadora",
      "visual": "Aro dorado tipo corona con puas y gemas lila que enfoca la energia.",
      "suggested_use": "Item coleccionable mundo 3; rodea el nucleo al ensamblar.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/pieces/pieza_04_estabilizador.png",
      "character": "Lanza Aurora - Estabilizador",
      "role": "Pieza 4/5: alas equilibradoras",
      "visual": "Par de aletas/alas lila simetricas con nucleo dorado central.",
      "suggested_use": "Item coleccionable mundo 4; estabiliza los lados del arma.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/pieces/pieza_05_punta.png",
      "character": "Lanza Aurora - Punta",
      "role": "Pieza 5/5: remate ofensivo",
      "visual": "Hoja/punta luminosa alta en degradado celeste-lila con brillo blanco.",
      "suggested_use": "Item coleccionable mundo 5; foco ofensivo principal.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/assembled/lanza_01_de_05.png",
      "character": "Lanza Aurora",
      "role": "Ensamblaje 1/5",
      "visual": "Solo el nucleo activo.",
      "suggested_use": "Pantalla de progreso tras completar mundo 1.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/assembled/lanza_02_de_05.png",
      "character": "Lanza Aurora",
      "role": "Ensamblaje 2/5",
      "visual": "Nucleo + empunadura (eje dorado).",
      "suggested_use": "Pantalla de progreso tras completar mundo 2.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/assembled/lanza_03_de_05.png",
      "character": "Lanza Aurora",
      "role": "Ensamblaje 3/5",
      "visual": "Se anade el canalizador rodeando el nucleo.",
      "suggested_use": "Pantalla de progreso tras completar mundo 3.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/assembled/lanza_04_de_05.png",
      "character": "Lanza Aurora",
      "role": "Ensamblaje 4/5",
      "visual": "Se anaden las alas estabilizadoras.",
      "suggested_use": "Pantalla de progreso tras completar mundo 4.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/assembled/lanza_05_de_05.png",
      "character": "Lanza Aurora",
      "role": "Ensamblaje 5/5",
      "visual": "Arma completa con la punta montada.",
      "suggested_use": "Pantalla de progreso tras completar mundo 5.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/assembled/lanza_aurora_final.png",
      "character": "Lanza Aurora",
      "role": "Version final heroica",
      "visual": "Arma completa con halo dorado y sun rays; presentacion epica.",
      "suggested_use": "Cinematica de arma lista / mundo final contra Doctor Sombra.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/rewards/reward_pieza_01.png",
      "character": "Lanza Aurora - Premio pieza 1",
      "role": "Recompensa de fin de mundo",
      "visual": "Nucleo titilante con halo dorado y rayos de luz.",
      "suggested_use": "Animacion de recompensa al completar el mundo 1; pieza ganada.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/rewards/reward_pieza_02.png",
      "character": "Lanza Aurora - Premio pieza 2",
      "role": "Recompensa de fin de mundo",
      "visual": "Empunadura dorada con sun rays y destellos.",
      "suggested_use": "Animacion de recompensa al completar el mundo 2; pieza ganada.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/rewards/reward_pieza_03.png",
      "character": "Lanza Aurora - Premio pieza 3",
      "role": "Recompensa de fin de mundo",
      "visual": "Canalizador con corona de luz y rayos dorados.",
      "suggested_use": "Animacion de recompensa al completar el mundo 3; pieza ganada.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/rewards/reward_pieza_04.png",
      "character": "Lanza Aurora - Premio pieza 4",
      "role": "Recompensa de fin de mundo",
      "visual": "Alas estabilizadoras flotando con brillo glorioso.",
      "suggested_use": "Animacion de recompensa al completar el mundo 4; pieza ganada.",
      "status": "final"
    },
    {
      "file": "assets/story_core/lanza_aurora/rewards/reward_pieza_05.png",
      "character": "Lanza Aurora - Premio pieza 5",
      "role": "Recompensa de fin de mundo",
      "visual": "Punta luminosa irradiando rayos dorados.",
      "suggested_use": "Animacion de recompensa al completar el mundo 5; pieza ganada.",
      "status": "final"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_main.png",
      "character": "Doctor Sombra",
      "role": "Concept cuerpo completo",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Antagonista principal; referencia maestra de diseno.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_idle.png",
      "character": "Doctor Sombra",
      "role": "Pose idle dominante",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Aparicion en escena; postura de poder.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_command.png",
      "character": "Doctor Sombra",
      "role": "Senalando / dando ordenes",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Escena con secuaces; villano al mando.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_escape.png",
      "character": "Doctor Sombra",
      "role": "Escapando / entrando a la nave",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Final de mundo: vuelve a huir con Aurora.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_portrait.png",
      "character": "Doctor Sombra",
      "role": "Retrato / busto",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Dialogo narrativo, caja de dialogo, UI.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_story.png",
      "character": "Doctor Sombra",
      "role": "Aparicion narrativa",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Pantalla final de mundo / cinematica.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/doctor_sombra/doctor_sombra_icon.png",
      "character": "Doctor Sombra",
      "role": "Mini/silueta UI",
      "visual": "Pendiente de generacion (ver prompts/doctor_sombra_prompts.md).",
      "suggested_use": "Icono de jefe, marcador de mapa, HUD.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_main.png",
      "character": "Princesa Aurora",
      "role": "Concept cuerpo completo",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Referencia maestra de Aurora.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_captive.png",
      "character": "Princesa Aurora",
      "role": "Pose serena / cautiva",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Escena de rescate.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_help.png",
      "character": "Princesa Aurora",
      "role": "Pidiendo ayuda",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Momento de tension narrativa.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_signal.png",
      "character": "Princesa Aurora",
      "role": "Dejando una senal / entregando pieza",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Vinculo con la recompensa de pieza.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_portrait.png",
      "character": "Princesa Aurora",
      "role": "Retrato / busto",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Dialogo, UI narrativa.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_in_ship.png",
      "character": "Princesa Aurora",
      "role": "Dentro de la nave de Sombra",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Final de mundo: cautiva en la nave.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_icon.png",
      "character": "Princesa Aurora",
      "role": "Mini icono simplificado",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Escenas narrativas, HUD.",
      "status": "pending_generation"
    },
    {
      "file": "assets/story_core/princesa_aurora/aurora_distant_scene.png",
      "character": "Princesa Aurora",
      "role": "Final de mundo a distancia en capsula/nave",
      "visual": "Pendiente de generacion (ver prompts/princesa_aurora_prompts.md).",
      "suggested_use": "Plano lejano de rescate fallido.",
      "status": "pending_generation"
    }
  ],
  "format_note": "Lanza Aurora: todos los PNG en lienzo cuadrado uniforme (piezas y premios 512x512; ensamblajes 512x512; final 640x640). Fondo transparente. Punta y aro separados verticalmente para silueta limpia."
};
window.AERO_STORY_SHIPS_MANIFEST = [
  {
    "id": "world_1_shadow_ship",
    "name": "World 1 Shadow Ship",
    "type": "ship",
    "world": "world_1",
    "owner": "doctor_sombra",
    "image": "assets/story_core/ships/world_1_shadow_ship/ship_full.png",
    "mini": "assets/story_core/ships/world_1_shadow_ship/ship_mini.png",
    "capsule": "assets/story_core/ships/world_1_shadow_ship/capture_capsule.png",
    "auroraInside": "assets/story_core/ships/world_1_shadow_ship/aurora_inside_ship.png",
    "visualTheme": "shadow_city",
    "recommendedUse": "end_of_world_escape_scene",
    "notes": "Nave oscura de escape del Doctor Sombra para el cierre del world_1.",
    "damaged": "assets/story_core/ships/world_1_shadow_ship/ship_damaged.png"
  },
  {
    "id": "world_2_mecha_ship",
    "name": "World 2 Mecha Ship",
    "type": "ship",
    "world": "world_2",
    "owner": "doctor_sombra",
    "image": "assets/story_core/ships/world_2_mecha_ship/ship_full.png",
    "mini": "assets/story_core/ships/world_2_mecha_ship/ship_mini.png",
    "capsule": "assets/story_core/ships/world_2_mecha_ship/capture_capsule.png",
    "auroraInside": "assets/story_core/ships/world_2_mecha_ship/aurora_inside_ship.png",
    "visualTheme": "mecha_station",
    "recommendedUse": "end_of_world_escape_scene",
    "notes": "Nave oscura de escape del Doctor Sombra para el cierre del world_2.",
    "damaged": "assets/story_core/ships/world_2_mecha_ship/ship_damaged.png"
  },
  {
    "id": "world_3_crystal_ice_ship",
    "name": "World 3 Crystal Ice Ship",
    "type": "ship",
    "world": "world_3",
    "owner": "doctor_sombra",
    "image": "assets/story_core/ships/world_3_crystal_ice_ship/ship_full.png",
    "mini": "assets/story_core/ships/world_3_crystal_ice_ship/ship_mini.png",
    "capsule": "assets/story_core/ships/world_3_crystal_ice_ship/capture_capsule.png",
    "auroraInside": "assets/story_core/ships/world_3_crystal_ice_ship/aurora_inside_ship.png",
    "visualTheme": "crystal_ice",
    "recommendedUse": "end_of_world_escape_scene",
    "notes": "Nave oscura de escape del Doctor Sombra para el cierre del world_3.",
    "damaged": "assets/story_core/ships/world_3_crystal_ice_ship/ship_damaged.png"
  },
  {
    "id": "world_4_swamp_ship",
    "name": "World 4 Swamp Ship",
    "type": "ship",
    "world": "world_4",
    "owner": "doctor_sombra",
    "image": "assets/story_core/ships/world_4_swamp_ship/ship_full.png",
    "mini": "assets/story_core/ships/world_4_swamp_ship/ship_mini.png",
    "capsule": "assets/story_core/ships/world_4_swamp_ship/capture_capsule.png",
    "auroraInside": "assets/story_core/ships/world_4_swamp_ship/aurora_inside_ship.png",
    "visualTheme": "swamp_bio",
    "recommendedUse": "end_of_world_escape_scene",
    "notes": "Nave oscura de escape del Doctor Sombra para el cierre del world_4.",
    "damaged": "assets/story_core/ships/world_4_swamp_ship/ship_damaged.png"
  },
  {
    "id": "world_5_toxic_storm_ship",
    "name": "World 5 Toxic Storm Ship",
    "type": "ship",
    "world": "world_5",
    "owner": "doctor_sombra",
    "image": "assets/story_core/ships/world_5_toxic_storm_ship/ship_full.png",
    "mini": "assets/story_core/ships/world_5_toxic_storm_ship/ship_mini.png",
    "capsule": "assets/story_core/ships/world_5_toxic_storm_ship/capture_capsule.png",
    "auroraInside": "assets/story_core/ships/world_5_toxic_storm_ship/aurora_inside_ship.png",
    "visualTheme": "toxic_storm",
    "recommendedUse": "end_of_world_escape_scene",
    "notes": "Nave oscura de escape del Doctor Sombra para el cierre del world_5.",
    "damaged": "assets/story_core/ships/world_5_toxic_storm_ship/ship_damaged.png"
  },
  {
    "id": "final_shadow_fortress_ship",
    "name": "Final Shadow Fortress Ship",
    "type": "ship",
    "world": "final",
    "owner": "doctor_sombra",
    "image": "assets/story_core/ships/final_shadow_fortress_ship/ship_full.png",
    "mini": "assets/story_core/ships/final_shadow_fortress_ship/ship_mini.png",
    "capsule": "assets/story_core/ships/final_shadow_fortress_ship/capture_capsule.png",
    "auroraInside": "assets/story_core/ships/final_shadow_fortress_ship/aurora_inside_ship.png",
    "visualTheme": "shadow_fortress",
    "recommendedUse": "end_of_world_escape_scene",
    "notes": "Fortaleza-nave final del Doctor Sombra; puede ser destruida en el mundo final.",
    "damaged_stage_1": "assets/story_core/ships/final_shadow_fortress_ship/ship_damaged_stage_1.png",
    "damaged_stage_2": "assets/story_core/ships/final_shadow_fortress_ship/ship_damaged_stage_2.png",
    "critical": "assets/story_core/ships/final_shadow_fortress_ship/ship_critical.png",
    "finalCore": "assets/story_core/ships/final_shadow_fortress_ship/final_core.png"
  }
];
window.AERO_STORY_CUTSCENES_MANIFEST = [
  {
    "id": "world_1_escape_scene",
    "name": "World 1 Escape Scene",
    "type": "cutscene",
    "world": "world_1",
    "sceneType": "failed_rescue_escape",
    "layers": {
      "background": "assets/story_core/cutscenes/world_1_escape_scene/scene_background.png",
      "ship": "assets/story_core/cutscenes/world_1_escape_scene/ship_layer.png",
      "aurora": "assets/story_core/cutscenes/world_1_escape_scene/aurora_layer.png",
      "energy": "assets/story_core/cutscenes/world_1_escape_scene/shadow_energy_layer.png",
      "trail": "assets/story_core/cutscenes/world_1_escape_scene/escape_trail_layer.png",
      "preview": "assets/story_core/cutscenes/world_1_escape_scene/composite_preview.jpg"
    },
    "notes": "Aero casi rescata a Aurora, pero Doctor Sombra escapa."
  },
  {
    "id": "world_2_escape_scene",
    "name": "World 2 Escape Scene",
    "type": "cutscene",
    "world": "world_2",
    "sceneType": "failed_rescue_escape",
    "layers": {
      "background": "assets/story_core/cutscenes/world_2_escape_scene/scene_background.png",
      "ship": "assets/story_core/cutscenes/world_2_escape_scene/ship_layer.png",
      "aurora": "assets/story_core/cutscenes/world_2_escape_scene/aurora_layer.png",
      "energy": "assets/story_core/cutscenes/world_2_escape_scene/mecha_energy_layer.png",
      "trail": "assets/story_core/cutscenes/world_2_escape_scene/escape_trail_layer.png",
      "preview": "assets/story_core/cutscenes/world_2_escape_scene/composite_preview.jpg"
    },
    "notes": "Aero casi rescata a Aurora, pero Doctor Sombra escapa."
  },
  {
    "id": "world_3_escape_scene",
    "name": "World 3 Escape Scene",
    "type": "cutscene",
    "world": "world_3",
    "sceneType": "failed_rescue_escape",
    "layers": {
      "background": "assets/story_core/cutscenes/world_3_escape_scene/scene_background.png",
      "ship": "assets/story_core/cutscenes/world_3_escape_scene/ship_layer.png",
      "aurora": "assets/story_core/cutscenes/world_3_escape_scene/aurora_layer.png",
      "energy": "assets/story_core/cutscenes/world_3_escape_scene/crystal_shards_layer.png",
      "trail": "assets/story_core/cutscenes/world_3_escape_scene/escape_trail_layer.png",
      "preview": "assets/story_core/cutscenes/world_3_escape_scene/composite_preview.jpg"
    },
    "notes": "Aero casi rescata a Aurora, pero Doctor Sombra escapa."
  },
  {
    "id": "world_4_escape_scene",
    "name": "World 4 Escape Scene",
    "type": "cutscene",
    "world": "world_4",
    "sceneType": "failed_rescue_escape",
    "layers": {
      "background": "assets/story_core/cutscenes/world_4_escape_scene/scene_background.png",
      "ship": "assets/story_core/cutscenes/world_4_escape_scene/ship_layer.png",
      "aurora": "assets/story_core/cutscenes/world_4_escape_scene/aurora_layer.png",
      "energy": "assets/story_core/cutscenes/world_4_escape_scene/swamp_fog_layer.png",
      "trail": "assets/story_core/cutscenes/world_4_escape_scene/escape_trail_layer.png",
      "preview": "assets/story_core/cutscenes/world_4_escape_scene/composite_preview.jpg"
    },
    "notes": "Aero casi rescata a Aurora, pero Doctor Sombra escapa."
  },
  {
    "id": "world_5_escape_scene",
    "name": "World 5 Escape Scene",
    "type": "cutscene",
    "world": "world_5",
    "sceneType": "failed_rescue_escape",
    "layers": {
      "background": "assets/story_core/cutscenes/world_5_escape_scene/scene_background.png",
      "ship": "assets/story_core/cutscenes/world_5_escape_scene/ship_layer.png",
      "aurora": "assets/story_core/cutscenes/world_5_escape_scene/aurora_layer.png",
      "energy": "assets/story_core/cutscenes/world_5_escape_scene/toxic_cloud_layer.png",
      "lightning": "assets/story_core/cutscenes/world_5_escape_scene/lightning_layer.png",
      "trail": "assets/story_core/cutscenes/world_5_escape_scene/escape_trail_layer.png",
      "preview": "assets/story_core/cutscenes/world_5_escape_scene/composite_preview.jpg"
    },
    "notes": "Aero casi rescata a Aurora, pero Doctor Sombra escapa."
  },
  {
    "id": "final_confrontation_scene",
    "name": "Final Confrontation Scene",
    "type": "cutscene",
    "world": "final",
    "sceneType": "final_confrontation",
    "layers": {
      "background": "assets/story_core/cutscenes/final_confrontation_scene/scene_background.png",
      "ship": "assets/story_core/cutscenes/final_confrontation_scene/final_ship_layer.png",
      "doctorSombra": "assets/story_core/cutscenes/final_confrontation_scene/doctor_sombra_layer.png",
      "aurora": "assets/story_core/cutscenes/final_confrontation_scene/aurora_layer.png",
      "lanzaLight": "assets/story_core/cutscenes/final_confrontation_scene/lanza_aurora_light_layer.png",
      "shadowCore": "assets/story_core/cutscenes/final_confrontation_scene/shadow_core_layer.png",
      "preview": "assets/story_core/cutscenes/final_confrontation_scene/composite_preview.jpg"
    },
    "notes": "Confrontacion final: Aero con la Lanza completa frente a la fortaleza del Doctor Sombra."
  }
];
window.AERO_STORY_SHIP_PARTS_MANIFEST = [
  {
    "id": "shadow_emblem",
    "type": "emblem",
    "image": "assets/story_core/ship_parts/common_shadow_emblem/shadow_emblem.png",
    "preview": "assets/story_core/ship_parts/common_shadow_emblem/shadow_emblem_preview.png",
    "recommendedUse": "brand_overlay",
    "notes": "Emblema comun del Doctor Sombra."
  },
  {
    "id": "cracked_panel",
    "type": "damage_fx",
    "image": "assets/story_core/ship_parts/damaged_ship_parts/cracked_panel.png",
    "preview": "assets/story_core/ship_parts/damaged_ship_parts/cracked_panel.png",
    "recommendedUse": "ship_damage_overlay",
    "notes": "Overlay de dano: cracked_panel."
  },
  {
    "id": "broken_wing",
    "type": "damage_fx",
    "image": "assets/story_core/ship_parts/damaged_ship_parts/broken_wing.png",
    "preview": "assets/story_core/ship_parts/damaged_ship_parts/broken_wing.png",
    "recommendedUse": "ship_damage_overlay",
    "notes": "Overlay de dano: broken_wing."
  },
  {
    "id": "smoke_damage",
    "type": "damage_fx",
    "image": "assets/story_core/ship_parts/damaged_ship_parts/smoke_damage.png",
    "preview": "assets/story_core/ship_parts/damaged_ship_parts/smoke_damage.png",
    "recommendedUse": "ship_damage_overlay",
    "notes": "Overlay de dano: smoke_damage."
  },
  {
    "id": "sparks_damage",
    "type": "damage_fx",
    "image": "assets/story_core/ship_parts/damaged_ship_parts/sparks_damage.png",
    "preview": "assets/story_core/ship_parts/damaged_ship_parts/sparks_damage.png",
    "recommendedUse": "ship_damage_overlay",
    "notes": "Overlay de dano: sparks_damage."
  },
  {
    "id": "purple_thruster",
    "type": "thruster",
    "image": "assets/story_core/ship_parts/thrusters/purple_thruster.png",
    "preview": "assets/story_core/ship_parts/thrusters/purple_thruster_preview.png",
    "recommendedUse": "ship_animation_fx",
    "notes": "Propulsor purple de las naves del Doctor Sombra."
  },
  {
    "id": "cyan_thruster",
    "type": "thruster",
    "image": "assets/story_core/ship_parts/thrusters/cyan_thruster.png",
    "preview": "assets/story_core/ship_parts/thrusters/cyan_thruster_preview.png",
    "recommendedUse": "ship_animation_fx",
    "notes": "Propulsor cyan de las naves del Doctor Sombra."
  },
  {
    "id": "toxic_thruster",
    "type": "thruster",
    "image": "assets/story_core/ship_parts/thrusters/toxic_thruster.png",
    "preview": "assets/story_core/ship_parts/thrusters/toxic_thruster_preview.png",
    "recommendedUse": "ship_animation_fx",
    "notes": "Propulsor toxic de las naves del Doctor Sombra."
  },
  {
    "id": "swamp_thruster",
    "type": "thruster",
    "image": "assets/story_core/ship_parts/thrusters/swamp_thruster.png",
    "preview": "assets/story_core/ship_parts/thrusters/swamp_thruster_preview.png",
    "recommendedUse": "ship_animation_fx",
    "notes": "Propulsor swamp de las naves del Doctor Sombra."
  },
  {
    "id": "crystal_thruster",
    "type": "thruster",
    "image": "assets/story_core/ship_parts/thrusters/crystal_thruster.png",
    "preview": "assets/story_core/ship_parts/thrusters/crystal_thruster_preview.png",
    "recommendedUse": "ship_animation_fx",
    "notes": "Propulsor crystal de las naves del Doctor Sombra."
  },
  {
    "id": "shadow_trail",
    "type": "energy_trail",
    "image": "assets/story_core/ship_parts/energy_trails/shadow_trail.png",
    "preview": "assets/story_core/ship_parts/energy_trails/shadow_trail_preview.png",
    "recommendedUse": "ship_escape_fx",
    "notes": "Estela de energia shadow."
  },
  {
    "id": "mecha_trail",
    "type": "energy_trail",
    "image": "assets/story_core/ship_parts/energy_trails/mecha_trail.png",
    "preview": "assets/story_core/ship_parts/energy_trails/mecha_trail_preview.png",
    "recommendedUse": "ship_escape_fx",
    "notes": "Estela de energia mecha."
  },
  {
    "id": "crystal_trail",
    "type": "energy_trail",
    "image": "assets/story_core/ship_parts/energy_trails/crystal_trail.png",
    "preview": "assets/story_core/ship_parts/energy_trails/crystal_trail_preview.png",
    "recommendedUse": "ship_escape_fx",
    "notes": "Estela de energia crystal."
  },
  {
    "id": "swamp_trail",
    "type": "energy_trail",
    "image": "assets/story_core/ship_parts/energy_trails/swamp_trail.png",
    "preview": "assets/story_core/ship_parts/energy_trails/swamp_trail_preview.png",
    "recommendedUse": "ship_escape_fx",
    "notes": "Estela de energia swamp."
  },
  {
    "id": "toxic_trail",
    "type": "energy_trail",
    "image": "assets/story_core/ship_parts/energy_trails/toxic_trail.png",
    "preview": "assets/story_core/ship_parts/energy_trails/toxic_trail_preview.png",
    "recommendedUse": "ship_escape_fx",
    "notes": "Estela de energia toxic."
  },
  {
    "id": "capsule_empty",
    "type": "capsule",
    "image": "assets/story_core/ship_parts/capture_capsule/capsule_empty.png",
    "preview": "assets/story_core/ship_parts/capture_capsule/capsule_empty.png",
    "recommendedUse": "aurora_containment",
    "notes": "Capsula de contencion: capsule_empty."
  },
  {
    "id": "capsule_with_aurora",
    "type": "capsule",
    "image": "assets/story_core/ship_parts/capture_capsule/capsule_with_aurora.png",
    "preview": "assets/story_core/ship_parts/capture_capsule/capsule_with_aurora.png",
    "recommendedUse": "aurora_containment",
    "notes": "Capsula de contencion: capsule_with_aurora."
  },
  {
    "id": "capsule_glow",
    "type": "capsule",
    "image": "assets/story_core/ship_parts/capture_capsule/capsule_glow.png",
    "preview": "assets/story_core/ship_parts/capture_capsule/capsule_glow.png",
    "recommendedUse": "aurora_containment",
    "notes": "Capsula de contencion: capsule_glow."
  },
  {
    "id": "capsule_cracked",
    "type": "capsule",
    "image": "assets/story_core/ship_parts/capture_capsule/capsule_cracked.png",
    "preview": "assets/story_core/ship_parts/capture_capsule/capsule_cracked.png",
    "recommendedUse": "aurora_containment",
    "notes": "Capsula de contencion: capsule_cracked."
  },
  {
    "id": "aurora_light_trail",
    "type": "aurora_fx",
    "image": "assets/story_core/ship_parts/aurora_light_trail/aurora_light_trail.png",
    "preview": "assets/story_core/ship_parts/aurora_light_trail/aurora_light_trail.png",
    "recommendedUse": "aurora_signal_fx",
    "notes": "Efecto de luz de Aurora: aurora_light_trail."
  },
  {
    "id": "aurora_signal_spark",
    "type": "aurora_fx",
    "image": "assets/story_core/ship_parts/aurora_light_trail/aurora_signal_spark.png",
    "preview": "assets/story_core/ship_parts/aurora_light_trail/aurora_signal_spark.png",
    "recommendedUse": "aurora_signal_fx",
    "notes": "Efecto de luz de Aurora: aurora_signal_spark."
  },
  {
    "id": "aurora_rescue_glow",
    "type": "aurora_fx",
    "image": "assets/story_core/ship_parts/aurora_light_trail/aurora_rescue_glow.png",
    "preview": "assets/story_core/ship_parts/aurora_light_trail/aurora_rescue_glow.png",
    "recommendedUse": "aurora_signal_fx",
    "notes": "Efecto de luz de Aurora: aurora_rescue_glow."
  }
];

window.AERO_STORY_REWARDS = {
  world_1: {
    world: "world_1",
    pieceNumber: 1,
    totalPieces: 5,
    pieceName: "Núcleo",
    title: "Pieza 1/5 obtenida",
    subtitle: "Núcleo de la Lanza Aurora",
    reward: "assets/story_core/lanza_aurora/rewards/reward_pieza_01.png",
    piece: "assets/story_core/lanza_aurora/pieces/pieza_01_nucleo.png",
    assembled: "assets/story_core/lanza_aurora/assembled/lanza_01_de_05.png",
    shipMini: "assets/story_core/ships/world_1_shadow_ship/ship_mini.png",
    shipFull: "assets/story_core/ships/world_1_shadow_ship/ship_full.png",
    cutscenePreview: "assets/story_core/cutscenes/world_1_escape_scene/composite_preview.jpg",
    escapeText: "Doctor Sombra escapó con Aurora"
  },
  world_2: {
    world: "world_2",
    pieceNumber: 2,
    totalPieces: 5,
    pieceName: "Empuñadura",
    title: "Pieza 2/5",
    subtitle: "Empuñadura de la Lanza Aurora",
    reward: "assets/story_core/lanza_aurora/rewards/reward_pieza_02.png",
    piece: "assets/story_core/lanza_aurora/pieces/pieza_02_empunadura.png",
    assembled: "assets/story_core/lanza_aurora/assembled/lanza_02_de_05.png",
    shipMini: "assets/story_core/ships/world_2_mecha_ship/ship_mini.png"
  },
  world_3: {
    world: "world_3",
    pieceNumber: 3,
    totalPieces: 5,
    pieceName: "Canalizador",
    title: "Pieza 3/5",
    subtitle: "Canalizador de la Lanza Aurora",
    reward: "assets/story_core/lanza_aurora/rewards/reward_pieza_03.png",
    piece: "assets/story_core/lanza_aurora/pieces/pieza_03_canalizador.png",
    assembled: "assets/story_core/lanza_aurora/assembled/lanza_03_de_05.png",
    shipMini: "assets/story_core/ships/world_3_crystal_ice_ship/ship_mini.png"
  },
  world_4: {
    world: "world_4",
    pieceNumber: 4,
    totalPieces: 5,
    pieceName: "Estabilizador",
    title: "Pieza 4/5",
    subtitle: "Estabilizador de la Lanza Aurora",
    reward: "assets/story_core/lanza_aurora/rewards/reward_pieza_04.png",
    piece: "assets/story_core/lanza_aurora/pieces/pieza_04_estabilizador.png",
    assembled: "assets/story_core/lanza_aurora/assembled/lanza_04_de_05.png",
    shipMini: "assets/story_core/ships/world_4_swamp_ship/ship_mini.png"
  },
  world_5: {
    world: "world_5",
    pieceNumber: 5,
    totalPieces: 5,
    pieceName: "Punta",
    title: "Pieza 5/5",
    subtitle: "Punta final de la Lanza Aurora",
    reward: "assets/story_core/lanza_aurora/rewards/reward_pieza_05.png",
    piece: "assets/story_core/lanza_aurora/pieces/pieza_05_punta.png",
    assembled: "assets/story_core/lanza_aurora/assembled/lanza_05_de_05.png",
    shipMini: "assets/story_core/ships/world_5_toxic_storm_ship/ship_mini.png"
  }
};

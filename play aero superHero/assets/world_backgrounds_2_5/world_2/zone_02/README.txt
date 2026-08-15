world: world_2
zoneId: zone_02
zoneName: ascendant_stair_sector
visualTheme: space_station_robotics
mood: cold_technological_ascendant
dominantColors: #a9b7d1, #697b9b, #d36c4e
recommendedUse: vertical_traversal
notableProps: tuberias, antenas, paneles, nucleos de energia, rejillas
layeringNotes: orden de parallax (fondo->frente): bg_far, fog/smoke, bg_mid, light_glow, bg_near, ground_overlay, ambient, bg_foreground_fx. bg_far/bg_mid pensados para empalmar horizontalmente.
integrationNotes: usar velocidades de parallax crecientes de bg_far (lenta) a bg_near (rapida); ground_overlay fija al piso; decor_props_sheet contiene props transparentes separados para componer. Sin texto, personajes ni HUD.

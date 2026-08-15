AERO - PAQUETE DE FONDOS MODULARES (MUNDOS 2 A 5)
====================================================

1) RESUMEN
   Fondos modulares por zonas para side-scroller 2D con parallax. Cada zona
   trae capas separadas (bg_far/mid/near), efectos frontales, overlay de piso,
   hoja de props decorativos y un composite_preview. PNG transparentes (excepto
   el preview JPG). Sin personajes, enemigos, texto ni HUD.

2) ZONAS POR MUNDO
   world_2: 7 zonas
   world_3: 6 zonas
   world_4: 6 zonas
   world_5: 6 zonas
   TOTAL: 25 zonas

3) ATMOSFERA POR MUNDO
   world_2 [space_station_robotics | cold_technological_ascendant]: Estacion espacial / robotica: frio, industrial, metalico, con nucleos de energia cian y alertas rojas; verticalidad hacia un nucleo peligroso.
   world_3 [tundra_and_geode_abyss | frozen_to_crystalline]: Tundra que desciende a un abismo de geoda: de azules hielo y niebla fria a cavernas de cristal magenta/cian y roca oscura.
   world_4 [swamp_amphibians | humid_bioluminescent_toxic]: Pantano anfibio: humedo, organico, bioluminiscente y venenoso; raices, troncos, bruma baja y luces toxicas.
   world_5 [toxic_atmosphere | high_polluted_electric]: Atmosfera toxica en altura: cielo ennegrecido, nubes de gas amarillo, antenas, relampagos y plataformas suspendidas.

4) RECOMENDACIONES DE INTEGRACION
   - Parallax: bg_far mas lento, bg_mid medio, bg_near mas rapido; ground_overlay fijo al piso.
   - bg_far y bg_mid se disenaron para empalmar horizontalmente (loops largos).
   - Usar decor_props_sheet para sembrar props sueltos sin recargar las capas base.
   - Capas opcionales (fog/smoke/light_glow/ambient) se mezclan por encima segun la zona.

5) OBSERVACIONES VISUALES
   - Arte generado proceduralmente (siluetas + degradados atmosfericos + brillos + particulas).
   - Coherencia por mundo via paleta y tipo de silueta; identidad clara entre mundos.
   - Los fondos sugieren ruta y verticalidad pero NO dibujan colisiones del nivel.

6) PROPS DESTACADOS POR MUNDO
   world_2: tuberias, antenas, paneles, nucleos de energia, rejillas
   world_3: cristales geoda, estalagmitas de hielo, rocas nevadas, brillos minerales
   world_4: raices, hongos bioluminiscentes, troncos, rocas mojadas, flora toxica
   world_5: antenas, cables altos, nubes toxicas, chispas electricas, plataformas flotantes

7) SUGERENCIAS DE PARALLAX (factores orientativos)
   bg_far 0.15-0.25 | bg_mid 0.4-0.5 | bg_near 0.7-0.85 | ground 1.0 | fx 1.0-1.1
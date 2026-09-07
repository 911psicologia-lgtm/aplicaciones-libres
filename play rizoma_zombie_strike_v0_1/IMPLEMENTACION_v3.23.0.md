# Rizoma Zombie Strike v3.23.0

## Guardianes Vinculados — identidad táctica individual
Se incorporan 20 perfiles tácticos para los Guardianes invocables. Cada uno define rol, rango de combate, velocidad de persecución, propensión a embestir, capacidad de intercepción y estilo de entrada.

Roles utilizados: ARTILLERO, CONTROL, CADENA, DUELISTA, SOPORTE, INFECCIÓN, ASESINO, DEFENSA, ÁREA, DRENAJE, SINAPSIS, CAZADOR, CORTE, PSIÓNICO y ASALTO.

La IA aliada ajusta ahora su posición según el rol:
- Artilleros mantienen distancia y castigan amenazas prioritarias.
- Soportes se colocan entre RIZOMA y el objetivo y destruyen más proyectiles.
- Controladores/encadenadores flanquean y dominan espacio.
- Cazadores/asaltantes se aproximan, persiguen y embisten.
- Asesinos buscan ángulos laterales y objetivos críticos.

Se conserva el ECO del poder activo de la nave.

## Entradas visuales
Cada invocación usa una entrada distinta basada en su mundo: meteorítica, infecciosa, astral, abisal, orgánica, magmática, sináptica, criogénica, psiónica, necroescama, etc. Se reutilizan partículas y recursos ya cargados, sin crear placeholders.

## Guardianes enemigos M16–M19
Se añaden patrones de movilidad exclusivos:
- M16 Neurokhan: synapseOrbit / nodeJump / vectorLock / phaseShift.
- M17 Skaldr: stalk / pounce / iceFlank / whiteout.
- M18 Kanzai: panelDash / pageArc / cutAcross / mangaBlink.
- M19 Zhyr: psionHover / needleDive / psionStrafe / silentShift.

Se conserva el aumento global previo de movilidad de Guardianes (+40%), pero ahora se distribuye mediante perfiles específicos.

## Hangar
Los Guardianes muestran rol táctico, firma y duración de invocación directamente en el selector de apoyo temporal.

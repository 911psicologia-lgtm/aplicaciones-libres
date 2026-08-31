# Rizoma Zombie Strike v3.8.0 — Flota UX + selección segura

## Alcance

- Se mantiene v3.7.0 como baseline funcional.
- No se crean mundos nuevos: permanecen M1–M20.
- No se rebalancean las diez naves de Flota ni sus firmas.
- Se añade un control compacto de Flota al HUD.
- El HUD muestra casco actual, cooldown de firma, suspensión por DOMINIO y loadout preparado.
- La firma activa genera pulso visual en el control sin añadir mensajes repetitivos.
- Se añade selector rápido de Flota que pausa el combate.
- La nave elegida durante una misión queda preparada exclusivamente para la próxima salida; no cambia estadísticas ni cooldowns en caliente.
- El Archivo de Flota muestra estadísticas relativas y la firma heredada de cada casco.
- DOMINIO e Invocación de Guardianes continúan siendo sistemas separados.

## Regla de seguridad de balance

`profile.activeFleetShip` representa el loadout de la próxima salida. `player.fleetShip` representa el casco ya instanciado en la misión. El selector HUD solo modifica el primero, por lo que no existe hot-swap durante combate.

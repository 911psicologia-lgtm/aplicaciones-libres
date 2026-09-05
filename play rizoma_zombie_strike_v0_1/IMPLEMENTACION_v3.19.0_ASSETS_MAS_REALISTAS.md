# Implementación v3.19.0 — Assets más realistas para la flota Rizoma

## Objetivo
Reincorporar a la aplicación el paquete actualizado **Rizoma Ships Animated Assets v1.0** en su variante más realista, conservando la arquitectura jugable, el hangar táctico y las cinemáticas ya integradas.

## Cambios aplicados
1. Se sustituyó por completo el contenido de `assets/player/rizoma_animated/` por el paquete nuevo aportado por el usuario.
2. Se conservaron las mismas rutas lógicas por nave (`rz1_fenix`, `rz4_mantis`, `rz8_nebula`, `rz12_bastion`, `rz16_hydra`, `rz20_prime`), evitando romper referencias existentes en `js/game.js`.
3. Se mantuvieron los `ship_meta.json` por nave para preservar coordenadas normalizadas de motores, hardpoints y origen de especiales.
4. Se conservaron e hicieron vigentes los nuevos recursos de runtime, hangar, animación y VFX incluidos en el ZIP actualizado.
5. Se mantuvo la intro general y la microintro del Mundo 1 ya incorporadas en la versión anterior.
6. Se incrementó la versión global del proyecto a **v3.19.0** para forzar refresco de caché en PWA (`sw.js`, `manifest.json`, `index.html`, `js/game.js`).

## Resultado esperado
- Naves Rizoma con apariencia más realista en hangar y gameplay.
- Sin ruptura de rutas de carga ni del sistema de progresión por mundos.
- Renovación limpia de caché al abrir la nueva versión instalada.

# STARFALL FRONTIER v0.7.1 — BATTLE RHYTHM

## Objetivo

Profundizar la línea de `ENCOUNTER EVOLUTION` sin reconstruir el proyecto ni sustituir sistemas existentes. El foco de esta iteración es reducir la sensación de rutina y transformar el combate en ciclos legibles de **amenaza → lectura → evasión → contraataque**, conservando fortaleza, módulos, hardpoints, Reactive Matrix, progresión, economía, PWA, assets, audio y responsive.

## 1. Battle Rhythm de bosses

- Los ataques signature ya no conviven con fuego básico continuo durante su telegráfico.
- Durante el wind-up el movimiento del boss se modera para aumentar legibilidad sin volverlo estático.
- Tras ejecutar una firma, el boss entra en una breve recuperación y deja una ventana real de contraataque.
- Si el jugador no recibe daño entre la ejecución de la firma y la apertura de la ventana, obtiene una **ESQUIVA LIMPIA**: el núcleo queda expuesto más tiempo y se concede bonus de puntuación.
- Si el jugador recibe daño, sigue existiendo una ventana menor. De este modo la batalla no se convierte en una pared de HP, pero tampoco regala daño crítico.
- Las maniobras de ruptura de eje quedan bloqueadas durante wind-up/recuperación para evitar contradicciones visuales.

## 2. Mutación de firmas por fase

Desde fase II, cada identidad de boss añade una mutación secundaria coherente con su perfil:

- `LANCER`: lanzas cruzadas desde extremos opuestos.
- `BROOD`: semillas perseguidoras laterales.
- `GRAVITY`: guadañas orbitales en sentidos alternos.
- `PHOENIX`: abanicos laterales ondulantes.
- `NOVA`: cortes curvos complementarios.

Esto evita que la misma firma se sienta idéntica durante toda la pelea.

## 3. Subboss Rhythm

- Se separó el **fuego básico** de los **ataques signature**.
- Los subjefes ahora alternan tres familias de fuego básico según identidad, en vez de repetir continuamente la firma completa.
- Las firmas tienen cooldown por fase y se aceleran progresivamente en fases II–III.
- Después de una firma existe recuperación breve, menor movilidad y una corta exposición del punto débil.
- Las firmas de apertura y de cambio de fase continúan existiendo, pero recuperan su carácter excepcional.

## 4. Desesperación de formación

Cuando una formación cae aproximadamente al último 20 %:

- Se activa una sola vez `FORMACIÓN ROTA · DESESPERACIÓN ENEMIGA`.
- Parte de los supervivientes abandona la formación en una **última carga**.
- La probabilidad kamikaze aumenta en esa carga.
- Los supervivientes que permanecen reciben una pequeña reserva adicional, zigzag y adelantan el siguiente disparo.
- La cantidad de atacantes se limita de forma diferente en móvil y escritorio para no saturar pantallas pequeñas.

El final de una oleada deja de ser el tramo más fácil y mecánico.

## 5. Kamikaze como amenaza y recurso táctico

- El kamikaze que alcanza al jugador continúa autoexplotando y desapareciendo por su propia regla de impacto.
- Si el jugador lo destruye antes del impacto, activa `DETONACIÓN TÁCTICA`.
- La detonación puede dañar enemigos próximos y encadenarse con otros kamikazes.
- El daño contra bosses está deliberadamente reducido para impedir exploits.
- Las cadenas exitosas conceden bonus de puntuación.

Esto introduce una decisión nueva: evitar al kamikaze o destruirlo en el momento adecuado para convertirlo en arma contra la propia formación.

## 6. Integridad preservada

No se modificaron los árboles `assets/` ni `audio/`; su hash permanece idéntico al tronco estable. `js/economy.js` también conserva exactamente el mismo hash. Continúan disponibles fortaleza, módulos, hardpoints, boss reboot, Reactive Matrix Assist, Hangar, Tactical Belt, objetivos, mutadores, familias W01–05, boss rewards, checkpoints, PWA y responsive.

## 7. Validación

- `node --check`: configuración, runtime, PWA y scripts sin errores sintácticos.
- 36 pruebas JavaScript de regresión ejecutadas correctamente.
- Validación v0.7.1 confirma referencias de index, manifest fullscreen, iconos PWA, service worker, Reactive Matrix y preservación de assets/audio/economía.
- Runtime smoke, responsive smoke, boss transition regression y watchdog continúan pasando.


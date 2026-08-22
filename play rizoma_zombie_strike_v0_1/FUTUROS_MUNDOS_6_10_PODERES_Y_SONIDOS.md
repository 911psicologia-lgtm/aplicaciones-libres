# Zombie Strike — Mundos 6–10: poderes y sonidos preparados

Los Mundos 6 y 7 ya están activos en campaña. Esta biblioteca conserva además jefes, reliquias, ataques y firmas sonoras de los Mundos 8–10 para integrarlos cuando queden cerrados sus fondos y familias visuales.

- Mundo 6 — Magnate Omega: Colapso de la Necrored · Núcleo Neural · Cyber Assault 120 BPM.
- Mundo 7 — Leviatán Abisal: Marea Viva · Corazón Abisal · Deep Current 96 BPM.
- Mundo 8 — Tardígrado Primigenio: Gestación Masiva · Génesis Orgánica · Bio Pulse 112 BPM.
- Mundo 9 — Kaiser Infinito: Ruptura Multiverso · Hilos del Multiverso · Kurai Sekai 138 BPM.
- Mundo 10 — Z.E.R.O.S. Prime: Singularidad Final · Núcleo Zero · End of Stars 92 BPM con aceleración crítica.

También quedan configuradas tres familias conceptuales por mundo (dos menores y una media), cada una con habilidad, sonido de disparo y sonido de destrucción. Los efectos de ralentización futuros respetan la regla de no degradar permanentemente la velocidad base.

Assets de meteoros y basura espacial quedan archivados en `assets/future/hazards/`.

## Pruebas de audio de desarrollo
Después de una interacción del usuario que habilite Web Audio:

```js
ZombieStrikeFuture.previewBoss(6, 1)
ZombieStrikeFuture.previewBoss(10, 4)
ZombieStrikeFuture.bossShot(7)
ZombieStrikeFuture.minionShot(9, 'small', 0)
ZombieStrikeFuture.minionDeath(8, 'medium', 0)
ZombieStrikeFuture.stopPreview()
```


## Estado v1.9.4
- Mundos 6 y 7: integrados en campaña con jefes, familias, fondos, hazards, ecos y DOMINIO.
- Magnate Omega y Leviatán Abisal: capas articuladas vinculadas a `bossFight.charge`.
- Mundos 8–10: bosses y hojas de hazards recuperados y verificados; continúan en preproducción.

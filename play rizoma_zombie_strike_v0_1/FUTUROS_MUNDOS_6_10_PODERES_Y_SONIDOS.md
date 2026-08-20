# Zombie Strike — Mundos 6–10: poderes y sonidos preparados

Esta versión no activa todavía los Mundos 6–10. Deja lista la biblioteca de jefes, reliquias, ataques y firmas sonoras para integrarla cuando estén aprobados los fondos y las familias visuales.

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

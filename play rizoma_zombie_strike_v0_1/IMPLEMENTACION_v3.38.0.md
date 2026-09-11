# RIZOMA ZOMBIE STRIKE v3.38.0
## Boss Phase Signature Evolution

### Base de continuidad
Parte exclusivamente de **v3.37.0 — Guardian Phase Identity & Battle Rhythm**. Conserva los 20 mundos, la curva de dificultad, los assets reales, Enemy Behavior Evolution, Guardian Telegraph y los mazos anti-repetición.

### Objetivo
Hacer que cada fase de los 20 Guardianes cambie cualitativamente la pelea sin inflar HP, daño, número de proyectiles ni duración artificial del combate. La fase debe sentirse distinta por **cómo se mueve, cómo fija al jugador, dónde deja su ruta segura y qué familia enemiga toma protagonismo**.

### Implementación
1. **80 firmas de fase.** Se añadieron cuatro perfiles por Guardián (20 × 4). Cada perfil define maniobra de apertura, tipo de fijación, anticipación, desplazamiento del hueco seguro, familia de presión y un rasgo táctico breve.
2. **Apertura motriz signature.** La fase 1 inicia con la maniobra propia definida para ese Guardián. En fases 2–4, la ruptura existente marca una única maniobra signature de apertura; después el jefe vuelve al mazo anti-repetición v3.37. No se crean movimientos nuevos: se reutilizan los existentes.
3. **Fijación evolutiva.** Los telegráficos pueden pasar por fijación directa, predictiva, centrada o lateral según fase. La predicción usa la velocidad real del jugador y siempre se limita a los bordes seguros del área de combate.
4. **Hueco seguro evolutivo pero fiel.** En ataques radiales, el ángulo del hueco puede rotar según fase. En M7, el corredor libre puede desplazarse una banda. El disparo real sigue usando exactamente el hueco almacenado por el telegráfico, por lo que la señal visual no engaña.
5. **Composición de presión por fase.** El número de minions, caps y timers no cambia. Lo que cambia es la familia que encabeza cada presión y, en M11–M20, la familia elegida para la escolta avanzada. Así la fase tiene identidad táctica sin añadir densidad artificial.
6. **HUD de ruptura.** La segunda línea de la transición de fase muestra el rasgo signature activo (por ejemplo `FIJACIÓN VECTORIAL`, `WHITEOUT`, `SALTO NOVA`, `EMBOSCADA FINAL`) en lugar de repetir únicamente el nombre genérico del especial.

### Ejemplos de evolución
- **M11 · Soberano de Sílice:** SERPENTEO DE DUNA → BARRIDO DE SÍLICE → PICADO VITRIFICANTE → MIRAGE DE DOS SOLES.
- **M14 · Heliovorax:** ÓRBITA CORONAL → ARCO SOLAR → COLAPSO ESTELAR → SALTO NOVA.
- **M16 · Neurokhan:** ÓRBITA SINÁPTICA → SALTO DE NODO → FIJACIÓN VECTORIAL → CAMBIO DE FASE.
- **M17 · Skaldr:** ACECHO FENRIR → FLANCO HELADO → SALTO DE MANADA → WHITEOUT.
- **M19 · Arconte Zhyr:** SUSPENSIÓN PSI → BARRIDO PSIÓNICO → PICADO DE AGUJA → SALTO SILENTE.
- **M20 · Sauryx Necrorex:** CAZA NECROREX → DERRAPE SAURIANO → CARGA NECROESCAMA → EMBOSCADA FINAL.

### Sistemas deliberadamente preservados
- Curva de Guardianes M1–M20 y `CURVA_DIFICULTAD_v3.29.0.csv`.
- `spawnBoss()`, `bossPattern()`, `boss2Pattern()`, `boss2Special()`, `triggerBossSpecial()`, `applyBossVolleyAccent()`, `addEnemyBullet()` y `damageEnemy()` byte a byte.
- Enemy Behavior Evolution M11–M20.
- Telegraph CARGA → FIJACIÓN → IMPACTO y M6 EMP evitable.
- Ruptura de fase existente de 0,82 s; no se añade otro freeze global.
- Mazos anti-repetición v3.37.
- RIFT ALLY 10 s, Guardián Vinculado 12 s y Última Oportunidad 5 s.
- Tractor, Taller RIZOMA, DOMINIO, Hangar, Naves Rizoma y VFX.
- 840 assets heredados byte a byte.

### Filosofía
La escalada de fase debe ser **conductual y espacial**, no estadística. El jugador puede aprender un Guardián, pero no resolver todas sus fases con la misma lectura. Cada tramo conserva el vocabulario del jefe y reorganiza ese vocabulario en una intención táctica identificable.

### Limitación de prueba
No se declara campaña física M1→M20, smoke test visual real ni prueba Android/iOS. La entrega se valida mediante sintaxis, comparación de código crítico, integridad de assets, referencias y empaquetado.

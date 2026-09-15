# STARFALL FRONTIER v0.6.2 — Boss Reboot + Adrenaline Prelude

## Base
Esta versión se deriva directamente de **v0.6.1.1 PWA Asset Hotfix**, conservando economía, Boss Supply, Reactive Matrix Shadow, tienda, assets realistas W01–05, audio, PWA, streaming y progresión existente.

## Refuerzo de bosses
- Curva de HP de bosses incrementada por sector.
- Fortaleza inicial aumentada al 66% del HP del boss.
- Módulos orbitales y hardpoints reforzados.
- Límite de daño por impacto reducido al 1,4% del HP máximo.
- Armadura por fase reforzada y adaptación reactiva más temprana.
- Si un boss muere antes del umbral de combate rápido del sector, ejecuta **REACTOR REBOOT** una sola vez con **50% de HP**.
- El reboot entra en una fase más agresiva: más movilidad y menor cooldown de disparo.
- Un reboot rápido consume la posibilidad de otra resurrección para evitar cadenas de vidas artificiales.

## Refuerzo de subjefes
- HP base y curva por mundo incrementados.
- Escudo inicial aumentado al 54%.
- Menor daño máximo por impacto.
- Recarga de escudo de fase II reforzada.
- Mayor presión ofensiva y movilidad en segunda fase.

## Antesala de boss
La arena de boss ya no comienza de inmediato. Se añade una antesala de 12–16 s según sector con varias ráfagas de pequeños esbirros. No es una cuarta formación completa: son interceptores/esbirros móviles de baja resistencia destinados a mantener adrenalina y continuidad visual antes de la entrada del boss.

## Micro-enjambres
- Activos desde oleada 1.
- Mayor frecuencia y densidad progresiva.
- Oleada 3 puede recibir hasta 3 ráfagas.
- Los micro-enjambres activos mantienen la oleada unos segundos antes de la transición, evitando pantallas vacías abruptas.

## PWA y assets
No se sustituyeron ni regeneraron assets. Se conserva el Service Worker corregido del hotfix anterior, con nueva clave de caché `starfall-shell-v0.6.2` para evitar mezcla entre JS viejo y nuevo.

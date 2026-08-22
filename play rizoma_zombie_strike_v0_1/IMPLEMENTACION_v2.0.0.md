# Rizoma Zombie Strike v2.0.0 · Mundo 10 — Singularidad Final

## Alcance

Mundo 10 queda integrado como cierre jugable de campaña con siete actos, identidad apocalíptico-cósmica propia, retorno escalonado de los nueve Guardianes anteriores y combate final contra **Z.E.R.O.S. Prime**.

## Estructura de siete actos

1. **Frontera del colapso** — ingreso de Andro-Carroñeros y Necroides Zero.
2. **Retorno de los orígenes** — Ecos M1 y M2 con sus familias.
3. **Dinastías fracturadas** — Ecos M3 y M4 con linajes asociados.
4. **Convergencia Necro-Vacío** — Ecos M5 y M6.
5. **Abismo de Génesis** — Ecos M7 y M8 + Horda Apocalíptica ampliada.
6. **Última ruptura multiversal** — Eco de Kaiser Infinito + Frenesí Asesino ampliado.
7. **Trono de la Singularidad** — corredor final y Z.E.R.O.S. Prime.

Los Ecos son obligatorios para la progresión. Cuando existe más de un Eco en un acto, el director los serializa para evitar una superposición injusta de bosses completos.

## Enemigos propios W10

Tres familias, dos unidades por familia:

- **Andro-Carroñeros** — Andro-Carroñero / Raptor Zero.
- **Necroides de Conversión** — Necroide de Conversión / Apóstol de Niebla Zero.
- **Centuriones Zero** — Centurión Zero / Centurión Singular.

W10 mezcla progresivamente estas seis unidades con familias de W1–W9. El porcentaje de retorno aumenta con el avance y alcanza su máxima presión en los actos 5–6 y los modos especiales.

## Director de eventos

- Singularidades gravitacionales con aparición de enemigos dentro de la ruptura.
- Meteoros, planetas errantes y basura espacial del pool W10.
- Subjefes Zero entre los actos 2 y 6.
- Hordas Zero recurrentes con unidades propias y retornadas.
- Recompensas tácticas y kits de emergencia para sostener el incremento de dificultad.

### Horda Apocalíptica W10

Duración efectiva de **46 s**, mayor cap de enemigos, hazards adicionales, aparición de linajes anteriores y reservas de escudo/poder durante el evento.

### Frenesí Asesino W10

Duración efectiva de **30 s**, cadencia de aparición más rápida, perseguidores, singularidades y mayor movilidad enemiga. El acto no puede cerrarse mientras el evento especial siga activo.

## Z.E.R.O.S. Prime

- HP final reforzado para el arsenal acumulado del jugador.
- Escudo inicial de **4200** con regeneración y apoyo de Guardianes.
- Recomposición parcial de escudo por fases.
- Proyectiles Zero: lanzas, portales, esporas de conversión y ráfagas radiales.
- Singularidades gravitacionales y hazards durante especiales.
- Fases avanzadas con mayor densidad, dobles lanzas y summons.
- Ataque especial **Singularidad Final**.

## Compensación y herencia

El Mundo 10 recibe las reliquias acumuladas W1–W9. Se añadieron beneficios efectivos a Corazón Abisal, Génesis Orgánica e Hilos del Multiverso para equilibrar el final: escudo, duración de poderes, regeneración, potencia, crítico y cadencia.

Los combos de recuperación de W8–W10 también tienen matrices propias y W10 admite siete selecciones, una por acto.

## DOMINIO y cierre

- Nueva forma **bossShip10 · Núcleo Zero**.
- Firma heredada **Singularidad Final**.
- Sigilo propio `assets/boss2/sigil_w10.svg`.
- Reliquia final `world10Zero`.
- Recompensa monetaria final ampliada.
- Guardado/carga de `worldTenState`, Ecos, eventos especiales y progreso de siete actos.
- Repetición de niveles actualizada para mostrar correctamente los **7 actos de W10**.

## Visual

- `assets/world10/bg_world10_approach.jpg` — aproximación apocalíptica.
- `assets/world10/bg_world10_boss.jpg` — arena final.
- `assets/future/bosses/world10_zeros_prime.png` — boss canónico.
- atmósfera procedural W10 con órbitas, partículas rojo/violeta, anillos de singularidad y trazos críticos.
- los enemigos retornados conservan sus sprites previos cuando existen; los enemigos W9 conservan su render manga y las seis unidades W10 usan geometría Zero diferenciada.

## Compatibilidad

- W1–W9 conservan su lógica de campaña.
- Un perfil con Mundo 9 completado desbloquea Mundo 10 por migración.
- PWA actualizada a `v2.0.0` y caché de service worker renovada.

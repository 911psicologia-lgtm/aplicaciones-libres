# Rizoma Zombie Strike v3.4.0 — Balance global y cierre de Saga II

## Alcance

Esta entrega consolida la fase prevista después de Mundo 20. No abre Mundo 21. El objetivo es corregir la rampa de dificultad M14–M20, asegurar continuidad de progresión, cerrar Saga II y dejar el cliffhanger posterior como una señal sin número y no jugable.

## Balance global M14–M20

- Se corrige una regresión crítica en `WORLD_STAGE_TARGETS`: M17 y M19 no tenían tabla propia y caían al fallback `[20,30,40,50,60]`. Ahora M14–M20 forman una rampa continua.
- Objetivos finales por mundo:
  - M14: 48 / 64 / 82 / 102 / 124
  - M15: 50 / 66 / 84 / 104 / 128
  - M16: 52 / 68 / 86 / 106 / 132
  - M17: 54 / 70 / 88 / 108 / 136
  - M18: 56 / 72 / 90 / 110 / 140
  - M19: 58 / 74 / 92 / 114 / 144
  - M20: 60 / 76 / 94 / 118 / 148
- Se corrige otra caída severa de dureza en Guardianes M17–M19. Antes estos tres jefes volvían a multiplicadores genéricos mientras M14–M16 ya estaban escalados y M20 saltaba bruscamente al multiplicador final.
- Multiplicadores específicos de HP de Guardianes finales: M14 2.08, M15 2.18, M16 2.32, M17 2.42, M18 2.50, M19 2.58, M20 2.85.
- Escudos base finales: M14 3900, M15 4200, M16 4550, M17 4850, M18 5100, M19 5350, M20 5600; después se aplican dificultad y `COMBAT_DURABILITY` como antes.
- La durabilidad efectiva aproximada en Normal, antes de regeneraciones/escudos de fase, queda en una curva ascendente de ~89k, 105k, 124k, 143k, 164k, 186k y 225k para M14–M20.
- No se alteraron los multiplicadores de esbirros ni los patrones propios de los subjefes, porque sus HP base ya progresaban de forma sostenida. Se conservan las identidades de ecología y ataque.

## Progresión de nave

La progresión tardía ya no descarga todas las mejoras de primera victoria sobre el núcleo. M14–M20 distribuyen la evolución de piezas en cañón, motor, alas, núcleo, cañón, motor y alas. Esto mantiene sentido de crecimiento visual/táctico sin modificar los mundos anteriores.

## Cierre de Saga II

- Se elimina el duplicado de Mundo 18 en `SECOND_SAGA_WORLDS`; la lista queda exactamente M11–M20, diez mundos únicos.
- Se incorpora el logro `Nexo cerrado` por completar M11–M20 y derrotar a Sauryx Necrorex.
- El perfil persiste `sagaTwoCompletedAt` y `sagaThreeSignalDetected`. Los perfiles históricos que ya tenían M20 vencido se migran automáticamente.
- El resultado final de M20 cambia a `Cerrar Saga II`.
- El epílogo de M20 se ejecuta tanto en modo historia como en modo directo, porque es cierre estructural de campaña, no contenido opcional.
- El epílogo consolida explícitamente los siete ecosistemas finales M14–M20 y deja la siguiente saga como `SAGA III // ORIGEN DESCONOCIDO`, sin inventar ni habilitar Mundo 21.
- El Archivo de Mundos deja de presentar Saga II como “próxima saga”. Antes del cierre muestra progreso 0–10; después de M20 muestra `SAGA II COMPLETA · Nexo cerrado · Archivo 11–20`.
- Tras cerrar Saga II aparece una tarjeta de `SEÑAL SIN NÚMERO`, marcada como cliffhanger no jugable.

## UX preservada de v3.4.0

Se mantienen los cambios de la pasada UI: fullscreen/orientación móvil, overlays compactos de victoria/derrota, botón fullscreen en HUD, playlist ambiental rotativa, jefe M2 ampliado y mayor presencia frontal en M1.

## Regresiones evitadas

- Tienda sigue pausando completamente y devuelve el estado de pausa exacto al cerrar.
- Repetición y entrenamiento no alteran la campaña.
- Las naves DOMINIO y reliquias siguen registrándose al derrotar Guardianes.
- No se añadieron placeholders ni se sustituyeron fondos aprobados.
- No se abrió contenido jugable posterior a M20.

# RIZOMA ZOMBIE STRIKE v3.57.0 — CONTRAVECTOR RIZOMA + RUPTURA DE PATRÓN

## Propósito
Convertir la lectura avanzada de proyectiles del Guardián en interacción física con su propia ofensiva, sin aumentar HP, sin bloquear poderes y sin añadir una nueva capa de saturación.

## 1. Contravector Rizoma
- Los near-miss signature siguen cargando Rizoma Flow.
- Cada lectura signature añade carga vectorial independiente.
- Al alcanzar el umbral, el proyectil enemigo recién esquivado se transforma realmente en proyectil aliado.
- El proyectil invertido adquiere homing hacia el Guardián, una sola perforación, daño limitado y VFX de la Nave Rizoma activa.
- Flow y Duelo Rizoma aceleran moderadamente la carga.
- Cooldown vectorial evita spam.

## 2. Ruptura de Patrón
- Dos Contravectores en la misma fase pueden activar una Ruptura de Patrón, como máximo una vez por fase.
- Cancela la secuencia signature corriente, retrasa brevemente la siguiente firma y disipa una cantidad limitada de proyectiles cercanos.
- Puede abrir Núcleo Expuesto si el cooldown de counterplay lo permite.
- Si existían Anclas de Fase, sus nodos se retiran de manera segura para evitar objetivos huérfanos.

## 3. Protección del Último Asalto
- Los Contravectores siguen disponibles durante Último Asalto.
- No pueden provocar Ruptura de Patrón ni cancelar el cierre del Guardián.
- Cada parry reduce solo 0,35 s del temporizador final, limitado por el cooldown del propio sistema.

## 4. Telemetría
Nuevos contadores:
- `countervectors`
- `patternBreaks`
- `lastStandParries`

La pantalla final muestra Contravectores y Rupturas cuando ocurrieron.

## 5. Conservación
- 20 mundos, sin Mundo 21.
- Sin assets nuevos ni alterados.
- HP base, economía y progresión preservados.
- Director Adaptativo, Resurrección, Arena Control, Escort Synergy, Riposta, Anclas, Flow y Duelo Rizoma permanecen activos.

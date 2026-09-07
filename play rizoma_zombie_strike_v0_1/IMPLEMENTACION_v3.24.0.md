# Rizoma Zombie Strike v3.24.0 — Continuidad de combate

## Objetivo
Eliminar los tramos visualmente vacíos sin convertir cada segundo en una horda de alta dificultad.

## Sistema nuevo: Microenjambres de continuidad
- Comprueba con frecuencia cuántos enemigos hostiles están realmente visibles dentro del área jugable.
- Mantiene un piso visual adaptativo:
  - móvil: 2 enemigos menores normalmente, 1 durante Guardián;
  - tablet: 3 normalmente, 1 durante Guardián;
  - PC: 4 normalmente (5 en niveles altos), 2 durante Guardián.
- Si el campo cae por debajo del piso, genera un microenjambre de unidades ligeras propias del mundo actual.
- Los microenemigos son deliberadamente fáciles: menos vida, menor tamaño, menor daño por contacto y menor cadencia ofensiva.
- No cuentan para los objetivos de progresión de nivel, evitando avanzar niveles por “relleno”.
- No generan drops tácticos aleatorios, evitando granjas de poderes/recursos.
- Sí conservan pequeñas recompensas de puntuación/XP/moneda y sirven como blancos activos para poderes, Guardianes aliados y combos.
- Durante batallas de Guardianes el sistema reduce el piso y la peligrosidad para mantener vida visual sin distraer del jefe.

## Integridad
No se modificaron los 20 mundos, Saga II, Hangar, DOMINIO, Flota, cinemáticas ni progresión de desbloqueos.

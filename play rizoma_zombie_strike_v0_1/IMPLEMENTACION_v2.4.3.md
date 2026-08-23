# IMPLEMENTACIÓN v2.4.3 · Arsenal crítico

## Alcance
Continuación de la implementación preparada sobre la base v2.4.2, sin alterar fondos ni progresión de mundos.

## Rayo Fractal
- Duración fijada en **10 s**.
- El rayo ahora selecciona un **objetivo primario**; si existe Guardián activo, lo prioriza.
- Desde ese núcleo nacen **ramificaciones fractales** hacia varios enemigos cercanos.
- El haz principal es más grueso y legible que las ramas.
- La cadencia sostenida aumenta para que se perciba como poder continuo y no como destello aislado.

## Escuadrón Réquiem
- Duración fijada en **12 s**.
- Invoca una formación real de **4 a 6 naves aliadas** según pantalla y combo.
- Las naves pueden usar formas de Guardianes ya capturadas.
- Permanecen alrededor del jugador, distribuyen blancos y realizan fuego autónomo.
- La intervención añade además pasadas coordinadas de proyectiles rastreadores.

## Plaga Hemófaga y Enjambre Cazador Rizomático
- Plaga Hemófaga: duración ajustada a **10 s**.
- Enjambre Cazador Rizomático: duración ajustada a **12 s**.
- Se conserva la expansión progresiva de nodos y ralentización del rizoma.

## Bombardeo Meteórico
- Duración activa establecida en **9 s** dentro del sistema de intervenciones críticas.

## Satélites Abisales
- Se mantienen los cambios de v2.4.2.
- Ahora también se renderizan cuando el jugador utiliza una **forma DOMINIO/bossShip**, evitando que desaparezcan visualmente al cambiar de nave.

## Bomba Omega
- Se conserva la lógica aprobada de v2.4.2: elimina menores, merma medios/élites/Guardianes y disipa proyectiles hostiles.

# Rizoma Zombie Strike v3.22.0 — UX táctica + Guardián aliado autónomo

## 1. Compra Exprés compacta
- El overlay vuelve a ocupar todo el viewport como backdrop real, evitando zonas muertas/click-through.
- El panel se reduce a una franja táctica horizontal con tarjetas compactas.
- Navegación horizontal mediante gesto, rueda y botones izquierda/derecha.
- La recomendación sigue siendo visual mediante pulso amarillo; no añade texto redundante.
- La X permanece fija y visible en la esquina superior derecha del panel.
- Se puede cerrar con X o tocando/clicando fuera.
- Se incorporó una guarda temporal anti-click-through para evitar que el mismo gesto vuelva a abrir el panel al cerrarlo.

## 2. DOMINIO como selector real de preparación
- El selector ya no muestra solo la Nave Rizoma actualmente activa.
- Lista primero TODAS las Naves Rizoma propias desbloqueadas y después las formas de Guardianes conquistados.
- Cada Nave Rizoma utiliza su asset real y puede seleccionarse desde el mismo carrusel.
- La elección actualiza la nave activa, cancela una Flota de Conquista preparada si corresponde y conserva la proporción de escudo durante el cambio en vivo.
- El Hangar principal continúa siendo el centro de preparación persistente para la siguiente salida.

## 3. Guardián Vinculado autónomo
- Prioriza amenazas por jerarquía: jefe > subjefe/capitán/élite > unidades de presión > enemigos comunes.
- Persigue de forma autónoma al objetivo prioritario en vez de seguir pasivamente al jugador.
- Mantiene su ataque característico y el Eco Mejorado del poder de la nave.
- Intercepta proyectiles próximos al jugador y recupera una pequeña cantidad de escudo.
- Ejecuta embestidas contra amenazas cercanas; la embestida roba una cantidad limitada de vida/escudo para ayudar a superar una crisis sin trivializar el jefe.
- Mantiene 12 segundos de presencia y cooldown largo.

## 4. Densidad enemiga
- +10% adicional al límite simultáneo del director de Adrenalina respecto de v3.21.
- +10% adicional aproximado a la presión de esbirros durante Guardianes.
- Se conservan límites más bajos en móvil para rendimiento y legibilidad.

## 5. Sistemas preservados
- 20 mundos y cierre de Saga II.
- Intro general y microintro M1.
- Naves Rizoma animadas y assets realistas.
- Flota de Conquista, DOMINIO, reliquias y progresión.
- Tamaño visual de nave de v3.21 (+20% PC/tablet; +5% teléfono) sin agrandar hitbox.

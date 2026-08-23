# IMPLEMENTACIÓN v2.4.7 · Defensa y control

## Alcance
Continuación ordenada del arsenal. Esta pasada eleva los poderes defensivos y de control al mismo nivel funcional y visual de las intervenciones críticas, sin modificar fondos ni progresión.

### Bastión Cinético
- Evoluciona `ring` conservando compatibilidad con backups.
- Duración: **10 s**.
- Mantiene empuje de proximidad, pero reduce de forma fuerte el desplazamiento aplicado a Guardianes y élites.
- Intercepta proyectiles hostiles cercanos a una cadencia limitada, evitando invulnerabilidad total.
- Cada intercepción devuelve una pequeña fracción de escudo.
- La fusión Bastión Orbital conserva el bloqueo superior.

### Campo Criotemporal
- Evoluciona `ice`.
- Duración: **10 s**.
- Los impactos acumulan escarcha.
- Al alcanzar el umbral, enemigos menores/medios quedan congelados brevemente; élites reciben una congelación mucho más corta.
- Guardianes no quedan congelados, solo ralentizados.
- Se añadió lectura visual de escarcha y congelación.

### Blackout OPEM
- Duración: **9 s**.
- Cada pulso limpia proyectiles dentro del radio operativo.
- Inhibe temporalmente la cadencia ofensiva de enemigos normales y élites.
- Contra Guardianes solo retrasa ligeramente el siguiente patrón/especial.
- Doble onda visual para diferenciarlo del Pulso Disruptor.

### Minas de Singularidad
- Conserva el ID `gravmine`.
- Duración: **12 s**.
- El pozo atrae enemigos con fuerza según rango; el efecto sobre Guardianes está severamente reducido.
- Curva proyectiles hostiles hacia el núcleo y puede absorberlos si alcanzan el centro.
- Finaliza con un colapso de daño de área reducido contra Guardianes.

### Pulso Disruptor
- Duración: **10 s**.
- Se especializa en defensa inmediata: anula proyectiles en un radio amplio.
- Convierte una parte limitada de los proyectiles destruidos en escudo.
- Su daño directo es secundario y reducido contra Guardianes.

### Burbuja de Estasis
- Mantiene **10 s**.
- Conserva ralentización global de enemigos y proyectiles.
- Nueva representación visual temporal alrededor de la nave.

### Fase Espectral
- Duración: **9 s**.
- Mantiene reducción fuerte de daño.
- Añade +8% de maniobra y elimina periódicamente un proyectil que llegue a distancia crítica de la nave.
- Nueva lectura visual de desacople espectral.

### Nanorreparación Orgánica
- Mantiene **12 s**.
- Conserva regeneración continua.
- Añade pulsos periódicos que reparan vida faltante y aportan una pequeña recuperación de escudo.

### Tractor Gravitacional
- Mantiene **12 s**.
- Corrige el vector de atracción para que el aumento de alcance afecte de forma simétrica a X/Y.
- Acelera la recogida automática mientras el poder está activo.
- No altera recompensas que exigen recogida manual (compras, kits tácticos o intervenciones críticas).

## Duraciones mínimas
En coherencia con la regla de diseño del arsenal, también se normalizaron poderes temporales que aún estaban por debajo de 8 s: `pulse` 8 s, `virus` 8 s y `kamikaze` 8 s. La Bomba Omega se mantiene fuera de esa regla por ser una activación instantánea.

## Compatibilidad
No se añaden IDs nuevos de persistencia. Todos los cambios reutilizan los IDs existentes.

# RIZOMA ZOMBIE STRIKE v3.36.0
## Guardian Telegraph & Combat Readability

### Base de continuidad
Esta versión parte exclusivamente de **v3.35.0 — Enemy Behavior Evolution**. No reconstruye el proyecto, no crea Mundo 21 y no sustituye assets existentes.

### Objetivo
Mejorar la lectura de los ataques especiales de los 20 Guardianes, especialmente en pantallas móviles, de forma que el jugador pueda reconocer con anticipación **qué se está preparando, dónde ocurrirá y qué zona conviene evitar o aprovechar**, sin reducir la dificultad mediante nerfs generales ni aumentar HP.

### Implementación principal

1. **20 perfiles de telegráfico, uno por Guardián**
   - M1: ÓRBITA
   - M2: ESPORAS
   - M3: REACTOR
   - M4: ECLIPSE
   - M5: GRAVEDAD
   - M6: EMP
   - M7: MAREA
   - M8: GESTACIÓN
   - M9: PORTALES
   - M10: SINGULARIDAD
   - M11: DOS SOLES
   - M12: PRESIÓN
   - M13: NÚCLEO
   - M14: NOVA
   - M15: PERISTALSIS
   - M16: SINAPSIS
   - M17: CACERÍA
   - M18: VIÑETA
   - M19: PSIÓNICA
   - M20: NECROESCAMA

2. **Tres estados visuales de preparación**
   - CARGA
   - FIJACIÓN
   - IMPACTO

   La señal aumenta progresivamente su claridad a medida que se aproxima el ataque.

3. **Ventana ligeramente mayor en móvil**
   La duración del telegráfico recibe un pequeño sesgo adicional en pantalla reducida. Esto mejora lectura táctil/visual sin modificar la velocidad de los proyectiles después del disparo.

4. **Objetivos fijados de forma coherente**
   Los ataques dirigidos registran la posición objetivo al comenzar la preparación. La marca visual y el ataque posterior comparten ese mismo objetivo cuando corresponde.

5. **Corredores y huecos seguros reales**
   Los patrones que ya dejaban huecos en sus barridos ahora precalculan el espacio durante el telegráfico y el disparo respeta esa misma planificación.
   - M7 usa un carril previamente señalado.
   - M9–M20, cuando el patrón radial aplica, usan un ángulo de hueco común entre aviso y descarga.

6. **M6 EMP convertido en amenaza evitable**
   Se conserva la magnitud del drenaje existente, pero deja de ser un castigo directo inevitable. El EMP fija una zona y solo afecta al jugador si permanece dentro del radio marcado cuando se resuelve el ataque.

7. **Ventana final de legibilidad**
   Durante la fracción final del telegráfico se evita iniciar una nueva ráfaga regular del Guardián. No se congela el combate: proyectiles existentes, enemigos, hazards y otros sistemas continúan activos. El objetivo es impedir que una descarga ordinaria tape visualmente el ataque signature que está por ocurrir.

8. **Render independiente del sprite del Guardián**
   La capa de telegráfico se dibuja antes de la inclinación/escala/animación visual del boss, evitando que las marcas de objetivo o corredores se deformen con el sprite.

### Sistemas explícitamente preservados
- Campaña de 20 mundos.
- Curva HP de Guardianes.
- Enemy Behavior Evolution de v3.35.
- HP base de enemigos.
- `damageEnemy()`.
- Las seis Naves Rizoma y sus VFX/firmas de impacto.
- RIFT ALLY (10 s).
- Guardián Vinculado (~12 s).
- Última Oportunidad (5 s).
- Tractor progresivo.
- Taller RIZOMA.
- DOMINIO.
- Hangar.
- PWA / responsive.
- Assets reales existentes.

### Filosofía del ajuste
La dificultad debe proceder de patrones, presión y decisiones tácticas, no de ataques imposibles de leer. **Telegráfico más claro no significa jefe más débil**: significa que el jugador puede aprender el patrón, anticiparlo y fallar o acertar por su propia respuesta.

### Limitación de prueba
No se declara smoke test visual real en navegador ni prueba física Android/iOS. La versión se valida mediante sintaxis, integridad estructural, comparación de código crítico, referencias y empaquetado.

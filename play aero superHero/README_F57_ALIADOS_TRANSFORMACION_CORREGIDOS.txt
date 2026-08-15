Aero · Fase 57 · Aliados y transformación corregidos

Corrección sobre lo reportado:
- El juego podía mostrar "Intento fallido" aunque la stamina estuviera alta.
- El poder de transformación no se sentía útil.
- El pickup de aliados se tomaba, pero S2 y S3 no se veían claramente ni ayudaban de forma evidente.

Cambios funcionales:
1. Stamina como defensa real
- Ahora, cuando Aero recibe golpes y tiene stamina suficiente, el golpe primero consume stamina.
- No convierte inmediatamente el golpe en error.
- Si Aero se queda sin vidas pero conserva stamina suficiente, la stamina evita la caída final una vez y lo deja continuar.
- Esto corrige el caso visual de "fallido" con stamina alta.

2. Transformación anti-jefe corregida
- Ahora la transformación bloquea golpes mientras está activa.
- Drena poca stamina, pero evita daño/error.
- Tiene aura visible alrededor de Aero.
- Muestra contador TRANS.
- Mientras está activa y hay jefe cerca, hiere al jefe de forma periódica.
- No mata de una, pero sí lo deja realmente afectado.

3. Aliados S2 y S3 visibles y útiles
- S2 y S3 aparecen físicamente junto a Aero.
- Son más grandes y visibles.
- Tienen brillo propio, etiqueta y contador de segundos.
- Disparan automáticamente cada pocos instantes.
- Sus disparos buscan enemigos o jefe cercano.
- En modo nave aparecen como mini-naves escolta.
- Al recoger el poder aparece invocación visual.
- También se activan automáticamente una vez al entrar en zona de jefe para asegurar que funcionen en todos los mundos.

4. Balance
- Los disparos de aliados son más fuertes y frecuentes.
- El poder de aliados dura 10 segundos.
- No agrega colisiones nuevas, por tanto no encierra ni bloquea a Aero.

Validación:
- main.js validado con node --check.

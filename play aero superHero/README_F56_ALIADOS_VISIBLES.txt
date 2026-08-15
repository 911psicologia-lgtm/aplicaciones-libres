Aero · Fase 56 · Aliados visibles S2 y S3

Corrección solicitada:
- El pickup de aliados sí se tomaba, pero S2 y S3 no aparecían visualmente.
- Ahora S2 y S3 aparecen en pantalla durante 10 segundos y disparan junto a Aero.

Implementado:
- S2 aparece a un lado de Aero con brillo verde.
- S3 aparece al otro lado con brillo azul.
- Ambos tienen etiqueta visible con contador de segundos.
- Ambos disparan automáticamente cada pocos instantes.
- Sus disparos buscan enemigos o jefe cercano.
- Funcionan en modo normal y también en modo nave/vuelo.
- En modo nave aparecen como mini-naves escolta.
- Se agregó efecto visual al invocarlos.
- Se aseguró que exista pickup de aliados en todos los mundos 1, 2, 3, 4 y 5.

Detalles:
- Duración estándar: 10 segundos.
- Disparan proyectiles tipo láser con efecto brillante.
- Si hay jefe activo, también lo atacan.
- No cambian el diseño de niveles ni añaden colisiones nuevas.

Validación:
- main.js validado con node --check.

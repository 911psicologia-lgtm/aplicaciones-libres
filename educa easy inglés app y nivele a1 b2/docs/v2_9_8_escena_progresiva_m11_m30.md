# v2.9.8 · Escena progresiva M11–M30

## Alcance
Mejora preservativa aplicada únicamente al comportamiento de los Diálogos integradores M11–M30.

## Cambios
- M1–M10 conservan el formato clásico: pregunta/frase → respuesta → siguiente ítem.
- M11–M30 usan formato de escena acumulativa.
- Lado izquierdo: conversación acumulada.
- Lado derecho: opciones para continuar el diálogo.
- Al acertar, la respuesta correcta se agrega a la escena.
- Después se puede continuar con la siguiente intervención.
- En celular se usa una sola columna.
- Se creó almacenamiento independiente: `deepIntegratorProgress`.
- No se tocó `animatedDialogueProgress` ni el módulo 🎬 Diálogo animado.

## Validación
- Diálogos profundos integrados: 20.
- Rango: M11–M30.
- JS validado con `node --check`.
- JSON y manifest validados.

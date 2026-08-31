# KBIT Protocolo Cognitivo v0.8.0

Aplicación multiarchivo preparada para Cloudflare Pages.

## Cambios principales de v0.8

### Presentación discreta
- Es el modo predeterminado durante la administración.
- Oculta 0/1, correcta/incorrecta, claves profesionales, estadísticas de aciertos, crédito, baremo y mensajes de corrección.
- El evaluador puede puntuar respuestas verbales con Alt+1 / Alt+0 incluso mientras escribe en el campo de respuesta.
- Alt+N registra incidencia/no administrado.
- Matrices registra A-H y puntúa internamente sin mostrar el resultado.
- El cierre de una subprueba se presenta de forma neutral cuando el evaluado sigue viendo la pantalla.
- Un candado permite abrir el panel profesional completo solo cuando hay privacidad.

### Informes diferenciados
La pantalla Informes contiene tres salidas independientes:
1. Informe técnico: motor local, núcleo psicométrico completo.
2. Contextual base: motor local, sin IA.
3. Contextual + IA: núcleo técnico local + texto externo anonimizado.

La vista Contextual + IA ya no muestra silenciosamente el informe base cuando no existe una respuesta de IA. En ese caso informa explícitamente que no hay contenido de IA cargado. Al pegar texto de IA, la previsualización se actualiza en tiempo real.

El prompt de IA solicita un informe contextual completo en 12 secciones y prohíbe reducirlo a un resumen ejecutivo.

## Estímulos
- Vocabulario expresivo: 45/45 disponibles.
- Definiciones: 37/37 disponibles.
- Matrices: 48/48 disponibles.
- VE-2, VE-3 y DEF-27 continúan identificados como sustitutos aprobados en auditoría, no como faltantes.

## Manual
Incluye manual actualizado en HTML, DOCX y PDF con Presentación discreta, atajos privados y separación de los tres informes.

## Publicación
Subir el contenido descomprimido a Cloudflare Pages. `index.html` está en la raíz.

## v0.8.1
- Calificación directa con teclas 0 y 1, sin Alt.
- Funciona incluso con el cursor en el campo principal de respuesta.
- Los campos de observaciones conservan escritura numérica normal.
- La vista discreta no muestra al evaluado qué significan 0/1.

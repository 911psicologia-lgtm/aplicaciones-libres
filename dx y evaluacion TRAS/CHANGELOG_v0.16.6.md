# TRAS v0.16.6 · Devolución terapéutica interactiva para adolescentes

## Nuevo producto clínico

Se incorpora en el Centro de informes una **devolución terapéutica para adolescentes**, distinta de los informes técnicos dirigidos a padres, docentes y profesionales.

El producto trabaja en dos capas:

1. Un prompt especializado reúne HC, TRAS, Goldstein, perfil descriptivo, informe integrativo, anexos y evaluaciones complementarias.
2. La IA devuelve únicamente contenido JSON; la app lo inserta en una plantilla HTML autónoma, interactiva y lista para subir a Cloudflare Pages.

## Plantillas e identidad

- Tratamiento masculino.
- Tratamiento femenino.
- Tratamiento trans/diverso afirmativo.
- Tratamiento neutro sin inferir género.

La app solo propone una opción desde el campo explícito `sexo/género`. Nunca deduce una identidad trans por el nombre, la apariencia, los vínculos o las respuestas clínicas. La selección puede corregirse manualmente y dispone de un campo específico para pronombres indicados.

Las paletas visuales pueden mantenerse automáticas o elegirse independientemente: bosque, océano, violeta o neutra. Esto evita convertir la identidad en un estereotipo cromático obligatorio.

## Experiencia adolescente

La página exportada incluye:

- bienvenida no diagnóstica;
- recursos y apoyos en etiquetas breves;
- grandes temas organizados en tarjetas desplegables;
- segunda capa «quiero saber más»;
- temas sensibles diferenciados visualmente sin revelar alertas internas;
- ruta terapéutica seleccionable;
- almacenamiento local de los temas elegidos;
- botón para preparar y copiar lo que la persona quiere conversar en la próxima sesión;
- cierre abierto, no determinista;
- adaptación móvil, movimiento reducido e impresión legible.

## Revisión profesional

Antes de exportar, el profesional puede:

- revisar identidad, alias y pronombres;
- permitir u ocultar temas sensibles;
- elegir profundidad;
- revisar y editar el JSON estructurado;
- ver alertas de revisión que nunca se muestran en el HTML entregado;
- previsualizar la página dentro de la app;
- exportar un HTML único o el JSON del contenido.

## Seguridad del prompt

El prompt:

- no muestra porcentajes, pruebas, escalas ni diagnósticos al adolescente;
- no convierte todas las áreas del TRAS en una lista extensa;
- exige curaduría temática sin perder información decisiva;
- diferencia recursos, tensiones, patrones y ruta para evitar repeticiones;
- evita detalles innecesarios en asuntos sensibles;
- reserva dudas, contradicciones y contenido no publicable para `alertas_revision`;
- exige JSON válido sin markdown ni texto adicional.

# Revisión de informes · edición 17.6 licenciada

Fecha: 11 de noviembre de 2026.

## Resultado del análisis

En los dos informes aportados se conservaron las 84 filas de puntuaciones y los 64 ítems críticos únicos. El problema principal estaba en la composición del documento: se añadía la narrativa automática junto a la integración contextual de IA, se concentraban las conclusiones en un bloque y la gráfica longitudinal solo admitía escalas clínicas con diferencias T calculables. Por ello, un antecedente con VRIN, TRIN, Fb y Mf podía tener tabla pero carecer de gráfico.

La edición 17.6 conserva las tablas locales y utiliza una sola interpretación principal por sección. La información contextual de IA sustituye al texto automático cuando está disponible. Las secciones sin texto de IA mantienen su contenido local. La ficha de identificación, la firma, las puntuaciones y las figuras se generan desde el registro, sin depender de que la IA los vuelva a escribir.

## Formatos del informe sin IA

El selector está en **Informe → Contenido del informe → Formato del informe sin IA**. Cambia las casillas y la vista del informe al elegir una opción.

| Contenido | Base | Extendido |
|---|---|---|
| Ficha, motivo y antecedentes | Sí, según los datos y preferencias de identificación | Sí, con las mismas preferencias |
| Historia completa del caso | Desactivada | Activada cuando hay texto |
| Técnica, fuentes, validez, escalas clínicas y de contenido | Sí | Sí |
| Suplementarias y PSY-5 | Sí | Sí |
| Gráficas | Sí | Sí |
| Subescalas Harris-Lingoes | Desactivadas | Activadas |
| Correspondencia con clústeres DSM-5 | Desactivada | Activada con PSY-5 |
| Ítems críticos | Koss-Butcher, resumen temático con números y respuestas | Koss-Butcher y Lachar-Wrobel, detalle temático sin duplicar ítems |
| Descriptor breve en las tablas | Desactivado; se conserva la interpretación narrativa | Activado |
| Integración, recursos, impresión tentativa, limitaciones, conclusiones y recomendaciones | Activados | Activados |
| Pronóstico | Desactivado | Activado únicamente con entrevista suficiente |
| Contraste longitudinal | Si hay puntuaciones anteriores | Si hay puntuaciones anteriores |
| Referencias técnicas | Sí | Sí |

La selección de contexto, nota de alcance, firma, datos de identificación y autorización de texto literal se conserva al cambiar de formato. El texto literal nunca se activa por elegir Extendido. **Personalizado** conserva las selecciones previas o los cambios manuales. Los casos antiguos no se convierten automáticamente en Base o Extendido.

El informe con IA guarda su selección por separado al elegir un formato. **Usar estas secciones también en IA** aplica expresamente las casillas actuales al informe IA y a su siguiente prompt. La privacidad, identificación, contexto y firma se comparten entre ambos informes.

## Cambios en la composición

- Se elimina el apartado numerado «Encabezado institucional» y su frase de relleno. Se conservan el título del documento y la institución opcional, sin numeración. La primera sección es la ficha de identificación.
- Las conclusiones de IA se presentan en párrafos. Si un JSON anterior trae una lista, sus elementos se convierten en párrafos; si trae un párrafo largo con varias oraciones, se divide conservando el texto y el orden de las ideas.
- Se preservan los cuadros cualitativos de IA, como «Cronología documentada y estado de verificación». El prompt solicita que relacionen fuentes, fechas, hechos y límites sin duplicar las tablas psicométricas locales.
- Se refuerza la contextualización: funcionamiento actual, cronología, tratamiento y convergencia entre fuentes. La aplicación conserva lo que el JSON aporte; no puede completar por sí sola entrevistas o antecedentes ausentes.
- Se corrige el validador para distinguir la abreviatura PD de la escala Pd, PD+K de la escala K y puntuaciones históricas documentadas de las puntuaciones actuales. Se mantienen las verificaciones de valores incompatibles y del límite de Es.
- La biblioteca interpretativa original permanece intacta. En el resumen del número de elevaciones clínicas se aclara la lectura separada de Mf, sin contar esa escala como indicador psicopatológico.
- Las filas breves de las tablas se mantienen juntas al exportar a Word y PDF, para evitar que un resultado quede cortado entre páginas.

## Contraste longitudinal recuperado

La gráfica incluye todas las parejas disponibles de T publicadas, también VRIN, TRIN y Fb. Conserva límites, marcas de verificación y dirección de TRIN en las etiquetas. Las dos series tienen leyenda y estilos distintos. Los valores se colocan para evitar que se superpongan.

El análisis automático identifica las puntuaciones previas y actuales, explica el tipo de contraste disponible y señala los datos que faltan. Si hay texto de IA, se presenta después como integración contextual del contraste. El gráfico y el análisis se generan en ambos formatos sin IA y en el informe IA, respetando las casillas de comparación y gráficas.

Las diferencias T requieren baremo, sexo normativo, versión, clave y fuente confirmados, además de puntuaciones sin límites ni verificación pendiente. TRIN requiere dirección coincidente y documentada. Cuando falta esa información, el gráfico se identifica como contraste documental y no atribuye mejoría o deterioro clínico. Las PD quedan en la tabla y no se dibujan como T.

Se utiliza el campo estructurado de puntuaciones anteriores. Las cifras citadas en una historia que mezcla instrumentos o fechas no se importan automáticamente a una misma serie longitudinal. El evaluador puede completar los antecedentes y su procedencia en la ficha del caso.

## Selecciones de secciones verificadas

En el ejemplo ficticio se aportan puntuaciones anteriores y texto de historia; no se activa contexto de la solicitud ni se documenta entrevista suficiente.

**Base, 17 secciones:** ficha de identificación → motivo → antecedentes → técnica y fuentes → examen mental → validez → clínicas → contenido → suplementarias y PSY-5 → ítems críticos → integración → recursos → contraste longitudinal → impresión tentativa → limitaciones → conclusiones → recomendaciones.

**Extendido, 18 secciones:** ficha de identificación → motivo → antecedentes e historia del caso → técnica y fuentes → examen mental → validez → clínicas → contenido → suplementarias y PSY-5 → Harris-Lingoes → ítems críticos → integración → recursos → contraste longitudinal → impresión tentativa → limitaciones → conclusiones → recomendaciones.

Las referencias y la firma se conservan al final. Las diferencias de detalle dentro de una sección no crean necesariamente otro número de sección. El plan completo con todas las opciones y datos necesarios tiene 21 secciones; el mínimo verificado tiene 8. La numeración es consecutiva y un JSON anterior con el encabezado retirado sigue siendo aceptado.

## Comprobaciones de esta entrega

| Comprobación | Resultado |
|---|---|
| Pruebas automáticas de informes, opciones, migración, JSON y licencias | 24 aprobadas; 0 fallos; 0 omitidas |
| Pruebas de hoja de respuestas y perfiles PDF | 9 aprobadas; 0 fallos; 0 omitidas |
| Autopruebas internas del motor | 15 aprobadas |
| Catálogo de activación | Las 81 claves suministradas activan con su cupo correspondiente |
| Caso guardado y selección personalizada | Conservados |
| Preset Base, Extendido y selección independiente de IA | Verificados |
| Ausencia de puntuaciones anteriores | Sin sección de contraste y casilla deshabilitada |
| Koss-Butcher y Lachar-Wrobel combinados | Sin números de ítem duplicados |
| Contraste de las cuatro T de regresión | Tabla, análisis y gráfica presentes; sin diferencias T inventadas |
| Word, PDF, HTML, Excel, JSON y TXT | Generados desde el mismo modelo; gráficas reales de Chart.js |
| Word renderizado y PDF nativo | Revisión visual de ejemplos ficticios |
| Fondos y trazos de formularios PDF | Verificación independiente aprobada en 9 documentos |
| Motor, baremos, biblioteca interpretativa, licencias, plantillas y dependencias protegidas | 41 archivos idénticos a 17.5, mediante SHA-256 |
| Caché sin conexión | Regenerada con los recursos locales de la edición |

Los registros completos están en `PRUEBAS_INFORMES_17_6.txt`, `PRUEBAS_FORMULARIOS_17_6.txt`, `integridad-17-6.json` y `verificacion-vectorial-17-6.json`. Los ejemplos de Base, Extendido e IA están en `ejemplos/17_6/`; son ficticios y no constituyen informes de una persona real. El ejemplo IA ilustra el formato de integración admitido, sin representar una respuesta generada por un proveedor externo en esta prueba.

Las pruebas de interfaz ejecutan los métodos reales con un adaptador de entorno. No se realizó una sesión manual completa en Chrome, Edge o Safari. La comprobación final de instalación y actualización debe realizarse en el navegador donde se utiliza la aplicación.

## Instalación

Actualizar la carpeta `app/` en el mismo dominio y perfil de navegador conserva casos, selecciones y consumo de licencia. No es necesario cambiar ni emitir nuevas claves. No borre los datos del sitio para actualizar; utilice el aviso **Actualizar** de la aplicación. Para trasladar casos a otro origen o equipo, use la copia de seguridad JSON.

La aplicación sigue generando la hoja de respuestas y los perfiles mexicano y estadounidense incorporados en 17.5. El ZIP no incluye los archivos administrativos que contienen las claves de activación en texto claro.

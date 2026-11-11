# MMPI-2 · Suite clínica licenciada 17.3

Actualización de la edición V16 licenciada. El paquete conserva la aplicación estática y los casos guardados en el mismo origen del navegador. La revisión de informes parte de las secciones acordadas para la 17.2 y se integra con los exportadores y el sistema de activación de esta edición.

## Abrir o actualizar

1. Extraiga el ZIP. La carpeta `app/` contiene `index.html`, los recursos del sitio y el código.
2. Para actualizar un sitio existente, use esa carpeta como raíz y conserve su dominio y perfil de navegador. Si la PWA avisa que hay una versión nueva, pulse **Actualizar**.
3. Para una prueba local, desde la carpeta extraída puede ejecutar `python -m http.server 8000 --directory app` y abrir `http://localhost:8000`. Use HTTPS en un sitio publicado. El servidor sirve archivos estáticos y la app valida la activación en el navegador.
4. Para trasladar casos a otro equipo u origen, use la copia de seguridad JSON de los casos. El registro de saldo corresponde al navegador y al origen donde se activó la clave.

## Activación

- El catálogo incorporado contiene las huellas de las **81 claves suministradas**, 80 en los ocho planes de 5 a 50 aplicaciones y una maestra ilimitada. Los archivos con las claves se entregan por separado para administración.
- Una clave del lote previamente activa en V16 conserva su saldo al actualizar en el mismo navegador y dominio. Cambiar de clave o volver a activarla conserva el consumo anterior.
- La licencia registra una finalización por caso. Volver a exportar o revisar un caso finalizado conserva el saldo. Se abre el informe del último cupo y los informes guardados quedan disponibles con la licencia agotada.
- El validador usa SHA-256 mediante Web Crypto. El control de saldo es local. En navegadores con Web Locks, la finalización y la activación se coordinan entre pestañas del mismo origen. [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) · [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

## Informes

- En **Contenido del informe** se eligen los datos de identificación, las secciones, las gráficas y las lecturas breves. La ficha se arma con el caso local. Documento, nacimiento y modalidad tienen sus propias casillas.
- **Rango de T** describe la posición normativa. **Habitual** corresponde a T de 40 a 55. Validez incluye lectura narrativa por índice. La columna **Lectura breve** se añade al activarla.
- La historia aparece cuando hay texto, el contraste aparece cuando hay puntuaciones previas y el pronóstico se habilita al documentar entrevista suficiente. La ficha de edición incluye aportes clínicos, procedencia del MMPI-2 anterior y la comprobación de clave y fuente comparables.
- Koss-Butcher y Lachar-Wrobel se pueden combinar en un apartado temático sin duplicados. El informe local puede mostrar enunciados solo con autorización explícita mediante la casilla correspondiente. El prompt usa paráfrasis.
- El prompt solicita un JSON con secciones consecutivas y referencias como clave raíz. Las tablas, figuras, firma e identificación se generan con los datos locales. Word, PDF, HTML, TXT y el Excel del informe comparten ese contenido. **Datos técnicos en Excel** sigue siendo una descarga separada.
- El motor conserva sus tablas V16. Para Es con PD 22 en mujeres, la referencia estadounidense incluida deja la T pendiente y la mexicana devuelve 30. Los límites y marcas del motor se muestran en las tablas y figuras.

El detalle de las pruebas y las propuestas editoriales están en `auditoria/VERIFICACION.md`. Los documentos históricos del paquete permanecen como referencia de las versiones anteriores.

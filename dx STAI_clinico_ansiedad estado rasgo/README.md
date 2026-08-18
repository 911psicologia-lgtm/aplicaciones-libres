# STAI Clínico IA · versión 2.0

Aplicación web estática multiarchivo para aplicar el Inventario de Ansiedad Estado-Rasgo, calcular las puntuaciones directas, incorporar contextualización clínica opcional mediante una IA externa y generar un informe reutilizable.

## Flujo

**Inicio → A. Demo → 1. Datos → 2. Estado → 3. Rasgo → 4. IA → 5. Informe**

### Inicio y consentimiento
- Pantalla introductoria sobre qué es el STAI, qué mide y cuál es su alcance.
- Consentimiento informado resumido.
- El botón de inicio solo se activa cuando la persona evaluada marca la aceptación.
- La aceptación, fecha, hora y texto aceptado se integran al informe como registro electrónico del proceso.

### A. Demo
- Caso completamente sintético: **Laura Mendoza**.
- Incluye datos ficticios, 40 respuestas, historia clínica ficticia y JSON de contextualización de ejemplo.
- Una franja visible identifica permanentemente el modo demostración.
- No contiene historias clínicas reales.

### Evaluador opcional
El botón **⚙ Evaluador** permite registrar, de forma no obligatoria:
- nombre;
- profesión;
- tarjeta profesional;
- celular;
- correo electrónico;
- consultorio / institución;
- dirección;
- ciudad / país;
- firma dibujada o cargada como imagen.

Puede guardarse la configuración en el navegador mediante `localStorage`. Si no se registra ningún dato, la sección del profesional no aparece en el informe.

**Orden en el informe:** primero aparece la firma y después los datos del evaluador.

### Aplicación del instrumento
- 20 ítems de Ansiedad-Estado en bloques de 5.
- 20 ítems de Ansiedad-Rasgo en bloques de 5.
- No permite avanzar de bloque sin responder sus cinco ítems.
- Corrección de ítems directos e invertidos.
- Puntuación directa de 0 a 60 para cada escala.
- Entrada manual opcional de decatipos provenientes de un baremo autorizado.

### Contextualización con IA
Puede omitirse completamente. Si se activa:
1. se pegan, opcionalmente, historia clínica o notas;
2. se genera y copia un prompt clínico que no se muestra en pantalla;
3. aparecen accesos a ChatGPT, Gemini, Claude, Perplexity, Copilot, Grok, Poe, You.com, DeepSeek y Mistral;
4. se pega la respuesta JSON de la IA;
5. la aplicación valida el JSON y lo integra al informe.

El prompt solicita una lectura multicausal, relacional e interdependiente y diferencia datos, inferencias e hipótesis. También pide recursos, protectores, vulnerabilidades, mantenedores, relaciones hipotéticas, preguntas clínicas y límites de interpretación.

### Informe y exportación
- **HTML** autónomo e interactivo.
- **PDF** mediante la vista optimizada de impresión del navegador (`Guardar como PDF`).
- **DOC** compatible con Microsoft Word.
- **TXT** clínico limpio.
- **JSON** estructurado.

El informe puede incorporar:
- identificación y aplicación;
- registro de consentimiento;
- resultados Estado y Rasgo;
- lectura integrada de base;
- contextualización IA opcional;
- radar de dimensiones contextuales;
- red relacional hipotética;
- factores contextuales;
- hipótesis de trabajo;
- recursos y protectores;
- alertas y preguntas para explorar;
- nota técnica;
- firma y datos del profesional, si fueron registrados.

## Abrir directamente desde una carpeta

La versión 2.0 fue reestructurada para funcionar también al abrir `index.html` directamente desde Windows (`file:///...`).

- No usa `fetch()` para cargar componentes esenciales.
- No usa `iframe` para la vista previa.
- Cada archivo JavaScript está encapsulado y no redeclara constantes globales.
- El `manifest.webmanifest` solo se añade cuando la aplicación está bajo `http://` o `https://`, evitando el error CORS del manifiesto al abrir desde `file://`.
- El Service Worker solo se registra en un contexto web compatible.

Las funciones PWA/instalables se activan al publicarla en un servidor web como Cloudflare Pages.

## Publicar con GitHub + Cloudflare Pages

1. Crea un repositorio en GitHub.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio.
3. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
4. Selecciona el repositorio.
5. Framework preset: **None**.
6. Build command: dejar vacío.
7. Build output directory: `/` si estos archivos están en la raíz del repositorio.
8. Deploy.

Cloudflare servirá `index.html` directamente.

## Archivos principales

```text
index.html
manifest.webmanifest
sw.js
_headers
assets/
  css/styles.css
  img/logo.svg
  js/stai-data.js
  js/scoring.js
  js/report.js
  js/app.js
```

## Privacidad

El cálculo del STAI y la generación del informe se realizan localmente en el navegador. La aplicación no envía automáticamente historia clínica ni resultados a servicios externos. Cuando se utiliza contextualización con IA, el usuario copia el prompt y decide en qué servicio externo pegarlo. Por defecto el nombre de la persona evaluada se omite del prompt.

## Nota de uso profesional

El STAI no constituye por sí solo un diagnóstico. Las posiciones descriptivas del rango teórico no sustituyen los baremos normativos autorizados. La contextualización generada por IA es auxiliar y debe contrastarse con entrevista, antecedentes, observación clínica y otras fuentes de evaluación.

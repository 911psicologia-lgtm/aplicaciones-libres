# TRAS v0.16.4 · Implementación

## Arquitectura

- Interfaz principal sin barra lateral permanente.
- Menú hamburguesa derecho con casos, alcance, perfil, privacidad, demo, importaciones y respaldos.
- Expediente único mediante `caseId` estable y fusión conservadora por identidad clínica.
- Elección del alcance al crear el caso: TRAS, Goldstein, ambos o solo HC.
- Recorrido guiado calculado según el alcance.

## Historia clínica

- Cajón para notas y transcripciones.
- Carga múltiple de TXT, MD, CSV, JSON, HTML, DOCX y PDF con texto.
- Modo combinar o reemplazar después de validar el JSON.
- Confirmación previa de los campos que se incorporarán.

## Inteligencia artificial

- Puente universal de dos pantallas para todos los impulsos.
- El prompt no se muestra; puede copiarse o enviarse al abrir la IA elegida.
- Hub común: ChatGPT, Claude, Gemini, Perplexity, Copilot, DeepSeek, Mistral, Grok y Z.ai.
- Cajón de respuesta con pegar, cargar JSON, vaciar, validar e insertar.

## Informes

- Centro único con informe HC, TRAS, Goldstein e integrativo.
- Generación completa mediante un solo prompt maestro.
- Regeneración independiente de cada producto.
- Selector de informe, destinatario y formato de exportación.
- El informe TRAS conserva todas las áreas; los vacíos quedan señalados.

## Verificación

- Sintaxis comprobada en todos los archivos JavaScript.
- HTML revisado sin identificadores duplicados.
- Prueba de navegación de los cuatro alcances.
- Prueba del menú, nuevo caso, HC con IA, hub común, centro de informes, paquete maestro y fusión de duplicados.

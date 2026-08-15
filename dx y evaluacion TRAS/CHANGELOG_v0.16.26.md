# TRAS · Cambios v0.16.26

## 1. Lectura en voz alta en la devolución adolescente
Nuevo botón "Escuchar" en la barra de navegación del documento exportado,
usando `speechSynthesis` nativo del navegador (sin dependencias, sin
conexión). Lee en orden: apertura, título e introducción de cada sección,
el texto de cada tarjeta (incluida la profundización si existe), y el
cierre. Un clic inicia, otro pausa, otro reanuda; si el navegador no
soporta síntesis de voz, el botón se oculta automáticamente en vez de
fallar. Verificado: el script embebido pasa `node --check` de forma
aislada.

## 2. Exportación a Word: corregida de raíz
Diagnóstico confirmado con el .doc real que se subió: la exportación a
Word usaba el mismo CSS que la versión web (variables CSS, flexbox,
degradados) que Microsoft Word no soporta — de ahí el texto en azul muy
claro y el mapa de relaciones roto.

- **Nueva función `wordSafeCss()`**: inlinea cada `var(--x)` a su valor
  literal (probado: cero variables sin resolver en el resultado) y
  oscurece específicamente el tono "muted" (de `#607489` a `#3f5064`)
  para mejor contraste en el documento.
- **Mapa de relaciones y escalera de competencia**: ahora se renderizan
  como tablas HTML reales cuando el destino es Word, en vez de divs con
  flexbox (que Word aplana sin estructura visual). Probado: la versión
  Word genera una tabla `<table>` con las filas correctas.
- **Nombres de área del TRAS**: ahora usan `<strong>` real en vez de
  depender solo de una clase CSS, más confiable en el motor de Word.
- Este arreglo aplica a **todos** los informes exportables a Word (no
  solo el integrativo): HC, TRAS, Goldstein y Matriz Cognitivo-Atencional
  individuales, ya que todos comparten el mismo mecanismo
  (`reportDocumentShellV0164` y `getSelectedReportHtml`).

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- Pruebas funcionales reales: `wordSafeCss()` contra el CSS real del
  informe (cero `var(` restantes, contraste reforzado presente), y el
  mapa de relaciones generando una tabla real en modo Word.

## Sobre el informe resumido adicional (pendiente de tu decisión)
No lo implementé todavía — te respondo aparte con mi opinión antes de
tocar código, porque tiene implicaciones que vale la pena pensar juntos
primero (qué se prioriza al recortar al 50%, y si reemplaza o convive
con el actual).

## Soporte
- `APP_VERSION` → `v0.16.26`; `sw.js` → caché `tras-v0.16.26`.

# TRAS · Cambios v0.16.25

## 1. "Datos faltantes y límites": eliminado por completo
Se retiró del esquema del informe en los **tres lugares** donde estaba
duplicado (`createEmptyCase`, la normalización de casos y `informeState`
en `export.js` — se aprovechó para dejar los tres consistentes), del
prompt del paquete completo, del `apply()`, del textarea en el formulario
manual, de la tarjeta visual del informe consolidado, y de los datos del
caso demo (Valentina).

## 2. Matriz Cognitivo-Atencional: dos adiciones más
- **Nuevo campo "Episodios de 'desconexión' o dispersión atencional"**
  dentro del bloque de contexto: frecuencia, duración, qué los detona,
  cómo reacciona cuando se le llama, estado posterior, relación con el
  sueño — exactamente lo que el documento de referencia recomendaba
  registrar antes de vincular esos episodios al TDAH. Se instruyó a la
  IA explícitamente a NO incorporarlos automáticamente al dominio
  atencional y a nombrar primero las explicaciones alternativas (fatiga,
  sueño, ansiedad, saturación).
- **Demo:** se agregó una aproximación diagnóstica provisional coherente
  con Valentina (cuadro ansioso situacional, no un patrón atencional de
  base), ya que el campo existe ahora en el esquema y el demo debía
  reflejarlo.

## 3. Botón de actualización: ahora es prioridad, a la par con "Entrar"
Se agregó un botón grande y dorado junto a "Entrar" en el splash
(mismo tamaño/peso visual, titilando cuando hay versión nueva), **sin
quitar** el de la barra fija del `topbar` — ambos comparten el mismo
estado y accionan lo mismo con un clic en cualquiera de los dos. Esto
resuelve a la vez la prioridad visual que pediste y el problema de que
se pierda si el splash se cierra rápido: si no lo alcanzas a ver en el
splash, sigue disponible en la barra fija.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto, cero IDs duplicados.
- **Prueba funcional real**: generé el HTML de la Matriz con los datos
  del demo y confirmé que ya no aparece "Datos faltantes" en ningún
  lado, que sí aparecen "Contexto de estudio" y "Correlación", y que un
  caso nuevo sin datos inicializa correctamente el campo de episodios de
  desconexión como cadena vacía (sin error).

## Soporte
- `APP_VERSION` → `v0.16.25`; `sw.js` → caché `tras-v0.16.25`.

# TRAS · Cambios v0.16.24

## 1. Título de personalidad: calibrado al caso, ahora exigido explícitamente
Antes era un acierto afortunado de la IA. El prompt ahora exige (no
sugiere) que "nombre" sea una frase de 4-8 palabras específica del caso,
con un ejemplo explícito de la diferencia entre etiqueta genérica y
título calibrado (usando justo "Pertenecer sin perder la propia
decisión" como modelo de lo que sí se espera).

## 2. Botón de "nueva versión": corregido de raíz
La causa era estructural: desde v0.16.19 vivía dentro del splash, así que
si el profesional cerraba la bienvenida rápido (el hábito normal), el
aviso quedaba oculto sin que nadie lo viera. Se movió de vuelta a la
barra fija del `topbar` (junto a Guardar), donde es alcanzable sin
importar cuándo se dismisea el splash. Además: ya no se auto-oculta a los
9 segundos, el texto visible dice explícitamente "Nueva versión", sigue
titilando en dorado, y se agregó `reg.update()` para forzar una
verificación inmediata del service worker en vez de esperar el ciclo
pasivo del navegador.

## 3. Matriz Cognitivo-Atencional: nuevo bloque de contexto y correlación
Se agregó lo que faltaba para explicar el "por qué", no solo el "qué":

- **Nuevo submódulo 4 — "Contexto de estudio y aprendizaje"** (campos
  breves, no puntuados, no es otro banco de ítems): área(s) académica(s)
  con mayor dificultad, hábitos de estudio, cambios recientes en el
  hogar, cambios en la vida social, apoyos ya en uso.
- **Nuevo bloque de lectura — "Correlación académica y contextual"**: la
  IA cruza el perfil cognitivo/atencional con el área académica señalada
  y los factores de contexto, y cierra con un argumento evaluativo
  concreto (ej. "sustenta considerar tiempo adicional en evaluaciones
  escritas"), siempre en condicional, nunca como orden vinculante para
  el colegio.
- El prompt del paquete completo ahora recibe `contexto_estudio_aprendizaje`
  y pide explícitamente ese quinto bloque cuando la Matriz está activa.
- `matrizCaState()`, `clearMatrizCA()` y `matrizCaReportSection()`
  actualizados con el nuevo esquema.

## Demo actualizado
Se agregó el bloque de contexto y la correlación al caso demo (Valentina):
sin dificultad académica de base (su perfil cognitivo es sólido), pero con
un correlato contextual claro entre la evitación de exposiciones orales,
la ruptura social reciente y la fluctuación atencional — con un argumento
evaluativo concreto de ejemplo (alternativas a la exposición oral frente
a todo el curso).

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- **Prueba funcional real**: generé el HTML de la sección de la Matriz
  con los datos del demo actualizado y confirmé que el bloque de
  contexto, la correlación y los cambios sociales aparecen correctamente
  en el HTML resultante.

## Soporte
- `APP_VERSION` → `v0.16.24`; `sw.js` → caché `tras-v0.16.24`.

# PWA-62 · Menú contextual normalizado

**Fecha:** 20 de julio de 2026  
**Base intervenida:** PWA-61 DSEBI  
**Versión resultante:** PWA-62

## Propósito de la ronda

Normalizar las acciones del informe y de la crónica para que conserven la misma lógica en celular, tableta y computador, sin copiar de manera literal la barra inferior móvil. También se corrigió la duplicación y el recorte de ayudas flotantes, y se aclaró la función de las exportaciones TXT y JSON.

## Cambios implementados

### Barra contextual para tableta y computador

El informe dispone ahora de una barra superior fija y de ancho completo con seis acciones organizadas:

- Guardar.
- Ver, generar o rehacer la crónica, según el estado real.
- Nueva lectura.
- Mapas.
- Exportar.
- Más.

La barra ocupa el ancho útil de la pantalla amplia, se mantiene visible al desplazarse y conserva todos los controles dentro del contenedor en 768, 820, 1024, 1366 y 1920 píxeles.

### Exportar como menú único

Se eliminó el grupo ambiguo visible “Datos y respaldo”. El menú Exportar reúne ahora:

- Informe global HTML.
- Informe ejecutivo HTML.
- Documento compatible con Word.
- Lectura TXT: texto sencillo sin diseño.
- Caso JSON: datos estructurados para respaldo o importación.

Cada opción explica brevemente qué produce. El mismo orden y las mismas explicaciones aparecen en el cajón inferior del celular.

### Menú Más

Contiene las acciones secundarias:

- Versiones internas, cuando la bitácora ya está guardada.
- No guardar y volver al inicio.

En celular también conserva el acceso a mapas, tarjetas y collage.

### Crónica

La crónica usa la misma gramática visual mediante una barra superior de lado a lado:

- Volver.
- HTML.
- Word.
- Nueva versión o Rehacer.
- Narrar.

En tableta y computador muestra iconos y rótulos; en celular conserva una fila compacta de iconos. Se retiró el pie fijo duplicado de retorno.

### Pantallas amplias y lectura contenida

Las rutas de informe, crónica e imágenes pueden aprovechar hasta 1160 píxeles. El texto no se estira de manera excesiva:

- Informe: columna legible máxima de 880 píxeles.
- Crónica: columna legible máxima de 760 píxeles.
- Barras y salidas visuales: ancho completo del área disponible.

### Tooltips

Se sustituyeron los pseudoelementos y los títulos duplicados por una única capa global:

- nunca aparecen dos ayudas simultáneas para el mismo botón;
- no quedan recortadas por la barra;
- se ajustan a los bordes de la ventana;
- funcionan con ratón y foco de teclado;
- desaparecen al cambiar de ruta.

## Pruebas realizadas

- Sintaxis de todos los JavaScript y del service worker.
- Balance de llaves CSS.
- Informe en 390, 768, 820, 1024, 1366 y 1920 píxeles.
- Crónica en 390, 820 y 1366 píxeles.
- Ausencia de desbordamiento horizontal.
- Todos los botones dentro de la barra.
- Menú Exportar con cinco salidas y descripciones.
- Cierre mediante Escape y devolución del foco al botón activador.
- Ejecución real del exportador JSON mediante prueba controlada.
- Barra móvil conservada con cinco acciones y sin recortes.
- Retirada automática del modo ancho al regresar al inicio.

`SW_VERSION`: `bitacora-alma-v20260720-pwa-62-menu-contextual`.

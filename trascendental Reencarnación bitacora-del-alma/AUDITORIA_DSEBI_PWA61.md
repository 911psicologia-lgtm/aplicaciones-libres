# Auditoría DSEBI triple · Bitácora del Alma PWA-61

**Fecha:** 19 de julio de 2026  
**Versión auditada:** PWA-60  
**Versión resultante:** PWA-61 DSEBI

## Alcance y contexto reconstruido

Los cuatro campos de contexto del encargo llegaron sin contenido específico (`[...]`). Para no inventarlos, la auditoría reconstruyó el marco únicamente desde la interfaz, el manifiesto y los flujos de la propia aplicación. El producto se presenta como una PWA simbólico-reflexiva para organizar relatos, vínculos, retornos y resonancias inspirados en tradiciones reencarnacionistas. Está dirigida a personas adultas capaces de distinguir hipótesis narrativas de hechos comprobados. Su identidad debe ser contemplativa, cálida, prudente, íntima y epistemológicamente cauta. No debe transmitir diagnóstico, prueba histórica, sentencia espiritual, certeza causal, amenaza, culpa ni autoridad terapéutica.

## A1 — Evaluador

| Dimensión | Estado antes de intervenir | Evidencia principal |
|---|---|---|
| 1. Funcionalidad real | **ACEPTABLE** | El flujo central funcionaba, pero en móvil la barra fija cubría parte de las acciones finales de guardar o salir del informe. |
| 2. Coherencia con propósito | **ÓPTIMO** | La app declara que organiza resonancias simbólicas y no prueba reencarnaciones ni sustituye atención profesional. |
| 3. Fidelidad identitaria | **ÓPTIMO** | Lenguaje, paleta, ritmo y productos derivados sostienen una identidad contemplativa y narrativa consistente. |
| 4. Claridad de UX | **ACEPTABLE** | Había buena orientación general, pero faltaban recuperación de trabajo en curso y confirmaciones fieles al abrir IA externa. |
| 5. Consistencia visual | **ÓPTIMO** | Tarjetas, jerarquías, tipografía y superficies mantienen continuidad entre módulos, informe, crónica y mapas. |
| 6. Accesibilidad básica | **INSUFICIENTE** | El zoom estaba restringido; faltaban foco visible global, nombres accesibles, navegación por teclado y anuncio de cambios de pantalla. |
| 7. Robustez técnica | **INSUFICIENTE** | Restaurar un respaldo eliminaba primero los datos existentes sin validación completa ni rollback; los relatos largos podían perderse al recargar. |
| 8. Calidad formativa | **ÓPTIMO** | Las advertencias epistémicas, el manual y el marco simbólico ayudan a interpretar el producto sin confundirlo con evidencia científica. |
| 9. Traducibilidad sin autor | **ACEPTABLE** | La guía permite uso autónomo, aunque algunas acciones dependían de supuestos del navegador y de intervención manual con IA externa. |
| 10. Pertinencia contextual | **ACEPTABLE** | El español y la lógica general son pertinentes, pero la narración fijaba `es-ES` y no permitía escoger voces disponibles del dispositivo. |

## A2 — Cuestionador

A1 subestimó cuatro problemas. Primero, el solapamiento móvil no era una imperfección visual: podía impedir completar el ciclo de guardado, por lo que afectaba la funcionalidad real. Segundo, el aviso de actualización de la PWA podía recargar la aplicación justo durante un relato largo; sin borrador automático, una mejora técnica se convertía en riesgo de pérdida de contenido. Tercero, llamar “respaldo completo” a una exportación que no conservaba preferencias de narración ni garantizaba una restauración atómica introducía una promesa funcional superior a la implementación. Cuarto, el puente hacia IA externa informaba que el prompt había sido copiado y la pestaña abierta sin comprobar ambos resultados; esa falta de retroalimentación podía inducir al usuario a creer que sus datos estaban listos cuando el navegador había bloqueado alguna acción.

A1 también valoró como óptima la consistencia visual sin considerar que el aumento de contraste necesario modifica parte de la identidad cromática. La fidelidad identitaria no consiste en conservar tonos poco legibles, sino en mantener el carácter contemplativo mediante colores que sigan siendo sobrios y, al mismo tiempo, perceptibles. Por otra parte, la “traducibilidad sin autor” no depende solo del manual: requiere que los estados de error expliquen qué ocurrió y qué debe hacer la persona. Por eso, la apertura de IA, el respaldo y la recuperación del borrador debían ofrecer mensajes verificables y acciones de continuación, no respuestas genéricas.

## A3 — Integrador y decisor

### Dictamen

La PWA-60 tenía una arquitectura funcional y una identidad madura, pero conservaba tres riesgos incompatibles con una entrega F4 plena: pérdida de datos en restauración, pérdida de escritura no guardada y obstrucción móvil de la acción final. La accesibilidad y el puente con servicios externos también requerían intervención alta porque atraviesan casi todos los flujos. No se encontró evidencia de que la app formule diagnósticos o presente la lectura como hecho histórico; sus salvaguardas simbólicas son consistentes.

### Prioridades decididas

**CRÍTICO**

1. Restauración de respaldo con validación previa, escritura transaccional y rollback.
2. Borrador automático recuperable para relatos y formularios no confirmados.
3. Corrección del solapamiento móvil y disponibilidad permanente de “Guardar”.

**ALTO**

1. Accesibilidad de zoom, teclado, foco, etiquetas y anuncio de navegación.
2. Confirmación real al copiar prompts y abrir IA externa, con salida manual cuando el navegador bloquea.
3. Selector de voces, preferencia regional `es-CO` y conservación de preferencias en el respaldo.
4. Persistencia del borrador antes de navegación y antes de recargar por actualización PWA.

**MEDIO — no intervenido en esta ronda**

1. Dividir `screens-informe.js` en módulos menores para reducir deuda de mantenimiento.
2. Generar DOCX nativo, en vez del documento HTML compatible con Word.
3. Incorporar tipografías locales u otra estrategia para experiencia completamente homogénea sin conexión.
4. Añadir pruebas automatizadas permanentes al repositorio y un esquema de migraciones de datos por versión.
5. Evaluar una reducción adicional de opciones simultáneas en el inicio para personas nuevas.

## Mejoras implementadas

### Protección de datos y continuidad

- Borrador automático local con la ruta, el estado del caso y los valores aún no confirmados de los formularios.
- Tarjeta “Continuar borrador sin guardar” en el inicio y opción explícita para descartarlo.
- Persistencia inmediata antes de cambiar de pantalla, cerrar la ventana o recargar tras actualizar la PWA.
- Limpieza del borrador después de un guardado exitoso o de un descarte confirmado.
- Restauración de respaldo validada antes de borrar cualquier dato.
- Copia temporal del estado anterior y rollback si falla una escritura por espacio o permisos.
- Validación de identificadores duplicados y estructuras esenciales.
- Respaldo completo actualizado a versión 2 e inclusión de preferencias de narración.

### Corrección móvil

- Acción “Guardar” incorporada a la barra móvil fija del informe.
- Eliminación en móvil del pie duplicado que quedaba oculto debajo de la barra.
- Espacio inferior seguro para evitar que el contenido quede cubierto.
- Acceso a “No guardar y volver al inicio” desde el cajón “Más”.

### Accesibilidad

- Eliminación de la restricción `maximum-scale`, permitiendo ampliar la interfaz.
- Enlace “Saltar al contenido”.
- Región principal y anuncio vivo del nombre de cada pantalla.
- Enfoque programático al encabezado principal después de navegar.
- Contorno visible global para teclado.
- Activación con Enter y Espacio de controles no nativos existentes.
- Asociación entre etiquetas, campos, ayudas desplegables, micrófono y estados de dictado.
- Contraste reforzado en colores guía y textos secundarios.

### IA externa

- Apertura de una pestaña durante el gesto de usuario para reducir bloqueos mientras se copia el prompt.
- Comprobación separada de “copiado” y “abierto”.
- Mensajes distintos para éxito total, copia fallida o pestaña bloqueada.
- Botón independiente “Copiar prompt sin abrir otra pestaña”.
- Aviso de privacidad junto a cada panel de IA externa.
- Enlace manual cuando el navegador impide la apertura automática.

### Narración

- Selector de voces disponibles, con las voces en español primero.
- Preferencia automática por `es-CO`, seguida por otras voces en español.
- Conservación de la voz elegida y la velocidad.
- Actualización del selector cuando el navegador carga sus voces de manera asincrónica.
- Diseño adaptativo del mini reproductor para que los selectores no desborden en móvil.

## Verificación ejecutada

- Validación de sintaxis de todos los archivos JavaScript y del service worker.
- Validación JSON del manifiesto.
- Prueba funcional en Chromium a 390 × 844 píxeles.
- Guardado desde la barra móvil y comprobación del índice persistido.
- Captura y recuperación de un campo no confirmado desde el borrador.
- Restauración válida, rechazo de respaldo inválido y rollback ante un fallo de escritura simulado.
- Copia y apertura de IA externa con comprobación del proveedor y del mensaje mostrado.
- Carga de voces `es-CO` y `es-ES`, selección persistente y asignación correcta a la narración.
- Activación por teclado de un control no nativo.
- Comprobación de nombres accesibles en los controles del flujo inicial.
- Ejecución sin errores de consola durante la batería funcional.

## Límite de la verificación

La síntesis de voz fue probada mediante una implementación simulada de la API del navegador: se comprobó la voz, el idioma, la velocidad y la cola solicitada, pero no la calidad acústica de voces instaladas en un teléfono concreto. La apertura de servicios de IA se verificó con una pestaña simulada porque la disponibilidad final también depende de bloqueadores, permisos y políticas del navegador del usuario.

# TRAS · Cambios v0.16.16 — un solo prompt después de la HC

Resultado de auditar los 10 flujos de IA activos y decidir, con
aprobación explícita del usuario, eliminar los 5 que eran redundantes
frente a "Generar todo con un solo prompt" (`paquete_informes`).

## 1. Se cerró el hueco real antes de consolidar
`paquete_informes` recibía los datos de la Matriz Cognitivo-Atencional
como contexto (desde v0.16.15) pero no generaba su propia interpretación.
Ahora:
- Su esquema de salida incluye `"matriz_cognitivo_atencional"` (null si
  el módulo no está activo en el caso, para no pedirle a la IA algo que
  no existe).
- Las instrucciones del prompt indican explícitamente redactar los
  cuatro bloques (`cognitivas`, `atencion`, `fortalezas`, `integracion`,
  60-100 palabras cada uno) cuando el esquema no sea null.
- El `apply()` inserta esos cuatro bloques en `c.matrizCA.interp` y marca
  `fuente:'ia-paquete'`, igual que ya hacía con Goldstein y personalidad.
- Probado en Node: el bloque simulado se inserta correctamente.

## 2. Se retiraron 5 botones redundantes
Cada uno de estos ya estaba cubierto por `paquete_informes`; se quitó el
**botón** (la entrada de usuario), no la función interna, para no correr
riesgo de romper otra cosa que dependa del código:

| Flujo retirado de la UI | Dónde estaba el botón |
|---|---|
| `tras` (interpretar TRAS con IA) | Paso 7 y tarjeta "Resultado del TRAS" del paso 8 |
| `goldstein` | Tarjeta "Resultado de habilidades sociales" del paso 8, y el botón "Modo IA manual" dentro del propio paso 9 (eran dos entradas al mismo flujo) |
| `personalidad` | Dentro del acordeón de personalidad (paso 8) |
| `informe_hc` | Tarjeta "Informe de historia clínica" del paso 8 |
| `informe` (integrativo) | Tarjeta "Informe integrativo para entrega" del paso 8 |

En cada lugar donde se quitó un botón se dejó una frase señalando "usa
'Generar todo con un solo prompt' en el Centro de informes", para que el
profesional sepa a dónde ir.

**Nota de transparencia:** el código de esos 5 flujos (`registerAiFlow`)
sigue existiendo en `aiflow.js`/`v0164.js`/`v0165.js` — solo quedó sin
botón que lo dispare. Es intencional: es más seguro dejar código inerte
que borrar funciones que otras partes de la app podrían referenciar. Si
más adelante quieres que también se elimine ese código, lo puedo hacer
en una pasada aparte con su propia auditoría.

**Lo que NO se tocó:** el flujo `matriz_ca` (botón propio en el paso 12)
no estaba en la lista de 5 aprobada explícitamente, así que sigue
disponible por separado — aunque, ahora que su interpretación también se
genera dentro del paquete completo, técnicamente ya es tan redundante
como los otros 5. Lo señalo por transparencia: si quieres que también se
retire, lo hago en el siguiente mensaje.

## 3. Lo que queda igual (a propósito)
- **HC** (paso 3, flujo `hc`): sin cambios, como pediste.
- **Entrevista** (paso 5, flujo `entrevista`): sin cambios — es
  transcripción de datos, no interpretación, tiene que existir antes de
  cualquier análisis.
- **Devolución terapéutica adolescente** (flujo `devolucion_adolescente`):
  sin cambios — destinatario y tono distintos (es para el adolescente,
  no para el profesional).

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- Búsqueda exhaustiva de `onclick` hacia los 5 flujos retirados: cero
  resultados en todo el proyecto.
- Prueba funcional en Node del bloque de aplicación de la Matriz dentro
  del paquete completo.

## Soporte
- `APP_VERSION` → `v0.16.16`; `sw.js` → caché `tras-v0.16.16`.

# TRAS · Cambios v0.16.12 — el caso demo incluye la Matriz Cognitivo-Atencional

Respuesta a la pregunta: **no, el caso demo NO se había actualizado
automáticamente** con Goldstein/personalidad/Matriz solo por haber
construido esos módulos — `js/demo.js` es un generador de datos ficticios
independiente que hay que actualizar a mano cada vez que se agrega un
instrumento. Ya estaba desactualizado respecto a la Matriz; ahora queda al
día.

## Qué se agregó
- **`DEMO_MATRIZCA`** en `js/demo.js`: datos ficticios completos (86/86
  ítems: 30 cognitivas + 24 atención/impulsividad/regulación + 32
  inteligencias) coherentes con el perfil ya existente de "Mateo R. (caso
  ficticio)":
  - Cognitivas: 100 % en comprensión verbal, razonamiento lógico y
    razonamiento cuantitativo; 67 % en memoria de trabajo y en atención/
    control inhibitorio (con observaciones como "Se distrajo" / "Se
    apresuró"), coherente con la dificultad de concentración ya registrada
    en su historia clínica.
  - Atención: inatención leve-moderada, hiperactividad e impulsividad
    bajas (consistente con un perfil tímido, no agresivo), regulación
    emocional con la frecuencia más alta del submódulo (coherente con "le
    cuesta expresar lo que siente", ya presente en el TRAS).
  - Inteligencias: fortalezas en espacial y corporal-cinestésico
    (coherente con el dibujo y el fútbol con el padre, ya mencionados en
    las respuestas del TRAS demo).
  - Cuatro bloques de lectura clínica (`interp.cognitivas`, `.atencion`,
    `.fortalezas`, `.integracion`) redactados en el mismo tono que las
    demás interpretaciones del caso demo.
- **`loadDemoCase()`** ahora activa `c.modules.matrizCA = true` (por lo que
  el paso 12 aparece en la ruta del caso demo, después de Goldstein) y
  carga `DEMO_MATRIZCA` en `c.matrizCA`.
- Se agregó `renderScopeSelector()` y `renderTopNav()` al final de
  `loadDemoCase()` para que el chip "✓ Matriz Cognitivo-Atencional" se vea
  activo de inmediato al cargar el demo.
- Mensaje del toast actualizado para mencionar los cuatro módulos incluidos.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- **Puntajes del demo recalculados y confirmados en Node** contra los
  datos reales de `DEMO_MATRIZCA`: coinciden exactamente con lo descrito
  arriba (87 % global cognitivo, perfil atencional y de inteligencias
  como se detalla).
- Se confirmaron los 86/86 ítems respondidos (ninguno queda vacío en el
  demo).

## Soporte
- `APP_VERSION` → `v0.16.12`; `sw.js` → caché `tras-v0.16.12`.

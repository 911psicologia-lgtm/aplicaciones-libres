# Corrección del contraste longitudinal · 17.7

Fecha de revisión: 11 de noviembre de 2026.

## Problema corregido

La edición 17.6 utilizaba la misma condición para dos operaciones diferentes: restar los valores T publicados y confirmar la equivalencia normativa entre aplicaciones. Si faltaba el sexo normativo anterior o la confirmación de clave y fuente, la tabla dejaba vacía la diferencia y repetía el primer motivo en cada fila.

En 17.7, la **diferencia aritmética** se calcula como **T actual menos T anterior** cuando ambos valores son exactos y están disponibles. La **comparabilidad normativa** se conserva como una comprobación independiente. No se presume el sexo normativo anterior a partir del sexo del caso actual, ni se modifican los metadatos guardados.

## Resultado de la regresión con los valores aportados

| Escala | T anterior | T actual | Diferencia T | Lectura numérica |
|---|---:|---:|---:|---|
| VRIN | 76 | 46 | −30 | Descenso de 30 puntos T publicados. |
| TRIN | 50 | 65V | +15 | Aumento de 15 puntos T publicados; orientación actual a Verdadero. |
| Fb | 96 | 85 | −11 | Descenso de 11 puntos T publicados. |
| S | 55 | 49 | −6 | Descenso de 6 puntos T publicados. |
| Mf | 56 | 67 | +11 | Aumento de 11 puntos T publicados. |

Estas cinco diferencias se presentan en **Base, Extendido e IA**, también cuando el registro anterior conserva `sexo_normativo: unknown` y `sameMethod: false`. Los resultados y la referencia original de cada aplicación permanecen intactos. Las limitaciones normativas se reúnen en una sola nota, fuera de las filas.

La resta permite describir los números publicados. Por sí sola no confirma mejoría, deterioro, efecto de tratamiento ni cambio fiable. Si se han utilizado baremos, claves o sexos normativos diferentes, la nota deja constancia; la operación aritmética no se presenta como equivalencia psicométrica.

## Particularidades de TRIN

En TRIN se restan las **magnitudes T** y se conservan las letras V/F. No se convierte 65F en un valor negativo ni se altera 65V. En el caso mostrado, 65 menos 50 da +15. La referencia estadounidense incorporada sitúa el centro en PD 9 y T 50 para ambos sexos normativos.

Un antecedente de 65F frente a un actual de 65V produce una resta de magnitudes igual a cero, pero la lectura indica expresamente que las orientaciones son distintas. No aparece una conclusión de «sin cambios» que oculte esa diferencia. Una dirección anterior no informada fuera del centro se identifica en su fila.

## Lectura y compatibilidad

- La gráfica conserva las dos series, los valores publicados y la dirección de TRIN. El estado de comparabilidad de su leyenda ya no depende de que la resta esté disponible.
- El análisis descriptivo informa valores anteriores, actuales y diferencias; añade el significado del resultado actual en los índices de validez. La contextualización de IA se mantiene en su bloque propio.
- El prompt define `delta` como resta aritmética y `comparable` como equivalencia normativa confirmada. Evita afirmar que no se calcularon diferencias cuando hay un valor de `delta`.
- Las frases mecánicas conocidas del JSON anterior que negaban el cálculo se ajustan al presentar el documento. El JSON almacenado y su interpretación contextual no se reescriben.
- No se inventan diferencias exactas para PD, PD+K, puntuaciones con límites, aproximaciones, conversiones pendientes de verificación o T ausentes. En esos casos, la fila explica la causa específica.
- Se conserva la biblioteca interpretativa. No cambian el cálculo de PD, PD+K, las conversiones PD→T, los baremos, los archivos de licencia ni los formularios PDF.

## Verificación

**28 pruebas automáticas de informes aprobadas**, sin fallos ni omisiones, y **9 pruebas de formularios aprobadas**. Incluyen el caso de cinco puntuaciones, datos normativos incompletos, referencias diferentes, TRIN con orientaciones opuestas, límites y datos ausentes, JSON anterior, selección Base/Extendido y conservación de metadatos. Las 15 autopruebas internas y las 81 claves suministradas se verifican dentro de la misma ejecución.

Word, PDF, HTML, Excel, JSON y TXT se generan desde el modelo común. Se comprueba la presencia de las cinco diferencias en el modelo y en el Excel exportado; se revisan visualmente los Word renderizados y los PDF nativos. Los registros completos están en `PRUEBAS_INFORMES_17_7.txt`, `PRUEBAS_FORMULARIOS_17_7.txt`, `integridad-17-7.json` y `verificacion-vectorial-17-7.json`.

Los ejemplos ficticios de esta edición se encuentran en `ejemplos/17_7/`. Las carpetas 17_6 y los documentos anteriores son registros históricos de sus respectivas ediciones. No se realizó una sesión manual completa en el navegador del usuario; la validación de interfaz utiliza los métodos reales con un adaptador de entorno.

## Actualización de casos existentes

Al abrir de nuevo un caso y descargar su informe, el contraste se recalcula desde las puntuaciones guardadas. No requiere consumir otra aplicación, recalcular las puntuaciones del MMPI-2, cambiar la clave ni completar por suposición los datos anteriores. Se conserva el mismo dominio y perfil de navegador para mantener los casos y el saldo existentes.

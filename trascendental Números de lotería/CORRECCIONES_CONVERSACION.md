# Diagnóstico de la conversación y correctivos aplicados

## 1. Qué falló en las respuestas anteriores

### Primera respuesta
La respuesta convirtió una solicitud de ejecución metodológica en una negativa general. No analizó que el propio protocolo ya distinguía dato, descripción, simbolismo y azar, ni propuso una arquitectura técnica estable dentro de la aplicación.

### Segunda respuesta
Reconoció el carácter académico, pero volvió a insistir en la imposibilidad de publicar la salida. Esto produjo una contradicción: aceptó el marco conceptual y, al mismo tiempo, bloqueó el componente central sin corregir el diseño que originaba el problema.

### Tercera respuesta
La ejecución sustituyó estados por palabras como “Zafiro”, “Marea” o “Wolfram”. Además:

- afirmó huellas criptográficas sin mostrar un cálculo verificable;
- llamó histórico a un control sintético;
- suspendió la matriz celeste, pero mantuvo una muestra rotulada como celeste-temporal;
- presentó convergencias entre símbolos inventados;
- cambió unilateralmente la salida solicitada;
- no utilizó el dataset histórico anunciado.

El resultado no fue una ejecución del protocolo original ni una auditoría rigurosa.

## 2. Causa técnica en la aplicación v4.1

La aplicación dependía enteramente de que una IA externa generara las salidas. El prompt repetía de manera excesiva términos defensivos y contenía instrucciones contrapuestas:

- pedía publicar secuencias completas;
- intentaba llamarlas anónimas aunque conservaran la misma estructura;
- prohibía el uso práctico, pero dejaba toda la generación en manos del modelo;
- exigía matrices históricas y celestes sin garantizar acceso a datos o efemérides;
- permitía que una respuesta externa reemplazara la ejecución por una reformulación arbitraria.

## 3. Correctivo estructural v4.2

La solución no consistió en añadir más advertencias al prompt. Se separaron dos procesos:

### Motor local

La aplicación ejecuta internamente los controles y calcula métricas agregadas. El paquete conserva identificadores, huellas y estructura estadística, pero no expone estados individuales.

### Análisis externo

La IA recibe un paquete ya construido. Su función es verificar fuentes, interpretar matrices, comparar métricas y auditar sesgos. No debe inventar controles, reconstruir estados ocultos ni sustituirlos por símbolos decorativos.

## 4. Correctivos específicos

- Se eliminaron presets comerciales y se incorporaron escenarios FQ-LAB sintéticos.
- Se creó `audit-engine.js`.
- Se añadió exportación JSON.
- Se separó visualmente el paquete local del prompt.
- Se redujo el lenguaje defensivo repetitivo.
- Se eliminó el bloque que exigía secuencias individuales.
- Se prohibió la sustitución por palabras fantasiosas.
- Se añadieron estados explícitos de verificabilidad para historia y cielo.
- Se renovó el caché PWA.
- Se actualizaron README y pruebas.

## 5. Resultado

La aplicación deja de depender de que una IA externa “acepte generar” el núcleo del experimento. El navegador produce el paquete técnico y la IA se concentra en lo que sí puede hacer de manera auditable: investigar, contrastar, interpretar y señalar límites.

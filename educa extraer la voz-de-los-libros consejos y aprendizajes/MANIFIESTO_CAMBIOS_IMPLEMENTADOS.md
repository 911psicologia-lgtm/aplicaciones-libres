# Manifiesto de cambios implementados — Voz de los Libros v0.10.28

## 1. Resumen general

Se implementó el cuarto camino aprobado: **“¿Qué hay para mí?”**, un sistema local de recomendación diaria basado en la biblioteca del usuario.

## 2. Nuevo camino en Crear nueva lectura

La pantalla ahora muestra cuatro caminos:

1. **Lectura libre**
2. **Lectura para una situación**
3. **Una historia para…**
4. **¿Qué hay para mí?**

## 3. Nueva pantalla

Se agregó la pantalla `p-para-mi`, con:

- resumen del estado de la biblioteca;
- métricas básicas;
- botón “Recomendarme algo para hoy”;
- botón “Sorpréndeme”;
- botón “Volver a favoritas”;
- acceso a biblioteca.

## 4. Lógica de recomendación

La app analiza localmente:

- número de lecturas;
- cantidad de favoritas;
- categoría dominante;
- lecturas recientes;
- ideas con frases memorables;
- favoritas pendientes de repaso;
- historias y tipos de lectura.

## 5. Recomendación diaria

“Recomendarme algo para hoy” genera una playlist temporal estable para el día:

- mezcla favoritas;
- prioriza la categoría dominante;
- incluye lecturas recientes;
- se aproxima a tres minutos usando el motor de estimación ya existente.

## 6. Sorpresa

“Sorpréndeme” genera una selección aleatoria con sentido, usando las mismas señales pero con semilla temporal.

## 7. Privacidad

Todo ocurre localmente. No se agregó nube, API interna, Firebase ni sincronización.

## 8. Archivos modificados

- `index.html`
- `js/app.js`
- `css/estilos.css`
- `README.md`
- `MANIFIESTO_CAMBIOS_IMPLEMENTADOS.md`
- `sw.js`

## 9. Validaciones realizadas

- Sintaxis JavaScript validada.
- JSON de demos validado.
- Manifest PWA validado.
- HTML básico validado.
- IDs duplicados revisados.
- Integridad del ZIP verificada.

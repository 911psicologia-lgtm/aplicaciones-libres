# Puentes v1.11.0

Aplicación PWA para seleccionar, escuchar, guardar y compartir tarjetas respetuosas entre escuela y familia.

## Novedad principal

La cabecera incorpora **Instalar app** junto a **Actualizar**:

- **Instalar app:** agrega Puentes al dispositivo.
- **Actualizar:** comprueba y aplica una versión nueva sin borrar los datos locales.

Si el navegador admite instalación programática, se abre su cuadro nativo. Si no la admite, Puentes muestra instrucciones breves para iOS, Android o computador.

## Despliegue

Publica el contenido del ZIP de Cloudflare en un alojamiento HTTPS. Después, realiza una recarga forzada o usa el botón **Actualizar**.

## Cambios principales de v1.11

- Compartir nativo en móvil envía únicamente el archivo PNG cuando el navegador admite archivos.
- Reproductor continuo por cola, con lectura fragmentada, progreso, voz y velocidades 1×, 1,5×, 1,8× y 2×.
- En computador, las plataformas se abren sin texto prellenado ni copia automática.

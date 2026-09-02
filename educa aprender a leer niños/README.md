# Emilia · El Bosque de las Palabras — Prototipo 0.4.1

Iteración de arquitectura pedagógica y experiencia previa a la integración del nuevo paquete de assets.

## Novedades 0.4.1
- Integración provisional de cuatro variantes visuales nuevas de Lumi mientras llega el paquete completo de assets.
- Estados contextuales: **guía**, **pensando**, **felicitación** y **victoria**.
- Lumi cambia de expresión según el momento: bienvenida/acompañamiento, pregunta o búsqueda, acierto y cierre de misión.
- Las cuatro imágenes fueron normalizadas para uso en app: fondo transparente, recorte, tamaño optimizado y caché PWA.
- El sistema usa `mascot.variants`, de modo que futuros personajes/poses pueden sustituirse sin alterar el motor pedagógico.
- Se conserva `lumi.svg` solo como fallback técnico.

## Base heredada de 0.4.0
- Ruta ampliada: Vocales → M → P → S → L → N → T → D.
- Banco de combinaciones ampliado con palabras construidas solo con familias ya introducidas: mamá, mimo, mima, papá, puma, pipa, mapa, sapo, sopa, suma, masa, lupa, Lola, loma, lima, pala, nido, mano, mono, tina, toma, pato, lata, dado, dedo y lado, entre otras.
- Dos nuevos formatos de juego: **burbujas sonoras** y **completar la sílaba faltante**.
- Después de construir una palabra, aparece un **trazado táctil de la palabra completa** como refuerzo grafomotor. No se usa como evaluación de lectura o escritura.
- Trazado de letras ampliado a N, T y D.
- Consignas centradas en audio: el botón musical pulsa visualmente, la instrucción se reproduce una vez al entrar y puede repetirse manualmente.
- Se elimina la repetición automática de “mmm/ppp/sss…”: las consignas usan palabras o instrucciones naturales.
- Refuerzo rápido no verbal: estrella/confites, tono breve y check visual; sin párrafos de felicitación después de cada acierto.
- Navegación de misión: Atrás, Menú y Guardar/Salir.
- Guardado de sesión en curso: se puede volver al menú o salir y continuar después.
- Sistema local de perfiles recordados: al salir se vuelve al selector y aparecen los nombres guardados y si tienen una sesión pendiente.
- Persistencia migrada a `emilia.reader.v4`, compatible con estados de v3, v2, v1 y el legado `emilia.v3`.
- PWA y caché actualizados.

## Motor de audio
- Una reproducción automática por instrucción.
- El niño puede repetir tocando el botón ♪ todas las veces que necesite.
- Las respuestas se bloquean únicamente mientras la voz está hablando.
- Velocidades diferenciadas para sílabas, palabras, frases e instrucciones.
- Sigue preparado el banco `assets/audio/` para sustituir TTS por grabaciones humanas controladas.

## Perfiles
Los perfiles se guardan solo en el dispositivo. No requieren cuenta, correo ni nube. Cada perfil conserva progreso, sesiones, semillas y una sesión activa si se salió a mitad de actividad.

## Uso
- Puede abrirse directamente con doble clic en `index.html`.
- Para instalación PWA y caché offline, servir por HTTP/HTTPS, por ejemplo Cloudflare Pages.

## Próximo paso
Cuando llegue el ZIP de assets semi-realistas, se normalizarán nombres, transparencia y dimensiones y se integrarán sin alterar estos motores.

## Alcance
Herramienta educativa de práctica de alfabetización inicial. No es una prueba diagnóstica ni un sistema automático para determinar si una niña o niño “sabe leer”.

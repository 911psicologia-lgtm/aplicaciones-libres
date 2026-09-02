# Emilia · El Bosque de las Palabras — Prototipo 0.3.1

Tercera iteración jugable de la reconstrucción DSEBI, revisión de escucha infantil.


## Corrección 0.3.1 — Motor de escucha infantil
- Perfiles de velocidad por tipo de estímulo: fonema, sílaba, palabra, frase e instrucción.
- El modo por defecto es **Lento recomendado**.
- Fonemas y sílabas breves se repiten dos veces, separados por una pausa de aproximadamente 650 ms.
- Mientras el estímulo suena, las respuestas quedan temporalmente bloqueadas.
- Estado visual `👂 Escucha…` y aviso `Ahora puedes responder`.
- En el sendero silábico no puede iniciarse otra pronunciación hasta que termine la actual.
- En construcción de palabras, cada sílaba se oye completa antes de poder tocar la siguiente.
- Los cuentos se modelan primero palabra por palabra y después como frase completa.
- Panel adulto: ritmo **Muy lento / Lento recomendado / Normal**, repetición de sonidos cortos y prueba MA–ME–MI–MO–MU.
- Corregido el orden de eventos del banco de audio local: `onStart` ocurre al comenzar el clip y `onEnd` al finalizar.

## Novedades 0.3.0
- Bosque vivo: el mapa incorpora flora y luciérnagas según las semillas ganadas.
- Cinco estados visuales de crecimiento del bosque.
- Trazado táctil de M, P, S y L mediante canvas, con guía amplia y tolerancia infantil.
- El trazado se registra como práctica motora; no sustituye el reconocimiento de letras.
- Sesiones adaptativas: pueden finalizar cuando hay evidencia suficiente o continuar si hace falta más práctica.
- Contador de misión deja de presentar una cuota rígida de ejercicios.
- Motor de banco de audio local: busca primero clips pedagógicos controlados y usa Web Speech como respaldo.
- Carpeta `assets/audio/` preparada para grabaciones humanas reales de a/e/i/o/u/m/p/s/l.
- Persistencia migrada a `emilia.reader.v3`, compatible con v2, v1 y el legado `emilia.v3`.
- Service Worker actualizado.

## Audio
El prototipo NO fabrica fonemas sintéticos y los presenta como grabaciones pedagógicas. Cuando no existe un clip local, utiliza la voz disponible en el dispositivo. Consulta `assets/audio/README.txt`.

## Uso
- Puede abrirse directamente con doble clic en `index.html`.
- Para instalación PWA y caché offline, servir por HTTP/HTTPS (por ejemplo Cloudflare Pages).

## Alcance
Es una herramienta educativa de práctica de alfabetización inicial, no una prueba diagnóstica ni un sistema automático para determinar si una niña o niño "sabe leer".

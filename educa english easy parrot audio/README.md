# Easy Parrot — Easy English Go

PWA complementaria de **Easy English Go**, enfocada en practicar inglés
cotidiano por audio. El loro de la marca es la mascota de esta mini-app:
escuchas y repites, igual que un loro — la metáfora justifica la función.

## Estructura del proyecto

```
index.html              → onboarding + dashboard + repaso inteligente + el cajón
manifest.json            → configuración PWA (nombre, ícono, theme_color)
service-worker.js        → caché del shell + aviso de actualización
css/styles.css           → estilos, paleta alineada a Easy English Go
js/storage.js            → perfil y progreso en localStorage (solo este dispositivo)
js/datetime-context.js   → detecta franja horaria real del dispositivo
js/audio-engine.js       → envuelve la Web Speech API (voces del sistema)
js/app.js                → onboarding, dashboard, repaso inteligente, reproducción
data/topics-data.js      → 13 familias temáticas × 30 frases (390 en total)
icons/                   → íconos de la PWA (mascota del loro)
```

## Identidad visual

Paleta tomada de Easy English Go: violeta `#6d5dfc`, turquesa `#18c3d6`,
navy `#0d1320`. Tipografía Nunito (encabezados/UI) + Inter (cuerpo), igual
que la app principal. Se mantiene el fondo oscuro del cajón porque el uso
previsto es con los ojos cerrados o mientras se hacen otras tareas — el
navy ya forma parte de la paleta de marca, así que no hay contradicción.

## Cómo funciona el orden de contenido

1. La hora real del dispositivo solo define el **saludo** y el **color
   ambiental** del cajón (mañana/tarde/noche) — ya no filtra ni reordena
   qué tópicos están disponibles. Los 13 aparecen siempre.
2. La cola sigue los **intereses marcados, en el orden en que se
   marcaron** — y después, el resto de los 13 tópicos.
3. Dentro de cada tópico, nunca se repite una frase ya escuchada hasta
   cubrir las 30 (puntero independiente por tópico).
4. **Repetición por frase:** 1 a 4 veces antes de avanzar (paso 4 del
   onboarding).
5. **Repetición por tema completo:** 1 a 3 vueltas completas a las 30
   frases de un tópico antes de saltar al siguiente (paso 5, nuevo).
6. **Modo "todo un poco"** (ícono de aleatorio junto a los controles):
   mezcla las 390 frases de los 13 tópicos sin resumir, truncar ni
   filtrar nada — solo cambia el orden. Vuelve a barajar automáticamente
   al cubrir las 390. Tocar el chip de tema, estando en este modo, baraja
   de nuevo de inmediato.
7. **Repaso inteligente**: prioriza frases marcadas como difíciles, luego
   frases practicadas pocas veces y después frases no vistas. Se calcula localmente con las marcas y estadísticas guardadas.

## Salir / cambiar de usuario

El ícono de salida (esquina superior del cajón) pausa el audio y vuelve a
la pantalla inicial de identificación sin recargar ni sacar de la PWA. El
usuario también puede borrar datos desde el dashboard o desde ajustes. La
versión final no incluye importación/exportación JSON, exportación TXT ni funciones de IA por decisión de alcance.

## Instalar como app

Junto al ícono de salir hay un ícono de instalar que solo aparece cuando
el navegador permite instalar la PWA (evento `beforeinstallprompt` —
Chrome/Edge en Android y escritorio). **iOS Safari no dispara ese evento
nunca**: ahí la instalación es manual, vía Compartir → Añadir a pantalla
de inicio. Si el navegador no muestra el ícono, es porque ya está
instalada o porque ese navegador no soporta instalación de PWA.

## Sobre el cuelgue en computadores de escritorio

`speechSynthesis` en Chrome/Edge de escritorio tiene un bug conocido:
tras ~15 segundos hablando seguido (o si la pestaña pierde foco), el
motor puede "dormirse" y nunca disparar el evento que la app esperaba
para continuar. Se corrigió en `audio-engine.js` con un timeout de
seguridad por frase y un "keep-alive" que reactiva el motor cada 12s
mientras habla. Si vuelve a colgarse, lo más probable es que sea ese
mismo bug en una variante distinta — avísame con el navegador y sistema
operativo exactos para acotarlo.


## Aviso de actualización

Cada vez que se vuelve a desplegar en Cloudflare Pages, **hay que subir el
número de versión en `service-worker.js`** (la constante `CACHE_NAME`,
por ejemplo de `easy-parrot-v2` a `easy-parrot-v3`). Eso es lo que hace
que el navegador detecte el cambio: la próxima vez que alguien tenga la
app abierta, aparece un aviso breve ("Hay una nueva versión · Actualizar")
sin detalles de qué cambió, tal como pediste. Si no subes ese número, el
navegador seguirá sirviendo la versión cacheada anterior.

## Cómo desplegar en Cloudflare Pages

1. Sube esta carpeta completa a un repositorio en GitHub/GitLab, sin
   modificar la estructura.
2. En Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**,
   selecciona el repositorio.
3. Build command: vacío. Build output directory: `/`.
4. Despliega. En cada actualización futura, recuerda subir `CACHE_NAME`.

## Cómo agregar o editar frases

Todo el contenido vive en **`data/topics-data.js`**. Cada tópico es un
objeto con `id` (debe coincidir con el `data-kw` del chip en `index.html`),
`titulo`, `franjaSugerida` y `frases` (`es`, `en`, `tipo`). Agrega objetos
al array `frases` del tópico que quieras ampliar — no hace falta tocar
ningún otro archivo.

## Limitaciones técnicas honestas

- **Voces de síntesis:** la app usa las voces ya instaladas en el
  dispositivo (Web Speech API), no archivos de audio grabados. La calidad
  varía según el sistema operativo y navegador.
- **Reproducción con pantalla bloqueada:** mejor esfuerzo (Media Session
  API + audio silencioso en bucle + service worker), no garantía —
  especialmente en iOS Safari si la PWA no está instalada en pantalla de
  inicio.
- **Sin nube ni multidispositivo:** perfil y progreso viven en
  `localStorage` de este navegador. Decisión deliberada para mantener el
  proyecto como sitio estático, sin backend ni costos de servidor.
- **Sin importación/exportación JSON, sin TXT y sin IA:** decisión deliberada para mantener esta versión final ligera, local y estable.



## Versión curada FR/PT-BR

Esta compilación incorpora los lotes 1 y 2 de curación idiomática: 168 ajustes únicos aplicados en francés y portugués brasileño. El criterio de corrección no fue literal, sino funcional: conservar el sentido comunicativo de modismos, phrasal verbs y fórmulas cotidianas.

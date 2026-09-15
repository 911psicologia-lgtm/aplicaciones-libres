# 🌈 PequeWorld v11 — Inglés para Niños (3-7 años)

App de aprendizaje de primeras palabras en inglés: **multiarchivo**, con
**fotos reales**, **79 mundos / 782 palabras**, **11 juegos y estudios**
(⚡ **Rápido** · Completa · Empareja · Memoria · Escucha · 🎤 Di la palabra ·
🕵️ Intruso · 🧩 **Oraciones** · 🔵 **Rimas** · 📚 Diccionario · Repaso
**priorizado**), **tour de bienvenida**, **🔒 puerta parental**, **🏆 hitos de
palabras dominadas**, **🖨️ informe de padres imprimible con consejos AAP**,
**🔊 selector de voz en inglés**, **PWA instalable sin conexión**, avatar con
tu propia foto, Tienda de 12 avatares, Ruleta diaria, ⭐ Mundo destacado y
🎓 Diplomas imprimibles.

> ✨ **Novedades v11 (ajustes geniales — vía libre, sin tocar lo que funciona):**
> 1. 📆 **Palabra del Día**: cada día una palabra con foto real espera en el
>    mapa (determinista por fecha local — cambia a medianoche, no a las 19:00).
>    Tocar 🔊 la pronuncia despacio y, la primera vez del día, regala
>    **+5 XP +3 monedas**. 2 insignias nuevas («Palabra del Día» y
>    «Semana de Palabras»), estadística para padres y ✅ visual al completarla.
> 2. ⏰ **Descanso amigable**: a los 30 y 60 minutos de juego el búho sugiere
>    estirarse, mirar lejos y tomar agua (consejo AAP). **Nunca interrumpe una
>    misión** — espera a que el juego esté libre — y se puede apagar en
>    Ajustes. Los minutos se cuentan 100% local (visible en Zona de padres:
>    «Minutos hoy») y la pestaña en segundo plano no cuenta.
> 3. 🌠 **Estrellas fugaces mágicas**: cada 9–26 segundos una estrella cruza
>    el cielo nocturno del mapa. Pura decoración (no roba toques), respeta
>    `prefers-reduced-motion` y desaparece sola.
> 4. 🎺 **Fanfarria de JACKPOT**: el cofre con premio gordo ahora suena con
>    un arpegio brillante y acorde final (además del confeti).
> 5. 📳 **Vibración háptica**: un toque suave al acertar y un patrón
>    «inténtalo otra vez» al fallar (solo móviles que lo soportan; apagable
>    en Ajustes). En PC queda silenciosa.
> 6. 🏅 **92 insignias** (2 nuevas) y migración automática de perfiles
>    antiguos sin perder nada. Caché PWA `pequeworld-v11` (el botón azul de
>    actualización avisa a las instalaciones previas).

> 🛡 **Novedades v10 (fotos siempre completas + botones PWA discretos):**
> 1. 🖼 **FIN DEL RECORTE DE FOTOS (crítico pedagógico)**: la piña del
>    intro solo dejaba ver su corona y hasta el **49%** de una portada
>    quedaba fuera. Causa real medida (evidencia antes/después con
>    Playwright): fotos cuadradas 512×512 dentro de cajas anchas-bajas con
>    `object-fit:cover` (portadas de mundo 86px, tarjetas de intro 70px,
>    opciones en móvil). Ahora **toda** foto de aprendizaje usa caja
>    cuadrada + `contain` — **recorte medido: 0% en las 36 superficies**.
>    Verificado también en Sesión Rápida, portadas y memorama.
> 2. ⬇️ **Botón de INSTALAR PWA** (discreto, animado, **sin texto**): aparece
>    solo cuando el navegador ofrece la instalación (Chrome/Edge/Samsung en
>    https o localhost), icono dorado con latido suave, esquina inferior
>    derecha sobre la barra; con `prefers-reduced-motion` se queda estático.
>    En file:// nunca molesta (queda oculto). Una sola oferta por visita.
>    Ambos botones miden 40px, son translúcidos y **se atenúan solos tras
>    unos segundos sin toques** (vuelven al primer toque): discreción total
>    durante el juego.
> 3. 🔄 **Botón de ACTUALIZACIÓN DISPONIBLE** (discreto, animado, sin
>    texto): cuando se publica una versión nueva, el SW la descarga en
>    segundo plano y el icono azul **cabecea y gira lentamente**; al tocar
>    recarga y estrena versión. Comprueba novedades al volver a la app y
>    cada hora (nunca interrumpe un juego). Caché `pequeworld-v11`.
> 4. 🛠 Endurecido el futuro: las 11 cajas de foto ahora son `contain` —
>    aunque mañana se añada una foto no cuadrada, **jamás se recortará**;
>    los avatares circulares mantienen su recorte decorativo intencional.

> 🛡 **Novedades v9 (auditoría DSEBI TRIPLE A1/A2/A3 — correcciones dirigidas):**
> 1. 🔵 **Rimas corregidas (CRÍTICO)**: en v8 el juego podía mostrar preguntas
>    con **dos respuestas válidas** (Pear/Ear/Square/New Year con «bear–chair»,
>    Monkey con «bee–tree», Airplane con «train–rain») — el niño acertaba y se
>    le marcaba mal. Nuevo filtro **fonético de rimas**: 0 colisiones
>    verificado con una sonda sobre los 782 datos reales, en 15 misiones E2E.
> 2. 📅 **El «día» de la app ahora es TU día (CRÍTICO)**: antes usaba fecha UTC
>    y en Colombia la meta diaria, la ruleta y los hitos se reiniciaban a las
>    **19:00** (un niño podía girar la ruleta 2 veces en una tarde y el gráfico
>    movía las misiones nocturnas al día siguiente). Ahora todo usa la fecha
>    local del dispositivo.
> 3. 📶 **PWA offline completa (CRÍTICO)**: el Service Worker ahora incluye en
>    su núcleo las **fuentes Baloo 2/Nunito, los 18 avatares y los premios**
>    (trofeo, medallas, cofre) — el primer uso sin conexión ya no pierde la
>    identidad visual. Caché `pequeworld-v9` (llega a las instalaciones viejas).
> 4. 🛟 **Rescate de progreso (ALTO)**: el estado se respalda en una **copia
>    rotativa** (máx. 1/min). Si el guardado principal se corrompe (p. ej.
>    pestaña cerrada al escribir), la app **recupera la última copia** y avisa
>    — antes se perdía TODO en silencio. Verificado con JSON truncado en E2E.
> 5. 🧼 **Nombres seguros (ALTO)**: el nombre del perfil se **escapa** antes de
>    mostrarse (login, ranking, diploma, informe) — un nombre como
>    «<u>x</u>&Co» ya no puede romper la interfaz.
> 6. 👥 **Cambiar de jugador aborta la partida (ALTO)**: antes, si cambiabas de
>    jugador en mitad de una misión, las respuestas siguientes acreditaban XP,
>    monedas e insignias **al perfil nuevo** (injusticia entre hermanos).
> 7. 🔊 **Selector de voz auto-refrescado (ALTO)**: en Chrome/Android las voces
>    tardan segundos en llegar — ahora el selector se rellena solo cuando
>    están listas (antes había que reabrir Ajustes).
> 8. 📚 **Diccionario por lotes (ALTO)**: muestra 350 fichas + botón «➕ Ver
>    más» — las 782 de golpe provocaban una pausa de 1-2 s en tablets
>    modestas.

> 🛠 **Novedades v8 (auditoría DSEBI — A+B+C aprobadas):**
> 1. 🧭 **Tour de bienvenida**: 3 pasos la primera vez (mapa → juegos →
>    familia) + botón «¿Cómo funciona?» en el login. **Objetivo visible.**
> 2. 🔒 **Puerta parental**: importar progreso y reiniciar perfil piden a un
>    adulto resolver una multiplicación — el progreso ya no se pierde por un toque.
> 3. ⚡ **Sesión Rápida de 5 minutos**: cero decisiones — mezcla automática de
>    errores priorizados y palabras nuevas de los mundos con menos estrellas.
> 4. 🔁 **Repaso priorizado (repetición espaciada simple)**: primero las más
>    falladas y las más antiguas (score = fallos×2 + días×3).
> 5. 🧩 **Sentence Builder**: arma oraciones de 3-4 palabras tocando fichas en
>    orden («I see a dog») — el niño ya no solo conecta palabras sueltas.
> 6. 🔵 **Rhyme Time**: 9 pares de rimas con fotos (cat–hat, dog–frog…).
> 7. 🏆 **Hitos de dominio**: álbum con páginas a 10/25/50/100/200/500 palabras
>    dominadas, con celebración, estrellas y monedas — motivo de volver ligado
>    al aprendizaje, no solo a las monedas.
> 8. 🖨️ **Informe para la familia imprimible** (o PDF) con estadísticas y
>    **consejos de uso saludable** basados en las recomendaciones públicas de
>    la American Academy of Pediatrics (Pediatrics, 2016).
> 9. 🔊 **Selector de voz en inglés** con previsualización (las voces dependen
>    del dispositivo) + 🗣️ **dictado**: la app escucha al niño y le dice si
>    entendió la palabra (donde el navegador lo permite).
> 10. 👥 **Cambiar de jugador** desde Ajustes (para familias con varios niños).
> 11. 🐄🤖🌙 **3 mundos nuevos**: Tech World (N3), Sweet Shop y Bedtime (N2) —
>    25 palabras nuevas con fotos ya verificadas.
> 12. 📶 **PWA + Service Worker**: instalable y **funciona sin conexión**
>    (vía servidor local); **fuentes auto-hospedadas** (Baloo 2 + Nunito) — la
>    identidad ya no depende de Google Fonts CDN.
> 13. ♿ **Accesibilidad**: zoom permitido, `prefers-reduced-motion` respetado
>    (confeti/estrellas suaves), textos `alt` completos, foco visible.
> 14. 🛡️ **Guard de cuota**: si el guardado se llena, la app avisa y sugiere
>    exportar — nunca más pérdida silenciosa.
> 15. 🔒 **Declaración de privacidad** para padres dentro de Ajustes: qué se
>    guarda, qué nunca sale del dispositivo, y cómo borrarlo todo.

> 📋 Historial de cambios: `AUDITORIA-v5.md`, `AUDITORIA-v7.md`, `AUDITORIA-v8.md`
>
> 🛠 **Novedades v7 (nuevas mejoras):**
> 1. 🎤 **Say It! — Di la palabra:** el niño escucha la palabra, **graba su
>    propia voz** 🎙️ y se compara con la pronunciación correcta. 6 palabras
>    por sesión, con premio final e insignias.
> 2. 🕵️ **Odd One Out — ¿Cuál no pertenece?:** 4 fotos, 3 de un mundo y 1
>    intruso. Entrena lógica y categorías; al responder se revelan las
>    palabras y se explica por qué.
> 3. 📚 **Mi Diccionario:** las **757 palabras** con su foto y audio en un
>    solo lugar, con filtros por nivel y mundo, y el estado de cada palabra:
>    🌱 nueva → ✅ aprendida → 🏆 dominada (según cuántas veces la aciertas).
> 4. 🎓 **Diplomas imprimibles:** al dominar un mundo con 3⭐ (o subir de
>    nivel) ganas un diploma con tu nombre y tu foto, listo para **imprimir**
>    y colgar. Nueva pestaña «Diplomas» en Premios.
> 5. 📊 **Gráfico de actividad (Zona de padres):** misiones completadas en
>    los últimos 14 días + 4 estadísticas nuevas (voz, intrusos, palabras
>    dominadas, diplomas).
> 6. ⭐ **Mundo destacado del día:** cada día un mundo del mapa da **monedas
>    x2** (cinta dorada «Hoy x2 🪙»).
> 7. 🛍️ **4 avatares nuevos** en la tienda: Conejito Suave, Koala Dormilón,
>    Búho Sabio y Dragoncito (12 en total).
> 8. 🖼️ **25 ilustraciones restantes reemplazadas por fotos reales** (deuda
>    de la v4/v5 saldada: profesiones, objetos, ciencia, gestos…).
> 9. ✨ Detalles: saludo según la hora («¡Buenas tardes…»), favicon 🌈,
>    precarga de las fotos de la siguiente pregunta y contabilidad de
>    misiones por día.
> 10. 🐛 Corrección interna: al salir del Diccionario o del estudio de voz,
>     la pantalla anterior ya no queda encendida detrás.

**v6 (recordatorio):** parejas del memorama siempre destapadas · hueso
(bone) realista · fotos del repaso completas en PC · portadas realistas de
Numbers 11–20 y 21–30.

## 🚀 Cómo jugar

**Opción 1 (más fácil):** descomprime el ZIP y haz doble clic en `index.html`.

**Opción 2 (recomendada — activa cámara 📷 y micrófono 🎙️):** arrastra:
- **Windows:** doble clic en `Iniciar-PequeWorld-WINDOWS.bat`
- **Mac / Linux:** doble clic en `iniciar-mac-linux.sh`

(ambos lanzan un mini servidor local y abren el navegador en
`http://localhost:8080`). También puedes hacerlo a mano:

```bash
cd pequeworld
python3 -m http.server 8080   # abre http://localhost:8080
```

> La app guarda el progreso **en este dispositivo** (localStorage): no hay
> conexión entre dispositivos ni cuentas en internet. La voz en inglés usa la
> síntesis de voz del sistema. La cámara y el micrófono de «Say It!»
> requieren el contexto seguro `localhost` o permiso del navegador; si no
> están disponibles (archivo abierto directo), la app lo avista y ofrece
> alternativas (foto de la galería / practicar escuchando y repitiendo).

## 🎮 Novedades v5/v6 (resumen)

| Novedad | Detalle |
|---------|---------|
| 🐮 Farm · 🥦 Vegetables · 🏘️ My Town | Mundos nuevos + Clima y Cuerpo ampliados |
| 🃏 Memorama · 🎧 Escucha y Elige | Memoria visual y comprensión auditiva |
| 🛍️ Tienda de avatares · 🎡 Ruleta diaria | Economía local con monedas |
| 👨‍👩‍👧 Zona de padres | Estadísticas + exportar/importar progreso (JSON) |
| 🐛 Fixes v6 | Memorama destapado, bone realista, repaso PC sin recortes, portadas Numbers |

## 🗂️ Estructura del proyecto

```
pequeworld/
├── index.html              ← pantalla principal (abre este archivo)
├── manifest.webmanifest    ← PWA (instalable, v8)
├── sw.js                   ← service worker (offline, v8)
├── Iniciar-PequeWorld-WINDOWS.bat   ← arranque con cámara/micrófono (Windows)
├── iniciar-mac-linux.sh    ← arranque con cámara/micrófono (Mac/Linux)
├── servidor-local.py       ← mini servidor local (sin dependencias)
├── css/                    ← estilos (base · juego · juegos v4-v7 · v8)
│   └── fonts.css           ← fuentes locales (v8)
├── js/                     ← lógica en 14 módulos sin dependencias
│   ├── data_worlds*.js     ← vocabulario Niveles 1-3 (79 mundos / 782 palabras)
│   ├── data_meta.js        ← niveles, 90 insignias, hitos, tienda (12), ruleta
│   ├── games.js            ← completar, emparejar, memoria, escucha, repaso, avatar
│   ├── games2.js           ← v7: Say It, Intruso, Diccionario, Diplomas, gráfico
│   ├── games3.js           ← v8: tour, puerta parental, ⚡Rápido, oraciones,
│   │                          rimas, hitos, informe, dictado, voz, PWA
│   └── ...                 ← audio, efectos, ui, juego, utilidades
├── assets/fonts/           ← Baloo 2 + Nunito (woff2, v8)
├── assets/img/words/       ← fotos del vocabulario (todas reales)
├── assets/img/avatars/     ← avatares + coleccionables de la tienda (18)
├── assets/img/ui/          ← premios: trofeo, medallas, cofre, mascota, iconos
├── AUDITORIA-v5.md         ← autoauditoría v5
├── AUDITORIA-v7.md         ← autoauditoría v7
└── AUDITORIA-v8.md         ← auditoría DSEBI v8 (este cambio)
```

## 🏆 Sistema de recompensas

- ⭐ Estrellas por misión (hasta 3) · ✨ XP y niveles · 🪙 monedas
- 🎁 Cofre sorpresa al terminar con 2+ estrellas
- 🎯 Meta diaria (3 misiones) · 🔥 Rachas · 🎡 Ruleta diaria
- ⭐ Mundo destacado del día (monedas x2)
- 🏆 **Hitos de palabras dominadas (10→500) con álbum** (v8)
- 🛍️ Tienda de 12 avatares coleccionables
- 🏅 90 insignias · 🎓 Diplomas imprimibles · 📊 Ranking con rivales IA
- 📚 Diccionario con progreso por palabra (🌱/✅/🏆)
- 🖨️ **Informe de progreso para la familia** (v8)

## 🔧 Notas técnicas

- Sin frameworks ni dependencias: HTML + CSS + JS clásico (funciona abriendo
  el archivo directo, sin instalación).
- **PWA**: `manifest.webmanifest` + `sw.js` — al usarla desde el mini servidor
  local (o HTTPS) se instala como app y funciona sin conexión. Con doble clic
  (file://) todo funciona igual; solo el SW y la instalación no aplican.
- **Fuentes locales** en `assets/fonts/` (woff2): sin dependencia de internet.
- Progreso en `localStorage` (clave `pequeworld_v2`), con migración
  automática desde perfiles antiguos — **nadie pierde su progreso al actualizar**.
- **Guard de cuota**: si el almacenamiento se llena, la app avisa y sugiere
  exportar; el progreso se conserva aunque haya que soltar las fotos base64.
- Copia de seguridad: Ajustes → Zona de padres → Exportar/Importar (JSON;
  importar pide verificación de adulto).
- El micrófono de Say It! graba y reproduce **solo en memoria**: ninguna
  grabación se guarda ni se envía a ningún lado.

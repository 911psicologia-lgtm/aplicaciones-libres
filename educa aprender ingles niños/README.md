# 🌈 PequeWorld v4 — Inglés para Niños (3-7 años)

App de aprendizaje de primeras palabras en inglés: **multiarchivo**, con
**fotografías e ilustraciones reales**, **3 juegos mentales nuevos**
(Completar · Emparejar · Repaso de errores) y **avatar con tu propia foto**
(cámara o galería).

## 🚀 Cómo jugar

**Opción 1 (más fácil):** descomprime el ZIP y haz doble clic en `index.html`.

**Opción 2 (recomendada en Chrome):** sirve la carpeta con un servidor local
para que la voz TTS y la **cámara** funcionen al 100%:

```bash
# con Python
cd pequeworld
python3 -m http.server 8080
# abre http://localhost:8080
```

> La app guarda el progreso en el navegador (localStorage). La voz en inglés
> usa la API de síntesis de voz del sistema. La cámara requiere permiso del
> navegador; si no está disponible (p. ej. abriendo el archivo directo), la
> app lo avisa con amabilidad y ofrece cargar una foto **de la galería**.

## 🗂️ Estructura del proyecto

```
pequeworld/
├── index.html              ← pantalla principal (abre este archivo)
├── css/
│   ├── style.css           ← base, login, mapa, mundos
│   ├── game.css            ← juego, premios, cofre, medallas
│   └── games.css           ← zona de juegos, completar, emparejar, cámara
├── js/
│   ├── utils.js            ← utilidades + rutas de imágenes
│   ├── data_worlds.js      ← vocabulario Nivel 1 (21 mundos)
│   ├── data_worlds2.js     ← vocabulario Nivel 2 (22 mundos)
│   ├── data_worlds3.js     ← vocabulario Nivel 3 (30 mundos)
│   ├── data_meta.js        ← niveles, insignias, avatares, meta diaria
│   ├── audio.js            ← voz TTS + efectos de sonido
│   ├── effects.js          ← confeti, estrellas, toasts
│   ├── ui.js               ← login, mapa, premios, ajustes, zona de juegos
│   ├── game.js             ← motor del juego + cofre sorpresa
│   ├── games.js            ← ★ Completar · Emparejar · Repaso · Cámara avatar
│   └── main.js             ← arranque
└── assets/
    └── img/
        ├── words/          ← 340+ fotos e ilustraciones del vocabulario
        ├── ui/             ← mascota y assets de premios (IA)
        └── avatars/        ← avatares para los perfiles (IA)
```

## 🆕 Qué hay de nuevo en v4

- **📸 Avatar con tu foto**: al crear el perfil (o desde Ajustes) puedes
  **encender la cámara**, sonreír y capturar tu foto, o **elegir una imagen de
  la galería**. La foto se recorta en círculo y queda como tu avatar en login,
  mapa y ranking.
- **🔤 Juego “Completa la palabra”**: se muestra la foto y la palabra con una
  letra faltante; el niño elige la letra correcta entre 4 opciones. La app
  deletrea la palabra en voz alta (D… O… G…).
- **🧩 Juego “Empareja”**: 5 fotos y 5 palabras mezcladas; toca una foto y luego
  su palabra. 2 rondas por partida, con audio de refuerzo en cada acierto.
- **🔁 Repaso inteligente de errores**: cada error se guarda en el perfil. La
  nueva **Zona de Juegos** del mapa muestra “Repaso (N errores)” y construye
  una misión con las palabras falladas, alternando foto→palabra y letra que
  falta. Al acertar, la palabra **se marca como aprendida** y sale de la lista.
  También hay un botón “Repasar mis errores (N)” en la pantalla de resultados.
- **🏅 7 insignias nuevas** de los juegos mentales (Primer Completado,
  Escriba Pequeño, Emparejador, Maestro del Par, Repasador Estrella,
  Mente Genial, Sabelotodo).
- **🎨 40+ imágenes corregidas**: auditoría visual completa del vocabulario;
  se reemplazaron fotos en blanco y negro, vintage o confusas (enfermera,
  chef, dentista, abuela, panadero, pulpo, langosta, baile, notas, p¡ñata…)
  por ilustraciones claras y coloridas que un niño reconoce al instante.
- **📱 Responsive verificado** en móvil (390px), tablet (820px), laptop bajo
  (1366×705) y PC (1920px): sin scroll horizontal, nada tapado por la barra
  inferior, tablero de emparejar siempre a la vista.

## 🎓 Pedagogía

- Voz lenta y clara (configurable) en inglés, español o bilingüe.
- Refuerzo positivo: aplausos, confeti y celebraciones; nunca castigos.
- Progresión en 3 niveles: Semilla (3-5), Explorador (5-6), Héroe (6-7).
- Estrellas por misión (0-3) para motivar la repetición sin presión.
- El **repaso espaciado** de errores consolida el vocabulario: la app trae de
  vuelta las palabras falladas hasta que el niño las domina.

# 🌈 PequeWorld v3 — Inglés para Niños (3-7 años)

App de aprendizaje de primeras palabras en inglés, ahora **multiarchivo** y con
**fotografías reales** en lugar de emojis: cada palabra del vocabulario tiene su
foto cercana a la realidad, pensada para que un niño la reconozca al instante.

## 🚀 Cómo jugar

**Opción 1 (más fácil):** descomprime el ZIP y haz doble clic en `index.html`.

**Opción 2 (recomendada en Chrome):** sirve la carpeta con un servidor local
para que la voz TTS funcione al 100%:

```bash
# con Python
cd pequeworld
python3 -m http.server 8080
# abre http://localhost:8080
```

> La app guarda el progreso en el navegador (localStorage). La voz en inglés
> usa la API de síntesis de voz del sistema: en Chrome/Edge funciona sin
> configuración.

## 🗂️ Estructura del proyecto

```
pequeworld/
├── index.html              ← pantalla principal (abre este archivo)
├── css/
│   ├── style.css           ← base, login, mapa, mundos
│   └── game.css            ← juego, premios, cofre, medallas
├── js/
│   ├── utils.js            ← utilidades + rutas de imágenes
│   ├── data_worlds.js      ← vocabulario Nivel 1 (21 mundos)
│   ├── data_worlds2.js     ← vocabulario Nivel 2 (22 mundos)
│   ├── data_worlds3.js     ← vocabulario Nivel 3 (30 mundos)
│   ├── data_meta.js        ← niveles, insignias, avatares, meta diaria
│   ├── audio.js            ← voz TTS + efectos de sonido
│   ├── effects.js          ← confeti, estrellas, toasts
│   ├── ui.js               ← login, mapa, premios, ajustes
│   ├── game.js             ← motor del juego + cofre sorpresa
│   └── main.js             ← arranque
└── assets/
    └── img/
        ├── words/          ← 340+ fotos reales del vocabulario
        ├── ui/             ← mascota y assets de premios (IA)
        └── avatars/        ← avatares para los perfiles (IA)
```

## 🎓 Qué hay de nuevo en v3

- **Fotos reales en todo el juego**: tarjeta de pregunta, opciones, tarjetas de
  mundo, medallas y repaso previo a cada misión (flashcards táctiles con audio).
- **3 mundos nuevos**: Fruits (N1), Clothes (N2) e Insects (N2) — vocabulario
  ampliado siguiendo la vía de progresión.
- **Vocabulario curado**: las palabras abstractas difíciles de fotografiar se
  reemplazaron por concretas apropiadas para la edad.
- **🎁 Cofre sorpresa**: al terminar una misión con 2+ estrellas aparece un
  cofre que el niño abre para ganar monedas, XP o estrellas extra.
- **🎯 Meta diaria**: 3 misiones al día dan una recompensa reclamable.
- **Medallas y trofeos con imágenes**: ranking con medallas de oro, plata y
  bronce; medallas de mundo con la foto del tema; insignias en marcos dorados.
- **Avatares fotográficos** para los perfiles y una **mascota** que da la
  bienvenida.
- **Números con conteo visual**: cada número muestra su estrella-contador con
  estrellas reales para contar con el dedo.
- **Migración automática** de perfiles de la versión anterior (v1).

## 🧒 Pedagogía

- Voz lenta y clara (configurable) en inglés, español o bilingüe.
- Refuerzo positivo: aplausos, confeti y celebraciones; nunca castigos.
- Progresión en 3 niveles: Semilla (3-5), Explorador (5-6), Héroe (6-7).
- Estrellas por misión (0-3) para motivar la repetición sin presión.

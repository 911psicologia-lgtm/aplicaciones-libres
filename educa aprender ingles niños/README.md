# 🌈 PequeWorld v5 — Inglés para Niños (3-7 años)

App de aprendizaje de primeras palabras en inglés: **multiarchivo**, con
**fotos reales**, **76 mundos / 757 palabras**, **5 juegos mentales**
(Completa · Empareja · **Memoria** · **Escucha** · Repaso de errores),
**avatar con tu propia foto** (cámara o galería), **Tienda de Avatares** y
**Ruleta diaria de premios**.

> 📋 Consulta `AUDITORIA-v5.md` para ver la autoauditoría completa y todo lo
> que cambió en esta versión.

## 🚀 Cómo jugar

**Opción 1 (más fácil):** descomprime el ZIP y haz doble clic en `index.html`.

**Opción 2 (recomendada — activa la cámara 📷):** arrastra:
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
> síntesis de voz del sistema. La cámara requiere el contexto seguro
> `localhost` o permiso del navegador; si no está disponible (archivo
> abierto directo), la app lo avisa y ofrece usar una foto **de la galería**.

## 🎮 Novedades v5

| Novedad | Detalle |
|---------|---------|
| 🐮 Farm Animals | Mundo nuevo Nivel 1 con sonidos de granja |
| 🥦 Vegetables · 🏘️ My Town | Mundos nuevos Nivel 2 (verduras y lugares) |
| ⛅ Clima y 🧍 Cuerpo ampliados | 10 y 14 palabras respectivamente |
| 🃏 Memorama | 6 parejas foto+palabra, con bonus «de primera» |
| 🎧 Escucha y Elige | Solo audio → 4 fotos (entrenamiento del oído) |
| 🔁 Repaso mejorado | Mezcla 3 tipos: foto→palabra, completar letra y escucha |
| 🛍️ Tienda de Avatares | 8 personajes coleccionables (100–300 monedas) |
| 🎡 Ruleta diaria | 1 giro gratis al día: monedas, XP, estrellas o jackpot |
| 🏅 11 insignias nuevas | Ruleta, tienda, memoria, escucha y maestros v5 |
| 🧑 Foto en el hero | El mapa saluda con TU foto de perfil |
| 🖼️ Portadas únicas | Sin imágenes repetidas en las tarjetas del mapa |
| 👨‍👩‍👧 Zona de padres | Estadísticas + exportar/importar progreso (JSON local) |

## 🗂️ Estructura del proyecto

```
pequeworld/
├── index.html              ← pantalla principal (abre este archivo)
├── Iniciar-PequeWorld-WINDOWS.bat   ← arranque con cámara (Windows)
├── iniciar-mac-linux.sh    ← arranque con cámara (Mac/Linux)
├── servidor-local.py       ← mini servidor local (sin dependencias)
├── css/                    ← estilos (base · juego · juegos v4/v5)
├── js/                     ← lógica en 11 módulos sin dependencias
│   ├── data_worlds*.js     ← vocabulario Niveles 1-3
│   ├── data_meta.js        ← niveles, insignias, tienda, ruleta
│   ├── games.js            ← completar, emparejar, memoria, escucha, repaso, avatar
│   └── ...                 ← audio, efectos, ui, juego, utilidades
├── assets/img/words/       ← fotos del vocabulario (376+)
├── assets/img/avatars/     ← avatares + coleccionables de la tienda
├── assets/img/ui/          ← premios: trofeo, medallas, cofre, mascota
└── AUDITORIA-v5.md         ← autoauditoría y registro de cambios
```

## 🏆 Sistema de recompensas

- ⭐ Estrellas por misión (hasta 3) · ✨ XP y niveles · 🪙 monedas
- 🎁 Cofre sorpresa al terminar con 2+ estrellas
- 🎯 Meta diaria (3 misiones) · 🔥 Rachas · 🎡 Ruleta diaria
- 🛍️ Tienda de avatares coleccionables
- 🏅 +80 insignias y medallas por mundo
- 📊 Ranking con 5 rivales IA para superarse

## 🔧 Notas técnicas

- Sin frameworks ni dependencias: HTML + CSS + JS clásico (funciona abriendo
  el archivo directo, sin instalación).
- Progreso en `localStorage` (clave `pequeworld_v2`), con migración
  automática desde perfiles v4/v3.
- Copia de seguridad: Ajustes → Zona de padres → Exportar/Importar (JSON).

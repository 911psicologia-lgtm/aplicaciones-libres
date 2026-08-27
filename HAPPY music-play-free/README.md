# MUSIC-PLAY-FREE

**Reproductor de audio** — Local, privado y sin servidor.

MUSIC-PLAY-FREE es un reproductor de audio PWA que funciona completamente en tu navegador. Tu música permanece en tu dispositivo — no se sube a ningún servidor.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Para acceso a carpetas: Chromium 86+ o Edge 86+

## Instalación

```bash
npm install
```

## Ejecución local

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Build

```bash
npm run build
```

Los archivos compilados se generan en la carpeta `dist/`.

## GitHub Pages

1. Ejecuta `npm run build`
2. Sube el contenido de `dist/` a la rama `gh-pages` o usa GitHub Actions
3. La aplicación usa rutas relativas (`base: './'`), funciona en cualquier subruta

### GitHub Actions (ejemplo)

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Cloudflare Pages

1. Conecta tu repositorio a Cloudflare Pages
2. Configura:
   - **Comando de instalación:** `npm install`
   - **Comando de build:** `npm run build`
   - **Carpeta de salida:** `dist`
3. No requiere Workers ni backend

## Funcionamiento PWA

- Instalable desde el navegador (Chrome, Edge, Samsung Internet)
- Funciona offline (shell de la aplicación)
- Service Worker cachea recursos estáticos
- Modo standalone (sin barra de navegación)
- Soporte para tema claro y oscuro

## Acceso a carpetas

- **Chrome/Edge (Chromium 86+):** Usa File System Access API (`showDirectoryPicker`) para acceso completo a carpetas con permisos persistentes
- **Firefox/Safari:** Usa `<input type="file" webkitdirectory>` como alternativa
- **iOS Safari:** Solo selección de archivos individuales (limitaciones del sistema)

## Reproducción en segundo plano

- La reproducción continúa al cambiar de aplicación o bloquear la pantalla
- Media Session API permite controlar desde la pantalla de bloqueo, notificaciones y auriculares Bluetooth
- Los controles del sistema muestran título, artista y portada del álbum

## Limitaciones conocidas

- **iOS Safari:** No soporta File System Access API ni service workers completos. Solo selección de archivos individuales.
- **Firefox:** No soporta `showDirectoryPicker()`. Se usa `<input webkitdirectory>` como alternativa.
- **Reproducción en segundo plano iOS:** iOS puede suspender el audio tras un tiempo. Es una limitación del sistema.
- **Portadas:** Solo se muestran portadas incrustadas en los archivos (ID3 tags). No se descargan de Internet.
- **Formatos:** La compatibilidad depende del navegador. FLAC funciona en Chrome pero no en Safari.

## Estructura del proyecto

```
music-play-free/
├── src/
│   ├── main.tsx          # Punto de entrada
│   ├── app.tsx           # Componente principal
│   ├── index.css         # Estilos globales + Tailwind
│   ├── types/index.ts    # Tipos TypeScript
│   ├── lib/
│   │   ├── audio-engine.ts       # Motor de audio centralizado
│   │   ├── library.ts            # IndexedDB (biblioteca, playlists, cola)
│   │   ├── config.ts             # Configuración (localStorage)
│   │   ├── metadata.ts           # Parser de metadatos (music-metadata-browser)
│   │   ├── scanner.ts            # Escáner de archivos y carpetas
│   │   ├── media-session.ts      # Media Session API
│   │   └── player-controller.ts  # Controlador de reproducción
│   └── components/
│       ├── Icons.tsx             # Iconos SVG
│       ├── SplashScreen.tsx     # Pantalla de inicio
│       └── WelcomeScreen.tsx     # Pantalla de bienvenida
├── public/
│   ├── manifest.webmanifest     # Manifiesto PWA
│   ├── sw.js                    # Service Worker
│   ├── favicon.svg
│   └── icons/                   # Iconos PWA (72-512px + maskable)
├── dist/                        # Build compilado
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Tecnologías

- [Preact](https://preactjs.com/) + TypeScript
- [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb)
- [music-metadata-browser](https://github.com/Borewit/music-metadata-browser) para tags ID3
- PWA con Service Worker

## Licencia

Proyecto privado. Tu música, en tu dispositivo.

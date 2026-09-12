# Audio y Video Super Converter

Conversor de audio y video **100% estático y local**: conversión entre todos los formatos,
subtítulos SRT/VTT, metadatos, efectos (volumen, velocidad, recorte, fundidos) y un editor
de audio completo (recorte con onda interactiva, mejora de calidad, karaoke/eliminación de
voz, fundidos). Todo se procesa **dentro del navegador** con FFmpeg compilado a
WebAssembly — tus archivos nunca salen de tu dispositivo.

Aplicación construida con **Vite + React + TypeScript**. Sin servidor, sin funciones
serverless, sin base de datos. Lista para publicarse en **GitHub** y desplegarse en
**Cloudflare Pages**.

## Funciones

- **Convertir**: audio y video entre MP3, WAV, OGG, OPUS, FLAC, M4A, AAC, MP4, MOV, MKV, WEBM, AVI y GIF.
- **Multiarchivo**: procesa por lotes toda la cola de archivos.
- **Extracción de audio** desde cualquier video.
- **Presets de calidad**: Alta / Media / Baja.
- **Metadatos**: título, artista, álbum, género, año y comentario (copia sin pérdida cuando no hay efectos).
- **Efectos**: volumen, velocidad, recorte y fundidos de entrada/salida.
- **Subtítulos**: carga y lectura de SRT/VTT con previsualización e incrustación como pista suave (mov_text en MP4, SRT en MKV).
- **Editor de Audio**: recorte visual sobre la onda (conservar o eliminar fragmento), mejora de calidad (normalizar LUFS, reducción de ruido, claridad, graves/agudos, compresión), karaoke —elimina la voz y deja solo la música—, modo solo voz (experimental), fundidos automáticos en los cortes y fundidos manuales, formato de salida configurable.
- **Experiencia**: indicadores de carga y progreso, cancelación de procesos, descarga de resultados, tooltips en todos los controles, notificaciones, diseño oscuro esmeralda y responsive (computador, tableta y teléfono).

## Privacidad

El motor **FFmpeg WebAssembly** se sirve desde la propia aplicación (`public/ffmpeg/`),
sin CDN ni servicios externos. Ningún archivo del usuario viaja a ningún servidor.

## Estructura

```
├── index.html                  # Punto de entrada HTML real en la raíz
├── vite.config.ts              # base: './' + alias @/ → src/
├── package.json
├── package-lock.json
├── public/
│   ├── _headers                # Cabeceras para Cloudflare Pages (WASM, caché)
│   ├── favicon.svg
│   └── ffmpeg/                 # Motor FFmpeg WebAssembly (mismo origen, sin CDN)
│       ├── ffmpeg.js           # Cliente UMD
│       ├── 814.ffmpeg.js       # Chunk del worker
│       ├── ffmpeg-core.js      # Núcleo JS
│       └── ffmpeg-core.wasm.part01…part04   # Binario dividido (<10 MiB c/u)
├── scripts/
│   └── split-wasm.mjs          # Regenera los fragmentos desde un .wasm original
└── src/
    ├── main.tsx                # Punto de entrada React (carga globals.css + Toaster)
    ├── App.tsx                 # Componente principal
    ├── globals.css             # Tema oscuro esmeralda (Tailwind v4)
    ├── components/
    │   ├── super-converter/    # Componentes de la aplicación
    │   └── ui/                 # Componentes base (Radix + Tailwind)
    ├── lib/
    │   ├── utils.ts
    │   └── converter/          # Lógica del conversor
    │       ├── ffmpeg-client.ts    # Carga del motor: reconstruye el WASM desde 4 fragmentos
    │       ├── args-builder.ts     # Argumentos FFmpeg (conversión, metadatos, subtítulos)
    │       ├── audio-editor.ts     # Motor del editor de audio (corte, karaoke, mejoras, fundidos)
    │       ├── formats.ts          # Formatos y presets
    │       ├── media-utils.ts      # Utilidades multimedia
    │       └── subtitles.ts        # Parser/serializador SRT y VTT
    └── types/
        └── converter.ts        # Tipos compartidos
```

## Desarrollo local

Requiere **Node 20 o superior**.

```bash
npm install     # instala dependencias (genera package-lock.json)
npm run dev     # servidor de desarrollo (Vite)
npm run build   # análisis de TypeScript + compilación de producción → dist/
npm run preview # sirve dist/ para comprobar la compilación
npm run lint    # ESLint
npm run typecheck  # solo análisis de TypeScript
```

## El binario WASM dividido

El binario `ffmpeg-core.wasm` pesa ~32 MB y **Cloudflare Pages limita cada archivo a
25 MiB**. Por eso se sirve dividido en 4 fragmentos (`ffmpeg-core.wasm.part01…part04`,
cada uno < 10 MiB). La aplicación (`src/lib/converter/ffmpeg-client.ts`):

1. Descarga los 4 fragmentos secuencialmente desde la propia app.
2. Informa el progreso conjunto de la descarga.
3. Reconstruye el binario completo en memoria con un `Uint8Array`.
4. Verifica el tamaño exacto (32 129 114 bytes) y el SHA-256 del original
   (`2390efa7fb66e7e42dbae15427571a5ffc96b829480904c30f471f0a78967f61`).
5. Crea un `Blob` de tipo `application/wasm`, genera una URL local con
   `URL.createObjectURL()` y se la entrega a `ff.load()` como `wasmURL`.
6. Libera la URL cuando termina la carga.
7. Si falta un fragmento o está dañado, muestra un mensaje claro.

El WASM completo de 32 MB nunca llega a `dist/`.

Para regenerar los fragmentos (por ejemplo, al actualizar el núcleo):

```bash
# coloca el nuevo ffmpeg-core.wasm en public/ffmpeg/ y ejecuta:
npm run split-wasm
# luego copia los tamaños y el SHA-256 impresos a
# src/lib/converter/ffmpeg-client.ts (constantes WASM_PARTS, WASM_TOTAL_SIZE, WASM_SHA256)
```

## Despliegue en Cloudflare Pages (desde GitHub)

1. Sube este proyecto a un repositorio de GitHub (sin `node_modules/`; `dist/` se genera en el build).
2. En Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Selecciona el repositorio y configura:

   | Ajuste | Valor |
   |---|---|
   | Framework preset | **Vite** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (automático) |
   | Node version | `20` o superior — variable de entorno `NODE_VERSION` = `20` (o `22`) |

4. Pulsa **Save and Deploy**. La app quedará en `https://<tu-proyecto>.pages.dev`.

No se necesitan variables de entorno adicionales ni servicios externos: no hay base de
datos ni funciones serverless. El archivo `public/_headers` se copia automáticamente a
`dist/` y sirve el motor con las cabeceras correctas. No se requiere `_redirects`
(la aplicación es de una sola página sin rutas del lado cliente).

### Despliegue directo (arrastrar carpeta)

También puedes arrastrar el contenido de `dist/` a *Workers & Pages → Create → Pages →
Upload assets*: todos los archivos pesan menos de 10 MiB.

## Licencia

Uso libre para fines personales.

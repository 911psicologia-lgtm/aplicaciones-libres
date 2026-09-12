# Informe de migración — Audio y Video Super Converter

Migración de **Next.js 16** a una **aplicación web 100% estática (Vite + React + TypeScript)**
lista para GitHub y Cloudflare Pages. Todas las funciones de la aplicación se conservan
íntegras y el procesamiento sigue siendo 100% local en el navegador.

## 1. Archivos migrados

| Origen (Next.js) | Destino (Vite) | Notas |
|---|---|---|
| `src/app/page.tsx` | `src/App.tsx` | Se retira `'use client'`; `process.env.NODE_ENV` → `import.meta.env.DEV` |
| `src/app/layout.tsx` | `index.html` + `src/main.tsx` | Metadata → etiquetas `<meta>`; `Toaster` → `main.tsx` |
| `src/app/globals.css` | `src/globals.css` | Cargado desde `main.tsx`; fuentes del sistema en `@theme` |
| `next/font` (Geist) | Pila de fuentes del sistema | Sin descargas de fuentes externas |
| `src/components/super-converter/*` (13 componentes) | ídem | Copiados intactos; se retira `'use client'` |
| `src/components/ui/*` (12 componentes + sonner) | ídem | `sonner.tsx` adaptado sin gestor de temas externo |
| `src/lib/converter/*` (5 módulos) | ídem | `ffmpeg-client.ts` reescrito (fragmentos WASM) |
| `src/types/converter.ts`, `src/lib/utils.ts` | ídem | Sin cambios funcionales |
| `public/ffmpeg/*` | ídem | Ver «problema crítico de Cloudflare» |
| — nuevos | `vite.config.ts`, `tsconfig*.json`, `eslint.config.mjs`, `public/_headers`, `public/favicon.svg`, `scripts/split-wasm.mjs`, `.gitignore`, `README.md` | Configuración estática completa |

## 2. Dependencias retiradas

- `next` y `eslint-config-next` (todo el tooling de Next)
- `next-themes` (tema oscuro fijo de la aplicación)
- `next/font` (fuentes de Google vía framework)
- `prisma` y `@prisma/client` + base de datos + `DATABASE_URL`
- `z-ai-web-dev-sdk` y scripts internos del entorno Z.ai
- PostCSS de Next (`@tailwindcss/postcss`) → sustituido por `@tailwindcss/vite`
- Retirados también: `src/app/api/route.ts` (ruta de demostración), `prisma/`, `db/`,
  `src/lib/db.ts` y cualquier referencia a `.next`, `next dev/build/start`.

## 3. Dependencias conservadas

React 19 + React DOM 19, Radix UI (tooltip, slider, select, switch, progress, radio-group,
scroll-area, checkbox, label, slot), `framer-motion`, `lucide-react`, `sonner`,
`class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss` v4 + `tw-animate-css`.
Nuevas (dev): `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `typescript-eslint`,
`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@types/node`.

## 4. Motor FFmpeg — problema crítico de Cloudflare resuelto

`ffmpeg-core.wasm` pesa **32 129 114 bytes** (> 25 MiB por archivo en Cloudflare Pages).

- El binario se dividió en **4 fragmentos** numerados y ordenados, cada uno **< 10 MiB**:

  | Fragmento | Tamaño |
  |---|---|
  | `ffmpeg-core.wasm.part01` | 8 032 279 bytes (7.66 MiB) |
  | `ffmpeg-core.wasm.part02` | 8 032 279 bytes (7.66 MiB) |
  | `ffmpeg-core.wasm.part03` | 8 032 278 bytes (7.66 MiB) |
  | `ffmpeg-core.wasm.part04` | 8 032 278 bytes (7.66 MiB) |

  SHA-256 verificado del binario original y reconstruido:
  `2390efa7fb66e7e42dbae15427571a5ffc96b829480904c30f471f0a78967f61`

- `src/lib/converter/ffmpeg-client.ts` ahora: descarga los 4 fragmentos secuencialmente
  desde la propia app → progreso conjunto → reconstrucción en memoria con `Uint8Array` →
  verificación de tamaño exacto y SHA-256 → `Blob` tipo `application/wasm` →
  `URL.createObjectURL()` → `ff.load({ coreURL, wasmURL })` → liberación de la URL.
  Fragmentos faltantes o dañados generan mensajes claros; el WASM completo de 32 MB
  **nunca llega a `dist/`** (el original se eliminó de `public/` tras dividirlo).
- Sin CDN ni servicios externos: todo se sirve desde `public/ffmpeg/` con `public/_headers`.

## 5. Resultado de las pruebas

| # | Prueba | Resultado |
|---|---|---|
| 1 | `npm install` (Node 24) | ✅ genera `package-lock.json` |
| 2 | Análisis de TypeScript (`tsc -b`) | ✅ 0 errores |
| 3 | ESLint | ✅ 0 errores, 0 avisos |
| 4 | `npm run build` | ✅ `tsc -b && vite build` |
| 5 | `dist/index.html` existe | ✅ (1.2 kB, rutas relativas `./assets/...`) |
| 6 | Ningún archivo de `dist/` > 25 MiB | ✅ máximo: 8 032 279 bytes (7.66 MiB) |
| 7 | `npm run preview` | ✅ HTTP 200 |
| 8 | Interfaz en computador (1440×900) y teléfono (390×844) | ✅ capturas verificadas |
| 9 | Conversión real WAV → MP3 | ✅ 689.1 KB → 95.6 KB; cabecera ID3v2.4 verificada por bytes y ffprobe |
| 10 | Extracción real de audio desde video (MP4 → MP3) | ✅ ffprobe: `mp3`, 3.06 s |
| 11 | Metadatos (título/artista/álbum/género/año) | ✅ ffprobe lee las 5 etiquetas en el archivo de salida |
| 11b | Efectos (velocidad 1.5× + fundido de entrada) | ✅ 3.0 s → 2.13 s |
| 12 | Carga e incrustación de subtítulos SRT | ✅ ffprobe: pista `mov_text`, `language=spa` en el MP4 |
| 13 | Carga del motor reconstruyendo los 4 fragmentos | ✅ 4 peticiones `part01…part04` HTTP 200 + verificación SHA-256 + «Motor listo» |
| 14 | Consola del navegador sin errores | ✅ 0 errores de página |
| 15 | Sin rutas rotas / CORS / descargas externas | ✅ solo `localhost` (app) + `data:` URIs; nada externo |
| + | Despliegue en subruta (`base: './'`) | ✅ conversión completa funcionando bajo `/app/` |
| + | Editor de Audio (recorte 1 s→3 s con micro-fundidos) | ✅ salida exacta de 2.000 s |

## 6. Confirmaciones exigidas

- ✅ **`dist/index.html` existe** (generado por `npm run build`).
- ✅ **Ningún archivo de `dist/` supera los 25 MiB** (el mayor pesa 7.66 MiB).
- ✅ La aplicación conserva todas sus funciones y corre sin Next.js.

## 7. Instrucciones exactas para desplegar en Cloudflare Pages

1. Sube el contenido de este ZIP a un repositorio de GitHub
   (`.gitignore` excluye `node_modules/` y `dist/`).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Selecciona el repositorio y configura:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
   - Variables de entorno: `NODE_VERSION` = `20` (o `22`)
4. **Save and Deploy** → la app queda en `https://<tu-proyecto>.pages.dev`.

Alternativa sin Git: arrastra el contenido de `dist/` a *Pages → Upload assets*
(ningún archivo supera 10 MiB).

## 8. Cómo usar el proyecto

```bash
npm install       # dependencias
npm run dev       # desarrollo
npm run build     # producción → dist/
npm run preview   # comprobar la compilación
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run split-wasm  # regenerar fragmentos WASM (solo al actualizar el núcleo)
```

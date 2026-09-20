# Novedades / Descubre — Configuración

## YouTube Data API v3

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea o selecciona un proyecto
3. Habilita "YouTube Data API v3" (APIs & Services → Library)
4. Crea una API key (APIs & Services → Credentials → Create credentials → API key)
5. **No la pongas en la app** — se guarda como secret en el Worker

## Desplegar el Cloudflare Worker

1. Ve a [Cloudflare Workers](https://workers.cloudflare.com/)
2. Crea un nuevo Worker llamado `music-discovery`
3. Copia el contenido de `worker/music-discovery-worker.js` al editor
4. En Settings → Variables → Secrets, añade:
   - Nombre: `YOUTUBE_API_KEY`
   - Valor: tu API key de YouTube
5. Despliega el Worker
6. Copia la URL pública (ej: `https://music-discovery.tu-subdominio.workers.dev`)

## Configurar la URL en la app

En la app, ve a ⋯ → Novedades → Configurar Worker
Pega la URL del Worker (sin la barra final).

Alternativamente, desde la consola del navegador:
```js
window.MP_DISCOVERY.setWorkerUrl('https://music-discovery.tu-subdominio.workers.dev');
```

## Sin Worker (modo fallback)

Si no configuras el Worker, la sección Novedades mostrará:
"Novedades temporalmente no disponibles."
con un botón "Explorar en YouTube" que abre una búsqueda directa.

## Cuotas de YouTube API

- `search.list`: 100 llamadas/día (cuota por defecto)
- `videos.list`: 1 unidad por llamada
- El Worker cachéa resultados 6 horas → ~4 llamadas/día por género
- Con 13 géneros: ~52 llamadas/día (dentro del límite)

## Cambiar categorías

Edita `DISCOVERY_GENRES` en `discovery.js` y en `worker/music-discovery-worker.js`.

## Ajustar TTL de caché

- Cliente: `CACHE_TTL` en `discovery.js` (default: 6 horas)
- Worker: `CACHE_TTL` en `music-discovery-worker.js` (default: 6 horas)

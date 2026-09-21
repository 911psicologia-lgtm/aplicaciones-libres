/**
 * Audio y Video Super Converter — proxy propio de enlaces (opcional).
 *
 * CÓMO ACTIVARLO (una sola vez, sin instalar nada):
 *   • Cloudflare Pages:  Configuración del proyecto → Functions →
 *     «_worker.js» (modo avanzado) → activar. Luego vuelve a subir el dist
 *     (o ya subido: el archivo se detecta solo).
 *   • Workers (activos estáticos):  Configuración → «Add _worker.js» → on.
 *
 * QUÉ RESUELVE:
 *   1. CORS: las peticiones salen del mismo origen, ningún servidor de
 *      descarga puede bloquearlas por cabeceras.
 *   2. IP de salida: si la IP del visitante está limitada por una instancia,
 *      la petición reintenta desde Cloudflare (otra red).
 *   3. Túneles sin TLS (http://) que el navegador bloquearía por contenido
 *      mixto: se sirven cifrados a través de este proxy.
 *
 * SEGURIDAD: lista blanca de dominios de descarga conocidos (el proxy no es
 * abierto). Todo lo demás sirve los archivos estáticos de la app.
 */

const ALLOWLIST = [
  'otomir23.me',
  'nichind.dev',
  'kwiatekmiki.com',
  'meowing.de',
  'canine.tools',
  'cobalt.tools',
  'imput.net',
  'oak.li',
  'piped.private.coffee',
  'proxy.piped.private.coffee',
  'kavin.rocks',
  'odycdn.com',
  'odysee.com',
  'lbryplayer.xyz',
]

const HOP_HEADERS = [
  'content-type',
  'content-length',
  'content-disposition',
  'content-range',
  'accept-ranges',
  'estimated-content-length',
]

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type,authorization',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    },
  })
}

function hostAllowed(hostname, port, protocol) {
  const h = String(hostname || '').toLowerCase()
  if (ALLOWLIST.some((suf) => h === suf || h.endsWith('.' + suf))) return true
  // Túneles sin TLS de nichind: http://<ip>:<puerto>
  if (protocol === 'http:' && /^\d{1,3}(\.\d{1,3}){3}$/.test(h) && port) return true
  return false
}

async function handleCobalt(request, url) {
  if (request.method === 'OPTIONS') return json({ ok: true }, 204)
  if (request.method !== 'POST') return json({ error: 'method' }, 405)
  let target
  try {
    const host = url.searchParams.get('host') || ''
    target = new URL(host.endsWith('/') ? host : host + '/')
    if (target.protocol !== 'https:') return json({ error: 'protocol' }, 400)
  } catch {
    return json({ error: 'bad_host' }, 400)
  }
  if (!hostAllowed(target.hostname, target.port, target.protocol)) {
    return json({ error: 'host_not_allowed' }, 403)
  }
  const headers = new Headers({ 'content-type': 'application/json', accept: 'application/json' })
  const auth = request.headers.get('authorization')
  if (auth) headers.set('authorization', auth)
  let upstream
  try {
    upstream = await fetch(target.toString(), {
      method: 'POST',
      headers,
      body: await request.text(),
      // cf: { cacheTtl: 0 } — las URLs firmadas no se cachean
    })
  } catch (e) {
    return json({ error: 'upstream_unreachable', detail: String(e && e.message) }, 502)
  }
  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
  })
}

async function handleStream(request, url) {
  const raw = url.searchParams.get('u') || ''
  let target
  try {
    target = new URL(raw)
  } catch {
    return json({ error: 'bad_url' }, 400)
  }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') return json({ error: 'protocol' }, 400)
  if (!hostAllowed(target.hostname, target.port, target.protocol)) {
    return json({ error: 'host_not_allowed' }, 403)
  }
  const headers = new Headers()
  const range = request.headers.get('range')
  if (range) headers.set('range', range)
  let upstream
  try {
    upstream = await fetch(target.toString(), { headers, redirect: 'follow' })
  } catch (e) {
    return json({ error: 'upstream_unreachable', detail: String(e && e.message) }, 502)
  }
  const out = new Headers({ 'cache-control': 'no-store', 'access-control-allow-origin': '*' })
  for (const h of HOP_HEADERS) {
    const v = upstream.headers.get(h)
    if (v) out.set(h, v)
  }
  if (!out.has('content-disposition')) {
    const name = (url.searchParams.get('name') || 'descarga').replace(/[^\w.\- ()]+/g, '_')
    out.set('content-disposition', `attachment; filename="${name}"`)
  }
  return new Response(upstream.body, { status: upstream.status, headers: out })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname.endsWith('/api/link/health')) {
      return json({ ok: true, via: 'worker' })
    }
    if (url.pathname.endsWith('/api/link/cobalt')) {
      return handleCobalt(request, url)
    }
    if (url.pathname.endsWith('/api/link/stream')) {
      return handleStream(request, url)
    }
    // Cualquier otra ruta: archivos estáticos de la aplicación (SPA)
    try {
      const asset = await env.ASSETS.fetch(request)
      if (asset.status !== 404) return asset
      // Respaldo SPA: sirve el index para rutas desconocidas sin extensión
      const accept = request.headers.get('accept') || ''
      if (accept.includes('text/html')) {
        const indexUrl = new URL(request.url)
        indexUrl.pathname = url.pathname.replace(/\/[^/]*$/, '/') + 'index.html'
        const idx = await env.ASSETS.fetch(new Request(indexUrl, { headers: request.headers }))
        if (idx.status !== 404) return idx
      }
      return asset
    } catch {
      return json({ error: 'assets_unavailable' }, 500)
    }
  },
}

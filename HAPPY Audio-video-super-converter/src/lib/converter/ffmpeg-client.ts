// Cliente del motor FFmpeg.wasm — carga UMD local, fragmentos WASM, progreso y cancelación
// Los archivos viven en /public/ffmpeg → todo se procesa en el navegador, sin servidores.
//
// ⚠ Cloudflare Pages limita cada archivo a 25 MiB y el binario ffmpeg-core.wasm pesa
// ~32 MB. Por eso el binario se sirve dividido en 4 fragmentos numerados y ordenados
// (ffmpeg-core.wasm.part01…part04, cada uno < 10 MiB):
//   1. Se descargan SECUENCIALMENTE los cuatro fragmentos desde la propia app.
//   2. Se informa el progreso CONJUNTO de la descarga (0–100 %).
//   3. Se reconstruye el binario completo en memoria con un único Uint8Array.
//   4. Se crea un Blob con tipo "application/wasm".
//   5. Se genera una URL local con URL.createObjectURL().
//   6. Se entrega esa URL a ff.load() como wasmURL.
//   7. Se libera la URL cuando ya no es necesaria (tras cargar el motor).
//   8. Fragmentos faltantes o dañados → mensaje comprensible para el usuario.
//   9. Se verifica tamaño exacto y SHA-256 del binario reconstruido.
//  10. El WASM completo de 32 MB nunca llega a dist/.

type AnyFFmpeg = {
  on: (event: string, cb: (data: unknown) => void) => void
  load: (opts: { coreURL: string; wasmURL: string }) => Promise<void>
  exec: (args: string[]) => Promise<number>
  writeFile: (name: string, data: Uint8Array) => Promise<void>
  readFile: (name: string) => Promise<Uint8Array | string>
  deleteFile: (name: string) => Promise<void>
  terminate: () => void
}

/* ------------------------------------------------------------------ */
/*  Metadatos de los fragmentos del núcleo (generados por split-wasm)  */
/* ------------------------------------------------------------------ */

const BASE = import.meta.env.BASE_URL // './' — compatible con subrutas de Cloudflare Pages

/** Fragmentos del binario, en orden estricto. size = bytes esperados de cada uno. */
const WASM_PARTS: Array<{ url: string; size: number }> = [
  { url: `${BASE}ffmpeg/ffmpeg-core.wasm.part01`, size: 8032279 },
  { url: `${BASE}ffmpeg/ffmpeg-core.wasm.part02`, size: 8032279 },
  { url: `${BASE}ffmpeg/ffmpeg-core.wasm.part03`, size: 8032278 },
  { url: `${BASE}ffmpeg/ffmpeg-core.wasm.part04`, size: 8032278 },
]

/** Tamaño exacto del binario original (ffmpeg-core.wasm). */
const WASM_TOTAL_SIZE = 32129114

/** SHA-256 del binario original — garantiza contenido íntegro tras reconstruir. */
const WASM_SHA256 = '2390efa7fb66e7e42dbae15427571a5ffc96b829480904c30f471f0a78967f61'

/* ------------------------------------------------------------------ */
/*  Carga del script UMD del motor                                     */
/* ------------------------------------------------------------------ */

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.dataset.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('No se pudo cargar el motor de conversión local'))
    document.head.appendChild(s)
  })
}

/* ------------------------------------------------------------------ */
/*  Descargas                                                          */
/* ------------------------------------------------------------------ */

async function fetchAsBlobURL(url: string, onProgress?: (fraction: number) => void): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo descargar el motor (${res.status})`)
  const total = Number(res.headers.get('Content-Length') || 0)
  if (!res.body || !total) {
    const buf = await res.arrayBuffer()
    onProgress?.(1)
    return URL.createObjectURL(new Blob([buf]))
  }
  const reader = res.body.getReader()
  const chunks: BlobPart[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value.slice().buffer as ArrayBuffer)
      received += value.length
      onProgress?.(received / total)
    }
  }
  return URL.createObjectURL(new Blob(chunks))
}

/** Descarga un fragmento binario completo con verificación de tamaño. */
async function fetchPart(
  part: { url: string; size: number },
  index: number,
  onProgress?: (fraction: number) => void
): Promise<Uint8Array> {
  const nombre = `ffmpeg-core.wasm.part${String(index + 1).padStart(2, '0')}`
  let res: Response
  try {
    res = await fetch(part.url)
  } catch {
    throw new Error(
      `No se pudo descargar el fragmento ${nombre} del motor local. Comprueba tu conexión e inténtalo de nuevo.`
    )
  }
  if (!res.ok) {
    const pista =
      res.status === 404
        ? `Falta el fragmento ${nombre} en el despliegue (HTTP 404). Vuelve a desplegar la aplicación completa.`
        : `El servidor respondió ${res.status} al pedir ${nombre}.`
    throw new Error(pista)
  }

  const total = Number(res.headers.get('Content-Length') || 0)
  const chunks: Uint8Array[] = []
  let received = 0

  if (res.body && total) {
    const reader = res.body.getReader()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        received += value.length
        onProgress?.(Math.min(1, received / total))
      }
    }
  } else {
    const buf = await res.arrayBuffer()
    chunks.push(new Uint8Array(buf))
    received = buf.byteLength
    onProgress?.(1)
  }

  // Verificación del fragmento: detecta descargas truncadas o dañadas
  const data = new Uint8Array(received)
  let off = 0
  for (const c of chunks) {
    data.set(c, off)
    off += c.length
  }
  if (data.length !== part.size) {
    throw new Error(
      `El fragmento ${nombre} está dañado o incompleto (esperados ${part.size.toLocaleString('es')} bytes, recibidos ${data.length.toLocaleString('es')}). Recarga la página o vuelve a desplegar la aplicación.`
    )
  }
  return data
}

/** SHA-256 (hex) si el entorno lo permite; null en contextos no seguros. */
async function sha256Hex(data: Uint8Array): Promise<string | null> {
  if (globalThis.crypto?.subtle == null) return null
  try {
    const copy = new Uint8Array(data) // copia propia para el buffer del digest
    const digest = await crypto.subtle.digest('SHA-256', copy)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Motor                                                              */
/* ------------------------------------------------------------------ */

interface LoadHooks {
  onEngineProgress?: (fraction: number) => void
}

class FFmpegEngine {
  private ff: AnyFFmpeg | null = null
  private loadPromise: Promise<AnyFFmpeg> | null = null
  private fileProgressCb: ((p: number) => void) | null = null
  private logCb: ((msg: string) => void) | null = null

  get ready(): boolean {
    return this.ff != null
  }

  setLogCb(cb: ((msg: string) => void) | null) {
    this.logCb = cb
  }

  async load(hooks: LoadHooks = {}): Promise<void> {
    if (this.ff) return
    if (!this.loadPromise) {
      this.loadPromise = this.doLoad(hooks).catch((err) => {
        this.loadPromise = null
        throw err
      })
    }
    await this.loadPromise
  }

  private async doLoad(hooks: LoadHooks): Promise<AnyFFmpeg> {
    if (typeof window === 'undefined') throw new Error('El motor solo funciona en el navegador')
    const w = window as unknown as { FFmpegWASM?: { FFmpeg: new () => AnyFFmpeg } }

    if (!w.FFmpegWASM) await loadScript(`${BASE}ffmpeg/ffmpeg.js`)
    if (!w.FFmpegWASM) throw new Error('El motor de conversión no está disponible')

    const ff = new w.FFmpegWASM.FFmpeg()
    ff.on('log', (data) => {
      const msg = (data as { message?: string })?.message ?? ''
      if (msg) this.logCb?.(msg)
    })
    ff.on('progress', (data) => {
      const p = (data as { progress?: number })?.progress ?? 0
      if (Number.isFinite(p)) this.fileProgressCb?.(Math.min(1, Math.max(0, p)))
    })

    const onEngineProgress = hooks.onEngineProgress
    // núcleo JS (~1%) y luego binario WASM reconstruido (~32 MB en 4 fragmentos)
    onEngineProgress?.(0.01)
    const coreURL = await fetchAsBlobURL(`${BASE}ffmpeg/ffmpeg-core.js`)
    onEngineProgress?.(0.02)

    // 1) Descarga secuencial de los cuatro fragmentos + progreso conjunto
    const parts: Uint8Array[] = []
    for (let i = 0; i < WASM_PARTS.length; i++) {
      const data = await fetchPart(WASM_PARTS[i], i, (f) =>
        onEngineProgress?.(0.02 + ((i + f) / WASM_PARTS.length) * 0.96)
      )
      parts.push(data)
    }

    // 2) Reconstrucción del binario completo en memoria
    const total = parts.reduce((n, p) => n + p.length, 0)
    const wasmBytes = new Uint8Array(total)
    let offset = 0
    for (const p of parts) {
      wasmBytes.set(p, offset)
      offset += p.length
    }

    // 3) Verificación: tamaño exacto y SHA-256 del original
    if (wasmBytes.length !== WASM_TOTAL_SIZE) {
      throw new Error(
        `El motor reconstruido no tiene el tamaño correcto (esperados ${WASM_TOTAL_SIZE.toLocaleString('es')} bytes, obtenidos ${wasmBytes.length.toLocaleString('es')}). Algunos fragmentos pueden faltar o estar dañados; recarga la página o vuelve a desplegar la aplicación.`
      )
    }
    const hash = await sha256Hex(wasmBytes)
    if (hash != null && hash !== WASM_SHA256) {
      throw new Error(
        'La verificación de integridad del motor falló (fragmentos dañados o desactualizados). Recarga la página o vuelve a desplegar la aplicación.'
      )
    }

    // 4) Blob application/wasm + URL local
    const wasmBlob = new Blob([wasmBytes], { type: 'application/wasm' })
    const wasmURL = URL.createObjectURL(wasmBlob)

    // 5) Carga del motor con la URL reconstruida y liberación posterior
    try {
      await ff.load({ coreURL, wasmURL })
    } finally {
      URL.revokeObjectURL(wasmURL)
      URL.revokeObjectURL(coreURL)
    }

    onEngineProgress?.(1)
    this.ff = ff
    return ff
  }

  async writeFile(name: string, data: Uint8Array): Promise<void> {
    if (!this.ff) throw new Error('El motor no está listo')
    await this.ff.writeFile(name, data)
  }

  async run(args: string[], onProgress?: (p: number) => void): Promise<void> {
    if (!this.ff) throw new Error('El motor no está listo')
    this.fileProgressCb = onProgress ?? null
    await this.ff.exec(args)
    this.fileProgressCb = null
  }

  async readFile(name: string): Promise<Uint8Array> {
    if (!this.ff) throw new Error('El motor no está listo')
    const data = await this.ff.readFile(name)
    if (typeof data === 'string') throw new Error('Salida inesperada del motor')
    return data
  }

  async removeFile(name: string): Promise<void> {
    try {
      await this.ff?.deleteFile(name)
    } catch {
      /* ignora */
    }
  }

  cancel(): void {
    try {
      this.ff?.terminate()
    } catch {
      /* ignora */
    }
    this.ff = null
    this.loadPromise = null
    this.fileProgressCb = null
  }
}

export const engine = new FFmpegEngine()

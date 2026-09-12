// Utilidades multimedia: detección de tipo, nombres, formatos legibles
import type { MediaKind } from '@/types/converter'

export const AUDIO_EXTS = [
  'mp3', 'wav', 'ogg', 'opus', 'flac', 'm4a', 'aac', 'wma', 'aiff', 'amr', 'alac',
]

export const VIDEO_EXTS = [
  'mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'mpeg', 'mpg', '3gp', 'ogv', 'm4v', 'ts',
]

export function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function baseOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(0, i) : name
}

export function detectKind(file: File): MediaKind | null {
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type.startsWith('video/')) return 'video'
  const ext = extOf(file.name)
  if (AUDIO_EXTS.includes(ext)) return 'audio'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  return null
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatDuration(s: number | null | undefined): string {
  if (s == null || !Number.isFinite(s) || s < 0) return '—'
  const total = Math.round(s)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = total % 60
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Convierte "1:30", "1:02:03" o "90" en segundos. Devuelve null si es inválido. */
export function parseTimeInput(v: string): number | null {
  const t = v.trim()
  if (t === '') return null
  if (/^\d+([.,]\d+)?$/.test(t)) return Math.max(0, parseFloat(t.replace(',', '.')))
  const m = t.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/)
  if (m) {
    if (m[3] != null) {
      const h = parseInt(m[1], 10)
      const mi = parseInt(m[2], 10)
      const s = parseInt(m[3], 10)
      if (mi >= 60 || s >= 60) return null
      return h * 3600 + mi * 60 + s
    }
    const mi = parseInt(m[1], 10)
    const s = parseInt(m[2], 10)
    if (s >= 60) return null
    return mi * 60 + s
  }
  return null
}

/** Nombre de salida: "cancion.mp3" -> "cancion-convertido.mp3" */
export function outputName(originalBase: string, ext: string, suffix: string, used: Set<string>): string {
  const base = `${originalBase}-${suffix}`
  let candidate = `${base}.${ext}`
  let n = 2
  while (used.has(candidate)) {
    candidate = `${base} (${n}).${ext}`
    n++
  }
  used.add(candidate)
  return candidate
}

export interface ProbeResult {
  duration: number | null
  width: number | null
  height: number | null
}

/** Lee la duración y dimensiones con el navegador (sin FFmpeg). */
export function probeMediaFile(file: File, kind: MediaKind): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement(kind === 'video' ? 'video' : 'audio')
    let done = false
    const finish = (r: ProbeResult) => {
      if (done) return
      done = true
      URL.revokeObjectURL(url)
      resolve(r)
    }
    const timer = setTimeout(() => finish({ duration: null, width: null, height: null }), 8000)
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      clearTimeout(timer)
      const d = Number.isFinite(el.duration) ? el.duration : null
      finish({
        duration: d,
        width: (el as HTMLVideoElement).videoWidth || null,
        height: (el as HTMLVideoElement).videoHeight || null,
      })
    }
    el.onerror = () => {
      clearTimeout(timer)
      finish({ duration: null, width: null, height: null })
    }
    el.src = url
  })
}

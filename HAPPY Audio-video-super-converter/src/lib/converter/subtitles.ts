// Análisis y conversión de subtítulos SRT / VTT — 100% en el navegador
import type { SubtitleCue } from '@/types/converter'

const TIMESTAMP_RE =
  /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})\s*-->\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/

function tsToSec(h: string | undefined, m: string, s: string, ms: string): number {
  const hours = h != null ? parseInt(h, 10) : 0
  const minutes = parseInt(m, 10)
  const seconds = parseInt(s, 10)
  const millis = parseInt(ms.padEnd(3, '0'), 10)
  return hours * 3600 + minutes * 60 + seconds + millis / 1000
}

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0')
}

function fmtSRT(t: number): string {
  const total = Math.round(t * 1000)
  const h = Math.floor(total / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const ms = total % 1000
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(ms, 3)}`
}

function fmtVTT(t: number): string {
  const total = Math.round(t * 1000)
  const h = Math.floor(total / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const ms = total % 1000
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`
}

/** Detecta si el contenido parece SRT o VTT */
export function detectSubtitleFormat(raw: string): 'srt' | 'vtt' | null {
  const head = raw.slice(0, 500).trim()
  if (/^WEBVTT/i.test(head)) return 'vtt'
  if (TIMESTAMP_RE.test(raw)) return 'srt'
  return null
}

/** Parser tolerante: acepta SRT y VTT mezclados */
export function parseSubtitles(raw: string): SubtitleCue[] {
  const clean = raw.replace(/\r/g, '')
  const blocks = clean.split(/\n{2,}/)
  const cues: SubtitleCue[] = []

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim() !== '')
    if (lines.length === 0) continue
    if (/^WEBVTT|^NOTE|^STYLE|^REGION/i.test(lines[0].trim())) continue

    const tsIndex = lines.findIndex((l) => TIMESTAMP_RE.test(l))
    if (tsIndex === -1) continue

    const m = lines[tsIndex].match(TIMESTAMP_RE)
    if (!m) continue

    const text = lines
      .slice(tsIndex + 1)
      .join('\n')
      .replace(/<\/?[^>]+>/g, '') // elimina etiquetas HTML/estilos inline
      .trim()
    if (!text) continue

    cues.push({
      start: tsToSec(m[1], m[2], m[3], m[4]),
      end: tsToSec(m[5], m[6], m[7], m[8]),
      text,
    })
  }

  // Ordena por tiempo y corrige solapes evidentes
  cues.sort((a, b) => a.start - b.start)
  return cues
}

export function toSRT(cues: SubtitleCue[]): string {
  return (
    cues
      .map((c, i) => `${i + 1}\n${fmtSRT(c.start)} --> ${fmtSRT(c.end)}\n${c.text}`)
      .join('\n\n') + '\n'
  )
}

export function toVTT(cues: SubtitleCue[]): string {
  return (
    'WEBVTT\n\n' +
    cues.map((c) => `${fmtVTT(c.start)} --> ${fmtVTT(c.end)}\n${c.text}`).join('\n\n') +
    '\n'
  )
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function subtitleSpan(cues: SubtitleCue[]): number | null {
  if (cues.length === 0) return null
  return Math.max(...cues.map((c) => c.end))
}

// Panel de subtítulos: cargar SRT/VTT, previsualizar e incrustar
import { useEffect, useMemo, useRef, useState } from 'react'
import { Captions, Download, FileUp, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InfoTip, Tip } from './InfoTip'
import type { LoadedSubtitle, MediaFile } from '@/types/converter'
import { formatDuration } from '@/lib/converter/media-utils'
import { detectSubtitleFormat, parseSubtitles, subtitleSpan } from '@/lib/converter/subtitles'
import { downloadText } from '@/lib/converter/subtitles'

function formatDurationSafe(t: number): string {
  const m = Math.floor(t / 60)
  const s = Math.round(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

interface SubtitlePanelProps {
  files: MediaFile[]
  subtitle: LoadedSubtitle | null
  onSubtitle: (s: LoadedSubtitle | null) => void
}

/** Vista previa del video con la pista de subtítulos sincronizada */
function VideoPreview({ video, vttUrl }: { video: MediaFile; vttUrl: string }) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        Vista previa sincronizada
        <InfoTip tip="Así se verán tus subtítulos en el navegador. La pista se incrusta como «soft subs»: puedes activarlos o desactivarlos en tu reproductor final." />
      </p>
      <video controls preload="metadata" src={video.url} className="w-full rounded-xl border border-border bg-black">
        <track kind="subtitles" src={vttUrl} srcLang="es" label="Subtítulos" default />
      </video>
    </div>
  )
}

export function SubtitlePanel({ files, subtitle, onSubtitle }: SubtitlePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Limpia la URL del VTT de vista previa
  const vttUrl = useMemo(() => {
    if (!subtitle || subtitle.cues.length === 0) return null
    const head = 'WEBVTT\n\n'
    const body = subtitle.cues
      .map((c) => `${fmt(c.start)} --> ${fmt(c.end)}\n${c.text}`)
      .join('\n\n')
    return URL.createObjectURL(new Blob([head + body], { type: 'text/vtt' }))
  }, [subtitle])

  useEffect(() => {
    return () => {
      if (vttUrl) URL.revokeObjectURL(vttUrl)
    }
  }, [vttUrl])

  const previewVideo = files.find((f) => f.kind === 'video' && ['mp4', 'webm'].includes(f.ext)) ?? null
  const embeddableVideos = files.filter((f) => f.kind === 'video')

  async function handleSubtitleFile(file: File) {
    setError(null)
    try {
      const raw = await file.text()
      const fmtId = detectSubtitleFormat(raw)
      if (!fmtId) {
        setError('El archivo no parece un subtítulo válido (.srt o .vtt).')
        return
      }
      const cues = parseSubtitles(raw)
      if (cues.length === 0) {
        setError('No se encontraron frases de subtítulo en el archivo.')
        return
      }
      onSubtitle({ name: file.name, size: file.size, cues })
    } catch {
      setError('No se pudo leer el archivo de subtítulos.')
    }
  }

  const baseName = subtitle ? subtitle.name.replace(/\.(srt|vtt)$/i, '') : 'subtitulos'

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Captions className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Archivo de subtítulos
          <InfoTip tip="Compatible con SRT y VTT. También puedes convertir entre formatos y descargar el resultado sin tocar el video." />
        </h3>
        <div className="flex flex-wrap gap-2">
          <Tip tip="Carga un archivo .srt o .vtt desde tu dispositivo.">
            <Button size="sm" className="h-9 gap-1.5 bg-emerald-500 font-semibold text-white hover:bg-emerald-400" onClick={() => inputRef.current?.click()}>
              <FileUp className="h-4 w-4" aria-hidden="true" />
              Cargar SRT / VTT
            </Button>
          </Tip>
          {subtitle && (
            <>
              <Tip tip="Convierte y descarga los subtítulos al formato SRT (SubRip).">
                <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={() => downloadText(`${baseName}.srt`, toSRTNow(subtitle), 'application/x-subrip')}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Descargar SRT
                </Button>
              </Tip>
              <Tip tip="Convierte y descarga los subtítulos al formato VTT (WebVTT), ideal para la web.">
                <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={() => downloadText(`${baseName}.vtt`, toVTTNow(subtitle), 'text/vtt')}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Descargar VTT
                </Button>
              </Tip>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".srt,.vtt,text/plain"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleSubtitleFile(f)
          e.target.value = ''
        }}
      />

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}

      {!subtitle && !error && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/80" aria-hidden="true" />
          <p>
            Carga un archivo <span className="font-mono font-semibold text-emerald-300">.srt</span> o{' '}
            <span className="font-mono font-semibold text-emerald-300">.vtt</span> para verlo aquí, previsualizarlo
            sobre el video e incrustarlo como pista de subtítulos.
          </p>
        </div>
      )}

      {subtitle && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="font-semibold text-emerald-300">{subtitle.name}</Badge>
            <span className="text-muted-foreground">{subtitle.cues.length} frases</span>
            {subtitleSpan(subtitle.cues) != null && (
              <span className="text-muted-foreground">· duración {formatDuration(subtitleSpan(subtitle.cues))}</span>
            )}
          </div>

          <ScrollArea className="max-h-56 rounded-lg border border-border">
            <ul className="divide-y divide-border/60 text-xs">
              {subtitle.cues.slice(0, 200).map((c, i) => (
                <li key={i} className="flex gap-3 px-3 py-1.5">
                  <span className="shrink-0 font-mono text-[10px] leading-5 text-emerald-300/80">
                    {formatDurationSafe(c.start)} → {formatDurationSafe(c.end)}
                  </span>
                  <span className="leading-5 text-foreground/90">{c.text}</span>
                </li>
              ))}
              {subtitle.cues.length > 200 && (
                <li className="px-3 py-1.5 text-center text-[10px] text-muted-foreground">
                  … y {subtitle.cues.length - 200} frases más
                </li>
              )}
            </ul>
          </ScrollArea>

          {previewVideo && vttUrl && <VideoPreview video={previewVideo} vttUrl={vttUrl} />}

          <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-emerald-300">Cómo funciona la incrustación:</span> los subtítulos se
            agregan como pista suave (soft subs) dentro del archivo — se pueden activar o desactivar en cualquier
            reproductor moderno. Compatible con <span className="font-semibold">MP4</span> y{' '}
            <span className="font-semibold">MKV</span>
            {embeddableVideos.some((v) => !['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(v.ext))
              ? '; otros contenedores se convertirán a MP4 automáticamente.'
              : '.'}
          </div>
        </div>
      )}
    </div>
  )
}

// Helpers locales (evitan dependencias circulares de importación)
function fmt(t: number): string {
  const total = Math.round(t * 1000)
  const h = Math.floor(total / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const ms = total % 1000
  const p = (n: number, l: number) => String(n).padStart(l, '0')
  return `${p(h, 2)}:${p(m, 2)}:${p(s, 2)}.${p(ms, 3)}`
}

function toSRTNow(s: LoadedSubtitle): string {
  return s.cues.map((c, i) => `${i + 1}\n${srt(c.start)} --> ${srt(c.end)}\n${c.text}`).join('\n\n') + '\n'
}

function toVTTNow(s: LoadedSubtitle): string {
  return 'WEBVTT\n\n' + s.cues.map((c) => `${fmt(c.start)} --> ${fmt(c.end)}\n${c.text}`).join('\n\n') + '\n'
}

function srt(t: number): string {
  const total = Math.round(t * 1000)
  const h = Math.floor(total / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const ms = total % 1000
  const p = (n: number, l: number) => String(n).padStart(l, '0')
  return `${p(h, 2)}:${p(m, 2)}:${p(s, 2)},${p(ms, 3)}`
}

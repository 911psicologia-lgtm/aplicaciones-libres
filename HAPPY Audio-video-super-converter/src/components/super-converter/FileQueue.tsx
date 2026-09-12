// Cola de archivos cargados con mini-visualización de onda para audio
import { useEffect, useRef } from 'react'
import { FileAudio, FileVideo, MonitorPlay, Ruler, Timer, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tip } from './InfoTip'
import type { MediaFile } from '@/types/converter'
import { formatBytes, formatDuration } from '@/lib/converter/media-utils'

interface FileQueueProps {
  files: MediaFile[]
  onRemove: (id: string) => void
  onClear: () => void
}

/** Dibuja la forma de onda real del audio (decodeAudioData, con límite de tamaño) */
function Waveform({ file }: { file: MediaFile }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    if (file.size > 25 * 1024 * 1024) return

    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx || !canvasRef.current) return

    const ctx = new AudioCtx()
    file.file
      .arrayBuffer()
      .then((buf) => ctx.decodeAudioData(buf))
      .then((audio) => {
        if (cancelled || !canvasRef.current) return
        const canvas = canvasRef.current
        const dpr = window.devicePixelRatio || 1
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        canvas.width = w * dpr
        canvas.height = h * dpr
        const g = canvas.getContext('2d')
        if (!g) return
        g.scale(dpr, dpr)

        const data = audio.getChannelData(0)
        const bars = Math.max(24, Math.floor(w / 4))
        const step = Math.floor(data.length / bars) || 1
        const grad = g.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, '#34d399')
        grad.addColorStop(1, '#0d9488')
        g.fillStyle = grad
        for (let i = 0; i < bars; i++) {
          let peak = 0
          const startIdx = i * step
          for (let j = 0; j < step; j += 16) {
            const v = Math.abs(data[startIdx + j] ?? 0)
            if (v > peak) peak = v
          }
          const barH = Math.max(2, peak * (h - 4))
          const x = i * (w / bars)
          g.fillRect(x, (h - barH) / 2, Math.max(1.5, w / bars - 1.5), barH)
        }
        ctx.close().catch(() => {})
      })
      .catch(() => {
        ctx.close().catch(() => {})
      })

    return () => {
      cancelled = true
      ctx.close().catch(() => {})
    }
  }, [file])

  return (
    <canvas
      ref={canvasRef}
      className="h-10 w-full rounded-md bg-muted/40 sm:h-12"
      aria-hidden="true"
    />
  )
}

export function FileQueue({ files, onRemove, onClear }: FileQueueProps) {
  if (files.length === 0) return null
  return (
    <section aria-label="Archivos cargados" className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          Archivos en cola
          <Badge variant="secondary" className="font-mono">{files.length}</Badge>
        </h2>
        <Tip tip="Quita todos los archivos de la cola sin borrar tus resultados ya generados.">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={onClear}>
            Vaciar cola
          </Button>
        </Tip>
      </div>

      <ul className="space-y-2">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-emerald-400/40"
          >
            <div
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                f.kind === 'video'
                  ? 'bg-amber-400/15 text-amber-300'
                  : 'bg-emerald-400/15 text-emerald-300',
              ].join(' ')}
            >
              {f.kind === 'video' ? (
                <FileVideo className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FileAudio className="h-5 w-5" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium" title={f.name}>
                  {f.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono font-semibold uppercase text-emerald-300/90">{f.ext}</span>
                <span className="inline-flex items-center gap-1">
                  <Ruler className="h-3 w-3" aria-hidden="true" /> {formatBytes(f.size)}
                </span>
                {f.duration != null && (
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-3 w-3" aria-hidden="true" /> {formatDuration(f.duration)}
                  </span>
                )}
                {f.kind === 'video' && f.width != null && (
                  <span className="inline-flex items-center gap-1">
                    <MonitorPlay className="h-3 w-3" aria-hidden="true" /> {f.width}×{f.height}
                  </span>
                )}
              </div>
              {f.kind === 'audio' && <Waveform file={f} />}
            </div>

            <Tip tip={`Quitar ${f.name} de la cola`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(f.id)}
                aria-label={`Quitar ${f.name}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tip>
          </li>
        ))}
      </ul>
    </section>
  )
}

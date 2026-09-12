// Panel de conversión: selección de formato y calidad
import { AudioLines, Gauge, Video } from 'lucide-react'
import { InfoTip, Tip } from './InfoTip'
import { cn } from '@/lib/utils'
import { AUDIO_FORMATS, QUALITY_PRESETS, VIDEO_FORMATS, type FormatDef } from '@/lib/converter/formats'
import type { MediaFile, QualityId } from '@/types/converter'

interface ConvertPanelProps {
  files: MediaFile[]
  format: FormatDef | null
  onFormat: (f: FormatDef) => void
  quality: QualityId
  onQuality: (q: QualityId) => void
}

function FormatButton({ f, active, onClick }: { f: FormatDef; active: boolean; onClick: () => void }) {
  return (
    <Tip tip={f.description} side="top">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          'flex w-full flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active
            ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-[0_0_16px_-6px] shadow-emerald-400/60'
            : 'border-border bg-card text-muted-foreground hover:border-emerald-400/40 hover:text-foreground'
        )}
      >
        <span className="text-xs font-bold tracking-wide">{f.label}</span>
        <span className="font-mono text-[10px] opacity-70">.{f.ext}</span>
      </button>
    </Tip>
  )
}

export function ConvertPanel({ files, format, onFormat, quality, onQuality }: ConvertPanelProps) {
  const hasVideo = files.some((f) => f.kind === 'video')

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card/60 p-4 sm:p-5">
      {/* Formato */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          {format?.kind === 'audio' ? (
            <AudioLines className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          ) : (
            <Video className="h-4 w-4 text-amber-300" aria-hidden="true" />
          )}
          Formato de salida
          <InfoTip tip="Elige el formato al que quieres convertir. Pasa el cursor sobre cada botón para ver para qué sirve cada formato." />
        </h3>

        {hasVideo && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Video
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {VIDEO_FORMATS.map((f) => (
                <FormatButton key={f.id} f={f} active={format?.id === f.id} onClick={() => onFormat(f)} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {hasVideo ? 'Audio (también extrae la pista de un video)' : 'Audio'}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {AUDIO_FORMATS.map((f) => (
              <FormatButton key={f.id} f={f} active={format?.id === f.id} onClick={() => onFormat(f)} />
            ))}
          </div>
        </div>
      </div>

      {/* Calidad */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Gauge className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Calidad
          <InfoTip tip="La calidad afecta el tamaño del archivo final. La opción Media es la recomendada para la mayoría de los casos." />
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Calidad de salida">
          {(Object.keys(QUALITY_PRESETS) as QualityId[]).map((q) => {
            const p = QUALITY_PRESETS[q]
            const active = quality === q
            return (
              <Tip key={q} tip={p.description} side="top">
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onQuality(q)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'border-emerald-400 bg-emerald-400/15'
                      : 'border-border bg-card hover:border-emerald-400/40'
                  )}
                >
                  <span className="text-sm font-semibold">{p.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {q === 'alta' ? '320 kbps' : q === 'media' ? '192 kbps' : '128 kbps'}
                  </span>
                </button>
              </Tip>
            )
          })}
        </div>
      </div>
    </div>
  )
}

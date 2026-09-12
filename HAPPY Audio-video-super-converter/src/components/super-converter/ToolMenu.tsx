// Menú principal de herramientas — 4 botones grandes e intuitivos
import { ArrowLeftRight, Captions, SlidersHorizontal, Tags } from 'lucide-react'
import { Tip } from './InfoTip'
import { cn } from '@/lib/utils'
import type { ToolId } from '@/types/converter'

interface ToolMenuProps {
  value: ToolId
  onChange: (t: ToolId) => void
  hasFiles: boolean
}

const TOOLS: Array<{
  id: ToolId
  label: string
  description: string
  tip: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: 'convert',
    label: 'Convertir',
    description: 'Cambia el formato y la calidad',
    tip: 'Convierte entre MP3, WAV, OGG, FLAC, M4A, MP4, MKV, WEBM, AVI, MOV y más. También extrae el audio de cualquier video.',
    icon: ArrowLeftRight,
  },
  {
    id: 'subtitles',
    label: 'Subtítulos',
    description: 'Incrusta pistas SRT / VTT',
    tip: 'Carga un archivo .srt o .vtt, previsualízalo sincronizado e incrustalo como pista de subtítulos en tu video (MP4 o MKV).',
    icon: Captions,
  },
  {
    id: 'metadata',
    label: 'Metadatos',
    description: 'Información, efectos y recorte',
    tip: 'Edita la información del archivo (título, artista, álbum, género, año) y agrega efectos: volumen, fundidos, velocidad y recorte.',
    icon: Tags,
  },
  {
    id: 'audioeditor',
    label: 'Editor de Audio',
    description: 'Recorta, karaoke, mejora y fundidos',
    tip: 'Edita tus audios: recorta fragmentos con la onda interactiva, elimina la voz de las canciones (modo karaoke), mejora la calidad (normaliza, reduce ruido, ecualiza) y aplica fundidos suaves para que los cortes no suenen bruscos.',
    icon: SlidersHorizontal,
  },
]

export function ToolMenu({ value, onChange, hasFiles }: ToolMenuProps) {
  return (
    <nav aria-label="Herramientas" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TOOLS.map((t) => {
        const active = value === t.id
        const Icon = t.icon
        return (
          <Tip key={t.id} tip={t.tip} side="bottom">
            <button
              type="button"
              onClick={() => onChange(t.id)}
              aria-pressed={active}
              disabled={!hasFiles}
              className={cn(
                'flex h-full w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                active
                  ? 'border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_24px_-8px] shadow-emerald-400/50'
                  : 'border-border bg-card hover:border-emerald-400/40 hover:bg-accent'
              )}
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
                  active ? 'bg-emerald-400 text-zinc-950' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold sm:text-base">{t.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{t.description}</span>
              </span>
            </button>
          </Tip>
        )
      })}
    </nav>
  )
}

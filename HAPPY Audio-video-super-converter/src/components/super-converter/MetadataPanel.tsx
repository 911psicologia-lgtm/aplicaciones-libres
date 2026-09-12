// Panel de metadatos: información del archivo + efectos de edición
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InfoTip, Tip } from './InfoTip'
import { EffectsSection } from './EffectsSection'
import type { EffectsOptions, MediaFile, MetadataOptions } from '@/types/converter'

interface MetadataPanelProps {
  files: MediaFile[]
  metadata: MetadataOptions
  onMetadata: (m: MetadataOptions) => void
  effects: EffectsOptions
  onEffects: (e: EffectsOptions) => void
}

const FIELDS: Array<{ key: keyof MetadataOptions; label: string; tip: string; placeholder: string }> = [
  { key: 'title', label: 'Título', tip: 'Nombre de la canción o del video que verán los reproductores.', placeholder: 'Ej. Mi gran producción' },
  { key: 'artist', label: 'Artista / Autor', tip: 'Autor o intérprete principal. En MP3 se guarda como artista del álbum.', placeholder: 'Ej. Super Banda' },
  { key: 'album', label: 'Álbum', tip: 'Álbum o colección a la que pertenece el audio.', placeholder: 'Ej. Sesiones 2026' },
  { key: 'genre', label: 'Género', tip: 'Estilo musical o categoría del contenido.', placeholder: 'Ej. Rock' },
  { key: 'year', label: 'Año', tip: 'Año de publicación. Se guarda como etiqueta de fecha.', placeholder: 'Ej. 2026' },
  { key: 'comment', label: 'Comentario', tip: 'Nota libre que viaja dentro del archivo (copyright, créditos, etc.).', placeholder: 'Ej. Grabado en casa' },
]

export function MetadataPanel({ files, metadata, onMetadata, effects, onEffects }: MetadataPanelProps) {
  const referenceDuration = files[0]?.duration ?? null

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          Información del archivo
          <InfoTip tip="Estos datos se escriben dentro del propio archivo (etiquetas ID3 en audio, metadata en video). Los reproductores y aplicaciones de música los mostrarán." />
        </h3>
        <Tip tip="Borra todos los campos de información a la vez.">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() => onMetadata({ title: '', artist: '', album: '', genre: '', year: '', comment: '' })}
          >
            <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
            Limpiar campos
          </Button>
        </Tip>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`meta-${f.key}`} className="text-xs font-semibold">
              {f.label}
            </Label>
            <Input
              id={`meta-${f.key}`}
              value={metadata[f.key]}
              onChange={(e) => onMetadata({ ...metadata, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-10 bg-background/60"
            />
            <p className="text-[10px] leading-tight text-muted-foreground">{f.tip}</p>
          </div>
        ))}
      </div>

      <EffectsSection value={effects} onChange={onEffects} referenceDuration={referenceDuration} />
    </div>
  )
}

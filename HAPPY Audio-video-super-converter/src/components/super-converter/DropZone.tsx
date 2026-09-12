// Zona de carga con arrastrar y soltar + selección de archivos
import { useCallback, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tip } from './InfoTip'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

const FORMAT_CHIPS = ['MP3', 'MP4', 'WAV', 'MKV', 'OGG', 'MOV', 'FLAC', 'WEBM', 'M4A', 'AVI', 'OPUS', 'GIF']

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return
      onFiles(Array.from(list))
    },
    [onFiles]
  )

  return (
    <section aria-label="Cargar archivos">
      <Tip
        side="bottom"
        wrap
        tip="Puedes arrastrar uno o varios archivos a la vez. Todo se procesa en tu dispositivo: nunca se sube nada a internet."
      >
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label="Zona para arrastrar archivos de audio o video, o presionar Enter para elegir archivos"
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (!disabled) handleFiles(e.dataTransfer.files)
          }}
          className={[
            'group flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 sm:py-14',
            dragOver
              ? 'border-emerald-400 bg-emerald-400/10 shadow-[0_0_40px_-10px] shadow-emerald-400/40'
              : 'border-border bg-card/50 hover:border-emerald-400/60 hover:bg-card',
            disabled ? 'pointer-events-none opacity-50' : '',
          ].join(' ')}
        >
          <div
            className={[
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 transition-transform duration-200',
              dragOver ? 'scale-110' : 'group-hover:scale-105',
            ].join(' ')}
          >
            <UploadCloud className="h-8 w-8 text-emerald-300" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold sm:text-lg">
              {dragOver ? '¡Suelta tus archivos aquí!' : 'Arrastra tus archivos de audio o video'}
            </p>
            <p className="text-sm text-muted-foreground">o elige manualmente desde tu dispositivo</p>
          </div>
          <Button
            type="button"
            size="lg"
            tabIndex={-1}
            className="pointer-events-none h-11 bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/20"
          >
            Elegir archivos
          </Button>
          <div className="flex max-w-md flex-wrap items-center justify-center gap-1.5" aria-hidden="true">
            {FORMAT_CHIPS.map((f) => (
              <span
                key={f}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </Tip>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*,.mkv,.avi,.mov,.flv,.wmv,.m4a,.aac,.ogg,.opus,.flac,.wma,.ts,.m4v,.3gp"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </section>
  )
}

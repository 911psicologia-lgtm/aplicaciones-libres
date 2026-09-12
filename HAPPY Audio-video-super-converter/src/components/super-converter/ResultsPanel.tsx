// Resultados: tarjetas por archivo con descarga y comparación de tamaño
import { Download, FileAudio, FileVideo, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tip } from './InfoTip'
import type { ResultFile } from '@/types/converter'
import { formatBytes } from '@/lib/converter/media-utils'

interface ResultsPanelProps {
  results: ResultFile[]
  onClear: () => void
}

export function ResultsPanel({ results, onClear }: ResultsPanelProps) {
  const ok = results.filter((r) => !r.error)
  if (results.length === 0) return null

  return (
    <section aria-label="Resultados" className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          Resultados
          <Badge className="bg-emerald-400 font-bold text-zinc-950">{ok.length}</Badge>
        </h2>
        <Tip tip="Descarta esta lista de resultados (los archivos descargados ya están en tu dispositivo).">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={onClear}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Limpiar
          </Button>
        </Tip>
      </div>

      <ul className="space-y-2">
        {results.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 sm:flex-nowrap"
          >
            <div
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                r.error ? 'bg-destructive/15 text-red-300' : r.kind === 'video' ? 'bg-amber-400/15 text-amber-300' : 'bg-emerald-400/15 text-emerald-300',
              ].join(' ')}
            >
              {r.kind === 'video' ? (
                <FileVideo className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FileAudio className="h-5 w-5" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={r.outputName}>
                {r.outputName}
              </p>
              {r.error ? (
                <p className="text-xs text-red-300">{r.error}</p>
              ) : (
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {formatBytes(r.originalSize)}
                    <span aria-hidden="true">→</span>
                    <span className="font-semibold text-foreground">{formatBytes(r.size)}</span>
                  </span>
                  {r.originalSize > 0 && r.size !== r.originalSize && (
                    <Badge
                      variant="secondary"
                      className={
                        r.size < r.originalSize
                          ? 'gap-1 bg-emerald-400/15 text-emerald-300'
                          : 'gap-1 bg-amber-400/15 text-amber-300'
                      }
                    >
                      {r.size < r.originalSize ? (
                        <TrendingDown className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      )}
                      {r.size < r.originalSize ? '−' : '+'}
                      {Math.abs(Math.round(((r.size - r.originalSize) / r.originalSize) * 100))}%
                    </Badge>
                  )}
                </p>
              )}
            </div>

            {!r.error && (
              <Tip tip="Guardar el archivo procesado en tu dispositivo.">
                <Button
                  size="sm"
                  className="h-10 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 font-semibold text-white shadow-md shadow-emerald-500/20 hover:brightness-110"
                  asChild
                >
                  <a href={r.url} download={r.outputName} aria-label={`Descargar ${r.outputName}`}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Descargar
                  </a>
                </Button>
              </Tip>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

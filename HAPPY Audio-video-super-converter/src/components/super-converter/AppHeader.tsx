// Encabezado con estado del motor local
import { AudioLines, ShieldCheck } from 'lucide-react'
import { Tip } from './InfoTip'

interface AppHeaderProps {
  engineState: 'idle' | 'loading' | 'ready'
  engineProgress: number
}

export function AppHeader({ engineState, engineProgress }: AppHeaderProps) {
  const engineLabel =
    engineState === 'ready'
      ? 'Motor listo'
      : engineState === 'loading'
        ? `Motor: ${Math.round(engineProgress * 100)}%`
        : 'Motor en espera'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <AudioLines className="h-5 w-5 text-zinc-950" aria-hidden="true" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-sm font-bold tracking-tight sm:text-lg">
              Audio y Video Super Converter
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Convierte, subtitula y edita — todo en tu navegador
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Tip
            side="left"
            tip={
              engineState === 'ready'
                ? 'El motor FFmpeg está cargado y funciona 100% en tu dispositivo.'
                : engineState === 'loading'
                  ? 'Descargando el motor de conversión local (solo la primera vez, ~32 MB).'
                  : 'El motor se descargará automáticamente cuando agregues tu primer archivo.'
            }
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              role="status"
            >
              <span
                className={
                  engineState === 'ready'
                    ? 'h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400'
                    : engineState === 'loading'
                      ? 'h-2 w-2 animate-pulse rounded-full bg-amber-400'
                      : 'h-2 w-2 rounded-full bg-zinc-500'
                }
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{engineLabel}</span>
              <span className="sm:hidden" aria-hidden="true">
                {engineState === 'ready' ? '✓' : engineState === 'loading' ? `${Math.round(engineProgress * 100)}%` : '…'}
              </span>
            </span>
          </Tip>
          <Tip side="left" tip="Tus archivos nunca se suben a ningún servidor: el procesamiento ocurre íntegramente en tu dispositivo con WebAssembly.">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 md:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              100% local
            </span>
          </Tip>
        </div>
      </div>
    </header>
  )
}

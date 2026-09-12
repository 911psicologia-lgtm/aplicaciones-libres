// Progreso general con log técnico en vivo y botón de cancelar
import { Square, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { InfoTip } from './InfoTip'

interface ProgressPanelProps {
  overall: number // 0 - 100
  currentLabel: string
  logLine: string
  onCancel: () => void
}

export function ProgressPanel({ overall, currentLabel, logLine, onCancel }: ProgressPanelProps) {
  return (
    <section
      aria-label="Progreso del procesamiento"
      className="space-y-3 rounded-xl border border-emerald-400/30 bg-card/80 p-4 shadow-[0_0_30px_-12px] shadow-emerald-400/40 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <p className="text-sm font-semibold">{currentLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-emerald-300">{Math.round(overall)}%</span>
          <InfoTip tip="Puedes cancelar en cualquier momento. El motor se recargará automáticamente la próxima vez.">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-destructive/40 text-xs text-red-300 hover:bg-destructive/10 hover:text-red-200"
              onClick={onCancel}
            >
              <Square className="h-3 w-3" aria-hidden="true" />
              Cancelar
            </Button>
          </InfoTip>
        </div>
      </div>
      <Progress value={overall} className="h-2.5" />
      <p className="flex items-center gap-2 font-mono text-[10px] leading-relaxed text-muted-foreground/80">
        <Terminal className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{logLine || 'Inicializando motor FFmpeg…'}</span>
      </p>
    </section>
  )
}

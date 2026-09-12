// Tooltips accesibles para toda la app — se activan con hover y foco
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface TipProps {
  tip: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  /** Permite que el tooltip funcione incluso sobre botones deshabilitados */
  wrap?: boolean
}

/** Envuelve un control y le agrega tooltip. `wrap` permite tooltips en botones deshabilitados. */
export function Tip({ tip, children, side = 'top', className, wrap = false }: TipProps) {
  const trigger = wrap ? (
    <span tabIndex={0} className={cn('inline-block w-full', className)}>
      {children}
    </span>
  ) : (
    children
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={side} className="max-w-[260px] text-xs leading-relaxed">
        {tip}
      </TooltipContent>
    </Tooltip>
  )
}

interface InfoTipProps {
  tip: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  children?: React.ReactNode
}

/** Icono de información con tooltip — para etiquetas y títulos de sección */
export function InfoTip({ tip, side = 'top', className }: InfoTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Ayuda: ${tip}`}
          className={cn(
            'inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring',
            className
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-[260px] text-xs leading-relaxed">
        {tip}
      </TooltipContent>
    </Tooltip>
  )
}

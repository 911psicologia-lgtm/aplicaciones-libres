// Efectos de edición: volumen, velocidad, fundidos y recorte
import { RotateCcw, Scissors, Volume2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { InfoTip, Tip } from './InfoTip'
import type { EffectsOptions } from '@/types/converter'
import { formatDuration, parseTimeInput } from '@/lib/converter/media-utils'

interface EffectsSectionProps {
  value: EffectsOptions
  onChange: (e: EffectsOptions) => void
  referenceDuration: number | null
}

const SPEEDS = ['0.5', '0.75', '1', '1.25', '1.5', '2']

export function EffectsSection({ value, onChange, referenceDuration }: EffectsSectionProps) {
  const patch = (p: Partial<EffectsOptions>) => onChange({ ...value, ...p })

  const trimEndText = value.trimEnd != null ? String(Math.round(value.trimEnd * 10) / 10) : ''
  const trimStartText = value.trimStart != null ? String(Math.round(value.trimStart * 10) / 10) : ''

  const onTrimStart = (raw: string) => {
    if (raw.trim() === '') return patch({ trimStart: null })
    const p = parseTimeInput(raw)
    if (p != null) patch({ trimStart: p })
  }
  const onTrimEnd = (raw: string) => {
    if (raw.trim() === '') return patch({ trimEnd: null })
    const p = parseTimeInput(raw)
    if (p != null) patch({ trimEnd: p })
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Zap className="h-4 w-4 text-amber-300" aria-hidden="true" />
          Efectos y ajustes de edición
          <InfoTip tip="Estos efectos se aplican al convertir. Combínalos con la conversión de formato o aplícalos solos desde la pestaña Metadatos." />
        </h3>
        <Tip tip="Devuelve todos los efectos a su estado original (sin cambios al archivo).">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() =>
              onChange({ volume: 1, speed: 1, fadeIn: 0, fadeOut: 0, trimStart: null, trimEnd: null })
            }
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restablecer
          </Button>
        </Tip>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Volumen */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            <Label className="text-xs font-semibold">Volumen</Label>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {Math.round(value.volume * 100)}%
            </span>
          </div>
          <Tip tip="Sube o baja el volumen sin cambiar la velocidad. 100% deja el audio intacto.">
            <Slider
              aria-label="Volumen"
              value={[value.volume]}
              min={0}
              max={2}
              step={0.05}
              onValueChange={(v) => patch({ volume: v[0] })}
              className="[&_[data-slot=slider-range]]:bg-emerald-400"
            />
          </Tip>
        </div>

        {/* Velocidad */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <Label className="text-xs font-semibold">Velocidad</Label>
          </div>
          <Tip tip="Acelera o ralentiza el archivo: 0.5× es la mitad de velocidad, 2× es el doble.">
            <Select value={String(value.speed)} onValueChange={(v) => patch({ speed: parseFloat(v) })}>
              <SelectTrigger className="h-10 w-full" aria-label="Velocidad de reproducción">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEEDS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}× {s === '1' ? '(normal)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Tip>
        </div>

        {/* Fade in */}
        <div className="space-y-2.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold">
            Fundido de entrada
            <InfoTip tip="El audio y el video aparecen gradualmente desde silencio durante los primeros segundos." />
          </Label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              step={0.5}
              placeholder="0 (desactivado)"
              value={value.fadeIn > 0 ? value.fadeIn : ''}
              onChange={(e) => patch({ fadeIn: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="h-10 pr-8"
              aria-label="Duración del fundido de entrada en segundos"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">s</span>
          </div>
        </div>

        {/* Fade out */}
        <div className="space-y-2.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold">
            Fundido de salida
            <InfoTip tip="El archivo termina gradualmente en silencio. Se calcula automáticamente desde el final." />
          </Label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              step={0.5}
              placeholder="0 (desactivado)"
              value={value.fadeOut > 0 ? value.fadeOut : ''}
              onChange={(e) => patch({ fadeOut: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="h-10 pr-8"
              aria-label="Duración del fundido de salida en segundos"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">s</span>
          </div>
        </div>

        {/* Recorte */}
        <div className="space-y-2.5 sm:col-span-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold">
            <Scissors className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            Recortar (conservar un fragmento)
            <InfoTip tip="Indica el segundo de inicio y fin de la parte que quieres conservar. Acepta formatos como 90 o 1:30. Déjalos vacíos para usar el archivo completo." />
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Inicio · ej. 0:15"
                value={trimStartText}
                onChange={(e) => onTrimStart(e.target.value)}
                className="h-10"
                aria-label="Segundo de inicio del recorte"
              />
            </div>
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                placeholder={referenceDuration ? `Fin · máx. ${formatDuration(referenceDuration)}` : 'Fin · ej. 1:30'}
                value={trimEndText}
                onChange={(e) => onTrimEnd(e.target.value)}
                className="h-10"
                aria-label="Segundo de fin del recorte"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

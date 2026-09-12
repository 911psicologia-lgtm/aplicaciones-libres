// Editor de Audio: recorte visual sobre la onda, mejora de calidad,
// eliminación de voz (karaoke) y fundidos suaves. Todo 100% local.
import { useEffect, useRef, useState } from 'react'
import {
  CheckCheck,
  FileAudio,
  FileVideo,
  Headphones,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Sparkles,
  Square,
  Waves,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { InfoTip, Tip } from './InfoTip'
import { WaveformSelector, type WaveformHandle } from './WaveformSelector'
import type { AudioEditorOptions, MediaFile } from '@/types/converter'
import { formatDuration, parseTimeInput } from '@/lib/converter/media-utils'

interface AudioEditorPanelProps {
  files: MediaFile[]
  selectedId: string | null
  onSelectFile: (id: string) => void
  options: AudioEditorOptions
  onOptions: (o: AudioEditorOptions) => void
  applyToAll: boolean
  onApplyToAll: (v: boolean) => void
  running: boolean
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function AudioEditorPanel({
  files,
  selectedId,
  onSelectFile,
  options,
  onOptions,
  applyToAll,
  onApplyToAll,
  running,
}: AudioEditorPanelProps) {
  const current = files.find((f) => f.id === selectedId) ?? files[0]
  const patch = (p: Partial<AudioEditorOptions>) => onOptions({ ...options, ...p })

  /* ---------- Estado local ---------- */
  const [waveDur, setWaveDur] = useState<number | null>(null)
  const [channels, setChannels] = useState(0) // 0 = desconocido
  const [playing, setPlaying] = useState(false)
  const [liveKaraoke, setLiveKaraoke] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const waveRef = useRef<WaveformHandle>(null)
  const rafRef = useRef<number | null>(null)
  const stopAtRef = useRef<number | null>(null)
  const graphRef = useRef<{ ctx: AudioContext; dry: GainNode; wet: GainNode } | null>(null)

  const effDur = current?.duration ?? waveDur
  const mono = channels === 1

  // Selección efectiva (recortada a la duración real del archivo)
  const selection =
    options.useCut && options.cutEnd - options.cutStart > 0.05
      ? (() => {
          const end = Math.min(options.cutEnd, effDur ?? options.cutEnd)
          const start = Math.max(0, Math.min(options.cutStart, end - 0.1))
          return { start, end }
        })()
      : null

  // Resetea el estado al cambiar de archivo (patrón React: ajustar durante render)
  const [prevUrl, setPrevUrl] = useState<string | null>(current?.url ?? null)
  if ((current?.url ?? null) !== prevUrl) {
    setPrevUrl(current?.url ?? null)
    setWaveDur(null)
    setChannels(0)
    setPlaying(false)
    setLiveKaraoke(false)
  }

  // Limpieza imperativa al cambiar de archivo (sistemas externos)
  useEffect(() => {
    stopAtRef.current = null
    const g = graphRef.current
    if (g) {
      g.dry.gain.value = 1
      g.wet.gain.value = 0
    }
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
    }
    waveRef.current?.setPlayhead(null)
  }, [current?.url])

  // Cierra el contexto de audio al desmontar
  useEffect(() => {
    const g = graphRef.current
    return () => {
      void g?.ctx.close().catch(() => undefined)
    }
  }, [])

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    },
    []
  )

  /* ---------- Reproducción con cabezal ---------- */
  const startTick = () => {
    const tick = () => {
      const a = audioRef.current
      if (!a) return
      waveRef.current?.setPlayhead(a.currentTime)
      const stop = stopAtRef.current
      if (stop != null && a.currentTime >= stop - 0.02) {
        a.pause()
        a.currentTime = stop
        stopAtRef.current = null
        waveRef.current?.setPlayhead(stop)
        setPlaying(false)
        return
      }
      if (!a.paused) rafRef.current = requestAnimationFrame(tick)
    }
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }
  const stopTick = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  const playFrom = (t: number, stopAt: number | null) => {
    const a = audioRef.current
    if (!a) return
    stopAtRef.current = stopAt
    a.currentTime = t
    a.play()
      .then(startTick)
      .catch(() => undefined)
  }

  const handleSelect = (sel: { start: number; end: number } | null) => {
    if (!sel || sel.end - sel.start < 0.05) patch({ useCut: false })
    else patch({ useCut: true, cutStart: round2(sel.start), cutEnd: round2(sel.end) })
  }

  const selectAll = () => {
    if (!effDur) return
    patch({ useCut: true, cutStart: 0, cutEnd: round2(effDur) })
  }

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      // Si está antes de la selección y hay una, salta a ella
      if (selection && a.currentTime < selection.start - 0.05) a.currentTime = selection.start
      a.play()
        .then(startTick)
        .catch(() => undefined)
    } else {
      a.pause()
      setPlaying(false)
      stopTick()
    }
  }

  const stopPlayback = () => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    stopAtRef.current = null
    stopTick()
    waveRef.current?.setPlayhead(null)
    setPlaying(false)
  }

  /* ---------- Vista previa en vivo del karaoke (Web Audio) ---------- */
  const setKaraoke = (on: boolean) => {
    const a = audioRef.current
    if (!a) return
    if (on) {
      if (!graphRef.current) {
        try {
          const AC =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          const ctx = new AC()
          const src = ctx.createMediaElementSource(a)
          const dry = ctx.createGain()
          const wet = ctx.createGain()
          wet.gain.value = 0
          const split = ctx.createChannelSplitter(2)
          const inv = ctx.createGain()
          inv.gain.value = -1
          const sum = ctx.createGain()
          src.connect(dry)
          dry.connect(ctx.destination)
          src.connect(split)
          split.connect(sum, 0, 0)
          split.connect(inv, 1, 0)
          inv.connect(sum)
          sum.connect(wet)
          wet.connect(ctx.destination)
          graphRef.current = { ctx, dry, wet }
        } catch {
          graphRef.current = null
          return
        }
      }
      void graphRef.current.ctx.resume()
      graphRef.current.dry.gain.value = 0
      graphRef.current.wet.gain.value = 1
      setLiveKaraoke(true)
    } else {
      const g = graphRef.current
      if (g) {
        g.dry.gain.value = 1
        g.wet.gain.value = 0
      }
      setLiveKaraoke(false)
    }
  }

  /* ---------- Campos de tiempo ---------- */
  const startText = selection ? String(round2(selection.start)) : ''
  const endText = selection ? String(round2(selection.end)) : ''
  const onStartText = (raw: string) => {
    const v = parseTimeInput(raw)
    if (v == null) return
    const end = options.cutEnd || (effDur ?? v + 10)
    patch({ useCut: true, cutStart: Math.max(0, Math.min(v, end - 0.2)) })
  }
  const onEndText = (raw: string) => {
    const v = parseTimeInput(raw)
    if (v == null) return
    const max = effDur ?? v
    const start = options.cutStart
    patch({ useCut: true, cutEnd: Math.min(v, max), cutStart: Math.min(start, Math.max(0, v - 0.2)) })
  }

  if (!current) return null

  const audioCount = files.filter((f) => f.kind === 'audio').length

  return (
    <div className="space-y-4">
      {/* Selector de archivo cuando hay varios */}
      {files.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Archivo a editar">
          {files.map((f) => {
            const active = f.id === current.id
            const Icon = f.kind === 'video' ? FileVideo : FileAudio
            return (
              <Tip key={f.id} tip={`Editar "${f.name}"`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectFile(f.id)}
                  className={
                    'flex max-w-[220px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
                    (active
                      ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-200'
                      : 'border-border bg-card text-muted-foreground hover:border-emerald-400/40 hover:text-foreground')
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{f.name}</span>
                </button>
              </Tip>
            )
          })}
        </div>
      )}

      {current.kind === 'video' && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Estás editando el audio de un video: el resultado será un archivo de sonido listo para usar.
        </p>
      )}

      {/* ---------- Recorte ---------- */}
      <section className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Scissors className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            Recortar
            <InfoTip tip="Arrastra sobre la onda para marcar el fragmento (o escribe los tiempos). Después elige si quieres conservar solo ese trozo o eliminarlo del archivo." />
          </h3>
          {selection && (
            <Tip tip="Quita la selección para editar el archivo completo sin recortar.">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground"
                onClick={() => patch({ useCut: false })}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Quitar selección
              </Button>
            </Tip>
          )}
        </div>

        <WaveformSelector
          ref={waveRef}
          url={current.url}
          fallbackDuration={current.duration}
          selection={selection}
          onSelect={handleSelect}
          onDuration={setWaveDur}
          onChannels={setChannels}
          disabled={running}
        />

        <div className="grid grid-cols-2 gap-3">
          <Tip tip="Segundo de inicio del fragmento. Acepta 90 o 1:30." side="top">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Inicio · ej. 0:15"
              value={startText}
              onChange={(e) => onStartText(e.target.value)}
              className="h-10"
              aria-label="Segundo de inicio del fragmento"
            />
          </Tip>
          <Tip tip="Segundo de fin del fragmento. Déjalo igual al inicio para quitar el recorte." side="top">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={effDur ? `Fin · máx. ${formatDuration(effDur)}` : 'Fin · ej. 1:30'}
              value={endText}
              onChange={(e) => onEndText(e.target.value)}
              className="h-10"
              aria-label="Segundo de fin del fragmento"
            />
          </Tip>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tip tip="Escucha únicamente el fragmento seleccionado.">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => selection && playFrom(selection.start, selection.end)}
              disabled={!selection || running}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Escuchar selección
            </Button>
          </Tip>
          <Tip tip="Escucha el archivo completo desde el principio.">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => playFrom(0, null)}
              disabled={running}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Escuchar todo
            </Button>
          </Tip>
          <Tip tip="Pausa o continúa la reproducción.">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={togglePlay}
              disabled={running}
            >
              {playing ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {playing ? 'Pausa' : 'Reanudar'}
            </Button>
          </Tip>
          <Tip tip="Detiene la reproducción y limpia el cabezal.">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={stopPlayback}
              disabled={running}
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              Detener
            </Button>
          </Tip>
          <Tip tip="Selecciona el archivo completo como fragmento.">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={selectAll}
              disabled={!effDur || running}
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Seleccionar todo
            </Button>
          </Tip>
        </div>

        <RadioGroup
          value={options.cutMode}
          onValueChange={(v) => patch({ cutMode: v as 'keep' | 'remove' })}
          className="grid gap-2 sm:grid-cols-2"
        >
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-3">
            <RadioGroupItem value="keep" id="ed-keep" className="mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="ed-keep" className="cursor-pointer text-xs font-semibold">
                Conservar el fragmento
              </Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                El resultado contiene únicamente la parte marcada en la onda.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-3">
            <RadioGroupItem value="remove" id="ed-remove" className="mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="ed-remove" className="cursor-pointer text-xs font-semibold">
                Eliminar el fragmento
              </Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Quita la parte marcada y une los extremos sin salto brusco.
              </p>
            </div>
          </div>
        </RadioGroup>

        {/* Fundidos automáticos en los cortes */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tip tip="Añade micro-fundidos justo donde cortas o unes audio: sin clics ni saltos secos. Muy recomendado." side="top">
                <span className="contents">
                  <Switch
                    id="ed-autofade"
                    checked={options.autoFades}
                    onCheckedChange={(v) => patch({ autoFades: v })}
                    aria-label="Fundidos automáticos en los cortes"
                  />
                </span>
              </Tip>
              <Label htmlFor="ed-autofade" className="cursor-pointer text-xs font-semibold">
                Fundidos automáticos en los cortes
              </Label>
              <InfoTip tip="Evita que el cambio suene brusco al recortar. Actívalo siempre que vayas a cortar o unir partes." />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {options.autoFadeDur.toFixed(2)} s
            </span>
          </div>
          <Tip tip="Duración de cada fundido automático. Valores de 0,2 a 0,5 segundos suenan naturales." side="top">
            <Slider
              aria-label="Duración del fundido automático en segundos"
              value={[options.autoFadeDur]}
              min={0.05}
              max={2}
              step={0.05}
              disabled={!options.autoFades}
              onValueChange={(v) => patch({ autoFadeDur: v[0] })}
              className="[&_[data-slot=slider-range]]:bg-emerald-400"
            />
          </Tip>
        </div>
      </section>

      {/* ---------- Fundidos manuales ---------- */}
      <section className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Waves className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Fundidos de entrada y salida
          <InfoTip tip="El audio entra y sale gradualmente desde/desde silencio. Se aplican al inicio y al final del resultado final, después del recorte. En 0 quedan desactivados." />
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input
              type="number"
              min={0}
              step={0.1}
              placeholder="Fade in · 0 (no)"
              value={options.fadeIn > 0 ? options.fadeIn : ''}
              onChange={(e) => patch({ fadeIn: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="h-10 pr-8"
              aria-label="Duración del fundido de entrada en segundos"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">s</span>
          </div>
          <div className="relative">
            <Input
              type="number"
              min={0}
              step={0.1}
              placeholder="Fade out · 0 (no)"
              value={options.fadeOut > 0 ? options.fadeOut : ''}
              onChange={(e) => patch({ fadeOut: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="h-10 pr-8"
              aria-label="Duración del fundido de salida en segundos"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">s</span>
          </div>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Útil para que una canción recortada no empiece ni termine de golpe. Si activaste los
          fundidos automáticos, los cortes internos ya quedan suavizados.
        </p>
      </section>

      {/* ---------- Mejorar calidad ---------- */}
      <section className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
          Mejorar la calidad del audio
          <InfoTip tip="Activa solo lo que necesites: son mejoras de estudio aplicadas en cadena al procesar." />
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <Label htmlFor="ed-norm" className="cursor-pointer text-xs font-semibold">
                Normalizar volumen
              </Label>
              <InfoTip tip="Iguala el nivel al estándar de streaming (−14 LUFS): ni bajo ni saturado." />
            </div>
            <Switch id="ed-norm" checked={options.normalize} onCheckedChange={(v) => patch({ normalize: v })} aria-label="Normalizar volumen" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <Label htmlFor="ed-denoise" className="cursor-pointer text-xs font-semibold">
                Reducir ruido de fondo
              </Label>
              <InfoTip tip="Atenúa siseos, zumbidos y ruido constante de grabaciones caseras." />
            </div>
            <Switch id="ed-denoise" checked={options.denoise} onCheckedChange={(v) => patch({ denoise: v })} aria-label="Reducir ruido de fondo" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <Label htmlFor="ed-clarity" className="cursor-pointer text-xs font-semibold">
                Claridad de la voz
              </Label>
              <InfoTip tip="Realza las frecuencias de presencia (≈3 kHz) para que la voz se entienda mejor." />
            </div>
            <Switch id="ed-clarity" checked={options.clarity} onCheckedChange={(v) => patch({ clarity: v })} aria-label="Claridad de la voz" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <Label htmlFor="ed-comp" className="cursor-pointer text-xs font-semibold">
                Compresión suave
              </Label>
              <InfoTip tip="Iguala partes muy fuertes y muy flojas: todo se escucha parejo, como en radio." />
            </div>
            <Switch id="ed-comp" checked={options.compressor} onCheckedChange={(v) => patch({ compressor: v })} aria-label="Compresión suave" />
          </div>
          <div className="space-y-2.5 rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="ed-bass" className="text-xs font-semibold">
                Graves (bajo)
              </Label>
              <span className="font-mono text-xs text-muted-foreground">
                {options.bassBoost > 0 ? `+${options.bassBoost}` : options.bassBoost} dB
              </span>
            </div>
            <Tip tip="Refuerza o recorta los graves alrededor de 110 Hz. 0 dB deja el sonido original." side="top">
              <Slider
                id="ed-bass"
                aria-label="Ganancia de graves en decibelios"
                value={[options.bassBoost]}
                min={-6}
                max={6}
                step={1}
                onValueChange={(v) => patch({ bassBoost: v[0] })}
                className="[&_[data-slot=slider-range]]:bg-emerald-400"
              />
            </Tip>
          </div>
          <div className="space-y-2.5 rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="ed-treble" className="text-xs font-semibold">
                Agudos (brillo)
              </Label>
              <span className="font-mono text-xs text-muted-foreground">
                {options.trebleBoost > 0 ? `+${options.trebleBoost}` : options.trebleBoost} dB
              </span>
            </div>
            <Tip tip="Da más brillo y aire, o suaviza los agudos duros. 0 dB deja el sonido original." side="top">
              <Slider
                id="ed-treble"
                aria-label="Ganancia de agudos en decibelios"
                value={[options.trebleBoost]}
                min={-6}
                max={6}
                step={1}
                onValueChange={(v) => patch({ trebleBoost: v[0] })}
                className="[&_[data-slot=slider-range]]:bg-emerald-400"
              />
            </Tip>
          </div>
        </div>
      </section>

      {/* ---------- Voz y música ---------- */}
      <section className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Music2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Voz y música (karaoke)
          <InfoTip tip="Elimina la voz centrada de canciones estéreo y conserva los graves de la música. También puedes intentar lo contrario: quedarte solo con la voz." />
        </h3>
        <RadioGroup
          value={options.vocalMode}
          onValueChange={(v) => patch({ vocalMode: v as AudioEditorOptions['vocalMode'] })}
          className="grid gap-2 sm:grid-cols-3"
        >
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-3">
            <RadioGroupItem value="original" id="ed-vorig" className="mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="ed-vorig" className="cursor-pointer text-xs font-semibold">
                Original
              </Label>
              <p className="text-[11px] leading-snug text-muted-foreground">No toca la voz ni la música.</p>
            </div>
          </div>
          <div className={'flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-3' + (mono ? ' opacity-50' : '')}>
            <RadioGroupItem value="music" id="ed-vmusic" className="mt-0.5" disabled={mono} />
            <div className="space-y-0.5">
              <Label htmlFor="ed-vmusic" className="cursor-pointer text-xs font-semibold">
                Solo música
              </Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Elimina la voz centrada (ideal para cantar encima).
              </p>
            </div>
          </div>
          <div className={'flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-3' + (mono ? ' opacity-50' : '')}>
            <RadioGroupItem value="vocals" id="ed-vvocals" className="mt-0.5" disabled={mono} />
            <div className="space-y-0.5">
              <Label htmlFor="ed-vvocals" className="cursor-pointer text-xs font-semibold">
                Solo voz
              </Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Experimental: intenta quedarse solo con la voz.
              </p>
            </div>
          </div>
        </RadioGroup>

        {mono && (
          <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            Este archivo es mono (un solo canal): no tiene separación estéreo, así que la eliminación
            de voz no está disponible. Carga una versión estéreo de la canción.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Tip
            tip={
              liveKaraoke
                ? 'Vuelve a escuchar el audio original sin ningún efecto.'
                : 'Escucha al instante cómo suena tu canción sin la voz, sin procesar nada todavía.'
            }
            side="top"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={
                liveKaraoke
                  ? 'h-9 gap-1.5 border-emerald-400/70 bg-emerald-400/15 font-semibold text-emerald-200 hover:bg-emerald-400/25'
                  : 'h-9 gap-1.5'
              }
              onClick={() => setKaraoke(!liveKaraoke)}
              disabled={mono || running}
              aria-pressed={liveKaraoke}
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              {liveKaraoke ? 'Escuchar original' : 'Probar karaoke en vivo'}
            </Button>
          </Tip>
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted-foreground">
            La vista previa en vivo aplica solo el efecto karaoke al instante; el archivo final
            incluirá además todas las mejoras que tengas activadas.
          </p>
        </div>
      </section>

      {/* ---------- Salida ---------- */}
      <section className="space-y-4 rounded-xl border border-border bg-background/40 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <FileAudio className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          Formato de salida
          <InfoTip tip="Elige mantener el formato original (calidad máxima posible) o convertir a MP3, WAV, FLAC o M4A al editar." />
        </h3>
        <Tip tip="WAV y FLAC no pierden calidad nunca. MP3 usa 320 kbps, la máxima de su formato." side="top">
          <Select value={options.outFormat} onValueChange={(v) => patch({ outFormat: v as AudioEditorOptions['outFormat'] })}>
            <SelectTrigger className="h-10 w-full" aria-label="Formato de salida del editor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="same">Mantener el formato original</SelectItem>
              <SelectItem value="mp3">MP3 · 320 kbps (máxima calidad)</SelectItem>
              <SelectItem value="wav">WAV · sin compresión (estudio)</SelectItem>
              <SelectItem value="flac">FLAC · sin pérdida, ocupa menos</SelectItem>
              <SelectItem value="m4a">M4A · AAC 256 kbps (Apple)</SelectItem>
            </SelectContent>
          </Select>
        </Tip>
        {audioCount > 1 && (
          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/50 p-3">
            <Checkbox
              id="ed-all"
              checked={applyToAll}
              onCheckedChange={(v) => onApplyToAll(v === true)}
              className="mt-0.5"
            />
            <div className="min-w-0 space-y-0.5">
              <Label htmlFor="ed-all" className="cursor-pointer text-xs font-semibold">
                Aplicar a todos los archivos de audio de la cola
              </Label>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Repite estas ediciones en cada canción en cola con los mismos tiempos (ajustados a su duración).
              </p>
            </div>
            <InfoTip tip="Perfecto para quitar la voz o normalizar varios archivos de una sola vez." />
          </div>
        )}
      </section>

      <audio
        ref={audioRef}
        src={current.url}
        preload="metadata"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          stopAtRef.current = null
          waveRef.current?.setPlayhead(null)
        }}
      />
    </div>
  )
}

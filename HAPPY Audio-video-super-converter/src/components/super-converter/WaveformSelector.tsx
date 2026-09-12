// Onda de audio interactiva: decodifica el archivo con Web Audio, dibuja los
// picos en canvas y permite seleccionar el fragmento arrastrando (ratón o
// táctil). Expone un cabezal de reproducción de alto rendimiento.
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { formatDuration } from '@/lib/converter/media-utils'

export interface WaveformHandle {
  setPlayhead: (t: number | null) => void
}

interface WaveformSelectorProps {
  url: string
  fallbackDuration: number | null
  selection: { start: number; end: number } | null
  onSelect: (sel: { start: number; end: number } | null) => void
  onDuration?: (d: number) => void
  onChannels?: (n: number) => void
  disabled?: boolean
}

const HANDLE_PX = 14
const MIN_SEL = 0.1

export const WaveformSelector = forwardRef<WaveformHandle, WaveformSelectorProps>(
  function WaveformSelector(
    { url, fallbackDuration, selection, onSelect, onDuration, onChannels, disabled },
    ref
  ) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const offRef = useRef<HTMLCanvasElement | null>(null)
    const peaksRef = useRef<{ min: Float32Array; max: Float32Array } | null>(null)
    const durRef = useRef(0)
    const playheadRef = useRef<number | null>(null)
    const dragRef = useRef<{ mode: 'new' | 'start' | 'end'; anchor: number; delta: number } | null>(null)
    const selRef = useRef(selection)
    selRef.current = selection
    // Última versión de los callbacks (evita re-decodificar cuando el padre
    // pasa funciones nuevas en cada render)
    const onDurationRef = useRef(onDuration)
    onDurationRef.current = onDuration
    const onChannelsRef = useRef(onChannels)
    onChannelsRef.current = onChannels

    const [ready, setReady] = useState(false)
    const [failed, setFailed] = useState(false)

    /* ---------- Decodificación y cálculo de picos ---------- */
    useEffect(() => {
      let cancelled = false
      setReady(false)
      setFailed(false)
      peaksRef.current = null
      offRef.current = null
      durRef.current = 0

      ;(async () => {
        try {
          const res = await fetch(url)
          const buf = await res.arrayBuffer()
          const AC =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          const ctx = new AC()
          try {
            const audio = await ctx.decodeAudioData(buf)
            if (cancelled) return
            durRef.current = audio.duration
            onDurationRef.current?.(audio.duration)
            onChannelsRef.current?.(audio.numberOfChannels)

            const len = audio.length
            const c0 = audio.getChannelData(0)
            const c1 = audio.numberOfChannels > 1 ? audio.getChannelData(1) : null
            const buckets = Math.max(240, Math.min(1600, Math.floor(len / 24)))
            const min = new Float32Array(buckets)
            const max = new Float32Array(buckets)
            const per = len / buckets
            for (let b = 0; b < buckets; b++) {
              const s = Math.floor(b * per)
              const e = Math.min(len, Math.ceil((b + 1) * per))
              let mn = 1
              let mx = -1
              for (let i = s; i < e; i++) {
                const v = c1 ? (c0[i] + c1[i]) * 0.5 : c0[i]
                if (v < mn) mn = v
                if (v > mx) mx = v
              }
              min[b] = mn <= mx ? mn : 0
              max[b] = mn <= mx ? mx : 0
            }
            peaksRef.current = { min, max }
            setReady(true)
          } finally {
            void ctx.close()
          }
        } catch {
          if (!cancelled) {
            setFailed(true)
            onChannelsRef.current?.(0)
          }
        }
      })()

      return () => {
        cancelled = true
      }
    }, [url])

    /* ---------- Dibujo ---------- */

    // Capa estática: picos de la onda (se redibuja solo al cambiar tamaño)
    const renderWave = useCallback(() => {
      const wrap = wrapRef.current
      const pk = peaksRef.current
      if (!wrap || !pk) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = Math.max(1, wrap.clientWidth)
      const h = Math.max(1, wrap.clientHeight)
      let off = offRef.current
      if (!off) off = document.createElement('canvas')
      offRef.current = off
      off.width = Math.round(w * dpr)
      off.height = Math.round(h * dpr)
      const g = off.getContext('2d')
      if (!g) return
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)

      g.strokeStyle = 'rgba(148,163,184,0.25)'
      g.lineWidth = 1
      g.beginPath()
      g.moveTo(0, h / 2 + 0.5)
      g.lineTo(w, h / 2 + 0.5)
      g.stroke()

      const n = pk.min.length
      const mid = h / 2
      g.lineWidth = 1
      for (let x = 0; x < w; x++) {
        const b0 = Math.floor((x / w) * n)
        const b1 = Math.max(b0 + 1, Math.ceil(((x + 1) / w) * n))
        let mn = 1
        let mx = -1
        for (let b = b0; b < b1 && b < n; b++) {
          if (pk.min[b] < mn) mn = pk.min[b]
          if (pk.max[b] > mx) mx = pk.max[b]
        }
        if (mn > mx) continue
        const y1 = Math.max(0, mid - mx * mid * 0.9)
        const y2 = Math.min(h, mid - mn * mid * 0.9)
        g.strokeStyle = '#34d399'
        g.beginPath()
        g.moveTo(x + 0.5, y1)
        g.lineTo(x + 0.5, Math.max(y2, y1 + 1.5))
        g.stroke()
      }
    }, [])

    // Capa dinámica: fondo + onda + selección + cabezal (60 fps si hace falta)
    const draw = useCallback(() => {
      const wrap = wrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = Math.max(1, wrap.clientWidth)
      const h = Math.max(1, wrap.clientHeight)
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      const g = canvas.getContext('2d')
      if (!g) return
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)

      g.fillStyle = 'rgba(2,6,23,0.35)'
      g.fillRect(0, 0, w, h)
      if (offRef.current) g.drawImage(offRef.current, 0, 0, w, h)

      const dur = durRef.current || fallbackDuration || 0
      const sel = selRef.current
      if (sel && dur > 0) {
        const x1 = Math.max(0, (sel.start / dur) * w)
        const x2 = Math.min(w, (sel.end / dur) * w)
        // Atenua lo que queda fuera de la selección
        g.fillStyle = 'rgba(2,6,23,0.62)'
        g.fillRect(0, 0, x1, h)
        g.fillRect(x2, 0, w - x2, h)
        // Bordes de la selección con asas redondas
        g.strokeStyle = 'rgba(52,211,153,0.95)'
        g.lineWidth = 2
        for (const x of [x1, x2]) {
          g.beginPath()
          g.moveTo(x, 0)
          g.lineTo(x, h)
          g.stroke()
        }
        g.fillStyle = 'rgba(52,211,153,0.95)'
        for (const x of [x1, x2]) {
          g.beginPath()
          g.arc(x, 10, 4.5, 0, Math.PI * 2)
          g.fill()
        }
      }

      const ph = playheadRef.current
      if (ph != null && dur > 0 && ph >= 0 && ph <= dur) {
        const x = (ph / dur) * w
        g.strokeStyle = '#fbbf24'
        g.lineWidth = 2
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x, h)
        g.stroke()
      }
    }, [fallbackDuration])

    useEffect(() => {
      renderWave()
      draw()
    }, [ready, renderWave, draw])

    useEffect(() => {
      draw()
    }, [selection, draw])

    useEffect(() => {
      const wrap = wrapRef.current
      if (!wrap) return
      const ro = new ResizeObserver(() => {
        renderWave()
        draw()
      })
      ro.observe(wrap)
      return () => ro.disconnect()
    }, [renderWave, draw])

    useImperativeHandle(
      ref,
      () => ({
        setPlayhead: (t: number | null) => {
          playheadRef.current = t
          draw()
        },
      }),
      [draw]
    )

    /* ---------- Interacción (puntero unificado: ratón + táctil) ---------- */

    const timeAt = useCallback(
      (clientX: number): number => {
        const wrap = wrapRef.current
        if (!wrap) return 0
        const rect = wrap.getBoundingClientRect()
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
        return ratio * (durRef.current || fallbackDuration || 0)
      },
      [fallbackDuration]
    )

    const beginDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled || (!ready && !failed)) return
      const dur = durRef.current || fallbackDuration || 0
      if (dur <= 0) return
      const t = timeAt(e.clientX)
      const rect = wrapRef.current!.getBoundingClientRect()
      const px = e.clientX - rect.left
      const w = wrapRef.current!.clientWidth
      const sel = selRef.current
      let mode: 'new' | 'start' | 'end' = 'new'
      if (sel) {
        const xs = (sel.start / dur) * w
        const xe = (sel.end / dur) * w
        if (Math.abs(px - xs) <= HANDLE_PX) mode = 'start'
        else if (Math.abs(px - xe) <= HANDLE_PX) mode = 'end'
      }
      dragRef.current = { mode, anchor: t, delta: 0 }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* ignora */
      }
      if (mode === 'new') onSelect({ start: t, end: t })
    }

    const moveDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const t = timeAt(e.clientX)
      const sel = selRef.current
      const d = Math.abs(t - drag.anchor)
      if (d > drag.delta) drag.delta = d
      if (drag.mode === 'new') {
        onSelect({ start: Math.min(drag.anchor, t), end: Math.max(drag.anchor, t) })
      } else if (drag.mode === 'start' && sel) {
        onSelect({ start: Math.min(t, sel.end - MIN_SEL), end: sel.end })
      } else if (drag.mode === 'end' && sel) {
        onSelect({ start: sel.start, end: Math.max(t, sel.start + MIN_SEL) })
      }
    }

    const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current
      dragRef.current = null
      if (!drag) return
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignora */
      }
      if (drag.mode === 'new') {
        // Toque simple sin arrastre = limpiar la selección
        if (drag.delta * (durRef.current || fallbackDuration || 1) < 0.02) onSelect(null)
        else {
          const sel = selRef.current
          if (sel && sel.end - sel.start >= MIN_SEL) {
            onSelect({
              start: Math.round(sel.start * 1000) / 1000,
              end: Math.round(sel.end * 1000) / 1000,
            })
          }
        }
      } else {
        const sel = selRef.current
        if (sel) onSelect({ start: Math.round(sel.start * 1000) / 1000, end: Math.round(sel.end * 1000) / 1000 })
      }
    }

    return (
      <div className="space-y-1.5">
        <div
          ref={wrapRef}
          className="relative h-28 w-full touch-none select-none overflow-hidden rounded-lg border border-border bg-zinc-950/60 sm:h-36"
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Onda de audio. Arrastra para seleccionar el fragmento a conservar o eliminar."
            className="h-full w-full cursor-crosshair touch-none"
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          {!ready && !failed && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60 text-xs text-muted-foreground">
              Analizando el audio…
            </div>
          )}
          {failed && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60 px-4 text-center text-xs text-muted-foreground">
              No se pudo dibujar la onda de este archivo. Ajusta el recorte con los campos de tiempo.
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
          <span>Arrastra sobre la onda para marcar el fragmento · toca la onda para limpiar</span>
          <span className="shrink-0 font-mono">
            {formatDuration(durRef.current || fallbackDuration)}
          </span>
        </div>
      </div>
    )
  }
)

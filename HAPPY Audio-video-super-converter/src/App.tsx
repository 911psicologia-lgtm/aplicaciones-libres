// Audio y Video Super Converter — componente principal (App)
// Contraingeniería de los mejores conversores: flujo simple de botones,
// tooltips en todo, 100% responsive y procesamiento 100% local (FFmpeg WASM)
// Aplicación estática (Vite + React + TS) — sin servidor, todo corre en el navegador.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartHandshake, Lock, Wand2, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { AppHeader } from '@/components/super-converter/AppHeader'
import { DropZone } from '@/components/super-converter/DropZone'
import { FileQueue } from '@/components/super-converter/FileQueue'
import { ToolMenu } from '@/components/super-converter/ToolMenu'
import { ConvertPanel } from '@/components/super-converter/ConvertPanel'
import { SubtitlePanel } from '@/components/super-converter/SubtitlePanel'
import { MetadataPanel } from '@/components/super-converter/MetadataPanel'
import { ProgressPanel } from '@/components/super-converter/ProgressPanel'
import { ResultsPanel } from '@/components/super-converter/ResultsPanel'
import { Tip } from '@/components/super-converter/InfoTip'
import { EffectsSection } from '@/components/super-converter/EffectsSection'
import { AudioEditorPanel } from '@/components/super-converter/AudioEditorPanel'

import { engine } from '@/lib/converter/ffmpeg-client'
import {
  buildConversionArgs,
  buildMetadataCopyArgs,
  buildSubtitleEmbedArgs,
} from '@/lib/converter/args-builder'
import { buildAudioEditorArgs, editorOutputSpec } from '@/lib/converter/audio-editor'
import { AUDIO_FORMATS, VIDEO_FORMATS, findFormatByExt, type FormatDef } from '@/lib/converter/formats'
import {
  baseOf,
  detectKind,
  extOf,
  outputName,
  probeMediaFile,
} from '@/lib/converter/media-utils'
import { toSRT } from '@/lib/converter/subtitles'
import {
  DEFAULT_EFFECTS,
  DEFAULT_EDITOR_OPTIONS,
  EMPTY_METADATA,
  editorActive,
  effectsActive,
} from '@/types/converter'
import type {
  AudioEditorOptions,
  EffectsOptions,
  LoadedSubtitle,
  MediaFile,
  MetadataOptions,
  QualityId,
  ResultFile,
  ToolId,
} from '@/types/converter'

let uid = 0
const nextId = () => `f${++uid}-${Date.now().toString(36)}`

export default function App() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [tool, setTool] = useState<ToolId>('convert')
  const [format, setFormat] = useState<FormatDef | null>(null)
  const [quality, setQuality] = useState<QualityId>('media')
  const [metadata, setMetadata] = useState<MetadataOptions>(EMPTY_METADATA)
  const [effects, setEffects] = useState<EffectsOptions>(DEFAULT_EFFECTS)
  const [subtitle, setSubtitle] = useState<LoadedSubtitle | null>(null)
  const [editor, setEditor] = useState<AudioEditorOptions>(DEFAULT_EDITOR_OPTIONS)
  const [editorFileId, setEditorFileId] = useState<string | null>(null)
  const [editorApplyAll, setEditorApplyAll] = useState(false)

  // Mantiene el archivo del editor siempre válido al cambiar la cola
  useEffect(() => {
    setEditorFileId((cur) => {
      if (cur && files.some((f) => f.id === cur)) return cur
      return files[0]?.id ?? null
    })
  }, [files])

  const [results, setResults] = useState<ResultFile[]>([])
  const [running, setRunning] = useState(false)

  const [engineState, setEngineState] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [engineProgress, setEngineProgress] = useState(0)

  const [currentLabel, setCurrentLabel] = useState('')
  const [fileProgress, setFileProgress] = useState(0)
  const [logLine, setLogLine] = useState('')
  const logRef = useRef('')

  // Refresca la línea de log sin saturar el render
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLogLine(logRef.current), 500)
    return () => clearInterval(t)
  }, [running])

  /* ---------- Carga de archivos ---------- */

  const preloadEngine = useCallback(() => {
    if (engine.ready) {
      setEngineState('ready')
      return
    }
    setEngineState('loading')
    engine
      .load({
        onEngineProgress: (p) => {
          setEngineProgress(p)
          if (p >= 1) setEngineState('ready')
        },
      })
      .then(() => setEngineState('ready'))
      .catch(() => {
        setEngineState('idle')
        toast.error('No se pudo preparar el motor local. Revisa tu conexión e inténtalo de nuevo.')
      })
  }, [])

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const accepted: MediaFile[] = []
      let rejected = 0

      for (const file of incoming) {
        const kind = detectKind(file)
        if (!kind) {
          rejected++
          continue
        }
        const url = URL.createObjectURL(file)
        const mf: MediaFile = {
          id: nextId(),
          file,
          name: file.name,
          base: baseOf(file.name),
          ext: extOf(file.name) || (kind === 'audio' ? 'bin' : 'mp4'),
          kind,
          size: file.size,
          duration: null,
          width: null,
          height: null,
          url,
        }
        accepted.push(mf)
      }

      if (rejected > 0) {
        toast.warning(
          `${rejected} archivo(s) no reconocido(s) como audio o video. Prueba con MP3, MP4, WAV, MKV, OGG, MOV…`
        )
      }
      if (accepted.length === 0) return

      setFiles((prev) => [...prev, ...accepted])
      toast.success(`${accepted.length} archivo(s) en cola`)

      // Sondea duración en segundo plano
      for (const mf of accepted) {
        probeMediaFile(mf.file, mf.kind).then((r) => {
          setFiles((prev) =>
            prev.map((p) => (p.id === mf.id ? { ...p, duration: r.duration, width: r.width, height: r.height } : p))
          )
        })
      }

      // Precarga del motor + formato por defecto inteligente
      preloadEngine()
      const first = accepted[0]
      setFormat((cur) => cur ?? (first.kind === 'video' ? VIDEO_FORMATS[0] : AUDIO_FORMATS[0]))
    },
    [preloadEngine]
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.url))
      return []
    })
  }, [])

  /* ---------- Procesamiento ---------- */

  const hasVideo = useMemo(() => files.some((f) => f.kind === 'video'), [files])

  /* ---------- Editor de audio: objetivos ---------- */

  const editorTargets = useMemo(() => {
    if (tool !== 'audioeditor' || files.length === 0) return []
    const sel = files.find((f) => f.id === editorFileId) ?? files[0]
    if (!editorApplyAll) return [sel]
    const audios = files.filter((f) => f.kind === 'audio')
    if (sel.kind === 'video') return [sel, ...audios]
    const map = new Map(audios.map((f) => [f.id, f]))
    map.set(sel.id, sel)
    return [...map.values()]
  }, [tool, files, editorFileId, editorApplyAll])

  const ctaDisabledReason = useMemo(() => {
    if (files.length === 0) return 'Primero carga un archivo de audio o video.'
    if (running) return 'Procesamiento en curso…'
    if (tool === 'subtitles') {
      if (!hasVideo) return 'Los subtítulos se incrustan en archivos de video. Carga un video primero.'
      if (!subtitle) return 'Carga un archivo de subtítulos .srt o .vtt en el panel de Subtítulos.'
    }
    if (tool === 'convert' && !format) return 'Elige un formato de salida.'
    if (tool === 'audioeditor') {
      if (editorTargets.length === 0) return 'Carga un archivo de audio para editarlo.'
      if (!editorActive(editor)) {
        return 'Activa al menos una edición: recorte, mejoras de calidad, karaoke o fundidos.'
      }
    }
    return null
  }, [files.length, running, tool, hasVideo, subtitle, format, editorTargets.length, editor])

  const ctaLabel = useMemo(() => {
    if (running) return 'Procesando…'
    const n = files.length
    if (tool === 'subtitles') {
      const v = files.filter((f) => f.kind === 'video').length
      return `Incrustar subtítulos en ${v} video${v === 1 ? '' : 's'}`
    }
    if (tool === 'metadata') return `Aplicar cambios a ${n} archivo${n === 1 ? '' : 's'}`
    if (tool === 'audioeditor') {
      const m = editorTargets.length
      return `Editar audio de ${m} archivo${m === 1 ? '' : 's'}`
    }
    const fmtLabel = format ? format.label : '…'
    return `Convertir ${n} archivo${n === 1 ? '' : 's'} a ${fmtLabel}`
  }, [running, files, tool, format, editorTargets])

  const runJob = useCallback(async () => {
    if (running || files.length === 0) return
    if (ctaDisabledReason) {
      toast.warning(ctaDisabledReason)
      return
    }

    // Plan de procesamiento por archivo (recorte ajustado a la duración real)
    function planForFile(f: MediaFile, idx: number): { args: string[]; outName: string; outExt: string; mime: string } {
      const used = new Set<string>()

      if (tool === 'subtitles' && subtitle) {
        const container = f.ext === 'mkv' ? 'mkv' : 'mp4'
        const outName = outputName(f.base, container, 'subtitulado', used)
        const args = buildSubtitleEmbedArgs(`in${idx}.${f.ext}`, 'subs.srt', `out${idx}.${container}`, container)
        return { args, outName, outExt: container, mime: container === 'mp4' ? 'video/mp4' : 'video/x-matroska' }
      }

      if (tool === 'metadata') {
        const suffix = 'editado'
        const applyEffects = effectsActive(effects)
        if (!applyEffects) {
          const outName = outputName(f.base, f.ext, suffix, used)
          const args = buildMetadataCopyArgs(`in${idx}.${f.ext}`, `out${idx}.${f.ext}`, metadata)
          return { args, outName, outExt: f.ext, mime: f.kind === 'video' ? 'video/mp4' : 'audio/mpeg' }
        }
        // Con efectos hay que recodificar manteniendo el formato si es posible
        let def = findFormatByExt(f.ext)
        if (!def || def.kind !== f.kind) def = f.kind === 'video' ? VIDEO_FORMATS[0] : AUDIO_FORMATS[0]
        const outName = outputName(f.base, def.ext, suffix, used)
        const args = buildConversionArgs({
          inputName: `in${idx}.${f.ext}`,
          outputName: `out${idx}.${def.ext}`,
          format: def,
          quality: 'media',
          effects,
          metadata,
          duration: f.duration,
        })
        return { args, outName, outExt: def.ext, mime: def.mime }
      }

      // Editor de audio: recorte + mejoras + karaoke + fundidos
      if (tool === 'audioeditor') {
        const spec = editorOutputSpec(f.ext, editor.outFormat)
        let opts = editor
        if (editor.useCut && f.duration != null && f.duration > 0) {
          const end = Math.min(editor.cutEnd, f.duration)
          const start = Math.max(0, Math.min(editor.cutStart, end - 0.5))
          opts = { ...editor, cutStart: start, cutEnd: Math.max(start + 0.1, end) }
        }
        const outName = outputName(f.base, spec.ext, 'editado', used)
        const args = buildAudioEditorArgs({
          inputName: `in${idx}.${f.ext}`,
          outputName: `out${idx}.${spec.ext}`,
          options: opts,
          duration: f.duration,
          codecArgs: spec.codecArgs,
        })
        return { args, outName, outExt: spec.ext, mime: spec.mime }
      }

      // Convertir (formato elegido) — los archivos de video aceptan formatos de audio (extracción)
      const def = format ?? AUDIO_FORMATS[0]
      const outName = outputName(f.base, def.ext, 'convertido', used)
      const args = buildConversionArgs({
        inputName: `in${idx}.${f.ext}`,
        outputName: `out${idx}.${def.ext}`,
        format: def,
        quality,
        effects,
        metadata,
        duration: f.duration,
      })
      return { args, outName, outExt: def.ext, mime: def.mime }
    }

    setRunning(true)
    setResults([])
    setFileProgress(0)
    setEngineProgress(engine.ready ? 1 : 0)

    try {
      if (!engine.ready) {
        setEngineState('loading')
        setCurrentLabel('Preparando motor local…')
        await engine.load({
          onEngineProgress: (p) => {
            setEngineProgress(p)
            if (p >= 1) setEngineState('ready')
          },
        })
        setEngineState('ready')
      }
      engine.setLogCb((m) => {
        logRef.current = m
        if (import.meta.env.DEV) console.debug('[ffmpeg]', m)
      })

      if (tool === 'subtitles' && subtitle) {
        await engine.writeFile('subs.srt', new TextEncoder().encode(toSRT(subtitle.cues)))
      }

      // Filtra compatibles: formato de video solo procesa archivos de video
      const targets =
        tool === 'convert' && format?.kind === 'video'
          ? files.filter((f) => f.kind === 'video')
          : tool === 'audioeditor'
            ? editorTargets
            : files

      if (targets.length === 0) {
        toast.warning('Ninguno de los archivos en cola es compatible con este formato de salida.')
        return
      }

      const newResults: ResultFile[] = []

      for (let i = 0; i < targets.length; i++) {
        const f = targets[i]
        setCurrentLabel(`Procesando ${f.name} (${i + 1} de ${targets.length})`)
        const plan = planForFile(f, i)

        await engine.writeFile(`in${i}.${f.ext}`, new Uint8Array(await f.file.arrayBuffer()))
        await engine.run(plan.args, (p) => setFileProgress(p))
        const data = await engine.readFile(`out${i}.${plan.outExt}`)

        const blob = new Blob([data as BlobPart], { type: plan.mime })
        newResults.push({
          id: `${f.id}-${Date.now()}`,
          sourceName: f.name,
          outputName: plan.outName,
          url: URL.createObjectURL(blob),
          size: blob.size,
          originalSize: f.size,
          kind: plan.mime.startsWith('video/') ? 'video' : 'audio',
        })
        setResults([...newResults])
        setFileProgress(0)

        engine.removeFile(`in${i}.${f.ext}`)
        engine.removeFile(`out${i}.${plan.outExt}`)
      }

      toast.success(`¡Listo! ${newResults.length} archivo(s) procesado(s) con éxito.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      if (/abort/i.test(msg) || engineState === 'idle') {
        toast.info('Procesamiento cancelado.')
      } else {
        console.error(err)
        toast.error(`Error durante el procesamiento: ${msg}`)
      }
    } finally {
      engine.setLogCb(null)
      setRunning(false)
      setFileProgress(0)
      setCurrentLabel('')
    }
  }, [running, files, ctaDisabledReason, tool, subtitle, format, quality, metadata, effects, editor, editorTargets, engineState])

  const cancelJob = useCallback(() => {
    engine.cancel()
    setEngineState('idle')
    setEngineProgress(0)
    toast.info('Procesamiento cancelado. El motor se recargará la próxima vez.')
  }, [])

  /* ---------- Render ---------- */

  return (
    <div className="sc-theme flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader engineState={engineState} engineProgress={engineProgress} />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 pb-14 pt-8">
        {/* Presentación */}
        <section className="space-y-3 text-center">
          <h2 className="mx-auto max-w-2xl text-balance text-2xl font-black tracking-tight sm:text-3xl">
            El conversor{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              todo-en-uno
            </span>{' '}
            de audio y video
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Convierte entre todos los formatos, incrusta subtítulos, edita la información y ahora
            edita el audio: recorta fragmentos, elimina la voz de las canciones y mejora su calidad.
            Sin registros, sin límites y sin subir nada a internet.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" /> Privado: procesamiento local
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" /> Motor FFmpeg WebAssembly
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
              <HeartHandshake className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" /> Gratis y sin marcas de agua
            </span>
          </div>
        </section>

        {/* Paso 1: cargar */}
        <DropZone onFiles={addFiles} disabled={running} />

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FileQueue files={files} onRemove={removeFile} onClear={clearFiles} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paso 2: herramienta */}
        <ToolMenu value={tool} onChange={setTool} hasFiles={files.length > 0} />

        {/* Paso 3: panel activo */}
        <AnimatePresence mode="wait">
          {tool === 'convert' && (
            <motion.div
              key="convert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ConvertPanel
                files={files}
                format={format}
                onFormat={setFormat}
                quality={quality}
                onQuality={setQuality}
              />
              <div className="mt-4">
                <EffectsSection
                  value={effects}
                  onChange={setEffects}
                  referenceDuration={files[0]?.duration ?? null}
                />
              </div>
            </motion.div>
          )}
          {tool === 'subtitles' && (
            <motion.div
              key="subtitles"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SubtitlePanel files={files} subtitle={subtitle} onSubtitle={setSubtitle} />
            </motion.div>
          )}
          {tool === 'metadata' && (
            <motion.div
              key="metadata"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <MetadataPanel
                files={files}
                metadata={metadata}
                onMetadata={setMetadata}
                effects={effects}
                onEffects={setEffects}
              />
            </motion.div>
          )}
          {tool === 'audioeditor' && (
            <motion.div
              key="audioeditor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AudioEditorPanel
                files={files}
                selectedId={editorFileId ?? files[0]?.id ?? null}
                onSelectFile={setEditorFileId}
                options={editor}
                onOptions={setEditor}
                applyToAll={editorApplyAll}
                onApplyToAll={setEditorApplyAll}
                running={running}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de acción principal */}
        <Tip
          tip={ctaDisabledReason ?? 'Inicia el procesamiento de todos los archivos en cola.'}
          side="top"
          wrap={!!ctaDisabledReason}
        >
          <button
            type="button"
            onClick={runJob}
            disabled={!!ctaDisabledReason}
            aria-label={ctaLabel}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] text-base font-black tracking-wide text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:bg-[position:100%_0] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:h-16 sm:text-lg"
          >
            <Wand2 className="h-5 w-5" aria-hidden="true" />
            {ctaLabel}
          </button>
        </Tip>

        {running && (
          <ProgressPanel
            overall={
              engineState === 'loading'
                ? engineProgress * 100
                : Math.min(100, ((currentFileIndex() + fileProgress) / Math.max(1, currentTargetCount())) * 100)
            }
            currentLabel={engineState === 'loading' ? `Descargando motor local… ${Math.round(engineProgress * 100)}%` : currentLabel}
            logLine={logLine}
            onCancel={cancelJob}
          />
        )}

        <ResultsPanel
          results={results}
          onClear={() => {
            results.forEach((r) => URL.revokeObjectURL(r.url))
            setResults([])
          }}
        />
      </main>

      <footer className="mt-auto border-t border-border/60 bg-card/40">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 px-4 py-6 text-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="text-xs font-semibold">Audio y Video Super Converter</p>
          <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Procesamiento 100% local con FFmpeg compilado a WebAssembly — tus archivos nunca salen de tu
            dispositivo. Sin registros, sin límites, sin marcas de agua.
          </p>
        </div>
      </footer>
    </div>
  )

  /* Helpers internos de render */
  function currentFileIndex(): number {
    // Deriva el índice actual desde la etiqueta "Procesando X (i de N)"
    const m = currentLabel.match(/\((\d+) de (\d+)\)/)
    return m ? parseInt(m[1], 10) - 1 : 0
  }
  function currentTargetCount(): number {
    const m = currentLabel.match(/\((\d+) de (\d+)\)/)
    if (m) return parseInt(m[2], 10)
    return files.length || 1
  }
}

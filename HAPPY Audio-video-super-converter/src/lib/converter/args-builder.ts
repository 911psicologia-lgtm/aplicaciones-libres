// Construcción de argumentos para el motor FFmpeg
import type { EffectsOptions, MetadataOptions, QualityId } from '@/types/converter'
import { QUALITY_PRESETS, type FormatDef } from '@/lib/converter/formats'

function num(n: number): string {
  return String(Math.round(n * 1000) / 1000)
}

/** Filtros de audio: velocidad, volumen y fundidos */
export function buildAudioFilters(ef: EffectsOptions, duration: number | null): string | null {
  const parts: string[] = []
  if (ef.speed !== 1) {
    const sp = Math.min(2, Math.max(0.5, ef.speed))
    parts.push(`atempo=${num(sp)}`)
  }
  if (ef.volume !== 1) parts.push(`volume=${num(ef.volume)}`)
  if (ef.fadeIn > 0) parts.push(`afade=t=in:st=0:d=${num(ef.fadeIn)}`)
  if (ef.fadeOut > 0 && duration != null && duration > 0) {
    const speed = Math.min(2, Math.max(0.5, ef.speed))
    const effDur = duration / speed
    const st = Math.max(0, effDur - ef.fadeOut)
    parts.push(`afade=t=out:st=${num(st)}:d=${num(ef.fadeOut)}`)
  }
  return parts.length > 0 ? parts.join(',') : null
}

/** Filtros de video: velocidad y fundidos */
export function buildVideoFilters(ef: EffectsOptions, duration: number | null): string | null {
  const parts: string[] = []
  if (ef.speed !== 1) {
    const sp = Math.min(2, Math.max(0.5, ef.speed))
    parts.push(`setpts=PTS/${num(sp)}`)
  }
  if (ef.fadeIn > 0) parts.push(`fade=t=in:st=0:d=${num(ef.fadeIn)}`)
  if (ef.fadeOut > 0 && duration != null && duration > 0) {
    const speed = Math.min(2, Math.max(0.5, ef.speed))
    const effDur = duration / speed
    const st = Math.max(0, effDur - ef.fadeOut)
    parts.push(`fade=t=out:st=${num(st)}:d=${num(ef.fadeOut)}`)
  }
  return parts.length > 0 ? parts.join(',') : null
}

function metadataArgs(metadata: MetadataOptions): string[] {
  const args: string[] = []
  const map: Array<[string, string]> = [
    ['title', metadata.title],
    ['artist', metadata.artist],
    ['album', metadata.album],
    ['genre', metadata.genre],
    ['date', metadata.year],
    ['comment', metadata.comment],
  ]
  for (const [key, value] of map) {
    const v = value.trim()
    if (v !== '') args.push('-metadata', `${key}=${v}`)
  }
  return args
}

export interface PlanOptions {
  inputName: string
  outputName: string
  format: FormatDef
  quality: QualityId
  effects: EffectsOptions
  metadata: MetadataOptions
  duration: number | null
}

/** Plan completo: recorte + códecs del formato + filtros + metadatos */
export function buildConversionArgs(o: PlanOptions): string[] {
  const args: string[] = []
  const ef = o.effects
  const preset = QUALITY_PRESETS[o.quality]

  // Recorte (búsqueda rápida al inicio del archivo)
  if (ef.trimStart != null && ef.trimStart > 0) args.push('-ss', num(ef.trimStart))
  if (ef.trimEnd != null) {
    const start = ef.trimStart ?? 0
    const dur = ef.trimEnd - start
    if (dur > 0.1) args.push('-t', num(dur))
  }

  args.push('-i', o.inputName)

  const isAudioOut = o.format.kind === 'audio'
  const speed = Math.min(2, Math.max(0.5, ef.speed))
  const effDur = o.duration != null ? o.duration / speed : null

  if (isAudioOut) {
    args.push('-vn')
    args.push(...(o.format.audioCodecArgs?.(preset.audioBitrate) ?? ['-c:a', 'aac']))
    const af = buildAudioFilters(ef, effDur)
    if (af) args.push('-af', af)
  } else if (o.format.id === 'gif') {
    args.push('-vf', 'fps=12,scale=480:-2:flags=lanczos', '-loop', '0', '-an')
  } else {
    args.push(...(o.format.videoCodecArgs?.(o.quality) ?? []))
    const vf = buildVideoFilters(ef, effDur)
    if (vf) args.push('-vf', vf)
    const af = buildAudioFilters(ef, effDur)
    if (af) args.push('-af', af)
  }

  args.push(...metadataArgs(o.metadata))
  args.push('-y', o.outputName)
  return args
}

/** Edición sin cambiar de formato: copia directa (rápido y sin pérdida) */
export function buildMetadataCopyArgs(inputName: string, outputName: string, metadata: MetadataOptions): string[] {
  return ['-i', inputName, '-c', 'copy', ...metadataArgs(metadata), '-y', outputName]
}

/** Incrustación de subtítulos como pista suave (soft subs) */
export function buildSubtitleEmbedArgs(
  inputName: string,
  subsName: string,
  outputName: string,
  container: 'mp4' | 'mkv'
): string[] {
  const codec = container === 'mp4' ? 'mov_text' : 'srt'
  return [
    '-i', inputName,
    '-i', subsName,
    '-map', '0:v:0',
    '-map', '0:a:0?',
    '-map', '1:0',
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-c:s', codec,
    '-metadata:s:s:0', 'language=spa',
    '-metadata:s:s:0', 'title=Español',
    '-y', outputName,
  ]
}

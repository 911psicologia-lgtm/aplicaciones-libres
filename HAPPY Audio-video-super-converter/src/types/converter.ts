// Tipos compartidos de Audio y Video Super Converter

export type MediaKind = 'audio' | 'video'

export type ToolId = 'convert' | 'subtitles' | 'metadata' | 'audioeditor'

export type QualityId = 'alta' | 'media' | 'baja'

export interface MediaFile {
  id: string
  file: File
  name: string
  base: string
  ext: string
  kind: MediaKind
  size: number
  duration: number | null
  width: number | null
  height: number | null
  url: string
}

export interface SubtitleCue {
  start: number
  end: number
  text: string
}

export interface LoadedSubtitle {
  name: string
  size: number
  cues: SubtitleCue[]
}

export interface MetadataOptions {
  title: string
  artist: string
  album: string
  genre: string
  year: string
  comment: string
}

export const EMPTY_METADATA: MetadataOptions = {
  title: '',
  artist: '',
  album: '',
  genre: '',
  year: '',
  comment: '',
}

export interface EffectsOptions {
  volume: number // 0 - 2 (1 = 100%)
  speed: number // 0.5 - 2 (1 = normal)
  fadeIn: number // segundos, 0 = desactivado
  fadeOut: number // segundos, 0 = desactivado
  trimStart: number | null // segundos
  trimEnd: number | null // segundos
}

export const DEFAULT_EFFECTS: EffectsOptions = {
  volume: 1,
  speed: 1,
  fadeIn: 0,
  fadeOut: 0,
  trimStart: null,
  trimEnd: null,
}

export function effectsActive(e: EffectsOptions): boolean {
  return (
    e.volume !== 1 ||
    e.speed !== 1 ||
    e.fadeIn > 0 ||
    e.fadeOut > 0 ||
    e.trimStart != null ||
    e.trimEnd != null
  )
}

export interface ResultFile {
  id: string
  sourceName: string
  outputName: string
  url: string
  size: number
  originalSize: number
  kind: MediaKind
  error?: string
}

/* ---------- Editor de Audio ---------- */

/** Qué hacer con la voz: original, solo música (karaoke) o solo voz (experimental) */
export type VocalMode = 'original' | 'music' | 'vocals'

/** Formato de salida del editor: mismo formato, MP3, WAV, FLAC o M4A */
export type EditorOutputFormat = 'same' | 'mp3' | 'wav' | 'flac' | 'm4a'

export interface AudioEditorOptions {
  // Recorte
  useCut: boolean // hay una selección activa
  cutMode: 'keep' | 'remove' // conservar solo el fragmento / eliminar el fragmento
  cutStart: number // segundos
  cutEnd: number // segundos
  // Fundidos
  autoFades: boolean // micro-fundidos automáticos en los cortes (evita saltos bruscos)
  autoFadeDur: number // segundos (0.05 – 2)
  fadeIn: number // segundos, 0 = desactivado
  fadeOut: number // segundos, 0 = desactivado
  // Mejora de calidad
  normalize: boolean // normaliza al volumen estándar de streaming (-14 LUFS)
  denoise: boolean // reduce el ruido de fondo (siseo, zumbido)
  clarity: boolean // realza la claridad de la voz (presencia)
  bassBoost: number // dB, -6 a +6 (0 = neutro)
  trebleBoost: number // dB, -6 a +6 (0 = neutro)
  compressor: boolean // compresión suave: iguala volúmenes muy distintos
  // Voz y música
  vocalMode: VocalMode
  // Salida
  outFormat: EditorOutputFormat
}

export const DEFAULT_EDITOR_OPTIONS: AudioEditorOptions = {
  useCut: false,
  cutMode: 'keep',
  cutStart: 0,
  cutEnd: 0,
  autoFades: true,
  autoFadeDur: 0.3,
  fadeIn: 0,
  fadeOut: 0,
  normalize: false,
  denoise: false,
  clarity: false,
  bassBoost: 0,
  trebleBoost: 0,
  compressor: false,
  vocalMode: 'original',
  outFormat: 'same',
}

/** Indica si hay alguna edición activa (para habilitar el botón principal) */
export function editorActive(e: AudioEditorOptions): boolean {
  return (
    e.useCut ||
    e.fadeIn > 0 ||
    e.fadeOut > 0 ||
    e.normalize ||
    e.denoise ||
    e.clarity ||
    e.bassBoost !== 0 ||
    e.trebleBoost !== 0 ||
    e.compressor ||
    e.vocalMode !== 'original' ||
    e.outFormat !== 'same'
  )
}

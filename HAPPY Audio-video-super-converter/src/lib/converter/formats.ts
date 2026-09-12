// Definición de formatos soportados por el motor FFmpeg
import type { MediaKind, QualityId } from '@/types/converter'

export interface FormatDef {
  id: string
  label: string
  ext: string
  mime: string
  kind: MediaKind
  description: string
  audioCodecArgs?: (bitrateKbps: number) => string[]
  videoCodecArgs?: (quality: QualityId) => string[]
}

export interface QualityPreset {
  label: string
  crf: number
  audioBitrate: number
  webmVideoBitrate: string
  aviQScale: number
  description: string
}

export const QUALITY_PRESETS: Record<QualityId, QualityPreset> = {
  alta: {
    label: 'Alta',
    crf: 20,
    audioBitrate: 320,
    webmVideoBitrate: '2500k',
    aviQScale: 4,
    description: 'Máxima fidelidad — archivos más grandes. Ideal para archivar.',
  },
  media: {
    label: 'Media',
    crf: 24,
    audioBitrate: 192,
    webmVideoBitrate: '1200k',
    aviQScale: 6,
    description: 'Equilibrio perfecto entre calidad y tamaño de archivo.',
  },
  baja: {
    label: 'Baja',
    crf: 28,
    audioBitrate: 128,
    webmVideoBitrate: '700k',
    aviQScale: 9,
    description: 'Archivos livianos — ideal para compartir por mensajería.',
  },
}

export const AUDIO_FORMATS: FormatDef[] = [
  {
    id: 'mp3',
    label: 'MP3',
    ext: 'mp3',
    mime: 'audio/mpeg',
    kind: 'audio',
    description: 'El formato más compatible del mundo. Ideal para música y podcasts.',
    audioCodecArgs: (b) => ['-c:a', 'libmp3lame', '-b:a', `${b}k`],
  },
  {
    id: 'wav',
    label: 'WAV',
    ext: 'wav',
    mime: 'audio/wav',
    kind: 'audio',
    description: 'Sin compresión. Calidad de estudio, archivos grandes.',
    audioCodecArgs: () => ['-c:a', 'pcm_s16le'],
  },
  {
    id: 'ogg',
    label: 'OGG',
    ext: 'ogg',
    mime: 'audio/ogg',
    kind: 'audio',
    description: 'Código abierto con excelente compresión y calidad.',
    audioCodecArgs: (b) => ['-c:a', 'libvorbis', '-b:a', `${b}k`],
  },
  {
    id: 'opus',
    label: 'OPUS',
    ext: 'opus',
    mime: 'audio/ogg',
    kind: 'audio',
    description: 'Compresión moderna — excelente para voz y streaming.',
    audioCodecArgs: (b) => ['-c:a', 'libopus', '-b:a', `${b}k`],
  },
  {
    id: 'flac',
    label: 'FLAC',
    ext: 'flac',
    mime: 'audio/flac',
    kind: 'audio',
    description: 'Compresión sin pérdida — conserva la calidad original al 100%.',
    audioCodecArgs: () => ['-c:a', 'flac'],
  },
  {
    id: 'm4a',
    label: 'M4A',
    ext: 'm4a',
    mime: 'audio/mp4',
    kind: 'audio',
    description: 'Formato nativo de Apple/iTunes con códec AAC.',
    audioCodecArgs: (b) => ['-c:a', 'aac', '-b:a', `${b}k`],
  },
  {
    id: 'aac',
    label: 'AAC',
    ext: 'aac',
    mime: 'audio/aac',
    kind: 'audio',
    description: 'Audio AAC puro — muy buena calidad por tamaño.',
    audioCodecArgs: (b) => ['-c:a', 'aac', '-b:a', `${b}k`],
  },
]

export const VIDEO_FORMATS: FormatDef[] = [
  {
    id: 'mp4',
    label: 'MP4',
    ext: 'mp4',
    mime: 'video/mp4',
    kind: 'video',
    description: 'Estándar universal (H.264 + AAC). Funciona en todos lados.',
    videoCodecArgs: (q) => {
      const p = QUALITY_PRESETS[q]
      return [
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', String(p.crf),
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', `${Math.min(p.audioBitrate, 192)}k`,
        '-movflags', '+faststart',
      ]
    },
  },
  {
    id: 'mov',
    label: 'MOV',
    ext: 'mov',
    mime: 'video/quicktime',
    kind: 'video',
    description: 'Formato de Apple QuickTime (H.264). Ideal para edición en Mac.',
    videoCodecArgs: (q) => {
      const p = QUALITY_PRESETS[q]
      return [
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', String(p.crf),
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', `${Math.min(p.audioBitrate, 192)}k`,
      ]
    },
  },
  {
    id: 'mkv',
    label: 'MKV',
    ext: 'mkv',
    mime: 'video/x-matroska',
    kind: 'video',
    description: 'Contenedor versátil que admite múltiples pistas y subtítulos.',
    videoCodecArgs: (q) => {
      const p = QUALITY_PRESETS[q]
      return [
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', String(p.crf),
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', `${Math.min(p.audioBitrate, 192)}k`,
      ]
    },
  },
  {
    id: 'webm',
    label: 'WEBM',
    ext: 'webm',
    mime: 'video/webm',
    kind: 'video',
    description: 'Nativo de la web (VP8 + Opus). Liviano para páginas y YouTube.',
    videoCodecArgs: (q) => {
      const p = QUALITY_PRESETS[q]
      return ['-c:v', 'libvpx', '-b:v', p.webmVideoBitrate, '-c:a', 'libopus', '-b:a', '128k']
    },
  },
  {
    id: 'avi',
    label: 'AVI',
    ext: 'avi',
    mime: 'video/x-msvideo',
    kind: 'video',
    description: 'Clásico de Windows — máxima compatibilidad con reproductores antiguos.',
    videoCodecArgs: (q) => {
      const p = QUALITY_PRESETS[q]
      return [
        '-c:v', 'mpeg4',
        '-qscale:v', String(p.aviQScale),
        '-c:a', 'libmp3lame',
        '-b:a', `${Math.min(p.audioBitrate, 192)}k`,
      ]
    },
  },
  {
    id: 'gif',
    label: 'GIF',
    ext: 'gif',
    mime: 'image/gif',
    kind: 'video',
    description: 'Animación en bucle sin audio — perfecto para redes y memes.',
    videoCodecArgs: () => ['-loop', '0'],
  },
]

export const ALL_FORMATS = [...AUDIO_FORMATS, ...VIDEO_FORMATS]

export function findFormatByExt(ext: string): FormatDef | null {
  const e = ext.toLowerCase()
  return ALL_FORMATS.find((f) => f.ext === e) ?? null
}

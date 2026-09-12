// Motor del Editor de Audio — recorte, mejora de calidad, karaoke y fundidos
// Construye los argumentos para FFmpeg WASM usando solo filtros nativos.
import type { AudioEditorOptions, EditorOutputFormat } from '@/types/converter'

function num(n: number): string {
  return String(Math.round(n * 1000) / 1000)
}

export interface EditorOutputSpec {
  ext: string
  mime: string
  codecArgs: string[]
}

/** Códec y extensión de salida según el formato elegido (o el original). */
export function editorOutputSpec(ext: string, out: EditorOutputFormat): EditorOutputSpec {
  switch (out) {
    case 'mp3':
      return { ext: 'mp3', mime: 'audio/mpeg', codecArgs: ['-c:a', 'libmp3lame', '-b:a', '320k'] }
    case 'wav':
      return { ext: 'wav', mime: 'audio/wav', codecArgs: ['-c:a', 'pcm_s16le'] }
    case 'flac':
      return { ext: 'flac', mime: 'audio/flac', codecArgs: ['-c:a', 'flac', '-compression_level', '8'] }
    case 'm4a':
      return { ext: 'm4a', mime: 'audio/mp4', codecArgs: ['-c:a', 'aac', '-b:a', '256k'] }
    case 'same':
    default: {
      const e = ext.toLowerCase()
      if (e === 'mp3') return { ext: 'mp3', mime: 'audio/mpeg', codecArgs: ['-c:a', 'libmp3lame', '-b:a', '320k'] }
      if (e === 'wav') return { ext: 'wav', mime: 'audio/wav', codecArgs: ['-c:a', 'pcm_s16le'] }
      if (e === 'flac') return { ext: 'flac', mime: 'audio/flac', codecArgs: ['-c:a', 'flac'] }
      if (e === 'ogg') return { ext: 'ogg', mime: 'audio/ogg', codecArgs: ['-c:a', 'libvorbis', '-q:a', '8'] }
      if (e === 'opus') return { ext: 'opus', mime: 'audio/ogg', codecArgs: ['-c:a', 'libopus', '-b:a', '192k'] }
      if (e === 'm4a') return { ext: 'm4a', mime: 'audio/mp4', codecArgs: ['-c:a', 'aac', '-b:a', '256k'] }
      if (e === 'aac') return { ext: 'aac', mime: 'audio/aac', codecArgs: ['-c:a', 'aac', '-b:a', '256k'] }
      if (e === 'aiff' || e === 'aif') return { ext: 'aiff', mime: 'audio/aiff', codecArgs: ['-c:a', 'pcm_s16be'] }
      // Formatos poco comunes o videos → MP3 de alta calidad
      return { ext: 'mp3', mime: 'audio/mpeg', codecArgs: ['-c:a', 'libmp3lame', '-b:a', '320k'] }
    }
  }
}

export interface EditorPlan {
  inputName: string
  outputName: string
  options: AudioEditorOptions
  duration: number | null // duración del archivo fuente en segundos
  codecArgs: string[]
}

/**
 * Construye los argumentos completos del editor:
 *  - Corte por búsqueda rápida (conservar) o grafo atrim+concat (eliminar).
 *  - Karaoke: cancelación de fase estéreo conservando los graves (bajo/bombo).
 *  - Solo voz (experimental): canal central + banda de frecuencias de la voz.
 *  - Mejoras: denoise → claridad → graves → agudos → compresor → normalizar.
 *  - Fundidos manuales y micro-fundidos automáticos en los puntos de corte.
 */
export function buildAudioEditorArgs(p: EditorPlan): string[] {
  const op = p.options
  const dur = p.duration
  const args: string[] = []
  const CURVE = ':curve=qsin'

  // ¿El recorte tiene sentido?
  const cutValid = op.useCut && op.cutEnd - op.cutStart > 0.1 && (dur == null || op.cutStart < dur - 0.05)
  const removeValid =
    cutValid && op.cutMode === 'remove' && (dur == null || op.cutEnd < dur - 0.05)

  // Corte rápido por búsqueda (modo conservar)
  if (cutValid && op.cutMode === 'keep') {
    const start = Math.max(0, op.cutStart)
    args.push('-ss', num(start))
    if (dur == null || op.cutEnd < dur) args.push('-t', num(op.cutEnd - start))
  }

  args.push('-i', p.inputName)

  // Duración efectiva de la salida (para posicionar el fundido final)
  let outDur: number | null = dur
  if (cutValid) {
    if (op.cutMode === 'keep') outDur = op.cutEnd - Math.max(0, op.cutStart)
    else if (removeValid && dur != null) outDur = dur - (op.cutEnd - op.cutStart)
  }

  const autoOn = op.autoFades && cutValid
  const fIn = op.fadeIn > 0 ? op.fadeIn : autoOn ? op.autoFadeDur : 0
  const fOut = op.fadeOut > 0 ? op.fadeOut : autoOn ? op.autoFadeDur : 0

  // Cadena de mejora de calidad (orden importa: ruido → EQ → dinámica → nivel)
  const chain: string[] = []
  if (op.vocalMode === 'vocals') {
    // Aproximación experimental: canal central (voz) dentro de la banda de voz
    chain.push(
      'aformat=channel_layouts=stereo',
      'pan=mono|c0=0.5*c0+0.5*c1',
      'highpass=f=180',
      'lowpass=f=3800'
    )
  }
  if (op.denoise) chain.push('afftdn=nr=12:nf=-28')
  if (op.clarity) chain.push('equalizer=f=3200:width_type=q:w=1.2:g=2')
  if (op.bassBoost !== 0) chain.push(`bass=g=${num(op.bassBoost)}:f=110:width_type=q:w=0.8`)
  if (op.trebleBoost !== 0) chain.push(`treble=g=${num(op.trebleBoost)}:f=6500:width_type=q:w=0.8`)
  if (op.compressor) chain.push('acompressor=threshold=-20dB:ratio=2:attack=15:release=200:makeup=2')
  if (op.normalize) chain.push('loudnorm=I=-14:TP=-1.5:LRA=11', 'aresample=44100')

  // Grafo (solo cuando se necesita: eliminar fragmento y/o karaoke)
  const graph: string[] = []
  let cur = '0:a'
  const fades: string[] = []

  if (removeValid) {
    const s = Math.max(0, op.cutStart)
    const e = op.cutEnd
    if (s <= 0.05) {
      graph.push(`[0:a]atrim=start=${num(e)},asetpts=PTS-STARTPTS[rc]`)
    } else {
      graph.push(
        '[0:a]asplit=2[ra][rb]',
        `[ra]atrim=start=0:end=${num(s)},asetpts=PTS-STARTPTS[r1]`,
        `[rb]atrim=start=${num(e)},asetpts=PTS-STARTPTS[r2]`,
        '[r1][r2]concat=n=2:v=0:a=1[rc]'
      )
      // Micro-fundidos en la unión para que el empalme no se note
      if (autoOn && s > op.autoFadeDur) {
        fades.push(`afade=t=out:st=${num(s - op.autoFadeDur)}:d=${num(op.autoFadeDur)}${CURVE}`)
        fades.push(`afade=t=in:st=${num(s)}:d=${num(op.autoFadeDur)}${CURVE}`)
      }
    }
    cur = 'rc'
  }

  if (op.vocalMode === 'music') {
    // Karaoke: (I − D) elimina la voz centrada; se suman los graves originales
    // para conservar bajo y bombo. El limitador evita saturaciones.
    graph.push(
      `[${cur}]aformat=channel_layouts=stereo,asplit=2[ka][kb]`,
      '[ka]pan=stereo|c0=c0-c1|c1=c1-c0[k1]',
      '[kb]pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1,lowpass=f=150[k2]',
      '[k1][k2]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.971:level=disabled[mu]'
    )
    cur = 'mu'
  }

  // Fundidos de los extremos del resultado
  if (fIn > 0) fades.unshift(`afade=t=in:st=0:d=${num(fIn)}${CURVE}`)
  if (fOut > 0 && outDur != null && outDur > fOut + 0.1) {
    fades.push(`afade=t=out:st=${num(outDur - fOut)}:d=${num(fOut)}${CURVE}`)
  }

  const all = [...chain, ...fades]

  if (graph.length > 0) {
    // Nota: tras una etiqueta NO va coma — [mu]filtro=... es la sintaxis válida
    const last = all.length > 0 ? `[${cur}]${all.join(',')}[aout]` : `[${cur}]anull[aout]`
    args.push('-filter_complex', [...graph, last].join(';'))
    args.push('-map', '[aout]')
  } else if (all.length > 0) {
    args.push('-af', all.join(','))
  } else {
    args.push('-map', '0:a:0')
  }

  args.push('-vn', ...p.codecArgs, '-y', p.outputName)
  return args
}

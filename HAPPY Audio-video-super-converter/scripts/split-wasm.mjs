#!/usr/bin/env node
// split-wasm.mjs — Divide public/ffmpeg/ffmpeg-core.wasm en 4 fragmentos binarios
// numerados y ordenados (part01…part04), cada uno menor de 10 MiB, y ELIMINA el
// .wasm original de public/ para que el WASM completo de ~32 MB nunca llegue a dist/
// (límite de 25 MiB por archivo en Cloudflare Pages).
//
// Uso:
//   node scripts/split-wasm.mjs
//
// El script imprime los tamaños y el SHA-256 para copiarlos en
// src/lib/converter/ffmpeg-client.ts (constantes WASM_PARTS / WASM_TOTAL_SIZE / WASM_SHA256).

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, rmSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const wasmPath = join(root, 'public', 'ffmpeg', 'ffmpeg-core.wasm')
const PARTS = 4
const MAX_PART = 10 * 1024 * 1024 // 10 MiB — margen bajo el límite de 25 MiB

if (!existsSync(wasmPath)) {
  console.error(
    `No existe ${wasmPath}.\n` +
      `Descarga de nuevo el núcleo @ffmpeg/core@0.12.6 (ffmpeg-core.wasm), colócalo ahí y vuelve a ejecutar este script.\n` +
      `Los fragmentos part01…part04 ya presentes en public/ffmpeg siguen siendo válidos.`
  )
  process.exit(1)
}

const buf = readFileSync(wasmPath)
const total = buf.byteLength

const sha = createHash('sha256').update(buf).digest('hex')
console.log(`ffmpeg-core.wasm original: ${total.toLocaleString('en')} bytes`)
console.log(`SHA-256: ${sha}`)

// Tamaño base de cada fragmento y reparto del resto
const baseSize = Math.floor(total / PARTS)
const remainder = total % PARTS

let offset = 0
const sizes = []
for (let i = 0; i < PARTS; i++) {
  const size = baseSize + (i < remainder ? 1 : 0)
  const name = `ffmpeg-core.wasm.part${String(i + 1).padStart(2, '0')}`
  const out = join(root, 'public', 'ffmpeg', name)
  writeFileSync(out, buf.subarray(offset, offset + size))
  const mb = size / (1024 * 1024)
  console.log(`  ${name}: ${size.toLocaleString('en')} bytes (${mb.toFixed(2)} MiB)${size >= MAX_PART ? '  ⚠ ¡supera 10 MiB!' : ''}`)
  sizes.push(size)
  offset += size
}

if (offset !== total) {
  console.error(`ERROR: la suma de fragmentos (${offset}) no coincide con el total (${total}).`)
  process.exit(1)
}

rmSync(wasmPath)
console.log(`OK: ${PARTS} fragmentos escritos y ffmpeg-core.wasm eliminado de public/ (no llegará a dist/).`)
console.log(`\nConstantes para ffmpeg-client.ts:`)
console.log(`  WASM_TOTAL_SIZE = ${total}`)
console.log(`  WASM_SHA256 = '${sha}'`)
console.log(`  WASM_PARTS sizes = [${sizes.join(', ')}]`)

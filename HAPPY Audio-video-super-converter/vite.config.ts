// Configuración de Vite — aplicación 100% estática para Cloudflare Pages
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  // base relativa: los recursos compilados se resuelven desde cualquier subruta
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    // el fragmento principal incluye la lógica del conversor
    chunkSizeWarningLimit: 1500,
  },
})

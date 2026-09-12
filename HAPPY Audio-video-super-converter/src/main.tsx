// Punto de entrada de la aplicación estática (Vite + React + TypeScript)
// Integra el contenido funcional del antiguo layout.tsx de Next.js:
// carga de estilos globales, tema esmeralda y notificaciones (Toaster).

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { Toaster } from '@/components/ui/sonner'

import './globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
)

#!/usr/bin/env bash
# PequeWorld v5 — arranque con servidor local (cámara activa)
cd "$(dirname "$0")"
echo "🌈 PequeWorld v5 — Inglés para Niños"
if command -v python3 >/dev/null 2>&1; then
  python3 servidor-local.py
elif command -v python >/dev/null 2>&1; then
  python servidor-local.py
else
  echo "⚠️ Python no encontrado. Abre index.html con doble clic (la cámara quedará desactivada)."
  read -r -p "Presiona Enter para salir..."
fi

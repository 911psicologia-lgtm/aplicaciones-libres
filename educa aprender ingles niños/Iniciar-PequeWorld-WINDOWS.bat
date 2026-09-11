@echo off
title PequeWorld - Servidor local
cd /d "%~dp0"
echo ============================================
echo   🌈 PequeWorld v5 - Inglés para Niños
echo   Iniciando servidor local (camara activa)
echo ============================================
where py >nul 2>nul && (set PY=py) || (set PY=python)
%PY% servidor-local.py
pause

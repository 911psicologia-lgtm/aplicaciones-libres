@echo off
where py >nul 2>nul
if %errorlevel%==0 (
  start "Starfall Frontier" http://localhost:8080
  py -m http.server 8080
) else (
  echo Python no esta instalado. Puedes abrir index.html directamente en el navegador.
  pause
)

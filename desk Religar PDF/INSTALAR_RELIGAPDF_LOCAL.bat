@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo =====================================================
echo  ReligaPDF Local v2.0 -- Instalacion neutra
echo  Sin Node.js, sin npm, sin descarga de dependencias
echo =====================================================
echo.

if not exist "%~dp0app\index.html" (
  echo ERROR: No se encuentra la carpeta app completa.
  echo Extrae el ZIP completo antes de ejecutar este instalador.
  pause
  exit /b 1
)

set "TARGET=%LOCALAPPDATA%\ReligaPDF_Local_v2_0"
set "DESKTOP=%USERPROFILE%\Desktop"

echo [1/4] Cerrando residuos de versiones anteriores...
del /Q "%DESKTOP%\ReligaPDF*.lnk" >nul 2>nul
del /Q "%DESKTOP%\ReligaPDF*.bat" >nul 2>nul
for /d %%D in ("%LOCALAPPDATA%\ReligaPDF_*") do (
  if exist "%%~fD\" rmdir /S /Q "%%~fD" >nul 2>nul
)

echo [2/4] Copiando aplicacion local limpia...
mkdir "%TARGET%" >nul 2>nul
robocopy "%~dp0app" "%TARGET%\app" /E /NFL /NDL /NJH /NJS /NP >nul
if %ERRORLEVEL% GEQ 8 (
  echo ERROR: No se pudo copiar la aplicacion.
  echo Intenta ejecutar como usuario con permisos o usa EJECUTAR_SIN_INSTALAR.bat.
  pause
  exit /b 1
)
copy /Y "%~dp0ABRIR_RELIGAPDF.bat" "%TARGET%\ABRIR_RELIGAPDF.bat" >nul

echo [3/4] Creando acceso de apertura en el escritorio...
(
  echo @echo off
  echo chcp 65001 ^>nul
  echo call "%TARGET%\ABRIR_RELIGAPDF.bat"
) > "%DESKTOP%\ReligaPDF Local.bat"

echo [4/4] Abriendo ReligaPDF Local...
call "%TARGET%\ABRIR_RELIGAPDF.bat"

echo.
echo =====================================================
echo  Instalacion completada.
echo  Usa "ReligaPDF Local.bat" en el escritorio.
echo =====================================================
echo.
pause

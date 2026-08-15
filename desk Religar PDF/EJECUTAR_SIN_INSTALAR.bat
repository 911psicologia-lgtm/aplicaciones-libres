@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "BASE=%~dp0"
set "APP=%BASE%app\index.html"
if not exist "%APP%" (
  echo ERROR: No se encuentra app\index.html.
  pause
  exit /b 1
)
set "EDGE1=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE2=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHROME1=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME2=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%EDGE1%" (start "" "%EDGE1%" "%APP%" & exit /b 0)
if exist "%EDGE2%" (start "" "%EDGE2%" "%APP%" & exit /b 0)
if exist "%CHROME1%" (start "" "%CHROME1%" "%APP%" & exit /b 0)
if exist "%CHROME2%" (start "" "%CHROME2%" "%APP%" & exit /b 0)
start "" "%APP%"

@echo off
setlocal
cd /d "%~dp0"

set "PORT=8042"
set "URL=http://127.0.0.1:%PORT%/index.html?v=20260909-02"
set "PYTHON=C:\Python314\python.exe"
if not exist "%PYTHON%" set "PYTHON=python"

echo.
echo ICHKA Studio - Atelier du livre
echo Adresse : %URL%
echo.
echo Laisse cette fenetre ouverte pendant que tu utilises le studio.
echo Ferme-la pour arreter le serveur local.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "if(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue){exit 0}else{exit 1}" >nul 2>nul
if not errorlevel 1 (
  echo Le studio est deja lance. Ouverture de la page.
  rundll32 url.dll,FileProtocolHandler %URL%
  exit /b 0
)

start "" cmd /c "timeout /t 1 /nobreak >nul & rundll32 url.dll,FileProtocolHandler %URL%"
"%PYTHON%" -m http.server %PORT% --bind 127.0.0.1 --directory "%CD%"

echo.
echo Le serveur local est arrete.
pause

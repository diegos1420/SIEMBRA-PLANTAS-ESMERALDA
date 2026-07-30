@echo off
title Agroventure Capital - Logistica y Siembra
color 0A
echo ========================================================
echo   AGROVENTURE CAPITAL - FINCA LA ESMERALDA
echo   Iniciando Aplicacion de Siembra y Logistica...
echo ========================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [!] No se detecto la carpeta node_modules.
    echo [!] Instalando dependencias de Node.js... Por favor espera unos segundos.
    echo.
    call npm install
    echo.
)

echo [+] Abriendo servidor local en http://localhost:3000 ...
echo.
call npm run dev -- --open --port 3000

pause

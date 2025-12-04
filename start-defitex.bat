@echo off
title Defitex Portal - Unified Server
cd /d "%~dp0"
echo.
echo ========================================
echo   DEFITEX PORTAL - Starting Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the unified server
echo Starting Defitex server on http://localhost:4000
echo.
call node server.js

pause


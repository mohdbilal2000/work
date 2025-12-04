@echo off
title HR Admin Portal - Dev Server
cd /d "%~dp0"
echo ========================================
echo   HR Admin Portal Development Server
echo ========================================
echo.
echo Starting server on http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
call npm.cmd run dev
if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start!
    echo.
    pause
)


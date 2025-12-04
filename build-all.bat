@echo off
title Defitex - Build All Modules
cd /d "%~dp0"
echo.
echo ========================================
echo   DEFITEX - Building All Modules
echo ========================================
echo.

REM Build HR Admin
echo [1/2] Building HR Admin...
cd "HR admin"
call npm run build
if errorlevel 1 (
    echo ERROR: HR Admin build failed!
    pause
    exit /b 1
)
echo HR Admin built successfully!
cd ..
echo.

REM Build CSO
echo [2/2] Building CSO...
cd CSO
call npm run build
if errorlevel 1 (
    echo ERROR: CSO build failed!
    pause
    exit /b 1
)
echo CSO built successfully!
cd ..
echo.

echo ========================================
echo   All modules built successfully!
echo   Run start-defitex.bat to start server
echo ========================================
pause


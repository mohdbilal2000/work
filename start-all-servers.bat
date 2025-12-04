@echo off
title Defitex - Starting All Servers
cd /d "%~dp0"

echo.
echo ========================================
echo   DEFITEX - Starting All Servers
echo ========================================
echo.

set NODE_PATH="C:\Program Files\cursor\resources\app\resources\helpers\node.exe"

call :launch "CSO Server" "%~dp0CSO" "%NODE_PATH% node_modules\next\dist\bin\next dev"
timeout /t 2 /nobreak >nul

call :launch "HR Admin Backend" "%~dp0HR admin" "%NODE_PATH% server\index.js"
timeout /t 2 /nobreak >nul

call :launch "HR Admin Frontend" "%~dp0HR admin" "%NODE_PATH% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173"
timeout /t 2 /nobreak >nul

call :launch "CSM API" "%~dp0CSM\server" "%NODE_PATH% index.js"
timeout /t 2 /nobreak >nul

call :launch "CSM Frontend" "%~dp0CSM\client" "%NODE_PATH% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3002"
timeout /t 2 /nobreak >nul

call :launch "Agreement Portal" "%~dp0agreement\client" "%NODE_PATH% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3005"
timeout /t 2 /nobreak >nul

call :launch "Finance Portal" "%~dp0finance" "%NODE_PATH% node_modules\next\dist\bin\next dev -p 3006"
timeout /t 2 /nobreak >nul

call :launch "Operations Lead" "%~dp0operations\client" "%NODE_PATH% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3007"
timeout /t 2 /nobreak >nul

call :launch "CEO Suite" "%~dp0CEO\client" "%NODE_PATH% node_modules\vite\bin\vite.js --host 0.0.0.0 --port 3008"
timeout /t 2 /nobreak >nul

set "TECH_FILE_FOUND="
if exist "%~dp0Technical" (
    for /f "delims=" %%F in ('dir /b "%~dp0Technical" 2^>nul') do (
        set "TECH_FILE_FOUND=%%F"
        goto :techcheckdone
    )
    :techcheckdone
    if defined TECH_FILE_FOUND (
        echo Technical directory detected but start script is not configured. Please update start-all-servers.bat with Technical launch details.
    ) else (
        echo Skipping Technical Portal - no source files were found in the "Technical" folder.
    )
) else (
    echo Skipping Technical Portal - directory not found.
)

echo.
echo ========================================
echo   All available servers started!
echo ========================================
echo.
echo   CSO:             http://localhost:3000
echo   HR Admin:        http://localhost:5173
echo   HR API:          http://localhost:3001
echo   CSM API:         http://localhost:5000
echo   CSM Portal:      http://localhost:3002
echo   Agreements:      http://localhost:3005
echo   Finance:         http://localhost:3006
echo   Operation Lead:  http://localhost:3007
echo   CEO:             http://localhost:3008
echo.
echo Opening Defitex Portal...
start chrome "%~dp0index.html"

echo.
pause
goto :eof

:launch
set "TITLE=%~1"
set "TARGET=%~2"
set "COMMAND=%~3"
if not exist "%TARGET%" (
    echo Skipping %TITLE% - path not found: %TARGET%
    goto :eof
)
echo Starting %TITLE%...
start "%TITLE%" cmd /k "cd /d ""%TARGET%"" && %COMMAND%"
goto :eof
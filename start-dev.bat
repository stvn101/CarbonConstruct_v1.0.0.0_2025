@echo off
REM CarbonConstruct Development Server Quick Start (Windows)
REM This script automates the setup and launch of the development server

setlocal enabledelayedexpansion

echo ========================================================
echo       CarbonConstruct Development Server Setup
echo ========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js v18 or higher from https://nodejs.org/
    pause
    exit /b 1
)

REM Display Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected

REM Display npm version
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% detected
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Dependencies not found. Installing...
    echo This may take a few minutes on first run.
    echo.
    
    call npm install --legacy-peer-deps
    
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies
        echo Try running manually: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
    
    echo.
    echo [OK] Dependencies installed successfully
    echo.
) else (
    echo [OK] Dependencies already installed
    echo.
)

REM Start the development server
echo [INFO] Starting development server...
echo.
echo ========================================================
echo   Development server will be available at:
echo.
echo   http://localhost:8080
echo.
echo   Press Ctrl+C to stop the server
echo ========================================================
echo.

npm run dev

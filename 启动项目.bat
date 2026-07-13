@echo off
title Jira Clone - Task Manager

echo ========================================
echo   Jira Clone - Task Manager
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js first:
    echo https://nodejs.org/
    echo.
    echo Download LTS version, then run this file again
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check dependencies
if not exist "node_modules\" (
    echo [1/3] Installing dependencies, please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed!
) else (
    echo [OK] Dependencies already installed
)

echo.
echo [2/3] Ready, starting server...
echo.
echo ========================================
echo   Please open in browser:
echo   http://localhost:3000
echo ========================================
echo.

REM Start development server
call npm run dev

pause

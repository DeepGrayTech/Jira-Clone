@echo off
title Jira Clone - Task Manager

echo ========================================
echo   Jira Clone - Task Manager
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
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

REM [1/5] Check dependencies
if exist "node_modules\" goto deps_done
echo [1/5] Installing dependencies, please wait...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo.
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed!
goto deps_end
:deps_done
echo [1/5] Dependencies already installed
:deps_end

REM [2/5] Check .env configuration
if exist ".env" goto env_done
echo [2/5] Creating .env file...
set "NEXTAUTH_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%"
> .env echo DATABASE_URL="file:./dev.db"
>> .env echo NEXTAUTH_URL="http://localhost:3000"
>> .env echo NEXTAUTH_SECRET="%NEXTAUTH_SECRET%"
echo [OK] .env created
goto env_end
:env_done
echo [2/5] .env already exists
:env_end

REM [3/5] Generate Prisma client (skip if already generated)
if exist "node_modules\.prisma\client\" goto prisma_done
echo [3/5] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Prisma client generation failed!
    echo.
    pause
    exit /b 1
)
echo [OK] Prisma client ready
goto prisma_end
:prisma_done
echo [3/5] Prisma client already generated
:prisma_end

REM [4/5] Check database (first run: migrate + seed demo/admin accounts)
if exist "prisma\dev.db" goto db_done
echo [4/5] First run: initializing database...
call npx prisma migrate deploy
if errorlevel 1 (
    echo [ERROR] Database migration failed!
    echo.
    pause
    exit /b 1
)
call npm run db:seed
if errorlevel 1 (
    echo [ERROR] Database seed failed!
    echo.
    pause
    exit /b 1
)
echo [OK] Database initialized with demo data
goto db_end
:db_done
echo [4/5] Database already exists
:db_end

echo.
echo [5/5] Ready, starting server...
echo.
echo ========================================
echo   Please open in browser:
echo   http://localhost:3000
echo.
echo   Login accounts:
echo     demo@example.com  / demo123   (USER)
echo     admin@example.com / admin123  (ADMIN)
echo ========================================
echo.

REM Start development server (predev auto-cleans ports 3000-3002)
call npm run dev

pause

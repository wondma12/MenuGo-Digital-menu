@echo off
REM Railway Database Setup Script for Windows
REM This script sets up your Railway database with all MenuGo tables
REM Usage: setupRailway.bat

echo.
echo ========================================
echo MenuGo Railway Database Setup
echo ========================================
echo.
echo Your Railway credentials:
echo   Host: hayabusa.proxy.rlwy.net
echo   Port: 45537
echo   User: root
echo   Database: menugo_db
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking database.sql exists...
if not exist "database.sql" (
    echo Error: database.sql not found!
    echo Please run this script from the menugo-backends directory
    pause
    exit /b 1
)

echo.
echo Running database setup script...
echo.

node scripts\setupRailwayDatabase.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Success! Your Railway database is ready!
    echo ========================================
    echo.
    echo You can now connect to your database:
    echo   Host: hayabusa.proxy.rlwy.net:45537
    echo   User: root
    echo   Database: menugo_db
    echo.
) else (
    echo.
    echo Setup failed! Check the errors above.
    echo.
)

pause

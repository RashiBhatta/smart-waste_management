@echo off
title SMART WASTE MANAGEMENT SYSTEM
color 0A

echo ========================================
echo    SMART WASTE MANAGEMENT SYSTEM
echo ========================================
echo.

:: Check if MongoDB is running
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB is not running
    echo Please make sure MongoDB is installed and running
    echo.
)

:: Install backend dependencies if needed
echo.
echo Installing/Updating backend dependencies...
cd /d %~dp0backend
call npm install
echo [OK] Backend dependencies installed

:: Install frontend dependencies if needed
echo.
echo Installing/Updating frontend dependencies...
cd /d %~dp0frontend
call npm install
echo [OK] Frontend dependencies installed

:: Start backend server
echo.
echo Starting Backend Server...
start cmd /k "cd /d %~dp0backend && npm run dev"

:: Wait for backend to initialize
timeout /t 5 /nobreak >nul

:: Start frontend server
echo.
echo Starting Frontend Server...
start cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo    SYSTEM IS STARTING UP
echo ========================================
echo.
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:3000
echo.
echo Default Admin Credentials:
echo Email: admin@swm.com
echo Password: Admin@123
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3000

echo.
echo System is running!
echo Close this window to stop both servers.
pause
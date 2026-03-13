@echo off
title FIX CONNECTION ISSUES
color 0A

echo ========================================
echo    FIXING CONNECTION ISSUES
echo ========================================
echo.

:: Kill all Node processes
echo Stopping all servers...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

:: Check if MongoDB is running
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running
) else (
    echo [ERROR] MongoDB is not running
    echo Please start MongoDB first
    pause
    exit
)

:: Start backend first
echo.
echo Starting Backend Server...
start cmd /k "cd /d %~dp0backend && echo Starting backend on port 5000... && npm run dev"

:: Wait for backend to initialize
echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

:: Test backend connection
echo Testing backend connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

if %errorlevel% equ 0 (
    echo [OK] Backend is running and accessible
) else (
    echo [ERROR] Cannot connect to backend
    echo Please check if backend is running on port 5000
    pause
    exit
)

:: Start frontend
echo.
echo Starting Frontend Server...
start cmd /k "cd /d %~dp0frontend && echo Starting frontend on port 3000... && npm start"

echo.
echo ========================================
echo    SYSTEM IS STARTING
echo ========================================
echo.
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:3000
echo.
echo Test backend: http://localhost:5000/api/health
echo.
echo Login Credentials:
echo   Admin: admin@swm.com / Admin@123
echo   Resident: resident@example.com / Resident@123
echo   Collector: collector@example.com / Collector@123
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo System is running!
echo Close this window to stop both servers.
pause
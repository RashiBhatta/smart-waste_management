@echo off
title SMART WASTE MANAGEMENT SYSTEM - QUICK START
color 0A

echo ========================================
echo    SMART WASTE MANAGEMENT SYSTEM
echo         QUICK START UTILITY
echo ========================================
echo.

:: Kill all Node.js processes (this frees up ports 5000 and 3000)
echo Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

:: Check if MongoDB is running
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running
) else (
    echo [WARNING] MongoDB is not running
    echo Please start MongoDB first
    pause
    exit
)

:: Install backend dependencies if needed
echo.
echo Checking backend dependencies...
cd /d %~dp0backend
call npm install --silent
echo [OK] Backend ready

:: Install frontend dependencies if needed
echo.
echo Checking frontend dependencies...
cd /d %~dp0frontend
call npm install --silent
echo [OK] Frontend ready

:: Create default .env files if they don't exist
cd /d %~dp0backend
if not exist .env (
    echo PORT=5000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/smart-waste-management >> .env
    echo JWT_SECRET=your-secret-key-here-change-in-production >> .env
    echo NODE_ENV=development >> .env
    echo [OK] Created backend .env file
)

cd /d %~dp0frontend
if not exist .env (
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo REACT_APP_SOCKET_URL=http://localhost:5000 >> .env
    echo PORT=3000 >> .env
    echo [OK] Created frontend .env file
)

:: Start backend server
echo.
echo Starting Backend Server on port 5000...
start cmd /k "cd /d %~dp0backend && echo Backend running on http://localhost:5000 && npm run dev"

:: Wait for backend to initialize
timeout /t 5 /nobreak >nul

:: Start frontend server
echo.
echo Starting Frontend Server on port 3000...
start cmd /k "cd /d %~dp0frontend && echo Frontend running on http://localhost:3000 && npm start"

echo.
echo ========================================
echo    SYSTEM IS STARTING UP
echo ========================================
echo.
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:3000
echo.
echo DEFAULT LOGIN CREDENTIALS:
echo --------------------------
echo Admin:    admin@swm.com / Admin@123
echo Resident: resident@example.com / Resident@123
echo Collector: collector@example.com / Collector@123
echo.
echo The system will open in your browser automatically...
timeout /t 3 /nobreak >nul

:: Open the application
start http://localhost:3000

echo.
echo ========================================
echo    SYSTEM IS RUNNING!
echo ========================================
echo.
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:3000
echo.
echo 📝 To stop the servers, close the two terminal windows
echo    or press Ctrl+C in each terminal
echo.
pause
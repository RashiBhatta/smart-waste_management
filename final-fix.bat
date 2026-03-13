@echo off
title SMART WASTE MANAGEMENT - FINAL FIX
color 0A

echo ========================================
echo    SMART WASTE MANAGEMENT SYSTEM
echo         FINAL FIX UTILITY
echo ========================================
echo.

:: Create routes directory if it doesn't exist
if not exist "D:\smart-waste-management\smart-waste-management\backend\routes" mkdir "D:\smart-waste-management\smart-waste-management\backend\routes"
if not exist "D:\smart-waste-management\smart-waste-management\backend\models" mkdir "D:\smart-waste-management\smart-waste-management\backend\models"
if not exist "D:\smart-waste-management\smart-waste-management\backend\middleware" mkdir "D:\smart-waste-management\smart-waste-management\backend\middleware"
if not exist "D:\smart-waste-management\smart-waste-management\backend\utils" mkdir "D:\smart-waste-management\smart-waste-management\backend\utils"

echo [1/5] Installing backend dependencies...
cd /d D:\smart-waste-management\smart-waste-management\backend
call npm install express mongoose cors dotenv socket.io jsonwebtoken bcryptjs node-cron multer pdfkit
echo [OK] Backend dependencies installed

echo.
echo [2/5] Installing frontend dependencies...
cd /d D:\smart-waste-management\smart-waste-management\frontend
call npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @mui/lab @mui/x-data-grid @mui/x-date-pickers date-fns socket.io-client react-hook-form @hookform/resolvers yup react-toastify
echo [OK] Frontend dependencies installed

echo.
echo [3/5] Creating database and default admin...
cd /d D:\smart-waste-management\smart-waste-management\backend
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, 
  phone: String, address: Object, coins: Number, freeServiceMonths: Number,
  isActive: Boolean, joinedPrograms: Array, createdAt: Date
});

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

async function setup() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smart-waste-management');
    console.log('Connected to MongoDB');
    
    const admin = await User.findOne({ email: 'admin@swm.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@swm.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: { street: 'Admin Office', city: 'Admin City' },
        coins: 0,
        freeServiceMonths: 0,
        isActive: true,
        joinedPrograms: [],
        createdAt: new Date()
      });
      console.log('Default admin created');
    } else {
      console.log('Admin already exists');
    }
    
    await mongoose.disconnect();
    console.log('Database setup complete');
  } catch (error) {
    console.error('Error:', error);
  }
}
setup();
"
echo [OK] Database setup complete

echo.
echo [4/5] Starting Backend Server...
start cmd /k "cd /d D:\smart-waste-management\smart-waste-management\backend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [5/5] Starting Frontend Server...
start cmd /k "cd /d D:\smart-waste-management\smart-waste-management\frontend && npm start"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    SYSTEM IS NOW RUNNING!
echo ========================================
echo.
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:3001
echo.
echo LOGIN CREDENTIALS:
echo ------------------
echo Admin:    admin@swm.com / Admin@123
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3001

echo.
echo System is running!
echo Close this window to stop both servers.
pause
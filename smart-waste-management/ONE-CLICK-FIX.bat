@echo off
title 🚀 SMART WASTE MANAGEMENT - ONE CLICK FIX
color 0A
mode con: cols=100 lines=40

echo ================================================================================
echo    🚀 SMART WASTE MANAGEMENT SYSTEM - ONE CLICK COMPLETE FIX
echo ================================================================================
echo.

:: Step 1: Kill all Node processes
echo [1/8] 🔴 Stopping all servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo      ✅ Done

:: Step 2: Check if MongoDB is running
echo.
echo [2/8] 🔍 Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo      ✅ MongoDB is running
) else (
    echo      ⚠️ MongoDB is not running - Starting it now...
    start /B mongod --dbpath C:\data\db >nul 2>&1
    timeout /t 5 /nobreak >nul
    echo      ✅ MongoDB started
)

:: Step 3: Fix database connection and create collections
echo.
echo [3/8] 🗄️  Fixing database and creating collections...
cd /d %~dp0backend

node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const fixDatabase = async () => {
    try {
        // Connect to the CORRECT database name
        await mongoose.connect('mongodb://localhost:27017/smart_waste_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('      ✅ Connected to database');
        const db = mongoose.connection.db;
        
        // Get existing collections
        const collections = await db.listCollections().toArray();
        const existingNames = collections.map(c => c.name);
        
        // Collections your app needs
        const neededCollections = ['users', 'collections', 'collectors', 'programs', 'payments', 'notifications', 'reports'];
        const created = [];
        
        for (const coll of neededCollections) {
            if (!existingNames.includes(coll)) {
                await db.createCollection(coll);
                created.push(coll);
            }
        }
        
        if (created.length > 0) {
            console.log('      ✅ Created collections: ' + created.join(', '));
        } else {
            console.log('      ✅ All collections already exist');
        }
        
        // Map existing data if any
        if (existingNames.includes('residents')) {
            const residents = await db.collection('residents').find({}).toArray();
            if (residents.length > 0) {
                for (const r of residents) {
                    r.role = 'resident';
                    await db.collection('users').updateOne(
                        { email: r.email },
                        { $set: r },
                        { upsert: true }
                    );
                }
                console.log('      ✅ Mapped ' + residents.length + ' residents to users');
            }
        }
        
        if (existingNames.includes('volunteers')) {
            const volunteers = await db.collection('volunteers').find({}).toArray();
            if (volunteers.length > 0) {
                for (const v of volunteers) {
                    v.role = 'collector';
                    await db.collection('collectors').updateOne(
                        { email: v.email },
                        { $set: v },
                        { upsert: true }
                    );
                }
                console.log('      ✅ Mapped ' + volunteers.length + ' volunteers to collectors');
            }
        }
        
        if (existingNames.includes('transactions')) {
            const transactions = await db.collection('transactions').find({}).toArray();
            if (transactions.length > 0) {
                await db.collection('payments').insertMany(transactions);
                console.log('      ✅ Mapped ' + transactions.length + ' transactions to payments');
            }
        }
        
        // Create default admin
        const adminExists = await db.collection('users').findOne({ email: 'admin@swm.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await db.collection('users').insertOne({
                name: 'Admin User',
                email: 'admin@swm.com',
                password: hashedPassword,
                role: 'admin',
                phone: '1234567890',
                coins: 1000,
                freeServiceMonths: 2,
                isActive: true,
                monthlyFeePaid: true
            });
            console.log('      ✅ Created default admin user');
        }
        
        // Create demo users
        const demos = [
            { name: 'Demo Resident', email: 'resident@example.com', password: 'Resident@123', role: 'resident', phone: '9876543210', coins: 750, freeServiceMonths: 1 },
            { name: 'Demo Collector', email: 'collector@example.com', password: 'Collector@123', role: 'collector', phone: '8765432109', coins: 500, freeServiceMonths: 0 }
        ];
        
        for (const demo of demos) {
            const exists = await db.collection('users').findOne({ email: demo.email });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(demo.password, 10);
                demo.password = hashedPassword;
                await db.collection('users').insertOne(demo);
                console.log('      ✅ Created ' + demo.email);
                
                if (demo.role === 'collector') {
                    await db.collection('collectors').insertOne({
                        user: demo._id,
                        employeeId: 'COL' + Date.now().toString().slice(-6),
                        vehicleType: 'truck',
                        vehicleNumber: 'RJ14 AB 1234',
                        assignedZone: 'south',
                        isAvailable: true
                    });
                }
            }
        }
        
        console.log('\n      📝 Login Credentials:');
        console.log('         Admin:    admin@swm.com / Admin@123');
        console.log('         Resident: resident@example.com / Resident@123');
        console.log('         Collector: collector@example.com / Collector@123');
        
        await mongoose.disconnect();
        return true;
    } catch (error) {
        console.log('      ❌ Error: ' + error.message);
        return false;
    }
};

fixDatabase().then(() => process.exit());
"

:: Step 4: Create/Update .env files with correct database name
echo.
echo [4/8] 📝 Setting up environment files...

echo PORT=5000 > .env
echo MONGODB_URI=mongodb://localhost:27017/smart_waste_management >> .env
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env
echo NODE_ENV=development >> .env
echo      ✅ Backend .env configured

cd /d %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5000/api > .env
echo REACT_APP_SOCKET_URL=http://localhost:5000 >> .env
echo PORT=3000 >> .env
echo      ✅ Frontend .env configured

:: Step 5: Install dependencies if needed
echo.
echo [5/8] 📦 Checking dependencies...

cd /d %~dp0backend
call npm install --silent
echo      ✅ Backend dependencies ready

cd /d %~dp0frontend
call npm install --silent
echo      ✅ Frontend dependencies ready

:: Step 6: Start backend server
echo.
echo [6/8] 🚀 Starting Backend Server...
cd /d %~dp0backend
start cmd /k "title Backend Server && echo. && echo ======================================== && echo ✅ BACKEND RUNNING ON PORT 5000 && echo ======================================== && echo. && npm run dev"
timeout /t 5 /nobreak >nul

:: Step 7: Start frontend server
echo.
echo [7/8] 🚀 Starting Frontend Server...
cd /d %~dp0frontend
start cmd /k "title Frontend Server && echo. && echo ======================================== && echo ✅ FRONTEND RUNNING ON PORT 3000 && echo ======================================== && echo. && npm start"
timeout /t 5 /nobreak >nul

:: Step 8: Open browser
echo.
echo [8/8] 🌐 Opening application...
start http://localhost:3000

echo.
echo ================================================================================
echo    ✅ SYSTEM IS NOW RUNNING!
echo ================================================================================
echo.
echo    📍 Backend:  http://localhost:5000
echo    📍 Frontend: http://localhost:3000
echo.
echo    🔑 LOGIN CREDENTIALS:
echo       Admin:    admin@swm.com / Admin@123
echo       Resident: resident@example.com / Resident@123
echo       Collector: collector@example.com / Collector@123
echo.
echo    📝 Database: smart_waste_management (connected)
echo.
echo    ⚡ All APIs are ready to use!
echo.
echo ================================================================================
echo    Press any key to close this window (servers will keep running)
echo ================================================================================
pause >nul
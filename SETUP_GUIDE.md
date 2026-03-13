# 📖 Complete Setup Guide

## Step-by-Step Installation Instructions

This guide will help you set up and run the Smart Waste Management System on your local machine.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** (version 14 or higher)
  ```bash
  node --version  # Should show v14.x.x or higher
  ```

- [ ] **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

- [ ] **MongoDB** (Community Edition)
  ```bash
  mongod --version
  ```

- [ ] **Code Editor** (VS Code recommended)

- [ ] **Terminal/Command Prompt**

---

## 🚀 Installation Steps

### STEP 1: Extract the Project

1. Extract the downloaded ZIP file
2. You should see a folder named `smart-waste-management`
3. This folder contains two sub-folders: `backend` and `frontend`

### STEP 2: Setup Backend

#### 2.1 Open Terminal in Backend Folder

```bash
# Navigate to the project
cd smart-waste-management/backend
```

#### 2.2 Install Dependencies

```bash
npm install
```

This will install all required packages. It may take 2-3 minutes.

You should see:
```
added XXX packages
```

#### 2.3 Verify Environment File

The `.env` file is already configured. No changes needed for local development.

Default settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-waste-management
JWT_SECRET=smart-waste-secret-key-2025
FRONTEND_URL=http://localhost:3000
```

#### 2.4 Start MongoDB

**On Windows:**
```bash
# Open a NEW terminal window
mongod
```

**On Mac:**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

You should see:
```
[initandlisten] waiting for connections on port 27017
```

**Keep this terminal open!**

#### 2.5 Seed the Database

Back in your backend terminal:

```bash
npm run seed
```

You should see:
```
✅ Created admin user
✅ Created collector user
✅ Created resident user
✅ Created sample bins
🎉 Database seeded successfully!

📧 Test Credentials:
   Admin: admin@swms.com / admin123
   Collector: collector@swms.com / collector123
   Resident: resident@swms.com / resident123
```

#### 2.6 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
```

**Success! Backend is running. Keep this terminal open.**

---

### STEP 3: Setup Frontend

#### 3.1 Open NEW Terminal in Frontend Folder

```bash
# Open a NEW terminal (don't close the backend terminal!)
cd smart-waste-management/frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

This may take 3-5 minutes.

You should see:
```
added XXX packages
```

#### 3.3 Verify Environment File

The `.env` file is already configured:
```
REACT_APP_API_URL=http://localhost:5000/api
```

#### 3.4 Start Frontend Server

```bash
npm start
```

After compilation (30-60 seconds), you should see:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
```

Your browser should automatically open to `http://localhost:3000`

**Success! Frontend is running.**

---

## ✅ Verification

### Check if Everything is Running

You should have **3 terminal windows open**:

1. **MongoDB Terminal** - Running `mongod`
   ```
   [initandlisten] waiting for connections on port 27017
   ```

2. **Backend Terminal** - Running `npm run dev`
   ```
   🚀 Server running on port 5000
   ```

3. **Frontend Terminal** - Running `npm start`
   ```
   webpack compiled successfully
   ```

### Test the Application

1. **Open Browser** - http://localhost:3000
   - You should see the landing page

2. **Click Login**
   - Email: `admin@swms.com`
   - Password: `admin123`
   - Click "Login"

3. **Check Admin Dashboard**
   - You should see:
     - Total Bins: 4
     - Collected Today: 0
     - Pending: 2

4. **Go to Bin Management**
   - You should see 4 bins listed
   - Try creating a new bin

5. **Logout and Test Other Roles**
   - Collector: `collector@swms.com` / `collector123`
   - Resident: `resident@swms.com` / `resident123`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to MongoDB"

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solution:**
```bash
# Make sure MongoDB is running
# Windows:
mongod

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

---

### Issue 2: "Port 5000 is already in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Option 1: Kill the process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Option 2: Change port in backend/.env
PORT=5001

# Then update frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

---

### Issue 3: "npm install fails"

**Error:**
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or clear cache and retry
npm cache clean --force
npm install
```

---

### Issue 4: "Login not working"

**Symptoms:**
- "Invalid credentials" error
- Can't login with test accounts

**Solution:**
```bash
# Re-seed the database
cd backend
npm run seed

# Clear browser localStorage
# In browser console (F12):
localStorage.clear()
```

---

### Issue 5: "CORS Error"

**Error in browser console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Check backend/.env has:
FRONTEND_URL=http://localhost:3000

# Restart backend server
# Press Ctrl+C in backend terminal
npm run dev
```

---

### Issue 6: "Module not found"

**Error:**
```
Module not found: Can't resolve './api/api'
```

**Solution:**
```bash
# Make sure you're in the correct directory
cd frontend
npm install

# Check that src/api folder exists with files
ls src/api
```

---

## 🎯 Expected Behavior

### Backend Terminal
```
🚀 Server running on port 5000
```

### Frontend Terminal
```
webpack compiled successfully
Compiled with warnings.
```
(Warnings are normal, errors are not)

### Browser
- Landing page loads without errors
- Login works with test credentials
- Dashboards show data
- No red errors in browser console (F12)

---

## 📝 Quick Reference

### Start Everything
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm start
```

### Stop Everything
```bash
# In each terminal, press:
Ctrl + C

# Stop MongoDB (Mac):
brew services stop mongodb-community
```

### Reset Database
```bash
cd backend
npm run seed
```

---

## 🔄 Daily Workflow

After initial setup, to run the project:

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend** (new terminal)
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend** (new terminal)
   ```bash
   cd frontend
   npm start
   ```

4. **Open Browser**
   - http://localhost:3000

---

## 📞 Need Help?

If you encounter issues not covered here:

1. Check that all terminals are running without errors
2. Verify MongoDB is running: `mongosh` (should connect without error)
3. Check backend health: http://localhost:5000/api/health
4. Clear browser cache and localStorage
5. Re-run `npm install` in both folders

---

## ✨ Success Checklist

- [ ] MongoDB running (port 27017)
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Can access http://localhost:3000
- [ ] Can login with test accounts
- [ ] Dashboards load with data
- [ ] No errors in browser console

---

**Congratulations! Your Smart Waste Management System is ready to use! 🎉**

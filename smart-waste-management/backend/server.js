// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const path = require('path');
// // const http = require('http');
// // const socketIo = require('socket.io');
// // const cron = require('node-cron');
// // const fs = require('fs');
// // const jwt = require('jsonwebtoken');
// // require('dotenv').config();

// // // Import models
// // const User = require('./models/User');
// // const Collection = require('./models/Collection');
// // const Notification = require('./models/Notification');

// // const app = express();
// // const server = http.createServer(app);
// // const io = socketIo(server, {
// //   cors: {
// //     origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
// //     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
// //     credentials: true
// //   },
// //   transports: ['websocket', 'polling']
// // });

// // // Set io for use in routes via req.app.get('io')
// // app.set('io', io);

// // // ==================== MIDDLEWARE ====================
// // app.use(cors({
// //   origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
// //   credentials: true
// // }));

// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // // Directory Initialization
// // const dirs = ['uploads', 'uploads/avatars', 'reports', 'invoices'];
// // dirs.forEach(dir => {
// //   const dirPath = path.join(__dirname, dir);
// //   if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
// // });

// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // // ==================== ROUTE PROTECTION LOGIC ====================
// // const safeLoadRoute = (routeName) => {
// //     try {
// //         const routePath = path.join(__dirname, 'routes', routeName);
// //         const route = require(routePath);
// //         if (typeof route !== 'function') {
// //             console.error(`\x1b[31m%s\x1b[0m`, `CRITICAL ERROR: routes/${routeName}.js does not export a router function!`);
// //             const dummy = express.Router();
// //             dummy.all('*', (req, res) => res.status(500).json({ error: `Route ${routeName} is misconfigured.` }));
// //             return dummy;
// //         }
// //         return route;
// //     } catch (e) {
// //         console.error(`\x1b[31m%s\x1b[0m`, `FAILED TO LOAD ROUTE: ${routeName}`, e.message);
// //         const dummy = express.Router();
// //         return dummy;
// //     }
// // };

// // // ==================== ROUTES ====================
// // app.use('/api/auth', safeLoadRoute('auth'));
// // app.use('/api/users', safeLoadRoute('userRoutes')); 
// // app.use('/api/admin', safeLoadRoute('admin'));
// // app.use('/api/resident', safeLoadRoute('resident'));
// // // Fix: Corrected route filename mapping
// // app.use('/api/collections', safeLoadRoute('collectionRoutes')); 
// // app.use('/api/programs', safeLoadRoute('programRoutes'));
// // app.use('/api/payments', safeLoadRoute('payments'));
// // app.use('/api/notifications', safeLoadRoute('notifications'));
// // app.use('/api/reports', safeLoadRoute('reports'));

// // // ==================== SPECIALIZED API ENDPOINTS ====================

// // // 1. Leaderboard (Resident Dashboard Support)
// // app.get('/api/leaderboard', async (req, res) => {
// //   try {
// //     const leaderboard = await User.find({ role: 'resident' })
// //       .sort({ coins: -1 })
// //       .limit(10)
// //       .select('name coins');
// //     res.json({ 
// //       success: true, 
// //       leaderboard: leaderboard.map(u => ({ name: u.name, points: u.coins || 0 })) 
// //     });
// //   } catch (err) {
// //     res.status(500).json({ success: false, leaderboard: [] });
// //   }
// // });

// // // 2. Collector Stats (Collector Dashboard Support)
// // app.get('/api/collector/stats/:id', async (req, res) => {
// //     try {
// //         const stats = await Collection.aggregate([
// //             { $match: { collector: new mongoose.Types.ObjectId(req.params.id) } },
// //             { $group: {
// //                 _id: null,
// //                 assignedToday: { $sum: 1 },
// //                 completedToday: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
// //                 totalWeight: { $sum: "$actualWeight" }
// //             }}
// //         ]);
// //         res.json(stats[0] || { assignedToday: 0, completedToday: 0, totalWeight: 0 });
// //     } catch (err) {
// //         res.status(500).json({ success: false, message: err.message });
// //     }
// // });

// // app.get('/api/health', (req, res) => {
// //   res.json({ 
// //     success: true, 
// //     mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
// //     timestamp: new Date()
// //   });
// // });

// // // ==================== DATABASE CONNECTION ====================
// // const connectDB = async () => {
// //   try {
// //     // FIXED: Use correct connection string with database name
// //     // Option 1: Use environment variable with fallback
// //     const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_waste_management';
    
// //     // Option 2: If you want to use a specific database name, uncomment below:
// //     // const connString = 'mongodb://127.0.0.1:27017/smart_waste_management';
    
// //     console.log('⏳ MongoDB: Connecting to:', connString.replace(/:[^:]*@/, ':***@')); // Hide password if present
    
// //     const conn = await mongoose.connect(connString, {
// //       serverSelectionTimeoutMS: 5000,
// //       family: 4,
// //       // Add these options for better connection handling
// //       connectTimeoutMS: 10000,
// //       socketTimeoutMS: 45000,
// //     });
    
// //     console.log('✅ MongoDB: Connected Successfully to database:', conn.connection.name);
// //     console.log('✅ MongoDB: Host:', conn.connection.host);
    
// //     await createDefaultAdmin();
// //     startCronJobs();
// //   } catch (err) {
// //     console.error('❌ MongoDB: Connection Failed!', err.message);
// //     console.log('⏳ MongoDB: Retrying in 5 seconds...');
// //     setTimeout(connectDB, 5000);
// //   }
// // };

// // // ==================== SOCKET.IO LOGIC ====================
// // io.on('connection', (socket) => {
// //   console.log('🔌 Socket: Connection Init -', socket.id);
  
// //   socket.on('authenticate', async (token) => {
// //     if (mongoose.connection.readyState !== 1) return;

// //     try {
// //       if (!token) return;
// //       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
// //       const user = await User.findById(decoded.id).select('name role address');
      
// //       if (!user) return;

// //       socket.userId = user._id.toString();
// //       socket.userRole = user.role;
      
// //       // Essential rooms for targeted updates
// //       socket.join(socket.userId); 
// //       socket.join(`user_${socket.userId}`); 
      
// //       if (user.role === 'admin') socket.join('admins');
// //       if (user.role === 'collector') {
// //         const zone = user.address?.zone?.toLowerCase() || 'central';
// //         socket.join(`zone-${zone}`);
// //       }
// //       console.log(`🔑 Socket Auth: ${user.name} [${user.role}]`);
// //     } catch (error) {
// //       console.error('🚫 Socket Auth: Failed');
// //     }
// //   });

// //   socket.on('disconnect', () => {
// //     console.log('🔌 Socket: Client disconnected');
// //   });
// // });

// // // ==================== SEED & CRON ====================
// // async function createDefaultAdmin() {
// //   try {
// //     const adminExists = await User.findOne({ role: 'admin' });
// //     if (!adminExists) {
// //       const bcrypt = require('bcryptjs');
// //       const hashedPassword = await bcrypt.hash('Admin@123', 10);
// //       await User.create({
// //         name: 'System Admin',
// //         email: 'admin@swm.com',
// //         password: hashedPassword,
// //         role: 'admin',
// //         address: { zone: 'central', street: 'Admin HQ' },
// //         isActive: true
// //       });
// //       console.log('🛡️ Seed: Default Admin Created');
// //     } else {
// //       console.log('✅ Seed: Admin already exists');
// //     }
// //   } catch (e) {
// //     console.error('❌ Seed: Admin creation failed', e.message);
// //   }
// // }

// // function startCronJobs() {
// //   cron.schedule('0 0 * * *', async () => {
// //     const expiryDate = new Date();
// //     expiryDate.setDate(expiryDate.getDate() - 30);
// //     await Notification.deleteMany({ createdAt: { $lt: expiryDate }, read: true });
// //     console.log('🧹 Cleanup: Old read notifications purged');
// //   });
// // }

// // // Global Exception Handler
// // app.use((err, req, res, next) => {
// //   console.error('🔥 Server Error:', err.stack);
// //   res.status(500).json({ success: false, message: 'Internal Server Error' });
// // });

// // // Handle MongoDB connection events
// // mongoose.connection.on('connected', () => {
// //   console.log('🟢 MongoDB: Connection established');
// // });

// // mongoose.connection.on('disconnected', () => {
// //   console.log('🔴 MongoDB: Connection lost');
// // });

// // mongoose.connection.on('error', (err) => {
// //   console.error('🔴 MongoDB: Connection error:', err.message);
// // });

// // // Graceful shutdown
// // process.on('SIGINT', async () => {
// //   await mongoose.connection.close();
// //   console.log('🔴 MongoDB: Connection closed due to app termination');
// //   process.exit(0);
// // });

// // const PORT = process.env.PORT || 5000;
// // connectDB();
// // server.listen(PORT, () => console.log(`🚀 Server: Running on Port ${PORT}`));








// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const cron = require('node-cron');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// // Import models
// const User = require('./models/User');
// const Collection = require('./models/Collection');
// const Notification = require('./models/Notification');
// const Program = require('./models/Program');
// const Payment = require('./models/Payment');
// const Transaction = require('./models/Transaction');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling']
// });

// // Set io for use in routes via req.app.get('io')
// app.set('io', io);

// // ==================== MIDDLEWARE ====================
// app.use(cors({
//   origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Directory Initialization
// const dirs = ['uploads', 'uploads/avatars', 'uploads/evidence', 'reports', 'invoices'];
// dirs.forEach(dir => {
//   const dirPath = path.join(__dirname, dir);
//   if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
// });

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ==================== ROUTE PROTECTION LOGIC ====================
// const safeLoadRoute = (routeName) => {
//     try {
//         const routePath = path.join(__dirname, 'routes', routeName);
//         const route = require(routePath);
//         if (typeof route !== 'function') {
//             console.error(`\x1b[31m%s\x1b[0m`, `CRITICAL ERROR: routes/${routeName}.js does not export a router function!`);
//             const dummy = express.Router();
//             dummy.all('*', (req, res) => res.status(500).json({ error: `Route ${routeName} is misconfigured.` }));
//             return dummy;
//         }
//         return route;
//     } catch (e) {
//         console.error(`\x1b[31m%s\x1b[0m`, `FAILED TO LOAD ROUTE: ${routeName}`, e.message);
//         const dummy = express.Router();
//         return dummy;
//     }
// };

// // ==================== ROUTES ====================
// app.use('/api/auth', safeLoadRoute('auth'));
// app.use('/api/users', safeLoadRoute('userRoutes')); 
// app.use('/api/admin', safeLoadRoute('admin'));
// app.use('/api/resident', safeLoadRoute('resident'));
// app.use('/api/collections', safeLoadRoute('collectionRoutes')); 
// app.use('/api/programs', safeLoadRoute('programRoutes'));
// app.use('/api/payments', safeLoadRoute('payments'));
// app.use('/api/notifications', safeLoadRoute('notifications'));
// app.use('/api/reports', safeLoadRoute('reports'));

// // ==================== SPECIALIZED API ENDPOINTS ====================

// // 1. Leaderboard (Resident Dashboard Support)
// app.get('/api/leaderboard', async (req, res) => {
//   try {
//     const leaderboard = await User.find({ role: 'resident' })
//       .sort({ totalCoinsEarned: -1 })
//       .limit(10)
//       .select('name totalCoinsEarned coins');
//     res.json({ 
//       success: true, 
//       leaderboard: leaderboard.map(u => ({ 
//         name: u.name, 
//         points: u.totalCoinsEarned || 0,
//         currentCoins: u.coins || 0
//       })) 
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, leaderboard: [] });
//   }
// });

// // 2. Collector Stats (Collector Dashboard Support)
// app.get('/api/collector/stats/:id', async (req, res) => {
//     try {
//         const stats = await Collection.aggregate([
//             { $match: { collector: new mongoose.Types.ObjectId(req.params.id) } },
//             { $group: {
//                 _id: null,
//                 assignedToday: { $sum: 1 },
//                 completedToday: { $sum: { $cond: [{ $eq: ["$status", "Collected"] }, 1, 0] } },
//                 totalWeight: { $sum: "$actualWeight" }
//             }}
//         ]);
//         res.json(stats[0] || { assignedToday: 0, completedToday: 0, totalWeight: 0 });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// // 3. Dashboard Stats for Admin
// app.get('/api/dashboard/stats', async (req, res) => {
//   try {
//     const [
//       totalResidents,
//       totalCollectors,
//       totalPrograms,
//       totalCollections,
//       pendingApprovals,
//       monthlyRevenue
//     ] = await Promise.all([
//       User.countDocuments({ role: 'resident', isActive: true }),
//       User.countDocuments({ role: 'collector', isActive: true }),
//       Program.countDocuments({ status: { $in: ['active', 'upcoming'] } }),
//       Collection.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
//       Program.aggregate([
//         { $unwind: '$volunteers' },
//         { $match: { 'volunteers.status': 'pending' } },
//         { $count: 'total' }
//       ]),
//       Payment.aggregate([
//         { $match: { 
//           status: 'completed',
//           createdAt: { $gte: new Date(new Date().setDate(1)) }
//         }},
//         { $group: { _id: null, total: { $sum: '$amount' } } }
//       ])
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalResidents,
//         totalCollectors,
//         totalPrograms,
//         totalCollections: totalCollections || 0,
//         pendingApprovals: pendingApprovals[0]?.total || 0,
//         monthlyRevenue: monthlyRevenue[0]?.total || 0
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get('/api/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     timestamp: new Date()
//   });
// });

// // ==================== DATABASE CONNECTION ====================
// const connectDB = async () => {
//   try {
//     const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_waste_management';
    
//     console.log('⏳ MongoDB: Connecting to:', connString.replace(/:[^:]*@/, ':***@'));
    
//     const conn = await mongoose.connect(connString, {
//       serverSelectionTimeoutMS: 5000,
//       family: 4,
//       connectTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });
    
//     console.log('✅ MongoDB: Connected Successfully to database:', conn.connection.name);
//     console.log('✅ MongoDB: Host:', conn.connection.host);
    
//     await createDefaultAdmin();
//     await checkMonthlyPayments();
//     startCronJobs();
//   } catch (err) {
//     console.error('❌ MongoDB: Connection Failed!', err.message);
//     console.log('⏳ MongoDB: Retrying in 5 seconds...');
//     setTimeout(connectDB, 5000);
//   }
// };

// // ==================== SOCKET.IO LOGIC ====================
// io.on('connection', (socket) => {
//   console.log('🔌 Socket: Connection Init -', socket.id);
  
//   socket.on('authenticate', async (token) => {
//     if (mongoose.connection.readyState !== 1) return;

//     try {
//       if (!token) return;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
//       const user = await User.findById(decoded.id).select('name role address zone');
      
//       if (!user) return;

//       socket.userId = user._id.toString();
//       socket.userRole = user.role;
      
//       // Essential rooms for targeted updates
//       socket.join(socket.userId); 
//       socket.join(`user_${socket.userId}`); 
      
//       if (user.role === 'admin') {
//         socket.join('admins');
//       }
      
//       if (user.role === 'collector') {
//         socket.join('collectors');
//         const zone = user.address?.zone?.toLowerCase() || 'central';
//         socket.join(`zone-${zone}`);
//       }
      
//       if (user.role === 'resident') {
//         const zone = user.address?.zone?.toLowerCase() || 'central';
//         socket.join(`zone-${zone}`);
//         socket.join('residents');
//       }
      
//       console.log(`🔑 Socket Auth: ${user.name} [${user.role}]`);
//     } catch (error) {
//       console.error('🚫 Socket Auth: Failed');
//     }
//   });

//   socket.on('join-program-room', (programId) => {
//     socket.join(`program-${programId}`);
//     console.log(`📋 Joined program room: program-${programId}`);
//   });

//   socket.on('leave-program-room', (programId) => {
//     socket.leave(`program-${programId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('🔌 Socket: Client disconnected');
//   });
// });

// // ==================== SEED & CRON ====================
// async function createDefaultAdmin() {
//   try {
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (!adminExists) {
//       const bcrypt = require('bcryptjs');
//       const hashedPassword = await bcrypt.hash('Admin@123', 10);
//       await User.create({
//         name: 'System Admin',
//         email: 'admin@swm.com',
//         password: hashedPassword,
//         role: 'admin',
//         address: { zone: 'central', street: 'Admin HQ', city: 'Kathmandu' },
//         isActive: true,
//         coins: 0,
//         totalCoinsEarned: 0
//       });
//       console.log('🛡️ Seed: Default Admin Created');
//     } else {
//       console.log('✅ Seed: Admin already exists');
//     }
//   } catch (e) {
//     console.error('❌ Seed: Admin creation failed', e.message);
//   }
// }

// async function checkMonthlyPayments() {
//   try {
//     const residents = await User.find({ 
//       role: 'resident',
//       isServiceFree: false 
//     });
    
//     const today = new Date();
//     const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
//     for (const resident of residents) {
//       const hasPaidThisMonth = await Payment.findOne({
//         user: resident._id,
//         status: 'completed',
//         createdAt: { $gte: firstOfMonth }
//       });
      
//       if (!hasPaidThisMonth && !resident.isServiceFree) {
//         resident.monthlyFeePaid = false;
//         resident.paymentStatus = 'pending';
//         await resident.save();
        
//         // Send reminder notification
//         await Notification.create({
//           recipient: resident._id,
//           type: 'system_alert',
//           title: 'Payment Reminder',
//           message: 'Your monthly waste collection fee of Rs. 1000 is due.',
//           priority: 'high'
//         });
//       }
//     }
//     console.log('💰 Monthly payment check completed');
//   } catch (error) {
//     console.error('Payment check error:', error);
//   }
// }

// function startCronJobs() {
//   // Clean old notifications daily at midnight
//   cron.schedule('0 0 * * *', async () => {
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() - 30);
//     await Notification.deleteMany({ createdAt: { $lt: expiryDate }, read: true });
//     console.log('🧹 Cleanup: Old read notifications purged');
//   });

//   // Check monthly payments on the 1st of each month
//   cron.schedule('0 0 1 * *', async () => {
//     await checkMonthlyPayments();
//   });

//   // Update program statuses daily at 1 AM
//   cron.schedule('0 1 * * *', async () => {
//     const programs = await Program.find();
//     for (const program of programs) {
//       const now = new Date();
//       if (program.startDate && program.startDate > now) {
//         program.status = 'upcoming';
//       } else if (program.endDate && program.endDate < now) {
//         program.status = 'completed';
//       } else if (program.startDate <= now && (!program.endDate || program.endDate >= now)) {
//         program.status = 'active';
//       }
//       await program.save();
//     }
//     console.log('📅 Program statuses updated');
//   });
// }

// // Global Exception Handler
// app.use((err, req, res, next) => {
//   console.error('🔥 Server Error:', err.stack);
//   res.status(500).json({ success: false, message: 'Internal Server Error' });
// });

// // Handle MongoDB connection events
// mongoose.connection.on('connected', () => {
//   console.log('🟢 MongoDB: Connection established');
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('🔴 MongoDB: Connection lost');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('🔴 MongoDB: Connection error:', err.message);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('🔴 MongoDB: Connection closed due to app termination');
//   process.exit(0);
// });

// const PORT = process.env.PORT || 5000;
// connectDB();
// server.listen(PORT, () => console.log(`🚀 Server: Running on Port ${PORT}`));

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const cron = require('node-cron');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// // Import models
// const User = require('./models/User');
// const Collection = require('./models/Collection');
// const Notification = require('./models/Notification');
// const Program = require('./models/Program');
// const Payment = require('./models/Payment');
// const Transaction = require('./models/Transaction');
// const VolunteerRequest = require('./models/VolunteerRequest');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling']
// });

// // Set io for use in routes via req.app.get('io')
// app.set('io', io);

// // ==================== MIDDLEWARE ====================
// app.use(cors({
//   origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Directory Initialization
// const dirs = ['uploads', 'uploads/avatars', 'uploads/evidence', 'reports', 'invoices'];
// dirs.forEach(dir => {
//   const dirPath = path.join(__dirname, dir);
//   if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
// });

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ==================== ROUTE PROTECTION LOGIC ====================
// const safeLoadRoute = (routeName) => {
//     try {
//         const routePath = path.join(__dirname, 'routes', routeName);
//         const route = require(routePath);
//         if (typeof route !== 'function') {
//             console.error(`\x1b[31m%s\x1b[0m`, `CRITICAL ERROR: routes/${routeName}.js does not export a router function!`);
//             const dummy = express.Router();
//             dummy.all('*', (req, res) => res.status(500).json({ error: `Route ${routeName} is misconfigured.` }));
//             return dummy;
//         }
//         return route;
//     } catch (e) {
//         console.error(`\x1b[31m%s\x1b[0m`, `FAILED TO LOAD ROUTE: ${routeName}`, e.message);
//         const dummy = express.Router();
//         return dummy;
//     }
// };

// // ==================== ROUTES ====================
// app.use('/api/auth', safeLoadRoute('auth'));
// app.use('/api/users', safeLoadRoute('userRoutes')); 
// app.use('/api/admin', safeLoadRoute('admin'));
// app.use('/api/resident', safeLoadRoute('resident'));
// app.use('/api/collector', safeLoadRoute('collector'));
// app.use('/api/collections', safeLoadRoute('collectionRoutes')); 
// app.use('/api/programs', safeLoadRoute('programRoutes'));
// app.use('/api/payments', safeLoadRoute('payments'));
// app.use('/api/notifications', safeLoadRoute('notifications'));
// app.use('/api/reports', safeLoadRoute('reports'));

// // ==================== SPECIALIZED API ENDPOINTS ====================

// // 1. Leaderboard (Resident Dashboard Support)
// app.get('/api/leaderboard', async (req, res) => {
//   try {
//     const leaderboard = await User.find({ role: 'resident' })
//       .sort({ totalCoinsEarned: -1 })
//       .limit(10)
//       .select('name totalCoinsEarned coins');
//     res.json({ 
//       success: true, 
//       leaderboard: leaderboard.map(u => ({ 
//         name: u.name, 
//         points: u.totalCoinsEarned || 0,
//         currentCoins: u.coins || 0
//       })) 
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, leaderboard: [] });
//   }
// });

// // 2. Collector Stats (Collector Dashboard Support)
// app.get('/api/collector/stats/:id', async (req, res) => {
//     try {
//         const stats = await Collection.aggregate([
//             { $match: { collector: new mongoose.Types.ObjectId(req.params.id) } },
//             { $group: {
//                 _id: null,
//                 assignedToday: { $sum: 1 },
//                 completedToday: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
//                 totalWeight: { $sum: "$actualWeight" }
//             }}
//         ]);
//         res.json(stats[0] || { assignedToday: 0, completedToday: 0, totalWeight: 0 });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// // 3. Dashboard Stats for Admin
// app.get('/api/dashboard/stats', async (req, res) => {
//   try {
//     const [
//       totalResidents,
//       totalCollectors,
//       totalPrograms,
//       totalCollections,
//       pendingApprovals,
//       monthlyRevenue
//     ] = await Promise.all([
//       User.countDocuments({ role: 'resident', isActive: true }),
//       User.countDocuments({ role: 'collector', isActive: true }),
//       Program.countDocuments({ status: { $in: ['active', 'upcoming'] } }),
//       Collection.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
//       Program.aggregate([
//         { $unwind: '$volunteers' },
//         { $match: { 'volunteers.status': 'pending' } },
//         { $count: 'total' }
//       ]),
//       Payment.aggregate([
//         { $match: { 
//           status: 'completed',
//           createdAt: { $gte: new Date(new Date().setDate(1)) }
//         }},
//         { $group: { _id: null, total: { $sum: '$amount' } } }
//       ])
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalResidents,
//         totalCollectors,
//         totalPrograms,
//         totalCollections: totalCollections || 0,
//         pendingApprovals: pendingApprovals[0]?.total || 0,
//         monthlyRevenue: monthlyRevenue[0]?.total || 0
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get('/api/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     timestamp: new Date()
//   });
// });

// // ==================== DATABASE CONNECTION ====================
// const connectDB = async () => {
//   try {
//     const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_waste_management';
    
//     console.log('⏳ MongoDB: Connecting to:', connString.replace(/:[^:]*@/, ':***@'));
    
//     const conn = await mongoose.connect(connString, {
//       serverSelectionTimeoutMS: 5000,
//       family: 4,
//       connectTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });
    
//     console.log('✅ MongoDB: Connected Successfully to database:', conn.connection.name);
//     console.log('✅ MongoDB: Host:', conn.connection.host);
    
//     await createDefaultAdmin();
//     await checkMonthlyPayments();
//     startCronJobs();
//   } catch (err) {
//     console.error('❌ MongoDB: Connection Failed!', err.message);
//     console.log('⏳ MongoDB: Retrying in 5 seconds...');
//     setTimeout(connectDB, 5000);
//   }
// };

// // ==================== SOCKET.IO LOGIC ====================
// io.on('connection', (socket) => {
//   console.log('🔌 Socket: Connection Init -', socket.id);
  
//   socket.on('authenticate', async (token) => {
//     if (mongoose.connection.readyState !== 1) return;

//     try {
//       if (!token) return;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
//       const user = await User.findById(decoded.id).select('name role address zone');
      
//       if (!user) return;

//       socket.userId = user._id.toString();
//       socket.userRole = user.role;
      
//       // Essential rooms for targeted updates
//       socket.join(socket.userId); 
//       socket.join(`user_${socket.userId}`); 
      
//       if (user.role === 'admin') {
//         socket.join('admins');
//       }
      
//       if (user.role === 'collector') {
//         socket.join('collectors');
//         const zone = user.address?.zone?.toLowerCase() || 'central';
//         socket.join(`zone-${zone}`);
//       }
      
//       if (user.role === 'resident') {
//         const zone = user.address?.zone?.toLowerCase() || 'central';
//         socket.join(`zone-${zone}`);
//         socket.join('residents');
//       }
      
//       console.log(`🔑 Socket Auth: ${user.name} [${user.role}]`);
//     } catch (error) {
//       console.error('🚫 Socket Auth: Failed');
//     }
//   });

//   socket.on('join-program-room', (programId) => {
//     socket.join(`program-${programId}`);
//     console.log(`📋 Joined program room: program-${programId}`);
//   });

//   socket.on('leave-program-room', (programId) => {
//     socket.leave(`program-${programId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('🔌 Socket: Client disconnected');
//   });
// });

// // ==================== SEED & CRON ====================
// async function createDefaultAdmin() {
//   try {
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (!adminExists) {
//       const bcrypt = require('bcryptjs');
//       const hashedPassword = await bcrypt.hash('Admin@123', 10);
//       await User.create({
//         name: 'System Admin',
//         email: 'admin@swm.com',
//         password: hashedPassword,
//         role: 'admin',
//         address: { zone: 'central', street: 'Admin HQ', city: 'Kathmandu' },
//         isActive: true,
//         coins: 0,
//         totalCoinsEarned: 0
//       });
//       console.log('🛡️ Seed: Default Admin Created');
//     } else {
//       console.log('✅ Seed: Admin already exists');
//     }
//   } catch (e) {
//     console.error('❌ Seed: Admin creation failed', e.message);
//   }
// }

// async function checkMonthlyPayments() {
//   try {
//     const residents = await User.find({ 
//       role: 'resident',
//       isServiceFree: false 
//     });
    
//     const today = new Date();
//     const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
//     for (const resident of residents) {
//       const hasPaidThisMonth = await Payment.findOne({
//         user: resident._id,
//         status: 'completed',
//         createdAt: { $gte: firstOfMonth }
//       });
      
//       if (!hasPaidThisMonth && !resident.isServiceFree) {
//         resident.monthlyFeePaid = false;
//         resident.paymentStatus = 'pending';
//         await resident.save();
        
//         // Send reminder notification
//         await Notification.create({
//           recipient: resident._id,
//           type: 'system_alert',
//           title: 'Payment Reminder',
//           message: 'Your monthly waste collection fee of Rs. 1000 is due.',
//           priority: 'high'
//         });
//       }
//     }
//     console.log('💰 Monthly payment check completed');
//   } catch (error) {
//     console.error('Payment check error:', error);
//   }
// }

// function startCronJobs() {
//   // Clean old notifications daily at midnight
//   cron.schedule('0 0 * * *', async () => {
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() - 30);
//     await Notification.deleteMany({ createdAt: { $lt: expiryDate }, read: true });
//     console.log('🧹 Cleanup: Old read notifications purged');
//   });

//   // Check monthly payments on the 1st of each month
//   cron.schedule('0 0 1 * *', async () => {
//     await checkMonthlyPayments();
//   });

//   // Update program statuses daily at 1 AM
//   cron.schedule('0 1 * * *', async () => {
//     const programs = await Program.find();
//     for (const program of programs) {
//       const now = new Date();
//       if (program.startDate && program.startDate > now) {
//         program.status = 'upcoming';
//       } else if (program.endDate && program.endDate < now) {
//         program.status = 'completed';
//       } else if (program.startDate <= now && (!program.endDate || program.endDate >= now)) {
//         program.status = 'active';
//       }
//       await program.save();
//     }
//     console.log('📅 Program statuses updated');
//   });
// }

// // Global Exception Handler
// app.use((err, req, res, next) => {
//   console.error('🔥 Server Error:', err.stack);
//   res.status(500).json({ success: false, message: 'Internal Server Error' });
// });

// // Handle MongoDB connection events
// mongoose.connection.on('connected', () => {
//   console.log('🟢 MongoDB: Connection established');
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('🔴 MongoDB: Connection lost');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('🔴 MongoDB: Connection error:', err.message);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('🔴 MongoDB: Connection closed due to app termination');
//   process.exit(0);
// });

// const PORT = process.env.PORT || 5000;
// connectDB();
// server.listen(PORT, () => console.log(`🚀 Server: Running on Port ${PORT}`));


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const cron = require('node-cron');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// // Import models
// const User = require('./models/User');
// const Collection = require('./models/Collection');
// const Notification = require('./models/Notification');
// const Program = require('./models/Program');
// const Payment = require('./models/Payment');
// const Transaction = require('./models/Transaction');
// const VolunteerRequest = require('./models/VolunteerRequest');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true
//   },
//   transports: ['websocket', 'polling']
// });

// // Set io for use in routes via req.app.get('io')
// app.set('io', io);

// // ==================== MIDDLEWARE ====================
// app.use(cors({
//   origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Directory Initialization
// const dirs = ['uploads', 'uploads/avatars', 'uploads/evidence', 'reports', 'invoices'];
// dirs.forEach(dir => {
//   const dirPath = path.join(__dirname, dir);
//   if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
// });

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ==================== ROUTE PROTECTION LOGIC ====================
// const safeLoadRoute = (routeName) => {
//   try {
//     const routePath = path.join(__dirname, 'routes', routeName);
//     const route = require(routePath);
//     if (typeof route !== 'function') {
//       console.error(`\x1b[31m%s\x1b[0m`, `CRITICAL ERROR: routes/${routeName}.js does not export a router function!`);
//       const dummy = express.Router();
//       dummy.all('*', (req, res) => res.status(500).json({ error: `Route ${routeName} is misconfigured.` }));
//       return dummy;
//     }
//     return route;
//   } catch (e) {
//     console.error(`\x1b[31m%s\x1b[0m`, `FAILED TO LOAD ROUTE: ${routeName}`, e.message);
//     return express.Router();
//   }
// };

// // ==================== ROUTES ====================

// // ── Core auth & user routes ──────────────────────────────────
// app.use('/api/auth',          safeLoadRoute('auth'));
// app.use('/api/users',         safeLoadRoute('userRoutes'));

// // ── Resident routes ──────────────────────────────────────────
// app.use('/api/resident',      safeLoadRoute('resident'));

// // ── Collector routes ─────────────────────────────────────────
// app.use('/api/collector',     safeLoadRoute('collectorRoutes'));

// // ── Collection routes ────────────────────────────────────────
// app.use('/api/collections',   safeLoadRoute('collectionRoutes'));

// // ── Program routes (resident-facing) ────────────────────────
// app.use('/api/programs',      safeLoadRoute('programRoutes'));

// // ── Payment & notification routes ────────────────────────────
// app.use('/api/payments',      safeLoadRoute('payments'));
// app.use('/api/notifications', safeLoadRoute('notifications'));

// // ── Admin routes ─────────────────────────────────────────────
// // NOTE: More-specific prefixes are registered before the base /api/admin
// // to prevent the wildcard in adminDashboard from swallowing sub-routes.
// app.use('/api/admin/programs', safeLoadRoute('adminPrograms'));   // Feature 2 — program CRUD + volunteer approvals
// app.use('/api/admin/reports',  safeLoadRoute('adminReports'));    // Feature 3 — reports + PDF export
// app.use('/api/admin',          safeLoadRoute('adminDashboard'));  // Feature 1 — dashboard / analytics / users / assign
// app.use('/api/admin',          safeLoadRoute('admin'));           // Legacy — old stats / approve endpoints (kept for compatibility)

// // ── Legacy reports route (kept for backward compatibility) ───
// app.use('/api/reports',        safeLoadRoute('reports'));

// // ==================== SPECIALIZED API ENDPOINTS ====================

// // 1. Leaderboard (Resident Dashboard Support)
// app.get('/api/leaderboard', async (req, res) => {
//   try {
//     const leaderboard = await User.find({ role: 'resident' })
//       .sort({ totalCoinsEarned: -1 })
//       .limit(10)
//       .select('name totalCoinsEarned coins');
//     res.json({
//       success: true,
//       leaderboard: leaderboard.map(u => ({
//         name: u.name,
//         points: u.totalCoinsEarned || 0,
//         currentCoins: u.coins || 0
//       }))
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, leaderboard: [] });
//   }
// });

// // 2. Collector Stats (Collector Dashboard Support)
// app.get('/api/collector/stats/:id', async (req, res) => {
//   try {
//     const stats = await Collection.aggregate([
//       { $match: { collector: new mongoose.Types.ObjectId(req.params.id) } },
//       {
//         $group: {
//           _id: null,
//           assignedToday: { $sum: 1 },
//           completedToday: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
//           totalWeight: { $sum: "$actualWeight" }
//         }
//       }
//     ]);
//     res.json(stats[0] || { assignedToday: 0, completedToday: 0, totalWeight: 0 });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // 3. Dashboard Stats for Admin (legacy — kept for backward compatibility)
// app.get('/api/dashboard/stats', async (req, res) => {
//   try {
//     const [
//       totalResidents,
//       totalCollectors,
//       totalPrograms,
//       totalCollections,
//       pendingApprovals,
//       monthlyRevenue
//     ] = await Promise.all([
//       User.countDocuments({ role: 'resident', isActive: true }),
//       User.countDocuments({ role: 'collector', isActive: true }),
//       Program.countDocuments({ status: { $in: ['active', 'upcoming'] } }),
//       Collection.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
//       Program.aggregate([
//         { $unwind: '$volunteers' },
//         { $match: { 'volunteers.status': 'pending' } },
//         { $count: 'total' }
//       ]),
//       Payment.aggregate([
//         {
//           $match: {
//             status: 'completed',
//             createdAt: { $gte: new Date(new Date().setDate(1)) }
//           }
//         },
//         { $group: { _id: null, total: { $sum: '$amount' } } }
//       ])
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalResidents,
//         totalCollectors,
//         totalPrograms,
//         totalCollections: totalCollections || 0,
//         pendingApprovals: pendingApprovals[0]?.total || 0,
//         monthlyRevenue: monthlyRevenue[0]?.total || 0
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // 4. Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     timestamp: new Date()
//   });
// });

// // ==================== DATABASE CONNECTION ====================
// const connectDB = async () => {
//   try {
//     const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_waste_management';

//     console.log('⏳ MongoDB: Connecting to:', connString.replace(/:[^:]*@/, ':***@'));

//     const conn = await mongoose.connect(connString, {
//       serverSelectionTimeoutMS: 5000,
//       family: 4,
//       connectTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//     });

//     console.log('✅ MongoDB: Connected Successfully to database:', conn.connection.name);
//     console.log('✅ MongoDB: Host:', conn.connection.host);

//     await createDefaultAdmin();
//     await checkMonthlyPayments();
//     startCronJobs();
//   } catch (err) {
//     console.error('❌ MongoDB: Connection Failed!', err.message);
//     console.log('⏳ MongoDB: Retrying in 5 seconds...');
//     setTimeout(connectDB, 5000);
//   }
// };

// // ==================== SOCKET.IO LOGIC ====================
// io.on('connection', (socket) => {
//   console.log('🔌 Socket: Connection Init -', socket.id);

//   socket.on('authenticate', async (token) => {
//     if (mongoose.connection.readyState !== 1) return;

//     try {
//       if (!token) return;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
//       const user = await User.findById(decoded.id).select('name role address zone');

//       if (!user) return;

//       socket.userId   = user._id.toString();
//       socket.userRole = user.role;

//       // Personal room — for direct notifications and coin awards
//       socket.join(socket.userId);
//       socket.join(`user_${socket.userId}`);

//       if (user.role === 'admin') {
//         socket.join('admins');
//       }

//       if (user.role === 'collector') {
//         socket.join('collectors');
//         const zone = user.address?.zone?.toLowerCase() || 'central';
//         socket.join(`zone-${zone}`);
//       }

//       if (user.role === 'resident') {
//         const zone = user.address?.zone?.toLowerCase() || 'central';
//         socket.join(`zone-${zone}`);
//         socket.join('residents');
//       }

//       console.log(`🔑 Socket Auth: ${user.name} [${user.role}]`);
//     } catch (error) {
//       console.error('🚫 Socket Auth: Failed');
//     }
//   });

//   socket.on('join-program-room', (programId) => {
//     socket.join(`program-${programId}`);
//     console.log(`📋 Joined program room: program-${programId}`);
//   });

//   socket.on('leave-program-room', (programId) => {
//     socket.leave(`program-${programId}`);
//   });

//   socket.on('disconnect', () => {
//     console.log('🔌 Socket: Client disconnected');
//   });
// });

// // ==================== SEED & CRON ====================
// async function createDefaultAdmin() {
//   try {
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (!adminExists) {
//       const bcrypt = require('bcryptjs');
//       const hashedPassword = await bcrypt.hash('Admin@123', 10);
//       await User.create({
//         name: 'System Admin',
//         email: 'admin@swm.com',
//         password: hashedPassword,
//         role: 'admin',
//         address: { zone: 'central', street: 'Admin HQ', city: 'Kathmandu' },
//         isActive: true,
//         coins: 0,
//         totalCoinsEarned: 0
//       });
//       console.log('🛡️ Seed: Default Admin Created');
//     } else {
//       console.log('✅ Seed: Admin already exists');
//     }
//   } catch (e) {
//     console.error('❌ Seed: Admin creation failed', e.message);
//   }
// }

// async function checkMonthlyPayments() {
//   try {
//     const residents = await User.find({
//       role: 'resident',
//       isServiceFree: false
//     });

//     const today         = new Date();
//     const firstOfMonth  = new Date(today.getFullYear(), today.getMonth(), 1);

//     for (const resident of residents) {
//       const hasPaidThisMonth = await Payment.findOne({
//         user: resident._id,
//         status: 'completed',
//         createdAt: { $gte: firstOfMonth }
//       });

//       if (!hasPaidThisMonth && !resident.isServiceFree) {
//         resident.monthlyFeePaid = false;
//         resident.paymentStatus  = 'pending';
//         await resident.save();

//         await Notification.create({
//           recipient: resident._id,
//           type: 'system_alert',
//           title: 'Payment Reminder',
//           message: 'Your monthly waste collection fee of Rs. 1000 is due.',
//           priority: 'high'
//         });
//       }
//     }
//     console.log('💰 Monthly payment check completed');
//   } catch (error) {
//     console.error('Payment check error:', error);
//   }
// }

// function startCronJobs() {
//   // Clean old read notifications daily at midnight
//   cron.schedule('0 0 * * *', async () => {
//     const expiryDate = new Date();
//     expiryDate.setDate(expiryDate.getDate() - 30);
//     await Notification.deleteMany({ createdAt: { $lt: expiryDate }, read: true });
//     console.log('🧹 Cleanup: Old read notifications purged');
//   });

//   // Check monthly payments on the 1st of each month
//   cron.schedule('0 0 1 * *', async () => {
//     await checkMonthlyPayments();
//   });

//   // Update program statuses daily at 1 AM
//   cron.schedule('0 1 * * *', async () => {
//     const programs = await Program.find();
//     for (const program of programs) {
//       const now = new Date();
//       if (program.startDate && program.startDate > now) {
//         program.status = 'upcoming';
//       } else if (program.endDate && program.endDate < now) {
//         program.status = 'completed';
//       } else if (program.startDate <= now && (!program.endDate || program.endDate >= now)) {
//         program.status = 'active';
//       }
//       await program.save();
//     }
//     console.log('📅 Program statuses updated');
//   });
// }

// // ==================== GLOBAL ERROR HANDLER ====================
// app.use((err, req, res, next) => {
//   console.error('🔥 Server Error:', err.stack);
//   res.status(500).json({ success: false, message: 'Internal Server Error' });
// });

// // ==================== MONGOOSE EVENT HOOKS ====================
// mongoose.connection.on('connected',    () => console.log('🟢 MongoDB: Connection established'));
// mongoose.connection.on('disconnected', () => console.log('🔴 MongoDB: Connection lost'));
// mongoose.connection.on('error', (err)  => console.error('🔴 MongoDB: Connection error:', err.message));

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('🔴 MongoDB: Connection closed due to app termination');
//   process.exit(0);
// });

// const PORT = process.env.PORT || 5000;
// connectDB();
// server.listen(PORT, () => console.log(`🚀 Server: Running on Port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── Models ────────────────────────────────────────────────────
const User             = require('./models/User');
const Collection       = require('./models/Collection');
const Notification     = require('./models/Notification');
const Program          = require('./models/Program');
const Payment          = require('./models/Payment');
const Transaction      = require('./models/Transaction');
const VolunteerRequest = require('./models/VolunteerRequest');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.set('io', io);

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static directories ────────────────────────────────────────
const dirs = ['uploads', 'uploads/avatars', 'uploads/evidence', 'reports', 'invoices'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Safe route loader ─────────────────────────────────────────
const safeLoadRoute = (routeName) => {
  try {
    const routePath = path.join(__dirname, 'routes', routeName);
    const route = require(routePath);
    if (typeof route !== 'function') {
      console.error(`\x1b[31mCRITICAL ERROR: routes/${routeName}.js does not export a router!\x1b[0m`);
      const dummy = express.Router();
      dummy.all('*', (req, res) =>
        res.status(500).json({ error: `Route ${routeName} is misconfigured.` })
      );
      return dummy;
    }
    return route;
  } catch (e) {
    console.error(`\x1b[31mFAILED TO LOAD ROUTE: ${routeName} — ${e.message}\x1b[0m`);
    return express.Router();
  }
};

// ==================== ROUTES ====================

// ── Auth & users ─────────────────────────────────────────────
app.use('/api/auth',          safeLoadRoute('auth'));
app.use('/api/users',         safeLoadRoute('userRoutes'));

// ── Resident ─────────────────────────────────────────────────
app.use('/api/resident',      safeLoadRoute('resident'));

// ── Collector ────────────────────────────────────────────────
app.use('/api/collector',     safeLoadRoute('collectorRoutes'));

// ── Collections ──────────────────────────────────────────────
app.use('/api/collections',   safeLoadRoute('collectionRoutes'));

// ── Programs (resident-facing) ───────────────────────────────
app.use('/api/programs',      safeLoadRoute('programRoutes'));

// ── Payments & notifications ─────────────────────────────────
app.use('/api/payments',      safeLoadRoute('payments'));
app.use('/api/notifications', safeLoadRoute('notifications'));

// ── Rewards ✅ NEW ────────────────────────────────────────────
app.use('/api/rewards',       safeLoadRoute('rewards'));

// ── Admin (specific routes BEFORE generic /api/admin) ────────
app.use('/api/admin/programs', safeLoadRoute('adminPrograms'));
app.use('/api/admin/reports',  safeLoadRoute('adminReports'));
app.use('/api/admin',          safeLoadRoute('adminDashboard'));
app.use('/api/admin',          safeLoadRoute('admin'));

// ── Legacy reports ────────────────────────────────────────────
app.use('/api/reports',        safeLoadRoute('reports'));

// ==================== SPECIALIZED ENDPOINTS ====================

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'resident' })
      .sort({ totalCoinsEarned: -1 })
      .limit(10)
      .select('name totalCoinsEarned coins');
    res.json({
      success: true,
      leaderboard: leaderboard.map(u => ({
        name: u.name,
        points: u.totalCoinsEarned || 0,
        currentCoins: u.coins || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

// Collector stats
app.get('/api/collector/stats/:id', async (req, res) => {
  try {
    const stats = await Collection.aggregate([
      { $match: { collector: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          assignedToday:  { $sum: 1 },
          completedToday: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
          totalWeight:    { $sum: '$actualWeight' }
        }
      }
    ]);
    res.json(stats[0] || { assignedToday: 0, completedToday: 0, totalWeight: 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dashboard stats (legacy)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [
      totalResidents,
      totalCollectors,
      totalPrograms,
      totalCollections,
      pendingApprovals,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'resident', isActive: true }),
      User.countDocuments({ role: 'collector', isActive: true }),
      Program.countDocuments({ status: { $in: ['active', 'upcoming'] } }),
      Collection.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
      Program.aggregate([
        { $unwind: '$volunteers' },
        { $match: { 'volunteers.status': 'pending' } },
        { $count: 'total' }
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: new Date(new Date().setDate(1)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalResidents,
        totalCollectors,
        totalPrograms,
        totalCollections:  totalCollections  || 0,
        pendingApprovals:  pendingApprovals[0]?.total  || 0,
        monthlyRevenue:    monthlyRevenue[0]?.total    || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_waste_management';
    console.log('⏳ MongoDB: Connecting…');

    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB: Connected to "${conn.connection.name}" on ${conn.connection.host}`);
    await createDefaultAdmin();
    await checkMonthlyPayments();
    startCronJobs();
  } catch (err) {
    console.error('❌ MongoDB: Connection failed —', err.message);
    console.log('⏳ Retrying in 5 seconds…');
    setTimeout(connectDB, 5000);
  }
};

// ==================== SOCKET.IO ===========================
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('authenticate', async (token) => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      if (!token) return;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user    = await User.findById(decoded.id).select('name role address');
      if (!user) return;

      socket.userId   = user._id.toString();
      socket.userRole = user.role;

      // Personal rooms
      socket.join(socket.userId);
      socket.join(`user_${socket.userId}`);
      socket.join(`user-${socket.userId}`);   // ✅ hyphen format used by rewards route

      if (user.role === 'admin') socket.join('admins');

      const zone = user.address?.zone?.toLowerCase() || 'central';

      if (user.role === 'collector') {
        socket.join('collectors');
        socket.join(`zone-${zone}`);
      }

      if (user.role === 'resident') {
        socket.join('residents');
        socket.join(`zone-${zone}`);
      }

      console.log(`🔑 Socket auth: ${user.name} [${user.role}]`);
    } catch {
      console.error('🚫 Socket auth failed');
    }
  });

  socket.on('join-program-room',  id => socket.join(`program-${id}`));
  socket.on('leave-program-room', id => socket.leave(`program-${id}`));
  socket.on('joinProgramRoom',    id => socket.join(`program-${id}`));   // ✅ camelCase alias
  socket.on('joinCollectionRoom', id => socket.join(`collection-${id}`));

  socket.on('disconnect', () => console.log('🔌 Socket disconnected:', socket.id));
});

// ==================== SEED ====================
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'System Admin', email: 'admin@swm.com', password: hashed,
        role: 'admin',
        address: { zone: 'central', street: 'Admin HQ', city: 'Kathmandu' },
        isActive: true, coins: 0, totalCoinsEarned: 0
      });
      console.log('🛡️ Default admin created: admin@swm.com / Admin@123');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (e) {
    console.error('❌ Admin seed failed:', e.message);
  }
}

async function checkMonthlyPayments() {
  try {
    const residents       = await User.find({ role: 'resident', isServiceFree: false });
    const firstOfMonth    = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    for (const resident of residents) {
      const paid = await Payment.findOne({
        user: resident._id, status: 'completed',
        createdAt: { $gte: firstOfMonth }
      });
      if (!paid && !resident.isServiceFree) {
        resident.monthlyFeePaid = false;
        resident.paymentStatus  = 'pending';
        await resident.save();
        await Notification.create({
          recipient: resident._id, type: 'system_alert',
          title: 'Payment Reminder',
          message: 'Your monthly waste collection fee of Rs. 1000 is due.',
          priority: 'high'
        });
      }
    }
    console.log('💰 Monthly payment check done');
  } catch (e) {
    console.error('Payment check error:', e.message);
  }
}

// ==================== CRON JOBS ====================
function startCronJobs() {
  // Purge old read notifications daily at midnight
  cron.schedule('0 0 * * *', async () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() - 30);
    await Notification.deleteMany({ createdAt: { $lt: expiry }, read: true });
    console.log('🧹 Old read notifications purged');
  });

  // Monthly payment check on 1st of month
  cron.schedule('0 0 1 * *', async () => {
    await checkMonthlyPayments();
  });

  // Update program statuses daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      const programs = await Program.find();
      const now      = new Date();
      for (const p of programs) {
        if (p.startDate && p.startDate > now)               p.status = 'upcoming';
        else if (p.endDate && p.endDate < now)              p.status = 'completed';
        else if (p.startDate <= now && (!p.endDate || p.endDate >= now)) p.status = 'active';
        await p.save();
      }
      console.log('📅 Program statuses updated');
    } catch (e) {
      console.error('Program cron error:', e.message);
    }
  });

  console.log('⏰ Cron jobs started');
}

// ==================== ERROR HANDLERS ====================
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ==================== MONGOOSE EVENTS ====================
mongoose.connection.on('connected',    () => console.log('🟢 MongoDB connected'));
mongoose.connection.on('disconnected', () => console.log('🔴 MongoDB disconnected'));
mongoose.connection.on('error', err    => console.error('🔴 MongoDB error:', err.message));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔴 MongoDB closed — shutting down');
  process.exit(0);
});

// ==================== START ====================
const PORT = process.env.PORT || 5000;
connectDB();
server.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🩺 Health:  http://localhost:${PORT}/api/health`);
  console.log(`💰 Rewards: http://localhost:${PORT}/api/rewards/wallet`);
  console.log('=================================');
});
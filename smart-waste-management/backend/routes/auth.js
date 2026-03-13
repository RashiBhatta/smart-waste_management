// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const { protect } = require('../middleware/auth');

// // @desc    Register a new user
// // @route   POST /api/auth/register
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, phone, role, address } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ success: false, message: 'Email already registered.' });
//     }

//     const user = await User.create({
//       name,
//       email,
//       password,
//       phone,
//       role: role || 'resident',
//       address
//     });

//     // Added fallback secret to prevent crashes if .env is not loaded
//     const token = jwt.sign(
//       { id: user._id, role: user.role }, 
//       process.env.JWT_SECRET || 'fallback_secret', 
//       { expiresIn: '30d' }
//     );

//     res.status(201).json({
//       success: true,
//       token,
//       user: { id: user._id, name: user.name, email: user.email, role: user.role }
//     });
//   } catch (error) {
//     console.error("🔥 REGISTER CRASH:", error); // Prints exact error to terminal
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return res.status(400).json({ success: false, message: messages[0] });
//     }
//     res.status(500).json({ success: false, message: 'Registration failed.' });
//   }
// });

// // @desc    Login user
// // @route   POST /api/auth/login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password, role } = req.body; // Extracts role from frontend tabs

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Please provide credentials' });
//     }

//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     // Ensures user is logging in from the correct tab (e.g., Resident can't login via Admin tab)
//     if (role && user.role !== role) {
//       return res.status(403).json({ success: false, message: `Access denied. You are not registered as a ${role}.` });
//     }

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     // CHECK FOR DEACTIVATED ACCOUNT
//     if (user.isActive === false) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Account Deactivated. Please contact admin@swm.com for reactivation.' 
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role }, 
//       process.env.JWT_SECRET || 'fallback_secret', 
//       { expiresIn: '30d' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         address: user.address,
//         coins: user.coins,
//         monthlyFeePaid: user.monthlyFeePaid
//       }
//     });
//   } catch (error) {
//     console.error("🔥 LOGIN CRASH:", error); // Helps diagnose the 500 error
//     res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
//   }
// });

// // @desc    Update User Profile
// // @route   PUT /api/auth/profile
// // @access  Private
// router.put('/profile', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Update basic fields
//     user.name = req.body.name || user.name;
//     user.phone = req.body.phone || user.phone;

//     // Update nested address fields properly
//     if (req.body.address) {
//       user.address = {
//         ...user.address,
//         ...req.body.address
//       };
//     }

//     // Handle password update if provided
//     if (req.body.password && req.body.password.trim() !== '') {
//       user.password = req.body.password;
//     }

//     const updatedUser = await user.save();

//     res.json({
//       success: true,
//       user: {
//         id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         role: updatedUser.role,
//         address: updatedUser.address,
//         phone: updatedUser.phone,
//         coins: updatedUser.coins,
//         monthlyFeePaid: updatedUser.monthlyFeePaid
//       }
//     });
//   } catch (error) {
//     console.error("🔥 PROFILE UPDATE CRASH:", error);
//     res.status(500).json({ success: false, message: 'Update failed' });
//   }
// });

// // @desc    Get Current User Data
// // @route   GET /api/auth/me
// router.get('/me', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
    
//     // Guard against deleted accounts with lingering tokens
//     if (!user) {
//        return res.status(404).json({ success: false, message: 'User no longer exists' });
//     }

//     // Guard against newly deactivated accounts with lingering tokens
//     if (user.isActive === false) {
//         return res.status(403).json({ success: false, message: 'Account has been deactivated' });
//     }

//     res.json({ success: true, user });
//   } catch (error) {
//     console.error("🔥 FETCH ME CRASH:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;


// ============================================================
// FILE: backend/routes/auth.js
// Routes: POST /login, POST /register, GET /me
// ============================================================

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

const JWT_SECRET  = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

// ── Sign token helper ─────────────────────────────────────────
const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ── Safe user object (no password) ───────────────────────────
const safeUser = (user) => ({
  _id:              user._id,
  name:             user.name,
  email:            user.email,
  phone:            user.phone,
  role:             user.role,
  address:          user.address,
  coins:            user.coins            || 0,
  totalCoinsEarned: user.totalCoinsEarned || 0,
  isServiceFree:    user.isServiceFree    || false,
  freeServiceUntil: user.freeServiceUntil,
  paymentStatus:    user.paymentStatus,
  monthlyFeePaid:   user.monthlyFeePaid   || false,
  isActive:         user.isActive,
  createdAt:        user.createdAt,
});

// ============================================================
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // ── Validation ─────────────────────────────────────────
    if (!name?.trim())     return res.status(400).json({ success:false, message:'Name is required' });
    if (!email?.trim())    return res.status(400).json({ success:false, message:'Email is required' });
    if (!password)         return res.status(400).json({ success:false, message:'Password is required' });
    if (password.length < 6) return res.status(400).json({ success:false, message:'Password must be at least 6 characters' });
    if (!phone)            return res.status(400).json({ success:false, message:'Phone number is required' });

    const allowedRoles = ['resident', 'collector'];
    const userRole = allowedRoles.includes(role) ? role : 'resident';

    // ── Duplicate check ────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success:false, message:'An account with this email already exists' });
    }

    // ── Create ─────────────────────────────────────────────
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name:             name.trim(),
      email:            email.toLowerCase().trim(),
      password:         hashed,
      phone,
      role:             userRole,
      address:          address || {},
      coins:            0,
      totalCoinsEarned: 0,
      isActive:         true,
      paymentStatus:    userRole === 'resident' ? 'pending' : undefined,
      monthlyFeePaid:   false,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: safeUser(user),
      message: 'Account created successfully',
    });

  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success:false, message:'Email already in use' });
    }
    res.status(500).json({ success:false, message:'Server error during registration' });
  }
});

// ============================================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ success:false, message:'Email and password are required' });
    }

    // Find user + include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success:false, message:'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success:false, message:'Account deactivated. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success:false, message:'Invalid email or password' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success:false, message:'Server error during login' });
  }
});

// ============================================================
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ============================================================
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by protect middleware (no password)
    res.json({ success:true, user: safeUser(req.user) });
  } catch (err) {
    res.status(500).json({ success:false, message:'Server error' });
  }
});

// ============================================================
// @desc    Update current user's password
// @route   PUT /api/auth/password
// @access  Private
// ============================================================
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success:false, message:'Both fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success:false, message:'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success:false, message:'Current password is incorrect' });
    }

    const salt   = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success:true, message:'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success:false, message:'Server error' });
  }
});

module.exports = router;
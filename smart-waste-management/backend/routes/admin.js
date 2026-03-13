const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Collection = require('../models/Collection');
const Program = require('../models/Program');

// Custom Middleware: Ensure only Admins can access these routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' });
    
    // Count residents who have at least 1 coin
    const activeVolunteers = residents.filter(r => r.coins && r.coins > 0).length;
    
    // Calculate simulated Khalti revenue (Residents who paid * 1000 NPR)
    const revenue = residents.filter(r => r.monthlyFeePaid).length * 1000;

    res.json({ success: true, activeVolunteers, revenue });
  } catch (error) {
    console.error("🔥 STATS CRASH:", error);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

// @desc    Get All Collection Reports for Feed
// @route   GET /api/admin/collections/reports
// @access  Private/Admin
router.get('/collections/reports', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Collection.find()
      .populate('resident', 'name')
      .populate('collector', 'name')
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, reports });
  } catch (error) {
    console.error("🔥 REPORTS CRASH:", error);
    res.status(500).json({ success: false, message: 'Failed to load reports' });
  }
});

// @desc    Approve Volunteer & Award 100 Coins
// @route   PUT /api/admin/programs/:progId/approve/:userId
// @access  Private/Admin
router.put('/programs/:progId/approve/:userId', protect, adminOnly, async (req, res) => {
  try {
    let { progId, userId } = req.params;

    // Guard against the "undefined" crash from the frontend
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ success: false, message: 'Invalid User ID passed from frontend.' });
    }

    const program = await Program.findById(progId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Find the specific volunteer in the array
    const volunteerIndex = program.volunteers.findIndex(v => v.user.toString() === userId);
    
    if (volunteerIndex === -1) {
      return res.status(404).json({ success: false, message: 'Resident not found in this program' });
    }

    if (program.volunteers[volunteerIndex].status === 'approved') {
      return res.status(400).json({ success: false, message: 'Volunteer is already approved' });
    }

    // 1. Approve them in the program
    program.volunteers[volunteerIndex].status = 'approved';
    await program.save();

    // 2. Award 100 Eco-Coins to the User
    const user = await User.findById(userId);
    if (user) {
      user.coins = (user.coins || 0) + 100;
      
      // 3. Automated Milestone Logic: 1000 Coins = Free Month (1000 NPR Waived)
      if (user.coins >= 1000) {
        user.monthlyFeePaid = true; 
        user.coins -= 1000; // Deduct the coins used to "buy" the free month
      }
      
      await user.save();
    }

    res.json({ success: true, message: 'Approved! 100 Eco-Coins awarded.' });
  } catch (error) {
    console.error("🔥 APPROVAL CRASH:", error);
    res.status(500).json({ success: false, message: 'Failed to approve volunteer' });
  }
});

module.exports = router;
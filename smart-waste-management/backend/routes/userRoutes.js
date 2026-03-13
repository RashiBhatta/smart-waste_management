const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get users by role (e.g., collector)
// @route   GET /api/users?role=collector
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    // Find users and only return name and id
    const users = await User.find(query).select('name _id');
    
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// @desc    Get top residents by coins/points
// @route   GET /api/users/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'resident' })
      .sort({ coins: -1 }) // Sort by highest coins
      .limit(10)
      .select('name coins');
    
    // Map coins to 'points' to match your frontend logic
    const formattedData = leaderboard.map(user => ({
      name: user.name,
      points: user.coins || 0
    }));

    res.json({ success: true, leaderboard: formattedData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
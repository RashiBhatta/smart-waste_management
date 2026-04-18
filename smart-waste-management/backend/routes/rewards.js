const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Program = require('../models/Program');
const { protect } = require('../middleware/auth');

const THRESHOLD = 1000; // coins needed for 1 free month

// ── Helper: build wallet data from user ──────────────────────
const buildWallet = (user) => {
  const balance        = user.coins || 0;
  const totalEarned    = user.totalCoinsEarned || user.coins || 0;
  const progressPct    = Math.min(Math.round((totalEarned % THRESHOLD) / THRESHOLD * 100), 100);
  const coinsUntilFree = Math.max(THRESHOLD - (totalEarned % THRESHOLD), 0);
  const milestones     = Math.floor(totalEarned / THRESHOLD);
  const freeMonths     = user.freeServiceMonths || 0;

  return {
    coinBalance:       balance,
    totalCoinsEarned:  totalEarned,
    progressPercent:   progressPct,
    coinsUntilFree:    coinsUntilFree === THRESHOLD ? 0 : coinsUntilFree,
    milestonesReached: milestones,
    freeService: {
      isActive:   freeMonths > 0,
      months:     freeMonths,
      expiresAt:  user.paymentDueDate || null,
    },
  };
};

// ==================== GET WALLET ====================
// GET /api/rewards/wallet
router.get('/wallet', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'coins totalCoinsEarned freeServiceMonths paymentDueDate coinTransactions name'
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const wallet = buildWallet(user);

    // Build transaction history from coinTransactions if it exists
    // Otherwise build from program volunteer history
    let transactions = [];

    if (user.coinTransactions && user.coinTransactions.length > 0) {
      transactions = user.coinTransactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
    } else {
      // Fallback: build from programs the user volunteered in
      const programs = await Program.find({
        'volunteers.user': req.user._id,
        'volunteers.status': 'approved'
      }).select('title startDate volunteers rewardCoins');

      transactions = programs.map(p => {
        const vol = p.volunteers.find(v => String(v.user) === String(req.user._id));
        return {
          _id:         vol?._id || p._id,
          type:        'coin_earned',
          amount:      p.rewardCoins || 100,
          description: `Volunteered in "${p.title}"`,
          createdAt:   vol?.approvedAt || p.startDate || new Date(),
          reference:   { programId: { title: p.title } }
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ success: true, wallet, transactions });
  } catch (error) {
    console.error('Wallet error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET LEADERBOARD ====================
// GET /api/rewards/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    // Get current user's zone to show zone leaderboard
    const currentUser = await User.findById(req.user._id).select('address');
    const zone = currentUser?.address?.zone;

    // Build query — filter by zone if available
    const query = { role: 'resident', isActive: true };
    if (zone && zone !== 'all') query['address.zone'] = zone;

    const residents = await User.find(query)
      .select('name coins totalCoinsEarned freeServiceMonths address')
      .sort({ totalCoinsEarned: -1, coins: -1 })
      .limit(10);

    const leaderboard = residents.map(r => ({
      _id:             r._id,
      name:            r.name,
      totalCoinsEarned: r.totalCoinsEarned || r.coins || 0,
      coinBalance:     r.coins || 0,
      isServiceFree:   (r.freeServiceMonths || 0) > 0,
      zone:            r.address?.zone || 'unknown'
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== AWARD COINS (internal use / admin) ====================
// POST /api/rewards/award
router.post('/award', protect, async (req, res) => {
  try {
    const { userId, amount, description, programId } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'userId and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const previousTotal = user.totalCoinsEarned || 0;
    user.coins             = (user.coins || 0) + amount;
    user.totalCoinsEarned  = previousTotal + amount;

    // Check milestone
    const previousMilestones = Math.floor(previousTotal / THRESHOLD);
    const newMilestones      = Math.floor(user.totalCoinsEarned / THRESHOLD);
    const milestoneReached   = newMilestones > previousMilestones;

    if (milestoneReached) {
      user.freeServiceMonths = (user.freeServiceMonths || 0) + 1;
      // Set paymentDueDate 30 days from now
      const due = new Date();
      due.setDate(due.getDate() + 30);
      user.paymentDueDate = due;
    }

    // Record transaction
    if (!user.coinTransactions) user.coinTransactions = [];
    user.coinTransactions.push({
      type:        'coin_earned',
      amount,
      description: description || 'Coins awarded',
      createdAt:   new Date(),
      reference:   programId ? { programId } : undefined
    });

    await user.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('coinsAwarded', {
        coinsAwarded:     amount,
        newBalance:       user.coins,
        totalCoinsEarned: user.totalCoinsEarned,
        progressPercent:  Math.min(Math.round((user.totalCoinsEarned % THRESHOLD) / THRESHOLD * 100), 100),
        milestoneReached,
      });
    }

    res.json({
      success: true,
      message: `${amount} coins awarded${milestoneReached ? ' — Free service month unlocked!' : ''}`,
      wallet:  buildWallet(user),
      milestoneReached
    });
  } catch (error) {
    console.error('Award coins error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET MY COIN BALANCE (simple) ====================
// GET /api/rewards/balance
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('coins totalCoinsEarned freeServiceMonths');
    res.json({
      success:      true,
      coins:        user.coins || 0,
      totalEarned:  user.totalCoinsEarned || 0,
      freeMonths:   user.freeServiceMonths || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
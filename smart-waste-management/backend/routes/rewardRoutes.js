// ============================================================
// FEATURE 3: Gamified Reward System
// FILE: backend/routes/rewardRoutes.js
// BASE URL: /api/rewards
// ============================================================
// This file handles:
//   - Coin wallet (balance + full transaction history)
//   - Free service status check
//   - The approve-volunteer flow that TRIGGERS coin deposit
//     (called from admin — but the logic lives here for clarity)
// ============================================================

const express    = require('express');
const router     = express.Router();
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Program     = require('../models/Program');
const { protect, authorize } = require('../middleware/auth');

// ── Constants ────────────────────────────────────────────────
const COINS_PER_PROGRAM    = 100;   // Fixed: every approved volunteer gets exactly 100
const FREE_SERVICE_THRESHOLD = 1000; // Coins needed to unlock 1 free month

// ============================================================
// @desc    GET resident coin wallet — balance + history
// @route   GET /api/rewards/wallet
// @access  Private/Resident
// ============================================================
router.get('/wallet', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name coins totalCoinsEarned isServiceFree freeServiceUntil paymentStatus'
    );

    // Full transaction history (coin events only)
    const transactions = await Transaction.find({
      user: req.user._id,
      type: { $in: ['coin_earned', 'coin_spent'] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('reference.programId', 'title organization');

    const coinsEarned = user.totalCoinsEarned || 0;
    const coinBalance = user.coins || 0;
    const isFreeActive =
      user.isServiceFree &&
      user.freeServiceUntil &&
      new Date(user.freeServiceUntil) > new Date();

    res.json({
      success: true,
      wallet: {
        coinBalance,
        totalCoinsEarned:   coinsEarned,
        coinsUntilFree:     Math.max(0, FREE_SERVICE_THRESHOLD - coinsEarned),
        progressPercent:    Math.min(Math.round((coinsEarned / FREE_SERVICE_THRESHOLD) * 100), 100),
        milestonesReached:  Math.floor(coinsEarned / FREE_SERVICE_THRESHOLD), // how many free months earned ever
        freeService: {
          isActive:  isFreeActive,
          expiresAt: isFreeActive ? user.freeServiceUntil : null,
        },
      },
      transactions,
    });
  } catch (err) {
    console.error('Wallet fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    AWARD 100 coins to a resident (Admin triggers this)
//          Called internally after volunteer approval
// @route   POST /api/rewards/award/:userId
// @access  Private/Admin
// ============================================================
router.post('/award/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const { programId, reason } = req.body;
    const { userId } = req.params;

    const resident = await User.findById(userId);
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    // ── 1. Add exactly 100 coins using the User model method ──
    //       addCoins() also auto-triggers free service if ≥1000 reached
    const previousTotal = resident.totalCoinsEarned || 0;
    await resident.addCoins(COINS_PER_PROGRAM, { type: 'volunteer', programId });

    const newTotal   = resident.totalCoinsEarned;
    const newBalance = resident.coins;

    // ── 2. Log the transaction ────────────────────────────────
    await Transaction.create({
      user:        userId,
      type:        'coin_earned',
      amount:      COINS_PER_PROGRAM,
      description: reason || `Volunteer program approved — +${COINS_PER_PROGRAM} coins`,
      reference:   { programId: programId || null },
      balance:     newBalance,
      status:      'completed',
      metadata:    { awardedBy: req.user._id, previousTotal, newTotal },
    });

    // ── 3. Check milestone: did this award push them over 1000? ──
    const justUnlockedFreeService =
      newTotal >= FREE_SERVICE_THRESHOLD &&
      previousTotal < FREE_SERVICE_THRESHOLD;

    // ── 4. Send notification to resident ─────────────────────
    const notifMessage = justUnlockedFreeService
      ? `🎉 Amazing! You've reached ${FREE_SERVICE_THRESHOLD} coins and unlocked 1 month of FREE waste collection! +${COINS_PER_PROGRAM} coins added.`
      : `Your volunteer application was approved! +${COINS_PER_PROGRAM} coins added to your wallet. (${newTotal}/${FREE_SERVICE_THRESHOLD} total)`;

    await Notification.create({
      recipient: userId,
      sender:    req.user._id,
      type:      justUnlockedFreeService ? 'free_service_unlocked' : 'volunteer_approved',
      title:     justUnlockedFreeService ? '🎉 Free Service Unlocked!' : 'Coins Awarded!',
      message:   notifMessage,
      priority:  justUnlockedFreeService ? 'high' : 'medium',
      data: {
        coinsAwarded:     COINS_PER_PROGRAM,
        newBalance,
        newTotal,
        programId,
        freeServiceUntil: resident.freeServiceUntil,
        milestoneReached: justUnlockedFreeService,
      },
    });

    // ── 5. Real-time push to resident's socket room ───────────
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('coinsAwarded', {
        coinsAwarded:       COINS_PER_PROGRAM,
        newBalance,
        totalCoinsEarned:   newTotal,
        progressPercent:    Math.min(Math.round((newTotal / FREE_SERVICE_THRESHOLD) * 100), 100),
        milestoneReached:   justUnlockedFreeService,
        freeServiceUntil:   resident.freeServiceUntil,
        message:            notifMessage,
      });
    }

    res.json({
      success: true,
      message:              notifMessage,
      coinsAwarded:         COINS_PER_PROGRAM,
      newBalance,
      totalCoinsEarned:     newTotal,
      milestoneReached:     justUnlockedFreeService,
      freeServiceUnlocked:  justUnlockedFreeService,
      freeServiceUntil:     resident.freeServiceUntil,
    });
  } catch (err) {
    console.error('Award coins error:', err);
    res.status(500).json({ success: false, message: 'Server error during coin award' });
  }
});

// ============================================================
// @desc    GET coin leaderboard (top earners in same zone)
// @route   GET /api/rewards/leaderboard
// @access  Private/Resident
// ============================================================
router.get('/leaderboard', protect, authorize('resident'), async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('address');

    const topResidents = await User.find({
      role:           'resident',
      'address.zone': currentUser?.address?.zone,
      totalCoinsEarned: { $gt: 0 },
    })
      .sort({ totalCoinsEarned: -1 })
      .limit(10)
      .select('name totalCoinsEarned coins isServiceFree address');

    // Find requester's rank
    const myRankDoc = await User.countDocuments({
      role:             'resident',
      'address.zone':   currentUser?.address?.zone,
      totalCoinsEarned: { $gt: currentUser?.totalCoinsEarned || 0 },
    });

    res.json({
      success: true,
      leaderboard: topResidents,
      myRank: myRankDoc + 1,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;



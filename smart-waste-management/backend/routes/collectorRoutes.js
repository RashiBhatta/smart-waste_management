// ============================================================
// COLLECTOR FEATURE 1: Route Execution
// FILE: backend/routes/collectorRoutes.js
// BASE URL: /api/collector
// ============================================================
// Covers:
//   - Dashboard stats (today + all-time)
//   - Active route: collections assigned to this collector
//   - Zone board: unclaimed collections in collector's zone
//   - Claim a pickup (self-assign)
// ============================================================

const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const Collection = require('../models/Collection');
const User       = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// ============================================================
// @desc    GET collector dashboard stats (today + all-time)
// @route   GET /api/collector/stats
// @access  Private/Collector
// ============================================================
router.get('/stats', protect, authorize('collector'), async (req, res) => {
  try {
    const collectorId = req.user._id;

    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow  = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [allTime, todayAgg] = await Promise.all([
      // All-time aggregation
      Collection.aggregate([
        { $match: { collector: collectorId } },
        {
          $group: {
            _id: null,
            totalAssigned:  { $sum: 1 },
            totalCollected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            totalSkipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
            totalWeight:    { $sum: '$actualWeight' },
          },
        },
      ]),

      // Today only
      Collection.aggregate([
        {
          $match: {
            collector: collectorId,
            updatedAt: { $gte: today, $lt: tomorrow },
          },
        },
        {
          $group: {
            _id: null,
            collectedToday: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            weightToday:    { $sum: '$actualWeight' },
            activeJobs:     { $sum: { $cond: [{ $in: ['$status', ['Pending', 'In Progress', 'Scheduled']] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const a = allTime[0]  || { totalAssigned: 0, totalCollected: 0, totalSkipped: 0, totalWeight: 0 };
    const t = todayAgg[0] || { collectedToday: 0, weightToday: 0, activeJobs: 0 };

    const completionRate = a.totalAssigned > 0
      ? Math.round((a.totalCollected / a.totalAssigned) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        // Today
        collectedToday: t.collectedToday,
        weightToday:    Math.round(t.weightToday * 10) / 10,
        activeJobs:     t.activeJobs,
        // All-time
        totalAssigned:  a.totalAssigned,
        totalCollected: a.totalCollected,
        totalSkipped:   a.totalSkipped,
        totalWeight:    Math.round(a.totalWeight * 10) / 10,
        completionRate,
        avgWeight: a.totalCollected > 0
          ? Math.round((a.totalWeight / a.totalCollected) * 10) / 10
          : 0,
      },
    });
  } catch (err) {
    console.error('Collector stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET active route — all collections assigned to ME
// @route   GET /api/collector/my-route
// @access  Private/Collector
// ============================================================
router.get('/my-route', protect, authorize('collector'), async (req, res) => {
  try {
    const collections = await Collection.find({
      collector: req.user._id,
      status:    { $in: ['Pending', 'Scheduled', 'In Progress'] },
    })
      .populate('resident', 'name phone address')
      .sort({ sequence: 1, createdAt: 1 }); // respect route sequence if set

    res.json({ success: true, collections });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET zone board — unclaimed collections in my zone
// @route   GET /api/collector/zone-board
// @access  Private/Collector
// ============================================================
router.get('/zone-board', protect, authorize('collector'), async (req, res) => {
  try {
    const collectorZone = req.user.address?.zone;

    const available = await Collection.find({
      collector:       null,                          // not yet claimed
      status:          'Pending',
      'address.zone':  collectorZone,
    })
      .populate('resident', 'name phone')
      .sort({ createdAt: 1 });                        // oldest first — FIFO

    res.json({ success: true, collections: available });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    CLAIM a pickup from the zone board (self-assign)
// @route   PUT /api/collector/claim/:id
// @access  Private/Collector
// ============================================================
router.put('/claim/:id', protect, authorize('collector'), async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    // Guard: already claimed by someone
    if (collection.collector) {
      return res.status(400).json({
        success: false,
        message: 'This pickup has already been claimed by another collector',
      });
    }

    // Assign to this collector
    collection.collector = req.user._id;
    collection.status    = 'Scheduled';
    await collection.save();

    // Count how many jobs collector now has in route (for sequence)
    const routeLength = await Collection.countDocuments({
      collector: req.user._id,
      status:    { $in: ['Pending', 'Scheduled', 'In Progress'] },
    });
    collection.sequence = routeLength;
    await collection.save();

    // Notify admin
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          sender:    req.user._id,
          type:      'collection_update',
          title:     'Pickup Claimed',
          message:   `${req.user.name} claimed a pickup in Zone ${collection.address?.zone}`,
          data:      { collectionId: collection._id },
          priority:  'low',
        }))
      );
    }

    // Socket: remove from zone board for all collectors in same zone
    const io = req.app.get('io');
    if (io) {
      io.to(`zone-${collection.address?.zone?.toLowerCase()}`).emit('pickup_claimed', {
        collectionId: collection._id,
        claimedBy:    req.user.name,
      });
    }

    res.json({ success: true, message: 'Pickup added to your route!', collection });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET collection history for this collector
// @route   GET /api/collector/history
// @access  Private/Collector
// ============================================================
router.get('/history', protect, authorize('collector'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const collections = await Collection.find({
      collector: req.user._id,
      status:    { $in: ['Collected', 'Skipped'] },
    })
      .populate('resident', 'name address')
      .sort({ completedDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Collection.countDocuments({
      collector: req.user._id,
      status:    { $in: ['Collected', 'Skipped'] },
    });

    res.json({
      success: true,
      collections,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
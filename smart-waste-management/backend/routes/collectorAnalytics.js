// ============================================================
// COLLECTOR FEATURE 3: Performance Analytics
// FILE: backend/routes/collectorAnalytics.js
// BASE URL: /api/collector/analytics
// ============================================================
// Routes:
//   GET /api/collector/analytics/summary      — full KPI summary
//   GET /api/collector/analytics/daily        — last 30 days chart data
//   GET /api/collector/analytics/waste-types  — pie/bar breakdown
//   GET /api/collector/analytics/ratings      — feedback summary + recent reviews
//   POST /api/collections/:id/feedback        — resident submits feedback (updates Collector rating)
// ============================================================

const express    = require('express');
const router     = express.Router();
const Collection = require('../models/Collection');
const Collector  = require('../models/Collector');
const User       = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ── Shared date helpers ───────────────────────────────────────
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const daysAgo    = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return startOfDay(d); };

// ============================================================
// @desc    GET full performance summary (KPIs)
// @route   GET /api/collector/analytics/summary
// @access  Private/Collector
// ============================================================
router.get('/summary', protect, authorize('collector'), async (req, res) => {
  try {
    const uid   = req.user._id;
    const today = startOfDay(new Date());
    const week  = daysAgo(7);
    const month = daysAgo(30);

    const [allTime, thisWeek, thisMonth, todayAgg, collectorDoc] = await Promise.all([
      // All-time aggregate
      Collection.aggregate([
        { $match: { collector: uid } },
        {
          $group: {
            _id: null,
            total:     { $sum: 1 },
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
            weight:    { $sum: '$actualWeight' },
            avgWeight: { $avg: { $cond: [{ $eq: ['$status', 'Collected'] }, '$actualWeight', null] } },
          },
        },
      ]),

      // This week
      Collection.aggregate([
        { $match: { collector: uid, updatedAt: { $gte: week } } },
        {
          $group: {
            _id: null,
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            weight:    { $sum: '$actualWeight' },
          },
        },
      ]),

      // This month
      Collection.aggregate([
        { $match: { collector: uid, updatedAt: { $gte: month } } },
        {
          $group: {
            _id: null,
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            weight:    { $sum: '$actualWeight' },
          },
        },
      ]),

      // Today
      Collection.aggregate([
        { $match: { collector: uid, updatedAt: { $gte: today } } },
        {
          $group: {
            _id: null,
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            active:    { $sum: { $cond: [{ $in: ['$status', ['Pending', 'Scheduled', 'In Progress']] }, 1, 0] } },
            weight:    { $sum: '$actualWeight' },
          },
        },
      ]),

      // Collector profile (rating)
      Collector.findOne({ user: uid }).select('rating totalRatings assignedZone vehicleType'),
    ]);

    const a  = allTime[0]   || { total: 0, collected: 0, skipped: 0, weight: 0, avgWeight: 0 };
    const w  = thisWeek[0]  || { collected: 0, weight: 0 };
    const m  = thisMonth[0] || { collected: 0, weight: 0 };
    const t  = todayAgg[0]  || { collected: 0, active: 0, weight: 0 };

    const completionRate = a.total > 0 ? Math.round((a.collected / a.total) * 100) : 0;

    res.json({
      success: true,
      summary: {
        today: {
          collected: t.collected,
          active:    t.active,
          weight:    Math.round(t.weight * 10) / 10,
        },
        week: {
          collected: w.collected,
          weight:    Math.round(w.weight * 10) / 10,
        },
        month: {
          collected: m.collected,
          weight:    Math.round(m.weight * 10) / 10,
        },
        allTime: {
          total:          a.total,
          collected:      a.collected,
          skipped:        a.skipped,
          weight:         Math.round(a.weight * 10) / 10,
          avgWeight:      Math.round((a.avgWeight || 0) * 10) / 10,
          completionRate,
        },
        rating: {
          average:      collectorDoc ? Math.round(collectorDoc.rating * 10) / 10 : 0,
          totalRatings: collectorDoc?.totalRatings || 0,
        },
        profile: {
          zone:        collectorDoc?.assignedZone || req.user.address?.zone,
          vehicleType: collectorDoc?.vehicleType,
        },
      },
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET daily chart data (last 30 days)
// @route   GET /api/collector/analytics/daily
// @access  Private/Collector
// ============================================================
router.get('/daily', protect, authorize('collector'), async (req, res) => {
  try {
    const since = daysAgo(29); // 30 days inclusive

    const raw = await Collection.aggregate([
      {
        $match: {
          collector: req.user._id,
          updatedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
          },
          collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
          skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
          weight:    { $sum: '$actualWeight' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill gaps — produce an entry for every one of the last 30 days
    const dataMap = {};
    raw.forEach((r) => { dataMap[r._id] = r; });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d   = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date:      key,
        label:     d.toLocaleDateString('en-NP', { month: 'short', day: 'numeric' }),
        collected: dataMap[key]?.collected || 0,
        skipped:   dataMap[key]?.skipped   || 0,
        weight:    Math.round((dataMap[key]?.weight || 0) * 10) / 10,
      });
    }

    res.json({ success: true, days });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET waste-type breakdown
// @route   GET /api/collector/analytics/waste-types
// @access  Private/Collector
// ============================================================
router.get('/waste-types', protect, authorize('collector'), async (req, res) => {
  try {
    const breakdown = await Collection.aggregate([
      { $match: { collector: req.user._id, status: 'Collected' } },
      {
        $group: {
          _id:    '$wasteType',
          count:  { $sum: 1 },
          weight: { $sum: '$actualWeight' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = breakdown.reduce((s, b) => s + b.count, 0);
    const data  = breakdown.map((b) => ({
      type:    b._id,
      count:   b.count,
      weight:  Math.round(b.weight * 10) / 10,
      percent: total > 0 ? Math.round((b.count / total) * 100) : 0,
    }));

    res.json({ success: true, breakdown: data, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET ratings & recent feedback
// @route   GET /api/collector/analytics/ratings
// @access  Private/Collector
// ============================================================
router.get('/ratings', protect, authorize('collector'), async (req, res) => {
  try {
    const uid = req.user._id;

    // Recent reviews from collections
    const reviewed = await Collection.find({
      collector:          uid,
      'feedback.rating':  { $exists: true },
    })
      .populate('resident', 'name')
      .select('feedback wasteType completedDate')
      .sort({ 'feedback.rating': -1, completedDate: -1 })
      .limit(20);

    // Distribution (1–5 stars)
    const dist = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviewed.filter((r) => r.feedback?.rating === star).length,
    }));

    const collectorDoc = await Collector.findOne({ user: uid }).select('rating totalRatings');

    res.json({
      success: true,
      average:      collectorDoc ? Math.round(collectorDoc.rating * 10) / 10 : 0,
      totalRatings: collectorDoc?.totalRatings || reviewed.length,
      distribution: dist,
      reviews:      reviewed.map((r) => ({
        id:      r._id,
        rating:  r.feedback.rating,
        comment: r.feedback.comment,
        resident: r.resident?.name || 'Resident',
        type:    r.wasteType,
        date:    r.completedDate,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    Resident submits feedback for a completed collection
// @route   POST /api/collections/:id/feedback
// @access  Private/Resident
// ============================================================
router.post('/collections/:id/feedback', protect, authorize('resident'), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    if (collection.resident.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your collection' });
    }
    if (collection.status !== 'Collected') {
      return res.status(400).json({ success: false, message: 'Can only rate completed collections' });
    }
    if (collection.feedback?.rating) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted' });
    }

    // Save feedback on collection
    collection.feedback = { rating: Number(rating), comment: comment?.trim() || '' };
    await collection.save();

    // Update Collector profile rating
    if (collection.collector) {
      const collectorDoc = await Collector.findOne({ user: collection.collector });
      if (collectorDoc) {
        collectorDoc.updateRating(Number(rating));
        await collectorDoc.save();
      }
    }

    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
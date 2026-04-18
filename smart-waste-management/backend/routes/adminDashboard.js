// ============================================================
// ADMIN FEATURE 1: System-Wide Dashboard
// FILE: backend/routes/adminDashboard.js
// BASE URL: /api/admin
// ============================================================
// Routes:
//   GET /api/admin/dashboard  — single endpoint, all KPIs
//   GET /api/admin/analytics  — charts (daily 30d, zone, waste-type)
//   GET /api/admin/users      — paginated user list with filters
//   PUT /api/admin/users/:id/status — activate / deactivate user
// ============================================================

const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const Collection = require('../models/Collection');
const Program    = require('../models/Program');
const Payment    = require('../models/Payment');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// ── Date helpers ─────────────────────────────────────────────
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysAgo    = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return startOfDay(d); };

// ============================================================
// @desc    GET system-wide KPI snapshot
// @route   GET /api/admin/dashboard
// @access  Private/Admin
// ============================================================
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const today    = startOfDay(new Date());
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const month    = daysAgo(30);

    const [
      userCounts,
      collectionStats,
      todayCollections,
      programStats,
      revenueStats,
      pendingVolunteers,
      recentCollections,
      recentPayments,
    ] = await Promise.all([

      // ── Users breakdown ───────────────────────────────────
      User.aggregate([
        {
          $group: {
            _id:            '$role',
            count:          { $sum: 1 },
            activePayment:  { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
            freeService:    { $sum: { $cond: [{ $eq: ['$isServiceFree', true] }, 1, 0] } },
          },
        },
      ]),

      // ── All-time collection stats ─────────────────────────
      Collection.aggregate([
        {
          $group: {
            _id:       null,
            total:     { $sum: 1 },
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
            pending:   { $sum: { $cond: [{ $in:  ['$status', ['Pending', 'Scheduled', 'In Progress']] }, 1, 0] } },
            totalWeight: { $sum: '$actualWeight' },
          },
        },
      ]),

      // ── Today's collections ───────────────────────────────
      Collection.aggregate([
        { $match: { updatedAt: { $gte: today, $lt: tomorrow } } },
        {
          $group: {
            _id:       null,
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
            weight:    { $sum: '$actualWeight' },
          },
        },
      ]),

      // ── Program stats ─────────────────────────────────────
      Program.aggregate([
        {
          $group: {
            _id:        '$status',
            count:      { $sum: 1 },
            volunteers: { $sum: '$currentVolunteers' },
          },
        },
      ]),

      // ── Revenue (last 30 days) ────────────────────────────
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: month } } },
        {
          $group: {
            _id:        '$paymentMethod',
            total:      { $sum: '$amount' },
            count:      { $sum: 1 },
            freeCount:  { $sum: { $cond: [{ $eq: ['$isFreeService', true] }, 1, 0] } },
          },
        },
      ]),

      // ── Pending volunteer approvals ───────────────────────
      Program.aggregate([
        { $unwind: '$volunteers' },
        { $match: { 'volunteers.status': 'pending' } },
        { $count: 'total' },
      ]),

      // ── Recent 8 collections ──────────────────────────────
      Collection.find()
        .populate('resident',  'name address')
        .populate('collector', 'name')
        .sort({ updatedAt: -1 })
        .limit(8)
        .select('status wasteType actualWeight address updatedAt'),

      // ── Recent 5 payments ─────────────────────────────────
      Payment.find({ status: 'completed' })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount paymentMethod isFreeService createdAt'),
    ]);

    // ── Shape user counts ─────────────────────────────────────
    const byRole = {};
    userCounts.forEach((r) => { byRole[r._id] = r; });
    const residents  = byRole['resident']  || { count: 0, activePayment: 0, freeService: 0 };
    const collectors = byRole['collector'] || { count: 0 };

    // ── Shape collection stats ────────────────────────────────
    const cs = collectionStats[0] || { total: 0, collected: 0, skipped: 0, pending: 0, totalWeight: 0 };
    const td = todayCollections[0] || { collected: 0, skipped: 0, weight: 0 };

    // ── Shape program stats ───────────────────────────────────
    const byStatus = {};
    programStats.forEach((p) => { byStatus[p._id] = p; });
    const totalVolunteers = programStats.reduce((s, p) => s + p.volunteers, 0);

    // ── Shape revenue ─────────────────────────────────────────
    const totalRevenue  = revenueStats.reduce((s, r) => s + (r.isFreeService ? 0 : r.total), 0);
    const cashPayments  = revenueStats.find(r => r._id === 'khalti' || r._id === 'esewa');
    const freeRedemptions = revenueStats.reduce((s, r) => s + (r.freeCount || 0), 0);

    res.json({
      success: true,
      kpis: {
        users: {
          residents:    residents.count,
          collectors:   collectors.count,
          paidThisMonth: residents.activePayment,
          freeService:  residents.freeService,
          unpaid:       residents.count - residents.activePayment - residents.freeService,
        },
        collections: {
          total:       cs.total,
          collected:   cs.collected,
          skipped:     cs.skipped,
          pending:     cs.pending,
          totalWeight: Math.round(cs.totalWeight * 10) / 10,
          completionRate: cs.total > 0 ? Math.round(((cs.collected + cs.skipped) / cs.total) * 100) : 0,
        },
        today: {
          collected: td.collected,
          skipped:   td.skipped,
          weight:    Math.round(td.weight * 10) / 10,
        },
        programs: {
          active:     byStatus['active']?.count    || 0,
          upcoming:   byStatus['upcoming']?.count  || 0,
          completed:  byStatus['completed']?.count || 0,
          totalVolunteers,
          pendingApprovals: pendingVolunteers[0]?.total || 0,
        },
        revenue: {
          last30Days:     totalRevenue,
          freeRedemptions,
        },
      },
      recentCollections,
      recentPayments,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET chart data for analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
// ============================================================
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const since = daysAgo(29);

    const [dailyRaw, zoneRaw, typeRaw, revenueRaw] = await Promise.all([

      // Daily collections last 30 days
      Collection.aggregate([
        { $match: { updatedAt: { $gte: since } } },
        {
          $group: {
            _id:       { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            collected: { $sum: { $cond: [{ $eq: ['$status', 'Collected'] }, 1, 0] } },
            skipped:   { $sum: { $cond: [{ $eq: ['$status', 'Skipped']   }, 1, 0] } },
            weight:    { $sum: '$actualWeight' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Zone-wise totals
      Collection.aggregate([
        { $match: { status: 'Collected' } },
        {
          $group: {
            _id:    '$address.zone',
            count:  { $sum: 1 },
            weight: { $sum: '$actualWeight' },
          },
        },
        { $sort: { weight: -1 } },
      ]),

      // Waste type breakdown
      Collection.aggregate([
        { $match: { status: 'Collected' } },
        {
          $group: {
            _id:    '$wasteType',
            count:  { $sum: 1 },
            weight: { $sum: '$actualWeight' },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Daily revenue last 30 days
      Payment.aggregate([
        { $match: { status: 'completed', isFreeService: false, createdAt: { $gte: since } } },
        {
          $group: {
            _id:    { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            amount: { $sum: '$amount' },
            count:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Fill daily gaps
    const dailyMap   = {};
    const revenueMap = {};
    dailyRaw.forEach((r)   => { dailyMap[r._id]   = r; });
    revenueRaw.forEach((r) => { revenueMap[r._id] = r; });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d   = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date:      key,
        label:     d.toLocaleDateString('en-NP', { month: 'short', day: 'numeric' }),
        collected: dailyMap[key]?.collected || 0,
        skipped:   dailyMap[key]?.skipped   || 0,
        weight:    Math.round((dailyMap[key]?.weight || 0) * 10) / 10,
        revenue:   revenueMap[key]?.amount  || 0,
      });
    }

    // Total weight for zone percentages
    const totalWeight = zoneRaw.reduce((s, z) => s + z.weight, 0);
    const typeTotal   = typeRaw.reduce((s, t) => s + t.count, 0);

    res.json({
      success: true,
      daily: days,
      zones: zoneRaw.map((z) => ({
        zone:    (z._id || 'Unknown').toUpperCase(),
        count:   z.count,
        weight:  Math.round(z.weight * 10) / 10,
        percent: totalWeight > 0 ? Math.round((z.weight / totalWeight) * 100) : 0,
      })),
      wasteTypes: typeRaw.map((t) => ({
        type:    t._id,
        count:   t.count,
        weight:  Math.round(t.weight * 10) / 10,
        percent: typeTotal > 0 ? Math.round((t.count / typeTotal) * 100) : 0,
      })),
      landfillCapacity: {
        used:       Math.round(zoneRaw.reduce((s, z) => s + z.weight, 0) * 10) / 10,
        total:      50000,  // configurable max capacity (kg)
        percentage: Math.min(Math.round((zoneRaw.reduce((s, z) => s + z.weight, 0) / 50000) * 100), 100),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    GET all users (paginated + filterable)
// @route   GET /api/admin/users
// @access  Private/Admin
// ============================================================
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, paymentStatus, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (role)          query.role          = role;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    Activate / deactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
// ============================================================
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: active },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user, message: `User ${active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// @desc    Assign collection to a specific collector
// @route   PUT /api/admin/collections/:id/assign
// @access  Private/Admin
// ============================================================
router.put('/collections/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { collectorId } = req.body;
    if (!collectorId) return res.status(400).json({ success: false, message: 'collectorId required' });

    const [collection, collector] = await Promise.all([
      Collection.findById(req.params.id),
      User.findById(collectorId),
    ]);

    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    if (!collector || collector.role !== 'collector') {
      return res.status(400).json({ success: false, message: 'Invalid collector' });
    }

    collection.collector = collectorId;
    collection.status    = 'Scheduled';
    await collection.save();

    // Notify the collector
    await Notification.create({
      recipient: collectorId,
      sender:    req.user._id,
      type:      'collection_update',
      title:     '📦 New Pickup Assigned',
      message:   `Admin assigned you a pickup in Zone ${collection.address?.zone?.toUpperCase()}`,
      data:      { collectionId: collection._id },
      priority:  'high',
    });

    const io = req.app.get('io');
    if (io) io.to(collectorId.toString()).emit('new_assignment', { collectionId: collection._id });

    res.json({ success: true, collection });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
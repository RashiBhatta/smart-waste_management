// ============================================================
// COLLECTOR FEATURE 2: Status Reporting with Photo Evidence
// FILE: backend/routes/collectionStatusRoutes.js
// BASE URL: /api/collections  (merged into existing collection router)
// ============================================================
// New / extended routes:
//   PUT  /api/collections/:id/status        — update status + weight + notes
//   POST /api/collections/:id/photo         — upload photo evidence (multer)
//   GET  /api/collections/:id               — single collection detail (collector view)
//   POST /api/collections/:id/skip          — skip with mandatory reason
// ============================================================

const express      = require('express');
const router       = express.Router();
const path         = require('path');
const multer       = require('multer');
const Collection   = require('../models/Collection');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// ── Photo upload config (local disk, /uploads/evidence/) ────
const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/evidence'),
  filename:    (req, file, cb) =>
    cb(null, `evidence-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`),
});

const uploadEvidence = multer({
  storage: evidenceStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Helper: fire socket events after a status change ────────
const emitStatusChange = (io, collection, collectorName, newStatus) => {
  if (!io) return;
  // Admin room
  io.to('admins').emit('collection_updated', {
    collectionId: collection._id,
    status:       newStatus,
    collector:    collectorName,
    zone:         collection.address?.zone,
  });
  // Resident's private room
  io.to(collection.resident._id.toString()).emit('collection_status', {
    collectionId: collection._id,
    status:       newStatus,
    message:      `Your waste collection is now: ${newStatus}`,
  });
  // Zone room (live board)
  if (collection.address?.zone) {
    io.to(`zone-${collection.address.zone.toLowerCase()}`).emit('zone_update', {
      collectionId: collection._id,
      status:       newStatus,
    });
  }
};

// ============================================================
// @desc    GET single collection (full detail — collector view)
// @route   GET /api/collections/:id
// @access  Private (collector, admin, or owning resident)
// ============================================================
router.get('/:id', protect, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('resident',  'name phone email address')
      .populate('collector', 'name phone');

    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

    // Access guard
    const uid  = req.user._id.toString();
    const role = req.user.role;
    const isOwner       = collection.resident?._id.toString()  === uid;
    const isAssigned    = collection.collector?._id?.toString() === uid;
    const isAdmin       = role === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    UPDATE collection status (Collector / Admin)
// @route   PUT /api/collections/:id/status
// @access  Private/Collector,Admin
// ============================================================
router.put('/:id/status', protect, authorize('collector', 'admin'), async (req, res) => {
  try {
    const { status, actualWeight, notes } = req.body;

    const VALID_STATUSES = ['Pending', 'In Progress', 'Collected', 'Skipped'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    if (status === 'Collected' && (!actualWeight || Number(actualWeight) <= 0)) {
      return res.status(400).json({ success: false, message: 'actualWeight is required when marking as Collected' });
    }

    if (status === 'Skipped' && !notes?.trim()) {
      return res.status(400).json({ success: false, message: 'A skip reason (notes) is required' });
    }

    const collection = await Collection.findById(req.params.id).populate('resident', 'name _id');
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

    // Collector may only update collections assigned to them
    if (
      req.user.role === 'collector' &&
      collection.collector?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not assigned to this collection' });
    }

    const oldStatus          = collection.status;
    collection.status        = status;
    if (actualWeight) collection.actualWeight = Number(actualWeight);
    if (notes)        collection.notes        = notes.trim();
    if (status === 'Collected') collection.completedDate = new Date();

    await collection.save();

    // ── Notifications ─────────────────────────────────────
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          sender:    req.user._id,
          type:      'collection_update',
          title:     'Collection Status Updated',
          message:   `${req.user.name} changed ${collection.resident?.name}'s pickup from ${oldStatus} → ${status}`,
          data:      { collectionId: collection._id, status, oldStatus },
          priority:  status === 'Skipped' ? 'high' : 'medium',
        }))
      );
    }

    if (status === 'Collected') {
      await Notification.create({
        recipient: collection.resident._id,
        sender:    req.user._id,
        type:      'collection_update',
        title:     '✅ Waste Collected!',
        message:   `Your waste has been collected (${Number(actualWeight)} kg). Great job sorting!`,
        data:      { collectionId: collection._id },
      });
    }

    if (status === 'Skipped') {
      await Notification.create({
        recipient: collection.resident._id,
        sender:    req.user._id,
        type:      'collection_update',
        title:     '⚠️ Pickup Skipped',
        message:   `Your scheduled pickup was skipped. Reason: ${notes}`,
        data:      { collectionId: collection._id },
        priority:  'high',
      });
    }

    // Socket events
    emitStatusChange(req.app.get('io'), collection, req.user.name, status);

    res.json({ success: true, collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    UPLOAD photo evidence for a collection
// @route   POST /api/collections/:id/photo
// @access  Private/Collector
// ============================================================
router.post(
  '/:id/photo',
  protect,
  authorize('collector'),
  uploadEvidence.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      const collection = await Collection.findById(req.params.id);
      if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

      if (collection.collector?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not your assignment' });
      }

      // Store relative URL (served as static from /uploads/)
      const photoUrl = `/uploads/evidence/${req.file.filename}`;
      collection.photoEvidence = photoUrl;
      await collection.save();

      // Notify admins that photo was attached
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        await Notification.insertMany(
          admins.map((a) => ({
            recipient: a._id,
            sender:    req.user._id,
            type:      'collection_update',
            title:     '📸 Photo Evidence Uploaded',
            message:   `${req.user.name} attached photo evidence for collection #${collection._id.toString().slice(-6).toUpperCase()}`,
            data:      { collectionId: collection._id, photoUrl },
            priority:  'low',
          }))
        );
      }

      res.json({ success: true, photoUrl, message: 'Photo evidence saved' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ============================================================
// @desc    SKIP a collection with mandatory reason
// @route   POST /api/collections/:id/skip
// @access  Private/Collector
// ============================================================
router.post('/:id/skip', protect, authorize('collector'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Skip reason is required' });
    }

    const collection = await Collection.findById(req.params.id).populate('resident', 'name _id');
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });

    if (collection.collector?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to this collection' });
    }

    collection.status = 'Skipped';
    collection.notes  = reason.trim();
    await collection.save();

    // Notify resident
    await Notification.create({
      recipient: collection.resident._id,
      sender:    req.user._id,
      type:      'collection_update',
      title:     '⚠️ Pickup Skipped',
      message:   `Your scheduled pickup was skipped. Reason: ${reason.trim()}`,
      data:      { collectionId: collection._id },
      priority:  'high',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          sender:    req.user._id,
          type:      'collection_update',
          title:     '⚠️ Collection Skipped',
          message:   `${req.user.name} skipped ${collection.resident?.name}'s pickup. Reason: ${reason}`,
          data:      { collectionId: collection._id },
          priority:  'high',
        }))
      );
    }

    emitStatusChange(req.app.get('io'), collection, req.user.name, 'Skipped');

    res.json({ success: true, message: 'Collection skipped', collection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
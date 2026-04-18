// routes/notifications.js
// Safe model loading — uses mongoose.models to prevent "Cannot overwrite model" error

const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const { protect } = require('../middleware/auth');

// ✅ Safe model loading — reuse existing compiled model if it exists
const Notification = mongoose.models.Notification || require('../models/Notification');

// ── GET /api/notifications ────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') filter.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, read: false })
    ]);

    res.json({ success: true, notifications, total, unreadCount, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/notifications/unread/count ──────────────────────
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/:id/read ──────────────────────────
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/read-all ──────────────────────────
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/notifications/:id ────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/notifications/bulk-delete ──────────────────────
router.post('/bulk-delete', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    await Notification.deleteMany({ _id: { $in: ids }, recipient: req.user._id });
    res.json({ success: true, message: `${ids.length} notifications deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/notifications/bulk-read ────────────────────────
router.post('/bulk-read', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    await Notification.updateMany(
      { _id: { $in: ids }, recipient: req.user._id },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: `${ids.length} notifications marked as read` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
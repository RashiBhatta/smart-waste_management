// // const express = require('express');
// // const router = express.Router();
// // const Notification = require('../models/Notification');
// // const { protect } = require('../middleware/auth');

// // // @desc    Get user notifications (with sorting and filtering)
// // // @route   GET /api/notifications
// // router.get('/', protect, async (req, res) => {
// //   try {
// //     const { 
// //       page = 1, 
// //       limit = 20, 
// //       filter = 'all',
// //       type,
// //       search,
// //       sort = 'desc' 
// //     } = req.query;
    
// //     const skip = (page - 1) * limit;
// //     let query = { recipient: req.user._id };

// //     if (filter === 'unread') query.read = false;
// //     if (filter === 'archived') query.archived = true;
// //     if (type && type !== 'all') query.type = type;

// //     if (search) {
// //       query.$or = [
// //         { title: { $regex: search, $options: 'i' } },
// //         { message: { $regex: search, $options: 'i' } }
// //       ];
// //     }

// //     const sortOrder = sort === 'asc' ? 1 : -1;
    
// //     const notifications = await Notification.find(query)
// //       .populate('sender', 'name email')
// //       .sort({ createdAt: sortOrder })
// //       .skip(skip)
// //       .limit(parseInt(limit));

// //     const total = await Notification.countDocuments(query);
// //     const unreadCount = await Notification.countDocuments({
// //       recipient: req.user._id,
// //       read: false
// //     });

// //     res.json({
// //       success: true,
// //       notifications,
// //       unreadCount,
// //       currentPage: parseInt(page),
// //       totalPages: Math.ceil(total / limit),
// //       total
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Server error' });
// //   }
// // });

// // // @desc    Get unread count (ALIASED TO MATCH FRONTEND)
// // // @route   GET /api/notifications/unread-count
// // // @route   GET /api/notifications/unread/count
// // router.get(['/unread-count', '/unread/count'], protect, async (req, res) => {
// //   try {
// //     const count = await Notification.countDocuments({
// //       recipient: req.user._id,
// //       read: false
// //     });

// //     res.json({
// //       success: true,
// //       count
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Server error' });
// //   }
// // });

// // // @desc    Mark notification as read
// // // @route   PUT /api/notifications/:id/read
// // router.put('/:id/read', protect, async (req, res) => {
// //   try {
// //     const notification = await Notification.findOneAndUpdate(
// //       { _id: req.params.id, recipient: req.user._id },
// //       { read: true, readAt: new Date() },
// //       { new: true }
// //     );

// //     if (!notification) {
// //       return res.status(404).json({ success: false, message: 'Not found' });
// //     }

// //     const unreadCount = await Notification.countDocuments({
// //       recipient: req.user._id,
// //       read: false
// //     });

// //     res.json({ success: true, notification, unreadCount });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Server error' });
// //   }
// // });

// // // @desc    Mark all as read
// // // @route   PUT /api/notifications/read-all
// // router.put('/read-all', protect, async (req, res) => {
// //   try {
// //     await Notification.updateMany(
// //       { recipient: req.user._id, read: false },
// //       { read: true, readAt: new Date() }
// //     );

// //     res.json({ success: true, message: 'All marked as read' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Server error' });
// //   }
// // });

// // // @desc    Delete notification
// // // @route   DELETE /api/notifications/:id
// // router.delete('/:id', protect, async (req, res) => {
// //   try {
// //     const notification = await Notification.findOneAndDelete({
// //       _id: req.params.id,
// //       recipient: req.user._id
// //     });

// //     if (!notification) {
// //       return res.status(404).json({ success: false, message: 'Not found' });
// //     }

// //     res.json({ success: true, message: 'Deleted' });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Server error' });
// //   }
// // });

// // // @desc    Create test notification
// // // @route   POST /api/notifications/test
// // router.post('/test', protect, async (req, res) => {
// //   try {
// //     const { title, message, type } = req.body;
    
// //     const notification = await Notification.create({
// //       recipient: req.user._id,
// //       sender: req.user._id,
// //       type: type || 'system',
// //       title: title || 'Test Alert',
// //       message: message || 'Notification system is live!',
// //     });

// //     // Real-time emit
// //     const io = req.app.get('io');
// //     if (io) {
// //       io.to(req.user._id.toString()).emit('newNotification', notification);
// //     }

// //     res.json({ success: true, notification });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: 'Server error' });
// //   }
// // });

// // module.exports = router;







// const express = require('express');
// const router = express.Router();
// const Notification = require('../models/Notification');
// const { protect } = require('../middleware/auth');

// // @desc    Get user notifications (with sorting and filtering)
// // @route   GET /api/notifications
// // @access  Private
// router.get('/', protect, async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 20, 
//       filter = 'all',
//       type,
//       search,
//       sort = 'desc' 
//     } = req.query;
    
//     const skip = (page - 1) * limit;
//     let query = { recipient: req.user._id };

//     if (filter === 'unread') query.read = false;
//     if (filter === 'archived') query.archived = true;
//     if (type && type !== 'all') query.type = type;

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { message: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const sortOrder = sort === 'asc' ? 1 : -1;
    
//     const notifications = await Notification.find(query)
//       .populate('sender', 'name email')
//       .sort({ createdAt: sortOrder })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Notification.countDocuments(query);
//     const unreadCount = await Notification.countDocuments({
//       recipient: req.user._id,
//       read: false
//     });

//     res.json({
//       success: true,
//       notifications,
//       unreadCount,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//       total
//     });
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // @desc    Get unread count (ALIASED TO MATCH FRONTEND)
// // @route   GET /api/notifications/unread-count
// // @route   GET /api/notifications/unread/count
// // @access  Private
// router.get(['/unread-count', '/unread/count'], protect, async (req, res) => {
//   try {
//     const count = await Notification.countDocuments({
//       recipient: req.user._id,
//       read: false
//     });

//     res.json({
//       success: true,
//       count
//     });
//   } catch (error) {
//     console.error('Error fetching unread count:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // @desc    Mark notification as read
// // @route   PUT /api/notifications/:id/read
// // @access  Private
// router.put('/:id/read', protect, async (req, res) => {
//   try {
//     const notification = await Notification.findOneAndUpdate(
//       { _id: req.params.id, recipient: req.user._id },
//       { read: true, readAt: new Date() },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ success: false, message: 'Not found' });
//     }

//     const unreadCount = await Notification.countDocuments({
//       recipient: req.user._id,
//       read: false
//     });

//     res.json({ success: true, notification, unreadCount });
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // @desc    Mark all as read
// // @route   PUT /api/notifications/read-all
// // @access  Private
// router.put('/read-all', protect, async (req, res) => {
//   try {
//     await Notification.updateMany(
//       { recipient: req.user._id, read: false },
//       { read: true, readAt: new Date() }
//     );

//     res.json({ success: true, message: 'All marked as read' });
//   } catch (error) {
//     console.error('Error marking all as read:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // @desc    Delete notification
// // @route   DELETE /api/notifications/:id
// // @access  Private
// router.delete('/:id', protect, async (req, res) => {
//   try {
//     const notification = await Notification.findOneAndDelete({
//       _id: req.params.id,
//       recipient: req.user._id
//     });

//     if (!notification) {
//       return res.status(404).json({ success: false, message: 'Not found' });
//     }

//     res.json({ success: true, message: 'Deleted' });
//   } catch (error) {
//     console.error('Error deleting notification:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // @desc    Delete all notifications
// // @route   DELETE /api/notifications/all
// // @access  Private
// router.delete('/all', protect, async (req, res) => {
//   try {
//     await Notification.deleteMany({ recipient: req.user._id });
//     res.json({ success: true, message: 'All notifications cleared' });
//   } catch (error) {
//     console.error('Error clearing notifications:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // @desc    Create test notification
// // @route   POST /api/notifications/test
// // @access  Private
// router.post('/test', protect, async (req, res) => {
//   try {
//     const { title, message, type } = req.body;
    
//     const notification = await Notification.create({
//       recipient: req.user._id,
//       sender: req.user._id,
//       type: type || 'system',
//       title: title || 'Test Alert',
//       message: message || 'Notification system is live!',
//     });

//     // Real-time emit
//     const io = req.app.get('io');
//     if (io) {
//       io.to(req.user._id.toString()).emit('newNotification', notification);
//     }

//     res.json({ success: true, notification });
//   } catch (error) {
//     console.error('Error creating test notification:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// module.exports = router;








const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  type: { 
    type: String, 
    enum: [
      'volunteer_request',
      'volunteer_approved',
      'volunteer_rejected',
      'collection_update',
      'payment_received',
      'free_service_unlocked',
      'program_created',
      'system_alert',
      'info',
      'success',
      'warning',
      'error'
    ], 
    default: 'info'
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  readAt: {
    type: Date
  },
  archived: {
    type: Boolean,
    default: false
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: '30d' // Auto-delete after 30 days
  }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('Notification', notificationSchema);
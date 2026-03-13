// // const express = require('express');
// // const router = express.Router();
// // const User = require('../models/User');
// // const Collection = require('../models/Collection');
// // const Program = require('../models/Program');
// // const Payment = require('../models/Payment');
// // const Notification = require('../models/Notification');
// // const { protect, resident, checkMonthlyFee } = require('../middleware/auth');
// // const { calculateCoins, checkFreeServiceEligibility, calculateMonthlyFee } = require('../utils/coinCalculator');

// // // @desc    Get resident dashboard stats
// // // @route   GET /api/resident/stats
// // router.get('/stats', protect, resident, async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const now = new Date();
// //     const currentMonth = now.getMonth();
// //     const currentYear = now.getFullYear();

// //     const [
// //       totalCollections,
// //       completedCollections,
// //       pendingCollections,
// //       totalCoinsEarned,
// //       upcomingCollections,
// //       joinedPrograms,
// //       pendingProgramRequests,
// //       recentActivity,
// //       monthlyFeeStatus,
// //       monthlyStats
// //     ] = await Promise.all([
// //       Collection.countDocuments({ resident: userId }),
// //       Collection.countDocuments({ resident: userId, status: 'completed' }),
// //       Collection.countDocuments({ resident: userId, status: { $in: ['pending', 'assigned'] } }),
// //       Collection.aggregate([
// //         { $match: { resident: userId, status: 'completed' } },
// //         { $group: { _id: null, total: { $sum: '$actualCoins' } } }
// //       ]),
// //       Collection.find({
// //         resident: userId,
// //         status: { $in: ['pending', 'assigned'] },
// //         scheduledDate: { $gte: now }
// //       })
// //       .populate('collector', 'name phone')
// //       .sort({ scheduledDate: 1 })
// //       .limit(5),
// //       Program.find({
// //         'volunteers.user': userId,
// //         'volunteers.status': { $in: ['approved', 'completed'] }
// //       })
// //       .select('title date location status rewardCoins')
// //       .sort({ date: 1 })
// //       .limit(5),
// //       Program.countDocuments({
// //         'volunteers.user': userId,
// //         'volunteers.status': 'pending'
// //       }),
// //       Collection.find({ resident: userId })
// //         .populate('collector', 'name')
// //         .sort({ createdAt: -1 })
// //         .limit(10),
// //       Payment.findOne({
// //         user: userId,
// //         type: 'monthly_fee',
// //         'metadata.month': currentMonth,
// //         'metadata.year': currentYear,
// //         status: 'completed'
// //       }),
// //       Collection.aggregate([
// //         {
// //           $match: {
// //             resident: userId,
// //             status: 'completed',
// //             completedDate: { $gte: new Date(currentYear, currentMonth, 1) }
// //           }
// //         },
// //         {
// //           $group: {
// //             _id: { $dayOfMonth: '$completedDate' },
// //             count: { $sum: 1 },
// //             weight: { $sum: '$actualWeight' },
// //             coins: { $sum: '$actualCoins' }
// //           }
// //         },
// //         { $sort: { '_id': 1 } }
// //       ])
// //     ]);

// //     const totalCoins = totalCoinsEarned[0]?.total || 0;
// //     const user = await User.findById(userId).select('coins freeServiceMonths monthlyFeePaid paymentDueDate joinedPrograms');

// //     // Calculate environmental impact
// //     const allCollections = await Collection.find({ resident: userId, status: 'completed' });
// //     const totalWeight = allCollections.reduce((sum, c) => sum + (c.actualWeight || c.weight || 0), 0);
// //     const co2Saved = totalWeight * 2; // 1 kg waste = 2 kg CO2 saved
// //     const treesEquivalent = Math.round(co2Saved / 20); // 1 tree absorbs 20kg CO2/year

// //     res.json({
// //       success: true,
// //       stats: {
// //         totalCollections,
// //         completedCollections,
// //         pendingCollections,
// //         totalCoinsEarned: totalCoins,
// //         currentCoins: user?.coins || 0,
// //         freeServiceMonths: user?.freeServiceMonths || 0,
// //         upcomingCollections,
// //         joinedPrograms,
// //         pendingProgramRequests,
// //         recentActivity,
// //         monthlyFeeStatus: {
// //           paid: !!monthlyFeeStatus,
// //           dueDate: user?.paymentDueDate,
// //           amount: calculateMonthlyFee(req.user.address?.zone || 'central'),
// //           month: currentMonth + 1,
// //           year: currentYear
// //         },
// //         environmentalImpact: {
// //           totalWeight: Math.round(totalWeight * 100) / 100,
// //           co2Saved: Math.round(co2Saved * 100) / 100,
// //           treesEquivalent
// //         },
// //         monthlyStats
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error fetching resident stats:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error', 
// //       error: error.message 
// //     });
// //   }
// // });

// // // @desc    Get resident's collection history
// // // @route   GET /api/resident/collections
// // router.get('/collections', protect, resident, checkMonthlyFee, async (req, res) => {
// //   try {
// //     const { page = 1, limit = 10, status } = req.query;
// //     const skip = (page - 1) * limit;

// //     let query = { resident: req.user._id };
    
// //     if (status && status !== 'all') {
// //       query.status = status;
// //     }

// //     const collections = await Collection.find(query)
// //       .populate('collector', 'name phone')
// //       .sort({ scheduledDate: -1 })
// //       .skip(skip)
// //       .limit(parseInt(limit));

// //     const total = await Collection.countDocuments(query);

// //     res.json({
// //       success: true,
// //       collections,
// //       currentPage: parseInt(page),
// //       totalPages: Math.ceil(total / limit),
// //       total
// //     });
// //   } catch (error) {
// //     console.error('Error fetching resident collections:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get single collection details
// // // @route   GET /api/resident/collections/:id
// // router.get('/collections/:id', protect, resident, checkMonthlyFee, async (req, res) => {
// //   try {
// //     const collection = await Collection.findOne({
// //       _id: req.params.id,
// //       resident: req.user._id
// //     })
// //     .populate('collector', 'name email phone')
// //     .populate('resident', 'name email phone address');

// //     if (!collection) {
// //       return res.status(404).json({ 
// //         success: false,
// //         message: 'Collection not found' 
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       collection
// //     });
// //   } catch (error) {
// //     console.error('Error fetching collection:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's joined programs
// // // @route   GET /api/resident/programs
// // router.get('/programs', protect, resident, checkMonthlyFee, async (req, res) => {
// //   try {
// //     const programs = await Program.find({
// //       'volunteers.user': req.user._id
// //     })
// //     .populate('createdBy', 'name')
// //     .sort({ date: 1 });

// //     // Separate by status
// //     const pending = [];
// //     const approved = [];
// //     const completed = [];
// //     const rejected = [];

// //     programs.forEach(program => {
// //       const volunteer = program.volunteers.find(v => v.user.toString() === req.user._id.toString());
// //       const programData = {
// //         ...program.toObject(),
// //         applicationStatus: volunteer.status,
// //         joinedAt: volunteer.joinedAt,
// //         coinsEarned: volunteer.coinsEarned
// //       };

// //       switch(volunteer.status) {
// //         case 'pending':
// //           pending.push(programData);
// //           break;
// //         case 'approved':
// //           approved.push(programData);
// //           break;
// //         case 'completed':
// //           completed.push(programData);
// //           break;
// //         case 'rejected':
// //           rejected.push(programData);
// //           break;
// //       }
// //     });

// //     res.json({
// //       success: true,
// //       programs: {
// //         pending,
// //         approved,
// //         completed,
// //         rejected,
// //         total: programs.length
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error fetching resident programs:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's payment history
// // // @route   GET /api/resident/payments
// // router.get('/payments', protect, resident, async (req, res) => {
// //   try {
// //     const payments = await Payment.find({ 
// //       user: req.user._id
// //     })
// //     .sort({ createdAt: -1 });

// //     // Calculate total spent
// //     const totalSpent = payments
// //       .filter(p => p.status === 'completed')
// //       .reduce((sum, p) => sum + p.amount, 0);

// //     // Group by month for chart
// //     const monthlyPayments = payments
// //       .filter(p => p.status === 'completed')
// //       .reduce((acc, p) => {
// //         const month = p.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
// //         if (!acc[month]) {
// //           acc[month] = 0;
// //         }
// //         acc[month] += p.amount;
// //         return acc;
// //       }, {});

// //     res.json({
// //       success: true,
// //       payments,
// //       totalSpent,
// //       monthlyPayments: Object.entries(monthlyPayments).map(([month, amount]) => ({ month, amount }))
// //     });
// //   } catch (error) {
// //     console.error('Error fetching resident payments:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's notifications
// // // @route   GET /api/resident/notifications
// // router.get('/notifications', protect, resident, async (req, res) => {
// //   try {
// //     const { page = 1, limit = 20 } = req.query;
// //     const skip = (page - 1) * limit;

// //     const notifications = await Notification.find({ 
// //       recipient: req.user._id 
// //     })
// //     .sort({ createdAt: -1 })
// //     .skip(skip)
// //     .limit(parseInt(limit));

// //     const unreadCount = await Notification.countDocuments({
// //       recipient: req.user._id,
// //       read: false
// //     });

// //     const total = await Notification.countDocuments({ recipient: req.user._id });

// //     res.json({
// //       success: true,
// //       notifications,
// //       unreadCount,
// //       currentPage: parseInt(page),
// //       totalPages: Math.ceil(total / limit),
// //       total
// //     });
// //   } catch (error) {
// //     console.error('Error fetching notifications:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Mark notification as read
// // // @route   PUT /api/resident/notifications/:id/read
// // router.put('/notifications/:id/read', protect, resident, async (req, res) => {
// //   try {
// //     const notification = await Notification.findOneAndUpdate(
// //       { 
// //         _id: req.params.id,
// //         recipient: req.user._id 
// //       },
// //       { read: true, readAt: new Date() },
// //       { new: true }
// //     );

// //     if (!notification) {
// //       return res.status(404).json({ 
// //         success: false,
// //         message: 'Notification not found' 
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: 'Notification marked as read',
// //       notification
// //     });
// //   } catch (error) {
// //     console.error('Error marking notification as read:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Mark all notifications as read
// // // @route   PUT /api/resident/notifications/read-all
// // router.put('/notifications/read-all', protect, resident, async (req, res) => {
// //   try {
// //     await Notification.updateMany(
// //       { recipient: req.user._id, read: false },
// //       { read: true, readAt: new Date() }
// //     );

// //     res.json({
// //       success: true,
// //       message: 'All notifications marked as read'
// //     });
// //   } catch (error) {
// //     console.error('Error marking all notifications as read:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's rewards/coins history
// // // @route   GET /api/resident/rewards
// // router.get('/rewards', protect, resident, async (req, res) => {
// //   try {
// //     const collections = await Collection.find({
// //       resident: req.user._id,
// //       status: 'completed',
// //       actualCoins: { $gt: 0 }
// //     })
// //     .select('wasteType weight actualCoins completedDate')
// //     .sort({ completedDate: -1 });

// //     const programs = await Program.find({
// //       'volunteers.user': req.user._id,
// //       'volunteers.status': 'completed',
// //       'volunteers.coinsEarned': { $gt: 0 }
// //     })
// //     .select('title volunteers.$ date')
// //     .sort({ date: -1 });

// //     const totalCoins = collections.reduce((sum, c) => sum + (c.actualCoins || 0), 0) +
// //                       programs.reduce((sum, p) => sum + (p.volunteers[0]?.coinsEarned || 0), 0);

// //     res.json({
// //       success: true,
// //       rewards: {
// //         collections,
// //         programs,
// //         totalCoins,
// //         currentCoins: req.user.coins,
// //         freeServiceMonths: req.user.freeServiceMonths
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error fetching rewards:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Redeem free service
// // // @route   POST /api/resident/redeem-free-service
// // router.post('/redeem-free-service', protect, resident, async (req, res) => {
// //   try {
// //     if (req.user.coins < 1000) {
// //       return res.status(400).json({ 
// //         success: false,
// //         message: 'Insufficient coins. Need 1000 coins to redeem free service.' 
// //       });
// //     }

// //     req.user.coins -= 1000;
// //     req.user.freeServiceMonths += 1;
// //     await req.user.save();

// //     const notification = new Notification({
// //       recipient: req.user._id,
// //       type: 'achievement',
// //       title: 'Free Service Redeemed!',
// //       message: `You have successfully redeemed 1 month of free service. Total free months: ${req.user.freeServiceMonths}`,
// //       data: { freeServiceMonths: req.user.freeServiceMonths, coins: req.user.coins }
// //     });
// //     await notification.save();

// //     const io = req.app.get('io');
// //     io.to(`user-${req.user._id}`).emit('rewardRedeemed', {
// //       freeServiceMonths: req.user.freeServiceMonths,
// //       coins: req.user.coins
// //     });

// //     res.json({
// //       success: true,
// //       message: 'Free service redeemed successfully',
// //       freeServiceMonths: req.user.freeServiceMonths,
// //       remainingCoins: req.user.coins
// //     });
// //   } catch (error) {
// //     console.error('Error redeeming free service:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's upcoming schedule
// // // @route   GET /api/resident/schedule
// // router.get('/schedule', protect, resident, async (req, res) => {
// //   try {
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);

// //     const nextWeek = new Date(today);
// //     nextWeek.setDate(nextWeek.getDate() + 7);

// //     const collections = await Collection.find({
// //       resident: req.user._id,
// //       scheduledDate: { $gte: today, $lte: nextWeek },
// //       status: { $in: ['pending', 'assigned'] }
// //     })
// //     .populate('collector', 'name phone')
// //     .sort({ scheduledDate: 1 });

// //     const programs = await Program.find({
// //       'volunteers.user': req.user._id,
// //       'volunteers.status': 'approved',
// //       date: { $gte: today, $lte: nextWeek }
// //     })
// //     .select('title date location')
// //     .sort({ date: 1 });

// //     res.json({
// //       success: true,
// //       schedule: {
// //         collections,
// //         programs,
// //         total: collections.length + programs.length
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error fetching schedule:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's impact statistics
// // // @route   GET /api/resident/impact
// // router.get('/impact', protect, resident, async (req, res) => {
// //   try {
// //     const collections = await Collection.find({
// //       resident: req.user._id,
// //       status: 'completed'
// //     });

// //     const totalWeight = collections.reduce((sum, c) => sum + (c.actualWeight || c.weight || 0), 0);
// //     const co2Saved = totalWeight * 2;
// //     const treesEquivalent = Math.round(co2Saved / 20);
// //     const landfillSpaceSaved = totalWeight * 0.01;
// //     const plasticReduced = collections
// //       .filter(c => c.wasteType === 'recyclable')
// //       .reduce((sum, c) => sum + (c.actualWeight || c.weight || 0), 0);

// //     res.json({
// //       success: true,
// //       impact: {
// //         totalCollections: collections.length,
// //         totalWeight: Math.round(totalWeight * 100) / 100,
// //         co2Saved: Math.round(co2Saved * 100) / 100,
// //         treesEquivalent,
// //         landfillSpaceSaved: Math.round(landfillSpaceSaved * 100) / 100,
// //         plasticReduced: Math.round(plasticReduced * 100) / 100,
// //         coinsEarned: collections.reduce((sum, c) => sum + (c.actualCoins || 0), 0)
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error fetching impact stats:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Update resident profile
// // // @route   PUT /api/resident/profile
// // router.put('/profile', protect, resident, async (req, res) => {
// //   try {
// //     const { name, phone, address } = req.body;

// //     const user = await User.findById(req.user._id);
    
// //     if (name) user.name = name;
// //     if (phone) user.phone = phone;
// //     if (address) user.address = { ...user.address, ...address };

// //     await user.save();

// //     res.json({
// //       success: true,
// //       message: 'Profile updated successfully',
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         phone: user.phone,
// //         address: user.address,
// //         coins: user.coins,
// //         freeServiceMonths: user.freeServiceMonths
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error updating profile:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's favorite/regular waste types
// // // @route   GET /api/resident/favorites
// // router.get('/favorites', protect, resident, async (req, res) => {
// //   try {
// //     const wasteTypes = await Collection.aggregate([
// //       { $match: { resident: req.user._id, status: 'completed' } },
// //       { $group: {
// //         _id: '$wasteType',
// //         count: { $sum: 1 },
// //         totalWeight: { $sum: '$weight' }
// //       }},
// //       { $sort: { count: -1 } },
// //       { $limit: 5 }
// //     ]);

// //     res.json({
// //       success: true,
// //       favorites: wasteTypes
// //     });
// //   } catch (error) {
// //     console.error('Error fetching favorites:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // // @desc    Get resident's monthly summary
// // // @route   GET /api/resident/monthly-summary
// // router.get('/monthly-summary', protect, resident, async (req, res) => {
// //   try {
// //     const { month, year } = req.query;
// //     const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
// //     const targetYear = year ? parseInt(year) : new Date().getFullYear();

// //     const startDate = new Date(targetYear, targetMonth - 1, 1);
// //     const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

// //     const collections = await Collection.find({
// //       resident: req.user._id,
// //       completedDate: { $gte: startDate, $lte: endDate },
// //       status: 'completed'
// //     });

// //     const totalWeight = collections.reduce((sum, c) => sum + (c.actualWeight || c.weight || 0), 0);
// //     const totalCoins = collections.reduce((sum, c) => sum + (c.actualCoins || 0), 0);

// //     const dailyData = await Collection.aggregate([
// //       {
// //         $match: {
// //           resident: req.user._id,
// //           completedDate: { $gte: startDate, $lte: endDate },
// //           status: 'completed'
// //         }
// //       },
// //       {
// //         $group: {
// //           _id: { $dayOfMonth: '$completedDate' },
// //           count: { $sum: 1 },
// //           weight: { $sum: '$actualWeight' },
// //           coins: { $sum: '$actualCoins' }
// //         }
// //       },
// //       { $sort: { '_id': 1 } }
// //     ]);

// //     const programs = await Program.countDocuments({
// //       'volunteers.user': req.user._id,
// //       'volunteers.status': 'completed',
// //       date: { $gte: startDate, $lte: endDate }
// //     });

// //     const payment = await Payment.findOne({
// //       user: req.user._id,
// //       type: 'monthly_fee',
// //       'metadata.month': targetMonth,
// //       'metadata.year': targetYear,
// //       status: 'completed'
// //     });

// //     res.json({
// //       success: true,
// //       summary: {
// //         month: targetMonth,
// //         year: targetYear,
// //         monthName: startDate.toLocaleString('default', { month: 'long' }),
// //         totalCollections: collections.length,
// //         totalWeight: Math.round(totalWeight * 100) / 100,
// //         totalCoins,
// //         programsJoined: programs,
// //         monthlyFeePaid: !!payment,
// //         dailyData
// //       }
// //     });
// //   } catch (error) {
// //     console.error('Error fetching monthly summary:', error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: 'Server error' 
// //     });
// //   }
// // });

// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const Collection = require('../models/Collection');
// const User = require('../models/User');

// // @desc    Get resident dashboard stats and profile info
// // @route   GET /api/resident/stats
// router.get('/stats', protect, async (req, res) => {
//   try {
//     // 1. Fetch counts and user profile in parallel for better performance
//     const [completedCount, pendingCount, userData] = await Promise.all([
//       Collection.countDocuments({ resident: req.user._id, status: 'completed' }),
//       Collection.countDocuments({ resident: req.user._id, status: 'pending' }),
//       User.findById(req.user._id).select('-password')
//     ]);

//     if (!userData) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // 2. Format response to match the "Real Account" dashboard expectations
//     res.json({
//       success: true,
//       stats: {
//         completedCollections: completedCount || 0,
//         pendingCollections: pendingCount || 0,
//         coins: userData.coins || 0,
//         freeServiceMonths: userData.freeServiceMonths || 0,
//         // Including these so the Profile Tab updates automatically
//         name: userData.name,
//         email: userData.email,
//         phone: userData.phone,
//         address: userData.address,
//         monthlyFeePaid: userData.monthlyFeePaid || false
//       }
//     });
//   } catch (error) {
//     console.error('Resident Stats Error:', error.message);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error while syncing dashboard data' 
//     });
//   }
// });

// // @desc    Toggle/Verify monthly fee payment (for development testing)
// // @route   PUT /api/resident/verify-payment
// router.put('/verify-payment', protect, async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { monthlyFeePaid: true },
//       { new: true }
//     );
//     res.json({ success: true, message: "Payment verified", user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;





// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Program = require('../models/Program');
// const Collection = require('../models/Collection');
// const Payment = require('../models/Payment');
// const Transaction = require('../models/Transaction');
// const Notification = require('../models/Notification');
// const { protect, authorize } = require('../middleware/auth');

// // @desc    Get resident dashboard data
// // @route   GET /api/resident/dashboard
// // @access  Private/Resident
// router.get('/dashboard', protect, authorize('resident'), async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     // Get user with all data
//     const user = await User.findById(userId);
    
//     // Get upcoming collections
//     const upcomingCollections = await Collection.find({ 
//       resident: userId,
//       status: { $in: ['Pending', 'Scheduled'] }
//     })
//     .sort({ scheduledDate: 1 })
//     .limit(5);
    
//     // Get collection history
//     const collectionHistory = await Collection.find({ 
//       resident: userId,
//       status: 'Completed'
//     })
//     .sort({ createdAt: -1 })
//     .limit(10);
    
//     // Get programs user has joined
//     const joinedPrograms = await Program.find({
//       'volunteers.user': userId
//     })
//     .select('title organization status startDate endDate volunteers rewardCoins')
//     .sort({ createdAt: -1 });
    
//     // Get available programs (not joined)
//     const allPrograms = await Program.find({
//       status: { $in: ['upcoming', 'active'] }
//     }).select('title organization description zone startDate endDate maxVolunteers volunteers rewardCoins');
    
//     const availablePrograms = allPrograms.filter(program => {
//       return !program.volunteers.some(v => v.user.toString() === userId.toString());
//     });
    
//     // Get payment history
//     const payments = await Payment.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(6);
    
//     // Get transaction history
//     const transactions = await Transaction.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(10);
    
//     // Get unread notifications count
//     const unreadNotifications = await Notification.countDocuments({ 
//       recipient: userId, 
//       read: false 
//     });
    
//     // Calculate statistics
//     const stats = {
//       totalCollections: await Collection.countDocuments({ resident: userId }),
//       completedCollections: await Collection.countDocuments({ resident: userId, status: 'Completed' }),
//       pendingCollections: await Collection.countDocuments({ resident: userId, status: 'Pending' }),
//       totalCoins: user.coins || 0,
//       totalCoinsEarned: user.totalCoinsEarned || 0,
//       freeServiceUntil: user.freeServiceUntil,
//       isServiceFree: user.isServiceFree || false,
//       monthlyFeePaid: user.monthlyFeePaid || false,
//       paymentStatus: user.paymentStatus || 'pending',
//       joinedProgramsCount: joinedPrograms.length,
//       availableProgramsCount: availablePrograms.length,
//       coinsUntilFree: Math.max(0, 1000 - (user.totalCoinsEarned || 0))
//     };
    
//     res.json({
//       success: true,
//       user: {
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         address: user.address,
//         coins: user.coins || 0,
//         totalCoinsEarned: user.totalCoinsEarned || 0,
//         isServiceFree: user.isServiceFree || false,
//         freeServiceUntil: user.freeServiceUntil,
//         paymentStatus: user.paymentStatus || 'pending',
//         monthlyFeePaid: user.monthlyFeePaid || false
//       },
//       stats,
//       upcomingCollections,
//       collectionHistory,
//       joinedPrograms,
//       availablePrograms: availablePrograms.slice(0, 10),
//       payments,
//       transactions,
//       unreadNotifications
//     });
//   } catch (error) {
//     console.error('Resident dashboard error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @desc    Get resident coin balance and transactions
// // @route   GET /api/resident/coins
// // @access  Private/Resident
// router.get('/coins', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const transactions = await Transaction.find({ user: req.user._id })
//       .sort({ createdAt: -1 })
//       .limit(20);
    
//     res.json({
//       success: true,
//       balance: user.coins || 0,
//       totalEarned: user.totalCoinsEarned || 0,
//       freeServiceUntil: user.freeServiceUntil,
//       isServiceFree: user.isServiceFree || false,
//       transactions
//     });
//   } catch (error) {
//     console.error('Error fetching coin data:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @desc    Get resident's joined programs
// // @route   GET /api/resident/my-programs
// // @access  Private/Resident
// router.get('/my-programs', protect, authorize('resident'), async (req, res) => {
//   try {
//     const programs = await Program.find({
//       'volunteers.user': req.user._id
//     })
//     .sort({ createdAt: -1 })
//     .select('title organization description zone startDate endDate status volunteers rewardCoins');
    
//     const formattedPrograms = programs.map(program => {
//       const userApplication = program.volunteers.find(v => v.user.toString() === req.user._id.toString());
//       return {
//         _id: program._id,
//         title: program.title,
//         organization: program.organization,
//         description: program.description,
//         zone: program.zone,
//         startDate: program.startDate,
//         endDate: program.endDate,
//         status: program.status,
//         volunteerStatus: userApplication ? userApplication.status : null,
//         appliedAt: userApplication ? userApplication.appliedAt : null,
//         approvedAt: userApplication ? userApplication.approvedAt : null,
//         rewardCoins: program.rewardCoins || 100
//       };
//     });
    
//     res.json({ success: true, programs: formattedPrograms });
//   } catch (error) {
//     console.error('Error fetching my programs:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @desc    Get resident's collections
// // @route   GET /api/resident/collections
// // @access  Private/Resident
// router.get('/collections', protect, authorize('resident'), async (req, res) => {
//   try {
//     const collections = await Collection.find({ resident: req.user._id })
//       .populate('collector', 'name phone')
//       .sort({ createdAt: -1 });
    
//     res.json({ success: true, collections });
//   } catch (error) {
//     console.error('Error fetching collections:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @desc    Request waste collection
// // @route   POST /api/resident/request-collection
// // @access  Private/Resident
// router.post('/request-collection', protect, authorize('resident'), async (req, res) => {
//   try {
//     const { wasteType, estimatedWeight, notes } = req.body;
    
//     const collection = await Collection.create({
//       resident: req.user._id,
//       address: req.user.address,
//       scheduledDate: new Date(),
//       wasteType: wasteType || 'Mixed',
//       estimatedWeight: estimatedWeight || 0,
//       notes,
//       status: 'Pending'
//     });
    
//     // Notify admins
//     const admins = await User.find({ role: 'admin' });
//     await Notification.insertMany(admins.map(admin => ({
//       recipient: admin._id,
//       sender: req.user._id,
//       type: 'collection_update',
//       title: 'New Collection Request',
//       message: `${req.user.name} requested waste collection`,
//       data: { collectionId: collection._id }
//     })));
    
//     const io = req.app.get('io');
//     if (io) {
//       io.to('admins').emit('new_collection_request', {
//         collectionId: collection._id,
//         resident: req.user.name
//       });
//     }
    
//     res.status(201).json({ success: true, collection });
//   } catch (error) {
//     console.error('Error requesting collection:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @desc    Get resident stats (for backward compatibility)
// // @route   GET /api/resident/stats
// // @access  Private/Resident
// router.get('/stats', protect, authorize('resident'), async (req, res) => {
//   try {
//     const [completedCount, pendingCount, userData] = await Promise.all([
//       Collection.countDocuments({ resident: req.user._id, status: 'Completed' }),
//       Collection.countDocuments({ resident: req.user._id, status: 'Pending' }),
//       User.findById(req.user._id).select('-password')
//     ]);

//     if (!userData) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     res.json({
//       success: true,
//       stats: {
//         completedCollections: completedCount || 0,
//         pendingCollections: pendingCount || 0,
//         coins: userData.coins || 0,
//         totalCoinsEarned: userData.totalCoinsEarned || 0,
//         freeServiceMonths: userData.freeServiceMonths || 0,
//         name: userData.name,
//         email: userData.email,
//         phone: userData.phone,
//         address: userData.address,
//         monthlyFeePaid: userData.monthlyFeePaid || false,
//         isServiceFree: userData.isServiceFree || false,
//         freeServiceUntil: userData.freeServiceUntil
//       }
//     });
//   } catch (error) {
//     console.error('Resident Stats Error:', error.message);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error while syncing dashboard data' 
//     });
//   }
// });

// // @desc    Toggle/Verify monthly fee payment
// // @route   PUT /api/resident/verify-payment
// // @access  Private/Resident
// router.put('/verify-payment', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { 
//         monthlyFeePaid: true, 
//         paymentStatus: 'paid',
//         lastPaymentDate: new Date(),
//         nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
//       },
//       { new: true }
//     );
    
//     // Create payment record
//     await Payment.create({
//       user: user._id,
//       amount: 1000,
//       type: 'monthly_fee',
//       status: 'completed',
//       paymentMethod: 'wallet',
//       paidForMonth: {
//         month: new Date().getMonth() + 1,
//         year: new Date().getFullYear()
//       },
//       paidDate: new Date()
//     });
    
//     // Create transaction record
//     await Transaction.create({
//       user: user._id,
//       type: 'payment',
//       amount: 1000,
//       description: 'Monthly waste collection fee',
//       balance: user.coins
//     });
    
//     res.json({ success: true, message: "Payment verified", user });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Program = require('../models/Program');
const Collection = require('../models/Collection');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get resident dashboard data
// @route   GET /api/resident/dashboard
// @access  Private/Resident
router.get('/dashboard', protect, authorize('resident'), async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with all data
    const user = await User.findById(userId);
    
    // Get upcoming collections
    const upcomingCollections = await Collection.find({ 
      resident: userId,
      status: { $in: ['Pending', 'Scheduled'] }
    })
    .sort({ scheduledDate: 1 })
    .limit(5);
    
    // Get collection history
    const collectionHistory = await Collection.find({ 
      resident: userId,
      status: 'Completed'
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Get programs user has joined
    const joinedPrograms = await Program.find({
      'volunteers.user': userId
    })
    .select('title organization status startDate endDate volunteers rewardCoins')
    .sort({ createdAt: -1 });
    
    // Get available programs (not joined)
    const allPrograms = await Program.find({
      status: { $in: ['upcoming', 'active'] }
    }).select('title organization description zone startDate endDate maxVolunteers volunteers rewardCoins');
    
    const availablePrograms = allPrograms.filter(program => {
      return !program.volunteers.some(v => v.user.toString() === userId.toString());
    });
    
    // Get payment history
    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(6);
    
    // Get transaction history
    let transactions = [];
    try {
      transactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);
    } catch (e) {
      console.log("Transactions not found, skipping.");
    }
    
    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });
    
    // Calculate statistics
    const stats = {
      totalCollections: await Collection.countDocuments({ resident: userId }),
      completedCollections: await Collection.countDocuments({ resident: userId, status: 'Completed' }),
      pendingCollections: await Collection.countDocuments({ resident: userId, status: 'Pending' }),
      totalCoins: user.coins || 0,
      totalCoinsEarned: user.totalCoinsEarned || 0,
      freeServiceUntil: user.freeServiceUntil,
      isServiceFree: user.isServiceFree || false,
      monthlyFeePaid: user.monthlyFeePaid || false,
      paymentStatus: user.paymentStatus || 'pending',
      joinedProgramsCount: joinedPrograms.length,
      availableProgramsCount: availablePrograms.length,
      coinsUntilFree: Math.max(0, 1000 - (user.totalCoinsEarned || 0))
    };
    
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        coins: user.coins || 0,
        totalCoinsEarned: user.totalCoinsEarned || 0,
        isServiceFree: user.isServiceFree || false,
        freeServiceUntil: user.freeServiceUntil,
        paymentStatus: user.paymentStatus || 'pending',
        monthlyFeePaid: user.monthlyFeePaid || false
      },
      stats,
      upcomingCollections,
      collectionHistory,
      joinedPrograms,
      availablePrograms: availablePrograms.slice(0, 10),
      payments,
      transactions,
      unreadNotifications
    });
  } catch (error) {
    console.error('Resident dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get resident coin balance and transactions
// @route   GET /api/resident/coins
// @access  Private (Graceful fail for non-residents)
router.get('/coins', protect, async (req, res) => {
  try {
    // FIX: If an admin or collector accidentally calls this via context, return gracefully.
    if (req.user.role !== 'resident') {
      return res.json({
        success: true,
        balance: 0,
        totalEarned: 0,
        freeServiceUntil: null,
        isServiceFree: false,
        transactions: []
      });
    }

    const user = await User.findById(req.user._id);
    
    let transactions = [];
    try {
      transactions = await Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
    } catch (e) {
      console.log("No transaction model or records yet.");
    }
    
    res.json({
      success: true,
      balance: user.coins || 0,
      totalEarned: user.totalCoinsEarned || 0,
      freeServiceUntil: user.freeServiceUntil,
      isServiceFree: user.isServiceFree || false,
      transactions
    });
  } catch (error) {
    console.error('Error fetching coin data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get resident's joined programs
// @route   GET /api/resident/my-programs
// @access  Private/Resident
router.get('/my-programs', protect, authorize('resident'), async (req, res) => {
  try {
    const programs = await Program.find({
      'volunteers.user': req.user._id
    })
    .sort({ createdAt: -1 })
    .select('title organization description zone startDate endDate status volunteers rewardCoins');
    
    const formattedPrograms = programs.map(program => {
      const userApplication = program.volunteers.find(v => v.user.toString() === req.user._id.toString());
      return {
        _id: program._id,
        title: program.title,
        organization: program.organization,
        description: program.description,
        zone: program.zone,
        startDate: program.startDate,
        endDate: program.endDate,
        status: program.status,
        volunteerStatus: userApplication ? userApplication.status : null,
        appliedAt: userApplication ? userApplication.appliedAt : null,
        approvedAt: userApplication ? userApplication.approvedAt : null,
        rewardCoins: program.rewardCoins || 100
      };
    });
    
    res.json({ success: true, programs: formattedPrograms });
  } catch (error) {
    console.error('Error fetching my programs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get resident's collections
// @route   GET /api/resident/collections
// @access  Private/Resident
router.get('/collections', protect, authorize('resident'), async (req, res) => {
  try {
    const collections = await Collection.find({ resident: req.user._id })
      .populate('collector', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Request waste collection
// @route   POST /api/resident/request-collection
// @access  Private/Resident
router.post('/request-collection', protect, authorize('resident'), async (req, res) => {
  try {
    const { wasteType, estimatedWeight, notes } = req.body;
    
    const collection = await Collection.create({
      resident: req.user._id,
      address: req.user.address,
      scheduledDate: new Date(),
      wasteType: wasteType || 'Mixed',
      estimatedWeight: estimatedWeight || 0,
      notes,
      status: 'Pending'
    });
    
    // Notify admins
    const admins = await User.find({ role: 'admin' });
    await Notification.insertMany(admins.map(admin => ({
      recipient: admin._id,
      sender: req.user._id,
      type: 'collection_update',
      title: 'New Collection Request',
      message: `${req.user.name} requested waste collection`,
      data: { collectionId: collection._id }
    })));
    
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('new_collection_request', {
        collectionId: collection._id,
        resident: req.user.name
      });
    }
    
    res.status(201).json({ success: true, collection });
  } catch (error) {
    console.error('Error requesting collection:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get resident stats (for backward compatibility)
// @route   GET /api/resident/stats
// @access  Private/Resident
router.get('/stats', protect, authorize('resident'), async (req, res) => {
  try {
    const [completedCount, pendingCount, userData] = await Promise.all([
      Collection.countDocuments({ resident: req.user._id, status: 'Completed' }),
      Collection.countDocuments({ resident: req.user._id, status: 'Pending' }),
      User.findById(req.user._id).select('-password')
    ]);

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      stats: {
        completedCollections: completedCount || 0,
        pendingCollections: pendingCount || 0,
        coins: userData.coins || 0,
        totalCoinsEarned: userData.totalCoinsEarned || 0,
        freeServiceMonths: userData.freeServiceMonths || 0,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        monthlyFeePaid: userData.monthlyFeePaid || false,
        isServiceFree: userData.isServiceFree || false,
        freeServiceUntil: userData.freeServiceUntil
      }
    });
  } catch (error) {
    console.error('Resident Stats Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while syncing dashboard data' 
    });
  }
});

// @desc    Toggle/Verify monthly fee payment
// @route   PUT /api/resident/verify-payment
// @access  Private/Resident
router.put('/verify-payment', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        monthlyFeePaid: true, 
        paymentStatus: 'paid',
        lastPaymentDate: new Date(),
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      { new: true }
    );
    
    // Create payment record
    await Payment.create({
      user: user._id,
      amount: 1000,
      type: 'monthly_fee',
      status: 'completed',
      paymentMethod: 'wallet',
      paidForMonth: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      },
      paidDate: new Date()
    });
    
    // Create transaction record
    try {
      await Transaction.create({
        user: user._id,
        type: 'payment',
        amount: 1000,
        description: 'Monthly waste collection fee',
        balance: user.coins
      });
    } catch (e) {
      console.log("Transaction creation skipped.");
    }
    
    res.json({ success: true, message: "Payment verified", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
// // // ============================================================
// // // FEATURE 4: Standardized Billing (eSewa / Khalti)
// // // FILE: backend/routes/payments.js
// // // BASE URL: /api/payments
// // // ============================================================
// // // Covers:
// // //   - Khalti  : initiate → redirect → verify (pidx lookup)
// // //   - eSewa   : initiate → redirect → verify (signed params)
// // //   - Status  : current payment status for the resident
// // //   - History : last 12 payments
// // //   - Redeem  : spend 1000 coins for free month (no cash needed)
// // // ============================================================

// // const express     = require('express');
// // const router      = express.Router();
// // const axios       = require('axios');
// // const crypto      = require('crypto');
// // const Payment     = require('../models/Payment');
// // const User        = require('../models/User');
// // const Transaction = require('../models/Transaction');
// // const Notification = require('../models/Notification');
// // const { protect, authorize } = require('../middleware/auth');

// // const MONTHLY_FEE  = 1000;           // Fixed fee — never changes
// // const FREE_DAYS    = 30;             // Days of free service per redemption

// // // ── Helper: set user as paid for this month ──────────────────
// // const markUserPaid = async (userId, validUntil) => {
// //   await User.findByIdAndUpdate(userId, {
// //     monthlyFeePaid:  true,
// //     lastPaymentDate: new Date(),
// //     nextPaymentDue:  validUntil,
// //     paymentStatus:   'paid',
// //   });
// // };

// // // ── Helper: notify admin of new payment ──────────────────────
// // const notifyAdmins = async (userId, userName, paymentId, amount) => {
// //   const admins = await User.find({ role: 'admin' }).select('_id');
// //   if (admins.length > 0) {
// //     await Notification.insertMany(
// //       admins.map((a) => ({
// //         recipient: a._id,
// //         sender:    userId,
// //         type:      'payment_received',
// //         title:     'Monthly Fee Received',
// //         message:   `${userName} paid monthly fee of Rs. ${amount}`,
// //         data:      { paymentId, userId },
// //         priority:  'medium',
// //       }))
// //     );
// //   }
// // };

// // // ============================================================
// // // @desc    GET current billing status
// // // @route   GET /api/payments/status
// // // @access  Private/Resident
// // // ============================================================
// // router.get('/status', protect, authorize('resident'), async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id).select(
// //       'monthlyFeePaid paymentStatus isServiceFree freeServiceUntil lastPaymentDate nextPaymentDue coins'
// //     );

// //     const isFreeActive =
// //       user.isServiceFree &&
// //       user.freeServiceUntil &&
// //       new Date(user.freeServiceUntil) > new Date();

// //     res.json({
// //       success: true,
// //       billing: {
// //         monthlyFee:      MONTHLY_FEE,
// //         monthlyFeePaid:  user.monthlyFeePaid,
// //         paymentStatus:   isFreeActive ? 'free' : user.paymentStatus,
// //         lastPaymentDate: user.lastPaymentDate,
// //         nextPaymentDue:  user.nextPaymentDue,
// //         isFreeActive,
// //         freeServiceUntil: isFreeActive ? user.freeServiceUntil : null,
// //         coinBalance:     user.coins,
// //         canRedeem:       (user.coins || 0) >= MONTHLY_FEE && !isFreeActive,
// //       },
// //     });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // ============================================================
// // // @desc    GET payment history (last 12)
// // // @route   GET /api/payments/history
// // // @access  Private/Resident
// // // ============================================================
// // router.get('/history', protect, authorize('resident'), async (req, res) => {
// //   try {
// //     const payments = await Payment.find({ user: req.user._id })
// //       .sort({ createdAt: -1 })
// //       .limit(12)
// //       .select('-metadata -receipt');

// //     res.json({ success: true, payments });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // ============================================================
// // // ─────────────────────  KHALTI  ─────────────────────────────
// // // ============================================================

// // // @desc    INITIATE Khalti payment
// // // @route   POST /api/payments/khalti/initiate
// // // @access  Private/Resident
// // router.post('/khalti/initiate', protect, authorize('resident'), async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);

// //     // Guard: free service active
// //     if (user.isServiceFree && user.freeServiceUntil > new Date()) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Your service is currently free. No payment needed.',
// //       });
// //     }

// //     const orderId = `SWMS-KH-${req.user._id}-${Date.now()}`;

// //     // Call Khalti API to create a payment session
// //     const khaltiRes = await axios.post(
// //       'https://a.khalti.com/api/v2/epayment/initiate/',
// //       {
// //         return_url:           `${process.env.FRONTEND_URL}/payment-success?method=khalti`,
// //         website_url:           process.env.FRONTEND_URL,
// //         amount:                MONTHLY_FEE * 100, // Khalti uses Paisa (1 NPR = 100 Paisa)
// //         purchase_order_id:     orderId,
// //         purchase_order_name:  'Monthly Waste Collection Fee',
// //         customer_info: {
// //           name:  user.name,
// //           email: user.email,
// //           phone: user.phone || '9800000000',
// //         },
// //       },
// //       { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
// //     );

// //     // Persist a pending Payment record
// //     const payment = await Payment.create({
// //       user:          req.user._id,
// //       amount:        MONTHLY_FEE,
// //       paymentMethod: 'khalti',
// //       transactionId: orderId,
// //       status:        'pending',
// //       forMonth:      new Date().toISOString().slice(0, 7),
// //       metadata:      { pidx: khaltiRes.data.pidx },
// //     });

// //     res.json({
// //       success:     true,
// //       payment_url: khaltiRes.data.payment_url,
// //       pidx:        khaltiRes.data.pidx,
// //       paymentId:   payment._id,
// //     });
// //   } catch (err) {
// //     console.error('Khalti initiate error:', err.response?.data || err.message);
// //     res.status(500).json({ success: false, message: 'Khalti initialization failed' });
// //   }
// // });

// // // @desc    VERIFY Khalti payment (called from PaymentSuccess page)
// // // @route   POST /api/payments/khalti/verify
// // // @access  Private/Resident
// // router.post('/khalti/verify', protect, async (req, res) => {
// //   try {
// //     const { pidx } = req.body;
// //     if (!pidx) return res.status(400).json({ success: false, message: 'pidx is required' });

// //     // Look up payment result from Khalti
// //     const khaltiRes = await axios.post(
// //       'https://a.khalti.com/api/v2/epayment/lookup/',
// //       { pidx },
// //       { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
// //     );

// //     const { status, transaction_id, total_amount } = khaltiRes.data;

// //     if (status !== 'Completed') {
// //       return res.status(400).json({ success: false, message: `Payment status: ${status}` });
// //     }

// //     // Find the pending payment record
// //     const payment = await Payment.findOne({ 'metadata.pidx': pidx, user: req.user._id });
// //     if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
// //     if (payment.status === 'completed') {
// //       return res.json({ success: true, message: 'Payment already verified', payment });
// //     }

// //     // Mark completed
// //     const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
// //     payment.status        = 'completed';
// //     payment.paymentDate   = new Date();
// //     payment.validUntil    = validUntil;
// //     payment.metadata.khaltiTransactionId = transaction_id;
// //     await payment.save();

// //     // Update user
// //     await markUserPaid(req.user._id, validUntil);

// //     // Log transaction
// //     const user = await User.findById(req.user._id);
// //     await Transaction.create({
// //       user:        req.user._id,
// //       type:        'payment',
// //       amount:      MONTHLY_FEE,
// //       description: `Monthly fee paid via Khalti for ${payment.forMonth}`,
// //       reference:   { paymentId: payment._id },
// //       balance:     user.coins,
// //       status:      'completed',
// //     });

// //     // Notify admin + resident
// //     await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
// //     await Notification.create({
// //       recipient: req.user._id,
// //       type:      'payment_received',
// //       title:     '✅ Payment Successful',
// //       message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via Khalti. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
// //       data:      { paymentId: payment._id, validUntil },
// //     });

// //     // Socket event
// //     const io = req.app.get('io');
// //     if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

// //     res.json({ success: true, message: 'Payment verified!', validUntil, payment });
// //   } catch (err) {
// //     console.error('Khalti verify error:', err.response?.data || err.message);
// //     res.status(500).json({ success: false, message: 'Khalti verification failed' });
// //   }
// // });

// // // ============================================================
// // // ─────────────────────  eSEWA  ──────────────────────────────
// // // ============================================================

// // // @desc    GET eSewa payment form fields (signed)
// // // @route   POST /api/payments/esewa/initiate
// // // @access  Private/Resident
// // router.post('/esewa/initiate', protect, authorize('resident'), async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);

// //     if (user.isServiceFree && user.freeServiceUntil > new Date()) {
// //       return res.status(400).json({ success: false, message: 'Service is currently free.' });
// //     }

// //     const transactionId = `SWMS-EW-${req.user._id}-${Date.now()}`;
// //     const amount        = MONTHLY_FEE;

// //     // eSewa v2 signature: HMAC-SHA256 of "total_amount,transaction_uuid,product_code"
// //     const message   = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
// //     const signature = crypto
// //       .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
// //       .update(message)
// //       .digest('base64');

// //     // Save pending record
// //     const payment = await Payment.create({
// //       user:          req.user._id,
// //       amount,
// //       paymentMethod: 'esewa',
// //       transactionId,
// //       status:        'pending',
// //       forMonth:      new Date().toISOString().slice(0, 7),
// //     });

// //     // Return all form fields frontend needs to POST to eSewa
// //     res.json({
// //       success: true,
// //       formFields: {
// //         amount:           String(amount),
// //         tax_amount:       '0',
// //         total_amount:     String(amount),
// //         transaction_uuid: transactionId,
// //         product_code:     process.env.ESEWA_PRODUCT_CODE,
// //         product_service_charge: '0',
// //         product_delivery_charge: '0',
// //         success_url: `${process.env.FRONTEND_URL}/payment-success?method=esewa`,
// //         failure_url: `${process.env.FRONTEND_URL}/payment-failed`,
// //         signed_field_names: 'total_amount,transaction_uuid,product_code',
// //         signature,
// //       },
// //       esewaUrl:  process.env.NODE_ENV === 'production'
// //         ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
// //         : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
// //       paymentId: payment._id,
// //     });
// //   } catch (err) {
// //     console.error('eSewa initiate error:', err.message);
// //     res.status(500).json({ success: false, message: 'eSewa initialization failed' });
// //   }
// // });

// // // @desc    VERIFY eSewa payment (called from PaymentSuccess page)
// // // @route   POST /api/payments/esewa/verify
// // // @access  Private/Resident
// // router.post('/esewa/verify', protect, async (req, res) => {
// //   try {
// //     // eSewa returns a base64-encoded JSON in `data` query param
// //     const { encodedData } = req.body;
// //     if (!encodedData) return res.status(400).json({ success: false, message: 'Missing data' });

// //     const decoded    = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
// //     const { transaction_uuid, status, total_amount, transaction_code } = decoded;

// //     if (status !== 'COMPLETE') {
// //       return res.status(400).json({ success: false, message: `eSewa status: ${status}` });
// //     }

// //     // Verify signature
// //     const message   = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names`;
// //     const expected  = crypto
// //       .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
// //       .update(message)
// //       .digest('base64');

// //     if (expected !== decoded.signature) {
// //       return res.status(400).json({ success: false, message: 'Signature mismatch — payment tampered' });
// //     }

// //     const payment = await Payment.findOne({ transactionId: transaction_uuid, user: req.user._id });
// //     if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
// //     if (payment.status === 'completed') {
// //       return res.json({ success: true, message: 'Already verified', payment });
// //     }

// //     const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
// //     payment.status      = 'completed';
// //     payment.paymentDate = new Date();
// //     payment.validUntil  = validUntil;
// //     payment.metadata    = { esewaTransactionCode: transaction_code };
// //     await payment.save();

// //     await markUserPaid(req.user._id, validUntil);

// //     const user = await User.findById(req.user._id);
// //     await Transaction.create({
// //       user:        req.user._id,
// //       type:        'payment',
// //       amount:      MONTHLY_FEE,
// //       description: `Monthly fee paid via eSewa for ${payment.forMonth}`,
// //       reference:   { paymentId: payment._id },
// //       balance:     user.coins,
// //       status:      'completed',
// //     });

// //     await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
// //     await Notification.create({
// //       recipient: req.user._id,
// //       type:      'payment_received',
// //       title:     '✅ Payment Successful',
// //       message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via eSewa. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
// //       data:      { paymentId: payment._id, validUntil },
// //     });

// //     const io = req.app.get('io');
// //     if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

// //     res.json({ success: true, message: 'eSewa payment verified!', validUntil, payment });
// //   } catch (err) {
// //     console.error('eSewa verify error:', err.message);
// //     res.status(500).json({ success: false, message: 'eSewa verification failed' });
// //   }
// // });

// // // ============================================================
// // // @desc    REDEEM 1000 coins for 1 free month (no cash)
// // // @route   POST /api/payments/redeem
// // // @access  Private/Resident
// // // ============================================================
// // router.post('/redeem', protect, authorize('resident'), async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);

// //     if ((user.coins || 0) < MONTHLY_FEE) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Need ${MONTHLY_FEE} coins. You have ${user.coins}.`,
// //       });
// //     }
// //     if (user.isServiceFree && user.freeServiceUntil > new Date()) {
// //       return res.status(400).json({ success: false, message: 'Free service already active.' });
// //     }

// //     const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);

// //     // Deduct coins & activate free service
// //     user.coins            -= MONTHLY_FEE;
// //     user.freeServiceMonths = (user.freeServiceMonths || 0) + 1;
// //     user.freeServiceUntil  = validUntil;
// //     user.isServiceFree     = true;
// //     user.paymentStatus     = 'free';
// //     user.monthlyFeePaid    = true;
// //     user.nextPaymentDue    = validUntil;
// //     await user.save();

// //     // Log coin spend
// //     await Transaction.create({
// //       user:        user._id,
// //       type:        'coin_spent',
// //       amount:      MONTHLY_FEE,
// //       description: 'Redeemed 1,000 coins for 1 month free service',
// //       balance:     user.coins,
// //       status:      'completed',
// //     });

// //     // Log payment record
// //     const payment = await Payment.create({
// //       user:          user._id,
// //       amount:        MONTHLY_FEE,
// //       paymentMethod: 'coin_redeem',
// //       transactionId: `COIN-${user._id}-${Date.now()}`,
// //       status:        'completed',
// //       isFreeService: true,
// //       coinsUsed:     MONTHLY_FEE,
// //       validUntil,
// //       forMonth:      new Date().toISOString().slice(0, 7),
// //     });

// //     await Notification.create({
// //       recipient: user._id,
// //       type:      'free_service_unlocked',
// //       title:     '🎉 Free Service Activated!',
// //       message:   `You redeemed 1,000 coins for 1 month of free waste collection. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
// //       data:      { paymentId: payment._id, validUntil },
// //       priority:  'high',
// //     });

// //     const io = req.app.get('io');
// //     if (io) io.to(user._id.toString()).emit('free_service_unlocked', { validUntil });

// //     res.json({
// //       success:      true,
// //       message:      `1,000 coins redeemed! Free service active until ${validUntil.toLocaleDateString('en-NP')}.`,
// //       validUntil,
// //       coinsRemaining: user.coins,
// //     });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // module.exports = router;


// // ============================================================
// // FEATURE 4: Standardized Billing (eSewa / Khalti)
// // FILE: backend/routes/payments.js
// // BASE URL: /api/payments
// // ============================================================
// // Covers:
// //   - Khalti  : initiate → redirect → verify (pidx lookup)
// //   - eSewa   : initiate → redirect → verify (signed params)
// //   - Status  : current payment status for the resident
// //   - Monthly Fee Status : /monthly-fee/status (frontend compat)
// //   - History : last 12 payments
// //   - Redeem  : spend 1000 coins for free month (no cash needed)
// // ============================================================

// const express      = require('express');
// const router       = express.Router();
// const axios        = require('axios');
// const crypto       = require('crypto');
// const Payment      = require('../models/Payment');
// const User         = require('../models/User');
// const Transaction  = require('../models/Transaction');
// const Notification = require('../models/Notification');
// const { protect, authorize } = require('../middleware/auth');

// const MONTHLY_FEE = 1000; // Fixed fee — never changes
// const FREE_DAYS   = 30;   // Days of free service per redemption

// // ── Helper: set user as paid for this month ──────────────────
// const markUserPaid = async (userId, validUntil) => {
//   await User.findByIdAndUpdate(userId, {
//     monthlyFeePaid:  true,
//     lastPaymentDate: new Date(),
//     nextPaymentDue:  validUntil,
//     paymentStatus:   'paid',
//   });
// };

// // ── Helper: notify admins of new payment ─────────────────────
// const notifyAdmins = async (userId, userName, paymentId, amount) => {
//   try {
//     const admins = await User.find({ role: 'admin' }).select('_id');
//     if (admins.length > 0) {
//       await Notification.insertMany(
//         admins.map((a) => ({
//           recipient: a._id,
//           sender:    userId,
//           type:      'payment_received',
//           title:     'Monthly Fee Received',
//           message:   `${userName} paid monthly fee of Rs. ${amount}`,
//           data:      { paymentId, userId },
//           priority:  'medium',
//         }))
//       );
//     }
//   } catch (err) {
//     console.error('notifyAdmins error:', err.message);
//   }
// };

// // ── Helper: check if free service is currently active ────────
// const isFreeServiceActive = (user) =>
//   user.isServiceFree &&
//   user.freeServiceUntil &&
//   new Date(user.freeServiceUntil) > new Date();

// // ============================================================
// // @desc    GET current billing status
// // @route   GET /api/payments/status
// // @access  Private/Resident
// // ============================================================
// router.get('/status', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select(
//       'monthlyFeePaid paymentStatus isServiceFree freeServiceUntil lastPaymentDate nextPaymentDue coins'
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const freeActive = isFreeServiceActive(user);

//     res.json({
//       success: true,
//       billing: {
//         monthlyFee:       MONTHLY_FEE,
//         monthlyFeePaid:   user.monthlyFeePaid,
//         paymentStatus:    freeActive ? 'free' : user.paymentStatus,
//         lastPaymentDate:  user.lastPaymentDate,
//         nextPaymentDue:   user.nextPaymentDue,
//         isFreeActive:     freeActive,
//         freeServiceUntil: freeActive ? user.freeServiceUntil : null,
//         coinBalance:      user.coins || 0,
//         canRedeem:        (user.coins || 0) >= MONTHLY_FEE && !freeActive,
//       },
//     });
//   } catch (err) {
//     console.error('GET /status error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET monthly fee status (frontend compatibility route)
// // @route   GET /api/payments/monthly-fee/status
// // @access  Private/Resident
// // ============================================================
// router.get('/monthly-fee/status', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select(
//       'monthlyFeePaid paymentStatus isServiceFree freeServiceUntil lastPaymentDate nextPaymentDue coins'
//     );

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const freeActive     = isFreeServiceActive(user);
//     const currentMonth   = new Date().getMonth() + 1;
//     const currentYear    = new Date().getFullYear();

//     // Check if there is a completed payment for this month
//     const thisMonthPayment = await Payment.findOne({
//       user:   req.user._id,
//       status: 'completed',
//       forMonth: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
//     });

//     res.json({
//       success:         true,
//       paid:            !!thisMonthPayment || user.monthlyFeePaid,
//       isFreeActive:    freeActive,
//       freeServiceUntil: freeActive ? user.freeServiceUntil : null,
//       paymentStatus:   freeActive ? 'free' : user.paymentStatus,
//       nextPaymentDue:  user.nextPaymentDue,
//       lastPaymentDate: user.lastPaymentDate,
//       coinBalance:     user.coins || 0,
//       canRedeem:       (user.coins || 0) >= MONTHLY_FEE && !freeActive,
//       monthlyFee:      MONTHLY_FEE,
//       payment:         thisMonthPayment || null,
//     });
//   } catch (err) {
//     console.error('GET /monthly-fee/status error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // @desc    GET payment history (last 12)
// // @route   GET /api/payments/history
// // @access  Private/Resident
// // ============================================================
// router.get('/history', protect, authorize('resident'), async (req, res) => {
//   try {
//     const payments = await Payment.find({ user: req.user._id })
//       .sort({ createdAt: -1 })
//       .limit(12)
//       .select('-metadata -receipt');

//     res.json({ success: true, payments });
//   } catch (err) {
//     console.error('GET /history error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================================
// // ─────────────────────  KHALTI  ─────────────────────────────
// // ============================================================

// // @desc    INITIATE Khalti payment
// // @route   POST /api/payments/khalti/initiate
// // @access  Private/Resident
// router.post('/khalti/initiate', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Guard: free service active
//     if (isFreeServiceActive(user)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Your service is currently free. No payment needed.',
//       });
//     }

//     if (!process.env.KHALTI_SECRET_KEY) {
//       return res.status(500).json({ success: false, message: 'Khalti secret key not configured' });
//     }

//     const orderId = `SWMS-KH-${req.user._id}-${Date.now()}`;

//     const khaltiRes = await axios.post(
//       'https://a.khalti.com/api/v2/epayment/initiate/',
//       {
//         return_url:          `${process.env.FRONTEND_URL}/payment-success?method=khalti`,
//         website_url:          process.env.FRONTEND_URL,
//         amount:               MONTHLY_FEE * 100, // Paisa
//         purchase_order_id:    orderId,
//         purchase_order_name: 'Monthly Waste Collection Fee',
//         customer_info: {
//           name:  user.name,
//           email: user.email,
//           phone: user.phone || '9800000000',
//         },
//       },
//       { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
//     );

//     const payment = await Payment.create({
//       user:          req.user._id,
//       amount:        MONTHLY_FEE,
//       paymentMethod: 'khalti',
//       transactionId: orderId,
//       status:        'pending',
//       forMonth:      new Date().toISOString().slice(0, 7),
//       metadata:      { pidx: khaltiRes.data.pidx },
//     });

//     res.json({
//       success:     true,
//       payment_url: khaltiRes.data.payment_url,
//       pidx:        khaltiRes.data.pidx,
//       paymentId:   payment._id,
//     });
//   } catch (err) {
//     console.error('Khalti initiate error:', err.response?.data || err.message);
//     res.status(500).json({
//       success: false,
//       message: 'Khalti initialization failed',
//       detail:  err.response?.data || err.message,
//     });
//   }
// });

// // @desc    VERIFY Khalti payment
// // @route   POST /api/payments/khalti/verify
// // @access  Private/Resident
// router.post('/khalti/verify', protect, async (req, res) => {
//   try {
//     const { pidx } = req.body;
//     if (!pidx) {
//       return res.status(400).json({ success: false, message: 'pidx is required' });
//     }

//     const khaltiRes = await axios.post(
//       'https://a.khalti.com/api/v2/epayment/lookup/',
//       { pidx },
//       { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
//     );

//     const { status, transaction_id, total_amount } = khaltiRes.data;

//     if (status !== 'Completed') {
//       return res.status(400).json({ success: false, message: `Payment status: ${status}` });
//     }

//     const payment = await Payment.findOne({ 'metadata.pidx': pidx, user: req.user._id });
//     if (!payment) {
//       return res.status(404).json({ success: false, message: 'Payment record not found' });
//     }
//     if (payment.status === 'completed') {
//       return res.json({ success: true, message: 'Payment already verified', payment });
//     }

//     const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
//     payment.status                       = 'completed';
//     payment.paymentDate                  = new Date();
//     payment.validUntil                   = validUntil;
//     payment.metadata.khaltiTransactionId = transaction_id;
//     await payment.save();

//     await markUserPaid(req.user._id, validUntil);

//     const user = await User.findById(req.user._id);
//     await Transaction.create({
//       user:        req.user._id,
//       type:        'payment',
//       amount:      MONTHLY_FEE,
//       description: `Monthly fee paid via Khalti for ${payment.forMonth}`,
//       reference:   { paymentId: payment._id },
//       balance:     user.coins,
//       status:      'completed',
//     });

//     await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
//     await Notification.create({
//       recipient: req.user._id,
//       type:      'payment_received',
//       title:     '✅ Payment Successful',
//       message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via Khalti. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
//       data:      { paymentId: payment._id, validUntil },
//     });

//     const io = req.app.get('io');
//     if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

//     res.json({ success: true, message: 'Payment verified!', validUntil, payment });
//   } catch (err) {
//     console.error('Khalti verify error:', err.response?.data || err.message);
//     res.status(500).json({
//       success: false,
//       message: 'Khalti verification failed',
//       detail:  err.response?.data || err.message,
//     });
//   }
// });

// // ============================================================
// // ─────────────────────  eSEWA  ──────────────────────────────
// // ============================================================

// // @desc    GET eSewa payment form fields (signed)
// // @route   POST /api/payments/esewa/initiate
// // @access  Private/Resident
// router.post('/esewa/initiate', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (isFreeServiceActive(user)) {
//       return res.status(400).json({ success: false, message: 'Service is currently free.' });
//     }

//     if (!process.env.ESEWA_SECRET_KEY || !process.env.ESEWA_PRODUCT_CODE) {
//       return res.status(500).json({ success: false, message: 'eSewa credentials not configured' });
//     }

//     const transactionId = `SWMS-EW-${req.user._id}-${Date.now()}`;
//     const amount        = MONTHLY_FEE;

//     const message   = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
//     const signature = crypto
//       .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
//       .update(message)
//       .digest('base64');

//     const payment = await Payment.create({
//       user:          req.user._id,
//       amount,
//       paymentMethod: 'esewa',
//       transactionId,
//       status:        'pending',
//       forMonth:      new Date().toISOString().slice(0, 7),
//     });

//     res.json({
//       success: true,
//       formFields: {
//         amount:                  String(amount),
//         tax_amount:              '0',
//         total_amount:            String(amount),
//         transaction_uuid:        transactionId,
//         product_code:            process.env.ESEWA_PRODUCT_CODE,
//         product_service_charge:  '0',
//         product_delivery_charge: '0',
//         success_url:             `${process.env.FRONTEND_URL}/payment-success?method=esewa`,
//         failure_url:             `${process.env.FRONTEND_URL}/payment-failed`,
//         signed_field_names:      'total_amount,transaction_uuid,product_code',
//         signature,
//       },
//       esewaUrl:
//         process.env.NODE_ENV === 'production'
//           ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
//           : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
//       paymentId: payment._id,
//     });
//   } catch (err) {
//     console.error('eSewa initiate error:', err.message);
//     res.status(500).json({ success: false, message: 'eSewa initialization failed', detail: err.message });
//   }
// });

// // @desc    VERIFY eSewa payment
// // @route   POST /api/payments/esewa/verify
// // @access  Private/Resident
// router.post('/esewa/verify', protect, async (req, res) => {
//   try {
//     const { encodedData } = req.body;
//     if (!encodedData) {
//       return res.status(400).json({ success: false, message: 'Missing encoded data' });
//     }

//     let decoded;
//     try {
//       decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
//     } catch {
//       return res.status(400).json({ success: false, message: 'Invalid encoded data format' });
//     }

//     const { transaction_uuid, status, total_amount, transaction_code } = decoded;

//     if (status !== 'COMPLETE') {
//       return res.status(400).json({ success: false, message: `eSewa status: ${status}` });
//     }

//     // Verify signature
//     const message  = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names`;
//     const expected = crypto
//       .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
//       .update(message)
//       .digest('base64');

//     if (expected !== decoded.signature) {
//       return res.status(400).json({ success: false, message: 'Signature mismatch — payment tampered' });
//     }

//     const payment = await Payment.findOne({ transactionId: transaction_uuid, user: req.user._id });
//     if (!payment) {
//       return res.status(404).json({ success: false, message: 'Payment record not found' });
//     }
//     if (payment.status === 'completed') {
//       return res.json({ success: true, message: 'Already verified', payment });
//     }

//     const validUntil    = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
//     payment.status      = 'completed';
//     payment.paymentDate = new Date();
//     payment.validUntil  = validUntil;
//     payment.metadata    = { esewaTransactionCode: transaction_code };
//     await payment.save();

//     await markUserPaid(req.user._id, validUntil);

//     const user = await User.findById(req.user._id);
//     await Transaction.create({
//       user:        req.user._id,
//       type:        'payment',
//       amount:      MONTHLY_FEE,
//       description: `Monthly fee paid via eSewa for ${payment.forMonth}`,
//       reference:   { paymentId: payment._id },
//       balance:     user.coins,
//       status:      'completed',
//     });

//     await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
//     await Notification.create({
//       recipient: req.user._id,
//       type:      'payment_received',
//       title:     '✅ Payment Successful',
//       message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via eSewa. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
//       data:      { paymentId: payment._id, validUntil },
//     });

//     const io = req.app.get('io');
//     if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

//     res.json({ success: true, message: 'eSewa payment verified!', validUntil, payment });
//   } catch (err) {
//     console.error('eSewa verify error:', err.message);
//     res.status(500).json({ success: false, message: 'eSewa verification failed', detail: err.message });
//   }
// });

// // ============================================================
// // @desc    REDEEM 1000 coins for 1 free month (no cash)
// // @route   POST /api/payments/redeem
// // @access  Private/Resident
// // ============================================================
// router.post('/redeem', protect, authorize('resident'), async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if ((user.coins || 0) < MONTHLY_FEE) {
//       return res.status(400).json({
//         success: false,
//         message: `Need ${MONTHLY_FEE} coins. You have ${user.coins || 0}.`,
//       });
//     }

//     if (isFreeServiceActive(user)) {
//       return res.status(400).json({ success: false, message: 'Free service already active.' });
//     }

//     const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);

//     user.coins             -= MONTHLY_FEE;
//     user.freeServiceMonths  = (user.freeServiceMonths || 0) + 1;
//     user.freeServiceUntil   = validUntil;
//     user.isServiceFree      = true;
//     user.paymentStatus      = 'free';
//     user.monthlyFeePaid     = true;
//     user.nextPaymentDue     = validUntil;
//     await user.save();

//     await Transaction.create({
//       user:        user._id,
//       type:        'coin_spent',
//       amount:      MONTHLY_FEE,
//       description: 'Redeemed 1,000 coins for 1 month free service',
//       balance:     user.coins,
//       status:      'completed',
//     });

//     const payment = await Payment.create({
//       user:          user._id,
//       amount:        MONTHLY_FEE,
//       paymentMethod: 'coin_redeem',
//       transactionId: `COIN-${user._id}-${Date.now()}`,
//       status:        'completed',
//       isFreeService: true,
//       coinsUsed:     MONTHLY_FEE,
//       validUntil,
//       forMonth:      new Date().toISOString().slice(0, 7),
//     });

//     await Notification.create({
//       recipient: user._id,
//       type:      'free_service_unlocked',
//       title:     '🎉 Free Service Activated!',
//       message:   `You redeemed 1,000 coins for 1 month of free waste collection. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
//       data:      { paymentId: payment._id, validUntil },
//       priority:  'high',
//     });

//     const io = req.app.get('io');
//     if (io) io.to(user._id.toString()).emit('free_service_unlocked', { validUntil });

//     res.json({
//       success:        true,
//       message:        `1,000 coins redeemed! Free service active until ${validUntil.toLocaleDateString('en-NP')}.`,
//       validUntil,
//       coinsRemaining: user.coins,
//     });
//   } catch (err) {
//     console.error('Redeem error:', err.message);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;

// ============================================================
// FEATURE 4: Standardized Billing (eSewa / Khalti)
// FILE: backend/routes/payments.js
// BASE URL: /api/payments
// ============================================================
// Covers:
//   - Khalti  : initiate → redirect → verify (pidx lookup)
//   - eSewa   : initiate → redirect → verify (signed params)
//   - Status  : current payment status for the resident
//   - Monthly Fee Status : /monthly-fee/status (frontend compat)
//   - History : last 12 payments
//   - Redeem  : spend 1000 coins for free month (no cash needed)
// ============================================================

const express      = require('express');
const router       = express.Router();
const axios        = require('axios');
const crypto       = require('crypto');
const Payment      = require('../models/Payment');
const User         = require('../models/User');
const Transaction  = require('../models/Transaction');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const MONTHLY_FEE = 1000; // Fixed fee — never changes
const FREE_DAYS   = 30;   // Days of free service per redemption

// ── Helper: set user as paid for this month ──────────────────
const markUserPaid = async (userId, validUntil) => {
  await User.findByIdAndUpdate(userId, {
    monthlyFeePaid:  true,
    lastPaymentDate: new Date(),
    nextPaymentDue:  validUntil,
    paymentStatus:   'paid',
  });
};

// ── Helper: notify admins of new payment ─────────────────────
const notifyAdmins = async (userId, userName, paymentId, amount) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          sender:    userId,
          type:      'payment_received',
          title:     'Monthly Fee Received',
          message:   `${userName} paid monthly fee of Rs. ${amount}`,
          data:      { paymentId, userId },
          priority:  'medium',
        }))
      );
    }
  } catch (err) {
    console.error('notifyAdmins error:', err.message);
  }
};

// ── Helper: check if free service is currently active ────────
const isFreeServiceActive = (user) =>
  user.isServiceFree &&
  user.freeServiceUntil &&
  new Date(user.freeServiceUntil) > new Date();

// ============================================================
// @desc    GET current billing status
// @route   GET /api/payments/status
// @access  Private/Resident
// ============================================================
router.get('/status', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'monthlyFeePaid paymentStatus isServiceFree freeServiceUntil lastPaymentDate nextPaymentDue coins'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const freeActive = isFreeServiceActive(user);

    res.json({
      success: true,
      billing: {
        monthlyFee:       MONTHLY_FEE,
        monthlyFeePaid:   user.monthlyFeePaid,
        paymentStatus:    freeActive ? 'free' : user.paymentStatus,
        lastPaymentDate:  user.lastPaymentDate,
        nextPaymentDue:   user.nextPaymentDue,
        isFreeActive:     freeActive,
        freeServiceUntil: freeActive ? user.freeServiceUntil : null,
        coinBalance:      user.coins || 0,
        canRedeem:        (user.coins || 0) >= MONTHLY_FEE && !freeActive,
      },
    });
  } catch (err) {
    console.error('GET /status error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET monthly fee status (frontend compatibility route)
// @route   GET /api/payments/monthly-fee/status
// @access  Private/Resident
// ============================================================
router.get('/monthly-fee/status', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'monthlyFeePaid paymentStatus isServiceFree freeServiceUntil lastPaymentDate nextPaymentDue coins'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const freeActive     = isFreeServiceActive(user);
    const currentMonth   = new Date().getMonth() + 1;
    const currentYear    = new Date().getFullYear();

    // Check if there is a completed payment for this month
    const thisMonthPayment = await Payment.findOne({
      user:   req.user._id,
      status: 'completed',
      forMonth: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
    });

    res.json({
      success:         true,
      paid:            !!thisMonthPayment || user.monthlyFeePaid,
      isFreeActive:    freeActive,
      freeServiceUntil: freeActive ? user.freeServiceUntil : null,
      paymentStatus:   freeActive ? 'free' : user.paymentStatus,
      nextPaymentDue:  user.nextPaymentDue,
      lastPaymentDate: user.lastPaymentDate,
      coinBalance:     user.coins || 0,
      canRedeem:       (user.coins || 0) >= MONTHLY_FEE && !freeActive,
      monthlyFee:      MONTHLY_FEE,
      payment:         thisMonthPayment || null,
    });
  } catch (err) {
    console.error('GET /monthly-fee/status error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET payment history (last 12)
// @route   GET /api/payments/history
// @access  Private/Resident
// ============================================================
router.get('/history', protect, authorize('resident'), async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(12)
      .select('-metadata -receipt');

    res.json({ success: true, payments });
  } catch (err) {
    console.error('GET /history error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// ─────────────────────  KHALTI  ─────────────────────────────
// ============================================================

// @desc    INITIATE Khalti payment
// @route   POST /api/payments/khalti/initiate
// @access  Private/Resident
router.post('/khalti/initiate', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Guard: free service active
    if (isFreeServiceActive(user)) {
      return res.status(400).json({
        success: false,
        message: 'Your service is currently free. No payment needed.',
      });
    }

    if (!process.env.KHALTI_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Khalti secret key not configured' });
    }

    const orderId = `SWMS-KH-${req.user._id}-${Date.now()}`;

    const khaltiRes = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      {
        return_url:          `${process.env.FRONTEND_URL}/payment-success?method=khalti`,
        website_url:          process.env.FRONTEND_URL,
        amount:               MONTHLY_FEE * 100, // Paisa
        purchase_order_id:    orderId,
        purchase_order_name: 'Monthly Waste Collection Fee',
        customer_info: {
          name:  user.name,
          email: user.email,
          phone: user.phone || '9800000000',
        },
      },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const payment = await Payment.create({
      user:          req.user._id,
      amount:        MONTHLY_FEE,
      paymentMethod: 'khalti',
      transactionId: orderId,
      status:        'pending',
      forMonth:      new Date().toISOString().slice(0, 7),
      metadata:      { pidx: khaltiRes.data.pidx },
    });

    res.json({
      success:     true,
      payment_url: khaltiRes.data.payment_url,
      pidx:        khaltiRes.data.pidx,
      paymentId:   payment._id,
    });
  } catch (err) {
    console.error('Khalti initiate error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'Khalti initialization failed',
      detail:  err.response?.data || err.message,
    });
  }
});

// @desc    VERIFY Khalti payment
// @route   POST /api/payments/khalti/verify
// @access  Private/Resident
router.post('/khalti/verify', protect, async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required' });
    }

    const khaltiRes = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const { status, transaction_id, total_amount } = khaltiRes.data;

    if (status !== 'Completed') {
      return res.status(400).json({ success: false, message: `Payment status: ${status}` });
    }

    const payment = await Payment.findOne({ 'metadata.pidx': pidx, user: req.user._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Payment already verified', payment });
    }

    const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
    payment.status                       = 'completed';
    payment.paymentDate                  = new Date();
    payment.validUntil                   = validUntil;
    payment.metadata.khaltiTransactionId = transaction_id;
    await payment.save();

    await markUserPaid(req.user._id, validUntil);

    const user = await User.findById(req.user._id);
    await Transaction.create({
      user:        req.user._id,
      type:        'payment',
      amount:      MONTHLY_FEE,
      description: `Monthly fee paid via Khalti for ${payment.forMonth}`,
      reference:   { paymentId: payment._id },
      balance:     user.coins,
      status:      'completed',
    });

    await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
    await Notification.create({
      recipient: req.user._id,
      type:      'payment_received',
      title:     '✅ Payment Successful',
      message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via Khalti. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
      data:      { paymentId: payment._id, validUntil },
    });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

    res.json({ success: true, message: 'Payment verified!', validUntil, payment });
  } catch (err) {
    console.error('Khalti verify error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'Khalti verification failed',
      detail:  err.response?.data || err.message,
    });
  }
});

// ============================================================
// ─────────────────────  eSEWA  ──────────────────────────────
// ============================================================

// @desc    GET eSewa payment form fields (signed)
// @route   POST /api/payments/esewa/initiate
// @access  Private/Resident
router.post('/esewa/initiate', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (isFreeServiceActive(user)) {
      return res.status(400).json({ success: false, message: 'Service is currently free.' });
    }

    if (!process.env.ESEWA_SECRET_KEY || !process.env.ESEWA_PRODUCT_CODE) {
      return res.status(500).json({ success: false, message: 'eSewa credentials not configured' });
    }

    const transactionId = `SWMS-EW-${req.user._id}-${Date.now()}`;
    const amount        = MONTHLY_FEE;

    const message   = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
    const signature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    const payment = await Payment.create({
      user:          req.user._id,
      amount,
      paymentMethod: 'esewa',
      transactionId,
      status:        'pending',
      forMonth:      new Date().toISOString().slice(0, 7),
    });

    res.json({
      success: true,
      formFields: {
        amount:                  String(amount),
        tax_amount:              '0',
        total_amount:            String(amount),
        transaction_uuid:        transactionId,
        product_code:            process.env.ESEWA_PRODUCT_CODE,
        product_service_charge:  '0',
        product_delivery_charge: '0',
        success_url:             `${process.env.FRONTEND_URL}/payment-success?method=esewa`,
        failure_url:             `${process.env.FRONTEND_URL}/payment-failed`,
        signed_field_names:      'total_amount,transaction_uuid,product_code',
        signature,
      },
      esewaUrl:
        process.env.NODE_ENV === 'production'
          ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
          : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      paymentId: payment._id,
    });
  } catch (err) {
    console.error('eSewa initiate error:', err.message);
    res.status(500).json({ success: false, message: 'eSewa initialization failed', detail: err.message });
  }
});

// @desc    VERIFY eSewa payment
// @route   POST /api/payments/esewa/verify
// @access  Private/Resident
router.post('/esewa/verify', protect, async (req, res) => {
  try {
    const { encodedData } = req.body;
    if (!encodedData) {
      return res.status(400).json({ success: false, message: 'Missing encoded data' });
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid encoded data format' });
    }

    const { transaction_uuid, status, total_amount, transaction_code } = decoded;

    if (status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: `eSewa status: ${status}` });
    }

    // Verify signature
    const message  = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names`;
    const expected = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    if (expected !== decoded.signature) {
      return res.status(400).json({ success: false, message: 'Signature mismatch — payment tampered' });
    }

    const payment = await Payment.findOne({ transactionId: transaction_uuid, user: req.user._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Already verified', payment });
    }

    const validUntil    = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
    payment.status      = 'completed';
    payment.paymentDate = new Date();
    payment.validUntil  = validUntil;
    payment.metadata    = { esewaTransactionCode: transaction_code };
    await payment.save();

    await markUserPaid(req.user._id, validUntil);

    const user = await User.findById(req.user._id);
    await Transaction.create({
      user:        req.user._id,
      type:        'payment',
      amount:      MONTHLY_FEE,
      description: `Monthly fee paid via eSewa for ${payment.forMonth}`,
      reference:   { paymentId: payment._id },
      balance:     user.coins,
      status:      'completed',
    });

    await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
    await Notification.create({
      recipient: req.user._id,
      type:      'payment_received',
      title:     '✅ Payment Successful',
      message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via eSewa. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
      data:      { paymentId: payment._id, validUntil },
    });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

    res.json({ success: true, message: 'eSewa payment verified!', validUntil, payment });
  } catch (err) {
    console.error('eSewa verify error:', err.message);
    res.status(500).json({ success: false, message: 'eSewa verification failed', detail: err.message });
  }
});

// ============================================================
// @desc    REDEEM 1000 coins for 1 free month (no cash)
// @route   POST /api/payments/redeem
// @access  Private/Resident
// ============================================================
router.post('/redeem', protect, authorize('resident'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if ((user.coins || 0) < MONTHLY_FEE) {
      return res.status(400).json({
        success: false,
        message: `Need ${MONTHLY_FEE} coins. You have ${user.coins || 0}.`,
      });
    }

    if (isFreeServiceActive(user)) {
      return res.status(400).json({ success: false, message: 'Free service already active.' });
    }

    const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);

    user.coins             -= MONTHLY_FEE;
    user.freeServiceMonths  = (user.freeServiceMonths || 0) + 1;
    user.freeServiceUntil   = validUntil;
    user.isServiceFree      = true;
    user.paymentStatus      = 'free';
    user.monthlyFeePaid     = true;
    user.nextPaymentDue     = validUntil;
    await user.save();

    await Transaction.create({
      user:        user._id,
      type:        'coin_spent',
      amount:      MONTHLY_FEE,
      description: 'Redeemed 1,000 coins for 1 month free service',
      balance:     user.coins,
      status:      'completed',
    });

    const payment = await Payment.create({
      user:          user._id,
      amount:        MONTHLY_FEE,
      paymentMethod: 'coin_redeem',
      transactionId: `COIN-${user._id}-${Date.now()}`,
      status:        'completed',
      isFreeService: true,
      coinsUsed:     MONTHLY_FEE,
      validUntil,
      forMonth:      new Date().toISOString().slice(0, 7),
    });

    await Notification.create({
      recipient: user._id,
      type:      'free_service_unlocked',
      title:     '🎉 Free Service Activated!',
      message:   `You redeemed 1,000 coins for 1 month of free waste collection. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
      data:      { paymentId: payment._id, validUntil },
      priority:  'high',
    });

    const io = req.app.get('io');
    if (io) io.to(user._id.toString()).emit('free_service_unlocked', { validUntil });

    res.json({
      success:        true,
      message:        `1,000 coins redeemed! Free service active until ${validUntil.toLocaleDateString('en-NP')}.`,
      validUntil,
      coinsRemaining: user.coins,
    });
  } catch (err) {
    console.error('Redeem error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// @desc    GET invoice/receipt as PDF for a payment
// @route   GET /api/payments/:id/invoice
// @access  Private/Resident
// ============================================================
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const user = await User.findById(req.user._id).select('name email phone address');

    // ── Build a simple HTML receipt ──────────────────────────
    const paidDate   = payment.paymentDate || payment.createdAt;
    const validUntil = payment.validUntil
      ? new Date(payment.validUntil).toLocaleDateString('en-NP')
      : 'N/A';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 40px; }
    .header { text-align: center; border-bottom: 2px solid #1976D2; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #1976D2; font-size: 24px; margin-bottom: 4px; }
    .header p  { color: #666; font-size: 13px; }
    .badge { display: inline-block; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 13px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .row .label { color: #666; }
    .row .value { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0; margin-top: 10px; border-top: 2px solid #1976D2; }
    .total-row .label { font-size: 16px; font-weight: 700; }
    .total-row .value { font-size: 20px; font-weight: 700; color: #1976D2; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🗑️ Smart Waste Management System</h1>
    <p>Official Payment Receipt</p>
    <span class="badge">${payment.status === 'completed' ? '✓ PAID' : payment.status.toUpperCase()}</span>
  </div>

  <div class="section">
    <h3>Receipt Details</h3>
    <div class="row"><span class="label">Receipt No.</span><span class="value">${payment._id}</span></div>
    <div class="row"><span class="label">Transaction ID</span><span class="value">${payment.transactionId || 'N/A'}</span></div>
    <div class="row"><span class="label">Payment Date</span><span class="value">${new Date(paidDate).toLocaleDateString('en-NP')}</span></div>
    <div class="row"><span class="label">Valid Until</span><span class="value">${validUntil}</span></div>
    <div class="row"><span class="label">For Month</span><span class="value">${payment.forMonth || 'N/A'}</span></div>
  </div>

  <div class="section">
    <h3>Customer Details</h3>
    <div class="row"><span class="label">Name</span><span class="value">${user.name || 'N/A'}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">${user.email || 'N/A'}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${user.phone || 'N/A'}</span></div>
  </div>

  <div class="section">
    <h3>Payment Details</h3>
    <div class="row"><span class="label">Service</span><span class="value">Monthly Waste Collection</span></div>
    <div class="row"><span class="label">Payment Method</span><span class="value">${(payment.paymentMethod || '').replace(/_/g, ' ').toUpperCase()}</span></div>
    ${payment.coinsUsed ? `<div class="row"><span class="label">Coins Used</span><span class="value">${payment.coinsUsed} coins</span></div>` : ''}
    <div class="total-row">
      <span class="label">Total Amount</span>
      <span class="value">Rs. ${payment.amount}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for using Smart Waste Management System</p>
    <p style="margin-top:6px;">This is a computer-generated receipt and does not require a signature.</p>
    <p style="margin-top:6px;">Generated on ${new Date().toLocaleDateString('en-NP')} at ${new Date().toLocaleTimeString('en-NP')}</p>
  </div>
</body>
</html>`;

    // ── Try to generate PDF with puppeteer if available ──────
    // If puppeteer is not installed, fall back to HTML download
    try {
      const puppeteer = require('puppeteer');
      const browser   = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page      = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}.pdf"`);
      return res.send(pdfBuffer);
    } catch {
      // puppeteer not installed — send HTML file instead
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}.html"`);
      return res.send(html);
    }
  } catch (err) {
    console.error('Invoice error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
});

module.exports = router;
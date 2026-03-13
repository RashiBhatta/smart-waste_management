// ============================================================
// FEATURE 4: Standardized Billing (eSewa / Khalti)
// FILE: backend/routes/payments.js
// BASE URL: /api/payments
// ============================================================
// Covers:
//   - Khalti  : initiate → redirect → verify (pidx lookup)
//   - eSewa   : initiate → redirect → verify (signed params)
//   - Status  : current payment status for the resident
//   - History : last 12 payments
//   - Redeem  : spend 1000 coins for free month (no cash needed)
// ============================================================

const express     = require('express');
const router      = express.Router();
const axios       = require('axios');
const crypto      = require('crypto');
const Payment     = require('../models/Payment');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const MONTHLY_FEE  = 1000;           // Fixed fee — never changes
const FREE_DAYS    = 30;             // Days of free service per redemption

// ── Helper: set user as paid for this month ──────────────────
const markUserPaid = async (userId, validUntil) => {
  await User.findByIdAndUpdate(userId, {
    monthlyFeePaid:  true,
    lastPaymentDate: new Date(),
    nextPaymentDue:  validUntil,
    paymentStatus:   'paid',
  });
};

// ── Helper: notify admin of new payment ──────────────────────
const notifyAdmins = async (userId, userName, paymentId, amount) => {
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
};

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

    const isFreeActive =
      user.isServiceFree &&
      user.freeServiceUntil &&
      new Date(user.freeServiceUntil) > new Date();

    res.json({
      success: true,
      billing: {
        monthlyFee:      MONTHLY_FEE,
        monthlyFeePaid:  user.monthlyFeePaid,
        paymentStatus:   isFreeActive ? 'free' : user.paymentStatus,
        lastPaymentDate: user.lastPaymentDate,
        nextPaymentDue:  user.nextPaymentDue,
        isFreeActive,
        freeServiceUntil: isFreeActive ? user.freeServiceUntil : null,
        coinBalance:     user.coins,
        canRedeem:       (user.coins || 0) >= MONTHLY_FEE && !isFreeActive,
      },
    });
  } catch (err) {
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

    // Guard: free service active
    if (user.isServiceFree && user.freeServiceUntil > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Your service is currently free. No payment needed.',
      });
    }

    const orderId = `SWMS-KH-${req.user._id}-${Date.now()}`;

    // Call Khalti API to create a payment session
    const khaltiRes = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      {
        return_url:           `${process.env.FRONTEND_URL}/payment-success?method=khalti`,
        website_url:           process.env.FRONTEND_URL,
        amount:                MONTHLY_FEE * 100, // Khalti uses Paisa (1 NPR = 100 Paisa)
        purchase_order_id:     orderId,
        purchase_order_name:  'Monthly Waste Collection Fee',
        customer_info: {
          name:  user.name,
          email: user.email,
          phone: user.phone || '9800000000',
        },
      },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    // Persist a pending Payment record
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
    res.status(500).json({ success: false, message: 'Khalti initialization failed' });
  }
});

// @desc    VERIFY Khalti payment (called from PaymentSuccess page)
// @route   POST /api/payments/khalti/verify
// @access  Private/Resident
router.post('/khalti/verify', protect, async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) return res.status(400).json({ success: false, message: 'pidx is required' });

    // Look up payment result from Khalti
    const khaltiRes = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    const { status, transaction_id, total_amount } = khaltiRes.data;

    if (status !== 'Completed') {
      return res.status(400).json({ success: false, message: `Payment status: ${status}` });
    }

    // Find the pending payment record
    const payment = await Payment.findOne({ 'metadata.pidx': pidx, user: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Payment already verified', payment });
    }

    // Mark completed
    const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
    payment.status        = 'completed';
    payment.paymentDate   = new Date();
    payment.validUntil    = validUntil;
    payment.metadata.khaltiTransactionId = transaction_id;
    await payment.save();

    // Update user
    await markUserPaid(req.user._id, validUntil);

    // Log transaction
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

    // Notify admin + resident
    await notifyAdmins(req.user._id, user.name, payment._id, MONTHLY_FEE);
    await Notification.create({
      recipient: req.user._id,
      type:      'payment_received',
      title:     '✅ Payment Successful',
      message:   `Your Rs. ${MONTHLY_FEE} monthly fee was paid via Khalti. Valid until ${validUntil.toLocaleDateString('en-NP')}.`,
      data:      { paymentId: payment._id, validUntil },
    });

    // Socket event
    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('payment_success', { validUntil });

    res.json({ success: true, message: 'Payment verified!', validUntil, payment });
  } catch (err) {
    console.error('Khalti verify error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Khalti verification failed' });
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

    if (user.isServiceFree && user.freeServiceUntil > new Date()) {
      return res.status(400).json({ success: false, message: 'Service is currently free.' });
    }

    const transactionId = `SWMS-EW-${req.user._id}-${Date.now()}`;
    const amount        = MONTHLY_FEE;

    // eSewa v2 signature: HMAC-SHA256 of "total_amount,transaction_uuid,product_code"
    const message   = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
    const signature = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    // Save pending record
    const payment = await Payment.create({
      user:          req.user._id,
      amount,
      paymentMethod: 'esewa',
      transactionId,
      status:        'pending',
      forMonth:      new Date().toISOString().slice(0, 7),
    });

    // Return all form fields frontend needs to POST to eSewa
    res.json({
      success: true,
      formFields: {
        amount:           String(amount),
        tax_amount:       '0',
        total_amount:     String(amount),
        transaction_uuid: transactionId,
        product_code:     process.env.ESEWA_PRODUCT_CODE,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${process.env.FRONTEND_URL}/payment-success?method=esewa`,
        failure_url: `${process.env.FRONTEND_URL}/payment-failed`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
      esewaUrl:  process.env.NODE_ENV === 'production'
        ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
        : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      paymentId: payment._id,
    });
  } catch (err) {
    console.error('eSewa initiate error:', err.message);
    res.status(500).json({ success: false, message: 'eSewa initialization failed' });
  }
});

// @desc    VERIFY eSewa payment (called from PaymentSuccess page)
// @route   POST /api/payments/esewa/verify
// @access  Private/Resident
router.post('/esewa/verify', protect, async (req, res) => {
  try {
    // eSewa returns a base64-encoded JSON in `data` query param
    const { encodedData } = req.body;
    if (!encodedData) return res.status(400).json({ success: false, message: 'Missing data' });

    const decoded    = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
    const { transaction_uuid, status, total_amount, transaction_code } = decoded;

    if (status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: `eSewa status: ${status}` });
    }

    // Verify signature
    const message   = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names`;
    const expected  = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    if (expected !== decoded.signature) {
      return res.status(400).json({ success: false, message: 'Signature mismatch — payment tampered' });
    }

    const payment = await Payment.findOne({ transactionId: transaction_uuid, user: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Already verified', payment });
    }

    const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);
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
    res.status(500).json({ success: false, message: 'eSewa verification failed' });
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

    if ((user.coins || 0) < MONTHLY_FEE) {
      return res.status(400).json({
        success: false,
        message: `Need ${MONTHLY_FEE} coins. You have ${user.coins}.`,
      });
    }
    if (user.isServiceFree && user.freeServiceUntil > new Date()) {
      return res.status(400).json({ success: false, message: 'Free service already active.' });
    }

    const validUntil = new Date(Date.now() + FREE_DAYS * 24 * 60 * 60 * 1000);

    // Deduct coins & activate free service
    user.coins            -= MONTHLY_FEE;
    user.freeServiceMonths = (user.freeServiceMonths || 0) + 1;
    user.freeServiceUntil  = validUntil;
    user.isServiceFree     = true;
    user.paymentStatus     = 'free';
    user.monthlyFeePaid    = true;
    user.nextPaymentDue    = validUntil;
    await user.save();

    // Log coin spend
    await Transaction.create({
      user:        user._id,
      type:        'coin_spent',
      amount:      MONTHLY_FEE,
      description: 'Redeemed 1,000 coins for 1 month free service',
      balance:     user.coins,
      status:      'completed',
    });

    // Log payment record
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
      success:      true,
      message:      `1,000 coins redeemed! Free service active until ${validUntil.toLocaleDateString('en-NP')}.`,
      validUntil,
      coinsRemaining: user.coins,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   type: {
//     type: String,
//     enum: ['monthly_fee', 'reward', 'penalty', 'subscription', 'program_fee'],
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'completed', 'failed', 'refunded'],
//     default: 'pending'
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['card', 'cash', 'coins', 'bank_transfer', 'wallet'],
//     required: true
//   },
//   transactionId: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   description: String,
//   metadata: {
//     programId: mongoose.Schema.Types.ObjectId,
//     collectionId: mongoose.Schema.Types.ObjectId,
//     month: Number,
//     year: Number
//   },
//   receipt: String,
//   paidForMonth: {
//     month: Number,
//     year: Number
//   },
//   dueDate: Date,
//   paidDate: Date,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Generate transaction ID
// paymentSchema.pre('save', async function(next) {
//   if (!this.transactionId) {
//     const prefix = this.type === 'monthly_fee' ? 'MF' : 
//                    this.type === 'reward' ? 'RW' : 'PY';
//     const timestamp = Date.now().toString(36).toUpperCase();
//     const random = Math.random().toString(36).substring(2, 8).toUpperCase();
//     this.transactionId = `${prefix}${timestamp}${random}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Payment', paymentSchema);





const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    default: 1000 // Monthly fee
  },
  paymentMethod: { 
    type: String, 
    enum: ['khalti', 'esewa', 'cash', 'coin_redeem'], 
    required: true 
  },
  transactionId: { 
    type: String, 
    unique: true,
    sparse: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  validUntil: { 
    type: Date 
  },
  forMonth: { 
    type: String // Format: YYYY-MM 
  },
  isFreeService: { 
    type: Boolean, 
    default: false 
  },
  coinsUsed: { 
    type: Number, 
    default: 0 
  },
  receipt: {
    path: String,
    url: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for faster queries
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['coin_earned', 'coin_spent', 'payment', 'refund'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  reference: {
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    paymentId: { type: mongoose.Schema.Types.ObjectId }
  },
  balance: { 
    type: Number 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' 
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
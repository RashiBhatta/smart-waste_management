const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  resident: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  program: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Program', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  proof: { 
    type: String,
    required: true
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: Date
}, { timestamps: true });

// Prevent duplicate participation submissions
participationSchema.index({ resident: 1, program: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);

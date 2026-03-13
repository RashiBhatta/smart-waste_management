// const mongoose = require('mongoose');

// const volunteerRequestSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
//   programName: String,
//   status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
//   coinsToAward: { type: Number, default: 150 },
//   requestedAt: { type: Date, default: Date.now },
//   processedAt: Date,
//   processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   adminNotes: String
// }, { timestamps: true });

// module.exports = mongoose.model('VolunteerRequest', volunteerRequestSchema);




const mongoose = require('mongoose');

const volunteerRequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  programId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Program', 
    required: true 
  },
  programName: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  coinsToAward: {
    type: Number,
    default: 100
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('VolunteerRequest', volunteerRequestSchema);
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
  taskCompletedStatus: {
    type: String,
    enum: ['completed', 'not_completed'],
    required: true
  },
  taskDescription: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  proofImageUrl: { 
    type: String
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminRemarks: {
    type: String
  },
  coinsAwarded: {
    type: Boolean,
    default: false
  },
  reviewedAt: Date
}, { timestamps: true });

// Prevent duplicate participation submissions
// Only enforce uniqueness when both `resident` and `program` are non-null ObjectIds.
// This avoids duplicate-key errors for documents that are missing these fields
// (e.g. legacy or malformed inserts). Application code should still always
// provide both fields, but this index prevents the DB from failing when nulls
// exist.
participationSchema.index(
  { resident: 1, program: 1 },
  { unique: true, partialFilterExpression: { resident: { $type: 'objectId' }, program: { $type: 'objectId' } } }
);

module.exports = mongoose.model('Participation', participationSchema);

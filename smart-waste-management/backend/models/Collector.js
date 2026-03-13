const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['truck', 'van', 'bike', 'other'],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  assignedZone: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'central'],
    required: true
  },
  assignedWards: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  schedule: {
    monday: { working: { type: Boolean, default: true }, start: String, end: String },
    tuesday: { working: { type: Boolean, default: true }, start: String, end: String },
    wednesday: { working: { type: Boolean, default: true }, start: String, end: String },
    thursday: { working: { type: Boolean, default: true }, start: String, end: String },
    friday: { working: { type: Boolean, default: true }, start: String, end: String },
    saturday: { working: { type: Boolean, default: false }, start: String, end: String },
    sunday: { working: { type: Boolean, default: false }, start: String, end: String }
  },
  totalCollections: {
    type: Number,
    default: 0
  },
  totalWeight: {
    type: Number,
    default: 0
  },
  completedCollections: {
    type: Number,
    default: 0
  },
  cancelledCollections: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  documents: [{
    type: { type: String, enum: ['license', 'insurance', 'id'] },
    url: String,
    verified: { type: Boolean, default: false },
    uploadedAt: Date,
    verifiedAt: Date
  }],
  todayCollections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  monthlyEarnings: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update rating when new feedback received
collectorSchema.methods.updateRating = function(newRating) {
  const total = this.rating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.rating = total / this.totalRatings;
  this.updatedAt = Date.now();
  return this.rating;
};

module.exports = mongoose.model('Collector', collectorSchema);
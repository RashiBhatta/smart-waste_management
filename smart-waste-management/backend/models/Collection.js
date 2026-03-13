// // // models/Collection.js
// // const mongoose = require('mongoose');

// // const collectionSchema = new mongoose.Schema({
// //   resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// //   collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   zone: { type: String, required: true },
// //   scheduledDate: { type: Date, required: true },
// //   status: { type: String, enum: ['Pending', 'Collected', 'Skipped'], default: 'Pending' },
// //   wasteType: { type: String, enum: ['Organic', 'Recyclable', 'Hazardous', 'Mixed'] },
// //   notes: { type: String }, // e.g., Reason for skipping
// //   photoEvidence: { type: String } // URL to uploaded photo
// // }, { timestamps: true });

// // module.exports = mongoose.model('Collection', collectionSchema);

// const mongoose = require('mongoose');

// const collectionSchema = new mongoose.Schema({
//   // The Resident who requested the pickup
//   resident: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
  
//   // The Collector assigned to this task (null until assigned)
//   collector: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   },

//   // Structured address to match user profile data
//   address: {
//     zone: { type: String, required: true },
//     street: { type: String }
//   },

//   // Date and Time tracking
//   scheduledDate: { 
//     type: Date 
//   },
  
//   // Status tracking for the Live Feed
//   status: { 
//     type: String, 
//     enum: ['Pending', 'Scheduled', 'Collected', 'Skipped'], 
//     default: 'Pending' 
//   },

//   // Waste metrics for Admin Analytics
//   wasteType: { 
//     type: String, 
//     enum: ['Organic', 'Recyclable', 'Hazardous', 'Mixed'],
//     default: 'Mixed'
//   },
  
//   actualWeight: { 
//     type: Number, 
//     default: 0 
//   },

//   // Additional metadata
//   notes: { 
//     type: String 
//   }, 
  
//   photoEvidence: { 
//     type: String 
//   } 
// }, { timestamps: true });

// module.exports = mongoose.model('Collection', collectionSchema);





const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  resident: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  collector: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  address: {
    zone: { type: String, required: true },
    street: { type: String },
    city: { type: String, default: 'Kathmandu' }
  },
  scheduledDate: { 
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Scheduled', 'In Progress', 'Collected', 'Skipped'], 
    default: 'Pending' 
  },
  wasteType: { 
    type: String, 
    enum: ['Organic', 'Recyclable', 'Hazardous', 'Mixed', 'Plastic', 'Paper', 'Glass', 'Metal'],
    default: 'Mixed'
  },
  actualWeight: { 
    type: Number, 
    default: 0 
  },
  estimatedWeight: {
    type: Number,
    default: 0
  },
  notes: { 
    type: String 
  }, 
  photoEvidence: { 
    type: String 
  },
  route: {
    type: String
  },
  sequence: {
    type: Number
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, { timestamps: true });

// Index for faster queries
collectionSchema.index({ collector: 1, status: 1 });
collectionSchema.index({ resident: 1, createdAt: -1 });
collectionSchema.index({ 'address.zone': 1, status: 1 });

module.exports = mongoose.model('Collection', collectionSchema);
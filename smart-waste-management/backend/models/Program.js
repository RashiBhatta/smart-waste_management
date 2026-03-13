// // // models/Program.js
// // const mongoose = require('mongoose');

// // const programSchema = new mongoose.Schema({
// //   title: { type: String, required: true }, // e.g., Cleanup Drive
// //   description: { type: String },
// //   date: { type: Date, required: true },
// //   rewardCoins: { type: Number, default: 100 }, // Standard reward
// //   volunteers: [{
// //     residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //     status: { type: String, enum: ['Registered', 'Verified', 'Rejected'], default: 'Registered' }
// //   }]
// // }, { timestamps: true });

// // module.exports = mongoose.model('Program', programSchema);


// const mongoose = require('mongoose');

// const programSchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: true 
//   },
//   organization: { 
//     type: String, 
//     default: 'SWM Admin' 
//   },
//   description: { 
//     type: String 
//   },
//   zone: { 
//     type: String 
//   },
//   rewardCoins: { 
//     type: Number, 
//     default: 100 
//   },
//   maxVolunteers: { 
//     type: Number, 
//     default: 20 
//   },
//   startDate: { 
//     type: Date 
//   },
//   endDate: { 
//     type: Date 
//   },
//   // CHANGED: renamed residentId to user to match your .populate('volunteers.user') call
//   volunteers: [{
//     user: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: 'User', 
//       required: true 
//     },
//     status: { 
//       type: String, 
//       enum: ['pending', 'approved', 'rejected'], 
//       default: 'pending' 
//     },
//     appliedAt: { 
//       type: Date, 
//       default: Date.now 
//     }
//   }],
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Program', programSchema);



const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  organization: { 
    type: String, 
    default: 'SWM Admin' 
  },
  description: { 
    type: String 
  },
  zone: { 
    type: String 
  },
  location: {
    type: String,
    default: 'Kathmandu'
  },
  rewardCoins: { 
    type: Number, 
    default: 100 
  },
  maxVolunteers: { 
    type: Number, 
    default: 20 
  },
  currentVolunteers: {
    type: Number,
    default: 0
  },
  startDate: { 
    type: Date 
  },
  endDate: { 
    type: Date 
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  volunteers: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    appliedAt: { 
      type: Date, 
      default: Date.now 
    },
    approvedAt: Date,
    rejectedAt: Date
  }],
  requirements: [String],
  benefits: [String],
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String]
}, { timestamps: true });

// Update currentVolunteers count when volunteers are approved
programSchema.pre('save', function(next) {
  if (this.volunteers) {
    this.currentVolunteers = this.volunteers.filter(v => v.status === 'approved').length;
  }
  
  // Update status based on dates
  const now = new Date();
  if (this.startDate && this.startDate > now) {
    this.status = 'upcoming';
  } else if (this.endDate && this.endDate < now) {
    this.status = 'completed';
  } else if (this.startDate <= now && (!this.endDate || this.endDate >= now)) {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Program', programSchema);
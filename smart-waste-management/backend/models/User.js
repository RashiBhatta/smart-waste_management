// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true, select: false }, // select: false hides it from normal queries
//   phone: { type: String },
//   role: { 
//     type: String, 
//     enum: ['resident', 'collector', 'admin'], 
//     default: 'resident' 
//   },
//   address: {
//     zone: { type: String },
//     street: { type: String }
//   },
//   coins: { type: Number, default: 0 },
//   monthlyFeePaid: { type: Boolean, default: false },
//   isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// // ==========================================
// // 1. Method to check password during Login
// // ==========================================
// UserSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // ==========================================
// // 2. Hook to hash password before Saving/Registering
// // ==========================================
// UserSchema.pre('save', async function(next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified('password')) {
//     return next();
//   }

//   // Generate salt and hash
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// module.exports = mongoose.model('User', UserSchema);




const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['resident', 'collector', 'admin'], 
    default: 'resident' 
  },
  address: {
    zone: { type: String },
    street: { type: String },
    city: { type: String, default: 'Kathmandu' }
  },
  // Coin System
  coins: { type: Number, default: 0 },
  totalCoinsEarned: { type: Number, default: 0 },
  
  // Free Service Tracking
  freeServiceMonths: { type: Number, default: 0 },
  freeServiceUntil: { type: Date },
  isServiceFree: { type: Boolean, default: false },
  
  // Payment System
  monthlyFeePaid: { type: Boolean, default: false },
  lastPaymentDate: { type: Date },
  nextPaymentDue: { type: Date },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending', 'free'], 
    default: 'pending' 
  },
  
  // For collectors
  assignedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Profile
  avatar: { type: String },
  joinedPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }]
}, { timestamps: true });

// ==========================================
// 1. Method to check password during Login
// ==========================================
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ==========================================
// 2. Hook to hash password before Saving/Registering
// ==========================================
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ==========================================
// 3. Method to add coins and check for free service
// ==========================================
UserSchema.methods.addCoins = async function(amount, source) {
  this.coins += amount;
  this.totalCoinsEarned += amount;
  
  // Check if reached 1000 coins for free service
  if (this.totalCoinsEarned >= 1000 && !this.isServiceFree) {
    this.freeServiceMonths = 1;
    this.freeServiceUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.isServiceFree = true;
    this.paymentStatus = 'free';
    this.monthlyFeePaid = true;
    
    // Deduct coins for free service (optional - you can keep or deduct)
    // this.coins -= 1000;
  }
  
  await this.save();
  return this.coins;
};

// ==========================================
// 4. Method to check if service is free
// ==========================================
UserSchema.methods.checkFreeService = function() {
  if (this.freeServiceUntil && this.freeServiceUntil > new Date()) {
    return true;
  }
  // Reset if expired
  if (this.isServiceFree && this.freeServiceUntil <= new Date()) {
    this.isServiceFree = false;
    this.freeServiceMonths = 0;
    this.paymentStatus = 'pending';
    this.save();
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema);
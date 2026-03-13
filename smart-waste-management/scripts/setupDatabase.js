const mongoose = require('mongoose');
const VolunteerRequest = require('../models/VolunteerRequest');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

const setupDatabase = async () => {
  try {
    // Ensure indexes
    await VolunteerRequest.createIndexes();
    await Notification.createIndexes();
    await Payment.createIndexes();
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup error:', error);
  }
};

module.exports = setupDatabase;
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['collection', 'user', 'program', 'financial', 'collector', 'all'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    start: Date,
    end: Date
  },
  filters: {
    zone: String,
    status: String,
    wasteType: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  summary: {
    type: mongoose.Schema.Types.Mixed
  },
  charts: {
    type: mongoose.Schema.Types.Mixed
  },
  pdfPath: String,
  excelPath: String,
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },
  scheduled: {
    isScheduled: { type: Boolean, default: false },
    frequency: String,
    nextRun: Date,
    recipients: [String]
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
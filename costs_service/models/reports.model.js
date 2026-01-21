// Monthly report model - stores pre-computed report data for performance
// Computed: This model implements caching for historical monthly reports
// Reports for past months are pre-computed and stored to avoid recalculating
// the same data on every request, significantly improving response times
// for historical data queries
const mongoose = require('mongoose');

// Cached monthly report schema
const monthlyReportSchema = new mongoose.Schema({
  userid: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  report: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'reports'
});

// Create compound index for efficient lookups
monthlyReportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

// Export model
const Reports = mongoose.model('Reports', monthlyReportSchema);

module.exports = Reports;

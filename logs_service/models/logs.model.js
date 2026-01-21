// Logging model - defines structure for application logs
const mongoose = require('mongoose');

// Application log schema
const applicationLogSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  msg: {
    type: String,
    required: true
  },
  method: {
    type: String
  },
  url: {
    type: String
  },
  statusCode: {
    type: Number
  }
}, {
  collection: 'logs',
  timestamps: false
});

// Export model
const Logs = mongoose.model('Logs', applicationLogSchema);

module.exports = Logs;

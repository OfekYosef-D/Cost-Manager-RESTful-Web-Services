// Log model - stores application logging data
const mongoose = require('mongoose');

// Log record schema definition
const logRecordSchema = new mongoose.Schema({
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
const Logs = mongoose.model('Logs', logRecordSchema);

module.exports = Logs;

// Log entry model - stores application log records
const mongoose = require('mongoose');

// Application log schema definition
const logEntrySchema = new mongoose.Schema({
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
const Logs = mongoose.model('Logs', logEntrySchema);

module.exports = Logs;

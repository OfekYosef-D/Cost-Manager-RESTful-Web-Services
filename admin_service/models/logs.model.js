// Log model - schema for storing log entries
const mongoose = require('mongoose');

// Log entry schema definition
const logSchema = new mongoose.Schema({
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
const Logs = mongoose.model('Logs', logSchema);

module.exports = Logs;

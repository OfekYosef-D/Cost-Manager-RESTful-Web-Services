// Cost entry model - defines schema for expense tracking
const mongoose = require('mongoose');

// Expense entry schema definition
const costEntrySchema = new mongoose.Schema({
  userid: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'health', 'housing', 'sports', 'education']
  },
  description: {
    type: String,
    required: true
  },
  sum: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'costs'
});

// Export model
const Costs = mongoose.model('Costs', costEntrySchema);

module.exports = Costs;

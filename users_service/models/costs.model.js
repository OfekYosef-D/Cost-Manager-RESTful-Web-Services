// Cost model - used for aggregation queries in users service
const mongoose = require('mongoose');

// Cost entry schema (reference to costs collection)
const costReferenceSchema = new mongoose.Schema({
  userid: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
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
const Costs = mongoose.model('Costs', costReferenceSchema);

module.exports = Costs;

// User model - defines schema for user profile data
const mongoose = require('mongoose');

// User profile schema definition
const userProfileSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  }
}, {
  collection: 'users'
});

// Export model
const Users = mongoose.model('Users', userProfileSchema);

module.exports = Users;

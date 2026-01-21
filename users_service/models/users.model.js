// User profile model - defines user data structure
const mongoose = require('mongoose');

// User information schema
const userInfoSchema = new mongoose.Schema({
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
const Users = mongoose.model('Users', userInfoSchema);

module.exports = Users;

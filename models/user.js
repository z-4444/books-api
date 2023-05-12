const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['admin', 'user'], default: 'user' },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  status: { type: String, enum: ['active', 'blocked'], default: 'active' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

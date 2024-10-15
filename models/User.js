// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superAdmin', 'vendor', 'collector', 'customer'], required: true },
  isActive: { type: Boolean, default: false },  // Account activation status
});

module.exports = mongoose.model('User', userSchema);

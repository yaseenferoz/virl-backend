// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sampleRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SampleRequest', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }, // To track read/unread status
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);

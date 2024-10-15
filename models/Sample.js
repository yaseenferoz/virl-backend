// models/Sample.js
const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' }
});

module.exports = mongoose.model('Sample', sampleSchema);

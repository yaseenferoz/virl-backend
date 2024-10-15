// models/TestType.js
const mongoose = require('mongoose');

const testTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }
});

module.exports = mongoose.model('TestType', testTypeSchema);

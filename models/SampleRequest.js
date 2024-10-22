// models/SampleRequest.js
const mongoose = require('mongoose');

// models/SampleRequest.js
const sampleRequestSchema = new mongoose.Schema({
    sampleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
    testTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestType', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for waiting status
    status: { type: String, enum: ['Submitted', 'Collected', 'Sample Received', 'Sample in Test', 'Sample Tested', 'Sample Delivered'], default: 'Submitted' },
    submittedAt: { type: Date, default: Date.now },
    reportPath: { type: String } // Path to the generated report file
  });
  

module.exports = mongoose.model('SampleRequest', sampleRequestSchema);

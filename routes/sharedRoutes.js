// routes/sharedRoutes.js
const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const Sample = require('../models/Sample');
const TestType = require('../models/TestType');

const router = express.Router();

// Route to get the list of available samples
router.get('/samples', authenticateToken, async (req, res) => {
  try {
    const samples = await Sample.find({ status: 'Available' });
    res.status(200).json({ samples });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to get all test types (accessible to all authenticated users)
router.get('/test-types', authenticateToken, async (req, res) => {
    try {
      const testTypes = await TestType.find({});
      res.status(200).json({ testTypes });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;

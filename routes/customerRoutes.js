// routes/customerRoutes.js
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const SampleRequest = require('../models/SampleRequest'); // Make sure the model exists and is correctly referenced

const router = express.Router(); // Initialize router
const Notification = require('../models/Notification'); // Add this import
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('../models/User');


// Route for customers to submit a sample for testing
router.post('/submit-sample', authenticateToken, authorizeRole('customer'), async (req, res) => {
  const { sampleId, testTypeId } = req.body;

  try {
    const newSampleRequest = new SampleRequest({
      sampleId,
      testTypeId,
      customerId: req.user.userId, // Ties the sample request to the customer
      status: 'Submitted', // Initial status for a new request
      submittedAt: new Date()
    });

    const savedRequest = await newSampleRequest.save();
    res.status(201).json({ message: 'Sample submitted successfully', sampleRequest: savedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to get all submitted samples for the customer
router.get('/submitted-tests', authenticateToken, authorizeRole('customer'), async (req, res) => {
    try {
      const sampleRequests = await SampleRequest.find({ customerId: req.user.userId })
        .populate('sampleId', 'type description') // Populate sample type and description
        .populate('testTypeId', 'name'); // Populate test type name
  
      // Format the response to include relevant details
      const formattedRequests = sampleRequests.map((sample) => {
        return {
          sampleRequestId: sample._id,
          sampleType: sample.sampleId.type,
          description: sample.sampleId.description,
          testType: sample.testTypeId.name,
          submissionDate: sample.submittedAt,
          status: sample.status,
        };
      });
  
      res.status(200).json({ submittedTests: formattedRequests });
    } catch (error) {
      console.error('Error fetching submitted tests for customer:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // Route to get the dashboard summary for the customer
router.get('/dashboard', authenticateToken, authorizeRole('customer'), async (req, res) => {
    try {
      // Retrieve all sample requests for the logged-in customer
      const sampleRequests = await SampleRequest.find({ customerId: req.user.userId });
  
      // Count each status type
      const statusCounts = sampleRequests.reduce(
        (counts, sample) => {
          counts[sample.status] = (counts[sample.status] || 0) + 1;
          return counts;
        },
        {
          Submitted: 0,
          Collected: 0,
          "Sample Received": 0,
          "Sample in Test": 0,
          "Sample Tested": 0,
          "Sample Delivered": 0,
        }
      );
  
      res.status(200).json({ statusSummary: statusCounts });
    } catch (error) {
      console.error('Error fetching customer dashboard data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // Route to get recent notifications for the customer
// routes/customerRoutes.js


// Route to get customer profile details
router.get('/profile', authenticateToken, authorizeRole('customer'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email phone'); // Restrict fields if needed
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update customer profile information
router.put('/profile', authenticateToken, authorizeRole('customer'), async (req, res) => {
  const { name, password } = req.body;

  try {
    // Only update the allowed fields (name and password)
    const updates = {};
    if (name) updates.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt); // Hash the new password
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('name email phone');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', profile: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to get all notifications for the customer
router.get('/notifications', authenticateToken, authorizeRole('customer'), async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user.userId })
        .sort({ createdAt: -1 });
  
      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Route to mark a customer's notification as read
router.put('/notifications/:id/read', authenticateToken, authorizeRole('customer'), async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
  
      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router; // Export router

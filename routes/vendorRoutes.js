// routes/vendorRoutes.js
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const SampleRequest = require('../models/SampleRequest'); 
const Sample = require('../models/Sample');
const User = require('../models/User');
const TestType = require('../models/TestType');
const bcrypt = require('bcryptjs'); // For password hashing
const router = express.Router();
  // routes/vendorRoutes.js
  const Notification = require('../models/Notification'); // Add this import

// Route to approve a user (customer or collector)
router.post('/approve-user', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User account approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Decline and delete a user
router.delete('/decline-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Ensure the user ID is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find and delete the user from the database
    const user = await User.findByIdAndDelete(userId);

    // If user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User account declined and deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});
// Route to fetch users awaiting approval (vendor only)
router.get('/users-awaiting-approval', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    // Find users with pending approval (e.g., not yet approved)
    const users = await User.find({ isActive: false, role: { $in: ['customer', 'collector'] } });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users awaiting approval:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update sample availability status

router.put('/update-sample-availability', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    const { sampleId, status } = req.body;
  
    try {
      // Update the sample status (e.g., Available or Unavailable)
      const sample = await Sample.findByIdAndUpdate(sampleId, { status }, { new: true });
      if (!sample) {
        return res.status(404).json({ message: 'Sample not found' });
      }
  
      res.status(200).json({ message: 'Sample availability status updated successfully', sample });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
// Route to create a new sample type
router.post('/create-sample', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    const { type, description } = req.body; // Assume type and description for each sample
  
    try {
      const newSample = new Sample({
        type,
        description,
        status: 'Available' // Indicates that the sample type is available for selection
      });
  
      const savedSample = await newSample.save();
      res.status(201).json({ message: 'Sample type created successfully', sample: savedSample });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Route to delete a sample by sampleId
router.delete('/delete-sample/:sampleId', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    const { sampleId } = req.params;
  
    try {
      const deletedSample = await Sample.findByIdAndDelete(sampleId);
  
      if (!deletedSample) {
        return res.status(404).json({ message: 'Sample not found' });
      }
  
      res.status(200).json({ message: 'Sample deleted successfully', sample: deletedSample });
    } catch (error) {
      console.error('Error deleting sample:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Route to delete a test type by testTypeId
router.delete('/delete-test-type/:testTypeId', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    const { testTypeId } = req.params;
  
    try {
      const deletedTestType = await TestType.findByIdAndDelete(testTypeId);
  
      if (!deletedTestType) {
        return res.status(404).json({ message: 'Test type not found' });
      }
  
      res.status(200).json({ message: 'Test type deleted successfully', testType: deletedTestType });
    } catch (error) {
      console.error('Error deleting test type:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Route to add a new test type
router.post('/add-test-type', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  const { name, description } = req.body;

  try {
    const newTestType = new TestType({
      name,
      description,
    });

    const savedTestType = await newTestType.save();
    res.status(201).json({ message: 'Test type added successfully', testType: savedTestType });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to get all submitted samples
// routes/vendorRoutes.js
router.get('/submitted-samples', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    try {
      const samples = await SampleRequest.find({})
        .populate('sampleId', 'type description')
        .populate('customerId', 'name')
        .populate('collectorId', 'name');
  
      const formattedSamples = samples.map((sample) => {
        return {
          sampleId: sample.sampleId._id,
          sampleType: sample.sampleId.type,
          description: sample.sampleId.description,
          customerName: sample.customerId.name,
          submissionDate: sample.submittedAt,
          status: sample.status,
          collectorName: sample.collectorId ? sample.collectorId.name : "Waiting for Collector"
        };
      });
  
      res.status(200).json({ samples: formattedSamples });
    } catch (error) {
      console.error('Error fetching submitted samples:', error); // Log the detailed error
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  


// Route to update sample status by vendor
// router.put('/update-sample-status', authenticateToken, authorizeRole('vendor'), async (req, res) => {
//     console.log('Update Sample Status route hit');
  
//     const { sampleRequestId, status } = req.body;
//     console.log('Received sampleRequestId:', sampleRequestId);
  
//     const allowedStatuses = ["Sample in Test", "Sample Tested", "Sample Delivered"];
//     if (!allowedStatuses.includes(status)) {
//       console.log('Invalid status provided:', status);
//       return res.status(400).json({ message: 'Invalid status' });
//     }
  
//     try {
//       const sampleRequest = await SampleRequest.findByIdAndUpdate(
//         sampleRequestId,
//         { status },
//         { new: true }
//       );
  
//       if (!sampleRequest) {
//         console.log('Sample request not found for ID:', sampleRequestId);
//         return res.status(404).json({ message: 'Sample request not found' });
//       }
  
//       console.log('Sample status updated successfully:', sampleRequest);
//       res.status(200).json({ message: `Sample status updated to ${status}`, sampleRequest });
//     } catch (error) {
//       console.error('Error updating sample status:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
// Route to get vendor profile details
router.get('/profile', authenticateToken, authorizeRole('vendor'), async (req, res) => {
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
  
  // Route to update vendor profile information
  router.put('/profile', authenticateToken, authorizeRole('vendor'), async (req, res) => {
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
// Route to get the history of all delivered samples
router.get('/delivered-samples-history', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    try {
      // Find all sample requests with the status "Sample Delivered"
      const deliveredSamples = await SampleRequest.find({ status: 'Sample Delivered' })
        .populate('sampleId', 'type description') // Populate sample type and description
        .populate('customerId', 'name email') // Populate customer details
        .populate('collectorId', 'name'); // Populate collector name
  
      // Format the response to include relevant details
      const formattedSamples = deliveredSamples.map((sample) => {
        return {
          sampleRequestId: sample._id,
          sampleType: sample.sampleId.type,
          description: sample.sampleId.description,
          customerName: sample.customerId.name,
          customerEmail: sample.customerId.email,
          collectorName: sample.collectorId ? sample.collectorId.name : "Not Collected",
          submissionDate: sample.submittedAt,
          deliveryDate: sample.updatedAt, // Assuming updatedAt is when it was marked as delivered
        };
      });
  
      res.status(200).json({ deliveredSamplesHistory: formattedSamples });
    } catch (error) {
      console.error('Error fetching delivered samples history:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Route to update sample status by vendor
router.put('/update-sample-status', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  const { sampleRequestId, status } = req.body;
  const allowedStatuses = ["Sample in Test", "Sample Tested", "Sample Delivered"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const sampleRequest = await SampleRequest.findByIdAndUpdate(
      sampleRequestId,
      { status },
      { new: true }
    );

    if (!sampleRequest) {
      return res.status(404).json({ message: 'Sample request not found' });
    }

    // Create a notification for the customer and collector
    const notifications = [
      new Notification({
        userId: sampleRequest.customerId,
        sampleRequestId: sampleRequest._id,
        message: `Your sample status has been updated to ${status}`
      })
    ];

    if (sampleRequest.collectorId) {
      notifications.push(new Notification({
        userId: sampleRequest.collectorId,
        sampleRequestId: sampleRequest._id,
        message: `Sample ${sampleRequest._id} status has been updated to ${status}`
      }));
    }

    await Notification.insertMany(notifications);

    res.status(200).json({ message: `Sample status updated to ${status}`, sampleRequest });
  } catch (error) {
    console.error('Error updating sample status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// routes/vendorRoutes.js

// Route to get all notifications for the vendor
router.get('/notifications', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user.userId })
        .sort({ createdAt: -1 });
  
      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching notifications for vendor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // routes/vendorRoutes.js

// Route to mark a vendor's notification as read
router.put('/notifications/:id/read', authenticateToken, authorizeRole('vendor'), async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
  
      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;

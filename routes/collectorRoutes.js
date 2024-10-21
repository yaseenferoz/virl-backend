// routes/collectorRoutes.js
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const SampleRequest = require('../models/SampleRequest'); // Assuming sample requests are stored in this model
const User = require('../models/User'); // Adjust the path to your User model if needed
const bcrypt = require('bcryptjs'); // For password hashing

const router = express.Router();
// routes/collectorRoutes.js
const Notification = require('../models/Notification'); // Ensure this import is added

// routes/collectorRoutes.js
router.put('/collect-sample', authenticateToken, authorizeRole('collector'), async (req, res) => {
  const { sampleRequestId } = req.body;

  try {
    const sampleRequest = await SampleRequest.findByIdAndUpdate(
      sampleRequestId,
      { status: 'Collected', collectorId: req.user.userId }, // Add collectorId here
      { new: true }
    );

    if (!sampleRequest) {
      return res.status(404).json({ message: 'Sample request not found' });
    }

    res.status(200).json({ message: 'Sample status updated to Collected', sampleRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to mark sample as collected by collector
router.put('/profile', authenticateToken, authorizeRole('collector'), async (req, res) => {
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

// Route to mark sample as delivered to vendor

// Route to mark sample as delivered to vendor
router.put('/deliver-sample', authenticateToken, authorizeRole('collector'), async (req, res) => {
  const { sampleRequestId } = req.body;

  try {
    const sampleRequest = await SampleRequest.findByIdAndUpdate(
      sampleRequestId,
      { status: 'Sample Received', collectorId: req.user.userId },
      { new: true }
    );

    if (!sampleRequest) {
      return res.status(404).json({ message: 'Sample request not found' });
    }

    // Create notifications for vendor and customer
    const notifications = [
      new Notification({
        userId: sampleRequest.customerId,
        sampleRequestId: sampleRequest._id,
        message: `Your sample has been delivered by the collector and received by the vendor`
      }),
      new Notification({
        userId: req.user.userId,
        sampleRequestId: sampleRequest._id,
        message: `Sample ${sampleRequest._id} has been successfully delivered to the vendor`
      })
    ];

    // If the vendor exists in this flow, create a notification for them as well
    if (sampleRequest.vendorId) {
      notifications.push(new Notification({
        userId: sampleRequest.vendorId,
        sampleRequestId: sampleRequest._id,
        message: `Sample ${sampleRequest._id} has been delivered by the collector`
      }));
    }

    await Notification.insertMany(notifications);

    res.status(200).json({ message: 'Sample status updated to Sample Received', sampleRequest });
  } catch (error) {
    console.error('Error updating sample status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/profile', authenticateToken, authorizeRole('collector'), async (req, res) => {
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
router.put('/profile', authenticateToken, authorizeRole('collector'), async (req, res) => {
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
// Route to get all submitted samples awaiting collection
router.get('/samples-to-collect', authenticateToken, authorizeRole('collector'), async (req, res) => {
  try {
    const samplesToCollect = await SampleRequest.find({ status: 'Submitted' })
      .populate('sampleId', 'type description') // Populate sample type and description
      .populate('customerId', 'name'); // Populate customer name

    // Format response with relevant details
    const formattedSamples = samplesToCollect.map((sample) => {
      return {
        sampleRequestId: sample._id,
        sampleType: sample.sampleId.type,
        description: sample.sampleId.description,
        customerName: sample.customerId.name,
        submissionDate: sample.submittedAt,
        status: sample.status,
      };
    });

    res.status(200).json({ samplesToCollect: formattedSamples });
  } catch (error) {
    console.error('Error fetching samples to collect:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to get all collected samples
router.get('/samples-collected', authenticateToken, authorizeRole('collector'), async (req, res) => {
  try {
    const samplesCollected = await SampleRequest.find({ status: 'Collected' })
      .populate('sampleId', 'type description') // Populate sample type and description
      .populate('customerId', 'name'); // Populate customer name

    // Format response with relevant details
    const formattedSamples = samplesCollected.map((sample) => {
      return {
        sampleRequestId: sample._id,
        sampleType: sample.sampleId?.type || 'Unknown',
        description: sample.sampleId?.description || 'No description available',
        customerName: sample.customerId?.name || 'Unknown Customer',
        submissionDate: sample.submittedAt,
        status: sample.status,
      };
    });

    res.status(200).json({ samplesCollected: formattedSamples });
  } catch (error) {
    console.error('Error fetching collected samples:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/// routes/collectorRoutes.js

// Route to get all samples delivered to the vendor by this collector
router.get('/samples-delivered', authenticateToken, authorizeRole('collector'), async (req, res) => {
  try {
    // Fetch samples that were delivered by this collector, regardless of current status
    const samplesDelivered = await SampleRequest.find({ collectorId: req.user.userId, status: { $ne: 'Collected' } })
      .populate('sampleId', 'type description') // Populate sample type and description
      .populate('customerId', 'name'); // Populate customer name

    // Format response with relevant details
    const formattedSamples = samplesDelivered.map((sample) => {
      return {
        sampleRequestId: sample._id,
        sampleType: sample.sampleId?.type || 'Unknown',  // Ensure sampleId exists
        description: sample.sampleId?.description || 'No description available', // Fallback for missing description
        customerName: sample.customerId?.name || 'Unknown Customer', // Handle null customerId gracefully
        submissionDate: sample.submittedAt,
        status: sample.status,
      };
    });

    res.status(200).json({ samplesDelivered: formattedSamples });
  } catch (error) {
    console.error('Error fetching samples delivered to vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// routes/collectorRoutes.js

// Route to get all notifications for the collector
router.get('/notifications', authenticateToken, authorizeRole('collector'), async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications for collector:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// routes/collectorRoutes.js

// Route to mark a collector's notification as read
router.put('/notifications/:id/read', authenticateToken, authorizeRole('collector'), async (req, res) => {
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

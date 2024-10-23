// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully. Awaiting approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Check if the account is active (approved)
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account pending approval' });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET
      );
  
      res.status(200).json({ token, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  // routes/authRoutes.js
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Example of a vendor-only route to approve a customer or collector account
router.post('/approve-user', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  const { userId } = req.body;

  try {
    // Update the user's isActive status to true
    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User account approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

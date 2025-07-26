const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configure multer for ID card uploads - store in memory instead of disk
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  
  cb(new Error('Only image files are allowed!'));
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
router.post('/signup', upload.single('idCard'), async (req, res) => {
  try {
    console.log('Signup request received');
    console.log('Request body:', req.body);
    console.log('File received:', req.file ? {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
    } : 'No file');
    
    const { name, email, password, role = 'student' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // For student role, ID card is required
    if (role === 'student' && !req.file) {
      return res.status(400).json({ message: 'College ID card image is required for student registration' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: ['student', 'admin'].includes(role) ? role : 'student'
    });

    // Handle ID card upload for students
    if (role === 'student' && req.file) {
      user.collegeIdCard = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        uploadedAt: new Date(),
        verified: true // Auto-verify for prototype
      };
      
      // For prototype, automatically verify all accounts
      user.verificationStatus = 'verified';
    } else if (role === 'admin') {
      // Admins don't need verification
      user.verificationStatus = 'verified';
    }

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Create ID card URL if exists
    let idCardUrl = null;
    if (user.collegeIdCard && user.collegeIdCard.data) {
      idCardUrl = `/api/auth/id-card/${user._id}`;
    }

    // Log what we're sending back to client
    console.log('Sending user data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      hasIdCard: idCardUrl ? true : false
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        idCardUrl: idCardUrl
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // For prototype, we're skipping verification checks
    // Automatically update any pending accounts to verified for the prototype
    if (user.verificationStatus === 'pending') {
      user.verificationStatus = 'verified';
      user.collegeIdCard.verified = true;
      await user.save();
    }
    
    // Only reject explicitly rejected accounts
    if (user.role === 'student' && user.verificationStatus === 'rejected') {
      return res.status(403).json({ 
        message: 'Your account verification was rejected. Please contact the administrator.',
        verificationStatus: 'rejected'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Check if ID card exists and create a URL for it
    let idCardUrl = null;
    if (user.collegeIdCard && user.collegeIdCard.data) {
      idCardUrl = `/api/auth/id-card/${user._id}`;
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        idCardUrl: idCardUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
        verificationStatus: req.user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin route to get pending verifications
router.get('/pending-verifications', authenticateToken, async (req, res) => {
  try {
    // Only admins can see pending verifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view pending verifications' });
    }
    
    const pendingUsers = await User.find({
      role: 'student',
      verificationStatus: 'pending'
    }).select('_id name email createdAt');
    
    res.json({ pendingUsers });
  } catch (error) {
    console.error('Pending verifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('idCard'), async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    // If student is uploading a new ID card
    if (req.user.role === 'student' && req.file) {
      updates['collegeIdCard.data'] = req.file.buffer;
      updates['collegeIdCard.contentType'] = req.file.mimetype;
      updates['collegeIdCard.uploadedAt'] = new Date();
      updates['collegeIdCard.verified'] = false;
      updates['verificationStatus'] = 'pending';
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -collegeIdCard.data');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin route to update user verification status
router.put('/verify-student/:userId', authenticateToken, async (req, res) => {
  try {
    // Only admins can verify students
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to verify students' });
    }

    const { status } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }
    
    user.verificationStatus = status;
    if (status === 'verified') {
      user.collegeIdCard.verified = true;
    }
    
    await user.save();
    
    res.json({ 
      message: `Student verification ${status === 'verified' ? 'approved' : 'rejected'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Verification update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more complex setup, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// Get user's ID card image
router.get('/id-card/:userId', authenticateToken, async (req, res) => {
  try {
    // Only admins or the user themselves can view their ID card
    if (req.user.role !== 'admin' && req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ID card' });
    }

    const user = await User.findById(req.params.userId);
    
    if (!user || !user.collegeIdCard || !user.collegeIdCard.data) {
      return res.status(404).json({ message: 'ID card not found' });
    }

    // Set the appropriate headers and send the image data
    res.set('Content-Type', user.collegeIdCard.contentType);
    return res.send(user.collegeIdCard.data);
  } catch (error) {
    console.error('Error retrieving ID card:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
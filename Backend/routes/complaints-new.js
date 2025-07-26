const express = require('express');
const Complaint = require('../models/Complaint');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/complaints');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  }
});

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

// Get all complaints (with filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      category, 
      priority,
      search, 
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    // Students can only see their own complaints, admins can see all
    if (req.user.role !== 'admin') {
      query.submittedBy = req.user._id;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const complaints = await Complaint.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name');

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: complaints.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single complaint by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Students can only view their own complaints, admins can view all
    if (req.user.role !== 'admin' && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new complaint with file upload
router.post('/', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      priority, 
      location, 
      contactInfo 
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: 'Title, description, and category are required' 
      });
    }

    const validCategories = ['Water', 'Electricity', 'Cleaning', 'Maintenance', 'Internet', 'Security', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      priority: priority || 'medium',
      submittedBy: req.user._id,
      submittedByName: req.user.name,
      location,
      contactInfo: {
        email: contactInfo?.email || req.user.email,
        phone: contactInfo?.phone
      }
    });

    // Handle file upload
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const attachmentUrl = `/uploads/complaints/${req.file.filename}`;

      complaint.attachments = [{
        filename: req.file.originalname,
        url: baseUrl + attachmentUrl
      }];
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Update complaint by ID
router.put('/:id', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check permissions: Only allow admin or the complaint creator to update
    if (req.user.role !== 'admin' && complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }
    
    // Admins can update any field, users can update only specific fields
    const allowedUpdates = req.user.role === 'admin' 
      ? ['title', 'description', 'status', 'priority', 'category', 'assignedTo', 'location', 'estimatedResolution'] 
      : ['title', 'description', 'category', 'location'];
    
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    // Handle file upload
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const attachmentUrl = `/uploads/complaints/${req.file.filename}`;

      updates.attachments = [{
        filename: req.file.originalname,
        url: baseUrl + attachmentUrl
      }];
    }
    
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');
    
    res.json({
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Delete complaint by ID
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    await Complaint.findByIdAndDelete(req.params.id);
    
    // Also delete any attached files
    if (complaint.attachments && complaint.attachments.length > 0) {
      for (const attachment of complaint.attachments) {
        const filePath = attachment.url.split('/uploads/')[1];
        if (filePath) {
          const fullPath = path.join(__dirname, '../uploads', filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }
    
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add comment to complaint
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Comment message is required' });
    }
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Only allow admin or the complaint creator to comment
    if (req.user.role !== 'admin' && complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to comment on this complaint' });
    }
    
    complaint.comments.push({
      author: req.user._id,
      authorName: req.user.name,
      message
    });
    
    await complaint.save();
    await complaint.populate('comments.author', 'name email');
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: complaint.comments[complaint.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

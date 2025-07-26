const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/complaints');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
      location
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

    const complaintData = {
      title,
      description,
      category,
      priority: priority || 'medium',
      submittedBy: req.user._id,
      submittedByName: req.user.name,
      location,
      contactInfo: {
        email: req.user.email,
        phone: req.user.phone || null
      }
    };

    // Add attachment if uploaded
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
      const fileUrl = `${baseUrl}/uploads/complaints/${req.file.filename}`;
      
      complaintData.attachments = [{
        filename: req.file.originalname,
        url: fileUrl,
        uploadedAt: new Date()
      }];
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();
    await complaint.populate('submittedBy', 'name email');

    // Create notification for admins
    await Notification.create({
      recipient: null, // null means for all admins
      type: 'complaint_new',
      message: `New complaint: ${title}`,
      relatedModel: 'Complaint',
      relatedId: complaint._id,
      data: {
        complaintId: complaint._id,
        category: complaint.category,
        priority: complaint.priority
      }
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update complaint status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, assignedTo, estimatedResolution, message } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const previousStatus = complaint.status;
    complaint.status = status;
    
    if (assignedTo) {
      complaint.assignedTo = assignedTo;
    }
    
    if (estimatedResolution) {
      complaint.estimatedResolution = new Date(estimatedResolution);
    }

    // Add admin comment if message is provided
    if (message) {
      complaint.comments.push({
        author: req.user._id,
        authorName: req.user.name,
        message: message
      });
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('assignedTo', 'name email');

    // Create notification for the student who submitted the complaint
    await Notification.create({
      recipient: complaint.submittedBy._id,
      type: 'complaint_status_update',
      message: `Your complaint "${complaint.title}" has been updated to ${status}`,
      relatedModel: 'Complaint',
      relatedId: complaint._id,
      data: {
        complaintId: complaint._id,
        previousStatus,
        newStatus: status,
        message: message || null
      }
    });

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
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

    // Students can only comment on their own complaints, admins can comment on any
    if (req.user.role !== 'admin' && complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = {
      author: req.user._id,
      authorName: req.user.name,
      message
    };

    complaint.comments.push(comment);
    await complaint.save();

    // Create notification for the student or admin
    const recipient = req.user.role === 'admin' 
      ? complaint.submittedBy // Notify student if admin commented
      : null; // Notify admins if student commented
    
    await Notification.create({
      recipient,
      type: 'complaint_comment',
      message: `New comment on complaint "${complaint.title}"`,
      relatedModel: 'Complaint',
      relatedId: complaint._id,
      data: {
        complaintId: complaint._id,
        commentId: complaint.comments[complaint.comments.length - 1]._id,
        comment: message
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...comment,
        _id: complaint.comments[complaint.comments.length - 1]._id,
        createdAt: complaint.comments[complaint.comments.length - 1].createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get complaints summary/stats (admin only)
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Resolution time stats (average days to resolve)
    const resolutionTimeStats = await Complaint.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $ne: null } } },
      { $project: {
          resolutionTimeMs: { $subtract: ['$resolvedAt', '$createdAt'] }
      }},
      { $group: {
          _id: null,
          averageMs: { $avg: '$resolutionTimeMs' },
          minMs: { $min: '$resolutionTimeMs' },
          maxMs: { $max: '$resolutionTimeMs' }
      }}
    ]);
    
    // Get daily new complaints for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyComplaints = await Complaint.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints
      },
      categoryDistribution: categoryStats,
      priorityDistribution: priorityStats,
      resolutionTimes: resolutionTimeStats.length > 0 ? {
        averageDays: resolutionTimeStats[0].averageMs / (1000 * 60 * 60 * 24),
        minDays: resolutionTimeStats[0].minMs / (1000 * 60 * 60 * 24),
        maxDays: resolutionTimeStats[0].maxMs / (1000 * 60 * 60 * 24)
      } : null,
      dailyComplaints
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve uploaded files (make public with authentication)
router.get('/uploads/:filename', authenticateToken, (req, res) => {
  const filePath = path.join(__dirname, '../uploads/complaints', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});

module.exports = router;

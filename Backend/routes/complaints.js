const express = require('express');
const Complaint = require('../models/Complaint');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

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

// Create new complaint
router.post('/', authenticateToken, async (req, res) => {
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

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');

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
    const { status, assignedTo, estimatedResolution } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    complaint.status = status;
    
    if (assignedTo) {
      complaint.assignedTo = assignedTo;
    }
    
    if (estimatedResolution) {
      complaint.estimatedResolution = new Date(estimatedResolution);
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('assignedTo', 'name email');

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

// Update complaint (by submitter only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only the submitter can update their complaint (and only if not resolved)
    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own complaints' });
    }

    if (complaint.status === 'resolved') {
      return res.status(400).json({ message: 'Cannot update resolved complaints' });
    }

    const { title, description, location, contactInfo } = req.body;

    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (location !== undefined) complaint.location = location;
    if (contactInfo) {
      complaint.contactInfo = {
        email: contactInfo.email || complaint.contactInfo.email,
        phone: contactInfo.phone
      };
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete complaint (by submitter or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only submitter or admin can delete
    if (complaint.submittedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get complaint statistics (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
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
      { $sort: { count: -1 } }
    ]);

    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('submittedBy', 'name')
      .select('title category status priority createdAt submittedBy');

    // Average resolution time
    const resolvedComplaintsWithTime = await Complaint.find({ 
      status: 'resolved',
      resolvedAt: { $exists: true }
    }).select('createdAt resolvedAt');

    let avgResolutionTime = 0;
    if (resolvedComplaintsWithTime.length > 0) {
      const totalTime = resolvedComplaintsWithTime.reduce((sum, complaint) => {
        return sum + (complaint.resolvedAt - complaint.createdAt);
      }, 0);
      avgResolutionTime = Math.round(totalTime / resolvedComplaintsWithTime.length / (1000 * 60 * 60 * 24)); // in days
    }

    res.json({
      stats: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        avgResolutionTime
      },
      categoryStats,
      priorityStats,
      recentComplaints
    });
  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
module.exports = router;
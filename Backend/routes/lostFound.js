const express = require('express');
const LostFoundItem = require('../models/LostFoundItem');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all lost and found items
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      type, 
      category, 
      search, 
      status = 'active',
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { status };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category && category !== 'all') {
      query.category = category;
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

    const items = await LostFoundItem.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('reportedBy', 'name email');

    const total = await LostFoundItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: items.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get lost found items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single item by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id)
      .populate('reportedBy', 'name email role');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get lost found item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new lost/found item report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      type, 
      location, 
      contactEmail, 
      contactPhone, 
      image 
    } = req.body;

    if (!title || !description || !category || !type || !location) {
      return res.status(400).json({ 
        message: 'Title, description, category, type, and location are required' 
      });
    }

    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "lost" or "found"' });
    }

    const validCategories = ['Electronics', 'Clothing', 'Accessories', 'Books', 'Sports Equipment', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const item = new LostFoundItem({
      title,
      description,
      category,
      type,
      location,
      reportedBy: req.user._id,
      reportedByName: req.user.name,
      contactEmail: contactEmail || req.user.email,
      contactPhone,
      image
    });

    await item.save();
    await item.populate('reportedBy', 'name email');

    res.status(201).json({
      message: 'Item reported successfully',
      item
    });
  } catch (error) {
    console.error('Create lost found item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update item (only by reporter or admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    const { 
      title, 
      description, 
      category, 
      location, 
      contactEmail, 
      contactPhone, 
      image,
      status 
    } = req.body;

    // Update allowed fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (location) item.location = location;
    if (contactEmail) item.contactEmail = contactEmail;
    if (contactPhone !== undefined) item.contactPhone = contactPhone;
    if (image !== undefined) item.image = image;
    
    // Only admin can change status
    if (status && req.user.role === 'admin') {
      item.status = status;
      if (status === 'resolved') {
        item.resolvedAt = new Date();
      }
    }

    await item.save();
    await item.populate('reportedBy', 'name email');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update lost found item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete item (only by reporter or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }

    await LostFoundItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete lost found item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark item as resolved
router.patch('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the reporter or admin
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only resolve your own reports' });
    }

    item.status = 'resolved';
    item.resolvedAt = new Date();
    await item.save();

    res.json({
      message: 'Item marked as resolved',
      item
    });
  } catch (error) {
    console.error('Resolve item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's own items
router.get('/user/my-items', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 20, page = 1 } = req.query;
    
    const query = { reportedBy: req.user._id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const items = await LostFoundItem.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await LostFoundItem.countDocuments(query);

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: items.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get statistics (for admin dashboard)
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalItems = await LostFoundItem.countDocuments();
    const activeItems = await LostFoundItem.countDocuments({ status: 'active' });
    const resolvedItems = await LostFoundItem.countDocuments({ status: 'resolved' });
    const lostItems = await LostFoundItem.countDocuments({ type: 'lost', status: 'active' });
    const foundItems = await LostFoundItem.countDocuments({ type: 'found', status: 'active' });

    const categoryStats = await LostFoundItem.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentItems = await LostFoundItem.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'name')
      .select('title type category location createdAt reportedBy');

    res.json({
      stats: {
        total: totalItems,
        active: activeItems,
        resolved: resolvedItems,
        lost: lostItems,
        found: foundItems
      },
      categoryStats,
      recentItems
    });
  } catch (error) {
    console.error('Get lost found stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
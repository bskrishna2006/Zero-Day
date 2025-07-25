const express = require('express');
const Announcement = require('../models/Announcement');
const ReadAnnouncement = require('../models/ReadAnnouncement');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all announcements (public, with optional auth for personalization)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, channel, search, limit = 20, page = 1 } = req.query;
    
    const query = { expiresAt: { $gt: new Date() } }; // Only non-expired announcements
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (channel && channel !== 'all') {
      query.channel = channel;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'name email role');

    // If user is authenticated, get read status
    if (req.user) {
      const readAnnouncementIds = await ReadAnnouncement.find({
        userId: req.user.id,
        announcementId: { $in: announcements.map(a => a._id) }
      }).distinct('announcementId');
      
      // Convert ObjectIds to strings for easier comparison
      const readIds = readAnnouncementIds.map(id => id.toString());
      
      // Add isRead property to each announcement
      announcements.forEach(announcement => {
        announcement._doc.isRead = readIds.includes(announcement._id.toString());
      });
    }

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: announcements.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single announcement by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Increment view count
    announcement.views += 1;
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark announcement as read (authenticated users only)
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Increment view count
    announcement.views = (announcement.views || 0) + 1;
    await announcement.save();
    
    // Mark as read for this user
    await ReadAnnouncement.findOneAndUpdate(
      { 
        userId: req.user.id, 
        announcementId: req.params.id 
      },
      { 
        userId: req.user.id, 
        announcementId: req.params.id,
        readAt: new Date() 
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new announcement (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, channel, isPinned, priority, expiresAt } = req.body;

    if (!title || !description || !category || !channel) {
      return res.status(400).json({ message: 'Title, description, category, and channel are required' });
    }

    const announcement = new Announcement({
      title,
      description,
      category,
      channel,
      createdBy: req.user._id,
      createdByName: req.user.name,
      isPinned: isPinned || false,
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update announcement (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, channel, isPinned, priority, expiresAt } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Update fields
    if (title) announcement.title = title;
    if (description) announcement.description = description;
    if (category) announcement.category = category;
    if (channel) announcement.channel = channel;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    if (priority) announcement.priority = priority;
    if (expiresAt) announcement.expiresAt = new Date(expiresAt);

    await announcement.save();
    await announcement.populate('createdBy', 'name email role');

    res.json({
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle pin status (admin only)
router.patch('/:id/pin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.json({
      message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: announcement.isPinned
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get announcement statistics (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ 
      expiresAt: { $gt: new Date() } 
    });
    const pinnedAnnouncements = await Announcement.countDocuments({ 
      isPinned: true,
      expiresAt: { $gt: new Date() } 
    });

    const categoryStats = await Announcement.aggregate([
      { $match: { expiresAt: { $gt: new Date() } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentActivity = await Announcement.find({ expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .select('title category createdAt createdBy views');

    res.json({
      stats: {
        total: totalAnnouncements,
        active: activeAnnouncements,
        pinned: pinnedAnnouncements
      },
      categoryStats,
      recentActivity
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
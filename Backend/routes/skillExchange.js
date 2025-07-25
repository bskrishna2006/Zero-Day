const express = require('express');
const PeerTeacher = require('../models/PeerTeacher');
const ContactRequest = require('../models/ContactRequest');
const LearningSession = require('../models/LearningSession');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all peer teachers
router.get('/teachers', optionalAuth, async (req, res) => {
  try {
    const { 
      skill, 
      type, 
      search, 
      isActive = true,
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { isActive };
    
    if (skill && skill !== 'all') {
      query.skills = { $regex: skill, $options: 'i' };
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const teachers = await PeerTeacher.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('addedBy', 'name email')
      .populate('verifiedBy', 'name');

    const total = await PeerTeacher.countDocuments(query);

    res.json({
      teachers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: teachers.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get peer teachers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single peer teacher by ID
router.get('/teachers/:id', optionalAuth, async (req, res) => {
  try {
    const teacher = await PeerTeacher.findById(req.params.id)
      .populate('addedBy', 'name email role')
      .populate('verifiedBy', 'name');

    if (!teacher) {
      return res.status(404).json({ message: 'Peer teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Get peer teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new peer teacher
router.post('/teachers', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      linkedinUrl, 
      skills, 
      type, 
      availability, 
      bio 
    } = req.body;

    if (!name || !email || !skills || !type || !availability) {
      return res.status(400).json({ 
        message: 'Name, email, skills, type, and availability are required' 
      });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required' });
    }

    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({ message: 'At least one availability slot is required' });
    }

    if (!['peer', 'senior'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "peer" or "senior"' });
    }

    // Check if teacher with same email already exists
    const existingTeacher = await PeerTeacher.findOne({ email, isActive: true });
    if (existingTeacher) {
      return res.status(400).json({ message: 'A teacher with this email already exists' });
    }

    const teacher = new PeerTeacher({
      name,
      email,
      phone,
      linkedinUrl,
      skills,
      type,
      availability,
      bio: bio || '',
      addedBy: req.user._id,
      isVerified: req.user.role === 'admin' // Auto-verify if added by admin
    });

    if (req.user.role === 'admin') {
      teacher.verifiedBy = req.user._id;
      teacher.verifiedAt = new Date();
    }

    await teacher.save();
    await teacher.populate('addedBy', 'name email');

    res.status(201).json({
      message: 'Peer teacher added successfully',
      teacher
    });
  } catch (error) {
    console.error('Create peer teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update peer teacher (by creator or admin)
router.put('/teachers/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await PeerTeacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Peer teacher not found' });
    }

    // Check if user can update (creator or admin)
    if (teacher.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update teachers you added' });
    }

    const { 
      name, 
      email, 
      phone, 
      linkedinUrl, 
      skills, 
      type, 
      availability, 
      bio,
      isActive 
    } = req.body;

    // Update fields
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phone !== undefined) teacher.phone = phone;
    if (linkedinUrl !== undefined) teacher.linkedinUrl = linkedinUrl;
    if (skills && Array.isArray(skills)) teacher.skills = skills;
    if (type) teacher.type = type;
    if (availability && Array.isArray(availability)) teacher.availability = availability;
    if (bio !== undefined) teacher.bio = bio;
    
    // Only admin can change active status
    if (isActive !== undefined && req.user.role === 'admin') {
      teacher.isActive = isActive;
    }

    await teacher.save();
    await teacher.populate('addedBy', 'name email');

    res.json({
      message: 'Peer teacher updated successfully',
      teacher
    });
  } catch (error) {
    console.error('Update peer teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete peer teacher (by creator or admin)
router.delete('/teachers/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await PeerTeacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Peer teacher not found' });
    }

    // Check if user can delete (creator or admin)
    if (teacher.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete teachers you added' });
    }

    await PeerTeacher.findByIdAndDelete(req.params.id);

    res.json({ message: 'Peer teacher deleted successfully' });
  } catch (error) {
    console.error('Delete peer teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify peer teacher (admin only)
router.patch('/teachers/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const teacher = await PeerTeacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Peer teacher not found' });
    }

    teacher.isVerified = true;
    teacher.verifiedBy = req.user._id;
    teacher.verifiedAt = new Date();

    await teacher.save();
    await teacher.populate('verifiedBy', 'name');

    res.json({
      message: 'Peer teacher verified successfully',
      teacher
    });
  } catch (error) {
    console.error('Verify peer teacher error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all contact requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      teacherId,
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    // Students see requests they made, admins see all
    if (req.user.role !== 'admin') {
      query.requesterId = req.user._id;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const requests = await ContactRequest.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('teacherId', 'name email skills type')
      .populate('requesterId', 'name email');

    const total = await ContactRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: requests.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get contact requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new contact request
router.post('/requests', authenticateToken, async (req, res) => {
  try {
    const { 
      teacherId, 
      skill, 
      message, 
      preferredTime,
      requesterName,
      requesterEmail
    } = req.body;

    if (!teacherId || !skill || !message || !requesterName || !requesterEmail) {
      return res.status(400).json({ 
        message: 'Teacher ID, skill, message, requester name, and email are required' 
      });
    }

    // Verify teacher exists
    const teacher = await PeerTeacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Peer teacher not found' });
    }

    if (!teacher.isActive) {
      return res.status(400).json({ message: 'This teacher is not currently active' });
    }

    // Check if skill is offered by teacher
    if (!teacher.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
      return res.status(400).json({ message: 'Teacher does not offer this skill' });
    }

    const request = new ContactRequest({
      teacherId,
      teacherName: teacher.name,
      requesterName,
      requesterEmail,
      requesterId: req.user._id,
      skill,
      message,
      preferredTime: preferredTime || 'Flexible'
    });

    await request.save();
    await request.populate('teacherId', 'name email skills type');

    res.status(201).json({
      message: 'Contact request sent successfully',
      request
    });
  } catch (error) {
    console.error('Create contact request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update contact request status (by teacher or admin)
router.patch('/requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, responseMessage, sessionDate } = req.body;

    const request = await ContactRequest.findById(req.params.id)
      .populate('teacherId', 'addedBy');

    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    // Check if user can update status (teacher who owns the profile or admin)
    const canUpdate = req.user.role === 'admin' || 
                     request.teacherId.addedBy.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validStatuses = ['pending', 'accepted', 'declined', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    request.status = status;
    if (responseMessage) request.responseMessage = responseMessage;
    if (sessionDate) request.sessionDate = new Date(sessionDate);

    await request.save();
    await request.populate('teacherId', 'name email skills type');

    res.json({
      message: 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add rating and feedback (by requester)
router.patch('/requests/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const request = await ContactRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    // Only requester can add feedback
    if (request.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only rate your own requests' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed sessions' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    request.rating = rating;
    if (feedback) request.feedback = feedback;

    await request.save();

    // Update teacher's rating
    const teacher = await PeerTeacher.findById(request.teacherId);
    if (teacher) {
      await teacher.updateRating(rating);
      teacher.totalSessions += 1;
      await teacher.save();
    }

    res.json({
      message: 'Feedback submitted successfully',
      request
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get skill exchange statistics (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalTeachers = await PeerTeacher.countDocuments();
    const activeTeachers = await PeerTeacher.countDocuments({ isActive: true });
    const verifiedTeachers = await PeerTeacher.countDocuments({ isVerified: true });
    const peerTeachers = await PeerTeacher.countDocuments({ type: 'peer', isActive: true });
    const seniorMentors = await PeerTeacher.countDocuments({ type: 'senior', isActive: true });

    const totalRequests = await ContactRequest.countDocuments();
    const pendingRequests = await ContactRequest.countDocuments({ status: 'pending' });
    const completedSessions = await ContactRequest.countDocuments({ status: 'completed' });

    const skillStats = await PeerTeacher.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const recentRequests = await ContactRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('teacherId', 'name')
      .select('skill teacherName requesterName status createdAt');

    const avgRating = await PeerTeacher.aggregate([
      { $match: { isActive: true, rating: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      stats: {
        totalTeachers,
        activeTeachers,
        verifiedTeachers,
        peerTeachers,
        seniorMentors,
        totalRequests,
        pendingRequests,
        completedSessions,
        avgRating: avgRating[0]?.avgRating || 0
      },
      skillStats,
      recentRequests
    });
  } catch (error) {
    console.error('Get skill exchange stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
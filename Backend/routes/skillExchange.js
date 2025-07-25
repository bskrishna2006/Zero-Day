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
      sortOrder = 'desc',
      role = 'student' // can be 'student' or 'teacher' to filter requests
    } = req.query;
    
    let query = {};
    
    // Admin sees all requests
    if (req.user.role === 'admin') {
      // No filtering needed - can see everything
    } 
    // For students, show requests they made
    else if (role === 'student') {
      query.requesterId = req.user._id;
    } 
    else if (role === 'teacher') {
      // Find all teacher profiles owned by this user
      const teacherProfiles = await PeerTeacher.find({ addedBy: req.user._id }).select('_id');
      const teacherIds = teacherProfiles.map(profile => profile._id);
      
      if (teacherIds.length === 0) {
        // No teacher profiles found, return empty result
        return res.json({
          requests: [],
          pagination: {
            current: parseInt(page),
            total: 0,
            count: 0,
            totalCount: 0
          }
        });
      }
      query.teacherId = { $in: teacherIds };
    }
    else {
      // Default to student view
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

// Get a specific contact request by ID
router.get('/requests/:id', authenticateToken, async (req, res) => {
  try {
    const request = await ContactRequest.findById(req.params.id)
      .populate('teacherId', 'name email skills type availability linkedinUrl bio')
      .populate('requesterId', 'name email');
      
    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }
    
    // Check permissions - only allow if user is admin, requester, or teacher
    const isRequester = request.requesterId && 
      request.requesterId._id.toString() === req.user._id.toString();
    
    const isTeacher = request.teacherId && await PeerTeacher.exists({ 
      _id: request.teacherId._id, 
      addedBy: req.user._id 
    });
    
    if (!isRequester && !isTeacher && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ request });
  } catch (error) {
    console.error('Get contact request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get requests for a specific teacher profile
router.get('/teachers/:teacherId/requests', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { 
      status, 
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Verify teacher exists
    const teacher = await PeerTeacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Peer teacher not found' });
    }
    
    // Check permissions - only allow if user is admin or owns the teacher profile
    const isOwner = teacher.addedBy && teacher.addedBy.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = { teacherId: teacherId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const requests = await ContactRequest.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
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
    console.error('Get teacher requests error:', error);
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
    await request.populate('teacherId', 'name email skills type addedBy');

    // Create notification for the teacher/teacher owner
    if (request.teacherId && request.teacherId.addedBy) {
      const notification = new Notification({
        recipient: request.teacherId.addedBy,
        sender: req.user._id,
        title: 'New Learning Request',
        message: `${requesterName} has requested to learn ${skill} with you. Please review and respond to this request.`,
        type: 'contact_request',
        relatedModel: 'ContactRequest',
        relatedId: request._id,
        priority: 'normal',
        link: `/skill-exchange/teacher/requests/${request._id}`
      });
      
      await notification.save();
    }

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
    const { status, responseMessage, sessionDate, sessionDuration } = req.body;

    const request = await ContactRequest.findById(req.params.id)
      .populate('teacherId', 'addedBy name')
      .populate('requesterId', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }

    // Check if user can update status (teacher who owns the profile or admin)
    const canUpdate = req.user.role === 'admin' || 
                     request.teacherId.addedBy?.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validStatuses = ['pending', 'accepted', 'declined', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Validate session date when accepting
    if (status === 'accepted') {
      if (!sessionDate) {
        return res.status(400).json({ message: 'Session date is required when accepting a request' });
      }
      const proposedDate = new Date(sessionDate);
      if (isNaN(proposedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid session date format' });
      }
      
      // Ensure session date is in the future
      if (proposedDate < new Date()) {
        return res.status(400).json({ message: 'Session date must be in the future' });
      }
    }

    request.status = status;
    if (responseMessage) request.responseMessage = responseMessage;
    if (sessionDate) request.sessionDate = new Date(sessionDate);
    if (sessionDuration) request.sessionDuration = sessionDuration;

    await request.save();
    
    // Create notification for the requester
    if (request.requesterId) {
      const notificationTitle = status === 'accepted' 
        ? 'Your learning request was accepted!'
        : status === 'declined'
        ? 'Your learning request was declined'
        : 'Your learning request was updated';
        
      const notificationMessage = status === 'accepted' 
        ? `${request.teacherName} has accepted your request to learn ${request.skill}. Your session is scheduled for ${new Date(request.sessionDate).toLocaleString()}.`
        : status === 'declined'
        ? `${request.teacherName} has declined your request to learn ${request.skill}.${request.responseMessage ? ' Message: ' + request.responseMessage : ''}`
        : `The status of your request to learn ${request.skill} with ${request.teacherName} has been updated to ${status}.`;
      
      const notification = new Notification({
        recipient: request.requesterId,
        sender: req.user._id,
        title: notificationTitle,
        message: notificationMessage,
        type: 'contact_response',
        relatedModel: 'ContactRequest',
        relatedId: request._id,
        priority: status === 'accepted' ? 'high' : 'normal',
        link: `/skill-exchange/requests/${request._id}`
      });
      
      await notification.save();
    }
    
    // If accepted, create a learning session
    if (status === 'accepted') {
      // Check if a learning session already exists
      const existingSession = await LearningSession.findOne({ contactRequestId: request._id });
      
      if (!existingSession) {
        const learningSession = new LearningSession({
          teacherId: request.teacherId._id,
          learnerId: request.requesterId,
          contactRequestId: request._id,
          skill: request.skill,
          scheduledDate: request.sessionDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow if no date
          duration: request.sessionDuration || 60,
          status: 'scheduled',
          notes: [{
            content: `Session scheduled based on request: ${request.message}`,
            addedBy: req.user._id,
            addedAt: new Date()
          }],
          meetingLink: request.meetingLink || '',
          meetingPlatform: request.meetingPlatform || 'other',
          location: request.location || 'To be determined'
        });
        
        await learningSession.save();
        
        // Create notifications for both parties about the new session
        await Notification.createSessionNotification(
          request.requesterId,
          req.user._id,
          learningSession._id,
          'session_scheduled',
          'Learning session scheduled',
          `Your learning session with ${teacher.name} has been scheduled`,
          { scheduledDate: learningSession.scheduledDate }
        );
        
        // Send notification to teacher as well (if not the current user)
        if (teacher.addedBy && teacher.addedBy.toString() !== req.user._id.toString()) {
          await Notification.createSessionNotification(
            teacher.addedBy,
            req.user._id,
            learningSession._id,
            'session_scheduled',
            'Learning session scheduled',
            `A learning session has been scheduled with ${requesterName}`,
            { scheduledDate: learningSession.scheduledDate }
          );
        }
      }
    }

    await request.populate([
      { path: 'teacherId', select: 'name email skills type' },
      { path: 'requesterId', select: 'name email' }
    ]);

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

// Get skill exchange notifications for the logged-in user
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { 
      isRead = false, 
      limit = 20, 
      page = 1,
      type
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build the query to find notifications related to skill exchange
    const query = { 
      recipient: req.user._id,
      $or: [
        { type: 'contact_request' },
        { type: 'contact_response' },
        { type: 'session_request' },
        { type: 'session_update' },
        { type: 'session_reminder' },
        { type: 'session_feedback' }
      ]
    };
    
    if (isRead !== 'all') {
      query.isRead = isRead === 'true';
    }
    
    if (type) {
      // If specific notification type is requested
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
      
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: notifications.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get skill exchange notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark a notification as read
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if this notification belongs to the user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get learning sessions for a specific contact request
router.get('/requests/:requestId/sessions', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Verify request exists
    const request = await ContactRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Contact request not found' });
    }
    
    // Check permissions
    const isTeacher = (await PeerTeacher.exists({ 
      _id: request.teacherId, 
      addedBy: req.user._id 
    }));
    
    const isRequester = request.requesterId && 
      request.requesterId.toString() === req.user._id.toString();
    
    if (!isRequester && !isTeacher && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const sessions = await LearningSession.find({ contactRequestId: requestId })
      .populate('teacherId', 'name email skills type')
      .populate('learnerId', 'name email')
      .sort({ scheduledDate: -1 });
    
    res.json({ sessions });
  } catch (error) {
    console.error('Get learning sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all learning sessions for the current user
router.get('/learning-sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10, sortBy = 'scheduledDate', sortOrder = 'desc' } = req.query;
    
    const query = {
      $or: [
        { teacherId: userId },
        { learnerId: userId }
      ]
    };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const sessions = await LearningSession.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('teacherId', 'name email skills type')
      .populate('learnerId', 'name email')
      .populate('contactRequestId');
    
    const total = await LearningSession.countDocuments(query);
    
    res.json({ 
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching learning sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific learning session by ID
router.get('/learning-sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await LearningSession.findById(req.params.id)
      .populate('teacherId', 'name email skills type')
      .populate('learnerId', 'name email')
      .populate('contactRequestId');
    
    if (!session) {
      return res.status(404).json({ message: 'Learning session not found' });
    }
    
    // Check permissions - only allow access to participants or admin
    const isParticipant = 
      session.teacherId._id.toString() === req.user._id.toString() || 
      session.learnerId._id.toString() === req.user._id.toString();
    
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ session });
  } catch (error) {
    console.error('Error fetching learning session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update learning session status
router.put('/learning-sessions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const userId = req.user._id;
    const sessionId = req.params.id;
    
    if (!['scheduled', 'completed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid session status' });
    }
    
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Learning session not found' });
    }
    
    // Only teacher or student in the session can update its status
    if (session.teacherId.toString() !== userId.toString() && 
        session.learnerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update session status
    session.status = status;
    
    // Add notes if provided
    if (notes) {
      session.notes = session.notes || [];
      session.notes.push({
        content: notes,
        addedBy: userId,
        addedAt: new Date()
      });
    }
    
    await session.save();
    
    // Create notifications for both parties
    const isTeacher = session.teacherId.toString() === userId.toString();
    const notifyUserId = isTeacher ? session.learnerId : session.teacherId;
    const userName = req.user.name;
    
    // Create a notification for the other party
    await new Notification({
      userId: notifyUserId,
      title: `Learning session ${status}`,
      message: `${userName} has marked your learning session as ${status}${notes ? ' with additional notes' : ''}`,
      type: 'learning_session_update',
      relatedModel: 'LearningSession',
      relatedId: session._id,
      data: {
        sessionId: session._id,
        status
      }
    }).save();
    
    res.json({ 
      message: 'Learning session status updated successfully',
      session
    });
    
  } catch (error) {
    console.error('Error updating learning session status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update learning session details (time, location, etc.)
router.put('/learning-sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { scheduledDate, duration, location, notes, meetingLink, meetingPlatform } = req.body;
    const userId = req.user._id;
    const sessionId = req.params.id;
    
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Learning session not found' });
    }
    
    // Only teacher or student in the session can update it
    if (session.teacherId.toString() !== userId.toString() && 
        session.learnerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update session details
    if (scheduledDate) session.scheduledDate = new Date(scheduledDate);
    if (duration) session.duration = duration;
    if (location) session.location = location;
    if (meetingLink) session.meetingLink = meetingLink;
    if (meetingPlatform) session.meetingPlatform = meetingPlatform;
    
    // Add notes if provided
    if (notes) {
      session.notes = session.notes || [];
      session.notes.push({
        content: notes,
        addedBy: userId,
        addedAt: new Date()
      });
    }
    
    // If rescheduled, update status
    if (scheduledDate && session.status !== 'rescheduled') {
      session.status = 'rescheduled';
    }
    
    await session.save();
    
    // Create notifications for both parties
    const isTeacher = session.teacherId.toString() === userId.toString();
    const notifyUserId = isTeacher ? session.learnerId : session.teacherId;
    const userName = req.user.name;
    
    // Create a notification for the other party
    await Notification.createSessionNotification(
      notifyUserId,
      userId,
      session._id,
      'session_update',
      'Learning session updated',
      `${userName} has updated your learning session details`,
      {
        updates: {
          scheduledDate: scheduledDate ? true : false,
          duration: duration ? true : false,
          location: location ? true : false,
          notes: notes ? true : false,
          meetingLink: meetingLink ? true : false,
          meetingPlatform: meetingPlatform ? true : false
        }
      }
    );
    
    res.json({ 
      message: 'Learning session updated successfully',
      session
    });
    
  } catch (error) {
    console.error('Error updating learning session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit feedback for a learning session
router.post('/learning-sessions/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const userId = req.user._id;
    const sessionId = req.params.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Learning session not found' });
    }
    
    // Verify this user is part of the session
    const isTeacher = session.teacherId.toString() === userId.toString();
    const isLearner = session.learnerId.toString() === userId.toString();
    
    if (!isTeacher && !isLearner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update the appropriate feedback field
    if (isLearner) {
      session.learnerRating = rating;
      session.learnerFeedback = feedback || session.learnerFeedback;
    } else {
      session.teacherRating = rating;
      session.teacherFeedback = feedback || session.teacherFeedback;
    }
    
    // Add a note about the feedback
    session.notes = session.notes || [];
    session.notes.push({
      content: `${isLearner ? 'Learner' : 'Teacher'} submitted feedback: ${rating}/5 stars${feedback ? ` - ${feedback}` : ''}`,
      addedBy: userId,
      addedAt: new Date()
    });
    
    await session.save();
    
    // Notify the other party about the feedback
    const notifyUserId = isLearner ? session.teacherId : session.learnerId;
    const userName = req.user.name;
    
    await Notification.createSessionNotification(
      notifyUserId,
      userId,
      session._id,
      'session_feedback',
      'New session feedback received',
      `${userName} has provided feedback on your learning session`,
      { rating }
    );
    
    res.json({
      message: 'Feedback submitted successfully',
      session
    });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get dashboard data for skill exchange
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get upcoming learning sessions
    const upcomingSessions = await LearningSession.findUpcomingForUser(userId, { limit: 5 });
    
    // Get pending requests (as teacher or student)
    const pendingRequests = await ContactRequest.find({
      $or: [
        { requesterId: userId, status: 'pending' },
        { teacherId: { $in: await PeerTeacher.find({ addedBy: userId }).distinct('_id') }, status: 'pending' }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('teacherId', 'name email skills type')
    .populate('requesterId', 'name email');
    
    // Get recent completed sessions
    const recentCompletedSessions = await LearningSession.find({
      $or: [
        { teacherId: userId },
        { learnerId: userId }
      ],
      status: 'completed',
    })
    .sort({ completedAt: -1 })
    .limit(5)
    .populate('teacherId', 'name email skills')
    .populate('learnerId', 'name email');
    
    // Get stats
    const stats = {
      totalSessionsAsTeacher: await LearningSession.countDocuments({ teacherId: userId }),
      totalSessionsAsLearner: await LearningSession.countDocuments({ learnerId: userId }),
      pendingRequests: await ContactRequest.countDocuments({
        $or: [
          { requesterId: userId, status: 'pending' },
          { teacherId: { $in: await PeerTeacher.find({ addedBy: userId }).distinct('_id') }, status: 'pending' }
        ]
      }),
      upcomingSessionsCount: await LearningSession.countDocuments({
        $or: [
          { teacherId: userId },
          { learnerId: userId }
        ],
        status: { $in: ['scheduled', 'rescheduled'] },
        scheduledDate: { $gte: new Date() }
      }),
    };
    
    res.json({
      upcomingSessions,
      pendingRequests,
      recentCompletedSessions,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
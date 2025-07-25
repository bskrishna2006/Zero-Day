const mongoose = require('mongoose');

const learningSessionSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PeerTeacher',
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactRequest',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'missed', 'rescheduled'],
    default: 'scheduled'
  },
  learnerFeedback: {
    type: String,
    default: null
  },
  teacherFeedback: {
    type: String,
    default: null
  },
  learnerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  teacherRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancelReason: {
    type: String,
    default: null
  },
  meetingLink: {
    type: String,
    default: null
  },
  meetingPlatform: {
    type: String,
    enum: ['zoom', 'google-meet', 'microsoft-teams', 'skype', 'discord', 'in-person', 'other'],
    default: 'other'
  },
  resources: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'website', 'code', 'other'],
      default: 'other'
    }
  }],
  learningOutcomes: [{
    type: String
  }],
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    default: null
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
learningSessionSchema.index({ teacherId: 1, status: 1 });
learningSessionSchema.index({ learnerId: 1, status: 1 });
learningSessionSchema.index({ scheduledDate: 1 });
learningSessionSchema.index({ contactRequestId: 1 });

// Status update handling
learningSessionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

// Helper to add a note to the session
learningSessionSchema.methods.addNote = function(content, userId) {
  if (!this.notes) {
    this.notes = [];
  }
  
  this.notes.push({
    content,
    addedBy: userId,
    addedAt: new Date()
  });
  
  return this;
};

// Helper to check if a user is a participant
learningSessionSchema.methods.isParticipant = function(userId) {
  return (
    this.teacherId.toString() === userId.toString() ||
    this.learnerId.toString() === userId.toString()
  );
};

// Static method to find upcoming sessions for a user
learningSessionSchema.statics.findUpcomingForUser = function(userId, options = {}) {
  const { limit = 5, skip = 0 } = options;
  
  return this.find({
    $or: [
      { teacherId: userId },
      { learnerId: userId }
    ],
    status: { $in: ['scheduled', 'rescheduled'] },
    scheduledDate: { $gte: new Date() }
  })
    .sort({ scheduledDate: 1 })
    .skip(skip)
    .limit(limit)
    .populate('teacherId', 'name email')
    .populate('learnerId', 'name email')
    .populate('contactRequestId');
};

module.exports = mongoose.model('LearningSession', learningSessionSchema);

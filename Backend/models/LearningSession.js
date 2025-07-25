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
    enum: ['scheduled', 'completed', 'cancelled', 'missed'],
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
  notes: {
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

module.exports = mongoose.model('LearningSession', learningSessionSchema);

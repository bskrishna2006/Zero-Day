const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PeerTeacher',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  skill: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  preferredTime: {
    type: String,
    default: 'Flexible'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    default: null
  },
  sessionDate: {
    type: Date,
    default: null
  },
  sessionDuration: {
    type: Number, // in minutes
    default: 60
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
contactRequestSchema.index({ teacherId: 1, status: 1, createdAt: -1 });
contactRequestSchema.index({ requesterId: 1, createdAt: -1 });

// Auto-update timestamps based on status changes
contactRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if ((this.status === 'accepted' || this.status === 'declined') && !this.respondedAt) {
      this.respondedAt = new Date();
    }
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
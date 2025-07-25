const mongoose = require('mongoose');

const peerTeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: null
  },
  linkedinUrl: {
    type: String,
    default: null
  },
  skills: [{
    type: String,
    required: true
  }],
  type: {
    type: String,
    enum: ['peer', 'senior'],
    required: true
  },
  availability: [{
    type: String,
    required: true
  }],
  bio: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient searching
peerTeacherSchema.index({ skills: 1, type: 1, isActive: 1 });
peerTeacherSchema.index({ name: 'text', bio: 'text', skills: 'text' });

// Calculate average rating
peerTeacherSchema.methods.updateRating = function(newRating) {
  this.totalRatings += 1;
  this.rating = ((this.rating * (this.totalRatings - 1)) + newRating) / this.totalRatings;
  return this.save();
};

module.exports = mongoose.model('PeerTeacher', peerTeacherSchema);
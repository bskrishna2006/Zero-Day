const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Accessories', 'Books', 'Sports Equipment', 'Other']
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  location: {
    type: String,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedByName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    default: null
  },
  image: {
    type: String, // Base64 string or file path
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
    }
  }
}, {
  timestamps: true
});

// Index for efficient searching
lostFoundItemSchema.index({ title: 'text', description: 'text' });
lostFoundItemSchema.index({ category: 1, type: 1, status: 1 });

module.exports = mongoose.model('LostFoundItem', lostFoundItemSchema);
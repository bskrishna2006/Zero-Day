const mongoose = require('mongoose');

const readAnnouncementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one read record per user-announcement pair
readAnnouncementSchema.index({ userId: 1, announcementId: 1 }, { unique: true });

module.exports = mongoose.model('ReadAnnouncement', readAnnouncementSchema);

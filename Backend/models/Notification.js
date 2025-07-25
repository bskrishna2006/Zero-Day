const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'session_request',
      'session_update',
      'session_reminder',
      'session_cancelled',
      'session_feedback',
      'contact_request',
      'contact_response',
      'system'
    ],
    required: true
  },
  relatedModel: {
    type: String,
    enum: ['PeerTeacher', 'ContactRequest', 'LearningSession', 'User', null],
    default: null
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  link: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create a learning session notification
notificationSchema.statics.createSessionNotification = async function(
  recipientId,
  senderId,
  sessionId,
  type,
  title,
  message,
  data = {}
) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    title,
    message,
    type,
    relatedModel: 'LearningSession',
    relatedId: sessionId,
    link: `/skill-exchange/sessions/${sessionId}`,
    data: {
      sessionId,
      ...data
    }
  });
};

// Static method to create a contact request notification
notificationSchema.statics.createRequestNotification = async function(
  recipientId,
  senderId,
  requestId,
  type,
  title,
  message,
  data = {}
) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    title,
    message,
    type,
    relatedModel: 'ContactRequest',
    relatedId: requestId,
    link: `/skill-exchange/requests/${requestId}`,
    data: {
      requestId,
      ...data
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);

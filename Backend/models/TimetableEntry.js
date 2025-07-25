const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  type: {
    type: String,
    enum: ['class', 'lab', 'tutorial', 'exam', 'other'],
    default: 'class'
  },
  instructor: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
timetableEntrySchema.index({ userId: 1, day: 1, startTime: 1 });

// Validate time format and logic
timetableEntrySchema.pre('save', function(next) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(this.startTime) || !timeRegex.test(this.endTime)) {
    return next(new Error('Invalid time format. Use HH:MM format.'));
  }
  
  const start = new Date(`2000-01-01 ${this.startTime}`);
  const end = new Date(`2000-01-01 ${this.endTime}`);
  
  if (start >= end) {
    return next(new Error('End time must be after start time.'));
  }
  
  next();
});

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
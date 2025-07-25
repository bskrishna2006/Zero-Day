const express = require('express');
const TimetableEntry = require('../models/TimetableEntry');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's timetable entries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { day, week, month, year } = req.query;
    
    const query = { userId: req.user._id };
    
    if (day) {
      query.day = day;
    }

    const entries = await TimetableEntry.find(query).sort({ day: 1, startTime: 1 });

    // Group entries by day for easier frontend consumption
    const groupedEntries = entries.reduce((acc, entry) => {
      if (!acc[entry.day]) {
        acc[entry.day] = [];
      }
      acc[entry.day].push(entry);
      return acc;
    }, {});

    res.json({
      entries,
      groupedEntries,
      totalEntries: entries.length
    });
  } catch (error) {
    console.error('Get timetable entries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single timetable entry
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await TimetableEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get timetable entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new timetable entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      subject, 
      day, 
      startTime, 
      endTime, 
      location, 
      color, 
      type, 
      instructor, 
      notes 
    } = req.body;

    if (!subject || !day || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Subject, day, start time, and end time are required' 
      });
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: 'Invalid day' });
    }

    // Check for time conflicts
    const conflictingEntry = await TimetableEntry.findOne({
      userId: req.user._id,
      day,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingEntry) {
      return res.status(400).json({ 
        message: 'Time conflict with existing entry',
        conflictingEntry: {
          subject: conflictingEntry.subject,
          startTime: conflictingEntry.startTime,
          endTime: conflictingEntry.endTime
        }
      });
    }

    const entry = new TimetableEntry({
      userId: req.user._id,
      subject,
      day,
      startTime,
      endTime,
      location,
      color: color || 'bg-blue-100 border-blue-300 text-blue-800',
      type: type || 'class',
      instructor,
      notes
    });

    await entry.save();

    res.status(201).json({
      message: 'Timetable entry created successfully',
      entry
    });
  } catch (error) {
    console.error('Create timetable entry error:', error);
    if (error.message.includes('Invalid time format') || error.message.includes('End time must be after start time')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update timetable entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await TimetableEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    const { 
      subject, 
      day, 
      startTime, 
      endTime, 
      location, 
      color, 
      type, 
      instructor, 
      notes 
    } = req.body;

    // Check for time conflicts (excluding current entry)
    if (day && startTime && endTime) {
      const conflictingEntry = await TimetableEntry.findOne({
        userId: req.user._id,
        day,
        _id: { $ne: req.params.id },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (conflictingEntry) {
        return res.status(400).json({ 
          message: 'Time conflict with existing entry',
          conflictingEntry: {
            subject: conflictingEntry.subject,
            startTime: conflictingEntry.startTime,
            endTime: conflictingEntry.endTime
          }
        });
      }
    }

    // Update fields
    if (subject) entry.subject = subject;
    if (day) entry.day = day;
    if (startTime) entry.startTime = startTime;
    if (endTime) entry.endTime = endTime;
    if (location !== undefined) entry.location = location;
    if (color) entry.color = color;
    if (type) entry.type = type;
    if (instructor !== undefined) entry.instructor = instructor;
    if (notes !== undefined) entry.notes = notes;

    await entry.save();

    res.json({
      message: 'Timetable entry updated successfully',
      entry
    });
  } catch (error) {
    console.error('Update timetable entry error:', error);
    if (error.message.includes('Invalid time format') || error.message.includes('End time must be after start time')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete timetable entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await TimetableEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    await TimetableEntry.findByIdAndDelete(req.params.id);

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable entry error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get entries for a specific day
router.get('/day/:day', authenticateToken, async (req, res) => {
  try {
    const { day } = req.params;
    
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: 'Invalid day' });
    }

    const entries = await TimetableEntry.find({
      userId: req.user._id,
      day
    }).sort({ startTime: 1 });

    res.json({
      day,
      entries,
      count: entries.length
    });
  } catch (error) {
    console.error('Get day entries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk create entries (for importing schedules)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'Entries array is required' });
    }

    const validatedEntries = entries.map(entry => ({
      ...entry,
      userId: req.user._id,
      color: entry.color || 'bg-blue-100 border-blue-300 text-blue-800',
      type: entry.type || 'class'
    }));

    const createdEntries = await TimetableEntry.insertMany(validatedEntries);

    res.status(201).json({
      message: `${createdEntries.length} timetable entries created successfully`,
      entries: createdEntries
    });
  } catch (error) {
    console.error('Bulk create entries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clear all entries for user
router.delete('/clear/all', authenticateToken, async (req, res) => {
  try {
    const result = await TimetableEntry.deleteMany({ userId: req.user._id });

    res.json({
      message: 'All timetable entries cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear all entries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
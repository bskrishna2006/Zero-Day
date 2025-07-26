const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas successfully! Using connection string:', MONGO_URI.replace(/\/\/(.+?):(.+?)@/, '//$1:****@')))
.catch(err => console.error('MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcements');
const lostFoundRoutes = require('./routes/lostFound');
const timetableRoutes = require('./routes/timetable');
const complaintRoutes = require('./routes/complaints');
const skillExchangeRoutes = require('./routes/skillExchange');
const chatbotRoutes = require('./routes/chatbot');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/skill-exchange', skillExchangeRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'CampusLink Backend is running!' });
});

// Error handling middleware
// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    // Check if connected to MongoDB
    if (mongoose.connection.readyState === 1) {
      // Get database name from the connection string
      const dbName = mongoose.connection.db.databaseName;
      
      // Get collection names
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(collection => collection.name);
      
      res.json({
        status: 'success',
        message: 'Connected to MongoDB Atlas',
        database: dbName,
        collections: collectionNames,
        connectionType: 'Atlas', // This should say Atlas if connected to cloud
        host: mongoose.connection.host
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Not connected to MongoDB',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
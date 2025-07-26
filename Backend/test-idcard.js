// Test utility for ID card uploads
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zeroday', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function testIdCardRetrieval() {
  try {
    // Find a user with ID card
    const user = await User.findOne({
      'collegeIdCard.data': { $exists: true, $ne: null }
    });
    
    if (!user) {
      console.log('No users with ID cards found');
      process.exit(0);
    }
    
    console.log('Found user with ID card:', user.email);
    console.log('ID card content type:', user.collegeIdCard.contentType);
    console.log('ID card data length:', user.collegeIdCard.data ? user.collegeIdCard.data.length : 'No data');
    
    // Save the image to a file for testing
    if (user.collegeIdCard.data) {
      const extension = user.collegeIdCard.contentType.split('/')[1];
      const outputPath = path.join(__dirname, `test-idcard-${user._id}.${extension}`);
      
      fs.writeFileSync(outputPath, user.collegeIdCard.data);
      console.log(`ID card image saved to ${outputPath}`);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error testing ID card retrieval:', error);
    mongoose.disconnect();
  }
}

testIdCardRetrieval();

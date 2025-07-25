require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', MONGO_URI.replace(/\/\/(.+?):(.+?)@/, '//$1:****@'));
    
    await mongoose.connect(MONGO_URI);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Connection Details:');
    console.log(`- Database: ${mongoose.connection.db.databaseName}`);
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Connection Type: ${mongoose.connection.host.includes('mongodb.net') ? 'Atlas (Cloud)' : 'Local'}`);
    
    // Get and display collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    
    if (collections.length === 0) {
      console.log('No collections found. Database might be empty.');
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
      
      // Check for some sample data
      console.log('\nSample data from collections:');
      
      // Check users collection
      if (collections.some(c => c.name === 'users')) {
        const usersCollection = mongoose.connection.db.collection('users');
        const userCount = await usersCollection.countDocuments();
        const sampleUser = await usersCollection.findOne({});
        console.log(`Users: ${userCount} documents`);
        if (sampleUser) {
          console.log('Sample user:', {
            id: sampleUser._id,
            name: sampleUser.name || 'N/A',
            email: sampleUser.email ? 
              (sampleUser.email.substring(0, 3) + '***@***' + 
               (sampleUser.email.includes('@') ? sampleUser.email.split('@')[1] : '')) : 'N/A',
            role: sampleUser.role || 'N/A',
            createdAt: sampleUser.createdAt || 'N/A'
          });
        }
      }
      
      // Check peer teachers
      if (collections.some(c => c.name === 'peerteachers')) {
        const teachersCollection = mongoose.connection.db.collection('peerteachers');
        const teacherCount = await teachersCollection.countDocuments();
        const sampleTeacher = await teachersCollection.findOne({});
        console.log(`Peer Teachers: ${teacherCount} documents`);
        if (sampleTeacher) {
          console.log('Sample peer teacher:', {
            id: sampleTeacher._id,
            name: sampleTeacher.name,
            subject: sampleTeacher.subject,
            userId: sampleTeacher.userId
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

testConnection();

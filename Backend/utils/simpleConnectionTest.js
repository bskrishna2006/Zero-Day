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
    }

    // Sample count from each collection
    for (const collection of collections) {
      try {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`Collection: ${collection.name} - ${count} documents`);
      } catch (err) {
        console.log(`Collection: ${collection.name} - Error counting: ${err.message}`);
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

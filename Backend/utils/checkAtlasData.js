const mongoose = require('mongoose');
require('dotenv').config();

// The MongoDB Atlas URI from your .env file
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('No MONGO_URI found in environment variables!');
  process.exit(1);
}

async function checkAtlasData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully to MongoDB Atlas');

    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    console.log(`Database: ${dbName} on host ${host}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);
    
    // Count documents in each collection
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
      
      // If there are documents, show a sample
      if (count > 0) {
        const sample = await mongoose.connection.db.collection(collection.name).findOne({});
        console.log(`Sample from ${collection.name}:`, JSON.stringify(sample, null, 2).substring(0, 300) + '...');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

checkAtlasData();

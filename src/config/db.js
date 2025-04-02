const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'gitaWisdomDB';

// MongoDB client
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Collections
const COLLECTIONS = {
  VERSES: 'verses',
  USER_QUERIES: 'userQueries',
  RECOMMENDATIONS: 'recommendations'
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(dbName);
    
    // Create collections if they don't exist
    await db.createCollection(COLLECTIONS.VERSES);
    await db.createCollection(COLLECTIONS.USER_QUERIES);
    await db.createCollection(COLLECTIONS.RECOMMENDATIONS);
    
    // Create text index on the verses collection
    await db.collection(COLLECTIONS.VERSES).createIndex({ text: 'text' });
    
    console.log('MongoDB collections and indexes initialized');
    
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

module.exports = {
  connectToDatabase,
  COLLECTIONS,
  client
};
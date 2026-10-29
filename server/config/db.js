const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGO_URI from the .env file.
 * The process exits if the connection fails, because the API cannot work without a database.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing. Copy .env.example to .env and set it.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    console.log(`Attempting to connect to MongoDB: ${mongoURI.replace(/\/\/.*@/, '//***@')}`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. MongoDB service is running (check with: mongod --version)');
    console.error('2. MONGODB_URI in .env file is correct');
    console.error('3. Database name in connection string is valid');
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use default MongoDB URI if not provided in environment
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-ride';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.log('💡 Make sure MongoDB is running on your system');
    console.log('💡 You can install MongoDB locally or use MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB;

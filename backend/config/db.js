const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const isCloud = process.env.MONGO_URI.includes('mongodb+srv');
      console.log(`⏳ [DB] Connection attempt ${attempt}/${retries} to ${isCloud ? 'Atlas' : 'Local'}...`);

      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000, // Increase to 8s for cold starts
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📁 Database Name: ${conn.connection.name}`);
      
      // Monitor connection health
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected! App may be unstable.');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected.');
      });

      return; // Success
    } catch (error) {
      console.error(`❌ DB Connection failed (Attempt ${attempt}): ${error.message}`);
      if (attempt === retries) {
        console.error('🚨 All DB retry attempts failed. Exiting...');
        process.exit(1);
      }
      // Wait 3 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;

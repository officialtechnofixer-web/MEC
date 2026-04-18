const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`⚠️  Server will start but API calls requiring the database will fail.`);
    console.error(`💡 Make sure MongoDB is running locally or update MONGO_URI in .env`);
  }
};

module.exports = connectDB;

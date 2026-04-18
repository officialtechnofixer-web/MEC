const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isCloud = process.env.MONGO_URI.includes('mongodb+srv');
    console.log(`⏳ Connecting to ${isCloud ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}...`);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    if (isCloud) console.log(`🌐 Production Database Active [uafms]`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.MONGO_URI.includes('mongodb+srv')) {
      console.error(`👉 TIP: Ensure your IP is whitelisted in MongoDB Atlas and your <db_password> is correct.`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;

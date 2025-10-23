import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

testConnection();

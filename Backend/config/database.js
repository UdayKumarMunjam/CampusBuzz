import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4, // ✅ Force IPv4 (VERY IMPORTANT)
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB FULL ERROR:");
    console.error(error); // full detailed error
  }
};

export default connectDB;
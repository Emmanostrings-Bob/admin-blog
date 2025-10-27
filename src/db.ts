import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI as string;
    if (!uri) throw new Error("MONGODB_URI missing in environment variables");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;

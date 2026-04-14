import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      dbName: "document-intelligence",
    });

    isConnected = conn.connections[0].readyState === 1;

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Optional event listeners
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

  } catch (error: any) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
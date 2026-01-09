import mongoose from "mongoose";

declare global {
  interface Global {
    mongooseConnection?: number;
  }
}

let isConnected = (global as Global).mongooseConnection;

async function dbConnect(): Promise<void> {
  if (isConnected) {
    console.log("✅ Already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");

    isConnected = db.connections[0].readyState;

    (global as Global).mongooseConnection = isConnected;

    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ DB connection error:", error);
    process.exit(1);
  }
}

export default dbConnect;

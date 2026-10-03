import mongoose from 'mongoose';

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<any> => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://localhost:27017/rhizan_hub';

  if (primaryUri) {
    try {
      if (!cached.promise) {
        cached.promise = mongoose.connect(primaryUri, {
          serverSelectionTimeoutMS: 5000,
        });
      }
      cached.conn = await cached.promise;
      console.log(`✅ Primary MongoDB Connected: ${cached.conn.connection.host}`);
      return cached.conn;
    } catch (primaryErr: any) {
      cached.promise = null;
      console.warn(`⚠️ Primary MongoDB connection failed (${primaryErr.message}). Falling back to local docker MongoDB...`);
    }
  }

  try {
    const fallbackConn = await mongoose.connect(fallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Local Fallback MongoDB Connected: ${fallbackConn.connection.host}`);
    return fallbackConn;
  } catch (fallbackErr: any) {
    console.error('❌ Both Primary and Local MongoDB Connections Failed:', fallbackErr.message);
  }
};

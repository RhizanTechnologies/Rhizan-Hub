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
  const isVercel = !!process.env.VERCEL;

  if (!primaryUri) {
    if (isVercel) {
      throw new Error('MONGODB_URI environment variable is missing on Vercel.');
    }
  } else {
    try {
      if (!cached.promise) {
        cached.promise = mongoose.connect(primaryUri, {
          serverSelectionTimeoutMS: 7000,
        });
      }
      cached.conn = await cached.promise;
      console.log(`✅ Primary MongoDB Connected: ${cached.conn.connection.host}`);
      return cached.conn;
    } catch (primaryErr: any) {
      cached.promise = null;
      console.error(`❌ Primary MongoDB connection failed: ${primaryErr.message}`);
      if (isVercel) {
        throw new Error(
          `MongoDB Atlas Connection Failed: ${primaryErr.message}. Ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.`
        );
      }
      console.warn('⚠️ Falling back to local MongoDB for local dev...');
    }
  }

  // Only try local fallback when running locally, never on Vercel
  if (!isVercel) {
    const fallbackUri = 'mongodb://localhost:27017/rhizan_hub';
    try {
      const fallbackConn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Local Fallback MongoDB Connected: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (fallbackErr: any) {
      console.error('❌ Local MongoDB Connection Failed:', fallbackErr.message);
      throw fallbackErr;
    }
  }
};

import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://localhost:27017/rhizan_hub';

  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Primary MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (primaryErr: any) {
      console.warn(`⚠️ Primary MongoDB connection failed (${primaryErr.message}). Falling back to local docker MongoDB...`);
    }
  }

  try {
    const fallbackConn = await mongoose.connect(fallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Local Fallback MongoDB Connected: ${fallbackConn.connection.host}`);
  } catch (fallbackErr: any) {
    console.error('❌ Both Primary and Local MongoDB Connections Failed:', fallbackErr.message);
  }
};

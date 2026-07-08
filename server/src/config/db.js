import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_screener';

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected -> ${uri}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error(
      'Make sure MongoDB is running locally, or set MONGODB_URI to a ' +
        'free Atlas cluster (https://www.mongodb.com/cloud/atlas/register) in your .env file.'
    );
    process.exit(1);
  }
}
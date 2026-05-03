import mongoose from 'mongoose';

const clearUsers = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-management';
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Clear Users collection
    const result = await mongoose.connection.collection('users').deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing users:', error);
    process.exit(1);
  }
};

clearUsers();

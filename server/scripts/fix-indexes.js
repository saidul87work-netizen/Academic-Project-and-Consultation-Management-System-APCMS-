
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-management';

const checkIndexes = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB.');

        const collection = mongoose.connection.collection('applications');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop all indexes except _id
        await collection.dropIndexes();
        console.log('Dropped all non-_id indexes.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkIndexes();


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Application from '../models/Application.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-management';

const debugSubmission = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const mockData = {
            student: 'demo-student-1',
            positionId: '1',
            positionType: 'TA',
            studentName: 'Debug User',
            email: 'debug@example.com',
            studentId: '123456',
            gpa: '3.5',
            expertise: ['Debugging'],
            availability: 'Always',
            experience: 'None',
            coverLetter: 'Test',
            status: 'pending',
            appliedAt: new Date()
        };

        console.log('Attempting to save application:', mockData);
        const app = new Application(mockData);
        await app.save();
        console.log('SUCCESS: Application saved correctly.');
    } catch (error) {
        console.error('FAILURE: Error saving application:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debugSubmission();

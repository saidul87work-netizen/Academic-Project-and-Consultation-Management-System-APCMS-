import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

async function checkUsers() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-management';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB at', uri);
    
    const assessors = await User.find({ role: ROLES.FACULTY });
    console.log(`Found ${assessors.length} assessors:`);
    assessors.forEach(u => console.log(`- ${u.name} (${u.role})`));
    
    const students = await User.find({ role: ROLES.STUDENT });
    console.log(`Found ${students.length} students:`);
    students.forEach(u => console.log(`- ${u.name} (${u.role})`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();

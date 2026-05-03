import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  universityId: { type: String, required: false }, // ID field for Student/Faculty
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);

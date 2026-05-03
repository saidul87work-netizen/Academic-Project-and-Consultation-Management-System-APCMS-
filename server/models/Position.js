import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  type: { type: String, enum: ['TA', 'RA', 'ST'], required: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  course: { type: String },
  faculty: { type: String, default: 'Admin' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  hoursPerWeek: { type: Number, default: 0 },
  payRate: { type: String, default: 'N/A' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  spots: { type: Number, required: true, default: 1 },
  filled: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Position', positionSchema);

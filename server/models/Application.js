import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  student: { type: String, required: true }, // Demo: using string IDs instead of ObjectId refs
  positionId: { type: String, required: true },
  positionType: { type: String, enum: ['ST', 'RA', 'TA'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'PENDING', 'ACCEPTED', 'REJECTED'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  reviewedBy: { type: String }, // Demo: using string IDs instead of ObjectId refs
  reviewedAt: { type: Date },
  // Additional fields for detailed application
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  studentId: { type: String, required: true },
  gpa: { type: String, required: true },
  expertise: { type: [String], required: true },
  availability: { type: String, required: true },
  experience: { type: String, required: true },
  coverLetter: { type: String, required: true }
});

export default mongoose.model('Application', applicationSchema);

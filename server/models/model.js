import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const USER_ROLES = ['student', 'faculty', 'ST'];

const UserSchema = new Schema({
  name: { type: String, required: true },
  universityId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: [{ type: String, enum: USER_ROLES, required: true }],
}, { timestamps: true });

const ConsultationRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String },
  preferredStart: Date,
  preferredEnd: Date, // Kept for scheduling duration
  confirmedStart: Date,
  status: { type: String, enum: ['requested', 'accepted', 'declined'], default: 'requested' },
  
  // Feature 3: Assigning STs
  assignedSTs: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // Feature 4: Feedback for ST
  feedbackForST: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date
  }
}, { timestamps: true });

const User = model('User', UserSchema);
const ConsultationRequest = model('ConsultationRequest', ConsultationRequestSchema);

export { User, ConsultationRequest };

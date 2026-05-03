import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['leader', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'removed'], default: 'active' }
});

const supervisorFeedbackSchema = new mongoose.Schema({
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisorName: { type: String, default: '' },
  stage: { type: String, default: '' },
  message: { type: String, required: true },
  visibleToAll: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const teamSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  teamName: { type: String, required: true },
  members: [teamMemberSchema],
  sharedSubmissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
  sharedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  supervisorFeedback: [supervisorFeedbackSchema],
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;

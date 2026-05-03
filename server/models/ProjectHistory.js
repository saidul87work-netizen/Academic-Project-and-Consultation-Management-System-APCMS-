import mongoose from 'mongoose';

const projectHistorySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, required: true },
  action: { 
    type: String, 
    enum: ['submitted', 'graded', 'late_flagged', 'feedback_given', 'stage_updated', 'member_added', 'evaluated'],
    required: true 
  },
  details: { type: String, required: true },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

const ProjectHistory = mongoose.model('ProjectHistory', projectHistorySchema);
export default ProjectHistory;

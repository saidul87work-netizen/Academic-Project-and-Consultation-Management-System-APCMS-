import mongoose from 'mongoose';

const evaluationEntrySchema = new mongoose.Schema({
  assessorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessorRole: { 
    type: String, 
    enum: ['Supervisor', 'Co-Supervisor', 'ST', 'RA', 'TA', 'External Examiner'],
    required: true 
  },
  scores: {
    criteria1: { type: Number, required: true, min: 0, max: 100 },
    criteria2: { type: Number, required: true, min: 0, max: 100 },
    criteria3: { type: Number, required: true, min: 0, max: 100 },
    criteria4: { type: Number, required: true, min: 0, max: 100 }
  },
  comments: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now }
});

const multiLevelEvaluationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  stage: { type: String, required: true }, // e.g. "Proposal", "Midterm", "Final"
  evaluations: [evaluationEntrySchema],
  averageScore: { type: Number, default: 0 },
  summary: { type: String, default: "Pending" },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to calculate averageScore and summary is handled in the controller 
// because we need to calculate across multiple evaluations in the array.

const MultiLevelEvaluation = mongoose.model('MultiLevelEvaluation', multiLevelEvaluationSchema);
export default MultiLevelEvaluation;

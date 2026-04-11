import mongoose from 'mongoose';

const evaluationScoreSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assessor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  comments: { type: String },
  evaluatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('EvaluationScore', evaluationScoreSchema);

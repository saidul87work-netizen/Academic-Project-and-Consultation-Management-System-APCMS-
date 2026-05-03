import mongoose from 'mongoose';
import { ASSESSOR_ROLES, EVALUATION_STATUS } from '../config/constants.js';

const criterionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  maxScore: {
    type: Number,
    required: true,
    default: 20
  },
  score: {
    type: Number,
    min: 0,
    max: 20
  },
  comment: {
    type: String,
    default: ''
  }
});

const evaluationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assessorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessorName: {
    type: String,
    required: true
  },
  assessorRole: {
    type: String,
    enum: Object.values(ASSESSOR_ROLES),
    required: true
  },
  criteria: {
    type: [criterionSchema],
    required: true,
    validate: {
      validator: function(criteria) {
        return criteria.length === 5; // Must have exactly 5 criteria
      },
      message: 'Evaluation must have exactly 5 criteria'
    }
  },
  finalComment: {
    type: String,
    default: ''
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: Object.values(EVALUATION_STATUS),
    default: 'Pending'
  },
  submittedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total score before saving
evaluationSchema.pre('save', function(next) {
  if (this.criteria && this.criteria.length > 0) {
    this.totalScore = this.criteria.reduce((sum, criterion) => {
      return sum + (criterion.score || 0);
    }, 0);
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Evaluation', evaluationSchema);

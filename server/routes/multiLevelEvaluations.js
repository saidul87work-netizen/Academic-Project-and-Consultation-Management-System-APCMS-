import express from 'express';
import MultiLevelEvaluation from '../models/MultiLevelEvaluation.js';
import { mockAuth } from '../middleware/mockAuth.js';
import { logProjectHistory } from '../utils/historyLogger.js';

const router = express.Router();

// Helper to calculate averages and summary
const calculateSummary = (evaluations) => {
  if (!evaluations || evaluations.length === 0) return { averageScore: 0, summary: "Pending" };

  // 1. Average each assessor's scores
  const assessorAverages = evaluations.map(entry => {
    const s = entry.scores;
    return (s.criteria1 + s.criteria2 + s.criteria3 + s.criteria4) / 4;
  });

  // 2. Average all assessors' averages
  const overallAverage = assessorAverages.reduce((a, b) => a + b, 0) / assessorAverages.length;
  const roundedAverage = Math.round(overallAverage * 100) / 100;

  // 3. Auto-generate summary
  let summaryLabel = "";
  if (roundedAverage >= 80) summaryLabel = "Excellent";
  else if (roundedAverage >= 60) summaryLabel = "Good";
  else if (roundedAverage >= 40) summaryLabel = "Needs Improvement";
  else summaryLabel = "Unsatisfactory";

  return { averageScore: roundedAverage, summary: summaryLabel };
};

// POST /api/evaluations/:projectId -> submit evaluation
router.post('/:projectId', mockAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stage, scores, comments, assessorRole } = req.body;
    const assessorId = req.user.id || req.user._id;

    // Find or create the evaluation panel for this project and stage
    let panel = await MultiLevelEvaluation.findOne({ projectId, stage });
    
    if (!panel) {
      panel = new MultiLevelEvaluation({ projectId, stage, evaluations: [] });
    }

    // Check if user already evaluated this project+stage
    const alreadyEvaluated = panel.evaluations.find(e => e.assessorId.toString() === assessorId.toString());
    if (alreadyEvaluated) {
      return res.status(400).json({ error: "You have already evaluated this project for this stage." });
    }

    // Add new evaluation
    panel.evaluations.push({
      assessorId,
      assessorRole,
      scores,
      comments,
      submittedAt: new Date()
    });

    // Update aggregate stats
    const { averageScore, summary } = calculateSummary(panel.evaluations);
    panel.averageScore = averageScore;
    panel.summary = summary;
    panel.updatedAt = new Date();

    await panel.save();

    // Log history
    await logProjectHistory({
      projectId,
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'evaluated',
      details: `Submitted evaluation for ${stage} stage`,
      metadata: { stage, averageScore: panel.averageScore }
    });

    res.status(201).json(panel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/evaluations/:projectId -> get all evaluations + summary
router.get('/:projectId', mockAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stage } = req.query; // Allow filtering by stage

    let query = { projectId };
    if (stage) query.stage = stage;

    const panels = await MultiLevelEvaluation.find(query).populate('evaluations.assessorId', 'name');
    res.json(panels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/evaluations/:projectId/:evalId -> update own evaluation
router.put('/:projectId/:evalId', mockAuth, async (req, res) => {
  try {
    const { projectId, evalId } = req.params;
    const { scores, comments } = req.body;
    const assessorId = req.user.id || req.user._id;

    const panel = await MultiLevelEvaluation.findOne({ projectId, "evaluations._id": evalId });
    if (!panel) return res.status(404).json({ error: "Evaluation not found" });

    const entry = panel.evaluations.id(evalId);
    if (entry.assessorId.toString() !== assessorId.toString()) {
      return res.status(403).json({ error: "Not authorized to update this evaluation" });
    }

    entry.scores = scores;
    entry.comments = comments;
    entry.submittedAt = new Date();

    const { averageScore, summary } = calculateSummary(panel.evaluations);
    panel.averageScore = averageScore;
    panel.summary = summary;
    panel.updatedAt = new Date();

    await panel.save();

    // Log history
    await logProjectHistory({
      projectId,
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'evaluated',
      details: `Updated evaluation for ${panel.stage} stage`,
      metadata: { stage: panel.stage, evaluationId: evalId }
    });

    res.json(panel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/evaluations/:projectId/summary -> summary only
router.get('/:projectId/summary', mockAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stage } = req.query;

    const panel = await MultiLevelEvaluation.findOne({ projectId, stage });
    if (!panel) return res.json({ averageScore: 0, summary: "Pending" });

    res.json({ averageScore: panel.averageScore, summary: panel.summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

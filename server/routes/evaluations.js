import express from 'express';
import Evaluation from '../models/Evaluation.js';
import Project from '../models/Project.js';
import { mockAuth, requireRole } from '../middleware/mockAuth.js';

const router = express.Router();

// @route   GET /api/evaluations
// @desc    Get all evaluations (filtered by project or assessor)
// @access  Demo mode - no auth required
router.get('/', mockAuth, async (req, res) => {
  try {
    const { projectId, assessorId } = req.query;
    
    let filter = {};
    
    if (projectId) filter.projectId = projectId;
    if (assessorId) filter.assessorId = assessorId;

    const evaluations = await Evaluation.find(filter)
      .populate('projectId', 'title studentName')
      .populate('assessorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/evaluations/:id
// @desc    Get single evaluation
// @access  Demo mode - no auth required
router.get('/:id', mockAuth, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('projectId', 'title studentName studentId')
      .populate('assessorId', 'name email');

    if (!evaluation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Evaluation not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/evaluations
// @desc    Create evaluation assignment (faculty assigns themselves)
// @access  Demo mode - no auth required
router.post('/', mockAuth, requireRole('faculty'), async (req, res) => {
  try {
    const { projectId, assessorRole, assessorName } = req.body;

    console.log('📝 RECEIVED EVALUATION ASSIGNMENT REQUEST');
    console.log('📝 REQUEST BODY:', req.body);
    console.log('📝 DEMO USER:', req.user);

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // For demo mode, we'll allow multiple assignments (no unique constraint)
    // Check if evaluation already exists for this assessor and project
    const existingEvaluation = await Evaluation.findOne({
      projectId,
      assessorId: req.user._id  // Use _id instead of id
    });

    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        error: 'You have already been assigned to evaluate this project'
      });
    }

    // Create evaluation with default criteria
    const evaluation = await Evaluation.create({
      projectId,
      assessorId: req.user._id,  // Use _id instead of id
      assessorName: assessorName || req.user.name,
      assessorRole: assessorRole || 'Supervisor',
      criteria: [
        {
          name: 'Research & Analysis',
          maxScore: 20,
          score: undefined,
          comment: ''
        },
        {
          name: 'Methodology & Approach',
          maxScore: 20,
          score: undefined,
          comment: ''
        },
        {
          name: 'Implementation & Execution',
          maxScore: 20,
          score: undefined,
          comment: ''
        },
        {
          name: 'Results & Discussion',
          maxScore: 20,
          score: undefined,
          comment: ''
        },
        {
          name: 'Presentation & Documentation',
          maxScore: 20,
          score: undefined,
          comment: ''
        }
      ],
      finalComment: '',
      totalScore: 0,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   PUT /api/evaluations/:id
// @desc    Submit/update evaluation scores
// @access  Demo mode - no auth required
router.put('/:id', mockAuth, async (req, res) => {
  try {
    console.log('📝 RECEIVED EVALUATION UPDATE REQUEST');
    console.log('📝 REQUEST BODY:', req.body);
    console.log('📝 DEMO USER:', req.user);

    let evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }

    // For demo mode, allow updates (skip ownership check)
    // Check if user is the assessor
    // if (evaluation.assessorId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Not authorized to update this evaluation'
    //   });
    // }

    const { criteria, finalComment, status } = req.body;

    // Update evaluation
    evaluation.criteria = criteria || evaluation.criteria;
    evaluation.finalComment = finalComment || evaluation.finalComment;
    
    // If submitting, set status and timestamp
    if (status === 'Submitted') {
      evaluation.status = 'Submitted';
      evaluation.submittedAt = new Date();
    }

    await evaluation.save(); // This will trigger pre-save hook to calculate total

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   DELETE /api/evaluations/:id
// @desc    Delete evaluation
// @access  Demo mode - no auth required
router.delete('/:id', mockAuth, requireRole('admin'), async (req, res) => {
  try {
    console.log('🗑️ RECEIVED EVALUATION DELETE REQUEST');
    console.log('📝 DEMO USER:', req.user);

    const evaluation = await Evaluation.findById(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }

    // For demo mode, allow deletion (skip authorization check)
    // Only admin or the assessor (if pending) can delete
    // if (
    //   req.user.role !== 'admin' &&
    //   (evaluation.assessorId.toString() !== req.user.id || evaluation.status === 'Submitted')
    // ) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Not authorized to delete this evaluation'
    //   });
    // }

    await evaluation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/evaluations/project/:projectId/summary
// @desc    Get evaluation summary for a project (average scores)
// @access  Demo mode - no auth required
router.get('/project/:projectId/summary', mockAuth, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({
      projectId: req.params.projectId,
      status: 'Submitted'
    });

    if (evaluations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalEvaluations: 0,
          averageScore: 0,
          criteriaAverages: []
        }
      });
    }

    // Calculate averages
    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0);
    const averageScore = totalScore / evaluations.length;

    // Calculate criteria averages
    const criteriaAverages = evaluations[0].criteria.map((_, index) => {
      const criterionScores = evaluations.map(evaluation => evaluation.criteria[index].score || 0);
      const sum = criterionScores.reduce((a, b) => a + b, 0);
      return {
        name: evaluations[0].criteria[index].name,
        average: sum / evaluations.length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalEvaluations: evaluations.length,
        averageScore: Math.round(averageScore * 100) / 100,
        criteriaAverages,
        evaluations: evaluations.map(e => ({
          id: e._id,
          assessorName: e.assessorName,
          assessorRole: e.assessorRole,
          totalScore: e.totalScore,
          submittedAt: e.submittedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;

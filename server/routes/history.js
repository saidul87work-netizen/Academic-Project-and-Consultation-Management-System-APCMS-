import express from 'express';
import ProjectHistory from '../models/ProjectHistory.js';
import { mockAuth } from '../middleware/mockAuth.js';

const router = express.Router();

// GET /api/history/:projectId -> get full history
router.get('/:projectId', mockAuth, async (req, res) => {
  try {
    const { action } = req.query;
    let query = { projectId: req.params.projectId };
    
    if (action && action !== 'All') {
      query.action = action;
    }

    const history = await ProjectHistory.find(query)
      .populate('actorId', 'name')
      .sort({ timestamp: -1 });
      
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

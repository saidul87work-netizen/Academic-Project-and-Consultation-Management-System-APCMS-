import express from 'express';
import Position from '../models/Position.js';
import { mockAuth, requireRole } from '../middleware/mockAuth.js'; // Assuming mockAuth is set up to provide req.user

const router = express.Router();

// Get all positions
router.get('/', async (req, res) => {
  try {
    const { type, available } = req.query;
    let query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (available === 'true') {
      query.$expr = { $gt: ["$spots", "$filled"] };
    }

    const positions = await Position.find(query).sort({ createdAt: -1 });
    
    // Convert _id to id for frontend compatibility
    const formattedPositions = positions.map(p => {
      const obj = p.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    res.json({ message: 'Positions retrieved', data: formattedPositions, total: formattedPositions.length });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin/Faculty create a new position
router.post('/', mockAuth, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { type, title, department, course, faculty, description, requirements, hoursPerWeek, payRate, startDate, endDate, spots } = req.body;

    const position = new Position({
      type,
      title,
      department,
      course,
      faculty: faculty || req.user.name || 'Admin', // Default to current user's name if missing
      description,
      requirements: requirements || [],
      hoursPerWeek,
      payRate,
      startDate,
      endDate,
      spots: spots || 1,
      filled: 0
    });

    await position.save();
    
    const obj = position.toObject();
    obj.id = obj._id.toString();

    res.status(201).json({ message: 'Position created successfully', data: obj });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Admin/Faculty delete a position
router.delete('/:id', mockAuth, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

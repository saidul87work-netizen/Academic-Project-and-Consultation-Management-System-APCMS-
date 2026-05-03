import express from 'express';
import User from '../models/User.js';
import { mockAuth, requireRole } from '../middleware/mockAuth.js';

const router = express.Router();

/**
 * GET /api/users/search
 * Search for users by role and name
 */
router.get('/search', mockAuth, async (req, res) => {
  try {
    const { role, query } = req.query;
    
    let filter = {};
    if (role) {
      // Map frontend roles back to backend roles
      let dbRole = role.toUpperCase();
      if (dbRole === 'FACULTY') dbRole = 'ASSESSOR';
      filter.role = dbRole;
    }
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { universityId: { $regex: query, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).limit(10).select('name email role universityId');
    
    // Map back to frontend roles
    const mappedUsers = users.map(user => {
      let frontendRole = 'student';
      if (user.role === 'ASSESSOR') frontendRole = 'faculty';
      if (user.role === 'ADMIN') frontendRole = 'admin';
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: frontendRole,
        universityId: user.universityId
      };
    });

    res.json(mappedUsers);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

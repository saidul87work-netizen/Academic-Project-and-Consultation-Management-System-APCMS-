import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/model.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// Simplified Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Simplified registration
router.post('/register', async (req, res) => {
  const { name, email, password, roles, universityId } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name, email, passwordHash, roles: roles || ['student'], universityId: universityId || 'V-' + Date.now()
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, roles: user.roles }
  });
});

// Get Faculty
router.get('/faculty', protect, async (req, res) => {
  try {
    const faculty = await User.find({ roles: 'faculty' }).select('-passwordHash');
    res.json(faculty);
  } catch(e) {
    res.status(500).json({ message: 'Server error fetching faculty' });
  }
});

// Get STs
router.get('/sts', protect, async (req, res) => {
  try {
    const sts = await User.find({ roles: 'ST' }).select('-passwordHash');
    res.json(sts);
  } catch(e) {
    res.status(500).json({ message: 'Server error fetching STs' });
  }
});

export default router;

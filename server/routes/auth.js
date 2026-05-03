import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fixed admin credentials
    if (email === 'admin@admin.com' && password === 'admin123') {
      const token = jwt.sign({ id: 'admin-id' }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { id: 'admin-id', name: 'Admin', email: 'admin@admin.com', role: 'admin' } });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Map backend roles to frontend roles
    let frontendRole = 'student';
    if (user.role === 'ASSESSOR') frontendRole = 'faculty';
    if (user.role === 'ADMIN') frontendRole = 'admin';
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: frontendRole } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register (for testing, but in real app, restrict)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, universityId } = req.body;
    
    // Convert frontend role to backend role
    let dbRole = 'STUDENT';
    const roleUpper = role ? role.toUpperCase() : 'STUDENT';
    if (roleUpper === 'FACULTY' || roleUpper === 'ASSESSOR') dbRole = 'ASSESSOR';
    else if (roleUpper === 'ADMIN') dbRole = 'ADMIN';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: dbRole, universityId });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: role || 'student' }, message: 'User created' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Current user
router.get('/me', authenticate, (req, res) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

export default router;

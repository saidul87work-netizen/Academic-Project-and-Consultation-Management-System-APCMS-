import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { mockAuth, requireRole } from "./middleware/mockAuth.js";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import evaluationRoutes from "./routes/evaluations.js";
import multiLevelEvaluationRoutes from "./routes/multiLevelEvaluations.js";
import teamRoutes from "./routes/teams.js";
import calendarRoutes from "./routes/calendar.js";
import historyRoutes from "./routes/history.js";
import bookingRoutes from "./routes/bookings.js";
import positionRoutes from "./routes/positions.js";
import adminRoutes from "./routes/admin.js";
import reservationRoutes from "./routes/reservations.js";
import userRoutes from "./routes/users.js";
import Application from "./models/Application.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-management';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
process.env.PORT = process.env.PORT || '5000';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Management System Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ─── Applications Routes (inline) ─────────────────────────────────────────────
const applicationRoutes = express.Router();

const mockPositions = [
  { id: '1', type: 'TA' },
  { id: '2', type: 'RA' },
  { id: '3', type: 'ST' }
];

applicationRoutes.post('/', mockAuth, requireRole('student'), async (req, res) => {
  try {
    const { positionId, studentName, email, studentId, gpa, expertise, availability, experience, coverLetter } = req.body;
    const position = mockPositions.find(p => p.id === positionId);
    if (!position) return res.status(400).json({ message: 'Invalid position ID' });

    const application = new Application({
      student: req.user?.id || 'demo-student-1',
      positionId,
      positionType: position.type,
      studentName, email, studentId, gpa, expertise, availability, experience, coverLetter,
      status: 'pending',
      appliedAt: new Date()
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Application create error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

applicationRoutes.get('/', mockAuth, async (req, res) => {
  try {
    let applications;
    if (req.user?.role === 'admin' || req.user?.role === 'faculty') {
      applications = await Application.find().sort({ appliedAt: -1 });
    } else {
      applications = await Application.find({ student: req.user?.id || 'demo-student-1' }).sort({ appliedAt: -1 });
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

applicationRoutes.patch('/:id', mockAuth, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: status.toLowerCase(), reviewedBy: req.user?.id, reviewedAt: new Date() },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Route Registration ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/multilevel-evaluations', multiLevelEvaluationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// ─── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

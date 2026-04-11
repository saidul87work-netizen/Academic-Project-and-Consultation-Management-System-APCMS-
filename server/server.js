import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { mockAuth, requireRole } from "./middleware/mockAuth.js";
import authRoutes from "./routes/auth.js";

// Applications routes (inline for now)
const applicationRoutes = express.Router();
import Application from "./models/Application.js";

// Mock positions data to derive positionType from positionId
const mockPositions = [
  { id: '1', type: 'TA' },
  { id: '2', type: 'RA' },
  { id: '3', type: 'ST' }
];

// Apply for position (only students)
applicationRoutes.post('/', mockAuth, requireRole('student'), async (req, res) => {
  try {
    const { positionId, studentName, email, studentId, gpa, expertise, availability, experience, coverLetter } = req.body;

    // Derive positionType from positionId using mock positions data
    const position = mockPositions.find(p => p.id === positionId);
    if (!position) {
      return res.status(400).json({ message: 'Invalid position ID' });
    }

    const application = new Application({
      student: req.user?.id || 'demo-student-1',
      positionId,
      positionType: position.type,
      studentName,
      email,
      studentId,
      gpa,
      expertise,
      availability,
      experience,
      coverLetter,
      status: 'pending', // standardized lowercase
      appliedAt: new Date()
    });

    await application.save();
    console.log('Application saved to DB:', application._id);
    res.status(201).json(application);
  } catch (error) {
    console.error('Application create error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, details: error.errors });
  }
});

// Get applications
applicationRoutes.get('/', mockAuth, async (req, res) => {
  try {
    let applications;
    if (req.user?.role === 'admin' || req.user?.role === 'faculty') {
      applications = await Application.find().sort({ appliedAt: -1 });
    } else {
      applications = await Application.find({ student: (req.user?.id || 'demo-student-1') }).sort({ appliedAt: -1 });
    }
    res.json(applications);
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
applicationRoutes.patch('/:id', mockAuth, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: status.toLowerCase(), // ensure lowercase
        reviewedBy: req.user?.id || 'demo-admin-1',
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('Application routes created successfully');
import projectRoutes from "./routes/projects.js";
import evaluationRoutes from "./routes/evaluations.js";
import bookingRoutes from "./routes/bookings.js";
import positionRoutes from "./routes/positions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with fallback
dotenv.config({ path: path.join(__dirname, '.env') });

// Set default environment variables if not provided
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-management';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
process.env.PORT = process.env.PORT || '5000';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Management System Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
console.log('Registering applications route');
app.use('/api/applications', applicationRoutes);
console.log('Applications route registered');
app.use("/api/projects", projectRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/positions', positionRoutes);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();

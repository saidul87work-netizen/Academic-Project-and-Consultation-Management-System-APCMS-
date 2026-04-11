import express from 'express';

const router = express.Router();

// Mock positions based on types
const mockPositions = [
  {
    id: '1',
    type: 'TA',
    title: 'Teaching Assistant - Computer Science',
    department: 'Computer Science',
    course: 'CS101',
    faculty: 'Dr. Smith',
    description: 'Assist in teaching introductory computer science courses.',
    requirements: ['Basic programming knowledge', 'Good communication skills'],
    hoursPerWeek: 10,
    payRate: '$15/hour',
    startDate: '2024-01-01',
    endDate: '2024-05-01',
    spots: 5,
    filled: 2
  },
  {
    id: '2',
    type: 'RA',
    title: 'Research Assistant - AI Lab',
    department: 'Computer Science',
    faculty: 'Dr. Johnson',
    description: 'Assist in AI research projects.',
    requirements: ['Python programming', 'Machine learning knowledge'],
    hoursPerWeek: 20,
    payRate: '$18/hour',
    startDate: '2024-01-01',
    endDate: '2024-12-01',
    spots: 3,
    filled: 1
  },
  {
    id: '3',
    type: 'ST',
    title: 'Student Tutor - Math',
    department: 'Mathematics',
    faculty: 'Dr. Brown',
    description: 'Tutor undergraduate students in mathematics.',
    requirements: ['Strong math background', 'Tutoring experience'],
    hoursPerWeek: 15,
    payRate: '$14/hour',
    startDate: '2024-01-01',
    endDate: '2024-05-01',
    spots: 4,
    filled: 3
  }
];

router.get('/', (req, res) => {
  console.log('📋 POSITIONS API CALLED - Query:', req.query);
  const { type, available } = req.query;
  let positions = mockPositions;

  if (type && type !== 'all') {
    positions = positions.filter(p => p.type === type);
  }

  if (available === 'true') {
    positions = positions.filter(p => p.filled < p.spots);
  }

  console.log(`📋 RETURNING ${positions.length} POSITIONS`);
  res.json({ message: 'Positions retrieved', data: positions, total: positions.length });
});

export default router;

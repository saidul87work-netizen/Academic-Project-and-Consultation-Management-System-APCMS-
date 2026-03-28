import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMyConsultations,
  requestConsultation,
  getFacultySchedule,
  submitFeedback,
  updateConsultationStatus
} from '../controllers/consultationController.js';

const router = express.Router();

router.post('/request', protect, requestConsultation);
router.get('/my-consultations', protect, getMyConsultations);
router.get('/schedule', protect, getFacultySchedule);
router.put('/:id/feedback', protect, submitFeedback);
router.put('/:id', protect, updateConsultationStatus);

export default router;

import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import { mockAuth, requireRole } from '../middleware/mockAuth.js';

const router = express.Router();

// Helper to update overdue status
const updateOverdueEvents = async (projectId) => {
  const now = new Date();
  await CalendarEvent.updateMany(
    { 
      projectId, 
      dueDate: { $lt: now }, 
      status: 'upcoming' 
    },
    { $set: { status: 'overdue' } }
  );
};

// POST /api/calendar/:projectId -> create event
router.post('/:projectId', mockAuth, async (req, res) => {
  try {
    const { title, type, description, dueDate, assignedTo, teamId, createdByName } = req.body;
    const event = new CalendarEvent({
      projectId: req.params.projectId,
      teamId,
      title,
      type,
      description,
      dueDate,
      createdBy: req.user.id,
      createdByName: createdByName || '',
      assignedTo,
      status: 'upcoming'
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/calendar/:projectId -> get all events
router.get('/:projectId', mockAuth, async (req, res) => {
  try {
    await updateOverdueEvents(req.params.projectId);
    const events = await CalendarEvent.find({ projectId: req.params.projectId }).sort({ dueDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/calendar/:projectId/:eventId -> update event
router.put('/:projectId/:eventId', mockAuth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const event = await CalendarEvent.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/calendar/:projectId/:eventId -> delete event
router.delete('/:projectId/:eventId', mockAuth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await CalendarEvent.findByIdAndDelete(req.params.eventId);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/calendar/:projectId/:eventId/status -> update status
router.patch('/:projectId/:eventId/status', mockAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const event = await CalendarEvent.findByIdAndUpdate(req.params.eventId, { status }, { new: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/reservations
// @desc    Get all reservations (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, date, userId, status } = req.query;
    
    let filter = {};
    
    if (type) filter.type = type;
    if (date) filter.date = new Date(date);
    if (status) filter.status = status;
    
    // Students can only see their own reservations
    if (req.user.role === 'student') {
      filter.userId = req.user.id;
    } else if (userId) {
      filter.userId = userId;
    }

    const reservations = await Reservation.find(filter)
      .populate('userId', 'name email studentId')
      .sort({ date: -1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get single reservation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'name email studentId');

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }

    // Students can only view their own reservations
    if (req.user.role === 'student' && reservation.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to view this reservation' 
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   POST /api/reservations
// @desc    Create new reservation
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      type,
      resourceName,
      date,
      startTime,
      endTime,
      purpose,
      attendees,
      notes
    } = req.body;

    // Check for conflicting reservations
    const conflictingReservation = await Reservation.findOne({
      resourceName,
      date: new Date(date),
      status: { $ne: 'Cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingReservation) {
      return res.status(400).json({ 
        success: false, 
        error: 'This resource is already booked for the selected time slot' 
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      type,
      resourceName,
      date: new Date(date),
      startTime,
      endTime,
      purpose,
      attendees: attendees || 1,
      notes,
      status: 'Confirmed'
    });

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update reservation
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }

    // Only admin or the user who created it can update
    if (req.user.role !== 'admin' && reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to update this reservation' 
      });
    }

    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Cancel/delete reservation
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }

    // Only admin or the user who created it can cancel
    if (req.user.role !== 'admin' && reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to cancel this reservation' 
      });
    }

    // Instead of deleting, mark as cancelled
    reservation.status = 'Cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// @route   GET /api/reservations/check-availability
// @desc    Check if resource is available
// @access  Private
router.get('/check-availability', protect, async (req, res) => {
  try {
    const { resourceName, date, startTime, endTime } = req.query;

    if (!resourceName || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide resourceName, date, startTime, and endTime' 
      });
    }

    const conflictingReservation = await Reservation.findOne({
      resourceName,
      date: new Date(date),
      status: { $ne: 'Cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    res.status(200).json({
      success: true,
      available: !conflictingReservation,
      conflict: conflictingReservation ? {
        startTime: conflictingReservation.startTime,
        endTime: conflictingReservation.endTime,
        userName: conflictingReservation.userName
      } : null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;

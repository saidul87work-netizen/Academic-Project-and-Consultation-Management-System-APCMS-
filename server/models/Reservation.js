const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['desk', 'lab', 'meeting-room'],
    required: true
  },
  resourceName: {
    type: String,
    required: true // e.g., "Desk A1", "Computer Lab 3", "Meeting Room B"
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // e.g., "09:00"
  },
  endTime: {
    type: String,
    required: true // e.g., "11:00"
  },
  purpose: {
    type: String,
    required: true
  },
  attendees: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },
  calendarEventId: {
    type: String // Google Calendar event ID
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for checking availability
reservationSchema.index({ resourceName: 1, date: 1, startTime: 1, endTime: 1 });

// Update timestamp before saving
reservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);

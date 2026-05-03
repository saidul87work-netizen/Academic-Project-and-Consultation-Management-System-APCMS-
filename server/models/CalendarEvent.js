import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['task', 'submission_deadline', 'defense', 'checkpoint'],
    default: 'task' 
  },
  description: { type: String },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, default: '' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // empty = all
  status: { 
    type: String, 
    enum: ['upcoming', 'completed', 'overdue'],
    default: 'upcoming' 
  }
}, { timestamps: true });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;

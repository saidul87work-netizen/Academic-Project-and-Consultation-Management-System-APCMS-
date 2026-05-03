import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Booking from '../models/Booking.js';
import Evaluation from '../models/Evaluation.js';
import Position from '../models/Position.js';

const router = express.Router();

router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaculty = await User.countDocuments({ role: 'ASSESSOR' });
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const pendingApprovals = await Application.countDocuments({ status: { $in: ['pending', 'PENDING'] } });
    
    // Bookings today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const roomsBooked = await Booking.countDocuments({
      startTime: { $gte: startOfDay, $lte: endOfDay }
    });

    const openPositions = await Position.countDocuments({ $expr: { $gt: ["$spots", "$filled"] } });
    const totalProjects = await Project.countDocuments();

    // Fetch recent activity
    const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(2);
    const recentApps = await Application.find().sort({ appliedAt: -1 }).limit(2);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(2);

    let activity = [];
    recentProjects.forEach(p => {
      activity.push({
        id: `proj-${p._id}`,
        text: `New project submitted by ${p.studentName || 'student'}`,
        time: p.createdAt || new Date(),
        type: 'project'
      });
    });
    recentApps.forEach(a => {
      activity.push({
        id: `app-${a._id}`,
        text: `${a.studentName || 'A student'} applied for ${a.positionType || 'a'} position`,
        time: a.appliedAt || new Date(),
        type: 'position'
      });
    });
    recentUsers.forEach(u => {
      activity.push({
        id: `usr-${u._id}`,
        text: `New user registered: ${u.name} (${u.role === 'ASSESSOR' ? 'Faculty' : 'Student'})`,
        time: u.createdAt || new Date(),
        type: 'user'
      });
    });

    activity.sort((a, b) => new Date(b.time) - new Date(a.time));
    activity = activity.slice(0, 5).map(a => {
      const diffMs = new Date() - new Date(a.time);
      const diffMins = Math.max(0, Math.round(diffMs / 60000));
      let timeStr = `${diffMins} min ago`;
      if (diffMins > 60) timeStr = `${Math.round(diffMins/60)} hr ago`;
      if (diffMins > 1440) timeStr = `${Math.round(diffMins/1440)} days ago`;
      if (diffMins < 1) timeStr = `just now`;

      return {
        id: a.id,
        text: a.text,
        time: timeStr,
        type: a.type
      };
    });

    res.json({
      totalUsers,
      totalFaculty,
      totalStudents,
      pendingApprovals,
      roomsBooked,
      openPositions,
      totalProjects,
      recentActivity: activity.length ? activity : [
        { id: 1, text: "System initialized. Waiting for new activity.", time: "just now", type: "system" }
      ]
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

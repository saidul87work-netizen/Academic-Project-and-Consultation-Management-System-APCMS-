import express from 'express';
import Team from '../models/Team.js';
import Message from '../models/Message.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { mockAuth } from '../middleware/mockAuth.js';
import { logProjectHistory } from '../utils/historyLogger.js';

const router = express.Router();

// Middleware to check if user is in team
const isTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    
    const member = team.members.find(m => m.studentId.toString() === req.user.id.toString() && m.status === 'active');
    if (!member) return res.status(403).json({ error: 'Not an active member of this team' });
    
    req.team = team;
    req.currentMember = member;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/teams/create
router.post('/create', mockAuth, async (req, res) => {
  try {
    const { projectId, teamName } = req.body;
    const existingTeam = await Team.findOne({ projectId });
    if (existingTeam) return res.status(400).json({ error: 'Team already exists for this project' });

    const team = new Team({
      projectId,
      teamName,
      members: [{
        studentId: req.user.id,
        role: 'leader',
        status: 'active'
      }]
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:teamId/add-member
router.post('/:teamId/add-member', mockAuth, isTeamMember, async (req, res) => {
  try {
    if (req.currentMember.role !== 'leader') return res.status(403).json({ error: 'Only leader can add members' });
    
    const { email, studentId } = req.body;
    let user;
    if (email) user = await User.findOne({ email });
    else user = await User.findById(studentId);

    if (!user) return res.status(404).json({ error: 'Student not found' });
    
    const alreadyMember = req.team.members.find(m => m.studentId.toString() === user._id.toString());
    if (alreadyMember) {
      if (alreadyMember.status === 'active') return res.status(400).json({ error: 'Already a member' });
      alreadyMember.status = 'active'; // Re-activate
    } else {
      req.team.members.push({ studentId: user._id, role: 'member', status: 'active' });
    }

    await req.team.save();
    res.json(req.team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/teams/:teamId/remove-member/:studentId
router.delete('/:teamId/remove-member/:studentId', mockAuth, isTeamMember, async (req, res) => {
  try {
    if (req.currentMember.role !== 'leader') return res.status(403).json({ error: 'Only leader can remove members' });
    
    const member = req.team.members.find(m => m.studentId.toString() === req.params.studentId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    member.status = 'removed';
    await req.team.save();
    res.json(req.team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/:teamId
router.get('/:teamId', mockAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('members.studentId', 'name email');
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/by-user - Get all teams the current user is an active member of
router.get('/by-user', mockAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await Team.find({
      'members': { $elemMatch: { studentId: userId, status: 'active' } }
    })
      .populate('members.studentId', 'name email universityId')
      .populate('projectId', 'title department studentName status stage');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/project/:projectId
router.get('/project/:projectId', mockAuth, async (req, res) => {
  try {
    const team = await Team.findOne({ projectId: req.params.projectId }).populate('members.studentId', 'name email universityId');
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:teamId/message
router.post('/:teamId/message', mockAuth, async (req, res) => {
  try {
    // Faculty/Admin can post messages without being a team member
    let team;
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      team = await Team.findById(req.params.teamId);
      if (!team) return res.status(404).json({ error: 'Team not found' });
      const member = team.members.find(m => m.studentId.toString() === req.user.id.toString() && m.status === 'active');
      if (!member) return res.status(403).json({ error: 'Not an active member of this team' });
    } else {
      team = await Team.findById(req.params.teamId);
      if (!team) return res.status(404).json({ error: 'Team not found' });
    }
    const user = await User.findById(req.user.id);
    const message = new Message({
      teamId: req.params.teamId,
      senderId: req.user.id,
      senderName: user.name,
      content: req.body.content
    });
    await message.save();
    team.sharedMessages.push(message._id);
    await team.save();

    // Log history
    await logProjectHistory({
      projectId: team.projectId,
      actorId: req.user.id,
      actorRole: req.user.role === 'faculty' ? 'faculty' : req.user.role === 'admin' ? 'admin' : 'student',
      action: 'submitted',
      details: `Posted a message in team chat`,
      metadata: { messageId: message._id }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/:teamId/messages
router.get('/:teamId/messages', mockAuth, async (req, res) => {
  try {
    // Faculty/Admin can read messages without being a team member
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      const team = await Team.findById(req.params.teamId);
      if (!team) return res.status(404).json({ error: 'Team not found' });
      const member = team.members.find(m => m.studentId.toString() === req.user.id.toString() && m.status === 'active');
      if (!member) return res.status(403).json({ error: 'Not an active member of this team' });
    }
    const messages = await Message.find({ teamId: req.params.teamId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:teamId/submission
router.post('/:teamId/submission', mockAuth, isTeamMember, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const submission = new Submission({
      teamId: req.params.teamId,
      studentId: req.user.id,
      studentName: user.name,
      title: req.body.title,
      fileUrl: req.body.fileUrl,
      link: req.body.link,
      stage: req.body.stage
    });
    await submission.save();
    req.team.sharedSubmissions.push(submission._id);
    await req.team.save();

    // Log history
    await logProjectHistory({
      projectId: req.team.projectId,
      actorId: req.user.id,
      actorRole: 'student',
      action: 'submitted',
      details: `Submitted ${submission.title} for ${submission.stage}`,
      metadata: { submissionId: submission._id, stage: submission.stage }
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/:teamId/submissions
router.get('/:teamId/submissions', mockAuth, isTeamMember, async (req, res) => {
  try {
    const submissions = await Submission.find({ teamId: req.params.teamId }).sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teams/:teamId/feedback — open to all authenticated users
router.get('/:teamId/feedback', mockAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    return res.json(team.supervisorFeedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teams/:teamId/feedback (For supervisors)
router.post('/:teamId/feedback', mockAuth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') return res.status(403).json({ error: 'Only faculty/admin can post feedback' });
    
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.supervisorFeedback.push({
      supervisorId: req.user.id,
      supervisorName: req.body.supervisorName || 'Faculty',
      stage: req.body.stage || '',
      message: req.body.message,
      visibleToAll: req.body.visibleToAll !== false
    });
    await team.save();

    // Log history
    await logProjectHistory({
      projectId: team.projectId,
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'feedback_given',
      details: `Gave feedback to the team${req.body.stage ? ' at stage: ' + req.body.stage : ''}`,
      metadata: { teamId: team._id }
    });

    res.status(201).json(team.supervisorFeedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

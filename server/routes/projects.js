import express from "express";
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { mockAuth, requireRole } from "../middleware/mockAuth.js";

const router = express.Router();

// Test endpoint to verify routing works
router.get("/test", (req, res) => {
  console.log('🧪 TEST ENDPOINT CALLED');
  res.json({ message: "Project routes working", timestamp: new Date().toISOString() });
});

/**
 * POST /api/projects
 * Create a new project (faculty only)
 */
router.post("/", mockAuth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    console.log('📝 CREATING PROJECT');
    const {
      title,
      description,
      studentName,
      studentId,
      supervisorName,
      department,
      startDate,
      expectedEndDate,
      stage,
      assignSelfAsSupervisor = false
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    // Create project data
    const projectData = {
      title: title.trim(),
      description: description.trim(),
      createdBy: req.user.id,
      members: [req.user.id],
      studentName: studentName || 'Unknown Student',
      studentId: studentId,
      supervisorName: supervisorName || (assignSelfAsSupervisor ? req.user.name : 'TBD'),
      supervisor: assignSelfAsSupervisor ? req.user.id : null,
      department: department || 'General',
      startDate: startDate || new Date(),
      expectedEndDate: expectedEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      stage: stage || 'Proposal',
      status: "draft"
    };

    const project = await Project.create(projectData);
    res.status(201).json({ success: true, data: project });

  } catch (error) {
    console.error('❌ PROJECT CREATION FAILED:', error);
    res.status(500).json({ success: false, error: 'Failed to create project', details: error.message });
  }
});

/**
 * GET /api/projects/mine
 * Get user's projects, including team-linked projects
 */
router.get("/mine", mockAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`🔍 SERVER: Fetching projects for user: ${userId}, Role: ${userRole}`);

    let query = {
      $or: [
        { createdBy: userId },
        { members: userId },
        { student: userId }
      ]
    };

    // If student, also search by their unique academic ID and name
    if (userRole === 'student') {
      const user = await User.findById(userId);
      if (user) {
        if (user.universityId) query.$or.push({ studentId: user.universityId });
        if (user.name) query.$or.push({ studentName: user.name });
      }

      // Also find projects linked via Team membership
      const userTeams = await Team.find({
        'members': { $elemMatch: { studentId: userId, status: 'active' } }
      });
      const teamProjectIds = userTeams.map(t => t.projectId);
      if (teamProjectIds.length > 0) {
        query.$or.push({ _id: { $in: teamProjectIds } });
      }
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    console.log(`✅ SERVER: Found ${projects.length} projects for user ${userId}`);

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('❌ SERVER: Failed to get user projects:', error);
    res.status(500).json({ success: false, error: 'Failed to get projects' });
  }
});

/**
 * GET /api/projects
 * Get all projects (faculty/admin only)
 */
router.get("/", mockAuth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    console.log(`📋 RETRIEVED ${projects.length} PROJECTS FROM MONGODB`);

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('❌ FAILED TO GET ALL PROJECTS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get projects'
    });
  }
});

/**
 * GET /api/projects/:id
 * Get single project by ID
 */
router.get('/:id', mockAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check authorization - user must be creator, member, or faculty/admin
    const userId = req.user.id;
    const isAuthorized =
      project.createdBy === userId ||
      project.members.includes(userId) ||
      ['faculty', 'admin'].includes(req.user.role);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', mockAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check authorization
    const userId = req.user.id;
    const isAuthorized =
      project.createdBy === userId ||
      project.members.includes(userId) ||
      ['faculty', 'admin'].includes(req.user.role);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this project'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:id', mockAuth, requireRole('admin'), async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log(`🗑️ SERVER: Delete attempt by user ${req.user.id} with role ${req.user.role} for project ${projectId}`);
    
    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      console.log(`❌ SERVER: Project not found: ${projectId}`);
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    console.log(`✅ SERVER: Project deleted: ${projectId}`);
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('❌ SERVER: Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/projects/:id/supervisor/me
 * Set current faculty as supervisor (faculty only)
 */
router.patch("/:id/supervisor/me", mockAuth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    console.log(`👨‍🏫 FACULTY ${userId} SETTING SELF AS SUPERVISOR FOR PROJECT ${projectId}`);

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is authorized (must be creator or member)
    if (project.createdBy !== userId && !project.members.includes(userId)) {
      return res.status(403).json({
        error: 'Not authorized. You must be the creator or a member of this project.'
      });
    }

    // Update supervisor
    project.supervisor = userId;
    await project.save();

    console.log('✅ SUPERVISOR SET SUCCESSFULLY');

    res.status(200).json({
      success: true,
      message: 'Successfully set as supervisor',
      data: project
    });

  } catch (error) {
    console.error('❌ SET SUPERVISOR FAILED:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set supervisor',
      details: error.message
    });
  }
});

/**
 * PATCH /api/projects/:id/evaluate
 * Evaluate project (faculty only - must be supervisor)
 */
router.patch("/:id/evaluate", mockAuth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { marks, remarks, status } = req.body;

    console.log(`📊 FACULTY ${userId} EVALUATING PROJECT ${projectId}`);

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the supervisor
    if (project.supervisor !== userId) {
      return res.status(403).json({
        error: 'Not authorized. You must be the supervisor of this project.'
      });
    }

    // Validate marks
    if (marks === undefined || marks < 0 || marks > 100) {
      return res.status(400).json({ error: 'Marks must be between 0 and 100' });
    }

    // Create evaluation
    const evaluation = {
      evaluatedBy: userId,
      marks: Number(marks),
      remarks: remarks || '',
      evaluatedAt: new Date()
    };

    // Update project
    project.evaluation = evaluation;
    if (status) {
      project.status = status; // Optional status update
    }

    await project.save();

    console.log('✅ PROJECT EVALUATED SUCCESSFULLY');

    res.status(200).json({
      success: true,
      message: 'Project evaluated successfully',
      data: project
    });

  } catch (error) {
    console.error('❌ PROJECT EVALUATION FAILED:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate project',
      details: error.message
    });
  }
});

export default router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProjects, createProject, getProjectById } = require('../controllers/projectController');

// @route   GET /api/projects
// @desc    Get all projects (with filtering)
// @access  Public
router.get('/', getProjects);

// @route   POST /api/projects
// @desc    Create a project
// @access  Public (AUTH TEMPORARILY DISABLED)
router.post('/', createProject);

// @route   GET /api/projects/my/active
// @desc    Get active workspace projects for user
// @access  Public (AUTH TEMPORARILY DISABLED)
router.get('/my/active', require('../controllers/projectController').getMyActiveProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', getProjectById);

// @route   POST /api/projects/:id/apply
// @desc    Apply to a project
// @access  Public (AUTH TEMPORARILY DISABLED)
router.post('/:id/apply', require('../controllers/projectController').applyToProject);

// @route   POST /api/projects/:id/applications/:appId/status
// @desc    Accept/reject application
// @access  Public (AUTH TEMPORARILY DISABLED)
router.post('/:id/applications/:appId/status', require('../controllers/projectController').updateApplicationStatus);

// @route   GET /api/projects/:id/workspace
// @desc    Get project workspace (tasks, etc)
// @access  Public (AUTH TEMPORARILY DISABLED)
router.get('/:id/workspace', require('../controllers/projectController').getWorkspace);

// @route   POST /api/projects/:id/tasks
// @desc    Create a task
// @access  Public (AUTH TEMPORARILY DISABLED)
router.post('/:id/tasks', require('../controllers/projectController').createTask);

// @route   PUT /api/projects/:id/tasks/:taskId
// @desc    Update task status
// @access  Public (AUTH TEMPORARILY DISABLED)
router.put('/:id/tasks/:taskId', require('../controllers/projectController').updateTaskStatus);

// @route   PUT /api/projects/:id/milestones/:milestoneId
// @desc    Toggle milestone
// @access  Public (AUTH TEMPORARILY DISABLED)
router.put('/:id/milestones/:milestoneId', require('../controllers/projectController').toggleMilestoneStatus);

module.exports = router;

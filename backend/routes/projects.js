const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProjects, createProject, getProjectById,
  updateProject, deleteProject, deleteTask
} = require('../controllers/projectController');

// @route   GET /api/projects
// @desc    Get all projects (with filtering)
// @access  Public
router.get('/', getProjects);

// @route   POST /api/projects
// @desc    Create a project
// @access  Private
router.post('/', auth, createProject);

// @route   GET /api/projects/my/active
// @desc    Get active workspace projects for user
// @access  Private
router.get('/my/active', auth, require('../controllers/projectController').getMyActiveProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', getProjectById);

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', auth, updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, deleteProject);

// @route   POST /api/projects/:id/apply
// @desc    Apply to a project
// @access  Private
router.post('/:id/apply', auth, require('../controllers/projectController').applyToProject);

// @route   POST /api/projects/:id/applications/:appId/status
// @desc    Accept/reject application
// @access  Private
router.post('/:id/applications/:appId/status', auth, require('../controllers/projectController').updateApplicationStatus);

// @route   GET /api/projects/:id/workspace
// @desc    Get project workspace (tasks, etc)
// @access  Private
router.get('/:id/workspace', auth, require('../controllers/projectController').getWorkspace);

// @route   POST /api/projects/:id/tasks
// @desc    Create a task
// @access  Private
router.post('/:id/tasks', auth, require('../controllers/projectController').createTask);

// @route   PUT /api/projects/:id/tasks/:taskId
// @desc    Update task status
// @access  Private
router.put('/:id/tasks/:taskId', auth, require('../controllers/projectController').updateTaskStatus);

// @route   DELETE /api/projects/:id/tasks/:taskId
// @desc    Delete a task
// @access  Private
router.delete('/:id/tasks/:taskId', auth, deleteTask);

// @route   PUT /api/projects/:id/milestones/:milestoneId
// @desc    Toggle milestone
// @access  Private
router.put('/:id/milestones/:milestoneId', auth, require('../controllers/projectController').toggleMilestoneStatus);

module.exports = router;

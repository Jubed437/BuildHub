const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/users/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private
router.get('/profile/:id', auth, userController.getUserProfile);

// @route   PUT /api/users/profile/:id
// @desc    Update user profile
// @access  Private
router.put('/profile/:id', auth, userController.updateUserProfile);

// @route   GET /api/users/recommendations
// @desc    Get ML-based user recommendations
// @access  Private
router.get('/recommendations', auth, userController.getRecommendations);

// @route   GET /api/users/search
// @desc    Search users by name or skill
// @access  Private
router.get('/search', auth, userController.searchUsers);

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard top users
// @access  Private
router.get('/leaderboard', auth, userController.getLeaderboard);

module.exports = router;

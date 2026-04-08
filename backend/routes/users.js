const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/users/me
// @desc    Get the current active user (for guest mode)
// @access  Public
router.get('/me', userController.getCurrentUser);

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Public
router.get('/profile/:id', userController.getUserProfile);

// @route   PUT /api/users/profile/:id
// @desc    Update user profile
// @access  Public
router.put('/profile/:id', userController.updateUserProfile);

// @route   GET /api/users/recommendations
// @desc    Get ML-based user recommendations
// @access  Public
router.get('/recommendations', userController.getRecommendations);

// @route   GET /api/users/search
// @desc    Search users by name or skill
// @access  Public
router.get('/search', userController.searchUsers);

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard top users
// @access  Public
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;

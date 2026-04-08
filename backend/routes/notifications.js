const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to get guest user id when no auth
const getRecipientId = async (req) => {
    if (req.user && req.user.id) return req.user.id;
    const guest = await User.findOne().sort({ createdAt: 1 }).select('_id');
    return guest ? guest._id.toString() : null;
};

// GET /api/notifications — get all notifications for the current user
router.get('/', async (req, res) => {
    try {
        const userId = await getRecipientId(req);
        const notifications = await Notification.find({ recipient: userId })
            .populate('project', 'title')
            .populate('sender', '_id name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PATCH /api/notifications/:id/read — mark a notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', async (req, res) => {
    try {
        const userId = await getRecipientId(req);
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

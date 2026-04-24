const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications — get all notifications for the current user
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
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
router.patch('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;

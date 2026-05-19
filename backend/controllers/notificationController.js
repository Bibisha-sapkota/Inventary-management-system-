const Notification = require('../models/Notification');

// @desc    Get all notifications for the user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        let query = { user: req.user._id };
        
        // Note: Superadmin now only sees notifications specifically assigned to them 
        // to keep their dashboard clean from individual admin activity.

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to create notifications internally
exports.createNotificationInternal = async (userId, title, message, type = 'info', category = 'system') => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            category
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Helper function to notify all superadmins
exports.notifySuperadmins = async (title, message, type = 'info', category = 'system') => {
    try {
        const User = require('../models/User');
        const superadmins = await User.find({ role: 'superadmin' });
        
        const notifications = superadmins.map(sa => ({
            user: sa._id,
            title,
            message,
            type,
            category
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        console.error('Error notifying superadmins:', error);
    }
};

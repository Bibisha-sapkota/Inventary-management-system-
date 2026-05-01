const ActivityLog = require('../models/ActivityLog');

// @desc    Get unified activity history from logs
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const { limit = 50, action, entityType } = req.query;
        const query = { user: req.user._id };

        if (action) query.action = action;
        if (entityType) query.entityType = entityType;

        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        // Format for frontend
        const formattedLogs = logs.map(log => ({
            id: log._id,
            action: log.action,
            type: log.entityType.toLowerCase(), // frontend expectation
            title: log.entityName,
            detail: log.details,
            date: log.createdAt,
            meta: log.metadata
        }));

        res.status(200).json({
            success: true,
            count: formattedLogs.length,
            data: formattedLogs
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getHistory };

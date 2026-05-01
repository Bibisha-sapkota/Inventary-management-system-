const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Superadmin only)
exports.updateSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create(req.body);
        } else {
            settings = await SystemSettings.findOneAndUpdate({}, req.body, {
                new: true,
                runValidators: true
            });
        }
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

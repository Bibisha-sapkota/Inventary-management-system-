const SystemSettings = require('../models/SystemSettings');
const User = require('../models/User');
const Notification = require('../models/Notification');

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

        // Send Global Notification if banner was updated
        if (req.body.discountBanner || req.body.bannerTitle) {
            const customers = await User.find({ role: 'customer' });
            const notifications = customers.map(c => ({
                user: c._id,
                title: req.body.bannerTitle || "New Promotion!",
                message: "A new special discount banner has been published. Check your dashboard!",
                type: "Promotion"
            }));
            await Notification.insertMany(notifications);
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

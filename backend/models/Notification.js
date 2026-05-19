const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'Promotion'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['stock', 'order', 'invoice', 'system', 'customer', 'supplier', 'product'],
        default: 'system'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'SALE']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['Product', 'Order', 'Customer', 'Supplier', 'Invoice', 'Lot', 'Exchange']
    },
    entityId: {
        type: String,
        required: true
    },
    entityName: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexing for faster history lookups
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);

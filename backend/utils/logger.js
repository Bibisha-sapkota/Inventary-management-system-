const ActivityLog = require('../models/ActivityLog');

/**
 * Logs an activity to the database
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Type of action (CREATE, UPDATE, DELETE, etc.)
 * @param {string} entityType - The model being affected (Product, Order, etc.)
 * @param {string} entityId - ID of the affected entity
 * @param {string} entityName - Helpful name of the entity (e.g. Product Name)
 * @param {string} details - Human readable description of the change
 * @param {object} metadata - Optional additional data
 */
const logActivity = async (userId, action, entityType, entityId, entityName, details, metadata = {}) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            entityType,
            entityId: String(entityId),
            entityName,
            details,
            metadata
        });
    } catch (error) {
        console.error('❌ Failed to log activity:', error.message);
    }
};

module.exports = { logActivity };

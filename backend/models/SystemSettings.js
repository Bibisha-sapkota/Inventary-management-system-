const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    lowStockThreshold: { type: Number, default: 10 },
    taxRate: { type: Number, default: 13 },
    defaultDiscount: { type: Number, default: 0 },
    currency: { type: String, default: 'Rs.' },
    appName: { type: String, default: 'Stock Inventory' },
    // Add other global defaults here
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

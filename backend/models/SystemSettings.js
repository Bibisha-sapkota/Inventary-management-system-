const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    darkMode: { type: Boolean, default: false },
    lowStockAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
    taxRate: { type: Number, default: 13 },
    defaultDiscount: { type: Number, default: 0 },
    privacyMode: { type: Boolean, default: false },
    hideCustomerContacts: { type: Boolean, default: false },
    passwordForExports: { type: Boolean, default: true },
    showNotificationDetails: { type: Boolean, default: true },
    automaticBackups: { type: Boolean, default: false },
    currency: { type: String, default: 'Rs.' },
    appName: { type: String, default: 'Stock Inventory' },
    discountBanner: { type: String, default: '' },
    bannerTitle: { type: String, default: '' },
    // Add other global defaults here
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

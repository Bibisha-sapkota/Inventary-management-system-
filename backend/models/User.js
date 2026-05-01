const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Compare को लागि मात्र चाहिन्छ

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Default मा पासवर्ड नदिने
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'superadmin'],
        default: 'customer'
    },
    phone: { type: String, default: '' },
    sno: { type: String, default: '' },
    status: { type: String, default: 'active' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isGoogleUser: { type: Boolean, default: false },
    googleId: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    settings: {
        darkMode: { type: Boolean, default: false },
        lowStockAlerts: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        lowStockThreshold: { type: Number, default: 10 },
        hideCustomerContacts: { type: Boolean, default: false },
        requirePasswordForExport: { type: Boolean, default: false },
        showNotificationDetails: { type: Boolean, default: true },
        autoBackup: { type: Boolean, default: false },
    },
    
    // OTP Fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

// =======================================================
// ⚠️ IMPORTANT: यहाँ भएको pre('save') कोड हटाउनुहोस् वा Comment गर्नुहोस्
// किनकि हामीले AuthController मा म्यानुअली Hash गरिसक्यौँ।
// =======================================================

/*
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
*/

// यो चाहिँ चाहिन्छ (Login को बेला Password Check गर्न)
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
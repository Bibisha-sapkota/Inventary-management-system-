const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['forgot-password', 'login', 'register'],
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto delete after 10 minutes
    }
});

otpSchema.methods.isExpired = function() {
    return Date.now() > this.expiresAt;
};

module.exports = mongoose.model('OTP', otpSchema);
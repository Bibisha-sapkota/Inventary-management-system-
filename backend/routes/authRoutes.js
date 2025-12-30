const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');

const {
    signup,
    login,
    updateUserRole, // ⚠️ New
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword
} = require('../controllers/authController');

// Standard Auth
router.post('/signup', signup);
router.post('/login', login);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected Routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/update-role', protect, updateUserRole); // ⚠️ New Route

// Google Auth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
        session: false 
    }),
    (req, res) => {
        const token = require('jsonwebtoken').sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // ⚠️ Check if user is NEW (Created within last 30 seconds)
        const isNewUser = req.user.createdAt > new Date(Date.now() - 30 * 1000);

        const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar
        }));

        // Send isNew flag to frontend
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}&user=${userData}&isNew=${isNewUser}`);
    }
);

module.exports = router;
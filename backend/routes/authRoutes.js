const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    signup,
    login,
    updateUserRole,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updateSettings,
    resetData,
    getAllUsers,
    deleteUser,
    updateAnyUserRole,
    updateUserStatus
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
router.put('/update-role', protect, updateUserRole);
router.put('/settings', protect, updateSettings);
router.delete('/reset-data', protect, resetData);

// Superadmin Routes
router.get('/users', protect, authorize('superadmin'), getAllUsers);
router.delete('/users/:id', protect, authorize('superadmin'), deleteUser);
router.put('/users/:id/role', protect, authorize('superadmin'), updateAnyUserRole);
router.put('/users/:id/status', protect, authorize('superadmin'), updateUserStatus);

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
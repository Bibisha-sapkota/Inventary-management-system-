const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Supplier = require('../models/Supplier');
const SupplierLot = require('../models/SupplierLot');
const Notification = require('../models/Notification');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Please add all fields' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'You are blocked by superadmin' });
        }
        if (!user.password) return res.status(400).json({ message: 'Please use "Continue with Google"' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Send Welcome Email (Optional/Non-blocking)
            try {
                sendEmail({
                    email: user.email,
                    subject: 'Welcome to Stock Inventory',
                    message: `Hi ${user.name}, Welcome to Stock Inventory. You have successfully logged in.`,
                    html: `
                        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                            <div style="background-color: #2563eb; padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚀 Welcome back!</h1>
                            </div>
                            <div style="padding: 30px; color: #475569;">
                                <p style="font-size: 16px; margin-top: 0;">Hello <strong>${user.name}</strong>,</p>
                                <p style="font-size: 15px; line-height: 1.6;">Welcome back to the <strong>Stock Inventory System</strong>. Your dashboard is ready for you to manage products, track orders, and analyze your business flow.</p>
                                
                                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
                                    <p style="margin: 0; font-size: 14px;"><strong>Account:</strong> ${user.email}</p>
                                    <p style="margin: 10px 0 0; font-size: 14px;"><strong>Status:</strong> Successfully Logged In</p>
                                </div>

                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
                                </div>
                            </div>
                            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                                <p style="margin: 0;">Stock Inventory System © 2024</p>
                                <p style="margin: 5px 0 0;">If this wasn't you, please secure your account immediately.</p>
                            </div>
                        </div>
                    `
                }).catch(err => console.log('Welcome Email Error:', err.message));
            } catch (err) {
                console.log('Email skip:', err.message);
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route PUT /api/auth/update-role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        // Security Check
        if (role !== 'admin' && role !== 'customer' && role !== 'superadmin') {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = role;
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash and Save OTP
        const salt = await bcrypt.genSalt(10);
        user.resetPasswordToken = await bcrypt.hash(otp, salt);
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes
        await user.save();
        
        // 1. Plain Text Message (Fallback)
        const message = `Dear User, Your Verification OTP is: ${otp}. It expires in 10 minutes.`;

        // 2. HTML Message (Professional Design)
        const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ea580c; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Grocery Stock Inventory</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6;">
                <p>Dear User,</p>
                <p>We detected a request to reset the password associated with your account on the <strong>Grocery Inventory Management System</strong>.</p>
                <p>To proceed securely, please verify your identity using the One-Time Password (OTP) below:</p>
                
                <div style="background-color: #f8f9fa; border-left: 5px solid #ea580c; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2d3748;">
                        🔐 Verification OTP: <span style="color: #ea580c; letter-spacing: 2px; font-size: 22px;">${otp}</span>
                    </p>
                </div>

                <p>⏳ <strong>Validity:</strong> This OTP will expire in <strong>10 minutes</strong> for security reasons.</p>
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                <p style="font-size: 14px; color: #666;">
                    If you did not initiate this request, please disregard this email. Your account will remain secure.<br>
                    However, if you believe this activity is suspicious, we strongly recommend contacting our support team immediately.
                </p>
                <p style="font-size: 14px; color: #666;">For your protection, never share this OTP with anyone.</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                <p style="margin: 0;">Kind regards,</p>
                <p style="margin: 5px 0; font-weight: bold; color: #555;">Security & Compliance Team</p>
                <p style="margin: 0;">Grocery Inventory Management System</p>
                <p style="margin-top: 10px;">
                    📧 <a href="mailto:support@grocerysystem.com" style="color: #ea580c; text-decoration: none;">support@grocerysystem.com</a>
                </p>
            </div>
        </div>
        `;

        try {
            await sendEmail({ 
                email: user.email, 
                subject: '🔐 Password Reset Verification', 
                message,      // Plain text
                html: htmlMessage // HTML version
            });
            res.json({ success: true, message: 'OTP sent to email' });
        } catch (error) {
            console.error("❌ Email Error:", error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Server Error' }); 
    }
};

// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or Expired OTP' });

        const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

        res.json({ success: true, message: 'OTP Verified' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        // Validation required to prevent crash
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Missing Data' });
        }

        const user = await User.findOne({ email, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Expired Session' });

        const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        
        res.json({ success: true, message: 'Password Reset Successful' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getProfile = async (req, res) => { res.json(req.user) };

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { name, phone, bio, location, role, avatar } = req.body;
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio) user.bio = bio;
        if (location) user.location = location;
        if (role) user.role = role;
        if (avatar) user.avatar = avatar;

        await user.save();
        res.json({ success: true, message: "Profile updated", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // We'll store settings in a flexible way. 
        // If User model doesn't have settings field, we might need to add it or use an 'extra' field.
        // I'll add 'settings' to User model in the next step.
        user.settings = { ...user.settings, ...req.body };
        await user.save();

        res.json({ success: true, message: "Settings saved", settings: user.settings });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const changePassword = async (req, res) => {
    // Basic implementation: in a real app, verify old password first
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @route GET /api/auth/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @route DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own superadmin account" });
        }

        await user.deleteOne();
        res.json({ success: true, message: "User removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @route PUT /api/auth/users/:id/role
const updateAnyUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['customer', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = role;
        await user.save();

        res.json({ success: true, message: "User role updated", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const resetData = async (req, res) => {
    try {
        const userId = req.user._id;

        await Product.deleteMany({ createdBy: userId });
        await Order.deleteMany({ user: userId });
        await Invoice.deleteMany({ createdBy: userId });
        await Supplier.deleteMany({ createdBy: userId });
        await SupplierLot.deleteMany({ createdBy: userId });
        await Notification.deleteMany({ user: userId });
        await User.deleteMany({ role: 'customer', createdBy: userId });

        res.status(200).json({
            success: true,
            message: 'All your data has been successfully reset to 0.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @route PUT /api/auth/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent blocking yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot block your own superadmin account" });
        }

        user.status = status;
        await user.save();

        res.json({ success: true, message: `User status updated to ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    signup, login, updateUserRole, forgotPassword, verifyOTP, resetPassword, getProfile, updateProfile, updateSettings, changePassword, resetData,
    getAllUsers, deleteUser, updateAnyUserRole, updateUserStatus
};
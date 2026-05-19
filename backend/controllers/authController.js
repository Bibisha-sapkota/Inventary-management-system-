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
const { createNotificationInternal, notifySuperadmins } = require('./notificationController');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (role === 'admin' || role === 'superadmin') {
            return res.status(403).json({ message: 'Admin accounts can only be created by Superadmin.' });
        }

        if (role !== 'customer') {
            return res.status(400).json({ message: 'Invalid role selection.' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
        if (!password || !passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'customer',
            status: 'active'
        });

        // Generate OTP for login
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpSalt = await bcrypt.genSalt(10);
        user.loginOtp = await bcrypt.hash(otp, otpSalt);
        user.loginOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Your Registration OTP',
            message: `Your OTP for completing registration and login is: ${otp}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #00966D; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Welcome to Stock Inventory</h1>
                    </div>
                    <div style="padding: 30px; color: #475569; text-align: center;">
                        <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                        <p style="font-size: 15px;">Use the OTP below to complete your registration and login.</p>
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #00966D;">
                            ${otp}
                        </div>
                    </div>
                </div>
            `
        });

        const sessionToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.status(201).json({ requiresOtp: true, sessionToken, message: "OTP sent to your email" });
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
        
        // Allow customer logins even if they were not created by a superadmin.
        // Only admin accounts without a creator are blocked.
        if (user.role !== 'customer' && user.role !== 'superadmin' && !user.createdBy) {
            return res.status(403).json({ message: 'Your account was not created by a Superadmin. Please contact support for access.' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'You are blocked by superadmin' });
        }
        if (!user.password) {
            return res.status(400).json({ message: 'This account was created via Google and has no manual password. Please use "Continue with Google" or reset your password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            if (user.role === 'customer') {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const salt = await bcrypt.genSalt(10);
                user.loginOtp = await bcrypt.hash(otp, salt);
                user.loginOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min
                await user.save();

                await sendEmail({
                    email: user.email,
                    subject: 'Your Login OTP',
                    message: `Your OTP for login is: ${otp}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                            <div style="background-color: #00966D; padding: 30px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 24px;">Login Verification</h1>
                            </div>
                            <div style="padding: 30px; color: #475569; text-align: center;">
                                <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                                <p style="font-size: 15px;">Use the OTP below to complete your login.</p>
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #00966D;">
                                    ${otp}
                                </div>
                                <p style="font-size: 12px; color: #94a3b8;">This OTP is valid for 10 minutes.</p>
                            </div>
                        </div>
                    `
                });

                const sessionToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
                return res.json({ requiresOtp: true, sessionToken, message: "OTP sent to your email" });
            }

            // Send Welcome Email for Admin/Superadmin
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

const verifyLoginOTP = async (req, res) => {
    const { sessionToken, otp } = req.body;
    try {
        if (!sessionToken || !otp) return res.status(400).json({ message: 'Missing session or OTP' });

        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
        const email = decoded.email;

        const user = await User.findOne({ email, loginOtpExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const isMatch = await bcrypt.compare(otp, user.loginOtp);
        if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

        user.loginOtp = undefined;
        user.loginOtpExpire = undefined;
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const googleSignupComplete = async (req, res) => {
    try {
        const { tempToken, role } = req.body;
        if (!tempToken || !role) return res.status(400).json({ message: "Missing data" });

        if (role === 'admin' || role === 'superadmin') {
            return res.status(403).json({ message: "Admin accounts can only be created by the Superadmin. Please contact your supervisor." });
        }

        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        
        let user = await User.findOne({ email: decoded.email });
        if (!user) {
            user = await User.create({
                name: decoded.name,
                email: decoded.email,
                role: 'customer',
                isGoogleUser: true,
                googleId: decoded.googleId,
                avatar: decoded.avatar,
                status: 'active'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        user.loginOtp = await bcrypt.hash(otp, salt);
        user.loginOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Your Login OTP',
            message: `Your OTP for login is: ${otp}`
        });

        const sessionToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ requiresOtp: true, sessionToken, message: "OTP sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Session expired or invalid. Please try Google Login again." });
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
        res.json({ success: true, message: "Profile role updated", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        user.resetPasswordToken = await bcrypt.hash(otp, salt);
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            message: `Your OTP for password reset is: ${otp}`
        });

        res.json({ success: true, message: 'OTP sent to email' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

        res.json({ success: true, message: 'OTP verified' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
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

        user.settings = { ...user.settings, ...req.body };
        await user.save();

        res.json({ success: true, message: "Settings saved", settings: user.settings });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const changePassword = async (req, res) => {
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

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Notify Superadmins about role change
        await notifySuperadmins(
            'User Role Modified',
            `User ${user.name} has been promoted/changed from ${oldRole} to ${role} by ${req.user.name}.`,
            'warning',
            'system'
        );

        res.json({ success: true, message: "User role updated", user });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

const resetData = async (req, res) => {
    try {
        const userId = req.user._id;
        const isSuperadmin = req.user.role === 'superadmin';

        if (isSuperadmin) {
            await Product.deleteMany({});
            await Order.deleteMany({});
            await Invoice.deleteMany({});
            await Supplier.deleteMany({});
            await SupplierLot.deleteMany({});
            await Notification.deleteMany({});
            await User.deleteMany({ role: 'customer' });
        } else {
            await Product.deleteMany({ createdBy: userId });
            await Order.deleteMany({ user: userId });
            await Invoice.deleteMany({ createdBy: userId });
            await Supplier.deleteMany({ createdBy: userId });
            await SupplierLot.deleteMany({ createdBy: userId });
            await Notification.deleteMany({ user: userId });
            await User.deleteMany({ role: 'customer', createdBy: userId });
        }

        res.status(200).json({
            success: true,
            message: isSuperadmin 
                ? 'All system data has been successfully reset to 0.' 
                : 'All your data has been successfully reset to 0.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

// @route POST /api/auth/users
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Please add all fields' });

        const userExists = await User.findOne({ email });
        if (userExists) {
            // If the user exists but has no creator, allow the Superadmin to "claim" them
            if (userExists.role !== 'superadmin' && !userExists.createdBy) {
                const salt = await bcrypt.genSalt(10);
                userExists.password = await bcrypt.hash(password, salt);
                userExists.name = name;
                userExists.phone = phone || userExists.phone;
                userExists.role = role || 'admin';
                userExists.createdBy = req.user._id;
                userExists.status = 'active';
                await userExists.save();

                return res.status(200).json({
                    success: true,
                    message: `${userExists.role.charAt(0).toUpperCase() + userExists.role.slice(1)} account reclaimed and updated successfully`,
                    data: userExists
                });
            }
            return res.status(400).json({ message: 'User already exists and is already managed' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'admin',
            phone: phone || '',
            createdBy: req.user._id,
            status: 'active'
        });

        if (user) {
            await notifySuperadmins(
                'New Internal User Created',
                `Superadmin ${req.user.name} manually created a new ${user.role}: ${user.name} (${user.email}).`,
                'success',
                'system'
            );

            await createNotificationInternal(
                user._id,
                'Welcome to Stock Inventory',
                `Hi ${user.name}, your account has been created as an ${user.role} by the Superadmin.`,
                'success',
                'system'
            );

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Welcome to Stock Inventory - Account Created',
                    message: `Hi ${user.name}, your account has been created by the Superadmin. Role: ${user.role}. Password: ${password}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                            <div style="background-color: #4f46e5; padding: 30px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 24px;">Welcome to Stock Inventory!</h1>
                            </div>
                            <div style="padding: 30px; color: #475569;">
                                <p>Hello <strong>${user.name}</strong>,</p>
                                <p>Your account has been manually created by the Superadmin. You can now log in using the credentials below:</p>
                                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                                    <p style="margin: 0;"><strong>Email:</strong> ${user.email}</p>
                                    <p style="margin: 10px 0 0;"><strong>Password:</strong> ${password}</p>
                                    <p style="margin: 10px 0 0;"><strong>Role:</strong> ${user.role.toUpperCase()}</p>
                                </div>
                                <p>Please log in and change your password for security.</p>
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                                </div>
                            </div>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error('Email Error:', emailErr.message);
            }

            res.status(201).json({
                success: true,
                message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} created successfully`,
                data: user
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    signup, login, updateUserRole, forgotPassword, verifyOTP, resetPassword, getProfile, updateProfile, updateSettings, changePassword, resetData,
    getAllUsers, deleteUser, updateAnyUserRole, updateUserStatus, createUser, verifyLoginOTP, googleSignupComplete
};
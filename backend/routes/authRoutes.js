const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Mailer setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ---------------------- Signup ----------------------
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    // Generate OTP
    const otpCode = generateOTP();
    await OTP.create({ email, otp: otpCode });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP code is ${otpCode}. It expires in 5 minutes.`
    });

    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------- Verify OTP -------------------
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    await User.updateOne({ email }, { isVerified: true });
    await OTP.deleteOne({ _id: record._id });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------- Login ----------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP for login
    const otpCode = generateOTP();
    await OTP.create({ email, otp: otpCode });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Login OTP",
      text: `Your login OTP code is ${otpCode}. It expires in 5 minutes.`
    });

    res.json({ message: "OTP sent to email. Please verify to continue." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------- Login OTP Verify -------------------
router.post("/login-verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = await User.findOne({ email });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    await OTP.deleteOne({ _id: record._id });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------- Forget Password ----------------------
router.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otpCode = generateOTP();
    await OTP.create({ email, otp: otpCode });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Forget Password OTP",
      text: `Your OTP for resetting password is ${otpCode}. It expires in 5 minutes.`
    });

    res.json({ message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------- Reset Password -------------------
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await OTP.deleteOne({ _id: record._id });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------------- Google Login ----------------------
router.post("/google-login", async (req, res) => {
  const { tokenId } = req.body;
  try {
    const client = new google.auth.OAuth2();
    const ticket = await client.verifyIdToken({ idToken: tokenId });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({ name: payload.name, email: payload.email, googleId: payload.sub, isVerified: true });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Google login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
